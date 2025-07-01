# 着色器编程

## 📖 本章概述

着色器是 WebGL 的核心，它们运行在 GPU 上，负责处理顶点变换和像素着色。本章将深入讲解 GLSL 语言和着色器编程技术，帮助您掌握创建各种视觉效果的能力。

## 🎯 学习目标

- 掌握 GLSL 语言的核心语法
- 深入理解顶点着色器的工作原理
- 熟练编写片段着色器创建视觉效果
- 学会着色器程序的管理和优化
- 掌握着色器调试和错误处理技巧

## 1. GLSL 语言基础

### 1.1 GLSL 简介

**GLSL (OpenGL Shading Language)** 是专门为图形处理器设计的类 C 语言。它具有以下特点：

- **强类型**：所有变量必须声明类型
- **向量化**：内置向量和矩阵类型
- **并行执行**：在 GPU 的多个核心上并行运行
- **受限功能**：不支持递归、动态内存分配等

### 1.2 数据类型

#### 基础数据类型
```glsl
// 标量类型
float f = 1.0;          // 浮点数
int i = 42;             // 整数
bool b = true;          // 布尔值

// 向量类型
vec2 position = vec2(1.0, 2.0);         // 2D 向量
vec3 color = vec3(1.0, 0.5, 0.0);       // 3D 向量
vec4 vertex = vec4(x, y, z, 1.0);       // 4D 向量

// 整数向量
ivec2 texSize = ivec2(512, 512);        // 2D 整数向量
ivec3 indices = ivec3(0, 1, 2);         // 3D 整数向量

// 布尔向量
bvec3 mask = bvec3(true, false, true);  // 3D 布尔向量
```

#### 矩阵类型
```glsl
// 矩阵类型
mat2 rotation = mat2(cos(angle), -sin(angle),
                     sin(angle),  cos(angle));

mat3 transform3 = mat3(1.0);            // 3x3 单位矩阵
mat4 mvpMatrix = mat4(1.0);             // 4x4 单位矩阵

// 矩阵构造
mat4 m = mat4(
    1.0, 0.0, 0.0, 0.0,  // 第一列
    0.0, 1.0, 0.0, 0.0,  // 第二列
    0.0, 0.0, 1.0, 0.0,  // 第三列
    0.0, 0.0, 0.0, 1.0   // 第四列
);
```

#### 纹理类型
```glsl
// 纹理采样器
sampler2D diffuseTexture;              // 2D 纹理
samplerCube environmentMap;             // 立方体贴图
sampler2DArray textureArray;           // 纹理数组（WebGL 2.0）
```

### 1.3 向量操作

#### 分量访问
```glsl
vec4 color = vec4(1.0, 0.5, 0.2, 1.0);

// 单个分量访问
float red = color.r;        // 或 color.x
float green = color.g;      // 或 color.y
float blue = color.b;       // 或 color.z
float alpha = color.a;      // 或 color.w

// 多分量访问（swizzling）
vec3 rgb = color.rgb;       // 获取RGB分量
vec2 rg = color.rg;         // 获取RG分量
vec4 bgra = color.bgra;     // 重新排列分量
```

#### 向量运算
```glsl
vec3 a = vec3(1.0, 2.0, 3.0);
vec3 b = vec3(4.0, 5.0, 6.0);

// 基础运算
vec3 sum = a + b;           // 分量相加
vec3 diff = a - b;          // 分量相减
vec3 product = a * b;       // 分量相乘
vec3 quotient = a / b;      // 分量相除

// 标量运算
vec3 scaled = a * 2.0;      // 标量乘法
vec3 offset = a + 1.0;      // 标量加法

// 内置函数
float dotProduct = dot(a, b);       // 点积
vec3 crossProduct = cross(a, b);    // 叉积
float len = length(a);              // 长度
vec3 normalized = normalize(a);     // 归一化
```

### 1.4 控制流

