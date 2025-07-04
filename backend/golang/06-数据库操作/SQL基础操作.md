# SQL基础操作

## 学习目标
- 掌握database/sql包的基本使用
- 学习SQL查询、插入、更新和删除操作
- 理解事务处理和错误处理
- 掌握预处理语句和SQL注入防护

## 1. 数据库连接

### 基本连接设置
```go
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    
    _ "github.com/go-sql-driver/mysql"
    _ "github.com/lib/pq"
    _ "github.com/mattn/go-sqlite3"
)

// 数据库配置
type DBConfig struct {
    Driver   string
    Host     string
    Port     int
    Username string
    Password string
    Database string
    SSLMode  string
}

// MySQL连接
func connectMySQL(config DBConfig) (*sql.DB, error) {
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        config.Username,
        config.Password,
        config.Host,
        config.Port,
        config.Database)
    
    db, err := sql.Open("mysql", dsn)
    if err != nil {
        return nil, err
    }
    
    // 配置连接池
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(10)
    db.SetConnMaxLifetime(5 * time.Minute)
    
    // 测试连接
    if err := db.Ping(); err != nil {
        return nil, err
    }
    
    return db, nil
}

// PostgreSQL连接
func connectPostgreSQL(config DBConfig) (*sql.DB, error) {
    dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
        config.Host,
        config.Port,
        config.Username,
        config.Password,
        config.Database,
        config.SSLMode)
    
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, err
    }
    
    // 配置连接池
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(10)
    db.SetConnMaxLifetime(5 * time.Minute)
    
    if err := db.Ping(); err != nil {
        return nil, err
    }
    
    return db, nil
}

// SQLite连接
func connectSQLite(dbPath string) (*sql.DB, error) {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, err
    }
    
    // SQLite特定配置
    db.SetMaxOpenConns(1) // SQLite建议单连接
    
    if err := db.Ping(); err != nil {
        return nil, err
    }
    
    return db, nil
}

// 数据库管理器
type Database struct {
    DB     *sql.DB
    Driver string
}

func NewDatabase(config DBConfig) (*Database, error) {
    var db *sql.DB
    var err error
    
    switch config.Driver {
    case "mysql":
        db, err = connectMySQL(config)
    case "postgres":
        db, err = connectPostgreSQL(config)
    case "sqlite3":
        db, err = connectSQLite(config.Database)
    default:
        return nil, fmt.Errorf("不支持的数据库驱动: %s", config.Driver)
    }
    
    if err != nil {
        return nil, err
    }
    
    return &Database{
        DB:     db,
        Driver: config.Driver,
    }, nil
}

func (d *Database) Close() error {
    return d.DB.Close()
}

func (d *Database) Ping() error {
    return d.DB.Ping()
}
```

### 连接池管理
```go
import (
    "context"
    "sync"
    "time"
)

// 连接池监控
type PoolMonitor struct {
    db       *sql.DB
    interval time.Duration
    logger   Logger
    stopCh   chan struct{}
    wg       sync.WaitGroup
}

func NewPoolMonitor(db *sql.DB, interval time.Duration, logger Logger) *PoolMonitor {
    return &PoolMonitor{
        db:       db,
        interval: interval,
        logger:   logger,
        stopCh:   make(chan struct{}),
    }
}

func (pm *PoolMonitor) Start() {
    pm.wg.Add(1)
    go pm.monitor()
}

func (pm *PoolMonitor) Stop() {
    close(pm.stopCh)
    pm.wg.Wait()
}

func (pm *PoolMonitor) monitor() {
    defer pm.wg.Done()
    
    ticker := time.NewTicker(pm.interval)
    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
            stats := pm.db.Stats()
            pm.logger.Infof("数据库连接池状态: "+
                "打开连接数=%d, 使用中连接数=%d, 空闲连接数=%d, "+
                "等待连接数=%d, 等待时间=%v",
                stats.OpenConnections,
                stats.InUse,
                stats.Idle,
                stats.WaitCount,
                stats.WaitDuration)
                
        case <-pm.stopCh:
            return
        }
    }
}

// 健康检查
func (d *Database) HealthCheck(ctx context.Context) error {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    return d.DB.PingContext(ctx)
}

// 连接重试机制
func (d *Database) ConnectWithRetry(config DBConfig, maxRetries int, retryInterval time.Duration) error {
    var err error
    
    for i := 0; i < maxRetries; i++ {
        db, connectErr := NewDatabase(config)
        if connectErr == nil {
            d.DB = db.DB
            d.Driver = db.Driver
            return nil
        }
        
        err = connectErr
        log.Printf("数据库连接失败 (尝试 %d/%d): %v", i+1, maxRetries, err)
        
        if i < maxRetries-1 {
            time.Sleep(retryInterval)
        }
    }
    
    return fmt.Errorf("数据库连接失败，已重试 %d 次: %v", maxRetries, err)
}
```

## 2. 基本CRUD操作

