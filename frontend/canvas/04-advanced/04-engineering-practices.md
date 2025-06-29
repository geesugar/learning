# 第15章：Canvas工程化实践

## 🎯 学习目标

完成本章学习后，您将能够：
- **设计Canvas库架构**：构建可扩展的代码结构
- **实施模块化开发**：组织和管理复杂的项目代码
- **建立测试体系**：确保代码质量和稳定性
- **优化构建流程**：提升开发效率和部署质量
- **掌握最佳实践**：遵循行业标准的开发规范

## 🏗️ Canvas库架构设计

### 核心架构模式

```javascript
// 核心库架构
class CanvasEngine {
    constructor(options = {}) {
        this.options = {
            autoResize: true,
            highDPI: true,
            backgroundColor: '#ffffff',
            ...options
        };
        
        // 核心模块
        this.renderer = null;
        this.sceneManager = new SceneManager();
        this.eventManager = new EventManager();
        this.assetManager = new AssetManager();
        this.animationManager = new AnimationManager();
        this.pluginManager = new PluginManager();
        
        // 状态管理
        this.state = {
            initialized: false,
            running: false,
            paused: false
        };
        
        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupEventListeners();
        this.loadPlugins();
        this.state.initialized = true;
        
        this.emit('engine:initialized');
    }

    setupRenderer() {
        this.renderer = new CanvasRenderer(this.options);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.options.autoResize) {
            this.setupAutoResize();
        }
    }

    setupAutoResize() {
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            this.renderer.setSize(width, height);
            this.emit('resize', { width, height });
        });
        
        resizeObserver.observe(this.renderer.canvas.parentElement);
    }

    // 插件系统
    use(plugin, options = {}) {
        return this.pluginManager.register(plugin, options);
    }

    // 场景管理
    createScene(name) {
        return this.sceneManager.createScene(name);
    }

    setActiveScene(name) {
        return this.sceneManager.setActive(name);
    }

    // 渲染循环
    start() {
        if (this.state.running) return;
        
        this.state.running = true;
        this.state.paused = false;
        this.renderLoop();
        
        this.emit('engine:started');
    }

    pause() {
        this.state.paused = true;
        this.emit('engine:paused');
    }

    resume() {
        this.state.paused = false;
        this.renderLoop();
        this.emit('engine:resumed');
    }

    stop() {
        this.state.running = false;
        this.state.paused = false;
        this.emit('engine:stopped');
    }

    renderLoop() {
        if (!this.state.running || this.state.paused) return;
        
        const deltaTime = this.calculateDeltaTime();
        
        // 更新动画
        this.animationManager.update(deltaTime);
        
        // 更新活动场景
        const activeScene = this.sceneManager.getActiveScene();
        if (activeScene) {
            activeScene.update(deltaTime);
        }
        
        // 渲染
        this.render();
        
        requestAnimationFrame(() => this.renderLoop());
    }

    render() {
        this.renderer.clear();
        
        const activeScene = this.sceneManager.getActiveScene();
        if (activeScene) {
            this.renderer.render(activeScene);
        }
        
        this.emit('render');
    }

    calculateDeltaTime() {
        const now = performance.now();
        const deltaTime = now - (this.lastTime || now);
        this.lastTime = now;
        return deltaTime;
    }

    // 事件系统
    on(event, callback) {
        return this.eventManager.on(event, callback);
    }

    off(event, callback) {
        return this.eventManager.off(event, callback);
    }

    emit(event, data) {
        return this.eventManager.emit(event, data);
    }

    // 销毁
    destroy() {
        this.stop();
        this.pluginManager.destroy();
        this.eventManager.destroy();
        this.renderer.destroy();
        
        this.state.initialized = false;
        this.emit('engine:destroyed');
    }
}
```

### 模块系统设计