#### 条件语句
```glsl
// if-else 语句
if (value > 0.5) {
    color = vec3(1.0, 0.0, 0.0);  // 红色
} else if (value > 0.25) {
    color = vec3(0.0, 1.0, 0.0);  // 绿色
} else {
    color = vec3(0.0, 0.0, 1.0);  // 蓝色
}

// 三元运算符
vec3 color = (brightness > 0.5) ? vec3(1.0) : vec3(0.0);
```

#### 循环语句
```glsl
// for 循环
for (int i = 0; i < 4; i++) {
    sum += values[i];
}

// while 循环
int counter = 0;
while (counter < maxIterations && error > threshold) {
    // 迭代计算
    counter++;
}
```

### 1.5 函数定义

```glsl
// 简单函数
float square(float x) {
    return x * x;
}

// 向量函数
vec3 blendColors(vec3 color1, vec3 color2, float factor) {
    return mix(color1, color2, factor);
}

// 多返回值（通过输出参数）
void calculateLighting(vec3 normal, vec3 lightDir, 
                      out float diffuse, out float specular) {
    diffuse = max(dot(normal, lightDir), 0.0);
    vec3 reflected = reflect(-lightDir, normal);
    specular = pow(max(dot(reflected, viewDir), 0.0), shininess);
}
```

## 2. 顶点着色器基础

### 2.1 顶点着色器模板

```glsl
// 基础顶点着色器
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelViewProjectionMatrix;
uniform mat3 u_normalMatrix;

varying vec3 v_normal;
varying vec2 v_texCoord;

void main() {
    // 变换顶点位置
    gl_Position = u_modelViewProjectionMatrix * vec4(a_position, 1.0);
    
    // 变换法线
    v_normal = u_normalMatrix * a_normal;
    
    // 传递纹理坐标
    v_texCoord = a_texCoord;
}
```

### 2.2 高级顶点效果

#### 顶点动画
```glsl
attribute vec3 a_position;
uniform float u_time;
uniform float u_amplitude;

void main() {
    vec3 position = a_position;
    
    // 波浪效果
    position.y += sin(position.x * 2.0 + u_time) * u_amplitude;
    
    gl_Position = u_modelViewProjectionMatrix * vec4(position, 1.0);
}
```

## 3. 片段着色器基础

### 3.1 片段着色器模板

```glsl
precision mediump float;

varying vec3 v_normal;
varying vec2 v_texCoord;

uniform sampler2D u_texture;
uniform vec3 u_lightDirection;

void main() {
    // 纹理采样
    vec4 texColor = texture2D(u_texture, v_texCoord);
    
    // 简单光照
    vec3 normal = normalize(v_normal);
    float light = max(dot(normal, u_lightDirection), 0.0);
    
    // 最终颜色
    gl_FragColor = texColor * light;
}
```

### 3.2 视觉效果

#### 程序化纹理
```glsl
precision mediump float;

varying vec2 v_texCoord;
uniform float u_time;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = v_texCoord * 10.0;
    float noise = random(st + u_time);
    
    vec3 color = vec3(noise);
    gl_FragColor = vec4(color, 1.0);
}
```

## 4. 着色器程序管理

### 4.1 着色器编译

