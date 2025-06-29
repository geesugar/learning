# SVG基本图形绘制

> 掌握SVG所有基本图形元素，构建复杂图形的基础技能。

## 🎯 学习目标

通过本章学习，您将掌握：
- 所有SVG基本图形元素的使用方法
- 图形属性的设置和样式控制
- 坐标定位和尺寸控制技巧
- 基本图形的组合和实际应用
- 常见问题的解决方案

## 📚 基本图形元素概览

SVG提供了七种基本图形元素：

| 元素 | 用途 | 核心属性 |
|------|------|----------|
| `<rect>` | 矩形 | x, y, width, height, rx, ry |
| `<circle>` | 圆形 | cx, cy, r |
| `<ellipse>` | 椭圆 | cx, cy, rx, ry |
| `<line>` | 直线 | x1, y1, x2, y2 |
| `<polyline>` | 折线 | points |
| `<polygon>` | 多边形 | points |
| `<text>` | 文本 | x, y, font-size, font-family |

## 🔳 矩形 (rect)

### 基本语法
```svg
<rect x="起始x坐标" y="起始y坐标" width="宽度" height="高度"/>
```

### 详细示例
```svg
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>矩形绘制示例</title>
  
  <!-- 基本矩形 -->
  <rect x="50" y="50" width="100" height="60" fill="#3498db"/>
  
  <!-- 圆角矩形 -->
  <rect x="200" y="50" width="100" height="60" rx="10" ry="10" fill="#e74c3c"/>
  
  <!-- 描边矩形 -->
  <rect x="50" y="150" width="100" height="60" 
        fill="none" stroke="#2ecc71" stroke-width="3"/>
  
  <!-- 渐变填充矩形 -->
  <defs>
    <linearGradient id="rectGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f39c12"/>
      <stop offset="100%" stop-color="#e67e22"/>
    </linearGradient>
  </defs>
  <rect x="200" y="150" width="100" height="60" fill="url(#rectGradient)"/>
  
  <!-- 文本标签 -->
  <text x="100" y="40" text-anchor="middle" font-size="12">基本矩形</text>
  <text x="250" y="40" text-anchor="middle" font-size="12">圆角矩形</text>
  <text x="100" y="240" text-anchor="middle" font-size="12">描边矩形</text>
  <text x="250" y="240" text-anchor="middle" font-size="12">渐变矩形</text>
</svg>
```

### 圆角详解
```svg
<svg width="500" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>矩形圆角效果</title>
  
  <!-- 不同圆角半径 -->
  <rect x="50" y="50" width="80" height="50" rx="0" fill="#3498db"/>
  <text x="90" y="120" text-anchor="middle" font-size="10">rx=0</text>
  
  <rect x="150" y="50" width="80" height="50" rx="5" fill="#e74c3c"/>
  <text x="190" y="120" text-anchor="middle" font-size="10">rx=5</text>
  
  <rect x="250" y="50" width="80" height="50" rx="15" fill="#2ecc71"/>
  <text x="290" y="120" text-anchor="middle" font-size="10">rx=15</text>
  
  <rect x="350" y="50" width="80" height="50" rx="25" fill="#f39c12"/>
  <text x="390" y="120" text-anchor="middle" font-size="10">rx=25</text>
</svg>
```

## ⭕ 圆形 (circle)

### 基本语法
```svg
<circle cx="圆心x坐标" cy="圆心y坐标" r="半径"/>
```

### 详细示例
```svg
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>圆形绘制示例</title>
  
  <!-- 实心圆 -->
  <circle cx="100" cy="100" r="40" fill="#3498db"/>
  
  <!-- 空心圆 -->
  <circle cx="250" cy="100" r="40" fill="none" stroke="#e74c3c" stroke-width="4"/>
  
  <!-- 半透明圆 -->
  <circle cx="100" cy="200" r="40" fill="#2ecc71" opacity="0.7"/>
  
  <!-- 渐变圆 -->
  <defs>
    <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f39c12"/>
      <stop offset="100%" stop-color="#e67e22"/>
    </radialGradient>
  </defs>
  <circle cx="250" cy="200" r="40" fill="url(#circleGradient)"/>
  
  <!-- 标签 -->
  <text x="100" y="30" text-anchor="middle" font-size="12">实心圆</text>
  <text x="250" y="30" text-anchor="middle" font-size="12">空心圆</text>
  <text x="100" y="270" text-anchor="middle" font-size="12">半透明</text>
  <text x="250" y="270" text-anchor="middle" font-size="12">渐变圆</text>
</svg>
```

