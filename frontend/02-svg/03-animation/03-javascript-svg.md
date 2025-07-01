# JavaScript与SVG

JavaScript为SVG带来了无限的动态控制可能。本章将深入探讨如何使用JavaScript操作SVG元素、创建交互效果、动态生成图形以及构建数据驱动的可视化。

## 🎯 学习目标

完成本章学习后，您将能够：
- 掌握JavaScript操作SVG DOM的方法
- 创建响应用户交互的动态效果
- 实现数据驱动的动态图形生成
- 构建复杂的交互式可视化应用
- 优化JavaScript动画性能

## 🔧 SVG DOM操作基础

### 创建和操作SVG元素

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .container { padding: 20px; }
  .controls { margin: 20px 0; }
  button { margin: 5px; padding: 8px 16px; }
</style>
</head>
<body>
  <div class="container">
    <svg id="dynamicSVG" width="400" height="300" viewBox="0 0 400 300" style="border: 1px solid #ddd;">
      <!-- 动态内容将在这里生成 -->
    </svg>
    
    <div class="controls">
      <button onclick="createRectangle()">创建矩形</button>
      <button onclick="createCircle()">创建圆形</button>
      <button onclick="createPath()">创建路径</button>
      <button onclick="clearSVG()">清除</button>
    </div>
  </div>

  <script>
    // SVG命名空间
    const SVG_NS = 'http://www.w3.org/2000/svg';
    
    function createRectangle() {
      const svg = document.getElementById('dynamicSVG');
      
      // 创建矩形元素
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', Math.random() * 300);
      rect.setAttribute('y', Math.random() * 200);
      rect.setAttribute('width', 50 + Math.random() * 50);
      rect.setAttribute('height', 50 + Math.random() * 50);
      rect.setAttribute('fill', getRandomColor());
      rect.setAttribute('stroke', '#333');
      rect.setAttribute('stroke-width', '2');
      
      // 添加交互事件
      rect.addEventListener('click', function() {
        this.setAttribute('fill', getRandomColor());
      });
      
      rect.addEventListener('mouseover', function() {
        this.style.opacity = '0.7';
      });
      
      rect.addEventListener('mouseout', function() {
        this.style.opacity = '1';
      });
      
      svg.appendChild(rect);
    }
    
    function createCircle() {
      const svg = document.getElementById('dynamicSVG');
      
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', Math.random() * 400);
      circle.setAttribute('cy', Math.random() * 300);
      circle.setAttribute('r', 20 + Math.random() * 30);
      circle.setAttribute('fill', getRandomColor());
      circle.setAttribute('stroke', '#333');
      circle.setAttribute('stroke-width', '2');
      
      // 点击删除功能
      circle.addEventListener('click', function() {
        this.remove();
      });
      
      svg.appendChild(circle);
    }
    
    function createPath() {
      const svg = document.getElementById('dynamicSVG');
      
      // 生成随机路径
      const startX = Math.random() * 300;
      const startY = Math.random() * 200;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = startY + (Math.random() - 0.5) * 200;
      const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * 100;
      const cpY = (startY + endY) / 2 + (Math.random() - 0.5) * 100;
      
      const pathData = `M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`;
      
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', getRandomColor());
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linecap', 'round');
      
      svg.appendChild(path);
    }
    
    function clearSVG() {
      const svg = document.getElementById('dynamicSVG');
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
    }
    
    function getRandomColor() {
      const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  </script>
</body>
</html>
```

### 属性操作和样式控制

```javascript
// 获取SVG元素
const svgElement = document.querySelector('#mySVG');
const rect = document.querySelector('#myRect');

// 属性操作
rect.setAttribute('fill', '#ff6b6b');
rect.setAttribute('width', '100');
rect.setAttribute('height', '80');

// 获取属性值
const fillColor = rect.getAttribute('fill');
const width = rect.getAttribute('width');

// 样式操作
rect.style.opacity = '0.7';
rect.style.transform = 'rotate(45deg)';
rect.style.transition = 'all 0.3s ease';

// 类名操作
rect.classList.add('highlighted');
rect.classList.remove('hidden');
rect.classList.toggle('active');

// 数据属性
rect.dataset.value = '100';
rect.setAttribute('data-category', 'primary');
```

## 🎮 交互事件处理

### 鼠标交互

```html
<svg width="400" height="300" viewBox="0 0 400 300" id="interactiveSVG">
  <circle id="draggableCircle" cx="200" cy="150" r="30" fill="#3498db" style="cursor: move;"/>
  <rect id="hoverRect" x="50" y="50" width="80" height="60" fill="#e74c3c"/>
</svg>

<script>
// 拖拽功能
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const draggableCircle = document.getElementById('draggableCircle');

draggableCircle.addEventListener('mousedown', function(e) {
  isDragging = true;
  const svgRect = document.getElementById('interactiveSVG').getBoundingClientRect();
  const cx = parseFloat(this.getAttribute('cx'));
  const cy = parseFloat(this.getAttribute('cy'));
  
  dragOffset.x = (e.clientX - svgRect.left) - cx;
  dragOffset.y = (e.clientY - svgRect.top) - cy;
  
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    const svgRect = document.getElementById('interactiveSVG').getBoundingClientRect();
    const newX = (e.clientX - svgRect.left) - dragOffset.x;
    const newY = (e.clientY - svgRect.top) - dragOffset.y;
    
    // 边界检查
    const r = parseFloat(draggableCircle.getAttribute('r'));
    const boundedX = Math.max(r, Math.min(400 - r, newX));
    const boundedY = Math.max(r, Math.min(300 - r, newY));
    
    draggableCircle.setAttribute('cx', boundedX);
    draggableCircle.setAttribute('cy', boundedY);
  }
});

