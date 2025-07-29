#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Garena Git Repositories
# @raycast.mode silent
# @raycast.packageName Git
# @raycast.argument1 { "type": "dropdown", "placeholder": "选择Git仓库", "data": [{"title": "Cache Control Plane", "value": "cache-cp"}, {"title": "Cache Manager", "value": "cache-manager"}] }
#
# Optional parameters:
# @raycast.icon 🔧
# @raycast.needsConfirmation false
#
# Documentation:
# @raycast.description 打开指定的Garena Git仓库页面，如果已在Chrome中打开匹配前缀的标签页则激活
# @raycast.author Tao Long
# @raycast.authorURL https://github.com/taolong

# 获取仓库类型参数
REPO_TYPE="$1"

# 检查是否提供了仓库类型参数
if [ -z "$REPO_TYPE" ]; then
    echo "❌ 请选择要打开的Git仓库"
    exit 1
fi

# 根据参数设置对应的URL和前缀
case "$REPO_TYPE" in
    "cache-cp")
        GARENA_GIT_URL="https://git.garena.com/shopee/platform/cache/control-plane"
        URL_PREFIX="https://git.garena.com/shopee/platform/cache/control-plane"
        REPO_NAME="缓存控制平面"
        ;;
    "cache-manager")
        GARENA_GIT_URL="https://git.garena.com/shopee/sz-devops/middleware/middleware-ops/cachecloud/cachecloud-manager"
        URL_PREFIX="https://git.garena.com/shopee/sz-devops/middleware/middleware-ops/cachecloud/cachecloud-manager"
        REPO_NAME="缓存管理器"
        ;;
    *)
        echo "❌ 不支持的仓库类型: $REPO_TYPE"
        echo "支持的类型: cache-cp, cache-manager"
        exit 1
        ;;
esac

# 检查Chrome是否正在运行
if ! pgrep -x "Google Chrome" > /dev/null; then
    # Chrome没有运行，直接打开新窗口
    open -a "Google Chrome" "$GARENA_GIT_URL"
    echo "✅ 已打开Chrome并加载Garena Git ${REPO_NAME}页面"
    exit 0
fi

# 使用AppleScript检查Chrome中是否已经有匹配前缀的标签页
EXISTING_TAB=$(osascript <<EOF
tell application "Google Chrome"
    set targetUrl to "$GARENA_GIT_URL"
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
    echo "✅ 已激活现有的Garena Git ${REPO_NAME}标签页"
else
    # 没有找到现有标签页，创建新的标签页
    osascript <<EOF
tell application "Google Chrome"
    set targetUrl to "$GARENA_GIT_URL"
    
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
        echo "✅ 已在Chrome中打开新的Garena Git ${REPO_NAME}标签页"
    else
        # 如果AppleScript失败，回退到简单的打开方式
        open -a "Google Chrome" "$GARENA_GIT_URL"
        echo "✅ 已在Chrome中打开Garena Git ${REPO_NAME}页面"
    fi
fi 