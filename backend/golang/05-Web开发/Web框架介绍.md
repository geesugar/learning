# Web框架介绍

## 学习目标
- 了解主流Go Web框架的特点
- 学习Gin框架的使用方法
- 掌握Echo框架的开发技巧
- 理解框架选择和性能对比

## 1. Go Web框架概览

### 主流框架对比
```go
// 标准库 net/http
func standardLibExample() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from standard library!")
    })
    
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// 优点：零依赖，轻量级，官方支持
// 缺点：功能基础，需要大量手写代码
```

### 框架特性对比表
```go
type FrameworkComparison struct {
    Name         string
    Stars        int    // GitHub星数（近似）
    Performance  string // 性能等级
    Learning     string // 学习曲线
    Ecosystem    string // 生态系统
    Use Cases    []string
}

var frameworks = []FrameworkComparison{
    {
        Name:        "Gin",
        Stars:       70000,
        Performance: "高",
        Learning:    "简单",
        Ecosystem:   "丰富",
        Use Cases:   []string{"API开发", "微服务", "快速原型"},
    },
    {
        Name:        "Echo",
        Stars:       25000,
        Performance: "高",
        Learning:    "简单",
        Ecosystem:   "中等",
        Use Cases:   []string{"RESTful API", "中间件丰富"},
    },
    {
        Name:        "Fiber",
        Stars:       30000,
        Performance: "极高",
        Learning:    "简单",
        Ecosystem:   "快速增长",
        Use Cases:   []string{"高性能API", "Express.js迁移"},
    },
    {
        Name:        "Beego",
        Stars:       30000,
        Performance: "中等",
        Learning:    "中等",
        Ecosystem:   "完整",
        Use Cases:   []string{"企业应用", "全功能Web应用"},
    },
}
```

## 2. Gin框架详解

### Gin基础使用
```go
package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    // 创建Gin实例
    r := gin.Default()
    
    // 基本路由
    r.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello Gin!",
        })
    })
    
    // 路径参数
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        c.JSON(http.StatusOK, gin.H{
            "user_id": id,
        })
    })
    
    // 查询参数
    r.GET("/search", func(c *gin.Context) {
        query := c.Query("q")
        page := c.DefaultQuery("page", "1")
        
        c.JSON(http.StatusOK, gin.H{
            "query": query,
            "page":  page,
        })
    })
    
    // POST请求处理
    r.POST("/users", createUser)
    
    // 启动服务器
    r.Run(":8080")
}

func createUser(c *gin.Context) {
    var user User
    
    // 绑定JSON数据
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": err.Error(),
        })
        return
    }
    
    // 处理用户创建逻辑
    user.ID = generateUserID()
    
    c.JSON(http.StatusCreated, user)
}

type User struct {
    ID       int    `json:"id"`
    Username string `json:"username" binding:"required"`
    Email    string `json:"email" binding:"required,email"`
    Age      int    `json:"age" binding:"gte=0,lte=130"`
}
```

### Gin中间件
```go
import (
    "time"
    "log"
)

// 自定义日志中间件
func Logger() gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
            param.ClientIP,
            param.TimeStamp.Format(time.RFC1123),
            param.Method,
            param.Path,
            param.Request.Proto,
            param.StatusCode,
            param.Latency,
            param.Request.UserAgent(),
            param.ErrorMessage,
        )
    })
}

// 认证中间件
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        
        if token == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "缺少认证令牌",
            })
            c.Abort()
            return
        }
        
        // 验证令牌（简化实现）
        if !validateToken(token) {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "无效的令牌",
            })
            c.Abort()
            return
        }
        
        // 将用户信息存储到上下文
        c.Set("user_id", getUserIDFromToken(token))
        c.Next()
    }
}

// CORS中间件
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}

// 使用中间件
func middlewareExample() {
    r := gin.New()
    
    // 全局中间件
    r.Use(Logger())
    r.Use(gin.Recovery())
    r.Use(CORSMiddleware())
    
    // 公共路由
    r.POST("/login", loginHandler)
    
    // 需要认证的路由组
    auth := r.Group("/api")
    auth.Use(AuthMiddleware())
    {
        auth.GET("/profile", getProfile)
        auth.PUT("/profile", updateProfile)
        auth.DELETE("/account", deleteAccount)
    }
    
    r.Run(":8080")
}
```

