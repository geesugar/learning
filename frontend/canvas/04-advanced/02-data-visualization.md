# 第13章：Canvas数据可视化

## 🎯 学习目标

完成本章学习后，您将能够：
- **构建专业图表库**：设计可复用的图表组件系统
- **实现数据绑定机制**：连接数据源与视觉元素
- **开发交互式图表**：支持缩放、筛选、高亮等操作
- **处理实时数据流**：实现动态更新和流式处理
- **应用可视化最佳实践**：创建直观易懂的数据展示

## 📊 图表库架构设计

### 核心组件架构

```javascript
// 图表库核心架构
class ChartLibrary {
    constructor() {
        this.charts = new Map();
        this.themes = new Map();
        this.plugins = new Map();
        this.defaultTheme = 'light';
    }

    // 注册图表类型
    registerChart(name, chartClass) {
        this.charts.set(name, chartClass);
    }

    // 创建图表实例
    createChart(type, container, options = {}) {
        const ChartClass = this.charts.get(type);
        if (!ChartClass) {
            throw new Error(`Unknown chart type: ${type}`);
        }
        
        const chart = new ChartClass(container, {
            ...this.getDefaultOptions(),
            ...options
        });
        
        return chart;
    }

    // 获取默认配置
    getDefaultOptions() {
        return {
            theme: this.defaultTheme,
            responsive: true,
            animation: true,
            interaction: true
        };
    }
}

// 基础图表类
class BaseChart {
    constructor(container, options = {}) {
        this.container = container;
        this.options = { ...this.getDefaultOptions(), ...options };
        this.canvas = null;
        this.ctx = null;
        this.data = null;
        this.scales = {};
        this.plugins = [];
        this.eventListeners = new Map();
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.initializeScales();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.resize();
    }

    setupEventListeners() {
        // 响应式处理
        window.addEventListener('resize', () => this.resize());
        
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    }

    // 抽象方法，子类必须实现
    render() {
        throw new Error('render method must be implemented');
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.render();
    }

    // 数据更新
    updateData(newData) {
        this.data = newData;
        this.updateScales();
        this.render();
    }
}
```

### 折线图实现

