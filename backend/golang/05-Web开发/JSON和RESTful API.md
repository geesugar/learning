# JSON和RESTful API

## 学习目标
- 掌握JSON序列化和反序列化
- 学习RESTful API设计原则
- 理解HTTP状态码和错误处理
- 掌握API版本控制和文档

## 1. JSON处理基础

### JSON序列化和反序列化
```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

// 用户结构体
type User struct {
    ID        int       `json:"id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    FullName  string    `json:"full_name"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    IsActive  bool      `json:"is_active"`
    Profile   Profile   `json:"profile,omitempty"`
    Tags      []string  `json:"tags,omitempty"`
}

// 用户资料结构体
type Profile struct {
    Avatar  string `json:"avatar,omitempty"`
    Bio     string `json:"bio,omitempty"`
    Website string `json:"website,omitempty"`
}

func jsonBasicsHandler(w http.ResponseWriter, r *http.Request) {
    // 创建示例数据
    user := User{
        ID:        1,
        Username:  "johndoe",
        Email:     "john@example.com",
        FullName:  "John Doe",
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
        IsActive:  true,
        Profile: Profile{
            Avatar:  "https://example.com/avatar.jpg",
            Bio:     "Software Developer",
            Website: "https://johndoe.dev",
        },
        Tags: []string{"developer", "go", "backend"},
    }
    
    // 序列化为JSON
    w.Header().Set("Content-Type", "application/json")
    
    // 使用json.NewEncoder进行流式编码
    if err := json.NewEncoder(w).Encode(user); err != nil {
        http.Error(w, "JSON编码失败", http.StatusInternalServerError)
        return
    }
}

func jsonParsingHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 限制请求体大小
    r.Body = http.MaxBytesReader(w, r.Body, 1048576) // 1MB
    
    var user User
    
    // 使用json.NewDecoder进行流式解码
    decoder := json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields() // 不允许未知字段
    
    if err := decoder.Decode(&user); err != nil {
        http.Error(w, "JSON解析失败: "+err.Error(), http.StatusBadRequest)
        return
    }
    
    // 验证数据
    if user.Username == "" || user.Email == "" {
        http.Error(w, "用户名和邮箱不能为空", http.StatusBadRequest)
        return
    }
    
    // 设置创建时间
    user.CreatedAt = time.Now()
    user.UpdatedAt = time.Now()
    
    // 返回创建的用户
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
```

### 高级JSON处理
```go
import (
    "reflect"
    "strconv"
    "strings"
)

// 自定义JSON标签处理
type CustomUser struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
    Password string `json:"-"` // 不序列化密码
    
    // 自定义序列化字段
    DisplayName string `json:"display_name,omitempty"`
    
    // 时间字段自定义格式
    CreatedAt CustomTime `json:"created_at"`
    
    // 枚举字段
    Status UserStatus `json:"status"`
    
    // 嵌套对象
    Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// 自定义时间类型
type CustomTime struct {
    time.Time
}

func (ct CustomTime) MarshalJSON() ([]byte, error) {
    return json.Marshal(ct.Format("2006-01-02 15:04:05"))
}

func (ct *CustomTime) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    
    t, err := time.Parse("2006-01-02 15:04:05", s)
    if err != nil {
        return err
    }
    
    ct.Time = t
    return nil
}

// 用户状态枚举
type UserStatus int

const (
    StatusInactive UserStatus = iota
    StatusActive
    StatusSuspended
    StatusDeleted
)

func (us UserStatus) MarshalJSON() ([]byte, error) {
    statuses := []string{"inactive", "active", "suspended", "deleted"}
    if int(us) >= len(statuses) {
        return json.Marshal("unknown")
    }
    return json.Marshal(statuses[us])
}

func (us *UserStatus) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    
    statuses := map[string]UserStatus{
        "inactive":  StatusInactive,
        "active":    StatusActive,
        "suspended": StatusSuspended,
        "deleted":   StatusDeleted,
    }
    
    if status, ok := statuses[s]; ok {
        *us = status
        return nil
    }
    
    return fmt.Errorf("无效的用户状态: %s", s)
}

// 动态JSON处理
func dynamicJSONHandler(w http.ResponseWriter, r *http.Request) {
    var data map[string]interface{}
    
    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        http.Error(w, "JSON解析失败", http.StatusBadRequest)
        return
    }
    
    // 处理动态字段
    processedData := processDynamicData(data)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(processedData)
}

