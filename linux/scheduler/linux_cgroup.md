# Linux cgroup v2 完整指南

## 概述

cgroup（Control Groups）是Linux内核提供的一种机制，用于限制、控制与分离一个进程组的资源使用。cgroup v2是cgroup的第二代实现，提供了统一的层次结构和更强大的资源管理能力。

## 基本概念

### 什么是cgroup？

cgroup是一种用于分层组织进程并以受控且可配置的方式沿层次结构分发系统资源的机制。它主要由两个部分组成：
- **cgroup核心**: 主要负责分层组织进程
- **cgroup控制器**: 负责沿层次结构分发特定类型的系统资源

### 核心特性

- **统一层次结构**: cgroup v2只有一个统一的层次结构
- **层次化管理**: 所有控制器行为都是层次化的
- **资源分发模型**: 支持权重、限制、保护、分配等多种分发模型
- **进程组织**: 系统中每个进程都属于且仅属于一个cgroup

## cgroup v1 vs cgroup v2

### v1的问题

1. **多层次结构复杂性**: 每个控制器可以有独立的层次结构
2. **管理复杂性**: 需要管理多个相似的层次结构
3. **控制器协作困难**: 控制器间难以协作
4. **线程级粒度问题**: 某些控制器的线程级控制没有意义

### v2的改进

1. **统一层次结构**: 所有控制器共享一个层次结构
2. **更严格的结构约束**: 简化了管理逻辑
3. **改进的通知机制**: 更高效的事件通知
4. **线程模式支持**: 有选择地支持线程级控制

## 架构设计

### 统一层次结构

```
根cgroup (/)
├── system.slice/
│   ├── ssh.service/
│   ├── nginx.service/
│   └── docker.service/
├── user.slice/
│   ├── user-1000.slice/
│   └── user-1001.slice/
└── machine.slice/
    ├── docker-container1/
    └── docker-container2/
```

### 控制器架构

```
cgroup核心
├── CPU控制器
├── 内存控制器
├── I/O控制器
├── PID控制器
├── cpuset控制器
└── 其他控制器
```

## 基本操作

### 挂载cgroup v2

```bash
# 挂载cgroup v2文件系统
mount -t cgroup2 none /sys/fs/cgroup/unified

# 查看挂载选项
mount | grep cgroup2
```

### 挂载选项

- `nsdelegate`: 将cgroup命名空间视为委托边界
- `memory_localevents`: 仅显示当前cgroup的内存事件
- `memory_recursiveprot`: 递归应用内存保护
- `memory_hugetlb_accounting`: 将HugeTLB内存计入内存控制器

### 创建和管理cgroup

```bash
# 创建cgroup
mkdir /sys/fs/cgroup/mygroup

# 查看可用控制器
cat /sys/fs/cgroup/cgroup.controllers

# 启用控制器
echo "+cpu +memory" > /sys/fs/cgroup/cgroup.subtree_control

# 移动进程到cgroup
echo $$ > /sys/fs/cgroup/mygroup/cgroup.procs

# 删除cgroup
rmdir /sys/fs/cgroup/mygroup
```

## 结构约束

### 自上而下约束

- 资源从上到下分发
- 子cgroup只能启用父cgroup已启用的控制器
- 控制器只能在父级启用时启用

### 无内部进程约束

- 非根cgroup只有在没有进程时才能启用域控制器
- 确保控制器查看的层次部分中进程总是在叶子节点
- 根cgroup不受此限制

### 委托约束

委托的子层次结构包含在以下意义上：
- 委托者无法将进程移入或移出子层次结构
- 通过权限检查和命名空间可见性确保包含

## 核心接口文件

### cgroup.controllers
- **类型**: 只读文件
- **内容**: 当前cgroup可用控制器列表
- **格式**: 空格分隔的控制器名称

### cgroup.subtree_control
- **类型**: 读写文件
- **内容**: 当前启用的控制器列表
- **操作**: 使用+/-前缀启用/禁用控制器