### Gin路由组和版本控制
```go
func routeGroupExample() {
    r := gin.Default()
    
    // V1 API组
    v1 := r.Group("/api/v1")
    {
        users := v1.Group("/users")
        {
            users.GET("", listUsers)
            users.POST("", createUser)
            users.GET("/:id", getUser)
            users.PUT("/:id", updateUser)
            users.DELETE("/:id", deleteUser)
        }
        
        posts := v1.Group("/posts")
        {
            posts.GET("", listPosts)
            posts.POST("", createPost)
            posts.GET("/:id", getPost)
        }
    }
    
    // V2 API组
    v2 := r.Group("/api/v2")
    v2.Use(AuthMiddleware()) // V2需要认证
    {
        v2.GET("/users", listUsersV2)
        v2.GET("/posts", listPostsV2)
    }
    
    r.Run(":8080")
}

func listUsers(c *gin.Context) {
    // 分页参数
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
    
    // 搜索参数
    search := c.Query("search")
    
    users, total := getUsersFromDB(page, limit, search)
    
    c.JSON(http.StatusOK, gin.H{
        "data": users,
        "pagination": gin.H{
            "page":        page,
            "limit":       limit,
            "total":       total,
            "total_pages": (total + limit - 1) / limit,
        },
    })
}
```

### Gin模板渲染
```go
import (
    "html/template"
)

func templateExample() {
    r := gin.Default()
    
    // 加载HTML模板
    r.LoadHTMLGlob("templates/*")
    
    // 静态文件服务
    r.Static("/static", "./static")
    
    // 自定义模板函数
    r.SetFuncMap(template.FuncMap{
        "formatDate": func(t time.Time) string {
            return t.Format("2006-01-02 15:04:05")
        },
        "upper": strings.ToUpper,
    })
    
    // 渲染模板
    r.GET("/", func(c *gin.Context) {
        c.HTML(http.StatusOK, "index.html", gin.H{
            "title":   "Gin模板示例",
            "message": "欢迎使用Gin框架!",
            "users": []User{
                {ID: 1, Username: "alice", Email: "alice@example.com"},
                {ID: 2, Username: "bob", Email: "bob@example.com"},
            },
            "currentTime": time.Now(),
        })
    })
    
    r.Run(":8080")
}
```

### Gin数据绑定和验证
```go
import (
    "github.com/go-playground/validator/v10"
)

// 用户注册请求
type RegisterRequest struct {
    Username        string `json:"username" binding:"required,min=3,max=20"`
    Email          string `json:"email" binding:"required,email"`
    Password       string `json:"password" binding:"required,min=8"`
    ConfirmPassword string `json:"confirm_password" binding:"required"`
    Age            int    `json:"age" binding:"gte=18,lte=100"`
    Terms          bool   `json:"terms" binding:"required"`
}

// 自定义验证器
func passwordMatch(fl validator.FieldLevel) bool {
    password := fl.Parent().FieldByName("Password").String()
    confirmPassword := fl.Field().String()
    return password == confirmPassword
}

func registerHandler(c *gin.Context) {
    var req RegisterRequest
    
    // 绑定和验证JSON数据
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   "验证失败",
            "details": err.Error(),
        })
        return
    }
    
    // 额外的业务验证
    if req.Password != req.ConfirmPassword {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "密码和确认密码不匹配",
        })
        return
    }
    
    // 检查用户名是否已存在
    if userExists(req.Username) {
        c.JSON(http.StatusConflict, gin.H{
            "error": "用户名已存在",
        })
        return
    }
    
    // 创建用户
    user := createUserFromRequest(req)
    
    c.JSON(http.StatusCreated, gin.H{
        "message": "用户注册成功",
        "user":    user,
    })
}

// 查询字符串绑定
type SearchQuery struct {
    Query    string `form:"q" binding:"required"`
    Page     int    `form:"page,default=1" binding:"min=1"`
    PageSize int    `form:"page_size,default=20" binding:"min=1,max=100"`
    SortBy   string `form:"sort_by,default=created_at"`
    Order    string `form:"order,default=desc" binding:"oneof=asc desc"`
}

func searchHandler(c *gin.Context) {
    var query SearchQuery
    
    if err := c.ShouldBindQuery(&query); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": err.Error(),
        })
        return
    }
    
    results := performSearch(query)
    
    c.JSON(http.StatusOK, gin.H{
        "results": results,
        "query":   query,
    })
}
```

