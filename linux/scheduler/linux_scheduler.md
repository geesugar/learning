# Linux 5.15 内核调度器详解

## 概述

Linux 5.15 内核实现了一个基于调度器类（Scheduling Classes）的层次化调度器架构。每个调度器类实现了特定的调度策略，以满足不同类型任务的需求。本文档详细介绍了 Linux 5.15 版本支持的各种调度器类、进程状态管理、CPU绑定机制、多核调度策略、中断处理机制及其实现。

## 中断处理机制与调度器的关系

### 硬件中断（Hardware Interrupts / Hard IRQ）

#### **概念**
硬件中断是由硬件设备产生的异步事件，用于通知内核需要处理的紧急事件。

#### **特点**
- **异步性**：随时可能发生，无法预测
- **高优先级**：中断当前正在执行的进程
- **原子性**：在处理过程中禁用同类中断
- **时间敏感**：必须快速处理，避免丢失后续中断

#### **硬件中断类型**
```c
/* 常见的硬件中断源 */
- 时钟中断（Timer Interrupt）      /* 系统定时器 */
- 键盘中断（Keyboard Interrupt）   /* 键盘输入 */
- 网卡中断（Network Interrupt）    /* 网络数据包到达 */
- 磁盘中断（Disk Interrupt）       /* 磁盘I/O完成 */
- 串口中断（Serial Interrupt）     /* 串口数据 */
```

### 中断处理的两个阶段

#### **上半部（Top Half / Hard IRQ Context）**

**目的**：快速响应硬件中断，完成紧急和时间敏感的处理。

**特点**：
```c
/* 上半部处理特点 */
- 运行在中断上下文（Interrupt Context）
- 禁用同类中断（Interrupt Disabled）
- 不能睡眠（Cannot Sleep）
- 不能被抢占（Non-preemptible）
- 执行时间要短（Fast Execution）
```

**主要任务**：
```c
irqreturn_t hardware_interrupt_handler(int irq, void *dev_id)
{
    /* 1. 确认中断（ACK）*/
    ack_interrupt(dev_id);
    
    /* 2. 读取硬件状态 */
    status = read_hardware_status(dev_id);
    
    /* 3. 快速数据处理 */
    if (status & URGENT_FLAG) {
        handle_urgent_data();
    }
    
    /* 4. 标记软中断待处理 */
    if (status & DATA_READY) {
        raise_softirq(NET_RX_SOFTIRQ);
    }
    
    /* 5. 返回处理结果 */
    return IRQ_HANDLED;
}
```

#### **下半部（Bottom Half / Soft IRQ Context）**

**目的**：处理中断的非紧急部分，可以被调度和抢占。

**实现机制**：
1. **软中断（Softirq）**
2. **任务队列（Tasklet）**
3. **工作队列（Work Queue）**

### 软中断（Softirq）机制

#### **软中断类型**
```c
enum
{
    HI_SOFTIRQ=0,        /* 高优先级任务队列 */
    TIMER_SOFTIRQ,       /* 定时器软中断 */
    NET_TX_SOFTIRQ,      /* 网络发送 */
    NET_RX_SOFTIRQ,      /* 网络接收 */
    BLOCK_SOFTIRQ,       /* 块设备 */
    IRQ_POLL_SOFTIRQ,    /* IRQ轮询 */
    TASKLET_SOFTIRQ,     /* 任务队列 */
    SCHED_SOFTIRQ,       /* 调度器软中断 */
    HRTIMER_SOFTIRQ,     /* 高精度定时器 */
    RCU_SOFTIRQ,         /* RCU回调 */
    NR_SOFTIRQS
};
```

#### **软中断特点**
```c
/* 软中断执行环境 */
- 运行在软中断上下文（Softirq Context）
- 可以被硬件中断抢占（Preemptible by Hard IRQ）
- 不能睡眠（Cannot Sleep）
- 可以并发执行（Can Run Concurrently）
- 同一类型软中断在同一CPU上串行执行
```

#### **软中断处理流程**
```c
asmlinkage __visible void __do_softirq(void)
{
    unsigned long pending;
    int max_restart = MAX_SOFTIRQ_RESTART;
    
    /* 获取待处理的软中断 */
    pending = local_softirq_pending();
    
    /* 设置软中断上下文 */
    __local_bh_disable_ip(_RET_IP_, SOFTIRQ_OFFSET);
    
    /* 处理每个待处理的软中断 */
    while (pending) {
        unsigned int nr = __ffs(pending);
        unsigned int vec_nr = nr;
        int prev_count = preempt_count();
        
        /* 执行软中断处理函数 */
        softirq_vec[nr].action(&softirq_vec[nr]);
        
        /* 清除已处理的软中断位 */
        pending >>= softirq_bit + 1;
    }
    
    /* 恢复软中断上下文 */
    __local_bh_enable(SOFTIRQ_OFFSET);
}
```

