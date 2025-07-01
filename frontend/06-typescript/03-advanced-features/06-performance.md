# TypeScript 性能优化

> 掌握 TypeScript 编译性能优化和运行时性能提升技巧

## 🎯 学习目标
- TypeScript 编译器性能优化
- 运行时性能优化技术
- 内存管理和垃圾回收优化
- 打包和部署性能优化

## ⚡ 编译性能优化

### tsconfig.json 优化配置

```typescript
// 优化的 tsconfig.json 配置
{
  "compilerOptions": {
    // 性能优化配置
    "incremental": true,                    // 启用增量编译
    "tsBuildInfoFile": ".tsbuildinfo",     // 指定构建信息文件
    "composite": true,                      // 启用项目引用
    
    // 跳过库检查以提升速度
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    
    // 减少类型检查工作
    "noEmitOnError": false,
    "isolatedModules": true,
    
    // 输出优化
    "noEmit": true,                        // 不生成输出文件
    "importHelpers": true,                 // 使用 tslib 减少重复代码
    
    // 路径映射优化
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"]
    }
  },
  
  // 编译优化
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### 编译性能分析

```typescript
// 编译性能分析工具
interface CompilationStats {
    totalTime: number;
    fileCount: number;
    averageFileTime: number;
    slowestFiles: Array<{ file: string; time: number }>;
}

class TypeScriptPerformanceAnalyzer {
    private compilationTimes = new Map<string, number>();
    private startTime: number = 0;
    
    startCompilation(): void {
        this.startTime = performance.now();
        console.log('开始 TypeScript 编译分析...');
    }
    
    recordFileCompilation(filename: string, duration: number): void {
        this.compilationTimes.set(filename, duration);
    }
    
    endCompilation(): CompilationStats {
        const totalTime = performance.now() - this.startTime;
        const fileCount = this.compilationTimes.size;
        const averageFileTime = totalTime / fileCount;
        
        const slowestFiles = Array.from(this.compilationTimes.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([file, time]) => ({ file, time }));
        
        return {
            totalTime,
            fileCount,
            averageFileTime,
            slowestFiles
        };
    }
    
    generateOptimizationSuggestions(stats: CompilationStats): string[] {
        const suggestions: string[] = [];
        
        if (stats.totalTime > 30000) {
            suggestions.push('考虑启用增量编译 (incremental: true)');
            suggestions.push('使用项目引用分割大型项目');
        }
        
        if (stats.averageFileTime > 100) {
            suggestions.push('启用 skipLibCheck 跳过库类型检查');
            suggestions.push('考虑使用 isolatedModules 模式');
        }
        
        return suggestions;
    }
}

// 使用示例
const analyzer = new TypeScriptPerformanceAnalyzer();
analyzer.startCompilation();

// 模拟文件编译
analyzer.recordFileCompilation('src/types/complex.ts', 1200);
analyzer.recordFileCompilation('src/utils/helpers.ts', 300);
analyzer.recordFileCompilation('src/components/Form.tsx', 800);

const stats = analyzer.endCompilation();
console.log('编译统计:', stats);

const suggestions = analyzer.generateOptimizationSuggestions(stats);
console.log('优化建议:', suggestions);
```

## 🚀 运行时性能优化

### 类型优化技术

```typescript
// 高效的类型定义
// ❌ 避免：复杂的递归类型
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ✅ 推荐：限制递归深度
type OptimizedReadonly<T, Depth extends number = 3> = Depth extends 0
    ? T
    : {
        readonly [P in keyof T]: T[P] extends object 
            ? OptimizedReadonly<T[P], Prev<Depth>>
            : T[P];
    };

type Prev<T extends number> = T extends 3 ? 2 
    : T extends 2 ? 1
    : T extends 1 ? 0
    : never;

// 高效的类型守卫
interface User {
    type: 'user';
    id: number;
    name: string;
}

interface Admin {
    type: 'admin';
    id: number;
    name: string;
    permissions: string[];
}

type Entity = User | Admin;

function isUser(entity: Entity): entity is User {
    return entity.type === 'user';
}

// 使用 const assertions 提升性能
const CONFIG = {
    API_URL: 'https://api.example.com',
    TIMEOUT: 5000,
    FEATURES: {
        ANALYTICS: true,
        NOTIFICATIONS: false
    }
} as const;

type AppConfig = typeof CONFIG;
```

### 内存优化模式

```typescript
// 对象池模式 - 减少GC压力
class ObjectPool<T> {
    private pool: T[] = [];
    private createFn: () => T;
    private resetFn: (obj: T) => void;
    
