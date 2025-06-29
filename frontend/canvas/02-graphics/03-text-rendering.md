# Canvas文本绘制与排版

> 掌握Canvas文本绘制的各种技巧，创建美观的文字效果和专业的排版布局。

## 🎯 学习目标

- 掌握Canvas文本绘制的基本方法
- 理解字体设置和文本测量机制
- 学会创建各种文字效果和样式
- 实现多行文本和复杂排版布局
- 构建富文本渲染系统

## 📝 文本绘制基础

### 基本文本绘制
```javascript
// 填充文本
ctx.fillStyle = '#2C3E50';
ctx.font = '24px Arial';
ctx.fillText('Hello Canvas!', 50, 100);

// 描边文本
ctx.strokeStyle = '#E74C3C';
ctx.lineWidth = 2;
ctx.font = 'bold 32px Georgia';
ctx.strokeText('Outlined Text', 50, 150);

// 同时填充和描边
ctx.fillStyle = '#3498DB';
ctx.strokeStyle = '#2980B9';
ctx.lineWidth = 1;
ctx.font = '28px Arial';
ctx.fillText('Combined Effect', 50, 200);
ctx.strokeText('Combined Effect', 50, 200);
```

### 字体属性详解
```javascript
// 字体语法：[font-style] [font-variant] [font-weight] [font-size/line-height] [font-family]

// 字体样式和粗细
ctx.font = 'italic 20px Arial';        // 斜体
ctx.font = 'bold 24px Arial';          // 粗体
ctx.font = 'bold italic 20px Georgia'; // 粗斜体

// 字体大小
ctx.font = '12px Arial';               // 像素
ctx.font = '1.2em Arial';              // em单位
ctx.font = '14pt Arial';               // 点数

// 字体族
ctx.font = '20px Arial, sans-serif';
ctx.font = '20px "Times New Roman", serif';
ctx.font = '20px "Courier New", monospace';

// 演示不同字体
function demonstrateFonts() {
    const fonts = [
        { font: 'normal 16px Arial', text: 'Normal Arial' },
        { font: 'bold 16px Arial', text: 'Bold Arial' },
        { font: 'italic 16px Georgia', text: 'Italic Georgia' },
        { font: '20px "Courier New"', text: 'Courier New Monospace' }
    ];
    
    fonts.forEach((setting, index) => {
        ctx.font = setting.font;
        ctx.fillStyle = '#2C3E50';
        ctx.fillText(setting.text, 50, 50 + index * 30);
    });
}
```

### 文本对齐和基线
```javascript
function demonstrateTextAlignment() {
    const centerX = 300;
    const baseY = 150;
    
    // 绘制参考线
    ctx.strokeStyle = '#BDC3C7';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, 50);
    ctx.lineTo(centerX, 250);
    ctx.moveTo(50, baseY);
    ctx.lineTo(550, baseY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#2C3E50';
    
    // 水平对齐
    const alignments = ['left', 'center', 'right'];
    alignments.forEach((align, index) => {
        ctx.textAlign = align;
        ctx.fillText(`textAlign: ${align}`, centerX, baseY - 60 + index * 25);
    });
    
    // 垂直对齐（基线）
    ctx.textAlign = 'center';
    const baselines = ['top', 'middle', 'alphabetic', 'bottom'];
    baselines.forEach((baseline, index) => {
        ctx.textBaseline = baseline;
        ctx.fillText(baseline, centerX - 100 + index * 50, baseY);
        
        // 基线点
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(centerX - 100 + index * 50, baseY, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#2C3E50';
    });
}
```

## 📏 文本测量

### 文本尺寸计算
```javascript
class TextMeasurer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    getTextDimensions(text, font) {
        this.ctx.save();
        this.ctx.font = font;
        
        const metrics = this.ctx.measureText(text);
        const width = metrics.width;
        
        // 估算高度
        let height;
        if (metrics.fontBoundingBoxAscent !== undefined) {
            height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        } else {
            const fontSize = parseFloat(font);
            height = fontSize * 1.2;
        }
        
        this.ctx.restore();
        return { width, height, metrics };
    }
    
    fitTextToWidth(text, font, maxWidth) {
        this.ctx.save();
        this.ctx.font = font;
        
        if (this.ctx.measureText(text).width <= maxWidth) {
            this.ctx.restore();
            return text;
        }
        
        // 二分查找合适的字符数
        let left = 0;
        let right = text.length;
        let result = '';
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const substr = text.substring(0, mid) + '...';
            const width = this.ctx.measureText(substr).width;
            
            if (width <= maxWidth) {
                result = substr;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        this.ctx.restore();
        return result;
    }
}

// 使用示例
const measurer = new TextMeasurer(ctx);
const longText = 'This is a very long text that might need truncation';
const fittedText = measurer.fitTextToWidth(longText, '16px Arial', 200);

ctx.font = '16px Arial';
ctx.fillText(fittedText, 50, 100);
```

