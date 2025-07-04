# Context上下文

## 学习目标
- 理解Context的概念和作用
- 掌握Context的创建和使用方法
- 学习超时、取消和值传递的应用
- 掌握Context在实际项目中的最佳实践

## 1. Context基础概念

### 什么是Context
```go
import (
    "context"
    "fmt"
    "time"
)

// Context是Go语言中的上下文管理机制
// 主要用于：
// 1. 取消信号传递
// 2. 超时控制
// 3. 截止时间管理
// 4. 请求范围的值传递

func contextBasics() {
    // 1. 空的context（根context）
    ctx := context.Background()
    fmt.Printf("Background context: %v\n", ctx)
    
    // 2. TODO context（当不确定使用什么context时）
    todoCtx := context.TODO()
    fmt.Printf("TODO context: %v\n", todoCtx)
    
    // 这两个通常用作根context，在main函数或初始化时使用
}
```

### Context接口定义
```go
// Context接口的核心方法：
type Context interface {
    // Done返回一个channel，当context被取消或超时时会关闭
    Done() <-chan struct{}
    
    // Err返回context被取消的原因
    Err() error
    
    // Deadline返回context的截止时间
    Deadline() (deadline time.Time, ok bool)
    
    // Value返回与key关联的值
    Value(key interface{}) interface{}
}

func demonstrateContextInterface() {
    ctx := context.Background()
    
    // 检查Done channel
    select {
    case <-ctx.Done():
        fmt.Println("Context已取消")
    default:
        fmt.Println("Context仍然活跃")
    }
    
    // 检查错误
    if err := ctx.Err(); err != nil {
        fmt.Printf("Context错误: %v\n", err)
    } else {
        fmt.Println("Context无错误")
    }
    
    // 检查截止时间
    if deadline, ok := ctx.Deadline(); ok {
        fmt.Printf("Context截止时间: %v\n", deadline)
    } else {
        fmt.Println("Context无截止时间")
    }
}
```

## 2. Context的创建方式

### WithCancel - 取消控制
```go
func withCancelExample() {
    // 创建可取消的context
    ctx, cancel := context.WithCancel(context.Background())
    
    // 启动一个goroutine执行长时间运行的任务
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("任务被取消:", ctx.Err())
                return
            default:
                fmt.Println("任务正在执行...")
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()
    
    // 让任务运行2秒后取消
    time.Sleep(2 * time.Second)
    fmt.Println("发送取消信号")
    cancel() // 取消context
    
    // 等待一下以看到取消效果
    time.Sleep(1 * time.Second)
}
```

### WithTimeout - 超时控制
```go
func withTimeoutExample() {
    // 创建带超时的context（3秒后自动取消）
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel() // 确保资源被释放
    
    // 模拟一个可能需要很长时间的操作
    result := make(chan string, 1)
    
    go func() {
        // 模拟网络请求或数据库操作
        time.Sleep(5 * time.Second) // 故意超过超时时间
        result <- "操作完成"
    }()
    
    select {
    case res := <-result:
        fmt.Printf("成功获得结果: %s\n", res)
    case <-ctx.Done():
        fmt.Printf("操作超时: %v\n", ctx.Err())
    }
}
```

### WithDeadline - 截止时间控制
```go
func withDeadlineExample() {
    // 设置截止时间为当前时间+2秒
    deadline := time.Now().Add(2 * time.Second)
    ctx, cancel := context.WithDeadline(context.Background(), deadline)
    defer cancel()
    
    // 检查剩余时间
    if deadline, ok := ctx.Deadline(); ok {
        remaining := time.Until(deadline)
        fmt.Printf("剩余时间: %v\n", remaining)
    }
    
    // 执行任务
    select {
    case <-time.After(1 * time.Second):
        fmt.Println("任务在截止时间前完成")
    case <-ctx.Done():
        fmt.Printf("任务因截止时间取消: %v\n", ctx.Err())
    }
}
```

### WithValue - 值传递
```go
type contextKey string

const (
    userIDKey    contextKey = "userID"
    requestIDKey contextKey = "requestID"
    traceIDKey   contextKey = "traceID"
)

func withValueExample() {
    // 创建带值的context
    ctx := context.WithValue(context.Background(), userIDKey, "user123")
    ctx = context.WithValue(ctx, requestIDKey, "req456")
    ctx = context.WithValue(ctx, traceIDKey, "trace789")
    
    // 传递context到函数
    processRequest(ctx)
}

func processRequest(ctx context.Context) {
    // 从context中获取值
    userID := ctx.Value(userIDKey)
    requestID := ctx.Value(requestIDKey)
    traceID := ctx.Value(traceIDKey)
    
    fmt.Printf("处理请求 - 用户: %v, 请求ID: %v, 跟踪ID: %v\n", userID, requestID, traceID)
    
    // 继续传递context
    callDatabase(ctx)
    callExternalAPI(ctx)
}

func callDatabase(ctx context.Context) {
    userID := ctx.Value(userIDKey)
    fmt.Printf("数据库查询 - 用户: %v\n", userID)
}

func callExternalAPI(ctx context.Context) {
    requestID := ctx.Value(requestIDKey)
    fmt.Printf("外部API调用 - 请求ID: %v\n", requestID)
}
```

