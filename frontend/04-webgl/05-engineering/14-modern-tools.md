# 第14章：现代工具链

现代Web开发离不开优秀的工具链支持。本章将探讨如何将WebGL项目与主流3D框架、构建工具和开发环境集成，构建高效的开发工作流。

## 🎯 学习目标

- 掌握Three.js与原生WebGL的混合开发
- 配置现代构建工具（Webpack、Vite、Rollup）
- 集成调试和性能分析工具
- 建立完整的CI/CD流程
- 学习组件化开发模式

## 📚 章节内容

### 14.1 Three.js框架集成

#### 14.1.1 Three.js与原生WebGL混合渲染

```javascript
// Three.js与原生WebGL混合渲染器
class HybridRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        
        // 初始化Three.js渲染器
        this.threeRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: options.antialias || true,
            alpha: options.alpha || false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
        });
        
        // 获取WebGL上下文
        this.gl = this.threeRenderer.getContext();
        
        // 初始化原生WebGL组件
        this.customRenderer = new CustomWebGLRenderer(this.gl);
        
        // Three.js场景设置
        this.setupThreeScene();
        
        // 渲染状态管理
        this.renderLayers = {
            background: [],
            three: null,
            custom: [],
            ui: []
        };
        
        this.frameCount = 0;
    }
    
    setupThreeScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.canvas.width / this.canvas.height, 
            0.1, 
            1000
        );
        
        // 添加基础光照
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }
    
    addThreeObject(object) {
        this.scene.add(object);
    }
    
    addCustomLayer(layer, priority = 0) {
        this.renderLayers.custom.push({ layer, priority });
        this.renderLayers.custom.sort((a, b) => a.priority - b.priority);
    }
    
    render() {
        const gl = this.gl;
        
        // 1. 渲染背景层
        this.renderBackgroundLayers();
        
        // 2. 渲染Three.js场景
        this.threeRenderer.render(this.scene, this.camera);
        
        // 3. 保存Three.js渲染状态
        this.saveThreeState();
        
        // 4. 渲染自定义WebGL层
        this.renderCustomLayers();
        
        // 5. 渲染UI层
        this.renderUILayers();
        
        // 6. 恢复Three.js状态
        this.restoreThreeState();
        
        this.frameCount++;
    }
    
    renderBackgroundLayers() {
        for (const layer of this.renderLayers.background) {
            layer.render(this.gl, this.camera, this.frameCount);
        }
    }
    
    renderCustomLayers() {
        const gl = this.gl;
        
        for (const { layer } of this.renderLayers.custom) {
            // 应用自定义渲染
            layer.render(gl, this.getSharedUniforms());
        }
    }
    
    renderUILayers() {
        for (const layer of this.renderLayers.ui) {
            layer.render(this.gl, this.camera, this.frameCount);
        }
    }
    
    saveThreeState() {
        this.savedState = {
            viewport: this.gl.getParameter(this.gl.VIEWPORT),
            program: this.gl.getParameter(this.gl.CURRENT_PROGRAM),
            arrayBuffer: this.gl.getParameter(this.gl.ARRAY_BUFFER_BINDING),
            elementArrayBuffer: this.gl.getParameter(this.gl.ELEMENT_ARRAY_BUFFER_BINDING),
            framebuffer: this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING),
            depthTest: this.gl.isEnabled(this.gl.DEPTH_TEST),
            cullFace: this.gl.isEnabled(this.gl.CULL_FACE),
            blend: this.gl.isEnabled(this.gl.BLEND)
        };
    }
    
    restoreThreeState() {
        const gl = this.gl;
        const state = this.savedState;
        
        gl.viewport(state.viewport[0], state.viewport[1], state.viewport[2], state.viewport[3]);
        gl.useProgram(state.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, state.arrayBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.elementArrayBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebuffer);
        
        if (state.depthTest) gl.enable(gl.DEPTH_TEST);
        else gl.disable(gl.DEPTH_TEST);
        
        if (state.cullFace) gl.enable(gl.CULL_FACE);
        else gl.disable(gl.CULL_FACE);
        
        if (state.blend) gl.enable(gl.BLEND);
        else gl.disable(gl.BLEND);
    }
    
    getSharedUniforms() {
        return {
            viewMatrix: this.camera.matrixWorldInverse.elements,
            projectionMatrix: this.camera.projectionMatrix.elements,
            cameraPosition: this.camera.position.toArray(),
            time: this.frameCount * 0.016, // 假设60fps
            resolution: [this.canvas.width, this.canvas.height]
        };
    }
    
    resize(width, height) {
        this.threeRenderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // 通知自定义层调整大小
        for (const { layer } of this.renderLayers.custom) {
            if (layer.resize) {
                layer.resize(width, height);
            }
        }
    }
    
    dispose() {
        this.threeRenderer.dispose();
        this.customRenderer.dispose();
    }
}
```

#### 14.1.2 Three.js材质与原生着色器互操作

