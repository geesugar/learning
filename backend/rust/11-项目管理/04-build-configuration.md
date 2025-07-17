# 04-构建配置

## 构建配置概述

Rust 的构建配置系统提供了强大的自定义能力，允许开发者针对不同的场景优化编译过程。通过合理配置构建参数，可以显著改善开发体验、构建性能和最终产品质量。

## 构建配置文件

### Profile 配置详解

```toml
# Cargo.toml 中的构建配置

# 开发配置（默认用于 cargo build）
[profile.dev]
opt-level = 0              # 优化级别：0(无优化) 到 3(最高优化)
debug = true               # 包含调试信息：true, false, 0, 1, 2
debug-assertions = true    # 启用调试断言
overflow-checks = true     # 整数溢出检查
lto = false               # 链接时优化：false, true, "thin", "fat"
panic = "unwind"          # panic 策略："unwind" 或 "abort"
incremental = true        # 增量编译
codegen-units = 256       # 代码生成单元数（影响并行编译）
rpath = false            # 是否在二进制中包含运行时路径
split-debuginfo = "unpacked"  # 调试信息分离策略

# 发布配置（用于 cargo build --release）
[profile.release]
opt-level = 3             # 最高优化级别
debug = false             # 不包含调试信息
debug-assertions = false  # 禁用调试断言
overflow-checks = false   # 禁用溢出检查
lto = true               # 启用链接时优化
panic = "abort"          # panic 时直接终止进程
incremental = false      # 禁用增量编译（发布时重新编译所有内容）
codegen-units = 1        # 单个代码生成单元（更好的优化）
strip = true             # 去除符号表（减小二进制大小）

# 测试配置
[profile.test]
opt-level = 0            # 测试时不优化
debug = 2                # 完整调试信息
debug-assertions = true
overflow-checks = true

# 基准测试配置
[profile.bench]
opt-level = 3            # 基准测试需要最高优化
debug = false
debug-assertions = false
overflow-checks = false
lto = true

# 自定义配置（继承自 release）
[profile.production]
inherits = "release"
debug = 1                # 保留少量调试信息用于崩溃分析
strip = false            # 保留符号表用于性能分析
```

### 特定包的配置覆盖

```toml
# 为特定依赖包设置不同的优化级别
[profile.dev.package."*"]
opt-level = 1            # 优化所有依赖包

[profile.dev.package.serde]
opt-level = 3            # 特别优化 serde

[profile.dev.package.regex]
opt-level = 2            # 中等优化 regex

# 为构建脚本设置配置
[profile.dev.build-override]
opt-level = 3            # 优化构建脚本
debug = false
```

## 交叉编译

### 目标平台配置

```bash
# 查看可用目标
rustup target list

# 安装目标平台
rustup target add x86_64-pc-windows-gnu
rustup target add x86_64-apple-darwin
rustup target add aarch64-unknown-linux-gnu
rustup target add wasm32-unknown-unknown

# 交叉编译
cargo build --target x86_64-pc-windows-gnu
cargo build --target aarch64-unknown-linux-gnu --release
```

### 目标特定配置

```toml
# .cargo/config.toml
[build]
# 默认目标
target = "x86_64-unknown-linux-gnu"

# 目标特定的链接器配置
[target.x86_64-pc-windows-gnu]
linker = "x86_64-w64-mingw32-gcc"

[target.aarch64-unknown-linux-gnu]
linker = "aarch64-linux-gnu-gcc"

[target.armv7-unknown-linux-gnueabihf]
linker = "arm-linux-gnueabihf-gcc"

# 目标特定的运行器
[target.wasm32-unknown-unknown]
runner = "wasm-pack test --node"

# 目标特定的 rustflags
[target.x86_64-unknown-linux-gnu]
rustflags = ["-C", "target-cpu=native"]

[target.x86_64-pc-windows-gnu]
rustflags = ["-C", "link-arg=-static-libgcc"]
```

### 条件编译配置

