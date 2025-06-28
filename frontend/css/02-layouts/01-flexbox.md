# Flexbox 弹性布局详解

## 1. Flexbox 基础概念

### 1.1 什么是Flexbox？

Flexbox（Flexible Box Layout）是CSS3中的一种布局方法，专门用于解决一维布局问题。它能够更有效地安排、分布和对齐容器中的项目，即使它们的大小未知或动态变化。

### 1.2 基本术语

```
┌─────────────────────────────────────────┐
│                Flex容器                  │  ← flex container
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │Item1│  │Item2│  │Item3│  │Item4│    │  ← flex items
│  └─────┘  └─────┘  └─────┘  └─────┘    │
│                                         │
│  ←─────── 主轴 (main axis) ──────→    │
│                                         │
└─────────────────────────────────────────┘
    ↑
   交叉轴 (cross axis)
```

**核心概念**：
- **Flex容器（Flex Container）**：父元素，设置了 `display: flex` 或 `display: inline-flex`
- **Flex项目（Flex Items）**：容器的直接子元素
- **主轴（Main Axis）**：Flex容器的主要轴线
- **交叉轴（Cross Axis）**：垂直于主轴的轴线

### 1.3 启用Flexbox

```css
.flex-container {
  display: flex;        /* 块级flex容器 */
}

.inline-flex-container {
  display: inline-flex; /* 行内flex容器 */
}
```

## 2. Flex容器属性

### 2.1 flex-direction（主轴方向）

控制主轴的方向和Flex项目的排列方向：

```css
.container {
  display: flex;
}

/* 水平从左到右（默认） */
.flex-row {
  flex-direction: row;
}

/* 水平从右到左 */
.flex-row-reverse {
  flex-direction: row-reverse;
}

/* 垂直从上到下 */
.flex-column {
  flex-direction: column;
}

/* 垂直从下到上 */
.flex-column-reverse {
  flex-direction: column-reverse;
}
```

**示例**：
```html
<div class="container flex-row">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

### 2.2 flex-wrap（换行控制）

控制Flex项目是否换行：

```css
/* 不换行（默认） */
.no-wrap {
  flex-wrap: nowrap;
}

/* 换行 */
.wrap {
  flex-wrap: wrap;
}

/* 反向换行 */
.wrap-reverse {
  flex-wrap: wrap-reverse;
}
```

### 2.3 flex-flow（简写属性）

`flex-direction` 和 `flex-wrap` 的简写：

```css
.container {
  /* 等同于 flex-direction: row; flex-wrap: wrap; */
  flex-flow: row wrap;
}

.container-column {
  /* 等同于 flex-direction: column; flex-wrap: nowrap; */
  flex-flow: column nowrap;
}
```

### 2.4 justify-content（主轴对齐）

控制Flex项目在主轴上的对齐方式：

```css
/* 起始位置对齐（默认） */
.justify-start {
  justify-content: flex-start;
}

/* 结束位置对齐 */
.justify-end {
  justify-content: flex-end;
}

/* 居中对齐 */
.justify-center {
  justify-content: center;
}

/* 两端对齐，项目之间等间距 */
.justify-between {
  justify-content: space-between;
}

/* 周围等间距 */
.justify-around {
  justify-content: space-around;
}

/* 项目之间和两端等间距 */
.justify-evenly {
  justify-content: space-evenly;
}
```

**对比示例**：
```css
/* space-between: |item| --- |item| --- |item| */
/* space-around:  -|item|- - -|item|- - -|item|- */
/* space-evenly:  --|item|-- --|item|-- --|item|-- */
```

### 2.5 align-items（交叉轴对齐）

控制Flex项目在交叉轴上的对齐方式：

```css
/* 拉伸填满容器（默认） */
.align-stretch {
  align-items: stretch;
}

/* 起始位置对齐 */
.align-start {
  align-items: flex-start;
}

/* 结束位置对齐 */
.align-end {
  align-items: flex-end;
}

/* 居中对齐 */
.align-center {
  align-items: center;
}

