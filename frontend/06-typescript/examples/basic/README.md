# TypeScript 基础示例

> 通过实际代码学习 TypeScript 基础概念

## 📂 示例目录

### [01-types.ts](./01-types.ts) - 基础类型
- 原始类型：string, number, boolean
- 数组和元组
- 对象类型
- 字面量类型

### [02-functions.ts](./02-functions.ts) - 函数
- 函数类型注解
- 可选参数和默认参数
- 剩余参数
- 函数重载

### [03-interfaces.ts](./03-interfaces.ts) - 接口
- 接口定义和使用
- 可选属性
- 只读属性
- 接口继承

### [04-classes.ts](./04-classes.ts) - 类
- 类的定义
- 构造函数
- 访问修饰符
- 继承和多态

### [05-generics.ts](./05-generics.ts) - 泛型
- 泛型函数
- 泛型接口
- 泛型类
- 约束泛型

### [06-unions-intersections.ts](./06-unions-intersections.ts) - 联合和交叉类型
- 联合类型
- 交叉类型
- 类型守卫
- 可辨识联合

## 🚀 运行示例

### 方式一：直接运行
```bash
# 安装依赖
npm install -g ts-node typescript

# 运行单个示例
ts-node 01-types.ts
ts-node 02-functions.ts
# ... 其他示例
```

### 方式二：编译后运行
```bash
# 编译所有 TypeScript 文件
tsc *.ts

# 运行编译后的 JavaScript
node 01-types.js
node 02-functions.js
# ... 其他示例
```

### 方式三：使用项目模式
```bash
# 初始化项目
npm init -y
npm install -D typescript @types/node ts-node

# 运行示例
npm run dev
```

## 📝 学习建议

1. **按顺序学习**：从 01-types.ts 开始，逐个文件学习
2. **动手实践**：修改代码，观察 TypeScript 的错误提示
3. **理解概念**：每个示例都有详细的注释说明
4. **实验验证**：尝试故意写错代码，看看 TypeScript 如何提示

## 🎯 练习挑战

每个示例文件末尾都有练习题，建议完成这些练习来巩固学习：

- **基础练习**：跟着示例代码练习基本语法
- **进阶练习**：独立完成类型定义和函数实现
- **综合练习**：结合多个概念完成复杂任务

## 📚 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play) - 在线练习
- [返回学习指南](../../README.md)

---

**开始探索 TypeScript 的世界吧！** 🚀 