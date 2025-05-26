import React, { useState, useEffect, useMemo } from 'react';
import './UserManagement.css';

// 模拟 API 调用
const mockApi = {
  // 获取用户列表
  getUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        resolve(users);
      }, 500);
    });
  },

  // 创建用户
  createUser: (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        resolve(newUser);
      }, 300);
    });
  },

  // 更新用户
  updateUser: (id, userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
          users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('users', JSON.stringify(users));
          resolve(users[index]);
        }
      }, 300);
    });
  },

  // 删除用户
  deleteUser: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(user => user.id !== id);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        resolve(true);
      }, 300);
    });
  }
};

// 用户管理主组件
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  // 加载用户数据
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await mockApi.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤和排序用户
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [users, searchTerm, sortField, sortDirection]);

  // 分页
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  // 处理排序
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 处理用户选择
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      setLoading(true);
      try {
        await mockApi.deleteUser(userId);
        await loadUsers();
        setSelectedUsers(prev => prev.filter(id => id !== userId));
      } catch (error) {
        console.error('删除用户失败:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？`)) {
      setLoading(true);
      try {
        await Promise.all(selectedUsers.map(id => mockApi.deleteUser(id)));
        await loadUsers();
        setSelectedUsers([]);
      } catch (error) {
        console.error('批量删除失败:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 编辑用户
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // 添加新用户
  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  return (
    <div className="user-management">
      <header className="user-management-header">
        <h1>用户管理系统</h1>
        <p>管理系统用户和权限</p>
      </header>

      {/* 工具栏 */}
      <div className="toolbar">
        <div className="search-section">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="action-section">
          <button
            onClick={handleAddUser}
            className="btn btn-primary"
          >
            添加用户
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="btn btn-danger"
            >
              删除选中 ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* 用户表格 */}
      <div className="table-container">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('name')} className="sortable">
                  姓名 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  邮箱 {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('role')} className="sortable">
                  角色 {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  状态 {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  创建时间 {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.includes(user.id)}
                  onSelect={handleSelectUser}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </tbody>
          </table>
        )}

        {filteredAndSortedUsers.length === 0 && !loading && (
          <div className="empty-state">
            {searchTerm ? '没有找到匹配的用户' : '还没有用户数据'}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* 用户模态框 */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={loadUsers}
        />
      )}
    </div>
  );
}

// 用户行组件
function UserRow({ user, isSelected, onSelect, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: '活跃', class: 'status-active' },
      inactive: { text: '非活跃', class: 'status-inactive' },
      suspended: { text: '已暂停', class: 'status-suspended' }
    };
    const statusInfo = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { text: '管理员', class: 'role-admin' },
      user: { text: '用户', class: 'role-user' },
      moderator: { text: '版主', class: 'role-moderator' }
    };
    const roleInfo = roleMap[role] || { text: role, class: '' };
    return <span className={`role-badge ${roleInfo.class}`}>{roleInfo.text}</span>;
  };

  return (
    <tr className={isSelected ? 'selected' : ''}>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
        />
      </td>
      <td>
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-id">ID: {user.id}</div>
          </div>
        </div>
      </td>
      <td>{user.email}</td>
      <td>{getRoleBadge(user.role)}</td>
      <td>{getStatusBadge(user.status)}</td>
      <td>{formatDate(user.createdAt)}</td>
      <td>
        <div className="action-buttons">
          <button
            onClick={() => onEdit(user)}
            className="btn btn-sm btn-secondary"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="btn btn-sm btn-danger"
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}

// 分页组件
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-sm"
      >
        上一页
      </button>
      
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn btn-sm ${page === currentPage ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-sm"
      >
        下一页
      </button>
      
      <span className="pagination-info">
        第 {currentPage} 页，共 {totalPages} 页
      </span>
    </div>
  );
}

// 用户模态框组件
function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (user) {
        await mockApi.updateUser(user.id, formData);
      } else {
        await mockApi.createUser(formData);
      }
      await onSave();
      onClose();
    } catch (error) {
      console.error('保存用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? '编辑用户' : '添加用户'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>姓名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>邮箱 *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>角色</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="user">用户</option>
              <option value="moderator">版主</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>状态</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
              <option value="suspended">已暂停</option>
            </select>
          </div>
        </form>
        
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement; 