## 3. Echo框架详解

### Echo基础使用
```go
package main

import (
    "net/http"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    // 创建Echo实例
    e := echo.New()
    
    // 中间件
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    
    // 路由
    e.GET("/", hello)
    e.POST("/users", createUser)
    e.GET("/users/:id", getUser)
    
    // 启动服务器
    e.Logger.Fatal(e.Start(":8080"))
}

func hello(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{
        "message": "Hello Echo!",
    })
}

func createUser(c echo.Context) error {
    user := new(User)
    
    if err := c.Bind(user); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    if err := c.Validate(user); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    // 保存用户
    user.ID = generateUserID()
    
    return c.JSON(http.StatusCreated, user)
}

func getUser(c echo.Context) error {
    id := c.Param("id")
    
    user := getUserByID(id)
    if user == nil {
        return echo.NewHTTPError(http.StatusNotFound, "用户不存在")
    }
    
    return c.JSON(http.StatusOK, user)
}
```

### Echo中间件
```go
import (
    "time"
    "strings"
)

// 自定义认证中间件
func JWTAuthMiddleware(secret string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            auth := c.Request().Header.Get("Authorization")
            
            if auth == "" {
                return echo.NewHTTPError(http.StatusUnauthorized, "缺少认证头")
            }
            
            token := strings.TrimPrefix(auth, "Bearer ")
            
            claims, err := validateJWTToken(token, secret)
            if err != nil {
                return echo.NewHTTPError(http.StatusUnauthorized, "无效的令牌")
            }
            
            c.Set("user", claims)
            return next(c)
        }
    }
}

// 限流中间件
func RateLimitMiddleware(rate int) echo.MiddlewareFunc {
    limiter := make(map[string][]time.Time)
    
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            ip := c.RealIP()
            now := time.Now()
            
            // 清理过期记录
            if times, exists := limiter[ip]; exists {
                var validTimes []time.Time
                for _, t := range times {
                    if now.Sub(t) < time.Minute {
                        validTimes = append(validTimes, t)
                    }
                }
                limiter[ip] = validTimes
            }
            
            // 检查限制
            if len(limiter[ip]) >= rate {
                return echo.NewHTTPError(http.StatusTooManyRequests, "请求过于频繁")
            }
            
            // 记录请求
            limiter[ip] = append(limiter[ip], now)
            
            return next(c)
        }
    }
}

// 使用中间件
func echoMiddlewareExample() {
    e := echo.New()
    
    // 全局中间件
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.CORS())
    e.Use(RateLimitMiddleware(60)) // 每分钟60个请求
    
    // 公共API
    api := e.Group("/api")
    api.POST("/login", loginHandler)
    api.POST("/register", registerHandler)
    
    // 需要认证的API
    protected := api.Group("")
    protected.Use(JWTAuthMiddleware("your-secret-key"))
    protected.GET("/profile", getProfile)
    protected.PUT("/profile", updateProfile)
    
    e.Start(":8080")
}
```

