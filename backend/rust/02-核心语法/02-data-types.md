# 数据类型

## 学习目标

- 理解 Rust 的类型系统
- 掌握标量类型的使用
- 掌握复合类型的使用
- 了解类型推断和类型注解
- 学会进行类型转换

## Rust 类型系统概览

Rust 是一种静态类型语言，这意味着在编译时必须知道所有变量的类型。编译器通常可以根据值和使用方式推断类型。

```rust
fn main() {
    let x = 42;        // 编译器推断为 i32
    let y: f64 = 3.14; // 显式指定为 f64
}
```

## 标量类型

标量类型表示单个值。Rust 有四种主要的标量类型：整数、浮点数、布尔值和字符。

### 1. 整数类型

#### 有符号整数
```rust
fn main() {
    let small: i8 = -128;      // 8位，范围：-128 到 127
    let normal: i16 = -32768;  // 16位，范围：-32,768 到 32,767
    let standard: i32 = -2147483648;  // 32位，范围：-2^31 到 2^31-1
    let big: i64 = -9223372036854775808;  // 64位
    let huge: i128 = -170141183460469231731687303715884105728;  // 128位
    let arch: isize = -9223372036854775808;  // 依赖架构（32位或64位）
    
    println!("有符号整数：");
    println!("i8: {}", small);
    println!("i16: {}", normal);
    println!("i32: {}", standard);
    println!("i64: {}", big);
}
```

#### 无符号整数
```rust
fn main() {
    let small: u8 = 255;       // 8位，范围：0 到 255
    let normal: u16 = 65535;   // 16位，范围：0 到 65,535
    let standard: u32 = 4294967295;  // 32位，范围：0 到 2^32-1
    let big: u64 = 18446744073709551615;  // 64位
    let huge: u128 = 340282366920938463463374607431768211455;  // 128位
    let arch: usize = 18446744073709551615;  // 依赖架构
    
    println!("无符号整数：");
    println!("u8: {}", small);
    println!("u16: {}", normal);
    println!("u32: {}", standard);
    println!("u64: {}", big);
}
```

#### 整数字面量
```rust
fn main() {
    let decimal = 98_222;          // 十进制
    let hex = 0xff;                // 十六进制
    let octal = 0o77;              // 八进制
    let binary = 0b1111_0000;      // 二进制
    let byte = b'A';               // 字节（仅限 u8）
    
    println!("十进制: {}", decimal);
    println!("十六进制: {}", hex);
    println!("八进制: {}", octal);
    println!("二进制: {}", binary);
    println!("字节: {}", byte);
}
```

#### 整数溢出
```rust
fn main() {
    let mut x: u8 = 255;
    println!("x = {}", x);
    
    // 在debug模式下会panic，在release模式下会回环
    // x = x + 1;  // 这会导致溢出
    
    // 使用checked_add避免溢出
    match x.checked_add(1) {
        Some(result) => println!("结果: {}", result),
        None => println!("溢出了！"),
    }
    
    // 其他溢出处理方法
    let result = x.saturating_add(10);  // 饱和加法，不会溢出
    println!("饱和加法结果: {}", result);
    
    let (result, overflow) = x.overflowing_add(10);  // 返回结果和溢出标志
    println!("回环加法结果: {}, 是否溢出: {}", result, overflow);
}
```

### 2. 浮点数类型

```rust
fn main() {
    let x = 2.0;        // f64，默认类型
    let y: f32 = 3.0;   // f32，单精度
    let z: f64 = 3.14159265359;  // f64，双精度
    
    println!("f64: {}", x);
    println!("f32: {}", y);
    println!("f64 精度: {}", z);
    
    // 科学计数法
    let scientific = 1.23e-4;
    println!("科学计数法: {}", scientific);
    
    // 特殊值
    let infinity = f64::INFINITY;
    let neg_infinity = f64::NEG_INFINITY;
    let nan = f64::NAN;
    
    println!("无穷大: {}", infinity);
    println!("负无穷大: {}", neg_infinity);
    println!("NaN: {}", nan);
    
    // 检查特殊值
    if nan.is_nan() {
        println!("这确实是 NaN");
    }
}
```

