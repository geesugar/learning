# Canvas物理动画

## 学习目标
- 理解物理动画的基本概念和数学原理
- 掌握重力、摩擦力、弹性等物理效果的模拟
- 学会实现精确的碰撞检测和响应
- 构建复杂的粒子系统

## 1. 物理动画基础

### 1.1 基本物理概念

```javascript
// 基础物理对象
class PhysicsObject {
    constructor(x, y, mass = 1) {
        // 位置
        this.position = { x, y };
        this.previousPosition = { x, y };
        
        // 速度
        this.velocity = { x: 0, y: 0 };
        
        // 加速度
        this.acceleration = { x: 0, y: 0 };
        
        // 物理属性
        this.mass = mass;
        this.drag = 0.98; // 阻力系数
        this.bounce = 0.8; // 弹性系数
    }
    
    // 应用力
    applyForce(forceX, forceY) {
        // F = ma，所以 a = F/m
        this.acceleration.x += forceX / this.mass;
        this.acceleration.y += forceY / this.mass;
    }
    
    // 更新物理状态
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 更新速度：v = v0 + a*t
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;
        
        // 应用阻力
        this.velocity.x *= this.drag;
        this.velocity.y *= this.drag;
        
        // 更新位置：s = s0 + v*t
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
        
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        
        // 重置加速度
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }
}
```

### 1.2 重力系统

```javascript
// 重力系统
class GravitySystem {
    constructor(gravity = 9.8) {
        this.gravity = gravity * 100; // 放大以适应像素单位
        this.objects = [];
    }
    
    addObject(obj) {
        this.objects.push(obj);
    }
    
    update(deltaTime) {
        this.objects.forEach(obj => {
            // 应用重力
            obj.applyForce(0, this.gravity * obj.mass);
            
            // 更新物理状态
            obj.update(deltaTime);
        });
    }
    
    // 万有引力模拟
    applyGravitationalForce(obj1, obj2, G = 100) {
        const dx = obj2.position.x - obj1.position.x;
        const dy = obj2.position.y - obj1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // F = G * m1 * m2 / r²
            const force = (G * obj1.mass * obj2.mass) / (distance * distance);
            
            // 单位向量
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // 应用引力
            obj1.applyForce(force * unitX, force * unitY);
            obj2.applyForce(-force * unitX, -force * unitY);
        }
    }
}
```

## 2. 碰撞检测系统

```javascript
// 碰撞检测工具类
class CollisionDetection {
    // 圆形碰撞检测
    static circleCircle(circle1, circle2) {
        const dx = circle2.position.x - circle1.position.x;
        const dy = circle2.position.y - circle1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const totalRadius = circle1.radius + circle2.radius;
        
        if (distance < totalRadius) {
            return {
                collided: true,
                distance: distance,
                overlap: totalRadius - distance,
                normal: { x: dx / distance, y: dy / distance }
            };
        }
        
        return { collided: false };
    }
    
    // 矩形碰撞检测 (AABB)
    static rectRect(rect1, rect2) {
        return rect1.position.x < rect2.position.x + rect2.width &&
               rect1.position.x + rect1.width > rect2.position.x &&
               rect1.position.y < rect2.position.y + rect2.height &&
               rect1.position.y + rect1.height > rect2.position.y;
    }
}

// 碰撞响应处理
class CollisionResponse {
    // 弹性碰撞响应
    static elasticCollision(obj1, obj2, collisionInfo) {
        if (!collisionInfo.collided) return;
        
        // 分离物体
        const separationX = collisionInfo.normal.x * collisionInfo.overlap * 0.5;
        const separationY = collisionInfo.normal.y * collisionInfo.overlap * 0.5;
        
        obj1.position.x -= separationX;
        obj1.position.y -= separationY;
        obj2.position.x += separationX;
        obj2.position.y += separationY;
        
        // 计算相对速度
        const relativeVelocityX = obj2.velocity.x - obj1.velocity.x;
        const relativeVelocityY = obj2.velocity.y - obj1.velocity.y;
        
        // 计算碰撞冲量
        const velocityAlongNormal = relativeVelocityX * collisionInfo.normal.x + 
                                  relativeVelocityY * collisionInfo.normal.y;
        
        // 如果物体正在分离，不需要处理
        if (velocityAlongNormal > 0) return;
        
        // 计算弹性系数
        const restitution = Math.min(obj1.bounce, obj2.bounce);
        
        // 计算冲量标量
        let impulseScalar = -(1 + restitution) * velocityAlongNormal;
        impulseScalar /= (1 / obj1.mass + 1 / obj2.mass);
        
        // 应用冲量
        const impulseX = impulseScalar * collisionInfo.normal.x;
        const impulseY = impulseScalar * collisionInfo.normal.y;
        
        obj1.velocity.x -= impulseX / obj1.mass;
        obj1.velocity.y -= impulseY / obj1.mass;
        obj2.velocity.x += impulseX / obj2.mass;
        obj2.velocity.y += impulseY / obj2.mass;
    }
    
    // 边界碰撞处理
    static boundaryCollision(obj, bounds) {
        // 左边界
        if (obj.position.x - obj.radius < bounds.left) {
            obj.position.x = bounds.left + obj.radius;
            obj.velocity.x *= -obj.bounce;
        }
        
        // 右边界
        if (obj.position.x + obj.radius > bounds.right) {
            obj.position.x = bounds.right - obj.radius;
            obj.velocity.x *= -obj.bounce;
        }
        
        // 上边界
        if (obj.position.y - obj.radius < bounds.top) {
            obj.position.y = bounds.top + obj.radius;
            obj.velocity.y *= -obj.bounce;
        }
        
        // 下边界
        if (obj.position.y + obj.radius > bounds.bottom) {
            obj.position.y = bounds.bottom - obj.radius;
            obj.velocity.y *= -obj.bounce;
        }
    }
}
```