```javascript
// 模块管理器
class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.dependencies = new Map();
        this.loadedModules = new Set();
    }

    // 注册模块
    register(name, module, dependencies = []) {
        if (this.modules.has(name)) {
            throw new Error(`Module ${name} already registered`);
        }
        
        this.modules.set(name, {
            name,
            module,
            dependencies,
            loaded: false,
            instance: null
        });
        
        this.dependencies.set(name, dependencies);
    }

    // 加载模块
    async load(name) {
        if (this.loadedModules.has(name)) {
            return this.modules.get(name).instance;
        }
        
        const moduleInfo = this.modules.get(name);
        if (!moduleInfo) {
            throw new Error(`Module ${name} not found`);
        }
        
        // 加载依赖
        const dependencies = await this.loadDependencies(name);
        
        // 实例化模块
        const ModuleClass = moduleInfo.module;
        const instance = new ModuleClass(dependencies);
        
        moduleInfo.instance = instance;
        moduleInfo.loaded = true;
        this.loadedModules.add(name);
        
        return instance;
    }

    // 加载依赖
    async loadDependencies(moduleName) {
        const deps = this.dependencies.get(moduleName) || [];
        const loadedDeps = {};
        
        for (const depName of deps) {
            loadedDeps[depName] = await this.load(depName);
        }
        
        return loadedDeps;
    }

    // 获取模块
    get(name) {
        const moduleInfo = this.modules.get(name);
        return moduleInfo ? moduleInfo.instance : null;
    }

    // 卸载模块
    unload(name) {
        const moduleInfo = this.modules.get(name);
        if (moduleInfo && moduleInfo.instance) {
            if (typeof moduleInfo.instance.destroy === 'function') {
                moduleInfo.instance.destroy();
            }
            
            moduleInfo.instance = null;
            moduleInfo.loaded = false;
            this.loadedModules.delete(name);
        }
    }
}

// 模块基类
class BaseModule {
    constructor(dependencies = {}) {
        this.dependencies = dependencies;
        this.initialized = false;
        this.events = new EventTarget();
    }

    // 初始化模块
    async init() {
        if (this.initialized) return;
        
        await this.onInit();
        this.initialized = true;
        this.emit('module:initialized');
    }

    // 子类重写
    async onInit() {
        // 模块初始化逻辑
    }

    // 更新
    update(deltaTime) {
        if (!this.initialized) return;
        this.onUpdate(deltaTime);
    }

    // 子类重写
    onUpdate(deltaTime) {
        // 模块更新逻辑
    }

    // 事件处理
    on(event, callback) {
        this.events.addEventListener(event, callback);
    }

    off(event, callback) {
        this.events.removeEventListener(event, callback);
    }

    emit(event, data) {
        this.events.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    // 销毁
    destroy() {
        this.onDestroy();
        this.initialized = false;
        this.emit('module:destroyed');
    }

    // 子类重写
    onDestroy() {
        // 模块销毁逻辑
    }
}
```

### 插件系统

