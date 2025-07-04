# HTTP服务器基础

## 学习目标
- 掌握net/http包的基本使用
- 学习HTTP请求和响应处理
- 理解路由和中间件概念
- 掌握静态文件服务和模板渲染

## 1. 基本HTTP服务器

### 简单HTTP服务器
```go
package main

import (
    "fmt"
    "log"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    // 注册路由处理函数
    http.HandleFunc("/", helloHandler)
    
    // 启动HTTP服务器
    fmt.Println("服务器启动在端口 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### 自定义ServeMux
```go
func customServeMux() {
    // 创建自定义路由器
    mux := http.NewServeMux()
    
    // 注册不同路径的处理函数
    mux.HandleFunc("/", homeHandler)
    mux.HandleFunc("/about", aboutHandler)
    mux.HandleFunc("/contact", contactHandler)
    mux.HandleFunc("/api/users", usersHandler)
    
    // 启动服务器
    server := &http.Server{
        Addr:    ":8080",
        Handler: mux,
    }
    
    fmt.Println("服务器启动在端口 8080")
    log.Fatal(server.ListenAndServe())
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "欢迎来到首页!")
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "关于我们页面")
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "联系我们页面")
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "用户API端点")
}
```

### HTTP方法处理
```go
func methodHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        handleGet(w, r)
    case http.MethodPost:
        handlePost(w, r)
    case http.MethodPut:
        handlePut(w, r)
    case http.MethodDelete:
        handleDelete(w, r)
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
        fmt.Fprintf(w, "方法 %s 不被支持", r.Method)
    }
}

func handleGet(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "处理 GET 请求")
}

func handlePost(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "处理 POST 请求")
}

func handlePut(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "处理 PUT 请求")
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "处理 DELETE 请求")
}
```

## 2. 请求和响应处理

### 请求参数处理
```go
import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "net/url"
)

func requestHandler(w http.ResponseWriter, r *http.Request) {
    // 解析URL参数
    err := r.ParseForm()
    if err != nil {
        http.Error(w, "解析表单失败", http.StatusBadRequest)
        return
    }
    
    // 获取查询参数
    name := r.URL.Query().Get("name")
    age := r.URL.Query().Get("age")
    
    // 获取表单数据
    email := r.FormValue("email")
    
    // 获取所有参数值
    tags := r.Form["tags"] // 获取数组参数
    
    fmt.Fprintf(w, "姓名: %s, 年龄: %s, 邮箱: %s, 标签: %v\n", 
                name, age, email, tags)
}

func jsonHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 读取请求体
    body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "读取请求体失败", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()
    
    // 解析JSON数据
    var data map[string]interface{}
    if err := json.Unmarshal(body, &data); err != nil {
        http.Error(w, "JSON解析失败", http.StatusBadRequest)
        return
    }
    
    // 处理数据
    fmt.Printf("收到JSON数据: %+v\n", data)
    
    // 返回JSON响应
    w.Header().Set("Content-Type", "application/json")
    response := map[string]string{"status": "success", "message": "数据处理成功"}
    json.NewEncoder(w).Encode(response)
}
```

### 文件上传处理
```go
import (
    "fmt"
    "io"
    "net/http"
    "os"
    "path/filepath"
)

func uploadHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 设置最大上传大小 (10MB)
    r.ParseMultipartForm(10 << 20)
    
    // 获取上传的文件
    file, handler, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "获取文件失败", http.StatusBadRequest)
        return
    }
    defer file.Close()
    
    // 创建保存文件
    dst, err := os.Create(filepath.Join("uploads", handler.Filename))
    if err != nil {
        http.Error(w, "创建文件失败", http.StatusInternalServerError)
        return
    }
    defer dst.Close()
    
    // 复制文件内容
    if _, err := io.Copy(dst, file); err != nil {
        http.Error(w, "保存文件失败", http.StatusInternalServerError)
        return
    }
    
    fmt.Fprintf(w, "文件 %s 上传成功", handler.Filename)
}

func multipleUploadHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 解析多部分表单
    err := r.ParseMultipartForm(32 << 20) // 32MB
    if err != nil {
        http.Error(w, "解析表单失败", http.StatusBadRequest)
        return
    }
    
    // 获取多个文件
    files := r.MultipartForm.File["files"]
    
    var uploadedFiles []string
    for _, fileHeader := range files {
        // 打开文件
        file, err := fileHeader.Open()
        if err != nil {
            http.Error(w, "打开文件失败", http.StatusBadRequest)
            return
        }
        defer file.Close()
        
        // 保存文件
        dst, err := os.Create(filepath.Join("uploads", fileHeader.Filename))
        if err != nil {
            http.Error(w, "创建文件失败", http.StatusInternalServerError)
            return
        }
        defer dst.Close()
        
        if _, err := io.Copy(dst, file); err != nil {
            http.Error(w, "保存文件失败", http.StatusInternalServerError)
            return
        }
        
        uploadedFiles = append(uploadedFiles, fileHeader.Filename)
    }
    
    fmt.Fprintf(w, "成功上传 %d 个文件: %v", len(uploadedFiles), uploadedFiles)
}
```

### 响应处理
```go
func responseHandler(w http.ResponseWriter, r *http.Request) {
    switch r.URL.Path {
    case "/text":
        textResponse(w, r)
    case "/json":
        jsonResponse(w, r)
    case "/html":
        htmlResponse(w, r)
    case "/redirect":
        redirectResponse(w, r)
    case "/error":
        errorResponse(w, r)
    default:
        w.WriteHeader(http.StatusNotFound)
        fmt.Fprintf(w, "页面未找到")
    }
}

func textResponse(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    fmt.Fprintf(w, "这是纯文本响应")
}

func jsonResponse(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    data := map[string]interface{}{
        "message": "Hello, JSON!",
        "timestamp": time.Now().Unix(),
        "data": map[string]string{
            "name": "Go",
            "version": "1.21",
        },
    }
    
    json.NewEncoder(w).Encode(data)
}

func htmlResponse(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    
    html := `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Go HTTP服务器</title>
    </head>
    <body>
        <h1>欢迎使用Go HTTP服务器</h1>
        <p>当前时间: %s</p>
    </body>
    </html>
    `
    
    fmt.Fprintf(w, html, time.Now().Format("2006-01-02 15:04:05"))
}

func redirectResponse(w http.ResponseWriter, r *http.Request) {
    http.Redirect(w, r, "/", http.StatusFound)
}

func errorResponse(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusInternalServerError)
    fmt.Fprintf(w, "服务器内部错误")
}
```

## 3. 路由和中间件

### 高级路由处理
```go
import (
    "net/http"
    "regexp"
    "strings"
)

type Router struct {
    routes map[string]map[string]http.HandlerFunc
    patterns map[string]*regexp.Regexp
}

func NewRouter() *Router {
    return &Router{
        routes: make(map[string]map[string]http.HandlerFunc),
        patterns: make(map[string]*regexp.Regexp),
    }
}

func (r *Router) Add(method, pattern string, handler http.HandlerFunc) {
    if r.routes[method] == nil {
        r.routes[method] = make(map[string]http.HandlerFunc)
    }
    r.routes[method][pattern] = handler
    
    // 编译正则表达式模式
    regexPattern := strings.ReplaceAll(pattern, "{id}", `(\d+)`)
    regexPattern = strings.ReplaceAll(regexPattern, "{name}", `(\w+)`)
    r.patterns[pattern] = regexp.MustCompile("^" + regexPattern + "$")
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    handlers := r.routes[req.Method]
    if handlers == nil {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 精确匹配
    if handler, exists := handlers[req.URL.Path]; exists {
        handler(w, req)
        return
    }
    
    // 模式匹配
    for pattern, handler := range handlers {
        if regex, exists := r.patterns[pattern]; exists {
            if regex.MatchString(req.URL.Path) {
                handler(w, req)
                return
            }
        }
    }
    
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintf(w, "页面未找到")
}

// 使用示例
func routerExample() {
    router := NewRouter()
    
    // 注册路由
    router.Add("GET", "/", homeHandler)
    router.Add("GET", "/users", listUsersHandler)
    router.Add("GET", "/users/{id}", getUserHandler)
    router.Add("POST", "/users", createUserHandler)
    router.Add("PUT", "/users/{id}", updateUserHandler)
    router.Add("DELETE", "/users/{id}", deleteUserHandler)
    
    // 启动服务器
    fmt.Println("服务器启动在端口 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

func listUsersHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "用户列表")
}

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "获取用户信息")
}

func createUserHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "创建用户")
}

func updateUserHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "更新用户")
}

func deleteUserHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "删除用户")
}
```

### 中间件实现
```go
// 中间件类型定义
type Middleware func(http.Handler) http.Handler

// 日志中间件
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // 记录请求
        fmt.Printf("[%s] %s %s", 
                  time.Now().Format("2006-01-02 15:04:05"),
                  r.Method, r.URL.Path)
        
        // 调用下一个处理器
        next.ServeHTTP(w, r)
        
        // 记录响应时间
        duration := time.Since(start)
        fmt.Printf(" - %v\n", duration)
    })
}

// 认证中间件
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 检查认证头
        auth := r.Header.Get("Authorization")
        if auth == "" {
            w.WriteHeader(http.StatusUnauthorized)
            fmt.Fprintf(w, "需要认证")
            return
        }
        
        // 简单的token验证
        if !strings.HasPrefix(auth, "Bearer ") {
            w.WriteHeader(http.StatusUnauthorized)
            fmt.Fprintf(w, "无效的认证格式")
            return
        }
        
        token := strings.TrimPrefix(auth, "Bearer ")
        if !isValidToken(token) {
            w.WriteHeader(http.StatusUnauthorized)
            fmt.Fprintf(w, "无效的token")
            return
        }
        
        // 认证通过，继续处理
        next.ServeHTTP(w, r)
    })
}

func isValidToken(token string) bool {
    // 简单的token验证逻辑
    return token == "valid-token-123"
}

// CORS中间件
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}

// 限流中间件
func RateLimitMiddleware(maxRequests int, window time.Duration) Middleware {
    type client struct {
        requests int
        window   time.Time
    }
    
    clients := make(map[string]*client)
    var mutex sync.RWMutex
    
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ip := r.RemoteAddr
            
            mutex.Lock()
            defer mutex.Unlock()
            
            now := time.Now()
            c, exists := clients[ip]
            
            if !exists || now.Sub(c.window) > window {
                clients[ip] = &client{requests: 1, window: now}
            } else {
                c.requests++
                if c.requests > maxRequests {
                    w.WriteHeader(http.StatusTooManyRequests)
                    fmt.Fprintf(w, "请求过于频繁")
                    return
                }
            }
            
            next.ServeHTTP(w, r)
        })
    }
}

// 中间件链
func ChainMiddleware(middlewares ...Middleware) Middleware {
    return func(next http.Handler) http.Handler {
        for i := len(middlewares) - 1; i >= 0; i-- {
            next = middlewares[i](next)
        }
        return next
    }
}

// 使用示例
func middlewareExample() {
    mux := http.NewServeMux()
    
    // 注册路由
    mux.HandleFunc("/", homeHandler)
    mux.HandleFunc("/api/data", dataHandler)
    mux.HandleFunc("/api/protected", protectedHandler)
    
    // 应用中间件
    chain := ChainMiddleware(
        LoggingMiddleware,
        CORSMiddleware,
        RateLimitMiddleware(10, time.Minute),
    )
    
    // 对特定路径应用认证中间件
    protectedMux := http.NewServeMux()
    protectedMux.Handle("/api/protected", AuthMiddleware(http.HandlerFunc(protectedHandler)))
    
    // 启动服务器
    fmt.Println("服务器启动在端口 8080")
    log.Fatal(http.ListenAndServe(":8080", chain(mux)))
}

func dataHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "API数据响应")
}

func protectedHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "受保护的资源")
}
```

## 4. 静态文件服务

### 基本静态文件服务
```go
func staticFileServer() {
    // 服务静态文件
    fs := http.FileServer(http.Dir("./static/"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))
    
    // 主页处理
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path != "/" {
            http.NotFound(w, r)
            return
        }
        
        html := `
        <!DOCTYPE html>
        <html>
        <head>
            <title>静态文件服务</title>
            <link rel="stylesheet" href="/static/css/style.css">
        </head>
        <body>
            <h1>欢迎使用静态文件服务</h1>
            <img src="/static/images/logo.png" alt="Logo">
            <script src="/static/js/app.js"></script>
        </body>
        </html>
        `
        
        w.Header().Set("Content-Type", "text/html")
        fmt.Fprintf(w, html)
    })
    
    fmt.Println("服务器启动在端口 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### 自定义文件服务器
```go
import (
    "mime"
    "path/filepath"
    "strconv"
)

func customFileServer() {
    http.HandleFunc("/files/", fileHandler)
    
    fmt.Println("文件服务器启动在端口 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func fileHandler(w http.ResponseWriter, r *http.Request) {
    // 获取文件路径
    path := r.URL.Path[len("/files/"):]
    if path == "" {
        listFiles(w, r)
        return
    }
    
    // 安全检查
    if strings.Contains(path, "..") {
        http.Error(w, "非法路径", http.StatusBadRequest)
        return
    }
    
    fullPath := filepath.Join("./files", path)
    
    // 检查文件是否存在
    info, err := os.Stat(fullPath)
    if err != nil {
        if os.IsNotExist(err) {
            http.NotFound(w, r)
        } else {
            http.Error(w, "服务器错误", http.StatusInternalServerError)
        }
        return
    }
    
    // 如果是目录，列出文件
    if info.IsDir() {
        listDirectory(w, r, fullPath)
        return
    }
    
    // 设置Content-Type
    ext := filepath.Ext(fullPath)
    contentType := mime.TypeByExtension(ext)
    if contentType != "" {
        w.Header().Set("Content-Type", contentType)
    }
    
    // 设置Content-Length
    w.Header().Set("Content-Length", strconv.FormatInt(info.Size(), 10))
    
    // 处理Range请求（断点续传）
    if r.Header.Get("Range") != "" {
        serveFileWithRange(w, r, fullPath, info)
        return
    }
    
    // 普通文件服务
    http.ServeFile(w, r, fullPath)
}

func listFiles(w http.ResponseWriter, r *http.Request) {
    files, err := ioutil.ReadDir("./files")
    if err != nil {
        http.Error(w, "读取目录失败", http.StatusInternalServerError)
        return
    }
    
    html := `
    <!DOCTYPE html>
    <html>
    <head>
        <title>文件列表</title>
    </head>
    <body>
        <h1>文件列表</h1>
        <ul>
    `
    
    for _, file := range files {
        html += fmt.Sprintf(`<li><a href="/files/%s">%s</a></li>`, 
                          file.Name(), file.Name())
    }
    
    html += `
        </ul>
    </body>
    </html>
    `
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprintf(w, html)
}

func listDirectory(w http.ResponseWriter, r *http.Request, dirPath string) {
    files, err := ioutil.ReadDir(dirPath)
    if err != nil {
        http.Error(w, "读取目录失败", http.StatusInternalServerError)
        return
    }
    
    // 生成目录列表HTML
    html := fmt.Sprintf(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>目录: %s</title>
    </head>
    <body>
        <h1>目录: %s</h1>
        <ul>
    `, r.URL.Path, r.URL.Path)
    
    // 添加返回上级目录的链接
    if r.URL.Path != "/files/" {
        html += `<li><a href="../">../</a></li>`
    }
    
    for _, file := range files {
        name := file.Name()
        if file.IsDir() {
            name += "/"
        }
        html += fmt.Sprintf(`<li><a href="%s">%s</a> (%d bytes)</li>`, 
                          name, name, file.Size())
    }
    
    html += `
        </ul>
    </body>
    </html>
    `
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprintf(w, html)
}

