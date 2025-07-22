# 命令行计算器

## 项目概述

这是一个功能完整的命令行计算器，支持基本四则运算，具有交互式和命令行两种使用模式。项目展示了Rust的模式匹配、错误处理、用户输入处理等核心概念。

## 学习目标

- 掌握枚举（enum）的定义和使用
- 学会模式匹配（match）的各种用法
- 理解自定义错误类型的设计
- 学习用户输入的读取和验证
- 掌握字符串解析和转换
- 了解命令行参数处理

## 知识点

### 1. 枚举和模式匹配
- 定义操作类型枚举
- 使用match进行模式匹配
- 处理Result类型的匹配

### 2. 错误处理
- 自定义错误类型
- 实现Display trait
- 错误传播和转换

### 3. 字符串处理
- 字符串解析为数字
- 字符串比较和匹配
- 输入验证和清理

### 4. 用户交互
- 标准输入读取
- 格式化输出
- 循环控制和退出条件

## 功能特性

### 基本运算
- 加法 (+)
- 减法 (-)
- 乘法 (*)
- 除法 (/) - 包含除零检查

### 多语言支持
- 支持英文运算符：+, -, *, /
- 支持英文单词：add, subtract, multiply, divide
- 支持中文：加, 减, 乘, 除

### 使用模式

#### 交互式模式
```bash
cargo run
```

程序会引导你逐步输入：
1. 第一个数字
2. 运算符
3. 第二个数字

#### 命令行模式
```bash
cargo run -- 10 + 5
cargo run -- 20.5 * 3
cargo run -- 100 / 4
```

### 特殊功能

#### 数学趣味功能
- 自动识别完全平方数
- 自动识别质数
- 为结果提供数学小知识

#### 帮助系统
- 输入 `help` 查看使用说明
- 输入 `quit` 或 `exit` 退出程序

## 代码结构

```rust
// 核心枚举定义
enum Operation {
    Add,
    Subtract,
    Multiply,
    Divide,
}

enum CalculatorError {
    InvalidInput,
    DivisionByZero,
    InvalidOperation,
}

// 主要结构体
struct Calculator;
```

### 关键方法

1. **calculate()** - 执行数学运算
2. **parse_operation()** - 解析运算符
3. **parse_number()** - 解析数字
4. **run_interactive_mode()** - 交互式模式主循环

## 使用示例

### 基本运算示例

```
🧮 命令行计算器
支持的运算：加法(+)、减法(-)、乘法(*)、除法(/)
输入 'quit' 或 'exit' 退出程序

请输入第一个数字:
10

请输入运算符 (+, -, *, /):
+

请输入第二个数字:
5

✅ 结果: 10 + 5 = 15
```

### 错误处理示例

```
请输入第一个数字:
abc
❌ 输入格式错误，请输入数字

请输入第一个数字:
10

请输入运算符 (+, -, *, /):
%
❌ 不支持的运算符

请输入运算符 (+, -, *, /):
/

请输入第二个数字:
0
❌ 错误：不能除以零
```

## 运行项目

### 编译和运行

```bash
# 进入项目目录
cd examples/basic/02-cli-calculator

# 编译项目
cargo build

# 运行交互式模式
cargo run

# 运行命令行模式
cargo run -- 42 / 6

# 运行测试
cargo test

# 运行测试并显示输出
cargo test -- --nocapture
```

### 测试覆盖

项目包含完整的单元测试：
- 基本四则运算测试
- 错误处理测试
- 输入解析测试
- 数学功能测试（质数、完全平方数）

```bash
# 运行所有测试
cargo test

# 运行特定测试
cargo test test_basic_operations
cargo test test_division_by_zero
```

## 扩展练习

### 1. 添加更多运算符
```rust
enum Operation {
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,      // 幂运算
    Modulo,     // 取余
    Sqrt,       // 开方
}
```

### 2. 添加计算历史
```rust
struct Calculator {
    history: Vec<String>,
}
```

### 3. 支持复杂表达式
```rust
// 支持括号和运算符优先级
// 例如: (10 + 5) * 2 / 3
```

### 4. 添加内存功能
```rust
struct Calculator {
    memory: f64,
}

// 实现 M+, M-, MC, MR 等内存操作
```

### 5. 科学计算器功能
```rust
// 添加三角函数、对数、指数等
impl Calculator {
    fn sin(&self, x: f64) -> f64 { x.sin() }
    fn cos(&self, x: f64) -> f64 { x.cos() }
    fn log(&self, x: f64) -> f64 { x.ln() }
}
```

## 详细Rust语法解析

