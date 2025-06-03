# Vue.js核心概念

Vue.js是一个用于构建用户界面的渐进式JavaScript框架。与其他大型框架不同的是，Vue被设计为可以自底向上逐层应用。Vue的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。

## 声明式渲染

Vue.js的核心是一个允许采用简洁的模板语法来声明式地将数据渲染进DOM的系统。

### 文本插值

```html
<div id="app">
  <p>{{ message }}</p>
</div>
```

```javascript
const app = Vue.createApp({
  data() {
    return {
      message: 'Hello Vue!'
    }
  }
})

app.mount('#app')
```

### 绑定属性

```html
<div id="app">
  <span v-bind:title="titleMessage">鼠标悬停几秒钟查看此处动态绑定的提示信息！</span>
  <!-- 简写形式 -->
  <a :href="url">链接</a>
</div>
```

```javascript
const app = Vue.createApp({
  data() {
    return {
      titleMessage: '页面加载于 ' + new Date().toLocaleString(),
      url: 'https://vuejs.org'
    }
  }
})
```

### 条件与循环

```html
<div id="app">
  <p v-if="seen">现在你看到我了</p>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </ul>
</div>
```

```javascript
const app = Vue.createApp({
  data() {
    return {
      seen: true,
      items: [
        { id: 1, text: '学习 JavaScript' },
        { id: 2, text: '学习 Vue' },
        { id: 3, text: '整个牛项目' }
      ]
    }
  }
})
```

## 组件化思想

组件系统是Vue的另一个重要概念，它是一种抽象，允许我们使用小型、独立和通常可复用的组件构建大型应用。

### 组件基础

```javascript
// 定义一个全局组件
app.component('my-component', {
  // 组件选项
  template: '<div>自定义组件内容</div>',
  data() {
    return {
      // 组件数据
    }
  },
  methods: {
    // 组件方法
  }
})
```

### 单文件组件

Vue推荐在更复杂的项目中使用单文件组件（SFC）：

```vue
<!-- MyComponent.vue -->
<template>
  <div class="example">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      title: '组件标题',
      message: '这是一个单文件组件示例'
    }
  }
}
</script>

<style scoped>
.example {
  color: #333;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
}
</style>
```

### 组件通信

1. **Props向下传递**

```vue
<!-- 父组件 -->
<template>
  <child-component :message="parentMessage"></child-component>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      parentMessage: '父组件的消息'
    }
  }
}
</script>
```

```vue
<!-- 子组件 ChildComponent.vue -->
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  }
}
</script>
```

2. **自定义事件向上传递**

```vue
<!-- 子组件 -->
<template>
  <button @click="emitEvent">触发事件</button>
</template>

<script>
export default {
  methods: {
    emitEvent() {
      this.$emit('custom-event', '传递给父组件的数据')
    }
  }
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <child-component @custom-event="handleEvent"></child-component>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  methods: {
    handleEvent(data) {
      console.log('接收到子组件事件:', data)
    }
  }
}
</script>
```

## 响应式原理

Vue的响应式系统使数据与视图保持同步，当数据变化时自动更新视图。

### Vue 2的响应式原理

Vue 2使用Object.defineProperty实现响应式：

```javascript
// 简化的响应式实现原理
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log(`获取${key}属性`)
      return val
    },
    set(newVal) {
      if (val === newVal) return
      console.log(`设置${key}属性为${newVal}`)
      val = newVal
      // 触发视图更新
    }
  })
}

// 用法
const data = {}
defineReactive(data, 'message', 'Hello')
console.log(data.message) // 获取message属性 Hello
data.message = 'Changed'  // 设置message属性为Changed
```

### Vue 3的响应式原理

Vue 3使用Proxy实现响应式：

```javascript
// 简化的Vue 3响应式实现
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      console.log(`获取${key}属性`)
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      console.log(`设置${key}属性为${value}`)
      return Reflect.set(target, key, value)
    }
  })
}

// 用法
const state = reactive({
  message: 'Hello'
})
console.log(state.message) // 获取message属性 Hello
state.message = 'Changed'  // 设置message属性为Changed
```

### 响应式系统限制

1. **Vue 2的限制**
   - 不能检测对象属性的添加或删除
   - 不能直接检测数组索引的变更和长度的变更

