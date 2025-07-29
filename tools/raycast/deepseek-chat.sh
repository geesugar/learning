#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title DeepSeek Chat
# @raycast.mode silent
# @raycast.packageName Web
#
# Optional parameters:
# @raycast.icon 🤖
# @raycast.needsConfirmation false
#
# Documentation:
# @raycast.description 打开DeepSeek聊天页面，如果已在Chrome中打开则激活该标签页
# @raycast.author Tao Long
# @raycast.authorURL https://github.com/taolong

# DeepSeek聊天页面URL
DEEPSEEK_URL="https://chat.deepseek.com/"

# 检查Chrome是否正在运行
if ! pgrep -x "Google Chrome" > /dev/null; then
    # Chrome没有运行，直接打开新窗口
    open -a "Google Chrome" "$DEEPSEEK_URL"
    echo "✅ 已打开Chrome并加载DeepSeek聊天页面"
    exit 0
fi

# 使用AppleScript检查Chrome中是否已经有DeepSeek聊天页面的标签页
EXISTING_TAB=$(osascript <<EOF
tell application "Google Chrome"
    set targetUrl to "$DEEPSEEK_URL"
    
    repeat with w from 1 to count of windows
        repeat with t from 1 to count of tabs of window w
            set tabUrl to URL of tab t of window w
            if tabUrl starts with "https://chat.deepseek.com" then
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
    echo "✅ 已激活现有的DeepSeek聊天标签页"
else
    # 没有找到现有标签页，创建新的标签页
    osascript <<EOF
tell application "Google Chrome"
    set targetUrl to "$DEEPSEEK_URL"
    
    try
        make new tab at end of tabs of front window with properties {URL:targetUrl}
        activate
        return true
    on error
        make new window with properties {URL:targetUrl}
        activate
        return true
    end try
end tell
EOF

    if [ $? -eq 0 ]; then
        echo "✅ 已在Chrome中打开新的DeepSeek聊天标签页"
    else
        # 如果AppleScript失败，回退到简单的打开方式
        open -a "Google Chrome" "$DEEPSEEK_URL"
        echo "✅ 已在Chrome中打开DeepSeek聊天页面"
    fi
fi 