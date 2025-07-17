# 引用与借用

## 学习目标

- 理解引用的概念和作用
- 掌握不可变引用和可变引用的使用
- 理解借用规则和借用检查器
- 学会避免悬垂引用
- 掌握引用的生命周期

## 什么是引用

引用（Reference）是一种不获取所有权的方式来使用值。通过引用，我们可以在不移动值的情况下使用它。

```rust
fn main() {
    let s1 = String::from("hello");
    
    let len = calculate_length(&s1);  // 传递引用
    
    println!("字符串 '{}' 的长度是 {}", s1, len);  // s1 仍然有效
}

fn calculate_length(s: &String) -> usize {
    s.len()
}  // s 是引用，离开作用域时不会丢弃数据
```

## 引用的语法

### 1. 创建引用

```rust
fn main() {
    let x = 5;
    let y = &x;  // y 是 x 的引用
    
    println!("x = {}", x);
    println!("y = {}", y);
    println!("*y = {}", *y);  // 解引用
    
    let s = String::from("hello");
    let s_ref = &s;  // s_ref 是 s 的引用
    
    println!("s = {}", s);
    println!("s_ref = {}", s_ref);
}
```

### 2. 解引用

```rust
fn main() {
    let x = 5;
    let y = &x;
    
    assert_eq!(5, x);
    assert_eq!(5, *y);  // 解引用操作符 *
    
    // 字符串引用的自动解引用
    let s = String::from("hello");
    let s_ref = &s;
    
    println!("长度: {}", s.len());
    println!("引用的长度: {}", s_ref.len());  // 自动解引用
}
```

## 借用规则

Rust 的借用检查器（Borrow Checker）强制执行以下规则：

1. **在任意给定时间，要么只能有一个可变引用，要么只能有多个不可变引用**
2. **引用必须总是有效的**

### 1. 不可变引用

```rust
fn main() {
    let s = String::from("hello");
    
    let r1 = &s;  // 不可变引用
    let r2 = &s;  // 可以有多个不可变引用
    let r3 = &s;  // 没问题
    
    println!("r1: {}, r2: {}, r3: {}", r1, r2, r3);
    
    // 不可变引用不能修改值
    // *r1 = String::from("world");  // 编译错误！
}
```

### 2. 可变引用

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &mut s;  // 可变引用
    
    r1.push_str(", world");
    println!("r1: {}", r1);
    
    // 在同一作用域内，只能有一个可变引用
    // let r2 = &mut s;  // 编译错误！
}
```

### 3. 可变引用和不可变引用不能共存

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;      // 不可变引用
    let r2 = &s;      // 另一个不可变引用
    
    println!("r1: {}, r2: {}", r1, r2);
    // 在这里，r1 和 r2 不再使用
    
    let r3 = &mut s;  // 可变引用，此时可以创建
    r3.push_str(", world");
    println!("r3: {}", r3);
}
```

### 4. 引用的作用域

```rust
fn main() {
    let mut s = String::from("hello");
    
    {
        let r1 = &s;  // 不可变引用
        println!("r1: {}", r1);
    }  // r1 离开作用域
    
    let r2 = &mut s;  // 可以创建可变引用
    r2.push_str(", world");
    println!("r2: {}", r2);
}
```

## 函数中的引用

### 1. 函数参数引用

```rust
fn main() {
    let s = String::from("hello");
    
    // 传递不可变引用
    let len = calculate_length(&s);
    println!("字符串 '{}' 的长度是 {}", s, len);
    
    let mut s2 = String::from("hello");
    
    // 传递可变引用
    change(&mut s2);
    println!("修改后的字符串: {}", s2);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}
```

### 2. 返回引用

```rust
fn main() {
    let s = String::from("hello world");
    
    let word = first_word(&s);
    println!("第一个单词: {}", word);
    
    let numbers = [1, 2, 3, 4, 5];
    let first = get_first(&numbers);
    println!("第一个数字: {}", first);
}

fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[..i];
        }
    }
    
    &s[..]
}

fn get_first(arr: &[i32]) -> &i32 {
    &arr[0]
}
```

## 悬垂引用

悬垂引用是指引用指向的内存已经被释放的情况。Rust 编译器会阻止悬垂引用。

### 1. 悬垂引用示例