    constructor(
        createFn: () => T,
        resetFn: (obj: T) => void,
        initialSize: number = 10
    ) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        
        // 预分配对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
        }
    }
    
    acquire(): T {
        return this.pool.length > 0 ? this.pool.pop()! : this.createFn();
    }
    
    release(obj: T): void {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

// LRU 缓存实现
class LRUCache<K, V> {
    private capacity: number;
    private cache = new Map<K, V>();
    
    constructor(capacity: number) {
        this.capacity = capacity;
    }
    
    get(key: K): V | undefined {
        if (this.cache.has(key)) {
            const value = this.cache.get(key)!;
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return undefined;
    }
    
    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}

// 使用示例
interface Point {
    x: number;
    y: number;
}

const pointPool = new ObjectPool<Point>(
    () => ({ x: 0, y: 0 }),
    (point) => { point.x = 0; point.y = 0; },
    50
);

function calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// 高效处理大量坐标
function processPoints(coordinates: number[][]): number {
    let totalDistance = 0;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
        const p1 = pointPool.acquire();
        const p2 = pointPool.acquire();
        
        p1.x = coordinates[i][0];
        p1.y = coordinates[i][1];
        p2.x = coordinates[i + 1][0];
        p2.y = coordinates[i + 1][1];
        
        totalDistance += calculateDistance(p1, p2);
        
        pointPool.release(p1);
        pointPool.release(p2);
    }
    
    return totalDistance;
}

console.log('=== 内存优化示例 ===');
const testCoords = [[0, 0], [3, 4], [6, 8], [9, 12]];
const distance = processPoints(testCoords);
console.log('总距离:', distance);
```

## 🧠 内存泄漏预防

### 资源管理器

```typescript
// 内存泄漏检测器
class MemoryLeakDetector {
    private timers = new Set<NodeJS.Timeout>();
    private eventListeners = new Map<EventTarget, Map<string, Function>>();
    
    // 安全的定时器管理
    setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
        const timer = setTimeout(() => {
            callback();
            this.timers.delete(timer);
        }, delay);
        
        this.timers.add(timer);
        return timer;
    }
    
    clearTimeout(timer: NodeJS.Timeout): void {
        clearTimeout(timer);
        this.timers.delete(timer);
    }
    
    // 安全的事件监听器管理
    addEventListener(
        target: EventTarget,
        type: string,
        listener: (event: any) => void
    ): void {
        if (!this.eventListeners.has(target)) {
            this.eventListeners.set(target, new Map());
        }
        
        this.eventListeners.get(target)!.set(type, listener);
        target.addEventListener(type, listener);
    }
    
    removeEventListener(target: EventTarget, type: string): void {
        const listeners = this.eventListeners.get(target);
        if (listeners?.has(type)) {
            const listener = listeners.get(type)!;
            target.removeEventListener(type, listener);
            listeners.delete(type);
        }
    }
    
    // 清理所有资源
    cleanup(): void {
        // 清理定时器
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        
        // 清理事件监听器
        for (const [target, listeners] of this.eventListeners) {
            for (const [type, listener] of listeners) {
                target.removeEventListener(type, listener);
            }
        }
        this.eventListeners.clear();
    }
}

// 安全的组件基类
abstract class SafeComponent {
    protected detector = new MemoryLeakDetector();
    private isDestroyed = false;
    
    protected async safeAsync<T>(operation: () => Promise<T>): Promise<T | null> {
        if (this.isDestroyed) return null;
        
        try {
            return await operation();
        } catch (error) {
            if (!this.isDestroyed) {
                console.error('异步操作失败:', error);
            }
            return null;
        }
    }
    
    destroy(): void {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.detector.cleanup();
        this.onDestroy();
    }
    
    protected abstract onDestroy(): void;
}

// 示例组件
class DataComponent extends SafeComponent {
    private data: number[] = [];
    
    constructor() {
        super();
        this.initialize();
    }
    
    private initialize(): void {
        this.detector.addEventListener(window, 'resize', () => {
            console.log('窗口大小改变');
        });
        
        this.detector.setTimeout(() => {
            this.loadData();
        }, 1000);
    }
    
    async loadData(): Promise<void> {
        const result = await this.safeAsync(async () => {
            this.data = Array.from({ length: 1000 }, () => Math.random());
            return this.data.length;
        });
        
        if (result) {
            console.log('数据加载完成，数量:', result);
        }
    }
    
    protected onDestroy(): void {
        this.data = [];
        console.log('DataComponent 已销毁');
    }
}

// 使用示例
const component = new DataComponent();

setTimeout(() => {
    component.destroy();
}, 3000);
```

## 📦 打包优化

### Tree Shaking 优化

```typescript
// 支持 Tree Shaking 的模块结构
// utils/index.ts - 分别导出，而不是 export *
export { debounce } from './debounce';
export { throttle } from './throttle';
export { memoize } from './memoize';

// 高效的工具函数
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = func(...args);
        cache.set(key, result);
        return result;
    }) as T;
}

