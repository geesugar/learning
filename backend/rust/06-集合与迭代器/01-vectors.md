# 01-Vec 向量

## Vec<T> 概述

Vec<T> 是 Rust 中最常用的集合类型，是一个可变大小的数组，存储在堆上。它提供了动态数组的功能，支持在运行时增长和缩小。

## 创建向量

### 基本创建方法

```rust
fn main() {
    // 创建空向量
    let mut v1: Vec<i32> = Vec::new();
    
    // 使用 vec! 宏创建
    let v2 = vec![1, 2, 3, 4, 5];
    
    // 预分配容量
    let mut v3 = Vec::with_capacity(10);
    
    // 创建重复元素的向量
    let v4 = vec![0; 5]; // [0, 0, 0, 0, 0]
    
    println!("v1: {:?}", v1);
    println!("v2: {:?}", v2);
    println!("v3 容量: {}", v3.capacity());
    println!("v4: {:?}", v4);
}
```

### 从其他数据结构创建

```rust
fn main() {
    // 从数组创建
    let arr = [1, 2, 3, 4, 5];
    let v1 = Vec::from(arr);
    
    // 从切片创建
    let slice = &arr[1..4];
    let v2 = slice.to_vec();
    
    // 从迭代器创建
    let v3: Vec<i32> = (0..5).collect();
    
    // 从字符串创建字符向量
    let s = "hello";
    let v4: Vec<char> = s.chars().collect();
    
    println!("从数组: {:?}", v1);
    println!("从切片: {:?}", v2);
    println!("从迭代器: {:?}", v3);
    println!("从字符串: {:?}", v4);
}
```

## 基本操作

### 添加元素

```rust
fn main() {
    let mut v = Vec::new();
    
    // 在末尾添加元素
    v.push(1);
    v.push(2);
    v.push(3);
    
    println!("添加后: {:?}", v);
    
    // 在指定位置插入
    v.insert(1, 10);
    println!("插入后: {:?}", v);
    
    // 扩展向量
    v.extend([4, 5, 6]);
    println!("扩展后: {:?}", v);
    
    // 追加另一个向量
    let mut other = vec![7, 8, 9];
    v.append(&mut other);
    println!("追加后: {:?}", v);
    println!("other 被清空: {:?}", other);
}
```

### 删除元素

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    
    // 删除最后一个元素
    if let Some(last) = v.pop() {
        println!("删除的元素: {}", last);
    }
    
    // 删除指定位置的元素
    let removed = v.remove(1);
    println!("删除的元素: {}", removed);
    
    // 删除并替换为最后一个元素（更高效）
    let swapped = v.swap_remove(0);
    println!("交换删除的元素: {}", swapped);
    
    println!("最终向量: {:?}", v);
    
    // 清空向量
    v.clear();
    println!("清空后: {:?}", v);
}
```

### 访问元素

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    
    // 索引访问（可能 panic）
    let first = v[0];
    println!("第一个元素: {}", first);
    
    // 安全访问
    match v.get(2) {
        Some(third) => println!("第三个元素: {}", third),
        None => println!("没有第三个元素"),
    }
    
    // 获取第一个和最后一个元素
    if let Some(first) = v.first() {
        println!("第一个: {}", first);
    }
    
    if let Some(last) = v.last() {
        println!("最后一个: {}", last);
    }
    
    // 获取切片
    let slice = &v[1..4];
    println!("切片: {:?}", slice);
}
```

## 遍历向量

### 不同的遍历方式

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    
    // 不可变遍历
    println!("不可变遍历:");
    for item in &v {
        println!("  {}", item);
    }
    
    // 可变遍历
    let mut v_mut = vec![1, 2, 3, 4, 5];
    println!("可变遍历:");
    for item in &mut v_mut {
        *item *= 2;
        println!("  {}", item);
    }
    
    // 获取所有权的遍历
    println!("所有权遍历:");
    for item in v_mut {
        println!("  {}", item);
    }
    // v_mut 在这里不再可用
    
    // 带索引的遍历
    println!("带索引遍历:");
    for (index, item) in v.iter().enumerate() {
        println!("  [{}] = {}", index, item);
    }
}
```

### 使用迭代器方法

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    
    // 使用 iter()
    let sum: i32 = v.iter().sum();
    println!("总和: {}", sum);
    
    // 使用 into_iter()
    let v_clone = v.clone();
    let doubled: Vec<i32> = v_clone.into_iter().map(|x| x * 2).collect();
    println!("翻倍: {:?}", doubled);
    
    // 使用 iter_mut()
    let mut v_mut = vec![1, 2, 3, 4, 5];
    v_mut.iter_mut().for_each(|x| *x *= 3);
    println!("乘以3: {:?}", v_mut);
}
```

## 向量的容量管理

### 容量 vs 长度

