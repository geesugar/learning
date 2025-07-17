# Result 类型

## 学习目标

- 理解 Result<T, E> 类型的定义和用途
- 掌握 Result 的创建和处理方法
- 学会使用 match 表达式处理 Result
- 掌握 Result 的常用方法和组合器
- 理解 Result 在错误处理中的作用

## Result 类型简介

`Result<T, E>` 是 Rust 标准库中用于处理可能失败的操作的枚举类型。它有两个变体：`Ok(T)` 表示成功，`Err(E)` 表示错误。

### Result 的定义

```rust
enum Result<T, E> {
    Ok(T),   // 成功，包含值 T
    Err(E),  // 错误，包含错误 E
}
```

### 基本使用

```rust
fn main() {
    // 一个可能失败的操作
    let result = divide(10.0, 2.0);
    
    match result {
        Ok(value) => println!("结果: {}", value),
        Err(error) => println!("错误: {}", error),
    }
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除零错误".to_string())
    } else {
        Ok(a / b)
    }
}
```

## 创建 Result 值

### 1. 直接创建

```rust
fn main() {
    let success: Result<i32, String> = Ok(42);
    let failure: Result<i32, String> = Err("Something went wrong".to_string());
    
    println!("成功: {:?}", success);
    println!("失败: {:?}", failure);
}
```

### 2. 从函数返回

```rust
fn check_password(password: &str) -> Result<(), String> {
    if password.len() < 8 {
        Err("密码长度不足8位".to_string())
    } else if !password.chars().any(|c| c.is_numeric()) {
        Err("密码必须包含数字".to_string())
    } else if !password.chars().any(|c| c.is_alphabetic()) {
        Err("密码必须包含字母".to_string())
    } else {
        Ok(())
    }
}

fn main() {
    let passwords = ["123", "password", "pass123", "Password123"];
    
    for password in passwords {
        match check_password(password) {
            Ok(()) => println!("密码 '{}' 验证成功", password),
            Err(error) => println!("密码 '{}' 验证失败: {}", password, error),
        }
    }
}
```

### 3. 从标准库函数

```rust
use std::fs::File;
use std::num::ParseIntError;

fn main() {
    // 文件操作
    let file_result = File::open("example.txt");
    match file_result {
        Ok(file) => println!("文件打开成功: {:?}", file),
        Err(error) => println!("文件打开失败: {}", error),
    }
    
    // 字符串解析
    let parse_result = "42".parse::<i32>();
    match parse_result {
        Ok(number) => println!("解析成功: {}", number),
        Err(error) => println!("解析失败: {}", error),
    }
    
    // 错误的解析
    let parse_error = "not_a_number".parse::<i32>();
    match parse_error {
        Ok(number) => println!("解析成功: {}", number),
        Err(error) => println!("解析失败: {}", error),
    }
}
```

## 处理 Result 的方法

### 1. match 表达式

```rust
fn main() {
    let result = divide(10.0, 3.0);
    
    match result {
        Ok(value) => {
            println!("计算成功，结果: {}", value);
            // 可以继续处理成功的值
        }
        Err(error) => {
            println!("计算失败: {}", error);
            // 可以处理错误，比如记录日志或返回默认值
        }
    }
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除零错误".to_string())
    } else {
        Ok(a / b)
    }
}
```

### 2. if let 表达式

```rust
fn main() {
    let result = parse_number("42");
    
    // 只关心成功的情况
    if let Ok(number) = result {
        println!("解析成功: {}", number);
    }
    
    // 只关心错误的情况
    if let Err(error) = result {
        println!("解析失败: {}", error);
    }
}

fn parse_number(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse::<i32>()
}
```

### 3. unwrap 和 expect

```rust
fn main() {
    // unwrap: 如果是 Ok 返回值，如果是 Err 就 panic
    let result = Ok(42);
    let value = result.unwrap();
    println!("值: {}", value);
    
    // expect: 类似 unwrap，但可以提供自定义错误信息
    let result = Ok(42);
    let value = result.expect("这应该是一个有效的数字");
    println!("值: {}", value);
    
    // 注意：这些方法在错误时会导致 panic
    // let error_result: Result<i32, String> = Err("错误".to_string());
    // let value = error_result.unwrap();  // 这会导致 panic
}
```

