# 第10章：高级着色技术

高级着色技术是现代3D图形渲染的核心，它们能够显著提升渲染质量和视觉真实感。本章将深入探讨法线贴图、环境映射、阴影映射和延迟渲染等关键技术。

## 🎯 学习目标

- 掌握法线贴图的原理和实现技术
- 理解环境映射和基于图像的光照（IBL）
- 实现实时阴影映射系统
- 构建延迟渲染管线
- 优化高级着色效果的性能

## 📚 章节内容

### 10.1 法线贴图技术

法线贴图是一种通过纹理存储表面法线信息来增强几何体表面细节的技术，无需增加实际几何复杂度。

#### 10.1.1 切线空间基础

```javascript
// 切线空间计算工具类
class TangentSpaceCalculator {
    static calculateTangents(positions, texCoords, normals, indices) {
        const tangents = new Array(positions.length / 3 * 3).fill(0);
        const bitangents = new Array(positions.length / 3 * 3).fill(0);
        
        // 遍历每个三角形
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i] * 3;
            const i1 = indices[i + 1] * 3;
            const i2 = indices[i + 2] * 3;
            
            // 获取顶点位置
            const v0 = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
            const v1 = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
            const v2 = [positions[i2], positions[i2 + 1], positions[i2 + 2]];
            
            // 获取纹理坐标
            const uv0 = [texCoords[indices[i] * 2], texCoords[indices[i] * 2 + 1]];
            const uv1 = [texCoords[indices[i + 1] * 2], texCoords[indices[i + 1] * 2 + 1]];
            const uv2 = [texCoords[indices[i + 2] * 2], texCoords[indices[i + 2] * 2 + 1]];
            
            // 计算边向量
            const deltaPos1 = vec3.subtract([], v1, v0);
            const deltaPos2 = vec3.subtract([], v2, v0);
            
            // 计算UV增量
            const deltaUV1 = [uv1[0] - uv0[0], uv1[1] - uv0[1]];
            const deltaUV2 = [uv2[0] - uv0[0], uv2[1] - uv0[1]];
            
            // 计算切线和副切线
            const r = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);
            const tangent = vec3.scale([], 
                vec3.subtract([], 
                    vec3.scale([], deltaPos1, deltaUV2[1]), 
                    vec3.scale([], deltaPos2, deltaUV1[1])
                ), r
            );
            const bitangent = vec3.scale([],
                vec3.subtract([],
                    vec3.scale([], deltaPos2, deltaUV1[0]),
                    vec3.scale([], deltaPos1, deltaUV2[0])
                ), r
            );
            
            // 累加到顶点
            const vertexIndices = [indices[i], indices[i + 1], indices[i + 2]];
            for (const idx of vertexIndices) {
                tangents[idx * 3] += tangent[0];
                tangents[idx * 3 + 1] += tangent[1];
                tangents[idx * 3 + 2] += tangent[2];
                
                bitangents[idx * 3] += bitangent[0];
                bitangents[idx * 3 + 1] += bitangent[1];
                bitangents[idx * 3 + 2] += bitangent[2];
            }
        }
        
        // 标准化切线向量
        for (let i = 0; i < tangents.length; i += 3) {
            const t = [tangents[i], tangents[i + 1], tangents[i + 2]];
            const n = [normals[i], normals[i + 1], normals[i + 2]];
            
            // Gram-Schmidt正交化
            const tangent = vec3.subtract([], t, vec3.scale([], n, vec3.dot(n, t)));
            vec3.normalize(tangent, tangent);
            
            tangents[i] = tangent[0];
            tangents[i + 1] = tangent[1];
            tangents[i + 2] = tangent[2];
        }
        
        return { tangents, bitangents };
    }
}
```

#### 10.1.2 法线贴图着色器

```glsl
// 顶点着色器
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;
attribute vec3 a_tangent;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;

varying vec2 v_texCoord;
varying vec3 v_worldPos;
varying mat3 v_TBN;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_texCoord = a_texCoord;
    
    // 计算TBN矩阵
    vec3 T = normalize(u_normalMatrix * a_tangent);
    vec3 N = normalize(u_normalMatrix * a_normal);
    
    // Gram-Schmidt正交化
    T = normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);
    
    v_TBN = mat3(T, B, N);
    
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
}
```

