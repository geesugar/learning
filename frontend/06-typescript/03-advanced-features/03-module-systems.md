# TypeScript 模块系统

> 深入理解 TypeScript 的模块系统，掌握现代 JavaScript 模块化开发

## �� 学习目标

完成本节后，你将掌握：
- ES6 模块与 CommonJS 的区别和选择
- 模块解析机制和配置优化
- 动态导入和代码分割策略
- 模块联邦和跨包共享

## 📦 模块系统基础

### ES6 模块 vs CommonJS

```typescript
// ES6 模块 (推荐) - math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
    return a + b;
}

export default class Calculator {
    static add = add;
    static PI = PI;
    
    constructor(private precision: number = 2) {}
    
    round(value: number): number {
        return Math.round(value * Math.pow(10, this.precision)) / Math.pow(10, this.precision);
    }
}

// 使用 ES6 模块 - app.ts
import Calculator, { PI, add } from './math';

console.log('PI:', PI);
console.log('2 + 3 =', add(2, 3));

const calc = new Calculator(3);
console.log('四舍五入:', calc.round(3.14159));
```

### 模块解析配置

```typescript
// tsconfig.json 配置示例
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    },
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}

// 使用路径映射
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
import { ApiResponse } from '@types/api';
```

## 🚀 动态导入和代码分割

### 基础动态导入

```typescript
// 动态导入管理器
class ModuleLoader {
    private cache = new Map<string, any>();
    
    async loadModule<T = any>(modulePath: string): Promise<T> {
        if (this.cache.has(modulePath)) {
            return this.cache.get(modulePath);
        }
        
        console.log(`Loading module: ${modulePath}`);
        const module = await import(modulePath);
        this.cache.set(modulePath, module);
        
        return module;
    }
    
    async preloadModules(paths: string[]): Promise<void> {
        const promises = paths.map(path => this.loadModule(path));
        await Promise.all(promises);
        console.log('Preloading completed');
    }
}

// 路由级代码分割
interface Route {
    path: string;
    component: () => Promise<any>;
}

class Router {
    private routes = new Map<string, Route>();
    private loader = new ModuleLoader();
    
    register(path: string, component: () => Promise<any>): void {
        this.routes.set(path, { path, component });
    }
    
    async navigate(path: string): Promise<any> {
        const route = this.routes.get(path);
        if (!route) {
            throw new Error(`Route not found: ${path}`);
        }
        
        return await route.component();
    }
}

// 使用示例
const router = new Router();

// 注册路由
router.register('/home', () => import('./pages/Home'));
router.register('/profile', () => import('./pages/Profile'));

// 导航
router.navigate('/home');
```

### 功能模块的按需加载

```typescript
// 功能管理器
class FeatureManager {
    private features = new Map<string, any>();
    
    async loadFeature(name: string): Promise<any> {
        if (this.features.has(name)) {
            return this.features.get(name);
        }
        
        try {
            const module = await import(`./features/${name}`);
            
            // 初始化功能
            if (module.default?.init) {
                await module.default.init();
            }
            
            this.features.set(name, module);
            console.log(`Feature loaded: ${name}`);
            
            return module;
        } catch (error) {
            console.error(`Failed to load feature: ${name}`, error);
            throw error;
        }
    }
    
    async unloadFeature(name: string): Promise<void> {
        const feature = this.features.get(name);
        if (feature?.default?.destroy) {
            await feature.default.destroy();
        }
        
        this.features.delete(name);
        console.log(`Feature unloaded: ${name}`);
    }
    
    isLoaded(name: string): boolean {
        return this.features.has(name);
    }
}

// 使用示例
const featureManager = new FeatureManager();

// 按需加载功能
await featureManager.loadFeature('analytics');
await featureManager.loadFeature('chat');
```

## 🌐 模块联邦和共享

### 跨应用模块共享

```typescript
// 模块联邦管理器
interface FederationConfig {
    name: string;
    remotes: Record<string, string>;
    shared: Record<string, any>;
}

class ModuleFederation {
    private config: FederationConfig;
    private remoteCache = new Map<string, any>();
    private sharedModules = new Map<string, any>();
    
    constructor(config: FederationConfig) {
        this.config = config;
        this.initShared();
    }
    
    private initShared(): void {
        for (const [name, config] of Object.entries(this.config.shared)) {
            this.sharedModules.set(name, config);
        }
    }
    
    async loadRemote(remoteName: string, moduleName: string): Promise<any> {
        const cacheKey = `${remoteName}/${moduleName}`;
        
        if (this.remoteCache.has(cacheKey)) {
            return this.remoteCache.get(cacheKey);
        }
        
        const remoteUrl = this.config.remotes[remoteName];
        if (!remoteUrl) {
            throw new Error(`Remote not found: ${remoteName}`);
        }
        
        // 模拟远程模块加载
        const module = await this.loadRemoteModule(remoteUrl, moduleName);
        this.remoteCache.set(cacheKey, module);
        
        return module;
    }
    
    private async loadRemoteModule(url: string, module: string): Promise<any> {
        // 实际环境中会加载远程脚本
        console.log(`Loading remote module: ${module} from ${url}`);
        return {
            default: {
                name: module,
                render: () => `Remote component: ${module}`
            }
        };
    }
}

// 共享资源管理
class SharedResourceManager {
    private resources = new Map<string, any>();
    private listeners = new Map<string, Set<Function>>();
    
    register<T>(name: string, resource: T): void {
        this.resources.set(name, resource);
        
        // 通知监听者
        const callbacks = this.listeners.get(name);
        if (callbacks) {
            callbacks.forEach(callback => callback(resource));
        }
    }
    
    get<T>(name: string): T | undefined {
        return this.resources.get(name);
    }
    
    subscribe(name: string, callback: Function): () => void {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, new Set());
        }
        
        this.listeners.get(name)!.add(callback);
        
        // 如果资源已存在，立即调用
        const resource = this.resources.get(name);
        if (resource) {
            callback(resource);
        }
        
        // 返回取消订阅函数
        return () => this.listeners.get(name)?.delete(callback);
    }
}

// 使用示例
const federation = new ModuleFederation({
    name: 'host-app',
    remotes: {
        'app1': 'http://localhost:3001/remoteEntry.js',
        'app2': 'http://localhost:3002/remoteEntry.js'
    },
    shared: {
        'react': { singleton: true },
        'lodash': { singleton: false }
    }
});

const sharedManager = new SharedResourceManager();

// 注册共享状态
sharedManager.register('user', {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com'
});

// 订阅状态变化
const unsubscribe = sharedManager.subscribe('user', (user) => {
    console.log('User updated:', user);
});
```

