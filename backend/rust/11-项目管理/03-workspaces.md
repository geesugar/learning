# 03-工作空间

## 工作空间概述

Cargo 工作空间（Workspace）是管理多个相关 Rust 包的强大机制。它允许你在一个版本控制仓库中管理多个包，共享依赖、构建配置和其他设置，提高开发效率和代码复用。

## 工作空间概念和结构

### 基本概念

```
workspace/
├── Cargo.toml          # 工作空间根配置文件
├── Cargo.lock          # 共享的依赖锁定文件
├── target/             # 共享的构建目录
├── core/               # 核心库包
│   ├── Cargo.toml
│   └── src/
├── cli/                # 命令行工具包
│   ├── Cargo.toml
│   └── src/
├── web-api/            # Web API 包
│   ├── Cargo.toml
│   └── src/
└── shared/             # 共享类型包
    ├── Cargo.toml
    └── src/
```

### 工作空间根配置

```toml
# workspace/Cargo.toml
[workspace]
# 指定成员包
members = [
    "core",
    "cli", 
    "web-api",
    "shared",
    "tools/*",        # 通配符匹配
]

# 排除特定目录
exclude = [
    "experiments",
    "legacy",
    "third-party/*",
]

# 依赖解析器版本
resolver = "2"

# 工作空间级别的依赖
[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
thiserror = "1.0"
clap = { version = "4.0", features = ["derive"] }

# 内部包依赖声明
core = { path = "core" }
shared = { path = "shared" }

# 工作空间级别的元数据
[workspace.metadata]
rust-version = "1.70"
authors = ["Team <team@company.com>"]
license = "MIT OR Apache-2.0"
repository = "https://github.com/company/project"

# 统一的构建配置
[workspace.profile.dev]
debug = true
opt-level = 0
incremental = true

[workspace.profile.release]
debug = false
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

## 成员包管理

### 核心库包示例

```toml
# core/Cargo.toml
[package]
name = "myapp-core"
version = "0.1.0"
edition = "2021"
description = "Core business logic for MyApp"

[dependencies]
# 使用工作空间依赖
serde = { workspace = true }
anyhow = { workspace = true }
thiserror = { workspace = true }

# 内部依赖
shared = { workspace = true }

# 包特定依赖
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }

[features]
default = []
async = ["tokio"]
database = ["sqlx"]

# 可选依赖
[dependencies.tokio]
workspace = true
optional = true

[dependencies.sqlx]
version = "0.7"
features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono"]
optional = true
```

```rust
// core/src/lib.rs
//! MyApp 核心业务逻辑库

pub mod models;
pub mod services;
pub mod repositories;
pub mod errors;

// 重新导出重要类型
pub use models::*;
pub use services::*;
pub use errors::*;

// core/src/models.rs
use serde::{Deserialize, Serialize};
use shared::Id;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Id,
    pub username: String,
    pub email: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: Id,
    pub title: String,
    pub description: String,
    pub completed: bool,
    pub user_id: Id,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

// core/src/services.rs
use crate::{User, Task, AppError, AppResult};
use shared::Id;

pub struct UserService<R> {
    repository: R,
}

impl<R> UserService<R>
where
    R: UserRepository,
{
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn create_user(&self, username: String, email: String) -> AppResult<User> {
        let user = User {
            id: Id::new(),
            username,
            email,
            created_at: chrono::Utc::now(),
        };

        self.repository.create(user).await
    }

    pub async fn get_user(&self, id: Id) -> AppResult<Option<User>> {
        self.repository.get(id).await
    }
}

// 抽象仓储接口
#[async_trait::async_trait]
pub trait UserRepository {
    async fn create(&self, user: User) -> AppResult<User>;
    async fn get(&self, id: Id) -> AppResult<Option<User>>;
    async fn update(&self, user: User) -> AppResult<User>;
    async fn delete(&self, id: Id) -> AppResult<()>;
}
```

### 共享类型包

```toml
# shared/Cargo.toml
[package]
name = "myapp-shared"
version = "0.1.0"
edition = "2021"
description = "Shared types and utilities for MyApp"