document.addEventListener('mouseup', function() {
  isDragging = false;
});

// 悬停效果
const hoverRect = document.getElementById('hoverRect');

hoverRect.addEventListener('mouseenter', function() {
  this.style.transform = 'scale(1.1)';
  this.style.transformOrigin = 'center';
  this.style.transition = 'transform 0.3s ease';
});

hoverRect.addEventListener('mouseleave', function() {
  this.style.transform = 'scale(1)';
});

// 点击波纹效果
function createRipple(e, element) {
  const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const svgRect = document.getElementById('interactiveSVG').getBoundingClientRect();
  
  const x = e.clientX - svgRect.left;
  const y = e.clientY - svgRect.top;
  
  ripple.setAttribute('cx', x);
  ripple.setAttribute('cy', y);
  ripple.setAttribute('r', '0');
  ripple.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
  ripple.style.pointerEvents = 'none';
  
  document.getElementById('interactiveSVG').appendChild(ripple);
  
  // 动画扩散
  ripple.animate([
    { r: '0', opacity: '1' },
    { r: '50', opacity: '0' }
  ], {
    duration: 600,
    easing: 'ease-out'
  }).onfinish = function() {
    ripple.remove();
  };
}

hoverRect.addEventListener('click', function(e) {
  createRipple(e, this);
});
</script>
```

### 触摸事件支持

```javascript
// 触摸事件处理（移动设备支持）
function setupTouchEvents(element) {
  let startTouch = null;
  
  element.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startTouch = e.touches[0];
    this.style.transform = 'scale(0.95)';
  });
  
  element.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (startTouch) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startTouch.clientX;
      const deltaY = touch.clientY - startTouch.clientY;
      
      // 执行拖拽逻辑
      const currentX = parseFloat(this.getAttribute('cx') || this.getAttribute('x') || 0);
      const currentY = parseFloat(this.getAttribute('cy') || this.getAttribute('y') || 0);
      
      if (this.getAttribute('cx')) {
        this.setAttribute('cx', currentX + deltaX);
        this.setAttribute('cy', currentY + deltaY);
      } else {
        this.setAttribute('x', currentX + deltaX);
        this.setAttribute('y', currentY + deltaY);
      }
      
      startTouch = touch;
    }
  });
  
  element.addEventListener('touchend', function(e) {
    e.preventDefault();
    startTouch = null;
    this.style.transform = 'scale(1)';
  });
}
```

## 📊 数据驱动可视化

### 动态图表生成

```html
<div>
  <h3>销售数据可视化</h3>
  <svg id="chartSVG" width="500" height="300" viewBox="0 0 500 300"></svg>
  <div>
    <button onclick="updateData()">更新数据</button>
    <button onclick="changeChartType('bar')">柱状图</button>
    <button onclick="changeChartType('line')">折线图</button>
    <button onclick="changeChartType('pie')">饼图</button>
  </div>
</div>

