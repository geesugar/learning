# Goroutines基础

## 学习目标
- 理解Goroutines的概念和原理
- 掌握Goroutines的创建和管理
- 学习Goroutines的生命周期
- 了解并发编程的基本概念

## 1. Goroutines概念

### 什么是Goroutines
**Goroutines是Go语言中的轻量级线程**

- **轻量级**: 初始栈空间仅约2KB，可动态增长
- **高效**: 创建和销毁开销极小
- **并发**: 可以同时运行数千甚至数万个
- **合作式**: 由Go运行时调度，非抢占式

### 与线程的比较
```go
// 线程 vs Goroutines

// 传统线程（其他语言）
// - 占用8MB左右内存
// - 创建开销大
// - 上下文切换昂贵
// - 由操作系统调度

// Goroutines
// - 初始仅2KB内存
// - 创建开销极小
// - 上下文切换快速
// - 由Go运行时调度

func demonstrateGoroutines() {
    fmt.Println("主线程开始")
    
    // 启动一个goroutine
    go func() {
        fmt.Println("这是一个goroutine")
    }()
    
    // 等待一下，让goroutine有机会执行
    time.Sleep(100 * time.Millisecond)
    fmt.Println("主线程结束")
}
```

## 2. 创建和启动Goroutines

### 基本语法
```go
// 基本的goroutine创建
func basicGoroutine() {
    // 方式1：使用匿名函数
    go func() {
        fmt.Println("Hello from goroutine!")
    }()
    
    // 方式2：调用已存在的函数
    go sayHello("Alice")
    
    // 方式3：传递参数的匿名函数
    name := "Bob"
    go func(n string) {
        fmt.Printf("Hello, %s!\n", n)
    }(name)
    
    // 等待goroutines执行
    time.Sleep(100 * time.Millisecond)
}

func sayHello(name string) {
    fmt.Printf("Hello, %s from function!\n", name)
}
```

### 多个Goroutines
```go
func multipleGoroutines() {
    fmt.Println("启动多个goroutines")
    
    // 启动多个goroutines
    for i := 0; i < 5; i++ {
        go func(id int) {
            fmt.Printf("Goroutine %d 正在运行\n", id)
            time.Sleep(time.Duration(id*100) * time.Millisecond)
            fmt.Printf("Goroutine %d 完成\n", id)
        }(i) // 注意：传递i的值，而不是引用
    }
    
    // 等待所有goroutines完成
    time.Sleep(time.Second)
    fmt.Println("所有goroutines完成")
}
```

### 常见错误和注意事项
```go
// 错误示例：闭包中的变量捕获
func commonMistake() {
    fmt.Println("常见错误示例:")
    
    // 错误的做法
    for i := 0; i < 3; i++ {
        go func() {
            fmt.Printf("错误: %d\n", i) // 可能打印出3个3
        }()
    }
    
    time.Sleep(100 * time.Millisecond)
    
    // 正确的做法
    for i := 0; i < 3; i++ {
        go func(index int) {
            fmt.Printf("正确: %d\n", index)
        }(i) // 传递参数
    }
    
    time.Sleep(100 * time.Millisecond)
}
```

## 3. Goroutines生命周期

### 生命周期状态
```go
// Goroutine的生命周期
// 1. 创建（Created）
// 2. 就绪（Runnable）
// 3. 运行（Running）
// 4. 阻塞（Blocked）
// 5. 结束（Dead）

func demonstrateLifecycle() {
    fmt.Println("Goroutine生命周期演示")
    
    // 创建并启动goroutine
    go func() {
        fmt.Println("1. Goroutine开始执行")
        
        // 模拟工作
        for i := 0; i < 3; i++ {
            fmt.Printf("2. 正在工作... %d\n", i+1)
            time.Sleep(100 * time.Millisecond) // 阻塞状态
        }
        
        fmt.Println("3. Goroutine完成")
    }() // 立即变为就绪状态
    
    // 主线程等待
    time.Sleep(500 * time.Millisecond)
}
```

### Goroutines的终止
```go
// Goroutine会在以下情况下终止：
// 1. 函数正常返回
// 2. 出现panic且未被recover
// 3. 主程序退出

func terminationExample() {
    fmt.Println("Goroutine终止示例")
    
    // 正常终止
    go func() {
        fmt.Println("正常执行完成")
        return // 正常终止
    }()
    
    // panic终止（会导致整个程序崩溃）
    go func() {
        defer func() {
            if r := recover(); r != nil {
                fmt.Printf("Goroutine恢复了panic: %v\n", r)
            }
        }()
        panic("出现错误!") // 被recover捕获
    }()
    
    time.Sleep(100 * time.Millisecond)
    fmt.Println("主程序继续运行")
}
```

## 4. Goroutines调度机制

### Go运行时调度器
```go
// Go使用M:N调度模型
// M: 操作系统线程（OS Thread）
// N: Goroutines
// P: 处理器（Processor）

func schedulerDemo() {
    runtime.GOMAXPROCS(2) // 设置最大处理器数量
    
    fmt.Printf("当前处理器数量: %d\n", runtime.GOMAXPROCS(0))
    fmt.Printf("当前Goroutine数量: %d\n", runtime.NumGoroutine())
    
    // 启动一些goroutines
    for i := 0; i < 5; i++ {
        go func(id int) {
            for j := 0; j < 1000000; j++ {
                // CPU密集型任务
            }
            fmt.Printf("Goroutine %d 完成\n", id)
        }(i)
    }
    
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("执行中的Goroutine数量: %d\n", runtime.NumGoroutine())
}
```

