# Chrome DevTools Protocol (CDP)

Chrome DevTools Protocol（CDP）是一套允许工具对Chromium、Chrome和其他基于Blink的浏览器进行检测、检查、调试和性能分析的协议。Chrome DevTools团队维护这个协议及其API，许多现有项目都在使用它。

## 协议概述

CDP将浏览器功能分为多个域（Domain），如DOM、调试器（Debugger）、网络（Network）等。每个域定义了它支持的命令和生成的事件。命令和事件都是具有固定结构的序列化JSON对象。

## 协议版本

CDP提供以下几个版本：

1. **最新版本（tip-of-tree，tot）**：频繁变化，可能随时中断，但捕获了协议的全部功能。不保证向后兼容。
2. **v8-inspector协议（v8）**：启用Node.js应用程序的调试和性能分析。
3. **稳定版本1.3（1-3）**：在Chrome 64中标记的协议稳定版本，包含完整协议兼容性的一个较小子集。

## 协议结构

CDP协议基于WebSocket通信，使用JSON格式的消息进行交互。每个消息包含以下部分：

- **命令（Commands）**：从客户端发送到浏览器的请求，用于执行特定操作
- **事件（Events）**：从浏览器发送到客户端的通知，报告浏览器中发生的事件
- **响应（Responses）**：浏览器对命令的响应

## 主要域（Domains）

CDP协议包含多个功能域，每个域专注于浏览器的特定方面：

- **Accessibility**：辅助功能相关API
- **Animation**：动画相关API
- **Browser**：浏览器控制API
- **CSS**：CSS样式相关API
- **DOM**：DOM操作相关API
- **Debugger**：JavaScript调试API
- **Fetch**：网络请求拦截与修改API
- **Network**：网络监控与控制API
- **Page**：页面相关控制API
- **Performance**：性能监控API
- **Runtime**：JavaScript运行时API
- **Security**：安全相关API
- ...等更多域

## 使用CDP

### HTTP端点

启动Chrome时使用`--remote-debugging-port`参数，将在指定端口上暴露以下HTTP端点：

#### GET `/json/version`

返回浏览器版本元数据：

```json
{
    "Browser": "Chrome/72.0.3601.0",
    "Protocol-Version": "1.3",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3601.0 Safari/537.36",
    "V8-Version": "7.2.233",
    "WebKit-Version": "537.36 (@cfede9db1d154de0468cb0538479f34c0755a0f4)",
    "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/b0b8a4fb-bb17-4359-9533-a8d9f3908bd8"
}
```

#### GET `/json` 或 `/json/list`

返回所有可用WebSocket目标列表：

```json
[{
  "description": "",
  "devtoolsFrontendUrl": "/devtools/inspector.html?ws=localhost:9222/devtools/page/DAB7FB6187B554E10B0BD18821265734",
  "id": "DAB7FB6187B554E10B0BD18821265734",
  "title": "Yahoo",
  "type": "page",
  "url": "https://www.yahoo.com/",
  "webSocketDebuggerUrl": "ws://localhost:9222/devtools/page/DAB7FB6187B554E10B0BD18821265734"
}]
```

#### GET `/json/protocol/`

返回当前DevTools协议的完整JSON定义。

#### 其他端点

- **PUT `/json/new?{url}`**: 打开新标签页
- **GET `/json/activate/{targetId}`**: 将页面带到前台（激活标签页）
- **GET `/json/close/{targetId}`**: 关闭由`targetId`标识的目标页面
- **WebSocket `/devtools/page/{targetId}`**: 协议的WebSocket端点

### WebSocket连接

建立与CDP的通信首先需要连接到WebSocket端点，然后发送JSON格式的命令：

```javascript
// 示例：使用原生WebSocket连接CDP
const ws = new WebSocket('ws://localhost:9222/devtools/page/[target-id]');

ws.onopen = () => {
  // 启用页面事件
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.enable'
  }));
  
  // 导航到URL
  ws.send(JSON.stringify({
    id: 2,
    method: 'Page.navigate',
    params: { url: 'https://example.com' }
  }));
};

ws.onmessage = (message) => {
  const data = JSON.parse(message.data);
  console.log('收到消息:', data);
};
```

## 高级特性

### 多客户端支持

Chrome 63引入了多客户端支持，允许多个客户端同时连接到同一个目标。当断开连接时，传出客户端将收到一个`detached`事件，例如：
```json
{"method":"Inspector.detached","params":{"reason":"replaced_with_devtools"}}
```

### 通过Chrome扩展使用协议

Chrome提供了`chrome.debugger`扩展API，允许Chrome扩展与协议交互。这个API提供了更高级别的接口，其中命令域、名称和正文在`sendCommand`调用中显式提供。

### 监控协议

可以使用Protocol Monitor工具查看所有请求/响应和方法：

1. 点击DevTools右上角的齿轮图标，打开"设置"面板
2. 在左侧设置中选择"实验"
3. 启用"Protocol Monitor"，然后关闭并重新打开DevTools
4. 点击⋮菜单图标，选择"更多工具"，然后选择"Protocol monitor"

### 从控制台执行命令

也可以从DevTools控制台执行命令：

```javascript
let Main = await import('./devtools-frontend/front_end/entrypoints/main/main.js');
await Main.MainImpl.sendOverProtocol('Emulation.setDeviceMetricsOverride', {
  mobile: true,
  width: 412,
  height: 732,
  deviceScaleFactor: 2.625,
});
```

## 参考资源

- [官方CDP文档](https://chromedevtools.github.io/devtools-protocol/)
- [GitHub上的协议定义仓库](https://github.com/ChromeDevTools/devtools-protocol)
- [Chrome DevTools Protocol查看器](https://chromedevtools.github.io/devtools-protocol-viewer/)
- [CDP调试入门指南](https://developer.chrome.com/blog/getting-started-with-headless-chrome/) 