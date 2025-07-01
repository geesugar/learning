# SVG 快速入门指南

> 7天快速上手SVG，从零开始创建你的第一个矢量图形！

## 🎯 第一周学习目标

通过7天的学习，您将能够：
- 理解SVG的基本概念和优势
- 创建基本的SVG图形
- 掌握SVG的基本语法结构
- 应用简单的样式和颜色
- 完成第一个SVG项目

## 📅 7天学习计划

### Day 1：认识SVG
**学习时间：1-2小时**

#### 理论学习
- SVG是什么？为什么使用SVG？
- SVG vs PNG/JPG的区别
- SVG的应用场景

#### 实践练习
```svg
<!-- 你的第一个SVG -->
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="red"/>
  <text x="100" y="180" text-anchor="middle" font-size="16">Hello SVG!</text>
</svg>
```

#### 学习成果
- 创建包含圆形和文本的SVG
- 理解SVG的基本结构

### Day 2：基本图形
**学习时间：1-2小时**

#### 理论学习
- 矩形、圆形、椭圆的绘制
- 基本属性：位置、大小、颜色

#### 实践练习
```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 矩形 -->
  <rect x="10" y="10" width="100" height="80" fill="blue"/>
  
  <!-- 圆形 -->
  <circle cx="170" cy="50" r="40" fill="green"/>
  
  <!-- 椭圆 -->
  <ellipse cx="250" cy="50" rx="30" ry="20" fill="orange"/>
  
  <!-- 线条 -->
  <line x1="10" y1="120" x2="290" y2="120" stroke="black" stroke-width="2"/>
</svg>
```

#### 学习成果
- 掌握基本图形的绘制方法
- 理解坐标系统

### Day 3：样式和颜色
**学习时间：1-2小时**

#### 理论学习
- 填充和描边
- 颜色表示方法
- 基本CSS样式

#### 实践练习
```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <style>
    .fancy-rect {
      fill: #ff6b6b;
      stroke: #4ecdc4;
      stroke-width: 3;
      stroke-dasharray: 5,5;
    }
  </style>
  
  <rect x="50" y="50" width="200" height="100" class="fancy-rect"/>
</svg>
```

#### 学习成果
- 掌握样式设置方法
- 理解填充和描边的区别

### Day 4：文本和分组
**学习时间：1-2小时**

#### 理论学习
- 文本元素的使用
- 分组元素`<g>`
- 基本的变换

#### 实践练习
```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(150, 100)">
    <circle r="50" fill="lightblue" stroke="navy" stroke-width="2"/>
    <text text-anchor="middle" dy="5" font-size="14" fill="navy">SVG图标</text>
  </g>
</svg>
```

#### 学习成果
- 掌握文本的添加和居中
- 理解分组和变换的概念

### Day 5：路径基础
**学习时间：1-2小时**

#### 理论学习
- 路径元素`<path>`
- 基本路径命令：M、L、Z
- 简单的曲线

#### 实践练习
```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 三角形 -->
  <path d="M 50 150 L 100 50 L 150 150 Z" fill="red" stroke="black"/>
  
  <!-- 简单曲线 -->
  <path d="M 200 150 Q 250 50 300 150" fill="none" stroke="blue" stroke-width="3"/>
</svg>
```

#### 学习成果
- 理解路径的基本概念
- 掌握简单路径的绘制

### Day 6：简单动画
**学习时间：1-2小时**

#### 理论学习
- CSS动画在SVG中的应用
- 基本的旋转和缩放动画

#### 实践练习
```svg
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <style>
    .rotating {
      animation: rotate 2s linear infinite;
      transform-origin: 100px 100px;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
  
  <circle cx="100" cy="100" r="50" fill="orange" class="rotating"/>
</svg>
```

#### 学习成果
- 掌握简单的CSS动画
- 理解动画的基本原理

### Day 7：综合项目
**学习时间：2-3小时**

