# TypeScript 声明文件

> 掌握声明文件编写，为 JavaScript 库添加类型支持，构建类型安全的开发环境

## 🎯 学习目标

完成本节后，你将掌握：

- 声明文件 (.d.ts) 的作用和语法
- 模块声明和全局声明
- 第三方库的类型定义
- 自定义声明文件的编写
- 声明合并和模块扩展

## 📝 声明文件基础

声明文件（.d.ts）包含类型信息但不包含实现，用于为 JavaScript 代码提供 TypeScript 类型支持。

### 基本声明语法

```typescript
// math-utils.d.ts
// 函数声明
declare function add(a: number, b: number): number;
declare function multiply(a: number, b: number): number;

// 变量声明
declare const PI: number;
declare let currentVersion: string;

// 类声明
declare class Calculator {
    value: number;
    constructor(initialValue?: number);
    add(n: number): Calculator;
    subtract(n: number): Calculator;
    multiply(n: number): Calculator;
    divide(n: number): Calculator;
    getResult(): number;
}

// 接口声明
declare interface MathOptions {
    precision?: number;
    roundingMode?: 'floor' | 'ceil' | 'round';
}

// 类型别名声明
declare type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

// 枚举声明
declare enum MathConstants {
    E = 2.718281828,
    PI = 3.141592654,
    SQRT2 = 1.414213562
}

// 命名空间声明
declare namespace MathUtils {
    function random(min: number, max: number): number;
    function clamp(value: number, min: number, max: number): number;
    
    namespace Geometry {
        function circleArea(radius: number): number;
        function rectangleArea(width: number, height: number): number;
    }
}

console.log("=== 声明文件基础示例 ===");
console.log("声明文件语法定义完成");
```

### 模块声明

```typescript
// 模块声明的不同方式

// 1. ES6 模块声明
// lodash.d.ts
declare module 'lodash' {
    interface LodashStatic {
        chunk<T>(array: T[], size?: number): T[][];
        compact<T>(array: (T | null | undefined | false | "" | 0)[]): T[];
        uniq<T>(array: T[]): T[];
        flatten<T>(array: T[] | T[][]): T[];
        groupBy<T>(array: T[], iteratee: (item: T) => any): Record<string, T[]>;
    }
    
    const _: LodashStatic;
    export = _;
}

// 2. 默认导出声明
// moment.d.ts
declare module 'moment' {
    interface Moment {
        format(format?: string): string;
        add(value: number, unit: string): Moment;
        subtract(value: number, unit: string): Moment;
        isBefore(moment: Moment): boolean;
        isAfter(moment: Moment): boolean;
    }
    
    interface MomentStatic {
        (date?: string | Date): Moment;
        now(): number;
        utc(): Moment;
    }
    
    const moment: MomentStatic;
    export = moment;
}

// 3. 命名导出声明
// axios.d.ts
declare module 'axios' {
    interface AxiosRequestConfig {
        url?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        headers?: Record<string, string>;
        data?: any;
        timeout?: number;
    }
    
    interface AxiosResponse<T = any> {
        data: T;
        status: number;
        statusText: string;
        headers: Record<string, string>;
    }
    
    interface AxiosStatic {
        get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
        delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    }
    
    export const axios: AxiosStatic;
    export default axios;
}

console.log("\n=== 模块声明示例 ===");
```

### 全局声明

```typescript
// global.d.ts
// 全局变量声明
declare global {
    // 扩展 Window 接口
    interface Window {
        myGlobalVariable: string;
        customAPI: {
            version: string;
            initialize(): void;
            destroy(): void;
        };
        gtag: (command: string, ...args: any[]) => void;
    }
    
    // 全局函数
    function createUUID(): string;
    function formatCurrency(amount: number, currency?: string): string;
    
    // 全局常量
    const APP_VERSION: string;
    const BUILD_TIME: string;
    const IS_DEVELOPMENT: boolean;
    
    // 全局类型
    type UserRole = 'admin' | 'user' | 'guest';
    type ApiStatus = 'loading' | 'success' | 'error';
    
    // 全局命名空间
    namespace AppConfig {
        interface Database {
            host: string;
            port: number;
            name: string;
        }
        
        interface API {
            baseUrl: string;
            timeout: number;
            retryCount: number;
        }
        
        interface App {
            name: string;
            version: string;
            database: Database;
            api: API;
        }
    }
    
    // jQuery 扩展示例
    interface JQuery {
        customPlugin(options?: any): JQuery;
        fadeInOut(duration?: number): JQuery;
    }
    
    interface JQueryStatic {
        customUtility(value: any): any;
    }
}

// 必须导出空对象以使其成为模块
export {};

console.log("\n=== 全局声明示例 ===");
```

