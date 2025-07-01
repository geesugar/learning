# 变换与矩阵

## 📖 本章概述

变换与矩阵是 3D 图形编程的核心，它们决定了 3D 对象在空间中的位置、旋转和大小。本章将详细介绍模型-视图-投影（MVP）变换系统，帮助您构建完整的 3D 场景。

## 🎯 学习目标

- 理解 3D 变换的数学原理
- 掌握模型-视图-投影（MVP）变换系统  
- 学会构建和使用变换矩阵
- 能够实现相机系统和视图控制
- 掌握坐标系统之间的转换关系

## 1. 变换基础概念

### 1.1 什么是变换？

**变换（Transform）** 是将一个坐标系中的点映射到另一个坐标系中的数学操作。在 3D 图形中，我们使用矩阵来表示和计算变换。

### 1.2 基本变换类型

#### 平移变换（Translation）
移动对象的位置，不改变大小和方向：

```javascript
// 平移矩阵
function createTranslationMatrix(tx, ty, tz) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1
    ];
}

// 使用示例
const translateMatrix = createTranslationMatrix(2.0, 1.0, -3.0);
```

#### 旋转变换（Rotation）
绕某个轴旋转对象：

```javascript
// 绕 Y 轴旋转
function createRotationYMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return [
        c,  0, s, 0,
        0,  1, 0, 0,
        -s, 0, c, 0,
        0,  0, 0, 1
    ];
}

// 绕 X 轴旋转
function createRotationXMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return [
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1
    ];
}

// 绕 Z 轴旋转
function createRotationZMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return [
        c, -s, 0, 0,
        s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
    ];
}
```

#### 缩放变换（Scale）
改变对象的大小：

```javascript
function createScaleMatrix(sx, sy, sz) {
    return [
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1
    ];
}

// 统一缩放
const uniformScale = createScaleMatrix(2.0, 2.0, 2.0);

// 非统一缩放
const nonUniformScale = createScaleMatrix(1.0, 2.0, 0.5);
```

### 1.3 变换组合

```javascript
// 矩阵乘法函数
function multiplyMatrices(a, b) {
    const result = new Array(16);
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = 0;
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    
    return result;
}

// 变换组合示例
function createModelMatrix(translation, rotation, scale) {
    const T = createTranslationMatrix(...translation);
    const R = createRotationYMatrix(rotation);
    const S = createScaleMatrix(...scale);
    
    // 注意：变换顺序是 T * R * S（先缩放，再旋转，最后平移）
    return multiplyMatrices(T, multiplyMatrices(R, S));
}
```

## 2. MVP 变换系统

### 2.1 坐标空间层次

```
局部空间 (Local Space)
    ↓ [模型矩阵]
世界空间 (World Space)  
    ↓ [视图矩阵]
视图空间 (View Space)
    ↓ [投影矩阵]
裁剪空间 (Clip Space)
    ↓ [透视除法]
标准化设备坐标 (NDC)
    ↓ [视口变换]
屏幕空间 (Screen Space)
```

### 2.2 模型矩阵（Model Matrix）

将顶点从局部空间变换到世界空间：

```javascript
class Transform {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];  // 欧拉角（度）
        this.scale = [1, 1, 1];
    }
    
    getMatrix() {
        // 转换为弧度
        const rx = this.rotation[0] * Math.PI / 180;
        const ry = this.rotation[1] * Math.PI / 180;
        const rz = this.rotation[2] * Math.PI / 180;
        
        // 创建基本变换矩阵
        const T = createTranslationMatrix(...this.position);
        const Rx = createRotationXMatrix(rx);
        const Ry = createRotationYMatrix(ry);
        const Rz = createRotationZMatrix(rz);
        const S = createScaleMatrix(...this.scale);
        
        // 组合变换：T * Ry * Rx * Rz * S
        const R = multiplyMatrices(Ry, multiplyMatrices(Rx, Rz));
        const RS = multiplyMatrices(R, S);
        
        return multiplyMatrices(T, RS);
    }
}

// 使用示例
const cubeTransform = new Transform();
cubeTransform.position = [2, 1, -5];
cubeTransform.rotation = [0, 45, 0];
cubeTransform.scale = [1.5, 1.5, 1.5];

const modelMatrix = cubeTransform.getMatrix();
```

### 2.3 视图矩阵（View Matrix）

将顶点从世界空间变换到视图空间（相机空间）：

