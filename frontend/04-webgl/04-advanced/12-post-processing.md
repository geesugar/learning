# 第12章：后处理效果

后处理效果是现代渲染管线的重要组成部分，通过在屏幕空间对渲染结果进行进一步处理，可以显著提升视觉质量。本章将深入探讨帧缓冲技术、各种后处理算法和HDR渲染管线。

## 🎯 学习目标

- 掌握帧缓冲对象（FBO）的使用
- 理解屏幕空间后处理技术
- 实现HDR和色调映射
- 掌握各种视觉特效的实现
- 构建完整的后处理管线

## 📚 章节内容

### 12.1 帧缓冲基础

帧缓冲对象（Framebuffer Object, FBO）是WebGL中实现离屏渲染的核心技术。

#### 12.1.1 基础帧缓冲实现

```javascript
// 帧缓冲管理器
class FramebufferManager {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.framebuffers = new Map();
    }
    
    createFramebuffer(name, options = {}) {
        const gl = this.gl;
        const {
            colorFormat = gl.RGBA,
            colorType = gl.UNSIGNED_BYTE,
            colorFilter = gl.LINEAR,
            depthBuffer = true,
            stencilBuffer = false,
            multipleTargets = false
        } = options;
        
        // 创建帧缓冲
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        
        const fbData = {
            framebuffer,
            colorTextures: [],
            depthTexture: null,
            depthRenderbuffer: null,
            width: this.width,
            height: this.height
        };
        
        // 创建颜色附件
        if (multipleTargets) {
            const targetCount = options.targetCount || 4;
            for (let i = 0; i < targetCount; i++) {
                const colorTexture = this.createColorTexture(colorFormat, colorType, colorFilter);
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_2D,
                    colorTexture,
                    0
                );
                fbData.colorTextures.push(colorTexture);
            }
            
            // 设置绘制缓冲区
            const drawBuffers = Array.from({length: targetCount}, (_, i) => gl.COLOR_ATTACHMENT0 + i);
            gl.drawBuffers(drawBuffers);
        } else {
            const colorTexture = this.createColorTexture(colorFormat, colorType, colorFilter);
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                colorTexture,
                0
            );
            fbData.colorTextures.push(colorTexture);
        }
        
        // 创建深度附件
        if (depthBuffer) {
            if (options.depthTexture) {
                fbData.depthTexture = this.createDepthTexture();
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_ATTACHMENT,
                    gl.TEXTURE_2D,
                    fbData.depthTexture,
                    0
                );
            } else {
                fbData.depthRenderbuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, fbData.depthRenderbuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER,
                    fbData.depthRenderbuffer
                );
            }
        }
        
        // 检查完整性
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error(`Framebuffer ${name} is not complete!`);
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        this.framebuffers.set(name, fbData);
        return fbData;
    }
    
    createColorTexture(format, type, filter) {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, this.width, this.height, 0, format, type, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        return texture;
    }
    
    createDepthTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 
                     0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        return texture;
    }
    
    bindFramebuffer(name) {
        const fbData = this.framebuffers.get(name);
        if (fbData) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbData.framebuffer);
            this.gl.viewport(0, 0, fbData.width, fbData.height);
        }
    }
    
    unbindFramebuffer() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
    
    getTexture(framebufferName, attachmentIndex = 0) {
        const fbData = this.framebuffers.get(framebufferName);
        return fbData ? fbData.colorTextures[attachmentIndex] : null;
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        // 重新创建所有帧缓冲
        for (const [name, fbData] of this.framebuffers) {
            this.recreateFramebuffer(name, fbData);
        }
    }
}
```

### 12.2 后处理管线

构建灵活的后处理管线是实现复杂视觉效果的基础。

#### 12.2.1 后处理管线架构

