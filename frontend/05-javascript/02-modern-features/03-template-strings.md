# 模板字符串与字符串方法

> 现代JavaScript中的字符串处理艺术

## 🎯 学习目标

- 掌握模板字符串的基本语法和高级用法
- 学会使用标签模板进行自定义字符串处理
- 了解ES6+新增的字符串方法
- 在实际项目中应用现代字符串处理技巧

## 📖 核心内容

### 1. 模板字符串基础

#### 1.1 基本语法

```javascript
// 传统字符串拼接
const name = 'Alice';
const age = 30;
const message = 'Hello, ' + name + '! You are ' + age + ' years old.';

// 模板字符串
const messageTemplate = `Hello, ${name}! You are ${age} years old.`;
console.log(messageTemplate); // Hello, Alice! You are 30 years old.

// 支持任何表达式
const user = { name: 'Bob', age: 25 };
const greeting = `Welcome, ${user.name.toUpperCase()}!`;
console.log(greeting); // Welcome, BOB!

// 支持函数调用
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

const timeMessage = `Current time is: ${getCurrentTime()}`;
console.log(timeMessage); // Current time is: 3:45:30 PM
```

#### 1.2 多行字符串

```javascript
// 传统多行字符串（麻烦且不直观）
const htmlOld = '<div class="user-card">\n' +
               '  <h3>' + user.name + '</h3>\n' +
               '  <p>Age: ' + user.age + '</p>\n' +
               '</div>';

// 模板字符串的多行支持
const html = `
<div class="user-card">
  <h3>${user.name}</h3>
  <p>Age: ${user.age}</p>
  <p>Status: ${user.isOnline ? 'Online' : 'Offline'}</p>
</div>
`;

// 实际的HTML模板
function createUserCard(user) {
    return `
        <div class="user-card ${user.theme || 'light'}">
            <div class="user-avatar">
                <img src="${user.avatar || '/default-avatar.png'}" 
                     alt="${user.name}" />
            </div>
            <div class="user-info">
                <h3>${user.name}</h3>
                <p class="user-email">${user.email}</p>
                <div class="user-stats">
                    <span>Posts: ${user.posts || 0}</span>
                    <span>Followers: ${user.followers || 0}</span>
                </div>
            </div>
        </div>
    `;
}
```

#### 1.3 表达式和计算

```javascript
// 基本计算
const a = 10, b = 20;
console.log(`Sum: ${a + b}, Product: ${a * b}`); // Sum: 30, Product: 200

// 条件表达式
const user = { name: 'Alice', isAdmin: true };
const roleMessage = `User ${user.name} is ${user.isAdmin ? 'an admin' : 'a regular user'}`;

// 数组和对象操作
const numbers = [1, 2, 3, 4, 5];
const stats = `
Numbers: [${numbers.join(', ')}]
Count: ${numbers.length}
Sum: ${numbers.reduce((a, b) => a + b, 0)}
Average: ${numbers.reduce((a, b) => a + b, 0) / numbers.length}
`;

// 复杂表达式
const products = [
    { name: 'Laptop', price: 999, inStock: true },
    { name: 'Phone', price: 699, inStock: false },
    { name: 'Tablet', price: 399, inStock: true }
];

const productList = `
Available Products:
${products
    .filter(p => p.inStock)
    .map(p => `- ${p.name}: $${p.price}`)
    .join('\n')}

Total Value: $${products
    .filter(p => p.inStock)
    .reduce((sum, p) => sum + p.price, 0)}
`;
```

### 2. 标签模板

#### 2.1 基本标签模板

```javascript
// 基本标签函数
function highlight(strings, ...values) {
    console.log('Strings:', strings);
    console.log('Values:', values);
    
    return strings.reduce((result, string, i) => {
        const value = values[i] ? `<mark>${values[i]}</mark>` : '';
        return result + string + value;
    }, '');
}

const name = 'Alice';
const age = 30;
const highlighted = highlight`Hello, ${name}! You are ${age} years old.`;
console.log(highlighted);
// Strings: ['Hello, ', '! You are ', ' years old.']
// Values: ['Alice', 30]
// Hello, <mark>Alice</mark>! You are <mark>30</mark> years old.
```

