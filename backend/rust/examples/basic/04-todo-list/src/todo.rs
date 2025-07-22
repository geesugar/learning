use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;

use crate::storage::Storage;

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: usize,
    pub description: String,
    pub completed: bool,
    pub priority: Priority,
    pub created_at: String,
    pub completed_at: Option<String>,
}

impl Todo {
    pub fn new(id: usize, description: String, priority: Priority) -> Self {
        Todo {
            id,
            description,
            completed: false,
            priority,
            created_at: get_current_time(),
            completed_at: None,
        }
    }
    
    pub fn complete(&mut self) {
        self.completed = true;
        self.completed_at = Some(get_current_time());
    }
    
    pub fn reopen(&mut self) {
        self.completed = false;
        self.completed_at = None;
    }
    
    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = priority;
    }
    
    pub fn edit_description(&mut self, new_description: String) {
        self.description = new_description;
    }
}

impl fmt::Display for Todo {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let status = if self.completed { "✅" } else { "⭕" };
        let priority_display = format!("{}", self.priority);
        
        write!(
            f,
            "{:3}. {} [{}] {}",
            self.id,
            status,
            priority_display,
            self.description
        )?;
        
        if self.completed {
            if let Some(completed_time) = &self.completed_at {
                write!(f, " (完成于: {})", completed_time)?;
            }
        } else {
            write!(f, " (创建于: {})", self.created_at)?;
        }
        
        Ok(())
    }
}

pub struct TodoManager {
    todos: HashMap<usize, Todo>,
    next_id: usize,
    storage: Storage,
}

impl TodoManager {
    pub fn new() -> Self {
        TodoManager {
            todos: HashMap::new(),
            next_id: 1,
            storage: Storage::new("todos.json"),
        }
    }
    
    pub fn add_todo(&mut self, description: String, priority: Priority) -> usize {
        let todo = Todo::new(self.next_id, description, priority);
        let id = todo.id;
        self.todos.insert(id, todo);
        self.next_id += 1;
        id
    }
    
    pub fn remove_todo(&mut self, id: usize) -> bool {
        self.todos.remove(&id).is_some()
    }
    
    pub fn complete_todo(&mut self, id: usize) -> bool {
        if let Some(todo) = self.todos.get_mut(&id) {
            todo.complete();
            true
        } else {
            false
        }
    }
    
    pub fn reopen_todo(&mut self, id: usize) -> bool {
        if let Some(todo) = self.todos.get_mut(&id) {
            todo.reopen();
            true
        } else {
            false
        }
    }
    
    pub fn edit_todo(&mut self, id: usize, new_description: String) -> bool {
        if let Some(todo) = self.todos.get_mut(&id) {
            todo.edit_description(new_description);
            true
        } else {
            false
        }
    }
    
    pub fn set_priority(&mut self, id: usize, priority: Priority) -> bool {
        if let Some(todo) = self.todos.get_mut(&id) {
            todo.set_priority(priority);
            true
        } else {
            false
        }
    }
    
