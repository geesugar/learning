# CSS Grid 网格布局详解

## 1. Grid 基础概念

### 1.1 什么是CSS Grid？

CSS Grid是一个二维布局系统，可以同时处理行和列的布局。它提供了强大而灵活的方式来创建复杂的网页布局，是现代网页设计的核心技术之一。

### 1.2 Grid vs Flexbox

| 特性 | Grid | Flexbox |
|------|------|---------|
| 维度 | 二维（行+列） | 一维（行或列） |
| 用途 | 页面整体布局 | 组件内部布局 |
| 控制方式 | 容器主导 | 项目参与 |
| 对齐能力 | 强大的二维对齐 | 一维对齐 |

### 1.3 基本术语

```
网格容器 (Grid Container)
┌─────────────────────────────────────────────┐
│  网格线   网格线   网格线   网格线   网格线   │
│    │       │       │       │       │     │
│    ├───────┼───────┼───────┼───────┤     │ ← 网格线
│    │ 项目1 │ 项目2 │ 项目3 │ 项目4 │     │
│    ├───────┼───────┼───────┼───────┤     │ ← 网格线
│    │ 项目5 │       项目6     │ 项目7 │     │
│    ├───────┼───────┼───────┼───────┤     │ ← 网格线
│    │       │       │       │       │     │
└─────────────────────────────────────────────┘
     ↑       ↑       ↑       ↑       ↑
   网格轨道  网格轨道  网格轨道  网格轨道
```

**核心概念**：
- **网格容器（Grid Container）**：设置了 `display: grid` 的元素
- **网格项目（Grid Items）**：网格容器的直接子元素
- **网格线（Grid Lines）**：构成网格结构的分隔线
- **网格轨道（Grid Tracks）**：两条相邻网格线之间的空间
- **网格单元（Grid Cells）**：四条网格线围成的空间
- **网格区域（Grid Areas）**：由多个网格单元组成的矩形区域

### 1.4 启用Grid布局

```css
.grid-container {
  display: grid;        /* 块级网格容器 */
}

.inline-grid-container {
  display: inline-grid; /* 行内网格容器 */
}
```

## 2. Grid容器属性

### 2.1 grid-template-columns & grid-template-rows

定义网格的列和行的大小：

```css
/* 基本用法 */
.grid-basic {
  display: grid;
  grid-template-columns: 200px 300px 100px;  /* 3列，固定宽度 */
  grid-template-rows: 100px 200px;           /* 2行，固定高度 */
}

/* 使用fr单位（fraction，分数） */
.grid-fr {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;       /* 1:2:1 比例分配 */
  grid-template-rows: 100px 1fr 50px;       /* 固定+自适应+固定 */
}

/* 混合单位 */
.grid-mixed {
  display: grid;
  grid-template-columns: 200px 1fr 100px;   /* 固定+自适应+固定 */
  grid-template-rows: auto 1fr auto;        /* 内容适应+填充+内容适应 */
}

/* repeat()函数 */
.grid-repeat {
  display: grid;
  grid-template-columns: repeat(3, 1fr);           /* 重复3次，每次1fr */
  grid-template-columns: repeat(auto-fit, 200px);  /* 自动适应，每列200px */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 响应式列 */
}
```

### 2.2 grid-template-areas

通过命名网格区域来定义布局：

```css
.grid-areas {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "header header header"
    "sidebar main   aside"
    "footer footer footer";
}

/* 使用命名区域 */
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

### 2.3 grid-template（简写属性）

`grid-template-rows`、`grid-template-columns` 和 `grid-template-areas` 的简写：

```css
.grid-template {
  display: grid;
  grid-template:
    "header header header" 80px
    "sidebar main aside" 1fr
    "footer footer footer" 60px
    / 200px 1fr 200px;
    /* 行定义在上，列定义在 / 后 */
}
```

### 2.4 gap属性

控制网格项目之间的间距：

```css
.grid-gap {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;                    /* 行列间距都是10px */
}

.grid-gap-separate {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 15px;               /* 行间距 */
  column-gap: 20px;            /* 列间距 */
}

.grid-gap-shorthand {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px 20px;              /* 行间距 列间距 */
}
```

### 2.5 justify-items & align-items

控制网格项目在其网格单元内的对齐：

```css
/* 水平对齐 */
.grid-justify {
  display: grid;
  justify-items: start;    /* start | end | center | stretch */
}

