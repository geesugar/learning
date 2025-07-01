# 纹理映射

## 📖 本章概述

纹理映射是为 3D 模型添加细节和真实感的重要技术。本章将详细介绍纹理坐标系统、纹理采样技术、多重纹理的使用等关键概念。

## 🎯 学习目标

- 理解纹理坐标系统和UV映射
- 掌握纹理的创建、加载和使用
- 学会纹理采样和过滤技术
- 实现多重纹理混合
- 了解立方体贴图和环境映射

## 1. 纹理基础概念

### 1.1 什么是纹理？

**纹理（Texture）** 是贴在 3D 对象表面的 2D 图像，用来模拟表面的颜色、材质、细节等视觉特征。

### 1.2 纹理坐标系统

**UV坐标** 是纹理的 2D 坐标系统：
- U 轴：水平方向（0.0 到 1.0）
- V 轴：垂直方向（0.0 到 1.0）
- 左下角为 (0,0)，右上角为 (1,1)

```glsl
// 顶点着色器 - 纹理坐标传递
attribute vec3 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_mvpMatrix;

varying vec2 v_texCoord;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_texCoord = a_texCoord;
}
```

## 2. 纹理的创建和加载

### 2.1 基础纹理类

```javascript
class Texture {
    constructor(gl) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.width = 0;
        this.height = 0;
        this.loaded = false;
    }
    
    loadFromImage(imagePath) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.setupTexture(image);
                this.loaded = true;
                resolve(this);
            };
            image.onerror = reject;
            image.src = imagePath;
        });
    }
    
    setupTexture(image) {
        const gl = this.gl;
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        // 设置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        this.width = image.width;
        this.height = image.height;
    }
    
    bind(unit = 0) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    
    dispose() {
        this.gl.deleteTexture(this.texture);
    }
}
```

### 2.2 程序化纹理生成

```javascript
class ProceduralTexture {
    static createCheckerboard(gl, size = 512, checkSize = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 绘制棋盘格
        for (let y = 0; y < size; y += checkSize) {
            for (let x = 0; x < size; x += checkSize) {
                const isWhite = ((x / checkSize) + (y / checkSize)) % 2 === 0;
                ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
                ctx.fillRect(x, y, checkSize, checkSize);
            }
        }
        
        const texture = new Texture(gl);
        texture.setupTexture(canvas);
        return texture;
    }
    
    static createGradient(gl, size = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(1, '#0000ff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        const texture = new Texture(gl);
        texture.setupTexture(canvas);
        return texture;
    }
}
```

## 3. 基础纹理映射

### 3.1 简单纹理着色器

```glsl
// 片段着色器 - 基础纹理
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_texture;

void main() {
    vec4 textureColor = texture2D(u_texture, v_texCoord);
    gl_FragColor = textureColor;
}
```

### 3.2 纹理与光照结合

```glsl
// 片段着色器 - 纹理光照
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;
varying vec2 v_texCoord;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform sampler2D u_diffuseTexture;
uniform float u_shininess;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    vec3 viewDirection = normalize(u_cameraPosition - v_worldPosition);
    
    // 从纹理采样漫反射颜色
    vec4 diffuseColor = texture2D(u_diffuseTexture, v_texCoord);
    
    // 漫反射光照
    float diffuseFactor = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = u_lightColor * diffuseColor.rgb * diffuseFactor;
    
    // 镜面反射
    vec3 halfwayDir = normalize(lightDirection + viewDirection);
    float specularFactor = pow(max(dot(normal, halfwayDir), 0.0), u_shininess);
    vec3 specular = u_lightColor * vec3(0.3) * specularFactor;
    
    gl_FragColor = vec4(diffuse + specular, diffuseColor.a);
}
```

## 4. 纹理过滤和包装

### 4.1 纹理过滤

```javascript
class TextureManager {
    static setFiltering(gl, texture, minFilter, magFilter) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    }
    
    static generateMipmap(gl, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    
    static setWrapping(gl, texture, wrapS, wrapT) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    }
}

// 使用示例
const texture = new Texture(gl);
await texture.loadFromImage('brick_wall.jpg');

// 设置过滤方式
TextureManager.setFiltering(gl, texture.texture, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR);
TextureManager.generateMipmap(gl, texture.texture);

// 设置包装方式
TextureManager.setWrapping(gl, texture.texture, gl.REPEAT, gl.REPEAT);
```

