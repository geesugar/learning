/**
 * TypeScript 函数示例
 * 
 * 本文件演示了 TypeScript 中函数的各种用法：
 * - 基本函数定义和调用
 * - 可选参数和默认参数
 * - 剩余参数和解构
 * - 函数重载
 * - 函数类型和高阶函数
 */

// =============================================================================
// 1. 基本函数定义
// =============================================================================

// 函数声明
function greetUser(name: string): string {
    return `欢迎你，${name}！`;
}

// 函数表达式
const calculateArea = function(width: number, height: number): number {
    return width * height;
};

// 箭头函数
const formatPrice = (price: number): string => `¥${price.toFixed(2)}`;

// 无返回值的函数
function logInfo(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
}

// 使用示例
console.log("=== 基本函数示例 ===");
console.log(greetUser("张三"));                    // "欢迎你，张三！"
console.log(calculateArea(10, 5));                 // 50
console.log(formatPrice(199.99));                  // "¥199.99"
logInfo("系统启动成功");

// =============================================================================
// 2. 可选参数和默认参数
// =============================================================================

// 可选参数
function createUserProfile(name: string, age?: number, email?: string): object {
    const profile: any = { name };
    
    if (age !== undefined) {
        profile.age = age;
    }
    
    if (email !== undefined) {
        profile.email = email;
    }
    
    return profile;
}

// 默认参数
function generateId(prefix: string = "ID", length: number = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix + "_";
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

// 复杂默认参数
function createApiClient(
    baseUrl: string,
    options: {
        timeout: number;
        retries: number;
        headers: Record<string, string>;
    } = {
        timeout: 5000,
        retries: 3,
        headers: { "Content-Type": "application/json" }
    }
): object {
    return {
        baseUrl,
        ...options,
        request: (endpoint: string) => `${baseUrl}${endpoint}`
    };
}

// 使用示例
console.log("\n=== 可选参数和默认参数示例 ===");
console.log(createUserProfile("Alice"));
console.log(createUserProfile("Bob", 25));
console.log(createUserProfile("Charlie", 30, "charlie@example.com"));

console.log(generateId());                    // "ID_XXXXXXXX"
console.log(generateId("USER"));              // "USER_XXXXXXXX"
console.log(generateId("ORDER", 12));         // "ORDER_XXXXXXXXXXXX"

const apiClient = createApiClient("https://api.example.com");
console.log(apiClient);

// =============================================================================
// 3. 剩余参数
// =============================================================================

// 基本剩余参数
function calculateSum(...numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0);
}

// 混合参数
function logWithLevel(level: string, ...messages: string[]): void {
    const timestamp = new Date().toISOString();
    console.log(`[${level}] ${timestamp}: ${messages.join(" ")}`);
}

// 剩余参数与解构
function processOrder(orderId: string, ...items: Array<{name: string, price: number, quantity: number}>): object {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
        orderId,
        items,
        total: formatPrice(total),
        itemCount: items.length
    };
}

// 使用示例
console.log("\n=== 剩余参数示例 ===");
console.log(calculateSum(1, 2, 3, 4, 5));                    // 15
console.log(calculateSum(10, 20, 30));                       // 60

logWithLevel("ERROR", "数据库连接失败", "请检查网络");
logWithLevel("INFO", "用户登录成功");

const order = processOrder(
    "ORD001",
    { name: "苹果", price: 5.99, quantity: 3 },
    { name: "香蕉", price: 3.99, quantity: 2 },
    { name: "橙子", price: 4.99, quantity: 1 }
);
console.log(order);

// =============================================================================
// 4. 函数重载
// =============================================================================

// 重载声明
function formatData(data: string): string;
function formatData(data: number): string;
function formatData(data: boolean): string;
function formatData(data: Date): string;
function formatData(data: Array<any>): string;

// 重载实现
function formatData(data: string | number | boolean | Date | Array<any>): string {
    if (typeof data === "string") {
        return `文本: "${data}"`;
    } else if (typeof data === "number") {
        return `数字: ${data.toLocaleString()}`;
    } else if (typeof data === "boolean") {
        return `布尔值: ${data ? "是" : "否"}`;
    } else if (data instanceof Date) {
        return `日期: ${data.toLocaleDateString("zh-CN")}`;
    } else if (Array.isArray(data)) {
        return `数组: [${data.length} 个元素]`;
    } else {
        return "未知类型";
    }
}

