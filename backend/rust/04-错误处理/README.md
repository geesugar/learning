# 04-错误处理

## 本章概述

错误处理是编程中的重要部分，Rust 提供了强大而优雅的错误处理机制。与其他语言使用异常不同，Rust 使用类型系统来处理错误，确保程序的可靠性和安全性。

## 学习目标

- 理解 Rust 的错误处理哲学
- 掌握 `Result<T, E>` 类型的使用
- 掌握 `Option<T>` 类型的使用
- 学会使用 `?` 操作符
- 理解可恢复错误和不可恢复错误
- 掌握自定义错误类型的创建

## 章节内容

### [01-Result 类型](01-result-type.md)
- Result 枚举的定义和使用
- 成功和错误情况的处理
- match 表达式处理 Result
- Result 的常用方法

### [02-Option 类型](02-option-type.md)
- Option 枚举的定义和使用
- 处理可能为空的值
- Option 的常用方法
- Option 与 Result 的结合使用

### [03-错误传播](03-error-propagation.md)
- 使用 `?` 操作符传播错误
- 错误传播的最佳实践
- 错误链和错误上下文
- 自定义错误传播

### [04-panic 处理](04-panic-handling.md)
- 不可恢复错误的处理
- panic! 宏的使用
- 自定义 panic 处理
- 何时使用 panic

### [05-自定义错误类型](05-custom-error-types.md)
- 创建自定义错误类型
- 实现 Error trait
- 错误类型的最佳实践
- 使用 thiserror 和 anyhow 库

## 核心概念

### 错误处理的两种方式

#### 1. 可恢复错误（Result<T, E>）
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let file_result = File::open("hello.txt");
    
    match file_result {
        Ok(file) => println!("文件打开成功: {:?}", file),
        Err(error) => match error.kind() {
            ErrorKind::NotFound => println!("文件不存在"),
            ErrorKind::PermissionDenied => println!("权限不足"),
            other_error => println!("其他错误: {:?}", other_error),
        },
    }
}
```

#### 2. 不可恢复错误（panic!）
```rust
fn main() {
    let v = vec![1, 2, 3];
    
    // 这会导致 panic
    // v[99];
    
    // 主动触发 panic
    if true {
        panic!("程序遇到了无法处理的错误！");
    }
}
```

### Option 类型处理空值
```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    
    // 安全地访问数组元素
    match numbers.get(10) {
        Some(value) => println!("值: {}", value),
        None => println!("索引越界"),
    }
    
    // 字符串解析
    let string_number = "42";
    match string_number.parse::<i32>() {
        Ok(number) => println!("解析成功: {}", number),
        Err(error) => println!("解析失败: {}", error),
    }
}
```

### 错误传播与 ? 操作符
```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?;
    let mut username = String::new();
    file.read_to_string(&mut username)?;
    Ok(username)
}

fn main() {
    match read_username_from_file() {
        Ok(username) => println!("用户名: {}", username),
        Err(error) => println!("读取失败: {}", error),
    }
}
```

## 实践练习

### 练习 1：文件处理
```rust
use std::fs::File;
use std::io::{self, Read, Write};

fn read_file_content(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}

fn write_file_content(path: &str, content: &str) -> Result<(), io::Error> {
    let mut file = File::create(path)?;
    file.write_all(content.as_bytes())?;
    Ok(())
}

fn main() {
    // 写入文件
    if let Err(error) = write_file_content("test.txt", "Hello, Rust!") {
        eprintln!("写入文件失败: {}", error);
        return;
    }
    
    // 读取文件
    match read_file_content("test.txt") {
        Ok(content) => println!("文件内容: {}", content),
        Err(error) => eprintln!("读取文件失败: {}", error),
    }
}
```

### 练习 2：数据解析
```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
    email: String,
}

fn parse_person(input: &str) -> Result<Person, String> {
    let parts: Vec<&str> = input.split(',').collect();
    
    if parts.len() != 3 {
        return Err("格式错误：需要 name,age,email".to_string());
    }
    
    let name = parts[0].trim().to_string();
    if name.is_empty() {
        return Err("姓名不能为空".to_string());
    }
    
    let age = parts[1].trim().parse::<u32>()
        .map_err(|_| "年龄必须是数字".to_string())?;
    
    let email = parts[2].trim().to_string();
    if !email.contains('@') {
        return Err("邮箱格式错误".to_string());
    }
    
    Ok(Person { name, age, email })
}

fn main() {
    let inputs = [
        "Alice,30,alice@example.com",
        "Bob,invalid_age,bob@example.com",
        "Charlie,25,invalid_email",
        "David,35",
    ];
    
    for input in inputs {
        match parse_person(input) {
            Ok(person) => println!("解析成功: {:?}", person),
            Err(error) => println!("解析失败 '{}': {}", input, error),
        }
    }
}
```

### 练习 3：计算器
```rust
#[derive(Debug)]
enum CalculatorError {
    DivisionByZero,
    InvalidOperation,
    ParseError(String),
}