func processDynamicData(data map[string]interface{}) map[string]interface{} {
    result := make(map[string]interface{})
    
    for key, value := range data {
        switch v := value.(type) {
        case string:
            // 处理字符串字段
            result[key] = strings.TrimSpace(v)
        case float64:
            // JSON数字默认为float64
            if v == float64(int64(v)) {
                result[key] = int64(v)
            } else {
                result[key] = v
            }
        case bool:
            result[key] = v
        case []interface{}:
            // 处理数组
            result[key] = processArray(v)
        case map[string]interface{}:
            // 递归处理嵌套对象
            result[key] = processDynamicData(v)
        default:
            result[key] = v
        }
    }
    
    return result
}

func processArray(arr []interface{}) []interface{} {
    result := make([]interface{}, len(arr))
    for i, item := range arr {
        if obj, ok := item.(map[string]interface{}); ok {
            result[i] = processDynamicData(obj)
        } else {
            result[i] = item
        }
    }
    return result
}
```

## 2. RESTful API设计

### 基本REST控制器
```go
import (
    "strconv"
    "strings"
)

type UserController struct {
    users map[int]User
    nextID int
}

func NewUserController() *UserController {
    return &UserController{
        users:  make(map[int]User),
        nextID: 1,
    }
}

// GET /api/users - 获取用户列表
func (uc *UserController) ListUsers(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 解析查询参数
    query := r.URL.Query()
    page, _ := strconv.Atoi(query.Get("page"))
    if page < 1 {
        page = 1
    }
    
    limit, _ := strconv.Atoi(query.Get("limit"))
    if limit < 1 || limit > 100 {
        limit = 10
    }
    
    search := query.Get("search")
    status := query.Get("status")
    
    // 过滤和分页
    users := uc.filterUsers(search, status)
    total := len(users)
    
    start := (page - 1) * limit
    end := start + limit
    
    if start >= total {
        users = []User{}
    } else {
        if end > total {
            end = total
        }
        users = users[start:end]
    }
    
    // 构建响应
    response := map[string]interface{}{
        "data": users,
        "pagination": map[string]interface{}{
            "page":        page,
            "limit":       limit,
            "total":       total,
            "total_pages": (total + limit - 1) / limit,
        },
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// GET /api/users/{id} - 获取单个用户
func (uc *UserController) GetUser(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 提取用户ID
    id, err := uc.extractUserID(r.URL.Path)
    if err != nil {
        http.Error(w, "无效的用户ID", http.StatusBadRequest)
        return
    }
    
    // 查找用户
    user, exists := uc.users[id]
    if !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// POST /api/users - 创建用户
func (uc *UserController) CreateUser(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "JSON解析失败", http.StatusBadRequest)
        return
    }
    
    // 验证用户数据
    if errors := uc.validateUser(user); len(errors) > 0 {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "error":   "验证失败",
            "details": errors,
        })
        return
    }
    
    // 设置用户ID和时间戳
    user.ID = uc.nextID
    uc.nextID++
    user.CreatedAt = time.Now()
    user.UpdatedAt = time.Now()
    
    // 保存用户
    uc.users[user.ID] = user
    
    // 返回创建的用户
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// PUT /api/users/{id} - 更新用户
func (uc *UserController) UpdateUser(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPut {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 提取用户ID
    id, err := uc.extractUserID(r.URL.Path)
    if err != nil {
        http.Error(w, "无效的用户ID", http.StatusBadRequest)
        return
    }
    
    // 检查用户是否存在
    existingUser, exists := uc.users[id]
    if !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }
    
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "JSON解析失败", http.StatusBadRequest)
        return
    }
    
    // 验证用户数据
    if errors := uc.validateUser(user); len(errors) > 0 {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "error":   "验证失败",
            "details": errors,
        })
        return
    }
    
    // 更新用户
    user.ID = id
    user.CreatedAt = existingUser.CreatedAt
    user.UpdatedAt = time.Now()
    
    uc.users[id] = user
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// PATCH /api/users/{id} - 部分更新用户
func (uc *UserController) PatchUser(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPatch {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 提取用户ID
    id, err := uc.extractUserID(r.URL.Path)
    if err != nil {
        http.Error(w, "无效的用户ID", http.StatusBadRequest)
        return
    }
    
    // 检查用户是否存在
    user, exists := uc.users[id]
    if !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }
    
    // 解析部分更新数据
    var updates map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
        http.Error(w, "JSON解析失败", http.StatusBadRequest)
        return
    }
    
    // 应用部分更新
    if username, ok := updates["username"].(string); ok {
        user.Username = username
    }
    if email, ok := updates["email"].(string); ok {
        user.Email = email
    }
    if fullName, ok := updates["full_name"].(string); ok {
        user.FullName = fullName
    }
    if isActive, ok := updates["is_active"].(bool); ok {
        user.IsActive = isActive
    }
    
    user.UpdatedAt = time.Now()
    uc.users[id] = user
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// DELETE /api/users/{id} - 删除用户
func (uc *UserController) DeleteUser(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodDelete {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    
    // 提取用户ID
    id, err := uc.extractUserID(r.URL.Path)
    if err != nil {
        http.Error(w, "无效的用户ID", http.StatusBadRequest)
        return
    }
    
    // 检查用户是否存在
    if _, exists := uc.users[id]; !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }
    
    // 删除用户
    delete(uc.users, id)
    
    w.WriteHeader(http.StatusNoContent)
}

