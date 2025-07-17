# 12-Web开发

## 本章概述

Web开发是Rust的重要应用领域之一。得益于Rust的安全性和性能，越来越多的开发者选择Rust来构建高性能的Web应用。本章将介绍Rust Web开发的核心概念、主要框架和实践技巧。

## 学习目标

- 理解Rust Web开发的生态系统
- 掌握主流Web框架的使用
- 学会构建RESTful API
- 理解异步Web编程
- 掌握数据库集成和ORM使用
- 学会Web安全最佳实践

## 章节内容

### [01-Web开发基础](01-web-basics.md)
- HTTP协议基础
- Web服务器架构
- 异步编程在Web开发中的应用
- 中间件概念

### [02-Actix-web框架](02-actix-web.md)
- Actix-web简介和安装
- 路由系统
- 请求处理和响应
- 中间件开发

### [03-Axum框架](03-axum.md)
- Axum简介和特性
- 处理器和提取器
- 路由组合
- 状态管理

### [04-Rocket框架](04-rocket.md)
- Rocket的特性和优势
- 路由宏和类型安全
- 请求保护
- 模板引擎

### [05-数据库集成](05-database.md)
- 数据库连接和连接池
- SQL查询和参数化
- ORM框架（Diesel, SQLx）
- 数据库迁移

### [06-认证与授权](06-auth.md)
- 用户认证机制
- JWT令牌处理
- 会话管理
- 权限控制

### [07-Web安全](07-security.md)
- CORS配置
- CSRF防护
- 输入验证和清理
- HTTPS配置

### [08-部署与监控](08-deployment.md)
- 容器化部署
- 性能监控
- 日志记录
- 负载均衡

## 核心概念

### Web框架选择

Rust有多个优秀的Web框架，各有特色：

#### Actix-web
- **特点**: 高性能，基于Actor模型
- **优势**: 成熟稳定，生态丰富
- **适用场景**: 高并发API服务

```rust
use actix_web::{web, App, HttpServer, HttpResponse, Result};

async fn hello() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json("Hello, World!"))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/hello", web::get().to(hello))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

#### Axum
- **特点**: 现代化设计，类型安全
- **优势**: 基于tokio，与生态系统集成好
- **适用场景**: 现代Web应用

```rust
use axum::{
    routing::get,
    http::StatusCode,
    Json, Router,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    content: String,
}

