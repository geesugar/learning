# 第11章：几何处理

几何处理是现代3D渲染中的关键技术，涉及几何体的生成、变换、优化和高效渲染。本章将深入探讨实例化渲染、几何着色器应用、细节层次（LOD）系统和几何优化技术。

## 🎯 学习目标

- 掌握硬件实例化渲染技术
- 理解几何着色器的应用场景
- 实现动态LOD系统
- 学习几何体优化和压缩技术
- 掌握大规模场景渲染策略

## 📚 章节内容

### 11.1 实例化渲染

实例化渲染允许用一次绘制调用渲染大量相似的几何体，是处理重复对象的高效方法。

#### 11.1.1 硬件实例化基础

```javascript
// 实例化渲染器
class InstancedRenderer {
    constructor(gl, geometry, maxInstances = 10000) {
        this.gl = gl;
        this.geometry = geometry;
        this.maxInstances = maxInstances;
        
        this.instances = [];
        this.needsUpdate = true;
        
        this.createBuffers();
        this.createShader();
    }
    
    createBuffers() {
        const gl = this.gl;
        
        // 创建实例数据缓冲区
        this.instanceBuffer = gl.createBuffer();
        
        // 每个实例的数据：变换矩阵(16) + 颜色(4) = 20个浮点数
        this.instanceData = new Float32Array(this.maxInstances * 20);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.instanceData, gl.DYNAMIC_DRAW);
        
        this.setupInstancedAttributes();
    }
    
    setupInstancedAttributes() {
        const gl = this.gl;
        const stride = 20 * 4; // 20 floats * 4 bytes
        
        // 变换矩阵（4x4）
        for (let i = 0; i < 4; i++) {
            const loc = 4 + i; // 假设前4个是顶点属性
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, stride, i * 16);
            gl.vertexAttribDivisor(loc, 1); // 每个实例一个值
        }
        
        // 实例颜色
        const colorLoc = 8;
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, stride, 64);
        gl.vertexAttribDivisor(colorLoc, 1);
    }
    
    addInstance(transform, color = [1, 1, 1, 1]) {
        if (this.instances.length >= this.maxInstances) {
            console.warn('Maximum instances reached');
            return;
        }
        
        this.instances.push({ transform, color });
        this.needsUpdate = true;
    }
    
    updateInstanceData() {
        if (!this.needsUpdate) return;
        
        const gl = this.gl;
        
        for (let i = 0; i < this.instances.length; i++) {
            const instance = this.instances[i];
            const offset = i * 20;
            
            // 设置变换矩阵
            this.instanceData.set(instance.transform, offset);
            
            // 设置颜色
            this.instanceData.set(instance.color, offset + 16);
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, 
                        this.instanceData.subarray(0, this.instances.length * 20));
        
        this.needsUpdate = false;
    }
    
    render(viewMatrix, projectionMatrix) {
        if (this.instances.length === 0) return;
        
        const gl = this.gl;
        
        this.updateInstanceData();
        
        gl.useProgram(this.shader);
        
        // 设置统一变量
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader, 'u_viewMatrix'), 
                           false, viewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader, 'u_projectionMatrix'), 
                           false, projectionMatrix);
        
        // 绑定几何体
        this.geometry.bind();
        
        // 绑定实例数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        this.setupInstancedAttributes();
        
        // 实例化绘制
        gl.drawElementsInstanced(
            gl.TRIANGLES,
            this.geometry.indexCount,
            gl.UNSIGNED_SHORT,
            0,
            this.instances.length
        );
    }
    
    createShader() {
        const vertexShaderSource = `
            attribute vec3 a_position;
            attribute vec3 a_normal;
            attribute vec2 a_texCoord;
            
            // 实例属性
            attribute mat4 a_instanceMatrix;
            attribute vec4 a_instanceColor;
            
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            varying vec4 v_color;
            varying vec3 v_worldPos;
            
            void main() {
                vec4 worldPos = a_instanceMatrix * vec4(a_position, 1.0);
                v_worldPos = worldPos.xyz;
                v_normal = normalize(mat3(a_instanceMatrix) * a_normal);
                v_texCoord = a_texCoord;
                v_color = a_instanceColor;
                
                gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
            }
        `;
        
        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            varying vec4 v_color;
            varying vec3 v_worldPos;
            
            uniform vec3 u_lightPos;
            uniform vec3 u_viewPos;
            
            void main() {
                vec3 normal = normalize(v_normal);
                vec3 lightDir = normalize(u_lightPos - v_worldPos);
                vec3 viewDir = normalize(u_viewPos - v_worldPos);
                
                // 简单光照
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 reflectDir = reflect(-lightDir, normal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                
                vec3 ambient = 0.1 * v_color.rgb;
                vec3 diffuse = diff * v_color.rgb;
                vec3 specular = spec * vec3(1.0);
                
                gl_FragColor = vec4(ambient + diffuse + specular, v_color.a);
            }
        `;
        
        this.shader = createShaderProgram(this.gl, vertexShaderSource, fragmentShaderSource);
    }
    
    clear() {
        this.instances = [];
        this.needsUpdate = true;
    }
}
```

#### 11.1.2 动态实例管理

```javascript
// 动态实例管理器
class DynamicInstanceManager {
    constructor(gl, geometry, maxInstances = 50000) {
        this.gl = gl;
        this.renderer = new InstancedRenderer(gl, geometry, maxInstances);
        
        this.activeInstances = new Set();
        this.instancePool = [];
        this.spatialGrid = new SpatialGrid(100, 100); // 用于空间查询
        
        this.frustum = new Frustum();
    }
    
