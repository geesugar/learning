# 02-trait 基础

## trait 的概念

trait 是 Rust 中定义共享行为的机制，类似于其他语言中的接口（interface）。trait 定义了类型必须实现的方法签名，使得不同的类型可以表现出相同的行为。

## 定义和实现 trait

### 基本 trait 定义

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct NewsArticle {
    headline: String,
    location: String,
    author: String,
    content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

struct Tweet {
    username: String,
    content: String,
    reply: bool,
    retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

fn main() {
    let news = NewsArticle {
        headline: String::from("Rust 1.0 发布"),
        location: String::from("美国"),
        author: String::from("Mozilla"),
        content: String::from("Rust 1.0 正式发布..."),
    };
    
    let tweet = Tweet {
        username: String::from("rust_lang"),
        content: String::from("Rust 很棒！"),
        reply: false,
        retweet: false,
    };
    
    println!("新闻: {}", news.summarize());
    println!("推文: {}", tweet.summarize());
}
```

### 默认实现

```rust
trait Summary {
    fn summarize_author(&self) -> String;
    
    fn summarize(&self) -> String {
        format!("(阅读更多来自 {} 的内容...)", self.summarize_author())
    }
}

struct Tweet {
    username: String,
    content: String,
    reply: bool,
    retweet: bool,
}

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
    
    // 可以选择重写默认实现
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

struct BlogPost {
    title: String,
    author: String,
    content: String,
}

impl Summary for BlogPost {
    fn summarize_author(&self) -> String {
        self.author.clone()
    }
    
    // 使用默认实现
}

fn main() {
    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        retweet: false,
    };
    
    let blog = BlogPost {
        title: String::from("Rust 编程"),
        author: String::from("张三"),
        content: String::from("Rust 是一门系统编程语言..."),
    };
    
    println!("Tweet: {}", tweet.summarize());
    println!("Blog: {}", blog.summarize());
}
```

## trait 作为参数

### impl Trait 语法

```rust
trait Summary {
    fn summarize(&self) -> String;
}

// 使用 impl Trait 语法
fn notify(item: &impl Summary) {
    println!("突发新闻！{}", item.summarize());
}

// 等价的 trait bound 语法
fn notify_verbose<T: Summary>(item: &T) {
    println!("突发新闻！{}", item.summarize());
}

// 多个参数
fn notify_two(item1: &impl Summary, item2: &impl Summary) {
    println!("新闻1: {}", item1.summarize());
    println!("新闻2: {}", item2.summarize());
}

// 强制相同类型
fn notify_same<T: Summary>(item1: &T, item2: &T) {
    println!("新闻1: {}", item1.summarize());
    println!("新闻2: {}", item2.summarize());
}

struct NewsArticle {
    headline: String,
    author: String,
    content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{} - {}", self.headline, self.author)
    }
}

fn main() {
    let news = NewsArticle {
        headline: String::from("重要新闻"),
        author: String::from("记者"),
        content: String::from("新闻内容..."),
    };
    
    notify(&news);
    notify_verbose(&news);
}
```

### 多个 trait bound

```rust
use std::fmt::{Debug, Display};

fn some_function<T>(t: T) -> T
where
    T: Display + Clone + Debug,
{
    println!("Display: {}", t);
    println!("Debug: {:?}", t);
    t.clone()
}

// 或者使用 + 语法
fn another_function<T: Display + Clone>(t: T) -> T {
    println!("值: {}", t);
    t.clone()
}

fn compare_display<T, U>(t: &T, u: &U) -> String
where
    T: Display,
    U: Display,
{
    format!("{} 和 {}", t, u)
}

fn main() {
    let number = 42;
    let cloned = some_function(number);
    println!("克隆的值: {}", cloned);
    
    let result = compare_display(&10, &"hello");
    println!("比较结果: {}", result);
}
```

## trait 作为返回值

### 返回 impl Trait

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct NewsArticle {
    headline: String,
    content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        self.headline.clone()
    }
}

struct Tweet {
    content: String,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        self.content.clone()
    }
}

// 返回实现了 Summary trait 的类型
fn returns_summarizable() -> impl Summary {
    NewsArticle {
        headline: String::from("今日新闻"),
        content: String::from("新闻内容..."),
    }
}

// 注意：不能根据条件返回不同类型
// fn returns_summarizable_conditional(switch: bool) -> impl Summary {
//     if switch {
//         NewsArticle { ... }  // 错误！
//     } else {
//         Tweet { ... }        // 错误！
//     }
// }

fn main() {
    let article = returns_summarizable();
    println!("文章摘要: {}", article.summarize());
}
```

