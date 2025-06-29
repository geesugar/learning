# Canvas入门基础

> 掌握HTML5 Canvas的核心概念和基本绘图方法，开启图形编程之旅。

## 📚 章节导航
- **课程首页**: [Canvas学习大纲](../README.md)
- **章节首页**: [Canvas基础入门](README.md)
- **下一章**: [第2章：绘图上下文](02-drawing-context.md)
- **第二阶段**: [图形绘制进阶](../02-graphics/README.md)

---

## 🎯 学习目标

通过本章学习，您将掌握：
- Canvas元素的基本概念和用途
- 如何创建和配置Canvas画布
- Canvas坐标系统的工作原理
- 基本的绘图上下文操作
- Canvas与其他图形技术的区别

## 📚 什么是Canvas

### Canvas的定义
**HTML5 Canvas** 是一个可以使用脚本（通常是JavaScript）绘制图形的HTML元素。它可以用于制作照片集、设计图表或者制作简单的动画，甚至可以进行实时视频处理和渲染。

### Canvas的特点
- **基于像素**：Canvas是位图，缩放会失真
- **即时模式**：直接在画布上绘制，无DOM结构
- **高性能**：适合复杂动画和大量图形操作
- **JavaScript驱动**：完全通过脚本控制绘图

## 🏗️ 创建Canvas元素

### 基本HTML结构
```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas入门</title>
    <style>
        canvas {
            border: 1px solid #ccc;
            display: block;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <canvas id="myCanvas" width="800" height="600">
        您的浏览器不支持Canvas
    </canvas>
    
    <script>
        // JavaScript代码将在这里编写
    </script>
</body>
</html>
```

### Canvas元素属性
```html
<!-- 基本Canvas元素 -->
<canvas id="canvas1" width="400" height="300"></canvas>

<!-- 带样式的Canvas -->
<canvas 
    id="canvas2" 
    width="800" 
    height="600"
    style="border: 2px solid #333; background: #f0f0f0;">
    浏览器不支持Canvas时显示的内容
</canvas>
```

### 获取绘图上下文
```javascript
// 获取Canvas元素
const canvas = document.getElementById('myCanvas');

// 获取2D绘图上下文
const ctx = canvas.getContext('2d');

// 检查浏览器支持
if (ctx) {
    console.log('Canvas支持正常');
    // 开始绘图
} else {
    console.log('您的浏览器不支持Canvas');
}
```

## 📐 Canvas坐标系统

### 坐标系统基础
Canvas使用左上角为原点(0,0)的坐标系统：
- **X轴**：从左到右递增
- **Y轴**：从上到下递增
- **单位**：像素(px)

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘制坐标系统示例
function drawCoordinateSystem() {
    // 设置样式
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    
    // 绘制网格线
    const gridSize = 50;
    const width = canvas.width;
    const height = canvas.height;
    
    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // 标注坐标
        if (x > 0) {
            ctx.fillText(x.toString(), x - 10, 15);
        }
    }
    
    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        
        // 标注坐标
        if (y > 0) {
            ctx.fillText(y.toString(), 5, y - 5);
        }
    }
    
    // 标注原点
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillStyle = '#333';
    ctx.fillText('(0,0)', 10, 20);
}

drawCoordinateSystem();
```

### 坐标定位示例
```javascript
// 不同位置的点
const points = [
    {x: 100, y: 100, label: '(100,100)'},
    {x: 300, y: 150, label: '(300,150)'},
    {x: 500, y: 200, label: '(500,200)'},
    {x: 200, y: 300, label: '(200,300)'}
];

// 绘制点和标签
points.forEach(point => {
    // 绘制点
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.fillText(point.label, point.x + 10, point.y - 10);
});
```

## 🎨 基本绘图方法

### 第一个绘图示例
```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘制一个红色矩形
ctx.fillStyle = '#e74c3c';
ctx.fillRect(50, 50, 200, 100);

// 绘制一个蓝色圆形
ctx.fillStyle = '#3498db';
ctx.beginPath();
ctx.arc(400, 100, 50, 0, 2 * Math.PI);
ctx.fill();

// 绘制一条绿色直线
ctx.strokeStyle = '#2ecc71';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(100, 200);
ctx.lineTo(500, 200);
ctx.stroke();
```

### 绘图状态管理
```javascript
// 保存当前绘图状态
ctx.save();

// 修改绘图样式
ctx.fillStyle = '#f39c12';
ctx.strokeStyle = '#e67e22';
ctx.lineWidth = 5;

// 绘制图形
ctx.fillRect(100, 100, 100, 100);
ctx.strokeRect(100, 100, 100, 100);

// 恢复之前的绘图状态
ctx.restore();

// 此时绘图样式已恢复到save()之前的状态
```

### 画布尺寸设置
```javascript
// 方法1：HTML属性设置（推荐）
// <canvas width="800" height="600"></canvas>

// 方法2：JavaScript设置
canvas.width = 800;
canvas.height = 600;

// 方法3：CSS设置（注意：会导致缩放）
// canvas { width: 800px; height: 600px; }

// 获取画布尺寸
console.log('Canvas尺寸:', canvas.width + 'x' + canvas.height);
console.log('显示尺寸:', canvas.offsetWidth + 'x' + canvas.offsetHeight);
```

### 高分辨率适配
```javascript
function setupHighDPICanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                              ctx.mozBackingStorePixelRatio ||
                              ctx.msBackingStorePixelRatio ||
                              ctx.oBackingStorePixelRatio ||
                              ctx.backingStorePixelRatio || 1;
    
    const ratio = devicePixelRatio / backingStoreRatio;
    
    if (devicePixelRatio !== backingStoreRatio) {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        
        ctx.scale(ratio, ratio);
    }
    
    return ctx;
}