```glsl
// 片段着色器
precision mediump float;

uniform sampler2D u_diffuseMap;
uniform sampler2D u_normalMap;
uniform sampler2D u_specularMap;

uniform vec3 u_lightPos;
uniform vec3 u_viewPos;
uniform vec3 u_lightColor;

varying vec2 v_texCoord;
varying vec3 v_worldPos;
varying mat3 v_TBN;

vec3 calculateLighting(vec3 normal, vec3 lightDir, vec3 viewDir, 
                      vec3 diffuseColor, vec3 specularColor) {
    // 环境光
    vec3 ambient = 0.1 * diffuseColor;
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * u_lightColor * diffuseColor;
    
    // 镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
    vec3 specular = spec * u_lightColor * specularColor;
    
    return ambient + diffuse + specular;
}

void main() {
    // 采样纹理
    vec3 diffuseColor = texture2D(u_diffuseMap, v_texCoord).rgb;
    vec3 specularColor = texture2D(u_specularMap, v_texCoord).rgb;
    
    // 从法线贴图获取法线
    vec3 normal = texture2D(u_normalMap, v_texCoord).rgb;
    normal = normalize(normal * 2.0 - 1.0); // 从[0,1]转换到[-1,1]
    
    // 转换到世界空间
    normal = normalize(v_TBN * normal);
    
    // 计算光照方向
    vec3 lightDir = normalize(u_lightPos - v_worldPos);
    vec3 viewDir = normalize(u_viewPos - v_worldPos);
    
    // 计算最终光照
    vec3 result = calculateLighting(normal, lightDir, viewDir, 
                                   diffuseColor, specularColor);
    
    gl_FragColor = vec4(result, 1.0);
}
```

### 10.2 环境映射和IBL

环境映射（Environment Mapping）使用环境纹理来模拟物体表面的反射和环境光照。

#### 10.2.1 立方体贴图环境映射

```javascript
// 立方体贴图加载器
class CubemapLoader {
    constructor(gl) {
        this.gl = gl;
    }
    
    async loadCubemap(urls) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        
        const faces = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // Right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // Left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // Top
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // Bottom
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // Front
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z  // Back
        ];
        
        const promises = urls.map((url, index) => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    gl.texImage2D(faces[index], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    resolve();
                };
                image.onerror = reject;
                image.src = url;
            });
        });
        
        await Promise.all(promises);
        
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        return texture;
    }
}
```

#### 10.2.2 IBL着色器

```glsl
// IBL片段着色器
precision mediump float;

uniform samplerCube u_envMap;
uniform samplerCube u_irradianceMap;
uniform sampler2D u_brdfLUT;

uniform vec3 u_viewPos;
uniform float u_metallic;
uniform float u_roughness;
uniform vec3 u_albedo;

varying vec3 v_worldPos;
varying vec3 v_normal;
varying vec2 v_texCoord;

const float PI = 3.14159265359;

// 菲涅尔反射
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    vec3 N = normalize(v_normal);
    vec3 V = normalize(u_viewPos - v_worldPos);
    vec3 R = reflect(-V, N);
    
    // 计算基础反射率
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, u_albedo, u_metallic);
    
    // 环境光照计算
    vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, u_roughness);
    
    vec3 kS = F;
    vec3 kD = 1.0 - kS;
    kD *= 1.0 - u_metallic;
    
    // 漫反射环境光照
    vec3 irradiance = textureCube(u_irradianceMap, N).rgb;
    vec3 diffuse = irradiance * u_albedo;
    
    // 镜面反射环境光照
    const float MAX_REFLECTION_LOD = 4.0;
    vec3 prefilteredColor = textureCube(u_envMap, R, u_roughness * MAX_REFLECTION_LOD).rgb;
    vec2 brdf = texture2D(u_brdfLUT, vec2(max(dot(N, V), 0.0), u_roughness)).rg;
    vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);
    
    vec3 ambient = (kD * diffuse + specular);
    vec3 color = ambient;
    
    // HDR色调映射
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
```