### 使用 trait 对象返回不同类型

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct NewsArticle {
    headline: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("新闻: {}", self.headline)
    }
}

struct Tweet {
    content: String,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("推文: {}", self.content)
    }
}

// 使用 Box<dyn Trait> 返回不同类型
fn create_summary(news: bool) -> Box<dyn Summary> {
    if news {
        Box::new(NewsArticle {
            headline: String::from("重要新闻"),
        })
    } else {
        Box::new(Tweet {
            content: String::from("有趣的推文"),
        })
    }
}

fn main() {
    let summary1 = create_summary(true);
    let summary2 = create_summary(false);
    
    println!("{}", summary1.summarize());
    println!("{}", summary2.summarize());
}
```

## 高级 trait 用法

### 关联类型

```rust
trait Iterator {
    type Item;  // 关联类型
    
    fn next(&mut self) -> Option<Self::Item>;
}

struct Counter {
    current: usize,
    max: usize,
}

impl Counter {
    fn new(max: usize) -> Counter {
        Counter { current: 0, max }
    }
}

impl Iterator for Counter {
    type Item = usize;
    
    fn next(&mut self) -> Option<Self::Item> {
        if self.current < self.max {
            let current = self.current;
            self.current += 1;
            Some(current)
        } else {
            None
        }
    }
}

// 使用关联类型的泛型函数
fn collect_items<I>(mut iter: I) -> Vec<I::Item>
where
    I: Iterator,
{
    let mut items = Vec::new();
    while let Some(item) = iter.next() {
        items.push(item);
    }
    items
}

fn main() {
    let counter = Counter::new(5);
    let items = collect_items(counter);
    println!("计数器项目: {:?}", items);
}
```

### trait 继承（Super trait）

```rust
trait Printable {
    fn print(&self);
}

trait Debug: Printable {  // Debug 继承 Printable
    fn debug_print(&self) {
        println!("调试信息:");
        self.print();  // 可以调用父 trait 的方法
    }
}

struct Document {
    title: String,
    content: String,
}

impl Printable for Document {
    fn print(&self) {
        println!("{}: {}", self.title, self.content);
    }
}

impl Debug for Document {
    // 使用默认的 debug_print 实现
}

fn debug_something<T: Debug>(item: &T) {
    item.debug_print();
}

fn main() {
    let doc = Document {
        title: String::from("文档标题"),
        content: String::from("文档内容"),
    };
    
    debug_something(&doc);
}
```

### 运算符重载

```rust
use std::ops::Add;

#[derive(Debug, Clone, Copy, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;
    
    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

// 为 Point 和标量的运算
impl Add<i32> for Point {
    type Output = Point;
    
    fn add(self, scalar: i32) -> Point {
        Point {
            x: self.x + scalar,
            y: self.y + scalar,
        }
    }
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = Point { x: 3, y: 4 };
    
    let p3 = p1 + p2;
    println!("p1 + p2 = {:?}", p3);
    
    let p4 = p1 + 5;
    println!("p1 + 5 = {:?}", p4);
}
```

## 常用标准库 trait

### Clone 和 Copy

```rust
#[derive(Debug, Clone)]
struct ExpensiveStruct {
    data: Vec<i32>,
}

#[derive(Debug, Clone, Copy)]
struct CheapStruct {
    value: i32,
}

fn main() {
    let expensive = ExpensiveStruct {
        data: vec![1, 2, 3, 4, 5],
    };
    
    let expensive_clone = expensive.clone();  // 显式克隆
    println!("原始: {:?}", expensive);
    println!("克隆: {:?}", expensive_clone);
    
    let cheap = CheapStruct { value: 42 };
    let cheap_copy = cheap;  // 自动拷贝
    println!("原始: {:?}", cheap);
    println!("拷贝: {:?}", cheap_copy);
}
```

### PartialEq 和 Eq

```rust
#[derive(Debug, PartialEq)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: &str, age: u32) -> Self {
        Person {
            name: name.to_string(),
            age,
        }
    }
}

// 自定义相等性比较
#[derive(Debug)]
struct Book {
    isbn: String,
    title: String,
}

impl PartialEq for Book {
    fn eq(&self, other: &Self) -> bool {
        self.isbn == other.isbn  // 只比较 ISBN
    }
}

