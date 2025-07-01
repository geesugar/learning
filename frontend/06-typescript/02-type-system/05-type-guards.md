# TypeScript 类型守卫

> 掌握类型守卫，确保运行时类型安全，桥接编译时和运行时的类型检查

## 🎯 学习目标

完成本节后，你将掌握：

- 类型守卫的概念和作用
- 内置类型守卫的使用
- 自定义类型守卫的实现
- 断言函数和类型谓词
- 判别联合类型的类型收窄

## 🛡️ 类型守卫基础

类型守卫是一种在运行时检查类型的机制，它可以让 TypeScript 编译器在特定代码块中缩小变量的类型范围。

### typeof 类型守卫

```typescript
// typeof 类型守卫
function processValue(value: string | number): string {
    if (typeof value === 'string') {
        // 在这个分支中，TypeScript 知道 value 是 string 类型
        return value.toUpperCase();
    } else {
        // 在这个分支中，TypeScript 知道 value 是 number 类型
        return value.toString();
    }
}

// 复杂的 typeof 守卫
function formatValue(value: string | number | boolean | object): string {
    if (typeof value === 'string') {
        return `"${value}"`;
    } else if (typeof value === 'number') {
        return value.toFixed(2);
    } else if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    } else if (typeof value === 'object') {
        if (value === null) {
            return 'null';
        }
        return JSON.stringify(value);
    }
    return 'unknown';
}

// 使用示例
console.log("=== typeof 类型守卫示例 ===");
console.log(processValue("hello"));        // "HELLO"
console.log(processValue(42));             // "42"
console.log(formatValue("TypeScript"));    // "TypeScript"
console.log(formatValue(3.14159));         // "3.14"
console.log(formatValue(true));            // "Yes"
console.log(formatValue({ name: "张三" })); // '{"name":"张三"}'
console.log(formatValue(null));            // "null"
```

### instanceof 类型守卫

```typescript
// 自定义类
class User {
    constructor(public name: string, public email: string) {}
    
    getInfo(): string {
        return `${this.name} (${this.email})`;
    }
}

class Admin extends User {
    constructor(name: string, email: string, public permissions: string[]) {
        super(name, email);
    }
    
    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }
}

class Guest {
    constructor(public sessionId: string) {}
    
    getSessionInfo(): string {
        return `Guest session: ${this.sessionId}`;
    }
}

// instanceof 类型守卫
function handleUser(user: User | Admin | Guest): string {
    if (user instanceof Admin) {
        // TypeScript 知道 user 是 Admin 类型
        return `Admin: ${user.getInfo()}, Permissions: ${user.permissions.join(', ')}`;
    } else if (user instanceof User) {
        // TypeScript 知道 user 是 User 类型（但不是 Admin）
        return `User: ${user.getInfo()}`;
    } else if (user instanceof Guest) {
        // TypeScript 知道 user 是 Guest 类型
        return user.getSessionInfo();
    }
    return 'Unknown user type';
}

// 内置类型的 instanceof 守卫
function processData(data: string | Date | Array<any>): string {
    if (data instanceof Date) {
        return data.toISOString();
    } else if (data instanceof Array) {
        return `Array with ${data.length} items`;
    } else {
        return data.toUpperCase();
    }
}

// 使用示例
const normalUser = new User("张三", "zhangsan@example.com");
const adminUser = new Admin("李四", "lisi@example.com", ["read", "write", "delete"]);
const guestUser = new Guest("guest_123");

console.log("\n=== instanceof 类型守卫示例 ===");
console.log(handleUser(normalUser));
console.log(handleUser(adminUser));
console.log(handleUser(guestUser));
console.log(processData(new Date()));
console.log(processData([1, 2, 3]));
console.log(processData("hello"));
```

### in 操作符类型守卫

