# 03-高级 trait

## 关联类型（Associated Types）

关联类型是 trait 中定义的类型占位符，使用时需要指定具体类型。它简化了复杂的泛型签名。

### 基本关联类型

```rust
trait Iterator {
    type Item;  // 关联类型
    
    fn next(&mut self) -> Option<Self::Item>;
}

trait Graph {
    type Node;
    type Edge;
    
    fn nodes(&self) -> Vec<Self::Node>;
    fn edges(&self) -> Vec<Self::Edge>;
    fn add_edge(&mut self, edge: Self::Edge);
}
```

### 关联类型 vs 泛型

```rust
// 使用泛型的版本
trait Iterator<T> {
    fn next(&mut self) -> Option<T>;
}

// 使用关联类型的版本
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}

// 关联类型的优势：一个类型只能实现一次
struct Counter {
    current: usize,
    max: usize,
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
```

## 泛型约束和 where 子句

### 复杂的 where 子句

```rust
use std::fmt::{Debug, Display};

fn some_function<T, U, V>(t: &T, u: &U, v: &V) -> String
where
    T: Display + Clone,
    U: Clone + Debug,
    V: Display + Debug,
{
    format!("t: {}, u: {:?}, v: {} ({:?})", t, u.clone(), v, v)
}

// 条件性方法实现
struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

// 只有当 T 实现了 Display + PartialOrd 时才有这个方法
impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("最大的成员是 x = {}", self.x);
        } else {
            println!("最大的成员是 y = {}", self.y);
        }
    }
}

fn main() {
    let pair = Pair::new(10, 20);
    pair.cmp_display();
}
```

### 高阶 trait bound

```rust
fn apply_to_all<F, T>(items: &mut [T], f: F)
where
    F: Fn(&mut T),
{
    for item in items {
        f(item);
    }
}

fn transform_all<F, T, U>(items: Vec<T>, f: F) -> Vec<U>
where
    F: Fn(T) -> U,
{
    items.into_iter().map(f).collect()
}

fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    apply_to_all(&mut numbers, |x| *x *= 2);
    println!("翻倍后: {:?}", numbers);
    
    let strings = transform_all(numbers, |x| format!("数字: {}", x));
    println!("转换为字符串: {:?}", strings);
}
```

## 超 trait（Super trait）

### trait 继承

```rust
trait Animal {
    fn name(&self) -> &str;
    fn make_sound(&self);
}

trait Dog: Animal {  // Dog 继承 Animal
    fn breed(&self) -> &str;
    
    fn bark(&self) {
        println!("{} says: Woof!", self.name());
    }
}

struct GoldenRetriever {
    name: String,
}

impl Animal for GoldenRetriever {
    fn name(&self) -> &str {
        &self.name
    }
    
    fn make_sound(&self) {
        self.bark();
    }
}

impl Dog for GoldenRetriever {
    fn breed(&self) -> &str {
        "Golden Retriever"
    }
}

// 多重继承
trait Fly {
    fn fly(&self);
}

trait Swim {
    fn swim(&self);
}

trait Duck: Animal + Fly + Swim {
    fn quack(&self) {
        println!("{} says: Quack!", self.name());
    }
}

struct MallardDuck {
    name: String,
}

impl Animal for MallardDuck {
    fn name(&self) -> &str {
        &self.name
    }
    
    fn make_sound(&self) {
        self.quack();
    }
}

impl Fly for MallardDuck {
    fn fly(&self) {
        println!("{} is flying!", self.name());
    }
}

impl Swim for MallardDuck {
    fn swim(&self) {
        println!("{} is swimming!", self.name());
    }
}

impl Duck for MallardDuck {}

fn main() {
    let dog = GoldenRetriever {
        name: "Buddy".to_string(),
    };
    
    println!("这是一只 {} 名叫 {}", dog.breed(), dog.name());
    dog.make_sound();
    
    let duck = MallardDuck {
        name: "Donald".to_string(),
    };
    
    duck.fly();
    duck.swim();
    duck.make_sound();
}
```

### 使用超 trait 的约束

```rust
trait Printable {
    fn print(&self);
}

trait Debuggable: Printable {
    fn debug_info(&self) -> String;
    
    fn debug_print(&self) {
        println!("调试信息: {}", self.debug_info());
        self.print();  // 可以调用超 trait 的方法
    }
}

// 函数要求实现 Debuggable（自动包含 Printable）
fn analyze<T: Debuggable>(item: &T) {
    item.debug_print();
}

struct Document {
    title: String,
    content: String,
}

impl Printable for Document {
    fn print(&self) {
        println!("文档: {}", self.title);
    }
}

impl Debuggable for Document {
    fn debug_info(&self) -> String {
        format!("标题长度: {}, 内容长度: {}", 
                self.title.len(), self.content.len())
    }
}

fn main() {
    let doc = Document {
        title: "重要文档".to_string(),
        content: "这是文档内容...".to_string(),
    };
    
    analyze(&doc);
}
```

