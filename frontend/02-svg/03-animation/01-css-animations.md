# CSS动画在SVG中的应用

CSS动画为SVG图形带来了生动的动态效果。本章将深入探讨如何在SVG中使用CSS过渡、关键帧动画，以及如何优化动画性能。

## 🎯 学习目标

完成本章学习后，您将能够：
- 掌握CSS过渡在SVG中的应用
- 创建流畅的关键帧动画效果
- 理解SVG变换动画的原理
- 优化动画性能和用户体验
- 实现响应式动画设计

## 🎨 CSS过渡动画

### 基础过渡效果

```html
<style>
.svg-transition {
  transition: all 0.3s ease;
}

.svg-transition:hover {
  fill: #e74c3c;
  transform: scale(1.1);
}

.color-transition {
  fill: #3498db;
  transition: fill 0.5s ease-in-out;
}

.color-transition:hover {
  fill: #2ecc71;
}

.size-transition {
  transition: r 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.size-transition:hover {
  r: 40;
}
</style>

<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- 基础过渡 -->
  <rect x="50" y="50" width="60" height="60" fill="#3498db" class="svg-transition"/>
  
  <!-- 颜色过渡 -->
  <rect x="150" y="50" width="60" height="60" class="color-transition"/>
  
  <!-- 尺寸过渡 -->
  <circle cx="280" cy="80" r="30" fill="#e67e22" class="size-transition"/>
</svg>
```

### 多属性过渡

```html
<style>
.complex-transition {
  fill: #9b59b6;
  stroke: #8e44ad;
  stroke-width: 2;
  transition: 
    fill 0.3s ease,
    stroke-width 0.3s ease,
    transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.complex-transition:hover {
  fill: #e74c3c;
  stroke-width: 6;
  transform: rotate(15deg) scale(1.2);
}

.path-transition {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  transition: stroke-dashoffset 2s ease-in-out;
}

.path-transition:hover {
  stroke-dashoffset: 0;
}
</style>

<svg width="400" height="200" viewBox="0 0 400 200">
  <rect x="50" y="50" width="80" height="80" class="complex-transition"/>
  
  <path d="M 200,50 Q 250,20 300,50 T 350,100" 
        fill="none" stroke="#2c3e50" stroke-width="3" 
        class="path-transition"/>
</svg>
```

## 🎬 关键帧动画

### 基础关键帧

```html
<style>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-20px);
  }
  70% {
    transform: translateY(-10px);
  }
}

@keyframes colorCycle {
  0% { fill: #e74c3c; }
  25% { fill: #f39c12; }
  50% { fill: #2ecc71; }
  75% { fill: #3498db; }
  100% { fill: #e74c3c; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bouncing-circle {
  animation: bounce 2s infinite;
}

.color-changing-rect {
  animation: colorCycle 3s infinite linear;
}

.spinning-square {
  animation: spin 4s infinite linear;
  transform-origin: center;
}
</style>

<svg width="400" height="200" viewBox="0 0 400 200">
  <circle cx="80" cy="100" r="25" fill="#e74c3c" class="bouncing-circle"/>
  <rect x="150" y="75" width="50" height="50" class="color-changing-rect"/>
  <rect x="250" y="75" width="50" height="50" fill="#9b59b6" class="spinning-square"/>
</svg>
```

### 复杂动画序列

```html
<style>
@keyframes complexAnimation {
  0% {
    transform: translateX(0) rotate(0deg) scale(1);
    fill: #3498db;
  }
  25% {
    transform: translateX(100px) rotate(90deg) scale(1.2);
    fill: #e74c3c;
  }
  50% {
    transform: translateX(100px) translateY(-50px) rotate(180deg) scale(0.8);
    fill: #2ecc71;
  }
  75% {
    transform: translateX(0) translateY(-50px) rotate(270deg) scale(1.1);
    fill: #f39c12;
  }
  100% {
    transform: translateX(0) rotate(360deg) scale(1);
    fill: #3498db;
  }
}

@keyframes pathAnimation {
  0% {
    stroke-dasharray: 0 200;
  }
  50% {
    stroke-dasharray: 100 100;
  }
  100% {
    stroke-dasharray: 200 0;
  }
}

.complex-shape {
  animation: complexAnimation 4s infinite ease-in-out;
  transform-origin: center;
}

.animated-path {
  fill: none;
  stroke: #2c3e50;
  stroke-width: 3;
  stroke-linecap: round;
  animation: pathAnimation 3s infinite;
}
</style>

<svg width="400" height="200" viewBox="0 0 400 200">
  <rect x="50" y="75" width="40" height="40" class="complex-shape"/>
  
  <path d="M 50,150 Q 150,120 250,150 T 350,150" class="animated-path"/>
</svg>
```

