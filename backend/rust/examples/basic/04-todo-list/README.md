# 待办事项列表

## 项目概述

这是一个功能完整的命令行待办事项管理工具，支持任务的增删改查、优先级管理、数据持久化、搜索过滤等功能。项目展示了Rust中的结构体设计、HashMap使用、JSON序列化、模块组织等核心概念。

## 学习目标

- 掌握结构体（struct）的定义和使用
- 学会HashMap集合类型的操作
- 理解JSON序列化和反序列化
- 学习数据持久化的实现
- 掌握枚举和trait的高级用法
- 了解软件架构设计模式

## 知识点

### 1. 结构体和数据建模
- Todo结构体的设计
- 字段的可见性和访问控制
- 结构体方法的实现
- 构造函数模式

### 2. 集合类型
- HashMap的使用和操作
- Vec的动态数组操作
- 集合的迭代和过滤
- 所有权在集合中的管理

### 3. 序列化和持久化
- serde库的使用
- JSON格式的处理
- 文件I/O操作
- 数据的备份和恢复

### 4. 高级枚举和trait
- 带数据的枚举变体
- Display trait的实现
- 自定义trait的设计
- 枚举的模式匹配

## 功能特性

### 核心功能
- **添加任务**：支持描述和优先级设置
- **完成任务**：标记任务为已完成
- **删除任务**：移除不需要的任务
- **编辑任务**：修改任务描述和优先级
- **列出任务**：按优先级和状态排序显示

### 高级功能
- **搜索任务**：关键词搜索功能
- **过滤任务**：按状态、优先级过滤
- **统计信息**：显示完成率和分布
- **数据持久化**：自动保存到JSON文件
- **导入导出**：支持文本格式的批量导入

### 使用模式
- **交互式模式**：逐步引导操作
- **命令行模式**：单条命令执行
- **双模式支持**：灵活的使用方式

## 项目结构

```
04-todo-list/
├── Cargo.toml
├── src/
│   ├── main.rs         # 主程序和命令行界面
│   ├── todo.rs         # 核心数据结构和业务逻辑
│   └── storage.rs      # 数据持久化模块
└── README.md
```

## 详细Rust语法解析

### 1. 高级枚举定义和Display trait实现

#### 带数据的枚举和Display实现
```rust
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
    Urgent,
}

impl fmt::Display for Priority {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let (symbol, text) = match self {
            Priority::Low => ("🟢", "低"),
            Priority::Medium => ("🟡", "中"),
            Priority::High => ("🟠", "高"),
            Priority::Urgent => ("🔴", "紧急"),
        };
        write!(f, "{} {}", symbol, text)
    }
}
```

**语法要点：**
- `#[derive()]` 自动实现多个trait：Debug（调试打印）、Clone（深拷贝）、PartialEq（相等比较）、Serialize/Deserialize（序列化）
- `fmt::Display` trait实现自定义的字符串表示
- `fmt::Formatter` 是格式化上下文
- 元组解构：`let (symbol, text) = match` 同时获取多个值
- `write!` 宏向格式化器写入数据

### 2. 复杂结构体设计和方法实现

#### Todo结构体定义
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: usize,
    pub description: String,
    pub completed: bool,
    pub priority: Priority,
    pub created_at: String,
    pub completed_at: Option<String>,
}
```

**语法要点：**
- `pub` 关键字使字段公开访问
- `Option<String>` 表示可能为空的字段
- 结构体字段使用不同的数据类型

#### 构造函数和方法实现
```rust
impl Todo {
    pub fn new(id: usize, description: String, priority: Priority) -> Self {
        Todo {
            id,                                    // 字段简写语法
            description,
            completed: false,                      // 默认值
            priority,
            created_at: get_current_time(),        // 函数调用
            completed_at: None,                    // None字面量
        }
    }
    
    pub fn complete(&mut self) {                   // 可变借用self
        self.completed = true;
        self.completed_at = Some(get_current_time());  // Some包装值
    }
    
    pub fn reopen(&mut self) {
        self.completed = false;
        self.completed_at = None;                  // 重置为None
    }
}
```

**语法要点：**
- `Self` 是类型别名，表示当前结构体类型
- 字段简写：当变量名和字段名相同时可以省略
- `&mut self` 表示可变方法，可以修改结构体内容
- `Some()` 和 `None` 是Option枚举的变体

### 3. HashMap和集合操作

#### HashMap的使用
```rust
use std::collections::HashMap;

pub struct TodoManager {
    todos: HashMap<usize, Todo>,       // HashMap存储键值对
    next_id: usize,                    // 自增ID
    storage: Storage,                  // 组合其他结构体
}

