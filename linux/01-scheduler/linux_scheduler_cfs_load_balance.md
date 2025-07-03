# Linux CFS调度器多核负载均衡机制综述

## 概述

CFS (Completely Fair Scheduler) 调度器的负载均衡机制是Linux内核中最复杂的子系统之一，它在多核系统中实现任务的公平分配，确保CPU利用率最大化和系统性能优化。本文档详细分析CFS负载均衡的设计理念、核心算法和实现机制。

## 1. 负载均衡的设计理念

### 1.1 核心目标

```
基本公平性方程：
W_i,n/P_i == W_j,n/P_j for all i,j

其中：
- W_i,n: CPU i的第n次权重平均值
- P_i: CPU i的计算能力
```

CFS负载均衡追求在所有CPU之间实现相同的基本公平性，确保每个任务获得与其权重成比例的计算时间。

### 1.2 设计原则

```c
// kernel/sched/fair.c:7474
/**
 * The purpose of load-balancing is to achieve the same basic fairness the
 * per-CPU scheduler provides, namely provide a proportional amount of compute
 * time to each task.
 */
```

- **工作保守性 (Work Conserving)**: 避免CPU空闲而有任务等待
- **局部性优化**: 最小化任务迁移对缓存和NUMA局部性的影响
- **可扩展性**: 支持从双核到数千核的系统架构

## 2. 调度域层次结构

### 2.1 调度域架构

```
┌─────────────────────────────────────────┐
│              NUMA Domain                │  ← 最高层，跨NUMA节点
│  ┌───────────────┐  ┌───────────────┐   │
│  │  Package Dom  │  │  Package Dom  │   │  ← 物理封装级别
│  │ ┌───┐  ┌───┐  │  │ ┌───┐  ┌───┐  │   │
│  │ │SMT│  │SMT│  │  │ │SMT│  │SMT│  │   │
│  │ │Core│  │Core│  │  │ │Core│  │Core│  │   │
│  │ └───┘  └───┘  │  │ └───┘  └───┘  │   │
│  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────┘
```

### 2.2 调度域特性

```c
// include/linux/sched/topology.h:77
struct sched_domain {
    struct sched_domain __rcu *parent;     /* 上层域 */
    struct sched_domain __rcu *child;      /* 下层域 */
    struct sched_group *groups;            /* 均衡组 */
    unsigned long min_interval;           /* 最小均衡间隔 */
    unsigned long max_interval;           /* 最大均衡间隔 */
    unsigned int busy_factor;             /* 繁忙因子 */
    unsigned int imbalance_pct;           /* 不均衡阈值百分比 */
    int flags;                            /* 域标志 */
};
```

**关键标志位：**
- `SD_BALANCE_NEWIDLE`: 支持新空闲均衡
- `SD_BALANCE_EXEC`: 支持exec时均衡
- `SD_BALANCE_FORK`: 支持fork时均衡
- `SD_SHARE_CPUCAPACITY`: 共享CPU能力(SMT)
- `SD_NUMA`: NUMA域标识

## 3. 负载均衡触发机制

### 3.1 触发场景

```c
// kernel/sched/fair.c:10880
void trigger_load_balance(struct rq *rq)
{
    if (time_after_eq(jiffies, rq->next_balance))
        raise_softirq(SCHED_SOFTIRQ);
    
    nohz_balancer_kick(rq);
}
```

**主要触发点：**
1. **周期性均衡**: 调度器时钟触发
2. **新空闲均衡**: CPU变为空闲时
3. **唤醒均衡**: 任务唤醒时的CPU选择
4. **fork/exec均衡**: 进程创建和执行时
5. **NOHZ均衡**: 无时钟模式下的均衡

### 3.2 均衡间隔计算

```c
// kernel/sched/fair.c:10058
static inline unsigned long get_sd_balance_interval(struct sched_domain *sd, int cpu_busy)
{
    unsigned long interval = sd->balance_interval;
    
    if (cpu_busy)
        interval *= sd->busy_factor;    // 繁忙时增加间隔
    
    interval = msecs_to_jiffies(interval);
    
    return clamp(interval, 1UL, max_load_balance_interval);
}
```

## 4. 负载均衡核心算法

### 4.1 不均衡计算

```c
// 不均衡度量公式
imb_i,j = max{ avg(W/C), W_i/C_i } - min{ avg(W/C), W_j/C_j }

其中：
- W: 权重负载
- C: CPU容量
- i,j: 不同的CPU
```

### 4.2 组类型分类

```c
// kernel/sched/fair.c:7592
enum group_type {
    group_has_spare = 0,        /* 有空闲容量 */
    group_fully_busy,           /* 完全繁忙但无竞争 */
    group_misfit_task,          /* 任务不适合当前CPU */
    group_asym_packing,         /* 非对称封装优化 */
    group_imbalanced,           /* 亲和性约束导致不均衡 */
    group_overloaded            /* 过载状态 */
};
```

