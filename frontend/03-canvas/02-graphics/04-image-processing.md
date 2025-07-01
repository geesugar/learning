# 第7章：Canvas图像处理

## 📚 章节导航
- **上一章**: [第6章：文本绘制](03-text-rendering.md)
- **下一章**: [第8章：动画基础](../03-animation/01-animation-basics.md)
- **章节首页**: [图形绘制进阶](README.md)
- **课程首页**: [Canvas学习大纲](../README.md)

---

## 🎯 学习目标

完成本章学习后，您将能够：
- **加载和绘制图像**：掌握多种图像加载和显示方法
- **图像变换操作**：实现缩放、裁剪、旋转等变换
- **像素级处理**：直接操作像素数据实现滤镜效果
- **图像合成技术**：掌握多图像合成和混合模式
- **图像导出保存**：将Canvas内容保存为图像文件

## 🖼️ 图像加载与绘制

### 基础图像加载

```javascript
// 图像加载器类
class ImageLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    // 加载单个图像
    async loadImage(src) {
        // 检查缓存
        if (this.cache.has(src)) {
            return this.cache.get(src);
        }

        // 检查是否正在加载
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        // 创建加载Promise
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.cache.set(src, img);
                this.loadingPromises.delete(src);
                resolve(img);
            };
            
            img.onerror = (error) => {
                this.loadingPromises.delete(src);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            // 支持跨域
            img.crossOrigin = 'anonymous';
            img.src = src;
        });

        this.loadingPromises.set(src, loadPromise);
        return loadPromise;
    }

    // 批量加载图像
    async loadImages(sources) {
        const loadPromises = sources.map(src => this.loadImage(src));
        return Promise.all(loadPromises);
    }

    // 预加载图像
    preload(sources) {
        return this.loadImages(sources);
    }

    // 获取缓存的图像
    getImage(src) {
        return this.cache.get(src) || null;
    }
}

// 使用示例
const imageLoader = new ImageLoader();

async function drawImage() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    try {
        const img = await imageLoader.loadImage('path/to/image.jpg');
        
        // 基本绘制
        ctx.drawImage(img, 0, 0);
        
        // 指定尺寸绘制
        ctx.drawImage(img, 100, 100, 200, 150);
        
        // 完整参数绘制（源图像裁剪 + 目标位置）
        ctx.drawImage(
            img,           // 图像对象
            50, 50,        // 源图像x, y
            100, 100,      // 源图像width, height
            300, 300,      // 目标x, y
            150, 150       // 目标width, height
        );
    } catch (error) {
        console.error('图像加载失败:', error);
    }
}
```

### 图像变换处理

```javascript
// 图像变换工具类
class ImageTransform {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // 缩放图像
    scaleImage(img, x, y, scaleX, scaleY) {
        this.ctx.save();
        this.ctx.scale(scaleX, scaleY);
        this.ctx.drawImage(img, x / scaleX, y / scaleY);
        this.ctx.restore();
    }

    // 旋转图像
    rotateImage(img, x, y, angle, width, height) {
        this.ctx.save();
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.rotate(angle);
        this.ctx.drawImage(img, -width / 2, -height / 2, width, height);
        this.ctx.restore();
    }

    // 翻转图像
    flipImage(img, x, y, width, height, flipX = false, flipY = false) {
        this.ctx.save();
        
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        this.ctx.drawImage(img, -width / 2, -height / 2, width, height);
        
        this.ctx.restore();
    }

    // 裁剪圆形图像
    clipCircularImage(img, x, y, radius) {
        this.ctx.save();
        
        // 创建圆形路径
        this.ctx.beginPath();
        this.ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        this.ctx.clip();
        
        // 绘制图像
        this.ctx.drawImage(img, x, y, radius * 2, radius * 2);
        
        this.ctx.restore();
    }

    // 图像蒙版效果
    maskImage(img, mask, x, y, width, height) {
        // 创建临时canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // 绘制蒙版
        tempCtx.drawImage(mask, 0, 0, width, height);
        tempCtx.globalCompositeOperation = 'source-in';
        
        // 绘制图像
        tempCtx.drawImage(img, 0, 0, width, height);
        
        // 将结果绘制到主canvas
        this.ctx.drawImage(tempCanvas, x, y);
    }
}
```

## 🎨 像素级操作

### 像素数据处理

```javascript
// 像素处理工具类
class PixelProcessor {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
    }

    // 获取像素数据
    getPixelData(x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
        return this.ctx.getImageData(x, y, width, height);
    }

    // 设置像素数据
    setPixelData(imageData, x = 0, y = 0) {
        this.ctx.putImageData(imageData, x, y);
    }

    // 获取单个像素
    getPixel(x, y) {
        const imageData = this.getPixelData(x, y, 1, 1);
        const data = imageData.data;
        return {
            r: data[0],
            g: data[1],
            b: data[2],
            a: data[3]
        };
    }

    // 设置单个像素
    setPixel(x, y, r, g, b, a = 255) {
        const imageData = this.ctx.createImageData(1, 1);
        const data = imageData.data;
        data[0] = r;
        data[1] = g;
        data[2] = b;
        data[3] = a;
        this.setPixelData(imageData, x, y);
    }

    // 遍历所有像素
    forEachPixel(callback) {
        const imageData = this.getPixelData();
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            
            const pixel = {
                r: data[i],
                g: data[i + 1],
                b: data[i + 2],
                a: data[i + 3]
            };

            const newPixel = callback(pixel, x, y);
            
            if (newPixel) {
                data[i] = newPixel.r;
                data[i + 1] = newPixel.g;
                data[i + 2] = newPixel.b;
                data[i + 3] = newPixel.a !== undefined ? newPixel.a : pixel.a;
            }
        }

        this.setPixelData(imageData);
    }
}
```

