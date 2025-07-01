# 第15章：WebGL 2.0特性

WebGL 2.0基于OpenGL ES 3.0，引入了许多强大的新特性，大幅提升了渲染能力和开发效率。本章将深入探讨WebGL 2.0的核心特性和实践应用。

## 🎯 学习目标

- 掌握WebGL 2.0的新渲染特性
- 理解3D纹理和纹理数组的使用
- 实现几何着色器和变换反馈
- 掌握统一缓冲对象和多重渲染目标
- 学习计算着色器的基础应用

## 📚 章节内容

### 15.1 WebGL 2.0核心特性概览

#### 15.1.1 特性检测和初始化

```javascript
// WebGL 2.0上下文管理器
class WebGL2ContextManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.gl = null;
        this.extensions = new Map();
        this.features = new Set();
        
        this.initializeContext(options);
        this.detectFeatures();
    }
    
    initializeContext(options) {
        // 尝试获取WebGL 2.0上下文
        this.gl = this.canvas.getContext('webgl2', {
            alpha: options.alpha || false,
            antialias: options.antialias || true,
            depth: options.depth !== false,
            stencil: options.stencil || false,
            premultipliedAlpha: options.premultipliedAlpha || true,
            preserveDrawingBuffer: options.preserveDrawingBuffer || false,
            powerPreference: options.powerPreference || 'default'
        });
        
        if (!this.gl) {
            // 回退到WebGL 1.0
            this.gl = this.canvas.getContext('webgl', options);
            console.warn('WebGL 2.0 not supported, falling back to WebGL 1.0');
        } else {
            console.log('WebGL 2.0 context created successfully');
        }
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
    }
    
    detectFeatures() {
        const gl = this.gl;
        
        // 检测WebGL版本
        const version = gl.getParameter(gl.VERSION);
        const isWebGL2 = version.includes('WebGL 2.0');
        
        if (isWebGL2) {
            this.features.add('webgl2');
            
            // WebGL 2.0核心特性
            this.features.add('3d-textures');
            this.features.add('texture-arrays');
            this.features.add('uniform-buffer-objects');
            this.features.add('transform-feedback');
            this.features.add('sampler-objects');
            this.features.add('vertex-array-objects');
            this.features.add('multiple-render-targets');
            this.features.add('integer-textures');
            this.features.add('non-power-of-2-textures');
            
            // 检测可选扩展
            this.checkOptionalExtensions();
        } else {
            this.features.add('webgl1');
            this.checkWebGL1Extensions();
        }
        
        this.logFeatureSupport();
    }
    
    checkOptionalExtensions() {
        const optionalExtensions = [
            'EXT_color_buffer_float',
            'EXT_texture_filter_anisotropic',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_compressed_texture_etc',
            'WEBGL_compressed_texture_astc',
            'EXT_disjoint_timer_query_webgl2',
            'OES_texture_float_linear',
            'EXT_texture_norm16'
        ];
        
        for (const extName of optionalExtensions) {
            const ext = this.gl.getExtension(extName);
            if (ext) {
                this.extensions.set(extName, ext);
                this.features.add(extName.toLowerCase().replace(/_/g, '-'));
            }
        }
    }
    
    checkWebGL1Extensions() {
        const webgl1Extensions = [
            'OES_vertex_array_object',
            'WEBGL_draw_buffers',
            'OES_texture_float',
            'OES_texture_half_float',
            'ANGLE_instanced_arrays',
            'EXT_disjoint_timer_query'
        ];
        
        for (const extName of webgl1Extensions) {
            const ext = this.gl.getExtension(extName);
            if (ext) {
                this.extensions.set(extName, ext);
                this.features.add(extName.toLowerCase().replace(/_/g, '-'));
            }
        }
    }
    
    hasFeature(featureName) {
        return this.features.has(featureName);
    }
    
    getExtension(extensionName) {
        return this.extensions.get(extensionName);
    }
    
    isWebGL2() {
        return this.hasFeature('webgl2');
    }
    
    logFeatureSupport() {
        console.log('WebGL Features:', Array.from(this.features));
        console.log('Available Extensions:', Array.from(this.extensions.keys()));
    }
    
    getCapabilities() {
        const gl = this.gl;
        
        return {
            version: gl.getParameter(gl.VERSION),
            renderer: gl.getParameter(gl.RENDERER),
            vendor: gl.getParameter(gl.VENDOR),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
            maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            
            // WebGL 2.0特有
            ...(this.isWebGL2() && {
                max3DTextureSize: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE),
                maxArrayTextureLayers: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
                maxColorAttachments: gl.getParameter(gl.MAX_COLOR_ATTACHMENTS),
                maxDrawBuffers: gl.getParameter(gl.MAX_DRAW_BUFFERS),
                maxElementsIndices: gl.getParameter(gl.MAX_ELEMENTS_INDICES),
                maxElementsVertices: gl.getParameter(gl.MAX_ELEMENTS_VERTICES),
                maxTransformFeedbackInterleavedComponents: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS),
                maxTransformFeedbackSeparateAttribs: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS),
                maxUniformBufferBindings: gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS),
                maxVertexUniformBlocks: gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS),
                maxFragmentUniformBlocks: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS)
            })
        };
    }
}
```