2. **解决方法**
   ```javascript
   // Vue 2中添加新属性
   Vue.set(object, key, value)
   // 或
   this.$set(object, key, value)
   
   // 修改数组
   this.items.splice(indexOfItem, 1, newValue)
   ```

## 指令系统

Vue提供了许多内置指令来操作DOM。

### 常用内置指令

| 指令 | 描述 |
|------|------|
| v-bind | 动态绑定属性 |
| v-on | 绑定事件监听器 |
| v-if | 条件性渲染元素 |
| v-show | 切换元素的显示状态 |
| v-for | 列表渲染 |
| v-model | 表单输入绑定 |
| v-html | 输出真实HTML |
| v-text | 更新元素的文本内容 |
| v-cloak | 隐藏未编译的Mustache语法 |
| v-once | 一次性渲染 |

### 自定义指令

```javascript
// 全局自定义指令
app.directive('focus', {
  // 当被绑定的元素挂载到DOM中时
  mounted(el) {
    // 聚焦元素
    el.focus()
  }
})

// 局部自定义指令
export default {
  directives: {
    focus: {
      mounted(el) {
        el.focus()
      }
    }
  }
}
```

使用示例：
```html
<input v-focus>
```

## 生命周期

Vue实例从创建到销毁的过程中会触发一系列的生命周期钩子，让开发者可以在特定阶段添加自己的代码。

### Vue 2生命周期钩子

- **beforeCreate** - 实例初始化之后，数据观测和事件配置之前
- **created** - 实例创建完成，数据观测和事件配置完成，但未挂载
- **beforeMount** - 挂载开始之前被调用
- **mounted** - 实例挂载到DOM后调用
- **beforeUpdate** - 数据更新时，虚拟DOM重新渲染前调用
- **updated** - 数据更改导致虚拟DOM重新渲染后调用
- **beforeDestroy** - 实例销毁前调用
- **destroyed** - 实例销毁后调用

### Vue 3生命周期钩子

Vue 3中，生命周期钩子命名有所变化，且提供了组合式API的形式：

```javascript
// 选项式API
export default {
  beforeCreate() {
    console.log('beforeCreate')
  },
  created() {
    console.log('created')
  },
  // ...其他生命周期钩子
}

// 组合式API
import { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'

export default {
  setup() {
    // beforeCreate和created钩子在setup中不需要显式定义
    onBeforeMount(() => {
      console.log('onBeforeMount')
    })
    onMounted(() => {
      console.log('onMounted')
    })
    // ...其他生命周期钩子
  }
}
```

### 生命周期图示

