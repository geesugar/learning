# 暗黑模式

Tailwind CSS 自 v2.0 起提供内置的暗黑模式支持，让你能够轻松为应用程序构建暗色主题界面。

## 启用暗黑模式

默认情况下，暗黑模式已经启用。如果你需要自定义配置，可以在 `tailwind.config.js` 中进行：

```js
// tailwind.config.js
module.exports = {
  darkMode: 'media', // 或 'class'
  // ...其他配置
}
```

有两种方式启用暗黑模式：

1. **媒体查询（media）**: 根据操作系统/浏览器偏好自动切换
2. **类名（class）**: 手动通过添加 `.dark` 类到 `html` 或 `body` 元素来切换

## 使用暗黑模式变体

使用 `dark:` 前缀为元素添加暗黑模式样式：

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <!-- 内容在亮色模式下有白色背景和深色文本，在暗色模式下有深色背景和白色文本 -->
</div>
```

## 手动切换暗黑模式

如果你设置 `darkMode: 'class'`，你需要使用 JavaScript 手动切换类名：

```html
<!-- HTML -->
<button id="theme-toggle">切换主题</button>
```

```js
// JavaScript
const themeToggleBtn = document.getElementById('theme-toggle');

themeToggleBtn.addEventListener('click', () => {
  // 切换暗黑模式
  document.documentElement.classList.toggle('dark');
  
  // 可选：保存用户偏好到 localStorage
  if (document.documentElement.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// 检查用户之前的偏好
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```

## 响应式 + 暗黑模式组合

暗黑模式变体可以与其他变体组合使用：

```html
<div class="bg-white dark:bg-gray-800 md:bg-gray-100 md:dark:bg-gray-900">
  <!-- 响应式 + 暗黑模式组合 -->
</div>
```

## 暗黑模式组件示例

以下是一个卡片组件在明暗模式下的样式：

```html
<div class="max-w-sm mx-auto overflow-hidden rounded-xl shadow-md bg-white dark:bg-gray-800 transition-colors duration-200">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img class="h-48 w-full object-cover md:h-full md:w-48" src="/img/building.jpg" alt="建筑">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 dark:text-indigo-400 font-semibold">公司简介</div>
      <a href="#" class="block mt-1 text-lg leading-tight font-medium text-black dark:text-white hover:underline">
        了解我们如何改变城市景观
      </a>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        通过我们创新的设计和可持续发展原则，我们正在改变人们与建筑互动的方式。
      </p>
      <button class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200">
        了解更多
      </button>
    </div>
  </div>
</div>
```

## 暗黑模式最佳实践

1. **避免使用绝对颜色** - 使用 Tailwind 的颜色系统，如 `gray-800` 而不是 `#1a202c`
2. **提供足够对比度** - 确保文本和背景之间有足够的对比度
3. **柔和的过渡** - 添加过渡效果使模式切换更加平滑
4. **注意图片和媒体** - 考虑在暗黑模式下调整图片的不透明度或使用不同的图片
5. **记住用户偏好** - 保存用户的偏好设置到 localStorage 