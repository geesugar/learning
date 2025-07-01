// JavaScript 运算符与表达式示例
// 运行命令：node 02-operators-expressions.js

console.log('=== JavaScript 运算符与表达式 ===\n');

// ============================================================================
// 1. 算术运算符 (Arithmetic Operators)
// ============================================================================

console.log('1. 算术运算符');

let a = 10;
let b = 3;

console.log(`a = ${a}, b = ${b}`);
console.log('基本算术运算:');
console.log(`a + b = ${a + b}`);    // 加法
console.log(`a - b = ${a - b}`);    // 减法
console.log(`a * b = ${a * b}`);    // 乘法
console.log(`a / b = ${a / b}`);    // 除法
console.log(`a % b = ${a % b}`);    // 取余(模运算)
console.log(`a ** b = ${a ** b}`);  // 幂运算 (ES6+)

// 字符串的加法运算
console.log('\n字符串连接:');
console.log(`'Hello' + ' ' + 'World' = ${'Hello' + ' ' + 'World'}`);
console.log(`'数字' + 123 = ${'数字' + 123}`);
console.log(`123 + '数字' = ${123 + '数字'}`);

// 数字和字符串的混合运算
console.log('\n混合运算:');
console.log(`'5' + 3 = ${'5' + 3}`);      // "53" (字符串连接)
console.log(`'5' - 3 = ${'5' - 3}`);      // 2 (数字运算)
console.log(`'5' * 3 = ${'5' * 3}`);      // 15 (数字运算)
console.log(`'5' / 2 = ${'5' / 2}`);      // 2.5 (数字运算)

// 特殊值的运算
console.log('\n特殊值运算:');
console.log(`5 / 0 = ${5 / 0}`);          // Infinity
console.log(`-5 / 0 = ${-5 / 0}`);        // -Infinity
console.log(`0 / 0 = ${0 / 0}`);          // NaN
console.log(`'abc' - 5 = ${'abc' - 5}`);  // NaN

// ============================================================================
// 2. 赋值运算符 (Assignment Operators)
// ============================================================================

console.log('\n2. 赋值运算符');

let x = 10;
console.log(`初始值: x = ${x}`);

x += 5;  // x = x + 5
console.log(`x += 5 后: x = ${x}`);

x -= 3;  // x = x - 3
console.log(`x -= 3 后: x = ${x}`);

x *= 2;  // x = x * 2
console.log(`x *= 2 后: x = ${x}`);

x /= 4;  // x = x / 4
console.log(`x /= 4 后: x = ${x}`);

x %= 3;  // x = x % 3
console.log(`x %= 3 后: x = ${x}`);

x **= 2; // x = x ** 2
console.log(`x **= 2 后: x = ${x}`);

// 链式赋值
let p, q, r;
p = q = r = 5;
console.log(`链式赋值后: p=${p}, q=${q}, r=${r}`);

// ============================================================================
// 3. 递增递减运算符 (Increment/Decrement Operators)
// ============================================================================

console.log('\n3. 递增递减运算符');

let num1 = 5;
let num2 = 5;

console.log(`初始值: num1=${num1}, num2=${num2}`);

// 前置递增/递减 (先运算，后取值)
console.log(`++num1 = ${++num1}, num1现在是 ${num1}`); // 6
console.log(`--num1 = ${--num1}, num1现在是 ${num1}`); // 5

// 后置递增/递减 (先取值，后运算)
console.log(`num2++ = ${num2++}, num2现在是 ${num2}`); // 5, 然后变成6
console.log(`num2-- = ${num2--}, num2现在是 ${num2}`); // 6, 然后变成5

// 在表达式中的应用
let counter = 0;
console.log('\n递增在表达式中的应用:');
console.log(`counter的初始值: ${counter}`);
console.log(`counter++ * 2 = ${counter++ * 2}`); // 0 * 2 = 0, counter变成1
console.log(`counter现在是: ${counter}`);
console.log(`++counter * 2 = ${++counter * 2}`); // 2 * 2 = 4, counter先变成2

// ============================================================================
// 4. 比较运算符 (Comparison Operators)
// ============================================================================

console.log('\n4. 比较运算符');

let val1 = 5;
let val2 = '5';
let val3 = 10;

