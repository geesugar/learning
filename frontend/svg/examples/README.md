# SVG 示例代码集合

> 配套的实践示例，帮助您更好地理解和掌握SVG技术。

## 📁 目录结构

```
examples/
├── README.md                    # 示例说明（本文件）
├── index.html                   # 示例总览页面
├── common/                      # 公共资源
│   ├── styles.css              # 通用样式
│   ├── demo.css                # 演示页面样式
│   └── utils.js                # 工具函数
├── 01-foundations/             # 基础入门示例
│   ├── index.html              # 基础示例导航
│   ├── svg-fundamentals/       # SVG基础概念
│   ├── basic-shapes/           # 基本图形绘制
│   └── paths/                  # 路径系统
├── 02-styling/                 # 样式与效果示例
│   ├── index.html              # 样式示例导航
│   ├── styling-methods/        # 样式控制方法
│   ├── fill-stroke/           # 填充与描边
│   ├── gradients-patterns/     # 渐变与图案
│   └── filters/               # 滤镜效果
├── 03-animation/               # 动画与交互示例
│   ├── index.html              # 动画示例导航
│   ├── css-animations/         # CSS动画
│   ├── smil-animations/        # SMIL动画
│   └── javascript-svg/         # JavaScript控制
└── 04-advanced/                # 高级应用示例
    ├── index.html              # 高级示例导航
    ├── icon-systems/           # 图标系统
    ├── data-visualization/     # 数据可视化
    ├── optimization/           # 优化技术
    └── advanced-techniques/    # 高级技巧
```

## 🎯 使用指南

### 快速开始
1. **克隆项目** 或 **下载示例文件**
2. **打开 `index.html`** 查看所有示例
3. **选择感兴趣的示例** 进行学习和实践
4. **查看源代码** 理解实现细节

### 本地开发
```bash
# 如果需要本地服务器（推荐）
npx serve .

# 或者使用Python
python -m http.server 8000

# 或者使用Node.js
npx http-server .
```

### 文件约定
- 📄 **HTML文件** - 完整的可运行示例
- 🎨 **CSS文件** - 样式和布局
- ⚡ **JS文件** - 交互逻辑
- 📝 **README.md** - 示例说明和学习要点

## 📚 学习路径

### 第一阶段：基础入门
**目标：理解SVG基本概念**

#### [SVG基础概念示例](01-foundations/svg-fundamentals/)
- `coordinate-system.html` - 坐标系统演示
- `viewport-viewbox.html` - 视口和viewBox
- `embedding-methods.html` - 嵌入方式对比
- `namespace-structure.html` - 文档结构

#### [基本图形示例](01-foundations/basic-shapes/)
- `rectangles.html` - 矩形绘制
- `circles-ellipses.html` - 圆形和椭圆
- `lines-polylines.html` - 直线和折线
- `polygons.html` - 多边形
- `shapes-combination.html` - 图形组合

#### [路径系统示例](01-foundations/paths/)
- `basic-commands.html` - 基本路径命令
- `curves.html` - 曲线绘制
- `complex-paths.html` - 复杂路径
- `path-optimization.html` - 路径优化

### 第二阶段：样式与效果
**目标：掌握样式控制和视觉效果**

#### [样式控制示例](02-styling/styling-methods/)
- `inline-vs-css.html` - 内联样式vs CSS
- `selectors.html` - CSS选择器应用
- `inheritance.html` - 样式继承
- `responsive-svg.html` - 响应式设计

#### [填充与描边示例](02-styling/fill-stroke/)
- `fill-modes.html` - 填充模式
- `stroke-properties.html` - 描边属性
- `transparency.html` - 透明度控制
- `dash-animations.html` - 虚线动画

#### [渐变与图案示例](02-styling/gradients-patterns/)
- `linear-gradients.html` - 线性渐变
- `radial-gradients.html` - 径向渐变
- `patterns.html` - 图案填充
- `gradient-animations.html` - 渐变动画

#### [滤镜效果示例](02-styling/filters/)
- `basic-filters.html` - 基础滤镜
- `filter-combinations.html` - 滤镜组合
- `custom-filters.html` - 自定义滤镜
- `performance-tips.html` - 性能优化

### 第三阶段：动画与交互
**目标：创建动态和交互式SVG**