```bash
# 启用CPU和内存控制器
echo "+cpu +memory" > cgroup.subtree_control

# 禁用I/O控制器
echo "-io" > cgroup.subtree_control
```

### cgroup.procs
- **类型**: 读写文件
- **内容**: 属于此cgroup的进程PID列表
- **操作**: 写入PID迁移整个进程

### cgroup.threads
- **类型**: 读写文件
- **内容**: 属于此cgroup的线程TID列表
- **操作**: 写入TID迁移单个线程（仅在线程模式下）

### cgroup.events
- **类型**: 只读文件
- **内容**: cgroup状态信息
- **字段**:
  - `populated`: 是否包含活跃进程
  - `frozen`: 是否被冻结

### cgroup.type
- **类型**: 读写文件
- **可能值**:
  - `domain`: 普通域cgroup
  - `domain threaded`: 线程域根
  - `domain invalid`: 无效状态
  - `threaded`: 线程cgroup

### 其他核心文件

```bash
# 限制后代数量
echo 100 > cgroup.max.descendants

# 限制层次深度
echo 5 > cgroup.max.depth

# 冻结cgroup
echo 1 > cgroup.freeze

# 杀死cgroup中所有进程
echo 1 > cgroup.kill
```

## 资源分发模型

### 权重模型 (Weights)
- **特点**: 按权重比例分配资源
- **范围**: [1, 10000]，默认100
- **示例**: cpu.weight

```bash
# 设置CPU权重
echo 200 > cpu.weight
```

### 限制模型 (Limits)
- **特点**: 硬限制资源使用上限
- **范围**: [0, max]
- **示例**: memory.max, io.max

```bash
# 设置内存限制为1GB
echo 1073741824 > memory.max

# 设置I/O限制
echo "8:0 rbps=1048576 wbps=1048576" > io.max
```

### 保护模型 (Protections)
- **特点**: 保护资源不被回收
- **类型**: 硬保证或软边界
- **示例**: memory.min, memory.low

```bash
# 设置内存硬保护
echo 536870912 > memory.min

# 设置内存软保护
echo 268435456 > memory.low
```

### 分配模型 (Allocations)
- **特点**: 独占分配有限资源
- **约束**: 不能过量提交
- **示例**: cpu.rt.max

## 主要控制器详解

### CPU控制器

CPU控制器调节CPU周期的分配，支持权重和绝对带宽限制模型。

#### 接口文件

**cpu.stat**
```bash
# 查看CPU统计信息
cat cpu.stat
# 输出示例：
# usage_usec 1234567
# user_usec 800000
# system_usec 434567
```

**cpu.weight**
```bash
# 设置CPU权重 (1-10000)
echo 200 > cpu.weight

# 使用nice值设置权重
echo 10 > cpu.weight.nice
```

**cpu.max**
```bash
# 设置CPU带宽限制：$MAX $PERIOD (微秒)
echo "50000 100000" > cpu.max  # 50%限制

# 无限制
echo "max 100000" > cpu.max
```

**cpu.pressure**
```bash
# 查看CPU压力状态信息
cat cpu.pressure
```

### 内存控制器

内存控制器调节内存分配，支持限制和保护模型。

#### 接口文件

**memory.current**
```bash
# 查看当前内存使用量
cat memory.current
```

**memory.min/memory.low**
```bash
# 硬保护：保证不被回收的内存
echo 512M > memory.min

# 软保护：优先保护的内存
echo 256M > memory.low
```

**memory.high/memory.max**
```bash
# 软限制：超过时节流
echo 1G > memory.high

# 硬限制：超过时OOM
echo 2G > memory.max
```

**memory.stat**
```bash
# 详细内存统计
cat memory.stat
# 包含：anon, file, kernel, slab等详细信息
```

**memory.events**
```bash
# 内存事件统计
cat memory.events
# low: 低边界违反次数
# high: 高边界违反次数
# max: 达到最大限制次数
# oom: OOM事件次数
```