console.log(`val1 = ${val1} (${typeof val1})`);
console.log(`val2 = ${val2} (${typeof val2})`);
console.log(`val3 = ${val3} (${typeof val3})`);

// 相等性比较
console.log('\n相等性比较:');
console.log(`val1 == val2: ${val1 == val2}`);   // true (类型转换后比较)
console.log(`val1 === val2: ${val1 === val2}`); // false (严格比较，不转换类型)
console.log(`val1 != val2: ${val1 != val2}`);   // false
console.log(`val1 !== val2: ${val1 !== val2}`); // true

// 大小比较
console.log('\n大小比较:');
console.log(`val1 < val3: ${val1 < val3}`);
console.log(`val1 > val3: ${val1 > val3}`);
console.log(`val1 <= val3: ${val1 <= val3}`);
console.log(`val1 >= val3: ${val1 >= val3}`);

// 特殊值的比较
console.log('\n特殊值比较:');
console.log(`null == undefined: ${null == undefined}`);   // true
console.log(`null === undefined: ${null === undefined}`); // false
console.log(`NaN == NaN: ${NaN == NaN}`);                 // false (NaN不等于任何值)
console.log(`NaN === NaN: ${NaN === NaN}`);               // false

// 字符串比较
console.log('\n字符串比较 (按Unicode码点):');
console.log(`'apple' < 'banana': ${'apple' < 'banana'}`);
console.log(`'A' < 'a': ${'A' < 'a'}`); // A的Unicode是65，a的Unicode是97
console.log(`'10' < '2': ${'10' < '2'}`); // 字符串比较是逐字符比较

// ============================================================================
// 5. 逻辑运算符 (Logical Operators)
// ============================================================================

console.log('\n5. 逻辑运算符');

let isTrue = true;
let isFalse = false;

console.log(`isTrue = ${isTrue}, isFalse = ${isFalse}`);

// 逻辑与 (&&)
console.log('\n逻辑与 (&&):');
console.log(`true && true = ${true && true}`);     // true
console.log(`true && false = ${true && false}`);   // false
console.log(`false && true = ${false && true}`);   // false
console.log(`false && false = ${false && false}`); // false

// 逻辑或 (||)
console.log('\n逻辑或 (||):');
console.log(`true || true = ${true || true}`);     // true
console.log(`true || false = ${true || false}`);   // true
console.log(`false || true = ${false || true}`);   // true
console.log(`false || false = ${false || false}`); // false

// 逻辑非 (!)
console.log('\n逻辑非 (!):');
console.log(`!true = ${!true}`);     // false
console.log(`!false = ${!false}`);   // true
console.log(`!!true = ${!!true}`);   // true (双重否定)

// 短路求值 (Short-circuit evaluation)
console.log('\n短路求值:');
let result1 = true || console.log('这行不会执行'); // 因为左边是true，右边不会执行
let result2 = false && console.log('这行也不会执行'); // 因为左边是false，右边不会执行

// 实际应用中的短路求值
function getName(user) {
    return user && user.name || '匿名用户';
}

console.log('用户名示例:');
console.log(getName({ name: '张三' }));  // "张三"
console.log(getName(null));             // "匿名用户"
console.log(getName({}));               // "匿名用户"

// ============================================================================
// 6. 条件运算符 (Ternary Operator)
// ============================================================================

console.log('\n6. 条件运算符 (三元运算符)');

let age = 20;
let status = age >= 18 ? '成年人' : '未成年人';
console.log(`年龄 ${age}, 状态: ${status}`);

// 嵌套条件运算符
let score = 85;
let grade = score >= 90 ? 'A' : 
           score >= 80 ? 'B' : 
           score >= 70 ? 'C' : 
           score >= 60 ? 'D' : 'F';
console.log(`分数 ${score}, 等级: ${grade}`);

// 条件运算符在函数中的应用
function getMaxValue(a, b) {
    return a > b ? a : b;
}

console.log(`max(15, 8) = ${getMaxValue(15, 8)}`);

// ============================================================================
// 7. 类型运算符 (Type Operators)
// ============================================================================

console.log('\n7. 类型运算符');

