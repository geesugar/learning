# 文件操作工具

## 项目概述

这是一个功能完整的命令行文件操作工具，实现了常见的文件和目录操作功能，如复制、移动、删除、列表、查找等。项目展示了Rust在文件I/O、错误处理、模块组织等方面的应用。

## 学习目标

- 掌握文件I/O操作的基本概念
- 学会使用std::fs模块进行文件操作
- 理解路径处理和跨平台兼容性
- 学习错误处理的最佳实践
- 掌握模块组织和代码分离
- 了解命令行工具的设计模式

## 知识点

### 1. 文件系统操作
- 文件和目录的创建、删除、移动
- 文件元数据的读取
- 路径操作和解析
- 权限和安全检查

### 2. 模块系统
- 使用mod关键字组织代码
- 模块间的依赖关系
- 代码的分层和职责分离

### 3. 错误处理
- Box<dyn std::error::Error>的使用
- 错误链和错误转换
- 用户友好的错误消息

### 4. 跨平台编程
- 条件编译（#[cfg(unix)]）
- 平台相关的功能实现
- 路径分隔符的处理

## 功能特性

### 基本文件操作
- **copy**: 复制文件，支持覆盖确认
- **move**: 移动/重命名文件
- **delete**: 删除文件或目录，带确认提示
- **create**: 创建空文件
- **mkdir**: 创建目录

### 信息查看
- **list**: 列出目录内容，显示文件类型、大小、修改时间
- **info**: 显示详细的文件信息（大小、权限、时间戳）
- **size**: 计算文件或目录的总大小

### 搜索功能
- **find**: 在目录中搜索文件，支持通配符模式

## 项目结构

```
03-file-utils/
├── Cargo.toml
├── src/
│   ├── main.rs              # 主程序和命令行解析
│   ├── file_operations.rs   # 核心文件操作逻辑
│   └── utils.rs             # 工具函数（格式化、时间处理等）
└── README.md
```

## 使用示例

### 基本用法

```bash
# 编译项目
cargo build --release

# 复制文件
cargo run -- copy source.txt backup/
./target/release/file-utils copy source.txt backup/

# 移动文件
cargo run -- move old_name.txt new_name.txt

# 删除文件（会要求确认）
cargo run -- delete unwanted.txt

# 列出当前目录
cargo run -- list
cargo run -- list /home/user/documents

# 查看文件信息
cargo run -- info myfile.txt

# 创建文件
cargo run -- create newfile.txt

# 创建目录
cargo run -- mkdir new_directory

# 搜索文件
cargo run -- find . "*.rs"
cargo run -- find /home/user "*.txt"

# 计算目录大小
cargo run -- size /home/user/documents
```

### 命令别名

为了提高使用便利性，工具支持常用的命令别名：

```bash
# 这些命令是等价的
cargo run -- copy file.txt backup/
cargo run -- cp file.txt backup/

cargo run -- move old.txt new.txt  
cargo run -- mv old.txt new.txt

cargo run -- delete file.txt
cargo run -- del file.txt
cargo run -- rm file.txt

cargo run -- list
cargo run -- ls
```

### 输出示例

#### 列出目录内容
```
📁 目录内容: /home/user/projects
============================================================
📁 DIR          -       2024-01-15 10:30 docs
📄 FILE    1.2 KB       2024-01-14 15:45 README.md
📄 FILE   45.3 KB       2024-01-15 09:20 main.rs
📄 FILE    2.8 MB       2024-01-10 14:33 data.json
```

#### 文件信息显示
```
📋 文件信息
========================================
文件名: example.txt
路径: ./example.txt
绝对路径: /home/user/projects/example.txt
类型: 文件
大小: 1.2 KB (1234 字节)
创建时间: 2024-01-10 14:30:22
修改时间: 2024-01-15 09:45:31
访问时间: 2024-01-15 10:15:44
权限: 644
```

#### 搜索结果
```
🔍 在 . 中搜索 "*.rs"
========================================
📄 ./src/main.rs (2.3 KB)
📄 ./src/lib.rs (1.8 KB)
📄 ./tests/integration_test.rs (945 B)
```

## 核心代码结构

### 主要模块

#### FileManager 结构体
```rust
pub struct FileManager;

impl FileManager {
    pub fn new() -> Self { FileManager }
    
    pub fn copy(&self, source: &str, destination: &str) -> Result<(), Box<dyn std::error::Error>>
    pub fn move_file(&self, source: &str, destination: &str) -> Result<(), Box<dyn std::error::Error>>
    pub fn delete(&self, path: &str) -> Result<(), Box<dyn std::error::Error>>
    pub fn list(&self, path: &str) -> Result<(), Box<dyn std::error::Error>>
    // ... 其他方法
}
```

