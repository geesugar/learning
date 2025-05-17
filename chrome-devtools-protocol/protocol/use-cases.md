# Chrome DevTools Protocol 主要用例与应用场景

Chrome DevTools Protocol (CDP)提供了丰富的功能，可应用于多种实际场景。本文档介绍一些常见的用例和实际应用。

## 自动化测试

### 端到端测试

CDP可用于创建强大的端到端测试框架：

```javascript
// 使用Playwright进行端到端测试示例
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 导航到应用程序
  await page.goto('https://your-app.com');
  
  // 填写登录表单
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password');
  await page.click('#login-button');
  
  // 通过CDP监控网络请求
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  client.on('Network.responseReceived', event => {
    if (event.response.url.includes('/api/login')) {
      console.log('登录API响应状态:', event.response.status);
    }
  });
  
  // 验证登录成功
  await page.waitForSelector('.dashboard');
  console.log('测试通过：用户登录成功');
  
  await browser.close();
})();
```

### 性能测试

CDP可以精确捕获性能指标，对应用进行性能测试：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 启用性能API
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');
  
  // 导航到目标页面
  await page.goto('https://example.com');
  
  // 收集性能指标
  const performanceMetrics = await client.send('Performance.getMetrics');
  const timing = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  
  // 计算关键性能指标
  const navigationStart = timing.navigationStart;
  const firstPaint = timing.responseStart - navigationStart;
  const domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
  const fullLoad = timing.loadEventEnd - navigationStart;
  
  console.log('首次渲染时间:', firstPaint, 'ms');
  console.log('DOM内容加载时间:', domContentLoaded, 'ms');
  console.log('页面完全加载时间:', fullLoad, 'ms');
  
  // 获取详细性能指标
  console.log('详细性能指标:', performanceMetrics.metrics);
  
  await browser.close();
})();
```

## 网络监控与修改

### 请求拦截与模拟API响应

CDP可以拦截网络请求并返回模拟的响应，这对于测试不同API场景非常有用：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 获取CDP会话
  const client = await page.context().newCDPSession(page);
  
  // 启用Fetch拦截
  await client.send('Fetch.enable', {
    patterns: [
      {
        urlPattern: '**/api/users*',
        requestStage: 'Response'
      }
    ]
  });
  
  // 监听请求
  client.on('Fetch.requestPaused', async (event) => {
    const { requestId, request } = event;
    
    if (request.url.includes('/api/users')) {
      // 创建模拟响应
      const mockResponse = {
        users: [
          { id: 1, name: 'Mock User 1' },
          { id: 2, name: 'Mock User 2' }
        ]
      };
      
      // 返回模拟响应
      await client.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 200,
        responseHeaders: [
          { name: 'Content-Type', value: 'application/json' }
        ],
        body: Buffer.from(JSON.stringify(mockResponse)).toString('base64')
      });
      
      console.log('已拦截API请求并返回模拟数据');
    } else {
      // 继续其他请求
      await client.send('Fetch.continueRequest', { requestId });
    }
  });
  
  // 导航到应用
  await page.goto('https://your-app.com');
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
```

### 网络条件模拟

CDP可以模拟各种网络条件，测试应用在不同网络环境下的表现：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 模拟3G网络
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 200,  // 额外延迟 (ms)
    downloadThroughput: 750 * 1024 / 8,  // 最大下载速度 (bytes/s)
    uploadThroughput: 250 * 1024 / 8  // 最大上传速度 (bytes/s)
  });
  
  console.log('已启用3G网络模拟');
  
  // 导航到目标页面
  console.log('开始加载页面...');
  const startTime = Date.now();
  await page.goto('https://example.com');
  console.log('页面加载完成，耗时:', Date.now() - startTime, 'ms');
  
  await browser.close();
})();
```

## 性能分析

### JavaScript CPU分析

使用CDP可以执行JavaScript CPU分析，找出性能瓶颈：

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 导航到目标页面
  await page.goto('https://example.com');
  
  // 开始CPU分析
  await client.send('Profiler.enable');
  await client.send('Profiler.start');
  
  // 执行一些操作
  await page.click('#heavy-operation-button');
  await page.waitForTimeout(5000);  // 等待操作完成
  
  // 停止分析并获取结果
  const {profile} = await client.send('Profiler.stop');
  
  // 保存分析结果
  fs.writeFileSync('cpu-profile.cpuprofile', JSON.stringify(profile));
  console.log('CPU分析已保存到 cpu-profile.cpuprofile');
  
  // 可以使用Chrome DevTools加载和分析此文件
  await browser.close();
})();
```

