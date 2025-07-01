# 几何体和缓冲区

## 📖 本章概述

几何体和缓冲区是 WebGL 中数据管理的核心。本章将详细介绍顶点缓冲区对象（VBO）、索引缓冲区对象（IBO）的使用，以及如何创建和管理几何体数据。

## 🎯 学习目标

- 理解 WebGL 缓冲区对象的概念和类型
- 掌握顶点缓冲区对象（VBO）的创建和使用
- 学会使用索引缓冲区对象（IBO）优化渲染
- 能够创建和管理几何体
- 掌握缓冲区的基本优化策略

## 1. 缓冲区对象基础

### 1.1 什么是缓冲区对象

**缓冲区对象（Buffer Object）** 是 WebGL 中存储顶点数据的容器，它们存储在 GPU 内存中，提供高效的数据访问。

主要类型：
- **顶点缓冲区对象（VBO）**：存储顶点属性数据
- **索引缓冲区对象（IBO/EBO）**：存储顶点索引数据

### 1.2 缓冲区基本操作

```javascript
// 1. 创建缓冲区
const buffer = gl.createBuffer();

// 2. 绑定缓冲区
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// 3. 上传数据
const data = new Float32Array([1.0, 2.0, 3.0]);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

// 4. 清理（可选）
gl.deleteBuffer(buffer);
```

### 1.3 使用模式

```javascript
// 数据使用模式
gl.STATIC_DRAW   // 数据很少或从不改变
gl.DYNAMIC_DRAW  // 数据经常改变
gl.STREAM_DRAW   // 数据每次使用时都会改变
```

## 2. 顶点缓冲区对象（VBO）

### 2.1 VBO 基础类

```javascript
class VertexBuffer {
    constructor(gl, data, usage = gl.STATIC_DRAW) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        
        if (data) {
            this.setData(data, usage);
        }
    }
    
    setData(data, usage = this.gl.STATIC_DRAW) {
        this.bind();
        
        // 确保数据是 TypedArray
        if (!(data instanceof Float32Array)) {
            data = new Float32Array(data);
        }
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    }
    
    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }
    
    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
    
    delete() {
        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }
}
```

### 2.2 设置顶点属性

```javascript
// 创建顶点数据
const vertices = [
    // 位置 (x, y, z)  颜色 (r, g, b)
    -0.5, -0.5, 0.0,   1.0, 0.0, 0.0,  // 红色顶点
     0.5, -0.5, 0.0,   0.0, 1.0, 0.0,  // 绿色顶点
     0.0,  0.5, 0.0,   0.0, 0.0, 1.0   // 蓝色顶点
];

// 创建缓冲区
const vertexBuffer = new VertexBuffer(gl, vertices);

// 绑定并设置属性
vertexBuffer.bind();

// 位置属性（location = 0）
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);

// 颜色属性（location = 1）
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
```

### 2.3 多缓冲区管理

```javascript
class GeometryBuffer {
    constructor(gl) {
        this.gl = gl;
        this.attributes = new Map();
        this.vertexCount = 0;
    }
    
    addAttribute(name, data, size) {
        const buffer = new VertexBuffer(this.gl, data);
        
        this.attributes.set(name, {
            buffer: buffer,
            size: size
        });
        
        this.vertexCount = Math.max(this.vertexCount, data.length / size);
        return this;
    }
    
    bindAttribute(location, name) {
        const attr = this.attributes.get(name);
        if (!attr) return;
        
        attr.buffer.bind();
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, attr.size, this.gl.FLOAT, false, 0, 0);
    }
    
    draw(mode = this.gl.TRIANGLES) {
        this.gl.drawArrays(mode, 0, this.vertexCount);
    }
    
    delete() {
        for (const attr of this.attributes.values()) {
            attr.buffer.delete();
        }
        this.attributes.clear();
    }
}
```

## 3. 索引缓冲区对象（IBO）

### 3.1 IBO 的优势

索引缓冲区允许重复使用顶点数据，减少内存占用：

```javascript
// 不使用索引：6个顶点绘制四边形
const vertices = [
    -0.5, -0.5, 0.0,  // 左下
     0.5, -0.5, 0.0,  // 右下
     0.5,  0.5, 0.0,  // 右上
     
     0.5,  0.5, 0.0,  // 右上（重复）
    -0.5,  0.5, 0.0,  // 左上
    -0.5, -0.5, 0.0   // 左下（重复）
];

// 使用索引：4个顶点 + 6个索引
const vertices2 = [
    -0.5, -0.5, 0.0,  // 0: 左下
     0.5, -0.5, 0.0,  // 1: 右下
     0.5,  0.5, 0.0,  // 2: 右上
    -0.5,  0.5, 0.0   // 3: 左上
];

const indices = [
    0, 1, 2,  // 第一个三角形
    2, 3, 0   // 第二个三角形
];
```

### 3.2 IBO 基础类

