use std::time::{SystemTime, UNIX_EPOCH};

/// 格式化文件大小为人类可读的形式
pub fn format_size(size: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    const THRESHOLD: u64 = 1024;
    
    if size < THRESHOLD {
        return format!("{} B", size);
    }
    
    let mut size_f = size as f64;
    let mut unit_index = 0;
    
    while size_f >= THRESHOLD as f64 && unit_index < UNITS.len() - 1 {
        size_f /= THRESHOLD as f64;
        unit_index += 1;
    }
    
    if size_f >= 100.0 {
        format!("{:.0} {}", size_f, UNITS[unit_index])
    } else if size_f >= 10.0 {
        format!("{:.1} {}", size_f, UNITS[unit_index])
    } else {
        format!("{:.2} {}", size_f, UNITS[unit_index])
    }
}

/// 格式化系统时间为可读字符串
pub fn format_time(time: SystemTime) -> String {
    match time.duration_since(UNIX_EPOCH) {
        Ok(duration) => {
            let timestamp = duration.as_secs();
            
            // 简单的时间格式化
            // 在实际应用中，建议使用 chrono 库进行更精确的时间处理
            let datetime = chrono_format(timestamp);
            datetime
        },
        Err(_) => "时间格式错误".to_string(),
    }
}

/// 简单的时间格式化函数
fn chrono_format(timestamp: u64) -> String {
    // 这是一个简化的实现
    // 实际应用中应该使用 chrono 库
    
    const SECONDS_PER_MINUTE: u64 = 60;
    const SECONDS_PER_HOUR: u64 = 3600;
    const SECONDS_PER_DAY: u64 = 86400;
    
    // 获取当前时间戳
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    if timestamp > now {
        return "未来时间".to_string();
    }
    
    let diff = now - timestamp;
    
    if diff < SECONDS_PER_MINUTE {
        return format!("{} 秒前", diff);
    } else if diff < SECONDS_PER_HOUR {
        return format!("{} 分钟前", diff / SECONDS_PER_MINUTE);
    } else if diff < SECONDS_PER_DAY {
        return format!("{} 小时前", diff / SECONDS_PER_HOUR);
    } else if diff < SECONDS_PER_DAY * 7 {
        return format!("{} 天前", diff / SECONDS_PER_DAY);
    } else {
        // 对于更久的时间，显示简化的日期
        return format_date_simple(timestamp);
    }
}

/// 简化的日期格式化
fn format_date_simple(timestamp: u64) -> String {
    // Unix 时间戳转换的简化实现
    // 1970年1月1日开始的秒数
    
    const SECONDS_PER_DAY: u64 = 86400;
    const DAYS_PER_YEAR: u64 = 365;
    const DAYS_PER_LEAP_YEAR: u64 = 366;
    
    let days_since_epoch = timestamp / SECONDS_PER_DAY;
    
    // 简化的年份计算
    let mut year = 1970;
    let mut remaining_days = days_since_epoch;
    
    // 粗略估算年份
    while remaining_days >= DAYS_PER_YEAR {
        if is_leap_year(year) && remaining_days >= DAYS_PER_LEAP_YEAR {
            remaining_days -= DAYS_PER_LEAP_YEAR;
        } else {
            remaining_days -= DAYS_PER_YEAR;
        }
        year += 1;
    }
    
    // 简化的月日计算
    let month = (remaining_days / 30) + 1; // 粗略估算
    let day = (remaining_days % 30) + 1;
    
    format!("{:04}-{:02}-{:02}", year, month.min(12), day.min(31))
}

/// 检查是否为闰年
fn is_leap_year(year: u64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
}

/// 获取文件扩展名
pub fn get_file_extension(filename: &str) -> Option<&str> {
    std::path::Path::new(filename)
        .extension()
        .and_then(|ext| ext.to_str())
}

/// 验证路径是否安全（防止路径遍历攻击）
pub fn is_safe_path(path: &str) -> bool {
    // 基本的安全检查
    !path.contains("..") && !path.starts_with('/')
}

/// 创建备份文件名
pub fn create_backup_name(original: &str) -> String {
    let path = std::path::Path::new(original);
    
    if let Some(extension) = path.extension() {
        let stem = path.file_stem().unwrap().to_string_lossy();
        let parent = path.parent().map(|p| p.to_string_lossy()).unwrap_or_default();
        
        let backup_name = format!("{}.backup.{}", stem, extension.to_string_lossy());
        
        if parent.is_empty() {
            backup_name
        } else {
            format!("{}/{}", parent, backup_name)
        }
    } else {
        format!("{}.backup", original)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_format_size() {
        assert_eq!(format_size(100), "100 B");
        assert_eq!(format_size(1024), "1.00 KB");
        assert_eq!(format_size(1536), "1.50 KB");
        assert_eq!(format_size(1048576), "1.00 MB");
        assert_eq!(format_size(1073741824), "1.00 GB");
    }
    
    #[test]
    fn test_get_file_extension() {
        assert_eq!(get_file_extension("test.txt"), Some("txt"));
        assert_eq!(get_file_extension("test.tar.gz"), Some("gz"));
        assert_eq!(get_file_extension("test"), None);
        assert_eq!(get_file_extension(".hidden"), None);
    }
    
    #[test]
    fn test_is_safe_path() {
        assert!(is_safe_path("file.txt"));
        assert!(is_safe_path("dir/file.txt"));
        assert!(!is_safe_path("../file.txt"));
        assert!(!is_safe_path("/etc/passwd"));
        assert!(!is_safe_path("dir/../file.txt"));
    }
    
    #[test]
    fn test_create_backup_name() {
        assert_eq!(create_backup_name("test.txt"), "test.backup.txt");
        assert_eq!(create_backup_name("dir/test.txt"), "dir/test.backup.txt");
        assert_eq!(create_backup_name("test"), "test.backup");
    }
    
    #[test]
    fn test_is_leap_year() {
        assert!(is_leap_year(2000));
        assert!(is_leap_year(2004));
        assert!(!is_leap_year(1900));
        assert!(!is_leap_year(2001));
    }
}