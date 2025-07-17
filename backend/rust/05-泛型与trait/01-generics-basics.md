# 01-泛型基础

## 泛型的概念

泛型是一种编程语言特性，允许我们编写适用于多种类型的代码，而不是只能处理单一类型。在 Rust 中，泛型提供了代码重用的机制，同时保持类型安全。

## 泛型函数

### 基本语法

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    let result = largest(&numbers);
    println!("最大的数字是 {}", result);
    
    let chars = vec!['y', 'm', 'a', 'q'];
    let result = largest(&chars);
    println!("最大的字符是 {}", result);
}
```

### 多个泛型参数

```rust
fn compare_and_display<T, U>(x: T, y: U) 
where
    T: std::fmt::Display + PartialOrd,
    U: std::fmt::Display,
{
    println!("比较 {} 和 {}", x, y);
    if x > x { // 这里只是示例，实际中不能直接比较不同类型
        println!("{} 更大", x);
    }
}

// 更实用的例子
fn get_first_element<T>(list: &[T]) -> Option<&T> {
    if list.is_empty() {
        None
    } else {
        Some(&list[0])
    }
}

fn swap<T>(x: &mut T, y: &mut T) {
    std::mem::swap(x, y);
}

fn main() {
    let mut a = 5;
    let mut b = 10;
    
    println!("交换前: a = {}, b = {}", a, b);
    swap(&mut a, &mut b);
    println!("交换后: a = {}, b = {}", a, b);
    
    let numbers = vec![1, 2, 3];
    if let Some(first) = get_first_element(&numbers) {
        println!("第一个元素: {}", first);
    }
}
```

## 泛型结构体

### 基本结构体

```rust
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Point { x, y }
    }
    
    fn x(&self) -> &T {
        &self.x
    }
    
    fn y(&self) -> &T {
        &self.y
    }
}

// 为特定类型实现方法
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let integer_point = Point::new(5, 10);
    let float_point = Point::new(1.0, 4.0);
    
    println!("整数点: {:?}", integer_point);
    println!("浮点数点: {:?}", float_point);
    println!("距离原点: {}", float_point.distance_from_origin());
}
```

### 多个类型参数的结构体

```rust
#[derive(Debug)]
struct Pair<T, U> {
    first: T,
    second: U,
}

impl<T, U> Pair<T, U> {
    fn new(first: T, second: U) -> Self {
        Pair { first, second }
    }
    
    fn first(&self) -> &T {
        &self.first
    }
    
    fn second(&self) -> &U {
        &self.second
    }
    
    fn into_tuple(self) -> (T, U) {
        (self.first, self.second)
    }
}

// 当两个类型相同时的特殊实现
impl<T> Pair<T, T> 
where
    T: Clone + PartialOrd,
{
    fn larger_element(&self) -> T {
        if self.first >= self.second {
            self.first.clone()
        } else {
            self.second.clone()
        }
    }
}

fn main() {
    let pair1 = Pair::new("hello", 42);
    let pair2 = Pair::new(3.14, 2.71);
    let pair3 = Pair::new(10, 20);
    
    println!("Pair 1: {:?}", pair1);
    println!("Pair 2: {:?}", pair2);
    println!("较大的元素: {}", pair3.larger_element());
}
```

## 泛型枚举

### 基本枚举

```rust
#[derive(Debug)]
enum Result<T, E> {
    Ok(T),
    Err(E),
}

#[derive(Debug)]
enum Option<T> {
    Some(T),
    None,
}

// 自定义泛型枚举
#[derive(Debug)]
enum Either<L, R> {
    Left(L),
    Right(R),
}

impl<L, R> Either<L, R> {
    fn is_left(&self) -> bool {
        matches!(self, Either::Left(_))
    }
    
    fn is_right(&self) -> bool {
        matches!(self, Either::Right(_))
    }
    
    fn left(self) -> Option<L> {
        match self {
            Either::Left(value) => Some(value),
            Either::Right(_) => None,
        }
    }
    
    fn right(self) -> Option<R> {
        match self {
            Either::Left(_) => None,
            Either::Right(value) => Some(value),
        }
    }
}

fn main() {
    let success: Result<i32, String> = Result::Ok(42);
    let error: Result<i32, String> = Result::Err("出错了".to_string());
    
    println!("成功: {:?}", success);
    println!("错误: {:?}", error);
    
    let either_left = Either::Left("字符串");
    let either_right = Either::Right(123);
    
    println!("Left: {:?}", either_left);
    println!("Right: {:?}", either_right);
}
```

## 泛型约束（Trait Bounds）

### 基本约束

```rust
use std::fmt::Display;

fn print_and_return<T: Display>(value: T) -> T {
    println!("值是: {}", value);
    value
}

fn compare_and_print<T: Display + PartialOrd>(x: T, y: T) -> T {
    println!("比较 {} 和 {}", x, y);
    if x > y {
        println!("{} 更大", x);
        x
    } else {
        println!("{} 更大", y);
        y
    }
}

fn main() {
    let result = print_and_return(42);
    println!("返回的值: {}", result);
    
    let larger = compare_and_print(10, 20);
    println!("较大的值: {}", larger);
}
```

### 复杂的泛型约束

```rust
use std::fmt::{Debug, Display};
use std::clone::Clone;

fn complex_function<T>(item: T) -> T 
where
    T: Debug + Display + Clone + PartialEq,
{
    println!("Debug: {:?}", item);
    println!("Display: {}", item);
    let cloned = item.clone();
    if item == cloned {
        println!("克隆成功且相等");
    }
    item
}

