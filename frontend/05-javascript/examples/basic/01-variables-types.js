// JavaScript 变量与数据类型示例
// 运行命令：node 01-variables-types.js

console.log('=== JavaScript 变量与数据类型 ===\n');

// ============================================================================
// 1. 变量声明方式
// ============================================================================

console.log('1. 变量声明方式');

// let - 块级作用域，可修改
let userName = '张三';
console.log('用户名:', userName);
userName = '李四'; // 可以重新赋值
console.log('修改后用户名:', userName);

// const - 块级作用域，不可修改
const PI = 3.14159;
console.log('圆周率:', PI);
// PI = 3.14; // 错误！const 变量不能重新赋值

// var - 函数作用域，不推荐使用
var oldStyleVar = '旧式变量声明';
console.log('var 变量:', oldStyleVar);

// ============================================================================
// 2. 原始数据类型 (Primitive Types)
// ============================================================================

console.log('\n2. 原始数据类型');

// Number 类型 - 整数和浮点数
let age = 25;              // 整数
let height = 175.5;        // 浮点数
let temperature = -10;     // 负数
let infinity = Infinity;   // 无穷大
let notANumber = NaN;      // 非数字值

console.log('年龄 (整数):', age, typeof age);
console.log('身高 (浮点数):', height, typeof height);
console.log('温度 (负数):', temperature, typeof temperature);
console.log('无穷大:', infinity, typeof infinity);
console.log('非数字:', notANumber, typeof notANumber);

// 数字的特殊写法
let binary = 0b1010;       // 二进制
let octal = 0o755;         // 八进制
let hexadecimal = 0xFF;    // 十六进制
let scientific = 1.5e3;    // 科学记数法

console.log('二进制 0b1010:', binary);
console.log('八进制 0o755:', octal);
console.log('十六进制 0xFF:', hexadecimal);
console.log('科学记数法 1.5e3:', scientific);

// String 类型 - 字符串
let singleQuotes = '单引号字符串';
let doubleQuotes = "双引号字符串";
let backticks = `反引号字符串 (模板字符串)`;
let multiLine = `这是一个
多行
字符串`;

console.log('单引号:', singleQuotes, typeof singleQuotes);
console.log('双引号:', doubleQuotes, typeof doubleQuotes);
console.log('模板字符串:', backticks, typeof backticks);
console.log('多行字符串:\n' + multiLine);

// 模板字符串的强大功能
let name = '小明';
let score = 95;
let message = `学生 ${name} 的考试成绩是 ${score} 分，${score >= 90 ? '优秀' : '良好'}！`;
console.log('模板字符串示例:', message);

// Boolean 类型 - 布尔值
let isStudent = true;
let isTeacher = false;
let isAdult = age >= 18;

console.log('是学生:', isStudent, typeof isStudent);
console.log('是老师:', isTeacher, typeof isTeacher);
console.log('是成年人:', isAdult, typeof isAdult);

// undefined 类型 - 未定义
let undefinedVar;
let explicitUndefined = undefined;

console.log('未赋值变量:', undefinedVar, typeof undefinedVar);
console.log('显式undefined:', explicitUndefined, typeof explicitUndefined);

// null 类型 - 空值
let nullVar = null;
console.log('null值:', nullVar, typeof nullVar); // 注意：typeof null 返回 "object"

// Symbol 类型 - 唯一标识符 (ES6+)
let symbol1 = Symbol('描述');
let symbol2 = Symbol('描述');
console.log('Symbol:', symbol1, typeof symbol1);
console.log('两个Symbol相等吗?', symbol1 === symbol2); // false，每个Symbol都是唯一的

// BigInt 类型 - 大整数 (ES2020+)
let bigNumber = 1234567890123456789012345678901234567890n;
console.log('BigInt:', bigNumber, typeof bigNumber);

// ============================================================================
// 3. 引用数据类型 (Reference Types)
// ============================================================================

console.log('\n3. 引用数据类型');

// Object 类型 - 对象
let person = {
    name: '王五',
    age: 30,
    city: '北京',
    isMarried: true
};

console.log('对象:', person, typeof person);
console.log('对象的name属性:', person.name);
console.log('对象的age属性:', person['age']);

