# TypeScript 映射类型

> 掌握映射类型，动态创建和转换类型，构建强大的类型系统

## 🎯 学习目标

完成本节后，你将掌握：

- 映射类型的基本语法和原理
- 键值映射和类型修饰符
- 模板字面量在映射类型中的应用
- 递归映射类型的实现
- 实用工具类型的内部实现

## 🗺️ 映射类型基础

映射类型允许你基于现有类型创建新类型，通过遍历现有类型的属性来构建新的类型结构。

### 基本语法

```typescript
// 映射类型的基本语法
type MappedType<T> = {
    [K in keyof T]: T[K];
};

// 示例接口
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

// 基本映射 - 创建相同的类型
type UserCopy = MappedType<User>;
// 等同于：
// type UserCopy = {
//     id: number;
//     name: string;
//     email: string;
//     isActive: boolean;
// }

// 类型转换映射
type StringifiedUser = {
    [K in keyof User]: string;
};
// 结果：
// type StringifiedUser = {
//     id: string;
//     name: string;
//     email: string;
//     isActive: string;
// }

// 可选属性映射
type PartialUser = {
    [K in keyof User]?: User[K];
};
// 等同于 Partial<User>

console.log("=== 映射类型基础示例 ===");
console.log("映射类型语法定义完成");
```

### 键映射变换

```typescript
// 键名转换
type PrefixedUser = {
    [K in keyof User as `user_${string & K}`]: User[K];
};
// 结果：
// type PrefixedUser = {
//     user_id: number;
//     user_name: string;
//     user_email: string;
//     user_isActive: boolean;
// }

// 条件键映射
type PublicUser = {
    [K in keyof User as K extends 'id' ? never : K]: User[K];
};
// 结果：排除 'id' 属性的 User 类型
// type PublicUser = {
//     name: string;
//     email: string;
//     isActive: boolean;
// }

// 键名大写转换
type UppercaseUser = {
    [K in keyof User as Uppercase<string & K>]: User[K];
};
// 结果：
// type UppercaseUser = {
//     ID: number;
//     NAME: string;
//     EMAIL: string;
//     ISACTIVE: boolean;
// }

// 复杂键转换
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
    : S;

type SnakeCaseUser = {
    [K in keyof User as CamelToSnakeCase<string & K>]: User[K];
};

console.log("\n=== 键映射变换示例 ===");
```

## 🛠️ 修饰符操作

映射类型可以添加或移除属性修饰符（readonly、可选等）。

### 可选性修饰符

```typescript
// 添加可选修饰符
type OptionalFields<T> = {
    [K in keyof T]?: T[K];
};

// 移除可选修饰符
type RequiredFields<T> = {
    [K in keyof T]-?: T[K];
};

interface PartialUser {
    id?: number;
    name?: string;
    email?: string;
}

type RequiredUser = RequiredFields<PartialUser>;
// 结果：
// type RequiredUser = {
//     id: number;
//     name: string;
//     email: string;
// }

// 选择性可选
type MakeOptional<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
} & {
    [P in K]?: T[P];
};

type UserWithOptionalEmail = MakeOptional<User, 'email'>;
// 结果：email 变为可选，其他保持必需

console.log("\n=== 可选性修饰符示例 ===");
```

### 只读修饰符

```typescript
// 添加只读修饰符
type ReadonlyFields<T> = {
    readonly [K in keyof T]: T[K];
};

// 移除只读修饰符
type MutableFields<T> = {
    -readonly [K in keyof T]: T[K];
};

interface ReadonlyUser {
    readonly id: number;
    readonly name: string;
    readonly email: string;
}

type MutableUser = MutableFields<ReadonlyUser>;
// 结果：所有属性变为可变

// 选择性只读
type MakeReadonly<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
} & {
    readonly [P in K]: T[P];
};

type UserWithReadonlyId = MakeReadonly<User, 'id'>;
// 结果：只有 id 变为只读

// 深度只读
type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

interface NestedUser {
    id: number;
    profile: {
        name: string;
        address: {
            street: string;
            city: string;
        };
    };
}

type DeepReadonlyUser = DeepReadonly<NestedUser>;
// 所有嵌套属性都变为只读

console.log("\n=== 只读修饰符示例 ===");
```

