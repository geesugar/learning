// Result 和 Ok/Err 的详细示例

// 基本的 Result 使用
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("不能除以零".to_string())  // Err 构造错误结果
    } else {
        Ok(a / b)                     // Ok 构造成功结果
    }
}

// 不同错误类型的示例
#[derive(Debug)]
enum MathError {
    DivisionByZero,
    NegativeSquareRoot,
}

fn safe_sqrt(x: f64) -> Result<f64, MathError> {
    if x < 0.0 {
        Err(MathError::NegativeSquareRoot)  // 返回自定义错误
    } else {
        Ok(x.sqrt())                        // 返回成功结果
    }
}

fn safe_divide(a: f64, b: f64) -> Result<f64, MathError> {
    if b == 0.0 {
        Err(MathError::DivisionByZero)
    } else {
        Ok(a / b)
    }
}

fn main() {
    println!("=== Result, Ok, Err 示例 ===\n");
    
    // 示例 1: 基本的 Result 处理
    println!("1. 基本除法示例:");
    let results = vec![
        divide(10.0, 2.0),
        divide(10.0, 0.0),
        divide(15.0, 3.0),
    ];
    
    for (i, result) in results.iter().enumerate() {
        match result {
            Ok(value) => println!("  结果 {}: 成功 = {}", i + 1, value),
            Err(error) => println!("  结果 {}: 错误 = {}", i + 1, error),
        }
    }
    
    // 示例 2: 不同的处理方式
    println!("\n2. 不同的 Result 处理方式:");
    
    // 方式1: match
    let result1 = divide(20.0, 4.0);
    match result1 {
        Ok(val) => println!("  match 方式: {}", val),
        Err(err) => println!("  match 错误: {}", err),
    }
    
    // 方式2: if let
    let result2 = divide(10.0, 0.0);
    if let Ok(val) = result2 {
        println!("  if let 成功: {}", val);
    } else if let Err(err) = result2 {
        println!("  if let 错误: {}", err);
    }
    
    // 方式3: unwrap_or
    let result3 = divide(12.0, 3.0).unwrap_or(-1.0);
    println!("  unwrap_or 结果: {}", result3);
    
    // 示例 3: 自定义错误类型
    println!("\n3. 自定义错误类型示例:");
    let math_results = vec![
        safe_sqrt(9.0),
        safe_sqrt(-4.0),
        safe_divide(10.0, 2.0),
        safe_divide(5.0, 0.0),
    ];
    
    for (i, result) in math_results.iter().enumerate() {
        match result {
            Ok(value) => println!("  操作 {}: 成功 = {:.2}", i + 1, value),
            Err(MathError::DivisionByZero) => println!("  操作 {}: 除零错误", i + 1),
            Err(MathError::NegativeSquareRoot) => println!("  操作 {}: 负数开方错误", i + 1),
        }
    }
    
    // 示例 4: Result 的链式操作
    println!("\n4. Result 链式操作:");
    
    let chained_result = safe_divide(20.0, 4.0)
        .and_then(|x| safe_sqrt(x))
        .and_then(|x| safe_divide(x, 2.0));
    
    match chained_result {
        Ok(final_value) => println!("  链式计算结果: {:.2}", final_value),
        Err(error) => println!("  链式计算错误: {:?}", error),
    }
    
    // 示例 5: 展示 Ok 和 Err 的类型
    println!("\n5. Ok 和 Err 的类型信息:");
    
    let success: Result<i32, String> = Ok(42);
    let failure: Result<i32, String> = Err("出错了".to_string());
    
    println!("  success 的类型: Result<i32, String>");
    println!("  success 的值: {:?}", success);
    println!("  failure 的类型: Result<i32, String>");
    println!("  failure 的值: {:?}", failure);
    
    // 示例 6: Result 的实用方法
    println!("\n6. Result 的实用方法:");
    
    let good_result: Result<i32, &str> = Ok(100);
    let bad_result: Result<i32, &str> = Err("错误");
    
    println!("  is_ok(): {} / {}", good_result.is_ok(), bad_result.is_ok());
    println!("  is_err(): {} / {}", good_result.is_err(), bad_result.is_err());
    
    if let Ok(val) = good_result {
        println!("  unwrap() 成功值: {}", val);
    }
    
    let default_val = bad_result.unwrap_or(0);
    println!("  unwrap_or() 默认值: {}", default_val);
}

// 额外示例：Result 在文件操作中的应用
fn read_file_example() -> Result<String, std::io::Error> {
    // 这会返回 Result<String, std::io::Error>
    std::fs::read_to_string("example.txt")
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_ok_construction() {
        let result: Result<i32, String> = Ok(42);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }
    
    #[test]
    fn test_err_construction() {
        let result: Result<i32, String> = Err("error".to_string());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "error");
    }
    
    #[test]
    fn test_divide_function() {
        assert_eq!(divide(10.0, 2.0), Ok(5.0));
        assert!(divide(10.0, 0.0).is_err());
    }
} 