```javascript
class IndexBuffer {
    constructor(gl, indices, usage = gl.STATIC_DRAW) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        this.count = 0;
        this.type = gl.UNSIGNED_SHORT;
        
        if (indices) {
            this.setData(indices, usage);
        }
    }
    
    setData(indices, usage = this.gl.STATIC_DRAW) {
        this.bind();
        
        // 根据索引范围选择数据类型
        const maxIndex = Math.max(...indices);
        
        let data;
        if (maxIndex < 256) {
            data = new Uint8Array(indices);
            this.type = this.gl.UNSIGNED_BYTE;
        } else if (maxIndex < 65536) {
            data = new Uint16Array(indices);
            this.type = this.gl.UNSIGNED_SHORT;
        } else {
            data = new Uint32Array(indices);
            this.type = this.gl.UNSIGNED_INT;
        }
        
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, usage);
        this.count = indices.length;
    }
    
    bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
    
    draw(mode = this.gl.TRIANGLES) {
        this.bind();
        this.gl.drawElements(mode, this.count, this.type, 0);
    }
    
    delete() {
        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }
}
```

### 3.3 组合使用 VBO 和 IBO

```javascript
class Mesh {
    constructor(gl) {
        this.gl = gl;
        this.geometryBuffer = new GeometryBuffer(gl);
        this.indexBuffer = null;
    }
    
    setVertices(vertices) {
        this.geometryBuffer.addAttribute('position', vertices, 3);
        return this;
    }
    
    setColors(colors) {
        this.geometryBuffer.addAttribute('color', colors, 3);
        return this;
    }
    
    setTexCoords(texCoords) {
        this.geometryBuffer.addAttribute('texCoord', texCoords, 2);
        return this;
    }
    
    setIndices(indices) {
        this.indexBuffer = new IndexBuffer(this.gl, indices);
        return this;
    }
    
    bind(program) {
        // 绑定位置属性
        const positionLocation = this.gl.getAttribLocation(program, 'a_position');
        if (positionLocation >= 0) {
            this.geometryBuffer.bindAttribute(positionLocation, 'position');
        }
        
        // 绑定颜色属性
        const colorLocation = this.gl.getAttribLocation(program, 'a_color');
        if (colorLocation >= 0) {
            this.geometryBuffer.bindAttribute(colorLocation, 'color');
        }
        
        // 绑定纹理坐标属性
        const texCoordLocation = this.gl.getAttribLocation(program, 'a_texCoord');
        if (texCoordLocation >= 0) {
            this.geometryBuffer.bindAttribute(texCoordLocation, 'texCoord');
        }
    }
    
    draw() {
        if (this.indexBuffer) {
            this.indexBuffer.draw();
        } else {
            this.geometryBuffer.draw();
        }
    }
    
    delete() {
        this.geometryBuffer.delete();
        if (this.indexBuffer) {
            this.indexBuffer.delete();
        }
    }
}
```

## 4. 几何体创建

### 4.1 基础几何体生成器

```javascript
class GeometryGenerator {
    // 创建三角形
    static createTriangle() {
        return {
            vertices: [
                -0.5, -0.5, 0.0,
                 0.5, -0.5, 0.0,
                 0.0,  0.5, 0.0
            ],
            colors: [
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0
            ]
        };
    }
    
    // 创建四边形
    static createQuad() {
        return {
            vertices: [
                -0.5, -0.5, 0.0,  // 左下
                 0.5, -0.5, 0.0,  // 右下
                 0.5,  0.5, 0.0,  // 右上
                -0.5,  0.5, 0.0   // 左上
            ],
            texCoords: [
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0
            ],
            indices: [
                0, 1, 2,
                2, 3, 0
            ]
        };
    }
    
    // 创建立方体
    static createCube(size = 1.0) {
        const s = size * 0.5;
        
        return {
            vertices: [
                // 前面
                -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
                // 后面
                -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s, -s,
                // 上面
                -s,  s, -s, -s,  s,  s,  s,  s,  s,  s,  s, -s,
                // 下面
                -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
                // 右面
                 s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
                // 左面
                -s, -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s
            ],
            indices: [
                0,  1,  2,   0,  2,  3,    // 前面
                4,  5,  6,   4,  6,  7,    // 后面
                8,  9,  10,  8,  10, 11,   // 上面
                12, 13, 14,  12, 14, 15,   // 下面
                16, 17, 18,  16, 18, 19,   // 右面
                20, 21, 22,  20, 22, 23    // 左面
            ]
        };
    }
}
```

### 4.2 使用几何体

```javascript
// 创建并使用立方体
const cubeGeometry = GeometryGenerator.createCube(2.0);
const cubeMesh = new Mesh(gl);

cubeMesh
    .setVertices(cubeGeometry.vertices)
    .setIndices(cubeGeometry.indices);

// 渲染
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // 使用着色器程序
    gl.useProgram(shaderProgram);
    
    // 绑定网格
    cubeMesh.bind(shaderProgram);
    
    // 绘制
    cubeMesh.draw();
}
```

## 5. 实践示例

### 5.1 彩色三角形

```javascript
// 创建彩色三角形
function createColoredTriangle(gl) {
    const geometry = GeometryGenerator.createTriangle();
    const mesh = new Mesh(gl);
    
    mesh
        .setVertices(geometry.vertices)
        .setColors(geometry.colors);
    
    return mesh;
}

// 使用
const triangle = createColoredTriangle(gl);

function render() {
    triangle.bind(program);
    triangle.draw();
}
```