## 🔄 变换动画

### 2D变换动画

```html
<style>
@keyframes scaleAnimation {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.5); }
}

@keyframes rotateAnimation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes translateAnimation {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(100px); }
}

@keyframes skewAnimation {
  0%, 100% { transform: skewX(0deg); }
  50% { transform: skewX(20deg); }
}

.scale-animation {
  animation: scaleAnimation 2s infinite ease-in-out;
  transform-origin: center;
}

.rotate-animation {
  animation: rotateAnimation 3s infinite linear;
  transform-origin: center;
}

.translate-animation {
  animation: translateAnimation 2s infinite ease-in-out;
}

.skew-animation {
  animation: skewAnimation 3s infinite ease-in-out;
  transform-origin: center;
}
</style>

<svg width="500" height="200" viewBox="0 0 500 200">
  <rect x="50" y="75" width="40" height="40" fill="#e74c3c" class="scale-animation"/>
  <circle cx="170" cy="95" r="20" fill="#3498db" class="rotate-animation"/>
  <rect x="230" y="75" width="40" height="40" fill="#2ecc71" class="translate-animation"/>
  <rect x="400" y="75" width="40" height="40" fill="#f39c12" class="skew-animation"/>
</svg>
```

### 组合变换动画

```html
<style>
@keyframes combinedTransform {
  0% {
    transform: translateX(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateX(50px) rotate(90deg) scale(1.2);
  }
  50% {
    transform: translateX(50px) translateY(-30px) rotate(180deg) scale(0.8);
  }
  75% {
    transform: translateX(0) translateY(-30px) rotate(270deg) scale(1.3);
  }
  100% {
    transform: translateX(0) rotate(360deg) scale(1);
  }
}

@keyframes orbitAnimation {
  from {
    transform: rotate(0deg) translateX(50px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(50px) rotate(-360deg);
  }
}

.combined-transform {
  animation: combinedTransform 4s infinite ease-in-out;
  transform-origin: center;
}

.orbit-center {
  transform-origin: center;
}

.orbit-item {
  animation: orbitAnimation 3s infinite linear;
  transform-origin: 20px 20px;
}
</style>

<svg width="400" height="300" viewBox="0 0 400 300">
  <rect x="80" y="80" width="40" height="40" fill="#9b59b6" class="combined-transform"/>
  
  <!-- 轨道动画 -->
  <g class="orbit-center" transform="translate(280, 150)">
    <circle cx="0" cy="0" r="5" fill="#2c3e50"/>
    <circle cx="50" cy="0" r="10" fill="#e74c3c" class="orbit-item"/>
  </g>
</svg>
```

## 📱 响应式动画

### 基于媒体查询的动画

```html
<style>
@keyframes desktopAnimation {
  0% { transform: translateX(0); }
  100% { transform: translateX(200px); }
}

@keyframes mobileAnimation {
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }
}

.responsive-animation {
  animation: desktopAnimation 2s infinite alternate ease-in-out;
}

@media (max-width: 768px) {
  .responsive-animation {
    animation: mobileAnimation 2s infinite alternate ease-in-out;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .responsive-animation {
    animation: none;
  }
}
</style>

<svg width="400" height="100" viewBox="0 0 400 100">
  <circle cx="50" cy="50" r="20" fill="#3498db" class="responsive-animation"/>
</svg>
```

### 用户偏好考虑

