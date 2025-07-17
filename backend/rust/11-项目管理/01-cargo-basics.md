# 01-Cargo 基础

## Cargo 概述

Cargo 是 Rust 的官方构建工具和包管理器，提供了项目创建、依赖管理、编译构建、测试运行等完整的项目管理功能。掌握 Cargo 是高效 Rust 开发的基础。

## Cargo 命令详解

### 项目管理命令

```bash
# 创建新项目
cargo new my_project          # 创建二进制项目
cargo new --lib my_lib        # 创建库项目
cargo new --name my_app my_project  # 指定项目名称

# 初始化现有目录
cargo init                    # 在当前目录初始化项目
cargo init --lib             # 初始化为库项目

# 检查项目
cargo check                   # 快速检查代码，不生成可执行文件
cargo check --all-targets    # 检查所有目标（库、测试、示例等）
cargo check --release        # 检查发布版本
```

### 构建和运行命令

```bash
# 构建项目
cargo build                   # 调试构建
cargo build --release        # 发布构建
cargo build --target x86_64-pc-windows-gnu  # 交叉编译

# 运行项目
cargo run                     # 构建并运行主程序
cargo run --release          # 发布模式运行
cargo run --bin my_tool      # 运行指定的二进制目标
cargo run --example my_example  # 运行示例

# 清理构建产物
cargo clean                   # 清理 target 目录
```

### 测试命令

```bash
# 运行测试
cargo test                    # 运行所有测试
cargo test test_name          # 运行特定测试
cargo test --lib             # 只运行库测试
cargo test --doc             # 运行文档测试
cargo test --release         # 发布模式测试

# 基准测试
cargo bench                   # 运行基准测试
cargo bench bench_name       # 运行特定基准测试
```

### 文档命令

```bash
# 生成文档
cargo doc                     # 生成项目文档
cargo doc --open             # 生成并打开文档
cargo doc --no-deps          # 不生成依赖的文档
cargo doc --document-private-items  # 包含私有项目

# 发布相关
cargo publish                 # 发布到 crates.io
cargo publish --dry-run      # 模拟发布过程
cargo package                 # 打包项目
```

### 依赖管理命令

```bash
# 更新依赖
cargo update                  # 更新所有依赖
cargo update -p serde         # 更新特定包

# 添加依赖
cargo add serde               # 添加最新版本的 serde
cargo add serde@1.0.100      # 添加特定版本
cargo add serde --features derive  # 添加带特性的依赖
cargo add tokio --dev         # 添加开发依赖

# 删除依赖
cargo remove serde            # 删除依赖

# 查看依赖树
cargo tree                    # 显示依赖树
cargo tree -i serde          # 显示反向依赖
```

## Cargo.toml 配置详解

### 基本包信息

```toml
[package]
name = "my_awesome_project"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
license = "MIT OR Apache-2.0"
description = "A brief description of your project"
documentation = "https://docs.rs/my_awesome_project"
homepage = "https://github.com/username/my_awesome_project"
repository = "https://github.com/username/my_awesome_project"
readme = "README.md"
keywords = ["cli", "tool", "utility"]
categories = ["command-line-utilities"]
exclude = ["docs/", "*.tmp"]
include = ["src/**/*", "Cargo.toml", "README.md"]
rust-version = "1.70"
```

### 依赖配置

```toml
[dependencies]
# 基本依赖
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }
clap = { version = "4.0", features = ["derive"] }

# 可选依赖
redis = { version = "0.23", optional = true }
postgres = { version = "0.19", optional = true }

# 本地路径依赖
my_utils = { path = "../utils" }

# Git 依赖
awesome_crate = { git = "https://github.com/user/awesome_crate.git" }
awesome_crate_branch = { git = "https://github.com/user/awesome_crate.git", branch = "develop" }

# 开发依赖
[dev-dependencies]
criterion = "0.5"
proptest = "1.0"
tokio-test = "0.4"

# 构建依赖
[build-dependencies]
cc = "1.0"
bindgen = "0.65"
```

### 目标配置

