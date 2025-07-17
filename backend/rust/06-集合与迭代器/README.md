# 06-集合与迭代器

## 本章概述

集合类型是编程中的重要工具，Rust 标准库提供了多种高效的集合类型。迭代器则提供了一种函数式编程的方式来处理数据序列。本章将详细介绍 Rust 中的集合类型和迭代器的使用。

## 学习目标

- 掌握 Vec<T> 向量的使用
- 理解 HashMap<K, V> 和 HashSet<T> 的应用
- 学会使用迭代器处理数据
- 掌握迭代器适配器和消费器
- 理解迭代器的性能特点
- 学会实现自定义迭代器

## 章节内容

### [01-Vec 向量](01-vectors.md)
- Vec<T> 的创建和基本操作
- 向量的内存管理
- 向量的方法和性能特点
- 向量的所有权和借用

### [02-HashMap 和 HashSet](02-hash-collections.md)
- HashMap<K, V> 的使用
- HashSet<T> 的应用
- 哈希函数和性能考虑
- 自定义键类型

### [03-其他集合类型](03-other-collections.md)
- VecDeque 双端队列
- BTreeMap 和 BTreeSet
- BinaryHeap 二叉堆
- LinkedList 链表

### [04-迭代器基础](04-iterator-basics.md)
- 迭代器的概念和创建
- for 循环和迭代器
- 迭代器的惰性求值
- 三种迭代器方法

### [05-迭代器适配器](05-iterator-adaptors.md)
- map、filter、enumerate 等适配器
- 链式调用和组合
- 自定义适配器
- 性能优化

### [06-迭代器消费器](06-iterator-consumers.md)
- collect、reduce、fold 等消费器
- find、any、all 等查找方法
- 并行迭代器简介
- 性能比较

## 总结

集合和迭代器是 Rust 编程的重要工具：

1. **多样化的集合类型**：Vec、HashMap、HashSet 等满足不同需求
2. **高性能迭代器**：零成本抽象，编译时优化
3. **函数式编程风格**：链式调用，代码简洁
4. **内存安全**：所有权系统保证内存安全
5. **性能优化**：合理选择集合类型和迭代器方法

掌握这些概念对于编写高效的 Rust 程序至关重要。

## 下一步

完成本章学习后，请继续学习 [07-模块系统](../07-模块系统/README.md)。