# ES6+ 新语法特性

> 掌握现代 JavaScript 的核心语法改进

## 🎯 学习目标

- 理解 ES6+ 的核心语法特性
- 掌握 let/const 与 var 的区别
- 熟练使用箭头函数
- 学会默认参数和剩余参数
- 理解展开运算符的多种用法

## 📖 核心内容

### 1. let 和 const：块级作用域

#### 1.1 var 的问题

```javascript
// var 的问题示例
function example() {
    if (true) {
        var x = 1;
    }
    console.log(x); // 1 - var 没有块级作用域
}

// 变量提升问题
console.log(hoisted); // undefined（而不是报错）
var hoisted = "I'm hoisted";

// 循环中的闭包问题
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // 输出 3, 3, 3
}
```

#### 1.2 let：块级作用域变量

```javascript
// let 的块级作用域
function example() {
    if (true) {
        let x = 1;
        console.log(x); // 1
    }
    // console.log(x); // ReferenceError: x is not defined
}

// 暂时性死区
console.log(temporal); // ReferenceError: Cannot access 'temporal' before initialization
let temporal = "I'm temporal";

// 循环中的块级作用域
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // 输出 0, 1, 2
}

// 重复声明检测
let duplicate = 1;
// let duplicate = 2; // SyntaxError: Identifier 'duplicate' has already been declared
```

#### 1.3 const：常量声明

```javascript
// 基本用法
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

// 对象和数组的const
const obj = { name: "JavaScript" };
obj.name = "ES6"; // 可以修改属性
obj.version = "2015"; // 可以添加属性
// obj = {}; // TypeError: Assignment to constant variable

const arr = [1, 2, 3];
arr.push(4); // 可以修改数组内容
// arr = []; // TypeError: Assignment to constant variable

// 解构赋值中的const
const [first, second] = [1, 2];
const { name, age } = { name: "Alice", age: 30 };
```

#### 1.4 最佳实践

```javascript
// 推荐的声明方式选择
// 1. 默认使用 const
const config = { apiUrl: "https://api.example.com" };

// 2. 需要重新赋值时使用 let
let counter = 0;
counter++;

// 3. 避免使用 var（除非有特殊需要）
// var legacy = "avoid this";

// 4. 循环中的使用
for (const item of items) {
    // 每次迭代都是新的const绑定
    console.log(item);
}

for (let i = 0; i < 10; i++) {
    // 需要修改的循环变量使用let
    if (i === 5) break;
}
```

### 2. 箭头函数

#### 2.1 基本语法

```javascript
// 传统函数
function add(a, b) {
    return a + b;
}

// 箭头函数的不同写法
const add = (a, b) => a + b;                    // 简洁形式
const add = (a, b) => { return a + b; };        // 完整形式
const square = x => x * x;                      // 单参数省略括号
const greet = () => "Hello World";              // 无参数
const getId = () => ({ id: 1, name: "user" });  // 返回对象字面量
```

#### 2.2 箭头函数的特殊性

```javascript
// 1. 没有自己的 this
const obj = {
    name: "Object",
    
    // 传统方法
    traditionalMethod: function() {
        console.log(this.name); // "Object"
        
        setTimeout(function() {
            console.log(this.name); // undefined（非严格模式）或报错（严格模式）
        }, 100);
    },
    
    // 箭头函数方法
    arrowMethod: function() {
        console.log(this.name); // "Object"
        
        setTimeout(() => {
            console.log(this.name); // "Object" - 继承外层this
        }, 100);
    }
};

// 2. 不能用作构造器
const ArrowConstructor = () => {
    this.name = "Arrow";
};
// new ArrowConstructor(); // TypeError: ArrowConstructor is not a constructor

// 3. 没有 arguments 对象
function traditional() {
    console.log(arguments); // Arguments对象
}

const arrow = () => {
    // console.log(arguments); // ReferenceError: arguments is not defined
    // 使用剩余参数代替
};

const arrowWithRest = (...args) => {
    console.log(args); // 真正的数组
};
```

#### 2.3 箭头函数的应用场景

```javascript
// 数组方法中的应用
const numbers = [1, 2, 3, 4, 5];

// map
const doubled = numbers.map(x => x * 2);
const squared = numbers.map(x => x ** 2);

// filter
const evens = numbers.filter(x => x % 2 === 0);
const positives = numbers.filter(x => x > 0);

// reduce
const sum = numbers.reduce((acc, x) => acc + x, 0);
const max = numbers.reduce((acc, x) => Math.max(acc, x));

// sort
const sorted = numbers.sort((a, b) => a - b);
const people = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 35 }
];
const sortedByAge = people.sort((a, b) => a.age - b.age);

// 事件处理（保持this绑定）
class Button {
    constructor(element) {
        this.element = element;
        this.clickCount = 0;
        
        // 箭头函数保持this绑定
        this.element.addEventListener('click', () => {
            this.clickCount++;
            console.log(`Clicked ${this.clickCount} times`);
        });
    }
}
```