```javascript
class Camera {
    constructor() {
        this.position = [0, 0, 5];     // 相机位置
        this.target = [0, 0, 0];       // 观察目标
        this.up = [0, 1, 0];           // 上方向
    }
    
    getViewMatrix() {
        return createLookAtMatrix(this.position, this.target, this.up);
    }
}

function createLookAtMatrix(eye, target, up) {
    // 计算相机的局部坐标系
    const zAxis = normalize(vectorSubtract(eye, target));  // 向后
    const xAxis = normalize(crossProduct(up, zAxis));      // 向右
    const yAxis = crossProduct(zAxis, xAxis);              // 向上
    
    // 创建视图矩阵
    return [
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dotProduct(xAxis, eye), -dotProduct(yAxis, eye), -dotProduct(zAxis, eye), 1
    ];
}

// 向量运算辅助函数
function vectorSubtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function crossProduct(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
}
```

### 2.4 投影矩阵（Projection Matrix）

将顶点从视图空间变换到裁剪空间：

#### 透视投影
```javascript
function createPerspectiveMatrix(fovY, aspect, near, far) {
    const fovYRadians = fovY * Math.PI / 180;
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovYRadians);
    const rangeInv = 1.0 / (near - far);
    
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}

// 使用示例
const projectionMatrix = createPerspectiveMatrix(
    45,        // 视角 45 度
    800 / 600, // 宽高比
    0.1,       // 近裁剪面
    100.0      // 远裁剪面
);
```

#### 正交投影
```javascript
function createOrthographicMatrix(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    
    return [
        -2 * lr, 0, 0, 0,
        0, -2 * bt, 0, 0,
        0, 0, 2 * nf, 0,
        (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1,
    ];
}
```

### 2.5 MVP 矩阵组合

```javascript
class Camera {
    constructor(canvas) {
        this.position = [0, 0, 5];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.fov = 45;
        this.near = 0.1;
        this.far = 100;
        this.canvas = canvas;
    }
    
    getViewMatrix() {
        return createLookAtMatrix(this.position, this.target, this.up);
    }
    
    getProjectionMatrix() {
        const aspect = this.canvas.width / this.canvas.height;
        return createPerspectiveMatrix(this.fov, aspect, this.near, this.far);
    }
    
    getViewProjectionMatrix() {
        const view = this.getViewMatrix();
        const projection = this.getProjectionMatrix();
        return multiplyMatrices(projection, view);
    }
}

// 在渲染中使用
function render() {
    const modelMatrix = transform.getMatrix();
    const viewProjectionMatrix = camera.getViewProjectionMatrix();
    const mvpMatrix = multiplyMatrices(viewProjectionMatrix, modelMatrix);
    
    // 传递给着色器
    const mvpLocation = gl.getUniformLocation(program, 'u_mvpMatrix');
    gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
    
    // 绘制
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
}
```

## 3. 相机系统

### 3.1 轨道相机（Orbit Camera）

```javascript
class OrbitCamera {
    constructor(canvas) {
        this.canvas = canvas;
        this.target = [0, 0, 0];      // 观察目标
        this.distance = 5;            // 到目标的距离
        this.phi = 0;                 // 水平角度
        this.theta = Math.PI / 4;     // 垂直角度
        this.up = [0, 1, 0];
        
        this.setupControls();
    }
    
    getPosition() {
        const x = this.target[0] + this.distance * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.target[1] + this.distance * Math.cos(this.theta);
        const z = this.target[2] + this.distance * Math.sin(this.theta) * Math.sin(this.phi);
        
        return [x, y, z];
    }
    
    getViewMatrix() {
        const position = this.getPosition();
        return createLookAtMatrix(position, this.target, this.up);
    }
    
    setupControls() {
        let isRotating = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isRotating = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isRotating) return;
            
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            this.phi += deltaX * 0.01;
            this.theta = Math.max(0.1, Math.min(Math.PI - 0.1, this.theta + deltaY * 0.01));
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isRotating = false;
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            this.distance = Math.max(1, Math.min(50, this.distance + e.deltaY * 0.01));
            e.preventDefault();
        });
    }
}
```

### 3.2 第一人称相机