#### 浮点数运算
```rust
fn main() {
    let x = 10.0;
    let y = 3.0;
    
    println!("加法: {} + {} = {}", x, y, x + y);
    println!("减法: {} - {} = {}", x, y, x - y);
    println!("乘法: {} * {} = {}", x, y, x * y);
    println!("除法: {} / {} = {}", x, y, x / y);
    println!("取余: {} % {} = {}", x, y, x % y);
    
    // 数学函数
    let angle = std::f64::consts::PI / 4.0;
    println!("sin(π/4) = {}", angle.sin());
    println!("cos(π/4) = {}", angle.cos());
    println!("sqrt(16) = {}", 16.0_f64.sqrt());
    println!("2^3 = {}", 2.0_f64.powf(3.0));
}
```

### 3. 布尔类型

```rust
fn main() {
    let t = true;
    let f: bool = false;
    
    println!("true: {}", t);
    println!("false: {}", f);
    
    // 布尔运算
    println!("AND: {} && {} = {}", t, f, t && f);
    println!("OR: {} || {} = {}", t, f, t || f);
    println!("NOT: !{} = {}", t, !t);
    
    // 比较运算返回布尔值
    let x = 5;
    let y = 10;
    
    println!("{} == {} = {}", x, y, x == y);
    println!("{} != {} = {}", x, y, x != y);
    println!("{} < {} = {}", x, y, x < y);
    println!("{} > {} = {}", x, y, x > y);
    println!("{} <= {} = {}", x, y, x <= y);
    println!("{} >= {} = {}", x, y, x >= y);
}
```

### 4. 字符类型

```rust
fn main() {
    let c = 'z';
    let z = 'ℤ';
    let heart_eyed_cat = '😻';
    let chinese = '中';
    
    println!("字符: {}", c);
    println!("数学符号: {}", z);
    println!("表情符号: {}", heart_eyed_cat);
    println!("中文字符: {}", chinese);
    
    // 字符的一些方法
    println!("'A' 是字母: {}", 'A'.is_alphabetic());
    println!("'5' 是数字: {}", '5'.is_numeric());
    println!("' ' 是空白: {}", ' '.is_whitespace());
    println!("'a' 转大写: {}", 'a'.to_uppercase().collect::<String>());
    
    // 字符和数字的转换
    let digit = '5';
    if let Some(num) = digit.to_digit(10) {
        println!("字符 '{}' 的数值是: {}", digit, num);
    }
}
```

## 复合类型

复合类型可以将多个值组合成一个类型。Rust 有两种原生复合类型：元组和数组。

### 1. 元组类型

元组是一个将多个其他类型的值组合进一个复合类型的通用方法。

```rust
fn main() {
    // 基本元组
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    println!("元组: {:?}", tup);
    
    // 解构元组
    let (x, y, z) = tup;
    println!("x: {}, y: {}, z: {}", x, y, z);
    
    // 通过索引访问元组元素
    let first = tup.0;
    let second = tup.1;
    let third = tup.2;
    println!("索引访问: {}, {}, {}", first, second, third);
    
    // 不同类型的元组
    let person: (&str, i32, bool) = ("Alice", 30, true);
    println!("人员信息: 姓名={}, 年龄={}, 活跃={}", person.0, person.1, person.2);
    
    // 单元素元组
    let single: (i32,) = (42,);  // 注意逗号
    println!("单元素元组: {:?}", single);
    
    // 空元组（单元类型）
    let unit: () = ();
    println!("空元组: {:?}", unit);
}
```

#### 元组的实际应用
```rust
fn main() {
    // 函数返回多个值
    let point = get_point();
    println!("坐标: ({}, {})", point.0, point.1);
    
    // 解构赋值
    let (x, y) = get_point();
    println!("x: {}, y: {}", x, y);
    
    // 交换变量
    let mut a = 5;
    let mut b = 10;
    println!("交换前: a={}, b={}", a, b);
    
    (a, b) = (b, a);  // 交换
    println!("交换后: a={}, b={}", a, b);
}

fn get_point() -> (i32, i32) {
    (3, 5)
}
```

### 2. 数组类型

数组是相同类型元素的固定长度集合。

```rust
fn main() {
    // 基本数组
    let arr = [1, 2, 3, 4, 5];
    println!("数组: {:?}", arr);
    
    // 指定类型和长度
    let arr: [i32; 5] = [1, 2, 3, 4, 5];
    println!("类型注解数组: {:?}", arr);
    
    // 相同值初始化
    let arr = [3; 5];  // 等同于 [3, 3, 3, 3, 3]
    println!("相同值数组: {:?}", arr);
    
    // 访问数组元素
    let first = arr[0];
    let second = arr[1];
    println!("第一个元素: {}, 第二个元素: {}", first, second);
    
    // 数组长度
    println!("数组长度: {}", arr.len());
    
    // 数组的一些方法
    let numbers = [1, 2, 3, 4, 5];
    println!("数组包含3: {}", numbers.contains(&3));
    println!("数组是否为空: {}", numbers.is_empty());
}
```

