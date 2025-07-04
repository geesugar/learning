# NoSQL数据库

## 学习目标
- 掌握MongoDB的基本使用和操作
- 学习Redis缓存和数据结构操作
- 理解Elasticsearch搜索引擎集成
- 掌握不同NoSQL数据库的应用场景

## 1. MongoDB操作

### 连接和基本配置
```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

// MongoDB配置
type MongoConfig struct {
    URI            string
    Database       string
    ConnectTimeout time.Duration
    QueryTimeout   time.Duration
    MaxPoolSize    uint64
    MinPoolSize    uint64
}

// MongoDB客户端
type MongoClient struct {
    client   *mongo.Client
    database *mongo.Database
    config   MongoConfig
}

// 初始化MongoDB连接
func NewMongoClient(config MongoConfig) (*MongoClient, error) {
    // 设置默认值
    if config.ConnectTimeout == 0 {
        config.ConnectTimeout = 10 * time.Second
    }
    if config.QueryTimeout == 0 {
        config.QueryTimeout = 30 * time.Second
    }
    if config.MaxPoolSize == 0 {
        config.MaxPoolSize = 100
    }
    if config.MinPoolSize == 0 {
        config.MinPoolSize = 5
    }
    
    // 客户端选项
    clientOptions := options.Client().
        ApplyURI(config.URI).
        SetConnectTimeout(config.ConnectTimeout).
        SetMaxPoolSize(config.MaxPoolSize).
        SetMinPoolSize(config.MinPoolSize)
    
    // 连接MongoDB
    ctx, cancel := context.WithTimeout(context.Background(), config.ConnectTimeout)
    defer cancel()
    
    client, err := mongo.Connect(ctx, clientOptions)
    if err != nil {
        return nil, fmt.Errorf("MongoDB连接失败: %w", err)
    }
    
    // 测试连接
    if err := client.Ping(ctx, nil); err != nil {
        return nil, fmt.Errorf("MongoDB Ping失败: %w", err)
    }
    
    database := client.Database(config.Database)
    
    return &MongoClient{
        client:   client,
        database: database,
        config:   config,
    }, nil
}

// 关闭连接
func (mc *MongoClient) Close() error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    return mc.client.Disconnect(ctx)
}

// 获取集合
func (mc *MongoClient) Collection(name string) *mongo.Collection {
    return mc.database.Collection(name)
}

// 健康检查
func (mc *MongoClient) HealthCheck() error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    return mc.client.Ping(ctx, nil)
}
```

### 文档模型定义
```go
import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

// 用户文档
type User struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Username  string             `bson:"username" json:"username"`
    Email     string             `bson:"email" json:"email"`
    Password  string             `bson:"password" json:"-"`
    Profile   UserProfile        `bson:"profile" json:"profile"`
    Settings  UserSettings       `bson:"settings" json:"settings"`
    Tags      []string           `bson:"tags" json:"tags"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
    UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// 用户资料
type UserProfile struct {
    FullName  string    `bson:"full_name" json:"full_name"`
    Avatar    string    `bson:"avatar" json:"avatar"`
    Bio       string    `bson:"bio" json:"bio"`
    Website   string    `bson:"website" json:"website"`
    Location  string    `bson:"location" json:"location"`
    BirthDate time.Time `bson:"birth_date" json:"birth_date"`
}

// 用户设置
type UserSettings struct {
    Language     string `bson:"language" json:"language"`
    Timezone     string `bson:"timezone" json:"timezone"`
    EmailNotify  bool   `bson:"email_notify" json:"email_notify"`
    PushNotify   bool   `bson:"push_notify" json:"push_notify"`
    PrivateMode  bool   `bson:"private_mode" json:"private_mode"`
}

// 文章文档
type Post struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Title     string             `bson:"title" json:"title"`
    Content   string             `bson:"content" json:"content"`
    Summary   string             `bson:"summary" json:"summary"`
    AuthorID  primitive.ObjectID `bson:"author_id" json:"author_id"`
    Author    *User              `bson:"author,omitempty" json:"author,omitempty"`
    Tags      []string           `bson:"tags" json:"tags"`
    Category  string             `bson:"category" json:"category"`
    Status    string             `bson:"status" json:"status"` // draft, published, archived
    ViewCount int64              `bson:"view_count" json:"view_count"`
    LikeCount int64              `bson:"like_count" json:"like_count"`
    Metadata  PostMetadata       `bson:"metadata" json:"metadata"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
    UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// 文章元数据
type PostMetadata struct {
    SEOTitle       string   `bson:"seo_title" json:"seo_title"`
    SEODescription string   `bson:"seo_description" json:"seo_description"`
    Keywords       []string `bson:"keywords" json:"keywords"`
    FeaturedImage  string   `bson:"featured_image" json:"featured_image"`
    ReadingTime    int      `bson:"reading_time" json:"reading_time"`
}

// 评论文档
type Comment struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    PostID    primitive.ObjectID `bson:"post_id" json:"post_id"`
    UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
    ParentID  *primitive.ObjectID `bson:"parent_id,omitempty" json:"parent_id,omitempty"`
    Content   string             `bson:"content" json:"content"`
    Status    string             `bson:"status" json:"status"` // pending, approved, rejected
    Votes     CommentVotes       `bson:"votes" json:"votes"`
    Replies   []Comment          `bson:"replies,omitempty" json:"replies,omitempty"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
    UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// 评论投票
type CommentVotes struct {
    Up   int64 `bson:"up" json:"up"`
    Down int64 `bson:"down" json:"down"`
}
```

### CRUD操作
```go
// 用户仓库
type UserRepository struct {
    collection *mongo.Collection
    client     *MongoClient
}

func NewUserRepository(client *MongoClient) *UserRepository {
    return &UserRepository{
        collection: client.Collection("users"),
        client:     client,
    }
}

// 创建用户
func (ur *UserRepository) Create(ctx context.Context, user *User) error {
    user.CreatedAt = time.Now()
    user.UpdatedAt = time.Now()
    
    result, err := ur.collection.InsertOne(ctx, user)
    if err != nil {
        return fmt.Errorf("创建用户失败: %w", err)
    }
    
    user.ID = result.InsertedID.(primitive.ObjectID)
    return nil
}

// 批量创建用户
func (ur *UserRepository) CreateMany(ctx context.Context, users []User) error {
    now := time.Now()
    docs := make([]interface{}, len(users))
    
    for i, user := range users {
        user.CreatedAt = now
        user.UpdatedAt = now
        docs[i] = user
    }
    
    _, err := ur.collection.InsertMany(ctx, docs)
    if err != nil {
        return fmt.Errorf("批量创建用户失败: %w", err)
    }
    
    return nil
}

// 根据ID查询用户
func (ur *UserRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*User, error) {
    var user User
    err := ur.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
    
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return nil, nil // 用户不存在
        }
        return nil, fmt.Errorf("查询用户失败: %w", err)
    }
    
    return &user, nil
}

