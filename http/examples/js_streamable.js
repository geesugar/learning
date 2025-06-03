/**
 * Streamable HTTP 示例 - JavaScript 实现
 * 
 * 这个示例展示了如何使用Node.js创建流式HTTP服务器和如何使用Fetch API接收流数据。
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

// 流式响应端点 - 纯文本响应
app.get('/stream-text', (req, res) => {
  // 设置响应头
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 发送头部，开始流式响应
  res.write('开始流式响应...\n');
  
  // 模拟延迟数据流，每秒发送一行
  let count = 1;
  const intervalId = setInterval(() => {
    // 发送数据
    res.write(`这是第 ${count} 行数据 - ${new Date().toISOString()}\n`);
    
    // 当发送10行后结束响应
    if (count++ >= 10) {
      res.write('流式响应完成。');
      res.end();
      clearInterval(intervalId);
    }
  }, 1000);
  
  // 处理客户端断开连接
  req.on('close', () => {
    clearInterval(intervalId);
    console.log('客户端断开连接');
  });
});

// 流式响应端点 - JSON响应
app.get('/stream-json', (req, res) => {
  // 设置响应头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 模拟AI文本生成或大数据流
  const generateData = async () => {
    // 发送JSON对象的开始部分
    res.write('{"results":[');
    
    // 逐步发送10个JSON对象
    for (let i = 1; i <= 10; i++) {
      // 添加逗号分隔（除了第一个元素）
      if (i > 1) {
        res.write(',');
      }
      
      // 创建数据对象
      const data = {
        id: i,
        timestamp: new Date().toISOString(),
        value: Math.random() * 100,
        text: `这是第${i}个生成的结果`,
        complete: i === 10
      };
      
      // 发送JSON对象
      res.write(JSON.stringify(data));
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 完成JSON对象
    res.write('],"status":"complete"}');
    res.end();
  };
  
  // 开始生成数据
  generateData().catch(err => {
    console.error('流式响应错误:', err);
    res.status(500).end();
  });
});

// 流式响应端点 - 模拟AI大型语言模型的流式输出
app.get('/stream-ai', (req, res) => {
  // 设置响应头
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // AI响应内容（模拟）
  const aiResponse = 
    "Streamable HTTP是一种允许服务器以流的形式发送HTTP响应的技术，" +
    "而不是等待整个响应准备好后一次性发送。这种方式有几个重要优势：\n\n" +
    "1. 减少感知延迟：客户端可以在完整响应到达之前开始处理和显示数据\n" +
    "2. 适用于大型响应：无需等待全部生成就可以开始传输\n" +
    "3. 支持无限长度响应：理论上可以无限期地发送数据\n" +
    "4. 适用于生成式AI：非常适合大型语言模型的实时文本生成\n\n" +
    "在技术实现上，Streamable HTTP利用了HTTP/1.1的分块传输编码，" +
    "或HTTP/2和HTTP/3的流特性。这使得服务器可以逐步生成和发送数据，" +
    "而客户端则可以增量处理这些数据。\n\n" +
    "与Server-Sent Events (SSE)相比，Streamable HTTP更通用，" +
    "可以使用任何内容类型，而不仅限于text/event-stream格式。" +
    "这使得它适用于更广泛的应用场景。";
  
  // 模拟AI流式生成文本（按字符发送）
  const streamAiResponse = async () => {
    let i = 0;
    
    // 逐字符发送响应
    while (i < aiResponse.length) {
      // 每次发送1-3个字符，模拟打字效果
      const chunkSize = Math.floor(Math.random() * 3) + 1;
      const end = Math.min(i + chunkSize, aiResponse.length);
      const chunk = aiResponse.substring(i, end);
      
      res.write(chunk);
      i = end;
      
      // 随机延迟（50-150毫秒），模拟AI思考和生成
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 100) + 50));
    }
    
    res.end();
  };
  
  // 开始流式响应
  streamAiResponse().catch(err => {
    console.error('AI流式响应错误:', err);
    res.status(500).end();
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Streamable HTTP服务器启动在 http://localhost:${PORT}`);
  console.log(`纯文本流: http://localhost:${PORT}/stream-text`);
  console.log(`JSON流: http://localhost:${PORT}/stream-json`);
  console.log(`AI文本生成模拟: http://localhost:${PORT}/stream-ai`);
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
  <title>Streamable HTTP Demo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background-color: #f5f5f5; padding: 10px; white-space: pre-wrap; height: 300px; overflow-y: auto; }
    .controls { margin: 20px 0; }
    button { margin-right: 10px; padding: 8px 16px; }
    .progress { margin-top: 5px; height: 5px; background-color: #e6f7ff; width: 0; transition: width 0.3s; }
  </style>
</head>
<body>
  <h1>Streamable HTTP 示例</h1>
  <p>这个示例展示了如何使用Fetch API接收HTTP流响应。</p>
  
  <div class="controls">
    <button id="streamText">接收文本流</button>
    <button id="streamJson">接收JSON流</button>
    <button id="streamAi">模拟AI生成</button>
    <button id="stopStream" disabled>停止流</button>
  </div>
  
  <div class="progress" id="progress"></div>
  
  <h2>流响应内容:</h2>
  <pre id="output"></pre>
  
  <script>
    // DOM元素
    const outputElement = document.getElementById('output');
    const progressElement = document.getElementById('progress');
    const streamTextButton = document.getElementById('streamText');
    const streamJsonButton = document.getElementById('streamJson');
    const streamAiButton = document.getElementById('streamAi');
    const stopStreamButton = document.getElementById('stopStream');
    
    // 当前活动的流控制器
    let currentController = null;
    
    // 清空输出
    function clearOutput() {
      outputElement.textContent = '';
      progressElement.style.width = '0%';
    }
    
    // 追加内容到输出
    function appendOutput(text) {
      outputElement.textContent += text;
      // 自动滚动到底部
      outputElement.scrollTop = outputElement.scrollHeight;
    }
    
    // 更新进度条
    function updateProgress(percent) {
      progressElement.style.width = `${percent}%`;
    }
    
    // 启用/禁用按钮
    function setButtonsEnabled(enabled) {
      streamTextButton.disabled = !enabled;
      streamJsonButton.disabled = !enabled;
      streamAiButton.disabled = !enabled;
      stopStreamButton.disabled = enabled;
    }
    
    // 接收和处理文本流
    async function fetchTextStream() {
      clearOutput();
      setButtonsEnabled(false);
      
      try {
        // 创建AbortController以便能够取消请求
        currentController = new AbortController();
        const signal = currentController.signal;
        
        // 发起流式请求
        const response = await fetch('/stream-text', { signal });
        
        // 获取ReadableStream
        const reader = response.body.getReader();
        
        // 读取流
        let receivedLength = 0;
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // 解码并显示收到的数据块
          const text = decoder.decode(value, { stream: true });
          appendOutput(text);
          
          // 更新接收长度（用于进度模拟）
          receivedLength += value.length;
          updateProgress(Math.min(receivedLength / 1000 * 10, 100));
        }
        
        updateProgress(100);
        console.log('流接收完成');
      } catch (err) {
        if (err.name === 'AbortError') {
          appendOutput('\n\n[用户取消了流]');
        } else {
          console.error('接收流错误:', err);
          appendOutput(`\n\n[错误] ${err.message}`);
        }
      } finally {
        currentController = null;
        setButtonsEnabled(true);
      }
    }
    
    // 接收和处理JSON流
    async function fetchJsonStream() {
      clearOutput();
      setButtonsEnabled(false);
      appendOutput('接收JSON流...\n');
      
      try {
        // 创建AbortController
        currentController = new AbortController();
        const signal = currentController.signal;
        
        // 发起流式请求
        const response = await fetch('/stream-json', { signal });
        
        // 获取ReadableStream
        const reader = response.body.getReader();
        
        // 读取流
        let receivedChunks = [];
        let receivedLength = 0;
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // 保存接收的数据块
          receivedChunks.push(value);
          receivedLength += value.length;
          
          // 显示原始接收数据
          const chunk = decoder.decode(value, { stream: true });
          appendOutput(`接收分块: ${chunk}\n`);
          
          // 更新进度
          updateProgress(Math.min(receivedLength / 2000 * 100, 99));
        }
        
        // 合并所有数据块并解析JSON
        const completeData = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of receivedChunks) {
          completeData.set(chunk, position);
          position += chunk.length;
        }
        
        const jsonData = JSON.parse(decoder.decode(completeData));
        
        // 显示解析后的JSON
        appendOutput('\n完整JSON解析结果:\n');
        appendOutput(JSON.stringify(jsonData, null, 2));
        
        updateProgress(100);
      } catch (err) {
        if (err.name === 'AbortError') {
          appendOutput('\n\n[用户取消了流]');
        } else {
          console.error('接收JSON流错误:', err);
          appendOutput(`\n\n[错误] ${err.message}`);
        }
      } finally {
        currentController = null;
        setButtonsEnabled(true);
      }
    }
    
    // 接收和处理AI生成模拟流
    async function fetchAiStream() {
      clearOutput();
      setButtonsEnabled(false);
      
      try {
        // 创建AbortController
        currentController = new AbortController();
        const signal = currentController.signal;
        
        // 发起流式请求
        const response = await fetch('/stream-ai', { signal });
        
        // 获取ReadableStream
        const reader = response.body.getReader();
        
        // 读取流
        let receivedLength = 0;
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // 解码并显示收到的数据块
          const text = decoder.decode(value, { stream: true });
          appendOutput(text);
          
          // 更新接收长度
          receivedLength += value.length;
          updateProgress(Math.min(receivedLength / 500 * 100, 100));
        }
        
        updateProgress(100);
      } catch (err) {
        if (err.name === 'AbortError') {
          appendOutput('\n\n[用户取消了流]');
        } else {
          console.error('接收AI流错误:', err);
          appendOutput(`\n\n[错误] ${err.message}`);
        }
      } finally {
        currentController = null;
        setButtonsEnabled(true);
      }
    }
    
    // 停止当前流
    function stopStream() {
      if (currentController) {
        currentController.abort();
        console.log('已中止流接收');
      }
    }
    
    // 绑定按钮事件
    streamTextButton.addEventListener('click', fetchTextStream);
    streamJsonButton.addEventListener('click', fetchJsonStream);
    streamAiButton.addEventListener('click', fetchAiStream);
    stopStreamButton.addEventListener('click', stopStream);
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
 * 5. 点击相应按钮测试不同类型的流式响应
 */ 