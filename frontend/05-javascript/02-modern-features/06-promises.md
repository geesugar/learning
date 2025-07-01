# Promise 和异步基础

> 掌握现代JavaScript异步编程的核心

## 🎯 学习目标

- 理解Promise的概念和状态管理
- 掌握Promise的创建和链式调用
- 学会使用async/await语法
- 了解异步错误处理和最佳实践
- 理解并发控制和异步模式

## 📖 核心内容

### 1. Promise基础

#### 1.1 Promise的概念

```javascript
// 传统回调地狱
function getData(callback) {
    setTimeout(() => {
        callback(null, 'data');
    }, 1000);
}

function processData(data, callback) {
    setTimeout(() => {
        callback(null, `processed ${data}`);
    }, 1000);
}

function saveData(data, callback) {
    setTimeout(() => {
        callback(null, `saved ${data}`);
    }, 1000);
}

// 回调地狱
getData((err, data) => {
    if (err) return console.error(err);
    
    processData(data, (err, processed) => {
        if (err) return console.error(err);
        
        saveData(processed, (err, result) => {
            if (err) return console.error(err);
            console.log(result);
        });
    });
});

// Promise解决方案
function getDataPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('data');
        }, 1000);
    });
}

function processDataPromise(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`processed ${data}`);
        }, 1000);
    });
}

function saveDataPromise(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`saved ${data}`);
        }, 1000);
    });
}

// Promise链式调用
getDataPromise()
    .then(data => processDataPromise(data))
    .then(processed => saveDataPromise(processed))
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

#### 1.2 Promise状态

```javascript
// Promise的三种状态
// 1. pending（待定）
// 2. fulfilled（已兑现）
// 3. rejected（已拒绝）

const promise1 = new Promise((resolve, reject) => {
    console.log('Promise状态: pending');
    
    setTimeout(() => {
        resolve('成功的结果');
        console.log('Promise状态: fulfilled');
    }, 1000);
});

const promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error('失败的原因'));
        console.log('Promise状态: rejected');
    }, 1000);
});

// 检查Promise状态
console.log(promise1); // Promise { <pending> }

promise1.then(value => {
    console.log('成功:', value);
}).catch(error => {
    console.log('失败:', error);
});
```

#### 1.3 创建Promise

```javascript
// 基本Promise创建
const basicPromise = new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;
    
    if (success) {
        resolve('操作成功');
    } else {
        reject(new Error('操作失败'));
    }
});

// 立即resolve的Promise
const resolvedPromise = Promise.resolve('立即成功');
const rejectedPromise = Promise.reject(new Error('立即失败'));

// 包装异步操作
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function fetchData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
    });
}

// 使用示例
delay(1000).then(() => {
    console.log('1秒后执行');
});

fetchData('/api/users')
    .then(users => console.log('用户数据:', users))
    .catch(error => console.error('获取失败:', error));
```

### 2. Promise方法

#### 2.1 then、catch、finally

```javascript
const promise = new Promise((resolve, reject) => {
    const random = Math.random();
    
    setTimeout(() => {
        if (random > 0.5) {
            resolve(`成功: ${random}`);
        } else {
            reject(new Error(`失败: ${random}`));
        }
    }, 1000);
});

promise
    .then(result => {
        console.log('第一个then:', result);
        return result.toUpperCase();
    })
    .then(upperResult => {
        console.log('第二个then:', upperResult);
        return upperResult.length;
    })
    .then(length => {
        console.log('字符串长度:', length);
    })
    .catch(error => {
        console.error('捕获错误:', error.message);
    })
    .finally(() => {
        console.log('Promise完成（无论成功还是失败）');
    });

// 错误传播
Promise.resolve('初始值')
    .then(value => {
        console.log('步骤1:', value);
        throw new Error('中间出错');
    })
    .then(value => {
        console.log('步骤2:', value); // 不会执行
        return value;
    })
    .catch(error => {
        console.error('捕获到错误:', error.message);
        return '从错误中恢复';
    })
    .then(value => {
        console.log('步骤3:', value); // 会执行
    });
```

#### 2.2 Promise静态方法

```javascript
// Promise.all - 所有Promise都成功才成功
const promise1 = delay(1000).then(() => 'result1');
const promise2 = delay(2000).then(() => 'result2');
const promise3 = delay(1500).then(() => 'result3');

Promise.all([promise1, promise2, promise3])
    .then(results => {
        console.log('所有结果:', results); // ['result1', 'result2', 'result3']
    })
    .catch(error => {
        console.error('其中一个失败:', error);
    });

