# ORM框架使用

## 学习目标
- 掌握GORM框架的基本使用
- 学习模型定义和关联关系
- 理解查询构建器和高级查询
- 掌握数据库迁移和性能优化

## 1. GORM框架入门

### 安装和基本配置
```go
// go.mod
module myapp

go 1.21

require (
    gorm.io/gorm v1.25.5
    gorm.io/driver/mysql v1.5.2
    gorm.io/driver/postgres v1.5.4
    gorm.io/driver/sqlite v1.5.4
)
```

```go
package main

import (
    "log"
    "time"
    
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
    "gorm.io/driver/mysql"
    "gorm.io/driver/postgres"
    "gorm.io/driver/sqlite"
)

// 数据库配置
type DatabaseConfig struct {
    Driver          string
    DSN             string
    MaxIdleConns    int
    MaxOpenConns    int
    ConnMaxLifetime time.Duration
    LogLevel        logger.LogLevel
}

// 初始化数据库连接
func InitDatabase(config DatabaseConfig) (*gorm.DB, error) {
    var dialector gorm.Dialector
    
    switch config.Driver {
    case "mysql":
        dialector = mysql.Open(config.DSN)
    case "postgres":
        dialector = postgres.Open(config.DSN)
    case "sqlite":
        dialector = sqlite.Open(config.DSN)
    default:
        return nil, fmt.Errorf("不支持的数据库驱动: %s", config.Driver)
    }
    
    // GORM配置
    gormConfig := &gorm.Config{
        Logger: logger.Default.LogMode(config.LogLevel),
        NamingStrategy: schema.NamingStrategy{
            TablePrefix:   "app_",
            SingularTable: false,
        },
        DisableForeignKeyConstraintWhenMigrating: true,
    }
    
    db, err := gorm.Open(dialector, gormConfig)
    if err != nil {
        return nil, fmt.Errorf("连接数据库失败: %w", err)
    }
    
    // 获取通用数据库对象sql.DB，然后使用其提供的功能
    sqlDB, err := db.DB()
    if err != nil {
        return nil, fmt.Errorf("获取数据库实例失败: %w", err)
    }
    
    // 设置连接池
    sqlDB.SetMaxIdleConns(config.MaxIdleConns)
    sqlDB.SetMaxOpenConns(config.MaxOpenConns)
    sqlDB.SetConnMaxLifetime(config.ConnMaxLifetime)
    
    return db, nil
}

// 使用示例
func databaseExample() {
    config := DatabaseConfig{
        Driver:          "mysql",
        DSN:             "user:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local",
        MaxIdleConns:    10,
        MaxOpenConns:    100,
        ConnMaxLifetime: time.Hour,
        LogLevel:        logger.Info,
    }
    
    db, err := InitDatabase(config)
    if err != nil {
        log.Fatal("数据库初始化失败:", err)
    }
    
    log.Println("数据库连接成功")
    
    // 自动迁移
    err = db.AutoMigrate(&User{}, &Post{}, &Comment{})
    if err != nil {
        log.Fatal("数据库迁移失败:", err)
    }
}
```

### 模型定义
```go
import (
    "time"
    "gorm.io/gorm"
)

// 基础模型
type BaseModel struct {
    ID        uint           `gorm:"primarykey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// 用户模型
type User struct {
    BaseModel
    Username  string    `gorm:"uniqueIndex;size:50;not null" json:"username"`
    Email     string    `gorm:"uniqueIndex;size:100;not null" json:"email"`
    Password  string    `gorm:"size:255;not null" json:"-"`
    FullName  string    `gorm:"size:100" json:"full_name"`
    Avatar    string    `gorm:"size:255" json:"avatar"`
    Status    int       `gorm:"default:1;comment:用户状态 0-禁用 1-启用" json:"status"`
    LastLogin *time.Time `json:"last_login"`
    
    // 关联关系
    Profile  UserProfile `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"profile,omitempty"`
    Posts    []Post      `gorm:"foreignKey:AuthorID" json:"posts,omitempty"`
    Comments []Comment   `gorm:"foreignKey:UserID" json:"comments,omitempty"`
}