impl TodoManager {
    pub fn new() -> Self {
        TodoManager {
            todos: HashMap::new(),              // 创建空HashMap
            next_id: 1,
            storage: Storage::new("todos.json"),
        }
    }
    
    pub fn add_todo(&mut self, description: String, priority: Priority) -> usize {
        let todo = Todo::new(self.next_id, description, priority);
        let id = todo.id;
        self.todos.insert(id, todo);            // 插入键值对
        self.next_id += 1;                      // ID递增
        id                                      // 返回新ID
    }
    
    pub fn remove_todo(&mut self, id: usize) -> bool {
        self.todos.remove(&id).is_some()        // 删除并检查是否存在
    }
}
```

**语法要点：**
- `HashMap<K, V>` 泛型集合，K是键类型，V是值类型
- `insert()` 插入键值对，会覆盖已存在的键
- `remove()` 返回 `Option<V>`，`is_some()` 检查是否有值
- `&id` 创建ID的引用，因为remove需要借用键

#### HashMap的复杂操作
```rust
pub fn get_todo(&self, id: usize) -> Option<&Todo> {
    self.todos.get(&id)                         // 获取引用
}

pub fn complete_todo(&mut self, id: usize) -> bool {
    if let Some(todo) = self.todos.get_mut(&id) {  // if let模式
        todo.complete();                        // 调用方法
        true
    } else {
        false
    }
}

// 函数式编程风格的数据处理
let matching_todos: Vec<&Todo> = self.todos
    .values()                                   // 获取所有值的迭代器
    .filter(|todo| todo.description.to_lowercase().contains(&keyword_lower))
    .collect();                                 // 收集到Vec
```

**语法要点：**
- `get()` 返回 `Option<&V>`，不可变引用
- `get_mut()` 返回 `Option<&mut V>`，可变引用
- `if let` 模式匹配，处理Option类型
- `values()` 获取HashMap所有值的迭代器
- 方法链：`filter()` -> `collect()` 函数式处理

### 4. 序列化和反序列化

#### serde的使用
```rust
use serde::{Deserialize, Serialize};

// 结构体自动序列化
#[derive(Serialize, Deserialize)]
struct TodosData {
    todos: Vec<Todo>,
    next_id: usize,
}

// 序列化到JSON
pub fn save_to_file(&self) -> Result<(), Box<dyn std::error::Error>> {
    let todos_vec: Vec<&Todo> = self.todos.values().collect();
    self.storage.save(&TodosData {
        todos: todos_vec,
        next_id: self.next_id,
    })
}

// 从JSON反序列化
pub fn load_from_file(&mut self) -> Result<(), Box<dyn std::error::Error>> {
    let data: TodosData = self.storage.load()?;
    
    self.todos.clear();                         // 清空现有数据
    for todo in data.todos {
        self.todos.insert(todo.id, todo);       // 重建HashMap
    }
    self.next_id = data.next_id;
    
    Ok(())
}
```

**语法要点：**
- `#[derive(Serialize, Deserialize)]` 自动实现序列化trait
- `collect()` 将迭代器收集到集合
- `clear()` 清空HashMap
- 循环中的所有权转移：`for todo in data.todos` 移动所有权

### 5. 高级模式匹配和排序

#### 复杂的排序逻辑
```rust
let mut todos: Vec<&Todo> = self.todos.values().collect();
todos.sort_by(|a, b| {
    // 先按完成状态排序（未完成的在前）
    match a.completed.cmp(&b.completed) {
        std::cmp::Ordering::Equal => {
            // 再按优先级排序（高优先级在前）
            match (&b.priority, &a.priority) {
                (Priority::Urgent, _) if !matches!(a.priority, Priority::Urgent) => std::cmp::Ordering::Greater,
                (_, Priority::Urgent) if !matches!(b.priority, Priority::Urgent) => std::cmp::Ordering::Less,
                (Priority::High, _) if matches!(a.priority, Priority::Medium | Priority::Low) => std::cmp::Ordering::Greater,
                (_, Priority::High) if matches!(b.priority, Priority::Medium | Priority::Low) => std::cmp::Ordering::Less,
                (Priority::Medium, Priority::Low) => std::cmp::Ordering::Greater,
                (Priority::Low, Priority::Medium) => std::cmp::Ordering::Less,
                _ => a.id.cmp(&b.id),               // 最后按ID排序
            }
        }
        other => other,
    }
});
```

**语法要点：**
- `sort_by()` 接受闭包进行自定义排序
- `cmp()` 方法返回 `std::cmp::Ordering` 枚举
- `matches!` 宏进行模式匹配检查
- 嵌套match处理复杂的排序逻辑
- 引用模式 `&b.priority` 避免移动所有权