```toml
# 二进制目标
[[bin]]
name = "my_tool"
path = "src/bin/tool.rs"

[[bin]]
name = "my_server"
path = "src/bin/server.rs"

# 库目标
[lib]
name = "my_awesome_lib"
path = "src/lib.rs"
crate-type = ["cdylib", "rlib"]

# 示例
[[example]]
name = "basic_usage"
path = "examples/basic.rs"

# 基准测试
[[bench]]
name = "performance"
path = "benches/perf.rs"
harness = false
```

## 项目结构规范

### 标准项目结构

```
my_project/
├── Cargo.toml          # 项目配置文件
├── Cargo.lock          # 依赖锁定文件（自动生成）
├── src/                # 源代码目录
│   ├── main.rs         # 二进制程序入口
│   ├── lib.rs          # 库入口
│   └── bin/            # 额外的二进制程序
│       └── tool.rs
├── tests/              # 集成测试
│   └── integration_test.rs
├── benches/            # 基准测试
│   └── benchmark.rs
├── examples/           # 示例代码
│   └── example.rs
├── docs/               # 文档
├── target/             # 构建输出（自动生成）
└── README.md
```

### 代码组织最佳实践

```rust
// src/lib.rs - 库的根模块
pub mod config;
pub mod database;
pub mod api;
pub mod utils;

// 重新导出重要的类型
pub use config::Config;
pub use database::Database;
pub use api::ApiClient;

// src/main.rs - 二进制程序入口
use my_project::{Config, Database, ApiClient};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_file("config.toml")?;
    let db = Database::connect(&config.database_url)?;
    let client = ApiClient::new(&config.api_key);
    
    // 应用逻辑
    Ok(())
}

// src/config.rs - 配置模块
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub api_key: String,
    pub port: u16,
}

impl Config {
    pub fn from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let config: Config = toml::from_str(&content)?;
        Ok(config)
    }
}
```

## 构建配置

### 构建配置文件

```toml
# 开发配置
[profile.dev]
opt-level = 0          # 优化级别 (0-3)
debug = true           # 包含调试信息
split-debuginfo = "unpacked"  # 调试信息分离
debug-assertions = true       # 启用调试断言
overflow-checks = true        # 整数溢出检查
lto = false                   # 链接时优化
panic = "unwind"             # panic 策略
incremental = true           # 增量编译
codegen-units = 256          # 代码生成单元数
rpath = false               # 运行时路径

# 发布配置
[profile.release]
opt-level = 3          # 最高优化
debug = false          # 不包含调试信息
split-debuginfo = "packed"
debug-assertions = false
overflow-checks = false
lto = true            # 启用链接时优化
panic = "abort"       # panic 时直接终止
incremental = false   # 禁用增量编译
codegen-units = 1     # 单个代码生成单元

# 测试配置
[profile.test]
opt-level = 0
debug = 2
debug-assertions = true
overflow-checks = true

# 基准测试配置
[profile.bench]
opt-level = 3
debug = false
debug-assertions = false
overflow-checks = false
lto = true
```

### 条件编译

```toml
# 目标特定依赖
[target.'cfg(unix)'.dependencies]
libc = "0.2"

[target.'cfg(windows)'.dependencies]
winapi = "0.3"

# 特性特定依赖
[target.'cfg(feature = "async")'.dependencies]
tokio = "1.0"
```

## 实际项目示例

### CLI 工具项目

```toml
# Cargo.toml
[package]
name = "file-organizer"
version = "0.1.0"
edition = "2021"
authors = ["Developer <dev@example.com>"]
description = "A CLI tool for organizing files"
license = "MIT"

[dependencies]
clap = { version = "4.0", features = ["derive"] }
anyhow = "1.0"
walkdir = "2.0"
regex = "1.0"
serde = { version = "1.0", features = ["derive"] }
toml = "0.8"

[dev-dependencies]
tempfile = "3.0"
assert_cmd = "2.0"
predicates = "3.0"

[[bin]]
name = "file-organizer"
path = "src/main.rs"
```

