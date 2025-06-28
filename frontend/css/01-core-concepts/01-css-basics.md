# CSS 基本概念

## 1. CSS 是什么？

### 1.1 定义
CSS（Cascading Style Sheets，层叠样式表）是一种用来为结构化文档（如HTML文档或XML文档）添加样式的语言。它可以描述元素如何在屏幕、纸张、语音或其他媒体上呈现。

### 1.2 CSS的作用
- **样式定义**：控制网页元素的外观（颜色、字体、大小等）
- **布局控制**：决定元素在页面上的位置和排列方式
- **响应式设计**：让网页适应不同设备和屏幕尺寸
- **动画效果**：创建过渡和动画效果
- **交互反馈**：提供用户交互的视觉反馈

### 1.3 CSS 与 HTML 的关系

```html
<!-- HTML 负责内容结构 -->
<div class="container">
  <h1 class="title">欢迎来到我的网站</h1>
  <p class="description">这是一个介绍段落</p>
</div>
```

```css
/* CSS 负责样式表现 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  color: #2c3e50;
  font-size: 2.5em;
  text-align: center;
}

.description {
  color: #666;
  font-size: 1.2em;
  line-height: 1.6;
}
```

**关系说明**：
- HTML 提供内容和结构（骨架）
- CSS 提供样式和表现（皮肤）
- JavaScript 提供行为和交互（灵魂）

## 2. CSS 语法规则

### 2.1 基本语法结构

```css
选择器 {
  属性1: 值1;
  属性2: 值2;
  /* 这是注释 */
}
```

### 2.2 语法组成部分

#### 选择器（Selector）
选择器用于选中要应用样式的HTML元素。

```css
/* 标签选择器 */
h1 { }

/* 类选择器 */
.my-class { }

/* ID选择器 */
#my-id { }
```

#### 声明块（Declaration Block）
用大括号 `{}` 包围的区域，包含一个或多个声明。

#### 声明（Declaration）
由属性和值组成，用冒号 `:` 分隔，用分号 `;` 结束。

```css
.example {
  color: blue;        /* 声明1 */
  font-size: 16px;    /* 声明2 */
  margin: 10px;       /* 声明3 */
}
```

#### 属性（Property）
要设置的样式特性（如 `color`、`font-size`、`margin`）。

#### 值（Value）
属性对应的具体设置（如 `blue`、`16px`、`10px`）。

### 2.3 语法规则要点

1. **大小写不敏感**：CSS不区分大小写，但建议使用小写
2. **空格和换行**：CSS忽略空格和换行符，但合理使用可提高可读性
3. **分号必须**：每个声明必须以分号结尾
4. **注释格式**：使用 `/* 注释内容 */`

```css
/* ✅ 正确的CSS格式 */
.good-example {
  color: #333;
  font-size: 16px;
  margin: 10px 0;
}

/* ❌ 错误的CSS格式 */
.bad-example {
  color: #333  /* 缺少分号 */
  font-size: 16px;
  margin 10px 0; /* 缺少冒号 */
}
```

## 3. CSS 引入方式

### 3.1 内联样式（Inline Style）

直接在HTML元素上使用 `style` 属性：

```html
<p style="color: red; font-size: 18px;">这是红色的文字</p>
<div style="background-color: yellow; padding: 10px;">黄色背景的容器</div>
```

**优点**：
- 优先级最高
- 立即生效

**缺点**：
- 难以维护
- 代码重复
- 违反了内容与表现分离的原则

**适用场景**：临时测试或特殊情况

### 3.2 内部样式表（Internal Style Sheet）

