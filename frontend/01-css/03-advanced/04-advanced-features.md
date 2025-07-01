# CSS高级特性

现代CSS提供了许多强大的高级特性，这些特性大大扩展了CSS的能力，让开发者能够创建更加复杂和动态的样式效果。

## 📋 目录

1. [CSS变量(自定义属性)](#css变量自定义属性)
2. [现代CSS函数](#现代css函数)
3. [滤镜与混合模式](#滤镜与混合模式)
4. [CSS Grid深入应用](#css-grid深入应用)
5. [Container Queries容器查询](#container-queries容器查询)
6. [CSS Houdini](#css-houdini)
7. [新兴CSS特性](#新兴css特性)
8. [兼容性处理](#兼容性处理)

## CSS变量(自定义属性)

### 基础语法

CSS变量（也称为自定义属性）允许在CSS中定义可重用的值。

```css
:root {
  /* 定义全局变量 */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 16px;
  --border-radius: 4px;
  --spacing-unit: 8px;
}

.component {
  /* 使用变量 */
  background-color: var(--primary-color);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 2);
}
```

### 变量作用域

```css
/* 全局作用域 */
:root {
  --global-color: #333;
}

/* 局部作用域 */
.card {
  --local-color: #fff;
  --card-padding: 1rem;
  
  background-color: var(--local-color);
  padding: var(--card-padding);
}

.card--dark {
  /* 重新定义局部变量 */
  --local-color: #222;
  --text-color: #fff;
}
```

### 默认值和回退

```css
.element {
  /* 提供回退值 */
  color: var(--text-color, #333);
  
  /* 多层回退 */
  font-size: var(--large-text, var(--medium-text, 16px));
  
  /* 使用其他变量作为回退 */
  background: var(--primary-bg, var(--default-bg));
}
```

### 动态变量更新

```css
/* CSS中定义 */
.theme-switcher {
  --bg-color: #fff;
  --text-color: #333;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* JavaScript中动态修改 */
```

```javascript
// JavaScript动态修改CSS变量
const root = document.documentElement;

// 切换到暗色主题
function switchToDarkTheme() {
  root.style.setProperty('--bg-color', '#333');
  root.style.setProperty('--text-color', '#fff');
}

// 切换到亮色主题
function switchToLightTheme() {
  root.style.setProperty('--bg-color', '#fff');
  root.style.setProperty('--text-color', '#333');
}
```

### 实战案例：主题系统

```css
/* 主题变量定义 */
:root {
  /* 亮色主题 */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #adb5bd;
  
  --border-color: #dee2e6;
  --shadow-color: rgba(0, 0, 0, 0.15);
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-primary: #0d6efd;
  --color-secondary: #6c757d;
  --color-success: #198754;
  --color-danger: #dc3545;
  
  --bg-primary: #212529;
  --bg-secondary: #343a40;
  --bg-tertiary: #495057;
  
  --text-primary: #ffffff;
  --text-secondary: #adb5bd;
  --text-muted: #6c757d;
  
  --border-color: #495057;
  --shadow-color: rgba(0, 0, 0, 0.5);
}

/* 组件使用主题变量 */
.card {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.button {
  background-color: var(--color-primary);
  color: var(--bg-primary);
  border: 1px solid var(--color-primary);
}

.button--secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### 计算属性

```css
:root {
  --base-size: 16px;
  --scale-ratio: 1.25;
}

.typography {
  /* 使用calc()计算 */
  --h1-size: calc(var(--base-size) * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio));
  --h2-size: calc(var(--base-size) * var(--scale-ratio) * var(--scale-ratio));
  --h3-size: calc(var(--base-size) * var(--scale-ratio));
  --p-size: var(--base-size);
  --small-size: calc(var(--base-size) / var(--scale-ratio));
}

h1 { font-size: var(--h1-size); }
h2 { font-size: var(--h2-size); }
h3 { font-size: var(--h3-size); }
p { font-size: var(--p-size); }
small { font-size: var(--small-size); }
```

## 现代CSS函数

### calc() 函数

进行数学计算，支持混合单位。

```css
.responsive-layout {
  /* 混合单位计算 */
  width: calc(100% - 40px);
  height: calc(100vh - 120px);
  
  /* 复杂计算 */
  font-size: calc(1rem + 2vw);
  margin: calc(var(--spacing-base) * 2);
  
  /* 嵌套计算 */
  padding: calc(calc(100% / 3) - 20px);
}

.grid-item {
  /* 响应式网格 */
  width: calc((100% - (var(--gap) * (var(--columns) - 1))) / var(--columns));
}
```

### min(), max(), clamp() 函数

控制值的范围。

```css
.responsive-text {
  /* 限制最小值 */
  font-size: max(16px, 4vw);
  
  /* 限制最大值 */
  width: min(90%, 1200px);
  
  /* 限制范围 */
  font-size: clamp(14px, 4vw, 22px);
  padding: clamp(1rem, 5%, 3rem);
}

.container {
  /* 响应式容器 */
  width: min(90%, 1200px);
  margin: 0 auto;
  padding: clamp(1rem, 5vw, 3rem);
}
```

### 颜色函数

#### hsl() 和 hsla()
```css
.color-variations {
  /* HSL颜色 */
  background-color: hsl(210, 100%, 50%); /* 蓝色 */
  border-color: hsl(210, 100%, 40%); /* 深蓝色 */
  
  /* HSLA带透明度 */
  box-shadow: 0 4px 8px hsla(210, 100%, 50%, 0.3);
}

/* 动态颜色变化 */
.dynamic-colors {
  --hue: 210;
  --saturation: 100%;
  --lightness: 50%;
  
  background-color: hsl(var(--hue), var(--saturation), var(--lightness));
}

.dynamic-colors:hover {
  --lightness: 40%;
}
```

#### color-mix() 函数（实验性）
```css
.color-mixing {
  /* 混合两种颜色 */
  background-color: color-mix(in srgb, blue 70%, white);
  border-color: color-mix(in srgb, var(--primary-color) 80%, black);
}
```

### 数学函数

#### sin(), cos(), tan()
```css
.trigonometric {
  /* 三角函数创建波形 */
  transform: translateY(calc(sin(var(--angle)) * 50px));
  
  /* 创建圆形排列 */
  --angle: 45deg;
  left: calc(cos(var(--angle)) * 100px + 50%);
  top: calc(sin(var(--angle)) * 100px + 50%);
}
```

#### pow(), sqrt(), log()
```css
.advanced-math {
  /* 指数函数 */
  font-size: calc(pow(1.2, var(--level)) * 1rem);
  
  /* 平方根 */
  border-radius: calc(sqrt(var(--area)) * 1px);
  
  /* 对数函数 */
  opacity: calc(log(var(--importance)) / 10);
}
```

## 滤镜与混合模式

### CSS滤镜

#### 基础滤镜
```css
.filter-examples {
  /* 模糊 */
  filter: blur(5px);
  
  /* 亮度 */
  filter: brightness(1.5);
  
  /* 对比度 */
  filter: contrast(1.2);
  
  /* 饱和度 */
  filter: saturate(0.5);
  
  /* 色相旋转 */
  filter: hue-rotate(90deg);
  
  /* 反色 */
  filter: invert(1);
  
  /* 灰度 */
  filter: grayscale(1);
  
  /* 棕褐色 */
  filter: sepia(0.8);
}
```

#### 组合滤镜
```css
.complex-filter {
  filter: 
    brightness(1.1) 
    contrast(1.1) 
    saturate(1.2) 
    hue-rotate(15deg);
}

.vintage-effect {
  filter: 
    sepia(0.5) 
    contrast(1.2) 
    brightness(1.1) 
    saturate(0.8);
}
```

#### 动态滤镜
```css
.interactive-filter {
  transition: filter 0.3s ease;
  filter: grayscale(1) brightness(0.8);
}

.interactive-filter:hover {
  filter: grayscale(0) brightness(1.1);
}

/* 滤镜动画 */
@keyframes filterAnimation {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.animated-filter {
  animation: filterAnimation 5s linear infinite;
}
```

### backdrop-filter

对元素背后的内容应用滤镜。

```css
.glass-effect {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}

.frosted-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) brightness(1.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 混合模式

#### background-blend-mode
```css
.blend-background {
  background: 
    url('texture.jpg'),
    linear-gradient(45deg, #ff6b6b, #4ecdc4);
  background-blend-mode: multiply;
}

.color-overlay {
  background: 
    url('image.jpg'),
    rgba(255, 0, 0, 0.3);
  background-blend-mode: overlay;
}
```

#### mix-blend-mode
```css
.blend-content {
  mix-blend-mode: multiply;
}

.text-cutout {
  background: black;
  color: white;
  mix-blend-mode: screen;
}

.colorful-blend {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  mix-blend-mode: difference;
}
```

## CSS Grid深入应用

### 高级网格布局

#### 命名网格线
```css
.advanced-grid {
  display: grid;
  grid-template-columns: [sidebar-start] 250px [sidebar-end main-start] 1fr [main-end];
  grid-template-rows: [header-start] 80px [header-end content-start] 1fr [content-end footer-start] 60px [footer-end];
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
}

.grid-item {
  grid-column: sidebar-start / main-end;
  grid-row: header-start / content-end;
}
```

#### 子网格（Subgrid）
```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.child-grid {
  grid-column: span 2;
  display: grid;
  grid-template-columns: subgrid;
  gap: inherit;
}
```

#### 响应式网格
```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(1rem, 4vw, 2rem);
}

.masonry-like {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: masonry; /* 实验性特性 */
}
```

## Container Queries容器查询

### 基础语法

容器查询允许根据父容器的尺寸来应用样式。

```css
/* 定义容器 */
.container {
  container-type: inline-size;
  container-name: sidebar;
}

/* 容器查询 */
@container sidebar (min-width: 300px) {
  .card {
    display: flex;
    flex-direction: row;
  }
  
  .card__image {
    width: 40%;
  }
  
  .card__content {
    width: 60%;
  }
}

@container sidebar (max-width: 299px) {
  .card {
    display: block;
  }
  
  .card__image {
    width: 100%;
  }
}
```

### 实际应用场景

```css
.component-container {
  container-type: inline-size;
}

/* 小尺寸布局 */
@container (max-width: 400px) {
  .component {
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .component__header {
    text-align: center;
  }
  
  .component__actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* 大尺寸布局 */
@container (min-width: 600px) {
  .component {
    padding: 2rem;
    font-size: 1.1rem;
  }
  
  .component__header {
    text-align: left;
  }
  
  .component__actions {
    flex-direction: row;
    gap: 1rem;
  }
}
```

## CSS Houdini

### CSS Paint API

创建自定义的CSS图像。

```javascript
// paint-worklet.js
class CirclePattern {
  paint(ctx, geom, properties) {
    const radius = 20;
    const spacing = 40;
    
    ctx.fillStyle = '#007bff';
    
    for (let x = radius; x < geom.width; x += spacing) {
      for (let y = radius; y < geom.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

registerPaint('circle-pattern', CirclePattern);
```

```css
/* 注册和使用Paint Worklet */
.custom-background {
  background-image: paint(circle-pattern);
}

/* 在HTML中注册 */
```

```html
<script>
  CSS.paintWorklet.addModule('paint-worklet.js');
</script>
```

### CSS Properties and Values API

定义自定义CSS属性。

```javascript
// 注册自定义属性
CSS.registerProperty({
  name: '--my-color',
  syntax: '<color>',
  inherits: false,
  initialValue: 'red'
});

CSS.registerProperty({
  name: '--my-percentage',
  syntax: '<percentage>',
  inherits: true,
  initialValue: '50%'
});
```

```css
.custom-property {
  --my-color: blue;
  --my-percentage: 75%;
  
  background-color: var(--my-color);
  width: var(--my-percentage);
  
  /* 动画自定义属性 */
  transition: --my-percentage 0.3s ease;
}

.custom-property:hover {
  --my-percentage: 100%;
}
```

## 新兴CSS特性

### CSS嵌套

原生CSS嵌套支持（部分浏览器支持）。

```css
.card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  
  & .title {
    font-size: 1.2rem;
    font-weight: bold;
    
    & span {
      color: #666;
    }
  }
  
  & .content {
    margin-top: 1rem;
    
    & p {
      margin-bottom: 0.5rem;
    }
  }
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
```

### CSS级联层（@layer）

控制CSS的级联顺序。

```css
/* 定义层级顺序 */
@layer reset, base, components, utilities;

@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }
}

@layer components {
  .button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
}

@layer utilities {
  .hidden {
    display: none !important;
  }
}
```

### 视口单位改进

新的视口单位提供更好的移动端支持。

```css
.hero-section {
  /* 传统视口单位 */
  height: 100vh;
  
  /* 新的视口单位 */
  height: 100dvh; /* 动态视口高度 */
  height: 100lvh; /* 大视口高度 */
  height: 100svh; /* 小视口高度 */
}

.mobile-friendly {
  /* 考虑移动端地址栏的高度 */
  min-height: 100dvh;
  padding: 1rem;
}
```

### CSS比较函数增强

```css
.advanced-sizing {
  /* 更复杂的比较 */
  width: max(
    min(70vw, 800px),
    300px
  );
  
  /* 响应式字体 */
  font-size: clamp(
    1rem,
    calc(1rem + 2vw),
    max(2rem, calc(1rem + 4vw))
  );
}
```

## 兼容性处理

### 特性检测

#### @supports规则
```css
/* 检测CSS Grid支持 */
.container {
  display: flex; /* 回退方案 */
}

@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}

/* 检测backdrop-filter支持 */
.modal {
  background: rgba(0, 0, 0, 0.8); /* 回退方案 */
}

@supports (backdrop-filter: blur(10px)) {
  .modal {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
}
```

#### CSS变量兼容性
```css
.element {
  /* 回退值 */
  color: #333;
  color: var(--text-color, #333);
  
  /* 检测变量支持 */
  background: blue;
}

@supports (--custom: property) {
  .element {
    background: var(--primary-color, blue);
  }
}
```

### 渐进增强

```css
/* 基础样式 */
.enhanced-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

/* 增强样式 */
@supports (backdrop-filter: blur(10px)) {
  .enhanced-button {
    background: rgba(0, 123, 255, 0.8);
    backdrop-filter: blur(10px);
  }
}

@supports (color: color-mix(in srgb, blue 70%, white)) {
  .enhanced-button:hover {
    background: color-mix(in srgb, #007bff 70%, white);
  }
}
```

### PostCSS处理

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-custom-properties')({
      preserve: false // 移除变量，只保留计算值
    }),
    require('postcss-preset-env')({
      stage: 1, // 启用stage 1特性
      features: {
        'custom-properties': false // 禁用已处理的特性
      }
    })
  ]
}
```

## 🎯 实践练习

### 练习1：主题系统实现
创建一个完整的主题切换系统：
- 使用CSS变量定义颜色方案
- 实现亮色/暗色主题切换
- 支持自定义主题色
- 保存用户主题偏好

### 练习2：现代布局组件
使用新CSS特性创建布局组件：
- Container Queries响应式卡片
- CSS Grid高级布局
- 玻璃拟态效果
- 动态滤镜效果

### 练习3：高级动画效果
结合多种CSS特性创建动画：
- 使用CSS变量的动态动画
- 滤镜动画效果
- 3D变换组合
- 混合模式动画

## 📚 延伸阅读

- [MDN CSS高级特性](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Houdini规范](https://drafts.css-houdini.org/)
- [Container Queries指南](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [CSS最新特性追踪](https://caniuse.com/)
- [Web.dev CSS文章](https://web.dev/learn/css/)

## 🔗 下一步学习

完成CSS高级特性学习后，可以继续探索：
- CSS工程化与构建工具
- CSS性能优化技巧
- 设计系统构建
- CSS框架源码分析
- Web Components样式封装

---

掌握CSS高级特性让你能够创建更加现代、强大和灵活的网页样式！ 🚀 