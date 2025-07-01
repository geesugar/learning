# WebGL 数学基础

## 📖 本章概述

3D 图形编程离不开数学，特别是线性代数中的向量和矩阵运算。本章将为您介绍 WebGL 开发中必需的数学基础知识，帮助您理解 3D 空间中的坐标变换、投影计算等核心概念。

## 🎯 学习目标

- 理解 3D 空间中的向量概念和运算
- 掌握矩阵运算和变换原理
- 了解坐标系统和坐标变换
- 理解投影数学原理
- 能够使用数学库进行 3D 计算

## 1. 向量基础

### 1.1 向量的定义

**向量（Vector）** 是具有大小和方向的量。在 3D 图形中，向量通常用来表示位置、方向、速度、力等。

```javascript
// 3D 向量表示
const position = [2.0, 3.0, 1.0];    // 位置向量
const direction = [0.0, 1.0, 0.0];   // 方向向量（单位向量）
const velocity = [5.0, 0.0, -2.0];   // 速度向量
```

### 1.2 向量的类型

#### 位置向量
表示 3D 空间中的一个点的位置：
```javascript
const pointA = [1.0, 2.0, 3.0];  // 点 A 的位置
const pointB = [4.0, 1.0, 2.0];  // 点 B 的位置
```

#### 方向向量
表示方向，通常是单位向量（长度为1）：
```javascript
const up = [0.0, 1.0, 0.0];      // 向上方向
const forward = [0.0, 0.0, -1.0]; // 向前方向（右手坐标系）
const right = [1.0, 0.0, 0.0];   // 向右方向
```

### 1.3 向量运算

#### 向量加法
两个向量对应分量相加：
```javascript
function vectorAdd(a, b) {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
    ];
}

// 示例：位移计算
const position = [1.0, 2.0, 3.0];
const displacement = [2.0, -1.0, 0.5];
const newPosition = vectorAdd(position, displacement);
// 结果: [3.0, 1.0, 3.5]
```

#### 向量减法
两个向量对应分量相减：
```javascript
function vectorSubtract(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ];
}

// 示例：计算从点A到点B的方向向量
const pointA = [1.0, 2.0, 3.0];
const pointB = [4.0, 1.0, 2.0];
const direction = vectorSubtract(pointB, pointA);
// 结果: [3.0, -1.0, -1.0]
```

#### 标量乘法
向量的每个分量乘以标量：
```javascript
function vectorScale(vector, scalar) {
    return [
        vector[0] * scalar,
        vector[1] * scalar,
        vector[2] * scalar
    ];
}

// 示例：放大向量
const vector = [1.0, 2.0, 3.0];
const scaled = vectorScale(vector, 2.5);
// 结果: [2.5, 5.0, 7.5]
```

#### 点积（内积）
计算两个向量的点积：
```javascript
function vectorDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// 应用：计算两向量夹角的余弦值
const vecA = [1.0, 0.0, 0.0];
const vecB = [0.0, 1.0, 0.0];
const dotProduct = vectorDot(vecA, vecB);
// 结果: 0.0（垂直向量）
```

#### 叉积（外积）
计算两个向量的叉积（结果是垂直于两个向量的向量）：
```javascript
function vectorCross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

// 应用：计算法线向量
const edge1 = [1.0, 0.0, 0.0];
const edge2 = [0.0, 1.0, 0.0];
const normal = vectorCross(edge1, edge2);
// 结果: [0.0, 0.0, 1.0]
```

#### 向量长度
计算向量的长度（模）：
```javascript
function vectorLength(vector) {
    return Math.sqrt(
        vector[0] * vector[0] + 
        vector[1] * vector[1] + 
        vector[2] * vector[2]
    );
}

// 示例：计算距离
const vector = [3.0, 4.0, 0.0];
const length = vectorLength(vector);
// 结果: 5.0
```

#### 向量标准化
将向量转换为单位向量：
```javascript
function vectorNormalize(vector) {
    const length = vectorLength(vector);
    if (length === 0) return [0, 0, 0];
    
    return [
        vector[0] / length,
        vector[1] / length,
        vector[2] / length
    ];
}

// 示例：获取方向向量
const vector = [3.0, 4.0, 0.0];
const normalized = vectorNormalize(vector);
// 结果: [0.6, 0.8, 0.0]
```

## 2. 矩阵基础

### 2.1 矩阵的定义

**矩阵（Matrix）** 是按矩形阵列排列的数字集合。在 3D 图形中，我们主要使用 4×4 矩阵来表示变换。