```javascript
// 后处理效果基类
class PostProcessEffect {
    constructor(gl, name) {
        this.gl = gl;
        this.name = name;
        this.enabled = true;
        this.uniforms = {};
    }
    
    // 子类需要实现
    getFragmentShader() {
        throw new Error('getFragmentShader must be implemented');
    }
    
    // 可选重写
    getVertexShader() {
        return `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            
            varying vec2 v_texCoord;
            
            void main() {
                v_texCoord = a_texCoord;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
    }
    
    initialize() {
        this.createShader();
        this.createQuad();
    }
    
    createShader() {
        const vertexShader = this.getVertexShader();
        const fragmentShader = this.getFragmentShader();
        this.program = createShaderProgram(this.gl, vertexShader, fragmentShader);
    }
    
    createQuad() {
        const gl = this.gl;
        
        // 全屏四边形
        const vertices = new Float32Array([
            -1, -1, 0, 0,
             1, -1, 1, 0,
            -1,  1, 0, 1,
             1,  1, 1, 1
        ]);
        
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }
    
    setUniform(name, value) {
        this.uniforms[name] = value;
    }
    
    render(inputTexture, outputFramebuffer = null) {
        if (!this.enabled) return inputTexture;
        
        const gl = this.gl;
        
        // 绑定输出帧缓冲
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
        
        // 使用着色器程序
        gl.useProgram(this.program);
        
        // 绑定输入纹理
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        gl.uniform1i(gl.getUniformLocation(this.program, 'u_texture'), 0);
        
        // 设置统一变量
        this.setUniforms();
        
        // 绑定四边形
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        
        const posLoc = gl.getAttribLocation(this.program, 'a_position');
        const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
        
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
        
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
        
        // 渲染
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        return outputFramebuffer ? outputFramebuffer.colorTextures[0] : null;
    }
    
    setUniforms() {
        const gl = this.gl;
        for (const [name, value] of Object.entries(this.uniforms)) {
            const location = gl.getUniformLocation(this.program, name);
            if (location) {
                if (typeof value === 'number') {
                    gl.uniform1f(location, value);
                } else if (Array.isArray(value)) {
                    switch (value.length) {
                        case 2: gl.uniform2fv(location, value); break;
                        case 3: gl.uniform3fv(location, value); break;
                        case 4: gl.uniform4fv(location, value); break;
                        case 16: gl.uniformMatrix4fv(location, false, value); break;
                    }
                }
            }
        }
    }
}

// 后处理管线
class PostProcessPipeline {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        
        this.effects = [];
        this.framebufferManager = new FramebufferManager(gl, width, height);
        
        // 创建两个帧缓冲用于乒乓操作
        this.framebufferManager.createFramebuffer('ping');
        this.framebufferManager.createFramebuffer('pong');
        
        this.currentBuffer = 'ping';
    }
    
    addEffect(effect) {
        effect.initialize();
        this.effects.push(effect);
        return this;
    }
    
    removeEffect(effectName) {
        const index = this.effects.findIndex(effect => effect.name === effectName);
        if (index >= 0) {
            this.effects.splice(index, 1);
        }
        return this;
    }
    
    render(inputTexture) {
        if (this.effects.length === 0) {
            return inputTexture;
        }
        
        let currentTexture = inputTexture;
        
        for (let i = 0; i < this.effects.length; i++) {
            const effect = this.effects[i];
            if (!effect.enabled) continue;
            
            const isLast = i === this.effects.length - 1;
            
            if (isLast) {
                // 最后一个效果渲染到屏幕
                currentTexture = effect.render(currentTexture, null);
            } else {
                // 渲染到帧缓冲
                const outputBuffer = this.getNextFramebuffer();
                this.framebufferManager.bindFramebuffer(outputBuffer);
                
                effect.render(currentTexture, null);
                currentTexture = this.framebufferManager.getTexture(outputBuffer);
                
                this.swapBuffers();
            }
        }
        
        return currentTexture;
    }
    
    getNextFramebuffer() {
        return this.currentBuffer === 'ping' ? 'pong' : 'ping';
    }
    
    swapBuffers() {
        this.currentBuffer = this.currentBuffer === 'ping' ? 'pong' : 'ping';
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.framebufferManager.resize(width, height);
    }
}
```

### 12.3 基础后处理效果

#### 12.3.1 模糊效果

```javascript
// 高斯模糊效果
class GaussianBlurEffect extends PostProcessEffect {
    constructor(gl, radius = 5, sigma = 2.0) {
        super(gl, 'gaussianBlur');
        this.radius = radius;
        this.sigma = sigma;
        this.direction = [1, 0]; // 模糊方向
        
        this.generateKernel();
    }
    