    createInstance(position, rotation = [0, 0, 0], scale = [1, 1, 1], color = [1, 1, 1, 1]) {
        let instance;
        
        if (this.instancePool.length > 0) {
            instance = this.instancePool.pop();
            instance.reset(position, rotation, scale, color);
        } else {
            instance = new Instance(position, rotation, scale, color);
        }
        
        this.activeInstances.add(instance);
        this.spatialGrid.addObject(instance, position);
        
        return instance;
    }
    
    removeInstance(instance) {
        this.activeInstances.delete(instance);
        this.spatialGrid.removeObject(instance);
        this.instancePool.push(instance);
    }
    
    update(camera) {
        // 更新视锥
        this.frustum.setFromCamera(camera);
        
        // 清空渲染器
        this.renderer.clear();
        
        // 视锥剔除和LOD选择
        for (const instance of this.activeInstances) {
            if (this.frustum.containsPoint(instance.position)) {
                const distance = vec3.distance(camera.position, instance.position);
                const lod = this.calculateLOD(distance);
                
                if (lod >= 0) {
                    this.renderer.addInstance(instance.getTransformMatrix(), instance.color);
                }
            }
        }
    }
    
    calculateLOD(distance) {
        if (distance < 50) return 0;      // 高细节
        if (distance < 100) return 1;     // 中细节
        if (distance < 200) return 2;     // 低细节
        return -1;                        // 不渲染
    }
    
    render(viewMatrix, projectionMatrix) {
        this.renderer.render(viewMatrix, projectionMatrix);
    }
}
```

### 11.2 几何着色器应用

几何着色器运行在顶点和片段着色器之间，可以生成新的几何体。

#### 11.2.1 动态几何生成

```glsl
// 几何着色器：从点生成广告牌
#version 300 es

layout (points) in;
layout (triangle_strip, max_vertices = 4) out;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform float u_billboardSize;

in vec3 v_worldPos[];
in vec4 v_color[];

out vec2 v_texCoord;
out vec4 v_fragColor;