### 10.3 阴影映射技术

阴影映射是实时渲染中最常用的阴影生成技术，通过深度纹理来判断像素是否处于阴影中。

#### 10.3.1 基础阴影映射

```javascript
// 阴影映射渲染器
class ShadowMapRenderer {
    constructor(gl, shadowMapSize = 1024) {
        this.gl = gl;
        this.shadowMapSize = shadowMapSize;
        
        this.createShadowFramebuffer();
        this.createShadowShader();
    }
    
    createShadowFramebuffer() {
        const gl = this.gl;
        
        // 创建深度纹理
        this.shadowMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.shadowMap);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, 
                     this.shadowMapSize, this.shadowMapSize, 
                     0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        // 创建帧缓冲
        this.shadowFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                               gl.TEXTURE_2D, this.shadowMap, 0);
        
        // 关闭颜色缓冲
        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);
        
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Shadow framebuffer not complete!');
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    createShadowShader() {
        const vertexShaderSource = `
            attribute vec3 a_position;
            uniform mat4 u_lightSpaceMatrix;
            uniform mat4 u_modelMatrix;
            
            void main() {
                gl_Position = u_lightSpaceMatrix * u_modelMatrix * vec4(a_position, 1.0);
            }
        `;
        
        const fragmentShaderSource = `
            precision mediump float;
            
            void main() {
                // 深度值会自动写入深度缓冲区
            }
        `;
        
        this.shadowShader = createShaderProgram(this.gl, 
                                               vertexShaderSource, 
                                               fragmentShaderSource);
    }
    
    renderShadowMap(lightPos, lightTarget, scene) {
        const gl = this.gl;
        
        // 计算光照空间矩阵
        const lightView = mat4.lookAt([], lightPos, lightTarget, [0, 1, 0]);
        const lightProjection = mat4.ortho([], -10, 10, -10, 10, 1.0, 7.5);
        const lightSpaceMatrix = mat4.multiply([], lightProjection, lightView);
        
        // 渲染到阴影贴图
        gl.viewport(0, 0, this.shadowMapSize, this.shadowMapSize);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFramebuffer);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(this.shadowShader);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShader, 'u_lightSpaceMatrix'), 
                           false, lightSpaceMatrix);
        
        // 渲染场景几何体
        scene.renderDepthOnly(this.shadowShader);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        return lightSpaceMatrix;
    }
}
```

#### 10.3.2 PCF软阴影

```glsl
// 带PCF的阴影片段着色器
precision mediump float;

uniform sampler2D u_shadowMap;
uniform vec3 u_lightPos;
uniform vec3 u_viewPos;

varying vec3 v_worldPos;
varying vec3 v_normal;
varying vec4 v_lightSpacePos;

float ShadowCalculation(vec4 fragPosLightSpace) {
    // 透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    
    // 超出光照范围
    if (projCoords.z > 1.0) {
        return 0.0;
    }
    
    // 当前片段深度
    float currentDepth = projCoords.z;
    
    // 偏移量防止阴影粉刺
    vec3 normal = normalize(v_normal);
    vec3 lightColor = normalize(u_lightPos - v_worldPos);
    float bias = max(0.05 * (1.0 - dot(normal, lightColor)), 0.005);
    
    // PCF软阴影
    float shadow = 0.0;
    vec2 texelSize = 1.0 / vec2(1024.0); // 阴影贴图大小
    
    for (int x = -1; x <= 1; ++x) {
        for (int y = -1; y <= 1; ++y) {
            float pcfDepth = texture2D(u_shadowMap, 
                                      projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    
    return shadow;
}

void main() {
    vec3 color = vec3(0.5); // 基础颜色
    vec3 normal = normalize(v_normal);
    vec3 lightColor = vec3(1.0);
    
    // 环境光
    vec3 ambient = 0.15 * color;
    
    // 漫反射
    vec3 lightDir = normalize(u_lightPos - v_worldPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // 镜面反射
    vec3 viewDir = normalize(u_viewPos - v_worldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;
    
    // 计算阴影
    float shadow = ShadowCalculation(v_lightSpacePos);
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;
    
    gl_FragColor = vec4(lighting, 1.0);
}
```

