# SVG样式控制

SVG样式控制是创建美观、一致的SVG图形的基础。本章将深入探讨SVG样式设置的各种方法、选择器应用、样式继承规则以及响应式设计技巧。

## 🎯 学习目标

完成本章学习后，您将能够：
- 理解SVG样式设置的三种方法及其优缺点
- 掌握CSS选择器在SVG中的高级应用
- 理解SVG样式继承和层叠规则
- 实现响应式SVG设计
- 建立SVG样式的最佳实践

## 📚 SVG样式设置方法

### 1. 内联样式（Inline Styles）

内联样式直接在SVG元素上使用`style`属性设置样式。

```svg
<svg width="200" height="100">
  <rect x="10" y="10" width="100" height="50" 
        style="fill: blue; stroke: red; stroke-width: 2"/>
  <circle cx="150" cy="35" r="25" 
          style="fill: green; opacity: 0.7"/>
</svg>
```

**优点：**
- 优先级最高，样式生效确定
- 便于快速测试和调试
- 适合动态生成的SVG

**缺点：**
- 代码冗余，难以维护
- 无法实现样式复用
- 文件体积较大

### 2. 内部样式表（Internal Stylesheet）

在SVG内部使用`<style>`元素定义样式。

```svg
<svg width="200" height="100">
  <style>
    .blue-rect {
      fill: blue;
      stroke: red;
      stroke-width: 2;
    }
    
    .green-circle {
      fill: green;
      opacity: 0.7;
    }
    
    .hover-effect:hover {
      fill: orange;
      transition: fill 0.3s ease;
    }
  </style>
  
  <rect x="10" y="10" width="100" height="50" 
        class="blue-rect hover-effect"/>
  <circle cx="150" cy="35" r="25" 
          class="green-circle"/>
</svg>
```

**优点：**
- 样式集中管理，易于维护
- 支持类选择器和伪类
- 可以实现样式复用

**缺点：**
- 样式仅在当前SVG中有效
- 无法跨文件共享样式

### 3. 外部样式表（External Stylesheet）

通过外部CSS文件控制SVG样式。

**CSS文件 (styles.css):**
```css
.svg-container {
  width: 100%;
  max-width: 400px;
}

.primary-shape {
  fill: #007bff;
  stroke: #0056b3;
  stroke-width: 2;
}

.secondary-shape {
  fill: #28a745;
  opacity: 0.8;
}

.interactive-element:hover {
  fill: #fd7e14;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .svg-container {
    max-width: 200px;
  }
  
  .primary-shape {
    stroke-width: 1;
  }
}
```

**HTML文件:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <svg class="svg-container" viewBox="0 0 200 100">
    <rect x="10" y="10" width="100" height="50" 
          class="primary-shape interactive-element"/>
    <circle cx="150" cy="35" r="25" 
            class="secondary-shape"/>
  </svg>
</body>
</html>
```

**优点：**
- 样式完全分离，便于维护
- 支持媒体查询和响应式设计
- 可以跨多个SVG文件共享
- 支持CSS预处理器

**缺点：**
- 需要额外的HTTP请求
- 样式与SVG分离，调试略复杂

## 🎨 CSS选择器在SVG中的应用

### 基础选择器

```css
/* 元素选择器 */
rect { fill: blue; }
circle { fill: red; }
path { stroke: black; }

/* 类选择器 */
.highlight { fill: yellow; }
.border { stroke-width: 3; }

/* ID选择器 */
#logo { fill: #007bff; }
#background { fill: #f8f9fa; }