```typescript
// 接口定义
interface Bird {
    type: 'bird';
    fly(): void;
    layEggs(): void;
}

interface Fish {
    type: 'fish';
    swim(): void;
    layEggs(): void;
}

interface Mammal {
    type: 'mammal';
    walk(): void;
    giveBirth(): void;
}

// in 操作符类型守卫
function moveAnimal(animal: Bird | Fish | Mammal): string {
    if ('fly' in animal) {
        // TypeScript 知道 animal 是 Bird 类型
        animal.fly();
        return `${animal.type} is flying`;
    } else if ('swim' in animal) {
        // TypeScript 知道 animal 是 Fish 类型
        animal.swim();
        return `${animal.type} is swimming`;
    } else {
        // TypeScript 知道 animal 是 Mammal 类型
        animal.walk();
        return `${animal.type} is walking`;
    }
}

// 复杂对象的 in 守卫
interface ApiSuccessResponse {
    success: true;
    data: any;
    message: string;
}

interface ApiErrorResponse {
    success: false;
    error: string;
    code: number;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

function handleApiResponse(response: ApiResponse): string {
    if ('data' in response) {
        // 成功响应
        return `Success: ${response.message}`;
    } else {
        // 错误响应
        return `Error ${response.code}: ${response.error}`;
    }
}

// 使用示例
const bird: Bird = {
    type: 'bird',
    fly: () => console.log('Flying high!'),
    layEggs: () => console.log('Laying eggs')
};

const fish: Fish = {
    type: 'fish',
    swim: () => console.log('Swimming fast!'),
    layEggs: () => console.log('Laying eggs in water')
};

console.log("\n=== in 操作符类型守卫示例 ===");
console.log(moveAnimal(bird));
console.log(moveAnimal(fish));
```

## 🎭 自定义类型守卫

通过用户定义的类型守卫函数，我们可以创建更复杂的类型检查逻辑。

### 类型谓词函数

```typescript
// 基本类型谓词
function isString(value: any): value is string {
    return typeof value === 'string';
}

function isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
}

function isArray<T>(value: any): value is T[] {
    return Array.isArray(value);
}

function isObject(value: any): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// 使用自定义类型守卫
function processInput(input: unknown): string {
    if (isString(input)) {
        // TypeScript 知道 input 是 string
        return input.toUpperCase();
    } else if (isNumber(input)) {
        // TypeScript 知道 input 是 number
        return input.toFixed(2);
    } else if (isArray<string>(input)) {
        // TypeScript 知道 input 是 string[]
        return input.join(', ');
    } else if (isObject(input)) {
        // TypeScript 知道 input 是 object
        return JSON.stringify(input);
    }
    return 'Unknown type';
}

console.log("\n=== 自定义类型谓词示例 ===");
console.log(processInput("hello"));
console.log(processInput(42));
console.log(processInput(["a", "b", "c"]));
console.log(processInput({ name: "test" }));
```

### 复杂对象类型守卫

```typescript
// 复杂接口定义
interface UserProfile {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface AdminProfile extends UserProfile {
    permissions: string[];
    lastLogin: Date;
}

interface GuestProfile {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
}

// 复杂类型守卫
function isUserProfile(profile: any): profile is UserProfile {
    return (
        typeof profile === 'object' &&
        profile !== null &&
        typeof profile.id === 'number' &&
        typeof profile.name === 'string' &&
        typeof profile.email === 'string' &&
        (profile.avatar === undefined || typeof profile.avatar === 'string')
    );
}

function isAdminProfile(profile: any): profile is AdminProfile {
    return (
        isUserProfile(profile) &&
        Array.isArray(profile.permissions) &&
        profile.permissions.every((p: any) => typeof p === 'string') &&
        profile.lastLogin instanceof Date
    );
}

function isGuestProfile(profile: any): profile is GuestProfile {
    return (
        typeof profile === 'object' &&
        profile !== null &&
        typeof profile.sessionId === 'string' &&
        typeof profile.ipAddress === 'string' &&
        typeof profile.userAgent === 'string'
    );
}

// 处理不同类型的配置文件
function handleProfile(profile: unknown): string {
    if (isAdminProfile(profile)) {
        return `Admin ${profile.name} with ${profile.permissions.length} permissions`;
    } else if (isUserProfile(profile)) {
        return `User ${profile.name} (${profile.email})`;
    } else if (isGuestProfile(profile)) {
        return `Guest session ${profile.sessionId}`;
    }
    return 'Invalid profile';
}

// 使用示例
const userProfile: UserProfile = {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com"
};

const adminProfile: AdminProfile = {
    id: 2,
    name: "李四",
    email: "lisi@example.com",
    permissions: ["read", "write", "delete"],
    lastLogin: new Date()
};

const guestProfile: GuestProfile = {
    sessionId: "guest_123",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
};

console.log("\n=== 复杂对象类型守卫示例 ===");
console.log(handleProfile(userProfile));
console.log(handleProfile(adminProfile));
console.log(handleProfile(guestProfile));
console.log(handleProfile({ invalid: "data" }));
```