```javascript
// 插件管理器
class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }

    // 注册插件
    register(plugin, options = {}) {
        const pluginName = plugin.name || plugin.constructor.name;
        
        if (this.plugins.has(pluginName)) {
            throw new Error(`Plugin ${pluginName} already registered`);
        }
        
        const instance = new plugin(options);
        this.plugins.set(pluginName, instance);
        
        // 注册钩子
        if (instance.hooks) {
            this.registerHooks(pluginName, instance.hooks);
        }
        
        // 初始化插件
        if (typeof instance.init === 'function') {
            instance.init();
        }
        
        return instance;
    }

    // 注册钩子
    registerHooks(pluginName, hooks) {
        Object.entries(hooks).forEach(([hookName, callback]) => {
            if (!this.hooks.has(hookName)) {
                this.hooks.set(hookName, []);
            }
            
            this.hooks.get(hookName).push({
                plugin: pluginName,
                callback
            });
        });
    }

    // 执行钩子
    async executeHook(hookName, data) {
        const hooks = this.hooks.get(hookName) || [];
        let result = data;
        
        for (const hook of hooks) {
            try {
                const hookResult = await hook.callback(result);
                if (hookResult !== undefined) {
                    result = hookResult;
                }
            } catch (error) {
                console.error(`Hook ${hookName} in plugin ${hook.plugin} failed:`, error);
            }
        }
        
        return result;
    }

    // 获取插件
    get(name) {
        return this.plugins.get(name);
    }

    // 卸载插件
    unregister(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            // 移除钩子
            this.hooks.forEach((hooks, hookName) => {
                this.hooks.set(hookName, hooks.filter(h => h.plugin !== name));
            });
            
            // 销毁插件
            if (typeof plugin.destroy === 'function') {
                plugin.destroy();
            }
            
            this.plugins.delete(name);
        }
    }

    // 销毁所有插件
    destroy() {
        this.plugins.forEach((plugin, name) => {
            this.unregister(name);
        });
        
        this.plugins.clear();
        this.hooks.clear();
    }
}

// 插件基类
class BasePlugin {
    constructor(options = {}) {
        this.options = options;
        this.name = this.constructor.name;
        this.hooks = {};
    }

    // 初始化插件
    init() {
        this.onInit();
    }

    // 子类重写
    onInit() {
        // 插件初始化逻辑
    }

    // 注册钩子
    registerHook(hookName, callback) {
        this.hooks[hookName] = callback;
    }

    // 销毁插件
    destroy() {
        this.onDestroy();
    }

    // 子类重写
    onDestroy() {
        // 插件销毁逻辑
    }
}
```

## 🧪 测试策略

### 单元测试框架

```javascript
// 测试工具类
class CanvasTestUtils {
    // 创建测试用的Canvas
    static createTestCanvas(width = 800, height = 600) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
        return canvas;
    }

    // 清理测试Canvas
    static cleanupTestCanvas(canvas) {
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }

    // 比较两个Canvas的内容
    static compareCanvasContent(canvas1, canvas2, tolerance = 0) {
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        const imageData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
        const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
        
        if (imageData1.data.length !== imageData2.data.length) {
            return false;
        }
        
        for (let i = 0; i < imageData1.data.length; i++) {
            const diff = Math.abs(imageData1.data[i] - imageData2.data[i]);
            if (diff > tolerance) {
                return false;
            }
        }
        
        return true;
    }

    // 获取Canvas特定区域的像素数据
    static getPixelData(canvas, x, y, width = 1, height = 1) {
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(x, y, width, height);
    }

    // 模拟鼠标事件
    static simulateMouseEvent(canvas, type, x, y, options = {}) {
        const rect = canvas.getBoundingClientRect();
        const event = new MouseEvent(type, {
            clientX: rect.left + x,
            clientY: rect.top + y,
            bubbles: true,
            cancelable: true,
            ...options
        });
        
        canvas.dispatchEvent(event);
        return event;
    }

    // 等待动画完成
    static waitForAnimation(duration = 1000) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    // 截图对比
    static async captureCanvas(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(resolve);
        });
    }
}

// 测试套件示例
describe('Canvas Engine Tests', () => {
    let canvas, engine;
    
    beforeEach(() => {
        canvas = CanvasTestUtils.createTestCanvas();
        engine = new CanvasEngine({ canvas });
    });
    
    afterEach(() => {
        if (engine) {
            engine.destroy();
        }
        CanvasTestUtils.cleanupTestCanvas(canvas);
    });
    
    describe('Initialization', () => {
        test('should initialize engine correctly', () => {
            expect(engine.state.initialized).toBe(true);
            expect(engine.renderer).toBeDefined();
            expect(engine.sceneManager).toBeDefined();
        });
        
        test('should set up canvas with correct dimensions', () => {
            expect(canvas.width).toBe(800);
            expect(canvas.height).toBe(600);
        });
    });
    
    describe('Rendering', () => {
        test('should render empty scene', () => {
            const scene = engine.createScene('test');
            engine.setActiveScene('test');
            engine.render();
            
            const imageData = CanvasTestUtils.getPixelData(canvas, 0, 0, 1, 1);
            expect(imageData.data[3]).toBe(255); // Alpha channel
        });
        
        test('should render basic shapes', () => {
            const scene = engine.createScene('shapes');
            const rect = new Rectangle(100, 100, 50, 50);
            scene.add(rect);
            
            engine.setActiveScene('shapes');
            engine.render();
            
            // 检查矩形区域是否被绘制
            const pixelData = CanvasTestUtils.getPixelData(canvas, 125, 125, 1, 1);
            expect(pixelData.data[3]).toBeGreaterThan(0);
        });
    });
    
    describe('Events', () => {
        test('should handle mouse events', () => {
            const scene = engine.createScene('interactive');
            const rect = new InteractiveRectangle(100, 100, 50, 50);
            scene.add(rect);
            
            engine.setActiveScene('interactive');
            
            let clicked = false;
            rect.on('click', () => { clicked = true; });
            
            CanvasTestUtils.simulateMouseEvent(canvas, 'click', 125, 125);
            
            expect(clicked).toBe(true);
        });
    });
    
    describe('Performance', () => {
        test('should maintain 60fps with 100 objects', async () => {
            const scene = engine.createScene('performance');
            
            // 添加100个对象
            for (let i = 0; i < 100; i++) {
                const rect = new Rectangle(
                    Math.random() * 800,
                    Math.random() * 600,
                    10, 10
                );
                scene.add(rect);
            }
            
            engine.setActiveScene('performance');
            engine.start();
            
            const startTime = performance.now();
            let frameCount = 0;
            
            const countFrames = () => {
                frameCount++;
                if (frameCount < 60) {
                    requestAnimationFrame(countFrames);
                } else {
                    const endTime = performance.now();
                    const fps = 60 / ((endTime - startTime) / 1000);
                    expect(fps).toBeGreaterThan(55); // 允许5fps的误差
                    engine.stop();
                }
            };
            
            requestAnimationFrame(countFrames);
        });
    });
});
```

