# SVG路径系统

> 掌握SVG最强大的绘图工具，创建任意复杂的矢量图形。

## 🎯 学习目标

通过本章学习，您将掌握：
- 路径元素的基本语法和概念
- 所有路径命令的使用方法
- 贝塞尔曲线的绘制和控制
- 复杂图形的构建技巧
- 路径优化和最佳实践

## 📚 路径基础概念

### 什么是路径
路径(`<path>`)是SVG中最强大和灵活的绘图元素，可以创建任何二维图形。

### 基本语法
```svg
<path d="路径数据" fill="填充色" stroke="描边色"/>
```

### 路径数据结构
路径数据由一系列命令和坐标组成：
- **命令字母**：指定绘制操作类型
- **坐标参数**：提供位置和控制信息
- **大小写区别**：大写为绝对坐标，小写为相对坐标

## 🎨 路径命令详解

### 移动命令 (M/m)
移动画笔到指定位置，不绘制线条。

```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>移动命令示例</title>
  
  <!-- 绝对移动 -->
  <path d="M 50 50 L 100 50 L 100 100 L 50 100 Z" 
        fill="none" stroke="#3498db" stroke-width="2"/>
  
  <!-- 相对移动 -->
  <path d="M 150 50 l 50 0 l 0 50 l -50 0 Z" 
        fill="none" stroke="#e74c3c" stroke-width="2"/>
  
  <!-- 多次移动 -->
  <path d="M 200 50 L 250 50 M 200 75 L 250 75 M 200 100 L 250 100" 
        stroke="#2ecc71" stroke-width="2"/>
  
  <!-- 标签 -->
  <text x="75" y="130" text-anchor="middle" font-size="12">绝对坐标</text>
  <text x="175" y="130" text-anchor="middle" font-size="12">相对坐标</text>
  <text x="225" y="130" text-anchor="middle" font-size="12">多次移动</text>
</svg>
```

### 直线命令 (L/l, H/h, V/v)

#### 直线到 (L/l)
```svg
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>直线命令示例</title>
  
  <!-- 基本直线 -->
  <path d="M 50 50 L 150 50 L 150 100 L 50 100 L 50 50" 
        fill="none" stroke="#3498db" stroke-width="2"/>
  
  <!-- 相对直线 -->
  <path d="M 200 50 l 100 0 l 0 50 l -100 0 l 0 -50" 
        fill="rgba(231, 76, 60, 0.3)" stroke="#e74c3c" stroke-width="2"/>
  
  <!-- 水平线 H/h -->
  <path d="M 50 150 H 150" stroke="#2ecc71" stroke-width="3"/>
  <path d="M 200 150 h 100" stroke="#f39c12" stroke-width="3"/>
  
  <!-- 垂直线 V/v -->
  <path d="M 350 50 V 150" stroke="#9b59b6" stroke-width="3"/>
  
  <!-- 标签 -->
  <text x="100" y="40" text-anchor="middle" font-size="10">直线框</text>
  <text x="250" y="40" text-anchor="middle" font-size="10">相对直线</text>
  <text x="100" y="175" text-anchor="middle" font-size="10">水平线H</text>
  <text x="250" y="175" text-anchor="middle" font-size="10">水平线h</text>
  <text x="350" y="175" text-anchor="middle" font-size="10">垂直线V</text>
</svg>
```

### 贝塞尔曲线命令

#### 三次贝塞尔曲线 (C/c)
```svg
<svg width="500" height="250" xmlns="http://www.w3.org/2000/svg">
  <title>三次贝塞尔曲线</title>
  
  <!-- 基本三次贝塞尔曲线 -->
  <path d="M 50 150 C 50 50, 150 50, 150 150" 
        fill="none" stroke="#3498db" stroke-width="3"/>
  
  <!-- 控制点可视化 -->
  <circle cx="50" cy="150" r="3" fill="#e74c3c"/>
  <circle cx="50" cy="50" r="3" fill="#2ecc71"/>
  <circle cx="150" cy="50" r="3" fill="#2ecc71"/>
  <circle cx="150" cy="150" r="3" fill="#e74c3c"/>
  <line x1="50" y1="150" x2="50" y2="50" stroke="#2ecc71" stroke-width="1" stroke-dasharray="2,2"/>
  <line x1="150" y1="150" x2="150" y2="50" stroke="#2ecc71" stroke-width="1" stroke-dasharray="2,2"/>
  
  <!-- S命令：平滑三次贝塞尔曲线 -->
  <path d="M 200 150 C 200 50, 300 50, 300 150 S 400 250, 450 150" 
        fill="none" stroke="#e74c3c" stroke-width="3"/>
  
  <!-- 波浪线示例 -->
  <path d="M 50 200 C 70 180, 90 220, 110 200 S 130 180, 150 200 S 170 220, 190 200" 
        fill="none" stroke="#f39c12" stroke-width="2"/>
  
  <!-- 标签 -->
  <text x="100" y="30" text-anchor="middle" font-size="12">基本C命令</text>
  <text x="325" y="30" text-anchor="middle" font-size="12">S命令连续</text>
  <text x="120" y="235" text-anchor="middle" font-size="10">波浪线</text>
</svg>
```