<script>
// 示例数据
let salesData = [
  { month: '1月', sales: 120, color: '#e74c3c' },
  { month: '2月', sales: 190, color: '#3498db' },
  { month: '3月', sales: 150, color: '#2ecc71' },
  { month: '4月', sales: 220, color: '#f39c12' },
  { month: '5月', sales: 180, color: '#9b59b6' },
  { month: '6月', sales: 250, color: '#1abc9c' }
];

let currentChartType = 'bar';

class SVGChart {
  constructor(containerId) {
    this.svg = document.getElementById(containerId);
    this.width = 500;
    this.height = 300;
    this.margin = { top: 20, right: 20, bottom: 60, left: 60 };
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;
  }
  
  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }
  
  drawBarChart(data) {
    this.clear();
    
    const maxValue = Math.max(...data.map(d => d.sales));
    const barWidth = this.chartWidth / data.length * 0.8;
    const barSpacing = this.chartWidth / data.length * 0.2;
    
    // 绘制坐标轴
    this.drawAxes();
    
    // 绘制柱状图
    data.forEach((item, index) => {
      const barHeight = (item.sales / maxValue) * this.chartHeight;
      const x = this.margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = this.margin.top + this.chartHeight - barHeight;
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', this.margin.top + this.chartHeight);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', 0);
      rect.setAttribute('fill', item.color);
      rect.style.cursor = 'pointer';
      
      // 添加动画
      rect.animate([
        { height: '0', y: this.margin.top + this.chartHeight },
        { height: barHeight, y: y }
      ], {
        duration: 800,
        delay: index * 100,
        easing: 'ease-out',
        fill: 'forwards'
      });
      
      // 添加交互
      rect.addEventListener('mouseover', () => {
        rect.style.opacity = '0.8';
        this.showTooltip(item, x + barWidth / 2, y);
      });
      
      rect.addEventListener('mouseout', () => {
        rect.style.opacity = '1';
        this.hideTooltip();
      });
      
      this.svg.appendChild(rect);
      
      // 添加标签
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + barWidth / 2);
      label.setAttribute('y', this.margin.top + this.chartHeight + 20);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '12');
      label.textContent = item.month;
      this.svg.appendChild(label);
    });
  }
  
  drawLineChart(data) {
    this.clear();
    this.drawAxes();
    
    const maxValue = Math.max(...data.map(d => d.sales));
    const pointSpacing = this.chartWidth / (data.length - 1);
    
    // 创建路径
    let pathData = '';
    const points = [];
    
    data.forEach((item, index) => {
      const x = this.margin.left + index * pointSpacing;
      const y = this.margin.top + this.chartHeight - (item.sales / maxValue) * this.chartHeight;
      
      points.push({ x, y, data: item });
      
      if (index === 0) {
        pathData += `M ${x},${y}`;
      } else {
        pathData += ` L ${x},${y}`;
      }
    });
    
    // 绘制线条
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#3498db');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    
    // 线条动画
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    
    path.animate([
      { strokeDashoffset: pathLength },
      { strokeDashoffset: 0 }
    ], {
      duration: 1500,
      easing: 'ease-in-out'
    });
    
    this.svg.appendChild(path);
    
    // 绘制数据点
    points.forEach((point, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '0');
      circle.setAttribute('fill', point.data.color);
      circle.style.cursor = 'pointer';
      
      // 点动画
      circle.animate([
        { r: '0' },
        { r: '6' }
      ], {
        duration: 300,
        delay: 1000 + index * 100,
        fill: 'forwards'
      });
      
      // 交互
      circle.addEventListener('mouseover', () => {
        circle.setAttribute('r', '8');
        this.showTooltip(point.data, point.x, point.y);
      });
      
      circle.addEventListener('mouseout', () => {
        circle.setAttribute('r', '6');
        this.hideTooltip();
      });
      
      this.svg.appendChild(circle);
    });
  }
  
  drawPieChart(data) {
    this.clear();
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 2 - 40;
    
    const total = data.reduce((sum, item) => sum + item.sales, 0);
    let currentAngle = -Math.PI / 2; // 从顶部开始
    
    data.forEach((item, index) => {
      const sliceAngle = (item.sales / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;
      
      // 创建路径
      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const pathData = [
        `M ${centerX},${centerY}`,
        `L ${x1},${y1}`,
        `A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}`,
        'Z'
      ].join(' ');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', item.color);
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '2');
      path.style.cursor = 'pointer';
      
      // 扇形动画
      path.style.transformOrigin = `${centerX}px ${centerY}px`;
      path.animate([
        { transform: 'scale(0)' },
        { transform: 'scale(1)' }
      ], {
        duration: 600,
        delay: index * 100,
        easing: 'ease-out'
      });
      
      // 交互
      path.addEventListener('mouseover', () => {
        path.style.transform = 'scale(1.05)';
        const labelX = centerX + (radius * 0.7) * Math.cos(currentAngle + sliceAngle / 2);
        const labelY = centerY + (radius * 0.7) * Math.sin(currentAngle + sliceAngle / 2);
        this.showTooltip(item, labelX, labelY);
      });
      
      path.addEventListener('mouseout', () => {
        path.style.transform = 'scale(1)';
        this.hideTooltip();
      });
      
      this.svg.appendChild(path);
      
      // 添加标签
      const labelX = centerX + (radius * 0.8) * Math.cos(currentAngle + sliceAngle / 2);
      const labelY = centerY + (radius * 0.8) * Math.sin(currentAngle + sliceAngle / 2);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('font-size', '12');
      label.setAttribute('fill', 'white');
      label.textContent = item.month;
      this.svg.appendChild(label);
      
      currentAngle = endAngle;
    });
  }
  
  drawAxes() {
    // X轴
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', this.margin.left);
    xAxis.setAttribute('y1', this.margin.top + this.chartHeight);
    xAxis.setAttribute('x2', this.margin.left + this.chartWidth);
    xAxis.setAttribute('y2', this.margin.top + this.chartHeight);
    xAxis.setAttribute('stroke', '#333');
    xAxis.setAttribute('stroke-width', '2');
    this.svg.appendChild(xAxis);
    
    // Y轴
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', this.margin.left);
    yAxis.setAttribute('y1', this.margin.top);
    yAxis.setAttribute('x2', this.margin.left);
    yAxis.setAttribute('y2', this.margin.top + this.chartHeight);
    yAxis.setAttribute('stroke', '#333');
    yAxis.setAttribute('stroke-width', '2');
    this.svg.appendChild(yAxis);
  }
  
  showTooltip(data, x, y) {
    this.hideTooltip();
    
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tooltip.id = 'chart-tooltip';
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - 30);
    rect.setAttribute('y', y - 25);
    rect.setAttribute('width', 60);
    rect.setAttribute('height', 20);
    rect.setAttribute('fill', 'rgba(0,0,0,0.8)');
    rect.setAttribute('rx', 4);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y - 10);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '12');
    text.textContent = `${data.sales}`;
    
    tooltip.appendChild(rect);
    tooltip.appendChild(text);
    this.svg.appendChild(tooltip);
  }
  
  hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
}