### 调度器相关的软中断

#### **SCHED_SOFTIRQ**
```c
/* 调度器软中断的作用 */
static void run_rebalance_domains(struct softirq_action *h)
{
    struct rq *rq = this_rq();
    enum cpu_idle_type idle = rq->idle_balance ?
        CPU_IDLE : CPU_NOT_IDLE;
    
    /* 触发负载均衡 */
    rebalance_domains(smp_processor_id(), idle);
}

/* 在时钟中断中触发调度软中断 */
void scheduler_tick(void)
{
    // ... 调度器时钟处理 ...
    
    /* 触发负载均衡软中断 */
    if (time_after_eq(jiffies, rq->next_balance))
        raise_softirq(SCHED_SOFTIRQ);
}
```

### 信号（Signal）机制

#### **信号概念**
信号是Unix/Linux系统中进程间通信的一种机制，用于通知进程特定事件的发生。

#### **信号与中断的区别**
```c
/* 硬件中断 vs 信号 */
硬件中断:
- 来源：硬件设备
- 目标：内核
- 上下文：中断上下文
- 处理：立即处理

信号:
- 来源：内核或其他进程
- 目标：用户进程
- 上下文：进程上下文
- 处理：异步处理
```

#### **信号处理与进程状态**
```c
/* 信号对进程状态的影响 */
static inline int signal_pending_state(unsigned int state, struct task_struct *p)
{
    /* TASK_UNINTERRUPTIBLE状态不响应普通信号 */
    if (!(state & (TASK_INTERRUPTIBLE | TASK_WAKEKILL)))
        return 0;
        
    if (!signal_pending(p))
        return 0;

    /* TASK_INTERRUPTIBLE状态响应所有信号 */
    /* TASK_WAKEKILL状态只响应致命信号 */
    return (state & TASK_INTERRUPTIBLE) || __fatal_signal_pending(p);
}
```

#### **信号在调度中的作用**
```c
/* 信号检查与调度 */
static void __sched notrace __schedule(bool preempt)
{
    struct task_struct *prev, *next;
    
    prev = current;
    
    /* 在调度前检查信号 */
    if (signal_pending_state(prev->__state, prev)) {
        prev->__state = TASK_RUNNING;
    }
    
    // ... 选择下一个进程 ...
}
```

### 中断、软中断与调度器的交互关系

#### **时钟中断驱动调度**
```c
/* 时钟中断触发调度检查 */
void scheduler_tick(void)
{
    struct task_struct *curr = rq->curr;
    struct sched_entity *se = &curr->se;
    
    /* 更新进程运行时间 */
    update_runtime_statistics(se);
    
    /* 检查是否需要抢占 */
    curr->sched_class->task_tick(rq, curr, 0);
    
    /* 触发负载均衡 */
    trigger_load_balance(rq);
}
```

#### **中断上下文中的调度限制**
```c
/* 中断上下文检查 */
#define in_interrupt()    (irq_count())
#define in_hardirq()      (hardirq_count())
#define in_softirq()      (softirq_count())

/* 中断上下文中不能调度 */
static inline void might_sleep(void)
{
    if (in_atomic() || irqs_disabled() || in_interrupt()) {
        /* 在中断上下文中不能睡眠/调度 */
        WARN_ON(1);
    }
}
```

#### **软中断与进程调度的协调**
```c
/* 软中断处理完成后检查调度 */
void irq_exit(void)
{
    /* 减少硬中断计数 */
    __irq_exit_rcu();
    
    /* 如果不在中断嵌套中 */
    if (!in_interrupt()) {
        /* 处理待处理的软中断 */
        invoke_softirq();
        
        /* 检查是否需要调度 */
        if (need_resched())
            schedule();
    }
}
```

## 调度器类架构

### 基础结构

Linux 内核中的调度器类通过 `struct sched_class` 结构定义，该结构包含了一系列函数指针，定义了调度器的核心操作：