## 🎨 文字效果

### 渐变文字
```javascript
function createGradientText() {
    // 线性渐变文字
    const gradient = ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(0, '#E74C3C');
    gradient.addColorStop(0.5, '#F39C12');
    gradient.addColorStop(1, '#F1C40F');
    
    ctx.fillStyle = gradient;
    ctx.font = 'bold 48px Arial';
    ctx.fillText('GRADIENT', 50, 100);
    
    // 径向渐变文字
    const radialGradient = ctx.createRadialGradient(200, 200, 10, 200, 200, 80);
    radialGradient.addColorStop(0, '#FFFFFF');
    radialGradient.addColorStop(1, '#3498DB');
    
    ctx.fillStyle = radialGradient;
    ctx.font = 'bold 36px Arial';
    ctx.fillText('RADIAL', 120, 200);
}
```

### 阴影和发光效果
```javascript
function createTextEffects() {
    // 基础阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Shadow Text', 50, 80);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 发光效果
    const text = 'GLOW';
    const x = 50, y = 150;
    
    // 多层发光
    for (let i = 0; i < 4; i++) {
        ctx.shadowColor = '#3498DB';
        ctx.shadowBlur = 20 - i * 5;
        ctx.fillStyle = i === 3 ? '#FFFFFF' : 'transparent';
        ctx.fillText(text, x, y);
    }
    
    // 重置
    ctx.shadowColor = 'transparent';
}
```

### 3D和霓虹效果
```javascript
function create3DText() {
    const text = '3D TEXT';
    const x = 50, y = 100;
    
    ctx.font = 'bold 48px Arial';
    
    // 3D深度层
    for (let i = 8; i > 0; i--) {
        const darkness = 1 - (i / 8) * 0.8;
        ctx.fillStyle = `rgba(0, 0, 0, ${darkness * 0.3})`;
        ctx.fillText(text, x + i, y + i);
    }
    
    // 主文字
    const gradient = ctx.createLinearGradient(0, y - 30, 0, y + 10);
    gradient.addColorStop(0, '#F39C12');
    gradient.addColorStop(1, '#E67E22');
    
    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);
}

function createNeonText() {
    const text = 'NEON';
    const x = 100, y = 100;
    
    // 黑色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, 150);
    
    ctx.font = 'bold 52px Arial';
    
    // 多层发光
    const glowLayers = [
        { blur: 30, width: 8, color: '#00FFFF' },
        { blur: 20, width: 5, color: '#00FFFF' },
        { blur: 10, width: 2, color: '#00FFFF' }
    ];
    
    glowLayers.forEach(layer => {
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = layer.blur;
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.width;
        ctx.strokeText(text, x, y);
    });
    
    // 主体
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y);
    
    // 重置
    ctx.shadowColor = 'transparent';
}
```

## 📄 多行文本处理

### 自动换行
```javascript
class TextWrapper {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = this.ctx.measureText(testLine).width;
            
            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    drawWrappedText(text, x, y, maxWidth, lineHeight = 1.2) {
        const lines = this.wrapText(text, maxWidth);
        const fontSize = parseFloat(this.ctx.font);
        const actualLineHeight = fontSize * lineHeight;
        
        lines.forEach((line, index) => {
            this.ctx.fillText(line, x, y + index * actualLineHeight);
        });
        
        return lines.length * actualLineHeight;
    }
}

// 使用示例
function demonstrateTextWrapping() {
    const wrapper = new TextWrapper(ctx);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#2C3E50';
    
    const longText = 'This is a very long text that needs to be wrapped to multiple lines to fit within the specified width constraint.';
    
    const maxWidth = 300;
    const x = 50, y = 50;
    
    // 绘制边界框
    ctx.strokeStyle = '#BDC3C7';
    ctx.strokeRect(x, y - 20, maxWidth, 120);
    
    // 绘制换行文本
    wrapper.drawWrappedText(longText, x + 10, y, maxWidth - 20);
}
```