// 辅助方法
func (uc *UserController) extractUserID(path string) (int, error) {
    parts := strings.Split(path, "/")
    if len(parts) < 4 {
        return 0, fmt.Errorf("无效路径")
    }
    
    return strconv.Atoi(parts[3])
}

func (uc *UserController) validateUser(user User) []string {
    var errors []string
    
    if user.Username == "" {
        errors = append(errors, "用户名不能为空")
    } else if len(user.Username) < 3 {
        errors = append(errors, "用户名至少3个字符")
    }
    
    if user.Email == "" {
        errors = append(errors, "邮箱不能为空")
    } else if !isValidEmail(user.Email) {
        errors = append(errors, "邮箱格式不正确")
    }
    
    return errors
}

func (uc *UserController) filterUsers(search, status string) []User {
    var result []User
    
    for _, user := range uc.users {
        // 搜索过滤
        if search != "" {
            searchLower := strings.ToLower(search)
            if !strings.Contains(strings.ToLower(user.Username), searchLower) &&
               !strings.Contains(strings.ToLower(user.Email), searchLower) &&
               !strings.Contains(strings.ToLower(user.FullName), searchLower) {
                continue
            }
        }
        
        // 状态过滤
        if status != "" {
            if (status == "active" && !user.IsActive) ||
               (status == "inactive" && user.IsActive) {
                continue
            }
        }
        
        result = append(result, user)
    }
    
    return result
}

func isValidEmail(email string) bool {
    // 简化的邮箱验证
    return strings.Contains(email, "@") && strings.Contains(email, ".")
}
```

### REST路由器
```go
type RestRouter struct {
    routes map[string]map[string]http.HandlerFunc
}

func NewRestRouter() *RestRouter {
    return &RestRouter{
        routes: make(map[string]map[string]http.HandlerFunc),
    }
}

func (rr *RestRouter) AddRoute(method, path string, handler http.HandlerFunc) {
    if rr.routes[path] == nil {
        rr.routes[path] = make(map[string]http.HandlerFunc)
    }
    rr.routes[path][method] = handler
}

func (rr *RestRouter) Resource(basePath string, controller ResourceController) {
    rr.AddRoute("GET", basePath, controller.Index)
    rr.AddRoute("POST", basePath, controller.Create)
    rr.AddRoute("GET", basePath+"/{id}", controller.Show)
    rr.AddRoute("PUT", basePath+"/{id}", controller.Update)
    rr.AddRoute("PATCH", basePath+"/{id}", controller.Patch)
    rr.AddRoute("DELETE", basePath+"/{id}", controller.Delete)
}

func (rr *RestRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // 简化的路由匹配
    path := r.URL.Path
    method := r.Method
    
    // 精确匹配
    if handlers, exists := rr.routes[path]; exists {
        if handler, exists := handlers[method]; exists {
            handler(w, r)
            return
        }
    }
    
    // 参数匹配 (简化实现)
    for routePath, handlers := range rr.routes {
        if matchPath(routePath, path) {
            if handler, exists := handlers[method]; exists {
                handler(w, r)
                return
            }
        }
    }
    
    if method == "OPTIONS" {
        rr.handleOptions(w, r)
        return
    }
    
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{
        "error": "路由不存在",
    })
}