### 内存泄漏分析

CDP可以帮助检测和分析内存泄漏：

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 启用堆分析器
  await client.send('HeapProfiler.enable');
  
  // 导航到目标页面
  await page.goto('https://example.com');
  
  // 执行可能导致内存泄漏的操作
  for (let i = 0; i < 10; i++) {
    await page.click('#add-data-button');
    await page.waitForTimeout(1000);
  }
  
  // 强制垃圾回收
  await client.send('HeapProfiler.collectGarbage');
  
  // 获取堆快照
  const { HeapProfiler } = client;
  
  console.log('正在获取堆快照...');
  let heapSnapshot = '';
  
  HeapProfiler.on('addHeapSnapshotChunk', ({ chunk }) => {
    heapSnapshot += chunk;
  });
  
  await HeapProfiler.takeHeapSnapshot({ reportProgress: false });
  
  // 保存堆快照
  fs.writeFileSync('heap-snapshot.heapsnapshot', heapSnapshot);
  console.log('堆快照已保存到 heap-snapshot.heapsnapshot');
  
  await browser.close();
})();
```

## 设备模拟

### 移动设备模拟

CDP可以精确模拟各种移动设备的特性：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 模拟iPhone 12
  await client.send('Emulation.setDeviceMetricsOverride', {
    mobile: true,
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    screenOrientation: { angle: 0, type: 'portraitPrimary' }
  });
  
  // 设置用户代理
  await client.send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
  });
  
  // 模拟触摸事件
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    configuration: 'mobile'
  });
  
  // 导航到目标页面
  await page.goto('https://example.com');
  
  // 截图
  await page.screenshot({ path: 'iphone12-simulation.png' });
  console.log('已保存模拟iPhone 12的截图');
  
  await browser.close();
})();
```

### 地理位置模拟

模拟不同地理位置，测试基于位置的功能：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 获取CDP会话
  const client = await context.newCDPSession(page);
  
  // 模拟位于纽约的地理位置
  await client.send('Emulation.setGeolocationOverride', {
    latitude: 40.7128,   // 纽约纬度
    longitude: -74.0060, // 纽约经度
    accuracy: 100        // 精度(米)
  });
  
  // 导航到使用地理位置的站点
  await page.goto('https://maps.google.com');
  
  // 等待加载
  await page.waitForTimeout(5000);
  
  // 截图
  await page.screenshot({ path: 'geolocation-nyc.png' });
  console.log('已保存带有模拟位置的截图');
  
  await browser.close();
})();
```

## 安全测试

### 证书错误测试

测试应用程序对证书错误的处理：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: false  // 不忽略HTTPS错误
  });
  
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 监听安全事件
  client.on('Security.certificateError', async ({ eventId }) => {
    console.log('检测到证书错误');
    
    // 可以选择继续或取消请求
    // 继续:
    await client.send('Security.handleCertificateError', {
      eventId,
      action: 'continue'  // 或 'cancel' 来模拟拒绝证书
    });
  });
  
  // 启用安全事件
  await client.send('Security.enable');
  
  // 导航到有证书问题的站点
  try {
    await page.goto('https://self-signed.badssl.com');
    console.log('导航成功完成');
  } catch (error) {
    console.error('导航失败:', error);
  }
  
  await browser.close();
})();
```

### 混合内容测试