    pub fn list_todos(&self) {
        if self.todos.is_empty() {
            println!("📝 没有待办事项");
            return;
        }
        
        println!("📋 所有待办事项:");
        println!("{}", "=".repeat(80));
        
        // 按优先级排序
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
                        _ => a.id.cmp(&b.id), // 最后按ID排序
                    }
                }
                other => other,
            }
        });
        
        for todo in todos {
            println!("{}", todo);
        }
        
        println!("{}", "=".repeat(80));
        println!("总计: {} 个任务", self.todos.len());
    }
    
    pub fn search_todos(&self, keyword: &str) {
        let keyword_lower = keyword.to_lowercase();
        let matching_todos: Vec<&Todo> = self.todos
            .values()
            .filter(|todo| todo.description.to_lowercase().contains(&keyword_lower))
            .collect();
        
        if matching_todos.is_empty() {
            println!("🔍 没有找到包含 \"{}\" 的任务", keyword);
            return;
        }
        
        println!("🔍 搜索结果 (关键词: \"{}\"):", keyword);
        println!("{}", "=".repeat(80));
        
        for todo in matching_todos {
            println!("{}", todo);
        }
    }
    
    pub fn filter_todos_by_status(&self, completed: bool) {
        let filtered_todos: Vec<&Todo> = self.todos
            .values()
            .filter(|todo| todo.completed == completed)
            .collect();
        
        if filtered_todos.is_empty() {
            let status_text = if completed { "已完成" } else { "未完成" };
            println!("📋 没有{}的任务", status_text);
            return;
        }
        
        let status_text = if completed { "已完成" } else { "未完成" };
        println!("📋 {}的任务:", status_text);
        println!("{}", "=".repeat(80));
        
        for todo in filtered_todos {
            println!("{}", todo);
        }
    }
    
    pub fn filter_todos_by_priority(&self, priority: Priority) {
        let filtered_todos: Vec<&Todo> = self.todos
            .values()
            .filter(|todo| todo.priority == priority)
            .collect();
        
        if filtered_todos.is_empty() {
            println!("📋 没有{}优先级的任务", priority);
            return;
        }
        
        println!("📋 {}优先级的任务:", priority);
        println!("{}", "=".repeat(80));
        
        for todo in filtered_todos {
            println!("{}", todo);
        }
    }
    
    pub fn show_statistics(&self) {
        let total = self.todos.len();
        let completed = self.todos.values().filter(|todo| todo.completed).count();
        let pending = total - completed;
        
        let mut priority_stats = HashMap::new();
        priority_stats.insert(Priority::Urgent, 0);
        priority_stats.insert(Priority::High, 0);
        priority_stats.insert(Priority::Medium, 0);
        priority_stats.insert(Priority::Low, 0);
        
        for todo in self.todos.values() {
            if !todo.completed {
                *priority_stats.get_mut(&todo.priority).unwrap() += 1;
            }
        }
        
        println!("📊 待办事项统计:");
        println!("{}", "=".repeat(40));
        println!("总任务数: {}", total);
        println!("已完成: {} ({:.1}%)", completed, if total > 0 { completed as f64 / total as f64 * 100.0 } else { 0.0 });
        println!("未完成: {} ({:.1}%)", pending, if total > 0 { pending as f64 / total as f64 * 100.0 } else { 0.0 });
        println!();
        println!("按优先级分布 (仅未完成):");
        println!("  🔴 紧急: {} 个", priority_stats[&Priority::Urgent]);
        println!("  🟠 高: {} 个", priority_stats[&Priority::High]);
        println!("  🟡 中: {} 个", priority_stats[&Priority::Medium]);
        println!("  🟢 低: {} 个", priority_stats[&Priority::Low]);
        
        if total > 0 {
            let completion_rate = completed as f64 / total as f64 * 100.0;
            println!();
            match completion_rate {
                r if r >= 90.0 => println!("🎉 完成率很高！继续保持！"),
                r if r >= 70.0 => println!("👍 完成率不错，再接再厉！"),
                r if r >= 50.0 => println!("💪 完成率还行，继续努力！"),
                _ => println!("🔥 加油！还有很多任务需要完成！"),
            }
        }
    }
    
    pub fn clear_all(&mut self) {
        self.todos.clear();
        self.next_id = 1;
    }
    
    pub fn clear_completed(&mut self) -> usize {
        let initial_count = self.todos.len();
        self.todos.retain(|_, todo| !todo.completed);
        initial_count - self.todos.len()
    }
    
    pub fn save_to_file(&self) -> Result<(), Box<dyn std::error::Error>> {
        let todos_vec: Vec<&Todo> = self.todos.values().collect();
        self.storage.save(&TodosData {
            todos: todos_vec,
            next_id: self.next_id,
        })
    }
    
    pub fn load_from_file(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        let data: TodosData = self.storage.load()?;
        
        self.todos.clear();
        for todo in data.todos {
            self.todos.insert(todo.id, todo);
        }
        self.next_id = data.next_id;
        
        Ok(())
    }
    
    pub fn get_todo(&self, id: usize) -> Option<&Todo> {
        self.todos.get(&id)
    }
    
    pub fn get_all_todos(&self) -> Vec<&Todo> {
        self.todos.values().collect()
    }
    
    pub fn import_from_text(&mut self, text: &str) -> usize {
        let mut imported = 0;
        
        for line in text.lines() {
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            
            // 简单的文本导入格式：[优先级] 任务描述
            let (priority, description) = if line.starts_with('[') {
                if let Some(end_bracket) = line.find(']') {
                    let priority_str = &line[1..end_bracket].to_lowercase();
                    let priority = match priority_str {
                        "urgent" | "u" | "紧急" => Priority::Urgent,
                        "high" | "h" | "高" => Priority::High,
                        "medium" | "m" | "中" => Priority::Medium,
                        "low" | "l" | "低" => Priority::Low,
                        _ => Priority::Medium,
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
    
    pub fn export_to_text(&self) -> String {
        let mut result = String::new();
        let mut todos: Vec<&Todo> = self.todos.values().collect();
        todos.sort_by_key(|todo| todo.id);
        
        for todo in todos {
            let priority_str = match todo.priority {
                Priority::Urgent => "[紧急]",
                Priority::High => "[高]",
                Priority::Medium => "[中]",
                Priority::Low => "[低]",
            };
            
            let status = if todo.completed { "[已完成] " } else { "" };
            
            result.push_str(&format!("{}{} {}\n", status, priority_str, todo.description));
        }
        
        result
    }
}

#[derive(Serialize, Deserialize)]
struct TodosData {
    todos: Vec<Todo>,
    next_id: usize,
}

impl<'a> From<TodosData> for TodosData {
    fn from(data: TodosData) -> Self {
        data
    }
}

fn get_current_time() -> String {
    // 简化的时间格式
    // 在实际应用中建议使用 chrono 库
    use std::time::{SystemTime, UNIX_EPOCH};
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("时间错误");
    
    let timestamp = now.as_secs();
    
    // 简单的时间格式化
    format!("{}", timestamp)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_todo_creation() {
        let todo = Todo::new(1, "Test task".to_string(), Priority::Medium);
        
        assert_eq!(todo.id, 1);
        assert_eq!(todo.description, "Test task");
        assert!(!todo.completed);
        assert_eq!(todo.priority, Priority::Medium);
        assert!(todo.completed_at.is_none());
    }
    
    #[test]
    fn test_todo_completion() {
        let mut todo = Todo::new(1, "Test task".to_string(), Priority::Medium);
        
        todo.complete();
        
        assert!(todo.completed);
        assert!(todo.completed_at.is_some());
    }
    
    #[test]
    fn test_todo_reopen() {
        let mut todo = Todo::new(1, "Test task".to_string(), Priority::Medium);
        
        todo.complete();
        todo.reopen();
        
        assert!(!todo.completed);
        assert!(todo.completed_at.is_none());
    }
    
    #[test]
    fn test_manager_add_todo() {
        let mut manager = TodoManager::new();
        
        let id = manager.add_todo("Test task".to_string(), Priority::High);
        
        assert_eq!(id, 1);
        assert!(manager.get_todo(1).is_some());
        assert_eq!(manager.get_todo(1).unwrap().description, "Test task");
    }
    
    #[test]
    fn test_manager_complete_todo() {
        let mut manager = TodoManager::new();
        let id = manager.add_todo("Test task".to_string(), Priority::Medium);
        
        assert!(manager.complete_todo(id));
        assert!(manager.get_todo(id).unwrap().completed);
        
        assert!(!manager.complete_todo(999)); // 不存在的ID
    }
    
    #[test]
    fn test_manager_remove_todo() {
        let mut manager = TodoManager::new();
        let id = manager.add_todo("Test task".to_string(), Priority::Medium);
        
        assert!(manager.remove_todo(id));
        assert!(manager.get_todo(id).is_none());
        
        assert!(!manager.remove_todo(999)); // 不存在的ID
    }
    
    #[test]
    fn test_priority_display() {
        assert_eq!(format!("{}", Priority::Low), "🟢 低");
        assert_eq!(format!("{}", Priority::Medium), "🟡 中");
        assert_eq!(format!("{}", Priority::High), "🟠 高");
        assert_eq!(format!("{}", Priority::Urgent), "🔴 紧急");
    }
    
    #[test]
    fn test_import_export() {
        let mut manager = TodoManager::new();
        
        let text = "[高] 重要任务\n[低] 简单任务\n普通任务";
        let imported = manager.import_from_text(text);
        
        assert_eq!(imported, 3);
        assert_eq!(manager.todos.len(), 3);
        
        let exported = manager.export_to_text();
        assert!(exported.contains("重要任务"));
        assert!(exported.contains("简单任务"));
        assert!(exported.contains("普通任务"));
    }
}