## 🔧 实际库声明示例

### 为第三方库编写声明

```typescript
// chart.js.d.ts
// 为图表库编写声明文件
declare module 'chart.js' {
    export interface ChartConfiguration {
        type: ChartType;
        data: ChartData;
        options?: ChartOptions;
    }
    
    export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter' | 'bubble';
    
    export interface ChartData {
        labels?: string[];
        datasets: ChartDataset[];
    }
    
    export interface ChartDataset {
        label?: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
    }
    
    export interface ChartOptions {
        responsive?: boolean;
        maintainAspectRatio?: boolean;
        scales?: {
            x?: ScaleOptions;
            y?: ScaleOptions;
        };
        plugins?: {
            legend?: LegendOptions;
            tooltip?: TooltipOptions;
        };
    }
    
    export interface ScaleOptions {
        display?: boolean;
        title?: {
            display?: boolean;
            text?: string;
        };
        min?: number;
        max?: number;
    }
    
    export interface LegendOptions {
        display?: boolean;
        position?: 'top' | 'left' | 'bottom' | 'right';
    }
    
    export interface TooltipOptions {
        enabled?: boolean;
        mode?: 'nearest' | 'point' | 'index' | 'dataset' | 'x' | 'y';
    }
    
    export class Chart {
        constructor(ctx: CanvasRenderingContext2D | HTMLCanvasElement, config: ChartConfiguration);
        update(mode?: 'resize' | 'reset' | 'none'): void;
        destroy(): void;
        render(): void;
        getElementsAtEventForMode(event: Event, mode: string, options: any, useFinalPosition?: boolean): any[];
    }
    
    export default Chart;
}

// validation.d.ts
// 为验证库编写声明文件
declare module 'validator' {
    interface ValidatorJS {
        // 字符串验证
        isEmail(str: string, options?: {
            allow_display_name?: boolean;
            require_display_name?: boolean;
            allow_utf8_local_part?: boolean;
            require_tld?: boolean;
        }): boolean;
        
        isURL(str: string, options?: {
            protocols?: string[];
            require_tld?: boolean;
            require_protocol?: boolean;
            require_host?: boolean;
            require_valid_protocol?: boolean;
            allow_underscores?: boolean;
            host_whitelist?: string[];
            host_blacklist?: string[];
            allow_trailing_dot?: boolean;
            allow_protocol_relative_urls?: boolean;
        }): boolean;
        
        isLength(str: string, options: {
            min?: number;
            max?: number;
        }): boolean;
        
        isNumeric(str: string, options?: {
            no_symbols?: boolean;
            locale?: string;
        }): boolean;
        
        isMobilePhone(str: string, locale?: string | string[]): boolean;
        
        // 清理函数
        escape(input: string): string;
        unescape(input: string): string;
        trim(input: string, chars?: string): string;
        blacklist(input: string, chars: string): string;
        whitelist(input: string, chars: string): string;
        
        // 转换函数
        toBoolean(input: string, strict?: boolean): boolean;
        toDate(input: string): Date;
        toFloat(input: string): number;
        toInt(input: string, radix?: number): number;
    }
    
    const validator: ValidatorJS;
    export = validator;
}

console.log("\n=== 实际库声明示例 ===");
```

### 自定义工具库声明

