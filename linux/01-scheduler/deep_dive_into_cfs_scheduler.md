一、引言
疑问一：什么是throttle？为什么会出现throttle？
集群中某些应用突然响应变慢
监控显示CPU使用率并不高，但应用性能下降
疑问二：多核多租户环境下，cgroup是如何实现CPU资源隔离的？
多个应用部署在同一台机器上
如何保证各应用之间不会相互影响
资源分配的公平性如何保证
疑问三：K8s中Pod的cpu.limits和cpu.request分别如何影响程序运行？
cpu.request只在Pod调度时有效吗？
cpu.limits设置后为什么还会被throttle？
所有这些问题的答案都与Linux的CFS（Completely Fair Scheduler）调度器密切相关：

throttle机制是CFS带宽控制的核心特性
cgroup的CPU资源隔离依赖于CFS的调度算法
k8s的CPU资源管理最终都会映射到CFS的相关参数
二、Linux调度器的演进
O(n)调度器


工作原理
遍历所有可运行进程
计算每个进程的优先级
选择优先级最高的进程运行
局限性
时间复杂度为O(n)，进程数量增加时性能下降
缺乏对多处理器系统的优化
交互性能不佳
O(1)调度器


工作原理
使用两个优先级队列（active和expired）进行时间片轮转
通过位图快速定位最高优先级任务，保证O(1)时间复杂度
动态调整进程优先级以平衡交互性和公平性
局限性
复杂的启发式算法难以预测和调优
对交互式任务的处理仍不够理想
代码复杂度高，难以维护和调试
CFS（Completely Fair Scheduler）调度器
CFS的设计目标
完全公平的CPU时间分配
简单而优雅的设计
良好的交互性能
可扩展性
三、基础知识
进程与线程的统一模型
在Linux内核中，进程和线程都被抽象为"任务"（task），使用统一的数据结构`task_struct`来表示。这种设计简化了内核的复杂性，也是Linux调度器能够统一处理各种执行单元的基础。

struct task_struct {
    // 调度相关字段
    int prio, static_prio, normal_prio;    // 优先级
    struct sched_entity se;                // CFS调度实体
    struct sched_rt_entity rt;             // 实时调度实体
    struct sched_dl_entity dl;             // Deadline调度实体
     
    // 进程标识
    pid_t pid;                             // 进程ID
    pid_t tgid;                            // 线程组ID（主线程PID）
     
    // 内存管理
    struct mm_struct *mm;                  // 内存描述符
    struct mm_struct *active_mm;           // 活跃内存描述符
     
    // 文件系统
    struct fs_struct *fs;                  // 文件系统信息
    struct files_struct *files;            // 打开文件表
     
    // 信号处理
    struct signal_struct *signal;          // 信号描述符
    struct sighand_struct *sighand;        // 信号处理程序
     
    // 父子关系
    struct task_struct *parent;            // 父任务
    struct list_head children;             // 子任务列表
    struct list_head sibling;              // 兄弟任务列表
     
    // 状态和标志
    long state;                            // 任务状态
    unsigned int flags;                    // 任务标志
     
    // 时间统计
    u64 utime, stime;                      // 用户态/内核态时间
    u64 start_time;                        // 启动时间
};
任务状态
/* 核心状态位 */
#define TASK_RUNNING            0x0000    /* 运行状态 */
#define TASK_INTERRUPTIBLE      0x0001    /* 可中断睡眠 */
#define TASK_UNINTERRUPTIBLE    0x0002    /* 不可中断睡眠 */
#define __TASK_STOPPED          0x0004    /* 任务被停止 */
#define __TASK_TRACED           0x0008    /* 任务被跟踪 */
  
/* 特殊状态 */
#define TASK_WAKING             0x0200    /* 正在唤醒 */
#define TASK_NEW                0x0800    /* 新创建任务 */
#define TASK_PARKED             0x0040    /* 任务被挂起 */
  
/* 退出状态 */
#define EXIT_ZOMBIE             0x0020    /* 僵尸进程 */
#define EXIT_DEAD               0x0010    /* 进程已死亡 */