```rust
fn main() {
    // let reference_to_nothing = dangle();  // 编译错误！
    let no_dangle = no_dangle();
    println!("{}", no_dangle);
}

// 这个函数会产生悬垂引用
// fn dangle() -> &String {  // 编译错误！
//     let s = String::from("hello");
//     &s  // 返回 s 的引用，但 s 将被销毁
// }

// 正确的方式：返回所有权
fn no_dangle() -> String {
    let s = String::from("hello");
    s  // 返回所有权
}
```

### 2. 生命周期不匹配

```rust
fn main() {
    let r;
    
    {
        let x = 5;
        // r = &x;  // 编译错误！x 将离开作用域
    }
    
    // println!("{}", r);  // 编译错误！
    
    // 正确的方式
    let x = 5;
    let r = &x;
    println!("r: {}", r);
}
```

## 智能指针简介

虽然引用是最基本的借用方式，但 Rust 还提供了智能指针。

### 1. Box<T>

```rust
fn main() {
    let x = 5;
    let y = Box::new(x);  // 在堆上分配
    
    println!("x: {}, y: {}", x, *y);
    
    let s = Box::new(String::from("hello"));
    println!("s: {}", s);
}
```

### 2. Rc<T>（引用计数）

```rust
use std::rc::Rc;

fn main() {
    let s = Rc::new(String::from("hello"));
    let s1 = Rc::clone(&s);
    let s2 = Rc::clone(&s);
    
    println!("引用计数: {}", Rc::strong_count(&s));
    println!("s: {}, s1: {}, s2: {}", s, s1, s2);
}
```

## 实践练习

### 练习 1：引用传递

```rust
fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    println!("原始数组: {:?}", numbers);
    
    // 使用不可变引用
    let sum = calculate_sum(&numbers);
    println!("数组总和: {}", sum);
    
    // 使用可变引用
    double_values(&mut numbers);
    println!("翻倍后的数组: {:?}", numbers);
    
    // 再次使用不可变引用
    let max = find_max(&numbers);
    println!("最大值: {}", max);
}

fn calculate_sum(numbers: &Vec<i32>) -> i32 {
    let mut sum = 0;
    for num in numbers {
        sum += num;
    }
    sum
}

fn double_values(numbers: &mut Vec<i32>) {
    for num in numbers {
        *num *= 2;
    }
}

fn find_max(numbers: &Vec<i32>) -> i32 {
    let mut max = numbers[0];
    for &num in numbers {
        if num > max {
            max = num;
        }
    }
    max
}
```

### 练习 2：字符串处理

```rust
fn main() {
    let text = String::from("Hello, Rust Programming!");
    
    // 分析文本
    analyze_text(&text);
    
    // 修改文本
    let mut mutable_text = text.clone();
    modify_text(&mut mutable_text);
    
    println!("原始文本: {}", text);
    println!("修改后文本: {}", mutable_text);
}

fn analyze_text(text: &String) {
    println!("文本分析:");
    println!("  长度: {}", text.len());
    println!("  字符数: {}", text.chars().count());
    println!("  单词数: {}", text.split_whitespace().count());
    println!("  包含'Rust': {}", text.contains("Rust"));
}

fn modify_text(text: &mut String) {
    text.push_str(" - Modified");
    *text = text.to_uppercase();
}
```

### 练习 3：结构体引用

```rust
struct Person {
    name: String,
    age: i32,
    email: String,
}

impl Person {
    fn new(name: String, age: i32, email: String) -> Self {
        Person { name, age, email }
    }
    
    fn display(&self) {  // 不可变引用
        println!("姓名: {}, 年龄: {}, 邮箱: {}", self.name, self.age, self.email);
    }
    
    fn have_birthday(&mut self) {  // 可变引用
        self.age += 1;
        println!("{} 现在 {} 岁了！", self.name, self.age);
    }
    
    fn get_age(&self) -> i32 {
        self.age
    }
}

fn main() {
    let mut person = Person::new(
        String::from("Alice"),
        30,
        String::from("alice@example.com"),
    );
    
    person.display();
    
    // 不可变引用
    let age = person.get_age();
    println!("年龄: {}", age);
    
    // 可变引用
    person.have_birthday();
    person.display();
    
    // 外部函数使用引用
    update_email(&mut person, String::from("alice.new@example.com"));
    person.display();
}

fn update_email(person: &mut Person, new_email: String) {
    person.email = new_email;
}
```

### 练习 4：借用检查器挑战

