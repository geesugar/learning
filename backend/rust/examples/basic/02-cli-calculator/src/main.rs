use std::io;

#[derive(Debug)]
enum Operation {
    Add,
    Subtract,
    Multiply,
    Divide,
}

#[derive(Debug)]
enum CalculatorError {
    InvalidInput,
    DivisionByZero,
    InvalidOperation,
}

impl std::fmt::Display for CalculatorError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CalculatorError::InvalidInput => write!(f, "输入格式错误，请输入数字"),
            CalculatorError::DivisionByZero => write!(f, "错误：不能除以零"),
            CalculatorError::InvalidOperation => write!(f, "不支持的运算符"),
        }
    }
}

struct Calculator;

impl Calculator {
    fn new() -> Self {
        Calculator
    }
    
    fn calculate(&self, a: f64, b: f64, op: Operation) -> Result<f64, CalculatorError> {
        match op {
            Operation::Add => Ok(a + b),
            Operation::Subtract => Ok(a - b),
            Operation::Multiply => Ok(a * b),
            Operation::Divide => {
                if b == 0.0 {
                    Err(CalculatorError::DivisionByZero)
                } else {
                    Ok(a / b)
                }
            }
        }
    }
    
    fn parse_operation(&self, input: &str) -> Result<Operation, CalculatorError> {
        match input.trim() {
            "+" | "add" | "加" => Ok(Operation::Add),
            "-" | "subtract" | "减" => Ok(Operation::Subtract),
            "*" | "multiply" | "乘" => Ok(Operation::Multiply),
            "/" | "divide" | "除" => Ok(Operation::Divide),
            _ => Err(CalculatorError::InvalidOperation),
        }
    }
    
    fn parse_number(&self, input: &str) -> Result<f64, CalculatorError> {
        input.trim().parse::<f64>()
            .map_err(|_| CalculatorError::InvalidInput)
    }
    
    fn run_interactive_mode(&self) {
        println!("🧮 命令行计算器");
        println!("支持的运算：加法(+)、减法(-)、乘法(*)、除法(/)");
        println!("输入 'quit' 或 'exit' 退出程序");
        println!("输入 'help' 查看帮助");
        println!("{}", "=".repeat(40));
        
        loop {
            println!("\n请输入第一个数字:");
            let num1 = match self.read_input() {
                Ok(input) => {
                    if self.should_quit(&input) {
                        break;
                    }
                    if self.should_show_help(&input) {
                        self.show_help();
                        continue;
                    }
                    match self.parse_number(&input) {
                        Ok(n) => n,
                        Err(e) => {
                            println!("❌ {}", e);
                            continue;
                        }
                    }
                },
                Err(_) => continue,
            };
            
            println!("请输入运算符 (+, -, *, /):");
            let operation = match self.read_input() {
                Ok(input) => {
                    if self.should_quit(&input) {
                        break;
                    }
                    match self.parse_operation(&input) {
                        Ok(op) => op,
                        Err(e) => {
                            println!("❌ {}", e);
                            continue;
                        }
                    }
                },
                Err(_) => continue,
            };
            
            println!("请输入第二个数字:");
            let num2 = match self.read_input() {
                Ok(input) => {
                    if self.should_quit(&input) {
                        break;
                    }
                    match self.parse_number(&input) {
                        Ok(n) => n,
                        Err(e) => {
                            println!("❌ {}", e);
                            continue;
                        }
                    }
                },
                Err(_) => continue,
            };
            
            match self.calculate(num1, num2, operation) {
                Ok(result) => {
                    println!("✅ 结果: {} {} {} = {}", 
                        num1, 
                        self.operation_symbol(&operation), 
                        num2, 
                        result
                    );
                    
                    // 提供一些有趣的额外信息
                    if result.fract() == 0.0 && result.abs() > 1.0 {
                        if self.is_perfect_square(result as i64) {
                            println!("💡 有趣的发现：{} 是一个完全平方数", result);
                        }
                        if self.is_prime(result as i64) {
                            println!("💡 有趣的发现：{} 是一个质数", result);
                        }
                    }
                },
                Err(e) => println!("❌ {}", e),
            }
        }
        
        println!("👋 感谢使用计算器，再见！");
    }
    
    fn read_input(&self) -> Result<String, io::Error> {
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        Ok(input)
    }
    
    fn should_quit(&self, input: &str) -> bool {
        matches!(input.trim().to_lowercase().as_str(), "quit" | "exit" | "q" | "退出")
    }
    
    fn should_show_help(&self, input: &str) -> bool {
        matches!(input.trim().to_lowercase().as_str(), "help" | "h" | "帮助")
    }
    
    fn show_help(&self) {
        println!("\n📖 帮助信息:");
        println!("• 支持的运算符：");
        println!("  + (add, 加) - 加法");
        println!("  - (subtract, 减) - 减法");
        println!("  * (multiply, 乘) - 乘法");
        println!("  / (divide, 除) - 除法");
        println!("• 支持小数和负数");
        println!("• 输入 'quit' 或 'exit' 退出");
        println!("• 输入 'help' 查看此帮助");
    }
    
