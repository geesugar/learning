# Rust 学习资料

## 概述

Rust 是一门系统编程语言，专注于安全性、速度和并发性。本学习资料将帮助你从零开始掌握 Rust 编程语言，覆盖从基础语法到高级应用的全部内容。

## 为什么选择 Rust？

- **内存安全**：无需垃圾回收器的内存安全
- **零成本抽象**：高级特性不牺牲运行时性能
- **并发安全**：编译时防止数据竞争
- **跨平台**：支持多种操作系统和架构
- **生态丰富**：活跃的社区和丰富的包管理系统

## 学习路径

### 阶段一：基础入门 (1-2周)
- [01-基础入门](01-基础入门/README.md) - 环境搭建、Hello World、基本概念
- [02-核心语法](02-核心语法/README.md) - 变量、数据类型、函数、控制流

### 阶段二：核心概念 (2-3周)
- [03-所有权系统](03-所有权系统/README.md) - Rust 最重要的概念
- [04-错误处理](04-错误处理/README.md) - Result、Option、错误传播
- [05-泛型与trait](05-泛型与trait/README.md) - 类型系统的核心

### 阶段三：高级特性 (2-3周)
- [06-集合与迭代器](06-集合与迭代器/README.md) - 标准库集合类型
- [07-模块系统](07-模块系统/README.md) - 代码组织和可见性
- [08-并发编程](08-并发编程/README.md) - 线程、消息传递、共享状态

### 阶段四：深入应用 (3-4周)
- [09-智能指针](09-智能指针/README.md) - Box、Rc、RefCell 等
- [10-测试与文档](10-测试与文档/README.md) - 单元测试、集成测试、文档编写
- [11-项目管理](11-项目管理/README.md) - Cargo、包管理、工作空间

### 阶段五：实战开发 (4-6周)
- [12-Web开发](12-Web开发/README.md) - 使用 Actix-web、Rocket 等框架
- [13-数据库操作](13-数据库操作/README.md) - Diesel、SQLx 等 ORM
- [14-异步编程](14-异步编程/README.md) - async/await、Tokio 运行时

### 阶段六：高级主题 (进阶学习)
- [15-unsafe](15-unsafe/README.md) - 不安全代码和 FFI
- [16-宏编程](16-宏编程/README.md) - 声明式宏和过程宏
- [17-性能优化](17-性能优化/README.md) - 性能分析和优化技巧
- [18-生态系统](18-生态系统/README.md) - 重要的第三方库和工具

## 实践项目

查看 [examples](examples/README.md) 目录了解各种实践项目：

- **基础项目**：猜数字游戏、计算器、文件处理器
- **中级项目**：CLI 工具、简单 Web 服务器、数据处理工具
- **高级项目**：完整的 Web 应用、分布式系统组件

## 快速开始

如果你想快速开始学习 Rust，请查看 [quick-start.md](quick-start.md)。

## 学习建议

1. **循序渐进**：按照章节顺序学习，特别是前 8 章
2. **动手实践**：每个概念都要写代码验证
3. **阅读标准库**：熟悉 Rust 标准库的设计
4. **参与社区**：加入 Rust 中文社区，参与讨论
5. **读优秀代码**：学习知名 Rust 项目的源码

## 环境要求

- Rust 1.70+ (推荐使用最新稳定版)
- IDE：VSCode + rust-analyzer 或 IntelliJ IDEA + Rust 插件
- 操作系统：Windows、macOS、Linux 均可

## 学习资源

### 官方资源
- [Rust 官方文档](https://doc.rust-lang.org/)
- [The Rust Programming Language](https://doc.rust-lang.org/book/)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/)

### 中文资源
- [Rust 程序设计语言](https://kaisery.github.io/trpl-zh-cn/)
- [Rust 语言圣经](https://course.rs/)
- [Rust 中文论坛](https://learnku.com/rust)

### 进阶资源
- [The Rustonomicon](https://doc.rust-lang.org/nomicon/) - Unsafe Rust
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这份学习资料。

## 许可证

本项目采用 MIT 许可证。