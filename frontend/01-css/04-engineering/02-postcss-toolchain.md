# PostCSS与构建工具链

PostCSS是一个用JavaScript工具和插件转换CSS代码的工具。它将CSS解析成抽象语法树(AST)，然后通过插件系统对AST进行变换，最后重新生成CSS代码。

## 📋 目录

1. [PostCSS基础概念](#postcss基础概念)
2. [核心插件详解](#核心插件详解)
3. [构建工具集成](#构建工具集成)
4. [CSS优化工具](#css优化工具)
5. [现代工作流集成](#现代工作流集成)
6. [性能优化实践](#性能优化实践)

## PostCSS基础概念

### 什么是PostCSS

PostCSS不是预处理器，而是一个后处理器。它允许你使用插件来转换CSS，这些插件可以：
- 添加浏览器前缀
- 使用未来的CSS语法
- 优化和压缩CSS
- 静态分析CSS

### 基础安装和配置

```bash
# 安装PostCSS
npm install --save-dev postcss postcss-cli

# 安装常用插件
npm install --save-dev autoprefixer
npm install --save-dev postcss-preset-env
npm install --save-dev cssnano
```

### 配置文件

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      stage: 1,
      features: {
        'nesting-rules': true,
        'custom-properties': true
      }
    }),
    require('cssnano')({
      preset: 'default'
    })
  ]
}
```

### 命令行使用

```bash
# 基本用法
postcss src/styles.css -o dist/styles.css

# 监听文件变化
postcss src/styles.css -o dist/styles.css --watch

# 使用配置文件
postcss src/styles.css -o dist/styles.css --config postcss.config.js

# 处理多个文件
postcss src/*.css --dir dist/
```

## 核心插件详解

### Autoprefixer - 自动前缀

Autoprefixer是PostCSS最受欢迎的插件，自动为CSS属性添加浏览器前缀。

#### 基础配置
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'IE 11'
      ],
      grid: true
    })
  ]
}
```

#### 使用示例
```css
/* 输入 */
.container {
  display: flex;
  user-select: none;
  transform: scale(1.5);
  transition: transform 0.3s ease;
}

/* 输出 */
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  -webkit-transform: scale(1.5);
          transform: scale(1.5);
  -webkit-transition: -webkit-transform 0.3s ease;
  transition: -webkit-transform 0.3s ease;
  transition: transform 0.3s ease;
  transition: transform 0.3s ease, -webkit-transform 0.3s ease;
}
```

#### Browserslist配置
```json
// package.json
{
  "browserslist": [
    "defaults",
    "not IE 11",
    "maintained node versions"
  ]
}
```

```
# .browserslistrc
> 1%
last 2 versions
not dead
not IE 11
```

### PostCSS Preset Env - 现代CSS特性

PostCSS Preset Env让你使用现代CSS特性，并根据目标浏览器进行转换。

#### 配置选项
```javascript
module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 2, // 使用stage 2的特性
      features: {
        'custom-properties': false, // 禁用CSS变量转换
        'nesting-rules': true,      // 启用嵌套规则
        'custom-media-queries': true // 启用自定义媒体查询
      },
      autoprefixer: {
        grid: true
      }
    })
  ]
}
```

#### 现代CSS特性示例

```css
/* 输入 - 使用现代CSS特性 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
}

@custom-media --small-viewport (max-width: 30em);

.card {
  color: var(--primary-color);
  
  & .title {
    font-size: 1.2em;
    color: var(--secondary-color);
  }
  
  @media (--small-viewport) {
    padding: 1em;
  }
}

/* 输出 - 兼容性转换后 */
.card {
  color: #007bff;
  color: var(--primary-color);
}

.card .title {
  font-size: 1.2em;
  color: #6c757d;
  color: var(--secondary-color);
}

@media (max-width: 30em) {
  .card {
    padding: 1em;
  }
}
```

### PostCSS嵌套

启用CSS嵌套语法，类似Sass的功能。

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-nested')
  ]
}
```

```css
/* 输入 */
.component {
  background: white;
  
  &__header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    
    &--featured {
      background: #f8f9fa;
    }
  }
  
  &__content {
    padding: 1rem;
    
    p {
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

/* 输出 */
.component {
  background: white;
}

.component__header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.component__header--featured {
  background: #f8f9fa;
}

.component__content {
  padding: 1rem;
}

.component__content p {
  margin-bottom: 1rem;
}

.component__content p:last-child {
  margin-bottom: 0;
}
```

### PostCSS导入

处理@import语句，合并CSS文件。

```javascript
module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
    require('cssnano')
  ]
}
```

```css
/* variables.css */
:root {
  --primary-color: #007bff;
  --font-size-base: 1rem;
}

/* components.css */
@import './variables.css';

.button {
  font-size: var(--font-size-base);
  background-color: var(--primary-color);
}
```

## 构建工具集成

### Webpack集成

#### 基础配置
```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                  require('postcss-preset-env'),
                  require('cssnano')
                ]
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### 生产环境优化
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  }
};
```

### Vite集成

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-preset-env')({
          stage: 1
        }),
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  }
});
```

### Rollup集成

```javascript
// rollup.config.js
import postcss from 'rollup-plugin-postcss';

export default {
  plugins: [
    postcss({
      extract: true,
      minimize: true,
      plugins: [
        require('autoprefixer'),
        require('postcss-preset-env')
      ]
    })
  ]
};
```

### Gulp集成

```javascript
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

