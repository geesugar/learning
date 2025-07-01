# Pinia 状态管理

Pinia 是 Vue 的官方状态管理库，为 Vue 3 设计，是 Vuex 的后继者，提供更简单直观的 API 和完整的 TypeScript 支持。

## Pinia vs Vuex

相比 Vuex，Pinia 有多项优势：

1. **更轻量**：打包后仅约 1KB
2. **更简单的 API**：无需 mutations，可以直接修改状态
3. **支持多个 Store**：不需要使用模块嵌套
4. **完整的 TypeScript 支持**：自动推断类型
5. **开发工具支持**：与 Vue DevTools 集成
6. **无需命名空间**：扁平的设计，无需命名空间嵌套
7. **与组合式 API 紧密集成**：设计更符合 Vue 3 的使用方式

## 安装

```bash
# npm
npm install pinia

# yarn
yarn add pinia

# pnpm
pnpm add pinia
```

## 配置 Pinia

在 Vue 应用中加载 Pinia：

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

## 创建 Store

使用 `defineStore()` 创建 store。Pinia 支持两种风格：选项式（类似 Vuex）和组合式（类似 Vue 组合式 API）。

### 选项式 Store

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态：相当于 Vuex 中的 state
  state: () => ({
    count: 0,
    name: 'Eduardo',
    isAdmin: true,
  }),
  
  // getter：相当于 Vuex 中的 getters
  getters: {
    doubleCount: (state) => state.count * 2,
    // 使用 this 访问其它 getter 时，必须明确返回类型
    doubleCountPlusOne() {
      return this.doubleCount + 1
    },
  },
  
  // actions：相当于 Vuex 中的 actions 和 mutations 的结合
  actions: {
    increment() {
      this.count++
    },
    randomizeCounter() {
      this.count = Math.round(Math.random() * 100)
    },
    async fetchData() {
      // 可以直接在 action 中包含异步操作
      const response = await fetch('/api/data')
      const data = await response.json()
      this.count = data.count
    }
  }
})
```

### 组合式 Store

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // ref() 相当于 state
  const count = ref(0)
  const name = ref('Eduardo')
  const isAdmin = ref(true)
  
  // computed() 相当于 getters
  const doubleCount = computed(() => count.value * 2)
  
  // 函数相当于 actions
  function increment() {
    count.value++
  }
  
  function randomizeCounter() {
    count.value = Math.round(Math.random() * 100)
  }
  
  async function fetchData() {
    const response = await fetch('/api/data')
    const data = await response.json()
    count.value = data.count
  }
  
  // 返回需要暴露的状态和方法
  return {
    count,
    name,
    isAdmin,
    doubleCount,
    increment,
    randomizeCounter,
    fetchData
  }
})
```

## 使用 Store

### 在组件中使用

```vue
<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double Count: {{ counter.doubleCount }}</p>
    <button @click="counter.increment()">Increment</button>
    <button @click="counter.randomizeCounter()">Randomize</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

// 获取 store 实例
const counter = useCounterStore()

// 也可以解构，但需要 storeToRefs 保持响应性
// import { storeToRefs } from 'pinia'
// const { count, doubleCount } = storeToRefs(counter)
// const { increment, randomizeCounter } = counter
</script>
```

### 在组合式 API 中解构

当需要从 store 中解构属性时，必须使用 `storeToRefs()` 函数以保持响应性：

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()

// 解构状态和 getter，保持响应性
const { count, doubleCount } = storeToRefs(store)

// 动作可以直接解构
const { increment, randomizeCounter } = store
</script>
```

## 状态管理

### 访问状态

直接通过 store 实例访问状态：

```javascript
const store = useCounterStore()
console.log(store.count) // 访问状态
```

### 修改状态

在 Pinia 中，可以通过以下方式修改状态：

1. **使用 action**
   ```javascript
   store.increment()
   ```

2. **直接修改状态**（与 Vuex 不同，Pinia 允许这样做）
   ```javascript
   store.count++
   ```

3. **使用 $patch**：批量修改多个状态（推荐）
   ```javascript
   // 方法一：传入对象
   store.$patch({
     count: store.count + 1,
     name: 'John',
   })
   
   // 方法二：传入函数（对复杂状态更有用）
   store.$patch((state) => {
     state.count++
     state.items.push({ name: 'item' })
   })
   ```

4. **替换整个状态**（不推荐）
   ```javascript
   store.$state = { count: 10, name: 'John', isAdmin: true }
   ```

### 重置状态

可以使用 `$reset()` 将状态重置为初始值（仅适用于选项式 store）：

```javascript
const store = useCounterStore()
store.$reset()
```

## Getters

Getters 类似于组件中的计算属性，可以缓存结果并在依赖变化时自动重新计算。

### 访问其它 Getter

在 getter 中可以使用 `this` 访问同一 store 中的其它 getter：

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    // 使用 this 访问其它 getter
    doubleCountPlusOne() {
      return this.doubleCount + 1
    },
  },
})
```

### 访问其它 Store