## 🛠️ 实用工具

### 模块依赖分析

```typescript
// 依赖分析器
interface ModuleDependency {
    name: string;
    dependencies: string[];
    dependents: string[];
}

class DependencyAnalyzer {
    private modules = new Map<string, ModuleDependency>();
    
    addModule(name: string, dependencies: string[] = []): void {
        if (!this.modules.has(name)) {
            this.modules.set(name, {
                name,
                dependencies: [],
                dependents: []
            });
        }
        
        const module = this.modules.get(name)!;
        module.dependencies = dependencies;
        
        // 更新依赖的被依赖列表
        dependencies.forEach(dep => {
            if (!this.modules.has(dep)) {
                this.addModule(dep, []);
            }
            this.modules.get(dep)!.dependents.push(name);
        });
    }
    
    detectCircularDependencies(): string[][] {
        const cycles: string[][] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        
        for (const moduleName of this.modules.keys()) {
            if (!visited.has(moduleName)) {
                this.dfsDetectCycle(moduleName, visited, recursionStack, [], cycles);
            }
        }
        
        return cycles;
    }
    
    private dfsDetectCycle(
        moduleName: string,
        visited: Set<string>,
        recursionStack: Set<string>,
        path: string[],
        cycles: string[][]
    ): void {
        visited.add(moduleName);
        recursionStack.add(moduleName);
        path.push(moduleName);
        
        const module = this.modules.get(moduleName);
        if (module) {
            for (const dep of module.dependencies) {
                if (!visited.has(dep)) {
                    this.dfsDetectCycle(dep, visited, recursionStack, path, cycles);
                } else if (recursionStack.has(dep)) {
                    // 找到循环依赖
                    const cycleStart = path.indexOf(dep);
                    cycles.push([...path.slice(cycleStart), dep]);
                }
            }
        }
        
        recursionStack.delete(moduleName);
        path.pop();
    }
    
    getModuleInfo(name: string): ModuleDependency | undefined {
        return this.modules.get(name);
    }
    
    getAllModules(): ModuleDependency[] {
        return Array.from(this.modules.values());
    }
}

// 使用示例
const analyzer = new DependencyAnalyzer();

analyzer.addModule('App', ['Router', 'Store']);
analyzer.addModule('Router', ['Utils']);
analyzer.addModule('Store', ['API']);
analyzer.addModule('API', ['Utils']);
analyzer.addModule('Utils', []);

console.log('所有模块:', analyzer.getAllModules());
console.log('循环依赖:', analyzer.detectCircularDependencies());
```

## 📝 最佳实践

### 1. 模块组织原则

```typescript
// 好的模块组织
// utils/index.ts - 统一导出
export { formatDate, parseDate } from './date';
export { debounce, throttle } from './function';
export { isEmail, isPhone } from './validation';

// types/index.ts - 类型定义集中管理
export interface User {
    id: number;
    name: string;
    email: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    code: number;
}
```

### 2. 避免的反模式

```typescript
// ❌ 不要这样做 - 循环依赖
// moduleA.ts
import './moduleB';
export const a = 'A';

// moduleB.ts
import './moduleA';
export const b = 'B';

// ✅ 应该这样做 - 提取共同依赖
// shared.ts
export const shared = 'shared';

// moduleA.ts
import { shared } from './shared';
export const a = 'A' + shared;

// moduleB.ts
import { shared } from './shared';
export const b = 'B' + shared;
```

## 📝 练习题

### 基础练习
1. 实现一个模块缓存管理器，支持LRU策略
2. 创建一个路由懒加载系统
3. 实现模块预加载策略

### 高级练习
1. 构建一个完整的模块联邦系统
2. 实现跨框架的模块适配器
3. 创建智能的模块依赖分析工具

## 🚀 小结

通过本节学习，你掌握了：
- ✅ **模块系统**：ES6模块与CommonJS的差异
- ✅ **动态导入**：按需加载和代码分割
- ✅ **模块联邦**：跨应用模块共享
- ✅ **依赖管理**：循环依赖检测和解决

## 🚀 下一步

👉 **下一步：[命名空间与组织](./04-namespaces.md)**

---
> 💡 **记住**：现代 TypeScript 推荐使用 ES6 模块。合理的模块设计应该遵循单一职责原则，避免循环依赖，善用动态导入提升性能！ 