```javascript
class LineChart extends BaseChart {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            curve: 'linear', // linear, smooth, step
            points: true,
            area: false,
            grid: true,
            legend: true,
            tooltip: true,
            colors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'],
            lineWidth: 2,
            pointRadius: 4
        };
    }

    initializeScales() {
        this.scales.x = new LinearScale();
        this.scales.y = new LinearScale();
    }

    updateScales() {
        if (!this.data || !this.data.datasets) return;

        const allValues = this.data.datasets.flatMap(dataset => dataset.data);
        const labels = this.data.labels || [];

        this.scales.x.setDomain([0, labels.length - 1]);
        this.scales.y.setDomain([
            Math.min(...allValues) * 0.9,
            Math.max(...allValues) * 1.1
        ]);

        const padding = 60;
        this.scales.x.setRange([padding, this.canvas.width / window.devicePixelRatio - padding]);
        this.scales.y.setRange([this.canvas.height / window.devicePixelRatio - padding, padding]);
    }

    render() {
        if (!this.data) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.options.grid) {
            this.renderGrid();
        }
        
        this.renderAxes();
        this.renderDatasets();
        
        if (this.options.legend) {
            this.renderLegend();
        }
        
        if (this.options.tooltip && this.hoveredPoint) {
            this.renderTooltip();
        }
    }

    renderGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);

        // 纵向网格线
        const xTicks = this.scales.x.getTicks();
        xTicks.forEach(tick => {
            this.ctx.beginPath();
            this.ctx.moveTo(tick.position, this.scales.y.range[1]);
            this.ctx.lineTo(tick.position, this.scales.y.range[0]);
            this.ctx.stroke();
        });

        // 横向网格线
        const yTicks = this.scales.y.getTicks();
        yTicks.forEach(tick => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.scales.x.range[0], tick.position);
            this.ctx.lineTo(this.scales.x.range[1], tick.position);
            this.ctx.stroke();
        });

        this.ctx.setLineDash([]);
    }

    renderAxes() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';

        // X轴
        this.ctx.beginPath();
        this.ctx.moveTo(this.scales.x.range[0], this.scales.y.range[0]);
        this.ctx.lineTo(this.scales.x.range[1], this.scales.y.range[0]);
        this.ctx.stroke();

        // Y轴
        this.ctx.beginPath();
        this.ctx.moveTo(this.scales.x.range[0], this.scales.y.range[0]);
        this.ctx.lineTo(this.scales.x.range[0], this.scales.y.range[1]);
        this.ctx.stroke();

        // X轴标签
        this.data.labels.forEach((label, i) => {
            const x = this.scales.x.scale(i);
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, x, this.scales.y.range[0] + 20);
        });

        // Y轴标签
        const yTicks = this.scales.y.getTicks();
        yTicks.forEach(tick => {
            this.ctx.textAlign = 'right';
            this.ctx.fillText(
                tick.value.toFixed(1), 
                this.scales.x.range[0] - 10, 
                tick.position + 4
            );
        });
    }

    renderDatasets() {
        this.data.datasets.forEach((dataset, datasetIndex) => {
            const color = this.options.colors[datasetIndex % this.options.colors.length];
            
            // 绘制区域填充
            if (this.options.area) {
                this.renderArea(dataset, color);
            }
            
            // 绘制线条
            this.renderLine(dataset, color);
            
            // 绘制数据点
            if (this.options.points) {
                this.renderPoints(dataset, color);
            }
        });
    }

    renderLine(dataset, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.setLineDash([]);

        this.ctx.beginPath();
        dataset.data.forEach((value, i) => {
            const x = this.scales.x.scale(i);
            const y = this.scales.y.scale(value);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                if (this.options.curve === 'smooth') {
                    this.drawSmoothLine(dataset, i, x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        });
        this.ctx.stroke();
    }

    renderPoints(dataset, color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;

        dataset.data.forEach((value, i) => {
            const x = this.scales.x.scale(i);
            const y = this.scales.y.scale(value);
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.options.pointRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    renderArea(dataset, color) {
        this.ctx.fillStyle = color + '20'; // 透明度
        
        this.ctx.beginPath();
        dataset.data.forEach((value, i) => {
            const x = this.scales.x.scale(i);
            const y = this.scales.y.scale(value);
            
            if (i === 0) {
                this.ctx.moveTo(x, this.scales.y.range[0]);
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        // 闭合到X轴
        const lastX = this.scales.x.scale(dataset.data.length - 1);
        this.ctx.lineTo(lastX, this.scales.y.range[0]);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 交互处理
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hoveredPoint = this.findNearestPoint(x, y);
        this.render();
    }

    findNearestPoint(mouseX, mouseY) {
        let nearestPoint = null;
        let minDistance = Infinity;

        this.data.datasets.forEach((dataset, datasetIndex) => {
            dataset.data.forEach((value, pointIndex) => {
                const x = this.scales.x.scale(pointIndex);
                const y = this.scales.y.scale(value);
                const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
                
                if (distance < minDistance && distance < 20) {
                    minDistance = distance;
                    nearestPoint = {
                        datasetIndex,
                        pointIndex,
                        value,
                        x,
                        y,
                        label: this.data.labels[pointIndex]
                    };
                }
            });
        });

        return nearestPoint;
    }

    renderTooltip() {
        if (!this.hoveredPoint) return;

        const { x, y, value, label } = this.hoveredPoint;
        const tooltip = `${label}: ${value}`;
        
        this.ctx.font = '12px Arial';
        const metrics = this.ctx.measureText(tooltip);
        const padding = 8;
        const tooltipWidth = metrics.width + padding * 2;
        const tooltipHeight = 20 + padding * 2;
        
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x + 10, y - 10, tooltipWidth, tooltipHeight);
        
        // 文字
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(tooltip, x + 10 + padding, y - 10 + padding + 12);
    }
}
```

