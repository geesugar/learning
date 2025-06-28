# CSS性能优化

CSS性能优化是现代Web开发的重要技能，直接影响用户体验和页面加载速度。

## 核心优化策略

### 1. CSS文件优化
```css
/* 压缩前 */
.button {
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
}

/* 压缩后 */
.button{padding:12px 24px;background-color:#007bff;color:white;border:none;border-radius:4px}
```

### 2. 关键CSS提取
```html
<!-- 关键CSS内联 -->
<style>
  .header { background: #fff; padding: 1rem; }
  .nav { display: flex; }
</style>

<!-- 非关键CSS异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

### 3. 选择器优化
```css
/* ❌ 低效选择器 */
div div div p { color: red; }
* { margin: 0; }

/* ✅ 高效选择器 */
.content-text { color: red; }
.reset { margin: 0; }
```

### 4. 动画性能
```css
/* ❌ 触发重排 */
.bad-animation {
  transition: left 0.3s;
}

/* ✅ GPU加速 */
.good-animation {
  transition: transform 0.3s;
  will-change: transform;
}
```

## 实用工具

### PostCSS优化配置
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default'
    }),
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html', './src/**/*.js']
    })
  ]
}
```

### Webpack配置
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

## 性能测量

### Lighthouse CI
```bash
npm install -g @lhci/cli
lhci autorun
```

### Bundle分析
```bash
npm install --save-dev webpack-bundle-analyzer
npm run build -- --analyze
```

## 最佳实践

1. **减少HTTP请求** - 合并CSS文件
2. **启用压缩** - Gzip/Brotli压缩
3. **缓存策略** - 设置合适的缓存头
4. **代码分割** - 按需加载CSS
5. **关键路径优化** - 优先加载首屏CSS

---

这些技术可以显著提升CSS性能，建议在实际项目中逐步应用！ 🚀 