## 3. Context链式操作

### 组合多种Context功能
```go
func contextChaining() {
    // 从根context开始
    ctx := context.Background()
    
    // 添加值
    ctx = context.WithValue(ctx, userIDKey, "user123")
    
    // 添加超时
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    // 创建可取消的子context
    childCtx, childCancel := context.WithCancel(ctx)
    defer childCancel()
    
    // 使用链式的context
    performComplexOperation(childCtx)
}

func performComplexOperation(ctx context.Context) {
    // 检查context中的信息
    userID := ctx.Value(userIDKey)
    
    if deadline, ok := ctx.Deadline(); ok {
        remaining := time.Until(deadline)
        fmt.Printf("用户 %v 的操作，剩余时间: %v\n", userID, remaining)
    }
    
    // 模拟分步骤的操作
    steps := []string{"验证用户", "获取数据", "处理数据", "保存结果"}
    
    for i, step := range steps {
        select {
        case <-ctx.Done():
            fmt.Printf("操作在步骤 '%s' 被取消: %v\n", step, ctx.Err())
            return
        default:
            fmt.Printf("执行步骤 %d: %s\n", i+1, step)
            time.Sleep(1 * time.Second) // 模拟每步骤的处理时间
        }
    }
    
    fmt.Println("复杂操作完成")
}
```

### 父子Context关系
```go
func parentChildContextDemo() {
    // 父context
    parentCtx, parentCancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer parentCancel()
    
    // 子context1
    child1Ctx, child1Cancel := context.WithTimeout(parentCtx, 3*time.Second)
    defer child1Cancel()
    
    // 子context2
    child2Ctx, child2Cancel := context.WithCancel(parentCtx)
    defer child2Cancel()
    
    var wg sync.WaitGroup
    
    // 启动使用child1的goroutine
    wg.Add(1)
    go func() {
        defer wg.Done()
        select {
        case <-time.After(4 * time.Second):
            fmt.Println("Child1: 任务完成")
        case <-child1Ctx.Done():
            fmt.Printf("Child1: 被取消 - %v\n", child1Ctx.Err())
        }
    }()
    
    // 启动使用child2的goroutine
    wg.Add(1)
    go func() {
        defer wg.Done()
        select {
        case <-time.After(6 * time.Second):
            fmt.Println("Child2: 任务完成")
        case <-child2Ctx.Done():
            fmt.Printf("Child2: 被取消 - %v\n", child2Ctx.Err())
        }
    }()
    
    // 2秒后取消child2
    go func() {
        time.Sleep(2 * time.Second)
        fmt.Println("手动取消child2")
        child2Cancel()
    }()
    
    wg.Wait()
    fmt.Println("所有子任务完成")
}
```

## 4. Context在HTTP中的应用

### HTTP服务器中的Context
```go
import (
    "net/http"
    "log"
)

func httpContextExample() {
    http.HandleFunc("/api/users", userHandler)
    http.HandleFunc("/api/slow", slowHandler)
    
    fmt.Println("服务器启动在 :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func userHandler(w http.ResponseWriter, r *http.Request) {
    // HTTP请求自带context
    ctx := r.Context()
    
    // 添加请求特定的值
    requestID := generateRequestID()
    ctx = context.WithValue(ctx, requestIDKey, requestID)
    
    // 设置超时
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    // 处理请求
    result, err := processUserRequest(ctx, r.URL.Query().Get("id"))
    if err != nil {
        if err == context.DeadlineExceeded {
            http.Error(w, "请求超时", http.StatusRequestTimeout)
            return
        }
        if err == context.Canceled {
            http.Error(w, "请求被取消", http.StatusRequestTimeout)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintf(w, `{"result": "%s", "requestId": "%s"}`, result, requestID)
}

func slowHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    // 模拟长时间运行的操作
    select {
    case <-time.After(10 * time.Second):
        fmt.Fprintf(w, "操作完成")
    case <-ctx.Done():
        // 客户端断开连接或超时
        log.Printf("客户端断开连接: %v", ctx.Err())
        return
    }
}

func processUserRequest(ctx context.Context, userID string) (string, error) {
    requestID := ctx.Value(requestIDKey)
    
    // 模拟数据库查询
    result := make(chan string, 1)
    go func() {
        time.Sleep(2 * time.Second) // 模拟查询时间
        result <- fmt.Sprintf("用户数据: %s", userID)
    }()
    
    select {
    case data := <-result:
        log.Printf("请求 %v: 成功获取用户 %s 的数据", requestID, userID)
        return data, nil
    case <-ctx.Done():
        log.Printf("请求 %v: 被取消", requestID)
        return "", ctx.Err()
    }
}

func generateRequestID() string {
    return fmt.Sprintf("req_%d", time.Now().UnixNano())
}
```

