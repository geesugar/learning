# 第14章：Canvas与WebGL集成

## 🎯 学习目标

完成本章学习后，您将能够：
- **理解WebGL基础概念**：掌握3D图形渲染的基本原理
- **编写着色器程序**：创建顶点着色器和片段着色器
- **混合使用技术**：结合Canvas 2D和WebGL的优势
- **性能对比分析**：选择合适的渲染技术
- **构建3D应用**：开发基础的3D图形应用

## 🌟 WebGL基础概念

### WebGL渲染管线

```javascript
// WebGL渲染管线基础封装
class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        this.programs = new Map();
        this.buffers = new Map();
        this.textures = new Map();
        this.uniforms = new Map();
        
        this.initGL();
    }

    initGL() {
        const gl = this.gl;
        
        // 设置视口
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // 启用深度测试
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        
        // 设置清除颜色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
    }

    // 创建着色器
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}`);
        }
        
        return shader;
    }

    // 创建着色器程序
    createProgram(vertexShaderSource, fragmentShaderSource) {
        const gl = this.gl;
        
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program linking error: ${error}`);
        }
        
        // 清理着色器
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        return program;
    }

    // 创建缓冲区
    createBuffer(data, type = this.gl.ARRAY_BUFFER) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
        
        return buffer;
    }

    // 获取属性位置
    getAttributeLocation(program, name) {
        return this.gl.getAttribLocation(program, name);
    }

    // 获取uniform位置
    getUniformLocation(program, name) {
        return this.gl.getUniformLocation(program, name);
    }

    // 清除画布
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    // 使用程序
    useProgram(program) {
        this.gl.useProgram(program);
    }
}
```

### 基础着色器

```javascript
// 顶点着色器源码
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec2 a_texCoord;
    
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    
    varying vec4 v_color;
    varying vec2 v_texCoord;
    
    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
        v_color = a_color;
        v_texCoord = a_texCoord;
    }
`;

// 片段着色器源码
const fragmentShaderSource = `
    precision mediump float;
    
    varying vec4 v_color;
    varying vec2 v_texCoord;
    
    uniform sampler2D u_texture;
    uniform bool u_useTexture;
    uniform float u_alpha;
    
    void main() {
        vec4 color = v_color;
        
        if (u_useTexture) {
            vec4 texColor = texture2D(u_texture, v_texCoord);
            color = color * texColor;
        }
        
        gl_FragColor = vec4(color.rgb, color.a * u_alpha);
    }
`;

// 3D对象基类
class WebGLObject3D {
    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.gl;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.color = { r: 1, g: 1, b: 1, a: 1 };
        
        this.vertices = [];
        this.indices = [];
        this.colors = [];
        this.texCoords = [];
        
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.colorBuffer = null;
        this.texCoordBuffer = null;
        
        this.program = null;
        this.modelViewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        
        this.init();
    }

    init() {
        this.createProgram();
        this.createGeometry();
        this.createBuffers();
    }

    createProgram() {
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);
    }

    createGeometry() {
        // 子类实现具体几何体
    }

    createBuffers() {
        if (this.vertices.length > 0) {
            this.vertexBuffer = this.renderer.createBuffer(new Float32Array(this.vertices));
        }
        
        if (this.indices.length > 0) {
            this.indexBuffer = this.renderer.createBuffer(
                new Uint16Array(this.indices), 
                this.gl.ELEMENT_ARRAY_BUFFER
            );
        }
        
        if (this.colors.length > 0) {
            this.colorBuffer = this.renderer.createBuffer(new Float32Array(this.colors));
        }
        
        if (this.texCoords.length > 0) {
            this.texCoordBuffer = this.renderer.createBuffer(new Float32Array(this.texCoords));
        }
    }

    updateModelViewMatrix() {
        mat4.identity(this.modelViewMatrix);
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, 
            [this.position.x, this.position.y, this.position.z]);
        mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, this.rotation.x);
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, this.rotation.y);
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, this.rotation.z);
        mat4.scale(this.modelViewMatrix, this.modelViewMatrix, 
            [this.scale.x, this.scale.y, this.scale.z]);
    }

    render(camera) {
        const gl = this.gl;
        
        this.renderer.useProgram(this.program);
        this.updateModelViewMatrix();
        
        // 设置uniforms
        const uModelViewMatrix = this.renderer.getUniformLocation(this.program, 'u_modelViewMatrix');
        const uProjectionMatrix = this.renderer.getUniformLocation(this.program, 'u_projectionMatrix');
        
        gl.uniformMatrix4fv(uModelViewMatrix, false, this.modelViewMatrix);
        gl.uniformMatrix4fv(uProjectionMatrix, false, camera.projectionMatrix);
        
        // 绑定顶点属性
        this.bindAttributes();
        
        // 绘制
        if (this.indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
        }
    }

    bindAttributes() {
        const gl = this.gl;
        
        // 绑定位置属性
        if (this.vertexBuffer) {
            const aPosition = this.renderer.getAttributeLocation(this.program, 'a_position');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.enableVertexAttribArray(aPosition);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        }
        
        // 绑定颜色属性
        if (this.colorBuffer) {
            const aColor = this.renderer.getAttributeLocation(this.program, 'a_color');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.enableVertexAttribArray(aColor);
            gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
        }
        
        // 绑定纹理坐标属性
        if (this.texCoordBuffer) {
            const aTexCoord = this.renderer.getAttributeLocation(this.program, 'a_texCoord');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.enableVertexAttribArray(aTexCoord);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
        }
    }
}
```

## 📦 3D几何体实现

### 立方体

```javascript
class Cube extends WebGLObject3D {
    createGeometry() {
        // 立方体顶点（8个顶点，每个面用两个三角形）
        this.vertices = [
            // 前面
            -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1,
            // 后面
            -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1, -1,
            // 上面
            -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
            // 下面
            -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
            // 右面
             1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,
            // 左面
            -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1
        ];

        // 索引（每个面用两个三角形）
        this.indices = [
            0,  1,  2,    0,  2,  3,    // 前面
            4,  5,  6,    4,  6,  7,    // 后面
            8,  9,  10,   8,  10, 11,   // 上面
            12, 13, 14,   12, 14, 15,   // 下面
            16, 17, 18,   16, 18, 19,   // 右面
            20, 21, 22,   20, 22, 23    // 左面
        ];

        // 颜色（每个面不同颜色）
        const faceColors = [
            [1.0, 0.0, 0.0, 1.0], // 前面：红色
            [0.0, 1.0, 0.0, 1.0], // 后面：绿色
            [0.0, 0.0, 1.0, 1.0], // 上面：蓝色
            [1.0, 1.0, 0.0, 1.0], // 下面：黄色
            [1.0, 0.0, 1.0, 1.0], // 右面：紫色
            [0.0, 1.0, 1.0, 1.0]  // 左面：青色
        ];

        this.colors = [];
        for (let i = 0; i < faceColors.length; i++) {
            const color = faceColors[i];
            // 每个面4个顶点，每个顶点都使用相同颜色
            for (let j = 0; j < 4; j++) {
                this.colors.push(...color);
            }
        }
    }
}
```

### 球体

```javascript
class Sphere extends WebGLObject3D {
    constructor(renderer, radius = 1, segments = 32, rings = 16) {
        this.radius = radius;
        this.segments = segments;
        this.rings = rings;
        super(renderer);
    }

