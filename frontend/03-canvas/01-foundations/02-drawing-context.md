# Canvas绘图上下文

> 深入理解Canvas 2D绘图上下文的核心概念，掌握状态管理和变换操作。

## 📚 章节导航
- **上一章**: [第1章：Canvas入门基础](01-canvas-basics.md)
- **下一章**: [第3章：基本图形绘制](03-basic-shapes.md)
- **章节首页**: [Canvas基础入门](README.md)
- **课程首页**: [Canvas学习大纲](../README.md)

## 🎯 学习目标

通过本章学习，您将掌握：
- 2D绘图上下文的完整API
- Canvas状态保存和恢复机制
- 坐标变换和矩阵操作
- 绘图样式的设置和管理
- 高级上下文操作技巧

## 📚 绘图上下文基础

### 获取绘图上下文
```javascript
const canvas = document.getElementById('myCanvas');

// 获取2D绘图上下文
const ctx = canvas.getContext('2d');

// 获取WebGL上下文（3D）
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

// 检查上下文支持
if (!ctx) {
    console.error('您的浏览器不支持Canvas 2D');
    return;
}
```

### 上下文属性概览
```javascript
// 获取上下文信息
console.log('Canvas尺寸:', ctx.canvas.width, 'x', ctx.canvas.height);
console.log('上下文类型:', ctx);

// 常用属性
console.log('填充样式:', ctx.fillStyle);
console.log('描边样式:', ctx.strokeStyle);
console.log('线条宽度:', ctx.lineWidth);
console.log('字体设置:', ctx.font);
```

## 🎨 Canvas状态管理

### 状态保存与恢复
Canvas状态包括所有样式设置、变换矩阵、裁剪路径等信息。

```javascript
// 保存当前状态
ctx.save();

// 修改样式
ctx.fillStyle = '#e74c3c';
ctx.strokeStyle = '#c0392b';
ctx.lineWidth = 5;
ctx.font = '20px Arial';

// 应用变换
ctx.translate(100, 100);
ctx.rotate(Math.PI / 4);

// 绘制图形
ctx.fillRect(0, 0, 100, 50);

// 恢复之前的状态
ctx.restore();

// 现在所有设置都回到了save()时的状态
```

### 状态栈管理
```javascript
// 状态栈演示
function drawNestedShapes() {
    // 初始状态
    ctx.fillStyle = '#3498db';
    
    // 第一层状态
    ctx.save();
    ctx.fillStyle = '#e74c3c';
    ctx.translate(50, 50);
    
    // 第二层状态
    ctx.save();
    ctx.fillStyle = '#2ecc71';
    ctx.scale(1.5, 1.5);
    
    // 绘制图形
    ctx.fillRect(0, 0, 50, 50);  // 绿色，变换后
    
    ctx.restore(); // 回到第一层
    ctx.fillRect(100, 0, 50, 50); // 红色，只有translate
    
    ctx.restore(); // 回到初始状态
    ctx.fillRect(200, 50, 50, 50); // 蓝色，无变换
}

drawNestedShapes();
```

### 实用的状态管理模式
```javascript
// 状态管理工具函数
const CanvasState = {
    // 在特定状态下执行操作
    withState: function(ctx, callback) {
        ctx.save();
        try {
            callback(ctx);
        } finally {
            ctx.restore();
        }
    },
    
    // 应用样式并执行
    withStyle: function(ctx, styles, callback) {
        ctx.save();
        
        // 应用样式
        Object.keys(styles).forEach(key => {
            ctx[key] = styles[key];
        });
        
        try {
            callback(ctx);
        } finally {
            ctx.restore();
        }
    }
};

// 使用示例
CanvasState.withStyle(ctx, {
    fillStyle: '#e74c3c',
    strokeStyle: '#c0392b',
    lineWidth: 3
}, (ctx) => {
    ctx.fillRect(50, 50, 100, 100);
    ctx.strokeRect(50, 50, 100, 100);
});
```

## 🔄 坐标变换

### 基本变换操作

#### 平移变换 (translate)
```javascript
// 平移坐标系
ctx.translate(100, 100);

// 现在(0,0)点实际在(100,100)位置
ctx.fillStyle = '#3498db';
ctx.fillRect(0, 0, 50, 50); // 实际绘制在(100,100)

// 累积平移
ctx.translate(50, 50);
ctx.fillStyle = '#e74c3c';
ctx.fillRect(0, 0, 50, 50); // 实际绘制在(150,150)
```

#### 旋转变换 (rotate)
```javascript
// 围绕原点旋转
function drawRotatedSquares() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY); // 移动到中心
    
    for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / 8) * i); // 旋转
        ctx.fillStyle = `hsl(${i * 45}, 70%, 50%)`;
        ctx.fillRect(-25, -100, 50, 50);
        ctx.restore();
    }
    
    ctx.restore();
}

drawRotatedSquares();
```

