# TypeScript 装饰器基础

> 掌握装饰器的核心概念和基本使用，为元编程奠定基础

## 🎯 学习目标

完成本节后，你将掌握：

- 装饰器的概念和工作原理
- 类装饰器、方法装饰器、属性装饰器、参数装饰器的使用
- 装饰器工厂的设计模式
- 装饰器的执行顺序和组合方式
- 反射元数据的基本使用

## 🔧 环境准备

装饰器是 TypeScript 的实验性特性，需要特殊配置：

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```bash
# 安装反射元数据支持
npm install reflect-metadata
```

## 🎭 装饰器概念

装饰器是一种特殊类型的声明，它能够被附加到类声明、方法、访问器、属性或参数上。

### 装饰器基本语法

```typescript
// 基本装饰器语法
@decorator
class MyClass {}

@decorator
method() {}

@decorator
property: string;

method(@decorator param: string) {}
```

### 装饰器的本质

```typescript
// 装饰器实际上是一个函数
function simpleDecorator(target: any) {
    console.log('装饰器被调用了！');
    console.log('目标:', target);
}

@simpleDecorator
class Example {
    name: string = "示例";
}

// 等价于
// simpleDecorator(Example);

console.log("=== 装饰器基本概念示例 ===");
const example = new Example();
console.log("实例:", example);
```

### 装饰器的执行时机

```typescript
function logExecutionTime(phase: string) {
    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        console.log(`${phase} 装饰器执行时间:`, new Date().toISOString());
        console.log(`目标:`, target.constructor?.name || target.name);
        if (propertyKey) console.log(`属性:`, propertyKey);
    };
}

@logExecutionTime('类')
class ExecutionDemo {
    @logExecutionTime('属性')
    prop: string = 'value';
    
    @logExecutionTime('方法')
    method() {
        console.log('方法被调用');
    }
}

console.log("\n=== 装饰器执行时机示例 ===");
console.log("创建实例...");
const demo = new ExecutionDemo();
console.log("调用方法...");
demo.method();
```

## 🏛️ 类装饰器

类装饰器在类声明之前被声明，应用于类构造函数。

### 基本类装饰器

```typescript
// 基本类装饰器
function sealed(constructor: Function) {
    console.log('密封类:', constructor.name);
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class SealedClass {
    name: string = "密封类";
    
    greet() {
        return `Hello from ${this.name}`;
    }
}

// 尝试添加属性（会失败）
try {
    (SealedClass as any).newProp = "new property";
    console.log("添加属性成功:", (SealedClass as any).newProp);
} catch (error) {
    console.log("无法添加属性到密封类");
}

console.log("\n=== 基本类装饰器示例 ===");
const sealed1 = new SealedClass();
console.log(sealed1.greet());
```

### 类装饰器修改构造函数

```typescript
// 修改构造函数的类装饰器
function withTimestamp<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        timestamp = new Date().toISOString();
        
        getInfo() {
            return `${constructor.name} created at ${this.timestamp}`;
        }
    };
}

@withTimestamp
class User {
    constructor(public name: string) {}
    
    getName() {
        return this.name;
    }
}

// 现在 User 类有了额外的功能
const user = new User("张三");
console.log("\n=== 类装饰器修改构造函数示例 ===");
console.log("用户名:", user.getName());
console.log("创建信息:", (user as any).getInfo());
console.log("时间戳:", (user as any).timestamp);
```

### 类装饰器工厂

```typescript
// 类装饰器工厂
function component(config: { selector: string; template: string }) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            selector = config.selector;
            template = config.template;
            
            render() {
                console.log(`Rendering ${this.selector}: ${this.template}`);
                return this.template;
            }
        };
    };
}

@component({
    selector: 'app-header',
    template: '<header>这是头部组件</header>'
})
class HeaderComponent {
    title: string = "头部";
    
    getTitle() {
        return this.title;
    }
}

@component({
    selector: 'app-footer',
    template: '<footer>这是底部组件</footer>'
})
class FooterComponent {
    copyright: string = "© 2024";
}

console.log("\n=== 类装饰器工厂示例 ===");
const header = new HeaderComponent();
console.log("标题:", header.getTitle());
console.log("渲染:", (header as any).render());

const footer = new FooterComponent();
console.log("版权:", footer.copyright);
console.log("渲染:", (footer as any).render());
```

