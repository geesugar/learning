# 变量与数据类型

> 深入理解 JavaScript 的变量声明和数据类型系统

## 🎯 学习目标

- 掌握 `var`、`let`、`const` 的区别和使用场景
- 理解 JavaScript 的 8 种数据类型
- 学会类型检测和类型转换
- 理解变量作用域和变量提升
- 掌握引用类型和值类型的区别

## 📝 变量声明

### 1. var 声明（传统方式）

```javascript
// 基本用法
var name = '张三';
var age = 25;

// 特点1：函数作用域
function testVar() {
    if (true) {
        var x = 10;
    }
    console.log(x); // 10 - 可以访问
}

// 特点2：变量提升
console.log(hoistedVar); // undefined（不会报错）
var hoistedVar = 'Hello';

// 等价于：
// var hoistedVar;
// console.log(hoistedVar);
// hoistedVar = 'Hello';

// 特点3：可以重复声明
var message = 'First';
var message = 'Second'; // 不会报错

// 特点4：可以先使用后声明（因为提升）
function useVar() {
    console.log(typeof myVar); // "undefined"
    var myVar = 100;
}
```

### 2. let 声明（ES6 推荐）

```javascript
// 基本用法
let userName = '李四';
let userAge = 30;

// 特点1：块级作用域
function testLet() {
    if (true) {
        let y = 20;
    }
    // console.log(y); // ReferenceError: y is not defined
}

// 特点2：不存在变量提升（暂时性死区）
// console.log(letVar); // ReferenceError
let letVar = 'World';

// 特点3：不能重复声明
let count = 1;
// let count = 2; // SyntaxError: Identifier 'count' has already been declared

// 特点4：循环中的块级作用域
for (let i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i); // 输出 0, 1, 2
    }, 100);
}

// 对比 var 的情况
for (var j = 0; j < 3; j++) {
    setTimeout(() => {
        console.log(j); // 输出 3, 3, 3
    }, 200);
}
```

### 3. const 声明（ES6 常量）

```javascript
// 基本用法
const PI = 3.14159;
const COMPANY_NAME = '科技公司';

// 特点1：声明时必须初始化
// const value; // SyntaxError: Missing initializer in const declaration

// 特点2：不能重新赋值
const maxSize = 100;
// maxSize = 200; // TypeError: Assignment to constant variable

// 特点3：块级作用域（同 let）
if (true) {
    const temp = 'temporary';
}
// console.log(temp); // ReferenceError

// 特点4：对象和数组的内容可以修改
const user = { name: '王五', age: 28 };
user.age = 29; // 可以修改属性
user.city = '上海'; // 可以添加属性
console.log(user); // { name: '王五', age: 29, city: '上海' }

const numbers = [1, 2, 3];
numbers.push(4); // 可以修改数组内容
console.log(numbers); // [1, 2, 3, 4]

// 但不能重新赋值整个对象或数组
// user = {}; // TypeError
// numbers = []; // TypeError
```

### 4. 声明方式对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | 否（暂时性死区） | 否（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 初始化 | 可选 | 可选 | 必须 |

```javascript
// 最佳实践建议
// 1. 优先使用 const
const config = { timeout: 5000 };
const users = ['张三', '李四'];

// 2. 需要重新赋值时使用 let
let counter = 0;
let currentUser = null;

// 3. 避免使用 var（除非需要兼容老版本浏览器）
// var oldStyle = 'avoid'; // 不推荐
```

## 🏷️ 数据类型

JavaScript 有 8 种数据类型，分为原始类型和引用类型：

### 1. 原始类型（7种）

#### Number（数字）
```javascript
// 整数
let age = 25;
let year = 2024;

// 浮点数
let price = 99.99;
let pi = 3.14159;

// 科学计数法
let bigNumber = 1e6; // 1000000
let smallNumber = 1e-6; // 0.000001

// 特殊数值
let infinity = Infinity;
let negInfinity = -Infinity;
let notANumber = NaN;

// 数字的范围
console.log(Number.MAX_VALUE); // 最大值
console.log(Number.MIN_VALUE); // 最小正值
console.log(Number.MAX_SAFE_INTEGER); // 最大安全整数

// 数字方法
let num = 123.456;
console.log(num.toFixed(2)); // "123.46"
console.log(num.toPrecision(4)); // "123.5"
console.log(parseInt('123.456')); // 123
console.log(parseFloat('123.456')); // 123.456
```

