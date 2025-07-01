# 控制流程

> 掌握 JavaScript 中的条件语句、循环语句和跳转语句

## 🎯 学习目标

- 掌握 if-else 条件语句的使用
- 理解 switch 语句的应用场景
- 学会使用各种循环语句（for、while、do-while）
- 掌握 break 和 continue 的使用
- 理解错误处理的基本概念

## 🔀 条件语句

### 1. if 语句

```javascript
// 基本 if 语句
let age = 18;
if (age >= 18) {
    console.log('您已成年');
}

// if-else 语句
let score = 85;
if (score >= 90) {
    console.log('优秀');
} else {
    console.log('良好');
}

// 多重条件 if-else if-else
let grade = 88;
if (grade >= 90) {
    console.log('A级');
} else if (grade >= 80) {
    console.log('B级');
} else if (grade >= 70) {
    console.log('C级');
} else if (grade >= 60) {
    console.log('D级');
} else {
    console.log('不及格');
}

// 嵌套 if 语句
let weather = '晴天';
let temperature = 25;

if (weather === '晴天') {
    if (temperature > 20) {
        console.log('适合外出游玩');
    } else {
        console.log('天气不错，但有点凉');
    }
} else {
    console.log('今天不适合外出');
}
```

### 2. 复杂条件判断

```javascript
// 逻辑运算符组合条件
let isWeekend = true;
let hasWork = false;
let weather = '晴天';

if ((isWeekend || !hasWork) && weather === '晴天') {
    console.log('可以去公园');
}

// 使用函数增强可读性
function canGoToParк(isWeekend, hasWork, weather) {
    const isFree = isWeekend || !hasWork;
    const isGoodWeather = weather === '晴天';
    return isFree && isGoodWeather;
}

if (canGoToParк(isWeekend, hasWork, weather)) {
    console.log('出发去公园！');
}

// 复杂业务逻辑示例
function calculateDiscount(user, product, season) {
    let discount = 0;
    
    // VIP用户折扣
    if (user.isVip) {
        discount += 0.1;
    }
    
    // 季节性折扣
    if (season === '夏季' && product.category === '服装') {
        discount += 0.15;
    }
    
    // 批量购买折扣
    if (product.quantity > 10) {
        discount += 0.05;
    } else if (product.quantity > 5) {
        discount += 0.02;
    }
    
    // 最大折扣限制
    return Math.min(discount, 0.3);
}

// 使用示例
let user = { isVip: true };
let product = { category: '服装', quantity: 12 };
let discount = calculateDiscount(user, product, '夏季');
console.log(`折扣: ${discount * 100}%`); // 折扣: 30%
```

### 3. 条件语句最佳实践

```javascript
// 1. 避免深层嵌套（使用早期返回）
// ❌ 不推荐的深层嵌套
function processOrder(order) {
    if (order) {
        if (order.items && order.items.length > 0) {
            if (order.user && order.user.isActive) {
                if (order.total > 0) {
                    // 处理订单
                    return '订单处理成功';
                } else {
                    return '订单金额无效';
                }
            } else {
                return '用户状态异常';
            }
        } else {
            return '订单为空';
        }
    } else {
        return '订单不存在';
    }
}

// ✅ 推荐的早期返回
function processOrderImproved(order) {
    if (!order) {
        return '订单不存在';
    }
    
    if (!order.items || order.items.length === 0) {
        return '订单为空';
    }
    
    if (!order.user || !order.user.isActive) {
        return '用户状态异常';
    }
    
    if (order.total <= 0) {
        return '订单金额无效';
    }
    
    // 处理订单
    return '订单处理成功';
}

// 2. 使用对象映射替代多重if-else
// ❌ 多重if-else
function getMessageOld(status) {
    if (status === 'pending') {
        return '待处理';
    } else if (status === 'processing') {
        return '处理中';
    } else if (status === 'completed') {
        return '已完成';
    } else if (status === 'failed') {
        return '处理失败';
    } else {
        return '未知状态';
    }
}

// ✅ 对象映射
const STATUS_MESSAGES = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '处理失败'
};

function getMessage(status) {
    return STATUS_MESSAGES[status] || '未知状态';
}
```

## 🔄 switch 语句

### 1. 基本 switch 语句

