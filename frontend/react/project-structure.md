# React TypeScript 项目文件结构

## 📁 标准项目结构

### 基础项目结构

```
my-react-app/
├── public/                     # 静态资源目录
│   ├── index.html             # HTML 模板
│   ├── favicon.ico            # 网站图标
│   ├── manifest.json          # PWA 配置
│   └── robots.txt             # 搜索引擎爬虫配置
├── src/                       # 源代码目录
│   ├── components/            # 可复用组件
│   ├── pages/                 # 页面组件
│   ├── hooks/                 # 自定义 Hooks
│   ├── services/              # API 服务
│   ├── utils/                 # 工具函数
│   ├── types/                 # TypeScript 类型定义
│   ├── constants/             # 常量定义
│   ├── styles/                # 样式文件
│   ├── assets/                # 静态资源
│   ├── store/                 # 状态管理
│   ├── App.tsx                # 根组件
│   ├── index.tsx              # 应用入口
│   └── react-app-env.d.ts     # React 类型声明
├── package.json               # 项目配置和依赖
├── tsconfig.json              # TypeScript 配置
├── .eslintrc.js               # ESLint 配置
├── .prettierrc                # Prettier 配置
├── .gitignore                 # Git 忽略文件
└── README.md                  # 项目说明
```

## 📂 详细目录说明

### 1. public/ 目录

```
public/
├── index.html                 # 主 HTML 模板
├── favicon.ico                # 网站图标
├── logo192.png                # PWA 图标 (192x192)
├── logo512.png                # PWA 图标 (512x512)
├── manifest.json              # PWA 应用清单
└── robots.txt                 # 搜索引擎配置
```

**index.html 示例：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React TypeScript 应用" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>React TypeScript App</title>
  </head>
  <body>
    <noscript>您需要启用 JavaScript 来运行此应用。</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 2. src/ 目录结构

#### 2.1 入口文件

**src/index.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 性能监控
reportWebVitals();
```

**src/App.tsx**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import './styles/App.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
```

#### 2.2 组件目录 (components/)

```
src/components/
├── Layout/                    # 布局组件
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   └── index.ts
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   ├── Footer.module.css
│   │   └── index.ts
│   └── Sidebar/
├── UI/                        # 基础 UI 组件
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Modal/
│   └── Loading/
├── Forms/                     # 表单组件
│   ├── LoginForm/
│   ├── ContactForm/
│   └── UserForm/
└── Business/                  # 业务组件
    ├── UserProfile/
    ├── ProductCard/
    └── OrderList/
```

**组件示例 - Button.tsx：**
```typescript
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.loading]: loading,
      [styles.disabled]: disabled || loading,
    },
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
};

export default Button;
```

**组件导出文件 - index.ts：**
```typescript
export { default } from './Button';
export type { ButtonProps } from './Button';
```

#### 2.3 页面目录 (pages/)

```
src/pages/
├── Home/
│   ├── Home.tsx
│   ├── Home.module.css
│   └── index.ts
├── About/
│   ├── About.tsx
│   ├── About.module.css
│   └── index.ts
├── User/
│   ├── UserList.tsx
│   ├── UserDetail.tsx
│   ├── UserEdit.tsx
│   └── index.ts
└── Auth/
    ├── Login.tsx
    ├── Register.tsx
    └── index.ts
```

**页面组件示例 - Home.tsx：**
```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../services/userService';
import Button from '../components/UI/Button';
import Loading from '../components/UI/Loading';
import styles from './Home.module.css';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
}

const Home: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: getUserStats,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>加载失败</div>;

  return (
    <div className={styles.home}>
      <h1>欢迎来到管理后台</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>总用户数</h3>
          <p>{stats?.totalUsers}</p>
        </div>
        <div className={styles.statCard}>
          <h3>活跃用户</h3>
          <p>{stats?.activeUsers}</p>
        </div>
        <div className={styles.statCard}>
          <h3>新用户</h3>
          <p>{stats?.newUsers}</p>
        </div>
      </div>

      <Button variant="primary" onClick={() => console.log('刷新数据')}>
        刷新数据
      </Button>
    </div>
  );
};

export default Home;
```

#### 2.4 类型定义 (types/)

```
src/types/
├── index.ts                   # 导出所有类型
├── api.ts                     # API 相关类型
├── user.ts                    # 用户相关类型
├── product.ts                 # 产品相关类型
└── common.ts                  # 通用类型
```

