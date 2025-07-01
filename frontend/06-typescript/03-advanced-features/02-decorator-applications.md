# TypeScript 装饰器应用

> 深入装饰器的实际应用场景，构建企业级框架和工具

## 🎯 学习目标

完成本节后，你将掌握：

- 依赖注入系统的设计和实现
- AOP（面向切面编程）的应用
- 数据验证和序列化装饰器
- 路由和控制器装饰器系统
- 元数据和反射的高级应用

## 🏗️ 依赖注入系统

依赖注入是现代框架的核心特性，装饰器为其提供了优雅的实现方式。

### 基础依赖注入容器

```typescript
import 'reflect-metadata';

// 依赖注入容器
class Container {
    private static services = new Map<string, any>();
    private static singletons = new Map<string, any>();
    
    static register<T>(token: string, implementation: new (...args: any[]) => T, singleton: boolean = true): void {
        this.services.set(token, { implementation, singleton });
    }
    
    static get<T>(token: string): T {
        const service = this.services.get(token);
        if (!service) {
            throw new Error(`服务 ${token} 未注册`);
        }
        
        if (service.singleton) {
            if (!this.singletons.has(token)) {
                const dependencies = this.resolveDependencies(service.implementation);
                const instance = new service.implementation(...dependencies);
                this.singletons.set(token, instance);
            }
            return this.singletons.get(token);
        } else {
            const dependencies = this.resolveDependencies(service.implementation);
            return new service.implementation(...dependencies);
        }
    }
    
    private static resolveDependencies(target: any): any[] {
        const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
        const injectionTokens = Reflect.getMetadata('injection-tokens', target) || {};
        
        return paramTypes.map((type: any, index: number) => {
            const token = injectionTokens[index];
            if (token) {
                return this.get(token);
            }
            
            // 尝试通过类型名获取服务
            const typeName = type.name;
            if (this.services.has(typeName)) {
                return this.get(typeName);
            }
            
            throw new Error(`无法解析依赖: ${typeName} at index ${index}`);
        });
    }
}

// 注册服务装饰器
function Injectable(token?: string) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        const serviceToken = token || constructor.name;
        Container.register(serviceToken, constructor);
        return constructor;
    };
}

// 注入依赖装饰器
function Inject(token: string) {
    return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
        const existingTokens = Reflect.getMetadata('injection-tokens', target) || {};
        existingTokens[parameterIndex] = token;
        Reflect.defineMetadata('injection-tokens', existingTokens, target);
    };
}

// 属性注入装饰器
function InjectProperty(token: string) {
    return function (target: any, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            get() {
                return Container.get(token);
            },
            enumerable: true,
            configurable: true
        });
    };
}

console.log("=== 依赖注入系统示例 ===");
```

### 实际应用示例

