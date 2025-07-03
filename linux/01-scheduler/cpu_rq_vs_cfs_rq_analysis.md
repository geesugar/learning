# CPU运行队列(rq) vs CFS运行队列(cfs_rq) - 详细分析

## 概述

Linux调度器采用**分层运行队列架构**，其中CPU运行队列(`struct rq`)是顶层调度抽象，而CFS运行队列(`struct cfs_rq`)是专门为CFS调度类设计的子运行队列。

---

## 1. 基本定义与作用

### 1.1 CPU运行队列 (struct rq)

**定义**：每个CPU核心的主运行队列，是调度器的顶层数据结构。

**核心作用**：
- 统一管理该CPU上的所有调度活动
- 协调不同调度类之间的交互
- 维护CPU级别的统计信息
- 处理负载均衡和任务迁移

```c
// kernel/sched/sched.h:922
struct rq {
    raw_spinlock_t      __lock;           // 运行队列锁
    unsigned int        nr_running;       // 总运行任务数
    
    // 📊 不同调度类的子运行队列
    struct cfs_rq       cfs;              // CFS运行队列
    struct rt_rq        rt;               // RT运行队列  
    struct dl_rq        dl;               // DL运行队列
    
    // 🎯 当前运行状态
    struct task_struct *curr;             // 当前运行任务
    struct task_struct *idle;             // 空闲任务
    struct task_struct *stop;             // 停止任务
    
    // ⏱️ 时钟与调度
    u64                 clock;            // CPU时钟
    u64                 clock_task;       // 任务时钟
    unsigned long       next_balance;     // 下次负载均衡时间
    
    // 🔄 SMP相关
    int                 cpu;              // CPU编号
    struct root_domain *rd;               // 根域
    struct sched_domain *sd;              // 调度域
};
```

### 1.2 CFS运行队列 (struct cfs_rq)

**定义**：专门管理CFS调度类任务的运行队列。

**核心作用**：
- 维护CFS任务的红黑树
- 跟踪虚拟运行时间(vruntime)
- 处理CFS特有的调度决策
- 支持分组调度(Group Scheduling)

```c
// kernel/sched/sched.h:529
struct cfs_rq {
    struct load_weight      load;           // 队列总权重
    unsigned int            nr_running;     // CFS任务数量
    unsigned int            h_nr_running;   // 层次任务数量
    
    // ⏰ 虚拟时间管理
    u64                     exec_clock;     // 执行时间
    u64                     min_vruntime;   // 最小虚拟运行时间
    
    // 🌳 红黑树调度结构
    struct rb_root_cached   tasks_timeline; // 任务时间线(红黑树)
    
    // 🎯 当前调度状态
    struct sched_entity    *curr;           // 当前运行实体
    struct sched_entity    *next;           // 下一个实体
    struct sched_entity    *last;           // 上一个实体
    struct sched_entity    *skip;           // 跳过的实体
    
    // 📈 负载跟踪(SMP)
    struct sched_avg        avg;            // 平均负载
    
    // 🏗️ 分组调度支持
    struct rq              *rq;             // 归属的CPU运行队列
    struct task_group      *tg;             // 任务组
    struct list_head        leaf_cfs_rq_list; // 叶子CFS队列链表
};
```

---

## 2. 层次关系与组织结构

### 2.1 包含关系

```
📦 struct rq (CPU运行队列)
├── 🟦 struct cfs_rq cfs      // CFS调度类
├── 🟨 struct rt_rq rt        // RT调度类  
├── 🟩 struct dl_rq dl        // Deadline调度类
├── ⚙️  调度控制逻辑
├── 📊 统计信息
└── 🔄 负载均衡
```

**关键连接函数**：
```c
// 从cfs_rq获取对应的CPU运行队列
static inline struct rq *rq_of(struct cfs_rq *cfs_rq)
{
    return cfs_rq->rq;  // cfs_rq->rq指向父CPU运行队列
}
```

### 2.2 调度类优先级

CPU运行队列按**优先级顺序**选择调度类：

```
1. stop_sched_class    (最高优先级 - 停止任务)
   ↓
2. dl_sched_class      (Deadline调度)
   ↓  
3. rt_sched_class      (实时调度)
   ↓
4. fair_sched_class    (CFS调度) ← cfs_rq在这里
   ↓
5. idle_sched_class    (空闲调度)
```

---

## 3. 功能对比分析

| 特性维度 | CPU运行队列(rq) | CFS运行队列(cfs_rq) |
|---------|----------------|---------------------|
| **管理范围** | 整个CPU的所有任务 | 仅CFS调度类任务 |
| **数据结构** | 复合结构体 | 红黑树 + 元数据 |
| **调度决策** | 跨调度类选择 | CFS内部任务选择 |
| **时间概念** | 物理时间 | 虚拟运行时间 |
| **负载均衡** | CPU间任务迁移 | CFS任务重分布 |
| **锁机制** | rq->__lock | 继承rq锁 |
| **分组支持** | 不直接支持 | 原生支持task_group |

---

## 4. 调度流程中的协作

### 4.1 任务选择流程

```c
// 主调度函数中的选择逻辑
static void __schedule(bool preempt)
{
    struct rq *rq = cpu_rq(cpu);
    struct task_struct *prev, *next;
    
    // 🔒 获取CPU运行队列锁
    rq_lock(rq, &rf);
    
    // 🎯 按优先级顺序检查各调度类
    for_each_class(class) {
        next = class->pick_next_task(rq, prev, &rf);
        if (next) {
            // 如果是CFS类，实际上是调用了
            // fair_sched_class->pick_next_task()
            // 该函数内部会操作cfs_rq
            break;
        }
    }
    
    // 🔄 执行上下文切换
    context_switch(rq, prev, next, &rf);
}
```

