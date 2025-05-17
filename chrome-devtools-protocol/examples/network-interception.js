// 安装依赖: npm install playwright

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('启动浏览器...');
  // 启动浏览器，使用非headless模式以便观察效果
  const browser = await chromium.launch({
    headless: false,  // 非无头模式，可以看到浏览器窗口
    args: ['--window-size=1200,800'] // 设置窗口大小
  });
  
  // 创建新页面
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // 获取CDP会话 - Playwright允许直接访问CDP
  const client = await page.context().newCDPSession(page);
  
  console.log('设置网络拦截...');
  
  // 使用一个变量跟踪是否已经修改了页面
  let pageModified = false;
  
  // 定义拦截目标 - 我们只拦截特定网站，避免拦截所有请求
  const targetUrl = 'http://google.com.hk/';
  
  // 启用网络域功能进行监控
  await client.send('Network.enable');
  
  // 添加请求和响应监控，帮助调试
  client.on('Network.requestWillBeSent', event => {
    console.log(`📤 发送请求: ${event.request.url} (类型: ${event.type || '未知'})`);
  });
  
  // 启用Fetch域功能 - 使用更现代的API代替已废弃的Network.setRequestInterception
  await client.send('Fetch.enable', {
    patterns: [
      {
        urlPattern: '*',  // 拦截所有请求以便捕获目标
        resourceType: 'Document',  // 拦截HTML文档
        requestStage: 'Response'   // 拦截响应阶段
      }
    ]
  });
  
  // 记录拦截状态
  client.on('Network.responseReceived', event => {
    console.log(`📥 接收到响应: ${event.response.url} (${event.response.status})`);
  });
  
  // 处理拦截的响应
  client.on('Fetch.requestPaused', async (event) => {
    const { requestId, request, responseStatusCode, responseHeaders } = event;
    console.log(`🔍 拦截到请求: ${request.url} (类型: ${request.resourceType || '未知'}, 阶段: ${responseStatusCode ? '响应' : '请求'})`);
    
    // 如果请求URL与我们的目标URL相关，并且是响应阶段
    if (responseStatusCode && (
        request.url.includes('google.com.hk') || 
        request.url.includes('google.com') || 
        request.url.includes('www.google')
    )) {
      try {
        console.log('🎯 匹配到目标URL相关网站，准备修改HTML内容...');
        
        // 只有当响应状态码为200时才尝试修改内容
        if (responseStatusCode === 200) {
          try {
            // 获取原始响应体
            console.log('📄 尝试获取响应体...');
            const responseObj = await client.send('Fetch.getResponseBody', {
              requestId
            });
            
            const originalBody = responseObj.base64Encoded ? 
              Buffer.from(responseObj.body, 'base64').toString('utf8') : responseObj.body;
            
            console.log('📄 原始响应大小:', originalBody.length, '字节');
            console.log('📄 响应内容前100个字符:', originalBody.substring(0, 100).replace(/\n/g, '\\n'));
            
            // 检查内容类型是否为HTML
            const contentTypeHeader = responseHeaders.find(h => h.name.toLowerCase() === 'content-type');
            const isHtml = contentTypeHeader && 
                          (contentTypeHeader.value.includes('text/html') || 
                           contentTypeHeader.value.includes('application/xhtml+xml'));
            
            if (!isHtml) {
              console.log('⚠️ 不是HTML内容，跳过修改');
              await client.send('Fetch.continueRequest', { requestId });
              return;
            }
            
            // 创建新的HTML内容 - 注入我们需要的元素
            let newBody = originalBody;
            
            // 尝试在<body>标签后注入内容
            if (originalBody.includes('<body')) {
              console.log('📌 找到<body>标签，注入内容...');
              
              // 使用简单的字符串替换，不完全替换body内容以避免破坏页面功能
              newBody = originalBody.replace(/<body([^>]*)>/, (match, attributes) => {
                return `<body${attributes || ''}>
                  <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    background-color: #ff5722;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    font-size: 24px;
                    z-index: 2147483647;
                    font-family: Arial, sans-serif;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                  ">
                    🔄 此页面已被 Chrome DevTools Protocol 成功拦截并修改!
                  </div>`;
              });
              
              console.log('✅ 成功注入HTML内容！');
              pageModified = true; // 标记已经修改了页面
            } else {
              console.log('⚠️ 未找到<body>标签，尝试直接在开头注入内容...');
              
              // 对于没有常规body标签的页面，尝试在文档开头注入
              newBody = `
              <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background-color: #ff5722;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 24px;
                z-index: 2147483647;
                font-family: Arial, sans-serif;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
              ">
                🔄 此页面已被 Chrome DevTools Protocol 成功拦截并修改!
              </div>` + originalBody;
              
              pageModified = true; // 标记已经修改了页面
            }
            
            console.log('📝 修改后的内容大小:', newBody.length, '字节');
            
            // 准备响应头
            const newHeaders = responseHeaders.map(h => ({ name: h.name, value: h.value }));
            
            // 更新Content-Length头
            const contentLengthHeader = newHeaders.find(h => h.name.toLowerCase() === 'content-length');
            if (contentLengthHeader) {
              contentLengthHeader.value = String(newBody.length);
            } else {
              newHeaders.push({ name: 'Content-Length', value: String(newBody.length) });
            }
            
            // 使用修改后的响应体和头部继续请求
            console.log('🚀 发送修改后的响应...');
            await client.send('Fetch.fulfillRequest', {
              requestId,
              responseCode: responseStatusCode,
              responseHeaders: newHeaders,
              body: Buffer.from(newBody).toString('base64'),
              responsePhrase: 'OK'
            });
            console.log('✅ 成功发送修改后的响应');
            
            // 保存修改后的HTML以便调试
            try {
              const debugDir = path.join(__dirname, 'debug');
              if (!fs.existsSync(debugDir)) {
                fs.mkdirSync(debugDir);
              }
              fs.writeFileSync(path.join(debugDir, 'modified.html'), newBody);
              console.log('💾 已将修改后的HTML保存到: debug/modified.html');
            } catch(err) {
              console.error('❌ 保存HTML文件时出错:', err);
            }
          } catch (bodyErr) {
            console.error('❌ 获取或处理响应体时出错:', bodyErr);
            // 继续原始请求
            await client.send('Fetch.continueRequest', { requestId });
          }
        } else {
          // 非200响应，继续原始请求
          console.log(`⏩ 非200响应(${responseStatusCode})，继续原始请求`);
          await client.send('Fetch.continueRequest', { requestId });
        }
      } catch (err) {
        console.error('❌ 处理拦截请求时出错:', err);
        // 如果出错，尝试继续原始请求
        try {
          await client.send('Fetch.continueRequest', { requestId });
        } catch (continueErr) {
          console.error('❌ 继续请求时出错:', continueErr);
        }
      }
    } else {
      // 继续其他请求
      await client.send('Fetch.continueRequest', { requestId });
    }
  });
  
  console.log(`🌐 正在导航到目标网站: ${targetUrl}`);
  try {
    // 导航到目标网站
    await page.goto(targetUrl, { 
      timeout: 60000,  // 增加超时时间
      waitUntil: 'networkidle' // 等待网络活动停止
    });
    
    console.log('📋 页面加载完成，等待查看效果...');
    
    // 等待查看效果
    await page.waitForTimeout(5000);
    
    // 截图保存 - 确保我们能看到实际效果
    const screenshotPath = path.join(__dirname, 'network-interception-result.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 已保存页面截图到: ${screenshotPath}`);
    
    if (pageModified) {
      console.log('✅ 页面已成功修改! 请查看浏览器和截图');
    } else {
      console.log('⚠️ 未检测到页面被修改，请检查控制台输出以排查问题');
    }
    
    console.log('⏳ 等待30秒以便观察页面修改效果...');
    console.log('✨ 提示: 查看浏览器窗口中的页面，应该能看到添加的红色横幅');
    
    // 等待更长时间以便观察
    await page.waitForTimeout(30000);
  } catch (err) {
    console.error('❌ 导航或等待过程中出错:', err);
  } finally {
    // 关闭浏览器
    console.log('👋 准备关闭浏览器...');
    try {
      await browser.close();
      console.log('👋 浏览器已关闭');
    } catch (err) {
      console.error('关闭浏览器时出错:', err);
    }
  }
})().catch(err => {
  console.error('❌ 执行过程中出错:', err);
  process.exit(1);
}); 