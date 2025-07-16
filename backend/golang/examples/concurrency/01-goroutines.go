// 01-goroutines.go
// 演示Go语言的goroutines基础用法

package main

import (
    "fmt"
    "runtime"
    "sync"
    "time"
)

func main() {
    fmt.Println("=== Goroutines 基础演示 ===")
    
    // 1. 基本的goroutine
    fmt.Println("\n1. 基本的goroutine:")
    go sayHello("World")
    
    // 主goroutine需要等待，否则程序会立即退出
    time.Sleep(100 * time.Millisecond)
    
    // 2. 启动多个goroutine
    fmt.Println("\n2. 启动多个goroutine:")
    for i := 0; i < 5; i++ {
        go func(id int) {
            fmt.Printf("Goroutine %d is running\n", id)
        }(i)
    }
    
    time.Sleep(100 * time.Millisecond)
    
    // 3. 使用WaitGroup等待goroutine完成
    fmt.Println("\n3. 使用WaitGroup:")
    var wg sync.WaitGroup
    
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Printf("Worker %d started\n", id)
            time.Sleep(time.Duration(id+1) * 100 * time.Millisecond)
            fmt.Printf("Worker %d finished\n", id)
        }(i)
    }
    
    wg.Wait()
    fmt.Println("All workers completed")
    
    // 4. 演示goroutine的并发执行
    fmt.Println("\n4. 并发执行演示:")
    start := time.Now()
    
    var wg2 sync.WaitGroup
    tasks := []string{"Task A", "Task B", "Task C", "Task D"}
    
    for _, task := range tasks {
        wg2.Add(1)
        go func(taskName string) {
            defer wg2.Done()
            executeTask(taskName)
        }(task)
    }
    
    wg2.Wait()
    fmt.Printf("All tasks completed in %v\n", time.Since(start))
    
    // 5. 控制goroutine数量
    fmt.Println("\n5. 控制goroutine数量:")
    maxGoroutines := 3
    semaphore := make(chan struct{}, maxGoroutines)
    
    var wg3 sync.WaitGroup
    
    for i := 0; i < 10; i++ {
        wg3.Add(1)
        go func(id int) {
            defer wg3.Done()
            
            // 获取信号量
            semaphore <- struct{}{}
            defer func() { <-semaphore }()
            
            fmt.Printf("Limited goroutine %d is running\n", id)
            time.Sleep(200 * time.Millisecond)
        }(i)
    }
    
    wg3.Wait()
    
    // 6. 检查goroutine数量
    fmt.Println("\n6. Goroutine统计:")
    fmt.Printf("当前goroutine数量: %d\n", runtime.NumGoroutine())
    fmt.Printf("CPU核心数: %d\n", runtime.NumCPU())
    fmt.Printf("GOMAXPROCS: %d\n", runtime.GOMAXPROCS(0))
    
    // 7. 匿名goroutine
    fmt.Println("\n7. 匿名goroutine:")
    done := make(chan bool)
    
    go func() {
        fmt.Println("匿名goroutine开始执行")
        time.Sleep(100 * time.Millisecond)
        fmt.Println("匿名goroutine执行完毕")
        done <- true
    }()
    
    <-done
    fmt.Println("匿名goroutine已完成")
    
    // 8. 错误处理
    fmt.Println("\n8. 错误处理:")
    var wg4 sync.WaitGroup
    errorChan := make(chan error, 3)
    
    for i := 0; i < 3; i++ {
        wg4.Add(1)
        go func(id int) {
            defer wg4.Done()
            
            err := riskyOperation(id)
            if err != nil {
                errorChan <- err
            }
        }(i)
    }
    
    // 等待所有goroutine完成
    go func() {
        wg4.Wait()
        close(errorChan)
    }()
    
    // 收集错误
    for err := range errorChan {
        fmt.Printf("错误: %v\n", err)
    }
    
    // 9. 生产者-消费者模式
    fmt.Println("\n9. 生产者-消费者模式:")
    jobs := make(chan int, 5)
    results := make(chan int, 5)
    
    // 启动3个worker goroutine
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送5个任务
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for r := 1; r <= 5; r++ {
        <-results
    }
    
    fmt.Println("所有任务处理完成")
}

func sayHello(name string) {
    fmt.Printf("Hello, %s!\n", name)
}

func executeTask(taskName string) {
    fmt.Printf("%s 开始执行\n", taskName)
    
    // 模拟任务执行时间
    time.Sleep(time.Duration(len(taskName)) * 50 * time.Millisecond)
    
    fmt.Printf("%s 执行完成\n", taskName)
}

func riskyOperation(id int) error {
    time.Sleep(100 * time.Millisecond)
    
    if id == 1 {
        return fmt.Errorf("operation %d failed", id)
    }
    
    fmt.Printf("Operation %d succeeded\n", id)
    return nil
}

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d 开始处理任务 %d\n", id, j)
        time.Sleep(time.Second)
        fmt.Printf("Worker %d 完成任务 %d\n", id, j)
        results <- j * 2
    }
}