impl std::fmt::Display for CalculatorError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CalculatorError::DivisionByZero => write!(f, "除零错误"),
            CalculatorError::InvalidOperation => write!(f, "无效操作"),
            CalculatorError::ParseError(msg) => write!(f, "解析错误: {}", msg),
        }
    }
}

impl std::error::Error for CalculatorError {}

fn calculate(expression: &str) -> Result<f64, CalculatorError> {
    let parts: Vec<&str> = expression.split_whitespace().collect();
    
    if parts.len() != 3 {
        return Err(CalculatorError::InvalidOperation);
    }
    
    let left = parts[0].parse::<f64>()
        .map_err(|e| CalculatorError::ParseError(e.to_string()))?;
    
    let operator = parts[1];
    
    let right = parts[2].parse::<f64>()
        .map_err(|e| CalculatorError::ParseError(e.to_string()))?;
    
    match operator {
        "+" => Ok(left + right),
        "-" => Ok(left - right),
        "*" => Ok(left * right),
        "/" => {
            if right == 0.0 {
                Err(CalculatorError::DivisionByZero)
            } else {
                Ok(left / right)
            }
        }
        _ => Err(CalculatorError::InvalidOperation),
    }
}

fn main() {
    let expressions = [
        "10 + 5",
        "20 - 8",
        "6 * 7",
        "15 / 3",
        "10 / 0",
        "5 % 2",
        "invalid expression",
    ];
    
    for expr in expressions {
        match calculate(expr) {
            Ok(result) => println!("{} = {}", expr, result),
            Err(error) => println!("{} -> 错误: {}", expr, error),
        }
    }
}
```

## 错误处理最佳实践

### 1. 明确错误类型
```rust
// 好的做法：使用具体的错误类型
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除零错误".to_string())
    } else {
        Ok(a / b)
    }
}

// 更好的做法：使用自定义错误类型
#[derive(Debug)]
enum MathError {
    DivisionByZero,
    InvalidInput,
}

fn divide_better(a: f64, b: f64) -> Result<f64, MathError> {
    if b == 0.0 {
        Err(MathError::DivisionByZero)
    } else {
        Ok(a / b)
    }
}
```

### 2. 使用 ? 操作符简化代码
```rust
use std::fs::File;
use std::io::{self, Read};

// 繁琐的写法
fn read_file_verbose(path: &str) -> Result<String, io::Error> {
    let file = match File::open(path) {
        Ok(file) => file,
        Err(error) => return Err(error),
    };
    
    let mut content = String::new();
    match file.read_to_string(&mut content) {
        Ok(_) => Ok(content),
        Err(error) => Err(error),
    }
}

// 简洁的写法
fn read_file_concise(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}
```

### 3. 合理使用 unwrap 和 expect
```rust
fn main() {
    // 在原型阶段可以使用 unwrap
    let content = std::fs::read_to_string("config.txt").unwrap();
    
    // 在生产代码中使用 expect 提供更好的错误信息
    let config = std::fs::read_to_string("config.txt")
        .expect("配置文件必须存在");
    
    // 最好的做法：正确处理错误
    match std::fs::read_to_string("config.txt") {
        Ok(content) => println!("配置: {}", content),
        Err(error) => {
            eprintln!("无法读取配置文件: {}", error);
            std::process::exit(1);
        }
    }
}
```

## 常见错误和解决方案

### 1. 忘记处理错误
```rust
use std::fs::File;

fn main() {
    // 错误：忽略了错误
    // let file = File::open("nonexistent.txt");
    
    // 正确：处理错误
    match File::open("nonexistent.txt") {
        Ok(file) => println!("文件打开成功"),
        Err(error) => println!("文件打开失败: {}", error),
    }
}
```

### 2. 错误传播类型不匹配
```rust
use std::fs::File;
use std::io;

// 错误：返回类型不匹配
// fn read_file() -> Result<String, io::Error> {
//     let content = std::fs::read_to_string("file.txt")?;
//     let number: i32 = content.parse()?;  // 错误！parse 返回不同的错误类型
//     Ok(number.to_string())
// }

// 正确：使用 map_err 转换错误类型
fn read_file() -> Result<String, io::Error> {
    let content = std::fs::read_to_string("file.txt")?;
    let number: i32 = content.parse()
        .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
    Ok(number.to_string())
}
```

### 3. 过度使用 panic
```rust
fn main() {
    // 错误：对可恢复错误使用 panic
    // let number: i32 = "not_a_number".parse().unwrap();
    
    // 正确：使用 Result 处理
    match "not_a_number".parse::<i32>() {
        Ok(number) => println!("数字: {}", number),
        Err(error) => println!("解析错误: {}", error),
    }
}
```

## 总结

Rust 的错误处理系统提供了强大的工具来编写可靠的程序：

1. **类型安全**：错误在类型系统中明确表示
2. **强制处理**：编译器确保错误被处理
3. **可恢复 vs 不可恢复**：清晰区分不同类型的错误
4. **零成本抽象**：错误处理不影响性能
5. **组合性**：错误类型可以组合和转换

掌握错误处理对于编写高质量的 Rust 程序至关重要。

## 下一步

完成本章学习后，请继续学习 [05-泛型与trait](../05-泛型与trait/README.md)。