#### 2.2 实用标签模板示例

```javascript
// HTML 转义标签
function html(strings, ...values) {
    function escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    return strings.reduce((result, string, i) => {
        const value = values[i] !== undefined ? escape(String(values[i])) : '';
        return result + string + value;
    }, '');
}

const userInput = '<script>alert("XSS")</script>';
const safeHtml = html`<div>User said: ${userInput}</div>`;
console.log(safeHtml); // <div>User said: &lt;script&gt;alert("XSS")&lt;/script&gt;</div>

// SQL 查询标签（模拟）
function sql(strings, ...values) {
    return {
        query: strings.join('?'),
        params: values
    };
}

const userId = 123;
const userName = 'Alice';
const query = sql`SELECT * FROM users WHERE id = ${userId} AND name = ${userName}`;
console.log(query);
// { query: 'SELECT * FROM users WHERE id = ? AND name = ?', params: [123, 'Alice'] }

// 国际化标签
const translations = {
    'hello': '你好',
    'goodbye': '再见',
    'welcome': '欢迎'
};

function i18n(strings, ...values) {
    const key = strings.join('').trim();
    const translation = translations[key] || key;
    
    return values.reduce((result, value, i) => {
        return result.replace(`{${i}}`, value);
    }, translation);
}

// 使用时需要预定义翻译
function t(key, ...values) {
    const template = translations[key] || key;
    return values.reduce((result, value, i) => {
        return result.replace(`{${i}}`, value);
    }, template);
}

console.log(t('hello')); // 你好
```

#### 2.3 高级标签模板应用

```javascript
// CSS-in-JS 样式标签
function css(strings, ...values) {
    const styles = strings.reduce((result, string, i) => {
        const value = values[i] || '';
        return result + string + value;
    }, '');
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return styleElement;
}

const primaryColor = '#007bff';
const fontSize = '16px';

const styles = css`
    .button {
        background-color: ${primaryColor};
        font-size: ${fontSize};
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        color: white;
        cursor: pointer;
    }
    
    .button:hover {
        background-color: ${primaryColor}dd;
    }
`;

// GraphQL 查询标签
function gql(strings, ...values) {
    return strings.reduce((result, string, i) => {
        const value = values[i] || '';
        return result + string + value;
    }, '').trim();
}

const getUserQuery = gql`
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            name
            email
            posts {
                title
                content
            }
        }
    }
`;

// 模板字符串构建器
class TemplateBuilder {
    constructor() {
        this.templates = new Map();
    }
    
    register(name, template) {
        this.templates.set(name, template);
        return this;
    }
    
    render(name, data = {}) {
        const template = this.templates.get(name);
        if (!template) {
            throw new Error(`Template "${name}" not found`);
        }
        
        return template(data);
    }
    
    tag(strings, ...values) {
        return (data = {}) => {
            return strings.reduce((result, string, i) => {
                let value = values[i];
                if (typeof value === 'function') {
                    value = value(data);
                } else if (typeof value === 'string' && value.startsWith('$')) {
                    value = data[value.slice(1)] || '';
                }
                return result + string + (value || '');
            }, '');
        };
    }
}

const builder = new TemplateBuilder();
const template = builder.tag`Hello, ${data => data.name}! Today is ${'date'}.`;
console.log(template({ name: 'Alice', date: '2023-12-01' }));
```

### 3. ES6+ 字符串方法

#### 3.1 查找和检测方法

