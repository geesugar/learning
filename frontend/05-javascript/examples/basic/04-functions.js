// JavaScript 函数编程示例
// 运行命令：node 04-functions.js

console.log('=== JavaScript 函数编程 ===\n');

// ============================================================================
// 1. 函数基础 (Function Basics)
// ============================================================================

console.log('1. 函数基础');

// 函数声明 (Function Declaration)
function greet(name) {
    return `你好，${name}！欢迎学习 JavaScript！`;
}

console.log('函数声明:');
console.log(greet('小明'));
console.log(greet('张三'));

// 函数表达式 (Function Expression)
const add = function(a, b) {
    return a + b;
};

console.log('\n函数表达式:');
console.log(`add(5, 3) = ${add(5, 3)}`);
console.log(`add(10, 20) = ${add(10, 20)}`);

// 立即执行函数表达式 (IIFE - Immediately Invoked Function Expression)
console.log('\n立即执行函数表达式:');
(function() {
    console.log('这是一个立即执行的函数！');
})();

const result = (function(x, y) {
    return x * y;
})(4, 5);
console.log(`IIFE计算结果: ${result}`);

// 函数提升 (Hoisting)
console.log('\n函数提升示例:');
console.log(hoistedFunction()); // 可以在声明前调用

function hoistedFunction() {
    return '函数声明会被提升到作用域顶部';
}

// 注意：函数表达式不会被提升
try {
    console.log(notHoisted()); // 这会报错
} catch (error) {
    console.log('函数表达式不会被提升:', error.message);
}

var notHoisted = function() {
    return '这不会被提升';
};

// ============================================================================
// 2. 参数处理 (Parameter Handling)
// ============================================================================

console.log('\n2. 参数处理');

// 默认参数 (Default Parameters)
function introduce(name = '匿名', age = 0, city = '未知') {
    return `我叫${name}，今年${age}岁，来自${city}`;
}

console.log('默认参数:');
console.log(introduce());
console.log(introduce('李四'));
console.log(introduce('王五', 25));
console.log(introduce('赵六', 30, '北京'));

// 剩余参数 (Rest Parameters)
function sum(...numbers) {
    console.log(`接收到${numbers.length}个参数:`, numbers);
    return numbers.reduce((total, num) => total + num, 0);
}

console.log('\n剩余参数:');
console.log(`sum(1, 2, 3) = ${sum(1, 2, 3)}`);
console.log(`sum(1, 2, 3, 4, 5) = ${sum(1, 2, 3, 4, 5)}`);
console.log(`sum() = ${sum()}`);

// 参数解构 (Parameter Destructuring)
function createUser({name, email, age = 18}) {
    return {
        id: Date.now(),
        name: name,
        email: email,
        age: age,
        createdAt: new Date().toISOString()
    };
}

console.log('\n参数解构:');
const user1 = createUser({
    name: '张三',
    email: 'zhangsan@example.com'
});
console.log('创建用户1:', user1);

const user2 = createUser({
    name: '李四',
    email: 'lisi@example.com',
    age: 25
});
console.log('创建用户2:', user2);

// arguments 对象 (在箭头函数中不可用)
function oldStyleSum() {
    console.log('arguments对象:', arguments);
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}

console.log('\narguments对象:');
console.log(`oldStyleSum(1, 2, 3, 4) = ${oldStyleSum(1, 2, 3, 4)}`);

// ============================================================================
// 3. 箭头函数 (Arrow Functions)
// ============================================================================

console.log('\n3. 箭头函数');

// 基本语法
const multiply = (a, b) => a * b;
const square = x => x * x;
const sayHello = () => '你好，世界！';

console.log('箭头函数基本语法:');
console.log(`multiply(4, 5) = ${multiply(4, 5)}`);
console.log(`square(6) = ${square(6)}`);
console.log(`sayHello() = ${sayHello()}`);

// 多行箭头函数
const processData = (data) => {
    console.log('处理数据:', data);
    const processed = data.map(item => item * 2);
    const sum = processed.reduce((a, b) => a + b, 0);
    return {
        original: data,
        processed: processed,
        sum: sum
    };
};

