# TypeScript 快速开始指南

> 5 分钟快速上手 TypeScript

## 🚀 立即开始

### 步骤 1：安装 TypeScript

```bash
# 全局安装 TypeScript
npm install -g typescript ts-node

# 验证安装
tsc --version
ts-node --version
```

### 步骤 2：创建第一个 TypeScript 文件

```typescript
// hello.ts
function greet(name: string): string {
    return `Hello, ${name}!`;
}

const userName: string = "TypeScript";
const message = greet(userName);

console.log(message);
```

### 步骤 3：运行 TypeScript 代码

```bash
# 方式一：编译后运行
tsc hello.ts        # 生成 hello.js
node hello.js       # 运行 JavaScript

# 方式二：直接运行
ts-node hello.ts    # 直接运行 TypeScript
```

## 🏗️ 创建项目

### 项目初始化

```bash
# 创建项目目录
mkdir my-ts-project
cd my-ts-project

# 初始化 npm 项目
npm init -y

# 安装 TypeScript 依赖
npm install -D typescript @types/node ts-node

# 生成 TypeScript 配置
npx tsc --init
```

### 项目结构

```
my-ts-project/
├── src/
│   └── index.ts      # 入口文件
├── dist/             # 编译输出
├── package.json      # 项目配置
└── tsconfig.json     # TypeScript 配置
```

### 配置 package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "tsc --watch"
  }
}
```

## 📝 基础示例

### 1. 基本类型

```typescript
// 基础类型示例
let message: string = "Hello TypeScript";
let count: number = 42;
let isActive: boolean = true;
let items: string[] = ["apple", "banana", "orange"];

console.log(`${message}, count: ${count}, active: ${isActive}`);
console.log("Items:", items.join(", "));
```

### 2. 函数类型

```typescript
// 函数类型示例
function add(a: number, b: number): number {
    return a + b;
}

const multiply = (x: number, y: number): number => x * y;

// 可选参数
function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}!`;
}

console.log(add(5, 3));           // 8
console.log(multiply(4, 2));      // 8
console.log(greet("Alice"));      // Hello, Alice!
console.log(greet("Bob", "Hi"));  // Hi, Bob!
```

### 3. 接口和对象

```typescript
// 接口定义
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;  // 可选属性
}

// 使用接口
const user: User = {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com"
};

function displayUser(user: User): void {
    console.log(`用户：${user.name} (${user.email})`);
    if (user.age) {
        console.log(`年龄：${user.age}`);
    }
}

displayUser(user);
```

### 4. 类和继承

```typescript
// 类定义
class Animal {
    constructor(public name: string) {}
    
    makeSound(): string {
        return `${this.name} makes a sound`;
    }
}

class Dog extends Animal {
    constructor(name: string, public breed: string) {
        super(name);
    }
    
    makeSound(): string {
        return `${this.name} barks`;
    }
    
    getInfo(): string {
        return `${this.name} is a ${this.breed}`;
    }
}

const dog = new Dog("Buddy", "Golden Retriever");
console.log(dog.makeSound());  // Buddy barks
console.log(dog.getInfo());    // Buddy is a Golden Retriever
```

## 🎯 常用模式

### 1. 联合类型

```typescript
type Status = "loading" | "success" | "error";

function handleStatus(status: Status): string {
    switch (status) {
        case "loading":
            return "处理中...";
        case "success":
            return "操作成功！";
        case "error":
            return "操作失败！";
        default:
            return "未知状态";
    }
}

console.log(handleStatus("success"));  // 操作成功！
```

### 2. 泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

// 泛型接口
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

// 使用示例
const stringResult = identity<string>("Hello");
const numberResult = identity<number>(42);

const userResponse: ApiResponse<User> = {
    data: {
        id: 1,
        name: "Alice",
        email: "alice@example.com"
    },
    status: 200,
    message: "Success"
};

console.log(stringResult);  // Hello
console.log(numberResult);  // 42
console.log(userResponse.data.name);  // Alice
```

### 3. 类型守卫

```typescript
// 类型守卫函数
function isString(value: any): value is string {
    return typeof value === "string";
}

function processValue(value: string | number): string {
    if (isString(value)) {
        return value.toUpperCase();  // TypeScript 知道这里 value 是 string
    } else {
        return value.toString();     // TypeScript 知道这里 value 是 number
    }
}

console.log(processValue("hello"));  // HELLO
console.log(processValue(123));      // 123
```

## 📦 实用工具

### 1. 类型定义文件

```typescript
// types.ts - 集中管理类型定义
export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export type PaymentMethod = "credit_card" | "paypal" | "bank_transfer";
```

### 2. 工具类型

```typescript
// 使用内置工具类型
interface FullUser {
    id: number;
    name: string;
    email: string;
    password: string;
}

// 选择部分属性
type PublicUser = Omit<FullUser, "password">;

// 所有属性可选
type PartialUser = Partial<FullUser>;

// 所有属性必需
type RequiredUser = Required<PartialUser>;

// 选择特定属性
type UserCredentials = Pick<FullUser, "email" | "password">;
```

## 🛠️ 开发工具配置

### VS Code 配置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### ESLint 配置

```bash
# 安装 ESLint 和 TypeScript 支持
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 生成配置文件
npx eslint --init
```

## 🔧 常见问题

### 1. 类型错误

```typescript
// 问题：类型不匹配
let num: number = "123";  // 错误

// 解决：类型转换
let num: number = parseInt("123");  // 正确
```

### 2. 可能为 null 的值

```typescript
// 问题：可能为 null
const element = document.getElementById("myId");
element.innerHTML = "Hello";  // 错误：Object is possibly 'null'

// 解决：类型守卫
const element = document.getElementById("myId");
if (element) {
    element.innerHTML = "Hello";  // 正确
}

// 或者：非空断言（确定不为 null 时）
const element = document.getElementById("myId")!;
element.innerHTML = "Hello";  // 正确
```

### 3. 模块导入

```typescript
// 问题：找不到模块
import * as lodash from "lodash";  // 可能报错

// 解决：安装类型定义
// npm install -D @types/lodash

// 或者：声明模块
declare module "lodash";
```

## 📚 学习资源

### 官方资源
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)

### 实践练习
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript Exercises](https://typescript-exercises.github.io/)

### 社区资源
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript 中文手册](https://typescript.bootcss.com/)

## 🎯 接下来

完成快速开始后，你可以：

1. **深入学习**：阅读 [完整学习指南](./README.md)
2. **实践项目**：查看 [示例项目](./examples/)
3. **进阶主题**：学习 [高级类型](./02-type-system/)

---

> 💡 **提示**：TypeScript 学习是一个渐进的过程。从基础类型开始，逐步掌握更高级的特性。多写代码，多看错误信息，你会很快掌握 TypeScript！ 