### 数据模型定义
```go
import (
    "time"
    "database/sql/driver"
)

// 用户模型
type User struct {
    ID        int64     `db:"id" json:"id"`
    Username  string    `db:"username" json:"username"`
    Email     string    `db:"email" json:"email"`
    Password  string    `db:"password" json:"-"`
    FullName  string    `db:"full_name" json:"full_name"`
    Avatar    string    `db:"avatar" json:"avatar"`
    Status    UserStatus `db:"status" json:"status"`
    CreatedAt time.Time `db:"created_at" json:"created_at"`
    UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

// 用户状态枚举
type UserStatus int

const (
    UserStatusInactive UserStatus = iota
    UserStatusActive
    UserStatusSuspended
    UserStatusDeleted
)

func (us UserStatus) String() string {
    switch us {
    case UserStatusInactive:
        return "inactive"
    case UserStatusActive:
        return "active"
    case UserStatusSuspended:
        return "suspended"
    case UserStatusDeleted:
        return "deleted"
    default:
        return "unknown"
    }
}

// 实现database/sql接口
func (us UserStatus) Value() (driver.Value, error) {
    return int64(us), nil
}

func (us *UserStatus) Scan(value interface{}) error {
    if value == nil {
        *us = UserStatusInactive
        return nil
    }
    
    switch v := value.(type) {
    case int64:
        *us = UserStatus(v)
    case int:
        *us = UserStatus(v)
    default:
        return fmt.Errorf("无法将 %T 转换为 UserStatus", value)
    }
    
    return nil
}

// 文章模型
type Post struct {
    ID        int64     `db:"id" json:"id"`
    Title     string    `db:"title" json:"title"`
    Content   string    `db:"content" json:"content"`
    AuthorID  int64     `db:"author_id" json:"author_id"`
    Author    *User     `json:"author,omitempty"`
    Tags      []string  `json:"tags,omitempty"`
    Published bool      `db:"published" json:"published"`
    CreatedAt time.Time `db:"created_at" json:"created_at"`
    UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
```

### 创建操作 (INSERT)
```go
// 用户仓库
type UserRepository struct {
    db *Database
}

func NewUserRepository(db *Database) *UserRepository {
    return &UserRepository{db: db}
}

// 创建用户
func (ur *UserRepository) Create(ctx context.Context, user *User) error {
    query := `
        INSERT INTO users (username, email, password, full_name, avatar, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    
    now := time.Now()
    user.CreatedAt = now
    user.UpdatedAt = now
    
    result, err := ur.db.DB.ExecContext(ctx, query,
        user.Username,
        user.Email,
        user.Password,
        user.FullName,
        user.Avatar,
        user.Status,
        user.CreatedAt,
        user.UpdatedAt)
    
    if err != nil {
        return fmt.Errorf("创建用户失败: %w", err)
    }
    
    // 获取插入的ID
    id, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("获取插入ID失败: %w", err)
    }
    
    user.ID = id
    return nil
}

// 批量创建用户
func (ur *UserRepository) CreateBatch(ctx context.Context, users []*User) error {
    if len(users) == 0 {
        return nil
    }
    
    // 构建批量插入语句
    query := `
        INSERT INTO users (username, email, password, full_name, avatar, status, created_at, updated_at)
        VALUES `
    
    values := make([]interface{}, 0, len(users)*8)
    placeholders := make([]string, 0, len(users))
    
    now := time.Now()
    for i, user := range users {
        user.CreatedAt = now
        user.UpdatedAt = now
        
        placeholders = append(placeholders, "(?, ?, ?, ?, ?, ?, ?, ?)")
        values = append(values,
            user.Username,
            user.Email,
            user.Password,
            user.FullName,
            user.Avatar,
            user.Status,
            user.CreatedAt,
            user.UpdatedAt)
    }
    
    query += strings.Join(placeholders, ", ")
    
    _, err := ur.db.DB.ExecContext(ctx, query, values...)
    if err != nil {
        return fmt.Errorf("批量创建用户失败: %w", err)
    }
    
    return nil
}

// 使用事务创建用户和相关数据
func (ur *UserRepository) CreateWithProfile(ctx context.Context, user *User, profile *UserProfile) error {
    tx, err := ur.db.DB.BeginTx(ctx, nil)
    if err != nil {
        return fmt.Errorf("开始事务失败: %w", err)
    }
    defer tx.Rollback()
    
    // 创建用户
    userQuery := `
        INSERT INTO users (username, email, password, full_name, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
    
    now := time.Now()
    user.CreatedAt = now
    user.UpdatedAt = now
    
    result, err := tx.ExecContext(ctx, userQuery,
        user.Username,
        user.Email,
        user.Password,
        user.FullName,
        user.Status,
        user.CreatedAt,
        user.UpdatedAt)
    
    if err != nil {
        return fmt.Errorf("创建用户失败: %w", err)
    }
    
    userID, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("获取用户ID失败: %w", err)
    }
    
    user.ID = userID
    profile.UserID = userID
    
    // 创建用户资料
    profileQuery := `
        INSERT INTO user_profiles (user_id, bio, website, location, birth_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
    
    profile.CreatedAt = now
    profile.UpdatedAt = now
    
    _, err = tx.ExecContext(ctx, profileQuery,
        profile.UserID,
        profile.Bio,
        profile.Website,
        profile.Location,
        profile.BirthDate,
        profile.CreatedAt,
        profile.UpdatedAt)
    
    if err != nil {
        return fmt.Errorf("创建用户资料失败: %w", err)
    }
    
    // 提交事务
    if err := tx.Commit(); err != nil {
        return fmt.Errorf("提交事务失败: %w", err)
    }
    
    return nil
}
```

### 查询操作 (SELECT)
```go
// 根据ID查询用户
func (ur *UserRepository) GetByID(ctx context.Context, id int64) (*User, error) {
    query := `
        SELECT id, username, email, full_name, avatar, status, created_at, updated_at
        FROM users
        WHERE id = ?`
    
    user := &User{}
    err := ur.db.DB.QueryRowContext(ctx, query, id).Scan(
        &user.ID,
        &user.Username,
        &user.Email,
        &user.FullName,
        &user.Avatar,
        &user.Status,
        &user.CreatedAt,
        &user.UpdatedAt)
    
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil // 用户不存在
        }
        return nil, fmt.Errorf("查询用户失败: %w", err)
    }
    
    return user, nil
}

