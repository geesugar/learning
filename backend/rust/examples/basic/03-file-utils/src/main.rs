use std::env;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};

mod file_operations;
mod utils;

use file_operations::FileManager;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        show_help(&args[0]);
        return;
    }
    
    let manager = FileManager::new();
    
    match args[1].as_str() {
        "copy" | "cp" => {
            if args.len() < 4 {
                eprintln!("错误: copy 命令需要源文件和目标路径");
                eprintln!("用法: {} copy <源文件> <目标路径>", args[0]);
                return;
            }
            handle_result(manager.copy(&args[2], &args[3]));
        },
        "move" | "mv" => {
            if args.len() < 4 {
                eprintln!("错误: move 命令需要源文件和目标路径");
                eprintln!("用法: {} move <源文件> <目标路径>", args[0]);
                return;
            }
            handle_result(manager.move_file(&args[2], &args[3]));
        },
        "delete" | "del" | "rm" => {
            if args.len() < 3 {
                eprintln!("错误: delete 命令需要文件路径");
                eprintln!("用法: {} delete <文件路径>", args[0]);
                return;
            }
            handle_result(manager.delete(&args[2]));
        },
        "list" | "ls" => {
            let path = if args.len() > 2 { &args[2] } else { "." };
            handle_result(manager.list(path));
        },
        "info" => {
            if args.len() < 3 {
                eprintln!("错误: info 命令需要文件路径");
                eprintln!("用法: {} info <文件路径>", args[0]);
                return;
            }
            handle_result(manager.info(&args[2]));
        },
        "create" => {
            if args.len() < 3 {
                eprintln!("错误: create 命令需要文件路径");
                eprintln!("用法: {} create <文件路径>", args[0]);
                return;
            }
            handle_result(manager.create(&args[2]));
        },
        "mkdir" => {
            if args.len() < 3 {
                eprintln!("错误: mkdir 命令需要目录路径");
                eprintln!("用法: {} mkdir <目录路径>", args[0]);
                return;
            }
            handle_result(manager.create_dir(&args[2]));
        },
        "find" => {
            if args.len() < 4 {
                eprintln!("错误: find 命令需要搜索目录和文件名");
                eprintln!("用法: {} find <目录> <文件名模式>", args[0]);
                return;
            }
            handle_result(manager.find(&args[2], &args[3]));
        },
        "size" => {
            if args.len() < 3 {
                eprintln!("错误: size 命令需要路径");
                eprintln!("用法: {} size <路径>", args[0]);
                return;
            }
            handle_result(manager.calculate_size(&args[2]));
        },
        "help" | "-h" | "--help" => {
            show_help(&args[0]);
        },
        _ => {
            eprintln!("未知命令: {}", args[1]);
            show_help(&args[0]);
        }
    }
}

fn handle_result<T>(result: Result<T, Box<dyn std::error::Error>>) {
    match result {
        Ok(_) => {},
        Err(e) => eprintln!("❌ 错误: {}", e),
    }
}

fn show_help(program: &str) {
    println!("📁 文件操作工具 v0.1.0");
    println!();
    println!("用法: {} <命令> [参数...]", program);
    println!();
    println!("可用命令:");
    println!("  copy <源文件> <目标路径>     复制文件");
    println!("  move <源文件> <目标路径>     移动/重命名文件");
    println!("  delete <文件路径>           删除文件");
    println!("  list [目录]                 列出目录内容 (默认当前目录)");
    println!("  info <文件路径>             显示文件信息");
    println!("  create <文件路径>           创建空文件");
    println!("  mkdir <目录路径>            创建目录");
    println!("  find <目录> <文件名模式>    查找文件");
    println!("  size <路径>                 计算文件/目录大小");
    println!("  help                        显示此帮助信息");
    println!();
    println!("别名:");
    println!("  cp = copy, mv = move, rm = delete, ls = list");
    println!();
    println!("示例:");
    println!("  {} copy file.txt backup/", program);
    println!("  {} move old_name.txt new_name.txt", program);
    println!("  {} list /home/user", program);
    println!("  {} find . \"*.rs\"", program);
}