    createGeometry() {
        this.vertices = [];
        this.indices = [];
        this.colors = [];
        this.texCoords = [];

        // 生成顶点
        for (let ring = 0; ring <= this.rings; ring++) {
            const theta = ring * Math.PI / this.rings;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let segment = 0; segment <= this.segments; segment++) {
                const phi = segment * 2 * Math.PI / this.segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                // 顶点位置
                this.vertices.push(this.radius * x, this.radius * y, this.radius * z);

                // 纹理坐标
                const u = segment / this.segments;
                const v = ring / this.rings;
                this.texCoords.push(u, v);

                // 颜色（基于位置生成渐变色）
                const r = (x + 1) / 2;
                const g = (y + 1) / 2;
                const b = (z + 1) / 2;
                this.colors.push(r, g, b, 1.0);
            }
        }

        // 生成索引
        for (let ring = 0; ring < this.rings; ring++) {
            for (let segment = 0; segment < this.segments; segment++) {
                const first = ring * (this.segments + 1) + segment;
                const second = first + this.segments + 1;

                // 第一个三角形
                this.indices.push(first, second, first + 1);
                // 第二个三角形
                this.indices.push(second, second + 1, first + 1);
            }
        }
    }
}
```

## 📷 相机系统

```javascript
class Camera {
    constructor() {
        this.position = { x: 0, y: 0, z: 5 };
        this.target = { x: 0, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        
        this.fov = 45; // 视野角度
        this.aspect = 1; // 宽高比
        this.near = 0.1; // 近裁剪面
        this.far = 100; // 远裁剪面
        
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        
        this.updateMatrices();
    }

    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.updateMatrices();
    }