    generateKernel() {
        const size = this.radius * 2 + 1;
        this.kernel = new Array(size);
        this.offsets = new Array(size);
        
        let sum = 0;
        for (let i = 0; i < size; i++) {
            const x = i - this.radius;
            this.kernel[i] = Math.exp(-(x * x) / (2 * this.sigma * this.sigma));
            this.offsets[i] = x;
            sum += this.kernel[i];
        }
        
        // 归一化
        for (let i = 0; i < size; i++) {
            this.kernel[i] /= sum;
        }
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform vec2 u_direction;
            uniform vec2 u_resolution;
            uniform float u_kernel[${this.kernel.length}];
            uniform float u_offsets[${this.offsets.length}];
            
            varying vec2 v_texCoord;
            
            void main() {
                vec2 texelSize = 1.0 / u_resolution;
                vec3 result = vec3(0.0);
                
                for (int i = 0; i < ${this.kernel.length}; i++) {
                    vec2 offset = u_direction * u_offsets[i] * texelSize;
                    result += texture2D(u_texture, v_texCoord + offset).rgb * u_kernel[i];
                }
                
                gl_FragColor = vec4(result, 1.0);
            }
        `;
    }
    
    setUniforms() {
        const gl = this.gl;
        
        gl.uniform2fv(gl.getUniformLocation(this.program, 'u_direction'), this.direction);
        gl.uniform2f(gl.getUniformLocation(this.program, 'u_resolution'), this.gl.canvas.width, this.gl.canvas.height);
        gl.uniform1fv(gl.getUniformLocation(this.program, 'u_kernel'), this.kernel);
        gl.uniform1fv(gl.getUniformLocation(this.program, 'u_offsets'), this.offsets);
        
        super.setUniforms();
    }
    
    setDirection(x, y) {
        this.direction[0] = x;
        this.direction[1] = y;
    }
}

// 双通道高斯模糊
class TwoPassGaussianBlur {
    constructor(gl, radius = 5, sigma = 2.0) {
        this.horizontalBlur = new GaussianBlurEffect(gl, radius, sigma);
        this.verticalBlur = new GaussianBlurEffect(gl, radius, sigma);
        
        this.horizontalBlur.setDirection(1, 0);
        this.verticalBlur.setDirection(0, 1);
        
        this.framebufferManager = new FramebufferManager(gl, gl.canvas.width, gl.canvas.height);
        this.framebufferManager.createFramebuffer('blur_temp');
    }
    
    render(inputTexture) {
        // 水平模糊
        this.framebufferManager.bindFramebuffer('blur_temp');
        this.horizontalBlur.render(inputTexture, null);
        
        const tempTexture = this.framebufferManager.getTexture('blur_temp');
        
        // 垂直模糊
        this.framebufferManager.unbindFramebuffer();
        return this.verticalBlur.render(tempTexture, null);
    }
}
```

#### 12.3.2 色彩调整效果

```javascript
// 色彩调整效果
class ColorAdjustmentEffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'colorAdjustment');
        
        // 默认参数
        this.setUniform('u_brightness', 0.0);
        this.setUniform('u_contrast', 1.0);
        this.setUniform('u_saturation', 1.0);
        this.setUniform('u_hue', 0.0);
        this.setUniform('u_gamma', 1.0);
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform float u_brightness;
            uniform float u_contrast;
            uniform float u_saturation;
            uniform float u_hue;
            uniform float u_gamma;
            
            varying vec2 v_texCoord;
            
            vec3 rgb2hsv(vec3 c) {
                vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            void main() {
                vec3 color = texture2D(u_texture, v_texCoord).rgb;
                
                // 亮度调整
                color += u_brightness;
                
                // 对比度调整
                color = (color - 0.5) * u_contrast + 0.5;
                
                // 饱和度和色相调整
                vec3 hsv = rgb2hsv(color);
                hsv.y *= u_saturation;
                hsv.x += u_hue;
                color = hsv2rgb(hsv);
                
                // 伽马校正
                color = pow(color, vec3(1.0 / u_gamma));
                
                color = clamp(color, 0.0, 1.0);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }
    
    setBrightness(value) {
        this.setUniform('u_brightness', value);
    }
    
    setContrast(value) {
        this.setUniform('u_contrast', value);
    }
    
    setSaturation(value) {
        this.setUniform('u_saturation', value);
    }
    
    setHue(value) {
        this.setUniform('u_hue', value);
    }
    
    setGamma(value) {
        this.setUniform('u_gamma', value);
    }
}
```

### 12.4 HDR和色调映射

高动态范围（HDR）渲染允许使用更大的亮度范围，色调映射则将HDR结果映射到显示设备的有限动态范围。

#### 12.4.1 HDR帧缓冲

```javascript
// HDR渲染管理器
class HDRRenderManager {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        
        this.createHDRFramebuffer();
        this.createToneMappingEffect();
    }
    
    createHDRFramebuffer() {
        const gl = this.gl;
        
        // 检查浮点纹理支持
        const ext = gl.getExtension('OES_texture_float') || gl.getExtension('EXT_color_buffer_float');
        if (!ext) {
            console.warn('Float textures not supported, falling back to RGBA');
        }
        
        this.hdrFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdrFramebuffer);
        
        // HDR颜色纹理
        this.hdrColorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.hdrColorTexture);
        
        if (ext) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 
                         0, gl.RGBA, gl.FLOAT, null);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 
                         0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                               gl.TEXTURE_2D, this.hdrColorTexture, 0);
        
        // 深度缓冲
        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                                  gl.RENDERBUFFER, this.depthBuffer);
        
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('HDR Framebuffer not complete!');
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    createToneMappingEffect() {
        this.toneMappingEffect = new ToneMappingEffect(this.gl);
        this.toneMappingEffect.initialize();
    }
    
    beginHDRRender() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdrFramebuffer);
        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    
    endHDRRender() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        // 应用色调映射
        this.toneMappingEffect.render(this.hdrColorTexture);
    }
}

// 色调映射效果
class ToneMappingEffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'toneMapping');
        
        this.setUniform('u_exposure', 1.0);
        this.setUniform('u_gamma', 2.2);
        this.setUniform('u_toneMappingType', 0); // 0: Reinhard, 1: ACES, 2: Filmic
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform float u_exposure;
            uniform float u_gamma;
            uniform int u_toneMappingType;
            
            varying vec2 v_texCoord;
            
            // Reinhard色调映射
            vec3 reinhardToneMapping(vec3 color) {
                return color / (color + vec3(1.0));
            }
            
            // ACES色调映射
            vec3 acesToneMapping(vec3 color) {
                const float a = 2.51;
                const float b = 0.03;
                const float c = 2.43;
                const float d = 0.59;
                const float e = 0.14;
                return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
            }
            
            // 电影级色调映射
            vec3 filmicToneMapping(vec3 color) {
                color = max(vec3(0.0), color - vec3(0.004));
                color = (color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06);
                return color;
            }
            
            void main() {
                vec3 hdrColor = texture2D(u_texture, v_texCoord).rgb;
                
                // 曝光调整
                hdrColor *= u_exposure;
                
                vec3 mapped;
                if (u_toneMappingType == 0) {
                    mapped = reinhardToneMapping(hdrColor);
                } else if (u_toneMappingType == 1) {
                    mapped = acesToneMapping(hdrColor);
                } else {
                    mapped = filmicToneMapping(hdrColor);
                }
                
                // 伽马校正
                mapped = pow(mapped, vec3(1.0 / u_gamma));
                
                gl_FragColor = vec4(mapped, 1.0);
            }
        `;
    }
    
