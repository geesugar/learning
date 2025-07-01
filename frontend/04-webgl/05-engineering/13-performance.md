# 第13章：性能优化

性能优化是WebGL应用开发的关键环节，直接影响用户体验。本章将深入探讨WebGL性能分析、渲染优化、内存管理和着色器优化等核心技术。

## 🎯 学习目标

- 掌握WebGL性能分析工具和方法
- 理解渲染管线的性能瓶颈
- 实现高效的批处理和剔除技术
- 优化内存使用和垃圾回收
- 掌握着色器性能优化技巧

## 📚 章节内容

### 13.1 性能分析与监控

#### 13.1.1 性能监控系统

```javascript
// 综合性能监控器
class WebGLPerformanceMonitor {
    constructor(gl) {
        this.gl = gl;
        this.metrics = {
            frameTime: [],
            drawCalls: 0,
            triangles: 0,
            vertices: 0,
            textureMemory: 0,
            bufferMemory: 0,
            shaderSwitches: 0,
            stateChanges: 0
        };
        
        this.frameStartTime = 0;
        this.maxSamples = 120; // 2秒历史数据（60fps）
        
        this.setupExtensions();
        this.createUI();
    }
    
    setupExtensions() {
        // 查询GPU时间扩展
        this.timerExt = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
                       this.gl.getExtension('EXT_disjoint_timer_query');
        
        // 内存使用查询扩展
        this.memoryExt = this.gl.getExtension('WEBGL_debug_renderer_info');
        
        if (this.timerExt) {
            this.gpuQueries = [];
            console.log('GPU timing available');
        }
    }
    
    beginFrame() {
        this.frameStartTime = performance.now();
        this.resetFrameMetrics();
        
        // 开始GPU计时
        if (this.timerExt) {
            const query = this.gl.createQuery();
            this.gl.beginQuery(this.timerExt.TIME_ELAPSED_EXT, query);
            this.currentGPUQuery = query;
        }
    }
    
    endFrame() {
        // 结束GPU计时
        if (this.timerExt && this.currentGPUQuery) {
            this.gl.endQuery(this.timerExt.TIME_ELAPSED_EXT);
            this.gpuQueries.push({
                query: this.currentGPUQuery,
                frameIndex: this.frameCount
            });
        }
        
        // 记录CPU帧时间
        const frameTime = performance.now() - this.frameStartTime;
        this.metrics.frameTime.push(frameTime);
        
        if (this.metrics.frameTime.length > this.maxSamples) {
            this.metrics.frameTime.shift();
        }
        
        // 处理已完成的GPU查询
        this.processGPUQueries();
        
        this.updateUI();
        this.frameCount = (this.frameCount || 0) + 1;
    }
    
    resetFrameMetrics() {
        this.metrics.drawCalls = 0;
        this.metrics.triangles = 0;
        this.metrics.vertices = 0;
        this.metrics.shaderSwitches = 0;
        this.metrics.stateChanges = 0;
    }
    
    processGPUQueries() {
        if (!this.timerExt) return;
        
        for (let i = this.gpuQueries.length - 1; i >= 0; i--) {
            const queryInfo = this.gpuQueries[i];
            const available = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT_AVAILABLE);
            
            if (available) {
                const timeElapsed = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT);
                const gpuTime = timeElapsed / 1000000; // 转换为毫秒
                
                this.metrics.gpuTime = gpuTime;
                this.gl.deleteQuery(queryInfo.query);
                this.gpuQueries.splice(i, 1);
            }
        }
    }
    
    // 绘制调用计数
    recordDrawCall(primitiveType, count) {
        this.metrics.drawCalls++;
        
        switch (primitiveType) {
            case this.gl.TRIANGLES:
                this.metrics.triangles += count / 3;
                break;
            case this.gl.TRIANGLE_STRIP:
            case this.gl.TRIANGLE_FAN:
                this.metrics.triangles += Math.max(0, count - 2);
                break;
        }
        
        this.metrics.vertices += count;
    }
    
    recordShaderSwitch() {
        this.metrics.shaderSwitches++;
    }
    
    recordStateChange() {
        this.metrics.stateChanges++;
    }
    
    // 获取性能统计
    getFrameStats() {
        const frameTime = this.metrics.frameTime;
        if (frameTime.length === 0) return null;
        
        const sum = frameTime.reduce((a, b) => a + b, 0);
        const avg = sum / frameTime.length;
        const min = Math.min(...frameTime);
        const max = Math.max(...frameTime);
        
        return {
            fps: 1000 / avg,
            avgFrameTime: avg,
            minFrameTime: min,
            maxFrameTime: max,
            gpuTime: this.metrics.gpuTime || 0,
            drawCalls: this.metrics.drawCalls,
            triangles: this.metrics.triangles,
            vertices: this.metrics.vertices,
            shaderSwitches: this.metrics.shaderSwitches,
            stateChanges: this.metrics.stateChanges
        };
    }
    
    createUI() {
        // 创建性能监控UI
        this.statsElement = document.createElement('div');
        this.statsElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border-radius: 4px;
        `;
        document.body.appendChild(this.statsElement);
    }
    
    updateUI() {
        const stats = this.getFrameStats();
        if (!stats) return;
        
        this.statsElement.innerHTML = `
            FPS: ${stats.fps.toFixed(1)}<br>
            Frame: ${stats.avgFrameTime.toFixed(2)}ms<br>
            GPU: ${stats.gpuTime.toFixed(2)}ms<br>
            Draw Calls: ${stats.drawCalls}<br>
            Triangles: ${Math.floor(stats.triangles)}<br>
            Vertices: ${Math.floor(stats.vertices)}<br>
            Shader Switches: ${stats.shaderSwitches}<br>
            State Changes: ${stats.stateChanges}
        `;
    }
    
    generateReport() {
        const stats = this.getFrameStats();
        const memoryInfo = this.getMemoryInfo();
        
        return {
            performance: stats,
            memory: memoryInfo,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            webglVersion: this.getWebGLVersion()
        };
    }
    
    getMemoryInfo() {
        const info = {};
        
        if (this.memoryExt) {
            info.renderer = this.gl.getParameter(this.memoryExt.UNMASKED_RENDERER_WEBGL);
            info.vendor = this.gl.getParameter(this.memoryExt.UNMASKED_VENDOR_WEBGL);
        }
        
        // 估算纹理内存
        info.estimatedTextureMemory = this.metrics.textureMemory;
        info.estimatedBufferMemory = this.metrics.bufferMemory;
        
        return info;
    }
    
    getWebGLVersion() {
        return this.gl.getParameter(this.gl.VERSION);
    }
}
```

#### 13.1.2 性能分析工具集成

```javascript
// 性能分析器
class PerformanceProfiler {
    constructor() {
        this.profiles = new Map();
        this.activeProfile = null;
        
        this.setupPerformanceObserver();
    }
    
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPerformanceEntry(entry);
                }
            });
            
            observer.observe({ entryTypes: ['measure', 'mark', 'navigation'] });
        }
    }
    
    startProfile(name) {
        const profile = {
            name,
            startTime: performance.now(),
            marks: [],
            measures: [],
            memorySnapshots: []
        };
        
        this.profiles.set(name, profile);
        this.activeProfile = profile;
        
        performance.mark(`${name}-start`);
        this.takeMemorySnapshot(`${name}-start`);
        
        return profile;
    }
    
    endProfile(name) {
        const profile = this.profiles.get(name);
        if (!profile) return null;
        
        profile.endTime = performance.now();
        profile.duration = profile.endTime - profile.startTime;
        
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        this.takeMemorySnapshot(`${name}-end`);
        
        if (this.activeProfile === profile) {
            this.activeProfile = null;
        }
        
        return profile;
    }
    
    mark(label) {
        if (!this.activeProfile) return;
        
        const timestamp = performance.now();
        const markName = `${this.activeProfile.name}-${label}`;
        
        performance.mark(markName);
        
        this.activeProfile.marks.push({
            label,
            timestamp,
            relativeTime: timestamp - this.activeProfile.startTime
        });
        
        this.takeMemorySnapshot(label);
    }
    
    takeMemorySnapshot(label) {
        if (!this.activeProfile) return;
        
        const memoryInfo = this.getMemoryUsage();
        this.activeProfile.memorySnapshots.push({
            label,
            timestamp: performance.now(),
            memory: memoryInfo
        });
    }
    
    getMemoryUsage() {
        const info = {};
        
        // 获取内存信息（如果可用）
        if (performance.memory) {
            info.used = performance.memory.usedJSHeapSize;
            info.total = performance.memory.totalJSHeapSize;
            info.limit = performance.memory.jsHeapSizeLimit;
        }
        
        return info;
    }
    
    processPerformanceEntry(entry) {
        // 处理性能条目，用于详细分析
        console.log(`Performance entry: ${entry.name} - ${entry.duration}ms`);
    }
    
    generateAnalysisReport(profileName) {
        const profile = this.profiles.get(profileName);
        if (!profile) return null;
        
        return {
            profile,
            analysis: {
                totalDuration: profile.duration,
                marksCount: profile.marks.length,
                memoryGrowth: this.calculateMemoryGrowth(profile.memorySnapshots),
                bottlenecks: this.identifyBottlenecks(profile),
                recommendations: this.generateRecommendations(profile)
            }
        };
    }
    
    calculateMemoryGrowth(snapshots) {
        if (snapshots.length < 2) return 0;
        
        const start = snapshots[0].memory.used || 0;
        const end = snapshots[snapshots.length - 1].memory.used || 0;
        
        return end - start;
    }
    
    identifyBottlenecks(profile) {
        const bottlenecks = [];
        
        // 分析标记之间的时间间隔
        for (let i = 1; i < profile.marks.length; i++) {
            const current = profile.marks[i];
            const previous = profile.marks[i - 1];
            const duration = current.relativeTime - previous.relativeTime;
            
            if (duration > 16.67) { // 超过一帧的时间
                bottlenecks.push({
                    phase: `${previous.label} -> ${current.label}`,
                    duration,
                    severity: duration > 33.33 ? 'high' : 'medium'
                });
            }
        }
        
        return bottlenecks;
    }
    
    generateRecommendations(profile) {
        const recommendations = [];
        
        if (profile.duration > 16.67) {
            recommendations.push('Frame time exceeds 16.67ms - consider optimizing render loop');
        }
        
        const memoryGrowth = this.calculateMemoryGrowth(profile.memorySnapshots);
        if (memoryGrowth > 1024 * 1024) { // 1MB
            recommendations.push('Significant memory growth detected - check for memory leaks');
        }
        
        return recommendations;
    }
}
```

### 13.2 渲染优化

#### 13.2.1 批处理系统

```javascript
// 高级批处理系统
class AdvancedBatchRenderer {
    constructor(gl) {
        this.gl = gl;
        this.batches = new Map();
        this.materialBatches = new Map();
        this.geometryBatches = new Map();
        
        this.maxInstancesPerBatch = 1000;
        this.maxVerticesPerBatch = 65536;
        
        this.setupInstancedBuffers();
    }
    