## 🔧 方法装饰器

方法装饰器声明在一个方法的声明之前，可以用来监视、修改或者替换方法定义。

### 基本方法装饰器

```typescript
// 基本方法装饰器
function log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    console.log(`装饰方法: ${target.constructor.name}.${propertyName}`);
    
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        console.log(`调用方法 ${propertyName}，参数:`, args);
        const result = method.apply(this, args);
        console.log(`方法 ${propertyName} 返回:`, result);
        return result;
    };
}

class Calculator {
    @log
    add(a: number, b: number): number {
        return a + b;
    }
    
    @log
    multiply(a: number, b: number): number {
        return a * b;
    }
}

console.log("\n=== 基本方法装饰器示例 ===");
const calc = new Calculator();
console.log("加法结果:", calc.add(5, 3));
console.log("乘法结果:", calc.multiply(4, 6));
```

### 方法装饰器工厂

```typescript
// 方法装饰器工厂
function measure(unit: string = 'ms') {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            const start = performance.now();
            const result = method.apply(this, args);
            const end = performance.now();
            const duration = end - start;
            
            console.log(`方法 ${propertyName} 执行时间: ${duration.toFixed(2)} ${unit}`);
            return result;
        };
    };
}

function cache(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cacheMap = new Map<string, any>();
    
    descriptor.value = function (...args: any[]) {
        const key = JSON.stringify(args);
        
        if (cacheMap.has(key)) {
            console.log(`缓存命中: ${propertyName}(${args.join(', ')})`);
            return cacheMap.get(key);
        }
        
        const result = method.apply(this, args);
        cacheMap.set(key, result);
        console.log(`缓存设置: ${propertyName}(${args.join(', ')}) = ${result}`);
        return result;
    };
}

class MathService {
    @measure('毫秒')
    @cache
    fibonacci(n: number): number {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }
    
    @measure()
    factorial(n: number): number {
        if (n <= 1) return 1;
        return n * this.factorial(n - 1);
    }
}

console.log("\n=== 方法装饰器工厂示例 ===");
const mathService = new MathService();
console.log("斐波那契数列第10项:", mathService.fibonacci(10));
console.log("再次计算斐波那契数列第10项:", mathService.fibonacci(10));
console.log("5的阶乘:", mathService.factorial(5));
```

### 异步方法装饰器

```typescript
// 异步方法装饰器
function retry(maxAttempts: number = 3, delay: number = 1000) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = async function (...args: any[]) {
            let lastError: any;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`尝试第 ${attempt} 次调用 ${propertyName}`);
                    const result = await method.apply(this, args);
                    if (attempt > 1) {
                        console.log(`第 ${attempt} 次尝试成功`);
                    }
                    return result;
                } catch (error) {
                    lastError = error;
                    console.log(`第 ${attempt} 次尝试失败:`, error.message);
                    
                    if (attempt < maxAttempts) {
                        console.log(`等待 ${delay}ms 后重试...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            
            throw new Error(`方法 ${propertyName} 在 ${maxAttempts} 次尝试后仍然失败: ${lastError.message}`);
        };
    };
}

class ApiService {
    private attempts = 0;
    
    @retry(3, 500)
    async fetchData(id: string): Promise<{ id: string; data: string }> {
        this.attempts++;
        
        // 模拟网络请求，前两次失败
        if (this.attempts <= 2) {
            throw new Error('网络连接失败');
        }
        
        return { id, data: `数据 ${id}` };
    }
    
    @retry(2, 200)
    async saveData(data: any): Promise<boolean> {
        // 模拟总是失败的请求
        throw new Error('服务器错误');
    }
}

async function testAsyncDecorators() {
    console.log("\n=== 异步方法装饰器示例 ===");
    const apiService = new ApiService();
    
    try {
        const result = await apiService.fetchData('123');
        console.log('获取数据成功:', result);
    } catch (error) {
        console.error('获取数据失败:', error.message);
    }
    
    try {
        await apiService.saveData({ test: 'data' });
    } catch (error) {
        console.error('保存数据失败:', error.message);
    }
}

