# Canvas高级路径操作

> 掌握复杂路径绘制、碰撞检测和路径动画，构建精确的图形应用。

## 🎯 学习目标

- 复杂路径的高级绘制技巧
- 路径方向和填充规则的应用  
- 路径碰撞检测算法实现
- 路径动画效果的创建
- 路径优化和性能提升

## 🔄 复杂路径绘制

### 多边形路径
```javascript
function drawComplexPolygon() {
    // 复杂的多边形路径
    const vertices = [
        {x: 100, y: 50},
        {x: 200, y: 80},
        {x: 250, y: 150},
        {x: 200, y: 220},
        {x: 120, y: 250},
        {x: 50, y: 200},
        {x: 30, y: 120}
    ];
    
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    
    for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    
    ctx.closePath();
    
    // 渐变填充
    const gradient = ctx.createLinearGradient(50, 50, 250, 250);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#e74c3c');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.stroke();
}

drawComplexPolygon();
```

### 镂空路径设计
```javascript
function drawHollowShape() {
    ctx.beginPath();
    
    // 外部轮廓（顺时针）
    ctx.arc(200, 200, 100, 0, 2 * Math.PI);
    
    // 内部镂空（逆时针绘制）
    ctx.moveTo(260, 200);
    ctx.arc(200, 200, 60, 0, 2 * Math.PI, true);
    
    // 小孔
    ctx.moveTo(195, 180);
    ctx.arc(180, 180, 15, 0, 2 * Math.PI, true);
    
    ctx.moveTo(235, 220);
    ctx.arc(220, 220, 15, 0, 2 * Math.PI, true);
    
    ctx.fillStyle = '#e74c3c';
    ctx.fill('evenodd'); // 填充规则
    ctx.stroke();
}
```

### 曲线路径组合
```javascript
function drawFlowingPath() {
    const points = [
        {x: 50, y: 200, cp1x: 100, cp1y: 100, cp2x: 150, cp2y: 150},
        {x: 250, y: 180, cp1x: 300, cp1y: 120, cp2x: 350, cp2y: 200},
        {x: 450, y: 220, cp1x: 500, cp1y: 160, cp2x: 550, cp2y: 280},
        {x: 650, y: 200}
    ];
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const prevPoint = points[i - 1];
        
        if (point.cp1x && point.cp2x) {
            ctx.bezierCurveTo(
                prevPoint.cp1x, prevPoint.cp1y,
                point.cp2x, point.cp2y,
                point.x, point.y
            );
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    
    // 绘制主路径
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 绘制控制点（调试用）
    ctx.fillStyle = '#e74c3c';
    points.forEach(point => {
        if (point.cp1x) {
            ctx.beginPath();
            ctx.arc(point.cp1x, point.cp1y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
        if (point.cp2x) {
            ctx.beginPath();
            ctx.arc(point.cp2x, point.cp2y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

drawFlowingPath();
```

## 🎨 填充规则详解

### Even-Odd vs Non-Zero规则
```javascript
function demonstrateFillRules() {
    function createPath() {
        ctx.beginPath();
        ctx.arc(100, 100, 60, 0, 2 * Math.PI); // 外圆
        ctx.moveTo(140, 100);
        ctx.arc(100, 100, 40, 0, 2 * Math.PI); // 内圆
        ctx.rect(70, 70, 60, 60); // 矩形
    }
    
    // Even-Odd规则
    ctx.save();
    createPath();
    ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
    ctx.fill('evenodd');
    ctx.fillText('Even-Odd', 50, 200);
    ctx.restore();
    
    // Non-Zero规则  
    ctx.save();
    ctx.translate(250, 0);
    createPath();
    ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
    ctx.fill('nonzero');
    ctx.fillText('Non-Zero', 50, 200);
    ctx.restore();
}

demonstrateFillRules();
```

### 路径方向控制
```javascript
function drawDirectionControlDemo() {
    // 顺时针外圆
    function drawClockwiseCircle(x, y, radius) {
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    }
    
    // 逆时针内圆
    function drawCounterClockwiseCircle(x, y, radius) {
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    }
    
    ctx.beginPath();
    
    // 创建环形
    drawClockwiseCircle(200, 200, 100);
    drawCounterClockwiseCircle(200, 200, 60);
    
    ctx.fillStyle = '#2ecc71';
    ctx.fill('evenodd');
    
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.stroke();
}

drawDirectionControlDemo();
```

## 🎯 路径碰撞检测

