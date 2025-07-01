# 解构赋值

> 优雅地从数组和对象中提取数据

## 🎯 学习目标

- 掌握数组解构的各种用法
- 理解对象解构的语法和应用
- 学会嵌套解构和重命名技巧
- 在函数参数中使用解构
- 了解解构赋值的实际应用场景

## 📖 核心内容

### 1. 数组解构

#### 1.1 基本数组解构

```javascript
// 传统方式
const arr = [1, 2, 3];
const first = arr[0];
const second = arr[1];
const third = arr[2];

// 解构赋值
const [first, second, third] = [1, 2, 3];
console.log(first, second, third); // 1 2 3

// 部分解构
const [a, b] = [1, 2, 3, 4, 5];
console.log(a, b); // 1 2

// 跳过元素
const [x, , z] = [1, 2, 3];
console.log(x, z); // 1 3

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]
```

#### 1.2 默认值

```javascript
// 基本默认值
const [a = 1, b = 2] = [];
console.log(a, b); // 1 2

const [x = 1, y = 2] = [10];
console.log(x, y); // 10 2

// 使用函数作为默认值
function getDefault() {
    console.log('Getting default value');
    return 42;
}

const [value = getDefault()] = []; // 会调用函数
const [value2 = getDefault()] = [100]; // 不会调用函数

// 默认值可以引用其他变量
const [first = 1, second = first * 2] = [];
console.log(first, second); // 1 2
```

#### 1.3 交换变量

```javascript
// 传统方式交换变量
let a = 1, b = 2;
let temp = a;
a = b;
b = temp;

// 解构方式交换变量
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1

// 多变量交换
let [p, q, r] = [1, 2, 3];
[p, q, r] = [r, p, q];
console.log(p, q, r); // 3 1 2
```

#### 1.4 嵌套数组解构

```javascript
// 嵌套数组
const nested = [[1, 2], [3, 4], [5, 6]];
const [[a, b], [c, d]] = nested;
console.log(a, b, c, d); // 1 2 3 4

// 复杂嵌套
const complex = [1, [2, 3], [4, [5, 6]]];
const [first, [second, third], [fourth, [fifth, sixth]]] = complex;
console.log(first, second, third, fourth, fifth, sixth); // 1 2 3 4 5 6

// 嵌套与剩余元素结合
const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const [[first, ...rest1], [second, ...rest2]] = data;
console.log(first, rest1); // 1 [2, 3]
console.log(second, rest2); // 4 [5, 6]
```

### 2. 对象解构

#### 2.1 基本对象解构

```javascript
// 传统方式
const person = { name: 'Alice', age: 30, city: 'New York' };
const name = person.name;
const age = person.age;
const city = person.city;

// 解构赋值
const { name, age, city } = person;
console.log(name, age, city); // Alice 30 New York

// 部分解构
const { name, age } = person;
console.log(name, age); // Alice 30

// 顺序不重要
const { city, name } = person;
console.log(city, name); // New York Alice
```

#### 2.2 重命名变量

```javascript
const person = { name: 'Alice', age: 30 };

// 重命名
const { name: fullName, age: years } = person;
console.log(fullName, years); // Alice 30

// 重命名 + 默认值
const { name: userName = 'Anonymous', email: userEmail = 'no-email' } = person;
console.log(userName, userEmail); // Alice no-email

// 复杂重命名
const config = { server: { host: 'localhost', port: 3000 } };
const { server: { host: serverHost, port: serverPort } } = config;
console.log(serverHost, serverPort); // localhost 3000
```

#### 2.3 默认值

```javascript
// 基本默认值
const { name = 'Anonymous', age = 0 } = {};
console.log(name, age); // Anonymous 0

// 对象中已有值时不使用默认值
const { name = 'Anonymous', age = 0 } = { name: 'Alice' };
console.log(name, age); // Alice 0

// 默认值可以是表达式
const getDefaultAge = () => {
    console.log('计算默认年龄');
    return 18;
};

const { name, age = getDefaultAge() } = { name: 'Bob' };
console.log(name, age); // Bob 18 (会调用函数)

const { name: name2, age: age2 = getDefaultAge() } = { name: 'Charlie', age: 25 };
console.log(name2, age2); // Charlie 25 (不会调用函数)
```

#### 2.4 嵌套对象解构

```javascript
// 嵌套对象
const user = {
    id: 1,
    name: 'Alice',
    address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA'
    }
};

// 嵌套解构
const {
    id,
    name,
    address: {
        street,
        city,
        country
    }
} = user;

console.log(id, name, street, city, country); // 1 Alice 123 Main St New York USA

// 嵌套解构 + 重命名
const {
    address: {
        street: userStreet,
        city: userCity
    }
} = user;

console.log(userStreet, userCity); // 123 Main St New York

// 深层嵌套
const data = {
    result: {
        user: {
            profile: {
                name: 'Alice',
                settings: {
                    theme: 'dark',
                    language: 'en'
                }
            }
        }
    }
};

const {
    result: {
        user: {
            profile: {
                name: profileName,
                settings: { theme, language }
            }
        }
    }
} = data;

console.log(profileName, theme, language); // Alice dark en
```