/* 垂直对齐 */
.grid-align {
  display: grid;
  align-items: center;     /* start | end | center | stretch | baseline */
}

/* 简写属性 */
.grid-place-items {
  display: grid;
  place-items: center;     /* align-items justify-items */
}
```

### 2.6 justify-content & align-content

控制整个网格在容器内的对齐：

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  width: 800px;
  height: 600px;
  
  /* 水平对齐整个网格 */
  justify-content: center; /* start | end | center | stretch | space-around | space-between | space-evenly */
  
  /* 垂直对齐整个网格 */
  align-content: center;   /* start | end | center | stretch | space-around | space-between | space-evenly */
}

/* 简写属性 */
.grid-place-content {
  display: grid;
  place-content: center;   /* align-content justify-content */
}
```

### 2.7 grid-auto-rows & grid-auto-columns

定义隐式网格轨道的大小：

```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  grid-auto-rows: 150px;        /* 超出显式网格的行高度 */
  grid-auto-columns: 100px;     /* 超出显式网格的列宽度 */
}
```

### 2.8 grid-auto-flow

控制网格项目的自动放置方式：

```css
.grid-flow-row {
  display: grid;
  grid-auto-flow: row;     /* 默认值，按行填充 */
}

.grid-flow-column {
  display: grid;
  grid-auto-flow: column;  /* 按列填充 */
}

.grid-flow-dense {
  display: grid;
  grid-auto-flow: row dense;  /* 尽量填满空隙 */
}
```

## 3. Grid项目属性

### 3.1 grid-column & grid-row

指定项目的位置和跨越：

```css
/* 使用网格线编号 */
.item-lines {
  grid-column: 1 / 3;      /* 从第1条线到第3条线 */
  grid-row: 2 / 4;         /* 从第2条线到第4条线 */
}

/* 使用span关键字 */
.item-span {
  grid-column: 1 / span 2; /* 从第1条线开始，跨越2列 */
  grid-row: span 3;        /* 跨越3行 */
}

/* 分别设置起始和结束 */
.item-separate {
  grid-column-start: 2;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: span 2;
}
```

### 3.2 grid-area

指定项目所在的网格区域：

```css
/* 使用命名区域 */
.item-named {
  grid-area: header;
}

/* 使用线编号（简写） */
.item-lines-shorthand {
  grid-area: 1 / 2 / 3 / 4;  /* row-start / column-start / row-end / column-end */
}
```

### 3.3 justify-self & align-self

控制单个项目在其网格单元内的对齐：

```css
.item-self-align {
  justify-self: center;    /* 水平对齐 */
  align-self: end;         /* 垂直对齐 */
}

/* 简写属性 */
.item-place-self {
  place-self: center end;  /* align-self justify-self */
}
```

## 4. 高级Grid技巧

### 4.1 响应式网格

