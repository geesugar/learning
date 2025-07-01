# 闭包与词法作用域

> 深入理解 JavaScript 的执行机制和闭包概念

## 📖 学习目标

完成本章学习后，你将能够：
- 理解执行上下文和执行栈的概念
- 掌握词法作用域和作用域链的工作原理
- 深入理解闭包的概念和形成条件
- 熟练应用闭包解决实际问题
- 了解闭包相关的内存管理和性能考虑

## 🎯 核心概念

### 1. 执行上下文 (Execution Context)

执行上下文是 JavaScript 代码执行时的环境，包含：
- **变量对象 (Variable Object)**：存储变量、函数声明
- **作用域链 (Scope Chain)**：变量查找的路径
- **this 值**：当前执行上下文中 this 的指向

```javascript
// 执行上下文示例
console.log('全局执行上下文');

function outerFunction() {
    console.log('外层函数执行上下文');
    var outerVar = 'outer';
    
    function innerFunction() {
        console.log('内层函数执行上下文');
        var innerVar = 'inner';
        console.log(outerVar); // 通过作用域链访问外层变量
    }
    
    return innerFunction;
}

var closure = outerFunction(); // 创建闭包
closure(); // 执行闭包函数
```

### 2. 词法作用域 (Lexical Scope)

词法作用域是指作用域在代码**写的时候**就确定了，不是在运行时确定。

```javascript
var globalVar = 'global';

function parent() {
    var parentVar = 'parent';
    
    function child() {
        var childVar = 'child';
        
        // 变量查找顺序：child作用域 -> parent作用域 -> global作用域
        console.log(childVar);   // 'child' - 在当前作用域找到
        console.log(parentVar);  // 'parent' - 在父级作用域找到
        console.log(globalVar);  // 'global' - 在全局作用域找到
    }
    
    return child;
}

var childFunction = parent();
childFunction();
```

### 3. 作用域链 (Scope Chain)

作用域链是变量查找的路径，从当前作用域开始，逐级向上查找。

```javascript
// 作用域链演示
var level0 = 'global';

function level1() {
    var level1Var = 'level1';
    
    function level2() {
        var level2Var = 'level2';
        
        function level3() {
            var level3Var = 'level3';
            
            // 作用域链：level3 -> level2 -> level1 -> global
            console.log(`访问顺序：
                ${level3Var} (当前作用域)
                ${level2Var} (父级作用域)
                ${level1Var} (祖父级作用域)
                ${level0} (全局作用域)
            `);
        }
        
        return level3;
    }
    
    return level2;
}

// 创建深层嵌套的作用域链
var deepFunction = level1()();
deepFunction();
```

## 🔒 闭包深入理解

### 闭包的定义

**闭包** = 函数 + 函数能够访问的自由变量

```javascript
// 经典闭包示例
function createCounter() {
    let count = 0; // 自由变量
    
    return function() { // 返回的函数形成闭包
        count++; // 访问外部变量
        return count;
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 - 独立的闭包环境
console.log(counter1()); // 3
```

### 闭包的形成条件

1. 函数嵌套
2. 内部函数引用外部函数的变量
3. 内部函数被外部调用

```javascript
// 条件1：函数嵌套
function outer() {
    var outerVar = 'I am outer';
    
    // 条件2：内部函数引用外部变量
    function inner() {
        console.log(outerVar);
    }
    
    // 条件3：内部函数被返回到外部
    return inner;
}

// 形成闭包
var closureFunction = outer();
closureFunction(); // "I am outer"
```

### 闭包的实际应用

#### 1. 数据私有化

```javascript
// 模块模式 - 创建私有变量
function createBankAccount(initialBalance) {
    let balance = initialBalance; // 私有变量
    let transactionHistory = []; // 私有变量
    
    return {
        // 公共接口
        deposit(amount) {
            if (amount > 0) {
                balance += amount;
                transactionHistory.push(`存款：${amount}`);
                return balance;
            }
            throw new Error('存款金额必须大于0');
        },
        
        withdraw(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                transactionHistory.push(`取款：${amount}`);
                return balance;
            }
            throw new Error('余额不足或取款金额无效');
        },
        
        getBalance() {
            return balance;
        },
        
        getHistory() {
            return [...transactionHistory]; // 返回副本，保护原数据
        }
    };
}

// 使用示例
const account = createBankAccount(1000);
console.log(account.getBalance()); // 1000
account.deposit(500);
console.log(account.getBalance()); // 1500
account.withdraw(200);
console.log(account.getHistory()); // ['存款：500', '取款：200']

// 无法直接访问私有变量
console.log(account.balance); // undefined
```