gulp.task('css', () => {
  return gulp.src('src/**/*.css')
    .pipe(postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(gulp.dest('dist/'));
});
```

## CSS优化工具

### CSSnano - CSS压缩

CSSnano是一个模块化的CSS压缩器。

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: false,
      }]
    })
  ]
}
```

#### 优化配置选项
```javascript
require('cssnano')({
  preset: ['advanced', {
    // 合并相同的规则
    mergeLonghand: true,
    mergeRules: true,
    
    // 移除无用代码
    discardUnused: true,
    discardDuplicates: true,
    
    // 压缩字体
    minifyFontValues: true,
    
    // 压缩选择器
    minifySelectors: true,
    
    // Z-index优化
    zindex: false // 保持原始z-index值
  }]
})
```

### PurgeCSS - 移除无用CSS

PurgeCSS分析你的内容文件，移除未使用的CSS。

```javascript
// postcss.config.js
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: [
        './src/**/*.html',
        './src/**/*.js',
        './src/**/*.jsx',
        './src/**/*.ts',
        './src/**/*.tsx'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [
        'body',
        'html',
        /^(.*-)?container(-.*)?$/,
        /^(.*-)?row(-.*)?$/,
        /^(.*-)?col(-.*)?$/
      ]
    })
  ]
}
```

#### 高级配置
```javascript
purgecss({
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  
  // 提取器配置
  extractors: [
    {
      extractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      extensions: ['html', 'js', 'jsx']
    }
  ],
  
  // 白名单
  safelist: {
    standard: ['body', 'html'],
    deep: [/^modal/, /^tooltip/],
    greedy: [/^data-/, /^aria-/]
  },
  
  // 拒绝列表
  blocklist: [
    'old-class',
    /^deprecated-/
  ],
  
  // 保留关键帧
  keyframes: true,
  
  // 保留字体
  fontFace: true
})
```

### UnCSS - 另一种移除无用CSS的方法

```javascript
const uncss = require('postcss-uncss');

module.exports = {
  plugins: [
    uncss({
      html: ['index.html', 'about.html'],
      ignore: ['.added-by-js', /\.is-/, /\.has-/]
    })
  ]
}
```

### Critical CSS提取

```javascript
const critical = require('critical');

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  dest: 'index-critical.html',
  width: 1300,
  height: 900,
  penthouse: {
    blockJSRequests: false,
  }
});
```

## 现代工作流集成

### 开发环境配置

```javascript
// postcss.config.js
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-properties'),
    require('autoprefixer'),
    
    // 仅在生产环境使用
    ...(isProduction ? [
      require('@fullhuman/postcss-purgecss')({
        content: ['./src/**/*.{html,js,jsx,ts,tsx}']
      }),
      require('cssnano')({
        preset: 'default'
      })
    ] : [])
  ]
}
```

### 代码质量检查

#### Stylelint集成
```javascript
// stylelint.config.js
module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    'order/properties-alphabetical-order': true,
    'color-no-invalid-hex': true,
    'declaration-no-important': true,
    'max-nesting-depth': 3
  }
};
```

#### PostCSS Sorting
```javascript
module.exports = {
  plugins: [
    require('postcss-sorting')({
      order: [
        'custom-properties',
        'dollar-variables',
        'declarations',
        'at-rules',
        'rules'
      ],
      'properties-order': 'alphabetical'
    })
  ]
}
```

### 性能监控

#### CSS Stats
```bash
npm install -g cssstats
cssstats dist/styles.css
```

#### Bundle分析
```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'css-report.html'
    })
  ]
};
```

## 性能优化实践

### 构建时优化

#### 1. CSS分割
```javascript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

#### 2. 按需加载CSS
```javascript
// 动态导入CSS
async function loadComponent() {
  const { default: Component } = await import('./Component');
  await import('./Component.css');
  return Component;
}
```

#### 3. 关键CSS内联
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlCriticalWebpackPlugin = require('html-critical-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin(),
    new HtmlCriticalWebpackPlugin({
      base: path.resolve(__dirname, 'dist'),
      src: 'index.html',
      dest: 'index.html',
      inline: true,
      minify: true,
      extract: true,
      width: 375,
      height: 565,
      penthouse: {
        blockJSRequests: false,
      }
    })
  ]
};
```

### 运行时优化

#### 1. CSS预加载
```html
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

#### 2. 媒体查询优化
```css
/* 将不同媒体查询的样式分离 */
@media print {
  /* 打印样式 */
}

@media screen and (max-width: 768px) {
  /* 移动端样式 */
}
```

#### 3. 字体优化
```css
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* 优化字体加载 */
}
```

### 性能测量

#### Lighthouse集成
```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'info', output: 'html', port: chrome.port};
  const runnerResult = await lighthouse(url, options);
  
  console.log('Report is done for', runnerResult.lhr.finalUrl);
  console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
  
  await chrome.kill();
}
```

## 🎯 实践练习

### 练习1：构建PostCSS工作流
搭建完整的PostCSS构建环境：
- 配置多种插件
- 集成到Webpack/Vite
- 实现开发/生产环境差异化配置

### 练习2：CSS优化项目
对现有项目进行CSS优化：
- 使用PurgeCSS移除无用样式
- 提取关键CSS
- 分析优化效果

### 练习3：自定义PostCSS插件
开发一个简单的PostCSS插件：
- 理解AST操作
- 实现特定的CSS转换
- 发布到npm

## 📚 延伸阅读

- [PostCSS官方文档](https://postcss.org/)
- [PostCSS插件目录](https://github.com/postcss/postcss/blob/main/docs/plugins.md)
- [CSS优化最佳实践](https://web.dev/fast/#optimize-your-css)

## 🔗 下一步学习

完成PostCSS学习后，继续学习：
- [CSS性能优化](./03-performance-optimization.md)
- CSS工程化实战项目

---

PostCSS是现代CSS工作流的核心工具，掌握它能让你的CSS开发更加高效和专业！ ⚡ 