// Array 类型 - 数组（实际上是对象的特殊形式）
let numbers = [1, 2, 3, 4, 5];
let fruits = ['苹果', '香蕉', '橙子'];
let mixed = [1, '字符串', true, null, { key: 'value' }];

console.log('数字数组:', numbers, typeof numbers);
console.log('水果数组:', fruits, Array.isArray(fruits)); // 检查是否为数组
console.log('混合数组:', mixed);

// Function 类型 - 函数
let greetFunction = function(name) {
    return `你好, ${name}!`;
};

function namedFunction() {
    return '这是一个命名函数';
}

let arrowFunction = (x, y) => x + y;

console.log('函数表达式:', greetFunction, typeof greetFunction);
console.log('命名函数:', namedFunction, typeof namedFunction);
console.log('箭头函数:', arrowFunction, typeof arrowFunction);

// Date 类型 - 日期对象
let now = new Date();
let specificDate = new Date('2024-01-01');

console.log('当前时间:', now, typeof now);
console.log('指定日期:', specificDate, typeof specificDate);

// ============================================================================
// 4. 类型检测
// ============================================================================

console.log('\n4. 类型检测');

// typeof 操作符
console.log('typeof "hello":', typeof "hello");
console.log('typeof 42:', typeof 42);
console.log('typeof true:', typeof true);
console.log('typeof undefined:', typeof undefined);
console.log('typeof null:', typeof null);           // "object" (历史遗留问题)
console.log('typeof {}:', typeof {});
console.log('typeof []:', typeof []);               // "object"
console.log('typeof function(){}:', typeof function(){});

// instanceof 操作符 - 检查原型链
console.log('[] instanceof Array:', [] instanceof Array);
console.log('{} instanceof Object:', {} instanceof Object);
console.log('new Date() instanceof Date:', new Date() instanceof Date);

// Array.isArray() - 专门检查数组
console.log('Array.isArray([]):', Array.isArray([]));
console.log('Array.isArray({}):', Array.isArray({}));

// Object.prototype.toString - 最准确的类型检测
function getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
}

console.log('准确类型检测:');
console.log('getType("hello"):', getType("hello"));
console.log('getType(42):', getType(42));
console.log('getType([]):', getType([]));
console.log('getType({}):', getType({}));
console.log('getType(null):', getType(null));
console.log('getType(new Date()):', getType(new Date()));

// ============================================================================
// 5. 类型转换
// ============================================================================

console.log('\n5. 类型转换');

// 隐式类型转换（自动转换）
console.log('隐式转换示例:');
console.log('5 + "3":', 5 + "3");           // "53" (数字转字符串)
console.log('"5" - 3:', "5" - 3);           // 2 (字符串转数字)
console.log('"5" * "2":', "5" * "2");       // 10 (字符串转数字)
console.log('true + 1:', true + 1);         // 2 (布尔值转数字)
console.log('false + 1:', false + 1);       // 1 (布尔值转数字)
console.log('"" == 0:', "" == 0);           // true (空字符串转数字)
console.log('null == 0:', null == 0);       // false
console.log('undefined == null:', undefined == null); // true

// 显式类型转换
console.log('\n显式转换示例:');

// 转换为字符串
console.log('String(123):', String(123));
console.log('(123).toString():', (123).toString());
console.log('123 + "":', 123 + "");

// 转换为数字
console.log('Number("123"):', Number("123"));
console.log('parseInt("123.45"):', parseInt("123.45"));      // 只取整数部分
console.log('parseFloat("123.45"):', parseFloat("123.45"));  // 保留小数
console.log('+"123":', +"123");                              // 一元加号转换

// 转换为布尔值
console.log('Boolean(1):', Boolean(1));
console.log('Boolean(0):', Boolean(0));
console.log('Boolean(""):', Boolean(""));
console.log('Boolean("hello"):', Boolean("hello"));
console.log('!!123:', !!123);                               // 双重否定转布尔值

// 假值 (Falsy values)
const falsyValues = [false, 0, -0, 0n, "", null, undefined, NaN];
console.log('\n假值转换为布尔值:');
falsyValues.forEach(value => {
    console.log(`Boolean(${value}):`, Boolean(value));
});