fn main() {
    let person1 = Person::new("Alice", 30);
    let person2 = Person::new("Alice", 30);
    let person3 = Person::new("Bob", 25);
    
    println!("person1 == person2: {}", person1 == person2);
    println!("person1 == person3: {}", person1 == person3);
    
    let book1 = Book {
        isbn: "978-0134685991".to_string(),
        title: "Effective Modern C++".to_string(),
    };
    
    let book2 = Book {
        isbn: "978-0134685991".to_string(),
        title: "Different Title".to_string(),  // 标题不同
    };
    
    println!("book1 == book2: {}", book1 == book2);  // true，因为 ISBN 相同
}
```

### Display 和 Debug

```rust
use std::fmt;

struct Rectangle {
    width: u32,
    height: u32,
}

impl fmt::Display for Rectangle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Rectangle({}x{})", self.width, self.height)
    }
}

impl fmt::Debug for Rectangle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Rectangle")
            .field("width", &self.width)
            .field("height", &self.height)
            .finish()
    }
}

fn main() {
    let rect = Rectangle {
        width: 30,
        height: 50,
    };
    
    println!("Display: {}", rect);
    println!("Debug: {:?}", rect);
    println!("Pretty Debug: {:#?}", rect);
}
```

## 实际应用示例

### 自定义 trait 系统

```rust
trait Drawable {
    fn draw(&self);
    fn area(&self) -> f64;
}

trait Colorable {
    fn set_color(&mut self, color: String);
    fn get_color(&self) -> &str;
}

struct Circle {
    radius: f64,
    color: String,
}

impl Circle {
    fn new(radius: f64) -> Self {
        Circle {
            radius,
            color: "black".to_string(),
        }
    }
}

impl Drawable for Circle {
    fn draw(&self) {
        println!("绘制半径为 {} 的圆形", self.radius);
    }
    
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

impl Colorable for Circle {
    fn set_color(&mut self, color: String) {
        self.color = color;
    }
    
    fn get_color(&self) -> &str {
        &self.color
    }
}

struct Rectangle {
    width: f64,
    height: f64,
    color: String,
}

impl Rectangle {
    fn new(width: f64, height: f64) -> Self {
        Rectangle {
            width,
            height,
            color: "black".to_string(),
        }
    }
}

impl Drawable for Rectangle {
    fn draw(&self) {
        println!("绘制 {}x{} 的矩形", self.width, self.height);
    }
    
    fn area(&self) -> f64 {
        self.width * self.height
    }
}

impl Colorable for Rectangle {
    fn set_color(&mut self, color: String) {
        self.color = color;
    }
    
    fn get_color(&self) -> &str {
        &self.color
    }
}

// 同时需要两个 trait 的函数
fn draw_colored_shape<T>(shape: &T)
where
    T: Drawable + Colorable,
{
    println!("绘制颜色为 {} 的图形", shape.get_color());
    shape.draw();
    println!("面积: {}", shape.area());
}

fn main() {
    let mut circle = Circle::new(5.0);
    circle.set_color("red".to_string());
    
    let mut rect = Rectangle::new(10.0, 20.0);
    rect.set_color("blue".to_string());
    
    draw_colored_shape(&circle);
    draw_colored_shape(&rect);
}
```

## 最佳实践

1. **使用描述性的 trait 名称**：
   ```rust
   trait Serializable {  // 好
       fn serialize(&self) -> String;
   }
   
   trait T {  // 不好
       fn do_something(&self);
   }
   ```

2. **保持 trait 专注**：
   ```rust
   // 好：专注的 trait
   trait Readable {
       fn read(&self) -> String;
   }
   
   trait Writable {
       fn write(&mut self, data: &str);
   }
   
   // 不太好：过于宽泛的 trait
   trait FileOperations {
       fn read(&self) -> String;
       fn write(&mut self, data: &str);
       fn delete(&self);
       fn compress(&self);
       // 太多责任...
   }
   ```

3. **提供默认实现**：
   ```rust
   trait Logger {
       fn log(&self, message: &str);
       
       fn log_error(&self, message: &str) {
           self.log(&format!("ERROR: {}", message));
       }
       
       fn log_info(&self, message: &str) {
           self.log(&format!("INFO: {}", message));
       }
   }
   ```

## 练习

1. 创建一个 `Printable` trait，为不同类型实现它
2. 实现一个 `Convertible` trait，支持类型之间的转换
3. 创建一个游戏角色系统，使用多个 trait 定义不同能力

## 下一步

学习完 trait 基础后，继续学习 [03-高级 trait](03-advanced-traits.md)。