```css
/* 自适应列数 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 使用媒体查询 */
.adaptive-grid {
  display: grid;
  gap: 20px;
}

@media (min-width: 768px) {
  .adaptive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .adaptive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 4.2 命名网格线

```css
.named-lines {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 250px 
    [sidebar-end main-start] 1fr 
    [main-end];
  grid-template-rows: 
    [header-start] 80px 
    [header-end content-start] 1fr 
    [content-end footer-start] 60px 
    [footer-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
  grid-row: content-start / content-end;
}
```

### 4.3 网格嵌套

```css
.parent-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.nested-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
```

### 4.4 subgrid（子网格）

```css
/* 注意：subgrid支持有限，仅Firefox支持 */
.subgrid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.subgrid-item {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;  /* 继承父网格的列定义 */
}
```

## 5. 常见布局模式

### 5.1 经典网页布局

```css
.classic-layout {
  display: grid;
  min-height: 100vh;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

### 5.2 卡片网格布局

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* 特殊卡片跨越多列 */
.card-large {
  grid-column: span 2;
}

.card-tall {
  grid-row: span 2;
}
```

### 5.3 图片画廊布局

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 10px;
}

.gallery-item {
  overflow: hidden;
  border-radius: 8px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 特色图片 */
.featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

### 5.4 表单布局

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 15px;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

/* 不同宽度的表单字段 */
.full-width { grid-column: span 12; }
.half-width { grid-column: span 6; }
.third-width { grid-column: span 4; }
.quarter-width { grid-column: span 3; }

/* 响应式调整 */
@media (max-width: 768px) {
  .half-width, .third-width, .quarter-width {
    grid-column: span 12;
  }
}
```

## 6. 实际应用案例

### 6.1 响应式新闻网站布局

```html
<div class="news-layout">
  <header class="header">
    <h1>新闻网站</h1>
    <nav class="nav">
      <a href="#">首页</a>
      <a href="#">国内</a>
      <a href="#">国际</a>
      <a href="#">体育</a>
    </nav>
  </header>
  
  <main class="main-content">
    <article class="featured-article">
      <h2>重点新闻标题</h2>
      <p>重点新闻内容...</p>
    </article>
    
    <article class="article">
      <h3>新闻标题1</h3>
      <p>新闻内容...</p>
    </article>
    
    <article class="article">
      <h3>新闻标题2</h3>
      <p>新闻内容...</p>
    </article>
    
    <article class="article">
      <h3>新闻标题3</h3>
      <p>新闻内容...</p>
    </article>
  </main>
  
  <aside class="sidebar">
    <div class="ad">广告位</div>
    <div class="hot-news">热门新闻</div>
  </aside>
  
  <footer class="footer">
    <p>&copy; 2024 新闻网站</p>
  </footer>
</div>
```

```css
.news-layout {
  display: grid;
  min-height: 100vh;
  grid-template-areas:
    "header header"
    "main   sidebar"
    "footer footer";
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  grid-area: header;
  background: #333;
  color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav a:hover {
  background: rgba(255,255,255,0.2);
}

.main-content {
  grid-area: main;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.featured-article {
  grid-column: 1 / -1;
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.article {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.sidebar {
  grid-area: sidebar;
  display: grid;
  gap: 20px;
  align-content: start;
}

.ad, .hot-news {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.footer {
  grid-area: footer;
  background: #333;
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .news-layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .main-content {
    grid-template-columns: 1fr;
  }
}
```

### 6.2 产品展示网格

```html
<div class="product-showcase">
  <div class="hero-product">
    <img src="hero-product.jpg" alt="主打产品">
    <div class="hero-info">
      <h2>主打产品</h2>
      <p>特色描述...</p>
      <button>立即购买</button>
    </div>
  </div>
  
  <div class="product-grid">
    <div class="product-card" data-category="electronics">
      <img src="product1.jpg" alt="产品1">
      <h3>产品1</h3>
      <p class="price">¥299</p>
    </div>
    
    <div class="product-card" data-category="clothing">
      <img src="product2.jpg" alt="产品2">
      <h3>产品2</h3>
      <p class="price">¥199</p>
    </div>
    
    <div class="product-card featured" data-category="electronics">
      <img src="featured-product.jpg" alt="特色产品">
      <h3>特色产品</h3>
      <p class="price">¥599</p>
      <span class="badge">热销</span>
    </div>
    
    <div class="product-card" data-category="home">
      <img src="product4.jpg" alt="产品4">
      <h3>产品4</h3>
      <p class="price">¥399</p>
    </div>
    
    <div class="product-card" data-category="electronics">
      <img src="product5.jpg" alt="产品5">
      <h3>产品5</h3>
      <p class="price">¥499</p>
    </div>
    
    <div class="product-card wide" data-category="clothing">
      <img src="wide-product.jpg" alt="宽幅产品">
      <h3>宽幅展示产品</h3>
      <p class="price">¥699</p>
    </div>
  </div>
</div>
```

```css
.product-showcase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-product {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 40px;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.hero-product img {
  width: 100%;
  border-radius: 8px;
}

.hero-info h2 {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.hero-info p {
  font-size: 1.2rem;
  margin-bottom: 25px;
  opacity: 0.9;
}

.hero-info button {
  background: white;
  color: #667eea;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s;
}

.hero-info button:hover {
  transform: translateY(-2px);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-card h3 {
  padding: 15px 20px 10px;
  margin: 0;
  font-size: 1.2rem;
}

.product-card .price {
  padding: 0 20px 20px;
  margin: 0;
  font-size: 1.4rem;
  font-weight: bold;
  color: #e74c3c;
}

/* 特殊布局 */
.product-card.featured {
  grid-column: span 2;
  grid-row: span 2;
}

.product-card.featured img {
  height: 300px;
}

.product-card.wide {
  grid-column: span 2;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4757;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-product {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .product-card.featured,
  .product-card.wide {
    grid-column: span 1;
    grid-row: span 1;
  }
  
  .product-card.featured img {
    height: 200px;
  }
}
```

## 7. 调试技巧

### 7.1 可视化网格线

```css
/* 临时显示网格线 */
.debug-grid {
  background-image: 
    linear-gradient(to right, rgba(255,0,0,0.3) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,0,0,0.3) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 使用浏览器开发者工具 */
.grid-container {
  /* 在DevTools中点击grid图标查看网格 */
  display: grid;
}
```

### 7.2 命名调试

```css
.debug-areas {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
}

/* 在DevTools中可以清楚看到命名区域 */
```

### 7.3 常见问题排查

```css
/* 项目溢出网格 */
.overflow-fix {
  min-width: 0;        /* 允许收缩 */
  overflow: hidden;    /* 防止溢出 */
}

/* 网格高度问题 */
.height-fix {
  grid-template-rows: min-content 1fr min-content;
}

/* 间距问题 */
.gap-fix {
  gap: 20px;          /* 使用gap而不是margin */
}
```

## 8. 兼容性处理

### 8.1 浏览器支持检测

```css
@supports (display: grid) {
  .grid-container {
    display: grid;
    /* Grid布局代码 */
  }
}

@supports not (display: grid) {
  .grid-container {
    /* 降级方案：使用Flexbox或Float */
    display: flex;
    flex-wrap: wrap;
  }
}
```

### 8.2 渐进增强

```css
/* 基础布局（所有浏览器支持） */
.layout-item {
  width: 100%;
  margin-bottom: 20px;
}

/* 增强版本（支持Grid的浏览器） */
@supports (display: grid) {
  .layout-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .layout-item {
    width: auto;
    margin-bottom: 0;
  }
}
```

## 9. 实践练习

### 练习1：创建响应式仪表板

要求：
- 包含侧边栏、主要内容区、统计卡片
- 移动端侧边栏可折叠
- 统计卡片响应式排列
- 使用Grid和Flexbox组合

### 练习2：实现杂志风格布局

要求：
- 不规则的图文混排
- 图片跨越多个网格单元
- 文字环绕效果
- 响应式适配

### 练习3：制作产品比较表格

要求：
- 表格式布局但使用Grid
- 突出显示推荐产品
- 响应式表格处理
- 可排序功能

## 10. 最佳实践

### 10.1 语义化Grid

```css
/* ✅ 语义化的网格命名 */
.page-layout {
  display: grid;
  grid-template-areas:
    "header"
    "nav"
    "main"
    "aside"
    "footer";
}

/* ❌ 过于技术化的命名 */
.grid-123 {
  display: grid;
  grid-template-columns: 1fr 2fr 3fr;
}
```

### 10.2 性能优化

```css
/* ✅ 使用transform进行动画 */
.grid-item {
  transition: transform 0.3s ease;
}

.grid-item:hover {
  transform: scale(1.05);
}

/* ❌ 避免频繁改变网格属性 */
.grid-item:hover {
  grid-column: span 2; /* 会导致重排 */
}
```

### 10.3 可访问性

```css
/* 保持逻辑阅读顺序 */
.accessibility-grid {
  display: grid;
  /* 避免使用order改变重要内容的顺序 */
}

/* 确保键盘导航 */
.grid-item:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

## 11. Grid与其他技术结合

### 11.1 Grid + Flexbox

```css
.hybrid-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.flex-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

### 11.2 Grid + CSS变量

```css
:root {
  --grid-columns: 3;
  --grid-gap: 20px;
}

.dynamic-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
}

@media (max-width: 768px) {
  :root {
    --grid-columns: 1;
    --grid-gap: 15px;
  }
}
```

## 12. 总结

CSS Grid是现代网页布局的革命性技术：

1. **二维布局专家**：同时控制行和列
2. **强大的对齐系统**：精确控制项目位置
3. **灵活的网格定义**：支持固定、弹性和自适应
4. **语义化布局**：通过命名区域提高代码可读性
5. **响应式友好**：天然支持复杂的响应式设计

**关键要点**：
- Grid适合页面整体布局
- Flexbox适合组件内部布局
- 两者结合使用效果最佳
- 重视可访问性和语义化

**下一步**：学习[响应式设计](./03-responsive.md)，掌握如何让Grid布局适配各种设备！ 🎯 