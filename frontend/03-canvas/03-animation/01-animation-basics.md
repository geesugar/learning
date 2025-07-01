# Canvas动画基础

## 学习目标
- 理解动画的基本原理和核心概念
- 掌握requestAnimationFrame的使用方法
- 学会时间管理和帧率控制技术
- 实现各种缓动函数和动画效果
- 掌握动画性能优化的基本技巧

## 1. 动画基础原理

### 1.1 什么是动画

动画的本质是通过快速连续显示略有不同的图像来创造运动的错觉。在Canvas中，我们通过以下步骤实现动画：

1. **清除画布** - 擦除上一帧的内容
2. **更新状态** - 计算物体的新位置和属性
3. **重新绘制** - 在新位置绘制物体
4. **循环执行** - 重复上述过程

```javascript
// 基本动画循环结构
function animate() {
    // 1. 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. 更新状态
    updateObjects();
    
    // 3. 重新绘制
    drawObjects();
    
    // 4. 请求下一帧
    requestAnimationFrame(animate);
}

// 启动动画
animate();
```

### 1.2 帧率与流畅度

帧率（FPS - Frames Per Second）决定了动画的流畅程度：

- **60 FPS**：最理想的帧率，动画非常流畅
- **30 FPS**：基本流畅，适合大多数应用
- **24 FPS**：电影标准，可接受的最低帧率
- **低于 20 FPS**：明显卡顿，用户体验差

```javascript
// 帧率监控器
class FPSMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    getFPS() {
        return this.fps;
    }
}
```

## 2. RequestAnimationFrame深入应用

### 2.1 为什么使用requestAnimationFrame

相比setTimeout和setInterval，requestAnimationFrame有以下优势：

1. **与屏幕刷新率同步**：通常是60Hz，确保流畅动画
2. **浏览器优化**：在后台标签页时自动暂停
3. **更好的性能**：避免不必要的重绘和回流

```javascript
// 可控制的动画循环
class AnimationLoop {
    constructor(callback) {
        this.callback = callback;
        this.animationId = null;
        this.isRunning = false;
        this.lastTime = 0;
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.loop();
        }
    }
    
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            cancelAnimationFrame(this.animationId);
        }
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 调用用户定义的动画函数
        this.callback(deltaTime, currentTime);
        
        this.animationId = requestAnimationFrame(() => this.loop());
    }
}
```

## 3. 时间管理和基于时间的动画

```javascript
// 基于时间的移动动画
class TimeBasedAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 物体属性
        this.ball = {
            x: 50,
            y: 50,
            radius: 20,
            speed: 200, // 像素/秒
            direction: { x: 1, y: 0.5 }
        };
        
        this.lastTime = 0;
    }
    
    update(deltaTime) {
        // 将deltaTime从毫秒转换为秒
        const deltaSeconds = deltaTime / 1000;
        
        // 基于时间更新位置
        this.ball.x += this.ball.direction.x * this.ball.speed * deltaSeconds;
        this.ball.y += this.ball.direction.y * this.ball.speed * deltaSeconds;
        
        // 边界碰撞检测
        if (this.ball.x + this.ball.radius > this.canvas.width || 
            this.ball.x - this.ball.radius < 0) {
            this.ball.direction.x *= -1;
        }
        
        if (this.ball.y + this.ball.radius > this.canvas.height || 
            this.ball.y - this.ball.radius < 0) {
            this.ball.direction.y *= -1;
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#007bff';
        this.ctx.fill();
    }
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.animate(time));
    }
    
    start() {
        requestAnimationFrame((time) => {
            this.lastTime = time;
            this.animate(time);
        });
    }
}
```

## 4. 缓动函数实现

```javascript
// 缓动函数库
const Easing = {
    // 线性缓动（匀速）
    linear: (t) => t,
    
    // 二次缓动
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // 三次缓动
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    // 正弦缓动
    easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    
    // 弹性缓动
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
};

// 通用动画补间类
class Tween {
    constructor(target, duration, properties, easing = Easing.linear) {
        this.target = target;
        this.duration = duration;
        this.easing = easing;
        this.startTime = null;
        this.isComplete = false;
        
        // 记录初始值和目标值
        this.startValues = {};
        this.endValues = properties;
        
        // 初始化起始值
        for (const prop in properties) {
            this.startValues[prop] = target[prop] || 0;
        }
        
        // 回调函数
        this.onUpdate = null;
        this.onComplete = null;
    }
    
    start(currentTime) {
        this.startTime = currentTime;
        this.isComplete = false;
        return this;
    }
    
    update(currentTime) {
        if (this.isComplete || this.startTime === null) return;
        
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.easing(progress);
        
        // 更新目标对象的属性
        for (const prop in this.endValues) {
            const start = this.startValues[prop];
            const end = this.endValues[prop];
            this.target[prop] = start + (end - start) * easedProgress;
        }
        
        // 调用更新回调
        if (this.onUpdate) {
            this.onUpdate(this.target, progress);
        }
        
        // 检查是否完成
        if (progress >= 1) {
            this.isComplete = true;
            if (this.onComplete) {
                this.onComplete(this.target);
            }
        }
    }
    
    // 链式调用方法
    then(callback) {
        this.onComplete = callback;
        return this;
    }
    
    onChange(callback) {
        this.onUpdate = callback;
        return this;
    }
}
```

