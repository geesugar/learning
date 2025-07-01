/**
 * TypeScript 接口示例
 * 
 * 本文件演示了 TypeScript 中接口的各种用法：
 * - 基本接口定义和使用
 * - 可选属性和只读属性
 * - 接口继承和组合
 * - 函数接口和索引签名
 * - 泛型接口和高级模式
 */

// =============================================================================
// 1. 基本接口定义
// =============================================================================

// 用户接口
interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// 产品接口
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    tags: string[];
    images: string[];
}

// 订单接口
interface Order {
    id: string;
    userId: number;
    products: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    shippingAddress: Address;
    orderDate: Date;
}

// 地址接口
interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

// 使用接口
const user: User = {
    id: 1,
    username: "zhangsan",
    email: "zhangsan@example.com",
    firstName: "三",
    lastName: "张",
    age: 28,
    isActive: true,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date()
};

const product: Product = {
    id: "prod-001",
    name: "MacBook Pro",
    description: "高性能笔记本电脑",
    price: 1999.99,
    category: "electronics",
    inStock: true,
    tags: ["laptop", "apple", "professional"],
    images: ["image1.jpg", "image2.jpg"]
};

console.log("=== 基本接口示例 ===");
console.log("用户信息:", user);
console.log("产品信息:", product);

// =============================================================================
// 2. 可选属性和只读属性
// =============================================================================

// 配置接口（包含可选属性）
interface AppConfig {
    readonly appName: string;        // 只读属性
    readonly version: string;        // 只读属性
    debug?: boolean;                 // 可选属性
    maxUsers?: number;              // 可选属性
    features?: {
        enableNotifications?: boolean;
        enableAnalytics?: boolean;
        enableBackup?: boolean;
    };
    database: {
        readonly host: string;       // 只读属性
        readonly port: number;       // 只读属性
        username: string;
        password: string;
    };
}

// 用户配置文件接口
interface UserProfile {
    readonly userId: number;
    displayName: string;
    avatar?: string;                // 可选
    bio?: string;                   // 可选
    preferences: {
        theme: "light" | "dark";
        language: string;
        notifications?: {           // 可选对象
            email?: boolean;
            push?: boolean;
            sms?: boolean;
        };
    };
    socialLinks?: {                 // 可选对象
        twitter?: string;
        linkedin?: string;
        github?: string;
        website?: string;
    };
}

// 使用可选属性和只读属性
const appConfig: AppConfig = {
    appName: "我的应用",
    version: "1.0.0",
    debug: true,
    maxUsers: 1000,
    features: {
        enableNotifications: true,
        enableAnalytics: false
    },
    database: {
        host: "localhost",
        port: 5432,
        username: "admin",
        password: "secret"
    }
};

const userProfile: UserProfile = {
    userId: 123,
    displayName: "张三",
    avatar: "avatar.jpg",
    preferences: {
        theme: "dark",
        language: "zh-CN",
        notifications: {
            email: true,
            push: true
        }
    },
    socialLinks: {
        github: "https://github.com/zhangsan",
        website: "https://zhangsan.dev"
    }
};

console.log("\n=== 可选属性和只读属性示例 ===");
console.log("应用配置:", appConfig);
console.log("用户配置:", userProfile);

// appConfig.appName = "新名称";  // 错误：只读属性不能修改
// appConfig.version = "2.0.0";   // 错误：只读属性不能修改
appConfig.debug = false;          // 正确：可以修改非只读属性

// =============================================================================
// 3. 函数接口
// =============================================================================

// 基本函数接口
interface Calculator {
    (a: number, b: number): number;
}

// 搜索函数接口
interface SearchFunction {
    (query: string, options?: {
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }): Promise<any[]>;
}

// 事件处理器接口
interface EventHandler<T = any> {
    (event: T): void;
}

// 验证器接口
interface Validator<T> {
    (value: T): {
        isValid: boolean;
        errors: string[];
    };
}

// 实现函数接口
const add: Calculator = (a, b) => a + b;
const multiply: Calculator = (a, b) => a * b;

const searchUsers: SearchFunction = async (query, options = {}) => {
    // 模拟搜索实现
    console.log(`搜索用户: ${query}`, options);
    return [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
    ];
};

