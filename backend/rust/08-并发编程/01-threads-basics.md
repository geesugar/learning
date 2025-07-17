# 01-线程基础

## 线程概述

线程是程序执行的最小单位，允许程序同时执行多个任务。Rust 提供了安全的线程创建和管理机制，通过所有权系统在编译时防止数据竞争。

## 创建线程

### 基本线程创建

```rust
use std::thread;
use std::time::Duration;

fn main() {
    // 创建一个新线程
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("Hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    // 主线程执行
    for i in 1..5 {
        println!("Hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }

    // 等待子线程完成
    handle.join().unwrap();
    println!("所有线程执行完毕");
}
```

### 线程与闭包

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    // 使用 move 关键字获取所有权
    let handle = thread::spawn(move || {
        println!("Here's a vector: {:?}", v);
    });

    // v 的所有权已经移动到线程中，这里不能再使用 v
    // println!("{:?}", v); // 编译错误！

    handle.join().unwrap();
}
```

### 线程返回值

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        // 线程计算并返回结果
        let mut sum = 0;
        for i in 1..=100 {
            sum += i;
        }
        sum
    });

    // 获取线程的返回值
    let result = handle.join().unwrap();
    println!("线程计算结果: {}", result);
}
```

## 线程构建器

### 自定义线程属性

```rust
use std::thread;

fn main() {
    let builder = thread::Builder::new()
        .name("worker-thread".into())
        .stack_size(4 * 1024 * 1024); // 4MB 栈大小

    let handle = builder.spawn(|| {
        println!("线程名称: {:?}", thread::current().name());
        println!("线程 ID: {:?}", thread::current().id());
        
        // 执行一些工作
        let result = expensive_computation();
        result
    }).unwrap();

    let result = handle.join().unwrap();
    println!("计算结果: {}", result);
}

fn expensive_computation() -> i32 {
    // 模拟耗时计算
    thread::sleep(std::time::Duration::from_millis(100));
    42
}
```

### 批量创建线程

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
    let mut handles = vec![];

    // 创建多个工作线程
    for i in 0..5 {
        let tx_clone = tx.clone();
        
        let handle = thread::spawn(move || {
            let thread_id = i;
            let result = thread_id * thread_id;
            
            println!("线程 {} 计算结果: {}", thread_id, result);
            tx_clone.send((thread_id, result)).unwrap();
        });
        
        handles.push(handle);
    }

    // 关闭发送端
    drop(tx);

    // 收集所有结果
    let mut results = vec![];
    for (thread_id, result) in rx {
        results.push((thread_id, result));
    }

    // 等待所有线程完成
    for handle in handles {
        handle.join().unwrap();
    }

    println!("所有结果: {:?}", results);
}
```

## 线程本地存储

### thread_local! 宏

```rust
use std::cell::RefCell;
use std::thread;

thread_local! {
    static COUNTER: RefCell<u32> = RefCell::new(1);
}

fn main() {
    // 在主线程中访问
    COUNTER.with(|c| {
        *c.borrow_mut() = 2;
        println!("主线程计数器: {}", *c.borrow());
    });

    let handle = thread::spawn(|| {
        // 在新线程中访问（独立的副本）
        COUNTER.with(|c| {
            *c.borrow_mut() = 10;
            println!("子线程计数器: {}", *c.borrow());
        });
    });

    handle.join().unwrap();

    // 主线程的值没有被子线程影响
    COUNTER.with(|c| {
        println!("主线程最终计数器: {}", *c.borrow());
    });
}
```

### 线程本地变量的实际应用

```rust
use std::cell::RefCell;
use std::thread;
use std::time::{Duration, Instant};

thread_local! {
    static THREAD_STATS: RefCell<ThreadStats> = RefCell::new(ThreadStats::new());
}

#[derive(Debug)]
struct ThreadStats {
    operations: u32,
    start_time: Instant,
}

impl ThreadStats {
    fn new() -> Self {
        ThreadStats {
            operations: 0,
            start_time: Instant::now(),
        }
    }

    fn increment(&mut self) {
        self.operations += 1;
    }

    fn elapsed(&self) -> Duration {
        self.start_time.elapsed()
    }
}