测试网站对HTTP和HTTPS混合内容的处理：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 获取CDP会话
  const client = await page.context().newCDPSession(page);
  
  // 启用安全监控
  await client.send('Security.enable');
  
  // 监听混合内容警告
  client.on('Security.insecureContentDetected', ({ insecureContentType, url }) => {
    console.log(`检测到混合内容: ${insecureContentType} at ${url}`);
  });
  
  // 导航到目标页面
  await page.goto('https://mixed-content-website.com');
  
  // 等待一段时间以捕获所有事件
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
```

## 调试与分析

### JavaScript异常捕获

捕获和分析JavaScript异常：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 启用运行时
  await client.send('Runtime.enable');
  
  // 监听JavaScript异常
  client.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
    console.log('捕获到JavaScript异常:');
    console.log('  消息:', exceptionDetails.exception?.description || exceptionDetails.text);
    console.log('  堆栈:', exceptionDetails.stackTrace);
  });
  
  // 导航到目标页面
  await page.goto('https://your-app.com');
  
  // 触发JavaScript错误
  await page.evaluate(() => {
    // 故意制造错误
    const nonExistingObject = null;
    nonExistingObject.someProperty = 'this will throw';
  }).catch(() => {
    // 忽略Promise拒绝，异常将通过CDP事件处理
  });
  
  await page.waitForTimeout(1000);
  await browser.close();
})();
```

### DOM变化监控

监控DOM变化，适用于调试复杂的UI问题：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 获取CDP会话
  const client = await page.context().newCDPSession(page);
  
  // 启用DOM域
  await client.send('DOM.enable');
  
  // 监听DOM变化
  client.on('DOM.childNodeInserted', ({ parentNodeId, previousNodeId, node }) => {
    console.log('DOM节点插入:', node.nodeName);
    if (node.attributes) {
      console.log('  属性:', node.attributes);
    }
  });
  
  client.on('DOM.attributeModified', ({ nodeId, name, value }) => {
    console.log(`DOM属性修改: nodeId=${nodeId}, ${name}="${value}"`);
  });
  
  // 导航到目标页面
  await page.goto('https://your-app.com');
  
  // 触发DOM变化
  await page.click('#toggle-button');
  
  // 等待一段时间以捕获事件
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
```

## 自动化操作

### 页面导航与交互

使用CDP可以自动化各种页面交互：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 启用页面事件
  await client.send('Page.enable');
  
  // 监听页面导航
  client.on('Page.frameNavigated', ({ frame }) => {
    if (frame.parentId) return;  // 忽略iframe导航
    console.log('页面导航到:', frame.url);
  });
  
  // 导航到目标页面
  await page.goto('https://example.com');
  
  // 使用Input域模拟用户输入
  await client.send('Input.insertText', {
    text: 'Hello from CDP'
  });
  
  // 模拟鼠标点击
  const { x, y } = await page.evaluate(() => {
    const button = document.querySelector('#submit-button');
    const { left, top, width, height } = button.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
  });
  
  await client.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x, y,
    button: 'left',
    clickCount: 1
  });
  
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x, y,
    button: 'left',
    clickCount: 1
  });
  
  // 等待导航完成
  await page.waitForNavigation();
  
  await browser.close();
})();
```

### 文件下载自动化

自动化文件下载过程：

```javascript
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  // 设置下载路径
  const downloadPath = path.resolve('./downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 设置下载行为
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });
  
  // 导航到下载页面
  await page.goto('https://example.com/downloads');
  
  // 点击下载按钮
  await page.click('#download-button');
  
  // 等待下载完成 (简单的实现，实际应用中应使用更强大的检测机制)
  console.log('等待下载完成...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 检查下载的文件
  const files = fs.readdirSync(downloadPath);
  console.log('下载的文件:', files);
  
  await browser.close();
})();
```

## 截图与PDF生成

### 全页面截图

