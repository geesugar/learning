# 02-依赖管理

## 依赖管理概述

Rust 的依赖管理通过 Cargo 和语义化版本控制提供了强大而灵活的依赖解决机制。理解依赖管理对于构建可靠、可维护的 Rust 项目至关重要。

## 依赖声明和版本规则

### 基本依赖声明

```toml
[dependencies]
# 简单版本声明
serde = "1.0"
regex = "1.5"

# 详细版本声明
tokio = { version = "1.0", features = ["full"] }
clap = { version = "4.0", features = ["derive"] }

# 本地路径依赖
my_utils = { path = "../utils" }
my_core = { path = "./core" }

# Git 依赖
awesome_lib = { git = "https://github.com/user/awesome_lib.git" }
dev_branch = { git = "https://github.com/user/repo.git", branch = "develop" }
specific_tag = { git = "https://github.com/user/repo.git", tag = "v1.0.0" }
specific_rev = { git = "https://github.com/user/repo.git", rev = "abc123" }
```

### 版本规则详解

```toml
[dependencies]
# 基本版本匹配
serde = "1.0"          # >= 1.0.0, < 2.0.0
serde = "1.0.100"      # >= 1.0.100, < 2.0.0
serde = "0.9"          # >= 0.9.0, < 0.10.0

# 精确版本
serde = "=1.0.136"     # 精确匹配 1.0.136

# 范围版本
serde = ">=1.0.100"    # >= 1.0.100
serde = ">1.0.100"     # > 1.0.100
serde = "<=1.0.150"    # <= 1.0.150
serde = "<2.0.0"       # < 2.0.0

# 波浪号要求（兼容性版本）
serde = "~1.0.100"     # >= 1.0.100, < 1.1.0
serde = "~1.0"         # >= 1.0.0, < 2.0.0
serde = "~0.9.8"       # >= 0.9.8, < 0.10.0

# 插入符号要求（语义版本）
serde = "^1.0.100"     # >= 1.0.100, < 2.0.0 (默认)
serde = "^0.9.8"       # >= 0.9.8, < 0.10.0
serde = "^0.0.3"       # >= 0.0.3, < 0.0.4

# 通配符
serde = "1.*"          # >= 1.0.0, < 2.0.0
serde = "1.0.*"        # >= 1.0.0, < 1.1.0
```

## 特性（Features）管理

### 定义特性

```toml
[features]
# 默认特性
default = ["json", "compression"]

# 基本特性
json = ["serde_json"]
yaml = ["serde_yaml"]
compression = ["flate2"]

# 可选依赖特性
redis-support = ["redis"]
postgres-support = ["sqlx/postgres"]

# 组合特性
all-formats = ["json", "yaml", "toml"]
all-databases = ["redis-support", "postgres-support"]
full = ["all-formats", "all-databases", "compression"]

# 互斥特性
backend-sqlite = ["sqlx/sqlite"]
backend-postgres = ["sqlx/postgres"]
backend-mysql = ["sqlx/mysql"]

[dependencies]
# 可选依赖
redis = { version = "0.23", optional = true }
sqlx = { version = "0.7", optional = true }
serde_json = { version = "1.0", optional = true }
serde_yaml = { version = "0.9", optional = true }
flate2 = { version = "1.0", optional = true }

# 特性依赖的库
serde = { version = "1.0", features = ["derive"] }
```

### 使用特性

```bash
# 编译时启用特性
cargo build --features "json,compression"
cargo build --features full
cargo build --no-default-features
cargo build --no-default-features --features json

# 添加依赖时指定特性
cargo add tokio --features "full"
cargo add sqlx --features "postgres,runtime-tokio-rustls"
```

### 条件编译

