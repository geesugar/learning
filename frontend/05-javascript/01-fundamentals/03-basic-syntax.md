# JavaScript 基础语法

> 掌握 JavaScript 的基本语法规则和编码规范

## 🎯 学习目标

- 掌握 JavaScript 语法的基本规则
- 理解标识符和关键字的使用
- 学会正确的代码书写风格
- 掌握注释和语句的编写
- 了解严格模式的使用

## 📖 语法基础

### 1. 区分大小写

JavaScript 是区分大小写的语言，这意味着：

```javascript
// 这些是不同的变量
let userName = '张三';
let UserName = '李四';
let USERNAME = '王五';

console.log(userName);  // "张三"
console.log(UserName);  // "李四" 
console.log(USERNAME);  // "王五"

// 函数名也区分大小写
function sayHello() {
    return '你好';
}

function SayHello() {
    return 'Hello';
}

console.log(sayHello());  // "你好"
console.log(SayHello());  // "Hello"
```

### 2. 语句和分号

JavaScript 中的语句可以用分号结束，但不是必须的：

```javascript
// 推荐：使用分号
let name = '张三';
let age = 25;
console.log(name);

// 也可以：不使用分号（依赖自动分号插入）
let city = '北京'
let country = '中国'
console.log(city)

// 注意：某些情况下不使用分号可能导致问题
let a = 1
let b = 2
(function() {
    console.log('立即执行函数');
})(); // 这会被解析为 let b = 2(function()...)()

// 正确的写法
let c = 1;
let d = 2;
(function() {
    console.log('立即执行函数');
})();
```

**最佳实践**：总是使用分号结束语句，避免自动分号插入带来的问题。

### 3. 标识符规则

标识符用于变量名、函数名、属性名等，必须遵循以下规则：

```javascript
// ✅ 合法的标识符
let userName;
let user_name;
let $element;
let _private;
let 用户名;          // 支持 Unicode 字符
let firstName2;
let XMLHttpRequest;

// ❌ 非法的标识符
// let 2user;        // 不能以数字开头
// let user-name;    // 不能包含连字符
// let user name;    // 不能包含空格
// let for;          // 不能使用关键字

// 约定俗成的命名风格
let userAge;           // 驼峰命名法（推荐用于变量和函数）
let USER_TYPE;         // 全大写（用于常量）
let UserService;       // 帕斯卡命名法（用于构造函数和类）
let _privateVar;       // 下划线前缀（表示私有）
let $jQueryElement;    // 美元符前缀（常用于 jQuery 对象）
```

### 4. 关键字和保留字

JavaScript 有一些关键字和保留字不能用作标识符：

```javascript
// 关键字（当前版本使用的）
/*
break, case, catch, class, const, continue, debugger, default, delete,
do, else, export, extends, finally, for, function, if, import, in,
instanceof, let, new, return, super, switch, this, throw, try, typeof,
var, void, while, with, yield
*/

// 保留字（未来可能使用的）
/*
enum, implements, interface, package, private, protected, public, static
*/

// 严格模式下的额外保留字
/*
arguments, eval
*/

// 示例：避免使用关键字
// let if = 10;       // ❌ 错误
// let class = 'A';   // ❌ 错误

let condition = true;  // ✅ 正确
let className = 'A';   // ✅ 正确
```

## 💬 注释

### 1. 单行注释

```javascript
// 这是单行注释
let name = '张三';  // 行尾注释

// 用于禁用某行代码
// console.log('这行被注释了');

// 多行单行注释
// 这是第一行注释
// 这是第二行注释
// 这是第三行注释
```

### 2. 多行注释

```javascript
/*
这是多行注释
可以跨越多行
用于详细说明
*/

let age = 25;

/*
* 这是带星号的多行注释格式
* 通常用于函数或模块的文档说明
* 提高代码可读性
*/

function calculateAge(birthYear) {
    /*
    计算年龄的函数
    参数：birthYear - 出生年份
    返回：当前年龄
    */
    return new Date().getFullYear() - birthYear;
}
```

### 3. JSDoc 注释

