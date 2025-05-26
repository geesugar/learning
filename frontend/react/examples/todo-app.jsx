import React, { useState, useEffect, useReducer } from 'react';
import './TodoApp.css';

// Todo 状态管理 Reducer
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: Date.now(),
          text: action.payload,
          completed: false,
          createdAt: new Date().toISOString()
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
    case 'EDIT_TODO':
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, text: action.payload.text }
          : todo
      );
    case 'CLEAR_COMPLETED':
      return state.filter(todo => !todo.completed);
    case 'LOAD_TODOS':
      return action.payload;
    default:
      return state;
  }
};

// 过滤器类型
const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

// 主要的 Todo 应用组件
function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      dispatch({ type: 'LOAD_TODOS', payload: JSON.parse(savedTodos) });
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 添加新的 todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputValue.trim() });
      setInputValue('');
    }
  };

  // 切换 todo 完成状态
  const handleToggleTodo = (id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  // 删除 todo
  const handleDeleteTodo = (id) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  // 开始编辑
  const handleStartEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingText.trim()) {
      dispatch({
        type: 'EDIT_TODO',
        payload: { id: editingId, text: editingText.trim() }
      });
    }
    setEditingId(null);
    setEditingText('');
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 清除已完成的 todos
  const handleClearCompleted = () => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  };

  // 过滤 todos
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case FILTERS.ACTIVE:
        return !todo.completed;
      case FILTERS.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  });

  // 统计信息
  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>Todo List</h1>
        <p>管理你的日常任务</p>
      </header>

      {/* 添加新任务表单 */}
      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="添加新任务..."
          className="todo-input"
        />
        <button type="submit" className="add-button">
          添加
        </button>
      </form>

      {/* 过滤器 */}
      <div className="todo-filters">
        <button
          className={filter === FILTERS.ALL ? 'active' : ''}
          onClick={() => setFilter(FILTERS.ALL)}
        >
          全部 ({todos.length})
        </button>
        <button
          className={filter === FILTERS.ACTIVE ? 'active' : ''}
          onClick={() => setFilter(FILTERS.ACTIVE)}
        >
          未完成 ({activeTodosCount})
        </button>
        <button
          className={filter === FILTERS.COMPLETED ? 'active' : ''}
          onClick={() => setFilter(FILTERS.COMPLETED)}
        >
          已完成 ({completedTodosCount})
        </button>
      </div>

      {/* Todo 列表 */}
      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            {filter === FILTERS.ALL && todos.length === 0 ? (
              <p>还没有任务，添加一个开始吧！</p>
            ) : (
              <p>没有{filter === FILTERS.ACTIVE ? '未完成' : '已完成'}的任务</p>
            )}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isEditing={editingId === todo.id}
              editingText={editingText}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditingTextChange={setEditingText}
            />
          ))
        )}
      </div>

      {/* 底部操作 */}
      {todos.length > 0 && (
        <div className="todo-footer">
          <div className="todo-stats">
            <span>总计: {todos.length} 项任务</span>
            <span>已完成: {completedTodosCount} 项</span>
            <span>未完成: {activeTodosCount} 项</span>
          </div>
          {completedTodosCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="clear-completed-button"
            >
              清除已完成 ({completedTodosCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Todo 项组件
function TodoItem({
  todo,
  isEditing,
  editingText,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingTextChange
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={onSaveEdit}
            className="todo-edit-input"
            autoFocus
          />
        ) : (
          <span
            className="todo-text"
            onDoubleClick={() => onStartEdit(todo.id, todo.text)}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className="todo-meta">
        <span className="todo-date">
          {formatDate(todo.createdAt)}
        </span>
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button onClick={onSaveEdit} className="save-button">
              保存
            </button>
            <button onClick={onCancelEdit} className="cancel-button">
              取消
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStartEdit(todo.id, todo.text)}
              className="edit-button"
            >
              编辑
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="delete-button"
            >
              删除
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TodoApp; 