/* 基线对齐 */
.align-baseline {
  align-items: baseline;
}
```

### 2.6 align-content（多行对齐）

当有多行时，控制行与行之间的对齐：

```css
.container {
  flex-wrap: wrap;
  height: 400px;
}

/* 多行起始对齐 */
.content-start {
  align-content: flex-start;
}

/* 多行居中对齐 */
.content-center {
  align-content: center;
}

/* 多行两端对齐 */
.content-between {
  align-content: space-between;
}

/* 多行周围等间距 */
.content-around {
  align-content: space-around;
}

/* 多行拉伸 */
.content-stretch {
  align-content: stretch;
}
```

### 2.7 gap（间距控制）

控制Flex项目之间的间距：

```css
.container {
  display: flex;
  gap: 20px;              /* 统一间距 */
}

.container-custom {
  display: flex;
  gap: 10px 20px;         /* 行间距 列间距 */
}

/* 单独设置 */
.container-separate {
  display: flex;
  row-gap: 15px;          /* 行间距 */
  column-gap: 25px;       /* 列间距 */
}
```

## 3. Flex项目属性

### 3.1 flex-grow（放大比例）

定义项目的放大比例：

```css
.item {
  flex-grow: 0; /* 默认值，不放大 */
}

.item-grow-1 {
  flex-grow: 1; /* 占据剩余空间的1份 */
}

.item-grow-2 {
  flex-grow: 2; /* 占据剩余空间的2份 */
}
```

**示例**：
```html
<div class="container">
  <div class="item">固定</div>
  <div class="item item-grow-1">放大1</div>
  <div class="item item-grow-2">放大2</div>
</div>
```

### 3.2 flex-shrink（缩小比例）

定义项目的缩小比例：

```css
.item {
  flex-shrink: 1; /* 默认值，等比缩小 */
}

.item-no-shrink {
  flex-shrink: 0; /* 不缩小 */
}

.item-shrink-more {
  flex-shrink: 2; /* 更多缩小 */
}
```

### 3.3 flex-basis（基准大小）

定义项目在分配多余空间之前的默认大小：

```css
.item {
  flex-basis: auto;    /* 默认值，项目本来大小 */
}

.item-fixed {
  flex-basis: 200px;   /* 固定基准大小 */
}

.item-percent {
  flex-basis: 30%;     /* 百分比基准大小 */
}

.item-content {
  flex-basis: content; /* 基于内容的大小 */
}
```

### 3.4 flex（简写属性）

`flex-grow`、`flex-shrink` 和 `flex-basis` 的简写：

```css
/* 常用预设值 */
.item-auto {
  flex: auto;        /* 等同于 flex: 1 1 auto; */
}

.item-none {
  flex: none;        /* 等同于 flex: 0 0 auto; */
}

.item-one {
  flex: 1;           /* 等同于 flex: 1 1 0%; */
}

/* 自定义值 */
.item-custom {
  flex: 2 1 200px;   /* grow: 2, shrink: 1, basis: 200px */
}
```

### 3.5 align-self（单独对齐）

允许单个项目有与其他项目不一样的对齐方式：

```css
.item-special {
  align-self: flex-end;    /* 单独底部对齐 */
}

.item-center {
  align-self: center;      /* 单独居中对齐 */
}

.item-stretch {
  align-self: stretch;     /* 单独拉伸 */
}
```

### 3.6 order（排序）

控制项目的排列顺序：

```css
.item-first {
  order: -1;  /* 最前面 */
}

.item-normal {
  order: 0;   /* 默认值 */
}

.item-last {
  order: 1;   /* 最后面 */
}
```

## 4. 常见布局模式

### 4.1 水平居中

```css
.center-horizontal {
  display: flex;
  justify-content: center;
}
```

```html
<div class="center-horizontal">
  <div>水平居中的内容</div>
</div>
```

### 4.2 垂直居中

```css
.center-vertical {
  display: flex;
  align-items: center;
  height: 300px;
}
```

### 4.3 水平垂直居中

```css
.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
```

### 4.4 等宽布局

```css
.equal-width-container {
  display: flex;
}

