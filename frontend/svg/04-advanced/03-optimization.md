# SVG优化与工程化

SVG的工程化应用需要考虑自动化工具链、性能优化、团队协作等多个方面。本章将深入探讨如何在现代开发工作流中高效地使用SVG技术。

## 🎯 学习目标

完成本章学习后，您将能够：
- 建立完整的SVG自动化工作流
- 掌握各种SVG优化工具和技术
- 集成SVG到现代构建系统
- 实现SVG的版本管理和团队协作
- 构建可维护的SVG项目架构

## 🛠️ 自动化工具链

### SVGO优化工具

```bash
# 安装SVGO
npm install -g svgo

# 基本优化
svgo input.svg -o output.svg

# 批量优化
svgo -f ./icons -o ./optimized-icons

# 自定义配置
svgo --config svgo.config.js input.svg
```

```javascript
// svgo.config.js
module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // 保留viewBox
          removeViewBox: false,
          // 保留ID用于引用
          cleanupIDs: {
            remove: false,
            minify: false
          }
        }
      }
    },
    // 自定义插件
    {
      name: 'customPlugin',
      fn: () => {
        return {
          element: {
            enter: (node, parentNode) => {
              // 自定义优化逻辑
              if (node.name === 'rect' && node.attributes.width === '0') {
                // 移除宽度为0的矩形
                parentNode.children = parentNode.children.filter(child => child !== node);
              }
            }
          }
        };
      }
    }
  ]
};
```

### Webpack集成

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader',
              name: 'images/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // SVG Sprite插件
    new SVGSpritePlugin({
      src: path.resolve(__dirname, 'src/icons'),
      filename: 'icons-sprite.svg',
      svgo: {
        plugins: [
          { removeTitle: true },
          { removeDesc: true },
          { removeComments: true }
        ]
      }
    })
  ]
};
```

### Gulp自动化流程

```javascript
// gulpfile.js
const gulp = require('gulp');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const cheerio = require('gulp-cheerio');

// SVG优化任务
gulp.task('svg-optimize', () => {
  return gulp.src('src/icons/*.svg')
    .pipe(svgmin({
      plugins: [
        { removeTitle: true },
        { removeDesc: true },
        { removeComments: true },
        { removeMetadata: true },
        { removeEditorsNSData: true },
        { cleanupAttrs: true },
        { mergeStyles: true },
        { inlineStyles: true }
      ]
    }))
    .pipe(gulp.dest('dist/icons'));
});

