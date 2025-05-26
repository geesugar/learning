# React 组件和 JSX

## 什么是组件？

React 组件是构建用户界面的基本单元。组件让你可以将 UI 拆分为独立且复用的代码片段，并对每个片段进行独立构思。

## 函数组件

```jsx
// 简单的函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 使用箭头函数
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};

// 使用组件
function App() {
  return (
    <div>
      <Welcome name="张三" />
      <Welcome name="李四" />
    </div>
  );
}
```

## 类组件

```jsx
import React, { Component } from 'react';

class Welcome extends Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

// 带状态的类组件
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>计数: {this.state.count}</p>
        <button onClick={this.increment}>增加</button>
      </div>
    );
  }
}
```

## JSX 语法

JSX 是 JavaScript 的语法扩展，让你可以在 JavaScript 中编写类似 HTML 的代码。

### 基本语法

```jsx
// JSX 表达式
const element = <h1>Hello, world!</h1>;

// 在 JSX 中嵌入表达式
const name = '张三';
const element = <h1>Hello, {name}!</h1>;

// JSX 也是表达式
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```

### JSX 属性

```jsx
// 使用引号来将属性值指定为字符串字面量
const element = <div tabIndex="0"></div>;

// 使用大括号来在属性值中插入一个 JavaScript 表达式
const element = <img src={user.avatarUrl}></img>;

// 驼峰命名法
const element = <div className="container" onClick={handleClick}></div>;
```

### JSX 子元素

```jsx
// 包含子元素
const element = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
);

// 自闭合标签
const element = <img src={user.avatarUrl} />;
```

## 组件组合

```jsx
function Avatar(props) {
  return (
    <img className="Avatar"
         src={props.user.avatarUrl}
         alt={props.user.name} />
  );
}

function UserInfo(props) {
  return (
    <div className="UserInfo">
      <Avatar user={props.user} />
      <div className="UserInfo-name">
        {props.user.name}
      </div>
    </div>
  );
}

function Comment(props) {
  return (
    <div className="Comment">
      <UserInfo user={props.author} />
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```

## Props（属性）

Props 是只读的，组件无论是使用函数声明还是通过 class 声明，都决不能修改自身的 props。

```jsx
// 默认 Props
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

Greeting.defaultProps = {
  name: 'World'
};

// 或者在函数参数中设置默认值
function Greeting({ name = 'World' }) {
  return <h1>Hello, {name}!</h1>;
}

// Props 类型检查（需要 prop-types 库）
import PropTypes from 'prop-types';

Greeting.propTypes = {
  name: PropTypes.string.isRequired
};
```

## 条件渲染

```jsx
function Greeting(props) {
  const isLoggedIn = props.isLoggedIn;
  
  // 使用 if 语句
  if (isLoggedIn) {
    return <UserGreeting />;
  }
  return <GuestGreeting />;
}

// 使用三元运算符
function LoginButton(props) {
  return (
    <button onClick={props.onClick}>
      {props.isLoggedIn ? '退出' : '登录'}
    </button>
  );
}

// 使用逻辑 && 运算符
function Mailbox(props) {
  const unreadMessages = props.unreadMessages;
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 &&
        <h2>
          您有 {unreadMessages.length} 条未读消息。
        </h2>
      }
    </div>
  );
}
```

## 列表渲染

```jsx
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

// 内联渲染
function NumberList(props) {
  const numbers = props.numbers;
  return (
    <ul>
      {numbers.map((number) =>
        <li key={number.toString()}>
          {number}
        </li>
      )}
    </ul>
  );
}

// 渲染对象列表
function TodoList(props) {
  const todos = props.todos;
  return (
    <ul>
      {todos.map((todo) =>
        <li key={todo.id}>
          <span className={todo.completed ? 'completed' : ''}>
            {todo.text}
          </span>
        </li>
      )}
    </ul>
  );
}
```

## 最佳实践

1. **组件名称必须以大写字母开头**
2. **一个文件只导出一个组件**
3. **保持组件的纯净性**
4. **合理拆分组件**
5. **使用有意义的组件名称**
6. **为列表项提供 key 属性**

```jsx
// 好的实践
function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <button onClick={() => onEdit(user.id)}>编辑</button>
        <button onClick={() => onDelete(user.id)}>删除</button>
      </div>
    </div>
  );
}
``` 