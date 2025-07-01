# Canvas游戏开发基础

## 学习目标
- 理解游戏开发的基本架构和设计模式
- 掌握游戏循环和状态管理系统
- 学会实现精灵动画和资源管理
- 构建场景管理和切换机制

## 1. 游戏循环架构

### 1.1 基础游戏引擎

```javascript
// 游戏引擎核心类
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        
        // 游戏状态
        this.currentScene = null;
        this.inputManager = new InputManager(canvas);
    }
    
    // 启动游戏循环
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    // 主游戏循环
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 游戏循环三大步骤
        this.processInput();
        this.update(deltaTime);
        this.render();
        
        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 处理输入
    processInput() {
        this.inputManager.update();
        
        if (this.currentScene && this.currentScene.processInput) {
            this.currentScene.processInput(this.inputManager);
        }
    }
    
    // 更新游戏状态
    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }
    
    // 渲染画面
    render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染当前场景
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(this.ctx);
        }
    }
    
    // 切换场景
    changeScene(newScene) {
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }
        
        this.currentScene = newScene;
        
        if (this.currentScene && this.currentScene.enter) {
            this.currentScene.enter(this);
        }
    }
}
```

### 1.2 输入管理器

```javascript
// 统一输入管理器
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Map();
        this.mouse = {
            x: 0, y: 0,
            buttons: new Map()
        };
        
        this.setupEvents();
    }
    
    setupEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys.set(e.code, { pressed: true, justPressed: !this.keys.has(e.code) });
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.updateMousePosition(e);
            this.mouse.buttons.set(e.button, { pressed: true, justPressed: true });
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.updateMousePosition(e);
            this.mouse.buttons.delete(e.button);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
        });
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }
    
    // 检查按键状态
    isKeyDown(keyCode) {
        return this.keys.has(keyCode);
    }
    
    isKeyJustPressed(keyCode) {
        const key = this.keys.get(keyCode);
        return key && key.justPressed;
    }
    
    isMouseButtonDown(button) {
        return this.mouse.buttons.has(button);
    }
    
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // 更新输入状态（每帧调用）
    update() {
        // 重置单帧状态
        this.keys.forEach((value, key) => {
            value.justPressed = false;
        });
        
        this.mouse.buttons.forEach((value, button) => {
            value.justPressed = false;
        });
    }
}
```

## 2. 游戏对象系统

```javascript
// 游戏对象基类
class GameObject {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.rotation = 0;
        this.alpha = 1;
        
        // 物理属性
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        
        // 状态标志
        this.active = true;
        this.visible = true;
        this.collidable = false;
        
        // 标签系统
        this.tags = new Set();
    }
    
    // 添加标签
    addTag(tag) {
        this.tags.add(tag);
    }
    
    // 检查标签
    hasTag(tag) {
        return this.tags.has(tag);
    }
    
    // 更新对象
    update(deltaTime) {
        const dt = deltaTime / 1000;
        
        // 更新物理
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;
        
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;
    }
    
    // 渲染对象
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        
        // 应用变换
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;
        
        // 自定义渲染
        this.draw(ctx);
        
        ctx.restore();
    }
    
    // 子类重写此方法
    draw(ctx) {
        // 默认绘制一个矩形
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }
    
    // 碰撞检测
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }
    
    intersects(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        
        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    }
}
```

## 3. 精灵动画系统