#### 工具函数模块
```rust
// utils.rs
pub fn format_size(size: u64) -> String            // 格式化文件大小
pub fn format_time(time: SystemTime) -> String     // 格式化时间戳
pub fn get_file_extension(filename: &str) -> Option<&str>  // 获取文件扩展名
pub fn is_safe_path(path: &str) -> bool            // 路径安全检查
pub fn create_backup_name(original: &str) -> String // 创建备份文件名
```

### 关键特性

#### 1. 智能目标路径处理
```rust
let final_dest = if dest_path.is_dir() {
    let filename = source_path.file_name()
        .ok_or("无法获取源文件名")?;
    dest_path.join(filename)  // 如果目标是目录，在目录中创建同名文件
} else {
    dest_path.to_path_buf()   // 如果目标是文件路径，直接使用
};
```

#### 2. 用户确认机制
```rust
if final_dest.exists() {
    print!("目标文件已存在，是否覆盖? (y/N): ");
    io::Write::flush(&mut io::stdout())?;
    
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    
    if !input.trim().to_lowercase().starts_with('y') {
        println!("操作已取消");
        return Ok(());
    }
}
```

#### 3. 递归目录操作
```rust
fn find_files_recursive(&self, dir: &Path, pattern: &str) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
    let mut matches = Vec::new();
    
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        
        if path.is_dir() {
            let mut sub_matches = self.find_files_recursive(&path, pattern)?;
            matches.append(&mut sub_matches);
        } else if path.is_file() {
            // 文件匹配逻辑
        }
    }
    
    Ok(matches)
}
```

## 扩展功能

### 1. 文件同步
```rust
impl FileManager {
    pub fn sync_directories(&self, source: &str, target: &str) -> Result<(), Box<dyn std::error::Error>> {
        // 实现目录同步逻辑
        // 比较两个目录的内容，同步差异
    }
}
```

### 2. 文件监控
```rust
use notify::{Watcher, RecursiveMode, watcher};

impl FileManager {
    pub fn watch_directory(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        // 使用 notify crate 监控文件系统变化
        let (tx, rx) = std::sync::mpsc::channel();
        let mut watcher = watcher(tx, Duration::from_secs(10))?;
        watcher.watch(path, RecursiveMode::Recursive)?;
        
        // 处理文件系统事件
        loop {
            match rx.recv() {
                Ok(event) => println!("文件系统事件: {:?}", event),
                Err(e) => println!("监控错误: {:?}", e),
            }
        }
    }
}
```

### 3. 压缩和解压
```rust
impl FileManager {
    pub fn compress(&self, source: &str, archive: &str) -> Result<(), Box<dyn std::error::Error>> {
        // 使用 zip 或 tar 库实现文件压缩
    }
    
    pub fn extract(&self, archive: &str, destination: &str) -> Result<(), Box<dyn std::error::Error>> {
        // 实现文件解压功能
    }
}
```

### 4. 文件完整性校验
```rust
use sha2::{Sha256, Digest};

impl FileManager {
    pub fn calculate_checksum(&self, path: &str) -> Result<String, Box<dyn std::error::Error>> {
        let mut file = fs::File::open(path)?;
        let mut hasher = Sha256::new();
        io::copy(&mut file, &mut hasher)?;
        
        let result = hasher.finalize();
        Ok(format!("{:x}", result))
    }
    
    pub fn verify_checksum(&self, path: &str, expected: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let actual = self.calculate_checksum(path)?;
        Ok(actual == expected)
    }
}
```

## 测试用例

### 单元测试示例

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempdir::TempDir;
    
    #[test]
    fn test_copy_file() {
        let temp_dir = TempDir::new("test").unwrap();
        let source = temp_dir.path().join("source.txt");
        let dest = temp_dir.path().join("dest.txt");
        
        fs::write(&source, "test content").unwrap();
        
        let manager = FileManager::new();
        manager.copy(source.to_str().unwrap(), dest.to_str().unwrap()).unwrap();
        
        assert!(dest.exists());
        assert_eq!(fs::read_to_string(dest).unwrap(), "test content");
    }
    
    #[test]
    fn test_create_directory() {
        let temp_dir = TempDir::new("test").unwrap();
        let new_dir = temp_dir.path().join("new_directory");
        
        let manager = FileManager::new();
        manager.create_dir(new_dir.to_str().unwrap()).unwrap();
        
        assert!(new_dir.exists());
        assert!(new_dir.is_dir());
    }
}
```

### 集成测试

```bash
# 创建测试脚本 tests/integration_test.sh
#!/bin/bash

