# React Hooks 详解

## 什么是 Hooks？

Hooks 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## Hook 使用规则

1. **只在最顶层使用 Hook**：不要在循环、条件或嵌套函数中调用 Hook
2. **只在 React 函数中调用 Hook**：不要在普通的 JavaScript 函数中调用 Hook

## 基础 Hooks

### useState

管理组件的局部状态：

```jsx
import React, { useState } from 'react';

function Example() {
  // 声明一个新的叫做 "count" 的 state 变量
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

// 函数式更新
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <button onClick={increment}>
      计数: {count}
    </button>
  );
}

// 惰性初始 state
function ExpensiveComponent() {
  const [state, setState] = useState(() => {
    // 这个函数只在初始渲染时执行
    const initialState = someExpensiveComputation();
    return initialState;
  });

  return <div>{state}</div>;
}
```

### useEffect

执行副作用操作：

```jsx
import React, { useState, useEffect } from 'react';

// 基本用法
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
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

// 需要清除的副作用
function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    
    // 指定如何清除副作用
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}

// 跳过 Effect 进行性能优化
function Example({ count }) {
  useEffect(() => {
    document.title = `你点击了 ${count} 次`;
  }, [count]); // 仅在 count 更改时更新

  return (
    <div>
      <p>你点击了 {count} 次</p>
    </div>
  );
}
```

### useContext

接收一个 context 对象并返回该 context 的当前值：

```jsx
import React, { useContext, createContext, useState } from 'react';

// 创建 Context
const ThemeContext = createContext();
const UserContext = createContext();

// Provider 组件
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState({ name: '张三', role: 'admin' });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <Header />
        <Main />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// 使用 useContext
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  return (
    <header className={`header ${theme}`}>
      <h1>欢迎, {user.name}!</h1>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </header>
  );
}

function Main() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <main className={`main ${theme}`}>
      <p>这是主要内容区域</p>
    </main>
  );
}
```

## 额外的 Hooks

### useReducer

useState 的替代方案，适用于复杂的状态逻辑：

```jsx
import React, { useReducer } from 'react';

// 定义 reducer
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: Date.now(),
          text: action.payload,
          completed: false
        }
      ];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.payload);
    default:
      throw new Error(`未知的 action 类型: ${action.type}`);
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputValue });
      setInputValue('');
    }
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
              onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### useCallback

返回一个 memoized 回调函数：

```jsx
import React, { useState, useCallback, memo } from 'react';

// 子组件
const ExpensiveComponent = memo(({ onClick, value }) => {
  console.log('ExpensiveComponent 渲染');
  return (
    <div>
      <p>值: {value}</p>
      <button onClick={onClick}>点击我</button>
    </div>
  );
});

function Parent() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // 使用 useCallback 优化
  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  // 不使用 useCallback（每次渲染都会创建新函数）
  const handleClickBad = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <ExpensiveComponent onClick={handleClick} value={count} />
      <button onClick={() => setOtherState(otherState + 1)}>
        其他状态: {otherState}
      </button>
    </div>
  );
}
```

### useMemo

返回一个 memoized 值：

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveCalculation({ items }) {
  const [filter, setFilter] = useState('');

  // 昂贵的计算
  const expensiveValue = useMemo(() => {
    console.log('执行昂贵的计算');
    return items
      .filter(item => item.name.includes(filter))
      .reduce((sum, item) => sum + item.value, 0);
  }, [items, filter]); // 只有当 items 或 filter 改变时才重新计算

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="过滤条件"
      />
      <p>计算结果: {expensiveValue}</p>
    </div>
  );
}
```

### useRef

返回一个可变的 ref 对象：

```jsx
import React, { useRef, useEffect, useState } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>聚焦输入框</button>
    </>
  );
}

// 保存可变值
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(count => count + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>计时器: {count}</p>
      <button onClick={stopTimer}>停止</button>
    </div>
  );
}

// 获取前一个值
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前: {count}, 之前: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

## 自定义 Hooks

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook：

```jsx
// useLocalStorage Hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// useFetch Hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// useToggle Hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle];
}

// 使用自定义 Hooks
function App() {
  const [name, setName] = useLocalStorage('name', '');
  const [isVisible, toggleVisible] = useToggle(false);
  const { data, loading, error } = useFetch('/api/users');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入姓名"
      />
      <button onClick={toggleVisible}>
        {isVisible ? '隐藏' : '显示'}
      </button>
      {isVisible && (
        <div>
          <h2>用户列表</h2>
          {data && data.map(user => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Hook 最佳实践

1. **遵循 Hook 规则**：使用 ESLint 插件 `eslint-plugin-react-hooks`
2. **合理使用依赖数组**：避免遗漏依赖或添加不必要的依赖
3. **提取自定义 Hook**：复用状态逻辑
4. **性能优化**：合理使用 `useCallback`、`useMemo` 和 `React.memo`
5. **避免过度优化**：不要过早优化，先确保代码正确性

```jsx
// 好的实践
function UserProfile({ userId }) {
  const { user, loading, error, refetch } = useUser(userId);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(async (userData) => {
    try {
      await updateUser(userId, userData);
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [userId, refetch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {isEditing ? (
        <UserEditForm user={user} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <UserDisplay user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
``` 