### 比例尺系统

```javascript
class LinearScale {
    constructor() {
        this.domain = [0, 1];
        this.range = [0, 100];
        this.ticks = [];
    }

    setDomain(domain) {
        this.domain = domain;
        this.generateTicks();
    }

    setRange(range) {
        this.range = range;
    }

    scale(value) {
        const domainSize = this.domain[1] - this.domain[0];
        const rangeSize = this.range[1] - this.range[0];
        const ratio = (value - this.domain[0]) / domainSize;
        return this.range[0] + ratio * rangeSize;
    }

    invert(position) {
        const rangeSize = this.range[1] - this.range[0];
        const domainSize = this.domain[1] - this.domain[0];
        const ratio = (position - this.range[0]) / rangeSize;
        return this.domain[0] + ratio * domainSize;
    }

    generateTicks() {
        const [min, max] = this.domain;
        const tickCount = 5;
        const step = (max - min) / (tickCount - 1);
        
        this.ticks = [];
        for (let i = 0; i < tickCount; i++) {
            const value = min + i * step;
            this.ticks.push({
                value,
                position: this.scale(value)
            });
        }
    }

    getTicks() {
        return this.ticks;
    }
}

class TimeScale extends LinearScale {
    constructor() {
        super();
        this.timeFormat = 'MM/DD';
    }

    setDomain(domain) {
        // 转换时间为数值
        this.domain = domain.map(d => d instanceof Date ? d.getTime() : new Date(d).getTime());
        this.generateTicks();
    }

    generateTicks() {
        const [min, max] = this.domain;
        const tickCount = 5;
        const step = (max - min) / (tickCount - 1);
        
        this.ticks = [];
        for (let i = 0; i < tickCount; i++) {
            const timestamp = min + i * step;
            const date = new Date(timestamp);
            this.ticks.push({
                value: this.formatDate(date),
                position: this.scale(timestamp)
            });
        }
    }

    formatDate(date) {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    }
}
```

## 📊 柱状图实现

```javascript
class BarChart extends BaseChart {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            barWidth: 0.8,
            grouped: true,
            stacked: false,
            horizontal: false,
            spacing: 0.1
        };
    }

    render() {
        if (!this.data) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderAxes();
        this.renderBars();
        
        if (this.options.legend) {
            this.renderLegend();
        }
    }

    renderBars() {
        const categories = this.data.labels;
        const datasets = this.data.datasets;
        
        if (this.options.stacked) {
            this.renderStackedBars();
        } else {
            this.renderGroupedBars();
        }
    }

    renderGroupedBars() {
        const categories = this.data.labels;
        const datasets = this.data.datasets;
        const categoryWidth = (this.scales.x.range[1] - this.scales.x.range[0]) / categories.length;
        const barWidth = (categoryWidth * this.options.barWidth) / datasets.length;
        const groupPadding = categoryWidth * (1 - this.options.barWidth) / 2;

        datasets.forEach((dataset, datasetIndex) => {
            const color = this.options.colors[datasetIndex % this.options.colors.length];
            this.ctx.fillStyle = color;

            dataset.data.forEach((value, categoryIndex) => {
                const categoryX = this.scales.x.range[0] + categoryIndex * categoryWidth;
                const barX = categoryX + groupPadding + datasetIndex * barWidth;
                const barY = this.scales.y.scale(value);
                const barHeight = this.scales.y.range[0] - barY;

                // 绘制柱子
                this.ctx.fillRect(barX, barY, barWidth, barHeight);

                // 添加数值标签
                if (this.options.showValues) {
                    this.ctx.fillStyle = '#333';
                    this.ctx.font = '10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        value.toString(),
                        barX + barWidth / 2,
                        barY - 5
                    );
                    this.ctx.fillStyle = color;
                }
            });
        });
    }

    renderStackedBars() {
        const categories = this.data.labels;
        const datasets = this.data.datasets;
        const categoryWidth = (this.scales.x.range[1] - this.scales.x.range[0]) / categories.length;
        const barWidth = categoryWidth * this.options.barWidth;
        const barPadding = (categoryWidth - barWidth) / 2;

        categories.forEach((category, categoryIndex) => {
            let stackTop = this.scales.y.range[0];
            
            datasets.forEach((dataset, datasetIndex) => {
                const value = dataset.data[categoryIndex];
                const color = this.options.colors[datasetIndex % this.options.colors.length];
                
                this.ctx.fillStyle = color;
                
                const barX = this.scales.x.range[0] + categoryIndex * categoryWidth + barPadding;
                const barHeight = this.scales.y.range[0] - this.scales.y.scale(value);
                const barY = stackTop - barHeight;
                
                this.ctx.fillRect(barX, barY, barWidth, barHeight);
                
                stackTop = barY;
            });
        });
    }
}
```