#### 2. 函数工厂

```javascript
// 创建特定功能的函数
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
const quadruple = createMultiplier(4);

console.log(double(5));     // 10
console.log(triple(5));     // 15
console.log(quadruple(5));  // 20

// 创建验证器工厂
function createValidator(rule) {
    return function(value) {
        return rule(value);
    };
}

const isEmail = createValidator(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
const isPhone = createValidator(phone => /^1[3-9]\d{9}$/.test(phone));
const isIdCard = createValidator(id => /^\d{15}$|^\d{18}$/.test(id));

console.log(isEmail('user@example.com')); // true
console.log(isPhone('13812345678')); // true
console.log(isIdCard('123456789012345')); // true
```

#### 3. 缓存和记忆化

```javascript
// 记忆化斐波那契数列
function createMemoizedFibonacci() {
    const cache = {}; // 缓存计算结果
    
    function fibonacci(n) {
        if (n in cache) {
            console.log(`从缓存读取 fibonacci(${n})`);
            return cache[n];
        }
        
        if (n <= 1) {
            cache[n] = n;
            return n;
        }
        
        console.log(`计算 fibonacci(${n})`);
        cache[n] = fibonacci(n - 1) + fibonacci(n - 2);
        return cache[n];
    }
    
    // 返回函数和清除缓存的方法
    return {
        calculate: fibonacci,
        clearCache: () => Object.keys(cache).forEach(key => delete cache[key]),
        getCacheSize: () => Object.keys(cache).length
    };
}

const fibCalculator = createMemoizedFibonacci();
console.log(fibCalculator.calculate(10)); // 计算过程
console.log(fibCalculator.calculate(10)); // 从缓存读取
console.log(`缓存大小：${fibCalculator.getCacheSize()}`);
```

#### 4. 事件处理和回调

```javascript
// DOM 事件处理中的闭包
function setupButtonHandlers() {
    const buttons = ['按钮1', '按钮2', '按钮3'];
    const handlers = [];
    
    buttons.forEach((buttonText, index) => {
        // 每个按钮都有自己的闭包环境
        const handler = function() {
            console.log(`点击了${buttonText}，索引：${index}`);
            // 可以访问外部的 buttonText 和 index
        };
        handlers.push(handler);
    });
    
    return handlers;
}

const buttonHandlers = setupButtonHandlers();
// 模拟点击事件
buttonHandlers[0](); // "点击了按钮1，索引：0"
buttonHandlers[1](); // "点击了按钮2，索引：1"
```

## ⚠️ 常见陷阱和解决方案

### 1. 循环中的闭包陷阱

```javascript
// ❌ 错误示例：所有函数都共享同一个变量
console.log('=== 错误示例 ===');
var functions = [];
for (var i = 0; i < 3; i++) {
    functions[i] = function() {
        console.log(`我是函数 ${i}`); // i 在循环结束后都是 3
    };
}

functions[0](); // "我是函数 3"
functions[1](); // "我是函数 3"
functions[2](); // "我是函数 3"

// ✅ 解决方案1：使用 IIFE (立即执行函数表达式)
console.log('=== 解决方案1：IIFE ===');
var functions1 = [];
for (var i = 0; i < 3; i++) {
    functions1[i] = (function(index) {
        return function() {
            console.log(`我是函数 ${index}`);
        };
    })(i); // 立即传入当前的 i 值
}

functions1[0](); // "我是函数 0"
functions1[1](); // "我是函数 1"
functions1[2](); // "我是函数 2"

// ✅ 解决方案2：使用 let (块作用域)
console.log('=== 解决方案2：let ===');
var functions2 = [];
for (let i = 0; i < 3; i++) { // 使用 let 替代 var
    functions2[i] = function() {
        console.log(`我是函数 ${i}`);
    };
}

functions2[0](); // "我是函数 0"
functions2[1](); // "我是函数 1"
functions2[2](); // "我是函数 2"

// ✅ 解决方案3：使用 bind
console.log('=== 解决方案3：bind ===');
var functions3 = [];
for (var i = 0; i < 3; i++) {
    functions3[i] = function(index) {
        console.log(`我是函数 ${index}`);
    }.bind(null, i);
}

functions3[0](); // "我是函数 0"
functions3[1](); // "我是函数 1"
functions3[2](); // "我是函数 2"
```

