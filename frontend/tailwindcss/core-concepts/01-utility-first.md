# 功能类优先

Tailwind CSS 采用功能类优先的设计哲学，与传统的 CSS 框架不同。

## 什么是功能类优先？

功能类优先意味着使用大量的小型、单一用途的 CSS 类直接在 HTML 中构建复杂的用户界面，而不是编写自定义 CSS。

```html
<!-- 传统 CSS 方式 -->
<div class="chat-notification">
  <div class="chat-notification-logo-wrapper">
    <img class="chat-notification-logo" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div class="chat-notification-content">
    <h4 class="chat-notification-title">ChitChat</h4>
    <p class="chat-notification-message">你有一条新消息！</p>
  </div>
</div>

<style>
  .chat-notification {
    display: flex;
    max-width: 24rem;
    margin: 0 auto;
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: #fff;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  .chat-notification-logo-wrapper {
    flex-shrink: 0;
  }
  .chat-notification-logo {
    height: 3rem;
    width: 3rem;
  }
  .chat-notification-content {
    margin-left: 1.5rem;
    padding-top: 0.25rem;
  }
  .chat-notification-title {
    color: #1a202c;
    font-size: 1.25rem;
    line-height: 1.25;
  }
  .chat-notification-message {
    color: #718096;
    font-size: 1rem;
    line-height: 1.5;
  }
</style>
```

```html
<!-- Tailwind CSS 方式 -->
<div class="max-w-sm mx-auto flex p-6 bg-white rounded-lg shadow-xl">
  <div class="flex-shrink-0">
    <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div class="ml-6 pt-1">
    <h4 class="text-xl text-gray-900 leading-tight">ChitChat</h4>
    <p class="text-base text-gray-600">你有一条新消息！</p>
  </div>
</div>
```

## 功能类优先的优势

1. **无需命名** - 不再需要为每个 UI 元素想一个合适的类名
2. **减少 CSS 文件大小** - 不再为每个元素编写自定义 CSS
3. **更改更安全** - 不用担心破坏其他组件的样式
4. **响应式设计更容易** - 使用内置的响应式前缀如 `md:`, `lg:` 等
5. **更容易维护** - 直接在 HTML 中修改样式，而不是在多个文件之间切换

## 何时提取组件

当你在多个地方重复使用相同的功能类组合时，可以考虑使用 Tailwind 的 `@apply` 指令提取组件：

```css
/* 在你的 CSS 文件中 */
.btn-primary {
  @apply py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
```

或者使用 JavaScript 框架的组件系统：

```jsx
// React 组件
function Button({ children }) {
  return (
    <button className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
      {children}
    </button>
  );
}
``` 