// 安装依赖: npm install playwright

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch();
  
  // 创建新页面
  const page = await browser.newPage();
  
  // 获取CDP会话 - Playwright允许直接访问CDP
  const client = await page.context().newCDPSession(page);
  
  // 启用网络域功能
  await client.send('Network.enable');
  
  // 设置请求拦截
  await client.send('Network.setRequestInterception', {
    patterns: [
      {
        urlPattern: '*',
        resourceType: 'Script',
        interceptionStage: 'HeadersReceived'
      }
    ]
  });
  
  // 处理拦截的请求
  client.on('Network.requestIntercepted', async ({interceptionId}) => {
    console.log('拦截到请求:', interceptionId);
    
    try {
      // 获取响应体
      const response = await client.send('Network.getResponseBodyForInterception', {
        interceptionId
      });
      
      const originalBody = response.base64Encoded ? 
        Buffer.from(response.body, 'base64').toString('utf8') : response.body;
      
      console.log('原始响应体大小:', originalBody.length, '字节');
      
      // 修改响应体 - 这里我们只是添加一条注释
      const newBody = originalBody + '\n// 这段代码被CDP拦截并修改了';
      
      // 生成完整的HTTP响应
      const httpResponse = [
        'HTTP/1.1 200 OK',
        'Date: ' + (new Date()).toUTCString(),
        'Connection: closed',
        'Content-Length: ' + newBody.length,
        'Content-Type: application/javascript',
        '', // 空行分隔头部与正文
        newBody
      ].join('\r\n');
      
      // 继续请求，但使用修改后的响应
      await client.send('Network.continueInterceptedRequest', {
        interceptionId,
        rawResponse: Buffer.from(httpResponse).toString('base64')
      });
      console.log('请求已继续，使用了修改后的响应');
    } catch (err) {
      console.error('处理拦截请求时出错:', err);
      
      // 如果出错，继续原始请求
      await client.send('Network.continueInterceptedRequest', {
        interceptionId
      });
    }
  });
  
  console.log('正在导航到目标网站...');
  // 导航到目标网站
  await page.goto('https://example.com');
  
  console.log('等待5秒以便观察...');
  // 等待5秒以便观察
  await page.waitForTimeout(5000);
  
  // 关闭浏览器
  await browser.close();
  console.log('浏览器已关闭');
})().catch(err => {
  console.error('执行过程中出错:', err);
  process.exit(1);
}); 