#### 缩放变换 (scale)
```javascript
// 缩放操作
ctx.save();

// 等比缩放
ctx.scale(2, 2);
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 50, 50); // 实际大小100x100

ctx.restore();
ctx.save();

// 非等比缩放
ctx.scale(3, 1);
ctx.fillStyle = '#e74c3c';
ctx.fillRect(50, 150, 50, 50); // 宽度拉伸3倍

ctx.restore();

// 负值缩放（镜像）
ctx.save();
ctx.scale(-1, 1); // 水平镜像
ctx.fillStyle = '#2ecc71';
ctx.fillText('镜像文字', -200, 250);
ctx.restore();
```

### 复合变换
```javascript
// 组合多种变换
function drawTransformedShape() {
    ctx.save();
    
    // 移动到中心
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // 旋转45度
    ctx.rotate(Math.PI / 4);
    
    // 缩放1.5倍
    ctx.scale(1.5, 1.5);
    
    // 绘制形状（以变换后的坐标系）
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(-50, -25, 100, 50);
    
    // 绘制中心点
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
}

drawTransformedShape();
```

### 变换矩阵
```javascript
// 直接设置变换矩阵
// ctx.setTransform(a, b, c, d, e, f)
// a,d: 缩放  b,c: 倾斜  e,f: 平移

// 重置变换矩阵
ctx.setTransform(1, 0, 0, 1, 0, 0);

// 自定义变换
ctx.setTransform(
    1.5,    // 水平缩放
    0.5,    // 水平倾斜
    -0.5,   // 垂直倾斜
    1.5,    // 垂直缩放
    100,    // 水平平移
    50      // 垂直平移
);

ctx.fillStyle = '#f39c12';
ctx.fillRect(0, 0, 100, 50);

// 恢复默认变换
ctx.resetTransform(); // 或 ctx.setTransform(1, 0, 0, 1, 0, 0);
```

## 🎨 绘图样式设置

### 颜色设置
```javascript
// 多种颜色格式
ctx.fillStyle = '#e74c3c';           // 十六进制
ctx.fillStyle = 'rgb(231, 76, 60)';  // RGB
ctx.fillStyle = 'rgba(231, 76, 60, 0.7)'; // RGBA
ctx.fillStyle = 'hsl(6, 78%, 57%)';  // HSL
ctx.fillStyle = 'red';               // 颜色名称

// 描边颜色
ctx.strokeStyle = '#3498db';
```

### 线条样式
```javascript
// 线条宽度
ctx.lineWidth = 5;

// 线条端点样式
ctx.lineCap = 'butt';   // 默认，平直端点
ctx.lineCap = 'round';  // 圆形端点
ctx.lineCap = 'square'; // 方形端点

// 线条连接样式
ctx.lineJoin = 'miter'; // 默认，尖角连接
ctx.lineJoin = 'round'; // 圆角连接
ctx.lineJoin = 'bevel'; // 斜角连接

// 虚线样式
ctx.setLineDash([5, 5]);        // 5像素线段，5像素间隔
ctx.setLineDash([10, 5, 5, 5]); // 复杂虚线模式
ctx.lineDashOffset = 0;         // 虚线偏移

// 绘制示例
function drawLineStyles() {
    const styles = [
        { cap: 'butt', join: 'miter', dash: [] },
        { cap: 'round', join: 'round', dash: [5, 5] },
        { cap: 'square', join: 'bevel', dash: [10, 5, 5, 5] }
    ];
    
    styles.forEach((style, index) => {
        ctx.save();
        ctx.translate(0, index * 100);
        ctx.lineWidth = 8;
        ctx.lineCap = style.cap;
        ctx.lineJoin = style.join;
        ctx.setLineDash(style.dash);
        
        // 绘制路径
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(150, 50);
        ctx.lineTo(150, 80);
        ctx.lineTo(200, 80);
        ctx.stroke();
        
        ctx.restore();
    });
}

drawLineStyles();
```

### 阴影效果
```javascript
// 阴影设置
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // 阴影颜色
ctx.shadowBlur = 10;                     // 阴影模糊度
ctx.shadowOffsetX = 5;                   // 水平偏移
ctx.shadowOffsetY = 5;                   // 垂直偏移

// 绘制带阴影的图形
ctx.fillStyle = '#3498db';
ctx.fillRect(100, 100, 150, 100);

// 清除阴影
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
```

## 🔧 高级上下文操作

### 全局合成操作
```javascript
// 设置合成模式
ctx.globalCompositeOperation = 'source-over'; // 默认

// 常用合成模式
const compositeOperations = [
    'source-over',      // 新图形绘制在现有图形上方
    'source-in',        // 新图形只在与现有图形重叠的地方绘制
    'source-out',       // 新图形只在不与现有图形重叠的地方绘制
    'destination-over', // 新图形绘制在现有图形下方
    'multiply',         // 颜色相乘
    'screen',          // 颜色屏幕混合
    'difference',      // 颜色差值
    'xor'             // 异或操作
];

// 演示不同合成模式
function drawCompositeDemo() {
    compositeOperations.forEach((operation, index) => {
        const x = (index % 4) * 200;
        const y = Math.floor(index / 4) * 150;
        
        ctx.save();
        ctx.translate(x, y);
        
        // 绘制第一个图形
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(20, 20, 80, 80);
        
        // 设置合成模式
        ctx.globalCompositeOperation = operation;
        
        // 绘制第二个图形
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(80, 80, 40, 0, 2 * Math.PI);
        ctx.fill();
        
        // 标签
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(operation, 10, 140);
        
        ctx.restore();
    });
}

drawCompositeDemo();
```

