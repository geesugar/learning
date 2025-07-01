# CSS 选择器详解

## 1. 选择器概述

选择器是CSS的核心，它决定了样式规则应用到哪些HTML元素上。掌握选择器是学好CSS的关键。

### 1.1 选择器的作用
- **元素定位**：精确选择要应用样式的HTML元素
- **样式应用**：将CSS规则应用到选中的元素
- **层次控制**：通过不同类型的选择器实现样式的精确控制

## 2. 基础选择器

### 2.1 通用选择器（Universal Selector）

选择所有元素：

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**使用场景**：
- 重置默认样式
- 设置全局属性（如box-sizing）

**注意事项**：
- 性能影响：会选择页面上的所有元素
- 谨慎使用：避免设置过多全局样式

### 2.2 元素选择器（Type Selector）

根据HTML标签名选择元素：

```css
/* 选择所有的p标签 */
p {
  color: #333;
  line-height: 1.6;
}

/* 选择所有的h1标签 */
h1 {
  font-size: 2.5em;
  color: #2c3e50;
}

/* 选择所有的a标签 */
a {
  color: #3498db;
  text-decoration: none;
}
```

**优点**：
- 语法简单
- 可以快速设置标签的默认样式

**缺点**：
- 选择范围太广
- 缺乏精确控制

### 2.3 类选择器（Class Selector）

根据class属性选择元素，以点号 `.` 开头：

```css
/* 选择class为container的元素 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 选择class为btn的元素 */
.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 选择class为btn-primary的元素 */
.btn-primary {
  background-color: #2980b9;
}
```

**HTML示例**：
```html
<div class="container">
  <button class="btn">普通按钮</button>
  <button class="btn btn-primary">主要按钮</button>
</div>
```

**优点**：
- 可复用：一个类可以应用到多个元素
- 灵活性高：可以组合多个类
- 最常用的选择器

### 2.4 ID选择器（ID Selector）

根据id属性选择元素，以井号 `#` 开头：

```css
/* 选择id为header的元素 */
#header {
  background-color: #2c3e50;
  color: white;
  padding: 20px;
}

/* 选择id为main-content的元素 */
#main-content {
  min-height: 500px;
  padding: 40px;
}
```

**HTML示例**：
```html
<header id="header">
  <h1>网站标题</h1>
</header>
<main id="main-content">
  <p>主要内容</p>
</main>
```

**特点**：
- ID在页面中必须唯一
- 优先级最高（除了内联样式）
- 常用于页面布局的主要区域

### 2.5 属性选择器（Attribute Selector）

根据元素的属性选择元素：

```css
/* 选择有title属性的元素 */
[title] {
  border-bottom: 1px dashed #999;
}

/* 选择type属性为text的input元素 */
input[type="text"] {
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
}

/* 选择type属性为email的input元素 */
input[type="email"] {
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
}

/* 选择href属性以https开头的a元素 */
a[href^="https"] {
  color: #27ae60;
}

/* 选择href属性以.pdf结尾的a元素 */
a[href$=".pdf"] {
  color: #e74c3c;
}

/* 选择class属性包含btn的元素 */
[class*="btn"] {
  cursor: pointer;
}
```

**属性选择器语法**：
- `[attr]`：有该属性的元素
- `[attr="value"]`：属性值等于value的元素
- `[attr^="value"]`：属性值以value开头的元素
- `[attr$="value"]`：属性值以value结尾的元素
- `[attr*="value"]`：属性值包含value的元素
- `[attr~="value"]`：属性值包含value这个单词的元素

## 3. 组合选择器

### 3.1 后代选择器（Descendant Selector）

选择某个元素内部的所有指定元素（无论层级多深）：

```css
/* 选择article内部的所有p元素 */
article p {
  margin-bottom: 16px;
  text-indent: 2em;
}

/* 选择nav内部的所有a元素 */
nav a {
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  display: block;
}

/* 选择.sidebar内部的所有li元素 */
.sidebar li {
  list-style: none;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
```

### 3.2 子元素选择器（Child Selector）

选择某个元素的直接子元素，使用 `>` 符号：