# 创建测试环境
mkdir -p test_env
cd test_env

# 测试文件创建
../target/release/file-utils create test.txt
[ -f test.txt ] || exit 1

# 测试文件复制
../target/release/file-utils copy test.txt test_copy.txt
[ -f test_copy.txt ] || exit 1

# 测试目录创建
../target/release/file-utils mkdir test_dir
[ -d test_dir ] || exit 1

# 清理测试环境
cd ..
rm -rf test_env

echo "所有测试通过！"
```

## 性能优化

### 1. 大文件处理优化
```rust
use std::io::{BufReader, BufWriter};

impl FileManager {
    pub fn copy_large_file(&self, source: &str, dest: &str) -> Result<(), Box<dyn std::error::Error>> {
        let source_file = fs::File::open(source)?;
        let dest_file = fs::File::create(dest)?;
        
        let mut reader = BufReader::new(source_file);
        let mut writer = BufWriter::new(dest_file);
        
        io::copy(&mut reader, &mut writer)?;
        Ok(())
    }
}
```

### 2. 并行目录处理
```rust
use rayon::prelude::*;

impl FileManager {
    pub fn process_directory_parallel(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let entries: Vec<_> = fs::read_dir(path)?.collect::<Result<Vec<_>, _>>()?;
        
        entries.par_iter().try_for_each(|entry| {
            // 并行处理每个文件
            self.process_file(&entry.path())
        })?;
        
        Ok(())
    }
}
```

## 安全考虑

### 1. 路径遍历攻击防护
```rust
pub fn is_safe_path(path: &str) -> bool {
    // 防止 ../../../etc/passwd 这样的攻击
    !path.contains("..") && 
    !path.starts_with('/') &&
    !path.contains('\0')  // 防止空字节注入
}
```

### 2. 权限检查
```rust
impl FileManager {
    fn check_permissions(&self, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
        let metadata = fs::metadata(path)?;
        
        if metadata.permissions().readonly() {
            return Err("文件为只读，无法修改".into());
        }
        
        Ok(())
    }
}
```

## 详细Rust语法解析

### 1. 模块系统和代码组织

#### 模块声明和引用
```rust
// main.rs
mod file_operations;  // 声明模块
mod utils;            // 声明工具模块

use file_operations::FileManager;  // 使用use引入类型
```

**语法要点：**
- `mod module_name;` 声明一个模块，Rust会查找同名的.rs文件
- `use` 关键字将项引入当前作用域
- 模块系统帮助组织代码，避免单个文件过大

#### 跨模块调用
```rust
// file_operations.rs
use crate::utils;  // 使用crate::引用项目根模块

// 在方法中调用其他模块的函数
let formatted_size = utils::format_size(metadata.len());
```

**语法要点：**
- `crate::` 表示从项目根开始的路径
- 模块间可以相互引用，形成清晰的依赖关系

### 2. Path和文件系统操作

#### Path类型的使用
```rust
use std::path::{Path, PathBuf};

let source_path = Path::new(source);        // 创建Path引用
let dest_path = Path::new(destination);     // Path是借用的

// Path的常用方法
if source_path.exists() {                   // 检查路径是否存在
    println!("文件存在");
}

if source_path.is_file() {                  // 检查是否为文件
    println!("这是一个文件");
}

let filename = source_path.file_name()      // 获取文件名
    .ok_or("无法获取源文件名")?;            // Option转换为Result

let final_dest = if dest_path.is_dir() {
    let filename = source_path.file_name()
        .ok_or("无法获取源文件名")?;
    dest_path.join(filename)                // join方法连接路径
} else {
    dest_path.to_path_buf()                 // 转换为拥有所有权的PathBuf
};
```

**语法要点：**
- `Path` 是借用类型，类似 `&str`
- `PathBuf` 是拥有所有权的类型，类似 `String`
- `join()` 方法用于连接路径组件
- `ok_or()` 将 `Option` 转换为 `Result`

### 3. 文件I/O操作

#### 基本文件操作
```rust
use std::fs;

// 复制文件
fs::copy(source_path, &final_dest)?;

// 移动/重命名文件
fs::rename(source_path, &final_dest)?;

// 删除文件
fs::remove_file(file_path)?;

// 删除目录（递归）
fs::remove_dir_all(file_path)?;

// 创建目录（递归）
fs::create_dir_all(dir_path)?;

