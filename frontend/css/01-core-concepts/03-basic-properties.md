# CSS 基本样式属性

## 1. 颜色与背景属性

### 1.1 颜色属性（color）

控制文本颜色的属性：

```css
/* 颜色名称 */
.text-red {
  color: red;
}

/* 十六进制 */
.text-blue {
  color: #3498db;
}

/* RGB */
.text-green {
  color: rgb(46, 204, 113);
}

/* RGBA（带透明度） */
.text-purple {
  color: rgba(155, 89, 182, 0.8);
}

/* HSL */
.text-orange {
  color: hsl(22, 82%, 60%);
}

/* HSLA（带透明度） */
.text-yellow {
  color: hsla(54, 100%, 62%, 0.9);
}
```

### 1.2 背景属性（background）

#### 背景颜色（background-color）

```css
.bg-light {
  background-color: #f8f9fa;
}

.bg-primary {
  background-color: #007bff;
}

.bg-transparent {
  background-color: transparent;
}

.bg-gradient {
  background-color: #3498db; /* 渐变的后备色 */
}
```

#### 背景图片（background-image）

```css
/* 单个背景图片 */
.hero-section {
  background-image: url('images/hero-bg.jpg');
}

/* 多个背景图片 */
.complex-bg {
  background-image: 
    url('overlay.png'),
    url('background.jpg');
}

/* 渐变背景 */
.gradient-bg {
  background-image: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}

/* 径向渐变 */
.radial-gradient {
  background-image: radial-gradient(circle, #ff6b6b 0%, #4ecdc4 100%);
}
```

#### 背景尺寸（background-size）

```css
.bg-cover {
  background-image: url('hero.jpg');
  background-size: cover; /* 覆盖整个容器 */
}

.bg-contain {
  background-image: url('logo.png');
  background-size: contain; /* 完整显示图片 */
}

.bg-custom {
  background-image: url('pattern.png');
  background-size: 50px 50px; /* 自定义尺寸 */
}
```

#### 背景位置（background-position）

```css
.bg-center {
  background-position: center center;
}

.bg-top-right {
  background-position: top right;
}

.bg-custom-position {
  background-position: 20px 30px;
}

.bg-percentage {
  background-position: 75% 25%;
}
```

#### 背景重复（background-repeat）

```css
.bg-no-repeat {
  background-repeat: no-repeat;
}

.bg-repeat-x {
  background-repeat: repeat-x; /* 只在x轴重复 */
}

.bg-repeat-y {
  background-repeat: repeat-y; /* 只在y轴重复 */
}

.bg-space {
  background-repeat: space; /* 平铺但不裁剪 */
}
```

#### 背景附着（background-attachment）

```css
.bg-fixed {
  background-attachment: fixed; /* 固定背景 */
}

.bg-scroll {
  background-attachment: scroll; /* 随内容滚动 */
}
```

#### 背景简写

```css
.comprehensive-bg {
  /* 简写：color image repeat position/size attachment */
  background: #f0f0f0 url('bg.jpg') no-repeat center center/cover fixed;
}
```

## 2. 字体与文本属性

### 2.1 字体属性

#### 字体族（font-family）

```css
/* 特定字体 */
.serif-text {
  font-family: "Times New Roman", serif;
}

/* 无衬线字体 */
.sans-serif-text {
  font-family: "Arial", "Helvetica", sans-serif;
}

/* 等宽字体 */
.monospace-text {
  font-family: "Courier New", monospace;
}

/* 系统字体栈 */
.system-font {
  font-family: 
    -apple-system, 
    BlinkMacSystemFont, 
    "Segoe UI", 
    Roboto, 
    "Helvetica Neue", 
    Arial, 
    sans-serif;
}

/* 中文字体 */
.chinese-font {
  font-family: 
    "PingFang SC", 
    "Microsoft YaHei", 
    "SimHei", 
    sans-serif;
}
```

#### 字体大小（font-size）

