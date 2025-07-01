// JavaScript 错误处理与调试示例
// 运行命令：node 06-error-handling.js

console.log('=== JavaScript 错误处理与调试 ===\n');

// ============================================================================
// 1. 错误类型 (Error Types)
// ============================================================================

console.log('1. JavaScript 错误类型');

// 语法错误 (SyntaxError) - 这些会在代码解析阶段被发现
// console.log('未闭合的字符串);  // 取消注释会导致语法错误

// 运行时错误示例
console.log('运行时错误示例:');

try {
    // ReferenceError - 引用未定义的变量
    console.log(undefinedVariable);
} catch (error) {
    console.log(`ReferenceError: ${error.message}`);
}

try {
    // TypeError - 类型错误
    let number = 42;
    number.toUpperCase();  // 数字没有toUpperCase方法
} catch (error) {
    console.log(`TypeError: ${error.message}`);
}

try {
    // RangeError - 范围错误
    let arr = new Array(-1);  // 数组长度不能为负数
} catch (error) {
    console.log(`RangeError: ${error.message}`);
}

try {
    // URIError - URI 错误
    decodeURI('%');  // 无效的URI
} catch (error) {
    console.log(`URIError: ${error.message}`);
}

// ============================================================================
// 2. try...catch...finally 语句
// ============================================================================

console.log('\n2. try...catch...finally 语句');

// 基本用法
function safeDivision(a, b) {
    try {
        console.log(`尝试计算 ${a} / ${b}`);
        
        if (typeof a !== 'number' || typeof b !== 'number') {
            throw new TypeError('参数必须是数字');
        }
        
        if (b === 0) {
            throw new Error('除数不能为零');
        }
        
        let result = a / b;
        console.log(`计算成功: ${result}`);
        return result;
        
    } catch (error) {
        console.log(`捕获错误: ${error.name} - ${error.message}`);
        return null;
        
    } finally {
        console.log('清理工作完成');
    }
}

console.log('安全除法测试:');
safeDivision(10, 2);   // 正常情况
safeDivision(10, 0);   // 除零错误
safeDivision('10', 2); // 类型错误

// 嵌套 try...catch
console.log('\n嵌套 try...catch:');
function nestedTryCatch() {
    try {
        console.log('外层 try 开始');
        
        try {
            console.log('内层 try 开始');
            throw new Error('内层错误');
        } catch (innerError) {
            console.log(`内层 catch: ${innerError.message}`);
            throw new Error('外层错误');  // 重新抛出错误
        }
        
    } catch (outerError) {
        console.log(`外层 catch: ${outerError.message}`);
    } finally {
        console.log('外层 finally 执行');
    }
}

nestedTryCatch();

// ============================================================================
// 3. 自定义错误类型
// ============================================================================

console.log('\n3. 自定义错误类型');

// 自定义错误类
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}

class BusinessLogicError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'BusinessLogicError';
        this.code = code;
    }
}

// 使用自定义错误
function validateUser(user) {
    if (!user.name) {
        throw new ValidationError('用户名不能为空');
    }
    
    if (!user.email) {
        throw new ValidationError('邮箱不能为空');
    }
    
    if (!user.email.includes('@')) {
        throw new ValidationError('邮箱格式无效');
    }
    
    if (user.age < 0 || user.age > 150) {
        throw new ValidationError('年龄必须在0-150之间');
    }
}

// 模拟网络请求
function simulateNetworkRequest(url) {
    const random = Math.random();
    
    if (random < 0.3) {
        throw new NetworkError('网络连接失败', 500);
    } else if (random < 0.5) {
        throw new NetworkError('资源未找到', 404);
    } else {
        return { data: '请求成功', status: 200 };
    }
}

console.log('自定义错误测试:');

// 测试验证错误
const invalidUsers = [
    {},  // 缺少必填字段
    { name: '张三' },  // 缺少邮箱
    { name: '李四', email: 'invalid-email' },  // 邮箱格式错误
    { name: '王五', email: 'wangwu@example.com', age: -5 }  // 年龄无效
];

invalidUsers.forEach((user, index) => {
    try {
        validateUser(user);
        console.log(`用户${index + 1}验证通过`);
    } catch (error) {
        if (error instanceof ValidationError) {
            console.log(`用户${index + 1}验证失败: ${error.message}`);
        } else {
            console.log(`用户${index + 1}未知错误: ${error.message}`);
        }
    }
});

// 测试网络错误
console.log('\n网络请求测试:');
for (let i = 0; i < 5; i++) {
    try {
        const result = simulateNetworkRequest(`/api/data/${i}`);
        console.log(`请求${i + 1}成功:`, result);
    } catch (error) {
        if (error instanceof NetworkError) {
            console.log(`请求${i + 1}失败: ${error.message} (状态码: ${error.statusCode})`);
        } else {
            console.log(`请求${i + 1}未知错误: ${error.message}`);
        }
    }
}

// ============================================================================
// 4. 异步错误处理
// ============================================================================

console.log('\n4. 异步错误处理');