// 搜索函数重载
function search(query: string): string[];
function search(query: string, limit: number): string[];
function search(query: string, limit: number, offset: number): string[];

function search(query: string, limit?: number, offset?: number): string[] {
    // 模拟搜索结果
    const allResults = [
        `结果1: ${query}`,
        `结果2: ${query}`,
        `结果3: ${query}`,
        `结果4: ${query}`,
        `结果5: ${query}`,
        `结果6: ${query}`,
        `结果7: ${query}`,
        `结果8: ${query}`,
        `结果9: ${query}`,
        `结果10: ${query}`
    ];
    
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : allResults.length;
    
    return allResults.slice(startIndex, endIndex);
}

// 使用示例
console.log("\n=== 函数重载示例 ===");
console.log(formatData("Hello World"));
console.log(formatData(12345));
console.log(formatData(true));
console.log(formatData(new Date()));
console.log(formatData([1, 2, 3, 4, 5]));

console.log(search("TypeScript"));
console.log(search("JavaScript", 3));
console.log(search("React", 2, 3));

// =============================================================================
// 5. 函数类型和高阶函数
// =============================================================================

// 函数类型定义
type MathOperation = (a: number, b: number) => number;
type StringTransformer = (input: string) => string;
type Predicate<T> = (item: T) => boolean;
type Comparator<T> = (a: T, b: T) => number;

// 数学运算函数
const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
const divide: MathOperation = (a, b) => b !== 0 ? a / b : 0;

// 字符串转换函数
const toUpperCase: StringTransformer = (str) => str.toUpperCase();
const toLowerCase: StringTransformer = (str) => str.toLowerCase();
const reverse: StringTransformer = (str) => str.split("").reverse().join("");
const removeSpaces: StringTransformer = (str) => str.replace(/\s+/g, "");

// 高阶函数：创建计算器
function createCalculator(operation: MathOperation): (a: number, b: number) => string {
    return (a: number, b: number): string => {
        const result = operation(a, b);
        return `计算结果: ${a} ${operation.name} ${b} = ${result}`;
    };
}

// 高阶函数：函数组合
function compose<T>(transformers: Array<(input: T) => T>): (input: T) => T {
    return (input: T): T => {
        return transformers.reduce((result, transformer) => transformer(result), input);
    };
}

// 高阶函数：数组处理
function processArray<T>(
    array: T[],
    filter: Predicate<T>,
    transform: (item: T) => T,
    sort?: Comparator<T>
): T[] {
    let result = array.filter(filter).map(transform);
    
    if (sort) {
        result = result.sort(sort);
    }
    
    return result;
}

// 使用示例
console.log("\n=== 高阶函数示例 ===");

// 计算器示例
const addCalculator = createCalculator(add);
const multiplyCalculator = createCalculator(multiply);

console.log(addCalculator(10, 5));      // "计算结果: 10 add 5 = 15"
console.log(multiplyCalculator(4, 3));  // "计算结果: 4 multiply 3 = 12"

// 函数组合示例
const textProcessor = compose<string>([
    removeSpaces,
    toLowerCase,
    reverse
]);

console.log(textProcessor("Hello World"));  // "dlrowolleh"

// 数组处理示例
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evenSquares = processArray(
    numbers,
    (n) => n % 2 === 0,           // 过滤偶数
    (n) => n * n,                 // 平方
    (a, b) => b - a               // 降序排列
);

console.log(evenSquares);  // [100, 64, 36, 16, 4]

// =============================================================================
// 6. 回调函数和异步函数
// =============================================================================

// 回调函数类型
type SuccessCallback<T> = (data: T) => void;
type ErrorCallback = (error: Error) => void;
type ProgressCallback = (progress: number) => void;

// 模拟异步操作
function fetchUserData(
    userId: number,
    onSuccess: SuccessCallback<{id: number, name: string, email: string}>,
    onError: ErrorCallback,
    onProgress?: ProgressCallback
): void {
    // 模拟加载进度
    if (onProgress) {
        onProgress(0);
        setTimeout(() => onProgress(50), 500);
        setTimeout(() => onProgress(100), 1000);
    }
    
    // 模拟网络请求
    setTimeout(() => {
        if (userId > 0) {
            onSuccess({
                id: userId,
                name: `用户${userId}`,
                email: `user${userId}@example.com`
            });
        } else {
            onError(new Error("无效的用户ID"));
        }
    }, 1500);
}