### 15.2 3D纹理和纹理数组

#### 15.2.1 3D纹理实现

```javascript
// 3D纹理管理器
class Texture3DManager {
    constructor(gl) {
        this.gl = gl;
        this.textures = new Map();
        
        if (!gl.getParameter(gl.VERSION).includes('WebGL 2.0')) {
            throw new Error('3D textures require WebGL 2.0');
        }
    }
    
    create3DTexture(name, width, height, depth, format = null, type = null, data = null) {
        const gl = this.gl;
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_3D, texture);
        
        // 默认格式
        const internalFormat = format || gl.RGBA8;
        const srcFormat = this.getSourceFormat(internalFormat);
        const srcType = type || gl.UNSIGNED_BYTE;
        
        // 上传纹理数据
        gl.texImage3D(
            gl.TEXTURE_3D,
            0,                    // mip level
            internalFormat,       // 内部格式
            width,               // 宽度
            height,              // 高度
            depth,               // 深度
            0,                   // border
            srcFormat,           // 源格式
            srcType,             // 源类型
            data                 // 数据
        );
        
        // 设置过滤和包装模式
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        
        // 生成mipmap（如果需要）
        if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height) && this.isPowerOfTwo(depth)) {
            gl.generateMipmap(gl.TEXTURE_3D);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        
        const textureInfo = {
            texture,
            width,
            height,
            depth,
            format: internalFormat,
            type: srcType
        };
        
        this.textures.set(name, textureInfo);
        
        gl.bindTexture(gl.TEXTURE_3D, null);
        
        return textureInfo;
    }
    
    createNoiseTexture3D(name, size, octaves = 4) {
        const data = this.generateNoise3D(size, size, size, octaves);
        
        return this.create3DTexture(
            name,
            size,
            size, 
            size,
            this.gl.R8,
            this.gl.UNSIGNED_BYTE,
            data
        );
    }
    
    generateNoise3D(width, height, depth, octaves = 4) {
        const size = width * height * depth;
        const data = new Uint8Array(size);
        
        for (let z = 0; z < depth; z++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let value = 0;
                    let amplitude = 1;
                    let frequency = 0.01;
                    
                    for (let i = 0; i < octaves; i++) {
                        value += this.noise3D(
                            x * frequency,
                            y * frequency,
                            z * frequency
                        ) * amplitude;
                        
                        amplitude *= 0.5;
                        frequency *= 2;
                    }
                    
                    // 归一化到0-255
                    const index = z * width * height + y * width + x;
                    data[index] = Math.floor((value + 1) * 127.5);
                }
            }
        }
        
        return data;
    }
    
    noise3D(x, y, z) {
        // 简单的3D噪声函数（实际项目中建议使用更好的算法）
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }
    
    getSourceFormat(internalFormat) {
        const gl = this.gl;
        
        switch (internalFormat) {
            case gl.R8:
            case gl.R16F:
            case gl.R32F:
                return gl.RED;
            case gl.RG8:
            case gl.RG16F:
            case gl.RG32F:
                return gl.RG;
            case gl.RGB8:
            case gl.RGB16F:
            case gl.RGB32F:
                return gl.RGB;
            case gl.RGBA8:
            case gl.RGBA16F:
            case gl.RGBA32F:
                return gl.RGBA;
            default:
                return gl.RGBA;
        }
    }
    
    isPowerOfTwo(value) {
        return (value & (value - 1)) === 0;
    }
    
    bind3DTexture(name, unit = 0) {
        const textureInfo = this.textures.get(name);
        if (textureInfo) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.gl.bindTexture(this.gl.TEXTURE_3D, textureInfo.texture);
            return true;
        }
        return false;
    }
    
    getTexture(name) {
        return this.textures.get(name);
    }
    
    delete3DTexture(name) {
        const textureInfo = this.textures.get(name);
        if (textureInfo) {
            this.gl.deleteTexture(textureInfo.texture);
            this.textures.delete(name);
        }
    }
    
    dispose() {
        for (const textureInfo of this.textures.values()) {
            this.gl.deleteTexture(textureInfo.texture);
        }
        this.textures.clear();
    }
}

// 3D纹理着色器示例
const volumeRenderingShaders = {
    vertex: `#version 300 es
        precision highp float;
        
        in vec3 a_position;
        
        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;
        
        out vec3 v_position;
        out vec3 v_texCoord;
        
        void main() {
            v_position = a_position;
            v_texCoord = (a_position + 1.0) * 0.5; // 转换到0-1范围
            
            vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
            gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
        }
    `,
    
    fragment: `#version 300 es
        precision highp float;
        
        in vec3 v_position;
        in vec3 v_texCoord;
        
        uniform sampler3D u_volumeTexture;
        uniform float u_threshold;
        uniform vec3 u_lightDirection;
        uniform float u_stepSize;
        uniform int u_maxSteps;
        
        out vec4 fragColor;
        
        vec3 calculateGradient(vec3 pos) {
            float stepSize = 0.01;
            
            float gradX = texture(u_volumeTexture, pos + vec3(stepSize, 0.0, 0.0)).r -
                         texture(u_volumeTexture, pos - vec3(stepSize, 0.0, 0.0)).r;
            float gradY = texture(u_volumeTexture, pos + vec3(0.0, stepSize, 0.0)).r -
                         texture(u_volumeTexture, pos - vec3(0.0, stepSize, 0.0)).r;
            float gradZ = texture(u_volumeTexture, pos + vec3(0.0, 0.0, stepSize)).r -
                         texture(u_volumeTexture, pos - vec3(0.0, 0.0, stepSize)).r;
            
            return normalize(vec3(gradX, gradY, gradZ));
        }
        
        void main() {
            vec3 rayDir = normalize(v_position);
            vec3 rayPos = v_texCoord;
            
            vec4 color = vec4(0.0);
            float alpha = 0.0;
            
            for (int i = 0; i < u_maxSteps; i++) {
                if (alpha >= 0.95) break;
                
                // 检查边界
                if (any(lessThan(rayPos, vec3(0.0))) || any(greaterThan(rayPos, vec3(1.0)))) {
                    break;
                }
                
                float density = texture(u_volumeTexture, rayPos).r;
                
                if (density > u_threshold) {
                    // 计算光照
                    vec3 gradient = calculateGradient(rayPos);
                    float lighting = max(0.0, dot(gradient, u_lightDirection));
                    
                    vec3 sampleColor = vec3(1.0, 0.5, 0.2) * lighting;
                    float sampleAlpha = density * 0.1;
                    
                    // Alpha混合
                    color.rgb += sampleColor * sampleAlpha * (1.0 - alpha);
                    alpha += sampleAlpha * (1.0 - alpha);
                }
                
                rayPos += rayDir * u_stepSize;
            }
            
            fragColor = vec4(color.rgb, alpha);
        }
    `
};
```