func serveFileWithRange(w http.ResponseWriter, r *http.Request, filePath string, info os.FileInfo) {
    // 简化的Range请求处理
    file, err := os.Open(filePath)
    if err != nil {
        http.Error(w, "打开文件失败", http.StatusInternalServerError)
        return
    }
    defer file.Close()
    
    w.Header().Set("Accept-Ranges", "bytes")
    w.Header().Set("Content-Length", strconv.FormatInt(info.Size(), 10))
    
    // 这里应该解析Range头并返回对应的字节范围
    // 为简化示例，这里直接返回整个文件
    io.Copy(w, file)
}
```

## 5. 服务器配置

### 高级服务器配置
```go
import (
    "context"
    "crypto/tls"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func advancedServer() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", homeHandler)
    
    // 创建自定义服务器
    server := &http.Server{
        Addr:           ":8080",
        Handler:        mux,
        ReadTimeout:    10 * time.Second,
        WriteTimeout:   10 * time.Second,
        IdleTimeout:    60 * time.Second,
        MaxHeaderBytes: 1 << 20, // 1MB
    }
    
    // 优雅关闭
    go func() {
        fmt.Println("服务器启动在端口 8080")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("服务器启动失败: %v", err)
        }
    }()
    
    // 等待中断信号
    c := make(chan os.Signal, 1)
    signal.Notify(c, os.Interrupt, syscall.SIGTERM)
    
    <-c
    fmt.Println("服务器正在关闭...")
    
    // 创建关闭超时上下文
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    // 优雅关闭服务器
    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("服务器关闭失败: %v", err)
    }
    
    fmt.Println("服务器已关闭")
}
```

### HTTPS服务器
```go
func httpsServer() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "安全的HTTPS连接!")
    })
    
    // TLS配置
    tlsConfig := &tls.Config{
        MinVersion:               tls.VersionTLS12,
        CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
        PreferServerCipherSuites: true,
        CipherSuites: []uint16{
            tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
            tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
            tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
        },
    }
    
    server := &http.Server{
        Addr:      ":8443",
        Handler:   mux,
        TLSConfig: tlsConfig,
    }
    
    fmt.Println("HTTPS服务器启动在端口 8443")
    log.Fatal(server.ListenAndServeTLS("server.crt", "server.key"))
}
```

## 6. 实践练习

### 练习1：RESTful API服务器
```go
// 实现一个完整的RESTful API服务器
type APIServer struct {
    router *Router
    db     *Database
}

func (api *APIServer) SetupRoutes() {
    // 设置RESTful路由
    // GET /api/users - 获取用户列表
    // POST /api/users - 创建用户
    // GET /api/users/{id} - 获取特定用户
    // PUT /api/users/{id} - 更新用户
    // DELETE /api/users/{id} - 删除用户
}
```

### 练习2：文件上传服务
```go
// 实现一个文件上传和管理服务
type FileService struct {
    uploadDir string
    maxSize   int64
}

func (fs *FileService) HandleUpload(w http.ResponseWriter, r *http.Request) {
    // 实现文件上传逻辑
    // 支持多文件上传
    // 文件类型验证
    // 大小限制
}
```

### 练习3：简单的Web框架
```go
// 实现一个简单的Web框架
type SimpleFramework struct {
    routes     map[string]Handler
    middleware []Middleware
}

func (sf *SimpleFramework) Use(middleware Middleware) {
    // 添加中间件
}

func (sf *SimpleFramework) Route(pattern string, handler Handler) {
    // 注册路由
}
```

## 7. 参考资料

- [net/http包文档](https://golang.org/pkg/net/http/)
- [Go Web编程](https://github.com/astaxie/build-web-application-with-golang)
- [HTTP/2 in Go](https://blog.golang.org/h2push)
- [Go HTTPS服务器](https://blog.golang.org/https)

---

通过本章的学习，你将掌握Go语言中HTTP服务器的基本开发技能，能够构建功能完整的Web服务应用。