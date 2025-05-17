#!/usr/bin/env python3
# =============================================================================
# Chrome DevTools Protocol Python示例
# =============================================================================
#
# 【运行前准备】
# 1. 切换到examples目录
#    cd chrome-devtools-protocol/examples
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
import os
import datetime

def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = "https://example.com"
    
    # 确保截图有唯一文件名
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 使用当前工作目录的绝对路径
    current_dir = os.getcwd()
    screenshot_path = os.path.join(current_dir, f"screenshot_{timestamp}.png")
    
    print(f"测试网址: {url}")
    print(f"当前工作目录: {current_dir}")
    
    try:
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
            
            # 截图 - 使用完整路径并添加更多反馈
            print(f"正在保存截图到: {screenshot_path}")
            try:
                page.screenshot(path=screenshot_path)
                if os.path.exists(screenshot_path):
                    file_size = os.path.getsize(screenshot_path) / 1024  # KB
                    print(f"✅ 截图已成功保存: {screenshot_path}")
                    print(f"   文件大小: {file_size:.2f} KB")
                else:
                    print(f"❌ 截图文件未找到，可能是保存失败")
            except Exception as e:
                print(f"❌ 截图保存失败: {str(e)}")
            
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
            
        # 再次确认截图是否存在
        if os.path.exists(screenshot_path):
            print(f"\n截图已保存在: {screenshot_path}")
            print(f"请使用文件浏览器查看，或使用以下命令查看: open {screenshot_path}")
        else:
            print("\n❌ 未能找到截图文件，请检查权限或磁盘空间")
            
    except Exception as e:
        print(f"运行过程中出错: {str(e)}")

if __name__ == "__main__":
    main() 