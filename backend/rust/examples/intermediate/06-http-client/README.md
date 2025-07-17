# HTTP 客户端

## 项目概述

这个项目实现了一个简单但功能完整的 HTTP 客户端，支持常见的 HTTP 方法（GET、POST、PUT、DELETE），JSON 处理，错误处理，以及基本的认证功能。

## 学习目标

- 掌握 Rust 网络编程基础
- 学会使用第三方 crate（reqwest, serde, tokio）
- 理解异步编程概念
- 学会 JSON 序列化和反序列化
- 掌握错误处理的最佳实践
- 了解 HTTP 协议的基本概念

## 知识点

### 1. 网络编程
- HTTP 协议基础
- 请求和响应处理
- 状态码处理
- 请求头和响应头

### 2. 异步编程
- async/await 语法
- Future 和 Task
- 异步运行时（tokio）
- 并发请求处理

### 3. JSON 处理
- serde 序列化框架
- 自定义序列化和反序列化
- JSON 错误处理
- 结构化数据处理

### 4. 错误处理
- 自定义错误类型
- 错误转换和传播
- 结果类型的组合
- 错误恢复策略

## 项目结构

```
06-http-client/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── client.rs
│   ├── error.rs
│   ├── request.rs
│   ├── response.rs
│   └── auth.rs
├── examples/
│   ├── basic_usage.rs
│   ├── json_api.rs
│   └── concurrent_requests.rs
└── README.md
```

## 核心代码

### Cargo.toml
```toml
[package]
name = "http-client"
version = "0.1.0"
edition = "2021"

[dependencies]
reqwest = { version = "0.11", features = ["json", "rustls-tls"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
url = "2.0"
thiserror = "1.0"
anyhow = "1.0"
```

