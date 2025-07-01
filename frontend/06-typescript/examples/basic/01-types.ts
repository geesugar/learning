// TypeScript 基础类型示例
// 运行命令：ts-node 01-types.ts

console.log("=== TypeScript 基础类型示例 ===\n");

// ============================================================================
// 1. 原始类型 (Primitive Types)
// ============================================================================

console.log("1. 原始类型");

// string 类型
let userName: string = "张三";
let message: string = `Hello, ${userName}!`;  // 模板字符串
let description: string = "这是一个字符串";

console.log("用户名:", userName);
console.log("消息:", message);
console.log("描述:", description);

// number 类型
let age: number = 25;
let price: number = 99.99;
let hexNumber: number = 0xf00d;      // 十六进制
let binaryNumber: number = 0b1010;   // 二进制
let octalNumber: number = 0o744;     // 八进制

console.log("年龄:", age);
console.log("价格:", price);
console.log("十六进制:", hexNumber);

// boolean 类型
let isActive: boolean = true;
let isCompleted: boolean = false;
let isLoggedIn: boolean = age > 18;  // 布尔表达式

console.log("是否激活:", isActive);
console.log("是否完成:", isCompleted);
console.log("是否已登录:", isLoggedIn);

// ============================================================================
// 2. 数组类型 (Array Types)
// ============================================================================

console.log("\n2. 数组类型");

// 数组的两种声明方式
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// 混合类型数组（联合类型）
let mixedArray: (string | number)[] = ["hello", 42, "world", 100];

console.log("数字数组:", numbers);
console.log("姓名数组:", names);
console.log("混合数组:", mixedArray);

// 数组操作
numbers.push(6);
names.push("David");
console.log("添加元素后:", numbers, names);

// ============================================================================
// 3. 元组类型 (Tuple Types)
// ============================================================================

console.log("\n3. 元组类型");

// 元组 - 固定长度和类型的数组
let person: [string, number] = ["Alice", 30];
let coordinate: [number, number] = [10, 20];
let rgb: [number, number, number] = [255, 128, 0];

console.log("人员信息:", person);
console.log("坐标:", coordinate);
console.log("RGB 颜色:", rgb);

// 元组的访问和修改
console.log("姓名:", person[0]);
console.log("年龄:", person[1]);

person[0] = "Bob";  // 修改姓名
person[1] = 25;     // 修改年龄
console.log("修改后:", person);

// 可选元组元素
let optionalTuple: [string, number?] = ["test"];
console.log("可选元组:", optionalTuple);

// ============================================================================
// 4. 对象类型 (Object Types)
// ============================================================================

console.log("\n4. 对象类型");

// 内联对象类型
let user: { name: string; age: number; isAdmin: boolean } = {
    name: "John",
    age: 28,
    isAdmin: false
};

console.log("用户信息:", user);

// 嵌套对象类型
let employee: {
    id: number;
    name: string;
    department: {
        name: string;
        floor: number;
    };
} = {
    id: 1,
    name: "Jane",
    department: {
        name: "开发部",
        floor: 3
    }
};

console.log("员工信息:", employee);
console.log("部门:", employee.department.name);

// 可选属性
let product: {
    name: string;
    price: number;
    description?: string;  // 可选属性
} = {
    name: "MacBook",
    price: 1999
    // description 是可选的，可以不提供
};

console.log("产品信息:", product);

// ============================================================================
// 5. 字面量类型 (Literal Types)
// ============================================================================

console.log("\n5. 字面量类型");

// 字符串字面量类型
let direction: "north" | "south" | "east" | "west" = "north";
let theme: "light" | "dark" = "dark";

console.log("方向:", direction);
console.log("主题:", theme);

// 数字字面量类型
let diceRoll: 1 | 2 | 3 | 4 | 5 | 6 = 4;
let httpStatusCode: 200 | 404 | 500 = 200;

console.log("骰子点数:", diceRoll);
console.log("HTTP 状态码:", httpStatusCode);

// 布尔字面量类型
let isEnabled: true = true;  // 只能是 true
console.log("是否启用:", isEnabled);

// ============================================================================
// 6. 特殊类型
// ============================================================================

console.log("\n6. 特殊类型");

// any 类型 - 可以是任何类型（尽量避免使用）
let anything: any = 42;
anything = "hello";
anything = true;
anything = { name: "test" };
console.log("any 类型:", anything);

