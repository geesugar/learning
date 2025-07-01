# 函数基础

> 掌握 JavaScript 函数的定义、调用和高级特性

## 🎯 学习目标

- 理解函数的概念和作用
- 掌握函数的声明和表达式
- 学会使用参数和返回值
- 理解作用域和闭包的基本概念
- 掌握函数的高级特性

## 📝 函数基础概念

### 1. 什么是函数

```javascript
// 函数是一段可重复使用的代码块
// 可以接收输入（参数），执行操作，并返回结果

// 没有函数的重复代码
let user1Score = 85;
let user1Grade;
if (user1Score >= 90) {
    user1Grade = 'A';
} else if (user1Score >= 80) {
    user1Grade = 'B';
} else if (user1Score >= 70) {
    user1Grade = 'C';
} else {
    user1Grade = 'D';
}

let user2Score = 92;
let user2Grade;
if (user2Score >= 90) {
    user2Grade = 'A';
} else if (user2Score >= 80) {
    user2Grade = 'B';
} else if (user2Score >= 70) {
    user2Grade = 'C';
} else {
    user2Grade = 'D';
}

// 使用函数消除重复
function getGrade(score) {
    if (score >= 90) {
        return 'A';
    } else if (score >= 80) {
        return 'B';
    } else if (score >= 70) {
        return 'C';
    } else {
        return 'D';
    }
}

// 简洁的使用方式
let user1Grade = getGrade(85); // 'B'
let user2Grade = getGrade(92); // 'A'
let user3Grade = getGrade(78); // 'C'
```

### 2. 函数的优势

```javascript
// 1. 代码重用
function calculateCircleArea(radius) {
    return Math.PI * radius * radius;
}

let area1 = calculateCircleArea(5);
let area2 = calculateCircleArea(10);
let area3 = calculateCircleArea(3.5);

// 2. 模块化
function validateEmail(email) {
    return email.includes('@') && email.includes('.');
}

function validatePassword(password) {
    return password.length >= 8;
}

function validateUser(user) {
    return validateEmail(user.email) && validatePassword(user.password);
}

// 3. 抽象化复杂逻辑
function formatCurrency(amount, currency = 'CNY') {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

console.log(formatCurrency(1234.56)); // ¥1,234.56

// 4. 易于测试和调试
function add(a, b) {
    return a + b;
}

// 单元测试
console.assert(add(2, 3) === 5, '2 + 3 应该等于 5');
console.assert(add(-1, 1) === 0, '-1 + 1 应该等于 0');
```

## 🔧 函数声明

### 1. 函数声明语句

```javascript
// 基本语法
function functionName(parameters) {
    // 函数体
    return value; // 可选
}

// 简单示例
function greet(name) {
    return `你好，${name}！`;
}

let message = greet('张三');
console.log(message); // "你好，张三！"

// 多个参数
function calculateSum(a, b, c) {
    return a + b + c;
}

let sum = calculateSum(10, 20, 30);
console.log(sum); // 60

// 无参数函数
function getCurrentTime() {
    return new Date().toLocaleString('zh-CN');
}

console.log(getCurrentTime()); // "2024/1/1 12:00:00"

// 无返回值函数
function printWelcome(name) {
    console.log(`欢迎 ${name} 来到我们的网站！`);
    // 没有return语句，默认返回undefined
}

printWelcome('李四'); // 输出欢迎信息
let result = printWelcome('王五');
console.log(result); // undefined
```

### 2. 函数表达式

```javascript
// 匿名函数表达式
let multiply = function(a, b) {
    return a * b;
};

console.log(multiply(4, 5)); // 20

// 具名函数表达式
let factorial = function fact(n) {
    if (n <= 1) {
        return 1;
    }
    return n * fact(n - 1); // 可以在函数内部调用自己
};

console.log(factorial(5)); // 120

// 立即调用函数表达式 (IIFE)
let result = (function(a, b) {
    return a + b;
})(10, 20);

console.log(result); // 30

// 使用IIFE创建独立作用域
(function() {
    let privateVariable = '这是私有变量';
    
    // 不会污染全局作用域
    function privateFunction() {
        console.log(privateVariable);
    }
    
    privateFunction(); // "这是私有变量"
})();

// console.log(privateVariable); // ReferenceError
```