```rust
// 基于特性的条件编译
#[cfg(feature = "json")]
use serde_json;

#[cfg(feature = "redis-support")]
pub mod redis_backend;

#[cfg(feature = "postgres-support")]
pub mod postgres_backend;

// 特性组合
#[cfg(all(feature = "json", feature = "compression"))]
pub fn compress_json() {
    // JSON 压缩功能
}

#[cfg(any(feature = "redis-support", feature = "postgres-support"))]
pub trait Database {
    // 数据库通用接口
}

// 互斥特性检查
#[cfg(all(feature = "backend-sqlite", feature = "backend-postgres"))]
compile_error!("Cannot enable both sqlite and postgres backends simultaneously");

// 平台特定条件编译
#[cfg(target_os = "windows")]
fn platform_specific() {
    println!("Running on Windows");
}

#[cfg(unix)]
fn platform_specific() {
    println!("Running on Unix-like system");
}
```

## 可选依赖和条件编译

### 可选依赖配置

```toml
[dependencies]
# 基础依赖
serde = "1.0"
anyhow = "1.0"

# 可选功能依赖
# 序列化格式
serde_json = { version = "1.0", optional = true }
serde_yaml = { version = "0.9", optional = true }
toml = { version = "0.8", optional = true }

# 异步运行时
tokio = { version = "1.0", features = ["full"], optional = true }
async-std = { version = "1.12", optional = true }

# 数据库驱动
sqlx = { version = "0.7", optional = true }
rusqlite = { version = "0.29", optional = true }

# 网络客户端
reqwest = { version = "0.11", optional = true }
surf = { version = "2.3", optional = true }

[features]
default = ["json"]

# 序列化特性
json = ["serde_json"]
yaml = ["serde_yaml"]
toml_support = ["toml"]

# 运行时特性
tokio-runtime = ["tokio"]
async-std-runtime = ["async-std"]

# 数据库特性
sqlite = ["rusqlite"]
postgres = ["sqlx", "sqlx/postgres"]

# HTTP 客户端特性
reqwest-client = ["reqwest", "tokio-runtime"]
surf-client = ["surf", "async-std-runtime"]

# 组合特性
all-formats = ["json", "yaml", "toml_support"]
full = ["all-formats", "postgres", "reqwest-client"]
```

### 条件编译实例