// 用户资料模型
type UserProfile struct {
    BaseModel
    UserID    uint       `gorm:"uniqueIndex;not null" json:"user_id"`
    Bio       string     `gorm:"type:text" json:"bio"`
    Website   string     `gorm:"size:255" json:"website"`
    Location  string     `gorm:"size:100" json:"location"`
    BirthDate *time.Time `json:"birth_date"`
    
    // 反向关联
    User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

// 文章模型
type Post struct {
    BaseModel
    Title     string `gorm:"size:255;not null" json:"title"`
    Slug      string `gorm:"uniqueIndex;size:255;not null" json:"slug"`
    Content   string `gorm:"type:longtext" json:"content"`
    Summary   string `gorm:"type:text" json:"summary"`
    AuthorID  uint   `gorm:"not null;index" json:"author_id"`
    Published bool   `gorm:"default:false" json:"published"`
    ViewCount int    `gorm:"default:0" json:"view_count"`
    
    // 关联关系
    Author   User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"author,omitempty"`
    Comments []Comment `gorm:"foreignKey:PostID" json:"comments,omitempty"`
    Tags     []Tag     `gorm:"many2many:post_tags;" json:"tags,omitempty"`
}

// 评论模型
type Comment struct {
    BaseModel
    PostID   uint   `gorm:"not null;index" json:"post_id"`
    UserID   uint   `gorm:"not null;index" json:"user_id"`
    ParentID *uint  `gorm:"index" json:"parent_id"`
    Content  string `gorm:"type:text;not null" json:"content"`
    Status   int    `gorm:"default:1;comment:评论状态 0-隐藏 1-显示" json:"status"`
    
    // 关联关系
    Post     Post      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"post,omitempty"`
    User     User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
    Parent   *Comment  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
    Children []Comment `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// 标签模型
type Tag struct {
    BaseModel
    Name        string `gorm:"uniqueIndex;size:50;not null" json:"name"`
    Slug        string `gorm:"uniqueIndex;size:50;not null" json:"slug"`
    Description string `gorm:"type:text" json:"description"`
    Color       string `gorm:"size:7;default:#007bff" json:"color"`
    
    // 多对多关联
    Posts []Post `gorm:"many2many:post_tags;" json:"posts,omitempty"`
}

// 自定义表名
func (User) TableName() string {
    return "users"
}

func (UserProfile) TableName() string {
    return "user_profiles"
}

// 模型钩子方法
func (u *User) BeforeCreate(tx *gorm.DB) error {
    // 创建前的验证或处理
    if u.Username == "" {
        return fmt.Errorf("用户名不能为空")
    }
    return nil
}

func (u *User) AfterCreate(tx *gorm.DB) error {
    // 创建后的处理，如发送欢迎邮件
    log.Printf("用户 %s 创建成功", u.Username)
    return nil
}

func (p *Post) BeforeSave(tx *gorm.DB) error {
    // 保存前生成slug
    if p.Slug == "" {
        p.Slug = generateSlug(p.Title)
    }
    return nil
}

func generateSlug(title string) string {
    // 简化的slug生成逻辑
    slug := strings.ToLower(title)
    slug = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(slug, "-")
    return strings.Trim(slug, "-")
}
```

## 2. 基本CRUD操作

### 创建记录
```go
// 用户仓库
type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
    return &UserRepository{db: db}
}

// 创建单个用户
func (ur *UserRepository) Create(user *User) error {
    result := ur.db.Create(user)
    if result.Error != nil {
        return fmt.Errorf("创建用户失败: %w", result.Error)
    }
    
    log.Printf("创建用户成功，ID: %d, 影响行数: %d", user.ID, result.RowsAffected)
    return nil
}

// 批量创建用户
func (ur *UserRepository) CreateBatch(users []*User) error {
    if len(users) == 0 {
        return nil
    }
    
    result := ur.db.CreateInBatches(users, 100) // 每批100条
    if result.Error != nil {
        return fmt.Errorf("批量创建用户失败: %w", result.Error)
    }
    
    log.Printf("批量创建用户成功，影响行数: %d", result.RowsAffected)
    return nil
}

// 使用Map创建
func (ur *UserRepository) CreateFromMap(userData map[string]interface{}) error {
    result := ur.db.Model(&User{}).Create(userData)
    if result.Error != nil {
        return fmt.Errorf("从Map创建用户失败: %w", result.Error)
    }
    return nil
}

// 创建用户并关联资料
func (ur *UserRepository) CreateWithProfile(user *User, profile *UserProfile) error {
    return ur.db.Transaction(func(tx *gorm.DB) error {
        // 创建用户
        if err := tx.Create(user).Error; err != nil {
            return err
        }
        
        // 设置关联ID
        profile.UserID = user.ID
        
        // 创建资料
        if err := tx.Create(profile).Error; err != nil {
            return err
        }
        
        return nil
    })
}

// 使用FirstOrCreate - 如果不存在则创建
func (ur *UserRepository) FirstOrCreate(username, email string) (*User, error) {
    user := &User{}
    result := ur.db.Where("username = ? OR email = ?", username, email).FirstOrCreate(user, User{
        Username: username,
        Email:    email,
        Status:   1,
    })
    
    if result.Error != nil {
        return nil, fmt.Errorf("FirstOrCreate失败: %w", result.Error)
    }
    
    return user, nil
}
```

### 查询记录
```go
// 根据ID查询
func (ur *UserRepository) GetByID(id uint) (*User, error) {
    var user User
    result := ur.db.First(&user, id)
    
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 记录不存在
        }
        return nil, fmt.Errorf("查询用户失败: %w", result.Error)
    }
    
    return &user, nil
}

// 根据用户名查询
func (ur *UserRepository) GetByUsername(username string) (*User, error) {
    var user User
    result := ur.db.Where("username = ?", username).First(&user)
    
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, fmt.Errorf("查询用户失败: %w", result.Error)
    }
    
    return &user, nil
}

// 查询多个用户
func (ur *UserRepository) GetByIDs(ids []uint) ([]User, error) {
    var users []User
    result := ur.db.Where("id IN ?", ids).Find(&users)
    
    if result.Error != nil {
        return nil, fmt.Errorf("批量查询用户失败: %w", result.Error)
    }
    
    return users, nil
}

// 分页查询
type PaginationParams struct {
    Page     int
    PageSize int
    Search   string
    Status   *int
    SortBy   string
    SortDesc bool
}

type PaginationResult struct {
    Data       interface{} `json:"data"`
    Total      int64       `json:"total"`
    Page       int         `json:"page"`
    PageSize   int         `json:"page_size"`
    TotalPages int64       `json:"total_pages"`
}

func (ur *UserRepository) GetUsers(params PaginationParams) (*PaginationResult, error) {
    query := ur.db.Model(&User{})
    
    // 搜索条件
    if params.Search != "" {
        searchPattern := "%" + params.Search + "%"
        query = query.Where("username LIKE ? OR email LIKE ? OR full_name LIKE ?", 
                           searchPattern, searchPattern, searchPattern)
    }
    
    // 状态过滤
    if params.Status != nil {
        query = query.Where("status = ?", *params.Status)
    }
    
    // 获取总数
    var total int64
    if err := query.Count(&total).Error; err != nil {
        return nil, fmt.Errorf("查询用户总数失败: %w", err)
    }
    
    // 排序
    orderBy := "created_at"
    if params.SortBy != "" {
        orderBy = params.SortBy
    }
    if params.SortDesc {
        orderBy += " DESC"
    } else {
        orderBy += " ASC"
    }
    
    // 分页查询
    var users []User
    offset := (params.Page - 1) * params.PageSize
    result := query.Order(orderBy).Offset(offset).Limit(params.PageSize).Find(&users)
    
    if result.Error != nil {
        return nil, fmt.Errorf("分页查询用户失败: %w", result.Error)
    }
    
    totalPages := (total + int64(params.PageSize) - 1) / int64(params.PageSize)
    
    return &PaginationResult{
        Data:       users,
        Total:      total,
        Page:       params.Page,
        PageSize:   params.PageSize,
        TotalPages: totalPages,
    }, nil
}

// 预加载关联数据
func (ur *UserRepository) GetUserWithProfile(id uint) (*User, error) {
    var user User
    result := ur.db.Preload("Profile").First(&user, id)
    
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, fmt.Errorf("查询用户失败: %w", result.Error)
    }
    
    return &user, nil
}

// 复杂预加载
func (ur *UserRepository) GetUserWithPosts(id uint) (*User, error) {
    var user User
    result := ur.db.Preload("Posts", func(db *gorm.DB) *gorm.DB {
        return db.Order("created_at DESC").Limit(10) // 只加载最新10篇文章
    }).Preload("Posts.Tags").First(&user, id)
    
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, fmt.Errorf("查询用户失败: %w", result.Error)
    }
    
    return &user, nil
}

// 使用Join查询
func (ur *UserRepository) GetActiveUsersWithProfile() ([]User, error) {
    var users []User
    result := ur.db.Joins("Profile").Where("users.status = ?", 1).Find(&users)
    
    if result.Error != nil {
        return nil, fmt.Errorf("Join查询失败: %w", result.Error)
    }
    
    return users, nil
}

// 原生SQL查询
func (ur *UserRepository) GetUserStats() (map[string]interface{}, error) {
    var stats struct {
        TotalUsers   int64 `json:"total_users"`
        ActiveUsers  int64 `json:"active_users"`
        NewUsersToday int64 `json:"new_users_today"`
    }
    
    // 总用户数
    ur.db.Model(&User{}).Count(&stats.TotalUsers)
    
    // 活跃用户数
    ur.db.Model(&User{}).Where("status = ?", 1).Count(&stats.ActiveUsers)
    
    // 今天新用户数
    today := time.Now().Format("2006-01-02")
    ur.db.Model(&User{}).Where("DATE(created_at) = ?", today).Count(&stats.NewUsersToday)
    
    return map[string]interface{}{
        "total_users":     stats.TotalUsers,
        "active_users":    stats.ActiveUsers,
        "new_users_today": stats.NewUsersToday,
    }, nil
}
```

### 更新记录
```go
// 更新单个字段
func (ur *UserRepository) UpdateStatus(id uint, status int) error {
    result := ur.db.Model(&User{}).Where("id = ?", id).Update("status", status)
    
    if result.Error != nil {
        return fmt.Errorf("更新用户状态失败: %w", result.Error)
    }
    
    if result.RowsAffected == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 更新多个字段
func (ur *UserRepository) UpdateUser(id uint, updates map[string]interface{}) error {
    result := ur.db.Model(&User{}).Where("id = ?", id).Updates(updates)
    
    if result.Error != nil {
        return fmt.Errorf("更新用户失败: %w", result.Error)
    }
    
    if result.RowsAffected == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 使用结构体更新
func (ur *UserRepository) UpdateUserStruct(user *User) error {
    result := ur.db.Save(user) // Save会更新所有字段，包括零值
    
    if result.Error != nil {
        return fmt.Errorf("保存用户失败: %w", result.Error)
    }
    
    return nil
}

// 选择性更新（排除零值）
func (ur *UserRepository) UpdateUserSelective(user *User) error {
    result := ur.db.Model(user).Updates(user) // Updates会忽略零值
    
    if result.Error != nil {
        return fmt.Errorf("选择性更新用户失败: %w", result.Error)
    }
    
    return nil
}

// 批量更新
func (ur *UserRepository) UpdateUsersBatch(condition string, updates map[string]interface{}) error {
    result := ur.db.Model(&User{}).Where(condition).Updates(updates)
    
    if result.Error != nil {
        return fmt.Errorf("批量更新用户失败: %w", result.Error)
    }
    
    log.Printf("批量更新用户，影响行数: %d", result.RowsAffected)
    return nil
}

// 使用原生SQL更新
func (ur *UserRepository) UpdateLastLogin(id uint) error {
    result := ur.db.Exec("UPDATE users SET last_login = ? WHERE id = ?", time.Now(), id)
    
    if result.Error != nil {
        return fmt.Errorf("更新最后登录时间失败: %w", result.Error)
    }
    
    return nil
}

// 更新或创建 (Upsert)
func (ur *UserRepository) Upsert(user *User) error {
    result := ur.db.Save(user)
    
    if result.Error != nil {
        return fmt.Errorf("Upsert用户失败: %w", result.Error)
    }
    
    return nil
}

// 增量更新
func (ur *UserRepository) IncrementViewCount(postID uint, increment int) error {
    result := ur.db.Model(&Post{}).Where("id = ?", postID).UpdateColumn("view_count", gorm.Expr("view_count + ?", increment))
    
    if result.Error != nil {
        return fmt.Errorf("增量更新浏览次数失败: %w", result.Error)
    }
    
    return nil
}
```

### 删除记录
```go
// 软删除（推荐）
func (ur *UserRepository) SoftDelete(id uint) error {
    result := ur.db.Delete(&User{}, id)
    
    if result.Error != nil {
        return fmt.Errorf("软删除用户失败: %w", result.Error)
    }
    
    if result.RowsAffected == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 永久删除
func (ur *UserRepository) HardDelete(id uint) error {
    result := ur.db.Unscoped().Delete(&User{}, id)
    
    if result.Error != nil {
        return fmt.Errorf("永久删除用户失败: %w", result.Error)
    }
    
    if result.RowsAffected == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 批量删除
func (ur *UserRepository) BatchDelete(ids []uint) error {
    result := ur.db.Delete(&User{}, ids)
    
    if result.Error != nil {
        return fmt.Errorf("批量删除用户失败: %w", result.Error)
    }
    
    log.Printf("批量删除用户，影响行数: %d", result.RowsAffected)
    return nil
}

// 根据条件删除
func (ur *UserRepository) DeleteInactive(days int) error {
    cutoff := time.Now().AddDate(0, 0, -days)
    result := ur.db.Where("status = ? AND last_login < ?", 0, cutoff).Delete(&User{})
    
    if result.Error != nil {
        return fmt.Errorf("删除非活跃用户失败: %w", result.Error)
    }
    
    log.Printf("删除非活跃用户，影响行数: %d", result.RowsAffected)
    return nil
}

// 恢复软删除的记录
func (ur *UserRepository) RestoreUser(id uint) error {
    result := ur.db.Unscoped().Model(&User{}).Where("id = ?", id).Update("deleted_at", nil)
    
    if result.Error != nil {
        return fmt.Errorf("恢复用户失败: %w", result.Error)
    }
    
    if result.RowsAffected == 0 {
        return fmt.Errorf("用户不存在或未被删除")
    }
    
    return nil
}
```

## 3. 高级查询功能

### 复杂查询构建
```go
// 高级查询构建器
type UserQueryBuilder struct {
    db *gorm.DB
}

func NewUserQueryBuilder(db *gorm.DB) *UserQueryBuilder {
    return &UserQueryBuilder{db: db}
}

func (uqb *UserQueryBuilder) Query() *gorm.DB {
    return uqb.db.Model(&User{})
}

// 链式查询方法
func (uqb *UserQueryBuilder) WithStatus(status int) *UserQueryBuilder {
    uqb.db = uqb.db.Where("status = ?", status)
    return uqb
}

func (uqb *UserQueryBuilder) WithEmailLike(email string) *UserQueryBuilder {
    uqb.db = uqb.db.Where("email LIKE ?", "%"+email+"%")
    return uqb
}

func (uqb *UserQueryBuilder) CreatedAfter(date time.Time) *UserQueryBuilder {
    uqb.db = uqb.db.Where("created_at > ?", date)
    return uqb
}

func (uqb *UserQueryBuilder) CreatedBefore(date time.Time) *UserQueryBuilder {
    uqb.db = uqb.db.Where("created_at < ?", date)
    return uqb
}

func (uqb *UserQueryBuilder) WithProfile() *UserQueryBuilder {
    uqb.db = uqb.db.Preload("Profile")
    return uqb
}

func (uqb *UserQueryBuilder) WithPosts(limit int) *UserQueryBuilder {
    uqb.db = uqb.db.Preload("Posts", func(db *gorm.DB) *gorm.DB {
        return db.Order("created_at DESC").Limit(limit)
    })
    return uqb
}

func (uqb *UserQueryBuilder) OrderByCreated(desc bool) *UserQueryBuilder {
    if desc {
        uqb.db = uqb.db.Order("created_at DESC")
    } else {
        uqb.db = uqb.db.Order("created_at ASC")
    }
    return uqb
}

func (uqb *UserQueryBuilder) Paginate(page, pageSize int) *UserQueryBuilder {
    offset := (page - 1) * pageSize
    uqb.db = uqb.db.Offset(offset).Limit(pageSize)
    return uqb
}

func (uqb *UserQueryBuilder) Find() ([]User, error) {
    var users []User
    result := uqb.db.Find(&users)
    return users, result.Error
}

func (uqb *UserQueryBuilder) First() (*User, error) {
    var user User
    result := uqb.db.First(&user)
    if errors.Is(result.Error, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    return &user, result.Error
}

func (uqb *UserQueryBuilder) Count() (int64, error) {
    var count int64
    result := uqb.db.Count(&count)
    return count, result.Error
}

// 使用查询构建器
func (ur *UserRepository) GetActiveUsersWithPosts(page, pageSize int) ([]User, error) {
    builder := NewUserQueryBuilder(ur.db)
    return builder.
        WithStatus(1).
        WithPosts(5).
        OrderByCreated(true).
        Paginate(page, pageSize).
        Find()
}

// 子查询
func (ur *UserRepository) GetUsersWithRecentPosts(days int) ([]User, error) {
    subQuery := ur.db.Model(&Post{}).
        Select("DISTINCT author_id").
        Where("created_at > ?", time.Now().AddDate(0, 0, -days))
    
    var users []User
    result := ur.db.Where("id IN (?)", subQuery).Find(&users)
    return users, result.Error
}

// 聚合查询
func (ur *UserRepository) GetUserPostStats() ([]map[string]interface{}, error) {
    var results []map[string]interface{}
    
    result := ur.db.Model(&User{}).
        Select("users.id, users.username, COUNT(posts.id) as post_count").
        Joins("LEFT JOIN posts ON posts.author_id = users.id").
        Group("users.id, users.username").
        Having("COUNT(posts.id) > ?", 0).
        Order("post_count DESC").
        Scan(&results)
    
    return results, result.Error
}

// 原生SQL查询
func (ur *UserRepository) GetComplexStats() ([]map[string]interface{}, error) {
    var results []map[string]interface{}
    
    sql := `
        SELECT 
            u.id,
            u.username,
            u.email,
            COUNT(DISTINCT p.id) as post_count,
            COUNT(DISTINCT c.id) as comment_count,
            MAX(p.created_at) as last_post_date
        FROM users u
        LEFT JOIN posts p ON p.author_id = u.id
        LEFT JOIN comments c ON c.user_id = u.id
        WHERE u.status = ?
        GROUP BY u.id, u.username, u.email
        HAVING post_count > 0 OR comment_count > 0
        ORDER BY post_count DESC, comment_count DESC
        LIMIT ?
    `
    
    result := ur.db.Raw(sql, 1, 20).Scan(&results)
    return results, result.Error
}
```

### 事务处理
```go
// 基本事务
func (ur *UserRepository) CreateUserWithProfile(user *User, profile *UserProfile) error {
    return ur.db.Transaction(func(tx *gorm.DB) error {
        // 创建用户
        if err := tx.Create(user).Error; err != nil {
            return err
        }
        
        // 设置关联ID
        profile.UserID = user.ID
        
        // 创建资料
        if err := tx.Create(profile).Error; err != nil {
            return err
        }
        
        return nil
    })
}

// 手动事务控制
func (ur *UserRepository) ComplexTransaction() error {
    tx := ur.db.Begin()
    
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    
    if tx.Error != nil {
        return tx.Error
    }
    
    // 执行多个操作
    if err := tx.Create(&User{Username: "user1", Email: "user1@example.com"}).Error; err != nil {
        tx.Rollback()
        return err
    }
    
    if err := tx.Create(&User{Username: "user2", Email: "user2@example.com"}).Error; err != nil {
        tx.Rollback()
        return err
    }
    
    // 提交事务
    return tx.Commit().Error
}

// 嵌套事务
func (ur *UserRepository) NestedTransaction() error {
    return ur.db.Transaction(func(tx *gorm.DB) error {
        // 外层事务操作
        if err := tx.Create(&User{Username: "outer", Email: "outer@example.com"}).Error; err != nil {
            return err
        }
        
        // 嵌套事务
        return tx.Transaction(func(tx2 *gorm.DB) error {
            // 内层事务操作
            return tx2.Create(&User{Username: "inner", Email: "inner@example.com"}).Error
        })
    })
}

// 保存点
func (ur *UserRepository) SavepointTransaction() error {
    tx := ur.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    
    // 第一个操作
    if err := tx.Create(&User{Username: "user1", Email: "user1@example.com"}).Error; err != nil {
        tx.Rollback()
        return err
    }
    
    // 创建保存点
    if err := tx.SavePoint("sp1").Error; err != nil {
        tx.Rollback()
        return err
    }
    
    // 第二个操作（可能失败）
    if err := tx.Create(&User{Username: "user2", Email: "invalid-email"}).Error; err != nil {
        // 回滚到保存点
        if rollbackErr := tx.RollbackTo("sp1").Error; rollbackErr != nil {
            tx.Rollback()
            return rollbackErr
        }
        
        // 继续其他操作
        if err := tx.Create(&User{Username: "user3", Email: "user3@example.com"}).Error; err != nil {
            tx.Rollback()
            return err
        }
    }
    
    return tx.Commit().Error
}
```

## 4. 数据库迁移

### 自动迁移
```go
// 自动迁移管理器
type MigrationManager struct {
    db *gorm.DB
}

func NewMigrationManager(db *gorm.DB) *MigrationManager {
    return &MigrationManager{db: db}
}

// 执行自动迁移
func (mm *MigrationManager) AutoMigrate() error {
    // 按依赖顺序迁移
    models := []interface{}{
        &User{},
        &UserProfile{},
        &Tag{},
        &Post{},
        &Comment{},
    }
    
    for _, model := range models {
        if err := mm.db.AutoMigrate(model); err != nil {
            return fmt.Errorf("自动迁移失败 %T: %w", model, err)
        }
        log.Printf("模型 %T 迁移完成", model)
    }
    
    return nil
}

// 创建索引
func (mm *MigrationManager) CreateIndexes() error {
    indexes := []struct {
        table string
        name  string
        sql   string
    }{
        {
            table: "users",
            name:  "idx_users_email_status",
            sql:   "CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status)",
        },
        {
            table: "posts",
            name:  "idx_posts_author_published",
            sql:   "CREATE INDEX IF NOT EXISTS idx_posts_author_published ON posts(author_id, published)",
        },
        {
            table: "posts",
            name:  "idx_posts_created_at",
            sql:   "CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)",
        },
        {
            table: "comments",
            name:  "idx_comments_post_user",
            sql:   "CREATE INDEX IF NOT EXISTS idx_comments_post_user ON comments(post_id, user_id)",
        },
    }
    
    for _, idx := range indexes {
        if err := mm.db.Exec(idx.sql).Error; err != nil {
            return fmt.Errorf("创建索引失败 %s: %w", idx.name, err)
        }
        log.Printf("索引 %s 创建完成", idx.name)
    }
    
    return nil
}

// 检查表结构
func (mm *MigrationManager) CheckSchema() error {
    // 检查表是否存在
    tables := []string{"users", "user_profiles", "posts", "comments", "tags", "post_tags"}
    
    for _, table := range tables {
        if !mm.db.Migrator().HasTable(table) {
            return fmt.Errorf("表 %s 不存在", table)
        }
    }
    
    // 检查列是否存在
    columnChecks := []struct {
        table  string
        column string
    }{
        {"users", "username"},
        {"users", "email"},
        {"posts", "title"},
        {"posts", "content"},
        {"comments", "content"},
    }
    
    for _, check := range columnChecks {
        if !mm.db.Migrator().HasColumn(check.table, check.column) {
            return fmt.Errorf("表 %s 中列 %s 不存在", check.table, check.column)
        }
    }
    
    log.Println("数据库模式检查通过")
    return nil
}

// 添加列
func (mm *MigrationManager) AddColumn(tableName, columnName, columnType string) error {
    if mm.db.Migrator().HasColumn(tableName, columnName) {
        log.Printf("列 %s.%s 已存在，跳过", tableName, columnName)
        return nil
    }
    
    sql := fmt.Sprintf("ALTER TABLE %s ADD COLUMN %s %s", tableName, columnName, columnType)
    if err := mm.db.Exec(sql).Error; err != nil {
        return fmt.Errorf("添加列失败: %w", err)
    }
    
    log.Printf("列 %s.%s 添加成功", tableName, columnName)
    return nil
}

// 删除列
func (mm *MigrationManager) DropColumn(tableName, columnName string) error {
    if !mm.db.Migrator().HasColumn(tableName, columnName) {
        log.Printf("列 %s.%s 不存在，跳过", tableName, columnName)
        return nil
    }
    
    if err := mm.db.Migrator().DropColumn(tableName, columnName); err != nil {
        return fmt.Errorf("删除列失败: %w", err)
    }
    
    log.Printf("列 %s.%s 删除成功", tableName, columnName)
    return nil
}

// 修改列
func (mm *MigrationManager) AlterColumn(tableName, columnName, newType string) error {
    sql := fmt.Sprintf("ALTER TABLE %s MODIFY COLUMN %s %s", tableName, columnName, newType)
    if err := mm.db.Exec(sql).Error; err != nil {
        return fmt.Errorf("修改列失败: %w", err)
    }
    
    log.Printf("列 %s.%s 修改成功", tableName, columnName)
    return nil
}
```

### 版本控制迁移
```go
// 迁移记录
type Migration struct {
    ID        uint      `gorm:"primarykey"`
    Version   string    `gorm:"uniqueIndex;size:50"`
    Name      string    `gorm:"size:255"`
    Applied   bool      `gorm:"default:false"`
    AppliedAt *time.Time
    CreatedAt time.Time
}

// 迁移项
type MigrationItem struct {
    Version string
    Name    string
    Up      func(*gorm.DB) error
    Down    func(*gorm.DB) error
}

// 版本迁移管理器
type VersionedMigrationManager struct {
    db         *gorm.DB
    migrations []MigrationItem
}

func NewVersionedMigrationManager(db *gorm.DB) *VersionedMigrationManager {
    return &VersionedMigrationManager{
        db:         db,
        migrations: make([]MigrationItem, 0),
    }
}

// 注册迁移
func (vmm *VersionedMigrationManager) Register(migration MigrationItem) {
    vmm.migrations = append(vmm.migrations, migration)
}

// 初始化迁移表
func (vmm *VersionedMigrationManager) Init() error {
    return vmm.db.AutoMigrate(&Migration{})
}

// 执行迁移
func (vmm *VersionedMigrationManager) Migrate() error {
    // 按版本排序
    sort.Slice(vmm.migrations, func(i, j int) bool {
        return vmm.migrations[i].Version < vmm.migrations[j].Version
    })
    
    for _, migration := range vmm.migrations {
        // 检查是否已执行
        var existing Migration
        result := vmm.db.Where("version = ?", migration.Version).First(&existing)
        
        if result.Error == nil && existing.Applied {
            log.Printf("迁移 %s 已执行，跳过", migration.Version)
            continue
        }
        
        // 执行迁移
        log.Printf("执行迁移 %s: %s", migration.Version, migration.Name)
        
        err := vmm.db.Transaction(func(tx *gorm.DB) error {
            // 执行迁移脚本
            if err := migration.Up(tx); err != nil {
                return err
            }
            
            // 记录迁移
            now := time.Now()
            migrationRecord := Migration{
                Version:   migration.Version,
                Name:      migration.Name,
                Applied:   true,
                AppliedAt: &now,
            }
            
            if result.Error != nil {
                // 新建记录
                return tx.Create(&migrationRecord).Error
            } else {
                // 更新记录
                return tx.Model(&existing).Updates(migrationRecord).Error
            }
        })
        
        if err != nil {
            return fmt.Errorf("迁移 %s 执行失败: %w", migration.Version, err)
        }
        
        log.Printf("迁移 %s 执行成功", migration.Version)
    }
    
    return nil
}

// 回滚迁移
func (vmm *VersionedMigrationManager) Rollback(targetVersion string) error {
    // 获取已应用的迁移
    var appliedMigrations []Migration
    err := vmm.db.Where("applied = ? AND version > ?", true, targetVersion).
        Order("version DESC").Find(&appliedMigrations).Error
    if err != nil {
        return fmt.Errorf("查询已应用迁移失败: %w", err)
    }
    
    // 按版本倒序回滚
    for _, applied := range appliedMigrations {
        // 查找对应的迁移脚本
        var migration *MigrationItem
        for _, m := range vmm.migrations {
            if m.Version == applied.Version {
                migration = &m
                break
            }
        }
        
        if migration == nil {
            return fmt.Errorf("找不到迁移脚本: %s", applied.Version)
        }
        
        log.Printf("回滚迁移 %s: %s", migration.Version, migration.Name)
        
        err := vmm.db.Transaction(func(tx *gorm.DB) error {
            // 执行回滚脚本
            if err := migration.Down(tx); err != nil {
                return err
            }
            
            // 更新迁移记录
            return tx.Model(&applied).Update("applied", false).Error
        })
        
        if err != nil {
            return fmt.Errorf("回滚迁移 %s 失败: %w", migration.Version, err)
        }
        
        log.Printf("迁移 %s 回滚成功", migration.Version)
    }
    
    return nil
}

// 迁移示例
func registerMigrations(vmm *VersionedMigrationManager) {
    // v1.0.0: 初始表结构
    vmm.Register(MigrationItem{
        Version: "1.0.0",
        Name:    "创建初始表结构",
        Up: func(db *gorm.DB) error {
            return db.AutoMigrate(&User{}, &UserProfile{}, &Post{}, &Comment{}, &Tag{})
        },
        Down: func(db *gorm.DB) error {
            return db.Migrator().DropTable(&Tag{}, &Comment{}, &Post{}, &UserProfile{}, &User{})
        },
    })
    
    // v1.1.0: 添加用户头像字段
    vmm.Register(MigrationItem{
        Version: "1.1.0",
        Name:    "添加用户头像字段",
        Up: func(db *gorm.DB) error {
            return db.Exec("ALTER TABLE users ADD COLUMN avatar VARCHAR(255)").Error
        },
        Down: func(db *gorm.DB) error {
            return db.Migrator().DropColumn(&User{}, "avatar")
        },
    })
    
    // v1.2.0: 添加文章浏览次数
    vmm.Register(MigrationItem{
        Version: "1.2.0",
        Name:    "添加文章浏览次数",
        Up: func(db *gorm.DB) error {
            return db.Exec("ALTER TABLE posts ADD COLUMN view_count INT DEFAULT 0").Error
        },
        Down: func(db *gorm.DB) error {
            return db.Migrator().DropColumn(&Post{}, "view_count")
        },
    })
}
```

## 5. 性能优化

### 查询优化
```go
// 查询性能监控
type QueryMonitor struct {
    slowQueryThreshold time.Duration
    logger            *log.Logger
}

func NewQueryMonitor(threshold time.Duration) *QueryMonitor {
    return &QueryMonitor{
        slowQueryThreshold: threshold,
        logger:            log.New(os.Stdout, "[SLOW_QUERY] ", log.LstdFlags),
    }
}

// 慢查询记录器
func (qm *QueryMonitor) LogSlowQuery(sql string, duration time.Duration, rows int64) {
    if duration > qm.slowQueryThreshold {
        qm.logger.Printf("慢查询: %v | 行数: %d | SQL: %s", duration, rows, sql)
    }
}

// 优化的仓库基类
type OptimizedRepository struct {
    db      *gorm.DB
    monitor *QueryMonitor
}

func NewOptimizedRepository(db *gorm.DB, monitor *QueryMonitor) *OptimizedRepository {
    return &OptimizedRepository{
        db:      db,
        monitor: monitor,
    }
}

// 带监控的查询执行
func (or *OptimizedRepository) ExecuteQuery(fn func(*gorm.DB) *gorm.DB) *gorm.DB {
    start := time.Now()
    result := fn(or.db)
    duration := time.Since(start)
    
    // 记录慢查询
    or.monitor.LogSlowQuery(result.Statement.SQL.String(), duration, result.RowsAffected)
    
    return result
}

// 批量加载优化
func (ur *UserRepository) GetUsersWithPostsOptimized(userIDs []uint) ([]User, error) {
    var users []User
    
    // 先加载用户
    if err := ur.db.Where("id IN ?", userIDs).Find(&users).Error; err != nil {
        return nil, err
    }
    
    if len(users) == 0 {
        return users, nil
    }
    
    // 批量加载文章
    var posts []Post
    if err := ur.db.Where("author_id IN ?", userIDs).Find(&posts).Error; err != nil {
        return nil, err
    }
    
    // 手动关联
    postMap := make(map[uint][]Post)
    for _, post := range posts {
        postMap[post.AuthorID] = append(postMap[post.AuthorID], post)
    }
    
    for i := range users {
        users[i].Posts = postMap[users[i].ID]
    }
    
    return users, nil
}

// 分页优化
func (ur *UserRepository) GetUsersOptimizedPaging(page, pageSize int) (*PaginationResult, error) {
    // 使用子查询优化大偏移量的分页
    if page > 100 { // 大偏移量时使用游标分页
        return ur.getCursorBasedPaging(page, pageSize)
    }
    
    // 正常分页
    return ur.getOffsetBasedPaging(page, pageSize)
}

func (ur *UserRepository) getCursorBasedPaging(page, pageSize int) (*PaginationResult, error) {
    // 计算最小ID
    offset := (page - 1) * pageSize
    var minID uint
    
    subQuery := ur.db.Model(&User{}).
        Select("id").
        Order("id").
        Offset(offset).
        Limit(1)
    
    if err := subQuery.Scan(&minID).Error; err != nil {
        return nil, err
    }
    
    // 基于ID的查询
    var users []User
    if err := ur.db.Where("id >= ?", minID).
        Order("id").
        Limit(pageSize).
        Find(&users).Error; err != nil {
        return nil, err
    }
    
    // 获取总数（可以缓存）
    var total int64
    ur.db.Model(&User{}).Count(&total)
    
    return &PaginationResult{
        Data:       users,
        Total:      total,
        Page:       page,
        PageSize:   pageSize,
        TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
    }, nil
}

func (ur *UserRepository) getOffsetBasedPaging(page, pageSize int) (*PaginationResult, error) {
    var users []User
    var total int64
    
    offset := (page - 1) * pageSize
    
    // 并行执行计数和查询
    var wg sync.WaitGroup
    var countErr, queryErr error
    
    wg.Add(2)
    
    // 计数
    go func() {
        defer wg.Done()
        countErr = ur.db.Model(&User{}).Count(&total).Error
    }()
    
    // 查询数据
    go func() {
        defer wg.Done()
        queryErr = ur.db.Offset(offset).Limit(pageSize).Find(&users).Error
    }()
    
    wg.Wait()
    
    if countErr != nil {
        return nil, countErr
    }
    if queryErr != nil {
        return nil, queryErr
    }
    
    return &PaginationResult{
        Data:       users,
        Total:      total,
        Page:       page,
        PageSize:   pageSize,
        TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
    }, nil
}

// 缓存层
type CachedUserRepository struct {
    repo  *UserRepository
    cache map[string]interface{}
    mutex sync.RWMutex
    ttl   time.Duration
}

func NewCachedUserRepository(repo *UserRepository, ttl time.Duration) *CachedUserRepository {
    return &CachedUserRepository{
        repo:  repo,
        cache: make(map[string]interface{}),
        ttl:   ttl,
    }
}

type cacheItem struct {
    data    interface{}
    expires time.Time
}

func (cur *CachedUserRepository) GetByID(id uint) (*User, error) {
    key := fmt.Sprintf("user:%d", id)
    
    // 尝试从缓存获取
    cur.mutex.RLock()
    if item, exists := cur.cache[key]; exists {
        cached := item.(cacheItem)
        if time.Now().Before(cached.expires) {
            cur.mutex.RUnlock()
            return cached.data.(*User), nil
        }
    }
    cur.mutex.RUnlock()
    
    // 从数据库获取
    user, err := cur.repo.GetByID(id)
    if err != nil {
        return nil, err
    }
    
    if user != nil {
        // 存入缓存
        cur.mutex.Lock()
        cur.cache[key] = cacheItem{
            data:    user,
            expires: time.Now().Add(cur.ttl),
        }
        cur.mutex.Unlock()
    }
    
    return user, nil
}

// 清理过期缓存
func (cur *CachedUserRepository) StartCacheCleanup() {
    go func() {
        ticker := time.NewTicker(time.Minute)
        defer ticker.Stop()
        
        for range ticker.C {
            cur.mutex.Lock()
            now := time.Now()
            for key, item := range cur.cache {
                cached := item.(cacheItem)
                if now.After(cached.expires) {
                    delete(cur.cache, key)
                }
            }
            cur.mutex.Unlock()
        }
    }()
}
```

## 6. 实践练习

### 练习1：构建博客系统
```go
// 实现一个完整的博客系统后端
type BlogService struct {
    userRepo    *UserRepository
    postRepo    *PostRepository
    commentRepo *CommentRepository
    tagRepo     *TagRepository
}

func (bs *BlogService) CreatePost(userID uint, postData CreatePostRequest) (*Post, error) {
    // 实现文章创建逻辑
    return nil, nil
}

func (bs *BlogService) GetPostWithComments(postID uint) (*Post, []Comment, error) {
    // 实现获取文章及评论
    return nil, nil, nil
}
```

### 练习2：实现软删除和审计日志
```go
// 实现数据变更审计
type AuditLog struct {
    BaseModel
    TableName string `gorm:"size:50"`
    RecordID  uint
    Action    string `gorm:"size:20"` // CREATE, UPDATE, DELETE
    OldValues string `gorm:"type:json"`
    NewValues string `gorm:"type:json"`
    UserID    uint
}

func (al *AuditLog) BeforeCreate(tx *gorm.DB) error {
    // 实现审计日志创建逻辑
    return nil
}
```

### 练习3：实现数据库读写分离
```go
// 实现读写分离
type ReadWriteSplitDB struct {
    writeDB *gorm.DB
    readDB  *gorm.DB
}

func (rws *ReadWriteSplitDB) Write() *gorm.DB {
    return rws.writeDB
}

func (rws *ReadWriteSplitDB) Read() *gorm.DB {
    return rws.readDB
}
```

## 7. 参考资料

- [GORM官方文档](https://gorm.io/docs/)
- [GORM最佳实践](https://gorm.io/docs/performance.html)
- [数据库设计原则](https://en.wikipedia.org/wiki/Database_design)
- [SQL性能优化](https://use-the-index-luke.com/)

---

通过本章的学习，你将全面掌握GORM框架的使用方法，能够高效地进行ORM开发和数据库性能优化。