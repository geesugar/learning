// JavaScript 控制流程示例
// 运行命令：node 03-control-flow.js

console.log('=== JavaScript 控制流程 ===\n');

// ============================================================================
// 1. 条件语句 (Conditional Statements)
// ============================================================================

console.log('1. 条件语句');

// if 语句
let temperature = 25;
console.log(`当前温度: ${temperature}°C`);

if (temperature > 30) {
    console.log('天气很热，建议开空调');
} else if (temperature > 20) {
    console.log('天气温和，很舒适');
} else if (temperature > 10) {
    console.log('天气有点凉，建议加件衣服');
} else {
    console.log('天气很冷，注意保暖');
}

// 复杂条件判断
let age = 25;
let hasLicense = true;
let hasInsurance = true;

console.log(`\n年龄: ${age}, 有驾照: ${hasLicense}, 有保险: ${hasInsurance}`);

if (age >= 18 && hasLicense && hasInsurance) {
    console.log('可以驾驶汽车');
} else {
    let reasons = [];
    if (age < 18) reasons.push('年龄不够');
    if (!hasLicense) reasons.push('没有驾照');
    if (!hasInsurance) reasons.push('没有保险');
    console.log(`不能驾驶汽车，原因: ${reasons.join(', ')}`);
}

// switch 语句
let dayOfWeek = new Date().getDay();
let dayName;

console.log(`\n今天是星期${dayOfWeek + 1}`);

switch (dayOfWeek) {
    case 0:
        dayName = '星期日';
        console.log('今天是休息日，好好放松！');
        break;
    case 1:
        dayName = '星期一';
        console.log('新的一周开始了，加油！');
        break;
    case 2:
        dayName = '星期二';
        console.log('继续努力工作！');
        break;
    case 3:
        dayName = '星期三';
        console.log('一周过半了！');
        break;
    case 4:
        dayName = '星期四';
        console.log('即将迎来周末！');
        break;
    case 5:
        dayName = '星期五';
        console.log('TGIF - 感谢老天今天是星期五！');
        break;
    case 6:
        dayName = '星期六';
        console.log('周末愉快！');
        break;
    default:
        dayName = '未知';
        console.log('这是什么时候？');
}

console.log(`今天是${dayName}`);

// ============================================================================
// 2. 循环语句 (Loop Statements)
// ============================================================================

console.log('\n2. 循环语句');

// for 循环
console.log('for 循环示例:');
console.log('1到10的数字:');
for (let i = 1; i <= 10; i++) {
    process.stdout.write(`${i} `);
}
console.log(); // 换行

// while 循环
console.log('\nwhile 循环示例:');
let countdown = 5;
console.log('倒计时开始:');
while (countdown > 0) {
    console.log(`${countdown}...`);
    countdown--;
}
console.log('🚀 发射！');

// for...of 循环
console.log('\nfor...of 循环示例:');
let fruits = ['苹果', '香蕉', '橙子', '葡萄'];

console.log('水果列表:');
for (let fruit of fruits) {
    console.log(`🍎 ${fruit}`);
}

// ============================================================================
// 3. 跳转语句和练习
// ============================================================================

console.log('\n3. 跳转语句和练习');

// break 语句
console.log('break 语句示例:');
let numbers = [1, 3, 5, 8, 9, 12, 15];

for (let i = 0; i < numbers.length; i++) {
    console.log(`检查数字: ${numbers[i]}`);
    if (numbers[i] % 2 === 0) {
        console.log(`✅ 找到第一个偶数: ${numbers[i]}`);
        break;
    }
}

// continue 语句
console.log('\ncontinue 语句示例:');
console.log('打印1-10中的奇数:');
for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) {
        continue;
    }
    console.log(`奇数: ${i}`);
}

// ============================================================================
// 4. 实用示例
// ============================================================================

console.log('\n4. 实用示例');

// 数组处理示例
function processStudents() {
    let students = [
        { name: '张三', score: 85 },
        { name: '李四', score: 92 },
        { name: '王五', score: 78 },
        { name: '赵六', score: 96 }
    ];

    console.log('学生成绩处理:');
    
    let totalScore = 0;
    let highScorers = [];
    
    for (let student of students) {
        totalScore += student.score;
        
        if (student.score >= 90) {
            highScorers.push(student.name);
        }
        
        // 根据分数给出等级
        let grade;
        if (student.score >= 90) {
            grade = 'A';
        } else if (student.score >= 80) {
            grade = 'B';
        } else if (student.score >= 70) {
            grade = 'C';
        } else {
            grade = 'D';
        }
        
        console.log(`${student.name}: ${student.score}分 (${grade}级)`);
    }
    
    let average = totalScore / students.length;
    console.log(`\n平均分: ${average.toFixed(2)}分`);
    console.log(`优秀学生(90分以上): ${highScorers.join(', ')}`);
}

processStudents();

// 简单的猜数字游戏
function numberGuessingGame() {
    console.log('\n猜数字游戏演示:');
    let targetNumber = 7;
    let guesses = [3, 9, 5, 7]; // 模拟猜测序列
    
    console.log('我想了一个1-10之间的数字，你来猜猜是多少？');
    
    for (let i = 0; i < guesses.length; i++) {
        let guess = guesses[i];
        console.log(`第${i + 1}次猜测: ${guess}`);
        
        if (guess === targetNumber) {
            console.log(`🎉 恭喜！你猜对了！数字就是 ${targetNumber}`);
            console.log(`你用了 ${i + 1} 次猜测`);
            break;
        } else if (guess < targetNumber) {
            console.log('太小了，再大一点');
        } else {
            console.log('太大了，再小一点');
        }
    }
}

numberGuessingGame();

// ============================================================================
// 5. 练习题答案
// ============================================================================

console.log('\n5. 练习题答案');

// 九九乘法表
function multiplicationTable() {
    console.log('九九乘法表:');
    for (let i = 1; i <= 9; i++) {
        let row = '';
        for (let j = 1; j <= i; j++) {
            row += `${j}×${i}=${i * j}\t`;
        }
        console.log(row);
    }
}

multiplicationTable();

// 判断质数
function isPrime(num) {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

console.log('\n质数判断:');
let testNumbers = [2, 3, 4, 5, 17, 25, 29];
for (let num of testNumbers) {
    console.log(`${num} ${isPrime(num) ? '是' : '不是'}质数`);
}

// 斐波那契数列
function fibonacci(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

console.log('\n斐波那契数列前10项:');
for (let i = 0; i < 10; i++) {
    console.log(`F(${i}) = ${fibonacci(i)}`);
}

// ============================================================================
// 6. 知识小结
// ============================================================================

console.log('\n=== 知识小结 ===');
console.log('✅ 掌握了条件语句 (if/else, switch)');
console.log('✅ 学会了循环语句 (for, while, for...of)');
console.log('✅ 理解了跳转语句 (break, continue)');
console.log('✅ 能够编写复杂的控制流程逻辑');
console.log('✅ 学会了实际问题的编程解决方案');

console.log('\n下一步学习：函数编程 (04-functions.js)'); 