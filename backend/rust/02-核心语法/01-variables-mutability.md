# 变量与可变性

## 学习目标

- 理解 Rust 中变量的概念
- 掌握变量声明和赋值
- 理解可变性和不可变性
- 学会使用常量
- 理解变量遮蔽（Shadowing）

## 变量声明

### 1. 基本变量声明

```rust
fn main() {
    let x = 5;
    println!("x 的值是: {}", x);
}
```

- 使用 `let` 关键字声明变量
- 默认情况下，变量是不可变的
- 变量名使用 snake_case 命名风格

### 2. 类型推断

```rust
fn main() {
    let x = 5;          // 编译器推断为 i32
    let y = 3.14;       // 编译器推断为 f64
    let z = true;       // 编译器推断为 bool
    let s = "hello";    // 编译器推断为 &str
    
    println!("x: {}, y: {}, z: {}, s: {}", x, y, z, s);
}
```

### 3. 显式类型注解

```rust
fn main() {
    let x: i32 = 5;
    let y: f64 = 3.14;
    let z: bool = true;
    let s: &str = "hello";
    
    // 在必要时使用类型注解
    let numbers: Vec<i32> = Vec::new();
    let parsed: i32 = "42".parse().expect("Not a number!");
    
    println!("numbers: {:?}, parsed: {}", numbers, parsed);
}
```

## 可变性

### 1. 不可变变量（默认）

```rust
fn main() {
    let x = 5;
    println!("x 的值是: {}", x);
    
    // x = 6;  // 编译错误！不能修改不可变变量
}
```

### 2. 可变变量

```rust
fn main() {
    let mut x = 5;
    println!("x 的值是: {}", x);
    
    x = 6;  // 正确！可以修改可变变量
    println!("x 的值是: {}", x);
}
```

### 3. 为什么默认不可变？

```rust
fn main() {
    let config = load_config();
    
    // 如果 config 是不可变的，我们可以确信它不会被意外修改
    // 这有助于防止并发错误和逻辑错误
    
    process_data(&config);
    save_results(&config);
}

fn load_config() -> String {
    String::from("config_data")
}

fn process_data(config: &String) {
    println!("Processing with config: {}", config);
}

fn save_results(config: &String) {
    println!("Saving results with config: {}", config);
}
```

## 常量

### 1. 常量声明

```rust
const MAX_POINTS: u32 = 100_000;
const PI: f64 = 3.14159;
const APP_NAME: &str = "My App";

fn main() {
    println!("最大分数: {}", MAX_POINTS);
    println!("π 的值: {}", PI);
    println!("应用名称: {}", APP_NAME);
}
```

### 2. 常量 vs 变量

| 特性 | 常量 | 不可变变量 |
|------|------|-----------|
| 关键字 | `const` | `let` |
| 命名规范 | UPPER_CASE | snake_case |
| 类型注解 | 必须 | 可选 |
| 作用域 | 全局或函数 | 块级 |
| 编译时求值 | 是 | 否 |
| 运行时求值 | 否 | 是 |

```rust
const GLOBAL_MAX: u32 = 100;    // 全局常量

fn main() {
    const LOCAL_MAX: u32 = 50;   // 局部常量
    let runtime_value = get_value();  // 运行时求值
    
    println!("全局最大值: {}", GLOBAL_MAX);
    println!("局部最大值: {}", LOCAL_MAX);
    println!("运行时值: {}", runtime_value);
}

fn get_value() -> u32 {
    42
}
```

## 变量遮蔽（Shadowing）

### 1. 基本遮蔽

```rust
fn main() {
    let x = 5;
    println!("x 的值是: {}", x);
    
    let x = x + 1;  // 创建新变量，遮蔽前一个
    println!("x 的值是: {}", x);
    
    let x = x * 2;  // 再次遮蔽
    println!("x 的值是: {}", x);
}
```

**输出**:
```
x 的值是: 5
x 的值是: 6
x 的值是: 12
```

### 2. 类型转换遮蔽

```rust
fn main() {
    let spaces = "   ";           // &str 类型
    let spaces = spaces.len();     // usize 类型
    
    println!("空格数量: {}", spaces);
    
    // 这比使用不同的变量名更清晰
    // let spaces_str = "   ";
    // let spaces_count = spaces_str.len();
}
```

### 3. 作用域遮蔽

```rust
fn main() {
    let x = 5;
    
    {
        let x = x * 2;  // 内部作用域遮蔽
        println!("内部作用域 x: {}", x);
    }
    
    println!("外部作用域 x: {}", x);
}
```

**输出**:
```
内部作用域 x: 10
外部作用域 x: 5
```

### 4. 遮蔽 vs 可变性

```rust
fn main() {
    // 遮蔽 - 可以改变类型
    let x = "hello";
    let x = x.len();
    
    // 可变性 - 不能改变类型
    let mut y = "hello";
    // y = y.len();  // 编译错误！类型不匹配
    y = "world";     // 正确，同样的类型
    
    println!("x: {}, y: {}", x, y);
}
```

## 变量的生命周期和作用域

### 1. 块级作用域

```rust
fn main() {
    let x = 1;
    println!("外部 x: {}", x);
    
    {
        let x = 2;
        println!("内部 x: {}", x);
        
        let y = 3;
        println!("内部 y: {}", y);
    }  // y 在这里离开作用域并被销毁
    
    println!("外部 x: {}", x);
    // println!("y: {}", y);  // 编译错误！y 不在作用域内
}
```

### 2. 函数作用域

```rust
fn main() {
    let global_var = 10;
    
    {
        let local_var = 20;
        inner_function(global_var, local_var);
    }
    
    // inner_function(global_var, local_var);  // 编译错误！local_var 不在作用域内
}

fn inner_function(a: i32, b: i32) {
    println!("a: {}, b: {}", a, b);
}
```