### 10.4 延迟渲染

延迟渲染是一种高效处理多光源场景的渲染技术，通过分离几何处理和光照计算阶段来优化性能。

#### 10.4.1 G-Buffer设置

```javascript
// 延迟渲染器
class DeferredRenderer {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        
        this.createGBuffer();
        this.createShaders();
        this.createQuad();
    }
    
    createGBuffer() {
        const gl = this.gl;
        
        // 创建G-Buffer帧缓冲
        this.gBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer);
        
        // 位置纹理 (RGBA32F)
        this.gPosition = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.gPosition);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 
                     0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                               gl.TEXTURE_2D, this.gPosition, 0);
        
        // 法线纹理 (RGBA16F)
        this.gNormal = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.gNormal);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 
                     0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, 
                               gl.TEXTURE_2D, this.gNormal, 0);
        
        // 颜色 + 镜面反射纹理 (RGBA8)
        this.gAlbedoSpec = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.gAlbedoSpec);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 
                     0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, 
                               gl.TEXTURE_2D, this.gAlbedoSpec, 0);
        
        // 指定多重渲染目标
        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2
        ]);
        
        // 深度缓冲
        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
                              this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                                  gl.RENDERBUFFER, this.depthBuffer);
        
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('G-Buffer not complete!');
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
```

#### 10.4.2 几何阶段着色器

```glsl
// 几何阶段顶点着色器
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;

varying vec3 v_worldPos;
varying vec2 v_texCoord;
varying vec3 v_normal;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_texCoord = a_texCoord;
    v_normal = u_normalMatrix * a_normal;
    
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
}
```

```glsl
// 几何阶段片段着色器
precision mediump float;

uniform sampler2D u_diffuseMap;
uniform sampler2D u_specularMap;

varying vec3 v_worldPos;
varying vec2 v_texCoord;
varying vec3 v_normal;

void main() {
    // 输出到G-Buffer
    gl_FragData[0] = vec4(v_worldPos, 1.0);              // 位置
    gl_FragData[1] = vec4(normalize(v_normal), 1.0);     // 法线
    gl_FragData[2].rgb = texture2D(u_diffuseMap, v_texCoord).rgb; // 漫反射颜色
    gl_FragData[2].a = texture2D(u_specularMap, v_texCoord).r;    // 镜面反射强度
}
```

#### 10.4.3 光照阶段着色器

```glsl
// 延迟光照片段着色器
precision mediump float;

uniform sampler2D u_gPosition;
uniform sampler2D u_gNormal;
uniform sampler2D u_gAlbedoSpec;

uniform vec3 u_viewPos;
uniform vec3 u_lightPositions[32];
uniform vec3 u_lightColors[32];
uniform int u_numLights;

varying vec2 v_texCoord;

void main() {
    // 从G-Buffer采样
    vec3 fragPos = texture2D(u_gPosition, v_texCoord).rgb;
    vec3 normal = texture2D(u_gNormal, v_texCoord).rgb;
    vec3 diffuse = texture2D(u_gAlbedoSpec, v_texCoord).rgb;
    float specular = texture2D(u_gAlbedoSpec, v_texCoord).a;
    
    // 环境光
    vec3 lighting = diffuse * 0.1;
    vec3 viewDir = normalize(u_viewPos - fragPos);
    
    // 计算所有光源的贡献
    for (int i = 0; i < 32; ++i) {
        if (i >= u_numLights) break;
        
        // 光照计算
        vec3 lightDir = normalize(u_lightPositions[i] - fragPos);
        vec3 diffuseLight = max(dot(normal, lightDir), 0.0) * diffuse * u_lightColors[i];
        
        // Blinn-Phong镜面反射
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);
        vec3 specularLight = u_lightColors[i] * spec * specular;
        
        // 衰减计算
        float distance = length(u_lightPositions[i] - fragPos);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
        
        diffuseLight *= attenuation;
        specularLight *= attenuation;
        
        lighting += diffuseLight + specularLight;
    }
    
    gl_FragColor = vec4(lighting, 1.0);
}
```

### 10.5 实践案例：材质预览器

