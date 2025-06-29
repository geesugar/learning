# 渐变与图案

渐变和图案是SVG创建丰富视觉效果的重要工具。本章将深入探讨线性渐变、径向渐变、图案填充的创建和应用技巧。

## 🎯 学习目标

完成本章学习后，您将能够：
- 掌握线性渐变和径向渐变的创建
- 理解渐变坐标系统和变换
- 创建复杂的图案填充
- 实现渐变和图案的动画效果
- 应用高级的视觉效果技术

## 🌈 线性渐变（Linear Gradient）

### 基础线性渐变

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 水平线性渐变 -->
    <linearGradient id="horizontal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="100%" stop-color="#4ecdc4"/>
    </linearGradient>
    
    <!-- 垂直线性渐变 -->
    <linearGradient id="vertical" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#45b7d1"/>
      <stop offset="100%" stop-color="#f9ca24"/>
    </linearGradient>
    
    <!-- 对角线渐变 -->
    <linearGradient id="diagonal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6c5ce7"/>
      <stop offset="50%" stop-color="#a29bfe"/>
      <stop offset="100%" stop-color="#fd79a8"/>
    </linearGradient>
  </defs>
  
  <rect x="20" y="20" width="100" height="80" fill="url(#horizontal)"/>
  <rect x="140" y="20" width="100" height="80" fill="url(#vertical)"/>
  <rect x="260" y="20" width="100" height="80" fill="url(#diagonal)"/>
</svg>
```

### 多色彩渐变

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <!-- 彩虹渐变 -->
    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff0000"/>
      <stop offset="16.66%" stop-color="#ff8800"/>
      <stop offset="33.33%" stop-color="#ffff00"/>
      <stop offset="50%" stop-color="#00ff00"/>
      <stop offset="66.66%" stop-color="#0088ff"/>
      <stop offset="83.33%" stop-color="#4400ff"/>
      <stop offset="100%" stop-color="#8800ff"/>
    </linearGradient>
    
    <!-- 渐变与透明度 -->
    <linearGradient id="fadeOut" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e74c3c" stop-opacity="1"/>
      <stop offset="50%" stop-color="#e74c3c" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#e74c3c" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <rect x="20" y="30" width="350" height="40" fill="url(#rainbow)"/>
  <rect x="20" y="100" width="350" height="40" fill="url(#fadeOut)"/>
</svg>
```

### 渐变坐标系统

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- objectBoundingBox (默认) -->
    <linearGradient id="boundingBox" x1="0%" y1="0%" x2="100%" y2="0%" 
                    gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#3498db"/>
      <stop offset="100%" stop-color="#e74c3c"/>
    </linearGradient>
    
    <!-- userSpaceOnUse -->
    <linearGradient id="userSpace" x1="50" y1="150" x2="250" y2="150" 
                    gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2ecc71"/>
      <stop offset="100%" stop-color="#f39c12"/>
    </linearGradient>
  </defs>
  
  <!-- 不同尺寸的矩形使用相同的boundingBox渐变 -->
  <rect x="20" y="20" width="100" height="50" fill="url(#boundingBox)"/>
  <rect x="140" y="20" width="200" height="50" fill="url(#boundingBox)"/>
  
  <!-- 不同尺寸的矩形使用相同的userSpace渐变 -->
  <rect x="20" y="100" width="100" height="100" fill="url(#userSpace)"/>
  <rect x="140" y="100" width="200" height="100" fill="url(#userSpace)"/>
</svg>
```

## 🎯 径向渐变（Radial Gradient）

### 基础径向渐变

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 中心径向渐变 -->
    <radialGradient id="center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#3498db"/>
      <stop offset="100%" stop-color="#2c3e50"/>
    </radialGradient>
    
    <!-- 偏心径向渐变 -->
    <radialGradient id="offset" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#f1c40f"/>
      <stop offset="50%" stop-color="#e67e22"/>
      <stop offset="100%" stop-color="#e74c3c"/>
    </radialGradient>
    
    <!-- 椭圆径向渐变 -->
    <radialGradient id="ellipse" cx="50%" cy="50%" rx="80%" ry="40%">
      <stop offset="0%" stop-color="#9b59b6"/>
      <stop offset="100%" stop-color="#8e44ad"/>
    </radialGradient>
  </defs>
  
  <circle cx="100" cy="100" r="80" fill="url(#center)"/>
  <circle cx="250" cy="100" r="80" fill="url(#offset)"/>
  <ellipse cx="325" cy="200" rx="60" ry="40" fill="url(#ellipse)"/>
</svg>
```

