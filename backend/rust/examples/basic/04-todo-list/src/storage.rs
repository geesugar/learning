use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{self, Write};
use std::path::Path;

pub struct Storage {
    file_path: String,
}

impl Storage {
    pub fn new(file_path: &str) -> Self {
        Storage {
            file_path: file_path.to_string(),
        }
    }
    
    /// 保存数据到文件
    pub fn save<T: Serialize>(&self, data: &T) -> Result<(), Box<dyn std::error::Error>> {
        // 创建备份文件（如果原文件存在）
        if Path::new(&self.file_path).exists() {
            let backup_path = format!("{}.backup", self.file_path);
            if let Err(e) = fs::copy(&self.file_path, &backup_path) {
                eprintln!("警告: 无法创建备份文件: {}", e);
            }
        }
        
        // 序列化数据
        let json_data = serde_json::to_string_pretty(data)?;
        
        // 写入临时文件
        let temp_path = format!("{}.tmp", self.file_path);
        {
            let mut temp_file = fs::File::create(&temp_path)?;
            temp_file.write_all(json_data.as_bytes())?;
            temp_file.sync_all()?; // 确保数据写入磁盘
        }
        
        // 原子性地替换原文件
        fs::rename(&temp_path, &self.file_path)?;
        
        Ok(())
    }
    
    /// 从文件加载数据
    pub fn load<T: for<'de> Deserialize<'de>>(&self) -> Result<T, Box<dyn std::error::Error>> {
        if !Path::new(&self.file_path).exists() {
            return Err(format!("文件不存在: {}", self.file_path).into());
        }
        
        let json_data = fs::read_to_string(&self.file_path)?;
        
        if json_data.trim().is_empty() {
            return Err("文件为空".into());
        }
        
        let data: T = serde_json::from_str(&json_data)?;
        Ok(data)
    }
    
    /// 检查文件是否存在
    pub fn exists(&self) -> bool {
        Path::new(&self.file_path).exists()
    }
    
    /// 删除文件
    pub fn delete(&self) -> Result<(), Box<dyn std::error::Error>> {
        if self.exists() {
            fs::remove_file(&self.file_path)?;
        }
        Ok(())
    }
    
    /// 获取文件大小
    pub fn file_size(&self) -> Result<u64, Box<dyn std::error::Error>> {
        let metadata = fs::metadata(&self.file_path)?;
        Ok(metadata.len())
    }
    
    /// 获取文件修改时间
    pub fn last_modified(&self) -> Result<std::time::SystemTime, Box<dyn std::error::Error>> {
        let metadata = fs::metadata(&self.file_path)?;
        Ok(metadata.modified()?)
    }
    
    /// 创建文件的完整备份
    pub fn create_backup(&self) -> Result<String, Box<dyn std::error::Error>> {
        if !self.exists() {
            return Err("原文件不存在，无法创建备份".into());
        }
        
        use std::time::{SystemTime, UNIX_EPOCH};
        
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| "时间错误")?
            .as_secs();
        
        let backup_path = format!("{}.backup.{}", self.file_path, timestamp);
        fs::copy(&self.file_path, &backup_path)?;
        
