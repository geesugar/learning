# 05-发布和部署

## 发布和部署概述

Rust 项目的发布和部署涵盖了从代码包发布到生产环境部署的整个流程。本章将详细介绍如何将 Rust 项目发布到 crates.io、版本管理策略、CI/CD 集成以及各种部署方案。

## crates.io 发布流程

### 准备发布

```toml
# Cargo.toml - 完整的包信息
[package]
name = "my-awesome-lib"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
license = "MIT OR Apache-2.0"
description = "A brief description of what this library does"
documentation = "https://docs.rs/my-awesome-lib"
homepage = "https://github.com/username/my-awesome-lib"
repository = "https://github.com/username/my-awesome-lib"
readme = "README.md"
keywords = ["async", "networking", "web", "http", "client"]
categories = ["network-programming", "web-programming::http-client"]
exclude = [
    "tests/fixtures/*",
    "benches/data/*",
    "docs/*",
    ".github/*",
    "*.tmp"
]
include = [
    "src/**/*",
    "Cargo.toml",
    "README.md",
    "LICENSE*",
    "CHANGELOG.md"
]

[dependencies]
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
reqwest = { version = "0.11", features = ["json"] }

[dev-dependencies]
tokio-test = "0.4"
criterion = "0.5"

[features]
default = ["json"]
json = ["serde_json"]
xml = ["quick-xml"]
full = ["json", "xml"]
```

### 发布前检查清单

```bash
# 1. 检查代码格式
cargo fmt --all -- --check

# 2. 运行 Clippy 检查
cargo clippy --all-targets --all-features -- -D warnings

# 3. 运行所有测试
cargo test --all-features

# 4. 运行文档测试
cargo test --doc

# 5. 构建文档
cargo doc --all-features --no-deps

# 6. 检查包内容
cargo package --list

# 7. 本地构建包
cargo package

# 8. 验证包可以构建
cargo install --path . --force

# 9. 模拟发布（不实际发布）
cargo publish --dry-run
```

### 登录和发布

```bash
# 登录 crates.io（需要 API token）
cargo login

# 发布到 crates.io
cargo publish

# 发布特定版本
cargo publish --allow-dirty  # 允许未提交的更改
```

### 创建高质量的 README

```markdown
# My Awesome Library

[![Crates.io](https://img.shields.io/crates/v/my-awesome-lib.svg)](https://crates.io/crates/my-awesome-lib)
[![Documentation](https://docs.rs/my-awesome-lib/badge.svg)](https://docs.rs/my-awesome-lib)
[![Build Status](https://github.com/username/my-awesome-lib/workflows/CI/badge.svg)](https://github.com/username/my-awesome-lib/actions)

A brief, compelling description of your library.

## Features

- 🚀 Fast and efficient
- 📦 Easy to use API
- 🔧 Highly configurable
- 🛡️ Memory safe

## Quick Start

Add this to your `Cargo.toml`:

```toml
[dependencies]
my-awesome-lib = "0.1"
```

## Example

```rust
use my_awesome_lib::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new("https://api.example.com");
    let response = client.get("/users").await?;
    println!("Response: {:?}", response);
    Ok(())
}
```

## Documentation

For detailed documentation, visit [docs.rs/my-awesome-lib](https://docs.rs/my-awesome-lib).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT OR Apache-2.0 license.
```

### 文档和示例

```rust
//! # My Awesome Library
//! 
//! This library provides a simple and efficient way to interact with REST APIs.
//! 
//! ## Features
//! 
//! - Async/await support
//! - JSON serialization/deserialization
//! - Configurable timeouts and retries
//! 
//! ## Quick Start
//! 
//! ```
//! use my_awesome_lib::Client;
//! 
//! # #[tokio::main]
//! # async fn main() -> Result<(), Box<dyn std::error::Error>> {
//! let client = Client::new("https://api.example.com");
//! let response = client.get("/endpoint").await?;
//! # Ok(())
//! # }
//! ```

use serde::{Deserialize, Serialize};
use std::time::Duration;

/// HTTP 客户端，用于发送请求到 REST API
/// 
/// # Examples
/// 
/// ```
/// use my_awesome_lib::Client;
/// 
/// let client = Client::new("https://api.example.com");
/// ```
pub struct Client {
    base_url: String,
    timeout: Duration,
}