.equal-width-item {
  flex: 1;        /* 所有项目等宽 */
}
```

```html
<div class="equal-width-container">
  <div class="equal-width-item">项目1</div>
  <div class="equal-width-item">项目2</div>
  <div class="equal-width-item">项目3</div>
</div>
```

### 4.5 固定边栏布局

```css
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  flex: 0 0 250px;      /* 固定宽度 */
  background: #f0f0f0;
}

.main-content {
  flex: 1;              /* 占据剩余空间 */
  padding: 20px;
}
```

### 4.6 导航栏布局

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.nav-logo {
  flex: 0 0 auto;
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

.nav-actions {
  flex: 0 0 auto;
}
```

```html
<nav class="navbar">
  <div class="nav-logo">Logo</div>
  <ul class="nav-menu">
    <li><a href="#">首页</a></li>
    <li><a href="#">关于</a></li>
    <li><a href="#">服务</a></li>
  </ul>
  <div class="nav-actions">
    <button>登录</button>
  </div>
</nav>
```

### 4.7 卡片网格布局

```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.card {
  flex: 0 0 calc(33.333% - 20px);
  min-width: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-content {
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card {
    flex: 0 0 calc(50% - 20px);
  }
}

@media (max-width: 480px) {
  .card {
    flex: 0 0 100%;
  }
}
```

### 4.8 媒体对象布局

```css
.media-object {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.media-image {
  flex: 0 0 auto;
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.media-content {
  flex: 1;
}

.media-title {
  margin: 0 0 5px 0;
  font-size: 1.1em;
  font-weight: bold;
}

.media-description {
  margin: 0;
  color: #666;
  line-height: 1.4;
}
```

## 5. 实际应用案例

### 5.1 响应式导航栏

```html
<nav class="responsive-nav">
  <div class="nav-brand">
    <h1>网站Logo</h1>
  </div>
  <div class="nav-toggle">
    <button class="hamburger">☰</button>
  </div>
  <ul class="nav-links">
    <li><a href="#home">首页</a></li>
    <li><a href="#about">关于</a></li>
    <li><a href="#services">服务</a></li>
    <li><a href="#contact">联系</a></li>
  </ul>
</nav>
```

```css
.responsive-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  margin: 0;
  color: #333;
}

.nav-toggle {
  display: none;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #007bff;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .responsive-nav {
    flex-wrap: wrap;
  }
  
  .nav-toggle {
    display: block;
  }
  
  .nav-links {
    display: none;
    width: 100%;
    flex-direction: column;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .nav-links.active {
    display: flex;
  }
}
```

### 5.2 产品展示页面

```html
<section class="product-showcase">
  <div class="product-container">
    <div class="product-image">
      <img src="product.jpg" alt="产品图片">
    </div>
    <div class="product-info">
      <h2 class="product-title">产品名称</h2>
      <div class="product-rating">
        <span class="stars">★★★★☆</span>
        <span class="rating-text">(128 评价)</span>
      </div>
      <p class="product-price">
        <span class="current-price">¥299</span>
        <span class="original-price">¥399</span>
      </p>
      <p class="product-description">
        这里是产品的详细描述信息，介绍产品的特点和优势...
      </p>
      <div class="product-actions">
        <button class="btn-primary">立即购买</button>
        <button class="btn-secondary">加入购物车</button>
      </div>
    </div>
  </div>
</section>
```

```css
.product-showcase {
  padding: 40px 20px;
  background: #f8f9fa;
}

.product-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.product-image {
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.product-image img {
  max-width: 100%;
  height: auto;
}

.product-info {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  margin: 0 0 15px 0;
  font-size: 2rem;
  color: #333;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stars {
  color: #ffc107;
  font-size: 1.2rem;
}

.product-price {
  margin-bottom: 20px;
}

.current-price {
  font-size: 2rem;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-description {
  margin-bottom: 30px;
  line-height: 1.6;
  color: #666;
}

.product-actions {
  display: flex;
  gap: 15px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }
  
  .product-image {
    flex: none;
    height: 300px;
  }
  
  .product-info {
    padding: 20px;
  }
  
  .product-actions {
    flex-direction: column;
  }
}
```

