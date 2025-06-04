# systemd-cgtop 命令完整指南

## 概述

`systemd-cgtop` 是 systemd 套件中的一个系统监控工具，用于显示Linux控制组（Control Groups, cgroup）层次结构中资源使用率最高的控制组。它类似于传统的 `top` 命令，但专门针对 cgroup 提供实时的资源监控功能。

## 主要特性

- **实时监控**: 默认每1秒刷新一次，提供动态的资源使用情况
- **多维度排序**: 支持按CPU、内存、磁盘I/O、进程数量等多种方式排序
- **交互式界面**: 提供丰富的键盘快捷键进行实时控制
- **批处理模式**: 支持脚本化调用和数据导出
- **分层显示**: 可控制显示的cgroup层次深度
- **容器支持**: 支持容器环境下的资源监控

## 安装

`systemd-cgtop` 通常作为 systemd 套件的一部分预装在现代Linux发行版中：

### 检查安装状态
```bash
# 检查命令是否可用
which systemd-cgtop

# 查看版本信息
systemd-cgtop --version
```

### 手动安装（如果需要）
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install systemd

# CentOS/RHEL/Fedora
sudo yum install systemd  # 或 dnf install systemd

# Arch Linux
sudo pacman -S systemd
```

## 命令语法

```bash
systemd-cgtop [选项...] [控制组]
```

### 基本参数
- `控制组`: 可选参数，指定要监控的特定控制组路径

## 命令选项详解

### 排序选项
- `-p, --order=path`: 按控制组路径名称排序
- `-t, --order=tasks`: 按任务/进程数量排序
- `-c, --order=cpu`: 按CPU负载排序（默认）
- `-m, --order=memory`: 按内存使用量排序
- `-i, --order=io`: 按磁盘I/O负载排序

### 显示格式选项
- `-r, --raw`: 以原始数值显示字节计数和CPU时间，不使用人类可读格式
- `--cpu=percentage`: CPU使用率以百分比显示（默认）
- `--cpu=time`: CPU使用率以时间显示

### 进程计数选项
- `-P`: 仅计算用户空间进程，排除内核线程
- `-k`: 计算用户空间进程和内核线程，但不计算所有任务
- `--recursive=yes|no`: 控制是否递归计算子控制组中的进程（默认为yes）

### 运行控制选项
- `-b, --batch`: 批处理模式，不接受输入，运行到指定迭代次数或被终止
- `-n, --iterations=数量`: 指定运行迭代次数，0表示无限运行
- `-1`: `--iterations=1` 的快捷方式
- `-d, --delay=时间`: 指定刷新延迟（秒），支持ms、us、min单位

### 显示深度选项
- `--depth=深度`: 控制组树遍历的最大深度，0仅监控根组，默认为3

### 容器选项
- `-M MACHINE, --machine=MACHINE`: 限制显示特定容器的控制组

### 帮助选项
- `-h, --help`: 显示帮助信息
- `--version`: 显示版本信息

## 交互式操作

`systemd-cgtop` 支持以下键盘快捷键：

### 基本控制
- `h`: 显示帮助信息
- `q`: 退出程序
- `Space`: 立即刷新显示

### 排序控制
- `p`: 按路径排序
- `t`: 按任务数排序
- `c`: 按CPU负载排序
- `m`: 按内存使用量排序
- `i`: 按I/O负载排序

### 显示控制
- `%`: 在CPU时间和百分比显示之间切换
- `+`: 增加刷新延迟
- `-`: 减少刷新延迟

### 进程计数控制
- `P`: 在计算所有任务和仅用户空间进程之间切换
- `k`: 在计算所有任务和用户空间进程+内核线程之间切换
- `r`: 切换是否递归计算子控制组进程

## 基本使用示例

### 1. 基本监控
```bash
# 启动基本监控，默认按CPU排序
systemd-cgtop

# 运行一次后退出（适用于脚本）
systemd-cgtop -1

# 指定刷新间隔为2秒
systemd-cgtop -d 2
```

### 2. 不同排序方式
```bash
# 按内存使用量排序
systemd-cgtop -m

# 按磁盘I/O排序
systemd-cgtop -i

# 按进程数量排序
systemd-cgtop -t

# 按路径名称排序
systemd-cgtop -p
```

### 3. 批处理模式
```bash
# 批处理模式，运行10次后退出
systemd-cgtop -b -n 10

# 将输出重定向到文件
systemd-cgtop -b -n 5 > cgroup_stats.txt

# 与其他命令结合使用
systemd-cgtop -b -1 | grep "system.slice"
```

### 4. 显示控制
```bash
# 显示原始数值而非人类可读格式
systemd-cgtop -r

# 限制显示深度为2层
systemd-cgtop --depth=2

# 仅显示用户空间进程
systemd-cgtop -P
```

### 5. 监控特定控制组
```bash
# 监控系统服务
systemd-cgtop system.slice

# 监控用户会话
systemd-cgtop user.slice

