#!/bin/bash

# CPU利用率低但仍然throttle的场景演示脚本

echo "=== CPU利用率低但仍然throttle的场景分析 ==="

# 创建测试cgroup
TEST_CGROUP="/sys/fs/cgroup/throttle_demo"
if [ ! -d "$TEST_CGROUP" ]; then
    mkdir -p "$TEST_CGROUP"
fi

# 场景1: 突发性任务
echo -e "\n🔍 场景1: 突发性任务模式"
echo "配置: 50% CPU限制 (50ms/100ms)"
echo "50000 100000" > "$TEST_CGROUP/cpu.max"

echo "任务模式: 每100ms中，90ms空闲 + 10ms高强度计算"
echo "预期: 平均CPU利用率约10%，但会发生throttle"

# 创建突发性任务
cat > /tmp/burst_task.c << 'EOF'
#include <stdio.h>
#include <unistd.h>
#include <sys/time.h>

void cpu_burst() {
    struct timeval start, now;
    gettimeofday(&start, NULL);
    
    // 高强度计算10ms
    while (1) {
        gettimeofday(&now, NULL);
        long elapsed = (now.tv_sec - start.tv_sec) * 1000000 + 
                      (now.tv_usec - start.tv_usec);
        if (elapsed >= 10000) break; // 10ms
        
        // 消耗CPU
        volatile int sum = 0;
        for (int i = 0; i < 100000; i++) sum += i;
    }
}

int main() {
    printf("开始突发性任务...\n");
    for (int i = 0; i < 100; i++) {
        cpu_burst();     // 10ms高强度计算
        usleep(90000);   // 90ms休眠
        
        if (i % 10 == 0) {
            printf("完成 %d/100 轮\n", i);
        }
    }
    return 0;
}
EOF

# 编译测试程序
gcc -o /tmp/burst_task /tmp/burst_task.c

# 启动监控
monitor_throttle() {
    local duration=$1
    local interval=1
    
    echo "开始监控throttle情况 (${duration}秒)..."
    echo "时间 | CPU使用率 | throttle周期 | throttle比例"
    echo "----------------------------------------"
    
    local start_time=$(date +%s)
    local prev_throttled=0
    local prev_periods=0
    
    if [ -f "$TEST_CGROUP/cpu.stat" ]; then
        prev_throttled=$(awk '/nr_throttled/{print $2}' "$TEST_CGROUP/cpu.stat")
        prev_periods=$(awk '/nr_periods/{print $2}' "$TEST_CGROUP/cpu.stat")
    fi
    
    while [ $(($(date +%s) - start_time)) -lt $duration ]; do
        if [ -f "$TEST_CGROUP/cpu.stat" ]; then
            local current_throttled=$(awk '/nr_throttled/{print $2}' "$TEST_CGROUP/cpu.stat")
            local current_periods=$(awk '/nr_periods/{print $2}' "$TEST_CGROUP/cpu.stat")
            local usage_usec=$(awk '/usage_usec/{print $2}' "$TEST_CGROUP/cpu.stat")
            
            local throttle_delta=$((current_throttled - prev_throttled))
            local period_delta=$((current_periods - prev_periods))
            
            local throttle_rate="0%"
            if [ $period_delta -gt 0 ]; then
                throttle_rate=$(echo "scale=1; $throttle_delta * 100 / $period_delta" | bc -l 2>/dev/null || echo "0")"%"
            fi
            
            # 计算CPU使用率 (粗略估算)
            local elapsed_time=$(($(date +%s) - start_time))
            local cpu_rate="N/A"
            if [ $elapsed_time -gt 0 ]; then
                cpu_rate=$(echo "scale=1; $usage_usec / ($elapsed_time * 1000000) * 100" | bc -l 2>/dev/null || echo "0")"%"
            fi
            
            printf "%4ds | %8s | %5d | %8s\n" $elapsed_time "$cpu_rate" $throttle_delta "$throttle_rate"
            
            prev_throttled=$current_throttled
            prev_periods=$current_periods
        fi
        
        sleep $interval
    done
}

# 在后台启动监控
monitor_throttle 15 &
MONITOR_PID=$!

# 将任务加入cgroup并运行
echo $$ > "$TEST_CGROUP/cgroup.procs"
/tmp/burst_task &
TASK_PID=$!

# 等待任务完成
wait $TASK_PID
kill $MONITOR_PID 2>/dev/null

