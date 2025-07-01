# Canvas性能优化

## 学习目标
- 掌握Canvas渲染性能优化技术
- 学会内存管理和垃圾回收优化
- 理解离屏Canvas和图层优化策略
- 实现性能监控和分析工具

## 1. 渲染性能优化

### 1.1 脏矩形技术

```javascript
// 脏矩形管理器
class DirtyRectManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dirtyRects = [];
        this.fullRedraw = false;
    }
    
    // 添加脏区域
    addDirtyRect(x, y, width, height) {
        const newRect = { x, y, width, height };
        
        // 检查是否与现有矩形重叠
        for (let i = 0; i < this.dirtyRects.length; i++) {
            const rect = this.dirtyRects[i];
            
            if (this.intersects(newRect, rect)) {
                // 合并矩形
                this.dirtyRects[i] = this.merge(newRect, rect);
                return;
            }
        }
        
        this.dirtyRects.push(newRect);
    }
    
    // 检查矩形是否相交
    intersects(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // 合并矩形
    merge(rect1, rect2) {
        const left = Math.min(rect1.x, rect2.x);
        const top = Math.min(rect1.y, rect2.y);
        const right = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
        const bottom = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);
        
        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
        };
    }
    
    // 清除脏区域
    clearDirtyRects() {
        if (this.fullRedraw) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.fullRedraw = false;
        } else {
            this.dirtyRects.forEach(rect => {
                this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
            });
        }
        
        this.dirtyRects = [];
    }
    
    // 标记全屏重绘
    markFullRedraw() {
        this.fullRedraw = true;
        this.dirtyRects = [];
    }
}
```

### 1.2 图层分离优化

```javascript
// 图层管理器
class LayerManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.layers = new Map();
        this.renderOrder = [];
    }
    
    // 创建图层
    createLayer(name, zIndex = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        
        const layer = {
            name: name,
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            zIndex: zIndex,
            visible: true,
            dirty: false,
            alpha: 1.0
        };
        
        this.layers.set(name, layer);
        this.updateRenderOrder();
        
        return layer;
    }
    
    // 更新渲染顺序
    updateRenderOrder() {
        this.renderOrder = Array.from(this.layers.values())
            .sort((a, b) => a.zIndex - b.zIndex);
    }
    
    // 获取图层
    getLayer(name) {
        return this.layers.get(name);
    }
    
    // 标记图层为脏
    markLayerDirty(name) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.dirty = true;
        }
    }
    
    // 清除图层
    clearLayer(name) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.ctx.clearRect(0, 0, this.width, this.height);
            layer.dirty = true;
        }
    }
    
    // 合成所有图层到目标Canvas
    composite(targetCtx) {
        targetCtx.clearRect(0, 0, this.width, this.height);
        
        this.renderOrder.forEach(layer => {
            if (layer.visible && layer.alpha > 0) {
                targetCtx.save();
                targetCtx.globalAlpha = layer.alpha;
                targetCtx.drawImage(layer.canvas, 0, 0);
                targetCtx.restore();
            }
        });
    }
}
```

### 1.3 批量绘制优化

```javascript
// 批量绘制管理器
class BatchRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.batches = new Map();
    }
    
    // 批量绘制矩形
    batchRects(rects) {
        if (rects.length === 0) return;
        
        // 按颜色分组
        const colorGroups = new Map();
        
        rects.forEach(rect => {
            const color = rect.fillStyle || '#000000';
            if (!colorGroups.has(color)) {
                colorGroups.set(color, []);
            }
            colorGroups.get(color).push(rect);
        });
        
        // 批量绘制每种颜色
        colorGroups.forEach((rects, color) => {
            this.ctx.fillStyle = color;
            rects.forEach(rect => {
                this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            });
        });
    }
    
    // 批量绘制圆形
    batchCircles(circles) {
        if (circles.length === 0) return;
        
        const colorGroups = new Map();
        
        circles.forEach(circle => {
            const color = circle.fillStyle || '#000000';
            if (!colorGroups.has(color)) {
                colorGroups.set(color, []);
            }
            colorGroups.get(color).push(circle);
        });
        
        colorGroups.forEach((circles, color) => {
            this.ctx.fillStyle = color;
            circles.forEach(circle => {
                this.ctx.beginPath();
                this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }
    
    // 执行所有批次
    flush() {
        this.batches.forEach((commands, batchKey) => {
            switch (batchKey) {
                case 'rects':
                    this.batchRects(commands);
                    break;
                case 'circles':
                    this.batchCircles(commands);
                    break;
            }
        });
        
        this.clear();
    }
    
    // 清空批次
    clear() {
        this.batches.clear();
    }
}
```