func (rr *RestRouter) handleOptions(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    w.WriteHeader(http.StatusOK)
}

func matchPath(routePath, requestPath string) bool {
    // 简化的路径匹配实现
    routeParts := strings.Split(routePath, "/")
    requestParts := strings.Split(requestPath, "/")
    
    if len(routeParts) != len(requestParts) {
        return false
    }
    
    for i, part := range routeParts {
        if strings.HasPrefix(part, "{") && strings.HasSuffix(part, "}") {
            continue // 参数匹配
        }
        if part != requestParts[i] {
            return false
        }
    }
    
    return true
}

type ResourceController interface {
    Index(w http.ResponseWriter, r *http.Request)
    Create(w http.ResponseWriter, r *http.Request)
    Show(w http.ResponseWriter, r *http.Request)
    Update(w http.ResponseWriter, r *http.Request)
    Patch(w http.ResponseWriter, r *http.Request)
    Delete(w http.ResponseWriter, r *http.Request)
}
```

## 3. API错误处理

### 标准化错误响应
```go
type APIError struct {
    Code    string                 `json:"code"`
    Message string                 `json:"message"`
    Details map[string]interface{} `json:"details,omitempty"`
    TraceID string                 `json:"trace_id,omitempty"`
}

func (e APIError) Error() string {
    return e.Message
}

// 错误代码常量
const (
    ErrCodeBadRequest     = "BAD_REQUEST"
    ErrCodeUnauthorized   = "UNAUTHORIZED"
    ErrCodeForbidden      = "FORBIDDEN"
    ErrCodeNotFound       = "NOT_FOUND"
    ErrCodeConflict       = "CONFLICT"
    ErrCodeValidation     = "VALIDATION_ERROR"
    ErrCodeInternalServer = "INTERNAL_SERVER_ERROR"
    ErrCodeRateLimit      = "RATE_LIMIT_EXCEEDED"
)

// 错误构造函数
func NewAPIError(code, message string) APIError {
    return APIError{
        Code:    code,
        Message: message,
    }
}

func NewValidationError(details map[string]interface{}) APIError {
    return APIError{
        Code:    ErrCodeValidation,
        Message: "请求数据验证失败",
        Details: details,
    }
}

// 错误处理中间件
func ErrorHandlingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                traceID := generateTraceID()
                
                log.Printf("Panic recovered: %v, TraceID: %s", err, traceID)
                
                apiErr := APIError{
                    Code:    ErrCodeInternalServer,
                    Message: "服务器内部错误",
                    TraceID: traceID,
                }
                
                writeErrorResponse(w, apiErr, http.StatusInternalServerError)
            }
        }()
        
        next.ServeHTTP(w, r)
    })
}

func writeErrorResponse(w http.ResponseWriter, err APIError, statusCode int) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(err)
}

func generateTraceID() string {
    return fmt.Sprintf("%d", time.Now().UnixNano())
}

