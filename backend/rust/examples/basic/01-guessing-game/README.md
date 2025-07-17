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

## 代码解析

### 1. 导入模块
```rust
use std::cmp::Ordering;  // 用于比较
use std::io;             // 用于输入输出
use rand::Rng;           // 用于生成随机数
```

### 2. 生成随机数
```rust
let secret_number = rand::thread_rng().gen_range(1..=100);
```
- `thread_rng()`: 获取线程本地的随机数生成器
- `gen_range(1..=100)`: 生成 1 到 100 之间的随机数（包含 100）

### 3. 读取用户输入
```rust
let mut guess = String::new();
io::stdin()
    .read_line(&mut guess)
    .expect("读取输入失败");
```
- `String::new()`: 创建一个空字符串
- `read_line(&mut guess)`: 读取一行输入到 guess 中
- `.expect()`: 处理可能的错误

### 4. 字符串解析
```rust
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => {
        println!("请输入一个有效的数字！");
        continue;
    }
};
```
- `trim()`: 去除字符串首尾空白
- `parse()`: 尝试将字符串解析为数字
- `match` 表达式处理解析结果

### 5. 比较和匹配
```rust
match guess.cmp(&secret_number) {
    Ordering::Less => println!("太小了！"),
    Ordering::Greater => println!("太大了！"),
    Ordering::Equal => {
        println!("恭喜你！你猜对了！");
        break;
    }
}
```

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