## 2. 内存管理优化

### 2.1 对象池模式

```javascript
// 通用对象池
class ObjectPool {
    constructor(createFn, resetFn, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
        this.pool = [];
        this.used = new Set();
        
        // 预填充对象池
        this.preFill(Math.min(10, maxSize));
    }
    
    // 预填充对象池
    preFill(count) {
        for (let i = 0; i < count; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    // 获取对象
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        this.used.add(obj);
        return obj;
    }
    
    // 释放对象
    release(obj) {
        if (!this.used.has(obj)) return;
        
        this.used.delete(obj);
        this.resetFn(obj);
        
        // 防止对象池过大
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
        }
    }
    
    // 批量释放
    releaseAll() {
        this.used.forEach(obj => {
            this.resetFn(obj);
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        });
        this.used.clear();
    }
    
    // 获取统计信息
    getStats() {
        return {
            poolSize: this.pool.length,
            usedCount: this.used.size,
            totalCount: this.pool.length + this.used.size
        };
    }
}

// 粒子对象池示例
class ParticlePool {
    constructor() {
        this.pool = new ObjectPool(
            // 创建函数
            () => ({
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 1, maxLife: 1,
                size: 1, color: '#ffffff',
                alpha: 1
            }),
            
            // 重置函数
            (particle) => {
                particle.x = 0;
                particle.y = 0;
                particle.vx = 0;
                particle.vy = 0;
                particle.life = 1;
                particle.maxLife = 1;
                particle.size = 1;
                particle.color = '#ffffff';
                particle.alpha = 1;
            },
            
            200 // 最大对象数
        );
    }
    
    acquire() {
        return this.pool.acquire();
    }
    
    release(particle) {
        this.pool.release(particle);
    }
    
    getStats() {
        return this.pool.getStats();
    }
}
```

## 3. 离屏Canvas优化

```javascript
// 离屏Canvas管理器
class OffscreenCanvasManager {
    constructor() {
        this.canvases = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }
    
    // 创建离屏Canvas
    createOffscreenCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return {
            canvas: canvas,
            ctx: canvas.getContext('2d')
        };
    }
    
    // 预渲染复杂图形
    preRenderShape(id, width, height, renderFn) {
        const offscreen = this.createOffscreenCanvas(width, height);
        renderFn(offscreen.ctx);
        
        this.canvases.set(id, offscreen.canvas);
        return offscreen.canvas;
    }
    
    // 绘制预渲染的形状
    drawPreRendered(ctx, id, x, y, scale = 1) {
        const canvas = this.canvases.get(id);
        
        if (canvas) {
            this.cacheHits++;
            
            if (scale !== 1) {
                const width = canvas.width * scale;
                const height = canvas.height * scale;
                ctx.drawImage(canvas, x, y, width, height);
            } else {
                ctx.drawImage(canvas, x, y);
            }
        } else {
            this.cacheMisses++;
            console.warn(`Pre-rendered shape "${id}" not found`);
        }
    }
    
    // 预渲染文本
    preRenderText(id, text, font, color) {
        // 测量文本尺寸
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = font;
        const metrics = tempCtx.measureText(text);
        
        const width = Math.ceil(metrics.width);
        const height = 20; // 简化的文本高度
        
        // 预渲染文本
        const offscreen = this.createOffscreenCanvas(width + 4, height + 4);
        offscreen.ctx.font = font;
        offscreen.ctx.fillStyle = color;
        offscreen.ctx.textBaseline = 'top';
        offscreen.ctx.fillText(text, 2, 2);
        
        this.canvases.set(id, offscreen.canvas);
        return offscreen.canvas;
    }
    
    // 清除缓存
    clearCache() {
        this.canvases.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }
    
    // 获取缓存统计
    getCacheStats() {
        const total = this.cacheHits + this.cacheMisses;
        return {
            cacheSize: this.canvases.size,
            hits: this.cacheHits,
            misses: this.cacheMisses,
            hitRate: total > 0 ? (this.cacheHits / total * 100).toFixed(2) + '%' : '0%'
        };
    }
}
```