```rust
fn main() {
    let mut v = Vec::with_capacity(5);
    println!("初始 - 长度: {}, 容量: {}", v.len(), v.capacity());
    
    // 添加元素
    for i in 0..3 {
        v.push(i);
        println!("添加 {} - 长度: {}, 容量: {}", i, v.len(), v.capacity());
    }
    
    // 继续添加直到超过容量
    for i in 3..8 {
        v.push(i);
        println!("添加 {} - 长度: {}, 容量: {}", i, v.len(), v.capacity());
    }
    
    // 手动调整容量
    v.reserve(10);
    println!("reserve(10) - 长度: {}, 容量: {}", v.len(), v.capacity());
    
    // 收缩容量
    v.shrink_to_fit();
    println!("shrink_to_fit - 长度: {}, 容量: {}", v.len(), v.capacity());
}
```

### 性能优化技巧

```rust
fn main() {
    // 预分配容量以避免重新分配
    let mut v = Vec::with_capacity(1000);
    for i in 0..1000 {
        v.push(i);
    }
    
    // 使用 Vec::from 而不是多次 push
    let v1 = Vec::from([1, 2, 3, 4, 5]);
    
    // 使用 collect 从迭代器创建
    let v2: Vec<i32> = (0..5).collect();
    
    // 使用 extend 而不是多次 push
    let mut v3 = vec![1, 2, 3];
    v3.extend([4, 5, 6]);
    
    println!("v1: {:?}", v1);
    println!("v2: {:?}", v2);
    println!("v3: {:?}", v3);
}
```

## 向量的方法