```rust
fn main() {
    let mut data = vec![1, 2, 3, 4, 5];
    
    // 挑战：在保持借用规则的前提下完成以下操作
    
    // 1. 获取第一个元素的引用
    let first = &data[0];
    println!("第一个元素: {}", first);
    
    // 2. 在上面的引用有效期内，不能修改 data
    // data.push(6);  // 编译错误！
    
    // 3. 等第一个引用不再使用后，可以修改 data
    // first 在这里不再使用
    
    data.push(6);
    println!("添加元素后: {:?}", data);
    
    // 4. 同时获取多个不可变引用
    let slice1 = &data[0..3];
    let slice2 = &data[3..];
    
    println!("前半部分: {:?}", slice1);
    println!("后半部分: {:?}", slice2);
    
    // 5. 作用域结束后，可以获取可变引用
    let last = data.last_mut().unwrap();
    *last = 100;
    
    println!("最终数据: {:?}", data);
}
```

## 常见错误和解决方案

### 1. 同时存在可变和不可变引用

```rust
fn main() {
    let mut s = String::from("hello");
    
    // 错误示例
    // let r1 = &s;
    // let r2 = &mut s;  // 编译错误！
    // println!("{}, {}", r1, r2);
    
    // 正确方式 1：分开使用
    let r1 = &s;
    println!("{}", r1);
    // r1 不再使用
    
    let r2 = &mut s;
    r2.push_str(", world");
    println!("{}", r2);
    
    // 正确方式 2：使用作用域
    {
        let r3 = &s;
        println!("{}", r3);
    }
    
    let r4 = &mut s;
    r4.push_str("!");
    println!("{}", r4);
}
```

### 2. 引用的生命周期问题

```rust
fn main() {
    let mut s = String::from("hello");
    
    // 错误示例
    // let r;
    // {
    //     let temp = String::from("world");
    //     r = &temp;  // 编译错误！temp 将被销毁
    // }
    // println!("{}", r);
    
    // 正确方式
    let r = &s;
    println!("{}", r);
}
```

### 3. 在迭代时修改集合

```rust
fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    // 错误示例
    // for num in &numbers {
    //     if *num % 2 == 0 {
    //         numbers.push(*num * 2);  // 编译错误！
    //     }
    // }
    
    // 正确方式 1：收集要添加的元素
    let mut to_add = Vec::new();
    for num in &numbers {
        if *num % 2 == 0 {
            to_add.push(*num * 2);
        }
    }
    numbers.extend(to_add);
    
    println!("结果: {:?}", numbers);
    
    // 正确方式 2：使用索引
    let mut i = 0;
    while i < numbers.len() {
        if numbers[i] % 2 == 0 {
            numbers.push(numbers[i] * 2);
        }
        i += 1;
    }
    
    println!("最终结果: {:?}", numbers);
}
```

## 最佳实践

### 1. 优先使用引用而非所有权

```rust
// 推荐
fn process_string(s: &str) -> usize {
    s.len()
}

// 不推荐（除非真的需要所有权）
fn process_string_owned(s: String) -> usize {
    s.len()
}

fn main() {
    let s = String::from("hello");
    let len = process_string(&s);
    println!("字符串长度: {}", len);
    // s 仍然可以使用
}
```

### 2. 使用 &str 而非 &String

```rust
// 推荐：更灵活
fn print_string(s: &str) {
    println!("{}", s);
}

// 不推荐：限制性更强
fn print_string_ref(s: &String) {
    println!("{}", s);
}

fn main() {
    let s1 = String::from("hello");
    let s2 = "world";
    
    print_string(&s1);  // 可以
    print_string(s2);   // 可以
    
    print_string_ref(&s1);  // 可以
    // print_string_ref(s2);   // 编译错误！
}
```

### 3. 合理使用可变引用

```rust
fn main() {
    let mut data = vec![1, 2, 3];
    
    // 推荐：明确何时需要可变引用
    {
        let data_ref = &mut data;
        data_ref.push(4);
    }  // 可变引用在这里结束
    
    // 现在可以创建不可变引用
    let len = data.len();
    println!("数据长度: {}", len);
}
```

## 总结

引用和借用是 Rust 中非常重要的概念：

1. **引用**：不获取所有权的方式使用值
2. **借用规则**：要么多个不可变引用，要么一个可变引用
3. **生命周期**：引用必须在数据有效期内
4. **安全性**：编译器防止悬垂引用和数据竞争
5. **性能**：零成本抽象，无运行时开销

掌握引用和借用是理解 Rust 所有权系统的关键，也是编写高效 Rust 代码的基础。

## 下一步

完成本节学习后，请继续学习 [03-切片类型](03-slices.md)。