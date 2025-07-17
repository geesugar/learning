# 所有权基础

## 学习目标

- 理解所有权的基本概念
- 掌握所有权的三个规则
- 理解移动语义和复制语义
- 学会分析变量的作用域
- 掌握函数调用中的所有权转移

## 什么是所有权

所有权是 Rust 最独特也是最重要的特性，它使 Rust 能够在没有垃圾收集器的情况下保证内存安全。所有权系统在编译时检查内存使用，确保程序不会出现内存泄漏、悬垂指针或数据竞争。

### 内存管理的不同方式

```rust
fn main() {
    // 在其他语言中，内存管理通常是这样的：
    // 1. 手动管理（C/C++）：malloc/free，容易出错
    // 2. 垃圾收集（Java/Python）：自动回收，但有性能开销
    // 3. Rust 方式：编译时检查，零运行时成本
    
    let s = String::from("hello");  // 分配内存
    // 使用 s...
    println!("{}", s);
} // s 离开作用域，内存自动释放
```

## 所有权规则

Rust 的所有权系统基于三个规则：

1. **Rust 中的每个值都有一个所有者**
2. **值在任一时刻只能有一个所有者**
3. **当所有者离开作用域时，值将被丢弃**

### 规则 1：每个值都有一个所有者

```rust
fn main() {
    let x = 5;              // x 是值 5 的所有者
    let s = String::from("hello");  // s 是字符串的所有者
    
    println!("x = {}, s = {}", x, s);
}
```

### 规则 2：值在任一时刻只能有一个所有者

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1 的所有权转移给 s2
    
    // println!("{}", s1);  // 编译错误！s1 不再有效
    println!("{}", s2);     // 正确，s2 现在拥有值
}
```

### 规则 3：当所有者离开作用域时，值将被丢弃

```rust
fn main() {
    {
        let s = String::from("hello");
        println!("{}", s);
    } // s 离开作用域，内存被自动释放
    
    // println!("{}", s);  // 编译错误！s 不在作用域内
}
```

## 变量作用域

作用域是一个项目在程序中有效的范围。

### 1. 块级作用域

```rust
fn main() {
    // s 在这里不可用，尚未声明
    
    {
        let s = String::from("hello");
        println!("内部作用域: {}", s);
        // s 在这里有效
    } // s 离开作用域并被释放
    
    // println!("{}", s);  // 编译错误！s 不在作用域内
}
```

### 2. 函数作用域

```rust
fn main() {
    let s = String::from("hello");
    
    take_ownership(s);  // s 的所有权转移给函数
    
    // println!("{}", s);  // 编译错误！s 的所有权已转移
}

fn take_ownership(some_string: String) {
    println!("{}", some_string);
} // some_string 离开作用域并被释放
```

### 3. 条件作用域

```rust
fn main() {
    let condition = true;
    
    let s = if condition {
        String::from("hello")
    } else {
        String::from("world")
    };
    
    println!("{}", s);
}
```

## 移动语义

当我们将一个值赋给另一个变量时，会发生什么取决于数据的类型。

### 1. 栈上数据的复制

```rust
fn main() {
    let x = 5;
    let y = x;  // 复制 x 的值给 y
    
    println!("x = {}, y = {}", x, y);  // 两个变量都可以使用
}
```

### 2. 堆上数据的移动

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1 被移动到 s2，s1 不再有效
    
    // println!("{}", s1);  // 编译错误！
    println!("{}", s2);     // 正确
}
```

### 3. 移动的内部机制

```rust
fn main() {
    // String 在内存中的表示
    let s1 = String::from("hello");
    // s1 = { ptr: 0x1234, len: 5, capacity: 5 }
    // 堆内存: [h, e, l, l, o]
    
    let s2 = s1;  // 只复制栈上的数据（指针、长度、容量）
    // s2 = { ptr: 0x1234, len: 5, capacity: 5 }
    // 堆内存仍然是: [h, e, l, l, o]
    // s1 被标记为无效
}
```

### 4. 深拷贝 vs 浅拷贝

```rust
fn main() {
    let s1 = String::from("hello");
    
    // 浅拷贝（移动）
    let s2 = s1;  // s1 被移动
    
    // 深拷贝
    let s3 = String::from("hello");
    let s4 = s3.clone();  // 显式克隆
    
    println!("s2 = {}", s2);
    println!("s3 = {}, s4 = {}", s3, s4);  // 两个都可以使用
}
```

