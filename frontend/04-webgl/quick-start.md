# WebGL 快速入门指南

## 🚀 5 分钟快速开始

欢迎开始您的 WebGL 学习之旅！本指南将帮助您在 5 分钟内运行第一个 WebGL 程序。

## 📋 前置要求

### 浏览器支持
确保您的浏览器支持 WebGL：
- Chrome 9+
- Firefox 4+
- Safari 5.1+
- Edge 12+

### 检查 WebGL 支持
打开浏览器控制台，运行以下代码：
```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log(gl ? 'WebGL 支持' : 'WebGL 不支持');
```

### 基础知识要求
- HTML/CSS 基础
- JavaScript 基础
- 基本的数学概念（向量、矩阵）

## 🛠️ 环境准备

### 1. 创建项目文件夹
```bash
mkdir webgl-learning
cd webgl-learning
```

### 2. 创建基本文件结构
```
webgl-learning/
├── index.html
├── main.js
├── utils.js
└── style.css
```

### 3. HTML 模板 (index.html)
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL 学习</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>我的第一个 WebGL 程序</h1>
        <canvas id="webgl-canvas" width="800" height="600"></canvas>
        <div class="controls">
            <p>使用鼠标拖拽旋转视角</p>
        </div>
    </div>
    
    <script src="utils.js"></script>
    <script src="main.js"></script>
</body>
</html>
```

### 4. 基础样式 (style.css)
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

h1 {
    margin-bottom: 20px;
    color: #2c3e50;
}

#webgl-canvas {
    border: 2px solid #34495e;
    background-color: #000;
    display: block;
    margin: 0 auto;
    cursor: grab;
}

#webgl-canvas:active {
    cursor: grabbing;
}

.controls {
    margin-top: 15px;
    padding: 10px;
    background-color: #ecf0f1;
    border-radius: 5px;
    color: #7f8c8d;
}
```

### 5. 工具函数 (utils.js)
```javascript
// WebGL 工具函数
class WebGLUtils {
    // 创建着色器
    static createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('着色器编译错误:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    // 创建着色器程序
    static createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('程序链接错误:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    // 调整画布大小
    static resizeCanvas(canvas, gl) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }
}

// 数学工具函数
class MathUtils {
    // 角度转弧度
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    // 创建透视投影矩阵
    static createPerspectiveMatrix(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1.0 / (near - far);
        
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
    
    // 矩阵乘法
    static multiplyMatrices(a, b) {
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return result;
    }
}
```

### 6. 主程序 (main.js)
```javascript
// 顶点着色器源码
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    
    uniform mat4 u_matrix;
    
    varying vec4 v_color;
    
    void main() {
        gl_Position = u_matrix * a_position;
        v_color = a_color;
    }
`;

// 片段着色器源码
const fragmentShaderSource = `
    precision mediump float;
    
    varying vec4 v_color;
    
    void main() {
        gl_Color = v_color;
    }
`;

class WebGLApp {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = this.canvas.getContext('webgl');
        
        if (!this.gl) {
            alert('您的浏览器不支持 WebGL');
            return;
        }
        
