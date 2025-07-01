# 光照模型

## 📖 本章概述

光照是 3D 图形渲染中最重要的视觉效果之一。本章将深入探讨光照的物理原理、数学模型和实现技术，帮助您创建逼真的光照效果。

## 🎯 学习目标

- 理解光照的物理基础和数学原理
- 掌握环境光、漫反射、镜面反射的计算
- 实现 Phong 和 Blinn-Phong 光照模型
- 构建多光源渲染系统
- 学会光照计算的优化技术

## 1. 光照基础理论

### 1.1 光照的物理基础

光照模拟了光线与物体表面的相互作用。在计算机图形学中，我们通过数学模型来近似这种复杂的物理过程。

#### 光线的基本性质
- **强度（Intensity）**：光线的亮度
- **颜色（Color）**：光线的波长组成
- **方向（Direction）**：光线的传播方向
- **衰减（Attenuation）**：光线随距离的减弱

#### 表面材质属性
- **反射率（Reflectance）**：表面反射光线的能力
- **漫反射系数（Diffuse Coefficient）**：漫反射的强度
- **镜面反射系数（Specular Coefficient）**：镜面反射的强度
- **光泽度（Shininess）**：镜面反射的锐利程度

### 1.2 光照模型分类

#### 局部光照模型
只考虑光源和表面之间的直接相互作用：
- Phong 模型
- Blinn-Phong 模型
- Lambert 模型

#### 全局光照模型
考虑光线在场景中的多次反射：
- 光线追踪
- 辐射度算法
- 全局光照近似

## 2. 基础光照组件

### 2.1 环境光（Ambient Light）

模拟场景中的间接光照，提供基础亮度：

```glsl
// 顶点着色器
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_normalMatrix;

varying vec3 v_worldPosition;
varying vec3 v_normal;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_worldPosition = (u_modelMatrix * vec4(a_position, 1.0)).xyz;
    v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
}
```

```glsl
// 片段着色器
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;

uniform vec3 u_ambientLight;
uniform vec3 u_materialAmbient;

void main() {
    // 环境光计算
    vec3 ambient = u_ambientLight * u_materialAmbient;
    
    gl_FragColor = vec4(ambient, 1.0);
}
```

#### JavaScript 环境光设置
```javascript
class AmbientLight {
    constructor(color = [0.2, 0.2, 0.2], intensity = 1.0) {
        this.color = color;
        this.intensity = intensity;
    }
    
    getColor() {
        return [
            this.color[0] * this.intensity,
            this.color[1] * this.intensity,
            this.color[2] * this.intensity
        ];
    }
    
    applyToShader(gl, program) {
        const location = gl.getUniformLocation(program, 'u_ambientLight');
        gl.uniform3fv(location, this.getColor());
    }
}
```

### 2.2 漫反射（Diffuse Reflection）

基于 Lambert 定律，表面在各个方向均匀反射光线：

```glsl
// 片段着色器 - 漫反射计算
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_materialDiffuse;

void main() {
    // 计算光线方向
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    
    // 计算法线和光线的夹角
    float diffuseFactor = max(dot(v_normal, lightDirection), 0.0);
    
    // 漫反射计算
    vec3 diffuse = u_lightColor * u_materialDiffuse * diffuseFactor;
    
    gl_FragColor = vec4(diffuse, 1.0);
}
```

#### 漫反射光源类
```javascript
class DirectionalLight {
    constructor(direction = [0, -1, 0], color = [1, 1, 1], intensity = 1.0) {
        this.direction = this.normalize(direction);
        this.color = color;
        this.intensity = intensity;
    }
    
    normalize(vec) {
        const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
        return [vec[0] / length, vec[1] / length, vec[2] / length];
    }
    
    applyToShader(gl, program) {
        const dirLocation = gl.getUniformLocation(program, 'u_lightDirection');
        const colorLocation = gl.getUniformLocation(program, 'u_lightColor');
        
        gl.uniform3fv(dirLocation, [-this.direction[0], -this.direction[1], -this.direction[2]]);
        gl.uniform3fv(colorLocation, [
            this.color[0] * this.intensity,
            this.color[1] * this.intensity,
            this.color[2] * this.intensity
        ]);
    }
}
```

### 2.3 镜面反射（Specular Reflection）

模拟光滑表面的高光效果：