生成高质量的全页面截图：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 设置更高的截图质量
  await client.send('Page.enable');
  
  // 导航到目标页面
  await page.goto('https://example.com');
  
  // 获取页面的完整高度
  const height = await page.evaluate(() => {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  });
  
  // 设置视口大小以覆盖整个页面
  await client.send('Emulation.setDeviceMetricsOverride', {
    mobile: false,
    width: 1920,
    height: height,
    deviceScaleFactor: 1
  });
  
  // 使用CDP截图
  const { data } = await client.send('Page.captureScreenshot', {
    format: 'png',
    quality: 100,
    fromSurface: true, // 使用表面而不是DIP
    captureBeyondViewport: true // 捕获超出视口的内容
  });
  
  // 保存截图
  const fs = require('fs');
  fs.writeFileSync('full-page-screenshot.png', Buffer.from(data, 'base64'));
  console.log('已保存全页面截图');
  
  await browser.close();
})();
```

### 生成PDF

将网页转换为高质量PDF：

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 设置适合打印的页面设置
  await client.send('Emulation.setDeviceMetricsOverride', {
    mobile: false,
    width: 1200,
    height: 1697, // A4尺寸
    deviceScaleFactor: 1
  });
  
  // 导航到目标页面
  await page.goto('https://example.com', { waitUntil: 'networkidle2' });
  
  // 使用CDP生成PDF
  const { data } = await client.send('Page.printToPDF', {
    landscape: false,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 8px; width: 100%; text-align: center;">示例页面</div>',
    footerTemplate: '<div style="font-size: 8px; width: 100%; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    printBackground: true,
    scale: 1,
    paperWidth: 8.27, // A4宽度(英寸)
    paperHeight: 11.69, // A4高度(英寸)
    marginTop: 0.4,
    marginBottom: 0.4,
    marginLeft: 0.4,
    marginRight: 0.4,
    preferCSSPageSize: true
  });
  
  // 保存PDF
  fs.writeFileSync('webpage.pdf', Buffer.from(data, 'base64'));
  console.log('PDF已保存到 webpage.pdf');
  
  await browser.close();
})();
```

## 实际应用场景

### 爬虫与数据提取

使用CDP构建强大的网络爬虫，处理JavaScript渲染的内容：

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 优化性能 - 屏蔽不必要的资源
  await client.send('Network.enable');
  await client.send('Network.setBlockedURLs', {
    urls: [
      '*.png', '*.jpg', '*.jpeg', '*.gif', 
      '*.css', '*.woff', '*.woff2', '*.ttf',
      'googlesyndication.com', 'doubleclick.net'
    ]
  });
  
  // 设置用户代理
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
  
  // 导航到目标页面
  await page.goto('https://example.com/products', {
    waitUntil: 'networkidle2'
  });
  
  // 提取数据
  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.product-item')).map(product => {
      return {
        title: product.querySelector('.title')?.textContent.trim(),
        price: product.querySelector('.price')?.textContent.trim(),
        description: product.querySelector('.description')?.textContent.trim(),
        url: product.querySelector('a')?.href
      };
    });
  });
  
  console.log(`提取了 ${products.length} 个产品`);
  
  // 保存数据
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  
  await browser.close();
})();
```

### 网站监控服务

创建网站监控服务，检测可用性和性能：

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

// 简单的监控函数
async function monitorWebsite(url) {
  const startTime = Date.now();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  // 收集指标
  let metrics = {
    url,
    timestamp: new Date().toISOString(),
    available: false,
    statusCode: null,
    loadTime: null,
    resources: { total: 0, success: 0, failed: 0 },
    errors: []
  };
  
  // 监控网络
  await client.send('Network.enable');
  
  // 捕获响应
  client.on('Network.responseReceived', event => {
    metrics.resources.total++;
    if (event.response.status >= 200 && event.response.status < 400) {
      metrics.resources.success++;
    } else {
      metrics.resources.failed++;
    }
    
    // 捕获主页响应
    if (event.response.url === url) {
      metrics.statusCode = event.response.status;
      metrics.available = metrics.statusCode >= 200 && metrics.statusCode < 400;
    }
  });
  
  // 捕获错误
  client.on('Network.loadingFailed', event => {
    metrics.resources.failed++;
    metrics.errors.push({
      url: event.request.url,
      errorText: event.errorText,
      canceled: event.canceled
    });
  });
  
  // 捕获控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      metrics.errors.push({
        type: 'console',
        text: msg.text()
      });
    }
  });
  
  try {
    // 导航到目标页面
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 获取性能指标
    const performanceMetrics = await client.send('Performance.getMetrics');
    const timingObj = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    metrics.loadTime = timingObj.loadEventEnd - timingObj.navigationStart;
    metrics.performanceMetrics = performanceMetrics.metrics;
    
    // 截图 (可选)
    await page.screenshot({ path: `monitor-${new Date().toISOString().replace(/:/g, '-')}.png` });
  } catch (error) {
    metrics.errors.push({
      type: 'navigation',
      text: error.message
    });
    metrics.available = false;
  }
  
  metrics.duration = Date.now() - startTime;
  
  await browser.close();
  return metrics;
}

// 使用示例
(async () => {
  const sites = [
    'https://example.com',
    'https://google.com',
    'https://non-existing-site.example'
  ];
  
  for (const site of sites) {
    console.log(`监控 ${site}...`);
    const result = await monitorWebsite(site);
    console.log(JSON.stringify(result, null, 2));
    
    // 在实际应用中，可以将结果保存到数据库或发送警报
  }
})();
```