```javascript
// Three.js材质包装器
class ThreeToNativeMaterialBridge {
    constructor(threeMaterial) {
        this.threeMaterial = threeMaterial;
        this.nativeUniforms = new Map();
        
        this.extractUniforms();
        this.createNativeShader();
    }
    
    extractUniforms() {
        const material = this.threeMaterial;
        
        // 提取标准uniforms
        if (material.map) {
            this.nativeUniforms.set('u_diffuseMap', material.map);
        }
        
        if (material.normalMap) {
            this.nativeUniforms.set('u_normalMap', material.normalMap);
        }
        
        if (material.roughnessMap) {
            this.nativeUniforms.set('u_roughnessMap', material.roughnessMap);
        }
        
        if (material.metalnessMap) {
            this.nativeUniforms.set('u_metalnessMap', material.metalnessMap);
        }
        
        // 提取材质属性
        this.nativeUniforms.set('u_diffuse', material.color?.toArray() || [1, 1, 1]);
        this.nativeUniforms.set('u_roughness', material.roughness || 0.5);
        this.nativeUniforms.set('u_metalness', material.metalness || 0.0);
        this.nativeUniforms.set('u_opacity', material.opacity || 1.0);
    }
    
    createNativeShader() {
        // 基于Three.js材质生成native WebGL着色器
        this.vertexShader = this.generateVertexShader();
        this.fragmentShader = this.generateFragmentShader();
    }
    
    generateVertexShader() {
        return `
            attribute vec3 a_position;
            attribute vec3 a_normal;
            attribute vec2 a_texCoord;
            
            uniform mat4 u_modelMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform mat3 u_normalMatrix;
            
            varying vec3 v_worldPos;
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            
            void main() {
                vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
                v_worldPos = worldPos.xyz;
                v_normal = u_normalMatrix * a_normal;
                v_texCoord = a_texCoord;
                
                gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
            }
        `;
    }
    
    generateFragmentShader() {
        let shader = `
            precision mediump float;
            
            varying vec3 v_worldPos;
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            
            uniform vec3 u_diffuse;
            uniform float u_roughness;
            uniform float u_metalness;
            uniform float u_opacity;
        `;
        
        // 条件性添加纹理uniforms
        if (this.nativeUniforms.has('u_diffuseMap')) {
            shader += 'uniform sampler2D u_diffuseMap;\n';
        }
        
        if (this.nativeUniforms.has('u_normalMap')) {
            shader += 'uniform sampler2D u_normalMap;\n';
        }
        
        shader += `
            void main() {
                vec3 baseColor = u_diffuse;
        `;
        
        if (this.nativeUniforms.has('u_diffuseMap')) {
            shader += `
                baseColor *= texture2D(u_diffuseMap, v_texCoord).rgb;
            `;
        }
        
        shader += `
                gl_FragColor = vec4(baseColor, u_opacity);
            }
        `;
        
        return shader;
    }
    
    bindToNativeRenderer(gl, program) {
        // 绑定uniforms到native WebGL程序
        for (const [name, value] of this.nativeUniforms) {
            const location = gl.getUniformLocation(program, name);
            if (!location) continue;
            
            if (value instanceof THREE.Texture) {
                // 绑定纹理
                this.bindTexture(gl, location, value);
            } else if (Array.isArray(value)) {
                // 绑定向量/数组
                switch (value.length) {
                    case 3:
                        gl.uniform3fv(location, value);
                        break;
                    case 4:
                        gl.uniform4fv(location, value);
                        break;
                }
            } else {
                // 绑定标量
                gl.uniform1f(location, value);
            }
        }
    }
    
    bindTexture(gl, location, threeTexture, textureUnit = 0) {
        // 将Three.js纹理绑定到WebGL纹理单元
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, threeTexture.image);
        gl.uniform1i(location, textureUnit);
    }
}
```

### 14.2 现代构建工具配置

#### 14.2.1 Vite配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        glsl({
            include: [
                '**/*.glsl',
                '**/*.wgsl',
                '**/*.vert',
                '**/*.frag',
                '**/*.vs',
                '**/*.fs'
            ],
            exclude: ['node_modules/**'],
            warnDuplicatedImports: true,
            defaultExtension: 'glsl',
            compress: false,
            watch: true,
            root: '/'
        })
    ],
    
    // 别名配置
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@shaders': resolve(__dirname, 'src/shaders'),
            '@textures': resolve(__dirname, 'src/assets/textures'),
            '@models': resolve(__dirname, 'src/assets/models'),
            '@utils': resolve(__dirname, 'src/utils')
        }
    },
    
    // 开发服务器配置
    server: {
        port: 3000,
        host: true,
        open: true,
        cors: true,
        hmr: {
            overlay: true
        }
    },
    
    // 构建配置
    build: {
        target: 'es2018',
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'terser',
        sourcemap: true,
        
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                demo: resolve(__dirname, 'demo.html')
            },
            
            output: {
                manualChunks: {
                    'three': ['three'],
                    'utils': ['gl-matrix', 'dat.gui'],
                    'vendor': ['lodash', 'axios']
                }
            },
            
            external: (id) => {
                // 标记外部依赖
                return ['three', 'cannon-es'].includes(id);
            }
        },
        
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    
    // 预处理器配置
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "@/styles/variables.scss";`
            }
        }
    },
    
    // 环境变量
    define: {
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    
    // 优化配置
    optimizeDeps: {
        include: ['three', 'gl-matrix', 'dat.gui'],
        exclude: ['@babylonjs/core']
    }
});
```