void main() {
    vec3 worldPos = v_worldPos[0];
    vec4 color = v_color[0];
    
    // 计算相机空间位置
    vec4 viewPos = u_viewMatrix * vec4(worldPos, 1.0);
    
    float size = u_billboardSize;
    
    // 生成四个顶点
    // 左下
    gl_Position = u_projectionMatrix * (viewPos + vec4(-size, -size, 0.0, 0.0));
    v_texCoord = vec2(0.0, 0.0);
    v_fragColor = color;
    EmitVertex();
    
    // 右下
    gl_Position = u_projectionMatrix * (viewPos + vec4(size, -size, 0.0, 0.0));
    v_texCoord = vec2(1.0, 0.0);
    v_fragColor = color;
    EmitVertex();
    
    // 左上
    gl_Position = u_projectionMatrix * (viewPos + vec4(-size, size, 0.0, 0.0));
    v_texCoord = vec2(0.0, 1.0);
    v_fragColor = color;
    EmitVertex();
    
    // 右上
    gl_Position = u_projectionMatrix * (viewPos + vec4(size, size, 0.0, 0.0));
    v_texCoord = vec2(1.0, 1.0);
    v_fragColor = color;
    EmitVertex();
    
    EndPrimitive();
}
```

#### 11.2.2 程序化草地生成

```javascript
// 程序化草地渲染器
class ProceduralGrassRenderer {
    constructor(gl, terrainSize = 100, grassDensity = 1000) {
        this.gl = gl;
        this.terrainSize = terrainSize;
        this.grassDensity = grassDensity;
        
        this.createGrassPoints();
        this.createShader();
        this.setupBuffers();
    }
    
    createGrassPoints() {
        this.grassPoints = [];
        
        for (let i = 0; i < this.grassDensity; i++) {
            const x = (Math.random() - 0.5) * this.terrainSize;
            const z = (Math.random() - 0.5) * this.terrainSize;
            const y = this.getTerrainHeight(x, z); // 根据地形高度
            
            this.grassPoints.push({
                position: [x, y, z],
                height: 0.5 + Math.random() * 1.0,    // 随机高度
                sway: Math.random() * Math.PI * 2,     // 摆动相位
                color: this.getGrassColor(x, z)        // 根据位置变化颜色
            });
        }
    }
    
    getTerrainHeight(x, z) {
        // 简单的噪声高度
        return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
    }
    
    getGrassColor(x, z) {
        const green = 0.2 + Math.random() * 0.3;
        return [0.1, green, 0.05, 1.0];
    }
    