```javascript
// 高级材质预览器
class AdvancedMaterialPreview {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        this.scene = new Scene();
        this.camera = new OrbitCamera(canvas);
        this.deferredRenderer = new DeferredRenderer(this.gl, canvas.width, canvas.height);
        this.shadowRenderer = new ShadowMapRenderer(this.gl);
        
        this.setupScene();
        this.setupLights();
        this.setupUI();
        
        this.animate();
    }
    
    setupScene() {
        // 创建预览球体
        const sphere = new Sphere(1.0, 32, 32);
        this.sphereMesh = new Mesh(sphere.vertices, sphere.indices);
        
        // 创建地面
        const plane = new Plane(10, 10);
        this.planeMesh = new Mesh(plane.vertices, plane.indices);
        
        this.scene.add(this.sphereMesh);
        this.scene.add(this.planeMesh);
    }
    
    setupLights() {
        this.lights = [
            { position: [2, 4, 2], color: [1, 1, 1] },
            { position: [-2, 3, -1], color: [0.8, 0.9, 1] },
            { position: [0, 2, -3], color: [1, 0.9, 0.8] }
        ];
    }
    
    setupUI() {
        // 材质参数控制
        this.materialParams = {
            metallic: 0.5,
            roughness: 0.5,
            albedo: [1.0, 0.8, 0.6],
            normalIntensity: 1.0,
            envIntensity: 1.0
        };
        
        this.createParameterControls();
    }
    
    render() {
        const gl = this.gl;
        
        // 1. 渲染阴影贴图
        const lightSpaceMatrix = this.shadowRenderer.renderShadowMap(
            this.lights[0].position, 
            [0, 0, 0], 
            this.scene
        );
        
        // 2. 几何阶段 - 渲染到G-Buffer
        this.deferredRenderer.renderGeometry(this.scene, this.camera);
        
        // 3. 光照阶段 - 使用G-Buffer进行光照计算
        this.deferredRenderer.renderLighting(this.lights, this.camera, 
                                           this.shadowRenderer.shadowMap, 
                                           lightSpaceMatrix);
        
        // 4. 后处理
        this.applyPostProcessing();
    }
    
    applyPostProcessing() {
        // 色调映射和伽马校正
        // 这里可以添加更多后处理效果
    }
    
    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// 使用示例
const canvas = document.getElementById('materialPreview');
const preview = new AdvancedMaterialPreview(canvas);
```

## 🎯 性能优化技巧

### 着色器优化
```glsl
// 优化前：在片段着色器中计算
varying vec3 v_worldPos;
uniform vec3 u_lightPos;

void main() {
    vec3 lightDir = normalize(u_lightPos - v_worldPos); // 每个片段都计算
    // ...
}

// 优化后：在顶点着色器中计算
attribute vec3 a_position;
varying vec3 v_lightDir;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_lightDir = normalize(u_lightPos - worldPos.xyz); // 在顶点阶段计算
    // ...
}
```

### 批处理优化
```javascript
// 材质批处理
class MaterialBatcher {
    constructor() {
        this.batches = new Map();
    }
    
    addObject(object, material) {
        const key = material.getId();
        if (!this.batches.has(key)) {
            this.batches.set(key, { material, objects: [] });
        }
        this.batches.get(key).objects.push(object);
    }
    
    render() {
        // 按材质批量渲染
        for (const [key, batch] of this.batches) {
            batch.material.bind();
            for (const object of batch.objects) {
                object.render();
            }
        }
    }
}
```

## ✅ 学习检查点

完成本章学习后，您应该能够：

- [ ] 理解切线空间和法线贴图的工作原理
- [ ] 实现基于图像的光照（IBL）
- [ ] 创建实时阴影映射系统
- [ ] 构建延迟渲染管线
- [ ] 优化高级着色效果的性能
- [ ] 集成多种高级着色技术

## 🚀 下一步

掌握了高级着色技术后，接下来学习[第11章：几何处理](11-geometry-processing.md)，深入了解几何体优化和实例化渲染技术。

记住，高级着色技术的关键是理解底层原理并在实践中不断优化。建议您创建一个材质编辑器项目，集成本章学到的所有技术。 