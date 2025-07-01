# 运算符与表达式

> 掌握 JavaScript 中的各种运算符和表达式的使用

## 🎯 学习目标

- 掌握算术、比较、逻辑等运算符的使用
- 理解运算符的优先级和结合性
- 学会使用各种赋值运算符
- 掌握条件运算符和类型运算符
- 理解表达式的求值过程

## ➕ 算术运算符

### 1. 基本算术运算符

```javascript
// 加法 (+)
console.log(5 + 3); // 8
console.log('5' + '3'); // "53" (字符串拼接)
console.log('Hello' + ' World'); // "Hello World"
console.log(5 + '3'); // "53" (数字转字符串)

// 减法 (-)
console.log(10 - 3); // 7
console.log('10' - '3'); // 7 (字符串转数字)
console.log('10' - 3); // 7

// 乘法 (*)
console.log(4 * 5); // 20
console.log('4' * '5'); // 20
console.log(0.1 * 3); // 0.30000000000000004 (浮点精度问题)

// 除法 (/)
console.log(15 / 3); // 5
console.log(10 / 3); // 3.3333333333333335
console.log(10 / 0); // Infinity
console.log(-10 / 0); // -Infinity

// 取余/模运算 (%)
console.log(10 % 3); // 1
console.log(15 % 4); // 3
console.log(10 % 2); // 0 (偶数检测)
console.log(-10 % 3); // -1
console.log(10 % -3); // 1

// 幂运算 (**) ES2016
console.log(2 ** 3); // 8 (2的3次方)
console.log(4 ** 0.5); // 2 (4的平方根)
console.log((-2) ** 2); // 4
```

### 2. 一元算术运算符

```javascript
// 一元加号 (+)
console.log(+'5'); // 5 (字符串转数字)
console.log(+true); // 1
console.log(+false); // 0
console.log(+null); // 0
console.log(+undefined); // NaN

// 一元减号 (-)
console.log(-5); // -5
console.log(-'5'); // -5
console.log(-true); // -1

// 递增运算符 (++)
let a = 5;
console.log(++a); // 6 (前置递增，先加再返回)
console.log(a); // 6

let b = 5;
console.log(b++); // 5 (后置递增，先返回再加)
console.log(b); // 6

// 递减运算符 (--)
let c = 5;
console.log(--c); // 4 (前置递减)
console.log(c); // 4

let d = 5;
console.log(d--); // 5 (后置递减)
console.log(d); // 4
```

### 3. 数学对象辅助

```javascript
// 常用数学函数
console.log(Math.abs(-5)); // 5 (绝对值)
console.log(Math.ceil(4.1)); // 5 (向上取整)
console.log(Math.floor(4.9)); // 4 (向下取整)
console.log(Math.round(4.5)); // 5 (四舍五入)
console.log(Math.max(1, 5, 3)); // 5 (最大值)
console.log(Math.min(1, 5, 3)); // 1 (最小值)
console.log(Math.random()); // 0-1之间的随机数

// 浮点数精度处理
function precisePlus(a, b) {
    return Math.round((a + b) * 100) / 100;
}

console.log(0.1 + 0.2); // 0.30000000000000004
console.log(precisePlus(0.1, 0.2)); // 0.3
```

## 📝 赋值运算符

### 1. 基本赋值运算符

```javascript
// 简单赋值 (=)
let x = 10;
let y = x; // y = 10
let z = x = y = 5; // 链式赋值，都等于5

// 加法赋值 (+=)
let sum = 10;
sum += 5; // 等价于 sum = sum + 5
console.log(sum); // 15

// 字符串拼接赋值
let greeting = 'Hello';
greeting += ' World'; // "Hello World"

// 减法赋值 (-=)
let difference = 20;
difference -= 8; // 等价于 difference = difference - 8
console.log(difference); // 12
```

### 2. 复合赋值运算符

```javascript
// 乘法赋值 (*=)
let product = 6;
product *= 4; // product = product * 4
console.log(product); // 24

// 除法赋值 (/=)
let quotient = 20;
quotient /= 4; // quotient = quotient / 4
console.log(quotient); // 5

// 取余赋值 (%=)
let remainder = 17;
remainder %= 5; // remainder = remainder % 5
console.log(remainder); // 2

// 幂赋值 (**=) ES2016
let power = 3;
power **= 2; // power = power ** 2
console.log(power); // 9

// 位运算赋值（后面会介绍）
let bits = 5;
bits <<= 1; // 左移赋值
bits >>= 1; // 右移赋值
bits &= 3; // 按位与赋值
bits |= 2; // 按位或赋值
bits ^= 1; // 按位异或赋值
```