/* 属性选择器 */
[data-type="primary"] { fill: #007bff; }
[data-type="secondary"] { fill: #6c757d; }
```

### 高级选择器

```css
/* 后代选择器 */
.icon rect { fill: currentColor; }
.logo path { stroke: #000; }

/* 子选择器 */
.button-group > circle { fill: #28a745; }

/* 相邻兄弟选择器 */
.title + .subtitle { font-size: 14px; }

/* 伪类选择器 */
.interactive:hover { opacity: 0.8; }
.clickable:active { transform: scale(0.95); }
.focusable:focus { outline: 2px solid blue; }

/* 伪元素选择器 */
.tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  /* 更多样式... */
}
```

### 状态选择器

```css
/* 鼠标交互状态 */
.button:hover {
  fill: #0056b3;
  cursor: pointer;
}

.button:active {
  transform: translateY(1px);
}

/* 焦点状态 */
.focusable:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* 选中状态 */
.selectable.selected {
  fill: #007bff;
  stroke: #0056b3;
}

/* 禁用状态 */
.button:disabled,
.button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## 🔄 样式继承和层叠

### SVG样式继承规则

SVG元素会继承父元素的某些样式属性：

```svg
<svg width="300" height="200">
  <style>
    .parent-group {
      fill: blue;
      stroke: red;
      stroke-width: 2;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }
    
    .child-override {
      fill: green; /* 覆盖继承的fill */
    }
  </style>
  
  <g class="parent-group">
    <!-- 这个矩形继承所有父元素样式 -->
    <rect x="10" y="10" width="50" height="50"/>
    
    <!-- 这个矩形继承父元素样式，但覆盖fill -->
    <rect x="80" y="10" width="50" height="50" class="child-override"/>
    
    <!-- 文本继承字体相关样式 -->
    <text x="10" y="80">继承的文本</text>
  </g>
</svg>
```

### 样式优先级（从高到低）

1. **!important 声明**
2. **内联样式**
3. **ID选择器**
4. **类选择器、属性选择器、伪类**
5. **元素选择器、伪元素**
6. **继承样式**

```css
/* 优先级示例 */
#specific-id { fill: red; }           /* 权重: 100 */
.class-name { fill: blue; }           /* 权重: 10 */
rect { fill: green; }                 /* 权重: 1 */
rect { fill: yellow !important; }     /* 最高优先级 */
```

## 📱 响应式SVG设计

### 使用viewBox实现响应式

```html
<style>
  .responsive-svg {
    width: 100%;
    height: auto;
    max-width: 500px;
  }
  
  @media (max-width: 768px) {
    .responsive-svg {
      max-width: 300px;
    }
  }
</style>

<svg class="responsive-svg" viewBox="0 0 500 300">
  <rect x="50" y="50" width="400" height="200" fill="lightblue"/>
  <text x="250" y="150" text-anchor="middle" font-size="24">
    响应式SVG
  </text>
</svg>
```

### 媒体查询控制SVG样式

```css
/* 默认样式 */
.adaptive-icon {
  width: 64px;
  height: 64px;
}

.adaptive-icon .icon-detail {
  display: block;
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .adaptive-icon {
    width: 32px;
    height: 32px;
  }
  
  .adaptive-icon .icon-detail {
    display: none; /* 隐藏细节 */
  }
  
  .adaptive-icon .main-shape {
    stroke-width: 1; /* 减小线条粗细 */
  }
}

/* 高分辨率屏幕 */
@media (min-resolution: 2dppx) {
  .sharp-icon {
    stroke-width: 0.5;
  }
}
```

### CSS自定义属性（CSS变量）

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --border-width: 2px;
  --border-radius: 4px;
}

.themed-svg {
  --local-fill: var(--primary-color);
  --local-stroke: var(--secondary-color);
}

.themed-shape {
  fill: var(--local-fill);
  stroke: var(--local-stroke);
  stroke-width: var(--border-width);
}

/* 主题切换 */
.dark-theme {
  --primary-color: #0d6efd;
  --secondary-color: #adb5bd;
}
```

## 🛠️ 实际应用示例

### 1. 图标系统样式管理

```css
/* 图标基础样式 */
.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
  vertical-align: middle;
}

/* 图标尺寸变体 */
.icon-sm { width: 16px; height: 16px; }
.icon-lg { width: 32px; height: 32px; }
.icon-xl { width: 48px; height: 48px; }

/* 图标颜色变体 */
.icon-primary { color: #007bff; }
.icon-success { color: #28a745; }
.icon-warning { color: #ffc107; }
.icon-danger { color: #dc3545; }

/* 交互状态 */
.icon-button {
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
```

### 2. 动态主题切换

```html
<style>
  .theme-toggle {
    --bg-color: #ffffff;
    --text-color: #333333;
    --accent-color: #007bff;
  }
  
  .theme-toggle.dark {
    --bg-color: #333333;
    --text-color: #ffffff;
    --accent-color: #0d6efd;
  }
  
  .themed-svg {
    background: var(--bg-color);
    color: var(--text-color);
  }
  
  .themed-shape {
    fill: var(--accent-color);
  }
</style>

<div class="theme-toggle" id="theme-container">
  <svg class="themed-svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" class="themed-shape"/>
  </svg>
  <button onclick="toggleTheme()">切换主题</button>
</div>

<script>
function toggleTheme() {
  document.getElementById('theme-container').classList.toggle('dark');
}
</script>
```

## 🔧 性能优化和最佳实践

### 1. 样式优化策略

```css
/* 避免过度嵌套 */
/* 不好的做法 */
.container .header .nav .item .icon { fill: blue; }

/* 好的做法 */
.nav-icon { fill: blue; }

/* 使用高效的选择器 */
/* 避免通配符选择器 */
* { fill: inherit; }

/* 使用具体的选择器 */
.svg-icon { fill: inherit; }
```

### 2. 样式复用

```css
/* 创建可复用的样式类 */
.base-shape {
  stroke-width: 1;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.fill-primary { fill: #007bff; }
.fill-secondary { fill: #6c757d; }
.fill-success { fill: #28a745; }

.stroke-primary { stroke: #007bff; }
.stroke-secondary { stroke: #6c757d; }

/* 组合使用 */
.primary-button {
  @extend .base-shape;
  @extend .fill-primary;
  @extend .stroke-primary;
}
```

### 3. 条件样式加载

```html
<!-- 根据设备能力加载不同样式 -->
<link rel="stylesheet" 
      href="basic-styles.css">
<link rel="stylesheet" 
      href="advanced-styles.css" 
      media="(min-width: 768px)">
<link rel="stylesheet" 
      href="animations.css" 
      media="(prefers-reduced-motion: no-preference)">
```

## 📝 练习项目

### 基础练习：样式继承实验

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <style>
    .parent {
      fill: blue;
      stroke: red;
      stroke-width: 2;
      font-family: Arial;
      font-size: 16px;
    }
    
    .child-1 { fill: green; }
    .child-2 { stroke: black; }
    .child-3 { font-size: 20px; }
  </style>
  
  <g class="parent">
    <rect x="10" y="10" width="80" height="60"/>
    <rect x="110" y="10" width="80" height="60" class="child-1"/>
    <rect x="210" y="10" width="80" height="60" class="child-2"/>
    <text x="10" y="100">默认文本</text>
    <text x="10" y="130" class="child-3">大号文本</text>
  </g>
</svg>
```

### 中级练习：响应式图标

```html
<!DOCTYPE html>
<html>
<head>
<style>
.responsive-icon-container {
  padding: 20px;
  text-align: center;
}

.responsive-icon {
  width: 100px;
  height: 100px;
  transition: all 0.3s ease;
}

.detail-element {
  opacity: 1;
  transition: opacity 0.3s ease;
}

@media (max-width: 768px) {
  .responsive-icon {
    width: 60px;
    height: 60px;
  }
  
  .detail-element {
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .responsive-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
</head>
<body>
  <div class="responsive-icon-container">
    <svg class="responsive-icon" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="lightblue" stroke="blue" stroke-width="2"/>
      <circle cx="35" cy="35" r="5" fill="blue" class="detail-element"/>
      <circle cx="65" cy="35" r="5" fill="blue" class="detail-element"/>
      <path d="M 30 65 Q 50 85 70 65" stroke="blue" stroke-width="2" fill="none" class="detail-element"/>
    </svg>
    <p>调整窗口大小查看效果</p>
  </div>
</body>
</html>
```

## 🎯 总结

SVG样式控制是创建专业SVG图形的基础技能。通过合理选择样式设置方法、掌握CSS选择器的高级应用、理解样式继承规则，以及实现响应式设计，您可以创建既美观又高效的SVG图形。

### 关键要点：
1. **根据场景选择合适的样式方法**
2. **利用CSS选择器的强大功能**
3. **理解样式继承和优先级**
4. **实现响应式和自适应设计**
5. **建立可维护的样式体系**

继续学习[填充与描边](02-fill-stroke.md)，深入了解SVG的视觉效果控制技术。 