// SVG Sprite生成
gulp.task('svg-sprite', () => {
  return gulp.src('src/icons/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
      run: function($) {
        // 添加样式隐藏sprite
        $('svg').attr('style', 'position: absolute; width: 0; height: 0; overflow: hidden;');
        // 为每个symbol添加viewBox
        $('symbol').each(function() {
          const $symbol = $(this);
          if (!$symbol.attr('viewBox')) {
            $symbol.attr('viewBox', '0 0 24 24');
          }
        });
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(rename('icons-sprite.svg'))
    .pipe(gulp.dest('dist'));
});

// 监听文件变化
gulp.task('watch', () => {
  gulp.watch('src/icons/*.svg', gulp.series('svg-optimize', 'svg-sprite'));
});

// 默认任务
gulp.task('default', gulp.series('svg-optimize', 'svg-sprite', 'watch'));
```

## 📦 图标系统工程化

### 图标组件化

```javascript
// IconComponent.js
import React from 'react';
import PropTypes from 'prop-types';

// 图标映射表
const iconMap = {
  home: () => import('./icons/home.svg'),
  user: () => import('./icons/user.svg'),
  settings: () => import('./icons/settings.svg'),
  // ... 更多图标
};

class Icon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      SvgComponent: null,
      loading: true,
      error: null
    };
  }
  
  async componentDidMount() {
    await this.loadIcon();
  }
  
  async componentDidUpdate(prevProps) {
    if (prevProps.name !== this.props.name) {
      await this.loadIcon();
    }
  }
  
  async loadIcon() {
    const { name } = this.props;
    
    try {
      this.setState({ loading: true, error: null });
      
      if (iconMap[name]) {
        const module = await iconMap[name]();
        this.setState({
          SvgComponent: module.default || module.ReactComponent,
          loading: false
        });
      } else {
        throw new Error(`Icon "${name}" not found`);
      }
    } catch (error) {
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }
  
  render() {
    const { 
      name, 
      size = 24, 
      color = 'currentColor', 
      className = '',
      style = {},
      ...rest 
    } = this.props;
    
    const { SvgComponent, loading, error } = this.state;
    
    if (loading) {
      return <span className={`icon-loading ${className}`}>⏳</span>;
    }
    
    if (error) {
      console.warn(`Icon loading error:`, error);
      return <span className={`icon-error ${className}`}>❌</span>;
    }
    
    if (!SvgComponent) {
      return null;
    }
    
    const iconStyle = {
      width: size,
      height: size,
      fill: color,
      display: 'inline-block',
      ...style
    };
    
    return (
      <SvgComponent 
        className={`icon icon-${name} ${className}`}
        style={iconStyle}
        {...rest}
      />
    );
  }
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Icon;

// 使用示例
// <Icon name="home" size={32} color="#3498db" />
```

### 图标管理系统

```javascript
// IconManager.js
class IconManager {
  constructor() {
    this.icons = new Map();
    this.cache = new Map();
    this.observers = new Set();
    this.baseUrl = '/icons/';
  }
  
  // 注册图标
  register(name, config) {
    this.icons.set(name, {
      name,
      url: config.url || `${this.baseUrl}${name}.svg`,
      metadata: config.metadata || {},
      categories: config.categories || [],
      tags: config.tags || [],
      version: config.version || '1.0.0'
    });
    
    this.notifyObservers('register', { name, config });
  }
  
  // 批量注册
  registerBatch(iconConfigs) {
    iconConfigs.forEach(config => {
      this.register(config.name, config);
    });
  }
  
  // 获取图标
  async getIcon(name) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }
    
    const iconConfig = this.icons.get(name);
    if (!iconConfig) {
      throw new Error(`Icon "${name}" not registered`);
    }
    
    try {
      const response = await fetch(iconConfig.url);
      const svgContent = await response.text();
      
      const iconData = {
        name,
        content: svgContent,
        config: iconConfig,
        loadedAt: new Date().toISOString()
      };
      
      this.cache.set(name, iconData);
      this.notifyObservers('loaded', iconData);
      
      return iconData;
    } catch (error) {
      this.notifyObservers('error', { name, error: error.message });
      throw error;
    }
  }
  
  // 预加载图标
  async preloadIcons(names) {
    const promises = names.map(name => this.getIcon(name).catch(error => {
      console.warn(`Failed to preload icon "${name}":`, error);
      return null;
    }));
    
    const results = await Promise.allSettled(promises);
    const loaded = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    console.log(`Preloaded ${loaded}/${names.length} icons`);
    return results;
  }
  
  // 搜索图标
  search(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    this.icons.forEach((config, name) => {
      const score = this.calculateSearchScore(config, lowerQuery);
      if (score > 0) {
        results.push({ ...config, score });
      }
    });
    
    return results.sort((a, b) => b.score - a.score);
  }
  
  calculateSearchScore(config, query) {
    let score = 0;
    
    // 名称匹配
    if (config.name.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // 标签匹配
    config.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        score += 5;
      }
    });
    
    // 分类匹配
    config.categories.forEach(category => {
      if (category.toLowerCase().includes(query)) {
        score += 3;
      }
    });
    
    return score;
  }
  
  // 获取图标列表
  getIconList(filter = {}) {
    const icons = Array.from(this.icons.values());
    
    if (filter.category) {
      return icons.filter(icon => icon.categories.includes(filter.category));
    }
    
    if (filter.tag) {
      return icons.filter(icon => icon.tags.includes(filter.tag));
    }
    
    return icons;
  }
  
  // 获取分类列表
  getCategories() {
    const categories = new Set();
    this.icons.forEach(icon => {
      icon.categories.forEach(category => categories.add(category));
    });
    return Array.from(categories);
  }
  
  // 获取标签列表
  getTags() {
    const tags = new Set();
    this.icons.forEach(icon => {
      icon.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }
  
  // 清理缓存
  clearCache() {
    this.cache.clear();
    this.notifyObservers('cache-cleared');
  }
  
  // 观察者模式
  subscribe(observer) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      if (typeof observer === 'function') {
        observer(event, data);
      } else if (observer[event]) {
        observer[event](data);
      }
    });
  }
  
  // 导出配置
  exportConfig() {
    const config = {
      icons: Array.from(this.icons.values()),
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(config, null, 2);
  }
  
  // 导入配置
  importConfig(configJson) {
    const config = JSON.parse(configJson);
    
    if (config.icons) {
      this.registerBatch(config.icons);
    }
  }
}