const handleClick: EventHandler<MouseEvent> = (event) => {
    console.log("点击事件:", event.type);
};

const validateEmail: Validator<string> = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
        isValid,
        errors: isValid ? [] : ["无效的邮箱格式"]
    };
};

console.log("\n=== 函数接口示例 ===");
console.log("加法计算:", add(10, 5));
console.log("乘法计算:", multiply(4, 3));

searchUsers("张", { limit: 10, sortBy: "name" });

const emailValidation = validateEmail("test@example.com");
console.log("邮箱验证:", emailValidation);

// =============================================================================
// 4. 索引签名
// =============================================================================

// 字符串索引签名
interface StringDictionary {
    [key: string]: string;
}

// 数字索引签名
interface NumberArray {
    [index: number]: number;
}

// 混合索引签名
interface FlexibleConfig {
    name: string;                   // 固定属性
    version: string;               // 固定属性
    [key: string]: any;           // 其他任意属性
}

// 嵌套索引签名
interface NestedDictionary {
    [category: string]: {
        [key: string]: string | number | boolean;
    };
}

// 使用索引签名
const translations: StringDictionary = {
    "hello": "你好",
    "goodbye": "再见",
    "welcome": "欢迎",
    "thank_you": "谢谢"
};

const scores: NumberArray = [95, 87, 92, 78, 88];

const flexConfig: FlexibleConfig = {
    name: "MyApp",
    version: "1.0.0",
    debug: true,
    maxRetries: 3,
    timeout: 5000,
    features: ["auth", "analytics"]
};

const settings: NestedDictionary = {
    ui: {
        theme: "dark",
        fontSize: 14,
        showSidebar: true
    },
    api: {
        baseUrl: "https://api.example.com",
        timeout: 10000,
        enableCache: true
    },
    security: {
        enableTwoFactor: false,
        sessionTimeout: 3600
    }
};

console.log("\n=== 索引签名示例 ===");
console.log("翻译字典:", translations);
console.log("第一个分数:", scores[0]);
console.log("灵活配置:", flexConfig);
console.log("UI设置:", settings.ui);

// =============================================================================
// 5. 接口继承
// =============================================================================

// 基础接口
interface Animal {
    name: string;
    age: number;
    species: string;
}

// 单继承
interface Pet extends Animal {
    owner: string;
    isVaccinated: boolean;
    registrationNumber?: string;
}

interface WildAnimal extends Animal {
    habitat: string;
    isEndangered: boolean;
    conservationStatus: "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX";
}

// 多继承
interface Flyable {
    maxFlightHeight: number;
    flyingSpeed: number;
    canMigrate: boolean;
}

interface Swimmable {
    maxDivingDepth: number;
    swimmingSpeed: number;
    canBreathUnderwater: boolean;
}

interface Duck extends Animal, Flyable, Swimmable {
    quackSound: string;
    eggLayingCapacity?: number;
}

// 复杂继承
interface Domesticated {
    domesticationDate: Date;
    breedStandard: string;
}

interface WorkingAnimal extends Pet, Domesticated {
    jobType: "guard" | "therapy" | "service" | "farm" | "police";
    trainingLevel: "basic" | "intermediate" | "advanced" | "expert";
    certifications: string[];
}

// 使用继承接口
const pet: Pet = {
    name: "小白",
    age: 3,
    species: "犬科",
    owner: "张三",
    isVaccinated: true,
    registrationNumber: "PET-001"
};

const wildAnimal: WildAnimal = {
    name: "东北虎",
    age: 5,
    species: "猫科",
    habitat: "森林",
    isEndangered: true,
    conservationStatus: "EN"
};

const duck: Duck = {
    name: "小鸭",
    age: 2,
    species: "鸭科",
    maxFlightHeight: 100,
    flyingSpeed: 25,
    canMigrate: true,
    maxDivingDepth: 3,
    swimmingSpeed: 5,
    canBreathUnderwater: false,
    quackSound: "嘎嘎",
    eggLayingCapacity: 200
};