系统负载
负载的定义与计算
系统负载（Load Average）表示系统的繁忙程度，包括：

正在运行的任务
等待运行的任务（在运行队列中）
等待I/O的任务（TASK_UNINTERRUPTIBLE状态）

负载计算算法
Linux系统通过指数移动平均算法计算负载：

```c
// kernel/sched/loadavg.c
void calc_global_load(unsigned long ticks)
{
    long active = atomic_long_read(&calc_load_tasks);
    
    avenrun[0] = calc_load(avenrun[0], EXP_1, active);   // 1分钟
    avenrun[1] = calc_load(avenrun[1], EXP_5, active);   // 5分钟
    avenrun[2] = calc_load(avenrun[2], EXP_15, active);  // 15分钟
}

// 指数移动平均计算
static unsigned long calc_load(unsigned long load, unsigned long exp, unsigned long active)
{
    load *= exp;
    load += active * (FIXED_1 - exp);
    load += 1UL << (FSHIFT - 1);
    return load >> FSHIFT;
}
```

负载监控与分析
```bash
# 查看系统负载
uptime
# output: 14:30:12 up 10 days,  3:42,  2 users,  load average: 1.20, 1.35, 1.40

# 详细的负载信息
cat /proc/loadavg
# output: 1.20 1.35 1.40 2/156 12345

# 监控脚本示例
#!/bin/bash
while true; do
    load=$(cat /proc/loadavg | cut -d' ' -f1)
    cpu_count=$(nproc)
    threshold=$(echo "scale=2; $cpu_count * 0.8" | bc)
    
    if (( $(echo "$load > $threshold" | bc -l) )); then
        echo "Warning: High load detected: $load (threshold: $threshold)"
        # 获取高CPU使用进程
        ps aux --sort=-%cpu | head -10
    fi
    sleep 30
done
```
三、CFS调度器原理与实现
CFS的核心思想
"完全公平"调度

每个进程都应该获得相等的CPU时间
通过虚拟时间来衡量公平性
总是选择虚拟时间最小的进程运行
CFS的核心概念
vruntime（虚拟运行时间）
vruntime = 实际运行时间 × (NICE_0_LOAD / 进程权重)
vruntime越小，说明进程获得的CPU时间越少
优先级高的进程权重大，vruntime增长慢
保证了不同优先级进程的公平性
调度周期
调度周期 = (运行任务数 <= 延迟阈值) ? 目标延迟 : 任务数 × 最小粒度
任务数数 ≤ 8：使用固定的24ms调度周期
任务数数 > 8：调度周期 = 进程数 × 3ms
目的：保证每个进程至少获得最小时间片（3ms）
# cat /sys/kernel/debug/sched/latency_ns
24000000
# cat /sys/kernel/debug/sched/min_granularity_ns
3000000
任务时间片
任务时间片 = 调度周期 × (任务权重 / 队列总权重)
任务时间片的计算

static u64 sched_slice(struct cfs_rq *cfs_rq, struct sched_entity *se)
{
    u64 slice = __sched_period(cfs_rq->nr_running + !se->on_rq);
     
    // 处理层次化调度实体
    for_each_sched_entity(se) {
        struct load_weight *load;
        struct load_weight lw;
         
        cfs_rq = cfs_rq_of(se);
        load = &cfs_rq->load;  // 运行队列总权重
         
        // 如果进程不在队列中，需要计算加入后的权重
        if (unlikely(!se->on_rq)) {
            lw = cfs_rq->load;
            update_load_add(&lw, se->load.weight);
            load = &lw;
        }
         
        // 核心公式：时间片 = 调度周期 × (任务权重 / 队列总权重)
        slice = __calc_delta(slice, se->load.weight, load);
    }
     
    return slice;
}
CFS调度流程详解
调度器主要数据结构
CFS运行队列（cfs_rq）

struct cfs_rq {
    struct load_weight load;        // 运行队列总权重
    unsigned int nr_running;        // 可运行进程数
    u64 min_vruntime;              // 最小虚拟运行时间
    struct rb_root tasks_timeline;  // 红黑树根节点
    struct rb_node *rb_leftmost;   // 最左节点缓存
    struct sched_entity *curr;      // 当前运行进程
};
调度实体（sched_entity）

