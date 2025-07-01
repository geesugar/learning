# TypeScript 函数与接口

> 掌握 TypeScript 中函数和接口的使用方法

## 🎯 学习目标

完成本节后，你将掌握：

- 函数的类型注解和返回值类型
- 函数重载和可选参数
- 接口的定义和使用
- 接口继承和组合
- 函数接口和索引签名

## 🔧 函数基础

### 1. 函数声明和类型注解

```typescript
// 基本函数声明
function greet(name: string): string {
    return `你好，${name}！`;
}

// 函数表达式
const add = function(a: number, b: number): number {
    return a + b;
};

// 箭头函数
const multiply = (x: number, y: number): number => x * y;

// 调用函数
console.log(greet("张三"));     // "你好，张三！"
console.log(add(10, 20));       // 30
console.log(multiply(5, 4));    // 20
```

### 2. 可选参数和默认参数

```typescript
// 可选参数（用 ? 标记）
function createUser(name: string, age?: number): string {
    if (age !== undefined) {
        return `用户：${name}，年龄：${age}`;
    }
    return `用户：${name}`;
}

console.log(createUser("Alice"));        // "用户：Alice"
console.log(createUser("Bob", 25));      // "用户：Bob，年龄：25"

// 默认参数
function calculateTax(price: number, taxRate: number = 0.1): number {
    return price * taxRate;
}

console.log(calculateTax(100));      // 10 (使用默认税率 0.1)
console.log(calculateTax(100, 0.2)); // 20 (使用指定税率 0.2)

// 默认参数可以是复杂表达式
function createConfig(
    name: string, 
    options: { debug: boolean; version: string } = { debug: false, version: "1.0.0" }
): object {
    return { name, ...options };
}
```

### 3. 剩余参数

```typescript
// 剩余参数
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3));        // 6
console.log(sum(1, 2, 3, 4, 5));  // 15

// 混合参数
function logMessage(level: string, ...messages: string[]): void {
    console.log(`[${level}]`, messages.join(" "));
}

logMessage("INFO", "系统启动", "成功");  // "[INFO] 系统启动 成功"
logMessage("ERROR", "连接失败");        // "[ERROR] 连接失败"

// 剩余参数与解构
function processData(name: string, ...args: [number, boolean]): void {
    const [count, isActive] = args;
    console.log(`${name}: 数量=${count}, 活跃=${isActive}`);
}

processData("测试", 10, true); // "测试: 数量=10, 活跃=true"
```

### 4. 函数重载

```typescript
// 函数重载声明
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: boolean): string;

// 函数实现
function formatValue(value: string | number | boolean): string {
    if (typeof value === "string") {
        return `字符串: ${value}`;
    } else if (typeof value === "number") {
        return `数字: ${value.toFixed(2)}`;
    } else {
        return `布尔值: ${value ? "是" : "否"}`;
    }
}

// 使用重载函数
console.log(formatValue("Hello"));    // "字符串: Hello"
console.log(formatValue(42.123));     // "数字: 42.12"
console.log(formatValue(true));       // "布尔值: 是"

// 更复杂的重载示例
function createDate(timestamp: number): Date;
function createDate(year: number, month: number, day: number): Date;
function createDate(dateString: string): Date;

function createDate(arg1: number | string, month?: number, day?: number): Date {
    if (typeof arg1 === "string") {
        return new Date(arg1);
    } else if (month !== undefined && day !== undefined) {
        return new Date(arg1, month - 1, day); // 月份从0开始
    } else {
        return new Date(arg1);
    }
}

// 使用重载
let date1 = createDate(1640995200000);        // 时间戳
let date2 = createDate(2023, 12, 25);         // 年月日
let date3 = createDate("2023-12-25");         // 字符串
```

## 🏗️ 函数类型

### 1. 函数类型表达式

```typescript
// 定义函数类型
type MathOperation = (a: number, b: number) => number;
type StringFormatter = (input: string) => string;
type EventHandler = (event: Event) => void;

// 使用函数类型
const addNumbers: MathOperation = (x, y) => x + y;
const subtractNumbers: MathOperation = (x, y) => x - y;

const upperCase: StringFormatter = (str) => str.toUpperCase();
const lowerCase: StringFormatter = (str) => str.toLowerCase();

// 高阶函数
function createCalculator(operation: MathOperation): (a: number, b: number) => number {
    return operation;
}

const calculator = createCalculator(addNumbers);
console.log(calculator(10, 5)); // 15
```

### 2. 调用签名

```typescript
// 对象中的函数属性
type Calculator = {
    (a: number, b: number): number;  // 调用签名
    description: string;             // 其他属性
    reset(): void;                   // 方法
};

const myCalculator: Calculator = function(a: number, b: number): number {
    return a + b;
} as Calculator;

myCalculator.description = "简单计算器";
myCalculator.reset = function() {
    console.log("计算器已重置");
};

// 使用
console.log(myCalculator(5, 3));        // 8
console.log(myCalculator.description);  // "简单计算器"  
myCalculator.reset();                   // "计算器已重置"
```

### 3. 构造签名