```c
struct sched_class {
    void (*enqueue_task) (struct rq *rq, struct task_struct *p, int flags);
    void (*dequeue_task) (struct rq *rq, struct task_struct *p, int flags);
    void (*yield_task)   (struct rq *rq);
    bool (*yield_to_task)(struct rq *rq, struct task_struct *p);

    void (*check_preempt_curr)(struct rq *rq, struct task_struct *p, int flags);
    struct task_struct *(*pick_next_task)(struct rq *rq);
    void (*put_prev_task)(struct rq *rq, struct task_struct *p);
    void (*set_next_task)(struct rq *rq, struct task_struct *p, bool first);

    void (*task_tick)(struct rq *rq, struct task_struct *p, int queued);
    void (*task_fork)(struct task_struct *p);
    void (*task_dead)(struct task_struct *p);
    
    // ... 更多方法
};
```

### 调度器类层次结构

Linux 5.15 内核按优先级顺序支持以下调度器类：

1. **Stop 调度器类** (`stop_sched_class`) - 最高优先级
2. **Deadline 调度器类** (`dl_sched_class`) - 实时截止时间调度
3. **RT 调度器类** (`rt_sched_class`) - 实时调度
4. **CFS 调度器类** (`fair_sched_class`) - 完全公平调度
5. **Idle 调度器类** (`idle_sched_class`) - 最低优先级

## 进程状态管理

### 进程状态定义

Linux内核定义了多种进程状态来跟踪任务的执行状态：

```c
/* 基本运行状态 */
#define TASK_RUNNING            0x0000    /* 正在运行或准备运行 */
#define TASK_INTERRUPTIBLE      0x0001    /* 可中断睡眠 */
#define TASK_UNINTERRUPTIBLE    0x0002    /* 不可中断睡眠 */
#define __TASK_STOPPED          0x0004    /* 任务被停止 */
#define __TASK_TRACED           0x0008    /* 任务被跟踪 */

/* 特殊状态 */
#define TASK_PARKED             0x0040    /* 任务被挂起 */
#define TASK_DEAD               0x0080    /* 任务已死亡 */
#define TASK_WAKEKILL           0x0100    /* 可被信号唤醒 */
#define TASK_WAKING             0x0200    /* 正在唤醒 */
#define TASK_NOLOAD             0x0400    /* 不计入负载 */
#define TASK_NEW                0x0800    /* 新创建的任务 */
#define TASK_RTLOCK_WAIT        0x1000    /* RT锁等待状态 */

/* 退出状态 */
#define EXIT_DEAD               0x0010    /* 进程已死亡 */
#define EXIT_ZOMBIE             0x0020    /* 僵尸进程 */
```

### 进程状态转换

进程状态转换遵循以下规则：

#### **TASK_RUNNING (运行状态)**
- 进程正在CPU上执行或在运行队列中等待执行
- 只有此状态的进程才能被调度器选中运行
- 通过 `wake_up_process()` 将睡眠进程转换为运行状态

#### **TASK_INTERRUPTIBLE (可中断睡眠)**
- 进程在等待某个条件或事件
- 可被信号中断唤醒
- 常用于I/O等待、锁等待等场景

#### **TASK_UNINTERRUPTIBLE (不可中断睡眠)**
- 进程在等待硬件条件，不能被信号中断
- 通常用于关键的I/O操作
- 过多的D状态进程可能指示系统问题

#### **状态转换示例**
```c
/* 设置进程为可中断睡眠状态 */
set_current_state(TASK_INTERRUPTIBLE);
schedule();  /* 让出CPU */

/* 唤醒进程 */
if (condition)
    wake_up_process(task);
```

### 状态查询接口

内核提供了多种状态查询宏：

```c
#define task_is_running(task)     (read_once((task)->__state) == TASK_RUNNING)
#define task_is_traced(task)      ((task->__state & __TASK_TRACED) != 0)
#define task_is_stopped(task)     ((task->__state & __TASK_STOPPED) != 0)
```

## CPU绑定机制 (CPU Affinity)

### 基本概念

CPU绑定（CPU Affinity）允许将进程或线程限制在特定的CPU核心上运行，这对于性能优化和实时系统非常重要。

### 数据结构

每个进程都有一个CPU亲和性掩码：

```c
struct task_struct {
    // ...
    cpumask_t           *cpus_ptr;     /* CPU亲和性掩码 */
    cpumask_t           cpus_mask;     /* 静态CPU掩码 */
    // ...
};
```

### 绑核对调度的影响