```typescript
// utils.d.ts
// 为自定义工具库编写声明文件
declare module '@myorg/utils' {
    // 日期工具
    export namespace DateUtils {
        function formatDate(date: Date, format: string): string;
        function parseDate(dateString: string, format: string): Date;
        function addDays(date: Date, days: number): Date;
        function diffDays(date1: Date, date2: Date): number;
        function isWeekend(date: Date): boolean;
        function getWeekNumber(date: Date): number;
    }
    
    // 字符串工具
    export namespace StringUtils {
        function camelCase(str: string): string;
        function kebabCase(str: string): string;
        function snakeCase(str: string): string;
        function capitalize(str: string): string;
        function truncate(str: string, length: number, suffix?: string): string;
        function slugify(str: string): string;
    }
    
    // 数组工具
    export namespace ArrayUtils {
        function chunk<T>(array: T[], size: number): T[][];
        function uniq<T>(array: T[]): T[];
        function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]>;
        function sortBy<T>(array: T[], iteratee: (item: T) => any): T[];
        function shuffle<T>(array: T[]): T[];
        function sample<T>(array: T[], count?: number): T | T[];
    }
    
    // 对象工具
    export namespace ObjectUtils {
        function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
        function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
        function merge<T extends object, U extends object>(target: T, source: U): T & U;
        function deepClone<T>(obj: T): T;
        function isEmpty(obj: any): boolean;
        function hasProperty<T, K extends string>(obj: T, prop: K): obj is T & Record<K, unknown>;
    }
    
    // 异步工具
    export namespace AsyncUtils {
        function delay(ms: number): Promise<void>;
        function timeout<T>(promise: Promise<T>, ms: number): Promise<T>;
        function retry<T>(fn: () => Promise<T>, options?: {
            attempts?: number;
            delay?: number;
            backoff?: boolean;
        }): Promise<T>;
        function parallel<T>(tasks: (() => Promise<T>)[], concurrency?: number): Promise<T[]>;
        function series<T>(tasks: (() => Promise<T>)[]): Promise<T[]>;
    }
    
    // 验证工具
    export namespace ValidationUtils {
        interface ValidationResult {
            isValid: boolean;
            errors: string[];
        }
        
        function validateEmail(email: string): ValidationResult;
        function validatePassword(password: string, options?: {
            minLength?: number;
            requireUppercase?: boolean;
            requireLowercase?: boolean;
            requireNumbers?: boolean;
            requireSymbols?: boolean;
        }): ValidationResult;
        function validatePhoneNumber(phone: string, countryCode?: string): ValidationResult;
        function validateURL(url: string): ValidationResult;
    }
    
    // HTTP 客户端
    export class HttpClient {
        constructor(config?: {
            baseURL?: string;
            timeout?: number;
            headers?: Record<string, string>;
        });
        
        get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
        post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
        put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
        patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
        delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
        
        setDefaultHeader(name: string, value: string): void;
        removeDefaultHeader(name: string): void;
    }
    
    export interface RequestConfig {
        headers?: Record<string, string>;
        timeout?: number;
        params?: Record<string, any>;
    }
    
    export interface ApiResponse<T = any> {
        data: T;
        status: number;
        statusText: string;
        headers: Record<string, string>;
    }
    
    // 事件发射器
    export class EventEmitter<T extends Record<string, any>> {
        on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
        off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
        emit<K extends keyof T>(event: K, data: T[K]): void;
        once<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
        removeAllListeners<K extends keyof T>(event?: K): void;
    }
}

console.log("\n=== 自定义工具库声明示例 ===");
```

## 🔀 声明合并

TypeScript 允许将同名的声明合并在一起。

### 接口合并

```typescript
// user.d.ts
// 接口声明合并
interface User {
    id: number;
    name: string;
}

interface User {
    email: string;
    avatar?: string;
}

// 合并后的 User 接口等同于：
// interface User {
//     id: number;
//     name: string;
//     email: string;
//     avatar?: string;
// }

// 扩展第三方库接口
declare module 'express' {
    interface Request {
        user?: {
            id: number;
            email: string;
            role: string;
        };
        sessionId?: string;
    }
    
    interface Response {
        success(data?: any): Response;
        error(message: string, code?: number): Response;
    }
}

// jQuery 扩展示例
declare global {
    interface JQuery {
        myPlugin(options?: {
            speed?: number;
            easing?: string;
            callback?: () => void;
        }): JQuery;
    }
}

console.log("\n=== 接口合并示例 ===");
```

### 模块扩展