// 根据用户名查询用户
func (ur *UserRepository) GetByUsername(ctx context.Context, username string) (*User, error) {
    var user User
    filter := bson.M{"username": username}
    
    err := ur.collection.FindOne(ctx, filter).Decode(&user)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return nil, nil
        }
        return nil, fmt.Errorf("查询用户失败: %w", err)
    }
    
    return &user, nil
}

// 复杂查询
type UserQueryOptions struct {
    Username *string
    Email    *string
    Tags     []string
    Location *string
    CreatedAfter  *time.Time
    CreatedBefore *time.Time
    Page     int
    PageSize int
    SortBy   string
    SortDesc bool
}

func (ur *UserRepository) Find(ctx context.Context, opts UserQueryOptions) ([]User, int64, error) {
    // 构建过滤器
    filter := bson.M{}
    
    if opts.Username != nil {
        filter["username"] = bson.M{"$regex": *opts.Username, "$options": "i"}
    }
    
    if opts.Email != nil {
        filter["email"] = *opts.Email
    }
    
    if len(opts.Tags) > 0 {
        filter["tags"] = bson.M{"$in": opts.Tags}
    }
    
    if opts.Location != nil {
        filter["profile.location"] = bson.M{"$regex": *opts.Location, "$options": "i"}
    }
    
    // 时间范围查询
    if opts.CreatedAfter != nil || opts.CreatedBefore != nil {
        timeFilter := bson.M{}
        if opts.CreatedAfter != nil {
            timeFilter["$gte"] = *opts.CreatedAfter
        }
        if opts.CreatedBefore != nil {
            timeFilter["$lte"] = *opts.CreatedBefore
        }
        filter["created_at"] = timeFilter
    }
    
    // 获取总数
    total, err := ur.collection.CountDocuments(ctx, filter)
    if err != nil {
        return nil, 0, fmt.Errorf("计算文档总数失败: %w", err)
    }
    
    // 构建查询选项
    findOptions := options.Find()
    
    // 排序
    sortField := "created_at"
    if opts.SortBy != "" {
        sortField = opts.SortBy
    }
    sortOrder := 1
    if opts.SortDesc {
        sortOrder = -1
    }
    findOptions.SetSort(bson.D{{sortField, sortOrder}})
    
    // 分页
    if opts.Page > 0 && opts.PageSize > 0 {
        skip := int64((opts.Page - 1) * opts.PageSize)
        findOptions.SetSkip(skip)
        findOptions.SetLimit(int64(opts.PageSize))
    }
    
    // 执行查询
    cursor, err := ur.collection.Find(ctx, filter, findOptions)
    if err != nil {
        return nil, 0, fmt.Errorf("查询用户失败: %w", err)
    }
    defer cursor.Close(ctx)
    
    var users []User
    if err := cursor.All(ctx, &users); err != nil {
        return nil, 0, fmt.Errorf("解码用户数据失败: %w", err)
    }
    
    return users, total, nil
}

