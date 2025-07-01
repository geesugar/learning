# TypeScript 类型推断

> 深入理解 TypeScript 的类型推断机制，编写更简洁的类型安全代码

## 🎯 学习目标

完成本节后，你将掌握：

- TypeScript 类型推断的基本原理
- 上下文类型推断和最佳公共类型
- 函数返回类型推断
- infer 关键字的使用和应用
- 类型推断的最佳实践

## 🔍 类型推断基础

TypeScript 能够在没有明确类型注解的情况下，根据代码上下文自动推断变量和表达式的类型。

### 基本类型推断

```typescript
// 基本类型推断
let message = "Hello, TypeScript!";        // 推断为 string
let count = 42;                           // 推断为 number
let isActive = true;                      // 推断为 boolean
let items = [1, 2, 3];                   // 推断为 number[]
let mixed = [1, "hello", true];          // 推断为 (string | number | boolean)[]

// 对象类型推断
let user = {
    name: "张三",
    age: 30,
    email: "zhangsan@example.com"
};
// 推断为 { name: string; age: number; email: string; }

// 函数返回类型推断
function add(a: number, b: number) {
    return a + b;                        // 推断返回类型为 number
}

function greet(name: string) {
    return `Hello, ${name}!`;            // 推断返回类型为 string
}

// 数组方法类型推断
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2); // 推断为 number[]
const strings = numbers.map(n => n.toString()); // 推断为 string[]

console.log("=== 基本类型推断示例 ===");
console.log("Message type:", typeof message);    // "string"
console.log("Count type:", typeof count);        // "number"
console.log("User:", user);
console.log("Add result:", add(10, 5));          // 15
console.log("Doubled:", doubled);                // [2, 4, 6, 8, 10]
```

### 最佳公共类型 (Best Common Type)

当推断联合类型时，TypeScript 会寻找最佳公共类型。

```typescript
// 最佳公共类型推断
let mixedNumbers = [1, 2.5, 3];         // 推断为 number[]
let mixedValues = [1, "hello", true];    // 推断为 (string | number | boolean)[]

// 类继承的最佳公共类型
class Animal {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class Dog extends Animal {
    breed: string;
    constructor(name: string, breed: string) {
        super(name);
        this.breed = breed;
    }
}

class Cat extends Animal {
    color: string;
    constructor(name: string, color: string) {
        super(name);
        this.color = color;
    }
}

// 推断为 Animal[]，因为 Animal 是 Dog 和 Cat 的公共基类
let animals = [
    new Dog("小白", "金毛"),
    new Cat("小咪", "橘色"),
    new Animal("未知动物")
];

// 显式指定更具体的类型
let pets: (Dog | Cat)[] = [
    new Dog("小白", "金毛"),
    new Cat("小咪", "橘色")
    // new Animal("未知动物")  // 错误：Animal 不能赋值给 Dog | Cat
];

console.log("\n=== 最佳公共类型示例 ===");
console.log("Mixed values:", mixedValues);
console.log("Animals:", animals.map(a => a.name));
console.log("Pets:", pets.map(p => p.name));
```

## 🎨 上下文类型推断 (Contextual Typing)

TypeScript 会根据表达式所在的上下文来推断类型。

### 函数参数上下文推断