    setExposure(exposure) {
        this.setUniform('u_exposure', exposure);
    }
    
    setGamma(gamma) {
        this.setUniform('u_gamma', gamma);
    }
    
    setToneMappingType(type) {
        this.setUniform('u_toneMappingType', type);
    }
}
```

### 12.5 高级后处理效果

#### 12.5.1 屏幕空间环境光遮蔽（SSAO）

```javascript
// SSAO效果
class SSAOEffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'ssao');
        
        this.setUniform('u_radius', 0.5);
        this.setUniform('u_bias', 0.025);
        this.setUniform('u_power', 2.0);
        this.setUniform('u_kernelSize', 64);
        
        this.generateKernel();
        this.generateNoiseTexture();
    }
    
    generateKernel() {
        // 生成随机采样核心
        this.kernel = [];
        for (let i = 0; i < 64; i++) {
            let sample = [
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random()
            ];
            
            // 归一化
            const length = Math.sqrt(sample[0] * sample[0] + sample[1] * sample[1] + sample[2] * sample[2]);
            sample = sample.map(x => x / length);
            
            // 缩放
            let scale = i / 64.0;
            scale = 0.1 + scale * scale * 0.9; // 插值函数
            sample = sample.map(x => x * scale);
            
            this.kernel.push(...sample);
        }
    }
    
    generateNoiseTexture() {
        const gl = this.gl;
        
        // 4x4噪声纹理
        const noiseData = new Float32Array(16 * 3);
        for (let i = 0; i < 16; i++) {
            noiseData[i * 3] = Math.random() * 2.0 - 1.0;
            noiseData[i * 3 + 1] = Math.random() * 2.0 - 1.0;
            noiseData[i * 3 + 2] = 0.0;
        }
        
        this.noiseTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 4, 4, 0, gl.RGB, gl.FLOAT, noiseData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;        // 场景颜色
            uniform sampler2D u_depthTexture;   // 深度纹理
            uniform sampler2D u_normalTexture;  // 法线纹理
            uniform sampler2D u_noiseTexture;   // 噪声纹理
            
            uniform vec3 u_kernel[64];
            uniform mat4 u_projectionMatrix;
            uniform float u_radius;
            uniform float u_bias;
            uniform float u_power;
            uniform vec2 u_resolution;
            
            varying vec2 v_texCoord;
            
            vec3 reconstructPosition(vec2 texCoord, float depth) {
                vec4 clipSpacePos = vec4(texCoord * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
                vec4 viewSpacePos = inverse(u_projectionMatrix) * clipSpacePos;
                return viewSpacePos.xyz / viewSpacePos.w;
            }
            
            void main() {
                vec3 fragPos = reconstructPosition(v_texCoord, texture2D(u_depthTexture, v_texCoord).r);
                vec3 normal = normalize(texture2D(u_normalTexture, v_texCoord).rgb * 2.0 - 1.0);
                
                // 获取噪声向量
                vec2 noiseScale = u_resolution / 4.0;
                vec3 randomVec = normalize(texture2D(u_noiseTexture, v_texCoord * noiseScale).rgb);
                
                // TBN矩阵
                vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
                vec3 bitangent = cross(normal, tangent);
                mat3 TBN = mat3(tangent, bitangent, normal);
                
                float occlusion = 0.0;
                for (int i = 0; i < 64; ++i) {
                    // 获取样本位置
                    vec3 samplePos = TBN * u_kernel[i];
                    samplePos = fragPos + samplePos * u_radius;
                    
                    // 投影到屏幕空间
                    vec4 offset = u_projectionMatrix * vec4(samplePos, 1.0);
                    offset.xyz /= offset.w;
                    offset.xyz = offset.xyz * 0.5 + 0.5;
                    
                    // 获取样本深度
                    float sampleDepth = reconstructPosition(offset.xy, texture2D(u_depthTexture, offset.xy).r).z;
                    
                    // 深度检测
                    float rangeCheck = smoothstep(0.0, 1.0, u_radius / abs(fragPos.z - sampleDepth));
                    occlusion += (sampleDepth >= samplePos.z + u_bias ? 1.0 : 0.0) * rangeCheck;
                }
                
                occlusion = 1.0 - (occlusion / 64.0);
                occlusion = pow(occlusion, u_power);
                
                vec3 color = texture2D(u_texture, v_texCoord).rgb;
                gl_FragColor = vec4(color * occlusion, 1.0);
            }
        `;
    }
}
```

#### 12.5.2 Bloom效果

```javascript
// Bloom效果实现
class BloomEffect {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        
        this.createFramebuffers();
        this.createEffects();
    }
    
    createFramebuffers() {
        this.fbManager = new FramebufferManager(this.gl, this.width, this.height);
        
        // 创建不同尺寸的帧缓冲用于模糊
        const scales = [1, 0.5, 0.25, 0.125];
        this.bloomFramebuffers = [];
        
        for (let i = 0; i < scales.length; i++) {
            const scale = scales[i];
            const w = Math.max(1, this.width * scale);
            const h = Math.max(1, this.height * scale);
            
            this.fbManager.width = w;
            this.fbManager.height = h;
            
            this.bloomFramebuffers.push({
                horizontal: this.fbManager.createFramebuffer(`bloom_h_${i}`),
                vertical: this.fbManager.createFramebuffer(`bloom_v_${i}`),
                width: w,
                height: h
            });
        }
        
        // 恢复原始尺寸
        this.fbManager.width = this.width;
        this.fbManager.height = this.height;
    }
    
    createEffects() {
        // 亮度提取
        this.brightPassEffect = new BrightPassEffect(this.gl);
        this.brightPassEffect.initialize();
        
        // 高斯模糊
        this.blurEffect = new TwoPassGaussianBlur(this.gl, 5, 2.0);
        
        // 混合效果
        this.bloomCombineEffect = new BloomCombineEffect(this.gl);
        this.bloomCombineEffect.initialize();
    }
    
    render(inputTexture, outputFramebuffer = null) {
        const gl = this.gl;
        
        // 1. 亮度提取
        this.fbManager.bindFramebuffer(`bloom_h_0`);
        this.brightPassEffect.render(inputTexture);
        
        let currentTexture = this.fbManager.getTexture(`bloom_h_0`);
        
        // 2. 多尺度模糊
        for (let i = 0; i < this.bloomFramebuffers.length; i++) {
            const fb = this.bloomFramebuffers[i];
            
            // 水平模糊
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb.horizontal.framebuffer);
            gl.viewport(0, 0, fb.width, fb.height);
            this.blurEffect.horizontalBlur.render(currentTexture);
            
            // 垂直模糊
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb.vertical.framebuffer);
            this.blurEffect.verticalBlur.render(fb.horizontal.colorTextures[0]);
            
            currentTexture = fb.vertical.colorTextures[0];
        }
        
        // 3. 混合原图和bloom效果
        if (outputFramebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
        } else {
            this.fbManager.unbindFramebuffer();
        }
        
        this.bloomCombineEffect.setUniform('u_bloomTexture', currentTexture);
        this.bloomCombineEffect.render(inputTexture);
        
        return currentTexture;
    }
}

// 亮度提取效果
class BrightPassEffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'brightPass');
        this.setUniform('u_threshold', 1.0);
        this.setUniform('u_softKnee', 0.5);
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform float u_threshold;
            uniform float u_softKnee;
            
            varying vec2 v_texCoord;
            
            void main() {
                vec3 color = texture2D(u_texture, v_texCoord).rgb;
                float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
                
                float knee = u_threshold * u_softKnee;
                float soft = brightness - u_threshold + knee;
                soft = clamp(soft, 0.0, 2.0 * knee);
                soft = soft * soft / (4.0 * knee + 0.00001);
                
                float contribution = max(soft, brightness - u_threshold);
                contribution /= max(brightness, 0.00001);
                
                gl_FragColor = vec4(color * contribution, 1.0);
            }
        `;
    }
}

