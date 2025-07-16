// 02-channels.go
// 演示Go语言的channels通信机制

package main

import (
    "fmt"
    "math/rand"
    "sync"
    "time"
)

func main() {
    fmt.Println("=== Channels 通信演示 ===")
    
    // 1. 基本的channel操作
    fmt.Println("\n1. 基本的channel操作:")
    basicChannelDemo()
    
    // 2. 带缓冲的channel
    fmt.Println("\n2. 带缓冲的channel:")
    bufferedChannelDemo()
    
    // 3. 关闭channel
    fmt.Println("\n3. 关闭channel:")
    closeChannelDemo()
    
    // 4. 单向channel
    fmt.Println("\n4. 单向channel:")
    unidirectionalChannelDemo()
    
    // 5. select语句
    fmt.Println("\n5. select语句:")
    selectDemo()
    
    // 6. 超时控制
    fmt.Println("\n6. 超时控制:")
    timeoutDemo()
    
    // 7. 非阻塞通信
    fmt.Println("\n7. 非阻塞通信:")
    nonBlockingDemo()
    
    // 8. 多路复用
    fmt.Println("\n8. 多路复用:")
    multiplexingDemo()
    
    // 9. 扇入扇出模式
    fmt.Println("\n9. 扇入扇出模式:")
    fanInFanOutDemo()
    
    // 10. 管道模式
    fmt.Println("\n10. 管道模式:")
    pipelineDemo()
}

func basicChannelDemo() {
    // 创建无缓冲channel
    ch := make(chan string)
    
    // 发送数据（在goroutine中）
    go func() {
        ch <- "Hello from goroutine!"
    }()
    
    // 接收数据
    message := <-ch
    fmt.Printf("收到消息: %s\n", message)
    
    // 双向通信
    go func() {
        ch <- "Message 1"
        ch <- "Message 2"
    }()
    
    fmt.Printf("收到: %s\n", <-ch)
    fmt.Printf("收到: %s\n", <-ch)
}

func bufferedChannelDemo() {
    // 创建带缓冲的channel
    ch := make(chan int, 3)
    
    // 发送数据（不会阻塞，直到缓冲区满）
    ch <- 1
    ch <- 2
    ch <- 3
    
    fmt.Printf("缓冲区长度: %d, 容量: %d\n", len(ch), cap(ch))
    
    // 接收数据
    fmt.Printf("接收: %d\n", <-ch)
    fmt.Printf("接收: %d\n", <-ch)
    fmt.Printf("接收: %d\n", <-ch)
}

func closeChannelDemo() {
    ch := make(chan int, 3)
    
    // 发送数据
    go func() {
        for i := 1; i <= 5; i++ {
            ch <- i
        }
        close(ch) // 关闭channel
    }()
    
    // 接收数据直到channel关闭
    for {
        value, ok := <-ch
        if !ok {
            fmt.Println("Channel已关闭")
            break
        }
        fmt.Printf("接收到: %d\n", value)
    }
    
    // 使用range遍历channel
    ch2 := make(chan string, 3)
    
    go func() {
        fruits := []string{"apple", "banana", "orange"}
        for _, fruit := range fruits {
            ch2 <- fruit
        }
        close(ch2)
    }()
    
    fmt.Println("使用range遍历channel:")
    for fruit := range ch2 {
        fmt.Printf("水果: %s\n", fruit)
    }
}

func unidirectionalChannelDemo() {
    ch := make(chan int)
    
    // 只写channel
    go sender(ch)
    
    // 只读channel
    receiver(ch)
}

func sender(ch chan<- int) {
    for i := 1; i <= 3; i++ {
        ch <- i
        fmt.Printf("发送: %d\n", i)
    }
    close(ch)
}

func receiver(ch <-chan int) {
    for value := range ch {
        fmt.Printf("接收: %d\n", value)
    }
}

func selectDemo() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch1 <- "来自ch1的消息"
    }()
    
    go func() {
        time.Sleep(200 * time.Millisecond)
        ch2 <- "来自ch2的消息"
    }()
    
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Printf("收到ch1: %s\n", msg1)
        case msg2 := <-ch2:
            fmt.Printf("收到ch2: %s\n", msg2)
        }
    }
}

func timeoutDemo() {
    ch := make(chan string, 1)
    
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "延迟消息"
    }()
    
    select {
    case msg := <-ch:
        fmt.Printf("收到消息: %s\n", msg)
    case <-time.After(1 * time.Second):
        fmt.Println("超时了！")
    }
}