    setupBuffers() {
        const gl = this.gl;
        
        // 创建草地点数据
        const pointData = [];
        for (const point of this.grassPoints) {
            pointData.push(...point.position);   // 位置
            pointData.push(point.height);        // 高度
            pointData.push(point.sway);          // 摆动
            pointData.push(...point.color);      // 颜色
        }
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointData), gl.STATIC_DRAW);
        
        this.vertexCount = this.grassPoints.length;
    }
    
    createShader() {
        const vertexShaderSource = `#version 300 es
            in vec3 a_position;
            in float a_height;
            in float a_sway;
            in vec4 a_color;
            
            uniform float u_time;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            
            out vec3 v_worldPos;
            out float v_height;
            out float v_sway;
            out vec4 v_color;
            
            void main() {
                v_worldPos = a_position;
                v_height = a_height;
                v_sway = a_sway + u_time;
                v_color = a_color;
                
                gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1.0);
            }
        `;
        
        const geometryShaderSource = `#version 300 es
            layout (points) in;
            layout (triangle_strip, max_vertices = 8) out;
            
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform vec3 u_windDirection;
            uniform float u_windStrength;
            
            in vec3 v_worldPos[];
            in float v_height[];
            in float v_sway[];
            in vec4 v_color[];
            
            out vec2 v_texCoord;
            out vec4 v_fragColor;
            out float v_grassHeight;
            
            void main() {
                vec3 basePos = v_worldPos[0];
                float height = v_height[0];
                float sway = v_sway[0];
                vec4 color = v_color[0];
                
                // 风的影响
                vec3 windOffset = u_windDirection * sin(sway) * u_windStrength * height;
                
                float width = 0.02;
                
                // 生成草的四边形
                vec3 p0 = basePos + vec3(-width, 0.0, 0.0);
                vec3 p1 = basePos + vec3(width, 0.0, 0.0);
                vec3 p2 = basePos + vec3(-width * 0.5, height, 0.0) + windOffset;
                vec3 p3 = basePos + vec3(width * 0.5, height, 0.0) + windOffset;
                
                // 输出四个顶点
                gl_Position = u_projectionMatrix * u_viewMatrix * vec4(p0, 1.0);
                v_texCoord = vec2(0.0, 0.0);
                v_fragColor = color;
                v_grassHeight = 0.0;
                EmitVertex();
                
                gl_Position = u_projectionMatrix * u_viewMatrix * vec4(p1, 1.0);
                v_texCoord = vec2(1.0, 0.0);
                v_fragColor = color;
                v_grassHeight = 0.0;
                EmitVertex();
                
                gl_Position = u_projectionMatrix * u_viewMatrix * vec4(p2, 1.0);
                v_texCoord = vec2(0.0, 1.0);
                v_fragColor = color * 1.2; // 顶部稍亮
                v_grassHeight = 1.0;
                EmitVertex();
                
                gl_Position = u_projectionMatrix * u_viewMatrix * vec4(p3, 1.0);
                v_texCoord = vec2(1.0, 1.0);
                v_fragColor = color * 1.2;
                v_grassHeight = 1.0;
                EmitVertex();
                
                EndPrimitive();
            }
        `;
        
        const fragmentShaderSource = `#version 300 es
            precision mediump float;
            
            in vec2 v_texCoord;
            in vec4 v_fragColor;
            in float v_grassHeight;
            
            out vec4 fragColor;
            
            void main() {
                // 简单的草地纹理
                float alpha = 1.0 - pow(v_texCoord.x * 2.0 - 1.0, 2.0);
                alpha *= 1.0 - pow(v_texCoord.y, 0.5);
                
                if (alpha < 0.1) discard;
                
                fragColor = vec4(v_fragColor.rgb, alpha);
            }
        `;
        
        this.shader = this.createShaderProgram(vertexShaderSource, 
                                              geometryShaderSource, 
                                              fragmentShaderSource);
    }
    
    render(viewMatrix, projectionMatrix, time, windDirection = [1, 0, 0], windStrength = 0.1) {
        const gl = this.gl;
        
        gl.useProgram(this.shader);
        
        // 设置统一变量
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader, 'u_viewMatrix'), 
                           false, viewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader, 'u_projectionMatrix'), 
                           false, projectionMatrix);
        gl.uniform1f(gl.getUniformLocation(this.shader, 'u_time'), time);
        gl.uniform3fv(gl.getUniformLocation(this.shader, 'u_windDirection'), windDirection);
        gl.uniform1f(gl.getUniformLocation(this.shader, 'u_windStrength'), windStrength);
        
        // 绑定顶点数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
        const stride = 9 * 4; // 9 floats * 4 bytes
        gl.enableVertexAttribArray(0); // position
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
        
        gl.enableVertexAttribArray(1); // height
        gl.vertexAttribPointer(1, 1, gl.FLOAT, false, stride, 12);
        
        gl.enableVertexAttribArray(2); // sway
        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 16);
        
        gl.enableVertexAttribArray(3); // color
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 20);
        
        // 渲染点
        gl.drawArrays(gl.POINTS, 0, this.vertexCount);
    }
}
```

### 11.3 细节层次（LOD）系统

LOD系统根据距离或重要性动态调整几何体的细节层次，平衡视觉质量和性能。

#### 11.3.1 距离LOD系统

```javascript
// LOD管理器
class LODManager {
    constructor() {
        this.lodObjects = [];
        this.camera = null;
    }
    