struct sched_entity {
    struct load_weight load;    // 进程权重
    struct rb_node run_node;    // 红黑树节点
    u64 vruntime;              // 虚拟运行时间
    u64 prev_sum_exec_runtime; // 上次执行时间
    u64 sum_exec_runtime;      // 总执行时间
};
调度实体是CFS调度器中的核心抽象，它可以映射为多种不同的调度对象，实现了调度器的灵活性和层次化设计。

进程任务（task_struct）
进程组（task_group），和cgroup有关，后文会介绍
CFS运行队列示意图


进程选择过程（pick_next_task_fair）
static struct task_struct *pick_next_task_fair(struct rq *rq)
{
    struct cfs_rq *cfs_rq = &rq->cfs;
    struct sched_entity *se;
     
    // 如果没有可运行进程，返回NULL
    if (!cfs_rq->nr_running)
        return NULL;
     
    // 选择vruntime最小的进程
    se = pick_next_entity(cfs_rq);
     
    // 从红黑树中移除
    dequeue_entity(cfs_rq, se, 0);
     
    // 设置为当前运行进程
    set_next_entity(cfs_rq, se);
     
    return task_of(se);
}
vruntime更新过程（update_curr）
static void update_curr(struct cfs_rq *cfs_rq)
{
    struct sched_entity *curr = cfs_rq->curr;
    u64 now = rq_clock_task(rq_of(cfs_rq));
    u64 delta_exec;
     
    if (unlikely(!curr))
        return;
     
    // 计算实际运行时间
    delta_exec = now - curr->exec_start;
     
    // 更新总运行时间
    curr->sum_exec_runtime += delta_exec;
     
    // 更新虚拟运行时间
    curr->vruntime += calc_delta_fair(delta_exec, curr);
     
    // 更新最小vruntime
    update_min_vruntime(cfs_rq);
}

调度时机与抢占机制
CFS调度发生的时机：
1. **时钟中断（Tick）**: 每次时钟中断时检查是否需要调度
2. **进程阻塞**: 进程进入睡眠状态时
3. **进程唤醒**: 进程从睡眠状态唤醒时
4. **系统调用返回**: 从内核态返回用户态时
5. **中断处理完成**: 中断处理程序执行完毕时

```c
// kernel/sched/fair.c - 检查是否需要抢占
static void check_preempt_wakeup(struct rq *rq, struct task_struct *p, int wake_flags)
{
    struct task_struct *curr = rq->curr;
    struct sched_entity *se = &curr->se, *pse = &p->se;
    
    // 如果唤醒的进程不是CFS进程，直接返回
    if (unlikely(se == pse))
        return;

    // 计算vruntime差值
    if (wakeup_preempt_entity(se, pse) == 1) {
        // 需要抢占当前进程
        resched_curr(rq);
    }
}

// vruntime差值判断抢占
static int wakeup_preempt_entity(struct sched_entity *curr, struct sched_entity *se)
{
    s64 gran, vdiff = curr->vruntime - se->vruntime;
    
    // 如果差值小于0，新进程vruntime更大，不抢占
    if (vdiff <= 0)
        return -1;
        
    // 计算抢占粒度
    gran = wakeup_gran(se);
    
    // 如果差值大于粒度，触发抢占
    if (vdiff > gran)
        return 1;
        
    return 0;
}
```

红黑树操作详解
CFS使用红黑树来维护调度实体的顺序：

