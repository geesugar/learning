# 材质系统

## 📖 本章概述

材质系统是现代 3D 渲染的核心组件，它定义了物体表面如何与光线交互。本章将深入介绍基于物理的渲染（PBR）材质系统，帮助您创建真实感的 3D 场景。

## 🎯 学习目标

- 理解 PBR（基于物理的渲染）基础理论
- 掌握金属度-粗糙度工作流
- 学会创建和管理各种材质类型
- 实现完整的材质编辑器
- 构建标准材质库

## 1. PBR 基础理论

### 1.1 什么是 PBR？

**基于物理的渲染（Physically Based Rendering, PBR）** 是一种基于物理原理的渲染方法，它更准确地模拟了光线与材质的相互作用。

#### PBR 的核心原则
1. **能量守恒**：反射的光不能超过入射的光
2. **菲涅尔反射**：反射强度与观察角度相关
3. **微表面理论**：表面由微小的镜面组成

### 1.2 PBR 材质参数

```javascript
const PBRParameters = {
    albedo: [0.8, 0.2, 0.2],      // 基础颜色 (RGB)
    metallic: 0.0,                // 金属度 (0-1)
    roughness: 0.5,               // 粗糙度 (0-1)
    ao: 1.0,                      // 环境遮蔽 (0-1)
    normal: normalTexture,         // 法线贴图
    emission: [0.0, 0.0, 0.0],    // 自发光 (RGB)
    f0: [0.04, 0.04, 0.04]        // 基础反射率
};
```

## 2. PBR 着色器实现

### 2.1 PBR 顶点着色器

```glsl
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec2 a_texCoord;

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_normalMatrix;

varying vec3 v_worldPosition;
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_bitangent;
varying vec2 v_texCoord;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    
    v_worldPosition = (u_modelMatrix * vec4(a_position, 1.0)).xyz;
    v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
    v_tangent = normalize((u_normalMatrix * vec4(a_tangent, 0.0)).xyz);
    v_bitangent = cross(v_normal, v_tangent);
    v_texCoord = a_texCoord;
}
```

### 2.2 PBR 片段着色器

```glsl
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_bitangent;
varying vec2 v_texCoord;

// 材质纹理
uniform sampler2D u_albedoTexture;
uniform sampler2D u_metallicTexture;
uniform sampler2D u_roughnessTexture;
uniform sampler2D u_normalTexture;
uniform sampler2D u_aoTexture;

// 材质参数
uniform vec3 u_albedo;
uniform float u_metallic;
uniform float u_roughness;

// 光照参数
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;

// PBR 函数
vec3 getNormalFromMap() {
    vec3 tangentNormal = texture2D(u_normalTexture, v_texCoord).xyz * 2.0 - 1.0;
    
    vec3 N = normalize(v_normal);
    vec3 T = normalize(v_tangent);
    vec3 B = normalize(v_bitangent);
    mat3 TBN = mat3(T, B, N);
    
    return normalize(TBN * tangentNormal);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265 * denom * denom;
    
    return num / denom;
}

float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    
    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    
    return num / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
    // 采样材质纹理
    vec3 albedo = texture2D(u_albedoTexture, v_texCoord).rgb * u_albedo;
    float metallic = texture2D(u_metallicTexture, v_texCoord).r * u_metallic;
    float roughness = texture2D(u_roughnessTexture, v_texCoord).r * u_roughness;
    float ao = texture2D(u_aoTexture, v_texCoord).r;
    
    vec3 N = getNormalFromMap();
    vec3 V = normalize(u_cameraPosition - v_worldPosition);
    
    // 计算基础反射率
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    
    // 光照计算
    vec3 L = normalize(u_lightPosition - v_worldPosition);
    vec3 H = normalize(V + L);
    float distance = length(u_lightPosition - v_worldPosition);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = u_lightColor * attenuation;
    
    // BRDF 计算
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
    vec3 specular = numerator / denominator;
    
    float NdotL = max(dot(N, L), 0.0);
    vec3 Lo = (kD * albedo / 3.14159265 + specular) * radiance * NdotL;
    
    // 环境光
    vec3 ambient = vec3(0.03) * albedo * ao;
    vec3 color = ambient + Lo;
    
    // HDR 色调映射
    color = color / (color + vec3(1.0));
    
    // Gamma 校正
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
```