// Promise.allSettled - 等待所有Promise完成（不论成败）
const promises = [
    Promise.resolve('成功1'),
    Promise.reject(new Error('失败1')),
    Promise.resolve('成功2'),
    Promise.reject(new Error('失败2'))
];

Promise.allSettled(promises)
    .then(results => {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Promise ${index + 1} 成功:`, result.value);
            } else {
                console.log(`Promise ${index + 1} 失败:`, result.reason.message);
            }
        });
    });

// Promise.race - 第一个完成的Promise决定结果
const fastPromise = delay(1000).then(() => '快速结果');
const slowPromise = delay(3000).then(() => '慢速结果');

Promise.race([fastPromise, slowPromise])
    .then(result => {
        console.log('最快的结果:', result); // '快速结果'
    });

// Promise.any - 第一个成功的Promise决定结果
const promises2 = [
    delay(1000).then(() => { throw new Error('失败1'); }),
    delay(2000).then(() => '成功1'),
    delay(1500).then(() => '成功2')
];

Promise.any(promises2)
    .then(result => {
        console.log('第一个成功:', result); // '成功2' (较早成功的)
    })
    .catch(error => {
        console.error('全部失败:', error);
    });
```

### 3. async/await

#### 3.1 基本语法

```javascript
// 传统Promise写法
function fetchUserData(userId) {
    return fetchData(`/api/users/${userId}`)
        .then(user => {
            console.log('获取到用户:', user);
            return fetchData(`/api/users/${userId}/posts`);
        })
        .then(posts => {
            console.log('获取到文章:', posts);
            return { user, posts };
        })
        .catch(error => {
            console.error('获取失败:', error);
            throw error;
        });
}

// async/await写法
async function fetchUserDataAsync(userId) {
    try {
        const user = await fetchData(`/api/users/${userId}`);
        console.log('获取到用户:', user);
        
        const posts = await fetchData(`/api/users/${userId}/posts`);
        console.log('获取到文章:', posts);
        
        return { user, posts };
    } catch (error) {
        console.error('获取失败:', error);
        throw error;
    }
}

// 使用async函数
async function main() {
    try {
        const userData = await fetchUserDataAsync(123);
        console.log('完整数据:', userData);
    } catch (error) {
        console.error('主函数错误:', error);
    }
}

main();
```

#### 3.2 并发控制

```javascript
// 顺序执行（串行）
async function sequentialExecution() {
    console.time('sequential');
    
    const result1 = await delay(1000).then(() => 'task1');
    const result2 = await delay(1000).then(() => 'task2');
    const result3 = await delay(1000).then(() => 'task3');
    
    console.timeEnd('sequential'); // ~3000ms
    return [result1, result2, result3];
}

// 并行执行
async function parallelExecution() {
    console.time('parallel');
    
    const promises = [
        delay(1000).then(() => 'task1'),
        delay(1000).then(() => 'task2'),
        delay(1000).then(() => 'task3')
    ];
    
    const results = await Promise.all(promises);
    
    console.timeEnd('parallel'); // ~1000ms
    return results;
}

// 有限并发控制
async function limitedConcurrency(tasks, limit = 2) {
    const results = [];
    const executing = [];
    
    for (const task of tasks) {
        const promise = Promise.resolve().then(() => task());
        results.push(promise);
        
        if (tasks.length >= limit) {
            executing.push(promise.then(() => 
                executing.splice(executing.indexOf(promise), 1)
            ));
            
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
}

// 使用示例
const tasks = [
    () => delay(1000).then(() => 'task1'),
    () => delay(1000).then(() => 'task2'),
    () => delay(1000).then(() => 'task3'),
    () => delay(1000).then(() => 'task4'),
    () => delay(1000).then(() => 'task5')
];

limitedConcurrency(tasks, 2).then(results => {
    console.log('限制并发结果:', results);
});
```

#### 3.3 错误处理模式

```javascript
// 基本错误处理
async function basicErrorHandling() {
    try {
        const result = await riskyOperation();
        return result;
    } catch (error) {
        console.error('操作失败:', error);
        return null;
    }
}

// 重试机制
async function withRetry(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            console.log(`尝试 ${i + 1} 失败:`, error.message);
            
            if (i === maxRetries - 1) {
                throw error; // 最后一次尝试失败，抛出错误
            }
            
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

// 超时控制
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('操作超时')), timeoutMs)
        )
    ]);
}

// 组合使用
async function robustOperation() {
    try {
        const result = await withTimeout(
            withRetry(() => fetchData('/api/data'), 3, 1000),
            10000
        );
        return result;
    } catch (error) {
        console.error('最终失败:', error);
        throw error;
    }
}
```

## 🎯 实际应用示例

### 示例1：API请求管理

```javascript
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error(`API请求失败 [${config.method || 'GET'}] ${url}:`, error);
            throw error;
        }
    }
    
    async get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        
        return this.request(url.pathname + url.search);
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// 使用示例
const api = new ApiClient('https://api.example.com');

async function manageUsers() {
    try {
        // 获取用户列表
        const users = await api.get('/users', { page: 1, limit: 10 });
        console.log('用户列表:', users);
        
        // 创建新用户
        const newUser = await api.post('/users', {
            name: 'Alice',
            email: 'alice@example.com'
        });
        console.log('新用户:', newUser);
        
        // 更新用户
        const updatedUser = await api.put(`/users/${newUser.id}`, {
            name: 'Alice Smith'
        });
        console.log('更新后用户:', updatedUser);
        
        // 删除用户
        await api.delete(`/users/${newUser.id}`);
        console.log('用户已删除');
        
    } catch (error) {
        console.error('用户管理操作失败:', error);
    }
}

manageUsers();
```

### 示例2：数据缓存系统

```javascript
class AsyncCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.pending = new Map();
        this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5分钟
        this.maxSize = options.maxSize || 100;
    }
    
    async get(key, fetcher, ttl = this.defaultTTL) {
        // 检查缓存
        const cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.value;
        }
        
        // 检查是否有正在进行的请求
        if (this.pending.has(key)) {
            return this.pending.get(key);
        }
        
        // 创建新的请求
        const promise = this._fetchAndCache(key, fetcher, ttl);
        this.pending.set(key, promise);
        
        try {
            const result = await promise;
            return result;
        } finally {
            this.pending.delete(key);
        }
    }
    
    async _fetchAndCache(key, fetcher, ttl) {
        try {
            const value = await fetcher();
            
            // 清理过期缓存
            this._cleanup();
            
            // 添加到缓存
            this.cache.set(key, {
                value,
                expiry: Date.now() + ttl
            });
            
            return value;
        } catch (error) {
            // 如果有过期的缓存，返回过期数据
            const cached = this.cache.get(key);
            if (cached) {
                console.warn(`使用过期缓存 ${key}:`, error);
                return cached.value;
            }
            
            throw error;
        }
    }
    
    _cleanup() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());
        
        // 删除过期条目
        entries.forEach(([key, value]) => {
            if (value.expiry <= now) {
                this.cache.delete(key);
            }
        });
        
        // 如果超过最大大小，删除最旧的条目
        if (this.cache.size > this.maxSize) {
            const sortedEntries = entries
                .filter(([_, value]) => value.expiry > now)
                .sort(([_, a], [__, b]) => a.expiry - b.expiry);
            
            const toDelete = sortedEntries.slice(0, this.cache.size - this.maxSize);
            toDelete.forEach(([key]) => this.cache.delete(key));
        }
    }
    
    invalidate(key) {
        this.cache.delete(key);
    }
    
    clear() {
        this.cache.clear();
        this.pending.clear();
    }
}

// 使用示例
const cache = new AsyncCache({ ttl: 60000, maxSize: 50 });

async function getUserData(userId) {
    return cache.get(`user_${userId}`, async () => {
        console.log(`从API获取用户 ${userId} 的数据`);
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    });
}

async function testCache() {
    console.log('第一次获取用户数据');
    const user1 = await getUserData(123);
    
    console.log('第二次获取相同用户数据（应该从缓存）');
    const user2 = await getUserData(123);
    
    console.log('用户数据相同:', user1 === user2);
}

testCache();
```

## 🎁 最佳实践

1. **优先使用async/await**：代码更易读，错误处理更直观
2. **合理处理并发**：理解串行vs并行执行的性能差异
3. **实现重试机制**：网络请求应该有容错能力
4. **设置超时**：避免长时间等待无响应的操作
5. **缓存异步结果**：避免重复的昂贵操作

## 🔄 练习题

1. **实现一个任务队列**：支持优先级和并发控制
2. **构建请求去重系统**：相同请求只发送一次
3. **创建断路器模式**：自动处理服务故障
4. **设计缓存策略**：支持多级缓存和失效策略

Promise和异步编程是现代JavaScript的核心技能！ 