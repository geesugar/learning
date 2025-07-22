# 猜数字游戏

## 项目概述

这是一个经典的猜数字游戏，程序随机生成一个 1 到 100 之间的数字，玩家需要猜测这个数字。程序会提示玩家猜测的数字是太大还是太小，直到猜中为止。

## 学习目标

- 掌握 Rust 基本语法
- 理解变量和可变性
- 学会处理用户输入
- 使用 match 表达式
- 理解错误处理基础
- 学会使用外部 crate

## 知识点

### 1. 基本语法
- `let` 和 `mut` 关键字
- 函数定义和调用
- 宏的使用（`println!`）

### 2. 标准库
- `std::io` 模块
- `String` 类型
- `Result` 类型

### 3. 外部依赖
- `rand` crate 的使用
- `Cargo.toml` 配置

### 4. 控制流
- `loop` 循环
- `match` 表达式
- `continue` 和 `break`

## 项目结构

```
01-guessing-game/
├── Cargo.toml
├── src/
│   └── main.rs
├── README.md
└── tests/
    └── integration_test.rs
```

## 核心代码

### Cargo.toml
```toml
[package]
name = "guessing-game"
version = "0.1.0"
edition = "2021"

[dependencies]
rand = "0.8"
```

### main.rs
```rust
use std::cmp::Ordering;
use std::io;
use rand::Rng;

fn main() {
    println!("猜数字游戏！");
    println!("请输入一个 1 到 100 之间的数字");

    let secret_number = rand::thread_rng().gen_range(1..=100);
    let mut attempts = 0;

    loop {
        println!("请输入你的猜测:");

        let mut guess = String::new();
        io::stdin()
            .read_line(&mut guess)
            .expect("读取输入失败");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("请输入一个有效的数字！");
                continue;
            }
        };

        attempts += 1;

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("太小了！"),
            Ordering::Greater => println!("太大了！"),
            Ordering::Equal => {
                println!("恭喜你！你猜对了！用了 {} 次尝试", attempts);
                break;
            }
        }
    }
}
```

## 详细Rust语法解析

### 1. 模块导入和使用

#### 标准库导入
```rust
use std::cmp::Ordering;  // 导入比较结果枚举
use std::io;             // 导入输入输出模块
```

#### 外部crate导入
```rust
use rand::Rng;           // 导入随机数生成trait
```

**语法要点：**
- `use` 关键字将模块或类型引入当前作用域
- `std::` 前缀表示标准库模块
- `cmp::Ordering` 是用于比较结果的枚举类型
- `rand::Rng` 是trait，提供随机数生成方法

### 2. 变量声明和可变性

#### 不可变变量
```rust
let secret_number = rand::thread_rng().gen_range(1..=100);
println!("秘密数字是: {}", secret_number); // 编译错误：在实际游戏中不应该打印
```

#### 可变变量
```rust
let mut attempts = 0;    // 声明可变变量
attempts += 1;           // 可以修改
```

**语法要点：**
- Rust变量默认不可变（immutable）
- `mut` 关键字使变量可变
- 不可变性是Rust安全性的核心特性

### 3. 随机数生成和范围

#### 随机数API使用
```rust
let secret_number = rand::thread_rng().gen_range(1..=100);
```

**语法要点：**
- `thread_rng()` 获取线程本地随机数生成器
- `gen_range()` 需要`Rng` trait在作用域中
- `1..=100` 是包含范围语法（inclusive range）
- `1..100` 是排他范围语法（exclusive range）

### 4. 字符串类型和所有权

#### String类型操作
```rust
let mut guess = String::new();           // 创建空String
io::stdin()
    .read_line(&mut guess)               // 可变借用
    .expect("读取输入失败");

let guess = guess.trim();                // 变量遮蔽，创建&str
```

**语法要点：**
- `String::new()` 创建拥有所有权的空字符串
- `&mut guess` 创建可变引用，允许函数修改字符串
- `trim()` 方法返回字符串切片`&str`
- 变量遮蔽（shadowing）：用同名变量绑定新值

### 5. 错误处理基础

#### expect方法
```rust
io::stdin()
    .read_line(&mut guess)
    .expect("读取输入失败");             // 错误时panic
```

#### Result类型和match
```rust
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,                      // 成功时提取值
    Err(_) => {                         // 错误时执行
        println!("请输入一个有效的数字！");
        continue;                        // 跳过本次循环
    }
};
```

**语法要点：**
- `expect()` 在错误时panic并显示消息
- `Result<T, E>` 是枚举，有`Ok(T)`和`Err(E)`两个变体
- `match` 必须处理所有可能的情况
- `_` 通配符忽略错误的具体内容