#### String（字符串）
```javascript
// 字符串字面量
let name = '张三';
let message = "Hello World";
let multiline = `这是一个
多行字符串`;

// 模板字符串（ES6）
let userName = '李四';
let greeting = `你好，${userName}！今天是${new Date().getFullYear()}年。`;

// 字符串属性和方法
let text = 'JavaScript';
console.log(text.length); // 10
console.log(text.toUpperCase()); // "JAVASCRIPT"
console.log(text.toLowerCase()); // "javascript"
console.log(text.charAt(0)); // "J"
console.log(text.indexOf('Script')); // 4
console.log(text.slice(0, 4)); // "Java"
console.log(text.split('')); // ['J','a','v','a','S','c','r','i','p','t']

// 字符串是不可变的
let str = 'Hello';
str[0] = 'h'; // 无效操作
console.log(str); // 仍然是 "Hello"

// 字符串转换
let number = 123;
let stringFromNumber = String(number); // "123"
let stringFromTemplate = `${number}`; // "123"
```

#### Boolean（布尔值）
```javascript
// 基本布尔值
let isTrue = true;
let isFalse = false;

// 布尔转换
console.log(Boolean(1)); // true
console.log(Boolean(0)); // false
console.log(Boolean('hello')); // true
console.log(Boolean('')); // false
console.log(Boolean(null)); // false
console.log(Boolean(undefined)); // false

// 假值（falsy values）
let falsyValues = [
    false,
    0,
    -0,
    0n, // BigInt 零值
    '',
    null,
    undefined,
    NaN
];

// 真值（truthy values）- 除假值外的所有值
let truthyValues = [
    true,
    1,
    'hello',
    [],
    {},
    function() {}
];
```

#### undefined（未定义）
```javascript
// 变量声明但未赋值
let uninitialized;
console.log(uninitialized); // undefined

// 函数没有返回值
function noReturn() {
    // 没有 return 语句
}
console.log(noReturn()); // undefined

// 访问不存在的对象属性
let obj = {};
console.log(obj.nonExistent); // undefined

// 函数参数未传递
function test(param) {
    console.log(param); // undefined
}
test(); // 没有传递参数
```

#### null（空值）
```javascript
// 表示"无"、"空"或"值未知"
let data = null;
let emptyValue = null;

// null vs undefined
console.log(null == undefined); // true（相等）
console.log(null === undefined); // false（不全等）

// typeof 的特殊情况
console.log(typeof null); // "object"（历史遗留问题）
console.log(typeof undefined); // "undefined"
```

#### Symbol（符号，ES6）
```javascript
// 创建唯一标识符
let id1 = Symbol('id');
let id2 = Symbol('id');
console.log(id1 === id2); // false，每个 Symbol 都是唯一的

// 用作对象属性键
let obj = {};
let sym = Symbol('key');
obj[sym] = 'value';
console.log(obj[sym]); // "value"

// 全局 Symbol 注册表
let globalSym1 = Symbol.for('shared');
let globalSym2 = Symbol.for('shared');
console.log(globalSym1 === globalSym2); // true
```

#### BigInt（大整数，ES2020）
```javascript
// 表示任意精度的整数
let bigInt1 = 123n;
let bigInt2 = BigInt('123456789012345678901234567890');

// 不能与普通数字混合运算
// console.log(bigInt1 + 1); // TypeError
console.log(bigInt1 + 1n); // 124n

// 转换
console.log(Number(bigInt1)); // 123
console.log(String(bigInt1)); // "123"
```

### 2. 引用类型（1种）

#### Object（对象）
```javascript
// 对象字面量
let person = {
    name: '张三',
    age: 30,
    city: '北京'
};

// 数组也是对象
let numbers = [1, 2, 3, 4, 5];
console.log(typeof numbers); // "object"

// 函数也是对象
function greet() {
    return 'Hello';
}
console.log(typeof greet); // "function"

// 日期对象
let now = new Date();
console.log(typeof now); // "object"

// 正则表达式对象
let pattern = /\d+/;
console.log(typeof pattern); // "object"
```

## 🔍 类型检测