// 更新用户
func (ur *UserRepository) Update(ctx context.Context, id primitive.ObjectID, update bson.M) error {
    update["updated_at"] = time.Now()
    
    updateDoc := bson.M{"$set": update}
    result, err := ur.collection.UpdateOne(ctx, bson.M{"_id": id}, updateDoc)
    
    if err != nil {
        return fmt.Errorf("更新用户失败: %w", err)
    }
    
    if result.MatchedCount == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 部分更新
func (ur *UserRepository) UpdateFields(ctx context.Context, id primitive.ObjectID, fields map[string]interface{}) error {
    update := bson.M{}
    for key, value := range fields {
        update[key] = value
    }
    update["updated_at"] = time.Now()
    
    updateDoc := bson.M{"$set": update}
    result, err := ur.collection.UpdateOne(ctx, bson.M{"_id": id}, updateDoc)
    
    if err != nil {
        return fmt.Errorf("部分更新用户失败: %w", err)
    }
    
    if result.MatchedCount == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 数组操作 - 添加标签
func (ur *UserRepository) AddTag(ctx context.Context, id primitive.ObjectID, tag string) error {
    update := bson.M{
        "$addToSet": bson.M{"tags": tag},
        "$set":      bson.M{"updated_at": time.Now()},
    }
    
    result, err := ur.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
    if err != nil {
        return fmt.Errorf("添加标签失败: %w", err)
    }
    
    if result.MatchedCount == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 数组操作 - 移除标签
func (ur *UserRepository) RemoveTag(ctx context.Context, id primitive.ObjectID, tag string) error {
    update := bson.M{
        "$pull": bson.M{"tags": tag},
        "$set":  bson.M{"updated_at": time.Now()},
    }
    
    result, err := ur.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
    if err != nil {
        return fmt.Errorf("移除标签失败: %w", err)
    }
    
    if result.MatchedCount == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 删除用户
func (ur *UserRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
    result, err := ur.collection.DeleteOne(ctx, bson.M{"_id": id})
    if err != nil {
        return fmt.Errorf("删除用户失败: %w", err)
    }
    
    if result.DeletedCount == 0 {
        return fmt.Errorf("用户不存在")
    }
    
    return nil
}

// 批量删除
func (ur *UserRepository) DeleteMany(ctx context.Context, filter bson.M) (int64, error) {
    result, err := ur.collection.DeleteMany(ctx, filter)
    if err != nil {
        return 0, fmt.Errorf("批量删除用户失败: %w", err)
    }
    
    return result.DeletedCount, nil
}
```

### 聚合查询
```go
// 聚合查询示例
func (ur *UserRepository) GetUserStats(ctx context.Context) ([]bson.M, error) {
    pipeline := []bson.M{
        // 按地区分组统计用户数
        {
            "$group": bson.M{
                "_id": "$profile.location",
                "user_count": bson.M{"$sum": 1},
                "avg_posts": bson.M{"$avg": "$stats.post_count"},
            },
        },
        // 排序
        {
            "$sort": bson.M{"user_count": -1},
        },
        // 限制结果数量
        {
            "$limit": 10,
        },
    }
    
    cursor, err := ur.collection.Aggregate(ctx, pipeline)
    if err != nil {
        return nil, fmt.Errorf("聚合查询失败: %w", err)
    }
    defer cursor.Close(ctx)
    
    var results []bson.M
    if err := cursor.All(ctx, &results); err != nil {
        return nil, fmt.Errorf("解码聚合结果失败: %w", err)
    }
    
    return results, nil
}

// 复杂聚合查询 - 用户活动统计
func (ur *UserRepository) GetUserActivityStats(ctx context.Context, days int) ([]bson.M, error) {
    startDate := time.Now().AddDate(0, 0, -days)
    
    pipeline := []bson.M{
        // 匹配时间范围
        {
            "$match": bson.M{
                "created_at": bson.M{"$gte": startDate},
            },
        },
        // 添加日期字段
        {
            "$addFields": bson.M{
                "date": bson.M{
                    "$dateToString": bson.M{
                        "format": "%Y-%m-%d",
                        "date":   "$created_at",
                    },
                },
            },
        },
        // 按日期分组
        {
            "$group": bson.M{
                "_id":        "$date",
                "new_users":  bson.M{"$sum": 1},
                "user_ids":   bson.M{"$push": "$_id"},
            },
        },
        // 查找活跃用户（有文章的用户）
        {
            "$lookup": bson.M{
                "from": "posts",
                "let":  bson.M{"userIds": "$user_ids"},
                "pipeline": []bson.M{
                    {
                        "$match": bson.M{
                            "$expr": bson.M{
                                "$in": []interface{}{"$author_id", "$$userIds"},
                            },
                        },
                    },
                    {
                        "$group": bson.M{
                            "_id":   "$author_id",
                            "posts": bson.M{"$sum": 1},
                        },
                    },
                },
                "as": "active_users",
            },
        },
        // 计算活跃用户数
        {
            "$addFields": bson.M{
                "active_users_count": bson.M{"$size": "$active_users"},
            },
        },
        // 排序
        {
            "$sort": bson.M{"_id": 1},
        },
    }
    
    cursor, err := ur.collection.Aggregate(ctx, pipeline)
    if err != nil {
        return nil, fmt.Errorf("用户活动统计失败: %w", err)
    }
    defer cursor.Close(ctx)
    
    var results []bson.M
    if err := cursor.All(ctx, &results); err != nil {
        return nil, fmt.Errorf("解码统计结果失败: %w", err)
    }
    
    return results, nil
}

// 地理空间查询
func (ur *UserRepository) FindUsersNearby(ctx context.Context, longitude, latitude float64, maxDistance int64) ([]User, error) {
    filter := bson.M{
        "profile.location": bson.M{
            "$near": bson.M{
                "$geometry": bson.M{
                    "type":        "Point",
                    "coordinates": []float64{longitude, latitude},
                },
                "$maxDistance": maxDistance, // 米
            },
        },
    }
    
    cursor, err := ur.collection.Find(ctx, filter)
    if err != nil {
        return nil, fmt.Errorf("地理位置查询失败: %w", err)
    }
    defer cursor.Close(ctx)
    
    var users []User
    if err := cursor.All(ctx, &users); err != nil {
        return nil, fmt.Errorf("解码用户数据失败: %w", err)
    }
    
    return users, nil
}

// 文本搜索
func (ur *UserRepository) SearchUsers(ctx context.Context, searchText string, limit int64) ([]User, error) {
    filter := bson.M{
        "$text": bson.M{
            "$search": searchText,
        },
    }
    
    findOptions := options.Find().
        SetSort(bson.M{"score": bson.M{"$meta": "textScore"}}).
        SetLimit(limit)
    
    cursor, err := ur.collection.Find(ctx, filter, findOptions)
    if err != nil {
        return nil, fmt.Errorf("文本搜索失败: %w", err)
    }
    defer cursor.Close(ctx)
    
    var users []User
    if err := cursor.All(ctx, &users); err != nil {
        return nil, fmt.Errorf("解码搜索结果失败: %w", err)
    }
    
    return users, nil
}
```

### 索引管理
```go
// 索引管理器
type IndexManager struct {
    client *MongoClient
}

func NewIndexManager(client *MongoClient) *IndexManager {
    return &IndexManager{client: client}
}

// 创建用户集合索引
func (im *IndexManager) CreateUserIndexes(ctx context.Context) error {
    collection := im.client.Collection("users")
    
    indexes := []mongo.IndexModel{
        // 唯一索引
        {
            Keys:    bson.D{{Key: "username", Value: 1}},
            Options: options.Index().SetUnique(true),
        },
        {
            Keys:    bson.D{{Key: "email", Value: 1}},
            Options: options.Index().SetUnique(true),
        },
        // 复合索引
        {
            Keys: bson.D{
                {Key: "profile.location", Value: 1},
                {Key: "created_at", Value: -1},
            },
        },
        // 文本索引
        {
            Keys: bson.D{
                {Key: "username", Value: "text"},
                {Key: "profile.full_name", Value: "text"},
                {Key: "profile.bio", Value: "text"},
            },
            Options: options.Index().SetDefaultLanguage("english"),
        },
        // 稀疏索引
        {
            Keys:    bson.D{{Key: "profile.website", Value: 1}},
            Options: options.Index().SetSparse(true),
        },
        // TTL索引（如果需要自动删除文档）
        {
            Keys:    bson.D{{Key: "expires_at", Value: 1}},
            Options: options.Index().SetExpireAfterSeconds(0),
        },
        // 地理空间索引
        {
            Keys: bson.D{{Key: "profile.geo_location", Value: "2dsphere"}},
        },
    }
    
    _, err := collection.Indexes().CreateMany(ctx, indexes)
    if err != nil {
        return fmt.Errorf("创建用户索引失败: %w", err)
    }
    
    log.Println("用户集合索引创建完成")
    return nil
}

// 创建文章集合索引
func (im *IndexManager) CreatePostIndexes(ctx context.Context) error {
    collection := im.client.Collection("posts")
    
    indexes := []mongo.IndexModel{
        // 作者和状态复合索引
        {
            Keys: bson.D{
                {Key: "author_id", Value: 1},
                {Key: "status", Value: 1},
                {Key: "created_at", Value: -1},
            },
        },
        // 分类和标签索引
        {
            Keys: bson.D{
                {Key: "category", Value: 1},
                {Key: "tags", Value: 1},
            },
        },
        // 全文搜索索引
        {
            Keys: bson.D{
                {Key: "title", Value: "text"},
                {Key: "content", Value: "text"},
                {Key: "summary", Value: "text"},
            },
            Options: options.Index().SetWeights(bson.M{
                "title":   10,
                "summary": 5,
                "content": 1,
            }),
        },
        // 状态和创建时间索引
        {
            Keys: bson.D{
                {Key: "status", Value: 1},
                {Key: "created_at", Value: -1},
            },
        },
    }
    
    _, err := collection.Indexes().CreateMany(ctx, indexes)
    if err != nil {
        return fmt.Errorf("创建文章索引失败: %w", err)
    }
    
    log.Println("文章集合索引创建完成")
    return nil
}

// 列出索引
func (im *IndexManager) ListIndexes(ctx context.Context, collectionName string) ([]bson.M, error) {
    collection := im.client.Collection(collectionName)
    
    cursor, err := collection.Indexes().List(ctx)
    if err != nil {
        return nil, fmt.Errorf("列出索引失败: %w", err)
    }
    defer cursor.Close(ctx)
    
    var indexes []bson.M
    if err := cursor.All(ctx, &indexes); err != nil {
        return nil, fmt.Errorf("解码索引信息失败: %w", err)
    }
    
    return indexes, nil
}

// 删除索引
func (im *IndexManager) DropIndex(ctx context.Context, collectionName, indexName string) error {
    collection := im.client.Collection(collectionName)
    
    _, err := collection.Indexes().DropOne(ctx, indexName)
    if err != nil {
        return fmt.Errorf("删除索引失败: %w", err)
    }
    
    log.Printf("索引 %s 删除完成", indexName)
    return nil
}
```

## 2. Redis操作

### 连接和基本配置
```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "time"
    
    "github.com/redis/go-redis/v9"
)

// Redis配置
type RedisConfig struct {
    Addr         string
    Password     string
    DB           int
    PoolSize     int
    MinIdleConns int
    MaxRetries   int
    DialTimeout  time.Duration
    ReadTimeout  time.Duration
    WriteTimeout time.Duration
}

// Redis客户端
type RedisClient struct {
    client *redis.Client
    config RedisConfig
}

// 初始化Redis连接
func NewRedisClient(config RedisConfig) (*RedisClient, error) {
    // 设置默认值
    if config.PoolSize == 0 {
        config.PoolSize = 10
    }
    if config.MinIdleConns == 0 {
        config.MinIdleConns = 5
    }
    if config.MaxRetries == 0 {
        config.MaxRetries = 3
    }
    if config.DialTimeout == 0 {
        config.DialTimeout = 5 * time.Second
    }
    if config.ReadTimeout == 0 {
        config.ReadTimeout = 3 * time.Second
    }
    if config.WriteTimeout == 0 {
        config.WriteTimeout = 3 * time.Second
    }
    
    // Redis选项
    opts := &redis.Options{
        Addr:         config.Addr,
        Password:     config.Password,
        DB:           config.DB,
        PoolSize:     config.PoolSize,
        MinIdleConns: config.MinIdleConns,
        MaxRetries:   config.MaxRetries,
        DialTimeout:  config.DialTimeout,
        ReadTimeout:  config.ReadTimeout,
        WriteTimeout: config.WriteTimeout,
    }
    
    client := redis.NewClient(opts)
    
    // 测试连接
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    if err := client.Ping(ctx).Err(); err != nil {
        return nil, fmt.Errorf("Redis连接失败: %w", err)
    }
    
    return &RedisClient{
        client: client,
        config: config,
    }, nil
}

// 关闭连接
func (rc *RedisClient) Close() error {
    return rc.client.Close()
}

// 健康检查
func (rc *RedisClient) HealthCheck(ctx context.Context) error {
    return rc.client.Ping(ctx).Err()
}

// 获取Redis客户端
func (rc *RedisClient) Client() *redis.Client {
    return rc.client
}
```

### 基本数据类型操作
```go
// 缓存管理器
type CacheManager struct {
    client *RedisClient
}

func NewCacheManager(client *RedisClient) *CacheManager {
    return &CacheManager{client: client}
}

// 字符串操作
func (cm *CacheManager) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
    return cm.client.client.Set(ctx, key, value, expiration).Err()
}

func (cm *CacheManager) Get(ctx context.Context, key string) (string, error) {
    result, err := cm.client.client.Get(ctx, key).Result()
    if err == redis.Nil {
        return "", nil // key不存在
    }
    return result, err
}

func (cm *CacheManager) GetInt(ctx context.Context, key string) (int64, error) {
    return cm.client.client.Get(ctx, key).Int64()
}

func (cm *CacheManager) Incr(ctx context.Context, key string) (int64, error) {
    return cm.client.client.Incr(ctx, key).Result()
}

func (cm *CacheManager) IncrBy(ctx context.Context, key string, value int64) (int64, error) {
    return cm.client.client.IncrBy(ctx, key, value).Result()
}

func (cm *CacheManager) Decr(ctx context.Context, key string) (int64, error) {
    return cm.client.client.Decr(ctx, key).Result()
}

// JSON对象缓存
func (cm *CacheManager) SetJSON(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
    data, err := json.Marshal(value)
    if err != nil {
        return fmt.Errorf("JSON序列化失败: %w", err)
    }
    
    return cm.client.client.Set(ctx, key, data, expiration).Err()
}

func (cm *CacheManager) GetJSON(ctx context.Context, key string, dest interface{}) error {
    data, err := cm.client.client.Get(ctx, key).Result()
    if err != nil {
        if err == redis.Nil {
            return nil // key不存在
        }
        return err
    }
    
    return json.Unmarshal([]byte(data), dest)
}

// 哈希操作
func (cm *CacheManager) HSet(ctx context.Context, key, field string, value interface{}) error {
    return cm.client.client.HSet(ctx, key, field, value).Err()
}

func (cm *CacheManager) HGet(ctx context.Context, key, field string) (string, error) {
    result, err := cm.client.client.HGet(ctx, key, field).Result()
    if err == redis.Nil {
        return "", nil
    }
    return result, err
}

func (cm *CacheManager) HGetAll(ctx context.Context, key string) (map[string]string, error) {
    return cm.client.client.HGetAll(ctx, key).Result()
}

func (cm *CacheManager) HMSet(ctx context.Context, key string, values map[string]interface{}) error {
    return cm.client.client.HMSet(ctx, key, values).Err()
}

func (cm *CacheManager) HIncrBy(ctx context.Context, key, field string, incr int64) (int64, error) {
    return cm.client.client.HIncrBy(ctx, key, field, incr).Result()
}

// 列表操作
func (cm *CacheManager) LPush(ctx context.Context, key string, values ...interface{}) error {
    return cm.client.client.LPush(ctx, key, values...).Err()
}

func (cm *CacheManager) RPush(ctx context.Context, key string, values ...interface{}) error {
    return cm.client.client.RPush(ctx, key, values...).Err()
}

func (cm *CacheManager) LPop(ctx context.Context, key string) (string, error) {
    result, err := cm.client.client.LPop(ctx, key).Result()
    if err == redis.Nil {
        return "", nil
    }
    return result, err
}

func (cm *CacheManager) RPop(ctx context.Context, key string) (string, error) {
    result, err := cm.client.client.RPop(ctx, key).Result()
    if err == redis.Nil {
        return "", nil
    }
    return result, err
}

func (cm *CacheManager) LRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
    return cm.client.client.LRange(ctx, key, start, stop).Result()
}

func (cm *CacheManager) LLen(ctx context.Context, key string) (int64, error) {
    return cm.client.client.LLen(ctx, key).Result()
}

// 集合操作
func (cm *CacheManager) SAdd(ctx context.Context, key string, members ...interface{}) error {
    return cm.client.client.SAdd(ctx, key, members...).Err()
}

func (cm *CacheManager) SRem(ctx context.Context, key string, members ...interface{}) error {
    return cm.client.client.SRem(ctx, key, members...).Err()
}

func (cm *CacheManager) SMembers(ctx context.Context, key string) ([]string, error) {
    return cm.client.client.SMembers(ctx, key).Result()
}

func (cm *CacheManager) SIsMember(ctx context.Context, key string, member interface{}) (bool, error) {
    return cm.client.client.SIsMember(ctx, key, member).Result()
}

func (cm *CacheManager) SCard(ctx context.Context, key string) (int64, error) {
    return cm.client.client.SCard(ctx, key).Result()
}

// 有序集合操作
func (cm *CacheManager) ZAdd(ctx context.Context, key string, members ...*redis.Z) error {
    return cm.client.client.ZAdd(ctx, key, members...).Err()
}

func (cm *CacheManager) ZRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
    return cm.client.client.ZRange(ctx, key, start, stop).Result()
}