        this.init();
        this.setupEventListeners();
        this.render();
    }
    
    init() {
        // 创建着色器
        const vertexShader = WebGLUtils.createShader(
            this.gl, this.gl.VERTEX_SHADER, vertexShaderSource
        );
        const fragmentShader = WebGLUtils.createShader(
            this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource
        );
        
        // 创建程序
        this.program = WebGLUtils.createProgram(
            this.gl, vertexShader, fragmentShader
        );
        
        // 获取属性和统一变量位置
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
        this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
        
        // 创建缓冲区
        this.createBuffers();
        
        // 设置初始状态
        this.rotation = 0;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }
    
    createBuffers() {
        // 立方体顶点数据
        const vertices = [
            // 前面
            -1, -1,  1,  1,  0,  0,  1,
             1, -1,  1,  0,  1,  0,  1,
             1,  1,  1,  0,  0,  1,  1,
            -1,  1,  1,  1,  1,  0,  1,
            
            // 后面
            -1, -1, -1,  1,  0,  1,  1,
            -1,  1, -1,  0,  1,  1,  1,
             1,  1, -1,  1,  1,  1,  1,
             1, -1, -1,  0.5, 0.5, 0.5, 1
        ];
        
        // 索引数据
        const indices = [
            0, 1, 2,   0, 2, 3,    // 前面
            4, 5, 6,   4, 6, 7,    // 后面
            5, 0, 3,   5, 3, 2,    // 左面
            1, 4, 7,   1, 7, 6,    // 右面
            3, 2, 6,   3, 6, 5,    // 上面
            0, 1, 7,   0, 7, 4     // 下面
        ];
        
        // 创建顶点缓冲区
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        
        // 创建索引缓冲区
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        
        this.indexCount = indices.length;
    }
    
    setupEventListeners() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                this.rotation += deltaX * 0.01;
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        window.addEventListener('resize', () => {
            WebGLUtils.resizeCanvas(this.canvas, this.gl);
        });
    }
    
    render() {
        WebGLUtils.resizeCanvas(this.canvas, this.gl);
        
        // 清除画布
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // 使用程序
        this.gl.useProgram(this.program);
        
        // 绑定缓冲区
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        // 设置顶点属性
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 7 * 4, 0);
        
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.vertexAttribPointer(this.colorLocation, 4, this.gl.FLOAT, false, 7 * 4, 3 * 4);
        
        // 创建变换矩阵
        const aspect = this.canvas.width / this.canvas.height;
        const perspectiveMatrix = MathUtils.createPerspectiveMatrix(
            MathUtils.degToRad(60), aspect, 0.1, 100.0
        );
        
        // 模型矩阵（旋转）
        const modelMatrix = [
            Math.cos(this.rotation), 0, Math.sin(this.rotation), 0,
            0, 1, 0, 0,
            -Math.sin(this.rotation), 0, Math.cos(this.rotation), 0,
            0, 0, -5, 1
        ];
        
        // 组合矩阵
        const mvpMatrix = MathUtils.multiplyMatrices(perspectiveMatrix, modelMatrix);
        
        // 设置矩阵
        this.gl.uniformMatrix4fv(this.matrixLocation, false, mvpMatrix);
        
        // 绘制
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
        
        // 自动旋转
        this.rotation += 0.01;
        requestAnimationFrame(() => this.render());
    }
}

// 启动应用
window.addEventListener('load', () => {
    new WebGLApp();
});
```

## 🎯 第一周学习计划

### 第 1-2 天：理解基础概念
- 阅读 [WebGL 基础概念](01-foundations/01-webgl-basics.md)
- 运行上面的第一个程序
- 理解渲染管线流程

### 第 3-4 天：着色器编程入门
- 学习 GLSL 语言基础
- 修改着色器代码，观察效果
- 理解顶点着色器和片段着色器的作用

### 第 5-6 天：几何体和变换
- 学习缓冲区概念
- 创建不同的几何体
- 理解模型-视图-投影变换

### 第 7 天：实践和总结
- 完成一个小项目（如旋转的多面体）
- 总结学习笔记
- 规划下周学习内容

## 🛠️ 开发工具推荐

### 编辑器
- **Visual Studio Code** - 免费，有丰富的插件
- **WebStorm** - 专业的 JavaScript IDE
- **Sublime Text** - 轻量级编辑器

### 浏览器开发工具
- **Chrome DevTools** - F12 打开，查看 WebGL 错误
- **Firefox Developer Tools** - 优秀的 WebGL 调试功能
- **WebGL Inspector** - 专门的 WebGL 调试工具

### 在线工具
- **Shadertoy** - 在线着色器编辑器
- **WebGL Playground** - 在线 WebGL 实验环境
- **glslEditor** - GLSL 在线编辑器

## 📚 学习资源快速访问

### 立即开始学习
1. [WebGL 基础概念](01-foundations/01-webgl-basics.md) - 了解 WebGL 是什么
2. [渲染管线详解](01-foundations/02-render-pipeline.md) - 理解渲染流程
3. [数学基础准备](01-foundations/03-math-basics.md) - 必要的数学知识

### 实践示例
- [第一个三角形](examples/01-foundations/first-triangle/) - Hello World
- [彩色立方体](examples/01-foundations/colored-cube/) - 基础 3D 渲染
- [纹理贴图](examples/02-core-concepts/texture-mapping/) - 纹理应用

### 参考资料
- [WebGL Fundamentals](https://webglfundamentals.org/) - 最权威的教程
- [MDN WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) - 官方文档
- [Learning WebGL](http://learningwebgl.com/) - 经典教程网站

## 🎉 恭喜！

如果您成功运行了上面的程序，您已经：

✅ 搭建了 WebGL 开发环境  
✅ 创建了第一个 3D 场景  
✅ 理解了着色器的基本概念  
✅ 学会了基本的矩阵变换  

## 🔥 下一步

现在您可以：

1. **深入学习** - 按照完整的[学习大纲](README.md)继续学习
2. **实践更多** - 尝试修改代码，创建不同的效果
3. **加入社区** - 寻找 WebGL 学习交流群组
4. **阅读文档** - 查看更详细的技术文档

**准备好探索 3D 图形编程的无限可能了吗？让我们开始吧！** 🚀 