    addLODObject(object, lodLevels) {
        const lodObject = {
            object: object,
            levels: lodLevels, // [{ distance: 0, geometry: highRes }, ...]
            currentLOD: 0,
            position: object.position
        };
        
        this.lodObjects.push(lodObject);
    }
    
    update(camera) {
        this.camera = camera;
        
        for (const lodObject of this.lodObjects) {
            const distance = vec3.distance(camera.position, lodObject.position);
            const newLOD = this.calculateLOD(lodObject.levels, distance);
            
            if (newLOD !== lodObject.currentLOD) {
                this.switchLOD(lodObject, newLOD);
                lodObject.currentLOD = newLOD;
            }
        }
    }
    
    calculateLOD(levels, distance) {
        for (let i = levels.length - 1; i >= 0; i--) {
            if (distance >= levels[i].distance) {
                return i;
            }
        }
        return 0;
    }
    
    switchLOD(lodObject, newLOD) {
        const level = lodObject.levels[newLOD];
        lodObject.object.setGeometry(level.geometry);
    }
}

// 几何体简化器
class GeometrySimplifier {
    static createLODLevels(originalGeometry, levels = [1.0, 0.5, 0.25, 0.1]) {
        const lodLevels = [];
        
        for (let i = 0; i < levels.length; i++) {
            const ratio = levels[i];
            let geometry;
            
            if (ratio === 1.0) {
                geometry = originalGeometry;
            } else {
                geometry = this.simplifyGeometry(originalGeometry, ratio);
            }
            
            lodLevels.push({
                distance: i * 50, // 50米间隔
                geometry: geometry,
                ratio: ratio
            });
        }
        
        return lodLevels;
    }
    
    static simplifyGeometry(geometry, ratio) {
        // 简单的面数减少算法
        const targetTriangleCount = Math.floor(geometry.indices.length / 3 * ratio);
        
        if (targetTriangleCount >= geometry.indices.length / 3) {
            return geometry;
        }
        
        // 这里实现几何体简化算法
        // 可以使用边塌陷或其他网格简化技术
        return this.edgeCollapseSimplification(geometry, targetTriangleCount);
    }
    
    static edgeCollapseSimplification(geometry, targetTriangleCount) {
        // 简化的边塌陷算法实现
        const vertices = [...geometry.vertices];
        const indices = [...geometry.indices];
        const edges = this.buildEdgeList(indices);
        
        // 计算每条边的塌陷代价
        const edgeCosts = this.calculateEdgeCosts(vertices, edges);
        
        let currentTriangleCount = indices.length / 3;
        
        while (currentTriangleCount > targetTriangleCount && edges.length > 0) {
            // 找到代价最小的边
            let minCostIndex = 0;
            let minCost = edgeCosts[0];
            
            for (let i = 1; i < edgeCosts.length; i++) {
                if (edgeCosts[i] < minCost) {
                    minCost = edgeCosts[i];
                    minCostIndex = i;
                }
            }
            
            // 塌陷边
            const edge = edges[minCostIndex];
            this.collapseEdge(vertices, indices, edge);
            
            // 移除已处理的边
            edges.splice(minCostIndex, 1);
            edgeCosts.splice(minCostIndex, 1);
            
            currentTriangleCount = indices.length / 3;
        }
        
        return {
            vertices: vertices,
            indices: indices,
            normals: this.recalculateNormals(vertices, indices)
        };
    }
    
    static buildEdgeList(indices) {
        const edges = [];
        const edgeSet = new Set();
        
        for (let i = 0; i < indices.length; i += 3) {
            const v0 = indices[i];
            const v1 = indices[i + 1];
            const v2 = indices[i + 2];
            
            const edges_tri = [
                [v0, v1], [v1, v2], [v2, v0]
            ];
            
            for (const edge of edges_tri) {
                const key = `${Math.min(edge[0], edge[1])}-${Math.max(edge[0], edge[1])}`;
                if (!edgeSet.has(key)) {
                    edges.push(edge);
                    edgeSet.add(key);
                }
            }
        }
        
        return edges;
    }
    