impl Client {
    /// 创建一个新的客户端实例
    /// 
    /// # Arguments
    /// 
    /// * `base_url` - API 的基础 URL
    /// 
    /// # Examples
    /// 
    /// ```
    /// use my_awesome_lib::Client;
    /// 
    /// let client = Client::new("https://api.example.com");
    /// ```
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            timeout: Duration::from_secs(30),
        }
    }
    
    /// 设置请求超时时间
    /// 
    /// # Arguments
    /// 
    /// * `timeout` - 超时时间
    /// 
    /// # Examples
    /// 
    /// ```
    /// use my_awesome_lib::Client;
    /// use std::time::Duration;
    /// 
    /// let client = Client::new("https://api.example.com")
    ///     .with_timeout(Duration::from_secs(60));
    /// ```
    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }
    
    /// 发送 GET 请求
    /// 
    /// # Arguments
    /// 
    /// * `path` - 请求路径
    /// 
    /// # Returns
    /// 
    /// 返回响应数据或错误
    /// 
    /// # Examples
    /// 
    /// ```no_run
    /// use my_awesome_lib::Client;
    /// 
    /// # #[tokio::main]
    /// # async fn main() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = Client::new("https://jsonplaceholder.typicode.com");
    /// let response = client.get("/posts/1").await?;
    /// println!("Response: {}", response);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn get(&self, path: &str) -> Result<String, ClientError> {
        let url = format!("{}{}", self.base_url, path);
        
        let response = reqwest::Client::new()
            .get(&url)
            .timeout(self.timeout)
            .send()
            .await
            .map_err(ClientError::Request)?;
        
        if response.status().is_success() {
            response.text().await.map_err(ClientError::Request)
        } else {
            Err(ClientError::Http {
                status: response.status().as_u16(),
                message: response.text().await.unwrap_or_default(),
            })
        }
    }
}

/// 客户端错误类型
#[derive(Debug, thiserror::Error)]
pub enum ClientError {
    /// 请求错误
    #[error("Request failed: {0}")]
    Request(#[from] reqwest::Error),
    
    /// HTTP 错误
    #[error("HTTP error {status}: {message}")]
    Http {
        status: u16,
        message: String,
    },
}

// 测试模块
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_client_creation() {
        let client = Client::new("https://api.example.com");
        assert_eq!(client.base_url, "https://api.example.com");
        assert_eq!(client.timeout, Duration::from_secs(30));
    }
    
    #[test]
    fn test_client_with_timeout() {
        let timeout = Duration::from_secs(60);
        let client = Client::new("https://api.example.com")
            .with_timeout(timeout);
        assert_eq!(client.timeout, timeout);
    }
    
    #[tokio::test]
    async fn test_get_request() {
        // 使用模拟服务器进行测试
        // 这里省略具体实现
    }
}
```

## 版本管理策略

### 语义化版本控制

```toml
# 版本号格式：MAJOR.MINOR.PATCH
[package]
version = "1.2.3"

# MAJOR：不兼容的 API 更改
# MINOR：向后兼容的功能新增
# PATCH：向后兼容的错误修复
```

### 版本发布流程

```bash
#!/bin/bash
# release.sh - 自动化发布脚本

set -e