### 3. 默认参数

#### 3.1 基本用法

```javascript
// ES5 的默认参数
function greetOld(name, greeting) {
    greeting = greeting || "Hello";
    return greeting + ", " + name + "!";
}

// ES6 的默认参数
function greet(name, greeting = "Hello") {
    return `${greeting}, ${name}!`;
}

console.log(greet("Alice"));           // "Hello, Alice!"
console.log(greet("Bob", "Hi"));       // "Hi, Bob!"
console.log(greet("Charlie", ""));     // ", Charlie!" (空字符串是falsy)

// 与 || 的区别
function example(value = "default") {
    return value;
}

console.log(example());          // "default"
console.log(example(undefined)); // "default"
console.log(example(null));      // null
console.log(example(0));         // 0
console.log(example(""));        // ""
```

#### 3.2 默认参数的高级用法

```javascript
// 默认参数可以是表达式
function createUser(name, id = Date.now()) {
    return { name, id };
}

// 默认参数可以引用其他参数
function greetUser(firstName, lastName, fullName = `${firstName} ${lastName}`) {
    return `Hello, ${fullName}!`;
}

// 默认参数可以是函数调用
function log(message, timestamp = new Date().toISOString()) {
    console.log(`[${timestamp}] ${message}`);
}

// 使用函数作为默认参数
function required() {
    throw new Error("Missing required parameter");
}

function createAccount(name = required(), email = required()) {
    return { name, email };
}

// 复杂的默认参数
function processData(data, options = {}) {
    const {
        format = 'json',
        compress = true,
        validate = false
    } = options;
    
    // 处理逻辑
    return { data, format, compress, validate };
}
```

### 4. 剩余参数（Rest Parameters）

#### 4.1 基本用法

```javascript
// 传统的arguments对象
function sumOld() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}

// 剩余参数
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15

// 结合普通参数
function greetAll(greeting, ...names) {
    return names.map(name => `${greeting}, ${name}!`);
}

console.log(greetAll("Hello", "Alice", "Bob", "Charlie"));
// ["Hello, Alice!", "Hello, Bob!", "Hello, Charlie!"]
```

#### 4.2 剩余参数的应用

```javascript
// 函数重载模拟
function createUser(name, ...details) {
    const user = { name };
    
    if (details.length === 1) {
        if (typeof details[0] === 'string') {
            user.email = details[0];
        } else {
            Object.assign(user, details[0]);
        }
    } else if (details.length === 2) {
        [user.email, user.age] = details;
    }
    
    return user;
}

console.log(createUser("Alice", "alice@example.com"));
console.log(createUser("Bob", "bob@example.com", 25));
console.log(createUser("Charlie", { email: "charlie@example.com", age: 30 }));

// 高阶函数中的应用
function logger(level) {
    return function(message, ...args) {
        console.log(`[${level}] ${message}`, ...args);
    };
}

const info = logger('INFO');
const error = logger('ERROR');

info('User logged in', { userId: 123 });
error('Database connection failed', { error: 'ECONNREFUSED' });
```

### 5. 展开运算符（Spread Operator）

#### 5.1 数组展开

```javascript
// 展开数组
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 合并数组
const combined = [...arr1, ...arr2];           // [1, 2, 3, 4, 5, 6]
const withMiddle = [...arr1, 'middle', ...arr2]; // [1, 2, 3, 'middle', 4, 5, 6]

// 复制数组
const copied = [...arr1];                      // [1, 2, 3]
const original = [1, 2, 3];
const shallow = [...original];
shallow.push(4);
console.log(original); // [1, 2, 3] - 原数组不变

// 转换类数组对象
const nodeList = document.querySelectorAll('div');
const array = [...nodeList];

// 字符串展开
const str = "hello";
const chars = [...str];                        // ['h', 'e', 'l', 'l', 'o']
```

#### 5.2 对象展开

```javascript
// 对象展开（ES2018）
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

// 合并对象
const merged = { ...obj1, ...obj2 };           // { a: 1, b: 2, c: 3, d: 4 }

// 覆盖属性
const updated = { ...obj1, b: 20, e: 5 };      // { a: 1, b: 20, e: 5 }

// 复制对象
const copied = { ...obj1 };

// 条件属性
const includeOptional = true;
const config = {
    required: true,
    ...(includeOptional && { optional: true })
};
```

#### 5.3 函数调用中的展开

```javascript
// 函数参数展开
function sum(a, b, c) {
    return a + b + c;
}

const numbers = [1, 2, 3];
console.log(sum(...numbers));                 // 6

// Math 函数中的应用
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
console.log(Math.max(...nums));               // 9
console.log(Math.min(...nums));               // 1

// 数组方法中的应用
const parts = ['shoulders', 'knees'];
const body = ['head', ...parts, 'and', 'toes'];
console.log(body);                            // ['head', 'shoulders', 'knees', 'and', 'toes']
```

### 6. 对象字面量增强

#### 6.1 属性简写