```css
/* 选择.menu的直接子元素li */
.menu > li {
  display: inline-block;
  margin-right: 20px;
}

/* 选择article的直接子元素p */
article > p {
  font-size: 18px;
  line-height: 1.6;
}
```

**HTML示例**：
```html
<ul class="menu">
  <li>菜单1</li>  <!-- 会被选中 -->
  <li>菜单2
    <ul>
      <li>子菜单1</li>  <!-- 不会被选中 -->
      <li>子菜单2</li>  <!-- 不会被选中 -->
    </ul>
  </li>
  <li>菜单3</li>  <!-- 会被选中 -->
</ul>
```

### 3.3 相邻兄弟选择器（Adjacent Sibling Selector）

选择紧接在另一个元素后的元素，使用 `+` 符号：

```css
/* 选择紧跟在h2后面的p元素 */
h2 + p {
  font-weight: bold;
  margin-top: 0;
}

/* 选择紧跟在.highlight后面的div元素 */
.highlight + div {
  border-top: 2px solid #f39c12;
}
```

### 3.4 通用兄弟选择器（General Sibling Selector）

选择某个元素后面的所有兄弟元素，使用 `~` 符号：

```css
/* 选择h2后面的所有p元素 */
h2 ~ p {
  color: #666;
}

/* 选择.active后面的所有li元素 */
.active ~ li {
  opacity: 0.5;
}
```

## 4. 伪类选择器（Pseudo-classes）

伪类选择器用于选择元素的特定状态。

### 4.1 用户行为伪类

```css
/* 链接状态 */
a:link {
  color: #3498db;
}

a:visited {
  color: #9b59b6;
}

a:hover {
  color: #e74c3c;
  text-decoration: underline;
}

a:active {
  color: #c0392b;
}

/* 表单元素状态 */
input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}

button:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
```

### 4.2 结构伪类

```css
/* 第一个子元素 */
li:first-child {
  border-top: none;
}

/* 最后一个子元素 */
li:last-child {
  border-bottom: none;
}

/* 第n个子元素 */
tr:nth-child(2n) {
  background-color: #f8f9fa;
}

tr:nth-child(odd) {
  background-color: #ffffff;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* 唯一的子元素 */
p:only-child {
  text-align: center;
}

/* 空元素 */
div:empty {
  display: none;
}
```

### 4.3 其他常用伪类

```css
/* 否定伪类 */
li:not(.active) {
  opacity: 0.6;
}

/* 目标伪类 */
section:target {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
}

/* 启用/禁用状态 */
input:enabled {
  background-color: white;
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

/* 选中状态 */
input:checked + label {
  font-weight: bold;
  color: #27ae60;
}
```

## 5. 伪元素选择器（Pseudo-elements）

伪元素用于选择元素的特定部分或创建虚拟元素。

### 5.1 常用伪元素

```css
/* 首字母 */
p:first-letter {
  font-size: 3em;
  float: left;
  line-height: 1;
  margin: 0 8px 0 0;
  color: #e74c3c;
}

/* 首行 */
p:first-line {
  font-weight: bold;
  color: #2c3e50;
}

/* 选中的文本 */
::selection {
  background-color: #3498db;
  color: white;
}

/* 占位符文本 */
input::placeholder {
  color: #bdc3c7;
  font-style: italic;
}
```

### 5.2 ::before 和 ::after

最强大的伪元素，可以在元素前后插入内容：

```css
/* 添加引号 */
blockquote::before {
  content: """;
  font-size: 4em;
  color: #bdc3c7;
  line-height: 0.1em;
  margin-right: 0.25em;
  vertical-align: -0.4em;
}

blockquote::after {
  content: """;
  font-size: 4em;
  color: #bdc3c7;
  line-height: 0.1em;
  margin-left: 0.25em;
  vertical-align: -0.4em;
}

/* 创建图标 */
.icon-home::before {
  content: "🏠";
  margin-right: 8px;
}

/* 创建装饰效果 */
.fancy-heading::after {
  content: "";
  display: block;
  width: 50px;
  height: 3px;
  background-color: #e74c3c;
  margin: 10px auto 0;
}

/* 清除浮动 */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

## 6. 选择器优先级

### 6.1 优先级规则

CSS优先级从高到低：

1. **内联样式** (1000)
2. **ID选择器** (100)
3. **类选择器、属性选择器、伪类** (10)
4. **元素选择器、伪元素** (1)
5. **通用选择器** (0)

### 6.2 优先级计算

```css
/* 优先级示例 */
* {}                    /* 0 */
li {}                   /* 1 */
li:first-line {}        /* 2 */
ul li {}                /* 2 */
ul ol+li {}             /* 3 */
h1 + *[rel=up] {}       /* 11 */
ul ol li.red {}         /* 13 */
li.red.level {}         /* 21 */
style=""                /* 1000 */
#x34y {}                /* 100 */
```

### 6.3 实际应用示例

```html
<div class="container">
  <p class="text" id="intro">这是一段文字</p>