### 6. 泛型和trait对象

#### Storage模块的泛型设计
```rust
pub struct Storage {
    file_path: String,
}

impl Storage {
    // 泛型方法：T必须实现Serialize trait
    pub fn save<T: Serialize>(&self, data: &T) -> Result<(), Box<dyn std::error::Error>> {
        let json_data = serde_json::to_string_pretty(data)?;  // 序列化为JSON
        
        let temp_path = format!("{}.tmp", self.file_path);
        {
            let mut temp_file = fs::File::create(&temp_path)?;
            temp_file.write_all(json_data.as_bytes())?;       // 写入字节
            temp_file.sync_all()?;                            // 强制同步到磁盘
        }  // temp_file在这里被drop
        
        fs::rename(&temp_path, &self.file_path)?;             // 原子性替换
        Ok(())
    }
    
    // 泛型方法：T必须实现Deserialize trait
    pub fn load<T: for<'de> Deserialize<'de>>(&self) -> Result<T, Box<dyn std::error::Error>> {
        let json_data = fs::read_to_string(&self.file_path)?;
        let data: T = serde_json::from_str(&json_data)?;
        Ok(data)
    }
}
```

**语法要点：**
- `<T: Serialize>` 泛型约束，T必须实现Serialize trait
- `for<'de> Deserialize<'de>` 高级生命周期约束，用于反序列化
- `Box<dyn std::error::Error>` trait对象，可以包含任何错误类型
- 作用域控制：`{}` 块确保文件在操作完成后关闭
- 原子性操作：先写临时文件，再重命名

### 7. 统计和数据分析

#### 复杂的统计计算
```rust
pub fn show_statistics(&self) {
    let total = self.todos.len();
    let completed = self.todos.values().filter(|todo| todo.completed).count();
    let pending = total - completed;
    
    // 使用HashMap统计优先级分布
    let mut priority_stats = HashMap::new();
    priority_stats.insert(Priority::Urgent, 0);
    priority_stats.insert(Priority::High, 0);
    priority_stats.insert(Priority::Medium, 0);
    priority_stats.insert(Priority::Low, 0);
    
    // 统计未完成任务的优先级分布
    for todo in self.todos.values() {
        if !todo.completed {
            *priority_stats.get_mut(&todo.priority).unwrap() += 1;
        }
    }
    
    // 计算完成率
    let completion_rate = if total > 0 {
        completed as f64 / total as f64 * 100.0
    } else {
        0.0
    };
    
    // 根据完成率给出评价
    println!();
    match completion_rate {
        r if r >= 90.0 => println!("🎉 完成率很高！继续保持！"),
        r if r >= 70.0 => println!("👍 完成率不错，再接再厉！"),
        r if r >= 50.0 => println!("💪 完成率还行，继续努力！"),
        _ => println!("🔥 加油！还有很多任务需要完成！"),
    }
}
```

**语法要点：**
- `filter().count()` 统计满足条件的元素数量
- `get_mut()` 获取HashMap值的可变引用
- `*priority_stats.get_mut().unwrap() += 1` 解引用并修改值
- `as f64` 类型转换，整数转浮点数
- 范围匹配：`r if r >= 90.0` 带条件的模式匹配

### 8. 文本处理和导入导出

#### 文本格式的导入功能
```rust
pub fn import_from_text(&mut self, text: &str) -> usize {
    let mut imported = 0;
    
    for line in text.lines() {                          // 按行分割
        let line = line.trim();                         // 去除空白
        if line.is_empty() {                            // 跳过空行
            continue;
        }
        
        // 解析格式：[优先级] 任务描述
        let (priority, description) = if line.starts_with('[') {
            if let Some(end_bracket) = line.find(']') { // 查找结束括号
                let priority_str = &line[1..end_bracket].to_lowercase();
                let priority = match priority_str {     // 字符串匹配
                    "urgent" | "u" | "紧急" => Priority::Urgent,
                    "high" | "h" | "高" => Priority::High,
                    "medium" | "m" | "中" => Priority::Medium,
                    "low" | "l" | "低" => Priority::Low,
                    _ => Priority::Medium,              // 默认值
                };
                let description = line[end_bracket + 1..].trim().to_string();
                (priority, description)
            } else {
                (Priority::Medium, line.to_string())
            }
        } else {
            (Priority::Medium, line.to_string())
        };
        
        if !description.is_empty() {
            self.add_todo(description, priority);
            imported += 1;
        }
    }
    
    imported
}
```