// Bloom混合效果
class BloomCombineEffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'bloomCombine');
        this.setUniform('u_bloomIntensity', 1.0);
        this.setUniform('u_bloomTint', [1.0, 1.0, 1.0]);
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;      // 原图
            uniform sampler2D u_bloomTexture; // Bloom纹理
            uniform float u_bloomIntensity;
            uniform vec3 u_bloomTint;
            
            varying vec2 v_texCoord;
            
            void main() {
                vec3 original = texture2D(u_texture, v_texCoord).rgb;
                vec3 bloom = texture2D(u_bloomTexture, v_texCoord).rgb;
                
                bloom *= u_bloomTint * u_bloomIntensity;
                
                // 屏幕混合模式
                vec3 result = 1.0 - (1.0 - original) * (1.0 - bloom);
                
                gl_FragColor = vec4(result, 1.0);
            }
        `;
    }
}
```

### 12.6 屏幕空间反射（SSR）

```javascript
// 屏幕空间反射效果
class SSREffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'ssr');
        
        this.setUniform('u_maxDistance', 100.0);
        this.setUniform('u_resolution', 0.3);
        this.setUniform('u_steps', 64);
        this.setUniform('u_thickness', 0.5);
        this.setUniform('u_reflectionIntensity', 1.0);
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;        // 场景颜色
            uniform sampler2D u_depthTexture;   // 深度纹理
            uniform sampler2D u_normalTexture;  // 法线纹理
            uniform sampler2D u_roughnessTexture; // 粗糙度纹理
            
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_inverseProjectionMatrix;
            uniform vec3 u_cameraPosition;
            
            uniform float u_maxDistance;
            uniform float u_resolution;
            uniform int u_steps;
            uniform float u_thickness;
            uniform float u_reflectionIntensity;
            uniform vec2 u_screenSize;
            
            varying vec2 v_texCoord;
            
            vec3 getViewPosition(vec2 texCoord) {
                float depth = texture2D(u_depthTexture, texCoord).r;
                vec4 clipPos = vec4(texCoord * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
                vec4 viewPos = u_inverseProjectionMatrix * clipPos;
                return viewPos.xyz / viewPos.w;
            }
            
            vec2 getScreenSpacePosition(vec3 worldPos) {
                vec4 clipPos = u_projectionMatrix * u_viewMatrix * vec4(worldPos, 1.0);
                vec2 screenPos = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
                return screenPos;
            }
            
            bool traceRay(vec3 origin, vec3 direction, out vec2 hitPixel, out float hitZ) {
                float rayLength = u_maxDistance;
                vec3 endPoint = origin + direction * rayLength;
                
                vec2 startPixel = getScreenSpacePosition(origin);
                vec2 endPixel = getScreenSpacePosition(endPoint);
                
                vec2 deltaPixel = endPixel - startPixel;
                float pixelStride = length(deltaPixel) / float(u_steps);
                
                vec2 stepPixel = normalize(deltaPixel) * pixelStride;
                
                vec2 currentPixel = startPixel;
                float currentZ = origin.z;
                
                for (int i = 0; i < 64; ++i) {
                    if (i >= u_steps) break;
                    
                    currentPixel += stepPixel;
                    currentZ -= rayLength / float(u_steps);
                    
                    if (currentPixel.x < 0.0 || currentPixel.x > 1.0 || 
                        currentPixel.y < 0.0 || currentPixel.y > 1.0) {
                        return false;
                    }
                    
                    float sceneZ = getViewPosition(currentPixel).z;
                    
                    if (currentZ > sceneZ && currentZ - sceneZ < u_thickness) {
                        hitPixel = currentPixel;
                        hitZ = sceneZ;
                        return true;
                    }
                }
                
                return false;
            }
            
            void main() {
                vec3 baseColor = texture2D(u_texture, v_texCoord).rgb;
                vec3 normal = normalize(texture2D(u_normalTexture, v_texCoord).rgb * 2.0 - 1.0);
                float roughness = texture2D(u_roughnessTexture, v_texCoord).r;
                
                // 金属表面才有强反射
                if (roughness > 0.8) {
                    gl_FragColor = vec4(baseColor, 1.0);
                    return;
                }
                
                vec3 viewPos = getViewPosition(v_texCoord);
                vec3 viewDir = normalize(-viewPos);
                vec3 reflectDir = reflect(-viewDir, normal);
                
                vec2 hitPixel;
                float hitZ;
                
                if (traceRay(viewPos, reflectDir, hitPixel, hitZ)) {
                    vec3 reflectedColor = texture2D(u_texture, hitPixel).rgb;
                    
                    // 根据粗糙度调整反射强度
                    float reflectionStrength = (1.0 - roughness) * u_reflectionIntensity;
                    
                    // 边缘衰减
                    float edgeFactor = 1.0 - pow(max(0.0, dot(normal, viewDir)), 2.0);
                    reflectionStrength *= edgeFactor;
                    
                    vec3 finalColor = mix(baseColor, reflectedColor, reflectionStrength);
                    gl_FragColor = vec4(finalColor, 1.0);
                } else {
                    gl_FragColor = vec4(baseColor, 1.0);
                }
            }
        `;
    }
}
```

### 12.7 实践案例：完整后处理系统

```javascript
// 综合后处理系统
class AdvancedPostProcessSystem {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        
        this.setupFramebuffers();
        this.setupEffects();
        this.setupPipeline();
    }
    
    setupFramebuffers() {
        this.fbManager = new FramebufferManager(this.gl, this.width, this.height);
        
        // G-Buffer（来自延迟渲染）
        this.gBuffer = this.fbManager.createFramebuffer('gbuffer', {
            multipleTargets: true,
            targetCount: 4,
            depthTexture: true
        });
        
        // HDR渲染目标
        this.hdrBuffer = this.fbManager.createFramebuffer('hdr', {
            colorFormat: this.gl.RGBA,
            colorType: this.gl.FLOAT
        });
        
        // 后处理临时缓冲区
        this.tempBuffers = [
            this.fbManager.createFramebuffer('temp1'),
            this.fbManager.createFramebuffer('temp2')
        ];
    }
    
    setupEffects() {
        // 基础效果
        this.ssaoEffect = new SSAOEffect(this.gl);
        this.ssaoEffect.initialize();
        
        this.ssrEffect = new SSREffect(this.gl);
        this.ssrEffect.initialize();
        
        this.bloomEffect = new BloomEffect(this.gl, this.width, this.height);
        
        // 色调映射和色彩校正
        this.toneMappingEffect = new ToneMappingEffect(this.gl);
        this.toneMappingEffect.initialize();
        
        this.colorAdjustment = new ColorAdjustmentEffect(this.gl);
        this.colorAdjustment.initialize();
        
        // 抗锯齿
        this.fxaaEffect = new FXAAEffect(this.gl);
        this.fxaaEffect.initialize();
    }
    
    setupPipeline() {
        this.pipeline = new PostProcessPipeline(this.gl, this.width, this.height);
        
        // 配置后处理链
        this.pipeline
            .addEffect(this.ssaoEffect)
            .addEffect(this.ssrEffect)
            .addEffect(this.bloomEffect)
            .addEffect(this.toneMappingEffect)
            .addEffect(this.colorAdjustment)
            .addEffect(this.fxaaEffect);
    }
    
    render(scene, camera) {
        const gl = this.gl;
        
        // 1. 几何阶段 - 渲染到G-Buffer
        this.fbManager.bindFramebuffer('gbuffer');
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        scene.renderGeometry(camera);
        
        // 2. 光照阶段 - 渲染到HDR缓冲区
        this.fbManager.bindFramebuffer('hdr');
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.renderLighting(scene, camera);
        
        // 3. 后处理链
        const hdrTexture = this.fbManager.getTexture('hdr');
        this.updateEffectUniforms(camera);
        this.pipeline.render(hdrTexture);
    }
    
    renderLighting(scene, camera) {
        // 延迟光照渲染
        const gBufferTextures = this.gBuffer.colorTextures;
        
        // 绑定G-Buffer纹理
        for (let i = 0; i < gBufferTextures.length; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, gBufferTextures[i]);
        }
        
        // 渲染光照
        scene.renderLighting(camera, gBufferTextures);
    }
    
    updateEffectUniforms(camera) {
        // 更新SSAO参数
        this.ssaoEffect.setUniform('u_projectionMatrix', camera.getProjectionMatrix());
        
        // 更新SSR参数
        this.ssrEffect.setUniform('u_viewMatrix', camera.getViewMatrix());
        this.ssrEffect.setUniform('u_projectionMatrix', camera.getProjectionMatrix());
        this.ssrEffect.setUniform('u_inverseProjectionMatrix', camera.getInverseProjectionMatrix());
        this.ssrEffect.setUniform('u_cameraPosition', camera.position);
        this.ssrEffect.setUniform('u_screenSize', [this.width, this.height]);
        
        // 更新其他效果参数...
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.fbManager.resize(width, height);
        this.bloomEffect = new BloomEffect(this.gl, width, height);
        this.pipeline.resize(width, height);
    }
}