## Result 的方法

### 1. 检查方法

```rust
fn main() {
    let success: Result<i32, String> = Ok(42);
    let failure: Result<i32, String> = Err("error".to_string());
    
    // 检查是否成功
    println!("success.is_ok(): {}", success.is_ok());
    println!("failure.is_ok(): {}", failure.is_ok());
    
    // 检查是否失败
    println!("success.is_err(): {}", success.is_err());
    println!("failure.is_err(): {}", failure.is_err());
    
    // 检查是否匹配特定值
    println!("success.is_ok_and(|x| x > 40): {}", success.is_ok_and(|x| x > 40));
    println!("success.is_err_and(|e| e.len() > 3): {}", success.is_err_and(|e| e.len() > 3));
}
```

### 2. 提取值的方法

```rust
fn main() {
    let success: Result<i32, String> = Ok(42);
    let failure: Result<i32, String> = Err("error".to_string());
    
    // unwrap_or: 如果是 Ok 返回值，如果是 Err 返回默认值
    println!("success.unwrap_or(0): {}", success.unwrap_or(0));
    println!("failure.unwrap_or(0): {}", failure.unwrap_or(0));
    
    // unwrap_or_else: 如果是 Err，调用闭包计算默认值
    let result = failure.unwrap_or_else(|error| {
        println!("处理错误: {}", error);
        -1
    });
    println!("结果: {}", result);
    
    // unwrap_or_default: 使用类型的默认值
    let default_value = failure.unwrap_or_default();
    println!("默认值: {}", default_value);
}
```

### 3. 转换方法

```rust
fn main() {
    let result: Result<i32, String> = Ok(42);
    
    // map: 转换成功值
    let doubled = result.map(|x| x * 2);
    println!("doubled: {:?}", doubled);
    
    // map_err: 转换错误值
    let error_result: Result<i32, String> = Err("error".to_string());
    let mapped_error = error_result.map_err(|e| format!("处理错误: {}", e));
    println!("mapped_error: {:?}", mapped_error);
    
    // and_then: 链式操作（类似 flatMap）
    let result = Ok(42);
    let chained = result.and_then(|x| {
        if x > 40 {
            Ok(x * 2)
        } else {
            Err("值太小".to_string())
        }
    });
    println!("chained: {:?}", chained);
}
```

## 组合 Result

### 1. 使用 and_then 链式操作

```rust
fn main() {
    let result = parse_and_validate("42");
    match result {
        Ok(value) => println!("最终结果: {}", value),
        Err(error) => println!("错误: {}", error),
    }
}

fn parse_string(s: &str) -> Result<i32, String> {
    s.parse::<i32>().map_err(|e| format!("解析错误: {}", e))
}

fn validate_positive(n: i32) -> Result<i32, String> {
    if n > 0 {
        Ok(n)
    } else {
        Err("数字必须是正数".to_string())
    }
}

fn validate_even(n: i32) -> Result<i32, String> {
    if n % 2 == 0 {
        Ok(n)
    } else {
        Err("数字必须是偶数".to_string())
    }
}

fn parse_and_validate(s: &str) -> Result<i32, String> {
    parse_string(s)
        .and_then(validate_positive)
        .and_then(validate_even)
}
```

### 2. 使用 ? 操作符

```rust
fn parse_and_validate_with_question_mark(s: &str) -> Result<i32, String> {
    let number = parse_string(s)?;
    let positive = validate_positive(number)?;
    let even = validate_even(positive)?;
    Ok(even)
}

fn main() {
    let test_cases = ["42", "41", "-2", "not_a_number"];
    
    for test in test_cases {
        match parse_and_validate_with_question_mark(test) {
            Ok(value) => println!("'{}'解析成功: {}", test, value),
            Err(error) => println!("'{}'解析失败: {}", test, error),
        }
    }
}
```

