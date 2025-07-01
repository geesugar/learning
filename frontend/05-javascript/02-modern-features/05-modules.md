# 模块系统

> 现代JavaScript的代码组织和重用机制

## 🎯 学习目标

- 理解ES6模块的基本概念和语法
- 掌握import和export的各种用法
- 学会模块化项目的组织结构
- 了解动态导入和模块打包
- 对比CommonJS和ES6模块的异同

## 📖 核心内容

### 1. 基本模块语法

#### 1.1 导出（Export）

```javascript
// math.js - 命名导出
export const PI = 3.14159;
export const E = 2.71828;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

export class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(num) {
        this.result += num;
        return this;
    }
    
    multiply(num) {
        this.result *= num;
        return this;
    }
    
    getResult() {
        return this.result;
    }
}

// 批量导出
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };

// 重命名导出
const pow = (base, exponent) => Math.pow(base, exponent);
export { pow as power };
```

#### 1.2 默认导出（Default Export）

```javascript
// logger.js - 默认导出
class Logger {
    constructor(name) {
        this.name = name;
    }
    
    log(message) {
        console.log(`[${this.name}] ${message}`);
    }
    
    error(message) {
        console.error(`[${this.name}] ERROR: ${message}`);
    }
    
    warn(message) {
        console.warn(`[${this.name}] WARN: ${message}`);
    }
}

export default Logger;

// 或者直接导出
export default class Logger {
    // ... 类定义
}

// 函数默认导出
export default function createLogger(name) {
    return new Logger(name);
}

// 简单值默认导出
export default 42;
```

#### 1.3 混合导出

```javascript
// utils.js - 混合导出
// 默认导出
export default function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// 命名导出
export const version = '1.0.0';

export function formatTime(date) {
    return date.toTimeString().split(' ')[0];
}

export class DateUtils {
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    static isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }
}
```

### 2. 导入（Import）

#### 2.1 命名导入

```javascript
// app.js - 导入使用
import { PI, add, multiply, Calculator } from './math.js';

console.log(PI); // 3.14159
console.log(add(5, 3)); // 8

const calc = new Calculator();
const result = calc.add(10).multiply(2).getResult();
console.log(result); // 20

// 重命名导入
import { subtract as minus, divide } from './math.js';
console.log(minus(10, 3)); // 7

// 批量导入
import * as MathUtils from './math.js';
console.log(MathUtils.PI);
console.log(MathUtils.add(1, 2));
```

#### 2.2 默认导入

```javascript
// main.js - 默认导入
import Logger from './logger.js';

const logger = new Logger('MyApp');
logger.log('Application started');
logger.error('Something went wrong');

// 默认导入可以随意命名
import MyLogger from './logger.js';
import createLogger from './logger.js';

const appLogger = new MyLogger('App');
const systemLogger = createLogger('System');
```

#### 2.3 混合导入

```javascript
// main.js - 混合导入
import formatDate, { version, formatTime, DateUtils } from './utils.js';

console.log(version); // 1.0.0

const now = new Date();
console.log(formatDate(now)); // 2023-12-01
console.log(formatTime(now)); // 15:30:45

const tomorrow = DateUtils.addDays(now, 1);
console.log(DateUtils.isWeekend(tomorrow));

// 混合导入的其他形式
import defaultExport, * as namedExports from './utils.js';
import defaultExport, { named1, named2 } from './utils.js';
```

### 3. 高级模块特性

#### 3.1 重新导出（Re-export）

```javascript
// index.js - 统一导出入口
export { add, multiply, subtract, divide } from './math.js';
export { default as Logger } from './logger.js';
export * from './utils.js';

// 重命名重新导出
export { Calculator as AdvancedCalculator } from './math.js';

// 默认导出重新导出
export { default as formatDate } from './utils.js';

// 全部重新导出但排除某些
export * from './constants.js';
export { PI, E } from './constants.js'; // 只导出特定的
```

#### 3.2 动态导入

```javascript
// 动态导入 - 异步加载模块
async function loadMathModule() {
    try {
        const mathModule = await import('./math.js');
        
        console.log(mathModule.PI);
        console.log(mathModule.add(5, 3));
        
        const calc = new mathModule.Calculator();
        return calc;
    } catch (error) {
        console.error('Failed to load math module:', error);
    }
}

// 条件性导入
async function loadFeature(featureName) {
    let module;
    
    switch (featureName) {
        case 'charts':
            module = await import('./charts.js');
            break;
        case 'analytics':
            module = await import('./analytics.js');
            break;
        default:
            throw new Error(`Unknown feature: ${featureName}`);
    }
    
    return module;
}

// 在事件处理中动态导入
document.getElementById('loadChartsBtn').addEventListener('click', async () => {
    const { Chart } = await import('./charts.js');
    const chart = new Chart('#chart-container');
    chart.render();
});

// Promise 形式的动态导入
import('./logger.js')
    .then(module => {
        const Logger = module.default;
        const logger = new Logger('Dynamic');
        logger.log('Module loaded dynamically');
    })
    .catch(error => {
        console.error('Dynamic import failed:', error);
    });
```