### 1. typeof 操作符

```javascript
// 基本类型检测
console.log(typeof 42); // "number"
console.log(typeof 'hello'); // "string"
console.log(typeof true); // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof Symbol('id')); // "symbol"
console.log(typeof 123n); // "bigint"

// 特殊情况
console.log(typeof null); // "object"（历史遗留问题）
console.log(typeof []); // "object"
console.log(typeof {}); // "object"
console.log(typeof function(){}); // "function"

// 实用检测函数
function getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

console.log(getType(null)); // "null"
console.log(getType([])); // "array"
console.log(getType({})); // "object"
```

### 2. instanceof 操作符

```javascript
// 检测对象的构造函数
let arr = [1, 2, 3];
let obj = {};
let date = new Date();

console.log(arr instanceof Array); // true
console.log(obj instanceof Object); // true
console.log(date instanceof Date); // true
console.log(arr instanceof Object); // true（数组继承自Object）

// 自定义构造函数
function Person(name) {
    this.name = name;
}

let person = new Person('张三');
console.log(person instanceof Person); // true
console.log(person instanceof Object); // true
```

### 3. 其他检测方法

```javascript
// Object.prototype.toString（最准确的方法）
function getAccurateType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
}

console.log(getAccurateType([])); // "Array"
console.log(getAccurateType({})); // "Object"
console.log(getAccurateType(null)); // "Null"
console.log(getAccurateType(new Date())); // "Date"
console.log(getAccurateType(/regex/)); // "RegExp"

// Array.isArray（检测数组）
console.log(Array.isArray([])); // true
console.log(Array.isArray({})); // false

// Number.isNaN（检测 NaN）
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN('hello')); // false
console.log(isNaN('hello')); // true（会先转换为数字）
```

## ↔️ 类型转换

### 1. 显式转换

```javascript
// 转换为字符串
let num = 123;
console.log(String(num)); // "123"
console.log(num.toString()); // "123"
console.log(num + ''); // "123"

// 转换为数字
let str = '456';
console.log(Number(str)); // 456
console.log(parseInt(str)); // 456
console.log(parseFloat('3.14')); // 3.14
console.log(+str); // 456
console.log(str * 1); // 456

// 转换为布尔值
console.log(Boolean(1)); // true
console.log(Boolean(0)); // false
console.log(!!1); // true（双重否定）
```

### 2. 隐式转换

```javascript
// 字符串拼接
console.log('5' + 3); // "53"
console.log('5' + true); // "5true"
console.log('5' + null); // "5null"

// 数学运算
console.log('5' - 3); // 2
console.log('5' * 2); // 10
console.log('5' / 2); // 2.5
console.log('5' % 2); // 1

// 比较运算
console.log('5' > 3); // true
console.log('5' == 5); // true
console.log('5' === 5); // false

// 逻辑运算
console.log(!!'hello'); // true
console.log(!''); // true
```

### 3. 转换规则总结

```javascript
// 原始值转换为字符串
console.log(String(123)); // "123"
console.log(String(true)); // "true"
console.log(String(null)); // "null"
console.log(String(undefined)); // "undefined"

// 原始值转换为数字
console.log(Number('123')); // 123
console.log(Number('12.3')); // 12.3
console.log(Number('')); // 0
console.log(Number(' ')); // 0
console.log(Number('hello')); // NaN
console.log(Number(true)); // 1
console.log(Number(false)); // 0
console.log(Number(null)); // 0
console.log(Number(undefined)); // NaN

// 对象转换
let obj = {
    valueOf: function() { return 42; },
    toString: function() { return 'object'; }
};

console.log(Number(obj)); // 42（优先调用 valueOf）
console.log(String(obj)); // "object"（优先调用 toString）
```

## 📦 值类型 vs 引用类型

### 1. 值类型（原始类型）

```javascript
// 值类型的赋值
let a = 5;
let b = a; // 复制值
b = 10;

console.log(a); // 5（不受影响）
console.log(b); // 10

// 值类型的比较
let x = 'hello';
let y = 'hello';
console.log(x === y); // true（比较值）

// 函数参数传递
function changeValue(val) {
    val = 100;
    return val;
}

let original = 50;
let result = changeValue(original);
console.log(original); // 50（不变）
console.log(result); // 100
```