## 3. PBR 材质类

### 3.1 基础 PBR 材质

```javascript
class PBRMaterial {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // 基础参数
        this.albedo = options.albedo || [1.0, 1.0, 1.0];
        this.metallic = options.metallic || 0.0;
        this.roughness = options.roughness || 0.5;
        this.ao = options.ao || 1.0;
        this.emission = options.emission || [0.0, 0.0, 0.0];
        
        // 纹理
        this.albedoTexture = null;
        this.metallicTexture = null;
        this.roughnessTexture = null;
        this.normalTexture = null;
        this.aoTexture = null;
        this.emissionTexture = null;
        
        this.createDefaultTextures();
    }
    
    createDefaultTextures() {
        const gl = this.gl;
        
        // 创建默认白色纹理
        this.albedoTexture = this.createSolidTexture([255, 255, 255, 255]);
        this.metallicTexture = this.createSolidTexture([0, 0, 0, 255]);
        this.roughnessTexture = this.createSolidTexture([128, 128, 128, 255]);
        this.normalTexture = this.createSolidTexture([128, 128, 255, 255]);
        this.aoTexture = this.createSolidTexture([255, 255, 255, 255]);
    }
    
    createSolidTexture(color) {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                     new Uint8Array(color));
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        return texture;
    }
    
    setAlbedoTexture(texture) {
        this.albedoTexture = texture.texture;
    }
    
    setMetallicTexture(texture) {
        this.metallicTexture = texture.texture;
    }
    
    setRoughnessTexture(texture) {
        this.roughnessTexture = texture.texture;
    }
    
    setNormalTexture(texture) {
        this.normalTexture = texture.texture;
    }
    
    applyToShader(program) {
        const gl = this.gl;
        
        // 绑定纹理
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.albedoTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'u_albedoTexture'), 0);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.metallicTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'u_metallicTexture'), 1);
        
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.roughnessTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'u_roughnessTexture'), 2);
        
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'u_normalTexture'), 3);
        
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.aoTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'u_aoTexture'), 4);
        
        // 设置材质参数
        gl.uniform3fv(gl.getUniformLocation(program, 'u_albedo'), this.albedo);
        gl.uniform1f(gl.getUniformLocation(program, 'u_metallic'), this.metallic);
        gl.uniform1f(gl.getUniformLocation(program, 'u_roughness'), this.roughness);
    }
}
```

## 4. 材质预设库

### 4.1 标准材质预设