</div>
```

```css
/* 优先级：1 */
p {
  color: blue;
}

/* 优先级：10 */
.text {
  color: green;
}

/* 优先级：100 */
#intro {
  color: red;
}

/* 优先级：11 */
div .text {
  color: purple;
}

/* 优先级：101 */
#intro.text {
  color: orange;
}

/* 最终显示为橙色 */
```

### 6.4 !important 规则

```css
.text {
  color: green !important;
}

#intro {
  color: red; /* 即使ID优先级更高，这里也会显示绿色 */
}
```

**注意事项**：
- 避免过度使用 `!important`
- 会破坏正常的优先级规则
- 难以覆盖和维护

## 7. 实践练习

### 练习1：选择器练习

创建以下HTML结构，并用不同的选择器设置样式：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 在这里添加你的CSS */
  </style>
</head>
<body>
  <header id="main-header">
    <h1>我的博客</h1>
    <nav>
      <ul class="nav-list">
        <li><a href="#home">首页</a></li>
        <li><a href="#about" class="active">关于</a></li>
        <li><a href="#contact">联系</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article class="post">
      <h2>文章标题</h2>
      <p class="intro">这是文章的介绍段落。</p>
      <p>这是文章的正文内容。</p>
      <p>这是另一段正文内容。</p>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2024 我的博客</p>
  </footer>
</body>
</html>
```

**任务**：
1. 设置页面的基本样式
2. 让导航链接在悬停时改变颜色
3. 让活动导航项有特殊样式
4. 让文章的第一段有特殊样式
5. 使用::before伪元素为文章标题添加装饰

### 练习2：优先级练习

分析以下CSS代码的优先级，并预测最终效果：

```html
<div class="box" id="special">
  <p class="text">测试文字</p>
</div>
```

```css
p { color: black; }
.text { color: blue; }
div p { color: green; }
.box .text { color: red; }
#special p { color: purple; }
#special .text { color: orange; }
```

## 8. 常见问题

### Q1: 什么时候使用ID选择器，什么时候使用类选择器？

**ID选择器**：
- 页面上的唯一元素
- 主要布局区域（header、main、footer）
- JavaScript需要操作的特定元素

**类选择器**：
- 可复用的样式
- 组件化的设计
- 大多数情况下的首选

### Q2: 为什么我的CSS样式没有生效？

**可能原因**：
1. 选择器写错了
2. 优先级不够
3. 语法错误
4. 文件路径问题

**调试方法**：
1. 使用浏览器开发者工具检查
2. 检查选择器是否正确匹配元素
3. 查看是否被其他样式覆盖

### Q3: 如何提高选择器的性能？

**优化建议**：
1. 避免使用通用选择器
2. 减少选择器的层级深度
3. 使用具体的选择器而不是过于宽泛的选择器
4. 优先使用类选择器

## 9. 下一步学习

完成本章学习后，你可以继续学习：
- [基本样式属性](./03-basic-properties.md)
- [盒模型深入](./04-box-model.md)

## 10. 总结

CSS选择器是前端开发的基础，掌握它们对于写出高质量的CSS至关重要：

1. **基础选择器**：元素、类、ID、属性选择器
2. **组合选择器**：后代、子元素、兄弟选择器
3. **伪类伪元素**：状态和虚拟元素的选择
4. **优先级规则**：理解样式覆盖的机制

记住：**选择器的选择要精确、高效、易维护**！ 