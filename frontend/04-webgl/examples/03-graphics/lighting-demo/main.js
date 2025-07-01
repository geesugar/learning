/**
 * 光照模型演示 - Phong 光照
 */

// 顶点着色器
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_normalMatrix;
    varying vec3 v_worldPos;
    varying vec3 v_normal;
    
    void main() {
        vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
        v_worldPos = worldPos.xyz;
        v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
        gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    }
`;

// 片段着色器
const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_lightPos;
    uniform vec3 u_lightColor;
    uniform vec3 u_viewPos;
    uniform vec3 u_objectColor;
    uniform float u_ambient;
    uniform float u_diffuse;
    uniform float u_specular;
    uniform float u_shininess;
    
    varying vec3 v_worldPos;
    varying vec3 v_normal;
    
    void main() {
        vec3 normal = normalize(v_normal);
        vec3 lightDir = normalize(u_lightPos - v_worldPos);
        vec3 viewDir = normalize(u_viewPos - v_worldPos);
        vec3 reflectDir = reflect(-lightDir, normal);
        
        // 环境光
        vec3 ambient = u_ambient * u_lightColor * u_objectColor;
        
        // 漫反射
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_diffuse * diff * u_lightColor * u_objectColor;
        
        // 镜面反射
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_shininess);
        vec3 specular = u_specular * spec * u_lightColor;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

class LightingDemo {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = WebGLUtils.getContext(this.canvas);
        
        this.lightPos = new Vec3(2, 2, 3);
        this.lightColor = new Vec3(1, 1, 1);
        this.viewPos = new Vec3(0, 0, 5);
        this.objectColor = new Vec3(1, 0.42, 0.42);
        this.ambient = 0.3;
        this.diffuse = 0.7;
        this.specular = 1.0;
        this.shininess = 32;
        this.autoRotate = true;
        this.rotation = 0;
        this.isPaused = false;
        
        // 性能监控（必须在render之前初始化）
        this.performanceMonitor = new PerformanceMonitor();
        
        this.init();
        this.setupEventListeners();
        this.render();
    }
    
    init() {
        this.program = WebGLUtils.createProgramFromSources(
            this.gl, vertexShaderSource, fragmentShaderSource
        );
        
        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            normal: this.gl.getAttribLocation(this.program, 'a_normal'),
            mvpMatrix: this.gl.getUniformLocation(this.program, 'u_mvpMatrix'),
            modelMatrix: this.gl.getUniformLocation(this.program, 'u_modelMatrix'),
            normalMatrix: this.gl.getUniformLocation(this.program, 'u_normalMatrix'),
            lightPos: this.gl.getUniformLocation(this.program, 'u_lightPos'),
            lightColor: this.gl.getUniformLocation(this.program, 'u_lightColor'),
            viewPos: this.gl.getUniformLocation(this.program, 'u_viewPos'),
            objectColor: this.gl.getUniformLocation(this.program, 'u_objectColor'),
            ambient: this.gl.getUniformLocation(this.program, 'u_ambient'),
            diffuse: this.gl.getUniformLocation(this.program, 'u_diffuse'),
            specular: this.gl.getUniformLocation(this.program, 'u_specular'),
            shininess: this.gl.getUniformLocation(this.program, 'u_shininess')
        };
        
        this.createGeometry();
        this.setupWebGL();
    }
    
    createGeometry() {
        const sphere = GeometryUtils.createSphere(1, 32, 16);
        this.vertexBuffer = WebGLUtils.createBuffer(this.gl, this.gl.ARRAY_BUFFER, sphere.vertices);
        this.indexBuffer = WebGLUtils.createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, sphere.indices);
        this.indexCount = sphere.indices.length;
    }
    
    setupWebGL() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
    }
    
    render() {
        this.performanceMonitor.update();
        this.updatePerformanceDisplay();
        
        if (!this.isPaused && this.autoRotate) {
            this.rotation += 0.01;
        }
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        const stride = 6 * 4;
        WebGLUtils.setVertexAttribute(this.gl, this.locations.position, 3, this.gl.FLOAT, false, stride, 0);
        WebGLUtils.setVertexAttribute(this.gl, this.locations.normal, 3, this.gl.FLOAT, false, stride, 3*4);
        
        const matrices = this.calculateMatrices();
        
        this.gl.uniformMatrix4fv(this.locations.mvpMatrix, false, matrices.mvp.elements);
        this.gl.uniformMatrix4fv(this.locations.modelMatrix, false, matrices.model.elements);
        this.gl.uniformMatrix4fv(this.locations.normalMatrix, false, matrices.normal.elements);
        
        this.gl.uniform3f(this.locations.lightPos, this.lightPos.x, this.lightPos.y, this.lightPos.z);
        this.gl.uniform3f(this.locations.lightColor, this.lightColor.x, this.lightColor.y, this.lightColor.z);
        this.gl.uniform3f(this.locations.viewPos, this.viewPos.x, this.viewPos.y, this.viewPos.z);
        this.gl.uniform3f(this.locations.objectColor, this.objectColor.x, this.objectColor.y, this.objectColor.z);
        this.gl.uniform1f(this.locations.ambient, this.ambient);
        this.gl.uniform1f(this.locations.diffuse, this.diffuse);
        this.gl.uniform1f(this.locations.specular, this.specular);
        this.gl.uniform1f(this.locations.shininess, this.shininess);
        
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
        
        requestAnimationFrame(() => this.render());
    }
    
    calculateMatrices() {
        const model = new Mat4().rotateY(this.rotation).rotateX(this.rotation * 0.5);
        const view = new Mat4().lookAt(this.viewPos, new Vec3(0, 0, 0), new Vec3(0, 1, 0));
        const projection = new Mat4().perspective(
            MathUtils.degToRad(60), 
            this.canvas.width / this.canvas.height, 
            0.1, 100
        );
        const mvp = projection.multiply(view).multiply(model);
        const normal = model.copy().invert().transpose();
        
        return { model, view, projection, mvp, normal };
    }
    
    setupEventListeners() {
        ['X', 'Y', 'Z'].forEach(axis => {
            const slider = document.getElementById(`light${axis}`);
            const value = document.getElementById(`light${axis}Value`);
            slider.addEventListener('input', (e) => {
                this.lightPos[axis.toLowerCase()] = parseFloat(e.target.value);
                value.textContent = e.target.value;
            });
        });
        
        document.getElementById('lightColor').addEventListener('input', (e) => {
            const color = this.hexToRgb(e.target.value);
            this.lightColor.set(color.r / 255, color.g / 255, color.b / 255);
        });
        
        ['ambient', 'diffuse', 'specular', 'shininess'].forEach(param => {
            const slider = document.getElementById(param);
            const value = document.getElementById(`${param}Value`);
            slider.addEventListener('input', (e) => {
                this[param] = parseFloat(e.target.value);
                value.textContent = e.target.value;
            });
        });
        
        document.getElementById('objectColor').addEventListener('input', (e) => {
            const color = this.hexToRgb(e.target.value);
            this.objectColor.set(color.r / 255, color.g / 255, color.b / 255);
        });
        
        document.getElementById('autoRotate').addEventListener('change', (e) => {
            this.autoRotate = e.target.checked;
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        });
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    updatePerformanceDisplay() {
        document.getElementById('fps').textContent = this.performanceMonitor.getFPS().toFixed(0);
        document.getElementById('frameTime').textContent = this.performanceMonitor.getFrameTime().toFixed(1);
    }
    
    reset() {
        this.lightPos.set(2, 2, 3);
        this.lightColor.set(1, 1, 1);
        this.objectColor.set(1, 0.42, 0.42);
        this.ambient = 0.3;
        this.diffuse = 0.7;
        this.specular = 1.0;
        this.shininess = 32;
        this.autoRotate = true;
        this.isPaused = false;
    }
}

window.addEventListener('load', () => {
    new LightingDemo();
}); 