### 3. 函数声明 vs 函数表达式

```javascript
// 函数声明会被提升
console.log(declaredFunction()); // "我被提升了！"

function declaredFunction() {
    return "我被提升了！";
}

// 函数表达式不会被提升
// console.log(expressionFunction()); // TypeError: expressionFunction is not a function

let expressionFunction = function() {
    return "我没有被提升";
};

console.log(expressionFunction()); // "我没有被提升"

// 条件创建函数的区别
let condition = true;

if (condition) {
    // 函数声明（在某些情况下可能有问题）
    function conditionalDeclared() {
        return "声明式函数";
    }
    
    // 函数表达式（推荐）
    var conditionalExpression = function() {
        return "表达式函数";
    };
}

// 在不支持块级作用域的情况下，声明式函数可能会有问题
```

## 📥 参数处理

### 1. 基本参数

```javascript
// 普通参数
function introduce(name, age, city) {
    return `我叫${name}，今年${age}岁，来自${city}`;
}

console.log(introduce('张三', 25, '北京'));
console.log(introduce('李四', 30)); // "我叫李四，今年30岁，来自undefined"
console.log(introduce('王五')); // "我叫王五，今年undefined岁，来自undefined"

// arguments 对象（不推荐，但需要了解）
function oldStyleSum() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}

console.log(oldStyleSum(1, 2, 3, 4)); // 10
console.log(oldStyleSum(10, 20)); // 30

// 检查参数数量
function checkParameters(required, optional) {
    console.log('参数数量:', arguments.length);
    console.log('required:', required);
    console.log('optional:', optional);
}

checkParameters('必须的'); // 参数数量: 1
checkParameters('必须的', '可选的'); // 参数数量: 2
```

### 2. 默认参数 (ES6)

```javascript
// ES6 默认参数
function greetWithDefault(name = '访客', greeting = '你好') {
    return `${greeting}，${name}！`;
}

console.log(greetWithDefault()); // "你好，访客！"
console.log(greetWithDefault('张三')); // "你好，张三！"
console.log(greetWithDefault('李四', '欢迎')); // "欢迎，李四！"

// 默认参数可以是表达式
function createUser(name, role = 'user', createdAt = new Date()) {
    return {
        name: name,
        role: role,
        createdAt: createdAt
    };
}

let user1 = createUser('张三');
let user2 = createUser('李四', 'admin');

// 默认参数可以引用前面的参数
function buildUrl(protocol = 'https', domain, port = protocol === 'https' ? 443 : 80) {
    return `${protocol}://${domain}:${port}`;
}

console.log(buildUrl(undefined, 'example.com')); // "https://example.com:443"
console.log(buildUrl('http', 'example.com')); // "http://example.com:80"

// 参数解构赋值
function processOrder({ 
    productName, 
    quantity = 1, 
    price, 
    discount = 0 
}) {
    const total = price * quantity * (1 - discount);
    return `订单：${productName} x ${quantity}，总计：¥${total}`;
}

console.log(processOrder({
    productName: '笔记本电脑',
    price: 5000,
    quantity: 2,
    discount: 0.1
})); // "订单：笔记本电脑 x 2，总计：¥9000"
```

### 3. 剩余参数 (ES6)

```javascript
// 剩余参数收集多余的参数
function sum(first, ...rest) {
    console.log('第一个参数:', first);
    console.log('剩余参数:', rest);
    
    let total = first;
    for (let num of rest) {
        total += num;
    }
    return total;
}

console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(sum(10, 20)); // 30
console.log(sum(100)); // 100

// 收集所有参数
function logAll(...args) {
    console.log('参数数量:', args.length);
    args.forEach((arg, index) => {
        console.log(`参数 ${index + 1}:`, arg);
    });
}

logAll('hello', 42, true, { name: '张三' });

