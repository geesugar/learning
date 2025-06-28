# CSS 学习大纲与资源汇总

## 📚 学习大纲

### 第一阶段：CSS 基础（1-2周）

📖 **详细学习文档**: [CSS 核心概念](./01-core-concepts/README.md)

#### 1. [CSS 基本概念](./01-core-concepts/01-css-basics.md)
- [ ] CSS 是什么？与 HTML 的关系
- [ ] CSS 语法规则
- [ ] CSS 引入方式（内联、内部、外部）
- [ ] 语法规则与注释

#### 2. [选择器详解](./01-core-concepts/02-selectors.md)
- [ ] 基础选择器（元素、类、ID、属性选择器）
- [ ] 组合选择器（后代、子元素、相邻兄弟、通用兄弟）
- [ ] 伪类选择器（:hover, :focus, :first-child 等）
- [ ] 伪元素选择器（::before, ::after, ::first-line 等）
- [ ] 选择器优先级与特异性

#### 3. [基本样式属性](./01-core-concepts/03-basic-properties.md)
- [ ] 颜色与背景（color, background）
- [ ] 字体与文本（font, text-align, line-height）
- [ ] 边框与轮廓（border, outline）
- [ ] 内外边距（margin, padding）
- [ ] 宽高设置（width, height）

#### 4. [盒模型深入](./01-core-concepts/04-box-model.md)
- [ ] 标准盒模型 vs IE 盒模型
- [ ] box-sizing 属性详解
- [ ] 内容、内边距、边框、外边距
- [ ] 边距重叠（Margin Collapsing）
- [ ] 块级格式化上下文（BFC）

#### 5. [显示与定位](./01-core-concepts/05-display-positioning.md)
- [ ] display 属性详解（block, inline, inline-block, none）
- [ ] visibility 与 opacity 的区别
- [ ] position 属性（static, relative, absolute, fixed, sticky）
- [ ] 文档流与脱离文档流
- [ ] z-index 层叠上下文
- [ ] 定位实战案例

### 第二阶段：现代布局技术（2-3周）

🔗 **专题学习**：[现代布局技术](./02-layouts/README.md)

#### 6. Flexbox 弹性布局 📖 [详细文档](./02-layouts/01-flexbox.md)
- [ ] Flex 容器与 Flex 项目
- [ ] 主轴与交叉轴概念
- [ ] flex-direction, flex-wrap, flex-flow
- [ ] justify-content, align-items, align-content
- [ ] flex-grow, flex-shrink, flex-basis
- [ ] Flexbox 实战案例

#### 7. Grid 网格布局 📖 [详细文档](./02-layouts/02-grid.md)
- [ ] Grid 容器与 Grid 项目
- [ ] 网格线、网格轨道、网格区域
- [ ] grid-template-columns/rows
- [ ] grid-gap, justify-items, align-items
- [ ] 显式网格 vs 隐式网格
- [ ] Grid 实战案例

#### 8. 响应式设计 📖 [详细文档](./02-layouts/03-responsive.md)
- [ ] 媒体查询（@media）
- [ ] 移动优先 vs 桌面优先策略
- [ ] 常用断点设置
- [ ] viewport 设置
- [ ] rem, em, vw, vh 单位应用

#### 9. 布局方法对比 📖 [详细文档](./02-layouts/04-layout-comparison.md)
- [ ] 不同布局方法的优劣对比
- [ ] 使用场景分析
- [ ] 性能考量与最佳实践
- [ ] 布局方法选择指南

### 第三阶段：CSS 进阶技术（3-4周）

🚀 **专题学习**：[CSS 进阶技术](./03-advanced/README.md)  
**目标：掌握预处理器、架构方法论、动画等高级技能**

#### 10. [CSS 预处理器](./03-advanced/01-preprocessors.md) ⚙️
- [ ] Sass/SCSS 基础语法
- [ ] 变量、嵌套、混合器、继承
- [ ] 函数与控制指令
- [ ] Less 基础对比

#### 11. [CSS 架构与方法论](./03-advanced/02-architecture.md) 🏗️
- [ ] BEM 命名规范
- [ ] OOCSS（面向对象CSS）
- [ ] SMACSS（可扩展模块化CSS架构）
- [ ] 原子化CSS（Atomic CSS）
- [ ] CSS-in-JS 概念