### 泛型类型守卫

```typescript
// 泛型类型守卫
function isArrayOf<T>(value: any, itemGuard: (item: any) => item is T): value is T[] {
    return Array.isArray(value) && value.every(itemGuard);
}

function hasProperty<T, K extends string>(
    obj: T, 
    prop: K
): obj is T & Record<K, unknown> {
    return typeof obj === 'object' && obj !== null && prop in obj;
}

function hasPropertyOfType<T, K extends string, V>(
    obj: T,
    prop: K,
    typeGuard: (val: any) => val is V
): obj is T & Record<K, V> {
    return hasProperty(obj, prop) && typeGuard((obj as any)[prop]);
}

// 使用泛型类型守卫
function processStringArray(input: unknown): string {
    if (isArrayOf(input, isString)) {
        // TypeScript 知道 input 是 string[]
        return input.join(' | ');
    }
    return 'Not a string array';
}

function processObjectWithName(obj: unknown): string {
    if (hasPropertyOfType(obj, 'name', isString)) {
        // TypeScript 知道 obj 有 name 属性且类型为 string
        return `Object name: ${obj.name}`;
    }
    return 'Object has no string name property';
}

console.log("\n=== 泛型类型守卫示例 ===");
console.log(processStringArray(["hello", "world"]));
console.log(processStringArray([1, 2, 3]));
console.log(processObjectWithName({ name: "测试对象" }));
console.log(processObjectWithName({ name: 123 }));
```

## 🔍 断言函数 (Assertion Functions)

断言函数在条件不满足时抛出异常，并且可以告诉 TypeScript 编译器变量的类型。

### 基本断言函数

```typescript
// 基本断言函数
function assert(condition: any, message: string): asserts condition {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertIsString(value: any): asserts value is string {
    if (typeof value !== 'string') {
        throw new Error(`Expected string, got ${typeof value}`);
    }
}

function assertIsNumber(value: any): asserts value is number {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`Expected number, got ${typeof value}`);
    }
}

// 使用断言函数
function processValue(input: unknown): string {
    assertIsString(input);
    // 在这里，TypeScript 知道 input 是 string 类型
    return input.toUpperCase();
}

function calculateSquare(input: unknown): number {
    assertIsNumber(input);
    // 在这里，TypeScript 知道 input 是 number 类型
    return input * input;
}

console.log("\n=== 基本断言函数示例 ===");
try {
    console.log(processValue("hello"));    // "HELLO"
    console.log(calculateSquare(5));       // 25
    
    // 这些会抛出异常
    // console.log(processValue(123));
    // console.log(calculateSquare("not a number"));
} catch (error) {
    console.error(error.message);
}
```

### 复杂断言函数