```javascript
// 基本语法
let day = 3;
let dayName;

switch (day) {
    case 1:
        dayName = '星期一';
        break;
    case 2:
        dayName = '星期二';
        break;
    case 3:
        dayName = '星期三';
        break;
    case 4:
        dayName = '星期四';
        break;
    case 5:
        dayName = '星期五';
        break;
    case 6:
        dayName = '星期六';
        break;
    case 7:
        dayName = '星期日';
        break;
    default:
        dayName = '无效的日期';
}

console.log(dayName); // "星期三"

// 没有break的情况（fall-through）
let score = 'B';
let message;

switch (score) {
    case 'A':
    case 'B':
        message = '优秀';
        break;
    case 'C':
    case 'D':
        message = '良好';
        break;
    case 'E':
        message = '及格';
        break;
    default:
        message = '不及格';
}

console.log(message); // "优秀"
```

### 2. switch 的高级用法

```javascript
// 使用表达式作为case值
function getSeasonByMonth(month) {
    switch (true) {
        case month >= 3 && month <= 5:
            return '春季';
        case month >= 6 && month <= 8:
            return '夏季';
        case month >= 9 && month <= 11:
            return '秋季';
        case month === 12 || month === 1 || month === 2:
            return '冬季';
        default:
            return '无效月份';
    }
}

console.log(getSeasonByMonth(4)); // "春季"

// 在case中执行复杂逻辑
function handleUserAction(action, data) {
    switch (action) {
        case 'CREATE_USER':
            console.log('创建用户:', data.name);
            // 验证数据
            if (!data.name || !data.email) {
                throw new Error('用户信息不完整');
            }
            // 创建用户逻辑
            break;
            
        case 'UPDATE_USER':
            console.log('更新用户:', data.id);
            // 更新用户逻辑
            break;
            
        case 'DELETE_USER':
            console.log('删除用户:', data.id);
            // 删除前确认
            if (data.hasOrders) {
                throw new Error('用户有未完成订单，无法删除');
            }
            break;
            
        default:
            throw new Error('未知操作: ' + action);
    }
}

// switch vs if-else 的选择
// 适合switch: 多个离散值的判断
function getHttpStatusMessage(code) {
    switch (code) {
        case 200: return 'OK';
        case 201: return 'Created';
        case 400: return 'Bad Request';
        case 401: return 'Unauthorized';
        case 403: return 'Forbidden';
        case 404: return 'Not Found';
        case 500: return 'Internal Server Error';
        default: return 'Unknown Status';
    }
}

// 适合if-else: 范围判断或复杂条件
function categorizeAge(age) {
    if (age < 0) {
        return '无效年龄';
    } else if (age < 13) {
        return '儿童';
    } else if (age < 20) {
        return '青少年';
    } else if (age < 60) {
        return '成年人';
    } else {
        return '老年人';
    }
}
```

## 🔁 循环语句

### 1. for 循环

```javascript
// 基本for循环
for (let i = 0; i < 5; i++) {
    console.log('循环第', i + 1, '次');
}

// 倒序循环
for (let i = 10; i > 0; i--) {
    console.log('倒计时:', i);
}

// 步长不为1的循环
for (let i = 0; i < 20; i += 2) {
    console.log('偶数:', i);
}

// 嵌套for循环（九九乘法表）
for (let i = 1; i <= 9; i++) {
    let row = '';
    for (let j = 1; j <= i; j++) {
        row += `${j}×${i}=${i * j} `;
    }
    console.log(row);
}

// 数组遍历
let fruits = ['苹果', '香蕉', '橙子', '葡萄'];
for (let i = 0; i < fruits.length; i++) {
    console.log(`第${i + 1}个水果: ${fruits[i]}`);
}

// 复杂条件和更新表达式
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let sum = 0;
for (let i = 0, len = numbers.length; i < len; i += 2) {
    sum += numbers[i];
    console.log(`加入 ${numbers[i]}, 当前和为 ${sum}`);
}
```

### 2. for...in 循环