```rust
// 基于目标平台的条件编译
#[cfg(target_os = "windows")]
fn platform_specific_function() {
    println!("Running on Windows");
}

#[cfg(target_os = "linux")]
fn platform_specific_function() {
    println!("Running on Linux");
}

#[cfg(target_os = "macos")]
fn platform_specific_function() {
    println!("Running on macOS");
}

// 基于架构的条件编译
#[cfg(target_arch = "x86_64")]
fn arch_specific_function() {
    println!("64-bit x86 architecture");
}

#[cfg(target_arch = "aarch64")]
fn arch_specific_function() {
    println!("ARM64 architecture");
}

// 基于目标特性的条件编译
#[cfg(target_feature = "avx2")]
fn use_avx2_optimizations() {
    println!("Using AVX2 optimizations");
}

// 基于端序的条件编译
#[cfg(target_endian = "little")]
fn little_endian_function() {
    println!("Little endian system");
}

#[cfg(target_endian = "big")]
fn big_endian_function() {
    println!("Big endian system");
}
```

## 自定义构建脚本

### 基本构建脚本

```toml
# Cargo.toml
[package]
name = "my-project"
version = "0.1.0"
build = "build.rs"

[build-dependencies]
cc = "1.0"                # C/C++ 编译器绑定
bindgen = "0.65"          # C 头文件绑定生成
cmake = "0.1"             # CMake 集成
pkg-config = "0.3"        # pkg-config 集成
```

```rust
// build.rs
use std::env;
use std::fs;
use std::path::Path;

fn main() {
    // 获取构建环境信息
    let target = env::var("TARGET").unwrap();
    let profile = env::var("PROFILE").unwrap();
    let out_dir = env::var("OUT_DIR").unwrap();
    
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=src/config.h");
    println!("cargo:rerun-if-env-changed=CUSTOM_CONFIG");
    
    // 根据目标平台进行不同的构建
    match target.as_str() {
        "x86_64-unknown-linux-gnu" => {
            println!("cargo:rustc-link-lib=ssl");
            println!("cargo:rustc-link-lib=crypto");
        }
        "x86_64-pc-windows-gnu" => {
            println!("cargo:rustc-link-lib=ws2_32");
            println!("cargo:rustc-link-lib=userenv");
        }
        _ => {}
    }
    
    // 生成构建信息
    generate_build_info(&out_dir);
    
    // 编译 C 代码
    compile_c_library();
    
    // 生成绑定
    generate_bindings(&out_dir);
    
    // 根据特性进行条件编译配置
    if env::var("CARGO_FEATURE_OPENSSL").is_ok() {
        println!("cargo:rustc-cfg=feature=\"openssl\"");
        link_openssl();
    }
    
    if env::var("CARGO_FEATURE_VENDORED").is_ok() {
        build_vendored_dependencies();
    }
}

fn generate_build_info(out_dir: &str) {
    let build_time = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC");
    let git_hash = get_git_hash().unwrap_or_else(|| "unknown".to_string());
    let version = env::var("CARGO_PKG_VERSION").unwrap();
    let target = env::var("TARGET").unwrap();
    
    let build_info = format!(
        r#"
/// 构建时间
pub const BUILD_TIME: &str = "{}";

/// Git 提交哈希
pub const GIT_HASH: &str = "{}";

/// 版本号
pub const VERSION: &str = "{}";

/// 目标平台
pub const TARGET: &str = "{}";

/// 构建信息结构
pub struct BuildInfo {{
    pub version: &'static str,
    pub build_time: &'static str,
    pub git_hash: &'static str,
    pub target: &'static str,
}}

impl BuildInfo {{
    pub const fn new() -> Self {{
        Self {{
            version: VERSION,
            build_time: BUILD_TIME,
            git_hash: GIT_HASH,
            target: TARGET,
        }}
    }}
}}
"#,
        build_time, git_hash, version, target
    );
    
    let dest_path = Path::new(out_dir).join("build_info.rs");
    fs::write(&dest_path, build_info).unwrap();
}

fn get_git_hash() -> Option<String> {
    use std::process::Command;
    
    Command::new("git")
        .args(&["rev-parse", "--short", "HEAD"])
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
            } else {
                None
            }
        })
}

fn compile_c_library() {
    cc::Build::new()
        .file("src/native/helper.c")
        .file("src/native/crypto.c")
        .include("src/native")
        .flag("-O3")
        .flag("-fPIC")
        .compile("native_helpers");
}

fn generate_bindings(out_dir: &str) {
    let bindings = bindgen::Builder::default()
        .header("src/native/wrapper.h")
        .parse_callbacks(Box::new(bindgen::CargoCallbacks))
        .generate()
        .expect("Unable to generate bindings");
    
    let out_path = Path::new(out_dir).join("bindings.rs");
    bindings
        .write_to_file(out_path)
        .expect("Couldn't write bindings!");
}

fn link_openssl() {
    // 查找并链接 OpenSSL
    if let Ok(lib_dir) = env::var("OPENSSL_LIB_DIR") {
        println!("cargo:rustc-link-search=native={}", lib_dir);
    }
    
    println!("cargo:rustc-link-lib=ssl");
    println!("cargo:rustc-link-lib=crypto");
}

fn build_vendored_dependencies() {
    // 构建内嵌的依赖库
    let src_dir = "vendor/libfoo";
    let build_dir = env::var("OUT_DIR").unwrap() + "/libfoo-build";
    
    cmake::Config::new(src_dir)
        .out_dir(&build_dir)
        .define("CMAKE_BUILD_TYPE", "Release")
        .build();
    
    println!("cargo:rustc-link-search=native={}/lib", build_dir);
    println!("cargo:rustc-link-lib=static=foo");
}
```