### 2. 引用类型

```javascript
// 引用类型的赋值
let obj1 = { name: '张三' };
let obj2 = obj1; // 复制引用
obj2.name = '李四';

console.log(obj1.name); // "李四"（受影响）
console.log(obj2.name); // "李四"

// 引用类型的比较
let arr1 = [1, 2, 3];
let arr2 = [1, 2, 3];
let arr3 = arr1;

console.log(arr1 === arr2); // false（不同的对象）
console.log(arr1 === arr3); // true（相同的引用）

// 函数参数传递
function changeObject(obj) {
    obj.name = '王五';
    obj = { name: '赵六' }; // 重新赋值，但不影响外部
}

let person = { name: '张三' };
changeObject(person);
console.log(person.name); // "王五"（属性被修改）
```

### 3. 深拷贝 vs 浅拷贝

```javascript
// 浅拷贝
let original = {
    name: '张三',
    hobbies: ['读书', '游泳']
};

// 方法1：Object.assign
let shallow1 = Object.assign({}, original);

// 方法2：展开运算符
let shallow2 = { ...original };

shallow1.name = '李四'; // 不影响原对象
shallow1.hobbies.push('编程'); // 影响原对象的数组

console.log(original.hobbies); // ['读书', '游泳', '编程']

// 深拷贝（简单版本）
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    let cloned = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

let deep = deepClone(original);
deep.hobbies.push('绘画');
console.log(original.hobbies); // 不受影响

// JSON 方法（有限制）
let jsonClone = JSON.parse(JSON.stringify(original));
// 注意：无法处理函数、undefined、Symbol 等
```

## 🏷️ 变量作用域

### 1. 全局作用域

```javascript
// 全局变量
var globalVar = '全局变量';
let globalLet = '全局 let';
const GLOBAL_CONST = '全局常量';

function testGlobal() {
    console.log(globalVar); // 可以访问
    console.log(globalLet); // 可以访问
    console.log(GLOBAL_CONST); // 可以访问
}

// 隐式全局变量（严格模式下会报错）
function createImplicitGlobal() {
    implicitGlobal = '隐式全局'; // 没有声明关键字
}
createImplicitGlobal();
console.log(implicitGlobal); // "隐式全局"
```

### 2. 函数作用域

```javascript
function functionScope() {
    var functionVar = '函数变量';
    let functionLet = '函数 let';
    const FUNCTION_CONST = '函数常量';
    
    console.log(functionVar); // 可以访问
    console.log(functionLet); // 可以访问
    console.log(FUNCTION_CONST); // 可以访问
}

// console.log(functionVar); // ReferenceError
```

### 3. 块级作用域

```javascript
function blockScope() {
    if (true) {
        var blockVar = '块变量（var）';
        let blockLet = '块变量（let）';
        const BLOCK_CONST = '块变量（const）';
    }
    
    console.log(blockVar); // 可以访问（var 没有块级作用域）
    // console.log(blockLet); // ReferenceError
    // console.log(BLOCK_CONST); // ReferenceError
}
```

### 4. 作用域链

```javascript
let global = '全局';

function outer() {
    let outerVar = '外层';
    
    function inner() {
        let innerVar = '内层';
        
        console.log(innerVar); // "内层"
        console.log(outerVar); // "外层"（向上查找）
        console.log(global); // "全局"（继续向上查找）
    }
    
    inner();
    // console.log(innerVar); // ReferenceError
}

outer();
```

## 🔄 变量提升

### 1. var 的提升

```javascript
// 实际代码
console.log(hoistedVar); // undefined
var hoistedVar = 'Hello';

// JavaScript 解释器看到的等价代码
var hoistedVar;
console.log(hoistedVar); // undefined
hoistedVar = 'Hello';

// 函数内的提升
function testHoisting() {
    console.log(localVar); // undefined
    var localVar = 'Local';
    console.log(localVar); // "Local"
}
```

### 2. 函数的提升

```javascript
// 函数声明会完全提升
console.log(hoistedFunction()); // "我被提升了"

function hoistedFunction() {
    return '我被提升了';
}

// 函数表达式不会提升
// console.log(notHoisted()); // TypeError
var notHoisted = function() {
    return '我不会被提升';
};
```

### 3. let 和 const 的暂时性死区

