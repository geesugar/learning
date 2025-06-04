# Linux 5.15 CFS调度器详解

## 目录
- [概述](#概述)
- [CFS调度原理](#cfs调度原理)
- [任务组调度机制](#任务组调度机制)
- [CFS与cgroup深度关系解析](#cfs与cgroup深度关系解析)
- [权重体系与层次化控制](#权重体系与层次化控制)
- [CPU性能控制机制](#cpu性能控制机制)
- [调度域与多核协调](#调度域与多核协调)
- [CFS带宽控制](#cfs带宽控制)
- [cgroup配置管理](#cgroup配置管理)
- [性能监控与调优](#性能监控与调优)
- [/proc/PID/sched详解](#proc-pid-sched详解)
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

## CFS与cgroup深度关系解析

### 职责分工与架构设计

CFS调度器与cgroup系统形成了完整的CPU资源管理体系，两者职责明确、分工合作：

#### CFS调度器职责
- **核心调度算法**：实现基于vruntime的公平调度算法
- **任务选择机制**：从红黑树中选择合适的任务运行
- **时间片管理**：动态计算和分配CPU时间片
- **多核协调**：通过调度域实现跨CPU负载均衡
- **抢占处理**：处理任务抢占和上下文切换

#### cgroup系统职责
- **层次化组织**：提供进程的层次化分组管理
- **资源限制**：定义各组的CPU使用限制和权重
- **接口暴露**：通过文件系统接口暴露配置参数
- **统计监控**：收集和报告各组的资源使用统计
- **权限管理**：控制对资源配置的访问权限

### 数据结构映射关系

```c
// cgroup与调度器的核心映射
struct task_group {
    // 与cgroup的关联
    struct cgroup_subsys_state css;     // cgroup子系统状态
    
    // CFS相关数据结构
    struct sched_entity **se;           // 每CPU的组调度实体
    struct cfs_rq **cfs_rq;            // 每CPU的CFS运行队列
    
    // 权重和带宽控制
    unsigned long shares;               // 对应cpu.weight
    struct cfs_bandwidth cfs_bandwidth; // 对应cpu.max
    
    // 层次关系
    struct task_group *parent;          // 父任务组
    struct list_head list;              // 同级任务组链表
    struct list_head children;          // 子任务组链表
};

// cgroup目录对应的任务组
struct cgroup {
    struct task_group *tg;              // 关联的任务组
    struct cgroup *parent;              // 父cgroup
    struct list_head children;          // 子cgroup列表
    
    // CPU控制器相关文件
    struct cftype cpu_weight_cftype;    // cpu.weight文件类型
    struct cftype cpu_max_cftype;       // cpu.max文件类型
    struct cftype cpu_stat_cftype;      // cpu.stat文件类型
};
```

### 层次化调度的实现机制

#### 1. 三级调度体系

```
系统级调度
└── cgroup.slice (系统服务)
    └── kubelet.service
        └── task1, task2, task3...

用户级调度  
└── user.slice
    └── user-1000.slice (用户进程)
        └── task1, task2, task3...

容器级调度
└── machine.slice  
    └── docker-xxx.scope (容器)
        └── task1, task2, task3...
```

#### 2. 调度决策流程

```c
// 简化的层次化调度选择
struct sched_entity *pick_next_entity_fair(struct cfs_rq *cfs_rq)
{
    struct sched_entity *se = __pick_first_entity(cfs_rq);
    
    // 如果是组调度实体，需要进入下一层
    if (entity_is_task(se)) {
        return se;  // 找到具体任务
    }
    
    // 组调度实体，进入组内调度
    struct cfs_rq *group_cfs_rq = group_cfs_rq_of_se(se);
    return pick_next_entity_fair(group_cfs_rq);
}
```

#### 3. vruntime的层次化管理

```c
// 不同层次的vruntime计算
void update_curr_fair(struct cfs_rq *cfs_rq)
{
    struct sched_entity *curr = cfs_rq->curr;
    u64 delta_exec = now - curr->exec_start;
    
    // 更新当前层次的vruntime
    curr->vruntime += calc_delta_fair(delta_exec, curr);
    
    // 如果是组调度实体，还需要更新父层次
    if (entity_is_task(curr)) {
        // 叶子任务，更新完成
        return;
    }
    
    // 组调度实体，向上传播vruntime更新
    struct task_group *tg = se_to_tg(curr);
    struct sched_entity *parent_se = tg->parent->se[cpu];
    if (parent_se) {
        update_curr_fair(cfs_rq_of(parent_se));
    }
}
```

### cgroup配置到调度器的传播

#### 1. cpu.weight配置传播

```c
// cpu.weight写入处理
static int cpu_weight_write_u64(struct cgroup_subsys_state *css, 
                                struct cftype *cftype, u64 weight)
{
    struct task_group *tg = css_tg(css);
    
    // 更新任务组权重
    tg->shares = scale_load(weight);
    
    // 更新每个CPU上的调度实体权重
    for_each_possible_cpu(i) {
        struct sched_entity *se = tg->se[i];
        update_load_set(&se->load, tg->shares);
        
        // 重新计算CFS队列权重
        struct cfs_rq *cfs_rq = tg->cfs_rq[i];
        update_cfs_rq_load_avg(cfs_rq);
    }
    
    return 0;
}
```

#### 2. cpu.max配置传播

```c
// cpu.max写入处理  
static int cpu_max_write(struct cgroup_subsys_state *css,
                        struct cftype *cftype, char *buf)
{
    struct task_group *tg = css_tg(css);
    u64 quota, period, burst = 0;
    
    // 解析配置 "quota period [burst]"
    parse_cpu_max(buf, &quota, &period, &burst);
    
    // 更新带宽控制参数
    tg->cfs_bandwidth.quota = quota;
    tg->cfs_bandwidth.period = period;
    tg->cfs_bandwidth.burst = burst;
    
    // 启动带宽控制
    start_cfs_bandwidth(&tg->cfs_bandwidth);
    
    return 0;
}
```

### 实际运行时的协调机制

#### 1. 调度时的层次化决策

```bash
# 示例：三层cgroup结构的调度
/sys/fs/cgroup/
├── production.slice/          # L1: 生产环境 (weight=800)
│   ├── web.service/          # L2: Web服务 (weight=600)  
│   │   ├── nginx-1           # L3: 具体进程 (nice=0)
│   │   └── nginx-2           # L3: 具体进程 (nice=0)
│   └── db.service/           # L2: 数据库服务 (weight=400)
│       ├── mysql-1           # L3: 具体进程 (nice=-5)
│       └── mysql-2           # L3: 具体进程 (nice=0)
└── development.slice/         # L1: 开发环境 (weight=200)
    └── test.service/          # L2: 测试服务 (weight=100)
        └── test-app           # L3: 具体进程 (nice=5)
```

**最终CPU分配计算**：
```
nginx-1进程的CPU分配 = (800/1000) × (600/1000) × (1024/1024) = 48%
mysql-1进程的CPU分配 = (800/1000) × (400/1000) × (1448/1472) ≈ 31.4%
test-app进程的CPU分配 = (200/1000) × (100/100) × (335/335) = 20%
```

#### 2. 监控和调试接口

```bash
# 查看层次化调度状态
#!/bin/bash
show_cgroup_hierarchy() {
    local cgroup_path=$1
    local level=${2:-0}
    local indent=$(printf "%*s" $((level * 2)) "")
    
    echo "${indent}$(basename $cgroup_path)"
    
    # 显示权重和使用量
    if [ -f "$cgroup_path/cpu.weight" ]; then
        local weight=$(cat $cgroup_path/cpu.weight)
        echo "${indent}  weight: $weight"
    fi
    
    if [ -f "$cgroup_path/cpu.stat" ]; then
        local usage=$(grep usage_usec $cgroup_path/cpu.stat | cut -d' ' -f2)
        echo "${indent}  usage: ${usage}μs"
    fi
    
    # 递归显示子cgroup
    for child in $cgroup_path/*/; do
        [ -d "$child" ] && show_cgroup_hierarchy "$child" $((level + 1))
    done
}

# 使用示例
show_cgroup_hierarchy /sys/fs/cgroup
```

这种深度集成确保了cgroup的配置能够精确地转换为调度器的行为，实现了从用户配置到内核调度的完整链路控制。

## 权重体系与层次化控制

### 双重权重机制

Linux CFS调度器实现了两级权重控制体系，实现了粗粒度和细粒度的精确资源控制：

#### 第一级：cgroup cpu.weight (粗粒度控制)

**作用范围**：任务组（cgroup）级别的资源分配
**控制对象**：任务组的group scheduling entity权重
**影响机制**：决定任务组在系统中的CPU分配比例

```c
// cgroup权重到调度器权重的转换
static unsigned long cpu_shares_to_weight(unsigned long shares)
{
    // cgroup v2: cpu.weight范围 [1, 10000]，默认100
    // 转换为内核权重：weight = shares * 1024 / 100
    return scale_load(DIV_ROUND_UP(shares * 1024, 100));
}

// 任务组权重应用
struct task_group {
    unsigned long shares;           // 对应cpu.weight值
    struct sched_entity **se;       // 每CPU的组调度实体
};

// 更新组调度实体权重
void update_group_weight(struct task_group *tg)
{
    for_each_possible_cpu(cpu) {
        struct sched_entity *se = tg->se[cpu];
        se->load.weight = cpu_shares_to_weight(tg->shares);
    }
}
```

#### 第二级：进程 se.load.weight (细粒度控制)

**作用范围**：单个进程级别的资源分配
**控制对象**：进程调度实体的权重
**影响机制**：决定进程在任务组内的CPU分配比例

```c
// nice值到权重的映射表
static const int prio_to_weight[40] = {
    /* -20 */     88761,     71755,     56483,     46273,     36291,
    /* -15 */     29154,     23254,     18705,     14949,     11916,
    /* -10 */      9548,      7620,      6100,      4904,      3906,
    /*  -5 */      3121,      2501,      1991,      1586,      1277,
    /*   0 */      1024,       820,       655,       526,       423,
    /*   5 */       335,       272,       215,       172,       137,
    /*  10 */       110,        87,        70,        56,        45,
    /*  15 */        36,        29,        23,        18,        15,
};

// 进程权重计算
static void set_load_weight(struct task_struct *p, bool update_load)
{
    int prio = p->static_prio - MAX_RT_PRIO;
    struct load_weight *load = &p->se.load;
    
    // 根据nice值设置权重
    load->weight = scale_load(prio_to_weight[prio]);
    load->inv_weight = prio_to_wmult[prio];
}
```

### 层次化CPU分配计算

#### 数学模型

对于进程P在cgroup C中的最终CPU分配：

```
CPU_allocation(P) = System_CPU × 
    (Weight_cgroup(C) / Sum_weights_all_cgroups) × 
    (Weight_process(P) / Sum_weights_in_cgroup(C))
```

#### 实际计算示例

假设8核系统中的配置：

```bash
# 系统配置
/sys/fs/cgroup/
├── high-priority/     # cpu.weight = 400
│   ├── proc-A        # nice = -10 (weight = 9548)
│   └── proc-B        # nice = 0   (weight = 1024)
├── normal-priority/   # cpu.weight = 100  
│   ├── proc-C        # nice = 0   (weight = 1024)
│   └── proc-D        # nice = 5   (weight = 335)
└── low-priority/      # cpu.weight = 50
    └── proc-E        # nice = 10  (weight = 110)
```

**第一级分配（cgroup间）**：
```
total_cgroup_weight = 400 + 100 + 50 = 550

high-priority分配 = 8核 × (400/550) ≈ 5.82核
normal-priority分配 = 8核 × (100/550) ≈ 1.45核  
low-priority分配 = 8核 × (50/550) ≈ 0.73核
```

**第二级分配（cgroup内）**：
```
# high-priority组内分配
high_group_weight = 9548 + 1024 = 10572
proc-A分配 = 5.82核 × (9548/10572) ≈ 5.26核
proc-B分配 = 5.82核 × (1024/10572) ≈ 0.56核

# normal-priority组内分配  
normal_group_weight = 1024 + 335 = 1359
proc-C分配 = 1.45核 × (1024/1359) ≈ 1.09核
proc-D分配 = 1.45核 × (335/1359) ≈ 0.36核

# low-priority组内分配
proc-E分配 = 0.73核 × (110/110) = 0.73核
```

### 权重动态调整机制

#### 运行时权重更新

```c
// 动态调整cgroup权重
static void update_cgroup_weight_runtime(struct task_group *tg, 
                                       unsigned long new_weight)
{
    unsigned long old_weight = tg->shares;
    tg->shares = new_weight;
    
    // 更新每个CPU上的组调度实体
    for_each_possible_cpu(cpu) {
        struct sched_entity *se = tg->se[cpu];
        struct cfs_rq *cfs_rq = cfs_rq_of(se);
        
        raw_spin_lock(&cfs_rq->rq->lock);
        
        // 更新权重
        update_load_set(&se->load, scale_load(new_weight));
        
        // 重新计算队列总权重
        update_cfs_rq_load_avg(cfs_rq);
        
        // 触发重新调度
        resched_curr(cpu_of(cfs_rq->rq));
        
        raw_spin_unlock(&cfs_rq->rq->lock);
    }
}

// 动态调整进程nice值
void set_user_nice(struct task_struct *p, long nice)
{
    struct rq *rq = task_rq_lock(p);
    
    // 更新进程优先级和权重
    p->static_prio = NICE_TO_PRIO(nice);
    set_load_weight(p, true);
    
    // 如果进程正在运行，重新计算vruntime
    if (task_current(rq, p)) {
        struct cfs_rq *cfs_rq = cfs_rq_of(&p->se);
        update_curr(cfs_rq);
        
        // 重新normalize vruntime
        place_entity(cfs_rq, &p->se, 0);
    }
    
    task_rq_unlock(rq);
}
```

#### 权重变化的影响传播

```c
// 权重变化对vruntime的影响
static void reweight_entity(struct cfs_rq *cfs_rq, struct sched_entity *se,
                           unsigned long weight)
{
    unsigned long old_weight = se->load.weight;
    
    if (se->on_rq) {
        // 从红黑树中移除
        dequeue_entity(cfs_rq, se, DEQUEUE_SAVE | DEQUEUE_MOVE);
    }
    
    // 更新权重
    update_load_set(&se->load, weight);
    
    // 调整vruntime以保持公平性
    if (se->on_rq) {
        // vruntime需要按权重比例调整
        se->vruntime = div_u64(se->vruntime * old_weight, weight);
        
        // 重新加入红黑树
        enqueue_entity(cfs_rq, se, ENQUEUE_RESTORE | ENQUEUE_MOVE);
    }
}
```

### 权重监控和调试

#### 权重状态查看脚本

```bash
#!/bin/bash
# cfs_weight_monitor.sh - CFS权重监控脚本

show_weight_hierarchy() {
    echo "=== CFS权重层次结构 ==="
    
    # 显示cgroup权重
    find /sys/fs/cgroup -name "cpu.weight" -type f | while read -r weight_file; do
        local cgroup_path=$(dirname "$weight_file")
        local cgroup_name=$(basename "$cgroup_path")
        local weight=$(cat "$weight_file")
        local procs_count=$(cat "$cgroup_path/cgroup.procs" | wc -l)
        
        echo "cgroup: $cgroup_name"
        echo "  权重: $weight"
        echo "  进程数: $procs_count"
        
        # 显示该cgroup中进程的nice值分布
        if [ $procs_count -gt 0 ]; then
            echo "  进程nice值分布:"
            cat "$cgroup_path/cgroup.procs" | while read -r pid; do
                if [ -n "$pid" ] && [ -d "/proc/$pid" ]; then
                    local nice=$(ps -o nice= -p "$pid" 2>/dev/null | tr -d ' ')
                    local comm=$(ps -o comm= -p "$pid" 2>/dev/null)
                    echo "    PID $pid ($comm): nice=$nice"
                fi
            done
        fi
        echo
    done
}

# 权重变化监控
monitor_weight_changes() {
    echo "=== 监控权重变化 ==="
    
    local temp_file="/tmp/weight_snapshot_$$"
    
    # 创建初始快照
    find /sys/fs/cgroup -name "cpu.weight" -exec cat {} + > "$temp_file.old"
    
    while true; do
        sleep 5
        find /sys/fs/cgroup -name "cpu.weight" -exec cat {} + > "$temp_file.new"
        
        if ! diff -q "$temp_file.old" "$temp_file.new" >/dev/null 2>&1; then
            echo "[$(date)] 检测到权重变化:"
            diff "$temp_file.old" "$temp_file.new" || true
            cp "$temp_file.new" "$temp_file.old"
        fi
    done
    
    rm -f "$temp_file.old" "$temp_file.new"
}

# CPU分配效果验证
verify_cpu_allocation() {
    echo "=== 验证CPU分配效果 ==="
    
    # 运行CPU密集型测试
    for cgroup_dir in /sys/fs/cgroup/*/; do
        [ -d "$cgroup_dir" ] || continue
        
        local cgroup_name=$(basename "$cgroup_dir")
        local weight=$(cat "$cgroup_dir/cpu.weight" 2>/dev/null || echo "N/A")
        
        echo "测试cgroup: $cgroup_name (权重: $weight)"
        
        # 启动测试进程
        stress-ng --cpu 1 --timeout 10s &
        local stress_pid=$!
        
        # 将进程加入cgroup
        echo $stress_pid > "$cgroup_dir/cgroup.procs" 2>/dev/null || continue
        
        # 监控CPU使用率
        local start_time=$(date +%s)
        local cpu_usage=0
        
        while kill -0 $stress_pid 2>/dev/null; do
            local cpu_percent=$(ps -o %cpu= -p $stress_pid 2>/dev/null | tr -d ' ')
            if [ -n "$cpu_percent" ]; then
                cpu_usage=$cpu_percent
            fi
            sleep 1
        done
        
        echo "  实际CPU使用率: ${cpu_usage}%"
        echo
    done
}

# 主函数
case "${1:-show}" in
    "show")
        show_weight_hierarchy
        ;;
    "monitor")
        monitor_weight_changes
        ;;
    "verify")
        verify_cpu_allocation
        ;;
    *)
        echo "用法: $0 [show|monitor|verify]"
        echo "  show    - 显示权重层次结构"
        echo "  monitor - 监控权重变化"
        echo "  verify  - 验证CPU分配效果"
        ;;
esac
```

这个双重权重机制确保了Linux系统能够在不同层次上精确控制CPU资源分配，既满足了系统级的资源隔离需求，又保持了进程级的公平调度特性。

## CPU性能控制机制

### cpu.uclamp性能控制原理

在cgroup CPU控制中，`cpu.uclamp.*`接口控制的"性能"指的是**CPU频率/电压状态（P-states）**，而不是传统意义上的时间片分配。这是一种基于动态电压频率调节（DVFS）的性能管理机制。

#### 性能概念辨析

**传统认知误区**：
- ❌ 性能 = 时间片长度
- ❌ 性能 = CPU使用率百分比
- ❌ 性能 = 调度优先级

**实际含义**：
- ✅ 性能 = CPU运行频率档位
- ✅ 性能 = 处理器电压/频率状态
- ✅ 性能 = 单位时间内的计算能力

#### CPU频率调节机制（DVFS）

```c
// CPU性能状态定义
struct cpufreq_policy {
    unsigned int min;           // 最小频率 (MHz)
    unsigned int max;           // 最大频率 (MHz)  
    unsigned int cur;           // 当前频率 (MHz)
    struct cpufreq_governor *governor;  // 调频器
};

// P-states频率档位示例
static struct cpu_freq_table freq_table[] = {
    {0, 800000},   // P4: 0.8GHz (节能模式)
    {1, 1200000},  // P3: 1.2GHz
    {2, 1800000},  // P2: 1.8GHz  
    {3, 2400000},  // P1: 2.4GHz
    {4, 3200000},  // P0: 3.2GHz (性能模式)
    {5, CPUFREQ_TABLE_END}
};
```

#### uclamp与频率控制的映射

```c
// utilization clamp到频率的转换
static unsigned long uclamp_util_to_freq(struct rq *rq, 
                                        unsigned long util,
                                        enum uclamp_id clamp_id)
{
    struct cpufreq_policy *policy = cpufreq_cpu_get(cpu_of(rq));
    unsigned long freq;
    
    // util范围 [0, 1024] 映射到频率范围
    if (clamp_id == UCLAMP_MIN) {
        // cpu.uclamp.min: 保证最低频率
        freq = policy->min + (util * (policy->max - policy->min)) / 1024;
    } else {
        // cpu.uclamp.max: 限制最高频率  
        freq = policy->min + (util * (policy->max - policy->min)) / 1024;
        freq = min(freq, policy->max);
    }
    
    return freq;
}

// 调频器接收uclamp信号
void schedutil_update_freq(struct update_util_data *hook, u64 time, 
                          unsigned int flags)
{
    struct sugov_cpu *sg_cpu = container_of(hook, struct sugov_cpu, update_util);
    struct rq *rq = cpu_rq(sg_cpu->cpu);
    
    // 获取当前CPU利用率
    unsigned long util = cpu_util_cfs(rq);
    
    // 应用uclamp约束
    util = uclamp_rq_util_with(rq, util, NULL);
    
    // 转换为目标频率
    unsigned long freq = map_util_freq(util, sg_cpu->max, sg_cpu->cpu);
    
    // 请求调频
    sugov_update_freq(sg_cpu, time, freq);
}
```

### 频率固定性与等效控制

#### CPU频率的短期固定性

现代CPU在极短时间内（微秒级别）确实保持固定频率，但这并不影响uclamp的有效性：

```c
// CPU频率切换的时间特性
struct freq_switch_timing {
    u64 switch_latency;     // 频率切换延迟: 10-100μs
    u64 stable_duration;    // 稳定运行时间: 1-10ms
    u64 decision_interval;  // 调频决策间隔: 4-20ms
};

// 在稳定周期内，频率确实固定
static bool is_freq_stable(u64 time_since_switch) 
{
    return time_since_switch < switch_timing.stable_duration;
}
```

#### uclamp的等效控制机制

当无法精确匹配目标频率时，系统采用**频率+时间片组合控制**：

```c
// 等效性能控制算法
static void apply_uclamp_control(struct task_struct *p, struct rq *rq)
{
    unsigned long target_util = uclamp_eff_value(p, UCLAMP_MAX);
    unsigned long current_freq = cpufreq_quick_get(cpu_of(rq));
    unsigned long target_freq = util_to_freq(target_util);
    
    if (target_freq <= current_freq) {
        // 目标频率 <= 当前频率，通过时间片限制实现
        u64 max_runtime = calc_runtime_limit(target_freq, current_freq);
        p->se.uclamp_runtime_limit = max_runtime;
        
        // 示例：目标2GHz，当前3GHz
        // 时间片限制 = (2GHz/3GHz) × 正常时间片 ≈ 67%时间片
    } else {
        // 目标频率 > 当前频率，请求提频
        cpufreq_update_util(rq, SCHED_CPUFREQ_UTIL_UPDATE);
        p->se.uclamp_runtime_limit = UCLAMP_NO_LIMIT;
    }
}
```

#### 实际效果验证

```bash
#!/bin/bash
# uclamp_freq_test.sh - uclamp频率控制测试

test_uclamp_frequency() {
    local test_cgroup="/sys/fs/cgroup/uclamp-test"
    
    # 创建测试cgroup
    mkdir -p "$test_cgroup"
    
    echo "=== uclamp频率控制测试 ==="
    
    # 测试场景1：限制最大性能到50%
    echo "50" > "$test_cgroup/cpu.uclamp.max"
    echo "0" > "$test_cgroup/cpu.uclamp.min"
    
    echo "场景1：限制最大性能到50%"
    
    # 启动CPU密集型任务
    stress-ng --cpu 1 --timeout 10s &
    local stress_pid=$!
    echo $stress_pid > "$test_cgroup/cgroup.procs"
    
    # 监控频率变化
    echo "监控CPU频率变化："
    for i in {1..10}; do
        local freq=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq)
        local util=$(cat "$test_cgroup/cpu.stat" | grep usage_usec | awk '{print $2}')
        echo "  时间${i}s: 频率=${freq}MHz, 累计使用=${util}μs"
        sleep 1
    done
    
    wait $stress_pid
    
    # 测试场景2：提升最小性能到80%
    echo "80" > "$test_cgroup/cpu.uclamp.min"
    echo "100" > "$test_cgroup/cpu.uclamp.max"
    
    echo "场景2：提升最小性能到80%"
    
    # 启动低CPU使用率任务
    sleep 10 &
    local sleep_pid=$!
    echo $sleep_pid > "$test_cgroup/cgroup.procs"
    
    # 监控频率提升效果
    echo "监控低负载下的频率提升："
    for i in {1..5}; do
        local freq=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq)
        echo "  时间${i}s: 频率=${freq}MHz"
        sleep 1
    done
    
    kill $sleep_pid 2>/dev/null
    
    # 清理
    rmdir "$test_cgroup"
}

# 频率档位查看
show_freq_levels() {
    echo "=== CPU频率档位信息 ==="
    
    local cpu=0
    echo "CPU$cpu 可用频率档位："
    cat /sys/devices/system/cpu/cpu$cpu/cpufreq/scaling_available_frequencies
    
    echo "当前调频器："
    cat /sys/devices/system/cpu/cpu$cpu/cpufreq/scaling_governor
    
    echo "频率范围："
    echo "  最小: $(cat /sys/devices/system/cpu/cpu$cpu/cpufreq/cpuinfo_min_freq)MHz"
    echo "  最大: $(cat /sys/devices/system/cpu/cpu$cpu/cpufreq/cpuinfo_max_freq)MHz"
    echo "  当前: $(cat /sys/devices/system/cpu/cpu$cpu/cpufreq/scaling_cur_freq)MHz"
}

# 执行测试
show_freq_levels
test_uclamp_frequency
```

### uclamp配置实例

#### 典型应用场景配置

```bash
# 1. 省电模式：限制最大性能
mkdir -p /sys/fs/cgroup/power-save
echo "30" > /sys/fs/cgroup/power-save/cpu.uclamp.max  # 限制30%性能
echo "0" > /sys/fs/cgroup/power-save/cpu.uclamp.min   # 允许最低频率

# 2. 性能模式：保证最小性能  
mkdir -p /sys/fs/cgroup/high-perf
echo "80" > /sys/fs/cgroup/high-perf/cpu.uclamp.min   # 保证80%性能
echo "100" > /sys/fs/cgroup/high-perf/cpu.uclamp.max  # 允许最高频率

# 3. 稳定模式：固定性能区间
mkdir -p /sys/fs/cgroup/stable
echo "50" > /sys/fs/cgroup/stable/cpu.uclamp.min      # 最低50%性能
echo "70" > /sys/fs/cgroup/stable/cpu.uclamp.max      # 最高70%性能

# 4. 移动应用优化
mkdir -p /sys/fs/cgroup/mobile-app
echo "40" > /sys/fs/cgroup/mobile-app/cpu.uclamp.min  # 保证响应性
echo "60" > /sys/fs/cgroup/mobile-app/cpu.uclamp.max  # 控制功耗
```

这种基于频率的性能控制机制，与传统的时间片控制形成了互补，为不同应用场景提供了更精细化的资源管理能力。

### se.load.weight与cgroup cpu.weight的关系分析

#### 双重权重控制体系

Linux CFS调度器实现了精妙的两级权重控制机制：

```
第一级: cgroup cpu.weight
    ↓ (影响任务组调度实体权重)
第二级: se.load.weight  
    ↓ (基于nice值的进程权重)
最终CPU分配
```

**权重映射关系**：
```bash
# 第一级：cgroup权重转换
group_se_weight = cpu.weight × 1024 ÷ 100

# 第二级：nice值权重映射  
se.load.weight = prio_to_weight[nice + 20]

# 最终分配计算
CPU_allocation = (group_weight / total_group_weights) × (se_weight / group_se_weights)
```

#### 权重层次分析脚本

```bash
#!/bin/bash
# weight_hierarchy_analyzer.sh - 权重层次关系完整分析

analyze_weight_hierarchy_complete() {
    local pid=$1
    
    echo "=========================================="
    echo "CFS权重层次关系完整分析"
    echo "=========================================="
    
    # 获取进程基本信息
    local comm=$(ps -p $pid -o comm= 2>/dev/null)
    local nice=$(ps -p $pid -o nice= 2>/dev/null | tr -d ' ')
    local se_weight=$(awk '/^se\.load\.weight/ {print $3}' /proc/$pid/sched 2>/dev/null)
    local prio=$(awk '/^prio/ {print $3}' /proc/$pid/sched 2>/dev/null)
    
    echo "进程信息:"
    echo "  PID: $pid"
    echo "  命令: $comm"
    echo "  Nice值: $nice"
    echo "  内核优先级: $prio"
    echo "  se.load.weight: $se_weight"
    echo
    
    # 分析第二级权重控制（进程级）
    echo "=== 第二级：进程权重控制 (se.load.weight) ==="
    echo "控制机制: Nice值 → 权重映射表 → se.load.weight"
    
    # 验证nice值到权重的映射
    local expected_weight
    case $nice in
        -20) expected_weight=88761 ;;
        -15) expected_weight=29154 ;;
        -10) expected_weight=9548 ;;
        -5)  expected_weight=3121 ;;
        0)   expected_weight=1024 ;;
        5)   expected_weight=335 ;;
        10)  expected_weight=110 ;;
        15)  expected_weight=36 ;;
        19)  expected_weight=15 ;;
        *)   
            # 近似计算
            local index=$((nice + 20))
            expected_weight="约$(echo "1024 / (1.25^$nice)" | bc -l | cut -d. -f1)"
            ;;
    esac
    
    echo "Nice值映射验证:"
    echo "  输入Nice值: $nice"
    echo "  实际se.load.weight: $se_weight" 
    echo "  期望权重: $expected_weight"
    
    if [ "$se_weight" = "$expected_weight" ]; then
        echo "  ✓ 权重映射正确"
    else
        echo "  ! 权重映射异常 (可能由于实时策略或权重继承)"
    fi
    
    # 权重相对比例分析
    local weight_ratio=$(echo "scale=2; $se_weight / 1024" | bc)
    echo "  相对标准权重比例: $weight_ratio (标准nice=0为1.0)"
    echo
    
    # 分析第一级权重控制（cgroup级）
    echo "=== 第一级：cgroup权重控制 (cpu.weight) ==="
    echo "控制机制: cpu.weight → 任务组调度实体权重"
    
    # 查找进程所属cgroup
    local cgroup_info=$(cat /proc/$pid/cgroup 2>/dev/null | grep "::")
    local cgroup_path=$(echo "$cgroup_info" | cut -d: -f3)
    
    if [ -z "$cgroup_path" ]; then
        cgroup_path="/"
    fi
    
    echo "cgroup层次信息:"
    echo "  完整cgroup路径: $cgroup_path"
    
    # 遍历cgroup层次，显示权重继承
    local current_path="$cgroup_path"
    local level=0
    
    while [ "$current_path" != "/" ] && [ $level -lt 5 ]; do
        local weight_file="/sys/fs/cgroup$current_path/cpu.weight"
        local weight="N/A"
        
        if [ -f "$weight_file" ]; then
            weight=$(cat "$weight_file" 2>/dev/null)
        fi
        
        echo "  级别 $level: $(basename "$current_path") → cpu.weight=$weight"
        
        # 上移一级
        current_path=$(dirname "$current_path")
        level=$((level + 1))
    done
    
    # 获取直接所属cgroup的权重
    local direct_weight_file="/sys/fs/cgroup$cgroup_path/cpu.weight"
    local cgroup_weight=100  # 默认值
    
    if [ -f "$direct_weight_file" ]; then
        cgroup_weight=$(cat "$direct_weight_file")
        echo "  直接所属cgroup权重: $cgroup_weight"
    else
        echo "  无法读取cgroup权重文件 (权限或路径问题)"
    fi
    
    # 计算组调度实体权重
    local group_se_weight=$((cgroup_weight * 1024 / 100))
    echo "  转换后的组SE权重: $group_se_weight"
    echo "  转换公式: group_weight = cpu.weight × 1024 ÷ 100"
    echo
    
    # 最终CPU分配计算示例
    echo "=== 最终CPU分配计算 ==="
    echo "双重权重影响机制:"
    echo "  1. cgroup级别: 决定任务组在系统中的CPU分配比例"
    echo "  2. 进程级别: 决定进程在任务组内的CPU分配比例"
    echo
    echo "数学模型:"
    echo "  CPU_allocation(进程) = System_CPU × (cgroup_weight/Σcgroup_weights) × (se_weight/Σse_weights_in_group)"
    echo
    echo "当前进程的权重贡献:"
    echo "  cgroup级权重: $cgroup_weight (影响组间分配)"
    echo "  进程级权重: $se_weight (影响组内分配)"
    echo "  nice值影响: nice=$nice → 相对权重倍数=$weight_ratio"
    echo
    
    # 权重调整建议
    echo "=== 权重调整建议 ==="
    echo "提高此进程CPU分配的方法:"
    echo "  1. 调整进程nice值:"
    echo "     renice -5 $pid    # 降低nice值，提高进程权重"
    echo "  2. 调整cgroup权重:"
    echo "     echo 200 > /sys/fs/cgroup$cgroup_path/cpu.weight"
    echo "  3. 组合调整示例:"
    echo "     # 先调整cgroup权重(影响整组)"
    echo "     echo 150 > /sys/fs/cgroup$cgroup_path/cpu.weight"
    echo "     # 再调整进程优先级(影响组内地位)"  
    echo "     renice -2 $pid"
    echo
    
    echo "权重影响分析:"
    if [ $nice -lt 0 ]; then
        echo "  当前状态: 高优先级进程 (nice=$nice < 0)"
        echo "  vruntime增长: 慢于标准速度 (权重=$se_weight > 1024)"
        echo "  调度优势: 在组内更容易获得CPU时间"
    elif [ $nice -gt 0 ]; then
        echo "  当前状态: 低优先级进程 (nice=$nice > 0)"  
        echo "  vruntime增长: 快于标准速度 (权重=$se_weight < 1024)"
        echo "  调度劣势: 在组内较难获得CPU时间"
    else
        echo "  当前状态: 标准优先级进程 (nice=0)"
        echo "  vruntime增长: 标准速度 (权重=1024)"
        echo "  调度地位: 在组内处于平均水平"
    fi
}

# 权重变化实时监控
monitor_weight_effects() {
    local pid=$1
    local duration=${2:-30}
    
    echo "=========================================="
    echo "权重效果实时监控"
    echo "=========================================="
    echo "监控进程: $pid"
    echo "监控时长: ${duration}秒"
    echo "监控间隔: 1秒"
    echo
    
    # 记录初始状态
    local initial_vruntime=$(awk '/^se\.vruntime/ {print $3}' /proc/$pid/sched)
    local initial_runtime=$(awk '/^se\.sum_exec_runtime/ {print $3}' /proc/$pid/sched)
    local weight=$(awk '/^se\.load\.weight/ {print $3}' /proc/$pid/sched)
    
    echo "初始状态:"
    echo "  vruntime: $initial_vruntime"
    echo "  sum_exec_runtime: $initial_runtime"  
    echo "  权重: $weight"
    echo "  理论vruntime增长率: $(echo "scale=6; 1024 / $weight" | bc)"
    echo
    
    printf "%-8s %-12s %-12s %-8s %-10s %-8s\n" "时间" "vruntime" "runtime" "权重" "增长率" "准确度"
    printf "%-8s %-12s %-12s %-8s %-10s %-8s\n" "----" "--------" "-------" "----" "------" "------"
    
    local prev_vruntime=$initial_vruntime
    local prev_runtime=$initial_runtime
    local count=0
    
    while [ $count -lt $duration ]; do
        sleep 1
        count=$((count + 1))
        
        if [ -f "/proc/$pid/sched" ]; then
            local current_vruntime=$(awk '/^se\.vruntime/ {print $3}' /proc/$pid/sched)
            local current_runtime=$(awk '/^se\.sum_exec_runtime/ {print $3}' /proc/$pid/sched)
            local current_weight=$(awk '/^se\.load\.weight/ {print $3}' /proc/$pid/sched)
            
            # 计算增量
            local vruntime_delta=$((current_vruntime - prev_vruntime))
            local runtime_delta=$((current_runtime - prev_runtime))
            
            # 计算增长率和准确度
            local growth_rate="N/A"
            local accuracy="N/A"
            
            if [ "$runtime_delta" -gt 0 ]; then
                growth_rate=$(echo "scale=4; $vruntime_delta / $runtime_delta" | bc)
                local theoretical_rate=$(echo "scale=4; 1024 / $current_weight" | bc)
                accuracy=$(echo "scale=1; 100 - (($growth_rate - $theoretical_rate) * 100 / $theoretical_rate)" | bc 2>/dev/null)
                [ -z "$accuracy" ] && accuracy="N/A"
            fi
            
            printf "%-8s %-12s %-12s %-8s %-10s %-8s\n" \
                "${count}s" \
                "$(echo "scale=2; $current_vruntime/1000000" | bc)ms" \
                "$(echo "scale=3; $current_runtime/1000000000" | bc)s" \
                "$current_weight" \
                "$growth_rate" \
                "${accuracy}%"
            
            prev_vruntime=$current_vruntime
            prev_runtime=$current_runtime
        else
            echo "进程 $pid 已退出"
            break
        fi
    done
    
    echo
    echo "监控完成。分析总结:"
    
    # 计算总体统计
    if [ -f "/proc/$pid/sched" ]; then
        local final_vruntime=$(awk '/^se\.vruntime/ {print $3}' /proc/$pid/sched)
        local final_runtime=$(awk '/^se\.sum_exec_runtime/ {print $3}' /proc/$pid/sched)
        
        local total_vruntime_delta=$((final_vruntime - initial_vruntime))
        local total_runtime_delta=$((final_runtime - initial_runtime))
        
        echo "  总vruntime增量: $total_vruntime_delta ns"
        echo "  总runtime增量: $total_runtime_delta ns"
        
        if [ "$total_runtime_delta" -gt 0 ]; then
            local avg_growth_rate=$(echo "scale=6; $total_vruntime_delta / $total_runtime_delta" | bc)
            local theoretical_rate=$(echo "scale=6; 1024 / $weight" | bc)
            local overall_accuracy=$(echo "scale=1; 100 - (($avg_growth_rate - $theoretical_rate) * 100 / $theoretical_rate)" | bc 2>/dev/null)
            
            echo "  平均增长率: $avg_growth_rate"
            echo "  理论增长率: $theoretical_rate"  
            echo "  整体准确度: ${overall_accuracy}%"
            
            if [ "$(echo "${overall_accuracy#-} > 95" | bc 2>/dev/null)" -eq 1 ]; then
                echo "  ✓ 权重控制机制工作正常"
            else
                echo "  ⚠️  权重控制存在偏差，可能受其他因素影响"
            fi
        else
            echo "  进程在监控期间未活跃运行"
        fi
    fi
}

# 主函数
main() {
    case "${1:-help}" in
        "analyze")
            [ -z "$2" ] && { echo "用法: $0 analyze <PID>"; exit 1; }
            analyze_weight_hierarchy_complete "$2"
            ;;
        "monitor")  
            [ -z "$2" ] && { echo "用法: $0 monitor <PID> [时长秒数]"; exit 1; }
            monitor_weight_effects "$2" "${3:-30}"
            ;;
        "help")
            echo "权重层次关系分析工具"
            echo "====================="
            echo "用法: $0 <command> [参数]"
            echo
            echo "命令:"
            echo "  analyze <PID>           - 完整的权重层次关系分析"
            echo "  monitor <PID> [时长]    - 实时监控权重效果"  
            echo "  help                    - 显示此帮助"
            echo
            echo "示例:"
            echo "  $0 analyze 1234         - 分析PID 1234的权重关系"
            echo "  $0 monitor 1234 60      - 监控PID 1234权重效果60秒"
            ;;
        *)
            echo "未知命令: $1"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
}

# 如果直接执行脚本
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
```

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