# 02-HashMap 和 HashSet

## 概述

HashMap 和 HashSet 是基于哈希表实现的集合类型，提供平均 O(1) 的插入、删除和查找操作。HashMap 存储键值对，而 HashSet 存储唯一值。

## HashMap<K, V>

### 基本使用

```rust
use std::collections::HashMap;

fn main() {
    // 创建空的 HashMap
    let mut scores = HashMap::new();
    
    // 插入键值对
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    
    // 访问值
    let team_name = String::from("Blue");
    let score = scores.get(&team_name).copied().unwrap_or(0);
    println!("Blue 队的分数: {}", score);
    
    // 遍历 HashMap
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
}
```

### 创建 HashMap 的多种方式

```rust
use std::collections::HashMap;

fn main() {
    // 方法1：使用 new() 和 insert()
    let mut map1 = HashMap::new();
    map1.insert("a", 1);
    map1.insert("b", 2);
    
    // 方法2：从向量创建
    let teams = vec![String::from("Blue"), String::from("Yellow")];
    let initial_scores = vec![10, 50];
    let map2: HashMap<_, _> = teams.into_iter().zip(initial_scores.into_iter()).collect();
    
    // 方法3：使用 from_iter
    let map3: HashMap<&str, i32> = [("x", 1), ("y", 2), ("z", 3)].iter().cloned().collect();
    
    // 方法4：使用 HashMap::from
    let map4 = HashMap::from([
        ("apple", 3),
        ("banana", 2),
        ("cherry", 5),
    ]);
    
    println!("map1: {:?}", map1);
    println!("map2: {:?}", map2);
    println!("map3: {:?}", map3);
    println!("map4: {:?}", map4);
}
```

### 更新值

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    
    // 覆盖值
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Blue"), 25);  // 覆盖
    
    // 只在键不存在时插入
    scores.entry(String::from("Yellow")).or_insert(50);
    scores.entry(String::from("Blue")).or_insert(50);  // 不会覆盖
    
    // 根据旧值更新
    let count = scores.entry(String::from("Blue")).or_insert(0);
    *count += 10;
    
    println!("Scores: {:?}", scores);
}
```

### 高级操作

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("a", 1);
    map.insert("b", 2);
    map.insert("c", 3);
    
    // 检查键是否存在
    if map.contains_key("a") {
        println!("包含键 'a'");
    }
    
    // 获取键值对的引用
    if let Some((key, value)) = map.get_key_value("b") {
        println!("键值对: {} = {}", key, value);
    }
    
    // 删除键值对
    if let Some(value) = map.remove("c") {
        println!("删除了 c: {}", value);
    }
    
    // 清空
    map.clear();
    println!("清空后长度: {}", map.len());
}
```

## HashSet<T>

### 基本使用

```rust
use std::collections::HashSet;

fn main() {
    // 创建 HashSet
    let mut books = HashSet::new();
    
    // 插入元素
    books.insert("A Game of Thrones");
    books.insert("To Kill a Mockingbird");
    books.insert("The Great Gatsby");
    
    // 检查元素是否存在
    if books.contains("The Great Gatsby") {
        println!("包含《了不起的盖茨比》");
    }
    
    // 插入重复元素
    let was_inserted = books.insert("A Game of Thrones");
    println!("插入重复元素: {}", was_inserted); // false
    
    // 遍历
    for book in &books {
        println!("书籍: {}", book);
    }
    
    // 删除元素
    books.remove("To Kill a Mockingbird");
    println!("删除后的数量: {}", books.len());
}
```

### 集合操作

```rust
use std::collections::HashSet;

fn main() {
    let set1: HashSet<i32> = [1, 2, 3, 4, 5].iter().cloned().collect();
    let set2: HashSet<i32> = [4, 5, 6, 7, 8].iter().cloned().collect();
    
    // 交集
    let intersection: HashSet<_> = set1.intersection(&set2).collect();
    println!("交集: {:?}", intersection);
    
    // 并集
    let union: HashSet<_> = set1.union(&set2).collect();
    println!("并集: {:?}", union);
    
    // 差集
    let difference: HashSet<_> = set1.difference(&set2).collect();
    println!("差集 (set1 - set2): {:?}", difference);
    
    // 对称差集
    let symmetric_difference: HashSet<_> = set1.symmetric_difference(&set2).collect();
    println!("对称差集: {:?}", symmetric_difference);
    
    // 子集检查
    let set3: HashSet<i32> = [1, 2].iter().cloned().collect();
    println!("set3 是 set1 的子集: {}", set3.is_subset(&set1));
    println!("set1 是 set3 的超集: {}", set1.is_superset(&set3));
    
    // 不相交检查
    let set4: HashSet<i32> = [9, 10].iter().cloned().collect();
    println!("set1 和 set4 不相交: {}", set1.is_disjoint(&set4));
}
```

## 实际应用示例

### 单词计数器

