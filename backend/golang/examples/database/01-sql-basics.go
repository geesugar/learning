// 01-sql-basics.go
// 演示Go语言的SQL数据库基础操作

package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"

    _ "github.com/mattn/go-sqlite3"
)

// 用户结构体
type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

// 文章结构体
type Article struct {
    ID        int       `json:"id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    UserID    int       `json:"user_id"`
    CreatedAt time.Time `json:"created_at"`
}

func main() {
    // 连接数据库
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // 测试连接
    if err := db.Ping(); err != nil {
        log.Fatal("Failed to ping database:", err)
    }
    
    fmt.Println("=== SQL数据库基础操作演示 ===")
    
    // 1. 创建表
    fmt.Println("\n1. 创建表...")
    createTables(db)
    
    // 2. 插入数据
    fmt.Println("\n2. 插入数据...")
    insertData(db)
    
    // 3. 查询数据
    fmt.Println("\n3. 查询数据...")
    queryData(db)
    
    // 4. 更新数据
    fmt.Println("\n4. 更新数据...")
    updateData(db)
    
    // 5. 删除数据
    fmt.Println("\n5. 删除数据...")
    deleteData(db)
    
    // 6. 事务处理
    fmt.Println("\n6. 事务处理...")
    transactionDemo(db)
    
    // 7. 预处理语句
    fmt.Println("\n7. 预处理语句...")
    preparedStatementDemo(db)
    
    // 8. 连接池设置
    fmt.Println("\n8. 连接池设置...")
    connectionPoolDemo(db)
    
    // 9. 关联查询
    fmt.Println("\n9. 关联查询...")
    joinQueryDemo(db)
    
    // 10. 批量操作
    fmt.Println("\n10. 批量操作...")
    batchOperationDemo(db)
}

// 创建表
func createTables(db *sql.DB) {
    // 创建用户表
    userTableSQL := `
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
    
    if _, err := db.Exec(userTableSQL); err != nil {
        log.Fatal("Failed to create users table:", err)
    }
    
    // 创建文章表
    articleTableSQL := `
    CREATE TABLE articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );`
    
    if _, err := db.Exec(articleTableSQL); err != nil {
        log.Fatal("Failed to create articles table:", err)
    }
    
    fmt.Println("✓ 表创建成功")
}

// 插入数据
func insertData(db *sql.DB) {
    // 插入用户
    users := []User{
        {Name: "Alice", Email: "alice@example.com"},
        {Name: "Bob", Email: "bob@example.com"},
        {Name: "Charlie", Email: "charlie@example.com"},
    }
    
    for _, user := range users {
        result, err := db.Exec(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            user.Name, user.Email,
        )
        if err != nil {
            log.Printf("Failed to insert user %s: %v", user.Name, err)
            continue
        }
        
        id, _ := result.LastInsertId()
        fmt.Printf("✓ 插入用户: %s (ID: %d)\n", user.Name, id)
    }
    
    // 插入文章
    articles := []Article{
        {Title: "Go语言入门", Content: "Go是一门现代编程语言...", UserID: 1},
        {Title: "数据库设计", Content: "数据库设计的基本原则...", UserID: 1},
        {Title: "HTTP服务器", Content: "如何构建HTTP服务器...", UserID: 2},
        {Title: "并发编程", Content: "Go的并发模型...", UserID: 3},
    }
    
    for _, article := range articles {
        result, err := db.Exec(
            "INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)",
            article.Title, article.Content, article.UserID,
        )
        if err != nil {
            log.Printf("Failed to insert article %s: %v", article.Title, err)
            continue
        }
        
        id, _ := result.LastInsertId()
        fmt.Printf("✓ 插入文章: %s (ID: %d)\n", article.Title, id)
    }
}

// 查询数据
func queryData(db *sql.DB) {
    // 查询所有用户
    fmt.Println("\n查询所有用户:")
    rows, err := db.Query("SELECT id, name, email, created_at FROM users")
    if err != nil {
        log.Fatal("Failed to query users:", err)
    }
    defer rows.Close()
    
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt); err != nil {
            log.Printf("Failed to scan user: %v", err)
            continue
        }
        fmt.Printf("  用户: %+v\n", user)
    }
    
    // 查询特定用户
    fmt.Println("\n查询特定用户 (ID=1):")
    var user User
    err = db.QueryRow("SELECT id, name, email, created_at FROM users WHERE id = ?", 1).
        Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt)
    if err != nil {
        log.Printf("Failed to query user: %v", err)
    } else {
        fmt.Printf("  用户: %+v\n", user)
    }
    
    // 查询文章数量
    fmt.Println("\n查询文章数量:")
    var count int
    err = db.QueryRow("SELECT COUNT(*) FROM articles").Scan(&count)
    if err != nil {
        log.Printf("Failed to count articles: %v", err)
    } else {
        fmt.Printf("  文章总数: %d\n", count)
    }
}