### 在代码中使用构建信息

```rust
// src/build_info.rs
include!(concat!(env!("OUT_DIR"), "/build_info.rs"));

// src/lib.rs
pub mod build_info;

pub fn print_version_info() {
    let info = build_info::BuildInfo::new();
    println!("Version: {}", info.version);
    println!("Built: {}", info.build_time);
    println!("Commit: {}", info.git_hash);
    println!("Target: {}", info.target);
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_build_info() {
        let info = build_info::BuildInfo::new();
        assert!(!info.version.is_empty());
        assert!(!info.build_time.is_empty());
    }
}
```

## 环境变量和条件编译

### 环境变量配置

```bash
# 设置 Rust 编译器标志
export RUSTFLAGS="-C target-cpu=native -C opt-level=3"

# 设置链接器
export RUSTC_LINKER="clang"

# 设置目标
export CARGO_BUILD_TARGET="x86_64-unknown-linux-gnu"

# 自定义环境变量
export ENABLE_LOGGING=1
export DATABASE_URL="postgres://localhost/mydb"
export API_KEY="secret123"
```

```toml
# .cargo/config.toml
[env]
RUST_LOG = "info"
DATABASE_URL = "sqlite://app.db"

# 目标特定的环境变量
[target.x86_64-pc-windows-gnu.env]
WINDOWS_SPECIFIC_VAR = "value"

[build]
rustflags = ["-C", "target-cpu=native"]

# 不同配置的 rustflags
[target.x86_64-unknown-linux-gnu]
rustflags = [
    "-C", "target-cpu=native",
    "-C", "link-arg=-fuse-ld=lld",
]

[target.x86_64-pc-windows-gnu]
rustflags = [
    "-C", "target-cpu=native",
    "-C", "link-arg=-static-libgcc",
]
```

### 条件编译示例

```rust
// 基于环境变量的条件编译
#[cfg(env = "ENABLE_LOGGING")]
mod logging {
    pub fn init() {
        env_logger::init();
    }
}

#[cfg(not(env = "ENABLE_LOGGING"))]
mod logging {
    pub fn init() {
        // 空实现
    }
}

// 基于特性的条件编译
#[cfg(feature = "json")]
pub mod json_support {
    use serde_json;
    
    pub fn parse_json(input: &str) -> Result<serde_json::Value, serde_json::Error> {
        serde_json::from_str(input)
    }
}

#[cfg(not(feature = "json"))]
pub mod json_support {
    pub fn parse_json(_input: &str) -> Result<(), &'static str> {
        Err("JSON support not enabled")
    }
}

// 复杂条件编译
#[cfg(all(
    target_os = "linux",
    feature = "async",
    not(feature = "sync-only")
))]
pub mod linux_async {
    // Linux 异步实现
}

#[cfg(any(
    target_os = "windows",
    target_os = "macos"
))]
pub mod desktop_specific {
    // 桌面平台特定代码
}

// 编译时常量
pub const IS_DEBUG: bool = cfg!(debug_assertions);
pub const TARGET_OS: &str = env!("TARGET_OS");
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

// 运行时检查编译时配置
pub fn check_build_config() {
    if cfg!(debug_assertions) {
        println!("Debug build");
    } else {
        println!("Release build");
    }
    
    if cfg!(feature = "async") {
        println!("Async feature enabled");
    }
    
    if cfg!(target_pointer_width = "64") {
        println!("64-bit platform");
    }
}
```