## 复制语义

某些类型实现了 `Copy` trait，这些类型在赋值时会被复制而不是移动。

### 1. 实现 Copy 的类型

```rust
fn main() {
    // 基本类型都实现了 Copy
    let x = 5;
    let y = x;  // 复制
    println!("x = {}, y = {}", x, y);
    
    let a = true;
    let b = a;  // 复制
    println!("a = {}, b = {}", a, b);
    
    let c = 'A';
    let d = c;  // 复制
    println!("c = {}, d = {}", c, d);
    
    // 元组（如果所有元素都是 Copy 类型）
    let point = (1, 2);
    let point2 = point;  // 复制
    println!("point = {:?}, point2 = {:?}", point, point2);
}
```

### 2. 不实现 Copy 的类型

```rust
fn main() {
    // String 不实现 Copy
    let s1 = String::from("hello");
    let s2 = s1;  // 移动
    // println!("{}", s1);  // 编译错误！
    
    // Vec 不实现 Copy
    let v1 = vec![1, 2, 3];
    let v2 = v1;  // 移动
    // println!("{:?}", v1);  // 编译错误！
    
    // 包含非 Copy 类型的元组
    let data = (String::from("hello"), 42);
    let data2 = data;  // 移动
    // println!("{:?}", data);  // 编译错误！
}
```

### 3. Copy trait 的规则

```rust
// 可以实现 Copy 的类型
#[derive(Copy, Clone)]
struct Point {
    x: i32,
    y: i32,
}

// 不能实现 Copy 的类型（包含 String）
struct Person {
    name: String,  // String 不是 Copy
    age: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = p1;  // 复制
    println!("p1 = {:?}, p2 = {:?}", p1, p2);
    
    let person1 = Person {
        name: String::from("Alice"),
        age: 30,
    };
    let person2 = person1;  // 移动
    // println!("{:?}", person1);  // 编译错误！
}
```

## 函数调用中的所有权

### 1. 函数参数的所有权转移

```rust
fn main() {
    let s = String::from("hello");
    
    takes_ownership(s);  // s 的所有权转移给函数
    
    // println!("{}", s);  // 编译错误！s 已被移动
    
    let x = 5;
    makes_copy(x);  // x 被复制给函数
    
    println!("x = {}", x);  // 正确，x 仍然有效
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
} // some_string 离开作用域并被释放

fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
} // some_integer 离开作用域，但因为是 Copy 类型，原值不受影响
```

### 2. 函数返回值的所有权转移

```rust
fn main() {
    let s1 = gives_ownership();         // gives_ownership 将返回值的所有权转移给 s1
    
    let s2 = String::from("hello");     // s2 获得所有权
    
    let s3 = takes_and_gives_back(s2);  // s2 被移动到函数中，函数返回值的所有权转移给 s3
    
    println!("s1 = {}, s3 = {}", s1, s3);
    // println!("{}", s2);  // 编译错误！s2 已被移动
}

fn gives_ownership() -> String {
    let some_string = String::from("hello");
    some_string  // 返回 some_string 的所有权
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string  // 返回 a_string 的所有权
}
```

### 3. 返回多个值

```rust
fn main() {
    let s1 = String::from("hello");
    
    let (s2, len) = calculate_length(s1);
    
    println!("字符串 '{}' 的长度是 {}", s2, len);
}

fn calculate_length(s: String) -> (String, usize) {
    let length = s.len();
    (s, length)  // 返回字符串和长度
}
```

## 实践练习

### 练习 1：理解所有权转移

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = String::from("world");
    
    println!("处理前: s1 = {}, s2 = {}", s1, s2);
    
    let result = combine_strings(s1, s2);
    
    println!("结果: {}", result);
    
    // 尝试访问 s1 和 s2 会导致编译错误
    // println!("s1 = {}, s2 = {}", s1, s2);
}

fn combine_strings(a: String, b: String) -> String {
    format!("{} {}", a, b)
}
```

### 练习 2：所有权在数据结构中的应用

```rust
struct Person {
    name: String,
    age: i32,
}

fn main() {
    let person = Person {
        name: String::from("Alice"),
        age: 30,
    };
    
    // 整个结构体的所有权转移
    let person2 = person;
    
    // println!("{}", person.name);  // 编译错误！
    println!("{}", person2.name);   // 正确
    
    // 创建新的实例
    let person3 = Person {
        name: String::from("Bob"),
        age: 25,
    };
    
    process_person(person3);
    
    // println!("{}", person3.name);  // 编译错误！
}