// ============================================================================
// 6. 变量作用域
// ============================================================================

console.log('\n6. 变量作用域');

// 全局作用域
var globalVar = '全局变量';

function scopeExample() {
    // 函数作用域
    var functionScoped = '函数作用域变量';
    
    if (true) {
        // 块级作用域
        let blockScoped = '块级作用域变量';
        const blockConst = '块级常量';
        var functionScoped2 = 'var在块内声明但仍是函数作用域';
        
        console.log('块内访问:');
        console.log('- globalVar:', globalVar);
        console.log('- functionScoped:', functionScoped);
        console.log('- blockScoped:', blockScoped);
        console.log('- blockConst:', blockConst);
    }
    
    console.log('块外访问:');
    console.log('- globalVar:', globalVar);
    console.log('- functionScoped:', functionScoped);
    console.log('- functionScoped2:', functionScoped2);
    // console.log('- blockScoped:', blockScoped); // 错误！块外无法访问
    // console.log('- blockConst:', blockConst);   // 错误！块外无法访问
}

scopeExample();

// ============================================================================
// 7. 实用示例：数据验证
// ============================================================================

console.log('\n7. 实用示例：数据验证');

// 验证函数
function validateUserData(userData) {
    const errors = [];
    
    // 检查姓名
    if (typeof userData.name !== 'string' || userData.name.length === 0) {
        errors.push('姓名必须是非空字符串');
    }
    
    // 检查年龄
    if (typeof userData.age !== 'number' || userData.age < 0 || userData.age > 150) {
        errors.push('年龄必须是0-150之间的数字');
    }
    
    // 检查邮箱
    if (typeof userData.email !== 'string' || !userData.email.includes('@')) {
        errors.push('邮箱格式无效');
    }
    
    // 检查是否为学生（可选字段）
    if (userData.isStudent !== undefined && typeof userData.isStudent !== 'boolean') {
        errors.push('学生状态必须是布尔值');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 测试数据
const testUsers = [
    { name: '张三', age: 25, email: 'zhangsan@example.com', isStudent: false },
    { name: '', age: 25, email: 'invalid-email' },
    { name: '李四', age: -5, email: 'lisi@example.com' },
    { name: '王五', age: 30, email: 'wangwu@example.com', isStudent: 'yes' }
];

testUsers.forEach((user, index) => {
    const validation = validateUserData(user);
    console.log(`用户 ${index + 1} 验证结果:`, validation);
});

// ============================================================================
// 8. 练习题
// ============================================================================

console.log('\n8. 练习题');

console.log('请完成以下练习:');
console.log('1. 创建一个对象描述你自己，包含姓名、年龄、爱好等信息');
console.log('2. 写一个函数判断一个值是否为有效数字');
console.log('3. 实现一个类型检测函数，返回任意值的准确类型');
console.log('4. 创建一个函数将不同类型的值转换为字符串');

// 练习1示例答案
const myself = {
    name: '学习者',
    age: 20,
    hobbies: ['编程', '阅读', '运动'],
    introduction: function() {
        return `我是${this.name}，今年${this.age}岁，爱好${this.hobbies.join('、')}`;
    }
};

console.log('\n练习1示例答案:');
console.log(myself.introduction());

// 练习2示例答案
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

console.log('\n练习2示例答案:');
console.log('isValidNumber(42):', isValidNumber(42));
console.log('isValidNumber(NaN):', isValidNumber(NaN));
console.log('isValidNumber(Infinity):', isValidNumber(Infinity));
console.log('isValidNumber("42"):', isValidNumber("42"));

// ============================================================================
// 9. 知识小结
// ============================================================================

console.log('\n=== 知识小结 ===');
console.log('✅ 学会了 let、const、var 三种变量声明方式');
console.log('✅ 理解了 JavaScript 的七种数据类型');
console.log('✅ 掌握了类型检测的多种方法');
console.log('✅ 了解了显式和隐式类型转换');
console.log('✅ 理解了变量作用域的概念');
console.log('✅ 能够进行基本的数据验证');

console.log('\n下一步学习：运算符与表达式 (02-operators-expressions.js)'); 