```rust
use std::collections::HashMap;

fn word_count(text: &str) -> HashMap<String, usize> {
    let mut word_count = HashMap::new();
    
    for word in text.split_whitespace() {
        let word = word.to_lowercase().trim_matches(|c: char| !c.is_alphabetic()).to_string();
        if !word.is_empty() {
            let count = word_count.entry(word).or_insert(0);
            *count += 1;
        }
    }
    
    word_count
}

fn main() {
    let text = "Hello world! This is a test. Hello Rust programming. 
                Rust is great for systems programming.";
    
    let counts = word_count(text);
    
    // 按频率排序
    let mut count_vec: Vec<_> = counts.iter().collect();
    count_vec.sort_by(|a, b| b.1.cmp(a.1));
    
    println!("单词频率统计:");
    for (word, count) in count_vec {
        println!("{}: {}", word, count);
    }
}
```

### 用户会话管理

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone)]
struct Session {
    user_id: String,
    created_at: Instant,
    last_activity: Instant,
    data: HashMap<String, String>,
}

impl Session {
    fn new(user_id: String) -> Self {
        let now = Instant::now();
        Session {
            user_id,
            created_at: now,
            last_activity: now,
            data: HashMap::new(),
        }
    }
    
    fn update_activity(&mut self) {
        self.last_activity = Instant::now();
    }
    
    fn set_data(&mut self, key: String, value: String) {
        self.data.insert(key, value);
        self.update_activity();
    }
    
    fn get_data(&self, key: &str) -> Option<&String> {
        self.data.get(key)
    }
    
    fn is_expired(&self, timeout: Duration) -> bool {
        self.last_activity.elapsed() > timeout
    }
}

struct SessionManager {
    sessions: HashMap<String, Session>,
    timeout: Duration,
}

impl SessionManager {
    fn new(timeout: Duration) -> Self {
        SessionManager {
            sessions: HashMap::new(),
            timeout,
        }
    }
    
    fn create_session(&mut self, session_id: String, user_id: String) {
        let session = Session::new(user_id);
        self.sessions.insert(session_id, session);
    }
    
    fn get_session(&self, session_id: &str) -> Option<&Session> {
        self.sessions.get(session_id)
    }
    
    fn get_session_mut(&mut self, session_id: &str) -> Option<&mut Session> {
        if let Some(session) = self.sessions.get_mut(session_id) {
            if session.is_expired(self.timeout) {
                self.sessions.remove(session_id);
                None
            } else {
                Some(session)
            }
        } else {
            None
        }
    }
    
    fn cleanup_expired(&mut self) {
        let expired_sessions: Vec<String> = self.sessions
            .iter()
            .filter(|(_, session)| session.is_expired(self.timeout))
            .map(|(id, _)| id.clone())
            .collect();
        
        for session_id in expired_sessions {
            self.sessions.remove(&session_id);
        }
    }
    
    fn active_sessions(&self) -> usize {
        self.sessions.len()
    }
}

fn main() {
    let mut manager = SessionManager::new(Duration::from_secs(30));
    
    // 创建会话
    manager.create_session("session1".to_string(), "user1".to_string());
    manager.create_session("session2".to_string(), "user2".to_string());
    
    // 使用会话
    if let Some(session) = manager.get_session_mut("session1") {
        session.set_data("theme".to_string(), "dark".to_string());
        session.set_data("language".to_string(), "rust".to_string());
    }
    
    // 读取会话数据
    if let Some(session) = manager.get_session("session1") {
        if let Some(theme) = session.get_data("theme") {
            println!("用户主题: {}", theme);
        }
        println!("会话数据: {:?}", session.data);
    }
    
    println!("活跃会话数: {}", manager.active_sessions());
    
    // 清理过期会话
    manager.cleanup_expired();
    println!("清理后活跃会话数: {}", manager.active_sessions());
}
```

### 图的邻接表表示

```rust
use std::collections::{HashMap, HashSet};

struct Graph {
    adjacency_list: HashMap<String, HashSet<String>>,
}

impl Graph {
    fn new() -> Self {
        Graph {
            adjacency_list: HashMap::new(),
        }
    }
    
    fn add_vertex(&mut self, vertex: String) {
        self.adjacency_list.entry(vertex).or_insert(HashSet::new());
    }
    
    fn add_edge(&mut self, from: String, to: String) {
        self.adjacency_list.entry(from.clone()).or_insert(HashSet::new()).insert(to.clone());
        self.adjacency_list.entry(to).or_insert(HashSet::new()).insert(from);
    }
    
    fn remove_edge(&mut self, from: &str, to: &str) {
        if let Some(neighbors) = self.adjacency_list.get_mut(from) {
            neighbors.remove(to);
        }
        if let Some(neighbors) = self.adjacency_list.get_mut(to) {
            neighbors.remove(from);
        }
    }
    
    fn get_neighbors(&self, vertex: &str) -> Option<&HashSet<String>> {
        self.adjacency_list.get(vertex)
    }
    
    fn vertices(&self) -> Vec<&String> {
        self.adjacency_list.keys().collect()
    }
    
    fn has_edge(&self, from: &str, to: &str) -> bool {
        self.adjacency_list
            .get(from)
            .map_or(false, |neighbors| neighbors.contains(to))
    }
    
