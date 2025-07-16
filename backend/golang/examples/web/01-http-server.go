// 01-http-server.go
// 演示Go语言的HTTP服务器基础用法

package main

import (
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "net/url"
    "strconv"
    "strings"
    "time"
)

// 用户数据结构
type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

// 响应数据结构
type Response struct {
    Success bool        `json:"success"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

// 模拟数据库
var users = []User{
    {ID: 1, Name: "Alice", Email: "alice@example.com"},
    {ID: 2, Name: "Bob", Email: "bob@example.com"},
    {ID: 3, Name: "Charlie", Email: "charlie@example.com"},
}

func main() {
    // 1. 基本路由
    http.HandleFunc("/", homeHandler)
    http.HandleFunc("/hello", helloHandler)
    http.HandleFunc("/time", timeHandler)
    
    // 2. RESTful API路由
    http.HandleFunc("/api/users", usersHandler)
    http.HandleFunc("/api/users/", userHandler)
    
    // 3. 表单处理
    http.HandleFunc("/form", formHandler)
    http.HandleFunc("/upload", uploadHandler)
    
    // 4. JSON处理
    http.HandleFunc("/json", jsonHandler)
    
    // 5. 中间件演示
    http.HandleFunc("/protected", loggingMiddleware(authMiddleware(protectedHandler)))
    
    // 6. 静态文件服务
    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))
    
    // 7. 自定义ServeMux
    mux := http.NewServeMux()
    mux.HandleFunc("/custom", customHandler)
    http.Handle("/custom/", mux)
    
    // 启动服务器
    fmt.Println("HTTP服务器启动...")
    fmt.Println("访问 http://localhost:8080")
    fmt.Println("可用路由:")
    fmt.Println("  GET  /")
    fmt.Println("  GET  /hello?name=<name>")
    fmt.Println("  GET  /time")
    fmt.Println("  GET  /api/users")
    fmt.Println("  GET  /api/users/{id}")
    fmt.Println("  POST /api/users")
    fmt.Println("  PUT  /api/users/{id}")
    fmt.Println("  DELETE /api/users/{id}")
    fmt.Println("  GET/POST /form")
    fmt.Println("  POST /upload")
    fmt.Println("  POST /json")
    fmt.Println("  GET  /protected")
    fmt.Println("  GET  /static/<file>")
    fmt.Println("  GET  /custom")
    
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// 1. 首页处理器
func homeHandler(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/" {
        http.NotFound(w, r)
        return
    }
    
    html := `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Go HTTP Server Demo</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .endpoint { margin: 10px 0; padding: 10px; background: #f5f5f5; }
            pre { background: #eee; padding: 10px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>Go HTTP Server Demo</h1>
        <p>这是一个Go语言HTTP服务器演示</p>
        
        <h2>可用端点：</h2>
        <div class="endpoint">
            <strong>GET /hello?name=yourname</strong><br>
            个性化问候
        </div>
        
        <div class="endpoint">
            <strong>GET /time</strong><br>
            获取当前时间
        </div>
        
        <div class="endpoint">
            <strong>GET /api/users</strong><br>
            获取所有用户
        </div>
        
        <div class="endpoint">
            <strong>GET /api/users/1</strong><br>
            获取特定用户
        </div>
        
        <div class="endpoint">
            <strong>POST /json</strong><br>
            JSON数据处理<br>
            <pre>curl -X POST http://localhost:8080/json -H "Content-Type: application/json" -d '{"name":"test","value":123}'</pre>
        </div>
        
        <div class="endpoint">
            <strong>GET /protected</strong><br>
            需要认证的端点（添加 Authorization: Bearer token123）
        </div>
        
        <h2>表单测试：</h2>
        <form action="/form" method="POST">
            <label>姓名: <input type="text" name="name" required></label><br><br>
            <label>邮箱: <input type="email" name="email" required></label><br><br>
            <label>消息: <textarea name="message" rows="4" cols="50"></textarea></label><br><br>
            <button type="submit">提交</button>
        </form>
        
        <h2>文件上传：</h2>
        <form action="/upload" method="POST" enctype="multipart/form-data">
            <label>选择文件: <input type="file" name="file" required></label><br><br>
            <button type="submit">上传</button>
        </form>
    </body>
    </html>
    `
    
    w.Header().Set("Content-Type", "text/html")
    w.Write([]byte(html))
}

// 2. 问候处理器
func helloHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        w.WriteHeader(http.StatusMethodNotAllowed)
        fmt.Fprintf(w, "Method %s not allowed", r.Method)
        return
    }
    
    name := r.URL.Query().Get("name")
    if name == "" {
        name = "World"
    }
    
    w.Header().Set("Content-Type", "text/plain")
    fmt.Fprintf(w, "Hello, %s!", name)
}

// 3. 时间处理器
func timeHandler(w http.ResponseWriter, r *http.Request) {
    now := time.Now()
    
    response := Response{
        Success: true,
        Message: "Current time",
        Data: map[string]interface{}{
            "timestamp": now.Unix(),
            "formatted": now.Format("2006-01-02 15:04:05"),
            "utc":       now.UTC().Format(time.RFC3339),
        },
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// 4. 用户列表处理器
func usersHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    switch r.Method {
    case http.MethodGet:
        // 获取所有用户
        response := Response{
            Success: true,
            Message: "Users retrieved successfully",
            Data:    users,
        }
        json.NewEncoder(w).Encode(response)
        
    case http.MethodPost:
        // 创建新用户
        var newUser User
        if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "Invalid JSON format",
            })
            return
        }
        
        // 生成新ID
        newUser.ID = len(users) + 1
        users = append(users, newUser)
        
        response := Response{
            Success: true,
            Message: "User created successfully",
            Data:    newUser,
        }
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(response)
        
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(Response{
            Success: false,
            Message: "Method not allowed",
        })
    }
}

// 5. 单个用户处理器
func userHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    // 解析用户ID
    path := strings.TrimPrefix(r.URL.Path, "/api/users/")
    if path == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(Response{
            Success: false,
            Message: "User ID is required",
        })
        return
    }
    
    userID, err := strconv.Atoi(path)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(Response{
            Success: false,
            Message: "Invalid user ID",
        })
        return
    }
    
    // 查找用户
    var user *User
    var index int
    for i, u := range users {
        if u.ID == userID {
            user = &u
            index = i
            break
        }
    }
    
    switch r.Method {
    case http.MethodGet:
        if user == nil {
            w.WriteHeader(http.StatusNotFound)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "User not found",
            })
            return
        }
        
        response := Response{
            Success: true,
            Message: "User retrieved successfully",
            Data:    user,
        }
        json.NewEncoder(w).Encode(response)
        
    case http.MethodPut:
        if user == nil {
            w.WriteHeader(http.StatusNotFound)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "User not found",
            })
            return
        }
        
        var updatedUser User
        if err := json.NewDecoder(r.Body).Decode(&updatedUser); err != nil {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "Invalid JSON format",
            })
            return
        }
        
        updatedUser.ID = userID
        users[index] = updatedUser
        
        response := Response{
            Success: true,
            Message: "User updated successfully",
            Data:    updatedUser,
        }
        json.NewEncoder(w).Encode(response)
        
    case http.MethodDelete:
        if user == nil {
            w.WriteHeader(http.StatusNotFound)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "User not found",
            })
            return
        }
        
        // 删除用户
        users = append(users[:index], users[index+1:]...)
        
        response := Response{
            Success: true,
            Message: "User deleted successfully",
        }
        json.NewEncoder(w).Encode(response)
        
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(Response{
            Success: false,
            Message: "Method not allowed",
        })
    }
}

// 6. 表单处理器
func formHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        w.Header().Set("Content-Type", "text/html")
        w.Write([]byte(`
        <h2>表单处理示例</h2>
        <form method="POST">
            <label>姓名: <input type="text" name="name" required></label><br><br>
            <label>邮箱: <input type="email" name="email" required></label><br><br>
            <label>消息: <textarea name="message" rows="4" cols="50"></textarea></label><br><br>
            <button type="submit">提交</button>
        </form>
        `))
        
    case http.MethodPost:
        if err := r.ParseForm(); err != nil {
            w.WriteHeader(http.StatusBadRequest)
            fmt.Fprintf(w, "Error parsing form: %v", err)
            return
        }
        
        name := r.FormValue("name")
        email := r.FormValue("email")
        message := r.FormValue("message")
        
        w.Header().Set("Content-Type", "text/html")
        fmt.Fprintf(w, `
        <h2>表单提交成功!</h2>
        <p><strong>姓名:</strong> %s</p>
        <p><strong>邮箱:</strong> %s</p>
        <p><strong>消息:</strong> %s</p>
        <a href="/form">返回表单</a>
        `, name, email, message)
        
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
        fmt.Fprintf(w, "Method %s not allowed", r.Method)
    }
}

// 7. 文件上传处理器
func uploadHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        fmt.Fprintf(w, "Method %s not allowed", r.Method)
        return
    }
    
    // 解析multipart form，限制文件大小为10MB
    if err := r.ParseMultipartForm(10 << 20); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        fmt.Fprintf(w, "Error parsing form: %v", err)
        return
    }
    
    file, header, err := r.FormFile("file")
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        fmt.Fprintf(w, "Error getting file: %v", err)
        return
    }
    defer file.Close()
    
    // 读取文件内容
    content, err := io.ReadAll(file)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        fmt.Fprintf(w, "Error reading file: %v", err)
        return
    }
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprintf(w, `
    <h2>文件上传成功!</h2>
    <p><strong>文件名:</strong> %s</p>
    <p><strong>文件大小:</strong> %d bytes</p>
    <p><strong>Content-Type:</strong> %s</p>
    <p><strong>文件内容:</strong></p>
    <pre>%s</pre>
    <a href="/">返回首页</a>
    `, header.Filename, len(content), header.Header.Get("Content-Type"), string(content))
}

// 8. JSON处理器
func jsonHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(Response{
            Success: false,
            Message: "Method not allowed",
        })
        return
    }
    
    var data map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(Response{
            Success: false,
            Message: "Invalid JSON format",
        })
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    response := Response{
        Success: true,
        Message: "JSON data processed successfully",
        Data: map[string]interface{}{
            "received": data,
            "timestamp": time.Now().Unix(),
        },
    }
    json.NewEncoder(w).Encode(response)
}

// 9. 受保护的处理器
func protectedHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    response := Response{
        Success: true,
        Message: "This is a protected endpoint",
        Data: map[string]interface{}{
            "user":      "authenticated_user",
            "timestamp": time.Now().Unix(),
        },
    }
    json.NewEncoder(w).Encode(response)
}

// 10. 自定义处理器
func customHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain")
    fmt.Fprintf(w, "This is a custom handler with custom ServeMux")
}

// 中间件：日志记录
func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // 记录请求
        log.Printf("Started %s %s", r.Method, r.URL.Path)
        
        // 调用下一个处理器
        next(w, r)
        
        // 记录完成时间
        log.Printf("Completed %s %s in %v", r.Method, r.URL.Path, time.Since(start))
    }
}

// 中间件：认证
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // 检查Authorization头
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "Authorization header required",
            })
            return
        }
        
        // 简单的token验证
        if authHeader != "Bearer token123" {
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(Response{
                Success: false,
                Message: "Invalid token",
            })
            return
        }
        
        // 认证通过，调用下一个处理器
        next(w, r)
    }
}