## 🥧 饼图实现

```javascript
class PieChart extends BaseChart {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            doughnut: false,
            innerRadius: 0.3,
            startAngle: -Math.PI / 2,
            showLabels: true,
            showPercentages: true,
            labelOffset: 20
        };
    }

    render() {
        if (!this.data) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / (2 * window.devicePixelRatio);
        const centerY = this.canvas.height / (2 * window.devicePixelRatio);
        const radius = Math.min(centerX, centerY) - 50;
        
        this.renderSlices(centerX, centerY, radius);
        
        if (this.options.showLabels) {
            this.renderLabels(centerX, centerY, radius);
        }
        
        if (this.options.legend) {
            this.renderLegend();
        }
    }

    renderSlices(centerX, centerY, radius) {
        const total = this.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
        let currentAngle = this.options.startAngle;

        this.data.datasets[0].data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            const color = this.options.colors[index % this.options.colors.length];
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            
            if (this.options.doughnut) {
                const innerRadius = radius * this.options.innerRadius;
                this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                this.ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            } else {
                this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            // 添加边框
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            currentAngle += sliceAngle;
        });
    }

    renderLabels(centerX, centerY, radius) {
        const total = this.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
        let currentAngle = this.options.startAngle;

        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';

        this.data.datasets[0].data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            const labelAngle = currentAngle + sliceAngle / 2;
            
            const labelRadius = radius + this.options.labelOffset;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            const label = this.data.labels[index];
            const percentage = ((value / total) * 100).toFixed(1) + '%';
            
            this.ctx.fillText(label, labelX, labelY - 5);
            if (this.options.showPercentages) {
                this.ctx.fillText(percentage, labelX, labelY + 10);
            }
            
            currentAngle += sliceAngle;
        });
    }
}
```

## 🔄 实时数据处理

### 数据流管理器

```javascript
class DataStreamManager {
    constructor() {
        this.streams = new Map();
        this.subscribers = new Map();
        this.updateInterval = null;
        this.isRunning = false;
    }

    // 创建数据流
    createStream(name, config = {}) {
        const stream = {
            name,
            data: [],
            maxSize: config.maxSize || 1000,
            updateInterval: config.updateInterval || 1000,
            generator: config.generator || (() => Math.random() * 100),
            lastUpdate: Date.now(),
            subscribers: new Set()
        };
        
        this.streams.set(name, stream);
        return stream;
    }

    // 订阅数据流
    subscribe(streamName, callback) {
        const stream = this.streams.get(streamName);
        if (!stream) {
            throw new Error(`Stream ${streamName} not found`);
        }
        
        stream.subscribers.add(callback);
        
        // 返回取消订阅函数
        return () => {
            stream.subscribers.delete(callback);
        };
    }

    // 推送数据到流
    pushData(streamName, data) {
        const stream = this.streams.get(streamName);
        if (!stream) return;

        stream.data.push({
            timestamp: Date.now(),
            value: data
        });

        // 保持数据大小限制
        if (stream.data.length > stream.maxSize) {
            stream.data.shift();
        }

        // 通知订阅者
        stream.subscribers.forEach(callback => {
            callback(stream.data, data);
        });
    }

    // 启动实时更新
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateInterval = setInterval(() => {
            this.streams.forEach(stream => {
                const now = Date.now();
                if (now - stream.lastUpdate >= stream.updateInterval) {
                    const newData = stream.generator();
                    this.pushData(stream.name, newData);
                    stream.lastUpdate = now;
                }
            });
        }, 100);
    }

    // 停止实时更新
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
    }
}
```

