# Vuex 状态管理

Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式 + 库**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 为什么需要 Vuex

当我们的应用遇到**多个组件共享状态**时，单向数据流的简洁性很容易被破坏：

- 多个视图依赖于同一状态
- 来自不同视图的行为需要变更同一状态

对于这些问题，可以通过以下方式解决：

1. 对于简单的场景，使用 [props 和事件](https://v3.cn.vuejs.org/guide/component-basics.html)
2. 对于跨多层组件的状态共享，使用 [provide/inject](https://v3.cn.vuejs.org/guide/component-provide-inject.html)
3. 对于复杂的状态管理需求，使用 Vuex

## Vuex 核心概念

### State（状态）

Vuex 使用**单一状态树**，即一个对象包含全部的应用层级状态。

```javascript
// store.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0,
      todos: [
        { id: 1, text: '学习 Vue', done: true },
        { id: 2, text: '学习 Vuex', done: false }
      ]
    }
  }
})
```

在组件中获取状态：

```javascript
// 选项式 API
export default {
  computed: {
    count() {
      return this.$store.state.count
    }
  }
}

// 组合式 API
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    const count = computed(() => store.state.count)
    
    return { count }
  }
}
```

### Getters（获取器）

Vuex 允许我们在 store 中定义"getters"，类似于 Vue 中的计算属性。

```javascript
const store = createStore({
  state() {
    return {
      todos: [
        { id: 1, text: '学习 Vue', done: true },
        { id: 2, text: '学习 Vuex', done: false }
      ]
    }
  },
  getters: {
    doneTodos(state) {
      return state.todos.filter(todo => todo.done)
    },
    // 接受其他 getter 作为第二个参数
    doneTodosCount(state, getters) {
      return getters.doneTodos.length
    },
    // 返回一个函数，以便传递参数
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    }
  }
})
```

在组件中使用 getters：

```javascript
// 选项式 API
export default {
  computed: {
    doneTodosCount() {
      return this.$store.getters.doneTodosCount
    },
    // 使用方法风格的访问方式
    getTodoById() {
      return this.$store.getters.getTodoById(2)
    }
  }
}

// 组合式 API
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    const doneTodosCount = computed(() => store.getters.doneTodosCount)
    const todo = computed(() => store.getters.getTodoById(2))
    
    return { doneTodosCount, todo }
  }
}
```

### Mutations（变更）

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。

```javascript
const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    // 没有负载
    increment(state) {
      state.count++
    },
    // 有负载
    incrementBy(state, payload) {
      state.count += payload.amount
    }
  }
})
```

提交 mutation：

```javascript
// 提交没有负载的 mutation
store.commit('increment')

// 提交有负载的 mutation
store.commit('incrementBy', { amount: 10 })

// 或使用对象风格的提交方式
store.commit({
  type: 'incrementBy',
  amount: 10
})
```

**注意事项**：

1. Mutation 必须是同步函数
2. 通常使用常量替代 Mutation 类型

```javascript
// mutation-types.js
export const INCREMENT = 'INCREMENT'

// store.js
import { INCREMENT } from './mutation-types'

const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    [INCREMENT](state) {
      state.count++
    }
  }
})
```

### Actions（动作）

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态
- Action 可以包含任意异步操作

```javascript
const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    // 简单的 action
    increment(context) {
      context.commit('increment')
    },
    // 使用参数解构简化代码
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    },
    // 异步 action 示例
    async actionA({ commit }) {
      commit('gotData', await getData())
    },
    async actionB({ dispatch, commit }) {
      await dispatch('actionA') // 等待 actionA 完成
      commit('gotOtherData', await getOtherData())
    }
  }
})
```

分发 action：

```javascript
// 分发简单的 action
store.dispatch('increment')

// 分发带参数的 action
store.dispatch('incrementAsync', { amount: 10 })

// 使用对象风格的分发方式
store.dispatch({
  type: 'incrementAsync',
  amount: 10
})
```

### Modules（模块）

Vuex 允许我们将 store 分割成**模块**，每个模块拥有自己的 state、mutation、action、getter。

```javascript
const moduleA = {
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },
  actions: {
    incrementIfOdd({ state, commit }) {
      if ((state.count + 1) % 2 === 0) {
        commit('increment')
      }
    }
  }
}

const moduleB = {
  state() {
    return {
      message: 'hello'
    }
  },
  mutations: {
    setMessage(state, payload) {
      state.message = payload
    }
  }
}

const store = createStore({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

// 使用模块中的状态
store.state.a.count     // -> moduleA 的状态
store.state.b.message   // -> moduleB 的状态
```

#### 命名空间

默认情况下，模块内部的 action 和 mutation 仍然是注册在**全局命名空间**的。可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块。

```javascript
const store = createStore({
  modules: {
    account: {
      namespaced: true,
      state() { return { /* ... */ } },
      getters: {
        isAdmin() { /* ... */ } // -> getters['account/isAdmin']
      },
      actions: {
        login() { /* ... */ }   // -> dispatch('account/login')
      },
      mutations: {
        login() { /* ... */ }   // -> commit('account/login')
      },
      // 嵌套模块
      modules: {
        // 继承父模块的命名空间
        myPage: {
          state() { return { /* ... */ } },
          getters: {
            profile() { /* ... */ } // -> getters['account/profile']
          }
        }
      }
    }
  }
})
```

## 辅助函数

Vuex 提供了一些辅助函数简化在组件中使用 Vuex。

### mapState

```javascript
import { mapState } from 'vuex'

export default {
  computed: {
    // 使用对象展开运算符将此对象混入到外部对象中
    ...mapState({
      // 箭头函数可使代码更简练
      count: state => state.count,
      // 传字符串参数 'count' 等同于 `state => state.count`
      countAlias: 'count',
      // 为了能够使用 `this` 获取局部状态，必须使用常规函数
      countPlusLocalState(state) {
        return state.count + this.localCount
      }
    }),
    // 映射 this.count 为 store.state.count
    ...mapState(['count', 'todos'])
  }
}
```

### mapGetters

```javascript
import { mapGetters } from 'vuex'

export default {
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter',
    ]),
    // 将 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
    ...mapGetters({
      doneCount: 'doneTodosCount'
    })
  }
}
```

### mapMutations

```javascript
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`
      // `mapMutations` 也支持负载：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

### mapActions

```javascript
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

## 组合式 API 中使用 Vuex

在 Vue 3 的组合式 API 中使用 Vuex：

```javascript
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    
    // 状态
    const count = computed(() => store.state.count)
    
    // getter
    const doubleCount = computed(() => store.getters.doubleCount)
    
    // mutation
    function increment() {
      store.commit('increment')
    }
    
    // action
    function incrementAsync() {
      store.dispatch('incrementAsync')
    }
    
    return {
      count,
      doubleCount,
      increment,
      incrementAsync
    }
  }
}
```

## 最佳实践

### 项目结构

对于大型应用，推荐的 Vuex 项目结构：

```
├── index.html
├── main.js
├── api
│   └── ...                   # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── index.js              # 我们组装模块并导出 store 的地方
    ├── actions.js            # 根级别的 action
    ├── mutations.js          # 根级别的 mutation
    └── modules
        ├── cart.js           # 购物车模块
        └── products.js       # 产品模块
