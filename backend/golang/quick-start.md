# Go语言快速入门

## 环境搭建

### 1. 安装Go语言

```bash
# 官方下载安装
https://golang.org/dl/

# 或使用包管理器
# macOS
brew install go

# Ubuntu/Debian
sudo apt-get install golang-go

# CentOS/RHEL
sudo yum install golang
```

### 2. 环境变量配置

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export GOROOT=/usr/local/go
```

### 3. 验证安装

```bash
go version
go env
```

## 第一个Go程序

### Hello World

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

### 运行程序

```bash
# 直接运行
go run main.go

# 编译后运行
go build main.go
./main
```

## 核心概念速览

### 1. 变量声明

```go
// 声明并初始化
var name string = "Go"
var age int = 10

// 短变量声明
name := "Go"
age := 10

// 零值
var count int    // 0
var flag bool    // false
var text string  // ""
```

### 2. 数据类型

```go
// 基本类型
var num int = 42
var pi float64 = 3.14
var flag bool = true
var text string = "Hello"

// 复合类型
var nums []int = []int{1, 2, 3}
var person map[string]int = map[string]int{"age": 25}
```

### 3. 函数

```go
// 基本函数
func add(a, b int) int {
    return a + b
}

// 多返回值
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

### 4. 结构体

```go
type Person struct {
    Name string
    Age  int
}

func (p Person) Greet() string {
    return fmt.Sprintf("Hello, I'm %s", p.Name)
}
```

### 5. 并发编程

```go
// Goroutine
go func() {
    fmt.Println("Running in goroutine")
}()

// Channel
ch := make(chan string)
go func() {
    ch <- "Hello from goroutine"
}()
msg := <-ch
```

## 常用命令

### 项目管理

```bash
# 初始化模块
go mod init myproject

# 添加依赖
go get github.com/gin-gonic/gin

# 更新依赖
go get -u

# 清理依赖
go mod tidy
```

### 构建和运行

```bash
# 运行代码
go run main.go

# 编译
go build

# 交叉编译
GOOS=linux GOARCH=amd64 go build

# 测试
go test
go test -v
go test -cover
```

### 代码格式化

```bash
# 格式化代码
go fmt ./...

# 导入排序
goimports -w .

# 代码检查
go vet
```

## 开发工具推荐

### 1. 编辑器/IDE
- **VS Code** + Go扩展
- **GoLand** (JetBrains)
- **Vim** + vim-go
- **Sublime Text** + GoSublime

### 2. 常用工具
- **gofmt** - 代码格式化
- **goimports** - 导入管理
- **golint** - 代码检查
- **go-outline** - 代码结构
- **dlv** - 调试工具

## 学习资源

### 官方资源
- [Go官方文档](https://golang.org/doc/)
- [Go语言之旅](https://tour.golang.org/)
- [Effective Go](https://golang.org/doc/effective_go.html)

### 社区资源
- [Go语言圣经](https://gopl.io/)
- [Go by Example](https://gobyexample.com/)
- [Go语言中文网](https://studygolang.com/)

## 下一步学习

1. 完成 [01-基础入门](./01-基础入门/README.md)
2. 学习 [02-核心语法](./02-核心语法/README.md)
3. 掌握 [03-并发编程](./03-并发编程/README.md)
4. 根据兴趣选择应用方向

开始你的Go语言学习之旅！