#### 14.2.2 Webpack配置

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: {
            main: './src/index.js',
            worker: './src/worker.js'
        },
        
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
            clean: true,
            publicPath: '/'
        },
        
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@shaders': path.resolve(__dirname, 'src/shaders'),
                '@textures': path.resolve(__dirname, 'src/assets/textures'),
                '@models': path.resolve(__dirname, 'src/assets/models')
            },
            extensions: ['.js', '.ts', '.glsl', '.vert', '.frag']
        },
        
        module: {
            rules: [
                // JavaScript/TypeScript
                {
                    test: /\.(js|ts)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: { browsers: ['> 1%', 'last 2 versions'] }
                                }],
                                '@babel/preset-typescript'
                            ],
                            plugins: [
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-transform-runtime'
                            ]
                        }
                    }
                },
                
                // GLSL着色器
                {
                    test: /\.(glsl|vert|frag|vs|fs)$/,
                    use: [
                        {
                            loader: 'raw-loader'
                        },
                        {
                            loader: 'glslify-loader',
                            options: {
                                transform: [
                                    ['glslify-hex', { 'option-1': true }]
                                ]
                            }
                        }
                    ]
                },
                
                // CSS/SCSS
                {
                    test: /\.(css|scss)$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                
                // 纹理和模型文件
                {
                    test: /\.(png|jpg|jpeg|gif|hdr|exr)$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 8 * 1024 // 8KB
                        }
                    },
                    generator: {
                        filename: 'textures/[name].[hash][ext]'
                    }
                },
                
                {
                    test: /\.(gltf|glb|obj|fbx|dae)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'models/[name].[hash][ext]'
                    }
                },
                
                // 音频文件
                {
                    test: /\.(mp3|wav|ogg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'audio/[name].[hash][ext]'
                    }
                }
            ]
        },
        
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                inject: 'body',
                chunks: ['main']
            }),
            
            ...(isProduction ? [
                new MiniCssExtractPlugin({
                    filename: '[name].[contenthash].css'
                }),
                
                ...(process.env.ANALYZE ? [
                    new BundleAnalyzerPlugin({
                        analyzerMode: 'static',
                        openAnalyzer: false
                    })
                ] : [])
            ] : [])
        ],
        
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    },
                    three: {
                        test: /[\\/]node_modules[\\/]three[\\/]/,
                        name: 'three',
                        chunks: 'all'
                    }
                }
            },
            
            minimizer: isProduction ? [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            drop_debugger: true
                        },
                        mangle: {
                            safari10: true
                        }
                    }
                })
            ] : []
        },
        
        devServer: {
            static: path.join(__dirname, 'dist'),
            port: 3000,
            hot: true,
            open: true,
            compress: true,
            historyApiFallback: true
        },
        
        devtool: isProduction ? 'source-map' : 'eval-source-map'
    };
};
```

#### 14.2.3 着色器模块化系统

```javascript
// 着色器模块管理器
class ShaderModuleManager {
    constructor() {
        this.modules = new Map();
        this.compiledShaders = new Map();
        this.dependencies = new Map();
        
        this.setupDefaultModules();
    }
    
    setupDefaultModules() {
        // 通用函数模块
        this.registerModule('common/math', `
            const float PI = 3.14159265359;
            const float TWO_PI = 6.28318530718;
            const float HALF_PI = 1.57079632679;
            
            float saturate(float value) {
                return clamp(value, 0.0, 1.0);
            }
            
            vec3 saturate(vec3 value) {
                return clamp(value, 0.0, 1.0);
            }
            
            float remap(float value, float inMin, float inMax, float outMin, float outMax) {
                return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
            }
        `);
        
        // 噪声函数模块
        this.registerModule('common/noise', `
            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 mod289(vec4 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 permute(vec4 x) {
                return mod289(((x * 34.0) + 1.0) * x);
            }
            
            vec4 taylorInvSqrt(vec4 r) {
                return 1.79284291400159 - 0.85373472095314 * r;
            }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                
                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                
                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                
                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                
                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
        `);
        
        // 光照模块
        this.registerModule('lighting/pbr', `
            vec3 fresnelSchlick(float cosTheta, vec3 F0) {
                return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
            }
            
            float distributionGGX(vec3 N, vec3 H, float roughness) {
                float a = roughness * roughness;
                float a2 = a * a;
                float NdotH = max(dot(N, H), 0.0);
                float NdotH2 = NdotH * NdotH;
                
                float num = a2;
                float denom = (NdotH2 * (a2 - 1.0) + 1.0);
                denom = PI * denom * denom;
                
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
        `);
    }
    
    registerModule(name, source) {
        this.modules.set(name, {
            source,
            dependencies: this.extractDependencies(source)
        });
    }
    
    extractDependencies(source) {
        const deps = [];
        const includeRegex = /#include\s+["']([^"']+)["']/g;
        let match;
        
        while ((match = includeRegex.exec(source)) !== null) {
            deps.push(match[1]);
        }
        
        return deps;
    }
    
    compileShader(mainSource, includes = []) {
        const resolved = this.resolveIncludes(mainSource, includes);
        return this.processDirectives(resolved);
    }
    