```javascript
class MaterialLibrary {
    static createMetal(gl, color = [0.7, 0.7, 0.7], roughness = 0.1) {
        return new PBRMaterial(gl, {
            albedo: color,
            metallic: 1.0,
            roughness: roughness
        });
    }
    
    static createPlastic(gl, color = [0.8, 0.2, 0.2], roughness = 0.8) {
        return new PBRMaterial(gl, {
            albedo: color,
            metallic: 0.0,
            roughness: roughness
        });
    }
    
    static createGlass(gl, color = [0.9, 0.9, 0.9]) {
        return new PBRMaterial(gl, {
            albedo: color,
            metallic: 0.0,
            roughness: 0.0
        });
    }
    
    static createWood(gl) {
        return new PBRMaterial(gl, {
            albedo: [0.6, 0.4, 0.2],
            metallic: 0.0,
            roughness: 0.8
        });
    }
    
    static createFabric(gl, color = [0.5, 0.5, 0.8]) {
        return new PBRMaterial(gl, {
            albedo: color,
            metallic: 0.0,
            roughness: 0.9
        });
    }
    
    static createCeramic(gl, color = [0.9, 0.9, 0.9]) {
        return new PBRMaterial(gl, {
            albedo: color,
            metallic: 0.0,
            roughness: 0.2
        });
    }
}

// 预设材质常量
const MaterialPresets = {
    GOLD: { albedo: [1.0, 0.766, 0.336], metallic: 1.0, roughness: 0.1 },
    SILVER: { albedo: [0.972, 0.960, 0.915], metallic: 1.0, roughness: 0.05 },
    COPPER: { albedo: [0.955, 0.637, 0.538], metallic: 1.0, roughness: 0.15 },
    IRON: { albedo: [0.562, 0.565, 0.578], metallic: 1.0, roughness: 0.2 },
    
    RED_PLASTIC: { albedo: [0.8, 0.2, 0.2], metallic: 0.0, roughness: 0.8 },
    BLUE_PLASTIC: { albedo: [0.2, 0.2, 0.8], metallic: 0.0, roughness: 0.8 },
    GREEN_PLASTIC: { albedo: [0.2, 0.8, 0.2], metallic: 0.0, roughness: 0.8 },
    
    RUBBER: { albedo: [0.1, 0.1, 0.1], metallic: 0.0, roughness: 1.0 }
};
```

## 5. 材质编辑器

### 5.1 交互式材质编辑器

