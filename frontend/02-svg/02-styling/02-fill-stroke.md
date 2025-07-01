# 填充与描边

填充（fill）和描边（stroke）是SVG图形视觉效果的核心要素。本章将深入探讨SVG的填充和描边系统，掌握各种高级属性和技巧。

## 🎯 学习目标

完成本章学习后，您将能够：
- 掌握所有填充和描边相关属性
- 理解填充规则和路径方向
- 创建复杂的描边效果
- 应用透明度和混合模式
- 实现动态的填充和描边效果

## 🎨 填充系统（Fill）

### 基础填充属性

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- 基本颜色填充 -->
  <rect x="10" y="10" width="80" height="60" fill="red"/>
  <rect x="110" y="10" width="80" height="60" fill="#00ff00"/>
  <rect x="210" y="10" width="80" height="60" fill="rgb(0, 0, 255)"/>
  <rect x="310" y="10" width="80" height="60" fill="hsl(300, 100%, 50%)"/>
  
  <!-- 透明度控制 -->
  <rect x="10" y="90" width="80" height="60" fill="red" fill-opacity="0.5"/>
  <rect x="110" y="90" width="80" height="60" fill="rgba(0, 255, 0, 0.7)"/>
  
  <!-- 无填充 -->
  <rect x="210" y="90" width="80" height="60" fill="none" stroke="black"/>
  
  <!-- 继承填充 -->
  <g fill="orange">
    <rect x="310" y="90" width="80" height="60"/>
  </g>
</svg>
```

### currentColor 关键字

`currentColor`是一个特殊值，表示当前元素的`color`属性值：

```html
<style>
.icon-container {
  color: #007bff;
}

.icon-container:hover {
  color: #0056b3;
}
</style>

<div class="icon-container">
  <svg width="100" height="100" viewBox="0 0 100 100">
    <!-- fill会使用当前color值 -->
    <circle cx="50" cy="50" r="40" fill="currentColor"/>
    <rect x="30" y="30" width="40" height="40" fill="currentColor" opacity="0.5"/>
  </svg>
</div>
```

### 填充规则（fill-rule）

填充规则决定了复杂路径的内外判断：

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <style>
    .shape-text { font-size: 12px; text-anchor: middle; }
  </style>
  
  <!-- nonzero规则 (默认) -->
  <g transform="translate(100, 100)">
    <path d="M-50,-50 L50,-50 L50,50 L-50,50 Z 
             M-25,-25 L-25,25 L25,25 L25,-25 Z" 
          fill="lightblue" 
          fill-rule="nonzero"/>
    <text x="0" y="70" class="shape-text">nonzero</text>
  </g>
  
  <!-- evenodd规则 -->
  <g transform="translate(300, 100)">
    <path d="M-50,-50 L50,-50 L50,50 L-50,50 Z 
             M-25,-25 L-25,25 L25,25 L25,-25 Z" 
          fill="lightcoral" 
          fill-rule="evenodd"/>
    <text x="0" y="70" class="shape-text">evenodd</text>
  </g>
</svg>
```

### 填充规则详解

**nonzero规则**：
- 从点向无穷远处画一条射线
- 计算射线与路径边的交点
- 顺时针交点+1，逆时针交点-1
- 结果非零则填充

**evenodd规则**：
- 从点向无穷远处画一条射线
- 计算射线与路径边的交点数量
- 奇数填充，偶数不填充

## ✏️ 描边系统（Stroke）

### 基础描边属性

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 基本描边 -->
  <line x1="10" y1="20" x2="100" y2="20" stroke="red" stroke-width="2"/>
  <line x1="10" y1="40" x2="100" y2="40" stroke="#00ff00" stroke-width="4"/>
  <line x1="10" y1="60" x2="100" y2="60" stroke="rgb(0,0,255)" stroke-width="6"/>
  
  <!-- 描边透明度 -->
  <line x1="10" y1="90" x2="100" y2="90" stroke="red" stroke-width="8" stroke-opacity="0.5"/>
  <line x1="10" y1="110" x2="100" y2="110" stroke="rgba(255,0,0,0.3)" stroke-width="8"/>
  
  <!-- 描边样式 -->
  <line x1="120" y1="20" x2="210" y2="20" stroke="black" stroke-width="3" stroke-linecap="butt"/>
  <line x1="120" y1="40" x2="210" y2="40" stroke="black" stroke-width="3" stroke-linecap="round"/>
  <line x1="120" y1="60" x2="210" y2="60" stroke="black" stroke-width="3" stroke-linecap="square"/>
  
  <!-- 线条连接 -->
  <polyline points="120,90 150,110 180,90 210,110" 
            fill="none" stroke="blue" stroke-width="4" stroke-linejoin="miter"/>
  <polyline points="120,130 150,150 180,130 210,150" 
            fill="none" stroke="blue" stroke-width="4" stroke-linejoin="round"/>
  <polyline points="120,170 150,190 180,170 210,190" 
            fill="none" stroke="blue" stroke-width="4" stroke-linejoin="bevel"/>