## 5. 动画管理器

```javascript
// 动画管理器
class TweenManager {
    constructor() {
        this.tweens = [];
    }
    
    add(tween) {
        this.tweens.push(tween);
        return tween;
    }
    
    remove(tween) {
        const index = this.tweens.indexOf(tween);
        if (index > -1) {
            this.tweens.splice(index, 1);
        }
    }
    
    update(currentTime) {
        // 更新所有补间动画
        for (let i = this.tweens.length - 1; i >= 0; i--) {
            const tween = this.tweens[i];
            tween.update(currentTime);
            
            // 移除已完成的动画
            if (tween.isComplete) {
                this.tweens.splice(i, 1);
            }
        }
    }
    
    clear() {
        this.tweens = [];
    }
}

// 使用示例
const tweenManager = new TweenManager();

// 创建一个圆形对象
const circle = {
    x: 50,
    y: 50,
    radius: 20,
    color: 'blue'
};

// 创建移动动画
const moveTween = new Tween(circle, 2000, { x: 300, y: 200 }, Easing.easeOutBounce)
    .onChange((obj, progress) => {
        console.log(`移动进度: ${(progress * 100).toFixed(1)}%`);
    })
    .then(() => {
        console.log('移动完成！');
        
        // 动画完成后开始缩放动画
        const scaleTween = new Tween(circle, 1000, { radius: 50 }, Easing.easeInOutElastic);
        tweenManager.add(scaleTween);
        scaleTween.start(performance.now());
    });

tweenManager.add(moveTween);
moveTween.start(performance.now());
```

## 6. 综合示例：弹跳球动画

```javascript
// 弹跳球完整示例
class BouncingBall {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.ball = {
            x: 100,
            y: 50,
            vx: 150, // 水平速度 (像素/秒)
            vy: 0,   // 垂直速度
            radius: 25,
            color: '#e74c3c',
            gravity: 500,    // 重力加速度
            bounce: 0.85,    // 弹性系数
            friction: 0.98   // 摩擦系数
        };
        
        this.trail = []; // 运动轨迹
        this.maxTrailLength = 20;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 应用重力
        this.ball.vy += this.ball.gravity * dt;
        
        // 更新位置
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;
        
        // 添加到轨迹
        this.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // 边界碰撞检测和处理
        this.handleCollisions();
    }
    
    handleCollisions() {
        const { ball, canvas } = this;
        
        // 左右边界
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx *= -ball.bounce;
        } else if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx *= -ball.bounce;
        }
        
        // 上下边界
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= -ball.bounce;
        } else if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.vy *= -ball.bounce;
            ball.vx *= ball.friction; // 地面摩擦
        }
    }
    
    draw() {
        const { ctx, ball, trail } = this;
        
        // 清除画布
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制轨迹
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 1; i < trail.length; i++) {
            const alpha = i / trail.length;
            ctx.globalAlpha = alpha * 0.5;
            
            if (i === 1) {
                ctx.moveTo(trail[i].x, trail[i].y);
            } else {
                ctx.lineTo(trail[i].x, trail[i].y);
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 绘制球
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        
        // 添加渐变效果
        const gradient = ctx.createRadialGradient(
            ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
            ball.x, ball.y, ball.radius
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#e74c3c');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加高光
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.4, ball.y - ball.radius * 0.4, ball.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }
    
    animate() {
        const animate = (currentTime) => {
            const deltaTime = currentTime - this.lastTime || 0;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.draw();
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    start() {
        this.animate();
    }
}

// 使用弹跳球
const bouncingBall = new BouncingBall(canvas);
bouncingBall.start();
```

## 7. 实践练习

### 练习1：时钟动画
创建一个模拟时钟，包含时针、分针、秒针的动画效果。

### 练习2：缓动函数对比
创建一个演示页面，对比不同缓动函数的视觉效果。

### 练习3：弹性菜单
实现一个具有弹性动画效果的导航菜单。

## 总结

本章介绍了Canvas动画的基础知识：

1. **动画原理**：理解了动画循环的基本结构和帧率概念
2. **时间管理**：掌握了基于时间的动画和requestAnimationFrame的使用
3. **缓动函数**：学会了各种缓动效果的实现和应用
4. **动画管理**：了解了如何组织和管理复杂的动画系统

这些技术为后续的物理动画、交互控制和游戏开发奠定了坚实的基础。 