// 代码分割示例
export const ComponentA = () => import('./ComponentA');
export const ComponentB = () => import('./ComponentB');

// 按需加载路由
interface Route {
    path: string;
    component: () => Promise<any>;
}

const routes: Route[] = [
    {
        path: '/home',
        component: () => import('./pages/Home')
    },
    {
        path: '/profile',
        component: () => import('./pages/Profile')
    }
];
```

## 📊 性能监控

### 简单性能监控

```typescript
// 性能监控器
class PerformanceMonitor {
    private metrics = new Map<string, number[]>();
    
    // 记录性能指标
    recordMetric(name: string, value: number): void {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(value);
    }
    
    // 测量函数执行时间
    measure<T>(name: string, operation: () => T): T {
        const start = performance.now();
        try {
            const result = operation();
            this.recordMetric(name, performance.now() - start);
            return result;
        } catch (error) {
            this.recordMetric(`${name}.error`, performance.now() - start);
            throw error;
        }
    }
    
    async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
        const start = performance.now();
        try {
            const result = await operation();
            this.recordMetric(name, performance.now() - start);
            return result;
        } catch (error) {
            this.recordMetric(`${name}.error`, performance.now() - start);
            throw error;
        }
    }
    
    // 生成性能报告
    generateReport(): Record<string, {
        count: number;
        average: number;
        min: number;
        max: number;
    }> {
        const report: any = {};
        
        for (const [name, values] of this.metrics) {
            if (values.length === 0) continue;
            
            const sum = values.reduce((a, b) => a + b, 0);
            report[name] = {
                count: values.length,
                average: sum / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
            };
        }
        
        return report;
    }
}

// 分批处理器
class BatchProcessor {
    private monitor = new PerformanceMonitor();
    
    async processBatches<T, R>(
        data: T[],
        processor: (item: T) => R,
        batchSize: number = 100
    ): Promise<R[]> {
        return this.monitor.measureAsync('batch-processing', async () => {
            const results: R[] = [];
            
            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                const batchResults = batch.map(processor);
                results.push(...batchResults);
                
                // 让出控制权
                if (i + batchSize < data.length) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            
            return results;
        });
    }
    
    get report() {
        return this.monitor.generateReport();
    }
}

// 使用示例
async function demonstratePerformance() {
    console.log('\n=== 性能监控示例 ===');
    
    const processor = new BatchProcessor();
    
    const data = Array.from({ length: 10000 }, (_, i) => i);
    
    const results = await processor.processBatches(
        data,
        (x) => x * 2,
        1000
    );
    
    console.log('处理完成:', results.length);
    console.log('性能报告:', processor.report);
}

demonstratePerformance();
```

## 📝 最佳实践

### 优化检查清单

```typescript
// 编译时优化
const COMPILE_OPTIMIZATIONS = [
    '✅ 启用增量编译 (incremental: true)',
    '✅ 配置 skipLibCheck 跳过库检查',
    '✅ 使用项目引用分割大型项目',
    '✅ 优化 include/exclude 配置',
    '✅ 合理使用路径映射'
] as const;

// 运行时优化
const RUNTIME_OPTIMIZATIONS = [
    '✅ 避免复杂的递归类型定义',
    '✅ 使用对象池减少GC压力',
    '✅ 实施内存泄漏检测',
    '✅ 合理使用缓存策略',
    '✅ 分批处理大数据集'
] as const;

// 打包优化
const BUNDLE_OPTIMIZATIONS = [
    '✅ 配置 Tree Shaking',
    '✅ 代码分割和懒加载',
    '✅ 设置性能预算',
    '✅ 优化依赖管理',
    '✅ 监控包大小变化'
] as const;

console.log('编译优化:', COMPILE_OPTIMIZATIONS);
console.log('运行时优化:', RUNTIME_OPTIMIZATIONS);
console.log('打包优化:', BUNDLE_OPTIMIZATIONS);
```

## 📝 练习题

### 基础练习
1. 优化一个 tsconfig.json 配置文件
2. 实现一个简单的对象池
3. 创建一个内存泄漏检测器

### 高级练习
1. 构建一个性能监控系统
2. 实现智能的缓存策略
3. 设计自动化性能测试工具

## 🚀 小结

通过本节学习，你掌握了：
- ✅ **编译优化**：TypeScript 编译器性能调优
- ✅ **运行时优化**：内存管理和缓存策略
- ✅ **打包优化**：Tree Shaking 和代码分割
- ✅ **性能监控**：实时性能指标收集

## 🚀 下一步

👉 **下一步：[高级配置](./07-advanced-config.md)**

---
> 💡 **记住**：性能优化要基于实际数据进行，避免过早优化。持续监控和测量是性能优化的关键！ 