async fn hello() -> (StatusCode, Json<Message>) {
    (
        StatusCode::OK,
        Json(Message {
            content: "Hello, World!".to_string(),
        }),
    )
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/hello", get(hello));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

#### Rocket
- **特点**: 宏驱动，类型安全
- **优势**: 开发体验好，编译时检查
- **适用场景**: 快速原型开发

```rust
#[macro_use] extern crate rocket;

use rocket::serde::{Deserialize, Serialize, json::Json};

#[derive(Serialize, Deserialize)]
struct Message {
    content: String,
}

#[get("/hello")]
fn hello() -> Json<Message> {
    Json(Message {
        content: "Hello, World!".to_string(),
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![hello])
}
```

### RESTful API设计

#### 标准的CRUD操作

```rust
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post, put, delete},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

#[derive(Deserialize)]
struct UpdateUser {
    name: Option<String>,
    email: Option<String>,
}

#[derive(Deserialize)]
struct UserQuery {
    page: Option<u32>,
    limit: Option<u32>,
}

type UserStore = Arc<Mutex<HashMap<u32, User>>>;

async fn get_users(
    Query(query): Query<UserQuery>,
    State(store): State<UserStore>,
) -> Json<Vec<User>> {
    let users = store.lock().unwrap();
    let mut result: Vec<User> = users.values().cloned().collect();
    
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(10);
    let start = ((page - 1) * limit) as usize;
    let end = (start + limit as usize).min(result.len());
    
    if start < result.len() {
        result = result[start..end].to_vec();
    } else {
        result.clear();
    }
    
    Json(result)
}

async fn get_user(
    Path(id): Path<u32>,
    State(store): State<UserStore>,
) -> Result<Json<User>, StatusCode> {
    let users = store.lock().unwrap();
    
    match users.get(&id) {
        Some(user) => Ok(Json(user.clone())),
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn create_user(
    State(store): State<UserStore>,
    Json(create_user): Json<CreateUser>,
) -> (StatusCode, Json<User>) {
    let mut users = store.lock().unwrap();
    let id = users.len() as u32 + 1;
    
    let user = User {
        id,
        name: create_user.name,
        email: create_user.email,
    };
    
    users.insert(id, user.clone());
    
    (StatusCode::CREATED, Json(user))
}

async fn update_user(
    Path(id): Path<u32>,
    State(store): State<UserStore>,
    Json(update_user): Json<UpdateUser>,
) -> Result<Json<User>, StatusCode> {
    let mut users = store.lock().unwrap();
    
    match users.get_mut(&id) {
        Some(user) => {
            if let Some(name) = update_user.name {
                user.name = name;
            }
            if let Some(email) = update_user.email {
                user.email = email;
            }
            Ok(Json(user.clone()))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn delete_user(
    Path(id): Path<u32>,
    State(store): State<UserStore>,
) -> StatusCode {
    let mut users = store.lock().unwrap();
    
    match users.remove(&id) {
        Some(_) => StatusCode::NO_CONTENT,
        None => StatusCode::NOT_FOUND,
    }
}

#[tokio::main]
async fn main() {
    let store = Arc::new(Mutex::new(HashMap::new()));
    
    let app = Router::new()
        .route("/users", get(get_users).post(create_user))
        .route("/users/:id", get(get_user).put(update_user).delete(delete_user))
        .with_state(store);
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Server running on http://localhost:8080");
    axum::serve(listener, app).await.unwrap();
}
```

### 中间件系统

中间件是Web应用的重要组成部分，用于处理横切关注点：

```rust
use axum::{
    body::Body,
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::get,
    Router,
};
use std::time::Instant;

// 日志中间件
async fn logging_middleware(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let start = Instant::now();
    let method = request.method().clone();
    let uri = request.uri().clone();
    
    let response = next.run(request).await;
    
    let duration = start.elapsed();
    println!("{} {} - {} - {:?}", 
        method, uri, response.status(), duration);
    
    Ok(response)
}

// 认证中间件
async fn auth_middleware(
    headers: HeaderMap,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // 检查Authorization头
    if let Some(auth_header) = headers.get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                if validate_token(token) {
                    return Ok(next.run(request).await);
                }
            }
        }
    }
    
    Err(StatusCode::UNAUTHORIZED)
}

fn validate_token(token: &str) -> bool {
    // 简单的令牌验证逻辑
    token == "valid-token"
}

async fn protected_handler() -> &'static str {
    "This is a protected endpoint"
}

async fn public_handler() -> &'static str {
    "This is a public endpoint"
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/public", get(public_handler))
        .route("/protected", get(protected_handler)
            .layer(middleware::from_fn(auth_middleware)))
        .layer(middleware::from_fn(logging_middleware));
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

### 数据库集成

#### 使用SQLx进行数据库操作

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, FromRow};

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct User {
    id: i32,
    name: String,
    email: String,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

async fn get_users(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<User>>, StatusCode> {
    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(users))
}

async fn get_user(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<User>, StatusCode> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    
    Ok(Json(user))
}

async fn create_user(
    State(pool): State<PgPool>,
    Json(create_user): Json<CreateUser>,
) -> Result<(StatusCode, Json<User>), StatusCode> {
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *"
    )
    .bind(&create_user.name)
    .bind(&create_user.email)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::CREATED, Json(user)))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 连接数据库
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://user:password@localhost/dbname".to_string());
    
    let pool = PgPool::connect(&database_url).await?;
    
    // 运行迁移
    sqlx::migrate!().run(&pool).await?;
    
    let app = Router::new()
        .route("/users", get(get_users).post(create_user))
        .route("/users/:id", get(get_user))
        .with_state(pool);
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Server running on http://localhost:8080");
    axum::serve(listener, app).await.unwrap();
    
    Ok(())
}
```

### 错误处理

Web应用需要优雅的错误处理机制：

```rust
use axum::{
    extract::rejection::JsonRejection,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("验证错误: {0}")]
    Validation(String),
    
    #[error("未找到资源")]
    NotFound,
    
    #[error("未授权访问")]
    Unauthorized,
    
    #[error("JSON解析错误: {0}")]
    JsonParse(#[from] JsonRejection),
    
    #[error("内部服务器错误")]
    InternalServer,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_type, message) = match self {
            AppError::Database(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "database_error",
                "数据库操作失败",
            ),
            AppError::Validation(msg) => (
                StatusCode::BAD_REQUEST,
                "validation_error",
                msg.as_str(),
            ),
            AppError::NotFound => (
                StatusCode::NOT_FOUND,
                "not_found",
                "资源未找到",
            ),
            AppError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "未授权访问",
            ),
            AppError::JsonParse(_) => (
                StatusCode::BAD_REQUEST,
                "json_parse_error",
                "JSON格式错误",
            ),
            AppError::InternalServer => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal_server_error",
                "内部服务器错误",
            ),
        };
        
        let body = Json(ErrorResponse {
            error: error_type.to_string(),
            message: message.to_string(),
        });
        
        (status, body).into_response()
    }
}

// 使用自定义错误类型
async fn validate_user(user: &CreateUser) -> Result<(), AppError> {
    if user.name.is_empty() {
        return Err(AppError::Validation("用户名不能为空".to_string()));
    }
    
    if !user.email.contains('@') {
        return Err(AppError::Validation("邮箱格式不正确".to_string()));
    }
    
    Ok(())
}
```

## 实战项目：博客系统

### 项目结构

```
blog-system/
├── Cargo.toml
├── migrations/
│   └── 001_create_tables.sql
├── src/
│   ├── main.rs
│   ├── config.rs
│   ├── models/
│   │   ├── mod.rs
│   │   ├── user.rs
│   │   └── post.rs
│   ├── handlers/
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── user.rs
│   │   └── post.rs
│   ├── middleware/
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   └── logging.rs
│   └── database.rs
└── static/
    └── index.html
```

### 核心功能实现

```rust
// src/models/post.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub content: String,
    pub author_id: i32,
    pub published: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePost {
    pub title: String,
    pub content: String,
    pub published: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePost {
    pub title: Option<String>,
    pub content: Option<String>,
    pub published: Option<bool>,
}

// src/handlers/post.rs
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    Extension,
};
use sqlx::PgPool;
use crate::models::post::{Post, CreatePost, UpdatePost};
use crate::models::user::User;
use crate::AppError;

pub async fn get_posts(
    Query(params): Query<HashMap<String, String>>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Post>>, AppError> {
    let page: i64 = params.get("page").unwrap_or(&"1".to_string()).parse().unwrap_or(1);
    let limit: i64 = params.get("limit").unwrap_or(&"10".to_string()).parse().unwrap_or(10);
    let offset = (page - 1) * limit;
    
    let posts = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE published = true ORDER BY created_at DESC LIMIT $1 OFFSET $2"
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&pool)
    .await?;
    
    Ok(Json(posts))
}

pub async fn get_post(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Post>, AppError> {
    let post = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE id = $1 AND published = true"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|_| AppError::NotFound)?;
    
    Ok(Json(post))
}

pub async fn create_post(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(create_post): Json<CreatePost>,
) -> Result<(StatusCode, Json<Post>), AppError> {
    let post = sqlx::query_as::<_, Post>(
        "INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(&create_post.title)
    .bind(&create_post.content)
    .bind(user.id)
    .bind(create_post.published.unwrap_or(false))
    .fetch_one(&pool)
    .await?;
    
    Ok((StatusCode::CREATED, Json(post)))
}

pub async fn update_post(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(update_post): Json<UpdatePost>,
) -> Result<Json<Post>, AppError> {
    // 检查文章是否属于当前用户
    let existing_post = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE id = $1 AND author_id = $2"
    )
    .bind(id)
    .bind(user.id)
    .fetch_one(&pool)
    .await
    .map_err(|_| AppError::NotFound)?;
    
    let post = sqlx::query_as::<_, Post>(
        "UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), 
         published = COALESCE($3, published), updated_at = NOW() 
         WHERE id = $4 RETURNING *"
    )
    .bind(&update_post.title)
    .bind(&update_post.content)
    .bind(&update_post.published)
    .bind(id)
    .fetch_one(&pool)
    .await?;
    
    Ok(Json(post))
}

pub async fn delete_post(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query!(
        "DELETE FROM posts WHERE id = $1 AND author_id = $2"
    )
    .bind(id)
    .bind(user.id)
    .execute(&pool)
    .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    
    Ok(StatusCode::NO_CONTENT)
}
```

## 总结

Rust Web开发具有以下优势：

1. **高性能**：零成本抽象和高效的内存管理
2. **安全性**：编译时检查避免常见的安全漏洞
3. **并发性**：优秀的异步编程支持
4. **生态系统**：丰富的库和工具支持
5. **类型安全**：强类型系统减少运行时错误

通过本章的学习，你应该能够：
- 选择合适的Web框架
- 构建RESTful API
- 集成数据库操作
- 实现认证和授权
- 处理错误和异常
- 部署和监控应用

## 下一步

完成本章学习后，建议：
1. 实践构建完整的Web应用
2. 学习微服务架构
3. 深入研究性能优化
4. 了解云原生部署方案

## 下一步

完成本章学习后，请继续学习 [13-数据库操作](../13-数据库操作/README.md)。