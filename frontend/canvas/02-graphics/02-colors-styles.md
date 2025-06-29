# Canvas颜色与样式系统

> 掌握Canvas丰富的颜色系统和样式效果，创造视觉震撼的图形作品。

## 🎯 学习目标

- 深入理解Canvas颜色系统和格式
- 掌握线性和径向渐变的创建技巧
- 学会使用图案填充和自定义纹理
- 熟练运用阴影和全局合成操作
- 构建动态样式系统

## 🎨 颜色系统详解

### 颜色格式全览
```javascript
// 十六进制颜色
ctx.fillStyle = '#FF5733';
ctx.fillStyle = '#F53'; // 简写形式

// RGB和RGBA
ctx.fillStyle = 'rgb(255, 87, 51)';
ctx.fillStyle = 'rgba(255, 87, 51, 0.8)'; // 80%透明度

// HSL和HSLA
ctx.fillStyle = 'hsl(9, 100%, 60%)';
ctx.fillStyle = 'hsla(9, 100%, 60%, 0.8)';

// 颜色名称
ctx.fillStyle = 'red';
ctx.fillStyle = 'transparent';

// 演示不同格式
function drawColorFormats() {
    const colors = [
        '#3498DB', 'rgb(52, 152, 219)', 'hsl(204, 70%, 53%)', 
        '#E74C3C', 'rgba(231, 76, 60, 0.7)', 'hsla(6, 78%, 57%, 0.7)'
    ];
    
    colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(50 + index * 100, 50, 80, 80);
        
        // 标签
        ctx.fillStyle = '#2C3E50';
        ctx.font = '12px Arial';
        ctx.fillText(color.substring(0, 15), 50 + index * 100, 150);
    });
}

drawColorFormats();
```

### 颜色空间转换
```javascript
class ColorConverter {
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    
    static hslToString(h, s, l, alpha = 1) {
        return alpha < 1 ?
            `hsla(${h}, ${s}%, ${l}%, ${alpha})` :
            `hsl(${h}, ${s}%, ${l}%)`;
    }
}

// 使用示例
const hexColor = '#3498DB';
const rgb = ColorConverter.hexToRgb(hexColor);
const hsl = ColorConverter.rgbToHsl(rgb.r, rgb.g, rgb.b);

console.log('RGB:', rgb);
console.log('HSL:', hsl);
```

## 🌈 渐变系统

### 线性渐变
```javascript
function createLinearGradients() {
    // 基础线性渐变
    const gradient1 = ctx.createLinearGradient(0, 0, 200, 0);
    gradient1.addColorStop(0, '#3498DB');
    gradient1.addColorStop(1, '#E74C3C');
    
    ctx.fillStyle = gradient1;
    ctx.fillRect(50, 50, 200, 100);
    
    // 多色渐变
    const gradient2 = ctx.createLinearGradient(0, 200, 200, 200);
    gradient2.addColorStop(0, '#9B59B6');
    gradient2.addColorStop(0.25, '#3498DB');
    gradient2.addColorStop(0.5, '#1ABC9C');
    gradient2.addColorStop(0.75, '#F1C40F');
    gradient2.addColorStop(1, '#E74C3C');
    
    ctx.fillStyle = gradient2;
    ctx.fillRect(50, 200, 200, 100);
    
    // 对角渐变
    const gradient3 = ctx.createLinearGradient(300, 50, 500, 150);
    gradient3.addColorStop(0, 'rgba(52, 152, 219, 1)');
    gradient3.addColorStop(0.5, 'rgba(155, 89, 182, 0.8)');
    gradient3.addColorStop(1, 'rgba(231, 76, 60, 0.6)');
    
    ctx.fillStyle = gradient3;
    ctx.fillRect(300, 50, 200, 100);
}

createLinearGradients();
```

