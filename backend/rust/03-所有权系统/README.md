# 03-所有权系统

## 本章概述

所有权系统是 Rust 最重要和最独特的特性，它使 Rust 能够在不使用垃圾收集器的情况下保证内存安全。本章将深入讲解所有权、借用、生命周期等核心概念。

## 学习目标

- 理解所有权的基本概念和规则
- 掌握移动语义和复制语义
- 学会使用引用和借用
- 理解生命周期的概念
- 掌握所有权在实际编程中的应用

## 章节内容

### [01-所有权基础](01-ownership-basics.md)
- 所有权的三个规则
- 变量作用域
- 移动语义
- 复制语义
- 函数调用中的所有权

### [02-引用与借用](02-references-borrowing.md)
- 不可变引用
- 可变引用
- 借用规则
- 悬垂引用
- 引用的作用域

### [03-切片类型](03-slices.md)
- 字符串切片
- 数组切片
- 切片的内部表示
- 切片的使用场景

### [04-生命周期](04-lifetimes.md)
- 生命周期概念
- 生命周期注解
- 生命周期省略规则
- 静态生命周期
- 结构体中的生命周期

### [05-所有权模式](05-ownership-patterns.md)
- 常见的所有权模式
- 所有权转移的时机
- 如何避免所有权问题
- 最佳实践

## 核心概念详解

### 所有权规则
1. Rust 中每个值都有一个所有者
2. 值在任一时刻只能有一个所有者
3. 当所有者离开作用域时，值将被丢弃

### 移动语义示例
```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1 被移动到 s2
    
    // println!("{}", s1); // 编译错误：s1 已被移动
    println!("{}", s2);    // 正确
}
```

### 借用规则
1. 在任意给定时间，要么只能有一个可变引用，要么只能有多个不可变引用
2. 引用必须总是有效的

### 借用示例
```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;      // 不可变引用
    let r2 = &s;      // 可以有多个不可变引用
    println!("{} and {}", r1, r2);
    
    let r3 = &mut s;  // 可变引用
    // println!("{}", r1); // 编译错误：不能在可变引用存在时使用不可变引用
    println!("{}", r3);
}
```

### 生命周期示例
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";
    
    let result = longest(string1.as_str(), string2);
    println!("The longest string is {}", result);
}
```

## 实践练习

### 练习 1：字符串操作
编写函数来处理字符串，理解所有权转移：

```rust
fn main() {
    let mut s = String::from("hello");
    
    // 函数获取所有权
    let s2 = take_ownership(s);
    // println!("{}", s); // 编译错误：s 已被移动
    
    // 函数借用
    let len = calculate_length(&s2);
    println!("Length of '{}' is {}", s2, len);
    
    // 可变借用
    change_string(&mut s2);
    println!("After change: {}", s2);
}

fn take_ownership(s: String) -> String {
    println!("Taking ownership of: {}", s);
    s
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change_string(s: &mut String) {
    s.push_str(", world");
}
```

### 练习 2：查找第一个单词
使用切片实现查找字符串中第一个单词的函数：

```rust
fn main() {
    let s = String::from("hello world");
    let word = first_word(&s);
    println!("First word: {}", word);
    
    let s_literal = "hello world";
    let word = first_word(s_literal);
    println!("First word: {}", word);
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[..i];
        }
    }
    
    &s[..]
}
```

### 练习 3：结构体所有权
创建一个结构体，理解结构体中的所有权：

```rust
struct User {
    username: String,
    email: String,
    active: bool,
}

fn main() {
    let user1 = User {
        username: String::from("alice"),
        email: String::from("alice@example.com"),
        active: true,
    };
    
    // 部分移动
    let user2 = User {
        username: String::from("bob"),
        email: String::from("bob@example.com"),
        active: user1.active, // 复制
    };
    
    // user1 仍然可以使用（因为只有 active 字段被复制）
    println!("User1 username: {}", user1.username);
    
    // 完全移动
    let user3 = user1; // user1 被移动到 user3
    // println!("{}", user1.username); // 编译错误：user1 已被移动
    println!("User3 username: {}", user3.username);
}
```

## 常见错误和解决方案

### 1. 所有权转移后使用
```rust
// 错误示例
let s1 = String::from("hello");
let s2 = s1;
// println!("{}", s1); // 编译错误

// 解决方案 1：使用 clone
let s1 = String::from("hello");
let s2 = s1.clone();
println!("{}", s1); // 正确

// 解决方案 2：使用引用
let s1 = String::from("hello");
let s2 = &s1;
println!("{}", s1); // 正确
```

### 2. 可变引用冲突
```rust
// 错误示例
let mut s = String::from("hello");
let r1 = &mut s;
let r2 = &mut s; // 编译错误
// println!("{}, {}", r1, r2);

// 解决方案：限制作用域
let mut s = String::from("hello");
{
    let r1 = &mut s;
    println!("{}", r1);
} // r1 离开作用域
let r2 = &mut s; // 正确
println!("{}", r2);
```

### 3. 悬垂引用
```rust
// 错误示例
fn dangle() -> &String { // 编译错误：返回悬垂引用
    let s = String::from("hello");
    &s
} // s 离开作用域并被丢弃

// 解决方案：返回所有权
fn no_dangle() -> String {
    let s = String::from("hello");
    s // 返回所有权
}
```

## 最佳实践

### 1. 优先使用引用
```rust
// 推荐：使用引用避免不必要的所有权转移
fn process_string(s: &String) -> usize {
    s.len()
}

// 不推荐：获取所有权
fn process_string_bad(s: String) -> usize {
    s.len()
}
```

### 2. 返回引用而非所有权
```rust
// 推荐：返回切片
fn first_word(s: &str) -> &str {
    // 实现...
    &s[..1]
}

// 不推荐：返回新的 String
fn first_word_bad(s: &str) -> String {
    s[..1].to_string()
}
```

### 3. 使用 `&str` 而非 `&String`
```rust
// 推荐：更灵活的参数类型
fn print_string(s: &str) {
    println!("{}", s);
}

// 不推荐：限制性更强
fn print_string_bad(s: &String) {
    println!("{}", s);
}
```

## 调试技巧

### 1. 理解编译器错误
Rust 编译器提供详细的所有权错误信息：

```bash
cargo check  # 检查所有权错误
```

### 2. 使用 `#[derive(Debug)]`
```rust
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{:?}", p);
}
```

### 3. 分析所有权流动
使用注释标记所有权的流动：

```rust
fn main() {
    let s1 = String::from("hello"); // s1 拥有字符串
    let s2 = s1;                      // 所有权转移给 s2
    // s1 不再有效
    println!("{}", s2);              // s2 拥有字符串
} // s2 离开作用域，字符串被丢弃
```

## 总结

所有权系统是 Rust 的核心特性，它保证了内存安全而不需要垃圾收集器。理解所有权的关键在于：

1. **所有权规则**：每个值都有唯一的所有者
2. **移动语义**：赋值和函数调用会转移所有权
3. **借用规则**：可以有多个不可变引用或一个可变引用
4. **生命周期**：引用必须在数据有效期内

掌握这些概念需要实践，建议多写代码来巩固理解。

## 下一步

完成本章学习后，请继续学习 [04-错误处理](../04-错误处理/README.md)。