### 文本容器和对齐
```javascript
class TextContainer {
    constructor(x, y, width, height) {
        this.x = x; this.y = y;
        this.width = width; this.height = height;
        this.padding = 10;
        this.textAlign = 'left';
        this.verticalAlign = 'top';
    }
    
    setAlignment(horizontal, vertical = 'top') {
        this.textAlign = horizontal;
        this.verticalAlign = vertical;
        return this;
    }
    
    drawText(ctx, text, font = '16px Arial', lineHeight = 1.4) {
        ctx.save();
        ctx.font = font;
        
        // 容器边界
        ctx.strokeStyle = '#BDC3C7';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 内容区域
        const contentX = this.x + this.padding;
        const contentY = this.y + this.padding;
        const contentWidth = this.width - this.padding * 2;
        const contentHeight = this.height - this.padding * 2;
        
        // 文本换行
        const wrapper = new TextWrapper(ctx);
        const lines = wrapper.wrapText(text, contentWidth);
        
        const fontSize = parseFloat(font);
        const actualLineHeight = fontSize * lineHeight;
        const totalTextHeight = lines.length * actualLineHeight;
        
        // 垂直对齐
        let startY;
        switch (this.verticalAlign) {
            case 'middle':
                startY = contentY + (contentHeight - totalTextHeight) / 2 + fontSize;
                break;
            case 'bottom':
                startY = contentY + contentHeight - totalTextHeight + fontSize;
                break;
            default: // top
                startY = contentY + fontSize;
        }
        
        // 绘制文本
        ctx.textBaseline = 'alphabetic';
        lines.forEach((line, index) => {
            const y = startY + index * actualLineHeight;
            
            // 水平对齐
            let x;
            switch (this.textAlign) {
                case 'center':
                    ctx.textAlign = 'center';
                    x = contentX + contentWidth / 2;
                    break;
                case 'right':
                    ctx.textAlign = 'right';
                    x = contentX + contentWidth;
                    break;
                default: // left
                    ctx.textAlign = 'left';
                    x = contentX;
            }
            
            ctx.fillText(line, x, y);
        });
        
        ctx.restore();
    }
}

// 使用示例
function demonstrateTextContainer() {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
    
    // 不同对齐方式
    const containers = [
        new TextContainer(50, 50, 180, 120).setAlignment('left', 'top'),
        new TextContainer(250, 50, 180, 120).setAlignment('center', 'middle'),
        new TextContainer(450, 50, 180, 120).setAlignment('right', 'bottom')
    ];
    
    containers.forEach(container => {
        container.drawText(ctx, text, '14px Arial');
    });
}
```

## 🎯 实际应用示例

### 动态文字动画
```javascript
class TextAnimator {
    constructor(ctx) {
        this.ctx = ctx;
        this.animations = [];
    }
    
    typeWriter(text, x, y, font, duration = 2000) {
        this.animations.push({
            type: 'typewriter',
            text, x, y, font,
            currentLength: 0,
            startTime: Date.now(),
            duration
        });
    }
    
    fadeIn(text, x, y, font, duration = 1000) {
        this.animations.push({
            type: 'fadein',
            text, x, y, font,
            alpha: 0,
            startTime: Date.now(),
            duration
        });
    }
    
    wave(text, x, y, font, amplitude = 10) {
        this.animations.push({
            type: 'wave',
            text, x, y, font,
            amplitude,
            time: 0
        });
    }
    
    update() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        this.animations = this.animations.filter(animation => {
            this.ctx.save();
            this.ctx.font = animation.font;
            
            switch (animation.type) {
                case 'typewriter':
                    const elapsed = Date.now() - animation.startTime;
                    const progress = Math.min(elapsed / animation.duration, 1);
                    animation.currentLength = Math.floor(progress * animation.text.length);
                    
                    const visibleText = animation.text.substring(0, animation.currentLength);
                    this.ctx.fillStyle = '#2C3E50';
                    this.ctx.fillText(visibleText, animation.x, animation.y);
                    
                    // 光标
                    if (progress < 1 && Math.floor(Date.now() / 500) % 2) {
                        const cursorX = animation.x + this.ctx.measureText(visibleText).width;
                        this.ctx.fillText('|', cursorX, animation.y);
                    }
                    
                    this.ctx.restore();
                    return progress < 1;
                    
                case 'fadein':
                    const fadeElapsed = Date.now() - animation.startTime;
                    const fadeProgress = Math.min(fadeElapsed / animation.duration, 1);
                    
                    this.ctx.globalAlpha = fadeProgress;
                    this.ctx.fillStyle = '#2C3E50';
                    this.ctx.fillText(animation.text, animation.x, animation.y);
                    
                    this.ctx.restore();
                    return fadeProgress < 1;
                    
                case 'wave':
                    animation.time += 0.05;
                    
                    [...animation.text].forEach((char, index) => {
                        const offsetY = Math.sin(animation.time + index * 0.5) * animation.amplitude;
                        const charX = animation.x + this.ctx.measureText(animation.text.substring(0, index)).width;
                        
                        this.ctx.fillStyle = `hsl(${(animation.time * 50 + index * 30) % 360}, 70%, 50%)`;
                        this.ctx.fillText(char, charX, animation.y + offsetY);
                    });
                    
                    this.ctx.restore();
                    return true;
            }
        });
    }
}

// 使用示例
const animator = new TextAnimator(ctx);

animator.typeWriter('Hello World!', 50, 100, '24px Arial', 3000);
animator.fadeIn('Fade In Effect', 50, 150, '20px Arial', 2000);
animator.wave('Wave Animation', 50, 200, '18px Arial', 15);

function animate() {
    animator.update();
    requestAnimationFrame(animate);
}
```

