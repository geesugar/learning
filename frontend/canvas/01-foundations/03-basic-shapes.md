# Canvas基本图形绘制

> 掌握Canvas基本图形的绘制方法，包括直线、矩形、圆形和复杂路径。

## 📚 章节导航
- **上一章**: [第2章：绘图上下文](02-drawing-context.md)
- **下一章**: [第4章：高级路径操作](../02-graphics/01-advanced-paths.md)
- **章节首页**: [Canvas基础入门](README.md)
- **课程首页**: [Canvas学习大纲](../README.md)

## 🎯 学习目标

通过本章学习，您将掌握：
- 矩形的多种绘制方法
- 圆形和弧形的精确控制
- 直线和复杂路径的构建
- 贝塞尔曲线的绘制技巧
- 图形组合和实际应用

## 📐 矩形绘制

### 基本矩形方法
Canvas提供了多种绘制矩形的便捷方法：

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 填充矩形
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 150, 100); // x, y, width, height

// 描边矩形
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 3;
ctx.strokeRect(250, 50, 150, 100);

// 清除矩形区域
ctx.clearRect(75, 75, 100, 50); // 在填充矩形中清除一块
```

### 圆角矩形
Canvas原生不支持圆角矩形，但可以用路径实现：

```javascript
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 使用圆角矩形
ctx.fillStyle = '#2ecc71';
drawRoundedRect(100, 200, 200, 80, 15);
ctx.fill();

ctx.strokeStyle = '#27ae60';
ctx.lineWidth = 2;
ctx.stroke();
```

### 渐变矩形
```javascript
// 线性渐变
const gradient = ctx.createLinearGradient(0, 0, 200, 0);
gradient.addColorStop(0, '#e74c3c');
gradient.addColorStop(1, '#f39c12');