## 6. 调试技巧

### 6.1 可视化调试

```css
/* 临时添加边框查看布局 */
.debug * {
  outline: 1px solid red;
}

/* 显示flex容器 */
.debug-flex {
  outline: 2px solid blue;
}

/* 显示flex项目 */
.debug-flex > * {
  outline: 1px solid green;
}
```

### 6.2 浏览器开发者工具

1. **Chrome DevTools**：
   - 选择flex容器
   - 在Styles面板中会显示flex图标
   - 点击图标可视化查看flex布局

2. **Firefox Developer Tools**：
   - 内置优秀的Flexbox检查器
   - 可以显示主轴、交叉轴和项目信息

### 6.3 常见问题排查

```css
/* 项目不换行 */
.fix-no-wrap {
  flex-wrap: wrap;
  /* 确保容器有固定宽度 */
  width: 100%;
}

/* 项目超出容器 */
.fix-overflow {
  min-width: 0;  /* 重要：允许项目缩小 */
  overflow: hidden;
}

/* 项目高度不一致 */
.fix-height {
  align-items: stretch;  /* 默认值，拉伸到相同高度 */
}
```

## 7. 兼容性处理

### 7.1 浏览器前缀

```css
.flex-container {
  display: -webkit-box;      /* 旧版 Safari */
  display: -moz-box;         /* 旧版 Firefox */
  display: -ms-flexbox;      /* IE 10 */
  display: -webkit-flex;     /* 新版 Safari */
  display: flex;             /* 标准语法 */
}
```

### 7.2 IE 10/11 兼容性

```css
/* IE 10/11 的 flex bug 修复 */
.ie-flex-fix {
  display: -ms-flexbox;
  display: flex;
}

.ie-flex-item {
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  /* IE 11 需要明确设置 width */
  width: auto;
}
```

## 8. 实践练习

### 练习1：创建响应式导航栏

要求：
- 桌面端水平排列
- 移动端可折叠
- 使用Flexbox布局
- 支持汉堡包菜单

### 练习2：实现圣杯布局

要求：
- 固定头部和底部
- 左右侧边栏固定宽度
- 中间内容区自适应
- 移动端侧边栏隐藏

### 练习3：制作产品卡片网格

要求：
- 响应式卡片布局
- 等高卡片
- 合理的间距处理
- 悬停效果

## 9. 最佳实践

### 9.1 语义化使用

```css
/* ✅ 好的做法 */
.navigation {
  display: flex;
  justify-content: space-between;
}

/* ❌ 避免过度使用 */
.everything-flex * {
  display: flex;
}
```

### 9.2 性能考虑

```css
/* ✅ 使用 transform 而不是改变 flex 属性来做动画 */
.smooth-animation {
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.smooth-animation:hover {
  transform: translateX(10px);
}
```

### 9.3 可访问性

```css
/* 确保焦点可见 */
.nav-link:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* 保持逻辑顺序 */
.visual-reorder {
  /* 避免使用 order 改变重要内容的逻辑顺序 */
}
```

## 10. 下一步学习

完成Flexbox学习后，你可以继续学习：
- [Grid网格布局](./02-grid.md) - 二维布局的强大工具
- [响应式设计](./03-responsive.md) - 适配不同设备
- [布局对比](./04-layout-comparison.md) - 选择合适的布局方法

## 11. 总结

Flexbox是现代CSS布局的基石：

1. **一维布局专家**：擅长处理行或列的布局
2. **强大的对齐能力**：轻松实现各种对齐需求
3. **灵活的空间分配**：智能处理剩余空间
4. **响应式友好**：天然适合响应式设计
5. **浏览器支持良好**：现代浏览器全面支持

**记住**：Flexbox让布局变得简单直观，是每个前端开发者必须掌握的技能！ 🎯 