### 点在路径检测
```javascript
class PathCollisionDetector {
    constructor(ctx) {
        this.ctx = ctx;
        this.paths = [];
    }
    
    addPath(pathFunction, name) {
        this.paths.push({ draw: pathFunction, name });
    }
    
    isPointInPath(x, y) {
        for (let i = 0; i < this.paths.length; i++) {
            this.ctx.save();
            this.paths[i].draw();
            if (this.ctx.isPointInPath(x, y)) {
                this.ctx.restore();
                return { hit: true, pathIndex: i, pathName: this.paths[i].name };
            }
            this.ctx.restore();
        }
        return { hit: false };
    }
    
    visualizeCollision(mouseX, mouseY) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        this.paths.forEach((path) => {
            this.ctx.save();
            path.draw();
            
            const isHit = this.ctx.isPointInPath(mouseX, mouseY);
            this.ctx.fillStyle = isHit ? 'rgba(231, 76, 60, 0.7)' : 'rgba(52, 152, 219, 0.3)';
            this.ctx.fill();
            
            this.ctx.strokeStyle = isHit ? '#c0392b' : '#2980b9';
            this.ctx.stroke();
            this.ctx.restore();
        });
        
        // 绘制鼠标指针
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.beginPath();
        this.ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}

// 使用示例
const detector = new PathCollisionDetector(ctx);

detector.addPath(() => {
    ctx.beginPath();
    ctx.rect(100, 100, 150, 100);
}, 'rectangle');

detector.addPath(() => {
    ctx.beginPath();
    ctx.arc(350, 150, 60, 0, 2 * Math.PI);
}, 'circle');

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    detector.visualizeCollision(mouseX, mouseY);
});
```

### 路径与路径碰撞
```javascript
function checkPathIntersection(path1Func, path2Func) {
    // 简化版本：使用采样点检测
    const samples = 100;
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    canvas1.width = canvas2.width = canvas.width;
    canvas1.height = canvas2.height = canvas.height;
    
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    // 绘制路径到不同画布
    path1Func(ctx1);
    ctx1.fill();
    
    path2Func(ctx2);
    ctx2.fill();
    
    // 获取像素数据
    const imageData1 = ctx1.getImageData(0, 0, canvas.width, canvas.height);
    const imageData2 = ctx2.getImageData(0, 0, canvas.width, canvas.height);
    
    // 检测重叠像素
    for (let i = 0; i < imageData1.data.length; i += 4) {
        if (imageData1.data[i + 3] > 0 && imageData2.data[i + 3] > 0) {
            return true; // 发现重叠
        }
    }
    
    return false;
}

// 使用示例
const rect = (ctx) => {
    ctx.beginPath();
    ctx.rect(100, 100, 150, 100);
};

const circle = (ctx) => {
    ctx.beginPath();
    ctx.arc(200, 150, 80, 0, 2 * Math.PI);
};

console.log('路径是否相交:', checkPathIntersection(rect, circle));
```

## 🎬 路径动画

### 路径描边动画
```javascript
class PathStrokeAnimation {
    constructor(ctx) {
        this.ctx = ctx;
        this.isAnimating = false;
    }
    
    animateStroke(pathFunction, duration = 2000) {
        const startTime = Date.now();
        this.isAnimating = true;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            this.ctx.save();
            pathFunction();
            
            // 使用虚线实现描边动画
            const pathLength = 1000; // 估算路径长度
            const dashLength = pathLength * progress;
            
            this.ctx.setLineDash([dashLength, pathLength]);
            this.ctx.lineDashOffset = 0;
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
            this.ctx.restore();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.drawComplete(pathFunction);
            }
        };
        
        animate();
    }
    
    drawComplete(pathFunction) {
        this.ctx.save();
        pathFunction();
        this.ctx.strokeStyle = '#2ecc71';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        this.ctx.restore();
    }
}

// 使用示例
const animator = new PathStrokeAnimation(ctx);

const complexPath = () => {
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.quadraticCurveTo(200, 50, 350, 100);
    ctx.quadraticCurveTo(500, 150, 650, 100);
    ctx.lineTo(650, 300);
    ctx.quadraticCurveTo(400, 350, 50, 300);
    ctx.closePath();
};

animator.animateStroke(complexPath, 3000);
```