```glsl
// 片段着色器 - 镜面反射计算
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform vec3 u_materialSpecular;
uniform float u_shininess;

void main() {
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    vec3 viewDirection = normalize(u_cameraPosition - v_worldPosition);
    
    // 计算反射向量
    vec3 reflectDirection = reflect(-lightDirection, v_normal);
    
    // 计算镜面反射因子
    float specularFactor = pow(max(dot(viewDirection, reflectDirection), 0.0), u_shininess);
    
    // 镜面反射计算
    vec3 specular = u_lightColor * u_materialSpecular * specularFactor;
    
    gl_FragColor = vec4(specular, 1.0);
}
```

## 3. Phong 光照模型

### 3.1 完整的 Phong 模型

Phong 模型结合了环境光、漫反射和镜面反射：

```glsl
// 完整的 Phong 光照片段着色器
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;

// 光源属性
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_ambientLight;
uniform vec3 u_cameraPosition;

// 材质属性
uniform vec3 u_materialAmbient;
uniform vec3 u_materialDiffuse;
uniform vec3 u_materialSpecular;
uniform float u_shininess;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    vec3 viewDirection = normalize(u_cameraPosition - v_worldPosition);
    vec3 reflectDirection = reflect(-lightDirection, normal);
    
    // 环境光
    vec3 ambient = u_ambientLight * u_materialAmbient;
    
    // 漫反射
    float diffuseFactor = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = u_lightColor * u_materialDiffuse * diffuseFactor;
    
    // 镜面反射
    float specularFactor = pow(max(dot(viewDirection, reflectDirection), 0.0), u_shininess);
    vec3 specular = u_lightColor * u_materialSpecular * specularFactor;
    
    // 最终颜色
    vec3 finalColor = ambient + diffuse + specular;
    gl_FragColor = vec4(finalColor, 1.0);
}
```

### 3.2 Phong 材质类

```javascript
class PhongMaterial {
    constructor(options = {}) {
        this.ambient = options.ambient || [0.2, 0.2, 0.2];
        this.diffuse = options.diffuse || [0.8, 0.8, 0.8];
        this.specular = options.specular || [1.0, 1.0, 1.0];
        this.shininess = options.shininess || 32.0;
    }
    
    applyToShader(gl, program) {
        const ambientLoc = gl.getUniformLocation(program, 'u_materialAmbient');
        const diffuseLoc = gl.getUniformLocation(program, 'u_materialDiffuse');
        const specularLoc = gl.getUniformLocation(program, 'u_materialSpecular');
        const shininessLoc = gl.getUniformLocation(program, 'u_shininess');
        
        gl.uniform3fv(ambientLoc, this.ambient);
        gl.uniform3fv(diffuseLoc, this.diffuse);
        gl.uniform3fv(specularLoc, this.specular);
        gl.uniform1f(shininessLoc, this.shininess);
    }
}

// 预设材质
const Materials = {
    emerald: new PhongMaterial({
        ambient: [0.0215, 0.1745, 0.0215],
        diffuse: [0.07568, 0.61424, 0.07568],
        specular: [0.633, 0.727811, 0.633],
        shininess: 76.8
    }),
    
    gold: new PhongMaterial({
        ambient: [0.24725, 0.1995, 0.0745],
        diffuse: [0.75164, 0.60648, 0.22648],
        specular: [0.628281, 0.555802, 0.366065],
        shininess: 51.2
    }),
    
    silver: new PhongMaterial({
        ambient: [0.19225, 0.19225, 0.19225],
        diffuse: [0.50754, 0.50754, 0.50754],
        specular: [0.508273, 0.508273, 0.508273],
        shininess: 51.2
    })
};
```

## 4. Blinn-Phong 光照模型

### 4.1 半角向量法

Blinn-Phong 模型使用半角向量替代反射向量，计算更高效：

```glsl
// Blinn-Phong 光照片段着色器
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform vec3 u_materialSpecular;
uniform float u_shininess;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    vec3 viewDirection = normalize(u_cameraPosition - v_worldPosition);
    
    // 计算半角向量
    vec3 halfwayDirection = normalize(lightDirection + viewDirection);
    
    // 使用半角向量计算镜面反射
    float specularFactor = pow(max(dot(normal, halfwayDirection), 0.0), u_shininess);
    vec3 specular = u_lightColor * u_materialSpecular * specularFactor;
    
    gl_FragColor = vec4(specular, 1.0);
}
```

### 4.2 Phong vs Blinn-Phong 对比