```javascript
/**
 * 计算两个数的和
 * @param {number} a 第一个数字
 * @param {number} b 第二个数字
 * @returns {number} 两数之和
 * @example
 * // 示例用法
 * const result = add(3, 5);
 * console.log(result); // 8
 */
function add(a, b) {
    return a + b;
}

/**
 * 用户类
 * @class
 */
class User {
    /**
     * 创建用户实例
     * @param {string} name 用户名
     * @param {number} age 年龄
     */
    constructor(name, age) {
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.age = age;
    }
    
    /**
     * 获取用户信息
     * @returns {string} 用户信息字符串
     */
    getInfo() {
        return `${this.name}, ${this.age}岁`;
    }
}
```

## 📝 语句类型

### 1. 表达式语句

```javascript
// 变量赋值
let x = 10;

// 函数调用
console.log('Hello');

// 运算表达式
x + 5;

// 对象属性访问
user.name;

// 数组元素访问
arr[0];
```

### 2. 声明语句

```javascript
// 变量声明
var oldStyle;
let modernStyle;
const CONSTANT_VALUE = 42;

// 函数声明
function greet(name) {
    return `Hello, ${name}!`;
}

// 类声明（ES6+）
class Person {
    constructor(name) {
        this.name = name;
    }
}
```

### 3. 控制语句

```javascript
// 条件语句
if (age >= 18) {
    console.log('成年人');
} else {
    console.log('未成年人');
}

// 循环语句
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// 跳转语句
for (let i = 0; i < 10; i++) {
    if (i === 5) break;
    console.log(i);
}
```

## 🔒 严格模式

### 1. 启用严格模式

```javascript
// 整个脚本使用严格模式
'use strict';

let name = '张三';

// 函数内使用严格模式
function strictFunction() {
    'use strict';
    // 这个函数在严格模式下执行
}

// ES6 模块和类自动使用严格模式
class MyClass {
    // 自动在严格模式下
}
```

### 2. 严格模式的限制

```javascript
'use strict';

// ❌ 不能使用未声明的变量
// username = '张三';  // ReferenceError

// ✅ 必须先声明
let username = '张三';

// ❌ 不能删除变量
// delete username;  // SyntaxError

// ❌ 不能使用八进制字面量
// let num = 010;  // SyntaxError

// ✅ 使用十进制或明确的八进制
let num1 = 8;      // 十进制
let num2 = 0o10;   // ES6 八进制语法

// ❌ 函数参数名不能重复
// function test(a, a) {  // SyntaxError
//     return a;
// }

// ❌ 不能使用 with 语句
// with (obj) {  // SyntaxError
//     prop = 1;
// }
```

### 3. 严格模式的好处

```javascript
'use strict';

// 1. 防止意外创建全局变量
function createUser() {
    // name = '张三';  // 在非严格模式下会创建全局变量
    let name = '张三';  // 严格模式下必须声明
}

// 2. this 指向更明确
function regularFunction() {
    console.log(this);  // 严格模式下是 undefined，非严格模式下是全局对象
}

// 3. 防止删除不可删除的属性
// delete Object.prototype;  // 严格模式下会报错

// 4. eval 不会创建变量
eval('var x = 1');
// console.log(x);  // 严格模式下 x 未定义
```

## 🎨 代码风格

### 1. 缩进和空格

```javascript
// ✅ 推荐：使用 2 或 4 个空格缩进
function calculateTotal(items) {
    let total = 0;
    
    for (let item of items) {
        if (item.price > 0) {
            total += item.price;
        }
    }
    
    return total;
}

// 运算符周围的空格
let result = a + b * c;
let isValid = (age >= 18) && (hasLicense === true);

// 函数调用的空格
console.log('Hello, World!');
setTimeout(callback, 1000);
```

### 2. 命名约定

```javascript
// 变量和函数：驼峰命名法
let firstName = '张';
let lastName = '三';

function getUserName() {
    return firstName + lastName;
}

// 常量：全大写，下划线分隔
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// 构造函数和类：帕斯卡命名法
function User(name, age) {
    this.name = name;
    this.age = age;
}

class HttpRequest {
    constructor(url) {
        this.url = url;
    }
}

// 私有成员：下划线前缀
class BankAccount {
    constructor(balance) {
        this._balance = balance;  // 约定为私有
    }
    
    _validateAmount(amount) {   // 私有方法
        return amount > 0;
    }
}
```

### 3. 代码组织