## 5. 多重纹理

### 5.1 多重纹理着色器

```glsl
// 片段着色器 - 多重纹理
precision mediump float;

varying vec2 v_texCoord;

uniform sampler2D u_texture0;  // 基础纹理
uniform sampler2D u_texture1;  // 细节纹理
uniform float u_mixFactor;     // 混合因子

void main() {
    vec4 color0 = texture2D(u_texture0, v_texCoord);
    vec4 color1 = texture2D(u_texture1, v_texCoord * 4.0); // 放大细节纹理
    
    // 线性混合两个纹理
    vec4 finalColor = mix(color0, color1, u_mixFactor);
    
    gl_FragColor = finalColor;
}
```

### 5.2 多重纹理材质

```javascript
class MultiTextureMaterial {
    constructor(gl) {
        this.gl = gl;
        this.textures = [];
        this.mixFactors = [];
    }
    
    addTexture(texture, mixFactor = 1.0) {
        this.textures.push(texture);
        this.mixFactors.push(mixFactor);
    }
    
    applyToShader(program) {
        const gl = this.gl;
        
        this.textures.forEach((texture, index) => {
            if (index < 8) { // WebGL 通常支持至少8个纹理单元
                texture.bind(index);
                
                const location = gl.getUniformLocation(program, `u_texture${index}`);
                gl.uniform1i(location, index);
                
                if (this.mixFactors[index] !== undefined) {
                    const mixLocation = gl.getUniformLocation(program, `u_mixFactor${index}`);
                    gl.uniform1f(mixLocation, this.mixFactors[index]);
                }
            }
        });
    }
}
```

## 6. 立方体贴图

### 6.1 立方体贴图创建

```javascript
class CubeTexture {
    constructor(gl) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.loaded = false;
    }
    
    loadFromImages(imagePaths) {
        // imagePaths: [+X, -X, +Y, -Y, +Z, -Z]
        const faces = [
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        
        const promises = imagePaths.map((path, index) => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve({ image, face: faces[index] });
                image.onerror = reject;
                image.src = path;
            });
        });
        
        return Promise.all(promises).then(results => {
            this.setupCubeTexture(results);
            this.loaded = true;
            return this;
        });
    }
    
    setupCubeTexture(faceData) {
        const gl = this.gl;
        
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        
        faceData.forEach(({ image, face }) => {
            gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        });
        
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    bind(unit = 0) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    }
}
```

### 6.2 天空盒实现

```glsl
// 天空盒顶点着色器
attribute vec3 a_position;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 v_direction;

void main() {
    // 移除平移部分，只保留旋转
    mat4 viewRotation = mat4(
        u_viewMatrix[0],
        u_viewMatrix[1], 
        u_viewMatrix[2],
        vec4(0.0, 0.0, 0.0, 1.0)
    );
    
    vec4 pos = u_projectionMatrix * viewRotation * vec4(a_position, 1.0);
    gl_Position = pos.xyww; // 设置 z = w，确保深度为1.0
    
    v_direction = a_position;
}
```

```glsl
// 天空盒片段着色器
precision mediump float;

varying vec3 v_direction;
uniform samplerCube u_skybox;

void main() {
    gl_FragColor = textureCube(u_skybox, v_direction);
}
```

## 7. 高级纹理技术

### 7.1 法线贴图

```glsl
// 法线贴图着色器
precision mediump float;

varying vec3 v_worldPosition;
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec2 v_texCoord;

uniform vec3 u_lightPosition;
uniform sampler2D u_diffuseTexture;
uniform sampler2D u_normalTexture;

void main() {
    // 构建TBN矩阵
    vec3 normal = normalize(v_normal);
    vec3 tangent = normalize(v_tangent);
    vec3 bitangent = cross(normal, tangent);
    mat3 TBN = mat3(tangent, bitangent, normal);
    
    // 从法线贴图采样并转换到世界空间
    vec3 normalMap = texture2D(u_normalTexture, v_texCoord).rgb * 2.0 - 1.0;
    vec3 worldNormal = normalize(TBN * normalMap);
    
    // 光照计算
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    float diffuseFactor = max(dot(worldNormal, lightDirection), 0.0);
    
    vec4 diffuseColor = texture2D(u_diffuseTexture, v_texCoord);
    gl_FragColor = vec4(diffuseColor.rgb * diffuseFactor, 1.0);
}
```