// typeof 运算符
console.log('typeof 运算符:');
console.log(`typeof 42: ${typeof 42}`);
console.log(`typeof 'hello': ${typeof 'hello'}`);
console.log(`typeof true: ${typeof true}`);
console.log(`typeof undefined: ${typeof undefined}`);
console.log(`typeof null: ${typeof null}`);         // "object" (历史原因)
console.log(`typeof []: ${typeof []}`);             // "object"
console.log(`typeof {}: ${typeof {}}`);             // "object"
console.log(`typeof function(){}: ${typeof function(){}}`); // "function"

// instanceof 运算符
console.log('\ninstanceof 运算符:');
let arr = [1, 2, 3];
let obj = { name: 'test' };
let date = new Date();

console.log(`arr instanceof Array: ${arr instanceof Array}`);
console.log(`obj instanceof Object: ${obj instanceof Object}`);
console.log(`date instanceof Date: ${date instanceof Date}`);
console.log(`arr instanceof Object: ${arr instanceof Object}`); // true (数组继承自Object)

// ============================================================================
// 8. 位运算符 (Bitwise Operators)
// ============================================================================

console.log('\n8. 位运算符');

let bit1 = 5;  // 二进制: 101
let bit2 = 3;  // 二进制: 011

console.log(`bit1 = ${bit1} (二进制: ${bit1.toString(2)})`);
console.log(`bit2 = ${bit2} (二进制: ${bit2.toString(2)})`);

console.log('位运算结果:');
console.log(`bit1 & bit2 = ${bit1 & bit2} (按位与)`);       // 1 (001)
console.log(`bit1 | bit2 = ${bit1 | bit2} (按位或)`);       // 7 (111)
console.log(`bit1 ^ bit2 = ${bit1 ^ bit2} (按位异或)`);     // 6 (110)
console.log(`~bit1 = ${~bit1} (按位非)`);                   // -6
console.log(`bit1 << 1 = ${bit1 << 1} (左移)`);            // 10 (1010)
console.log(`bit1 >> 1 = ${bit1 >> 1} (右移)`);            // 2 (10)

// 位运算的实际应用
console.log('\n位运算的实际应用:');

// 判断奇偶数
function isEven(num) {
    return (num & 1) === 0;
}

console.log(`8是偶数吗? ${isEven(8)}`);
console.log(`7是偶数吗? ${isEven(7)}`);

// 快速乘除2的幂
console.log(`8 << 2 = ${8 << 2} (相当于 8 * 4)`);
console.log(`16 >> 2 = ${16 >> 2} (相当于 16 / 4)`);

// ============================================================================
// 9. 运算符优先级
// ============================================================================

console.log('\n9. 运算符优先级');

// 不使用括号的表达式
let expr1 = 2 + 3 * 4;
console.log(`2 + 3 * 4 = ${expr1}`); // 14 (乘法优先级高)

// 使用括号改变优先级
let expr2 = (2 + 3) * 4;
console.log(`(2 + 3) * 4 = ${expr2}`); // 20

// 复杂表达式
let expr3 = 2 ** 3 * 4 + 1;
console.log(`2 ** 3 * 4 + 1 = ${expr3}`); // 33 (幂运算 > 乘法 > 加法)

// 逻辑运算符优先级
let expr4 = true || false && false;
console.log(`true || false && false = ${expr4}`); // true (&& 优先级高于 ||)

// 比较运算符优先级
let expr5 = 5 + 3 > 4 * 2;
console.log(`5 + 3 > 4 * 2 = ${expr5}`); // false (8 > 8)

// ============================================================================
// 10. 实用示例：表达式计算器
// ============================================================================

console.log('\n10. 实用示例：表达式计算器');

// 简单的表达式计算器
class SimpleCalculator {
    constructor() {
        this.result = 0;
        this.history = [];
    }

    // 基本运算
    add(value) {
        this.result += value;
        this.history.push(`+ ${value}`);
        return this;
    }

    subtract(value) {
        this.result -= value;
        this.history.push(`- ${value}`);
        return this;
    }

    multiply(value) {
        this.result *= value;
        this.history.push(`* ${value}`);
        return this;
    }

    divide(value) {
        if (value !== 0) {
            this.result /= value;
            this.history.push(`/ ${value}`);
        } else {
            console.error('错误: 除数不能为零');
        }
        return this;
    }