### HTTP客户端中的Context
```go
func httpClientWithContext() {
    // 创建带超时的context
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()
    
    // 创建HTTP请求
    req, err := http.NewRequestWithContext(ctx, "GET", "https://httpbin.org/delay/5", nil)
    if err != nil {
        log.Fatal(err)
    }
    
    // 执行请求
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        if err == context.DeadlineExceeded {
            fmt.Println("请求超时")
        } else {
            fmt.Printf("请求错误: %v\n", err)
        }
        return
    }
    defer resp.Body.Close()
    
    fmt.Printf("响应状态: %s\n", resp.Status)
}
```

## 5. Context最佳实践

### 正确的Context使用
```go
// 正确：将context作为第一个参数
func correctContextUsage(ctx context.Context, userID string) error {
    // 使用context进行超时控制
    select {
    case <-time.After(1 * time.Second):
        return nil
    case <-ctx.Done():
        return ctx.Err()
    }
}

// 错误：不要将context存储在结构体中
type BadService struct {
    ctx context.Context // 错误做法
}

// 正确：每个方法接收context参数
type GoodService struct {
    db Database
}

func (s *GoodService) GetUser(ctx context.Context, userID string) (*User, error) {
    return s.db.QueryUser(ctx, userID)
}

func (s *GoodService) CreateUser(ctx context.Context, user *User) error {
    return s.db.InsertUser(ctx, user)
}
```

### Context值的类型安全
```go
// 定义强类型的context key
type contextKeyType string

const (
    UserContextKey    contextKeyType = "user"
    SessionContextKey contextKeyType = "session"
    TraceContextKey   contextKeyType = "trace"
)

// 类型安全的helper函数
func WithUser(ctx context.Context, user *User) context.Context {
    return context.WithValue(ctx, UserContextKey, user)
}

func GetUser(ctx context.Context) (*User, bool) {
    user, ok := ctx.Value(UserContextKey).(*User)
    return user, ok
}

func WithTrace(ctx context.Context, traceID string) context.Context {
    return context.WithValue(ctx, TraceContextKey, traceID)
}

func GetTrace(ctx context.Context) (string, bool) {
    traceID, ok := ctx.Value(TraceContextKey).(string)
    return traceID, ok
}

// 使用示例
type User struct {
    ID   string
    Name string
}

func typeSafeContextExample() {
    ctx := context.Background()
    user := &User{ID: "123", Name: "Alice"}
    
    // 安全地设置用户
    ctx = WithUser(ctx, user)
    ctx = WithTrace(ctx, "trace-456")
    
    // 安全地获取用户
    if user, ok := GetUser(ctx); ok {
        fmt.Printf("当前用户: %+v\n", user)
    }
    
    if traceID, ok := GetTrace(ctx); ok {
        fmt.Printf("跟踪ID: %s\n", traceID)
    }
}
```

