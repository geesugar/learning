# Deadline调度器对CFS调度器的影响分析
## 是否会造成CFS调度饥饿？

## ⚠️ 核心问题回答

**是的，理论上Deadline任务可能导致CFS任务饥饿，但Linux内核有多层保护机制防止这种情况发生。**

---

## 1. 调度优先级层次

### 1.1 严格的优先级顺序

Linux内核按以下**严格的优先级顺序**选择调度类：

```c
// 调度类优先级 (从高到低)
1. stop_sched_class     // 停止任务 (最高优先级)
2. dl_sched_class       // Deadline调度 ← 比CFS优先级高！
3. rt_sched_class       // 实时调度
4. fair_sched_class     // CFS调度 ← 可能被饥饿
5. idle_sched_class     // 空闲调度
```

### 1.2 调度决策流程

```c
// kernel/sched/core.c - __schedule()
static void __schedule(bool preempt)
{
    struct rq *rq = cpu_rq(smp_processor_id());
    struct task_struct *prev, *next;
    
    // 🎯 按优先级顺序检查各调度类
    for_each_class(class) {
        next = class->pick_next_task(rq, prev, &rf);
        if (next) {
            // ⚠️ 一旦Deadline类有任务就直接选中，不再检查CFS
            break;
        }
    }
}
```

**关键问题**：如果 `dl_sched_class->pick_next_task()` 总是返回非NULL任务，那么永远不会执行到 `fair_sched_class->pick_next_task()`！

---

## 2. Deadline调度器的保护机制

### 2.1 带宽控制 (Bandwidth Control)

Deadline调度器使用**CBS (Constant Bandwidth Server)**算法确保任务不会无限占用CPU：

```c
// kernel/sched/deadline.c - update_curr_dl()
static void update_curr_dl(struct rq *rq)
{
    struct sched_dl_entity *dl_se = &curr->dl;
    u64 delta_exec, scaled_delta_exec;
    
    // 🎯 计算已执行时间
    delta_exec = now - curr->se.exec_start;
    
    // ⚠️ 扣除运行时间配额
    dl_se->runtime -= scaled_delta_exec;

throttle:
    // 🚫 配额耗尽时强制节流
    if (dl_runtime_exceeded(dl_se) || dl_se->dl_yielded) {
        dl_se->dl_throttled = 1;
        
        // 🔥 关键：将任务从运行队列移除
        __dequeue_task_dl(rq, curr, 0);
        
        // ⏰ 启动补充定时器，等待下个周期
        if (unlikely(is_dl_boosted(dl_se) || !start_dl_timer(curr)))
            enqueue_task_dl(rq, curr, ENQUEUE_REPLENISH);
            
        // 📢 触发重新调度，让其他调度类有机会运行
        if (!is_leftmost(curr, &rq->dl))
            resched_curr(rq);
    }
}
```

### 2.2 严格的准入控制 (Admission Control)

系统启动时和创建新Deadline任务时进行严格检查：

```c
// kernel/sched/deadline.c - sched_dl_overflow()
int sched_dl_overflow(struct task_struct *p, int policy,
                      const struct sched_attr *attr)
{
    u64 period = attr->sched_period ?: attr->sched_deadline;
    u64 runtime = attr->sched_runtime;
    u64 new_bw = dl_policy(policy) ? to_ratio(period, runtime) : 0;
    struct dl_bw *dl_b = dl_bw_of(cpu);
    
    // 🔍 检查带宽是否超限
    if (dl_policy(policy) && !task_has_dl_policy(p) &&
        !__dl_overflow(dl_b, cap, 0, new_bw)) {
        __dl_add(dl_b, new_bw, cpus);
        err = 0;  // ✅ 允许创建
    } else {
        err = -EBUSY;  // ❌ 拒绝创建，防止系统过载
    }
    
    return err;
}
```

**关键保护**：
```c
// 准入控制条件：所有Deadline任务的带宽总和必须 < 100%
static inline bool __dl_overflow(struct dl_bw *dl_b, unsigned long cap,
                                 u64 old_bw, u64 new_bw)
{
    return dl_b->bw != -1 &&
           cap_scale(dl_b->bw, cap) < dl_b->total_bw - old_bw + new_bw;
}
```

### 2.3 周期性配额补充

```c
// kernel/sched/deadline.c - dl_task_timer()
static enum hrtimer_restart dl_task_timer(struct hrtimer *timer)
{
    struct sched_dl_entity *dl_se = container_of(timer, struct sched_dl_entity, dl_timer);
    struct task_struct *p = dl_task_of(dl_se);
    struct rq *rq = task_rq(p);
    
    // ⏰ 定时器到期，补充运行时间配额
    if (dl_se->dl_throttled) {
        // 🔄 重新补充配额
        replenish_dl_entity(dl_se);
        
        // 📋 重新加入运行队列
        enqueue_task_dl(rq, p, ENQUEUE_REPLENISH);
    }
    
    return HRTIMER_NORESTART;
}
```

---

## 3. 实际运行情况分析

### 3.1 正常工作场景

```
时间轴示例 (Deadline任务: runtime=30ms, period=100ms)
|----30ms运行----|----70ms节流----|----30ms运行----|----70ms节流----|
0ms            30ms            100ms           130ms           200ms
                  ↑                              ↑
                CFS可运行                      CFS可运行
```