### src/error.rs
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum HttpClientError {
    #[error("请求错误: {0}")]
    Request(#[from] reqwest::Error),
    
    #[error("JSON 序列化错误: {0}")]
    JsonSerialization(#[from] serde_json::Error),
    
    #[error("URL 解析错误: {0}")]
    UrlParse(#[from] url::ParseError),
    
    #[error("认证错误: {0}")]
    Authentication(String),
    
    #[error("HTTP 状态错误: {status} - {message}")]
    HttpStatus { status: u16, message: String },
    
    #[error("超时错误")]
    Timeout,
    
    #[error("网络错误: {0}")]
    Network(String),
    
    #[error("配置错误: {0}")]
    Configuration(String),
}

pub type Result<T> = std::result::Result<T, HttpClientError>;
```

### src/auth.rs
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthMethod {
    None,
    Basic { username: String, password: String },
    Bearer { token: String },
    ApiKey { key: String, header_name: String },
}

impl AuthMethod {
    pub fn apply_to_request(&self, request: reqwest::RequestBuilder) -> reqwest::RequestBuilder {
        match self {
            AuthMethod::None => request,
            AuthMethod::Basic { username, password } => {
                request.basic_auth(username, Some(password))
            }
            AuthMethod::Bearer { token } => {
                request.header("Authorization", format!("Bearer {}", token))
            }
            AuthMethod::ApiKey { key, header_name } => {
                request.header(header_name, key)
            }
        }
    }
}
```

### src/request.rs
```rust
use crate::auth::AuthMethod;
use crate::error::{HttpClientError, Result};
use reqwest::Method;
use serde_json::Value;
use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct HttpRequest {
    pub method: Method,
    pub url: String,
    pub headers: HashMap<String, String>,
    pub body: Option<Value>,
    pub timeout: Option<Duration>,
    pub auth: AuthMethod,
}

impl HttpRequest {
    pub fn new(method: Method, url: &str) -> Result<Self> {
        let url = url.to_string();
        
        Ok(HttpRequest {
            method,
            url,
            headers: HashMap::new(),
            body: None,
            timeout: Some(Duration::from_secs(30)),
            auth: AuthMethod::None,
        })
    }
    
    pub fn get(url: &str) -> Result<Self> {
        Self::new(Method::GET, url)
    }
    
    pub fn post(url: &str) -> Result<Self> {
        Self::new(Method::POST, url)
    }
    
    pub fn put(url: &str) -> Result<Self> {
        Self::new(Method::PUT, url)
    }
    
    pub fn delete(url: &str) -> Result<Self> {
        Self::new(Method::DELETE, url)
    }
    
    pub fn header(mut self, key: &str, value: &str) -> Self {
        self.headers.insert(key.to_string(), value.to_string());
        self
    }
    
    pub fn json<T: serde::Serialize>(mut self, body: &T) -> Result<Self> {
        self.body = Some(serde_json::to_value(body)?);
        self.headers.insert("Content-Type".to_string(), "application/json".to_string());
        Ok(self)
    }
    
    pub fn auth(mut self, auth: AuthMethod) -> Self {
        self.auth = auth;
        self
    }
    
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }
}
```

### src/response.rs
```rust
use crate::error::{HttpClientError, Result};
use reqwest::StatusCode;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug)]
pub struct HttpResponse {
    pub status: StatusCode,
    pub headers: HashMap<String, String>,
    pub body: String,
}

impl HttpResponse {
    pub fn new(status: StatusCode, headers: HashMap<String, String>, body: String) -> Self {
        HttpResponse {
            status,
            headers,
            body,
        }
    }
    
    pub fn is_success(&self) -> bool {
        self.status.is_success()
    }
    
    pub fn is_client_error(&self) -> bool {
        self.status.is_client_error()
    }
    
    pub fn is_server_error(&self) -> bool {
        self.status.is_server_error()
    }
    
    pub fn json<T: serde::de::DeserializeOwned>(&self) -> Result<T> {
        serde_json::from_str(&self.body)
            .map_err(HttpClientError::JsonSerialization)
    }
    
    pub fn text(&self) -> &str {
        &self.body
    }
    
    pub fn status_code(&self) -> u16 {
        self.status.as_u16()
    }
    
    pub fn get_header(&self, key: &str) -> Option<&String> {
        self.headers.get(key)
    }
}
```

### src/client.rs
```rust
use crate::error::{HttpClientError, Result};
use crate::request::HttpRequest;
use crate::response::HttpResponse;
use reqwest::Client;
use std::collections::HashMap;
use std::time::Duration;

pub struct HttpClient {
    client: Client,
    base_url: Option<String>,
    default_headers: HashMap<String, String>,
    default_timeout: Duration,
}

impl HttpClient {
    pub fn new() -> Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(HttpClientError::Request)?;
        
        Ok(HttpClient {
            client,
            base_url: None,
            default_headers: HashMap::new(),
            default_timeout: Duration::from_secs(30),
        })
    }
    
    pub fn with_base_url(mut self, base_url: &str) -> Self {
        self.base_url = Some(base_url.to_string());
        self
    }
    
    pub fn with_default_header(mut self, key: &str, value: &str) -> Self {
        self.default_headers.insert(key.to_string(), value.to_string());
        self
    }
    
    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.default_timeout = timeout;
        self
    }
    
    pub async fn execute(&self, request: HttpRequest) -> Result<HttpResponse> {
        let url = self.build_url(&request.url)?;
        
        let mut req_builder = self.client.request(request.method, &url);
        
        // 应用默认头部
        for (key, value) in &self.default_headers {
            req_builder = req_builder.header(key, value);
        }
        
        // 应用请求头部
        for (key, value) in &request.headers {
            req_builder = req_builder.header(key, value);
        }
        
        // 应用认证
        req_builder = request.auth.apply_to_request(req_builder);
        
        // 应用超时
        if let Some(timeout) = request.timeout {
            req_builder = req_builder.timeout(timeout);
        } else {
            req_builder = req_builder.timeout(self.default_timeout);
        }
        
        // 应用请求体
        if let Some(body) = &request.body {
            req_builder = req_builder.json(body);
        }
        
        // 发送请求
        let response = req_builder.send().await.map_err(HttpClientError::Request)?;
        
        let status = response.status();
        let headers = response.headers().iter()
            .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
            .collect();
        
        let body = response.text().await.map_err(HttpClientError::Request)?;
        
        let http_response = HttpResponse::new(status, headers, body);
        
        // 检查错误状态
        if !http_response.is_success() {
            return Err(HttpClientError::HttpStatus {
                status: http_response.status_code(),
                message: http_response.text().to_string(),
            });
        }
        
        Ok(http_response)
    }
    
    fn build_url(&self, path: &str) -> Result<String> {
        if path.starts_with("http://") || path.starts_with("https://") {
            Ok(path.to_string())
        } else if let Some(base_url) = &self.base_url {
            Ok(format!("{}/{}", base_url.trim_end_matches('/'), path.trim_start_matches('/')))
        } else {
            Ok(path.to_string())
        }
    }
}

impl Default for HttpClient {
    fn default() -> Self {
        Self::new().unwrap()
    }
}
```

### src/main.rs
```rust
mod auth;
mod client;
mod error;
mod request;
mod response;

use crate::auth::AuthMethod;
use crate::client::HttpClient;
use crate::request::HttpRequest;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
struct Post {
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<u64>,
    title: String,
    body: String,
    #[serde(rename = "userId")]
    user_id: u64,
}

#[derive(Debug, Deserialize)]
struct User {
    id: u64,
    name: String,
    username: String,
    email: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 创建 HTTP 客户端
    let client = HttpClient::new()?
        .with_base_url("https://jsonplaceholder.typicode.com")
        .with_default_header("User-Agent", "Rust HTTP Client/1.0")
        .with_timeout(Duration::from_secs(10));
    
    // 示例 1: GET 请求
    println!("=== GET 请求示例 ===");
    let get_request = HttpRequest::get("/posts/1")?;
    
    match client.execute(get_request).await {
        Ok(response) => {
            println!("状态码: {}", response.status_code());
            let post: Post = response.json()?;
            println!("帖子: {:#?}", post);
        }
        Err(e) => println!("GET 请求失败: {}", e),
    }
    
    // 示例 2: POST 请求
    println!("\\n=== POST 请求示例 ===");
    let new_post = Post {
        id: None,
        title: "我的新帖子".to_string(),
        body: "这是帖子内容".to_string(),
        user_id: 1,
    };
    
    let post_request = HttpRequest::post("/posts")?
        .json(&new_post)?;
    
    match client.execute(post_request).await {
        Ok(response) => {
            println!("状态码: {}", response.status_code());
            let created_post: Post = response.json()?;
            println!("创建的帖子: {:#?}", created_post);
        }
        Err(e) => println!("POST 请求失败: {}", e),
    }
    
    // 示例 3: 带认证的请求
    println!("\\n=== 带认证的请求示例 ===");
    let auth_request = HttpRequest::get("/users/1")?
        .auth(AuthMethod::Bearer {
            token: "your-token-here".to_string(),
        });
    
    match client.execute(auth_request).await {
        Ok(response) => {
            let user: User = response.json()?;
            println!("用户: {:#?}", user);
        }
        Err(e) => println!("认证请求失败: {}", e),
    }
    
    // 示例 4: 并发请求
    println!("\\n=== 并发请求示例 ===");
    let requests = vec![
        HttpRequest::get("/posts/1")?,
        HttpRequest::get("/posts/2")?,
        HttpRequest::get("/posts/3")?,
    ];
    
    let mut handles = Vec::new();
    for request in requests {
        let client = &client;
        let handle = tokio::spawn(async move {
            client.execute(request).await
        });
        handles.push(handle);
    }
    
    for (i, handle) in handles.into_iter().enumerate() {
        match handle.await? {
            Ok(response) => {
                let post: Post = response.json()?;
                println!("并发请求 {} 成功: {}", i + 1, post.title);
            }
            Err(e) => println!("并发请求 {} 失败: {}", i + 1, e),
        }
    }
    
    Ok(())
}
```

## 扩展功能

### 1. 请求重试机制

```rust
use std::time::Duration;
use tokio::time::sleep;

impl HttpClient {
    pub async fn execute_with_retry(
        &self,
        request: HttpRequest,
        max_retries: u32,
        retry_delay: Duration,
    ) -> Result<HttpResponse> {
        let mut last_error = None;
        
        for attempt in 0..=max_retries {
            match self.execute(request.clone()).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    last_error = Some(e);
                    if attempt < max_retries {
                        println!("请求失败，{} 秒后重试...", retry_delay.as_secs());
                        sleep(retry_delay).await;
                    }
                }
            }
        }
        
        Err(last_error.unwrap())
    }
}
```

### 2. 请求和响应中间件

```rust
use async_trait::async_trait;

#[async_trait]
pub trait Middleware: Send + Sync {
    async fn before_request(&self, request: &mut HttpRequest) -> Result<()>;
    async fn after_response(&self, response: &mut HttpResponse) -> Result<()>;
}

pub struct LoggingMiddleware;

#[async_trait]
impl Middleware for LoggingMiddleware {
    async fn before_request(&self, request: &mut HttpRequest) -> Result<()> {
        println!("发送请求: {} {}", request.method, request.url);
        Ok(())
    }
    
    async fn after_response(&self, response: &mut HttpResponse) -> Result<()> {
        println!("收到响应: {}", response.status_code());
        Ok(())
    }
}
```

### 3. 请求缓存

```rust
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct CacheMiddleware {
    cache: Arc<RwLock<HashMap<String, HttpResponse>>>,
}

impl CacheMiddleware {
    pub fn new() -> Self {
        CacheMiddleware {
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    pub async fn get(&self, key: &str) -> Option<HttpResponse> {
        let cache = self.cache.read().await;
        cache.get(key).cloned()
    }
    
    pub async fn set(&self, key: String, response: HttpResponse) {
        let mut cache = self.cache.write().await;
        cache.insert(key, response);
    }
}
```

## 测试示例

### 单元测试

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_get_request() {
        let client = HttpClient::new().unwrap();
        let request = HttpRequest::get("https://httpbin.org/get").unwrap();
        
        let response = client.execute(request).await.unwrap();
        
        assert!(response.is_success());
        assert_eq!(response.status_code(), 200);
    }
    
    #[tokio::test]
    async fn test_post_request() {
        let client = HttpClient::new().unwrap();
        let data = serde_json::json!({
            "name": "test",
            "value": 42
        });
        
        let request = HttpRequest::post("https://httpbin.org/post")
            .unwrap()
            .json(&data)
            .unwrap();
        
        let response = client.execute(request).await.unwrap();
        
        assert!(response.is_success());
        assert_eq!(response.status_code(), 200);
    }
}
```

### 集成测试

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use tokio_test;
    
    #[tokio::test]
    async fn test_real_api_integration() {
        let client = HttpClient::new().unwrap()
            .with_base_url("https://jsonplaceholder.typicode.com");
        
        // 测试获取帖子
        let request = HttpRequest::get("/posts/1").unwrap();
        let response = client.execute(request).await.unwrap();
        
        assert!(response.is_success());
        
        let post: Post = response.json().unwrap();
        assert_eq!(post.id, Some(1));
        assert!(!post.title.is_empty());
    }
}
```

## 运行项目

### 编译和运行

```bash
# 编译项目
cargo build

# 运行主程序
cargo run

# 运行测试
cargo test

# 运行特定示例
cargo run --example basic_usage
```

### 性能测试

```bash
# 安装 criterion（性能测试框架）
cargo install criterion

# 运行性能测试
cargo bench
```

## 总结

这个 HTTP 客户端项目展示了：

1. **网络编程**：HTTP 协议的实现和处理
2. **异步编程**：使用 tokio 和 async/await
3. **错误处理**：自定义错误类型和错误传播
4. **JSON 处理**：序列化和反序列化
5. **认证机制**：多种认证方式的支持
6. **可扩展性**：中间件和插件系统

通过这个项目，你可以深入理解 Rust 在网络编程和异步编程方面的强大能力，以及如何构建健壮、高性能的网络应用。

## 下一步

完成这个项目后，建议学习：
- [07-日志分析器](../07-log-analyzer/) - 学习文件处理和正则表达式
- [08-简单 Web 服务器](../08-web-server/) - 学习服务器端编程