```css
/* 绝对单位 */
.size-px {
  font-size: 16px;
}

.size-pt {
  font-size: 12pt;
}

/* 相对单位 */
.size-em {
  font-size: 1.2em; /* 相对于父元素字体大小 */
}

.size-rem {
  font-size: 1.125rem; /* 相对于根元素字体大小 */
}

/* 百分比 */
.size-percent {
  font-size: 120%;
}

/* 关键字 */
.size-keywords {
  font-size: large;
  /* xx-small, x-small, small, medium, large, x-large, xx-large */
}
```

#### 字体粗细（font-weight）

```css
.light {
  font-weight: 300;
}

.normal {
  font-weight: normal; /* 400 */
}

.bold {
  font-weight: bold; /* 700 */
}

.extra-bold {
  font-weight: 800;
}

/* 相对值 */
.bolder {
  font-weight: bolder;
}

.lighter {
  font-weight: lighter;
}
```

#### 字体样式（font-style）

```css
.italic {
  font-style: italic;
}

.oblique {
  font-style: oblique;
}

.normal-style {
  font-style: normal;
}
```

#### 字体变体（font-variant）

```css
.small-caps {
  font-variant: small-caps;
}
```

#### 字体简写

```css
.font-shorthand {
  /* style variant weight size/line-height family */
  font: italic small-caps bold 16px/1.5 "Arial", sans-serif;
}
```

### 2.2 文本属性

#### 文本对齐（text-align）

```css
.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-justify {
  text-align: justify; /* 两端对齐 */
}
```

#### 行高（line-height）

```css
/* 数字（推荐） */
.line-height-number {
  line-height: 1.6;
}

/* 像素值 */
.line-height-px {
  line-height: 24px;
}

/* 百分比 */
.line-height-percent {
  line-height: 150%;
}

/* 关键字 */
.line-height-normal {
  line-height: normal;
}
```

#### 文本装饰（text-decoration）

```css
.underline {
  text-decoration: underline;
}

.overline {
  text-decoration: overline;
}

.line-through {
  text-decoration: line-through;
}

.no-decoration {
  text-decoration: none;
}

/* 复合值 */
.fancy-underline {
  text-decoration: underline wavy red;
}
```

#### 文本转换（text-transform）

```css
.uppercase {
  text-transform: uppercase;
}

.lowercase {
  text-transform: lowercase;
}

.capitalize {
  text-transform: capitalize;
}

.none-transform {
  text-transform: none;
}
```

#### 字母间距（letter-spacing）

```css
.letter-spacing-normal {
  letter-spacing: normal;
}

.letter-spacing-wide {
  letter-spacing: 2px;
}

.letter-spacing-tight {
  letter-spacing: -1px;
}
```

#### 单词间距（word-spacing）

```css
.word-spacing-normal {
  word-spacing: normal;
}

.word-spacing-wide {
  word-spacing: 10px;
}
```

#### 文本缩进（text-indent）

```css
.text-indent {
  text-indent: 2em; /* 首行缩进2个字符 */
}

.negative-indent {
  text-indent: -20px;
  padding-left: 20px; /* 悬挂缩进 */
}
```

#### 文本阴影（text-shadow）

```css
.simple-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.multiple-shadows {
  text-shadow: 
    1px 1px 2px #000,
    0 0 10px #ff0000,
    0 0 20px #ff0000;
}

.embossed-text {
  color: #ccc;
  text-shadow: 1px 1px 0px #fff;
}
```

## 3. 边框与轮廓

### 3.1 边框属性（border）

#### 边框宽度（border-width）

```css
.border-thin {
  border-width: thin;
}

.border-medium {
  border-width: medium;
}

.border-thick {
  border-width: thick;
}

.border-custom {
  border-width: 2px;
}

/* 四个方向不同宽度 */
.border-mixed {
  border-width: 1px 2px 3px 4px; /* 上 右 下 左 */
}
```

#### 边框样式（border-style）

```css
.border-solid {
  border-style: solid;
}

.border-dashed {
  border-style: dashed;
}

.border-dotted {
  border-style: dotted;
}

.border-double {
  border-style: double;
}

.border-groove {
  border-style: groove;
}

.border-ridge {
  border-style: ridge;
}

.border-inset {
  border-style: inset;
}

.border-outset {
  border-style: outset;
}
```

