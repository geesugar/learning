# 01-模块基础

## 模块的概念

模块（Module）是 Rust 中组织代码的基本单元。它们允许我们将相关的函数、类型、常量和其他项目组织在一起，形成一个逻辑单元。模块还控制项目的可见性，决定哪些代码可以被其他模块使用。

## 模块树结构

Rust 的模块系统基于树状结构，从 crate 根开始：

```
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```

## 内联模块

### 基本语法

```rust
// src/lib.rs
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
        fn seat_at_table() {}
    }
    
    mod serving {
        fn take_order() {}
        fn serve_order() {}
        fn take_payment() {}
    }
}

fn main() {
    // 这里无法直接调用 front_of_house 中的函数
    // 因为它们默认是私有的
}
```

### 嵌套模块

```rust
mod outer_module {
    mod inner_module {
        fn inner_function() {
            println!("在内部模块中");
        }
        
        mod deeply_nested {
            fn deep_function() {
                println!("在深度嵌套的模块中");
            }
        }
    }
    
    fn outer_function() {
        println!("在外部模块中");
        // 可以访问同级的内部模块
        inner_module::inner_function();
    }
}

fn main() {
    outer_module::outer_function();
}
```

## 文件模块

### 单文件模块

```rust
// src/main.rs
mod restaurant;  // 声明模块，实现在 src/restaurant.rs 中

fn main() {
    restaurant::eat_at_restaurant();
}

// src/restaurant.rs
pub fn eat_at_restaurant() {
    println!("在餐厅用餐");
}

pub mod hosting {
    pub fn add_to_waitlist() {
        println!("添加到等待列表");
    }
}
```

### 目录模块

```rust
// src/main.rs
mod restaurant;  // 声明模块，实现在 src/restaurant/mod.rs 中

fn main() {
    restaurant::eat_at_restaurant();
}

// src/restaurant/mod.rs
pub mod hosting;  // 子模块声明
pub mod serving;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    serving::take_order();
}

// src/restaurant/hosting.rs
pub fn add_to_waitlist() {
    println!("添加到等待列表");
}

pub fn seat_at_table() {
    println!("安排座位");
}

// src/restaurant/serving.rs
pub fn take_order() {
    println!("接受订单");
}

pub fn serve_order() {
    println!("提供订单");
}
```

## 模块路径

### 绝对路径

```rust
// src/lib.rs
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {
            println!("添加到等待列表");
        }
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径：从 crate 根开始
    crate::front_of_house::hosting::add_to_waitlist();
}
```

### 相对路径

```rust
// src/lib.rs
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {
            println!("添加到等待列表");
        }
    }
}

pub fn eat_at_restaurant() {
    // 相对路径：从当前模块开始
    front_of_house::hosting::add_to_waitlist();
}
```

### super 关键字

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {
            println!("添加到等待列表");
        }
    }
    
    pub mod serving {
        pub fn take_order() {
            println!("接受订单");
        }
        
        pub fn serve_order() {
            take_order();  // 同一模块内的调用
            
            // 使用 super 访问父模块
            super::hosting::add_to_waitlist();
        }
    }
}

pub fn eat_at_restaurant() {
    front_of_house::serving::serve_order();
}
```

## 实际应用示例

### 简单的库结构

```rust
// src/lib.rs
pub mod math;
pub mod string_utils;

pub fn greet() {
    println!("Hello from my library!");
}

// src/math.rs
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn subtract(a: i32, b: i32) -> i32 {
    a - b
}

pub mod advanced {
    pub fn power(base: i32, exp: u32) -> i32 {
        base.pow(exp)
    }
    
    pub fn factorial(n: u32) -> u32 {
        if n <= 1 {
            1
        } else {
            n * factorial(n - 1)
        }
    }
}

// src/string_utils.rs
pub fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}

pub fn to_title_case(s: &str) -> String {
    s.split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => first.to_uppercase().collect::<String>() + &chars.as_str().to_lowercase(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

pub mod validation {
    pub fn is_email(email: &str) -> bool {
        email.contains('@') && email.contains('.')
    }
    
    pub fn is_phone_number(phone: &str) -> bool {
        phone.chars().all(|c| c.is_digit(10) || c == '-' || c == '(' || c == ')' || c == ' ')
    }
}
```

### 使用库

```rust
// src/main.rs
use my_library::math;
use my_library::string_utils;

fn main() {
    // 使用数学模块
    let result = math::add(5, 3);
    println!("5 + 3 = {}", result);
    
    let power_result = math::advanced::power(2, 3);
    println!("2^3 = {}", power_result);
    
    // 使用字符串工具
    let reversed = string_utils::reverse_string("Hello");
    println!("Reversed: {}", reversed);
    
    let title_case = string_utils::to_title_case("hello world");
    println!("Title case: {}", title_case);
    
    // 使用验证模块
    let is_valid_email = string_utils::validation::is_email("test@example.com");
    println!("Is valid email: {}", is_valid_email);
}
```

## 复杂的模块结构示例

### 图书管理系统

```rust
// src/lib.rs
pub mod book;
pub mod user;
pub mod library;
pub mod transaction;

// 重新导出常用类型
pub use book::Book;
pub use user::User;
pub use library::Library;
pub use transaction::Transaction;

// src/book.rs
#[derive(Debug, Clone)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: String,
    pub isbn: String,
    pub available: bool,
}

impl Book {
    pub fn new(id: String, title: String, author: String, isbn: String) -> Self {
        Book {
            id,
            title,
            author,
            isbn,
            available: true,
        }
    }
    
    pub fn borrow(&mut self) -> Result<(), String> {
        if self.available {
            self.available = false;
            Ok(())
        } else {
            Err("Book is not available".to_string())
        }
    }
    
    pub fn return_book(&mut self) {
        self.available = true;
    }
}

// src/user.rs
#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    borrowed_books: Vec<String>,
}