// 条件性实现
struct Container<T> {
    value: T,
}

impl<T> Container<T> {
    fn new(value: T) -> Self {
        Container { value }
    }
}

impl<T: Display> Container<T> {
    fn display_value(&self) {
        println!("容器中的值: {}", self.value);
    }
}

impl<T: Clone> Container<T> {
    fn duplicate(&self) -> Container<T> {
        Container {
            value: self.value.clone(),
        }
    }
}

fn main() {
    let container = Container::new(42);
    container.display_value();
    
    let duplicated = container.duplicate();
    duplicated.display_value();
}
```

## 实际应用示例

### 泛型集合

```rust
#[derive(Debug)]
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Stack {
            items: Vec::new(),
        }
    }
    
    fn push(&mut self, item: T) {
        self.items.push(item);
    }
    
    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }
    
    fn peek(&self) -> Option<&T> {
        self.items.last()
    }
    
    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }
    
    fn len(&self) -> usize {
        self.items.len()
    }
}

impl<T: Clone> Stack<T> {
    fn duplicate_top(&mut self) -> Option<()> {
        if let Some(top) = self.peek().cloned() {
            self.push(top);
            Some(())
        } else {
            None
        }
    }
}

fn main() {
    let mut int_stack = Stack::new();
    int_stack.push(1);
    int_stack.push(2);
    int_stack.push(3);
    
    println!("栈: {:?}", int_stack);
    
    if let Some(top) = int_stack.pop() {
        println!("弹出: {}", top);
    }
    
    int_stack.duplicate_top();
    println!("复制顶部后: {:?}", int_stack);
    
    let mut string_stack = Stack::new();
    string_stack.push("hello".to_string());
    string_stack.push("world".to_string());
    
    println!("字符串栈: {:?}", string_stack);
}
```

### 泛型算法

```rust
fn bubble_sort<T: PartialOrd>(arr: &mut [T]) {
    let len = arr.len();
    for i in 0..len {
        for j in 0..len - 1 - i {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
}

fn binary_search<T: PartialOrd>(arr: &[T], target: &T) -> Option<usize> {
    let mut left = 0;
    let mut right = arr.len();
    
    while left < right {
        let mid = left + (right - left) / 2;
        if &arr[mid] == target {
            return Some(mid);
        } else if &arr[mid] < target {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    None
}

fn main() {
    let mut numbers = vec![64, 34, 25, 12, 22, 11, 90];
    println!("排序前: {:?}", numbers);
    
    bubble_sort(&mut numbers);
    println!("排序后: {:?}", numbers);
    
    if let Some(index) = binary_search(&numbers, &25) {
        println!("找到 25 在索引 {}", index);
    }
    
    let mut words = vec!["banana", "apple", "cherry", "date"];
    println!("排序前: {:?}", words);
    
    bubble_sort(&mut words);
    println!("排序后: {:?}", words);
}
```

## 性能考虑

### 单态化（Monomorphization）

Rust 的泛型通过单态化实现零成本抽象：

```rust
// 编译器会为每种具体类型生成专门的代码
fn generic_function<T>(x: T) -> T {
    x
}

fn main() {
    // 编译器生成类似以下的特化版本：
    // fn generic_function_i32(x: i32) -> i32 { x }
    // fn generic_function_f64(x: f64) -> f64 { x }
    
    let a = generic_function(5i32);
    let b = generic_function(3.14f64);
    let c = generic_function("hello");
    
    println!("{}, {}, {}", a, b, c);
}
```

### 编译时优化

```rust
use std::marker::PhantomData;

// 零大小类型，用于类型标记
struct Meter;
struct Foot;

struct Distance<Unit> {
    value: f64,
    _unit: PhantomData<Unit>,
}

impl<Unit> Distance<Unit> {
    fn new(value: f64) -> Self {
        Distance {
            value,
            _unit: PhantomData,
        }
    }
    
    fn value(&self) -> f64 {
        self.value
    }
}

impl Distance<Foot> {
    fn to_meters(self) -> Distance<Meter> {
        Distance::new(self.value * 0.3048)
    }
}

impl Distance<Meter> {
    fn to_feet(self) -> Distance<Foot> {
        Distance::new(self.value / 0.3048)
    }
}

fn main() {
    let distance_in_feet = Distance::<Foot>::new(10.0);
    let distance_in_meters = distance_in_feet.to_meters();
    
    println!("10 英尺 = {} 米", distance_in_meters.value());
    
    // 在编译时就能防止单位错误
    // let invalid = distance_in_meters + Distance::<Foot>::new(5.0); // 编译错误
}
```

## 最佳实践

1. **使用描述性的类型参数名**：
   ```rust
   // 好
   struct Cache<Key, Value> {
       entries: HashMap<Key, Value>,
   }
   
   // 不太好
   struct Cache<K, V> {
       entries: HashMap<K, V>,
   }
   ```

2. **合理使用 trait bound**：
   ```rust
   // 在需要的地方添加约束
   fn process<T: Clone + Debug>(item: T) {
       // 处理逻辑
   }
   ```

3. **避免过度泛型化**：
   ```rust
   // 如果只用于一种类型，不需要泛型
   fn process_string(s: String) -> String {
       // 具体处理字符串
       s
   }
   ```

## 练习

1. 实现一个泛型的二叉搜索树
2. 创建一个泛型的队列数据结构
3. 实现一个可以存储任意类型的缓存系统

## 下一步

学习完泛型基础后，继续学习 [02-trait 基础](02-trait-basics.md)。