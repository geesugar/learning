use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use crate::utils;

pub struct FileManager;

impl FileManager {
    pub fn new() -> Self {
        FileManager
    }
    
    /// 复制文件
    pub fn copy(&self, source: &str, destination: &str) -> Result<(), Box<dyn std::error::Error>> {
        let source_path = Path::new(source);
        let dest_path = Path::new(destination);
        
        if !source_path.exists() {
            return Err(format!("源文件不存在: {}", source).into());
        }
        
        if !source_path.is_file() {
            return Err("只能复制文件，不能复制目录".into());
        }
        
        // 如果目标是目录，则在目录中创建同名文件
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
        
        // 检查是否会覆盖现有文件
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
        
        fs::copy(source_path, &final_dest)?;
        
        let size = fs::metadata(&final_dest)?.len();
        println!("✅ 文件复制成功: {} -> {} ({})", 
                source, 
                final_dest.display(),
                utils::format_size(size));
        
        Ok(())
    }
    
    /// 移动/重命名文件
    pub fn move_file(&self, source: &str, destination: &str) -> Result<(), Box<dyn std::error::Error>> {
        let source_path = Path::new(source);
        let dest_path = Path::new(destination);
        
        if !source_path.exists() {
            return Err(format!("源文件不存在: {}", source).into());
        }
        
        let final_dest = if dest_path.is_dir() {
            let filename = source_path.file_name()
                .ok_or("无法获取源文件名")?;
            dest_path.join(filename)
        } else {
            if let Some(parent) = dest_path.parent() {
                fs::create_dir_all(parent)?;
            }
            dest_path.to_path_buf()
        };
        
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
        
        fs::rename(source_path, &final_dest)?;
        
        println!("✅ 文件移动成功: {} -> {}", source, final_dest.display());
        
        Ok(())
    }
    
    /// 删除文件
    pub fn delete(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let file_path = Path::new(path);
        
        if !file_path.exists() {
            return Err(format!("文件不存在: {}", path).into());
        }
        
        print!("确定要删除 {} 吗? (y/N): ", path);
        io::Write::flush(&mut io::stdout())?;
        
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        
        if !input.trim().to_lowercase().starts_with('y') {
            println!("操作已取消");
            return Ok(());
        }
        
        if file_path.is_file() {
            fs::remove_file(file_path)?;
            println!("✅ 文件删除成功: {}", path);
        } else if file_path.is_dir() {
            fs::remove_dir_all(file_path)?;
            println!("✅ 目录删除成功: {}", path);
        }
        
        Ok(())
    }
    
    /// 列出目录内容
    pub fn list(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let dir_path = Path::new(path);
        
        if !dir_path.exists() {
            return Err(format!("路径不存在: {}", path).into());
        }
        
        if !dir_path.is_dir() {
            return Err(format!("{} 不是目录", path).into());
        }
        
        println!("📁 目录内容: {}", dir_path.display());
        println!("{}", "=".repeat(60));
        
        let mut entries: Vec<_> = fs::read_dir(dir_path)?.collect::<Result<Vec<_>, _>>()?;
        entries.sort_by(|a, b| a.file_name().cmp(&b.file_name()));
        
        for entry in entries {
            let metadata = entry.metadata()?;
            let file_name = entry.file_name();
            let file_name_str = file_name.to_string_lossy();
            
            let (icon, type_str) = if metadata.is_dir() {
                ("📁", "DIR")
            } else {
                ("📄", "FILE")
            };
            
            let size = if metadata.is_file() {
                utils::format_size(metadata.len())
            } else {
                "-".to_string()
            };
            
            let modified = metadata.modified()
                .map(utils::format_time)
                .unwrap_or_else(|_| "未知".to_string());
            
            println!("{} {:4} {:>10} {:19} {}", 
                    icon, type_str, size, modified, file_name_str);
        }
        
        Ok(())
    }
    
    /// 显示文件信息
    pub fn info(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let file_path = Path::new(path);
        
        if !file_path.exists() {
            return Err(format!("文件不存在: {}", path).into());
        }
        
        let metadata = fs::metadata(file_path)?;
        let abs_path = fs::canonicalize(file_path)?;
        
        println!("📋 文件信息");
        println!("{}", "=".repeat(40));
        println!("文件名: {}", file_path.file_name().unwrap().to_string_lossy());
        println!("路径: {}", file_path.display());
        println!("绝对路径: {}", abs_path.display());
        println!("类型: {}", if metadata.is_dir() { "目录" } else { "文件" });
        
        if metadata.is_file() {
            println!("大小: {} ({} 字节)", utils::format_size(metadata.len()), metadata.len());
        }
        
        if let Ok(created) = metadata.created() {
            println!("创建时间: {}", utils::format_time(created));
        }
        
        if let Ok(modified) = metadata.modified() {
            println!("修改时间: {}", utils::format_time(modified));
        }
        
        if let Ok(accessed) = metadata.accessed() {
            println!("访问时间: {}", utils::format_time(accessed));
        }
        
        // Unix 特有的权限信息
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let permissions = metadata.permissions();
            println!("权限: {:o}", permissions.mode());
        }
        