#### 12. [动画与过渡](./03-advanced/03-animations.md) ✨
- [ ] transition 过渡效果
- [ ] transform 变换（平移、缩放、旋转、倾斜）
- [ ] animation 动画
- [ ] 关键帧（@keyframes）
- [ ] 性能优化技巧

#### 13. [CSS 高级特性](./03-advanced/04-advanced-features.md) 🚀
- [ ] CSS 变量（自定义属性）
- [ ] calc() 函数
- [ ] 滤镜（filter）
- [ ] 混合模式（mix-blend-mode）
- [ ] 剪切路径（clip-path）

### 第四阶段：现代CSS与工程化（2-3周）

🛠️ **专题学习**：[CSS工程化与现代开发](./04-engineering/README.md)  
**目标：掌握CSS工程化、模块化和性能优化**

#### 14. [CSS 模块化](./04-engineering/01-css-modules.md)
- [ ] CSS Modules深入理解
- [ ] Styled Components实战
- [ ] CSS-in-JS 解决方案对比
- [ ] 模块化最佳实践

#### 15. [PostCSS 与工具链](./04-engineering/02-postcss-toolchain.md)
- [ ] PostCSS生态系统
- [ ] Autoprefixer自动前缀
- [ ] CSS压缩与优化工具
- [ ] 现代前端构建集成

#### 16. [CSS性能优化](./04-engineering/03-performance-optimization.md)
- [ ] CSS加载优化策略
- [ ] 关键渲染路径优化
- [ ] CSS代码分割技术
- [ ] 渲染性能提升技巧

---

📖 **专题学习指南**：
- 🎯 [核心概念深入](./01-core-concepts/README.md) - 基础概念详细解析  
- ⚡ [现代布局技术](./02-layouts/README.md) - Flexbox、Grid 等布局方案
- 🚀 [CSS 进阶技术专题](./03-advanced/README.md) - 完整的进阶技术学习路径
- 🛠️ [CSS工程化与现代开发](./04-engineering/README.md) - 模块化、工具链和性能优化
- 💡 [实践案例集合](./examples/README.md) - 动手实践项目

## 🌐 优秀的网络资源

