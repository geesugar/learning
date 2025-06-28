# CSS 学习示例代码

本目录包含CSS学习文档中的所有示例代码实现，按照学习章节组织。

## 📁 目录结构

```
examples/
├── README.md                    # 本文件
├── index.html                   # 示例总览页面
├── 01-core-concepts/           # 第一阶段：CSS基础
│   ├── index.html
│   ├── css-basics/
│   │   ├── basic-syntax.html
│   │   ├── css-methods.html
│   │   └── styles.css
│   ├── selectors/
│   │   ├── basic-selectors.html
│   │   ├── combinators.html
│   │   ├── pseudo-classes.html
│   │   └── specificity.html
│   ├── basic-properties/
│   │   ├── colors-backgrounds.html
│   │   ├── fonts-text.html
│   │   └── borders-spacing.html
│   ├── box-model/
│   │   ├── box-sizing.html
│   │   ├── margin-collapse.html
│   │   └── bfc-demo.html
│   └── positioning/
│       ├── display-types.html
│       ├── positioning.html
│       └── z-index.html
├── 02-layouts/                 # 第二阶段：现代布局
│   ├── index.html
│   ├── flexbox/
│   │   ├── basic-flexbox.html
│   │   ├── flex-properties.html
│   │   ├── common-layouts.html
│   │   └── flexbox-game.html
│   ├── grid/
│   │   ├── basic-grid.html
│   │   ├── grid-areas.html
│   │   ├── complex-layouts.html
│   │   └── grid-game.html
│   ├── responsive/
│   │   ├── media-queries.html
│   │   ├── mobile-first.html
│   │   ├── responsive-units.html
│   │   └── responsive-images.html
│   └── layout-comparison/
│       └── layout-methods.html
├── 03-advanced/                # 第三阶段：进阶技术
│   ├── index.html
│   ├── animations/
│   │   ├── transitions.html
│   │   ├── transforms.html
│   │   ├── keyframes.html
│   │   └── performance.html
│   ├── architecture/
│   │   ├── bem-demo.html
│   │   ├── oocss-demo.html
│   │   └── atomic-css.html
│   ├── advanced-features/
│   │   ├── css-variables.html
│   │   ├── functions.html
│   │   ├── filters.html
│   │   └── clip-path.html
│   └── preprocessors/
│       ├── sass-demo/
│       └── less-demo/
├── 04-engineering/             # 第四阶段：工程化
│   ├── index.html
│   ├── css-modules/
│   │   ├── vanilla-modules.html
│   │   └── styled-components.html
│   ├── performance/
│   │   ├── critical-css.html
│   │   ├── lazy-loading.html
│   │   └── optimization.html
│   └── tools/
│       ├── postcss-demo/
│       └── build-tools/
└── common/                     # 公共资源
    ├── reset.css
    ├── common.css
    └── demo-styles.css
```

## 🚀 快速开始

### 1. 在线预览
直接在浏览器中打开 `index.html` 文件，查看所有示例的总览。

### 2. 本地服务器
推荐使用本地服务器运行示例：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

### 3. Live Server (VS Code)
如果使用 VS Code，推荐安装 Live Server 扩展，可以实时预览效果。

## 📖 使用说明

### 示例特点
- **渐进式学习**：从简单到复杂，符合学习曲线
- **完整代码**：每个示例都是完整可运行的代码
- **注释详细**：代码中包含详细的中文注释
- **响应式设计**：示例支持移动端查看
- **交互式体验**：部分示例包含交互功能

### 学习建议
1. **按顺序学习**：建议从 01-core-concepts 开始
2. **动手实践**：复制代码并尝试修改
3. **对比效果**：修改代码观察变化
4. **记录笔记**：记录学习心得和问题

## 🎯 示例分类

### 基础示例 (01-core-concepts)
- CSS语法基础
- 选择器使用
- 基本属性应用
- 盒模型理解
- 定位系统

### 布局示例 (02-layouts)
- Flexbox布局技巧
- Grid网格系统
- 响应式设计
- 布局方法对比

### 进阶示例 (03-advanced)
- CSS动画效果
- 架构方法论
- 高级CSS特性
- 预处理器使用

### 工程化示例 (04-engineering)
- 模块化方案
- 性能优化
- 工具链集成
- 最佳实践

## 🔧 开发环境

### 推荐工具
- **浏览器**：Chrome/Firefox (支持最新CSS特性)
- **编辑器**：VS Code + CSS相关扩展
- **调试工具**：Chrome DevTools
- **预处理器**：Sass/Less (用于高级示例)

### 浏览器兼容性
- 现代浏览器全面支持
- 部分高级特性需要最新版本
- 示例中会标注兼容性要求

## 📚 相关文档

- [CSS 学习大纲](../README.md)
- [核心概念详解](../01-core-concepts/README.md)
- [现代布局技术](../02-layouts/README.md)
- [CSS 进阶技术](../03-advanced/README.md)
- [工程化实践](../04-engineering/README.md)

## 🤝 贡献指南

欢迎提交新的示例或改进现有示例：
1. 遵循现有的目录结构
2. 添加详细的注释
3. 确保代码可以正常运行
4. 提供清晰的说明文档

---

开始您的CSS学习之旅吧！每个示例都是一个小的学习项目，通过实践掌握CSS技能。🎨 