```javascript
class MaterialEditor {
    constructor(canvas, material) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        this.material = material;
        this.sphere = this.createSphere();
        this.camera = new OrbitCamera(canvas);
        this.program = this.initPBRShader();
        
        this.setupUI();
        this.setupLighting();
        this.render();
    }
    
    setupUI() {
        const controls = document.createElement('div');
        controls.className = 'material-editor';
        controls.innerHTML = `
            <div class="material-controls">
                <h3>材质编辑器</h3>
                
                <div class="control-group">
                    <label>基础颜色</label>
                    <input type="color" id="albedo-color" value="#cccccc">
                </div>
                
                <div class="control-group">
                    <label>金属度: <span id="metallic-value">0.0</span></label>
                    <input type="range" id="metallic-slider" min="0" max="1" step="0.01" value="0">
                </div>
                
                <div class="control-group">
                    <label>粗糙度: <span id="roughness-value">0.5</span></label>
                    <input type="range" id="roughness-slider" min="0" max="1" step="0.01" value="0.5">
                </div>
                
                <div class="control-group">
                    <label>预设材质</label>
                    <select id="material-presets">
                        <option value="custom">自定义</option>
                        <option value="gold">金</option>
                        <option value="silver">银</option>
                        <option value="copper">铜</option>
                        <option value="plastic">塑料</option>
                        <option value="rubber">橡胶</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <button id="export-material">导出材质</button>
                    <button id="reset-material">重置材质</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(controls);
        this.bindUIEvents();
    }
    
    bindUIEvents() {
        // 颜色选择器
        document.getElementById('albedo-color').addEventListener('input', (e) => {
            const color = this.hexToRgb(e.target.value);
            this.material.albedo = [color.r / 255, color.g / 255, color.b / 255];
        });
        
        // 金属度滑块
        document.getElementById('metallic-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.material.metallic = value;
            document.getElementById('metallic-value').textContent = value.toFixed(2);
        });
        
        // 粗糙度滑块
        document.getElementById('roughness-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.material.roughness = value;
            document.getElementById('roughness-value').textContent = value.toFixed(2);
        });
        
        // 预设材质
        document.getElementById('material-presets').addEventListener('change', (e) => {
            const preset = MaterialPresets[e.target.value.toUpperCase()];
            if (preset) {
                this.applyPreset(preset);
            }
        });
        
        // 导出材质
        document.getElementById('export-material').addEventListener('click', () => {
            this.exportMaterial();
        });
        
        // 重置材质
        document.getElementById('reset-material').addEventListener('click', () => {
            this.resetMaterial();
        });
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    applyPreset(preset) {
        this.material.albedo = [...preset.albedo];
        this.material.metallic = preset.metallic;
        this.material.roughness = preset.roughness;
        
        // 更新UI
        this.updateUI();
    }
    
    updateUI() {
        const albedoHex = this.rgbToHex(...this.material.albedo);
        document.getElementById('albedo-color').value = albedoHex;
        document.getElementById('metallic-slider').value = this.material.metallic;
        document.getElementById('metallic-value').textContent = this.material.metallic.toFixed(2);
        document.getElementById('roughness-slider').value = this.material.roughness;
        document.getElementById('roughness-value').textContent = this.material.roughness.toFixed(2);
    }
    
    rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(n * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    exportMaterial() {
        const materialData = {
            albedo: this.material.albedo,
            metallic: this.material.metallic,
            roughness: this.material.roughness,
            ao: this.material.ao
        };
        
        const dataStr = JSON.stringify(materialData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'material.json';
        link.click();
    }
    
    render() {
        const gl = this.gl;
        
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(this.program);
        
        // 应用材质
        this.material.applyToShader(this.program);
        
        // 设置相机和光照
        this.setupShaderUniforms();
        
        // 渲染球体
        this.sphere.render();
        
        requestAnimationFrame(() => this.render());
    }
}
```

## 6. 实践示例

### 6.1 材质展示场景

```javascript
class MaterialShowcase {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        this.program = this.initPBRShader();
        this.camera = new OrbitCamera(canvas);
        
        this.materials = this.createMaterialCollection();
        this.spheres = this.createSphereGrid();
        
        this.setupLighting();
        this.render();
    }
    
    createMaterialCollection() {
        const gl = this.gl;
        const materials = [];
        
        // 金属材质变化
        for (let i = 0; i < 5; i++) {
            const roughness = i / 4;
            materials.push(new PBRMaterial(gl, {
                albedo: [0.7, 0.7, 0.7],
                metallic: 1.0,
                roughness: roughness
            }));
        }
        
        // 非金属材质变化
        for (let i = 0; i < 5; i++) {
            const roughness = i / 4;
            materials.push(new PBRMaterial(gl, {
                albedo: [0.8, 0.2, 0.2],
                metallic: 0.0,
                roughness: roughness
            }));
        }
        
        return materials;
    }
    
    createSphereGrid() {
        const spheres = [];
        const spacing = 2.5;
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 5; col++) {
                const sphere = this.createSphere();
                sphere.position = [
                    (col - 2) * spacing,
                    (row - 0.5) * spacing,
                    0
                ];
                sphere.materialIndex = row * 5 + col;
                spheres.push(sphere);
            }
        }
        
        return spheres;
    }
    
    render() {
        const gl = this.gl;
        
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(this.program);
        
        // 设置全局光照参数
        this.setupGlobalUniforms();
        
        // 渲染每个球体
        this.spheres.forEach(sphere => {
            const material = this.materials[sphere.materialIndex];
            material.applyToShader(this.program);
            
            // 设置模型矩阵
            const modelMatrix = this.createTransformMatrix(sphere.position);
            this.setModelMatrix(modelMatrix);
            
            sphere.render();
        });
        
        requestAnimationFrame(() => this.render());
    }
}
```

## 7. 章节总结

通过本章学习，您应该已经：

- ✅ 理解了 PBR 渲染的基础理论
- ✅ 掌握了金属度-粗糙度工作流
- ✅ 学会了创建各种材质类型
- ✅ 实现了交互式材质编辑器
- ✅ 构建了标准材质库

## 🔗 下一步

恭喜您完成了图形渲染阶段！现在您已经掌握了：
- 完整的光照系统
- 纹理映射技术
- 现代化的PBR材质系统

接下来将进入 [高级技术阶段](../04-advanced/README.md)，学习：
- 高级着色技术
- 几何处理和实例化渲染
- 后处理效果和特效

**准备好探索更高级的WebGL技术了吗？让我们继续前进！** 🚀⚡