```javascript
// ✅ 好的代码组织
// 1. 常量定义
const TIMEOUT_DURATION = 5000;
const ERROR_MESSAGES = {
    NETWORK_ERROR: '网络连接失败',
    INVALID_INPUT: '输入数据无效'
};

// 2. 工具函数
function formatDate(date) {
    return date.toLocaleDateString('zh-CN');
}

function validateEmail(email) {
    return email.includes('@') && email.includes('.');
}

// 3. 主要功能
class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(userData) {
        if (this._validateUserData(userData)) {
            this.users.push(userData);
        }
    }
    
    _validateUserData(userData) {
        return userData.name && validateEmail(userData.email);
    }
}

// 4. 初始化代码
const userManager = new UserManager();
```

## 📚 编码最佳实践

### 1. 变量声明

```javascript
// ✅ 好的做法
// 使用 const 优于 let，let 优于 var
const PI = 3.14159;
let counter = 0;

// 一次声明一个变量
const userName = '张三';
const userAge = 25;
const userEmail = 'zhangsan@example.com';

// ❌ 避免的做法
// var a, b, c;  // 同时声明多个变量
// let x = y = z = 0;  // 链式赋值可能创建全局变量
```

### 2. 函数定义

```javascript
// ✅ 函数应该职责单一
function calculateTax(income) {
    return income * 0.1;
}

function formatCurrency(amount) {
    return `¥${amount.toFixed(2)}`;
}

// ❌ 避免函数做太多事情
function processUser(userData) {
    // 验证、保存、发邮件、记录日志... 太复杂
}

// ✅ 拆分成多个函数
function validateUser(userData) { /* ... */ }
function saveUser(userData) { /* ... */ }
function sendWelcomeEmail(userData) { /* ... */ }
function logUserActivity(userData) { /* ... */ }
```

### 3. 错误处理

```javascript
// ✅ 使用适当的错误处理
function divide(a, b) {
    if (b === 0) {
        throw new Error('除数不能为零');
    }
    return a / b;
}

try {
    const result = divide(10, 0);
    console.log(result);
} catch (error) {
    console.error('计算错误:', error.message);
}

// ✅ 验证输入参数
function createUser(name, email) {
    if (!name || typeof name !== 'string') {
        throw new TypeError('name 必须是非空字符串');
    }
    
    if (!email || !email.includes('@')) {
        throw new TypeError('email 格式无效');
    }
    
    return { name, email, id: Date.now() };
}
```

## 🛠️ 开发工具配置

### 1. ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'camelcase': 'error'
    }
};
```

### 2. Prettier 配置

```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4,
    "useTabs": false,
    "bracketSpacing": true,
    "arrowParens": "avoid"
}
```

## 🎯 练习题

### 基础练习

1. **语法检查**：找出下面代码中的语法错误
```javascript
let 2name = '张三';
function user-info() {
    return name + age
}
let for = 10;
```

2. **命名规范**：将下面的标识符改为符合规范的命名
```javascript
let UserName;      // 变量名
let MAX_age;       // 常量名
function User();   // 普通函数名
```

3. **注释编写**：为下面的函数添加 JSDoc 注释
```javascript
function calculateDiscount(price, percentage) {
    return price * (1 - percentage / 100);
}
```

### 进阶练习

4. **严格模式**：解释下面代码在严格模式和非严格模式下的不同行为
```javascript
function test() {
    name = '张三';
    return name;
}
```

5. **代码重构**：重构下面的代码，使其符合最佳实践
```javascript
var x=10,y=20,z=30;
function calc(a,b,c){
if(a>b){
return a+c
}else{
return b+c
}}
```

## 🎯 小结

掌握 JavaScript 基础语法是编程的第一步：

### 核心要点
- ✅ **区分大小写**：变量名、函数名严格区分
- ✅ **标识符规则**：字母、数字、下划线、美元符号组合
- ✅ **语句分号**：建议总是使用分号结束语句
- ✅ **注释规范**：单行、多行、JSDoc 注释的正确使用
- ✅ **严格模式**：提高代码质量，避免常见错误

### 编程习惯
- ✅ **命名规范**：有意义的变量名和函数名
- ✅ **代码风格**：一致的缩进和空格使用
- ✅ **错误处理**：适当的异常处理和输入验证
- ✅ **代码组织**：模块化和职责单一原则

### 下一步学习
- 📖 **[变量与数据类型](./04-variables-types.md)** - 深入理解数据类型
- 🎛️ **[运算符与表达式](./05-operators.md)** - 掌握各种运算符
- 🔄 **[控制流程](./06-control-flow.md)** - 程序逻辑控制

良好的语法基础是编写高质量 JavaScript 代码的前提！ 