```typescript
// 函数参数上下文推断
const numbers = [1, 2, 3, 4, 5];

// 回调函数参数类型从上下文推断
numbers.forEach(n => {
    console.log(n.toFixed(2));  // n 被推断为 number
});

numbers.map(n => n * 2);        // n 被推断为 number，返回值推断为 number
numbers.filter(n => n > 3);     // n 被推断为 number，返回值推断为 boolean
numbers.reduce((acc, n) => acc + n, 0); // acc 和 n 都被推断为 number

// 对象方法的上下文推断
interface EventHandler {
    onClick: (event: MouseEvent) => void;
    onKeyPress: (event: KeyboardEvent) => void;
}

const handler: EventHandler = {
    onClick: (e) => {
        // e 被推断为 MouseEvent
        console.log(`点击位置: ${e.clientX}, ${e.clientY}`);
    },
    onKeyPress: (e) => {
        // e 被推断为 KeyboardEvent
        console.log(`按键: ${e.key}`);
    }
};

// Promise 的上下文推断
const fetchUser = (): Promise<{ id: number; name: string }> => {
    return new Promise(resolve => {
        // resolve 参数类型被推断为 { id: number; name: string }
        setTimeout(() => {
            resolve({ id: 1, name: "张三" });
        }, 1000);
    });
};

console.log("\n=== 上下文类型推断示例 ===");
fetchUser().then(user => {
    // user 类型被推断为 { id: number; name: string }
    console.log(`用户: ${user.name} (ID: ${user.id})`);
});
```

### 泛型函数的上下文推断

```typescript
// 泛型函数的上下文推断
function identity<T>(arg: T): T {
    return arg;
}

// T 被推断为 string
let stringResult = identity("hello");

// T 被推断为 number
let numberResult = identity(42);

// T 被推断为 { name: string; age: number }
let objectResult = identity({ name: "张三", age: 30 });

// 更复杂的泛型推断
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
    return array.map(fn);
}

// T 推断为 number，U 推断为 string
let mappedStrings = map([1, 2, 3], n => n.toString());

// T 推断为 string，U 推断为 number
let mappedNumbers = map(["1", "2", "3"], s => parseInt(s));

// 条件泛型推断
function process<T>(
    value: T,
    processor: T extends string ? (s: string) => string : (n: number) => number
): T extends string ? string : number {
    return processor(value as any) as any;
}

// 使用示例
const processedString = process("hello", s => s.toUpperCase());  // string
const processedNumber = process(42, n => n * 2);                 // number

console.log("\n=== 泛型函数上下文推断示例 ===");
console.log("String result:", stringResult);
console.log("Object result:", objectResult);
console.log("Mapped strings:", mappedStrings);
console.log("Processed string:", processedString);
console.log("Processed number:", processedNumber);
```

## 🔧 函数返回类型推断

TypeScript 可以根据函数体推断返回类型。

### 基本返回类型推断

```typescript
// 基本返回类型推断
function calculateArea(width: number, height: number) {
    return width * height;  // 推断返回类型为 number
}

function formatMessage(name: string, age: number) {
    return `${name} is ${age} years old`;  // 推断返回类型为 string
}

function createUser(name: string, email: string) {
    return {
        id: Math.random().toString(36),
        name,
        email,
        createdAt: new Date()
    };
    // 推断返回类型为 {
    //     id: string;
    //     name: string;
    //     email: string;
    //     createdAt: Date;
    // }
}

// 条件返回类型推断
function findUser(id: string) {
    const users = [
        { id: "1", name: "张三" },
        { id: "2", name: "李四" }
    ];
    
    const user = users.find(u => u.id === id);
    return user;  // 推断返回类型为 { id: string; name: string } | undefined
}

// 异步函数返回类型推断
async function fetchData(url: string) {
    const response = await fetch(url);
    const data = await response.json();
    return data;  // 推断返回类型为 Promise<any>
}

async function fetchUserData(id: string) {
    const user = await findUser(id);
    if (user) {
        return {
            ...user,
            profile: await fetchData(`/api/users/${id}/profile`)
        };
    }
    return null;
    // 推断返回类型为 Promise<{
    //     id: string;
    //     name: string;
    //     profile: any;
    // } | null>
}

console.log("\n=== 函数返回类型推断示例 ===");
console.log("Area:", calculateArea(10, 5));
console.log("Message:", formatMessage("张三", 30));
console.log("User:", createUser("李四", "lisi@example.com"));
```

### 高阶函数返回类型推断

