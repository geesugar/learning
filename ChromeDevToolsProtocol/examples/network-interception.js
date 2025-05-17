// 安装依赖: npm install playwright

const { chromium } = require('playwright');

(async () => {
  console.log('启动浏览器...');
  // 启动浏览器，使用非headless模式以便观察效果
  const browser = await chromium.launch({
    headless: false  // 非无头模式，可以看到浏览器窗口
  });
  
  // 创建新页面
  const page = await browser.newPage();
  
  // 获取CDP会话 - Playwright允许直接访问CDP
  const client = await page.context().newCDPSession(page);
  
  console.log('设置网络拦截...');
  // 启用网络域功能
  await client.send('Network.enable');
  
  // 设置请求拦截 - 拦截Document类型（HTML页面）
  await client.send('Network.setRequestInterception', {
    patterns: [
      {
        urlPattern: '*',
        resourceType: 'Document',  // 拦截HTML文档
        interceptionStage: 'HeadersReceived'
      }
    ]
  });
  
  // 处理拦截的请求
  client.on('Network.requestIntercepted', async ({interceptionId, request}) => {
    console.log('🔍 拦截到请求:', request.url);
    
    try {
      // 获取响应体
      const response = await client.send('Network.getResponseBodyForInterception', {
        interceptionId
      });
      
      const originalBody = response.base64Encoded ? 
        Buffer.from(response.body, 'base64').toString('utf8') : response.body;
      
      console.log('📄 原始响应大小:', originalBody.length, '字节');
      
      // 明显修改响应体 - 添加醒目的标题和修改页面内容
      let newBody = originalBody;
      
      // 如果是HTML内容，添加明显的标记
      if (originalBody.includes('<html') || originalBody.includes('<!DOCTYPE')) {
        // 寻找<body>标签并在其后添加内容
        if (originalBody.includes('<body')) {
          newBody = originalBody.replace(/<body[^>]*>/, match => {
            return `${match}
            <div style="
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background-color: #ff5722;
              color: white;
              padding: 15px;
              text-align: center;
              font-size: 18px;
              z-index: 9999;
              font-family: Arial, sans-serif;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
              🔄 此页面已被 Chrome DevTools Protocol 拦截并修改
            </div>
            <h1 style="
              color: #ff5722; 
              text-align: center;
              margin-top: 60px;
              border: 3px dashed #ff5722;
              padding: 20px;
              font-family: Arial, sans-serif;
            ">
              CDP网络拦截演示
            </h1>`;
          });
          
          // 修改标题
          newBody = newBody.replace(/<title>(.*?)<\/title>/i, '<title>已被CDP修改 - $1</title>');
          
          console.log('✅ 成功修改了HTML内容！');
        } else {
          console.log('⚠️ 未找到<body>标签，无法注入内容');
        }
      } else {
        console.log('⚠️ 不是HTML内容，不进行修改');
      }
      
      // 生成完整的HTTP响应
      const httpResponse = [
        'HTTP/1.1 200 OK',
        'Date: ' + (new Date()).toUTCString(),
        'Connection: closed',
        'Content-Length: ' + newBody.length,
        'Content-Type: text/html; charset=UTF-8',  // 确保内容类型正确
        '', // 空行分隔头部与正文
        newBody
      ].join('\r\n');
      
      // 继续请求，但使用修改后的响应
      await client.send('Network.continueInterceptedRequest', {
        interceptionId,
        rawResponse: Buffer.from(httpResponse).toString('base64')
      });
      console.log('🚀 请求已继续，使用了修改后的响应');
    } catch (err) {
      console.error('❌ 处理拦截请求时出错:', err);
      
      // 如果出错，继续原始请求
      await client.send('Network.continueInterceptedRequest', {
        interceptionId
      });
    }
  });
  
  console.log('🌐 正在导航到目标网站...');
  // 导航到目标网站 - 使用更容易观察效果的网站
  await page.goto('https://example.com');
  
  console.log('⏳ 等待30秒以便观察页面修改效果...');
  console.log('✨ 提示：查看浏览器窗口中的页面，应该能看到添加的红色横幅和标题');
  // 等待更长时间以便观察
  await page.waitForTimeout(30000);
  
  // 关闭浏览器
  await browser.close();
  console.log('👋 浏览器已关闭');
})().catch(err => {
  console.error('❌ 执行过程中出错:', err);
  process.exit(1);
}); 