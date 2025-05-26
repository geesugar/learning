# React vs Vue 框架对比

## 概述

React 和 Vue 都是现代前端开发中最受欢迎的 JavaScript 框架，各有其独特的设计理念和优势。

## 基本信息对比

| 特性 | React | Vue |
|------|-------|-----|
| 发布时间 | 2013年 | 2014年 |
| 开发者 | Facebook | 尤雨溪 |
| 类型 | JavaScript 库 | 渐进式框架 |
| 学习曲线 | 中等到困难 | 容易到中等 |
| 社区规模 | 非常大 | 大 |
| GitHub Stars | 220k+ | 200k+ |

## 核心概念对比

### 1. 组件定义

**React (函数组件)**
```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

export default Counter;
```

**Vue (组合式 API)**
```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>
```

**Vue (选项式 API)**
```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

### 2. 状态管理

**React**
```jsx
// useState Hook
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);

// useReducer Hook
const [state, dispatch] = useReducer(reducer, initialState);

// Context API
const UserContext = createContext();
```

**Vue**
```vue
<script setup>
// ref 和 reactive
import { ref, reactive } from 'vue'

const user = ref(null)
const loading = ref(false)
const state = reactive({
  count: 0,
  name: ''
})
</script>
```

### 3. 生命周期

**React (Hooks)**
```jsx
import { useEffect } from 'react';

function Component() {
  // 组件挂载和更新
  useEffect(() => {
    console.log('组件挂载或更新');
  });

  // 仅在挂载时执行
  useEffect(() => {
    console.log('组件挂载');
    
    // 清理函数（卸载时执行）
    return () => {
      console.log('组件卸载');
    };
  }, []);

  // 依赖变化时执行
  useEffect(() => {
    console.log('count 变化');
  }, [count]);
}
```

**Vue (组合式 API)**
```vue
<script setup>
import { onMounted, onUpdated, onUnmounted, watch } from 'vue'

// 组件挂载
onMounted(() => {
  console.log('组件挂载')
})

// 组件更新
onUpdated(() => {
  console.log('组件更新')
})

// 组件卸载
onUnmounted(() => {
  console.log('组件卸载')
})

// 监听数据变化
watch(count, (newValue, oldValue) => {
  console.log('count 变化', newValue, oldValue)
})
</script>
```

### 4. 条件渲染

**React**
```jsx
function ConditionalRender({ isLoggedIn, user }) {
  return (
    <div>
      {isLoggedIn ? (
        <div>欢迎, {user.name}!</div>
      ) : (
        <div>请登录</div>
      )}
      
      {user && user.isAdmin && (
        <div>管理员面板</div>
      )}
    </div>
  );
}
```

**Vue**
```vue
<template>
  <div>
    <div v-if="isLoggedIn">欢迎, {{ user.name }}!</div>
    <div v-else>请登录</div>
    
    <div v-if="user && user.isAdmin">管理员面板</div>
    
    <!-- v-show 只是切换 display 属性 -->
    <div v-show="isVisible">可见内容</div>
  </div>
</template>
```

### 5. 列表渲染

**React**
```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <span className={todo.completed ? 'completed' : ''}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

**Vue**
```vue
<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span :class="{ completed: todo.completed }">
        {{ todo.text }}
      </span>
    </li>
  </ul>
</template>
```

### 6. 事件处理

**React**
```jsx
function EventExample() {
  const handleClick = (e) => {
    e.preventDefault();
    console.log('点击事件');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 处理表单提交
  };

  return (
    <form onSubmit={handleSubmit}>
      <button onClick={handleClick}>点击我</button>
      <input onChange={(e) => console.log(e.target.value)} />
    </form>
  );
}
```

**Vue**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <button @click="handleClick">点击我</button>
    <input @input="handleInput" />
    
    <!-- 事件修饰符 -->
    <button @click.stop="handleClick">阻止冒泡</button>
    <button @click.once="handleClick">只触发一次</button>
  </form>
</template>

<script setup>
const handleClick = () => {
  console.log('点击事件')
}

const handleSubmit = () => {
  // 处理表单提交
}

const handleInput = (e) => {
  console.log(e.target.value)
}
</script>
```

## 架构和设计理念

### React
- **单向数据流**：数据从父组件流向子组件
- **函数式编程**：推崇纯函数和不可变数据
- **组合优于继承**：通过组合组件构建复杂 UI
- **JSX**：JavaScript 和 HTML 的混合语法
- **虚拟 DOM**：通过虚拟 DOM 优化性能

### Vue
- **渐进式框架**：可以逐步采用，不需要重写整个应用
- **模板语法**：基于 HTML 的模板语法，更接近传统 Web 开发
- **双向数据绑定**：v-model 提供便捷的双向绑定
- **响应式系统**：基于 Proxy 的响应式数据系统
- **单文件组件**：.vue 文件包含模板、脚本和样式

## 性能对比

### React
```jsx
// React.memo 优化组件渲染
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 复杂渲染逻辑 */}</div>;
});