```javascript
// 遍历对象属性
let person = {
    name: '张三',
    age: 30,
    city: '北京',
    job: '程序员'
};

for (let key in person) {
    console.log(`${key}: ${person[key]}`);
}

// 遍历数组索引（不推荐用于数组）
let colors = ['红色', '绿色', '蓝色'];
for (let index in colors) {
    console.log(`索引 ${index}: ${colors[index]}`);
}

// 注意：for...in 会遍历继承的属性
function Animal(name) {
    this.name = name;
}
Animal.prototype.species = '动物';

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.bark = function() { return 'Woof!'; };

let myDog = new Dog('旺财', '金毛');

// 遍历所有可枚举属性（包括继承的）
console.log('所有属性:');
for (let prop in myDog) {
    console.log(`${prop}: ${myDog[prop]}`);
}

// 只遍历自有属性
console.log('自有属性:');
for (let prop in myDog) {
    if (myDog.hasOwnProperty(prop)) {
        console.log(`${prop}: ${myDog[prop]}`);
    }
}
```

### 3. for...of 循环

```javascript
// 遍历数组值
let numbers = [10, 20, 30, 40, 50];
for (let num of numbers) {
    console.log('数值:', num);
}

// 遍历字符串
let message = 'Hello';
for (let char of message) {
    console.log('字符:', char);
}

// 遍历Map
let userRoles = new Map();
userRoles.set('张三', '管理员');
userRoles.set('李四', '用户');
userRoles.set('王五', '访客');

for (let [name, role] of userRoles) {
    console.log(`${name}: ${role}`);
}

// 遍历Set
let uniqueNumbers = new Set([1, 2, 3, 2, 1]);
for (let num of uniqueNumbers) {
    console.log('唯一数字:', num);
}

// 获取数组的索引和值
let fruits = ['苹果', '香蕉', '橙子'];
for (let [index, fruit] of fruits.entries()) {
    console.log(`${index}: ${fruit}`);
}

// 自定义可迭代对象
let range = {
    start: 1,
    end: 5,
    [Symbol.iterator]: function() {
        let current = this.start;
        let end = this.end;
        return {
            next: function() {
                if (current <= end) {
                    return { value: current++, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

for (let num of range) {
    console.log('范围数字:', num); // 1, 2, 3, 4, 5
}
```

### 4. while 和 do-while 循环

```javascript
// while 循环
let count = 0;
while (count < 5) {
    console.log('while循环:', count);
    count++;
}

// 条件可能一开始就不满足
let x = 10;
while (x < 5) {
    console.log('这行不会执行');
    x++;
}

// do-while 循环（至少执行一次）
let y = 10;
do {
    console.log('do-while循环:', y);
    y++;
} while (y < 5);

// 实际应用示例：用户输入验证
function getValidInput() {
    let input;
    do {
        input = prompt('请输入一个1-10之间的数字:');
        input = parseInt(input);
    } while (isNaN(input) || input < 1 || input > 10);
    
    return input;
}

// 随机数游戏
function guessNumber() {
    let target = Math.floor(Math.random() * 100) + 1;
    let guess;
    let attempts = 0;
    
    do {
        guess = parseInt(prompt('猜一个1-100之间的数字:'));
        attempts++;
        
        if (guess < target) {
            alert('太小了！');
        } else if (guess > target) {
            alert('太大了！');
        }
    } while (guess !== target);
    
    alert(`恭喜！你用了${attempts}次猜中了数字${target}`);
}

// 使用while处理异步操作（概念示例）
async function waitForCondition(checkFn, maxWaitTime = 5000) {
    const startTime = Date.now();
    
    while (!checkFn() && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return checkFn();
}
```

## ⏭️ 跳转语句

### 1. break 语句

```javascript
// 在循环中使用break
for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break; // 结束循环
    }
    console.log('i =', i); // 输出 0, 1, 2, 3, 4
}

// 在嵌套循环中使用break
for (let i = 0; i < 3; i++) {
    console.log('外层循环:', i);
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            break; // 只结束内层循环
        }
        console.log('  内层循环:', j);
    }
}

// 使用标签break跳出多层循环
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
            break outer; // 跳出外层循环
        }
        console.log(`i=${i}, j=${j}`);
    }
}

// 在switch中使用break
function getDayType(day) {
    switch (day) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            return '工作日';
            break; // 技术上不需要，但保持一致性
        case 6:
        case 7:
            return '周末';
            break;
        default:
            return '无效日期';
    }
}

// 实际应用：查找数组中的元素
function findUser(users, targetId) {
    let foundUser = null;
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === targetId) {
            foundUser = users[i];
            break; // 找到后立即退出循环
        }
    }
    
    return foundUser;
}
```

