# Vue Router 路由管理

Vue Router 是 Vue.js 官方的路由管理器。它与 Vue.js 核心深度集成，使构建单页面应用变得轻而易举。

## 基本概念

路由是指应用程序的不同"视图"（由组件构成）之间的映射关系。在传统的网站中，当用户点击链接，浏览器会加载新的页面。而在单页面应用中，Vue Router 允许我们通过更改 URL 来切换不同的组件，而无需重新加载页面。

## 安装与基本配置

### 安装

```bash
# 使用 npm
npm install vue-router@4

# 使用 yarn
yarn add vue-router@4

# 使用 pnpm
pnpm add vue-router@4
```

### 基本配置

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link> |
      <router-link to="/about">关于</router-link>
    </nav>
    <router-view/>
  </div>
</template>
```

## 路由模式

Vue Router 提供了多种历史模式来管理 URL：

1. **Hash 模式**：使用 URL 的 hash（如 `example.com/#/home`）
   ```javascript
   import { createRouter, createWebHashHistory } from 'vue-router'
   const router = createRouter({
     history: createWebHashHistory(),
     routes: [...]
   })
   ```

2. **HTML5 模式**：使用 HTML5 History API（如 `example.com/home`），需要服务器配置
   ```javascript
   import { createRouter, createWebHistory } from 'vue-router'
   const router = createRouter({
     history: createWebHistory(),
     routes: [...]
   })
   ```

3. **内存历史模式**：不会改变 URL，适用于非浏览器环境（如在测试场景或 SSR）
   ```javascript
   import { createRouter, createMemoryHistory } from 'vue-router'
   const router = createRouter({
     history: createMemoryHistory(),
     routes: [...]
   })
   ```

## 动态路由匹配

很多时候，我们需要将给定匹配模式的路由映射到同一个组件，例如用户个人资料页面：

```javascript
const routes = [
  // 动态路径参数以冒号开头
  { path: '/user/:id', component: User }
]
```

现在，像 `/user/1` 和 `/user/2` 这样的 URL 都会映射到同一个组件。

在组件中获取参数：

```vue
<script>
export default {
  created() {
    // 通过 $route.params 访问路由参数
    console.log(this.$route.params.id)
  },
  // Vue Router 4.x 提供了 props 选项
  props: ['id']
}
</script>
```

## 嵌套路由

实际应用程序通常由多层嵌套的组件组成。URL 的各个部分可以对应嵌套的各个组件：

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        // 当 /user/:id/profile 匹配成功
        // UserProfile 将被渲染在 User 的 <router-view> 中
        path: 'profile',
        component: UserProfile
      },
      {
        // 当 /user/:id/posts 匹配成功
        path: 'posts',
        component: UserPosts
      }
    ]
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <router-view></router-view>
  </div>
</template>
```

## 编程式导航

除了使用 `<router-link>` 创建链接，我们还可以使用 JavaScript 代码进行导航：

```javascript
// 选项式 API
export default {
  methods: {
    goToHome() {
      // 字符串路径
      this.$router.push('/')
      
      // 对象
      this.$router.push({ path: '/about' })
      
      // 命名的路由
      this.$router.push({ name: 'User', params: { id: '123' } })
      
      // 带查询参数
      this.$router.push({ path: '/search', query: { q: 'vue' } })
    },
    goBack() {
      this.$router.go(-1)
    },
    goForward() {
      this.$router.go(1)
    },
    replace() {
      // 替换当前页面，不会向历史记录添加新记录
      this.$router.replace('/about')
    }
  }
}

// 组合式 API
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    
    function goToHome() {
      router.push('/')
    }
    
    return { goToHome }
  }
}
```

## 命名路由

通过给路由提供 `name` 可以实现更简洁的导航：

```javascript
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
]
```

```vue
<router-link :to="{ name: 'User', params: { id: 123 }}">用户</router-link>
```

```javascript
router.push({ name: 'User', params: { id: 123 } })
```

## 命名视图

有时候需要同时展示多个同级视图，而不是嵌套显示：

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      footer: Footer
    }
  }
]
```