#### 项目：创建一个简单的天气图标
```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <style>
    .sun { fill: #ffdd44; }
    .cloud { fill: #ffffff; stroke: #cccccc; stroke-width: 2; }
    .rain { stroke: #4488ff; stroke-width: 2; }
    .sun-rotate {
      animation: rotate 10s linear infinite;
      transform-origin: 80px 80px;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
  
  <!-- 太阳 -->
  <g class="sun-rotate">
    <circle cx="80" cy="80" r="25" class="sun"/>
    <g stroke="#ffdd44" stroke-width="3">
      <line x1="80" y1="40" x2="80" y2="30"/>
      <line x1="80" y1="130" x2="80" y2="120"/>
      <line x1="40" y1="80" x2="30" y2="80"/>
      <line x1="130" y1="80" x2="120" y2="80"/>
    </g>
  </g>
  
  <!-- 云朵 -->
  <g class="cloud">
    <ellipse cx="200" cy="70" rx="30" ry="20"/>
    <ellipse cx="220" cy="60" rx="25" ry="18"/>
    <ellipse cx="240" cy="70" rx="20" ry="15"/>
  </g>
  
  <!-- 雨滴 -->
  <g class="rain">
    <line x1="190" y1="100" x2="185" y2="120"/>
    <line x1="210" y1="100" x2="205" y2="120"/>
    <line x1="230" y1="100" x2="225" y2="120"/>
    <line x1="250" y1="100" x2="245" y2="120"/>
  </g>
  
  <text x="150" y="180" text-anchor="middle" font-size="18" fill="#333">今日天气</text>
</svg>
```

#### 学习成果
- 完成第一个完整的SVG项目
- 综合运用所学知识

## 🛠️ 开发环境设置

### 基础工具
1. **文本编辑器**
   - VS Code（推荐）
   - Sublime Text
   - Atom

2. **VS Code推荐插件**
   - SVG Viewer
   - SVG Preview
   - Auto Rename Tag

3. **浏览器**
   - Chrome（推荐，开发者工具强大）
   - Firefox
   - Safari

### 在线工具
1. **在线编辑器**
   - [CodePen](https://codepen.io/) - 在线代码编辑
   - [JSFiddle](https://jsfiddle.net/) - 在线调试
   - [SVG-Edit](https://github.com/SVG-Edit/svgedit) - 在线SVG编辑器

2. **实用工具**
   - [SVG Path Visualizer](https://svg-path-visualizer.netlify.app/) - 路径可视化
   - [SVG OMG](https://jakearchibald.github.io/svgomg/) - SVG优化
   - [Boxy SVG](https://boxy-svg.com/) - 在线SVG编辑

## 📝 学习检查清单

### 第一周完成后，您应该能够：
- [ ] 理解SVG的基本概念和优势
- [ ] 创建基本图形（矩形、圆形、椭圆、线条）
- [ ] 设置填充和描边样式
- [ ] 添加和格式化文本
- [ ] 使用分组和基本变换
- [ ] 绘制简单的路径
- [ ] 创建基本的CSS动画
- [ ] 完成一个综合项目

### 自我评估
在每天学习结束后，问自己：
1. 今天学到的概念我能用自己的话解释吗？
2. 我能不看教程独立完成今天的练习吗？
3. 我遇到的问题都解决了吗？

## 🎯 下一步学习

完成快速入门后，您可以：
1. 深入学习 [SVG基础概念](01-foundations/01-svg-fundamentals.md)
2. 继续学习 [基本图形绘制](01-foundations/02-basic-shapes.md)
3. 开始练习更复杂的项目

## 📚 快速参考

### 常用SVG元素
```svg
<!-- 基本图形 -->
<rect x="0" y="0" width="100" height="50"/>
<circle cx="50" cy="50" r="25"/>
<ellipse cx="50" cy="50" rx="30" ry="20"/>
<line x1="0" y1="0" x2="100" y2="100"/>

<!-- 文本 -->
<text x="50" y="50">Hello SVG</text>

<!-- 路径 -->
<path d="M 10 10 L 100 100"/>

<!-- 分组 -->
<g transform="translate(50, 50)">
  <circle r="25"/>
</g>
```

### 常用样式属性
```css
/* 填充和描边 */
fill: red;
stroke: blue;
stroke-width: 2;

/* 文本样式 */
font-size: 16px;
text-anchor: middle;

/* 透明度 */
opacity: 0.5;
```

---

🚀 **准备好开始了吗？** 让我们从第一天开始，创建你的第一个SVG图形！ 