#### 3.3 导入断言（Import Assertions）

```javascript
// 导入JSON文件（实验性特性）
import config from './config.json' assert { type: 'json' };
console.log(config.apiUrl);

// 导入CSS文件（实验性特性）
import styles from './styles.css' assert { type: 'css' };
```

### 4. 模块化项目结构

#### 4.1 基本项目结构

```
src/
├── components/
│   ├── Button.js
│   ├── Modal.js
│   └── index.js
├── utils/
│   ├── math.js
│   ├── string.js
│   ├── date.js
│   └── index.js
├── services/
│   ├── api.js
│   ├── auth.js
│   └── index.js
├── constants/
│   ├── config.js
│   ├── urls.js
│   └── index.js
└── main.js
```

#### 4.2 组件模块示例

```javascript
// components/Button.js
export default class Button {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...Button.defaultOptions, ...options };
        this.init();
    }
    
    static defaultOptions = {
        variant: 'primary',
        size: 'medium',
        disabled: false
    };
    
    init() {
        this.element.classList.add('btn', `btn-${this.options.variant}`, `btn-${this.options.size}`);
        
        if (this.options.disabled) {
            this.element.disabled = true;
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('click', (e) => {
            if (this.options.onClick) {
                this.options.onClick(e);
            }
        });
    }
    
    enable() {
        this.element.disabled = false;
        return this;
    }
    
    disable() {
        this.element.disabled = true;
        return this;
    }
}

// components/Modal.js
export default class Modal {
    constructor(options = {}) {
        this.options = { ...Modal.defaultOptions, ...options };
        this.isOpen = false;
        this.element = null;
        this.overlay = null;
    }
    
    static defaultOptions = {
        title: '',
        content: '',
        closable: true,
        width: '500px',
        height: 'auto'
    };
    
    create() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.element.innerHTML = `
            <div class="modal-header">
                <h3>${this.options.title}</h3>
                ${this.options.closable ? '<button class="modal-close">&times;</button>' : ''}
            </div>
            <div class="modal-body">
                ${this.options.content}
            </div>
        `;
        
        this.overlay.appendChild(this.element);
        this.bindEvents();
        
        return this;
    }
    
    bindEvents() {
        if (this.options.closable) {
            const closeBtn = this.element.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => this.close());
            
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
    }
    
    open() {
        if (!this.element) {
            this.create();
        }
        
        document.body.appendChild(this.overlay);
        this.isOpen = true;
        
        // 动画效果
        requestAnimationFrame(() => {
            this.overlay.classList.add('modal-show');
        });
        
        return this;
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.overlay.classList.remove('modal-show');
        
        setTimeout(() => {
            if (this.overlay.parentNode) {
                document.body.removeChild(this.overlay);
            }
            this.isOpen = false;
        }, 300);
        
        return this;
    }
}

// components/index.js - 统一导出
export { default as Button } from './Button.js';
export { default as Modal } from './Modal.js';

// 或者使用对象形式
import Button from './Button.js';
import Modal from './Modal.js';

export {
    Button,
    Modal
};
```

#### 4.3 服务模块示例

```javascript
// services/api.js
class ApiService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }
    
    setAuthToken(token) {
        this.defaultHeaders.Authorization = `Bearer ${token}`;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        
        return this.request(url.pathname + url.search);
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// 创建单例实例
const api = new ApiService('/api');

export default api;

// 也可以导出类本身
export { ApiService };

// services/auth.js
import api from './api.js';

class AuthService {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('token');
        
        if (this.token) {
            api.setAuthToken(this.token);
        }
    }
    
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            this.token = response.token;
            this.user = response.user;
            
            localStorage.setItem('token', this.token);
            api.setAuthToken(this.token);
            
            return response;
        } catch (error) {
            throw new Error('Login failed');
        }
    }
    
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
        }
    }
    
    async getCurrentUser() {
        if (!this.token) return null;
        
        try {
            const user = await api.get('/auth/me');
            this.user = user;
            return user;
        } catch (error) {
            this.logout(); // Token可能已过期
            return null;
        }
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    getUser() {
        return this.user;
    }
}

const auth = new AuthService();
export default auth;

// services/index.js
export { default as api } from './api.js';
export { default as auth } from './auth.js';
```

### 5. 模块系统对比

#### 5.1 CommonJS vs ES6 Modules

