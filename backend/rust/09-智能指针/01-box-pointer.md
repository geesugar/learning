# 01-Box 智能指针

## Box<T> 概述

Box<T> 是最简单的智能指针，用于在堆上分配数据。它提供了在堆上存储数据的能力，而不是默认的栈上存储。Box<T> 有确定的所有权：当 Box 离开作用域时，它会自动清理堆上的数据。

## 基本使用

### 堆分配

```rust
fn main() {
    // 在堆上分配一个整数
    let b = Box::new(5);
    println!("b = {}", b);
    
    // 在堆上分配一个字符串
    let s = Box::new(String::from("Hello, Box!"));
    println!("s = {}", s);
    
    // 在堆上分配一个向量
    let v = Box::new(vec![1, 2, 3, 4, 5]);
    println!("v = {:?}", v);
}
```

### Box 的解引用

```rust
fn main() {
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y); // 解引用 Box

    // Box 实现了 Deref trait，支持自动解引用
    let boxed_string = Box::new(String::from("Hello"));
    print_string(&boxed_string); // 自动解引用为 &String，再解引用为 &str
}

fn print_string(s: &str) {
    println!("{}", s);
}
```

## 递归类型

### 使用 Box 定义递归数据结构

```rust
// 链表节点定义
#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

impl List {
    fn new() -> List {
        Nil
    }
    
    fn prepend(self, elem: i32) -> List {
        Cons(elem, Box::new(self))
    }
    
    fn len(&self) -> usize {
        match *self {
            Cons(_, ref tail) => 1 + tail.len(),
            Nil => 0,
        }
    }
    
    fn stringify(&self) -> String {
        match *self {
            Cons(head, ref tail) => {
                format!("{}, {}", head, tail.stringify())
            }
            Nil => {
                format!("Nil")
            }
        }
    }
}

fn main() {
    let mut list = List::new();
    
    list = list.prepend(1);
    list = list.prepend(2);
    list = list.prepend(3);
    
    println!("链表: {}", list.stringify());
    println!("长度: {}", list.len());
}
```

### 二叉树实现

```rust
#[derive(Debug)]
struct TreeNode {
    value: i32,
    left: Option<Box<TreeNode>>,
    right: Option<Box<TreeNode>>,
}

impl TreeNode {
    fn new(value: i32) -> Self {
        TreeNode {
            value,
            left: None,
            right: None,
        }
    }
    
    fn insert(&mut self, value: i32) {
        if value <= self.value {
            match self.left {
                Some(ref mut left) => left.insert(value),
                None => self.left = Some(Box::new(TreeNode::new(value))),
            }
        } else {
            match self.right {
                Some(ref mut right) => right.insert(value),
                None => self.right = Some(Box::new(TreeNode::new(value))),
            }
        }
    }
    
    fn search(&self, value: i32) -> bool {
        if value == self.value {
            return true;
        } else if value < self.value {
            match self.left {
                Some(ref left) => left.search(value),
                None => false,
            }
        } else {
            match self.right {
                Some(ref right) => right.search(value),
                None => false,
            }
        }
    }
    
    fn inorder_traversal(&self) -> Vec<i32> {
        let mut result = Vec::new();
        self.inorder_helper(&mut result);
        result
    }
    
    fn inorder_helper(&self, result: &mut Vec<i32>) {
        if let Some(ref left) = self.left {
            left.inorder_helper(result);
        }
        result.push(self.value);
        if let Some(ref right) = self.right {
            right.inorder_helper(result);
        }
    }
}

fn main() {
    let mut root = TreeNode::new(10);
    
    root.insert(5);
    root.insert(15);
    root.insert(3);
    root.insert(7);
    root.insert(12);
    root.insert(18);
    
    println!("二叉搜索树: {:?}", root);
    println!("搜索 7: {}", root.search(7));
    println!("搜索 100: {}", root.search(100));
    println!("中序遍历: {:?}", root.inorder_traversal());
}
```

## 大数据处理

### 避免栈溢出

```rust
fn main() {
    // 创建一个大数组，直接在栈上会导致栈溢出
    // let large_array = [0u8; 1_000_000]; // 这会导致栈溢出
    
    // 使用 Box 在堆上分配
    let large_array = Box::new([0u8; 1_000_000]);
    println!("大数组已在堆上分配，长度: {}", large_array.len());
    
    // 大结构体的处理
    let large_struct = Box::new(LargeStruct::new());
    large_struct.process();
}

struct LargeStruct {
    data: [u64; 100_000],
}

impl LargeStruct {
    fn new() -> Self {
        LargeStruct {
            data: [0; 100_000],
        }
    }
    
    fn process(&self) {
        println!("处理大结构体，数据长度: {}", self.data.len());
    }
}
```