```javascript
class LightingComparison {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.phongProgram = this.createPhongProgram();
        this.blinnPhongProgram = this.createBlinnPhongProgram();
        this.currentModel = 'phong';
    }
    
    createPhongProgram() {
        const vertexShader = `
            attribute vec3 a_position;
            attribute vec3 a_normal;
            
            uniform mat4 u_mvpMatrix;
            uniform mat4 u_modelMatrix;
            uniform mat4 u_normalMatrix;
            
            varying vec3 v_worldPosition;
            varying vec3 v_normal;
            
            void main() {
                gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
                v_worldPosition = (u_modelMatrix * vec4(a_position, 1.0)).xyz;
                v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
            }
        `;
        
        const fragmentShader = `
            precision mediump float;
            
            varying vec3 v_worldPosition;
            varying vec3 v_normal;
            
            uniform vec3 u_lightPosition;
            uniform vec3 u_lightColor;
            uniform vec3 u_cameraPosition;
            uniform vec3 u_materialDiffuse;
            uniform vec3 u_materialSpecular;
            uniform float u_shininess;
            
            void main() {
                vec3 normal = normalize(v_normal);
                vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
                vec3 viewDirection = normalize(u_cameraPosition - v_worldPosition);
                vec3 reflectDirection = reflect(-lightDirection, normal);
                
                // 漫反射
                float diffuseFactor = max(dot(normal, lightDirection), 0.0);
                vec3 diffuse = u_lightColor * u_materialDiffuse * diffuseFactor;
                
                // Phong 镜面反射
                float specularFactor = pow(max(dot(viewDirection, reflectDirection), 0.0), u_shininess);
                vec3 specular = u_lightColor * u_materialSpecular * specularFactor;
                
                gl_FragColor = vec4(diffuse + specular, 1.0);
            }
        `;
        
        return this.createShaderProgram(vertexShader, fragmentShader);
    }
    
    toggleModel() {
        this.currentModel = this.currentModel === 'phong' ? 'blinn-phong' : 'phong';
    }
}
```

## 5. 多光源系统

### 5.1 点光源（Point Light）

具有位置和衰减的光源：

```glsl
// 点光源计算
vec3 calculatePointLight(vec3 lightPosition, vec3 lightColor, float lightIntensity,
                        vec3 worldPosition, vec3 normal, vec3 viewDirection,
                        vec3 materialDiffuse, vec3 materialSpecular, float shininess) {
    
    vec3 lightDirection = normalize(lightPosition - worldPosition);
    float distance = length(lightPosition - worldPosition);
    
    // 距离衰减
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
    
    // 漫反射
    float diffuseFactor = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = lightColor * materialDiffuse * diffuseFactor;
    
    // 镜面反射
    vec3 halfwayDir = normalize(lightDirection + viewDirection);
    float specularFactor = pow(max(dot(normal, halfwayDir), 0.0), shininess);
    vec3 specular = lightColor * materialSpecular * specularFactor;
    
    return (diffuse + specular) * attenuation * lightIntensity;
}
```

#### 点光源类
```javascript
class PointLight {
    constructor(position = [0, 0, 0], color = [1, 1, 1], intensity = 1.0) {
        this.position = position;
        this.color = color;
        this.intensity = intensity;
        this.constant = 1.0;
        this.linear = 0.09;
        this.quadratic = 0.032;
    }
    
    calculateAttenuation(distance) {
        return 1.0 / (this.constant + this.linear * distance + this.quadratic * distance * distance);
    }
    
    applyToShader(gl, program, index) {
        const posLoc = gl.getUniformLocation(program, `u_pointLights[${index}].position`);
        const colorLoc = gl.getUniformLocation(program, `u_pointLights[${index}].color`);
        const intensityLoc = gl.getUniformLocation(program, `u_pointLights[${index}].intensity`);
        
        gl.uniform3fv(posLoc, this.position);
        gl.uniform3fv(colorLoc, this.color);
        gl.uniform1f(intensityLoc, this.intensity);
    }
}
```

### 5.2 聚光灯（Spot Light）

具有方向和光锥角度的光源：

```glsl
// 聚光灯计算
vec3 calculateSpotLight(vec3 lightPosition, vec3 lightDirection, vec3 lightColor,
                       float innerCone, float outerCone, float lightIntensity,
                       vec3 worldPosition, vec3 normal, vec3 viewDirection,
                       vec3 materialDiffuse, vec3 materialSpecular, float shininess) {
    
    vec3 lightToFragment = normalize(lightPosition - worldPosition);
    float distance = length(lightPosition - worldPosition);
    
    // 计算光锥衰减
    float cosTheta = dot(lightToFragment, normalize(-lightDirection));
    float epsilon = innerCone - outerCone;
    float intensity = clamp((cosTheta - outerCone) / epsilon, 0.0, 1.0);
    
    // 距离衰减
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
    
    // 光照计算
    vec3 result = calculatePointLight(lightPosition, lightColor, lightIntensity,
                                    worldPosition, normal, viewDirection,
                                    materialDiffuse, materialSpecular, shininess);
    
    return result * intensity * attenuation;
}
```

