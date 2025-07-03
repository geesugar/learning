#!/bin/bash

# ================================================================================
# PlantUML批量转换脚本
# ================================================================================
# 
# 功能：将docs/charts目录下的所有.puml文件转换为PNG图片，保存到docs/images目录
# 
# 用法：
#   ./convert_puml_to_png.sh            # 转换所有puml文件
#   ./convert_puml_to_png.sh -h         # 显示帮助信息
#   ./convert_puml_to_png.sh --help     # 显示帮助信息
# 
# 依赖：
#   - PlantUML (优先使用系统命令: brew install plantuml)
#   - 或PlantUML JAR文件 (位于 ~/Downloads/plantuml-1.2025.3.jar)
#   - Java运行环境 (如果使用JAR文件)
# 
# 目录结构：
#   docs/
#   ├── charts/          # 输入：PUML源文件目录
#   │   ├── *.puml
#   ├── images/          # 输出：PNG图片目录 (自动创建)
#   │   ├── *.png
#   └── convert_puml_to_png.sh  # 本脚本
# 
# ================================================================================

# 显示帮助信息
show_help() {
    cat << EOF
PlantUML批量转换脚本

用法:
    $0 [选项]

选项:
    -h, --help     显示此帮助信息并退出

功能:
    将docs/charts目录下的所有.puml文件转换为PNG图片，
    保存到docs/images目录下，文件名与原puml文件相同。

依赖:
    1. PlantUML命令行工具 (推荐)
       安装: brew install plantuml
    
    2. PlantUML JAR文件 (备用)
       下载地址: https://plantuml.com/download
       存放路径: ~/Downloads/plantuml-1.2025.3.jar

目录结构:
    docs/
    ├── charts/          输入目录 (PUML源文件)
    ├── images/          输出目录 (PNG图片，自动创建)
    └── convert_puml_to_png.sh

示例:
    # 转换所有PUML文件
    ./convert_puml_to_png.sh
    
    # 查看帮助
    ./convert_puml_to_png.sh --help

注意:
    - 如果images目录已存在，会覆盖其中的PNG文件
    - 脚本会自动处理中文文件名问题
    - 支持多种PlantUML安装方式，自动检测使用
    
EOF
}

# 处理命令行参数
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    "")
        # 无参数，继续执行转换
        ;;
    *)
        echo "错误: 未知参数 '$1'"
        echo "使用 '$0 --help' 查看帮助信息"
        exit 1
        ;;
esac

# 脚本配置
PLANTUML_JAR="$HOME/Downloads/plantuml-1.2025.3.jar"
CHARTS_DIR="$(dirname "$0")/charts"
IMAGES_DIR="$(dirname "$0")/images"

# 颜色输出函数
print_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

print_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

print_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

print_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

# 检测PlantUML安装方式
detect_plantuml() {
    # 优先检查系统命令
    if command -v plantuml &> /dev/null; then
        PLANTUML_CMD="plantuml"
        print_info "检测到系统安装的PlantUML命令"
        return 0
    fi
    
    # 检查Java和JAR文件
    if ! command -v java &> /dev/null; then
        print_error "Java未安装或未在PATH中"
        return 1
    fi
    
    if [ ! -f "$PLANTUML_JAR" ]; then
        print_error "PlantUML JAR文件不存在: $PLANTUML_JAR"
        print_info "请安装PlantUML: brew install plantuml"
        print_info "或下载PlantUML JAR文件到指定路径"
        return 1
    fi
    
    PLANTUML_CMD="java -jar $PLANTUML_JAR"
    print_info "使用PlantUML JAR文件: $PLANTUML_JAR"
    return 0
}