## 4. 性能监控工具

```javascript
// 性能分析器
class PerformanceProfiler {
    constructor() {
        this.timers = new Map();
        this.frameData = [];
        this.maxFrameData = 120; // 保存2秒的帧数据
        this.lastFrameTime = 0;
    }
    
    // 开始计时
    startTimer(name) {
        this.timers.set(name, performance.now());
    }
    
    // 结束计时
    endTimer(name) {
        const startTime = this.timers.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.timers.set(name + '_result', duration);
        }
    }
    
    // 获取计时结果
    getTimerResult(name) {
        return this.timers.get(name + '_result') || 0;
    }
    
    // 记录帧性能
    recordFrame() {
        const currentTime = performance.now();
        
        if (this.lastFrameTime > 0) {
            const frameTime = currentTime - this.lastFrameTime;
            const fps = 1000 / frameTime;
            
            const frameData = {
                timestamp: currentTime,
                frameTime: frameTime,
                fps: fps,
                renderTime: this.getTimerResult('render')
            };
            
            this.frameData.push(frameData);
            
            if (this.frameData.length > this.maxFrameData) {
                this.frameData.shift();
            }
        }
        
        this.lastFrameTime = currentTime;
        this.timers.clear();
    }
    
    // 获取FPS统计
    getFPSStats() {
        if (this.frameData.length === 0) return null;
        
        const fps = this.frameData.map(frame => frame.fps);
        const avgFPS = fps.reduce((sum, val) => sum + val, 0) / fps.length;
        const minFPS = Math.min(...fps);
        const maxFPS = Math.max(...fps);
        
        return {
            average: avgFPS.toFixed(2),
            minimum: minFPS.toFixed(2),
            maximum: maxFPS.toFixed(2),
            current: fps[fps.length - 1].toFixed(2)
        };
    }
    
    // 获取渲染时间统计
    getRenderTimeStats() {
        const renderTimes = this.frameData
            .map(frame => frame.renderTime)
            .filter(time => time > 0);
        
        if (renderTimes.length === 0) return null;
        
        const avgTime = renderTimes.reduce((sum, val) => sum + val, 0) / renderTimes.length;
        const minTime = Math.min(...renderTimes);
        const maxTime = Math.max(...renderTimes);
        
        return {
            average: avgTime.toFixed(2) + 'ms',
            minimum: minTime.toFixed(2) + 'ms',
            maximum: maxTime.toFixed(2) + 'ms'
        };
    }
}
```

## 5. 移动端优化

```javascript
// 移动端性能优化器
class MobileOptimizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.isLowEndDevice = this.detectLowEndDevice();
        
        this.optimizeForMobile();
    }
    
    // 检测低端设备
    detectLowEndDevice() {
        // 检查内存
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            return true;
        }
        
        // 检查硬件并发数
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            return true;
        }
        
        return false;
    }
    
    // 移动端优化设置
    optimizeForMobile() {
        // 设置Canvas分辨率
        this.setupHighDPI();
        
        // 禁用某些浏览器优化
        this.canvas.style.touchAction = 'none';
        
        // 设置优化标志
        if (this.isLowEndDevice) {
            // 降低质量设置
            this.ctx.imageSmoothingEnabled = false;
            console.log('Low-end device detected, using performance optimizations');
        }
    }
    
    // 高DPI支持
    setupHighDPI() {
        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;
        
        // 设置内部分辨率
        this.canvas.width = displayWidth * this.devicePixelRatio;
        this.canvas.height = displayHeight * this.devicePixelRatio;
        
        // 设置显示尺寸
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        // 缩放绘图上下文
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }
    
    // 获取推荐的性能设置
    getRecommendedSettings() {
        if (this.isLowEndDevice) {
            return {
                maxParticles: 50,
                enableShadows: false,
                enableAntialiasing: false,
                targetFPS: 30
            };
        } else {
            return {
                maxParticles: 200,
                enableShadows: true,
                enableAntialiasing: true,
                targetFPS: 60
            };
        }
    }
}
```