    lookAt(x, y, z) {
        this.target.x = x;
        this.target.y = y;
        this.target.z = z;
        this.updateMatrices();
    }

    setPerspective(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.updateMatrices();
    }

    updateMatrices() {
        // 更新视图矩阵
        mat4.lookAt(this.viewMatrix,
            [this.position.x, this.position.y, this.position.z],
            [this.target.x, this.target.y, this.target.z],
            [this.up.x, this.up.y, this.up.z]);

        // 更新投影矩阵
        mat4.perspective(this.projectionMatrix,
            this.fov * Math.PI / 180,
            this.aspect,
            this.near,
            this.far);
    }

    // 轨道控制
    orbit(deltaX, deltaY) {
        const radius = Math.sqrt(
            this.position.x ** 2 + 
            this.position.y ** 2 + 
            this.position.z ** 2
        );

        let theta = Math.atan2(this.position.x, this.position.z);
        let phi = Math.acos(this.position.y / radius);

        theta += deltaX * 0.01;
        phi += deltaY * 0.01;

        // 限制phi的范围
        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

        this.position.x = radius * Math.sin(phi) * Math.sin(theta);
        this.position.y = radius * Math.cos(phi);
        this.position.z = radius * Math.sin(phi) * Math.cos(theta);

        this.updateMatrices();
    }