### 径向渐变
```javascript
function createRadialGradients() {
    // 同心圆渐变
    const gradient1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 100);
    gradient1.addColorStop(0, '#F1C40F');
    gradient1.addColorStop(0.7, '#E67E22');
    gradient1.addColorStop(1, '#E74C3C');
    
    ctx.fillStyle = gradient1;
    ctx.fillRect(50, 50, 200, 200);
    
    // 偏心渐变
    const gradient2 = ctx.createRadialGradient(350, 100, 20, 400, 150, 100);
    gradient2.addColorStop(0, '#FFFFFF');
    gradient2.addColorStop(0.3, '#3498DB');
    gradient2.addColorStop(1, '#2C3E50');
    
    ctx.fillStyle = gradient2;
    ctx.fillRect(300, 50, 200, 200);
    
    // 聚光灯效果
    const gradient3 = ctx.createRadialGradient(600, 150, 0, 600, 150, 80);
    gradient3.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient3.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)');
    gradient3.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // 黑色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(550, 50, 100, 200);
    
    // 聚光灯
    ctx.fillStyle = gradient3;
    ctx.fillRect(550, 50, 100, 200);
}

createRadialGradients();
```

### 动态渐变
```javascript
class AnimatedGradient {
    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.time = 0;
    }
    
    update() {
        this.time += 0.02;
        
        // 动态线性渐变
        const angle = this.time;
        const x1 = this.x + Math.cos(angle) * this.width * 0.5;
        const y1 = this.y + Math.sin(angle) * this.height * 0.5;
        const x2 = this.x + Math.cos(angle + Math.PI) * this.width * 0.5;
        const y2 = this.y + Math.sin(angle + Math.PI) * this.height * 0.5;
        
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        
        // 动态颜色
        const hue1 = (this.time * 50) % 360;
        const hue2 = (hue1 + 120) % 360;
        const hue3 = (hue1 + 240) % 360;
        
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 60%)`);
        gradient.addColorStop(0.5, `hsl(${hue2}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${hue3}, 70%, 60%)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 使用动态渐变
const animGrad = new AnimatedGradient(ctx, 100, 100, 200, 150);

function animateGradient() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animGrad.update();
    requestAnimationFrame(animateGradient);
}

animateGradient();
```

## 🎭 图案填充

### 基础图案
```javascript
function createBasicPatterns() {
    // 创建图案画布
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    const patternCtx = patternCanvas.getContext('2d');
    
    // 绘制棋盘图案
    patternCtx.fillStyle = '#3498DB';
    patternCtx.fillRect(0, 0, 10, 10);
    patternCtx.fillRect(10, 10, 10, 10);
    
    patternCtx.fillStyle = '#E74C3C';
    patternCtx.fillRect(10, 0, 10, 10);
    patternCtx.fillRect(0, 10, 10, 10);
    
    // 创建图案
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    
    ctx.fillStyle = pattern;
    ctx.fillRect(50, 50, 200, 150);
}

createBasicPatterns();
```

### 复杂图案生成器
```javascript
class PatternGenerator {
    static createDotsPattern(size = 20, dotSize = 5, color1 = '#3498DB', color2 = '#FFFFFF') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, size, size);
        
        // 圆点
        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        return canvas;
    }
    
    static createStripesPattern(size = 20, stripeWidth = 5, color1 = '#3498DB', color2 = '#FFFFFF') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, size, size);
        
        // 条纹
        ctx.fillStyle = color1;
        for (let i = 0; i < size; i += stripeWidth * 2) {
            ctx.fillRect(i, 0, stripeWidth, size);
        }
        
        return canvas;
    }
    
    static createCrossHatchPattern(size = 20, lineWidth = 2, color1 = '#3498DB', color2 = '#FFFFFF') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, size, size);
        
        // 交叉线
        ctx.strokeStyle = color1;
        ctx.lineWidth = lineWidth;
        
        // 斜线
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        ctx.moveTo(0, size);
        ctx.lineTo(size, 0);
        ctx.stroke();
        
        return canvas;
    }
    
    static createHexagonPattern(size = 30, color1 = '#3498DB', color2 = '#FFFFFF') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, size, size);
        
        // 六边形
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 3;
        
        ctx.fillStyle = color1;
        ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    }
}

// 使用图案生成器
function demonstratePatterns() {
    const patterns = [
        { name: 'Dots', generator: PatternGenerator.createDotsPattern(25, 8) },
        { name: 'Stripes', generator: PatternGenerator.createStripesPattern(20, 4) },
        { name: 'CrossHatch', generator: PatternGenerator.createCrossHatchPattern(15, 1) },
        { name: 'Hexagon', generator: PatternGenerator.createHexagonPattern(40) }
    ];
    
    patterns.forEach((patternInfo, index) => {
        const pattern = ctx.createPattern(patternInfo.generator, 'repeat');
        
        ctx.fillStyle = pattern;
        ctx.fillRect(50 + index * 150, 50, 120, 120);
        
        // 标签
        ctx.fillStyle = '#2C3E50';
        ctx.font = '14px Arial';
        ctx.fillText(patternInfo.name, 50 + index * 150, 190);
    });
}

demonstratePatterns();
```

### 图像图案
```javascript
function createImagePattern() {
    const img = new Image();
    img.onload = function() {
        // 创建图案
        const pattern = ctx.createPattern(img, 'repeat');
        
        ctx.fillStyle = pattern;
        ctx.fillRect(50, 50, 300, 200);
        
        // 不同的重复模式
        const patterns = [
            { type: 'repeat', x: 400, y: 50 },
            { type: 'repeat-x', x: 400, y: 120 },
            { type: 'repeat-y', x: 480, y: 50 },
            { type: 'no-repeat', x: 480, y: 120 }
        ];
        
        patterns.forEach(({type, x, y}) => {
            const p = ctx.createPattern(img, type);
            ctx.fillStyle = p;
            ctx.fillRect(x, y, 60, 60);
            
            // 标签
            ctx.fillStyle = '#2C3E50';
            ctx.font = '12px Arial';
            ctx.fillText(type, x, y + 75);
        });
    };
    
    // 使用base64图像或URL
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QgSDAsYmf4qKgAAABNJREFUGJVjZGBgYKAUMI6i4hcAAAMAAAL6uYwAAAAASUVORK5CYII=';
}

createImagePattern();
```

## 🌫️ 阴影效果

### 基础阴影
```javascript
function createBasicShadows() {
    // 基本阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(50, 50, 100, 100);
    
    // 清除阴影设置
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 彩色阴影
    ctx.shadowColor = 'rgba(231, 76, 60, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = -8;
    ctx.shadowOffsetY = 8;
    
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(200, 50, 100, 100);
    
    // 重置
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

createBasicShadows();
```

### 高级阴影效果
```javascript
class ShadowEffects {
    static drawWithInnerShadow(ctx, drawFunction, shadowOptions = {}) {
        const {
            color = 'rgba(0, 0, 0, 0.5)',
            blur = 10,
            offsetX = 0,
            offsetY = 0
        } = shadowOptions;
        
        // 创建离屏画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = ctx.canvas.width;
        tempCanvas.height = ctx.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 在临时画布上绘制形状
        drawFunction(tempCtx);
        
        // 创建阴影画布
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = ctx.canvas.width;
        shadowCanvas.height = ctx.canvas.height;
        const shadowCtx = shadowCanvas.getContext('2d');
        
        // 设置阴影
        shadowCtx.shadowColor = color;
        shadowCtx.shadowBlur = blur;
        shadowCtx.shadowOffsetX = -offsetX;
        shadowCtx.shadowOffsetY = -offsetY;
        
        // 绘制阴影
        shadowCtx.drawImage(tempCanvas, 0, 0);
        
        // 使用原形状作为遮罩
        shadowCtx.globalCompositeOperation = 'source-in';
        shadowCtx.drawImage(tempCanvas, 0, 0);
        
        // 绘制到主画布
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.drawImage(shadowCanvas, 0, 0);
    }
    
    static drawWithGlow(ctx, drawFunction, glowOptions = {}) {
        const {
            color = '#3498DB',
            blur = 20,
            intensity = 3
        } = glowOptions;
        
        ctx.save();
        
        // 绘制多层发光效果
        for (let i = 0; i < intensity; i++) {
            ctx.shadowColor = color;
            ctx.shadowBlur = blur * (i + 1);
            drawFunction(ctx);
        }
        
        // 最后绘制主体
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        drawFunction(ctx);
        
        ctx.restore();
    }
    
    static drawWithReflection(ctx, drawFunction, reflectionOptions = {}) {
        const {
            opacity = 0.3,
            offset = 10,
            fadeHeight = 100
        } = reflectionOptions;
        
        ctx.save();
        
        // 绘制主体
        drawFunction(ctx);
        
        // 创建反射
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = ctx.canvas.width;
        tempCanvas.height = ctx.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 在临时画布上绘制
        drawFunction(tempCtx);
        
        // 翻转并绘制反射
        ctx.save();
        ctx.scale(1, -1);
        ctx.globalAlpha = opacity;
        ctx.drawImage(tempCanvas, 0, -tempCanvas.height - offset);
        
        // 创建渐变遮罩
        const gradient = ctx.createLinearGradient(0, 0, 0, fadeHeight);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, fadeHeight);
        
        ctx.restore();
        ctx.restore();
    }
}

// 使用示例
function demonstrateAdvancedShadows() {
    // 内阴影示例
    ShadowEffects.drawWithInnerShadow(ctx, (ctx) => {
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(50, 50, 100, 100);
    }, { blur: 15, offsetX: 5, offsetY: 5 });
    
    // 发光效果示例
    ShadowEffects.drawWithGlow(ctx, (ctx) => {
        ctx.fillStyle = '#F1C40F';
        ctx.beginPath();
        ctx.arc(250, 100, 40, 0, 2 * Math.PI);
        ctx.fill();
    }, { color: '#F39C12', blur: 15, intensity: 4 });
    
    // 反射效果示例
    ShadowEffects.drawWithReflection(ctx, (ctx) => {
        ctx.fillStyle = '#9B59B6';
        ctx.fillRect(350, 50, 80, 100);
    }, { opacity: 0.4, offset: 5 });
}

demonstrateAdvancedShadows();
```

## 🎛️ 全局合成操作

### 合成模式演示
```javascript
function demonstrateCompositeOperations() {
    const operations = [
        'source-over', 'source-in', 'source-out', 'source-atop',
        'destination-over', 'destination-in', 'destination-out', 'destination-atop',
        'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay',
        'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light',
        'soft-light', 'difference', 'exclusion', 'hue', 'saturation',
        'color', 'luminosity'
    ];
    
    const cols = 6;
    const cellWidth = 120;
    const cellHeight = 100;
    
    operations.forEach((operation, index) => {
        const x = (index % cols) * cellWidth + 20;
        const y = Math.floor(index / cols) * cellHeight + 20;
        
        ctx.save();
        
        // 创建局部区域
        ctx.beginPath();
        ctx.rect(x, y, 100, 80);
        ctx.clip();
        
        // 绘制第一个形状（目标）
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(x + 10, y + 10, 60, 40);
        
        // 设置合成模式
        ctx.globalCompositeOperation = operation;
        
        // 绘制第二个形状（源）
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(x + 30, y + 30, 60, 40);
        
        ctx.restore();
        
        // 标签
        ctx.fillStyle = '#2C3E50';
        ctx.font = '10px Arial';
        ctx.fillText(operation, x, y + 95);
    });
}

demonstrateCompositeOperations();
```

### 实用混合效果
```javascript
class BlendingEffects {
    static createLightBeam(ctx, x, y, width, height, color = '#F1C40F') {
        ctx.save();
        
        // 创建光束渐变
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        
        // 绘制光束
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    static createNeonEffect(ctx, text, x, y, color = '#00FFFF') {
        ctx.save();
        
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 外发光
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 8 - i * 2;
            ctx.strokeText(text, x, y);
        }
        
        // 主文字
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }
    
    static createFadeTransition(ctx, img1, img2, progress, x, y, width, height) {
        if (!img1 || !img2) return;
        
        ctx.save();
        
        // 绘制第一张图片
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(img1, x, y, width, height);
        
        // 绘制第二张图片
        ctx.globalAlpha = progress;
        ctx.drawImage(img2, x, y, width, height);
        
        ctx.restore();
    }
}

// 使用混合效果
function demonstrateBlendingEffects() {
    // 光束效果
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, canvas.width, 200);
    
    BlendingEffects.createLightBeam(ctx, 100, 50, 80, 120, '#F1C40F');
    BlendingEffects.createLightBeam(ctx, 200, 30, 60, 140, '#E74C3C');
    BlendingEffects.createLightBeam(ctx, 300, 60, 100, 110, '#3498DB');
    
    // 霓虹效果
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 220, canvas.width, 100);
    
    BlendingEffects.createNeonEffect(ctx, 'NEON', canvas.width / 2, 270, '#00FFFF');
}

demonstrateBlendingEffects();
```

## 🎯 实际应用示例

### 动态主题系统
```javascript
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                background: '#FFFFFF',
                primary: '#3498DB',
                secondary: '#2ECC71',
                accent: '#E74C3C',
                text: '#2C3E50'
            },
            dark: {
                background: '#2C3E50',
                primary: '#5DADE2',
                secondary: '#58D68D',
                accent: '#EC7063',
                text: '#FFFFFF'
            },
            neon: {
                background: '#000000',
                primary: '#00FFFF',
                secondary: '#FF00FF',
                accent: '#FFFF00',
                text: '#FFFFFF'
            }
        };
        this.currentTheme = 'light';
    }
    
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
        }
    }
    
    getColor(colorName) {
        return this.themes[this.currentTheme][colorName] || '#000000';
    }
    
    createGradient(ctx, x1, y1, x2, y2, colorStops) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        
        colorStops.forEach(stop => {
            const color = typeof stop.color === 'string' && stop.color.startsWith('$') ?
                this.getColor(stop.color.substring(1)) : stop.color;
            gradient.addColorStop(stop.position, color);
        });
        
        return gradient;
    }
    
    drawThemedInterface(ctx) {
        // 背景
        ctx.fillStyle = this.getColor('background');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 主按钮
        const buttonGradient = this.createGradient(ctx, 0, 50, 0, 100, [
            { position: 0, color: '$primary' },
            { position: 1, color: '$secondary' }
        ]);
        
        ctx.fillStyle = buttonGradient;
        ctx.fillRect(50, 50, 200, 50);
        
        // 按钮文字
        ctx.fillStyle = this.getColor('text');
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Themed Button', 150, 80);
        
        // 装饰元素
        ctx.fillStyle = this.getColor('accent');
        ctx.beginPath();
        ctx.arc(350, 75, 25, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// 使用主题系统
const themeManager = new ThemeManager();

function switchThemes() {
    const themes = ['light', 'dark', 'neon'];
    let currentIndex = 0;
    
    setInterval(() => {
        themeManager.setTheme(themes[currentIndex]);
        themeManager.drawThemedInterface(ctx);
        currentIndex = (currentIndex + 1) % themes.length;
    }, 2000);
}

switchThemes();
```

## 🎯 本章小结

### ✅ 掌握技能
- 完整的Canvas颜色系统理解
- 线性和径向渐变的灵活运用
- 图案填充和纹理创建技巧
- 阴影和发光效果的实现

### ✅ 高级技术
- 全局合成操作的深入应用
- 动态样式系统的构建
- 主题管理系统的实现
- 视觉效果的组合使用

### ✅ 实用工具
- 颜色空间转换函数
- 图案生成器类库
- 高级阴影效果系统
- 主题管理框架

---

🎯 **下一步**：学习 [文本绘制](03-text-rendering.md)，掌握丰富的文字效果！ 