**内存回收**
```bash
# 主动回收内存
echo 100M > memory.reclaim
```

### I/O控制器

I/O控制器调节I/O资源分配，支持权重和绝对带宽限制。

#### 接口文件

**io.stat**
```bash
# 查看I/O统计
cat io.stat
# 8:0 rbytes=1459200 wbytes=314773504 rios=192 wios=353
```

**io.weight**
```bash
# 设置I/O权重
echo "default 200" > io.weight
echo "8:0 300" > io.weight  # 特定设备权重
```

**io.max**
```bash
# 设置I/O限制
echo "8:0 rbps=1048576 wbps=1048576" > io.max
echo "8:0 riops=1000 wiops=1000" > io.max
```

**io.pressure**
```bash
# 查看I/O压力信息
cat io.pressure
```

### PID控制器

PID控制器限制cgroup中的进程数量。

#### 接口文件

**pids.max**
```bash
# 设置进程数限制
echo 100 > pids.max
```

**pids.current**
```bash
# 查看当前进程数
cat pids.current
```

**pids.events**
```bash
# 查看PID限制事件
cat pids.events
```

### cpuset控制器

cpuset控制器约束CPU和内存节点的使用。

#### 接口文件

**cpuset.cpus**
```bash
# 设置可用CPU
echo "0-3,6,8" > cpuset.cpus
```

**cpuset.mems**
```bash
# 设置可用内存节点
echo "0-1" > cpuset.mems
```

**cpuset.cpus.effective**
```bash
# 查看实际生效的CPU
cat cpuset.cpus.effective
```

## 线程模式 (Thread Mode)

### 概念

线程模式允许在子树中将进程的线程分散到不同的cgroup中，同时保持共同的资源域。

### 线程化cgroup类型

- **domain**: 普通域cgroup
- **threaded**: 线程化cgroup
- **domain threaded**: 线程域根
- **domain invalid**: 无效状态cgroup

### 创建线程子树

```bash
# 创建线程cgroup
echo threaded > cgroup.type

# 移动线程
echo $TID > cgroup.threads
```

### 支持线程模式的控制器

- cpu
- cpuset  
- perf_event
- pids

## 实际应用场景

### 容器资源管理

```bash
# 创建容器cgroup
mkdir /sys/fs/cgroup/container1

# 启用控制器
echo "+cpu +memory +io +pids" > /sys/fs/cgroup/cgroup.subtree_control

# 设置资源限制
echo 200 > /sys/fs/cgroup/container1/cpu.weight
echo 1G > /sys/fs/cgroup/container1/memory.max
echo "8:0 rbps=10485760 wbps=10485760" > /sys/fs/cgroup/container1/io.max
echo 100 > /sys/fs/cgroup/container1/pids.max

# 运行容器进程
echo $CONTAINER_PID > /sys/fs/cgroup/container1/cgroup.procs
```

### 服务质量管理

```bash
# 创建不同优先级的服务组
mkdir -p /sys/fs/cgroup/{critical,normal,background}

# 设置CPU权重
echo 1000 > /sys/fs/cgroup/critical/cpu.weight    # 高优先级
echo 100 > /sys/fs/cgroup/normal/cpu.weight       # 正常优先级  
echo 10 > /sys/fs/cgroup/background/cpu.weight    # 后台优先级

# 设置内存保护
echo 2G > /sys/fs/cgroup/critical/memory.low
echo 1G > /sys/fs/cgroup/normal/memory.low
# background不设置保护
```

### 批处理作业管理

```bash
# 创建批处理组
mkdir /sys/fs/cgroup/batch

# 限制资源使用
echo 50 > /sys/fs/cgroup/batch/cpu.weight        # 低CPU权重
echo idle > /sys/fs/cgroup/batch/cpu.idle        # 空闲调度
echo 4G > /sys/fs/cgroup/batch/memory.max        # 内存限制
echo 50 > /sys/fs/cgroup/batch/pids.max          # 进程数限制
```