### 图像滤镜实现

```javascript
// 滤镜效果类
class ImageFilters {
    constructor(pixelProcessor) {
        this.pixelProcessor = pixelProcessor;
    }

    // 灰度滤镜
    grayscale() {
        this.pixelProcessor.forEachPixel((pixel) => {
            const gray = Math.round(pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114);
            return { r: gray, g: gray, b: gray };
        });
    }

    // 反相滤镜
    invert() {
        this.pixelProcessor.forEachPixel((pixel) => ({
            r: 255 - pixel.r,
            g: 255 - pixel.g,
            b: 255 - pixel.b
        }));
    }

    // 亮度调节
    brightness(value) {
        this.pixelProcessor.forEachPixel((pixel) => ({
            r: Math.max(0, Math.min(255, pixel.r + value)),
            g: Math.max(0, Math.min(255, pixel.g + value)),
            b: Math.max(0, Math.min(255, pixel.b + value))
        }));
    }

    // 对比度调节
    contrast(value) {
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        
        this.pixelProcessor.forEachPixel((pixel) => ({
            r: Math.max(0, Math.min(255, factor * (pixel.r - 128) + 128)),
            g: Math.max(0, Math.min(255, factor * (pixel.g - 128) + 128)),
            b: Math.max(0, Math.min(255, factor * (pixel.b - 128) + 128))
        }));
    }

    // 色调调节
    hue(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        this.pixelProcessor.forEachPixel((pixel) => {
            const { r, g, b } = pixel;
            
            const newR = r * (0.299 + 0.701 * cos + 0.168 * sin) +
                        g * (0.587 - 0.587 * cos + 0.330 * sin) +
                        b * (0.114 - 0.114 * cos - 0.497 * sin);
                        
            const newG = r * (0.299 - 0.299 * cos - 0.328 * sin) +
                        g * (0.587 + 0.413 * cos + 0.035 * sin) +
                        b * (0.114 - 0.114 * cos + 0.292 * sin);
                        
            const newB = r * (0.299 - 0.300 * cos + 1.25 * sin) +
                        g * (0.587 - 0.588 * cos - 1.05 * sin) +
                        b * (0.114 + 0.886 * cos - 0.203 * sin);

            return {
                r: Math.max(0, Math.min(255, Math.round(newR))),
                g: Math.max(0, Math.min(255, Math.round(newG))),
                b: Math.max(0, Math.min(255, Math.round(newB)))
            };
        });
    }

    // 模糊滤镜
    blur(radius = 1) {
        const imageData = this.pixelProcessor.getPixelData();
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const index = (ny * width + nx) * 4;
                            r += data[index];
                            g += data[index + 1];
                            b += data[index + 2];
                            a += data[index + 3];
                            count++;
                        }
                    }
                }

                const index = (y * width + x) * 4;
                output[index] = r / count;
                output[index + 1] = g / count;
                output[index + 2] = b / count;
                output[index + 3] = a / count;
            }
        }

        const newImageData = new ImageData(output, width, height);
        this.pixelProcessor.setPixelData(newImageData);
    }

    // 边缘检测
    edgeDetection() {
        const imageData = this.pixelProcessor.getPixelData();
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data.length);

        // Sobel算子
        const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const index = ((y + dy) * width + (x + dx)) * 4;
                        const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
                        
                        gx += gray * sobelX[dy + 1][dx + 1];
                        gy += gray * sobelY[dy + 1][dx + 1];
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy);
                const index = (y * width + x) * 4;
                
                output[index] = magnitude;
                output[index + 1] = magnitude;
                output[index + 2] = magnitude;
                output[index + 3] = 255;
            }
        }

        const newImageData = new ImageData(output, width, height);
        this.pixelProcessor.setPixelData(newImageData);
    }
}
```

## 🖼️ 图像合成技术

### 混合模式应用