## 🎨 高级映射模式

### 条件映射

```typescript
// 基于类型的条件映射
type NullableFields<T> = {
    [K in keyof T]: T[K] | null;
};

type StringFields<T> = {
    [K in keyof T]: T[K] extends string ? T[K] : never;
};

// 提取特定类型的属性
type PickByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type UserStringFields = PickByType<User, string>;
// 结果：
// type UserStringFields = {
//     name: string;
//     email: string;
// }

type UserNumberFields = PickByType<User, number>;
// 结果：
// type UserNumberFields = {
//     id: number;
// }

// 排除特定类型的属性
type OmitByType<T, U> = {
    [K in keyof T as T[K] extends U ? never : K]: T[K];
};

type UserNonStringFields = OmitByType<User, string>;
// 结果：
// type UserNonStringFields = {
//     id: number;
//     isActive: boolean;
// }

console.log("\n=== 条件映射示例 ===");
```

### 函数类型映射

```typescript
// 提取函数类型属性
type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

class Calculator {
    value: number = 0;
    history: number[] = [];
    
    add(n: number): number { return this.value + n; }
    subtract(n: number): number { return this.value - n; }
    reset(): void { this.value = 0; }
    getHistory(): number[] { return this.history; }
}

type CalculatorFunctions = FunctionProperties<Calculator>;
// 结果：
// type CalculatorFunctions = {
//     add: (n: number) => number;
//     subtract: (n: number) => number;
//     reset: () => void;
//     getHistory: () => number[];
// }

type CalculatorData = NonFunctionProperties<Calculator>;
// 结果：
// type CalculatorData = {
//     value: number;
//     history: number[];
// }

console.log("\n=== 函数类型映射示例 ===");
```

## 🔄 递归映射类型

### 深度类型转换

```typescript
// 深度部分类型
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object 
        ? T[K] extends Function 
            ? T[K] 
            : DeepPartial<T[K]>
        : T[K];
};

// 深度必需类型
type DeepRequired<T> = {
    [K in keyof T]-?: T[K] extends object 
        ? T[K] extends Function 
            ? T[K] 
            : DeepRequired<T[K]>
        : T[K];
};

// 深度可空类型
type DeepNullable<T> = {
    [K in keyof T]: T[K] extends object 
        ? T[K] extends Function 
            ? T[K] 
            : DeepNullable<T[K]>
        : T[K] | null;
};

interface ComplexUser {
    id: number;
    profile: {
        name: string;
        bio?: string;
        social: {
            twitter?: string;
            github?: string;
        };
    };
    settings: {
        theme: 'light' | 'dark';
        notifications: {
            email: boolean;
            push: boolean;
        };
    };
}

type PartialComplexUser = DeepPartial<ComplexUser>;
type RequiredComplexUser = DeepRequired<ComplexUser>;
type NullableComplexUser = DeepNullable<ComplexUser>;

console.log("\n=== 递归映射类型示例 ===");
```

### 路径映射