## 实践练习

### 练习 1：用户输入验证

```rust
#[derive(Debug)]
struct User {
    username: String,
    email: String,
    age: u32,
}

fn validate_username(username: &str) -> Result<String, String> {
    if username.len() < 3 {
        Err("用户名至少需要3个字符".to_string())
    } else if username.len() > 20 {
        Err("用户名不能超过20个字符".to_string())
    } else if !username.chars().all(|c| c.is_alphanumeric() || c == '_') {
        Err("用户名只能包含字母、数字和下划线".to_string())
    } else {
        Ok(username.to_string())
    }
}

fn validate_email(email: &str) -> Result<String, String> {
    if email.contains('@') && email.contains('.') {
        Ok(email.to_string())
    } else {
        Err("邮箱格式不正确".to_string())
    }
}

fn validate_age(age_str: &str) -> Result<u32, String> {
    match age_str.parse::<u32>() {
        Ok(age) => {
            if age < 13 {
                Err("年龄不能小于13岁".to_string())
            } else if age > 120 {
                Err("年龄不能大于120岁".to_string())
            } else {
                Ok(age)
            }
        }
        Err(_) => Err("年龄必须是数字".to_string()),
    }
}

fn create_user(username: &str, email: &str, age_str: &str) -> Result<User, String> {
    let username = validate_username(username)?;
    let email = validate_email(email)?;
    let age = validate_age(age_str)?;
    
    Ok(User { username, email, age })
}

fn main() {
    let test_cases = [
        ("alice", "alice@example.com", "25"),
        ("ab", "alice@example.com", "25"),
        ("alice", "invalid_email", "25"),
        ("alice", "alice@example.com", "12"),
        ("alice", "alice@example.com", "not_a_number"),
    ];
    
    for (username, email, age) in test_cases {
        match create_user(username, email, age) {
            Ok(user) => println!("用户创建成功: {:?}", user),
            Err(error) => println!("用户创建失败: {}", error),
        }
    }
}
```

### 练习 2：配置文件解析

```rust
use std::collections::HashMap;

#[derive(Debug)]
struct Config {
    server_port: u16,
    database_url: String,
    debug_mode: bool,
}

fn parse_config(content: &str) -> Result<Config, String> {
    let mut config_map = HashMap::new();
    
    // 解析配置文件内容
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        let parts: Vec<&str> = line.split('=').collect();
        if parts.len() != 2 {
            return Err(format!("无效的配置行: {}", line));
        }
        
        let key = parts[0].trim();
        let value = parts[1].trim();
        config_map.insert(key, value);
    }
    
    // 解析必需的配置项
    let server_port = config_map
        .get("server_port")
        .ok_or("缺少 server_port 配置")?
        .parse::<u16>()
        .map_err(|_| "server_port 必须是有效的端口号")?;
    
    let database_url = config_map
        .get("database_url")
        .ok_or("缺少 database_url 配置")?
        .to_string();
    
    let debug_mode = config_map
        .get("debug_mode")
        .ok_or("缺少 debug_mode 配置")?
        .parse::<bool>()
        .map_err(|_| "debug_mode 必须是 true 或 false")?;
    
    Ok(Config {
        server_port,
        database_url,
        debug_mode,
    })
}

fn main() {
    let config_content = r#"
        # 服务器配置
        server_port = 8080
        database_url = postgresql://localhost/mydb
        debug_mode = true
    "#;
    
    match parse_config(config_content) {
        Ok(config) => println!("配置解析成功: {:?}", config),
        Err(error) => println!("配置解析失败: {}", error),
    }
    
    // 测试错误情况
    let invalid_config = r#"
        server_port = invalid_port
        database_url = postgresql://localhost/mydb
        debug_mode = true
    "#;
    
    match parse_config(invalid_config) {
        Ok(config) => println!("配置解析成功: {:?}", config),
        Err(error) => println!("配置解析失败: {}", error),
    }
}
```

