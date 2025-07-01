# TypeScript 泛型编程

> 掌握 TypeScript 泛型，编写可重用、类型安全的代码

## 🎯 学习目标

完成本节后，你将掌握：

- 泛型的基本概念和语法
- 泛型函数、接口、类的定义和使用
- 泛型约束和条件泛型
- 泛型工具类型的使用
- 泛型在实际项目中的应用

## 🔍 什么是泛型

泛型（Generics）是 TypeScript 中最强大的特性之一，它允许我们编写可重用的代码，同时保持类型安全。

### 为什么需要泛型？

```typescript
// 没有泛型的问题
function identityString(arg: string): string {
    return arg;
}

function identityNumber(arg: number): number {
    return arg;
}

function identityBoolean(arg: boolean): boolean {
    return arg;
}

// 使用 any 类型的问题
function identityAny(arg: any): any {
    return arg;
}

// 使用泛型的解决方案
function identity<T>(arg: T): T {
    return arg;
}

// 使用示例
let stringResult = identity<string>("Hello");     // 类型：string
let numberResult = identity<number>(42);          // 类型：number
let booleanResult = identity<boolean>(true);      // 类型：boolean

// 类型推断
let inferredString = identity("Hello");           // 自动推断为 string
let inferredNumber = identity(42);                // 自动推断为 number
```

## 📝 泛型函数

### 基本语法

```typescript
// 单个类型参数
function firstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

// 带默认类型参数
function createArray<T = string>(length: number, value: T): T[] {
    return Array(length).fill(value);
}

// 使用示例
console.log("=== 泛型函数示例 ===");
console.log(firstElement([1, 2, 3]));              // 1
console.log(firstElement(["a", "b", "c"]));        // "a"
console.log(pair("hello", 42));                    // ["hello", 42]
console.log(createArray(3, "default"));            // ["default", "default", "default"]
console.log(createArray<number>(3, 0));            // [0, 0, 0]
```

### 复杂泛型函数

```typescript
// 数组处理函数
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
    return array.map(fn);
}

function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
    return array.filter(predicate);
}

function reduce<T, U>(array: T[], fn: (acc: U, current: T) => U, initialValue: U): U {
    return array.reduce(fn, initialValue);
}

// 对象处理函数
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        result[key] = obj[key];
    });
    return result;
}

function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}

// 使用示例
const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, x => x * 2);           // [2, 4, 6, 8, 10]
const evens = filter(numbers, x => x % 2 === 0);    // [2, 4]
const sum = reduce(numbers, (acc, x) => acc + x, 0); // 15

const person = { name: "张三", age: 30, email: "zhangsan@example.com" };
const nameAndAge = pick(person, ["name", "age"]);    // { name: "张三", age: 30 }
const withoutEmail = omit(person, ["email"]);        // { name: "张三", age: 30 }

console.log("\n=== 复杂泛型函数示例 ===");
console.log("doubled:", doubled);
console.log("evens:", evens);
console.log("sum:", sum);
console.log("nameAndAge:", nameAndAge);
console.log("withoutEmail:", withoutEmail);
```

## 🏗️ 泛型接口

### 基本泛型接口

```typescript
// 基本泛型接口
interface Container<T> {
    value: T;
    getValue(): T;
    setValue(value: T): void;
}

// 多参数泛型接口
interface Pair<T, U> {
    first: T;
    second: U;
}

// 函数泛型接口
interface Transformer<T, U> {
    (input: T): U;
}

interface Predicate<T> {
    (value: T): boolean;
}

// 使用泛型接口
class StringContainer implements Container<string> {
    constructor(public value: string) {}
    
    getValue(): string {
        return this.value;
    }
    
    setValue(value: string): void {
        this.value = value;
    }
}

class NumberContainer implements Container<number> {
    constructor(public value: number) {}
    
    getValue(): number {
        return this.value;
    }
    
    setValue(value: number): void {
        this.value = value;
    }
}

// 使用示例
const stringContainer = new StringContainer("Hello");
const numberContainer = new NumberContainer(42);

console.log("\n=== 泛型接口示例 ===");
console.log("String container:", stringContainer.getValue());
console.log("Number container:", numberContainer.getValue());
```

### 复杂泛型接口