    // 缩放
    zoom(delta) {
        const direction = {
            x: this.target.x - this.position.x,
            y: this.target.y - this.position.y,
            z: this.target.z - this.position.z
        };

        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        direction.x /= length;
        direction.y /= length;
        direction.z /= length;

        this.position.x += direction.x * delta;
        this.position.y += direction.y * delta;
        this.position.z += direction.z * delta;

        this.updateMatrices();
    }
}
```

## 🎨 Canvas 2D与WebGL混合

### 混合渲染器

```javascript
class HybridRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');
        
        // 创建WebGL canvas
        this.webglCanvas = document.createElement('canvas');
        this.webglCanvas.width = canvas.width;
        this.webglCanvas.height = canvas.height;
        this.webglRenderer = new WebGLRenderer(this.webglCanvas);
        
        // 场景管理
        this.scene3D = [];
        this.scene2D = [];
        
        // 相机
        this.camera = new Camera();
        this.camera.setPerspective(45, canvas.width / canvas.height, 0.1, 100);
        
        this.setupEventListeners();
        this.startRenderLoop();
    }

    // 添加3D对象
    add3DObject(object) {
        this.scene3D.push(object);
    }

    // 添加2D绘制函数
    add2DRenderer(renderFunc) {
        this.scene2D.push(renderFunc);
    }

    render() {
        // 清除WebGL canvas
        this.webglRenderer.clear();
        
        // 渲染3D场景
        this.scene3D.forEach(object => {
            object.render(this.camera);
        });
        
        // 清除2D canvas
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 将WebGL内容绘制到2D canvas
        this.ctx2d.drawImage(this.webglCanvas, 0, 0);
        
        // 渲染2D内容（UI、文字、图表等）
        this.scene2D.forEach(renderFunc => {
            renderFunc(this.ctx2d);
        });
    }

    startRenderLoop() {
        const animate = () => {
            this.render();
            requestAnimationFrame(animate);
        };
        animate();
    }

    setupEventListeners() {
        let isMouseDown = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                this.camera.orbit(deltaX, deltaY);
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.zoom(e.deltaY * 0.01);
        });
    }

    // 3D到2D坐标转换
    project3DTo2D(x, y, z) {
        const point4D = vec4.fromValues(x, y, z, 1);
        const viewPoint = vec4.create();
        const projectedPoint = vec4.create();
        
        // 应用视图变换
        vec4.transformMat4(viewPoint, point4D, this.camera.viewMatrix);
        
        // 应用投影变换
        vec4.transformMat4(projectedPoint, viewPoint, this.camera.projectionMatrix);
        
        // 透视除法
        if (projectedPoint[3] !== 0) {
            projectedPoint[0] /= projectedPoint[3];
            projectedPoint[1] /= projectedPoint[3];
        }
        
        // 转换到屏幕坐标
        const screenX = (projectedPoint[0] + 1) * this.canvas.width / 2;
        const screenY = (1 - projectedPoint[1]) * this.canvas.height / 2;
        
        return { x: screenX, y: screenY, z: projectedPoint[2] };
    }
}
```

### 实际应用示例

```javascript
class DataVisualization3D {
    constructor(canvas) {
        this.hybridRenderer = new HybridRenderer(canvas);
        this.dataPoints = [];
        this.hoveredPoint = null;
        
        this.init();
    }

    init() {
        // 创建3D数据点
        this.createDataPoints();
        
        // 添加2D UI渲染
        this.hybridRenderer.add2DRenderer((ctx) => {
            this.render2DUI(ctx);
        });
    }

