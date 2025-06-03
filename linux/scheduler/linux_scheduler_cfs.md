# Linux 5.15 CFS调度器详解

## 目录
- [概述](#概述)
- [CFS调度原理](#cfs调度原理)
- [任务组调度机制](#任务组调度机制)
- [调度域与多核协调](#调度域与多核协调)
- [CFS带宽控制](#cfs带宽控制)
- [cgroup配置管理](#cgroup配置管理)
- [性能监控与调优](#性能监控与调优)
- [实践案例](#实践案例)

## 概述

Linux 5.15内核中的完全公平调度器（CFS - Completely Fair Scheduler）是默认的进程调度器，负责调度SCHED_NORMAL、SCHED_BATCH和SCHED_IDLE策略的任务。CFS通过虚拟运行时间（vruntime）机制实现公平调度，并支持层次化的任务组调度。

### 基本特性

- **公平性**：基于vruntime确保所有任务获得公平的CPU时间
- **低延迟**：O(log N)的时间复杂度，支持高效的任务选择
- **可扩展性**：支持从单核到大规模多核系统
- **层次化调度**：支持任务组之间和组内的多级调度
- **多核协调**：通过调度域实现跨CPU的负载均衡
- **带宽控制**：提供精确的CPU使用限制机制

## CFS调度原理

### 虚拟运行时间（vruntime）

CFS的核心是虚拟运行时间机制：

```c
// 虚拟运行时间计算
vruntime += delta_exec * (NICE_0_LOAD / se->load.weight)

// 其中：
// delta_exec: 实际运行时间
// NICE_0_LOAD: nice=0时的权重（1024）
// se->load.weight: 任务的权重
```

**关键特点**：
- **公平性保证**：vruntime增长最慢的任务优先运行
- **权重影响**：高优先级任务vruntime增长更慢
- **红黑树组织**：按vruntime排序，左侧节点优先调度

### 任务选择算法

```c
// 选择下一个任务的逻辑
static struct task_struct *pick_next_task_fair(struct rq *rq)
{
    struct cfs_rq *cfs_rq = &rq->cfs;
    struct sched_entity *se;
    
    // 从红黑树最左侧选择vruntime最小的任务
    se = __pick_first_entity(cfs_rq);
    if (se) {
        set_next_entity(cfs_rq, se);
        return task_of(se);
    }
    return NULL;
}
```

### 时间片和抢占

CFS不使用固定时间片，而是动态计算：

```c
// 动态时间片计算
static u64 sched_slice(struct cfs_rq *cfs_rq, struct sched_entity *se)
{
    u64 slice = __sched_period(cfs_rq->nr_running);
    
    // 根据权重分配时间片
    slice *= se->load.weight;
    do_div(slice, cfs_rq->load.weight);
    
    return slice;
}
```

## 任务组调度机制

### 层次化调度架构

CFS支持两个层次的调度：

#### 1. 任务组之间的调度

```c
struct task_group {
    struct sched_entity **se;        // 每CPU的调度实体
    struct cfs_rq **cfs_rq;          // 每CPU的CFS运行队列
    unsigned long shares;            // 任务组权重
    struct cfs_bandwidth cfs_bandwidth;  // 带宽控制
};
```

**工作机制**：
- **组调度实体**：每个任务组在每个CPU上有一个group scheduling entity
- **权重分配**：根据`shares`值在任务组间分配CPU时间
- **层次化vruntime**：组调度实体也有自己的vruntime

#### 2. 任务组内部的调度

**组内公平调度**：
- 每个任务组有独立的CFS运行队列
- 组内任务按标准CFS算法调度
- 使用独立的vruntime空间

### 调度流程示例

```c
// 简化的调度选择流程
for_each_sched_entity(se) {
    cfs_rq = cfs_rq_of(se);
    
    // 在当前层次选择最优任务
    se = pick_next_entity(cfs_rq, curr);
    
    if (entity_is_task(se)) {
        // 找到具体任务，返回
        return task_of(se);
    }
    
    // 如果是组调度实体，进入下一层
    curr = se;
}
```

### 任务组与cgroup的关系

```bash
# 任务组通过cgroup进行管理
/sys/fs/cgroup/                    # cgroup v2根目录
├── cpu.weight                     # 根组权重
├── cpu.max                        # 根组带宽限制
├── user.slice/                    # 用户slice
│   ├── cpu.weight                 # 用户组权重
│   └── user-1000.slice/           # 具体用户
└── system.slice/                  # 系统服务slice
    ├── cpu.weight
    └── kubelet.service/           # 系统服务
```

## 调度域与多核协调

### 调度域概念

调度域（Scheduling Domains）是Linux CFS调度器中用于组织多核CPU层次化调度结构的核心机制。调度域解决了多核系统中的关键问题：

- **多核负载均衡**：在不同层次的CPU之间进行智能负载均衡
- **缓存局部性优化**：优化缓存亲和性和NUMA亲和性
- **调度开销最小化**：减少跨域调度的性能开销
- **拓扑感知调度**：根据硬件拓扑进行调度决策

### 调度域数据结构

```c
struct sched_domain {
    struct sched_domain __rcu *parent;    // 父域
    struct sched_domain __rcu *child;     // 子域
    struct sched_group *groups;           // 调度组
    unsigned long min_interval;          // 最小均衡间隔
    unsigned long max_interval;          // 最大均衡间隔
    unsigned int imbalance_pct;          // 不平衡阈值百分比
    int flags;                           // 域标志
    int level;                           // 域层级
    unsigned long span[];                // CPU掩码
};
```

### 调度域层次结构

以典型的64核NUMA系统为例：

```
Level 4: NUMA域
    └── span: [0-63] (所有CPU)
    └── flags: SD_NUMA, SD_SERIALIZE
    └── 特性: 跨NUMA节点负载均衡
    
Level 3: Package域 (物理CPU包)
    └── span: [0-31] [32-63] (每个物理CPU包)
    └── flags: SD_BALANCE_NEWIDLE, SD_BALANCE_EXEC
    └── 特性: 包间负载均衡
    
Level 2: LLC域 (Last Level Cache)
    └── span: [0-15] [16-31] [32-47] [48-63] (共享缓存的核心)
    └── flags: SD_SHARE_PKG_RESOURCES
    └── 特性: 共享L3缓存的核心组
    
Level 1: SMT域 (超线程)
    └── span: [0,1] [2,3] ... [62,63] (同一物理核心的超线程)
    └── flags: SD_SHARE_CPUCAPACITY
    └── 特性: 共享执行单元
```

### 调度域标志详解

#### 负载均衡标志

```c
// 主要调度域标志
#define SD_BALANCE_NEWIDLE    0x01    // CPU即将空闲时进行负载均衡
#define SD_BALANCE_EXEC       0x02    // exec系统调用时进行负载均衡
#define SD_BALANCE_FORK       0x04    // fork进程时进行负载均衡
#define SD_BALANCE_WAKE       0x08    // 任务唤醒时进行负载均衡
```

#### 拓扑特性标志

```c
// 拓扑和资源共享标志
#define SD_WAKE_AFFINE           0x10    // 唤醒亲和性
#define SD_SHARE_CPUCAPACITY     0x400   // 共享CPU能力（SMT域）
#define SD_SHARE_PKG_RESOURCES   0x800   // 共享包资源（缓存域）
#define SD_ASYM_CPUCAPACITY      0x20    // 不对称CPU能力
#define SD_NUMA                  0x2000  // NUMA域标志
#define SD_SERIALIZE             0x1000  // 串行化负载均衡
```

### 多核协调工作机制

#### 每CPU数据结构

```c
// 每个CPU都有独立的运行队列和调度域
DECLARE_PER_CPU_SHARED_ALIGNED(struct rq, runqueues);

// 特殊调度域指针（每CPU）
DECLARE_PER_CPU(struct sched_domain __rcu *, sd_llc);          // 最后级缓存域
DECLARE_PER_CPU(struct sched_domain __rcu *, sd_numa);        // NUMA域
DECLARE_PER_CPU(struct sched_domain __rcu *, sd_asym_packing); // 不对称打包域
DECLARE_PER_CPU(struct sched_domain __rcu *, sd_asym_cpucapacity); // 不对称能力域
```

#### 任务组在多CPU上的组织

```c
struct task_group {
    struct sched_entity **se;        // 每CPU的调度实体数组
    struct cfs_rq **cfs_rq;          // 每CPU的CFS运行队列数组
    // 每个CPU上都有对应的se和cfs_rq
};

// 任务组SE在调度域中的分布示例
CPU0: tg->se[0] -> 在CPU0的CFS队列中作为组调度实体
CPU1: tg->se[1] -> 在CPU1的CFS队列中作为组调度实体
...
CPU63: tg->se[63] -> 在CPU63的CFS队列中作为组调度实体
```

### 负载均衡机制

#### 负载均衡触发条件

```c
// 负载均衡触发时机
enum cpu_idle_type {
    CPU_IDLE,         // CPU空闲时
    CPU_NOT_IDLE,     // CPU繁忙时的周期性均衡
    CPU_NEWLY_IDLE,   // CPU即将空闲时
    CPU_MAX_IDLE_TYPES
};
```

#### 负载均衡算法

```c
// 简化的负载均衡逻辑
static int load_balance(int this_cpu, struct rq *this_rq,
                       struct sched_domain *sd, enum cpu_idle_type idle)
{
    struct sched_group *group;
    struct rq *busiest;
    unsigned long moved = 0;
    
    // 1. 找到最繁忙的调度组
    group = find_busiest_group(sd, this_cpu, &imbalance, idle);
    if (!group)
        goto out_balanced;
    
    // 2. 找到组内最繁忙的CPU
    busiest = find_busiest_queue(sd, group, idle, this_cpu);
    if (!busiest)
        goto out_balanced;
    
    // 3. 执行任务迁移
    if (busiest != this_rq) {
        moved = move_tasks(this_rq, this_cpu, busiest, 
                          imbalance, sd, idle);
    }
    
    return moved;
}
```

#### 任务迁移策略

```c
// 任务迁移决策
static int can_migrate_task(struct task_struct *p, int dst_cpu)
{
    // 检查CPU亲和性
    if (!cpumask_test_cpu(dst_cpu, &p->cpus_allowed))
        return 0;
    
    // 检查是否正在运行
    if (task_running(task_rq(p), p))
        return 0;
    
    // 检查缓存热度
    if (task_hot(p, rq_clock_task(task_rq(p))))
        return 0;
    
    return 1;
}
```

### 调度域构建过程

#### 拓扑层级定义

```c
// 默认调度域拓扑层级
static struct sched_domain_topology_level default_topology[] = {
#ifdef CONFIG_SCHED_SMT
    { cpu_smt_mask, cpu_smt_flags, SD_INIT_NAME(SMT) },
#endif
#ifdef CONFIG_SCHED_MC
    { cpu_coregroup_mask, cpu_core_flags, SD_INIT_NAME(MC) },
#endif
#ifdef CONFIG_NUMA
    { cpu_numa_mask, SD_INIT_NAME(NUMA) },
#endif
    { NULL, },
};
```

#### 动态构建流程

```c
// 调度域构建的关键步骤
static int build_sched_domains(const struct cpumask *cpu_map, 
                              struct sched_domain_attr *attr)
{
    // 1. 为每个CPU构建层次化调度域
    for_each_cpu(i, cpu_map) {
        struct sched_domain_topology_level *tl;
        sd = NULL;
        
        // 2. 按拓扑层级构建
        for_each_sd_topology(tl) {
            sd = build_sched_domain(tl, cpu_map, attr, sd, i);
            
            // 3. 设置域标志
            if (tl->flags & SDTL_OVERLAP)
                sd->flags |= SD_OVERLAP;
        }
    }
    
    // 4. 构建调度组
    for_each_cpu(i, cpu_map) {
        for (sd = *per_cpu_ptr(d.sd, i); sd; sd = sd->parent) {
            build_sched_groups(sd, i);
        }
    }
    
    // 5. 将域附加到CPU运行队列
    for_each_cpu(i, cpu_map) {
        cpu_attach_domain(sd, d.rd, i);
    }
}
```

### 调度域与任务组的协调

#### 层次化调度协调

```c
// CFS任务选择中的多层协调
static struct task_struct *
pick_next_task_fair(struct rq *rq, struct task_struct *prev, struct rq_flags *rf)
{
    struct cfs_rq *cfs_rq = &rq->cfs;
    struct sched_entity *se;
    
    // 层次化遍历：从顶层到具体任务
    for_each_sched_entity(se) {
        cfs_rq = cfs_rq_of(se);
        
        // 在当前层次选择最优调度实体
        se = pick_next_entity(cfs_rq, curr);
        
        if (entity_is_task(se)) {
            // 找到具体任务
            return task_of(se);
        }
        
        // 如果是组调度实体，进入下一层
        cfs_rq = group_cfs_rq(se);
    }
}
```

#### 跨CPU的任务组协调

```c
// 任务组在多CPU间的负载均衡
static int balance_fair(struct rq *rq, struct task_struct *prev, 
                       struct rq_flags *rf)
{
    if (rq->nr_running)
        return 1;
    
    // 尝试从其他CPU拉取任务
    for_each_domain(rq->cpu, sd) {
        if (sd->flags & SD_BALANCE_NEWIDLE) {
            // 在该调度域内进行负载均衡
            pulled_task = load_balance(rq->cpu, rq, sd, CPU_NEWLY_IDLE);
            if (pulled_task)
                break;
        }
    }
    
    return pulled_task;
}
```

### 查看调度域信息的方法

#### 系统文件方法（需要CONFIG_SCHED_DEBUG=y）

```bash
# 查看调度域结构（如果支持）
ls /proc/sys/kernel/sched_domain/cpu0/
# 输出：domain0  domain1  domain2  domain3

# 查看域的详细信息
for domain in /proc/sys/kernel/sched_domain/cpu0/domain*; do
    echo "=== $(basename $domain) ==="
    echo "名称: $(cat $domain/name)"
    echo "标志: $(cat $domain/flags)"
    echo "最小间隔: $(cat $domain/min_interval)ms"
    echo "最大间隔: $(cat $domain/max_interval)ms"
done
```

#### 替代方法（无调试支持时）

```bash
# 通过CPU拓扑推断调度域
echo "=== CPU拓扑分析 ==="
lscpu | grep -E "(CPU\(s\)|Thread|Core|Socket|NUMA)"

# 查看超线程拓扑（SMT域）
cat /sys/devices/system/cpu/cpu0/topology/thread_siblings_list

# 查看缓存共享拓扑（LLC域）
cat /sys/devices/system/cpu/cpu0/cache/index3/shared_cpu_list

# 查看NUMA拓扑（NUMA域）
for node in /sys/devices/system/node/node*; do
    if [ -d "$node" ]; then
        node_id=$(basename $node | sed 's/node//')
        cpus=$(cat $node/cpulist)
        echo "NUMA节点 $node_id: CPU $cpus"
    fi
done
```

### 调度域性能调优

#### 负载均衡参数调整

```bash
# 调整负载均衡间隔（如果支持）
echo 5 > /proc/sys/kernel/sched_domain/cpu0/domain0/min_interval
echo 10 > /proc/sys/kernel/sched_domain/cpu0/domain0/max_interval

# 调整不平衡阈值
echo 125 > /proc/sys/kernel/sched_domain/cpu0/domain0/imbalance_pct
```

#### 全局调度参数

```bash
# CFS调度参数调优
echo 4000000 > /proc/sys/kernel/sched_latency_ns           # 调度延迟
echo 500000 > /proc/sys/kernel/sched_min_granularity_ns    # 最小调度粒度
echo 1000000 > /proc/sys/kernel/sched_wakeup_granularity_ns # 唤醒抢占粒度

# NUMA均衡参数
echo 1 > /proc/sys/kernel/numa_balancing                   # 启用NUMA均衡
```

#### 任务亲和性设置

```bash
# 设置进程CPU亲和性（绑定到特定调度域）
taskset -c 0-15 ./cpu_intensive_app     # 绑定到LLC域
taskset -c 0-31 ./memory_app            # 绑定到Package域
numactl --cpunodebind=0 ./numa_app      # 绑定到NUMA节点
```

### 调度域监控脚本

#### 完整的调度域分析脚本

```bash
#!/bin/bash
# sched_domain_monitor.sh - 调度域监控脚本

echo "==============================================="
echo "           调度域与多核协调分析"
echo "==============================================="

# 1. 基本系统信息
echo -e "\n1. 系统基本信息:"
echo "内核版本: $(uname -r)"
echo "CPU型号: $(grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)"
lscpu | grep -E "(CPU\(s\)|Core\(s\)|Socket\(s\)|NUMA)"

# 2. 推断调度域结构
echo -e "\n2. 推断的调度域结构:"
total_cpus=$(nproc)
physical_cpus=$(grep "physical id" /proc/cpuinfo | sort -u | wc -l 2>/dev/null || echo 1)

# SMT域分析
if [ -f "/sys/devices/system/cpu/cpu0/topology/thread_siblings_list" ]; then
    siblings=$(cat /sys/devices/system/cpu/cpu0/topology/thread_siblings_list)
    echo "  Level 1 - SMT域: CPU $siblings"
    echo "    特性: 共享执行单元(超线程)"
    echo "    标志: SD_SHARE_CPUCAPACITY"
fi

# LLC域分析
if [ -f "/sys/devices/system/cpu/cpu0/cache/index3/shared_cpu_list" ]; then
    l3_shared=$(cat /sys/devices/system/cpu/cpu0/cache/index3/shared_cpu_list)
    echo "  Level 2 - LLC域: CPU $l3_shared"
    echo "    特性: 共享L3缓存"
    echo "    标志: SD_SHARE_PKG_RESOURCES"
fi

# Package域分析
if [ -f "/sys/devices/system/cpu/cpu0/topology/package_cpus_list" ]; then
    package_cpus=$(cat /sys/devices/system/cpu/cpu0/topology/package_cpus_list)
    echo "  Level 3 - Package域: CPU $package_cpus"
    echo "    特性: 物理CPU包"
    echo "    标志: SD_BALANCE_NEWIDLE, SD_BALANCE_EXEC"
fi

# NUMA域分析
echo "  Level 4 - NUMA域:"
for node in /sys/devices/system/node/node*; do
    if [ -d "$node" ]; then
        node_id=$(basename $node | sed 's/node//')
        cpus=$(cat $node/cpulist 2>/dev/null || echo "unknown")
        echo "    NUMA节点 $node_id: CPU $cpus"
    fi
done
echo "    特性: 跨NUMA节点"
echo "    标志: SD_NUMA, SD_SERIALIZE"

# 3. 负载均衡监控
echo -e "\n3. 负载均衡状态:"
echo "当前负载: $(uptime | awk -F'load average:' '{print $2}')"

# CPU使用率分析
echo -e "\n4. CPU使用率分布:"
mpstat -P ALL 1 1 | grep -E "(Average|CPU)" | tail -n +2

# 5. 任务组在多CPU上的分布
echo -e "\n5. 任务组CPU分布:"
if [ -f "/sys/fs/cgroup/kubepods/cpu.stat" ]; then
    echo "kubepods CPU统计:"
    cat /sys/fs/cgroup/kubepods/cpu.stat | grep -E "(usage_usec|user_usec|system_usec)"
fi

# 6. 调度域参数（如果可用）
echo -e "\n6. 调度域参数:"
if [ -d "/proc/sys/kernel/sched_domain" ]; then
    echo "✓ 调度域调试支持已启用"
    for domain in /proc/sys/kernel/sched_domain/cpu0/domain*; do
        if [ -d "$domain" ]; then
            name=$(cat $domain/name 2>/dev/null)
            flags=$(cat $domain/flags 2>/dev/null)
            echo "  $name域: 标志=$flags"
        fi
    done
else
    echo "✗ 调度域调试支持未启用"
fi

echo -e "\n==============================================="
```

## CFS带宽控制

### 核心数据结构

```c
struct cfs_bandwidth {
    raw_spinlock_t    lock;              // 带宽控制锁
    ktime_t           period;            // 周期时间(默认100ms)
    u64               quota;             // 每周期配额
    u64               runtime;           // 当前剩余运行时间
    u64               burst;             // 突发配额
    
    struct hrtimer    period_timer;      // 周期定时器
    struct hrtimer    slack_timer;       // slack定时器
    struct list_head  throttled_cfs_rq;  // 被节流的队列
    
    // 统计信息
    int               nr_periods;        // 周期计数
    int               nr_throttled;      // 节流次数
    u64               throttled_time;    // 累计节流时间
};
```

### 带宽控制机制

#### 1. 配额分配

```c
// 运行时配额分配
static int assign_cfs_rq_runtime(struct cfs_rq *cfs_rq)
{
    struct cfs_bandwidth *cfs_b = tg_cfs_bandwidth(cfs_rq->tg);
    
    raw_spin_lock(&cfs_b->lock);
    
    // 检查是否有可用配额
    if (cfs_b->runtime > 0) {
        u64 amount = min(cfs_b->runtime, sched_cfs_bandwidth_slice());
        cfs_b->runtime -= amount;
        cfs_rq->runtime_remaining += amount;
        ret = 1;
    }
    
    raw_spin_unlock(&cfs_b->lock);
    return ret;
}
```

#### 2. 节流机制

```c
// 节流处理
static bool throttle_cfs_rq(struct cfs_rq *cfs_rq)
{
    struct cfs_bandwidth *cfs_b = tg_cfs_bandwidth(cfs_rq->tg);
    
    // 尝试获取更多运行时间
    if (__assign_cfs_rq_runtime(cfs_b, cfs_rq, 1)) {
        return false;  // 获取成功，无需节流
    }
    
    // 加入节流列表
    list_add_tail_rcu(&cfs_rq->throttled_list, &cfs_b->throttled_cfs_rq);
    
    // 移除所有调度实体
    dequeue_throttled_entities(cfs_rq);
    
    return true;
}
```

#### 3. 定时器机制

**周期定时器**：
```c
static enum hrtimer_restart sched_cfs_period_timer(struct hrtimer *timer)
{
    struct cfs_bandwidth *cfs_b = container_of(timer, struct cfs_bandwidth, period_timer);
    
    // 刷新配额
    __refill_cfs_bandwidth_runtime(cfs_b);
    
    // 解除节流
    distribute_cfs_runtime(cfs_b);
    
    return HRTIMER_RESTART;
}
```

**Slack定时器**：
```c
static void do_sched_cfs_slack_timer(struct cfs_bandwidth *cfs_b)
{
    u64 runtime = 0, slice = sched_cfs_bandwidth_slice();
    
    // 收集未使用的运行时间
    collect_slack_runtime(cfs_b, &runtime);
    
    // 重新分发给节流的队列
    if (runtime > slice)
        distribute_cfs_runtime(cfs_b);
}
```

### 突发特性（Burst）

Linux 5.14+引入的burst特性允许短期超过配额：

```c
// 带突发的配额刷新
void __refill_cfs_bandwidth_runtime(struct cfs_bandwidth *cfs_b)
{
    if (cfs_b->quota == RUNTIME_INF)
        return;
        
    cfs_b->runtime += cfs_b->quota;
    // 允许累积到 quota + burst
    cfs_b->runtime = min(cfs_b->runtime, cfs_b->quota + cfs_b->burst);
}
```

## cgroup配置管理

### cgroup v1 vs cgroup v2

#### cgroup v1配置

```bash
# 权重配置（shares）
echo 512 > /sys/fs/cgroup/cpu/mygroup/cpu.shares

# 带宽配置
echo 100000 > /sys/fs/cgroup/cpu/mygroup/cpu.cfs_period_us    # 100ms周期
echo 50000  > /sys/fs/cgroup/cpu/mygroup/cpu.cfs_quota_us     # 50ms配额(50%)

# 查看统计
cat /sys/fs/cgroup/cpu/mygroup/cpu.stat
```

#### cgroup v2配置

```bash
# 权重配置（范围1-10000，默认100）
echo 200 > /sys/fs/cgroup/mygroup/cpu.weight

# 带宽配置（period quota格式）
echo "100000 50000" > /sys/fs/cgroup/mygroup/cpu.max

# 突发配置（需要内核5.14+）
echo "100000 50000 25000" > /sys/fs/cgroup/mygroup/cpu.max

# 查看统计
cat /sys/fs/cgroup/mygroup/cpu.stat
```

### 配置参数详解

#### cpu.weight参数

```bash
# 权重值含义
权重范围: 1-10000
默认值: 100
权重比例 = 当前组权重 / 总权重

# 示例：64核系统
kubepods.weight = 2188
system.slice.weight = 100
user.slice.weight = 100
总权重 = 2388

# kubepods CPU分配比例
kubepods比例 = 2188/2388 ≈ 91.6%
理论CPU核心 = 64 × 91.6% ≈ 58.6核
```

#### cpu.max参数

```bash
# 格式: "$MAX $PERIOD" 或 "$MAX $PERIOD $BURST"
"max 100000"          # 无限制，周期100ms
"50000 100000"        # 50ms配额，100ms周期(50%限制)
"50000 100000 25000"  # 50ms配额，25ms突发，100ms周期

# 计算CPU使用率
CPU使用率 = (quota/period) × 100%
```

### 实时监控

```bash
# 查看cgroup资源使用
systemd-cgtop

# 查看CPU统计信息
cat /sys/fs/cgroup/kubepods/cpu.stat
# 输出示例：
# usage_usec 123456789        # 总CPU使用时间(微秒)
# user_usec 87654321          # 用户态时间
# system_usec 35802468        # 内核态时间
# nr_periods 12345            # 经历的周期数
# nr_throttled 56             # 被节流次数
# throttled_usec 789012       # 累计节流时间

# 查看节流状态
find /sys/fs/cgroup -name "cpu.max" -exec echo "=== {} ===" \; -exec cat {} \;
```

## 性能监控与调优

### 关键性能指标

#### 1. 调度延迟监控

```bash
# 查看调度统计
cat /proc/sched_debug | grep "sched_latency\|sched_min_granularity"

# 查看运行队列信息
cat /proc/sched_debug | grep -A 20 "cfs_rq\["

# 监控上下文切换
vmstat 1
# 字段含义：
# cs: 每秒上下文切换次数
# r:  运行队列长度
```

#### 2. CPU利用率分析

```bash
# 整体CPU使用情况
top -p 1
htop

# 按cgroup查看CPU使用
systemd-cgtop

# 详细的CPU时间分解
cat /proc/stat | head -1
# cpu  user nice system idle iowait irq softirq steal guest guest_nice
```

#### 3. 带宽控制效果

```bash
# 监控节流情况
watch "grep throttled /sys/fs/cgroup/*/cpu.stat"

# 计算节流比例
awk '/nr_periods/ {periods=$2} /nr_throttled/ {throttled=$2} 
     END {if(periods>0) print "Throttle ratio:", throttled/periods*100"%"}' \
     /sys/fs/cgroup/kubepods/cpu.stat
```

### 性能调优建议

#### 1. 权重配置优化

```bash
# 生产环境推荐权重分配
kubepods:      800-1500  # 根据工作负载调整
system.slice:  100-200   # 确保系统服务稳定
user.slice:    100       # 用户进程标准权重

# 高性能计算场景
compute.slice: 5000      # 计算密集型任务高权重
storage.slice: 200       # 存储服务适中权重
network.slice: 300       # 网络服务较高权重
```

#### 2. 带宽限制调优

```bash
# Web服务器场景（限制CPU防止过载）
echo "150000 100000" > /sys/fs/cgroup/webserver/cpu.max  # 150% CPU

# 批处理任务（后台处理，限制资源使用）
echo "50000 100000" > /sys/fs/cgroup/batch/cpu.max       # 50% CPU

# 实时任务（需要稳定的CPU资源）
echo "max 100000" > /sys/fs/cgroup/realtime/cpu.max      # 无限制
```

#### 3. 内核参数调优

```bash
# CFS调度参数（/proc/sys/kernel/）
sched_latency_ns=6000000           # 调度延迟(6ms)
sched_min_granularity_ns=750000    # 最小调度粒度(0.75ms)
sched_wakeup_granularity_ns=1000000 # 唤醒抢占粒度(1ms)

# 设置示例
echo 4000000 > /proc/sys/kernel/sched_latency_ns
```

## 实践案例

### 案例1：Kubernetes集群CPU管理

#### 问题场景
- 64核服务器运行Kubernetes集群
- kubepods cpu.weight=2188，获得91.6%的CPU资源
- cpu.max="max 100000"，无带宽限制

#### 配置分析
```bash
# 当前配置
cat /sys/fs/cgroup/kubepods/cpu.weight  # 2188
cat /sys/fs/cgroup/kubepods/cpu.max     # max 100000

# 计算实际分配
总权重 = kubepods(2188) + system(100) + user(100) = 2388
kubepods比例 = 2188/2388 = 91.6%
可用CPU = 64 × 91.6% = 58.6核
```

#### 监控脚本
```bash
#!/bin/bash
# monitor_cfs.sh - CFS性能监控脚本

echo "=== CFS调度器监控 ==="
echo "时间: $(date)"
echo

# CPU使用统计
echo "--- CPU使用统计 ---"
cat /sys/fs/cgroup/kubepods/cpu.stat | while read key value; do
    case $key in
        usage_usec) echo "总CPU时间: $(($value/1000000))秒" ;;
        nr_periods) echo "周期数: $value" ;;
        nr_throttled) echo "节流次数: $value" ;;
        throttled_usec) echo "节流时间: $(($value/1000))ms" ;;
    esac
done

# 权重配置
echo -e "\n--- 权重配置 ---"
echo "kubepods权重: $(cat /sys/fs/cgroup/kubepods/cpu.weight)"
echo "系统权重: $(cat /sys/fs/cgroup/system.slice/cpu.weight 2>/dev/null || echo 'N/A')"

# 带宽限制
echo -e "\n--- 带宽限制 ---"
echo "kubepods限制: $(cat /sys/fs/cgroup/kubepods/cpu.max)"

# 负载信息
echo -e "\n--- 系统负载 ---"
uptime
```

### 案例2：容器CPU资源隔离

#### 配置示例
```bash
# 创建应用专用cgroup
mkdir -p /sys/fs/cgroup/production-app

# 设置CPU权重（高优先级）
echo 500 > /sys/fs/cgroup/production-app/cpu.weight

# 设置CPU带宽限制（最多使用4个CPU核心）
echo "400000 100000" > /sys/fs/cgroup/production-app/cpu.max

# 设置突发配额（允许短期使用额外1个核心）
echo "400000 100000 100000" > /sys/fs/cgroup/production-app/cpu.max

# 将进程加入cgroup
echo $PID > /sys/fs/cgroup/production-app/cgroup.procs
```

#### 验证效果
```bash
# 监控CPU使用
watch -n 1 'cat /sys/fs/cgroup/production-app/cpu.stat'

# 压测验证限制效果
stress-ng --cpu 8 --timeout 60s &
STRESS_PID=$!
echo $STRESS_PID > /sys/fs/cgroup/production-app/cgroup.procs

# 观察是否被限制在4核
top -p $STRESS_PID
```

### 案例3：多租户环境资源分配

#### 租户资源分配
```bash
# 租户A：关键业务（60%资源）
mkdir -p /sys/fs/cgroup/tenant-a
echo 600 > /sys/fs/cgroup/tenant-a/cpu.weight
echo "600000 100000" > /sys/fs/cgroup/tenant-a/cpu.max

# 租户B：开发测试（30%资源）
mkdir -p /sys/fs/cgroup/tenant-b  
echo 300 > /sys/fs/cgroup/tenant-b/cpu.weight
echo "300000 100000" > /sys/fs/cgroup/tenant-b/cpu.max

# 租户C：批处理（10%资源）
mkdir -p /sys/fs/cgroup/tenant-c
echo 100 > /sys/fs/cgroup/tenant-c/cpu.weight
echo "100000 100000" > /sys/fs/cgroup/tenant-c/cpu.max
```

#### 动态调整脚本
```bash
#!/bin/bash
# tenant_manager.sh - 租户资源动态调整

adjust_tenant_resources() {
    local tenant=$1
    local cpu_percent=$2
    local burst_percent=${3:-0}
    
    local weight=$((cpu_percent * 10))
    local quota=$((cpu_percent * 1000))
    local burst=$((burst_percent * 1000))
    
    echo $weight > /sys/fs/cgroup/$tenant/cpu.weight
    
    if [ $burst -gt 0 ]; then
        echo "$quota 100000 $burst" > /sys/fs/cgroup/$tenant/cpu.max
    else
        echo "$quota 100000" > /sys/fs/cgroup/$tenant/cpu.max
    fi
    
    echo "租户 $tenant 资源已调整: ${cpu_percent}% CPU"
}

# 示例：调整租户A到80%，允许20%突发
adjust_tenant_resources "tenant-a" 80 20
```

## 总结

CFS调度器作为Linux的核心调度器，通过以下机制实现高效的CPU资源管理：

1. **公平调度**：基于vruntime的公平算法确保所有任务获得合理的CPU时间
2. **层次化管理**：支持任务组间和组内的多级调度，适应复杂的系统架构
3. **精确控制**：通过cfs_bandwidth提供微秒级精度的CPU带宽限制
4. **灵活配置**：支持cgroup v1/v2的多种配置方式，适应不同的部署场景
5. **高性能**：O(log N)算法复杂度，支持大规模多核系统

在现代容器化和云计算环境中，深入理解CFS调度器的工作原理和配置方法，对于系统性能优化和资源管理具有重要意义。通过合理的权重分配、带宽控制和监控调优，可以在保证系统稳定性的同时，最大化资源利用效率。

## 时序图参考

为了更好地理解CFS调度器的工作流程，我们提供了以下详细的时序图：

### 主要时序图文件

#### 1. CFS调度器完整调度流程时序图
**文件**: `docs/linux_scheduler_cfs.puml`

展示了CFS调度器从触发到完成的完整调度流程，包括：
- 调度触发和任务选择
- 虚拟运行时间计算和更新
- 调度域协调和负载均衡
- 带宽控制检查和节流处理
- 统计信息更新和周期性维护

**主要参与者**：
- 内核调度触发器
- 核心调度器(core.c)
- CFS调度类(fair.c)
- 任务组管理
- 调度域
- CFS运行队列
- 调度实体
- 红黑树
- vruntime计算模块
- 负载均衡器
- 带宽控制器

#### 2. CFS任务组层次化调度详细时序图
**文件**: `docs/linux_scheduler_cfs_hierarchy.puml`

专门展示任务组层次化调度的详细过程，包括：
- 任务组间的调度决策
- 任务组内的公平调度
- 层次化vruntime更新机制
- 权重和份额处理
- 跨CPU的任务组协调
- 调度域层次处理

**关键概念**：
- 根CFS队列与任务组SE的关系
- 任务组内部队列的管理
- 层次化vruntime计算
- 任务组权重分配
- 跨CPU负载均衡

#### 3. CFS带宽控制机制详细时序图
**文件**: `docs/linux_scheduler_cfs_bandwidth.puml`

详细展示CFS带宽控制的工作机制，包括：
- 带宽控制初始化
- 运行时配额管理
- 节流和解除节流处理
- 周期定时器和Slack定时器
- 突发机制(burst)处理
- 统计信息维护

**核心流程**：
- 配额分配和消耗
- 节流触发条件和处理
- 定时器驱动的配额刷新
- 跨CPU带宽协调
- cgroup接口交互

### 使用时序图

#### 查看时序图
这些时序图使用PlantUML格式编写，可以通过以下方式查看：

1. **在线查看**：
   ```bash
   # 使用PlantUML在线服务
   # 将.puml文件内容粘贴到: http://www.plantuml.com/plantuml/uml/
   ```

2. **本地生成**：
   ```bash
   # 安装PlantUML
   sudo apt-get install plantuml  # Ubuntu/Debian
   brew install plantuml          # macOS
   
   # 生成图片
   plantuml docs/linux_scheduler_cfs.puml
   plantuml docs/linux_scheduler_cfs_hierarchy.puml  
   plantuml docs/linux_scheduler_cfs_bandwidth.puml
   ```

3. **集成到文档系统**：
   ```bash
   # 生成PNG格式
   plantuml -tpng docs/*.puml
   
   # 生成SVG格式  
   plantuml -tsvg docs/*.puml
   ```

#### 时序图说明

**主调度流程图**展示了从`schedule()`调用开始的完整调度过程，帮助理解：
- CFS如何被核心调度器调用
- 任务选择的层次化过程
- 负载均衡的触发时机
- 各个组件之间的交互关系

**层次化调度图**深入展示了任务组调度的复杂性，特别是：
- 如何在任务组间进行公平调度
- 如何在任务组内进行公平调度
- vruntime在层次结构中的传播
- 权重如何影响调度决策

**带宽控制图**详细展示了资源限制机制，包括：
- 如何实现精确的CPU使用限制
- 节流和恢复的完整流程
- 定时器如何驱动配额管理
- 多CPU环境下的协调机制

这些时序图相互补充，为理解CFS调度器的完整工作机制提供了可视化的参考。建议结合具体的内核代码和实际的系统配置来学习和理解。 