### 协作式调度
```go
// Goroutines是协作式的，会在以下情况下让出执行权：
// 1. 调用阻塞操作（如I/O）
// 2. 调用runtime.Gosched()
// 3. 调用channel操作
// 4. 调用锁操作
// 5. 新建goroutine

func cooperativeScheduling() {
    fmt.Println("协作式调度演示")
    
    go func() {
        for i := 0; i < 5; i++ {
            fmt.Printf("Goroutine A: %d\n", i)
            runtime.Gosched() // 主动让出执行权
        }
    }()
    
    go func() {
        for i := 0; i < 5; i++ {
            fmt.Printf("Goroutine B: %d\n", i)
            runtime.Gosched() // 主动让出执行权
        }
    }()
    
    time.Sleep(100 * time.Millisecond)
}
```

## 5. 并发安全问题

### 竞态条件示例
```go
var counter int

// 不安全的并发操作
func unsafeConcurrency() {
    fmt.Println("不安全的并发操作")
    
    for i := 0; i < 1000; i++ {
        go func() {
            counter++ // 竞态条件！
        }()
    }
    
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("最终计数器值: %d (期望: 1000)\n", counter)
}

// 使用原子操作解决
var atomicCounter int64

func safeConcurrency() {
    fmt.Println("安全的并发操作")
    
    for i := 0; i < 1000; i++ {
        go func() {
            atomic.AddInt64(&atomicCounter, 1) // 原子操作
        }()
    }
    
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("最终计数器值: %d\n", atomic.LoadInt64(&atomicCounter))
}
```

### 数据竞争检测
```go
// 使用 -race 标志检测数据竞争
// go run -race main.go

func raceConditionExample() {
    var data = make(map[string]int)
    
    // 写操作
    go func() {
        for i := 0; i < 100; i++ {
            data["key"] = i // 写操作
        }
    }()
    
    // 读操作
    go func() {
        for i := 0; i < 100; i++ {
            _ = data["key"] // 读操作
        }
    }()
    
    time.Sleep(100 * time.Millisecond)
}
```

## 6. Goroutines最佳实践

### 合理控制Goroutines数量
```go
// Worker Pool模式
func workerPool() {
    const numWorkers = 3
    const numJobs = 10
    
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)
    
    // 启动固定数量的workers
    for w := 1; w <= numWorkers; w++ {
        go func(id int) {
            for job := range jobs {
                fmt.Printf("Worker %d 处理任务 %d\n", id, job)
                time.Sleep(100 * time.Millisecond) // 模拟工作
                results <- job * 2
            }
        }(w)
    }
    
    // 发送任务
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for r := 1; r <= numJobs; r++ {
        result := <-results
        fmt.Printf("结果: %d\n", result)
    }
}
```

### 错误处理
```go
// Goroutine中的错误处理
func goroutineErrorHandling() {
    errChan := make(chan error, 1)
    
    go func() {
        defer func() {
            if r := recover(); r != nil {
                errChan <- fmt.Errorf("goroutine panic: %v", r)
            } else {
                errChan <- nil // 正常完成
            }
        }()
        
        // 模拟可能出错的工作
        if time.Now().Unix()%2 == 0 {
            panic("随机错误!")
        }
        
        fmt.Println("工作正常完成")
    }()
    
    // 等待结果
    if err := <-errChan; err != nil {
        fmt.Printf("遇到错误: %v\n", err)
    } else {
        fmt.Println("任务成功完成")
    }
}
```

## 7. 实践练习

### 练习1：并发下载器
```go
// 实现一个简单的并发下载器
func concurrentDownloader(urls []string) {
    // 使用goroutines并发下载多个URL
    // 控制并发数量
    // 处理下载结果和错误
}
```

### 练习2：简单的Web爬虫
```go
// 实现一个并发Web爬虫
func webCrawler(startURL string, maxDepth int) {
    // 使用goroutines并发爬取网页
    // 防止重复爬取
    // 控制爬取深度
}
```

### 练习3：并发数学计算
```go
// 实现并发矩阵乘法
func concurrentMatrixMultiply(a, b [][]int) [][]int {
    // 使用goroutines并发计算矩阵乘法
    // 合理分配任务
    // 等待所有计算完成
}
```

## 8. 调试和性能分析

### Goroutines信息查看
```go
func goroutineInfo() {
    fmt.Printf("当前Goroutine数量: %d\n", runtime.NumGoroutine())
    fmt.Printf("当前CPU数量: %d\n", runtime.NumCPU())
    fmt.Printf("当前处理器数量: %d\n", runtime.GOMAXPROCS(0))
    
    // 获取堆栈信息
    buf := make([]byte, 1024*1024)
    n := runtime.Stack(buf, true) // true表示所有goroutines
    fmt.Printf("堆栈信息\n%s\n", buf[:n])
}
```

### 性能监控
```go
// 使用pprof监控goroutines
// import _ "net/http/pprof"

func startProfiler() {
    go func() {
        log.Println(http.ListenAndServe("localhost:6060", nil))
    }()
    
    // 访问http://localhost:6060/debug/pprof/goroutine
    // 查看goroutines的详细信息
}
```

## 9. 参考资料

- [Go语言规范 - Goroutines](https://golang.org/ref/spec#Go_statements)
- [Effective Go - Goroutines](https://golang.org/doc/effective_go.html#goroutines)
- [Go Concurrency Patterns](https://talks.golang.org/2012/concurrency.slide)
- [Advanced Go Concurrency Patterns](https://talks.golang.org/2013/advconc.slide)

---

通过本章的学习，你将深入理解Goroutines的原理和使用方法，为掌握Go语言的并发编程打下坚实的基础。