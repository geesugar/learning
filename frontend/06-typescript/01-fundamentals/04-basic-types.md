# TypeScript 基础类型

> 深入了解 TypeScript 的基础类型系统

## 🎯 学习目标

完成本节后，你将掌握：

- 所有 TypeScript 基础类型的使用
- 类型的最佳实践和使用场景
- 如何选择合适的类型
- 类型的组合和扩展

## 📝 原始类型 (Primitive Types)

### 1. string 类型

```typescript
// 基本字符串
let firstName: string = "张";
let lastName: string = "三";

// 模板字符串
let fullName: string = `${firstName}${lastName}`;
let greeting: string = `你好，${fullName}！`;

// 多行字符串
let multiLine: string = `
    这是一个
    多行字符串
    示例
`;

console.log(greeting); // "你好，张三！"
```

**使用场景：**
- 用户输入文本
- API 响应数据
- 配置字符串
- 错误消息

### 2. number 类型

```typescript
// 整数
let age: number = 25;
let count: number = 100;

// 浮点数
let price: number = 99.99;
let pi: number = 3.14159;

// 特殊数值
let notANumber: number = NaN;
let infinity: number = Infinity;
let negativeInfinity: number = -Infinity;

// 不同进制
let decimal: number = 42;        // 十进制
let hex: number = 0x2A;         // 十六进制
let binary: number = 0b101010;   // 二进制
let octal: number = 0o52;       // 八进制

console.log(decimal, hex, binary, octal); // 都是 42
```

**使用场景：**
- 年龄、价格、数量
- 坐标、大小
- 时间戳
- 计算结果

### 3. boolean 类型

```typescript
// 布尔值
let isActive: boolean = true;
let isCompleted: boolean = false;

// 布尔表达式结果
let isAdult: boolean = age >= 18;
let hasPermission: boolean = isActive && isAdult;

// 函数返回布尔值
function isEven(num: number): boolean {
    return num % 2 === 0;
}

let evenCheck: boolean = isEven(42); // true
```

**使用场景：**
- 状态标志
- 条件判断
- 权限检查
- 开关控制

## 📚 复合类型

### 1. Array (数组)

```typescript
// 基本数组声明
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];

// 泛型数组声明
let scores: Array<number> = [85, 92, 78, 96];
let items: Array<string> = ["item1", "item2", "item3"];

// 多维数组
let matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

// 混合类型数组
let mixed: (string | number)[] = ["hello", 42, "world", 100];

// 只读数组
let readOnlyNumbers: readonly number[] = [1, 2, 3];
let readOnlyArray: ReadonlyArray<string> = ["a", "b", "c"];

// 数组操作
numbers.push(6);                    // 添加元素
let first = numbers[0];             // 访问元素
let length = numbers.length;        // 获取长度
let doubled = numbers.map(n => n * 2); // 映射操作
```

**最佳实践：**
```typescript
// ✅ 推荐：使用具体类型
let userIds: number[] = [1, 2, 3];

// ❌ 不推荐：使用 any
let userIds: any[] = [1, 2, 3];

// ✅ 推荐：只读数组（不会被修改）
function processNumbers(nums: readonly number[]): number {
    return nums.reduce((sum, num) => sum + num, 0);
}
```

### 2. Tuple (元组)

```typescript
// 基本元组
let point: [number, number] = [10, 20];
let person: [string, number] = ["Alice", 30];

// 命名元组（TypeScript 4.0+）
let namedPoint: [x: number, y: number] = [10, 20];
let namedPerson: [name: string, age: number] = ["Bob", 25];

// 可选元素
let optionalTuple: [string, number?] = ["test"];
let optionalTuple2: [string, number?] = ["test", 42];

// 剩余元素
let restTuple: [string, ...number[]] = ["prefix", 1, 2, 3, 4];

// 元组解构
let [x, y] = point;
let [name, age] = person;

console.log(`坐标: (${x}, ${y})`);  // "坐标: (10, 20)"
console.log(`${name} 今年 ${age} 岁`); // "Alice 今年 30 岁"
```

**使用场景：**
```typescript
// 函数返回多个值
function getUserInfo(): [string, number, boolean] {
    return ["John", 25, true];
}

const [userName, userAge, isActive] = getUserInfo();

// 坐标和尺寸
type Coordinate = [number, number];
type Size = [width: number, height: number];
type RGB = [red: number, green: number, blue: number];

// 键值对
type KeyValue = [string, any];
let config: KeyValue[] = [
    ["theme", "dark"],
    ["language", "zh-CN"],
    ["debug", true]
];
```

## 📦 对象类型

### 1. 基本对象类型