fn do_work() {
    THREAD_STATS.with(|stats| {
        stats.borrow_mut().increment();
    });
    
    // 模拟工作
    thread::sleep(Duration::from_millis(10));
}

fn print_stats() {
    THREAD_STATS.with(|stats| {
        let stats = stats.borrow();
        println!(
            "线程 {:?}: {} 次操作，耗时 {:?}",
            thread::current().id(),
            stats.operations,
            stats.elapsed()
        );
    });
}

fn main() {
    let mut handles = vec![];

    for i in 0..3 {
        let handle = thread::spawn(move || {
            for _ in 0..5 {
                do_work();
            }
            print_stats();
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 线程同步和协调

### 线程屏障

```rust
use std::sync::{Arc, Barrier};
use std::thread;
use std::time::Duration;

fn main() {
    let n = 3;
    let barrier = Arc::new(Barrier::new(n));
    let mut handles = vec![];

    for i in 0..n {
        let barrier_clone = Arc::clone(&barrier);
        
        let handle = thread::spawn(move || {
            println!("线程 {} 开始工作", i);
            
            // 模拟不同的工作时间
            thread::sleep(Duration::from_millis(i as u64 * 100));
            
            println!("线程 {} 到达屏障", i);
            barrier_clone.wait();
            
            println!("线程 {} 继续执行", i);
        });
        
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("所有线程已完成");
}
```

### 一次性初始化

```rust
use std::sync::Once;
use std::thread;

static INIT: Once = Once::new();
static mut GLOBAL_DATA: Option<String> = None;

fn get_global_data() -> &'static str {
    unsafe {
        INIT.call_once(|| {
            GLOBAL_DATA = Some("初始化的全局数据".to_string());
            println!("全局数据已初始化");
        });
        
        GLOBAL_DATA.as_ref().unwrap()
    }
}

fn main() {
    let mut handles = vec![];

    for i in 0..5 {
        let handle = thread::spawn(move || {
            let data = get_global_data();
            println!("线程 {} 获取到数据: {}", i, data);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 线程错误处理

### 线程恐慌处理

```rust
use std::thread;
use std::panic;

fn main() {
    let handle = thread::spawn(|| {
        println!("线程开始执行");
        
        // 设置恐慌钩子
        panic::set_hook(Box::new(|panic_info| {
            println!("线程发生恐慌: {:?}", panic_info);
        }));
        
        // 故意触发恐慌
        panic!("这是一个测试恐慌");
    });

    match handle.join() {
        Ok(_) => println!("线程正常完成"),
        Err(e) => {
            println!("线程发生恐慌: {:?}", e);
            
            // 尝试获取恐慌消息
            if let Some(s) = e.downcast_ref::<&str>() {
                println!("恐慌消息: {}", s);
            } else if let Some(s) = e.downcast_ref::<String>() {
                println!("恐慌消息: {}", s);
            }
        }
    }
    
    println!("主线程继续执行");
}
```

### 优雅的错误传播

```rust
use std::thread;
use std::sync::mpsc;

#[derive(Debug)]
enum WorkerError {
    InvalidInput(String),
    ProcessingFailed(String),
}

fn worker_function(input: i32) -> Result<i32, WorkerError> {
    if input < 0 {
        return Err(WorkerError::InvalidInput("输入不能为负数".to_string()));
    }
    
    if input > 100 {
        return Err(WorkerError::ProcessingFailed("输入过大".to_string()));
    }
    
    Ok(input * 2)
}

fn main() {
    let (tx, rx) = mpsc::channel();
    let inputs = vec![10, -5, 50, 150, 25];
    
    let handle = thread::spawn(move || {
        for input in inputs {
            match worker_function(input) {
                Ok(result) => {
                    println!("处理成功: {} -> {}", input, result);
                    tx.send(Ok(result)).unwrap();
                }
                Err(e) => {
                    println!("处理失败: {} -> {:?}", input, e);
                    tx.send(Err(e)).unwrap();
                }
            }
        }
    });

    // 接收结果
    while let Ok(result) = rx.recv() {
        match result {
            Ok(value) => println!("收到结果: {}", value),
            Err(error) => println!("收到错误: {:?}", error),
        }
    }

    handle.join().unwrap();
}
```

## 线程池实现

### 简单的线程池

```rust
use std::sync::{Arc, Mutex, mpsc};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));
        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.send(job).unwrap();
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let job = receiver.lock().unwrap().recv().unwrap();
            println!("Worker {} 正在执行任务", id);
            job();
        });

        Worker { id, thread }
    }
}