// useMemo 优化计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback 优化函数
const handleClick = useCallback(() => {
  // 处理点击
}, [dependency]);
```

### Vue
```vue
<script setup>
import { computed, shallowRef } from 'vue'

// computed 自动缓存计算结果
const expensiveValue = computed(() => {
  return computeExpensiveValue(data.value)
})

// shallowRef 优化大型数据结构
const largeData = shallowRef(bigObject)
</script>

<template>
  <!-- v-memo 优化列表渲染 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    {{ item.name }}
  </div>
</template>
```

## 生态系统对比

### React 生态
- **路由**: React Router
- **状态管理**: Redux, Zustand, Jotai
- **UI 库**: Material-UI, Ant Design, Chakra UI
- **开发工具**: Create React App, Next.js, Vite
- **测试**: Jest, React Testing Library
- **移动端**: React Native

### Vue 生态
- **路由**: Vue Router
- **状态管理**: Vuex, Pinia
- **UI 库**: Element Plus, Vuetify, Quasar
- **开发工具**: Vue CLI, Vite, Nuxt.js
- **测试**: Vue Test Utils, Vitest
- **移动端**: NativeScript-Vue, Quasar

## 学习曲线

### React
```jsx
// 需要理解的概念较多
// 1. JSX 语法
// 2. 组件生命周期
// 3. Hooks 规则
// 4. 状态不可变性
// 5. 函数式编程概念

function ComplexComponent() {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);
  
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(state);
  }, [state]);
  
  return (
    <div>
      {/* JSX 语法 */}
    </div>
  );
}
```

### Vue
```vue
<!-- 更接近传统 HTML/CSS/JS 开发 -->
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="updateMessage">更新</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')

const updateMessage = () => {
  message.value = 'Updated!'
}
</script>

<style scoped>
p {
  color: blue;
}
</style>
```

## 适用场景

### React 适合
- **大型企业应用**：强大的生态系统和社区支持
- **复杂状态管理**：Redux 等成熟的状态管理方案
- **团队协作**：严格的代码规范和类型检查
- **移动端开发**：React Native 跨平台开发
- **服务端渲染**：Next.js 等成熟的 SSR 方案

### Vue 适合
- **快速原型开发**：简单易学，开发效率高
- **中小型项目**：渐进式采用，学习成本低
- **传统 Web 开发团队**：模板语法更容易理解
- **设计师友好**：模板语法更接近 HTML
- **国内项目**：中文文档完善，社区活跃

## 代码示例：完整的 Todo 应用

### React 版本
```jsx
import React, { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h1>Todo List</h1>
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="添加新任务"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

### Vue 版本
```vue
<template>
  <div class="todo-app">
    <h1>Todo List</h1>
    <div class="input-section">
      <input
        v-model="inputValue"
        @keyup.enter="addTodo"
        placeholder="添加新任务"
      />
      <button @click="addTodo">添加</button>
    </div>
    <ul class="todo-list">
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <span @click="toggleTodo(todo.id)">
          {{ todo.text }}
        </span>
        <button @click="deleteTodo(todo.id)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const todos = ref([])
const inputValue = ref('')

const addTodo = () => {
  if (inputValue.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: inputValue.value,
      completed: false
    })
    inputValue.value = ''
  }
}

const toggleTodo = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

const deleteTodo = (id) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
  }
}
</script>

<style scoped>
.todo-app {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  display: flex;
  margin-bottom: 20px;
}

.input-section input {
  flex: 1;
  padding: 8px;
  margin-right: 8px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.completed span {
  text-decoration: line-through;
  color: #999;
}
</style>
```

## 总结

### 选择 React 如果你：
- 需要构建大型、复杂的应用
- 团队有较强的 JavaScript 基础
- 需要丰富的第三方库支持
- 计划开发移动端应用
- 偏好函数式编程风格

### 选择 Vue 如果你：
- 需要快速开发原型或中小型项目
- 团队更熟悉传统 Web 开发
- 希望渐进式地引入框架
- 重视开发体验和学习曲线
- 需要更好的中文社区支持

两个框架都是优秀的选择，最终决定应该基于项目需求、团队技能和长期维护考虑。 