### 1. 枚举（Enum）定义和使用

#### 基础枚举定义
```rust
#[derive(Debug)]
enum Operation {
    Add,        // 变体（Variant）
    Subtract,
    Multiply,
    Divide,
}
```

**语法要点：**
- `enum` 关键字定义枚举类型
- `#[derive(Debug)]` 自动为枚举实现Debug trait，允许使用`{:?}`格式化打印
- 枚举变体使用大驼峰命名法（PascalCase）
- 每个变体后面用逗号分隔

#### 枚举的模式匹配
```rust
match guess.cmp(&secret_number) {
    Ordering::Less => {
        println!("太小了！");
        give_hint(guess, secret_number, attempts);
    }
    Ordering::Greater => {
        println!("太大了！");
        give_hint(guess, secret_number, attempts);
    }
    Ordering::Equal => {
        println!("🎉 恭喜你！你猜对了！");
        // ...
    }
}
```

**语法要点：**
- `match` 表达式必须涵盖所有可能的情况（穷尽性检查）
- 使用 `=>` 分隔模式和执行代码
- 可以在匹配分支中执行多行代码

### 2. 自定义错误类型

#### 错误枚举定义
```rust
#[derive(Debug)]
enum CalculatorError {
    InvalidInput,
    DivisionByZero,
    InvalidOperation,
}
```

#### 实现Display trait
```rust
impl std::fmt::Display for CalculatorError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CalculatorError::InvalidInput => write!(f, "输入格式错误，请输入数字"),
            CalculatorError::DivisionByZero => write!(f, "错误：不能除以零"),
            CalculatorError::InvalidOperation => write!(f, "不支持的运算符"),
        }
    }
}
```

**语法要点：**
- `impl Trait for Type` 语法为类型实现trait
- `std::fmt::Display` 允许使用`{}`格式化打印
- `write!` 宏用于向格式化器写入数据
- `std::fmt::Result` 是格式化操作的结果类型

### 3. 结构体和方法实现

#### 单元结构体
```rust
struct Calculator;
```

**语法要点：**
- 单元结构体不包含任何字段
- 常用于实现方法的载体

#### 方法实现
```rust
impl Calculator {
    fn new() -> Self {
        Calculator
    }
    
    fn calculate(&self, a: f64, b: f64, op: Operation) -> Result<f64, CalculatorError> {
        match op {
            Operation::Add => Ok(a + b),
            Operation::Subtract => Ok(a - b),
            Operation::Multiply => Ok(a * b),
            Operation::Divide => {
                if b == 0.0 {
                    Err(CalculatorError::DivisionByZero)
                } else {
                    Ok(a / b)
                }
            }
        }
    }
}
```

**语法要点：**
- `&self` 表示方法借用结构体实例（不可变借用）
- `Self` 是当前类型的别名
- `Result<T, E>` 用于可能失败的操作
- `Ok(value)` 表示成功结果
- `Err(error)` 表示错误结果

### 4. 字符串处理和解析

#### 字符串方法链
```rust
let guess: u32 = match guess.trim().parse() {
    Ok(num) => {
        if num < 1 || num > 100 {
            println!("请输入 1 到 100 之间的数字！");
            continue;
        }
        num
    }
    Err(_) => {
        println!("请输入一个有效的数字！");
        continue;
    }
};
```

**语法要点：**
- `trim()` 移除字符串两端的空白字符
- `parse()` 尝试将字符串解析为指定类型
- `parse()` 返回 `Result<T, ParseError>`
- 使用 `_` 忽略不需要的错误详情

#### 多模式匹配
```rust
match input.trim().to_lowercase().as_str() {
    "+" | "add" | "加" => Ok(Operation::Add),
    "-" | "subtract" | "减" => Ok(Operation::Subtract),
    "*" | "multiply" | "乘" => Ok(Operation::Multiply),
    "/" | "divide" | "除" => Ok(Operation::Divide),
    _ => Err(CalculatorError::InvalidOperation),
}
```

**语法要点：**
- `|` 操作符用于匹配多个模式
- `to_lowercase()` 转换为小写
- `as_str()` 将String转换为&str
- `_` 是通配符，匹配任何未明确处理的情况

### 5. 循环控制结构

#### loop 无限循环
```rust
loop {
    println!("请输入你的猜测:");
    
    let mut guess = String::new();
    io::stdin()
        .read_line(&mut guess)
        .expect("读取输入失败");
    
    // 处理逻辑...
    
    if should_break {
        break;  // 退出循环
    }
    
    if should_continue {
        continue;  // 跳到下一次迭代
    }
}
```