## 性能优化配置

### 编译器优化选项

```toml
[profile.release]
# 基本优化
opt-level = 3              # 最高优化级别
lto = "fat"               # 完整链接时优化
codegen-units = 1         # 单个代码生成单元

# 高级优化选项
[profile.release.package."*"]
opt-level = 3

# 特定包的优化配置
[profile.release.package.regex]
opt-level = 3

[profile.release.package.serde]
opt-level = 3

# 自定义高性能配置
[profile.fast]
inherits = "release"
opt-level = 3
lto = "fat"
panic = "abort"
strip = true
codegen-units = 1

# 调试优化配置（保留一些调试信息的优化版本）
[profile.debug-opt]
inherits = "release"
debug = 1                 # 最小调试信息
strip = false             # 保留符号表
```

### 目标特定优化

```toml
# .cargo/config.toml
[target.x86_64-unknown-linux-gnu]
rustflags = [
    "-C", "target-cpu=native",          # 使用本机 CPU 特性
    "-C", "target-feature=+avx2",       # 启用 AVX2 指令集
    "-C", "link-arg=-fuse-ld=lld",     # 使用 LLD 链接器
]

[target.x86_64-pc-windows-gnu]
rustflags = [
    "-C", "target-cpu=native",
    "-C", "link-arg=-static-libgcc",
    "-C", "link-arg=-static-libstdc++",
]

# 针对特定微架构优化
[target.x86_64-unknown-linux-gnu.skylake]
rustflags = [
    "-C", "target-cpu=skylake",
    "-C", "target-feature=+avx2,+fma",
]
```

### 内存和二进制大小优化

```toml
# 最小二进制大小配置
[profile.min-size]
inherits = "release"
opt-level = "z"           # 优化大小而非速度
lto = true
strip = true
panic = "abort"
codegen-units = 1

# 去除未使用的依赖
[dependencies]
serde = { version = "1.0", default-features = false, features = ["derive"] }
tokio = { version = "1.0", default-features = false, features = ["rt"] }

# 减少元数据
[profile.min-size.package."*"]
debug = false
```

## 构建缓存和加速

### 编译缓存配置

```bash
# 使用 sccache
cargo install sccache
export RUSTC_WRAPPER=sccache

# 配置缓存目录
export SCCACHE_DIR=/tmp/sccache

# 查看缓存统计
sccache --show-stats

# 清零统计
sccache --zero-stats
```

### 增量编译优化

```toml
[profile.dev]
incremental = true        # 启用增量编译
codegen-units = 16       # 增加并行代码生成单元

[profile.release]
incremental = false      # 发布版本禁用增量编译（更好的优化）
```

### 并行构建配置

```bash
# 设置并行任务数
export CARGO_BUILD_JOBS=8

# 或者在构建时指定
cargo build -j 8

# 配置文件设置
# .cargo/config.toml
[build]
jobs = 8
```

## Docker 构建优化

### 多阶段构建

```dockerfile
# Dockerfile.optimized
FROM rust:1.70-slim as builder

# 安装必要的依赖
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 Cargo 文件并构建依赖
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src

# 复制源代码并构建应用
COPY src ./src/
RUN touch src/main.rs && cargo build --release

# 运行时镜像
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/myapp /usr/local/bin/

EXPOSE 3000
CMD ["myapp"]
```

### 缓存优化的 Dockerfile

```dockerfile
# 使用 cargo-chef 进行依赖缓存
FROM lukemathwalker/cargo-chef:latest-rust-1.70 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# 构建依赖（这一层会被缓存）
RUN cargo chef cook --release --recipe-path recipe.json

# 构建应用
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/myapp /usr/local/bin/
EXPOSE 3000
CMD ["myapp"]
```

