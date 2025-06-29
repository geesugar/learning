# SVG性能优化

SVG性能优化是构建高质量用户体验的关键。本章将深入探讨SVG渲染性能、内存管理、文件大小优化以及各种性能优化技术和最佳实践。

## 🎯 学习目标

完成本章学习后，您将能够：
- 理解SVG渲染性能的影响因素
- 掌握文件大小和代码优化技术
- 实现高效的动画和交互
- 优化内存使用和DOM操作
- 建立性能监控和测试体系

## 📊 性能分析基础

### 性能监控工具

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .performance-monitor {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1000;
  }
  
  .metric {
    margin: 2px 0;
  }
  
  .good { color: #2ecc71; }
  .warning { color: #f39c12; }
  .danger { color: #e74c3c; }
</style>
</head>
<body>
  <div id="performanceMonitor" class="performance-monitor">
    <div class="metric">FPS: <span id="fps">0</span></div>
    <div class="metric">Elements: <span id="elementCount">0</span></div>
    <div class="metric">Memory: <span id="memoryUsage">0 MB</span></div>
    <div class="metric">Render Time: <span id="renderTime">0 ms</span></div>
  </div>

  <svg id="testSVG" width="800" height="600" viewBox="0 0 800 600">
    <!-- 测试内容将在这里生成 -->
  </svg>

  <script>
    class SVGPerformanceMonitor {
      constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.isMonitoring = false;
        
        this.elements = {
          fps: document.getElementById('fps'),
          elementCount: document.getElementById('elementCount'),
          memoryUsage: document.getElementById('memoryUsage'),
          renderTime: document.getElementById('renderTime')
        };
      }
      
      start() {
        this.isMonitoring = true;
        this.monitor();
      }
      
      stop() {
        this.isMonitoring = false;
      }
      
      monitor() {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        this.frameCount++;
        
        // 每秒更新一次
        if (currentTime - this.lastTime >= 1000) {
          this.fps = Math.round(this.frameCount);
          this.frameCount = 0;
          this.lastTime = currentTime;
          
          this.updateDisplay();
        }
        
        requestAnimationFrame(() => this.monitor());
      }
      
      updateDisplay() {
        // FPS显示
        this.elements.fps.textContent = this.fps;
        this.elements.fps.className = this.getPerformanceClass(this.fps, 60, 30);
        
        // SVG元素数量
        const svgElement = document.getElementById('testSVG');
        const elementCount = svgElement ? svgElement.children.length : 0;
        this.elements.elementCount.textContent = elementCount;
        this.elements.elementCount.className = this.getPerformanceClass(elementCount, 100, 500, true);
        
        // 内存使用（如果可用）
        if (performance.memory) {
          const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
          this.elements.memoryUsage.textContent = `${memoryMB} MB`;
          this.elements.memoryUsage.className = this.getPerformanceClass(memoryMB, 50, 100, true);
        }
        
        // 渲染时间测试
        const renderStart = performance.now();
        this.performRenderTest();
        const renderTime = performance.now() - renderStart;
        this.elements.renderTime.textContent = `${renderTime.toFixed(2)} ms`;
        this.elements.renderTime.className = this.getPerformanceClass(renderTime, 5, 16, true);
      }
      
      getPerformanceClass(value, goodThreshold, badThreshold, reverse = false) {
        if (reverse) {
          if (value <= goodThreshold) return 'good';
          if (value <= badThreshold) return 'warning';
          return 'danger';
        } else {
          if (value >= goodThreshold) return 'good';
          if (value >= badThreshold) return 'warning';
          return 'danger';
        }
      }
      
      performRenderTest() {
        // 简单的渲染性能测试
        const testElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        testElement.setAttribute('cx', '100');
        testElement.setAttribute('cy', '100');
        testElement.setAttribute('r', '10');
        testElement.setAttribute('fill', 'red');
        
        const svg = document.getElementById('testSVG');
        svg.appendChild(testElement);
        svg.removeChild(testElement);
      }
    }
    
    // 启动性能监控
    const monitor = new SVGPerformanceMonitor();
    monitor.start();
    
    // 性能测试函数
    function performanceTest() {
      const svg = document.getElementById('testSVG');
      const elementCount = 1000;
      
      console.time('SVG Element Creation');
      for (let i = 0; i < elementCount; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', Math.random() * 800);
        circle.setAttribute('cy', Math.random() * 600);
        circle.setAttribute('r', Math.random() * 10 + 5);
        circle.setAttribute('fill', `hsl(${Math.random() * 360}, 70%, 60%)`);
        svg.appendChild(circle);
      }
      console.timeEnd('SVG Element Creation');
    }
    
    // 清理函数
    function clearTest() {
      const svg = document.getElementById('testSVG');
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
    }
  </script>
  
  <div style="position: fixed; bottom: 10px; right: 10px;">
    <button onclick="performanceTest()">性能测试</button>
    <button onclick="clearTest()">清理</button>
  </div>
</body>
</html>
```

### 性能瓶颈识别

```javascript
class SVGPerformanceProfiler {
  constructor() {
    this.profiles = new Map();
    this.isProfilingEnabled = true;
  }
  
  startProfile(name) {
    if (!this.isProfilingEnabled) return;
    
    this.profiles.set(name, {
      startTime: performance.now(),
      memory: performance.memory ? performance.memory.usedJSHeapSize : 0
    });
  }
  
  endProfile(name) {
    if (!this.isProfilingEnabled) return;
    
    const profile = this.profiles.get(name);
    if (!profile) return;
    
    const endTime = performance.now();
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    const result = {
      name,
      duration: endTime - profile.startTime,
      memoryDelta: endMemory - profile.memory,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Profile [${name}]:`, result);
    this.profiles.delete(name);
    
    return result;
  }
  
  profileFunction(name, fn) {
    this.startProfile(name);
    const result = fn();
    this.endProfile(name);
    return result;
  }
  
  profileAsync(name, promise) {
    this.startProfile(name);
    return promise.finally(() => {
      this.endProfile(name);
    });
  }
}

const profiler = new SVGPerformanceProfiler();
```

## 🗜️ 文件大小优化

### SVG代码压缩

```javascript
class SVGOptimizer {
  constructor() {
    this.optimizations = {
      removeComments: true,
      removeEmptyElements: true,
      mergePaths: true,
      simplifyPaths: true,
      removeRedundantAttributes: true,
      optimizeNumbers: true
    };
  }
  
  optimize(svgString) {
    let optimized = svgString;
    
    if (this.optimizations.removeComments) {
      optimized = this.removeComments(optimized);
    }
    
    if (this.optimizations.removeEmptyElements) {
      optimized = this.removeEmptyElements(optimized);
    }
    
    if (this.optimizations.removeRedundantAttributes) {
      optimized = this.removeRedundantAttributes(optimized);
    }
    
    if (this.optimizations.optimizeNumbers) {
      optimized = this.optimizeNumbers(optimized);
    }
    
    return optimized.trim();
  }
  
  removeComments(svg) {
    return svg.replace(/<!--[\s\S]*?-->/g, '');
  }
  
  removeEmptyElements(svg) {
    // 移除空的group和container元素
    return svg.replace(/<g[^>]*>\s*<\/g>/g, '')
              .replace(/<defs[^>]*>\s*<\/defs>/g, '');
  }
  
  removeRedundantAttributes(svg) {
    // 移除默认值
    return svg.replace(/\s+fill="none"/g, '')
              .replace(/\s+stroke="none"/g, '')
              .replace(/\s+opacity="1"/g, '')
              .replace(/\s+fill-opacity="1"/g, '');
  }
  
  optimizeNumbers(svg) {
    // 优化数字精度
    return svg.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(match).toFixed(2);
    });
  }
  
  // 路径优化
  optimizePath(pathData) {
    return pathData
      // 移除多余空格
      .replace(/\s+/g, ' ')
      // 优化连续的相同命令
      .replace(/([MLHVCSQTAZ])\s*\1/gi, '$1')
      // 移除不必要的L命令
      .replace(/L\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)\s*L/g, 'L$1,$2 ')
      .trim();
  }
  
  // 颜色优化
  optimizeColors(svg) {
    // 将长颜色代码转换为短代码
    return svg.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
              // 使用标准颜色名称
              .replace(/#000000/g, '#000')
              .replace(/#ffffff/g, '#fff')
              .replace(/#ff0000/g, 'red')
              .replace(/#00ff00/g, 'lime')
              .replace(/#0000ff/g, 'blue');
  }
}

// 使用示例
const optimizer = new SVGOptimizer();
const originalSVG = `
<!-- This is a comment -->
<svg width="100" height="100" viewBox="0 0 100 100">
  <g>
    <rect x="10.123456789" y="20.987654321" width="30.555555555" height="40.777777777" 
          fill="none" stroke="none" opacity="1"/>
    <path d="M 10 20 L 30 40 L 50 60 L 70 80"/>
  </g>
  <defs></defs>
</svg>
`;

const optimizedSVG = optimizer.optimize(originalSVG);
console.log('Original size:', originalSVG.length);
console.log('Optimized size:', optimizedSVG.length);
console.log('Compression ratio:', ((originalSVG.length - optimizedSVG.length) / originalSVG.length * 100).toFixed(2) + '%');
```

### 资源优化策略

```javascript
class SVGResourceManager {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
    this.observers = new Map();
  }
  
  // 懒加载SVG
  async lazyLoadSVG(url, container) {
    // 检查是否已在视口中
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadSVG(url, entry.target);
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(container);
    this.observers.set(container, observer);
  }
  
  // 预加载关键SVG
  preloadSVG(urls) {
    urls.forEach(url => {
      if (!this.cache.has(url)) {
        fetch(url)
          .then(response => response.text())
          .then(svgContent => {
            this.cache.set(url, svgContent);
          })
          .catch(error => {
            console.warn(`Failed to preload SVG: ${url}`, error);
          });
      }
    });
  }
  
  // 加载SVG
  async loadSVG(url, container) {
    try {
      let svgContent;
      
      if (this.cache.has(url)) {
        svgContent = this.cache.get(url);
      } else {
        const response = await fetch(url);
        svgContent = await response.text();
        this.cache.set(url, svgContent);
      }
      
      container.innerHTML = svgContent;
    } catch (error) {
      console.error(`Failed to load SVG: ${url}`, error);
    }
  }
  
  // SVG压缩传输
  compressSVG(svgContent) {
    // 使用gzip压缩（服务器端配置）
    // 这里展示客户端的基本压缩逻辑
    return svgContent
      .replace(/>\s+</g, '><')  // 移除标签间空白
      .replace(/\s+/g, ' ')     // 压缩空白字符
      .trim();
  }
  
  // 清理缓存
  clearCache() {
    this.cache.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// 使用示例
const resourceManager = new SVGResourceManager();

// 预加载关键资源
resourceManager.preloadSVG([
  '/icons/critical-icon.svg',
  '/graphics/hero-image.svg'
]);

// 懒加载非关键资源
document.querySelectorAll('.lazy-svg').forEach(container => {
  const url = container.dataset.src;
  resourceManager.lazyLoadSVG(url, container);
});
```

## 🚀 渲染性能优化

### DOM操作优化

```javascript
class SVGDOMOptimizer {
  constructor() {
    this.batchUpdates = [];
    this.isScheduled = false;
  }
  
  // 批量DOM更新
  batchUpdate(fn) {
    this.batchUpdates.push(fn);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.flushUpdates();
      });
    }
  }
  
  flushUpdates() {
    const updates = this.batchUpdates.splice(0);
    
    // 使用DocumentFragment减少重排
    const fragment = document.createDocumentFragment();
    
    updates.forEach(update => {
      try {
        update();
      } catch (error) {
        console.error('Batch update error:', error);
      }
    });
    
    this.isScheduled = false;
  }
  
  // 虚拟化长列表
  virtualizeList(container, items, itemHeight, visibleCount) {
    const totalHeight = items.length * itemHeight;
    let scrollTop = 0;
    
    // 创建容器
    const viewport = document.createElement('div');
    viewport.style.height = `${visibleCount * itemHeight}px`;
    viewport.style.overflow = 'auto';
    
    const content = document.createElement('div');
    content.style.height = `${totalHeight}px`;
    content.style.position = 'relative';
    
    viewport.appendChild(content);
    container.appendChild(viewport);
    
    const updateVisibleItems = () => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      
      // 清除现有元素
      content.innerHTML = '';
      
      // 添加可见元素
      for (let i = startIndex; i < endIndex; i++) {
        const item = this.createSVGItem(items[i]);
        item.style.position = 'absolute';
        item.style.top = `${i * itemHeight}px`;
        content.appendChild(item);
      }
    };
    
    viewport.addEventListener('scroll', (e) => {
      scrollTop = e.target.scrollTop;
      requestAnimationFrame(updateVisibleItems);
    });
    
    updateVisibleItems();
  }
  
  createSVGItem(data) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '50');
    svg.setAttribute('viewBox', '0 0 200 50');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '5');
    rect.setAttribute('y', '5');
    rect.setAttribute('width', '190');
    rect.setAttribute('height', '40');
    rect.setAttribute('fill', data.color || '#e0e0e0');
    rect.setAttribute('rx', '5');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '100');
    text.setAttribute('y', '28');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = data.label || 'Item';
    
    svg.appendChild(rect);
    svg.appendChild(text);
    
    return svg;
  }
  
  // 对象池模式
  createObjectPool(createFn, resetFn) {
    const pool = [];
    
    return {
      acquire() {
        if (pool.length > 0) {
          const obj = pool.pop();
          resetFn && resetFn(obj);
          return obj;
        }
        return createFn();
      },
      
      release(obj) {
        pool.push(obj);
      },
      
      clear() {
        pool.length = 0;
      }
    };
  }
}

// 使用示例
const domOptimizer = new SVGDOMOptimizer();

// 批量更新示例
function updateMultipleElements() {
  const elements = document.querySelectorAll('.animated-element');
  
  elements.forEach(element => {
    domOptimizer.batchUpdate(() => {
      element.setAttribute('fill', getRandomColor());
      element.setAttribute('transform', `rotate(${Math.random() * 360})`);
    });
  });
}

// 对象池示例
const circlePool = domOptimizer.createObjectPool(
  () => document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
  (circle) => {
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', '#333');
  }
);
```

### 动画性能优化

```javascript
class SVGAnimationOptimizer {
  constructor() {
    this.activeAnimations = new Set();
    this.rafId = null;
    this.lastFrameTime = 0;
  }
  
  // 高性能动画循环
  createAnimationLoop() {
    const animate = (currentTime) => {
      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      
      // 跳帧检测
      if (deltaTime > 32) { // 如果帧间隔超过32ms（低于30fps）
        console.warn('Frame drop detected:', deltaTime);
      }
      
      // 更新所有活动动画
      this.activeAnimations.forEach(animation => {
        if (animation.update) {
          animation.update(deltaTime);
        }
      });
      
      // 清理完成的动画
      this.cleanupCompletedAnimations();
      
      if (this.activeAnimations.size > 0) {
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.rafId = null;
      }
    };
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(animate);
    }
  }
  
  cleanupCompletedAnimations() {
    const completed = [];
    this.activeAnimations.forEach(animation => {
      if (animation.isComplete && animation.isComplete()) {
        completed.push(animation);
      }
    });
    
    completed.forEach(animation => {
      this.activeAnimations.delete(animation);
      if (animation.onComplete) {
        animation.onComplete();
      }
    });
  }
  
  // 优化的变换动画
  createOptimizedTransformAnimation(element, transforms, duration) {
    const startTime = performance.now();
    const startTransforms = this.parseTransforms(element);
    
    const animation = {
      element,
      startTime,
      duration,
      startTransforms,
      targetTransforms: transforms,
      
      update(deltaTime) {
        const elapsed = performance.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const currentTransforms = this.interpolateTransforms(
          this.startTransforms,
          this.targetTransforms,
          progress
        );
        
        // 使用CSS transform而不是SVG属性（更高性能）
        this.element.style.transform = this.buildTransformString(currentTransforms);
      },
      
      isComplete() {
        return performance.now() - this.startTime >= this.duration;
      },
      
      interpolateTransforms(start, target, progress) {
        const result = {};
        
        for (const key in target) {
          if (start[key] !== undefined) {
            result[key] = start[key] + (target[key] - start[key]) * progress;
          } else {
            result[key] = target[key] * progress;
          }
        }
        
        return result;
      },
      
      buildTransformString(transforms) {
        const parts = [];
        
        if (transforms.translateX || transforms.translateY) {
          parts.push(`translate(${transforms.translateX || 0}px, ${transforms.translateY || 0}px)`);
        }
        
        if (transforms.scaleX || transforms.scaleY) {
          const sx = transforms.scaleX || transforms.scale || 1;
          const sy = transforms.scaleY || transforms.scale || 1;
          parts.push(`scale(${sx}, ${sy})`);
        }
        
        if (transforms.rotate) {
          parts.push(`rotate(${transforms.rotate}deg)`);
        }
        
        return parts.join(' ');
      }
    };
    
    this.activeAnimations.add(animation);
    this.createAnimationLoop();
    
    return animation;
  }
  
  parseTransforms(element) {
    const transform = element.style.transform || '';
    const transforms = {};
    
    // 解析现有变换
    const translateMatch = transform.match(/translate\(([^)]+)\)/);
    if (translateMatch) {
      const values = translateMatch[1].split(',').map(v => parseFloat(v));
      transforms.translateX = values[0] || 0;
      transforms.translateY = values[1] || 0;
    }
    
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      const values = scaleMatch[1].split(',').map(v => parseFloat(v));
      transforms.scaleX = values[0] || 1;
      transforms.scaleY = values[1] || values[0] || 1;
    }
    
    const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
    if (rotateMatch) {
      transforms.rotate = parseFloat(rotateMatch[1]) || 0;
    }
    
    return transforms;
  }
  
  // 动画分层优化
  createLayeredAnimation(elements, layerConfig) {
    const layers = new Map();
    
    elements.forEach(element => {
      const layer = layerConfig(element) || 'default';
      
      if (!layers.has(layer)) {
        layers.set(layer, []);
      }
      
      layers.get(layer).push(element);
    });
    
    // 为每个层创建优化的动画批处理
    layers.forEach((layerElements, layerName) => {
      this.createBatchAnimation(layerElements, layerName);
    });
  }
  
  createBatchAnimation(elements, layerName) {
    const animation = {
      elements,
      layerName,
      
      update(deltaTime) {
        // 批量更新同一层的所有元素
        elements.forEach(element => {
          // 应用相同的优化策略
          this.updateElement(element, deltaTime);
        });
      },
      
      updateElement(element, deltaTime) {
        // 元素特定的更新逻辑
        const data = element.__animationData;
        if (data && data.update) {
          data.update(deltaTime);
        }
      },
      
      isComplete() {
        return this.elements.every(element => {
          const data = element.__animationData;
          return !data || (data.isComplete && data.isComplete());
        });
      }
    };
    
    this.activeAnimations.add(animation);
  }
}

// 使用示例
const animationOptimizer = new SVGAnimationOptimizer();

// 创建优化的动画
function animateElement(element) {
  animationOptimizer.createOptimizedTransformAnimation(
    element,
    {
      translateX: 200,
      translateY: 100,
      scale: 1.5,
      rotate: 180
    },
    1000
  );
}
```

## 💾 内存管理

### 内存泄漏预防

```javascript
class SVGMemoryManager {
  constructor() {
    this.elementRegistry = new WeakMap();
    this.eventListeners = new Map();
    this.timers = new Set();
    this.observers = new Set();
  }
  
  // 安全地添加事件监听器
  addEventListener(element, event, handler, options = {}) {
    const listenerId = this.generateId();
    
    element.addEventListener(event, handler, options);
    
    // 记录监听器以便后续清理
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    
    this.eventListeners.get(element).push({
      event,
      handler,
      options,
      id: listenerId
    });
    
    return listenerId;
  }
  
  // 移除事件监听器
  removeEventListener(element, listenerId) {
    const listeners = this.eventListeners.get(element);
    if (!listeners) return;
    
    const index = listeners.findIndex(l => l.id === listenerId);
    if (index !== -1) {
      const listener = listeners[index];
      element.removeEventListener(listener.event, listener.handler, listener.options);
      listeners.splice(index, 1);
      
      if (listeners.length === 0) {
        this.eventListeners.delete(element);
      }
    }
  }
  
  // 清理元素相关的所有资源
  cleanupElement(element) {
    // 移除事件监听器
    const listeners = this.eventListeners.get(element);
    if (listeners) {
      listeners.forEach(listener => {
        element.removeEventListener(listener.event, listener.handler, listener.options);
      });
      this.eventListeners.delete(element);
    }
    
    // 清理子元素
    if (element.children) {
      Array.from(element.children).forEach(child => {
        this.cleanupElement(child);
      });
    }
    
    // 清理数据引用
    if (element.__data) {
      delete element.__data;
    }
    
    // 从注册表中移除
    this.elementRegistry.delete(element);
  }
  
  // 监控内存使用
  monitorMemoryUsage() {
    if (!performance.memory) {
      console.warn('Memory monitoring not available in this browser');
      return;
    }
    
    const checkMemory = () => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      console.log(`Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`);
      
      // 内存使用过高时的警告
      if (used / limit > 0.8) {
        console.warn('High memory usage detected. Consider cleaning up resources.');
        this.suggestCleanup();
      }
    };
    
    const timerId = setInterval(checkMemory, 5000);
    this.timers.add(timerId);
    
    return timerId;
  }
  
  suggestCleanup() {
    console.log('Memory cleanup suggestions:');
    console.log('- Remove unused event listeners');
    console.log('- Clear animation caches');
    console.log('- Dispose of large datasets');
    console.log('- Remove detached DOM elements');
  }
  
  // 对象池实现
  createObjectPool(type, initialSize = 10) {
    const pool = {
      objects: [],
      type,
      created: 0,
      reused: 0
    };
    
    // 预填充池
    for (let i = 0; i < initialSize; i++) {
      pool.objects.push(this.createObject(type));
    }
    
    return {
      acquire() {
        if (pool.objects.length > 0) {
          pool.reused++;
          return pool.objects.pop();
        }
        
        pool.created++;
        return this.createObject(type);
      },
      
      release(obj) {
        this.resetObject(obj, type);
        pool.objects.push(obj);
      },
      
      getStats() {
        return {
          available: pool.objects.length,
          created: pool.created,
          reused: pool.reused,
          efficiency: pool.reused / (pool.created + pool.reused)
        };
      },
      
      clear() {
        pool.objects.length = 0;
        pool.created = 0;
        pool.reused = 0;
      }
    };
  }
  
  createObject(type) {
    switch (type) {
      case 'circle':
        return document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      case 'rect':
        return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      case 'path':
        return document.createElementNS('http://www.w3.org/2000/svg', 'path');
      default:
        return {};
    }
  }
  
  resetObject(obj, type) {
    if (obj.nodeType) {
      // DOM元素重置
      while (obj.attributes.length > 0) {
        obj.removeAttribute(obj.attributes[0].name);
      }
      obj.textContent = '';
    } else {
      // 普通对象重置
      Object.keys(obj).forEach(key => {
        delete obj[key];
      });
    }
  }
  
  // 清理所有资源
  cleanup() {
    // 清理定时器
    this.timers.forEach(timerId => {
      clearInterval(timerId);
    });
    this.timers.clear();
    
    // 清理观察器
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    // 清理事件监听器
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(listener => {
        element.removeEventListener(listener.event, listener.handler, listener.options);
      });
    });
    this.eventListeners.clear();
  }
  
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 使用示例
const memoryManager = new SVGMemoryManager();

// 创建对象池
const circlePool = memoryManager.createObjectPool('circle', 50);

// 使用对象池
function createAnimatedCircle() {
  const circle = circlePool.acquire();
  circle.setAttribute('cx', Math.random() * 400);
  circle.setAttribute('cy', Math.random() * 300);
  circle.setAttribute('r', Math.random() * 20 + 10);
  
  // 动画完成后释放回池中
  setTimeout(() => {
    circlePool.release(circle);
  }, 2000);
  
  return circle;
}

// 监控内存
memoryManager.monitorMemoryUsage();

// 应用退出时清理
window.addEventListener('beforeunload', () => {
  memoryManager.cleanup();
});
```

## 🎯 总结

SVG性能优化是一个持续的过程，需要从文件大小、渲染性能、内存管理等多个维度进行综合考虑。通过掌握这些优化技术，您可以构建出高性能的SVG应用。

### 关键要点：
1. **建立性能监控体系**
2. **优化文件大小和加载策略**
3. **实现高效的DOM操作和动画**
4. **管理内存使用和资源清理**
5. **使用现代浏览器API提升性能**

### 最佳实践：
- 定期进行性能测试和分析
- 使用工具自动化优化流程
- 实现资源的懒加载和预加载
- 避免不必要的DOM操作和重排
- 合理使用缓存和对象池

继续学习[数据可视化](02-data-visualization.md)，探索SVG在数据呈现方面的高级应用技术。 