#### 2.5 剩余属性

```javascript
const person = {
    name: 'Alice',
    age: 30,
    city: 'New York',
    job: 'Developer',
    hobby: 'Reading'
};

// 剩余属性
const { name, age, ...rest } = person;
console.log(name, age); // Alice 30
console.log(rest); // { city: 'New York', job: 'Developer', hobby: 'Reading' }

// 实际应用：排除某些属性
const { password, ...publicUserInfo } = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123'
};

console.log(publicUserInfo); // { id: 1, name: 'Alice', email: 'alice@example.com' }
```

### 3. 函数参数解构

#### 3.1 基本参数解构

```javascript
// 传统方式
function greetOld(person) {
    const name = person.name;
    const age = person.age;
    return `Hello, ${name}! You are ${age} years old.`;
}

// 参数解构
function greet({ name, age }) {
    return `Hello, ${name}! You are ${age} years old.`;
}

const person = { name: 'Alice', age: 30 };
console.log(greet(person)); // Hello, Alice! You are 30 years old.

// 数组参数解构
function sum([a, b, c]) {
    return a + b + c;
}

console.log(sum([1, 2, 3])); // 6
```

#### 3.2 参数解构的默认值

```javascript
// 参数解构 + 默认值
function createUser({ name, age = 18, role = 'user' }) {
    return { name, age, role };
}

console.log(createUser({ name: 'Alice' })); 
// { name: 'Alice', age: 18, role: 'user' }

console.log(createUser({ name: 'Bob', age: 25, role: 'admin' })); 
// { name: 'Bob', age: 25, role: 'admin' }

// 整个参数对象的默认值
function processOptions({ timeout = 5000, retries = 3 } = {}) {
    return { timeout, retries };
}

console.log(processOptions()); // { timeout: 5000, retries: 3 }
console.log(processOptions({})); // { timeout: 5000, retries: 3 }
console.log(processOptions({ timeout: 10000 })); // { timeout: 10000, retries: 3 }
```

#### 3.3 复杂参数解构

```javascript
// 嵌套参数解构
function processUser({
    name,
    age,
    address: { city, country },
    preferences: { theme = 'light', language = 'en' } = {}
}) {
    return {
        userName: name,
        userAge: age,
        location: `${city}, ${country}`,
        settings: { theme, language }
    };
}

const userData = {
    name: 'Alice',
    age: 30,
    address: {
        city: 'New York',
        country: 'USA'
    },
    preferences: {
        theme: 'dark'
    }
};

console.log(processUser(userData));
// {
//   userName: 'Alice',
//   userAge: 30,
//   location: 'New York, USA',
//   settings: { theme: 'dark', language: 'en' }
// }

// 数组和对象混合解构
function analyzeData([first, second], { threshold = 0.5, normalize = false }) {
    const diff = Math.abs(first - second);
    const result = normalize ? diff / Math.max(first, second) : diff;
    return {
        difference: result,
        exceedsThreshold: result > threshold
    };
}

console.log(analyzeData([10, 7], { threshold: 2 }));
// { difference: 3, exceedsThreshold: true }
```

### 4. 高级解构技巧

#### 4.1 计算属性名解构

```javascript
// 动态属性名
const prop = 'name';
const obj = { name: 'Alice', age: 30 };

const { [prop]: value } = obj;
console.log(value); // Alice

// 结合函数使用
function extractProperty(obj, propName) {
    const { [propName]: value } = obj;
    return value;
}

console.log(extractProperty({ a: 1, b: 2, c: 3 }, 'b')); // 2
```

#### 4.2 解构赋值中的类型检查

```javascript
// 使用解构验证对象结构
function validateUser(user) {
    try {
        const { name, email, age } = user;
        
        if (!name || !email || !age) {
            throw new Error('Missing required fields');
        }
        
        return { name, email, age };
    } catch (error) {
        throw new Error('Invalid user object');
    }
}

// 使用默认值进行容错
function safeExtract(obj) {
    const {
        data: {
            result: {
                value = null
            } = {}
        } = {}
    } = obj || {};
    
    return value;
}

console.log(safeExtract({})); // null
console.log(safeExtract({ data: { result: { value: 42 } } })); // 42
```

## 🎯 实际应用场景

### 1. API 响应处理

```javascript
// 处理 API 响应
async function fetchUserData(userId) {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    
    // 解构 API 响应
    const {
        user: {
            id,
            name,
            email,
            profile: {
                avatar,
                bio,
                location: { city, country } = {}
            } = {}
        },
        settings: {
            theme = 'light',
            notifications = true
        } = {}
    } = data;
    
    return {
        id,
        name,
        email,
        avatar,
        bio,
        location: city && country ? `${city}, ${country}` : null,
        theme,
        notifications
    };
}
```