```javascript
// CommonJS (Node.js传统方式)
// math.js
const PI = 3.14159;

function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

// 导出
module.exports = {
    PI,
    add,
    multiply
};

// 或者单独导出
exports.PI = PI;
exports.add = add;
exports.multiply = multiply;

// 默认导出
module.exports = add;

// app.js - 导入
const math = require('./math');
const { PI, add } = require('./math');

// ES6 Modules
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }

// app.js
import { PI, add } from './math.js';
import * as math from './math.js';
```

#### 5.2 主要区别

| 特性 | CommonJS | ES6 Modules |
|------|----------|-------------|
| 语法 | require/module.exports | import/export |
| 加载时机 | 运行时 | 编译时 |
| 加载方式 | 同步 | 异步 |
| 作用域 | 函数作用域 | 模块作用域 |
| this指向 | module.exports | undefined |
| 循环依赖处理 | 部分加载 | 更好的支持 |
| 静态分析 | 困难 | 容易 |
| Tree Shaking | 不支持 | 支持 |

## 🎯 实际应用示例

### 示例1：组件库结构

```javascript
// components/Button.js
export default class Button {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...Button.defaultOptions, ...options };
        this.init();
    }
    
    static defaultOptions = {
        variant: 'primary',
        size: 'medium',
        disabled: false
    };
    
    init() {
        this.element.classList.add('btn', `btn-${this.options.variant}`, `btn-${this.options.size}`);
        
        if (this.options.disabled) {
            this.element.disabled = true;
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('click', (e) => {
            if (this.options.onClick) {
                this.options.onClick(e);
            }
        });
    }
    
    enable() {
        this.element.disabled = false;
        return this;
    }
    
    disable() {
        this.element.disabled = true;
        return this;
    }
}

// components/index.js - 统一导出
export { default as Button } from './Button.js';
export { default as Modal } from './Modal.js';
export { default as Table } from './Table.js';

// 或者使用对象形式
import Button from './Button.js';
import Modal from './Modal.js';
import Table from './Table.js';

export {
    Button,
    Modal,
    Table
};
```

### 示例2：API服务模块

```javascript
// services/api.js
class ApiService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }
    
    setAuthToken(token) {
        this.defaultHeaders.Authorization = `Bearer ${token}`;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        
        return this.request(url.pathname + url.search);
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// 创建单例实例
const api = new ApiService('/api');

export default api;

// 也可以导出类本身
export { ApiService };
```

### 示例3：插件系统

```javascript
// plugins/PluginManager.js
export default class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }
    
    async registerPlugin(name, pluginPath) {
        try {
            const pluginModule = await import(pluginPath);
            const plugin = new pluginModule.default();
            
            this.plugins.set(name, plugin);
            
            // 注册插件的钩子
            if (plugin.hooks) {
                Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
                    this.addHook(hookName, handler);
                });
            }
            
            // 调用插件初始化
            if (plugin.init) {
                await plugin.init();
            }
            
            console.log(`Plugin ${name} registered successfully`);
        } catch (error) {
            console.error(`Failed to register plugin ${name}:`, error);
        }
    }
    
    addHook(name, handler) {
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name).push(handler);
    }
    
    async executeHook(name, ...args) {
        const handlers = this.hooks.get(name) || [];
        const results = [];
        
        for (const handler of handlers) {
            try {
                const result = await handler(...args);
                results.push(result);
            } catch (error) {
                console.error(`Hook ${name} handler failed:`, error);
            }
        }
        
        return results;
    }
    
    getPlugin(name) {
        return this.plugins.get(name);
    }
    
    getPlugins() {
        return Array.from(this.plugins.keys());
    }
}

// 使用插件系统
import PluginManager from './plugins/PluginManager.js';

const pluginManager = new PluginManager();

// 注册插件
await pluginManager.registerPlugin('theme', './plugins/ThemePlugin.js');
await pluginManager.registerPlugin('analytics', './plugins/AnalyticsPlugin.js');

// 执行钩子
await pluginManager.executeHook('app:init');
```

## 🎁 最佳实践

1. **使用一致的导入/导出风格**：团队统一规范
2. **避免循环依赖**：合理设计模块结构
3. **使用索引文件**：方便统一导入
4. **动态导入优化**：按需加载大型模块
5. **模块命名规范**：清晰的文件和导出命名

## 🔄 练习题

1. **创建一个工具库**：包含多个实用函数模块
2. **构建插件系统**：支持动态加载和卸载插件
3. **设计状态管理**：使用模块化的状态管理系统
4. **实现国际化模块**：支持多语言动态切换

模块系统让我们的代码更有组织性和可维护性！ 
模块系统让我们的代码更有组织性和可维护性！ 