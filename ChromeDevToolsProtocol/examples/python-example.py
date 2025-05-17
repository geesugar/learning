#!/usr/bin/env python3
# =============================================================================
# Chrome DevTools Protocol Python示例
# =============================================================================
#
# 【运行前准备】
# 1. 切换到examples目录
#    cd ChromeDevToolsProtocol/examples
#
# 2. 使用uv创建虚拟环境
#    uv venv
#
# 3. 激活虚拟环境
#    source .venv/bin/activate  # macOS/Linux 
#    # 或
#    .venv\Scripts\activate     # Windows
#
# 4. 使用uv安装依赖
#    uv pip install playwright
#
# 5. 安装浏览器驱动
#    python -m playwright install
#
# 【运行示例】
# 默认网站:
#    python python-example.py
#
# 指定网站:
#    python python-example.py https://www.google.com
#
# =============================================================================

from playwright.sync_api import sync_playwright
import time
import sys

def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = "https://example.com"
    
    print(f"测试网址: {url}")
    
    with sync_playwright() as p:
        # 启动Chrome浏览器
        browser = p.chromium.launch(headless=False)
        
        # 创建新页面
        page = browser.new_page()
        
        # 设置页面加载超时
        page.set_default_timeout(30000)
        
        # 导航到目标网站
        print(f"正在加载网页: {url}")
        page.goto(url)
        
        # 等待页面加载完成
        page.wait_for_load_state("networkidle")
        print("页面加载完成")
        
        # 截图
        screenshot_path = "screenshot.png"
        page.screenshot(path=screenshot_path)
        print(f"截图已保存: {screenshot_path}")
        
        # 获取页面标题
        title = page.title()
        print(f"页面标题: {title}")
        
        # 获取cookies
        cookies = page.context.cookies()
        print(f"找到 {len(cookies)} 个cookies")
        
        # 执行一些JavaScript
        dimensions = page.evaluate("""() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio
            }
        }""")
        print(f"视窗尺寸: {dimensions}")
        
        # 等待5秒，方便查看
        print("等待5秒...")
        time.sleep(5)
        
        # 关闭浏览器
        browser.close()
        print("浏览器已关闭")

if __name__ == "__main__":
    main() 