### 自动更新检查服务

创建自动更新检查服务，监控网站变化：

```javascript
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const fs = require('fs');

// 生成页面内容的哈希值
function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// 从文件加载之前的哈希值
function loadPreviousHash(url) {
  const filename = `hash-${encodeURIComponent(url)}.txt`;
  if (fs.existsSync(filename)) {
    return fs.readFileSync(filename, 'utf8');
  }
  return null;
}

// 保存新的哈希值
function saveNewHash(url, hash) {
  const filename = `hash-${encodeURIComponent(url)}.txt`;
  fs.writeFileSync(filename, hash);
}

// 检查网站更新
async function checkForUpdates(url, selector = 'body') {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    // 导航到目标页面
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // 获取选定元素的HTML内容
    const content = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? element.innerHTML : '';
    }, selector);
    
    // 生成当前内容的哈希值
    const currentHash = generateHash(content);
    
    // 获取之前的哈希值
    const previousHash = loadPreviousHash(url);
    
    let result;
    if (!previousHash) {
      // 首次检查
      result = {
        url,
        status: 'initial',
        message: '首次检查，已保存初始状态',
        timestamp: new Date().toISOString()
      };
    } else if (previousHash !== currentHash) {
      // 检测到更新
      result = {
        url,
        status: 'updated',
        message: '检测到内容变化',
        previousHash,
        currentHash,
        timestamp: new Date().toISOString()
      };
      
      // 可选：保存变化前后的截图
      await page.screenshot({ path: `update-${encodeURIComponent(url)}-${Date.now()}.png` });
    } else {
      // 无变化
      result = {
        url,
        status: 'unchanged',
        message: '无变化',
        hash: currentHash,
        timestamp: new Date().toISOString()
      };
    }
    
    // 保存新的哈希值
    saveNewHash(url, currentHash);
    
    return result;
  } catch (error) {
    return {
      url,
      status: 'error',
      message: `检查失败: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

// 使用示例
(async () => {
  const sites = [
    { url: 'https://example.com', selector: 'main' },
    { url: 'https://news.example.com', selector: '.articles' }
  ];
  
  for (const site of sites) {
    console.log(`检查 ${site.url} 的更新...`);
    const result = await checkForUpdates(site.url, site.selector);
    console.log(result);
    
    // 在实际应用中，可以发送电子邮件或其他通知
    if (result.status === 'updated') {
      console.log(`网站 ${site.url} 有更新!`);
      // sendNotification(result);
    }
  }
})();
```

以上示例展示了CDP在实际应用中的强大功能。通过这些用例，开发者可以创建丰富的工具和自动化流程，大大提高开发和测试效率。 