### 传递所有权

```rust
fn main() {
    let data = Box::new(vec![1, 2, 3, 4, 5]);
    
    // 传递 Box 的所有权
    let processed = process_data(data);
    println!("处理后的数据: {:?}", processed);
    
    // data 在这里不再可用，因为所有权已经转移
    // println!("{:?}", data); // 编译错误！
}

fn process_data(mut data: Box<Vec<i32>>) -> Box<Vec<i32>> {
    data.iter_mut().for_each(|x| *x *= 2);
    data
}
```

## 性能考虑

### 内存布局比较

```rust
fn main() {
    // 栈上的数据
    let stack_data = [1, 2, 3, 4, 5];
    println!("栈数据地址: {:p}", &stack_data);
    println!("栈数据第一个元素地址: {:p}", &stack_data[0]);
    
    // 堆上的数据
    let heap_data = Box::new([1, 2, 3, 4, 5]);
    println!("Box 地址: {:p}", &heap_data);
    println!("堆数据地址: {:p}", heap_data.as_ptr());
    println!("堆数据第一个元素地址: {:p}", &heap_data[0]);
    
    // 比较访问性能
    use std::time::Instant;
    
    let start = Instant::now();
    let mut sum = 0;
    for _ in 0..1_000_000 {
        sum += stack_data[0];
    }
    println!("栈访问时间: {:?}", start.elapsed());
    
    let start = Instant::now();
    let mut sum = 0;
    for _ in 0..1_000_000 {
        sum += heap_data[0];
    }
    println!("堆访问时间: {:?}", start.elapsed());
}
```

### Box 的零成本抽象

```rust
fn main() {
    // Box 的解引用是零成本的
    let boxed_value = Box::new(42);
    
    // 这些操作在运行时的成本是相同的
    let value1 = *boxed_value;
    let value2 = boxed_value.as_ref();
    
    println!("值1: {}, 值2: {}", value1, value2);
    
    // Box 的模式匹配
    match Box::new(10) {
        box_val => {
            println!("匹配到 Box 值: {}", box_val);
        }
    }
}
```

## 实际应用示例

### 动态分派

```rust
trait Drawable {
    fn draw(&self);
}

struct Circle {
    radius: f64,
}

struct Rectangle {
    width: f64,
    height: f64,
}

impl Drawable for Circle {
    fn draw(&self) {
        println!("绘制圆形，半径: {}", self.radius);
    }
}

impl Drawable for Rectangle {
    fn draw(&self) {
        println!("绘制矩形，{}x{}", self.width, self.height);
    }
}

fn main() {
    let shapes: Vec<Box<dyn Drawable>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Rectangle { width: 10.0, height: 20.0 }),
        Box::new(Circle { radius: 3.0 }),
    ];
    
    for shape in shapes {
        shape.draw();
    }
}
```

### 构建器模式

```rust
struct Config {
    host: String,
    port: u16,
    timeout: u64,
    debug: bool,
}

struct ConfigBuilder {
    config: Box<Config>,
}

impl ConfigBuilder {
    fn new() -> Self {
        ConfigBuilder {
            config: Box::new(Config {
                host: "localhost".to_string(),
                port: 8080,
                timeout: 30,
                debug: false,
            }),
        }
    }
    
    fn host(mut self, host: &str) -> Self {
        self.config.host = host.to_string();
        self
    }
    
    fn port(mut self, port: u16) -> Self {
        self.config.port = port;
        self
    }
    
    fn timeout(mut self, timeout: u64) -> Self {
        self.config.timeout = timeout;
        self
    }
    
    fn debug(mut self, debug: bool) -> Self {
        self.config.debug = debug;
        self
    }
    
    fn build(self) -> Box<Config> {
        self.config
    }
}

fn main() {
    let config = ConfigBuilder::new()
        .host("example.com")
        .port(9090)
        .timeout(60)
        .debug(true)
        .build();
    
    println!("配置: {}:{}, 超时: {}s, 调试: {}", 
             config.host, config.port, config.timeout, config.debug);
}
```

### 缓存系统