// 实际应用：格式化字符串
function formatString(template, ...values) {
    let result = template;
    values.forEach((value, index) => {
        result = result.replace(`{${index}}`, value);
    });
    return result;
}

let message = formatString('用户 {0} 在 {1} 购买了 {2}', '张三', '2024-01-01', '笔记本电脑');
console.log(message); // "用户 张三 在 2024-01-01 购买了 笔记本电脑"

// 数组展开与剩余参数
function processNumbers(operation, ...numbers) {
    switch (operation) {
        case 'sum':
            return numbers.reduce((total, num) => total + num, 0);
        case 'max':
            return Math.max(...numbers);
        case 'min':
            return Math.min(...numbers);
        case 'average':
            return numbers.reduce((total, num) => total + num, 0) / numbers.length;
        default:
            return numbers;
    }
}

console.log(processNumbers('sum', 1, 2, 3, 4, 5)); // 15
console.log(processNumbers('max', 10, 5, 8, 3)); // 10
console.log(processNumbers('average', 2, 4, 6, 8)); // 5
```

## 📤 返回值

### 1. 基本返回值

```javascript
// 返回基本类型
function getAge() {
    return 25;
}

function getName() {
    return '张三';
}

function isAdult(age) {
    return age >= 18;
}

// 返回对象
function createUser(name, age) {
    return {
        name: name,
        age: age,
        isAdult: age >= 18,
        greet: function() {
            return `你好，我是${this.name}`;
        }
    };
}

let user = createUser('李四', 30);
console.log(user.greet()); // "你好，我是李四"

// 返回数组
function getTopScores(scores, count = 3) {
    return scores
        .sort((a, b) => b - a)
        .slice(0, count);
}

let scores = [85, 92, 78, 96, 88, 74];
console.log(getTopScores(scores)); // [96, 92, 88]

// 返回函数
function createMultiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

let double = createMultiplier(2);
let triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(4)); // 12
```

### 2. 多值返回

```javascript
// 使用数组返回多个值
function getNameParts(fullName) {
    let parts = fullName.split(' ');
    return [parts[0], parts[1]];
}

let [firstName, lastName] = getNameParts('张 三');
console.log(firstName, lastName); // "张" "三"

// 使用对象返回多个值（推荐）
function analyzeText(text) {
    return {
        length: text.length,
        wordCount: text.split(' ').length,
        hasNumbers: /\d/.test(text),
        hasUpperCase: /[A-Z]/.test(text),
        firstWord: text.split(' ')[0]
    };
}

let analysis = analyzeText('Hello World 123');
console.log(analysis);
// {
//   length: 13,
//   wordCount: 3,
//   hasNumbers: true,
//   hasUpperCase: true,
//   firstWord: 'Hello'
// }

// 解构赋值获取需要的返回值
let { wordCount, hasNumbers } = analyzeText('JavaScript is fun');
console.log(`单词数: ${wordCount}, 包含数字: ${hasNumbers}`);

// 计算统计信息
function calculateStats(numbers) {
    if (numbers.length === 0) {
        return {
            sum: 0,
            average: 0,
            min: 0,
            max: 0,
            count: 0
        };
    }
    
    let sum = numbers.reduce((total, num) => total + num, 0);
    let min = Math.min(...numbers);
    let max = Math.max(...numbers);
    
    return {
        sum: sum,
        average: sum / numbers.length,
        min: min,
        max: max,
        count: numbers.length
    };
}

let stats = calculateStats([1, 2, 3, 4, 5]);
console.log(`平均值: ${stats.average}, 最大值: ${stats.max}`);
```

### 3. 条件返回

```javascript
// 早期返回模式
function validateUserInput(user) {
    // 检查必填字段
    if (!user.name) {
        return { isValid: false, error: '姓名不能为空' };
    }
    
    if (!user.email) {
        return { isValid: false, error: '邮箱不能为空' };
    }
    
    // 检查邮箱格式
    if (!user.email.includes('@')) {
        return { isValid: false, error: '邮箱格式无效' };
    }
    
    // 检查年龄
    if (user.age && (user.age < 0 || user.age > 150)) {
        return { isValid: false, error: '年龄必须在0-150之间' };
    }
    
    // 所有验证通过
    return { isValid: true, error: null };
}