// 创建图表实例
const chart = new SVGChart('chartSVG');

// 初始化
chart.drawBarChart(salesData);

function updateData() {
  salesData.forEach(item => {
    item.sales = Math.floor(Math.random() * 300) + 50;
  });
  
  switch(currentChartType) {
    case 'bar':
      chart.drawBarChart(salesData);
      break;
    case 'line':
      chart.drawLineChart(salesData);
      break;
    case 'pie':
      chart.drawPieChart(salesData);
      break;
  }
}

function changeChartType(type) {
  currentChartType = type;
  
  switch(type) {
    case 'bar':
      chart.drawBarChart(salesData);
      break;
    case 'line':
      chart.drawLineChart(salesData);
      break;
    case 'pie':
      chart.drawPieChart(salesData);
      break;
  }
}
</script>
```

## 🎬 JavaScript动画

### 自定义动画系统

```javascript
class SVGAnimator {
  constructor() {
    this.animations = new Set();
    this.isRunning = false;
  }
  
  animate(element, properties, options = {}) {
    const {
      duration = 1000,
      easing = 'ease',
      delay = 0,
      onComplete = null
    } = options;
    
    const startTime = performance.now() + delay;
    const startValues = {};
    const targetValues = {};
    
    // 获取初始值
    for (const prop in properties) {
      startValues[prop] = this.getCurrentValue(element, prop);
      targetValues[prop] = properties[prop];
    }
    
    const animation = {
      element,
      startTime,
      duration,
      startValues,
      targetValues,
      easing,
      onComplete
    };
    
    this.animations.add(animation);
    
    if (!this.isRunning) {
      this.start();
    }
    
    return animation;
  }
  
