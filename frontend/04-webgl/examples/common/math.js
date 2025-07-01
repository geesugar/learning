/**
 * WebGL 数学工具库
 * 包含向量、矩阵等 3D 数学运算
 */

// 3D 向量类
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    static create(x, y, z) {
        return new Vec3(x, y, z);
    }
    
    static fromArray(arr) {
        return new Vec3(arr[0], arr[1], arr[2]);
    }
    
    toArray() {
        return [this.x, this.y, this.z];
    }
    
    copy() {
        return new Vec3(this.x, this.y, this.z);
    }
    
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    
    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vec3(x, y, z);
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }
    
    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

// 4x4 矩阵类
class Mat4 {
    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }
    
    static create() {
        return new Mat4();
    }
    
    static fromArray(arr) {
        const mat = new Mat4();
        mat.elements.set(arr);
        return mat;
    }
    
    toArray() {
        return Array.from(this.elements);
    }
    
    copy() {
        const mat = new Mat4();
        mat.elements.set(this.elements);
        return mat;
    }
    
    identity() {
        const e = this.elements;
        e[0] = 1; e[4] = 0; e[8] = 0;  e[12] = 0;
        e[1] = 0; e[5] = 1; e[9] = 0;  e[13] = 0;
        e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
        e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
        return this;
    }
    
    multiply(m) {
        const a = this.elements;
        const b = m.elements;
        const result = new Float32Array(16);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        
        this.elements = result;
        return this;
    }
    
    translate(x, y, z) {
        const e = this.elements;
        e[12] += e[0] * x + e[4] * y + e[8] * z;
        e[13] += e[1] * x + e[5] * y + e[9] * z;
        e[14] += e[2] * x + e[6] * y + e[10] * z;
        e[15] += e[3] * x + e[7] * y + e[11] * z;
        return this;
    }
    
    scale(x, y, z) {
        const e = this.elements;
        e[0] *= x; e[4] *= y; e[8] *= z;
        e[1] *= x; e[5] *= y; e[9] *= z;
        e[2] *= x; e[6] *= y; e[10] *= z;
        e[3] *= x; e[7] *= y; e[11] *= z;
        return this;
    }
    
    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;
        
        const e4 = e[4], e5 = e[5], e6 = e[6], e7 = e[7];
        const e8 = e[8], e9 = e[9], e10 = e[10], e11 = e[11];
        
        e[4] = e4 * c + e8 * s;
        e[5] = e5 * c + e9 * s;
        e[6] = e6 * c + e10 * s;
        e[7] = e7 * c + e11 * s;
        
        e[8] = e8 * c - e4 * s;
        e[9] = e9 * c - e5 * s;
        e[10] = e10 * c - e6 * s;
        e[11] = e11 * c - e7 * s;
        
        return this;
    }
    
    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;
        
        const e0 = e[0], e1 = e[1], e2 = e[2], e3 = e[3];
        const e8 = e[8], e9 = e[9], e10 = e[10], e11 = e[11];
        
        e[0] = e0 * c - e8 * s;
        e[1] = e1 * c - e9 * s;
        e[2] = e2 * c - e10 * s;
        e[3] = e3 * c - e11 * s;
        
        e[8] = e0 * s + e8 * c;
        e[9] = e1 * s + e9 * c;
        e[10] = e2 * s + e10 * c;
        e[11] = e3 * s + e11 * c;
        
        return this;
    }
    
    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;
        
        const e0 = e[0], e1 = e[1], e2 = e[2], e3 = e[3];
        const e4 = e[4], e5 = e[5], e6 = e[6], e7 = e[7];
        
        e[0] = e0 * c + e4 * s;
        e[1] = e1 * c + e5 * s;
        e[2] = e2 * c + e6 * s;
        e[3] = e3 * c + e7 * s;
        
        e[4] = e4 * c - e0 * s;
        e[5] = e5 * c - e1 * s;
        e[6] = e6 * c - e2 * s;
        e[7] = e7 * c - e3 * s;
        
        return this;
    }
    
    perspective(fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        const e = this.elements;
        
        e[0] = f / aspect; e[4] = 0; e[8] = 0;                e[12] = 0;
        e[1] = 0;          e[5] = f; e[9] = 0;                e[13] = 0;
        e[2] = 0;          e[6] = 0; e[10] = (far + near) * nf; e[14] = 2 * far * near * nf;
        e[3] = 0;          e[7] = 0; e[11] = -1;              e[15] = 0;
        
        return this;
    }
    
    lookAt(eye, center, up) {
        const eyeVec = new Vec3(eye.x, eye.y, eye.z);
        const centerVec = new Vec3(center.x, center.y, center.z);
        const upVec = new Vec3(up.x, up.y, up.z);
        
        const z = eyeVec.copy().subtract(centerVec).normalize();
        const x = upVec.copy().cross(z).normalize();
        const y = z.copy().cross(x);
        
        const e = this.elements;
        e[0] = x.x; e[4] = x.y; e[8] = x.z;   e[12] = -x.dot(eyeVec);
        e[1] = y.x; e[5] = y.y; e[9] = y.z;   e[13] = -y.dot(eyeVec);
        e[2] = z.x; e[6] = z.y; e[10] = z.z;  e[14] = -z.dot(eyeVec);
        e[3] = 0;   e[7] = 0;   e[11] = 0;    e[15] = 1;
        
        return this;
    }
    
    invert() {
        const e = this.elements;
        const inv = new Float32Array(16);
        
        inv[0] = e[5] * e[10] * e[15] - e[5] * e[11] * e[14] - e[9] * e[6] * e[15] +
                 e[9] * e[7] * e[14] + e[13] * e[6] * e[11] - e[13] * e[7] * e[10];
        
        inv[4] = -e[4] * e[10] * e[15] + e[4] * e[11] * e[14] + e[8] * e[6] * e[15] -
                 e[8] * e[7] * e[14] - e[12] * e[6] * e[11] + e[12] * e[7] * e[10];
        
        inv[8] = e[4] * e[9] * e[15] - e[4] * e[11] * e[13] - e[8] * e[5] * e[15] +
                 e[8] * e[7] * e[13] + e[12] * e[5] * e[11] - e[12] * e[7] * e[9];
        
        inv[12] = -e[4] * e[9] * e[14] + e[4] * e[10] * e[13] + e[8] * e[5] * e[14] -
                  e[8] * e[6] * e[13] - e[12] * e[5] * e[10] + e[12] * e[6] * e[9];
        
        inv[1] = -e[1] * e[10] * e[15] + e[1] * e[11] * e[14] + e[9] * e[2] * e[15] -
                 e[9] * e[3] * e[14] - e[13] * e[2] * e[11] + e[13] * e[3] * e[10];
        
        inv[5] = e[0] * e[10] * e[15] - e[0] * e[11] * e[14] - e[8] * e[2] * e[15] +
                 e[8] * e[3] * e[14] + e[12] * e[2] * e[11] - e[12] * e[3] * e[10];
        
        inv[9] = -e[0] * e[9] * e[15] + e[0] * e[11] * e[13] + e[8] * e[1] * e[15] -
                 e[8] * e[3] * e[13] - e[12] * e[1] * e[11] + e[12] * e[3] * e[9];
        
        inv[13] = e[0] * e[9] * e[14] - e[0] * e[10] * e[13] - e[8] * e[1] * e[14] +
                  e[8] * e[2] * e[13] + e[12] * e[1] * e[10] - e[12] * e[2] * e[9];
        
        inv[2] = e[1] * e[6] * e[15] - e[1] * e[7] * e[14] - e[5] * e[2] * e[15] +
                 e[5] * e[3] * e[14] + e[13] * e[2] * e[7] - e[13] * e[3] * e[6];
        
        inv[6] = -e[0] * e[6] * e[15] + e[0] * e[7] * e[14] + e[4] * e[2] * e[15] -
                 e[4] * e[3] * e[14] - e[12] * e[2] * e[7] + e[12] * e[3] * e[6];
        
        inv[10] = e[0] * e[5] * e[15] - e[0] * e[7] * e[13] - e[4] * e[1] * e[15] +
                  e[4] * e[3] * e[13] + e[12] * e[1] * e[7] - e[12] * e[3] * e[5];
        
        inv[14] = -e[0] * e[5] * e[14] + e[0] * e[6] * e[13] + e[4] * e[1] * e[14] -
                  e[4] * e[2] * e[13] - e[12] * e[1] * e[6] + e[12] * e[2] * e[5];
        
        inv[3] = -e[1] * e[6] * e[11] + e[1] * e[7] * e[10] + e[5] * e[2] * e[11] -
                 e[5] * e[3] * e[10] - e[9] * e[2] * e[7] + e[9] * e[3] * e[6];
        
        inv[7] = e[0] * e[6] * e[11] - e[0] * e[7] * e[10] - e[4] * e[2] * e[11] +
                 e[4] * e[3] * e[10] + e[8] * e[2] * e[7] - e[8] * e[3] * e[6];
        
        inv[11] = -e[0] * e[5] * e[11] + e[0] * e[7] * e[9] + e[4] * e[1] * e[11] -
                  e[4] * e[3] * e[9] - e[8] * e[1] * e[7] + e[8] * e[3] * e[5];
        
        inv[15] = e[0] * e[5] * e[10] - e[0] * e[6] * e[9] - e[4] * e[1] * e[10] +
                  e[4] * e[2] * e[9] + e[8] * e[1] * e[6] - e[8] * e[2] * e[5];
        
        const det = e[0] * inv[0] + e[1] * inv[4] + e[2] * inv[8] + e[3] * inv[12];
        
        if (det === 0) {
            return this;
        }
        
        const detInv = 1.0 / det;
        for (let i = 0; i < 16; i++) {
            this.elements[i] = inv[i] * detInv;
        }
        
        return this;
    }
    
    transpose() {
        const e = this.elements;
        const temp = new Float32Array(16);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                temp[i * 4 + j] = e[j * 4 + i];
            }
        }
        
        this.elements = temp;
        return this;
    }
}

// 数学工具函数
class MathUtils {
    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;
    
    static degToRad(degrees) {
        return degrees * this.DEG_TO_RAD;
    }
    
    static radToDeg(radians) {
        return radians * this.RAD_TO_DEG;
    }
    
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    static isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    
    static nextPowerOf2(value) {
        value--;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        return value + 1;
    }
} 