```rust
// src/lib.rs
//! 配置管理库
//! 
//! 支持多种配置格式和运行时

use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub name: String,
    pub version: String,
    pub database_url: Option<String>,
}

/// 配置加载错误
#[derive(Debug)]
pub enum ConfigError {
    Io(std::io::Error),
    #[cfg(feature = "json")]
    Json(serde_json::Error),
    #[cfg(feature = "yaml")]
    Yaml(serde_yaml::Error),
    #[cfg(feature = "toml_support")]
    Toml(toml::de::Error),
    UnsupportedFormat,
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::Io(e) => write!(f, "IO error: {}", e),
            #[cfg(feature = "json")]
            ConfigError::Json(e) => write!(f, "JSON error: {}", e),
            #[cfg(feature = "yaml")]
            ConfigError::Yaml(e) => write!(f, "YAML error: {}", e),
            #[cfg(feature = "toml_support")]
            ConfigError::Toml(e) => write!(f, "TOML error: {}", e),
            ConfigError::UnsupportedFormat => write!(f, "Unsupported format"),
        }
    }
}

impl std::error::Error for ConfigError {}

/// 配置管理器
pub struct ConfigManager;

impl ConfigManager {
    pub fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Config, ConfigError> {
        let content = std::fs::read_to_string(path).map_err(ConfigError::Io)?;
        let path_str = path.as_ref().to_string_lossy();
        
        if path_str.ends_with(".json") {
            Self::load_json(&content)
        } else if path_str.ends_with(".yaml") || path_str.ends_with(".yml") {
            Self::load_yaml(&content)
        } else if path_str.ends_with(".toml") {
            Self::load_toml(&content)
        } else {
            Err(ConfigError::UnsupportedFormat)
        }
    }
    
    #[cfg(feature = "json")]
    pub fn load_json(content: &str) -> Result<Config, ConfigError> {
        serde_json::from_str(content).map_err(ConfigError::Json)
    }
    
    #[cfg(not(feature = "json"))]
    pub fn load_json(_content: &str) -> Result<Config, ConfigError> {
        Err(ConfigError::UnsupportedFormat)
    }
    
    #[cfg(feature = "yaml")]
    pub fn load_yaml(content: &str) -> Result<Config, ConfigError> {
        serde_yaml::from_str(content).map_err(ConfigError::Yaml)
    }
    
    #[cfg(not(feature = "yaml"))]
    pub fn load_yaml(_content: &str) -> Result<Config, ConfigError> {
        Err(ConfigError::UnsupportedFormat)
    }
    
    #[cfg(feature = "toml_support")]
    pub fn load_toml(content: &str) -> Result<Config, ConfigError> {
        toml::from_str(content).map_err(ConfigError::Toml)
    }
    
    #[cfg(not(feature = "toml_support"))]
    pub fn load_toml(_content: &str) -> Result<Config, ConfigError> {
        Err(ConfigError::UnsupportedFormat)
    }
}

// 数据库抽象
#[cfg(any(feature = "sqlite", feature = "postgres"))]
pub trait Database {
    type Error;
    
    async fn connect(url: &str) -> Result<Self, Self::Error>
    where
        Self: Sized;
    
    async fn execute(&mut self, query: &str) -> Result<(), Self::Error>;
}

#[cfg(feature = "sqlite")]
pub mod sqlite {
    use super::Database;
    use rusqlite::{Connection, Error};
    
    pub struct SqliteDatabase {
        connection: Connection,
    }
    
    impl Database for SqliteDatabase {
        type Error = Error;
        
        async fn connect(url: &str) -> Result<Self, Self::Error> {
            let connection = Connection::open(url)?;
            Ok(SqliteDatabase { connection })
        }
        
        async fn execute(&mut self, query: &str) -> Result<(), Self::Error> {
            self.connection.execute(query, [])?;
            Ok(())
        }
    }
}

#[cfg(feature = "postgres")]
pub mod postgres {
    use super::Database;
    use sqlx::{PgPool, Error};
    
    pub struct PostgresDatabase {
        pool: PgPool,
    }
    
    impl Database for PostgresDatabase {
        type Error = Error;
        
        async fn connect(url: &str) -> Result<Self, Self::Error> {
            let pool = PgPool::connect(url).await?;
            Ok(PostgresDatabase { pool })
        }
        
        async fn execute(&mut self, query: &str) -> Result<(), Self::Error> {
            sqlx::query(query).execute(&self.pool).await?;
            Ok(())
        }
    }
}

// HTTP 客户端抽象
#[cfg(any(feature = "reqwest-client", feature = "surf-client"))]
pub trait HttpClient {
    type Error;
    
    async fn get(&self, url: &str) -> Result<String, Self::Error>;
    async fn post(&self, url: &str, body: &str) -> Result<String, Self::Error>;
}

#[cfg(feature = "reqwest-client")]
pub mod reqwest_client {
    use super::HttpClient;
    use reqwest::{Client, Error};
    
    pub struct ReqwestClient {
        client: Client,
    }
    
    impl ReqwestClient {
        pub fn new() -> Self {
            ReqwestClient {
                client: Client::new(),
            }
        }
    }
    
    impl HttpClient for ReqwestClient {
        type Error = Error;
        
        async fn get(&self, url: &str) -> Result<String, Self::Error> {
            let response = self.client.get(url).send().await?;
            response.text().await
        }
        
        async fn post(&self, url: &str, body: &str) -> Result<String, Self::Error> {
            let response = self.client.post(url).body(body.to_string()).send().await?;
            response.text().await
        }
    }
}

#[cfg(feature = "surf-client")]
pub mod surf_client {
    use super::HttpClient;
    use surf::{Error, Client};
    
    pub struct SurfClient {
        client: Client,
    }
    
    impl SurfClient {
        pub fn new() -> Self {
            SurfClient {
                client: Client::new(),
            }
        }
    }
    
    impl HttpClient for SurfClient {
        type Error = Error;
        
        async fn get(&self, url: &str) -> Result<String, Self::Error> {
            let mut response = self.client.get(url).await?;
            response.body_string().await
        }
        
        async fn post(&self, url: &str, body: &str) -> Result<String, Self::Error> {
            let mut response = self.client.post(url).body(body).await?;
            response.body_string().await
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    #[cfg(feature = "json")]
    fn test_json_config() {
        let json_content = r#"
        {
            "name": "test-app",
            "version": "1.0.0",
            "database_url": "sqlite://test.db"
        }
        "#;
        
        let config = ConfigManager::load_json(json_content).unwrap();
        assert_eq!(config.name, "test-app");
        assert_eq!(config.version, "1.0.0");
    }
    
    #[test]
    #[cfg(feature = "yaml")]
    fn test_yaml_config() {
        let yaml_content = r#"
        name: test-app
        version: 1.0.0
        database_url: sqlite://test.db
        "#;
        
        let config = ConfigManager::load_yaml(yaml_content).unwrap();
        assert_eq!(config.name, "test-app");
        assert_eq!(config.version, "1.0.0");
    }
}
```