### 用户会话管理

```bash
# systemd用户会话示例
# 每个用户会话都有独立的cgroup
/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope/
```

## 监控和调试

### 实时监控

```bash
# 使用systemd-cgtop监控
systemd-cgtop

# 查看特定cgroup统计
watch -n 1 cat /sys/fs/cgroup/mygroup/memory.stat

# 监控压力信息
watch -n 1 cat /sys/fs/cgroup/mygroup/cpu.pressure
```

### 事件通知

```bash
# 监控populated状态变化
#!/bin/bash
inotifywait -m /sys/fs/cgroup/mygroup/cgroup.events -e modify |
while read path action file; do
    echo "cgroup状态变化: $(cat $path/$file)"
done
```

### 性能分析

```bash
# 查看内存使用详情
cat /sys/fs/cgroup/mygroup/memory.stat | grep -E "(anon|file|cache)"

# 分析I/O性能
cat /sys/fs/cgroup/mygroup/io.stat

# 检查资源争用
cat /sys/fs/cgroup/mygroup/*.pressure
```

## 最佳实践

### 1. 层次结构设计

```bash
# 推荐的层次结构
/sys/fs/cgroup/
├── system.slice/          # 系统服务
├── user.slice/           # 用户会话
├── machine.slice/        # 虚拟机/容器
└── custom.slice/         # 自定义服务组
```

### 2. 资源配置策略

```bash
# 使用相对权重而不是绝对限制
echo 200 > cpu.weight      # 好
echo "50000 100000" > cpu.max  # 仅在必要时使用

# 设置合理的内存保护
echo 256M > memory.low      # 软保护
echo 512M > memory.high     # 软限制
echo 1G > memory.max        # 硬限制
```

### 3. 监控和告警

```bash
# 监控脚本示例
#!/bin/bash
CGROUP_PATH="/sys/fs/cgroup/myapp"

# 检查内存使用率
current=$(cat $CGROUP_PATH/memory.current)
max=$(cat $CGROUP_PATH/memory.max)
usage_pct=$((current * 100 / max))

if [ $usage_pct -gt 80 ]; then
    echo "警告: 内存使用率超过80%"
fi

# 检查CPU压力
cpu_pressure=$(grep "avg10=" $CGROUP_PATH/cpu.pressure | cut -d= -f2)
if (( $(echo "$cpu_pressure > 50.0" | bc -l) )); then
    echo "警告: CPU压力过高"
fi
```

### 4. 动态调整

```bash
# 根据负载动态调整资源
current_load=$(cat /proc/loadavg | cut -d' ' -f1)
if (( $(echo "$current_load > 2.0" | bc -l) )); then
    echo 300 > /sys/fs/cgroup/critical/cpu.weight
else
    echo 200 > /sys/fs/cgroup/critical/cpu.weight
fi
```

## 故障排查

### 常见问题

1. **无法启用控制器**
```bash
# 检查父cgroup是否已启用
cat ../cgroup.subtree_control

# 检查是否有进程在当前cgroup
cat cgroup.procs
```

2. **内存限制不生效**
```bash
# 检查是否有内存泄漏
cat memory.stat | grep -E "(anon|kernel)"

# 检查swap使用
cat memory.swap.current
```

3. **进程无法移动到cgroup**
```bash
# 检查权限
ls -la cgroup.procs

# 检查委托约束
# 确保有写入共同祖先的权限
```

### 调试工具

```bash
# 查看cgroup层次结构
systemd-cgls

# 监控资源使用
systemd-cgtop

# 查看进程的cgroup归属
cat /proc/$PID/cgroup

# 检查内核日志
dmesg | grep -i cgroup
```

## 与systemd集成

### systemd服务配置

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application

[Service]
Type=simple
ExecStart=/usr/bin/myapp
Slice=custom.slice