#### 边框颜色（border-color）

```css
.border-blue {
  border-color: #3498db;
}

.border-multi-color {
  border-color: red green blue yellow; /* 上 右 下 左 */
}
```

#### 边框简写

```css
.border-simple {
  border: 1px solid #ddd;
}

.border-thick-red {
  border: 3px dashed #e74c3c;
}

/* 单独设置某一边 */
.border-top-only {
  border-top: 2px solid #2ecc71;
}

.border-bottom-only {
  border-bottom: 1px dotted #9b59b6;
}
```

#### 边框圆角（border-radius）

```css
/* 统一圆角 */
.border-radius-small {
  border-radius: 4px;
}

.border-radius-large {
  border-radius: 20px;
}

/* 圆形 */
.circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

/* 不同角的圆角 */
.custom-radius {
  border-radius: 10px 20px 30px 40px; /* 左上 右上 右下 左下 */
}

/* 椭圆角 */
.elliptical-corners {
  border-radius: 20px / 10px;
}
```

### 3.2 轮廓属性（outline）

```css
.outline-basic {
  outline: 2px solid #ff6b6b;
}

.outline-dashed {
  outline: 3px dashed #4ecdc4;
}

.outline-offset {
  outline: 2px solid #45b7d1;
  outline-offset: 5px;
}

/* 去除默认轮廓 */
.no-outline {
  outline: none;
}

/* 自定义焦点轮廓 */
.custom-focus:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

## 4. 内外边距

### 4.1 外边距（margin）

```css
/* 统一外边距 */
.margin-small {
  margin: 10px;
}

.margin-large {
  margin: 40px;
}

/* 不同方向的外边距 */
.margin-vertical {
  margin: 20px 0; /* 上下20px，左右0 */
}

.margin-horizontal {
  margin: 0 30px; /* 上下0，左右30px */
}

.margin-custom {
  margin: 10px 20px 30px 40px; /* 上 右 下 左 */
}

/* 单独设置 */
.margin-top {
  margin-top: 20px;
}

.margin-right {
  margin-right: 15px;
}

.margin-bottom {
  margin-bottom: 25px;
}

.margin-left {
  margin-left: 10px;
}

/* 居中对齐 */
.margin-center {
  width: 800px;
  margin: 0 auto;
}

/* 负边距 */
.negative-margin {
  margin-top: -10px;
}
```

### 4.2 内边距（padding）

```css
/* 统一内边距 */
.padding-small {
  padding: 10px;
}

.padding-large {
  padding: 40px;
}

/* 不同方向的内边距 */
.padding-vertical {
  padding: 20px 0; /* 上下20px，左右0 */
}

.padding-horizontal {
  padding: 0 30px; /* 上下0，左右30px */
}

.padding-custom {
  padding: 10px 20px 30px 40px; /* 上 右 下 左 */
}

/* 单独设置 */
.padding-top {
  padding-top: 20px;
}

.padding-right {
  padding-right: 15px;
}

.padding-bottom {
  padding-bottom: 25px;
}

.padding-left {
  padding-left: 10px;
}
```

### 4.3 边距重叠（Margin Collapsing）

```css
/* 相邻元素的外边距会重叠 */
.element1 {
  margin-bottom: 20px;
}

.element2 {
  margin-top: 30px;
  /* 实际间距是30px，不是50px */
}

/* 避免边距重叠的方法 */
.no-collapse {
  padding: 1px 0; /* 添加内边距 */
}

.no-collapse-border {
  border: 1px solid transparent; /* 添加边框 */
}
```

## 5. 宽度与高度

### 5.1 宽度属性（width）

```css
/* 固定宽度 */
.width-fixed {
  width: 300px;
}

/* 百分比宽度 */
.width-percent {
  width: 80%;
}

/* 最大/最小宽度 */
.width-responsive {
  width: 100%;
  max-width: 1200px;
  min-width: 320px;
}

/* 视口单位 */
.width-viewport {
  width: 50vw; /* 50% 视口宽度 */
}