Getter 也可以使用其它 store 中的状态和 getter：

```javascript
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  getters: {
    userCartItems() {
      const userStore = useUserStore()
      return this.items.filter(item => item.userId === userStore.id)
    }
  }
})
```

### 传递参数给 Getter

Getter 本身不接受参数，但可以返回一个接受参数的函数：

```javascript
export const useStore = defineStore('store', {
  getters: {
    // 返回一个函数，接受参数
    getItemById: (state) => {
      return (itemId) => state.items.find((item) => item.id === itemId)
    },
  },
})
```

```javascript
// 使用
const store = useStore()
const item = store.getItemById(2)
```

## Actions

Actions 相当于组件中的方法，可以包含异步操作，可以直接修改状态。

### 同步 Actions

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    // 同步 action
    increment() {
      this.count++
    },
    incrementBy(amount) {
      this.count += amount
    },
  },
})
```

### 异步 Actions

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    userData: null,
    loading: false,
    error: null
  }),
  actions: {
    // 异步 action
    async fetchUserData(userId) {
      this.userData = null
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch user data')
        
        const data = await response.json()
        this.userData = data
      } catch (error) {
        this.error = error.message || 'Unknown error'
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 在 Actions 中调用其它 Actions

可以使用 `this` 在同一 store 的 action 中调用其它 action：

```javascript
export const useUserStore = defineStore('user', {
  actions: {
    async registerAndLogin(credentials) {
      await this.register(credentials)
      await this.login(credentials)
    },
    async register(credentials) {
      // 注册逻辑
    },
    async login(credentials) {
      // 登录逻辑
    }
  }
})
```

### 在不同 Store 之间调用 Actions

```javascript
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  actions: {
    async checkout() {
      const authStore = useAuthStore()
      
      if (!authStore.isLoggedIn) {
        // 重定向到登录页
        return false
      }
      
      // 结账逻辑
      return true
    }
  }
})
```

## 插件

Pinia 支持插件系统来扩展 store 的功能。

### 创建插件

```javascript
// plugins/myPiniaPlugin.js
export function myPiniaPlugin({ pinia, app, store, options }) {
  // pinia: Pinia 实例
  // app: Vue 应用实例（如果可用）
  // store: 当前正在配置的 store
  // options: defineStore() 的选项参数
  
  // 为每个 store 添加属性
  store.myValue = 'This comes from a plugin'
  
  // 添加方法
  store.myMethod = () => {
    console.log('This method is added by a plugin')
  }
  
  // 订阅状态变化
  store.$subscribe((mutation, state) => {
    // 每当状态变化，将应用于所有 store
    console.log('State changed:', mutation)
  })
  
  // 订阅 actions
  store.$onAction(({ name, args, after, onError }) => {
    // 当一个 action 被调用时
    console.log(`Action ${name} was called with args:`, args)
    
    after((result) => {
      // action 执行完毕
      console.log(`Action ${name} finished with result:`, result)
    })
    
    onError((error) => {
      // action 抛出错误
      console.error(`Action ${name} failed with error:`, error)
    })
  })
}
```

### 使用插件

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { myPiniaPlugin } from './plugins/myPiniaPlugin'

const pinia = createPinia()
// 添加插件
pinia.use(myPiniaPlugin)

const app = createApp(App)
app.use(pinia)
app.mount('#app')
```

### 持久化插件示例

使用本地存储持久化 store 数据的插件示例：

```javascript
// plugins/persistedState.js
import { toRaw } from 'vue'

export function createPersistedState(options = {}) {
  const { key = 'pinia', storage = localStorage } = options
  
  return ({ store }) => {
    // 从存储中恢复状态
    const savedState = storage.getItem(key + '-' + store.$id)
    if (savedState) {
      store.$patch(JSON.parse(savedState))
    }
    
    // 订阅状态变化，保存到存储
    store.$subscribe(
      (mutation, state) => {
        // 使用 toRaw 去除代理，避免循环引用
        storage.setItem(key + '-' + store.$id, JSON.stringify(toRaw(state)))
      },
      { detached: true } // 组件卸载时保持订阅
    )
  }
}
```

```javascript
// main.js
import { createPersistedState } from './plugins/persistedState'

const pinia = createPinia()
pinia.use(createPersistedState({
  key: 'my-app',  // 存储键前缀
  storage: sessionStorage  // 也可以使用 sessionStorage
}))
```

## Pinia 与 TypeScript

Pinia 对 TypeScript 有优秀的支持。

### 类型推断

在 Pinia 中，大多数类型都会自动推断：

```typescript
// 大多数类型会自动推断
const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Eduardo',
    isAdmin: true,
    items: [] as string[],  // 数组需要类型标注
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },
})

// 使用时类型完全推断
const store = useCounterStore()
store.count // number
store.name  // string
```

### 复杂类型的处理

对于更复杂的类型，可以使用接口显式定义 state：

```typescript
interface User {
  id: number
  name: string
  email: string
}

interface State {
  users: User[]
  activeUser: User | null
}

export const useUserStore = defineStore('users', {
  state: (): State => ({
    users: [],
    activeUser: null,
  }),
})
```