### 高级径向渐变

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 球形效果 -->
    <radialGradient id="sphere" cx="40%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="20%" stop-color="#3498db" stop-opacity="0.6"/>
      <stop offset="80%" stop-color="#2980b9"/>
      <stop offset="100%" stop-color="#1f4e79"/>
    </radialGradient>
    
    <!-- 光晕效果 -->
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f39c12"/>
      <stop offset="30%" stop-color="#f39c12" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#f39c12" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#f39c12" stop-opacity="0"/>
    </radialGradient>
    
    <!-- 内发光 -->
    <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2c3e50"/>
      <stop offset="70%" stop-color="#34495e"/>
      <stop offset="85%" stop-color="#3498db"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </radialGradient>
  </defs>
  
  <circle cx="100" cy="100" r="60" fill="url(#sphere)"/>
  <circle cx="250" cy="100" r="60" fill="url(#glow)"/>
  <circle cx="100" cy="200" r="60" fill="url(#innerGlow)"/>
</svg>
```

## 🎨 图案填充（Pattern）

### 基础图案

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 棋盘格图案 -->
    <pattern id="checkerboard" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="5" height="5" fill="black"/>
      <rect x="5" y="5" width="5" height="5" fill="black"/>
      <rect x="0" y="5" width="5" height="5" fill="white"/>
      <rect x="5" y="0" width="5" height="5" fill="white"/>
    </pattern>
    
    <!-- 圆点图案 -->
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="20" height="20" fill="#f8f9fa"/>
      <circle cx="10" cy="10" r="3" fill="#007bff"/>
    </pattern>
    
    <!-- 条纹图案 -->
    <pattern id="stripes" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="4" height="8" fill="#e74c3c"/>
      <rect x="4" y="0" width="4" height="8" fill="#c0392b"/>
    </pattern>
  </defs>
  
  <rect x="20" y="20" width="100" height="80" fill="url(#checkerboard)"/>
  <rect x="140" y="20" width="100" height="80" fill="url(#dots)"/>
  <rect x="260" y="20" width="100" height="80" fill="url(#stripes)"/>
</svg>
```

### 复杂装饰图案

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 花朵图案 -->
    <pattern id="flowers" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="40" height="40" fill="#fff8e1"/>
      <g transform="translate(20,20)">
        <circle cx="0" cy="-8" r="4" fill="#ff6b6b"/>
        <circle cx="6" cy="4" r="4" fill="#ff6b6b"/>
        <circle cx="-6" cy="4" r="4" fill="#ff6b6b"/>
        <circle cx="0" cy="0" r="3" fill="#ffd93d"/>
      </g>
    </pattern>
    
    <!-- 几何图案 -->
    <pattern id="geometry" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="30" height="30" fill="#ecf0f1"/>
      <path d="M15,5 L25,15 L15,25 L5,15 Z" fill="#3498db" opacity="0.6"/>
      <circle cx="15" cy="15" r="3" fill="#2c3e50"/>
    </pattern>
    
    <!-- 纹理图案 -->
    <pattern id="texture" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="15" height="15" fill="#34495e"/>
      <line x1="0" y1="0" x2="15" y2="15" stroke="#95a5a6" stroke-width="0.5"/>
      <line x1="15" y1="0" x2="0" y2="15" stroke="#95a5a6" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <circle cx="100" cy="130" r="60" fill="url(#flowers)"/>
  <rect x="190" y="70" width="120" height="120" fill="url(#geometry)"/>
  <polygon points="350,70 380,130 320,190 290,130" fill="url(#texture)"/>
</svg>
```

### 图案变换

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 基础图案 -->
    <pattern id="basePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="20" height="20" fill="#ecf0f1"/>
      <rect x="5" y="5" width="10" height="10" fill="#3498db"/>
    </pattern>
    
    <!-- 缩放图案 -->
    <pattern id="scaledPattern" x="0" y="0" width="20" height="20" 
             patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
      <rect x="0" y="0" width="20" height="20" fill="#ecf0f1"/>
      <rect x="5" y="5" width="10" height="10" fill="#e74c3c"/>
    </pattern>
    
    <!-- 旋转图案 -->
    <pattern id="rotatedPattern" x="0" y="0" width="20" height="20" 
             patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect x="0" y="0" width="20" height="20" fill="#ecf0f1"/>
      <rect x="5" y="5" width="10" height="10" fill="#2ecc71"/>
    </pattern>
  </defs>
  
  <rect x="20" y="50" width="100" height="100" fill="url(#basePattern)"/>
  <rect x="150" y="50" width="100" height="100" fill="url(#scaledPattern)"/>
  <rect x="280" y="50" width="100" height="100" fill="url(#rotatedPattern)"/>
</svg>
```