// Promise 错误处理
function promiseErrorHandling() {
    console.log('Promise 错误处理:');
    
    // 成功的 Promise
    Promise.resolve('成功数据')
        .then(data => {
            console.log('Promise 成功:', data);
        })
        .catch(error => {
            console.log('Promise 错误:', error);
        });
    
    // 失败的 Promise
    Promise.reject(new Error('Promise 失败'))
        .then(data => {
            console.log('这不会执行');
        })
        .catch(error => {
            console.log('Promise 错误处理:', error.message);
        });
    
    // 链式错误处理
    Promise.resolve(5)
        .then(value => {
            console.log('第一步:', value);
            return value * 2;
        })
        .then(value => {
            console.log('第二步:', value);
            if (value > 5) {
                throw new Error('值太大了');
            }
            return value;
        })
        .then(value => {
            console.log('第三步:', value);
        })
        .catch(error => {
            console.log('链式错误:', error.message);
        })
        .finally(() => {
            console.log('Promise 链完成');
        });
}

promiseErrorHandling();

// async/await 错误处理
async function asyncErrorHandling() {
    console.log('\nasync/await 错误处理:');
    
    // 模拟异步操作
    function asyncOperation(shouldFail = false) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldFail) {
                    reject(new Error('异步操作失败'));
                } else {
                    resolve('异步操作成功');
                }
            }, 100);
        });
    }
    
    // 使用 try...catch 处理 async/await
    try {
        const result1 = await asyncOperation(false);
        console.log('异步结果1:', result1);
        
        const result2 = await asyncOperation(true);
        console.log('异步结果2:', result2);  // 这行不会执行
        
    } catch (error) {
        console.log('异步错误处理:', error.message);
    }
    
    // 多个异步操作的错误处理
    try {
        const results = await Promise.all([
            asyncOperation(false),
            asyncOperation(false),
            asyncOperation(true)  // 这个会失败
        ]);
        console.log('所有异步操作成功:', results);
    } catch (error) {
        console.log('Promise.all 错误:', error.message);
    }
}

// 调用异步函数
asyncErrorHandling();

// ============================================================================
// 5. 调试技巧
// ============================================================================

console.log('\n5. 调试技巧');

// console 调试方法
console.log('console 调试方法:');

const debugData = {
    name: '调试对象',
    values: [1, 2, 3, 4, 5],
    nested: {
        property: 'value'
    }
};

console.log('普通输出:', debugData);
console.dir(debugData);  // 更详细的对象信息
console.table(debugData.values);  // 表格形式显示数组

// 性能调试
console.time('性能测试');
for (let i = 0; i < 1000000; i++) {
    // 模拟一些计算
    Math.sqrt(i);
}
console.timeEnd('性能测试');

// 堆栈跟踪
function levelOne() {
    levelTwo();
}

function levelTwo() {
    levelThree();
}

function levelThree() {
    console.trace('堆栈跟踪:');
}

levelOne();

// 条件断点模拟
function conditionalDebugging(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (i === 3) {
            debugger;  // 浏览器中会暂停执行
            console.log(`调试点: 索引 ${i}, 值 ${arr[i]}`);
        }
    }
}

conditionalDebugging([1, 2, 3, 4, 5, 6]);

// ============================================================================
// 6. 错误日志和监控
// ============================================================================

console.log('\n6. 错误日志和监控');

// 简单的错误日志系统
class ErrorLogger {
    constructor() {
        this.logs = [];
    }
    
    log(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context: context,
            severity: this.getSeverity(error)
        };
        
        this.logs.push(logEntry);
        console.log('错误已记录:', logEntry);
    }
    
    getSeverity(error) {
        if (error instanceof ValidationError) return 'warning';
        if (error instanceof NetworkError) return 'error';
        if (error instanceof TypeError) return 'critical';
        return 'info';
    }
    
    getLogs(severity = null) {
        if (severity) {
            return this.logs.filter(log => log.severity === severity);
        }
        return this.logs;
    }
    
    getStats() {
        const stats = {};
        this.logs.forEach(log => {
            stats[log.severity] = (stats[log.severity] || 0) + 1;
        });
        return stats;
    }
}

const errorLogger = new ErrorLogger();

// 测试错误日志
try {
    throw new ValidationError('测试验证错误');
} catch (error) {
    errorLogger.log(error, { userId: 123, action: 'create_user' });
}

try {
    throw new NetworkError('测试网络错误', 500);
} catch (error) {
    errorLogger.log(error, { url: '/api/users', method: 'POST' });
}

try {
    throw new TypeError('测试类型错误');
} catch (error) {
    errorLogger.log(error, { function: 'processData', input: 'invalid' });
}

console.log('\n错误日志统计:', errorLogger.getStats());

// ============================================================================
// 7. 错误边界和恢复策略
// ============================================================================

console.log('\n7. 错误边界和恢复策略');