# 获取当前版本
CURRENT_VERSION=$(cargo pkgid | cut -d# -f2 | cut -d: -f2)
echo "Current version: $CURRENT_VERSION"

# 检查工作目录是否干净
if [[ -n $(git status -s) ]]; then
    echo "Error: Working directory is not clean"
    exit 1
fi

# 运行测试
echo "Running tests..."
cargo test --all-features

# 运行 Clippy
echo "Running Clippy..."
cargo clippy --all-targets --all-features -- -D warnings

# 更新版本号
echo "Please enter the new version (current: $CURRENT_VERSION):"
read NEW_VERSION

# 验证版本格式
if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Invalid version format"
    exit 1
fi

# 更新 Cargo.toml
sed -i.bak "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" Cargo.toml
rm Cargo.toml.bak

# 更新 CHANGELOG.md
echo "Updating CHANGELOG.md..."
echo -e "## [$NEW_VERSION] - $(date +%Y-%m-%d)\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n$(cat CHANGELOG.md)" > CHANGELOG.md.tmp
mv CHANGELOG.md.tmp CHANGELOG.md

# 提交更改
git add Cargo.toml CHANGELOG.md
git commit -m "chore: bump version to $NEW_VERSION"

# 创建标签
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

# 发布到 crates.io
echo "Publishing to crates.io..."
cargo publish

# 推送到远程仓库
git push origin main
git push origin "v$NEW_VERSION"

echo "Release $NEW_VERSION completed successfully!"
```

### 预发布版本

```bash
# 发布 alpha 版本
cargo publish --version "2.0.0-alpha.1"

# 发布 beta 版本  
cargo publish --version "2.0.0-beta.1"

# 发布 RC 版本
cargo publish --version "2.0.0-rc.1"
```

### CHANGELOG 管理

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature X
- Support for Y

### Changed
- Improved performance of Z

### Deprecated
- Function A is deprecated, use B instead

### Removed
- Removed deprecated function C

### Fixed
- Fixed bug in D

### Security
- Fixed security vulnerability in E

## [1.2.3] - 2023-12-15

### Added
- Added new configuration options
- Improved error messages

### Fixed
- Fixed memory leak in connection pool
- Fixed handling of edge cases

## [1.2.2] - 2023-12-01

### Fixed
- Critical bug fix for authentication

## [1.2.1] - 2023-11-15

### Changed
- Updated dependencies
- Improved documentation

## [1.2.0] - 2023-11-01

### Added
- New async API
- Support for custom headers

### Changed
- Refactored internal architecture

## [1.1.0] - 2023-10-15

### Added
- JSON serialization support
- Retry mechanism

## [1.0.0] - 2023-10-01

### Added
- Initial stable release
- Basic HTTP client functionality
```

## CI/CD 集成

### GitHub Actions 完整流程

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  CARGO_TERM_COLOR: always

jobs:
  check:
    name: Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: Check
        run: cargo check --all-features

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust: [stable, beta, nightly]
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}
      - uses: Swatinem/rust-cache@v2
      - name: Run tests
        run: cargo test --all-features

  fmt:
    name: Rustfmt
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt
      - name: Enforce formatting
        run: cargo fmt --check

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy
      - uses: Swatinem/rust-cache@v2
      - name: Linting
        run: cargo clippy --all-features -- -D warnings

  coverage:
    name: Code coverage
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: llvm-tools-preview
      - uses: Swatinem/rust-cache@v2
      - name: Install cargo-llvm-cov
        uses: taiki-e/install-action@cargo-llvm-cov
      - name: Generate code coverage
        run: cargo llvm-cov --all-features --workspace --lcov --output-path lcov.info
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: lcov.info
          fail_ci_if_error: true

  docs:
    name: Documentation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: Build documentation
        run: cargo doc --all-features --no-deps
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./target/doc

  security:
    name: Security audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: rustsec/audit-check@v1.4.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

### 自动发布流程

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

env:
  CARGO_TERM_COLOR: always

jobs:
  create-release:
    name: Create release
    runs-on: ubuntu-latest
    outputs:
      upload_url: ${{ steps.create_release.outputs.upload_url }}
    steps:
      - uses: actions/checkout@v4
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

  build:
    name: Build
    needs: create-release
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            cross: false
          - os: ubuntu-latest
            target: x86_64-unknown-linux-musl
            cross: true
          - os: ubuntu-latest
            target: aarch64-unknown-linux-gnu
            cross: true
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            cross: false
          - os: macos-latest
            target: x86_64-apple-darwin
            cross: false
          - os: macos-latest
            target: aarch64-apple-darwin
            cross: true

    steps:
      - uses: actions/checkout@v4
      
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
      
      - uses: Swatinem/rust-cache@v2
        with:
          key: ${{ matrix.target }}
      
      - name: Install cross
        if: matrix.cross
        run: cargo install cross --git https://github.com/cross-rs/cross
      
      - name: Build binary
        run: |
          if [[ "${{ matrix.cross }}" == "true" ]]; then
            cross build --release --target ${{ matrix.target }}
          else
            cargo build --release --target ${{ matrix.target }}
          fi
      
      - name: Strip binary (unix)
        if: matrix.os != 'windows-latest'
        run: strip target/${{ matrix.target }}/release/my-awesome-lib${{ matrix.os == 'windows-latest' && '.exe' || '' }}
      
      - name: Package binary
        shell: bash
        run: |
          cd target/${{ matrix.target }}/release
          if [[ "${{ matrix.os }}" == "windows-latest" ]]; then
            7z a ../../../my-awesome-lib-${{ matrix.target }}.zip my-awesome-lib.exe
          else
            tar czvf ../../../my-awesome-lib-${{ matrix.target }}.tar.gz my-awesome-lib
          fi
          cd -
      
      - name: Upload Release Asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ needs.create-release.outputs.upload_url }}
          asset_path: ./my-awesome-lib-${{ matrix.target }}${{ matrix.os == 'windows-latest' && '.zip' || '.tar.gz' }}
          asset_name: my-awesome-lib-${{ matrix.target }}${{ matrix.os == 'windows-latest' && '.zip' || '.tar.gz' }}
          asset_content_type: application/octet-stream

  publish:
    name: Publish to crates.io
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - name: Publish
        run: cargo publish --token ${{ secrets.CRATES_IO_TOKEN }}
