# Linux CFS调度器触发机制详解

## 概述

CFS (Completely Fair Scheduler) 是Linux内核的默认调度器，基于虚拟时间(vruntime)实现公平调度。本文档详细分析CFS调度器的各种触发条件和抢占机制。

## 1. 调度器触发的主要场景

### 1.1 时钟中断触发调度

**触发路径：** `scheduler_tick() -> task_tick_fair() -> entity_tick() -> check_preempt_tick()`

```c
// kernel/sched/fair.c:4440
static void check_preempt_tick(struct cfs_rq *cfs_rq, struct sched_entity *curr)
{
    unsigned long ideal_runtime, delta_exec;
    struct sched_entity *se;
    s64 delta;

    // 计算理想运行时间
    ideal_runtime = sched_slice(cfs_rq, curr);
    // 计算实际运行时间
    delta_exec = curr->sum_exec_runtime - curr->prev_sum_exec_runtime;
    
    // 条件1：运行时间超过理想时间片
    if (delta_exec > ideal_runtime) {
        resched_curr(rq_of(cfs_rq));
        clear_buddies(cfs_rq, curr);
        return;
    }

    // 最小粒度保护，避免过度频繁切换
    if (delta_exec < sysctl_sched_min_granularity)
        return;

    se = __pick_first_entity(cfs_rq);
    delta = curr->vruntime - se->vruntime;

    if (delta < 0)
        return;

    // 条件2：虚拟时间差值过大
    if (delta > ideal_runtime)
        resched_curr(rq_of(cfs_rq));
}
```

**抢占条件：**
- **时间片用完**：当前任务执行时间超过分配的理想运行时间
- **虚拟时间失衡**：当前任务vruntime与红黑树最左节点vruntime差值过大
- **最小粒度保护**：即使满足抢占条件，运行时间小于1ms时不抢占

### 1.2 任务唤醒触发抢占

**触发路径：** `try_to_wake_up() -> ttwu_do_wakeup() -> check_preempt_curr() -> check_preempt_wakeup()`

```c
// kernel/sched/fair.c:7127
static void check_preempt_wakeup(struct rq *rq, struct task_struct *p, int wake_flags)
{
    struct task_struct *curr = rq->curr;
    struct sched_entity *se = &curr->se, *pse = &p->se;
    struct cfs_rq *cfs_rq = task_cfs_rq(curr);

    // 条件1：空闲任务被非空闲任务抢占
    if (unlikely(task_has_idle_policy(curr)) &&
        likely(!task_has_idle_policy(p)))
        goto preempt;

    // 条件2：批处理任务不抢占普通任务
    if (unlikely(p->policy != SCHED_NORMAL) || !sched_feat(WAKEUP_PREEMPTION))
        return;

    find_matching_se(&se, &pse);
    
    // 条件3：空闲组被非空闲组抢占
    if (se_is_idle(se) && !se_is_idle(pse))
        goto preempt;

    // 条件4：虚拟时间抢占判断
    update_curr(cfs_rq_of(se));
    if (wakeup_preempt_entity(se, pse) == 1) {
        set_next_buddy(pse);
        goto preempt;
    }
    return;

preempt:
    resched_curr(rq);
}
```

### 1.3 虚拟时间抢占核心算法

```c
// kernel/sched/fair.c:7075
static int wakeup_preempt_entity(struct sched_entity *curr, struct sched_entity *se)
{
    s64 gran, vdiff = curr->vruntime - se->vruntime;

    if (vdiff <= 0)
        return -1;  // 当前任务vruntime更小，不抢占

    gran = wakeup_gran(se);
    if (vdiff > gran)
        return 1;   // 差值超过阈值，触发抢占

    return 0;       // 不满足抢占条件
}
```

**抢占判断逻辑：**
- 新任务vruntime必须小于当前任务
- vruntime差值必须超过唤醒粒度(wakeup_gran)
- 防止因微小时间差导致频繁切换

## 2. 其他调度触发场景

### 2.1 任务主动让出CPU

#### a) sleep/wait系统调用
```c
// 任务进入睡眠状态
schedule()
  -> __schedule()
    -> deactivate_task()
      -> dequeue_task()
```

#### b) yield系统调用
```c
// kernel/sched/fair.c:7429
static void yield_task_fair(struct rq *rq)
{
    struct task_struct *curr = rq->curr;
    struct cfs_rq *cfs_rq = task_cfs_rq(curr);
    struct sched_entity *se = &curr->se;

    // 如果只有一个任务，yield无意义
    if (unlikely(rq->nr_running == 1))
        return;

    clear_buddies(cfs_rq, se);

    if (curr->policy != SCHED_BATCH) {
        update_rq_clock(rq);
        update_curr(cfs_rq);
    }

    set_skip_buddy(se);  // 标记为跳过的buddy
}
```

### 2.2 优先级变化触发抢占

```c
// kernel/sched/fair.c:11123
static void prio_changed_fair(struct rq *rq, struct task_struct *p, int oldprio)
{
    if (!task_on_rq_queued(p))
        return;

    if (rq->cfs.nr_running == 1)
        return;

    // 当前运行任务优先级降低时抢占
    if (task_current(rq, p)) {
        if (p->prio > oldprio)
            resched_curr(rq);
    } else
        check_preempt_curr(rq, p, 0);
}
```

### 2.3 任务fork时的抢占

