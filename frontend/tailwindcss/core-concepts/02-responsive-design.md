# 响应式设计

Tailwind CSS 提供了一种简单而强大的方式来构建响应式界面，无需编写自定义媒体查询。

## 响应式前缀

Tailwind 默认包含5个断点：

- `sm`: 640px 及以上
- `md`: 768px 及以上
- `lg`: 1024px 及以上
- `xl`: 1280px 及以上
- `2xl`: 1536px 及以上

使用这些前缀，可以轻松地指定在不同屏幕尺寸下应用不同的样式：

```html
<!-- 移动端优先：默认宽度100%，中等屏幕50%，大屏幕33.333% -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 内容 -->
</div>
```

## 移动端优先

Tailwind 采用移动端优先的方法，这意味着没有响应式前缀的功能类将应用于所有屏幕尺寸，而带前缀的类则在达到指定的断点时覆盖这些样式。

```html
<!-- 默认堆叠布局，从中等屏幕开始使用网格布局 -->
<div class="flex flex-col md:flex-row">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

## 自定义断点

你可以在 `tailwind.config.js` 中自定义断点：

```js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // 添加自定义断点
      'tablet': '992px',
      'desktop': '1200px',
    },
  },
}
```

## 最大宽度断点

如果你需要针对最大宽度而不是最小宽度设计，可以使用 `max-` 前缀：

```js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      // 添加最大宽度断点
      'max-md': {'max': '767px'},
      'max-lg': {'max': '1023px'},
    },
  },
}
```

然后这样使用：

```html
<!-- 仅在小于md断点的屏幕上显示 -->
<div class="max-md:block hidden">仅在移动设备显示</div>
```

## 响应式设计示例

一个常见的响应式导航栏示例：

```html
<!-- 移动端显示汉堡菜单，桌面端显示水平菜单 -->
<nav class="bg-gray-800 text-white p-4">
  <div class="flex justify-between items-center">
    <div class="text-xl font-bold">Logo</div>
    
    <!-- 移动端汉堡菜单按钮 -->
    <button class="md:hidden">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
    
    <!-- 桌面端水平菜单 -->
    <div class="hidden md:flex space-x-4">
      <a href="#" class="hover:text-gray-300">首页</a>
      <a href="#" class="hover:text-gray-300">关于</a>
      <a href="#" class="hover:text-gray-300">服务</a>
      <a href="#" class="hover:text-gray-300">联系我们</a>
    </div>
  </div>
  
  <!-- 移动端下拉菜单 (这里简化了，实际应用中需要JavaScript控制显示/隐藏) -->
  <div class="mt-2 md:hidden">
    <a href="#" class="block py-2 hover:bg-gray-700">首页</a>
    <a href="#" class="block py-2 hover:bg-gray-700">关于</a>
    <a href="#" class="block py-2 hover:bg-gray-700">服务</a>
    <a href="#" class="block py-2 hover:bg-gray-700">联系我们</a>
  </div>
</nav>
``` 