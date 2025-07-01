# 开发环境搭建

> 搭建完整的 TypeScript 开发环境

## 🎯 目标

完成本节后，你将拥有一个完整的 TypeScript 开发环境：

- ✅ 安装 TypeScript 编译器
- ✅ 配置开发工具链
- ✅ 设置 IDE 和插件
- ✅ 创建第一个 TypeScript 项目

## 🛠️ 安装 TypeScript

### 方式一：全局安装（推荐初学者）

```bash
# 使用 npm 安装
npm install -g typescript

# 使用 yarn 安装
yarn global add typescript

# 使用 pnpm 安装
pnpm add -g typescript

# 验证安装
tsc --version
```

### 方式二：项目本地安装（推荐生产环境）

```bash
# 初始化项目
mkdir my-typescript-project
cd my-typescript-project
npm init -y

# 本地安装 TypeScript
npm install -D typescript

# 安装 ts-node 用于直接运行 TypeScript
npm install -D ts-node

# 验证安装
npx tsc --version
```

### TypeScript 版本选择

```bash
# 安装最新稳定版（推荐）
npm install -g typescript

# 安装特定版本
npm install -g typescript@4.9.5

# 安装 Beta 版本（尝鲜）
npm install -g typescript@beta
```

## ⚙️ 工具链安装

### 1. ts-node - 直接运行 TypeScript

```bash
# 全局安装
npm install -g ts-node

# 验证安装
ts-node --version

# 使用示例
echo 'console.log("Hello TypeScript!")' > hello.ts
ts-node hello.ts
```

### 2. nodemon - 自动重启开发服务器

```bash
# 安装 nodemon
npm install -g nodemon

# 配置自动重启 TypeScript 文件
nodemon --exec ts-node hello.ts
```

### 3. 类型定义包

```bash
# Node.js 类型定义
npm install -D @types/node

# 常用的类型定义包
npm install -D @types/express    # Express.js
npm install -D @types/lodash     # Lodash
npm install -D @types/react      # React
npm install -D @types/jest       # Jest 测试框架
```

## 🏗️ 项目初始化

### 创建 TypeScript 项目

```bash
# 1. 创建项目目录
mkdir my-first-ts-project
cd my-first-ts-project

# 2. 初始化 package.json
npm init -y

# 3. 安装 TypeScript 依赖
npm install -D typescript ts-node @types/node

# 4. 生成 TypeScript 配置文件
npx tsc --init
```

### 配置 package.json

```json
{
  "name": "my-first-ts-project",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "tsc --watch",
    "dev:watch": "nodemon --exec ts-node src/index.ts"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^4.9.0",
    "nodemon": "^2.0.20"
  }
}
```

### 项目目录结构

```
my-first-ts-project/
├── src/                 # TypeScript 源码
│   ├── index.ts        # 入口文件
│   ├── utils/          # 工具函数
│   └── types/          # 类型定义
├── dist/               # 编译输出（自动生成）
├── tests/              # 测试文件
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── README.md          # 项目说明
```

## 📝 TypeScript 配置文件

### 基础 tsconfig.json

```json
{
  "compilerOptions": {
    /* 基本选项 */
    "target": "ES2020",                    // 编译目标版本
    "module": "commonjs",                  // 模块系统
    "lib": ["ES2020"],                     // 包含的库文件
    "outDir": "./dist",                    // 输出目录
    "rootDir": "./src",                    // 根目录
    
    /* 严格类型检查选项 */
    "strict": true,                        // 启用所有严格类型检查选项
    "noImplicitAny": true,                // 不允许隐式 any 类型
    "strictNullChecks": true,             // 严格的 null 检查
    "strictFunctionTypes": true,          // 严格的函数类型检查
    
    /* 模块解析选项 */
    "moduleResolution": "node",           // 模块解析策略
    "baseUrl": "./",                      // 基础 URL
    "paths": {                            // 路径映射
      "@/*": ["src/*"]
    },
    
    /* 源码映射选项 */
    "sourceMap": true,                    // 生成 source map
    "declaration": true,                  // 生成 .d.ts 文件
    "declarationMap": true,              // 生成 .d.ts.map 文件
    
    /* 实验性选项 */
    "experimentalDecorators": true,       // 启用装饰器
    "emitDecoratorMetadata": true        // 装饰器元数据
  },
  "include": [
    "src/**/*"                           // 包含的文件
  ],
  "exclude": [
    "node_modules",                      // 排除的文件
    "dist",
    "tests/**/*"
  ]
}
```

### 不同环境的配置