#### 二次贝塞尔曲线 (Q/q)
```svg
<svg width="500" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>二次贝塞尔曲线</title>
  
  <!-- 基本二次贝塞尔曲线 -->
  <path d="M 50 150 Q 100 50, 150 150" 
        fill="none" stroke="#3498db" stroke-width="3"/>
  
  <!-- 控制点可视化 -->
  <circle cx="50" cy="150" r="3" fill="#e74c3c"/>
  <circle cx="100" cy="50" r="3" fill="#2ecc71"/>
  <circle cx="150" cy="150" r="3" fill="#e74c3c"/>
  <line x1="50" y1="150" x2="100" y2="50" stroke="#2ecc71" stroke-width="1" stroke-dasharray="2,2"/>
  <line x1="100" y1="50" x2="150" y2="150" stroke="#2ecc71" stroke-width="1" stroke-dasharray="2,2"/>
  
  <!-- T命令：平滑二次贝塞尔曲线 -->
  <path d="M 200 150 Q 250 50, 300 150 T 400 150" 
        fill="none" stroke="#e74c3c" stroke-width="3"/>
  
  <!-- 抛物线示例 -->
  <path d="M 50 180 Q 150 120, 250 180" 
        fill="none" stroke="#9b59b6" stroke-width="2"/>
  
  <!-- 标签 -->
  <text x="100" y="30" text-anchor="middle" font-size="12">Q命令</text>
  <text x="300" y="30" text-anchor="middle" font-size="12">T命令连续</text>
  <text x="150" y="195" text-anchor="middle" font-size="10">抛物线</text>
</svg>
```

### 弧线命令 (A/a)
最复杂但最强大的路径命令。

#### 语法详解
```
A rx ry x-axis-rotation large-arc-flag sweep-flag x y
```

```svg
<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>弧线命令详解</title>
  
  <!-- 基本弧线 -->
  <path d="M 50 100 A 50 50 0 0 1 150 100" 
        fill="none" stroke="#3498db" stroke-width="3"/>
  
  <!-- 不同的large-arc-flag -->
  <path d="M 200 100 A 50 50 0 0 1 300 100" 
        fill="none" stroke="#e74c3c" stroke-width="2"/>
  <path d="M 200 100 A 50 50 0 1 1 300 100" 
        fill="none" stroke="#2ecc71" stroke-width="2"/>
  
  <!-- 不同的sweep-flag -->
  <path d="M 350 50 A 30 30 0 0 0 400 100" 
        fill="none" stroke="#f39c12" stroke-width="2"/>
  <path d="M 350 50 A 30 30 0 0 1 400 100" 
        fill="none" stroke="#9b59b6" stroke-width="2"/>
  
  <!-- 椭圆弧 -->
  <path d="M 50 200 A 80 40 0 0 1 200 200" 
        fill="none" stroke="#34495e" stroke-width="3"/>
  
  <!-- 旋转的椭圆弧 -->
  <path d="M 250 200 A 60 30 45 0 1 350 200" 
        fill="none" stroke="#e67e22" stroke-width="3"/>
  
  <!-- 标签 -->
  <text x="100" y="80" text-anchor="middle" font-size="10">基本弧线</text>
  <text x="250" y="80" text-anchor="middle" font-size="10">大弧标志</text>
  <text x="375" y="35" text-anchor="middle" font-size="10">扫描方向</text>
  <text x="125" y="235" text-anchor="middle" font-size="10">椭圆弧</text>
  <text x="300" y="235" text-anchor="middle" font-size="10">旋转弧</text>
</svg>
```

### 闭合路径 (Z/z)
```svg
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>路径闭合示例</title>
  
  <!-- 未闭合路径 -->
  <path d="M 50 50 L 100 50 L 100 100 L 50 100" 
        fill="none" stroke="#e74c3c" stroke-width="2"/>
  
  <!-- 闭合路径 -->
  <path d="M 150 50 L 200 50 L 200 100 L 150 100 Z" 
        fill="rgba(52, 152, 219, 0.3)" stroke="#3498db" stroke-width="2"/>
  
  <!-- 标签 -->
  <text x="75" y="130" text-anchor="middle" font-size="12">未闭合</text>
  <text x="175" y="130" text-anchor="middle" font-size="12">已闭合</text>
</svg>
```

## 🎨 复杂图形绘制

### 心形图案
```svg
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>心形图案</title>
  
  <path d="M 100 150 
           C 100 120, 70 90, 40 90
           C 10 90, 10 120, 40 150
           L 100 200
           L 160 150
           C 190 120, 190 90, 160 90
           C 130 90, 100 120, 100 150 Z" 
        fill="#e74c3c" stroke="#c0392b" stroke-width="2"/>
</svg>
```