        Ok(())
    }
    
    /// 创建空文件
    pub fn create(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let file_path = Path::new(path);
        
        if file_path.exists() {
            return Err(format!("文件已存在: {}", path).into());
        }
        
        // 确保父目录存在
        if let Some(parent) = file_path.parent() {
            fs::create_dir_all(parent)?;
        }
        
        fs::File::create(file_path)?;
        println!("✅ 文件创建成功: {}", path);
        
        Ok(())
    }
    
    /// 创建目录
    pub fn create_dir(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let dir_path = Path::new(path);
        
        if dir_path.exists() {
            return Err(format!("目录已存在: {}", path).into());
        }
        
        fs::create_dir_all(dir_path)?;
        println!("✅ 目录创建成功: {}", path);
        
        Ok(())
    }
    
    /// 查找文件
    pub fn find(&self, dir: &str, pattern: &str) -> Result<(), Box<dyn std::error::Error>> {
        let search_dir = Path::new(dir);
        
        if !search_dir.exists() {
            return Err(format!("目录不存在: {}", dir).into());
        }
        
        if !search_dir.is_dir() {
            return Err(format!("{} 不是目录", dir).into());
        }
        
        println!("🔍 在 {} 中搜索 \"{}\"", dir, pattern);
        println!("{}", "=".repeat(40));
        
        let matches = self.find_files_recursive(search_dir, pattern)?;
        
        if matches.is_empty() {
            println!("未找到匹配的文件");
        } else {
            for file_path in matches {
                let metadata = fs::metadata(&file_path)?;
                let size = if metadata.is_file() {
                    utils::format_size(metadata.len())
                } else {
                    "DIR".to_string()
                };
                println!("📄 {} ({})", file_path.display(), size);
            }
        }
        
        Ok(())
    }
    
    /// 递归查找文件
    fn find_files_recursive(&self, dir: &Path, pattern: &str) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let mut matches = Vec::new();
        
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                // 递归搜索子目录
                let mut sub_matches = self.find_files_recursive(&path, pattern)?;
                matches.append(&mut sub_matches);
            } else if path.is_file() {
                // 检查文件名是否匹配模式
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
    
    /// 简单的模式匹配（支持 * 通配符）
    fn pattern_match(&self, filename: &str, pattern: &str) -> bool {
        // 简化的模式匹配，支持 * 通配符
        if pattern == "*" {
            return true;
        }
        
        if !pattern.contains('*') {
            return filename.contains(pattern);
        }
        
        // 处理简单的 *.ext 模式
        if pattern.starts_with('*') {
            let suffix = &pattern[1..];
            return filename.ends_with(suffix);
        }
        
        if pattern.ends_with('*') {
            let prefix = &pattern[..pattern.len()-1];
            return filename.starts_with(prefix);
        }
        
        // 更复杂的模式可以使用正则表达式库
        filename.contains(&pattern.replace('*', ""))
    }
    
    /// 计算文件或目录大小
    pub fn calculate_size(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let target_path = Path::new(path);
        
        if !target_path.exists() {
            return Err(format!("路径不存在: {}", path).into());
        }
        
        let size = self.get_size_recursive(target_path)?;
        
        println!("📊 大小统计: {}", path);
        println!("{}", "=".repeat(30));
        println!("总大小: {} ({} 字节)", utils::format_size(size), size);
        
        Ok(())
    }
    
    /// 递归计算目录大小
    fn get_size_recursive(&self, path: &Path) -> Result<u64, Box<dyn std::error::Error>> {
        let metadata = fs::metadata(path)?;
        
        if metadata.is_file() {
            Ok(metadata.len())
        } else if metadata.is_dir() {
            let mut total_size = 0;
            
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let entry_size = self.get_size_recursive(&entry.path())?;
                total_size += entry_size;
            }
            
            Ok(total_size)
        } else {
            Ok(0)
        }
    }
}