    resolveIncludes(source, additionalIncludes = []) {
        const allIncludes = new Set(additionalIncludes);
        const resolved = new Set();
        let result = source;
        
        // 递归解析includes
        const processIncludes = (src) => {
            const includeRegex = /#include\s+["']([^"']+)["']/g;
            let match;
            
            while ((match = includeRegex.exec(src)) !== null) {
                const moduleName = match[1];
                allIncludes.add(moduleName);
            }
        };
        
        processIncludes(source);
        
        // 解析依赖图
        const dependencyOrder = this.resolveDependencyOrder(Array.from(allIncludes));
        
        // 注入模块代码
        let moduleCode = '';
        for (const moduleName of dependencyOrder) {
            if (!resolved.has(moduleName)) {
                const module = this.modules.get(moduleName);
                if (module) {
                    moduleCode += `// Module: ${moduleName}\n${module.source}\n\n`;
                    resolved.add(moduleName);
                }
            }
        }
        
        // 替换include指令
        result = result.replace(/#include\s+["']([^"']+)["']/g, '');
        
        // 在顶部插入模块代码
        const versionMatch = result.match(/(#version\s+\d+.*?\n)/);
        if (versionMatch) {
            result = versionMatch[1] + '\n' + moduleCode + result.substring(versionMatch[1].length);
        } else {
            result = moduleCode + result;
        }
        
        return result;
    }
    
    resolveDependencyOrder(moduleNames) {
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        
        const visit = (moduleName) => {
            if (visited.has(moduleName)) return;
            if (visiting.has(moduleName)) {
                throw new Error(`Circular dependency detected: ${moduleName}`);
            }
            
            visiting.add(moduleName);
            
            const module = this.modules.get(moduleName);
            if (module) {
                for (const dep of module.dependencies) {
                    visit(dep);
                }
            }
            
            visiting.delete(moduleName);
            visited.add(moduleName);
            result.push(moduleName);
        };
        
        for (const moduleName of moduleNames) {
            visit(moduleName);
        }
        
        return result;
    }
    
    processDirectives(source) {
        // 处理预处理器指令
        return source.replace(/#define\s+(\w+)\s+(.*)/g, (match, name, value) => {
            return `#define ${name} ${value}`;
        });
    }
}
```

### 14.3 调试工具集成

#### 14.3.1 WebGL调试扩展

```javascript
// WebGL调试包装器
class WebGLDebugContext {
    constructor(gl, options = {}) {
        this.gl = gl;
        this.options = {
            validateShaders: true,
            trackResources: true,
            checkErrors: true,
            logCalls: options.logCalls || false,
            breakOnError: options.breakOnError || false
        };
        
        this.resources = {
            textures: new Set(),
            buffers: new Set(),
            framebuffers: new Set(),
            programs: new Set(),
            shaders: new Set()
        };
        
        this.stats = {
            drawCalls: 0,
            stateChanges: 0,
            errors: []
        };
        
        this.wrapContext();
        this.setupErrorHandling();
    }
    
    wrapContext() {
        const originalMethods = {};
        
        // 包装所有WebGL方法
        for (const method of Object.getOwnPropertyNames(WebGLRenderingContext.prototype)) {
            if (typeof this.gl[method] === 'function') {
                originalMethods[method] = this.gl[method];
                this.gl[method] = this.wrapMethod(method, originalMethods[method]);
            }
        }
        
        this.originalMethods = originalMethods;
    }
    
    wrapMethod(methodName, originalMethod) {
        return (...args) => {
            // 记录调用
            if (this.options.logCalls) {
                console.log(`WebGL: ${methodName}(${args.join(', ')})`);
            }
            
            // 验证参数
            this.validateMethodCall(methodName, args);
            
            // 执行原始方法
            const result = originalMethod.apply(this.gl, args);
            
            // 检查错误
            if (this.options.checkErrors) {
                this.checkForErrors(methodName);
            }
            
            // 跟踪资源
            if (this.options.trackResources) {
                this.trackResourceUsage(methodName, args, result);
            }
            
            // 更新统计
            this.updateStats(methodName);
            
            return result;
        };
    }
    
    validateMethodCall(methodName, args) {
        switch (methodName) {
            case 'drawElements':
                if (args[1] < 0) {
                    this.reportError(`Invalid count in drawElements: ${args[1]}`);
                }
                break;
                
            case 'uniformMatrix4fv':
                if (args[2] && args[2].length !== 16) {
                    this.reportError(`Invalid matrix size for uniformMatrix4fv: ${args[2].length}`);
                }
                break;
                
            case 'vertexAttribPointer':
                if (args[1] < 1 || args[1] > 4) {
                    this.reportError(`Invalid size for vertexAttribPointer: ${args[1]}`);
                }
                break;
        }
    }
    
    checkForErrors(methodName) {
        const error = this.gl.getError();
        if (error !== this.gl.NO_ERROR) {
            const errorMessage = this.getErrorString(error);
            const errorInfo = {
                method: methodName,
                error: errorMessage,
                timestamp: Date.now(),
                stack: new Error().stack
            };
            
            this.stats.errors.push(errorInfo);
            
            if (this.options.breakOnError) {
                debugger; // eslint-disable-line no-debugger
            }
            
            console.error(`WebGL Error after ${methodName}: ${errorMessage}`);
        }
    }
    
    getErrorString(error) {
        const gl = this.gl;
        switch (error) {
            case gl.INVALID_ENUM: return 'INVALID_ENUM';
            case gl.INVALID_VALUE: return 'INVALID_VALUE';
            case gl.INVALID_OPERATION: return 'INVALID_OPERATION';
            case gl.OUT_OF_MEMORY: return 'OUT_OF_MEMORY';
            case gl.CONTEXT_LOST_WEBGL: return 'CONTEXT_LOST_WEBGL';
            default: return `Unknown error: ${error}`;
        }
    }
    
    trackResourceUsage(methodName, args, result) {
        switch (methodName) {
            case 'createTexture':
                this.resources.textures.add(result);
                break;
            case 'createBuffer':
                this.resources.buffers.add(result);
                break;
            case 'createFramebuffer':
                this.resources.framebuffers.add(result);
                break;
            case 'createProgram':
                this.resources.programs.add(result);
                break;
            case 'createShader':
                this.resources.shaders.add(result);
                break;
            
            case 'deleteTexture':
                this.resources.textures.delete(args[0]);
                break;
            case 'deleteBuffer':
                this.resources.buffers.delete(args[0]);
                break;
            case 'deleteFramebuffer':
                this.resources.framebuffers.delete(args[0]);
                break;
            case 'deleteProgram':
                this.resources.programs.delete(args[0]);
                break;
            case 'deleteShader':
                this.resources.shaders.delete(args[0]);
                break;
        }
    }
    
    updateStats(methodName) {
        if (methodName.startsWith('draw')) {
            this.stats.drawCalls++;
        }
        
        if (['useProgram', 'bindTexture', 'bindBuffer', 'bindFramebuffer'].includes(methodName)) {
            this.stats.stateChanges++;
        }
    }
    
    setupErrorHandling() {
        // 上下文丢失处理
        this.gl.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('WebGL context lost!');
            this.reportError('WebGL context lost');
        });
        
        this.gl.canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
        });
    }
    
    reportError(message) {
        const error = {
            message,
            timestamp: Date.now(),
            stack: new Error().stack
        };
        
        this.stats.errors.push(error);
        console.error('WebGL Debug Error:', message);
    }
    
    getResourceReport() {
        return {
            textures: this.resources.textures.size,
            buffers: this.resources.buffers.size,
            framebuffers: this.resources.framebuffers.size,
            programs: this.resources.programs.size,
            shaders: this.resources.shaders.size
        };
    }
    
    getPerformanceReport() {
        return {
            drawCalls: this.stats.drawCalls,
            stateChanges: this.stats.stateChanges,
            errors: this.stats.errors.length,
            recentErrors: this.stats.errors.slice(-10)
        };
    }
    
    reset() {
        this.stats.drawCalls = 0;
        this.stats.stateChanges = 0;
        this.stats.errors = [];
    }
}