[dependencies]
serde = { workspace = true }
uuid = { version = "1.0", features = ["v4", "serde"] }
```

```rust
// shared/src/lib.rs
//! 共享类型和工具

use serde::{Deserialize, Serialize};
use std::fmt;

/// 通用 ID 类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Id(uuid::Uuid);

impl Id {
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4())
    }

    pub fn from_string(s: &str) -> Result<Self, uuid::Error> {
        Ok(Self(uuid::Uuid::parse_str(s)?))
    }
}

impl fmt::Display for Id {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl Default for Id {
    fn default() -> Self {
        Self::new()
    }
}

/// 分页参数
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: u32,
    pub per_page: u32,
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: 1,
            per_page: 20,
        }
    }
}

/// 分页响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PagedResponse<T> {
    pub items: Vec<T>,
    pub total: u64,
    pub page: u32,
    pub per_page: u32,
    pub total_pages: u32,
}

/// API 响应包装
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}
```

### CLI 工具包

```toml
# cli/Cargo.toml
[package]
name = "myapp-cli"
version = "0.1.0"
edition = "2021"
description = "Command line interface for MyApp"

[[bin]]
name = "myapp"
path = "src/main.rs"

[dependencies]
# 工作空间依赖
clap = { workspace = true }
anyhow = { workspace = true }
tokio = { workspace = true }

# 内部依赖
core = { workspace = true, features = ["async"] }
shared = { workspace = true }

# CLI 特定依赖
console = "0.15"
indicatif = "0.17"
colored = "2.0"
```

```rust
// cli/src/main.rs
use anyhow::Result;
use clap::{Parser, Subcommand};
use myapp_core::{UserService, User};
use myapp_shared::Id;

#[derive(Parser)]
#[command(name = "myapp")]
#[command(about = "MyApp command line interface")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    User {
        #[command(subcommand)]
        action: UserAction,
    },
    Task {
        #[command(subcommand)]
        action: TaskAction,
    },
}

#[derive(Subcommand)]
enum UserAction {
    Create {
        #[arg(short, long)]
        username: String,
        #[arg(short, long)]
        email: String,
    },
    Get {
        #[arg(short, long)]
        id: String,
    },
    List,
}

#[derive(Subcommand)]
enum TaskAction {
    Create {
        #[arg(short, long)]
        title: String,
        #[arg(short, long)]
        description: String,
        #[arg(short, long)]
        user_id: String,
    },
    List {
        #[arg(short, long)]
        user_id: Option<String>,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::User { action } => handle_user_action(action).await?,
        Commands::Task { action } => handle_task_action(action).await?,
    }

    Ok(())
}

async fn handle_user_action(action: UserAction) -> Result<()> {
    // 创建用户服务（这里使用内存实现）
    let repository = MemoryUserRepository::new();
    let service = UserService::new(repository);

    match action {
        UserAction::Create { username, email } => {
            let user = service.create_user(username, email).await?;
            println!("Created user: {} ({})", user.username, user.id);
        }
        UserAction::Get { id } => {
            let id = Id::from_string(&id)?;
            if let Some(user) = service.get_user(id).await? {
                println!("User: {} <{}> ({})", user.username, user.email, user.id);
            } else {
                println!("User not found");
            }
        }
        UserAction::List => {
            println!("Listing users...");
            // 实现用户列表功能
        }
    }

    Ok(())
}

async fn handle_task_action(action: TaskAction) -> Result<()> {
    match action {
        TaskAction::Create { title, description, user_id } => {
            println!("Creating task: {} for user {}", title, user_id);
        }
        TaskAction::List { user_id } => {
            if let Some(user_id) = user_id {
                println!("Listing tasks for user: {}", user_id);
            } else {
                println!("Listing all tasks");
            }
        }
    }

    Ok(())
}

// 临时内存实现
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

struct MemoryUserRepository {
    users: Arc<Mutex<HashMap<Id, User>>>,
}