#### [CSS动画示例](03-animation/css-animations/)
- `transitions.html` - 过渡效果
- `keyframe-animations.html` - 关键帧动画
- `transform-animations.html` - 变换动画
- `performance-tips.html` - 性能优化

#### [SMIL动画示例](03-animation/smil-animations/)
- `animate-element.html` - animate元素
- `animateTransform.html` - 变换动画
- `animateMotion.html` - 路径动画
- `timing-control.html` - 时间控制

#### [JavaScript SVG示例](03-animation/javascript-svg/)
- `dom-manipulation.html` - DOM操作
- `event-handling.html` - 事件处理
- `dynamic-creation.html` - 动态创建
- `data-binding.html` - 数据绑定

### 第四阶段：高级应用
**目标：实际项目应用**

#### [图标系统示例](04-advanced/icon-systems/)
- `icon-sprite.html` - 图标精灵
- `symbol-usage.html` - 符号引用
- `icon-fonts-vs-svg.html` - 技术对比
- `optimization-workflow.html` - 优化工作流

#### [数据可视化示例](04-advanced/data-visualization/)
- `bar-charts.html` - 柱状图
- `line-charts.html` - 折线图
- `pie-charts.html` - 饼图
- `interactive-charts.html` - 交互式图表

#### [优化技术示例](04-advanced/optimization/)
- `code-optimization.html` - 代码优化
- `compression.html` - 压缩技术
- `build-integration.html` - 构建集成
- `performance-monitoring.html` - 性能监控

#### [高级技巧示例](04-advanced/advanced-techniques/)
- `complex-animations.html` - 复杂动画
- `masking-clipping.html` - 面具和裁剪
- `sprite-techniques.html` - Sprite技术
- `browser-compatibility.html` - 兼容性处理

## 🛠️ 实践建议

### 学习方法
1. **逐步学习** - 按照阶段顺序学习
2. **动手实践** - 修改示例代码，观察变化
3. **自主创作** - 基于示例创建自己的作品
4. **问题解决** - 遇到问题主动查找解决方案

### 实践技巧
- 📝 **做笔记** - 记录重要概念和技巧
- 🔍 **查看源码** - 理解实现细节
- 🎨 **修改样式** - 尝试不同的视觉效果
- ⚡ **添加交互** - 增加用户交互功能

### 扩展练习
每个示例都可以进行扩展：
- 修改颜色、大小、动画参数
- 添加新的图形元素
- 组合多个效果
- 创建变体版本

## 📱 响应式支持

所有示例都支持响应式设计：
- **移动设备** - 触摸友好的交互
- **平板设备** - 中等屏幕优化
- **桌面设备** - 完整功能体验

## 🔧 开发工具

### 推荐工具
- **VS Code** - 代码编辑
  - SVG Preview 插件
  - Live Server 插件
- **Chrome DevTools** - 调试和性能分析
- **Firefox Developer Tools** - SVG专用工具

### 在线工具
- [CodePen](https://codepen.io/) - 在线编辑和分享
- [JSFiddle](https://jsfiddle.net/) - 快速原型
- [SVG OMG](https://jakearchibald.github.io/svgomg/) - SVG优化

## ❓ 常见问题

### Q1: 示例无法正常显示？
**A**: 检查以下问题：
- 是否使用了本地服务器
- 浏览器是否支持相关特性
- 文件路径是否正确

### Q2: 如何修改示例？
**A**: 建议步骤：
- 复制示例文件
- 在副本上进行修改
- 保留原始文件作为参考

### Q3: 在哪里找到更多资源？
**A**: 可以查看：
- 各章节的推荐资源
- MDN SVG文档
- CSS-Tricks SVG指南

## 🎯 学习目标检查

### 基础阶段 ✓
- [ ] 理解SVG基本概念
- [ ] 掌握基本图形绘制
- [ ] 学会路径系统使用

### 样式阶段 ✓
- [ ] 掌握样式控制方法
- [ ] 理解渐变和图案
- [ ] 应用滤镜效果

### 动画阶段 ✓
- [ ] 创建CSS动画
- [ ] 使用SMIL动画
- [ ] JavaScript控制SVG

### 高级阶段 ✓
- [ ] 构建图标系统
- [ ] 实现数据可视化
- [ ] 掌握优化技术

---

🚀 **开始探索**：从 [示例总览](index.html) 开始您的SVG学习之旅！

💡 **提示**：每个示例都包含详细的代码注释，建议仔细阅读以理解实现原理。 