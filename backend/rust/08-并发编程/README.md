# 08-并发编程

## 本章概述

Rust 的并发编程是其最强大的特性之一。通过所有权系统和类型系统，Rust 能够在编译时防止数据竞争，实现"无畏并发"。本章将详细介绍 Rust 的并发编程模型。

## 学习目标

- 理解 Rust 的并发安全保证
- 掌握线程的创建和管理
- 学会使用消息传递进行线程通信
- 理解共享状态并发模式
- 掌握同步原语的使用
- 了解异步编程基础

## 章节内容

### [01-线程基础](01-threads-basics.md)
- 线程的创建和管理
- 线程间的数据共享
- 线程的生命周期
- 线程恐慌处理

### [02-消息传递](02-message-passing.md)
- 通道（channels）的使用
- 发送者和接收者
- 多生产者单消费者模式
- 异步通道

### [03-共享状态](03-shared-state.md)
- 互斥锁（Mutex）
- 原子类型（Atomic）
- 读写锁（RwLock）
- 条件变量（Condvar）

### [04-并发模式](04-concurrency-patterns.md)
- 工作窃取
- 生产者消费者模式
- 线程池
- 并行计算

### [05-异步编程入门](05-async-basics.md)
- async/await 语法
- Future trait
- 异步运行时
- 异步 I/O

## 总结

Rust 的并发编程通过所有权系统和类型系统提供了强大的安全保证。关键要点：

1. **无畏并发**：编译时防止数据竞争
2. **消息传递**："不要通过共享内存来通信，而应该通过通信来共享内存"
3. **共享状态**：使用 Arc 和 Mutex 等同步原语
4. **Send 和 Sync**：类型系统保证线程安全
5. **异步编程**：使用 async/await 处理 I/O 密集型任务

掌握这些概念需要大量实践，建议从简单的多线程程序开始，逐步学习更复杂的并发模式。

## 下一步

完成本章学习后，请继续学习 [09-智能指针](../09-智能指针/README.md)。