impl MemoryUserRepository {
    fn new() -> Self {
        Self {
            users: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait::async_trait]
impl myapp_core::UserRepository for MemoryUserRepository {
    async fn create(&self, user: User) -> myapp_core::AppResult<User> {
        let mut users = self.users.lock().unwrap();
        users.insert(user.id, user.clone());
        Ok(user)
    }

    async fn get(&self, id: Id) -> myapp_core::AppResult<Option<User>> {
        let users = self.users.lock().unwrap();
        Ok(users.get(&id).cloned())
    }

    async fn update(&self, user: User) -> myapp_core::AppResult<User> {
        let mut users = self.users.lock().unwrap();
        users.insert(user.id, user.clone());
        Ok(user)
    }

    async fn delete(&self, id: Id) -> myapp_core::AppResult<()> {
        let mut users = self.users.lock().unwrap();
        users.remove(&id);
        Ok(())
    }
}
```

### Web API 包

```toml
# web-api/Cargo.toml
[package]
name = "myapp-web-api"
version = "0.1.0"
edition = "2021"
description = "Web API server for MyApp"

[dependencies]
# 工作空间依赖
tokio = { workspace = true }
serde = { workspace = true }
anyhow = { workspace = true }

# 内部依赖
core = { workspace = true, features = ["async"] }
shared = { workspace = true }

# Web 框架
axum = { version = "0.6", features = ["macros"] }
tower = "0.4"
tower-http = { version = "0.4", features = ["cors", "trace"] }

# 序列化和配置
serde_json = "1.0"
config = "0.13"

# 日志
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
```

```rust
// web-api/src/main.rs
use anyhow::Result;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use myapp_core::{UserService, User};
use myapp_shared::{Id, ApiResponse, Pagination};
use serde::Deserialize;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

// 应用状态
#[derive(Clone)]
struct AppState {
    user_service: Arc<UserService<MemoryUserRepository>>,
}

// 请求 DTO
#[derive(Deserialize)]
struct CreateUserRequest {
    username: String,
    email: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    // 初始化日志
    tracing_subscriber::init();

    // 创建应用状态
    let repository = MemoryUserRepository::new();
    let user_service = Arc::new(UserService::new(repository));
    let state = AppState { user_service };

    // 创建路由
    let app = Router::new()
        .route("/users", post(create_user))
        .route("/users", get(list_users))
        .route("/users/:id", get(get_user))
        .layer(CorsLayer::permissive())
        .with_state(state);

    // 启动服务器
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    println!("Server running on http://0.0.0.0:3000");
    
    axum::serve(listener, app).await?;
    
    Ok(())
}

// 创建用户
async fn create_user(
    State(state): State<AppState>,
    Json(req): Json<CreateUserRequest>,
) -> Result<Json<ApiResponse<User>>, StatusCode> {
    match state.user_service.create_user(req.username, req.email).await {
        Ok(user) => Ok(Json(ApiResponse::success(user))),
        Err(e) => {
            tracing::error!("Failed to create user: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 获取用户
async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<User>>, StatusCode> {
    let id = Id::from_string(&id).map_err(|_| StatusCode::BAD_REQUEST)?;

    match state.user_service.get_user(id).await {
        Ok(Some(user)) => Ok(Json(ApiResponse::success(user))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to get user: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 列出用户
async fn list_users(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Json<ApiResponse<Vec<User>>> {
    // 简化实现，实际应用中需要分页查询
    match state.user_service.list_users().await {
        Ok(users) => Json(ApiResponse::success(users)),
        Err(e) => {
            tracing::error!("Failed to list users: {}", e);
            Json(ApiResponse::error(e.to_string()))
        }
    }
}

// 内存仓储实现（同 CLI 包中的实现）
// ... 省略实现细节
```

## 共享依赖和配置

### 依赖管理策略

```toml
# workspace/Cargo.toml
[workspace]
members = ["core", "cli", "web-api", "shared"]
resolver = "2"

# 工作空间级别依赖声明
[workspace.dependencies]
# 基础依赖
serde = { version = "1.0", features = ["derive"] }
anyhow = "1.0"
thiserror = "1.0"
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }

# 异步运行时
tokio = { version = "1.0", features = ["full"] }
async-trait = "0.1"

# CLI 工具
clap = { version = "4.0", features = ["derive"] }

# Web 框架
axum = "0.6"
tower = "0.4"
tower-http = "0.4"

# 数据库
sqlx = { version = "0.7", features = ["runtime-tokio-rustls"] }

# 测试工具
tokio-test = "0.4"
criterion = "0.5"

# 内部包依赖
core = { path = "core" }
shared = { path = "shared" }
cli = { path = "cli" }
web-api = { path = "web-api" }

# 工作空间元数据
[workspace.metadata]
rust-version = "1.70"
authors = ["MyTeam <team@example.com>"]
license = "MIT OR Apache-2.0"
repository = "https://github.com/myteam/myapp"
homepage = "https://myapp.example.com"
documentation = "https://docs.rs/myapp"

# 统一的构建配置
[workspace.profile.dev]
debug = true
opt-level = 0
split-debuginfo = "unpacked"
incremental = true

[workspace.profile.release]
debug = false
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
strip = true

[workspace.profile.test]
debug = true
opt-level = 1

[workspace.profile.bench]
debug = false
opt-level = 3
lto = true
```

### 成员包中的依赖引用

```toml
# core/Cargo.toml
[dependencies]
# 使用工作空间依赖
serde = { workspace = true }
anyhow = { workspace = true }
uuid = { workspace = true }
chrono = { workspace = true }

# 内部依赖
shared = { workspace = true }

# 包特定依赖（不在工作空间级别定义）
regex = "1.0"

# 可选依赖
[dependencies.tokio]
workspace = true
optional = true

[dependencies.sqlx]
workspace = true
features = ["postgres", "uuid", "chrono"]
optional = true
```

## 工作空间最佳实践

### 1. 包组织原则

```
project/
├── Cargo.toml              # 工作空间根
├── README.md
├── LICENSE
├── core/                   # 核心业务逻辑
│   ├── Cargo.toml
│   └── src/
├── shared/                 # 共享类型和工具
│   ├── Cargo.toml
│   └── src/
├── clients/                # 客户端实现
│   ├── cli/
│   ├── web-api/
│   └── mobile-api/
├── adapters/               # 外部适配器
│   ├── database/
│   ├── message-queue/
│   └── cache/
├── tools/                  # 开发工具
│   ├── migration/
│   ├── seed-data/
│   └── benchmark/
└── tests/                  # 集成测试
    ├── integration/
    └── e2e/
```

### 2. 版本管理策略

```toml
# 所有包保持相同版本
[workspace.package]
version = "0.1.0"
edition = "2021"
authors = ["Team <team@example.com>"]
license = "MIT OR Apache-2.0"

# 成员包继承工作空间版本
# core/Cargo.toml
[package]
name = "myapp-core"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true
```

### 3. 特性传播

```toml
# workspace/Cargo.toml
[workspace.dependencies]
core = { path = "core", default-features = false }

# core/Cargo.toml
[features]
default = ["std"]
std = []
async = ["tokio", "async-trait"]
database = ["sqlx"]
full = ["async", "database"]

# cli/Cargo.toml
[dependencies]
core = { workspace = true, features = ["async", "database"] }

# web-api/Cargo.toml
[dependencies]
core = { workspace = true, features = ["full"] }
```

### 4. 测试组织

```bash
# 运行整个工作空间的测试
cargo test

# 运行特定包的测试
cargo test -p core
cargo test -p cli

# 运行集成测试
cargo test --test integration

# 运行文档测试
cargo test --doc

# 运行基准测试
cargo bench
```

### 5. 发布策略

```bash
# 发布核心包
cargo publish -p shared
cargo publish -p core

# 发布应用包
cargo publish -p cli
cargo publish -p web-api

# 批量发布脚本
#!/bin/bash
packages=("shared" "core" "cli" "web-api")
for package in "${packages[@]}"; do
    echo "Publishing $package..."
    cargo publish -p "$package"
    sleep 10  # 等待 crates.io 索引更新
done
```

## 高级工作空间配置

### 条件成员

```toml
# 基于平台的条件成员
[workspace]
members = [
    "core",
    "shared",
    "cli",
]

# 仅在 Unix 系统上包含
[target.'cfg(unix)'.workspace]
members = ["unix-tools"]

# 仅在 Windows 系统上包含
[target.'cfg(windows)'.workspace]
members = ["windows-tools"]
```

### 工作空间脚本

```bash
#!/bin/bash
# scripts/dev-setup.sh

# 安装所有依赖
cargo build --workspace

# 运行所有测试
cargo test --workspace

# 检查代码格式
cargo fmt --all -- --check

# 运行 Clippy
cargo clippy --workspace --all-targets -- -D warnings

# 生成文档
cargo doc --workspace --no-deps
```

### Docker 多阶段构建

```dockerfile
# Dockerfile
FROM rust:1.70 as builder

WORKDIR /app

# 复制工作空间配置
COPY Cargo.toml Cargo.lock ./

# 复制所有包的 Cargo.toml
COPY core/Cargo.toml ./core/
COPY shared/Cargo.toml ./shared/
COPY web-api/Cargo.toml ./web-api/

# 创建虚拟源文件以缓存依赖
RUN mkdir -p core/src shared/src web-api/src && \
    echo "fn main() {}" > core/src/main.rs && \
    echo "fn main() {}" > shared/src/main.rs && \
    echo "fn main() {}" > web-api/src/main.rs

# 构建依赖
RUN cargo build --release

# 复制实际源代码
COPY core/src ./core/src/
COPY shared/src ./shared/src/
COPY web-api/src ./web-api/src/

# 重新构建应用
RUN cargo build --release --bin myapp-web-api

# 运行时镜像
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/myapp-web-api /usr/local/bin/

EXPOSE 3000

CMD ["myapp-web-api"]
```

## 工作空间工具

### cargo-workspaces

```bash
# 安装 cargo-workspaces
cargo install cargo-workspaces

# 为所有包更新版本
cargo ws version patch

# 发布所有包
cargo ws publish

# 执行命令到所有包
cargo ws exec cargo build
```

### 自定义工作空间命令

```toml
# .cargo/config.toml
[alias]
check-all = "check --workspace --all-targets"
test-all = "test --workspace"
fmt-all = "fmt --all"
clippy-all = "clippy --workspace --all-targets -- -D warnings"
build-release = "build --workspace --release"
```

## 监控和维护

### 依赖更新

```bash
# 检查过时的依赖
cargo outdated --workspace

# 更新特定包的依赖
cargo update -p serde --workspace

# 审计安全漏洞
cargo audit

# 检查许可证
cargo license
```

### 性能分析

```bash
# 构建时间分析
cargo build --timings

# 依赖大小分析
cargo bloat --release --crates

# 编译单元分析
cargo tree --duplicates
```

## 实际案例：微服务架构

```
microservices-workspace/
├── Cargo.toml                    # 工作空间根
├── shared/
│   ├── types/                    # 共享类型
│   ├── errors/                   # 共享错误处理
│   └── utils/                    # 共享工具
├── services/
│   ├── user-service/             # 用户服务
│   ├── order-service/            # 订单服务
│   └── payment-service/          # 支付服务
├── gateways/
│   ├── api-gateway/              # API 网关
│   └── admin-gateway/            # 管理网关
├── adapters/
│   ├── database/                 # 数据库适配器
│   ├── message-queue/            # 消息队列适配器
│   └── cache/                    # 缓存适配器
└── tools/
    ├── migration/                # 数据库迁移工具
    ├── load-test/                # 负载测试工具
    └── deployment/               # 部署工具
```

## 练习

1. 创建一个包含多个相关包的工作空间
2. 实现包之间的依赖关系和特性传播
3. 配置统一的构建和测试流程
4. 设计一个微服务架构的工作空间结构

## 下一步

学习完工作空间后，继续学习 [04-构建配置](04-build-configuration.md)。