```typescript
// 生成对象路径类型
type Paths<T, Prefix extends string = ""> = {
    [K in keyof T]: T[K] extends object 
        ? T[K] extends Function 
            ? `${Prefix}${string & K}`
            : `${Prefix}${string & K}` | Paths<T[K], `${Prefix}${string & K}.`>
        : `${Prefix}${string & K}`;
}[keyof T];

type UserPaths = Paths<ComplexUser>;
// 结果：
// type UserPaths = 
//     | "id" 
//     | "profile" 
//     | "profile.name" 
//     | "profile.bio" 
//     | "profile.social" 
//     | "profile.social.twitter" 
//     | "profile.social.github" 
//     | "settings" 
//     | "settings.theme" 
//     | "settings.notifications" 
//     | "settings.notifications.email" 
//     | "settings.notifications.push";

// 根据路径获取类型
type PathType<T, P extends string> = P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
        ? PathType<T[Key], Rest>
        : never
    : P extends keyof T
        ? T[P]
        : never;

type ProfileNameType = PathType<ComplexUser, "profile.name">;           // string
type EmailNotificationType = PathType<ComplexUser, "settings.notifications.email">; // boolean

// 设置路径值的类型
type SetPath<T, P extends string, V> = P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
        ? {
            [K in keyof T]: K extends Key ? SetPath<T[K], Rest, V> : T[K];
        }
        : never
    : P extends keyof T
        ? {
            [K in keyof T]: K extends P ? V : T[K];
        }
        : never;

console.log("\n=== 路径映射示例 ===");
```

## 🔧 实用工具类型实现

### 内置工具类型的实现

```typescript
// Partial 的实现
type MyPartial<T> = {
    [P in keyof T]?: T[P];
};

// Required 的实现
type MyRequired<T> = {
    [P in keyof T]-?: T[P];
};

// Readonly 的实现
type MyReadonly<T> = {
    readonly [P in keyof T]: T[P];
};

// Pick 的实现
type MyPick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// Omit 的实现
type MyOmit<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};

// Record 的实现
type MyRecord<K extends keyof any, T> = {
    [P in K]: T;
};

// Exclude 的实现
type MyExclude<T, U> = T extends U ? never : T;

// Extract 的实现
type MyExtract<T, U> = T extends U ? T : never;

// NonNullable 的实现
type MyNonNullable<T> = T extends null | undefined ? never : T;

console.log("\n=== 内置工具类型实现示例 ===");
```

### 自定义工具类型

```typescript
// 重命名属性
type RenameProperty<T, K extends keyof T, N extends string> = {
    [P in keyof T as P extends K ? N : P]: T[P];
};

type UserWithUsernameInsteadOfName = RenameProperty<User, 'name', 'username'>;
// 结果：
// type UserWithUsernameInsteadOfName = {
//     id: number;
//     username: string;
//     email: string;
//     isActive: boolean;
// }

// 交换属性类型
type SwapProperties<T, K1 extends keyof T, K2 extends keyof T> = {
    [P in keyof T]: P extends K1 ? T[K2] : P extends K2 ? T[K1] : T[P];
};

// 添加属性
type AddProperty<T, K extends string, V> = T & {
    [P in K]: V;
};

type UserWithAge = AddProperty<User, 'age', number>;

// 修改属性类型
type ModifyProperty<T, K extends keyof T, V> = {
    [P in keyof T]: P extends K ? V : T[P];
};

type UserWithStringId = ModifyProperty<User, 'id', string>;

// 可空属性
type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

// 可空指定属性
type MakeNullable<T, K extends keyof T> = {
    [P in keyof T]: P extends K ? T[P] | null : T[P];
};

type UserWithNullableEmail = MakeNullable<User, 'email'>;

console.log("\n=== 自定义工具类型示例 ===");
```

## 🚀 实际应用场景

### API 响应类型生成

```typescript
// 基础实体类型
interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

// API 响应类型生成器
type ApiResponse<T> = {
    success: boolean;
    data: T;
    message: string;
};

type PaginatedResponse<T> = {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

// 从实体类型生成 API 类型
type CreateRequest<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateRequest<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
type EntityResponse<T> = ApiResponse<T>;
type EntitiesResponse<T> = ApiResponse<PaginatedResponse<T>>;

// 示例实体
interface Article extends BaseEntity {
    title: string;
    content: string;
    authorId: string;
    tags: string[];
    published: boolean;
}

// 自动生成的 API 类型
type CreateArticleRequest = CreateRequest<Article>;
type UpdateArticleRequest = UpdateRequest<Article>;
type ArticleResponse = EntityResponse<Article>;
type ArticlesResponse = EntitiesResponse<Article>;

console.log("\n=== API 响应类型生成示例 ===");
```