## 🎬 动画效果

### 渐变动画

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <!-- 动态线性渐变 -->
    <linearGradient id="animatedLinear" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3498db">
        <animate attributeName="stop-color" 
                 values="#3498db;#e74c3c;#2ecc71;#3498db" 
                 dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#2c3e50">
        <animate attributeName="stop-color" 
                 values="#2c3e50;#f39c12;#9b59b6;#2c3e50" 
                 dur="3s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    
    <!-- 动态径向渐变 -->
    <radialGradient id="animatedRadial" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#3498db">
        <animate attributeName="stop-color" 
                 values="#3498db;#e74c3c;#2ecc71;#3498db" 
                 dur="2s" repeatCount="indefinite"/>
      </stop>
      <animateTransform attributeName="gradientTransform" 
                        type="rotate" 
                        values="0 50 50;360 50 50" 
                        dur="4s" repeatCount="indefinite"/>
    </radialGradient>
  </defs>
  
  <rect x="50" y="50" width="120" height="80" fill="url(#animatedLinear)"/>
  <circle cx="280" cy="90" r="60" fill="url(#animatedRadial)"/>
</svg>
```

### 图案动画

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <defs>
    <pattern id="movingPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="20" height="20" fill="#ecf0f1"/>
      <circle cx="10" cy="10" r="5" fill="#3498db"/>
      <animateTransform attributeName="patternTransform" 
                        type="translate" 
                        values="0,0;20,0;0,0" 
                        dur="2s" repeatCount="indefinite"/>
    </pattern>
  </defs>
  
  <rect x="50" y="50" width="200" height="100" fill="url(#movingPattern)"/>
</svg>
```

## 🔧 高级技巧和应用

### 1. 渐变边框效果

```html
<style>
.gradient-border {
  padding: 3px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  border-radius: 10px;
}

.gradient-border svg {
  background: white;
  border-radius: 7px;
}
</style>

<div class="gradient-border">
  <svg width="200" height="100" viewBox="0 0 200 100">
    <rect x="10" y="10" width="180" height="80" fill="lightblue" rx="5"/>
    <text x="100" y="55" text-anchor="middle" font-size="16">渐变边框</text>
  </svg>
</div>
```

### 2. 文字渐变效果

```svg
<svg width="400" height="100" viewBox="0 0 400 100">
  <defs>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="50%" stop-color="#4ecdc4"/>
      <stop offset="100%" stop-color="#45b7d1"/>
    </linearGradient>
  </defs>
  
  <text x="200" y="60" text-anchor="middle" font-size="36" font-weight="bold" 
        fill="url(#textGradient)">渐变文字</text>
</svg>
```

### 3. 响应式渐变

```css
.responsive-gradient {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}

@media (max-width: 768px) {
  .responsive-gradient {
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  }
}

@media (prefers-color-scheme: dark) {
  .responsive-gradient {
    background: linear-gradient(45deg, #2c3e50, #34495e);
  }
}
```

### 4. 数据驱动的渐变

```javascript
// 根据数据生成渐变
function createDataGradient(data, containerId) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  
  const svg = document.getElementById(containerId);
  const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
  
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.id = 'dataGradient';
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '0%');
  
  data.forEach((value, index) => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    const offset = (index / (data.length - 1)) * 100;
    const intensity = ((value - min) / (max - min));
    const hue = intensity * 120; // 0-120度，红到绿
    
    stop.setAttribute('offset', `${offset}%`);
    stop.setAttribute('stop-color', `hsl(${hue}, 70%, 60%)`);
    gradient.appendChild(stop);
  });
  
  defs.appendChild(gradient);
}

// 使用示例
const temperatureData = [15, 18, 22, 28, 32, 29, 25, 20];
createDataGradient(temperatureData, 'temperatureChart');
```

## 📝 练习项目

### 基础练习：渐变调色板

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 各种渐变预设 -->
    <linearGradient id="sunset" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff9a9e"/>
      <stop offset="100%" stop-color="#fecfef"/>
    </linearGradient>
    
    <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#667db6"/>
      <stop offset="100%" stop-color="#0082c8"/>
    </linearGradient>
    
    <linearGradient id="forest" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#134e5e"/>
      <stop offset="100%" stop-color="#71b280"/>
    </linearGradient>
  </defs>
  
  <rect x="20" y="20" width="100" height="60" fill="url(#sunset)"/>
  <text x="70" y="95" text-anchor="middle" font-size="12">日落</text>
  
  <rect x="150" y="20" width="100" height="60" fill="url(#ocean)"/>
  <text x="200" y="95" text-anchor="middle" font-size="12">海洋</text>
  
  <rect x="280" y="20" width="100" height="60" fill="url(#forest)"/>
  <text x="330" y="95" text-anchor="middle" font-size="12">森林</text>