```

## Docker 容器化

### 基础 Dockerfile

```dockerfile
# Dockerfile
FROM rust:1.70 as builder

WORKDIR /app

# 复制 Cargo 文件
COPY Cargo.toml Cargo.lock ./

# 创建虚拟 main.rs 来缓存依赖
RUN mkdir src && echo "fn main() {}" > src/main.rs

# 构建依赖
RUN cargo build --release && rm -rf src

# 复制源代码
COPY src ./src/

# 构建应用
RUN touch src/main.rs && cargo build --release

# 运行时镜像
FROM debian:bookworm-slim

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# 创建用户
RUN useradd -r -s /bin/false appuser

# 复制二进制文件
COPY --from=builder /app/target/release/my-awesome-app /usr/local/bin/my-awesome-app

# 设置权限
RUN chown appuser:appuser /usr/local/bin/my-awesome-app

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 启动命令
CMD ["my-awesome-app"]
```

### 多阶段优化 Dockerfile

```dockerfile
# Dockerfile.optimized
# 使用 alpine 减小镜像大小
FROM rust:1.70-alpine as builder

# 安装构建依赖
RUN apk add --no-cache \
    musl-dev \
    openssl-dev \
    openssl-libs-static \
    pkgconfig

WORKDIR /app

# 设置环境变量，静态链接
ENV RUSTFLAGS="-C target-feature=+crt-static"

# 复制 Cargo 文件并构建依赖
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --target x86_64-unknown-linux-musl
RUN rm -rf src

# 复制源代码并构建应用
COPY src ./src/
RUN touch src/main.rs
RUN cargo build --release --target x86_64-unknown-linux-musl

# 最小运行时镜像
FROM scratch

# 复制 CA 证书
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 复制二进制文件
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/my-awesome-app /my-awesome-app

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["/my-awesome-app"]
```

### Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - RUST_LOG=info
      - DATABASE_URL=postgres://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Kubernetes 部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-awesome-app
  labels:
    app: my-awesome-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-awesome-app
  template:
    metadata:
      labels:
        app: my-awesome-app
    spec:
      containers:
      - name: my-awesome-app
        image: myregistry/my-awesome-app:latest
        ports:
        - containerPort: 8080
        env:
        - name: RUST_LOG
          value: "info"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: my-awesome-app-service
spec:
  selector:
    app: my-awesome-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer

---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
```

## 云部署方案

### AWS Lambda 部署

```toml
# Cargo.toml for Lambda
[package]
name = "lambda-function"
version = "0.1.0"
edition = "2021"

[dependencies]
lambda_runtime = "0.8"
lambda_web = "0.2"
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.0", features = ["macros"] }
```

```rust
// src/main.rs - Lambda 函数
use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Request {
    name: String,
}

#[derive(Serialize)]
struct Response {
    message: String,
}

async fn function_handler(event: LambdaEvent<Request>) -> Result<Response, Error> {
    let response = Response {
        message: format!("Hello, {}!", event.payload.name),
    };
    
    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(function_handler)).await
}
```

```bash
# 构建和部署脚本
#!/bin/bash

# 安装 cargo-lambda
cargo install cargo-lambda

# 构建 Lambda 函数
cargo lambda build --release

# 部署到 AWS Lambda
cargo lambda deploy \
    --function-name my-rust-function \
    --runtime provided.al2 \
    --timeout 30 \
    --memory 128
```

### Fly.io 部署