**类型定义示例：**
```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  status?: UserStatus;
}

// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// src/types/index.ts
export * from './user';
export * from './api';
export * from './product';
export * from './common';
```

#### 2.5 服务层 (services/)

```
src/services/
├── api.ts                     # API 基础配置
├── userService.ts             # 用户相关 API
├── productService.ts          # 产品相关 API
└── authService.ts             # 认证相关 API
```

**API 服务示例：**
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || '请求失败',
          code: error.response?.status?.toString() || 'UNKNOWN',
          details: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient(process.env.REACT_APP_API_URL || 'http://localhost:3001/api');

// src/services/userService.ts
import { apiClient } from './api';
import { User, CreateUserRequest, UpdateUserRequest, PaginatedResponse } from '../types';

export const userService = {
  // 获取用户列表
  getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 获取用户详情
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // 创建用户
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  },

  // 更新用户
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  // 删除用户
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // 获取用户统计
  getUserStats: async () => {
    const response = await apiClient.get<{
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
    }>('/users/stats');
    return response.data;
  },
};
```

#### 2.6 自定义 Hooks (hooks/)

```
src/hooks/
├── useAuth.ts                 # 认证相关 Hook
├── useLocalStorage.ts         # 本地存储 Hook
├── useDebounce.ts             # 防抖 Hook
├── usePagination.ts           # 分页 Hook
└── index.ts                   # 导出所有 Hooks
```

**自定义 Hook 示例：**
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: userData, token } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({ totalItems, itemsPerPage, initialPage = 1 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [currentPage, totalItems, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    ...paginationData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  };
}
```

#### 2.7 状态管理 (store/)

```
src/store/
├── index.ts                   # Store 配置
├── slices/                    # Redux Toolkit Slices
│   ├── authSlice.ts
│   ├── userSlice.ts
│   └── uiSlice.ts
└── middleware/                # 自定义中间件
    └── apiMiddleware.ts
```

**Redux Toolkit 示例：**
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, PaginatedResponse } from '../../types';
import { userService } from '../../services/userService';

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// 异步 Thunk
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await userService.getUsers(page, limit);
    return response;
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: CreateUserRequest) => {
    const response = await userService.createUser(userData);
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePagination: (state, action: PayloadAction<Partial<UserState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取用户列表
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取用户列表失败';
      })
      // 创建用户
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      });
  },
});

export const { setCurrentUser, clearError, updatePagination } = userSlice.actions;
export default userSlice.reducer;
```

## 📋 配置文件

### TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/hooks/*": ["hooks/*"],
      "@/services/*": ["services/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"]
    }
  },
  "include": [
    "src"
  ]
}
```

### ESLint 配置 (.eslintrc.js)

```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### Package.json 示例

```json
{
  "name": "react-typescript-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@tanstack/react-query": "^4.29.0",
    "@reduxjs/toolkit": "^1.9.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^8.1.0",
    "react-router-dom": "^6.11.0",
    "axios": "^1.4.0",
    "classnames": "^2.3.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.6",
    "@types/react-dom": "^18.2.4",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "eslint": "^8.41.0",
    "eslint-config-prettier": "^8.8.0",
    "prettier": "^2.8.8",
    "typescript": "^5.0.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,css,md}"
  }
}
```

## 🎯 最佳实践

### 1. 文件命名规范
- 组件文件使用 PascalCase：`UserProfile.tsx`
- 普通文件使用 camelCase：`userService.ts`
- 常量文件使用 UPPER_CASE：`API_CONSTANTS.ts`

### 2. 导入顺序
```typescript
// 1. React 相关
import React from 'react';
import { useState, useEffect } from 'react';

// 2. 第三方库
import axios from 'axios';
import classNames from 'classnames';

// 3. 内部模块（按路径层级）
import { User } from '../types';
import { userService } from '../services/userService';
import Button from './Button';

// 4. 样式文件
import styles from './Component.module.css';
```

### 3. 类型定义位置
- 组件 Props 类型：定义在组件文件中
- 业务类型：定义在 `types/` 目录中
- API 类型：定义在对应的 service 文件中

这种结构提供了清晰的代码组织、良好的可维护性和强类型支持，是现代 React TypeScript 项目的标准实践。 