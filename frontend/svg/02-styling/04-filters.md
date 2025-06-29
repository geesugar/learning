# 滤镜效果

SVG滤镜系统是创建高级视觉效果的强大工具。本章将深入探讨SVG滤镜的原理、各种滤镜效果的应用，以及如何创建自定义滤镜组合。

## 🎯 学习目标

完成本章学习后，您将能够：
- 理解SVG滤镜系统的工作原理
- 掌握常用滤镜效果的应用
- 创建复杂的滤镜组合效果
- 优化滤镜性能和兼容性
- 实现交互式滤镜效果

## 🔧 滤镜系统基础

### 滤镜基本结构

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 基础滤镜定义 -->
    <filter id="basicFilter" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
    </filter>
  </defs>
  
  <!-- 应用滤镜 -->
  <rect x="50" y="50" width="100" height="100" fill="blue" filter="url(#basicFilter)"/>
  <rect x="200" y="50" width="100" height="100" fill="red"/> <!-- 对比用的无滤镜矩形 -->
</svg>
```

### 滤镜坐标系统

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <!-- 滤镜区域控制 -->
    <filter id="expandedFilter" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="10" dy="10" stdDeviation="5" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
  </defs>
  
  <circle cx="100" cy="100" r="50" fill="orange" filter="url(#expandedFilter)"/>
  <text x="200" y="100" font-size="14">滤镜区域需要足够大以容纳效果</text>
</svg>
```

## 🌟 常用滤镜效果

### 1. 高斯模糊（feGaussianBlur）

```svg
<svg width="500" height="200" viewBox="0 0 500 200">
  <defs>
    <filter id="blur1" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
    </filter>
    
    <filter id="blur2" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
    </filter>
    
    <filter id="blur3" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10"/>
    </filter>
  </defs>
  
  <rect x="20" y="50" width="80" height="80" fill="blue"/>
  <rect x="130" y="50" width="80" height="80" fill="blue" filter="url(#blur1)"/>
  <rect x="240" y="50" width="80" height="80" fill="blue" filter="url(#blur2)"/>
  <rect x="350" y="50" width="80" height="80" fill="blue" filter="url(#blur3)"/>
  
  <text x="60" y="150" text-anchor="middle" font-size="12">原图</text>
  <text x="170" y="150" text-anchor="middle" font-size="12">轻微模糊</text>
  <text x="280" y="150" text-anchor="middle" font-size="12">中度模糊</text>
  <text x="390" y="150" text-anchor="middle" font-size="12">重度模糊</text>
</svg>
```

### 2. 阴影效果（feDropShadow）

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 基础阴影 -->
    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="5" dy="5" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    
    <!-- 彩色阴影 -->
    <filter id="colorShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="8" dy="8" stdDeviation="4" flood-color="#ff6b6b"/>
    </filter>
    
    <!-- 内阴影效果 -->
    <filter id="innerShadow" x="0%" y="0%" width="100%" height="100%">
      <feFlood flood-color="rgba(0,0,0,0.5)"/>
      <feComposite in="SourceGraphic" operator="out"/>
      <feGaussianBlur stdDeviation="3"/>
      <feOffset dx="2" dy="2"/>
      <feComposite in="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  
  <rect x="50" y="50" width="80" height="80" fill="lightblue" filter="url(#dropShadow)"/>
  <circle cx="220" cy="90" r="40" fill="lightcoral" filter="url(#colorShadow)"/>
  <rect x="280" y="50" width="80" height="80" fill="lightgreen" filter="url(#innerShadow)"/>
</svg>
```

### 3. 发光效果（feGaussianBlur + feColorMatrix）

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <!-- 外发光 -->
    <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- 霓虹灯效果 -->
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feColorMatrix in="coloredBlur" values="1 0 1 0 0  0 1 1 0 0  1 0 1 0 0  0 0 0 1 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect x="50" y="60" width="100" height="60" fill="#4ecdc4" filter="url(#outerGlow)"/>
  <text x="250" y="100" font-size="24" font-weight="bold" fill="#ff6b6b" filter="url(#neonGlow)">NEON</text>
</svg>
```

### 4. 材质效果（feTexture + feTurbulence）