#### **任务迁移检查**
在负载均衡过程中，调度器会检查CPU亲和性：

```c
int can_migrate_task(struct task_struct *p, struct lb_env *env)
{
    /* 检查目标CPU是否在允许的CPU掩码中 */
    if (!cpumask_test_cpu(env->dst_cpu, p->cpus_ptr)) {
        schedstat_inc(p->se.statistics.nr_failed_migrations_affine);
        return 0;  /* 禁止迁移 */
    }
    
    /* 其他迁移条件检查... */
    return 1;  /* 允许迁移 */
}
```

#### **CPU选择过程**
在任务唤醒时考虑CPU亲和性：

```c
static int select_idle_sibling(struct task_struct *p, int prev, int target)
{
    /* 检查目标CPU是否可用且在亲和性掩码中 */
    if ((available_idle_cpu(target) || sched_idle_cpu(target)) &&
        cpumask_test_cpu(target, p->cpus_ptr))
        return target;
        
    /* 检查之前的CPU */
    if (prev != target && cpus_share_cache(prev, target) &&
        (available_idle_cpu(prev) || sched_idle_cpu(prev)) &&
        cpumask_test_cpu(prev, p->cpus_ptr))
        return prev;
        
    /* 在允许的CPU范围内查找空闲CPU */
    // ...
}
```

### 绑核策略

#### **完全绑定**
```bash
# 将进程绑定到CPU 0
taskset -c 0 ./my_program
# 或者
taskset -p 0x1 <pid>
```

#### **部分绑定**
```bash
# 将进程绑定到CPU 0-3
taskset -c 0-3 ./my_program
# 或者使用位掩码
taskset -p 0xF <pid>
```

#### **NUMA感知绑定**
```bash
# 绑定到NUMA节点0
numactl --cpunodebind=0 ./my_program
# 绑定到特定NUMA节点的内存
numactl --membind=0 ./my_program
```

### 绑核的性能影响

#### **优势**
- **Cache亲和性**：减少跨CPU的Cache miss
- **NUMA局部性**：避免跨NUMA节点的内存访问
- **可预测性**：实时应用的延迟更可控
- **避免迁移开销**：减少任务迁移的上下文切换成本

#### **劣势**
- **负载不均**：可能导致某些CPU过载
- **资源浪费**：空闲CPU无法被充分利用
- **吞吐量下降**：系统整体并行度受限

## 多核CPU调度详解

### 调度域架构 (Scheduling Domains)

Linux使用层次化的调度域来组织多核CPU：

#### **调度域层次**
1. **SMT域** - 超线程核心
2. **MC域** - 多核处理器
3. **NUMA域** - NUMA节点
4. **机器域** - 整个系统

#### **调度域属性**
```c
struct sched_domain {
    struct sched_domain *parent;    /* 上层调度域 */
    struct sched_domain *child;     /* 下层调度域 */
    struct sched_group *groups;     /* 调度组 */
    
    unsigned long min_interval;     /* 最小负载均衡间隔 */
    unsigned long max_interval;     /* 最大负载均衡间隔 */
    unsigned int busy_factor;       /* 繁忙因子 */
    unsigned int imbalance_pct;     /* 失衡百分比 */
    
    unsigned int flags;             /* 调度域标志 */
#define SD_LOAD_BALANCE    0x0001   /* 进行负载均衡 */
#define SD_BALANCE_NEWIDLE 0x0002   /* 空闲时负载均衡 */
#define SD_BALANCE_EXEC    0x0004   /* exec时负载均衡 */
#define SD_BALANCE_FORK    0x0008   /* fork时负载均衡 */
#define SD_BALANCE_WAKE    0x0010   /* 唤醒时负载均衡 */
#define SD_WAKE_AFFINE     0x0020   /* 唤醒亲和性 */
#define SD_SHARE_CPUCAPACITY 0x0080 /* 共享CPU容量 */
#define SD_SHARE_PKG_RESOURCES 0x0200 /* 共享包资源 */
#define SD_SERIALIZE       0x0400   /* 串行化负载均衡 */
#define SD_ASYM_PACKING    0x0800   /* 非对称打包 */
#define SD_PREFER_SIBLING  0x1000   /* 优先兄弟核心 */
#define SD_OVERLAP         0x2000   /* 调度域重叠 */
#define SD_NUMA            0x4000   /* NUMA调度域 */
};
```

### 负载均衡机制

