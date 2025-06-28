# CSS 显示与定位

## 1. display 属性详解

### 1.1 display 属性概述

`display` 属性决定了元素如何在页面上显示，它是CSS布局的核心属性之一。

### 1.2 块级元素（block）

块级元素独占一行，默认宽度为父容器的100%：

```css
.block-element {
  display: block;
  width: 100%;
  padding: 20px;
  margin: 10px 0;
  background: #3498db;
  color: white;
}
```

**特点**：
- 独占一行
- 可以设置宽高
- 可以设置所有方向的margin和padding
- 默认宽度为父容器的100%

**常见的块级元素**：
- `<div>`, `<p>`, `<h1>-<h6>`
- `<section>`, `<article>`, `<header>`, `<footer>`
- `<ul>`, `<ol>`, `<li>`

### 1.3 行内元素（inline）

行内元素在同一行内显示，只占据内容所需的空间：

```css
.inline-element {
  display: inline;
  padding: 5px 10px;
  background: #e74c3c;
  color: white;
  /* 注意：不能设置width和height */
}
```

**特点**：
- 在同一行显示
- 不能设置宽高
- 只能设置左右的margin和padding
- 宽度由内容决定

**常见的行内元素**：
- `<span>`, `<a>`, `<strong>`, `<em>`
- `<img>`, `<input>`, `<button>`

### 1.4 行内块元素（inline-block）

结合了行内元素和块级元素的特点：

```css
.inline-block-element {
  display: inline-block;
  width: 200px;
  height: 100px;
  padding: 10px;
  margin: 10px;
  background: #2ecc71;
  color: white;
  text-align: center;
}
```

**特点**：
- 在同一行显示
- 可以设置宽高
- 可以设置所有方向的margin和padding
- 常用于创建按钮、导航项等

### 1.5 隐藏元素

```css
/* 完全隐藏，不占据空间 */
.display-none {
  display: none;
}

/* 隐藏但占据空间 */
.visibility-hidden {
  visibility: hidden;
}

/* 透明但占据空间 */
.opacity-zero {
  opacity: 0;
}
```

### 1.6 其他 display 值

```css
/* 表格相关 */
.table {
  display: table;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

/* 列表项 */
.list-item {
  display: list-item;
  list-style-type: disc;
}

/* 现代布局 */
.flex-container {
  display: flex;
}

.grid-container {
  display: grid;
}
```

## 2. position 定位系统

### 2.1 static（静态定位）

默认的定位方式，元素按照正常的文档流排列：

```css
.static-element {
  position: static;
  /* top、right、bottom、left 无效 */
}
```

### 2.2 relative（相对定位）

元素相对于其正常位置进行偏移：

```css
.relative-element {
  position: relative;
  top: 20px;      /* 向下偏移20px */
  left: 30px;     /* 向右偏移30px */
  background: #f39c12;
}
```

**特点**：
- 不脱离文档流
- 原来的空间仍然保留
- 偏移基于原始位置
- 常用作绝对定位的参考点

### 2.3 absolute（绝对定位）

元素脱离文档流，相对于最近的非static定位祖先元素定位：

```css
.container {
  position: relative; /* 作为参考点 */
  width: 400px;
  height: 300px;
  background: #ecf0f1;
}

.absolute-element {
  position: absolute;
  top: 50px;
  right: 20px;
  width: 100px;
  height: 80px;
  background: #9b59b6;
}
```

**特点**：
- 脱离文档流
- 不占据原来的空间
- 相对于定位祖先元素定位
- 如果没有定位祖先，则相对于视口定位

### 2.4 fixed（固定定位）

元素相对于浏览器视口进行定位：

```css
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: #34495e;
  color: white;
  z-index: 1000;
}

.fixed-sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background: #2c3e50;
  overflow-y: auto;
}
```

**特点**：
- 脱离文档流
- 相对于视口定位
- 滚动页面时位置不变
- 常用于导航栏、侧边栏