```rust
// src/main.rs
use anyhow::Result;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "file-organizer")]
#[command(about = "A CLI tool for organizing files")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Organize {
        #[arg(short, long)]
        directory: String,
        #[arg(short, long)]
        config: Option<String>,
    },
    List {
        #[arg(short, long)]
        directory: String,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Organize { directory, config } => {
            println!("Organizing directory: {}", directory);
            if let Some(config_path) = config {
                println!("Using config: {}", config_path);
            }
        }
        Commands::List { directory } => {
            println!("Listing files in: {}", directory);
        }
    }

    Ok(())
}
```

### 库项目结构

```toml
# Cargo.toml
[package]
name = "data-processor"
version = "0.1.0"
edition = "2021"
description = "A library for processing data"
license = "MIT OR Apache-2.0"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
thiserror = "1.0"

# 可选特性
tokio = { version = "1.0", optional = true }
sqlx = { version = "0.7", optional = true }

[features]
default = []
async = ["tokio"]
database = ["sqlx", "async"]

[dev-dependencies]
tokio-test = "0.4"
```

```rust
// src/lib.rs
//! 数据处理库
//! 
//! 这个库提供了各种数据处理功能，包括：
//! - 数据验证
//! - 数据转换
//! - 数据导入导出

pub mod processor;
pub mod validator;
pub mod error;

#[cfg(feature = "async")]
pub mod async_processor;

#[cfg(feature = "database")]
pub mod database;

pub use processor::DataProcessor;
pub use validator::DataValidator;
pub use error::{ProcessorError, Result};

/// 库的版本信息
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version() {
        assert!(!VERSION.is_empty());
    }
}
```

## 最佳实践

### 1. 项目命名

```toml
# 好的命名
[package]
name = "my-awesome-tool"    # 使用连字符
name = "data_processor"     # 或使用下划线（库）

# 避免的命名
name = "MyAwesomeTool"      # 不要使用驼峰命名
name = "my_awesome_tool"    # 二进制程序避免下划线
```

### 2. 版本管理

```toml
# 遵循语义化版本控制
[package]
version = "1.2.3"  # MAJOR.MINOR.PATCH

# 依赖版本策略
[dependencies]
serde = "1.0"          # 宽松版本（推荐）
tokio = "~1.20.0"      # 波浪号版本
anyhow = "=1.0.75"     # 精确版本（谨慎使用）
```

### 3. 特性设计

```toml
[features]
default = ["std"]
std = []
serde = ["dep:serde"]
async = ["tokio"]

# 互斥特性组
backend-sqlite = ["sqlx/sqlite"]
backend-postgres = ["sqlx/postgres"]
```

### 4. 文档和测试

```rust
/// 数据处理器
/// 
/// # 示例
/// 
/// ```
/// use data_processor::DataProcessor;
/// 
/// let processor = DataProcessor::new();
/// let result = processor.process("data");
/// assert!(result.is_ok());
/// ```
pub struct DataProcessor {
    // 实现
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_functionality() {
        let processor = DataProcessor::new();
        // 测试逻辑
    }
}
```

## 常见问题和解决方案

### 1. 依赖冲突

```bash
# 查看依赖树
cargo tree

# 更新特定依赖
cargo update -p problematic_crate

# 使用补丁解决冲突
[patch.crates-io]
problematic_crate = { path = "../fixed_version" }
```

### 2. 构建缓存问题

```bash
# 清理并重新构建
cargo clean
cargo build

# 清理特定目标
cargo clean --target x86_64-pc-windows-gnu
```

### 3. 交叉编译配置

```bash
# 安装目标
rustup target add x86_64-pc-windows-gnu

# 配置链接器
[target.x86_64-pc-windows-gnu]
linker = "x86_64-w64-mingw32-gcc"
```

## 练习

1. 创建一个 CLI 工具项目，包含多个子命令
2. 建立一个带有可选特性的库项目
3. 配置一个包含测试和基准测试的完整项目

## 下一步

学习完 Cargo 基础后，继续学习 [02-依赖管理](02-dependency-management.md)。