## 运算符重载

### 基本运算符重载

```rust
use std::ops::{Add, Sub, Mul, Div};

#[derive(Debug, Clone, Copy, PartialEq)]
struct Vector2D {
    x: f64,
    y: f64,
}

impl Vector2D {
    fn new(x: f64, y: f64) -> Self {
        Vector2D { x, y }
    }
    
    fn magnitude(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
}

impl Add for Vector2D {
    type Output = Vector2D;
    
    fn add(self, other: Vector2D) -> Vector2D {
        Vector2D {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl Sub for Vector2D {
    type Output = Vector2D;
    
    fn sub(self, other: Vector2D) -> Vector2D {
        Vector2D {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
}

impl Mul<f64> for Vector2D {
    type Output = Vector2D;
    
    fn mul(self, scalar: f64) -> Vector2D {
        Vector2D {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }
}

impl Div<f64> for Vector2D {
    type Output = Vector2D;
    
    fn div(self, scalar: f64) -> Vector2D {
        Vector2D {
            x: self.x / scalar,
            y: self.y / scalar,
        }
    }
}

fn main() {
    let v1 = Vector2D::new(3.0, 4.0);
    let v2 = Vector2D::new(1.0, 2.0);
    
    let v3 = v1 + v2;
    println!("v1 + v2 = {:?}", v3);
    
    let v4 = v1 - v2;
    println!("v1 - v2 = {:?}", v4);
    
    let v5 = v1 * 2.0;
    println!("v1 * 2 = {:?}", v5);
    
    let v6 = v1 / 2.0;
    println!("v1 / 2 = {:?}", v6);
    
    println!("v1 的模长: {}", v1.magnitude());
}
```

### 复合赋值运算符

```rust
use std::ops::{AddAssign, SubAssign, MulAssign};

impl AddAssign for Vector2D {
    fn add_assign(&mut self, other: Vector2D) {
        self.x += other.x;
        self.y += other.y;
    }
}

impl SubAssign for Vector2D {
    fn sub_assign(&mut self, other: Vector2D) {
        self.x -= other.x;
        self.y -= other.y;
    }
}

impl MulAssign<f64> for Vector2D {
    fn mul_assign(&mut self, scalar: f64) {
        self.x *= scalar;
        self.y *= scalar;
    }
}

fn main() {
    let mut v1 = Vector2D::new(3.0, 4.0);
    let v2 = Vector2D::new(1.0, 2.0);
    
    println!("初始 v1: {:?}", v1);
    
    v1 += v2;
    println!("v1 += v2 后: {:?}", v1);
    
    v1 -= v2;
    println!("v1 -= v2 后: {:?}", v1);
    
    v1 *= 2.0;
    println!("v1 *= 2 后: {:?}", v1);
}
```

### 索引运算符

```rust
use std::ops::{Index, IndexMut};

struct Matrix {
    data: Vec<Vec<f64>>,
    rows: usize,
    cols: usize,
}

impl Matrix {
    fn new(rows: usize, cols: usize) -> Self {
        Matrix {
            data: vec![vec![0.0; cols]; rows],
            rows,
            cols,
        }
    }
    
    fn from_data(data: Vec<Vec<f64>>) -> Self {
        let rows = data.len();
        let cols = if rows > 0 { data[0].len() } else { 0 };
        Matrix { data, rows, cols }
    }
}

impl Index<(usize, usize)> for Matrix {
    type Output = f64;
    
    fn index(&self, index: (usize, usize)) -> &Self::Output {
        &self.data[index.0][index.1]
    }
}

impl IndexMut<(usize, usize)> for Matrix {
    fn index_mut(&mut self, index: (usize, usize)) -> &mut Self::Output {
        &mut self.data[index.0][index.1]
    }
}

impl std::fmt::Display for Matrix {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for row in &self.data {
            for (i, val) in row.iter().enumerate() {
                if i > 0 { write!(f, " ")?; }
                write!(f, "{:6.2}", val)?;
            }
            writeln!(f)?;
        }
        Ok(())
    }
}

fn main() {
    let mut matrix = Matrix::new(3, 3);
    
    // 使用索引赋值
    matrix[(0, 0)] = 1.0;
    matrix[(1, 1)] = 2.0;
    matrix[(2, 2)] = 3.0;
    
    // 使用索引读取
    println!("matrix[(1, 1)] = {}", matrix[(1, 1)]);
    
    println!("矩阵:");
    println!("{}", matrix);
}
```