```javascript
const str = 'Hello, World! Welcome to JavaScript!';

// startsWith() - 检查字符串是否以指定内容开头
console.log(str.startsWith('Hello')); // true
console.log(str.startsWith('World', 7)); // true (从索引7开始检查)

// endsWith() - 检查字符串是否以指定内容结尾
console.log(str.endsWith('!')); // true
console.log(str.endsWith('World', 13)); // true (只检查前13个字符)

// includes() - 检查字符串是否包含指定内容
console.log(str.includes('World')); // true
console.log(str.includes('Python')); // false

// 实际应用示例
function validateEmail(email) {
    return email.includes('@') && 
           email.includes('.') && 
           !email.startsWith('@') && 
           !email.endsWith('@');
}

function getFileExtension(filename) {
    if (!filename.includes('.')) return '';
    return filename.slice(filename.lastIndexOf('.') + 1);
}

function isImageFile(filename) {
    const ext = getFileExtension(filename).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}
```

#### 3.2 重复和填充方法

```javascript
// repeat() - 重复字符串
console.log('Hello '.repeat(3)); // "Hello Hello Hello "
console.log('='.repeat(50)); // "=================================================="

// padStart() - 在字符串开头填充
console.log('5'.padStart(3, '0')); // "005"
console.log('Hello'.padStart(10, '*')); // "*****Hello"

// padEnd() - 在字符串结尾填充
console.log('5'.padEnd(3, '0')); // "500"
console.log('Hello'.padEnd(10, '*')); // "Hello*****"

// 实际应用示例
function formatNumber(num, width = 3) {
    return String(num).padStart(width, '0');
}

function formatTableColumn(text, width = 15, align = 'left') {
    const str = String(text);
    if (str.length >= width) return str.slice(0, width);
    
    switch (align) {
        case 'left':
            return str.padEnd(width, ' ');
        case 'right':
            return str.padStart(width, ' ');
        case 'center':
            const padding = width - str.length;
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
        default:
            return str.padEnd(width, ' ');
    }
}

// 生成表格
function createTable(data, headers) {
    const colWidth = 15;
    
    // 表头
    const headerRow = headers.map(h => formatTableColumn(h, colWidth, 'center')).join('|');
    const separator = '='.repeat(headers.length * (colWidth + 1) - 1);
    
    // 数据行
    const dataRows = data.map(row => 
        headers.map(header => formatTableColumn(row[header], colWidth)).join('|')
    );
    
    return [headerRow, separator, ...dataRows].join('\n');
}

const users = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
    { name: 'Charlie', age: 35, city: 'Chicago' }
];

console.log(createTable(users, ['name', 'age', 'city']));
```

#### 3.3 字符串模式匹配增强

```javascript
// matchAll() - 获取所有匹配结果
const text = 'The price is $29.99 and the tax is $2.50';
const priceRegex = /\$(\d+\.?\d*)/g;

// 传统方式
const matches = [];
let match;
while ((match = priceRegex.exec(text)) !== null) {
    matches.push(match);
}

// 使用 matchAll()
const allMatches = [...text.matchAll(priceRegex)];
console.log(allMatches); // 返回所有匹配的迭代器

// 提取所有价格
const prices = [...text.matchAll(priceRegex)].map(match => parseFloat(match[1]));
console.log(prices); // [29.99, 2.5]

// 实际应用：解析模板变量
function parseTemplate(template) {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = [...template.matchAll(variableRegex)].map(match => match[1]);
    return variables;
}

const template = 'Hello {{name}}, your order {{orderId}} is ready!';
console.log(parseTemplate(template)); // ['name', 'orderId']
```

## 🎯 实际应用示例

### 示例1：HTML模板生成