```vue
<router-view></router-view>
<router-view name="sidebar"></router-view>
<router-view name="footer"></router-view>
```

## 重定向和别名

### 重定向

```javascript
const routes = [
  // 重定向到另一个路径
  { path: '/home', redirect: '/' },
  
  // 重定向到命名路由
  { path: '/home', redirect: { name: 'Home' } },
  
  // 使用函数进行动态重定向
  { 
    path: '/search', 
    redirect: to => {
      return { path: '/find', query: to.query }
    }
  }
]
```

### 别名

别名让你可以将 URL 映射到多个路径，而展示的是同一个组件：

```javascript
const routes = [
  { 
    path: '/home',
    component: Home,
    alias: ['/main', '/index']
  }
]
```

## 路由组件传参

使用 `props` 将路由参数解耦：

```javascript
const routes = [
  // 布尔模式：自动将 params 设置为 props
  { path: '/user/:id', component: User, props: true },
  
  // 对象模式：传入静态 props
  { path: '/promotion', component: Promotion, props: { promotionId: 'summer' } },
  
  // 函数模式：返回 props
  { 
    path: '/search', 
    component: Search, 
    props: route => ({ query: route.query.q }) 
  }
]
```

## 路由守卫

Vue Router 提供了导航守卫来控制导航，主要用于在路由跳转前后执行一些逻辑。

### 全局守卫

```javascript
const router = createRouter({ ... })

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 未登录则重定向到登录页
    next({ name: 'Login' })
  } else {
    // 继续导航
    next()
  }
})

// 全局解析守卫
router.beforeResolve(async (to, from, next) => {
  // 在所有组件内守卫和异步路由组件被解析之后调用
  if (to.meta.fetchData) {
    try {
      await fetchDataForRoute(to)
      next()
    } catch (error) {
      next(error)
    }
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 发送页面浏览事件到分析服务
  sendAnalytics(to.fullPath)
})
```

### 路由独享守卫

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 路由独享的守卫
      if (isAdmin()) {
        next()
      } else {
        next('/403')
      }
    }
  }
]
```

### 组件内守卫

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能获取组件实例 `this`
    next(vm => {
      // 通过 `vm` 访问组件实例
    })
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 可以访问组件实例 `this`
    this.name = to.params.name
    next()
  },
  beforeRouteLeave(to, from, next) {
    // 在导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    const answer = window.confirm('Do you really want to leave?')
    if (answer) {
      next()
    } else {
      next(false)
    }
  }
}
```

## 路由元信息

在定义路由时，可以添加 `meta` 字段包含自定义信息：

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: { 
      requiresAuth: true,
      title: '管理页面',
      roles: ['admin', 'super-admin']
    }
  }
]
```

这些元信息可以在路由导航守卫或其他地方访问：

```javascript
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'
  
  // 检查权限
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.meta.roles && !hasAnyRole(to.meta.roles)) {
    next('/403')
  } else {
    next()
  }
})
```

## 路由懒加载

当打包应用时，JavaScript 包会变得非常大，影响页面加载速度。通过路由懒加载，我们可以将不同路由对应的组件分割成不同的代码块，按需加载：

```javascript
const routes = [
  {
    path: '/about',
    name: 'About',
    // 使用动态导入进行懒加载
    component: () => import('../views/About.vue')
  },
  
  // 将多个相关组件放在同一个块中
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '../views/Admin.vue'),
    children: [
      {
        path: 'settings',
        component: () => import(/* webpackChunkName: "admin" */ '../views/AdminSettings.vue')
      },
      {
        path: 'users',
        component: () => import(/* webpackChunkName: "admin" */ '../views/AdminUsers.vue')
      }
    ]
  }
]
```

## 滚动行为

使用前端路由，当切换到新路由时，我们可能想要页面滚动到顶部，或者保持原先的滚动位置：

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置，则使用它（例如使用浏览器的后退按钮）
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果有哈希，则滚动到目标锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 否则滚动到顶部
    return { top: 0 }
  }
})
```