// 更新数据
func updateData(db *sql.DB) {
    // 更新用户邮箱
    result, err := db.Exec(
        "UPDATE users SET email = ? WHERE id = ?",
        "alice.new@example.com", 1,
    )
    if err != nil {
        log.Printf("Failed to update user: %v", err)
        return
    }
    
    rowsAffected, _ := result.RowsAffected()
    fmt.Printf("✓ 更新用户邮箱，影响行数: %d\n", rowsAffected)
    
    // 更新文章标题
    result, err = db.Exec(
        "UPDATE articles SET title = ? WHERE id = ?",
        "Go语言进阶教程", 1,
    )
    if err != nil {
        log.Printf("Failed to update article: %v", err)
        return
    }
    
    rowsAffected, _ = result.RowsAffected()
    fmt.Printf("✓ 更新文章标题，影响行数: %d\n", rowsAffected)
}

// 删除数据
func deleteData(db *sql.DB) {
    // 删除特定文章
    result, err := db.Exec("DELETE FROM articles WHERE id = ?", 4)
    if err != nil {
        log.Printf("Failed to delete article: %v", err)
        return
    }
    
    rowsAffected, _ := result.RowsAffected()
    fmt.Printf("✓ 删除文章，影响行数: %d\n", rowsAffected)
    
    // 删除特定用户（会因为外键约束可能失败）
    result, err = db.Exec("DELETE FROM users WHERE id = ?", 3)
    if err != nil {
        log.Printf("Failed to delete user: %v", err)
    } else {
        rowsAffected, _ := result.RowsAffected()
        fmt.Printf("✓ 删除用户，影响行数: %d\n", rowsAffected)
    }
}

// 事务处理
func transactionDemo(db *sql.DB) {
    // 开始事务
    tx, err := db.Begin()
    if err != nil {
        log.Printf("Failed to begin transaction: %v", err)
        return
    }
    
    // 使用defer确保事务会被处理
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            log.Printf("Transaction rolled back due to panic: %v", r)
        }
    }()
    
    // 在事务中插入用户
    result, err := tx.Exec(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        "David", "david@example.com",
    )
    if err != nil {
        tx.Rollback()
        log.Printf("Failed to insert user in transaction: %v", err)
        return
    }
    
    userID, _ := result.LastInsertId()
    fmt.Printf("✓ 事务中插入用户 (ID: %d)\n", userID)
    
    // 在事务中插入文章
    _, err = tx.Exec(
        "INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)",
        "事务测试文章", "这是一篇在事务中创建的文章", userID,
    )
    if err != nil {
        tx.Rollback()
        log.Printf("Failed to insert article in transaction: %v", err)
        return
    }
    
    fmt.Println("✓ 事务中插入文章")
    
    // 提交事务
    if err := tx.Commit(); err != nil {
        log.Printf("Failed to commit transaction: %v", err)
        return
    }
    
    fmt.Println("✓ 事务提交成功")
}

// 预处理语句演示
func preparedStatementDemo(db *sql.DB) {
    // 准备插入语句
    stmt, err := db.Prepare("INSERT INTO users (name, email) VALUES (?, ?)")
    if err != nil {
        log.Printf("Failed to prepare statement: %v", err)
        return
    }
    defer stmt.Close()
    
    // 使用预处理语句插入多个用户
    users := []User{
        {Name: "Eve", Email: "eve@example.com"},
        {Name: "Frank", Email: "frank@example.com"},
    }
    
    for _, user := range users {
        result, err := stmt.Exec(user.Name, user.Email)
        if err != nil {
            log.Printf("Failed to execute prepared statement: %v", err)
            continue
        }
        
        id, _ := result.LastInsertId()
        fmt.Printf("✓ 预处理语句插入用户: %s (ID: %d)\n", user.Name, id)
    }
    
    // 准备查询语句
    queryStmt, err := db.Prepare("SELECT id, name, email FROM users WHERE name LIKE ?")
    if err != nil {
        log.Printf("Failed to prepare query statement: %v", err)
        return
    }
    defer queryStmt.Close()
    
    // 使用预处理语句查询
    rows, err := queryStmt.Query("%e%")
    if err != nil {
        log.Printf("Failed to execute query statement: %v", err)
        return
    }
    defer rows.Close()
    
    fmt.Println("✓ 预处理语句查询结果:")
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
            log.Printf("Failed to scan user: %v", err)
            continue
        }
        fmt.Printf("  用户: %+v\n", user)
    }
}

