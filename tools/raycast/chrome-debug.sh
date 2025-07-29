#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Chrome Debug Mode
# @raycast.mode silent
# @raycast.packageName Development
#
# Optional parameters:
# @raycast.icon 🔧
# @raycast.needsConfirmation false
#
# Documentation:
# @raycast.description 启动带有远程调试功能的Chrome浏览器 (端口9222)
# @raycast.author Tao Long
# @raycast.authorURL https://github.com/taolong

# Chrome调试配置
DEBUG_PORT=9222
USER_DATA_DIR="/Users/tao.long/.chrome"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 检查Chrome是否已安装
if [ ! -f "$CHROME_PATH" ]; then
    echo "❌ 未找到Google Chrome，请确保Chrome已正确安装"
    exit 1
fi

# 检查调试端口是否已被占用
if lsof -Pi :$DEBUG_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ 端口 $DEBUG_PORT 已被占用"
    echo "🔍 检查是否已有Chrome调试实例运行..."
    
    # 尝试获取占用端口的进程信息
    PROCESS_INFO=$(lsof -Pi :$DEBUG_PORT -sTCP:LISTEN)
    PROCESS_NAME=$(echo "$PROCESS_INFO" | awk 'NR==2 {print $1}')
    
    if [[ $PROCESS_NAME == "Google"* ]] || [[ $PROCESS_NAME == "Chrome"* ]]; then
        echo "✅ Chrome调试模式已在运行 (端口 $DEBUG_PORT)"
        echo "🔄 正在激活Chrome到前台..."
        
        # 使用AppleScript激活Chrome应用到前台
        osascript <<EOF
tell application "Google Chrome"
    activate
end tell
EOF
        
        if [ $? -eq 0 ]; then
            echo "✅ 已激活Chrome调试实例到前台"
        else
            echo "⚠️ 无法激活Chrome到前台，但调试模式正在运行"
        fi
        
        echo "🌐 调试界面: http://localhost:$DEBUG_PORT"
        echo ""
        echo "🔧 调试信息:"
        echo "   • 远程调试端口: $DEBUG_PORT"
        echo "   • 调试界面: http://localhost:$DEBUG_PORT"
        echo "   • DevTools Protocol: ws://localhost:$DEBUG_PORT/devtools/page/[PAGE_ID]"
        echo ""
        echo "💡 使用提示:"
        echo "   • 在浏览器中访问 http://localhost:$DEBUG_PORT 查看可调试的页面"
        echo "   • 可以使用Chrome DevTools Protocol进行自动化操作"
        echo "   • Chrome已激活到前台，可以直接使用"
        exit 0
    else
        echo "❌ 端口被其他进程占用:"
        echo "$PROCESS_INFO" | tail -n +2 | head -1
        echo "💡 请先停止占用端口的进程，或使用其他端口"
        exit 1
    fi
fi

# 创建用户数据目录（如果不存在）
if [ ! -d "$USER_DATA_DIR" ]; then
    mkdir -p "$USER_DATA_DIR"
    echo "📁 已创建用户数据目录: $USER_DATA_DIR"
fi

# 启动Chrome调试模式
echo "🚀 启动Chrome调试模式..."
echo "📍 调试端口: $DEBUG_PORT"
echo "📁 用户数据目录: $USER_DATA_DIR"
echo "🌐 调试界面: http://localhost:$DEBUG_PORT"

# 在后台启动Chrome
nohup "$CHROME_PATH" \
    --remote-debugging-port=$DEBUG_PORT \
    --user-data-dir="$USER_DATA_DIR" \
    --enable-easy-off-store-extension-install \
    --disable-extensions-verification \
    --no-first-run \
    > /dev/null 2>&1 &

# 等待一下确保Chrome启动
sleep 2

# 验证Chrome是否成功启动并监听调试端口
if lsof -Pi :$DEBUG_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Chrome调试模式启动成功！"
    echo "🔄 正在激活Chrome到前台..."
    
    # 使用AppleScript激活Chrome应用到前台
    osascript <<EOF
tell application "Google Chrome"
    activate
end tell
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ 已激活Chrome到前台"
    else
        echo "⚠️ 无法激活Chrome到前台，但调试模式正在运行"
    fi
    
    echo ""
    echo "🔧 调试信息:"
    echo "   • 远程调试端口: $DEBUG_PORT"
    echo "   • 调试界面: http://localhost:$DEBUG_PORT"
    echo "   • DevTools Protocol: ws://localhost:$DEBUG_PORT/devtools/page/[PAGE_ID]"
    echo ""
    echo "💡 使用提示:"
    echo "   • 在浏览器中访问 http://localhost:$DEBUG_PORT 查看可调试的页面"
    echo "   • 可以使用Chrome DevTools Protocol进行自动化操作"
    echo "   • 独立的用户数据目录确保不影响主Chrome实例"
    echo "   • Chrome已激活到前台，可以直接使用"
else
    echo "❌ Chrome调试模式启动失败"
    echo "💡 请检查Chrome是否正确安装，或端口是否被占用"
    exit 1
fi