#### 数组的实际应用
```rust
fn main() {
    // 月份数组
    let months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    let month_index = 2;
    println!("第{}个月是: {}", month_index + 1, months[month_index]);
    
    // 遍历数组
    println!("所有月份:");
    for month in months.iter() {
        println!("  {}", month);
    }
    
    // 带索引遍历
    println!("带索引的月份:");
    for (index, month) in months.iter().enumerate() {
        println!("  {}: {}", index + 1, month);
    }
    
    // 数组切片
    let first_quarter = &months[0..3];
    println!("第一季度: {:?}", first_quarter);
}
```

## 字符串类型

Rust 中有两种主要的字符串类型：`&str` 和 `String`。

### 1. 字符串字面量 (&str)

```rust
fn main() {
    let s = "Hello, world!";  // 字符串字面量，类型是 &str
    println!("字符串字面量: {}", s);
    
    // 字符串字面量的一些方法
    println!("长度: {}", s.len());
    println!("是否为空: {}", s.is_empty());
    println!("包含'world': {}", s.contains("world"));
    
    // 字符串分割
    let words: Vec<&str> = s.split(" ").collect();
    println!("分割后的单词: {:?}", words);
    
    // 原始字符串
    let raw_string = r"This is a raw string with \\n and \\t";
    println!("原始字符串: {}", raw_string);
    
    // 多行原始字符串
    let multiline = r#"
        This is a multiline
        raw string with "quotes"
    "#;
    println!("多行原始字符串: {}", multiline);
}
```

### 2. 字符串对象 (String)

```rust
fn main() {
    // 创建 String
    let mut s = String::new();
    s.push_str("Hello");
    s.push(' ');
    s.push_str("world!");
    println!("构建的字符串: {}", s);
    
    // 从字符串字面量创建
    let s2 = String::from("Hello, Rust!");
    println!("从字面量创建: {}", s2);
    
    // to_string() 方法
    let s3 = "Hello, Rust!".to_string();
    println!("to_string(): {}", s3);
    
    // 字符串连接
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2;  // s1 被移动，不能再使用
    println!("连接后: {}", s3);
    
    // 使用 format! 宏
    let s1 = String::from("Hello");
    let s2 = String::from("world");
    let s3 = format!("{}, {}!", s1, s2);
    println!("format! 宏: {}", s3);
}
```

## 类型转换

### 1. 显式转换 (as)

```rust
fn main() {
    let x = 42u32;
    let y = x as i32;
    let z = x as f64;
    
    println!("原始值: {}", x);
    println!("转换为 i32: {}", y);
    println!("转换为 f64: {}", z);
    
    // 可能丢失精度的转换
    let large_number = 1000i32;
    let small_number = large_number as i8;
    println!("大数: {}, 转换为 i8: {}", large_number, small_number);
    
    // 浮点数转整数
    let float_num = 3.14f64;
    let int_num = float_num as i32;
    println!("浮点数: {}, 转换为整数: {}", float_num, int_num);
}
```

### 2. 安全转换 (TryFrom/TryInto)

```rust
use std::convert::TryInto;

fn main() {
    let x = 42u32;
    
    // 使用 try_into
    let y: Result<i32, _> = x.try_into();
    match y {
        Ok(val) => println!("成功转换: {}", val),
        Err(e) => println!("转换失败: {}", e),
    }
    
    // 可能失败的转换
    let large_number = 1000u32;
    let small_number: Result<u8, _> = large_number.try_into();
    match small_number {
        Ok(val) => println!("成功转换: {}", val),
        Err(e) => println!("转换失败: {:?}", e),
    }
}
```

### 3. 字符串解析

```rust
fn main() {
    // 字符串解析为数字
    let string_number = "42";
    let number: i32 = string_number.parse().unwrap();
    println!("解析的数字: {}", number);
    
    // 安全解析
    let string_number = "not_a_number";
    match string_number.parse::<i32>() {
        Ok(num) => println!("解析成功: {}", num),
        Err(e) => println!("解析失败: {}", e),
    }
    
    // 解析为不同类型
    let inputs = ["42", "3.14", "true", "hello"];
    
    for input in inputs {
        println!("输入: {}", input);
        
        if let Ok(num) = input.parse::<i32>() {
            println!("  作为整数: {}", num);
        } else if let Ok(num) = input.parse::<f64>() {
            println!("  作为浮点数: {}", num);
        } else if let Ok(b) = input.parse::<bool>() {
            println!("  作为布尔值: {}", b);
        } else {
            println!("  无法解析为数字或布尔值");
        }
    }
}
```