```c
// 将调度实体加入红黑树
static void __enqueue_entity(struct cfs_rq *cfs_rq, struct sched_entity *se)
{
    struct rb_node **link = &cfs_rq->tasks_timeline.rb_node;
    struct rb_node *parent = NULL;
    struct sched_entity *entry;
    bool leftmost = true;
    
    // 查找插入位置
    while (*link) {
        parent = *link;
        entry = rb_entry(parent, struct sched_entity, run_node);
        
        // 比较vruntime
        if (entity_before(se, entry)) {
            link = &parent->rb_left;
        } else {
            link = &parent->rb_right;
            leftmost = false;
        }
    }
    
    // 插入红黑树
    rb_link_node(&se->run_node, parent, link);
    rb_insert_color(&se->run_node, &cfs_rq->tasks_timeline);
    
    // 更新最左节点
    if (leftmost)
        cfs_rq->rb_leftmost = &se->run_node;
}

// 从红黑树中移除调度实体
static void __dequeue_entity(struct cfs_rq *cfs_rq, struct sched_entity *se)
{
    // 如果是最左节点，需要更新
    if (cfs_rq->rb_leftmost == &se->run_node) {
        struct rb_node *next_node = rb_next(&se->run_node);
        cfs_rq->rb_leftmost = next_node;
    }
    
    rb_erase(&se->run_node, &cfs_rq->tasks_timeline);
}
```

完整的调度循环
```c
// kernel/sched/core.c - 主调度函数
static void __sched notrace __schedule(bool preempt)
{
    struct task_struct *prev, *next;
    struct rq *rq;
    int cpu;
    
    cpu = smp_processor_id();
    rq = cpu_rq(cpu);
    prev = rq->curr;
    
    // 更新运行时间统计
    if (prev->sched_class->task_tick)
        prev->sched_class->task_tick(rq, prev, 0);
    
    // 选择下一个要运行的任务
    next = pick_next_task(rq, prev);
    
    // 如果需要切换任务
    if (likely(prev != next)) {
        rq->nr_switches++;
        rq->curr = next;
        
        // 执行上下文切换
        context_switch(rq, prev, next);
    }
}
```

四、CFS调度器与cgroup v2
cgroup是Linux内核提供的一种机制，用于对进程进行分组管理和资源控制。

cgroup的设计思想
分而治之
进程分组：将相关进程组织到同一个cgroup中
资源隔离：不同cgroup间的资源相互隔离
层次管理：支持树状的层次化管理结构
统一接口
linux系统将cgroup与用户交互的部分设计为了一个伪文件系统，用户通过读写该文件系统目录下的文件来实现与cgroup的交互。

# 统一的文件系统接口
/sys/fs/cgroup/
cgroup v1与v2的区别
v1: 每种资源类型有独立的层次结构
v2: 统一的层次结构，更简洁的设计
image2025-6-11_22-4-14.png

CFS与cgroup v2
cgroup主要数据结构
cgroup

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
任务组（task_group）

struct task_group {
    struct cgroup_subsys_state css;           // cgroup子系统状态
     
    // 调度实体和运行队列（每CPU）
    struct sched_entity     **se;             // 每CPU的调度实体数组
    struct cfs_rq           **cfs_rq;         // 每CPU的CFS运行队列数组
     
    // 层次关系
    struct task_group       *parent;          // 父任务组
    struct list_head        list;             // 任务组链表
    struct list_head        siblings;         // 兄弟节点
    struct list_head        children;         // 子节点
     
    // 权重和份额
    unsigned long           shares;           // CPU份额
    atomic_long_t           load_avg;         // 平均负载
     
    // 带宽控制
    struct cfs_bandwidth    cfs_bandwidth;    // CFS带宽控制
     
    // 实时调度相关
    struct sched_rt_entity  **rt_se;          // RT调度实体
    struct rt_rq            **rt_rq;          // RT运行队列
     
    // 引用计数
    struct rcu_head         rcu;
    struct kref             kref;
};
task_struct

struct task_struct {
    // ... 其他字段
     
    // CFS调度相关
    struct sched_entity     se;               // CFS调度实体
     
    // cgroup相关
    #ifdef CONFIG_CGROUPS
    struct css_set __rcu    *cgroups;         // 关联的CSS集合
    struct list_head        cg_list;          // cgroup任务链表
    #endif
     