## 实践练习

### 练习 1：温度转换器

```rust
fn main() {
    let fahrenheit = 32.0;
    println!("华氏温度: {}°F", fahrenheit);
    
    let celsius = (fahrenheit - 32.0) * 5.0 / 9.0;
    println!("摄氏温度: {}°C", celsius);
    
    // 使用遮蔽进行单位转换
    let temperature = 100.0;  // 摄氏度
    println!("摄氏温度: {}°C", temperature);
    
    let temperature = temperature * 9.0 / 5.0 + 32.0;  // 转换为华氏度
    println!("华氏温度: {}°F", temperature);
}
```

### 练习 2：计数器

```rust
fn main() {
    let mut counter = 0;
    
    println!("初始计数: {}", counter);
    
    // 增加计数
    counter += 1;
    println!("增加后计数: {}", counter);
    
    // 批量增加
    counter += 10;
    println!("批量增加后计数: {}", counter);
    
    // 重置计数
    counter = 0;
    println!("重置后计数: {}", counter);
}
```

### 练习 3：字符串处理

```rust
fn main() {
    let message = "Hello, World!";
    println!("原始消息: {}", message);
    
    let message = message.to_uppercase();
    println!("大写消息: {}", message);
    
    let message = message.len();
    println!("消息长度: {}", message);
    
    // 演示不同类型的遮蔽
    let data = "123";
    println!("字符串数据: {}", data);
    
    let data = data.parse::<i32>().unwrap();
    println!("数字数据: {}", data);
    
    let data = data * 2;
    println!("计算后数据: {}", data);
}
```

### 练习 4：配置管理

```rust
const DEFAULT_PORT: u16 = 8080;
const DEFAULT_HOST: &str = "localhost";
const MAX_CONNECTIONS: u32 = 1000;

fn main() {
    let mut port = DEFAULT_PORT;
    let mut host = DEFAULT_HOST;
    let max_connections = MAX_CONNECTIONS;
    
    println!("默认配置:");
    println!("  主机: {}", host);
    println!("  端口: {}", port);
    println!("  最大连接数: {}", max_connections);
    
    // 模拟从配置文件读取
    port = 3000;
    host = "0.0.0.0";
    
    println!("\\n更新后配置:");
    println!("  主机: {}", host);
    println!("  端口: {}", port);
    println!("  最大连接数: {}", max_connections);
}
```

## 常见错误和解决方案

### 1. 修改不可变变量

```rust
fn main() {
    let x = 5;
    // x = 6;  // 编译错误
}
```

**错误信息**:
```
error[E0384]: cannot assign twice to immutable variable `x`
```

**解决方案**:
```rust
fn main() {
    let mut x = 5;  // 添加 mut 关键字
    x = 6;          // 现在可以修改了
}
```

### 2. 常量必须有类型注解

```rust
// const MAX = 100;  // 编译错误
const MAX: u32 = 100;  // 正确
```

### 3. 使用未初始化的变量

```rust
fn main() {
    let x;
    // println!("{}", x);  // 编译错误
    
    x = 5;
    println!("{}", x);  // 正确
}
```

### 4. 变量遮蔽陷阱

```rust
fn main() {
    let x = 5;
    
    {
        let x = "hello";
        println!("内部 x: {}", x);
    }
    
    // 这里的 x 仍然是 5，不是 "hello"
    println!("外部 x: {}", x);
}
```

## 最佳实践

### 1. 优先使用不可变变量

```rust
fn main() {
    // 推荐：默认使用不可变变量
    let config = load_config();
    let processed_data = process(config);
    
    // 只有在真正需要修改时才使用 mut
    let mut counter = 0;
    for item in items {
        counter += 1;
        // 处理 item
    }
}

fn load_config() -> String {
    String::from("config")
}

fn process(config: String) -> String {
    config.to_uppercase()
}
```

### 2. 使用有意义的变量名

```rust
fn main() {
    // 不推荐
    let x = 25;
    let y = 30;
    
    // 推荐
    let user_age = 25;
    let max_age = 30;
    
    if user_age < max_age {
        println!("用户年龄符合要求");
    }
}
```

### 3. 适当使用常量

```rust
const MAX_RETRY_COUNT: u32 = 3;
const DEFAULT_TIMEOUT: u64 = 30;

fn main() {
    let mut retry_count = 0;
    
    while retry_count < MAX_RETRY_COUNT {
        if attempt_operation() {
            break;
        }
        retry_count += 1;
        
        // 使用常量使代码更清晰
        std::thread::sleep(std::time::Duration::from_secs(DEFAULT_TIMEOUT));
    }
}

fn attempt_operation() -> bool {
    // 模拟操作
    true
}
```

### 4. 合理使用变量遮蔽

```rust
fn main() {
    // 好的遮蔽用法：类型转换
    let input = "42";
    let input = input.parse::<i32>().unwrap();
    let input = input * 2;
    
    // 避免过度遮蔽导致混淆
    let data = "hello";
    let data_length = data.len();  // 使用不同名称更清晰
}
```

## 总结

变量和可变性是 Rust 的基础概念：

1. **默认不可变**：变量默认是不可变的，需要显式使用 `mut` 关键字
2. **类型安全**：编译器会进行类型检查，防止类型错误
3. **变量遮蔽**：可以创建同名变量，甚至改变类型
4. **作用域管理**：变量有明确的生命周期和作用域
5. **性能和安全**：不可变性有助于并发安全和编译器优化

理解这些概念对于掌握 Rust 的内存安全和并发安全至关重要。

## 下一步

完成本节学习后，请继续学习 [02-数据类型](02-data-types.md)。