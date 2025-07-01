# TypeScript 命名空间与组织

> 理解命名空间的使用场景，掌握大型项目的代码组织策略

## 🎯 学习目标

完成本节后，你将掌握：
- 命名空间的概念和使用场景
- 模块 vs 命名空间的选择策略
- 大型项目的代码组织最佳实践
- 全局类型声明和环境模块

## 📁 命名空间基础

### 基础语法

```typescript
// 基础命名空间
namespace Utils {
    export function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
    
    export class DateHelper {
        static addDays(date: Date, days: number): Date {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }
    }
    
    // 私有函数，不导出
    function validateDate(date: Date): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }
}

// 使用命名空间
const today = new Date();
const formatted = Utils.formatDate(today);
const tomorrow = Utils.DateHelper.addDays(today, 1);

console.log('今天:', formatted);
console.log('明天:', Utils.formatDate(tomorrow));
```

### 嵌套命名空间

```typescript
// 嵌套结构示例
namespace Company {
    export namespace HR {
        export interface Employee {
            id: number;
            name: string;
            department: string;
        }
        
        export class EmployeeManager {
            private employees: Employee[] = [];
            
            addEmployee(employee: Employee): void {
                this.employees.push(employee);
            }
            
            getEmployee(id: number): Employee | undefined {
                return this.employees.find(emp => emp.id === id);
            }
        }
        
        export namespace Payroll {
            export function calculateSalary(employee: Employee, days: number): number {
                return (employee as any).salary / 30 * days;
            }
        }
    }
    
    export namespace Finance {
        export interface Budget {
            department: string;
            allocated: number;
            spent: number;
        }
        
        export class BudgetManager {
            private budgets: Budget[] = [];
            
            setBudget(department: string, amount: number): void {
                const existing = this.budgets.find(b => b.department === department);
                if (existing) {
                    existing.allocated = amount;
                } else {
                    this.budgets.push({ department, allocated: amount, spent: 0 });
                }
            }
        }
    }
}

// 使用示例
const empManager = new Company.HR.EmployeeManager();
const budgetManager = new Company.Finance.BudgetManager();

empManager.addEmployee({ id: 1, name: '张三', department: '开发部' });
budgetManager.setBudget('开发部', 100000);
```

## 🔀 模块 vs 命名空间

### 现代推荐：使用模块

```typescript
// ✅ 推荐：ES6 模块
// math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
    return a + b;
}

export class Calculator {
    add = add;
    
    multiply(a: number, b: number): number {
        return a * b;
    }
}

// app.ts
import { PI, add, Calculator } from './math';
const result = add(1, 2);
```

### 命名空间的合适场景

```typescript
// ✅ 适合用命名空间的场景

// 1. 全局工具函数
namespace AppUtils {
    export namespace Validation {
        export function isEmail(email: string): boolean {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        
        export function isPhone(phone: string): boolean {
            return /^1[3-9]\d{9}$/.test(phone);
        }
    }
    
    export namespace Format {
        export function currency(amount: number): string {
            return `¥${amount.toFixed(2)}`;
        }
        
        export function percentage(value: number): string {
            return `${(value * 100).toFixed(1)}%`;
        }
    }
}

// 2. 类型组织
namespace API {
    export interface Response<T> {
        data: T;
        success: boolean;
        message: string;
    }
    
    export namespace User {
        export interface Info {
            id: number;
            username: string;
            email: string;
        }
        
        export interface CreateRequest {
            username: string;
            email: string;
            password: string;
        }
        
        export interface UpdateRequest {
            username?: string;
            email?: string;
        }
    }
    
    export namespace Product {
        export interface Info {
            id: number;
            name: string;
            price: number;
        }
        
        export interface CreateRequest {
            name: string;
            price: number;
            description: string;
        }
    }
}

// 使用示例
console.log('邮箱验证:', AppUtils.Validation.isEmail('test@example.com'));
console.log('金额格式:', AppUtils.Format.currency(123.45));

type UserInfo = API.User.Info;
type ApiResponse<T> = API.Response<T>;

const userResponse: ApiResponse<UserInfo> = {
    data: { id: 1, username: 'test', email: 'test@example.com' },
    success: true,
    message: 'Success'
};
```

## 🌐 全局类型声明

### 环境模块声明

```typescript
// global.d.ts - 全局类型声明文件
declare global {
    // 扩展 Window 接口
    interface Window {
        APP_CONFIG?: {
            apiUrl: string;
            version: string;
            environment: 'development' | 'production';
        };
        
        gtag?: (...args: any[]) => void;
    }
    
    // 扩展 NodeJS
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            API_URL?: string;
            PORT?: string;
        }
    }
    
    // 全局类型
    type Environment = 'development' | 'staging' | 'production';
    type LogLevel = 'debug' | 'info' | 'warn' | 'error';
    
    interface AppConfig {
        environment: Environment;
        apiUrl: string;
        logLevel: LogLevel;
    }
}

// 第三方库类型声明
declare module 'custom-library' {
    export interface Options {
        apiKey: string;
        endpoint?: string;
    }
    
    export class CustomLibrary {
        constructor(options: Options);
        init(): Promise<void>;
        send(data: any): Promise<any>;
    }
    
    export default CustomLibrary;
}

// CSS 模块声明
declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.png' {
    const src: string;
    export default src;
}

export {}; // 确保这是一个模块
```