### Echo数据绑定和验证
```go
import (
    "github.com/go-playground/validator/v10"
)

// 自定义验证器
type CustomValidator struct {
    validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
    return cv.validator.Struct(i)
}

func echoValidationExample() {
    e := echo.New()
    
    // 设置自定义验证器
    e.Validator = &CustomValidator{validator: validator.New()}
    
    e.POST("/users", func(c echo.Context) error {
        user := new(User)
        
        // 绑定数据
        if err := c.Bind(user); err != nil {
            return echo.NewHTTPError(http.StatusBadRequest, err.Error())
        }
        
        // 验证数据
        if err := c.Validate(user); err != nil {
            return echo.NewHTTPError(http.StatusBadRequest, err.Error())
        }
        
        return c.JSON(http.StatusCreated, user)
    })
    
    e.Start(":8080")
}
```

## 4. 框架性能对比

### 基准测试代码
```go
package main

import (
    "fmt"
    "net/http"
    "testing"
    "github.com/gin-gonic/gin"
    "github.com/labstack/echo/v4"
)

// 标准库实现
func standardLibHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintf(w, `{"message":"Hello World"}`)
}

func BenchmarkStandardLib(b *testing.B) {
    mux := http.NewServeMux()
    mux.HandleFunc("/", standardLibHandler)
    
    req := httptest.NewRequest("GET", "/", nil)
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        w := httptest.NewRecorder()
        mux.ServeHTTP(w, req)
    }
}

// Gin实现
func BenchmarkGin(b *testing.B) {
    gin.SetMode(gin.ReleaseMode)
    r := gin.New()
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "Hello World"})
    })
    
    req := httptest.NewRequest("GET", "/", nil)
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
    }
}

// Echo实现
func BenchmarkEcho(b *testing.B) {
    e := echo.New()
    e.GET("/", func(c echo.Context) error {
        return c.JSON(200, map[string]string{"message": "Hello World"})
    })
    
    req := httptest.NewRequest("GET", "/", nil)
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        w := httptest.NewRecorder()
        e.ServeHTTP(w, req)
    }
}

// 运行基准测试
// go test -bench=. -benchmem
```

### 性能测试结果分析
```go
type BenchmarkResult struct {
    Framework   string
    Requests    int64
    NsPerOp     int64
    AllocsPerOp int64
    BytesPerOp  int64
    Description string
}

var benchmarkResults = []BenchmarkResult{
    {
        Framework:   "net/http",
        Requests:    5000000,
        NsPerOp:     240,
        AllocsPerOp: 2,
        BytesPerOp:  144,
        Description: "标准库，最轻量级",
    },
    {
        Framework:   "Gin",
        Requests:    3000000,
        NsPerOp:     400,
        AllocsPerOp: 5,
        BytesPerOp:  312,
        Description: "高性能，功能丰富",
    },
    {
        Framework:   "Echo",
        Requests:    2800000,
        NsPerOp:     420,
        AllocsPerOp: 4,
        BytesPerOp:  280,
        Description: "中等性能，中间件丰富",
    },
}

func analyzePerformance() {
    fmt.Println("Go Web框架性能对比:")
    fmt.Println("框架\t\t请求数/秒\t延迟(ns)\t内存分配\t字节分配")
    
    for _, result := range benchmarkResults {
        requestsPerSec := 1e9 / result.NsPerOp
        fmt.Printf("%s\t\t%d\t\t%d\t\t%d\t\t%d\n",
            result.Framework,
            requestsPerSec,
            result.NsPerOp,
            result.AllocsPerOp,
            result.BytesPerOp)
    }
}
```

## 5. 框架选择指南