```typescript
// 对象结构断言
function assertHasProperty<T, K extends string>(
    obj: T,
    prop: K,
    message?: string
): asserts obj is T & Record<K, unknown> {
    if (typeof obj !== 'object' || obj === null || !(prop in obj)) {
        throw new Error(message || `Object must have property '${prop}'`);
    }
}

function assertIsValidUser(user: any): asserts user is UserProfile {
    assert(typeof user === 'object' && user !== null, 'User must be an object');
    assert(typeof user.id === 'number', 'User must have numeric id');
    assert(typeof user.name === 'string', 'User must have string name');
    assert(typeof user.email === 'string', 'User must have string email');
    assert(
        user.avatar === undefined || typeof user.avatar === 'string',
        'User avatar must be string or undefined'
    );
}

// 数组断言
function assertIsArrayOf<T>(
    value: any, 
    itemAssertion: (item: any) => asserts item is T,
    message?: string
): asserts value is T[] {
    assert(Array.isArray(value), message || 'Value must be an array');
    value.forEach((item, index) => {
        try {
            itemAssertion(item);
        } catch (error) {
            throw new Error(`Array item at index ${index}: ${error.message}`);
        }
    });
}

// 使用复杂断言函数
function processUser(userData: unknown): string {
    assertIsValidUser(userData);
    // TypeScript 知道 userData 是 UserProfile 类型
    return `Processing user: ${userData.name} (ID: ${userData.id})`;
}

function processUsers(usersData: unknown): string[] {
    assertIsArrayOf(usersData, assertIsValidUser, 'Expected array of users');
    // TypeScript 知道 usersData 是 UserProfile[] 类型
    return usersData.map(user => `${user.name}: ${user.email}`);
}

console.log("\n=== 复杂断言函数示例 ===");
try {
    const validUser = {
        id: 1,
        name: "张三",
        email: "zhangsan@example.com"
    };
    
    console.log(processUser(validUser));
    
    const validUsers = [
        { id: 1, name: "张三", email: "zhangsan@example.com" },
        { id: 2, name: "李四", email: "lisi@example.com" }
    ];
    
    console.log(processUsers(validUsers));
} catch (error) {
    console.error(error.message);
}
```

## 🎯 判别联合类型

判别联合类型通过共同的字面量属性来区分不同的类型。

### 基本判别联合

```typescript
// 定义判别联合类型
interface LoadingState {
    status: 'loading';
    progress: number;
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

// 使用判别属性进行类型守卫
function renderState(state: AsyncState): string {
    switch (state.status) {
        case 'loading':
            // TypeScript 知道 state 是 LoadingState
            return `Loading... ${state.progress}%`;
        case 'success':
            // TypeScript 知道 state 是 SuccessState
            return `Success at ${state.timestamp.toISOString()}`;
        case 'error':
            // TypeScript 知道 state 是 ErrorState
            return `Error: ${state.error} (Retry: ${state.retryCount})`;
        default:
            // 穷尽性检查
            const exhaustiveCheck: never = state;
            return exhaustiveCheck;
    }
}

// 类型守卫函数
function isLoadingState(state: AsyncState): state is LoadingState {
    return state.status === 'loading';
}

function isSuccessState(state: AsyncState): state is SuccessState {
    return state.status === 'success';
}

function isErrorState(state: AsyncState): state is ErrorState {
    return state.status === 'error';
}

// 使用示例
const states: AsyncState[] = [
    { status: 'loading', progress: 50 },
    { status: 'success', data: { message: 'Hello' }, timestamp: new Date() },
    { status: 'error', error: '网络错误', retryCount: 3 }
];

console.log("\n=== 判别联合类型示例 ===");
states.forEach(state => {
    console.log(renderState(state));
    
    if (isLoadingState(state)) {
        console.log(`  Progress: ${state.progress}%`);
    } else if (isSuccessState(state)) {
        console.log(`  Data:`, state.data);
    } else if (isErrorState(state)) {
        console.log(`  Retry count: ${state.retryCount}`);
    }
});
```

### 复杂判别联合