### 中间件模式中的Context
```go
type Middleware func(http.Handler) http.Handler

// 认证中间件
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token == "" {
            http.Error(w, "需要认证", http.StatusUnauthorized)
            return
        }
        
        // 验证token并获取用户信息
        user, err := validateToken(token)
        if err != nil {
            http.Error(w, "无效token", http.StatusUnauthorized)
            return
        }
        
        // 将用户信息添加到context
        ctx := WithUser(r.Context(), user)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// 日志中间件
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        requestID := generateRequestID()
        start := time.Now()
        
        // 添加请求ID到context
        ctx := context.WithValue(r.Context(), requestIDKey, requestID)
        
        // 记录请求开始
        log.Printf("Request %s: %s %s", requestID, r.Method, r.URL.Path)
        
        next.ServeHTTP(w, r.WithContext(ctx))
        
        // 记录请求完成
        duration := time.Since(start)
        log.Printf("Request %s: completed in %v", requestID, duration)
    })
}

// 超时中间件
func TimeoutMiddleware(timeout time.Duration) Middleware {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ctx, cancel := context.WithTimeout(r.Context(), timeout)
            defer cancel()
            
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// 组合中间件
func setupMiddleware() http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/profile", profileHandler)
    
    // 应用中间件链
    handler := LoggingMiddleware(
        AuthMiddleware(
            TimeoutMiddleware(5 * time.Second)(mux),
        ),
    )
    
    return handler
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
    user, ok := GetUser(r.Context())
    if !ok {
        http.Error(w, "用户未找到", http.StatusInternalServerError)
        return
    }
    
    requestID, _ := r.Context().Value(requestIDKey).(string)
    
    response := map[string]interface{}{
        "user":      user,
        "requestId": requestID,
        "timestamp": time.Now(),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func validateToken(token string) (*User, error) {
    // 模拟token验证
    if token == "Bearer valid-token" {
        return &User{ID: "123", Name: "Alice"}, nil
    }
    return nil, fmt.Errorf("invalid token")
}
```

## 6. Context的性能考虑

### 避免过度使用WithValue
```go
// 不好的做法：在context中存储大量值
func badContextUsage() {
    ctx := context.Background()
    
    // 避免存储大量数据
    ctx = context.WithValue(ctx, "data1", make([]byte, 1024*1024)) // 1MB数据
    ctx = context.WithValue(ctx, "data2", make([]byte, 1024*1024)) // 1MB数据
    
    // Context会形成链式结构，查找值需要遍历整个链
}

// 好的做法：只存储少量的标识符
func goodContextUsage() {
    ctx := context.Background()
    
    // 只存储必要的标识符
    ctx = context.WithValue(ctx, userIDKey, "user123")
    ctx = context.WithValue(ctx, requestIDKey, "req456")
    
    // 通过标识符从缓存或数据库获取实际数据
    user := getUserFromCache(ctx, "user123")
    fmt.Printf("用户: %+v\n", user)
}

func getUserFromCache(ctx context.Context, userID string) *User {
    // 从缓存或数据库获取数据
    return &User{ID: userID, Name: "Alice"}
}
```

### Context取消的开销
```go
func contextCancellationOverhead() {
    const numGoroutines = 1000
    
    // 测试WithCancel的开销
    start := time.Now()
    
    ctx, cancel := context.WithCancel(context.Background())
    
    var wg sync.WaitGroup
    for i := 0; i < numGoroutines; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            
            select {
            case <-ctx.Done():
                return
            case <-time.After(time.Millisecond):
                // 模拟短时间工作
            }
        }(i)
    }
    
    // 立即取消所有goroutines
    cancel()
    wg.Wait()
    
    elapsed := time.Since(start)
    fmt.Printf("取消 %d 个goroutines 耗时: %v\n", numGoroutines, elapsed)
}
```

## 7. 实践练习

### 练习1：可取消的文件处理器
```go
// 实现一个可以被取消的文件处理器
type FileProcessor struct {
    // 支持处理大文件
    // 支持取消操作
    // 支持进度报告
}

func (fp *FileProcessor) ProcessFile(ctx context.Context, filename string) error {
    // 实现文件处理逻辑
    // 在处理过程中检查ctx.Done()
    // 返回适当的错误
    return nil
}
```

### 练习2：分布式任务系统
```go
// 实现一个分布式任务系统的客户端
type TaskClient struct {
    // 支持任务提交
    // 支持任务取消
    // 支持超时控制
}

func (tc *TaskClient) SubmitTask(ctx context.Context, task Task) (*TaskResult, error) {
    // 实现任务提交逻辑
    // 使用context进行超时和取消控制
    return nil, nil
}
```

### 练习3：API限流器
```go
// 实现一个带context的API限流器
type RateLimiter struct {
    // 支持令牌桶算法
    // 支持context取消
    // 支持动态调整速率
}

func (rl *RateLimiter) Wait(ctx context.Context) error {
    // 等待获取令牌
    // 支持context取消
    return nil
}
```

## 8. 参考资料

- [Go Context 包文档](https://golang.org/pkg/context/)
- [Go Concurrency Patterns: Context](https://blog.golang.org/context)
- [Context 最佳实践](https://golang.org/doc/effective_go.html#context)
- [Understanding Context in Go](https://www.digitalocean.com/community/tutorials/how-to-use-contexts-in-go)

---

通过本章的学习，你将全面掌握Go语言的Context机制，能够在并发程序中正确地使用Context进行取消控制、超时管理和值传递，编写出更加健壮和可维护的Go程序。