```typescript
// API 响应接口
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: Date;
    errors?: string[];
}

// 分页接口
interface Paginated<T> {
    items: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// 数据库接口
interface Repository<T, K> {
    findById(id: K): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: K, updates: Partial<T>): Promise<T>;
    delete(id: K): Promise<boolean>;
}

// 事件系统接口
interface EventEmitter<T> {
    on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
}

// 使用示例
type User = {
    id: number;
    name: string;
    email: string;
};

type UserEvents = {
    created: User;
    updated: { id: number; changes: Partial<User> };
    deleted: { id: number };
};

const userResponse: ApiResponse<User> = {
    success: true,
    data: { id: 1, name: "张三", email: "zhangsan@example.com" },
    message: "获取用户成功",
    timestamp: new Date()
};

const userList: Paginated<User> = {
    items: [
        { id: 1, name: "张三", email: "zhangsan@example.com" },
        { id: 2, name: "李四", email: "lisi@example.com" }
    ],
    pagination: {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1
    }
};

console.log("\n=== 复杂泛型接口示例 ===");
console.log("User response:", userResponse);
console.log("User list:", userList);
```

## 🎯 泛型约束

### 基本约束

```typescript
// 约束必须有 length 属性
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}

// 使用示例
loggingIdentity("Hello");          // 正确：string 有 length 属性
loggingIdentity([1, 2, 3]);        // 正确：array 有 length 属性
loggingIdentity({ length: 10 });   // 正确：对象有 length 属性
// loggingIdentity(123);           // 错误：number 没有 length 属性
```

### 键约束

```typescript
// 约束键必须存在于对象中
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// 使用示例
const person = { name: "张三", age: 30, email: "zhangsan@example.com" };

const name = getProperty(person, "name");      // 类型：string
const age = getProperty(person, "age");        // 类型：number
// const invalid = getProperty(person, "salary"); // 错误：salary 不存在于 person 中
```

### 条件约束

```typescript
// 条件类型约束
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
type IsObject<T> = T extends object ? true : false;

// 使用示例
type Test1 = IsArray<string[]>;     // true
type Test2 = IsArray<string>;       // false
type Test3 = IsFunction<() => void>; // true
type Test4 = IsFunction<string>;    // false

// 条件约束的实际应用
function processValue<T>(
    value: T
): T extends string ? string : T extends number ? number : T {
    return value as any;
}

const str = processValue("hello");    // 类型：string
const num = processValue(42);         // 类型：number
const bool = processValue(true);      // 类型：boolean
```

## 🛠️ 泛型工具类型

### 内置工具类型

```typescript
// 1. Partial<T> - 所有属性变为可选
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

type PartialUser = Partial<User>;
// 等同于：
// type PartialUser = {
//     id?: number;
//     name?: string;
//     email?: string;
//     age?: number;
// }

// 2. Required<T> - 所有属性变为必需
interface OptionalUser {
    id: number;
    name?: string;
    email?: string;
    age?: number;
}

type RequiredUser = Required<OptionalUser>;
// 等同于：
// type RequiredUser = {
//     id: number;
//     name: string;
//     email: string;
//     age: number;
// }

// 3. Readonly<T> - 所有属性变为只读
type ReadonlyUser = Readonly<User>;
// 等同于：
// type ReadonlyUser = {
//     readonly id: number;
//     readonly name: string;
//     readonly email: string;
//     readonly age: number;
// }

// 4. Pick<T, K> - 选择特定属性
type UserSummary = Pick<User, "id" | "name">;
// 等同于：
// type UserSummary = {
//     id: number;
//     name: string;
// }

// 5. Omit<T, K> - 排除特定属性
type UserWithoutId = Omit<User, "id">;
// 等同于：
// type UserWithoutId = {
//     name: string;
//     email: string;
//     age: number;
// }

// 6. Record<K, T> - 创建映射类型
type UserRoles = Record<string, string[]>;
// 等同于：
// type UserRoles = {
//     [key: string]: string[];
// }
```

### 自定义工具类型