### 7.2 纹理动画

```javascript
class AnimatedTexture extends Texture {
    constructor(gl, frameCount, frameRate = 30) {
        super(gl);
        this.frameCount = frameCount;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.lastTime = 0;
        this.frames = [];
    }
    
    loadFrames(imagePathPattern) {
        const promises = [];
        for (let i = 0; i < this.frameCount; i++) {
            const path = imagePathPattern.replace('{frame}', i);
            promises.push(this.loadFrame(path));
        }
        return Promise.all(promises);
    }
    
    loadFrame(imagePath) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.frames.push(image);
                resolve(image);
            };
            image.onerror = reject;
            image.src = imagePath;
        });
    }
    
    update(time) {
        if (this.frames.length === 0) return;
        
        const deltaTime = time - this.lastTime;
        const frameTime = 1000 / this.frameRate;
        
        if (deltaTime > frameTime) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.setupTexture(this.frames[this.currentFrame]);
            this.lastTime = time;
        }
    }
}
```

## 8. 实践示例

### 8.1 纹理查看器

```javascript
class TextureViewer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        this.program = this.initShaders();
        this.quad = this.createQuad();
        this.textures = [];
        this.currentTexture = 0;
        this.filterMode = this.gl.LINEAR;
        
        this.setupUI();
        this.loadTextures();
        this.render();
    }
    
    createQuad() {
        const vertices = [
            -1, -1, 0, 0, 0,
             1, -1, 0, 1, 0,
             1,  1, 0, 1, 1,
            -1,  1, 0, 0, 1
        ];
        
        const indices = [0, 1, 2, 0, 2, 3];
        
        return {
            vertexBuffer: this.createBuffer(vertices),
            indexBuffer: this.createElementBuffer(indices),
            indexCount: indices.length
        };
    }
    
    async loadTextures() {
        const textureList = [
            'brick_wall.jpg',
            'wood_floor.jpg', 
            'metal_plate.jpg',
            'grass.jpg'
        ];
        
        for (const texturePath of textureList) {
            const texture = new Texture(this.gl);
            await texture.loadFromImage(`./textures/${texturePath}`);
            this.textures.push(texture);
        }
    }
    
    setupUI() {
        const controls = document.createElement('div');
        controls.innerHTML = `
            <div class="texture-controls">
                <h3>纹理查看器</h3>
                <button id="prev-texture">上一个纹理</button>
                <button id="next-texture">下一个纹理</button>
                <select id="filter-mode">
                    <option value="nearest">最近邻过滤</option>
                    <option value="linear" selected>线性过滤</option>
                </select>
                <div>当前纹理: <span id="texture-name"></span></div>
            </div>
        `;
        
        document.body.appendChild(controls);
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('prev-texture').addEventListener('click', () => {
            this.currentTexture = (this.currentTexture - 1 + this.textures.length) % this.textures.length;
        });
        
        document.getElementById('next-texture').addEventListener('click', () => {
            this.currentTexture = (this.currentTexture + 1) % this.textures.length;
        });
        
        document.getElementById('filter-mode').addEventListener('change', (e) => {
            this.filterMode = e.target.value === 'nearest' ? this.gl.NEAREST : this.gl.LINEAR;
            this.updateTextureFiltering();
        });
    }
    
    render() {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        
        if (this.textures.length > 0) {
            this.textures[this.currentTexture].bind(0);
            
            const texLocation = gl.getUniformLocation(this.program, 'u_texture');
            gl.uniform1i(texLocation, 0);
        }
        
        this.drawQuad();
        requestAnimationFrame(() => this.render());
    }
}
```

## 9. 章节总结

通过本章学习，您应该已经：

- ✅ 理解了纹理坐标系统和UV映射
- ✅ 掌握了纹理的创建、加载和使用  
- ✅ 学会了纹理过滤和包装技术
- ✅ 实现了多重纹理混合
- ✅ 了解了立方体贴图和天空盒

## 🔗 下一步

现在您已经掌握了纹理系统，接下来将学习 [材质系统](09-materials.md)：

- PBR（基于物理的渲染）基础
- 材质属性和参数管理
- 金属度-粗糙度工作流
- 标准材质库构建

**准备好构建现代化的材质系统了吗？让我们继续前进！** 🎨⚡ 