```typescript
// 定义服务接口
interface ILogger {
    log(message: string): void;
    error(message: string): void;
}

interface IDatabase {
    query(sql: string): Promise<any[]>;
    save(entity: any): Promise<any>;
}

interface IEmailService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

// 实现具体服务
@Injectable('ILogger')
class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
    }
    
    error(message: string): void {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    }
}

@Injectable('IDatabase')
class MockDatabase implements IDatabase {
    private data: any[] = [];
    
    async query(sql: string): Promise<any[]> {
        console.log(`执行查询: ${sql}`);
        return this.data;
    }
    
    async save(entity: any): Promise<any> {
        console.log(`保存实体:`, entity);
        const saved = { ...entity, id: Math.random() };
        this.data.push(saved);
        return saved;
    }
}

@Injectable('IEmailService')
class EmailService implements IEmailService {
    constructor(@Inject('ILogger') private logger: ILogger) {}
    
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        this.logger.log(`发送邮件到 ${to}: ${subject}`);
        // 模拟发送邮件
        return true;
    }
}

// 业务服务
@Injectable()
class UserService {
    constructor(
        @Inject('ILogger') private logger: ILogger,
        @Inject('IDatabase') private database: IDatabase,
        @Inject('IEmailService') private emailService: IEmailService
    ) {}
    
    async createUser(userData: { name: string; email: string }): Promise<any> {
        this.logger.log(`创建用户: ${userData.name}`);
        
        try {
            const user = await this.database.save(userData);
            
            await this.emailService.sendEmail(
                userData.email,
                '欢迎注册',
                `欢迎您，${userData.name}！`
            );
            
            this.logger.log(`用户创建成功: ${user.id}`);
            return user;
        } catch (error) {
            this.logger.error(`用户创建失败: ${error.message}`);
            throw error;
        }
    }
    
    async getUsers(): Promise<any[]> {
        this.logger.log('获取用户列表');
        return this.database.query('SELECT * FROM users');
    }
}

// 控制器
class UserController {
    @InjectProperty('UserService')
    private userService!: UserService;
    
    async handleCreateUser(req: any): Promise<any> {
        const userData = req.body;
        return this.userService.createUser(userData);
    }
    
    async handleGetUsers(): Promise<any[]> {
        return this.userService.getUsers();
    }
}

// 使用示例
async function testDependencyInjection() {
    console.log("\n=== 依赖注入实际应用示例 ===");
    
    const userController = new UserController();
    
    // 创建用户
    const newUser = await userController.handleCreateUser({
        body: { name: '张三', email: 'zhangsan@example.com' }
    });
    console.log('新用户:', newUser);
    
    // 获取用户列表
    const users = await userController.handleGetUsers();
    console.log('用户列表:', users);
}

testDependencyInjection();
```

## 🎯 AOP（面向切面编程）

AOP 允许我们将横切关注点从业务逻辑中分离出来。

### 切面装饰器实现

```typescript
// AOP 核心类型
interface JoinPoint {
    target: any;
    method: string;
    args: any[];
    proceed(): any;
}

type Advice = (joinPoint: JoinPoint) => any;

// 切面管理器
class AspectManager {
    private static aspects = new Map<string, Advice[]>();
    
    static addAspect(pointcut: string, advice: Advice): void {
        if (!this.aspects.has(pointcut)) {
            this.aspects.set(pointcut, []);
        }
        this.aspects.get(pointcut)!.push(advice);
    }
    
    static getAspects(pointcut: string): Advice[] {
        return this.aspects.get(pointcut) || [];
    }
}

// 前置通知装饰器
function Before(advice: (joinPoint: JoinPoint) => void) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            const joinPoint: JoinPoint = {
                target: this,
                method: propertyName,
                args,
                proceed: () => method.apply(this, args)
            };
            
            advice(joinPoint);
            return joinPoint.proceed();
        };
    };
}

// 后置通知装饰器
function After(advice: (joinPoint: JoinPoint, result: any) => void) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            const joinPoint: JoinPoint = {
                target: this,
                method: propertyName,
                args,
                proceed: () => method.apply(this, args)
            };
            
            const result = joinPoint.proceed();
            advice(joinPoint, result);
            return result;
        };
    };
}

// 环绕通知装饰器
function Around(advice: (joinPoint: JoinPoint) => any) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            const joinPoint: JoinPoint = {
                target: this,
                method: propertyName,
                args,
                proceed: () => method.apply(this, args)
            };
            
            return advice(joinPoint);
        };
    };
}

// 异常通知装饰器
function AfterThrowing(advice: (joinPoint: JoinPoint, error: any) => void) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            const joinPoint: JoinPoint = {
                target: this,
                method: propertyName,
                args,
                proceed: () => method.apply(this, args)
            };
            
            try {
                return joinPoint.proceed();
            } catch (error) {
                advice(joinPoint, error);
                throw error;
            }
        };
    };
}

// 使用示例
class PaymentService {
    @Before((jp) => console.log(`开始执行支付: ${jp.args[0]}`))
    @After((jp, result) => console.log(`支付完成，结果: ${result.success}`))
    @AfterThrowing((jp, error) => console.log(`支付失败: ${error.message}`))
    processPayment(amount: number, paymentMethod: string): { success: boolean; transactionId?: string } {
        console.log(`处理支付: ${amount} 元，支付方式: ${paymentMethod}`);
        
        if (amount <= 0) {
            throw new Error('支付金额必须大于0');
        }
        
        if (paymentMethod === 'invalid') {
            throw new Error('无效的支付方式');
        }
        
        return {
            success: true,
            transactionId: Math.random().toString(36)
        };
    }
    
    @Around((jp) => {
        const start = Date.now();
        console.log(`开始执行 ${jp.method}`);
        
        try {
            const result = jp.proceed();
            const duration = Date.now() - start;
            console.log(`${jp.method} 执行成功，耗时: ${duration}ms`);
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            console.log(`${jp.method} 执行失败，耗时: ${duration}ms`);
            throw error;
        }
    })
    refundPayment(transactionId: string): boolean {
        console.log(`处理退款: ${transactionId}`);
        return true;
    }
}

console.log("\n=== AOP 面向切面编程示例 ===");
const paymentService = new PaymentService();

// 成功支付
const result1 = paymentService.processPayment(100, 'credit_card');
console.log('支付结果:', result1);

// 退款
const refundResult = paymentService.refundPayment('txn_123');
console.log('退款结果:', refundResult);

// 失败支付
try {
    paymentService.processPayment(-50, 'credit_card');
} catch (error) {
    console.log('捕获到支付异常');
}
```