### 实时图表组件

```javascript
class RealTimeChart extends LineChart {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            animation: false, // 关闭动画以提高性能
            maxDataPoints: 50 // 最大数据点数
        });
        
        this.dataStream = null;
        this.unsubscribe = null;
        this.isAutoScrolling = true;
        this.buffer = [];
    }

    connectToStream(streamManager, streamName) {
        this.dataStream = streamManager.streams.get(streamName);
        this.unsubscribe = streamManager.subscribe(streamName, (data, newValue) => {
            this.updateWithNewData(newValue);
        });
    }

    updateWithNewData(newValue) {
        if (!this.data) {
            this.data = {
                labels: [],
                datasets: [{
                    label: 'Real-time Data',
                    data: []
                }]
            };
        }

        const now = new Date();
        const timeLabel = now.toLocaleTimeString();
        
        // 添加新数据
        this.data.labels.push(timeLabel);
        this.data.datasets[0].data.push(newValue);
        
        // 保持数据量限制
        if (this.data.labels.length > this.options.maxDataPoints) {
            this.data.labels.shift();
            this.data.datasets[0].data.shift();
        }
        
        // 更新比例尺和重新渲染
        this.updateScales();
        this.render();
    }

    // 数据缓冲和批量更新
    bufferData(data) {
        this.buffer.push(data);
        
        if (this.buffer.length >= 10) { // 批量处理
            this.flushBuffer();
        }
    }

    flushBuffer() {
        if (this.buffer.length === 0) return;
        
        // 批量处理缓冲的数据
        this.buffer.forEach(data => {
            this.updateWithNewData(data);
        });
        
        this.buffer = [];
    }

    disconnect() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    destroy() {
        this.disconnect();
        super.destroy();
    }
}
```

## 📊 数据可视化平台

### 仪表板系统

```javascript
class Dashboard {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            layout: 'grid',
            responsive: true,
            autoRefresh: true,
            refreshInterval: 5000,
            ...config
        };
        
        this.charts = new Map();
        this.dataManager = new DataStreamManager();
        this.layout = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.createLayout();
        this.setupDataStreams();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    createLayout() {
        this.container.innerHTML = '';
        this.container.className = 'dashboard-container';
        
        // 创建网格布局
        this.layout = document.createElement('div');
        this.layout.className = 'dashboard-grid';
        this.container.appendChild(this.layout);
        
        // 添加CSS样式
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .dashboard-container {
                width: 100%;
                height: 100vh;
                padding: 20px;
                box-sizing: border-box;
                background: #f5f5f5;
            }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
                height: 100%;
            }
            
            .chart-panel {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .chart-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
            
            .chart-controls {
                display: flex;
                gap: 10px;
            }
            
            .chart-content {
                flex: 1;
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }

    addChart(chartConfig) {
        const panel = this.createChartPanel(chartConfig);
        this.layout.appendChild(panel);
        
        const chartContainer = panel.querySelector('.chart-content');
        const chart = this.createChart(chartConfig.type, chartContainer, chartConfig.options);
        
        this.charts.set(chartConfig.id, {
            chart,
            panel,
            config: chartConfig
        });
        
        return chart;
    }

    createChartPanel(config) {
        const panel = document.createElement('div');
        panel.className = 'chart-panel';
        panel.innerHTML = `
            <div class="chart-header">
                <h3 class="chart-title">${config.title}</h3>
                <div class="chart-controls">
                    <button class="btn-refresh" onclick="this.refreshChart('${config.id}')">刷新</button>
                    <button class="btn-settings">设置</button>
                </div>
            </div>
            <div class="chart-content"></div>
        `;
        
        return panel;
    }

    createChart(type, container, options) {
        const chartLibrary = new ChartLibrary();
        
        // 注册图表类型
        chartLibrary.registerChart('line', LineChart);
        chartLibrary.registerChart('bar', BarChart);
        chartLibrary.registerChart('pie', PieChart);
        chartLibrary.registerChart('realtime', RealTimeChart);
        
        return chartLibrary.createChart(type, container, options);
    }

    setupDataStreams() {
        // 创建示例数据流
        this.dataManager.createStream('sales', {
            maxSize: 100,
            updateInterval: 2000,
            generator: () => Math.random() * 1000 + 500
        });
        
        this.dataManager.createStream('traffic', {
            maxSize: 50,
            updateInterval: 1000,
            generator: () => Math.random() * 100
        });
        
        this.dataManager.start();
    }

    loadData(chartId, data) {
        const chartItem = this.charts.get(chartId);
        if (chartItem) {
            chartItem.chart.updateData(data);
        }
    }

    refreshChart(chartId) {
        const chartItem = this.charts.get(chartId);
        if (chartItem && chartItem.config.dataSource) {
            this.fetchData(chartItem.config.dataSource)
                .then(data => this.loadData(chartId, data));
        }
    }

    async fetchData(dataSource) {
        // 模拟数据获取
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{
                        label: 'Sales',
                        data: Array.from({length: 5}, () => Math.random() * 100)
                    }]
                });
            }, 1000);
        });
    }
}
```

