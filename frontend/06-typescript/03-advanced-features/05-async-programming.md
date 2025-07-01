# TypeScript 异步编程

> 掌握 TypeScript 中的异步编程模式，构建高性能的异步应用

## 🎯 学习目标
- Promise 和 async/await 的类型安全使用
- 异步函数的类型定义和错误处理
- 响应式编程和 Observable 模式
- 异步并发控制和性能优化

## 📈 Promise 和 async/await

### 基础异步类型

```typescript
// Promise 类型基础
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// 异步函数类型定义
async function fetchUser(id: number): Promise<ApiResponse<User>> {
    try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        
        return {
            data,
            status: response.status,
            message: 'Success'
        };
    } catch (error) {
        throw new Error(`获取用户失败: ${error.message}`);
    }
}

// Promise 链式调用
function fetchUserWithPosts(userId: number): Promise<{ user: User; posts: any[] }> {
    return fetchUser(userId)
        .then(userResponse => {
            if (userResponse.status !== 200) {
                throw new Error('用户不存在');
            }
            
            return fetch(`/api/users/${userId}/posts`)
                .then(postsResponse => postsResponse.json())
                .then(posts => ({
                    user: userResponse.data,
                    posts
                }));
        });
}

// 使用示例
async function demonstrateBasicAsync() {
    try {
        const user = await fetchUser(1);
        console.log('用户信息:', user.data);
        
        const userWithPosts = await fetchUserWithPosts(1);
        console.log('用户和文章:', userWithPosts);
    } catch (error) {
        console.error('异步操作失败:', error.message);
    }
}

demonstrateBasicAsync();
```

### 高级异步模式

```typescript
// 泛型异步函数
class AsyncDataManager<T> {
    private cache = new Map<string, { data: T; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟
    
    async getData<K extends keyof T>(
        key: string,
        fetcher: () => Promise<T>,
        forceRefresh: boolean = false
    ): Promise<T> {
        // 检查缓存
        if (!forceRefresh && this.cache.has(key)) {
            const cached = this.cache.get(key)!;
            if (Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.data;
            }
        }
        
        // 获取新数据
        const data = await fetcher();
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
    }
    
    async batchFetch<K extends string>(
        requests: Record<K, () => Promise<any>>
    ): Promise<Record<K, any>> {
        const results = await Promise.allSettled(
            Object.entries(requests).map(async ([key, fetcher]) => ({
                key,
                result: await fetcher()
            }))
        );
        
        const successResults: Record<string, any> = {};
        const errors: string[] = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const { key, result: data } = result.value as any;
                successResults[key] = data;
            } else {
                errors.push(`请求 ${Object.keys(requests)[index]} 失败: ${result.reason}`);
            }
        });
        
        if (errors.length > 0) {
            console.warn('部分请求失败:', errors);
        }
        
        return successResults as Record<K, any>;
    }
    
    clearCache(): void {
        this.cache.clear();
    }
}

// 异步迭代器
class AsyncNumberGenerator {
    constructor(private max: number) {}
    
    async *generate(): AsyncIterableIterator<number> {
        for (let i = 0; i < this.max; i++) {
            // 模拟异步操作
            await new Promise(resolve => setTimeout(resolve, 100));
            yield i;
        }
    }
}

// 使用示例
async function demonstrateAdvancedAsync() {
    console.log('\n=== 高级异步模式示例 ===');
    
    const dataManager = new AsyncDataManager<User>();
    
    // 批量请求
    const batchResults = await dataManager.batchFetch({
        user1: () => fetchUser(1).then(r => r.data),
        user2: () => fetchUser(2).then(r => r.data),
        user3: () => fetchUser(3).then(r => r.data)
    });
    
    console.log('批量请求结果:', batchResults);
    
    // 异步迭代器
    const generator = new AsyncNumberGenerator(5);
    console.log('异步生成器:');
    for await (const num of generator.generate()) {
        console.log('生成数字:', num);
    }
}

demonstrateAdvancedAsync();
```

## 🔄 响应式编程

### 简单 Observable 实现