```typescript
// module-extension.d.ts
// 扩展现有模块
declare module 'lodash' {
    interface LodashStatic {
        // 添加自定义方法
        customMethod<T>(array: T[], predicate: (item: T) => boolean): T[];
        safeGet<T>(object: any, path: string, defaultValue?: T): T;
    }
}

// 扩展 Node.js 内置模块
declare module 'fs' {
    interface Stats {
        isDirectory(): boolean;
        isFile(): boolean;
        // 添加自定义属性
        humanReadableSize: string;
    }
}

// 扩展全局对象
declare global {
    interface Array<T> {
        // 添加数组方法
        groupBy<K extends keyof T>(key: K): Record<string, T[]>;
        unique(): T[];
        asyncMap<U>(fn: (item: T) => Promise<U>): Promise<U[]>;
    }
    
    interface String {
        // 添加字符串方法
        toTitleCase(): string;
        truncate(length: number, suffix?: string): string;
        isEmail(): boolean;
    }
    
    interface Number {
        // 添加数字方法
        toFileSize(): string;
        toCurrency(currency?: string, locale?: string): string;
    }
}

console.log("\n=== 模块扩展示例 ===");
```

### 命名空间合并

```typescript
// namespace-merge.d.ts
// 命名空间声明合并
declare namespace MyLib {
    interface Config {
        apiUrl: string;
        timeout: number;
    }
    
    function init(config: Config): void;
}

declare namespace MyLib {
    interface Config {
        debug?: boolean;
        retryCount?: number;
    }
    
    function destroy(): void;
    function getVersion(): string;
}

// 合并后的命名空间包含所有声明
// declare namespace MyLib {
//     interface Config {
//         apiUrl: string;
//         timeout: number;
//         debug?: boolean;
//         retryCount?: number;
//     }
//     
//     function init(config: Config): void;
//     function destroy(): void;
//     function getVersion(): string;
// }

// 命名空间与类合并
declare class EventEmitter {
    on(event: string, listener: Function): void;
    emit(event: string, ...args: any[]): void;
}

declare namespace EventEmitter {
    interface EventMap extends Record<string, any> {}
    
    function listenerCount(emitter: EventEmitter, event: string): number;
    function defaultMaxListeners: number;
}

console.log("\n=== 命名空间合并示例 ===");
```

## 🚀 实际应用场景

### React 组件库声明