    static calculateEdgeCosts(vertices, edges) {
        // 简单的边长度作为代价
        return edges.map(edge => {
            const v0 = [vertices[edge[0] * 3], vertices[edge[0] * 3 + 1], vertices[edge[0] * 3 + 2]];
            const v1 = [vertices[edge[1] * 3], vertices[edge[1] * 3 + 1], vertices[edge[1] * 3 + 2]];
            return vec3.distance(v0, v1);
        });
    }
}
```

### 11.4 空间分割和剔除

高效的空间数据结构是大规模场景渲染的关键。

#### 11.4.1 八叉树实现

```javascript
// 八叉树节点
class OctreeNode {
    constructor(center, size, maxDepth = 8, currentDepth = 0) {
        this.center = center;
        this.size = size;
        this.maxDepth = maxDepth;
        this.currentDepth = currentDepth;
        
        this.objects = [];
        this.children = null;
        this.isLeaf = true;
        
        this.bounds = this.calculateBounds();
    }
    
    calculateBounds() {
        const halfSize = this.size / 2;
        return {
            min: [
                this.center[0] - halfSize,
                this.center[1] - halfSize,
                this.center[2] - halfSize
            ],
            max: [
                this.center[0] + halfSize,
                this.center[1] + halfSize,
                this.center[2] + halfSize
            ]
        };
    }
    