console.log('\n多行箭头函数:');
const dataResult = processData([1, 2, 3, 4, 5]);
console.log(dataResult);

// 箭头函数与普通函数的this区别
console.log('\n箭头函数的this绑定:');
const obj = {
    name: '测试对象',
    regularFunction: function() {
        console.log('普通函数中的this.name:', this.name);
    },
    arrowFunction: () => {
        console.log('箭头函数中的this.name:', this?.name || 'undefined');
    },
    methodWithArrow: function() {
        const inner = () => {
            console.log('方法内箭头函数中的this.name:', this.name);
        };
        inner();
    }
};

obj.regularFunction();
obj.arrowFunction();
obj.methodWithArrow();

// ============================================================================
// 4. 作用域与闭包 (Scope and Closures)
// ============================================================================

console.log('\n4. 作用域与闭包');

// 全局作用域
var globalVar = '我是全局变量';

function scopeDemo() {
    // 函数作用域
    var functionVar = '我是函数变量';
    
    if (true) {
        // 块级作用域
        let blockVar = '我是块级变量';
        const constVar = '我是常量';
        
        console.log('块内访问:');
        console.log('  globalVar:', globalVar);
        console.log('  functionVar:', functionVar);
        console.log('  blockVar:', blockVar);
        console.log('  constVar:', constVar);
    }
    
    console.log('块外访问:');
    console.log('  globalVar:', globalVar);
    console.log('  functionVar:', functionVar);
    // console.log('  blockVar:', blockVar); // 这会报错
}

scopeDemo();

// 闭包示例
function createCounter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

console.log('\n闭包示例:');
const counter1 = createCounter();
const counter2 = createCounter();

console.log('counter1:', counter1(), counter1(), counter1());
console.log('counter2:', counter2(), counter2());

// 闭包的实际应用：模块模式
const mathModule = (function() {
    let PI = 3.14159;
    
    return {
        circleArea: function(radius) {
            return PI * radius * radius;
        },
        circleCircumference: function(radius) {
            return 2 * PI * radius;
        },
        getPI: function() {
            return PI;
        }
    };
})();

console.log('\n模块模式:');
console.log(`圆面积(半径5): ${mathModule.circleArea(5).toFixed(2)}`);
console.log(`圆周长(半径5): ${mathModule.circleCircumference(5).toFixed(2)}`);
console.log(`PI值: ${mathModule.getPI()}`);

// ============================================================================
// 5. 高阶函数 (Higher-Order Functions)
// ============================================================================

console.log('\n5. 高阶函数');

// 函数作为参数
function processNumbers(numbers, processor) {
    return numbers.map(processor);
}

const numbers = [1, 2, 3, 4, 5];

console.log('函数作为参数:');
console.log('原数组:', numbers);
console.log('平方:', processNumbers(numbers, x => x * x));
console.log('双倍:', processNumbers(numbers, x => x * 2));
console.log('立方:', processNumbers(numbers, x => x * x * x));

// 函数作为返回值
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}

console.log('\n函数作为返回值:');
const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(`double(5) = ${double(5)}`);
console.log(`triple(4) = ${triple(4)}`);

// 函数组合
function compose(f, g) {
    return function(x) {
        return f(g(x));
    };
}

const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;

const addOneThenMultiplyByTwo = compose(multiplyByTwo, addOne);

console.log('\n函数组合:');
console.log(`addOneThenMultiplyByTwo(3) = ${addOneThenMultiplyByTwo(3)}`); // (3+1)*2 = 8

// ============================================================================
// 6. 数组方法中的函数式编程
// ============================================================================

console.log('\n6. 数组方法中的函数式编程');

const students = [
    { name: '张三', age: 20, score: 85 },
    { name: '李四', age: 22, score: 92 },
    { name: '王五', age: 19, score: 78 },
    { name: '赵六', age: 21, score: 88 },
    { name: '孙七', age: 23, score: 95 }
];

console.log('原始学生数据:', students);

// map - 转换数组
const names = students.map(student => student.name);
console.log('\n学生姓名:', names);

const grades = students.map(student => {
    if (student.score >= 90) return 'A';
    if (student.score >= 80) return 'B';
    if (student.score >= 70) return 'C';
    return 'D';
});
console.log('学生等级:', grades);