func (cm *CacheManager) ZRangeWithScores(ctx context.Context, key string, start, stop int64) ([]redis.Z, error) {
    return cm.client.client.ZRangeWithScores(ctx, key, start, stop).Result()
}

func (cm *CacheManager) ZRevRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
    return cm.client.client.ZRevRange(ctx, key, start, stop).Result()
}

func (cm *CacheManager) ZScore(ctx context.Context, key, member string) (float64, error) {
    result, err := cm.client.client.ZScore(ctx, key, member).Result()
    if err == redis.Nil {
        return 0, nil
    }
    return result, err
}

func (cm *CacheManager) ZIncrBy(ctx context.Context, key string, increment float64, member string) error {
    return cm.client.client.ZIncrBy(ctx, key, increment, member).Err()
}

// 通用操作
func (cm *CacheManager) Exists(ctx context.Context, keys ...string) (int64, error) {
    return cm.client.client.Exists(ctx, keys...).Result()
}

func (cm *CacheManager) Del(ctx context.Context, keys ...string) error {
    return cm.client.client.Del(ctx, keys...).Err()
}

func (cm *CacheManager) Expire(ctx context.Context, key string, expiration time.Duration) error {
    return cm.client.client.Expire(ctx, key, expiration).Err()
}

func (cm *CacheManager) TTL(ctx context.Context, key string) (time.Duration, error) {
    return cm.client.client.TTL(ctx, key).Result()
}