```html
<style>
/* 默认动画 */
.accessible-animation {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* 用户偏好减少动画 */
@media (prefers-reduced-motion: reduce) {
  .accessible-animation {
    animation: none;
  }
  
  .accessible-animation:hover {
    opacity: 0.8;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .accessible-animation {
    stroke: #000;
    stroke-width: 2;
  }
}
</style>

<svg width="200" height="100" viewBox="0 0 200 100">
  <rect x="50" y="25" width="100" height="50" fill="#3498db" class="accessible-animation"/>
</svg>
```

## ⚡ 性能优化

### 硬件加速

```html
<style>
/* 启用硬件加速 */
.hardware-accelerated {
  will-change: transform;
  transform: translateZ(0); /* 触发硬件加速 */
}

@keyframes smoothAnimation {
  from { transform: translateX(0) translateZ(0); }
  to { transform: translateX(200px) translateZ(0); }
}

.optimized-animation {
  animation: smoothAnimation 2s infinite alternate ease-in-out;
  will-change: transform;
}

/* 动画完成后清理 */
.animation-complete {
  will-change: auto;
}
</style>

<svg width="400" height="100" viewBox="0 0 400 100">
  <circle cx="50" cy="50" r="20" fill="#e74c3c" class="optimized-animation"/>
</svg>
```

### 性能监控

```javascript
// 动画性能监控
function monitorAnimationPerformance() {
  let lastTime = performance.now();
  let frameCount = 0;
  
  function measureFrame() {
    const currentTime = performance.now();
    frameCount++;
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      console.log(`FPS: ${fps}`);
      
      // 如果帧率过低，可以降低动画复杂度
      if (fps < 30) {
        document.documentElement.classList.add('low-performance');
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(measureFrame);
  }
  
  measureFrame();
}

// 启动监控
monitorAnimationPerformance();
```

## 🎯 实用应用案例

### 交互式按钮动画

```html
<style>
.animated-button {
  cursor: pointer;
  transition: all 0.3s ease;
}

.animated-button:hover .button-bg {
  fill: #2980b9;
  transform: scale(1.05);
}

.animated-button:hover .button-text {
  fill: white;
}

.animated-button:active .button-bg {
  transform: scale(0.95);
}

.button-bg {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.button-text {
  transition: fill 0.3s ease;
  pointer-events: none;
}

@keyframes buttonPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
}

.animated-button:focus {
  animation: buttonPulse 1.5s infinite;
}
</style>

<svg width="200" height="80" viewBox="0 0 200 80" class="animated-button">
  <rect class="button-bg" x="20" y="20" width="160" height="40" rx="20" fill="#3498db"/>
  <text class="button-text" x="100" y="45" text-anchor="middle" font-size="16" fill="white">
    点击我
  </text>
</svg>
```

### 加载动画

```html
<style>
@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.loading-spinner {
  animation: spinner 2s linear infinite;
  transform-origin: center;
}

.loading-circle {
  fill: none;
  stroke: #3498db;
  stroke-width: 4;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes dots {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

.loading-dot-1 { animation: dots 1.4s infinite ease-in-out; animation-delay: 0s; }
.loading-dot-2 { animation: dots 1.4s infinite ease-in-out; animation-delay: 0.16s; }
.loading-dot-3 { animation: dots 1.4s infinite ease-in-out; animation-delay: 0.32s; }
</style>

<div style="display: flex; gap: 50px; align-items: center; padding: 20px;">
  <!-- 旋转加载器 -->
  <svg width="50" height="50" viewBox="0 0 50 50" class="loading-spinner">
    <circle class="loading-circle" cx="25" cy="25" r="20"/>
  </svg>
  
  <!-- 点状加载器 -->
  <svg width="70" height="20" viewBox="0 0 70 20">
    <circle class="loading-dot-1" cx="10" cy="10" r="5" fill="#3498db"/>
    <circle class="loading-dot-2" cx="30" cy="10" r="5" fill="#3498db"/>
    <circle class="loading-dot-3" cx="50" cy="10" r="5" fill="#3498db"/>
  </svg>
</div>
```

## 📝 练习项目