### 视觉回归测试

```javascript
// 视觉测试框架
class VisualTestFramework {
    constructor(baselineDir = './test/baselines') {
        this.baselineDir = baselineDir;
        this.testResults = [];
    }

    // 创建基准图像
    async createBaseline(testName, canvas) {
        const blob = await CanvasTestUtils.captureCanvas(canvas);
        const buffer = await blob.arrayBuffer();
        
        // 保存基准图像
        await this.saveImage(`${this.baselineDir}/${testName}.png`, buffer);
        
        return buffer;
    }

    // 执行视觉测试
    async runVisualTest(testName, canvas, threshold = 0.1) {
        const currentBlob = await CanvasTestUtils.captureCanvas(canvas);
        const currentBuffer = await currentBlob.arrayBuffer();
        
        try {
            const baselineBuffer = await this.loadImage(`${this.baselineDir}/${testName}.png`);
            const diff = await this.compareImages(baselineBuffer, currentBuffer);
            
            const result = {
                testName,
                passed: diff.percentage < threshold,
                difference: diff.percentage,
                threshold
            };
            
            this.testResults.push(result);
            
            if (!result.passed) {
                // 保存差异图像
                await this.saveImage(`${this.baselineDir}/${testName}_diff.png`, diff.buffer);
                await this.saveImage(`${this.baselineDir}/${testName}_current.png`, currentBuffer);
            }
            
            return result;
        } catch (error) {
            console.warn(`Baseline not found for ${testName}, creating new baseline`);
            await this.createBaseline(testName, canvas);
            return { testName, passed: true, difference: 0, threshold, baseline: true };
        }
    }

    // 比较两个图像
    async compareImages(buffer1, buffer2) {
        // 这里需要实现图像比较算法
        // 可以使用第三方库如pixelmatch
        return {
            percentage: 0,
            buffer: new ArrayBuffer(0)
        };
    }

    // 生成测试报告
    generateReport() {
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        
        const report = {
            summary: {
                total: this.testResults.length,
                passed,
                failed,
                passRate: (passed / this.testResults.length * 100).toFixed(2) + '%'
            },
            details: this.testResults
        };
        
        return report;
    }

    // 保存图像
    async saveImage(path, buffer) {
        // 实现文件保存逻辑
        // 在Node.js环境中使用fs模块
        // 在浏览器环境中使用IndexedDB或下载
    }

    // 加载图像
    async loadImage(path) {
        // 实现文件加载逻辑
        // 返回ArrayBuffer
    }
}
```