```typescript
// 构造签名
type PersonConstructor = {
    new (name: string, age: number): Person;
    readonly species: string;
};

class Person {
    static readonly species = "Homo sapiens";
    
    constructor(public name: string, public age: number) {}
    
    greet(): string {
        return `我是 ${this.name}，${this.age} 岁`;
    }
}

// 使用构造签名
function createPerson(ctor: PersonConstructor, name: string, age: number): Person {
    return new ctor(name, age);
}

const person = createPerson(Person, "张三", 30);
console.log(person.greet()); // "我是 张三，30 岁"
```

## 📋 接口基础

### 1. 基本接口定义

```typescript
// 基本接口
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;        // 可选属性
    readonly createdAt: Date;  // 只读属性
}

// 使用接口
const user: User = {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    createdAt: new Date()
};

// user.createdAt = new Date(); // 错误：只读属性不能修改
console.log(user.name); // "张三"
```

### 2. 函数接口

```typescript
// 函数接口
interface SearchFunction {
    (source: string, subString: string): boolean;
}

// 实现函数接口
const mySearch: SearchFunction = function(src, sub) {
    return src.indexOf(sub) > -1;
};

console.log(mySearch("Hello World", "World")); // true

// 方法签名
interface StringValidator {
    isAcceptable(s: string): boolean;
}

class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string): boolean {
        return /^[A-Za-z]+$/.test(s);
    }
}

class NumbersOnlyValidator implements StringValidator {
    isAcceptable(s: string): boolean {
        return /^[0-9]+$/.test(s);
    }
}
```

### 3. 索引签名

```typescript
// 字符串索引签名
interface StringDictionary {
    [key: string]: string;
}

const dict: StringDictionary = {
    "name": "张三",
    "city": "北京",
    "country": "中国"
};

// 数字索引签名
interface NumberArray {
    [index: number]: number;
}

const numbers: NumberArray = [1, 2, 3, 4, 5];

// 混合索引签名
interface MixedDictionary {
    name: string;           // 固定属性
    [key: string]: any;     // 其他任意属性
}

const config: MixedDictionary = {
    name: "应用配置",
    theme: "dark",
    version: "1.0.0",
    debug: true
};
```

## 🔗 接口继承和组合

### 1. 接口继承

```typescript
// 基础接口
interface Animal {
    name: string;
    age: number;
}

// 继承接口
interface Dog extends Animal {
    breed: string;
    bark(): void;
}

interface Cat extends Animal {
    color: string;
    meow(): void;
}

// 实现继承的接口
const myDog: Dog = {
    name: "小白",
    age: 3,
    breed: "金毛",
    bark() {
        console.log("汪汪！");
    }
};

const myCat: Cat = {
    name: "小咪",
    age: 2,
    color: "橘色",
    meow() {
        console.log("喵喵！");
    }
};
```

### 2. 多重继承

```typescript
// 多个基础接口
interface Flyable {
    fly(): void;
    maxHeight: number;
}

interface Swimmable {
    swim(): void;
    maxDepth: number;
}

// 多重继承
interface Duck extends Animal, Flyable, Swimmable {
    quack(): void;
}

// 实现多重继承
const duck: Duck = {
    name: "小鸭",
    age: 1,
    maxHeight: 100,
    maxDepth: 5,
    fly() {
        console.log("小鸭在飞翔");
    },
    swim() {
        console.log("小鸭在游泳");
    },
    quack() {
        console.log("嘎嘎嘎！");
    }
};
```

### 3. 接口合并

```typescript
// 接口合并（同名接口会自动合并）
interface Box {
    height: number;
    width: number;
}

interface Box {
    scale: number;
}

// 合并后的 Box 接口包含所有属性
const box: Box = {
    height: 5,
    width: 6,
    scale: 10
};

// 条件合并
interface Document {
    createElement(tagName: "div"): HTMLDivElement;
    createElement(tagName: "span"): HTMLSpanElement;
    createElement(tagName: string): HTMLElement;
}
```

## 🎨 高级模式

### 1. 泛型接口

```typescript
// 泛型接口
interface Container<T> {
    value: T;
    getValue(): T;
    setValue(value: T): void;
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

const stringContainer = new StringContainer("Hello");
const numberContainer = new NumberContainer(42);
```

### 2. 条件类型接口

```typescript
// 条件类型接口
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
}

// 不同数据类型的响应
type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;
type ErrorResponse = ApiResponse<null>;

// 使用条件类型
function handleResponse<T>(response: ApiResponse<T>): T | null {
    if (response.status === 200) {
        return response.data;
    }
    console.error(response.message);
    return null;
}
```

### 3. 映射类型接口

```typescript
// 映射类型
interface Person {
    name: string;
    age: number;
    email: string;
}

// 所有属性变为可选
type PartialPerson = Partial<Person>;

// 所有属性变为只读
type ReadonlyPerson = Readonly<Person>;

// 选择特定属性
type PersonName = Pick<Person, "name">;

// 排除特定属性
type PersonWithoutEmail = Omit<Person, "email">;

// 使用映射类型
const partialPerson: PartialPerson = { name: "张三" };
const readonlyPerson: ReadonlyPerson = { name: "李四", age: 30, email: "lisi@example.com" };
const personName: PersonName = { name: "王五" };
const personWithoutEmail: PersonWithoutEmail = { name: "赵六", age: 25 };
```