## 高级 trait 模式

### newtype 模式

```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

impl Wrapper {
    fn new(items: Vec<String>) -> Self {
        Wrapper(items)
    }
    
    fn push(&mut self, item: String) {
        self.0.push(item);
    }
}

fn main() {
    let mut w = Wrapper::new(vec![
        "hello".to_string(),
        "world".to_string(),
    ]);
    
    w.push("!".to_string());
    println!("Wrapper: {}", w);
}
```

### 类型状态模式

```rust
struct Locked;
struct Unlocked;

struct Database<State> {
    data: Vec<String>,
    _state: std::marker::PhantomData<State>,
}

impl Database<Locked> {
    fn new() -> Database<Locked> {
        Database {
            data: Vec::new(),
            _state: std::marker::PhantomData,
        }
    }
    
    fn unlock(self, _password: &str) -> Database<Unlocked> {
        Database {
            data: self.data,
            _state: std::marker::PhantomData,
        }
    }
}

impl Database<Unlocked> {
    fn read(&self) -> &[String] {
        &self.data
    }
    
    fn write(&mut self, data: String) {
        self.data.push(data);
    }
    
    fn lock(self) -> Database<Locked> {
        Database {
            data: self.data,
            _state: std::marker::PhantomData,
        }
    }
}

fn main() {
    let db = Database::new();  // 锁定状态
    // db.read();  // 编译错误！锁定状态不能读取
    
    let mut db = db.unlock("password123");  // 解锁
    db.write("数据1".to_string());
    db.write("数据2".to_string());
    
    println!("数据: {:?}", db.read());
    
    let _db = db.lock();  // 重新锁定
}
```

## 动态分发

### trait 对象

```rust
trait Draw {
    fn draw(&self);
}

struct Circle {
    radius: f64,
}

struct Rectangle {
    width: f64,
    height: f64,
}

impl Draw for Circle {
    fn draw(&self) {
        println!("绘制半径为 {} 的圆", self.radius);
    }
}

impl Draw for Rectangle {
    fn draw(&self) {
        println!("绘制 {}x{} 的矩形", self.width, self.height);
    }
}

// 使用 trait 对象的集合
fn main() {
    let shapes: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Rectangle { width: 10.0, height: 20.0 }),
        Box::new(Circle { radius: 3.0 }),
    ];
    
    for shape in shapes {
        shape.draw();
    }
}
```

### 对象安全性

```rust
// 对象安全的 trait
trait ObjectSafe {
    fn method(&self);
    fn default_behavior(&self) {
        println!("默认行为");
    }
}

// 不是对象安全的 trait（包含泛型方法）
trait NotObjectSafe {
    fn generic_method<T>(&self, item: T);  // 泛型方法
}

// 不是对象安全的 trait（返回 Self）
trait AlsoNotObjectSafe {
    fn return_self(&self) -> Self;  // 返回 Self
}

struct MyStruct;

impl ObjectSafe for MyStruct {
    fn method(&self) {
        println!("MyStruct 的方法");
    }
}

fn use_trait_object(obj: &dyn ObjectSafe) {
    obj.method();
}

fn main() {
    let my_struct = MyStruct;
    use_trait_object(&my_struct);  // 正常工作
    
    // let obj: Box<dyn NotObjectSafe> = Box::new(MyStruct);  // 编译错误！
}
```

## 最佳实践

1. **选择关联类型还是泛型参数**：
   ```rust
   // 当一个类型只能有一种实现时使用关联类型
   trait Iterator {
       type Item;
       fn next(&mut self) -> Option<Self::Item>;
   }
   
   // 当一个类型可能有多种实现时使用泛型参数
   trait From<T> {
       fn from(value: T) -> Self;
   }
   ```

2. **合理使用 where 子句**：
   ```rust
   // 复杂约束时使用 where 子句提高可读性
   fn complex_function<T, U>(t: T, u: U) -> String
   where
       T: Display + Debug + Clone,
       U: IntoIterator,
       U::Item: Display,
   {
       // 函数体
       String::new()
   }
   ```

3. **考虑对象安全性**：
   ```rust
   // 设计可能需要动态分发的 trait 时，确保对象安全
   trait Drawable {
       fn draw(&self);  // 不包含泛型参数，对象安全
   }
   ```

## 练习

1. 实现一个通用的缓存 trait，支持不同的存储后端
2. 创建一个序列化系统，使用关联类型定义序列化格式
3. 实现一个状态机模式，使用类型状态确保状态转换的正确性

## 下一步

学习完高级 trait 后，继续学习 [04-生命周期](04-lifetimes.md)。