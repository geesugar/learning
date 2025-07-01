# TypeScript 基础语法

> 掌握 TypeScript 的基础语法和类型注解

## 🎯 学习目标

完成本节后，你将掌握：

- 变量声明和类型注解语法
- TypeScript 类型推断机制
- 基本的编译配置
- TypeScript 与 JavaScript 的语法差异

## 📝 变量声明和类型注解

### 基本语法

```typescript
// 基本类型注解语法
let 变量名: 类型 = 值;

// 示例
let name: string = "张三";
let age: number = 25;
let isActive: boolean = true;
```

### 变量声明方式

```typescript
// 1. let 声明（推荐）
let username: string = "user1";
let count: number = 0;

// 2. const 声明（不可变）
const PI: number = 3.14159;
const API_URL: string = "https://api.example.com";

// 3. var 声明（不推荐，兼容性考虑）
var oldStyle: string = "legacy";
```

### 类型注解位置

```typescript
// 变量类型注解
let message: string = "Hello";

// 函数参数类型注解
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// 函数返回值类型注解
function add(a: number, b: number): number {
    return a + b;
}

// 对象属性类型注解
let user: { name: string; age: number } = {
    name: "Alice",
    age: 30
};
```

## 🤖 类型推断

TypeScript 具有强大的类型推断能力，很多时候可以自动推断类型。

### 基本类型推断

```typescript
// TypeScript 会自动推断类型
let message = "Hello, World!";     // 推断为 string
let count = 42;                    // 推断为 number
let isEnabled = true;              // 推断为 boolean

// 等价于显式类型注解
let message: string = "Hello, World!";
let count: number = 42;
let isEnabled: boolean = true;
```

### 函数返回值推断

```typescript
// 返回值类型会被自动推断
function multiply(a: number, b: number) {
    return a * b;  // 推断返回值为 number
}

// 复杂类型推断
function getUser() {
    return {
        name: "John",
        age: 30,
        email: "john@example.com"
    };
}
// 推断返回值类型为 { name: string; age: number; email: string }
```

### 数组类型推断

```typescript
// 数组类型推断
let numbers = [1, 2, 3, 4, 5];        // 推断为 number[]
let names = ["Alice", "Bob", "Charlie"]; // 推断为 string[]
let mixed = [1, "hello", true];        // 推断为 (string | number | boolean)[]

// 空数组需要显式类型注解
let emptyNumbers: number[] = [];
let emptyStrings: string[] = [];
```

### 对象类型推断

```typescript
// 对象字面量类型推断
let person = {
    name: "Alice",
    age: 30,
    isEmployed: true
};
// 推断类型：{ name: string; age: number; isEmployed: boolean }

// 嵌套对象类型推断
let company = {
    name: "Tech Corp",
    address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001"
    },
    employees: 100
};
```

## 🔄 类型注解 vs 类型推断

### 何时使用类型注解

```typescript
// 1. 函数参数（必须）
function processUser(user: User) {
    // 参数类型必须明确指定
}

// 2. 函数返回值（推荐）
function calculateTotal(items: Item[]): number {
    // 明确返回值类型，提高代码可读性
    return items.reduce((sum, item) => sum + item.price, 0);
}

// 3. 变量初始值不明确时
let result: string | null = null;
let data: any[] = [];

// 4. 复杂类型定义
let config: {
    apiUrl: string;
    timeout: number;
    retries: number;
} = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};
```

### 何时依赖类型推断

```typescript
// 1. 简单变量赋值
let name = "John";           // 推断为 string
let age = 25;                // 推断为 number

// 2. 数组字面量
let colors = ["red", "green", "blue"];  // 推断为 string[]

// 3. 对象字面量
let point = { x: 10, y: 20 };  // 推断为 { x: number; y: number }

// 4. 函数表达式
const add = (a: number, b: number) => a + b;  // 返回值推断为 number
```

## 🚫 类型断言

有时候你比 TypeScript 更了解某个值的类型，可以使用类型断言。

### 语法形式

```typescript
// 方式一：尖括号语法
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

// 方式二：as 语法（推荐，JSX 兼容）
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```

### 常见使用场景

```typescript
// 1. DOM 元素类型断言
const inputElement = document.getElementById('user-input') as HTMLInputElement;
inputElement.value = "Hello";

// 2. 联合类型缩窄
interface Bird {
    fly(): void;
}

interface Fish {
    swim(): void;
}

function move(animal: Bird | Fish) {
    if ('fly' in animal) {
        (animal as Bird).fly();
    } else {
        (animal as Fish).swim();
    }
}

// 3. 非空断言
let userName: string | null = getUserName();
console.log(userName!.toUpperCase()); // 断言 userName 不为 null
```

## ⚙️ 编译配置基础

### 基本编译选项

