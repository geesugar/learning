# 开发环境搭建

> 配置完善的 JavaScript 开发环境，提升编程效率

## 🎯 学习目标

- 掌握 JavaScript 的运行环境
- 配置现代化的开发工具
- 学会使用浏览器开发者工具
- 创建第一个 JavaScript 项目

## 🌐 JavaScript 运行环境

### 浏览器环境
JavaScript 最初就是为浏览器设计的，所有现代浏览器都内置了 JavaScript 引擎：

| 浏览器 | JavaScript 引擎 | 特点 |
|--------|----------------|------|
| Chrome | V8 | 性能最佳，开发工具强大 |
| Firefox | SpiderMonkey | 开源，标准兼容性好 |
| Safari | JavaScriptCore | 苹果生态优化 |
| Edge | V8 | 基于 Chromium |

### Node.js 环境
Node.js 让 JavaScript 可以在服务器端运行，基于 Chrome 的 V8 引擎：

```javascript
// 浏览器中
console.log('Hello from Browser!');
alert('浏览器弹窗');

// Node.js 中
console.log('Hello from Node.js!');
const fs = require('fs'); // 文件系统操作
```

## 💻 开发工具安装

### 1. Node.js 安装

#### 官方安装（推荐）
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（长期支持版本）
3. 运行安装程序，按默认设置安装

#### 验证安装
```bash
# 检查 Node.js 版本
node --version
# 应该显示类似：v18.17.0

# 检查 npm 版本
npm --version
# 应该显示类似：9.6.7

# 测试 Node.js
node -e "console.log('Node.js 安装成功！')"
```

#### 使用版本管理器（高级用户）
```bash
# macOS/Linux 使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts

# Windows 使用 nvm-windows
# 下载安装 https://github.com/coreybutler/nvm-windows
nvm install lts
nvm use lts
```

### 2. 代码编辑器配置

#### VS Code（强烈推荐）