**关键点**：
- Deadline任务最多使用30%的CPU时间
- 剩余70%的时间可供CFS任务使用
- **不会造成完全饥饿**

### 3.2 异常情况处理

如果Deadline任务试图超出配额：

```c
// 在update_curr_dl()中的处理
if (dl_runtime_exceeded(dl_se)) {
    // 🚫 立即节流
    dl_se->dl_throttled = 1;
    
    // 📤 从运行队列移除
    __dequeue_task_dl(rq, curr, 0);
    
    // 🔔 通知调度器重新选择任务
    resched_curr(rq);
}
```

**结果**：即使Deadline任务行为异常，也会被强制节流，给CFS任务运行机会。

---

## 4. 极端情况分析

### 4.1 理论上的饥饿条件

CFS任务**可能**被饥饿的极端情况：

1. **多个高利用率Deadline任务**：
   ```
   任务1: runtime=40ms, period=100ms (40%利用率)
   任务2: runtime=35ms, period=100ms (35%利用率)
   任务3: runtime=20ms, period=100ms (20%利用率)
   总利用率: 95%
   ```

2. **时间错配**：如果这些任务的周期刚好错开，可能在某些时段占用接近100%的CPU。

3. **准入控制被绕过**：系统管理员强制设置或内核bug。

### 4.2 系统保护机制

即使在极端情况下，系统仍有保护：

```c
// 全局带宽限制检查
static inline int dl_bandwidth_enabled(void)
{
    return sysctl_sched_rt_runtime >= 0;  // 默认启用
}

// 默认配置：最大95%的CPU可分配给Deadline/RT任务
// 至少保留5%给CFS任务
```

### 4.3 与RT调度器的关系

有趣的是，Deadline和RT调度器**共享**带宽限制：

```c
// kernel/sched/deadline.c - update_curr_dl()
if (rt_bandwidth_enabled()) {
    struct rt_rq *rt_rq = &rq->rt;
    
    // 🔗 Deadline任务的运行时间也要算在RT配额内
    if (sched_rt_bandwidth_account(rt_rq))
        rt_rq->rt_time += delta_exec;
}
```

**含义**：Deadline任务会受到RT带宽限制的约束，进一步保护CFS任务。

---

## 5. 实际测试验证

### 5.1 创建测试场景

```bash
# 创建一个高利用率的Deadline任务
chrt -d --sched-runtime 90000000 --sched-deadline 100000000 --sched-period 100000000 0 ./deadline_task

# 同时运行CFS任务
nice -10 ./cfs_task &
```

### 5.2 监控工具

```bash
# 观察调度统计
watch -n 1 'cat /proc/schedstat'

# 观察CPU利用率分布
htop

# 查看Deadline任务状态
cat /proc/sched_debug | grep -A 10 dl_rq
```

### 5.3 预期结果

- Deadline任务应该被严格限制在90%的CPU使用率
- CFS任务应该能获得剩余的10%时间片
- 如果尝试创建总利用率>95%的Deadline任务，应该被拒绝

---

## 6. 配置参数调优

### 6.1 关键参数

```bash
# RT/DL调度器的最大带宽 (默认95%)
/proc/sys/kernel/sched_rt_runtime_us=950000  # 微秒
/proc/sys/kernel/sched_rt_period_us=1000000  # 微秒

# 计算：950000/1000000 = 95%
```

### 6.2 紧急情况处理

如果系统出现饥饿：

```bash
# 临时禁用RT/DL带宽限制 (危险操作!)
echo -1 > /proc/sys/kernel/sched_rt_runtime_us

# 恢复默认限制
echo 950000 > /proc/sys/kernel/sched_rt_runtime_us
```

---

## 7. 总结与建议

### 7.1 核心结论

| 情况 | CFS饥饿风险 | 保护机制 |
|------|-------------|----------|
| **正常使用** | ❌ **不会饥饿** | CBS算法 + 准入控制 |
| **高负载** | ⚠️ **可能延迟** | 至少保留5%给CFS |
| **异常情况** | ⚠️ **短暂影响** | 强制节流 + 带宽限制 |
| **恶意任务** | ❌ **不会饥饿** | 准入控制拒绝创建 |

### 7.2 最佳实践

1. **合理设计Deadline任务**：
   - 确保 `runtime/period` 比例合理
   - 避免创建过多高利用率任务
   - 预留足够的CPU给CFS任务

2. **系统监控**：
   - 定期检查 `/proc/sched_debug`
   - 监控CFS任务的响应时间
   - 观察系统整体负载分布

3. **紧急预案**：
   - 了解如何禁用RT/DL带宽限制
   - 准备任务优先级调整工具
   - 建立系统性能监控告警

### 7.3 理论vs实践

- **理论上**：Deadline调度确实优先级更高，可能导致饥饿
- **实践中**：多层保护机制确保CFS任务始终有运行机会
- **关键在于**：正确配置和合理使用Deadline调度器

**结论**：在正确配置的Linux系统中，Deadline任务**不会**完全饥饿CFS任务，但可能会影响CFS任务的响应性能。 