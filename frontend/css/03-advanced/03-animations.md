# CSS动画与过渡

CSS动画和过渡是创建引人入胜用户体验的关键技术。本章将详细介绍CSS动画的各种实现方法和最佳实践。

## 📋 目录

1. [CSS过渡效果](#css过渡效果)
2. [2D变换详解](#2d变换详解)
3. [3D变换与透视](#3d变换与透视)
4. [关键帧动画](#关键帧动画)
5. [动画属性详解](#动画属性详解)
6. [高性能动画技巧](#高性能动画技巧)
7. [实用动画案例](#实用动画案例)
8. [动画库和工具](#动画库和工具)

## CSS过渡效果

### 基础概念

CSS过渡（Transition）允许CSS属性值在一定时间内平滑地从一个值变化到另一个值。

### 核心属性

#### transition-property
指定哪些CSS属性参与过渡效果。

```css
.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  /* 指定单个属性 */
  transition-property: background-color;
  
  /* 指定多个属性 */
  transition-property: background-color, transform, box-shadow;
  
  /* 所有可过渡属性 */
  transition-property: all;
}

.button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

#### transition-duration
设置过渡效果的持续时间。

```css
.quick-transition {
  transition-duration: 0.2s;
}

.slow-transition {
  transition-duration: 1s;
}

.multiple-durations {
  transition-property: background-color, transform;
  transition-duration: 0.3s, 0.5s;
}
```

#### transition-timing-function
控制过渡效果的速度曲线。

```css
.ease-in {
  transition-timing-function: ease-in; /* 慢→快 */
}

.ease-out {
  transition-timing-function: ease-out; /* 快→慢 */
}

.ease-in-out {
  transition-timing-function: ease-in-out; /* 慢→快→慢 */
}

.linear {
  transition-timing-function: linear; /* 匀速 */
}

.custom-bezier {
  transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.step-animation {
  transition-timing-function: steps(4, end);
}
```

#### transition-delay
设置过渡效果的延迟时间。

```css
.delayed-transition {
  transition-delay: 0.5s;
}

.staggered-transitions {
  transition-property: transform, opacity, background-color;
  transition-duration: 0.3s, 0.3s, 0.3s;
  transition-delay: 0s, 0.1s, 0.2s;
}
```

### 简写属性

```css
/* 完整语法 */
.element {
  transition: property duration timing-function delay;
}

/* 实例 */
.button {
  transition: all 0.3s ease-in-out 0s;
  
  /* 多个过渡 */
  transition: 
    background-color 0.3s ease-out,
    transform 0.2s ease-in-out 0.1s,
    box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 实用过渡案例

#### 按钮悬停效果
```css
.btn-hover-effect {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-hover-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-hover-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-hover-effect:hover::before {
  left: 100%;
}
```

#### 卡片翻转效果
```css
.flip-card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.flip-card-front {
  background-color: #007bff;
  color: white;
}

.flip-card-back {
  background-color: #28a745;
  color: white;
  transform: rotateY(180deg);
}
```

#### 导航菜单动画
```css
.nav-menu {
  list-style: none;
  display: flex;
  gap: 20px;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #007bff;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.nav-link:hover::before {
  width: 80%;
}
```

## 2D变换详解

### 变换函数

#### translate - 位移
```css
.translate-examples {
  /* 水平位移 */
  transform: translateX(50px);
  
  /* 垂直位移 */
  transform: translateY(-30px);
  
  /* 同时水平和垂直位移 */
  transform: translate(50px, -30px);
  
  /* 百分比位移（相对于元素自身尺寸） */
  transform: translate(50%, -50%);
}

/* 居中定位的经典用法 */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

#### scale - 缩放
```css
.scale-examples {
  /* 等比缩放 */
  transform: scale(1.5);
  
  /* 分别设置水平和垂直缩放 */
  transform: scale(1.2, 0.8);
  
  /* 只缩放水平方向 */
  transform: scaleX(1.5);
  
  /* 只缩放垂直方向 */
  transform: scaleY(0.5);
}

/* 悬停放大效果 */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.1);
}
```

#### rotate - 旋转
```css
.rotate-examples {
  /* 顺时针旋转45度 */
  transform: rotate(45deg);
  
  /* 逆时针旋转90度 */
  transform: rotate(-90deg);
  
  /* 旋转一整圈 */
  transform: rotate(360deg);
}

/* 加载旋转动画 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### skew - 倾斜
```css
.skew-examples {
  /* 水平倾斜 */
  transform: skewX(20deg);
  
  /* 垂直倾斜 */
  transform: skewY(10deg);
  
  /* 同时水平和垂直倾斜 */
  transform: skew(20deg, 10deg);
}

/* 创建平行四边形效果 */
.parallelogram {
  width: 200px;
  height: 100px;
  background-color: #007bff;
  transform: skew(-20deg);
}

.parallelogram-text {
  transform: skew(20deg); /* 反向倾斜文本保持正常 */
}
```

### 组合变换

```css
.combined-transform {
  /* 多个变换按顺序执行 */
  transform: translate(50px, 100px) rotate(45deg) scale(1.2);
  
  /* 注意：顺序很重要！ */
  transform: rotate(45deg) translate(50px, 100px); /* 效果不同 */
}

/* 复杂的悬停效果 */
.complex-hover {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.complex-hover:hover {
  transform: translateY(-10px) rotate(5deg) scale(1.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}
```

### transform-origin

设置变换的原点（默认为元素中心）。

```css
.transform-origin-examples {
  /* 从左上角开始变换 */
  transform-origin: top left;
  
  /* 从右下角开始变换 */
  transform-origin: bottom right;
  
  /* 使用像素值 */
  transform-origin: 50px 100px;
  
  /* 使用百分比 */
  transform-origin: 25% 75%;
}

/* 卡片翻转动画 */
.card-flip {
  transform-origin: center center;
  transition: transform 0.6s ease;
}

.card-flip:hover {
  transform: rotateY(180deg);
}
```

## 3D变换与透视

### perspective - 透视

透视属性定义观察者与z=0平面的距离，创建3D空间感。

```css
.perspective-container {
  perspective: 1000px; /* 透视距离 */
  perspective-origin: center center; /* 观察点位置 */
}

.three-d-element {
  transform-style: preserve-3d; /* 保持3D变换 */
  transform: rotateX(45deg) rotateY(45deg);
}
```

### 3D变换函数

#### rotateX, rotateY, rotateZ
```css
.rotate-3d-examples {
  /* 绕X轴旋转（上下翻转） */
  transform: rotateX(45deg);
  
  /* 绕Y轴旋转（左右翻转） */
  transform: rotateY(45deg);
  
  /* 绕Z轴旋转（平面旋转） */
  transform: rotateZ(45deg);
  
  /* 同时绕多个轴旋转 */
  transform: rotateX(30deg) rotateY(45deg) rotateZ(15deg);
  
  /* 使用rotate3d函数 */
  transform: rotate3d(1, 1, 0, 45deg);
}
```

#### translateZ
```css
.translate-z-examples {
  /* 向前移动（靠近观察者） */
  transform: translateZ(100px);
  
  /* 向后移动（远离观察者） */
  transform: translateZ(-50px);
  
  /* 3D位移 */
  transform: translate3d(50px, 100px, 75px);
}
```

### 3D实战案例

#### 3D卡片翻转
```css
.card-3d-container {
  width: 300px;
  height: 200px;
  perspective: 1000px;
  margin: 50px;
}

.card-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-3d-container:hover .card-3d {
  transform: rotateY(180deg);
}

.card-3d-front,
.card-3d-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.card-3d-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-3d-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: rotateY(180deg);
}
```

#### 3D立方体
```css
.cube-container {
  width: 200px;
  height: 200px;
  perspective: 1000px;
  margin: 100px auto;
}

.cube {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
  animation: rotateCube 10s infinite linear;
}

.cube-face {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid #333;
  font-size: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.cube-face--front  { background: #ff6b6b; transform: rotateY(0deg) translateZ(100px); }
.cube-face--back   { background: #4ecdc4; transform: rotateY(180deg) translateZ(100px); }
.cube-face--right  { background: #45b7d1; transform: rotateY(90deg) translateZ(100px); }
.cube-face--left   { background: #f9ca24; transform: rotateY(-90deg) translateZ(100px); }
.cube-face--top    { background: #6c5ce7; transform: rotateX(90deg) translateZ(100px); }
.cube-face--bottom { background: #a29bfe; transform: rotateX(-90deg) translateZ(100px); }

@keyframes rotateCube {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}
```

## 关键帧动画

### @keyframes规则

关键帧动画允许创建复杂的、多阶段的动画效果。

```css
/* 基本语法 */
@keyframes animationName {
  from { /* 起始状态 */ }
  to { /* 结束状态 */ }
}

/* 或使用百分比 */
@keyframes animationName {
  0% { /* 起始状态 */ }
  25% { /* 25%时的状态 */ }
  50% { /* 50%时的状态 */ }
  75% { /* 75%时的状态 */ }
  100% { /* 结束状态 */ }
}
```

### 实用关键帧动画

#### 淡入淡出
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 滑动动画
```css
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
```

#### 弹跳动画
```css
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
```

#### 脉冲动画
```css
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}
```

#### 摇摆动画
```css
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}

@keyframes wobble {
  0% {
    transform: translate3d(0, 0, 0);
  }
  15% {
    transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
  }
  30% {
    transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
  }
  45% {
    transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
  }
  60% {
    transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
  }
  75% {
    transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}
```

## 动画属性详解

### animation简写属性

```css
.element {
  animation: name duration timing-function delay iteration-count direction fill-mode play-state;
}
```

### 各属性详解

#### animation-name
指定要使用的关键帧名称。

```css
.element {
  animation-name: slideIn;
  animation-name: fadeIn, slideIn; /* 多个动画 */
}
```

#### animation-duration
设置动画持续时间。

```css
.fast-animation { animation-duration: 0.3s; }
.slow-animation { animation-duration: 2s; }
.multiple-durations { 
  animation-name: fadeIn, slideIn;
  animation-duration: 1s, 2s; 
}
```

#### animation-timing-function
控制动画的速度曲线。

```css
.ease { animation-timing-function: ease; }
.ease-in { animation-timing-function: ease-in; }
.ease-out { animation-timing-function: ease-out; }
.ease-in-out { animation-timing-function: ease-in-out; }
.linear { animation-timing-function: linear; }
.custom { animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.steps { animation-timing-function: steps(4, end); }
```

#### animation-delay
设置动画延迟时间。

```css
.no-delay { animation-delay: 0s; }
.delayed { animation-delay: 0.5s; }
.negative-delay { animation-delay: -0.5s; } /* 动画从中间开始 */
```

#### animation-iteration-count
设置动画重复次数。

```css
.once { animation-iteration-count: 1; }
.three-times { animation-iteration-count: 3; }
.infinite { animation-iteration-count: infinite; }
.fractional { animation-iteration-count: 2.5; }
```

#### animation-direction
控制动画播放方向。

```css
.normal { animation-direction: normal; } /* 正向播放 */
.reverse { animation-direction: reverse; } /* 反向播放 */
.alternate { animation-direction: alternate; } /* 交替播放 */
.alternate-reverse { animation-direction: alternate-reverse; } /* 反向交替播放 */
```

#### animation-fill-mode
控制动画在执行前后的状态。

```css
.none { animation-fill-mode: none; } /* 默认 */
.forwards { animation-fill-mode: forwards; } /* 保持结束状态 */
.backwards { animation-fill-mode: backwards; } /* 应用开始状态 */
.both { animation-fill-mode: both; } /* 同时应用开始和结束状态 */
```

#### animation-play-state
控制动画的播放和暂停。

```css
.running { animation-play-state: running; }
.paused { animation-play-state: paused; }

/* 悬停时暂停动画 */
.pause-on-hover {
  animation: spin 2s linear infinite;
}

.pause-on-hover:hover {
  animation-play-state: paused;
}
```

## 高性能动画技巧

### 硬件加速

使用transform和opacity可以触发GPU加速。

```css
/* ✅ 高性能属性 */
.optimized-animation {
  /* 强制开启硬件加速 */
  transform: translateZ(0);
  /* 或者 */
  will-change: transform, opacity;
  
  /* 使用transform代替改变位置 */
  transform: translateX(100px);
  
  /* 使用opacity代替visibility */
  opacity: 0;
}

/* ❌ 低性能属性 */
.unoptimized-animation {
  left: 100px; /* 触发重排 */
  background-color: red; /* 触发重绘 */
  width: 200px; /* 触发重排 */
}
```

### will-change属性

提前告知浏览器将要变化的属性。

```css
.will-animate {
  will-change: transform, opacity;
}

/* 动画结束后移除will-change */
.animation-ended {
  will-change: auto;
}
```

### 性能优化最佳实践

```css
/* 1. 使用transform代替改变位置 */
.move-element {
  /* ❌ 避免使用 */
  left: 100px;
  top: 100px;
  
  /* ✅ 推荐使用 */
  transform: translate(100px, 100px);
}

/* 2. 使用opacity代替显示/隐藏 */
.toggle-visibility {
  /* ❌ 避免使用 */
  display: none;
  visibility: hidden;
  
  /* ✅ 推荐使用 */
  opacity: 0;
  pointer-events: none;
}

/* 3. 避免动画box-shadow，使用伪元素 */
.shadow-animation {
  position: relative;
}

.shadow-animation::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.shadow-animation:hover::after {
  opacity: 1;
}
```

## 实用动画案例

### 加载动画

#### 旋转加载器
```css
.loader-spin {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### 脉冲加载器
```css
.loader-pulse {
  width: 40px;
  height: 40px;
  background-color: #007bff;
  border-radius: 50%;
  animation: pulse-scale 1.5s ease-in-out infinite;
}

@keyframes pulse-scale {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
```

#### 点点加载器
```css
.loader-dots {
  display: flex;
  gap: 5px;
}

.loader-dots .dot {
  width: 10px;
  height: 10px;
  background-color: #007bff;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.loader-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loader-dots .dot:nth-child(2) { animation-delay: -0.16s; }
.loader-dots .dot:nth-child(3) { animation-delay: 0s; }

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
```

### 页面过渡动画

#### 淡入动画
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.page-leave {
  opacity: 1;
  transform: translateY(0);
}

.page-leave-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

#### 滑动过渡
```css
.slide-enter {
  transform: translateX(100%);
}

.slide-enter-active {
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-leave {
  transform: translateX(0);
}

.slide-leave-active {
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 微交互动画

#### 按钮点击效果
```css
.btn-ripple {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-ripple:active::after {
  width: 300px;
  height: 300px;
}
```

#### 输入框聚焦动画
```css
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 0;
  border: none;
  border-bottom: 2px solid #ccc;
  background: transparent;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-bottom-color: #007bff;
}

.form-label {
  position: absolute;
  top: 12px;
  left: 0;
  font-size: 16px;
  color: #999;
  pointer-events: none;
  transition: all 0.3s ease;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  top: -20px;
  font-size: 12px;
  color: #007bff;
}

.form-input::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #007bff;
  transition: all 0.3s ease;
}

.form-input:focus::after {
  width: 100%;
  left: 0;
}
```

## 动画库和工具

### 流行的CSS动画库

#### Animate.css
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

<div class="animate__animated animate__fadeInUp">
  淡入向上动画
</div>
```

#### Hover.css
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hover.css/2.3.1/css/hover-min.css">

<button class="hvr-grow">悬停放大</button>
```

### 动画工具

#### CSS动画生成器
- [CSS3 Generator](https://css3generator.com/)
- [Animista](https://animista.net/)
- [Keyframes.app](https://keyframes.app/)

#### 缓动函数工具
- [Easings.net](https://easings.net/)
- [Cubic-bezier.com](https://cubic-bezier.com/)

#### 性能分析工具
- Chrome DevTools Performance面板
- Firefox动画检查器
- Safari Web Inspector

## 🎯 实践练习

### 练习1：创建加载动画集合
创建5种不同的加载动画：
- 旋转加载器
- 脉冲加载器
- 进度条动画
- 骨架屏动画
- 粒子加载动画

### 练习2：实现页面过渡效果
为单页应用创建页面切换动画：
- 淡入淡出过渡
- 滑动过渡
- 3D翻转过渡
- 缩放过渡

### 练习3：微交互动画
实现常见的微交互动画：
- 按钮悬停效果
- 表单验证动画
- 通知提示动画
- 图片悬停效果

## 📚 延伸阅读

- [MDN CSS动画](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Animations)
- [CSS Tricks动画指南](https://css-tricks.com/almanac/properties/a/animation/)
- [Web动画性能指南](https://developers.google.com/web/fundamentals/design-and-ux/animations)
- [CSS动画最佳实践](https://web.dev/animations-guide/)

## 🔗 下一步学习

完成动画学习后，继续学习：
- [CSS高级特性](./04-advanced-features.md)
- CSS性能优化
- Web动画API
- 动画库的使用和定制

---

CSS动画是提升用户体验的重要技术，合理使用能让你的网站更加生动有趣！ ✨ 