        Ok(backup_path)
    }
    
    /// 从备份文件恢复
    pub fn restore_from_backup(&self, backup_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        if !Path::new(backup_path).exists() {
            return Err(format!("备份文件不存在: {}", backup_path).into());
        }
        
        fs::copy(backup_path, &self.file_path)?;
        Ok(())
    }
    
    /// 获取所有备份文件
    pub fn list_backups(&self) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let file_name = Path::new(&self.file_path)
            .file_name()
            .ok_or("无效的文件路径")?
            .to_string_lossy();
        
        let dir_path = Path::new(&self.file_path)
            .parent()
            .unwrap_or_else(|| Path::new("."));
        
        let mut backups = Vec::new();
        
        for entry in fs::read_dir(dir_path)? {
            let entry = entry?;
            let entry_name = entry.file_name().to_string_lossy().to_string();
            
            if entry_name.starts_with(&format!("{}.backup", file_name)) {
                backups.push(entry.path().to_string_lossy().to_string());
            }
        }
        
        // 按修改时间排序（最新的在前）
        backups.sort_by(|a, b| {
            let a_metadata = fs::metadata(a).ok();
            let b_metadata = fs::metadata(b).ok();
            
            match (a_metadata, b_metadata) {
                (Some(a_meta), Some(b_meta)) => {
                    let a_time = a_meta.modified().unwrap_or(SystemTime::UNIX_EPOCH);
                    let b_time = b_meta.modified().unwrap_or(SystemTime::UNIX_EPOCH);
                    b_time.cmp(&a_time) // 逆序，最新的在前
                }
                _ => std::cmp::Ordering::Equal,
            }
        });
        
        Ok(backups)
    }
    
    /// 清理旧的备份文件（保留最近的N个）
    pub fn cleanup_backups(&self, keep_count: usize) -> Result<usize, Box<dyn std::error::Error>> {
        let backups = self.list_backups()?;
        
        if backups.len() <= keep_count {
            return Ok(0);
        }
        
        let to_delete = &backups[keep_count..];
        let mut deleted_count = 0;
        
        for backup_path in to_delete {
            match fs::remove_file(backup_path) {
                Ok(_) => deleted_count += 1,
                Err(e) => eprintln!("警告: 无法删除备份文件 {}: {}", backup_path, e),
            }
        }
        
        Ok(deleted_count)
    }
    
    /// 验证文件完整性（简单的JSON格式检查）
    pub fn verify_integrity<T: for<'de> Deserialize<'de>>(&self) -> Result<bool, Box<dyn std::error::Error>> {
        match self.load::<T>() {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
    
    /// 压缩保存（使用简单的行压缩）
    pub fn save_compressed<T: Serialize>(&self, data: &T) -> Result<(), Box<dyn std::error::Error>> {
        // 序列化为紧凑JSON（无格式化）
        let json_data = serde_json::to_string(data)?;
        
        // 创建临时文件
        let temp_path = format!("{}.tmp", self.file_path);
        {
            let mut temp_file = fs::File::create(&temp_path)?;
            temp_file.write_all(json_data.as_bytes())?;
            temp_file.sync_all()?;
        }
        
        // 原子性替换
        fs::rename(&temp_path, &self.file_path)?;
        
        Ok(())
    }
}

impl Default for Storage {
    fn default() -> Self {
        Storage::new("data.json")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};
    use tempfile::NamedTempFile;
    
    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestData {
        name: String,
        value: i32,
    }
    
    #[test]
    fn test_save_and_load() {
        let temp_file = NamedTempFile::new().unwrap();
        let file_path = temp_file.path().to_str().unwrap();
        let storage = Storage::new(file_path);
        
        let test_data = TestData {
            name: "test".to_string(),
            value: 42,
        };
        
        // 保存数据
        storage.save(&test_data).unwrap();
        
        // 加载数据
        let loaded_data: TestData = storage.load().unwrap();
        
        assert_eq!(test_data, loaded_data);
    }
    
    #[test]
    fn test_file_not_exists() {
        let storage = Storage::new("non_existent_file.json");
        
        assert!(!storage.exists());
        
        let result: Result<TestData, _> = storage.load();
        assert!(result.is_err());
    }
    
    #[test]
    fn test_backup_operations() {
        let temp_file = NamedTempFile::new().unwrap();
        let file_path = temp_file.path().to_str().unwrap();
        let storage = Storage::new(file_path);
        
        let test_data = TestData {
            name: "test".to_string(),
            value: 42,
        };
        
        // 保存初始数据
        storage.save(&test_data).unwrap();
        
        // 创建备份
        let backup_path = storage.create_backup().unwrap();
        
        // 修改数据
        let modified_data = TestData {
            name: "modified".to_string(),
            value: 100,
        };
        storage.save(&modified_data).unwrap();
        
        // 从备份恢复
        storage.restore_from_backup(&backup_path).unwrap();
        
        // 验证恢复的数据
        let restored_data: TestData = storage.load().unwrap();
        assert_eq!(test_data, restored_data);
        
        // 清理
        fs::remove_file(&backup_path).ok();
    }
    
    #[test]
    fn test_integrity_verification() {
        let temp_file = NamedTempFile::new().unwrap();
        let file_path = temp_file.path().to_str().unwrap();
        let storage = Storage::new(file_path);
        
        let test_data = TestData {
            name: "test".to_string(),
            value: 42,
        };
        
        // 保存有效数据
        storage.save(&test_data).unwrap();
        assert!(storage.verify_integrity::<TestData>().unwrap());
        
        // 写入无效JSON
        fs::write(file_path, "invalid json").unwrap();
        assert!(!storage.verify_integrity::<TestData>().unwrap());
    }
    
    #[test]
    fn test_compressed_save() {
        let temp_file = NamedTempFile::new().unwrap();
        let file_path = temp_file.path().to_str().unwrap();
        let storage = Storage::new(file_path);
        
        let test_data = TestData {
            name: "test".to_string(),
            value: 42,
        };
        
        // 压缩保存
        storage.save_compressed(&test_data).unwrap();
        
        // 正常加载
        let loaded_data: TestData = storage.load().unwrap();
        assert_eq!(test_data, loaded_data);
        
        // 检查文件大小（压缩后应该更小，但在这个简单例子中可能差别不大）
        let size = storage.file_size().unwrap();
        assert!(size > 0);
    }
}