**语法要点：**
- `loop` 创建无限循环
- `break` 退出当前循环
- `continue` 跳过当前迭代，继续下一次

### 6. 所有权和借用

#### 可变借用
```rust
let mut guess = String::new();
io::stdin()
    .read_line(&mut guess)  // 可变借用
    .expect("读取输入失败");
```

**语法要点：**
- `&mut` 表示可变借用
- 被借用的变量必须声明为 `mut`
- 同时只能有一个可变借用

#### 方法链式调用
```rust
io::stdin()
    .read_line(&mut guess)
    .expect("读取输入失败");
```

**语法要点：**
- 方法可以链式调用
- `expect()` 用于处理Result类型，如果是Err则panic

### 7. 条件表达式和范围

#### if let 简化匹配
```rust
let rating = match attempts {
    1 => "不可思议！",
    2..=3 => "太厉害了！",        // 包含范围
    4..=6 => "很不错！",
    7..=10 => "还可以",
    _ => "需要多练习哦"
};
```

**语法要点：**
- `..=` 创建包含范围（inclusive range）
- `..` 创建不包含范围（exclusive range）
- 匹配表达式可以返回值

### 8. 函数定义和参数

#### 函数参数和返回值
```rust
fn give_hint(guess: u32, secret: u32, attempts: u32) {
    let diff = if guess > secret { 
        guess - secret 
    } else { 
        secret - guess 
    };
    
    match diff {
        1..=5 => println!("💡 提示：非常接近了！"),
        6..=10 => println!("💡 提示：很接近了！"),
        11..=20 => println!("💡 提示：比较接近"),
        _ => println!("💡 提示：还差得远呢"),
    }
}
```

**语法要点：**
- 参数格式：`name: type`
- 最后一个表达式（无分号）作为返回值
- 条件表达式可以赋值给变量

### 9. 测试代码编写

#### 单元测试
```rust
#[cfg(test)]
mod tests {
    use super::*;  // 导入父模块的所有公共项
    
    #[test]
    fn test_basic_operations() {
        let calc = Calculator::new();
        
        assert_eq!(calc.calculate(2.0, 3.0, Operation::Add).unwrap(), 5.0);
        assert_eq!(calc.calculate(5.0, 2.0, Operation::Subtract).unwrap(), 3.0);
    }
    
    #[test]
    fn test_division_by_zero() {
        let calc = Calculator::new();
        
        match calc.calculate(10.0, 0.0, Operation::Divide) {
            Err(CalculatorError::DivisionByZero) => (),
            _ => panic!("应该返回除零错误"),
        }
    }
}
```

**语法要点：**
- `#[cfg(test)]` 条件编译，只在测试时编译
- `#[test]` 标记测试函数
- `assert_eq!` 断言两个值相等
- `unwrap()` 获取Result的成功值，失败时panic
- `panic!` 手动触发恐慌

### 10. 命令行参数处理

#### 环境参数获取
```rust
let args: Vec<String> = std::env::args().collect();

if args.len() == 4 {
    // 命令行模式: calculator <number1> <operator> <number2>
    match calculator.parse_number(&args[1]) {
        Ok(num1) => {
            // 处理逻辑...
        },
        Err(e) => eprintln!("错误: {}", e),
    }
}
```

**语法要点：**
- `std::env::args()` 获取命令行参数迭代器
- `collect()` 将迭代器收集到Vec中
- `eprintln!` 向stderr输出错误信息
- `&args[1]` 借用Vec中的元素

### 关键语法总结

1. **所有权系统**：通过借用检查器确保内存安全
2. **模式匹配**：强大的控制流工具，确保处理所有情况
3. **错误处理**：Result类型提供显式的错误处理
4. **Trait系统**：为类型添加行为，类似接口
5. **方法链**：函数式编程风格的API设计
6. **生命周期**：确保引用的有效性（在简单示例中多数被省略）

这些语法特性使得Rust代码既安全又高效，通过编译时检查避免了许多运行时错误。

## 总结

这个计算器项目很好地展示了：

1. **Rust语言特性**：枚举、模式匹配、错误处理
2. **软件设计**：模块化、错误处理、用户交互
3. **实用技能**：字符串处理、输入验证、测试编写
4. **代码质量**：完整的测试覆盖、清晰的代码结构

通过这个项目，你不仅学会了Rust的核心概念，还了解了如何构建一个用户友好的命令行应用程序。

## 下一步

完成这个项目后，建议学习：
- [03-文件操作工具](../03-file-utils/) - 学习文件I/O操作
- [04-待办事项列表](../04-todo-list/) - 学习数据持久化和结构体