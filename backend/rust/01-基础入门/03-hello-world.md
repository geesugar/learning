# 第一个 Rust 程序

## 学习目标

- 创建第一个 Rust 程序
- 理解 Rust 程序的基本结构
- 学会编译和运行 Rust 程序
- 掌握 Cargo 项目管理工具的基本使用

## Hello World 程序

### 1. 创建文件方式

创建一个名为 `main.rs` 的文件：

```rust
fn main() {
    println!("Hello, world!");
}
```

编译并运行：
```bash
rustc main.rs
./main  # Linux/macOS
# 或
main.exe  # Windows
```

### 2. 使用 Cargo 方式（推荐）

创建新项目：
```bash
cargo new hello_world
cd hello_world
```

这会创建以下结构：
```
hello_world/
├── Cargo.toml
└── src/
    └── main.rs
```

运行程序：
```bash
cargo run
```

## 程序结构分析

### 1. main 函数
```rust
fn main() {
    // 程序入口点
}
```

- `fn` 关键字声明函数
- `main` 是程序的入口点
- `()` 表示没有参数
- `{}` 包含函数体

### 2. println! 宏
```rust
println!("Hello, world!");
```

- `println!` 是一个宏，不是函数（注意感叹号）
- 用于向控制台打印文本
- 支持格式化输出

### 3. 语句和表达式
```rust
fn main() {
    let x = 5;          // 语句
    let y = {           // 表达式
        let x = 3;
        x + 1           // 表达式，注意没有分号
    };
    println!("x = {}, y = {}", x, y);
}
```

**输出**: `x = 5, y = 4`

## 更多输出示例

### 1. 基本格式化
```rust
fn main() {
    let name = "Alice";
    let age = 30;
    
    println!("我的名字是 {}", name);
    println!("我今年 {} 岁", age);
    println!("我的名字是 {}，今年 {} 岁", name, age);
}
```

### 2. 位置参数
```rust
fn main() {
    println!("{0} 今年 {1} 岁，{0} 很聪明", "Alice", 30);
}
```

### 3. 命名参数
```rust
fn main() {
    println!("{name} 今年 {age} 岁", name = "Alice", age = 30);
}
```

### 4. 格式化选项
```rust
fn main() {
    let pi = 3.14159;
    println!("π 的值是 {:.2}", pi);        // 保留2位小数
    println!("π 的值是 {:8.2}", pi);       // 8位宽度，2位小数
    println!("π 的值是 {:08.2}", pi);      // 用0填充
    
    let num = 42;
    println!("二进制: {:b}", num);         // 二进制
    println!("八进制: {:o}", num);         // 八进制
    println!("十六进制: {:x}", num);       // 十六进制
}
```

**输出**:
```
π 的值是 3.14
π 的值是     3.14
π 的值是 00003.14
二进制: 101010
八进制: 52
十六进制: 2a
```

### 5. 调试输出
```rust
fn main() {
    let person = ("Alice", 30);
    println!("调试输出: {:?}", person);
    println!("美化调试输出: {:#?}", person);
}
```

## 注释

### 1. 行注释
```rust
fn main() {
    // 这是行注释
    println!("Hello, world!"); // 这也是行注释
}
```

### 2. 块注释
```rust
fn main() {
    /*
     * 这是块注释
     * 可以跨越多行
     */
    println!("Hello, world!");
}
```

### 3. 文档注释
```rust
/// 这是文档注释
/// 用于生成文档
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    greet("Alice");
}
```

## 编译过程详解

### 1. 编译阶段
```bash
rustc main.rs -o hello
```

编译过程：
1. **词法分析**：将源代码分解为 tokens
2. **语法分析**：构建抽象语法树（AST）
3. **语义分析**：类型检查、借用检查
4. **代码生成**：生成机器码

### 2. 编译选项
```bash
rustc main.rs --edition 2021        # 指定 Rust 版本
rustc main.rs -O                    # 优化编译
rustc main.rs -g                    # 包含调试信息
rustc main.rs --crate-type bin      # 指定 crate 类型
```

### 3. 查看编译信息
```bash
rustc --version                     # 查看编译器版本
rustc --help                        # 查看帮助信息
rustc main.rs --emit=asm            # 生成汇编代码
rustc main.rs --emit=llvm-ir        # 生成 LLVM IR
```

## Cargo 项目结构

### 1. Cargo.toml 文件
```toml
[package]
name = "hello_world"
version = "0.1.0"
edition = "2021"

# 项目元数据
authors = ["Your Name <your.email@example.com>"]
description = "A simple hello world program"
license = "MIT"
homepage = "https://github.com/yourusername/hello_world"
repository = "https://github.com/yourusername/hello_world"
keywords = ["cli", "hello"]
categories = ["command-line-utilities"]

# 依赖项
[dependencies]
# 这里添加外部依赖

# 开发依赖项
[dev-dependencies]
# 这里添加开发时需要的依赖

# 构建依赖项
[build-dependencies]
# 这里添加构建时需要的依赖
```

### 2. 项目结构
```
my_project/
├── Cargo.toml          # 项目配置文件
├── Cargo.lock          # 依赖版本锁定文件
├── src/                # 源代码目录
│   ├── main.rs         # 主程序入口
│   └── lib.rs          # 库入口（可选）
├── tests/              # 集成测试
├── examples/           # 示例代码
├── benches/            # 性能测试
└── target/             # 编译输出目录
```

