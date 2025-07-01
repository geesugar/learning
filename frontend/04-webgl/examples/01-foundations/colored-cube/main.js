/**
 * 彩色立方体 - 3D 渲染基础示例
 * 展示 3D 坐标变换、深度测试、索引缓冲区等概念
 */

// 顶点着色器源码
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    
    uniform mat4 u_mvpMatrix;
    
    varying vec3 v_color;
    
    void main() {
        gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
        v_color = a_color;
    }
`;

// 片段着色器源码
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    
    void main() {
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

// 线框着色器源码
const wireframeFragmentShaderSource = `
    precision mediump float;
    
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

// 主应用类
class ColoredCubeDemo {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = WebGLUtils.getContext(this.canvas);
        
        if (!this.gl) {
            this.showError('您的浏览器不支持 WebGL');
            return;
        }
        
        // 变换参数
        this.rotation = { x: 30, y: 45, z: 0 };
        this.scale = 1.0;
        this.fov = 60;
        
        // 动画状态
        this.autoRotate = true;
        this.rotationSpeed = 1.0;
        this.isPaused = false;
        this.animationId = null;
        this.time = 0;
        
        // 渲染选项
        this.wireframe = false;
        this.depthTest = true;
        this.backfaceCulling = true;
        
        // 性能监控（必须在render之前初始化）
        this.performanceMonitor = new PerformanceMonitor();
        