func (cm *CacheManager) Keys(ctx context.Context, pattern string) ([]string, error) {
    return cm.client.client.Keys(ctx, pattern).Result()
}
```

### 高级功能
```go
// 分布式锁
type DistributedLock struct {
    client *CacheManager
    key    string
    value  string
    ttl    time.Duration
}

func NewDistributedLock(client *CacheManager, key string, ttl time.Duration) *DistributedLock {
    return &DistributedLock{
        client: client,
        key:    key,
        value:  fmt.Sprintf("%d", time.Now().UnixNano()),
        ttl:    ttl,
    }
}

func (dl *DistributedLock) TryLock(ctx context.Context) (bool, error) {
    // 使用SET NX EX命令
    result, err := dl.client.client.client.SetNX(ctx, dl.key, dl.value, dl.ttl).Result()
    return result, err
}

func (dl *DistributedLock) Unlock(ctx context.Context) error {
    // 使用Lua脚本确保原子性
    script := `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    `
    
    result, err := dl.client.client.client.Eval(ctx, script, []string{dl.key}, dl.value).Result()
    if err != nil {
        return err
    }
    
    if result.(int64) == 0 {
        return fmt.Errorf("锁已被其他进程释放")
    }
    
    return nil
}

func (dl *DistributedLock) Refresh(ctx context.Context) error {
    // 刷新锁的过期时间
    script := `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
    else
        return 0
    end
    `
    
    result, err := dl.client.client.client.Eval(ctx, script, []string{dl.key}, dl.value, int(dl.ttl.Seconds())).Result()
    if err != nil {
        return err
    }
    
    if result.(int64) == 0 {
        return fmt.Errorf("锁已过期或被其他进程持有")
    }
    
    return nil
}

// 限流器
type RateLimiter struct {
    client    *CacheManager
    keyPrefix string
}

func NewRateLimiter(client *CacheManager, keyPrefix string) *RateLimiter {
    return &RateLimiter{
        client:    client,
        keyPrefix: keyPrefix,
    }
}

// 滑动窗口限流
func (rl *RateLimiter) Allow(ctx context.Context, identifier string, limit int64, window time.Duration) (bool, error) {
    key := fmt.Sprintf("%s:%s", rl.keyPrefix, identifier)
    now := time.Now().UnixNano()
    windowStart := now - window.Nanoseconds()
    
    script := `
    -- 移除过期的记录
    redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
    
    -- 获取当前计数
    local current = redis.call('ZCARD', KEYS[1])
    
    if current < tonumber(ARGV[3]) then
        -- 添加新记录
        redis.call('ZADD', KEYS[1], ARGV[2], ARGV[2])
        redis.call('EXPIRE', KEYS[1], ARGV[4])
        return 1
    else
        return 0
    end
    `
    
    result, err := rl.client.client.client.Eval(ctx, script, 
        []string{key}, 
        windowStart, now, limit, int(window.Seconds())).Result()
    
    if err != nil {
        return false, err
    }
    
    return result.(int64) == 1, nil
}

// 令牌桶限流
func (rl *RateLimiter) TokenBucket(ctx context.Context, identifier string, capacity, refillRate int64, refillPeriod time.Duration) (bool, error) {
    key := fmt.Sprintf("%s:bucket:%s", rl.keyPrefix, identifier)
    now := time.Now().UnixNano()
    
    script := `
    local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'last_refill')
    local tokens = tonumber(bucket[1]) or tonumber(ARGV[1])  -- capacity
    local last_refill = tonumber(bucket[2]) or tonumber(ARGV[4])  -- now
    
    -- 计算需要添加的令牌数
    local elapsed = math.max(0, tonumber(ARGV[4]) - last_refill)
    local tokens_to_add = math.floor(elapsed / tonumber(ARGV[3]) * tonumber(ARGV[2]))
    tokens = math.min(tonumber(ARGV[1]), tokens + tokens_to_add)
    
    if tokens >= 1 then
        tokens = tokens - 1
        redis.call('HMSET', KEYS[1], 'tokens', tokens, 'last_refill', ARGV[4])
        redis.call('EXPIRE', KEYS[1], ARGV[5])
        return 1
    else
        redis.call('HMSET', KEYS[1], 'tokens', tokens, 'last_refill', ARGV[4])
        redis.call('EXPIRE', KEYS[1], ARGV[5])
        return 0
    end
    `
    
    result, err := rl.client.client.client.Eval(ctx, script,
        []string{key},
        capacity, refillRate, refillPeriod.Nanoseconds(), now, int(refillPeriod.Seconds()*2)).Result()
    
    if err != nil {
        return false, err
    }
    
    return result.(int64) == 1, nil
}

// 发布/订阅
type PubSubManager struct {
    client *RedisClient
}

func NewPubSubManager(client *RedisClient) *PubSubManager {
    return &PubSubManager{client: client}
}

func (psm *PubSubManager) Publish(ctx context.Context, channel string, message interface{}) error {
    return psm.client.client.Publish(ctx, channel, message).Err()
}

func (psm *PubSubManager) Subscribe(ctx context.Context, channels ...string) *redis.PubSub {
    return psm.client.client.Subscribe(ctx, channels...)
}