#### 开发环境 (tsconfig.dev.json)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

#### 生产环境 (tsconfig.prod.json)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "declaration": false
  }
}
```

## 🎨 IDE 配置

### VS Code（强烈推荐）

#### 必装插件
- **TypeScript Importer** - 自动导入类型
- **Auto Rename Tag** - 自动重命名标签
- **Prettier** - 代码格式化
- **ESLint** - 代码检查
- **GitLens** - Git 增强

#### VS Code 配置
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

#### 任务配置
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "typescript",
      "tsconfig": "tsconfig.json",
      "option": "watch",
      "problemMatcher": ["$tsc-watch"],
      "group": "build",
      "label": "TypeScript: 监视 - tsconfig.json"
    }
  ]
}
```

### WebStorm 配置

1. **启用 TypeScript 服务**：Settings → Languages → TypeScript → Enable TypeScript service
2. **配置 Node.js**：Settings → Languages → Node.js → Node interpreter
3. **代码风格**：Settings → Editor → Code Style → TypeScript

### 其他 IDE

- **Vim/Neovim**：使用 CoC.nvim 插件
- **Emacs**：使用 tide 模式
- **Atom**：安装 atom-typescript 插件
- **Sublime Text**：安装 TypeScript 插件

## 🚀 第一个 TypeScript 程序

### 创建源文件

```typescript
// src/index.ts
interface User {
    id: number;
    name: string;
    email: string;
}

function createUser(name: string, email: string): User {
    return {
        id: Math.floor(Math.random() * 1000),
        name,
        email
    };
}

function greetUser(user: User): string {
    return `Hello, ${user.name}! Your email is ${user.email}`;
}

// 使用示例
const user = createUser("张三", "zhangsan@example.com");
console.log(greetUser(user));

export { User, createUser, greetUser };
```

### 编译和运行

```bash
# 方式一：编译后运行
npm run build      # 编译 TypeScript
npm start         # 运行编译后的 JavaScript

# 方式二：直接运行 TypeScript
npm run dev       # 使用 ts-node 直接运行

# 方式三：监视模式
npm run watch     # 监视文件变化并自动编译
npm run dev:watch # 监视文件变化并自动重启
```

## 🐛 常见问题和解决方案

### 1. 找不到模块错误

```bash
# 错误：Cannot find module 'xxx'
# 解决：安装类型定义
npm install -D @types/node
```

### 2. 编译错误：无法写入文件

```bash
# 错误：Cannot write file 'xxx' because it would overwrite input file
# 解决：检查 tsconfig.json 中的 outDir 配置
```

### 3. 导入路径问题

```typescript
// 错误的相对路径
import { utils } from '../../../utils/helper';

// 使用路径映射（在 tsconfig.json 中配置 paths）
import { utils } from '@/utils/helper';
```

### 4. 严格模式错误

```typescript
// 错误：Object is possibly 'null'
const element = document.getElementById('app'); // 可能为 null
element.innerHTML = 'Hello'; // 错误

// 解决方案1：类型断言
const element = document.getElementById('app')!;

// 解决方案2：类型守卫
const element = document.getElementById('app');
if (element) {
    element.innerHTML = 'Hello';
}
```

## 📦 项目模板

### 快速开始模板

```bash
# 使用官方模板
npx create-typescript-app my-app

# 使用社区模板
npx degit microsoft/TypeScript-Node-Starter my-node-app
```

### 自定义项目模板

```bash
# 克隆基础模板
git clone https://github.com/microsoft/TypeScript-Node-Starter.git
cd TypeScript-Node-Starter
npm install
```

## ✅ 环境检查清单

完成环境搭建后，检查以下项目：

- [ ] TypeScript 编译器已安装并可正常使用
- [ ] ts-node 可以直接运行 TypeScript 文件
- [ ] IDE 已配置 TypeScript 支持
- [ ] 项目结构清晰，配置文件完整
- [ ] 可以成功编译和运行 TypeScript 代码
- [ ] 代码格式化和检查工具正常工作

## 🎉 小结

现在你已经拥有了一个完整的 TypeScript 开发环境！你可以：

- 编写 TypeScript 代码
- 享受 IDE 的智能提示
- 实时看到类型错误
- 自动格式化代码
- 一键编译和运行

## 🚀 下一步

环境搭建完成后，让我们开始学习 TypeScript 的基础语法吧！

👉 **下一步：[基础语法](./03-basic-syntax.md)**

---

> 💡 **小贴士**：建议将这个开发环境配置保存为模板，以后创建新项目时可以快速复制使用。 