# CPU配置
CPUWeight=200
CPUQuota=50%

# 内存配置  
MemoryMax=1G
MemoryHigh=800M

# I/O配置
IOWeight=100

[Install]
WantedBy=multi-user.target
```

### systemd slice配置

```ini
# /etc/systemd/system/custom.slice
[Unit]
Description=Custom Service Slice

[Slice]
CPUWeight=500
MemoryMax=4G
```

## 性能优化

### 减少系统开销

```bash
# 禁用不必要的PSI统计
echo 0 > /sys/fs/cgroup/mygroup/cgroup.pressure

# 使用favordynmods选项（适用于静态配置）
mount -o remount,favordynmods /sys/fs/cgroup
```

### 优化层次结构深度

```bash
# 避免过深的层次结构
# 推荐深度 <= 4-5层
```

### 批量操作优化

```bash
# 批量移动进程时，一次移动整个进程组
echo $PGID > cgroup.procs  # 而不是逐个移动线程
```

## 迁移指南

### 从cgroup v1迁移

1. **识别v1使用情况**
```bash
# 查看当前挂载的v1层次结构
mount | grep cgroup

# 检查/proc/cgroups
cat /proc/cgroups
```

2. **迁移策略**
```bash
# 禁用v1控制器
echo 'GRUB_CMDLINE_LINUX="cgroup_no_v1=all"' >> /etc/default/grub
update-grub

# 或逐个迁移控制器
echo 'GRUB_CMDLINE_LINUX="cgroup_no_v1=memory,cpu"' >> /etc/default/grub
```

3. **更新脚本和工具**
```bash
# v1路径: /sys/fs/cgroup/memory/mygroup/
# v2路径: /sys/fs/cgroup/mygroup/

# v1: memory.limit_in_bytes
# v2: memory.max
```

## 内核配置

### 编译选项

```bash
# 必需的内核配置
CONFIG_CGROUPS=y
CONFIG_CGROUP_CPUACCT=y
CONFIG_MEMCG=y
CONFIG_CGROUP_SCHED=y
CONFIG_CGROUP_PIDS=y
CONFIG_CGROUP_RDMA=y
CONFIG_CGROUP_FREEZER=y
CONFIG_CGROUP_DEVICE=y
CONFIG_CPUSETS=y
CONFIG_BLK_CGROUP=y
```

### 内核参数

```bash
# 启动参数
cgroup_no_v1=all         # 禁用所有v1控制器
systemd.unified_cgroup_hierarchy=1  # 强制使用v2
```

## 安全考虑

### 权限管理

```bash
# 委托cgroup时的权限设置
chown user:group /sys/fs/cgroup/delegated
chmod 755 /sys/fs/cgroup/delegated
chown user:group /sys/fs/cgroup/delegated/cgroup.procs
chmod 644 /sys/fs/cgroup/delegated/cgroup.procs
```

### 资源隔离

```bash
# 确保容器间资源隔离
echo "+cpu +memory +pids" > /sys/fs/cgroup/containers/cgroup.subtree_control

# 为每个容器设置独立限制
mkdir /sys/fs/cgroup/containers/container1
echo 1G > /sys/fs/cgroup/containers/container1/memory.max
```

### 安全约束

```bash
# 限制特权操作需要CAP_SYS_ADMIN权限
# 普通用户只能在委托的子层次结构内操作
```

## 总结

cgroup v2提供了一个统一、强大且灵活的资源管理框架。通过理解其架构设计、掌握核心概念和接口文件的使用，可以有效地管理系统资源，实现精细化的资源控制和监控。

关键要点：
- 统一层次结构简化了管理复杂性
- 多种资源分发模型满足不同需求
- 丰富的监控和调试能力
- 与systemd深度集成
- 向后兼容v1的平滑迁移路径

在实际应用中，建议结合具体场景选择合适的配置策略，并建立完善的监控和告警机制，以确保系统的稳定性和性能。 