```toml
# fly.toml
app = "my-awesome-app"
primary_region = "sjc"

[build]
  image = "my-awesome-app:latest"

[env]
  RUST_LOG = "info"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### Railway 部署

```dockerfile
# railway.Dockerfile
FROM rust:1.70 as builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/my-awesome-app /usr/local/bin/my-awesome-app

EXPOSE $PORT
CMD ["my-awesome-app"]
```

## 监控和日志

### 应用监控

```rust
// 集成 OpenTelemetry
use opentelemetry::global;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub fn init_telemetry() -> Result<(), Box<dyn std::error::Error>> {
    let tracer = opentelemetry_jaeger::new_agent_pipeline()
        .with_service_name("my-awesome-app")
        .install_simple()?;

    let opentelemetry_layer = tracing_opentelemetry::layer().with_tracer(tracer);

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "my_awesome_app=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .with(opentelemetry_layer)
        .init();

    Ok(())
}

// 健康检查端点
use axum::{http::StatusCode, Json};
use serde_json::{json, Value};

pub async fn health_check() -> Result<Json<Value>, StatusCode> {
    // 检查数据库连接、外部服务等
    let health_status = json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "version": env!("CARGO_PKG_VERSION"),
        "uptime": get_uptime(),
    });

    Ok(Json(health_status))
}

fn get_uptime() -> u64 {
    // 实现运行时间计算
    0
}
```

### 日志配置

```rust
// 结构化日志
use tracing::{info, warn, error, debug, span, Level};
use serde::Serialize;

#[derive(Serialize)]
struct RequestInfo {
    method: String,
    path: String,
    status: u16,
    duration_ms: u64,
}

pub async fn log_request<B>(
    request: axum::extract::Request<B>,
    next: axum::middleware::Next<B>,
) -> axum::response::Response {
    let start = std::time::Instant::now();
    let method = request.method().to_string();
    let path = request.uri().path().to_string();
    
    let span = span!(Level::INFO, "http_request", method = %method, path = %path);
    let _enter = span.enter();
    
    let response = next.run(request).await;
    let duration = start.elapsed();
    
    let request_info = RequestInfo {
        method,
        path,
        status: response.status().as_u16(),
        duration_ms: duration.as_millis() as u64,
    };
    
    info!(
        status = response.status().as_u16(),
        duration_ms = duration.as_millis(),
        "Request completed"
    );
    
    response
}
```

## 性能优化和最佳实践

### 二进制大小优化

```toml
[profile.release]
opt-level = "z"    # 优化大小
lto = true         # 链接时优化
strip = true       # 去除符号表
panic = "abort"    # 减少 unwinding 代码
codegen-units = 1  # 更好的优化
```

### 启动时间优化

```rust
// 延迟初始化
use std::sync::OnceLock;

static EXPENSIVE_RESOURCE: OnceLock<ExpensiveResource> = OnceLock::new();

pub fn get_expensive_resource() -> &'static ExpensiveResource {
    EXPENSIVE_RESOURCE.get_or_init(|| {
        ExpensiveResource::new()
    })
}

// 异步初始化
use tokio::sync::OnceCell;

static ASYNC_RESOURCE: OnceCell<AsyncResource> = OnceCell::const_new();

pub async fn get_async_resource() -> &'static AsyncResource {
    ASYNC_RESOURCE.get_or_init(|| async {
        AsyncResource::new().await
    }).await
}
```

### 内存使用优化

```rust
// 使用 Box 存储大型结构
#[derive(Clone)]
pub struct LargeConfig {
    data: Box<[u8; 1024 * 1024]>, // 1MB 数据
}

// 实现 Drop 清理资源
impl Drop for MyResource {
    fn drop(&mut self) {
        // 清理资源
        self.cleanup();
    }
}

// 使用 Cow 避免不必要的克隆
use std::borrow::Cow;

pub fn process_data(input: Cow<str>) -> String {
    if input.contains("special") {
        input.into_owned().replace("special", "normal")
    } else {
        input.into_owned()
    }
}
```

## 练习

1. 创建一个完整的库项目并发布到 crates.io
2. 设置 CI/CD 流水线自动构建和测试
3. 容器化应用并部署到云平台
4. 实现监控和日志系统

## 下一步

完成本章学习后，你已经掌握了 Rust 项目管理的完整流程。接下来可以继续学习 [12-Web开发](../12-Web开发/README.md) 或深入其他专业领域。