### 路径变形动画
```javascript
class PathMorphAnimation {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    interpolatePaths(path1, path2, progress) {
        const result = [];
        const maxLength = Math.max(path1.length, path2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const p1 = path1[i] || path1[path1.length - 1];
            const p2 = path2[i] || path2[path2.length - 1];
            
            result.push({
                x: p1.x + (p2.x - p1.x) * progress,
                y: p1.y + (p2.y - p1.y) * progress
            });
        }
        
        return result;
    }
    
    drawPath(points) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.closePath();
    }
    
    morph(startPath, endPath, duration = 1000) {
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数
            const eased = progress < 0.5 ? 4 * progress * progress * progress : 
                         1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            const currentPath = this.interpolatePaths(startPath, endPath, eased);
            this.drawPath(currentPath);
            
            this.ctx.fillStyle = `rgba(52, 152, 219, ${0.3 + 0.4 * progress})`;
            this.ctx.fill();
            this.ctx.strokeStyle = '#3498db';
            this.ctx.stroke();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
}

// 创建星形到圆形的变形
const morphAnimator = new PathMorphAnimation(ctx);

const starPath = [];
const circlePoints = 8;
for (let i = 0; i < circlePoints; i++) {
    const angle = (i / circlePoints) * 2 * Math.PI;
    const radius = i % 2 === 0 ? 80 : 40;
    starPath.push({
        x: 300 + Math.cos(angle) * radius,
        y: 200 + Math.sin(angle) * radius
    });
}

const circlePath = [];
for (let i = 0; i < circlePoints; i++) {
    const angle = (i / circlePoints) * 2 * Math.PI;
    circlePath.push({
        x: 300 + Math.cos(angle) * 60,
        y: 200 + Math.sin(angle) * 60
    });
}

morphAnimator.morph(starPath, circlePath, 2000);
```

## 🔧 路径优化

### 路径简化算法
```javascript
class PathOptimizer {
    static simplifyPath(points, tolerance = 2) {
        if (points.length <= 2) return points;
        
        function getDistance(point, lineStart, lineEnd) {
            const A = point.x - lineStart.x;
            const B = point.y - lineStart.y;
            const C = lineEnd.x - lineStart.x;
            const D = lineEnd.y - lineStart.y;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            
            if (lenSq === 0) return Math.sqrt(A * A + B * B);
            
            const param = Math.max(0, Math.min(1, dot / lenSq));
            const xx = lineStart.x + param * C;
            const yy = lineStart.y + param * D;
            
            const dx = point.x - xx;
            const dy = point.y - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        function douglasPeucker(points, tolerance) {
            if (points.length <= 2) return points;
            
            let maxDistance = 0;
            let index = 0;
            
            for (let i = 1; i < points.length - 1; i++) {
                const distance = getDistance(points[i], points[0], points[points.length - 1]);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    index = i;
                }
            }
            
            if (maxDistance > tolerance) {
                const left = douglasPeucker(points.slice(0, index + 1), tolerance);
                const right = douglasPeucker(points.slice(index), tolerance);
                return left.slice(0, -1).concat(right);
            }
            
            return [points[0], points[points.length - 1]];
        }
        
        return douglasPeucker(points, tolerance);
    }
}
```

## 🎯 实际应用示例

### 手绘路径识别
```javascript
class DrawingRecognizer {
    constructor(ctx) {
        this.ctx = ctx;
        this.path = [];
        this.isDrawing = false;
    }
    
    startDrawing(x, y) {
        this.isDrawing = true;
        this.path = [{x, y}];
    }
    
    addPoint(x, y) {
        if (!this.isDrawing) return;
        
        this.path.push({x, y});
        this.redraw();
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.recognizeShape();
    }
    
    redraw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        if (this.path.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
    
    recognizeShape() {
        if (this.path.length < 10) return;
        
        // 简化路径
        const simplified = PathOptimizer.simplifyPath(this.path, 10);
        
        // 基础形状识别
        if (this.isCircle(simplified)) {
            this.drawPerfectCircle();
        } else if (this.isRectangle(simplified)) {
            this.drawPerfectRectangle();
        }
    }
    
    isCircle(points) {
        // 检查是否接近圆形
        const center = this.getCenter(points);
        const avgRadius = this.getAverageRadius(points, center);
        
        let radiusVariance = 0;
        points.forEach(point => {
            const radius = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2));
            radiusVariance += Math.abs(radius - avgRadius);
        });
        
        return radiusVariance / points.length < avgRadius * 0.3;
    }
    
    getCenter(points) {
        const sum = points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y
        }), {x: 0, y: 0});
        
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }
    
    getAverageRadius(points, center) {
        const totalRadius = points.reduce((acc, point) => {
            return acc + Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2));
        }, 0);
        
        return totalRadius / points.length;
    }
    
    drawPerfectCircle() {
        const center = this.getCenter(this.path);
        const radius = this.getAverageRadius(this.path, center);
        
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
}
```

## 🎯 本章小结

### ✅ 掌握技能
- 复杂路径和镂空效果的实现
- 路径碰撞检测系统的构建
- 路径动画的创建和控制
- 路径优化算法的应用

### ✅ 实用工具
- 路径简化和优化函数
- 碰撞检测可视化系统
- 动画框架的基础实现
- 形状识别的基本算法

---

🎯 **下一步**：学习 [颜色和样式](02-colors-styles.md)，探索丰富的视觉效果！ 