### 圆形应用：创建环形图
```svg
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>环形图示例</title>
  
  <!-- 背景圆 -->
  <circle cx="150" cy="150" r="100" fill="#ecf0f1"/>
  
  <!-- 数据环 -->
  <circle cx="150" cy="150" r="80" fill="none" stroke="#3498db" stroke-width="20"
          stroke-dasharray="251.2 628" transform="rotate(-90 150 150)"/>
  
  <!-- 中心文字 -->
  <text x="150" y="145" text-anchor="middle" font-size="24" font-weight="bold">40%</text>
  <text x="150" y="165" text-anchor="middle" font-size="14" fill="#7f8c8d">完成度</text>
</svg>
```

## 🥚 椭圆 (ellipse)

### 基本语法
```svg
<ellipse cx="中心x坐标" cy="中心y坐标" rx="x轴半径" ry="y轴半径"/>
```

### 详细示例
```svg
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>椭圆绘制示例</title>
  
  <!-- 水平椭圆 -->
  <ellipse cx="100" cy="80" rx="60" ry="30" fill="#3498db"/>
  
  <!-- 垂直椭圆 -->
  <ellipse cx="280" cy="80" rx="30" ry="60" fill="#e74c3c"/>
  
  <!-- 描边椭圆 -->
  <ellipse cx="100" cy="180" rx="50" ry="40" 
           fill="none" stroke="#2ecc71" stroke-width="3"/>
  
  <!-- 倾斜椭圆 -->
  <ellipse cx="280" cy="180" rx="50" ry="25" fill="#f39c12" 
           transform="rotate(45 280 180)"/>
  
  <!-- 标签 -->
  <text x="100" y="30" text-anchor="middle" font-size="12">水平椭圆</text>
  <text x="280" y="30" text-anchor="middle" font-size="12">垂直椭圆</text>
  <text x="100" y="250" text-anchor="middle" font-size="12">描边椭圆</text>
  <text x="280" y="250" text-anchor="middle" font-size="12">倾斜椭圆</text>
</svg>
```

## 📏 直线 (line)

### 基本语法
```svg
<line x1="起点x坐标" y1="起点y坐标" x2="终点x坐标" y2="终点y坐标"/>
```

### 详细示例
```svg
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>直线绘制示例</title>
  
  <!-- 水平线 -->
  <line x1="50" y1="50" x2="150" y2="50" stroke="#3498db" stroke-width="2"/>
  
  <!-- 垂直线 -->
  <line x1="200" y1="30" x2="200" y2="130" stroke="#e74c3c" stroke-width="2"/>
  
  <!-- 斜线 -->
  <line x1="250" y1="30" x2="350" y2="80" stroke="#2ecc71" stroke-width="3"/>
  
  <!-- 虚线 -->
  <line x1="50" y1="120" x2="150" y2="120" stroke="#f39c12" stroke-width="2"
        stroke-dasharray="5,5"/>
  
  <!-- 点线 -->
  <line x1="50" y1="150" x2="150" y2="150" stroke="#9b59b6" stroke-width="2"
        stroke-dasharray="2,3"/>
  
  <!-- 线条端点样式 -->
  <line x1="50" y1="200" x2="150" y2="200" stroke="#34495e" stroke-width="8"
        stroke-linecap="round"/>
        
  <line x1="200" y1="200" x2="300" y2="200" stroke="#34495e" stroke-width="8"
        stroke-linecap="square"/>
  
  <!-- 标签 -->
  <text x="100" y="40" text-anchor="middle" font-size="10">水平线</text>
  <text x="220" y="25" font-size="10">垂直线</text>
  <text x="300" y="25" font-size="10">斜线</text>
  <text x="100" y="110" text-anchor="middle" font-size="10">虚线</text>
  <text x="100" y="140" text-anchor="middle" font-size="10">点线</text>
  <text x="100" y="190" text-anchor="middle" font-size="10">圆形端点</text>
  <text x="250" y="190" text-anchor="middle" font-size="10">方形端点</text>
</svg>
```

## 📈 折线 (polyline)

### 基本语法
```svg
<polyline points="x1,y1 x2,y2 x3,y3 ..."/>
```