### 4.3 负载均衡主流程

```c
// kernel/sched/fair.c:9788
static int load_balance(int this_cpu, struct rq *this_rq,
                       struct sched_domain *sd, enum cpu_idle_type idle,
                       int *continue_balancing)
{
    struct sched_group *group;
    struct rq *busiest;
    
    // 1. 查找最繁忙的组
    group = find_busiest_group(&env);
    if (!group)
        goto out_balanced;
    
    // 2. 查找组内最繁忙的CPU
    busiest = find_busiest_queue(&env, group);
    if (!busiest)
        goto out_balanced;
    
    // 3. 尝试拉取任务
    ld_moved = detach_tasks(&env);
    if (ld_moved)
        attach_tasks(&env);
    
    // 4. 主动均衡（如果需要）
    if (!ld_moved && need_active_balance(&env)) {
        active_balance = 1;
        stop_one_cpu_nowait(cpu_of(busiest),
                           active_load_balance_cpu_stop, busiest,
                           &busiest->active_balance_work);
    }
    
    return ld_moved;
}
```

## 5. 任务迁移机制

### 5.1 任务选择条件

```c
// kernel/sched/fair.c:7784
int can_migrate_task(struct task_struct *p, struct lb_env *env)
{
    // 1. 检查CPU亲和性
    if (!cpumask_test_cpu(env->dst_cpu, p->cpus_ptr))
        return 0;
    
    // 2. 检查是否正在运行
    if (task_running(env->src_rq, p))
        return 0;
    
    // 3. 检查缓存热度
    if (task_hot(p, env) && !aggressive_migration_conditions)
        return 0;
    
    return 1;
}
```

### 5.2 缓存热度判断

```c
// kernel/sched/fair.c:7675
static int task_hot(struct task_struct *p, struct lb_env *env)
{
    s64 delta = rq_clock_task(env->src_rq) - p->se.exec_start;
    
    // SMT兄弟共享缓存，不考虑热度
    if (env->sd->flags & SD_SHARE_CPUCAPACITY)
        return 0;
    
    // 检查buddy候选
    if (sched_feat(CACHE_HOT_BUDDY) && is_buddy_candidate(p))
        return 1;
    
    return delta < (s64)sysctl_sched_migration_cost;
}
```

### 5.3 任务分离和附加

```c
// 任务分离过程
static void detach_task(struct task_struct *p, struct lb_env *env)
{
    deactivate_task(env->src_rq, p, DEQUEUE_NOCLOCK);
    set_task_cpu(p, env->dst_cpu);
}

// 任务附加过程
static void attach_task(struct rq *rq, struct task_struct *p)
{
    activate_task(rq, p, ENQUEUE_NOCLOCK);
    check_preempt_curr(rq, p, 0);
}
```

## 6. 特殊负载均衡场景

### 6.1 新空闲均衡 (NEWIDLE Balance)

```c
// kernel/sched/fair.c:10761
static int newidle_balance(struct rq *this_rq, struct rq_flags *rf)
{
    int this_cpu = this_rq->cpu;
    struct sched_domain *sd;
    int pulled_task = 0;
    u64 curr_cost = 0;
    
    // 检查是否有待处理的唤醒
    if (this_rq->ttwu_pending)
        return 0;
    
    // 遍历调度域进行均衡
    for_each_domain(this_cpu, sd) {
        if (this_rq->avg_idle < curr_cost + sd->max_newidle_lb_cost)
            break;
        
        if (sd->flags & SD_BALANCE_NEWIDLE) {
            pulled_task = load_balance(this_cpu, this_rq,
                                     sd, CPU_NEWLY_IDLE,
                                     &continue_balancing);
        }
        
        if (pulled_task || this_rq->nr_running > 0)
            break;
    }
    
    return pulled_task;
}
```

### 6.2 主动负载均衡

```c
// kernel/sched/fair.c:10101
static int active_load_balance_cpu_stop(void *data)
{
    struct rq *busiest_rq = data;
    int target_cpu = busiest_rq->push_cpu;
    struct rq *target_rq = cpu_rq(target_cpu);
    struct task_struct *p = NULL;
    
    // 查找可迁移的任务
    p = detach_one_task(&env);
    if (p) {
        schedstat_inc(sd->alb_pushed);
        sd->nr_balance_failed = 0;
    }
    
    // 附加到目标CPU
    if (p)
        attach_one_task(target_rq, p);
    
    return 0;
}
```

### 6.3 NOHZ负载均衡

