// 01-hello-world.go
// 演示Go语言的基本语法和Hello World程序

package main

import (
    "fmt"
    "os"
)

func main() {
    // 基本的Hello World
    fmt.Println("Hello, World!")
    
    // 使用Printf格式化输出
    name := "Go"
    version := 1.21
    fmt.Printf("Hello, %s %.2f!\n", name, version)
    
    // 获取命令行参数
    if len(os.Args) > 1 {
        fmt.Printf("Hello, %s!\n", os.Args[1])
    }
    
    // 演示变量声明
    var message string = "Welcome to Go programming"
    fmt.Println(message)
    
    // 短变量声明
    greeting := "你好，世界！"
    fmt.Println(greeting)
    
    // 常量
    const MaxUsers = 100
    fmt.Printf("Maximum users: %d\n", MaxUsers)
    
    // 多变量声明
    var (
        count    int     = 42
        pi       float64 = 3.14159
        active   bool    = true
        username string  = "admin"
    )
    
    fmt.Printf("Count: %d, Pi: %.5f, Active: %t, User: %s\n", 
        count, pi, active, username)
}