## 6. 综合优化示例

```javascript
// 高性能Canvas渲染器
class OptimizedRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 性能组件
        this.dirtyRectManager = new DirtyRectManager(canvas);
        this.layerManager = new LayerManager(canvas.width, canvas.height);
        this.batchRenderer = new BatchRenderer(this.ctx);
        this.offscreenManager = new OffscreenCanvasManager();
        this.profiler = new PerformanceProfiler();
        this.mobileOptimizer = new MobileOptimizer(canvas);
        
        // 渲染队列
        this.renderQueue = [];
        this.isRendering = false;
        
        // 创建基本图层
        this.backgroundLayer = this.layerManager.createLayer('background', 0);
        this.gameLayer = this.layerManager.createLayer('game', 1);
        this.uiLayer = this.layerManager.createLayer('ui', 2);
    }
    
    // 添加渲染任务
    addRenderTask(task) {
        this.renderQueue.push(task);
    }
    
    // 执行渲染
    render() {
        if (this.isRendering) return;
        
        this.isRendering = true;
        this.profiler.startTimer('render');
        
        // 清除脏区域
        this.dirtyRectManager.clearDirtyRects();
        
        // 处理渲染队列
        this.processRenderQueue();
        
        // 执行批量绘制
        this.batchRenderer.flush();
        
        // 合成图层
        this.layerManager.composite(this.ctx);
        
        this.profiler.endTimer('render');
        this.profiler.recordFrame();
        
        this.isRendering = false;
    }
    
    // 处理渲染队列
    processRenderQueue() {
        // 按类型分组渲染任务
        const rects = this.renderQueue.filter(task => task.type === 'rect');
        const circles = this.renderQueue.filter(task => task.type === 'circle');
        
        // 批量绘制
        if (rects.length > 0) {
            this.batchRenderer.batchRects(rects);
        }
        
        if (circles.length > 0) {
            this.batchRenderer.batchCircles(circles);
        }
        
        this.renderQueue = [];
    }
    
    // 获取性能统计
    getPerformanceStats() {
        return {
            fps: this.profiler.getFPSStats(),
            renderTime: this.profiler.getRenderTimeStats(),
            cache: this.offscreenManager.getCacheStats()
        };
    }
}

// 使用示例
const optimizedRenderer = new OptimizedRenderer(canvas);

// 添加渲染任务
optimizedRenderer.addRenderTask({
    type: 'rect',
    x: 100, y: 100, width: 50, height: 50,
    fillStyle: '#ff0000'
});

// 执行渲染
function gameLoop() {
    optimizedRenderer.render();
    
    // 显示性能统计
    const stats = optimizedRenderer.getPerformanceStats();
    if (stats.fps) {
        console.log('FPS:', stats.fps.current);
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

## 7. 实践练习

### 练习1：性能监控面板
创建一个实时显示FPS、内存使用量和渲染时间的监控面板。

### 练习2：大量对象优化
优化一个包含500+移动对象的Canvas应用的性能。

### 练习3：移动端适配
实现一个自动适配不同设备性能的Canvas应用。

## 总结

本章介绍了Canvas性能优化的核心技术：

1. **渲染优化**：脏矩形、图层分离、批量绘制等技术
2. **内存管理**：对象池、内存泄漏检测和优化策略
3. **缓存优化**：离屏Canvas和预渲染技术
4. **性能监控**：实时性能分析和瓶颈检测
5. **移动端优化**：针对移动设备的专门优化

掌握这些优化技术能显著提升Canvas应用的性能和用户体验。 