```javascript
class FirstPersonCamera {
    constructor(canvas) {
        this.canvas = canvas;
        this.position = [0, 0, 5];
        this.yaw = 0;           // 左右转向
        this.pitch = 0;         // 上下俯仰
        this.speed = 5.0;       // 移动速度
        this.sensitivity = 0.002; // 鼠标灵敏度
        
        this.keys = {};
        this.setupControls();
    }
    
    getDirection() {
        const x = Math.cos(this.pitch) * Math.cos(this.yaw);
        const y = Math.sin(this.pitch);
        const z = Math.cos(this.pitch) * Math.sin(this.yaw);
        
        return normalize([x, y, z]);
    }
    
    getViewMatrix() {
        const direction = this.getDirection();
        const target = [
            this.position[0] + direction[0],
            this.position[1] + direction[1],
            this.position[2] + direction[2]
        ];
        
        return createLookAtMatrix(this.position, target, [0, 1, 0]);
    }
    
    update(deltaTime) {
        const direction = this.getDirection();
        const right = normalize(crossProduct(direction, [0, 1, 0]));
        const moveSpeed = this.speed * deltaTime;
        
        if (this.keys['KeyW']) {
            this.position[0] += direction[0] * moveSpeed;
            this.position[2] += direction[2] * moveSpeed;
        }
        if (this.keys['KeyS']) {
            this.position[0] -= direction[0] * moveSpeed;
            this.position[2] -= direction[2] * moveSpeed;
        }
        if (this.keys['KeyA']) {
            this.position[0] -= right[0] * moveSpeed;
            this.position[2] -= right[2] * moveSpeed;
        }
        if (this.keys['KeyD']) {
            this.position[0] += right[0] * moveSpeed;
            this.position[2] += right[2] * moveSpeed;
        }
    }
    
    setupControls() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 鼠标控制
        let isLocked = false;
        
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            isLocked = document.pointerLockElement === this.canvas;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isLocked) return;
            
            this.yaw += e.movementX * this.sensitivity;
            this.pitch -= e.movementY * this.sensitivity;
            
            // 限制俯仰角
            this.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.pitch));
        });
    }
}
```

## 4. 高级变换技术

### 4.1 四元数旋转

```javascript
class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    
    // 从轴角创建四元数
    static fromAxisAngle(axis, angle) {
        const halfAngle = angle * 0.5;
        const s = Math.sin(halfAngle);
        
        return new Quaternion(
            axis[0] * s,
            axis[1] * s,
            axis[2] * s,
            Math.cos(halfAngle)
        );
    }
    
    // 四元数乘法
    multiply(q) {
        return new Quaternion(
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        );
    }
    
    // 转换为旋转矩阵
    toMatrix() {
        const x2 = this.x * 2;
        const y2 = this.y * 2;
        const z2 = this.z * 2;
        const xx = this.x * x2;
        const xy = this.x * y2;
        const xz = this.x * z2;
        const yy = this.y * y2;
        const yz = this.y * z2;
        const zz = this.z * z2;
        const wx = this.w * x2;
        const wy = this.w * y2;
        const wz = this.w * z2;
        
        return [
            1 - (yy + zz), xy - wz,     xz + wy,     0,
            xy + wz,       1 - (xx + zz), yz - wx,     0,
            xz - wy,       yz + wx,     1 - (xx + yy), 0,
            0,             0,           0,             1
        ];
    }
    
    // 球面线性插值
    static slerp(q1, q2, t) {
        let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
        
        if (dot < 0) {
            q2 = new Quaternion(-q2.x, -q2.y, -q2.z, -q2.w);
            dot = -dot;
        }
        
        if (dot > 0.9995) {
            // 线性插值
            return new Quaternion(
                q1.x + t * (q2.x - q1.x),
                q1.y + t * (q2.y - q1.y),
                q1.z + t * (q2.z - q1.z),
                q1.w + t * (q2.w - q1.w)
            );
        }
        
        const theta = Math.acos(dot);
        const sinTheta = Math.sin(theta);
        const factor1 = Math.sin((1 - t) * theta) / sinTheta;
        const factor2 = Math.sin(t * theta) / sinTheta;
        
        return new Quaternion(
            q1.x * factor1 + q2.x * factor2,
            q1.y * factor1 + q2.y * factor2,
            q1.z * factor1 + q2.z * factor2,
            q1.w * factor1 + q2.w * factor2
        );
    }
}
```

### 4.2 变换层次结构