```javascript
class ShaderProgram {
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = this.createProgram(vertexSource, fragmentSource);
        this.uniforms = {};
        this.attributes = {};
        
        if (this.program) {
            this.getLocations();
        }
    }
    
    createShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('着色器编译错误:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.createShader(fragmentSource, this.gl.FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('程序链接错误:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        // 清理
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
        
        return program;
    }
    
    getLocations() {
        // 获取统一变量位置
        const uniformCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const info = this.gl.getActiveUniform(this.program, i);
            this.uniforms[info.name] = this.gl.getUniformLocation(this.program, info.name);
        }
        
        // 获取属性位置
        const attributeCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attributeCount; i++) {
            const info = this.gl.getActiveAttrib(this.program, i);
            this.attributes[info.name] = this.gl.getAttribLocation(this.program, info.name);
        }
    }
    
    use() {
        this.gl.useProgram(this.program);
    }
    
    setUniform(name, value) {
        const location = this.uniforms[name];
        if (location === null || location === undefined) return;
        
        if (typeof value === 'number') {
            this.gl.uniform1f(location, value);
        } else if (Array.isArray(value)) {
            switch (value.length) {
                case 2: this.gl.uniform2fv(location, value); break;
                case 3: this.gl.uniform3fv(location, value); break;
                case 4: this.gl.uniform4fv(location, value); break;
                case 16: this.gl.uniformMatrix4fv(location, false, value); break;
            }
        }
    }
}
```

## 5. 实践示例

### 5.1 彩虹三角形

#### 顶点着色器
```glsl
attribute vec2 a_position;
attribute vec3 a_color;

varying vec3 v_color;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_color = a_color;
}
```

#### 片段着色器
```glsl
precision mediump float;

varying vec3 v_color;

void main() {
    gl_FragColor = vec4(v_color, 1.0);
}
```

### 5.2 动态效果

#### 时间动画着色器
```glsl
// 顶点着色器
attribute vec2 a_position;
uniform float u_time;

void main() {
    vec2 position = a_position;
    position.x += sin(u_time + a_position.y * 5.0) * 0.1;
    gl_Position = vec4(position, 0.0, 1.0);
}

// 片段着色器
precision mediump float;
uniform float u_time;

void main() {
    vec3 color = vec3(
        sin(u_time) * 0.5 + 0.5,
        cos(u_time) * 0.5 + 0.5,
        sin(u_time + 1.57) * 0.5 + 0.5
    );
    gl_FragColor = vec4(color, 1.0);
}
```

## 6. 调试技巧

### 6.1 常见错误

1. **精度声明缺失**
```glsl
// 错误：片段着色器缺少精度声明
varying vec2 v_texCoord;

// 正确：添加精度声明
precision mediump float;
varying vec2 v_texCoord;
```

2. **变量类型不匹配**
```glsl
// 错误：整数和浮点数混用
int i = 1;
float f = i * 1.5;  // 错误

// 正确：明确类型转换
int i = 1;
float f = float(i) * 1.5;
```

### 6.2 调试方法

#### 颜色调试
```glsl
// 将数值可视化为颜色
void main() {
    float value = someCalculation();
    
    // 将 [0,1] 范围的值显示为红色强度
    gl_FragColor = vec4(value, 0.0, 0.0, 1.0);
    
    // 将 [-1,1] 范围的值显示为红绿色
    gl_FragColor = vec4(value * 0.5 + 0.5, 0.0, 0.0, 1.0);
}
```

## 7. 常见问题

### Q1: 为什么我的着色器不显示任何内容？
**A**: 检查以下几点：
- 精度声明是否正确
- gl_Position 是否被设置
- 顶点坐标是否在裁剪空间内
- 着色器是否编译成功

### Q2: 如何传递数据给着色器？
**A**: 使用三种方式：
- **attribute**: 每个顶点不同的数据
- **uniform**: 所有顶点相同的数据
- **varying**: 顶点着色器到片段着色器的数据

## 8. 章节总结

通过本章学习，您应该已经：

- ✅ 掌握了 GLSL 语言的基础语法
- ✅ 理解了顶点着色器和片段着色器的作用
- ✅ 学会了创建简单的视觉效果
- ✅ 掌握了基本的着色器管理技巧
- ✅ 了解了常见的调试方法

## 🔗 下一步

现在您已经掌握了着色器编程基础，接下来我们将学习 [几何体和缓冲区](05-geometry-buffers.md)，深入了解 WebGL 的数据管理系统。

**准备好管理复杂的 3D 数据了吗？让我们继续前进！** 🚀 