// 使用示例
let users = [
    { name: '张三', email: 'zhang@example.com', age: 25 },
    { name: '', email: 'li@example.com', age: 30 },
    { name: '王五', email: 'invalid-email', age: 22 }
];

users.forEach(user => {
    let validation = validateUserInput(user);
    if (validation.isValid) {
        console.log(`用户 ${user.name} 验证通过`);
    } else {
        console.log(`验证失败: ${validation.error}`);
    }
});

// 根据条件返回不同类型的值
function formatValue(value, type) {
    switch (type) {
        case 'currency':
            return `¥${value.toFixed(2)}`;
        case 'percentage':
            return `${(value * 100).toFixed(1)}%`;
        case 'date':
            return new Date(value).toLocaleDateString('zh-CN');
        case 'boolean':
            return value ? '是' : '否';
        default:
            return String(value);
    }
}

console.log(formatValue(1234.56, 'currency')); // "¥1234.56"
console.log(formatValue(0.85, 'percentage')); // "85.0%"
console.log(formatValue(true, 'boolean')); // "是"
```

## 🔒 闭包基础

### 1. 什么是闭包

```javascript
// 闭包：函数可以访问其外部作用域的变量
function createCounter() {
    let count = 0; // 私有变量
    
    return function() {
        count++; // 访问外部作用域的变量
        return count;
    };
}

let counter1 = createCounter();
let counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 (独立的计数器)
console.log(counter1()); // 3

// 每个闭包都有自己的变量副本
console.log(counter2()); // 2
```

### 2. 闭包的实际应用

```javascript
// 1. 数据封装
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit: function(amount) {
            if (amount > 0) {
                balance += amount;
                return `存款成功，余额: ¥${balance}`;
            }
            return '存款金额必须大于0';
        },
        
        withdraw: function(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                return `取款成功，余额: ¥${balance}`;
            }
            return '取款失败，金额无效或余额不足';
        },
        
        getBalance: function() {
            return balance;
        }
    };
}

let account = createBankAccount(1000);
console.log(account.deposit(500)); // "存款成功，余额: ¥1500"
console.log(account.withdraw(200)); // "取款成功，余额: ¥1300"
console.log(account.getBalance()); // 1300
// console.log(account.balance); // undefined (无法直接访问私有变量)

// 2. 函数工厂
function createValidator(rule) {
    return function(value) {
        return rule(value);
    };
}

let isPositiveNumber = createValidator(num => typeof num === 'number' && num > 0);
let isValidEmail = createValidator(email => email.includes('@') && email.includes('.'));
let isLongEnough = createValidator(str => str.length >= 8);

console.log(isPositiveNumber(5)); // true
console.log(isValidEmail('test@example.com')); // true
console.log(isLongEnough('password123')); // true

// 3. 记忆化函数
function memoize(fn) {
    let cache = {};
    
    return function(...args) {
        let key = JSON.stringify(args);
        
        if (key in cache) {
            console.log('从缓存返回:', key);
            return cache[key];
        }
        
        let result = fn.apply(this, args);
        cache[key] = result;
        console.log('计算并缓存:', key);
        return result;
    };
}

