/**
 * WebGL 公共工具函数库
 * 提供常用的 WebGL 操作函数
 */

// WebGL 工具类
class WebGLUtils {
    /**
     * 创建着色器
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {number} type - 着色器类型
     * @param {string} source - 着色器源码
     * @returns {WebGLShader|null} 着色器对象
     */
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
    
    /**
     * 创建着色器程序
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {WebGLShader} vertexShader - 顶点着色器
     * @param {WebGLShader} fragmentShader - 片段着色器
     * @returns {WebGLProgram|null} 着色器程序
     */
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
    
    /**
     * 从源码创建着色器程序
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {string} vertexSource - 顶点着色器源码
     * @param {string} fragmentSource - 片段着色器源码
     * @returns {WebGLProgram|null} 着色器程序
     */
    static createProgramFromSources(gl, vertexSource, fragmentSource) {
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        return this.createProgram(gl, vertexShader, fragmentShader);
    }
    
    /**
     * 调整画布大小
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @returns {boolean} 是否改变了大小
     */
    static resizeCanvas(canvas, gl) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            gl.viewport(0, 0, displayWidth, displayHeight);
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查 WebGL 错误
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {string} operation - 操作描述
     */
    static checkError(gl, operation) {
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error(`WebGL 错误 ${operation}: ${error}`);
        }
    }
    
    /**
     * 创建缓冲区
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {number} target - 缓冲区目标
     * @param {ArrayBuffer|ArrayBufferView} data - 数据
     * @param {number} usage - 使用方式
     * @returns {WebGLBuffer} 缓冲区对象
     */
    static createBuffer(gl, target, data, usage = gl.STATIC_DRAW) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, usage);
        return buffer;
    }
    
    /**
     * 设置顶点属性
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {number} location - 属性位置
     * @param {number} size - 组件数量
     * @param {number} type - 数据类型
     * @param {boolean} normalized - 是否归一化
     * @param {number} stride - 步长
     * @param {number} offset - 偏移
     */
    static setVertexAttribute(gl, location, size, type = gl.FLOAT, normalized = false, stride = 0, offset = 0) {
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
    }
    
    /**
     * 加载纹理
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @param {string} url - 图片URL
     * @param {Function} callback - 加载完成回调
     * @returns {WebGLTexture} 纹理对象
     */
    static loadTexture(gl, url, callback) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // 设置临时纹理
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            // 检查是否为 2 的幂
            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            
            if (callback) callback(texture);
        };
        
        image.src = url;
        return texture;
    }
    
    /**
     * 检查是否为 2 的幂
     * @param {number} value - 值
     * @returns {boolean} 是否为 2 的幂
     */
    static isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    
    /**
     * 获取 WebGL 上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Object} options - 上下文选项
     * @returns {WebGLRenderingContext|null} WebGL 上下文
     */
    static getContext(canvas, options = {}) {
        const gl = canvas.getContext('webgl', options) || 
                   canvas.getContext('experimental-webgl', options);
        
        if (!gl) {
            console.error('WebGL 不支持');
            return null;
        }
        
        return gl;
    }
    
    /**
     * 获取 WebGL 信息
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     * @returns {Object} WebGL 信息
     */
    static getWebGLInfo(gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        
        return {
            version: gl.getParameter(gl.VERSION),
            vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
            renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
            maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
        };
    }
}

// 几何体生成工具
class GeometryUtils {
    /**
     * 创建立方体几何体
     * @param {number} size - 立方体大小
     * @returns {Object} 包含顶点、法线、纹理坐标和索引的对象
     */
    static createCube(size = 1) {
        const s = size / 2;
        
        const vertices = [
            // 前面
            -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
            // 后面
            -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s, -s,
            // 上面
            -s,  s, -s, -s,  s,  s,  s,  s,  s,  s,  s, -s,
            // 下面
            -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
            // 右面
             s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
            // 左面
            -s, -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s
        ];
        
        const normals = [
            // 前面
             0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
            // 后面
             0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
            // 上面
             0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,
            // 下面
             0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
            // 右面
             1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
            // 左面
            -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0
        ];
        
        const texCoords = [
            // 前面
            0, 0,  1, 0,  1, 1,  0, 1,
            // 后面
            1, 0,  1, 1,  0, 1,  0, 0,
            // 上面
            0, 1,  0, 0,  1, 0,  1, 1,
            // 下面
            1, 1,  0, 1,  0, 0,  1, 0,
            // 右面
            1, 0,  1, 1,  0, 1,  0, 0,
            // 左面
            0, 0,  1, 0,  1, 1,  0, 1
        ];
        
        const indices = [
             0,  1,  2,   0,  2,  3,    // 前面
             4,  5,  6,   4,  6,  7,    // 后面
             8,  9, 10,   8, 10, 11,    // 上面
            12, 13, 14,  12, 14, 15,    // 下面
            16, 17, 18,  16, 18, 19,    // 右面
            20, 21, 22,  20, 22, 23     // 左面
        ];
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices)
        };
    }
    
    /**
     * 创建球体几何体
     * @param {number} radius - 球体半径
     * @param {number} widthSegments - 宽度分段数
     * @param {number} heightSegments - 高度分段数
     * @returns {Object} 包含交错顶点数据和索引的对象
     */
    static createSphere(radius = 1, widthSegments = 32, heightSegments = 16) {
        const vertices = [];
        const indices = [];
        
        for (let lat = 0; lat <= heightSegments; lat++) {
            const theta = lat * Math.PI / heightSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= widthSegments; lon++) {
                const phi = lon * 2 * Math.PI / widthSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                
                // 交错存储：位置 + 法线
                vertices.push(
                    radius * x, radius * y, radius * z,  // 位置
                    x, y, z                              // 法线
                );
            }
        }
        
        for (let lat = 0; lat < heightSegments; lat++) {
            for (let lon = 0; lon < widthSegments; lon++) {
                const first = (lat * (widthSegments + 1)) + lon;
                const second = first + widthSegments + 1;
                
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        
        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices)
        };
    }
    
    /**
     * 创建平面几何体
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {Object} 包含顶点、法线、纹理坐标和索引的对象
     */
    static createPlane(width = 1, height = 1) {
        const w = width / 2;
        const h = height / 2;
        
        const vertices = [
            -w, -h, 0,
             w, -h, 0,
             w,  h, 0,
            -w,  h, 0
        ];
        
        const normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];
        
        const texCoords = [
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ];
        
        const indices = [
            0, 1, 2,
            0, 2, 3
        ];
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices)
        };
    }
}

// 性能监控工具
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.frameTime = 0;
    }
    
    /**
     * 更新性能统计
     */
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        this.frameTime = currentTime - this.lastTime;
        
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / (this.frameTime / 60));
        }
        
        this.lastTime = currentTime;
    }
    
    /**
     * 获取 FPS
     * @returns {number} 当前 FPS
     */
    getFPS() {
        return this.fps;
    }
    
    /**
     * 获取帧时间
     * @returns {number} 帧时间（毫秒）
     */
    getFrameTime() {
        return this.frameTime;
    }
}

// 输入控制工具
class InputController {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.keys = {};
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.mouseDown) {
                const deltaX = e.clientX - this.mouseX;
                const deltaY = e.clientY - this.mouseY;
                this.onMouseMove(deltaX, deltaY);
            }
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 滚轮事件
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.onWheel(e.deltaY);
        });
    }
    
    onMouseMove(deltaX, deltaY) {
        // 子类可以重写这个方法
    }
    
    onWheel(delta) {
        // 子类可以重写这个方法
    }
    
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
} 