```typescript
// 内联对象类型
let user: {
    name: string;
    age: number;
    email: string;
} = {
    name: "张三",
    age: 25,
    email: "zhangsan@example.com"
};

// 可选属性
let product: {
    name: string;
    price: number;
    description?: string;  // 可选
    category?: string;     // 可选
} = {
    name: "MacBook Pro",
    price: 1999
    // description 和 category 可以不提供
};

// 只读属性
let config: {
    readonly apiUrl: string;
    readonly version: string;
    timeout: number;
} = {
    apiUrl: "https://api.example.com",
    version: "1.0.0",
    timeout: 5000
};

// config.apiUrl = "新URL";  // 错误：只读属性不能修改
config.timeout = 10000;      // 正确：可以修改非只读属性
```

### 2. 嵌套对象类型

```typescript
// 复杂嵌套对象
let company: {
    name: string;
    address: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
    };
    employees: {
        id: number;
        name: string;
        department: string;
        salary?: number;
    }[];
} = {
    name: "科技公司",
    address: {
        street: "中关村大街1号",
        city: "北京",
        zipCode: "100080",
        country: "中国"
    },
    employees: [
        {
            id: 1,
            name: "张三",
            department: "开发部"
        },
        {
            id: 2,
            name: "李四",
            department: "设计部",
            salary: 8000
        }
    ]
};
```

### 3. 索引签名

```typescript
// 字符串索引签名
let scores: {
    [studentName: string]: number;
} = {
    "张三": 85,
    "李四": 92,
    "王五": 78
};

// 数字索引签名
let items: {
    [index: number]: string;
} = {
    0: "第一项",
    1: "第二项",
    2: "第三项"
};

// 混合索引签名
let mixed: {
    name: string;  // 固定属性
    [key: string]: any;  // 其他任意属性
} = {
    name: "配置",
    theme: "dark",
    language: "zh-CN",
    debug: true
};
```

## 🎭 字面量类型

### 1. 字符串字面量类型

```typescript
// 基本字符串字面量
type Theme = "light" | "dark";
type Size = "small" | "medium" | "large";
type Status = "pending" | "approved" | "rejected";

let currentTheme: Theme = "dark";
let buttonSize: Size = "medium";
let orderStatus: Status = "pending";

// 函数中使用字面量类型
function setTheme(theme: Theme): void {
    console.log(`设置主题为: ${theme}`);
}

setTheme("light");  // 正确
// setTheme("blue");   // 错误：类型不匹配
```

### 2. 数字字面量类型

```typescript
// 数字字面量
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatus = 200 | 404 | 500;
type Port = 3000 | 8000 | 8080;

let dice: DiceValue = 4;
let status: HttpStatus = 200;
let serverPort: Port = 3000;

// 函数中使用
function rollDice(): DiceValue {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}
```

### 3. 布尔字面量类型

```typescript
// 布尔字面量（较少使用）
type IsEnabled = true;
type IsDisabled = false;

let featureEnabled: IsEnabled = true;
let featureDisabled: IsDisabled = false;

// 更常见的用法
type Permission = true | false;
let canEdit: Permission = true;
```

## 🔧 特殊类型

### 1. any 类型

```typescript
// any 类型 - 放弃类型检查
let anything: any = 42;
anything = "hello";
anything = true;
anything = { name: "test" };
anything.foo.bar.baz; // 不会报错，但运行时可能出错

// 避免使用 any 的情况
// ❌ 不推荐
function processData(data: any): any {
    return data.someProperty;
}

// ✅ 推荐：使用泛型
function processData<T>(data: T): T {
    return data;
}
```

### 2. unknown 类型

```typescript
// unknown 类型 - 更安全的 any
let userInput: unknown = getUserInput();

// 使用前必须进行类型检查
if (typeof userInput === "string") {
    console.log(userInput.toUpperCase()); // 正确
}

if (typeof userInput === "number") {
    console.log(userInput.toFixed(2)); // 正确
}

// 类型守卫函数
function isString(value: unknown): value is string {
    return typeof value === "string";
}

if (isString(userInput)) {
    console.log(userInput.length); // TypeScript 知道这里是 string
}
```

### 3. void 类型

```typescript
// void 表示没有返回值
function logMessage(message: string): void {
    console.log(message);
    // 没有 return 语句，或者 return;
}

function processData(data: any[]): void {
    data.forEach(item => console.log(item));
    return; // 可以有空的 return
}

// 函数表达式
const onClick: () => void = () => {
    console.log("按钮被点击");
};
```

### 4. never 类型

```typescript
// never 表示永不发生的值
function throwError(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {
        console.log("无限循环");
    }
}

// 完整性检查
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
    switch (shape) {
        case "circle":
            return Math.PI;
        case "square":
            return 1;
        case "triangle":
            return 0.5;
        default:
            // 如果添加新的 Shape，这里会报错
            const exhaustiveCheck: never = shape;
            return exhaustiveCheck;
    }
}
```

### 5. null 和 undefined

