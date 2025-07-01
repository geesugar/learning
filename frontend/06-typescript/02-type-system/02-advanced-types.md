# TypeScript 高级类型

> 掌握 TypeScript 的高级类型系统，提升类型编程能力

## 🎯 学习目标

完成本节后，你将掌握：

- 联合类型和交叉类型的深入应用
- 字面量类型和模板字面量类型
- 索引类型和映射类型基础
- 条件类型和分布式条件类型
- 类型别名和接口的高级用法

## 🔗 联合类型 (Union Types)

联合类型表示一个值可以是几种类型之一，使用 `|` 操作符连接。

### 基本联合类型

```typescript
// 基本联合类型
type StringOrNumber = string | number;
type BooleanOrNull = boolean | null;
type Status = 'pending' | 'approved' | 'rejected';

// 函数参数联合类型
function formatId(id: string | number): string {
    if (typeof id === 'string') {
        return id.toUpperCase();
    } else {
        return id.toString();
    }
}

// 使用示例
console.log("=== 基本联合类型示例 ===");
console.log(formatId("abc123"));    // "ABC123"
console.log(formatId(123));         // "123"

// 复杂联合类型
type ApiResponse = 
    | { success: true; data: any; message: string }
    | { success: false; error: string; code: number };

function handleApiResponse(response: ApiResponse): void {
    if (response.success) {
        console.log("成功:", response.data);
        console.log("消息:", response.message);
    } else {
        console.error("错误:", response.error);
        console.error("错误码:", response.code);
    }
}
```

### 判别联合类型 (Discriminated Unions)

```typescript
// 使用判别属性的联合类型
interface LoadingState {
    status: 'loading';
    progress?: number;
}

interface SuccessState {
    status: 'success';
    data: any;
    timestamp: Date;
}

interface ErrorState {
    status: 'error';
    error: string;
    retryCount: number;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

// 类型守卫函数
function processAsyncState(state: AsyncState): string {
    switch (state.status) {
        case 'loading':
            return `加载中... ${state.progress ? `${state.progress}%` : ''}`;
        case 'success':
            return `加载成功，时间: ${state.timestamp.toISOString()}`;
        case 'error':
            return `加载失败: ${state.error} (重试次数: ${state.retryCount})`;
        default:
            // 确保处理了所有情况
            const exhaustiveCheck: never = state;
            return exhaustiveCheck;
    }
}

// 使用示例
const loadingState: AsyncState = { status: 'loading', progress: 50 };
const successState: AsyncState = { 
    status: 'success', 
    data: { message: 'Hello' }, 
    timestamp: new Date() 
};
const errorState: AsyncState = { 
    status: 'error', 
    error: '网络错误', 
    retryCount: 3 
};

console.log("\n=== 判别联合类型示例 ===");
console.log(processAsyncState(loadingState));
console.log(processAsyncState(successState));
console.log(processAsyncState(errorState));
```

### 联合类型的高级应用

```typescript
// 函数重载的联合类型实现
type EventMap = {
    click: { x: number; y: number };
    keypress: { key: string; shiftKey: boolean };
    focus: { element: HTMLElement };
};

type EventName = keyof EventMap;

class EventEmitter {
    private listeners: { [K in EventName]?: Array<(data: EventMap[K]) => void> } = {};
    
    on<K extends EventName>(event: K, listener: (data: EventMap[K]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }
    
    emit<K extends EventName>(event: K, data: EventMap[K]): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            eventListeners.forEach(listener => listener(data));
        }
    }
}

// 使用示例
const emitter = new EventEmitter();

emitter.on('click', (data) => {
    console.log(`点击位置: (${data.x}, ${data.y})`);
});

emitter.on('keypress', (data) => {
    console.log(`按键: ${data.key}, Shift: ${data.shiftKey}`);
});

console.log("\n=== 高级联合类型应用 ===");
emitter.emit('click', { x: 100, y: 200 });
emitter.emit('keypress', { key: 'Enter', shiftKey: false });
```

