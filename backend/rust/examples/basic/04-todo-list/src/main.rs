mod todo;
mod storage;

use std::env;
use std::io;
use todo::{Todo, TodoManager, Priority};

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut manager = TodoManager::new();
    
    // 尝试从文件加载数据
    if let Err(e) = manager.load_from_file() {
        eprintln!("警告: 无法加载待办事项文件: {}", e);
        eprintln!("将创建新的待办事项列表");
    }
    
    if args.len() < 2 {
        run_interactive_mode(&mut manager);
    } else {
        run_command_mode(&mut manager, &args);
    }
}

fn run_command_mode(manager: &mut TodoManager, args: &[String]) {
    match args[1].as_str() {
        "add" => {
            if args.len() < 3 {
                eprintln!("用法: {} add <任务描述> [优先级]", args[0]);
                eprintln!("优先级: low, medium, high, urgent (默认: medium)");
                return;
            }
            
            let description = args[2..].join(" ");
            let priority = if args.len() > 3 {
                match args.last().unwrap().as_str() {
                    "low" | "l" => Priority::Low,
                    "medium" | "m" => Priority::Medium,
                    "high" | "h" => Priority::High,
                    "urgent" | "u" => Priority::Urgent,
                    _ => Priority::Medium,
                }
            } else {
                Priority::Medium
            };
            
            manager.add_todo(description, priority);
            println!("✅ 任务添加成功！");
        },
        "list" | "ls" => {
            manager.list_todos();
        },
        "complete" | "done" => {
            if args.len() < 3 {
                eprintln!("用法: {} complete <任务ID>", args[0]);
                return;
            }
            
            match args[2].parse::<usize>() {
                Ok(id) => {
                    if manager.complete_todo(id) {
                        println!("✅ 任务已完成！");
                    } else {
                        eprintln!("❌ 找不到指定的任务ID");
                    }
                },
                Err(_) => eprintln!("❌ 任务ID必须是数字"),
            }
        },
        "remove" | "rm" => {
            if args.len() < 3 {
                eprintln!("用法: {} remove <任务ID>", args[0]);
                return;
            }
            
            match args[2].parse::<usize>() {
                Ok(id) => {
                    if manager.remove_todo(id) {
                        println!("✅ 任务已删除！");
                    } else {
                        eprintln!("❌ 找不到指定的任务ID");
                    }
                },
                Err(_) => eprintln!("❌ 任务ID必须是数字"),
            }
        },
        "edit" => {
            if args.len() < 4 {
                eprintln!("用法: {} edit <任务ID> <新描述>", args[0]);
                return;
            }
            
            match args[2].parse::<usize>() {
                Ok(id) => {
                    let new_description = args[3..].join(" ");
                    if manager.edit_todo(id, new_description) {
                        println!("✅ 任务已更新！");
                    } else {
                        eprintln!("❌ 找不到指定的任务ID");
                    }
                },
                Err(_) => eprintln!("❌ 任务ID必须是数字"),
            }
        },
        "priority" => {
            if args.len() < 4 {
                eprintln!("用法: {} priority <任务ID> <优先级>", args[0]);
                eprintln!("优先级: low, medium, high, urgent");
                return;
            }
            
            match args[2].parse::<usize>() {
                Ok(id) => {
                    let priority = match args[3].as_str() {
                        "low" | "l" => Priority::Low,
                        "medium" | "m" => Priority::Medium,
                        "high" | "h" => Priority::High,
                        "urgent" | "u" => Priority::Urgent,
                        _ => {
                            eprintln!("❌ 无效的优先级");
                            return;
                        }
                    };
                    
                    if manager.set_priority(id, priority) {
                        println!("✅ 优先级已更新！");
                    } else {
                        eprintln!("❌ 找不到指定的任务ID");
                    }
                },
                Err(_) => eprintln!("❌ 任务ID必须是数字"),
            }
        },
        "search" => {
            if args.len() < 3 {
                eprintln!("用法: {} search <关键词>", args[0]);
                return;
            }
            
            let keyword = args[2..].join(" ");
            manager.search_todos(&keyword);
        },
        "filter" => {
            if args.len() < 3 {
                eprintln!("用法: {} filter <类型>", args[0]);
                eprintln!("类型: pending, completed, priority:<level>");
                return;
            }
            
            match args[2].as_str() {
                "pending" => manager.filter_todos_by_status(false),
                "completed" => manager.filter_todos_by_status(true),
                priority_filter if priority_filter.starts_with("priority:") => {
                    let priority_str = &priority_filter[9..];
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
        "stats" => {
            manager.show_statistics();
        },
        "clear" => {
            print!("确定要清空所有待办事项吗? (y/N): ");
            io::Write::flush(&mut io::stdout()).unwrap();
            
            let mut input = String::new();
            io::stdin().read_line(&mut input).unwrap();
            
            if input.trim().to_lowercase().starts_with('y') {
                manager.clear_all();
                println!("✅ 所有待办事项已清空！");
            } else {
                println!("操作已取消");
            }
        },
        "help" | "-h" | "--help" => {
            show_help(&args[0]);
        },
        _ => {
            eprintln!("未知命令: {}", args[1]);
            show_help(&args[0]);
        }
    }
    
    // 保存到文件
    if let Err(e) = manager.save_to_file() {
        eprintln!("警告: 无法保存待办事项文件: {}", e);
    }
}

fn run_interactive_mode(manager: &mut TodoManager) {
    println!("📝 待办事项管理器");
    println!("输入 'help' 查看命令，输入 'quit' 退出");
    println!("{}", "=".repeat(50));
    
    loop {
        print!("todo> ");
        io::Write::flush(&mut io::stdout()).unwrap();
        
        let mut input = String::new();
        match io::stdin().read_line(&mut input) {
            Ok(_) => {
                let input = input.trim();
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
                        break;
                    },
                    "add" => {
                        if parts.len() < 2 {
                            println!("用法: add <任务描述> [优先级]");
                            continue;
                        }
                        
                        let description = parts[1..].join(" ");
                        let priority = Priority::Medium; // 默认优先级
                        
                        manager.add_todo(description, priority);
                        println!("✅ 任务添加成功！");
                    },
                    "list" | "ls" => {
                        manager.list_todos();
                    },
                    "complete" | "done" => {
                        if parts.len() < 2 {
                            println!("用法: complete <任务ID>");
                            continue;
                        }
                        
                        match parts[1].parse::<usize>() {
                            Ok(id) => {
                                if manager.complete_todo(id) {
                                    println!("✅ 任务已完成！");
                                } else {
                                    println!("❌ 找不到指定的任务ID");
                                }
                            },
                            Err(_) => println!("❌ 任务ID必须是数字"),
                        }
                    },
                    "remove" | "rm" => {
                        if parts.len() < 2 {
                            println!("用法: remove <任务ID>");
                            continue;
                        }
                        
                        match parts[1].parse::<usize>() {
                            Ok(id) => {
                                if manager.remove_todo(id) {
                                    println!("✅ 任务已删除！");
                                } else {
                                    println!("❌ 找不到指定的任务ID");
                                }
                            },
                            Err(_) => println!("❌ 任务ID必须是数字"),
                        }
                    },
                    "edit" => {
                        if parts.len() < 3 {
                            println!("用法: edit <任务ID> <新描述>");
                            continue;
                        }
                        
                        match parts[1].parse::<usize>() {
                            Ok(id) => {
                                let new_description = parts[2..].join(" ");
                                if manager.edit_todo(id, new_description) {
                                    println!("✅ 任务已更新！");
                                } else {
                                    println!("❌ 找不到指定的任务ID");
                                }
                            },
                            Err(_) => println!("❌ 任务ID必须是数字"),
                        }
                    },
                    "priority" => {
                        if parts.len() < 3 {
                            println!("用法: priority <任务ID> <优先级>");
                            println!("优先级: low, medium, high, urgent");
                            continue;
                        }
                        
                        match parts[1].parse::<usize>() {
                            Ok(id) => {
                                let priority = match parts[2] {
                                    "low" | "l" => Priority::Low,
                                    "medium" | "m" => Priority::Medium,
                                    "high" | "h" => Priority::High,
                                    "urgent" | "u" => Priority::Urgent,
                                    _ => {
                                        println!("❌ 无效的优先级");
                                        continue;
                                    }
                                };
                                
                                if manager.set_priority(id, priority) {
                                    println!("✅ 优先级已更新！");
                                } else {
                                    println!("❌ 找不到指定的任务ID");
                                }
                            },
                            Err(_) => println!("❌ 任务ID必须是数字"),
                        }
                    },
                    "search" => {
                        if parts.len() < 2 {
                            println!("用法: search <关键词>");
                            continue;
                        }
                        
                        let keyword = parts[1..].join(" ");
                        manager.search_todos(&keyword);
                    },
                    "stats" => {
                        manager.show_statistics();
                    },
                    "clear" => {
                        print!("确定要清空所有待办事项吗? (y/N): ");
                        io::Write::flush(&mut io::stdout()).unwrap();
                        
                        let mut confirm = String::new();
                        io::stdin().read_line(&mut confirm).unwrap();
                        
                        if confirm.trim().to_lowercase().starts_with('y') {
                            manager.clear_all();
                            println!("✅ 所有待办事项已清空！");
                        } else {
                            println!("操作已取消");
                        }
                    },
                    "help" | "h" => {
                        show_interactive_help();
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

fn show_help(program: &str) {
    println!("📝 待办事项管理器 v0.1.0");
    println!();
    println!("用法: {} [命令] [参数...]", program);
    println!();
    println!("命令:");
    println!("  add <任务> [优先级]         添加新任务");
    println!("  list                        列出所有任务");
    println!("  complete <ID>               标记任务为已完成");
    println!("  remove <ID>                 删除任务");
    println!("  edit <ID> <新描述>          编辑任务描述");
    println!("  priority <ID> <级别>        设置任务优先级");
    println!("  search <关键词>             搜索任务");
    println!("  filter <类型>               过滤任务");
    println!("  stats                       显示统计信息");
    println!("  clear                       清空所有任务");
    println!("  help                        显示此帮助");
    println!();
    println!("优先级: low, medium, high, urgent");
    println!("过滤类型: pending, completed, priority:<level>");
    println!();
    println!("示例:");
    println!("  {} add \"学习Rust\" high", program);
    println!("  {} complete 1", program);
    println!("  {} filter priority:urgent", program);
    println!();
    println!("不带参数运行进入交互模式");
}

fn show_interactive_help() {
    println!();
    println!("🆘 交互模式命令帮助:");
    println!("{}", "=".repeat(40));
    println!("  add <任务> [优先级]     添加新任务");
    println!("  list, ls               列出所有任务");
    println!("  complete <ID>, done    标记任务完成");
    println!("  remove <ID>, rm        删除任务");
    println!("  edit <ID> <新描述>     编辑任务");
    println!("  priority <ID> <级别>   设置优先级");
    println!("  search <关键词>        搜索任务");
    println!("  stats                  显示统计");
    println!("  clear                  清空所有任务");
    println!("  help, h                显示此帮助");
    println!("  quit, exit, q          退出程序");
    println!();
}