// 斐波那契数列的记忆化版本
let fibonacci = memoize(function(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(10)); // 会显示计算过程
console.log(fibonacci(10)); // 从缓存返回，很快
```

### 3. 闭包的常见陷阱

```javascript
// 陷阱1：循环中的闭包
let functions = [];

// 错误的方式
for (var i = 0; i < 3; i++) {
    functions[i] = function() {
        return i; // 闭包捕获的是变量引用，不是值
    };
}

console.log('错误结果:');
functions.forEach((fn, index) => {
    console.log(`函数 ${index}:`, fn()); // 都输出 3
});

// 正确的方式1：使用IIFE
let correctFunctions1 = [];
for (var j = 0; j < 3; j++) {
    correctFunctions1[j] = (function(index) {
        return function() {
            return index; // 捕获参数值
        };
    })(j);
}

console.log('正确结果1:');
correctFunctions1.forEach((fn, index) => {
    console.log(`函数 ${index}:`, fn()); // 输出 0, 1, 2
});

// 正确的方式2：使用let（推荐）
let correctFunctions2 = [];
for (let k = 0; k < 3; k++) {
    correctFunctions2[k] = function() {
        return k; // let创建块级作用域
    };
}

console.log('正确结果2:');
correctFunctions2.forEach((fn, index) => {
    console.log(`函数 ${index}:`, fn()); // 输出 0, 1, 2
});

// 陷阱2：意外的闭包保留
function createLargeObjectProcessor() {
    let largeObject = new Array(1000000).fill('大量数据');
    
    // 错误：闭包保留了对整个largeObject的引用
    function badProcessor() {
        return largeObject.length;
    }
    
    // 正确：只保留需要的数据
    let length = largeObject.length;
    largeObject = null; // 释放大对象
    
    function goodProcessor() {
        return length;
    }
    
    return goodProcessor;
}
```

## ⚡ 箭头函数 (ES6)

### 1. 基本语法

```javascript
// 传统函数
let traditionalFunction = function(a, b) {
    return a + b;
};

// 箭头函数
let arrowFunction = (a, b) => {
    return a + b;
};

// 简化形式（单行表达式）
let simpleArrow = (a, b) => a + b;

// 单个参数可以省略括号
let square = x => x * x;

// 无参数需要括号
let getRandomNumber = () => Math.random();

// 返回对象字面量需要括号
let createUser = (name, age) => ({ name: name, age: age });

// 多行函数体需要大括号和return
let complexFunction = (x, y) => {
    let result = x * y;
    if (result > 100) {
        result = 100;
    }
    return result;
};

// 使用示例
console.log(simpleArrow(5, 3)); // 8
console.log(square(4)); // 16
console.log(getRandomNumber()); // 随机数
console.log(createUser('张三', 25)); // { name: '张三', age: 25 }
```

### 2. 箭头函数的特点

```javascript
// 1. 没有自己的this绑定
let obj = {
    name: '张三',
    
    // 传统函数方法
    traditionalMethod: function() {
        console.log('传统函数 this.name:', this.name);
        
        setTimeout(function() {
            console.log('setTimeout 传统函数 this.name:', this.name); // undefined
        }, 100);
        
        setTimeout(() => {
            console.log('setTimeout 箭头函数 this.name:', this.name); // '张三'
        }, 200);
    },
    
    // 箭头函数方法（不推荐用作对象方法）
    arrowMethod: () => {
        console.log('箭头函数方法 this.name:', this.name); // undefined
    }
};

obj.traditionalMethod();
obj.arrowMethod();

// 2. 没有arguments对象
function traditionalWithArgs() {
    console.log('传统函数 arguments:', arguments);
}

let arrowWithArgs = (...args) => {
    console.log('箭头函数 args:', args);
    // console.log(arguments); // ReferenceError
};

traditionalWithArgs(1, 2, 3);
arrowWithArgs(1, 2, 3);

// 3. 不能用作构造函数
function TraditionalConstructor(name) {
    this.name = name;
}

let ArrowConstructor = (name) => {
    this.name = name;
};

let instance1 = new TraditionalConstructor('张三'); // 正常
// let instance2 = new ArrowConstructor('李四'); // TypeError
```

### 3. 箭头函数的最佳实践

```javascript
// 1. 数组方法中的应用
let numbers = [1, 2, 3, 4, 5];

// 传统写法
let doubled1 = numbers.map(function(num) {
    return num * 2;
});

// 箭头函数写法
let doubled2 = numbers.map(num => num * 2);

// 链式调用
let result = numbers
    .filter(num => num > 2)
    .map(num => num * 2)
    .reduce((sum, num) => sum + num, 0);

console.log(result); // 24

// 2. 事件处理中的this绑定
class EventHandler {
    constructor(name) {
        this.name = name;
    }
    
    // 箭头函数保持this绑定
    handleClick = (event) => {
        console.log(`${this.name} 处理点击事件`);
    }
    
    // 传统方法需要bind
    handleClickTraditional(event) {
        console.log(`${this.name} 处理点击事件`);
    }
    
    setupEventListeners() {
        // 箭头函数自动绑定this
        document.addEventListener('click', this.handleClick);
        
        // 传统函数需要手动绑定
        document.addEventListener('click', this.handleClickTraditional.bind(this));
    }
}

// 3. 函数式编程风格
let users = [
    { name: '张三', age: 25, active: true },
    { name: '李四', age: 30, active: false },
    { name: '王五', age: 22, active: true }
];

// 链式操作
let activeUserNames = users
    .filter(user => user.active)
    .map(user => user.name)
    .sort();

console.log(activeUserNames); // ['张三', '王五']

// 复杂的数据处理
let processUsers = (users) => 
    users
        .filter(user => user.active && user.age >= 25)
        .map(user => ({
            ...user,
            category: user.age >= 30 ? 'senior' : 'junior'
        }))
        .sort((a, b) => a.age - b.age);

console.log(processUsers(users));
```

## 🎯 函数最佳实践

### 1. 函数设计原则

```javascript
// 1. 单一职责原则
// ❌ 职责过多的函数
function badUserProcessor(user) {
    // 验证用户数据
    if (!user.name || !user.email) {
        throw new Error('用户数据无效');
    }
    
    // 格式化数据
    user.name = user.name.trim().toLowerCase();
    
    // 保存到数据库
    database.save(user);
    
    // 发送邮件
    emailService.sendWelcome(user.email);
    
    // 记录日志
    logger.log(`用户 ${user.name} 已创建`);
}

// ✅ 职责分离
function validateUser(user) {
    if (!user.name || !user.email) {
        throw new Error('用户数据无效');
    }
    return true;
}

function formatUser(user) {
    return {
        ...user,
        name: user.name.trim().toLowerCase(),
        email: user.email.toLowerCase()
    };
}

function createUser(user) {
    validateUser(user);
    let formattedUser = formatUser(user);
    
    let savedUser = database.save(formattedUser);
    emailService.sendWelcome(savedUser.email);
    logger.log(`用户 ${savedUser.name} 已创建`);
    
    return savedUser;
}

// 2. 纯函数优先
// ❌ 有副作用的函数
let globalCounter = 0;
function impureIncrement() {
    globalCounter++; // 修改外部状态
    return globalCounter;
}

// ✅ 纯函数
function pureIncrement(counter) {
    return counter + 1; // 不修改输入，返回新值
}

// 3. 函数名要表达意图
// ❌ 不清晰的命名
function calc(x, y) {
    return x * y * 0.1;
}

// ✅ 清晰的命名
function calculateDiscount(price, quantity) {
    return price * quantity * 0.1;
}

function isValidEmail(email) {
    return email.includes('@') && email.includes('.');
}

function getUserDisplayName(user) {
    return user.displayName || user.name || '匿名用户';
}
```

### 2. 错误处理

```javascript
// 1. 输入验证
function divideNumbers(a, b) {
    // 类型检查
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('参数必须是数字');
    }
    
    // 业务逻辑检查
    if (b === 0) {
        throw new Error('除数不能为零');
    }
    
    return a / b;
}