## CI/CD 构建配置

### GitHub Actions 优化

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  CARGO_TERM_COLOR: always
  CARGO_INCREMENTAL: 0  # 禁用增量编译（CI 环境）
  RUST_BACKTRACE: 1

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust: [stable, beta, nightly]
        target: 
          - x86_64-unknown-linux-gnu
          - x86_64-pc-windows-gnu
          - x86_64-apple-darwin
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Rust
      uses: dtolnay/rust-toolchain@master
      with:
        toolchain: ${{ matrix.rust }}
        targets: ${{ matrix.target }}
        components: rustfmt, clippy
    
    - name: Cache cargo
      uses: actions/cache@v3
      with:
        path: |
          ~/.cargo/registry
          ~/.cargo/git
          target
        key: ${{ runner.os }}-cargo-${{ matrix.rust }}-${{ hashFiles('**/Cargo.lock') }}
        restore-keys: |
          ${{ runner.os }}-cargo-${{ matrix.rust }}-
          ${{ runner.os }}-cargo-
    
    - name: Install sccache
      uses: mozilla-actions/sccache-action@v0.0.3
      with:
        version: "v0.5.4"
    
    - name: Configure sccache
      run: |
        echo "RUSTC_WRAPPER=sccache" >> $GITHUB_ENV
        echo "SCCACHE_GHA_ENABLED=true" >> $GITHUB_ENV
    
    - name: Check formatting
      run: cargo fmt --all -- --check
    
    - name: Run clippy
      run: cargo clippy --target ${{ matrix.target }} -- -D warnings
    
    - name: Run tests
      run: cargo test --target ${{ matrix.target }}
    
    - name: Build release
      run: cargo build --release --target ${{ matrix.target }}
    
    - name: Show sccache stats
      run: sccache --show-stats
```

### 发布构建配置

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            binary-name: myapp
          - os: windows-latest
            target: x86_64-pc-windows-gnu
            binary-name: myapp.exe
          - os: macos-latest
            target: x86_64-apple-darwin
            binary-name: myapp
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Rust
      uses: dtolnay/rust-toolchain@stable
      with:
        targets: ${{ matrix.target }}
    
    - name: Build release
      run: |
        cargo build --release --target ${{ matrix.target }}
        
    - name: Strip binary (Unix)
      if: matrix.os != 'windows-latest'
      run: strip target/${{ matrix.target }}/release/${{ matrix.binary-name }}
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.target }}
        path: target/${{ matrix.target }}/release/${{ matrix.binary-name }}
```

## 调试和分析

### 构建时间分析

```bash
# 分析构建时间
cargo build --timings

# 查看详细的构建信息
cargo build -v

# 分析二进制大小
cargo bloat --release

# 查看依赖编译时间
cargo build --timings --release
```

### 性能分析配置

```toml
# 性能分析专用配置
[profile.profiling]
inherits = "release"
debug = 1                # 保留调试信息用于性能分析
strip = false           # 保留符号表
overflow-checks = false # 禁用检查以提高性能
```

## 最佳实践

### 1. 开发环境配置

```toml
[profile.dev]
opt-level = 1           # 轻微优化，加快构建速度
debug = true
incremental = true

# 优化依赖包但不优化自己的代码
[profile.dev.package."*"]
opt-level = 3
```

### 2. 发布环境配置

```toml
[profile.release]
opt-level = 3
lto = "fat"
panic = "abort"
strip = true
codegen-units = 1
```

### 3. 目标特定优化

```bash
# 本地构建使用本机优化
RUSTFLAGS="-C target-cpu=native" cargo build --release

# 通用构建
cargo build --release --target x86_64-unknown-linux-gnu
```

### 4. 构建脚本最佳实践

- 使用 `rerun-if-changed` 指令
- 生成的文件放在 `OUT_DIR` 中
- 合理处理跨平台差异
- 提供回退机制

## 练习

1. 配置一个针对不同平台优化的构建系统
2. 编写一个生成构建信息的构建脚本
3. 设置交叉编译环境并构建多平台二进制
4. 优化一个项目的构建时间和二进制大小

## 下一步

学习完构建配置后，继续学习 [05-发布和部署](05-publishing-deployment.md)。