### 2. continue 语句

```javascript
// 跳过当前迭代
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        continue; // 跳过偶数
    }
    console.log('奇数:', i); // 输出 1, 3, 5, 7, 9
}

// 在while循环中使用continue
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let i = 0;
while (i < numbers.length) {
    i++;
    if (numbers[i - 1] <= 5) {
        continue; // 跳过小于等于5的数
    }
    console.log('大于5的数:', numbers[i - 1]);
}

// 使用标签continue
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            continue outer; // 继续外层循环的下一次迭代
        }
        console.log(`i=${i}, j=${j}`);
    }
}

// 实际应用：过滤和处理数据
function processValidUsers(users) {
    let processedUsers = [];
    
    for (let user of users) {
        // 跳过无效用户
        if (!user.email || !user.name) {
            console.log('跳过无效用户:', user);
            continue;
        }
        
        // 跳过已删除用户
        if (user.isDeleted) {
            continue;
        }
        
        // 处理有效用户
        processedUsers.push({
            id: user.id,
            name: user.name.trim(),
            email: user.email.toLowerCase()
        });
    }
    
    return processedUsers;
}

// 验证和跳过错误数据
function calculateAverageScore(students) {
    let totalScore = 0;
    let validCount = 0;
    
    for (let student of students) {
        // 跳过无效分数
        if (typeof student.score !== 'number' || 
            student.score < 0 || 
            student.score > 100) {
            console.warn('跳过无效分数:', student);
            continue;
        }
        
        totalScore += student.score;
        validCount++;
    }
    
    return validCount > 0 ? totalScore / validCount : 0;
}
```

## 🏷️ 标签语句

```javascript
// 标签语句允许给语句添加标识符
// 主要用于break和continue的跳转控制

// 复杂的嵌套循环控制
function findInMatrix(matrix, target) {
    let found = false;
    let position = null;
    
    searchLoop: for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === target) {
                position = { row: i, col: j };
                found = true;
                break searchLoop; // 跳出所有嵌套循环
            }
        }
    }
    
    return found ? position : null;
}

// 使用示例
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

let result = findInMatrix(matrix, 5);
console.log(result); // { row: 1, col: 1 }

// 处理复杂的嵌套结构
function processNestedData(data) {
    mainLoop: for (let category of data) {
        console.log('处理分类:', category.name);
        
        subLoop: for (let item of category.items) {
            if (item.isCorrupted) {
                console.log('发现损坏数据，跳过整个分类');
                continue mainLoop;
            }
            
            if (item.needsSpecialHandling) {
                console.log('需要特殊处理，跳过当前项');
                continue subLoop;
            }
            
            // 正常处理
            console.log('处理项目:', item.name);
        }
    }
}
```

## 🎯 控制流程的最佳实践

### 1. 可读性优化

```javascript
// 1. 使用有意义的条件表达式
// ❌ 不清晰
if (user.age > 18 && user.hasPermission && !user.isBanned && user.accountBalance > 0) {
    // 处理逻辑
}

// ✅ 清晰
function canPurchase(user) {
    const isAdult = user.age > 18;
    const hasPermission = user.hasPermission;
    const isNotBanned = !user.isBanned;
    const hasMoney = user.accountBalance > 0;
    
    return isAdult && hasPermission && isNotBanned && hasMoney;
}

if (canPurchase(user)) {
    // 处理逻辑
}

// 2. 避免过深的嵌套
// ❌ 深层嵌套
function processOrder(order) {
    if (order) {
        if (order.items) {
            if (order.items.length > 0) {
                for (let item of order.items) {
                    if (item.isValid) {
                        if (item.price > 0) {
                            // 处理项目
                        }
                    }
                }
            }
        }
    }
}

// ✅ 扁平化结构
function processOrderImproved(order) {
    if (!order || !order.items || order.items.length === 0) {
        return;
    }
    
    for (let item of order.items) {
        if (!item.isValid || item.price <= 0) {
            continue;
        }
        
        // 处理项目
    }
}
```

### 2. 性能优化