```javascript
// 精灵动画器
class SpriteAnimator {
    constructor(spriteSheet, animations) {
        this.spriteSheet = spriteSheet;
        this.animations = animations;
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.isPlaying = false;
        this.loop = true;
    }
    
    // 播放动画
    play(animationName, loop = true) {
        if (!this.animations[animationName]) return;
        
        const newAnimation = this.animations[animationName];
        
        if (this.currentAnimation !== newAnimation) {
            this.currentAnimation = newAnimation;
            this.currentFrame = 0;
            this.frameTime = 0;
        }
        
        this.loop = loop;
        this.isPlaying = true;
    }
    
    // 更新动画
    update(deltaTime) {
        if (!this.isPlaying || !this.currentAnimation) return;
        
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.currentAnimation.frameRate) {
            this.frameTime = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= this.currentAnimation.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.currentAnimation.frames.length - 1;
                    this.isPlaying = false;
                }
            }
        }
    }
    
    // 渲染精灵
    render(ctx, gameObject) {
        if (!this.currentAnimation || !this.spriteSheet.loaded) return;
        
        const frame = this.currentAnimation.frames[this.currentFrame];
        
        ctx.drawImage(
            this.spriteSheet.image,
            frame.x, frame.y, frame.width, frame.height,
            -gameObject.width/2, -gameObject.height/2, 
            gameObject.width, gameObject.height
        );
    }
}

// 精灵表资源
class SpriteSheet {
    constructor(imagePath) {
        this.image = new Image();
        this.loaded = false;
        
        this.image.onload = () => {
            this.loaded = true;
        };
        
        this.image.src = imagePath;
    }
}
```

## 4. 场景管理系统

```javascript
// 场景基类
class Scene {
    constructor(name) {
        this.name = name;
        this.gameObjects = [];
        this.gameEngine = null;
        this.isActive = false;
    }
    
    // 进入场景
    enter(gameEngine) {
        this.gameEngine = gameEngine;
        this.isActive = true;
        this.initialize();
    }
    
    // 退出场景
    exit() {
        this.isActive = false;
        this.cleanup();
    }
    
    // 初始化场景（子类重写）
    initialize() {
        // 场景初始化逻辑
    }
    
    // 清理场景
    cleanup() {
        this.gameObjects = [];
    }
    
    // 添加游戏对象
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
        gameObject.scene = this;
    }
    
    // 移除游戏对象
    removeGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
        gameObject.scene = null;
    }
    
    // 按标签查找对象
    findGameObjectsByTag(tag) {
        return this.gameObjects.filter(obj => obj.hasTag(tag));
    }
    
    // 处理输入
    processInput(inputManager) {
        // 场景特定的输入处理
    }
    
    // 更新场景
    update(deltaTime) {
        // 更新所有游戏对象
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            
            if (obj.active) {
                obj.update(deltaTime);
            } else {
                this.removeGameObject(obj);
            }
        }
        
        // 碰撞检测
        this.handleCollisions();
    }
    
    // 碰撞检测
    handleCollisions() {
        const collidableObjects = this.gameObjects.filter(obj => obj.collidable);
        
        for (let i = 0; i < collidableObjects.length; i++) {
            for (let j = i + 1; j < collidableObjects.length; j++) {
                const obj1 = collidableObjects[i];
                const obj2 = collidableObjects[j];
                
                if (obj1.intersects(obj2)) {
                    this.onCollision(obj1, obj2);
                }
            }
        }
    }
    
    // 碰撞回调
    onCollision(obj1, obj2) {
        // 子类重写处理具体碰撞逻辑
        if (obj1.onCollision) obj1.onCollision(obj2);
        if (obj2.onCollision) obj2.onCollision(obj1);
    }
    
    // 渲染场景
    render(ctx) {
        for (const obj of this.gameObjects) {
            if (obj.visible) {
                obj.render(ctx);
            }
        }
    }
    
    // 获取对象数量
    getObjectCount() {
        return this.gameObjects.length;
    }
}
```

## 5. 游戏示例：简单的弹球游戏