    setupInstancedBuffers() {
        const gl = this.gl;
        
        // 实例变换矩阵缓冲区
        this.instanceMatrixBuffer = gl.createBuffer();
        this.instanceMatrixData = new Float32Array(this.maxInstancesPerBatch * 16);
        
        // 实例颜色缓冲区
        this.instanceColorBuffer = gl.createBuffer();
        this.instanceColorData = new Float32Array(this.maxInstancesPerBatch * 4);
        
        // 实例用户数据缓冲区
        this.instanceDataBuffer = gl.createBuffer();
        this.instanceData = new Float32Array(this.maxInstancesPerBatch * 4);
    }
    
    addObject(object, material, geometry) {
        // 生成批次键
        const batchKey = this.generateBatchKey(material, geometry);
        
        if (!this.batches.has(batchKey)) {
            this.batches.set(batchKey, {
                material,
                geometry,
                instances: [],
                dirty: false
            });
        }
        
        const batch = this.batches.get(batchKey);
        
        if (batch.instances.length < this.maxInstancesPerBatch) {
            batch.instances.push({
                transform: object.getTransformMatrix(),
                color: object.color || [1, 1, 1, 1],
                userData: object.userData || [0, 0, 0, 0]
            });
            batch.dirty = true;
        } else {
            // 创建新批次
            const newKey = `${batchKey}_${this.getBatchIndex(batchKey)}`;
            this.batches.set(newKey, {
                material,
                geometry,
                instances: [{
                    transform: object.getTransformMatrix(),
                    color: object.color || [1, 1, 1, 1],
                    userData: object.userData || [0, 0, 0, 0]
                }],
                dirty: true
            });
        }
    }
    