### 2.5 sticky（粘性定位）

元素在跨越特定阈值前为相对定位，之后为固定定位：

```css
.sticky-nav {
  position: sticky;
  top: 0;           /* 粘性阈值 */
  background: #16a085;
  padding: 15px;
  z-index: 100;
}

.sticky-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}
```

**特点**：
- 不完全脱离文档流
- 在指定位置"粘住"
- 需要指定阈值（top、bottom等）
- 现代浏览器支持良好

## 3. 文档流与脱离文档流

### 3.1 什么是文档流？

文档流（Document Flow）是指页面元素按照HTML结构从上到下、从左到右的正常排列方式。

### 3.2 正常文档流示例

```html
<div class="container">
  <div class="box box1">盒子1</div>
  <div class="box box2">盒子2</div>
  <div class="box box3">盒子3</div>
</div>
```

```css
.container {
  background: #f8f9fa;
  padding: 20px;
}

.box {
  width: 200px;
  height: 100px;
  margin: 10px;
  padding: 20px;
  background: #3498db;
  color: white;
}
```

### 3.3 脱离文档流的方式

```css
/* 1. 浮动 */
.float-left {
  float: left;
}

/* 2. 绝对定位 */
.absolute {
  position: absolute;
}

/* 3. 固定定位 */
.fixed {
  position: fixed;
}
```

### 3.4 脱离文档流的影响

```css
.parent {
  background: #ecf0f1;
  border: 2px solid #bdc3c7;
}

.float-child {
  float: left;
  width: 200px;
  height: 150px;
  background: #e74c3c;
}

/* 父元素高度塌陷的解决方案 */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

## 4. z-index 和层叠上下文

### 4.1 z-index 基本用法

`z-index` 控制元素在Z轴上的层叠顺序：

```css
.layer1 {
  position: relative;
  z-index: 1;
  background: #3498db;
}

.layer2 {
  position: relative;
  z-index: 2;
  background: #e74c3c;
}

.layer3 {
  position: relative;
  z-index: 3;
  background: #2ecc71;
}
```

### 4.2 层叠上下文（Stacking Context）

层叠上下文是一个独立的渲染层，内部元素的z-index只在该上下文内有效：

```css
/* 创建层叠上下文的条件 */
.stacking-context-1 {
  position: relative;
  z-index: 1;
  /* 创建新的层叠上下文 */
}

.stacking-context-2 {
  opacity: 0.9;
  /* 也会创建层叠上下文 */
}

.stacking-context-3 {
  transform: translateZ(0);
  /* 也会创建层叠上下文 */
}
```

### 4.3 层叠顺序规则

从下到上的层叠顺序：

1. 根元素的背景和边框
2. 负z-index的定位元素
3. 普通文档流中的块级元素
4. 浮动元素
5. 普通文档流中的行内元素
6. z-index为0的定位元素
7. 正z-index的定位元素

```css
.example-stack {
  position: relative;
}

.behind {
  position: absolute;
  z-index: -1;
  background: #3498db;
}

.normal {
  /* 普通文档流 */
  background: #2ecc71;
}

.front {
  position: absolute;
  z-index: 10;
  background: #e74c3c;
}
```

## 5. 实际应用示例

### 5.1 模态框（Modal）

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3>模态框标题</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="modal-body">
      <p>这是模态框的内容...</p>
    </div>
    <div class="modal-footer">
      <button class="btn-cancel">取消</button>
      <button class="btn-confirm">确认</button>
    </div>
  </div>
</div>
```

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
```

### 5.2 固定导航栏

```html
<nav class="navbar">
  <div class="nav-container">
    <div class="nav-logo">Logo</div>
    <ul class="nav-menu">
      <li><a href="#home">首页</a></li>
      <li><a href="#about">关于</a></li>
      <li><a href="#services">服务</a></li>
      <li><a href="#contact">联系</a></li>
    </ul>
  </div>
</nav>

