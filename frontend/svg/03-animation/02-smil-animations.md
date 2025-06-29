# SMIL动画

SMIL（Synchronized Multimedia Integration Language）是SVG内置的动画系统，提供了强大而灵活的动画控制能力。本章将深入探讨SMIL动画的各种元素和技术。

## 🎯 学习目标

完成本章学习后，您将能够：
- 掌握SMIL动画的基本元素和属性
- 理解动画时间控制和同步机制
- 创建复杂的动画序列和组合
- 处理交互触发的动画
- 解决兼容性问题和降级方案

## 📚 SMIL动画基础

### 基本动画元素

SMIL提供四种主要的动画元素：

```svg
<svg width="500" height="300" viewBox="0 0 500 300">
  <!-- animate：属性值动画 -->
  <rect x="50" y="50" width="60" height="60" fill="blue">
    <animate attributeName="fill" values="blue;red;green;blue" dur="3s" repeatCount="indefinite"/>
  </rect>
  
  <!-- animateTransform：变换动画 -->
  <rect x="150" y="50" width="60" height="60" fill="orange">
    <animateTransform attributeName="transform" type="rotate" 
                      values="0 180 80;360 180 80" dur="4s" repeatCount="indefinite"/>
  </rect>
  
  <!-- animateMotion：路径动画 -->
  <circle r="10" fill="purple">
    <animateMotion dur="5s" repeatCount="indefinite">
      <mpath href="#motionPath"/>
    </animateMotion>
  </circle>
  
  <!-- set：瞬间值设置 -->
  <rect x="350" y="50" width="60" height="60" fill="green">
    <set attributeName="fill" to="red" begin="2s" dur="1s"/>
  </rect>
  
  <!-- 路径定义 -->
  <defs>
    <path id="motionPath" d="M 300,80 Q 350,30 400,80 T 450,120"/>
  </defs>
  
  <!-- 显示路径 -->
  <use href="#motionPath" stroke="gray" stroke-width="1" fill="none" opacity="0.5"/>
</svg>
```

### 动画属性详解

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- 基础属性动画 -->
  <rect x="50" y="50" width="80" height="80" fill="lightblue">
    <!-- attributeName：指定要动画的属性 -->
    <!-- values：关键帧值列表 -->
    <!-- dur：动画持续时间 -->
    <!-- repeatCount：重复次数 -->
    <animate attributeName="x" values="50;250;50" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="fill" values="lightblue;pink;lightgreen;lightblue" 
             dur="2s" repeatCount="indefinite"/>
  </rect>
</svg>
```

## ⏰ 时间控制

### begin 和 end 属性

```svg
<svg width="500" height="200" viewBox="0 0 500 200">
  <!-- 延迟开始 -->
  <rect x="50" y="50" width="60" height="60" fill="blue">
    <animate attributeName="fill" values="blue;red" dur="1s" begin="2s"/>
  </rect>
  
  <!-- 事件触发 -->
  <rect id="trigger" x="150" y="50" width="60" height="60" fill="green" style="cursor:pointer;">
    <animate attributeName="fill" values="green;yellow" dur="1s" begin="click"/>
  </rect>
  
  <!-- 链式动画 -->
  <rect x="250" y="50" width="60" height="60" fill="purple">
    <animate id="anim1" attributeName="x" from="250" to="300" dur="1s" begin="3s"/>
    <animate attributeName="fill" values="purple;orange" dur="1s" begin="anim1.end"/>
  </rect>
  
  <!-- 条件结束 -->
  <rect x="400" y="50" width="60" height="60" fill="cyan">
    <animate attributeName="y" values="50;100;50" dur="2s" begin="4s" end="6s" repeatCount="indefinite"/>
  </rect>
</svg>
```

### 时间值表示法

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 不同时间格式 -->
  <text x="20" y="30" font-size="14">时间格式示例：</text>
  
  <!-- 秒数 -->
  <rect x="50" y="50" width="40" height="40" fill="red">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="50" y="110" font-size="12">2s</text>
  
  <!-- 毫秒 -->
  <rect x="150" y="50" width="40" height="40" fill="blue">
    <animate attributeName="opacity" values="1;0.3;1" dur="1500ms" repeatCount="indefinite"/>
  </rect>
  <text x="150" y="110" font-size="12">1500ms</text>
  
  <!-- 分钟 -->
  <rect x="250" y="50" width="40" height="40" fill="green">
    <animate attributeName="opacity" values="1;0.3;1" dur="0.5min" repeatCount="indefinite"/>
  </rect>
  <text x="250" y="110" font-size="12">0.5min</text>
  
  <!-- 小时 -->
  <rect x="50" y="150" width="40" height="40" fill="orange">
    <animate attributeName="opacity" values="1;0.3;1" dur="0.001h" repeatCount="indefinite"/>
  </rect>
  <text x="50" y="210" font-size="12">0.001h</text>
</svg>
```