```

### 一些建议

1. **提交 Mutation 是修改状态的唯一方法**
2. **在开发环境启用严格模式**，保证所有状态变更都通过 mutation
3. **使用常量管理 Mutation 类型**，避免魔法字符串
4. **适当拆分模块**，避免单个模块过于臃肿
5. **将异步逻辑置于 Action 中**

## 插件系统

Vuex 提供了一个插件系统，允许开发者以一种可插拔的方式为 Vuex 添加功能。

### 持久化状态

```javascript
// 简单的本地存储插件
const localStoragePlugin = store => {
  // 当 store 初始化后调用
  store.subscribe((mutation, state) => {
    // 每次 mutation 之后调用
    // 为了保证状态不会太大，可以选择性的持久化
    localStorage.setItem('vuex-state', JSON.stringify(state))
  })
}

const store = createStore({
  // ...
  plugins: [localStoragePlugin]
})
```

### 内置 Logger 插件

Vuex 提供了一个内置的日志插件：

```javascript
import { createLogger } from 'vuex'

const store = createStore({
  // ...
  plugins: [createLogger()]
})
```

## Vuex 与 Vue 3

Vuex 4.x 是为 Vue 3 设计的版本，保持了与 Vuex 3.x 相同的 API，主要变化是：

1. 使用 `createStore` 创建 store 实例
2. 提供了 `useStore` 组合式函数来在 setup() 中访问 store
3. 支持 TypeScript 类型推断

## 总结

Vuex 是 Vue 应用中大规模状态管理的首选方案，尤其适合：

1. 多个视图依赖同一状态
2. 来自不同视图的行为需要变更同一状态
3. 需要实现撤销/重做、状态持久化等高级功能

虽然在 Vue 3 中可以使用其他状态管理解决方案（如 Pinia），但 Vuex 仍然是最成熟和最广泛使用的状态管理库之一。 