// FXAA抗锯齿效果
class FXAAEffect extends PostProcessEffect {
    constructor(gl) {
        super(gl, 'fxaa');
    }
    
    getFragmentShader() {
        return `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform vec2 u_resolution;
            
            varying vec2 v_texCoord;
            
            void main() {
                vec2 texelStep = 1.0 / u_resolution;
                
                vec3 rgbNW = texture2D(u_texture, v_texCoord + vec2(-1.0, -1.0) * texelStep).rgb;
                vec3 rgbNE = texture2D(u_texture, v_texCoord + vec2(1.0, -1.0) * texelStep).rgb;
                vec3 rgbSW = texture2D(u_texture, v_texCoord + vec2(-1.0, 1.0) * texelStep).rgb;
                vec3 rgbSE = texture2D(u_texture, v_texCoord + vec2(1.0, 1.0) * texelStep).rgb;
                vec3 rgbM = texture2D(u_texture, v_texCoord).rgb;
                
                vec3 luma = vec3(0.299, 0.587, 0.114);
                float lumaNW = dot(rgbNW, luma);
                float lumaNE = dot(rgbNE, luma);
                float lumaSW = dot(rgbSW, luma);
                float lumaSE = dot(rgbSE, luma);
                float lumaM = dot(rgbM, luma);
                
                float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
                float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
                
                vec2 dir;
                dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
                dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));
                
                float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.03125, 0.0078125);
                float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
                
                dir = min(vec2(8.0), max(vec2(-8.0), dir * rcpDirMin)) * texelStep;
                
                vec3 rgbA = 0.5 * (
                    texture2D(u_texture, v_texCoord + dir * (1.0 / 3.0 - 0.5)).rgb +
                    texture2D(u_texture, v_texCoord + dir * (2.0 / 3.0 - 0.5)).rgb
                );
                
                vec3 rgbB = rgbA * 0.5 + 0.25 * (
                    texture2D(u_texture, v_texCoord + dir * -0.5).rgb +
                    texture2D(u_texture, v_texCoord + dir * 0.5).rgb
                );
                
                float lumaB = dot(rgbB, luma);
                
                if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
                    gl_FragColor = vec4(rgbA, 1.0);
                } else {
                    gl_FragColor = vec4(rgbB, 1.0);
                }
            }
        `;
    }
}
```

## 🎯 性能优化技巧

### 后处理优化策略
```javascript
// 适应性后处理
class AdaptivePostProcessing {
    constructor(gl, targetFPS = 60) {
        this.gl = gl;
        this.targetFPS = targetFPS;
        this.targetFrameTime = 1000 / targetFPS;
        
        this.performanceMonitor = new PerformanceMonitor();
        this.qualityLevel = 2; // 0: Low, 1: Medium, 2: High
        
        this.setupQualityPresets();
    }
    