// unknown 类型 - 更安全的 any
let userInput: unknown = "some string";
console.log("unknown 类型:", userInput);

// 类型检查后才能使用
if (typeof userInput === "string") {
    console.log("字符串长度:", userInput.length);
}

// void 类型 - 表示没有返回值
function logMessage(msg: string): void {
    console.log("日志:", msg);
}

logMessage("这是一条日志消息");

// null 和 undefined
let nullValue: null = null;
let undefinedValue: undefined = undefined;

console.log("null 值:", nullValue);
console.log("undefined 值:", undefinedValue);

// never 类型 - 表示永远不会发生的值
function throwError(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {
        // 无限循环
    }
}

// ============================================================================
// 7. 类型断言 (Type Assertions)
// ============================================================================

console.log("\n7. 类型断言");

// 有时候你比 TypeScript 更了解值的类型
let someValue: any = "this is a string";

// 方式一：尖括号语法
let strLength1: number = (<string>someValue).length;

// 方式二：as 语法（推荐，JSX 兼容）
let strLength2: number = (someValue as string).length;

console.log("字符串长度:", strLength1, strLength2);

// 非空断言操作符 !
let maybeString: string | null = "Hello";
let definitelyString: string = maybeString!;  // 断言不为 null

console.log("非空断言:", definitelyString);

// ============================================================================
// 8. 类型别名 (Type Aliases)
// ============================================================================

console.log("\n8. 类型别名");

// 为复杂类型创建别名
type Point = {
    x: number;
    y: number;
};

type UserInfo = {
    id: number;
    name: string;
    email: string;
};

let point: Point = { x: 10, y: 20 };
let userInfo: UserInfo = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

console.log("坐标点:", point);
console.log("用户信息:", userInfo);

// 联合类型别名
type Status = "loading" | "success" | "error";
type ID = string | number;

let currentStatus: Status = "loading";
let userId: ID = 123;
let productId: ID = "PROD_456";

console.log("当前状态:", currentStatus);
console.log("用户 ID:", userId);
console.log("产品 ID:", productId);

// ============================================================================
// 练习题
// ============================================================================

console.log("\n=== 练习题 ===");

// 练习 1：定义一个表示书籍的类型
// 包含：标题(string)、作者(string)、页数(number)、是否可借(boolean)
// 请在下面完成：

type Book = {
    title: string;
    author: string;
    pages: number;
    isAvailable: boolean;
};

const book: Book = {
    title: "TypeScript 学习指南",
    author: "张三",
    pages: 300,
    isAvailable: true
};

console.log("练习1 - 书籍信息:", book);

// 练习 2：创建一个元组类型来表示学生成绩
// 格式：[学生姓名, 数学成绩, 英语成绩, 科学成绩]
// 请在下面完成：

type StudentGrade = [string, number, number, number];

const grade: StudentGrade = ["李四", 85, 92, 88];
console.log("练习2 - 学生成绩:", grade);
console.log(`${grade[0]}的平均分: ${(grade[1] + grade[2] + grade[3]) / 3}`);

// 练习 3：定义一个联合类型来表示交通工具
// 可以是：汽车、自行车、火车、飞机
// 请在下面完成：

type Vehicle = "car" | "bike" | "train" | "plane";

function getVehicleSpeed(vehicle: Vehicle): string {
    switch (vehicle) {
        case "car":
            return "汽车：60-120 km/h";
        case "bike":
            return "自行车：15-25 km/h";
        case "train":
            return "火车：200-300 km/h";
        case "plane":
            return "飞机：800-900 km/h";
        default:
            return "未知交通工具";
    }
}

console.log("练习3 - 交通工具速度:");
console.log(getVehicleSpeed("car"));
console.log(getVehicleSpeed("plane"));

console.log("\n=== 示例完成 ===");

/*
 * 学习小结：
 * 
 * 1. TypeScript 提供了丰富的类型系统
 * 2. 原始类型：string, number, boolean
 * 3. 复合类型：数组、元组、对象
 * 4. 特殊类型：any, unknown, void, never, null, undefined
 * 5. 字面量类型可以限制值的范围
 * 6. 类型别名让复杂类型更易读
 * 7. 类型断言用于告诉编译器我们知道更多信息
 * 
 * 下一步：学习函数类型 (02-functions.ts)
 */ 