## 📋 数据验证和序列化

装饰器为数据验证和序列化提供了声明式的解决方案。

### 验证装饰器系统

```typescript
// 验证规则接口
interface ValidationRule {
    validate(value: any, target: any): string | null;
}

// 验证器注册表
class ValidatorRegistry {
    private static rules = new Map<string, ValidationRule[]>();
    
    static addRule(target: string, property: string, rule: ValidationRule): void {
        const key = `${target}.${property}`;
        if (!this.rules.has(key)) {
            this.rules.set(key, []);
        }
        this.rules.get(key)!.push(rule);
    }
    
    static validate(target: any, property: string, value: any): string[] {
        const key = `${target.constructor.name}.${property}`;
        const rules = this.rules.get(key) || [];
        
        const errors: string[] = [];
        for (const rule of rules) {
            const error = rule.validate(value, target);
            if (error) {
                errors.push(error);
            }
        }
        
        return errors;
    }
    
    static validateObject(obj: any): { [key: string]: string[] } {
        const errors: { [key: string]: string[] } = {};
        
        for (const property of Object.keys(obj)) {
            const propertyErrors = this.validate(obj, property, obj[property]);
            if (propertyErrors.length > 0) {
                errors[property] = propertyErrors;
            }
        }
        
        return errors;
    }
}

// 基础验证装饰器
function Required(message?: string) {
    return function (target: any, propertyKey: string) {
        ValidatorRegistry.addRule(target.constructor.name, propertyKey, {
            validate: (value: any) => {
                if (value === null || value === undefined || value === '') {
                    return message || `${propertyKey} 是必需的`;
                }
                return null;
            }
        });
    };
}

function Length(min: number, max?: number, message?: string) {
    return function (target: any, propertyKey: string) {
        ValidatorRegistry.addRule(target.constructor.name, propertyKey, {
            validate: (value: any) => {
                if (typeof value !== 'string') return null;
                
                if (value.length < min) {
                    return message || `${propertyKey} 长度不能少于 ${min} 个字符`;
                }
                
                if (max && value.length > max) {
                    return message || `${propertyKey} 长度不能超过 ${max} 个字符`;
                }
                
                return null;
            }
        });
    };
}

function Email(message?: string) {
    return function (target: any, propertyKey: string) {
        ValidatorRegistry.addRule(target.constructor.name, propertyKey, {
            validate: (value: any) => {
                if (typeof value !== 'string') return null;
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return message || `${propertyKey} 必须是有效的邮箱地址`;
                }
                
                return null;
            }
        });
    };
}

function Range(min: number, max: number, message?: string) {
    return function (target: any, propertyKey: string) {
        ValidatorRegistry.addRule(target.constructor.name, propertyKey, {
            validate: (value: any) => {
                if (typeof value !== 'number') return null;
                
                if (value < min || value > max) {
                    return message || `${propertyKey} 必须在 ${min} 到 ${max} 之间`;
                }
                
                return null;
            }
        });
    };
}

// 自定义验证装饰器
function CustomValidation(validator: (value: any, target: any) => string | null) {
    return function (target: any, propertyKey: string) {
        ValidatorRegistry.addRule(target.constructor.name, propertyKey, {
            validate: validator
        });
    };
}

// 验证实体类
class CreateUserDto {
    @Required('用户名不能为空')
    @Length(2, 50, '用户名长度必须在2-50个字符之间')
    name: string = '';
    
    @Required('邮箱不能为空')
    @Email('请输入有效的邮箱地址')
    email: string = '';
    
    @Required('年龄不能为空')
    @Range(18, 120, '年龄必须在18-120岁之间')
    age: number = 0;
    
    @Length(0, 500, '简介不能超过500个字符')
    bio?: string;
    
    @CustomValidation((value, target) => {
        if (value && value === (target as CreateUserDto).email.split('@')[0]) {
            return '密码不能与邮箱用户名相同';
        }
        return null;
    })
    password: string = '';
}

// 验证函数
function validateDto<T>(dto: T): { isValid: boolean; errors: { [key: string]: string[] } } {
    const errors = ValidatorRegistry.validateObject(dto);
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

console.log("\n=== 数据验证装饰器示例 ===");

// 测试验证
const validUser = new CreateUserDto();
validUser.name = '张三';
validUser.email = 'zhangsan@example.com';
validUser.age = 25;
validUser.password = 'securePassword123';

const validResult = validateDto(validUser);
console.log('有效用户验证结果:', validResult);

const invalidUser = new CreateUserDto();
invalidUser.name = 'A'; // 太短
invalidUser.email = 'invalid-email'; // 无效邮箱
invalidUser.age = 15; // 年龄太小
invalidUser.password = 'invalid-email'; // 与邮箱用户名相同

const invalidResult = validateDto(invalidUser);
console.log('无效用户验证结果:', invalidResult);
```