### 5.2 纹理四边形

```javascript
// 创建纹理四边形
function createTexturedQuad(gl) {
    const geometry = GeometryGenerator.createQuad();
    const mesh = new Mesh(gl);
    
    mesh
        .setVertices(geometry.vertices)
        .setTexCoords(geometry.texCoords)
        .setIndices(geometry.indices);
    
    return mesh;
}

// 使用
const quad = createTexturedQuad(gl);

function render() {
    // 绑定纹理
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    quad.bind(program);
    quad.draw();
}
```

### 5.3 动态几何体

```javascript
class DynamicGeometry {
    constructor(gl) {
        this.gl = gl;
        this.mesh = new Mesh(gl);
        this.time = 0;
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // 生成动态顶点
        const vertices = [];
        const segments = 20;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const radius = 0.5 + Math.sin(this.time + angle * 3) * 0.2;
            
            vertices.push(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0.0
            );
        }
        
        // 更新几何体
        this.mesh.geometryBuffer.attributes.get('position').buffer.setData(vertices);
        this.mesh.geometryBuffer.vertexCount = vertices.length / 3;
    }
    
    draw() {
        this.mesh.draw();
    }
}
```

## 6. 性能优化

### 6.1 缓冲区管理最佳实践

```javascript
// 好的做法：重用缓冲区
class BufferManager {
    constructor(gl) {
        this.gl = gl;
        this.bufferPool = [];
    }
    
    getBuffer() {
        if (this.bufferPool.length > 0) {
            return this.bufferPool.pop();
        }
        return this.gl.createBuffer();
    }
    
    releaseBuffer(buffer) {
        this.bufferPool.push(buffer);
    }
}

// 避免的做法：频繁创建删除缓冲区
function badExample(gl) {
    for (let i = 0; i < 1000; i++) {
        const buffer = gl.createBuffer();  // 性能差
        gl.deleteBuffer(buffer);
    }
}
```

### 6.2 批量渲染

```javascript
class BatchRenderer {
    constructor(gl, maxQuads = 1000) {
        this.gl = gl;
        this.maxQuads = maxQuads;
        this.vertices = [];
        this.quadCount = 0;
        
        this.setupBuffers();
    }
    
    setupBuffers() {
        // 创建大缓冲区容纳多个四边形
        const maxVertices = this.maxQuads * 4 * 5; // 4顶点 * 5分量(x,y,z,u,v)
        
        this.vertexBuffer = new VertexBuffer(this.gl, null, this.gl.DYNAMIC_DRAW);
        this.vertexBuffer.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, maxVertices * 4, this.gl.DYNAMIC_DRAW);
    }
    
    addQuad(x, y, width, height) {
        if (this.quadCount >= this.maxQuads) {
            this.flush();
        }
        
        // 添加四边形顶点数据
        this.vertices.push(
            x, y, 0, 0, 0,
            x + width, y, 0, 1, 0,
            x + width, y + height, 0, 1, 1,
            x, y + height, 0, 0, 1
        );
        
        this.quadCount++;
    }
    
    flush() {
        if (this.quadCount === 0) return;
        
        // 上传数据
        this.vertexBuffer.bind();
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
        
        // 设置属性并绘制
        this.setupAttributes();
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.quadCount * 6);
        
        // 重置
        this.vertices = [];
        this.quadCount = 0;
    }
    
    setupAttributes() {
        // 位置属性
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 20, 0);
        
        // 纹理坐标属性
        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 20, 12);
    }
}
```

## 7. 常见问题

### Q1: 什么时候使用索引缓冲区？
**A**: 当几何体有共享顶点时使用索引缓冲区，可以减少数据冗余和内存使用。立方体、球体等复杂几何体通常受益于索引缓冲区。

### Q2: 如何选择缓冲区使用模式？
**A**: 
- **STATIC_DRAW**: 数据很少或从不改变（静态模型）
- **DYNAMIC_DRAW**: 数据经常改变（动画、粒子）
- **STREAM_DRAW**: 数据每次使用时都会改变（流式数据）

### Q3: 为什么我的几何体不显示？
**A**: 检查以下几点：
- 顶点坐标是否正确
- 顶点属性是否正确绑定
- 着色器是否正确接收属性
- 深度测试和面剔除设置

### Q4: 如何优化大量几何体的渲染？
**A**: 使用批量渲染、实例化渲染或几何体合并等技术，减少绘制调用次数。

## 8. 章节总结

通过本章学习，您应该已经：

- ✅ 理解了 WebGL 缓冲区对象的概念和类型
- ✅ 掌握了 VBO 和 IBO 的创建和使用
- ✅ 学会了创建基础几何体
- ✅ 了解了基本的性能优化技巧
- ✅ 能够构建几何体管理系统

## 🔗 下一步

现在您已经掌握了几何体和缓冲区管理，接下来我们将学习 [变换与矩阵](06-transforms.md)，构建完整的 3D 变换系统。

**准备好进入 3D 变换的世界了吗？让我们继续前进！** 🚀 