// 使用高分辨率适配
const ctx = setupHighDPICanvas(canvas);
```

## 🔄 Canvas vs 其他图形技术

### Canvas vs SVG
| 特性 | Canvas | SVG |
|------|--------|-----|
| **图形类型** | 位图(像素) | 矢量图 |
| **DOM结构** | 单个元素 | 每个图形都是DOM元素 |
| **交互性** | 需要手动实现 | 原生支持事件 |
| **性能** | 大量对象时更好 | 少量对象时更好 |
| **可访问性** | 需要额外处理 | 原生支持 |
| **缩放** | 会失真 | 不会失真 |
| **适用场景** | 游戏、动画、图像处理 | 图标、图表、插图 |

### Canvas vs CSS
```javascript
// Canvas绘制
ctx.fillStyle = '#3498db';
ctx.fillRect(100, 100, 200, 100);

// CSS绘制
// <div style="width: 200px; height: 100px; background: #3498db; position: absolute; left: 100px; top: 100px;"></div>
```

### Canvas vs WebGL
```javascript
// Canvas 2D - 简单易用
const ctx = canvas.getContext('2d');
ctx.fillRect(0, 0, 100, 100);

// WebGL - 高性能3D
const gl = canvas.getContext('webgl');
// 需要复杂的着色器程序...
```

## 🛠️ 实践练习

### 练习1：创建你的第一个Canvas
```javascript
// 获取Canvas上下文
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘制彩色矩形
ctx.fillStyle = '#e74c3c';
ctx.fillRect(50, 50, 100, 100);

ctx.fillStyle = '#3498db';
ctx.fillRect(200, 50, 100, 100);

ctx.fillStyle = '#2ecc71';
ctx.fillRect(350, 50, 100, 100);

// 添加文字
ctx.fillStyle = '#333';
ctx.font = '20px Arial';
ctx.fillText('我的第一个Canvas', 200, 250);
```

### 练习2：绘制简单图案
```javascript
// 绘制棋盘图案
function drawChessBoard() {
    const squareSize = 50;
    const boardSize = 8;
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = col * squareSize;
            const y = row * squareSize;
            
            // 交替颜色
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = '#f0d9b5';
            } else {
                ctx.fillStyle = '#b58863';
            }
            
            ctx.fillRect(x, y, squareSize, squareSize);
        }
    }
}

drawChessBoard();
```

### 练习3：交互式绘图
```javascript
let isDrawing = false;

// 鼠标事件处理
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#333';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
    }
}
```

## 🔧 常用工具函数

### 工具函数集合
```javascript
// Canvas工具函数库
const CanvasUtils = {
    // 清空画布
    clear: function(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    
    // 获取鼠标位置
    getMousePos: function(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },
    
    // 随机颜色
    randomColor: function() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // 画布截图
    saveCanvas: function(canvas, filename = 'canvas.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    },
    
    // 设置画布尺寸
    setCanvasSize: function(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }
};

// 使用示例
CanvasUtils.clear(ctx);
const mousePos = CanvasUtils.getMousePos(canvas, event);
ctx.fillStyle = CanvasUtils.randomColor();
```

## 🎯 实际应用示例

### 示例1：数字时钟
```javascript
function drawDigitalClock() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 获取当前时间
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // 设置字体样式
    ctx.font = '48px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制时间
    ctx.fillText(timeString, canvas.width / 2, canvas.height / 2);
    
    // 绘制边框
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
}

// 每秒更新一次
setInterval(drawDigitalClock, 1000);
```

### 示例2：进度条
```javascript
function drawProgressBar(progress) {
    const barWidth = 400;
    const barHeight = 30;
    const x = (canvas.width - barWidth) / 2;
    const y = (canvas.height - barHeight) / 2;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 绘制进度
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x, y, barWidth * (progress / 100), barHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // 绘制文字
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(progress + '%', canvas.width / 2, y + barHeight + 25);
}

// 模拟进度更新
let progress = 0;
const progressInterval = setInterval(() => {
    drawProgressBar(progress);
    progress += 1;
    
    if (progress > 100) {
        clearInterval(progressInterval);
    }
}, 50);
```

## 📚 本章小结

通过本章学习，您掌握了：
- Canvas元素的基本概念和创建方法
- Canvas坐标系统的工作原理
- 基本的绘图上下文操作
- Canvas与其他图形技术的区别
- 高分辨率显示的适配技巧

这些基础知识为后续的图形绘制和动画开发奠定了坚实基础。

---

## 🔗 章节导航
- **课程首页**: [Canvas学习大纲](../README.md)
- **章节首页**: [Canvas基础入门](README.md)
- **下一章**: [第2章：绘图上下文](02-drawing-context.md) - 深入学习Canvas 2D绘图上下文的核心概念

## 📖 相关资源
- **官方文档**: [MDN Canvas API](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- **实践练习**: [Canvas基础练习](../examples/01-basics/)
- **视频教程**: [Canvas入门视频](https://example.com/canvas-basics)

---

**下一章预告**: 在下一章中，我们将深入学习Canvas 2D绘图上下文，掌握状态管理、变换操作等核心技能。 