// 注意：这里我们调用异步函数但不等待，仅用于演示
testAsyncDecorators();
```

## 🏷️ 属性装饰器

属性装饰器声明在一个属性声明之前，可以用来监视属性的定义。

### 基本属性装饰器

```typescript
// 基本属性装饰器
function readonly(target: any, propertyName: string) {
    console.log(`设置只读属性: ${target.constructor.name}.${propertyName}`);
    
    // 创建属性描述符
    Object.defineProperty(target, propertyName, {
        writable: false,
        configurable: false
    });
}

function format(pattern: string) {
    return function (target: any, propertyName: string) {
        let value: any;
        
        Object.defineProperty(target, propertyName, {
            get() {
                return value;
            },
            set(newValue: any) {
                if (typeof newValue === 'string') {
                    // 简单的格式化示例
                    if (pattern === 'uppercase') {
                        value = newValue.toUpperCase();
                    } else if (pattern === 'lowercase') {
                        value = newValue.toLowerCase();
                    } else {
                        value = newValue;
                    }
                } else {
                    value = newValue;
                }
                console.log(`属性 ${propertyName} 格式化为: ${value}`);
            },
            enumerable: true,
            configurable: true
        });
    };
}

class Person {
    @readonly
    id: number = Math.random();
    
    @format('uppercase')
    name: string = '';
    
    @format('lowercase')
    email: string = '';
    
    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }
}

console.log("\n=== 基本属性装饰器示例 ===");
const person = new Person('张三', 'ZhangSan@Example.Com');
console.log('姓名:', person.name);
console.log('邮箱:', person.email);
console.log('ID:', person.id);

// 尝试修改只读属性
try {
    (person as any).id = 999;
    console.log('修改后的ID:', person.id);
} catch (error) {
    console.log('无法修改只读属性');
}
```

### 属性验证装饰器

```typescript
// 属性验证装饰器
function validate(validator: (value: any) => boolean, errorMessage: string) {
    return function (target: any, propertyName: string) {
        let value: any;
        
        Object.defineProperty(target, propertyName, {
            get() {
                return value;
            },
            set(newValue: any) {
                if (!validator(newValue)) {
                    throw new Error(`${propertyName}: ${errorMessage}`);
                }
                value = newValue;
                console.log(`属性 ${propertyName} 验证通过: ${value}`);
            },
            enumerable: true,
            configurable: true
        });
    };
}

function range(min: number, max: number) {
    return validate(
        (value: number) => typeof value === 'number' && value >= min && value <= max,
        `值必须在 ${min} 到 ${max} 之间`
    );
}

function email(target: any, propertyName: string) {
    return validate(
        (value: string) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        '必须是有效的邮箱格式'
    )(target, propertyName);
}

class UserProfile {
    @validate(
        (value: string) => typeof value === 'string' && value.length >= 2,
        '姓名至少包含2个字符'
    )
    name: string = '';
    
    @range(18, 120)
    age: number = 0;
    
    @email
    email: string = '';
    
    constructor(name: string, age: number, email: string) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}

console.log("\n=== 属性验证装饰器示例 ===");
try {
    const user1 = new UserProfile('李四', 25, 'lisi@example.com');
    console.log('用户创建成功:', user1);
    
    // 尝试设置无效值
    user1.age = 150; // 会抛出错误
} catch (error) {
    console.error('验证失败:', error.message);
}

try {
    const user2 = new UserProfile('王', 25, 'invalid-email');
} catch (error) {
    console.error('用户创建失败:', error.message);
}
```

## 📋 参数装饰器

参数装饰器声明在一个参数声明之前，可以用来监视参数的声明。

### 基本参数装饰器

```typescript
import 'reflect-metadata';

// 参数验证装饰器
function required(target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata('required', target, propertyName) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata('required', existingRequiredParameters, target, propertyName);
}

function validate_params(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        const requiredParameters: number[] = Reflect.getOwnMetadata('required', target, propertyName) || [];
        
        for (const parameterIndex of requiredParameters) {
            if (args[parameterIndex] === undefined || args[parameterIndex] === null) {
                throw new Error(`参数 ${parameterIndex} 是必需的`);
            }
        }
        
        return method.apply(this, args);
    };
}