```c
// kernel/sched/fair.c:11088
static void task_fork_fair(struct task_struct *p)
{
    // ...
    if (sysctl_sched_child_runs_first && curr && entity_before(curr, se)) {
        swap(curr->vruntime, se->vruntime);
        resched_curr(rq);  // 让子任务优先运行
    }
    // ...
}
```

## 3. 多核系统中的调度触发

### 3.1 scheduler_tick独立触发机制

```c
// kernel/time/tick-common.c:27
DEFINE_PER_CPU(struct tick_device, tick_cpu_device);

// kernel/time/tick-sched.c:39
static DEFINE_PER_CPU(struct tick_sched, tick_cpu_sched);
```

**重要特点：**
- 每个CPU有独立的时钟设备(`tick_device`)
- 各CPU的scheduler_tick**异步独立**触发，不同步
- 时钟偏移机制避免锁竞争和缓存抖动

### 3.2 时钟偏移优化

```c
// kernel/time/tick-sched.c:1446
void tick_setup_sched_timer(void)
{
    struct tick_sched *ts = this_cpu_ptr(&tick_cpu_sched);
    ktime_t now = ktime_get();
    
    // 添加随机偏移，避免所有CPU同时触发
    u64 offset = ktime_to_ns(tick_period) >> 6;
    offset = prandom_u32() % offset;
    
    hrtimer_start(&ts->sched_timer, 
                  ktime_add_ns(now, offset), 
                  HRTIMER_MODE_ABS_PINNED);
}
```

## 4. 任务组层次调度

### 4.1 层次遍历机制

```c
// include/linux/sched.h中定义的宏
#define for_each_sched_entity(se) \
    for (; se; se = se->parent)

// kernel/sched/fair.c:11063
static void task_tick_fair(struct rq *rq, struct task_struct *curr, int queued)
{
    struct cfs_rq *cfs_rq;
    struct sched_entity *se = &curr->se;

    // 从当前任务向上遍历到根任务组
    for_each_sched_entity(se) {
        cfs_rq = cfs_rq_of(se);
        entity_tick(cfs_rq, se, queued);
    }
    // ...
}
```

**层次传导机制：**
- 时钟中断时从底层向顶层逐级检查抢占条件
- 每一层都有独立的CFS红黑树和调度实体
- 抢占决策在各层独立进行，确保组间和组内公平性

### 4.2 组调度抢占示例

```
CPU时钟中断
    ↓
task_tick_fair()
    ↓
for_each_sched_entity() {
    entity_tick(cfs_rq_level_N, se_level_N)
        ↓
    check_preempt_tick(cfs_rq_level_N, se_level_N)
        ↓
    [抢占检查：时间片、vruntime差值]
        ↓
    resched_curr() // 如果满足抢占条件
}
```

## 5. 抢占标记与执行流程

### 5.1 抢占标记机制

```c
// kernel/sched/core.c:952
void resched_curr(struct rq *rq)
{
    struct task_struct *curr = rq->curr;
    int cpu = cpu_of(rq);

    if (test_tsk_need_resched(curr))
        return;

    if (cpu == smp_processor_id()) {
        set_tsk_need_resched(curr);        // 设置TIF_NEED_RESCHED标志
        set_preempt_need_resched();        // 设置preempt标志
        return;
    }

    // 跨CPU抢占，发送IPI中断
    if (set_nr_and_not_polling(curr))
        smp_send_reschedule(cpu);
}
```

### 5.2 实际调度执行时机

**中断返回路径：**
```
中断处理完成
    ↓
irq_exit()
    ↓
preempt_count_dec_and_test()
    ↓
__preempt_schedule() // 如果需要重新调度
    ↓
schedule()
```

**系统调用返回路径：**
```
系统调用完成
    ↓
syscall_exit_to_user_mode()
    ↓
exit_to_user_mode_prepare()
    ↓
schedule() // 如果TIF_NEED_RESCHED被设置
```

## 6. 关键参数与调优

### 6.1 重要调度参数

```bash
# 查看CFS调度参数
cat /proc/sys/kernel/sched_min_granularity_ns    # 最小调度粒度：1000000 (1ms)
cat /proc/sys/kernel/sched_latency_ns            # 调度延迟：6000000 (6ms)
cat /proc/sys/kernel/sched_wakeup_granularity_ns # 唤醒粒度：1000000 (1ms)
cat /proc/sys/kernel/sched_child_runs_first      # 子进程优先：0
```

### 6.2 参数影响说明

- **sched_min_granularity_ns**: 防止过度频繁切换的最小运行时间
- **sched_latency_ns**: 目标调度延迟，影响时间片计算
- **sched_wakeup_granularity_ns**: 唤醒抢占的最小vruntime差值
- **sched_child_runs_first**: 控制fork后子进程是否立即运行

## 7. 总结

CFS调度器的抢占机制基于以下核心原则：

1. **公平性保证**: 通过vruntime确保所有任务获得公平的CPU时间
2. **响应性平衡**: 在公平和响应性之间找到平衡点
3. **粒度控制**: 避免过度频繁的上下文切换
4. **层次支持**: 支持任务组的层次化调度管理

**主要触发条件总结：**
- 时钟中断周期性检查（时间片耗尽、vruntime失衡）
- 任务唤醒时的抢占检查（基于vruntime比较）
- 任务主动让出CPU（sleep、wait、yield）
- 优先级变化和任务状态变更
- 跨CPU的负载均衡和任务迁移

这种设计使得CFS能够在保证公平性的同时，维持良好的系统性能和用户体验。 