/**
 * 第一个三角形 - WebGL 基础示例
 * 展示 WebGL 的基本渲染流程
 */

// 顶点着色器源码
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform float u_rotation;
    uniform vec2 u_resolution;
    
    void main() {
        // 应用旋转变换
        float c = cos(u_rotation);
        float s = sin(u_rotation);
        vec2 rotatedPosition = vec2(
            a_position.x * c - a_position.y * s,
            a_position.x * s + a_position.y * c
        );
        
        // 转换到裁剪空间坐标
        vec2 clipSpace = (rotatedPosition / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;

// 片段着色器源码
const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;
    
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

// 主应用类
class FirstTriangleDemo {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = WebGLUtils.getContext(this.canvas);
        
        if (!this.gl) {
            this.showError('您的浏览器不支持 WebGL');
            return;
        }
        
        // 动画状态
        this.rotation = 0;
        this.rotationSpeed = 1.0;
        this.isPaused = false;
        this.animationId = null;
        
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
        
        if (!this.program) {
            this.showError('着色器程序创建失败');
            return;
        }
        
        // 获取属性和统一变量位置
        this.attributeLocations = {
            position: this.gl.getAttribLocation(this.program, 'a_position')
        };
        
        this.uniformLocations = {
            rotation: this.gl.getUniformLocation(this.program, 'u_rotation'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            color: this.gl.getUniformLocation(this.program, 'u_color')
        };
        
        // 创建三角形顶点数据
        this.createGeometry();
        
        // 设置 WebGL 状态
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
    }
    
    createGeometry() {
        // 三角形顶点坐标（屏幕像素坐标）
        const vertices = new Float32Array([
            // 顶点
             0,   100,  // 顶点
            -87,  -50,  // 左下
             87,  -50   // 右下
        ]);
        
        // 创建顶点缓冲区
        this.vertexBuffer = WebGLUtils.createBuffer(
            this.gl, 
            this.gl.ARRAY_BUFFER, 
            vertices
        );
    }
    
    render() {
        this.performanceMonitor.update();
        this.updatePerformanceDisplay();
        
        // 调整画布大小
        WebGLUtils.resizeCanvas(this.canvas, this.gl);
        
        // 清除画布
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // 使用着色器程序
        this.gl.useProgram(this.program);
        
        // 绑定顶点缓冲区
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        
        // 设置顶点属性
        WebGLUtils.setVertexAttribute(
            this.gl,
            this.attributeLocations.position,
            2  // 2个分量 (x, y)
        );
        
        // 设置统一变量
        this.gl.uniform1f(this.uniformLocations.rotation, this.rotation);
        this.gl.uniform2f(
            this.uniformLocations.resolution, 
            this.canvas.width, 
            this.canvas.height
        );
        
        // 设置颜色
        const color = this.hexToRgb(
            document.getElementById('triangleColor').value
        );
        this.gl.uniform3f(
            this.uniformLocations.color,
            color.r / 255,
            color.g / 255,
            color.b / 255
        );
        
        // 绘制三角形
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        
        // 更新旋转角度
        if (!this.isPaused) {
            this.rotation += 0.01 * this.rotationSpeed;
        }
        
        // 继续动画循环
        this.animationId = requestAnimationFrame(() => this.render());
    }
    
    setupEventListeners() {
        // 旋转速度控制
        const rotationSpeedSlider = document.getElementById('rotationSpeed');
        const rotationSpeedValue = document.getElementById('rotationSpeedValue');
        
        rotationSpeedSlider.addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
            rotationSpeedValue.textContent = this.rotationSpeed.toFixed(1);
        });
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.rotation = 0;
            this.rotationSpeed = 1.0;
            this.isPaused = false;
            rotationSpeedSlider.value = '1';
            rotationSpeedValue.textContent = '1.0';
            document.getElementById('pauseBtn').textContent = '暂停';
        });
        
        // 暂停/继续按钮
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        });
        
        // 窗口大小变化处理
        window.addEventListener('resize', () => {
            WebGLUtils.resizeCanvas(this.canvas, this.gl);
        });
    }
    
    updatePerformanceDisplay() {
        document.getElementById('fps').textContent = 
            this.performanceMonitor.getFPS().toFixed(0);
        document.getElementById('frameTime').textContent = 
            this.performanceMonitor.getFrameTime().toFixed(1);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 107, b: 107 };
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
        
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        
        if (this.gl && this.vertexBuffer) {
            this.gl.deleteBuffer(this.vertexBuffer);
        }
    }
}

// 启动应用
window.addEventListener('load', () => {
    try {
        new FirstTriangleDemo();
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