### 2. React 组件中的解构

```javascript
// React 组件 props 解构
function UserCard({ 
    user: { name, email, avatar },
    settings: { showEmail = true, theme = 'light' } = {},
    onEdit,
    onDelete,
    ...otherProps 
}) {
    return (
        <div className={`user-card ${theme}`} {...otherProps}>
            <img src={avatar} alt={name} />
            <h3>{name}</h3>
            {showEmail && <p>{email}</p>}
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
        </div>
    );
}

// 状态解构
const [{ loading, data, error }, setState] = useState({
    loading: false,
    data: null,
    error: null
});
```

### 3. 模块导入解构

```javascript
// 从模块中解构导入
import { useState, useEffect, useCallback } from 'react';
import { debounce, throttle } from 'lodash';
import { format, parse } from 'date-fns';

// 命名空间导入后解构
import * as utils from './utils';
const { formatDate, validateEmail, generateId } = utils;

// 动态导入中的解构
const { default: Chart, Line, Bar } = await import('chart.js');
```

### 4. 配置对象处理

```javascript
// 处理复杂配置对象
function createServer({
    port = 3000,
    host = 'localhost',
    database: {
        host: dbHost = 'localhost',
        port: dbPort = 5432,
        name: dbName,
        credentials: { username, password } = {}
    },
    middleware: {
        cors: corsOptions = {},
        logging: { level = 'info', format = 'combined' } = {}
    } = {},
    features: {
        authentication = true,
        caching = false,
        compression = true
    } = {}
}) {
    return {
        serverConfig: { port, host },
        databaseConfig: { 
            host: dbHost, 
            port: dbPort, 
            name: dbName,
            username,
            password 
        },
        middlewareConfig: {
            cors: corsOptions,
            logging: { level, format }
        },
        features: { authentication, caching, compression }
    };
}

// 使用配置
const serverConfig = createServer({
    port: 8080,
    database: {
        name: 'myapp',
        credentials: { username: 'admin', password: 'secret' }
    },
    middleware: {
        logging: { level: 'debug' }
    }
});
```

### 5. 数据转换和映射

```javascript
// 数据转换工具
function transformUsers(users) {
    return users.map(({
        id,
        firstName,
        lastName,
        email,
        profile: {
            age,
            avatar,
            address: { city, country } = {}
        } = {},
        preferences: {
            theme,
            language,
            notifications: { email: emailNotifications = true } = {}
        } = {}
    }) => ({
        id,
        name: `${firstName} ${lastName}`,
        email,
        age,
        avatar,
        location: [city, country].filter(Boolean).join(', '),
        settings: {
            theme: theme || 'light',
            language: language || 'en',
            emailNotifications
        }
    }));
}

// 数组操作中的解构
const coordinates = [[1, 2], [3, 4], [5, 6]];
const distances = coordinates.map(([x, y]) => Math.sqrt(x * x + y * y));

// 对象数组排序
const products = [
    { name: 'A', price: 100, category: { name: 'Electronics' } },
    { name: 'B', price: 50, category: { name: 'Books' } }
];

const sortedProducts = products.sort(
    ({ price: a }, { price: b }) => a - b
);
```

## 🎁 最佳实践

### 1. 避免过度嵌套

```javascript
// ❌ 过度嵌套，难以理解
const {
    data: {
        user: {
            profile: {
                settings: {
                    privacy: {
                        level: privacyLevel
                    }
                }
            }
        }
    }
} = response;

// ✅ 分步解构，更清晰
const { data } = response;
const { user } = data;
const { profile } = user;
const { settings } = profile;
const { privacy: { level: privacyLevel } } = settings;
```

### 2. 提供合理的默认值

```javascript
// ✅ 提供默认值防止错误
function processConfig({
    timeout = 5000,
    retries = 3,
    headers = {},
    ...options
} = {}) {
    // 处理逻辑
}
```

### 3. 使用解构简化代码

```javascript
// ❌ 重复访问属性
function formatUser(user) {
    return `${user.firstName} ${user.lastName} (${user.email})`;
}

// ✅ 使用解构
function formatUser({ firstName, lastName, email }) {
    return `${firstName} ${lastName} (${email})`;
}
```

## 🔄 练习题

1. **数组操作**：使用解构赋值实现数组的头尾分离
2. **对象转换**：将嵌套对象扁平化
3. **函数参数**：重构一个接受多个参数的函数，使用解构参数
4. **API处理**：处理复杂的API响应数据结构
5. **配置合并**：实现配置对象的深度合并功能

解构赋值让我们的代码更加简洁和易读，是现代JavaScript开发的重要技能！ 