### 详细示例
```svg
<svg width="500" height="350" xmlns="http://www.w3.org/2000/svg">
  <title>折线绘制示例</title>
  
  <!-- 简单折线 -->
  <polyline points="50,50 100,30 150,80 200,40 250,90" 
            fill="none" stroke="#3498db" stroke-width="2"/>
  
  <!-- 闭合折线（填充） -->
  <polyline points="300,50 350,30 400,80 450,40 420,90 350,100" 
            fill="#e74c3c" fill-opacity="0.3" stroke="#e74c3c" stroke-width="2"/>
  
  <!-- 数据图表示例 -->
  <g transform="translate(50, 150)">
    <!-- 网格线 -->
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ecf0f1" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="300" height="150" fill="url(#grid)"/>
    
    <!-- 数据线 -->
    <polyline points="0,120 30,100 60,80 90,110 120,60 150,90 180,40 210,70 240,30 270,50 300,20" 
              fill="none" stroke="#2ecc71" stroke-width="3"/>
    
    <!-- 数据点 -->
    <circle cx="0" cy="120" r="3" fill="#2ecc71"/>
    <circle cx="30" cy="100" r="3" fill="#2ecc71"/>
    <circle cx="60" cy="80" r="3" fill="#2ecc71"/>
    <circle cx="90" cy="110" r="3" fill="#2ecc71"/>
    <circle cx="120" cy="60" r="3" fill="#2ecc71"/>
    <circle cx="150" cy="90" r="3" fill="#2ecc71"/>
    <circle cx="180" cy="40" r="3" fill="#2ecc71"/>
    <circle cx="210" cy="70" r="3" fill="#2ecc71"/>
    <circle cx="240" cy="30" r="3" fill="#2ecc71"/>
    <circle cx="270" cy="50" r="3" fill="#2ecc71"/>
    <circle cx="300" cy="20" r="3" fill="#2ecc71"/>
    
    <!-- 轴线 -->
    <line x1="0" y1="150" x2="300" y2="150" stroke="#34495e" stroke-width="1"/>
    <line x1="0" y1="0" x2="0" y2="150" stroke="#34495e" stroke-width="1"/>
  </g>
  
  <!-- 标签 -->
  <text x="150" y="25" text-anchor="middle" font-size="12">简单折线</text>
  <text x="375" y="25" text-anchor="middle" font-size="12">填充折线</text>
  <text x="200" y="325" text-anchor="middle" font-size="12">数据图表</text>
</svg>
```

## 🔷 多边形 (polygon)

### 基本语法
```svg
<polygon points="x1,y1 x2,y2 x3,y3 ..."/>
```

### 详细示例
```svg
<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>多边形绘制示例</title>
  
  <!-- 三角形 -->
  <polygon points="100,50 50,120 150,120" fill="#3498db"/>
  
  <!-- 菱形 -->
  <polygon points="250,50 300,100 250,150 200,100" fill="#e74c3c"/>
  
  <!-- 六边形 -->
  <polygon points="400,80 430,60 460,80 460,120 430,140 400,120" fill="#2ecc71"/>
  
  <!-- 五角星 -->
  <polygon points="100,200 110,230 140,230 120,250 130,280 100,260 70,280 80,250 60,230 90,230" 
           fill="#f39c12"/>
  
  <!-- 箭头 -->
  <polygon points="200,180 240,180 240,170 270,200 240,230 240,220 200,220" 
           fill="#9b59b6"/>
  
  <!-- 复杂图形：房子 -->
  <g transform="translate(320, 180)">
    <!-- 房子主体 -->
    <polygon points="20,60 80,60 80,120 20,120" fill="#e67e22"/>
    <!-- 屋顶 -->
    <polygon points="10,60 50,20 90,60" fill="#c0392b"/>
    <!-- 门 -->
    <rect x="40" y="90" width="20" height="30" fill="#8b4513"/>
    <!-- 窗户 -->
    <rect x="25" y="75" width="12" height="12" fill="#87ceeb"/>
    <rect x="63" y="75" width="12" height="12" fill="#87ceeb"/>
  </g>
  
  <!-- 标签 -->
  <text x="100" y="140" text-anchor="middle" font-size="11">三角形</text>
  <text x="250" y="170" text-anchor="middle" font-size="11">菱形</text>
  <text x="430" y="160" text-anchor="middle" font-size="11">六边形</text>
  <text x="100" y="290" text-anchor="middle" font-size="11">五角星</text>
  <text x="235" y="250" text-anchor="middle" font-size="11">箭头</text>
  <text x="365" y="265" text-anchor="middle" font-size="11">房子</text>
</svg>
```

## 📝 文本 (text)

### 基本语法
```svg
<text x="x坐标" y="y坐标">文本内容</text>
```