```typescript
// 复杂的判别联合类型
interface HttpGetRequest {
    method: 'GET';
    url: string;
    headers?: Record<string, string>;
}

interface HttpPostRequest {
    method: 'POST';
    url: string;
    body: any;
    headers?: Record<string, string>;
}

interface HttpPutRequest {
    method: 'PUT';
    url: string;
    body: any;
    headers?: Record<string, string>;
}

interface HttpDeleteRequest {
    method: 'DELETE';
    url: string;
    headers?: Record<string, string>;
}

type HttpRequest = HttpGetRequest | HttpPostRequest | HttpPutRequest | HttpDeleteRequest;

// 处理不同类型的请求
async function makeRequest(request: HttpRequest): Promise<any> {
    const baseConfig: RequestInit = {
        method: request.method,
        headers: request.headers
    };

    switch (request.method) {
        case 'GET':
        case 'DELETE':
            // TypeScript 知道这些请求没有 body
            return fetch(request.url, baseConfig);
            
        case 'POST':
        case 'PUT':
            // TypeScript 知道这些请求有 body
            return fetch(request.url, {
                ...baseConfig,
                body: JSON.stringify(request.body)
            });
            
        default:
            const exhaustiveCheck: never = request;
            throw new Error(`Unsupported method: ${exhaustiveCheck}`);
    }
}

// 请求构建器
class RequestBuilder {
    static get(url: string, headers?: Record<string, string>): HttpGetRequest {
        return { method: 'GET', url, headers };
    }
    
    static post(url: string, body: any, headers?: Record<string, string>): HttpPostRequest {
        return { method: 'POST', url, body, headers };
    }
    
    static put(url: string, body: any, headers?: Record<string, string>): HttpPutRequest {
        return { method: 'PUT', url, body, headers };
    }
    
    static delete(url: string, headers?: Record<string, string>): HttpDeleteRequest {
        return { method: 'DELETE', url, headers };
    }
}

console.log("\n=== 复杂判别联合类型示例 ===");
const requests: HttpRequest[] = [
    RequestBuilder.get('/api/users'),
    RequestBuilder.post('/api/users', { name: '张三', email: 'zhangsan@example.com' }),
    RequestBuilder.put('/api/users/1', { name: '李四' }),
    RequestBuilder.delete('/api/users/1')
];

requests.forEach(request => {
    console.log(`${request.method} ${request.url}`);
    if ('body' in request) {
        console.log('  Body:', request.body);
    }
});
```

## 🛠️ 实际应用场景

### API 数据验证

```typescript
// API 数据验证系统
interface ApiUser {
    id: number;
    username: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        age: number;
    };
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };
}

// 详细的类型守卫
function isValidEmail(email: any): email is string {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidAge(age: any): age is number {
    return typeof age === 'number' && age >= 0 && age <= 150;
}

function isValidTheme(theme: any): theme is 'light' | 'dark' {
    return theme === 'light' || theme === 'dark';
}

function isApiUser(data: any): data is ApiUser {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'number' &&
        typeof data.username === 'string' &&
        isValidEmail(data.email) &&
        typeof data.profile === 'object' &&
        data.profile !== null &&
        typeof data.profile.firstName === 'string' &&
        typeof data.profile.lastName === 'string' &&
        isValidAge(data.profile.age) &&
        typeof data.preferences === 'object' &&
        data.preferences !== null &&
        isValidTheme(data.preferences.theme) &&
        typeof data.preferences.notifications === 'boolean'
    );
}

// API 响应处理
function processApiUserData(rawData: unknown): ApiUser {
    if (!isApiUser(rawData)) {
        throw new Error('Invalid user data received from API');
    }
    
    // TypeScript 知道 rawData 是 ApiUser 类型
    console.log(`Processing user: ${rawData.username} (${rawData.email})`);
    return rawData;
}

// 使用示例
const validUserData = {
    id: 1,
    username: "zhangsan",
    email: "zhangsan@example.com",
    profile: {
        firstName: "三",
        lastName: "张",
        age: 30
    },
    preferences: {
        theme: "dark" as const,
        notifications: true
    }
};

const invalidUserData = {
    id: "not-a-number",
    username: "lisi",
    email: "invalid-email"
};

console.log("\n=== API 数据验证示例 ===");
try {
    const user1 = processApiUserData(validUserData);
    console.log("Valid user processed:", user1.username);
    
    // const user2 = processApiUserData(invalidUserData); // 会抛出错误
} catch (error) {
    console.error("Validation error:", error.message);
}
```

### 状态机类型守卫