## 🎨 高级动画技术

### 关键帧时间控制

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- keyTimes 精确控制时间点 -->
  <circle cx="50" cy="100" r="20" fill="red">
    <animate attributeName="cx" 
             values="50;200;300;350" 
             keyTimes="0;0.3;0.8;1"
             dur="4s" 
             repeatCount="indefinite"/>
  </circle>
  
  <!-- keySplines 控制缓动 -->
  <circle cx="50" cy="150" r="20" fill="blue">
    <animate attributeName="cx" 
             values="50;200;350" 
             keyTimes="0;0.5;1"
             keySplines="0.25 0.1 0.25 1;0.75 0 0.75 0.9"
             calcMode="spline"
             dur="3s" 
             repeatCount="indefinite"/>
  </circle>
</svg>
```

### 变换动画组合

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <rect x="150" y="100" width="100" height="100" fill="purple" 
        transform-origin="200 150">
    <!-- 旋转动画 -->
    <animateTransform attributeName="transform" 
                      type="rotate" 
                      values="0 200 150;360 200 150" 
                      dur="4s" 
                      repeatCount="indefinite"
                      additive="sum"/>
    
    <!-- 缩放动画 -->
    <animateTransform attributeName="transform" 
                      type="scale" 
                      values="1;1.5;1" 
                      dur="2s" 
                      repeatCount="indefinite"
                      additive="sum"/>
    
    <!-- 移动动画 -->
    <animateTransform attributeName="transform" 
                      type="translate" 
                      values="0,0;50,0;0,0" 
                      dur="3s" 
                      repeatCount="indefinite"
                      additive="sum"/>
  </rect>
</svg>
```

### 路径动画高级应用

```svg
<svg width="500" height="300" viewBox="0 0 500 300">
  <defs>
    <!-- 复杂路径 -->
    <path id="complexPath" d="M 50,150 
                             Q 150,50 250,150 
                             T 450,150 
                             Q 400,200 350,150 
                             T 200,200 
                             Q 100,250 50,150"/>
  </defs>
  
  <!-- 显示路径 -->
  <use href="#complexPath" stroke="lightgray" stroke-width="2" fill="none"/>
  
  <!-- 沿路径运动的对象 -->
  <g>
    <!-- 自动旋转跟随路径方向 -->
    <polygon points="-10,0 10,0 0,-15" fill="red">
      <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
        <mpath href="#complexPath"/>
      </animateMotion>
    </polygon>
  </g>
  
  <!-- 固定角度的对象 -->
  <circle r="8" fill="blue">
    <animateMotion dur="4s" repeatCount="indefinite" rotate="0">
      <mpath href="#complexPath"/>
    </animateMotion>
  </circle>
  
  <!-- 反向旋转 -->
  <rect x="-5" y="-5" width="10" height="10" fill="green">
    <animateMotion dur="5s" repeatCount="indefinite" rotate="auto-reverse">
      <mpath href="#complexPath"/>
    </animateMotion>
  </rect>
</svg>
```

## 🎭 交互式动画

### 鼠标事件触发

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 点击触发 -->
  <rect id="clickRect" x="50" y="50" width="80" height="80" fill="lightblue" style="cursor:pointer;">
    <animate attributeName="fill" values="lightblue;red;lightblue" dur="1s" begin="click"/>
    <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="1s" begin="click"/>
  </rect>
  <text x="90" y="150" text-anchor="middle" font-size="12">点击我</text>
  
  <!-- 鼠标悬停 -->
  <circle cx="250" cy="90" r="40" fill="lightgreen" style="cursor:pointer;">
    <animate attributeName="r" from="40" to="50" dur="0.3s" begin="mouseover" end="mouseout"/>
    <animate attributeName="fill" values="lightgreen;yellow" dur="0.3s" begin="mouseover" end="mouseout"/>
  </circle>
  <text x="250" y="150" text-anchor="middle" font-size="12">悬停效果</text>
  
  <!-- 鼠标按下 -->
  <rect x="310" y="50" width="80" height="80" fill="lightyellow" style="cursor:pointer;">
    <animateTransform attributeName="transform" type="translate" values="0,0;2,2" dur="0.1s" begin="mousedown" end="mouseup"/>
    <animate attributeName="fill" values="lightyellow;orange" dur="0.1s" begin="mousedown" end="mouseup"/>
  </rect>
  <text x="350" y="150" text-anchor="middle" font-size="12">按下效果</text>
