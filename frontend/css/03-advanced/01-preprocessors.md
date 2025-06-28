# CSS预处理器详解

CSS预处理器是一种用特殊语法编写CSS的工具，它扩展了CSS的功能，使样式编写更加高效和可维护。

## 📋 目录

1. [什么是CSS预处理器](#什么是css预处理器)
2. [Sass/SCSS深入学习](#sassscss深入学习)
3. [Less预处理器](#less预处理器)
4. [预处理器对比](#预处理器对比)
5. [实际项目应用](#实际项目应用)
6. [最佳实践](#最佳实践)

## 什么是CSS预处理器

### 基本概念
CSS预处理器是一种脚本语言，它扩展了CSS的功能并将其编译成常规的CSS。它们提供了变量、嵌套、混合器、函数等高级特性。

### 主要优势
- **变量系统**：集中管理颜色、尺寸等设计令牌
- **嵌套语法**：更直观的选择器层级结构
- **混合器(Mixins)**：复用代码片段
- **函数与运算**：动态计算样式值
- **模块化**：更好的代码组织和维护

### 工作流程
```
源文件(.scss/.sass/.less) → 预处理器编译 → 标准CSS文件
```

## Sass/SCSS深入学习

### 环境配置

#### 安装Sass
```bash
# 全局安装
npm install -g sass

# 项目本地安装
npm install --save-dev sass

# 使用yarn
yarn add --dev sass
```

#### 编译命令
```bash
# 编译单个文件
sass input.scss output.css

# 监听文件变化
sass --watch input.scss:output.css

# 监听整个目录
sass --watch app/sass:public/stylesheets
```

### 核心特性详解

#### 1. 变量系统
```scss
// 基本变量
$primary-color: #007bff;
$font-size-base: 16px;
$border-radius: 4px;

// 嵌套变量
$colors: (
  primary: #007bff,
  secondary: #6c757d,
  success: #28a745,
  danger: #dc3545
);

// 使用变量
.button {
  background-color: $primary-color;
  font-size: $font-size-base;
  border-radius: $border-radius;
  
  &--success {
    background-color: map-get($colors, success);
  }
}

// 默认值
$base-font-size: 16px !default;
```

#### 2. 嵌套语法
```scss
// 选择器嵌套
.navbar {
  background-color: $primary-color;
  
  .nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .nav-item {
    margin: 0 10px;
    
    .nav-link {
      color: white;
      text-decoration: none;
      
      &:hover {
        color: $secondary-color;
      }
      
      &.active {
        font-weight: bold;
      }
    }
  }
}

// 属性嵌套
.box {
  border: {
    top: 1px solid $primary-color;
    bottom: 2px solid $secondary-color;
    left: 1px solid $primary-color;
    right: 1px solid $secondary-color;
  }
  
  margin: {
    top: 10px;
    bottom: 20px;
  }
}
```

#### 3. 混合器(Mixins)
```scss
// 基础混合器
@mixin button-style($bg-color, $text-color: white) {
  background-color: $bg-color;
  color: $text-color;
  padding: 10px 20px;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  
  &:hover {
    background-color: darken($bg-color, 10%);
  }
}

// 使用混合器
.btn-primary {
  @include button-style($primary-color);
}

.btn-secondary {
  @include button-style($secondary-color, #333);
}

// 复杂混合器
@mixin media-query($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 767px) {
      @content;
    }
  }
  @else if $breakpoint == tablet {
    @media (min-width: 768px) and (max-width: 1023px) {
      @content;
    }
  }
  @else if $breakpoint == desktop {
    @media (min-width: 1024px) {
      @content;
    }
  }
}

// 使用响应式混合器
.sidebar {
  width: 300px;
  
  @include media-query(mobile) {
    width: 100%;
  }
  
  @include media-query(tablet) {
    width: 250px;
  }
}
```

#### 4. 函数与运算
```scss
// 内置函数
$primary-color: #007bff;
$lighter-primary: lighten($primary-color, 20%);
$darker-primary: darken($primary-color, 20%);
$complementary: complement($primary-color);

// 数学运算
$base-font-size: 16px;
$line-height: $base-font-size * 1.5;
$container-width: 1200px;
$sidebar-width: $container-width / 4;

// 自定义函数
@function calculate-rem($px-value) {
  @return #{$px-value / 16}rem;
}

@function strip-unit($number) {
  @if type-of($number) == 'number' and not unitless($number) {
    @return $number / ($number * 0 + 1);
  }
  @return $number;
}

// 使用自定义函数
.title {
  font-size: calculate-rem(24px); // 1.5rem
}
```

#### 5. 控制指令
```scss
// @if条件判断
@mixin button-variant($style) {
  @if $style == primary {
    background-color: $primary-color;
    color: white;
  } @else if $style == secondary {
    background-color: $secondary-color;
    color: white;
  } @else {
    background-color: transparent;
    color: $primary-color;
    border: 1px solid $primary-color;
  }
}

// @for循环
@for $i from 1 through 12 {
  .col-#{$i} {
    width: percentage($i / 12);
  }
}

// @each遍历
$social-colors: (
  facebook: #3b5998,
  twitter: #1da1f2,
  instagram: #e4405f,
  linkedin: #0077b5
);

@each $platform, $color in $social-colors {
  .btn-#{$platform} {
    background-color: $color;
    
    &:hover {
      background-color: darken($color, 10%);
    }
  }
}

// @while循环
$grid-columns: 12;
$i: 1;
@while $i <= $grid-columns {
  .grid-#{$i} {
    width: percentage($i / $grid-columns);
  }
  $i: $i + 1;
}
```

#### 6. 模块系统
```scss
// _variables.scss
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-family-base: 'Helvetica Neue', Arial, sans-serif;

// _mixins.scss
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// _buttons.scss
@use 'variables' as *;
@use 'mixins' as *;

.button {
  background-color: $primary-color;
  font-family: $font-family-base;
  
  @include clearfix;
}

// main.scss
@use 'variables';
@use 'mixins';
@use 'buttons';
```

## Less预处理器

### 基本语法
```less
// 变量
@primary-color: #007bff;
@font-size-base: 16px;

// 嵌套
.navbar {
  background-color: @primary-color;
  
  .nav-link {
    color: white;
    
    &:hover {
      color: lighten(@primary-color, 20%);
    }
  }
}

// 混合器
.button-style(@bg-color, @text-color: white) {
  background-color: @bg-color;
  color: @text-color;
  padding: 10px 20px;
  border-radius: 4px;
}

.btn-primary {
  .button-style(@primary-color);
}

// 函数
@base-font-size: 16px;
@line-height: @base-font-size * 1.5;
```

## 预处理器对比

### Sass vs Less vs Stylus

| 特性 | Sass/SCSS | Less | Stylus |
|------|-----------|------|--------|
| **语法** | SCSS接近CSS，Sass简洁 | 接近CSS | 最简洁，可选分号 |
| **变量** | $variable | @variable | variable |
| **嵌套** | 支持 | 支持 | 支持 |
| **混合器** | @mixin/@include | .mixin() | mixin() |
| **函数** | 丰富的内置函数 | 基础函数 | 灵活的函数系统 |
| **条件语句** | @if/@else | when() | if/unless |
| **循环** | @for/@while/@each | 递归混合器 | for/while |
| **生态系统** | 最完善 | 中等 | 较小 |
| **学习曲线** | 中等 | 较低 | 较高 |

### 选择建议
- **Sass/SCSS**：功能最全面，生态最好，适合大型项目
- **Less**：学习成本低，适合从CSS快速迁移
- **Stylus**：语法最简洁，适合追求极致简洁的开发者

## 实际项目应用

### 项目结构组织
```
scss/
├── abstracts/
│   ├── _variables.scss
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _placeholders.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _utilities.scss
├── components/
│   ├── _buttons.scss
│   ├── _forms.scss
│   ├── _cards.scss
│   └── _navigation.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _sidebar.scss
│   └── _grid.scss
├── pages/
│   ├── _home.scss
│   ├── _about.scss
│   └── _contact.scss
├── themes/
│   ├── _light.scss
│   └── _dark.scss
└── main.scss
```

### 主文件组织
```scss
// main.scss
// 1. 抽象层
@import 'abstracts/variables';
@import 'abstracts/functions';
@import 'abstracts/mixins';
@import 'abstracts/placeholders';

// 2. 基础层
@import 'base/reset';
@import 'base/typography';
@import 'base/utilities';

// 3. 布局层
@import 'layout/header';
@import 'layout/footer';
@import 'layout/sidebar';
@import 'layout/grid';

// 4. 组件层
@import 'components/buttons';
@import 'components/forms';
@import 'components/cards';
@import 'components/navigation';

// 5. 页面层
@import 'pages/home';
@import 'pages/about';
@import 'pages/contact';

// 6. 主题层
@import 'themes/light';
@import 'themes/dark';
```

### 实战案例：设计系统
```scss
// _variables.scss
// 颜色系统
$colors: (
  primary: (
    50: #e3f2fd,
    100: #bbdefb,
    200: #90caf9,
    300: #64b5f6,
    400: #42a5f5,
    500: #2196f3,
    600: #1e88e5,
    700: #1976d2,
    800: #1565c0,
    900: #0d47a1
  ),
  gray: (
    50: #fafafa,
    100: #f5f5f5,
    200: #eeeeee,
    300: #e0e0e0,
    400: #bdbdbd,
    500: #9e9e9e,
    600: #757575,
    700: #616161,
    800: #424242,
    900: #212121
  )
);

// 间距系统
$spacing: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 0.75rem,
  4: 1rem,
  5: 1.25rem,
  6: 1.5rem,
  8: 2rem,
  10: 2.5rem,
  12: 3rem,
  16: 4rem,
  20: 5rem
);

// 断点系统
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// _functions.scss
@function color($color, $variant: 500) {
  @return map-get(map-get($colors, $color), $variant);
}

@function spacing($key) {
  @return map-get($spacing, $key);
}

// _mixins.scss
@mixin media-breakpoint-up($breakpoint) {
  $min: map-get($breakpoints, $breakpoint);
  @if $min != 0 {
    @media (min-width: $min) {
      @content;
    }
  } @else {
    @content;
  }
}

@mixin button-variant($bg-color, $border-color: $bg-color) {
  background-color: $bg-color;
  border-color: $border-color;
  color: color(gray, 50);
  
  &:hover {
    background-color: darken($bg-color, 7.5%);
    border-color: darken($border-color, 10%);
  }
  
  &:active {
    background-color: darken($bg-color, 10%);
    border-color: darken($border-color, 12.5%);
  }
}

// _buttons.scss
.btn {
  display: inline-block;
  padding: spacing(2) spacing(4);
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  
  &--primary {
    @include button-variant(color(primary, 500));
  }
  
  &--secondary {
    @include button-variant(color(gray, 500));
  }
  
  &--sm {
    padding: spacing(1) spacing(3);
    font-size: 0.875rem;
  }
  
  &--lg {
    padding: spacing(3) spacing(6);
    font-size: 1.125rem;
  }
}
```

## 最佳实践

### 1. 代码组织
- **模块化**：按功能拆分文件
- **命名规范**：使用有意义的变量名
- **文档注释**：为复杂的混合器添加注释

### 2. 性能优化
- **避免深层嵌套**：限制嵌套层级（建议不超过3层）
- **合理使用混合器**：避免生成过多重复代码
- **按需编译**：只编译需要的部分

### 3. 团队协作
- **统一编码规范**：使用stylelint等工具
- **版本控制**：忽略编译后的CSS文件
- **文档维护**：保持样式指南更新

### 4. 工具集成
```json
// package.json
{
  "scripts": {
    "sass": "sass --watch src/scss:dist/css",
    "sass:build": "sass src/scss:dist/css --style compressed",
    "lint:scss": "stylelint 'src/scss/**/*.scss'"
  },
  "devDependencies": {
    "sass": "^1.49.9",
    "stylelint": "^14.6.1",
    "stylelint-config-standard-scss": "^3.0.0"
  }
}
```

## 🎯 实践练习

### 练习1：创建按钮组件系统
使用Sass创建一个完整的按钮组件系统，包括：
- 基础按钮样式
- 多种颜色变体
- 不同尺寸
- 状态变化（hover、active、disabled）

### 练习2：响应式网格系统
实现一个12列的响应式网格系统：
- 使用循环生成列类
- 实现响应式断点
- 支持偏移和排序

### 练习3：主题切换系统
创建一个支持亮色/暗色主题切换的系统：
- 定义主题色彩变量
- 实现主题切换混合器
- 应用到各个组件

## 📚 延伸阅读

- [Sass官方文档](https://sass-lang.com/documentation)
- [Less官方文档](http://lesscss.org/)
- [Stylus官方文档](https://stylus-lang.com/)
- [CSS预处理器比较](https://css-tricks.com/sass-vs-less/)

## 🔗 下一步学习

完成预处理器学习后，继续学习：
- [CSS架构与方法论](./02-architecture.md)
- [动画与过渡](./03-animations.md)
- [CSS高级特性](./04-advanced-features.md)

---

掌握CSS预处理器是现代前端开发的必备技能，它将显著提升你的开发效率和代码质量！ 🚀 