## 🔧 构建优化

### Webpack配置

```javascript
// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: {
            main: './src/index.js',
            'canvas-engine': './src/canvas-engine.js'
        },
        
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            library: {
                name: 'CanvasEngine',
                type: 'umd'
            },
            clean: true
        },
        
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-proposal-class-properties']
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'postcss-loader'
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name].[hash][ext]'
                    }
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name].[hash][ext]'
                    }
                }
            ]
        },
        
        plugins: [
            new CleanWebpackPlugin(),
            
            new HtmlWebpackPlugin({
                template: './src/index.html',
                chunks: ['main']
            }),
            
            ...(isProduction ? [
                new MiniCssExtractPlugin({
                    filename: '[name].[contenthash].css'
                })
            ] : []),
            
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(argv.mode),
                'process.env.VERSION': JSON.stringify(process.env.npm_package_version)
            })
        ],
        
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: 10,
                        reuseExistingChunk: true
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        priority: 5,
                        reuseExistingChunk: true
                    }
                }
            },
            
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProduction,
                            drop_debugger: isProduction
                        }
                    }
                })
            ]
        },
        
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            port: 3000,
            hot: true,
            open: true
        },
        
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@components': path.resolve(__dirname, 'src/components')
            }
        }
    };
};
```

### 性能优化配置

```javascript
// 性能监控插件
class PerformancePlugin {
    constructor(options = {}) {
        this.options = {
            bundleAnalyzer: false,
            performanceBudget: {
                maxAssetSize: 250000,
                maxEntrypointSize: 250000
            },
            ...options
        };
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('PerformancePlugin', (compilation, callback) => {
            const stats = compilation.getStats().toJson();
            
            // 分析包大小
            this.analyzeBundleSize(stats);
            
            // 检测性能预算
            this.checkPerformanceBudget(stats);
            
            callback();
        });
    }

    analyzeBundleSize(stats) {
        const assets = stats.assets
            .filter(asset => asset.name.endsWith('.js'))
            .sort((a, b) => b.size - a.size);
        
        console.log('\n📊 Bundle Size Analysis:');
        assets.forEach(asset => {
            const size = (asset.size / 1024).toFixed(2);
            console.log(`  ${asset.name}: ${size} KB`);
        });
    }

    checkPerformanceBudget(stats) {
        const { maxAssetSize, maxEntrypointSize } = this.options.performanceBudget;
        
        // 检查资源大小
        const oversizedAssets = stats.assets.filter(asset => asset.size > maxAssetSize);
        if (oversizedAssets.length > 0) {
            console.warn('\n⚠️  Assets exceeding size budget:');
            oversizedAssets.forEach(asset => {
                const size = (asset.size / 1024).toFixed(2);
                const budget = (maxAssetSize / 1024).toFixed(2);
                console.warn(`  ${asset.name}: ${size} KB (budget: ${budget} KB)`);
            });
        }
        
        // 检查入口点大小
        const oversizedEntrypoints = stats.entrypoints 
            ? Object.entries(stats.entrypoints)
                .filter(([name, entry]) => entry.size > maxEntrypointSize)
            : [];
            
        if (oversizedEntrypoints.length > 0) {
            console.warn('\n⚠️  Entrypoints exceeding size budget:');
            oversizedEntrypoints.forEach(([name, entry]) => {
                const size = (entry.size / 1024).toFixed(2);
                const budget = (maxEntrypointSize / 1024).toFixed(2);
                console.warn(`  ${name}: ${size} KB (budget: ${budget} KB)`);
            });
        }
    }
}
```

