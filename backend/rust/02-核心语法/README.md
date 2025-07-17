# 02-核心语法

## 本章概述

本章将深入介绍 Rust 的核心语法，包括变量、数据类型、函数、控制流等基本概念。这些是编写 Rust 程序的基础。

## 学习目标

- 掌握 Rust 中变量的声明和使用
- 理解 Rust 的数据类型系统
- 学会编写和使用函数
- 掌握控制流语句
- 了解 Rust 的表达式和语句的区别

## 章节内容

### [01-变量与可变性](01-variables-mutability.md)
- 变量声明：let 关键字
- 可变性：mut 关键字
- 常量：const 关键字
- 变量遮蔽（shadowing）
- 作用域和生命周期

### [02-数据类型](02-data-types.md)
- 标量类型：整数、浮点数、布尔值、字符
- 复合类型：元组、数组
- 字符串类型：&str 和 String
- 类型推断和显式类型注解

### [03-函数](03-functions.md)
- 函数定义和调用
- 参数和返回值
- 表达式和语句
- 函数作为值
- 闭包基础

### [04-控制流](04-control-flow.md)
- 条件语句：if/else
- 循环语句：loop、while、for
- 模式匹配：match
- 控制流中的表达式

### [05-所有权预览](05-ownership-preview.md)
- 所有权概念简介
- 移动语义
- 引用和借用
- 生命周期简介

## 代码示例

### 变量声明
```rust
fn main() {
    let x = 5;           // 不可变变量
    let mut y = 10;      // 可变变量
    const MAX: u32 = 100; // 常量
    
    y = 15;              // 可以修改可变变量
    // x = 10;           // 编译错误：x 是不可变的
}
```

### 数据类型
```rust
fn main() {
    // 标量类型
    let integer: i32 = 42;
    let float: f64 = 3.14;
    let boolean: bool = true;
    let character: char = 'A';
    
    // 复合类型
    let tuple: (i32, f64, bool) = (42, 3.14, true);
    let array: [i32; 5] = [1, 2, 3, 4, 5];
    
    // 字符串
    let str_literal: &str = "Hello";
    let string: String = String::from("World");
}
```

### 函数
```rust
fn main() {
    println!("Result: {}", add(5, 3));
    
    let multiply = |x: i32, y: i32| x * y; // 闭包
    println!("Product: {}", multiply(4, 6));
}

fn add(a: i32, b: i32) -> i32 {
    a + b  // 表达式，不需要 return
}
```

### 控制流
```rust
fn main() {
    let number = 6;
    
    // if 表达式
    let result = if number % 2 == 0 { "even" } else { "odd" };
    println!("Number is {}", result);
    
    // match 表达式
    match number {
        1 => println!("One"),
        2 | 3 => println!("Two or Three"),
        4..=6 => println!("Four to Six"),
        _ => println!("Other"),
    }
    
    // 循环
    for i in 1..=5 {
        println!("Count: {}", i);
    }
}
```

## 实践练习

### 练习 1：温度转换器
编写一个程序，将华氏温度转换为摄氏温度。

```rust
fn main() {
    let fahrenheit = 32.0;
    let celsius = fahrenheit_to_celsius(fahrenheit);
    println!("{}°F = {}°C", fahrenheit, celsius);
}

fn fahrenheit_to_celsius(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}
```

### 练习 2：斐波那契数列
使用循环计算斐波那契数列的第 n 项。

```rust
fn main() {
    let n = 10;
    println!("Fibonacci({}) = {}", n, fibonacci(n));
}

fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    
    let mut prev = 0;
    let mut curr = 1;
    
    for _ in 2..=n {
        let next = prev + curr;
        prev = curr;
        curr = next;
    }
    
    curr
}
```

### 练习 3：猜数字游戏
创建一个简单的猜数字游戏。

```rust
use std::io;
use std::cmp::Ordering;

fn main() {
    println!("Guess the number (1-100)!");
    let secret_number = 42; // 在实际游戏中应该是随机数
    
    loop {
        println!("Please input your guess:");
        
        let mut guess = String::new();
        io::stdin().read_line(&mut guess)
            .expect("Failed to read line");
        
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };
        
        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}
```

## 常见错误和解决方案

### 1. 类型不匹配
```rust
// 错误示例
let x = 5;
let y = 5.0;
// let z = x + y; // 编译错误：类型不匹配

// 正确方式
let z = x as f64 + y; // 类型转换
```

### 2. 不可变变量修改
```rust
// 错误示例
let x = 5;
// x = 10; // 编译错误：不可变变量

// 正确方式
let mut x = 5;
x = 10; // 正确
```

### 3. 函数返回值
```rust
// 错误示例
fn bad_function() -> i32 {
    let x = 5;
    return x; // 不推荐
}

// 推荐方式
fn good_function() -> i32 {
    let x = 5;
    x // 表达式，自动返回
}
```

## 最佳实践

### 1. 变量命名
- 使用 snake_case 风格
- 名称要有意义
- 避免缩写

```rust
let user_name = "Alice";      // 好
let user_age = 25;           // 好
let un = "Bob";             // 不好
```

### 2. 类型注解
在必要时显式声明类型：

```rust
let numbers: Vec<i32> = Vec::new(); // 明确类型
let parsed: i32 = "42".parse().expect("Not a number"); // 帮助类型推断
```

### 3. 函数设计
- 函数应该简短且专一
- 使用描述性的函数名
- 参数数量不要过多

```rust
fn calculate_area(width: f64, height: f64) -> f64 {
    width * height
}
```

## 调试技巧

### 1. 使用 println! 宏
```rust
fn main() {
    let x = 5;
    println!("Debug: x = {}", x);
    println!("Debug: x = {:#?}", x); // 更详细的调试输出
}
```

### 2. 使用 dbg! 宏
```rust
fn main() {
    let x = 5;
    let y = dbg!(x * 2); // 打印表达式和结果
}
```

### 3. 编译器错误信息
Rust 编译器提供详细的错误信息，要仔细阅读：

```bash
cargo check  # 检查语法错误
cargo clippy # 代码质量检查
```

## 总结

本章介绍了 Rust 的核心语法，包括变量、数据类型、函数和控制流。这些概念是理解 Rust 程序的基础。重点要理解：

1. Rust 的默认不可变性
2. 强类型系统
3. 表达式和语句的区别
4. 模式匹配的强大功能

掌握这些基础语法后，你就可以编写简单的 Rust 程序了。下一章我们将深入学习 Rust 的所有权系统，这是 Rust 最重要的特性。

## 下一步

完成本章学习后，请继续学习 [03-所有权系统](../03-所有权系统/README.md)。