## 依赖冲突解决

### 查看依赖树

```bash
# 查看完整依赖树
cargo tree

# 查看特定包的依赖
cargo tree -p serde

# 查看反向依赖（谁依赖了这个包）
cargo tree -i serde

# 显示重复的依赖
cargo tree --duplicates

# 指定特性查看依赖
cargo tree --features "json,async"

# 查看特定格式的输出
cargo tree --format "{p} {f}"
```

### 依赖冲突示例和解决

```toml
# 示例：版本冲突
# package A 需要 serde 1.0.100
# package B 需要 serde 1.0.150
# Cargo 会自动选择兼容的最新版本

[dependencies]
package_a = "1.0"  # 依赖 serde = "1.0.100"
package_b = "2.0"  # 依赖 serde = "1.0.150"
# Cargo 会选择 serde 1.0.150（向后兼容）

# 解决方案1：使用补丁
[patch.crates-io]
serde = { path = "../my-serde-fork" }

# 解决方案2：替换依赖
[replace]
"serde:1.0.100" = { path = "../my-serde" }

# 解决方案3：使用特定版本
[dependencies]
serde = "=1.0.136"  # 强制使用特定版本
```

### 依赖更新策略

```bash
# 保守更新（只更新补丁版本）
cargo update --precise 1.0.136 serde

# 更新到最新兼容版本
cargo update -p serde

# 更新所有依赖
cargo update

# 更新前查看会更新什么
cargo outdated  # 需要安装 cargo-outdated
```

## 工作空间依赖管理

### 工作空间级别依赖

```toml
# workspace/Cargo.toml
[workspace]
members = ["app", "lib", "utils"]
resolver = "2"

# 工作空间级别的依赖
[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
thiserror = "1.0"

# 内部包依赖
app = { path = "app" }
lib = { path = "lib" }
utils = { path = "utils" }

# app/Cargo.toml
[package]
name = "app"
version = "0.1.0"
edition = "2021"

[dependencies]
# 使用工作空间依赖
serde = { workspace = true }
tokio = { workspace = true }
anyhow = { workspace = true }

# 内部依赖
lib = { workspace = true }
utils = { workspace = true }

# 特定于这个包的依赖
clap = { version = "4.0", features = ["derive"] }

# lib/Cargo.toml
[package]
name = "lib"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { workspace = true }
thiserror = { workspace = true }
utils = { workspace = true }

# 可选的额外特性
reqwest = { version = "0.11", optional = true }

[features]
http-client = ["reqwest"]
```

## 私有依赖和注册表

### 使用私有注册表

```toml
# .cargo/config.toml
[registries]
my-registry = { index = "https://my-intranet:8080/git/index" }

[source.my-registry]
registry = "https://my-intranet:8080/git/index"

# Cargo.toml
[dependencies]
private_lib = { version = "1.0", registry = "my-registry" }
```

### Git 依赖的高级用法