在HTML文档的 `<head>` 部分使用 `<style>` 标签：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
    
    .header {
      background-color: #f0f0f0;
      padding: 20px;
      text-align: center;
    }
    
    .content {
      margin: 20px 0;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>网站标题</h1>
  </div>
  <div class="content">
    <p>这是内容区域</p>
  </div>
</body>
</html>
```

**优点**：
- 样式集中管理
- 仅对当前页面有效

**缺点**：
- 不能在多个页面间共享
- 页面加载稍慢

**适用场景**：单页面应用或页面特定样式

### 3.3 外部样式表（External Style Sheet）

将CSS写在独立的 `.css` 文件中，通过 `<link>` 标签引入：

**styles.css**
```css
/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

/* 头部样式 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
}

/* 导航样式 */
.nav {
  background-color: #333;
  padding: 1rem 0;
}

.nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}

.nav li {
  margin: 0 1rem;
}

.nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav a:hover {
  background-color: #555;
}
```

**index.html**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的网站</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <h1>欢迎来到我的网站</h1>
  </header>
  
  <nav class="nav">
    <ul>
      <li><a href="#home">首页</a></li>
      <li><a href="#about">关于</a></li>
      <li><a href="#contact">联系</a></li>
    </ul>
  </nav>
  
  <main class="content">
    <h2>主要内容</h2>
    <p>这里是网站的主要内容区域。</p>
  </main>
</body>
</html>
```

**优点**：
- 完全分离HTML和CSS
- 可在多个页面间共享
- 便于维护和更新
- 浏览器可以缓存CSS文件
- 并行加载，提高性能

**缺点**：
- 需要额外的HTTP请求

**适用场景**：大部分情况下的最佳选择

### 3.4 导入样式表（@import）

可以在CSS文件中导入其他CSS文件：

```css
/* main.css */
@import url('reset.css');
@import url('typography.css');
@import url('layout.css');

/* 主要样式 */
body {
  background-color: #f5f5f5;
}
```

**注意事项**：
- `@import` 必须在CSS文件的开头
- 会增加HTTP请求数量
- 影响加载性能
- 现代开发中通常使用构建工具处理

## 4. 实践练习

### 练习1：创建你的第一个CSS页面

1. 创建 `index.html` 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的第一个CSS页面</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>我的个人网站</h1>
    <p>欢迎来到我的个人空间</p>
  </header>
  
  <main>
    <section class="about">
      <h2>关于我</h2>
      <p>我是一名前端开发学习者，正在学习CSS的基础知识。</p>
    </section>
    
    <section class="skills">
      <h2>我的技能</h2>
      <ul>
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript（学习中）</li>
      </ul>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2024 我的个人网站</p>
  </footer>
</body>
</html>
```

2. 创建 `style.css` 文件并添加样式：

```css
/* 你的CSS代码 */
```

### 练习2：尝试不同的引入方式

创建三个版本的同一个页面，分别使用：
1. 内联样式
2. 内部样式表
3. 外部样式表

比较它们的优缺点。

## 5. 常见问题

### Q1: CSS文件没有生效怎么办？

**检查清单**：
1. 确认文件路径正确
2. 检查语法错误（缺少分号、大括号等）
3. 清除浏览器缓存
4. 确认选择器是否正确

### Q2: 为什么推荐使用外部样式表？

**原因**：
- 维护性好：样式集中管理
- 复用性强：多个页面可共享
- 性能优：浏览器可缓存CSS文件
- 分离关注点：内容与表现分离

### Q3: 什么时候使用内联样式？

**适用场景**：
- 临时测试和调试
- 动态生成的样式（JavaScript控制）
- 电子邮件模板（某些邮件客户端只支持内联样式）

## 6. 下一步学习

完成本章学习后，你可以继续学习：
- [选择器详解](./02-selectors.md)
- [基本样式属性](./03-basic-properties.md)

## 7. 总结

CSS是前端开发的基础技术之一，理解其基本概念和语法规则是学习的第一步。记住：

1. **CSS的作用**：为HTML添加样式和布局
2. **语法结构**：选择器 + 声明块
3. **引入方式**：外部样式表是最佳实践
4. **实践为王**：多写多练，加深理解

继续练习，下一章我们将深入学习CSS选择器！ 