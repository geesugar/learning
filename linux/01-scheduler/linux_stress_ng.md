# stress-ng 系统压力测试工具详解

## 目录
- [概述](#概述)
- [安装方法](#安装方法)
- [基本用法](#基本用法)
- [CPU压力测试](#cpu压力测试)
- [内存压力测试](#内存压力测试)
- [I/O压力测试](#io压力测试)
- [网络压力测试](#网络压力测试)
- [进程和线程测试](#进程和线程测试)
- [文件系统测试](#文件系统测试)
- [高级功能](#高级功能)
- [监控和度量](#监控和度量)
- [实际应用场景](#实际应用场景)
- [最佳实践](#最佳实践)

## 概述

stress-ng（stress Next Generation）是一个现代化的系统压力测试工具，用于对Linux系统的各个组件进行压力测试和基准测试。它是经典stress工具的增强版本，提供了更多的测试类型和更精细的控制选项。

### 主要特性

- **丰富的测试类型**：支持280+种不同的压力测试器（stressor）
- **精确控制**：可以精确控制CPU、内存、I/O等资源的使用
- **性能指标**：提供详细的性能度量和统计信息
- **跨平台支持**：支持Linux、FreeBSD、OpenBSD、NetBSD、Solaris等
- **可配置性强**：支持复杂的测试配置和组合
- **实时监控**：提供实时的系统负载监控

### 应用场景

- **系统稳定性测试**：验证系统在高负载下的稳定性
- **性能基准测试**：测量系统的性能上限
- **硬件验证**：检测硬件故障和热稳定性
- **调度器测试**：验证CPU调度器的行为
- **资源限制测试**：测试cgroup、systemd等资源限制机制
- **电源管理测试**：测试CPU频率调节和电源管理

## 安装方法

### Ubuntu/Debian

```bash
# 从软件仓库安装
sudo apt update
sudo apt install stress-ng

# 安装开发版本（更多功能）
sudo apt install stress-ng-dev
```

### CentOS/RHEL/Fedora

```bash
# RHEL 8+/CentOS 8+/Fedora
sudo dnf install stress-ng

# 旧版本系统
sudo yum install stress-ng

# 从EPEL仓库安装（如果默认仓库没有）
sudo yum install epel-release
sudo yum install stress-ng
```

### 从源码编译

```bash
# 下载源码
git clone https://github.com/ColinIanKing/stress-ng.git
cd stress-ng

# 编译和安装
make
sudo make install

# 或者指定安装路径
make PREFIX=/usr/local install
```

### Docker容器

```bash
# 使用官方Docker镜像
docker run --rm -it colinianking/stress-ng --help

# 运行CPU压力测试
docker run --rm -it colinianking/stress-ng --cpu 4 --timeout 60s
```

## 基本用法

### 命令格式

```bash
stress-ng [OPTIONS] [STRESSOR] [STRESSOR_OPTIONS]
```

### 基本参数

```bash
# 通用选项
--help                    # 显示帮助信息
--version                 # 显示版本信息
--verbose                 # 详细输出模式
--quiet                   # 静默模式
--dry-run                 # 预览模式，不实际执行

# 时间控制
--timeout TIME            # 测试持续时间
--backoff TIME            # 每次操作后的延迟时间

# 输出控制
--metrics                 # 显示性能指标
--metrics-brief           # 显示简化指标
--log-file FILE           # 输出日志到文件
--yaml FILE               # 以YAML格式输出结果

# 系统监控
--tz                      # 显示时区信息
--times                   # 显示时间统计
--verify                  # 验证测试结果的正确性
```

### 基本示例

```bash
# 显示所有可用的压力测试器
stress-ng --help | grep "^  --"

# 运行4个CPU压力测试，持续60秒
stress-ng --cpu 4 --timeout 60s

# 同时进行CPU和内存测试
stress-ng --cpu 2 --vm 1 --vm-bytes 1G --timeout 30s

# 显示详细的性能指标
stress-ng --cpu 4 --timeout 10s --metrics-brief
```

## CPU压力测试

### 基本CPU测试

```bash
# CPU压力测试器选项
--cpu N                   # 启动N个CPU工作进程
--cpu-ops N               # 执行N次CPU操作后停止
--cpu-load PERCENT        # CPU负载百分比（0-100）
--cpu-method METHOD       # CPU测试方法

# 常用CPU测试方法
stress-ng --cpu 1 --cpu-method ackermann --timeout 30s    # 阿克曼函数
stress-ng --cpu 1 --cpu-method fft --timeout 30s          # 快速傅里叶变换
stress-ng --cpu 1 --cpu-method fibonacci --timeout 30s    # 斐波那契数列
stress-ng --cpu 1 --cpu-method pi --timeout 30s           # 圆周率计算
stress-ng --cpu 1 --cpu-method prime --timeout 30s        # 质数计算
stress-ng --cpu 1 --cpu-method sqrt --timeout 30s         # 平方根计算
```

### 高级CPU测试

```bash
# 指定CPU亲和性
stress-ng --cpu 2 --taskset 0,2 --timeout 30s

# 设置进程优先级
stress-ng --cpu 4 --nice 10 --timeout 30s

# 使用特定调度策略
stress-ng --cpu 4 --sched-policy rr --sched-prio 50 --timeout 30s

# CPU热点测试
stress-ng --cpu 4 --cpu-load 75 --timeout 60s

# 多核心协调测试
stress-ng --cpu $(nproc) --cpu-method all --timeout 120s
```

### CPU测试脚本示例

```bash
#!/bin/bash
# cpu_stress_test.sh - CPU压力测试脚本

run_cpu_stress_tests() {
    echo "=========================================="
    echo "CPU压力测试套件"
    echo "=========================================="
    
    local cpu_count=$(nproc)
    echo "检测到 $cpu_count 个CPU核心"
    echo
    
    # 测试1：单核心高强度测试
    echo "测试1: 单核心高强度测试 (60秒)"
    stress-ng --cpu 1 --cpu-method prime --timeout 60s --metrics-brief
    echo
    
    # 测试2：所有核心负载测试
    echo "测试2: 所有核心负载测试 (60秒)"
    stress-ng --cpu $cpu_count --timeout 60s --metrics-brief
    echo
    
    # 测试3：部分负载测试
    echo "测试3: 50%负载测试 (60秒)"
    stress-ng --cpu $cpu_count --cpu-load 50 --timeout 60s --metrics-brief
    echo
    
    # 测试4：浮点运算测试
    echo "测试4: 浮点运算测试 (60秒)"
    stress-ng --cpu $cpu_count --cpu-method fft --timeout 60s --metrics-brief
    echo
    
    # 测试5：混合负载测试
    echo "测试5: 混合负载测试 (120秒)"
    stress-ng --cpu $((cpu_count/2)) --vm 2 --vm-bytes 512M --timeout 120s --metrics-brief
    
    echo "CPU压力测试完成"
}

# 温度监控函数
monitor_temperature() {
    echo "CPU温度监控 (每5秒更新):"
    while true; do
        if command -v sensors >/dev/null 2>&1; then
            echo "$(date '+%H:%M:%S') - $(sensors | grep 'Core' | head -1)"
        else
            echo "$(date '+%H:%M:%S') - 未安装sensors工具"
        fi
        sleep 5
    done
}

# 运行测试
run_cpu_stress_tests
```

## 内存压力测试

### 基本内存测试

```bash
# 内存压力测试器选项
--vm N                    # 启动N个内存工作进程
--vm-bytes SIZE           # 每个进程分配的内存大小
--vm-ops N                # 执行N次内存操作后停止
--vm-hang N               # 挂起分配的内存块数量
--vm-keep                 # 保持内存分配不释放

# 基本内存测试
stress-ng --vm 1 --vm-bytes 1G --timeout 60s              # 1GB内存测试
stress-ng --vm 2 --vm-bytes 512M --timeout 30s            # 2个进程各512MB
stress-ng --vm 4 --vm-bytes 256M --vm-keep --timeout 60s  # 保持内存分配
```

### 内存访问模式测试

```bash
# 不同的内存访问方法
--vm-method METHOD        # 内存测试方法

# 常用内存测试方法
stress-ng --vm 1 --vm-bytes 1G --vm-method flip --timeout 30s      # 位翻转
stress-ng --vm 1 --vm-bytes 1G --vm-method inc --timeout 30s       # 递增模式
stress-ng --vm 1 --vm-bytes 1G --vm-method rand --timeout 30s      # 随机访问
stress-ng --vm 1 --vm-bytes 1G --vm-method zero --timeout 30s      # 零填充
stress-ng --vm 1 --vm-bytes 1G --vm-method write64 --timeout 30s   # 64位写入
```

### 高级内存测试

```bash
# 内存映射测试
stress-ng --mmap 4 --mmap-bytes 256M --timeout 60s

# 共享内存测试
stress-ng --shm 2 --shm-bytes 128M --timeout 30s

# 内存锁定测试
stress-ng --mlock 1 --mlock-bytes 100M --timeout 30s

# 内存保护测试
stress-ng --mprotect 2 --timeout 30s

# 大页内存测试
stress-ng --bigheap 1 --bigheap-growth 4M --timeout 60s
```

### 内存压力测试脚本

```bash
#!/bin/bash
# memory_stress_test.sh - 内存压力测试脚本

run_memory_stress_tests() {
    echo "=========================================="
    echo "内存压力测试套件"
    echo "=========================================="
    
    # 获取系统内存信息
    local total_mem=$(free -m | awk '/^Mem:/{print $2}')
    local available_mem=$(free -m | awk '/^Mem:/{print $7}')
    
    echo "系统内存信息:"
    echo "  总内存: ${total_mem}MB"
    echo "  可用内存: ${available_mem}MB"
    echo
    
    # 计算测试大小（使用可用内存的80%）
    local test_size=$((available_mem * 80 / 100))
    
    # 测试1：基本内存分配测试
    echo "测试1: 基本内存分配测试 (${test_size}MB)"
    stress-ng --vm 1 --vm-bytes ${test_size}M --timeout 60s --metrics-brief
    echo
    
    # 测试2：多进程内存竞争
    echo "测试2: 多进程内存竞争测试"
    stress-ng --vm 4 --vm-bytes $((test_size/4))M --timeout 60s --metrics-brief
    echo
    
    # 测试3：内存访问模式测试
    echo "测试3: 随机内存访问测试"
    stress-ng --vm 2 --vm-bytes 512M --vm-method rand --timeout 60s --metrics-brief
    echo
    
    # 测试4：内存映射测试
    echo "测试4: 内存映射测试"
    stress-ng --mmap 4 --mmap-bytes 256M --timeout 60s --metrics-brief
    echo
    
    # 测试5：共享内存测试
    echo "测试5: 共享内存测试"
    stress-ng --shm 2 --shm-bytes 256M --timeout 60s --metrics-brief
    
    echo "内存压力测试完成"
}

# 内存使用监控
monitor_memory_usage() {
    echo "内存使用监控 (每2秒更新):"
    echo "时间      总计    已用    空闲    缓存    可用"
    echo "--------- ------ ------ ------ ------ ------"
    
    while true; do
        free -m | awk '/^Mem:/{
            printf "%s %6dM %6dM %6dM %6dM %6dM\n", 
            strftime("%H:%M:%S"), $2, $3, $4, $6, $7
        }'
        sleep 2
    done
}

# 运行测试
run_memory_stress_tests
```

## I/O压力测试

### 磁盘I/O测试

```bash
# 基本I/O测试选项
--io N                    # 启动N个I/O工作进程
--io-ops N                # 执行N次I/O操作后停止
--temp-path PATH          # 临时文件路径

# 磁盘I/O测试
stress-ng --io 4 --timeout 60s                           # 基本I/O测试
stress-ng --io 4 --temp-path /tmp --timeout 60s          # 指定临时目录
stress-ng --io 2 --io-ops 10000                          # 执行指定次数操作
```

### 文件系统测试

```bash
# 文件操作测试
--hdd N                   # 硬盘写入测试
--hdd-bytes SIZE          # 写入文件大小
--hdd-write-size SIZE     # 写入块大小

# 文件系统压力测试
stress-ng --hdd 2 --hdd-bytes 1G --timeout 60s           # 硬盘写入测试
stress-ng --hdd 4 --hdd-bytes 512M --hdd-write-size 1M --timeout 60s

# 目录操作测试
stress-ng --dir 4 --timeout 30s                          # 目录操作测试
stress-ng --filename 4 --timeout 30s                     # 文件名操作测试

# 文件锁测试
stress-ng --flock 8 --timeout 30s                        # 文件锁测试
stress-ng --fcntl 4 --timeout 30s                        # fcntl测试
```

### 高级I/O测试

```bash
# 异步I/O测试
stress-ng --aio 4 --aio-requests 16 --timeout 60s

# 内存映射I/O测试
stress-ng --mmap 4 --mmap-bytes 1G --mmap-file --timeout 60s

# 网络文件系统测试
stress-ng --hdd 2 --hdd-bytes 1G --temp-path /nfs/test --timeout 60s

# 同步I/O测试
stress-ng --sync-file 4 --timeout 30s
stress-ng --syncfs 2 --timeout 30s
```

## 网络压力测试

### 网络套接字测试

```bash
# TCP/UDP套接字测试
--sock N                  # 套接字压力测试
--sock-domain DOMAIN      # 套接字域（unix, inet, inet6）
--sock-type TYPE          # 套接字类型（stream, dgram）
--sock-port PORT          # 端口号

# 基本网络测试
stress-ng --sock 4 --timeout 60s                         # 基本套接字测试
stress-ng --sock 8 --sock-domain inet --timeout 60s      # TCP套接字
stress-ng --sock 4 --sock-type dgram --timeout 60s       # UDP套接字
```

### 网络协议测试

```bash
# TCP连接测试
stress-ng --sockpair 8 --timeout 60s                     # 套接字对测试
stress-ng --sockfd 4 --timeout 30s                       # 套接字文件描述符

# Unix域套接字测试
stress-ng --sock 4 --sock-domain unix --timeout 60s

# 网络I/O测试
stress-ng --netdev 2 --timeout 30s                       # 网络设备测试
stress-ng --netlink-proc 4 --timeout 30s                 # Netlink测试
```

## 进程和线程测试

### 进程管理测试

```bash
# 进程创建和管理
--fork N                  # fork进程测试
--exec N                  # exec测试
--wait N                  # wait系统调用测试

# 基本进程测试
stress-ng --fork 8 --timeout 30s                         # 进程创建测试
stress-ng --exec 4 --timeout 30s                         # 程序执行测试
stress-ng --wait 4 --timeout 30s                         # 进程等待测试
```

### 线程测试

```bash
# 线程相关测试
--pthread N               # pthread线程测试
--clone N                 # clone系统调用测试

# 线程压力测试
stress-ng --pthread 16 --timeout 60s                     # 多线程测试
stress-ng --clone 8 --timeout 30s                        # clone测试
```

### 信号和IPC测试

```bash
# 信号处理测试
stress-ng --kill 4 --timeout 30s                         # 信号发送测试
stress-ng --sigfd 4 --timeout 30s                        # signalfd测试

# IPC测试
stress-ng --msg 4 --timeout 30s                          # 消息队列测试
stress-ng --sem 8 --timeout 30s                          # 信号量测试
stress-ng --pipe 8 --timeout 30s                         # 管道测试
```

## 文件系统测试

### 文件操作测试

```bash
# 文件创建和删除
stress-ng --dentry 8 --timeout 60s                       # 目录项测试
stress-ng --filename 4 --timeout 30s                     # 文件名测试
stress-ng --link 4 --timeout 30s                         # 硬链接测试
stress-ng --symlink 4 --timeout 30s                      # 符号链接测试

# 文件属性测试
stress-ng --chmod 4 --timeout 30s                        # 权限变更测试
stress-ng --chown 4 --timeout 30s                        # 所有者变更测试
stress-ng --rename 4 --timeout 30s                       # 文件重命名测试
```

### 扩展属性测试

```bash
# 扩展属性和文件系统特性
stress-ng --xattr 4 --timeout 30s                        # 扩展属性测试
stress-ng --fallocate 4 --timeout 30s                    # 文件预分配测试
stress-ng --fstat 8 --timeout 30s                        # 文件状态测试
```

## 高级功能

### 组合测试

```bash
# 多种压力测试组合
stress-ng --cpu 2 --vm 1 --vm-bytes 1G --io 2 --hdd 1 --hdd-bytes 512M --timeout 120s

# 顺序执行测试
stress-ng --seq 4 --cpu 100 --io 100 --vm 100 --timeout 300s

# 所有测试器执行
stress-ng --all 1 --timeout 30s

# 随机测试器选择
stress-ng --random 8 --timeout 60s
```

### 性能调优选项

```bash
# CPU亲和性设置
stress-ng --cpu 4 --taskset 0,2,4,6 --timeout 60s

# 调度策略设置
stress-ng --cpu 4 --sched-policy fifo --sched-prio 99 --timeout 60s

# 进程优先级设置
stress-ng --cpu 4 --nice -10 --timeout 60s

# 内存策略设置
stress-ng --vm 2 --vm-bytes 1G --madvise willneed --timeout 60s
```

### 高级配置

```bash
# 使用配置文件
stress-ng --config /path/to/stress.conf

# YAML输出格式
stress-ng --cpu 4 --timeout 30s --yaml /tmp/results.yaml

# 日志输出
stress-ng --cpu 4 --timeout 30s --log-file /tmp/stress.log

# 验证模式
stress-ng --cpu 4 --timeout 30s --verify

# 预览模式
stress-ng --cpu 4 --timeout 30s --dry-run
```

## 监控和度量

### 性能指标

```bash
# 显示性能指标
stress-ng --cpu 4 --timeout 30s --metrics

# 简化指标显示
stress-ng --cpu 4 --timeout 30s --metrics-brief

# 显示时间统计
stress-ng --cpu 4 --timeout 30s --times

# 显示操作次数
stress-ng --cpu 4 --cpu-ops 100000 --metrics-brief
```

### 实时监控脚本

```bash
#!/bin/bash
# stress_monitor.sh - stress-ng监控脚本

monitor_stress_test() {
    local duration=${1:-60}
    local log_file="/tmp/stress_monitor_$(date +%Y%m%d_%H%M%S).log"
    
    echo "=========================================="
    echo "Stress-ng系统监控"
    echo "=========================================="
    echo "监控时长: ${duration}秒"
    echo "日志文件: $log_file"
    echo
    
    # 启动stress-ng测试（后台运行）
    stress-ng --cpu 4 --vm 2 --vm-bytes 1G --io 2 --timeout ${duration}s \
              --metrics-brief --log-file "$log_file" &
    local stress_pid=$!
    
    echo "Stress测试进程PID: $stress_pid"
    echo
    
    # 监控系统资源
    echo "时间     CPU%   内存%   负载     温度"
    echo "-------- ----- ------ -------- --------"
    
    for ((i=1; i<=duration; i++)); do
        # CPU使用率
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        
        # 内存使用率
        local mem_usage=$(free | awk '/^Mem:/{printf "%.1f", $3/$2 * 100}')
        
        # 系统负载
        local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
        
        # CPU温度（如果可用）
        local temp="N/A"
        if command -v sensors >/dev/null 2>&1; then
            temp=$(sensors 2>/dev/null | grep 'Core 0' | awk '{print $3}' | head -1)
        fi
        
        printf "%8s %5s %6s%% %8s %8s\n" \
            "$(date +%H:%M:%S)" \
            "${cpu_usage}%" \
            "$mem_usage" \
            "$load_avg" \
            "$temp"
        
        sleep 1
    done
    
    # 等待stress-ng完成
    wait $stress_pid
    
    echo
    echo "监控完成，详细日志: $log_file"
    
    # 显示总结报告
    if [ -f "$log_file" ]; then
        echo
        echo "=========================================="
        echo "测试总结报告"
        echo "=========================================="
        tail -20 "$log_file"
    fi
}

# 运行监控
monitor_stress_test ${1:-60}
```

## 实际应用场景

### 1. 系统稳定性测试

```bash
#!/bin/bash
# system_stability_test.sh - 系统稳定性测试

stability_test() {
    local duration=${1:-3600}  # 默认1小时
    
    echo "=========================================="
    echo "系统稳定性测试 - ${duration}秒"
    echo "=========================================="
    
    # 记录开始状态
    echo "测试开始时间: $(date)"
    echo "系统信息:"
    uname -a
    echo
    echo "CPU信息:"
    lscpu | grep -E "(Model name|CPU\(s\)|Thread|Core)"
    echo
    echo "内存信息:"
    free -h
    echo
    
    # 启动综合压力测试
    echo "启动稳定性测试..."
    stress-ng --cpu $(nproc) \
              --vm $(($(nproc)/2)) --vm-bytes 1G \
              --io 4 \
              --hdd 2 --hdd-bytes 512M \
              --timeout ${duration}s \
              --metrics \
              --log-file "/tmp/stability_test_$(date +%Y%m%d_%H%M%S).log" \
              --verify
    
    local exit_code=$?
    
    echo
    echo "测试完成时间: $(date)"
    echo "退出代码: $exit_code"
    
    if [ $exit_code -eq 0 ]; then
        echo "✓ 稳定性测试通过"
    else
        echo "✗ 稳定性测试失败"
    fi
    
    # 检查系统日志中的错误
    echo
    echo "检查系统错误日志:"
    dmesg | grep -i error | tail -5
}

# 运行测试
stability_test ${1:-3600}
```

### 2. 性能基准测试

```bash
#!/bin/bash
# benchmark_test.sh - 性能基准测试

run_benchmark_suite() {
    local results_dir="/tmp/benchmark_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$results_dir"
    
    echo "=========================================="
    echo "性能基准测试套件"
    echo "=========================================="
    echo "结果目录: $results_dir"
    echo
    
    # CPU基准测试
    echo "1. CPU基准测试"
    echo "----------------"
    
    # 整数运算测试
    echo "整数运算测试..."
    stress-ng --cpu $(nproc) --cpu-method int32 --timeout 60s \
              --metrics-brief --yaml "$results_dir/cpu_int32.yaml"
    
    # 浮点运算测试
    echo "浮点运算测试..."
    stress-ng --cpu $(nproc) --cpu-method float --timeout 60s \
              --metrics-brief --yaml "$results_dir/cpu_float.yaml"
    
    # 内存基准测试
    echo
    echo "2. 内存基准测试"
    echo "----------------"
    
    # 内存带宽测试
    echo "内存带宽测试..."
    stress-ng --vm 1 --vm-bytes 2G --vm-method write64 --timeout 60s \
              --metrics-brief --yaml "$results_dir/memory_bandwidth.yaml"
    
    # 内存延迟测试
    echo "内存延迟测试..."
    stress-ng --vm 1 --vm-bytes 1G --vm-method rand --timeout 60s \
              --metrics-brief --yaml "$results_dir/memory_latency.yaml"
    
    # I/O基准测试
    echo
    echo "3. I/O基准测试"
    echo "---------------"
    
    # 磁盘写入测试
    echo "磁盘写入测试..."
    stress-ng --hdd 1 --hdd-bytes 2G --timeout 60s \
              --metrics-brief --yaml "$results_dir/disk_write.yaml"
    
    # 随机I/O测试
    echo "随机I/O测试..."
    stress-ng --io 4 --timeout 60s \
              --metrics-brief --yaml "$results_dir/random_io.yaml"
    
    echo
    echo "基准测试完成！"
    echo "结果文件保存在: $results_dir"
    
    # 生成汇总报告
    generate_benchmark_report "$results_dir"
}

generate_benchmark_report() {
    local results_dir=$1
    local report_file="$results_dir/benchmark_report.txt"
    
    echo "生成基准测试报告..."
    
    cat > "$report_file" << EOF
====================================
性能基准测试报告
====================================
测试时间: $(date)
系统信息: $(uname -a)
CPU信息: $(lscpu | grep "Model name" | cut -d: -f2 | xargs)
内存信息: $(free -h | grep "Mem:" | awk '{print $2}')

测试结果:
EOF
    
    # 解析YAML结果文件
    for yaml_file in "$results_dir"/*.yaml; do
        if [ -f "$yaml_file" ]; then
            echo "----------------------------------------" >> "$report_file"
            echo "测试: $(basename "$yaml_file" .yaml)" >> "$report_file"
            echo "----------------------------------------" >> "$report_file"
            
            # 提取关键指标
            if command -v yq >/dev/null 2>&1; then
                yq eval '.metrics[0]' "$yaml_file" >> "$report_file" 2>/dev/null
            else
                echo "原始YAML数据:" >> "$report_file"
                cat "$yaml_file" >> "$report_file"
            fi
            echo >> "$report_file"
        fi
    done
    
    echo "报告生成完成: $report_file"
}

# 运行基准测试
run_benchmark_suite
```

### 3. cgroup资源限制测试

```bash
#!/bin/bash
# cgroup_stress_test.sh - cgroup资源限制测试

test_cgroup_limits() {
    local test_cgroup="/sys/fs/cgroup/stress_test"
    
    echo "=========================================="
    echo "Cgroup资源限制测试"
    echo "=========================================="
    
    # 创建测试cgroup
    if [ ! -d "$test_cgroup" ]; then
        sudo mkdir -p "$test_cgroup"
        echo "创建测试cgroup: $test_cgroup"
    fi
    
    # 测试1: CPU限制测试
    echo
    echo "测试1: CPU限制测试 (50%CPU)"
    echo "----------------------------"
    
    # 设置CPU限制为50%
    echo "50000 100000" | sudo tee "$test_cgroup/cpu.max"
    echo "设置CPU限制: 50%"
    
    # 启动CPU密集型任务
    stress-ng --cpu 4 --timeout 60s &
    local stress_pid=$!
    
    # 将进程加入cgroup
    echo $stress_pid | sudo tee "$test_cgroup/cgroup.procs"
    echo "进程 $stress_pid 加入cgroup"
    
    # 监控CPU使用率
    echo "监控CPU使用率..."
    for i in {1..10}; do
        local cpu_usage=$(ps -o %cpu= -p $stress_pid | tr -d ' ')
        echo "  ${i}0秒: CPU使用率 = ${cpu_usage}%"
        sleep 6
    done
    
    # 等待测试完成
    wait $stress_pid
    
    # 显示cgroup统计
    echo
    echo "Cgroup统计信息:"
    cat "$test_cgroup/cpu.stat"
    
    # 测试2: 内存限制测试
    echo
    echo "测试2: 内存限制测试 (1GB)"
    echo "-------------------------"
    
    # 设置内存限制
    echo "1073741824" | sudo tee "$test_cgroup/memory.max"  # 1GB
    echo "设置内存限制: 1GB"
    
    # 启动内存密集型任务
    echo "启动内存密集型任务..."
    stress-ng --vm 1 --vm-bytes 1.5G --timeout 30s &
    local stress_pid=$!
    
    # 将进程加入cgroup
    echo $stress_pid | sudo tee "$test_cgroup/cgroup.procs"
    
    # 监控内存使用
    echo "监控内存使用..."
    for i in {1..6}; do
        if [ -f "$test_cgroup/memory.current" ]; then
            local mem_usage=$(cat "$test_cgroup/memory.current")
            local mem_mb=$((mem_usage / 1024 / 1024))
            echo "  ${i}5秒: 内存使用 = ${mem_mb}MB"
        fi
        sleep 5
    done
    
    # 等待测试完成
    wait $stress_pid 2>/dev/null
    
    # 显示内存统计
    echo
    echo "内存统计信息:"
    if [ -f "$test_cgroup/memory.stat" ]; then
        cat "$test_cgroup/memory.stat"
    fi
    
    # 清理
    echo
    echo "清理测试环境..."
    sudo rmdir "$test_cgroup" 2>/dev/null
    echo "测试完成"
}

# 运行cgroup测试
test_cgroup_limits
```

## 最佳实践

### 1. 安全使用建议

```bash
# 安全使用stress-ng的建议

# 1. 始终设置超时时间
stress-ng --cpu 4 --timeout 60s    # 避免无限期运行

# 2. 监控系统温度
# 在运行高强度测试前检查散热情况

# 3. 逐步增加负载
stress-ng --cpu 1 --timeout 30s    # 先测试单核
stress-ng --cpu 2 --timeout 30s    # 再增加到双核
stress-ng --cpu 4 --timeout 30s    # 最后全核心测试

# 4. 避免在生产环境运行高强度测试
# 使用测试环境或维护窗口期间进行测试

# 5. 监控系统资源
# 运行测试时监控CPU温度、内存使用率等
```

### 2. 故障排除

```bash
# 常见问题及解决方案

# 问题1: stress-ng进程无响应
# 解决: 使用kill命令强制终止
pkill -f stress-ng

# 问题2: 系统负载过高
# 解决: 降低worker数量或添加延迟
stress-ng --cpu 2 --backoff 1000 --timeout 30s

# 问题3: 温度过高
# 解决: 立即停止测试，检查散热
sudo pkill -TERM stress-ng

# 问题4: 内存不足
# 解决: 减少内存测试大小
stress-ng --vm 1 --vm-bytes 512M --timeout 30s

# 问题5: 磁盘空间不足
# 解决: 指定临时目录或减少测试文件大小
stress-ng --hdd 1 --hdd-bytes 100M --temp-path /tmp --timeout 30s
```

### 3. 性能优化技巧

```bash
# 性能优化技巧

# 1. 使用CPU亲和性优化
stress-ng --cpu 4 --taskset 0,2,4,6 --timeout 60s

# 2. 调整进程优先级
stress-ng --cpu 4 --nice -10 --timeout 60s

# 3. 使用特定的调度策略
stress-ng --cpu 4 --sched-policy fifo --sched-prio 50 --timeout 60s

# 4. 优化I/O测试
stress-ng --io 4 --temp-path /dev/shm --timeout 60s  # 使用内存文件系统

# 5. 批量运行测试
stress-ng --sequential 2 --timeout 300s --cpu 100 --io 100 --vm 100
```

### 4. 监控和日志

```bash
# 完整的监控和日志设置

# 1. 详细日志记录
stress-ng --cpu 4 --timeout 60s \
          --log-file /var/log/stress-test.log \
          --verbose

# 2. 性能指标输出
stress-ng --cpu 4 --timeout 60s \
          --metrics \
          --yaml /tmp/stress-results.yaml

# 3. 系统状态监控
stress-ng --cpu 4 --timeout 60s \
          --times \
          --tz

# 4. 验证模式
stress-ng --cpu 4 --timeout 60s \
          --verify \
          --metrics-brief
```

---

## 总结

stress-ng是一个功能强大且灵活的系统压力测试工具，适用于各种测试场景：

- **开发测试**：验证应用程序在高负载下的表现
- **运维监控**：测试系统的稳定性和性能极限
- **硬件验证**：检测硬件故障和热稳定性
- **调度器研究**：研究和验证CPU调度器行为
- **资源管理**：测试cgroup、systemd等资源限制机制

使用stress-ng时请注意：
1. 始终在测试环境中使用
2. 设置合理的超时时间
3. 监控系统温度和资源使用
4. 根据需要调整测试参数
5. 保存测试日志和结果用于分析

通过合理使用stress-ng，可以有效地进行系统性能测试、稳定性验证和硬件检测。 