// 着色器验证器
class ShaderValidator {
    constructor(gl) {
        this.gl = gl;
    }
    
    validateShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        
        if (!success) {
            const log = this.gl.getShaderInfoLog(shader);
            const error = this.parseShaderError(log, source);
            this.gl.deleteShader(shader);
            return { success: false, error };
        }
        
        this.gl.deleteShader(shader);
        return { success: true };
    }
    
    parseShaderError(log, source) {
        const lines = source.split('\n');
        const errorRegex = /ERROR: \d+:(\d+): (.+)/g;
        const errors = [];
        
        let match;
        while ((match = errorRegex.exec(log)) !== null) {
            const lineNumber = parseInt(match[1], 10);
            const message = match[2];
            const line = lines[lineNumber - 1] || '';
            
            errors.push({
                line: lineNumber,
                message,
                code: line.trim(),
                context: this.getErrorContext(lines, lineNumber - 1)
            });
        }
        
        return {
            fullLog: log,
            parsedErrors: errors
        };
    }
    
    getErrorContext(lines, errorLineIndex, contextSize = 2) {
        const start = Math.max(0, errorLineIndex - contextSize);
        const end = Math.min(lines.length, errorLineIndex + contextSize + 1);
        
        return lines.slice(start, end).map((line, index) => ({
            number: start + index + 1,
            code: line,
            isError: start + index === errorLineIndex
        }));
    }
}
```

#### 14.3.2 可视化调试工具

```javascript
// WebGL状态可视化工具
class WebGLStateVisualizer {
    constructor(gl) {
        this.gl = gl;
        this.createUI();
        this.setupUpdateLoop();
    }
    
    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'webgl-state-visualizer';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 4px;
            z-index: 10000;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        document.body.appendChild(this.container);
        