### 5.3 多光源管理系统

```javascript
class LightingSystem {
    constructor(gl, maxLights = 8) {
        this.gl = gl;
        this.maxLights = maxLights;
        this.lights = [];
        this.ambientLight = new AmbientLight();
    }
    
    addLight(light) {
        if (this.lights.length < this.maxLights) {
            this.lights.push(light);
        } else {
            console.warn('Maximum number of lights reached');
        }
    }
    
    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index !== -1) {
            this.lights.splice(index, 1);
        }
    }
    
    applyToShader(program, camera) {
        const gl = this.gl;
        
        // 环境光
        this.ambientLight.applyToShader(gl, program);
        
        // 光源数量
        const lightCountLoc = gl.getUniformLocation(program, 'u_numLights');
        gl.uniform1i(lightCountLoc, this.lights.length);
        
        // 相机位置
        const cameraLoc = gl.getUniformLocation(program, 'u_cameraPosition');
        gl.uniform3fv(cameraLoc, camera.position);
        
        // 各个光源
        this.lights.forEach((light, index) => {
            light.applyToShader(gl, program, index);
        });
    }
    
    update(deltaTime) {
        // 更新动态光源
        this.lights.forEach(light => {
            if (light.update) {
                light.update(deltaTime);
            }
        });
    }
}
```

## 6. 光照优化技术

### 6.1 光源剔除

```javascript
class LightCulling {
    constructor(camera, lights) {
        this.camera = camera;
        this.lights = lights;
        this.visibleLights = [];
    }
    
    frustumCullLights() {
        this.visibleLights = [];
        
        for (const light of this.lights) {
            if (this.isLightInFrustum(light)) {
                this.visibleLights.push(light);
            }
        }
        
        return this.visibleLights;
    }
    
    isLightInFrustum(light) {
        // 简化的视锥体剔除
        const lightPos = light.position;
        const cameraPos = this.camera.position;
        const distance = this.calculateDistance(lightPos, cameraPos);
        
        // 根据光源类型和强度判断是否在视锥体内
        const maxDistance = this.calculateMaxDistance(light);
        return distance <= maxDistance;
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = pos1[2] - pos2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    calculateMaxDistance(light) {
        // 根据光源强度计算最大影响距离
        const threshold = 0.01; // 最小可见亮度
        return Math.sqrt(light.intensity / threshold);
    }
}
```

### 6.2 光照贴图（Light Mapping）

```javascript
class LightMapper {
    constructor(gl, scene) {
        this.gl = gl;
        this.scene = scene;
        this.lightmapTexture = null;
        this.lightmapSize = 512;
    }
    
    generateLightmap() {
        // 创建光照贴图纹理
        this.lightmapTexture = this.createLightmapTexture();
        
        // 渲染光照信息到纹理
        this.renderLightmapToTexture();
        
        return this.lightmapTexture;
    }
    
    createLightmapTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
                     this.lightmapSize, this.lightmapSize, 0, 
                     gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        return texture;
    }
    
    renderLightmapToTexture() {
        const gl = this.gl;
        
        // 创建帧缓冲区
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        
        // 绑定纹理到帧缓冲区
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                               gl.TEXTURE_2D, this.lightmapTexture, 0);
        
        // 设置视口
        gl.viewport(0, 0, this.lightmapSize, this.lightmapSize);
        
        // 渲染光照信息
        this.renderLightingPass();
        
        // 恢复默认帧缓冲区
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(framebuffer);
    }
}
```

## 7. 实践示例

### 7.1 交互式光照演示