### 详细示例
```svg
<svg width="500" height="400" xmlns="http://www.w3.org/2000/svg">
  <title>文本绘制示例</title>
  
  <!-- 基本文本 -->
  <text x="50" y="50" font-size="16">基本文本</text>
  
  <!-- 样式文本 -->
  <text x="50" y="80" font-size="18" font-weight="bold" fill="#e74c3c">
    粗体红色文本
  </text>
  
  <!-- 不同字体 -->
  <text x="50" y="110" font-family="Arial" font-size="14">Arial字体</text>
  <text x="50" y="135" font-family="Times" font-size="14">Times字体</text>
  <text x="50" y="160" font-family="monospace" font-size="14">等宽字体</text>
  
  <!-- 文本对齐 -->
  <line x1="300" y1="30" x2="300" y2="180" stroke="#ddd" stroke-width="1"/>
  <text x="300" y="50" text-anchor="start" font-size="14">左对齐</text>
  <text x="300" y="75" text-anchor="middle" font-size="14">居中对齐</text>
  <text x="300" y="100" text-anchor="end" font-size="14">右对齐</text>
  
  <!-- 垂直对齐 -->
  <line x1="280" y1="130" x2="450" y2="130" stroke="#ddd" stroke-width="1"/>
  <text x="300" y="130" dominant-baseline="hanging" font-size="14">顶部对齐</text>
  <text x="350" y="130" dominant-baseline="middle" font-size="14">中间对齐</text>
  <text x="420" y="130" dominant-baseline="baseline" font-size="14">基线对齐</text>
  
  <!-- 文本路径 -->
  <defs>
    <path id="textPath" d="M 50 220 Q 150 180 250 220 T 450 220"/>
  </defs>
  <path d="M 50 220 Q 150 180 250 220 T 450 220" fill="none" stroke="#ddd" stroke-width="1"/>
  <text font-size="14" fill="#3498db">
    <textPath href="#textPath">
      沿着曲线排列的文本内容
    </textPath>
  </text>
  
  <!-- 多行文本 -->
  <text x="50" y="280" font-size="14">
    <tspan x="50" dy="0">第一行文本</tspan>
    <tspan x="50" dy="20">第二行文本</tspan>
    <tspan x="50" dy="20" fill="#e74c3c">第三行红色文本</tspan>
  </text>
  
  <!-- 文本效果 -->
  <text x="250" y="300" font-size="20" font-weight="bold" 
        fill="none" stroke="#2ecc71" stroke-width="1">描边文本</text>
  
  <text x="250" y="330" font-size="20" font-weight="bold" fill="#f39c12" 
        filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.5))">阴影文本</text>
</svg>
```

## 🎨 样式控制技巧

### 通用样式属性
```svg
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>样式控制示例</title>
  
  <!-- 填充颜色 -->
  <rect x="50" y="50" width="60" height="40" fill="#3498db"/>
  <rect x="120" y="50" width="60" height="40" fill="rgb(231, 76, 60)"/>
  <rect x="190" y="50" width="60" height="40" fill="hsl(120, 60%, 50%)"/>
  
  <!-- 描边样式 -->
  <rect x="50" y="120" width="60" height="40" fill="none" 
        stroke="#e74c3c" stroke-width="3"/>
  <rect x="120" y="120" width="60" height="40" fill="none" 
        stroke="#2ecc71" stroke-width="2" stroke-dasharray="5,5"/>
  <rect x="190" y="120" width="60" height="40" fill="none" 
        stroke="#f39c12" stroke-width="4" stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- 透明度 -->
  <circle cx="300" cy="70" r="30" fill="#3498db" opacity="1"/>
  <circle cx="320" cy="70" r="30" fill="#e74c3c" opacity="0.7"/>
  <circle cx="340" cy="70" r="30" fill="#2ecc71" opacity="0.4"/>
  
  <!-- 变换 -->
  <rect x="260" y="120" width="40" height="40" fill="#9b59b6" 
        transform="rotate(45 280 140)"/>
  <rect x="320" y="120" width="40" height="40" fill="#f39c12" 
        transform="scale(1.2) translate(10, 0)"/>
  
  <!-- 标签 -->
  <text x="80" y="40" text-anchor="middle" font-size="10">颜色填充</text>
  <text x="140" y="110" text-anchor="middle" font-size="10">描边样式</text>
  <text x="320" y="40" text-anchor="middle" font-size="10">透明度</text>
  <text x="300" y="200" text-anchor="middle" font-size="10">变换</text>
</svg>
```

## 🛠️ 实践练习

### 练习1：创建基本图标
使用基本图形创建常见图标：