</svg>
```

### 动画链和同步

```svg
<svg width="500" height="200" viewBox="0 0 500 200">
  <!-- 按钮触发一系列动画 -->
  <rect id="startButton" x="20" y="80" width="60" height="40" fill="green" style="cursor:pointer;" rx="5"/>
  <text x="50" y="105" text-anchor="middle" font-size="12" fill="white" style="pointer-events:none;">开始</text>
  
  <!-- 第一个动画对象 -->
  <circle cx="150" cy="100" r="15" fill="blue">
    <animate id="firstAnim" attributeName="cx" from="150" to="200" dur="1s" begin="startButton.click"/>
    <animate attributeName="fill" values="blue;red" dur="1s" begin="startButton.click"/>
  </circle>
  
  <!-- 第二个动画对象（等第一个完成） -->
  <rect x="240" y="85" width="30" height="30" fill="purple">
    <animate id="secondAnim" attributeName="y" from="85" to="125" dur="1s" begin="firstAnim.end"/>
    <animateTransform attributeName="transform" type="rotate" values="0 255 100;360 255 100" dur="1s" begin="firstAnim.end"/>
  </rect>
  
  <!-- 第三个动画对象（与第二个同时开始） -->
  <polygon points="320,85 350,85 335,115" fill="orange">
    <animateTransform attributeName="transform" type="scale" values="1;1.5;1" dur="2s" begin="secondAnim.begin"/>
    <animate attributeName="fill" values="orange;yellow;orange" dur="2s" begin="secondAnim.begin"/>
  </polygon>
  
  <!-- 最终动画（所有动画完成后触发） -->
  <text x="400" y="105" font-size="16" fill="green" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="secondAnim.end + 1s"/>
    完成！
  </text>
</svg>
```

## 🔄 动画循环和重复

### 复杂重复模式

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 无限重复 -->
  <rect x="50" y="50" width="60" height="60" fill="red">
    <animate attributeName="x" values="50;150;50" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="100" y="130" text-anchor="middle" font-size="12">无限重复</text>
  
  <!-- 指定重复次数 -->
  <circle cx="100" cy="200" r="25" fill="blue">
    <animate attributeName="cx" values="100;200;100" dur="1s" repeatCount="3"/>
  </circle>
  <text x="150" y="250" text-anchor="middle" font-size="12">重复3次</text>
  
  <!-- 部分重复时间 -->
  <rect x="250" y="50" width="60" height="60" fill="green">
    <animate attributeName="y" values="50;150;50" dur="3s" repeatCount="2.5"/>
  </rect>
  <text x="280" y="180" text-anchor="middle" font-size="12">重复2.5次</text>
  
  <!-- 重复持续时间 -->
  <polygon points="350,75 380,100 350,125 320,100" fill="purple">
    <animateTransform attributeName="transform" type="rotate" values="0 350 100;360 350 100" dur="1s" repeatDur="5s"/>
  </polygon>
  <text x="350" y="150" text-anchor="middle" font-size="12">持续5秒</text>
</svg>
```

### 往返动画

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- 普通动画 -->
  <rect x="50" y="50" width="40" height="40" fill="red">
    <animate attributeName="x" from="50" to="250" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="150" y="110" text-anchor="middle" font-size="12">普通重复</text>
  
  <!-- 往返动画 -->
  <rect x="50" y="120" width="40" height="40" fill="blue">
    <animate attributeName="x" from="50" to="250" dur="2s" repeatCount="indefinite" 
             values="50;250;50"/>
  </rect>
  <text x="150" y="180" text-anchor="middle" font-size="12">往返动画</text>
</svg>
```

## 🛠️ 兼容性和降级

### 检测SMIL支持

```javascript
// 检测浏览器是否支持SMIL动画
function supportsSMIL() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  
  return typeof animate.beginElement === 'function';
}

// 根据支持情况提供降级方案
if (supportsSMIL()) {
  console.log('支持SMIL动画');
} else {
  console.log('不支持SMIL动画，使用CSS动画或JavaScript替代');
  // 实现降级方案
  implementFallback();
}