```javascript
class InteractiveLightingDemo {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        this.program = this.initShaders();
        this.scene = this.createScene();
        this.lightingSystem = new LightingSystem(this.gl);
        this.camera = new OrbitCamera(canvas);
        
        this.setupUI();
        this.setupLights();
        this.render();
    }
    
    setupLights() {
        // 主光源
        const mainLight = new DirectionalLight(
            [-1, -1, -1], 
            [1.0, 1.0, 0.9], 
            1.0
        );
        
        // 点光源
        const pointLight = new PointLight(
            [2, 2, 2], 
            [1.0, 0.5, 0.3], 
            2.0
        );
        
        // 聚光灯
        const spotLight = new SpotLight(
            [0, 5, 0], 
            [0, -1, 0], 
            [0.3, 0.7, 1.0], 
            Math.cos(Math.PI / 12), 
            Math.cos(Math.PI / 8), 
            3.0
        );
        
        this.lightingSystem.addLight(mainLight);
        this.lightingSystem.addLight(pointLight);
        this.lightingSystem.addLight(spotLight);
    }
    
    setupUI() {
        // 光照参数控制
        const controls = document.createElement('div');
        controls.innerHTML = `
            <div class="lighting-controls">
                <h3>光照控制</h3>
                <div>
                    <label>环境光强度: <span id="ambient-value">0.2</span></label>
                    <input type="range" id="ambient-slider" min="0" max="1" step="0.01" value="0.2">
                </div>
                <div>
                    <label>主光源强度: <span id="main-light-value">1.0</span></label>
                    <input type="range" id="main-light-slider" min="0" max="2" step="0.01" value="1.0">
                </div>
                <div>
                    <label>材质光泽度: <span id="shininess-value">32</span></label>
                    <input type="range" id="shininess-slider" min="1" max="128" step="1" value="32">
                </div>
                <div>
                    <button id="toggle-model">切换光照模型</button>
                    <span id="current-model">Phong</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(controls);
        
        // 绑定事件
        this.bindUIEvents();
    }
    
    bindUIEvents() {
        document.getElementById('ambient-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.lightingSystem.ambientLight.intensity = value;
            document.getElementById('ambient-value').textContent = value.toFixed(2);
        });
        
        document.getElementById('main-light-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.lightingSystem.lights[0].intensity = value;
            document.getElementById('main-light-value').textContent = value.toFixed(2);
        });
        
        document.getElementById('shininess-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.scene.material.shininess = value;
            document.getElementById('shininess-value').textContent = value;
        });
        
        document.getElementById('toggle-model').addEventListener('click', () => {
            this.toggleLightingModel();
        });
    }
    
    render() {
        const gl = this.gl;
        
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(this.program);
        
        // 应用光照系统
        this.lightingSystem.applyToShader(this.program, this.camera);
        
        // 渲染场景
        this.scene.render(this.camera, this.program);
        
        requestAnimationFrame(() => this.render());
    }
}
```

### 7.2 材质预览器

```javascript
class MaterialPreview {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        this.program = this.initShaders();
        this.sphere = this.createSphere();
        this.camera = new OrbitCamera(canvas);
        this.lightingSystem = new LightingSystem(this.gl);
        
        this.materials = [
            Materials.emerald,
            Materials.gold,
            Materials.silver,
            new PhongMaterial({ // 塑料
                ambient: [0.0, 0.0, 0.0],
                diffuse: [0.5, 0.0, 0.0],
                specular: [0.7, 0.6, 0.6],
                shininess: 32.0
            })
        ];
        
        this.currentMaterial = 0;
        this.setupLighting();
        this.setupControls();
        this.render();
    }
    
    setupLighting() {
        // HDRI 风格的三点照明
        const keyLight = new DirectionalLight(
            [-1, -0.5, -1], 
            [1.0, 0.95, 0.8], 
            1.2
        );
        
        const fillLight = new DirectionalLight(
            [1, 0, 0.5], 
            [0.4, 0.5, 0.7], 
            0.6
        );
        
        const rimLight = new DirectionalLight(
            [0, 1, 1], 
            [0.8, 0.9, 1.0], 
            0.8
        );
        
        this.lightingSystem.addLight(keyLight);
        this.lightingSystem.addLight(fillLight);
        this.lightingSystem.addLight(rimLight);
        
        // 环境光
        this.lightingSystem.ambientLight = new AmbientLight([0.1, 0.1, 0.15], 0.3);
    }
    
    nextMaterial() {
        this.currentMaterial = (this.currentMaterial + 1) % this.materials.length;
    }
    
    render() {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        
        // 应用当前材质
        this.materials[this.currentMaterial].applyToShader(gl, this.program);
        
        // 应用光照
        this.lightingSystem.applyToShader(this.program, this.camera);
        
        // 渲染球体
        this.sphere.render(this.camera, this.program);
        
        requestAnimationFrame(() => this.render());
    }
}
```

## 8. 章节总结

通过本章学习，您应该已经：

- ✅ 理解了光照的物理基础和数学原理
- ✅ 掌握了环境光、漫反射、镜面反射的实现
- ✅ 学会了 Phong 和 Blinn-Phong 光照模型
- ✅ 构建了完整的多光源系统
- ✅ 了解了光照优化的基本技术

## 🔗 下一步

现在您已经掌握了光照系统，接下来将学习 [纹理映射](08-textures.md)：

- 纹理坐标系统和UV映射
- 纹理采样和过滤技术
- 多重纹理的使用
- 立方体贴图和环境映射

**准备好为您的 3D 模型添加丰富的细节了吗？让我们继续前进！** 🎨🚀