func nonBlockingDemo() {
    ch := make(chan string, 1)
    
    // 非阻塞发送
    select {
    case ch <- "非阻塞消息":
        fmt.Println("消息发送成功")
    default:
        fmt.Println("channel满了，发送失败")
    }
    
    // 非阻塞接收
    select {
    case msg := <-ch:
        fmt.Printf("非阻塞接收: %s\n", msg)
    default:
        fmt.Println("channel空了，接收失败")
    }
    
    // 再次非阻塞接收
    select {
    case msg := <-ch:
        fmt.Printf("非阻塞接收: %s\n", msg)
    default:
        fmt.Println("channel空了，接收失败")
    }
}

func multiplexingDemo() {
    // 创建多个输入channel
    ch1 := make(chan string)
    ch2 := make(chan string)
    ch3 := make(chan string)
    
    // 启动多个生产者
    go func() {
        for i := 0; i < 3; i++ {
            ch1 <- fmt.Sprintf("ch1-%d", i)
            time.Sleep(100 * time.Millisecond)
        }
        close(ch1)
    }()
    
    go func() {
        for i := 0; i < 3; i++ {
            ch2 <- fmt.Sprintf("ch2-%d", i)
            time.Sleep(150 * time.Millisecond)
        }
        close(ch2)
    }()
    
    go func() {
        for i := 0; i < 3; i++ {
            ch3 <- fmt.Sprintf("ch3-%d", i)
            time.Sleep(200 * time.Millisecond)
        }
        close(ch3)
    }()
    
    // 多路复用
    for i := 0; i < 9; i++ {
        select {
        case msg, ok := <-ch1:
            if ok {
                fmt.Printf("从ch1收到: %s\n", msg)
            }
        case msg, ok := <-ch2:
            if ok {
                fmt.Printf("从ch2收到: %s\n", msg)
            }
        case msg, ok := <-ch3:
            if ok {
                fmt.Printf("从ch3收到: %s\n", msg)
            }
        }
    }
}

func fanInFanOutDemo() {
    // 输入channel
    input := make(chan int)
    
    // 启动多个worker（扇出）
    ch1 := fanOut(input)
    ch2 := fanOut(input)
    ch3 := fanOut(input)
    
    // 合并输出（扇入）
    output := fanIn(ch1, ch2, ch3)
    
    // 发送任务
    go func() {
        for i := 1; i <= 9; i++ {
            input <- i
        }
        close(input)
    }()
    
    // 接收结果
    for i := 0; i < 9; i++ {
        result := <-output
        fmt.Printf("处理结果: %d\n", result)
    }
}

func fanOut(input <-chan int) <-chan int {
    output := make(chan int)
    
    go func() {
        defer close(output)
        for num := range input {
            // 模拟处理
            time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
            output <- num * num
        }
    }()
    
    return output
}

func fanIn(inputs ...<-chan int) <-chan int {
    output := make(chan int)
    var wg sync.WaitGroup
    
    for _, input := range inputs {
        wg.Add(1)
        go func(ch <-chan int) {
            defer wg.Done()
            for value := range ch {
                output <- value
            }
        }(input)
    }
    
    go func() {
        wg.Wait()
        close(output)
    }()
    
    return output
}

func pipelineDemo() {
    // 创建管道
    numbers := generateNumbers(5)
    squares := squareNumbers(numbers)
    sums := sumNumbers(squares)
    
    // 获取最终结果
    result := <-sums
    fmt.Printf("管道最终结果: %d\n", result)
}

func generateNumbers(n int) <-chan int {
    output := make(chan int)
    
    go func() {
        defer close(output)
        for i := 1; i <= n; i++ {
            output <- i
            fmt.Printf("生成数字: %d\n", i)
        }
    }()
    
    return output
}

func squareNumbers(input <-chan int) <-chan int {
    output := make(chan int)
    
    go func() {
        defer close(output)
        for num := range input {
            squared := num * num
            output <- squared
            fmt.Printf("平方: %d -> %d\n", num, squared)
        }
    }()
    
    return output
}

func sumNumbers(input <-chan int) <-chan int {
    output := make(chan int)
    
    go func() {
        defer close(output)
        sum := 0
        for num := range input {
            sum += num
            fmt.Printf("累加: %d (总和: %d)\n", num, sum)
        }
        output <- sum
    }()
    
    return output
}