# 执行PlantUML转换
run_plantuml() {
    local input_file="$1"
    local output_dir="$2"
    local filename=$(basename "$input_file" .puml)
    local output_file="$output_dir/${filename}.png"
    
    if [ "$PLANTUML_CMD" = "plantuml" ]; then
        # 使用临时工作目录避免中文文件名问题
        local temp_dir=$(mktemp -d)
        plantuml -tpng -o "$temp_dir" "$input_file" 2>/dev/null
        
        # 查找生成的文件并重命名移动
        local generated_file=$(find "$temp_dir" -name "*.png" -type f | head -1)
        if [ -n "$generated_file" ] && [ -f "$generated_file" ]; then
            mv "$generated_file" "$output_file"
            rm -rf "$temp_dir"
            return 0
        else
            rm -rf "$temp_dir"
            return 1
        fi
    else
        # JAR方式也使用临时目录
        local temp_dir=$(mktemp -d)
        eval "$PLANTUML_CMD -tpng -o \"$temp_dir\" \"$input_file\"" 2>/dev/null
        
        # 查找生成的文件并重命名移动
        local generated_file=$(find "$temp_dir" -name "*.png" -type f | head -1)
        if [ -n "$generated_file" ] && [ -f "$generated_file" ]; then
            mv "$generated_file" "$output_file"
            rm -rf "$temp_dir"
            return 0
        else
            rm -rf "$temp_dir"
            return 1
        fi
    fi
}

# 检测PlantUML
if ! detect_plantuml; then
    exit 1
fi

# 检查charts目录是否存在
if [ ! -d "$CHARTS_DIR" ]; then
    print_error "Charts目录不存在: $CHARTS_DIR"
    exit 1
fi

# 创建或清理images目录
if [ -d "$IMAGES_DIR" ]; then
    print_warn "Images目录已存在，将覆盖现有PNG文件"
    # 只删除PNG文件，保留其他文件
    rm -f "$IMAGES_DIR"/*.png 2>/dev/null
else
    print_info "创建images目录: $IMAGES_DIR"
    mkdir -p "$IMAGES_DIR"
fi

# 查找所有puml文件
puml_files=($(find "$CHARTS_DIR" -name "*.puml" -type f))

if [ ${#puml_files[@]} -eq 0 ]; then
    print_warn "在 $CHARTS_DIR 目录下未找到任何.puml文件"
    exit 0
fi

print_info "找到 ${#puml_files[@]} 个PUML文件"
print_info "开始转换..."

# 转换统计
converted_count=0
failed_count=0
failed_files=()

# 批量转换
for puml_file in "${puml_files[@]}"; do
    filename=$(basename "$puml_file" .puml)
    output_file="$IMAGES_DIR/${filename}.png"
    
    print_info "转换: $(basename "$puml_file") -> ${filename}.png"
    
    # 执行转换
    if run_plantuml "$puml_file" "$IMAGES_DIR"; then
        if [ -f "$output_file" ]; then
            ((converted_count++))
            print_success "✓ ${filename}.png"
        else
            ((failed_count++))
            failed_files+=("$puml_file")
            print_error "✗ 转换失败: $(basename "$puml_file") (输出文件未生成)"
        fi
    else
        ((failed_count++))
        failed_files+=("$puml_file")
        print_error "✗ 转换失败: $(basename "$puml_file") (PlantUML执行错误)"
    fi
done

echo
print_info "=== 转换完成 ==="
print_success "成功转换: $converted_count 个文件"

if [ $failed_count -gt 0 ]; then
    print_error "转换失败: $failed_count 个文件"
    echo "失败的文件:"
    for failed_file in "${failed_files[@]}"; do
        echo "  - $(basename "$failed_file")"
    done
else
    print_success "所有文件转换成功！"
fi

echo
print_info "生成的PNG文件位置: $IMAGES_DIR"
if ls "$IMAGES_DIR"/*.png 1> /dev/null 2>&1; then
    ls -la "$IMAGES_DIR"/*.png | while read line; do
        echo "  $line"
    done
else
    print_warn "未找到生成的PNG文件"
fi

exit 0 