## 3. 弹簧系统

```javascript
// 弹簧连接
class Spring {
    constructor(obj1, obj2, restLength, stiffness = 0.1, damping = 0.99) {
        this.obj1 = obj1;
        this.obj2 = obj2;
        this.restLength = restLength;
        this.stiffness = stiffness;
        this.damping = damping;
    }
    
    update() {
        // 计算两点间的距离和方向
        const dx = this.obj2.position.x - this.obj1.position.x;
        const dy = this.obj2.position.y - this.obj1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 单位方向向量
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // 弹簧力 = 弹性系数 * 伸缩量
            const springForce = (distance - this.restLength) * this.stiffness;
            
            // 应用弹簧力
            const forceX = springForce * unitX;
            const forceY = springForce * unitY;
            
            this.obj1.applyForce(forceX, forceY);
            this.obj2.applyForce(-forceX, -forceY);
        }
        
        // 应用阻尼
        this.obj1.velocity.x *= this.damping;
        this.obj1.velocity.y *= this.damping;
        this.obj2.velocity.x *= this.damping;
        this.obj2.velocity.y *= this.damping;
    }
    
    draw(ctx) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.obj1.position.x, this.obj1.position.y);
        ctx.lineTo(this.obj2.position.x, this.obj2.position.y);
        ctx.stroke();
    }
}
```

## 4. 粒子系统

```javascript
// 粒子类
class Particle extends PhysicsObject {
    constructor(x, y, options = {}) {
        super(x, y, options.mass || 1);
        
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.size = options.size || 5;
        this.color = options.color || '#ffffff';
        this.decay = options.decay || 0.01;
        this.alpha = 1;
        
        // 随机初始速度
        if (options.velocity) {
            this.velocity.x = options.velocity.x;
            this.velocity.y = options.velocity.y;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新生命值
        this.life -= this.decay;
        this.alpha = this.life / this.maxLife;
        
        // 根据生命值调整大小
        this.size = (this.size * this.life) / this.maxLife;
    }
    
    isDead() {
        return this.life <= 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 粒子发射器
class ParticleEmitter {
    constructor(x, y, options = {}) {
        this.position = { x, y };
        this.particles = [];
        this.maxParticles = options.maxParticles || 100;
        this.emissionRate = options.emissionRate || 5; // 每秒发射数量
        this.emissionTimer = 0;
        
        // 发射参数
        this.particleOptions = {
            life: options.life || 2,
            size: options.size || 3,
            color: options.color || '#ffffff',
            speed: options.speed || 50,
            angle: options.angle || 0,
            spread: options.spread || Math.PI * 2, // 发射角度范围
            gravity: options.gravity || 0
        };
        
        this.isActive = true;
    }
    
    emit() {
        if (!this.isActive || this.particles.length >= this.maxParticles) return;
        
        // 随机发射角度
        const angle = this.particleOptions.angle + 
                     (Math.random() - 0.5) * this.particleOptions.spread;
        
        // 随机速度
        const speed = this.particleOptions.speed * (0.5 + Math.random() * 0.5);
        
        const particle = new Particle(this.position.x, this.position.y, {
            mass: 0.5 + Math.random() * 0.5,
            life: this.particleOptions.life * (0.8 + Math.random() * 0.4),
            size: this.particleOptions.size * (0.7 + Math.random() * 0.6),
            color: this.particleOptions.color,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            }
        });
        
        this.particles.push(particle);
    }
    
    update(deltaTime) {
        // 控制发射频率
        this.emissionTimer += deltaTime / 1000;
        const emissionInterval = 1 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 应用重力
            if (this.particleOptions.gravity) {
                particle.applyForce(0, this.particleOptions.gravity * particle.mass);
            }
            
            particle.update(deltaTime);
            
            // 移除死亡的粒子
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        this.particles.forEach(particle => {
            particle.draw(ctx);
        });
    }
    
    // 设置发射器位置
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
}
```