func (psm *PubSubManager) PSubscribe(ctx context.Context, patterns ...string) *redis.PubSub {
    return psm.client.client.PSubscribe(ctx, patterns...)
}

// 订阅处理器
func (psm *PubSubManager) HandleSubscription(ctx context.Context, pubsub *redis.PubSub, handler func(channel, message string)) error {
    defer pubsub.Close()
    
    ch := pubsub.Channel()
    
    for {
        select {
        case msg, ok := <-ch:
            if !ok {
                return nil
            }
            handler(msg.Channel, msg.Payload)
        case <-ctx.Done():
            return ctx.Err()
        }
    }
}

// 排行榜
type Leaderboard struct {
    client *CacheManager
    key    string
}

func NewLeaderboard(client *CacheManager, key string) *Leaderboard {
    return &Leaderboard{
        client: client,
        key:    key,
    }
}

func (lb *Leaderboard) AddScore(ctx context.Context, member string, score float64) error {
    return lb.client.ZAdd(ctx, lb.key, &redis.Z{
        Score:  score,
        Member: member,
    })
}

func (lb *Leaderboard) GetTopN(ctx context.Context, n int64) ([]redis.Z, error) {
    return lb.client.ZRevRangeWithScores(ctx, lb.key, 0, n-1)
}

func (lb *Leaderboard) GetRank(ctx context.Context, member string) (int64, error) {
    rank, err := lb.client.client.client.ZRevRank(ctx, lb.key, member).Result()
    if err == redis.Nil {
        return -1, nil // 成员不存在
    }
    return rank + 1, err // 排名从1开始
}

func (lb *Leaderboard) GetScore(ctx context.Context, member string) (float64, error) {
    return lb.client.ZScore(ctx, lb.key, member)
}

func (lb *Leaderboard) GetRange(ctx context.Context, start, end int64) ([]redis.Z, error) {
    return lb.client.ZRevRangeWithScores(ctx, lb.key, start, end)
}
```

## 3. Elasticsearch操作

### 连接和基本配置
```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "strings"
    
    "github.com/elastic/go-elasticsearch/v8"
    "github.com/elastic/go-elasticsearch/v8/esapi"
)

// Elasticsearch配置
type ElasticsearchConfig struct {
    Addresses []string
    Username  string
    Password  string
    APIKey    string
    CertPath  string
}

// Elasticsearch客户端
type ElasticsearchClient struct {
    client *elasticsearch.Client
    config ElasticsearchConfig
}