```javascript
// 组件化HTML生成
class Component {
    constructor(props = {}) {
        this.props = props;
    }
    
    static create(props) {
        return new this(props);
    }
    
    render() {
        throw new Error('render method must be implemented');
    }
    
    toString() {
        return this.render();
    }
}

class Button extends Component {
    render() {
        const { text, type = 'button', className = '', disabled = false } = this.props;
        
        return `
            <button 
                type="${type}"
                class="btn ${className}"
                ${disabled ? 'disabled' : ''}
            >
                ${text}
            </button>
        `;
    }
}

class Card extends Component {
    render() {
        const { title, content, actions = [], className = '' } = this.props;
        
        return `
            <div class="card ${className}">
                ${title ? `<div class="card-header">${title}</div>` : ''}
                <div class="card-body">${content}</div>
                ${actions.length > 0 ? `
                    <div class="card-actions">
                        ${actions.map(action => action.toString()).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// 使用组件
const saveButton = Button.create({ text: 'Save', type: 'submit', className: 'btn-primary' });
const cancelButton = Button.create({ text: 'Cancel', className: 'btn-secondary' });

const userCard = Card.create({
    title: 'User Profile',
    content: 'Edit your profile information below.',
    actions: [saveButton, cancelButton]
});
```

### 示例2：配置文件生成

```javascript
// 配置文件模板
function generateConfig(options) {
    const {
        appName,
        version,
        environment = 'development',
        database = {},
        server = {},
        features = {}
    } = options;
    
    return `
# ${appName} Configuration
# Version: ${version}
# Environment: ${environment}
# Generated on: ${new Date().toISOString()}

[app]
name = "${appName}"
version = "${version}"
environment = "${environment}"

[server]
host = "${server.host || 'localhost'}"
port = ${server.port || 3000}
${server.ssl ? `
ssl = true
cert_file = "${server.ssl.cert}"
key_file = "${server.ssl.key}"` : ''}

[database]
type = "${database.type || 'postgresql'}"
host = "${database.host || 'localhost'}"
port = ${database.port || 5432}
name = "${database.name || appName}"
${database.pool ? `
[database.pool]
min = ${database.pool.min || 5}
max = ${database.pool.max || 20}` : ''}

[features]
${Object.entries(features).map(([key, value]) => `${key} = ${value}`).join('\n')}

[logging]
level = "${environment === 'production' ? 'info' : 'debug'}"
format = "json"
    `.trim();
}

// 使用配置生成器
const config = generateConfig({
    appName: 'MyApp',
    version: '1.0.0',
    environment: 'production',
    database: {
        type: 'postgresql',
        host: 'db.example.com',
        port: 5432,
        name: 'myapp_prod',
        pool: { min: 10, max: 50 }
    },
    server: {
        host: '0.0.0.0',
        port: 8080,
        ssl: {
            cert: '/path/to/cert.pem',
            key: '/path/to/key.pem'
        }
    },
    features: {
        authentication: true,
        caching: true,
        compression: false
    }
});

console.log(config);
```

## 🎁 最佳实践

### 1. 模板字符串使用建议

```javascript
// ✅ 适合使用模板字符串的场景
const message = `Hello, ${name}!`;
const html = `<div>${content}</div>`;
const multiline = `
    Line 1
    Line 2
    Line 3
`;

// ❌ 不必要的模板字符串
const simple = `Hello World`; // 应该用普通字符串
const noInterpolation = `Fixed text without variables`; // 应该用普通字符串
```

### 2. 性能考虑

```javascript
// ✅ 缓存模板函数
const createUserTemplate = (user) => `
    <div class="user">
        <h3>${user.name}</h3>
        <p>${user.email}</p>
    </div>
`;

// ❌ 避免在循环中重复创建复杂模板
const users = [...];
const html = users.map(user => {
    // 避免在这里定义复杂的模板逻辑
    return createUserTemplate(user);
}).join('');
```

### 3. 安全考虑

```javascript
// ✅ 对用户输入进行转义
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const userInput = '<script>alert("xss")</script>';
const safeHtml = `<div>User said: ${escapeHtml(userInput)}</div>`;
```

## 🔄 练习题

1. **HTML生成器**：创建一个表格生成器，支持动态列和样式
2. **配置解析器**：解析INI格式的配置文件
3. **模板引擎**：实现一个简单的模板引擎，支持变量替换和循环
4. **SQL构建器**：扩展查询构建器，支持INSERT、UPDATE、DELETE操作
5. **国际化工具**：创建支持模板字符串的国际化系统

现代字符串处理让我们的代码更加优雅和强大！ 