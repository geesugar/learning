# Rust 快速入门指南

## 🚀 30分钟上手 Rust

本指南将帮助你在30分钟内快速了解 Rust 的核心概念，并能够编写基本的 Rust 程序。

## 📋 前置条件

- 已安装 Rust 工具链（如果没有，请先阅读 [环境搭建](01-基础入门/02-environment-setup.md)）
- 有基本的编程经验
- 了解指针和内存管理概念会有帮助

## ⚡ 验证环境

```bash
# 检查 Rust 版本
rustc --version

# 检查 Cargo 版本
cargo --version

# 应该看到类似输出：
# rustc 1.70.0 (90c541806 2023-05-31)
# cargo 1.70.0 (ec8a8a0ca 2023-04-25)
```

## 🎯 5分钟：第一个程序

### 1. 创建项目
```bash
cargo new hello_rust
cd hello_rust
```

### 2. 编写代码
编辑 `src/main.rs`：
```rust
fn main() {
    println!("Hello, Rust!");
    let name = "世界";
    println!("你好，{}!", name);
}
```

### 3. 运行程序
```bash
cargo run
```

**输出：**
```
Hello, Rust!
你好，世界!
```

## 🔧 10分钟：核心语法

### 变量和可变性
```rust
fn main() {
    // 不可变变量（默认）
    let x = 5;
    println!("x = {}", x);
    
    // 可变变量
    let mut y = 10;
    println!("y = {}", y);
    y = 20;
    println!("y = {}", y);
    
    // 常量
    const MAX_VALUE: u32 = 100;
    println!("MAX_VALUE = {}", MAX_VALUE);
}
```

### 数据类型
```rust
fn main() {
    // 整数
    let integer: i32 = 42;
    let unsigned: u32 = 42;
    
    // 浮点数
    let float: f64 = 3.14;
    
    // 布尔值
    let boolean: bool = true;
    
    // 字符
    let character: char = 'A';
    
    // 字符串
    let string_literal: &str = "Hello";
    let string_object: String = String::from("World");
    
    // 数组
    let array: [i32; 5] = [1, 2, 3, 4, 5];
    
    // 元组
    let tuple: (i32, f64, bool) = (42, 3.14, true);
    
    println!("整数: {}", integer);
    println!("字符串: {} {}", string_literal, string_object);
    println!("数组第一个元素: {}", array[0]);
    println!("元组第一个元素: {}", tuple.0);
}
```

### 函数
```rust
fn main() {
    println!("5 + 3 = {}", add(5, 3));
    greet("Alice");
    
    let result = multiply(4, 6);
    println!("4 * 6 = {}", result);
}

fn add(a: i32, b: i32) -> i32 {
    a + b  // 表达式，不需要 return
}

fn greet(name: &str) {
    println!("Hello, {}!", name);
}

fn multiply(x: i32, y: i32) -> i32 {
    return x * y;  // 也可以使用 return
}
```

### 控制流
```rust
fn main() {
    let number = 6;
    
    // if 表达式
    if number % 2 == 0 {
        println!("{} 是偶数", number);
    } else {
        println!("{} 是奇数", number);
    }
    
    // match 表达式
    match number {
        1 => println!("一"),
        2 | 3 => println!("二或三"),
        4..=6 => println!("四到六"),
        _ => println!("其他"),
    }
    
    // 循环
    for i in 1..=3 {
        println!("循环: {}", i);
    }
    
    let mut counter = 0;
    loop {
        counter += 1;
        if counter == 3 {
            break;
        }
        println!("Loop: {}", counter);
    }
}
```

## 🏠 15分钟：所有权系统