### 选择矩阵
```go
type ProjectRequirement struct {
    Size           string // small, medium, large
    Team           string // junior, mixed, senior
    Performance    string // low, medium, high, critical
    Timeline       string // fast, normal, flexible
    Maintenance    string // short, medium, long
    Complexity     string // simple, moderate, complex
}

type FrameworkRecommendation struct {
    Framework   string
    Score       int
    Reasons     []string
    Warnings    []string
}

func recommendFramework(req ProjectRequirement) []FrameworkRecommendation {
    recommendations := []FrameworkRecommendation{}
    
    // Gin推荐逻辑
    ginScore := 0
    ginReasons := []string{}
    ginWarnings := []string{}
    
    if req.Timeline == "fast" {
        ginScore += 3
        ginReasons = append(ginReasons, "快速开发")
    }
    
    if req.Performance == "high" {
        ginScore += 2
        ginReasons = append(ginReasons, "高性能")
    }
    
    if req.Team == "junior" {
        ginScore += 2
        ginReasons = append(ginReasons, "学习曲线平缓")
    }
    
    recommendations = append(recommendations, FrameworkRecommendation{
        Framework: "Gin",
        Score:     ginScore,
        Reasons:   ginReasons,
        Warnings:  ginWarnings,
    })
    
    // 类似地为其他框架计算分数...
    
    return recommendations
}

// 使用示例
func frameworkSelectionExample() {
    req := ProjectRequirement{
        Size:        "medium",
        Team:        "mixed",
        Performance: "high",
        Timeline:    "fast",
        Maintenance: "long",
        Complexity:  "moderate",
    }
    
    recommendations := recommendFramework(req)
    
    fmt.Println("框架推荐:")
    for _, rec := range recommendations {
        fmt.Printf("%s (分数: %d)\n", rec.Framework, rec.Score)
        fmt.Printf("  优势: %v\n", rec.Reasons)
        if len(rec.Warnings) > 0 {
            fmt.Printf("  注意: %v\n", rec.Warnings)
        }
    }
}
```

### 迁移指南
```go
// 从net/http到Gin的迁移示例
func migrateNetHttpToGin() {
    // 原始net/http代码
    /*
    http.HandleFunc("/users", usersHandler)
    http.HandleFunc("/users/", userHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
    */
    
    // 迁移到Gin
    r := gin.Default()
    
    // 简单路由迁移
    r.GET("/users", func(c *gin.Context) {
        // 将原来的handler逻辑移到这里
        users := getAllUsers()
        c.JSON(http.StatusOK, users)
    })
    
    // 带参数的路由迁移
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        user := getUserByID(id)
        if user == nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
            return
        }
        c.JSON(http.StatusOK, user)
    })
    
    r.Run(":8080")
}

// 从Gin到Echo的迁移示例
func migrateGinToEcho() {
    // Gin代码
    /*
    r := gin.Default()
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        c.JSON(200, gin.H{"id": id})
    })
    */
    
    // Echo代码
    e := echo.New()
    e.GET("/users/:id", func(c echo.Context) error {
        id := c.Param("id")
        return c.JSON(200, map[string]string{"id": id})
    })
}
```

## 6. 实践项目

### 博客API项目
```go
// 使用Gin构建完整的博客API
type BlogAPI struct {
    db     *gorm.DB
    router *gin.Engine
}

func NewBlogAPI(db *gorm.DB) *BlogAPI {
    api := &BlogAPI{
        db:     db,
        router: gin.Default(),
    }
    
    api.setupRoutes()
    return api
}

func (api *BlogAPI) setupRoutes() {
    // 中间件
    api.router.Use(gin.Logger())
    api.router.Use(gin.Recovery())
    api.router.Use(corsMiddleware())
    
    // 公共路由
    public := api.router.Group("/api/v1")
    {
        public.POST("/auth/login", api.login)
        public.POST("/auth/register", api.register)
        public.GET("/posts", api.listPosts)
        public.GET("/posts/:id", api.getPost)
    }
    
    // 需要认证的路由
    protected := api.router.Group("/api/v1")
    protected.Use(authMiddleware())
    {
        protected.POST("/posts", api.createPost)
        protected.PUT("/posts/:id", api.updatePost)
        protected.DELETE("/posts/:id", api.deletePost)
        protected.GET("/profile", api.getProfile)
    }
}

func (api *BlogAPI) createPost(c *gin.Context) {
    var post Post
    
    if err := c.ShouldBindJSON(&post); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // 从上下文获取用户信息
    userID := c.GetInt("user_id")
    post.AuthorID = userID
    post.CreatedAt = time.Now()
    
    if err := api.db.Create(&post).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "创建文章失败"})
        return
    }
    
    c.JSON(http.StatusCreated, post)
}

type Post struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Title     string    `json:"title" binding:"required,max=100"`
    Content   string    `json:"content" binding:"required"`
    AuthorID  int       `json:"author_id"`
    Author    User      `json:"author" gorm:"foreignKey:AuthorID"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### 实时聊天应用