```toml
[dependencies]
# 指定分支
my_lib = { git = "https://github.com/user/my_lib.git", branch = "develop" }

# 指定标签
stable_lib = { git = "https://github.com/user/stable_lib.git", tag = "v1.0.0" }

# 指定提交
exact_lib = { git = "https://github.com/user/exact_lib.git", rev = "abc123def456" }

# Git 子目录
sub_lib = { git = "https://github.com/user/mono_repo.git", package = "sub_lib" }

# 私有仓库（需要认证）
private_lib = { git = "ssh://git@github.com/company/private_lib.git" }
```

## 安全和审计

### 依赖安全审计

```bash
# 安装 cargo-audit
cargo install cargo-audit

# 运行安全审计
cargo audit

# 审计特定的咨询
cargo audit --ignore RUSTSEC-2020-0001

# 生成审计报告
cargo audit --json > audit-report.json
```

### 依赖许可证检查

```bash
# 安装 cargo-license
cargo install cargo-license

# 检查所有依赖的许可证
cargo license

# 生成许可证报告
cargo license --json > licenses.json
```

## 性能优化

### 构建性能优化

```toml
# Cargo.toml 优化配置
[profile.dev]
# 在开发环境中优化依赖，加快构建速度
opt-level = 1

# 优化依赖构建
[profile.dev.package."*"]
opt-level = 3

# 减少调试信息
debug = 1

# 启用并行代码生成
codegen-units = 16

[profile.release]
# 启用 LTO 优化
lto = true

# 减少代码生成单元
codegen-units = 1

# 启用 panic = abort 减少二进制大小
panic = "abort"

# 去除符号表
strip = true
```

### 缓存优化

```bash
# 使用 sccache 加速编译
export RUSTC_WRAPPER=sccache
cargo build

# 清理缓存
cargo clean
sccache --zero-stats
```

## 实际案例：Web 应用依赖配置

```toml
# Cargo.toml - Web 应用示例
[package]
name = "web-app"
version = "0.1.0"
edition = "2021"

[dependencies]
# Web 框架
axum = { version = "0.6", features = ["macros"] }
tower = "0.4"
tower-http = { version = "0.4", features = ["fs", "trace"] }

# 异步运行时
tokio = { version = "1.0", features = ["full"] }

# 序列化
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# 数据库
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "uuid"] }

# 错误处理
anyhow = "1.0"
thiserror = "1.0"

# 日志
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# 配置
config = "0.13"

# 认证和安全
jsonwebtoken = "8.0"
bcrypt = "0.14"

# HTTP 客户端
reqwest = { version = "0.11", features = ["json"] }

# 模板引擎（可选）
askama = { version = "0.12", optional = true }

# 缓存（可选）
redis = { version = "0.23", optional = true }

[dev-dependencies]
tokio-test = "0.4"
tower-test = "0.4"
axum-test = "0.13"

[features]
default = ["templates"]
templates = ["askama"]
cache = ["redis"]
full = ["templates", "cache"]

# 不同环境的优化配置
[profile.dev]
opt-level = 1
debug = true

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
strip = true

[profile.test]
opt-level = 1
debug = true

[profile.bench]
opt-level = 3
debug = false
lto = true
```

## 最佳实践

### 1. 版本策略

- 使用语义化版本控制
- 保持依赖版本相对宽松
- 定期更新依赖
- 锁定关键依赖的版本

### 2. 特性设计

- 保持默认特性最小化
- 合理组织特性组合
- 避免特性冲突
- 文档化特性用途

### 3. 安全考虑

- 定期运行安全审计
- 检查依赖许可证
- 最小化依赖数量
- 审查依赖来源

### 4. 性能优化

- 使用工作空间共享依赖
- 优化构建配置
- 启用编译缓存
- 减少不必要的特性

## 练习

1. 创建一个支持多种配置格式的库项目
2. 设计一个合理的特性层次结构
3. 解决一个实际的依赖冲突问题
4. 配置一个完整的 Web 应用依赖

## 下一步

学习完依赖管理后，继续学习 [03-工作空间](03-workspaces.md)。