### 所有权基础
```rust
fn main() {
    // 字符串字面量存储在栈上
    let s1 = "hello";
    let s2 = s1;  // 复制
    println!("{} {}", s1, s2);  // 都可以使用
    
    // String 存储在堆上
    let s3 = String::from("hello");
    let s4 = s3;  // 移动，s3 不再有效
    // println!("{}", s3);  // 编译错误
    println!("{}", s4);
    
    // 使用 clone 进行深拷贝
    let s5 = String::from("hello");
    let s6 = s5.clone();
    println!("{} {}", s5, s6);  // 都可以使用
}
```

### 引用和借用
```rust
fn main() {
    let s = String::from("hello");
    
    // 不可变引用
    let len = calculate_length(&s);
    println!("'{}' 的长度是 {}", s, len);
    
    // 可变引用
    let mut s2 = String::from("hello");
    change_string(&mut s2);
    println!("修改后: {}", s2);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}  // s 离开作用域，但不会丢弃数据

fn change_string(s: &mut String) {
    s.push_str(", world");
}
```

### 切片
```rust
fn main() {
    let s = String::from("hello world");
    
    // 字符串切片
    let hello = &s[0..5];
    let world = &s[6..11];
    println!("{} {}", hello, world);
    
    // 查找第一个单词
    let first_word = find_first_word(&s);
    println!("第一个单词: {}", first_word);
    
    // 数组切片
    let arr = [1, 2, 3, 4, 5];
    let slice = &arr[1..3];
    println!("数组切片: {:?}", slice);
}

fn find_first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[..i];
        }
    }
    
    &s[..]
}
```

## 🎨 20分钟：结构体和枚举

### 结构体
```rust
// 定义结构体
struct User {
    username: String,
    email: String,
    age: u32,
    active: bool,
}

// 实现方法
impl User {
    // 关联函数（类似静态方法）
    fn new(username: String, email: String, age: u32) -> User {
        User {
            username,
            email,
            age,
            active: true,
        }
    }
    
    // 方法
    fn is_adult(&self) -> bool {
        self.age >= 18
    }
    
    // 可变方法
    fn set_active(&mut self, active: bool) {
        self.active = active;
    }
}

fn main() {
    let mut user = User::new(
        String::from("alice"),
        String::from("alice@example.com"),
        25
    );
    
    println!("用户: {}", user.username);
    println!("是否成年: {}", user.is_adult());
    
    user.set_active(false);
    println!("活跃状态: {}", user.active);
}
```

### 枚举
```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        match self {
            Message::Quit => println!("退出"),
            Message::Move { x, y } => println!("移动到 ({}, {})", x, y),
            Message::Write(text) => println!("写入: {}", text),
            Message::ChangeColor(r, g, b) => println!("改变颜色: ({}, {}, {})", r, g, b),
        }
    }
}

fn main() {
    let messages = vec![
        Message::Quit,
        Message::Move { x: 10, y: 20 },
        Message::Write(String::from("Hello")),
        Message::ChangeColor(255, 0, 0),
    ];
    
    for message in messages {
        message.call();
    }
}
```

## 🚦 25分钟：错误处理

### Result 和 Option
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    // Option 类型
    let numbers = vec![1, 2, 3, 4, 5];
    match numbers.get(2) {
        Some(value) => println!("第3个元素是: {}", value),
        None => println!("没有第3个元素"),
    }
    
    // Result 类型
    let file_result = File::open("hello.txt");
    match file_result {
        Ok(file) => println!("文件打开成功"),
        Err(error) => match error.kind() {
            ErrorKind::NotFound => println!("文件不存在"),
            other_error => println!("其他错误: {:?}", other_error),
        },
    }
    
    // 使用 ? 操作符
    match read_username_from_file() {
        Ok(username) => println!("用户名: {}", username),
        Err(e) => println!("错误: {}", e),
    }
}

fn read_username_from_file() -> Result<String, std::io::Error> {
    let mut file = File::open("username.txt")?;
    let mut username = String::new();
    file.read_to_string(&mut username)?;
    Ok(username)
}
```

## 🎯 30分钟：实战练习

创建一个简单的待办事项管理器：

```rust
use std::collections::HashMap;
use std::io;

