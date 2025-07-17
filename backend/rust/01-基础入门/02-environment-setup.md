# 环境搭建

## 安装 Rust 工具链

### 使用 rustup 安装（推荐）

rustup 是 Rust 官方的工具链管理器，推荐使用这种方式安装。

#### Linux/macOS
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Windows
1. 访问 https://rustup.rs/
2. 下载 rustup-init.exe
3. 运行安装程序

#### 验证安装
```bash
rustc --version
cargo --version
```

### 工具链组件

安装 Rust 后，你会得到以下工具：

- **rustc**：Rust 编译器
- **cargo**：包管理器和构建工具
- **rustup**：工具链管理器
- **std**：标准库

## 配置开发环境

### 更新工具链
```bash
rustup update
```

### 安装常用组件
```bash
# 代码格式化工具
rustup component add rustfmt

# 代码质量检查工具
rustup component add clippy

# 源码查看工具
rustup component add rust-src

# 文档生成工具
rustup component add rust-docs
```

### 配置工具链
```bash
# 查看已安装的工具链
rustup show

# 安装特定版本
rustup install stable
rustup install nightly

# 设置默认工具链
rustup default stable
```

## IDE 和编辑器推荐

### Visual Studio Code（推荐）

#### 安装插件
1. **rust-analyzer**：语言服务器，提供智能提示
2. **CodeLLDB**：调试器支持
3. **Better TOML**：TOML 文件支持
4. **Error Lens**：错误高亮显示

#### 配置 settings.json
```json
{
    "rust-analyzer.check.command": "clippy",
    "rust-analyzer.cargo.allFeatures": true,
    "rust-analyzer.completion.addCallParentheses": false,
    "rust-analyzer.diagnostics.disabled": ["unresolved-proc-macro"]
}
```

### IntelliJ IDEA / CLion

#### 安装插件
1. **Rust**：JetBrains 官方 Rust 插件
2. **TOML**：TOML 文件支持

### 其他编辑器

#### Vim/Neovim
- **rust.vim**：语法高亮
- **coc-rust-analyzer**：语言服务器

#### Emacs
- **rust-mode**：Rust 模式
- **lsp-mode**：LSP 支持

## 常用工具介绍

### cargo-edit
扩展 Cargo 的功能，添加依赖管理命令。

```bash
# 安装
cargo install cargo-edit

# 使用
cargo add serde           # 添加依赖
cargo rm serde           # 移除依赖
cargo upgrade            # 升级依赖
```

### cargo-watch
监听文件变化并自动重新构建。

```bash
# 安装
cargo install cargo-watch

# 使用
cargo watch -x check      # 监听并检查
cargo watch -x test       # 监听并测试
cargo watch -x run        # 监听并运行
```

### cargo-expand
展开宏代码，用于理解宏的工作原理。

```bash
# 安装
cargo install cargo-expand

# 使用
cargo expand              # 展开所有宏
cargo expand main         # 展开 main 函数中的宏
```

### bacon
快速的后台代码检查工具。

```bash
# 安装
cargo install bacon

# 使用
bacon                     # 启动后台检查
bacon test               # 后台运行测试
```

## 环境变量配置

### 常用环境变量
```bash
# Cargo 配置
export CARGO_HOME="$HOME/.cargo"
export RUSTUP_HOME="$HOME/.rustup"

# 编译器配置
export RUSTC_WRAPPER="sccache"  # 使用 sccache 缓存编译结果
export RUST_LOG="debug"          # 设置日志级别

# 代理配置（如果需要）
export CARGO_HTTP_PROXY="http://proxy:port"
export CARGO_HTTPS_PROXY="https://proxy:port"
```

### 配置 .cargo/config.toml
```toml
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"

# 使用中科大镜像（可选）
[source.ustc]
registry = "https://mirrors.ustc.edu.cn/crates.io-index"

[net]
git-fetch-with-cli = true

[build]
jobs = 4                    # 并行编译任务数
```

## 常见问题解决

### 1. 安装失败
```bash
# 清理安装
rustup self uninstall

# 重新安装
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 权限问题
```bash
# 修复权限
sudo chown -R $(whoami) ~/.cargo
sudo chown -R $(whoami) ~/.rustup
```

### 3. 网络问题
```bash
# 使用代理
export https_proxy=http://proxy:port
export http_proxy=http://proxy:port
```

### 4. 编译缓慢
```bash
# 安装 sccache
cargo install sccache

# 配置环境变量
export RUSTC_WRAPPER=sccache
```

## 验证环境

创建一个简单的测试项目来验证环境：

```bash
# 创建新项目
cargo new hello_rust
cd hello_rust

# 编译项目
cargo build

# 运行项目
cargo run

# 检查代码
cargo check

# 格式化代码
cargo fmt

# 运行 clippy
cargo clippy
```

如果所有命令都能正常执行，说明环境配置成功。

## 性能优化建议

### 1. 使用 sccache
```bash
cargo install sccache
export RUSTC_WRAPPER=sccache
```

### 2. 启用并行编译
```bash
# 在 .cargo/config.toml 中设置
[build]
jobs = 8  # 根据 CPU 核心数调整
```

### 3. 使用 mold 链接器（Linux）
```bash
# 安装 mold
sudo apt install mold

# 配置使用
export RUSTFLAGS="-C link-arg=-fuse-ld=mold"
```

## 总结

正确的环境搭建是学习 Rust 的第一步。建议使用 VSCode + rust-analyzer 的组合，这是目前最受欢迎的开发环境。同时，熟悉 Cargo 工具链和常用插件将大大提高开发效率。

下一节我们将编写第一个 Rust 程序。