```typescript
// react-components.d.ts
// React 组件库类型声明
declare module '@myorg/react-components' {
    import { ComponentType, ReactNode, CSSProperties } from 'react';
    
    // 按钮组件
    export interface ButtonProps {
        variant?: 'primary' | 'secondary' | 'danger' | 'outline';
        size?: 'small' | 'medium' | 'large';
        disabled?: boolean;
        loading?: boolean;
        onClick?: () => void;
        children: ReactNode;
        className?: string;
        style?: CSSProperties;
    }
    
    export const Button: ComponentType<ButtonProps>;
    
    // 输入框组件
    export interface InputProps {
        type?: 'text' | 'email' | 'password' | 'number';
        placeholder?: string;
        value?: string;
        defaultValue?: string;
        disabled?: boolean;
        error?: string;
        label?: string;
        required?: boolean;
        onChange?: (value: string) => void;
        onBlur?: () => void;
        onFocus?: () => void;
        className?: string;
        style?: CSSProperties;
    }
    
    export const Input: ComponentType<InputProps>;
    
    // 模态框组件
    export interface ModalProps {
        open: boolean;
        title?: string;
        size?: 'small' | 'medium' | 'large' | 'fullscreen';
        closable?: boolean;
        maskClosable?: boolean;
        onClose?: () => void;
        onConfirm?: () => void;
        onCancel?: () => void;
        footer?: ReactNode;
        children: ReactNode;
        className?: string;
        style?: CSSProperties;
    }
    
    export const Modal: ComponentType<ModalProps>;
    
    // 表格组件
    export interface Column<T = any> {
        key: string;
        title: string;
        dataIndex?: keyof T;
        width?: number | string;
        align?: 'left' | 'center' | 'right';
        fixed?: 'left' | 'right';
        sortable?: boolean;
        filterable?: boolean;
        render?: (value: any, record: T, index: number) => ReactNode;
    }
    
    export interface TableProps<T = any> {
        columns: Column<T>[];
        dataSource: T[];
        rowKey?: keyof T | ((record: T) => string);
        loading?: boolean;
        pagination?: {
            current?: number;
            pageSize?: number;
            total?: number;
            showSizeChanger?: boolean;
            showQuickJumper?: boolean;
            onChange?: (page: number, pageSize: number) => void;
        };
        rowSelection?: {
            type?: 'checkbox' | 'radio';
            selectedRowKeys?: string[];
            onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
        };
        expandable?: {
            expandedRowKeys?: string[];
            onExpand?: (expanded: boolean, record: T) => void;
            expandedRowRender?: (record: T) => ReactNode;
        };
        className?: string;
        style?: CSSProperties;
    }
    
    export const Table: <T = any>(props: TableProps<T>) => JSX.Element;
    
    // 表单组件
    export interface FormProps {
        layout?: 'horizontal' | 'vertical' | 'inline';
        initialValues?: Record<string, any>;
        onSubmit?: (values: Record<string, any>) => void;
        onValuesChange?: (changedValues: Record<string, any>, allValues: Record<string, any>) => void;
        validateOnChange?: boolean;
        children: ReactNode;
        className?: string;
        style?: CSSProperties;
    }
    
    export const Form: ComponentType<FormProps>;
    
    // 表单项组件
    export interface FormItemProps {
        name: string;
        label?: string;
        rules?: Array<{
            required?: boolean;
            message?: string;
            pattern?: RegExp;
            validator?: (value: any) => Promise<void> | void;
        }>;
        tooltip?: string;
        children: ReactNode;
        className?: string;
        style?: CSSProperties;
    }
    
    export const FormItem: ComponentType<FormItemProps>;
    
    // 主题提供者
    export interface Theme {
        colors: {
            primary: string;
            secondary: string;
            success: string;
            warning: string;
            error: string;
            info: string;
            text: string;
            background: string;
            border: string;
        };
        typography: {
            fontFamily: string;
            fontSize: {
                small: string;
                medium: string;
                large: string;
            };
            fontWeight: {
                normal: number;
                medium: number;
                bold: number;
            };
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        breakpoints: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
    }
    
    export interface ThemeProviderProps {
        theme: Theme;
        children: ReactNode;
    }
    
    export const ThemeProvider: ComponentType<ThemeProviderProps>;
    export const useTheme: () => Theme;
    
    // 预定义主题
    export const lightTheme: Theme;
    export const darkTheme: Theme;
}

console.log("\n=== React 组件库声明示例 ===");
```

### Node.js 服务端声明