### 星形图案
```svg
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>五角星</title>
  
  <path d="M 100 20
           L 110 60
           L 150 60
           L 120 85
           L 130 125
           L 100 100
           L 70 125
           L 80 85
           L 50 60
           L 90 60 Z" 
        fill="#f39c12" stroke="#e67e22" stroke-width="2"/>
</svg>
```

### 波浪边框
```svg
<svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
  <title>波浪边框</title>
  
  <path d="M 0 50 
           Q 25 25, 50 50 
           T 100 50 
           T 150 50 
           T 200 50 
           T 250 50 
           T 300 50
           L 300 100
           L 0 100 Z" 
        fill="#3498db" opacity="0.7"/>
</svg>
```

## 🛠️ 实用技巧

### 路径数据优化
```svg
<!-- 冗余的写法 -->
<path d="M 10 10 L 20 10 L 20 20 L 10 20 L 10 10"/>

<!-- 优化的写法 -->
<path d="M10 10h10v10h-10z"/>

<!-- 使用相对坐标 -->
<path d="M10 10l10 0l0 10l-10 0z"/>
```

### 路径方向控制
```svg
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>路径方向示例</title>
  
  <!-- 顺时针路径 -->
  <path d="M 50 50 L 100 50 L 100 100 L 50 100 Z" 
        fill="#3498db" fill-rule="evenodd"/>
  
  <!-- 逆时针内部路径（镂空效果） -->
  <path d="M 30 30 L 120 30 L 120 120 L 30 120 Z
           M 60 60 L 60 90 L 90 90 L 90 60 Z" 
        fill="#e74c3c" fill-rule="evenodd"/>
</svg>
```

## 🎯 实践练习

### 练习1：创建Logo
使用路径创建一个简单的Logo：

```svg
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <title>简单Logo</title>
  
  <!-- 外圆 -->
  <circle cx="75" cy="75" r="70" fill="none" stroke="#3498db" stroke-width="4"/>
  
  <!-- 字母 'S' -->
  <path d="M 45 45 
           C 45 35, 55 25, 75 25
           C 95 25, 105 35, 105 45
           C 105 55, 95 65, 75 65
           C 55 65, 45 75, 45 85
           C 45 95, 55 105, 75 105
           C 95 105, 105 95, 105 85" 
        fill="none" stroke="#e74c3c" stroke-width="6" stroke-linecap="round"/>
</svg>
```

### 练习2：图标集合
创建一套统一风格的图标：

```svg
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>图标集合</title>
  
  <!-- 搜索图标 -->
  <g transform="translate(50, 50)">
    <circle cx="25" cy="25" r="15" fill="none" stroke="#34495e" stroke-width="3"/>
    <path d="35 35 L 45 45" stroke="#34495e" stroke-width="3" stroke-linecap="round"/>
  </g>
  
  <!-- 下载图标 -->
  <g transform="translate(150, 50)">
    <path d="M 25 10 L 25 35" stroke="#34495e" stroke-width="3" stroke-linecap="round"/>
    <path d="M 15 30 L 25 40 L 35 30" fill="none" stroke="#34495e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 10 45 L 40 45" stroke="#34495e" stroke-width="3" stroke-linecap="round"/>
  </g>
  
  <!-- 音乐图标 -->
  <g transform="translate(250, 50)">
    <circle cx="15" cy="35" r="8" fill="#34495e"/>
    <circle cx="35" cy="30" r="6" fill="#34495e"/>
    <path d="M 23 35 L 23 15 L 41 10 L 41 30" fill="none" stroke="#34495e" stroke-width="2"/>
  </g>
  
  <!-- 标签 -->
  <text x="75" y="120" text-anchor="middle" font-size="12">搜索</text>
  <text x="175" y="120" text-anchor="middle" font-size="12">下载</text>
  <text x="275" y="120" text-anchor="middle" font-size="12">音乐</text>
</svg>
```

## ❓ 常见问题

### Q1: 路径不显示或显示不完整？
**A**: 检查：
- 路径数据语法是否正确
- 坐标是否在viewBox范围内
- 是否有适当的fill或stroke

### Q2: 曲线不够平滑？
**A**: 
- 增加控制点的数量
- 调整控制点位置
- 使用更合适的曲线类型

### Q3: 如何让路径可编辑？
**A**: 
- 使用SVG编辑器工具
- 实现JavaScript路径编辑器
- 使用可视化路径生成工具

## 🎯 本章小结

通过本章学习，您应该掌握：

### ✅ 路径基础
- 路径语法和坐标系统
- 所有路径命令的使用
- 绝对和相对坐标的区别

### ✅ 曲线绘制
- 贝塞尔曲线的原理和应用
- 弧线的复杂参数控制
- 平滑连接技巧

### ✅ 实践应用
- 复杂图形的构建方法
- 路径优化技巧
- 实际项目中的应用

---

🎯 **恭喜！** 您已经完成了SVG基础入门的学习。现在可以进入 [第二阶段：样式控制](../02-styling/README.md)，学习如何美化您的SVG作品！ 