**安装 VS Code**
1. 访问 [VS Code 官网](https://code.visualstudio.com/)
2. 下载并安装适合你系统的版本

**必装插件**
```bash
# JavaScript 开发插件
- JavaScript (ES6) code snippets
- ESLint
- Prettier - Code formatter
- Live Server
- Bracket Pair Colorizer
- Auto Rename Tag
- Path Intellisense
```

**VS Code 配置文件**
创建 `.vscode/settings.json`：
```json
{
    "editor.fontSize": 14,
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "javascript.suggest.autoImports": true,
    "javascript.updateImportsOnFileMove.enabled": "always",
    "emmet.includeLanguages": {
        "javascript": "javascriptreact"
    },
    "files.associations": {
        "*.js": "javascript"
    }
}
```

#### 其他优秀编辑器
- **WebStorm**：JetBrains 出品，功能强大
- **Sublime Text**：轻量快速
- **Atom**：GitHub 出品，可定制性强

### 3. 浏览器开发工具

#### Chrome DevTools（推荐）
```javascript
// 打开开发者工具的方式
// 1. 按 F12 键
// 2. 右键 → 检查元素
// 3. Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)

// Console 面板使用
console.log('普通日志');
console.warn('警告信息');
console.error('错误信息');
console.table([{name: '张三', age: 25}, {name: '李四', age: 30}]);

// 调试功能
debugger; // 设置断点
```

#### Firefox Developer Tools
Firefox 的开发工具在某些方面甚至比Chrome更好：
- 更好的CSS Grid调试
- 优秀的响应式设计模式
- 内置的性能分析工具

## 🚀 第一个 JavaScript 项目

### 1. 创建项目结构
```bash
# 创建项目目录
mkdir my-first-js-project
cd my-first-js-project

# 创建基本文件
touch index.html
touch script.js
touch style.css
mkdir assets
mkdir js
mkdir css
```

### 2. 基础 HTML 文件
创建 `index.html`：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的第一个 JavaScript 项目</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>欢迎来到 JavaScript 世界！</h1>
        <p id="welcome-message">正在加载...</p>
        <button id="click-me-btn">点击我！</button>
        <div id="output"></div>
    </div>

    <!-- JavaScript 文件 -->
    <script src="script.js"></script>
</body>
</html>
```

### 3. 基础 CSS 文件
创建 `style.css`：
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
    max-width: 500px;
    width: 90%;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
    margin-bottom: 1.5rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s;
}

button:hover {
    background: #5a6fd8;
}

#output {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 5px;
    min-height: 50px;
}
```

### 4. JavaScript 核心文件
创建 `script.js`：
```javascript
// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成！');
    
    // 更新欢迎消息
    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.textContent = '页面已准备就绪！开始你的 JavaScript 之旅吧！';
    
    // 获取按钮和输出区域
    const clickButton = document.getElementById('click-me-btn');
    const outputDiv = document.getElementById('output');
    
    // 点击计数器
    let clickCount = 0;
    
    // 按钮点击事件
    clickButton.addEventListener('click', function() {
        clickCount++;
        
        // 创建新的输出内容
        const currentTime = new Date().toLocaleTimeString();
        const message = `第 ${clickCount} 次点击！时间：${currentTime}`;
        
        // 更新输出区域
        outputDiv.innerHTML += `<p style="color: #667eea; margin: 5px 0;">${message}</p>`;
        
        // 特殊效果
        if (clickCount === 10) {
            outputDiv.innerHTML += `<p style="color: #e74c3c; font-weight: bold;">🎉 恭喜！你已经点击了10次！</p>`;
            clickButton.textContent = '重置计数器';
        } else if (clickCount > 10) {
            // 重置
            clickCount = 0;
            outputDiv.innerHTML = '';
            clickButton.textContent = '点击我！';
        }
        
        console.log(`按钮被点击了 ${clickCount} 次`);
    });
    
    // 显示浏览器信息
    const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled
    };
    
    console.log('浏览器信息:', browserInfo);
    
    // 简单的时钟功能
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.title = `${timeString} - JavaScript 项目`;
    }
    
    // 每秒更新时钟
    setInterval(updateClock, 1000);
    updateClock(); // 立即执行一次
});

// 全局函数示例
function greetUser(name = '朋友') {
    return `你好，${name}！欢迎学习 JavaScript！`;
}

// 在控制台中测试
console.log(greetUser());
console.log(greetUser('小明'));
```

### 5. 运行项目

#### 方法1：Live Server（推荐）
```bash
# 如果安装了 VS Code 的 Live Server 插件
# 1. 在 VS Code 中打开项目文件夹
# 2. 右键点击 index.html
# 3. 选择 "Open with Live Server"
```

#### 方法2：本地服务器
```bash
# 使用 Python (如果已安装)
python -m http.server 8000
# 或者 Python 3
python3 -m http.server 8000

# 使用 Node.js
npx http-server
# 或者全局安装
npm install -g http-server
http-server
```

#### 方法3：直接打开
```bash
# 直接用浏览器打开 index.html 文件
# 注意：某些功能可能受到同源策略限制
```

## 🛠️ 包管理器使用

### npm 基础使用
```bash
# 初始化项目
npm init -y

# 安装开发依赖
npm install --save-dev prettier eslint

# 安装生产依赖
npm install lodash axios

# 全局安装工具
npm install -g nodemon live-server

# 查看已安装包
npm list
```

### package.json 配置
```json
{
  "name": "my-first-js-project",
  "version": "1.0.0",
  "description": "我的第一个JavaScript项目",
  "main": "script.js",
  "scripts": {
    "start": "live-server",
    "dev": "nodemon script.js",
    "lint": "eslint *.js",
    "format": "prettier --write *.js"
  },
  "keywords": ["javascript", "learning", "beginner"],
  "author": "你的名字",
  "license": "MIT",
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.0.0"
  }
}
```

## 🔧 代码质量工具

### ESLint 配置
创建 `.eslintrc.js`：
```javascript
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
    }
};
```

### Prettier 配置
创建 `.prettierrc`：
```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4,
    "useTabs": false
}
```

## 🐞 调试技巧

### 1. Console 调试
```javascript
// 基本输出
console.log('调试信息');
console.warn('警告信息');
console.error('错误信息');

// 格式化输出
console.log('%c 这是彩色文字', 'color: red; font-size: 20px;');

// 对象输出
const user = { name: '张三', age: 25 };
console.table(user);
console.dir(user);

// 性能测试
console.time('性能测试');
// 一些代码...
console.timeEnd('性能测试');

// 堆栈跟踪
console.trace('调用堆栈');
```

### 2. 断点调试
```javascript
function complexFunction(data) {
    debugger; // 程序会在这里暂停
    
    let result = data.map(item => {
        debugger; // 可以设置多个断点
        return item * 2;
    });
    
    return result;
}
```

### 3. 错误处理
```javascript
try {
    // 可能出错的代码
    let result = riskyFunction();
    console.log('结果:', result);
} catch (error) {
    console.error('捕获到错误:', error.message);
    console.error('错误堆栈:', error.stack);
} finally {
    console.log('无论如何都会执行');
}
```

## 📚 常用开发工具

### 在线编辑器
- **CodePen**：https://codepen.io/ - 前端代码在线编辑
- **JSFiddle**：https://jsfiddle.net/ - JavaScript 调试工具
- **CodeSandbox**：https://codesandbox.io/ - 完整开发环境
- **Repl.it**：https://replit.com/ - 多语言在线IDE

### 文档和参考
- **MDN**：https://developer.mozilla.org/zh-CN/ - 权威参考文档
- **Can I Use**：https://caniuse.com/ - 浏览器兼容性查询
- **JavaScript.info**：https://javascript.info/ - 现代JS教程

### 实用工具
```bash
# 代码格式化
npx prettier --write .

# 代码检查
npx eslint .

# 实时重载
npx nodemon script.js

# 静态服务器
npx http-server
```

## 🎯 练习项目

### 项目1：个人名片页面
创建一个交互式的个人名片，包含：
- 个人信息展示
- 技能进度条动画
- 主题切换功能
- 联系方式展示

### 项目2：简单计算器
实现基本的计算器功能：
- 四则运算
- 清除功能
- 历史记录
- 键盘输入支持

### 项目3：待办事项列表
创建一个功能完整的TODO应用：
- 添加/删除任务
- 标记完成状态
- 本地存储数据
- 过滤和排序

## 🚀 下一步

环境搭建完成后，你将学习：
1. **基础语法** - JavaScript 语言规则
2. **数据类型** - 变量和数据操作
3. **控制流程** - 程序逻辑控制
4. **函数编程** - 代码组织和复用

---

## 💡 小贴士

- **选择合适的工具**：工具是为了提高效率，不要被工具绑架
- **多练习**：理论再好也要通过实践来巩固
- **善用控制台**：console.log 是你最好的调试朋友
- **阅读文档**：遇到问题先查官方文档
- **保持更新**：JavaScript 生态变化快，要跟上时代

开始你的 JavaScript 开发之旅吧！🎉 