### 序列化装饰器

```typescript
// 序列化元数据
interface SerializationOptions {
    name?: string;
    ignore?: boolean;
    transform?: (value: any) => any;
    type?: new (...args: any[]) => any;
}

// 序列化注册表
class SerializationRegistry {
    private static metadata = new Map<string, Map<string, SerializationOptions>>();
    
    static setPropertyMetadata(target: string, property: string, options: SerializationOptions): void {
        if (!this.metadata.has(target)) {
            this.metadata.set(target, new Map());
        }
        this.metadata.get(target)!.set(property, options);
    }
    
    static getPropertyMetadata(target: string, property: string): SerializationOptions | undefined {
        return this.metadata.get(target)?.get(property);
    }
    
    static getAllProperties(target: string): Map<string, SerializationOptions> {
        return this.metadata.get(target) || new Map();
    }
}

// 序列化装饰器
function Serialize(options: SerializationOptions = {}) {
    return function (target: any, propertyKey: string) {
        SerializationRegistry.setPropertyMetadata(
            target.constructor.name,
            propertyKey,
            options
        );
    };
}

function Ignore() {
    return Serialize({ ignore: true });
}

function Transform(transformer: (value: any) => any) {
    return Serialize({ transform: transformer });
}

function SerializeName(name: string) {
    return Serialize({ name });
}

function Type(type: new (...args: any[]) => any) {
    return Serialize({ type });
}

// 序列化器
class Serializer {
    static serialize(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.serialize(item));
        }
        
        if (typeof obj !== 'object') {
            return obj;
        }
        
        const result: any = {};
        const className = obj.constructor.name;
        const properties = SerializationRegistry.getAllProperties(className);
        
        for (const [property, value] of Object.entries(obj)) {
            const metadata = properties.get(property);
            
            if (metadata?.ignore) {
                continue;
            }
            
            const serializedKey = metadata?.name || property;
            let serializedValue = value;
            
            if (metadata?.transform) {
                serializedValue = metadata.transform(value);
            } else {
                serializedValue = this.serialize(value);
            }
            
            result[serializedKey] = serializedValue;
        }
        
        return result;
    }
    
    static deserialize<T>(data: any, targetClass: new (...args: any[]) => T): T {
        if (data === null || data === undefined) {
            return data;
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.deserialize(item, targetClass)) as any;
        }
        
        const instance = new targetClass();
        const className = targetClass.name;
        const properties = SerializationRegistry.getAllProperties(className);
        
        for (const [property, metadata] of properties) {
            if (metadata.ignore) {
                continue;
            }
            
            const dataKey = metadata.name || property;
            let value = data[dataKey];
            
            if (value !== undefined) {
                if (metadata.type) {
                    value = this.deserialize(value, metadata.type);
                } else if (metadata.transform) {
                    // 反序列化时可能需要反向转换
                    value = metadata.transform(value);
                }
                
                (instance as any)[property] = value;
            }
        }
        
        return instance;
    }
}

// 嵌套对象示例
class Address {
    @Serialize()
    street: string = '';
    
    @Serialize()
    city: string = '';
    
    @SerializeName('zip_code')
    zipCode: string = '';
    
    constructor(street?: string, city?: string, zipCode?: string) {
        if (street) this.street = street;
        if (city) this.city = city;
        if (zipCode) this.zipCode = zipCode;
    }
}

class User {
    @Serialize()
    id: number = 0;
    
    @Serialize()
    name: string = '';
    
    @SerializeName('email_address')
    email: string = '';
    
    @Transform((date: Date) => date.toISOString())
    @SerializeName('created_at')
    createdAt: Date = new Date();
    
    @Type(Address)
    address?: Address;
    
    @Ignore()
    password: string = '';
    
    @Ignore()
    private internalData: any = {};
    
    constructor(data?: Partial<User>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

console.log("\n=== 序列化装饰器示例 ===");

// 创建用户对象
const user = new User({
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    password: 'secret123',
    address: new Address('朝阳路123号', '北京', '100000')
});

// 序列化
const serialized = Serializer.serialize(user);
console.log('序列化结果:', JSON.stringify(serialized, null, 2));

// 反序列化
const deserialized = Serializer.deserialize(serialized, User);
console.log('反序列化结果:', deserialized);
console.log('地址信息:', deserialized.address);
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：实现一个缓存装饰器
// 要求：支持TTL（生存时间）和不同的缓存策略

// 练习 2：创建一个权限验证装饰器
// 要求：支持角色权限和操作权限检查

// 练习 3：实现一个事务装饰器
// 要求：自动管理数据库事务的开始、提交和回滚

// 练习 4：创建一个API限流装饰器
// 要求：支持基于用户和基于IP的限流策略
```

### 高级练习

```typescript
// 练习 5：实现一个完整的ORM装饰器系统
// 要求：支持实体映射、关系定义、查询构建

// 练习 6：创建一个微服务通信装饰器
// 要求：支持服务发现、负载均衡、熔断机制

// 练习 7：实现一个完整的Web框架
// 要求：路由、中间件、依赖注入、数据验证等功能
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **依赖注入**：企业级的IoC容器实现
- ✅ **AOP编程**：横切关注点的优雅处理
- ✅ **数据验证**：声明式的验证系统
- ✅ **序列化机制**：灵活的对象转换
- ✅ **元数据应用**：反射和元编程技术
- ✅ **架构模式**：可扩展的装饰器架构

## 🚀 下一步

现在你已经掌握了装饰器的高级应用，让我们继续学习模块系统！

👉 **下一步：[模块系统](./03-module-systems.md)**

---

> 💡 **记住**：装饰器是强大的元编程工具，但要谨慎使用。良好的装饰器设计应该易于理解、易于测试，并且不会过度耦合业务逻辑。始终保持代码的简洁性和可维护性！ 