class OrderService {
    @validate_params
    createOrder(
        @required customerId: string,
        @required productId: string,
        quantity?: number
    ) {
        console.log('创建订单:', { customerId, productId, quantity: quantity || 1 });
        return { id: Math.random().toString(36), customerId, productId, quantity: quantity || 1 };
    }
    
    @validate_params
    updateOrder(
        @required orderId: string,
        updates: any
    ) {
        console.log('更新订单:', orderId, updates);
        return { success: true };
    }
}

console.log("\n=== 参数装饰器示例 ===");
const orderService = new OrderService();

try {
    const order = orderService.createOrder('customer_123', 'product_456', 2);
    console.log('订单创建成功:', order);
    
    orderService.updateOrder('order_789', { quantity: 3 });
} catch (error) {
    console.error('操作失败:', error.message);
}

try {
    // 缺少必需参数
    orderService.createOrder('customer_123', null as any);
} catch (error) {
    console.error('参数验证失败:', error.message);
}
```

### 参数类型验证

```typescript
// 参数类型验证装饰器
function validateType(expectedType: string) {
    return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
        const existingTypes = Reflect.getOwnMetadata('paramTypes', target, propertyName) || {};
        existingTypes[parameterIndex] = expectedType;
        Reflect.defineMetadata('paramTypes', existingTypes, target, propertyName);
    };
}

function validateTypes(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        const paramTypes: { [key: number]: string } = Reflect.getOwnMetadata('paramTypes', target, propertyName) || {};
        
        for (const [index, expectedType] of Object.entries(paramTypes)) {
            const paramIndex = parseInt(index);
            const actualType = typeof args[paramIndex];
            
            if (actualType !== expectedType) {
                throw new Error(`参数 ${paramIndex} 期望类型 ${expectedType}，实际类型 ${actualType}`);
            }
        }
        
        return method.apply(this, args);
    };
}

class DataProcessor {
    @validateTypes
    processNumber(
        @validateType('number') value: number,
        @validateType('string') operation: string
    ): number {
        console.log(`处理数字: ${value}, 操作: ${operation}`);
        
        switch (operation) {
            case 'double':
                return value * 2;
            case 'square':
                return value * value;
            default:
                return value;
        }
    }
    
    @validateTypes
    processString(
        @validateType('string') text: string,
        @validateType('boolean') uppercase: boolean
    ): string {
        console.log(`处理字符串: ${text}, 大写: ${uppercase}`);
        return uppercase ? text.toUpperCase() : text.toLowerCase();
    }
}

console.log("\n=== 参数类型验证示例 ===");
const processor = new DataProcessor();

try {
    console.log('处理结果:', processor.processNumber(10, 'double'));
    console.log('处理结果:', processor.processString('Hello World', true));
    
    // 类型错误
    processor.processNumber('invalid' as any, 'double');
} catch (error) {
    console.error('类型验证失败:', error.message);
}
```

## 🎯 装饰器组合和执行顺序

多个装饰器可以同时应用到同一个声明上。

### 装饰器执行顺序

```typescript
// 多个装饰器的执行顺序
function first() {
    console.log('first(): 工厂函数调用');
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        console.log('first(): 装饰器执行');
    };
}

function second() {
    console.log('second(): 工厂函数调用');
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        console.log('second(): 装饰器执行');
    };
}

function third() {
    console.log('third(): 工厂函数调用');
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        console.log('third(): 装饰器执行');
    };
}

class DecoratorOrder {
    @first()
    @second()
    @third()
    method() {
        console.log('method(): 方法执行');
    }
}

console.log("\n=== 装饰器执行顺序示例 ===");
console.log('类定义完成，开始调用方法:');
const orderDemo = new DecoratorOrder();
orderDemo.method();
```

### 装饰器组合应用

```typescript
// 组合多个功能装饰器
function timer(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        const start = Date.now();
        const result = method.apply(this, args);
        console.log(`${propertyName} 执行时间: ${Date.now() - start}ms`);
        return result;
    };
}

function logger(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        console.log(`调用 ${propertyName}，参数:`, args);
        const result = method.apply(this, args);
        console.log(`${propertyName} 返回:`, result);
        return result;
    };
}

function errorHandler(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        try {
            return method.apply(this, args);
        } catch (error) {
            console.error(`${propertyName} 发生错误:`, error.message);
            throw error;
        }
    };
}

