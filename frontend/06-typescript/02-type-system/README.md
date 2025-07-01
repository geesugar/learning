# 第二阶段：类型系统深入

> 深入掌握 TypeScript 的高级类型系统，提升类型编程能力

## 🎯 阶段目标

完成第二阶段学习后，你将能够：

- **熟练使用泛型**：编写可重用、类型安全的代码
- **掌握高级类型**：联合类型、交叉类型、条件类型等
- **理解类型推断**：充分利用 TypeScript 的类型推断能力
- **使用映射类型**：动态创建和转换类型
- **实现类型守卫**：运行时类型安全检查
- **编写类型声明**：为第三方库编写类型定义

## 📚 学习内容

### [01. 泛型编程](./01-generics.md)
**学习时间：3-4天**

- 泛型函数和泛型接口
- 泛型约束和条件泛型
- 泛型工具类型
- 实际应用场景

**核心知识点：**
```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

// 泛型约束  
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}

// 条件类型
type IsArray<T> = T extends any[] ? true : false;
```

### [02. 高级类型](./02-advanced-types.md)
**学习时间：4-5天**

- 联合类型和交叉类型深入
- 字面量类型和模板字面量类型
- 索引类型和映射类型
- 条件类型和分布式条件类型

**核心知识点：**
```typescript
// 映射类型
type Partial<T> = {
    [P in keyof T]?: T[P];
};

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
```

### [03. 类型推断](./03-type-inference.md)
**学习时间：2-3天**

- 类型推断规则和最佳实践
- 上下文类型推断
- 返回类型推断
- infer 关键字的使用

**核心知识点：**
```typescript
// 返回类型推断
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// 上下文类型推断
const numbers = [1, 2, 3]; // 推断为 number[]
numbers.map(n => n.toString()); // n 推断为 number
```

### [04. 映射类型](./04-mapped-types.md)
**学习时间：3-4天**

- 基础映射类型
- 键值映射和修饰符
- 模板字面量映射
- 递归映射类型

**核心知识点：**
```typescript
// 基础映射
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// 键值映射
type Record<K extends keyof any, T> = {
    [P in K]: T;
};

// 递归映射
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### [05. 类型守卫](./05-type-guards.md)
**学习时间：2-3天**

- 内置类型守卫
- 自定义类型守卫
- 断言函数
- 区分联合类型

**核心知识点：**
```typescript
// 自定义类型守卫
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

// 断言函数
function assertIsNumber(value: unknown): asserts value is number {
    if (typeof value !== 'number') {
        throw new Error('Not a number');
    }
}
```

### [06. 声明文件](./06-declaration-files.md)
**学习时间：3-4天**

- .d.ts 文件编写
- 模块声明和全局声明
- 第三方库类型定义
- 声明合并

**核心知识点：**
```typescript
// 模块声明
declare module 'my-library' {
    export function myFunction(param: string): number;
}

// 全局声明
declare global {
    interface Window {
        myGlobalFunction: () => void;
    }
}
```

## 🚀 实践项目

### 项目一：类型安全的状态管理器
使用泛型和高级类型创建一个类型安全的状态管理系统。

```typescript
interface Store<T> {
    getState(): T;
    setState(updater: (state: T) => T): void;
    subscribe(listener: (state: T) => void): () => void;
}
```

### 项目二：表单验证库
使用映射类型和条件类型构建表单验证系统。

```typescript
type ValidationRules<T> = {
    [K in keyof T]?: Validator<T[K]>[];
};
```

### 项目三：API 客户端生成器
使用模板字面量类型和映射类型生成类型安全的 API 客户端。

```typescript
type ApiEndpoints = {
    'GET /users': User[];
    'POST /users': { user: User };
    'GET /users/:id': User;
};
```

## 📈 学习进度

### 第1周：泛型编程基础
- [ ] 理解泛型的基本概念
- [ ] 掌握泛型函数和接口
- [ ] 学会使用泛型约束
- [ ] 完成泛型练习题

### 第2周：高级类型特性
- [ ] 深入联合类型和交叉类型
- [ ] 掌握索引类型和映射类型
- [ ] 学习条件类型
- [ ] 实践高级类型应用

### 第3周：类型推断和守卫
- [ ] 理解类型推断机制
- [ ] 使用 infer 关键字
- [ ] 编写类型守卫函数
- [ ] 完成综合练习

### 第4周：声明文件和项目实践
- [ ] 学会编写声明文件
- [ ] 为第三方库添加类型
- [ ] 完成实践项目
- [ ] 准备进入第三阶段

## 🎯 学习重点

### 核心概念
1. **泛型**：提高代码复用性和类型安全性
2. **类型操作**：使用 TypeScript 的类型系统进行"类型编程"
3. **类型推断**：理解 TypeScript 如何自动推断类型
4. **类型安全**：运行时和编译时的类型保证

### 实践技能
1. **API 设计**：设计类型友好的 API
2. **错误处理**：类型安全的错误处理模式
3. **性能优化**：类型系统对性能的影响
4. **团队协作**：类型定义的规范和共享

## 📝 评估标准

完成以下任务表示你已经掌握了第二阶段的内容：

### 基础要求 ✅
- [ ] 能够编写和使用泛型函数
- [ ] 理解并使用基本的映射类型
- [ ] 能够编写简单的类型守卫
- [ ] 了解类型推断的基本规则

### 进阶要求 🚀
- [ ] 能够设计复杂的泛型接口
- [ ] 熟练使用条件类型和分布式条件类型
- [ ] 能够编写递归映射类型
- [ ] 熟练使用 infer 关键字

### 高级要求 🎯
- [ ] 能够为第三方库编写类型声明
- [ ] 设计类型安全的 DSL（领域特定语言）
- [ ] 理解 TypeScript 编译器的类型检查机制
- [ ] 能够优化类型系统的性能

## 🛠️ 推荐工具

### 开发工具
- **TypeScript Playground**：在线测试类型系统
- **VS Code 插件**：TypeScript Hero, TypeScript Importer
- **类型可视化**：typescript-type-debugger

### 学习资源
- **TypeScript Handbook**：官方文档的高级部分
- **Type Challenges**：类型系统练习题
- **DefinitelyTyped**：社区类型定义

## 🚀 下一步

完成第二阶段后，你将具备：

- 深入的类型系统理解
- 高级类型编程能力
- 类型安全的代码设计技能
- 为复杂项目提供类型支持的能力

👉 **准备好了吗？让我们开始 [泛型编程](./01-generics.md) 的学习！**

---

> 💡 **提示**：第二阶段的内容相对复杂，建议按顺序学习，每个主题都要多加练习。类型系统是 TypeScript 的核心，掌握它将大大提升你的开发效率和代码质量！ 