function implementFallback() {
  // 用CSS动画替代SMIL动画
  const style = document.createElement('style');
  style.textContent = `
    .smil-fallback {
      animation: smil-replacement 2s infinite;
    }
    
    @keyframes smil-replacement {
      0% { transform: translateX(0); }
      50% { transform: translateX(100px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
  
  // 为需要降级的元素添加CSS类
  document.querySelectorAll('[data-smil-fallback]').forEach(element => {
    element.classList.add('smil-fallback');
  });
}
```

### 渐进增强方案

```html
<svg width="300" height="150" viewBox="0 0 300 150">
  <!-- 基础静态状态 -->
  <rect x="50" y="50" width="60" height="60" fill="blue" class="animated-rect" data-smil-fallback>
    <!-- SMIL动画（支持的浏览器使用） -->
    <animate attributeName="x" values="50;200;50" dur="3s" repeatCount="indefinite"/>
  </rect>
</svg>

<style>
/* CSS降级动画 */
@supports not (animation-name: test) {
  .animated-rect {
    animation: rect-move 3s infinite;
  }
}

@keyframes rect-move {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(150px); }
}

/* 针对不支持动画的浏览器 */
@media (prefers-reduced-motion: reduce) {
  .animated-rect,
  .animated-rect animate {
    animation: none !important;
  }
}
</style>
```

## 📝 实用应用案例

### 图表动画

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 柱状图动画 -->
  <rect x="50" y="250" width="30" height="0" fill="#3498db">
    <animate attributeName="height" from="0" to="100" dur="1s" begin="0s"/>
    <animate attributeName="y" from="250" to="150" dur="1s" begin="0s"/>
  </rect>
  
  <rect x="100" y="250" width="30" height="0" fill="#e74c3c">
    <animate attributeName="height" from="0" to="150" dur="1s" begin="0.2s"/>
    <animate attributeName="y" from="250" to="100" dur="1s" begin="0.2s"/>
  </rect>
  
  <rect x="150" y="250" width="30" height="0" fill="#2ecc71">
    <animate attributeName="height" from="0" to="80" dur="1s" begin="0.4s"/>
    <animate attributeName="y" from="250" to="170" dur="1s" begin="0.4s"/>
  </rect>
  
  <rect x="200" y="250" width="30" height="0" fill="#f39c12">
    <animate attributeName="height" from="0" to="120" dur="1s" begin="0.6s"/>
    <animate attributeName="y" from="250" to="130" dur="1s" begin="0.6s"/>
  </rect>
  
  <!-- 坐标轴 -->
  <line x1="40" y1="50" x2="40" y2="250" stroke="black" stroke-width="2"/>
  <line x1="40" y1="250" x2="250" y2="250" stroke="black" stroke-width="2"/>
  
  <!-- 标题动画 -->
  <text x="150" y="30" text-anchor="middle" font-size="16" font-weight="bold" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1s"/>
    销售数据图表
  </text>
</svg>
```

### 交互式用户界面

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <!-- 可折叠面板 -->
  <g id="collapsiblePanel">
    <!-- 标题栏 -->
    <rect x="50" y="50" width="300" height="40" fill="#34495e" style="cursor:pointer;" rx="5"/>
    <text x="60" y="75" font-size="14" fill="white" style="pointer-events:none;">点击展开/折叠</text>
    
    <!-- 展开指示器 -->
    <polygon id="arrow" points="340,65 350,70 340,75" fill="white" transform-origin="345 70">
      <animateTransform attributeName="transform" type="rotate" 
                        values="0 345 70;90 345 70" dur="0.3s" 
                        begin="collapsiblePanel.click" end="collapsiblePanel.click"/>
    </polygon>
    
    <!-- 内容区域 -->
    <rect x="50" y="90" width="300" height="0" fill="#ecf0f1" rx="0 0 5 5">
      <animate attributeName="height" values="0;80;0" dur="0.5s" 
               begin="collapsiblePanel.click" end="collapsiblePanel.click"/>
    </rect>
    
    <!-- 内容文本 -->
    <text x="60" y="110" font-size="12" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.5s" 
               begin="collapsiblePanel.click" end="collapsiblePanel.click"/>
      这里是面板的内容区域
    </text>
    <text x="60" y="130" font-size="12" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur="0.5s" 
               begin="collapsiblePanel.click" end="collapsiblePanel.click"/>
      可以包含任何内容
    </text>
  </g>
</svg>
```

## 🎯 总结

SMIL动画为SVG提供了强大的原生动画能力。通过掌握时间控制、事件触发、动画同步等技术，您可以创建复杂而流畅的动画效果。

### 关键要点：
1. **理解SMIL动画的四种基本元素**
2. **掌握时间控制和事件触发机制**
3. **学会创建动画链和同步效果**
4. **处理浏览器兼容性问题**
5. **提供适当的降级方案**

### 最佳实践：
- 合理使用动画元素，避免过度复杂
- 提供用户控制动画的选项
- 考虑性能影响和电池消耗
- 测试不同浏览器的支持情况
- 为不支持的浏览器提供降级方案

继续学习[JavaScript与SVG](03-javascript-svg.md)，探索更灵活的动态控制技术。 