```javascript
// 4x4 矩阵表示（列主序）
const identityMatrix = [
    1, 0, 0, 0,  // 第一列
    0, 1, 0, 0,  // 第二列
    0, 0, 1, 0,  // 第三列
    0, 0, 0, 1   // 第四列
];
```

### 2.2 矩阵运算

#### 矩阵乘法
两个矩阵相乘：
```javascript
function matrixMultiply(a, b) {
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
```

#### 矩阵与向量相乘
将向量变换为新的向量：
```javascript
function matrixVectorMultiply(matrix, vector) {
    return [
        matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8]  * vector[2] + matrix[12] * vector[3],
        matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9]  * vector[2] + matrix[13] * vector[3],
        matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
        matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3]
    ];
}
```

### 2.3 变换矩阵

#### 平移矩阵
沿指定方向移动物体：
```javascript
function createTranslationMatrix(x, y, z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
}

// 示例：向右移动2个单位
const translateMatrix = createTranslationMatrix(2.0, 0.0, 0.0);
```

#### 缩放矩阵
改变物体的大小：
```javascript
function createScaleMatrix(x, y, z) {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ];
}

// 示例：各方向放大2倍
const scaleMatrix = createScaleMatrix(2.0, 2.0, 2.0);
```

#### 旋转矩阵

**绕 X 轴旋转**：
```javascript
function createRotationXMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    return [
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1
    ];
}
```

**绕 Y 轴旋转**：
```javascript
function createRotationYMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    return [
         c, 0, s, 0,
         0, 1, 0, 0,
        -s, 0, c, 0,
         0, 0, 0, 1
    ];
}
```

**绕 Z 轴旋转**：
```javascript
function createRotationZMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    return [
        c, -s, 0, 0,
        s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
    ];
}
```

## 3. 坐标系统与变换

### 3.1 坐标系统

#### 局部坐标系（Local/Object Space）
物体自身的坐标系，物体的顶点相对于其中心点定义。

#### 世界坐标系（World Space）
场景的全局坐标系，所有物体都相对于世界原点定位。

#### 视图坐标系（View/Camera Space）
相对于相机的坐标系，相机位于原点，面向负Z轴。

#### 裁剪坐标系（Clip Space）
经过投影变换后的坐标系，用于裁剪和投影。

### 3.2 坐标变换流程

```
局部坐标 --[模型矩阵]--> 世界坐标 --[视图矩阵]--> 视图坐标 --[投影矩阵]--> 裁剪坐标
```

#### 模型矩阵（Model Matrix）
将物体从局部坐标系转换到世界坐标系：
```javascript
function createModelMatrix(translation, rotation, scale) {
    const T = createTranslationMatrix(translation[0], translation[1], translation[2]);
    const R = createRotationMatrix(rotation[0], rotation[1], rotation[2]);
    const S = createScaleMatrix(scale[0], scale[1], scale[2]);
    
    // 变换顺序：先缩放，再旋转，最后平移
    return matrixMultiply(T, matrixMultiply(R, S));
}
```

#### 视图矩阵（View Matrix）
将世界坐标转换到相机坐标系：
```javascript
function createLookAtMatrix(eye, target, up) {
    // 计算相机的局部坐标系
    const zAxis = vectorNormalize(vectorSubtract(eye, target));  // 相机朝向（负Z）
    const xAxis = vectorNormalize(vectorCross(up, zAxis));       // 相机右方向
    const yAxis = vectorCross(zAxis, xAxis);                     // 相机上方向
    
    return [
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -vectorDot(xAxis, eye), -vectorDot(yAxis, eye), -vectorDot(zAxis, eye), 1
    ];
}
```

## 4. 投影变换

### 4.1 透视投影

透视投影模拟人眼观察世界的方式，远处的物体看起来更小：

```javascript
function createPerspectiveMatrix(fov, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    const rangeInv = 1.0 / (near - far);
    
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}

// 参数说明：
// fov: 视野角度（弧度）
// aspect: 宽高比
// near: 近裁剪平面距离
// far: 远裁剪平面距离
```

### 4.2 正交投影

正交投影没有透视效果，物体大小不随距离变化：

```javascript
function createOrthographicMatrix(left, right, bottom, top, near, far) {
    return [
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        -(right + left) / (right - left),
        -(top + bottom) / (top - bottom),
        -(far + near) / (far - near),
        1
    ];
}
```

## 5. 四元数（Quaternion）

### 5.1 四元数的优势

四元数是表示旋转的另一种方式，相比欧拉角有以下优势：
- 避免万向锁问题
- 平滑的插值
- 更高效的复合旋转