// 安全调用
function safeDivide(a, b) {
    try {
        return divideNumbers(a, b);
    } catch (error) {
        console.error('除法运算错误:', error.message);
        return NaN;
    }
}

// 2. 异常处理策略
function processUserData(userData) {
    // 防御性编程
    if (!userData) {
        return { success: false, error: '用户数据为空' };
    }
    
    try {
        let user = validateAndFormatUser(userData);
        let result = saveUser(user);
        
        return { success: true, data: result };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            details: error.stack 
        };
    }
}
```

### 3. 性能优化

```javascript
// 1. 避免重复计算
// ❌ 重复计算
function inefficientFunction(items) {
    for (let i = 0; i < items.length; i++) {
        if (i < items.length / 2) { // 每次都计算length/2
            processItem(items[i]);
        }
    }
}

// ✅ 缓存计算结果
function efficientFunction(items) {
    const half = items.length / 2;
    for (let i = 0; i < half; i++) {
        processItem(items[i]);
    }
}

// 2. 使用适当的数据结构
// 查找优化
function findUserById(users, id) {
    // O(n) 线性查找
    return users.find(user => user.id === id);
}

// 使用Map进行O(1)查找
class UserManager {
    constructor(users) {
        this.userMap = new Map(users.map(user => [user.id, user]));
    }
    