// 连接池设置
func connectionPoolDemo(db *sql.DB) {
    // 设置连接池参数
    db.SetMaxOpenConns(25)                 // 最大打开连接数
    db.SetMaxIdleConns(5)                  // 最大空闲连接数
    db.SetConnMaxLifetime(5 * time.Minute) // 连接最大生命周期
    
    // 获取连接池状态
    stats := db.Stats()
    fmt.Printf("✓ 连接池状态:\n")
    fmt.Printf("  打开连接数: %d\n", stats.OpenConnections)
    fmt.Printf("  使用中连接数: %d\n", stats.InUse)
    fmt.Printf("  空闲连接数: %d\n", stats.Idle)
    fmt.Printf("  等待连接数: %d\n", stats.WaitCount)
    fmt.Printf("  等待时间: %v\n", stats.WaitDuration)
    fmt.Printf("  最大打开连接数: %d\n", stats.MaxOpenConnections)
    fmt.Printf("  最大空闲连接数: %d\n", stats.MaxIdleConnections)
    fmt.Printf("  最大生命周期: %v\n", stats.MaxLifetime)
}

// 关联查询演示
func joinQueryDemo(db *sql.DB) {
    // 用户和文章的关联查询
    query := `
    SELECT u.id, u.name, u.email, a.id, a.title, a.content
    FROM users u
    LEFT JOIN articles a ON u.id = a.user_id
    ORDER BY u.id, a.id
    `
    
    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Failed to execute join query: %v", err)
        return
    }
    defer rows.Close()
    
    fmt.Println("✓ 关联查询结果:")
    for rows.Next() {
        var userID, articleID sql.NullInt64
        var userName, userEmail, articleTitle, articleContent sql.NullString
        
        err := rows.Scan(&userID, &userName, &userEmail, &articleID, &articleTitle, &articleContent)
        if err != nil {
            log.Printf("Failed to scan join result: %v", err)
            continue
        }
        
        fmt.Printf("  用户: %s (%s)", userName.String, userEmail.String)
        if articleID.Valid {
            fmt.Printf(" -> 文章: %s", articleTitle.String)
        } else {
            fmt.Printf(" -> 暂无文章")
        }
        fmt.Println()
    }
    
    // 聚合查询
    fmt.Println("\n✓ 聚合查询 - 每个用户的文章数:")
    aggregateQuery := `
    SELECT u.name, COUNT(a.id) as article_count
    FROM users u
    LEFT JOIN articles a ON u.id = a.user_id
    GROUP BY u.id, u.name
    ORDER BY article_count DESC
    `
    
    rows, err = db.Query(aggregateQuery)
    if err != nil {
        log.Printf("Failed to execute aggregate query: %v", err)
        return
    }
    defer rows.Close()
    
    for rows.Next() {
        var userName string
        var articleCount int
        
        if err := rows.Scan(&userName, &articleCount); err != nil {
            log.Printf("Failed to scan aggregate result: %v", err)
            continue
        }
        
        fmt.Printf("  %s: %d篇文章\n", userName, articleCount)
    }
}

// 批量操作演示
func batchOperationDemo(db *sql.DB) {
    // 批量插入用户
    tx, err := db.Begin()
    if err != nil {
        log.Printf("Failed to begin transaction: %v", err)
        return
    }
    defer tx.Rollback()
    
    stmt, err := tx.Prepare("INSERT INTO users (name, email) VALUES (?, ?)")
    if err != nil {
        log.Printf("Failed to prepare statement: %v", err)
        return
    }
    defer stmt.Close()
    
    batchUsers := []User{
        {Name: "Grace", Email: "grace@example.com"},
        {Name: "Henry", Email: "henry@example.com"},
        {Name: "Ivy", Email: "ivy@example.com"},
    }
    
    fmt.Println("✓ 批量插入用户:")
    for _, user := range batchUsers {
        result, err := stmt.Exec(user.Name, user.Email)
        if err != nil {
            log.Printf("Failed to insert user in batch: %v", err)
            continue
        }
        
        id, _ := result.LastInsertId()
        fmt.Printf("  插入用户: %s (ID: %d)\n", user.Name, id)
    }
    
    if err := tx.Commit(); err != nil {
        log.Printf("Failed to commit batch transaction: %v", err)
        return
    }
    
    fmt.Println("✓ 批量操作提交成功")
    
    // 批量更新
    fmt.Println("\n✓ 批量更新用户邮箱域名:")
    result, err := db.Exec("UPDATE users SET email = REPLACE(email, 'example.com', 'newdomain.com') WHERE email LIKE '%example.com'")
    if err != nil {
        log.Printf("Failed to batch update: %v", err)
        return
    }
    
    rowsAffected, _ := result.RowsAffected()
    fmt.Printf("  影响行数: %d\n", rowsAffected)
}