```javascript
// 图像合成器
class ImageCompositor {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // 基础合成操作
    composite(baseImage, overlayImage, x, y, mode = 'source-over') {
        this.ctx.save();
        
        // 绘制基础图像
        this.ctx.drawImage(baseImage, 0, 0);
        
        // 设置合成模式
        this.ctx.globalCompositeOperation = mode;
        
        // 绘制覆盖图像
        this.ctx.drawImage(overlayImage, x, y);
        
        this.ctx.restore();
    }

    // 图像蒙版合成
    maskComposite(image, mask, x, y) {
        // 创建临时canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = mask.width;
        tempCanvas.height = mask.height;
        
        // 绘制蒙版
        tempCtx.drawImage(mask, 0, 0);
        tempCtx.globalCompositeOperation = 'source-in';
        tempCtx.drawImage(image, 0, 0);
        
        // 合成到主画布
        this.ctx.drawImage(tempCanvas, x, y);
    }

    // 多图层合成
    compositeMultipleLayers(layers) {
        layers.forEach(layer => {
            this.ctx.save();
            
            // 设置透明度
            if (layer.opacity !== undefined) {
                this.ctx.globalAlpha = layer.opacity;
            }
            
            // 设置混合模式
            if (layer.blendMode) {
                this.ctx.globalCompositeOperation = layer.blendMode;
            }
            
            // 应用变换
            if (layer.transform) {
                this.applyTransform(layer.transform);
            }
            
            // 绘制图像
            this.ctx.drawImage(layer.image, layer.x || 0, layer.y || 0);
            
            this.ctx.restore();
        });
    }

    applyTransform(transform) {
        if (transform.translate) {
            this.ctx.translate(transform.translate.x, transform.translate.y);
        }
        if (transform.scale) {
            this.ctx.scale(transform.scale.x, transform.scale.y);
        }
        if (transform.rotate) {
            this.ctx.rotate(transform.rotate);
        }
    }
}
```

## 💾 图像导出与保存

### 图像导出工具

```javascript
// 图像导出类
class ImageExporter {
    constructor(canvas) {
        this.canvas = canvas;
    }

    // 导出为Data URL
    toDataURL(type = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(type, quality);
    }

    // 导出为Blob
    async toBlob(type = 'image/png', quality = 0.92) {
        return new Promise(resolve => {
            this.canvas.toBlob(resolve, type, quality);
        });
    }

    // 下载图像
    async downloadImage(filename = 'canvas-image', type = 'image/png', quality = 0.92) {
        const blob = await this.toBlob(type, quality);
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = filename + '.' + type.split('/')[1];
        link.href = url;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // 导出指定区域
    exportRegion(x, y, width, height, type = 'image/png', quality = 0.92) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        tempCtx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
        
        return tempCanvas.toDataURL(type, quality);
    }

    // 批量导出
    async exportMultiple(exports) {
        const results = [];
        
        for (const exportConfig of exports) {
            const { filename, x, y, width, height, type, quality } = exportConfig;
            
            if (x !== undefined && y !== undefined && width && height) {
                // 导出指定区域
                const dataURL = this.exportRegion(x, y, width, height, type, quality);
                results.push({ filename, dataURL });
            } else {
                // 导出整个画布
                const dataURL = this.toDataURL(type, quality);
                results.push({ filename, dataURL });
            }
        }
        
        return results;
    }
}
```

## 🎯 实践练习

### 练习1：图像滤镜编辑器
创建一个图像滤镜编辑器，支持多种滤镜效果的实时预览。

```javascript
class ImageFilterEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pixelProcessor = new PixelProcessor(this.ctx);
        this.filters = new ImageFilters(this.pixelProcessor);
        this.originalImageData = null;
        
        this.setupUI();
    }

    async loadImage(file) {
        const img = await this.createImageFromFile(file);
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.originalImageData = this.pixelProcessor.getPixelData();
    }

    applyFilter(filterName, value) {
        // 恢复原图
        this.pixelProcessor.setPixelData(this.originalImageData);
        
        // 应用滤镜
        switch (filterName) {
            case 'grayscale':
                this.filters.grayscale();
                break;
            case 'brightness':
                this.filters.brightness(value);
                break;
            case 'contrast':
                this.filters.contrast(value);
                break;
            // 更多滤镜...
        }
    }

    createImageFromFile(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(file);
        });
    }

    setupUI() {
        // 创建滤镜控制界面
        // 实现实时预览功能
    }
}
```

### 练习2：图像拼贴工具
开发一个图像拼贴工具，支持拖拽、缩放、旋转多个图像。

### 练习3：像素画编辑器
创建一个像素画编辑器，支持像素级绘制和编辑。

## 📊 性能优化技巧

1. **图像缓存**：避免重复加载相同图像
2. **离屏渲染**：复杂操作在离屏Canvas上进行
3. **批量处理**：合并多个像素操作
4. **Web Workers**：将像素处理移到后台线程
5. **适当分辨率**：根据显示需求选择合适的图像分辨率

## 📚 本章小结

通过本章学习，您掌握了：
- 图像加载、绘制和变换的各种技术
- 像素级操作和滤镜效果的实现
- 图像合成和混合模式的应用
- 图像导出和保存的方法

这些技能为创建专业的图像处理应用奠定了基础。

---

## 🔗 相关链接
- **技术文档**: [Canvas API - drawImage](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage)
- **最佳实践**: [图像处理优化指南](https://web.dev/canvas-performance/)
- **扩展学习**: [WebGL图像处理](../04-advanced/03-webgl-integration.md)

---

**下一章预告**: [第8章：动画基础](../03-animation/01-animation-basics.md) - 学习Canvas动画的基本原理和实现方法。 