// 读取目录内容
for entry in fs::read_dir(dir_path)? {
    let entry = entry?;  // 处理Result
    let path = entry.path();
    // ...
}
```

**语法要点：**
- `?` 操作符用于错误传播，相当于早期返回错误
- 大多数文件操作返回 `Result<T, std::io::Error>`
- `fs::read_dir()` 返回迭代器，每个项也是Result

#### 文件元数据操作
```rust
let metadata = fs::metadata(file_path)?;

// 文件大小
let size = metadata.len();

// 文件类型检查
if metadata.is_file() {
    println!("这是文件");
} else if metadata.is_dir() {
    println!("这是目录");
}

// 时间戳
if let Ok(created) = metadata.created() {
    let formatted_time = utils::format_time(created);
    println!("创建时间: {}", formatted_time);
}

// 权限信息（Unix系统特定）
#[cfg(unix)]
{
    use std::os::unix::fs::PermissionsExt;
    let permissions = metadata.permissions();
    println!("权限: {:o}", permissions.mode());
}
```

**语法要点：**
- `metadata()` 获取文件元数据
- `#[cfg(unix)]` 条件编译，只在Unix系统编译
- `use std::os::unix::fs::PermissionsExt` 引入平台特定功能

### 4. 错误处理和Result类型

#### Box<dyn std::error::Error> 的使用
```rust
pub fn copy(&self, source: &str, destination: &str) -> Result<(), Box<dyn std::error::Error>> {
    let source_path = Path::new(source);
    
    if !source_path.exists() {
        return Err(format!("源文件不存在: {}", source).into());  // String转换为Box<dyn Error>
    }
    
    // ... 其他操作
    
    Ok(())  // 成功时返回空元组
}
```

**语法要点：**
- `Box<dyn std::error::Error>` 是错误trait对象，可以容纳任何错误类型
- `.into()` 方法自动进行类型转换
- `dyn` 关键字表示动态分发的trait对象

#### 错误处理模式
```rust
match self.execute(request.clone()).await {
    Ok(response) => return Ok(response),
    Err(e) => {
        last_error = Some(e);
        if attempt < max_retries {
            println!("请求失败，{} 秒后重试...", retry_delay.as_secs());
            sleep(retry_delay).await;
        }
    }
}
```

### 5. 用户交互和输入验证

#### 用户确认机制
```rust
use std::io::{self, Write};

print!("目标文件已存在，是否覆盖? (y/N): ");
io::Write::flush(&mut io::stdout())?;  // 强制刷新输出缓冲区

let mut input = String::new();
io::stdin().read_line(&mut input)?;

if !input.trim().to_lowercase().starts_with('y') {
    println!("操作已取消");
    return Ok(());
}
```

**语法要点：**
- `print!` 不会自动刷新输出，需要手动 `flush()`
- `stdin().read_line()` 会保留换行符，需要使用 `trim()`
- `starts_with()` 检查字符串前缀

### 6. 迭代器和函数式编程

#### 过滤和排序
```rust
let mut entries: Vec<_> = fs::read_dir(dir_path)?
    .collect::<Result<Vec<_>, _>>()?;  // 收集Result类型的迭代器

entries.sort_by(|a, b| a.file_name().cmp(&b.file_name()));  // 自定义排序

// 函数式处理
let matching_todos: Vec<&Todo> = self.todos
    .values()
    .filter(|todo| todo.description.to_lowercase().contains(&keyword_lower))
    .collect();
```

**语法要点：**
- `collect::<Result<Vec<_>, _>>()` 处理包含Result的迭代器
- `sort_by()` 接受闭包进行自定义排序
- `filter()` 和 `collect()` 实现函数式数据处理

### 7. 字符串格式化和显示

#### 格式化宏的使用
```rust
println!("{} {:4} {:>10} {:19} {}", 
        icon,           // 图标
        type_str,       // 类型，4字符宽度
        size,           // 大小，右对齐，10字符宽度
        modified,       // 修改时间，19字符宽度
        file_name_str   // 文件名
);

// 字符串格式化到变量
let message = format!("文件复制成功: {} -> {} ({})", 
                     source, 
                     final_dest.display(),
                     utils::format_size(size));
```

**语法要点：**
- `{:4}` 指定最小宽度
- `{:>10}` 右对齐，10字符宽度
- `format!` 返回格式化的String
- `display()` 方法用于显示路径

### 8. 模式匹配在命令行解析中的应用

#### match语句处理命令
```rust
match args[1].as_str() {
    "copy" | "cp" => {
        if args.len() < 4 {
            eprintln!("错误: copy 命令需要源文件和目标路径");
            return;
        }
        handle_result(manager.copy(&args[2], &args[3]));
    },
    "list" | "ls" => {
        let path = if args.len() > 2 { &args[2] } else { "." };  // 默认值处理
        handle_result(manager.list(path));
    },
    _ => {
        eprintln!("未知命令: {}", args[1]);
        show_help(&args[0]);
    }
}
```