echo -e "\n📊 最终统计结果:"
if [ -f "$TEST_CGROUP/cpu.stat" ]; then
    cat "$TEST_CGROUP/cpu.stat"
    
    local final_throttled=$(awk '/nr_throttled/{print $2}' "$TEST_CGROUP/cpu.stat")
    local final_periods=$(awk '/nr_periods/{print $2}' "$TEST_CGROUP/cpu.stat")
    local final_usage=$(awk '/usage_usec/{print $2}' "$TEST_CGROUP/cpu.stat")
    
    if [ $final_periods -gt 0 ]; then
        local total_throttle_rate=$(echo "scale=2; $final_throttled * 100 / $final_periods" | bc -l)
        echo "总throttle比例: ${total_throttle_rate}%"
    fi
    
    echo "平均CPU使用率: $(echo "scale=2; $final_usage / 15000000 * 100" | bc -l)%"
fi

# 场景2: 多线程竞争
echo -e "\n🔍 场景2: 多线程slice竞争"
echo "配置: 200% CPU限制，但多个线程竞争slice"
echo "200000 100000" > "$TEST_CGROUP/cpu.max"

# 创建多线程竞争任务
cat > /tmp/multithread_task.c << 'EOF'
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>
#include <sys/time.h>

void* worker_thread(void* arg) {
    int thread_id = *(int*)arg;
    
    for (int i = 0; i < 10; i++) {
        // 短时间高强度计算
        struct timeval start, now;
        gettimeofday(&start, NULL);
        
        while (1) {
            gettimeofday(&now, NULL);
            long elapsed = (now.tv_sec - start.tv_sec) * 1000000 + 
                          (now.tv_usec - start.tv_usec);
            if (elapsed >= 3000) break; // 3ms
            
            volatile int sum = 0;
            for (int j = 0; j < 50000; j++) sum += j;
        }
        
        usleep(50000); // 50ms休眠
    }
    
    printf("线程 %d 完成\n", thread_id);
    return NULL;
}

int main() {
    pthread_t threads[8];
    int thread_ids[8];
    
    printf("启动8个线程进行slice竞争...\n");
    
    for (int i = 0; i < 8; i++) {
        thread_ids[i] = i;
        pthread_create(&threads[i], NULL, worker_thread, &thread_ids[i]);
    }
    
    for (int i = 0; i < 8; i++) {
        pthread_join(threads[i], NULL);
    }
    
    return 0;
}
EOF

gcc -pthread -o /tmp/multithread_task /tmp/multithread_task.c

echo "运行多线程任务..."
monitor_throttle 10 &
MONITOR_PID=$!

/tmp/multithread_task &
TASK_PID=$!

wait $TASK_PID
kill $MONITOR_PID 2>/dev/null

echo -e "\n📊 多线程场景统计:"
if [ -f "$TEST_CGROUP/cpu.stat" ]; then
    cat "$TEST_CGROUP/cpu.stat"
fi

# 场景3: 层次化throttle
echo -e "\n🔍 场景3: 层次化throttle"
PARENT_CGROUP="/sys/fs/cgroup/parent_throttle"
CHILD_CGROUP="/sys/fs/cgroup/parent_throttle/child"

mkdir -p "$CHILD_CGROUP"

echo "父cgroup限制: 30% CPU"
echo "30000 100000" > "$PARENT_CGROUP/cpu.max"

echo "子cgroup限制: 50% CPU (但受父cgroup限制)"
echo "50000 100000" > "$CHILD_CGROUP/cpu.max"

echo "子cgroup中运行轻量级任务..."
echo $$ > "$CHILD_CGROUP/cgroup.procs"

# 轻量级任务
sleep 5 &
LIGHT_TASK_PID=$!

# 同时在父cgroup中运行重任务
echo $$ > "$PARENT_CGROUP/cgroup.procs"
dd if=/dev/zero of=/dev/null bs=1M count=1000 2>/dev/null &
HEAVY_TASK_PID=$!

sleep 3
kill $HEAVY_TASK_PID 2>/dev/null
wait $LIGHT_TASK_PID

echo "子cgroup统计 (应该显示throttle，即使任务很轻):"
cat "$CHILD_CGROUP/cpu.stat" 2>/dev/null || echo "无统计数据"

# 清理
echo $$ > /sys/fs/cgroup/cgroup.procs
rm -rf "$TEST_CGROUP" "$PARENT_CGROUP" 2>/dev/null
rm -f /tmp/burst_task /tmp/multithread_task /tmp/burst_task.c /tmp/multithread_task.c

echo -e "\n✅ 演示完成！"
echo -e "\n📝 总结："
echo "1. 突发性任务：平均利用率低，但短时间内超过配额限制"
echo "2. 多线程竞争：slice分配机制导致的throttle"
echo "3. 层次化限制：父cgroup限制影响子cgroup"
echo "4. 这些场景说明throttle是基于时间窗口的瞬时控制，而非平均利用率控制" 