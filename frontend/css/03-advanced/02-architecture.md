# CSS架构与方法论

CSS架构是构建可维护、可扩展、可复用的大型样式系统的方法论。本章将详细介绍主流的CSS架构方法论和最佳实践。

## 📋 目录

1. [CSS架构的重要性](#css架构的重要性)
2. [BEM方法论](#bem方法论)
3. [OOCSS面向对象CSS](#oocss面向对象css)
4. [SMACSS可扩展模块化架构](#smacss可扩展模块化架构)
5. [原子化CSS设计](#原子化css设计)
6. [CSS-in-JS方案](#css-in-js方案)
7. [架构方法论对比](#架构方法论对比)
8. [项目实战应用](#项目实战应用)

## CSS架构的重要性

### 为什么需要CSS架构？

**大型项目的挑战**：
- CSS全局作用域导致的样式冲突
- 样式依赖关系复杂，难以维护
- 团队协作中的命名冲突
- 样式复用性差，代码重复

**CSS架构的价值**：
- **可维护性**：清晰的代码组织和命名规范
- **可扩展性**：易于添加新功能和组件
- **可复用性**：组件化的样式设计
- **团队协作**：统一的编码规范和约定

### CSS架构的核心原则

1. **分离关注点**：样式、结构、行为分离
2. **模块化设计**：组件独立，高内聚低耦合
3. **命名规范**：语义化、可预测的命名
4. **性能优化**：减少样式冲突和重绘
5. **文档化**：完善的样式指南和文档

## BEM方法论

### BEM概述

**BEM**（Block Element Modifier）是一种组件化的CSS命名方法论，通过规范的命名约定来创建可复用的组件。

**命名结构**：
```
block__element--modifier
```

### 基本概念详解

#### Block（块）
独立的功能组件，可以在任何地方复用。

```css
/* 好的块命名 */
.button { }
.card { }
.navigation { }
.form { }

/* 避免的命名 */
.red-button { } /* 过于具体 */
.big-text { }   /* 描述外观而非功能 */
```

#### Element（元素）
属于块的组成部分，不能独立存在。

```css
/* 按钮组件的元素 */
.button { }
.button__text { }
.button__icon { }

/* 卡片组件的元素 */
.card { }
.card__header { }
.card__title { }
.card__content { }
.card__footer { }
```

#### Modifier（修饰符）
定义块或元素的外观、状态或行为。

```css
/* 块的修饰符 */
.button { }
.button--primary { }
.button--secondary { }
.button--large { }
.button--disabled { }

/* 元素的修饰符 */
.button__text { }
.button__text--bold { }
.button__icon--left { }
.button__icon--right { }
```

### BEM实际应用案例

#### 导航组件
```html
<nav class="navigation navigation--horizontal">
  <ul class="navigation__list">
    <li class="navigation__item navigation__item--active">
      <a href="#" class="navigation__link">首页</a>
    </li>
    <li class="navigation__item">
      <a href="#" class="navigation__link">产品</a>
    </li>
    <li class="navigation__item navigation__item--disabled">
      <a href="#" class="navigation__link">服务</a>
    </li>
  </ul>
</nav>
```

```scss
.navigation {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  
  &--horizontal {
    .navigation__list {
      display: flex;
    }
  }
  
  &--vertical {
    .navigation__list {
      flex-direction: column;
    }
  }
  
  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  &__item {
    &--active {
      .navigation__link {
        color: #007bff;
        border-bottom: 2px solid #007bff;
      }
    }
    
    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
  
  &__link {
    display: block;
    padding: 1rem;
    color: #333;
    text-decoration: none;
    
    &:hover {
      background-color: #f8f9fa;
    }
  }
}
```

#### 卡片组件系统
```html
<div class="card card--featured">
  <div class="card__header">
    <h3 class="card__title card__title--large">特色文章</h3>
    <span class="card__meta">2024年1月1日</span>
  </div>
  <div class="card__media">
    <img src="image.jpg" alt="" class="card__image">
  </div>
  <div class="card__content">
    <p class="card__description">这是一篇特色文章的描述内容...</p>
  </div>
  <div class="card__footer">
    <button class="card__action button button--primary">阅读更多</button>
  </div>
</div>
```

```scss
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  &--featured {
    border-left: 4px solid #007bff;
    
    .card__title {
      color: #007bff;
    }
  }
  
  &--compact {
    .card__header,
    .card__content,
    .card__footer {
      padding: 0.75rem;
    }
  }
  
  &__header {
    padding: 1.5rem 1.5rem 0;
  }
  
  &__title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    
    &--large {
      font-size: 1.5rem;
    }
  }
  
  &__meta {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  &__media {
    margin: 1rem 0;
  }
  
  &__image {
    width: 100%;
    height: auto;
    display: block;
  }
  
  &__content {
    padding: 0 1.5rem;
  }
  
  &__description {
    color: #495057;
    line-height: 1.6;
  }
  
  &__footer {
    padding: 1rem 1.5rem 1.5rem;
  }
  
  &__action {
    margin-right: 0.5rem;
    
    &:last-child {
      margin-right: 0;
    }
  }
}
```

### BEM最佳实践

#### 1. 命名约定
```scss
// ✅ 推荐的命名方式
.search-form { }
.search-form__input { }
.search-form__button { }
.search-form--compact { }

// ❌ 避免的命名方式
.searchForm { }           // 驼峰命名
.search_form__input { }   // 混合分隔符
.search-form-input { }    // 缺少明确的层级关系
```

#### 2. 避免过度嵌套
```scss
// ✅ 扁平的BEM结构
.article { }
.article__header { }
.article__title { }
.article__meta { }
.article__content { }

// ❌ 过度嵌套
.article__header__title { }
.article__content__paragraph__link { }
```

#### 3. 合理使用修饰符
```scss
// ✅ 语义化的修饰符
.button--primary { }
.button--disabled { }
.card--featured { }

// ❌ 描述性的修饰符
.button--blue { }
.button--big { }
.card--with-border { }
```

## OOCSS面向对象CSS

### OOCSS核心原则

**面向对象CSS**（Object-Oriented CSS）由Nicole Sullivan提出，主要有两个核心原则：

1. **分离结构和外观**（Separate structure and skin）
2. **分离容器和内容**（Separate container and content）

### 分离结构和外观

#### 基础概念
将视觉样式从结构样式中分离出来，使样式更加模块化和可复用。

```css
/* ❌ 传统方式：结构和外观混合 */
.newsletter-button {
  width: 200px;
  height: 50px;
  padding: 10px;
  border: none;
  background: linear-gradient(#fff, #ccc);
  box-shadow: rgba(0, 0, 0, .5) 2px 2px 5px;
  border-radius: 5px;
  font-size: 18px;
  color: #333;
}

.archive-button {
  width: 150px;
  height: 40px;
  padding: 8px;
  border: none;
  background: linear-gradient(#fff, #ccc);
  box-shadow: rgba(0, 0, 0, .5) 2px 2px 5px;
  border-radius: 5px;
  font-size: 16px;
  color: #333;
}
```

```css
/* ✅ OOCSS方式：分离结构和外观 */
/* 结构类 */
.btn {
  border: none;
  cursor: pointer;
  display: inline-block;
  text-align: center;
  text-decoration: none;
}

.btn-large {
  width: 200px;
  height: 50px;
  padding: 10px;
  font-size: 18px;
}

.btn-medium {
  width: 150px;
  height: 40px;
  padding: 8px;
  font-size: 16px;
}

/* 外观类 */
.btn-gradient {
  background: linear-gradient(#fff, #ccc);
  box-shadow: rgba(0, 0, 0, .5) 2px 2px 5px;
  border-radius: 5px;
  color: #333;
}

.btn-flat {
  background: #f0f0f0;
  border: 1px solid #ddd;
  color: #666;
}
```

### 分离容器和内容

#### 基础概念
内容对象不应该依赖于其所在的容器，应该能够在任何地方正常工作。

```css
/* ❌ 传统方式：内容依赖容器 */
.sidebar h3 {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.footer h3 {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.content-area h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}
```

```css
/* ✅ OOCSS方式：独立的内容对象 */
.heading-secondary {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.heading-primary {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

/* 容器只负责布局 */
.sidebar { }
.footer { }
.content-area { }
```

### OOCSS实战案例

#### 媒体对象模式
```html
<div class="media">
  <div class="media__image">
    <img src="avatar.jpg" alt="用户头像">
  </div>
  <div class="media__content">
    <h4 class="media__title">用户名</h4>
    <p class="media__description">用户的个人介绍...</p>
  </div>
</div>
```

```css
.media {
  display: flex;
  align-items: flex-start;
}

.media__image {
  flex-shrink: 0;
  margin-right: 1rem;
}

.media__content {
  flex: 1;
}

.media__title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.media__description {
  margin: 0;
  color: #666;
}

/* 修饰符：不同的间距 */
.media--compact .media__image {
  margin-right: 0.5rem;
}

.media--spacious .media__image {
  margin-right: 1.5rem;
}
```

#### 布局对象
```css
/* 布局对象：只负责布局结构 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid--2-cols {
  grid-template-columns: repeat(2, 1fr);
}

.grid--3-cols {
  grid-template-columns: repeat(3, 1fr);
}

.flex {
  display: flex;
}

.flex--center {
  justify-content: center;
  align-items: center;
}

.flex--between {
  justify-content: space-between;
}
```

## SMACSS可扩展模块化架构

### SMACSS分类系统

**SMACSS**（Scalable and Modular Architecture for CSS）将CSS规则分为5个类别：

1. **Base**（基础规则）
2. **Layout**（布局规则）
3. **Module**（模块规则）
4. **State**（状态规则）
5. **Theme**（主题规则）

### Base（基础规则）

设置元素的默认样式，主要是元素选择器、属性选择器、伪类选择器。

```css
/* base.css */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0 0 1rem;
  font-weight: 600;
  line-height: 1.2;
}

p {
  margin: 0 0 1rem;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}
```

### Layout（布局规则）

定义页面的主要布局结构，使用`l-`前缀。

```css
/* layout.css */
.l-header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.l-main {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

.l-sidebar {
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  width: 300px;
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.l-footer {
  background: #333;
  color: #fff;
  padding: 2rem 0;
  margin-top: auto;
}

.l-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.l-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .l-grid {
    grid-template-columns: 1fr;
  }
  
  .l-sidebar {
    width: 100%;
    position: static;
    height: auto;
  }
}
```

### Module（模块规则）

可复用的组件模块，这是CSS的主体部分。

```css
/* modules/card.css */
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-meta {
  color: #6c757d;
  font-size: 0.875rem;
}

.card-content {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

/* 模块变体 */
.card-compact .card-header,
.card-compact .card-content,
.card-compact .card-footer {
  padding: 1rem;
}

.card-featured {
  border-left: 4px solid #007bff;
}
```

### State（状态规则）

描述模块或布局在特定状态下的外观，使用`is-`或`has-`前缀。

```css
/* state.css */
.is-hidden {
  display: none !important;
}

.is-visible {
  display: block !important;
}

.is-active {
  background-color: #007bff !important;
  color: #fff !important;
}

.is-disabled {
  opacity: 0.5 !important;
  pointer-events: none !important;
}

.is-loading {
  cursor: wait !important;
  opacity: 0.7 !important;
}

.has-error {
  border-color: #dc3545 !important;
  background-color: #f8d7da !important;
}

.has-success {
  border-color: #28a745 !important;
  background-color: #d4edda !important;
}

/* 模块特定状态 */
.nav-item.is-active {
  background-color: #e9ecef;
  font-weight: 600;
}

.button.is-loading::after {
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-left: 0.5em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Theme（主题规则）

定义颜色和图像的主题样式，使用`theme-`前缀。

```css
/* theme/light.css */
.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --accent-color: #007bff;
}

.theme-light .card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* theme/dark.css */
.theme-dark {
  --bg-primary: #212529;
  --bg-secondary: #343a40;
  --text-primary: #ffffff;
  --text-secondary: #adb5bd;
  --border-color: #495057;
  --accent-color: #0d6efd;
}

.theme-dark .card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.theme-dark .card-footer {
  background-color: var(--bg-secondary);
}
```

## 原子化CSS设计

### 原子化CSS概念

**原子化CSS**是一种CSS架构方法，它倾向于使用大量小的、单一用途的类来构建组件。

### 核心理念

- **单一职责**：每个类只做一件事
- **可组合性**：通过组合多个原子类来构建复杂样式
- **一致性**：使用统一的设计系统
- **可预测性**：类名直接反映其功能

### 实际应用案例

#### 间距系统
```css
/* 外边距 */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-5 { margin: 1.25rem; }

/* 特定方向外边距 */
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mr-0 { margin-right: 0; }
.mr-1 { margin-right: 0.25rem; }
.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.ml-0 { margin-left: 0; }
.ml-1 { margin-left: 0.25rem; }

/* 内边距 */
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }

/* 特定方向内边距 */
.pt-1 { padding-top: 0.25rem; }
.pr-1 { padding-right: 0.25rem; }
.pb-1 { padding-bottom: 0.25rem; }
.pl-1 { padding-left: 0.25rem; }
```

#### 颜色系统
```css
/* 文字颜色 */
.text-primary { color: #007bff; }
.text-secondary { color: #6c757d; }
.text-success { color: #28a745; }
.text-danger { color: #dc3545; }
.text-warning { color: #ffc107; }
.text-info { color: #17a2b8; }
.text-white { color: #ffffff; }
.text-black { color: #000000; }

/* 背景颜色 */
.bg-primary { background-color: #007bff; }
.bg-secondary { background-color: #6c757d; }
.bg-success { background-color: #28a745; }
.bg-light { background-color: #f8f9fa; }
.bg-dark { background-color: #343a40; }
.bg-white { background-color: #ffffff; }
.bg-transparent { background-color: transparent; }
```

#### 布局系统
```css
/* Display */
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

/* Flexbox */
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }

/* Position */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

/* Width & Height */
.w-full { width: 100%; }
.w-1\/2 { width: 50%; }
.w-1\/3 { width: 33.333333%; }
.w-2\/3 { width: 66.666667%; }
.h-full { height: 100%; }
.h-screen { height: 100vh; }
```

#### 使用示例
```html
<!-- 使用原子化类构建卡片组件 -->
<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <div class="p-6 border-b border-gray-200">
    <h3 class="text-xl font-semibold text-gray-900 mb-2">文章标题</h3>
    <p class="text-sm text-gray-500">2024年1月1日</p>
  </div>
  <div class="p-6">
    <p class="text-gray-700 leading-relaxed">文章内容描述...</p>
  </div>
  <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
    <button class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
      阅读更多
    </button>
  </div>
</div>
```

### Tailwind CSS实战

Tailwind CSS是最流行的原子化CSS框架。

#### 安装配置
```bash
npm install tailwindcss
npx tailwindcss init
```

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
```

#### 响应式设计
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-2">卡片1</h3>
    <p class="text-gray-600">内容描述</p>
  </div>
</div>
```

#### 组件提取
```css
/* 提取常用组件 */
@layer components {
  .btn {
    @apply font-medium py-2 px-4 rounded transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white;
  }
  
  .btn-secondary {
    @apply bg-gray-500 hover:bg-gray-600 text-white;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md overflow-hidden;
  }
  
  .card-header {
    @apply p-6 border-b border-gray-200;
  }
  
  .card-content {
    @apply p-6;
  }
}
```

## 架构方法论对比

### 对比表格

| 方法论 | 优势 | 劣势 | 适用场景 |
|--------|------|------|----------|
| **BEM** | • 命名规范明确<br>• 组件化思维<br>• 避免样式冲突 | • 类名较长<br>• 学习成本中等 | 中大型项目，团队协作 |
| **OOCSS** | • 高复用性<br>• 模块化程度高<br>• 性能较好 | • 抽象程度高<br>• 需要良好设计 | 设计系统，组件库 |
| **SMACSS** | • 结构清晰<br>• 易于维护<br>• 适合大型项目 | • 分类较复杂<br>• 需要严格遵循 | 大型项目，长期维护 |
| **原子化** | • 一致性强<br>• 开发速度快<br>• 文件体积可控 | • HTML类名冗长<br>• 自定义样式困难 | 快速原型，设计系统 |

### 选择建议

#### 项目规模考虑
- **小型项目**：原子化CSS（Tailwind CSS）
- **中型项目**：BEM + 预处理器
- **大型项目**：SMACSS + 组件化方案
- **组件库**：OOCSS + 设计系统

#### 团队考虑
- **新手团队**：原子化CSS，学习成本低
- **经验团队**：BEM或SMACSS，更灵活
- **设计师主导**：原子化CSS，设计系统一致性好

## 项目实战应用

### 混合架构方案

实际项目中，通常会结合多种方法论的优势。

```scss
// 1. 基础重置和工具类（SMACSS Base + 原子化）
@import 'base/reset';
@import 'base/typography';
@import 'utilities/spacing';
@import 'utilities/colors';

// 2. 布局组件（SMACSS Layout）
@import 'layout/header';
@import 'layout/sidebar';
@import 'layout/main';
@import 'layout/footer';

// 3. UI组件（BEM + OOCSS）
@import 'components/button';
@import 'components/card';
@import 'components/form';
@import 'components/navigation';

// 4. 页面特定样式（SMACSS Pages）
@import 'pages/home';
@import 'pages/product';

// 5. 状态样式（SMACSS State）
@import 'state/loading';
@import 'state/active';
@import 'state/disabled';

// 6. 主题样式（SMACSS Theme）
@import 'themes/light';
@import 'themes/dark';
```

### 样式指南文档

创建完整的样式指南，确保团队一致性。

```markdown
# 样式指南

## 命名规范

### BEM命名
- Block: `.component-name`
- Element: `.component-name__element-name`
- Modifier: `.component-name--modifier-name`

### 状态类
- `.is-active`, `.is-disabled`, `.is-loading`
- `.has-error`, `.has-success`

### 工具类
- 间距: `.m-{size}`, `.p-{size}`, `.mt-{size}` etc.
- 颜色: `.text-{color}`, `.bg-{color}`
- 布局: `.d-flex`, `.justify-center`, `.items-center`

## 代码组织

### 文件结构
```
styles/
├── abstracts/     # 变量、函数、混合器
├── base/          # 重置、基础样式
├── components/    # UI组件
├── layout/        # 布局组件
├── pages/         # 页面特定样式
├── utilities/     # 工具类
└── main.scss      # 主入口文件
```

### 导入顺序
1. 抽象层（变量、混合器）
2. 基础层（重置、排版）
3. 布局层
4. 组件层
5. 工具层
6. 页面层
```

## 🎯 实践练习

### 练习1：重构现有CSS
选择一个现有项目，使用BEM方法论重构其CSS架构：
- 识别组件和元素
- 重命名CSS类
- 优化代码结构

### 练习2：设计系统构建
使用OOCSS原则构建一个小型设计系统：
- 创建基础组件（按钮、卡片、表单）
- 实现主题系统
- 编写使用文档

### 练习3：原子化CSS实践
使用Tailwind CSS构建一个响应式页面：
- 使用原子化类构建布局
- 提取常用组件
- 实现暗色主题切换

## 📚 延伸阅读

- [BEM官方文档](https://bem.info/)
- [OOCSS GitHub](https://github.com/stubbornella/oocss)
- [SMACSS指南](http://smacss.com/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [CSS Architecture](https://www.amazon.com/CSS-Architecture-Scalable-Maintainable-Applications/dp/1491906731)

## 🔗 下一步学习

完成CSS架构学习后，继续学习：
- [动画与过渡](./03-animations.md)
- [CSS高级特性](./04-advanced-features.md)
- CSS工程化与性能优化

---

良好的CSS架构是构建可维护大型项目的基础，选择适合的方法论并持续优化！ 🏗️ 