## 🔍 比较运算符

### 1. 相等性比较

```javascript
// 相等 (==) - 允许类型转换
console.log(5 == '5'); // true
console.log(true == 1); // true
console.log(false == 0); // true
console.log(null == undefined); // true
console.log('' == 0); // true
console.log(' ' == 0); // true

// 严格相等 (===) - 不允许类型转换
console.log(5 === '5'); // false
console.log(true === 1); // false
console.log(false === 0); // false
console.log(null === undefined); // false
console.log('' === 0); // false

// 不相等 (!=) 和严格不相等 (!==)
console.log(5 != '5'); // false
console.log(5 !== '5'); // true
console.log(null != undefined); // false
console.log(null !== undefined); // true
```

### 2. 关系比较

```javascript
// 大于 (>)，小于 (<)，大于等于 (>=)，小于等于 (<=)
console.log(10 > 5); // true
console.log(10 < 5); // false
console.log(10 >= 10); // true
console.log(10 <= 9); // false

// 字符串比较（按字典序）
console.log('apple' < 'banana'); // true
console.log('10' < '2'); // true (字符串比较)
console.log('10' < 2); // false (转换为数字比较)

// 日期比较
let date1 = new Date('2024-01-01');
let date2 = new Date('2024-01-02');
console.log(date1 < date2); // true

// 特殊值比较
console.log(NaN > 5); // false
console.log(NaN < 5); // false
console.log(NaN == NaN); // false
console.log(undefined > 0); // false
console.log(undefined < 0); // false
console.log(undefined == 0); // false
```

### 3. 比较运算的类型转换规则

```javascript
// 对象到原始值的转换
let obj = {
    valueOf: function() { return 10; },
    toString: function() { return '20'; }
};

console.log(obj > 5); // true (调用valueOf，得到10)
console.log(obj + ''); // "10" (调用valueOf转字符串)

// 数组的比较
console.log([1, 2] > [1, 1]); // true (转换为字符串 "1,2" > "1,1")
console.log([10] > [2]); // false (字符串 "10" < "2")

// null 和 undefined 的特殊情况
console.log(null > 0); // false
console.log(null == 0); // false
console.log(null >= 0); // true (转换为0)
```

## 🧠 逻辑运算符

### 1. 基本逻辑运算符

```javascript
// 逻辑与 (&&)
console.log(true && true); // true
console.log(true && false); // false
console.log(false && true); // false
console.log(false && false); // false

// 逻辑或 (||)
console.log(true || true); // true
console.log(true || false); // true
console.log(false || true); // true
console.log(false || false); // false

// 逻辑非 (!)
console.log(!true); // false
console.log(!false); // true
console.log(!!true); // true (双重否定)
console.log(!!'hello'); // true (转换为布尔值)
```

### 2. 短路求值

```javascript
// && 短路：如果左侧为假，不执行右侧
let x = 0;
let result1 = x && (x = 10); // x仍为0，右侧不执行
console.log(x); // 0

// || 短路：如果左侧为真，不执行右侧
let y = 5;
let result2 = y || (y = 10); // y仍为5，右侧不执行
console.log(y); // 5

// 实际应用：条件执行
let user = { name: '张三' };
user.name && console.log('用户名：' + user.name); // 执行

let emptyUser = null;
emptyUser && console.log('用户名：' + emptyUser.name); // 不执行，避免错误

// 默认值设置
let userName = user.name || '匿名用户';
let userAge = user.age || 0;
```

### 3. 空值合并运算符 (??)

```javascript
// ES2020 空值合并运算符
let name = null;
let defaultName = name ?? '默认名称'; // 只对null和undefined使用默认值
console.log(defaultName); // "默认名称"

// 与 || 的区别
let value = 0;
console.log(value || 100); // 100 (0被认为是假值)
console.log(value ?? 100); // 0 (0不是null或undefined)

let emptyString = '';
console.log(emptyString || '默认'); // "默认"
console.log(emptyString ?? '默认'); // ""

// 链式使用
let config = {
    timeout: null,
    retries: 0
};

let timeout = config.timeout ?? 5000;
let retries = config.retries ?? 3;
console.log(timeout); // 5000
console.log(retries); // 0 (不使用默认值)
```

## ❓ 条件运算符（三元运算符）

### 1. 基本语法