    generateBatchKey(material, geometry) {
        return `${material.id || 'default'}_${geometry.id || 'default'}`;
    }
    
    getBatchIndex(baseKey) {
        let index = 0;
        while (this.batches.has(`${baseKey}_${index}`)) {
            index++;
        }
        return index;
    }
    
    updateBatchData(batch) {
        if (!batch.dirty) return;
        
        const gl = this.gl;
        const instanceCount = batch.instances.length;
        
        // 更新变换矩阵
        for (let i = 0; i < instanceCount; i++) {
            const instance = batch.instances[i];
            this.instanceMatrixData.set(instance.transform, i * 16);
            this.instanceColorData.set(instance.color, i * 4);
            this.instanceData.set(instance.userData, i * 4);
        }
        
        // 上传到GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
                     this.instanceMatrixData.subarray(0, instanceCount * 16), 
                     gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
                     this.instanceColorData.subarray(0, instanceCount * 4), 
                     gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceDataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
                     this.instanceData.subarray(0, instanceCount * 4), 
                     gl.DYNAMIC_DRAW);
        
        batch.dirty = false;
    }
    
    renderBatches(camera, performanceMonitor) {
        const gl = this.gl;
        let lastMaterial = null;
        let lastGeometry = null;
        
        // 按材质分组渲染
        const sortedBatches = this.sortBatchesByMaterial();
        
        for (const batch of sortedBatches) {
            if (batch.instances.length === 0) continue;
            
            // 材质切换
            if (lastMaterial !== batch.material) {
                batch.material.bind(camera);
                lastMaterial = batch.material;
                if (performanceMonitor) {
                    performanceMonitor.recordShaderSwitch();
                }
            }
            
            // 几何体切换
            if (lastGeometry !== batch.geometry) {
                batch.geometry.bind();
                this.setupInstancedAttributes();
                lastGeometry = batch.geometry;
            }
            
            // 更新批次数据
            this.updateBatchData(batch);
            
            // 渲染
            gl.drawElementsInstanced(
                gl.TRIANGLES,
                batch.geometry.indexCount,
                gl.UNSIGNED_SHORT,
                0,
                batch.instances.length
            );
            
            if (performanceMonitor) {
                performanceMonitor.recordDrawCall(gl.TRIANGLES, 
                    batch.geometry.indexCount * batch.instances.length);
            }
        }
    }
    
    setupInstancedAttributes() {
        const gl = this.gl;
        
        // 变换矩阵属性（4个vec4）
        for (let i = 0; i < 4; i++) {
            const loc = 4 + i; // 假设前4个是标准顶点属性
            gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
            gl.vertexAttribDivisor(loc, 1);
        }
        
        // 颜色属性
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorBuffer);
        gl.enableVertexAttribArray(8);
        gl.vertexAttribPointer(8, 4, gl.FLOAT, false, 16, 0);
        gl.vertexAttribDivisor(8, 1);
        
        // 用户数据属性
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceDataBuffer);
        gl.enableVertexAttribArray(9);
        gl.vertexAttribPointer(9, 4, gl.FLOAT, false, 16, 0);
        gl.vertexAttribDivisor(9, 1);
    }
    
    sortBatchesByMaterial() {
        const batches = Array.from(this.batches.values());
        
        // 按材质ID排序，减少状态切换
        return batches.sort((a, b) => {
            if (a.material.id < b.material.id) return -1;
            if (a.material.id > b.material.id) return 1;
            return 0;
        });
    }
    
    clear() {
        for (const batch of this.batches.values()) {
            batch.instances = [];
            batch.dirty = false;
        }
    }
    
    getStatistics() {
        let totalInstances = 0;
        let totalBatches = 0;
        
        for (const batch of this.batches.values()) {
            if (batch.instances.length > 0) {
                totalInstances += batch.instances.length;
                totalBatches++;
            }
        }
        
        return {
            totalBatches,
            totalInstances,
            avgInstancesPerBatch: totalInstances / Math.max(1, totalBatches)
        };
    }
}
```

#### 13.2.2 视锥剔除系统

```javascript
// 高效视锥剔除系统
class FrustumCullingSystem {
    constructor() {
        this.frustumPlanes = new Array(6);
        this.culledObjects = [];
        this.visibleObjects = [];
        
        // 预分配平面对象
        for (let i = 0; i < 6; i++) {
            this.frustumPlanes[i] = { normal: [0, 0, 0], distance: 0 };
        }
    }
    