```typescript
// 状态机定义
interface IdleState {
    type: 'idle';
    lastAction?: string;
}

interface ProcessingState {
    type: 'processing';
    taskId: string;
    progress: number;
    startTime: Date;
}

interface CompletedState {
    type: 'completed';
    result: any;
    duration: number;
    completedAt: Date;
}

interface FailedState {
    type: 'failed';
    error: string;
    retryCount: number;
    failedAt: Date;
}

type MachineState = IdleState | ProcessingState | CompletedState | FailedState;

// 状态转换守卫
function canTransition(from: MachineState, to: MachineState['type']): boolean {
    switch (from.type) {
        case 'idle':
            return to === 'processing';
        case 'processing':
            return to === 'completed' || to === 'failed';
        case 'completed':
        case 'failed':
            return to === 'idle' || to === 'processing';
        default:
            return false;
    }
}

// 状态机类
class StateMachine {
    private _state: MachineState = { type: 'idle' };
    
    get state(): MachineState {
        return this._state;
    }
    
    transition(newState: MachineState): void {
        if (!canTransition(this._state, newState.type)) {
            throw new Error(`Invalid transition from ${this._state.type} to ${newState.type}`);
        }
        this._state = newState;
    }
    
    getStateInfo(): string {
        switch (this._state.type) {
            case 'idle':
                return this._state.lastAction 
                    ? `Idle (last action: ${this._state.lastAction})`
                    : 'Idle';
            case 'processing':
                return `Processing task ${this._state.taskId} (${this._state.progress}%)`;
            case 'completed':
                return `Completed in ${this._state.duration}ms at ${this._state.completedAt.toISOString()}`;
            case 'failed':
                return `Failed: ${this._state.error} (retries: ${this._state.retryCount})`;
            default:
                const exhaustiveCheck: never = this._state;
                return exhaustiveCheck;
        }
    }
    
    // 类型安全的状态检查方法
    isIdle(): this is { state: IdleState } {
        return this._state.type === 'idle';
    }
    
    isProcessing(): this is { state: ProcessingState } {
        return this._state.type === 'processing';
    }
    
    isCompleted(): this is { state: CompletedState } {
        return this._state.type === 'completed';
    }
    
    isFailed(): this is { state: FailedState } {
        return this._state.type === 'failed';
    }
}

// 使用示例
const machine = new StateMachine();

console.log("\n=== 状态机类型守卫示例 ===");
console.log("Initial state:", machine.getStateInfo());

// 开始处理
machine.transition({
    type: 'processing',
    taskId: 'task_001',
    progress: 0,
    startTime: new Date()
});
console.log("Processing state:", machine.getStateInfo());

if (machine.isProcessing()) {
    // TypeScript 知道 machine.state 是 ProcessingState
    console.log(`Task ID: ${machine.state.taskId}`);
}

// 完成处理
machine.transition({
    type: 'completed',
    result: { success: true, data: "处理完成" },
    duration: 1500,
    completedAt: new Date()
});
console.log("Completed state:", machine.getStateInfo());

if (machine.isCompleted()) {
    // TypeScript 知道 machine.state 是 CompletedState
    console.log(`Result:`, machine.state.result);
}
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：实现一个通用的空值检查类型守卫
// 要求：检查值是否为 null 或 undefined

// 练习 2：创建一个数组类型守卫
// 要求：检查数组中的所有元素是否都是指定类型

// 练习 3：实现一个对象属性存在性检查
// 要求：检查对象是否包含指定的属性并且类型正确

// 练习 4：创建一个 URL 有效性检查类型守卫
// 要求：检查字符串是否为有效的 URL 格式
```

### 高级练习

```typescript
// 练习 5：实现一个递归对象验证器
// 要求：深度验证嵌套对象的结构和类型

// 练习 6：创建一个基于 JSON Schema 的类型守卫生成器
// 要求：根据 JSON Schema 定义生成对应的类型守卫函数

// 练习 7：实现一个类型安全的事件系统
// 要求：使用类型守卫确保事件数据的类型安全
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **内置守卫**：typeof、instanceof、in 操作符的使用
- ✅ **自定义守卫**：类型谓词函数和复杂类型检查
- ✅ **断言函数**：在运行时强制类型约束
- ✅ **判别联合**：使用共同属性进行类型区分
- ✅ **实际应用**：API 验证、状态机、数据处理等场景
- ✅ **最佳实践**：类型安全的运行时验证策略

## 🚀 下一步

现在你已经掌握了类型守卫的强大功能，让我们继续学习声明文件，了解如何为第三方库添加类型支持！

👉 **下一步：[声明文件](./06-declaration-files.md)**

---

> 💡 **记住**：类型守卫是连接编译时类型检查和运行时数据验证的桥梁。它们不仅让 TypeScript 能够进行更精确的类型推断，还帮助你在运行时捕获类型相关的错误。在处理来自外部的数据时，类型守卫是确保类型安全的重要工具！ 