### 表单类型生成

```typescript
// 表单状态类型生成
type FormState<T> = {
    [K in keyof T]: {
        value: T[K];
        error?: string;
        touched: boolean;
        dirty: boolean;
    };
};

// 表单动作类型生成
type FormActions<T> = {
    [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
} & {
    [K in keyof T as `clear${Capitalize<string & K>}Error`]: () => void;
} & {
    [K in keyof T as `touch${Capitalize<string & K>}`]: () => void;
} & {
    resetForm: () => void;
    validateForm: () => boolean;
    submitForm: () => void;
};

// 验证规则类型
type ValidationRules<T> = {
    [K in keyof T]?: Array<(value: T[K]) => string | undefined>;
};

// 表单配置类型
type FormConfig<T> = {
    initialValues: T;
    validationRules?: ValidationRules<T>;
    onSubmit: (values: T) => void | Promise<void>;
};

// 使用示例
interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
}

type LoginFormState = FormState<LoginForm>;
type LoginFormActions = FormActions<LoginForm>;
type LoginFormConfig = FormConfig<LoginForm>;

console.log("\n=== 表单类型生成示例 ===");
```

### 状态管理类型

```typescript
// Redux 风格的 Action 类型生成
type ActionCreators<T> = {
    [K in keyof T as `set${Capitalize<string & K>}`]: (payload: T[K]) => {
        type: `SET_${Uppercase<string & K>}`;
        payload: T[K];
    };
} & {
    [K in keyof T as `clear${Capitalize<string & K>}`]: () => {
        type: `CLEAR_${Uppercase<string & K>}`;
    };
} & {
    reset: () => { type: 'RESET' };
};

// 状态选择器类型生成
type Selectors<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: (state: T) => T[K];
} & {
    [K in keyof T as `is${Capitalize<string & K>}Loading`]: (state: T & { loading: Record<keyof T, boolean> }) => boolean;
};

// 应用状态
interface AppState {
    user: User | null;
    theme: 'light' | 'dark';
    notifications: Notification[];
    isLoading: boolean;
}

type AppActionCreators = ActionCreators<AppState>;
type AppSelectors = Selectors<AppState>;

console.log("\n=== 状态管理类型示例 ===");
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：实现一个 Flatten 类型
// 要求：将嵌套对象的属性展平到一层

// 练习 2：实现一个 CamelCase 转 snake_case 的映射类型
// 要求：将对象的所有键名从驼峰命名转换为下划线命名

// 练习 3：实现一个条件属性映射
// 要求：根据属性值类型决定是否包含该属性

// 练习 4：实现一个类型安全的对象合并类型
// 要求：合并两个对象类型，处理冲突和类型推断
```

### 高级练习

```typescript
// 练习 5：实现一个递归的类型转换器
// 要求：将对象中所有 Date 类型转换为 string 类型

// 练习 6：实现一个基于 JSON Schema 的类型生成器
// 要求：根据 JSON Schema 定义生成对应的 TypeScript 类型

// 练习 7：实现一个 GraphQL 风格的类型选择器
// 要求：根据查询字段选择对应的返回类型
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **映射基础**：映射类型的语法和基本原理
- ✅ **键值操作**：键映射、值转换、修饰符操作
- ✅ **高级模式**：条件映射、函数类型映射、递归映射
- ✅ **工具类型**：内置工具类型的实现原理
- ✅ **实际应用**：在 API、表单、状态管理中的应用
- ✅ **性能考虑**：映射类型的性能优化策略

## 🚀 下一步

现在你已经掌握了映射类型的强大功能，让我们继续学习类型守卫来确保运行时的类型安全！

👉 **下一步：[类型守卫](./05-type-guards.md)**

---

> 💡 **记住**：映射类型是 TypeScript 类型系统的精华之一。它们让你能够以声明式的方式转换和操作类型，构建出既灵活又安全的类型系统。掌握映射类型将大大提升你的类型编程能力！ 