## 5. 综合示例：多球碰撞系统

```javascript
// 多球碰撞系统
class BallCollisionSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 物理系统
        this.gravity = new GravitySystem(9.8);
        this.balls = [];
        
        // 边界
        this.bounds = {
            left: 0,
            top: 0,
            right: canvas.width,
            bottom: canvas.height
        };
        
        this.setupMouseEvents();
        this.createBalls(5);
    }
    
    setupMouseEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createBall(x, y);
        });
    }
    
    createBall(x, y) {
        const ball = new PhysicsObject(x, y, 0.5 + Math.random() * 1.5);
        ball.radius = 15 + Math.random() * 25;
        ball.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        // 随机初始速度
        ball.velocity.x = (Math.random() - 0.5) * 200;
        ball.velocity.y = (Math.random() - 0.5) * 200;
        
        this.balls.push(ball);
        this.gravity.addObject(ball);
    }
    
    createBalls(count) {
        for (let i = 0; i < count; i++) {
            const x = 50 + Math.random() * (this.canvas.width - 100);
            const y = 50 + Math.random() * (this.canvas.height - 100);
            this.createBall(x, y);
        }
    }
    
    update(deltaTime) {
        // 更新重力系统
        this.gravity.update(deltaTime);
        
        // 碰撞检测
        for (let i = 0; i < this.balls.length; i++) {
            const ball1 = this.balls[i];
            
            // 边界碰撞
            CollisionResponse.boundaryCollision(ball1, this.bounds);
            
            // 球与球碰撞
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball2 = this.balls[j];
                const collision = CollisionDetection.circleCircle(ball1, ball2);
                
                if (collision.collided) {
                    CollisionResponse.elasticCollision(ball1, ball2, collision);
                }
            }
        }
    }
    
    draw() {
        // 清除画布
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制小球
        this.balls.forEach(ball => {
            // 绘制阴影
            this.ctx.beginPath();
            this.ctx.arc(ball.position.x + 2, ball.position.y + 2, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fill();
            
            // 绘制球体
            this.ctx.beginPath();
            this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
            
            // 创建径向渐变
            const gradient = this.ctx.createRadialGradient(
                ball.position.x - ball.radius * 0.3, 
                ball.position.y - ball.radius * 0.3, 
                0,
                ball.position.x, 
                ball.position.y, 
                ball.radius
            );
            gradient.addColorStop(0, ball.color);
            gradient.addColorStop(1, this.darkenColor(ball.color));
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // 绘制高光
            this.ctx.beginPath();
            this.ctx.arc(
                ball.position.x - ball.radius * 0.4, 
                ball.position.y - ball.radius * 0.4, 
                ball.radius * 0.15, 
                0, Math.PI * 2
            );
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        });
    }
    
    darkenColor(color) {
        // 简单的颜色变暗函数
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        
        const r = Math.max(0, data[0] - 50);
        const g = Math.max(0, data[1] - 50);
        const b = Math.max(0, data[2] - 50);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    animate() {
        const animate = (currentTime) => {
            const deltaTime = currentTime - this.lastTime || 0;
            this.lastTime = currentTime;
            
            this.update(Math.min(deltaTime, 16)); // 限制最大时间步长
            this.draw();
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    start() {
        this.animate();
    }
}

// 启动碰撞系统
const collisionSystem = new BallCollisionSystem(canvas);
collisionSystem.start();
```

## 6. 实践练习

### 练习1：弹珠台游戏
创建一个弹珠台游戏，包含重力、弹簧、碰撞等物理效果。

### 练习2：布料模拟
使用弹簧系统创建一个简单的布料模拟效果。

### 练习3：粒子烟花
实现一个粒子烟花系统，点击屏幕发射烟花。

## 总结

本章深入学习了物理动画的核心技术：

1. **物理基础**：掌握了位置、速度、加速度等基本概念
2. **力学模拟**：实现了重力、弹簧、阻力等物理效果
3. **碰撞系统**：学会了检测和响应各种碰撞
4. **粒子系统**：构建了完整的粒子发射和管理系统

这些技术为创建真实感的动画效果和复杂的物理交互提供了强大的基础。 