### 官方文档与规范
- [MDN CSS 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS) - 最权威的CSS参考文档
- [W3C CSS 规范](https://www.w3.org/Style/CSS/) - CSS 官方规范
- [CSS Working Group](https://github.com/w3c/csswg-drafts) - CSS 标准制定讨论

### 在线教程与学习平台
- [CSS-Tricks](https://css-tricks.com/) - 最受欢迎的CSS技巧网站
- [freeCodeCamp CSS 课程](https://www.freecodecamp.org/chinese/learn/responsive-web-design/) - 免费的响应式网页设计课程
- [CSS 参考手册](https://cssreference.io/) - 可视化的CSS属性参考
- [Flexbox Froggy](https://flexboxfroggy.com/) - 通过游戏学习Flexbox
- [Grid Garden](https://cssgridgarden.com/) - 通过游戏学习CSS Grid
- [CSS Selectors Game](https://flukeout.github.io/) - CSS选择器练习游戏

### 优质博客与个人网站
- [张鑫旭的博客](https://www.zhangxinxu.com/) - 国内顶尖前端专家，CSS深度解析
- [Josh Comeau](https://www.joshwcomeau.com/) - 现代CSS技巧与动画
- [Lea Verou](https://lea.verou.me/) - CSS专家，W3C成员
- [Chen Hui Jing](https://chenhuijing.com/) - CSS布局专家
- [Ahmad Shadeed](https://ishadeed.com/) - CSS技巧与最佳实践

### 工具与生成器
- [CSS Grid Generator](https://cssgrid-generator.netlify.app/) - 可视化Grid布局生成器
- [Flexbox Generator](https://loading.io/flexbox/) - Flexbox布局生成器
- [CSS Clip Path Generator](https://bennettfeely.com/clippy/) - 剪切路径生成器
- [CSS Gradient Generator](https://cssgradient.io/) - 渐变生成器
- [Animista](https://animista.net/) - CSS动画库与生成器
- [CSS Box Shadow Generator](https://box-shadow.dev/) - 阴影效果生成器

## 🚀 开源项目推荐

### CSS 框架与库

#### 1. 实用框架
- [Bootstrap](https://github.com/twbs/bootstrap) - 最流行的CSS框架
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) - 原子化CSS框架
- [Bulma](https://github.com/jgthms/bulma) - 现代CSS框架，基于Flexbox
- [Foundation](https://github.com/foundation/foundation-sites) - 企业级前端框架

#### 2. 轻量级工具库
- [Normalize.css](https://github.com/necolas/normalize.css) - CSS重置库
- [Animate.css](https://github.com/animate-css/animate.css) - CSS动画库
- [Hover.css](https://github.com/IanLunn/Hover) - 悬停效果集合
- [Pure.css](https://github.com/pure-css/pure) - 轻量级CSS模块库

#### 3. CSS-in-JS 解决方案
- [Styled Components](https://github.com/styled-components/styled-components) - React的CSS-in-JS库
- [Emotion](https://github.com/emotion-js/emotion) - 高性能CSS-in-JS库
- [JSS](https://github.com/cssinjs/jss) - JavaScript中的CSS

### 学习项目与示例

#### 1. CSS 艺术项目
- [CSS Art](https://github.com/cyanharlow/purecss-art) - 纯CSS艺术作品
- [CSS Icons](https://github.com/wentin/cssicon) - 纯CSS图标库
- [Single Div](https://github.com/lynnandtonic/single-div) - 单个div的CSS艺术

#### 2. 布局示例项目
- [CSS Layout](https://github.com/phuoc-ng/csslayout) - 常见布局模式集合
- [Solved by Flexbox](https://github.com/philipwalton/solved-by-flexbox) - Flexbox解决方案示例
- [Grid by Example](https://github.com/rachelandrew/gridbyexample) - CSS Grid实例教程

#### 3. 完整项目示例
- [CSS Zen Garden](https://github.com/mezzoblue/csszengarden.com) - CSS设计展示项目
- [Frontend Mentor Projects](https://github.com/frontendmentor-io) - 前端挑战项目
- [30 Days CSS Challenge](https://github.com/MilenaCarecho/30diasDeCSS) - 30天CSS挑战

### 工具与开发环境

#### 1. CSS 预处理器
- [Sass](https://github.com/sass/sass) - 最流行的CSS预处理器
- [Less](https://github.com/less/less.js) - 动态样式语言
- [Stylus](https://github.com/stylus/stylus) - 表达式CSS语言

#### 2. PostCSS 生态
- [PostCSS](https://github.com/postcss/postcss) - CSS转换工具
- [Autoprefixer](https://github.com/postcss/autoprefixer) - 自动添加浏览器前缀
- [PurgeCSS](https://github.com/FullHuman/purgecss) - 移除未使用的CSS

#### 3. 开发工具
- [Stylelint](https://github.com/stylelint/stylelint) - CSS代码检查工具
- [CSS Tree](https://github.com/csstree/csstree) - CSS解析器和生成器
- [Critical](https://github.com/addyosmani/critical) - 关键CSS提取工具

## 📖 推荐书籍

### 入门书籍
- 《CSS权威指南》（第四版）- Eric A. Meyer
- 《精通CSS》（第三版）- Andy Budd
- 《CSS世界》- 张鑫旭

### 进阶书籍
- 《CSS Secrets》- Lea Verou
- 《Responsive Web Design》- Ethan Marcotte
- 《Atomic Design》- Brad Frost

## 🎯 学习建议

### 学习方法
1. **理论与实践结合**：每学一个概念就要动手实践
2. **从问题出发**：遇到布局问题时主动查找解决方案
3. **阅读优秀代码**：研究知名网站的CSS实现
4. **持续关注新特性**：跟进CSS新标准和浏览器支持情况

### 实践项目建议
1. **重构经典网站**：模仿知名网站的设计和布局
2. **响应式项目**：制作适配多种设备的网页
3. **动画效果**：创建有趣的CSS动画和交互效果
4. **CSS艺术**：尝试用纯CSS创作艺术作品

### 进阶方向
1. **设计系统**：学习如何构建可维护的设计系统
2. **性能优化**：深入理解CSS对页面性能的影响
3. **工程化**：掌握CSS在大型项目中的组织和管理
4. **新技术**：关注CSS Houdini、Container Queries等新特性

---

**最后更新时间**: 2024年12月

记住：CSS 学习是一个循序渐进的过程，不要急于求成。多实践、多思考、多总结，你会发现CSS的魅力所在！ 