ctx.fillStyle = gradient;
ctx.fillRect(400, 200, 200, 80);
```

## ⭕ 圆形和弧形

### 基本圆形绘制
```javascript
// 完整圆形
ctx.beginPath();
ctx.arc(150, 150, 50, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
ctx.fillStyle = '#9b59b6';
ctx.fill();

// 描边圆形
ctx.beginPath();
ctx.arc(300, 150, 50, 0, 2 * Math.PI);
ctx.strokeStyle = '#8e44ad';
ctx.lineWidth = 4;
ctx.stroke();
```

### 弧形绘制
```javascript
// 绘制弧形
ctx.beginPath();
ctx.arc(450, 150, 50, 0, Math.PI); // 半圆
ctx.strokeStyle = '#e67e22';
ctx.lineWidth = 6;
ctx.stroke();

// 扇形（饼图片段）
ctx.beginPath();
ctx.moveTo(150, 300); // 移动到圆心
ctx.arc(150, 300, 60, 0, Math.PI / 2); // 90度扇形
ctx.closePath();
ctx.fillStyle = '#1abc9c';
ctx.fill();
```

### 椭圆绘制
Canvas 2.4新增的椭圆方法：

```javascript
// 椭圆绘制（现代浏览器支持）
if (ctx.ellipse) {
    ctx.beginPath();
    ctx.ellipse(300, 300, 80, 50, 0, 0, 2 * Math.PI); // x, y, radiusX, radiusY, rotation, startAngle, endAngle
    ctx.fillStyle = '#34495e';
    ctx.fill();
} else {
    // 兼容性椭圆绘制
    ctx.save();
    ctx.translate(300, 300);
    ctx.scale(1.6, 1); // 水平拉伸
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#34495e';
    ctx.fill();
    ctx.restore();
}
```

### 圆形组合图案
```javascript
function drawCirclePattern() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const numCircles = 8;
    const radius = 20;
    const distance = 100;
    
    for (let i = 0; i < numCircles; i++) {
        const angle = (2 * Math.PI / numCircles) * i;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${i * 45}, 70%, 60%)`;
        ctx.fill();
    }
}

drawCirclePattern();
```

## 📏 直线和路径

### 基本直线绘制
```javascript
// 简单直线
ctx.beginPath();
ctx.moveTo(50, 50);   // 起点
ctx.lineTo(200, 100); // 终点
ctx.strokeStyle = '#3498db';
ctx.lineWidth = 3;
ctx.stroke();

// 连续直线
ctx.beginPath();
ctx.moveTo(50, 150);
ctx.lineTo(100, 100);
ctx.lineTo(150, 150);
ctx.lineTo(200, 120);
ctx.lineTo(250, 150);
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 2;
ctx.stroke();
```

### 虚线绘制
```javascript
// 设置虚线样式
ctx.setLineDash([10, 5]); // 10像素实线，5像素空白

ctx.beginPath();
ctx.moveTo(50, 200);
ctx.lineTo(300, 200);
ctx.strokeStyle = '#2ecc71';
ctx.lineWidth = 3;
ctx.stroke();

// 复杂虚线模式
ctx.setLineDash([15, 5, 5, 5]); // 长线-短空-短线-短空
ctx.beginPath();
ctx.moveTo(50, 230);
ctx.lineTo(300, 230);
ctx.strokeStyle = '#f39c12';
ctx.stroke();

// 重置为实线
ctx.setLineDash([]);
```

### 路径构建
```javascript
// 复杂路径
function drawComplexPath() {
    ctx.beginPath();
    
    // 移动到起点
    ctx.moveTo(100, 100);
    
    // 绘制线段
    ctx.lineTo(200, 50);
    ctx.lineTo(300, 100);
    ctx.lineTo(350, 150);
    ctx.lineTo(300, 200);
    ctx.lineTo(200, 250);
    ctx.lineTo(100, 200);
    
    // 闭合路径
    ctx.closePath();
    
    // 填充和描边
    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.fill();
    
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.stroke();
}

drawComplexPath();
```

### 线条端点和连接样式
```javascript
function drawLineStyles() {
    const lineConfigs = [
        { cap: 'butt', join: 'miter', label: 'butt + miter' },
        { cap: 'round', join: 'round', label: 'round + round' },
        { cap: 'square', join: 'bevel', label: 'square + bevel' }
    ];
    
    lineConfigs.forEach((config, index) => {
        const y = 100 + index * 80;
        
        ctx.save();
        ctx.lineWidth = 15;
        ctx.lineCap = config.cap;
        ctx.lineJoin = config.join;
        ctx.strokeStyle = '#34495e';
        
        // 绘制L形线条
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(150, y);
        ctx.lineTo(150, y + 40);
        ctx.stroke();
        
        // 标签
        ctx.restore();
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.fillText(config.label, 200, y + 20);
    });
}

drawLineStyles();
```

## 🌊 贝塞尔曲线

### 二次贝塞尔曲线
```javascript
// 二次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(50, 200);
ctx.quadraticCurveTo(150, 50, 250, 200); // 控制点, 终点
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 3;
ctx.stroke();

// 显示控制点
ctx.fillStyle = '#c0392b';
ctx.beginPath();
ctx.arc(150, 50, 4, 0, 2 * Math.PI); // 控制点
ctx.fill();

// 控制线（辅助线）
ctx.save();
ctx.setLineDash([5, 5]);
ctx.strokeStyle = '#bdc3c7';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(50, 200);
ctx.lineTo(150, 50);
ctx.lineTo(250, 200);
ctx.stroke();
ctx.restore();
```

### 三次贝塞尔曲线
```javascript
// 三次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(50, 350);
ctx.bezierCurveTo(100, 250, 200, 450, 300, 350); // 控制点1, 控制点2, 终点
ctx.strokeStyle = '#3498db';
ctx.lineWidth = 3;
ctx.stroke();

// 显示控制点
ctx.fillStyle = '#2980b9';
ctx.beginPath();
ctx.arc(100, 250, 4, 0, 2 * Math.PI); // 控制点1
ctx.fill();
ctx.beginPath();
ctx.arc(200, 450, 4, 0, 2 * Math.PI); // 控制点2
ctx.fill();

// 控制线
ctx.save();
ctx.setLineDash([3, 3]);
ctx.strokeStyle = '#bdc3c7';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(50, 350);
ctx.lineTo(100, 250);
ctx.moveTo(200, 450);
ctx.lineTo(300, 350);
ctx.stroke();
ctx.restore();
```

### 平滑曲线
```javascript
// 绘制平滑的波浪线
function drawSmoothWave() {
    const points = [
        {x: 50, y: 150},
        {x: 150, y: 100},
        {x: 250, y: 200},
        {x: 350, y: 80},
        {x: 450, y: 180}
    ];
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        if (next) {
            // 计算控制点
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y;
            const cp2x = curr.x - (next.x - curr.x) * 0.5;
            const cp2y = curr.y;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
        } else {
            ctx.lineTo(curr.x, curr.y);
        }
    }
    
    ctx.strokeStyle = '#9b59b6';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 绘制控制点
    points.forEach(point => {
        ctx.fillStyle = '#8e44ad';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

drawSmoothWave();
```

## 🎨 图形组合应用

### 绘制复杂图标
```javascript
// 绘制房子图标
function drawHouseIcon(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    
    // 房子主体
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(0, 20, 60, 40);
    
    // 屋顶
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(-5, 20);
    ctx.lineTo(30, -5);
    ctx.lineTo(65, 20);
    ctx.closePath();
    ctx.fill();
    
    // 门
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(20, 35, 12, 25);
    
    // 门把手
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(30, 47, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // 窗户
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(5, 30, 10, 10);
    ctx.fillRect(45, 30, 10, 10);
    
    // 窗框
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(5, 30, 10, 10);
    ctx.strokeRect(45, 30, 10, 10);
    
    // 窗格
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 40);
    ctx.moveTo(5, 35);
    ctx.lineTo(15, 35);
    ctx.moveTo(50, 30);
    ctx.lineTo(50, 40);
    ctx.moveTo(45, 35);
    ctx.lineTo(55, 35);
    ctx.stroke();
    
    ctx.restore();
}

// 绘制多个房子
drawHouseIcon(100, 100, 1);
drawHouseIcon(250, 150, 1.5);
drawHouseIcon(400, 120, 0.8);
```

### 创建花朵图案
```javascript
function drawFlower(centerX, centerY, petalCount, petalLength, petalWidth) {
    const angleStep = (2 * Math.PI) / petalCount;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 绘制花瓣
    for (let i = 0; i < petalCount; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);
        
        // 花瓣形状（椭圆）
        ctx.beginPath();
        ctx.ellipse(0, -petalLength/2, petalWidth/2, petalLength/2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${320 + i * 10}, 70%, 70%)`;
        ctx.fill();
        ctx.strokeStyle = `hsl(${320 + i * 10}, 70%, 50%)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 花心
    ctx.beginPath();
    ctx.arc(0, 0, petalWidth/3, 0, 2 * Math.PI);
    ctx.fillStyle = '#f39c12';
    ctx.fill();
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

// 绘制花园
drawFlower(150, 200, 8, 40, 20);
drawFlower(350, 250, 6, 35, 18);
drawFlower(250, 150, 10, 30, 15);
```

### 绘制齿轮
```javascript
function drawGear(centerX, centerY, innerRadius, outerRadius, teeth) {
    const angleStep = (2 * Math.PI) / (teeth * 2);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    ctx.beginPath();
    
    for (let i = 0; i < teeth * 2; i++) {
        const angle = i * angleStep;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    
    // 填充和描边
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 中心圆孔
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();
    ctx.strokeStyle = '#bdc3c7';
    ctx.stroke();
    
    ctx.restore();
}

// 绘制齿轮组
drawGear(200, 200, 30, 50, 12);
drawGear(320, 200, 25, 40, 10);
drawGear(260, 120, 20, 35, 8);
```

## 🛠️ 实用绘图函数

### 通用图形绘制库
```javascript
const ShapeDrawer = {
    // 绘制正多边形
    polygon: function(ctx, x, y, radius, sides, rotation = 0) {
        const angleStep = (2 * Math.PI) / sides;
        
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep + rotation;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    },
    
    // 绘制星形
    star: function(ctx, x, y, innerRadius, outerRadius, points) {
        const angleStep = Math.PI / points;
        
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = i * angleStep;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    },
    
    // 绘制圆角矩形
    roundRect: function(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
};

// 使用示例
ctx.fillStyle = '#3498db';
ShapeDrawer.polygon(ctx, 150, 150, 50, 6); // 六边形
ctx.fill();

ctx.fillStyle = '#e74c3c';
ShapeDrawer.star(ctx, 300, 150, 25, 50, 5); // 五角星
ctx.fill();

ctx.fillStyle = '#2ecc71';
ShapeDrawer.roundRect(ctx, 400, 100, 120, 80, 15); // 圆角矩形
ctx.fill();
```

## 🎯 本章小结

通过本章学习，您掌握了：
- 各种基本图形的绘制方法
- 路径系统的核心概念和应用
- 贝塞尔曲线的绘制技巧
- 复杂图形的组合构建方法
- 图形绘制的性能优化技巧

这些技能为创建复杂的图形应用和视觉效果奠定了基础。

---

## 🔗 章节导航
- **上一章**: [第2章：绘图上下文](02-drawing-context.md)
- **下一章**: [第4章：高级路径操作](../02-graphics/01-advanced-paths.md) - 学习复杂路径和填充技术
- **章节首页**: [Canvas基础入门](README.md)
- **下一阶段**: [图形绘制进阶](../02-graphics/README.md)

## 📖 相关资源
- **技术文档**: [Canvas路径API](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D#路径)
- **实践练习**: [基本图形练习](../examples/03-shapes/)
- **设计灵感**: [几何图形设计](https://example.com/geometric-design)

---

**下一章预告**: 在第二阶段中，我们将学习更高级的路径操作技术，包括复杂路径绘制、碰撞检测等。 