class BusinessService {
    @timer
    @logger
    @errorHandler
    complexOperation(data: any[]): any[] {
        console.log('执行复杂操作...');
        
        // 模拟复杂计算
        const result = data.map(item => {
            if (typeof item !== 'number') {
                throw new Error('数据必须是数字');
            }
            return item * 2 + 1;
        });
        
        // 模拟延迟
        const start = Date.now();
        while (Date.now() - start < 100) {
            // 等待100ms
        }
        
        return result;
    }
}

console.log("\n=== 装饰器组合应用示例 ===");
const service = new BusinessService();

try {
    const result = service.complexOperation([1, 2, 3, 4, 5]);
    console.log('最终结果:', result);
} catch (error) {
    console.error('操作失败');
}

try {
    service.complexOperation([1, 'invalid', 3] as any);
} catch (error) {
    console.error('包含无效数据的操作失败');
}
```

## 📚 实际应用场景

### 简单的依赖注入

```typescript
// 简单的依赖注入实现
class Container {
    private static services = new Map<string, any>();
    
    static register<T>(token: string, service: T): void {
        this.services.set(token, service);
    }
    
    static get<T>(token: string): T {
        const service = this.services.get(token);
        if (!service) {
            throw new Error(`服务 ${token} 未注册`);
        }
        return service;
    }
}

function injectable(token: string) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        Container.register(token, new constructor());
        return constructor;
    };
}

function inject(token: string) {
    return function (target: any, propertyName: string) {
        Object.defineProperty(target, propertyName, {
            get() {
                return Container.get(token);
            },
            enumerable: true,
            configurable: true
        });
    };
}

// 服务定义
@injectable('logger')
class LoggerService {
    log(message: string) {
        console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
    }
}

@injectable('database')
class DatabaseService {
    query(sql: string) {
        console.log(`执行查询: ${sql}`);
        return { rows: [], count: 0 };
    }
}

// 使用依赖注入
class UserController {
    @inject('logger')
    private logger!: LoggerService;
    
    @inject('database')
    private db!: DatabaseService;
    
    getUsers() {
        this.logger.log('获取用户列表');
        return this.db.query('SELECT * FROM users');
    }
    
    createUser(userData: any) {
        this.logger.log('创建新用户');
        return this.db.query(`INSERT INTO users VALUES (${JSON.stringify(userData)})`);
    }
}

console.log("\n=== 依赖注入示例 ===");
const userController = new UserController();
userController.getUsers();
userController.createUser({ name: '张三', email: 'zhangsan@example.com' });
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：创建一个 @debounce 装饰器
// 要求：防止方法在短时间内重复调用

// 练习 2：创建一个 @memoize 装饰器
// 要求：缓存方法的计算结果

// 练习 3：创建一个 @deprecated 装饰器
// 要求：标记已弃用的方法，调用时显示警告

// 练习 4：创建一个 @authorize 装饰器
// 要求：检查用户权限后才能执行方法
```

### 高级练习

```typescript
// 练习 5：创建一个数据验证装饰器系统
// 要求：支持嵌套对象验证、自定义验证规则

// 练习 6：创建一个事务装饰器
// 要求：自动处理数据库事务的开始、提交、回滚

// 练习 7：创建一个性能监控装饰器
// 要求：收集方法执行统计信息，支持报告生成
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **装饰器概念**：理解装饰器的本质和执行机制
- ✅ **类装饰器**：修改和扩展类的功能
- ✅ **方法装饰器**：拦截和增强方法调用
- ✅ **属性装饰器**：控制属性的行为和验证
- ✅ **参数装饰器**：验证和处理方法参数
- ✅ **装饰器组合**：多个装饰器的协同工作
- ✅ **实际应用**：依赖注入、验证、日志等场景

## 🚀 下一步

现在你已经掌握了装饰器的基础知识，让我们继续学习装饰器的高级应用！

👉 **下一步：[装饰器应用](./02-decorator-applications.md)**

---

> 💡 **记住**：装饰器是 TypeScript 的强大特性，但要谨慎使用。过度使用装饰器可能会使代码难以理解和调试。始终保持代码的简洁性和可读性！ 