## 📋 代码质量管理

### ESLint配置

```javascript
// .eslintrc.js
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    
    extends: [
        'eslint:recommended',
        'prettier'
    ],
    
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    
    rules: {
        // 代码风格
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        
        // 最佳实践
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'error',
        
        // Canvas特定规则
        'canvas/no-direct-mutation': 'error',
        'canvas/prefer-path2d': 'warn',
        'canvas/no-memory-leaks': 'error'
    },
    
    // 自定义规则
    plugins: ['canvas'],
    
    overrides: [
        {
            files: ['**/*.test.js', '**/*.spec.js'],
            rules: {
                'no-console': 'off'
            }
        }
    ]
};
```

### Prettier配置

```javascript
// .prettierrc.js
module.exports = {
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'none',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf'
};
```

## 📖 文档生成

### JSDoc配置

```javascript
// jsdoc.config.js
module.exports = {
    source: {
        include: ['./src'],
        includePattern: '\\.(js|jsx)$',
        exclude: ['./src/**/*.test.js', './src/**/*.spec.js']
    },
    
    opts: {
        destination: './docs/api/',
        recurse: true
    },
    
    plugins: ['plugins/markdown'],
    
    templates: {
        cleverLinks: false,
        monospaceLinks: false
    },
    
    markdown: {
        parser: 'gfm',
        hardwrap: true
    }
};

// 使用示例
/**
 * Canvas渲染器类
 * @class CanvasRenderer
 * @example
 * const renderer = new CanvasRenderer({
 *     canvas: document.getElementById('canvas'),
 *     width: 800,
 *     height: 600
 * });
 */
class CanvasRenderer {
    /**
     * 创建渲染器实例
     * @param {Object} options - 配置选项
     * @param {HTMLCanvasElement} options.canvas - Canvas元素
     * @param {number} options.width - 画布宽度
     * @param {number} options.height - 画布高度
     * @param {boolean} [options.antialias=true] - 是否启用抗锯齿
     */
    constructor(options) {
        // 实现代码
    }

    /**
     * 渲染场景
     * @param {Scene} scene - 要渲染的场景
     * @param {Camera} [camera] - 相机对象
     * @returns {Promise<void>}
     * @throws {Error} 当场景无效时抛出错误
     */
    async render(scene, camera) {
        // 实现代码
    }
}
```

## 🚀 CI/CD流程

### GitHub Actions配置

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run visual tests
      run: npm run test:visual
    
    - name: Upload visual test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: visual-test-results
        path: ./test/visual-results/

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build production bundle
      run: npm run build
    
    - name: Run bundle analysis
      run: npm run analyze
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: ./dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: ./dist/
    
    - name: Deploy to production
      run: |
        # 部署逻辑
        echo "Deploying to production..."