```go
// 使用Echo构建WebSocket聊天应用
type ChatServer struct {
    echo      *echo.Echo
    clients   map[*websocket.Conn]*Client
    broadcast chan []byte
    register  chan *Client
    unregister chan *Client
}

type Client struct {
    conn     *websocket.Conn
    userID   string
    username string
    send     chan []byte
}

func NewChatServer() *ChatServer {
    server := &ChatServer{
        echo:       echo.New(),
        clients:    make(map[*websocket.Conn]*Client),
        broadcast:  make(chan []byte),
        register:   make(chan *Client),
        unregister: make(chan *Client),
    }
    
    server.setupRoutes()
    go server.run()
    
    return server
}

func (server *ChatServer) setupRoutes() {
    server.echo.Use(middleware.Logger())
    server.echo.Use(middleware.Recover())
    
    server.echo.GET("/ws", server.handleWebSocket)
    server.echo.Static("/", "static")
}

func (server *ChatServer) handleWebSocket(c echo.Context) error {
    upgrader := websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool {
            return true // 允许所有来源
        },
    }
    
    conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        return err
    }
    
    client := &Client{
        conn:     conn,
        userID:   c.QueryParam("user_id"),
        username: c.QueryParam("username"),
        send:     make(chan []byte, 256),
    }
    
    server.register <- client
    
    go client.writePump()
    go client.readPump(server)
    
    return nil
}

func (server *ChatServer) run() {
    for {
        select {
        case client := <-server.register:
            server.clients[client.conn] = client
            message := fmt.Sprintf("%s 加入了聊天室", client.username)
            server.broadcast <- []byte(message)
            
        case client := <-server.unregister:
            if _, ok := server.clients[client.conn]; ok {
                delete(server.clients, client.conn)
                close(client.send)
                message := fmt.Sprintf("%s 离开了聊天室", client.username)
                server.broadcast <- []byte(message)
            }
            
        case message := <-server.broadcast:
            for conn, client := range server.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(server.clients, conn)
                }
            }
        }
    }
}
```

## 7. 实践练习

### 练习1：RESTful API设计
```go
// 设计一个电商系统的RESTful API
type ECommerceAPI struct {
    // 实现商品管理、订单处理、用户管理等功能
}

func (api *ECommerceAPI) setupRoutes() {
    // 设计完整的REST端点
    // GET /api/products - 商品列表
    // POST /api/products - 创建商品
    // GET /api/orders - 订单列表
    // POST /api/orders - 创建订单
}
```

### 练习2：微服务架构
```go
// 使用选定框架构建微服务
type UserService struct {
    // 用户服务
}

type ProductService struct {
    // 商品服务
}

type OrderService struct {
    // 订单服务
}

// 实现服务间通信和API网关
```

### 练习3：框架性能优化
```go
// 对选定框架进行性能优化
func optimizeFrameworkPerformance() {
    // 1. 连接池优化
    // 2. 中间件优化
    // 3. 路由优化
    // 4. 内存使用优化
}
```

## 8. 参考资料

- [Gin框架官方文档](https://gin-gonic.com/docs/)
- [Echo框架官方文档](https://echo.labstack.com/)
- [Fiber框架官方文档](https://docs.gofiber.io/)
- [Go Web框架性能对比](https://github.com/gin-gonic/gin#benchmarks)
- [Go Web开发最佳实践](https://golang.org/doc/effective_go.html)

---

通过本章的学习，你将了解Go语言主流Web框架的特点和使用方法，能够根据项目需求选择合适的框架进行Web应用开发。