```javascript
// 语法：condition ? value1 : value2
let age = 18;
let status = age >= 18 ? '成年人' : '未成年人';
console.log(status); // "成年人"

// 数字比较
let a = 10, b = 20;
let max = a > b ? a : b;
console.log(max); // 20

// 与if-else的对比
// 使用三元运算符
let grade = 85;
let level = grade >= 90 ? 'A' : grade >= 80 ? 'B' : grade >= 70 ? 'C' : 'D';

// 等价的if-else
let level2;
if (grade >= 90) {
    level2 = 'A';
} else if (grade >= 80) {
    level2 = 'B';
} else if (grade >= 70) {
    level2 = 'C';
} else {
    level2 = 'D';
}
```

### 2. 嵌套和复杂用法

```javascript
// 嵌套三元运算符
let temperature = 25;
let weather = temperature > 30 ? '炎热' : 
              temperature > 20 ? '温暖' : 
              temperature > 10 ? '凉爽' : '寒冷';
console.log(weather); // "温暖"

// 函数调用
function getDiscount(isMember, age) {
    return isMember ? (age > 65 ? 0.2 : 0.1) : 0;
}

console.log(getDiscount(true, 70)); // 0.2 (会员老人)
console.log(getDiscount(true, 30)); // 0.1 (普通会员)
console.log(getDiscount(false, 70)); // 0 (非会员)

// 对象属性设置
let user = {
    name: '张三',
    isVip: true
};

let userInfo = {
    ...user,
    discount: user.isVip ? 0.15 : 0.05,
    freeShipping: user.isVip ? true : false
};

// JSX中的条件渲染（React示例）
// const Welcome = ({ user }) => (
//     <div>
//         {user ? `欢迎，${user.name}！` : '请先登录'}
//     </div>
// );
```

## 🔢 类型运算符

### 1. typeof 运算符

```javascript
// 基本类型检测
console.log(typeof 42); // "number"
console.log(typeof 'hello'); // "string"
console.log(typeof true); // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof Symbol('id')); // "symbol"
console.log(typeof 123n); // "bigint"

// 对象类型
console.log(typeof {}); // "object"
console.log(typeof []); // "object"
console.log(typeof null); // "object" (历史遗留问题)
console.log(typeof function(){}); // "function"
console.log(typeof new Date()); // "object"

// 实用的类型检测函数
function getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    return typeof value;
}

console.log(getType([])); // "array"
console.log(getType(null)); // "null"
console.log(getType(new Date())); // "date"
```

### 2. instanceof 运算符

```javascript
// 检测构造函数
let arr = [1, 2, 3];
let obj = {};
let date = new Date();
let regex = /pattern/;

console.log(arr instanceof Array); // true
console.log(arr instanceof Object); // true (数组也是对象)
console.log(obj instanceof Object); // true
console.log(date instanceof Date); // true
console.log(regex instanceof RegExp); // true

// 自定义构造函数
function Person(name) {
    this.name = name;
}

function Student(name, grade) {
    Person.call(this, name);
    this.grade = grade;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

let student = new Student('张三', '高三');

console.log(student instanceof Student); // true
console.log(student instanceof Person); // true
console.log(student instanceof Object); // true

// 注意：不能检测原始类型
console.log('hello' instanceof String); // false
console.log(new String('hello') instanceof String); // true
```

### 3. in 运算符

```javascript
// 检测对象属性
let person = {
    name: '张三',
    age: 30
};

console.log('name' in person); // true
console.log('address' in person); // false
console.log('toString' in person); // true (继承的属性)

// 数组索引检测
let fruits = ['苹果', '香蕉', '橙子'];
console.log(0 in fruits); // true
console.log(3 in fruits); // false
console.log('length' in fruits); // true

// hasOwnProperty vs in
console.log(person.hasOwnProperty('name')); // true (自有属性)
console.log(person.hasOwnProperty('toString')); // false (继承属性)
console.log('toString' in person); // true (包括继承属性)
```

## 🔢 位运算符

### 1. 基本位运算符

```javascript
// 按位与 (&)
console.log(5 & 3); // 1
// 5: 101
// 3: 011
// &: 001 = 1

// 按位或 (|)
console.log(5 | 3); // 7
// 5: 101
// 3: 011
// |: 111 = 7

// 按位异或 (^)
console.log(5 ^ 3); // 6
// 5: 101
// 3: 011
// ^: 110 = 6

// 按位非 (~)
console.log(~5); // -6
// ~5 = -(5 + 1) = -6

// 左移 (<<)
console.log(5 << 1); // 10 (相当于乘以2)
console.log(5 << 2); // 20 (相当于乘以4)

// 右移 (>>)
console.log(10 >> 1); // 5 (相当于除以2)
console.log(10 >> 2); // 2 (相当于除以4)

// 无符号右移 (>>>)
console.log(-5 >>> 1); // 2147483645 (保持无符号)
```

