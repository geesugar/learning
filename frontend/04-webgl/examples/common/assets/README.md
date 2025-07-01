# 资源文件目录

此目录包含 WebGL 示例所需的各种资源文件。

## 目录结构

```
assets/
├── textures/          # 纹理图片
│   ├── diffuse/       # 漫反射贴图
│   ├── normal/        # 法线贴图
│   ├── specular/      # 镜面反射贴图
│   └── environment/   # 环境贴图
├── models/            # 3D 模型文件
│   ├── obj/           # OBJ 格式模型
│   ├── gltf/          # glTF 格式模型
│   └── primitives/    # 基础几何体
├── shaders/           # 预定义着色器
│   ├── common/        # 通用着色器
│   ├── lighting/      # 光照着色器
│   └── post-process/  # 后处理着色器
└── fonts/             # 字体文件
```

## 文件格式说明

### 纹理格式
- 支持：JPG, PNG, WebP
- 推荐尺寸：2^n (256, 512, 1024, 2048)
- 压缩：建议使用 WebP 格式以获得更好的压缩比

### 模型格式
- OBJ：简单几何体
- glTF 2.0：复杂模型和动画
- 顶点数据：位置、法线、纹理坐标、颜色

### 着色器格式
- 顶点着色器：.vert
- 片段着色器：.frag
- 几何着色器：.geom (WebGL 2.0)
- 计算着色器：.comp (WebGL 2.0)

## 使用方法

在示例代码中引用资源：

```javascript
// 加载纹理
const texture = WebGLUtils.loadTexture(gl, 'assets/textures/diffuse/brick.jpg');

// 加载模型
const model = await loadModel('assets/models/obj/cube.obj');

// 加载着色器
const vertexShader = await loadShader('assets/shaders/lighting/phong.vert');
```

## 许可证

所有资源文件均为学习用途，遵循 CC0 或类似的开源许可证。 