</svg>
```

### 虚线描边（stroke-dasharray & stroke-dashoffset）

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- 基本虚线 -->
  <line x1="10" y1="20" x2="200" y2="20" stroke="black" stroke-width="2" 
        stroke-dasharray="5,5"/>
  
  <!-- 复杂虚线模式 -->
  <line x1="10" y1="40" x2="200" y2="40" stroke="blue" stroke-width="3" 
        stroke-dasharray="10,5,2,5"/>
  
  <!-- 点划线 -->
  <line x1="10" y1="60" x2="200" y2="60" stroke="red" stroke-width="2" 
        stroke-dasharray="15,3,3,3"/>
  
  <!-- 动画虚线 -->
  <line x1="10" y1="80" x2="200" y2="80" stroke="green" stroke-width="3" 
        stroke-dasharray="10,5">
    <animate attributeName="stroke-dashoffset" 
             values="0;15" dur="1s" repeatCount="indefinite"/>
  </line>
  
  <!-- 路径描边动画 -->
  <path d="M 10,120 Q 100,100 200,120" fill="none" stroke="purple" stroke-width="3"
        stroke-dasharray="200" stroke-dashoffset="200">
    <animate attributeName="stroke-dashoffset" 
             values="200;0" dur="2s" fill="freeze"/>
  </path>
</svg>
```

### stroke-miterlimit 属性

当`stroke-linejoin="miter"`时，控制尖角的最大长度：

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <style>
    .label { font-size: 12px; text-anchor: middle; }
  </style>
  
  <!-- 不同的miter limit值 -->
  <g transform="translate(75, 50)">
    <polyline points="-30,0 0,-30 30,0" 
              fill="none" stroke="blue" stroke-width="8" 
              stroke-linejoin="miter" stroke-miterlimit="1"/>
    <text x="0" y="50" class="label">miterlimit="1"</text>
  </g>
  
  <g transform="translate(225, 50)">
    <polyline points="-30,0 0,-30 30,0" 
              fill="none" stroke="red" stroke-width="8" 
              stroke-linejoin="miter" stroke-miterlimit="4"/>
    <text x="0" y="50" class="label">miterlimit="4"</text>
  </g>
</svg>
```

## 🎭 透明度和混合模式

### 透明度控制

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <!-- 元素级透明度 -->
  <rect x="10" y="10" width="60" height="60" fill="red" opacity="1"/>
  <rect x="40" y="40" width="60" height="60" fill="blue" opacity="0.7"/>
  <rect x="70" y="70" width="60" height="60" fill="green" opacity="0.4"/>
  
  <!-- 填充和描边分别控制透明度 -->
  <rect x="150" y="10" width="60" height="60" 
        fill="red" fill-opacity="0.5"
        stroke="blue" stroke-width="4" stroke-opacity="0.8"/>
  
  <!-- 渐变透明度 -->
  <defs>
    <linearGradient id="alphaGradient">
      <stop offset="0%" stop-color="red" stop-opacity="1"/>
      <stop offset="100%" stop-color="red" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <rect x="220" y="10" width="60" height="60" fill="url(#alphaGradient)"/>
</svg>
```

### 混合模式（mix-blend-mode）

```html
<style>
.blend-container {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  padding: 20px;
}

.blend-circle {
  mix-blend-mode: multiply;
}

.blend-overlay {
  mix-blend-mode: overlay;
}

.blend-screen {
  mix-blend-mode: screen;
}
</style>

<div class="blend-container">
  <svg width="300" height="100" viewBox="0 0 300 100">
    <circle cx="50" cy="50" r="40" fill="yellow" class="blend-circle"/>
    <circle cx="125" cy="50" r="40" fill="magenta" class="blend-overlay"/>
    <circle cx="225" cy="50" r="40" fill="cyan" class="blend-screen"/>
  </svg>
</div>
```