### 查找和过滤

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 查找元素
    if let Some(pos) = v.iter().position(|&x| x == 5) {
        println!("5 在位置 {}", pos);
    }
    
    // 检查是否包含元素
    if v.contains(&7) {
        println!("向量包含 7");
    }
    
    // 查找满足条件的元素
    if let Some(first_even) = v.iter().find(|&&x| x % 2 == 0) {
        println!("第一个偶数: {}", first_even);
    }
    
    // 过滤元素
    let evens: Vec<i32> = v.iter().filter(|&&x| x % 2 == 0).cloned().collect();
    println!("偶数: {:?}", evens);
    
    // 分区
    let (evens, odds): (Vec<i32>, Vec<i32>) = v.iter().partition(|&&x| x % 2 == 0);
    println!("偶数: {:?}", evens);
    println!("奇数: {:?}", odds);
}
```

### 排序和重排

```rust
fn main() {
    let mut v = vec![3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    
    // 排序
    v.sort();
    println!("排序后: {:?}", v);
    
    // 去重（需要先排序）
    v.dedup();
    println!("去重后: {:?}", v);
    
    // 反转
    v.reverse();
    println!("反转后: {:?}", v);
    
    // 自定义排序
    let mut words = vec!["apple", "banana", "cherry", "date"];
    words.sort_by(|a, b| a.len().cmp(&b.len()));
    println!("按长度排序: {:?}", words);
    
    // 排序键
    let mut numbers = vec![3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    numbers.sort_by_key(|x| x.abs());
    println!("按绝对值排序: {:?}", numbers);
}
```

### 切片操作

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 获取切片
    let slice = &v[2..6];
    println!("切片 [2..6]: {:?}", slice);
    
    // 分割
    let (left, right) = v.split_at(5);
    println!("左半部分: {:?}", left);
    println!("右半部分: {:?}", right);
    
    // 分割成块
    let chunks: Vec<&[i32]> = v.chunks(3).collect();
    println!("分块:");
    for (i, chunk) in chunks.iter().enumerate() {
        println!("  块 {}: {:?}", i, chunk);
    }
    
    // 窗口
    let windows: Vec<&[i32]> = v.windows(3).collect();
    println!("窗口:");
    for (i, window) in windows.iter().enumerate() {
        println!("  窗口 {}: {:?}", i, window);
    }
}
```

## 实际应用示例

### 动态数组操作

```rust
fn main() {
    // 模拟一个简单的栈
    let mut stack = Vec::new();
    
    // 入栈
    stack.push(1);
    stack.push(2);
    stack.push(3);
    println!("栈: {:?}", stack);
    
    // 出栈
    while let Some(top) = stack.pop() {
        println!("出栈: {}", top);
    }
    
    // 模拟队列（效率不高，仅作示例）
    let mut queue = Vec::new();
    
    // 入队
    queue.push(1);
    queue.push(2);
    queue.push(3);
    println!("队列: {:?}", queue);
    
    // 出队
    while !queue.is_empty() {
        let front = queue.remove(0);
        println!("出队: {}", front);
    }
}
```

### 矩阵操作

```rust
fn main() {
    // 创建二维向量（矩阵）
    let mut matrix = vec![vec![0; 3]; 3];
    
    // 填充矩阵
    for i in 0..3 {
        for j in 0..3 {
            matrix[i][j] = i * 3 + j;
        }
    }
    
    // 打印矩阵
    println!("矩阵:");
    for row in &matrix {
        println!("{:?}", row);
    }
    
    // 转置矩阵
    let mut transposed = vec![vec![0; 3]; 3];
    for i in 0..3 {
        for j in 0..3 {
            transposed[j][i] = matrix[i][j];
        }
    }
    
    println!("转置矩阵:");
    for row in &transposed {
        println!("{:?}", row);
    }
}
```

### 缓冲区管理

```rust
struct Buffer {
    data: Vec<u8>,
    capacity: usize,
}

impl Buffer {
    fn new(capacity: usize) -> Self {
        Buffer {
            data: Vec::with_capacity(capacity),
            capacity,
        }
    }
    
    fn write(&mut self, byte: u8) -> Result<(), &'static str> {
        if self.data.len() >= self.capacity {
            return Err("Buffer overflow");
        }
        self.data.push(byte);
        Ok(())
    }
    
    fn read(&mut self) -> Option<u8> {
        if self.data.is_empty() {
            None
        } else {
            Some(self.data.remove(0))
        }
    }
    
    fn is_full(&self) -> bool {
        self.data.len() >= self.capacity
    }
    
    fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
    
    fn len(&self) -> usize {
        self.data.len()
    }
}

fn main() {
    let mut buffer = Buffer::new(5);
    
    // 写入数据
    for i in 0..5 {
        match buffer.write(i * 10) {
            Ok(_) => println!("写入成功: {}", i * 10),
            Err(e) => println!("写入失败: {}", e),
        }
    }
    
    // 尝试写入更多数据
    match buffer.write(50) {
        Ok(_) => println!("写入成功: 50"),
        Err(e) => println!("写入失败: {}", e),
    }
    
    // 读取数据
    while let Some(byte) = buffer.read() {
        println!("读取: {}", byte);
    }
}
```

## 性能考虑

### 内存布局

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    
    // 向量的内存布局
    println!("向量地址: {:p}", &v);
    println!("数据地址: {:p}", v.as_ptr());
    println!("长度: {}", v.len());
    println!("容量: {}", v.capacity());
    
    // 元素是连续存储的
    for (i, item) in v.iter().enumerate() {
        println!("元素 {} 地址: {:p}", i, item);
    }
}
```

### 避免不必要的分配

```rust
fn main() {
    // 好的做法：预分配
    let mut v = Vec::with_capacity(1000);
    for i in 0..1000 {
        v.push(i);
    }
    
    // 不好的做法：频繁重新分配
    let mut v2 = Vec::new();
    for i in 0..1000 {
        v2.push(i);  // 可能导致多次重新分配
    }
    
    // 好的做法：使用 extend
    let mut v3 = vec![1, 2, 3];
    v3.extend([4, 5, 6, 7, 8]);
    
    // 不好的做法：多次 push
    let mut v4 = vec![1, 2, 3];
    v4.push(4);
    v4.push(5);
    v4.push(6);
    v4.push(7);
    v4.push(8);
}
```

## 常见错误和解决方案

### 借用检查错误

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    
    // 错误：不能同时有可变和不可变引用
    // let first = &v[0];
    // v.push(6);  // 错误！
    // println!("First: {}", first);
    
    // 正确：在修改前使用完引用
    {
        let first = &v[0];
        println!("First: {}", first);
    }
    v.push(6);
    
    // 或者：克隆值而不是借用
    let first = v[0];
    v.push(7);
    println!("First: {}", first);
}
```

### 索引越界

```rust
fn main() {
    let v = vec![1, 2, 3];
    
    // 危险：可能 panic
    // let fourth = v[3];  // panic!
    
    // 安全：使用 get
    match v.get(3) {
        Some(fourth) => println!("Fourth: {}", fourth),
        None => println!("No fourth element"),
    }
    
    // 或者先检查长度
    if v.len() > 3 {
        println!("Fourth: {}", v[3]);
    } else {
        println!("Vector is too short");
    }
}
```

## 最佳实践

1. **预分配容量**：如果知道大概的元素数量，使用 `Vec::with_capacity`
2. **使用切片参数**：函数参数使用 `&[T]` 而不是 `&Vec<T>`
3. **避免不必要的克隆**：使用引用而不是值，除非确实需要所有权
4. **选择正确的遍历方式**：根据需要选择 `iter()`、`iter_mut()` 或 `into_iter()`
5. **使用 `collect()` 从迭代器创建**：而不是手动循环 `push`

## 练习

1. 实现一个动态数组的环形缓冲区
2. 创建一个向量操作工具库，包含常用的数学运算
3. 实现一个简单的文本编辑器的行缓冲区

## 下一步

学习完 Vec 向量后，继续学习 [02-HashMap 和 HashSet](02-hash-collections.md)。