### 模块扩展

```typescript
// 扩展已有模块
declare module 'express' {
    interface Request {
        user?: {
            id: string;
            roles: string[];
        };
        requestId?: string;
    }
}

// 扩展全局对象
declare global {
    interface Array<T> {
        chunk(size: number): T[][];
        unique(): T[];
    }
    
    interface String {
        toCamelCase(): string;
        toSnakeCase(): string;
    }
}

// 实现扩展方法
if (!Array.prototype.chunk) {
    Array.prototype.chunk = function<T>(this: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < this.length; i += size) {
            result.push(this.slice(i, i + size));
        }
        return result;
    };
}

if (!String.prototype.toCamelCase) {
    String.prototype.toCamelCase = function(this: string): string {
        return this.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    };
}

// 使用扩展方法
const numbers = [1, 2, 3, 4, 5, 6];
console.log('分块:', numbers.chunk(3)); // [[1,2,3], [4,5,6]]
console.log('驼峰:', 'hello-world'.toCamelCase()); // helloWorld
```

## 🏗️ 大型项目组织

### 分层架构

```typescript
// 项目架构示例
namespace App {
    // 类型层
    export namespace Types {
        export interface Entity {
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }
        
        export interface User extends Entity {
            username: string;
            email: string;
        }
        
        export interface Product extends Entity {
            name: string;
            price: number;
        }
    }
    
    // 核心层
    export namespace Core {
        export class EventBus {
            private listeners = new Map<string, Set<Function>>();
            
            on(event: string, callback: Function): () => void {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, new Set());
                }
                this.listeners.get(event)!.add(callback);
                
                return () => this.listeners.get(event)?.delete(callback);
            }
            
            emit(event: string, data: any): void {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    callbacks.forEach(callback => callback(data));
                }
            }
        }
        
        export interface Repository<T> {
            findById(id: string): Promise<T | null>;
            create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
        }
    }
    
    // 服务层
    export namespace Services {
        export class UserService {
            constructor(
                private userRepo: Core.Repository<Types.User>,
                private eventBus: Core.EventBus
            ) {}
            
            async createUser(userData: { username: string; email: string }): Promise<Types.User> {
                const user = await this.userRepo.create(userData);
                this.eventBus.emit('user:created', user);
                return user;
            }
        }
    }
}

// 使用
const eventBus = new App.Core.EventBus();
eventBus.on('user:created', (user: App.Types.User) => {
    console.log('新用户创建:', user.username);
});
```

## 📝 最佳实践

### 选择指南

```typescript
// ✅ 使用命名空间的场景
namespace Good {
    // 1. 全局工具函数集合
    export namespace Utils {
        export function debounce(fn: Function, ms: number): Function {
            let timeout: NodeJS.Timeout;
            return function(...args: any[]) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), ms);
            };
        }
    }
    
    // 2. 类型分组组织
    export namespace API {
        export interface BaseResponse {
            success: boolean;
            message: string;
        }
    }
}

// ❌ 避免用命名空间的场景
// 不要用命名空间代替模块化
// 应该用 export/import

// ✅ 命名约定
namespace MyApp {           // 使用 PascalCase
    export namespace Utils { // 嵌套也用 PascalCase
        export function helper() {} // 函数用 camelCase
    }
}
```

### 组织原则

1. **避免过深嵌套** - 最多 3 层
2. **明确职责分离** - 每个命名空间有清晰的职责
3. **合理导出** - 只导出需要的接口
4. **文档说明** - 为复杂的命名空间添加注释

## 📝 练习题

### 基础练习
1. 创建一个数学工具命名空间，包含基本运算和高级函数
2. 设计一个日期时间处理的命名空间
3. 编写一个验证工具的命名空间

### 高级练习
1. 为一个电商系统设计完整的命名空间架构
2. 实现一个游戏引擎的核心命名空间
3. 创建第三方API的类型声明文件

## 🚀 小结

通过本节学习，你掌握了：
- ✅ **命名空间语法**：基础语法和嵌套结构
- ✅ **使用场景**：何时选择命名空间而非模块
- ✅ **全局声明**：类型声明和模块扩展
- ✅ **项目组织**：大型应用的架构设计

## 🚀 下一步

👉 **下一步：[异步编程](./05-async-programming.md)**

---
> 💡 **记住**：现代开发中优先使用 ES6 模块！命名空间主要用于全局类型组织、工具函数集合和特定的兼容场景。 