const workingDog: WorkingAnimal = {
    name: "警犬小黑",
    age: 4,
    species: "犬科",
    owner: "警察局",
    isVaccinated: true,
    registrationNumber: "K9-001",
    domesticationDate: new Date("2020-01-01"),
    breedStandard: "德国牧羊犬标准",
    jobType: "police",
    trainingLevel: "expert",
    certifications: ["基础训练", "缉毒训练", "搜救训练"]
};

console.log("\n=== 接口继承示例 ===");
console.log("宠物:", pet);
console.log("野生动物:", wildAnimal);
console.log("鸭子:", duck);
console.log("工作犬:", workingDog);

// =============================================================================
// 6. 泛型接口
// =============================================================================

// 基本泛型接口
interface Container<T> {
    value: T;
    isEmpty(): boolean;
    clear(): void;
    getValue(): T;
    setValue(value: T): void;
}

// API 响应泛型接口
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: Date;
    errors?: string[];
}

// 分页响应泛型接口
interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

// 键值对泛型接口
interface KeyValuePair<K, V> {
    key: K;
    value: V;
    createdAt?: Date;
    updatedAt?: Date;
}

// 状态管理泛型接口
interface Store<T> {
    state: T;
    getState(): T;
    setState(newState: Partial<T>): void;
    subscribe(listener: (state: T) => void): () => void;
    dispatch(action: { type: string; payload?: any }): void;
}

// 实现泛型接口
class StringContainer implements Container<string> {
    constructor(public value: string) {}
    
    isEmpty(): boolean {
        return this.value.length === 0;
    }
    
    clear(): void {
        this.value = "";
    }
    
    getValue(): string {
        return this.value;
    }
    
    setValue(value: string): void {
        this.value = value;
    }
}

class NumberContainer implements Container<number> {
    constructor(public value: number) {}
    
    isEmpty(): boolean {
        return this.value === 0;
    }
    
    clear(): void {
        this.value = 0;
    }
    
    getValue(): number {
        return this.value;
    }
    
    setValue(value: number): void {
        this.value = value;
    }
}

// 使用泛型接口
const stringContainer = new StringContainer("Hello World");
const numberContainer = new NumberContainer(42);

const userApiResponse: ApiResponse<User> = {
    success: true,
    data: user,
    message: "获取用户信息成功",
    timestamp: new Date()
};

const usersPage: PaginatedResponse<User> = {
    items: [user],
    pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
    }
};

const configPair: KeyValuePair<string, any> = {
    key: "theme",
    value: "dark",
    createdAt: new Date()
};

console.log("\n=== 泛型接口示例 ===");
console.log("字符串容器:", stringContainer.getValue());
console.log("数字容器:", numberContainer.getValue());
console.log("API 响应:", userApiResponse);
console.log("分页数据:", usersPage);
console.log("配置项:", configPair);

// =============================================================================
// 7. 高级接口模式
// =============================================================================

// 条件类型接口
interface ConditionalInterface<T> {
    data: T extends string ? string[] : T extends number ? number[] : T[];
}

// 映射类型接口
interface MappedInterface<T> {
    readonly [K in keyof T]: T[K];
}

// 工具类型接口
interface UserPermissions {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
}

// 使用工具类型
type PartialPermissions = Partial<UserPermissions>;
type RequiredPermissions = Required<UserPermissions>;
type ReadonlyPermissions = Readonly<UserPermissions>;
type PermissionKeys = keyof UserPermissions;
type ReadWritePermissions = Pick<UserPermissions, "read" | "write">;
type NonAdminPermissions = Omit<UserPermissions, "admin">;

// 接口合并（Declaration Merging）
interface Window {
    customProperty: string;
}

interface Window {
    anotherCustomProperty: number;
}

// 现在 Window 接口包含两个自定义属性

// 模块增强
declare global {
    interface String {
        customStringMethod(): string;
    }
}

// 使用高级模式
const conditionalString: ConditionalInterface<string> = {
    data: ["a", "b", "c"]
};

const conditionalNumber: ConditionalInterface<number> = {
    data: [1, 2, 3]
};

const mappedUser: MappedInterface<User> = {
    ...user
};

const partialPerms: PartialPermissions = {
    read: true
};

const readWritePerms: ReadWritePermissions = {
    read: true,
    write: false
};