### 练习 3：HTTP 状态码处理

```rust
#[derive(Debug)]
enum HttpError {
    NotFound,
    Unauthorized,
    InternalServerError,
    BadRequest,
}

impl std::fmt::Display for HttpError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            HttpError::NotFound => write!(f, "404 Not Found"),
            HttpError::Unauthorized => write!(f, "401 Unauthorized"),
            HttpError::InternalServerError => write!(f, "500 Internal Server Error"),
            HttpError::BadRequest => write!(f, "400 Bad Request"),
        }
    }
}

fn handle_http_status(status_code: u16) -> Result<String, HttpError> {
    match status_code {
        200 => Ok("OK".to_string()),
        201 => Ok("Created".to_string()),
        202 => Ok("Accepted".to_string()),
        400 => Err(HttpError::BadRequest),
        401 => Err(HttpError::Unauthorized),
        404 => Err(HttpError::NotFound),
        500 => Err(HttpError::InternalServerError),
        _ => Err(HttpError::InternalServerError),
    }
}

fn process_request(status_code: u16) -> Result<String, HttpError> {
    let response = handle_http_status(status_code)?;
    Ok(format!("请求处理成功: {}", response))
}

fn main() {
    let status_codes = [200, 201, 400, 401, 404, 500, 999];
    
    for status in status_codes {
        match process_request(status) {
            Ok(message) => println!("状态码 {}: {}", status, message),
            Err(error) => println!("状态码 {}: 错误 - {}", status, error),
        }
    }
}
```

## 常见模式和技巧

### 1. 转换错误类型

```rust
fn main() {
    let result = convert_errors();
    match result {
        Ok(value) => println!("成功: {}", value),
        Err(error) => println!("错误: {}", error),
    }
}

fn convert_errors() -> Result<i32, String> {
    // 使用 map_err 转换错误类型
    let number = "42".parse::<i32>()
        .map_err(|e| format!("解析错误: {}", e))?;
    
    // 使用 ok_or 将 Option 转换为 Result
    let doubled = Some(number * 2)
        .ok_or("计算失败".to_string())?;
    
    Ok(doubled)
}
```

### 2. 收集多个 Result

```rust
fn main() {
    let numbers = ["1", "2", "3", "4", "5"];
    
    // 收集所有成功的结果
    let results: Result<Vec<i32>, _> = numbers
        .iter()
        .map(|s| s.parse::<i32>())
        .collect();
    
    match results {
        Ok(numbers) => println!("所有数字: {:?}", numbers),
        Err(error) => println!("解析错误: {}", error),
    }
    
    // 收集部分成功的结果
    let partial_results: Vec<i32> = numbers
        .iter()
        .filter_map(|s| s.parse::<i32>().ok())
        .collect();
    
    println!("部分结果: {:?}", partial_results);
}
```

### 3. 默认值处理

```rust
fn main() {
    let config = load_config();
    
    let port = config.get_port().unwrap_or(8080);
    let host = config.get_host().unwrap_or_else(|| "localhost".to_string());
    
    println!("服务器配置: {}:{}", host, port);
}

struct Config;

impl Config {
    fn get_port(&self) -> Result<u16, String> {
        // 模拟配置读取失败
        Err("端口配置未找到".to_string())
    }
    
    fn get_host(&self) -> Result<String, String> {
        // 模拟配置读取失败
        Err("主机配置未找到".to_string())
    }
}

fn load_config() -> Config {
    Config
}
```

## 总结

Result 类型是 Rust 错误处理的核心：

1. **类型安全**：错误必须被显式处理
2. **可组合**：可以通过各种方法组合和转换
3. **表达力强**：清晰地表达操作可能成功或失败
4. **零成本**：编译时优化，无运行时开销
5. **丰富的方法**：提供多种处理和转换方式

掌握 Result 类型的使用是编写健壮 Rust 程序的关键技能。

## 下一步

完成本节学习后，请继续学习 [02-Option 类型](02-option-type.md)。