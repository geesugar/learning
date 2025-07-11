# Chrome DevTools Protocol 示例代码

这个目录包含了使用Chrome DevTools Protocol (CDP)的示例代码，演示了CDP的各种应用场景。

## 安装依赖

### JavaScript示例依赖安装

```bash
# 切换到examples目录
cd chrome-devtools-protocol/examples

# 安装依赖
npm install
```

### Python示例依赖安装

推荐使用uv作为Python包管理工具，它比pip更快速且更可靠：

```bash
# 安装uv (如果尚未安装)
curl -sSf https://install.ultraviolet.rs | sh

# 创建虚拟环境并安装Playwright
uv venv
source .venv/bin/activate  # Linux/macOS
# 或 .venv\Scripts\activate  # Windows

# 安装依赖
uv pip install playwright

# 安装浏览器
python -m playwright install
```

## 运行示例

### JavaScript示例

1. **基本截图示例**

   ```bash
   node screenshot.js
   # 或使用npm脚本
   npm run screenshot
   ```

   此示例将访问example.com网站并保存截图。

2. **网络拦截和修改示例**

   ```bash
   node network-interception.js
   # 或使用npm脚本
   npm run network
   ```

   此示例将拦截网络请求并修改HTML响应，添加明显的视觉标记。浏览器会以非无头模式打开，便于直接观察效果。

3. **移动设备模拟示例**

   ```bash
   # 默认模拟iPhone 13
   node mobile-emulation.js
   
   # 模拟Pixel 5
   node mobile-emulation.js Pixel5
   
   # 或使用npm脚本
   npm run mobile
   ```

   此示例将模拟移动设备访问Google网站，会打开浏览器窗口并生成截图。

### Python示例

```bash
# 激活虚拟环境
source .venv/bin/activate  # Linux/macOS
# 或 .venv\Scripts\activate  # Windows

# 访问默认网站(example.com)
python python-example.py

# 访问指定网站
python python-example.py https://www.google.com

# 或使用npm脚本
npm run python
```

Python示例将获取页面标题、截图、cookies和视窗尺寸等信息。

## 示例说明

1. **screenshot.js** - 展示如何使用Playwright和CDP截取网页截图
2. **network-interception.js** - 演示如何使用CDP拦截和修改网络请求与响应
3. **mobile-emulation.js** - 演示如何使用CDP模拟移动设备
4. **python-example.py** - Python版本的Playwright CDP使用示例

## 注意事项

- 部分示例默认会打开浏览器窗口（非无头模式）以便观察
- 示例代码为演示目的，实际应用中可能需要进一步调整和优化
- 建议使用Node.js 14+和Python 3.8+运行示例
- Python虚拟环境(.venv)已添加到.gitignore中，不会被提交到仓库 