```typescript
// 深度只读
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度部分
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 非空类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 提取数组元素类型
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 使用示例
interface NestedObject {
    user: {
        profile: {
            name: string;
            settings: {
                theme: string;
                notifications: boolean;
            };
        };
    };
}

type DeepReadonlyNested = DeepReadonly<NestedObject>;
type DeepPartialNested = DeepPartial<NestedObject>;

type StringArray = ArrayElement<string[]>;        // string
type NumberArray = ArrayElement<number[]>;        // number

function example(a: string, b: number): boolean {
    return true;
}

type ExampleReturn = ReturnType<typeof example>;     // boolean
type ExampleParams = Parameters<typeof example>;     // [string, number]

console.log("\n=== 工具类型示例 ===");
console.log("工具类型定义完成");
```

## 🎨 高级泛型模式

### 泛型条件类型

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StringOrNumberArray = ToArray<string | number>; // string[] | number[]

// 复杂条件类型
type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

// 使用示例
class Example {
    name: string = "example";
    age: number = 0;
    getName(): string { return this.name; }
    getAge(): number { return this.age; }
    setName(name: string): void { this.name = name; }
}

type ExampleFunctionPropertyNames = FunctionPropertyNames<Example>;
// "getName" | "getAge" | "setName"

type ExampleFunctionProperties = FunctionProperties<Example>;
// {
//     getName: () => string;
//     getAge: () => number;
//     setName: (name: string) => void;
// }
```

### 递归泛型

```typescript
// 递归数据结构
interface TreeNode<T> {
    value: T;
    children: TreeNode<T>[];
}

// 递归类型操作
type DeepArray<T> = T | DeepArray<T>[];

// JSON 类型
type JsonValue = 
    | string 
    | number 
    | boolean 
    | null 
    | JsonObject 
    | JsonArray;

interface JsonObject {
    [key: string]: JsonValue;
}

interface JsonArray extends Array<JsonValue> {}

// 使用示例
const tree: TreeNode<string> = {
    value: "root",
    children: [
        {
            value: "child1",
            children: [
                { value: "grandchild1", children: [] },
                { value: "grandchild2", children: [] }
            ]
        },
        {
            value: "child2",
            children: []
        }
    ]
};

const deepArray: DeepArray<number> = [1, [2, [3, 4]], 5];

const jsonData: JsonObject = {
    name: "张三",
    age: 30,
    isActive: true,
    address: {
        street: "中关村大街",
        city: "北京"
    },
    hobbies: ["读书", "游泳", "编程"]
};

console.log("\n=== 高级泛型模式示例 ===");
console.log("Tree:", tree);
console.log("Deep array:", deepArray);
console.log("JSON data:", jsonData);
```

## 🚀 实际应用场景

### 1. 数据访问层

```typescript
// 通用仓储接口
interface BaseEntity {
    id: string | number;
    createdAt: Date;
    updatedAt: Date;
}

interface IRepository<T extends BaseEntity> {
    findById(id: T['id']): Promise<T | null>;
    findAll(options?: QueryOptions): Promise<T[]>;
    create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
    update(id: T['id'], updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
    delete(id: T['id']): Promise<boolean>;
}

interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
}

// 具体实现
class UserRepository implements IRepository<User> {
    async findById(id: number): Promise<User | null> {
        // 实现数据库查询
        return null;
    }
    
    async findAll(options?: QueryOptions): Promise<User[]> {
        // 实现数据库查询
        return [];
    }
    
    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        // 实现数据库创建
        return {
            id: Date.now(),
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    
    async update(id: number, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
        // 实现数据库更新
        throw new Error('Not implemented');
    }
    
    async delete(id: number): Promise<boolean> {
        // 实现数据库删除
        return true;
    }
}
```

### 2. 状态管理

```typescript
// 通用状态管理器
interface StoreState {
    [key: string]: any;
}

interface Action<T = any> {
    type: string;
    payload?: T;
}

type Reducer<T> = (state: T, action: Action) => T;

class Store<T extends StoreState> {
    private state: T;
    private listeners: Array<(state: T) => void> = [];
    private reducers: { [K in keyof T]?: Reducer<T[K]> } = {};
    
    constructor(initialState: T) {
        this.state = initialState;
    }
    
    getState(): T {
        return { ...this.state };
    }
    
    dispatch(action: Action): void {
        // 应用 reducers
        Object.keys(this.reducers).forEach(key => {
            const reducer = this.reducers[key];
            if (reducer) {
                this.state[key] = reducer(this.state[key], action);
            }
        });
        
        // 通知监听器
        this.listeners.forEach(listener => listener(this.state));
    }
    
