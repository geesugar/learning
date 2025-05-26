# React 状态管理和生命周期

## 状态（State）

状态是组件内部的数据，可以随时间变化。与 props 不同，state 是私有的，并且完全受控于当前组件。

## useState Hook

在函数组件中使用 `useState` Hook 来管理状态：

```jsx
import React, { useState } from 'react';

function Counter() {
  // 声明一个叫 "count" 的 state 变量，初始值为 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

### 多个状态变量

```jsx
function UserProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 提交用户信息
      await submitUserProfile({ name, email, age });
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="姓名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="number"
        placeholder="年龄"
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value))}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

### 对象和数组状态

```jsx
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
    <div>
      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="添加新任务"
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## useEffect Hook

`useEffect` Hook 让你能够在函数组件中执行副作用操作。

### 基本用法

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    // 更新文档标题
    document.title = `你点击了 ${count} 次`;
  });

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

### 清理副作用

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);

    // 清理函数
    return () => clearInterval(interval);
  }, []); // 空依赖数组表示只在挂载和卸载时运行

  return <div>计时器: {seconds} 秒</div>;
}
```

### 条件执行副作用

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        
        if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('获取用户信息失败:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]); // 依赖 userId，当 userId 变化时重新执行

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 类组件的生命周期

虽然现在推荐使用 Hooks，但了解类组件的生命周期仍然很重要：

```jsx
class LifecycleExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      data: null
    };
    console.log('1. Constructor');
  }

  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps');
    // 返回对象来更新 state，或者返回 null 来表示新的 props 不需要更新任何 state
    return null;
  }

  componentDidMount() {
    console.log('3. componentDidMount');
    // 组件挂载后调用，适合进行 API 调用、订阅等
    this.fetchData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('4. shouldComponentUpdate');
    // 返回 false 可以阻止组件更新
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('5. getSnapshotBeforeUpdate');
    // 在最近一次渲染输出（提交到 DOM 节点）之前调用
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('6. componentDidUpdate');
    // 组件更新后调用
    if (prevState.count !== this.state.count) {
      console.log('计数已更新');
    }
  }

  componentWillUnmount() {
    console.log('7. componentWillUnmount');
    // 组件卸载前调用，清理定时器、取消网络请求等
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      this.setState({ data });
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  handleIncrement = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    console.log('Render');
    return (
      <div>
        <p>计数: {this.state.count}</p>
        <button onClick={this.handleIncrement}>增加</button>
        {this.state.data && <div>数据: {JSON.stringify(this.state.data)}</div>}
      </div>
    );
  }
}
```

## 自定义 Hook

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

```jsx
// 自定义 Hook：useCounter
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// 使用自定义 Hook
function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(10);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}

// 自定义 Hook：useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('读取 localStorage 失败:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('写入 localStorage 失败:', error);
    }
  };

  return [storedValue, setValue];
}

// 使用 useLocalStorage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色主题</option>
        <option value="dark">深色主题</option>
      </select>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  );
}
```

## 状态管理最佳实践

1. **保持状态最小化**：只存储必要的状态
2. **状态提升**：将共享状态提升到最近的共同父组件
3. **不可变更新**：始终返回新的状态对象
4. **合理使用 useEffect 依赖**：避免无限循环
5. **自定义 Hook 复用逻辑**：提取可复用的状态逻辑

```jsx
// 好的实践：状态提升
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  return (
    <div>
      <Header user={user} cartCount={cart.length} />
      <ProductList onAddToCart={(product) => setCart([...cart, product])} />
      <Cart items={cart} onRemove={(id) => setCart(cart.filter(item => item.id !== id))} />
    </div>
  );
}
``` 