### 2. 位运算的实际应用

```javascript
// 权限管理
const PERMISSIONS = {
    READ: 1,    // 001
    WRITE: 2,   // 010
    EXECUTE: 4  // 100
};

// 设置权限（使用或运算）
let userPermissions = PERMISSIONS.READ | PERMISSIONS.WRITE;
console.log(userPermissions); // 3 (011)

// 检查权限（使用与运算）
function hasPermission(userPerms, permission) {
    return (userPerms & permission) === permission;
}

console.log(hasPermission(userPermissions, PERMISSIONS.READ)); // true
console.log(hasPermission(userPermissions, PERMISSIONS.EXECUTE)); // false

// 添加权限
userPermissions |= PERMISSIONS.EXECUTE;
console.log(hasPermission(userPermissions, PERMISSIONS.EXECUTE)); // true

// 移除权限（使用异或运算）
userPermissions ^= PERMISSIONS.WRITE;
console.log(hasPermission(userPermissions, PERMISSIONS.WRITE)); // false

// 快速数学运算
function fastMultiplyBy2(n) {
    return n << 1;
}

function fastDivideBy2(n) {
    return n >> 1;
}

function isEven(n) {
    return (n & 1) === 0;
}

function isOdd(n) {
    return (n & 1) === 1;
}

console.log(fastMultiplyBy2(5)); // 10
console.log(fastDivideBy2(10)); // 5
console.log(isEven(4)); // true
console.log(isOdd(5)); // true
```

## ⚡ 运算符优先级

### 1. 优先级表（从高到低）

```javascript
// 1. 成员访问、计算成员访问、函数调用
let obj = { prop: { nested: 42 } };
console.log(obj.prop.nested); // 42
console.log(obj['prop']['nested']); // 42

// 2. new（带参数）
let date = new Date(2024, 0, 1);

// 3. 后置递增/递减
let a = 5;
console.log(a++); // 5，然后a变为6

// 4. 逻辑非、按位非、一元加减、前置递增递减、typeof、void、delete
let b = 5;
console.log(!true); // false
console.log(~5); // -6
console.log(++'5'); // 6 (++比一元+优先级高)
console.log(typeof 'hello'); // "string"

// 5. 幂运算(**)
console.log(2 ** 3 ** 2); // 512 (右结合：2**(3**2))

// 6. 乘除取余(* / %)
console.log(2 + 3 * 4); // 14 (先乘后加)

// 7. 加减(+ -)
console.log(10 - 5 + 2); // 7 (左结合)

// 8. 位移(<< >> >>>)
console.log(1 + 2 << 3); // 24 (先加后移位：(1+2)<<3)

// 9. 关系比较(< <= > >= in instanceof)
console.log(5 > 3 && 2 < 4); // true

// 10. 相等性(== != === !==)
console.log(5 == '5' && true); // true

// 11. 按位与(&)
console.log(5 & 3 | 1); // 先&后|

// 12. 按位异或(^)
console.log(5 ^ 3 & 1); // 先&后^

// 13. 按位或(|)
console.log(5 | 3 ^ 1); // 先^后|

// 14. 逻辑与(&&)
console.log(true && false || true); // true (先&&后||)

// 15. 逻辑或(||)
console.log(false || true && false); // false

// 16. 空值合并(??)
console.log(null ?? undefined || 'default'); // 先??后||

// 17. 条件运算符(? :)
console.log(true ? 1 : 2 + 3); // 1 (先算+，但条件为true直接返回1)

// 18. 赋值运算符(= += -= 等)
let x, y;
console.log(x = y = 5); // 5 (右结合：x=(y=5))
```

### 2. 结合性

```javascript
// 左结合（大多数运算符）
console.log(10 - 5 - 2); // 3 ((10-5)-2)
console.log(20 / 4 / 2); // 2.5 ((20/4)/2)

// 右结合（赋值、条件、幂运算）
let a, b, c;
a = b = c = 5; // 右结合：a = (b = (c = 5))

console.log(2 ** 3 ** 2); // 512 (2**(3**2))，不是(2**3)**2=64

// 三元运算符的右结合
let score = 85;
let grade = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
// 等价于：score >= 90 ? 'A' : (score >= 80 ? 'B' : 'C')
```

