# WebGL 学习示例

## 📁 示例目录结构

本目录包含了从基础到高级的 WebGL 学习示例。每个示例都包含完整的代码和详细的注释，帮助您理解 WebGL 的各个概念。

```
examples/
├── README.md                    # 本文档
├── setup/                       # 环境搭建示例
│   ├── webgl-detection.html     # WebGL 支持检测
│   └── basic-setup.html         # 基础环境搭建
├── 01-foundations/              # 基础概念示例
│   ├── first-triangle/          # 第一个三角形
│   ├── colored-cube/            # 彩色立方体
│   └── webgl-context/           # WebGL 上下文管理
├── 02-core-concepts/            # 核心概念示例
│   ├── shader-basics/           # 着色器基础
│   ├── buffer-management/       # 缓冲区管理
│   └── transformations/         # 变换矩阵
├── 03-graphics/                 # 图形渲染示例
│   ├── lighting-models/         # 光照模型
│   ├── texture-mapping/         # 纹理贴图
│   └── materials/               # 材质系统
├── 04-advanced/                 # 高级技术示例
│   ├── post-processing/         # 后处理效果
│   ├── instancing/              # 实例化渲染
│   └── compute-shaders/         # 计算着色器
├── 05-projects/                 # 完整项目示例
│   ├── model-viewer/            # 3D 模型查看器
│   ├── particle-system/         # 粒子系统
│   └── mini-engine/             # 迷你引擎
└── common/                      # 公共资源
    ├── utils.js                 # 工具函数
    ├── math.js                  # 数学库
    └── assets/                  # 资源文件
```

## 🎯 使用指南

### 学习路径建议

1. **从基础开始**：从 `01-foundations/` 开始学习
2. **逐步深入**：按照数字顺序学习各个阶段
3. **实践为主**：每个示例都要亲自运行和修改
4. **理解原理**：不要只是复制代码，要理解每行代码的作用

### 运行示例

#### 方法一：使用 Live Server（推荐）
1. 安装 VS Code 和 Live Server 插件
2. 右键点击 HTML 文件
3. 选择 "Open with Live Server"

#### 方法二：使用 Python 简单服务器
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 方法三：使用 Node.js 服务器
```bash
npm install -g http-server
http-server
```

## 📚 示例详解

### 基础概念阶段（01-foundations）

#### 第一个三角形
**文件**：`01-foundations/first-triangle/index.html`
**目标**：理解 WebGL 的基本渲染流程
**重点**：
- WebGL 上下文创建
- 着色器编译和链接
- 顶点缓冲区使用
- 基本绘制调用

#### 彩色立方体
**文件**：`01-foundations/colored-cube/index.html`
**目标**：学习 3D 渲染基础
**重点**：
- 3D 坐标系统
- 深度测试
- 矩阵变换
- 索引缓冲区

### 核心概念阶段（02-core-concepts）

#### 着色器基础
**文件**：`02-core-concepts/shader-basics/index.html`
**目标**：深入理解着色器编程
**重点**：
- GLSL 语言基础
- 顶点着色器详解
- 片段着色器详解
- 着色器间的数据传递

#### 缓冲区管理
**文件**：`02-core-concepts/buffer-management/index.html`
**目标**：掌握 WebGL 缓冲区系统
**重点**：
- 顶点缓冲区对象（VBO）
- 索引缓冲区对象（IBO）
- 顶点数组对象（VAO）
- 缓冲区更新和管理

### 图形渲染阶段（03-graphics）

#### 光照模型
**文件**：`03-graphics/lighting-models/index.html`
**目标**：学习光照计算
**重点**：
- 环境光、漫反射、镜面反射
- Phong 光照模型
- 多光源处理
- 法线变换

#### 纹理贴图
**文件**：`03-graphics/texture-mapping/index.html`
**目标**：掌握纹理系统
**重点**：
- 纹理坐标
- 纹理采样
- 纹理过滤
- 多重纹理

## 🔧 公共工具

### utils.js
包含常用的 WebGL 工具函数：
- 着色器创建和编译
- 程序链接
- 错误检查
- 画布调整

### math.js
包含数学运算工具：
- 向量运算
- 矩阵运算
- 坐标变换
- 投影计算

## 📝 代码规范

### HTML 文件结构
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例标题</title>
    <link rel="stylesheet" href="../../common/demo-styles.css">
</head>
<body>
    <div class="container">
        <h1>示例标题</h1>
        <div class="demo-area">
            <canvas id="webgl-canvas" width="800" height="600"></canvas>
        </div>
        <div class="controls">
            <!-- 控制面板 -->
        </div>
        <div class="info">
            <!-- 说明信息 -->
        </div>
    </div>
    
    <script src="../../common/utils.js"></script>
    <script src="../../common/math.js"></script>
    <script src="main.js"></script>
</body>
</html>
```

### JavaScript 代码结构
```javascript
// 1. 着色器源码
const vertexShaderSource = `...`;
const fragmentShaderSource = `...`;

// 2. 应用类
class WebGLDemo {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = this.canvas.getContext('webgl');
        this.init();
    }
    
    init() {
        // 初始化代码
    }
    
    render() {
        // 渲染代码
    }
}

// 3. 启动应用
window.addEventListener('load', () => {
    new WebGLDemo();
});
```

## 🎮 交互功能

### 标准控制
每个示例都包含以下标准控制：
- 鼠标拖拽旋转
- 滚轮缩放
- 键盘控制
- 参数调整面板

### 性能监控
- FPS 显示
- 渲染时间统计
- 内存使用监控

## 🐛 调试技巧

### 常见错误检查
```javascript
// WebGL 错误检查
function checkGLError(gl, operation) {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error(`WebGL 错误 ${operation}: ${error}`);
    }
}

// 着色器编译检查
function checkShaderCompile(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('着色器编译错误:', gl.getShaderInfoLog(shader));
    }
}
```

### 调试工具
- 使用 `console.log` 输出调试信息
- 使用 WebGL Inspector 查看 WebGL 调用
- 使用 Spector.js 分析渲染过程

## 📱 移动端适配

### 响应式设计
```javascript
function resizeCanvas(canvas, gl) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
    }
}
```

### 触摸事件处理
```javascript
// 处理触摸事件
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
```

## 🚀 性能优化

### 最佳实践
1. **批处理**：减少绘制调用次数
2. **资源管理**：及时释放不需要的资源
3. **着色器优化**：避免复杂的计算
4. **纹理压缩**：使用合适的纹理格式

### 性能测试
每个示例都包含性能测试代码，帮助您了解不同技术的性能特点。

## 📖 学习建议

### 循序渐进
1. 先理解概念，再看代码
2. 运行示例，观察效果
3. 修改参数，观察变化
4. 尝试扩展功能

### 实践练习
1. 修改着色器代码
2. 添加新的几何体
3. 实现不同的光照效果
4. 创建自己的材质

### 深入学习
1. 阅读 WebGL 规范
2. 学习图形学理论
3. 研究开源项目
4. 参与社区讨论

## 🔗 相关资源

- [WebGL 规范](https://www.khronos.org/webgl/)
- [GLSL 参考](https://www.khronos.org/files/opengles_shading_language.pdf)
- [Three.js 文档](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

**开始您的 WebGL 实践之旅吧！** 🎉 