    insert(object) {
        if (!this.containsObject(object)) {
            return false;
        }
        
        if (this.isLeaf) {
            this.objects.push(object);
            
            // 检查是否需要细分
            if (this.objects.length > 8 && this.currentDepth < this.maxDepth) {
                this.subdivide();
            }
            
            return true;
        } else {
            // 尝试插入到子节点
            for (const child of this.children) {
                if (child.insert(object)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    subdivide() {
        if (!this.isLeaf) return;
        
        this.children = [];
        this.isLeaf = false;
        
        const childSize = this.size / 2;
        const quarterSize = childSize / 2;
        
        // 创建8个子节点
        const offsets = [
            [-quarterSize, -quarterSize, -quarterSize],
            [quarterSize, -quarterSize, -quarterSize],
            [-quarterSize, quarterSize, -quarterSize],
            [quarterSize, quarterSize, -quarterSize],
            [-quarterSize, -quarterSize, quarterSize],
            [quarterSize, -quarterSize, quarterSize],
            [-quarterSize, quarterSize, quarterSize],
            [quarterSize, quarterSize, quarterSize]
        ];
        
        for (const offset of offsets) {
            const childCenter = [
                this.center[0] + offset[0],
                this.center[1] + offset[1],
                this.center[2] + offset[2]
            ];
            
            const child = new OctreeNode(childCenter, childSize, 
                                       this.maxDepth, this.currentDepth + 1);
            this.children.push(child);
        }
        
        // 重新分配对象到子节点
        for (const object of this.objects) {
            for (const child of this.children) {
                if (child.insert(object)) {
                    break;
                }
            }
        }
        
        this.objects = [];
    }
    
    containsObject(object) {
        const pos = object.position;
        const bounds = this.bounds;
        
        return pos[0] >= bounds.min[0] && pos[0] <= bounds.max[0] &&
               pos[1] >= bounds.min[1] && pos[1] <= bounds.max[1] &&
               pos[2] >= bounds.min[2] && pos[2] <= bounds.max[2];
    }
    
    query(frustum, results = []) {
        if (!frustum.intersectsBounds(this.bounds)) {
            return results;
        }
        
        if (this.isLeaf) {
            for (const object of this.objects) {
                if (frustum.containsPoint(object.position)) {
                    results.push(object);
                }
            }
        } else {
            for (const child of this.children) {
                child.query(frustum, results);
            }
        }
        
        return results;
    }
}

// 八叉树管理器
class Octree {
    constructor(center, size, maxDepth = 8) {
        this.root = new OctreeNode(center, size, maxDepth);
    }
    
    insert(object) {
        return this.root.insert(object);
    }
    
    queryFrustum(frustum) {
        return this.root.query(frustum);
    }
    
    clear() {
        this.root = new OctreeNode(this.root.center, this.root.size, this.root.maxDepth);
    }
}
```

### 11.5 实践案例：大规模森林渲染

```javascript
// 大规模森林渲染系统
class ForestRenderer {
    constructor(gl, terrainSize = 1000) {
        this.gl = gl;
        this.terrainSize = terrainSize;
        
        this.octree = new Octree([0, 0, 0], terrainSize);
        this.lodManager = new LODManager();
        this.instancedRenderer = new InstancedRenderer(gl, this.createTreeGeometry());
        
        this.generateForest();
        this.setupLOD();
    }
    
    generateForest() {
        const treeCount = 10000;
        this.trees = [];
        
        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * this.terrainSize;
            const z = (Math.random() - 0.5) * this.terrainSize;
            const y = this.getTerrainHeight(x, z);
            
            // 使用噪声函数确定树的分布
            if (this.getTreeDensity(x, z) > 0.3) {
                const scale = 0.8 + Math.random() * 0.4;
                const rotation = Math.random() * Math.PI * 2;
                
                const tree = {
                    position: [x, y, z],
                    scale: [scale, scale, scale],
                    rotation: [0, rotation, 0],
                    type: Math.floor(Math.random() * 3), // 不同类型的树
                    visible: false
                };
                
                this.trees.push(tree);
                this.octree.insert(tree);
            }
        }
    }
    
    getTreeDensity(x, z) {
        // 使用Perlin噪声创建自然的树木分布
        const noise1 = this.noise(x * 0.01, z * 0.01) * 0.5 + 0.5;
        const noise2 = this.noise(x * 0.005, z * 0.005) * 0.3 + 0.7;
        return noise1 * noise2;
    }
    
    setupLOD() {
        // 为不同类型的树创建LOD层级
        this.treeLODs = {
            0: this.createTreeLODs('oak'),
            1: this.createTreeLODs('pine'),
            2: this.createTreeLODs('birch')
        };
    }
    
    createTreeLODs(treeType) {
        return [
            { distance: 0,   geometry: this.createDetailedTree(treeType), instances: [] },
            { distance: 50,  geometry: this.createMediumTree(treeType), instances: [] },
            { distance: 100, geometry: this.createLowPolyTree(treeType), instances: [] },
            { distance: 200, geometry: this.createBillboardTree(treeType), instances: [] }
        ];
    }
    
    update(camera) {
        // 使用八叉树进行视锥剔除
        const frustum = new Frustum();
        frustum.setFromCamera(camera);
        
        const visibleTrees = this.octree.queryFrustum(frustum);
        
        // 重置所有LOD实例
        for (const treeType in this.treeLODs) {
            for (const lod of this.treeLODs[treeType]) {
                lod.instances = [];
            }
        }
        
        // 分配可见树到适当的LOD级别
        for (const tree of visibleTrees) {
            const distance = vec3.distance(camera.position, tree.position);
            const lodLevel = this.calculateLODLevel(distance);
            
            if (lodLevel >= 0) {
                const lods = this.treeLODs[tree.type];
                if (lods && lods[lodLevel]) {
                    lods[lodLevel].instances.push(tree);
                }
            }
        }
    }
    
    calculateLODLevel(distance) {
        if (distance < 50) return 0;      // 高细节
        if (distance < 100) return 1;     // 中细节
        if (distance < 200) return 2;     // 低细节
        if (distance < 400) return 3;     // 广告牌
        return -1;                        // 不渲染
    }
    
    render(viewMatrix, projectionMatrix) {
        const gl = this.gl;
        
        // 渲染不同LOD级别的树
        for (const treeType in this.treeLODs) {
            for (let i = 0; i < this.treeLODs[treeType].length; i++) {
                const lod = this.treeLODs[treeType][i];
                
                if (lod.instances.length > 0) {
                    this.renderLODLevel(lod, viewMatrix, projectionMatrix);
                }
            }
        }
    }
    
    renderLODLevel(lod, viewMatrix, projectionMatrix) {
        // 使用实例化渲染批量绘制相同LOD的树
        this.instancedRenderer.clear();
        
        for (const tree of lod.instances) {
            const transform = this.createTransformMatrix(tree);
            const color = this.getTreeColor(tree);
            this.instancedRenderer.addInstance(transform, color);
        }
        
        this.instancedRenderer.render(viewMatrix, projectionMatrix);
    }
    
    createTransformMatrix(tree) {
        const transform = mat4.create();
        mat4.translate(transform, transform, tree.position);
        mat4.rotateY(transform, transform, tree.rotation[1]);
        mat4.scale(transform, transform, tree.scale);
        return transform;
    }
    
    getTreeColor(tree) {
        // 根据季节、类型等返回不同颜色
        const baseColors = [
            [0.2, 0.8, 0.2, 1.0], // 橡树
            [0.1, 0.6, 0.1, 1.0], // 松树
            [0.3, 0.9, 0.3, 1.0]  // 桦树
        ];
        
        return baseColors[tree.type] || baseColors[0];
    }
    
    // 工具函数
    noise(x, y) {
        // 简单的2D噪声函数
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }
    
    getTerrainHeight(x, z) {
        return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 10;
    }
}

// 使用示例
const canvas = document.getElementById('forestCanvas');
const gl = canvas.getContext('webgl2');
const forestRenderer = new ForestRenderer(gl, 1000);

function animate() {
    forestRenderer.update(camera);
    forestRenderer.render(camera.getViewMatrix(), camera.getProjectionMatrix());
    requestAnimationFrame(animate);
}

animate();
```

## 🎯 性能优化策略

### GPU实例化优化
```javascript
// 批量更新实例数据
class BatchedInstanceUpdater {
    constructor(gl, maxInstances) {
        this.gl = gl;
        this.maxInstances = maxInstances;
        this.pendingUpdates = [];
        this.updateBuffer = new Float32Array(maxInstances * 20);
    }
    
    scheduleUpdate(instanceId, transform, color) {
        this.pendingUpdates.push({ instanceId, transform, color });
    }
    
    flushUpdates() {
        if (this.pendingUpdates.length === 0) return;
        
        // 批量更新缓冲区
        for (const update of this.pendingUpdates) {
            const offset = update.instanceId * 20;
            this.updateBuffer.set(update.transform, offset);
            this.updateBuffer.set(update.color, offset + 16);
        }
        
        // 一次性上传到GPU
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.updateBuffer);
        
        this.pendingUpdates = [];
    }
}
```

## ✅ 学习检查点

完成本章学习后，您应该能够：

- [ ] 实现硬件实例化渲染系统
- [ ] 使用几何着色器生成动态几何体
- [ ] 构建自适应LOD系统
- [ ] 实现空间分割和视锥剔除
- [ ] 优化大规模场景的渲染性能
- [ ] 处理复杂的几何体数据流

## 🚀 下一步

掌握了几何处理技术后，接下来学习[第12章：后处理效果](12-post-processing.md)，了解如何通过后处理技术进一步提升渲染质量。

几何处理是3D渲染优化的核心技术，建议您创建一个大规模场景项目来实践这些技术，如城市渲染、森林场景或粒子系统。 