### 动画控制面板

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .animation-controls { max-width: 600px; margin: 20px auto; }
  .preview-area { text-align: center; margin: 20px 0; border: 1px solid #ddd; padding: 20px; }
  .control-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
  .control-group { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
  .control-group label { display: block; margin-bottom: 5px; font-weight: bold; }
  .control-group input, .control-group select { width: 100%; margin-bottom: 5px; }
  
  .animated-element {
    transition: all 0.3s ease;
  }
</style>
</head>
<body>
  <div class="animation-controls">
    <div class="preview-area">
      <svg width="300" height="200" viewBox="0 0 300 200">
        <rect id="animatedRect" x="125" y="75" width="50" height="50" fill="#3498db" class="animated-element"/>
      </svg>
    </div>
    
    <div class="control-panel">
      <div class="control-group">
        <label>动画类型</label>
        <select id="animationType">
          <option value="none">无动画</option>
          <option value="rotate">旋转</option>
          <option value="scale">缩放</option>
          <option value="translate">移动</option>
          <option value="pulse">脉冲</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>动画时长</label>
        <input type="range" id="duration" min="0.5" max="5" step="0.1" value="1">
        <span id="durationValue">1s</span>
      </div>
      
      <div class="control-group">
        <label>缓动函数</label>
        <select id="easing">
          <option value="ease">ease</option>
          <option value="linear">linear</option>
          <option value="ease-in">ease-in</option>
          <option value="ease-out">ease-out</option>
          <option value="ease-in-out">ease-in-out</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>颜色</label>
        <input type="color" id="color" value="#3498db">
      </div>
    </div>
  </div>

  <script>
    const animatedRect = document.getElementById('animatedRect');
    const animationType = document.getElementById('animationType');
    const duration = document.getElementById('duration');
    const durationValue = document.getElementById('durationValue');
    const easing = document.getElementById('easing');
    const color = document.getElementById('color');
    
    function updateAnimation() {
      const type = animationType.value;
      const dur = duration.value;
      const ease = easing.value;
      const col = color.value;
      
      // 更新颜色
      animatedRect.setAttribute('fill', col);
      
      // 更新时长显示
      durationValue.textContent = dur + 's';
      
      // 清除现有动画
      animatedRect.style.animation = '';
      
      // 应用新动画
      if (type !== 'none') {
        const animationName = `custom-${type}`;
        animatedRect.style.animation = `${animationName} ${dur}s ${ease} infinite`;
        
        // 动态创建CSS动画
        createAnimation(animationName, type);
      }
    }
    
    function createAnimation(name, type) {
      // 移除旧的样式
      const oldStyle = document.getElementById('dynamic-animation');
      if (oldStyle) {
        oldStyle.remove();
      }
      
      // 创建新的样式
      const style = document.createElement('style');
      style.id = 'dynamic-animation';
      
      let keyframes = '';
      switch (type) {
        case 'rotate':
          keyframes = `
            @keyframes ${name} {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `;
          break;
        case 'scale':
          keyframes = `
            @keyframes ${name} {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.5); }
            }
          `;
          break;
        case 'translate':
          keyframes = `
            @keyframes ${name} {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(50px); }
            }
          `;
          break;
        case 'pulse':
          keyframes = `
            @keyframes ${name} {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `;
          break;
      }
      
      style.textContent = keyframes;
      document.head.appendChild(style);
    }
    
    // 绑定事件监听
    animationType.addEventListener('change', updateAnimation);
    duration.addEventListener('input', updateAnimation);
    easing.addEventListener('change', updateAnimation);
    color.addEventListener('change', updateAnimation);
    
    // 初始化
    updateAnimation();
  </script>
</body>
</html>
```

## 🎯 总结

CSS动画为SVG带来了丰富的动态效果可能性。通过掌握过渡、关键帧动画和变换技术，您可以创建流畅、吸引人的用户界面。

### 关键要点：
1. **合理使用过渡和关键帧动画**
2. **优化动画性能，启用硬件加速**
3. **考虑用户偏好和可访问性**
4. **实现响应式动画设计**
5. **提供适当的动画控制选项**

### 最佳实践：
- 保持动画流畅自然
- 避免过度复杂的动画效果
- 考虑动画的语义和目的
- 测试不同设备上的性能
- 遵循无障碍设计原则

继续学习[SMIL动画](02-smil-animations.md)，探索SVG原生动画系统的强大功能。 