### 使用示例

```javascript
// 创建图表库实例
const chartLib = new ChartLibrary();
chartLib.registerChart('line', LineChart);
chartLib.registerChart('bar', BarChart);
chartLib.registerChart('pie', PieChart);

// 创建折线图
const lineChart = chartLib.createChart('line', document.getElementById('line-chart'), {
    responsive: true,
    animation: true,
    curve: 'smooth',
    area: true
});

// 设置数据
lineChart.updateData({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55]
    }, {
        label: 'Profit',
        data: [28, 48, 40, 19, 86, 27]
    }]
});

// 创建实时图表
const realTimeChart = new RealTimeChart(document.getElementById('realtime-chart'));
const streamManager = new DataStreamManager();
streamManager.createStream('sensor', {
    generator: () => Math.sin(Date.now() / 1000) * 50 + 50
});
realTimeChart.connectToStream(streamManager, 'sensor');
streamManager.start();

// 创建仪表板
const dashboard = new Dashboard(document.getElementById('dashboard'));

// 添加图表到仪表板
dashboard.addChart({
    id: 'sales-chart',
    type: 'line',
    title: '销售趋势',
    options: {
        responsive: true,
        animation: true
    }
});

dashboard.addChart({
    id: 'category-chart',
    type: 'pie',
    title: '产品分类',
    options: {
        doughnut: true,
        showPercentages: true
    }
});
```

## 🎯 实践练习

### 练习1：交互式图表
创建一个支持缩放、平移和数据筛选的交互式折线图。

### 练习2：实时监控面板
构建一个实时数据监控面板，显示多个实时数据流。

### 练习3：数据分析工具
开发一个数据分析工具，支持数据导入、图表生成和导出功能。

## 🔧 性能优化技巧

1. **数据分页**：大数据集分页加载
2. **虚拟化**：只渲染可见区域的数据
3. **防抖动**：减少不必要的重绘
4. **Web Workers**：后台处理数据计算
5. **缓存策略**：合理缓存计算结果

Canvas数据可视化为我们提供了强大的数据展示能力。通过本章的学习，您应该能够构建专业级的图表库和数据可视化应用。

## 📚 扩展阅读

- [D3.js数据可视化](https://d3js.org/)
- [Chart.js图表库](https://www.chartjs.org/)
- [数据可视化设计指南](https://serialmentor.com/dataviz/)
- [Canvas性能优化](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) 