// 初始化Elasticsearch连接
func NewElasticsearchClient(config ElasticsearchConfig) (*ElasticsearchClient, error) {
    cfg := elasticsearch.Config{
        Addresses: config.Addresses,
    }
    
    // 认证配置
    if config.Username != "" && config.Password != "" {
        cfg.Username = config.Username
        cfg.Password = config.Password
    }
    
    if config.APIKey != "" {
        cfg.APIKey = config.APIKey
    }
    
    if config.CertPath != "" {
        cfg.CertificateFingerprint = config.CertPath
    }
    
    client, err := elasticsearch.NewClient(cfg)
    if err != nil {
        return nil, fmt.Errorf("创建Elasticsearch客户端失败: %w", err)
    }
    
    // 测试连接
    res, err := client.Info()
    if err != nil {
        return nil, fmt.Errorf("Elasticsearch连接测试失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return nil, fmt.Errorf("Elasticsearch连接错误: %s", res.String())
    }
    
    return &ElasticsearchClient{
        client: client,
        config: config,
    }, nil
}

// 健康检查
func (esc *ElasticsearchClient) HealthCheck() error {
    res, err := esc.client.Cluster.Health()
    if err != nil {
        return err
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("集群健康检查失败: %s", res.String())
    }
    
    return nil
}

// 获取客户端
func (esc *ElasticsearchClient) Client() *elasticsearch.Client {
    return esc.client
}
```

### 索引管理
```go
// 索引管理器
type IndexManager struct {
    client *ElasticsearchClient
}

func NewIndexManager(client *ElasticsearchClient) *IndexManager {
    return &IndexManager{client: client}
}

// 创建索引
func (im *IndexManager) CreateIndex(ctx context.Context, indexName string, mapping map[string]interface{}) error {
    mappingJSON, err := json.Marshal(mapping)
    if err != nil {
        return fmt.Errorf("序列化映射失败: %w", err)
    }
    
    req := esapi.IndicesCreateRequest{
        Index: indexName,
        Body:  strings.NewReader(string(mappingJSON)),
    }
    
    res, err := req.Do(ctx, im.client.client)
    if err != nil {
        return fmt.Errorf("创建索引失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("创建索引错误: %s", res.String())
    }
    
    log.Printf("索引 %s 创建成功", indexName)
    return nil
}

// 删除索引
func (im *IndexManager) DeleteIndex(ctx context.Context, indexName string) error {
    req := esapi.IndicesDeleteRequest{
        Index: []string{indexName},
    }
    
    res, err := req.Do(ctx, im.client.client)
    if err != nil {
        return fmt.Errorf("删除索引失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("删除索引错误: %s", res.String())
    }
    
    log.Printf("索引 %s 删除成功", indexName)
    return nil
}

// 检查索引是否存在
func (im *IndexManager) IndexExists(ctx context.Context, indexName string) (bool, error) {
    req := esapi.IndicesExistsRequest{
        Index: []string{indexName},
    }
    
    res, err := req.Do(ctx, im.client.client)
    if err != nil {
        return false, fmt.Errorf("检查索引存在性失败: %w", err)
    }
    defer res.Body.Close()
    
    return res.StatusCode == 200, nil
}

// 创建文章索引映射
func (im *IndexManager) CreatePostIndex(ctx context.Context) error {
    mapping := map[string]interface{}{
        "mappings": map[string]interface{}{
            "properties": map[string]interface{}{
                "title": map[string]interface{}{
                    "type":     "text",
                    "analyzer": "ik_max_word",
                    "fields": map[string]interface{}{
                        "keyword": map[string]interface{}{
                            "type": "keyword",
                        },
                    },
                },
                "content": map[string]interface{}{
                    "type":     "text",
                    "analyzer": "ik_max_word",
                },
                "summary": map[string]interface{}{
                    "type":     "text",
                    "analyzer": "ik_max_word",
                },
                "author": map[string]interface{}{
                    "type": "keyword",
                },
                "tags": map[string]interface{}{
                    "type": "keyword",
                },
                "category": map[string]interface{}{
                    "type": "keyword",
                },
                "status": map[string]interface{}{
                    "type": "keyword",
                },
                "view_count": map[string]interface{}{
                    "type": "long",
                },
                "like_count": map[string]interface{}{
                    "type": "long",
                },
                "created_at": map[string]interface{}{
                    "type":   "date",
                    "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis",
                },
                "updated_at": map[string]interface{}{
                    "type":   "date",
                    "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis",
                },
            },
        },
        "settings": map[string]interface{}{
            "number_of_shards":   3,
            "number_of_replicas": 1,
            "analysis": map[string]interface{}{
                "analyzer": map[string]interface{}{
                    "ik_max_word": map[string]interface{}{
                        "type": "ik_max_word",
                    },
                    "ik_smart": map[string]interface{}{
                        "type": "ik_smart",
                    },
                },
            },
        },
    }
    
    return im.CreateIndex(ctx, "posts", mapping)
}
```

### 文档操作
```go
// 文档管理器
type DocumentManager struct {
    client *ElasticsearchClient
}

func NewDocumentManager(client *ElasticsearchClient) *DocumentManager {
    return &DocumentManager{client: client}
}

// 索引文档
func (dm *DocumentManager) IndexDocument(ctx context.Context, indexName, docID string, document interface{}) error {
    docJSON, err := json.Marshal(document)
    if err != nil {
        return fmt.Errorf("序列化文档失败: %w", err)
    }
    
    req := esapi.IndexRequest{
        Index:      indexName,
        DocumentID: docID,
        Body:       strings.NewReader(string(docJSON)),
        Refresh:    "true",
    }
    
    res, err := req.Do(ctx, dm.client.client)
    if err != nil {
        return fmt.Errorf("索引文档失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("索引文档错误: %s", res.String())
    }
    
    return nil
}

// 批量索引文档
func (dm *DocumentManager) BulkIndex(ctx context.Context, indexName string, documents []map[string]interface{}) error {
    var bulkBody strings.Builder
    
    for _, doc := range documents {
        // 索引操作元数据
        meta := map[string]interface{}{
            "index": map[string]interface{}{
                "_index": indexName,
            },
        }
        
        metaJSON, _ := json.Marshal(meta)
        docJSON, _ := json.Marshal(doc)
        
        bulkBody.WriteString(string(metaJSON))
        bulkBody.WriteString("\n")
        bulkBody.WriteString(string(docJSON))
        bulkBody.WriteString("\n")
    }
    
    req := esapi.BulkRequest{
        Body:    strings.NewReader(bulkBody.String()),
        Refresh: "true",
    }
    
    res, err := req.Do(ctx, dm.client.client)
    if err != nil {
        return fmt.Errorf("批量索引失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("批量索引错误: %s", res.String())
    }
    
    // 解析响应检查错误
    var bulkResponse map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&bulkResponse); err != nil {
        return fmt.Errorf("解析批量响应失败: %w", err)
    }
    
    if bulkResponse["errors"].(bool) {
        log.Printf("批量索引存在错误: %+v", bulkResponse)
    }
    
    return nil
}

// 获取文档
func (dm *DocumentManager) GetDocument(ctx context.Context, indexName, docID string) (map[string]interface{}, error) {
    req := esapi.GetRequest{
        Index:      indexName,
        DocumentID: docID,
    }
    
    res, err := req.Do(ctx, dm.client.client)
    if err != nil {
        return nil, fmt.Errorf("获取文档失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        if res.StatusCode == 404 {
            return nil, nil // 文档不存在
        }
        return nil, fmt.Errorf("获取文档错误: %s", res.String())
    }
    
    var response map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
        return nil, fmt.Errorf("解析响应失败: %w", err)
    }
    
    return response, nil
}

// 更新文档
func (dm *DocumentManager) UpdateDocument(ctx context.Context, indexName, docID string, doc map[string]interface{}) error {
    updateDoc := map[string]interface{}{
        "doc": doc,
    }
    
    docJSON, err := json.Marshal(updateDoc)
    if err != nil {
        return fmt.Errorf("序列化更新文档失败: %w", err)
    }
    
    req := esapi.UpdateRequest{
        Index:      indexName,
        DocumentID: docID,
        Body:       strings.NewReader(string(docJSON)),
        Refresh:    "true",
    }
    
    res, err := req.Do(ctx, dm.client.client)
    if err != nil {
        return fmt.Errorf("更新文档失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("更新文档错误: %s", res.String())
    }
    
    return nil
}

// 删除文档
func (dm *DocumentManager) DeleteDocument(ctx context.Context, indexName, docID string) error {
    req := esapi.DeleteRequest{
        Index:      indexName,
        DocumentID: docID,
        Refresh:    "true",
    }
    
    res, err := req.Do(ctx, dm.client.client)
    if err != nil {
        return fmt.Errorf("删除文档失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return fmt.Errorf("删除文档错误: %s", res.String())
    }
    
    return nil
}
```

### 搜索功能
```go
// 搜索管理器
type SearchManager struct {
    client *ElasticsearchClient
}

func NewSearchManager(client *ElasticsearchClient) *SearchManager {
    return &SearchManager{client: client}
}

// 搜索参数
type SearchParams struct {
    Query    string
    Index    string
    Size     int
    From     int
    Sort     []map[string]interface{}
    Filters  map[string]interface{}
    Highlight bool
}

// 搜索结果
type SearchResult struct {
    Total    int64                    `json:"total"`
    Hits     []map[string]interface{} `json:"hits"`
    MaxScore float64                  `json:"max_score"`
    TimeTook int                      `json:"time_took"`
}

// 全文搜索
func (sm *SearchManager) Search(ctx context.Context, params SearchParams) (*SearchResult, error) {
    // 构建查询
    query := map[string]interface{}{
        "size": params.Size,
        "from": params.From,
    }
    
    // 构建查询条件
    if params.Query != "" {
        query["query"] = map[string]interface{}{
            "bool": map[string]interface{}{
                "must": []interface{}{
                    map[string]interface{}{
                        "multi_match": map[string]interface{}{
                            "query":  params.Query,
                            "fields": []string{"title^3", "content", "summary^2"},
                            "type":   "best_fields",
                        },
                    },
                },
                "filter": sm.buildFilters(params.Filters),
            },
        }
    } else {
        query["query"] = map[string]interface{}{
            "bool": map[string]interface{}{
                "filter": sm.buildFilters(params.Filters),
            },
        }
    }
    
    // 排序
    if len(params.Sort) > 0 {
        query["sort"] = params.Sort
    }
    
    // 高亮
    if params.Highlight {
        query["highlight"] = map[string]interface{}{
            "fields": map[string]interface{}{
                "title":   map[string]interface{}{},
                "content": map[string]interface{}{},
                "summary": map[string]interface{}{},
            },
            "pre_tags":  []string{"<mark>"},
            "post_tags": []string{"</mark>"},
        }
    }
    
    queryJSON, err := json.Marshal(query)
    if err != nil {
        return nil, fmt.Errorf("序列化查询失败: %w", err)
    }
    
    req := esapi.SearchRequest{
        Index: []string{params.Index},
        Body:  strings.NewReader(string(queryJSON)),
    }
    
    res, err := req.Do(ctx, sm.client.client)
    if err != nil {
        return nil, fmt.Errorf("搜索失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return nil, fmt.Errorf("搜索错误: %s", res.String())
    }
    
    var response map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
        return nil, fmt.Errorf("解析搜索响应失败: %w", err)
    }
    
    return sm.parseSearchResponse(response), nil
}

// 构建过滤器
func (sm *SearchManager) buildFilters(filters map[string]interface{}) []interface{} {
    var filterQueries []interface{}
    
    for field, value := range filters {
        switch v := value.(type) {
        case string:
            filterQueries = append(filterQueries, map[string]interface{}{
                "term": map[string]interface{}{
                    field: v,
                },
            })
        case []string:
            filterQueries = append(filterQueries, map[string]interface{}{
                "terms": map[string]interface{}{
                    field: v,
                },
            })
        case map[string]interface{}:
            if gte, ok := v["gte"]; ok {
                rangeQuery := map[string]interface{}{
                    "range": map[string]interface{}{
                        field: map[string]interface{}{
                            "gte": gte,
                        },
                    },
                }
                if lte, ok := v["lte"]; ok {
                    rangeQuery["range"].(map[string]interface{})[field].(map[string]interface{})["lte"] = lte
                }
                filterQueries = append(filterQueries, rangeQuery)
            }
        }
    }
    
    return filterQueries
}

// 解析搜索响应
func (sm *SearchManager) parseSearchResponse(response map[string]interface{}) *SearchResult {
    hits := response["hits"].(map[string]interface{})
    total := hits["total"].(map[string]interface{})["value"].(float64)
    maxScore := 0.0
    if hits["max_score"] != nil {
        maxScore = hits["max_score"].(float64)
    }
    
    hitsList := hits["hits"].([]interface{})
    var documents []map[string]interface{}
    
    for _, hit := range hitsList {
        hitMap := hit.(map[string]interface{})
        doc := hitMap["_source"].(map[string]interface{})
        
        // 添加元数据
        doc["_id"] = hitMap["_id"]
        doc["_score"] = hitMap["_score"]
        
        // 添加高亮
        if highlight, ok := hitMap["highlight"]; ok {
            doc["_highlight"] = highlight
        }
        
        documents = append(documents, doc)
    }
    
    return &SearchResult{
        Total:    int64(total),
        Hits:     documents,
        MaxScore: maxScore,
        TimeTook: int(response["took"].(float64)),
    }
}

// 聚合搜索
func (sm *SearchManager) Aggregate(ctx context.Context, indexName string, aggregations map[string]interface{}) (map[string]interface{}, error) {
    query := map[string]interface{}{
        "size": 0,
        "aggs": aggregations,
    }
    
    queryJSON, err := json.Marshal(query)
    if err != nil {
        return nil, fmt.Errorf("序列化聚合查询失败: %w", err)
    }
    
    req := esapi.SearchRequest{
        Index: []string{indexName},
        Body:  strings.NewReader(string(queryJSON)),
    }
    
    res, err := req.Do(ctx, sm.client.client)
    if err != nil {
        return nil, fmt.Errorf("聚合查询失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return nil, fmt.Errorf("聚合查询错误: %s", res.String())
    }
    
    var response map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
        return nil, fmt.Errorf("解析聚合响应失败: %w", err)
    }
    
    return response["aggregations"].(map[string]interface{}), nil
}

// 建议搜索
func (sm *SearchManager) Suggest(ctx context.Context, indexName, text string, fields []string) ([]string, error) {
    suggest := map[string]interface{}{
        "text": text,
        "completion_suggest": map[string]interface{}{
            "completion": map[string]interface{}{
                "field": "suggest",
                "size":  10,
            },
        },
    }
    
    query := map[string]interface{}{
        "suggest": suggest,
    }
    
    queryJSON, err := json.Marshal(query)
    if err != nil {
        return nil, fmt.Errorf("序列化建议查询失败: %w", err)
    }
    
    req := esapi.SearchRequest{
        Index: []string{indexName},
        Body:  strings.NewReader(string(queryJSON)),
    }
    
    res, err := req.Do(ctx, sm.client.client)
    if err != nil {
        return nil, fmt.Errorf("建议查询失败: %w", err)
    }
    defer res.Body.Close()
    
    if res.IsError() {
        return nil, fmt.Errorf("建议查询错误: %s", res.String())
    }
    
    var response map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
        return nil, fmt.Errorf("解析建议响应失败: %w", err)
    }
    
    // 提取建议结果
    var suggestions []string
    if suggest, ok := response["suggest"]; ok {
        if completionSuggest, ok := suggest.(map[string]interface{})["completion_suggest"]; ok {
            for _, suggestion := range completionSuggest.([]interface{}) {
                suggestionMap := suggestion.(map[string]interface{})
                if options, ok := suggestionMap["options"]; ok {
                    for _, option := range options.([]interface{}) {
                        optionMap := option.(map[string]interface{})
                        suggestions = append(suggestions, optionMap["text"].(string))
                    }
                }
            }
        }
    }
    
    return suggestions, nil
}
```

## 4. 实践练习

### 练习1：构建搜索引擎
```go
// 实现一个综合搜索引擎
type SearchEngine struct {
    mongo  *MongoClient
    redis  *RedisClient
    elastic *ElasticsearchClient
}

func (se *SearchEngine) IndexPost(ctx context.Context, post *Post) error {
    // 1. 保存到MongoDB
    // 2. 缓存到Redis
    // 3. 索引到Elasticsearch
    return nil
}

func (se *SearchEngine) Search(ctx context.Context, query string) (*SearchResult, error) {
    // 1. 先从Redis缓存查找
    // 2. 从Elasticsearch搜索
    // 3. 从MongoDB获取完整数据
    return nil, nil
}
```

### 练习2：实现分布式会话存储
```go
// 使用Redis实现分布式会话
type SessionStore struct {
    redis *RedisClient
    ttl   time.Duration
}

func (ss *SessionStore) Create(ctx context.Context, sessionID string, data map[string]interface{}) error {
    // 实现会话创建
    return nil
}

func (ss *SessionStore) Get(ctx context.Context, sessionID string) (map[string]interface{}, error) {
    // 实现会话获取
    return nil, nil
}
```

### 练习3：实现实时数据分析
```go
// 使用MongoDB聚合实现实时分析
type AnalyticsService struct {
    mongo *MongoClient
    redis *RedisClient
}

func (as *AnalyticsService) GetRealTimeStats(ctx context.Context) (*AnalyticsData, error) {
    // 实现实时数据统计
    return nil, nil
}

func (as *AnalyticsService) UpdateMetrics(ctx context.Context, event *AnalyticsEvent) error {
    // 实现指标更新
    return nil
}
```

## 5. 参考资料

- [MongoDB Go Driver文档](https://pkg.go.dev/go.mongodb.org/mongo-driver)
- [Redis Go客户端文档](https://redis.uptrace.dev/)
- [Elasticsearch Go客户端文档](https://pkg.go.dev/github.com/elastic/go-elasticsearch/v8)
- [NoSQL数据库设计模式](https://docs.mongodb.com/manual/data-modeling/)

---

通过本章的学习，你将掌握主流NoSQL数据库的使用方法，能够根据不同的应用场景选择合适的数据存储方案。