```svg
<svg width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <!-- 纸张纹理 -->
    <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise"/>
      <feColorMatrix in="noise" values="0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 1 0"/>
      <feComposite operator="multiply" in2="SourceGraphic"/>
    </filter>
    
    <!-- 金属纹理 -->
    <filter id="metalTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence baseFrequency="0.1" numOctaves="3" result="noise"/>
      <feColorMatrix in="noise" values="0.5 0.5 0.5 0 0.2  0.5 0.5 0.5 0 0.2  0.5 0.5 0.5 0 0.2  0 0 0 1 0"/>
      <feComposite operator="multiply" in2="SourceGraphic"/>
    </filter>
    
    <!-- 云朵效果 -->
    <filter id="cloudTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence baseFrequency="0.02" numOctaves="4" result="noise"/>
      <feColorMatrix in="noise" values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 1 0"/>
    </filter>
  </defs>
  
  <rect x="20" y="20" width="100" height="80" fill="white" filter="url(#paperTexture)"/>
  <text x="70" y="115" text-anchor="middle" font-size="12">纸张纹理</text>
  
  <rect x="150" y="20" width="100" height="80" fill="silver" filter="url(#metalTexture)"/>
  <text x="200" y="115" text-anchor="middle" font-size="12">金属纹理</text>
  
  <rect x="280" y="20" width="100" height="80" fill="lightblue" filter="url(#cloudTexture)"/>
  <text x="330" y="115" text-anchor="middle" font-size="12">云朵效果</text>
</svg>
```

### 5. 颜色变换（feColorMatrix）

```svg
<svg width="500" height="200" viewBox="0 0 500 200">
  <defs>
    <!-- 灰度效果 -->
    <filter id="grayscale">
      <feColorMatrix values="0.3333 0.3333 0.3333 0 0
                             0.3333 0.3333 0.3333 0 0
                             0.3333 0.3333 0.3333 0 0
                             0      0      0      1 0"/>
    </filter>
    
    <!-- 棕褐色调 -->
    <filter id="sepia">
      <feColorMatrix values="0.393 0.769 0.189 0 0
                             0.349 0.686 0.168 0 0
                             0.272 0.534 0.131 0 0
                             0     0     0     1 0"/>
    </filter>
    
    <!-- 高对比度 -->
    <filter id="highContrast">
      <feColorMatrix values="1.5 0   0   0 -0.25
                             0   1.5 0   0 -0.25
                             0   0   1.5 0 -0.25
                             0   0   0   1  0"/>
    </filter>
    
    <!-- 反色效果 -->
    <filter id="invert">
      <feColorMatrix values="-1  0  0 0 1
                              0 -1  0 0 1
                              0  0 -1 0 1
                              0  0  0 1 0"/>
    </filter>
  </defs>
  
  <!-- 原始图像 -->
  <g>
    <rect x="10" y="20" width="60" height="60" fill="#ff6b6b"/>
    <circle cx="55" cy="50" r="15" fill="#4ecdc4"/>
    <text x="40" y="100" text-anchor="middle" font-size="10">原图</text>
  </g>
  
  <!-- 应用各种滤镜 -->
  <g filter="url(#grayscale)">
    <rect x="110" y="20" width="60" height="60" fill="#ff6b6b"/>
    <circle cx="155" cy="50" r="15" fill="#4ecdc4"/>
    <text x="140" y="100" text-anchor="middle" font-size="10">灰度</text>
  </g>
  
  <g filter="url(#sepia)">
    <rect x="210" y="20" width="60" height="60" fill="#ff6b6b"/>
    <circle cx="255" cy="50" r="15" fill="#4ecdc4"/>
    <text x="240" y="100" text-anchor="middle" font-size="10">棕褐色</text>
  </g>
  
  <g filter="url(#highContrast)">
    <rect x="310" y="20" width="60" height="60" fill="#ff6b6b"/>
    <circle cx="355" cy="50" r="15" fill="#4ecdc4"/>
    <text x="340" y="100" text-anchor="middle" font-size="10">高对比度</text>
  </g>
  
  <g filter="url(#invert)">
    <rect x="410" y="20" width="60" height="60" fill="#ff6b6b"/>
    <circle cx="455" cy="50" r="15" fill="#4ecdc4"/>
    <text x="440" y="100" text-anchor="middle" font-size="10">反色</text>
  </g>
</svg>
```

## 🎨 复合滤镜效果

### 复杂阴影组合

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <!-- 多重阴影效果 -->
    <filter id="multiShadow" x="-100%" y="-100%" width="300%" height="300%">
      <!-- 第一层阴影 -->
      <feDropShadow dx="2" dy="2" stdDeviation="1" flood-color="rgba(0,0,0,0.6)" result="shadow1"/>
      <!-- 第二层阴影 -->
      <feDropShadow in="shadow1" dx="6" dy="6" stdDeviation="3" flood-color="rgba(0,0,0,0.4)" result="shadow2"/>
      <!-- 第三层阴影 -->
      <feDropShadow in="shadow2" dx="12" dy="12" stdDeviation="8" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
    
    <!-- 浮雕效果 -->
    <filter id="emboss" x="0%" y="0%" width="100%" height="100%">
      <feConvolveMatrix order="3" kernelMatrix="1 1 0  1 0 -1  0 -1 -1"/>
      <feOffset dx="1" dy="1"/>
      <feColorMatrix values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 1 0"/>
      <feComposite operator="multiply" in2="SourceGraphic"/>
    </filter>
  </defs>
  
  <text x="100" y="80" font-size="24" font-weight="bold" fill="#4ecdc4" filter="url(#multiShadow)">多重阴影</text>
  <rect x="250" y="50" width="100" height="60" fill="lightgray" filter="url(#emboss)"/>