```typescript
// 简单的 Observable 实现
interface Observer<T> {
    next: (value: T) => void;
    error?: (error: any) => void;
    complete?: () => void;
}

interface Subscription {
    unsubscribe(): void;
}

class Observable<T> {
    constructor(
        private subscribeFn: (observer: Observer<T>) => (() => void) | void
    ) {}
    
    subscribe(observer: Observer<T>): Subscription {
        const teardown = this.subscribeFn(observer);
        
        return {
            unsubscribe: () => {
                if (teardown) {
                    teardown();
                }
            }
        };
    }
    
    // 操作符实现
    map<U>(fn: (value: T) => U): Observable<U> {
        return new Observable<U>(observer => {
            return this.subscribe({
                next: value => observer.next(fn(value)),
                error: observer.error,
                complete: observer.complete
            });
        });
    }
    
    filter(predicate: (value: T) => boolean): Observable<T> {
        return new Observable<T>(observer => {
            return this.subscribe({
                next: value => {
                    if (predicate(value)) {
                        observer.next(value);
                    }
                },
                error: observer.error,
                complete: observer.complete
            });
        });
    }
    
    debounce(ms: number): Observable<T> {
        return new Observable<T>(observer => {
            let timeout: NodeJS.Timeout;
            
            return this.subscribe({
                next: value => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => observer.next(value), ms);
                },
                error: observer.error,
                complete: observer.complete
            });
        });
    }
    
    // 静态方法
    static fromEvent<T>(
        target: EventTarget,
        eventName: string
    ): Observable<T> {
        return new Observable<T>(observer => {
            const handler = (event: Event) => observer.next(event as T);
            target.addEventListener(eventName, handler);
            
            return () => target.removeEventListener(eventName, handler);
        });
    }
    
    static interval(ms: number): Observable<number> {
        return new Observable<number>(observer => {
            let count = 0;
            const intervalId = setInterval(() => {
                observer.next(count++);
            }, ms);
            
            return () => clearInterval(intervalId);
        });
    }
    
    static fromPromise<T>(promise: Promise<T>): Observable<T> {
        return new Observable<T>(observer => {
            promise
                .then(value => {
                    observer.next(value);
                    observer.complete?.();
                })
                .catch(error => observer.error?.(error));
        });
    }
}

// 响应式数据流示例
class ReactiveDataFlow {
    private clickStream = Observable.fromEvent<MouseEvent>(document, 'click');
    private dataStream = Observable.interval(1000);
    
    setupSearchFlow(): Observable<string[]> {
        // 模拟搜索输入流
        const searchInput = document.createElement('input');
        const inputStream = Observable.fromEvent<InputEvent>(searchInput, 'input');
        
        return inputStream
            .map(event => (event.target as HTMLInputElement).value)
            .filter(text => text.length > 2)
            .debounce(300)
            .map(searchTerm => this.performSearch(searchTerm));
    }
    
    private performSearch(term: string): string[] {
        // 模拟搜索结果
        const mockResults = ['苹果', '香蕉', '橙子', '葡萄', '西瓜'];
        return mockResults.filter(item => item.includes(term));
    }
    
    setupClickCounter(): Observable<number> {
        return this.clickStream
            .map(() => 1)
            .scan((acc, curr) => acc + curr, 0);
    }
}

// 使用示例
function demonstrateReactiveprogramming() {
    console.log('\n=== 响应式编程示例 ===');
    
    // 创建数据流
    const numbers = Observable.interval(1000);
    
    // 应用操作符
    const evenNumbers = numbers
        .filter(n => n % 2 === 0)
        .map(n => n * 2);
    
    // 订阅流
    const subscription = evenNumbers.subscribe({
        next: value => console.log('偶数×2:', value),
        error: error => console.error('错误:', error),
        complete: () => console.log('完成')
    });
    
    // 5秒后取消订阅
    setTimeout(() => {
        subscription.unsubscribe();
        console.log('已取消订阅');
    }, 5000);
    
    // Promise 转 Observable
    const promiseStream = Observable.fromPromise(
        fetch('/api/data').then(r => r.json())
    );
    
    promiseStream.subscribe({
        next: data => console.log('Promise 数据:', data),
        error: error => console.error('Promise 错误:', error)
    });
}

// 由于浏览器环境限制，这里不执行演示
// demonstrateReactiveProgreamming();
```

## ⚡ 并发控制

### 异步并发管理