/* 自动宽度 */
.width-auto {
  width: auto;
}
```

### 5.2 高度属性（height）

```css
/* 固定高度 */
.height-fixed {
  height: 200px;
}

/* 百分比高度 */
.height-percent {
  height: 100%;
}

/* 最大/最小高度 */
.height-responsive {
  min-height: 300px;
  max-height: 600px;
}

/* 视口单位 */
.height-viewport {
  height: 100vh; /* 100% 视口高度 */
}

/* 自动高度 */
.height-auto {
  height: auto;
}
```

### 5.3 尺寸单位详解

```css
/* 绝对单位 */
.absolute-units {
  width: 100px;    /* 像素 */
  height: 2in;     /* 英寸 */
  margin: 1cm;     /* 厘米 */
  padding: 10mm;   /* 毫米 */
}

/* 相对单位 */
.relative-units {
  font-size: 1em;     /* 相对于父元素字体大小 */
  width: 10rem;       /* 相对于根元素字体大小 */
  height: 50%;        /* 相对于父元素 */
  margin: 2ex;        /* 相对于字符x的高度 */
  padding: 1ch;       /* 相对于字符0的宽度 */
}

/* 视口单位 */
.viewport-units {
  width: 50vw;        /* 视口宽度的50% */
  height: 100vh;      /* 视口高度的100% */
  font-size: 4vmin;   /* 视口宽高中较小值的4% */
  padding: 2vmax;     /* 视口宽高中较大值的2% */
}
```

## 6. 实践练习

### 练习1：创建一个卡片组件

```html
<div class="card">
  <img src="avatar.jpg" alt="头像" class="card-avatar">
  <div class="card-content">
    <h3 class="card-title">张三</h3>
    <p class="card-description">前端开发工程师</p>
    <div class="card-tags">
      <span class="tag">JavaScript</span>
      <span class="tag">React</span>
      <span class="tag">CSS</span>
    </div>
  </div>
</div>
```

**要求**：
1. 卡片有白色背景和阴影
2. 头像是圆形的
3. 标题使用较大的字体
4. 标签有背景色和圆角
5. 整体布局美观

### 练习2：创建一个按钮样式库

```html
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-success">成功按钮</button>
<button class="btn btn-danger">危险按钮</button>
<button class="btn btn-large">大按钮</button>
<button class="btn btn-small">小按钮</button>
```

**要求**：
1. 基础按钮样式
2. 不同颜色主题
3. 不同尺寸变体
4. 悬停和激活状态
5. 圆角和阴影效果

## 7. 常见问题

### Q1: 为什么设置了高度100%但没有效果？

**原因**：百分比高度需要父元素有明确的高度。

**解决方案**：
```css
html, body {
  height: 100%;
}

.full-height {
  height: 100%;
}
```

### Q2: 如何实现水平居中？

**不同情况的解决方案**：

```css
/* 文本居中 */
.text-center {
  text-align: center;
}

/* 块级元素居中 */
.block-center {
  width: 600px;
  margin: 0 auto;
}

/* 行内块元素居中 */
.parent {
  text-align: center;
}

.inline-block-center {
  display: inline-block;
}
```

### Q3: 边距重叠问题如何解决？

**解决方法**：
```css
/* 方法1：使用padding代替margin */
.no-collapse-padding {
  padding-top: 20px;
}

/* 方法2：使用border */
.no-collapse-border {
  border-top: 1px solid transparent;
}

/* 方法3：创建BFC */
.no-collapse-bfc {
  overflow: hidden;
}
```

## 8. 下一步学习

完成本章学习后，你可以继续学习：
- [盒模型深入](./04-box-model.md)
- [显示与定位](./05-display-positioning.md)

## 9. 总结

CSS基本样式属性是构建网页外观的基础：

1. **颜色背景**：控制元素的颜色和背景效果
2. **字体文本**：设置文字的显示样式
3. **边框轮廓**：定义元素的边界样式
4. **内外边距**：控制元素的间距
5. **宽高尺寸**：确定元素的大小

 