// 业务错误处理示例
func businessLogicHandler(w http.ResponseWriter, r *http.Request) {
    // 模拟业务逻辑
    userID := r.URL.Query().Get("user_id")
    if userID == "" {
        err := NewAPIError(ErrCodeBadRequest, "缺少用户ID参数")
        writeErrorResponse(w, err, http.StatusBadRequest)
        return
    }
    
    // 模拟用户不存在
    if userID == "999" {
        err := NewAPIError(ErrCodeNotFound, "用户不存在")
        writeErrorResponse(w, err, http.StatusNotFound)
        return
    }
    
    // 模拟权限不足
    if userID == "888" {
        err := NewAPIError(ErrCodeForbidden, "权限不足")
        writeErrorResponse(w, err, http.StatusForbidden)
        return
    }
    
    // 成功响应
    response := map[string]interface{}{
        "user_id": userID,
        "message": "操作成功",
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
```

### 验证错误处理
```go
import (
    "regexp"
    "unicode"
)

type Validator struct {
    errors map[string][]string
}

func NewValidator() *Validator {
    return &Validator{
        errors: make(map[string][]string),
    }
}

func (v *Validator) AddError(field, message string) {
    v.errors[field] = append(v.errors[field], message)
}

func (v *Validator) HasErrors() bool {
    return len(v.errors) > 0
}

func (v *Validator) GetErrors() map[string][]string {
    return v.errors
}

func (v *Validator) Required(field, value string) {
    if strings.TrimSpace(value) == "" {
        v.AddError(field, "字段不能为空")
    }
}

func (v *Validator) MinLength(field, value string, min int) {
    if len(value) < min {
        v.AddError(field, fmt.Sprintf("至少需要%d个字符", min))
    }
}

func (v *Validator) MaxLength(field, value string, max int) {
    if len(value) > max {
        v.AddError(field, fmt.Sprintf("最多允许%d个字符", max))
    }
}

func (v *Validator) Email(field, value string) {
    emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    if !emailRegex.MatchString(value) {
        v.AddError(field, "邮箱格式不正确")
    }
}

func (v *Validator) Password(field, value string) {
    if len(value) < 8 {
        v.AddError(field, "密码至少8个字符")
    }
    
    var hasUpper, hasLower, hasNumber, hasSpecial bool
    for _, char := range value {
        switch {
        case unicode.IsUpper(char):
            hasUpper = true
        case unicode.IsLower(char):
            hasLower = true
        case unicode.IsNumber(char):
            hasNumber = true
        case unicode.IsPunct(char) || unicode.IsSymbol(char):
            hasSpecial = true
        }
    }
    
    if !hasUpper {
        v.AddError(field, "密码必须包含大写字母")
    }
    if !hasLower {
        v.AddError(field, "密码必须包含小写字母")
    }
    if !hasNumber {
        v.AddError(field, "密码必须包含数字")
    }
    if !hasSpecial {
        v.AddError(field, "密码必须包含特殊字符")
    }
}

// 使用验证器的处理函数
func validatedCreateUser(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        apiErr := NewAPIError(ErrCodeBadRequest, "JSON格式错误")
        writeErrorResponse(w, apiErr, http.StatusBadRequest)
        return
    }
    
    // 验证用户数据
    validator := NewValidator()
    validator.Required("username", user.Username)
    validator.MinLength("username", user.Username, 3)
    validator.MaxLength("username", user.Username, 20)
    
    validator.Required("email", user.Email)
    validator.Email("email", user.Email)
    
    validator.Required("full_name", user.FullName)
    validator.MaxLength("full_name", user.FullName, 100)
    
    if validator.HasErrors() {
        apiErr := NewValidationError(map[string]interface{}{
            "field_errors": validator.GetErrors(),
        })
        writeErrorResponse(w, apiErr, http.StatusBadRequest)
        return
    }
    
    // 处理创建逻辑...
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
```

## 4. API版本控制

### URL版本控制
```go
type APIVersionRouter struct {
    versions map[string]http.Handler
}

func NewAPIVersionRouter() *APIVersionRouter {
    return &APIVersionRouter{
        versions: make(map[string]http.Handler),
    }
}

func (avr *APIVersionRouter) AddVersion(version string, handler http.Handler) {
    avr.versions[version] = handler
}

func (avr *APIVersionRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // 从URL路径提取版本
    path := r.URL.Path
    if !strings.HasPrefix(path, "/api/") {
        http.NotFound(w, r)
        return
    }
    
    parts := strings.Split(path, "/")
    if len(parts) < 3 {
        http.NotFound(w, r)
        return
    }
    
    version := parts[2] // /api/v1/...
    if handler, exists := avr.versions[version]; exists {
        // 修改请求路径，移除版本前缀
        r.URL.Path = "/" + strings.Join(parts[3:], "/")
        handler.ServeHTTP(w, r)
    } else {
        apiErr := NewAPIError(ErrCodeBadRequest, "不支持的API版本")
        writeErrorResponse(w, apiErr, http.StatusBadRequest)
    }
}

// V1 API
func setupV1API() http.Handler {
    mux := http.NewServeMux()
    
    userController := NewUserController()
    mux.HandleFunc("/users", userController.ListUsers)
    mux.HandleFunc("/users/", userController.GetUser)
    
    return mux
}

// V2 API (改进版)
func setupV2API() http.Handler {
    mux := http.NewServeMux()
    
    userController := NewUserControllerV2()
    mux.HandleFunc("/users", userController.ListUsers)
    mux.HandleFunc("/users/", userController.GetUser)
    
    return mux
}

func apiVersionExample() {
    router := NewAPIVersionRouter()
    router.AddVersion("v1", setupV1API())
    router.AddVersion("v2", setupV2API())
    
    http.Handle("/api/", router)
    
    log.Println("API服务器启动在端口 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### Header版本控制
```go
func HeaderVersionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        version := r.Header.Get("API-Version")
        if version == "" {
            version = "v1" // 默认版本
        }
        
        // 将版本信息添加到请求上下文
        ctx := context.WithValue(r.Context(), "api_version", version)
        r = r.WithContext(ctx)
        
        next.ServeHTTP(w, r)
    })
}

func versionAwareHandler(w http.ResponseWriter, r *http.Request) {
    version := r.Context().Value("api_version").(string)
    
    switch version {
    case "v1":
        handleV1(w, r)
    case "v2":
        handleV2(w, r)
    default:
        apiErr := NewAPIError(ErrCodeBadRequest, "不支持的API版本")
        writeErrorResponse(w, apiErr, http.StatusBadRequest)
    }
}

func handleV1(w http.ResponseWriter, r *http.Request) {
    response := map[string]interface{}{
        "version": "v1",
        "message": "这是V1 API响应",
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func handleV2(w http.ResponseWriter, r *http.Request) {
    response := map[string]interface{}{
        "version": "v2",
        "message": "这是V2 API响应",
        "features": []string{"enhanced", "improved"},
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
```

## 5. API文档和测试

### 自动API文档生成
```go
type APIDoc struct {
    Title       string                `json:"title"`
    Version     string                `json:"version"`
    Description string                `json:"description"`
    BasePath    string                `json:"base_path"`
    Endpoints   map[string][]Endpoint `json:"endpoints"`
}

type Endpoint struct {
    Method      string                 `json:"method"`
    Path        string                 `json:"path"`
    Summary     string                 `json:"summary"`
    Description string                 `json:"description"`
    Parameters  []Parameter            `json:"parameters,omitempty"`
    Responses   map[string]Response    `json:"responses"`
}

type Parameter struct {
    Name        string `json:"name"`
    Type        string `json:"type"`
    Location    string `json:"location"` // query, path, body, header
    Required    bool   `json:"required"`
    Description string `json:"description"`
}

type Response struct {
    Description string      `json:"description"`
    Example     interface{} `json:"example,omitempty"`
}

func generateAPIDoc() APIDoc {
    return APIDoc{
        Title:       "用户管理API",
        Version:     "1.0.0",
        Description: "用户管理系统的RESTful API",
        BasePath:    "/api/v1",
        Endpoints: map[string][]Endpoint{
            "/users": {
                {
                    Method:      "GET",
                    Path:        "/users",
                    Summary:     "获取用户列表",
                    Description: "分页获取系统中的用户列表",
                    Parameters: []Parameter{
                        {Name: "page", Type: "integer", Location: "query", Required: false, Description: "页码"},
                        {Name: "limit", Type: "integer", Location: "query", Required: false, Description: "每页数量"},
                        {Name: "search", Type: "string", Location: "query", Required: false, Description: "搜索关键词"},
                    },
                    Responses: map[string]Response{
                        "200": {
                            Description: "成功返回用户列表",
                            Example: map[string]interface{}{
                                "data": []User{{ID: 1, Username: "john", Email: "john@example.com"}},
                                "pagination": map[string]interface{}{
                                    "page":        1,
                                    "limit":       10,
                                    "total":       100,
                                    "total_pages": 10,
                                },
                            },
                        },
                    },
                },
                {
                    Method:      "POST",
                    Path:        "/users",
                    Summary:     "创建用户",
                    Description: "创建新的用户账户",
                    Parameters: []Parameter{
                        {Name: "user", Type: "object", Location: "body", Required: true, Description: "用户信息"},
                    },
                    Responses: map[string]Response{
                        "201": {Description: "用户创建成功"},
                        "400": {Description: "请求参数错误"},
                    },
                },
            },
        },
    }
}

func apiDocHandler(w http.ResponseWriter, r *http.Request) {
    doc := generateAPIDoc()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(doc)
}

func apiDocUIHandler(w http.ResponseWriter, r *http.Request) {
    html := `
    <!DOCTYPE html>
    <html>
    <head>
        <title>API文档</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .endpoint { margin: 20px 0; border: 1px solid #ddd; padding: 15px; }
            .method { font-weight: bold; color: white; padding: 5px 10px; border-radius: 3px; }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .put { background-color: #fca130; }
            .delete { background-color: #f93e3e; }
            .parameters { margin: 10px 0; }
            .parameter { margin: 5px 0; padding: 5px; background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <h1>API文档</h1>
        <div id="api-doc"></div>
        
        <script>
            fetch('/api/doc')
                .then(response => response.json())
                .then(doc => {
                    const container = document.getElementById('api-doc');
                    
                    Object.keys(doc.endpoints).forEach(path => {
                        doc.endpoints[path].forEach(endpoint => {
                            const endpointDiv = document.createElement('div');
                            endpointDiv.className = 'endpoint';
                            
                            endpointDiv.innerHTML = ` + "`" + `
                                <div>
                                    <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                                    <strong>${endpoint.path}</strong>
                                </div>
                                <h3>${endpoint.summary}</h3>
                                <p>${endpoint.description}</p>
                                ${endpoint.parameters ? '<div class="parameters"><h4>参数:</h4>' + 
                                  endpoint.parameters.map(p => 
                                    ` + "`" + `<div class="parameter"><strong>${p.name}</strong> (${p.type}) - ${p.description}</div>` + "`" + `
                                  ).join('') + '</div>' : ''}
                            ` + "`" + `;
                            
                            container.appendChild(endpointDiv);
                        });
                    });
                });
        </script>
    </body>
    </html>
    `
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprint(w, html)
}
```

## 6. 实践应用

### 完整的API服务器
```go
func main() {
    // 创建路由器
    router := NewRestRouter()
    
    // 创建控制器
    userController := NewUserController()
    
    // 注册RESTful路由
    router.Resource("/api/v1/users", userController)
    
    // 添加文档路由
    router.AddRoute("GET", "/api/doc", apiDocHandler)
    router.AddRoute("GET", "/api/docs", apiDocUIHandler)
    
    // 应用中间件
    handler := ErrorHandlingMiddleware(router)
    handler = HeaderVersionMiddleware(handler)
    handler = LoggingMiddleware(handler)
    handler = CORSMiddleware(handler)
    
    // 启动服务器
    server := &http.Server{
        Addr:         ":8080",
        Handler:      handler,
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 10 * time.Second,
    }
    
    log.Println("API服务器启动在端口 8080")
    log.Fatal(server.ListenAndServe())
}
```

## 7. 实践练习

### 练习1：博客API
```go
// 实现一个博客系统的RESTful API
type BlogAPI struct {
    posts    map[int]BlogPost
    comments map[int][]Comment
}

type BlogPost struct {
    ID      int    `json:"id"`
    Title   string `json:"title"`
    Content string `json:"content"`
    Author  string `json:"author"`
    // 其他字段...
}

func (ba *BlogAPI) CreatePost(w http.ResponseWriter, r *http.Request) {
    // 实现文章创建
}

func (ba *BlogAPI) GetPost(w http.ResponseWriter, r *http.Request) {
    // 实现文章获取
}
```

### 练习2：文件管理API
```go
// 实现一个文件管理系统的API
type FileAPI struct {
    storage FileStorage
}

func (fa *FileAPI) UploadFile(w http.ResponseWriter, r *http.Request) {
    // 实现文件上传
}

func (fa *FileAPI) DownloadFile(w http.ResponseWriter, r *http.Request) {
    // 实现文件下载
}
```

### 练习3：实时通知API
```go
// 实现一个实时通知系统
type NotificationAPI struct {
    subscribers map[string]chan Notification
}

func (na *NotificationAPI) Subscribe(w http.ResponseWriter, r *http.Request) {
    // 实现SSE订阅
}

func (na *NotificationAPI) SendNotification(w http.ResponseWriter, r *http.Request) {
    // 实现通知发送
}
```

## 8. 参考资料

- [encoding/json包文档](https://golang.org/pkg/encoding/json/)
- [RESTful API设计指南](https://restfulapi.net/)
- [HTTP状态码参考](https://httpstatuses.com/)
- [API版本控制最佳实践](https://blog.restcase.com/restful-api-versioning-insights/)

---

通过本章的学习，你将掌握使用Go语言开发高质量RESTful API的技能，包括JSON处理、错误处理、版本控制和文档生成等关键技术。