## ⚡ 交叉类型 (Intersection Types)

交叉类型将多个类型合并为一个类型，使用 `&` 操作符连接。

### 基本交叉类型

```typescript
// 基本交叉类型
interface Named {
    name: string;
}

interface Aged {
    age: number;
}

interface Employed {
    jobTitle: string;
    salary: number;
}

type Person = Named & Aged;
type Employee = Named & Aged & Employed;

// 使用交叉类型
const person: Person = {
    name: "张三",
    age: 30
};

const employee: Employee = {
    name: "李四",
    age: 28,
    jobTitle: "软件工程师",
    salary: 15000
};

console.log("\n=== 基本交叉类型示例 ===");
console.log("Person:", person);
console.log("Employee:", employee);
```

### 复杂交叉类型

```typescript
// Mixin 模式
interface Timestamped {
    createdAt: Date;
    updatedAt: Date;
}

interface Identifiable {
    id: string;
}

interface Versioned {
    version: number;
}

// 组合多个接口
type Entity = Identifiable & Timestamped & Versioned;

// 泛型交叉类型
type WithTimestamp<T> = T & Timestamped;
type WithId<T> = T & Identifiable;
type WithVersion<T> = T & Versioned;

// 完整的实体类型
type FullEntity<T> = WithId<WithTimestamp<WithVersion<T>>>;

// 使用示例
interface UserData {
    username: string;
    email: string;
    isActive: boolean;
}

type User = FullEntity<UserData>;

const user: User = {
    id: "user_123",
    username: "zhangsan",
    email: "zhangsan@example.com",
    isActive: true,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date(),
    version: 1
};

console.log("\n=== 复杂交叉类型示例 ===");
console.log("User:", user);
```

### 函数交叉类型

```typescript
// 函数交叉类型
type Logger = {
    log: (message: string) => void;
};

type Formatter = {
    format: (data: any) => string;
};

type ErrorHandler = {
    handleError: (error: Error) => void;
};

type CompleteLogger = Logger & Formatter & ErrorHandler;

// 实现交叉类型
class ConsoleLogger implements CompleteLogger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
    
    format(data: any): string {
        return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    }
    
    handleError(error: Error): void {
        console.error(`[ERROR] ${error.name}: ${error.message}`);
    }
}

// 高阶函数的交叉类型
type Loggable<T> = T & {
    log(): void;
};

function makeLoggable<T extends object>(obj: T, name: string): Loggable<T> {
    return {
        ...obj,
        log() {
            console.log(`${name}:`, this);
        }
    };
}

// 使用示例
const calculator = makeLoggable({ 
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b
}, "Calculator");

console.log("\n=== 函数交叉类型示例 ===");
calculator.log();
console.log("Addition:", calculator.add(5, 3));
```

## 📝 字面量类型 (Literal Types)

字面量类型允许你指定确切的值作为类型。

### 字符串字面量类型

```typescript
// 字符串字面量类型
type Theme = 'light' | 'dark' | 'auto';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 配置对象
interface AppConfig {
    theme: Theme;
    size: Size;
    apiEndpoint: string;
    enableDebug: boolean;
}

// 使用字面量类型的函数
function makeRequest(url: string, method: HttpMethod): Promise<any> {
    console.log(`${method} ${url}`);
    // 模拟请求
    return Promise.resolve({ success: true });
}

// API 路由定义
type ApiRoutes = {
    'GET /users': User[];
    'POST /users': { user: User };
    'GET /users/:id': User;
    'PUT /users/:id': { user: User };
    'DELETE /users/:id': { success: boolean };
};

console.log("\n=== 字符串字面量类型示例 ===");
makeRequest('/api/users', 'GET');
makeRequest('/api/users/123', 'PUT');
```

### 数字和布尔字面量类型