// 重试机制
async function withRetry(asyncFunction, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await asyncFunction();
        } catch (error) {
            console.log(`尝试 ${attempt} 失败: ${error.message}`);
            
            if (attempt === maxRetries) {
                throw new Error(`操作失败，已重试 ${maxRetries} 次: ${error.message}`);
            }
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 模拟不稳定的异步操作
function unstableOperation() {
    return new Promise((resolve, reject) => {
        const success = Math.random() > 0.7;  // 30% 成功率
        setTimeout(() => {
            if (success) {
                resolve('操作成功');
            } else {
                reject(new Error('随机失败'));
            }
        }, 100);
    });
}

// 测试重试机制
console.log('重试机制测试:');
withRetry(unstableOperation, 3, 500)
    .then(result => console.log('最终结果:', result))
    .catch(error => console.log('最终失败:', error.message));

// 降级策略
function withFallback(primaryFunction, fallbackFunction) {
    return async (...args) => {
        try {
            return await primaryFunction(...args);
        } catch (error) {
            console.log(`主要功能失败，使用降级方案: ${error.message}`);
            return await fallbackFunction(...args);
        }
    };
}

// 主要功能
async function primaryDataSource(id) {
    throw new Error('主数据源不可用');
}

// 降级功能
async function fallbackDataSource(id) {
    return { id, data: '降级数据', source: 'cache' };
}

const robustDataFetcher = withFallback(primaryDataSource, fallbackDataSource);

// 测试降级策略
console.log('\n降级策略测试:');
robustDataFetcher(123)
    .then(result => console.log('获取数据成功:', result))
    .catch(error => console.log('获取数据失败:', error.message));

// ============================================================================
// 8. 最佳实践示例
// ============================================================================

console.log('\n8. 最佳实践示例');

// 错误处理的最佳实践
class UserService {
    constructor() {
        this.users = [
            { id: 1, name: '张三', email: 'zhangsan@example.com' },
            { id: 2, name: '李四', email: 'lisi@example.com' }
        ];
    }
    
    async createUser(userData) {
        try {
            // 1. 输入验证
            this.validateUserData(userData);
            
            // 2. 业务逻辑检查
            await this.checkUserExists(userData.email);
            
            // 3. 创建用户
            const user = {
                id: this.generateId(),
                ...userData,
                createdAt: new Date().toISOString()
            };
            
            this.users.push(user);
            
            console.log('用户创建成功:', user);
            return user;
            
        } catch (error) {
            // 4. 错误处理和日志
            this.handleError(error, 'createUser', userData);
            throw error;  // 重新抛出让调用者处理
        }
    }
    
    validateUserData(userData) {
        if (!userData || typeof userData !== 'object') {
            throw new ValidationError('用户数据必须是对象');
        }
        
        if (!userData.name || typeof userData.name !== 'string') {
            throw new ValidationError('用户名必须是非空字符串');
        }
        
        if (!userData.email || typeof userData.email !== 'string') {
            throw new ValidationError('邮箱必须是非空字符串');
        }
        
        if (!userData.email.includes('@')) {
            throw new ValidationError('邮箱格式无效');
        }
    }
    
    async checkUserExists(email) {
        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            throw new BusinessLogicError('用户已存在', 'USER_EXISTS');
        }
    }
    
    generateId() {
        return Math.max(...this.users.map(u => u.id), 0) + 1;
    }
    
    handleError(error, operation, context) {
        const errorInfo = {
            operation,
            context,
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message
            }
        };
        
        // 记录错误
        console.error('操作失败:', errorInfo);
        
        // 根据错误类型处理
        if (error instanceof ValidationError) {
            // 验证错误通常是用户输入问题，不需要特殊处理
        } else if (error instanceof BusinessLogicError) {
            // 业务逻辑错误可能需要特殊处理
        } else {
            // 未知错误需要详细记录
            console.error('未知错误详情:', error.stack);
        }
    }
}

// 测试用户服务
console.log('用户服务测试:');
const userService = new UserService();

// 测试各种错误情况
const testCases = [
    { name: '王五', email: 'wangwu@example.com' },  // 正常情况
    null,  // 无效数据
    { name: '赵六' },  // 缺少邮箱
    { name: '孙七', email: 'invalid-email' },  // 邮箱格式错误
    { name: '周八', email: 'zhangsan@example.com' }  // 邮箱已存在
];

testCases.forEach(async (testCase, index) => {
    try {
        const user = await userService.createUser(testCase);
        console.log(`测试${index + 1}成功:`, user.name);
    } catch (error) {
        console.log(`测试${index + 1}失败: ${error.message}`);
    }
});

// ============================================================================
// 9. 知识小结
// ============================================================================

console.log('\n=== 知识小结 ===');
console.log('✅ 理解了JavaScript的各种错误类型');
console.log('✅ 掌握了try...catch...finally的使用');
console.log('✅ 学会了创建和使用自定义错误类型');
console.log('✅ 了解了异步代码的错误处理');
console.log('✅ 掌握了调试技巧和工具');
console.log('✅ 学会了错误日志和监控');
console.log('✅ 理解了错误处理的最佳实践');

console.log('\n恭喜！你已经完成了JavaScript基础学习！');
console.log('下一步可以学习：');
console.log('- ES6+ 现代特性');
console.log('- 异步编程 (Promise, async/await)');
console.log('- 浏览器 API 和 DOM 操作');
console.log('- Node.js 后端开发');
console.log('- 前端框架 (React, Vue, Angular)'); 