// 根据用户名查询用户
func (ur *UserRepository) GetByUsername(ctx context.Context, username string) (*User, error) {
    query := `
        SELECT id, username, email, full_name, avatar, status, created_at, updated_at
        FROM users
        WHERE username = ?`
    
    user := &User{}
    err := ur.db.DB.QueryRowContext(ctx, query, username).Scan(
        &user.ID,
        &user.Username,
        &user.Email,
        &user.FullName,
        &user.Avatar,
        &user.Status,
        &user.CreatedAt,
        &user.UpdatedAt)
    
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil
        }
        return nil, fmt.Errorf("查询用户失败: %w", err)
    }
    
    return user, nil
}

// 分页查询用户列表
type UserListOptions struct {
    Page     int
    PageSize int
    Search   string
    Status   *UserStatus
    SortBy   string
    SortDesc bool
}

type UserListResult struct {
    Users      []*User `json:"users"`
    Total      int64   `json:"total"`
    Page       int     `json:"page"`
    PageSize   int     `json:"page_size"`
    TotalPages int     `json:"total_pages"`
}

func (ur *UserRepository) List(ctx context.Context, opts UserListOptions) (*UserListResult, error) {
    // 设置默认值
    if opts.Page < 1 {
        opts.Page = 1
    }
    if opts.PageSize < 1 {
        opts.PageSize = 20
    }
    if opts.SortBy == "" {
        opts.SortBy = "created_at"
    }
    
    // 构建WHERE条件
    whereConditions := []string{}
    args := []interface{}{}
    
    if opts.Search != "" {
        whereConditions = append(whereConditions, 
            "(username LIKE ? OR email LIKE ? OR full_name LIKE ?)")
        searchPattern := "%" + opts.Search + "%"
        args = append(args, searchPattern, searchPattern, searchPattern)
    }
    
    if opts.Status != nil {
        whereConditions = append(whereConditions, "status = ?")
        args = append(args, *opts.Status)
    }
    
    whereClause := ""
    if len(whereConditions) > 0 {
        whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
    }
    
    // 查询总数
    countQuery := fmt.Sprintf("SELECT COUNT(*) FROM users %s", whereClause)
    var total int64
    err := ur.db.DB.QueryRowContext(ctx, countQuery, args...).Scan(&total)
    if err != nil {
        return nil, fmt.Errorf("查询用户总数失败: %w", err)
    }
    
    // 构建排序
    sortOrder := "ASC"
    if opts.SortDesc {
        sortOrder = "DESC"
    }
    orderClause := fmt.Sprintf("ORDER BY %s %s", opts.SortBy, sortOrder)
    
    // 构建分页
    offset := (opts.Page - 1) * opts.PageSize
    limitClause := fmt.Sprintf("LIMIT %d OFFSET %d", opts.PageSize, offset)
    
    // 查询数据
    dataQuery := fmt.Sprintf(`
        SELECT id, username, email, full_name, avatar, status, created_at, updated_at
        FROM users
        %s
        %s
        %s`, whereClause, orderClause, limitClause)
    
    rows, err := ur.db.DB.QueryContext(ctx, dataQuery, args...)
    if err != nil {
        return nil, fmt.Errorf("查询用户列表失败: %w", err)
    }
    defer rows.Close()
    
    users := make([]*User, 0)
    for rows.Next() {
        user := &User{}
        err := rows.Scan(
            &user.ID,
            &user.Username,
            &user.Email,
            &user.FullName,
            &user.Avatar,
            &user.Status,
            &user.CreatedAt,
            &user.UpdatedAt)
        
        if err != nil {
            return nil, fmt.Errorf("扫描用户数据失败: %w", err)
        }
        
        users = append(users, user)
    }
    
    if err := rows.Err(); err != nil {
        return nil, fmt.Errorf("遍历用户数据失败: %w", err)
    }
    
    totalPages := int((total + int64(opts.PageSize) - 1) / int64(opts.PageSize))
    
    return &UserListResult{
        Users:      users,
        Total:      total,
        Page:       opts.Page,
        PageSize:   opts.PageSize,
        TotalPages: totalPages,
    }, nil
}