## 🎯 高级技巧和应用

### 1. 渐变描边

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="50%" stop-color="#4ecdc4"/>
      <stop offset="100%" stop-color="#45b7d1"/>
    </linearGradient>
  </defs>
  
  <rect x="50" y="50" width="200" height="100" 
        fill="none" 
        stroke="url(#strokeGradient)" 
        stroke-width="8" 
        rx="10"/>
</svg>
```

### 2. 图案描边

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <defs>
    <pattern id="strokePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="5" height="5" fill="#ff6b6b"/>
      <rect x="5" y="5" width="5" height="5" fill="#4ecdc4"/>
    </pattern>
  </defs>
  
  <circle cx="150" cy="100" r="80" 
          fill="lightblue" 
          stroke="url(#strokePattern)" 
          stroke-width="10"/>
</svg>
```

### 3. 多重描边效果

```svg
<svg width="200" height="200" viewBox="0 0 200 200">
  <style>
    .multi-stroke {
      fill: white;
      stroke: #333;
      stroke-width: 1;
    }
  </style>
  
  <!-- 通过多个元素实现多重描边 -->
  <circle cx="100" cy="100" r="80" fill="none" stroke="#ff6b6b" stroke-width="12"/>
  <circle cx="100" cy="100" r="80" fill="none" stroke="white" stroke-width="8"/>
  <circle cx="100" cy="100" r="80" fill="none" stroke="#4ecdc4" stroke-width="4"/>
  <circle cx="100" cy="100" r="80" fill="lightblue"/>
</svg>
```

### 4. 响应式描边

```css
.responsive-stroke {
  stroke-width: 2;
}

@media (max-width: 768px) {
  .responsive-stroke {
    stroke-width: 1;
  }
}

@media (min-width: 1200px) {
  .responsive-stroke {
    stroke-width: 3;
  }
}
```

## 🎨 动画效果

### 填充颜色动画

```svg
<svg width="200" height="100" viewBox="0 0 200 100">
  <rect x="50" y="25" width="100" height="50" fill="red">
    <animate attributeName="fill" 
             values="red;blue;green;red" 
             dur="3s" 
             repeatCount="indefinite"/>
  </rect>
</svg>
```

### 描边动画

```svg
<svg width="300" height="100" viewBox="0 0 300 100">
  <line x1="50" y1="50" x2="250" y2="50" 
        stroke="blue" stroke-width="4" 
        stroke-dasharray="10,5" stroke-dashoffset="0">
    <!-- 描边颜色动画 -->
    <animate attributeName="stroke" 
             values="blue;red;green;blue" 
             dur="2s" 
             repeatCount="indefinite"/>
    
    <!-- 描边宽度动画 -->
    <animate attributeName="stroke-width" 
             values="4;8;2;4" 
             dur="3s" 
             repeatCount="indefinite"/>
    
    <!-- 虚线偏移动画 -->
    <animate attributeName="stroke-dashoffset" 
             values="0;15" 
             dur="1s" 
             repeatCount="indefinite"/>
  </line>
</svg>
```