        // 初始化
        this.init();
        this.setupEventListeners();
        this.render();
    }
    
    init() {
        // 创建着色器程序
        this.program = WebGLUtils.createProgramFromSources(
            this.gl, 
            vertexShaderSource, 
            fragmentShaderSource
        );
        
        this.wireframeProgram = WebGLUtils.createProgramFromSources(
            this.gl, 
            vertexShaderSource, 
            wireframeFragmentShaderSource
        );
        
        if (!this.program || !this.wireframeProgram) {
            this.showError('着色器程序创建失败');
            return;
        }
        
        // 获取属性和统一变量位置
        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            color: this.gl.getAttribLocation(this.program, 'a_color'),
            mvpMatrix: this.gl.getUniformLocation(this.program, 'u_mvpMatrix')
        };
        
        // 创建立方体几何体
        this.createGeometry();
        
        // 设置 WebGL 状态
        this.setupWebGL();
    }
    
    createGeometry() {
        // 立方体顶点坐标和颜色
        const vertices = new Float32Array([
            // 位置              // 颜色
            // 前面
            -1, -1,  1,        1, 0, 0,    // 红色
             1, -1,  1,        0, 1, 0,    // 绿色
             1,  1,  1,        0, 0, 1,    // 蓝色
            -1,  1,  1,        1, 1, 0,    // 黄色
            
            // 后面
            -1, -1, -1,        1, 0, 1,    // 品红
             1, -1, -1,        0, 1, 1,    // 青色
             1,  1, -1,        0.5, 0.5, 0.5, // 灰色
            -1,  1, -1,        1, 1, 1     // 白色
        ]);
        
        // 立方体索引（每个面两个三角形）
        const indices = new Uint16Array([
            // 前面
            0, 1, 2,   2, 3, 0,
            // 后面
            4, 6, 5,   6, 4, 7,
            // 左面
            4, 0, 3,   3, 7, 4,
            // 右面
            1, 5, 6,   6, 2, 1,
            // 上面
            3, 2, 6,   6, 7, 3,
            // 下面
            4, 5, 1,   1, 0, 4
        ]);
        
        // 创建顶点缓冲区
        this.vertexBuffer = WebGLUtils.createBuffer(
            this.gl, 
            this.gl.ARRAY_BUFFER, 
            vertices
        );
        
        // 创建索引缓冲区
        this.indexBuffer = WebGLUtils.createBuffer(
            this.gl, 
            this.gl.ELEMENT_ARRAY_BUFFER, 
            indices
        );
        
        this.indexCount = indices.length;
    }
    
    setupWebGL() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        
        // 启用深度测试
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        // 启用背面剔除
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
    }
    
    render() {
        this.performanceMonitor.update();
        this.updatePerformanceDisplay();
        
        // 调整画布大小
        WebGLUtils.resizeCanvas(this.canvas, this.gl);
        
        // 更新动画时间
        if (!this.isPaused) {
            this.time += 0.016 * this.rotationSpeed;
            
            if (this.autoRotate) {
                this.rotation.x += 0.5 * this.rotationSpeed;
                this.rotation.y += 1.0 * this.rotationSpeed;
                
                // 更新滑块显示
                this.updateSliderValues();
            }
        }
        
        // 设置渲染状态
        this.updateRenderState();
        
        // 清除画布
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // 计算变换矩阵
        const mvpMatrix = this.calculateMVPMatrix();
        
        // 选择着色器程序
        const program = this.wireframe ? this.wireframeProgram : this.program;
        
        // 使用着色器程序
        this.gl.useProgram(program);
        
        // 绑定缓冲区
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        // 设置顶点属性
        this.setupVertexAttributes();
        
        // 设置变换矩阵
        this.gl.uniformMatrix4fv(this.locations.mvpMatrix, false, mvpMatrix.elements);
        
        // 绘制立方体
        if (this.wireframe) {
            // 线框模式：绘制线条
            this.gl.drawElements(this.gl.LINES, this.getWireframeIndices().length, this.gl.UNSIGNED_SHORT, 0);
        } else {
            // 实体模式：绘制三角形
            this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
        }
        
        // 继续动画循环
        this.animationId = requestAnimationFrame(() => this.render());
    }
    
    calculateMVPMatrix() {
        // 模型矩阵（变换）
        const modelMatrix = new Mat4()
            .scale(this.scale, this.scale, this.scale)
            .rotateX(MathUtils.degToRad(this.rotation.x))
            .rotateY(MathUtils.degToRad(this.rotation.y))
            .rotateZ(MathUtils.degToRad(this.rotation.z));
        
        // 视图矩阵（相机）
        const viewMatrix = new Mat4()
            .lookAt(
                new Vec3(0, 0, 5),  // 相机位置
                new Vec3(0, 0, 0),  // 目标点
                new Vec3(0, 1, 0)   // 上方向
            );
        
        // 投影矩阵（透视）
        const aspect = this.canvas.width / this.canvas.height;
        const projectionMatrix = new Mat4()
            .perspective(
                MathUtils.degToRad(this.fov),
                aspect,
                0.1,    // 近平面
                100.0   // 远平面
            );
        
        return projectionMatrix.multiply(viewMatrix).multiply(modelMatrix);
    }
    
    setupVertexAttributes() {
        const stride = 6 * 4; // 6个float，每个4字节
        
        // 位置属性
        WebGLUtils.setVertexAttribute(
            this.gl,
            this.locations.position,
            3,          // 3个分量 (x, y, z)
            this.gl.FLOAT,
            false,
            stride,
            0           // 偏移量
        );
        
        // 颜色属性
        if (this.locations.color >= 0) {
            WebGLUtils.setVertexAttribute(
                this.gl,
                this.locations.color,
                3,          // 3个分量 (r, g, b)
                this.gl.FLOAT,
                false,
                stride,
                3 * 4       // 偏移量：3个float之后
            );
        }
    }
    
    getWireframeIndices() {
        // 立方体的边线索引
        return new Uint16Array([
            // 前面
            0, 1,  1, 2,  2, 3,  3, 0,
            // 后面
            4, 5,  5, 6,  6, 7,  7, 4,
            // 连接前后面
            0, 4,  1, 5,  2, 6,  3, 7
        ]);
    }
    
    updateRenderState() {
        // 深度测试
        if (this.depthTest) {
            this.gl.enable(this.gl.DEPTH_TEST);
        } else {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
        
        // 背面剔除
        if (this.backfaceCulling) {
            this.gl.enable(this.gl.CULL_FACE);
        } else {
            this.gl.disable(this.gl.CULL_FACE);
        }
        
        // 线框模式需要特殊处理
        if (this.wireframe) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.getWireframeIndices(), this.gl.STATIC_DRAW);
        } else {
            this.createGeometry(); // 重新创建正常的索引缓冲区
        }
    }
    
    setupEventListeners() {
        // 旋转控制
        this.setupRotationControls();
        
        // 缩放控制
        this.setupScaleControls();
        
        // FOV控制
        this.setupFOVControls();
        
        // 动画控制
        this.setupAnimationControls();
        
        // 渲染选项
        this.setupRenderOptions();
        
        // 按钮控制
        this.setupButtonControls();
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            WebGLUtils.resizeCanvas(this.canvas, this.gl);
        });
    }
    
    setupRotationControls() {
        ['X', 'Y', 'Z'].forEach(axis => {
            const slider = document.getElementById(`rotation${axis}`);
            const value = document.getElementById(`rotation${axis}Value`);
            
            slider.addEventListener('input', (e) => {
                this.rotation[axis.toLowerCase()] = parseFloat(e.target.value);
                value.textContent = `${e.target.value}°`;
            });
        });
    }
    
    setupScaleControls() {
        const scaleSlider = document.getElementById('scale');
        const scaleValue = document.getElementById('scaleValue');
        
        scaleSlider.addEventListener('input', (e) => {
            this.scale = parseFloat(e.target.value);
            scaleValue.textContent = this.scale.toFixed(1);
        });
    }
    
    setupFOVControls() {
        const fovSlider = document.getElementById('fov');
        const fovValue = document.getElementById('fovValue');
        
        fovSlider.addEventListener('input', (e) => {
            this.fov = parseFloat(e.target.value);
            fovValue.textContent = `${e.target.value}°`;
        });
    }
    
    setupAnimationControls() {
        // 自动旋转
        document.getElementById('autoRotate').addEventListener('change', (e) => {
            this.autoRotate = e.target.checked;
        });
        
        // 旋转速度
        const speedSlider = document.getElementById('rotationSpeed');
        const speedValue = document.getElementById('rotationSpeedValue');
        
        speedSlider.addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.rotationSpeed.toFixed(1);
        });
    }
    
    setupRenderOptions() {
        // 线框模式
        document.getElementById('wireframe').addEventListener('change', (e) => {
            this.wireframe = e.target.checked;
        });
        
        // 深度测试
        document.getElementById('depthTest').addEventListener('change', (e) => {
            this.depthTest = e.target.checked;
        });
        
        // 背面剔除
        document.getElementById('backfaceCulling').addEventListener('change', (e) => {
            this.backfaceCulling = e.target.checked;
        });
    }
    
    setupButtonControls() {
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetToDefaults();
        });
        
        // 暂停按钮
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        });
    }
    
    resetToDefaults() {
        this.rotation = { x: 30, y: 45, z: 0 };
        this.scale = 1.0;
        this.fov = 60;
        this.autoRotate = true;
        this.rotationSpeed = 1.0;
        this.isPaused = false;
        this.wireframe = false;
        this.depthTest = true;
        this.backfaceCulling = true;
        
        // 重置UI控件
        document.getElementById('rotationX').value = '30';
        document.getElementById('rotationY').value = '45';
        document.getElementById('rotationZ').value = '0';
        document.getElementById('scale').value = '1';
        document.getElementById('fov').value = '60';
        document.getElementById('autoRotate').checked = true;
        document.getElementById('rotationSpeed').value = '1';
        document.getElementById('wireframe').checked = false;
        document.getElementById('depthTest').checked = true;
        document.getElementById('backfaceCulling').checked = true;
        document.getElementById('pauseBtn').textContent = '暂停';
        
        this.updateSliderValues();
    }
    
    updateSliderValues() {
        document.getElementById('rotationXValue').textContent = `${Math.round(this.rotation.x % 360)}°`;
        document.getElementById('rotationYValue').textContent = `${Math.round(this.rotation.y % 360)}°`;
        document.getElementById('rotationZValue').textContent = `${Math.round(this.rotation.z % 360)}°`;
        
        document.getElementById('rotationX').value = Math.round(this.rotation.x % 360);
        document.getElementById('rotationY').value = Math.round(this.rotation.y % 360);
        document.getElementById('rotationZ').value = Math.round(this.rotation.z % 360);
    }
    
    updatePerformanceDisplay() {
        document.getElementById('fps').textContent = 
            this.performanceMonitor.getFPS().toFixed(0);
        document.getElementById('frameTime').textContent = 
            this.performanceMonitor.getFrameTime().toFixed(1);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.querySelector('.container').appendChild(errorDiv);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.gl) {
            if (this.program) this.gl.deleteProgram(this.program);
            if (this.wireframeProgram) this.gl.deleteProgram(this.wireframeProgram);
            if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
            if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);
        }
    }
}

// 启动应用
window.addEventListener('load', () => {
    try {
        window.demo = new ColoredCubeDemo();
    } catch (error) {
        console.error('应用启动失败:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `应用启动失败: ${error.message}`;
        document.querySelector('.container').appendChild(errorDiv);
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.demo) {
        window.demo.destroy();
    }
}); 