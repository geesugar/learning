# 自定义设计系统

Tailwind CSS 的强大之处在于它高度可定制的特性，允许你创建自己的设计系统。

## 配置文件

Tailwind 的自定义主要通过 `tailwind.config.js` 文件完成。如果你还没有这个文件，可以通过以下命令生成：

```bash
npx tailwindcss init
```

生成的基本配置文件如下：

```js
// tailwind.config.js
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 主题配置

`theme` 对象是自定义设计系统的核心，你可以在这里定义颜色、间距、字体等：

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // 自定义颜色
      primary: '#3490dc',
      secondary: '#ffed4a',
      danger: '#e3342f',
      // 继承一些默认颜色
      gray: {
        100: '#f7fafc',
        // ...其他灰色
        900: '#1a202c',
      },
    },
    spacing: {
      // 自定义间距比例
      '1': '8px',
      '2': '12px',
      '3': '16px',
      '4': '24px',
      '5': '32px',
      '6': '48px',
    },
    fontFamily: {
      // 自定义字体系列
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    // ...其他主题设置
  }
}
```

## 扩展现有主题

如果你只想添加一些自定义值而不完全替换默认设置，可以使用 `extend` 选项：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // 保留默认配置，只添加新的值
      colors: {
        brand: {
          light: '#f9fafb',
          DEFAULT: '#3490dc',
          dark: '#2779bd',
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    }
  }
}
```

## 自定义变体

你可以自定义响应式断点、状态变体和其他变体：

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
    },
  },
  variants: {
    extend: {
      // 为特定功能启用额外的变体
      backgroundColor: ['active', 'disabled'],
      opacity: ['disabled'],
    }
  }
}
```

## 创建插件

对于更复杂的定制，你可以创建 Tailwind 插件：

```js
// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, e, prefix, config }) {
      // 添加自定义功能类
      const newUtilities = {
        '.rotate-45': {
          transform: 'rotate(45deg)',
        },
        '.rotate-90': {
          transform: 'rotate(90deg)',
        },
        // ...
      }
      addUtilities(newUtilities)
      
      // 添加组件类
      const buttons = {
        '.btn': {
          padding: `${config('theme.spacing.2')} ${config('theme.spacing.4')}`,
          borderRadius: config('theme.borderRadius.md'),
          fontWeight: config('theme.fontWeight.bold'),
        },
        '.btn-blue': {
          backgroundColor: config('theme.colors.blue.500'),
          color: '#fff',
          '&:hover': {
            backgroundColor: config('theme.colors.blue.600')
          },
        },
        // ...
      }
      addComponents(buttons)
    }),
  ]
}
```

## 使用预处理器变量

如果你使用 SCSS、Less 或 Stylus，你可以在这些预处理器中使用 Tailwind 的配置值：

```scss
// SCSS 文件
@layer base {
  :root {
    --color-primary: #{theme('colors.blue.500')};
  }
}

.custom-element {
  color: var(--color-primary);
}
```

## 设计系统示例

以下是一个完整设计系统配置的例子：

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      secondary: {
        // ...颜色值
      },
      // ...其他颜色
    },
    fontFamily: {
      sans: ['Inter var', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      mono: ['Menlo', 'monospace'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      // ...其他字体大小
    },
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      'DEFAULT': '0.25rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'full': '9999px',
    },
    // ...其他主题设置
  },
  plugins: [
    // ...插件
  ],
}
``` 