#### **负载均衡触发条件**
1. **周期性负载均衡**：定时触发的负载均衡
2. **空闲负载均衡**：CPU空闲时主动拉取任务
3. **唤醒负载均衡**：任务唤醒时选择合适的CPU
4. **exec/fork负载均衡**：进程创建时的CPU选择

#### **负载均衡算法**
```c
static int load_balance(int this_cpu, struct rq *this_rq,
                       struct sched_domain *sd, enum cpu_idle_type idle)
{
    struct sched_group *group;
    struct rq *busiest;
    struct lb_env env = {
        .sd            = sd,
        .dst_cpu       = this_cpu,
        .dst_rq        = this_rq,
        .idle          = idle,
        .cpus          = cpus,
    };
    
    /* 1. 找到最繁忙的调度组 */
    group = find_busiest_group(&env);
    if (!group)
        goto out_balanced;
    
    /* 2. 找到最繁忙的运行队列 */
    busiest = find_busiest_queue(&env, group);
    if (!busiest)
        goto out_balanced;
    
    /* 3. 迁移任务 */
    if (detach_tasks(&env)) {
        attach_tasks(&env);
        // ...
    }
    
    return 1;
}
```

### 空闲CPU选择策略

#### **select_idle_sibling流程**
```c
static int select_idle_sibling(struct task_struct *p, int prev, int target)
{
    /* 1. 检查目标CPU */
    if ((available_idle_cpu(target) || sched_idle_cpu(target)) &&
        asym_fits_capacity(task_util, target))
        return target;
    
    /* 2. 检查之前的CPU（Cache亲和性） */
    if (prev != target && cpus_share_cache(prev, target) &&
        (available_idle_cpu(prev) || sched_idle_cpu(prev)))
        return prev;
    
    /* 3. 检查最近使用的CPU */
    recent_used_cpu = p->recent_used_cpu;
    if (recent_used_cpu != prev && recent_used_cpu != target &&
        cpus_share_cache(recent_used_cpu, target) &&
        available_idle_cpu(recent_used_cpu))
        return recent_used_cpu;
    
    /* 4. 在LLC域中搜索空闲CPU */
    sd = rcu_dereference(per_cpu(sd_llc, target));
    if (sd) {
        /* SMT感知搜索 */
        if (sched_smt_active()) {
            has_idle_core = test_idle_cores(target, false);
            if (has_idle_core) {
                /* 优先选择空闲核心 */
                i = select_idle_core(p, cpu, cpus, &idle_cpu);
                if (i >= 0) return i;
            }
        }
        
        /* 在LLC域中查找空闲CPU */
        i = select_idle_cpu(p, sd, has_idle_core, target);
        if (i >= 0) return i;
    }
    
    return target;
}
```

#### **SMT (超线程) 感知调度**
```c
static int select_idle_core(struct task_struct *p, int core, 
                           struct cpumask *cpus, int *idle_cpu)
{
    bool idle = true;
    int cpu;
    
    /* 检查整个核心是否空闲 */
    for_each_cpu(cpu, cpu_smt_mask(core)) {
        if (!available_idle_cpu(cpu)) {
            idle = false;
            /* 记录SCHED_IDLE的CPU */
            if (*idle_cpu == -1 && sched_idle_cpu(cpu) && 
                cpumask_test_cpu(cpu, p->cpus_ptr)) {
                *idle_cpu = cpu;
                break;
            }
            break;
        }
        /* 记录第一个可用的空闲CPU */
        if (*idle_cpu == -1 && cpumask_test_cpu(cpu, p->cpus_ptr))
            *idle_cpu = cpu;
    }
    
    if (idle)
        return core;  /* 整个核心空闲 */
    
    /* 从搜索掩码中移除这个核心 */
    cpumask_andnot(cpus, cpus, cpu_smt_mask(core));
    return -1;
}
```

### NUMA感知调度

#### **NUMA均衡器**
```c
static void task_numa_placement(struct task_struct *p)
{
    int seq, nid, max_nid = -1;
    unsigned long max_faults = 0;
    unsigned long fault_types[2] = { 0, 0 };
    unsigned long total_faults;
    u64 runtime, period;
    
    /* 分析NUMA访问模式 */
    for_each_online_node(nid) {
        /* 计算节点的错误页面访问次数 */
        unsigned long faults = 0, group_faults = 0;
        
        faults += task_faults(p, nid);
        group_faults += group_faults(p, nid);
        
        if (faults > max_faults) {
            max_faults = faults;
            max_nid = nid;
        }
    }
    
    /* 设置首选NUMA节点 */
    if (max_nid != p->numa_preferred_nid) {
        p->numa_preferred_nid = max_nid;
        p->numa_migrate_retry = 0;
    }
}
```