```typescript
// 高阶函数返回类型推断
function createFactory<T>(defaultValue: T) {
    return function(value?: T) {
        return value ?? defaultValue;
    };
    // 推断返回类型为 (value?: T) => T
}

const stringFactory = createFactory("default");  // (value?: string) => string
const numberFactory = createFactory(0);          // (value?: number) => number

// 柯里化函数的类型推断
function curry<A, B, C>(fn: (a: A, b: B) => C) {
    return function(a: A) {
        return function(b: B) {
            return fn(a, b);
        };
    };
    // 推断返回类型为 (a: A) => (b: B) => C
}

const curriedAdd = curry((a: number, b: number) => a + b);
// 类型为 (a: number) => (b: number) => number

const add5 = curriedAdd(5);  // (b: number) => number
const result = add5(10);     // number

// 函数组合的类型推断
function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B) {
    return function(a: A) {
        return f(g(a));
    };
    // 推断返回类型为 (a: A) => C
}

const addOne = (n: number) => n + 1;
const toString = (n: number) => n.toString();
const addOneAndStringify = compose(toString, addOne);
// 类型为 (a: number) => string

console.log("\n=== 高阶函数返回类型推断示例 ===");
console.log("String factory:", stringFactory());
console.log("String factory with value:", stringFactory("custom"));
console.log("Curried add result:", result);
console.log("Composed function:", addOneAndStringify(5));  // "6"
```

## 🎪 infer 关键字

`infer` 关键字用在条件类型中，可以推断类型的一部分。

### 基本 infer 用法

```typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function exampleFunction(): string {
    return "hello";
}

type ExampleReturnType = ReturnType<typeof exampleFunction>;  // string

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function exampleWithParams(a: string, b: number, c: boolean): void {}

type ExampleParameters = Parameters<typeof exampleWithParams>;  // [string, number, boolean]

// 提取数组元素类型
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ArrayElement<string[]>;    // string
type NumberArrayElement = ArrayElement<number[]>;    // number
type MixedArrayElement = ArrayElement<(string | number)[]>;  // string | number

console.log("\n=== 基本 infer 用法示例 ===");
console.log("infer 类型定义完成");
```

### 高级 infer 应用

```typescript
// 提取 Promise 的值类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseString = Awaited<Promise<string>>;      // string
type PromiseNumber = Awaited<Promise<number>>;      // number
type NonPromise = Awaited<string>;                  // string

// 递归提取嵌套 Promise
type DeepAwaited<T> = T extends Promise<infer U> 
    ? DeepAwaited<U> 
    : T;

type NestedPromise = Promise<Promise<Promise<string>>>;
type DeepAwaitedResult = DeepAwaited<NestedPromise>;  // string

// 提取对象属性类型
type PropertyType<T, K extends keyof T> = T extends { [P in K]: infer U } ? U : never;

interface User {
    id: number;
    name: string;
    email: string;
}

type UserIdType = PropertyType<User, 'id'>;      // number
type UserNameType = PropertyType<User, 'name'>;  // string

// 提取构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : any;

class MyClass {
    value: string;
    constructor(value: string) {
        this.value = value;
    }
}

type MyClassInstance = InstanceType<typeof MyClass>;  // MyClass

// 提取元组的第一个元素类型
type Head<T> = T extends [infer H, ...any[]] ? H : never;

type FirstElement = Head<[string, number, boolean]>;  // string
type EmptyTupleHead = Head<[]>;                       // never

// 提取元组的尾部类型
type Tail<T> = T extends [any, ...infer Rest] ? Rest : never;

type RestElements = Tail<[string, number, boolean]>;  // [number, boolean]
type EmptyTupleTail = Tail<[]>;                       // never

console.log("\n=== 高级 infer 应用示例 ===");
```

### infer 在实用工具类型中的应用