```rust
use std::collections::HashMap;

struct Cache<K, V> {
    data: HashMap<K, Box<V>>,
    max_size: usize,
}

impl<K, V> Cache<K, V>
where
    K: std::hash::Hash + Eq + Clone,
{
    fn new(max_size: usize) -> Self {
        Cache {
            data: HashMap::new(),
            max_size,
        }
    }
    
    fn get(&self, key: &K) -> Option<&V> {
        self.data.get(key).map(|boxed| boxed.as_ref())
    }
    
    fn insert(&mut self, key: K, value: V) {
        if self.data.len() >= self.max_size {
            // 简单的淘汰策略：移除第一个
            if let Some(first_key) = self.data.keys().next().cloned() {
                self.data.remove(&first_key);
            }
        }
        
        self.data.insert(key, Box::new(value));
    }
    
    fn size(&self) -> usize {
        self.data.len()
    }
}

fn main() {
    let mut cache = Cache::new(3);
    
    cache.insert("key1", "value1");
    cache.insert("key2", "value2");
    cache.insert("key3", "value3");
    
    println!("缓存大小: {}", cache.size());
    
    if let Some(value) = cache.get(&"key1") {
        println!("找到值: {}", value);
    }
    
    // 插入第四个元素，会触发淘汰
    cache.insert("key4", "value4");
    println!("插入 key4 后缓存大小: {}", cache.size());
}
```

## Box 的内存管理

### 手动控制内存

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

fn main() {
    // Box 自动管理内存
    {
        let boxed = Box::new(42);
        println!("Box 值: {}", boxed);
    } // boxed 在这里自动释放
    
    // 手动内存管理（不推荐，仅作对比）
    unsafe {
        let layout = Layout::new::<i32>();
        let ptr = alloc(layout) as *mut i32;
        
        if !ptr.is_null() {
            ptr::write(ptr, 42);
            println!("手动分配的值: {}", ptr::read(ptr));
            dealloc(ptr as *mut u8, layout);
        }
    }
    
    // Box::leak - 故意泄漏内存
    let boxed = Box::new(String::from("泄漏的字符串"));
    let leaked: &'static mut String = Box::leak(boxed);
    leaked.push_str(" - 已泄漏");
    println!("泄漏的字符串: {}", leaked);
}
```

### Box 的转换

```rust
fn main() {
    // Box 到原始指针
    let boxed = Box::new(42);
    let raw_ptr = Box::into_raw(boxed);
    
    unsafe {
        println!("原始指针指向的值: {}", *raw_ptr);
        
        // 从原始指针重新创建 Box
        let restored_box = Box::from_raw(raw_ptr);
        println!("恢复的 Box: {}", restored_box);
    }
    
    // Box 到 Vec
    let boxed_array = Box::new([1, 2, 3, 4, 5]);
    let vec_from_box = boxed_array.into_vec();
    println!("从 Box 转换的 Vec: {:?}", vec_from_box);
}
```

## 最佳实践

### 何时使用 Box

```rust
// 1. 递归类型
enum List<T> {
    Cons(T, Box<List<T>>),
    Nil,
}

// 2. 大型数据结构
struct LargeData {
    // 大量字段...
}

fn process_large_data() -> Box<LargeData> {
    // 在堆上创建，避免栈溢出
    Box::new(LargeData { /* ... */ })
}

// 3. trait 对象
fn create_drawable() -> Box<dyn Drawable> {
    Box::new(Circle { radius: 5.0 })
}

// 4. 转移所有权到堆
fn move_to_heap<T>(value: T) -> Box<T> {
    Box::new(value)
}
```

### 避免不必要的 Box

```rust
// 不好的用法
fn bad_usage() {
    let unnecessary_box = Box::new(5); // 小数据不需要装箱
    let value = *unnecessary_box; // 立即解引用
    println!("{}", value);
}

// 好的用法
fn good_usage() {
    let value = 5; // 直接使用栈分配
    println!("{}", value);
}

// 有意义的 Box 使用
fn meaningful_box_usage() -> Box<String> {
    Box::new(String::from("这个字符串需要传递所有权"))
}
```

## 练习

1. 实现一个使用 Box 的双向链表
2. 创建一个基于 Box 的表达式解析器
3. 实现一个内存池，使用 Box 管理大型对象

## 下一步

学习完 Box 智能指针后，继续学习 [02-引用计数 Rc](02-reference-counting.md)。