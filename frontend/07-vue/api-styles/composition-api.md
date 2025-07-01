# Vue 3 组合式 API

组合式 API (Composition API) 是 Vue 3 引入的一种新的编写组件逻辑的方式，它主要解决了 Vue 2 中使用选项式 API 在处理复杂组件时的一些限制。

## 为什么需要组合式 API

### 选项式 API 的限制

在 Vue 2 中，组件逻辑主要通过选项式 API 组织，如 `data`、`methods`、`computed` 等选项。随着组件变得复杂，相关联的逻辑会分散在不同的选项中，导致：

1. **逻辑分散**：相同功能的代码被拆分到不同选项中
2. **代码复用困难**：难以提取和重用逻辑
3. **TypeScript支持不佳**：类型推导有限

### 组合式 API 的优势

1. **按功能组织代码**：相关逻辑可以放在一起
2. **更好的逻辑复用**：通过组合函数轻松复用逻辑
3. **更好的类型推导**：对 TypeScript 友好
4. **更小的生产包体积**：通过摇树优化

## 核心概念

### setup 函数

`setup` 函数是组合式 API 的入口点，在组件被创建之前执行，所以它不能访问 `this`。

```javascript
export default {
  setup() {
    // 这里编写组合式 API 代码
    
    // 返回一个对象，其属性会被暴露给模板
    return {
      // ...
    }
  }
}
```

### `<script setup>` 语法糖

Vue 3.2 引入了更简洁的 `<script setup>` 语法：

```vue
<script setup>
// 导入的组件自动注册
import { ref, computed, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 声明的变量自动暴露给模板
const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div>
    <p>Count: {{ count }}, Double: {{ double }}</p>
    <button @click="increment">Increment</button>
    <ChildComponent />
  </div>
</template>
```

## 响应式核心 API

### ref

创建一个响应式的引用，适用于基本类型值：

```javascript
import { ref } from 'vue'

const count = ref(0)  // 创建值为0的响应式引用

// 修改值需要使用 .value
function increment() {
  count.value++
}

// 在模板中使用时不需要 .value
// <div>{{ count }}</div>
```

### reactive

创建一个响应式对象，适用于对象类型：

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// 直接修改属性
function increment() {
  state.count++
}

// 在模板中使用
// <div>{{ state.count }}</div>
```

### computed

创建计算属性：

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// 只读计算属性
const doubleCount = computed(() => count.value * 2)

// 可写计算属性
const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
```

### watch 和 watchEffect

监听响应式数据变化：

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 监听单个数据源
watch(count, (newValue, oldValue) => {
  console.log(`count 从 ${oldValue} 变为 ${newValue}`)
}, { deep: true, immediate: true })

// 监听多个数据源
watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log(`count: ${oldCount} -> ${newCount}, message: ${oldMessage} -> ${newMessage}`)
})

// 自动追踪依赖并执行回调
watchEffect(() => {
  console.log(`count: ${count.value}, message: ${message.value}`)
})
```

## 生命周期钩子

组合式 API 中的生命周期钩子与选项式 API 对应关系：

| 选项式 API       | 组合式 API        |
|-----------------|-------------------|
| beforeCreate    | setup() 本身       |
| created         | setup() 本身       |
| beforeMount     | onBeforeMount     |
| mounted         | onMounted         |
| beforeUpdate    | onBeforeUpdate    |
| updated         | onUpdated         |
| beforeUnmount   | onBeforeUnmount   |
| unmounted       | onUnmounted       |
| errorCaptured   | onErrorCaptured   |
| renderTracked   | onRenderTracked   |
| renderTriggered | onRenderTriggered |
| activated       | onActivated       |
| deactivated     | onDeactivated     |

使用示例：

```javascript
import { onMounted, onBeforeUnmount } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onBeforeUnmount(() => {
      console.log('组件即将卸载')
    })
  }
}
```

## 依赖注入

提供跨组件通信的能力：

```javascript
// 父组件
import { provide, ref } from 'vue'

export default {
  setup() {
    const theme = ref('dark')
    
    // 提供给后代组件
    provide('theme', theme)
    
    return { theme }
  }
}

// 后代组件
import { inject } from 'vue'

export default {
  setup() {
    // 注入祖先组件提供的值
    const theme = inject('theme', 'light') // 第二个参数是默认值
    
    return { theme }
  }
}
```

## 组合函数 (Composables)

组合式 API 的一个主要优势是能够创建可复用的组合函数：

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  }
}

// 在组件中使用
import { useCounter } from './useCounter'

export default {
  setup() {
    const { count, doubleCount, increment, decrement } = useCounter(10)
    
    return {
      count,
      doubleCount,
      increment,
      decrement
    }
  }
}
```

## 对比选项式 API 的同一个示例

### 选项式 API

```javascript
export default {
  data() {
    return {
      count: 0,
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    },
    fullName() {
      return this.firstName + ' ' + this.lastName
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('组件已挂载')
  },
  beforeUnmount() {
    console.log('组件即将卸载')
  }
}
```

### 组合式 API（使用 `<script setup>`）

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const count = ref(0)
const firstName = ref('John')
const lastName = ref('Doe')

const doubleCount = computed(() => count.value * 2)
const fullName = computed(() => firstName.value + ' ' + lastName.value)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})

onBeforeUnmount(() => {
  console.log('组件即将卸载')
})
</script>
```

## 最佳实践

1. **优先使用 `<script setup>`**：它更简洁且性能更好
2. **使用 ref() 还是 reactive()**：
   - 对基本类型值使用 ref()
   - 对对象类型可使用 reactive()，但 ref() 更通用
3. **解构响应性**：
   - reactive() 的解构会丢失响应性
   - 使用 toRefs() 或 toRef() 保持响应性
4. **按功能组织代码**：相关逻辑放在一起
5. **封装可复用逻辑**：使用组合函数

## 常见问题

1. **ref 值需要 .value**：在 JavaScript 中访问和修改 ref 值需要使用 .value，但在模板中会自动解包
2. **响应性丢失**：解构 reactive 对象或将其属性传递给函数会导致响应性丢失
3. **深层响应性**：reactive 默认是深层响应式的，而 ref 对其 value 也是深层响应式的

## 总结

组合式 API 提供了一种更灵活、更强大的组织组件逻辑的方式。它允许开发者按功能组织代码，更好地重用逻辑，并提供更好的 TypeScript 类型支持。虽然学习曲线略陡，但它为构建复杂的应用提供了更好的可维护性和扩展性。 