#### 15.2.2 纹理数组

```javascript
// 纹理数组管理器
class TextureArrayManager {
    constructor(gl) {
        this.gl = gl;
        this.textureArrays = new Map();
    }
    
    createTextureArray(name, width, height, layers, format = null, type = null) {
        const gl = this.gl;
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
        
        const internalFormat = format || gl.RGBA8;
        const srcFormat = this.getSourceFormat(internalFormat);
        const srcType = type || gl.UNSIGNED_BYTE;
        
        // 分配纹理存储
        gl.texImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,                    // mip level
            internalFormat,       // 内部格式
            width,               // 宽度
            height,              // 高度
            layers,              // 层数
            0,                   // border
            srcFormat,           // 源格式
            srcType,             // 源类型
            null                 // 初始数据为空
        );
        
        // 设置过滤参数
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        const arrayInfo = {
            texture,
            width,
            height,
            layers,
            format: internalFormat,
            type: srcType,
            loadedLayers: 0
        };
        
        this.textureArrays.set(name, arrayInfo);
        
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
        
        return arrayInfo;
    }
    
    async loadImageToLayer(arrayName, layerIndex, imageUrl) {
        const arrayInfo = this.textureArrays.get(arrayName);
        if (!arrayInfo) {
            throw new Error(`Texture array '${arrayName}' not found`);
        }
        
        if (layerIndex >= arrayInfo.layers) {
            throw new Error(`Layer index ${layerIndex} exceeds array size ${arrayInfo.layers}`);
        }
        
        const image = await this.loadImage(imageUrl);
        
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, arrayInfo.texture);
        
        // 上传图像到指定层
        gl.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,                      // mip level
            0,                      // x offset
            0,                      // y offset
            layerIndex,            // z offset (layer)
            image.width,           // width
            image.height,          // height
            1,                     // depth (1 layer)
            this.getSourceFormat(arrayInfo.format),
            arrayInfo.type,
            image
        );
        
        arrayInfo.loadedLayers++;
        
        // 如果所有层都加载完成，生成mipmap
        if (arrayInfo.loadedLayers === arrayInfo.layers) {
            if (this.isPowerOfTwo(arrayInfo.width) && this.isPowerOfTwo(arrayInfo.height)) {
                gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
                gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            }
        }
        
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    }
    
    async loadImagesFromUrls(arrayName, imageUrls) {
        const arrayInfo = this.createTextureArray(arrayName, 512, 512, imageUrls.length);
        
        const loadPromises = imageUrls.map((url, index) => 
            this.loadImageToLayer(arrayName, index, url)
        );
        
        await Promise.all(loadPromises);
        
        return arrayInfo;
    }
    
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = url;
        });
    }
    
    bindTextureArray(name, unit = 0) {
        const arrayInfo = this.textureArrays.get(name);
        if (arrayInfo) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, arrayInfo.texture);
            return true;
        }
        return false;
    }
    
    getSourceFormat(internalFormat) {
        const gl = this.gl;
        
        switch (internalFormat) {
            case gl.R8: return gl.RED;
            case gl.RG8: return gl.RG;
            case gl.RGB8: return gl.RGB;
            case gl.RGBA8: return gl.RGBA;
            default: return gl.RGBA;
        }
    }
    
    isPowerOfTwo(value) {
        return (value & (value - 1)) === 0;
    }
    
    deleteTextureArray(name) {
        const arrayInfo = this.textureArrays.get(name);
        if (arrayInfo) {
            this.gl.deleteTexture(arrayInfo.texture);
            this.textureArrays.delete(name);
        }
    }
    
    dispose() {
        for (const arrayInfo of this.textureArrays.values()) {
            this.gl.deleteTexture(arrayInfo.texture);
        }
        this.textureArrays.clear();
    }
}

// 纹理数组着色器示例
const textureArrayShaders = {
    vertex: `#version 300 es
        precision highp float;
        
        in vec3 a_position;
        in vec2 a_texCoord;
        in float a_textureIndex; // 纹理层索引
        
        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;
        
        out vec2 v_texCoord;
        out float v_textureIndex;
        
        void main() {
            v_texCoord = a_texCoord;
            v_textureIndex = a_textureIndex;
            
            vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
            gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
        }
    `,
    
    fragment: `#version 300 es
        precision highp float;
        
        in vec2 v_texCoord;
        in float v_textureIndex;
        
        uniform sampler2DArray u_textureArray;
        uniform float u_blendFactor;
        
        out vec4 fragColor;
        
        void main() {
            // 获取整数索引和小数部分用于混合
            float index = v_textureIndex;
            int baseIndex = int(floor(index));
            float blendWeight = fract(index);
            
            vec4 color1 = texture(u_textureArray, vec3(v_texCoord, float(baseIndex)));
            vec4 color2 = texture(u_textureArray, vec3(v_texCoord, float(baseIndex + 1)));
            
            // 在两个纹理层之间混合
            fragColor = mix(color1, color2, blendWeight);
        }
    `
};
```