fn process_person(p: Person) {
    println!("处理人员: {}, 年龄: {}", p.name, p.age);
}
```

### 练习 3：所有权与集合

```rust
fn main() {
    let mut names = Vec::new();
    
    let name1 = String::from("Alice");
    let name2 = String::from("Bob");
    
    names.push(name1);  // name1 的所有权转移给 Vec
    names.push(name2);  // name2 的所有权转移给 Vec
    
    // println!("{}", name1);  // 编译错误！
    
    println!("名字列表: {:?}", names);
    
    // 从 Vec 中取出元素
    let first_name = names.remove(0);
    println!("第一个名字: {}", first_name);
    
    println!("剩余名字: {:?}", names);
}
```

### 练习 4：函数中的所有权管理

```rust
fn main() {
    let data = vec![1, 2, 3, 4, 5];
    
    println!("原始数据: {:?}", data);
    
    let processed = process_data(data);
    
    println!("处理后数据: {:?}", processed);
    
    // println!("{:?}", data);  // 编译错误！data 已被移动
}

fn process_data(mut data: Vec<i32>) -> Vec<i32> {
    // 修改数据
    for item in &mut data {
        *item *= 2;
    }
    
    // 添加新元素
    data.push(100);
    
    data  // 返回修改后的数据
}
```

## 常见错误和解决方案

### 1. 使用已移动的值

```rust
fn main() {
    let s = String::from("hello");
    let s2 = s;  // s 被移动
    
    // println!("{}", s);  // 编译错误！
    
    // 解决方案 1：使用 clone
    let s3 = String::from("hello");
    let s4 = s3.clone();
    println!("s3 = {}, s4 = {}", s3, s4);
    
    // 解决方案 2：使用引用（下一章学习）
    let s5 = String::from("hello");
    let s6 = &s5;
    println!("s5 = {}, s6 = {}", s5, s6);
}
```

### 2. 在循环中的所有权问题

```rust
fn main() {
    let strings = vec![
        String::from("hello"),
        String::from("world"),
    ];
    
    // 错误的方式
    // for s in strings {
    //     println!("{}", s);
    // }
    // println!("{:?}", strings);  // 编译错误！
    
    // 正确的方式
    for s in &strings {  // 借用引用
        println!("{}", s);
    }
    println!("{:?}", strings);  // 正确
}
```

### 3. 结构体字段的部分移动

```rust
struct Person {
    name: String,
    age: i32,
}

fn main() {
    let person = Person {
        name: String::from("Alice"),
        age: 30,
    };
    
    let name = person.name;  // 部分移动
    let age = person.age;    // 复制（i32 是 Copy 类型）
    
    // println!("{}", person.name);  // 编译错误！name 已被移动
    // println!("{}", person.age);   // 编译错误！整个结构体已部分移动
    
    println!("名字: {}, 年龄: {}", name, age);
}
```

## 内存安全的保证

### 1. 防止悬垂指针

```rust
fn main() {
    let s;
    {
        let temp = String::from("hello");
        // s = &temp;  // 如果这样做会导致悬垂指针
    }
    // println!("{}", s);  // 编译错误！
}
```

### 2. 防止重复释放

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // 移动，不是复制
    
    // 当 s1 和 s2 离开作用域时，只有 s2 会释放内存
    // s1 已经无效，不会造成重复释放
}
```

### 3. 防止内存泄漏

```rust
fn main() {
    let s = String::from("hello");
    // 即使我们忘记手动释放，当 s 离开作用域时会自动释放
}
```

## 总结

所有权系统是 Rust 的核心特性：

1. **内存安全**：编译时防止悬垂指针、重复释放等错误
2. **零成本抽象**：运行时没有额外开销
3. **移动语义**：默认情况下，赋值会移动所有权
4. **Copy trait**：某些类型可以被复制而不是移动
5. **作用域管理**：变量离开作用域时自动释放资源

理解所有权系统需要时间和实践，但它是掌握 Rust 的关键。一旦理解了所有权，你就能写出既安全又高效的代码。

## 下一步

完成本节学习后，请继续学习 [02-引用与借用](02-references-borrowing.md)。