### 富文本系统
```javascript
class RichTextRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    parseStyledText(styledText) {
        // 解析 {style:text} 格式
        const parts = [];
        const regex = /\{([^:}]+):([^}]+)\}/g;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(styledText)) !== null) {
            // 普通文本
            if (match.index > lastIndex) {
                parts.push({
                    text: styledText.substring(lastIndex, match.index),
                    style: {}
                });
            }
            
            // 样式文本
            const styleStr = match[1];
            const text = match[2];
            const style = this.parseStyle(styleStr);
            
            parts.push({ text, style });
            lastIndex = regex.lastIndex;
        }
        
        // 剩余文本
        if (lastIndex < styledText.length) {
            parts.push({
                text: styledText.substring(lastIndex),
                style: {}
            });
        }
        
        return parts;
    }
    
    parseStyle(styleStr) {
        const style = {};
        const declarations = styleStr.split(';');
        
        declarations.forEach(decl => {
            const [property, value] = decl.split(':').map(s => s.trim());
            if (property && value) {
                switch (property) {
                    case 'color': style.fillStyle = value; break;
                    case 'size': style.fontSize = value; break;
                    case 'weight': style.fontWeight = value; break;
                    case 'style': style.fontStyle = value; break;
                }
            }
        });
        
        return style;
    }
    
    drawRichText(styledText, x, y) {
        const parts = this.parseStyledText(styledText);
        let currentX = x;
        
        parts.forEach(part => {
            if (!part.text) return;
            
            this.ctx.save();
            
            // 应用样式
            let fontParts = [];
            if (part.style.fontStyle) fontParts.push(part.style.fontStyle);
            if (part.style.fontWeight) fontParts.push(part.style.fontWeight);
            fontParts.push(part.style.fontSize || '16px');
            fontParts.push('Arial');
            
            this.ctx.font = fontParts.join(' ');
            this.ctx.fillStyle = part.style.fillStyle || '#000000';
            
            this.ctx.fillText(part.text, currentX, y);
            currentX += this.ctx.measureText(part.text).width;
            
            this.ctx.restore();
        });
    }
}

// 使用示例
const richRenderer = new RichTextRenderer(ctx);

const styledText = 'This is {color:red;weight:bold}bold red{} text and {color:blue;style:italic}italic blue{} text.';
richRenderer.drawRichText(styledText, 50, 100);
```

## 🎯 本章小结

### ✅ 掌握技能
- Canvas文本绘制的完整方法
- 字体设置和文本测量机制
- 各种文字效果的实现技巧
- 多行文本和自动换行处理

### ✅ 高级功能
- 文本容器和高级排版
- 动态文字动画效果
- 富文本渲染系统
- 文本对齐和布局控制

### ✅ 实用工具
- 文本测量和尺寸计算
- 文本包装和换行类
- 富文本解析器
- 文字动画框架

---

🎯 **下一步**：学习 [图像处理](04-image-processing.md)，掌握Canvas的图像操作技术！ 