**语法要点：**
- `lines()` 方法按行分割字符串
- `find()` 查找字符位置，返回 `Option<usize>`
- 字符串切片：`&line[1..end_bracket]` 获取子字符串
- 多重模式匹配：`"urgent" | "u" | "紧急"` 支持多种格式

### 9. 命令行参数解析

#### 复杂的命令行处理
```rust
fn run_command_mode(manager: &mut TodoManager, args: &[String]) {
    match args[1].as_str() {
        "filter" => {
            if args.len() < 3 {
                eprintln!("用法: {} filter <类型>", args[0]);
                return;
            }
            
            match args[2].as_str() {
                "pending" => manager.filter_todos_by_status(false),
                "completed" => manager.filter_todos_by_status(true),
                priority_filter if priority_filter.starts_with("priority:") => {
                    let priority_str = &priority_filter[9..];  // 跳过"priority:"
                    let priority = match priority_str {
                        "low" => Priority::Low,
                        "medium" => Priority::Medium,
                        "high" => Priority::High,
                        "urgent" => Priority::Urgent,
                        _ => {
                            eprintln!("❌ 无效的优先级");
                            return;
                        }
                    };
                    manager.filter_todos_by_priority(priority);
                },
                _ => {
                    eprintln!("❌ 无效的过滤类型");
                    return;
                }
            }
        },
        "add" => {
            let description = args[2..].join(" ");         // 连接多个参数
            let priority = if args.len() > 3 {
                match args.last().unwrap().as_str() {      // 获取最后一个参数
                    "low" | "l" => Priority::Low,
                    "high" | "h" => Priority::High,
                    _ => Priority::Medium,
                }
            } else {
                Priority::Medium
            };
            
            manager.add_todo(description, priority);
        },
        _ => {
            show_help(&args[0]);
        }
    }
}
```

**语法要点：**
- `&[String]` 字符串切片参数
- `args[2..]` 切片语法，从索引2开始到结尾
- `join(" ")` 将字符串数组连接为单个字符串
- `last()` 获取最后一个元素，返回Option
- 守卫模式：`priority_filter if priority_filter.starts_with("priority:")`

### 10. 错误处理和用户交互

#### 交互式输入处理
```rust
fn run_interactive_mode(manager: &mut TodoManager) {
    loop {
        print!("todo> ");
        io::Write::flush(&mut io::stdout()).unwrap();   // 刷新输出缓冲区
        
        let mut input = String::new();
        match io::stdin().read_line(&mut input) {
            Ok(_) => {
                let input = input.trim();               // 变量遮蔽
                if input.is_empty() {
                    continue;
                }
                
                let parts: Vec<&str> = input.split_whitespace().collect();
                if parts.is_empty() {
                    continue;
                }
                
                match parts[0] {
                    "quit" | "exit" | "q" => {
                        println!("👋 再见！");
                        break;                          // 退出循环
                    },
                    "add" => {
                        if parts.len() < 2 {
                            println!("用法: add <任务描述>");
                            continue;                   // 跳过本次迭代
                        }
                        
                        let description = parts[1..].join(" ");
                        manager.add_todo(description, Priority::Medium);
                        println!("✅ 任务添加成功！");
                    },
                    _ => {
                        println!("未知命令: {}，输入 'help' 查看可用命令", parts[0]);
                    }
                }
                
                // 自动保存
                if let Err(e) = manager.save_to_file() {
                    eprintln!("警告: 无法保存待办事项文件: {}", e);
                }
            },
            Err(e) => {
                eprintln!("读取输入错误: {}", e);
                break;
            }
        }
    }
}
```

**语法要点：**
- 变量遮蔽：`let input = input.trim()` 重新定义同名变量
- `split_whitespace()` 按空白字符分割
- `break` 和 `continue` 控制循环流程
- `if let Err(e)` 处理错误情况而忽略成功

### 11. 高级trait实现

#### 复杂的Display实现
```rust
impl fmt::Display for Todo {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let status = if self.completed { "✅" } else { "⭕" };
        let priority_display = format!("{}", self.priority);  // 调用Priority的Display
        
        write!(
            f,
            "{:3}. {} [{}] {}",                              // 格式化字符串
            self.id,                                         // 3位宽度
            status,
            priority_display,
            self.description
        )?;                                                  // 错误传播
        
        if self.completed {
            if let Some(completed_time) = &self.completed_at { // 引用Optional值
                write!(f, " (完成于: {})", completed_time)?;
            }
        } else {
            write!(f, " (创建于: {})", self.created_at)?;
        }
        
        Ok(())                                              // 成功返回
    }
}
```

