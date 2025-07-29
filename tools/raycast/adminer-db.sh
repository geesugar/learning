#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Database Adminer
# @raycast.mode silent
# @raycast.packageName Database
# @raycast.argument1 { "type": "dropdown", "placeholder": "选择数据库", "data": [{"title": "(99)Cache API DB", "value": "99"}, {"title": "(70)Cache API DB", "value": "70"}, {"title": "(SPM)Cache API DB", "value": "spm"}, {"title": "(Shopee)Cache API DB", "value": "shopee"}] }
# 添加新数据库时，需要同时更新上面的dropdown data数组和下面的case语句
#
# Optional parameters:
# @raycast.icon 🗄️
# @raycast.needsConfirmation false
#
# Documentation:
# @raycast.description 打开指定的数据库Adminer页面，如果已在Chrome中打开匹配前缀的标签页则激活
# @raycast.author Tao Long
# @raycast.authorURL https://github.com/taolong

# 获取数据库别名参数
DB_ALIAS="$1"

# 检查是否提供了数据库别名参数
if [ -z "$DB_ALIAS" ]; then
    echo "❌ 请选择要连接的数据库"
    exit 1
fi

# 根据别名设置对应的数据库配置
case "$DB_ALIAS" in
    "99")
        SERVER_ADDRESS="10.192.105.99:18080"
        DB_USERNAME="root"
        DB_PASSWORD="root123"
        DB_NAME="shopee_cache_api_db"
        DB_DISPLAY_NAME="(99)Cache API DB"
        ;;
    "70")
        SERVER_ADDRESS="10.188.35.70:3306"
        DB_USERNAME="root"
        DB_PASSWORD="123456"
        DB_NAME="shopee_cache_api_db"
        DB_DISPLAY_NAME="(70)Cache API DB"
        ;;
    "spm")
        SERVER_ADDRESS="db-master-spm-all-toolkits-live.airpaymobile.com:6606"
        DB_USERNAME="root"
        DB_PASSWORD="123456"
        DB_NAME="shopee_cache_api_db"
        DB_DISPLAY_NAME="(SPM)Cache API DB"
        ;;
    "shopee")
        SERVER_ADDRESS="db-master-cache-api-sg1-live.shopeemobile.com:6606"
        DB_USERNAME="root"
        DB_PASSWORD="123456"
        DB_NAME="shopee_cache_api_db"
        DB_DISPLAY_NAME="(Shopee)Cache API DB"
        ;;    
    # 预留空间 - 后续可添加其他数据库配置
    # 例如:
    # "alias")
    #     SERVER_ADDRESS="服务器地址:端口"
    #     DB_USERNAME="用户名"
    #     DB_PASSWORD="密码"
    #     DB_NAME="数据库名"
    #     DB_DISPLAY_NAME="显示名称"
    #     ;;
    *)
        echo "❌ 不支持的数据库别名: $DB_ALIAS"
        echo "支持的别名: 99, 70, spm, shopee"
        exit 1
        ;;
esac

# URL编码服务器地址
ENCODED_SERVER=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SERVER_ADDRESS'))")

# 构建Adminer URL
ADMINER_URL="https://config.shopee.io/ccdebug/?server=${ENCODED_SERVER}"

# 检查Chrome是否正在运行
if ! pgrep -x "Google Chrome" > /dev/null; then
    # Chrome没有运行，直接打开新窗口
    open -a "Google Chrome" "$ADMINER_URL"
    echo "✅ 已打开Chrome并加载Adminer页面 ($DB_DISPLAY_NAME - $SERVER_ADDRESS)"
    exit 0
fi

# 使用AppleScript检查Chrome中是否已经有匹配前缀的标签页
EXISTING_TAB=$(osascript <<EOF
tell application "Google Chrome"
    set targetUrlPrefix to "$ADMINER_URL"
    
    repeat with w from 1 to count of windows
        repeat with t from 1 to count of tabs of window w
            set tabUrl to URL of tab t of window w
            if tabUrl starts with targetUrlPrefix then
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
    echo "✅ 已激活现有的Adminer标签页 ($DB_DISPLAY_NAME)"
else
    # 没有找到现有标签页，创建新的标签页
    osascript <<EOF
tell application "Google Chrome"
    try
        tell front window
            make new tab with properties {URL:"$ADMINER_URL"}
        end tell
        activate
        return true
    on error
        make new window
        set URL of active tab of front window to "$ADMINER_URL"
        activate
        return true
    end try
end tell
EOF

    if [ $? -eq 0 ]; then
        echo "✅ 已在Chrome中打开新的Adminer标签页 ($DB_DISPLAY_NAME - $SERVER_ADDRESS)"
    else
        # 如果AppleScript失败，回退到简单的打开方式
        open -a "Google Chrome" "$ADMINER_URL"
        echo "✅ 已在Chrome中打开Adminer页面 ($DB_DISPLAY_NAME - $SERVER_ADDRESS)"
    fi
fi