#### **NUMA任务迁移**
```c
static int task_numa_migrate(struct task_struct *p)
{
    struct task_numa_env env = {
        .p = p,
        .src_cpu = task_cpu(p),
        .src_nid = cpu_to_node(task_cpu(p)),
        .imbalance_pct = 112,
        .best_cpu = -1,
        .best_imp = 0,
    };
    
    /* 评估所有NUMA节点 */
    for_each_online_node(nid) {
        if (nid == env.src_nid || !node_online(nid))
            continue;
            
        env.dst_nid = nid;
        task_numa_find_cpu(&env, taskimp, groupimp);
    }
    
    /* 执行迁移 */
    if (env.best_cpu != -1) {
        task_migrate(&env);
        return 1;
    }
    
    return 0;
}
```

## 各调度器类详解

### 1. Stop 调度器类 (Stop Scheduling Class)

#### 概述
Stop 调度器类是系统中优先级最高的调度器类，主要用于执行关键的系统维护任务，如 CPU 停机、负载均衡等。

#### 特点
- **最高优先级**：可以抢占系统中的任何其他任务
- **不可抢占**：Stop 任务不会被其他任务抢占
- **单一任务**：每个 CPU 只有一个 stop 任务
- **特殊用途**：主要用于系统维护和CPU管理

#### 实现细节
```c
// 文件位置：kernel/sched/stop_task.c
DEFINE_SCHED_CLASS(stop) = {
    .enqueue_task		= enqueue_task_stop,
    .dequeue_task		= dequeue_task_stop,
    .yield_task		= yield_task_stop,
    .check_preempt_curr	= check_preempt_curr_stop,
    .pick_next_task		= pick_next_task_stop,
    .put_prev_task		= put_prev_task_stop,
    .set_next_task      = set_next_task_stop,
    .task_tick		= task_tick_stop,
    .prio_changed		= prio_changed_stop,
    .switched_to		= switched_to_stop,
    .update_curr		= update_curr_stop,
};
```

#### 应用场景
- CPU热插拔操作
- 系统负载均衡
- 关键的内核维护任务

### 2. Deadline 调度器类 (Deadline Scheduling Class)

#### 概述
Deadline 调度器实现了 SCHED_DEADLINE 策略，基于截止时间进行调度，适用于硬实时系统。

#### 特点
- **截止时间驱动**：任务按照截止时间顺序执行
- **带宽控制**：通过 runtime/period 控制任务带宽
- **抢占机制**：较早截止时间的任务可以抢占当前任务
- **准入控制**：系统级带宽检查防止过载

#### 核心参数
- `sched_runtime`：任务在每个周期内的运行时间
- `sched_deadline`：任务的相对截止时间
- `sched_period`：任务的周期（默认等于 deadline）

#### 实现细节
```c
// 文件位置：kernel/sched/deadline.c
// 主要数据结构
struct sched_dl_entity {
    struct rb_node		rb_node;
    u64			dl_runtime;		/* 最大运行时间 */
    u64			dl_deadline;	/* 相对截止时间 */
    u64			dl_period;		/* 周期 */
    u64			dl_bw;			/* 带宽 */
    // ...
};
```

#### 调度算法
- **EDF (Earliest Deadline First)**：优先调度截止时间最早的任务
- **CBS (Constant Bandwidth Server)**：保证任务的带宽分配
- **全局EDF**：支持多核系统的全局最早截止时间调度

#### 应用场景
- 硬实时系统
- 多媒体应用
- 工业控制系统

### 3. RT 调度器类 (Real-Time Scheduling Class)

#### 概述
RT 调度器实现了传统的固定优先级实时调度，支持 SCHED_FIFO 和 SCHED_RR 策略。

#### 特点
- **固定优先级**：任务具有1-99的静态优先级
- **抢占调度**：高优先级任务可以抢占低优先级任务
- **两种策略**：FIFO（先进先出）和 RR（轮转）
- **带宽限制**：通过 rt_runtime_us/rt_period_us 控制RT任务带宽

#### 调度策略
1. **SCHED_FIFO**：
   - 任务运行直到主动让出CPU或被更高优先级任务抢占
   - 相同优先级任务不会相互抢占

