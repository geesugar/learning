# Tailwind CSS 项目设置示例

这是一个使用 Tailwind CSS 的示例项目，展示了如何设置和配置 Tailwind CSS。

## 项目结构

```
project-root/
├── src/               # 源代码
│   ├── components/    # React 组件
│   ├── pages/         # 页面
│   ├── App.jsx        # 主应用组件
│   ├── index.css      # 全局 CSS 文件
│   └── main.jsx       # 入口文件
├── public/            # 静态资源
├── tailwind.config.js # Tailwind 配置
├── postcss.config.js  # PostCSS 配置
├── package.json       # 项目依赖
└── vite.config.js     # Vite 配置
```

## 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/tailwind-project.git
cd tailwind-project

# 安装依赖
npm install
```

## 开发

```bash
# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建生产版本
npm run build
```

## Tailwind CSS 配置

该项目使用了自定义的 Tailwind CSS 配置，包括：

- 自定义颜色系统
- 自定义断点
- 自定义字体
- 扩展的间距、边框半径等
- 自定义组件和工具类

查看 `tailwind.config.js` 文件了解详细配置。

## 使用的插件

- [@tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms) - 表单元素样式
- [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) - 排版样式
- [@tailwindcss/aspect-ratio](https://github.com/tailwindlabs/tailwindcss-aspect-ratio) - 宽高比工具
- [@tailwindcss/line-clamp](https://github.com/tailwindlabs/tailwindcss-line-clamp) - 文本截断

## 学习资源

- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/) - 组件和模板
- [Tailwind CSS YouTube 频道](https://www.youtube.com/tailwindlabs) 