```typescript
// 数字字面量类型
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;
type RGB = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// 布尔字面量类型
type Enabled = true;
type Disabled = false;

// 实际应用示例
interface GameState {
    playerPosition: [number, number];
    lastDiceRoll: DiceValue;
    gameStarted: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
}

function rollDice(): DiceValue {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

function createResponse(status: HttpStatusCode, message: string): {
    status: HttpStatusCode;
    message: string;
    timestamp: Date;
} {
    return {
        status,
        message,
        timestamp: new Date()
    };
}

console.log("\n=== 数字和布尔字面量类型示例 ===");
console.log("Dice roll:", rollDice());
console.log("Response:", createResponse(200, "操作成功"));
```

## 🎭 模板字面量类型 (Template Literal Types)

TypeScript 4.1 引入的模板字面量类型允许基于字符串字面量类型创建新的类型。

### 基本模板字面量类型

```typescript
// 基本模板字面量类型
type World = 'world';
type Greeting = `hello ${World}`;  // "hello world"

type Color = 'red' | 'green' | 'blue';
type Quantity = 'one' | 'two' | 'three';
type SeussFish = `${Quantity | Color} fish`;
// "one fish" | "two fish" | "three fish" | "red fish" | "green fish" | "blue fish"

// 事件名称生成
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>;     // "onClick"
type SubmitEvent = EventName<'submit'>;   // "onSubmit"

// CSS 属性生成
type CSSProperty = 'margin' | 'padding';
type CSSDirection = 'top' | 'right' | 'bottom' | 'left';
type CSSDirectionalProperty = `${CSSProperty}-${CSSDirection}`;
// "margin-top" | "margin-right" | "margin-bottom" | "margin-left" | "padding-top" | ...

console.log("\n=== 基本模板字面量类型示例 ===");
```

### 模板字面量类型的实际应用

```typescript
// API 端点类型生成
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Resource = 'users' | 'posts' | 'comments';
type APIEndpoint = `${HTTPMethod} /${Resource}` | `${HTTPMethod} /${Resource}/:id`;

// 数据库表操作
type TableName = 'users' | 'products' | 'orders';
type Operation = 'select' | 'insert' | 'update' | 'delete';
type SQLOperation = `${Operation}_${TableName}`;

// 响应式断点
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ResponsiveProperty = `${string}-${Breakpoint}`;

// 键路径类型
type ObjectKey<T> = {
    [K in keyof T]: T[K] extends object 
        ? `${string & K}` | `${string & K}.${ObjectKey<T[K]>}`
        : `${string & K}`;
}[keyof T];

interface NestedObject {
    user: {
        profile: {
            name: string;
            age: number;
        };
        settings: {
            theme: string;
        };
    };
    app: {
        version: string;
    };
}

type NestedKeys = ObjectKey<NestedObject>;
// "user" | "app" | "user.profile" | "user.settings" | "user.profile.name" | ...

// 实用工具函数
function getNestedValue<T, K extends ObjectKey<T>>(obj: T, key: K): any {
    return key.split('.').reduce((current, k) => current?.[k], obj as any);
}

console.log("\n=== 模板字面量类型实际应用 ===");
```

## 🔍 索引类型 (Index Types)

索引类型允许你根据属性名动态访问属性类型。

### keyof 操作符

```typescript
// keyof 操作符
interface Person {
    name: string;
    age: number;
    email: string;
    isActive: boolean;
}

type PersonKeys = keyof Person;  // "name" | "age" | "email" | "isActive"

// 使用 keyof 的函数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
    obj[key] = value;
}

// 使用示例
const person: Person = {
    name: "张三",
    age: 30,
    email: "zhangsan@example.com",
    isActive: true
};

console.log("\n=== keyof 操作符示例 ===");
console.log("Name:", getProperty(person, "name"));        // string
console.log("Age:", getProperty(person, "age"));          // number
console.log("Email:", getProperty(person, "email"));      // string

setProperty(person, "age", 31);
console.log("Updated age:", person.age);
```

### 索引访问类型