```typescript
// 严格模式下，null 和 undefined 是独立类型
let nullValue: null = null;
let undefinedValue: undefined = undefined;

// 联合类型允许 null 或 undefined
let nullable: string | null = null;
let optional: number | undefined = undefined;

// 可选属性自动包含 undefined
interface User {
    name: string;
    age?: number;  // 实际类型是 number | undefined
}

let user: User = { name: "Alice" }; // age 是 undefined
```

## 🔗 联合类型和交叉类型

### 1. 联合类型 (Union Types)

```typescript
// 基本联合类型
type StringOrNumber = string | number;
type BooleanOrNull = boolean | null;

let value: StringOrNumber = "hello";
value = 42; // 也可以是数字

// 函数参数联合类型
function formatId(id: string | number): string {
    if (typeof id === "string") {
        return id.toUpperCase();
    } else {
        return id.toString();
    }
}

console.log(formatId("abc123")); // "ABC123"
console.log(formatId(123));      // "123"

// 复杂联合类型
type Theme = "light" | "dark" | "auto";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonProps = {
    text: string;
    theme: Theme;
    size: Size;
    disabled?: boolean;
};
```

### 2. 交叉类型 (Intersection Types)

```typescript
// 基本交叉类型
type Name = {
    firstName: string;
    lastName: string;
};

type Age = {
    age: number;
};

type Person = Name & Age;

let person: Person = {
    firstName: "张",
    lastName: "三",
    age: 25
};

// 函数交叉类型
type Loggable = {
    log(): void;
};

type Serializable = {
    serialize(): string;
};

type LoggableSerializable = Loggable & Serializable;

let obj: LoggableSerializable = {
    log() {
        console.log("记录日志");
    },
    serialize() {
        return JSON.stringify(this);
    }
};
```

## 📏 类型别名 (Type Aliases)

```typescript
// 基本类型别名
type UserID = number;
type UserName = string;
type EmailAddress = string;

// 复杂类型别名
type User = {
    id: UserID;
    name: UserName;
    email: EmailAddress;
    createdAt: Date;
    updatedAt: Date;
};

// 函数类型别名
type EventHandler = (event: Event) => void;
type Formatter = (value: any) => string;
type Validator = (value: string) => boolean;

// 泛型类型别名
type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;
```

## 🎯 类型选择指南

### 何时使用不同的类型

| 类型 | 使用场景 | 示例 |
|------|----------|------|
| `string` | 文本数据 | 用户名、描述、URL |
| `number` | 数值数据 | 年龄、价格、ID |
| `boolean` | 二元状态 | 是否启用、是否可见 |
| `Array<T>` | 同类型集合 | 用户列表、商品列表 |
| `Tuple` | 固定结构 | 坐标、RGB值 |
| `Object` | 复杂数据 | 用户信息、配置 |
| `Union` | 多选一 | 状态、主题 |
| `Intersection` | 组合类型 | 混合接口 |
| `Literal` | 限定值 | 常量、枚举值 |

### 最佳实践

```typescript
// ✅ 推荐：使用具体类型
let userAge: number = 25;
let userName: string = "Alice";

// ❌ 避免：过度使用 any
let userData: any = { name: "Alice", age: 25 };

// ✅ 推荐：使用联合类型
let status: "loading" | "success" | "error" = "loading";

// ❌ 避免：字符串常量
let status: string = "loading";

// ✅ 推荐：使用类型别名
type Theme = "light" | "dark";
let currentTheme: Theme = "light";

// ✅ 推荐：使用只读类型
let config: readonly string[] = ["item1", "item2"];
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：定义一个产品类型
// 包含：ID(number), 名称(string), 价格(number), 
//      类别("electronics"|"clothing"|"books"), 是否有库存(boolean)

// 练习 2：创建一个元组表示RGB颜色和透明度
// 格式：[red, green, blue, alpha] (都是0-255的数字)

// 练习 3：定义一个用户配置对象类型
// 包含：用户名(string), 主题("light"|"dark"), 
//      语言(string), 通知设置(可选boolean)

// 练习 4：使用交叉类型组合以下类型
// Identifiable: { id: number }
// Timestamped: { createdAt: Date; updatedAt: Date }
// 创建一个 Entity 类型
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **原始类型**：string, number, boolean 的详细用法
- ✅ **复合类型**：Array, Tuple, Object 的应用场景
- ✅ **字面量类型**：限制值的范围和类型安全
- ✅ **特殊类型**：any, unknown, void, never 的使用时机
- ✅ **联合和交叉类型**：类型的组合和扩展
- ✅ **类型别名**：提高代码可读性和维护性

## 🚀 下一步

现在你已经掌握了基础类型，让我们学习如何在函数中使用这些类型！

👉 **下一步：[函数与接口](./05-functions-interfaces.md)**

---

> 💡 **记住**：选择正确的类型不仅能提供类型安全，还能让代码更易读、更易维护。从严格的类型开始，避免过度使用 `any`！ 