// 全局图标管理器实例
const iconManager = new IconManager();

// 初始化示例图标
iconManager.registerBatch([
  {
    name: 'home',
    url: '/icons/home.svg',
    categories: ['navigation'],
    tags: ['house', 'main', 'start'],
    metadata: { author: 'Designer', license: 'MIT' }
  },
  {
    name: 'user',
    url: '/icons/user.svg',
    categories: ['people'],
    tags: ['person', 'profile', 'account'],
    metadata: { author: 'Designer', license: 'MIT' }
  }
]);

export default iconManager;
```

## 🔧 性能优化策略

### SVG代码优化

```javascript
// SVGOptimizer.js
class SVGOptimizer {
  constructor(options = {}) {
    this.options = {
      removeComments: true,
      removeMetadata: true,
      removeEmptyElements: true,
      mergeStyles: true,
      optimizePaths: true,
      precision: 3,
      ...options
    };
  }
  
  optimize(svgString) {
    let optimized = svgString;
    
    // 移除注释
    if (this.options.removeComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    // 移除元数据
    if (this.options.removeMetadata) {
      optimized = this.removeMetadata(optimized);
    }
    
    // 移除空元素
    if (this.options.removeEmptyElements) {
      optimized = this.removeEmptyElements(optimized);
    }
    
    // 合并样式
    if (this.options.mergeStyles) {
      optimized = this.mergeStyles(optimized);
    }
    
    // 优化路径
    if (this.options.optimizePaths) {
      optimized = this.optimizePaths(optimized);
    }
    
    // 压缩空白
    optimized = this.compressWhitespace(optimized);
    
    return optimized;
  }
  
  removeMetadata(svg) {
    return svg
      .replace(/<title[\s\S]*?<\/title>/gi, '')
      .replace(/<desc[\s\S]*?<\/desc>/gi, '')
      .replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  }
  
  removeEmptyElements(svg) {
    return svg
      .replace(/<g[^>]*>\s*<\/g>/g, '')
      .replace(/<defs[^>]*>\s*<\/defs>/g, '')
      .replace(/<clipPath[^>]*>\s*<\/clipPath>/g, '');
  }
  
  mergeStyles(svg) {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styles = [];
    let match;
    
    while ((match = styleRegex.exec(svg)) !== null) {
      styles.push(match[1]);
    }
    
    if (styles.length > 1) {
      const mergedStyles = styles.join('\\n');
      svg = svg.replace(styleRegex, '');
      svg = svg.replace('<svg', `<style>${mergedStyles}</style><svg`);
    }
    
    return svg;
  }
  
  optimizePaths(svg) {
    const pathRegex = /d="([^"]+)"/g;
    