**语法要点：**
- `{:3}` 格式化说明符，3位宽度
- `format!` 宏创建格式化字符串
- `write!` 宏的错误传播：`?` 操作符
- `&self.completed_at` 借用Optional字段
- 条件格式化输出

### 关键设计模式和最佳实践

#### 1. 构建器模式变种
```rust
impl TodoManager {
    pub fn new() -> Self {
        TodoManager {
            todos: HashMap::new(),
            next_id: 1,
            storage: Storage::new("todos.json"),
        }
    }
}
```

#### 2. 命令模式
```rust
// 不同的操作对应不同的方法
match command {
    "add" => manager.add_todo(desc, priority),
    "complete" => manager.complete_todo(id),
    "remove" => manager.remove_todo(id),
    // ...
}
```

#### 3. 策略模式
```rust
// 不同的过滤策略
fn filter_todos_by_status(&self, completed: bool) { /* ... */ }
fn filter_todos_by_priority(&self, priority: Priority) { /* ... */ }
fn search_todos(&self, keyword: &str) { /* ... */ }
```

### 关键语法总结

1. **高级枚举**：带数据的枚举和Display trait实现
2. **HashMap操作**：插入、查找、删除、迭代的各种模式
3. **序列化**：serde库的使用和JSON处理
4. **泛型约束**：trait bound和生命周期约束
5. **函数式编程**：filter、map、collect等迭代器方法
6. **错误处理**：Result类型和`?`操作符的高级使用
7. **模式匹配**：复杂的match表达式和守卫
8. **字符串处理**：分割、连接、格式化的各种技巧

这些语法特性展示了Rust在数据建模、集合操作、序列化等方面的强大能力，以及如何构建复杂而健壮的应用程序。

## 使用示例

### 交互式模式
```bash
cargo run

📝 待办事项管理器
输入 'help' 查看命令，输入 'quit' 退出
==================================================
todo> add 学习Rust
✅ 任务添加成功！

todo> list
📋 所有待办事项:
================================================================================
  1. ⭕ [🟡 中] 学习Rust (创建于: 1640000000)
================================================================================
总计: 1 个任务

todo> complete 1
✅ 任务已完成！

todo> stats
📊 待办事项统计:
========================================
总任务数: 1
已完成: 1 (100.0%)
未完成: 0 (0.0%)

按优先级分布 (仅未完成):
  🔴 紧急: 0 个
  🟠 高: 0 个
  🟡 中: 0 个
  🟢 低: 0 个

🎉 完成率很高！继续保持！
```

### 命令行模式
```bash
# 添加任务
cargo run -- add "完成项目文档" high

# 列出所有任务
cargo run -- list

# 完成任务
cargo run -- complete 1

# 搜索任务
cargo run -- search "文档"

# 过滤任务
cargo run -- filter pending
cargo run -- filter priority:urgent

# 显示统计
cargo run -- stats
```

## 运行和测试

### 编译运行
```bash
# 进入项目目录
cd examples/basic/04-todo-list

# 编译项目
cargo build

# 运行交互模式
cargo run

# 运行命令行模式
cargo run -- add "学习Rust" high

# 运行测试
cargo test

# 运行特定测试
cargo test test_manager_add_todo
```

### 测试覆盖
项目包含完整的单元测试，覆盖：
- Todo结构体的各种操作
- TodoManager的CRUD功能
- 优先级处理
- 导入导出功能
- 序列化和反序列化

## 扩展练习

### 1. 添加截止日期功能
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    // ... 现有字段
    pub due_date: Option<String>,
    pub reminder: Option<String>,
}
```

### 2. 添加任务分类功能
```rust
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Category {
    Work,
    Personal,
    Study,
    Shopping,
    Other(String),
}
```

### 3. 添加子任务功能
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    // ... 现有字段
    pub subtasks: Vec<Subtask>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subtask {
    pub description: String,
    pub completed: bool,
}
```

## 总结

这个待办事项列表项目全面展示了：

1. **数据建模**：结构体、枚举、Option类型的综合应用
2. **集合操作**：HashMap的高级使用和函数式编程
3. **序列化**：JSON数据的持久化存储
4. **错误处理**：Result类型和trait对象的实际应用
5. **用户界面**：命令行交互的完整实现
6. **软件架构**：模块化设计和职责分离

通过这个项目，你可以深入理解Rust在复杂数据结构处理、持久化存储、用户交互等方面的能力，学会构建功能完整的应用程序。

## 下一步

完成这个项目后，建议学习：
- [05-单词计数器](../05-word-counter/) - 学习文本分析和HashMap高级用法
- [06-HTTP客户端](../../intermediate/06-http-client/) - 学习网络编程和异步处理