        this.sections = {
            general: this.createSection('General State'),
            buffers: this.createSection('Buffer Bindings'),
            textures: this.createSection('Texture Bindings'),
            framebuffer: this.createSection('Framebuffer'),
            program: this.createSection('Shader Program'),
            viewport: this.createSection('Viewport')
        };
    }
    
    createSection(title) {
        const section = document.createElement('div');
        section.innerHTML = `<h4 style="margin: 10px 0 5px 0; color: #4CAF50;">${title}</h4>`;
        this.container.appendChild(section);
        
        const content = document.createElement('div');
        content.style.marginBottom = '10px';
        section.appendChild(content);
        
        return content;
    }
    
    updateState() {
        const gl = this.gl;
        
        // 更新通用状态
        this.updateGeneralState();
        
        // 更新缓冲区绑定
        this.updateBufferBindings();
        
        // 更新纹理绑定
        this.updateTextureBindings();
        
        // 更新帧缓冲状态
        this.updateFramebufferState();
        
        // 更新着色器程序
        this.updateProgramState();
        
        // 更新视口
        this.updateViewportState();
    }
    
    updateGeneralState() {
        const gl = this.gl;
        
        const states = [
            ['Depth Test', gl.isEnabled(gl.DEPTH_TEST)],
            ['Depth Func', this.getEnumName(gl.getParameter(gl.DEPTH_FUNC))],
            ['Depth Mask', gl.getParameter(gl.DEPTH_WRITEMASK)],
            ['Cull Face', gl.isEnabled(gl.CULL_FACE)],
            ['Cull Face Mode', this.getEnumName(gl.getParameter(gl.CULL_FACE_MODE))],
            ['Front Face', this.getEnumName(gl.getParameter(gl.FRONT_FACE))],
            ['Blend', gl.isEnabled(gl.BLEND)],
            ['Blend Func', this.getBlendFuncString()],
            ['Scissor Test', gl.isEnabled(gl.SCISSOR_TEST)]
        ];
        
        this.sections.general.innerHTML = states.map(([name, value]) => 
            `<div>${name}: <span style="color: ${value === true ? '#4CAF50' : value === false ? '#f44336' : '#2196F3'}">${value}</span></div>`
        ).join('');
    }
    
    updateBufferBindings() {
        const gl = this.gl;
        
        const buffers = [
            ['Array Buffer', gl.getParameter(gl.ARRAY_BUFFER_BINDING)],
            ['Element Array Buffer', gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)]
        ];
        
        this.sections.buffers.innerHTML = buffers.map(([name, buffer]) => 
            `<div>${name}: ${buffer ? this.getResourceId(buffer) : 'null'}</div>`
        ).join('');
    }
    
    updateTextureBindings() {
        const gl = this.gl;
        const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE) - gl.TEXTURE0;
        
        let html = `<div>Active Texture Unit: ${activeTexture}</div>`;
        
        // 显示前8个纹理单元的绑定
        for (let i = 0; i < 8; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            const texture2D = gl.getParameter(gl.TEXTURE_BINDING_2D);
            const textureCube = gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
            
            if (texture2D || textureCube) {
                html += `<div>Unit ${i}: `;
                if (texture2D) html += `2D=${this.getResourceId(texture2D)} `;
                if (textureCube) html += `Cube=${this.getResourceId(textureCube)} `;
                html += '</div>';
            }
        }
        
        // 恢复原始活动纹理单元
        gl.activeTexture(gl.TEXTURE0 + activeTexture);
        
        this.sections.textures.innerHTML = html;
    }
    
    updateFramebufferState() {
        const gl = this.gl;
        
        const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        const renderbuffer = gl.getParameter(gl.RENDERBUFFER_BINDING);
        
        this.sections.framebuffer.innerHTML = `
            <div>Framebuffer: ${framebuffer ? this.getResourceId(framebuffer) : 'null (default)'}</div>
            <div>Renderbuffer: ${renderbuffer ? this.getResourceId(renderbuffer) : 'null'}</div>
        `;
    }
    
    updateProgramState() {
        const gl = this.gl;
        const program = gl.getParameter(gl.CURRENT_PROGRAM);
        
        if (program) {
            const activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            
            this.sections.program.innerHTML = `
                <div>Program: ${this.getResourceId(program)}</div>
                <div>Active Attributes: ${activeAttributes}</div>
                <div>Active Uniforms: ${activeUniforms}</div>
            `;
        } else {
            this.sections.program.innerHTML = '<div>Program: null</div>';
        }
    }
    
    updateViewportState() {
        const gl = this.gl;
        const viewport = gl.getParameter(gl.VIEWPORT);
        const scissorBox = gl.getParameter(gl.SCISSOR_BOX);
        
        this.sections.viewport.innerHTML = `
            <div>Viewport: [${viewport.join(', ')}]</div>
            <div>Scissor Box: [${scissorBox.join(', ')}]</div>
        `;
    }
    
    getEnumName(value) {
        const enumMap = {
            [this.gl.NEVER]: 'NEVER',
            [this.gl.LESS]: 'LESS',
            [this.gl.EQUAL]: 'EQUAL',
            [this.gl.LEQUAL]: 'LEQUAL',
            [this.gl.GREATER]: 'GREATER',
            [this.gl.NOTEQUAL]: 'NOTEQUAL',
            [this.gl.GEQUAL]: 'GEQUAL',
            [this.gl.ALWAYS]: 'ALWAYS',
            [this.gl.FRONT]: 'FRONT',
            [this.gl.BACK]: 'BACK',
            [this.gl.FRONT_AND_BACK]: 'FRONT_AND_BACK',
            [this.gl.CW]: 'CW',
            [this.gl.CCW]: 'CCW'
        };
        
        return enumMap[value] || value.toString();
    }
    
    getBlendFuncString() {
        const gl = this.gl;
        const srcRGB = this.getEnumName(gl.getParameter(gl.BLEND_SRC_RGB));
        const dstRGB = this.getEnumName(gl.getParameter(gl.BLEND_DST_RGB));
        const srcAlpha = this.getEnumName(gl.getParameter(gl.BLEND_SRC_ALPHA));
        const dstAlpha = this.getEnumName(gl.getParameter(gl.BLEND_DST_ALPHA));
        
        if (srcRGB === srcAlpha && dstRGB === dstAlpha) {
            return `(${srcRGB}, ${dstRGB})`;
        } else {
            return `RGB(${srcRGB}, ${dstRGB}) Alpha(${srcAlpha}, ${dstAlpha})`;
        }
    }
    
    getResourceId(resource) {
        if (!resource) return 'null';
        if (!resource._debugId) {
            resource._debugId = Math.random().toString(36).substring(2, 8);
        }
        return resource._debugId;
    }
    
    setupUpdateLoop() {
        let updating = false;
        
        const update = () => {
            if (!updating) {
                updating = true;
                requestAnimationFrame(() => {
                    this.updateState();
                    updating = false;
                });
            }
        };
        
        // 定期更新
        setInterval(update, 100);
        
        // 立即更新
        update();
    }
    
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
```

### 14.4 CI/CD配置

#### 14.4.1 GitHub Actions配置

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy WebGL Project

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  CACHE_VERSION: v1

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ env.CACHE_VERSION }}-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-${{ env.CACHE_VERSION }}-
          
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm run test
      
    - name: Run WebGL tests with headless browser
      run: npm run test:webgl
      
    - name: Upload test coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        
  build:
    needs: test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        target: [development, production]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build:${{ matrix.target }}
      env:
        CI: true
        
    - name: Run bundle analysis
      if: matrix.target == 'production'
      run: npm run analyze
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-${{ matrix.target }}
        path: dist/
        retention-days: 7
        
    - name: Lighthouse performance test
      if: matrix.target == 'production'
      uses: treosh/lighthouse-ci-action@v9
      with:
        configPath: './lighthouse.config.js'
        uploadArtifacts: true
        
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    environment:
      name: staging
      url: https://staging.your-webgl-app.com
      
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-production
        path: dist/
        
    - name: Deploy to staging
      run: |
        # 部署到staging环境
        aws s3 sync dist/ s3://your-staging-bucket --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.STAGING_CLOUDFRONT_ID }} --paths "/*"
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: us-east-1
        
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://your-webgl-app.com
      
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-production
        path: dist/
        
    - name: Deploy to production
      run: |
        # 部署到生产环境
        aws s3 sync dist/ s3://your-production-bucket --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.PRODUCTION_CLOUDFRONT_ID }} --paths "/*"
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: us-east-1
        
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        text: 'WebGL app deployed to production'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

#### 14.4.2 性能监控配置

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run serve:dist',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        preset: 'desktop'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

// package.json scripts
{
  "scripts": {
    "test:webgl": "jest --config=jest.webgl.config.js",
    "test:e2e": "cypress run",
    "build:development": "vite build --mode development",
    "build:production": "vite build --mode production",
    "analyze": "vite-bundle-analyzer dist/stats.json",
    "serve:dist": "vite preview --port 3000",
    "lighthouse": "lhci autorun"
  }
}
```