### 3. 常用 Cargo 命令
```bash
cargo new project_name          # 创建新项目
cargo init                      # 在当前目录初始化项目
cargo build                     # 编译项目
cargo run                       # 编译并运行项目
cargo check                     # 检查代码（不生成可执行文件）
cargo test                      # 运行测试
cargo doc                       # 生成文档
cargo clean                     # 清理编译输出
cargo update                    # 更新依赖
```

## 环境变量

### 1. 常用环境变量
```bash
export RUST_LOG=debug              # 设置日志级别
export RUST_BACKTRACE=1            # 启用错误回溯
export RUST_BACKTRACE=full         # 完整错误回溯
export RUSTFLAGS="-C target-cpu=native" # 编译器标志
```

### 2. 在程序中使用环境变量
```rust
use std::env;

fn main() {
    // 获取环境变量
    match env::var("RUST_LOG") {
        Ok(val) => println!("RUST_LOG: {}", val),
        Err(_) => println!("RUST_LOG 未设置"),
    }
    
    // 获取命令行参数
    let args: Vec<String> = env::args().collect();
    println!("命令行参数: {:?}", args);
}
```

## 实践练习

### 练习 1：个人信息展示
编写一个程序，展示你的个人信息：

```rust
fn main() {
    let name = "你的名字";
    let age = 25;
    let hobby = "编程";
    let city = "北京";
    
    println!("=== 个人信息 ===");
    println!("姓名: {}", name);
    println!("年龄: {}", age);
    println!("爱好: {}", hobby);
    println!("城市: {}", city);
    println!("=================");
}
```

### 练习 2：简单计算器
创建一个简单的计算器：

```rust
fn main() {
    let a = 10;
    let b = 3;
    
    println!("a = {}, b = {}", a, b);
    println!("a + b = {}", a + b);
    println!("a - b = {}", a - b);
    println!("a * b = {}", a * b);
    println!("a / b = {}", a / b);
    println!("a % b = {}", a % b);
    
    let c = 3.14;
    let d = 2.0;
    println!("c = {}, d = {}", c, d);
    println!("c + d = {:.2}", c + d);
    println!("c * d = {:.2}", c * d);
}
```

### 练习 3：ASCII 艺术
创建一个 ASCII 艺术程序：

```rust
fn main() {
    println!("  /\\\\_/\\\\  ");
    println!(" ( o.o ) ");
    println!("  > ^ <  ");
    println!("");
    println!("Hello from Rust! 🦀");
    
    // 使用原始字符串避免转义
    let ascii_art = r#"
    ┌─────────────────────┐
    │  Welcome to Rust!   │
    │      🦀 🦀 🦀       │
    └─────────────────────┘
    "#;
    
    println!("{}", ascii_art);
}
```

### 练习 4：彩色输出
使用 ANSI 转义序列创建彩色输出：

```rust
fn main() {
    // ANSI 颜色代码
    println!("\\x1b[31m这是红色文本\\x1b[0m");
    println!("\\x1b[32m这是绿色文本\\x1b[0m");
    println!("\\x1b[34m这是蓝色文本\\x1b[0m");
    println!("\\x1b[33m这是黄色文本\\x1b[0m");
    
    // 背景色
    println!("\\x1b[41m红色背景\\x1b[0m");
    println!("\\x1b[42m绿色背景\\x1b[0m");
    
    // 样式
    println!("\\x1b[1m粗体文本\\x1b[0m");
    println!("\\x1b[4m下划线文本\\x1b[0m");
}
```

## 常见错误和解决方案

### 1. 编译错误
```rust
fn main() {
    println!("Hello, world!")  // 缺少分号
}
```

**错误信息**:
```
error: expected `;`, found `}`
```

**解决方案**: 在语句末尾添加分号。

### 2. 宏调用错误
```rust
fn main() {
    println("Hello, world!");  // 缺少感叹号
}
```

**错误信息**:
```
error: cannot find function `println` in this scope
```

**解决方案**: 使用 `println!` 宏而不是函数。

### 3. 字符串格式化错误
```rust
fn main() {
    let name = "Alice";
    println!("Hello, {}");  // 缺少参数
}
```

**错误信息**:
```
error: 1 positional argument in format string, but no arguments were given
```

**解决方案**: 提供相应的参数。

## 调试技巧

### 1. 使用 println! 调试
```rust
fn main() {
    let x = 5;
    println!("Debug: x = {}", x);
    
    let y = x * 2;
    println!("Debug: y = {}", y);
}
```

### 2. 使用 dbg! 宏
```rust
fn main() {
    let x = 5;
    let y = dbg!(x * 2);  // 打印表达式和结果
    println!("y = {}", y);
}
```

### 3. 条件编译调试
```rust
fn main() {
    let x = 5;
    
    #[cfg(debug_assertions)]
    println!("Debug mode: x = {}", x);
    
    println!("x = {}", x);
}
```

## 总结

通过本节学习，你应该掌握：

1. **基本程序结构**：`main` 函数、语句和表达式
2. **输出方法**：`println!` 宏的各种用法
3. **编译过程**：rustc 编译器的使用
4. **项目管理**：Cargo 的基本使用
5. **调试技巧**：基本的调试方法

这些是 Rust 编程的基础，为后续学习打下坚实基础。

## 下一步

完成本节学习后，请继续学习 [04-Cargo 包管理](04-cargo-basics.md)。