**语法要点：**
- `|` 匹配多个模式（或模式）
- 条件表达式可以在匹配中使用
- `eprintln!` 向标准错误输出

### 9. 递归算法实现

#### 递归文件搜索
```rust
fn find_files_recursive(&self, dir: &Path, pattern: &str) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
    let mut matches = Vec::new();
    
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        
        if path.is_dir() {
            // 递归调用自身
            let mut sub_matches = self.find_files_recursive(&path, pattern)?;
            matches.append(&mut sub_matches);  // 合并结果
        } else if path.is_file() {
            // 文件匹配逻辑
            if let Some(filename) = path.file_name() {
                let filename_str = filename.to_string_lossy();
                if self.pattern_match(&filename_str, pattern) {
                    matches.push(path);
                }
            }
        }
    }
    
    Ok(matches)
}
```

**语法要点：**
- 递归函数调用自身处理子目录
- `Vec::append()` 将另一个向量的内容添加到当前向量
- `to_string_lossy()` 安全地将OsStr转换为字符串

### 10. 时间处理和格式化

#### SystemTime处理
```rust
use std::time::{SystemTime, UNIX_EPOCH};

pub fn format_time(time: SystemTime) -> String {
    match time.duration_since(UNIX_EPOCH) {
        Ok(duration) => {
            let timestamp = duration.as_secs();
            chrono_format(timestamp)
        },
        Err(_) => "时间格式错误".to_string(),
    }
}
```

**语法要点：**
- `SystemTime` 表示系统时间点
- `duration_since()` 计算时间差，返回Result
- `as_secs()` 获取秒数表示

### 11. 条件编译和平台特定代码

#### 平台特定功能
```rust
// Unix 特有的权限信息
#[cfg(unix)]
{
    use std::os::unix::fs::PermissionsExt;
    let permissions = metadata.permissions();
    println!("权限: {:o}", permissions.mode());
}

// Windows特定代码（示例）
#[cfg(windows)]
{
    use std::os::windows::fs::MetadataExt;
    // Windows特定的元数据操作
}
```

**语法要点：**
- `#[cfg(unix)]` 只在Unix系统编译
- `#[cfg(windows)]` 只在Windows系统编译
- 平台特定的trait需要显式引入

### 关键设计模式

#### 1. Builder模式的变种
```rust
let final_dest = if dest_path.is_dir() {
    let filename = source_path.file_name()
        .ok_or("无法获取源文件名")?;
    dest_path.join(filename)
} else {
    // 确保目标目录存在
    if let Some(parent) = dest_path.parent() {
        fs::create_dir_all(parent)?;
    }
    dest_path.to_path_buf()
};
```

#### 2. 策略模式
```rust
fn pattern_match(&self, filename: &str, pattern: &str) -> bool {
    if pattern == "*" {
        return true;
    }
    
    if !pattern.contains('*') {
        return filename.contains(pattern);
    }
    
    // 不同的匹配策略
    if pattern.starts_with('*') {
        let suffix = &pattern[1..];
        return filename.ends_with(suffix);
    }
    
    // ... 更多策略
}
```

### 关键语法总结

1. **模块系统**：`mod`, `use`, `crate::` 实现代码组织
2. **Path处理**：`Path`和`PathBuf`处理文件路径
3. **错误处理**：`Result`类型和`?`操作符的错误传播
4. **文件I/O**：`std::fs`模块的各种文件操作
5. **迭代器**：函数式编程风格的数据处理
6. **条件编译**：`#[cfg()]`实现跨平台兼容
7. **trait对象**：`Box<dyn Trait>`实现动态类型

这些语法特性使得Rust能够编写安全、高效的系统级程序，同时保持良好的可读性和维护性。

## 总结

这个文件操作工具项目展示了：

1. **文件系统操作**：完整的CRUD操作实现
2. **模块化设计**：清晰的代码组织和职责分离
3. **错误处理**：健壮的错误处理机制
4. **用户体验**：友好的命令行界面和交互
5. **跨平台支持**：考虑不同操作系统的差异
6. **安全性**：基本的安全检查和防护

通过这个项目，你可以深入理解Rust在系统编程方面的能力，学会构建实用的命令行工具。

## 下一步

完成这个项目后，建议学习：
- [04-待办事项列表](../04-todo-list/) - 学习数据结构和持久化
- [05-单词计数器](../05-word-counter/) - 学习文本处理和HashMap的使用