### 6. 类型转换和推断

#### 显式类型注解
```rust
let guess: u32 = match guess.trim().parse() {
    //    ^^^^ 显式类型注解
    Ok(num) => num,
    Err(_) => {
        continue;
    }
};
```

#### 类型推断
```rust
let secret_number = rand::thread_rng().gen_range(1..=100);
//                                                ^^^^^^^ 
// Rust推断这是u32类型，因为后面与guess（u32）比较
```

**语法要点：**
- `parse()` 方法需要知道目标类型
- 类型注解格式：`variable: type`
- Rust有强大的类型推断能力
- 编译时确定所有类型

### 7. 循环控制结构

#### loop无限循环
```rust
loop {                              // 无条件循环
    // 处理用户输入
    
    match guess.cmp(&secret_number) {
        Ordering::Equal => {
            println!("恭喜你！");
            break;                  // 退出循环
        }
        _ => continue,              // 继续下一次迭代
    }
}
```

**语法要点：**
- `loop` 创建无限循环，比`while true`更惯用
- `break` 立即退出当前循环
- `continue` 跳过当前迭代，开始下一次

### 8. 模式匹配和枚举

#### Ordering枚举匹配
```rust
match guess.cmp(&secret_number) {
    Ordering::Less => println!("太小了！"),
    Ordering::Greater => println!("太大了！"),
    Ordering::Equal => {
        println!("恭喜你！你猜对了！用了 {} 次尝试", attempts);
        break;
    }
}
```

**语法要点：**
- `cmp()` 方法返回`std::cmp::Ordering`枚举
- `Ordering` 有三个变体：`Less`、`Greater`、`Equal`
- `match` 表达式必须穷尽所有可能性
- 可以在匹配臂中执行多个语句

### 9. 借用和引用

#### 不可变借用
```rust
match guess.cmp(&secret_number) {
    //            ^^^^^^^^^^^^^^ 创建不可变引用
    // ...
}
```

**语法要点：**
- `&` 操作符创建引用（借用）
- `cmp()` 方法需要引用作为参数
- 借用不转移所有权
- 可以同时有多个不可变借用

### 10. 方法调用链

#### 链式方法调用
```rust
io::stdin()
    .read_line(&mut guess)
    .expect("读取输入失败");
```

**语法要点：**
- 方法可以链式调用
- 每个方法返回适当的类型供下一个方法使用
- `read_line()` 返回`Result`
- `expect()` 消费`Result`并返回内容或panic

### 11. 宏的使用

#### println!宏
```rust
println!("猜数字游戏！");
println!("你猜测的数字是: {}", guess);
println!("恭喜你！用了 {} 次尝试", attempts);
```

**语法要点：**
- `!` 表示这是宏，不是函数
- `{}` 是格式化占位符
- 可以有多个占位符对应多个参数
- 宏在编译时展开

### 12. 范围语法详解

#### 包含和排他范围
```rust
let range1 = 1..100;     // 1到99（排他）
let range2 = 1..=100;    // 1到100（包含）

// 在match中使用
match diff {
    1..=5 => println!("非常接近！"),   // 包含1和5
    6..10 => println!("比较接近"),     // 包含6，不包含10
    _ => println!("还很远"),
}
```

**语法要点：**
- `..` 创建排他范围（不包含结束值）
- `..=` 创建包含范围（包含结束值）
- 范围可以用在模式匹配中
- 范围是惰性的，只在需要时生成值

### 13. 整数类型和运算

#### 无符号整数
```rust
let mut attempts = 0u32;    // 明确指定u32类型
attempts += 1;              // 算术运算

// 或者使用类型推断
let mut attempts: u32 = 0;
```

**语法要点：**
- `u32` 是32位无符号整数
- 后缀`u32`可以直接指定字面量类型
- `+=` 是复合赋值运算符
- Rust防止整数溢出（debug模式会panic）

### 14. 作用域和生命周期

#### 变量作用域
```rust
{
    let temp_var = "临时变量";
    println!("{}", temp_var);
}  // temp_var在这里被drop

loop {
    let mut guess = String::new();    // 每次循环都创建新的guess
    // ...
}  // guess在循环结束时被drop
```

**语法要点：**
- 变量在其作用域结束时被自动清理
- `{}` 花括号定义作用域
- 每次循环迭代都是独立的作用域

### 关键语法概念总结

#### 1. 所有权系统基础
- 每个值都有一个所有者
- 值可以被移动或借用
- 借用分为可变和不可变借用

#### 2. 模式匹配威力
- `match` 表达式确保处理所有情况
- 可以匹配字面量、范围、枚举变体
- 守卫条件可以添加额外逻辑