### 组合式 Store 中的类型

在组合式 Store 中，类型通常由 Vue 的响应式 API 推断：

```typescript
export const useCounterStore = defineStore('counter', () => {
  // 类型从初始值推断
  const count = ref(0)
  const name = ref('Eduardo')
  
  // 可以显式标注类型
  const users = ref<User[]>([])
  const activeUser = ref<User | null>(null)
  
  // 计算属性类型会自动推断
  const doubleCount = computed(() => count.value * 2)
  
  // 函数返回类型也会自动推断
  function increment() {
    count.value++
  }
  
  return {
    count,
    name,
    users,
    activeUser,
    doubleCount,
    increment,
  }
})
```

## 高级用法

### 共享 Composition 函数

可以在不同 store 之间复用逻辑，通过创建可复用的 composition 函数：

```javascript
// composables/useSearch.js
import { ref, computed } from 'vue'

export function useSearch(items, searchProp = 'name') {
  const searchQuery = ref('')
  
  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase()
    
    if (!query) return items.value
    
    return items.value.filter(item => 
      item[searchProp].toLowerCase().includes(query)
    )
  })
  
  return {
    searchQuery,
    filteredItems
  }
}
```

然后在 store 中使用：

```javascript
// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSearch } from '@/composables/useSearch'

export const useUserStore = defineStore('users', () => {
  const users = ref([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ])
  
  // 使用共享的搜索逻辑
  const { searchQuery, filteredItems: filteredUsers } = useSearch(users)
  
  return {
    users,
    searchQuery,
    filteredUsers
  }
})
```

### Hot Module Replacement

Pinia 支持热模块替换（HMR），可以在不刷新页面的情况下更新 store：

```javascript
// store/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  // ...
})

// 启用热模块替换
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}
```

### 订阅状态变化

可以通过 `$subscribe` 来监听状态变化，类似于 Vuex 的 subscribe：

```javascript
const unsubscribe = store.$subscribe((mutation, state) => {
  // mutation: { type, storeId, events }
  // 'direct' | 'patch object' | 'patch function'
  
  // 每当状态变化时触发
  console.log('State changed:', mutation.type)
  
  // 比如可以将变化同步到本地存储
  localStorage.setItem('counter', JSON.stringify(state))
}, { detached: false }) // detached: true 在组件卸载时保持订阅

// 手动取消订阅
unsubscribe()
```

### 订阅 Actions

可以使用 `$onAction` 来监听 action 的调用：

```javascript
const unsubscribe = store.$onAction(
  ({
    name, // action 名称
    store, // store 实例
    args, // 传递给 action 的参数数组
    after, // 在 action 返回或解析后的钩子
    onError, // action 抛出或拒绝的钩子
  }) => {
    const startTime = Date.now()
    console.log(`Action ${name} started.`)
    
    // 在 action 成功完成后触发
    after((result) => {
      console.log(`Action ${name} completed in ${Date.now() - startTime}ms with result:`, result)
    })
    
    // 如果 action 抛出错误或返回拒绝的 promise
    onError((error) => {
      console.error(`Action ${name} failed with error:`, error)
    })
  },
  { detached: false } // detached: true 在组件卸载时保持订阅
)

// 手动取消订阅
unsubscribe()
```

## 与 Vuex 迁移

从 Vuex (尤其是 Vuex 4) 迁移到 Pinia 相对简单：

1. **State** 几乎相同
2. **Getters** 从带有 state 参数的函数变为可以使用 this 的函数
3. **Mutations** 在 Pinia 中不存在，直接在 Actions 中修改状态
4. **Actions** 保持不变，但现在可以使用 this 访问整个 store
5. **Modules** 不再需要，每个 store 可以看作一个独立的模块

## 最佳实践

1. **为每个功能创建一个 Store**：而不是创建单个巨大的 store。
2. **使用组合式 Store 风格**：对于 Vue 3 应用，组合式风格更符合组合式 API 的使用习惯。
3. **处理异步操作**：在 actions 中处理所有异步操作。
4. **使用 $patch 批量更新**：当需要更新多个状态时，使用 $patch 提高性能。
5. **使用 storeToRefs 解构**：在组件中解构 store 属性时，使用 storeToRefs 保持响应性。
6. **保持 Store 的纯粹**：避免在 Store 中引用 DOM 或特定于 UI 的状态。
7. **合理使用插件**：使用插件添加跨越所有 store 的通用功能。

## 总结

Pinia 提供了一个简单、直观且类型安全的状态管理解决方案，特别适合 Vue 3 应用。相比 Vuex，它提供了更好的开发体验和性能。主要优势包括：

- 更简单的 API
- 与 TypeScript 配合良好
- 支持组合式 API
- 无需 mutations，可直接修改状态
- 更好的性能
- 良好的开发工具支持

Pinia 是现代 Vue 应用的首选状态管理解决方案，被 Vue 核心团队推荐为 Vuex 的后继者。 