// Promise 风格的异步函数
async function fetchUserDataPromise(userId: number): Promise<{id: number, name: string, email: string}> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId > 0) {
                resolve({
                    id: userId,
                    name: `用户${userId}`,
                    email: `user${userId}@example.com`
                });
            } else {
                reject(new Error("无效的用户ID"));
            }
        }, 1000);
    });
}

// 使用示例
console.log("\n=== 回调函数和异步函数示例 ===");

// 回调函数示例
fetchUserData(
    123,
    (userData) => {
        console.log("获取用户数据成功:", userData);
    },
    (error) => {
        console.error("获取用户数据失败:", error.message);
    },
    (progress) => {
        console.log(`加载进度: ${progress}%`);
    }
);

// Promise 示例
fetchUserDataPromise(456)
    .then(userData => {
        console.log("Promise 获取用户数据成功:", userData);
    })
    .catch(error => {
        console.error("Promise 获取用户数据失败:", error.message);
    });

// async/await 示例
async function demonstrateAsyncAwait(): Promise<void> {
    try {
        console.log("开始获取用户数据...");
        const userData = await fetchUserDataPromise(789);
        console.log("async/await 获取用户数据成功:", userData);
    } catch (error) {
        console.error("async/await 获取用户数据失败:", error);
    }
}

demonstrateAsyncAwait();

// =============================================================================
// 7. 实用工具函数
// =============================================================================

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// 节流函数
function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let isThrottled = false;
    
    return (...args: Parameters<T>) => {
        if (!isThrottled) {
            func(...args);
            isThrottled = true;
            setTimeout(() => {
                isThrottled = false;
            }, delay);
        }
    };
}

// 记忆化函数
function memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            console.log(`缓存命中: ${key}`);
            return cache.get(key);
        }
        
        const result = func(...args);
        cache.set(key, result);
        console.log(`缓存保存: ${key}`);
        return result;
    }) as T;
}

// 使用示例
console.log("\n=== 实用工具函数示例 ===");

// 防抖示例
const debouncedLog = debounce((message: string) => {
    console.log(`防抖消息: ${message}`);
}, 1000);

debouncedLog("消息1");
debouncedLog("消息2");
debouncedLog("消息3");  // 只有这个会被执行

// 节流示例
const throttledLog = throttle((message: string) => {
    console.log(`节流消息: ${message}`);
}, 1000);

throttledLog("消息A");  // 立即执行
throttledLog("消息B");  // 被节流
throttledLog("消息C");  // 被节流

// 记忆化示例
const expensiveCalculation = memoize((n: number): number => {
    console.log(`执行复杂计算: ${n}`);
    let result = 0;
    for (let i = 0; i < n; i++) {
        result += i;
    }
    return result;
});

console.log(expensiveCalculation(1000));  // 执行计算
console.log(expensiveCalculation(1000));  // 使用缓存
console.log(expensiveCalculation(2000));  // 执行计算
console.log(expensiveCalculation(1000));  // 使用缓存

// =============================================================================
// 练习题
// =============================================================================

/*
练习 1：实现一个多功能的数组处理函数
要求：
- 接收一个数组和多个处理选项
- 支持过滤、映射、排序、分组等操作
- 使用函数重载支持不同的调用方式

练习 2：创建一个事件系统
要求：
- 支持事件订阅和取消订阅
- 支持一次性事件监听
- 支持事件优先级
- 使用回调函数处理事件

练习 3：实现一个简单的状态管理器
要求：
- 支持状态的获取和更新
- 支持状态变化的监听
- 支持异步状态更新
- 使用 TypeScript 的高级类型特性

练习 4：创建一个函数式编程工具库
要求：
- 实现 map、filter、reduce 等常用函数
- 支持函数柯里化 (curry)
- 支持函数管道 (pipe)
- 确保类型安全

提示：你可以在同目录下创建 functions-exercises.ts 文件来完成这些练习！
*/

export {
    greetUser,
    calculateArea,
    formatPrice,
    createUserProfile,
    generateId,
    calculateSum,
    formatData,
    search,
    add,
    subtract,
    multiply,
    divide,
    createCalculator,
    compose,
    processArray,
    fetchUserData,
    fetchUserDataPromise,
    debounce,
    throttle,
    memoize
}; 