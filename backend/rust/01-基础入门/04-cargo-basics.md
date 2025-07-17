# Cargo 包管理基础

## 学习目标

- 理解 Cargo 的作用和重要性
- 掌握 Cargo 项目结构
- 学会使用 Cargo 管理依赖
- 了解 Cargo 的配置选项
- 掌握常用 Cargo 命令

## Cargo 简介

Cargo 是 Rust 的包管理器和构建系统，它负责：

- **项目管理**：创建、构建、测试项目
- **依赖管理**：下载、编译、更新依赖
- **包发布**：将包发布到 crates.io
- **工作空间**：管理多个相关包

## 创建 Cargo 项目

### 1. 创建新项目
```bash
# 创建二进制项目（默认）
cargo new my_project
cargo new my_project --bin

# 创建库项目
cargo new my_library --lib

# 在当前目录初始化项目
cargo init
cargo init --lib
```

### 2. 项目结构
```
my_project/
├── Cargo.toml          # 项目配置文件
├── Cargo.lock          # 依赖版本锁定文件（自动生成）
├── src/                # 源代码目录
│   ├── main.rs         # 二进制项目入口
│   └── lib.rs          # 库项目入口
├── tests/              # 集成测试目录
├── examples/           # 示例代码目录
├── benches/            # 性能测试目录
└── target/             # 编译输出目录
```

## Cargo.toml 配置详解

### 1. 基本配置
```toml
[package]
name = "my_project"           # 项目名称
version = "0.1.0"             # 版本号
edition = "2021"              # Rust 版本
authors = ["Your Name <your.email@example.com>"]
description = "A simple Rust project"
license = "MIT"
homepage = "https://github.com/yourusername/my_project"
repository = "https://github.com/yourusername/my_project"
readme = "README.md"
keywords = ["cli", "tool"]
categories = ["command-line-utilities"]
```

### 2. 依赖配置
```toml
[dependencies]
serde = "1.0"                 # 指定版本
tokio = { version = "1.0", features = ["full"] }  # 启用特性
rand = { version = "0.8", optional = true }        # 可选依赖
regex = { git = "https://github.com/rust-lang/regex" }  # Git 依赖
local_crate = { path = "../local_crate" }          # 本地路径依赖

[dev-dependencies]
criterion = "0.3"             # 开发依赖（仅用于测试）

[build-dependencies]
cc = "1.0"                    # 构建依赖
```

### 3. 特性配置
```toml
[features]
default = ["json"]             # 默认启用的特性
json = ["serde/json"]         # json 特性依赖 serde 的 json 特性
async = ["tokio"]             # async 特性依赖 tokio
```

### 4. 二进制目标
```toml
[[bin]]
name = "my_app"
path = "src/main.rs"

[[bin]]
name = "helper"
path = "src/bin/helper.rs"
```

### 5. 库目标
```toml
[lib]
name = "my_library"
path = "src/lib.rs"
crate-type = ["lib"]          # 或 "dylib", "staticlib", "cdylib"
```

## 常用 Cargo 命令

### 1. 项目管理
```bash
cargo new project_name          # 创建新项目
cargo init                      # 在当前目录初始化项目
cargo build                     # 编译项目
cargo build --release           # 发布版本编译
cargo run                       # 编译并运行
cargo run --bin helper          # 运行指定二进制
cargo check                     # 快速检查（不生成可执行文件）
cargo clean                     # 清理编译输出
```

### 2. 依赖管理
```bash
cargo add serde                 # 添加依赖（需要 cargo-edit）
cargo add serde --features json # 添加依赖并启用特性
cargo remove serde              # 移除依赖
cargo update                    # 更新依赖
cargo update -p serde           # 更新特定依赖
cargo tree                      # 查看依赖树
```

### 3. 测试和文档
```bash
cargo test                      # 运行测试
cargo test --lib                # 只运行库测试
cargo test --bin my_app         # 运行二进制测试
cargo doc                       # 生成文档
cargo doc --open                # 生成文档并打开
```

### 4. 发布和安装
```bash
cargo publish                   # 发布到 crates.io
cargo install crate_name        # 安装二进制包
cargo install --path .          # 安装本地包
cargo search keyword            # 搜索包
```

## 依赖管理详解

### 1. 版本指定
```toml
[dependencies]
# 精确版本
serde = "=1.0.136"

# 兼容版本（默认）
serde = "1.0"         # 等同于 "^1.0.0"
serde = "^1.0.0"      # >= 1.0.0, < 2.0.0

# 补丁版本
serde = "~1.0.0"      # >= 1.0.0, < 1.1.0

# 范围版本
serde = ">= 1.0, < 2.0"

# 通配符版本
serde = "1.*"
```

### 2. 依赖类型
```toml
[dependencies]
# 普通依赖
serde = "1.0"

# 开发依赖（仅用于测试和示例）
[dev-dependencies]
criterion = "0.3"

# 构建依赖（用于构建脚本）
[build-dependencies]
cc = "1.0"

# 目标特定依赖
[target.'cfg(unix)'.dependencies]
nix = "0.24"

[target.'cfg(windows)'.dependencies]
winapi = "0.3"
```

### 3. 可选依赖和特性
```toml
[dependencies]
serde = { version = "1.0", optional = true }
tokio = { version = "1.0", optional = true }

[features]
default = []
json = ["serde"]
async = ["tokio"]
full = ["json", "async"]
```

使用时：
```bash
cargo build --features json     # 启用 json 特性
cargo build --features full     # 启用 full 特性
cargo build --no-default-features  # 不启用默认特性
```

## 工作空间（Workspace）