</svg>
```

### 玻璃效果

```svg
<svg width="300" height="200" viewBox="0 0 300 200">
  <defs>
    <!-- 玻璃质感滤镜 -->
    <filter id="glassEffect" x="0%" y="0%" width="100%" height="100%">
      <!-- 创建高光 -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-1" dy="-1" result="highlight"/>
      <feFlood flood-color="rgba(255,255,255,0.6)" result="white"/>
      <feComposite in="white" in2="highlight" operator="in" result="highlightFinal"/>
      
      <!-- 创建阴影 -->
      <feOffset in="SourceAlpha" dx="1" dy="1" result="shadow"/>
      <feFlood flood-color="rgba(0,0,0,0.3)" result="black"/>
      <feComposite in="black" in2="shadow" operator="in" result="shadowFinal"/>
      
      <!-- 合并效果 -->
      <feMerge>
        <feMergeNode in="shadowFinal"/>
        <feMergeNode in="SourceGraphic"/>
        <feMergeNode in="highlightFinal"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect x="50" y="50" width="200" height="100" fill="rgba(135,206,235,0.7)" 
        stroke="rgba(255,255,255,0.5)" stroke-width="1" 
        filter="url(#glassEffect)" rx="10"/>
  <text x="150" y="105" text-anchor="middle" font-size="16" fill="white">玻璃效果</text>