```javascript
// 1. 循环优化
// ❌ 每次都计算length
for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
}

// ✅ 缓存length
for (let i = 0, len = items.length; i < len; i++) {
    processItem(items[i]);
}

// 2. 条件判断优化（将最可能的条件放前面）
function getUserType(user) {
    // 假设大部分用户是普通用户
    if (user.type === 'normal') {
        return '普通用户';
    } else if (user.type === 'vip') {
        return 'VIP用户';
    } else if (user.type === 'admin') {
        return '管理员';
    } else {
        return '未知用户';
    }
}

// 3. 使用Map替代大量的if-else
const USER_TYPE_MAP = new Map([
    ['normal', '普通用户'],
    ['vip', 'VIP用户'],
    ['admin', '管理员']
]);

function getUserTypeOptimized(user) {
    return USER_TYPE_MAP.get(user.type) || '未知用户';
}
```

### 3. 错误处理

```javascript
// 1. 输入验证
function calculateDiscount(order) {
    // 参数验证
    if (!order) {
        throw new Error('订单不能为空');
    }
    
    if (!Array.isArray(order.items)) {
        throw new Error('订单项目必须是数组');
    }
    
    if (order.items.length === 0) {
        return 0; // 空订单，无折扣
    }
    
    // 计算逻辑
    let total = 0;
    for (let item of order.items) {
        if (typeof item.price !== 'number' || item.price < 0) {
            console.warn('跳过无效价格的商品:', item);
            continue;
        }
        total += item.price;
    }
    
    return total * 0.1; // 10%折扣
}

// 2. 边界条件处理
function binarySearch(arr, target) {
    if (!Array.isArray(arr) || arr.length === 0) {
        return -1;
    }
    
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}
```

## 🎯 实际应用示例

### 1. 数据验证器

```javascript
function validateUserData(userData) {
    const errors = [];
    
    // 姓名验证
    if (!userData.name || typeof userData.name !== 'string') {
        errors.push('姓名是必填项且必须是字符串');
    } else if (userData.name.trim().length < 2) {
        errors.push('姓名至少需要2个字符');
    }
    
    // 邮箱验证
    if (!userData.email) {
        errors.push('邮箱是必填项');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('邮箱格式无效');
        }
    }
    
    // 年龄验证
    if (userData.age !== undefined) {
        if (!Number.isInteger(userData.age) || userData.age < 0 || userData.age > 150) {
            errors.push('年龄必须是0-150之间的整数');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 使用示例
let users = [
    { name: '张三', email: 'zhang@example.com', age: 25 },
    { name: 'A', email: 'invalid-email', age: -5 },
    { name: '李四', email: 'li@example.com' }
];

for (let user of users) {
    let validation = validateUserData(user);
    if (validation.isValid) {
        console.log('用户数据有效:', user.name);
    } else {
        console.log('用户数据无效:', user.name);
        for (let error of validation.errors) {
            console.log('  - ' + error);
        }
    }
}
```

### 2. 状态机实现

```javascript
class TrafficLight {
    constructor() {
        this.state = 'RED';
        this.timer = 0;
    }
    
    update() {
        this.timer++;
        
        switch (this.state) {
            case 'RED':
                if (this.timer >= 30) { // 红灯30秒
                    this.state = 'GREEN';
                    this.timer = 0;
                }
                break;
                
            case 'GREEN':
                if (this.timer >= 25) { // 绿灯25秒
                    this.state = 'YELLOW';
                    this.timer = 0;
                }
                break;
                
            case 'YELLOW':
                if (this.timer >= 5) { // 黄灯5秒
                    this.state = 'RED';
                    this.timer = 0;
                }
                break;
        }
    }
    
    getStatus() {
        switch (this.state) {
            case 'RED':
                return `红灯 (剩余 ${30 - this.timer} 秒)`;
            case 'GREEN':
                return `绿灯 (剩余 ${25 - this.timer} 秒)`;
            case 'YELLOW':
                return `黄灯 (剩余 ${5 - this.timer} 秒)`;
        }
    }
}

// 使用示例
let trafficLight = new TrafficLight();
for (let i = 0; i < 100; i++) {
    if (i % 10 === 0) { // 每10次打印一次状态
        console.log(`时间 ${i}: ${trafficLight.getStatus()}`);
    }
    trafficLight.update();
}
```