    createDataPoints() {
        // 生成随机3D数据点
        for (let i = 0; i < 100; i++) {
            const point = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 10,
                value: Math.random() * 100,
                category: Math.floor(Math.random() * 5)
            };
            
            // 创建3D球体表示数据点
            const sphere = new Sphere(this.hybridRenderer.webglRenderer, 0.1);
            sphere.position = point;
            sphere.userData = point;
            
            // 根据类别设置颜色
            const colors = [
                [1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1],
                [1, 1, 0, 1], [1, 0, 1, 1]
            ];
            sphere.color = colors[point.category];
            
            this.dataPoints.push(point);
            this.hybridRenderer.add3DObject(sphere);
        }
    }

    render2DUI(ctx) {
        // 绘制坐标轴标签
        this.drawAxisLabels(ctx);
        
        // 绘制图例
        this.drawLegend(ctx);
        
        // 绘制悬停信息
        if (this.hoveredPoint) {
            this.drawTooltip(ctx, this.hoveredPoint);
        }
        
        // 绘制统计信息
        this.drawStats(ctx);
    }

    drawAxisLabels(ctx) {
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        // X轴标签
        const xAxisEnd = this.hybridRenderer.project3DTo2D(5, 0, 0);
        ctx.fillText('X轴', xAxisEnd.x, xAxisEnd.y - 10);
        
        // Y轴标签
        const yAxisEnd = this.hybridRenderer.project3DTo2D(0, 5, 0);
        ctx.fillText('Y轴', yAxisEnd.x - 20, yAxisEnd.y);
        
        // Z轴标签
        const zAxisEnd = this.hybridRenderer.project3DTo2D(0, 0, 5);
        ctx.fillText('Z轴', zAxisEnd.x + 10, zAxisEnd.y);
    }

    drawLegend(ctx) {
        const legendX = 20;
        const legendY = 20;
        const categories = ['类别A', '类别B', '类别C', '类别D', '类别E'];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(legendX - 10, legendY - 10, 120, categories.length * 25 + 20);
        
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(legendX - 10, legendY - 10, 120, categories.length * 25 + 20);
        
        categories.forEach((category, i) => {
            const y = legendY + i * 25;
            
            // 颜色方块
            ctx.fillStyle = colors[i];
            ctx.fillRect(legendX, y, 15, 15);
            
            // 文字
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(category, legendX + 20, y + 12);
        });
    }

    drawTooltip(ctx, point) {
        const screenPos = this.hybridRenderer.project3DTo2D(point.x, point.y, point.z);
        
        if (screenPos.z > 1) return; // 在相机后面
        
        const tooltip = `值: ${point.value.toFixed(2)}\n位置: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}, ${point.z.toFixed(1)})`;
        const lines = tooltip.split('\n');
        
        ctx.font = '12px Arial';
        const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const tooltipHeight = lines.length * 16 + 10;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(screenPos.x + 10, screenPos.y - tooltipHeight, maxWidth + 20, tooltipHeight);
        
        // 文字
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        lines.forEach((line, i) => {
            ctx.fillText(line, screenPos.x + 20, screenPos.y - tooltipHeight + 15 + i * 16);
        });
    }

    drawStats(ctx) {
        const statsX = this.hybridRenderer.canvas.width - 200;
        const statsY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(statsX - 10, statsY - 10, 190, 100);
        
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(statsX - 10, statsY - 10, 190, 100);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        const avgValue = this.dataPoints.reduce((sum, p) => sum + p.value, 0) / this.dataPoints.length;
        const minValue = Math.min(...this.dataPoints.map(p => p.value));
        const maxValue = Math.max(...this.dataPoints.map(p => p.value));
        
        ctx.fillText(`数据点数量: ${this.dataPoints.length}`, statsX, statsY + 15);
        ctx.fillText(`平均值: ${avgValue.toFixed(2)}`, statsX, statsY + 35);
        ctx.fillText(`最小值: ${minValue.toFixed(2)}`, statsX, statsY + 55);
        ctx.fillText(`最大值: ${maxValue.toFixed(2)}`, statsX, statsY + 75);
    }
}
```

## ⚡ 性能对比与优化

### 渲染性能测试

```javascript
class PerformanceComparison {
    constructor() {
        this.testResults = {
            canvas2D: [],
            webgl: [],
            hybrid: []
        };
    }

    // 测试Canvas 2D性能
    async testCanvas2D(iterations = 1000) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制复杂图形
            for (let j = 0; j < 100; j++) {
                ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 20 + 5,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.testResults.canvas2D.push({
            iterations,
            duration,
            fps: 1000 / (duration / iterations)
        });
        
        return duration;
    }

    // 测试WebGL性能
    async testWebGL(iterations = 1000) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const renderer = new WebGLRenderer(canvas);
        
        // 创建大量几何体
        const objects = [];
        for (let i = 0; i < 100; i++) {
            const sphere = new Sphere(renderer, 0.1);
            sphere.position.x = (Math.random() - 0.5) * 10;
            sphere.position.y = (Math.random() - 0.5) * 10;
            sphere.position.z = (Math.random() - 0.5) * 10;
            objects.push(sphere);
        }
        
        const camera = new Camera();
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            renderer.clear();
            objects.forEach(obj => obj.render(camera));
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.testResults.webgl.push({
            iterations,
            duration,
            fps: 1000 / (duration / iterations)
        });
        