// filter - 过滤数组
const excellentStudents = students.filter(student => student.score >= 90);
console.log('\n优秀学生(>=90分):', excellentStudents);

const youngStudents = students.filter(student => student.age < 21);
console.log('年轻学生(<21岁):', youngStudents);

// reduce - 聚合数组
const totalScore = students.reduce((sum, student) => sum + student.score, 0);
const averageScore = totalScore / students.length;
console.log(`\n总分: ${totalScore}, 平均分: ${averageScore.toFixed(2)}`);

// 复杂的reduce应用
const statistics = students.reduce((stats, student) => {
    stats.totalAge += student.age;
    stats.totalScore += student.score;
    stats.count++;
    
    if (student.score > stats.maxScore) {
        stats.maxScore = student.score;
        stats.topStudent = student.name;
    }
    
    return stats;
}, { totalAge: 0, totalScore: 0, count: 0, maxScore: 0, topStudent: '' });

console.log('统计信息:', {
    averageAge: (statistics.totalAge / statistics.count).toFixed(1),
    averageScore: (statistics.totalScore / statistics.count).toFixed(1),
    topStudent: statistics.topStudent,
    maxScore: statistics.maxScore
});

// find 和 findIndex
const topStudent = students.find(student => student.score >= 95);
const failingStudentIndex = students.findIndex(student => student.score < 60);

console.log('\n查找结果:');
console.log('最高分学生:', topStudent);
console.log('不及格学生索引:', failingStudentIndex);

// some 和 every
const hasExcellentStudent = students.some(student => student.score >= 95);
const allPassed = students.every(student => student.score >= 60);

console.log('\n布尔检查:');
console.log('有优秀学生吗?', hasExcellentStudent);
console.log('所有人都及格了吗?', allPassed);

// ============================================================================
// 7. 递归函数 (Recursive Functions)
// ============================================================================

console.log('\n7. 递归函数');

// 阶乘计算
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log('阶乘计算:');
for (let i = 1; i <= 6; i++) {
    console.log(`${i}! = ${factorial(i)}`);
}

// 斐波那契数列
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('\n斐波那契数列:');
for (let i = 0; i < 10; i++) {
    console.log(`F(${i}) = ${fibonacci(i)}`);
}

// 深度遍历对象
function deepTraverse(obj, depth = 0) {
    const indent = '  '.repeat(depth);
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                console.log(`${indent}${key}:`);
                deepTraverse(obj[key], depth + 1);
            } else {
                console.log(`${indent}${key}: ${obj[key]}`);
            }
        }
    }
}

console.log('\n深度遍历对象:');
const complexObj = {
    name: '复杂对象',
    settings: {
        theme: 'dark',
        language: 'zh-CN',
        features: {
            notifications: true,
            autoSave: false
        }
    },
    version: '1.0.0'
};

deepTraverse(complexObj);

// ============================================================================
// 8. 函数式编程实用示例
// ============================================================================

console.log('\n8. 函数式编程实用示例');

// 管道函数 (Pipeline)
const pipe = (...functions) => (value) => 
    functions.reduce((acc, fn) => fn(acc), value);

// 辅助函数
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const addPrefix = prefix => str => `${prefix}${str}`;

console.log('管道函数示例:');
const processText = pipe(
    trim,
    toLowerCase,
    capitalize,
    addPrefix('处理后: ')
);

const rawText = '  HELLO WORLD  ';
console.log(`原始文本: "${rawText}"`);
console.log(processText(rawText));

// 柯里化 (Currying)
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
}

const multiply3 = (a, b, c) => a * b * c;
const curriedMultiply = curry(multiply3);

console.log('\n柯里化示例:');
console.log(`multiply3(2, 3, 4) = ${multiply3(2, 3, 4)}`);
console.log(`curriedMultiply(2)(3)(4) = ${curriedMultiply(2)(3)(4)}`);
console.log(`curriedMultiply(2, 3)(4) = ${curriedMultiply(2, 3)(4)}`);