#### 3. 错误处理哲学
- 使用`Result`类型显式处理错误
- `panic!` 用于不可恢复的错误
- `expect()` 和 `unwrap()` 用于原型开发

#### 4. 类型系统强度
- 编译时类型检查
- 类型推断减少冗余注解
- 零成本抽象

这些基础语法构成了Rust编程的核心，为学习更高级的概念（如生命周期、trait、泛型等）奠定坚实基础。

## 运行项目

### 1. 创建项目
```bash
cargo new guessing-game
cd guessing-game
```

### 2. 添加依赖
在 `Cargo.toml` 中添加 `rand` 依赖。

### 3. 编译运行
```bash
cargo run
```

### 4. 运行测试
```bash
cargo test
```

## 扩展功能

### 1. 难度选择
添加不同难度级别：
```rust
fn choose_difficulty() -> (u32, u32) {
    println!("选择难度：");
    println!("1. 简单 (1-10)");
    println!("2. 中等 (1-50)");
    println!("3. 困难 (1-100)");
    
    // 实现用户选择逻辑
    match difficulty {
        1 => (1, 10),
        2 => (1, 50),
        3 => (1, 100),
        _ => (1, 100),
    }
}
```

### 2. 游戏统计
记录游戏统计信息：
```rust
struct GameStats {
    games_played: u32,
    total_attempts: u32,
    best_score: u32,
}

impl GameStats {
    fn new() -> Self {
        GameStats {
            games_played: 0,
            total_attempts: 0,
            best_score: u32::MAX,
        }
    }
    
    fn update(&mut self, attempts: u32) {
        self.games_played += 1;
        self.total_attempts += attempts;
        if attempts < self.best_score {
            self.best_score = attempts;
        }
    }
    
    fn display(&self) {
        println!("游戏统计：");
        println!("游戏次数: {}", self.games_played);
        println!("平均尝试次数: {:.1}", 
                 self.total_attempts as f64 / self.games_played as f64);
        println!("最佳成绩: {}", self.best_score);
    }
}
```

### 3. 输入验证
增强输入验证：
```rust
fn get_valid_input(min: u32, max: u32) -> u32 {
    loop {
        println!("请输入 {} 到 {} 之间的数字:", min, max);
        
        let mut input = String::new();
        io::stdin().read_line(&mut input)
            .expect("读取输入失败");
        
        match input.trim().parse::<u32>() {
            Ok(num) if num >= min && num <= max => return num,
            Ok(_) => println!("数字超出范围，请重新输入！"),
            Err(_) => println!("请输入有效的数字！"),
        }
    }
}
```

### 4. 游戏提示
添加智能提示功能：
```rust
fn give_hint(guess: u32, secret: u32, attempts: u32) {
    let diff = if guess > secret { 
        guess - secret 
    } else { 
        secret - guess 
    };
    
    match diff {
        1..=5 => println!("非常接近了！"),
        6..=10 => println!("很接近了！"),
        11..=20 => println!("比较接近"),
        _ => println!("还差得远呢"),
    }
    
    if attempts > 5 {
        println!("提示：数字的个位数是 {}", secret % 10);
    }
}
```

## 常见问题

### 1. 编译错误
```
error: cannot find crate `rand`
```
**解决方案**: 确保 `Cargo.toml` 中添加了 `rand` 依赖。

### 2. 类型错误
```
error: mismatched types
```
**解决方案**: 确保类型匹配，使用 `parse()` 将字符串转换为数字。

### 3. 借用检查错误
```
error: borrow of moved value
```
**解决方案**: 理解所有权规则，使用引用或克隆。

## 测试

### 单元测试示例
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_number_comparison() {
        assert_eq!(compare_numbers(5, 10), Ordering::Less);
        assert_eq!(compare_numbers(10, 5), Ordering::Greater);
        assert_eq!(compare_numbers(5, 5), Ordering::Equal);
    }
}
```

## 总结

这个项目涵盖了 Rust 的基础概念：

1. **变量和可变性**: `let` 和 `mut`
2. **函数**: 函数定义和调用
3. **控制流**: `loop`、`match`、`continue`、`break`
4. **错误处理**: `Result` 类型和 `expect` 方法
5. **外部依赖**: 使用 `rand` crate
6. **标准库**: `std::io`、`std::cmp`

完成这个项目后，你将对 Rust 的基本语法有深入的理解，为学习更复杂的概念打下坚实基础。

## 下一步

完成这个项目后，建议学习：
- [02-命令行计算器](../02-cli-calculator/) - 学习更复杂的字符串处理
- [03-文件操作工具](../03-file-utils/) - 学习文件 I/O 操作