<main class="main-content">
  <div class="content-spacer"></div>
  <!-- 页面内容 -->
</main>
```

```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-menu li {
  margin: 0 15px;
}

.content-spacer {
  height: 60px; /* 为固定导航栏留出空间 */
}
```

### 5.3 卡片悬停效果

```html
<div class="card-container">
  <div class="card">
    <img src="image.jpg" alt="图片">
    <div class="card-overlay">
      <h3>卡片标题</h3>
      <p>卡片描述信息</p>
      <button class="btn">查看详情</button>
    </div>
  </div>
</div>
```

```css
.card {
  position: relative;
  width: 300px;
  height: 200px;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.card:hover .card-overlay {
  transform: translateY(0);
}
```

## 6. 常见布局模式

### 6.1 水平垂直居中

```css
/* 方法1：绝对定位 + transform */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 方法2：绝对定位 + margin */
.center-margin {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 方法3：flexbox */
.center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

/* 方法4：grid */
.center-grid {
  display: grid;
  place-items: center;
  height: 100vh;
}
```

### 6.2 三栏布局

```css
/* 使用定位实现三栏布局 */
.layout-container {
  position: relative;
  height: 100vh;
}

.sidebar-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 100%;
  background: #3498db;
}

.sidebar-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  background: #e74c3c;
}

.main-content {
  position: absolute;
  top: 0;
  left: 200px;
  right: 200px;
  height: 100%;
  background: #2ecc71;
}
```

### 6.3 粘性页脚

```css
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.footer {
  position: sticky;
  bottom: 0;
  background: #34495e;
  color: white;
  padding: 20px;
  text-align: center;
}
```

## 7. 实践练习

### 练习1：创建悬浮按钮

创建一个始终显示在页面右下角的悬浮按钮：

```html
<button class="floating-btn">+</button>
```

要求：
- 固定在右下角
- 圆形按钮
- 悬停时有放大效果
- 高层级显示

### 练习2：实现面包屑导航

创建一个粘性面包屑导航：

```html
<nav class="breadcrumb">
  <a href="/">首页</a>
  <span>/</span>
  <a href="/category">分类</a>
  <span>/</span>
  <span>当前页面</span>
</nav>
```

要求：
- 滚动时粘在顶部
- 美观的分隔符
- 响应式设计

### 练习3：制作图片画廊

创建一个图片画廊，点击图片显示大图：

要求：
- 网格布局显示缩略图
- 点击后显示大图遮罩层
- 大图居中显示
- 点击外部关闭

## 8. 常见问题

### Q1: 为什么设置了z-index但元素还是在下面？

**原因**：
- 元素没有设置position属性
- 元素在不同的层叠上下文中
- 父元素的z-index较低

**解决方案**：
```css
.element {
  position: relative; /* 或absolute、fixed */
  z-index: 10;
}
```

### Q2: absolute定位元素如何相对于父元素定位？

**答案**：父元素需要设置position为relative、absolute或fixed：

```css
.parent {
  position: relative; /* 创建定位上下文 */
}

.child {
  position: absolute;
  top: 10px;
  left: 10px;
}
```

### Q3: sticky定位为什么不生效？

**常见原因**：
- 父元素设置了overflow: hidden
- 没有设置阈值（top、bottom等）
- 父元素高度不足

## 9. 下一步学习

完成本章学习后，你可以继续学习：
- [Flexbox 弹性布局](../02-layouts/01-flexbox.md)
- [Grid 网格布局](../02-layouts/02-grid.md)
- [响应式设计](../02-layouts/03-responsive.md)

## 10. 总结

显示与定位是CSS布局的核心概念：

1. **display属性**：控制元素的显示方式
2. **position属性**：控制元素的定位方式
3. **文档流**：理解元素的正常排列和脱离文档流的影响
4. **层叠上下文**：掌握元素层次关系和z-index
5. **实际应用**：模态框、导航栏、居中布局等

记住：**熟练掌握显示与定位，是创建复杂布局的基础**！ 