    fn operation_symbol(&self, op: &Operation) -> &'static str {
        match op {
            Operation::Add => "+",
            Operation::Subtract => "-",
            Operation::Multiply => "*",
            Operation::Divide => "/",
        }
    }
    
    // 检查是否为完全平方数
    fn is_perfect_square(&self, n: i64) -> bool {
        if n < 0 { return false; }
        let sqrt = (n as f64).sqrt() as i64;
        sqrt * sqrt == n
    }
    
    // 简单的质数检查
    fn is_prime(&self, n: i64) -> bool {
        if n < 2 { return false; }
        if n == 2 { return true; }
        if n % 2 == 0 { return false; }
        
        let limit = (n as f64).sqrt() as i64;
        for i in (3..=limit).step_by(2) {
            if n % i == 0 {
                return false;
            }
        }
        true
    }
}

fn main() {
    let calculator = Calculator::new();
    
    // 检查是否有命令行参数
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() == 4 {
        // 命令行模式: calculator <number1> <operator> <number2>
        match calculator.parse_number(&args[1]) {
            Ok(num1) => {
                match calculator.parse_operation(&args[2]) {
                    Ok(op) => {
                        match calculator.parse_number(&args[3]) {
                            Ok(num2) => {
                                match calculator.calculate(num1, num2, op) {
                                    Ok(result) => println!("{}", result),
                                    Err(e) => eprintln!("错误: {}", e),
                                }
                            },
                            Err(e) => eprintln!("错误: {}", e),
                        }
                    },
                    Err(e) => eprintln!("错误: {}", e),
                }
            },
            Err(e) => eprintln!("错误: {}", e),
        }
    } else if args.len() > 1 {
        println!("用法: {} <数字1> <运算符> <数字2>", args[0]);
        println!("示例: {} 10 + 5", args[0]);
        println!("或者直接运行程序进入交互模式");
    } else {
        // 交互模式
        calculator.run_interactive_mode();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_basic_operations() {
        let calc = Calculator::new();
        
        assert_eq!(calc.calculate(2.0, 3.0, Operation::Add).unwrap(), 5.0);
        assert_eq!(calc.calculate(5.0, 2.0, Operation::Subtract).unwrap(), 3.0);
        assert_eq!(calc.calculate(4.0, 3.0, Operation::Multiply).unwrap(), 12.0);
        assert_eq!(calc.calculate(10.0, 2.0, Operation::Divide).unwrap(), 5.0);
    }
    
    #[test]
    fn test_division_by_zero() {
        let calc = Calculator::new();
        
        match calc.calculate(10.0, 0.0, Operation::Divide) {
            Err(CalculatorError::DivisionByZero) => (),
            _ => panic!("应该返回除零错误"),
        }
    }
    
    #[test]
    fn test_parse_operations() {
        let calc = Calculator::new();
        
        assert!(matches!(calc.parse_operation("+"), Ok(Operation::Add)));
        assert!(matches!(calc.parse_operation("add"), Ok(Operation::Add)));
        assert!(matches!(calc.parse_operation("加"), Ok(Operation::Add)));
        
        assert!(matches!(calc.parse_operation("-"), Ok(Operation::Subtract)));
        assert!(matches!(calc.parse_operation("*"), Ok(Operation::Multiply)));
        assert!(matches!(calc.parse_operation("/"), Ok(Operation::Divide)));
        
        assert!(matches!(calc.parse_operation("invalid"), Err(CalculatorError::InvalidOperation)));
    }
    
    #[test]
    fn test_parse_numbers() {
        let calc = Calculator::new();
        
        assert_eq!(calc.parse_number("10").unwrap(), 10.0);
        assert_eq!(calc.parse_number("10.5").unwrap(), 10.5);
        assert_eq!(calc.parse_number("-5").unwrap(), -5.0);
        
        assert!(matches!(calc.parse_number("invalid"), Err(CalculatorError::InvalidInput)));
    }
    
    #[test]
    fn test_is_perfect_square() {
        let calc = Calculator::new();
        
        assert!(calc.is_perfect_square(4));
        assert!(calc.is_perfect_square(9));
        assert!(calc.is_perfect_square(16));
        assert!(!calc.is_perfect_square(5));
        assert!(!calc.is_perfect_square(-4));
    }
    
    #[test]
    fn test_is_prime() {
        let calc = Calculator::new();
        
        assert!(calc.is_prime(2));
        assert!(calc.is_prime(3));
        assert!(calc.is_prime(5));
        assert!(calc.is_prime(7));
        assert!(!calc.is_prime(4));
        assert!(!calc.is_prime(6));
        assert!(!calc.is_prime(8));
        assert!(!calc.is_prime(9));
    }
}