    // ... 其他字段
};
每个cgroup有自己的CFS运行队列
调度器在cgroup级别进行调度
实现了层次化的公平调度
调度实体的层次结构示例
Root CFS RQ
├── Task Group A (se)
│   ├── CFS RQ A
│   │   ├── Process 1 (se)
│   │   ├── Process 2 (se)
│   │   └── Task Group A1 (se)
│   │       └── CFS RQ A1
│   │           ├── Process 3 (se)
│   │           └── Process 4 (se)
│   └── ...
├── Task Group B (se)
│   └── CFS RQ B
│       ├── Process 5 (se)
│       └── Process 6 (se)
└── Process 7 (se) [直接在根队列]
cgroup参数对调度的影响
/sys/fs/cgroup/myapp/
├── cpu.weight          # 相对权重控制
├── cpu.weight.nice     # nice值形式的权重
├── cpu.max             # 绝对带宽限制  
├── cpu.max.burst       # 突发限制（较新内核）
├── cpu.stat            # 使用统计
├── cpu.pressure        # 压力信息（PSI）
└── cgroup.procs        # 进程列表
cpu.weight：相对权重控制
# 设置权重比例 2:1
echo 200 > /sys/fs/cgroup/app1/cpu.weight  # 高优先级
echo 100 > /sys/fs/cgroup/app2/cpu.weight  # 正常优先级
 
# 调度行为：
# - app1获得约67%的CPU时间 (200/(200+100))
# - app2获得约33%的CPU时间 (100/(200+100))
# - 如果app1空闲，app2可以使用全部CPU
# - 不会发生throttle
cpu.max：绝对带宽限制
# 格式：cpu.max = "quota period"
# quota: 在period时间内可使用的CPU时间（微秒）
# period: 控制周期（微秒），默认100000（100ms）
 
# 示例
echo "50000 100000" > /sys/fs/cgroup/myapp/cpu.max   # 50% CPU
echo "150000 100000" > /sys/fs/cgroup/myapp/cpu.max  # 150% CPU（多核）
echo "max" > /sys/fs/cgroup/myapp/cpu.max            # 无限制


Period N:   ██████████████████████████████████████████████████████████████████████████████████████████████████ 100ms/100ms
Period N+1: ████████                                                                                           8ms/100ms
Period N+2: ████████                                                                                           8ms/100ms
 
GC期间：100ms全部用完 → 被throttle
平均使用率：(100+8+8)/300 = 38.7%
五、Kubernetes资源管理与CFS集成

Kubernetes资源管理基础
Pod资源配置格式
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: app-container
    image: nginx
    resources:
      requests:
        cpu: "1"        # 请求1核CPU
        memory: "512Mi"  # 请求512MB内存
      limits:
        cpu: "2"        # 限制2核CPU
        memory: "1Gi"   # 限制1GB内存
```

QoS类别与调度策略
Kubernetes根据资源配置将Pod分为三个QoS类别：

**1. Guaranteed（保证类）**
```yaml
# 所有容器都设置了requests和limits，且值相等
resources:
  requests:
    cpu: "1"
    memory: "1Gi"
  limits:
    cpu: "1"        # 与requests相等
    memory: "1Gi"   # 与requests相等
```

**2. Burstable（可突发类）**
```yaml
# 至少一个容器设置了requests或limits，但不满足Guaranteed条件
resources:
  requests:
    cpu: "500m"     # 0.5核
    memory: "512Mi"
  limits:
    cpu: "2"        # 可突发到2核
    memory: "2Gi"   # 可突发到2GB
```

**3. BestEffort（尽力而为类）**
```yaml
# 没有设置任何requests和limits
resources: {}
```

cgroup v2在K8s中的层次结构
```
/sys/fs/cgroup/
└── kubepods/
    ├── guaranteed/
    │   └── pod<uid>/
    │       └── <container-id>/
    ├── burstable/
    │   └── pod<uid>/
    │       └── <container-id>/
    └── besteffort/
        └── pod<uid>/
            └── <container-id>/