### 14.5 组件化开发

#### 14.5.1 WebGL组件系统

```javascript
// WebGL组件基类
class WebGLComponent {
    constructor(name, options = {}) {
        this.name = name;
        this.enabled = true;
        this.dependencies = options.dependencies || [];
        this.properties = new Map();
        this.events = new Map();
        
        this.init(options);
    }
    
    init(options) {
        // 子类实现
    }
    
    setProperty(name, value) {
        const oldValue = this.properties.get(name);
        this.properties.set(name, value);
        
        this.onPropertyChanged(name, value, oldValue);
        this.emit('propertyChanged', { name, value, oldValue });
    }
    
    getProperty(name, defaultValue = null) {
        return this.properties.has(name) ? this.properties.get(name) : defaultValue;
    }
    
    onPropertyChanged(name, value, oldValue) {
        // 子类可以重写
    }
    
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }
    
    off(eventName, callback) {
        if (this.events.has(eventName)) {
            const callbacks = this.events.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(eventName, data) {
        if (this.events.has(eventName)) {
            for (const callback of this.events.get(eventName)) {
                callback(data);
            }
        }
    }
    
    update(deltaTime) {
        if (this.enabled) {
            this.onUpdate(deltaTime);
        }
    }
    
    render(gl, camera, scene) {
        if (this.enabled) {
            this.onRender(gl, camera, scene);
        }
    }
    
    onUpdate(deltaTime) {
        // 子类实现
    }
    
    onRender(gl, camera, scene) {
        // 子类实现
    }
    
    dispose() {
        this.onDispose();
        this.events.clear();
        this.properties.clear();
    }
    
    onDispose() {
        // 子类实现资源清理
    }
}

// 组件管理器
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.componentTypes = new Map();
        this.updateOrder = [];
        this.renderOrder = [];
    }
    
    registerComponentType(name, componentClass) {
        this.componentTypes.set(name, componentClass);
    }
    
    createComponent(typeName, name, options = {}) {
        const ComponentClass = this.componentTypes.get(typeName);
        if (!ComponentClass) {
            throw new Error(`Component type '${typeName}' not registered`);
        }
        
        const component = new ComponentClass(name, options);
        this.components.set(name, component);
        
        this.updateComponentOrder();
        
        return component;
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    removeComponent(name) {
        const component = this.components.get(name);
        if (component) {
            component.dispose();
            this.components.delete(name);
            this.updateComponentOrder();
        }
    }
    
    updateComponentOrder() {
        // 基于依赖关系排序组件
        const components = Array.from(this.components.values());
        
        const sorted = this.topologicalSort(components);
        this.updateOrder = sorted;
        this.renderOrder = sorted.slice(); // 渲染顺序可能不同
    }
    
    topologicalSort(components) {
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        
        const visit = (component) => {
            if (visited.has(component)) return;
            if (visiting.has(component)) {
                throw new Error(`Circular dependency detected for component: ${component.name}`);
            }
            
            visiting.add(component);
            
            for (const depName of component.dependencies) {
                const dependency = this.components.get(depName);
                if (dependency) {
                    visit(dependency);
                }
            }
            
            visiting.delete(component);
            visited.add(component);
            result.push(component);
        };
        
        for (const component of components) {
            visit(component);
        }
        
        return result;
    }
    
    update(deltaTime) {
        for (const component of this.updateOrder) {
            component.update(deltaTime);
        }
    }
    
    render(gl, camera, scene) {
        for (const component of this.renderOrder) {
            component.render(gl, camera, scene);
        }
    }
    
    dispose() {
        for (const component of this.components.values()) {
            component.dispose();
        }
        this.components.clear();
    }
}

// 示例：粒子系统组件
class ParticleSystemComponent extends WebGLComponent {
    init(options) {
        this.particleCount = options.particleCount || 1000;
        this.emissionRate = options.emissionRate || 100;
        this.lifetime = options.lifetime || 5.0;
        
        this.particles = [];
        this.activeParticles = 0;
        this.time = 0;
        
        this.initializeParticles();
        this.createBuffers();
    }
    
    initializeParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                position: [0, 0, 0],
                velocity: [0, 0, 0],
                life: 0,
                maxLife: this.lifetime,
                size: 1.0,
                color: [1, 1, 1, 1]
            });
        }
    }
    
    createBuffers() {
        // 创建粒子缓冲区
        this.positionBuffer = new Float32Array(this.particleCount * 3);
        this.colorBuffer = new Float32Array(this.particleCount * 4);
        this.sizeBuffer = new Float32Array(this.particleCount);
    }
    
    onUpdate(deltaTime) {
        this.time += deltaTime;
        
        // 发射新粒子
        this.emitParticles(deltaTime);
        
        // 更新现有粒子
        this.updateParticles(deltaTime);
        
        // 更新缓冲区
        this.updateBuffers();
    }
    
    emitParticles(deltaTime) {
        const particlesToEmit = this.emissionRate * deltaTime;
        
        for (let i = 0; i < particlesToEmit && this.activeParticles < this.particleCount; i++) {
            const particle = this.particles[this.activeParticles];
            this.resetParticle(particle);
            this.activeParticles++;
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = 0; i < this.activeParticles; i++) {
            const particle = this.particles[i];
            
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                // 移除死亡粒子
                this.particles[i] = this.particles[this.activeParticles - 1];
                this.particles[this.activeParticles - 1] = particle;
                this.activeParticles--;
                i--;
                continue;
            }
            
            // 更新位置
            particle.position[0] += particle.velocity[0] * deltaTime;
            particle.position[1] += particle.velocity[1] * deltaTime;
            particle.position[2] += particle.velocity[2] * deltaTime;
            
            // 应用重力
            particle.velocity[1] -= 9.8 * deltaTime;
            
            // 更新透明度
            const alpha = particle.life / particle.maxLife;
            particle.color[3] = alpha;
        }
    }
    
    resetParticle(particle) {
        particle.position[0] = (Math.random() - 0.5) * 2.0;
        particle.position[1] = 0;
        particle.position[2] = (Math.random() - 0.5) * 2.0;
        
        particle.velocity[0] = (Math.random() - 0.5) * 10.0;
        particle.velocity[1] = Math.random() * 15.0;
        particle.velocity[2] = (Math.random() - 0.5) * 10.0;
        
        particle.life = particle.maxLife;
        particle.size = 0.5 + Math.random() * 0.5;
        
        particle.color[0] = 1.0;
        particle.color[1] = 0.5 + Math.random() * 0.5;
        particle.color[2] = 0.0;
        particle.color[3] = 1.0;
    }
    
    updateBuffers() {
        for (let i = 0; i < this.activeParticles; i++) {
            const particle = this.particles[i];
            
            this.positionBuffer[i * 3] = particle.position[0];
            this.positionBuffer[i * 3 + 1] = particle.position[1];
            this.positionBuffer[i * 3 + 2] = particle.position[2];
            
            this.colorBuffer[i * 4] = particle.color[0];
            this.colorBuffer[i * 4 + 1] = particle.color[1];
            this.colorBuffer[i * 4 + 2] = particle.color[2];
            this.colorBuffer[i * 4 + 3] = particle.color[3];
            
            this.sizeBuffer[i] = particle.size;
        }
    }
    
    onRender(gl, camera, scene) {
        if (this.activeParticles === 0) return;
        
        // 渲染粒子系统
        // 这里需要具体的WebGL渲染代码
    }
}
```

## ✅ 学习检查点

完成本章学习后，您应该能够：

- [ ] 集成Three.js与原生WebGL开发
- [ ] 配置现代构建工具（Vite/Webpack）
- [ ] 实现着色器模块化系统
- [ ] 集成调试和性能分析工具
- [ ] 设置完整的CI/CD流程
- [ ] 实现组件化开发模式
- [ ] 建立高效的开发工作流

## 🚀 下一步

完成现代工具链学习后，接下来学习[第15章：WebGL 2.0](15-webgl2.md)，了解WebGL 2.0的新特性和高级功能。

现代工具链是高效开发的基础，建议您根据项目需求选择合适的工具组合，并持续优化开发流程。 