    findById(id) {
        return this.userMap.get(id);
    }
}

// 3. 函数记忆化
function createMemoizedFunction(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// 昂贵的计算函数
const expensiveCalculation = createMemoizedFunction((n) => {
    console.log(`计算 ${n} 的结果...`);
    let result = 0;
    for (let i = 0; i < n * 1000000; i++) {
        result += i;
    }
    return result;
});

console.log(expensiveCalculation(100)); // 第一次调用，执行计算
console.log(expensiveCalculation(100)); // 第二次调用，从缓存返回
```

## 🎯 练习题

### 基础练习

1. **温度转换器**：实现华氏度和摄氏度互转
```javascript
function celsiusToFahrenheit(celsius) {
    // 实现摄氏度转华氏度
}

function fahrenheitToCelsius(fahrenheit) {
    // 实现华氏度转摄氏度
}
```

2. **数组操作函数**：实现常用数组操作
```javascript
function getMax(numbers) {
    // 返回数组中的最大值
}

function getAverage(numbers) {
    // 返回数组的平均值
}

function removeDuplicates(array) {
    // 移除数组中的重复元素
}
```

3. **字符串处理函数**：实现字符串工具函数
```javascript
function capitalizeWords(str) {
    // 将字符串中每个单词的首字母大写
}

function countVowels(str) {
    // 计算字符串中元音字母的数量
}

function reverseWords(str) {
    // 反转字符串中单词的顺序
}
```

### 进阶练习

4. **函数组合**：实现函数组合功能
```javascript
function compose(...functions) {
    // 实现函数组合，从右到左执行
    // compose(f, g, h)(x) 等价于 f(g(h(x)))
}

// 使用示例
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const composedFunction = compose(square, double, addOne);
console.log(composedFunction(3)); // (3 + 1) * 2 ^ 2 = 64
```

5. **柯里化函数**：实现函数柯里化
```javascript
function curry(fn) {
    // 实现柯里化功能
}

// 使用示例
function add(a, b, c) {
    return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
```

6. **防抖和节流**：实现常用的优化函数
```javascript
function debounce(func, delay) {
    // 实现防抖功能
}

function throttle(func, limit) {
    // 实现节流功能
}
```

## 🎯 小结

函数是 JavaScript 的核心概念：

### 核心要点
- ✅ **函数声明vs表达式**：理解提升和使用场景
- ✅ **参数处理**：默认参数、剩余参数、解构参数
- ✅ **返回值**：单值、多值、条件返回
- ✅ **作用域**：全局、函数、块级作用域
- ✅ **闭包**：数据封装和函数工厂
- ✅ **箭头函数**：简洁语法和this绑定

### 设计原则
- ✅ **单一职责**：一个函数做一件事
- ✅ **纯函数优先**：无副作用，可预测
- ✅ **有意义的命名**：函数名表达意图
- ✅ **错误处理**：输入验证和异常处理
- ✅ **性能考虑**：避免重复计算，使用缓存

### 最佳实践
- ✅ **早期返回**：减少嵌套
- ✅ **参数验证**：保证函数健壮性
- ✅ **函数式编程**：利用高阶函数
- ✅ **代码复用**：提取通用逻辑
- ✅ **文档注释**：说明函数用途

### 下一步学习
- 🚀 **[ES6+ 现代特性](../02-modern-features/)** - 现代 JavaScript 语法
- 🎯 **[实践练习](../examples/basic/)** - 函数编程实战
- 🔄 **[异步编程](../03-advanced/)** - Promise 和 async/await

函数是编程的基石，掌握函数是成为优秀开发者的关键！ 