```

实际示例：
```bash
# Burstable QoS Pod
/sys/fs/cgroup/kubepods/burstable/pod2dd72970-627b-490b-a210-6095fce66f12/
├── cpu.weight: 20                     # 基于requests计算
├── cpu.max: "200000 100000"           # 基于limits设置，200% CPU
├── memory.max: 2147483648             # 2GB内存限制
├── memory.min: 536870912              # 512MB内存保证
├── cgroup.procs: 12345                # 进程列表
└── cpu.stat                           # CPU使用统计
```

CPU资源映射机制

**requests → cpu.weight映射**
Kubernetes使用以下公式计算cpu.weight：
```go
// k8s.io/kubernetes/pkg/kubelet/cm/cgroup_manager_linux.go
func milliCPUToWeight(milliCPU int64) int64 {
    if milliCPU == 0 {
        return minWeight  // 最小权重2
    }
    
    // 1000 milliCPU = 1024 weight (nice 0对应的权重)
    weight := (milliCPU * 1024) / 1000
    
    if weight < minWeight {
        return minWeight
    }
    if weight > maxWeight {
        return maxWeight  // 最大权重262144
    }
    
    return weight
}
```

**limits → cpu.max映射**
```go
func milliCPUToQuota(milliCPU int64, period int64) int64 {
    // quota = (milliCPU * period) / 1000
    // 例如：limits: 1.5 CPU, period: 100000us
    // quota = (1500 * 100000) / 1000 = 150000us
    return (milliCPU * period) / 1000
}
```

具体计算示例：
```yaml
resources:
  requests:
    cpu: "500m"    # → cpu.weight = (500 * 1024) / 1000 = 512
  limits:
    cpu: "2"       # → cpu.max = "200000 100000" (200% CPU)
```

Throttle机制详解

**什么是CPU Throttle？**
CPU Throttle是CFS带宽控制机制，当进程组消耗的CPU时间超过配额时，会被强制暂停执行。

**Throttle触发条件**
```c
// kernel/sched/fair.c
static int tg_throttle_down(struct task_group *tg, void *data)
{
    struct cfs_bandwidth *cfs_b = &tg->cfs_bandwidth;
    
    // 检查是否超过配额
    if (cfs_b->runtime_remaining <= 0) {
        // 触发throttle
        throttle_cfs_rq(cfs_rq);
        return 1;
    }
    
    return 0;
}
```

**Throttle监控**
```bash
# 查看throttle统计
cat /sys/fs/cgroup/kubepods/burstable/pod<uid>/cpu.stat
usage_usec 1500000
user_usec 800000
system_usec 700000
nr_periods 15
nr_throttled 3        # 被throttle的周期数
throttled_usec 45000  # 总throttle时间（微秒）

# 计算throttle比例
throttle_ratio = throttled_usec / (nr_periods * period)
                = 45000 / (15 * 100000)
                = 3%
```

性能优化与调优

**识别Throttle问题**
```bash
#!/bin/bash
# throttle_monitor.sh
kubectl get pods -o wide | while read line; do
    if [[ $line == NAME* ]]; then continue; fi
    
    pod=$(echo $line | awk '{print $1}')
    namespace=$(echo $line | awk '{print $1}' | cut -d'/' -f1)
    
    # 获取Pod的cgroup路径
    pod_uid=$(kubectl get pod $pod -n $namespace -o jsonpath='{.metadata.uid}')
    cgroup_path="/sys/fs/cgroup/kubepods/*/pod$pod_uid"
    
    if [[ -f $cgroup_path/cpu.stat ]]; then
        throttled=$(cat $cgroup_path/cpu.stat | grep throttled_usec | awk '{print $2}')
        nr_periods=$(cat $cgroup_path/cpu.stat | grep nr_periods | awk '{print $2}')
        
        if [[ $throttled -gt 0 && $nr_periods -gt 0 ]]; then
            ratio=$(( $throttled * 100 / ($nr_periods * 100000) ))
            if [[ $ratio -gt 5 ]]; then  # 超过5%认为有问题
                echo "Warning: Pod $pod throttle ratio: ${ratio}%"
            fi
        fi
    fi
done
```

**调优建议**

1. **合理设置CPU limits**
```yaml
# 避免设置过低的limits
resources:
  requests:
    cpu: "500m"
  limits:
    cpu: "1"      # 只比requests高一倍，容易throttle
    
