#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Space DNS Management
# @raycast.mode silent
# @raycast.packageName Infrastructure
#
# Optional parameters:
# @raycast.icon 🌐
# @raycast.needsConfirmation false
#
# Documentation:
# @raycast.description 打开Space DNS Management页面，如果已在Chrome中打开匹配前缀的标签页则激活
# @raycast.author Tao Long
# @raycast.authorURL https://github.com/taolong

# Space DNS Management URL
SPACE_URL="https://space.shopee.io/dns/management"
URL_PREFIX="https://space.shopee.io/dns/management"
PAGE_NAME="DNS Management"

# 检查Chrome是否正在运行
if ! pgrep -x "Google Chrome" > /dev/null; then
    # Chrome没有运行，直接打开新窗口
    open -a "Google Chrome" "$SPACE_URL"
    echo "✅ 已打开Chrome并加载Space ${PAGE_NAME}页面"
    exit 0
fi

# 使用AppleScript检查Chrome中是否已经有匹配前缀的标签页
EXISTING_TAB=$(osascript <<EOF
tell application "Google Chrome"
    set targetUrl to "$SPACE_URL"
    set urlPrefix to "$URL_PREFIX"
    
    repeat with w from 1 to count of windows
        repeat with t from 1 to count of tabs of window w
            set tabUrl to URL of tab t of window w
            if tabUrl starts with urlPrefix then
                set active tab index of window w to t
                activate
                return "found"
            end if
        end repeat
    end repeat
    
    return "not_found"
end tell
EOF
)

if [ "$EXISTING_TAB" = "found" ]; then
    echo "✅ 已激活现有的Space ${PAGE_NAME}标签页"
else
    # 没有找到现有标签页，创建新的标签页
    osascript <<EOF
tell application "Google Chrome"
    set targetUrl to "$SPACE_URL"
    
    try
        tell front window
            make new tab with properties {URL:targetUrl}
        end tell
        activate
        return true
    on error
        make new window
        set URL of active tab of front window to targetUrl
        activate
        return true
    end try
end tell
EOF

    if [ $? -eq 0 ]; then
        echo "✅ 已在Chrome中打开新的Space ${PAGE_NAME}标签页"
    else
        # 如果AppleScript失败，回退到简单的打开方式
        open -a "Google Chrome" "$SPACE_URL"
        echo "✅ 已在Chrome中打开Space ${PAGE_NAME}页面"
    fi
fi 