![Vue生命周期](https://v2.cn.vuejs.org/images/lifecycle.png)

## 计算属性与侦听器

### 计算属性

计算属性是基于依赖进行缓存的，只有在依赖发生变化时才会重新计算。

```javascript
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  computed: {
    // 计算属性
    fullName() {
      return this.firstName + ' ' + this.lastName
    },
    // 带有getter和setter的计算属性
    fullName2: {
      get() {
        return this.firstName + ' ' + this.lastName
      },
      set(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
}
```

### 侦听器

侦听器用于响应数据的变化，执行异步或开销较大的操作。

```javascript
export default {
  data() {
    return {
      question: '',
      answer: '问题通常包含一个问号。'
    }
  },
  watch: {
    // 监听question变化
    question(newQuestion, oldQuestion) {
      if (newQuestion.includes('?')) {
        this.getAnswer()
      }
    }
  },
  methods: {
    getAnswer() {
      this.answer = '思考中...'
      setTimeout(() => {
        this.answer = '这是一个问题的答案'
      }, 1000)
    }
  }
}
```

### 计算属性vs侦听器

- **计算属性**：适用于根据其他值派生出一个值
- **侦听器**：适用于当数据变化时执行异步或开销大的操作

## 事件处理

Vue提供了v-on指令（简写为@）来监听DOM事件。

### 基本用法

```html
<div id="app">
  <button v-on:click="counter += 1">增加 1</button>
  <p>按钮被点击了 {{ counter }} 次。</p>
  
  <!-- 调用方法 -->
  <button @click="greet">Greet</button>
  
  <!-- 内联JavaScript -->
  <button @click="say('hi')">Say Hi</button>
  
  <!-- 修饰符 -->
  <form @submit.prevent="onSubmit">...</form>
</div>
```

```javascript
const app = Vue.createApp({
  data() {
    return {
      counter: 0
    }
  },
  methods: {
    greet() {
      alert('Hello!')
    },
    say(message) {
      alert(message)
    },
    onSubmit() {
      // 提交表单逻辑
    }
  }
})
```

### 事件修饰符

- **.stop** - 阻止事件传播
- **.prevent** - 阻止默认行为
- **.capture** - 使用事件捕获模式
- **.self** - 只当事件在该元素本身触发时触发回调
- **.once** - 事件只触发一次
- **.passive** - 以{ passive: true }模式添加监听器

```html
<!-- 阻止单击事件继续传播 -->
<a @click.stop="doThis"></a>

<!-- 提交事件不再重载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰符可以串联 -->
<a @click.stop.prevent="doThat"></a>
```

### 按键修饰符

```html
<!-- 只有在按下Enter键时调用 -->
<input @keyup.enter="submit">

<!-- 支持的按键别名：enter, tab, delete, esc, space, up, down, left, right -->
<input @keyup.delete="handleDelete">
```

## 表单输入绑定

使用v-model指令在表单控件上创建双向数据绑定。

```html
<div id="app">
  <!-- 文本 -->
  <input v-model="message" placeholder="编辑我...">
  <p>消息是: {{ message }}</p>
  
  <!-- 多行文本 -->
  <textarea v-model="description"></textarea>
  
  <!-- 复选框 -->
  <input type="checkbox" id="checkbox" v-model="checked">
  <label for="checkbox">{{ checked }}</label>
  
  <!-- 单选按钮 -->
  <input type="radio" id="one" value="One" v-model="picked">
  <input type="radio" id="two" value="Two" v-model="picked">
  
  <!-- 选择框 -->
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
</div>
```

```javascript
const app = Vue.createApp({
  data() {
    return {
      message: '',
      description: '',
      checked: false,
      picked: '',
      selected: ''
    }
  }
})
```

### v-model修饰符

- **.lazy** - 在"change"事件之后而非"input"事件之后更新
- **.number** - 自动将用户的输入值转为数值类型
- **.trim** - 自动过滤用户输入的首尾空白字符

```html
<!-- 在"change"事件之后更新 -->
<input v-model.lazy="msg">

<!-- 自动转为数字 -->
<input v-model.number="age" type="number">

<!-- 去除首尾空格 -->
<input v-model.trim="msg">
```

## 深入Vue原理

### 虚拟DOM

Vue使用虚拟DOM（Virtual DOM）技术来提高渲染性能。虚拟DOM是对真实DOM的JavaScript对象表示，当状态改变时，Vue会生成新的虚拟DOM并将其与旧的虚拟DOM进行比较，然后只更新实际变化的部分。

```javascript
// 虚拟DOM节点的简化表示
{
  tag: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      tag: 'h1',
      props: {},
      children: ['标题']
    },
    {
      tag: 'p',
      props: {
        class: 'text'
      },
      children: ['内容']
    }
  ]
}
```

### 渲染函数

除了模板外，Vue还提供了渲染函数，让你可以更接近底层地控制元素的创建。

```javascript
export default {
  render() {
    return Vue.h('div', 
      { class: 'container' },
      [
        Vue.h('h1', 'This is a title'),
        Vue.h('p', { class: 'text' }, 'This is a paragraph')
      ]
    )
  }
}
```

## 总结

Vue.js的核心概念构成了框架的基础，理解这些概念将帮助你更有效地使用Vue进行开发：

1. **声明式渲染** - 用简洁的模板语法描述视图
2. **组件化** - 构建可复用的独立组件
3. **响应式** - 数据变化自动更新视图
4. **指令系统** - 扩展HTML的功能
5. **生命周期** - 控制组件不同阶段的行为
6. **计算属性与侦听器** - 处理数据派生和监视数据变化
7. **事件处理** - 响应用户交互

掌握这些核心概念后，你就能够构建从简单到复杂的各类Vue应用。 