    subscribe(listener: (state: T) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    
    addReducer<K extends keyof T>(key: K, reducer: Reducer<T[K]>): void {
        this.reducers[key] = reducer;
    }
}

// 使用示例
interface AppState {
    user: { name: string; isLoggedIn: boolean } | null;
    theme: 'light' | 'dark';
    counter: number;
}

const store = new Store<AppState>({
    user: null,
    theme: 'light',
    counter: 0
});

// 添加 reducers
store.addReducer('counter', (state, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
});

// 订阅状态变化
const unsubscribe = store.subscribe((state) => {
    console.log('State changed:', state);
});

// 分发动作
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
```

### 3. HTTP 客户端

```typescript
// HTTP 客户端泛型
interface HttpResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

interface HttpRequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    params?: Record<string, any>;
}

class HttpClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;
    
    constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = defaultHeaders;
    }
    
    async get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        // 实现 GET 请求
        return this.request<T>('GET', url, undefined, config);
    }
    
    async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        // 实现 POST 请求
        return this.request<T>('POST', url, data, config);
    }
    
    async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        // 实现 PUT 请求
        return this.request<T>('PUT', url, data, config);
    }
    
    async delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        // 实现 DELETE 请求
        return this.request<T>('DELETE', url, undefined, config);
    }
    
    private async request<T>(
        method: string,
        url: string,
        data?: any,
        config?: HttpRequestConfig
    ): Promise<HttpResponse<T>> {
        // 模拟请求实现
        const response: HttpResponse<T> = {
            data: data as T,
            status: 200,
            statusText: 'OK',
            headers: {}
        };
        
        return response;
    }
}

// 使用示例
const apiClient = new HttpClient('https://api.example.com');

// 类型安全的 API 调用
interface UserResponse {
    id: number;
    name: string;
    email: string;
}

async function fetchUser(id: number): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
}

async function createUser(userData: Omit<UserResponse, 'id'>): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/users', userData);
    return response.data;
}
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：实现一个泛型栈
interface Stack<T> {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
    size(): number;
}

// 练习 2：实现一个泛型队列
interface Queue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    front(): T | undefined;
    isEmpty(): boolean;
    size(): number;
}

// 练习 3：实现一个泛型缓存
interface Cache<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    delete(key: K): boolean;
    clear(): void;
    has(key: K): boolean;
}

// 练习 4：实现一个泛型观察者模式
interface Observer<T> {
    update(data: T): void;
}

interface Subject<T> {
    attach(observer: Observer<T>): void;
    detach(observer: Observer<T>): void;
    notify(data: T): void;
}
```

### 高级练习

```typescript
// 练习 5：实现一个类型安全的事件总线
interface EventBus<T> {
    on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
    once<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
}

// 练习 6：实现一个函数式编程工具库
type Functor<T> = {
    map<U>(fn: (value: T) => U): Functor<U>;
    flatMap<U>(fn: (value: T) => Functor<U>): Functor<U>;
    filter(predicate: (value: T) => boolean): Functor<T>;
    value(): T;
};

// 练习 7：实现一个数据验证器
type ValidationResult<T> = {
    isValid: boolean;
    errors: string[];
    data?: T;
};

interface Validator<T> {
    validate(data: unknown): ValidationResult<T>;
    required(): Validator<T>;
    optional(): Validator<T | undefined>;
    transform<U>(fn: (value: T) => U): Validator<U>;
}
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **泛型基础**：语法、类型参数、类型推断
- ✅ **泛型函数**：单参数、多参数、约束泛型
- ✅ **泛型接口**：基本接口、复杂接口、函数接口
- ✅ **泛型约束**：基本约束、键约束、条件约束
- ✅ **工具类型**：内置工具类型、自定义工具类型
- ✅ **高级模式**：条件类型、递归泛型、分布式条件类型
- ✅ **实际应用**：数据访问层、状态管理、HTTP 客户端

## 🚀 下一步

现在你已经掌握了泛型编程的基础，让我们继续学习更高级的类型系统特性！

👉 **下一步：[高级类型](./02-advanced-types.md)**

---

> 💡 **记住**：泛型是 TypeScript 中最强大的特性之一。掌握泛型不仅能让你写出更安全、更可重用的代码，还能帮你更好地理解和使用各种开源库。多练习，多思考，泛型会成为你的得力助手！ 