## 🛠️ 实践示例

### 1. 用户管理系统

```typescript
// 用户相关接口
interface BaseUser {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserProfile extends BaseUser {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
}

interface AdminUser extends UserProfile {
    permissions: string[];
    lastLogin: Date;
}

// 用户操作接口
interface UserService {
    getUser(id: number): Promise<UserProfile | null>;
    createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile>;
    updateUser(id: number, updates: Partial<UserProfile>): Promise<UserProfile>;
    deleteUser(id: number): Promise<boolean>;
}

// 事件处理接口
interface UserEventHandler {
    onUserCreated(user: UserProfile): void;
    onUserUpdated(user: UserProfile): void;
    onUserDeleted(userId: number): void;
}
```

### 2. API 客户端

```typescript
// API 配置接口
interface ApiConfig {
    baseUrl: string;
    timeout: number;
    headers?: Record<string, string>;
    auth?: {
        type: 'bearer' | 'basic';
        token: string;
    };
}

// HTTP 方法接口
interface HttpClient {
    get<T>(url: string, config?: Partial<ApiConfig>): Promise<T>;
    post<T>(url: string, data: any, config?: Partial<ApiConfig>): Promise<T>;
    put<T>(url: string, data: any, config?: Partial<ApiConfig>): Promise<T>;
    delete<T>(url: string, config?: Partial<ApiConfig>): Promise<T>;
}

// 响应接口
interface ApiError {
    code: string;
    message: string;
    details?: any;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```

## 📝 最佳实践

### 1. 接口设计原则

```typescript
// ✅ 推荐：接口名称使用 PascalCase
interface UserAccount {
    id: number;
    name: string;
}

// ✅ 推荐：使用具体的属性类型
interface Product {
    id: number;
    name: string;
    price: number;
    category: 'electronics' | 'clothing' | 'books';
    inStock: boolean;
}

// ❌ 避免：过于宽泛的类型
interface Product {
    id: any;
    name: any;
    price: any;
}

// ✅ 推荐：使用只读属性保护重要数据
interface Config {
    readonly version: string;
    readonly apiUrl: string;
    timeout: number;
}
```

### 2. 函数设计原则

```typescript
// ✅ 推荐：明确的参数和返回类型
function calculateTotalPrice(
    items: Array<{ price: number; quantity: number }>,
    taxRate: number = 0.1
): number {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal * (1 + taxRate);
}

// ✅ 推荐：使用函数重载处理不同场景
function formatDate(date: Date): string;
function formatDate(timestamp: number): string;
function formatDate(dateString: string): string;
function formatDate(input: Date | number | string): string {
    const date = typeof input === 'string' || typeof input === 'number' 
        ? new Date(input) 
        : input;
    return date.toLocaleDateString('zh-CN');
}

// ✅ 推荐：使用类型守卫确保类型安全
function isValidEmail(email: unknown): email is string {
    return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
}
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：创建一个 BlogPost 接口
// 要求：id(number), title(string), content(string), 
//      author(string), publishedAt(Date), tags(string[])
//      views(可选number), featured(可选boolean)

// 练习 2：创建一个函数接口 Validator
// 要求：接收任意值，返回验证结果对象 { isValid: boolean, message?: string }

// 练习 3：创建一个 Database 接口，支持泛型
// 要求：find<T>(id: number): T | null
//      save<T>(entity: T): T
//      delete(id: number): boolean

// 练习 4：实现一个计算器接口
// 要求：支持基本运算(add, subtract, multiply, divide)
//      每个方法接收两个数字参数，返回计算结果
//      添加一个 history 属性记录操作历史
```

### 高级练习

```typescript
// 练习 5：创建一个事件系统
// EventEmitter 接口：
// - on(event: string, handler: Function): void
// - off(event: string, handler: Function): void  
// - emit(event: string, ...args: any[]): void

// 练习 6：创建一个状态管理接口
// Store<T> 接口：
// - getState(): T
// - setState(state: Partial<T>): void
// - subscribe(listener: (state: T) => void): () => void
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **函数类型**：参数类型、返回值类型、可选参数、默认参数
- ✅ **函数重载**：多种调用方式的类型安全
- ✅ **接口定义**：属性、方法、索引签名
- ✅ **接口继承**：单继承、多继承、接口合并
- ✅ **高级模式**：泛型接口、条件类型、映射类型
- ✅ **最佳实践**：设计原则和代码规范

## 🚀 下一步

恭喜！你已经完成了 TypeScript 基础入门阶段。现在你具备了：

- TypeScript 基本概念和优势理解
- 完整的开发环境和工具链
- 扎实的语法基础和类型系统知识
- 丰富的基础类型使用经验
- 函数和接口的深入应用能力

👉 **下一步：[第二阶段 - 类型系统深入](../02-type-system/README.md)**

---

> 💡 **记住**：函数和接口是 TypeScript 中最重要的抽象工具。合理使用它们可以让你的代码更加类型安全、易于理解和维护！ 