    updateFrustum(camera) {
        const viewProjectionMatrix = mat4.multiply([], 
            camera.getProjectionMatrix(), 
            camera.getViewMatrix()
        );
        
        this.extractFrustumPlanes(viewProjectionMatrix);
    }
    
    extractFrustumPlanes(mvpMatrix) {
        const m = mvpMatrix;
        
        // 左平面
        this.setPlane(0, 
            m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]
        );
        
        // 右平面
        this.setPlane(1, 
            m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]
        );
        
        // 底平面
        this.setPlane(2, 
            m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]
        );
        
        // 顶平面
        this.setPlane(3, 
            m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]
        );
        
        // 近平面
        this.setPlane(4, 
            m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]
        );
        
        // 远平面
        this.setPlane(5, 
            m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]
        );
    }
    
    setPlane(index, a, b, c, d) {
        const plane = this.frustumPlanes[index];
        const length = Math.sqrt(a * a + b * b + c * c);
        
        plane.normal[0] = a / length;
        plane.normal[1] = b / length;
        plane.normal[2] = c / length;
        plane.distance = d / length;
    }
    
    cullObjects(objects) {
        this.visibleObjects.length = 0;
        this.culledObjects.length = 0;
        
        for (const object of objects) {
            if (this.isObjectVisible(object)) {
                this.visibleObjects.push(object);
            } else {
                this.culledObjects.push(object);
            }
        }
        
        return {
            visible: this.visibleObjects,
            culled: this.culledObjects
        };
    }
    
    isObjectVisible(object) {
        const bounds = object.getBoundingBox();
        return this.isBoundingBoxVisible(bounds);
    }
    
    isBoundingBoxVisible(bounds) {
        const center = [
            (bounds.min[0] + bounds.max[0]) * 0.5,
            (bounds.min[1] + bounds.max[1]) * 0.5,
            (bounds.min[2] + bounds.max[2]) * 0.5
        ];
        
        const extent = [
            (bounds.max[0] - bounds.min[0]) * 0.5,
            (bounds.max[1] - bounds.min[1]) * 0.5,
            (bounds.max[2] - bounds.min[2]) * 0.5
        ];
        
        // 对每个平面进行测试
        for (const plane of this.frustumPlanes) {
            const distance = 
                plane.normal[0] * center[0] +
                plane.normal[1] * center[1] +
                plane.normal[2] * center[2] +
                plane.distance;
            
            const radius = 
                Math.abs(plane.normal[0] * extent[0]) +
                Math.abs(plane.normal[1] * extent[1]) +
                Math.abs(plane.normal[2] * extent[2]);
            
            if (distance < -radius) {
                return false; // 完全在平面外侧
            }
        }
        
        return true; // 可见或部分可见
    }
    
    isPointVisible(point) {
        for (const plane of this.frustumPlanes) {
            const distance = 
                plane.normal[0] * point[0] +
                plane.normal[1] * point[1] +
                plane.normal[2] * point[2] +
                plane.distance;
            
            if (distance < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    isSphereVisible(center, radius) {
        for (const plane of this.frustumPlanes) {
            const distance = 
                plane.normal[0] * center[0] +
                plane.normal[1] * center[1] +
                plane.normal[2] * center[2] +
                plane.distance;
            
            if (distance < -radius) {
                return false;
            }
        }
        
        return true;
    }
    
    getStatistics() {
        return {
            visibleCount: this.visibleObjects.length,
            culledCount: this.culledObjects.length,
            cullingRatio: this.culledObjects.length / 
                         (this.visibleObjects.length + this.culledObjects.length)
        };
    }
}
```

### 13.3 内存管理优化

#### 13.3.1 资源池系统

```javascript
// 通用资源池
class ResourcePool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.used = new Set();
        
        // 预分配资源
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire() {
        let resource;
        
        if (this.pool.length > 0) {
            resource = this.pool.pop();
        } else {
            resource = this.createFn();
        }
        
        this.used.add(resource);
        return resource;
    }
    
    release(resource) {
        if (this.used.has(resource)) {
            this.used.delete(resource);
            this.resetFn(resource);
            this.pool.push(resource);
        }
    }
    
    releaseAll() {
        for (const resource of this.used) {
            this.resetFn(resource);
            this.pool.push(resource);
        }
        this.used.clear();
    }
    
    getStatistics() {
        return {
            poolSize: this.pool.length,
            usedCount: this.used.size,
            totalAllocated: this.pool.length + this.used.size
        };
    }
}

// WebGL资源管理器
class WebGLResourceManager {
    constructor(gl) {
        this.gl = gl;
        this.resources = new Map();
        
        this.setupResourcePools();
        this.setupCleanupTimer();
    }
    
    setupResourcePools() {
        // 矩阵池
        this.matrixPool = new ResourcePool(
            () => mat4.create(),
            (matrix) => mat4.identity(matrix),
            100
        );
        
        // 向量池
        this.vec3Pool = new ResourcePool(
            () => vec3.create(),
            (vector) => vec3.set(vector, 0, 0, 0),
            200
        );
        
        // 临时数组池
        this.floatArrayPool = new Map();
        this.uint16ArrayPool = new Map();
    }
    
    // 获取临时浮点数组
    getFloatArray(size) {
        if (!this.floatArrayPool.has(size)) {
            this.floatArrayPool.set(size, new ResourcePool(
                () => new Float32Array(size),
                (array) => array.fill(0),
                5
            ));
        }
        
        return this.floatArrayPool.get(size).acquire();
    }
    
    releaseFloatArray(array) {
        const size = array.length;
        if (this.floatArrayPool.has(size)) {
            this.floatArrayPool.get(size).release(array);
        }
    }
    
    // 获取临时Uint16数组
    getUint16Array(size) {
        if (!this.uint16ArrayPool.has(size)) {
            this.uint16ArrayPool.set(size, new ResourcePool(
                () => new Uint16Array(size),
                (array) => array.fill(0),
                5
            ));
        }
        
        return this.uint16ArrayPool.get(size).acquire();
    }
    
    releaseUint16Array(array) {
        const size = array.length;
        if (this.uint16ArrayPool.has(size)) {
            this.uint16ArrayPool.get(size).release(array);
        }
    }
    
    // 矩阵操作
    getMatrix() {
        return this.matrixPool.acquire();
    }
    
    releaseMatrix(matrix) {
        this.matrixPool.release(matrix);
    }
    
    // 向量操作
    getVec3() {
        return this.vec3Pool.acquire();
    }
    
    releaseVec3(vector) {
        this.vec3Pool.release(vector);
    }
    
    // 跟踪WebGL资源
    trackResource(resource, type, size = 0) {
        const id = this.generateResourceId();
        this.resources.set(id, {
            resource,
            type,
            size,
            createdAt: Date.now(),
            lastAccessed: Date.now()
        });
        
        return id;
    }
    
    generateResourceId() {
        return Math.random().toString(36).substring(2, 15);
    }
    
    untrackResource(id) {
        const resourceInfo = this.resources.get(id);
        if (resourceInfo) {
            this.deleteWebGLResource(resourceInfo.resource, resourceInfo.type);
            this.resources.delete(id);
        }
    }
    
    deleteWebGLResource(resource, type) {
        const gl = this.gl;
        
        switch (type) {
            case 'texture':
                gl.deleteTexture(resource);
                break;
            case 'buffer':
                gl.deleteBuffer(resource);
                break;
            case 'framebuffer':
                gl.deleteFramebuffer(resource);
                break;
            case 'renderbuffer':
                gl.deleteRenderbuffer(resource);
                break;
            case 'program':
                gl.deleteProgram(resource);
                break;
            case 'shader':
                gl.deleteShader(resource);
                break;
        }
    }
    
    setupCleanupTimer() {
        // 每30秒清理未使用的资源
        this.cleanupInterval = setInterval(() => {
            this.cleanupUnusedResources();
        }, 30000);
    }
    
    cleanupUnusedResources() {
        const now = Date.now();
        const maxAge = 60000; // 1分钟
        
        for (const [id, resourceInfo] of this.resources.entries()) {
            if (now - resourceInfo.lastAccessed > maxAge) {
                this.untrackResource(id);
            }
        }
        
        // 清理资源池
        this.matrixPool.releaseAll();
        this.vec3Pool.releaseAll();
        
        // 强制垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
    }
    
    getMemoryUsage() {
        let totalSize = 0;
        const breakdown = {};
        
        for (const resourceInfo of this.resources.values()) {
            totalSize += resourceInfo.size;
            breakdown[resourceInfo.type] = (breakdown[resourceInfo.type] || 0) + resourceInfo.size;
        }
        
        return {
            totalSize,
            breakdown,
            resourceCount: this.resources.size
        };
    }
    
    dispose() {
        // 清理所有资源
        for (const id of this.resources.keys()) {
            this.untrackResource(id);
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
```

## 🎯 性能基准测试

### 基准测试框架
```javascript
// 性能基准测试
class PerformanceBenchmark {
    constructor(gl) {
        this.gl = gl;
        this.tests = new Map();
        this.results = [];
    }
    
    addTest(name, testFn, options = {}) {
        this.tests.set(name, {
            fn: testFn,
            iterations: options.iterations || 100,
            warmup: options.warmup || 10,
            description: options.description || ''
        });
    }
    
    async runBenchmark(testName) {
        const test = this.tests.get(testName);
        if (!test) throw new Error(`Test ${testName} not found`);
        
        console.log(`Running benchmark: ${testName}`);
        
        // 预热
        for (let i = 0; i < test.warmup; i++) {
            await test.fn();
        }
        
        // 实际测试
        const times = [];
        for (let i = 0; i < test.iterations; i++) {
            const start = performance.now();
            await test.fn();
            const end = performance.now();
            times.push(end - start);
        }
        
        const result = this.analyzeResults(testName, times);
        this.results.push(result);
        
        return result;
    }
    
    analyzeResults(testName, times) {
        const sorted = times.slice().sort((a, b) => a - b);
        const sum = times.reduce((a, b) => a + b, 0);
        
        return {
            testName,
            iterations: times.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean: sum / times.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            stdDev: this.calculateStdDev(times, sum / times.length)
        };
    }
    
    calculateStdDev(values, mean) {
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }
    
    async runAllTests() {
        const results = [];
        
        for (const testName of this.tests.keys()) {
            const result = await this.runBenchmark(testName);
            results.push(result);
        }
        
        return results;
    }
    
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
            webglVersion: this.gl.getParameter(this.gl.VERSION),
            results: this.results
        };
    }
}
```

## ✅ 学习检查点

完成本章学习后，您应该能够：

- [ ] 使用性能监控工具分析WebGL应用
- [ ] 实现高效的批处理渲染系统
- [ ] 构建视锥剔除和LOD系统
- [ ] 优化内存使用和资源管理
- [ ] 进行性能基准测试和分析
- [ ] 识别和解决性能瓶颈

## 🚀 下一步

完成性能优化学习后，接下来学习[第14章：现代工具链](14-modern-tools.md)，了解如何集成现代开发工具和框架。

性能优化是一个持续的过程，建议您在实际项目中应用这些技术，并根据具体需求进行调整和优化。 