```svg
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <title>基本图标练习</title>
  
  <!-- 主页图标 -->
  <g transform="translate(50, 50)">
    <polygon points="25,10 5,30 45,30" fill="#3498db"/>
    <rect x="10" y="30" width="30" height="25" fill="#e74c3c"/>
    <rect x="20" y="40" width="8" height="15" fill="#f39c12"/>
    <rect x="32" y="38" width="6" height="6" fill="#87ceeb"/>
  </g>
  
  <!-- 设置图标 -->
  <g transform="translate(150, 50)">
    <circle cx="25" cy="25" r="20" fill="none" stroke="#34495e" stroke-width="3"/>
    <circle cx="25" cy="25" r="6" fill="#34495e"/>
    <rect x="23" y="5" width="4" height="8" fill="#34495e"/>
    <rect x="23" y="37" width="4" height="8" fill="#34495e"/>
    <rect x="5" y="23" width="8" height="4" fill="#34495e"/>
    <rect x="37" y="23" width="8" height="4" fill="#34495e"/>
  </g>
  
  <!-- 邮件图标 -->
  <g transform="translate(250, 50)">
    <rect x="5" y="15" width="40" height="25" rx="2" fill="#3498db"/>
    <polygon points="5,15 25,30 45,15" fill="#e74c3c"/>
  </g>
  
  <!-- 标签 -->
  <text x="75" y="90" text-anchor="middle" font-size="12">主页</text>
  <text x="175" y="90" text-anchor="middle" font-size="12">设置</text>
  <text x="275" y="90" text-anchor="middle" font-size="12">邮件</text>
</svg>
```

### 练习2：数据可视化图表
创建简单的柱状图：

```svg
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <title>柱状图练习</title>
  
  <!-- 坐标轴 -->
  <line x1="50" y1="50" x2="50" y2="250" stroke="#34495e" stroke-width="2"/>
  <line x1="50" y1="250" x2="350" y2="250" stroke="#34495e" stroke-width="2"/>
  
  <!-- 数据柱 -->
  <rect x="80" y="150" width="40" height="100" fill="#3498db"/>
  <rect x="140" y="100" width="40" height="150" fill="#e74c3c"/>
  <rect x="200" y="120" width="40" height="130" fill="#2ecc71"/>
  <rect x="260" y="80" width="40" height="170" fill="#f39c12"/>
  <rect x="320" y="180" width="40" height="70" fill="#9b59b6"/>
  
  <!-- 数值标签 -->
  <text x="100" y="145" text-anchor="middle" font-size="12" fill="white">50</text>
  <text x="160" y="95" text-anchor="middle" font-size="12" fill="white">75</text>
  <text x="220" y="115" text-anchor="middle" font-size="12" fill="white">65</text>
  <text x="280" y="75" text-anchor="middle" font-size="12" fill="white">85</text>
  <text x="340" y="175" text-anchor="middle" font-size="12" fill="white">35</text>
  
  <!-- 分类标签 -->
  <text x="100" y="270" text-anchor="middle" font-size="12">Q1</text>
  <text x="160" y="270" text-anchor="middle" font-size="12">Q2</text>
  <text x="220" y="270" text-anchor="middle" font-size="12">Q3</text>
  <text x="280" y="270" text-anchor="middle" font-size="12">Q4</text>
  <text x="340" y="270" text-anchor="middle" font-size="12">Q5</text>
  
  <!-- 标题 -->
  <text x="200" y="30" text-anchor="middle" font-size="16" font-weight="bold">
    季度销售数据
  </text>
</svg>
```

## ❓ 常见问题与解决方案

### Q1: 为什么我的图形显示不完整？
**A**: 检查以下几点：
- viewBox是否包含所有图形
- width和height是否足够大
- 图形坐标是否超出了可视区域

### Q2: 如何让图形居中显示？
**A**: 方法：
```svg
<!-- 方法1：计算居中坐标 -->
<rect x="centerX - width/2" y="centerY - height/2" width="100" height="60"/>

<!-- 方法2：使用变换 -->
<rect width="100" height="60" transform="translate(centerX, centerY)"/>
```

### Q3: 文本在不同浏览器中显示不一致？
**A**: 解决方案：
- 使用web安全字体
- 设置font-family备选字体
- 考虑使用网络字体

### Q4: 如何让描边不影响图形尺寸？
**A**: 使用`vector-effect="non-scaling-stroke"`或调整坐标。

## 🎯 本章小结

通过本章学习，您应该掌握：

### ✅ 基本图形
- 所有7种基本图形元素的使用
- 图形属性的设置和控制
- 样式的应用和组合

### ✅ 实践技能
- 创建基本图标和图形
- 组合图形构建复杂图案
- 数据可视化的基础应用

### ✅ 问题解决
- 常见布局和显示问题
- 浏览器兼容性处理
- 样式控制技巧

---

🎯 **下一步**：继续学习 [路径系统](03-paths.md)，掌握SVG最强大的绘图工具！ 