### 4.2 CFS任务选择详细流程

```c
// kernel/sched/fair.c
static struct task_struct *
pick_next_task_fair(struct rq *rq, struct task_struct *prev, struct rq_flags *rf)
{
    struct cfs_rq *cfs_rq = &rq->cfs;  // 🔗 获取CPU的CFS队列
    struct sched_entity *se;
    
    // 🌳 从红黑树中选择最左节点(最小vruntime)
    se = pick_next_entity(cfs_rq, NULL);
    if (!se)
        return NULL;
        
    // 📝 更新CFS队列状态
    set_next_entity(cfs_rq, se);
    
    return task_of(se);  // 🎯 返回对应的task_struct
}
```

---

## 5. 内存布局与性能考虑

### 5.1 缓存行优化

```c
struct rq {
    // 🚀 热点数据放在同一缓存行
    unsigned int nr_running;
    // ... 其他频繁访问字段
    
    struct cfs_rq cfs;  // 🎯 CFS队列内嵌在rq中
    struct rt_rq rt;
    struct dl_rq dl;
    
    // 📊 统计数据放在独立缓存行
    u64 clock ____cacheline_aligned;
    u64 clock_task;
};
```

**优势**：
- CFS队列作为rq的成员，避免了额外的指针解引用
- 减少缓存未命中，提高调度器性能
- 保证了数据的空间局部性

### 5.2 分组调度的复杂性

在启用分组调度(`CONFIG_FAIR_GROUP_SCHED`)时：

```c
struct task_group {
    // 每个CPU都有独立的CFS队列和调度实体
    struct sched_entity **se;      // 每CPU调度实体数组
    struct cfs_rq **cfs_rq;        // 每CPU CFS队列数组
};

// CPU运行队列维护叶子CFS队列列表
struct rq {
    struct list_head leaf_cfs_rq_list;  // 🍃 叶子CFS队列链表
    // ...
};
```

**层次结构**：
```
CPU0 运行队列
├── 根CFS队列
│   ├── Task Group A的CFS队列
│   │   ├── 进程1
│   │   └── 进程2
│   └── Task Group B的CFS队列
│       ├── 进程3
│       └── 进程4
└── 其他调度类队列
```

---

## 6. 实际代码示例

### 6.1 获取任务的CFS队列

```c
// 获取任务p在CPU上的CFS队列
static inline struct cfs_rq *task_cfs_rq(struct task_struct *p)
{
    return p->se.cfs_rq;  // 调度实体直接指向CFS队列
}

// 获取调度实体的CFS队列
static inline struct cfs_rq *cfs_rq_of(struct sched_entity *se)
{
#ifdef CONFIG_FAIR_GROUP_SCHED
    return se->cfs_rq;  // 分组调度：可能指向任意CFS队列
#else
    struct task_struct *p = task_of(se);
    struct rq *rq = task_rq(p);
    return &rq->cfs;    // 非分组：指向CPU主CFS队列
#endif
}
```

### 6.2 负载均衡操作

```c
// CPU级别的负载均衡触发
void trigger_load_balance(struct rq *rq)
{
    // 🎯 在CPU运行队列级别触发
    if (time_after_eq(jiffies, rq->next_balance))
        raise_softirq(SCHED_SOFTIRQ);
}

// CFS级别的负载均衡执行
static int load_balance(int this_cpu, struct rq *this_rq, ...)
{
    struct cfs_rq *busiest_cfs_rq;
    
    // 🔍 寻找最繁忙的CFS队列
    busiest_cfs_rq = find_busiest_cfs_rq(...);
    
    // 🔄 执行CFS任务迁移
    if (busiest_cfs_rq)
        move_tasks_from_cfs_rq(busiest_cfs_rq, this_rq->cfs);
}
```

---

## 7. 总结与关键要点

### 7.1 核心区别

| 维度 | CPU运行队列(rq) | CFS运行队列(cfs_rq) |
|------|----------------|---------------------|
| **层次** | 顶层抽象 | 子系统专用 |
| **范围** | 全局CPU管理 | CFS任务专用 |
| **数据结构** | 多调度类容器 | 红黑树为核心 |
| **生命周期** | 系统启动创建 | 可动态创建(分组) |

### 7.2 关键联系

1. **包含关系**：每个rq包含一个主cfs_rq(`rq->cfs`)
2. **反向引用**：每个cfs_rq通过`cfs_rq->rq`指向父rq
3. **调度协作**：rq负责调度类选择，cfs_rq负责CFS内部选择
4. **锁共享**：cfs_rq使用rq的锁进行同步
5. **统计集成**：cfs_rq的统计信息汇总到rq

### 7.3 实践意义

- **性能调优**：理解两级结构有助于针对性优化
- **问题诊断**：CPU级问题查看rq，CFS问题查看cfs_rq
- **监控工具**：不同工具可能显示不同级别的信息
- **内核开发**：修改调度器需要理解层次关系

---

## 8. 相关工具与接口

### 8.1 调试接口

```bash
# CPU运行队列信息
cat /proc/sched_debug

# CFS运行队列统计
cat /proc/schedstat

# 单个任务的调度信息
cat /proc/<pid>/sched
```

### 8.2 内核函数

```c
// 获取CPU运行队列
struct rq *cpu_rq(int cpu);

// 获取任务的运行队列
struct rq *task_rq(struct task_struct *p);

// 获取任务的CFS队列
struct cfs_rq *task_cfs_rq(struct task_struct *p);
```

通过理解CPU运行队列和CFS运行队列的区别与联系，我们可以更好地掌握Linux调度器的分层设计思想和实现细节。 