fn main() {
    let pool = ThreadPool::new(4);

    for i in 0..8 {
        pool.execute(move || {
            println!("任务 {} 正在执行", i);
            thread::sleep(std::time::Duration::from_millis(1000));
            println!("任务 {} 完成", i);
        });
    }

    // 让主线程等待一段时间
    thread::sleep(std::time::Duration::from_millis(5000));
}
```

## 性能监控和调试

### 线程性能统计

```rust
use std::thread;
use std::time::{Duration, Instant};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone)]
struct PerformanceStats {
    thread_count: usize,
    total_execution_time: Duration,
    average_execution_time: Duration,
}

fn monitor_thread_performance() {
    let stats = Arc::new(Mutex::new(Vec::<Duration>::new()));
    let mut handles = vec![];

    for i in 0..5 {
        let stats_clone = Arc::clone(&stats);
        
        let handle = thread::spawn(move || {
            let start = Instant::now();
            
            // 模拟工作
            thread::sleep(Duration::from_millis(100 * (i + 1)));
            
            let duration = start.elapsed();
            stats_clone.lock().unwrap().push(duration);
            
            println!("线程 {} 执行时间: {:?}", i, duration);
        });
        
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let stats = stats.lock().unwrap();
    let total_time: Duration = stats.iter().sum();
    let avg_time = total_time / stats.len() as u32;

    println!("性能统计:");
    println!("  线程数量: {}", stats.len());
    println!("  总执行时间: {:?}", total_time);
    println!("  平均执行时间: {:?}", avg_time);
}

fn main() {
    monitor_thread_performance();
}
```

## 最佳实践

### 1. 避免过度使用线程

```rust
use std::thread;

fn main() {
    // 不好的做法：为每个小任务创建线程
    let mut handles = vec![];
    for i in 0..1000 {
        let handle = thread::spawn(move || i * 2);
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }

    // 更好的做法：使用线程池或批处理
    let chunk_size = 100;
    let mut handles = vec![];
    
    for chunk_start in (0..1000).step_by(chunk_size) {
        let handle = thread::spawn(move || {
            let mut results = vec![];
            for i in chunk_start..std::cmp::min(chunk_start + chunk_size, 1000) {
                results.push(i * 2);
            }
            results
        });
        handles.push(handle);
    }
    
    for handle in handles {
        let _results = handle.join().unwrap();
    }
}
```

### 2. 合理使用线程名称

```rust
use std::thread;

fn main() {
    let handle = thread::Builder::new()
        .name("data-processor".to_string())
        .spawn(|| {
            println!("当前线程: {:?}", thread::current().name());
            // 执行数据处理工作
        })
        .unwrap();

    handle.join().unwrap();
}
```

### 3. 错误处理和资源清理

```rust
use std::thread;
use std::sync::{Arc, Mutex};

struct SharedResource {
    data: Vec<i32>,
}

impl Drop for SharedResource {
    fn drop(&mut self) {
        println!("资源被清理，数据长度: {}", self.data.len());
    }
}

fn main() {
    let resource = Arc::new(Mutex::new(SharedResource {
        data: vec![1, 2, 3, 4, 5],
    }));

    let resource_clone = Arc::clone(&resource);
    let handle = thread::spawn(move || {
        let mut resource = resource_clone.lock().unwrap();
        resource.data.push(6);
        println!("线程修改了资源");
        // 锁会在作用域结束时自动释放
    });

    handle.join().unwrap();
    
    // 资源会在所有引用被drop时清理
}
```

## 练习

1. 实现一个并发的文件处理器，能够同时处理多个文件
2. 创建一个多线程的数据分析工具
3. 实现一个线程安全的计数器，支持多个线程同时递增

## 下一步

学习完线程基础后，继续学习 [02-消息传递](02-message-passing.md)。