#[derive(Debug)]
struct TodoItem {
    id: u32,
    title: String,
    completed: bool,
}

struct TodoList {
    items: HashMap<u32, TodoItem>,
    next_id: u32,
}

impl TodoList {
    fn new() -> Self {
        TodoList {
            items: HashMap::new(),
            next_id: 1,
        }
    }
    
    fn add_item(&mut self, title: String) {
        let item = TodoItem {
            id: self.next_id,
            title,
            completed: false,
        };
        self.items.insert(self.next_id, item);
        self.next_id += 1;
        println!("添加任务成功！");
    }
    
    fn list_items(&self) {
        if self.items.is_empty() {
            println!("没有任务");
            return;
        }
        
        println!("待办事项：");
        for (_, item) in &self.items {
            let status = if item.completed { "✓" } else { "○" };
            println!("[{}] {}: {}", status, item.id, item.title);
        }
    }
    
    fn complete_item(&mut self, id: u32) {
        if let Some(item) = self.items.get_mut(&id) {
            item.completed = true;
            println!("任务 {} 已完成！", id);
        } else {
            println!("找不到任务 {}", id);
        }
    }
}

fn main() {
    let mut todo_list = TodoList::new();
    
    loop {
        println!("\\n待办事项管理器");
        println!("1. 添加任务");
        println!("2. 查看任务");
        println!("3. 完成任务");
        println!("4. 退出");
        println!("请选择 (1-4):");
        
        let mut input = String::new();
        io::stdin().read_line(&mut input).expect("读取输入失败");
        
        match input.trim() {
            "1" => {
                println!("请输入任务标题:");
                let mut title = String::new();
                io::stdin().read_line(&mut title).expect("读取输入失败");
                todo_list.add_item(title.trim().to_string());
            }
            "2" => todo_list.list_items(),
            "3" => {
                println!("请输入要完成的任务 ID:");
                let mut id_input = String::new();
                io::stdin().read_line(&mut id_input).expect("读取输入失败");
                if let Ok(id) = id_input.trim().parse::<u32>() {
                    todo_list.complete_item(id);
                } else {
                    println!("无效的 ID");
                }
            }
            "4" => {
                println!("再见！");
                break;
            }
            _ => println!("无效选择，请重新输入"),
        }
    }
}
```

## 🎯 总结

30分钟内，你已经学会了：

1. **基本语法**：变量、数据类型、函数、控制流
2. **所有权系统**：移动、借用、生命周期
3. **数据结构**：结构体、枚举、方法
4. **错误处理**：Result、Option、? 操作符
5. **实战应用**：完整的待办事项管理器

## 🚀 下一步

### 立即开始
1. 完成猜数字游戏：[examples/basic/01-guessing-game](examples/basic/01-guessing-game/)
2. 练习所有权概念：[03-所有权系统](03-所有权系统/)
3. 学习错误处理：[04-错误处理](04-错误处理/)

### 深入学习
- [完整学习路径](README.md#学习路径)
- [实战项目](examples/)
- [官方文档](https://doc.rust-lang.org/book/)

### 获取帮助
- 查阅 [Rust 官方文档](https://doc.rust-lang.org/)
- 加入 [Rust 中文社区](https://rustcc.cn/)
- 使用 `cargo doc --open` 查看本地文档

## 💡 学习建议

1. **多写代码**：理论知识需要通过实践来巩固
2. **理解概念**：重点理解所有权系统，这是 Rust 的核心
3. **循序渐进**：从简单项目开始，逐步提升难度
4. **查阅文档**：养成查阅官方文档的习惯
5. **参与社区**：加入 Rust 学习群组，与其他学习者交流

恭喜你完成了 Rust 快速入门！现在你已经具备了学习 Rust 的基础知识，可以开始更深入的学习了。记住，掌握 Rust 需要时间和实践，但这个过程会让你成为更好的程序员。

Happy Coding! 🦀