</svg>
```

### 中级练习：动态图案生成器

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .pattern-generator { text-align: center; padding: 20px; }
  .controls { margin: 20px 0; }
  .controls button { margin: 5px; padding: 8px 16px; }
  .pattern-display { border: 1px solid #ddd; margin: 10px auto; }
</style>
</head>
<body>
  <div class="pattern-generator">
    <svg id="patternSvg" width="300" height="200" viewBox="0 0 300 200" class="pattern-display">
      <defs id="patternDefs"></defs>
      <rect id="patternRect" x="0" y="0" width="300" height="200" fill="url(#currentPattern)"/>
    </svg>
    
    <div class="controls">
      <button onclick="generatePattern('dots')">圆点</button>
      <button onclick="generatePattern('lines')">线条</button>
      <button onclick="generatePattern('squares')">方块</button>
      <button onclick="generatePattern('random')">随机</button>
      <button onclick="animatePattern()">动画</button>
    </div>
  </div>

  <script>
    function generatePattern(type) {
      const defs = document.getElementById('patternDefs');
      defs.innerHTML = ''; // 清空现有图案
      
      const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.id = 'currentPattern';
      pattern.setAttribute('x', '0');
      pattern.setAttribute('y', '0');
      pattern.setAttribute('width', '30');
      pattern.setAttribute('height', '30');
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '30');
      bg.setAttribute('height', '30');
      bg.setAttribute('fill', '#f8f9fa');
      pattern.appendChild(bg);
      
      switch(type) {
        case 'dots':
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', '15');
          circle.setAttribute('cy', '15');
          circle.setAttribute('r', '5');
          circle.setAttribute('fill', '#007bff');
          pattern.appendChild(circle);
          break;
          
        case 'lines':
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '0');
          line.setAttribute('y1', '0');
          line.setAttribute('x2', '30');
          line.setAttribute('y2', '30');
          line.setAttribute('stroke', '#28a745');
          line.setAttribute('stroke-width', '2');
          pattern.appendChild(line);
          break;
          
        case 'squares':
          const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          square.setAttribute('x', '10');
          square.setAttribute('y', '10');
          square.setAttribute('width', '10');
          square.setAttribute('height', '10');
          square.setAttribute('fill', '#dc3545');
          pattern.appendChild(square);
          break;
          
        case 'random':
          // 随机生成多个形状
          for(let i = 0; i < 3; i++) {
            const shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            shape.setAttribute('cx', Math.random() * 30);
            shape.setAttribute('cy', Math.random() * 30);
            shape.setAttribute('r', Math.random() * 5 + 2);
            shape.setAttribute('fill', `hsl(${Math.random() * 360}, 70%, 60%)`);
            pattern.appendChild(shape);
          }
          break;
      }
      
      defs.appendChild(pattern);
    }
    
    function animatePattern() {
      const pattern = document.getElementById('currentPattern');
      if (pattern) {
        const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        animateTransform.setAttribute('attributeName', 'patternTransform');
        animateTransform.setAttribute('type', 'rotate');
        animateTransform.setAttribute('values', '0;360');
        animateTransform.setAttribute('dur', '4s');
        animateTransform.setAttribute('repeatCount', 'indefinite');
        pattern.appendChild(animateTransform);
      }
    }
    
    // 初始化显示
    generatePattern('dots');
  </script>
</body>
</html>
```

## 🎯 总结

渐变和图案是SVG创建丰富视觉效果的强大工具。通过掌握这些技术，您可以创建从简单的色彩过渡到复杂的装饰图案的各种视觉效果。

### 关键要点：
1. **理解不同类型渐变的特点和用途**
2. **掌握坐标系统和变换技术**
3. **学会创建可复用的图案库**
4. **利用动画增强视觉吸引力**
5. **结合数据创建动态视觉效果**

### 最佳实践：
- 选择合适的渐变类型和方向
- 优化图案复杂度以保证性能
- 使用语义化的ID命名
- 考虑颜色可访问性和对比度
- 为动画效果提供用户控制选项

继续学习[滤镜效果](04-filters.md)，探索更高级的视觉效果处理技术。 