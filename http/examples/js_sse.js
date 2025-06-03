/**
 * Server-Sent Events (SSE) 示例 - JavaScript 实现
 * 
 * 这个示例展示了如何使用Node.js创建SSE服务器和如何使用浏览器JavaScript接收事件。
 */

/**
 * 服务器端实现 (Node.js)
 * 依赖: Express.js
 * 
 * 安装依赖:
 * npm install express
 */

// 服务器代码
const express = require('express');
const app = express();
const PORT = 3000;

// 提供静态文件
app.use(express.static('public'));

// SSE端点
app.get('/events', (req, res) => {
  // 设置SSE必要的头信息
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // 允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 设置客户端重连时间 (毫秒)
  res.write(`retry: 10000\n\n`);
  
  // 发送初始消息
  sendEvent(res, 'connected', 'Connection established');
  
  // 每2秒发送一个时间更新
  const intervalId = setInterval(() => {
    const data = {
      time: new Date().toISOString(),
      value: Math.random().toFixed(2)
    };
    
    // 发送不同类型的事件
    if (Math.random() > 0.5) {
      sendEvent(res, 'time-update', data);
    } else {
      sendEvent(res, 'random-value', data);
    }
  }, 2000);
  
  // 当客户端断开连接时
  req.on('close', () => {
    clearInterval(intervalId);
    console.log('Client disconnected');
  });
});

// 辅助函数：发送格式化的SSE事件
function sendEvent(res, eventName, data) {
  res.write(`event: ${eventName}\n`);  // 事件名称
  res.write(`id: ${Date.now()}\n`);    // 消息ID
  
  // 如果数据是对象，转换为JSON
  const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
  
  // 支持多行数据
  const dataLines = dataString.split(/\r?\n/);
  for (const line of dataLines) {
    res.write(`data: ${line}\n`);
  }
  
  // 消息以空行结束
  res.write('\n');
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`SSE服务器启动在 http://localhost:${PORT}`);
  console.log(`查看SSE事件流: http://localhost:${PORT}/events`);
  console.log(`打开演示页面: http://localhost:${PORT}`);
});

/**
 * 客户端实现 (浏览器)
 * 
 * 以下代码在浏览器中运行。将其保存到 public/index.html 文件中。
 */

/*
<!DOCTYPE html>
<html>
<head>
  <title>SSE Demo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    #events { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
    .event { margin-bottom: 5px; padding: 5px; border-bottom: 1px solid #eee; }
    .time-update { background-color: #e6f7ff; }
    .random-value { background-color: #f6ffed; }
    .connected { background-color: #d9d9d9; }
  </style>
</head>
<body>
  <h1>Server-Sent Events 示例</h1>
  <p>这个示例展示了如何使用SSE接收服务器发送的实时事件。</p>
  
  <h2>收到的事件:</h2>
  <div id="events"></div>
  
  <button id="connect">连接到事件流</button>
  <button id="disconnect" disabled>断开连接</button>
  
  <script>
    // 事件容器
    const eventsContainer = document.getElementById('events');
    const connectButton = document.getElementById('connect');
    const disconnectButton = document.getElementById('disconnect');
    
    let eventSource = null;
    
    // 添加事件到容器
    function addEvent(type, data) {
      const eventElement = document.createElement('div');
      eventElement.className = `event ${type}`;
      
      let content;
      try {
        // 尝试解析JSON数据
        const parsedData = JSON.parse(data);
        content = `<strong>${type}</strong>: Time: ${parsedData.time}, Value: ${parsedData.value}`;
      } catch (e) {
        // 普通文本数据
        content = `<strong>${type}</strong>: ${data}`;
      }
      
      eventElement.innerHTML = content;
      eventsContainer.prepend(eventElement);
    }
    
    // 连接到事件流
    function connectToEventStream() {
      // 创建新的 EventSource 连接
      eventSource = new EventSource('/events');
      
      // 连接建立时
      eventSource.onopen = function() {
        console.log('EventSource连接已打开');
        connectButton.disabled = true;
        disconnectButton.disabled = false;
      };
      
      // 通用消息处理
      eventSource.onmessage = function(event) {
        console.log('收到消息:', event.data);
        addEvent('message', event.data);
      };
      
      // 特定事件类型处理
      eventSource.addEventListener('time-update', function(event) {
        console.log('收到时间更新:', event.data);
        addEvent('time-update', event.data);
      });
      
      eventSource.addEventListener('random-value', function(event) {
        console.log('收到随机值:', event.data);
        addEvent('random-value', event.data);
      });
      
      eventSource.addEventListener('connected', function(event) {
        console.log('连接事件:', event.data);
        addEvent('connected', event.data);
      });
      
      // 错误处理
      eventSource.onerror = function(error) {
        console.error('EventSource错误:', error);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('连接已关闭');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('尝试重新连接...');
          addEvent('system', 'Connection lost. Trying to reconnect...');
        }
      };
    }
    
    // 断开连接
    function disconnectFromEventStream() {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        console.log('手动断开连接');
        addEvent('system', 'Manually disconnected');
        
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      }
    }
    
    // 绑定按钮事件
    connectButton.addEventListener('click', connectToEventStream);
    disconnectButton.addEventListener('click', disconnectFromEventStream);
  </script>
</body>
</html>
*/

/**
 * 启动和测试说明:
 * 
 * 1. 创建项目结构:
 *    - 创建server.js (包含上述服务器代码)
 *    - 创建public/index.html (包含上述客户端代码)
 * 
 * 2. 安装依赖:
 *    npm install express
 * 
 * 3. 启动服务器:
 *    node server.js
 * 
 * 4. 在浏览器中打开:
 *    http://localhost:3000
 * 
 * 5. 点击"连接到事件流"按钮开始接收事件
 */ 