    power(value) {
        this.result **= value;
        this.history.push(`** ${value}`);
        return this;
    }

    // 获取结果
    getResult() {
        return this.result;
    }

    // 重置
    reset() {
        this.result = 0;
        this.history = [];
        return this;
    }

    // 显示计算历史
    showHistory() {
        console.log('计算历史:', this.history.join(' '));
        console.log('当前结果:', this.result);
    }
}

// 使用计算器
const calc = new SimpleCalculator();

console.log('计算器演示:');
calc.add(10)
    .multiply(2)
    .subtract(5)
    .divide(3)
    .power(2);

calc.showHistory();

// ============================================================================
// 11. 表达式求值和类型转换
// ============================================================================

console.log('\n11. 表达式求值和类型转换');

console.log('复杂表达式求值:');

// 字符串和数字的混合运算
console.log(`'10' - '5' + 3: ${'10' - '5' + 3}`);        // 8
console.log(`'10' + '5' - 3: ${'10' + '5' - 3}`);        // 102
console.log(`+'5' + 3: ${+'5' + 3}`);                    // 8 (一元加号转换)

// 布尔值在运算中的转换
console.log(`true + 1: ${true + 1}`);                    // 2
console.log(`false + 1: ${false + 1}`);                  // 1
console.log(`true * 5: ${true * 5}`);                    // 5

// null 和 undefined 在运算中的表现
console.log(`null + 5: ${null + 5}`);                    // 5
console.log(`undefined + 5: ${undefined + 5}`);          // NaN

// 对象转换为原始值
let obj1 = { valueOf: () => 10 };
let obj2 = { toString: () => '20' };

console.log(`obj1 + 5: ${obj1 + 5}`);                    // 15
console.log(`obj2 + 5: ${obj2 + 5}`);                    // 205 (字符串连接)

// ============================================================================
// 12. 练习题
// ============================================================================

console.log('\n12. 练习题');

console.log('请计算以下表达式的结果:');
console.log('1. 3 + 4 * 2 - 1');
console.log('2. (5 + 3) / 2 ** 2');
console.log('3. true && false || true');
console.log('4. "5" + 3 - 2');
console.log('5. null == undefined');

// 练习答案
console.log('\n练习答案:');
console.log(`1. 3 + 4 * 2 - 1 = ${3 + 4 * 2 - 1}`);
console.log(`2. (5 + 3) / 2 ** 2 = ${(5 + 3) / 2 ** 2}`);
console.log(`3. true && false || true = ${true && false || true}`);
console.log(`4. "5" + 3 - 2 = ${"5" + 3 - 2}`);
console.log(`5. null == undefined = ${null == undefined}`);

// 实际编程练习
function practiceExercises() {
    console.log('\n实际编程练习:');
    
    // 练习1: 计算两个数的平均值
    function average(a, b) {
        return (a + b) / 2;
    }
    
    // 练习2: 判断年份是否为闰年
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    
    // 练习3: 计算圆的面积
    function circleArea(radius) {
        return Math.PI * radius ** 2;
    }
    
    // 练习4: 安全除法 (避免除零错误)
    function safeDivide(dividend, divisor) {
        return divisor !== 0 ? dividend / divisor : '无法除以零';
    }
    
    // 测试练习
    console.log(`average(10, 20) = ${average(10, 20)}`);
    console.log(`isLeapYear(2024) = ${isLeapYear(2024)}`);
    console.log(`circleArea(5) = ${circleArea(5).toFixed(2)}`);
    console.log(`safeDivide(10, 0) = ${safeDivide(10, 0)}`);
}

practiceExercises();

// ============================================================================
// 13. 知识小结
// ============================================================================

console.log('\n=== 知识小结 ===');
console.log('✅ 掌握了 JavaScript 的所有运算符类型');
console.log('✅ 理解了运算符优先级和结合性');
console.log('✅ 学会了表达式的求值规则');
console.log('✅ 了解了类型转换在运算中的作用');
console.log('✅ 掌握了短路求值和条件运算符');
console.log('✅ 能够编写复杂的运算表达式');

console.log('\n下一步学习：控制流程 (03-control-flow.js)'); 