```

## 📊 性能监控

### 运行时性能监控

```javascript
// 性能监控类
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameTime: [],
            memoryUsage: [],
            renderTime: [],
            updateTime: []
        };
        
        this.observers = [];
        this.isMonitoring = false;
    }

    start() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.startFrameTracking();
        this.startMemoryTracking();
    }

    stop() {
        this.isMonitoring = false;
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }

    startFrameTracking() {
        let lastTime = performance.now();
        
        const trackFrame = () => {
            if (!this.isMonitoring) return;
            
            const now = performance.now();
            const frameTime = now - lastTime;
            
            this.recordMetric('frameTime', frameTime);
            lastTime = now;
            
            requestAnimationFrame(trackFrame);
        };
        
        requestAnimationFrame(trackFrame);
    }

    startMemoryTracking() {
        if (!performance.memory) return;
        
        const trackMemory = () => {
            if (!this.isMonitoring) return;
            
            const memory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
            
            this.recordMetric('memoryUsage', memory);
            
            setTimeout(trackMemory, 1000);
        };
        
        trackMemory();
    }

    recordMetric(name, value) {
        const metrics = this.metrics[name];
        metrics.push({
            timestamp: performance.now(),
            value
        });
        
        // 保持最近100个数据点
        if (metrics.length > 100) {
            metrics.shift();
        }
    }

    getMetrics() {
        return {
            fps: this.calculateFPS(),
            avgFrameTime: this.calculateAverage('frameTime'),
            memoryUsage: this.getLatestMetric('memoryUsage'),
            renderTime: this.calculateAverage('renderTime'),
            updateTime: this.calculateAverage('updateTime')
        };
    }

    calculateFPS() {
        const frameTimes = this.metrics.frameTime.slice(-60); // 最近60帧
        if (frameTimes.length === 0) return 0;
        
        const avgFrameTime = frameTimes.reduce((sum, m) => sum + m.value, 0) / frameTimes.length;
        return Math.round(1000 / avgFrameTime);
    }

    calculateAverage(metricName) {
        const metrics = this.metrics[metricName];
        if (metrics.length === 0) return 0;
        
        const sum = metrics.reduce((sum, m) => sum + m.value, 0);
        return sum / metrics.length;
    }

    getLatestMetric(metricName) {
        const metrics = this.metrics[metricName];
        return metrics.length > 0 ? metrics[metrics.length - 1].value : null;
    }

    // 生成性能报告
    generateReport() {
        const metrics = this.getMetrics();
        
        return {
            timestamp: new Date().toISOString(),
            performance: {
                fps: metrics.fps,
                frameTime: {
                    average: metrics.avgFrameTime.toFixed(2) + 'ms',
                    target: '16.67ms (60fps)'
                },
                memory: {
                    used: (metrics.memoryUsage?.used / 1024 / 1024).toFixed(2) + 'MB',
                    total: (metrics.memoryUsage?.total / 1024 / 1024).toFixed(2) + 'MB'
                },
                renderTime: metrics.renderTime.toFixed(2) + 'ms',
                updateTime: metrics.updateTime.toFixed(2) + 'ms'
            },
            recommendations: this.generateRecommendations(metrics)
        };
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.fps < 30) {
            recommendations.push('FPS过低，考虑优化渲染逻辑或减少对象数量');
        }
        
        if (metrics.avgFrameTime > 16.67) {
            recommendations.push('帧时间过长，建议使用时间分片或降低渲染质量');
        }
        
        if (metrics.memoryUsage && metrics.memoryUsage.used > 100 * 1024 * 1024) {
            recommendations.push('内存使用过高，检查是否存在内存泄漏');
        }
        
        return recommendations;
    }
}
```

## 🎯 最佳实践总结

### 代码组织原则

1. **单一职责原则**：每个类和模块只负责一个功能
2. **开闭原则**：对扩展开放，对修改关闭
3. **依赖倒置**：依赖抽象而不是具体实现
4. **接口隔离**：使用小而专的接口
5. **组合优于继承**：优先使用组合而不是继承

### 性能优化策略

1. **对象池模式**：重复使用对象减少GC压力
2. **脏标记**：只重绘发生变化的部分
3. **批量操作**：合并相似的绘制操作
4. **懒加载**：按需加载资源和模块
5. **缓存策略**：合理缓存计算结果

### 测试策略

1. **单元测试**：覆盖核心逻辑和边界情况
2. **集成测试**：测试模块间的协作
3. **视觉测试**：确保渲染结果的一致性
4. **性能测试**：监控关键指标
5. **端到端测试**：模拟真实用户场景

通过本章的学习，您应该掌握了构建专业级Canvas应用的工程化技能，能够设计可维护、可扩展的代码架构，并建立完整的开发流程。

## 📚 扩展阅读

- [JavaScript设计模式](https://addyosmani.com/resources/essentialjsdesignpatterns/book/)
- [前端工程化实践](https://webpack.js.org/guides/)
- [测试驱动开发](https://jestjs.io/docs/getting-started)
- [性能优化指南](https://web.dev/performance/) 