// 复杂关联查询 - 获取用户及其文章
func (ur *UserRepository) GetUserWithPosts(ctx context.Context, userID int64) (*User, []*Post, error) {
    // 查询用户信息
    user, err := ur.GetByID(ctx, userID)
    if err != nil {
        return nil, nil, err
    }
    if user == nil {
        return nil, nil, nil
    }
    
    // 查询用户的文章
    postsQuery := `
        SELECT id, title, content, author_id, published, created_at, updated_at
        FROM posts
        WHERE author_id = ?
        ORDER BY created_at DESC`
    
    rows, err := ur.db.DB.QueryContext(ctx, postsQuery, userID)
    if err != nil {
        return nil, nil, fmt.Errorf("查询用户文章失败: %w", err)
    }
    defer rows.Close()
    
    posts := make([]*Post, 0)
    for rows.Next() {
        post := &Post{}
        err := rows.Scan(
            &post.ID,
            &post.Title,
            &post.Content,
            &post.AuthorID,
            &post.Published,
            &post.CreatedAt,
            &post.UpdatedAt)
        
        if err != nil {
            return nil, nil, fmt.Errorf("扫描文章数据失败: %w", err)
        }
        
        post.Author = user
        posts = append(posts, post)
    }
    
    if err := rows.Err(); err != nil {
        return nil, nil, fmt.Errorf("遍历文章数据失败: %w", err)
    }
    
    return user, posts, nil
}
```

### 更新操作 (UPDATE)
```go
// 更新用户信息
func (ur *UserRepository) Update(ctx context.Context, user *User) error {
    query := `
        UPDATE users
        SET username = ?, email = ?, full_name = ?, avatar = ?, status = ?, updated_at = ?
        WHERE id = ?`
    
    user.UpdatedAt = time.Now()
    
    result, err := ur.db.DB.ExecContext(ctx, query,
        user.Username,
        user.Email,
        user.FullName,
        user.Avatar,
        user.Status,
        user.UpdatedAt,
        user.ID)
    
    if err != nil {
        return fmt.Errorf("更新用户失败: %w", err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return fmt.Errorf("获取影响行数失败: %w", err)
    }
    
    if rowsAffected == 0 {
        return fmt.Errorf("用户不存在或数据未变更")
    }
    
    return nil
}

// 部分更新用户信息
func (ur *UserRepository) UpdatePartial(ctx context.Context, userID int64, updates map[string]interface{}) error {
    if len(updates) == 0 {
        return fmt.Errorf("没有提供更新字段")
    }
    
    // 构建SET子句
    setParts := make([]string, 0, len(updates)+1)
    args := make([]interface{}, 0, len(updates)+2)
    
    for field, value := range updates {
        // 验证字段名（防止SQL注入）
        if !isValidUpdateField(field) {
            return fmt.Errorf("无效的更新字段: %s", field)
        }
        setParts = append(setParts, field+" = ?")
        args = append(args, value)
    }
    
    // 添加updated_at字段
    setParts = append(setParts, "updated_at = ?")
    args = append(args, time.Now())
    
    // 添加WHERE条件参数
    args = append(args, userID)
    
    query := fmt.Sprintf("UPDATE users SET %s WHERE id = ?", 
                        strings.Join(setParts, ", "))
    
    result, err := ur.db.DB.ExecContext(ctx, query, args...)
    if err != nil {
        return fmt.Errorf("部分更新用户失败: %w", err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return fmt.Errorf("获取影响行数失败: %w", err)
    }
    
    if rowsAffected == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

func isValidUpdateField(field string) bool {
    validFields := map[string]bool{
        "username":  true,
        "email":     true,
        "full_name": true,
        "avatar":    true,
        "status":    true,
    }
    return validFields[field]
}

// 批量更新用户状态
func (ur *UserRepository) UpdateStatusBatch(ctx context.Context, userIDs []int64, status UserStatus) error {
    if len(userIDs) == 0 {
        return nil
    }
    
    // 构建IN子句
    placeholders := make([]string, len(userIDs))
    args := make([]interface{}, 0, len(userIDs)+2)
    
    for i, id := range userIDs {
        placeholders[i] = "?"
        args = append(args, id)
    }
    
    args = append(args, status, time.Now())
    
    query := fmt.Sprintf(`
        UPDATE users
        SET status = ?, updated_at = ?
        WHERE id IN (%s)`, strings.Join(placeholders, ", "))
    
    result, err := ur.db.DB.ExecContext(ctx, query, args...)
    if err != nil {
        return fmt.Errorf("批量更新用户状态失败: %w", err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return fmt.Errorf("获取影响行数失败: %w", err)
    }
    
    log.Printf("批量更新用户状态: 预期更新 %d 行, 实际更新 %d 行", 
              len(userIDs), rowsAffected)
    
    return nil
}
```

### 删除操作 (DELETE)
```go
// 根据ID删除用户
func (ur *UserRepository) Delete(ctx context.Context, id int64) error {
    query := "DELETE FROM users WHERE id = ?"
    
    result, err := ur.db.DB.ExecContext(ctx, query, id)
    if err != nil {
        return fmt.Errorf("删除用户失败: %w", err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return fmt.Errorf("获取影响行数失败: %w", err)
    }
    
    if rowsAffected == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 软删除用户（更新状态为已删除）
func (ur *UserRepository) SoftDelete(ctx context.Context, id int64) error {
    return ur.UpdatePartial(ctx, id, map[string]interface{}{
        "status": UserStatusDeleted,
    })
}

// 批量删除用户
func (ur *UserRepository) DeleteBatch(ctx context.Context, ids []int64) error {
    if len(ids) == 0 {
        return nil
    }
    
    placeholders := make([]string, len(ids))
    args := make([]interface{}, len(ids))
    
    for i, id := range ids {
        placeholders[i] = "?"
        args[i] = id
    }
    
    query := fmt.Sprintf("DELETE FROM users WHERE id IN (%s)", 
                        strings.Join(placeholders, ", "))
    
    result, err := ur.db.DB.ExecContext(ctx, query, args...)
    if err != nil {
        return fmt.Errorf("批量删除用户失败: %w", err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return fmt.Errorf("获取影响行数失败: %w", err)
    }
    
    log.Printf("批量删除用户: 预期删除 %d 行, 实际删除 %d 行", 
              len(ids), rowsAffected)
    
    return nil
}

// 根据条件删除用户
func (ur *UserRepository) DeleteByCondition(ctx context.Context, condition string, args ...interface{}) error {
    // 安全检查：确保条件不为空，避免删除所有数据
    if strings.TrimSpace(condition) == "" {
        return fmt.Errorf("删除条件不能为空")
    }
    
    query := fmt.Sprintf("DELETE FROM users WHERE %s", condition)
    
    result, err := ur.db.DB.ExecContext(ctx, query, args...)
    if err != nil {
        return fmt.Errorf("按条件删除用户失败: %w", err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return fmt.Errorf("获取影响行数失败: %w", err)
    }
    
    log.Printf("按条件删除用户: 删除了 %d 行", rowsAffected)
    
    return nil
}
```

## 3. 事务处理

### 基本事务操作
```go
import (
    "context"
    "database/sql"
)

// 事务管理器
type TransactionManager struct {
    db *Database
}

func NewTransactionManager(db *Database) *TransactionManager {
    return &TransactionManager{db: db}
}

// 执行事务
func (tm *TransactionManager) ExecuteTransaction(ctx context.Context, fn func(*sql.Tx) error) error {
    tx, err := tm.db.DB.BeginTx(ctx, nil)
    if err != nil {
        return fmt.Errorf("开始事务失败: %w", err)
    }
    
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p) // 重新抛出panic
        } else if err != nil {
            tx.Rollback()
        } else {
            err = tx.Commit()
        }
    }()
    
    err = fn(tx)
    return err
}

// 带重试的事务执行
func (tm *TransactionManager) ExecuteTransactionWithRetry(ctx context.Context, maxRetries int, fn func(*sql.Tx) error) error {
    var lastErr error
    
    for attempt := 0; attempt <= maxRetries; attempt++ {
        err := tm.ExecuteTransaction(ctx, fn)
        if err == nil {
            return nil
        }
        
        lastErr = err
        
        // 检查是否是可重试的错误
        if !isRetryableError(err) {
            break
        }
        
        if attempt < maxRetries {
            log.Printf("事务执行失败，尝试重试 (%d/%d): %v", attempt+1, maxRetries, err)
            time.Sleep(time.Duration(attempt+1) * 100 * time.Millisecond)
        }
    }
    
    return fmt.Errorf("事务执行失败，已重试 %d 次: %w", maxRetries, lastErr)
}

func isRetryableError(err error) bool {
    // 这里可以根据具体的数据库驱动判断哪些错误是可重试的
    // 例如连接错误、超时错误等
    errorStr := err.Error()
    retryableErrors := []string{
        "connection refused",
        "timeout",
        "connection reset",
        "deadlock",
    }
    
    for _, retryableErr := range retryableErrors {
        if strings.Contains(strings.ToLower(errorStr), retryableErr) {
            return true
        }
    }
    
    return false
}

// 复杂业务事务示例：转账操作
type AccountRepository struct {
    db *Database
}

type Account struct {
    ID      int64   `db:"id"`
    UserID  int64   `db:"user_id"`
    Balance float64 `db:"balance"`
}

type Transaction struct {
    ID          int64   `db:"id"`
    FromAccount int64   `db:"from_account"`
    ToAccount   int64   `db:"to_account"`
    Amount      float64 `db:"amount"`
    Description string  `db:"description"`
    CreatedAt   time.Time `db:"created_at"`
}

func (ar *AccountRepository) Transfer(ctx context.Context, fromAccountID, toAccountID int64, amount float64, description string) error {
    tm := NewTransactionManager(ar.db)
    
    return tm.ExecuteTransaction(ctx, func(tx *sql.Tx) error {
        // 1. 锁定源账户并检查余额
        var fromBalance float64
        err := tx.QueryRowContext(ctx, 
            "SELECT balance FROM accounts WHERE id = ? FOR UPDATE", fromAccountID).Scan(&fromBalance)
        if err != nil {
            if err == sql.ErrNoRows {
                return fmt.Errorf("源账户不存在")
            }
            return fmt.Errorf("查询源账户余额失败: %w", err)
        }
        
        if fromBalance < amount {
            return fmt.Errorf("余额不足")
        }
        
        // 2. 锁定目标账户
        var toBalance float64
        err = tx.QueryRowContext(ctx,
            "SELECT balance FROM accounts WHERE id = ? FOR UPDATE", toAccountID).Scan(&toBalance)
        if err != nil {
            if err == sql.ErrNoRows {
                return fmt.Errorf("目标账户不存在")
            }
            return fmt.Errorf("查询目标账户余额失败: %w", err)
        }
        
        // 3. 更新源账户余额
        _, err = tx.ExecContext(ctx,
            "UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, fromAccountID)
        if err != nil {
            return fmt.Errorf("更新源账户余额失败: %w", err)
        }
        
        // 4. 更新目标账户余额
        _, err = tx.ExecContext(ctx,
            "UPDATE accounts SET balance = balance + ? WHERE id = ?", amount, toAccountID)
        if err != nil {
            return fmt.Errorf("更新目标账户余额失败: %w", err)
        }
        
        // 5. 记录交易
        _, err = tx.ExecContext(ctx,
            "INSERT INTO transactions (from_account, to_account, amount, description, created_at) VALUES (?, ?, ?, ?, ?)",
            fromAccountID, toAccountID, amount, description, time.Now())
        if err != nil {
            return fmt.Errorf("记录交易失败: %w", err)
        }
        
        return nil
    })
}
```

### 隔离级别和锁
```go
// 设置事务隔离级别
func (tm *TransactionManager) ExecuteWithIsolation(ctx context.Context, isolation sql.IsolationLevel, fn func(*sql.Tx) error) error {
    tx, err := tm.db.DB.BeginTx(ctx, &sql.TxOptions{
        Isolation: isolation,
    })
    if err != nil {
        return fmt.Errorf("开始事务失败: %w", err)
    }
    
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        } else if err != nil {
            tx.Rollback()
        } else {
            err = tx.Commit()
        }
    }()
    
    err = fn(tx)
    return err
}

// 读未提交示例
func (ar *AccountRepository) GetBalanceReadUncommitted(ctx context.Context, accountID int64) (float64, error) {
    tm := NewTransactionManager(ar.db)
    var balance float64
    
    err := tm.ExecuteWithIsolation(ctx, sql.LevelReadUncommitted, func(tx *sql.Tx) error {
        return tx.QueryRowContext(ctx, "SELECT balance FROM accounts WHERE id = ?", accountID).Scan(&balance)
    })
    
    return balance, err
}

// 可重复读示例
func (ar *AccountRepository) GetConsistentBalance(ctx context.Context, accountID int64) (float64, float64, error) {
    tm := NewTransactionManager(ar.db)
    var balance1, balance2 float64
    
    err := tm.ExecuteWithIsolation(ctx, sql.LevelRepeatableRead, func(tx *sql.Tx) error {
        // 第一次读取
        err := tx.QueryRowContext(ctx, "SELECT balance FROM accounts WHERE id = ?", accountID).Scan(&balance1)
        if err != nil {
            return err
        }
        
        // 模拟一些处理时间
        time.Sleep(100 * time.Millisecond)
        
        // 第二次读取，在可重复读隔离级别下应该得到相同的值
        err = tx.QueryRowContext(ctx, "SELECT balance FROM accounts WHERE id = ?", accountID).Scan(&balance2)
        return err
    })
    
    return balance1, balance2, err
}

// 悲观锁示例
func (ar *AccountRepository) UpdateBalanceWithLock(ctx context.Context, accountID int64, amount float64) error {
    tm := NewTransactionManager(ar.db)
    
    return tm.ExecuteTransaction(ctx, func(tx *sql.Tx) error {
        // 使用SELECT ... FOR UPDATE锁定行
        var currentBalance float64
        err := tx.QueryRowContext(ctx,
            "SELECT balance FROM accounts WHERE id = ? FOR UPDATE", accountID).Scan(&currentBalance)
        if err != nil {
            return err
        }
        
        newBalance := currentBalance + amount
        if newBalance < 0 {
            return fmt.Errorf("余额不足")
        }
        
        _, err = tx.ExecContext(ctx,
            "UPDATE accounts SET balance = ? WHERE id = ?", newBalance, accountID)
        return err
    })
}

// 乐观锁示例
type AccountWithVersion struct {
    Account
    Version int64 `db:"version"`
}

func (ar *AccountRepository) UpdateBalanceWithOptimisticLock(ctx context.Context, accountID int64, amount float64) error {
    for attempt := 0; attempt < 3; attempt++ {
        // 获取当前账户信息和版本号
        var account AccountWithVersion
        err := ar.db.DB.QueryRowContext(ctx,
            "SELECT id, user_id, balance, version FROM accounts WHERE id = ?", accountID).Scan(
            &account.ID, &account.UserID, &account.Balance, &account.Version)
        if err != nil {
            return fmt.Errorf("查询账户失败: %w", err)
        }
        
        newBalance := account.Balance + amount
        if newBalance < 0 {
            return fmt.Errorf("余额不足")
        }
        
        // 尝试更新，同时检查版本号
        result, err := ar.db.DB.ExecContext(ctx,
            "UPDATE accounts SET balance = ?, version = version + 1 WHERE id = ? AND version = ?",
            newBalance, accountID, account.Version)
        if err != nil {
            return fmt.Errorf("更新账户失败: %w", err)
        }
        
        rowsAffected, err := result.RowsAffected()
        if err != nil {
            return fmt.Errorf("获取影响行数失败: %w", err)
        }
        
        if rowsAffected == 1 {
            return nil // 更新成功
        }
        
        // 版本冲突，重试
        log.Printf("乐观锁冲突，重试第 %d 次", attempt+1)
        time.Sleep(time.Duration(attempt+1) * 10 * time.Millisecond)
    }
    
    return fmt.Errorf("乐观锁更新失败，已重试3次")
}
```

## 4. 预处理语句和安全性

### 预处理语句
```go
// 预处理语句管理器
type PreparedStatementManager struct {
    db         *Database
    statements map[string]*sql.Stmt
    mutex      sync.RWMutex
}

func NewPreparedStatementManager(db *Database) *PreparedStatementManager {
    return &PreparedStatementManager{
        db:         db,
        statements: make(map[string]*sql.Stmt),
    }
}

func (psm *PreparedStatementManager) Prepare(name, query string) error {
    psm.mutex.Lock()
    defer psm.mutex.Unlock()
    
    stmt, err := psm.db.DB.Prepare(query)
    if err != nil {
        return fmt.Errorf("预处理语句失败 [%s]: %w", name, err)
    }
    
    // 如果已存在同名语句，先关闭旧的
    if oldStmt, exists := psm.statements[name]; exists {
        oldStmt.Close()
    }
    
    psm.statements[name] = stmt
    return nil
}

func (psm *PreparedStatementManager) Get(name string) (*sql.Stmt, bool) {
    psm.mutex.RLock()
    defer psm.mutex.RUnlock()
    
    stmt, exists := psm.statements[name]
    return stmt, exists
}

func (psm *PreparedStatementManager) Close() error {
    psm.mutex.Lock()
    defer psm.mutex.Unlock()
    
    var errors []string
    for name, stmt := range psm.statements {
        if err := stmt.Close(); err != nil {
            errors = append(errors, fmt.Sprintf("%s: %v", name, err))
        }
    }
    
    if len(errors) > 0 {
        return fmt.Errorf("关闭预处理语句失败: %s", strings.Join(errors, "; "))
    }
    
    return nil
}

// 使用预处理语句的用户仓库
type OptimizedUserRepository struct {
    db  *Database
    psm *PreparedStatementManager
}

func NewOptimizedUserRepository(db *Database) (*OptimizedUserRepository, error) {
    psm := NewPreparedStatementManager(db)
    
    // 预处理常用语句
    statements := map[string]string{
        "getUserByID": `
            SELECT id, username, email, full_name, avatar, status, created_at, updated_at
            FROM users WHERE id = ?`,
        "getUserByUsername": `
            SELECT id, username, email, full_name, avatar, status, created_at, updated_at
            FROM users WHERE username = ?`,
        "createUser": `
            INSERT INTO users (username, email, password, full_name, avatar, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        "updateUser": `
            UPDATE users 
            SET username = ?, email = ?, full_name = ?, avatar = ?, updated_at = ?
            WHERE id = ?`,
        "deleteUser": `
            DELETE FROM users WHERE id = ?`,
    }
    
    for name, query := range statements {
        if err := psm.Prepare(name, query); err != nil {
            return nil, err
        }
    }
    
    return &OptimizedUserRepository{
        db:  db,
        psm: psm,
    }, nil
}

func (our *OptimizedUserRepository) GetByID(ctx context.Context, id int64) (*User, error) {
    stmt, exists := our.psm.Get("getUserByID")
    if !exists {
        return nil, fmt.Errorf("预处理语句 getUserByID 不存在")
    }
    
    user := &User{}
    err := stmt.QueryRowContext(ctx, id).Scan(
        &user.ID,
        &user.Username,
        &user.Email,
        &user.FullName,
        &user.Avatar,
        &user.Status,
        &user.CreatedAt,
        &user.UpdatedAt)
    
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil
        }
        return nil, fmt.Errorf("查询用户失败: %w", err)
    }
    
    return user, nil
}

func (our *OptimizedUserRepository) Close() error {
    return our.psm.Close()
}
```

### SQL注入防护
```go
// 安全的查询构建器
type SafeQueryBuilder struct {
    query strings.Builder
    args  []interface{}
}

func NewSafeQueryBuilder() *SafeQueryBuilder {
    return &SafeQueryBuilder{
        args: make([]interface{}, 0),
    }
}

func (sqb *SafeQueryBuilder) Select(columns ...string) *SafeQueryBuilder {
    // 验证列名（只允许字母、数字、下划线）
    for _, col := range columns {
        if !isValidIdentifier(col) {
            panic(fmt.Sprintf("无效的列名: %s", col))
        }
    }
    
    sqb.query.WriteString("SELECT ")
    sqb.query.WriteString(strings.Join(columns, ", "))
    return sqb
}

func (sqb *SafeQueryBuilder) From(table string) *SafeQueryBuilder {
    if !isValidIdentifier(table) {
        panic(fmt.Sprintf("无效的表名: %s", table))
    }
    
    sqb.query.WriteString(" FROM ")
    sqb.query.WriteString(table)
    return sqb
}

func (sqb *SafeQueryBuilder) Where(condition string, args ...interface{}) *SafeQueryBuilder {
    sqb.query.WriteString(" WHERE ")
    sqb.query.WriteString(condition)
    sqb.args = append(sqb.args, args...)
    return sqb
}

func (sqb *SafeQueryBuilder) And(condition string, args ...interface{}) *SafeQueryBuilder {
    sqb.query.WriteString(" AND ")
    sqb.query.WriteString(condition)
    sqb.args = append(sqb.args, args...)
    return sqb
}

func (sqb *SafeQueryBuilder) Or(condition string, args ...interface{}) *SafeQueryBuilder {
    sqb.query.WriteString(" OR ")
    sqb.query.WriteString(condition)
    sqb.args = append(sqb.args, args...)
    return sqb
}

func (sqb *SafeQueryBuilder) OrderBy(column, direction string) *SafeQueryBuilder {
    if !isValidIdentifier(column) {
        panic(fmt.Sprintf("无效的列名: %s", column))
    }
    
    direction = strings.ToUpper(direction)
    if direction != "ASC" && direction != "DESC" {
        panic(fmt.Sprintf("无效的排序方向: %s", direction))
    }
    
    sqb.query.WriteString(" ORDER BY ")
    sqb.query.WriteString(column)
    sqb.query.WriteString(" ")
    sqb.query.WriteString(direction)
    return sqb
}

func (sqb *SafeQueryBuilder) Limit(limit int) *SafeQueryBuilder {
    sqb.query.WriteString(" LIMIT ?")
    sqb.args = append(sqb.args, limit)
    return sqb
}

func (sqb *SafeQueryBuilder) Offset(offset int) *SafeQueryBuilder {
    sqb.query.WriteString(" OFFSET ?")
    sqb.args = append(sqb.args, offset)
    return sqb
}

func (sqb *SafeQueryBuilder) Build() (string, []interface{}) {
    return sqb.query.String(), sqb.args
}

func isValidIdentifier(identifier string) bool {
    // 验证标识符只包含字母、数字、下划线，且不以数字开头
    if len(identifier) == 0 {
        return false
    }
    
    for i, char := range identifier {
        if i == 0 {
            if !unicode.IsLetter(char) && char != '_' {
                return false
            }
        } else {
            if !unicode.IsLetter(char) && !unicode.IsDigit(char) && char != '_' {
                return false
            }
        }
    }
    
    return true
}

// 使用安全查询构建器的示例
func (ur *UserRepository) SafeSearch(ctx context.Context, searchTerm string, status UserStatus, limit, offset int) ([]*User, error) {
    query, args := NewSafeQueryBuilder().
        Select("id", "username", "email", "full_name", "avatar", "status", "created_at", "updated_at").
        From("users").
        Where("(username LIKE ? OR email LIKE ?)", "%"+searchTerm+"%", "%"+searchTerm+"%").
        And("status = ?", status).
        OrderBy("created_at", "DESC").
        Limit(limit).
        Offset(offset).
        Build()
    
    rows, err := ur.db.DB.QueryContext(ctx, query, args...)
    if err != nil {
        return nil, fmt.Errorf("安全查询失败: %w", err)
    }
    defer rows.Close()
    
    users := make([]*User, 0)
    for rows.Next() {
        user := &User{}
        err := rows.Scan(
            &user.ID,
            &user.Username,
            &user.Email,
            &user.FullName,
            &user.Avatar,
            &user.Status,
            &user.CreatedAt,
            &user.UpdatedAt)
        
        if err != nil {
            return nil, fmt.Errorf("扫描用户数据失败: %w", err)
        }
        
        users = append(users, user)
    }
    
    return users, rows.Err()
}
```

## 5. 实践练习

### 练习1：构建完整的用户管理系统
```go
// 实现一个完整的用户管理系统
type UserManagementSystem struct {
    userRepo    *UserRepository
    profileRepo *UserProfileRepository
    tm          *TransactionManager
}

func (ums *UserManagementSystem) CreateUserWithProfile(ctx context.Context, user *User, profile *UserProfile) error {
    // 实现用户和资料的事务性创建
    return nil
}

func (ums *UserManagementSystem) UpdateUserInfo(ctx context.Context, userID int64, updates map[string]interface{}) error {
    // 实现安全的用户信息更新
    return nil
}
```

### 练习2：实现数据库迁移系统
```go
// 实现数据库版本管理和迁移
type MigrationManager struct {
    db *Database
}

func (mm *MigrationManager) RunMigrations(ctx context.Context) error {
    // 实现数据库迁移逻辑
    return nil
}

func (mm *MigrationManager) CreateMigration(name string) error {
    // 创建新的迁移文件
    return nil
}
```

### 练习3：实现数据库性能监控
```go
// 实现SQL执行性能监控
type SQLMonitor struct {
    slowQueryThreshold time.Duration
}

func (sm *SQLMonitor) LogSlowQuery(query string, duration time.Duration, args []interface{}) {
    // 记录慢查询
}

func (sm *SQLMonitor) GetStats() map[string]interface{} {
    // 获取性能统计
    return nil
}
```

## 6. 参考资料

- [database/sql包文档](https://golang.org/pkg/database/sql/)
- [Go数据库最佳实践](https://golang.org/doc/database/)
- [MySQL驱动文档](https://github.com/go-sql-driver/mysql)
- [PostgreSQL驱动文档](https://github.com/lib/pq)
- [SQLite驱动文档](https://github.com/mattn/go-sqlite3)

---

通过本章的学习，你将掌握Go语言中SQL数据库操作的基础技能，能够安全、高效地进行数据库编程。