impl User {
    pub fn new(id: String, name: String, email: String) -> Self {
        User {
            id,
            name,
            email,
            borrowed_books: Vec::new(),
        }
    }
    
    pub fn borrow_book(&mut self, book_id: String) {
        self.borrowed_books.push(book_id);
    }
    
    pub fn return_book(&mut self, book_id: &str) -> bool {
        if let Some(pos) = self.borrowed_books.iter().position(|id| id == book_id) {
            self.borrowed_books.remove(pos);
            true
        } else {
            false
        }
    }
    
    pub fn borrowed_books(&self) -> &[String] {
        &self.borrowed_books
    }
}

// src/library.rs
use crate::{Book, User, Transaction};
use std::collections::HashMap;

pub struct Library {
    pub name: String,
    books: HashMap<String, Book>,
    users: HashMap<String, User>,
    transactions: Vec<Transaction>,
}

impl Library {
    pub fn new(name: String) -> Self {
        Library {
            name,
            books: HashMap::new(),
            users: HashMap::new(),
            transactions: Vec::new(),
        }
    }
    
    pub fn add_book(&mut self, book: Book) {
        self.books.insert(book.id.clone(), book);
    }
    
    pub fn add_user(&mut self, user: User) {
        self.users.insert(user.id.clone(), user);
    }
    
    pub fn borrow_book(&mut self, user_id: &str, book_id: &str) -> Result<(), String> {
        let user = self.users.get_mut(user_id).ok_or("User not found")?;
        let book = self.books.get_mut(book_id).ok_or("Book not found")?;
        
        book.borrow()?;
        user.borrow_book(book_id.to_string());
        
        let transaction = Transaction::new(
            user_id.to_string(),
            book_id.to_string(),
            "borrow".to_string(),
        );
        self.transactions.push(transaction);
        
        Ok(())
    }
    
    pub fn return_book(&mut self, user_id: &str, book_id: &str) -> Result<(), String> {
        let user = self.users.get_mut(user_id).ok_or("User not found")?;
        let book = self.books.get_mut(book_id).ok_or("Book not found")?;
        
        if user.return_book(book_id) {
            book.return_book();
            
            let transaction = Transaction::new(
                user_id.to_string(),
                book_id.to_string(),
                "return".to_string(),
            );
            self.transactions.push(transaction);
            
            Ok(())
        } else {
            Err("User has not borrowed this book".to_string())
        }
    }
    
    pub fn get_book(&self, book_id: &str) -> Option<&Book> {
        self.books.get(book_id)
    }
    
    pub fn get_user(&self, user_id: &str) -> Option<&User> {
        self.users.get(user_id)
    }
}

// src/transaction.rs
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub struct Transaction {
    pub user_id: String,
    pub book_id: String,
    pub action: String,
    pub timestamp: DateTime<Utc>,
}

impl Transaction {
    pub fn new(user_id: String, book_id: String, action: String) -> Self {
        Transaction {
            user_id,
            book_id,
            action,
            timestamp: Utc::now(),
        }
    }
}
```

## 模块的最佳实践

### 1. 模块命名

```rust
// 好的模块名：描述性的、小写的、用下划线分隔
mod user_management;
mod data_processing;
mod network_client;

// 不好的模块名
mod UserManagement;  // 不使用 PascalCase
mod DataProc;        // 缩写不清楚
mod networkClient;   // 混合命名风格
```

### 2. 模块组织

```rust
// 按功能组织模块
mod authentication {
    pub mod login;
    pub mod logout;
    pub mod password_reset;
}

mod user_management {
    pub mod create_user;
    pub mod update_user;
    pub mod delete_user;
}

mod data_access {
    pub mod database;
    pub mod cache;
    pub mod file_storage;
}
```

### 3. 避免循环依赖

```rust
// 不好的设计：循环依赖
mod a {
    use super::b;
    pub fn function_a() {
        b::function_b();
    }
}

mod b {
    use super::a;  // 循环依赖！
    pub fn function_b() {
        a::function_a();
    }
}

// 好的设计：通过共同的依赖解决
mod common {
    pub fn shared_function() {
        println!("共享功能");
    }
}

mod a {
    use super::common;
    pub fn function_a() {
        common::shared_function();
    }
}

mod b {
    use super::common;
    pub fn function_b() {
        common::shared_function();
    }
}
```

### 4. 合理的模块大小

```rust
// 模块不应该过大
mod large_module {
    // 如果一个模块有太多功能，考虑拆分
    pub fn function1() {}
    pub fn function2() {}
    // ... 很多函数
    pub fn function100() {}
}

// 更好的做法：按功能拆分
mod user_operations {
    pub fn create_user() {}
    pub fn update_user() {}
    pub fn delete_user() {}
}

mod user_validation {
    pub fn validate_email() {}
    pub fn validate_password() {}
}
```

## 练习

1. 创建一个计算器模块系统，包含基本运算和高级运算
2. 设计一个简单的电商系统的模块结构
3. 实现一个日志系统，包含不同级别的日志记录

## 下一步

学习完模块基础后，继续学习 [02-可见性控制](02-visibility.md)。