2. **SCHED_RR**：
   - 在SCHED_FIFO基础上增加时间片轮转
   - 相同优先级任务会轮转执行

#### 实现细节
```c
// 文件位置：kernel/sched/rt.c
struct rt_rq {
    struct rt_prio_array	active;
    unsigned int		rt_nr_running;
    unsigned int		rr_nr_running;
    // 优先级位图和队列
    // 带宽控制相关字段
};
```

#### 数据结构
- **rt_prio_array**：优先级数组，每个优先级一个队列
- **位图**：快速查找非空队列
- **带宽控制**：防止RT任务占用过多CPU时间

#### 应用场景
- 软实时系统
- 音频/视频处理
- 系统守护进程

### 4. CFS 调度器类 (Completely Fair Scheduler)

#### 概述
CFS 是Linux的默认调度器，实现完全公平调度算法，适用于普通的交互式和批处理任务。

#### 特点
- **公平调度**：所有任务获得相等的CPU时间
- **虚拟运行时间**：使用vruntime实现公平性
- **红黑树**：高效的任务排序和选择
- **自适应**：根据负载自动调整时间片

#### 核心概念
1. **虚拟运行时间 (vruntime)**：
   - 任务的加权运行时间
   - 权重越高，vruntime增长越慢
   - 调度器选择vruntime最小的任务运行

2. **权重计算**：
   ```c
   // nice值到权重的映射
   static const int prio_to_weight[40] = {
       /* -20 */ 88761, 71755, 56483, 46273, 36291,
       /* -15 */ 29154, 23254, 18705, 14949, 11916,
       /* -10 */ 9548, 7620, 6100, 4904, 3906,
       /*  -5 */ 3121, 2501, 1991, 1586, 1277,
       /*   0 */ 1024, 820, 655, 526, 423,
       /*   5 */ 335, 272, 215, 172, 137,
       /*  10 */ 110, 87, 70, 56, 45,
       /*  15 */ 36, 29, 23, 18, 15,
   };
   ```

#### 实现细节
```c
// 文件位置：kernel/sched/fair.c
struct cfs_rq {
    struct load_weight	load;
    unsigned int		nr_running;
    u64			exec_clock;
    u64			min_vruntime;
    struct rb_root_cached	tasks_timeline; // 红黑树
    struct sched_entity	*curr;          // 当前运行任务
    struct sched_entity	*next;          // 下一个候选任务
    struct sched_entity	*last;          // 最后运行的任务
    struct sched_entity	*skip;          // 跳过的任务
};
```

#### 调度算法
1. **任务选择**：选择vruntime最小的任务
2. **时间片计算**：基于负载和权重动态计算
3. **抢占检查**：新任务的vruntime显著小于当前任务时触发抢占

#### 负载均衡
- **周期性负载均衡**：定期在CPU间迁移任务
- **空闲负载均衡**：CPU空闲时主动拉取任务
- **唤醒负载均衡**：任务唤醒时选择合适的CPU

#### 组调度
支持进程组的层次化调度：
- **task_group**：进程组抽象
- **shares**：组间权重分配
- **带宽控制**：限制组的CPU使用

#### 应用场景
- 桌面交互式应用
- 服务器工作负载
- 批处理任务

### 5. Idle 调度器类 (Idle Scheduling Class)

#### 概述
Idle 调度器是优先级最低的调度器类，只有在没有其他可运行任务时才会执行。

#### 特点
- **最低优先级**：只在CPU完全空闲时运行
- **能耗管理**：可以进入CPU的各种睡眠状态
- **特殊任务**：主要运行idle任务和SCHED_IDLE任务

#### 实现细节
```c
// 文件位置：kernel/sched/idle.c
DEFINE_SCHED_CLASS(idle) = {
    .dequeue_task		= dequeue_task_idle,
    .check_preempt_curr	= check_preempt_curr_idle,
    .pick_next_task		= pick_next_task_idle,
    .put_prev_task		= put_prev_task_idle,
    .set_next_task      = set_next_task_idle,
    .task_tick		= task_tick_idle,
    .prio_changed		= prio_changed_idle,
    .switched_to		= switched_to_idle,
    .update_curr		= update_curr_idle,
};
```

#### 功能
- **CPU空闲处理**：当没有其他任务时运行
- **电源管理**：调用cpuidle框架进入节能状态
- **系统监控**：可用于系统性能监控

