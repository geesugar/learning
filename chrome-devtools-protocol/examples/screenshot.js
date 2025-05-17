// 安装依赖: npm install playwright

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch();
  
  // 创建新页面
  const page = await browser.newPage();
  
  // 导航到目标网站
  await page.goto('https://example.com');
  
  // 截取页面截图并保存
  await page.screenshot({ path: 'example.png' });
  
  // 关闭浏览器
  await browser.close();
  
  console.log('截图已保存为 example.png');
})().catch(err => {
  console.error('执行过程中出错:', err);
  process.exit(1);
}); 