    setupQualityPresets() {
        this.qualityPresets = {
            0: { // LOW
                ssaoEnabled: false,
                bloomQuality: 'low',
                fxaaEnabled: true
            },
            1: { // MEDIUM
                ssaoEnabled: true,
                bloomQuality: 'medium', 
                fxaaEnabled: true
            },
            2: { // HIGH
                ssaoEnabled: true,
                bloomQuality: 'high',
                fxaaEnabled: true
            }
        };
    }
    
    update() {
        const currentFrameTime = this.performanceMonitor.getAverageFrameTime();
        
        if (currentFrameTime > this.targetFrameTime * 1.2) {
            this.decreaseQuality();
        } else if (currentFrameTime < this.targetFrameTime * 0.8) {
            this.increaseQuality();
        }
        
        this.applyQualitySettings();
    }
    
    decreaseQuality() {
        if (this.qualityLevel > 0) {
            this.qualityLevel--;
        }
    }
    
    increaseQuality() {
        if (this.qualityLevel < 2) {
            this.qualityLevel++;
        }
    }
}
```

## ✅ 学习检查点

完成本章学习后，您应该能够：

- [ ] 创建和管理帧缓冲对象系统
- [ ] 构建灵活的后处理管线架构
- [ ] 实现基础后处理效果（模糊、色彩调整）
- [ ] 掌握HDR渲染和色调映射技术
- [ ] 实现高级后处理效果（SSAO、Bloom）
- [ ] 优化后处理效果的性能
- [ ] 构建完整的后处理系统

## 🚀 下一步

完成后处理效果学习后，接下来进入[第5阶段：性能与工程化](../05-engineering/README.md)，学习WebGL应用的性能优化和现代工具链集成。

后处理是现代渲染管线的关键环节，建议您创建一个综合的demo项目来实践这些技术，体验不同效果对视觉质量的提升。 