### 1. 工作空间配置
在根目录创建 `Cargo.toml`：
```toml
[workspace]
members = [
    "app",
    "lib1",
    "lib2",
]

resolver = "2"

[workspace.dependencies]
serde = "1.0"          # 共享依赖版本
```

### 2. 工作空间结构
```
my_workspace/
├── Cargo.toml          # 工作空间配置
├── Cargo.lock          # 共享的锁定文件
├── target/             # 共享的构建目录
├── app/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
├── lib1/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs
└── lib2/
    ├── Cargo.toml
    └── src/
        └── lib.rs
```

### 3. 工作空间操作
```bash
cargo build --workspace         # 构建所有成员
cargo test --workspace          # 测试所有成员
cargo run -p app                # 运行特定包
cargo build -p lib1             # 构建特定包
```

## 配置文件

### 1. 全局配置
位置：`~/.cargo/config.toml`
```toml
[source.crates-io]
replace-with = "ustc"

[source.ustc]
registry = "https://mirrors.ustc.edu.cn/crates.io-index"

[build]
jobs = 4                        # 并行编译任务数
target-dir = "target"          # 构建目录

[net]
git-fetch-with-cli = true       # 使用 git CLI 获取依赖
```

### 2. 项目配置
位置：`.cargo/config.toml`
```toml
[env]
DATABASE_URL = "sqlite:///tmp/db.sqlite"

[alias]
b = "build"
r = "run"
t = "test"
```

## 实践示例

### 1. 创建一个简单的 CLI 工具
```bash
cargo new word_count --bin
cd word_count
```

编辑 `Cargo.toml`：
```toml
[package]
name = "word_count"
version = "0.1.0"
edition = "2021"

[dependencies]
clap = { version = "4.0", features = ["derive"] }
```

编辑 `src/main.rs`：
```rust
use clap::Parser;
use std::fs;

#[derive(Parser)]
#[command(name = "word_count")]
#[command(about = "A simple word count tool")]
struct Args {
    /// Input file
    file: String,
    
    /// Count lines instead of words
    #[arg(short, long)]
    lines: bool,
}

fn main() {
    let args = Args::parse();
    
    let content = fs::read_to_string(&args.file)
        .expect("Failed to read file");
    
    if args.lines {
        let count = content.lines().count();
        println!("Lines: {}", count);
    } else {
        let count = content.split_whitespace().count();
        println!("Words: {}", count);
    }
}
```

构建和运行：
```bash
cargo build
cargo run -- README.md
cargo run -- --lines README.md
```

### 2. 创建一个库
```bash
cargo new math_utils --lib
cd math_utils
```

编辑 `src/lib.rs`：
```rust
//! 数学工具库
//! 
//! 提供常用的数学函数

/// 计算两个数的最大公约数
pub fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 {
        a
    } else {
        gcd(b, a % b)
    }
}

/// 计算两个数的最小公倍数
pub fn lcm(a: u64, b: u64) -> u64 {
    a * b / gcd(a, b)
}

/// 判断一个数是否为质数
pub fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    
    for i in 2..=(n as f64).sqrt() as u64 {
        if n % i == 0 {
            return false;
        }
    }
    
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gcd() {
        assert_eq!(gcd(48, 18), 6);
        assert_eq!(gcd(17, 13), 1);
    }

    #[test]
    fn test_lcm() {
        assert_eq!(lcm(4, 6), 12);
        assert_eq!(lcm(3, 5), 15);
    }

    #[test]
    fn test_is_prime() {
        assert!(is_prime(2));
        assert!(is_prime(17));
        assert!(!is_prime(4));
        assert!(!is_prime(1));
    }
}
```

运行测试：
```bash
cargo test
```

### 3. 发布库到 crates.io
```bash
# 1. 创建 crates.io 账户并获取 API token
cargo login your_api_token

# 2. 检查包是否符合发布要求
cargo publish --dry-run

# 3. 发布包
cargo publish
```

## 性能优化

### 1. 编译优化
```toml
[profile.release]
opt-level = 3           # 优化级别
debug = false           # 不包含调试信息
lto = true              # 启用链接时优化
codegen-units = 1       # 代码生成单元数
panic = "abort"         # panic 时直接终止
```

### 2. 开发优化
```toml
[profile.dev]
opt-level = 0           # 不优化
debug = true            # 包含调试信息
incremental = true      # 增量编译
```

### 3. 自定义配置
```toml
[profile.dev-opt]
inherits = "dev"
opt-level = 1

[profile.release-debug]
inherits = "release"
debug = true
```

使用：
```bash
cargo build --profile dev-opt
cargo build --profile release-debug
```

## 常见问题解决

### 1. 依赖冲突
```bash
# 查看依赖树
cargo tree

# 更新依赖
cargo update

# 指定依赖版本
cargo update -p serde --precise 1.0.136
```

### 2. 编译缓存问题
```bash
# 清理缓存
cargo clean

# 删除全局缓存
rm -rf ~/.cargo/registry
rm -rf ~/.cargo/git
```

### 3. 网络问题
```bash
# 使用镜像源
export CARGO_REGISTRIES_CRATES_IO_INDEX=https://mirrors.ustc.edu.cn/crates.io-index

# 或在 ~/.cargo/config.toml 中配置
```

## 总结

Cargo 是 Rust 生态系统的核心工具，掌握它对于 Rust 开发至关重要：

1. **项目管理**：创建、构建、测试项目
2. **依赖管理**：版本控制、特性管理
3. **工作空间**：管理大型项目
4. **配置优化**：编译优化、环境配置
5. **包发布**：分享代码到社区

通过本节学习，你应该能够熟练使用 Cargo 管理 Rust 项目。

## 下一步

完成本节学习后，请继续学习 [05-基本语法](05-basic-syntax.md)。