# 推荐配置
resources:
  requests:
    cpu: "500m"
  limits:
    cpu: "2"      # 给予足够的突发空间
```

2. **使用CPU亲和性优化**
```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: node-type
            operator: In
            values: ["cpu-optimized"]
```

3. **监控和告警配置**
```yaml
# Prometheus告警规则
groups:
- name: kubernetes-resources
  rules:
  - alert: PodCpuThrottling
    expr: |
      rate(container_cpu_cfs_throttled_seconds_total[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Pod {{ $labels.pod }} is being throttled"
      description: "Pod {{ $labels.pod }} CPU throttle rate is {{ $value | humanizePercentage }}"
```

实战案例分析

**案例1：Java应用GC导致的Throttle**
```yaml
# 问题配置
resources:
  requests:
    cpu: "1"
  limits:
    cpu: "1.5"    # GC时CPU使用激增

# 解决方案
resources:
  requests:
    cpu: "1"
  limits:
    cpu: "3"      # 给GC足够的CPU资源
```

**案例2：多容器Pod的资源竞争**
```yaml
spec:
  containers:
  - name: app
    resources:
      requests:
        cpu: "800m"
      limits:
        cpu: "1.5"
  - name: sidecar
    resources:
      requests:
        cpu: "200m"   # 确保sidecar也有保证资源
      limits:
        cpu: "500m"
```

**案例3：批处理作业的资源配置**
```yaml
# 使用BestEffort类别，避免throttle
apiVersion: batch/v1
kind: Job
spec:
  template:
    spec:
      containers:
      - name: batch-job
        resources: {}  # 不设置limits，避免throttle
      restartPolicy: Never
```

六、故障排查与诊断

常见问题诊断

**1. 系统负载高但CPU使用率低**
```bash
# 检查等待I/O的进程
ps aux | awk '$8 ~ /D/ { print $2, $11 }' | head -10

# 查看I/O统计
iostat -x 1 5

# 检查不可中断睡眠的进程
cat /proc/*/stat | awk '{print $1, $3}' | grep -E "D|R" | wc -l

# 诊断脚本
#!/bin/bash
echo "=== 系统负载分析 ==="
uptime
echo ""

echo "=== 不可中断进程 ==="
ps aux | awk '$8 ~ /D/ { print $2, $8, $11 }'
echo ""

echo "=== I/O等待分析 ==="
vmstat 1 3
```

**2. 进程调度异常**
```bash
# 查看进程调度信息
cat /proc/PID/sched
# 输出示例：
# task                    :             nginx
# se.exec_start           :    1234567890.123456
# se.vruntime             :         123456.789012
# se.sum_exec_runtime     :           1234.567890
# se.nr_migrations        :                    15
# nr_switches             :                   456
# nr_voluntary_switches   :                   123
# nr_involuntary_switches :                   333

# 检查调度延迟
perf sched record -a sleep 10
perf sched latency

# 查看运行队列信息
cat /proc/sched_debug | grep -A 20 "cfs_rq"
```

**3. cgroup资源限制问题**
```bash
# 检查cgroup层次结构
systemd-cgls

# 查看具体cgroup的资源使用
cat /sys/fs/cgroup/system.slice/docker-container.service/cpu.stat
cat /sys/fs/cgroup/system.slice/docker-container.service/memory.stat

# 监控cgroup资源使用
#!/bin/bash
while true; do
    echo "=== $(date) ==="
    for cgroup in /sys/fs/cgroup/kubepods/*/pod*/; do
        if [[ -f "$cgroup/cpu.stat" ]]; then
            pod_name=$(basename $(dirname $cgroup))
            usage=$(cat $cgroup/cpu.stat | grep usage_usec | awk '{print $2}')
            throttled=$(cat $cgroup/cpu.stat | grep throttled_usec | awk '{print $2}')
            echo "Pod: $pod_name, Usage: ${usage}us, Throttled: ${throttled}us"
        fi
    done
    sleep 5
done
```

**4. Kubernetes Pod性能问题**
```bash
# 查看Pod资源使用
kubectl top pods
kubectl describe pod <pod-name>

# 检查Pod的cgroup配置
pod_uid=$(kubectl get pod <pod-name> -o jsonpath='{.metadata.uid}')
ls -la /sys/fs/cgroup/kubepods/*/pod$pod_uid/
cat /sys/fs/cgroup/kubepods/*/pod$pod_uid/cpu.max
cat /sys/fs/cgroup/kubepods/*/pod$pod_uid/cpu.stat

# 完整的诊断脚本
#!/bin/bash
POD_NAME=$1
NAMESPACE=${2:-default}

if [[ -z "$POD_NAME" ]]; then
    echo "Usage: $0 <pod-name> [namespace]"
    exit 1
fi

echo "=== Pod基本信息 ==="
kubectl get pod $POD_NAME -n $NAMESPACE -o wide

echo -e "\n=== Pod资源配置 ==="
kubectl get pod $POD_NAME -n $NAMESPACE -o jsonpath='{.spec.containers[*].resources}'

echo -e "\n=== Pod当前资源使用 ==="
kubectl top pod $POD_NAME -n $NAMESPACE

echo -e "\n=== Pod事件 ==="
kubectl get events --field-selector involvedObject.name=$POD_NAME -n $NAMESPACE

echo -e "\n=== cgroup信息 ==="
pod_uid=$(kubectl get pod $POD_NAME -n $NAMESPACE -o jsonpath='{.metadata.uid}')
cgroup_path="/sys/fs/cgroup/kubepods/*/pod$pod_uid"
if [[ -d $cgroup_path ]]; then
    echo "CPU配置："
    cat $cgroup_path/cpu.max 2>/dev/null || echo "未设置cpu.max"
    cat $cgroup_path/cpu.weight 2>/dev/null || echo "未设置cpu.weight"
    
    echo "CPU统计："
    cat $cgroup_path/cpu.stat 2>/dev/null || echo "无cpu.stat"
    
    echo "内存配置："
    cat $cgroup_path/memory.max 2>/dev/null || echo "未设置memory.max"
    cat $cgroup_path/memory.min 2>/dev/null || echo "未设置memory.min"
fi
```

性能调优工具

**1. 系统级监控**
```bash
# 安装性能监控工具
apt-get install -y sysstat perf trace-cmd

# 实时监控CPU调度
perf top -s pid,comm,cpu

# 记录调度事件
perf record -e sched:sched_switch -a sleep 10
perf report

# 分析调度延迟
perf sched record -a sleep 10
perf sched latency --sort max
```

**2. 容器级监控**
```bash
# 使用cAdvisor监控容器资源
docker run -d --name=cadvisor \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  gcr.io/cadvisor/cadvisor:latest

# 访问监控界面
curl http://localhost:8080/containers/
```

**3. Kubernetes监控**
```yaml
# Prometheus + Grafana监控栈
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

七、总结

CFS调度器设计精髓
1. **完全公平理念**: 通过虚拟运行时间(vruntime)确保长期公平性
2. **高效数据结构**: 红黑树保证O(log n)的插入和查找复杂度
3. **层次化调度**: 支持cgroup的层次结构，实现资源隔离
4. **动态调整**: 根据系统负载和进程行为动态调整调度参数

关键技术要点
- **vruntime计算**: `vruntime = 实际运行时间 × (NICE_0_LOAD / 进程权重)`
- **时间片分配**: `时间片 = 调度周期 × (任务权重 / 队列总权重)`
- **抢占机制**: 基于vruntime差值和抢占粒度进行抢占判断
- **带宽控制**: 通过quota/period机制实现CPU资源限制

实际应用建议
1. **合理设置资源限制**: 避免过度限制导致频繁throttle
2. **监控关键指标**: 重点关注throttle比例、调度延迟等指标
3. **根据应用特性调优**: 不同类型应用需要不同的资源配置策略
4. **建立完善的监控体系**: 及时发现和解决性能问题

通过深入理解CFS调度器的原理和实现，我们可以更好地优化系统性能，合理配置资源，提高应用的运行效率。在容器化和云原生环境中，这些知识尤为重要，直接影响着应用的性能表现和资源利用效率。