### 2. 内存泄漏问题

```javascript
// ⚠️ 可能导致内存泄漏的闭包
function createProblematicClosure() {
    const largeData = new Array(1000000).fill('大量数据'); // 大量数据
    const smallData = '小数据';
    
    return function() {
        // 只使用 smallData，但整个 largeData 也不会被回收
        return smallData;
    };
}

// ✅ 优化版本：避免不必要的引用
function createOptimizedClosure() {
    const largeData = new Array(1000000).fill('大量数据');
    const smallData = '小数据';
    
    // 处理大数据后，只保留需要的小数据
    const processedData = smallData.toUpperCase();
    
    // 不直接引用 largeData，允许垃圾回收
    return function() {
        return processedData;
    };
}
```

## 🧠 内存管理和垃圾回收

### 闭包的内存模型

```javascript
// 闭包内存管理示例
function memoryExample() {
    let counter = 0;
    const heavyObject = {
        data: new Array(100000).fill('heavy data'),
        id: Math.random()
    };
    
    // 返回多个函数，形成闭包
    return {
        increment() {
            counter++;
            return counter;
        },
        
        getCounter() {
            return counter;
        },
        
        // 这个函数引用了 heavyObject，会阻止其被垃圾回收
        getHeavyObjectId() {
            return heavyObject.id;
        },
        
        // 清理函数，释放对大对象的引用
        cleanup() {
            // 在某些情况下，可以手动清理引用
            // 但注意：这会影响其他函数的正常工作
        }
    };
}

const memoryManager = memoryExample();
console.log(memoryManager.increment()); // 1
console.log(memoryManager.getHeavyObjectId()); // 随机ID
```

## 🎯 实践练习

### 练习1：计数器进阶版

```javascript
// 创建一个支持多种操作的计数器
function createAdvancedCounter(initialValue = 0, step = 1) {
    let count = initialValue;
    let history = [initialValue];
    
    return {
        increment(customStep = step) {
            count += customStep;
            history.push(count);
            return count;
        },
        
        decrement(customStep = step) {
            count -= customStep;
            history.push(count);
            return count;
        },
        
        reset() {
            count = initialValue;
            history = [initialValue];
            return count;
        },
        
        getValue() {
            return count;
        },
        
        getHistory() {
            return [...history];
        },
        
        undo() {
            if (history.length > 1) {
                history.pop();
                count = history[history.length - 1];
            }
            return count;
        }
    };
}

// 测试高级计数器
const advCounter = createAdvancedCounter(10, 2);
console.log(advCounter.increment());    // 12
console.log(advCounter.increment(5));   // 17
console.log(advCounter.decrement());    // 15
console.log(advCounter.getHistory());   // [10, 12, 17, 15]
console.log(advCounter.undo());         // 17
```

### 练习2：节流和防抖函数

```javascript
// 使用闭包实现节流函数
function throttle(func, delay) {
    let lastCall = 0;
    let timeoutId;
    
    return function(...args) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                func.apply(this, args);
            }, delay - (now - lastCall));
        }
    };
}

// 使用闭包实现防抖函数
function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// 测试函数
function handleSearch(query) {
    console.log(`搜索：${query}`);
}

const throttledSearch = throttle(handleSearch, 1000);
const debouncedSearch = debounce(handleSearch, 1000);

// 模拟快速调用
console.log('=== 节流测试 ===');
throttledSearch('react');
throttledSearch('react hooks');
throttledSearch('react router');
```

## 📚 总结

### 关键要点
1. **执行上下文**：代码执行的环境，包含变量对象、作用域链和this
2. **词法作用域**：作用域在代码编写时确定，不是运行时确定
3. **闭包**：函数能够访问其词法作用域中的变量，即使函数在其词法作用域之外执行
4. **实际应用**：数据私有化、函数工厂、缓存、事件处理等

### 最佳实践
1. 合理使用闭包，避免不必要的内存占用
2. 注意循环中的闭包陷阱
3. 在适当时候手动清理引用，防止内存泄漏
4. 使用现代语法（let/const）替代var来避免作用域问题

### 进阶方向
- 深入学习 V8 引擎的垃圾回收机制
- 了解不同 JavaScript 引擎的优化策略
- 学习函数式编程中的高级闭包应用 