    return svg.replace(pathRegex, (match, pathData) => {
      const optimizedPath = this.optimizePathData(pathData);
      return `d="${optimizedPath}"`;
    });
  }
  
  optimizePathData(pathData) {
    return pathData
      // 移除多余空格
      .replace(/\s+/g, ' ')
      // 优化数字精度
      .replace(/(\d+\.\d{4,})/g, (match) => {
        return parseFloat(match).toFixed(this.options.precision);
      })
      // 移除不必要的零
      .replace(/(\d)\.0+(\D)/g, '$1$2')
      .replace(/0+(\d)/g, '$1')
      .trim();
  }
  
  compressWhitespace(svg) {
    return svg
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // 分析SVG文件
  analyze(svgString) {
    const analysis = {
      originalSize: svgString.length,
      elements: {},
      attributes: {},
      styles: 0,
      paths: 0
    };
    
    // 统计元素
    const elementRegex = /<(\w+)[^>]*>/g;
    let match;
    while ((match = elementRegex.exec(svgString)) !== null) {
      const tagName = match[1];
      analysis.elements[tagName] = (analysis.elements[tagName] || 0) + 1;
    }
    
    // 统计路径
    analysis.paths = (svgString.match(/d="/g) || []).length;
    
    // 统计样式
    analysis.styles = (svgString.match(/<style/g) || []).length;
    
    return analysis;
  }
}

// 批量优化工具
class BatchSVGOptimizer {
  constructor(optimizer) {
    this.optimizer = optimizer || new SVGOptimizer();
    this.results = [];
  }
  
  async optimizeFiles(files) {
    this.results = [];
    
    for (const file of files) {
      try {
        const result = await this.optimizeFile(file);
        this.results.push(result);
      } catch (error) {
        this.results.push({
          file: file.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return this.results;
  }
  
  async optimizeFile(file) {
    const originalContent = await this.readFile(file);
    const optimizedContent = this.optimizer.optimize(originalContent);
    
    const originalAnalysis = this.optimizer.analyze(originalContent);
    const optimizedAnalysis = this.optimizer.analyze(optimizedContent);
    
    const compressionRatio = ((originalAnalysis.originalSize - optimizedAnalysis.originalSize) / originalAnalysis.originalSize * 100).toFixed(2);
    
    return {
      file: file.name,
      success: true,
      originalSize: originalAnalysis.originalSize,
      optimizedSize: optimizedAnalysis.originalSize,
      compressionRatio: compressionRatio + '%',
      originalContent,
      optimizedContent
    };
  }
  
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  generateReport() {
    const totalOriginalSize = this.results.reduce((sum, result) => 
      sum + (result.originalSize || 0), 0);
    const totalOptimizedSize = this.results.reduce((sum, result) => 
      sum + (result.optimizedSize || 0), 0);
    
    return {
      totalFiles: this.results.length,
      successfulOptimizations: this.results.filter(r => r.success).length,
      totalOriginalSize,
      totalOptimizedSize,
      totalSavings: totalOriginalSize - totalOptimizedSize,
      averageCompressionRatio: ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2) + '%',
      results: this.results
    };
  }
}

export { SVGOptimizer, BatchSVGOptimizer };
```

## 📊 监控和分析

### 性能监控系统

```javascript
// SVGPerformanceMonitor.js
class SVGPerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTimes: [],
      renderTimes: [],
      memoryUsage: [],
      errorCounts: new Map()
    };
    
    this.observers = new Set();
    this.isMonitoring = false;
  }
  
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.setupErrorTracking();
  }
  
  stopMonitoring() {
    this.isMonitoring = false;
  }
  
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('.svg')) {
            this.recordLoadTime(entry.name, entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
  
  setupMemoryMonitoring() {
    if (performance.memory) {
      setInterval(() => {
        if (this.isMonitoring) {
          this.recordMemoryUsage();
        }
      }, 5000);
    }
  }
  
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      if (event.filename && event.filename.includes('.svg')) {
        this.recordError('load-error', event.filename);
      }
    });
  }
  
  recordLoadTime(url, duration) {
    this.metrics.loadTimes.push({
      url,
      duration,
      timestamp: Date.now()
    });
    
    this.notifyObservers('load-time', { url, duration });
  }
  
  recordRenderTime(identifier, duration) {
    this.metrics.renderTimes.push({
      identifier,
      duration,
      timestamp: Date.now()
    });
    
    this.notifyObservers('render-time', { identifier, duration });
  }
  
  recordMemoryUsage() {
    if (performance.memory) {
      const usage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.metrics.memoryUsage.push(usage);
      this.notifyObservers('memory-usage', usage);
    }
  }
  
  recordError(type, details) {
    const count = this.metrics.errorCounts.get(type) || 0;
    this.metrics.errorCounts.set(type, count + 1);
    
    this.notifyObservers('error', { type, details, count: count + 1 });
  }
  
  getReport() {
    const loadTimes = this.metrics.loadTimes;
    const renderTimes = this.metrics.renderTimes;
    
    return {
      summary: {
        totalSVGLoads: loadTimes.length,
        averageLoadTime: this.calculateAverage(loadTimes.map(l => l.duration)),
        maxLoadTime: Math.max(...loadTimes.map(l => l.duration)),
        totalRenders: renderTimes.length,
        averageRenderTime: this.calculateAverage(renderTimes.map(r => r.duration)),
        totalErrors: Array.from(this.metrics.errorCounts.values()).reduce((sum, count) => sum + count, 0)
      },
      details: {
        loadTimes: loadTimes.slice(-100), // 最近100次
        renderTimes: renderTimes.slice(-100),
        memoryUsage: this.metrics.memoryUsage.slice(-20), // 最近20次
        errorBreakdown: Object.fromEntries(this.metrics.errorCounts)
      },
      recommendations: this.generateRecommendations()
    };
  }
  
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
  
  generateRecommendations() {
    const recommendations = [];
    const loadTimes = this.metrics.loadTimes;
    
    if (loadTimes.length > 0) {
      const avgLoadTime = this.calculateAverage(loadTimes.map(l => l.duration));
      
      if (avgLoadTime > 100) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          message: `平均SVG加载时间较长(${avgLoadTime.toFixed(2)}ms)，建议优化文件大小或使用预加载`
        });
      }
      
      const slowLoads = loadTimes.filter(l => l.duration > 200);
      if (slowLoads.length > loadTimes.length * 0.1) {
        recommendations.push({
          type: 'optimization',
          priority: 'medium',
          message: `${slowLoads.length}个SVG文件加载较慢，建议进行优化`,
          files: slowLoads.map(l => l.url)
        });
      }
    }
    
    if (this.metrics.errorCounts.size > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: '检测到SVG加载错误，请检查文件路径和网络连接',
        errors: Object.fromEntries(this.metrics.errorCounts)
      });
    }
    
    return recommendations;
  }
  
  subscribe(observer) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      if (typeof observer === 'function') {
        observer(event, data);
      } else if (observer[event]) {
        observer[event](data);
      }
    });
  }
  
  exportMetrics() {
    return {
      ...this.metrics,
      exportedAt: new Date().toISOString()
    };
  }
  
  clearMetrics() {
    this.metrics = {
      loadTimes: [],
      renderTimes: [],
      memoryUsage: [],
      errorCounts: new Map()
    };
  }
}

// 全局监控实例
const svgMonitor = new SVGPerformanceMonitor();

// 自动启动监控
if (typeof window !== 'undefined') {
  svgMonitor.startMonitoring();
}

export default svgMonitor;
```

## 🎯 总结

SVG的优化与工程化是现代Web开发中的重要环节。通过建立完善的工具链、监控体系和团队协作流程，可以显著提升SVG应用的质量和维护效率。

### 关键要点：
1. **建立自动化的SVG优化工作流**
2. **实现可维护的图标管理系统**
3. **集成现代构建工具和流程**
4. **建立性能监控和分析体系**
5. **制定团队协作和版本管理规范**

### 最佳实践：
- 使用标准化的优化工具和配置
- 建立清晰的文件组织和命名规范
- 实现自动化的质量检查和测试
- 提供完整的文档和使用指南
- 建立持续的性能监控和改进机制

继续学习[高级技巧与案例](04-advanced-techniques.md)，探索SVG在复杂项目中的高级应用技术和实际案例分析。 