const multiplyBy2 = curriedMultiply(2);
const multiplyBy2And3 = multiplyBy2(3);
console.log(`multiplyBy2And3(4) = ${multiplyBy2And3(4)}`);

// ============================================================================
// 9. 异步函数预览 (Async Functions Preview)
// ============================================================================

console.log('\n9. 异步函数预览');

// 回调函数
function simulateAsyncOperation(callback) {
    console.log('开始异步操作...');
    setTimeout(() => {
        const result = Math.random() > 0.5 ? '成功' : '失败';
        callback(result);
    }, 1000);
}

console.log('回调函数示例:');
simulateAsyncOperation((result) => {
    console.log(`异步操作结果: ${result}`);
});

// Promise (简单介绍)
function createPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = Math.random() > 0.3;
            if (success) {
                resolve('Promise 操作成功');
            } else {
                reject('Promise 操作失败');
            }
        }, 1500);
    });
}

console.log('\nPromise 示例:');
createPromise()
    .then(result => console.log(result))
    .catch(error => console.log(error));

// ============================================================================
// 10. 练习题
// ============================================================================

console.log('\n10. 练习题');

console.log('请完成以下练习:');
console.log('1. 编写一个函数计算数组中所有偶数的平方和');
console.log('2. 编写一个函数实现深拷贝对象');
console.log('3. 编写一个防抖函数(debounce)');
console.log('4. 编写一个记忆化函数(memoization)');

// 练习答案
console.log('\n练习答案:');

// 1. 计算偶数平方和
function sumOfEvenSquares(numbers) {
    return numbers
        .filter(num => num % 2 === 0)
        .map(num => num * num)
        .reduce((sum, square) => sum + square, 0);
}

console.log('\n1. 偶数平方和:');
const testNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(`数组: ${testNumbers}`);
console.log(`偶数平方和: ${sumOfEvenSquares(testNumbers)}`);

// 2. 深拷贝函数
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    const cloned = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

console.log('\n2. 深拷贝:');
const original = {
    name: '原始对象',
    numbers: [1, 2, 3],
    nested: { value: 42 }
};

const cloned = deepClone(original);
cloned.name = '克隆对象';
cloned.numbers.push(4);
cloned.nested.value = 100;

console.log('原始对象:', original);
console.log('克隆对象:', cloned);

// 3. 防抖函数
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

console.log('\n3. 防抖函数演示:');
const debouncedLog = debounce((message) => {
    console.log(`防抖执行: ${message}`);
}, 1000);

// 模拟快速调用
debouncedLog('第1次调用');
debouncedLog('第2次调用');
debouncedLog('第3次调用'); // 只有这次会执行

// 4. 记忆化函数
function memoize(fn) {
    const cache = {};
    return function(...args) {
        const key = JSON.stringify(args);
        if (key in cache) {
            console.log(`从缓存获取结果，参数: ${key}`);
            return cache[key];
        }
        console.log(`计算新结果，参数: ${key}`);
        const result = fn.apply(this, args);
        cache[key] = result;
        return result;
    };
}

console.log('\n4. 记忆化函数:');
const expensiveCalculation = (n) => {
    // 模拟耗时计算
    let result = 0;
    for (let i = 0; i < n; i++) {
        result += i * i;
    }
    return result;
};

const memoizedCalculation = memoize(expensiveCalculation);

console.log(`结果1: ${memoizedCalculation(1000)}`);
console.log(`结果2: ${memoizedCalculation(1000)}`); // 从缓存获取
console.log(`结果3: ${memoizedCalculation(2000)}`);
console.log(`结果4: ${memoizedCalculation(1000)}`); // 从缓存获取

// ============================================================================
// 11. 知识小结
// ============================================================================

console.log('\n=== 知识小结 ===');
console.log('✅ 掌握了函数的各种声明方式');
console.log('✅ 理解了参数处理和箭头函数');
console.log('✅ 学会了作用域和闭包的概念');
console.log('✅ 掌握了高阶函数和函数式编程');
console.log('✅ 了解了递归和异步函数的基础');
console.log('✅ 能够编写复杂的函数式编程解决方案');

console.log('\n下一步学习：对象与数组 (05-objects-arrays.js)'); 