### 5.2 四元数基础运算

```javascript
// 四元数表示：[x, y, z, w]
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
    multiply(other) {
        return new Quaternion(
            this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y,
            this.w * other.y - this.x * other.z + this.y * other.w + this.z * other.x,
            this.w * other.z + this.x * other.y - this.y * other.x + this.z * other.w,
            this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z
        );
    }
    
    // 转换为旋转矩阵
    toMatrix() {
        const x2 = this.x * 2, y2 = this.y * 2, z2 = this.z * 2;
        const xx = this.x * x2, xy = this.x * y2, xz = this.x * z2;
        const yy = this.y * y2, yz = this.y * z2, zz = this.z * z2;
        const wx = this.w * x2, wy = this.w * y2, wz = this.w * z2;
        
        return [
            1 - (yy + zz), xy - wz, xz + wy, 0,
            xy + wz, 1 - (xx + zz), yz - wx, 0,
            xz - wy, yz + wx, 1 - (xx + yy), 0,
            0, 0, 0, 1
        ];
    }
}
```

## 6. 实用数学函数

### 6.1 角度转换
```javascript
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radians) {
    return radians * 180 / Math.PI;
}
```

### 6.2 插值函数
```javascript
// 线性插值
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// 向量插值
function vectorLerp(a, b, t) {
    return [
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t)
    ];
}

// 球面线性插值（用于四元数）
function slerp(q1, q2, t) {
    let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    
    if (dot < 0) {
        q2.x = -q2.x;
        q2.y = -q2.y;
        q2.z = -q2.z;
        q2.w = -q2.w;
        dot = -dot;
    }
    
    if (dot > 0.9995) {
        // 线性插值
        return new Quaternion(
            lerp(q1.x, q2.x, t),
            lerp(q1.y, q2.y, t),
            lerp(q1.z, q2.z, t),
            lerp(q1.w, q2.w, t)
        ).normalize();
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
```

## 7. 数学库推荐

### 7.1 gl-matrix
最流行的 WebGL 数学库：

```javascript
// 安装
npm install gl-matrix

// 使用示例
import { mat4, vec3 } from 'gl-matrix';

// 创建透视投影矩阵
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

// 创建视图矩阵
const viewMatrix = mat4.create();
mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

// 创建模型矩阵
const modelMatrix = mat4.create();
mat4.rotateY(modelMatrix, modelMatrix, Date.now() * 0.001);
```

### 7.2 自定义数学库
针对项目需求创建简化的数学库：

```javascript
// 创建完整的数学工具函数文件
const MathUtils = {
    // 常量
    PI: Math.PI,
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI * 0.5,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    
    // 实用函数
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }
};
```

## 8. 实践练习

### 练习1：向量运算
实现一个向量类，包含所有基本运算方法。

### 练习2：变换矩阵
创建一个物体，应用不同的变换矩阵观察效果。

### 练习3：相机控制
实现一个可以用鼠标控制的相机系统。

### 练习4：四元数旋转
使用四元数实现平滑的物体旋转。

## 9. 常见问题

### Q1: 为什么要使用 4×4 矩阵而不是 3×3？
**A**: 4×4 矩阵可以用一次乘法同时表示旋转、缩放和平移，这被称为齐次坐标系统。

### Q2: 矩阵乘法的顺序为什么很重要？
**A**: 矩阵乘法不满足交换律，A×B ≠ B×A。变换的顺序会影响最终结果。

### Q3: 如何避免浮点精度问题？
**A**: 
- 使用合适的精度阈值进行比较
- 避免连续的小量累加
- 定期重新归一化向量和四元数

### Q4: 什么时候使用四元数？
**A**: 当需要进行旋转插值、避免万向锁或进行复杂的旋转运算时使用四元数。

## 10. 章节总结

通过本章学习，您应该已经：

- ✅ 掌握了 3D 向量的基本概念和运算
- ✅ 理解了矩阵变换的原理和应用
- ✅ 了解了坐标系统和变换流程
- ✅ 学会了投影变换的数学原理
- ✅ 认识了四元数在 3D 旋转中的作用
- ✅ 能够选择合适的数学库进行开发

## 🔗 下一步

恭喜您完成了 WebGL 基础概念阶段的学习！现在您已经具备了：
- WebGL 的基本概念
- 渲染管线的工作原理  
- 3D 数学基础知识

接下来我们将进入 [核心概念阶段](../02-core-concepts/README.md)，深入学习着色器编程、几何体管理和变换系统。

**准备好进入 WebGL 的核心世界了吗？让我们继续前进！** 🚀 