```typescript
// 索引访问类型
type PersonName = Person['name'];          // string
type PersonAge = Person['age'];            // number
type PersonNameOrAge = Person['name' | 'age'];  // string | number

// 数组元素类型
type StringArray = string[];
type StringArrayElement = StringArray[number];  // string

// 嵌套索引访问
interface Company {
    name: string;
    employees: Person[];
    address: {
        street: string;
        city: string;
        country: string;
    };
}

type EmployeeType = Company['employees'][number];  // Person
type AddressType = Company['address'];             // { street: string; city: string; country: string; }
type CityType = Company['address']['city'];        // string

// 动态索引访问
function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
    return array.map(item => item[key]);
}

const people: Person[] = [
    { name: "张三", age: 30, email: "zhangsan@example.com", isActive: true },
    { name: "李四", age: 25, email: "lisi@example.com", isActive: false },
    { name: "王五", age: 35, email: "wangwu@example.com", isActive: true }
];

console.log("\n=== 索引访问类型示例 ===");
console.log("Names:", pluck(people, 'name'));     // string[]
console.log("Ages:", pluck(people, 'age'));       // number[]
console.log("Active status:", pluck(people, 'isActive'));  // boolean[]
```

## 🎯 条件类型 (Conditional Types)

条件类型根据类型关系来选择类型，语法类似三元运算符。

### 基本条件类型

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// 测试条件类型
type Test1 = IsString<string>;        // true
type Test2 = IsString<number>;        // false
type Test3 = IsArray<string[]>;       // true
type Test4 = IsArray<string>;         // false
type Test5 = IsFunction<() => void>;  // true
type Test6 = IsFunction<string>;      // false

// 复杂条件类型
type NonNullable<T> = T extends null | undefined ? never : T;
type FlattenArray<T> = T extends (infer U)[] ? U : T;

type Example1 = NonNullable<string | null>;     // string
type Example2 = NonNullable<number | undefined>; // number
type Example3 = FlattenArray<string[]>;         // string
type Example4 = FlattenArray<number>;           // number

console.log("\n=== 基本条件类型示例 ===");
console.log("条件类型定义完成");
```

### 分布式条件类型

```typescript
// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

// 对联合类型分布应用
type StringOrNumberArray = ToArray<string | number>;  // string[] | number[]

// 实用的分布式条件类型
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

type Example5 = Exclude<'a' | 'b' | 'c', 'a'>;        // 'b' | 'c'
type Example6 = Extract<'a' | 'b' | 'c', 'a' | 'b'>;  // 'a' | 'b'

// 函数参数和返回值提取
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

function exampleFunction(a: string, b: number, c: boolean): Date {
    return new Date();
}

type ExampleParams = Parameters<typeof exampleFunction>;  // [string, number, boolean]
type ExampleReturn = ReturnType<typeof exampleFunction>;  // Date

console.log("\n=== 分布式条件类型示例 ===");
```

### 条件类型的实际应用

```typescript
// API 响应类型推断
interface ApiSuccess<T> {
    success: true;
    data: T;
    message: string;
}

interface ApiError {
    success: false;
    error: string;
    code: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// 根据响应类型提取数据
type ExtractData<T> = T extends ApiSuccess<infer U> ? U : never;
type ExtractError<T> = T extends ApiError ? T['error'] : never;

// 智能类型推断函数
function handleApiResponse<T>(response: ApiResponse<T>): ExtractData<ApiResponse<T>> | null {
    if (response.success) {
        return response.data;
    } else {
        console.error(`API Error: ${response.error} (Code: ${response.code})`);
        return null;
    }
}

// 深度只读类型
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object 
        ? T[P] extends Function 
            ? T[P] 
            : DeepReadonly<T[P]>
        : T[P];
};

// 深度可选类型
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object 
        ? T[P] extends Function 
            ? T[P] 
            : DeepPartial<T[P]>
        : T[P];
};

// 使用示例
interface Config {
    database: {
        host: string;
        port: number;
        credentials: {
            username: string;
            password: string;
        };
    };
    api: {
        baseUrl: string;
        timeout: number;
    };
}

type ReadonlyConfig = DeepReadonly<Config>;
type PartialConfig = DeepPartial<Config>;