```javascript
class SceneNode {
    constructor() {
        this.localTransform = new Transform();
        this.parent = null;
        this.children = [];
    }
    
    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }
    
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children[index].parent = null;
            this.children.splice(index, 1);
        }
    }
    
    getWorldMatrix() {
        const localMatrix = this.localTransform.getMatrix();
        
        if (this.parent) {
            const parentMatrix = this.parent.getWorldMatrix();
            return multiplyMatrices(parentMatrix, localMatrix);
        }
        
        return localMatrix;
    }
    
    update(deltaTime) {
        // 更新自身
        this.onUpdate(deltaTime);
        
        // 更新子节点
        for (const child of this.children) {
            child.update(deltaTime);
        }
    }
    
    render(camera, renderer) {
        const worldMatrix = this.getWorldMatrix();
        const mvpMatrix = multiplyMatrices(camera.getViewProjectionMatrix(), worldMatrix);
        
        // 渲染自身
        this.onRender(mvpMatrix, renderer);
        
        // 渲染子节点
        for (const child of this.children) {
            child.render(camera, renderer);
        }
    }
    
    onUpdate(deltaTime) {
        // 子类重写
    }
    
    onRender(mvpMatrix, renderer) {
        // 子类重写
    }
}

// 使用示例：太阳系
class SolarSystem {
    constructor() {
        this.root = new SceneNode();
        
        // 太阳
        this.sun = new SceneNode();
        this.sun.localTransform.scale = [2, 2, 2];
        this.root.addChild(this.sun);
        
        // 地球轨道
        this.earthOrbit = new SceneNode();
        this.sun.addChild(this.earthOrbit);
        
        // 地球
        this.earth = new SceneNode();
        this.earth.localTransform.position = [5, 0, 0];
        this.earthOrbit.addChild(this.earth);
        
        // 月球轨道
        this.moonOrbit = new SceneNode();
        this.earth.addChild(this.moonOrbit);
        
        // 月球
        this.moon = new SceneNode();
        this.moon.localTransform.position = [1.5, 0, 0];
        this.moon.localTransform.scale = [0.3, 0.3, 0.3];
        this.moonOrbit.addChild(this.moon);
    }
    
    update(deltaTime) {
        // 旋转动画
        this.sun.localTransform.rotation[1] += 30 * deltaTime;
        this.earthOrbit.localTransform.rotation[1] += 50 * deltaTime;
        this.earth.localTransform.rotation[1] += 200 * deltaTime;
        this.moonOrbit.localTransform.rotation[1] += 300 * deltaTime;
        
        this.root.update(deltaTime);
    }
    
    render(camera, renderer) {
        this.root.render(camera, renderer);
    }
}
```

## 5. 实践示例

### 5.1 基础变换演示

```javascript
// 创建变换演示
class TransformDemo {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.cube = createCube(gl);
        this.camera = new OrbitCamera(gl.canvas);
        
        this.transforms = [
            { position: [-2, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { position: [0, 0, 0], rotation: [45, 45, 0], scale: [1, 1, 1] },
            { position: [2, 0, 0], rotation: [0, 0, 0], scale: [1.5, 0.5, 1] }
        ];
    }
    
    render() {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        
        const viewProjectionMatrix = this.camera.getViewProjectionMatrix();
        
        this.transforms.forEach((transform, index) => {
            const modelMatrix = createModelMatrix(
                transform.position,
                transform.rotation[1] + Date.now() * 0.001,
                transform.scale
            );
            
            const mvpMatrix = multiplyMatrices(viewProjectionMatrix, modelMatrix);
            
            const mvpLocation = gl.getUniformLocation(this.program, 'u_mvpMatrix');
            gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
            
            // 设置颜色
            const colors = [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]];
            const colorLocation = gl.getUniformLocation(this.program, 'u_color');
            gl.uniform4fv(colorLocation, colors[index]);
            
            this.cube.draw();
        });
    }
}
```

### 5.2 相机控制演示

```javascript
// HTML
`
<div class="camera-controls">
    <button id="orbit-camera">轨道相机</button>
    <button id="fps-camera">第一人称相机</button>
    <div class="camera-info">
        <div>位置: <span id="camera-position"></span></div>
        <div>目标: <span id="camera-target"></span></div>
    </div>