### 透明度控制
```javascript
// 全局透明度
ctx.globalAlpha = 0.5; // 50%透明度

ctx.fillStyle = '#e74c3c';
ctx.fillRect(50, 50, 100, 100);

ctx.fillStyle = '#3498db';
ctx.fillRect(100, 100, 100, 100);

// 恢复完全不透明
ctx.globalAlpha = 1.0;
```

### 路径操作
```javascript
// 当前路径管理
ctx.beginPath(); // 开始新路径
ctx.moveTo(100, 100);
ctx.lineTo(200, 100);
ctx.lineTo(150, 50);
ctx.closePath(); // 闭合路径

// 绘制路径
ctx.stroke(); // 描边
ctx.fill();   // 填充

// 路径检测
const isPointInPath = ctx.isPointInPath(150, 75);
console.log('点是否在路径内:', isPointInPath);
```

## 🛠️ 实用工具函数

### 上下文工具类
```javascript
class CanvasContextUtils {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    // 设置多个样式
    setStyles(styles) {
        Object.keys(styles).forEach(key => {
            this.ctx[key] = styles[key];
        });
        return this;
    }
    
    // 在指定状态下执行
    withState(callback) {
        this.ctx.save();
        try {
            callback(this.ctx);
        } finally {
            this.ctx.restore();
        }
        return this;
    }
    
    // 绘制虚线
    drawDashedLine(x1, y1, x2, y2, dashPattern = [5, 5]) {
        return this.withState(ctx => {
            ctx.setLineDash(dashPattern);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    }
    
    // 绘制带阴影的形状
    drawWithShadow(drawFunction, shadowOptions = {}) {
        return this.withState(ctx => {
            ctx.shadowColor = shadowOptions.color || 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = shadowOptions.blur || 5;
            ctx.shadowOffsetX = shadowOptions.offsetX || 3;
            ctx.shadowOffsetY = shadowOptions.offsetY || 3;
            
            drawFunction(ctx);
        });
    }
    
    // 重置所有样式
    resetStyles() {
        const defaults = {
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over'
        };
        
        this.setStyles(defaults);
        this.ctx.setLineDash([]);
        this.ctx.shadowColor = 'transparent';
        return this;
    }
}

// 使用示例
const utils = new CanvasContextUtils(ctx);

utils.setStyles({
    fillStyle: '#e74c3c',
    strokeStyle: '#c0392b',
    lineWidth: 3
}).withState(ctx => {
    ctx.fillRect(50, 50, 100, 100);
    ctx.strokeRect(50, 50, 100, 100);
});

utils.drawWithShadow(ctx => {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(200, 50, 100, 100);
}, { blur: 10, offsetX: 5, offsetY: 5 });
```

## 🎯 实践练习

### 练习1：变换动画
```javascript
let rotation = 0;

function animateTransform() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 中心点
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    
    // 移动到中心并旋转
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    // 绘制旋转的矩形
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-50, -25, 100, 50);
    
    // 绘制中心点
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
    
    // 更新旋转角度
    rotation += 0.02;
    
    // 继续动画
    requestAnimationFrame(animateTransform);
}

animateTransform();
```

### 练习2：多层绘图
```javascript
function drawLayeredGraphics() {
    // 背景层
    ctx.save();
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 阴影层
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(100, 100, 200, 100);
    ctx.restore();
    
    // 前景层
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(150, 150, 200, 100);
    ctx.restore();
    
    // 文字层
    ctx.save();
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('多层绘图示例', canvas.width / 2, 300);
    ctx.restore();
}

drawLayeredGraphics();
```

## 🎯 本章小结

通过本章学习，您掌握了：
- Canvas 2D绘图上下文的完整API体系
- 画布状态的保存与恢复机制
- 坐标变换的基本操作方法
- 绘图样式的设置和管理技巧
- 全局合成操作的使用方法

这些技能为复杂图形的绘制和动画效果的实现提供了技术基础。

---

## 🔗 章节导航
- **上一章**: [第1章：Canvas入门基础](01-canvas-basics.md)
- **下一章**: [第3章：基本图形绘制](03-basic-shapes.md) - 学习各种基本图形的绘制方法
- **章节首页**: [Canvas基础入门](README.md)
- **课程首页**: [Canvas学习大纲](../README.md)

## 📖 相关资源
- **技术文档**: [CanvasRenderingContext2D API](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D)
- **实践练习**: [绘图上下文练习](../examples/02-context/)
- **扩展阅读**: [Canvas变换详解](https://example.com/canvas-transforms)

---

**下一章预告**: 接下来我们将学习如何使用Canvas绘制各种基本图形，包括直线、矩形、圆形和复杂路径。 