```json
{
  "compilerOptions": {
    /* 基本选项 */
    "target": "ES2018",                 // 编译目标
    "module": "commonjs",               // 模块系统
    "outDir": "./dist",                 // 输出目录
    "rootDir": "./src",                 // 根目录
    
    /* 严格模式选项 */
    "strict": true,                     // 启用严格模式
    "noImplicitAny": true,             // 禁止隐式 any
    "strictNullChecks": true,          // 严格空值检查
    
    /* 模块解析选项 */
    "moduleResolution": "node",         // Node.js 模块解析
    "esModuleInterop": true,           // ES 模块互操作
    "skipLibCheck": true,              // 跳过库文件检查
    
    /* 源码映射 */
    "sourceMap": true,                 // 生成源码映射
    "declaration": true                // 生成类型声明文件
  }
}
```

### 严格模式的影响

```typescript
// 启用 strict: true 后的变化

// 1. 函数参数必须有类型注解
function greet(name) {  // 错误：Parameter 'name' implicitly has an 'any' type
    return `Hello, ${name}!`;
}

function greet(name: string) {  // 正确
    return `Hello, ${name}!`;
}

// 2. 严格空值检查
let message: string | null = null;
console.log(message.length);  // 错误：Object is possibly 'null'

if (message !== null) {
    console.log(message.length);  // 正确
}

// 3. 函数返回值检查
function processData(): string {
    if (Math.random() > 0.5) {
        return "success";
    }
    // 错误：Not all code paths return a value
}
```

## 🆚 TypeScript vs JavaScript 语法对比

### 变量声明

```javascript
// JavaScript
let name = "John";
let age = 30;
let user = { name: "Alice", age: 25 };

// TypeScript
let name: string = "John";
let age: number = 30;
let user: { name: string; age: number } = { name: "Alice", age: 25 };
```

### 函数定义

```javascript
// JavaScript
function add(a, b) {
    return a + b;
}

const multiply = (a, b) => a * b;

// TypeScript
function add(a: number, b: number): number {
    return a + b;
}

const multiply = (a: number, b: number): number => a * b;
```

### 对象和接口

```javascript
// JavaScript
const user = {
    name: "John",
    age: 30,
    email: "john@example.com"
};

// TypeScript
interface User {
    name: string;
    age: number;
    email: string;
}

const user: User = {
    name: "John",
    age: 30,
    email: "john@example.com"
};
```

## 🎯 最佳实践

### 1. 优先使用类型推断

```typescript
// 推荐：让 TypeScript 推断类型
let message = "Hello, World!";
let numbers = [1, 2, 3, 4, 5];

// 不推荐：过度的类型注解
let message: string = "Hello, World!";
let numbers: number[] = [1, 2, 3, 4, 5];
```

### 2. 函数参数必须注解

```typescript
// 推荐：明确的参数类型
function processUser(user: User, options: ProcessOptions) {
    // 实现逻辑
}

// 不推荐：隐式 any 参数
function processUser(user, options) {  // 错误
    // 实现逻辑
}
```

### 3. 复杂类型使用接口

```typescript
// 推荐：使用接口定义复杂类型
interface ApiResponse {
    data: any;
    status: number;
    message: string;
}

function handleResponse(response: ApiResponse) {
    // 处理响应
}

// 不推荐：内联对象类型
function handleResponse(response: {
    data: any;
    status: number;
    message: string;
}) {
    // 处理响应
}
```

### 4. 合理使用类型断言

```typescript
// 推荐：必要时使用类型断言
const element = document.getElementById('myInput') as HTMLInputElement;

// 不推荐：过度使用类型断言
const element = document.getElementById('myInput') as any;
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：添加类型注解
let productName = "MacBook Pro";
let price = 1999.99;
let inStock = true;

// 练习 2：函数类型注解
function calculateDiscount(price, discountPercent) {
    return price * (1 - discountPercent / 100);
}

// 练习 3：对象类型注解
let product = {
    name: "iPhone",
    price: 999,
    category: "Electronics",
    specifications: {
        color: "Black",
        storage: "128GB"
    }
};
```

### 答案

```typescript
// 答案 1
let productName: string = "MacBook Pro";
let price: number = 1999.99;
let inStock: boolean = true;

// 答案 2
function calculateDiscount(price: number, discountPercent: number): number {
    return price * (1 - discountPercent / 100);
}

// 答案 3
let product: {
    name: string;
    price: number;
    category: string;
    specifications: {
        color: string;
        storage: string;
    };
} = {
    name: "iPhone",
    price: 999,
    category: "Electronics",
    specifications: {
        color: "Black",
        storage: "128GB"
    }
};
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **类型注解语法**：`:` 符号进行类型标注
- ✅ **类型推断**：TypeScript 自动推断类型的能力
- ✅ **何时使用类型注解**：函数参数、复杂类型等场景
- ✅ **编译配置基础**：strict 模式和基本选项
- ✅ **最佳实践**：优先推断、明确参数、合理断言

## 🚀 下一步

现在你已经掌握了基础语法，让我们深入学习 TypeScript 的类型系统！

👉 **下一步：[基础类型](./04-basic-types.md)**

---

> 💡 **记住**：TypeScript 的类型系统是为了帮助你写出更安全、更可维护的代码。从简单的类型注解开始，逐步培养类型思维！ 