#### 应用场景
- 系统空闲时的电源管理
- 低优先级的后台任务

## 调度器集成与交互

### 调度器选择机制
内核按以下顺序检查各调度器类：
1. Stop → 2. Deadline → 3. RT → 4. CFS → 5. Idle

### 任务切换流程
1. **抢占检查**：`check_preempt_curr()`
2. **任务选择**：`pick_next_task()`
3. **上下文切换**：`put_prev_task()` + `set_next_task()`
4. **时钟中断**：`task_tick()`

### 负载均衡
- **Pull模式**：空闲CPU主动拉取任务
- **Push模式**：过载CPU主动推送任务
- **周期性均衡**：定时触发的负载均衡

## 性能监控与调优

### 监控工具

#### **进程状态监控**
```bash
# 查看进程状态
ps aux
cat /proc/<pid>/stat
cat /proc/<pid>/status

# 实时监控
htop
top
```

#### **CPU绑定监控**
```bash
# 查看进程CPU亲和性
taskset -p <pid>

# 查看进程运行在哪个CPU
ps -eo pid,psr,comm

# 监控CPU负载分布
mpstat -P ALL 1
```

#### **调度器统计**
```bash
# 查看调度器统计信息
cat /proc/schedstat
cat /proc/<pid>/sched

# 查看运行队列信息
cat /proc/sched_debug
```

### 性能调优策略

#### **CPU绑定优化**
```bash
# 关键进程绑定到专用CPU
taskset -c 0-3 ./critical_app

# 中断绑定到特定CPU
echo 2 > /proc/irq/<irq_num>/smp_affinity

# 隔离CPU核心
# 在内核启动参数中添加：
# isolcpus=4-7 nohz_full=4-7 rcu_nocbs=4-7
```

#### **调度策略优化**
```bash
# 设置实时优先级
chrt -f 50 ./realtime_app

# 设置nice值
nice -n -10 ./high_priority_app

# 设置CPU调度域
echo 0 > /proc/sys/kernel/sched_domain/cpu0/domain0/imbalance_pct
```

#### **NUMA优化**
```bash
# NUMA绑定
numactl --cpunodebind=0 --membind=0 ./numa_app

# 查看NUMA拓扑
numactl --hardware
lscpu
```

## 性能优化

### SMP优化
- **CPU拓扑感知**：利用NUMA和缓存拓扑
- **任务亲和性**：减少任务迁移开销
- **负载均衡**：智能的任务分布算法

### 缓存友好性
- **热缓存**：优先在原CPU运行任务
- **缓存共享**：考虑L2/L3缓存共享
- **NUMA感知**：减少跨NUMA节点访问

## 实际应用案例

### 高性能计算 (HPC)
```bash
# CPU密集型应用优化
# 1. 绑定到NUMA节点
numactl --cpunodebind=0 --membind=0 ./hpc_app

# 2. 隔离CPU核心
# 启动参数：isolcpus=4-15 nohz_full=4-15

# 3. 设置高优先级
chrt -f 80 ./hpc_app
```

### 实时音频处理
```bash
# 音频应用调优
# 1. 设置实时调度
chrt -f 70 ./audio_app

# 2. 绑定到特定CPU
taskset -c 2 ./audio_app

# 3. 减少系统干扰
echo 1 > /proc/sys/kernel/sched_rt_runtime_us
```

### 容器化环境
```bash
# Docker容器CPU限制
docker run --cpuset-cpus="0-3" --cpu-shares=512 my_container

# Kubernetes CPU绑定
# 在Pod spec中设置：
# resources:
#   requests:
#     cpu: "2"
#   limits:
#     cpu: "4"
```

## 总结

Linux 5.15的调度器架构通过多个专门的调度器类、完善的进程状态管理、灵活的CPU绑定机制和智能的多核调度策略，实现了从硬实时到节能的全面覆盖：

- **Stop类**：系统关键任务的最高优先级保障
- **Deadline类**：硬实时任务的截止时间保证
- **RT类**：软实时任务的优先级调度
- **CFS类**：普通任务的公平调度
- **Idle类**：系统空闲时的能耗管理

通过合理的进程状态管理、CPU绑定策略和多核调度优化，可以显著提升系统性能和响应性。这种分层设计既保证了系统的实时性能，又确保了普通任务的公平性和系统的整体效率。每个调度器类都针对特定的应用场景进行了优化，形成了功能完整、性能优越的现代操作系统调度器。 