# 监控特定服务
systemd-cgtop system.slice/httpd.service
```

## 输出格式解释

### 标准输出列
```
Control Group                Tasks   %CPU   Memory  Input/s Output/s
/                               -      -        -        -        -
├─user.slice                   42   0.1     152.3M        -        -
│ └─user-1000.slice            42   0.1     152.3M        -        -
├─system.slice                156   0.8     285.7M        -        -
│ ├─httpd.service               6   0.2      45.2M        -        -
│ ├─mysqld.service              1   0.4      98.5M        -        -
│ └─sshd.service                2   0.1      12.3M        -        -
└─machine.slice                 -     -         -        -        -
```

### 列含义说明
- **Control Group**: 控制组的路径和名称
- **Tasks**: 任务/进程数量
- **%CPU**: CPU使用率百分比
- **Memory**: 内存使用量
- **Input/s**: 每秒输入字节数
- **Output/s**: 每秒输出字节数

### CPU负载值解释
- CPU负载值范围：0% 到 (CPU核心数 × 100%)
- 例如：8核系统的CPU负载范围为 0% 到 800%
- 可通过 `/proc/cpuinfo` 查看CPU核心数

## 实际应用场景

### 1. 系统性能监控
```bash
# 持续监控系统资源使用情况
systemd-cgtop -d 1

# 找出占用CPU最多的服务
systemd-cgtop -c -1 | head -10

# 找出内存消耗最大的控制组
systemd-cgtop -m -1 | head -10
```

### 2. 服务性能分析
```bash
# 监控Web服务器性能
watch -n 2 "systemd-cgtop -1 | grep -E '(httpd|nginx|apache)'"

# 分析数据库服务资源使用
systemd-cgtop system.slice/mysql.service -d 0.5

# 监控容器资源使用
systemd-cgtop machine.slice -i
```

### 3. 资源使用统计
```bash
# 生成资源使用报告
systemd-cgtop -b -n 60 -d 1 > hourly_stats.log

# 每分钟记录一次状态
while true; do
    echo "$(date): $(systemd-cgtop -1 | head -5)"
    sleep 60
done
```

### 4. 性能调优辅助
```bash
# 识别资源瓶颈
systemd-cgtop -r -1 | sort -k3 -nr | head -20

# 分析I/O密集型应用
systemd-cgtop -i -d 0.1

# 监控内存泄漏
watch -d "systemd-cgtop -m -1 | head -10"
```

## 与其他工具的配合使用

### 1. 与 systemctl 结合
```bash
# 获取高CPU使用率服务的详细信息
for service in $(systemd-cgtop -c -1 | awk 'NR>1 {print $1}' | head -5); do
    echo "=== $service ==="
    systemctl status $service
done
```

### 2. 与监控系统集成
```bash
# 生成监控数据
systemd-cgtop -r -1 | awk 'NR>1 {
    gsub(/\//, "_", $1)
    print "cgroup_cpu_percent{cgroup=\"" $1 "\"} " $3
    print "cgroup_memory_bytes{cgroup=\"" $1 "\"} " $4
}'
```

### 3. 告警脚本示例
```bash
#!/bin/bash
# 检查CPU使用率过高的控制组
HIGH_CPU_THRESHOLD=80

systemd-cgtop -c -1 | awk -v threshold=$HIGH_CPU_THRESHOLD '
NR>1 && $3 > threshold {
    print "ALERT: " $1 " CPU usage: " $3 "%"
}'
```

## 输出重定向和日志记录

### 1. 基本重定向
```bash
# 记录到文件
systemd-cgtop -b -n 100 > cgroup_monitor.log

# 追加到日志文件
systemd-cgtop -b -1 >> /var/log/cgroup_stats.log
```

### 2. 结构化日志
```bash
# 生成带时间戳的日志
systemd-cgtop -b -n 60 -d 5 | while IFS= read -r line; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') $line"
done > /var/log/cgroup_timeline.log
```

### 3. 数据格式化
```bash
# 生成CSV格式数据
echo "timestamp,cgroup,tasks,cpu_percent,memory" > cgroup_data.csv
systemd-cgtop -r -b -n 24 -d 3600 | awk '
NR>1 {
    gsub(/[^0-9.]/, "", $3)
    gsub(/[^0-9.]/, "", $4)
    print strftime("%Y-%m-%d %H:%M:%S") "," $1 "," $2 "," $3 "," $4
}' >> cgroup_data.csv
```

## 常见问题及解决方案

### 1. 数据不完整问题
**问题**: 显示的资源使用数据不完整或为空

**解决方案**:
```bash
# 启用资源计量
sudo systemctl edit service_name.service
# 添加以下内容：
[Service]
CPUAccounting=1
MemoryAccounting=1
IOAccounting=1

# 重新加载并重启服务
sudo systemctl daemon-reload
sudo systemctl restart service_name.service
```

### 2. 权限问题
**问题**: 无法访问某些控制组信息

**解决方案**:
```bash
# 使用sudo运行
sudo systemd-cgtop

# 或者将用户添加到systemd-journal组
sudo usermod -a -G systemd-journal $USER
```

### 3. 刷新频率过高
**问题**: 刷新频率过高导致系统负载

**解决方案**:
```bash
# 增加刷新间隔
systemd-cgtop -d 5