### 路径描边绘制动画

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <style>
    .draw-path {
      fill: none;
      stroke: #333;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  </style>
  
  <!-- 计算路径总长度，然后设置dasharray和dashoffset -->
  <path d="M 50,50 Q 150,20 250,50 T 250,150 Q 150,180 50,150 Z" 
        class="draw-path"
        stroke-dasharray="500"
        stroke-dashoffset="500">
    <animate attributeName="stroke-dashoffset"
             values="500;0"
             dur="3s"
             fill="freeze"/>
  </path>
</svg>
```

## 🔧 实用工具和技巧

### 1. 计算路径长度

```javascript
// 获取路径总长度（用于动画）
function getPathLength(pathElement) {
  return pathElement.getTotalLength();
}

// 自动设置路径描边动画
function setupPathDrawAnimation(pathElement, duration = 2000) {
  const length = pathElement.getTotalLength();
  
  // 设置初始状态
  pathElement.style.strokeDasharray = length;
  pathElement.style.strokeDashoffset = length;
  
  // 创建动画
  pathElement.animate({
    strokeDashoffset: [length, 0]
  }, {
    duration: duration,
    fill: 'forwards'
  });
}
```

### 2. 动态颜色生成

```javascript
// 生成随机颜色
function randomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

// 根据数值生成颜色
function valueToColor(value, min, max) {
  const hue = ((value - min) / (max - min)) * 120; // 0-120度，红到绿
  return `hsl(${hue}, 70%, 60%)`;
}

// 应用到SVG元素
function applyRandomColors(svgElement) {
  const shapes = svgElement.querySelectorAll('rect, circle, path');
  shapes.forEach(shape => {
    shape.setAttribute('fill', randomColor());
  });
}
```

### 3. 描边样式预设

```css
/* 预定义的描边样式 */
.stroke-solid { stroke-dasharray: none; }
.stroke-dashed { stroke-dasharray: 8,4; }
.stroke-dotted { stroke-dasharray: 2,3; }
.stroke-dash-dot { stroke-dasharray: 8,3,2,3; }

.stroke-thin { stroke-width: 1; }
.stroke-medium { stroke-width: 2; }
.stroke-thick { stroke-width: 4; }

.stroke-round { stroke-linecap: round; stroke-linejoin: round; }
.stroke-square { stroke-linecap: square; stroke-linejoin: miter; }
```

## 📝 练习项目

### 基础练习：描边样式库

创建一个展示各种描边样式的示例：

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <style>
    .style-label { font-size: 12px; font-family: Arial; }
  </style>
  
  <!-- 实线 -->
  <line x1="50" y1="30" x2="200" y2="30" stroke="black" stroke-width="3"/>
  <text x="220" y="35" class="style-label">实线</text>
  
  <!-- 虚线 -->
  <line x1="50" y1="60" x2="200" y2="60" stroke="blue" stroke-width="3" stroke-dasharray="8,4"/>
  <text x="220" y="65" class="style-label">虚线</text>
  
  <!-- 点线 -->
  <line x1="50" y1="90" x2="200" y2="90" stroke="red" stroke-width="3" stroke-dasharray="2,3"/>
  <text x="220" y="95" class="style-label">点线</text>
  
  <!-- 点划线 -->
  <line x1="50" y1="120" x2="200" y2="120" stroke="green" stroke-width="3" stroke-dasharray="8,3,2,3"/>
  <text x="220" y="125" class="style-label">点划线</text>
</svg>
```

### 中级练习：交互式填充规则演示

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .demo-container { text-align: center; padding: 20px; }
  .fill-rule-demo { cursor: pointer; transition: all 0.3s; }
  .fill-rule-demo:hover { stroke-width: 3; }
  .controls { margin: 20px 0; }
  button { margin: 0 10px; padding: 5px 15px; }
</style>
</head>
<body>
  <div class="demo-container">
    <svg width="300" height="200" viewBox="0 0 300 200">
      <path id="complexPath" 
            d="M 50,50 L 150,50 L 150,150 L 50,150 Z 
               M 75,75 L 75,125 L 125,125 L 125,75 Z
               M 200,50 L 250,100 L 200,150 L 175,125 L 200,100 L 175,75 Z" 
            fill="lightblue" 
            fill-rule="nonzero"
            stroke="blue" 
            stroke-width="2" 
            class="fill-rule-demo"/>
    </svg>
    
    <div class="controls">
      <button onclick="setFillRule('nonzero')">nonzero</button>
      <button onclick="setFillRule('evenodd')">evenodd</button>
      <button onclick="changeColor()">随机颜色</button>
    </div>
  </div>

  <script>
    function setFillRule(rule) {
      document.getElementById('complexPath').setAttribute('fill-rule', rule);
    }
    
    function changeColor() {
      const colors = ['lightblue', 'lightcoral', 'lightgreen', 'lightyellow', 'lightpink'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      document.getElementById('complexPath').setAttribute('fill', randomColor);
    }
  </script>
</body>
</html>
```

## 🎯 总结

填充和描边是SVG视觉设计的基础，掌握这些属性和技巧能够创建丰富多彩的图形效果。

### 关键要点：
1. **理解填充规则的差异和应用场景**
2. **掌握描边的各种样式属性**
3. **善用透明度和混合模式**
4. **利用动画增强视觉效果**
5. **建立可复用的样式系统**

### 最佳实践：
- 根据设计需求选择合适的填充规则
- 使用CSS变量管理颜色主题
- 为描边动画优化性能
- 保持样式的一致性和可维护性

继续学习[渐变与图案](03-gradients-patterns.md)，探索更高级的视觉效果技术。 