### 15.3 变换反馈

#### 15.3.1 变换反馈系统

```javascript
// 变换反馈管理器
class TransformFeedbackManager {
    constructor(gl) {
        this.gl = gl;
        this.feedbackObjects = new Map();
        this.programs = new Map();
    }
    
    createTransformFeedbackProgram(name, vertexShader, feedbackVaryings, options = {}) {
        const gl = this.gl;
        
        // 创建着色器程序
        const program = gl.createProgram();
        
        // 编译顶点着色器
        const vs = this.compileShader(vertexShader, gl.VERTEX_SHADER);
        gl.attachShader(program, vs);
        
        // 如果提供了片段着色器，也添加它
        if (options.fragmentShader) {
            const fs = this.compileShader(options.fragmentShader, gl.FRAGMENT_SHADER);
            gl.attachShader(program, fs);
        }
        
        // 指定变换反馈输出变量
        gl.transformFeedbackVaryings(
            program,
            feedbackVaryings,
            options.bufferMode || gl.INTERLEAVED_ATTRIBS
        );
        
        // 链接程序
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Transform feedback program link failed: ${error}`);
        }
        
        const programInfo = {
            program,
            feedbackVaryings,
            bufferMode: options.bufferMode || gl.INTERLEAVED_ATTRIBS
        };
        
        this.programs.set(name, programInfo);
        
        return programInfo;
    }
    
    compileShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation failed: ${error}`);
        }
        
        return shader;
    }
    
    createTransformFeedbackObject(name, programName, inputData, outputBufferSize) {
        const gl = this.gl;
        const programInfo = this.programs.get(programName);
        
        if (!programInfo) {
            throw new Error(`Program '${programName}' not found`);
        }
        
        // 创建变换反馈对象
        const transformFeedback = gl.createTransformFeedback();
        
        // 创建输入缓冲区
        const inputBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, inputBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, inputData, gl.STATIC_DRAW);
        
        // 创建输出缓冲区
        const outputBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, outputBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, outputBufferSize, gl.DYNAMIC_READ);
        
        const feedbackInfo = {
            transformFeedback,
            program: programInfo.program,
            inputBuffer,
            outputBuffer,
            inputData,
            outputBufferSize,
            vertexCount: inputData.length / this.getVertexSize(programInfo)
        };
        
        this.feedbackObjects.set(name, feedbackInfo);
        
        return feedbackInfo;
    }
    
    runTransformFeedback(name, uniforms = {}) {
        const gl = this.gl;
        const feedbackInfo = this.feedbackObjects.get(name);
        
        if (!feedbackInfo) {
            throw new Error(`Transform feedback object '${name}' not found`);
        }
        
        // 使用着色器程序
        gl.useProgram(feedbackInfo.program);
        
        // 设置uniforms
        for (const [uniformName, value] of Object.entries(uniforms)) {
            const location = gl.getUniformLocation(feedbackInfo.program, uniformName);
            if (location !== null) {
                if (Array.isArray(value)) {
                    switch (value.length) {
                        case 1: gl.uniform1f(location, value[0]); break;
                        case 2: gl.uniform2fv(location, value); break;
                        case 3: gl.uniform3fv(location, value); break;
                        case 4: gl.uniform4fv(location, value); break;
                        case 16: gl.uniformMatrix4fv(location, false, value); break;
                    }
                } else {
                    gl.uniform1f(location, value);
                }
            }
        }
        
        // 绑定输入缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, feedbackInfo.inputBuffer);
        
        // 设置顶点属性（假设位置属性在location 0）
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        
        // 绑定变换反馈
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, feedbackInfo.transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, feedbackInfo.outputBuffer);
        
        // 开始变换反馈
        gl.beginTransformFeedback(gl.POINTS);
        
        // 执行绘制
        gl.drawArrays(gl.POINTS, 0, feedbackInfo.vertexCount);
        
        // 结束变换反馈
        gl.endTransformFeedback();
        
        // 解除绑定
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        return feedbackInfo.outputBuffer;
    }
    
    readTransformFeedbackData(name) {
        const gl = this.gl;
        const feedbackInfo = this.feedbackObjects.get(name);
        
        if (!feedbackInfo) {
            throw new Error(`Transform feedback object '${name}' not found`);
        }
        
        // 读取输出缓冲区数据
        gl.bindBuffer(gl.ARRAY_BUFFER, feedbackInfo.outputBuffer);
        
        const outputData = new Float32Array(feedbackInfo.outputBufferSize / 4);
        gl.getBufferSubData(gl.ARRAY_BUFFER, 0, outputData);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        return outputData;
    }
    
    getVertexSize(programInfo) {
        // 简化版本，假设每个顶点3个float
        return 3;
    }
    
    deleteTransformFeedback(name) {
        const feedbackInfo = this.feedbackObjects.get(name);
        if (feedbackInfo) {
            const gl = this.gl;
            gl.deleteTransformFeedback(feedbackInfo.transformFeedback);
            gl.deleteBuffer(feedbackInfo.inputBuffer);
            gl.deleteBuffer(feedbackInfo.outputBuffer);
            this.feedbackObjects.delete(name);
        }
    }
    
    dispose() {
        for (const feedbackInfo of this.feedbackObjects.values()) {
            const gl = this.gl;
            gl.deleteTransformFeedback(feedbackInfo.transformFeedback);
            gl.deleteBuffer(feedbackInfo.inputBuffer);
            gl.deleteBuffer(feedbackInfo.outputBuffer);
        }
        this.feedbackObjects.clear();
        
        for (const programInfo of this.programs.values()) {
            this.gl.deleteProgram(programInfo.program);
        }
        this.programs.clear();
    }
}

// 粒子系统变换反馈示例
class ParticleSystemWithTransformFeedback {
    constructor(gl, particleCount = 10000) {
        this.gl = gl;
        this.particleCount = particleCount;
        
        this.transformFeedbackManager = new TransformFeedbackManager(gl);
        this.setupParticleSystem();
    }
    
    setupParticleSystem() {
        // 创建变换反馈着色器
        const updateVertexShader = `#version 300 es
            precision highp float;
            
            in vec3 a_position;
            in vec3 a_velocity;
            in float a_life;
            
            uniform float u_deltaTime;
            uniform vec3 u_gravity;
            uniform float u_damping;
            uniform float u_maxLife;
            
            out vec3 v_position;
            out vec3 v_velocity;
            out float v_life;
            
            void main() {
                if (a_life <= 0.0) {
                    // 重置粒子
                    v_position = vec3(
                        (fract(sin(gl_VertexID * 12.9898) * 43758.5453) - 0.5) * 10.0,
                        0.0,
                        (fract(sin(gl_VertexID * 78.233) * 43758.5453) - 0.5) * 10.0
                    );
                    v_velocity = vec3(
                        (fract(sin(gl_VertexID * 45.123) * 43758.5453) - 0.5) * 5.0,
                        fract(sin(gl_VertexID * 67.890) * 43758.5453) * 10.0,
                        (fract(sin(gl_VertexID * 23.456) * 43758.5453) - 0.5) * 5.0
                    );
                    v_life = u_maxLife;
                } else {
                    // 更新粒子
                    v_velocity = a_velocity + u_gravity * u_deltaTime;
                    v_velocity *= u_damping;
                    v_position = a_position + v_velocity * u_deltaTime;
                    v_life = a_life - u_deltaTime;
                }
            }
        `;
        
        // 创建变换反馈程序
        this.transformFeedbackManager.createTransformFeedbackProgram(
            'particleUpdate',
            updateVertexShader,
            ['v_position', 'v_velocity', 'v_life'],
            { bufferMode: this.gl.INTERLEAVED_ATTRIBS }
        );
        
        // 初始化粒子数据
        const initialData = new Float32Array(this.particleCount * 7); // position(3) + velocity(3) + life(1)
        
        for (let i = 0; i < this.particleCount; i++) {
            const baseIndex = i * 7;
            
            // 初始位置
            initialData[baseIndex] = (Math.random() - 0.5) * 10;
            initialData[baseIndex + 1] = 0;
            initialData[baseIndex + 2] = (Math.random() - 0.5) * 10;
            
            // 初始速度
            initialData[baseIndex + 3] = (Math.random() - 0.5) * 5;
            initialData[baseIndex + 4] = Math.random() * 10;
            initialData[baseIndex + 5] = (Math.random() - 0.5) * 5;
            
            // 生命周期
            initialData[baseIndex + 6] = Math.random() * 5;
        }
        
        // 创建变换反馈对象
        this.transformFeedbackManager.createTransformFeedbackObject(
            'particles',
            'particleUpdate',
            initialData,
            initialData.byteLength
        );
    }
    
    update(deltaTime) {
        // 运行变换反馈更新
        this.transformFeedbackManager.runTransformFeedback('particles', {
            u_deltaTime: deltaTime,
            u_gravity: [0, -9.8, 0],
            u_damping: 0.98,
            u_maxLife: 5.0
        });
    }
    
    getParticleData() {
        return this.transformFeedbackManager.readTransformFeedbackData('particles');
    }
    
    dispose() {
        this.transformFeedbackManager.dispose();
    }
}
```

## ✅ 学习检查点（第一部分）

完成这部分学习后，您应该能够：

- [ ] 检测和使用WebGL 2.0特性
- [ ] 创建和使用3D纹理
- [ ] 实现纹理数组系统
- [ ] 掌握变换反馈技术
- [ ] 构建基于变换反馈的粒子系统

接下来将继续学习统一缓冲对象、多重渲染目标等高级特性。 