    fn vertex_count(&self) -> usize {
        self.adjacency_list.len()
    }
    
    fn edge_count(&self) -> usize {
        self.adjacency_list.values().map(|neighbors| neighbors.len()).sum::<usize>() / 2
    }
    
    fn print_graph(&self) {
        for (vertex, neighbors) in &self.adjacency_list {
            println!("{}: {:?}", vertex, neighbors);
        }
    }
}

fn main() {
    let mut graph = Graph::new();
    
    // 添加顶点
    graph.add_vertex("A".to_string());
    graph.add_vertex("B".to_string());
    graph.add_vertex("C".to_string());
    graph.add_vertex("D".to_string());
    
    // 添加边
    graph.add_edge("A".to_string(), "B".to_string());
    graph.add_edge("A".to_string(), "C".to_string());
    graph.add_edge("B".to_string(), "D".to_string());
    graph.add_edge("C".to_string(), "D".to_string());
    
    println!("图的邻接表:");
    graph.print_graph();
    
    println!("顶点数: {}", graph.vertex_count());
    println!("边数: {}", graph.edge_count());
    
    // 检查边是否存在
    println!("A-B 连接: {}", graph.has_edge("A", "B"));
    println!("A-D 连接: {}", graph.has_edge("A", "D"));
    
    // 获取邻居
    if let Some(neighbors) = graph.get_neighbors("A") {
        println!("A 的邻居: {:?}", neighbors);
    }
}
```

## 性能考虑

### 自定义哈希函数

```rust
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;

#[derive(Debug, Eq, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Hash for Point {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.x.hash(state);
        self.y.hash(state);
    }
}

fn main() {
    let mut map = HashMap::new();
    
    map.insert(Point { x: 1, y: 2 }, "第一个点");
    map.insert(Point { x: 3, y: 4 }, "第二个点");
    
    let point = Point { x: 1, y: 2 };
    if let Some(value) = map.get(&point) {
        println!("找到点: {}", value);
    }
    
    // 计算哈希值
    let mut hasher = DefaultHasher::new();
    point.hash(&mut hasher);
    println!("点的哈希值: {}", hasher.finish());
}
```

### 容量管理

```rust
use std::collections::HashMap;

fn main() {
    // 预分配容量
    let mut map = HashMap::with_capacity(100);
    
    // 插入数据
    for i in 0..50 {
        map.insert(i, i * 2);
    }
    
    println!("长度: {}", map.len());
    println!("容量: {}", map.capacity());
    
    // 收缩容量
    map.shrink_to_fit();
    println!("收缩后容量: {}", map.capacity());
    
    // 保留特定元素
    map.retain(|&k, _| k % 2 == 0);
    println!("保留偶数键后长度: {}", map.len());
}
```

## 错误处理和边界情况

### 处理不存在的键

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("Alice", 95);
    scores.insert("Bob", 87);
    
    // 安全访问
    match scores.get("Charlie") {
        Some(score) => println!("Charlie 的分数: {}", score),
        None => println!("Charlie 不在记录中"),
    }
    
    // 使用默认值
    let charlie_score = scores.get("Charlie").unwrap_or(&0);
    println!("Charlie 的分数（默认）: {}", charlie_score);
    
    // 使用 Entry API
    let entry = scores.entry("David").or_insert(0);
    *entry += 10;
    println!("David 的分数: {}", scores["David"]);
}
```

### 处理键类型要求

```rust
use std::collections::HashMap;

// 这个类型不能用作 HashMap 的键，因为它不实现 Hash
// #[derive(PartialEq, Eq)]
// struct BadKey {
//     data: Vec<i32>,  // Vec 不实现 Hash
// }

// 正确的做法
#[derive(Hash, PartialEq, Eq, Debug)]
struct GoodKey {
    id: u32,
    name: String,
}

fn main() {
    let mut map = HashMap::new();
    
    let key1 = GoodKey { id: 1, name: "Alice".to_string() };
    let key2 = GoodKey { id: 2, name: "Bob".to_string() };
    
    map.insert(key1, "数据1");
    map.insert(key2, "数据2");
    
    let search_key = GoodKey { id: 1, name: "Alice".to_string() };
    if let Some(value) = map.get(&search_key) {
        println!("找到: {}", value);
    }
}
```

## 最佳实践

1. **选择合适的初始容量**：如果知道大概的元素数量，使用 `with_capacity`
2. **使用 Entry API**：避免重复查找，提高性能
3. **实现必要的 trait**：作为键的类型必须实现 `Hash`、`Eq` 和 `PartialEq`
4. **考虑键的生命周期**：使用 `String` 还是 `&str` 取决于数据的生命周期
5. **定期清理**：对于长期运行的程序，定期清理不需要的条目

## 练习

1. 实现一个 LRU（最近最少使用）缓存
2. 创建一个简单的倒排索引系统
3. 实现一个基于 HashMap 的简单数据库

## 下一步

学习完 HashMap 和 HashSet 后，继续学习 [03-其他集合类型](03-other-collections.md)。