```javascript
// 弹球游戏场景
class PongScene extends Scene {
    constructor() {
        super('Pong');
        this.paddle1 = null;
        this.paddle2 = null;
        this.ball = null;
        this.score1 = 0;
        this.score2 = 0;
    }
    
    initialize() {
        const canvas = this.gameEngine.canvas;
        
        // 创建挡板
        this.paddle1 = new Paddle(20, canvas.height / 2 - 50, true);
        this.paddle2 = new Paddle(canvas.width - 40, canvas.height / 2 - 50, false);
        
        // 创建球
        this.ball = new Ball(canvas.width / 2, canvas.height / 2);
        
        this.addGameObject(this.paddle1);
        this.addGameObject(this.paddle2);
        this.addGameObject(this.ball);
    }
    
    processInput(inputManager) {
        const speed = 300;
        
        // 玩家1控制
        if (inputManager.isKeyDown('KeyW')) {
            this.paddle1.velocity.y = -speed;
        } else if (inputManager.isKeyDown('KeyS')) {
            this.paddle1.velocity.y = speed;
        } else {
            this.paddle1.velocity.y = 0;
        }
        
        // 玩家2控制
        if (inputManager.isKeyDown('ArrowUp')) {
            this.paddle2.velocity.y = -speed;
        } else if (inputManager.isKeyDown('ArrowDown')) {
            this.paddle2.velocity.y = speed;
        } else {
            this.paddle2.velocity.y = 0;
        }
    }
    
    onCollision(obj1, obj2) {
        if ((obj1.hasTag('ball') && obj2.hasTag('paddle')) ||
            (obj1.hasTag('paddle') && obj2.hasTag('ball'))) {
            
            const ball = obj1.hasTag('ball') ? obj1 : obj2;
            ball.velocity.x *= -1;
            
            // 添加一些随机性
            ball.velocity.y += (Math.random() - 0.5) * 100;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // 检查得分
        if (this.ball.x < 0) {
            this.score2++;
            this.resetBall();
        } else if (this.ball.x > this.gameEngine.canvas.width) {
            this.score1++;
            this.resetBall();
        }
    }
    
    resetBall() {
        const canvas = this.gameEngine.canvas;
        this.ball.x = canvas.width / 2;
        this.ball.y = canvas.height / 2;
        this.ball.velocity.x = Math.random() > 0.5 ? 200 : -200;
        this.ball.velocity.y = (Math.random() - 0.5) * 200;
    }
    
    render(ctx) {
        super.render(ctx);
        
        // 绘制中线
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(this.gameEngine.canvas.width / 2, 0);
        ctx.lineTo(this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 绘制分数
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.score1.toString(), this.gameEngine.canvas.width / 4, 60);
        ctx.fillText(this.score2.toString(), this.gameEngine.canvas.width * 3 / 4, 60);
    }
}

// 挡板类
class Paddle extends GameObject {
    constructor(x, y, isPlayer1) {
        super(x, y);
        this.width = 20;
        this.height = 100;
        this.isPlayer1 = isPlayer1;
        this.addTag('paddle');
        this.collidable = true;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // 限制在屏幕边界内
        const canvas = this.scene.gameEngine.canvas;
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }
}

// 球类
class Ball extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 20;
        this.height = 20;
        this.velocity.x = 200;
        this.velocity.y = 100;
        this.addTag('ball');
        this.collidable = true;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // 上下边界反弹
        const canvas = this.scene.gameEngine.canvas;
        if (this.y <= 0 || this.y >= canvas.height - this.height) {
            this.velocity.y *= -1;
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 启动游戏
const gameEngine = new GameEngine(canvas);
const pongScene = new PongScene();
gameEngine.changeScene(pongScene);
gameEngine.start();
```

## 6. 实践练习

### 练习1：贪吃蛇游戏
实现经典的贪吃蛇游戏，包含食物生成、身体增长和碰撞检测。

### 练习2：太空射击游戏
创建一个太空射击游戏，包含敌人生成、子弹系统和分数统计。

### 练习3：平台跳跃游戏
开发一个横版平台游戏，包含重力、跳跃和关卡设计。

## 总结

本章介绍了Canvas游戏开发的核心技术：

1. **游戏架构**：构建了完整的游戏引擎和循环系统
2. **对象系统**：实现了灵活的游戏对象管理
3. **动画系统**：掌握了精灵动画的基本实现
4. **场景管理**：学会了场景切换和状态管理
5. **实际应用**：通过弹球游戏掌握了开发流程

这些技术为创建复杂的游戏和交互应用提供了坚实的基础。 