### 3. 使用括号明确优先级

```javascript
// 不清晰的表达式
let result1 = 2 + 3 * 4 > 10 && 5 < 8;

// 清晰的表达式
let result2 = ((2 + (3 * 4)) > 10) && (5 < 8);

// 复杂计算
let price = 100;
let discount = 0.1;
let tax = 0.05;

// 不清晰
let total1 = price * 1 - discount + price * tax;

// 清晰
let discountedPrice = price * (1 - discount);
let totalTax = price * tax;
let total2 = discountedPrice + totalTax;

// 或者用括号
let total3 = (price * (1 - discount)) + (price * tax);
```

## 📊 表达式求值

### 1. 表达式的类型

```javascript
// 算术表达式
let mathResult = (5 + 3) * 2 / 4; // 4

// 字符串表达式  
let greeting = 'Hello' + ' ' + 'World'; // "Hello World"

// 布尔表达式
let isValid = age >= 18 && hasPermission; // boolean

// 赋值表达式（返回赋值的值）
let x = 10;
let y = (x = 20); // y = 20, x = 20
console.log(x, y); // 20, 20

// 函数调用表达式
function calculate(a, b) {
    return a + b;
}
let sum = calculate(5, 3); // 8

// 对象/数组表达式
let person = {
    name: 'Alice',
    age: 30,
    greet: function() { return `Hello, I'm ${this.name}`; }
};

let numbers = [1, 2, 3, 4, 5];
```

### 2. 短路求值详解

```javascript
// && 短路求值
function expensiveOperation() {
    console.log('执行昂贵操作');
    return true;
}

let condition = false;
let result = condition && expensiveOperation(); // expensiveOperation不会执行
console.log(result); // false

// || 短路求值
function getDefaultValue() {
    console.log('获取默认值');
    return 'default';
}

let value = 'existing';
let finalValue = value || getDefaultValue(); // getDefaultValue不会执行
console.log(finalValue); // "existing"

// 实际应用：安全的属性访问
let user = null;
let userName = user && user.name; // 不会报错
console.log(userName); // undefined

// 使用可选链操作符 (?.) ES2020
let safeName = user?.name; // 等价于上面的写法
let deepAccess = user?.profile?.address?.city;
```

### 3. 类型强制转换

```javascript
// 隐式转换示例
console.log('5' - 3); // 2 (字符串转数字)
console.log('5' * '2'); // 10 (都转为数字)
console.log('5' / '2'); // 2.5 (都转为数字)
console.log('5' % '2'); // 1 (都转为数字)

// 加法的特殊性（字符串拼接优先）
console.log('5' + 3 + 2); // "532" (从左到右)
console.log(5 + 3 + '2'); // "82" (先算数字，再拼接)

// 布尔值转换
console.log(true + 1); // 2 (true转为1)
console.log(false + 1); // 1 (false转为0)
console.log('true' + 1); // "true1" (字符串拼接)

// 对象转换
let obj = {
    valueOf: function() { return 42; },
    toString: function() { return 'object'; }
};

console.log(obj + 1); // 43 (调用valueOf)
console.log(obj + ''); // "42" (调用valueOf转字符串)
console.log(String(obj)); // "object" (调用toString)

// 数组转换
console.log([1, 2] + [3, 4]); // "1,23,4" (都转为字符串再拼接)
console.log([1] + 1); // "11" (数组转字符串再拼接)
console.log(+[1]); // 1 (数组转数字)
console.log(+[]); // 0 (空数组转为0)
```

## 💡 最佳实践

### 1. 运算符使用建议

```javascript
// 1. 优先使用严格相等
// ❌ 不推荐
if (value == null) { /* ... */ }

// ✅ 推荐
if (value === null || value === undefined) { /* ... */ }
// 或使用空值合并
let result = value ?? defaultValue;

// 2. 明确使用括号
// ❌ 不清晰
let result = a + b * c > d && e < f;

// ✅ 清晰
let result = ((a + (b * c)) > d) && (e < f);

// 3. 避免复杂的三元运算符嵌套
// ❌ 难以理解
let status = age > 65 ? 'senior' : age > 18 ? 'adult' : age > 13 ? 'teen' : 'child';

// ✅ 使用函数或if-else
function getAgeGroup(age) {
    if (age > 65) return 'senior';
    if (age > 18) return 'adult';
    if (age > 13) return 'teen';
    return 'child';
}
```

### 2. 性能考虑

```javascript
// 1. 利用短路求值避免不必要的计算
function validateUser(user) {
    return user && 
           user.name && 
           user.name.length > 0 && 
           isValidEmail(user.email); // 只有前面都通过才会调用
}