</div>
`;

// JavaScript
class CameraDemo {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.scene = createScene();
        
        this.orbitCamera = new OrbitCamera(gl.canvas);
        this.fpsCamera = new FirstPersonCamera(gl.canvas);
        this.currentCamera = this.orbitCamera;
        
        this.setupUI();
    }
    
    setupUI() {
        document.getElementById('orbit-camera').addEventListener('click', () => {
            this.currentCamera = this.orbitCamera;
        });
        
        document.getElementById('fps-camera').addEventListener('click', () => {
            this.currentCamera = this.fpsCamera;
        });
    }
    
    update(deltaTime) {
        this.currentCamera.update(deltaTime);
        
        // 更新UI
        const pos = this.currentCamera.position || this.currentCamera.getPosition();
        document.getElementById('camera-position').textContent = 
            `${pos[0].toFixed(2)}, ${pos[1].toFixed(2)}, ${pos[2].toFixed(2)}`;
    }
    
    render() {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        
        this.scene.render(this.currentCamera);
    }
}
```

## 6. 性能优化

### 6.1 矩阵缓存

```javascript
class OptimizedTransform {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        
        this._matrix = null;
        this._isDirty = true;
    }
    
    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this._isDirty = true;
    }
    
    setRotation(x, y, z) {
        this.rotation[0] = x;
        this.rotation[1] = y;
        this.rotation[2] = z;
        this._isDirty = true;
    }
    
    getMatrix() {
        if (this._isDirty) {
            this._matrix = this._calculateMatrix();
            this._isDirty = false;
        }
        
        return this._matrix;
    }
    
    _calculateMatrix() {
        const T = createTranslationMatrix(...this.position);
        const R = this._createRotationMatrix();
        const S = createScaleMatrix(...this.scale);
        
        return multiplyMatrices(T, multiplyMatrices(R, S));
    }
}
```

### 6.2 矩阵池

```javascript
class MatrixPool {
    constructor(size = 100) {
        this.pool = [];
        this.index = 0;
        
        for (let i = 0; i < size; i++) {
            this.pool.push(new Float32Array(16));
        }
    }
    
    getMatrix() {
        const matrix = this.pool[this.index];
        this.index = (this.index + 1) % this.pool.length;
        return matrix;
    }
    
    createMVPMatrix(model, view, projection) {
        const temp = this.getMatrix();
        const mvp = this.getMatrix();
        
        multiplyMatricesInPlace(view, model, temp);
        multiplyMatricesInPlace(projection, temp, mvp);
        
        return mvp;
    }
}

function multiplyMatricesInPlace(a, b, result) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = 0;
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
}
```

## 7. 常见问题和解决方案

### 7.1 变换顺序问题

```javascript
// 错误：旋转后平移（对象会绕原点旋转）
const wrongMatrix = multiplyMatrices(
    createRotationYMatrix(angle),
    createTranslationMatrix(x, y, z)
);

// 正确：先平移再旋转
const correctMatrix = multiplyMatrices(
    createTranslationMatrix(x, y, z),
    createRotationYMatrix(angle)
);
```

### 7.2 万向节锁问题

```javascript
// 使用四元数避免万向节锁
class QuaternionTransform {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = new Quaternion();
        this.scale = [1, 1, 1];
    }
    
    rotate(axis, angle) {
        const q = Quaternion.fromAxisAngle(axis, angle);
        this.rotation = this.rotation.multiply(q);
    }
    
    getMatrix() {
        const T = createTranslationMatrix(...this.position);
        const R = this.rotation.toMatrix();
        const S = createScaleMatrix(...this.scale);
        
        return multiplyMatrices(T, multiplyMatrices(R, S));
    }
}
```

### 7.3 精度问题

```javascript
// 使用双精度计算，单精度存储
class PreciseTransform {
    constructor() {
        this.position = new Float64Array([0, 0, 0]);
        this.rotation = new Float64Array([0, 0, 0]);
        this.scale = new Float64Array([1, 1, 1]);
    }
    
    getMatrix() {
        // 使用双精度计算
        const matrix = this._calculateMatrixFloat64();
        
        // 转换为单精度传递给GPU
        return new Float32Array(matrix);
    }
}
```

## 8. 章节总结

通过本章学习，您应该已经：

- ✅ 理解了 3D 变换的数学原理
- ✅ 掌握了 MVP 变换系统的实现
- ✅ 学会了构建不同类型的相机系统
- ✅ 了解了高级变换技术和优化方法
- ✅ 能够创建复杂的 3D 场景

## 🔗 下一步

现在您已经掌握了 WebGL 的核心概念，接下来将进入 [图形渲染阶段](../03-graphics/README.md)，学习：

- 光照模型和光照计算
- 纹理系统和材质制作  
- PBR 渲染技术
- 阴影和特效

**准备好创建更加真实的 3D 场景了吗？让我们继续前进！** 🚀