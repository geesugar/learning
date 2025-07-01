# JavaScript 基础示例

> 通过实际代码学习 JavaScript 基础知识

## 📋 示例文件列表

### 1. 变量与数据类型 (`01-variables-types.js`)
- **主要内容**：变量声明、数据类型、类型转换
- **知识点**：
  - `var`、`let`、`const` 的区别
  - 8种基本数据类型详解
  - 类型检测和转换方法
  - 变量作用域和提升
- **示例**：数据验证、类型转换实战
- **文件大小**：13KB，371行代码

### 2. 运算符与表达式 (`02-operators-expressions.js`)
- **主要内容**：各种运算符的使用和表达式求值
- **知识点**：
  - 算术、赋值、比较、逻辑运算符
  - 递增递减、条件运算符
  - 类型运算符和位运算符
  - 运算符优先级和结合性
- **示例**：表达式计算器、实用运算技巧
- **文件大小**：16KB，478行代码

### 3. 控制流程 (`03-control-flow.js`)
- **主要内容**：程序流程控制和逻辑结构
- **知识点**：
  - 条件语句（if/else、switch）
  - 循环语句（for、while、for...of）
  - 跳转语句（break、continue）
  - 异常处理基础
- **示例**：成绩处理系统、猜数字游戏、九九乘法表
- **文件大小**：7.8KB，289行代码

### 4. 函数编程 (`04-functions.js`)
- **主要内容**：函数的定义、调用和高级特性
- **知识点**：
  - 函数声明vs表达式、箭头函数
  - 参数处理、默认参数、剩余参数
  - 作用域、闭包、IIFE
  - 高阶函数、函数式编程
  - 递归函数、curry化
- **示例**：计算器、管道函数、防抖函数、记忆化
- **文件大小**：18KB，659行代码

### 5. 对象与数组 (`05-objects-arrays.js`)
- **主要内容**：复杂数据结构的操作和管理
- **知识点**：
  - 对象创建、访问、解构、合并
  - 数组操作、遍历、转换方法
  - 多维数组、类数组对象
  - 数组排序、查找、过滤
  - 数据处理和算法实现
- **示例**：学生成绩管理、数据统计分析、实用工具函数
- **文件大小**：21KB，707行代码

### 6. 错误处理与调试 (`06-error-handling.js`)
- **主要内容**：错误处理机制和调试技巧
- **知识点**：
  - JavaScript错误类型详解
  - try...catch...finally语句
  - 自定义错误类型
  - 异步错误处理
  - 调试技巧和工具
  - 错误日志和监控
  - 重试和降级策略
- **示例**：用户服务、错误日志系统、健壮性处理
- **文件大小**：18KB，648行代码

## 🚀 运行方式

### 方法1：Node.js 环境运行（推荐）
```bash
# 进入示例目录
cd frontend/05-javascript/examples/basic

# 运行单个文件
node 01-variables-types.js
node 02-operators-expressions.js
node 03-control-flow.js
node 04-functions.js
node 05-objects-arrays.js
node 06-error-handling.js

# 批量运行所有示例
for file in *.js; do echo "=== 运行 $file ==="; node "$file"; echo; done
```

### 方法2：浏览器中运行
```html
<!DOCTYPE html>
<html>
<head>
    <title>JavaScript 基础示例</title>
</head>
<body>
    <h1>JavaScript 基础示例</h1>
    <p>打开开发者工具查看输出结果</p>
    
    <!-- 按需加载示例文件 -->
    <script src="01-variables-types.js"></script>
    <!-- <script src="02-operators-expressions.js"></script> -->
    <!-- <script src="03-control-flow.js"></script> -->
    <!-- 其他文件... -->
</body>
</html>
```

### 方法3：在线编辑器
- **CodePen**：复制代码到 https://codepen.io/
- **JSFiddle**：复制代码到 https://jsfiddle.net/
- **CodeSandbox**：创建项目 https://codesandbox.io/

## 🎯 学习建议