        return duration;
    }

    // 生成性能报告
    generateReport() {
        const report = {
            canvas2D: this.calculateStats(this.testResults.canvas2D),
            webgl: this.calculateStats(this.testResults.webgl),
            hybrid: this.calculateStats(this.testResults.hybrid)
        };
        
        console.log('性能测试报告:');
        console.log('Canvas 2D:', report.canvas2D);
        console.log('WebGL:', report.webgl);
        console.log('混合渲染:', report.hybrid);
        
        return report;
    }

    calculateStats(results) {
        if (results.length === 0) return null;
        
        const durations = results.map(r => r.duration);
        const fpss = results.map(r => r.fps);
        
        return {
            avgDuration: durations.reduce((a, b) => a + b) / durations.length,
            maxDuration: Math.max(...durations),
            minDuration: Math.min(...durations),
            avgFPS: fpss.reduce((a, b) => a + b) / fpss.length,
            maxFPS: Math.max(...fpss),
            minFPS: Math.min(...fpss)
        };
    }
}
```

## 🛠️ 实用工具

### 矩阵数学库简化版

```javascript
const mat4 = {
    create() {
        return new Float32Array(16);
    },

    identity(out) {
        out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    },

    perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        
        out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
        out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
        
        return out;
    },

    lookAt(out, eye, center, up) {
        const eyex = eye[0], eyey = eye[1], eyez = eye[2];
        const centerx = center[0], centery = center[1], centerz = center[2];
        const upx = up[0], upy = up[1], upz = up[2];

        let z0 = eyex - centerx, z1 = eyey - centery, z2 = eyez - centerz;
        let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len; z1 *= len; z2 *= len;

        let x0 = upy * z2 - upz * z1;
        let x1 = upz * z0 - upx * z2;
        let x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0; x1 = 0; x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len; x1 *= len; x2 *= len;
        }

        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;

        out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
        out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
        out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;

        return out;
    },

    translate(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        return out;
    },

    rotateX(out, a, rad) {
        const s = Math.sin(rad), c = Math.cos(rad);
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        
        out[4] = a10 * c + a20 * s;
        out[5] = a11 * c + a21 * s;
        out[6] = a12 * c + a22 * s;
        out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s;
        out[9] = a21 * c - a11 * s;
        out[10] = a22 * c - a12 * s;
        out[11] = a23 * c - a13 * s;
        
        return out;
    },

    scale(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
        out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
        out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
        return out;
    }
};
```

## 🎯 实践练习

### 练习1：3D数据可视化
创建一个3D散点图，支持鼠标交互和数据标签显示。

### 练习2：混合UI
构建一个结合3D图形和2D UI的应用程序。

### 练习3：性能优化
对比不同渲染方案的性能，找出最优解决方案。

## 📊 技术选择指南

| 场景 | Canvas 2D | WebGL | 混合渲染 |
|------|-----------|-------|----------|
| 简单2D图形 | ✅ 推荐 | ❌ 过度 | ❌ 过度 |
| 复杂数据可视化 | ⚠️ 可行 | ✅ 推荐 | ✅ 最佳 |
| 3D图形 | ❌ 不支持 | ✅ 推荐 | ✅ 推荐 |
| 文字和UI | ✅ 推荐 | ⚠️ 复杂 | ✅ 最佳 |
| 移动端 | ✅ 兼容性好 | ⚠️ 性能差异大 | ⚠️ 需优化 |

通过本章学习，您应该掌握了WebGL的基础知识，能够创建简单的3D图形，并了解如何将Canvas 2D与WebGL结合使用，为复杂的可视化应用提供最佳的渲染方案。

## 📚 扩展阅读

- [WebGL基础教程](https://webglfundamentals.org/)
- [Three.js官方文档](https://threejs.org/docs/)
- [OpenGL编程指南](https://www.khronos.org/opengl/)
- [实时渲染技术](https://www.realtimerendering.com/) 