```typescript
// server-utils.d.ts
// Node.js 服务端工具声明
declare module '@myorg/server-utils' {
    import { Request, Response, NextFunction } from 'express';
    
    // 数据库连接器
    export class DatabaseConnector {
        constructor(config: {
            host: string;
            port: number;
            database: string;
            username: string;
            password: string;
            ssl?: boolean;
            pool?: {
                min?: number;
                max?: number;
                idle?: number;
            };
        });
        
        connect(): Promise<void>;
        disconnect(): Promise<void>;
        query<T = any>(sql: string, params?: any[]): Promise<T[]>;
        queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
        transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
    }
    
    export interface Transaction {
        query<T = any>(sql: string, params?: any[]): Promise<T[]>;
        queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
        commit(): Promise<void>;
        rollback(): Promise<void>;
    }
    
    // 中间件
    export interface AuthMiddlewareOptions {
        secretKey: string;
        algorithm?: 'HS256' | 'HS384' | 'HS512';
        expiresIn?: string | number;
        issuer?: string;
        audience?: string;
    }
    
    export function authMiddleware(options: AuthMiddlewareOptions): (
        req: Request,
        res: Response,
        next: NextFunction
    ) => void;
    
    export interface RateLimitOptions {
        windowMs: number;
        max: number;
        message?: string;
        statusCode?: number;
        headers?: boolean;
        skipSuccessfulRequests?: boolean;
        skipFailedRequests?: boolean;
        keyGenerator?: (req: Request) => string;
    }
    
    export function rateLimitMiddleware(options: RateLimitOptions): (
        req: Request,
        res: Response,
        next: NextFunction
    ) => void;
    
    export interface CorsOptions {
        origin?: string | string[] | boolean | ((origin: string) => boolean);
        methods?: string | string[];
        allowedHeaders?: string | string[];
        exposedHeaders?: string | string[];
        credentials?: boolean;
        maxAge?: number;
        preflightContinue?: boolean;
        optionsSuccessStatus?: number;
    }
    
    export function corsMiddleware(options?: CorsOptions): (
        req: Request,
        res: Response,
        next: NextFunction
    ) => void;
    
    // 缓存服务
    export class CacheService {
        constructor(config: {
            type: 'memory' | 'redis';
            redis?: {
                host: string;
                port: number;
                password?: string;
                db?: number;
            };
            ttl?: number;
        });
        
        get<T = any>(key: string): Promise<T | null>;
        set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
        delete(key: string): Promise<void>;
        clear(): Promise<void>;
        has(key: string): Promise<boolean>;
        keys(pattern?: string): Promise<string[]>;
    }
    
    // 日志服务
    export interface LoggerOptions {
        level?: 'debug' | 'info' | 'warn' | 'error';
        format?: 'json' | 'text';
        transports?: Array<{
            type: 'console' | 'file' | 'database';
            options?: any;
        }>;
    }
    
    export class Logger {
        constructor(options?: LoggerOptions);
        
        debug(message: string, meta?: any): void;
        info(message: string, meta?: any): void;
        warn(message: string, meta?: any): void;
        error(message: string, meta?: any): void;
        
        child(meta: Record<string, any>): Logger;
    }
    
    // 配置管理
    export class ConfigManager {
        constructor(options?: {
            env?: string;
            configPath?: string;
            validateSchema?: boolean;
        });
        
        get<T = any>(key: string, defaultValue?: T): T;
        set(key: string, value: any): void;
        has(key: string): boolean;
        getAll(): Record<string, any>;
        validate(): boolean;
    }
    
    // 事件总线
    export interface EventBusOptions {
        maxListeners?: number;
        wildcard?: boolean;
        delimiter?: string;
    }
    
    export class EventBus {
        constructor(options?: EventBusOptions);
        
        on(event: string, listener: (...args: any[]) => void): void;
        once(event: string, listener: (...args: any[]) => void): void;
        off(event: string, listener?: (...args: any[]) => void): void;
        emit(event: string, ...args: any[]): boolean;
        listeners(event: string): Function[];
        listenerCount(event: string): number;
    }
}

console.log("\n=== Node.js 服务端声明示例 ===");
```

## 📝 练习题

### 基础练习

```typescript
// 练习 1：为简单的数学库编写声明文件
// 要求：包含基本的数学运算函数和常量

// 练习 2：扩展 Array 原型
// 要求：添加自定义的数组方法类型声明

// 练习 3：为第三方 jQuery 插件编写声明
// 要求：定义插件的配置选项和方法

// 练习 4：创建全局类型声明
// 要求：定义全局可用的类型和接口
```

### 高级练习

```typescript
// 练习 5：为复杂的状态管理库编写声明
// 要求：包含 actions、reducers、selectors 等完整类型

// 练习 6：扩展 Express 框架
// 要求：添加自定义中间件和请求响应扩展

// 练习 7：为微服务通信库编写声明
// 要求：定义服务发现、负载均衡、熔断器等功能
```

## 🚀 小结

通过本节学习，你掌握了：

- ✅ **声明语法**：基本的声明文件语法和结构
- ✅ **模块声明**：为第三方模块提供类型支持
- ✅ **全局声明**：扩展全局对象和类型
- ✅ **声明合并**：接口合并和模块扩展
- ✅ **实际应用**：React 组件库、Node.js 服务端的声明实践
- ✅ **最佳实践**：声明文件的组织和维护策略

## 🚀 下一步

恭喜你完成了 TypeScript 类型系统的深入学习！现在你已经掌握了 TypeScript 的核心类型特性。接下来，让我们继续学习高级特性，包括装饰器、模块系统等更深层的内容！

👉 **下一步：[高级特性](../03-advanced-features/README.md)**

---

> 💡 **记住**：声明文件是 TypeScript 生态系统的重要组成部分。通过编写高质量的声明文件，你不仅能为自己的项目提供类型安全，还能为整个社区贡献力量。掌握声明文件的编写技巧，让你能够在任何 JavaScript 环境中享受 TypeScript 的类型安全！ 