```typescript
// 创建一个深度提取工具类型
type DeepPropertyType<T, Path extends string> = 
    Path extends `${infer Key}.${infer Rest}` 
        ? Key extends keyof T 
            ? DeepPropertyType<T[Key], Rest>
            : never
        : Path extends keyof T 
            ? T[Path]
            : never;

interface NestedObject {
    user: {
        profile: {
            name: string;
            age: number;
        };
        settings: {
            theme: 'light' | 'dark';
            notifications: boolean;
        };
    };
    app: {
        version: string;
        features: string[];
    };
}

type UserName = DeepPropertyType<NestedObject, 'user.profile.name'>;        // string
type UserAge = DeepPropertyType<NestedObject, 'user.profile.age'>;          // number
type Theme = DeepPropertyType<NestedObject, 'user.settings.theme'>;         // 'light' | 'dark'
type AppVersion = DeepPropertyType<NestedObject, 'app.version'>;             // string

// 函数重载类型提取
type OverloadedReturnType<T> = T extends {
    (...args: any[]): infer R;
    (...args: any[]): any;
} ? R : T extends (...args: any[]) => infer R ? R : any;

// 柯里化类型推断
type Curry<T> = T extends (arg: infer A, ...rest: infer R) => infer Return
    ? R extends []
        ? (arg: A) => Return
        : (arg: A) => Curry<(...rest: R) => Return>
    : never;

type CurriedFunction = Curry<(a: string, b: number, c: boolean) => string>;
// (arg: string) => (arg: number) => (arg: boolean) => string

// 管道类型推断
type Pipe<T extends readonly any[]> = T extends readonly [
    (arg: infer A) => infer B,
    ...infer Rest
] ? Rest extends readonly [(arg: B) => any, ...any[]]
    ? Pipe<Rest> extends (arg: any) => infer C
        ? (arg: A) => C
        : never
    : Rest extends readonly []
        ? (arg: A) => B
        : never
: never;

type PipeFunction = Pipe<[
    (x: number) => string,
    (x: string) => boolean,
    (x: boolean) => Date
]>;
// (arg: number) => Date

console.log("\n=== infer 在实用工具类型中的应用示例 ===");
```

## 📊 类型推断的性能考虑

### 推断复杂性

```typescript
// 简单推断 - 性能良好
const simpleArray = [1, 2, 3];  // 快速推断为 number[]

// 复杂推断 - 可能影响性能
const complexNesting = {
    level1: {
        level2: {
            level3: {
                level4: {
                    level5: {
                        data: [1, 2, 3]
                    }
                }
            }
        }
    }
};

// 过度复杂的条件类型可能导致性能问题
type VeryComplexType<T> = T extends any 
    ? T extends string 
        ? T extends `${infer A}${infer B}${infer C}${infer D}${infer E}` 
            ? [A, B, C, D, E]
            : never
        : never
    : never;

// 更好的做法：限制递归深度
type SafeComplexType<T, Depth extends number = 3> = 
    Depth extends 0 
        ? never 
        : T extends string 
            ? T extends `${infer Head}${infer Tail}` 
                ? [Head, ...SafeComplexType<Tail, /* 递减 Depth */ any>]
                : [T]
            : never;

console.log("\n=== 类型推断性能考虑示例 ===");
console.log("Simple array:", simpleArray);
console.log("Complex nesting:", complexNesting.level1.level2.level3.level4.level5.data);
```

### 推断优化策略

```typescript
// 策略 1: 显式类型注解减少推断工作
interface User {
    id: number;
    name: string;
    email: string;
}

// 好的做法：明确指定类型
const users: User[] = [
    { id: 1, name: "张三", email: "zhangsan@example.com" },
    { id: 2, name: "李四", email: "lisi@example.com" }
];

// 策略 2: 使用类型断言优化复杂推断
const apiResponse = fetchData() as Promise<{ users: User[]; total: number }>;

// 策略 3: 分步骤构建复杂类型
type BaseConfig = {
    apiUrl: string;
    timeout: number;
};

type DatabaseConfig = {
    host: string;
    port: number;
    database: string;
};

type FullConfig = BaseConfig & DatabaseConfig;

// 而不是一次性定义所有
// type FullConfig = {
//     apiUrl: string;
//     timeout: number;
//     host: string;
//     port: number;
//     database: string;
// };

// 策略 4: 使用泛型约束限制推断范围
function processItems<T extends { id: string | number }>(items: T[]): T[] {
    return items.filter(item => item.id !== null);
}

console.log("\n=== 类型推断优化策略示例 ===");
console.log("Users:", users);
```