```javascript
// ES5 写法
const name = "Alice";
const age = 30;
const person = {
    name: name,
    age: age,
    greet: function() {
        return "Hello, " + this.name;
    }
};

// ES6 属性简写
const personES6 = {
    name,              // 等同于 name: name
    age,               // 等同于 age: age
    greet() {          // 等同于 greet: function()
        return `Hello, ${this.name}`;
    }
};
```

#### 6.2 计算属性名

```javascript
// 动态属性名
const propName = 'score';
const user = {
    name: 'Alice',
    [propName]: 95,                    // 等同于 score: 95
    [`${propName}History`]: [90, 85, 95], // 等同于 scoreHistory: [...]
    ['user' + 'Id']: 123              // 等同于 userId: 123
};

// 在函数中使用
function createObject(key, value) {
    return {
        [key]: value,
        [`${key}Timestamp`]: Date.now()
    };
}

const result = createObject('data', 'important');
// { data: 'important', dataTimestamp: 1634567890123 }
```

#### 6.3 方法定义简写

```javascript
// ES5 写法
const calculator = {
    add: function(a, b) {
        return a + b;
    },
    multiply: function(a, b) {
        return a * b;
    }
};

// ES6 方法简写
const calculatorES6 = {
    add(a, b) {
        return a + b;
    },
    multiply(a, b) {
        return a * b;
    },
    
    // 生成器方法
    *fibonacci() {
        let [a, b] = [0, 1];
        while (true) {
            yield a;
            [a, b] = [b, a + b];
        }
    },
    
    // 异步方法
    async fetchData() {
        const response = await fetch('/api/data');
        return response.json();
    }
};
```

## 🎯 实际应用示例

### 示例1：配置对象处理

```javascript
// 使用ES6+特性处理配置
function createApiClient(baseUrl, options = {}) {
    const {
        timeout = 5000,
        retries = 3,
        headers = {},
        ...otherOptions
    } = options;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    const config = {
        baseUrl,
        timeout,
        retries,
        headers: { ...defaultHeaders, ...headers },
        ...otherOptions
    };
    
    return {
        get: (path, ...args) => fetch(`${baseUrl}${path}`, { ...config, ...args }),
        post: (path, data, ...args) => fetch(`${baseUrl}${path}`, { 
            ...config, 
            method: 'POST',
            body: JSON.stringify(data),
            ...args 
        })
    };
}

// 使用示例
const api = createApiClient('https://api.example.com', {
    timeout: 10000,
    headers: { 'Authorization': 'Bearer token123' }
});
```

### 示例2：事件处理器

```javascript
class EventManager {
    constructor() {
        this.listeners = new Map();
    }
    
    // 使用剩余参数和箭头函数
    on(event, ...callbacks) {
        const existing = this.listeners.get(event) || [];
        this.listeners.set(event, [...existing, ...callbacks]);
        return this;
    }
    
    emit(event, ...args) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(...args));
        return this;
    }
    
    // 使用默认参数
    once(event, callback, timeout = 0) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        
        this.on(event, onceCallback);
        
        if (timeout > 0) {
            setTimeout(() => this.off(event, onceCallback), timeout);
        }
        
        return this;
    }
    
    off(event, callback) {
        if (!callback) {
            this.listeners.delete(event);
            return this;
        }
        
        const callbacks = this.listeners.get(event) || [];
        const filtered = callbacks.filter(cb => cb !== callback);
        
        if (filtered.length === 0) {
            this.listeners.delete(event);
        } else {
            this.listeners.set(event, filtered);
        }
        
        return this;
    }
}

// 使用示例
const events = new EventManager();

events
    .on('user:login', (user) => console.log(`User ${user.name} logged in`))
    .on('user:login', (user) => console.log(`Welcome back, ${user.name}!`))
    .once('app:ready', () => console.log('App is ready!'))
    .emit('user:login', { name: 'Alice', id: 123 });
```

## 🎁 最佳实践

1. **变量声明**：默认使用 `const`，需要重新赋值时使用 `let`，避免 `var`
2. **箭头函数**：简洁的回调函数使用箭头函数，需要动态 `this` 时使用传统函数
3. **默认参数**：使用默认参数代替 `||` 操作符，提高代码可读性
4. **剩余参数**：使用剩余参数代替 `arguments` 对象
5. **展开运算符**：使用展开运算符进行数组/对象的复制和合并
6. **对象简写**：充分利用对象字面量的简写语法

## 🔄 练习题

1. 将以下 ES5 代码重构为 ES6+：
   ```javascript
   function createUser(name, email, options) {
       options = options || {};
       var age = options.age || 18;
       var role = options.role || 'user';
       
       return {
           name: name,
           email: email,
           age: age,
           role: role,
           greet: function() {
               return 'Hello, ' + this.name;
           }
       };
   }
   ```

2. 实现一个通用的日志函数，支持不同级别和多个参数

3. 创建一个配置合并工具，支持深度合并和默认值

通过这些ES6+特性，我们可以写出更简洁、更易读的JavaScript代码！ 