## 实践练习

### 练习 1：类型探索

```rust
fn main() {
    // 探索不同类型的大小
    println!("类型大小 (字节):");
    println!("i8: {}", std::mem::size_of::<i8>());
    println!("i16: {}", std::mem::size_of::<i16>());
    println!("i32: {}", std::mem::size_of::<i32>());
    println!("i64: {}", std::mem::size_of::<i64>());
    println!("f32: {}", std::mem::size_of::<f32>());
    println!("f64: {}", std::mem::size_of::<f64>());
    println!("bool: {}", std::mem::size_of::<bool>());
    println!("char: {}", std::mem::size_of::<char>());
    
    // 探索范围
    println!("\\n类型范围:");
    println!("i8: {} 到 {}", i8::MIN, i8::MAX);
    println!("u8: {} 到 {}", u8::MIN, u8::MAX);
    println!("i32: {} 到 {}", i32::MIN, i32::MAX);
    println!("u32: {} 到 {}", u32::MIN, u32::MAX);
}
```

### 练习 2：数组操作

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 计算总和
    let sum = numbers.iter().sum::<i32>();
    println!("总和: {}", sum);
    
    // 计算平均值
    let average = sum as f64 / numbers.len() as f64;
    println!("平均值: {:.2}", average);
    
    // 找到最大值和最小值
    let max = numbers.iter().max().unwrap();
    let min = numbers.iter().min().unwrap();
    println!("最大值: {}, 最小值: {}", max, min);
    
    // 筛选偶数
    let even_numbers: Vec<i32> = numbers.iter()
        .filter(|&x| x % 2 == 0)
        .cloned()
        .collect();
    println!("偶数: {:?}", even_numbers);
}
```

### 练习 3：字符串处理

```rust
fn main() {
    let text = "Hello, Rust Programming!";
    
    println!("原始文本: {}", text);
    println!("长度: {}", text.len());
    println!("字符数: {}", text.chars().count());
    
    // 转换大小写
    println!("大写: {}", text.to_uppercase());
    println!("小写: {}", text.to_lowercase());
    
    // 替换
    let replaced = text.replace("Rust", "Python");
    println!("替换后: {}", replaced);
    
    // 分割
    let words: Vec<&str> = text.split(' ').collect();
    println!("单词: {:?}", words);
    
    // 检查前缀和后缀
    println!("以'Hello'开头: {}", text.starts_with("Hello"));
    println!("以'!'结尾: {}", text.ends_with("!"));
}
```

### 练习 4：类型转换练习

```rust
fn main() {
    let data = ["42", "3.14", "true", "hello", "255"];
    
    for item in data {
        println!("\\n处理: {}", item);
        
        // 尝试转换为不同类型
        if let Ok(int_val) = item.parse::<i32>() {
            println!("  整数: {}", int_val);
            println!("  二进制: {:b}", int_val);
            println!("  十六进制: {:x}", int_val);
        }
        
        if let Ok(float_val) = item.parse::<f64>() {
            println!("  浮点数: {}", float_val);
            println!("  平方根: {:.2}", float_val.sqrt());
        }
        
        if let Ok(bool_val) = item.parse::<bool>() {
            println!("  布尔值: {}", bool_val);
            println!("  取反: {}", !bool_val);
        }
        
        if item.parse::<i32>().is_err() && 
           item.parse::<f64>().is_err() && 
           item.parse::<bool>().is_err() {
            println!("  字符串: {}", item);
            println!("  长度: {}", item.len());
        }
    }
}
```

## 总结

Rust 的类型系统是其安全性和性能的基础：

1. **静态类型**：编译时确定类型，提供安全保证
2. **类型推断**：编译器可以自动推断类型
3. **标量类型**：整数、浮点数、布尔值、字符
4. **复合类型**：元组、数组、字符串
5. **类型转换**：显式转换和安全转换

理解这些类型和它们的特性对于编写高效、安全的 Rust 代码至关重要。

## 下一步

完成本节学习后，请继续学习 [03-函数](03-functions.md)。