// 2. 位运算优化（适用于整数运算）
// 检查奇偶性
function isEven(n) {
    return (n & 1) === 0; // 比 n % 2 === 0 更快
}

// 快速取整
function fastFloor(n) {
    return n | 0; // 比 Math.floor 更快（仅适用于32位整数）
}

// 3. 避免重复计算
// ❌ 重复计算
for (let i = 0; i < arr.length; i++) {
    if (i < arr.length / 2) {
        // ...
    }
}

// ✅ 缓存计算结果
let len = arr.length;
let half = len / 2;
for (let i = 0; i < len; i++) {
    if (i < half) {
        // ...
    }
}
```

### 3. 错误处理

```javascript
// 1. 安全的数学运算
function safeDivide(a, b) {
    if (b === 0) {
        throw new Error('除数不能为零');
    }
    return a / b;
}

// 2. 类型安全的比较
function safeCompare(a, b) {
    // 确保类型一致
    if (typeof a !== typeof b) {
        return false;
    }
    return a === b;
}

// 3. 处理浮点数精度
function preciseCalculation(a, b, operation) {
    const precision = 10;
    switch (operation) {
        case '+':
            return Math.round((a + b) * precision) / precision;
        case '-':
            return Math.round((a - b) * precision) / precision;
        case '*':
            return Math.round((a * b) * precision) / precision;
        case '/':
            return Math.round((a / b) * precision) / precision;
        default:
            throw new Error('不支持的运算符');
    }
}

console.log(preciseCalculation(0.1, 0.2, '+')); // 0.3
```

## 🎯 练习题

### 基础练习

1. **运算符优先级**：预测下面表达式的结果
```javascript
console.log(2 + 3 * 4); // ?
console.log((2 + 3) * 4); // ?
console.log(2 ** 3 ** 2); // ?
console.log(10 > 5 > 3); // ?
console.log(10 > 5 && 5 > 3); // ?
```

2. **类型转换**：解释下面代码的输出
```javascript
console.log('5' + 3 + 2); // ?
console.log(5 + 3 + '2'); // ?
console.log('5' - 3 + 2); // ?
console.log([] + []); // ?
console.log({} + []); // ?
```

3. **短路求值**：完成函数实现
```javascript
function getUsername(user) {
    // 使用短路求值返回用户名或默认值
    return user && user.profile && user.profile.name || '匿名用户';
}
```

### 进阶练习

4. **权限检查器**：使用位运算实现权限系统
```javascript
const PERMISSIONS = {
    READ: 1,
    WRITE: 2,
    DELETE: 4,
    ADMIN: 8
};

function hasAllPermissions(userPerms, requiredPerms) {
    // 检查用户是否具有所有必需权限
}

function addPermission(userPerms, permission) {
    // 添加权限
}

function removePermission(userPerms, permission) {
    // 移除权限
}
```

5. **表达式计算器**：实现简单的数学表达式计算器
```javascript
function calculate(expression) {
    // 计算简单的数学表达式如 "2 + 3 * 4"
    // 需要考虑运算符优先级
}
```

## 🎯 小结

运算符与表达式是 JavaScript 编程的基础工具：

### 核心要点
- ✅ **算术运算符**：+、-、*、/、%、**
- ✅ **比较运算符**：==、===、!=、!==、>、<、>=、<=
- ✅ **逻辑运算符**：&&、||、!、??
- ✅ **赋值运算符**：=、+=、-=、*=、/=、%=
- ✅ **条件运算符**：? :
- ✅ **类型运算符**：typeof、instanceof、in
- ✅ **位运算符**：&、|、^、~、<<、>>、>>>

### 最佳实践
- ✅ **使用严格相等**：=== 而不是 ==
- ✅ **明确优先级**：用括号澄清复杂表达式
- ✅ **利用短路求值**：提高性能和安全性
- ✅ **避免隐式转换**：明确类型转换意图
- ✅ **合理使用位运算**：优化整数操作

### 下一步学习
- 🔄 **[控制流程](./06-control-flow.md)** - 程序逻辑控制
- 📝 **[函数基础](./07-functions.md)** - 函数的定义和使用
- 🎯 **[实践练习](../examples/basic/)** - 动手编写代码

掌握运算符是编写高效 JavaScript 代码的关键！ 