```c
// kernel/sched/fair.c:10579
static void _nohz_idle_balance(struct rq *this_rq, unsigned int flags,
                              enum cpu_idle_type idle)
{
    // 为所有空闲CPU执行负载均衡
    for_each_cpu_wrap(balance_cpu, nohz.idle_cpus_mask, this_cpu+1) {
        if (!idle_cpu(balance_cpu))
            continue;
        
        rq = cpu_rq(balance_cpu);
        has_blocked_load |= update_nohz_stats(rq);
        
        // 执行均衡
        if (time_after_eq(jiffies, rq->next_balance)) {
            if (flags & NOHZ_BALANCE_KICK)
                rebalance_domains(rq, CPU_IDLE);
        }
    }
}
```

## 7. 组调度下的负载均衡

### 7.1 层次权重计算

```c
// CFS组调度权重计算复杂性
//                               s_k,i
// W_i,0 = \Sum_j \Prod_k w_k * -----
//                                S_k
// 其中：
// s_k,i = \Sum_j w_i,j,k  (组k在CPU i上的权重总和)
// S_k = \Sum_i s_k,i      (组k在所有CPU上的权重总和)
```

### 7.2 组负载计算

```c
// 组间负载均衡考虑：
// 1. 组权重分布
// 2. 层次结构传播
// 3. 全局权重归一化
```

## 8. NUMA感知的负载均衡

### 8.1 NUMA距离考量

```c
// NUMA域中的特殊处理：
if (sd->flags & SD_NUMA) {
    // 优先选择NUMA本地节点
    if (cpu_to_node(this_cpu) == p->numa_preferred_nid)
        return NULL;
    
    // 允许NUMA不均衡以保持局部性
    if (allow_numa_imbalance(local_sgs.sum_nr_running, sd->span_weight))
        return NULL;
}
```

### 8.2 内存局部性保护

```c
// 迁移时考虑内存访问代价
static int migrate_degrades_locality(struct task_struct *p, struct lb_env *env)
{
    struct numa_group *numa_group = rcu_dereference(p->numa_group);
    unsigned long src_weight, dst_weight;
    int src_nid, dst_nid, dist;
    
    if (!static_branch_likely(&sched_numa_balancing))
        return -1;
    
    // 计算NUMA迁移的局部性影响
    return compare_numa_locality(src_nid, dst_nid, p);
}
```

## 9. 性能优化机制

### 9.1 均衡成本控制

```c
// 控制均衡频率避免过度开销
sd->balance_interval *= 2;  // 失败时指数退避
interval = clamp(interval, 1UL, max_load_balance_interval);
```

### 9.2 任务迁移限制

```c
#define sched_nr_migrate_break  32  // 每次均衡最多迁移32个任务

// 避免过度迁移
if (env->loop > env->loop_break) {
    env->loop_break += sched_nr_migrate_break;
    env->flags |= LBF_NEED_BREAK;
    break;
}
```

### 9.3 亲和性优化

```c
// 利用CPU亲和性减少迁移
if (!cpumask_test_cpu(env->dst_cpu, p->cpus_ptr)) {
    env->flags |= LBF_SOME_PINNED;
    // 寻找其他可行的目标CPU
    find_alternative_target(env);
}
```

## 10. 调试和监控

### 10.1 统计信息

```c
// /proc/schedstat 提供的统计信息：
struct sched_domain_stats {
    unsigned int lb_count[CPU_MAX_IDLE_TYPES];      // 均衡尝试次数
    unsigned int lb_failed[CPU_MAX_IDLE_TYPES];     // 均衡失败次数
    unsigned int lb_balanced[CPU_MAX_IDLE_TYPES];   // 均衡成功次数
    unsigned int lb_imbalance[CPU_MAX_IDLE_TYPES];  // 不均衡量
    unsigned int alb_count;                         // 主动均衡次数
    unsigned int alb_pushed;                        // 主动推送成功次数
};
```

### 10.2 调试接口

```bash
# 启用调度域调试
echo 1 > /sys/kernel/debug/sched/verbose

# 查看负载均衡统计
cat /proc/schedstat

# 查看CPU运行队列状态
cat /proc/sched_debug
```

## 11. 总结

CFS负载均衡是一个多层次、多目标的复杂系统，它在以下方面取得了平衡：

1. **公平性 vs 性能**: 通过权重机制确保公平的同时最大化系统吞吐量
2. **局部性 vs 均衡**: 在保持缓存和NUMA局部性的前提下实现负载分布
3. **响应性 vs 开销**: 在低延迟响应和系统开销之间找到最佳平衡点
4. **可扩展性 vs 简单性**: 支持大规模系统的同时保持算法的可理解性

这种设计使得Linux能够在从嵌入式设备到大型服务器的各种硬件平台上都表现出色，成为了现代操作系统调度器设计的典范。

### 关键文件位置

- **核心实现**: `kernel/sched/fair.c`
- **调度域定义**: `include/linux/sched/topology.h`
- **调度器头文件**: `kernel/sched/sched.h`
- **CPU热插拔**: `kernel/sched/core.c`
- **NUMA均衡**: `kernel/sched/numa.c`

CFS负载均衡机制的深入理解对于系统调优、性能分析和内核开发都具有重要意义。 