```typescript
// 并发限制器
class ConcurrencyLimiter {
    private running = 0;
    private queue: Array<() => void> = [];
    
    constructor(private limit: number) {}
    
    async execute<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const execute = async () => {
                this.running++;
                
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.running--;
                    
                    // 处理队列中的下一个任务
                    const next = this.queue.shift();
                    if (next) {
                        next();
                    }
                }
            };
            
            if (this.running < this.limit) {
                execute();
            } else {
                this.queue.push(execute);
            }
        });
    }
    
    get currentRunning(): number {
        return this.running;
    }
    
    get queueLength(): number {
        return this.queue.length;
    }
}

// 异步重试机制
class AsyncRetry {
    static async withRetry<T>(
        operation: () => Promise<T>,
        options: {
            maxRetries: number;
            delay: number;
            backoff?: 'linear' | 'exponential';
            retryCondition?: (error: any) => boolean;
        }
    ): Promise<T> {
        const { maxRetries, delay, backoff = 'linear', retryCondition } = options;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                // 检查是否应该重试
                if (retryCondition && !retryCondition(error)) {
                    throw error;
                }
                
                // 最后一次尝试失败
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // 计算延迟时间
                const waitTime = backoff === 'exponential' 
                    ? delay * Math.pow(2, attempt)
                    : delay * (attempt + 1);
                
                console.log(`第 ${attempt + 1} 次重试失败，${waitTime}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        throw new Error('重试次数已用完');
    }
}

// 异步任务调度器
class AsyncTaskScheduler {
    private tasks: Array<{
        id: string;
        task: () => Promise<any>;
        priority: number;
        createdAt: Date;
    }> = [];
    
    private isRunning = false;
    
    addTask(
        id: string,
        task: () => Promise<any>,
        priority: number = 0
    ): void {
        this.tasks.push({
            id,
            task,
            priority,
            createdAt: new Date()
        });
        
        // 按优先级排序
        this.tasks.sort((a, b) => b.priority - a.priority);
        
        if (!this.isRunning) {
            this.start();
        }
    }
    
    private async start(): Promise<void> {
        this.isRunning = true;
        
        while (this.tasks.length > 0) {
            const taskInfo = this.tasks.shift()!;
            
            try {
                console.log(`执行任务: ${taskInfo.id}`);
                const result = await taskInfo.task();
                console.log(`任务 ${taskInfo.id} 完成:`, result);
            } catch (error) {
                console.error(`任务 ${taskInfo.id} 失败:`, error);
            }
        }
        
        this.isRunning = false;
    }
    
    getTaskCount(): number {
        return this.tasks.length;
    }
    
    clear(): void {
        this.tasks = [];
    }
}

// 使用示例
async function demonstrateConcurrency() {
    console.log('\n=== 并发控制示例 ===');
    
    // 并发限制
    const limiter = new ConcurrencyLimiter(3);
    
    const tasks = Array.from({ length: 10 }, (_, i) => 
        limiter.execute(async () => {
            const delay = Math.random() * 1000 + 500;
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log(`任务 ${i + 1} 完成`);
            return `结果 ${i + 1}`;
        })
    );
    
    console.log('开始执行并发任务...');
    const results = await Promise.all(tasks);
    console.log('所有任务完成:', results);
    
    // 重试机制
    const unreliableTask = async () => {
        if (Math.random() < 0.7) {
            throw new Error('随机失败');
        }
        return '任务成功';
    };
    
    try {
        const result = await AsyncRetry.withRetry(unreliableTask, {
            maxRetries: 3,
            delay: 500,
            backoff: 'exponential'
        });
        console.log('重试任务结果:', result);
    } catch (error) {
        console.error('重试任务最终失败:', error.message);
    }
    
    // 任务调度
    const scheduler = new AsyncTaskScheduler();
    
    scheduler.addTask('低优先级', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return '低优先级任务完成';
    }, 1);
    
    scheduler.addTask('高优先级', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return '高优先级任务完成';
    }, 10);
    
    scheduler.addTask('中优先级', async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return '中优先级任务完成';
    }, 5);
}

demonstrateConcurrency();
```

## 🎯 实际应用模式

### 数据获取和缓存

```typescript
// HTTP 客户端with缓存
interface HttpConfig {
    baseURL: string;
    timeout: number;
    retries: number;
    cache: boolean;
}

class TypedHttpClient {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000;
    
    constructor(private config: HttpConfig) {}
    
    async get<T>(
        url: string,
        options: {
            useCache?: boolean;
            timeout?: number;
        } = {}
    ): Promise<T> {
        const fullUrl = `${this.config.baseURL}${url}`;
        const cacheKey = fullUrl;
        
        // 检查缓存
        if (options.useCache !== false && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.data;
            }
        }
        