  getCurrentValue(element, property) {
    switch (property) {
      case 'x':
      case 'y':
      case 'width':
      case 'height':
      case 'cx':
      case 'cy':
      case 'r':
        return parseFloat(element.getAttribute(property)) || 0;
      case 'opacity':
        return parseFloat(element.style.opacity || element.getAttribute('opacity')) || 1;
      case 'fill':
        return element.getAttribute('fill') || '#000000';
      default:
        return element.getAttribute(property) || 0;
    }
  }
  
  setValue(element, property, value) {
    switch (property) {
      case 'opacity':
        element.style.opacity = value;
        break;
      case 'fill':
        element.setAttribute('fill', value);
        break;
      default:
        element.setAttribute(property, value);
    }
  }
  
  interpolate(start, end, progress, easing = 'ease') {
    // 应用缓动函数
    const easedProgress = this.applyEasing(progress, easing);
    
    if (typeof start === 'number') {
      return start + (end - start) * easedProgress;
    }
    
    // 颜色插值
    if (typeof start === 'string' && start.startsWith('#')) {
      return this.interpolateColor(start, end, easedProgress);
    }
    
    return end;
  }
  
  interpolateColor(startColor, endColor, progress) {
    const start = this.hexToRgb(startColor);
    const end = this.hexToRgb(endColor);
    
    const r = Math.round(start.r + (end.r - start.r) * progress);
    const g = Math.round(start.g + (end.g - start.g) * progress);
    const b = Math.round(start.b + (end.b - start.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  applyEasing(t, easing) {
    switch (easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return 1 - Math.pow(1 - t, 2);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      default:
        return t;
    }
  }
  
  start() {
    this.isRunning = true;
    this.tick();
  }
  
  tick() {
    const currentTime = performance.now();
    const completedAnimations = [];
    
    for (const animation of this.animations) {
      if (currentTime < animation.startTime) {
        continue;
      }
      
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      // 更新所有属性
      for (const prop in animation.targetValues) {
        const currentValue = this.interpolate(
          animation.startValues[prop],
          animation.targetValues[prop],
          progress,
          animation.easing
        );
        this.setValue(animation.element, prop, currentValue);
      }
      
      // 检查动画是否完成
      if (progress >= 1) {
        completedAnimations.push(animation);
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    }
    
    // 移除完成的动画
    completedAnimations.forEach(animation => {
      this.animations.delete(animation);
    });
    
    // 继续动画循环
    if (this.animations.size > 0) {
      requestAnimationFrame(() => this.tick());
    } else {
      this.isRunning = false;
    }
  }
  
  stop(animation) {
    this.animations.delete(animation);
  }
  
  stopAll() {
    this.animations.clear();
    this.isRunning = false;
  }
}

// 使用示例
const animator = new SVGAnimator();

// 创建一个测试元素
const testCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
testCircle.setAttribute('cx', '50');
testCircle.setAttribute('cy', '50');
testCircle.setAttribute('r', '20');
testCircle.setAttribute('fill', '#e74c3c');

// 动画示例
function demonstrateAnimations() {
  // 移动动画
  animator.animate(testCircle, {
    cx: 200,
    cy: 100
  }, {
    duration: 1000,
    easing: 'ease-out'
  });
  
  // 延迟缩放动画
  animator.animate(testCircle, {
    r: 40
  }, {
    duration: 800,
    delay: 500,
    easing: 'bounce'
  });
  
  // 颜色变化
  animator.animate(testCircle, {
    fill: '#2ecc71'
  }, {
    duration: 1500,
    delay: 1000
  });
}
</script>
```

## 🎯 总结

JavaScript为SVG带来了无限的可能性，从简单的DOM操作到复杂的数据可视化，都可以通过JavaScript实现。掌握这些技术将使您能够创建真正动态和交互式的SVG应用。

### 关键要点：
1. **掌握SVG DOM操作的基本方法**
2. **理解事件处理和用户交互**
3. **学会构建数据驱动的可视化**
4. **创建高性能的动画系统**
5. **优化代码结构和性能**

### 最佳实践：
- 使用合适的命名空间创建SVG元素
- 优化动画性能，避免频繁的DOM操作
- 提供良好的用户体验和反馈
- 考虑移动设备的触摸交互
- 建立可维护的代码架构

完成第三阶段的学习后，您已经掌握了SVG动画与交互的核心技术。继续学习[第四阶段：高级应用](../04-advanced/README.md)，探索SVG在实际项目中的高级应用技术！ 