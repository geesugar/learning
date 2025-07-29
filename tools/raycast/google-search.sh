#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Google Search
# @raycast.mode silent
# @raycast.packageName Web
# @raycast.argument1 { "type": "text", "placeholder": "输入搜索关键字", "optional": false }
#
# Optional parameters:
# @raycast.icon 🔍
# @raycast.needsConfirmation false
#
# Documentation:
# @raycast.description 使用Google搜索指定关键字
# @raycast.author Wen Pan
# @raycast.authorURL https://github.com/wenpan

# 获取搜索关键字参数
SEARCH_QUERY="$1"

# 检查是否提供了搜索关键字
if [ -z "$SEARCH_QUERY" ]; then
    echo "❌ 请提供搜索关键字"
    exit 1
fi

# URL编码搜索关键字
ENCODED_QUERY=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SEARCH_QUERY'))")

# 构建Google搜索URL
SEARCH_URL="https://www.google.com/search?q=${ENCODED_QUERY}"

# 检查Chrome是否正在运行
if ! pgrep -x "Google Chrome" > /dev/null; then
    # Chrome没有运行，直接打开新窗口
    open -a "Google Chrome" "$SEARCH_URL"
    echo "✅ 已打开Chrome并搜索：$SEARCH_QUERY"
    exit 0
fi

# 使用AppleScript在Chrome中打开新标签页进行搜索
osascript <<EOF
tell application "Google Chrome"
    set searchUrl to "$SEARCH_URL"
    
    try
        make new tab at end of tabs of front window with properties {URL:searchUrl}
        activate
        return true
    on error
        make new window with properties {URL:searchUrl}
        activate
        return true
    end try
end tell
EOF

if [ $? -eq 0 ]; then
    echo "✅ 已在Chrome中搜索：$SEARCH_QUERY"
else
    # 如果AppleScript失败，回退到简单的打开方式
    open -a "Google Chrome" "$SEARCH_URL"
    echo "✅ 已在Chrome中打开Google搜索：$SEARCH_QUERY"
fi 