## 路由过渡动画

可以使用 Vue 的 `<transition>` 组件给路由切换添加过渡效果：

```vue
<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

对于不同路由使用不同过渡效果：

```vue
<template>
  <div id="app">
    <transition :name="transitionName">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      transitionName: 'slide-left'
    }
  },
  watch: {
    $route(to, from) {
      // 根据路由深度决定使用的过渡效果
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }
  }
}
</script>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.5s;
}

.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter-from {
  transform: translateX(-100%);
}
</style>
```

## 组合式 API 中使用路由

Vue Router 4.x 提供了组合式 API：

```vue
<script setup>
import { useRouter, useRoute } from 'vue-router'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ref, computed } from 'vue'

// 获取路由实例
const router = useRouter()
// 获取当前路由
const route = useRoute()

// 响应式路由参数
const userId = computed(() => route.params.id)

// 导航到其他路由
function goToHome() {
  router.push('/')
}

// 路由守卫
onBeforeRouteUpdate((to, from) => {
  // 当前组件路由更新时
  console.log(`从 ${from.path} 更新到 ${to.path}`)
})

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定要离开吗？')
  if (!answer) return false
})
</script>
```

## 路由数据获取

有两种获取路由相关数据的模式：

1. **导航完成后获取**：先完成导航，然后在组件的生命周期钩子中获取数据
   ```javascript
   export default {
     data() {
       return {
         post: null,
         error: null,
         loading: false
       }
     },
     created() {
       this.fetchData()
     },
     watch: {
       // 当路由变化时重新获取数据
       '$route': 'fetchData'
     },
     methods: {
       async fetchData() {
         this.loading = true
         try {
           this.post = await fetchPost(this.$route.params.id)
         } catch (e) {
           this.error = e
         } finally {
           this.loading = false
         }
       }
     }
   }
   ```

2. **导航完成前获取**：在路由守卫中获取数据，完成后执行导航
   ```javascript
   router.beforeResolve(async (to, from, next) => {
     if (to.meta.fetchData) {
       try {
         // 设置加载状态
         store.commit('setLoading', true)
         await loadData(to.params.id)
         next()
       } catch (error) {
         next(error)
       } finally {
         store.commit('setLoading', false)
       }
     } else {
       next()
     }
   })
   ```

## Vue Router 与 TypeScript

Vue Router 4.x 提供了改进的 TypeScript 支持：

```typescript
// 扩展 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    roles?: string[]
  }
}

// 创建带有类型的路由
const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: Admin,
    meta: { 
      requiresAuth: true,
      title: '管理页面',
      roles: ['admin']
    }
  }
]

// 使用组合式 API
const route = useRoute()
const meta = route.meta
// TS 能够正确推断 meta.requiresAuth 是 boolean | undefined
```

## 最佳实践

1. **按需加载路由组件**：使用动态导入进行路由懒加载
2. **为路由添加元信息**：使用 meta 字段存储路由相关信息
3. **使用命名路由**：为关键路由提供名称，避免硬编码 URL
4. **将路由逻辑分离**：按功能模块组织路由配置
5. **使用路由守卫控制访问权限**：在适当的守卫中检查认证和授权
6. **保持路由配置的可维护性**：避免路由配置过于复杂

## 总结

Vue Router 是 Vue 应用中构建单页面应用的核心工具，它提供了：

1. **声明式路由**：通过 `<router-link>` 和 `<router-view>` 轻松创建链接和视图
2. **动态路由匹配**：使用参数模式匹配动态路由
3. **嵌套路由**：支持复杂的嵌套组件结构
4. **编程式导航**：通过 JavaScript 代码控制导航
5. **导航守卫**：在路由切换过程中执行逻辑
6. **路由元信息**：附加自定义数据到路由配置
7. **过渡效果**：为路由变化添加动画

通过深入理解和利用这些功能，可以构建出流畅、高效的单页面应用。 