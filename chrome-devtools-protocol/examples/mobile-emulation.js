// 安装依赖: npm install playwright

const { chromium } = require('playwright');

// 可用设备列表
const devices = {
  iPhone13: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  Pixel5: {
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Mobile Safari/537.36',
    viewport: {
      width: 393,
      height: 851,
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  }
};

(async () => {
  // 选择要模拟的设备
  const deviceName = process.argv[2] || 'iPhone13';
  const device = devices[deviceName] || devices.iPhone13;
  
  console.log(`模拟设备: ${deviceName}`);
  
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false // 设置为true则不显示浏览器窗口
  });
  
  // 创建新上下文，使用设备配置
  const context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport,
    deviceScaleFactor: device.viewport.deviceScaleFactor,
    isMobile: device.viewport.isMobile,
    hasTouch: device.viewport.hasTouch,
    isLandscape: device.viewport.isLandscape
  });
  
  // 创建新页面
  const page = await context.newPage();
  
  // 使用CDP直接设置设备元数据
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setDeviceMetricsOverride', {
    mobile: device.viewport.isMobile,
    width: device.viewport.width,
    height: device.viewport.height,
    deviceScaleFactor: device.viewport.deviceScaleFactor
  });
  
  // 导航到目标网站
  await page.goto('https://www.google.com');
  
  // 截取页面截图并保存
  await page.screenshot({ path: `${deviceName}-screenshot.png` });
  console.log(`已保存截图: ${deviceName}-screenshot.png`);
  
  // 等待15秒以便查看
  console.log('浏览器窗口将在15秒后关闭...');
  await page.waitForTimeout(15000);
  
  // 关闭浏览器
  await browser.close();
})().catch(err => {
  console.error('执行过程中出错:', err);
  process.exit(1);
}); 