# 或使用批处理模式
systemd-cgtop -b -n 10 -d 2
```

## 性能优化建议

### 1. 合理设置监控参数
```bash
# 生产环境推荐设置
systemd-cgtop -d 5 --depth=2    # 5秒刷新，限制深度

# 调试环境设置
systemd-cgtop -d 0.5 --depth=4  # 0.5秒刷新，更深层次
```

### 2. 批处理优化
```bash
# 避免长时间运行交互模式
systemd-cgtop -b -n 120 -d 30 > daily_stats.log

# 使用cron定时执行
# 添加到crontab：
# */15 * * * * systemd-cgtop -1 >> /var/log/cgroup_monitor.log
```

### 3. 资源使用控制
```bash
# 限制自身资源使用
systemd-run --slice=monitoring.slice --scope systemd-cgtop
```

## 监控脚本示例

### 1. 系统健康检查脚本
```bash
#!/bin/bash
# system_health_check.sh

echo "=== System Health Check $(date) ==="
echo

# CPU使用率前5名
echo "Top 5 CPU consumers:"
systemd-cgtop -c -1 | head -6

echo

# 内存使用率前5名
echo "Top 5 Memory consumers:"
systemd-cgtop -m -1 | head -6

echo

# I/O活动前5名
echo "Top 5 I/O consumers:"
systemd-cgtop -i -1 | head -6
```

### 2. 资源监控循环脚本
```bash
#!/bin/bash
# resource_monitor.sh

LOG_FILE="/var/log/resource_monitor.log"
INTERVAL=60
COUNT=1440  # 24小时

echo "Starting resource monitoring..."
echo "Log file: $LOG_FILE"
echo "Interval: ${INTERVAL}s"
echo "Duration: $((COUNT * INTERVAL / 3600)) hours"

for ((i=1; i<=COUNT; i++)); do
    {
        echo "=== $(date) ==="
        systemd-cgtop -1
        echo
    } >> "$LOG_FILE"
    
    sleep $INTERVAL
done
```

### 3. 告警系统集成
```bash
#!/bin/bash
# cgroup_alert.sh

CPU_THRESHOLD=80
MEMORY_THRESHOLD=2048  # MB

while true; do
    # 检查CPU使用率
    systemd-cgtop -c -1 | awk -v threshold=$CPU_THRESHOLD '
    NR>1 && $3 > threshold {
        system("echo \"HIGH CPU: " $1 " at " $3 "%\" | mail -s \"CPU Alert\" admin@example.com")
    }'
    
    # 检查内存使用率
    systemd-cgtop -m -1 | awk -v threshold=$MEMORY_THRESHOLD '
    NR>1 && $4 > threshold {
        system("echo \"HIGH MEMORY: " $1 " at " $4 "MB\" | mail -s \"Memory Alert\" admin@example.com")
    }'
    
    sleep 300  # 5分钟检查一次
done
```

## 与其他监控工具的对比

| 特性 | systemd-cgtop | htop | top | iotop |
|------|---------------|------|-----|-------|
| 监控对象 | cgroup控制组 | 进程 | 进程 | I/O活动 |
| 实时更新 | ✓ | ✓ | ✓ | ✓ |
| 交互控制 | ✓ | ✓ | ✓ | ✓ |
| 系统整合 | systemd专用 | 通用 | 通用 | I/O专用 |
| 资源层次 | cgroup层次 | 进程树 | 进程列表 | 进程I/O |
| 容器支持 | 原生支持 | 部分支持 | 部分支持 | 有限支持 |

## 最佳实践

### 1. 日常监控
- 使用合理的刷新间隔（1-5秒）
- 关注CPU、内存、I/O三个维度
- 结合systemctl命令深入分析异常服务

### 2. 性能分析
- 使用批处理模式收集历史数据
- 结合其他系统监控工具进行综合分析
- 关注资源使用趋势而非瞬时值

### 3. 自动化监控
- 编写脚本定期收集数据
- 设置合理的告警阈值
- 集成到现有监控系统中

### 4. 故障排查
- 发现问题后立即切换到高频监控
- 使用原始数据格式获取精确数值
- 结合系统日志进行根因分析

## 总结

`systemd-cgtop` 是现代Linux系统中不可或缺的资源监控工具，特别适用于systemd管理的系统环境。它提供了直观的cgroup级别资源监控功能，帮助系统管理员和开发人员更好地理解和优化系统性能。

通过合理使用其丰富的选项和交互功能，可以有效地监控系统资源使用情况，及时发现和解决性能问题，提升系统的稳定性和效率。

## 参考资料

- [systemd.resource-control(5)](https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html)
- [systemd-cgls(1)](https://www.freedesktop.org/software/systemd/man/systemd-cgls.html)
- [cgroups(7)](https://man7.org/linux/man-pages/man7/cgroups.7.html)
- [systemd官方文档](https://www.freedesktop.org/wiki/Software/systemd/) 