## 📝 实际应用场景

### API 客户端类型推断

```typescript
// 类型安全的 API 客户端
class ApiClient {
    async get<T>(url: string): Promise<T> {
        const response = await fetch(url);
        return response.json();
    }
    
    async post<T, U>(url: string, data: U): Promise<T> {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}

const client = new ApiClient();

// 类型自动推断
async function fetchUserData() {
    // TypeScript 推断返回类型为 Promise<User>
    const user = await client.get<User>('/api/users/1');
    
    // TypeScript 推断返回类型为 Promise<{ success: boolean }>
    const result = await client.post<{ success: boolean }, Partial<User>>(
        '/api/users/1', 
        { name: '新名称' }
    );
    
    return { user, result };
}

console.log("\n=== API 客户端类型推断示例 ===");
```

### 状态管理类型推断

```typescript
// Redux 风格的类型推断
type Action<T extends string, P = undefined> = P extends undefined 
    ? { type: T }
    : { type: T; payload: P };

type UserActions = 
    | Action<'SET_USER', User>
    | Action<'CLEAR_USER'>
    | Action<'UPDATE_USER', Partial<User>>;

function userReducer(state: User | null = null, action: UserActions): User | null {
    switch (action.type) {
        case 'SET_USER':
            return action.payload;  // TypeScript 知道这里有 payload
        case 'CLEAR_USER':
            return null;            // TypeScript 知道这里没有 payload
        case 'UPDATE_USER':
            return state ? { ...state, ...action.payload } : null;
        default:
            return state;
    }
}

// 使用示例
const initialState = null;
const newUser: User = { id: 1, name: "张三", email: "zhangsan@example.com" };

let currentState = userReducer(initialState, { type: 'SET_USER', payload: newUser });
currentState = userReducer(currentState, { type: 'UPDATE_USER', payload: { name: '李四' } });
currentState = userReducer(currentState, { type: 'CLEAR_USER' });

console.log("\n=== 状态管理类型推断示例 ===");
console.log("Final state:", currentState);
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：实现一个类型推断的工厂函数
// 要求：根据输入参数自动推断返回类型

// 练习 2：创建一个管道函数
// 要求：能够自动推断每个阶段的类型转换

// 练习 3：实现一个类型安全的事件监听器
// 要求：根据事件名称自动推断事件数据类型

// 练习 4：创建一个配置合并函数
// 要求：自动推断合并后的配置类型
```

### 高级练习

```typescript
// 练习 5：实现一个递归类型推断
// 要求：能够处理嵌套对象的深度类型推断

// 练习 6：创建一个条件类型推断系统
// 要求：根据不同条件推断不同的返回类型

// 练习 7：实现一个函数重载推断器
// 要求：能够根据参数自动选择正确的重载签名
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **基础推断**：基本类型推断和最佳公共类型
- ✅ **上下文推断**：根据使用场景推断类型
- ✅ **返回类型推断**：函数返回值的自动推断
- ✅ **infer 关键字**：在条件类型中提取类型信息
- ✅ **性能优化**：推断的性能考虑和优化策略
- ✅ **实际应用**：在真实项目中的应用场景

## 🚀 下一步

现在你已经深入理解了类型推断机制，让我们继续学习映射类型的强大功能！

👉 **下一步：[映射类型](./04-mapped-types.md)**

---

> 💡 **记住**：类型推断是 TypeScript 的核心特性之一。掌握推断机制不仅能让你写出更简洁的代码，还能帮助你更好地理解 TypeScript 的工作原理。合理利用推断，避免过度注解，让类型系统为你服务！ 