</svg>
```

## 🚀 性能优化

### 滤镜性能考虑

```svg
<svg width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <!-- 优化的滤镜：较小的区域和简单的效果 -->
    <filter id="optimized" x="0%" y="0%" width="120%" height="120%">
      <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    
    <!-- 过度复杂的滤镜（避免使用） -->
    <filter id="complex" x="-100%" y="-100%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="10" result="blur1"/>
      <feOffset dx="20" dy="20" result="offset1"/>
      <feGaussianBlur in="offset1" stdDeviation="15" result="blur2"/>
      <feOffset in="blur2" dx="30" dy="30" result="offset2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect x="50" y="50" width="80" height="80" fill="green" filter="url(#optimized)"/>
  <text x="90" y="150" text-anchor="middle" font-size="12">优化版本</text>
  
  <!-- 注释掉复杂滤镜以避免性能问题 -->
  <!-- <rect x="200" y="50" width="80" height="80" fill="red" filter="url(#complex)"/> -->
  <rect x="200" y="50" width="80" height="80" fill="red" opacity="0.5"/>
  <text x="240" y="150" text-anchor="middle" font-size="12">避免过度复杂</text>
</svg>
```

## 📱 响应式和兼容性

### 条件滤镜应用

```html
<style>
/* 基础样式 */
.filtered-element {
  transition: filter 0.3s ease;
}

/* 支持滤镜的浏览器 */
@supports (filter: blur(1px)) {
  .filtered-element:hover {
    filter: url(#hoverFilter);
  }
}

/* 降级处理 */
@supports not (filter: blur(1px)) {
  .filtered-element:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .filtered-element {
    transition: none;
  }
}
</style>

<svg width="200" height="100" viewBox="0 0 200 100">
  <defs>
    <filter id="hoverFilter" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur stdDeviation="1"/>
    </filter>
  </defs>
  
  <rect x="50" y="25" width="100" height="50" fill="lightblue" class="filtered-element"/>
</svg>
```

## 🎯 实用应用案例

### 图像滤镜画廊

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .filter-gallery { display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
  .filter-item { text-align: center; cursor: pointer; transition: transform 0.3s; }
  .filter-item:hover { transform: scale(1.05); }
  .filter-name { margin-top: 10px; font-size: 14px; }
</style>
</head>
<body>
  <div class="filter-gallery">
    <div class="filter-item" onclick="applyFilter('none')">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="10" y="10" width="60" height="60" fill="#ff6b6b"/>
        <circle cx="40" cy="40" r="15" fill="#4ecdc4"/>
      </svg>
      <div class="filter-name">原图</div>
    </div>
    
    <div class="filter-item" onclick="applyFilter('blur')">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <filter id="galleryBlur">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
        </defs>
        <g filter="url(#galleryBlur)">
          <rect x="10" y="10" width="60" height="60" fill="#ff6b6b"/>
          <circle cx="40" cy="40" r="15" fill="#4ecdc4"/>
        </g>
      </svg>
      <div class="filter-name">模糊</div>
    </div>
    
    <!-- 更多滤镜项... -->
  </div>

  <script>
    function applyFilter(filterType) {
      const targetElement = document.getElementById('targetImage');
      switch(filterType) {
        case 'none':
          targetElement.style.filter = 'none';
          break;
        case 'blur':
          targetElement.style.filter = 'blur(3px)';
          break;
        // 更多滤镜类型...
      }
    }
  </script>
</body>
</html>
```

## 📝 练习项目

### 交互式滤镜编辑器

```html
<!DOCTYPE html>
<html>
<head>
<style>
  .filter-editor { max-width: 600px; margin: 20px auto; }
  .preview { text-align: center; margin: 20px 0; }
  .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
  .control-group { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
  .control-group label { display: block; margin-bottom: 5px; font-weight: bold; }
  .control-group input { width: 100%; }
  .value-display { font-size: 12px; color: #666; }
</style>
</head>
<body>
  <div class="filter-editor">
    <div class="preview">
      <svg id="filterPreview" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <filter id="dynamicFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur id="blurFilter" stdDeviation="0"/>
            <feDropShadow id="shadowFilter" dx="0" dy="0" stdDeviation="0" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        <rect x="50" y="50" width="100" height="100" fill="#4ecdc4" filter="url(#dynamicFilter)"/>
        <circle cx="100" cy="100" r="30" fill="#ff6b6b" filter="url(#dynamicFilter)"/>
      </svg>
    </div>
    
    <div class="controls">
      <div class="control-group">
        <label for="blurRange">模糊程度</label>
        <input type="range" id="blurRange" min="0" max="10" value="0" step="0.5">
        <div class="value-display" id="blurValue">0</div>
      </div>
      
      <div class="control-group">
        <label for="shadowX">阴影X偏移</label>
        <input type="range" id="shadowX" min="-20" max="20" value="0">
        <div class="value-display" id="shadowXValue">0</div>
      </div>
      
      <div class="control-group">
        <label for="shadowY">阴影Y偏移</label>
        <input type="range" id="shadowY" min="-20" max="20" value="0">
        <div class="value-display" id="shadowYValue">0</div>
      </div>
      
      <div class="control-group">
        <label for="shadowBlur">阴影模糊</label>
        <input type="range" id="shadowBlur" min="0" max="10" value="0" step="0.5">
        <div class="value-display" id="shadowBlurValue">0</div>
      </div>
    </div>
  </div>

  <script>
    // 实时更新滤镜效果
    function updateFilter() {
      const blurValue = document.getElementById('blurRange').value;
      const shadowX = document.getElementById('shadowX').value;
      const shadowY = document.getElementById('shadowY').value;
      const shadowBlur = document.getElementById('shadowBlur').value;
      
      // 更新滤镜元素
      document.getElementById('blurFilter').setAttribute('stdDeviation', blurValue);
      document.getElementById('shadowFilter').setAttribute('dx', shadowX);
      document.getElementById('shadowFilter').setAttribute('dy', shadowY);
      document.getElementById('shadowFilter').setAttribute('stdDeviation', shadowBlur);
      
      // 更新显示值
      document.getElementById('blurValue').textContent = blurValue;
      document.getElementById('shadowXValue').textContent = shadowX;
      document.getElementById('shadowYValue').textContent = shadowY;
      document.getElementById('shadowBlurValue').textContent = shadowBlur;
    }
    
    // 绑定事件监听器
    document.getElementById('blurRange').addEventListener('input', updateFilter);
    document.getElementById('shadowX').addEventListener('input', updateFilter);
    document.getElementById('shadowY').addEventListener('input', updateFilter);
    document.getElementById('shadowBlur').addEventListener('input', updateFilter);
  </script>
</body>
</html>
```

## 🎯 总结

SVG滤镜是创建高级视觉效果的强大工具。通过理解滤镜系统的原理和掌握各种滤镜效果的应用，您可以创建出令人印象深刻的视觉效果。

### 关键要点：
1. **理解滤镜坐标系统和区域控制**
2. **掌握常用滤镜效果的参数调节**
3. **学会组合多个滤镜创建复杂效果**
4. **注意性能优化和浏览器兼容性**
5. **提供适当的降级方案**

### 最佳实践：
- 适度使用滤镜，避免过度复杂
- 合理设置滤镜区域大小
- 考虑移动设备性能限制
- 测试不同浏览器的兼容性
- 为用户提供关闭动画的选项

完成第二阶段的学习后，您已经掌握了SVG样式控制的核心技术。继续学习[第三阶段：动画与交互](../03-animation/README.md)，让您的SVG图形动起来！ 