const config: ReadonlyConfig = {
    database: {
        host: "localhost",
        port: 5432,
        credentials: {
            username: "admin",
            password: "secret"
        }
    },
    api: {
        baseUrl: "https://api.example.com",
        timeout: 5000
    }
};

const partialConfig: PartialConfig = {
    database: {
        host: "newhost"
        // 其他属性都是可选的
    }
};

console.log("\n=== 条件类型实际应用示例 ===");
console.log("Config:", config);
console.log("Partial config:", partialConfig);
```

## 🛠️ 实用工具类型组合

### 复合工具类型

```typescript
// 创建一个完整的 CRUD 类型系统
interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// 创建输入类型（排除自动生成的字段）
type CreateInput<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// 更新输入类型（所有字段可选，但排除自动生成的字段）
type UpdateInput<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// 查询响应类型
type QueryResponse<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

// 排序类型
type SortOrder = 'asc' | 'desc';
type SortBy<T> = {
    field: keyof T;
    order: SortOrder;
};

// 筛选类型
type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
type Filter<T> = {
    [K in keyof T]?: {
        operator: FilterOperator;
        value: T[K] | T[K][];
    };
};

// 完整的仓储接口
interface Repository<T extends BaseEntity> {
    findById(id: string): Promise<T | null>;
    findAll(options?: {
        page?: number;
        pageSize?: number;
        sort?: SortBy<T>;
        filter?: Filter<T>;
    }): Promise<QueryResponse<T>>;
    create(input: CreateInput<T>): Promise<T>;
    update(id: string, input: UpdateInput<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}

// 示例实体
interface User extends BaseEntity {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: 'admin' | 'user' | 'moderator';
}

// 类型推断验证
type UserCreateInput = CreateInput<User>;
// {
//     username: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     isActive: boolean;
//     role: 'admin' | 'user' | 'moderator';
// }

type UserUpdateInput = UpdateInput<User>;
// {
//     username?: string;
//     email?: string;
//     firstName?: string;
//     lastName?: string;
//     isActive?: boolean;
//     role?: 'admin' | 'user' | 'moderator';
// }

console.log("\n=== 实用工具类型组合示例 ===");
console.log("CRUD 类型系统定义完成");
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：实现一个配置合并类型
// 要求：将两个配置对象类型合并，第二个配置覆盖第一个配置的同名属性

// 练习 2：实现一个递归的键路径类型
// 要求：给定一个嵌套对象类型，生成所有可能的键路径

// 练习 3：实现一个类型安全的事件系统
// 要求：使用字面量类型和条件类型确保事件类型安全

// 练习 4：实现一个表单验证类型系统
// 要求：根据表单字段类型自动推断验证规则类型
```

### 高级练习

```typescript
// 练习 5：实现一个数据库查询构建器类型
// 要求：类型安全的查询条件、排序、分页等

// 练习 6：实现一个状态机类型系统
// 要求：定义状态、转换条件、动作等的类型安全系统

// 练习 7：实现一个路由类型系统
// 要求：根据路由定义自动推断参数类型和响应类型
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **联合类型**：多选一的类型设计和判别联合类型
- ✅ **交叉类型**：类型组合和 Mixin 模式
- ✅ **字面量类型**：精确的值类型限制
- ✅ **模板字面量类型**：动态字符串类型生成
- ✅ **索引类型**：keyof 操作符和动态属性访问
- ✅ **条件类型**：基于类型关系的类型选择
- ✅ **高级应用**：复合工具类型和实际项目应用

## 🚀 下一步

现在你已经掌握了高级类型的核心概念，让我们继续学习类型推断的深入机制！

👉 **下一步：[类型推断](./03-type-inference.md)**

---

> 💡 **记住**：高级类型是 TypeScript 的精华所在。这些类型工具让你能够在编译时进行复杂的类型操作，创建出既灵活又安全的类型系统。多练习这些概念，它们将成为你构建大型应用的重要武器！ 