        // 发送请求
        const timeout = options.timeout || this.config.timeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(fullUrl, {
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 缓存数据
            if (this.config.cache) {
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
            }
            
            return data;
        } finally {
            clearTimeout(timeoutId);
        }
    }
    
    async post<T, U>(url: string, body: T): Promise<U> {
        const fullUrl = `${this.config.baseURL}${url}`;
        
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    clearCache(): void {
        this.cache.clear();
    }
}

// 状态管理
class AsyncStateManager<T> {
    private state: T;
    private listeners: Set<(state: T) => void> = new Set();
    private loadingStates: Set<string> = new Set();
    
    constructor(initialState: T) {
        this.state = initialState;
    }
    
    getState(): T {
        return { ...this.state };
    }
    
    async updateState<K extends keyof T>(
        key: K,
        updater: (current: T[K]) => Promise<T[K]>,
        loadingKey?: string
    ): Promise<void> {
        if (loadingKey) {
            this.loadingStates.add(loadingKey);
            this.notifyListeners();
        }
        
        try {
            const newValue = await updater(this.state[key]);
            this.state = { ...this.state, [key]: newValue };
            this.notifyListeners();
        } finally {
            if (loadingKey) {
                this.loadingStates.delete(loadingKey);
                this.notifyListeners();
            }
        }
    }
    
    isLoading(key: string): boolean {
        return this.loadingStates.has(key);
    }
    
    subscribe(listener: (state: T) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.getState()));
    }
}

// 使用示例
interface AppState {
    users: User[];
    currentUser: User | null;
    posts: any[];
}

async function demonstrateRealWorldAsync() {
    console.log('\n=== 实际应用示例 ===');
    
    // HTTP 客户端
    const httpClient = new TypedHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 5000,
        retries: 3,
        cache: true
    });
    
    // 状态管理
    const stateManager = new AsyncStateManager<AppState>({
        users: [],
        currentUser: null,
        posts: []
    });
    
    // 订阅状态变化
    const unsubscribe = stateManager.subscribe(state => {
        console.log('状态更新:', {
            userCount: state.users.length,
            currentUser: state.currentUser?.name,
            postCount: state.posts.length
        });
    });
    
    try {
        // 获取用户列表
        await stateManager.updateState(
            'users',
            async () => await httpClient.get<User[]>('/users'),
            'loadingUsers'
        );
        
        // 获取当前用户
        await stateManager.updateState(
            'currentUser',
            async () => await httpClient.get<User>('/users/1'),
            'loadingCurrentUser'
        );
        
        // 获取文章列表
        await stateManager.updateState(
            'posts',
            async () => await httpClient.get<any[]>('/posts'),
            'loadingPosts'
        );
        
        console.log('最终状态:', stateManager.getState());
        
    } catch (error) {
        console.error('应用错误:', error);
    } finally {
        unsubscribe();
    }
}

demonstrateRealWorldAsync();
```

## 📝 最佳实践

### 错误处理策略

```typescript
// 统一错误处理
class AsyncError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode?: number,
        public originalError?: any
    ) {
        super(message);
        this.name = 'AsyncError';
    }
}

// 错误处理包装器
function withErrorHandling<T extends any[], R>(
    fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            if (error instanceof AsyncError) {
                throw error;
            }
            
            // 包装未知错误
            throw new AsyncError(
                `异步操作失败: ${error.message}`,
                'UNKNOWN_ERROR',
                undefined,
                error
            );
        }
    };
}

// 超时处理
function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string = '操作超时'
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new AsyncError(errorMessage, 'TIMEOUT', 408));
            }, timeoutMs);
        })
    ]);
}
```

## 📝 练习题

### 基础练习
1. 实现一个支持取消的异步任务管理器
2. 创建一个简单的事件驱动架构
3. 实现一个异步数据缓存系统

### 高级练习
1. 构建一个完整的响应式状态管理库
2. 实现一个支持负载均衡的HTTP客户端
3. 创建一个异步工作流引擎

## 🚀 小结

通过本节学习，你掌握了：
- ✅ **异步类型**：Promise和async/await的类型安全
- ✅ **响应式编程**：Observable和数据流管理
- ✅ **并发控制**：限流、重试和任务调度
- ✅ **实际应用**：HTTP客户端和状态管理

## 🚀 下一步

👉 **下一步：[性能优化](./06-performance.md)**

---
> 💡 **记住**：异步编程的关键是类型安全和错误处理。合理使用并发控制可以提升性能，响应式编程让数据流更加清晰可控！ 