```javascript
// 暂时性死区
console.log(typeof undeclaredVar); // "undefined"
// console.log(typeof letVar); // ReferenceError

let letVar = 'let 变量';
const constVar = 'const 变量';

// 块级作用域中的暂时性死区
function temporalDeadZone() {
    console.log(typeof outerLet); // ReferenceError
    
    if (true) {
        // console.log(innerLet); // ReferenceError
        let innerLet = 'inner';
        console.log(innerLet); // "inner"
    }
    
    let outerLet = 'outer';
}
```

## 💡 最佳实践

### 1. 变量声明原则

```javascript
// 1. 优先使用 const
const config = { timeout: 5000 };
const users = ['张三', '李四'];

// 2. 需要重新赋值时使用 let
let currentPage = 1;
let isLoading = false;

// 3. 避免使用 var
// var oldStyle = 'avoid';

// 4. 一次声明一个变量
const firstName = '张';
const lastName = '三';
const fullName = firstName + lastName;

// 5. 有意义的变量名
const userAccountBalance = 1000; // ✅ 好
const x = 1000; // ❌ 不好
```

### 2. 类型安全

```javascript
// 1. 类型检查函数
function isString(value) {
    return typeof value === 'string';
}

function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function isArray(value) {
    return Array.isArray(value);
}

// 2. 输入验证
function calculateArea(width, height) {
    if (!isNumber(width) || !isNumber(height)) {
        throw new TypeError('参数必须是数字');
    }
    
    if (width <= 0 || height <= 0) {
        throw new RangeError('参数必须大于零');
    }
    
    return width * height;
}

// 3. 安全的类型转换
function safeParseInt(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

console.log(safeParseInt('123')); // 123
console.log(safeParseInt('abc')); // 0
console.log(safeParseInt('abc', -1)); // -1
```

## 🎯 练习题

### 基础练习

1. **变量声明对比**：解释下面代码的输出结果
```javascript
var a = 1;
let b = 2;
const c = 3;

function test() {
    console.log(a, b, c);
    var a = 4;
    let b = 5;
    const c = 6;
    console.log(a, b, c);
}

test();
console.log(a, b, c);
```

2. **类型检测**：编写函数检测变量的准确类型
```javascript
function getType(value) {
    // 你的代码
}

// 测试
console.log(getType([])); // "array"
console.log(getType(null)); // "null"
console.log(getType(new Date())); // "date"
```

3. **类型转换**：预测下面表达式的结果
```javascript
console.log([] + []); // ?
console.log([] + {}); // ?
console.log({} + []); // ?
console.log(true + false); // ?
console.log('5' - '2'); // ?
console.log('5' + - '2'); // ?
```

### 进阶练习

4. **深拷贝实现**：实现一个完整的深拷贝函数
```javascript
function deepClone(obj) {
    // 处理各种数据类型的深拷贝
}
```

5. **作用域挑战**：解释下面代码的执行结果
```javascript
var x = 1;
function test() {
    console.log(x);
    if (false) {
        var x = 2;
    }
}
test();
```

## 🎯 小结

变量与数据类型是 JavaScript 的基础：

### 核心要点
- ✅ **变量声明**：`const` > `let` > `var`
- ✅ **8种数据类型**：7种原始类型 + 1种引用类型
- ✅ **类型检测**：`typeof`、`instanceof`、`Object.prototype.toString`
- ✅ **类型转换**：显式转换和隐式转换规则
- ✅ **作用域**：全局、函数、块级作用域
- ✅ **变量提升**：`var` 提升，`let`/`const` 暂时性死区

### 最佳实践
- ✅ **优先使用 `const`**：不变的值使用常量
- ✅ **合理使用 `let`**：需要重新赋值时使用
- ✅ **避免使用 `var`**：除非需要兼容性
- ✅ **有意义的命名**：变量名要表达含义
- ✅ **类型安全**：进行适当的类型检查和验证

### 下一步学习
- 🎛️ **[运算符与表达式](./05-operators.md)** - 掌握各种运算符
- 🔄 **[控制流程](./06-control-flow.md)** - 程序逻辑控制
- 📝 **[函数基础](./07-functions.md)** - 函数的定义和使用

理解变量和类型是掌握 JavaScript 的关键第一步！ 