### 3. 游戏循环示例

```javascript
class SimpleGame {
    constructor() {
        this.isRunning = true;
        this.score = 0;
        this.level = 1;
        this.enemies = [];
    }
    
    gameLoop() {
        while (this.isRunning) {
            this.update();
            this.render();
            
            // 模拟游戏帧率控制
            if (this.shouldPause()) {
                break;
            }
        }
        
        this.gameOver();
    }
    
    update() {
        // 更新敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            enemy.position += enemy.speed;
            
            // 移除超出边界的敌人
            if (enemy.position > 100) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // 检查碰撞
            if (this.checkCollision(enemy)) {
                this.score += 10;
                this.enemies.splice(i, 1);
            }
        }
        
        // 生成新敌人
        if (Math.random() < 0.1) {
            this.enemies.push({
                position: 0,
                speed: this.level * 0.5
            });
        }
        
        // 升级检查
        if (this.score > this.level * 100) {
            this.level++;
            console.log(`升级到第 ${this.level} 级！`);
        }
    }
    
    render() {
        // 简化的渲染
        if (this.score % 50 === 0) {
            console.log(`分数: ${this.score}, 等级: ${this.level}, 敌人数量: ${this.enemies.length}`);
        }
    }
    
    checkCollision(enemy) {
        // 简化的碰撞检测
        return Math.random() < 0.05;
    }
    
    shouldPause() {
        // 简化的暂停条件
        return this.score >= 1000;
    }
    
    gameOver() {
        console.log(`游戏结束！最终分数: ${this.score}, 到达等级: ${this.level}`);
    }
}

// 运行游戏
let game = new SimpleGame();
game.gameLoop();
```

## 🎯 练习题

### 基础练习

1. **成绩分级器**：根据分数输出等级
```javascript
function getGrade(score) {
    // 实现分级逻辑
    // 90-100: A, 80-89: B, 70-79: C, 60-69: D, <60: F
}
```

2. **星期判断器**：使用switch判断工作日还是周末
```javascript
function getDayType(dayNumber) {
    // 1-7分别代表周一到周日
    // 返回"工作日"或"周末"
}
```

3. **数字求和**：计算1到n的和
```javascript
function sumToN(n) {
    // 使用循环计算1+2+3+...+n
}
```

### 进阶练习

4. **质数检测器**：判断一个数是否为质数
```javascript
function isPrime(num) {
    // 实现质数检测逻辑
    // 优化：只需要检测到√num
}
```

5. **斐波那契数列**：生成前n个斐波那契数
```javascript
function fibonacci(n) {
    // 返回包含前n个斐波那契数的数组
    // [1, 1, 2, 3, 5, 8, 13, ...]
}
```

6. **数字猜谜游戏**：实现一个简单的猜数字游戏
```javascript
function numberGuessingGame() {
    // 随机生成1-100的数字
    // 用户猜测，给出"太大"、"太小"或"正确"的提示
    // 计算猜测次数
}
```

## 🎯 小结

控制流程是程序逻辑的核心：

### 核心要点
- ✅ **条件语句**：if-else、switch 用于分支控制
- ✅ **循环语句**：for、while、do-while 用于重复执行
- ✅ **跳转语句**：break、continue 用于循环控制
- ✅ **标签语句**：处理复杂的嵌套循环跳转

### 最佳实践
- ✅ **早期返回**：减少嵌套层次
- ✅ **有意义的条件**：提高代码可读性
- ✅ **合理选择**：if-else vs switch
- ✅ **性能考虑**：循环优化和条件顺序
- ✅ **错误处理**：边界条件和输入验证

### 循环选择指南
- **for循环**：已知循环次数
- **while循环**：条件循环，可能不执行
- **do-while循环**：至少执行一次
- **for...in**：遍历对象属性
- **for...of**：遍历可迭代对象

### 下一步学习
- 📝 **[函数基础](./07-functions.md)** - 函数的定义和使用
- 🎯 **[实践练习](../examples/basic/)** - 动手编写程序逻辑
- 🚀 **[ES6+ 现代特性](../02-modern-features/)** - 现代 JavaScript

掌握控制流程是编程思维的基础！ 