console.log("\n=== 高级接口模式示例 ===");
console.log("条件类型字符串:", conditionalString);
console.log("条件类型数字:", conditionalNumber);
console.log("映射用户:", mappedUser);
console.log("部分权限:", partialPerms);
console.log("读写权限:", readWritePerms);

// =============================================================================
// 8. 实际应用示例
// =============================================================================

// 电商系统接口
interface ECommerceSystem {
    // 用户管理
    users: {
        create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
        getById(id: number): Promise<User | null>;
        update(id: number, updates: Partial<User>): Promise<User>;
        delete(id: number): Promise<boolean>;
        search(query: string, options?: SearchOptions): Promise<PaginatedResponse<User>>;
    };
    
    // 产品管理
    products: {
        create(productData: Omit<Product, "id">): Promise<Product>;
        getById(id: string): Promise<Product | null>;
        update(id: string, updates: Partial<Product>): Promise<Product>;
        delete(id: string): Promise<boolean>;
        search(query: string, options?: SearchOptions): Promise<PaginatedResponse<Product>>;
    };
    
    // 订单管理
    orders: {
        create(orderData: Omit<Order, "id" | "orderDate">): Promise<Order>;
        getById(id: string): Promise<Order | null>;
        getByUserId(userId: number): Promise<Order[]>;
        updateStatus(id: string, status: Order["status"]): Promise<Order>;
        cancel(id: string): Promise<boolean>;
    };
}

interface SearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filters?: Record<string, any>;
}

// 事件系统接口
interface EventSystem {
    on<T>(eventName: string, handler: EventHandler<T>): () => void;
    off<T>(eventName: string, handler: EventHandler<T>): void;
    emit<T>(eventName: string, data: T): void;
    once<T>(eventName: string, handler: EventHandler<T>): void;
}

// 缓存系统接口
interface CacheSystem<K, V> {
    get(key: K): V | null;
    set(key: K, value: V, ttl?: number): void;
    delete(key: K): boolean;
    clear(): void;
    has(key: K): boolean;
    keys(): K[];
    values(): V[];
    size(): number;
}

// 日志系统接口
interface Logger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    fatal(message: string, ...args: any[]): void;
}

console.log("\n=== 实际应用接口定义完成 ===");

// =============================================================================
// 练习题
// =============================================================================

/*
练习 1：设计一个博客系统的接口
要求：
- BlogPost 接口：包含标题、内容、作者、发布时间、标签等
- Comment 接口：包含评论内容、作者、发布时间、回复等
- Category 接口：包含分类名称、描述、文章数量等
- BlogSystem 接口：包含文章、评论、分类的 CRUD 操作

练习 2：创建一个在线学习平台的接口系统
要求：
- Course 接口：课程信息
- Lesson 接口：课程章节
- Student 接口：学生信息
- Enrollment 接口：选课记录
- LearningPlatform 接口：平台功能

练习 3：设计一个任务管理系统的接口
要求：
- Task 接口：任务信息（标题、描述、优先级、状态、截止日期等）
- Project 接口：项目信息
- Team 接口：团队信息
- TaskManager 接口：任务管理功能
- 支持任务的创建、更新、删除、搜索、统计等功能

练习 4：创建一个音乐播放器的接口系统
要求：
- Song 接口：歌曲信息
- Album 接口：专辑信息
- Artist 接口：艺术家信息
- Playlist 接口：播放列表
- MusicPlayer 接口：播放器功能
- 支持播放控制、播放列表管理、搜索等功能

提示：你可以在同目录下创建 interfaces-exercises.ts 文件来完成这些练习！
*/

export {
    type User,
    type Product,
    type Order,
    type Address,
    type AppConfig,
    type UserProfile,
    type Calculator,
    type SearchFunction,
    type EventHandler,
    type Validator,
    type Container,
    type ApiResponse,
    type PaginatedResponse,
    type ECommerceSystem,
    type EventSystem,
    type CacheSystem,
    type Logger,
    user,
    product,
    appConfig,
    userProfile,
    add,
    multiply,
    searchUsers,
    validateEmail,
    stringContainer,
    numberContainer
}; 