### 基础学习路径
1. **先学理论**：阅读对应章节的文档
2. **运行代码**：执行示例文件，观察输出
3. **修改实验**：改变参数，测试不同情况
4. **独立练习**：完成文件末尾的练习题
5. **项目实践**：结合所学知识做小项目

### 进阶学习建议
```javascript
// 推荐学习顺序
const learningPath = [
    '01-variables-types.js',    // 基础：变量和类型
    '02-operators-expressions.js', // 基础：运算符
    '03-control-flow.js',       // 核心：程序逻辑
    '04-functions.js',          // 重点：函数编程
    '05-objects-arrays.js',     // 重点：数据结构
    '06-error-handling.js'      // 实用：错误处理
];

// 学习重点
const focusAreas = {
    beginner: ['变量作用域', '数据类型', '基本语法'],
    intermediate: ['函数编程', '数组方法', '对象操作'],
    advanced: ['闭包', '高阶函数', '错误处理', '性能优化']
};
```

## 🔧 调试技巧

### 1. 使用 console 调试
```javascript
console.log('普通输出:', variable);
console.dir(object);           // 详细对象信息
console.table(array);          // 表格显示数组
console.time('operation');     // 性能计时开始
console.timeEnd('operation');  // 性能计时结束
console.trace();              // 堆栈跟踪
```

### 2. 浏览器开发者工具
- **F12** 打开开发者工具
- **Console** 面板查看输出
- **Sources** 面板设置断点
- **Network** 面板查看网络请求

### 3. Node.js 调试
```bash
# 启用调试模式
node --inspect 01-variables-types.js

# 使用调试器
node --inspect-brk 01-variables-types.js
```

## 💡 实践挑战

### 基础挑战
1. **计算器应用**：使用函数和运算符创建简单计算器
2. **成绩管理**：使用数组和对象管理学生成绩
3. **数据验证**：创建表单验证函数
4. **排序算法**：实现冒泡排序、快速排序

### 进阶挑战
1. **Mini框架**：创建简单的数据绑定框架
2. **工具库**：开发常用的工具函数集合
3. **状态管理**：实现简单的状态管理器
4. **错误监控**：构建错误收集和上报系统

## 📊 代码统计

| 文件 | 大小 | 行数 | 主要特性 |
|------|------|------|----------|
| 01-variables-types.js | 13KB | 371行 | 变量和类型基础 |
| 02-operators-expressions.js | 16KB | 478行 | 运算符和表达式 |
| 03-control-flow.js | 7.8KB | 289行 | 流程控制 |
| 04-functions.js | 18KB | 659行 | 函数编程 |
| 05-objects-arrays.js | 21KB | 707行 | 数据结构 |
| 06-error-handling.js | 18KB | 648行 | 错误处理 |
| **总计** | **93.8KB** | **3152行** | **6个核心主题** |

## 🌟 学习成果

完成这些示例后，你将掌握：

### 核心技能
- ✅ JavaScript基础语法和概念
- ✅ 变量作用域和数据类型
- ✅ 运算符和表达式计算
- ✅ 程序流程控制
- ✅ 函数式编程思维
- ✅ 复杂数据结构操作
- ✅ 错误处理和调试技巧

### 编程能力
- ✅ 编写清晰、可维护的代码
- ✅ 理解和解决编程问题
- ✅ 使用函数式编程范式
- ✅ 处理复杂的数据结构
- ✅ 实现错误处理和恢复机制
- ✅ 优化代码性能和质量

## 🔗 相关资源

### 官方文档
- [MDN JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)
- [ECMAScript 规范](https://tc39.es/ecma262/)

### 在线学习
- [JavaScript.info](https://javascript.info/)
- [FreeCodeCamp](https://www.freecodecamp.org/)
- [Codecademy JavaScript](https://www.codecademy.com/learn/introduction-to-javascript)

### 开发工具
- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Node.js](https://nodejs.org/)

---

**下一步学习**：
- 📚 [ES6+ 现代特性](../../02-es6-plus/)
- 🌐 [浏览器 API 和 DOM](../../03-browser-apis/)
- ⚡ [异步编程](../../04-async-programming/) 