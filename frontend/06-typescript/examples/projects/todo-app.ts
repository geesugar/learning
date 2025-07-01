/**
 * TypeScript Todo 应用示例
 * 
 * 这是一个完整的 Todo 应用，展示了 TypeScript 在实际项目中的应用：
 * - 接口定义和类型安全
 * - 泛型的实际使用
 * - 错误处理和验证
 * - 事件系统和状态管理
 * - 本地存储和数据持久化
 */

// =============================================================================
// 1. 基础类型定义
// =============================================================================

// Todo 项目接口
interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    category?: string;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
}

// Todo 筛选条件
interface TodoFilter {
    status?: 'all' | 'active' | 'completed';
    priority?: Todo['priority'];
    category?: string;
    tag?: string;
    dueDateRange?: {
        start: Date;
        end: Date;
    };
}

// Todo 排序选项
interface TodoSort {
    field: keyof Todo;
    direction: 'asc' | 'desc';
}

// 统计信息
interface TodoStats {
    total: number;
    completed: number;
    active: number;
    overdue: number;
    byPriority: Record<Todo['priority'], number>;
    byCategory: Record<string, number>;
}

// 应用状态
interface AppState {
    todos: Todo[];
    filter: TodoFilter;
    sort: TodoSort;
    searchQuery: string;
    selectedTodo: Todo | null;
    isLoading: boolean;
    error: string | null;
}

// =============================================================================
// 2. 工具类型和验证
// =============================================================================

// 创建 Todo 的输入类型
type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'> & {
    completed?: boolean;
};

// 更新 Todo 的输入类型
type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;

// 验证结果类型
interface ValidationResult<T> {
    isValid: boolean;
    errors: string[];
    data?: T;
}

// Todo 验证器
class TodoValidator {
    static validateTitle(title: string): ValidationResult<string> {
        const errors: string[] = [];
        
        if (!title || title.trim().length === 0) {
            errors.push('标题不能为空');
        }
        
        if (title.length > 100) {
            errors.push('标题长度不能超过100个字符');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            data: title.trim()
        };
    }
    
    static validateDescription(description?: string): ValidationResult<string | undefined> {
        const errors: string[] = [];
        
        if (description && description.length > 500) {
            errors.push('描述长度不能超过500个字符');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            data: description?.trim()
        };
    }
    
    static validatePriority(priority: string): ValidationResult<Todo['priority']> {
        const errors: string[] = [];
        const validPriorities: Todo['priority'][] = ['low', 'medium', 'high'];
        
        if (!validPriorities.includes(priority as Todo['priority'])) {
            errors.push('优先级必须是 low、medium 或 high');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            data: priority as Todo['priority']
        };
    }
    
    static validateDueDate(dueDate?: Date): ValidationResult<Date | undefined> {
        const errors: string[] = [];
        
        if (dueDate && dueDate < new Date()) {
            errors.push('截止日期不能早于今天');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            data: dueDate
        };
    }
    
    static validateCreateInput(input: CreateTodoInput): ValidationResult<CreateTodoInput> {
        const titleResult = this.validateTitle(input.title);
        const descriptionResult = this.validateDescription(input.description);
        const priorityResult = this.validatePriority(input.priority);
        const dueDateResult = this.validateDueDate(input.dueDate);
        
        const allErrors = [
            ...titleResult.errors,
            ...descriptionResult.errors,
            ...priorityResult.errors,
            ...dueDateResult.errors
        ];
        
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            data: allErrors.length === 0 ? {
                ...input,
                title: titleResult.data!,
                description: descriptionResult.data,
                priority: priorityResult.data!,
                dueDate: dueDateResult.data
            } : undefined
        };
    }
}

// =============================================================================
// 3. 泛型事件系统
// =============================================================================

// 事件类型定义
interface TodoEvents {
    todoCreated: { todo: Todo };
    todoUpdated: { todo: Todo; changes: UpdateTodoInput };
    todoDeleted: { id: string };
    todoCompleted: { todo: Todo };
    filterChanged: { filter: TodoFilter };
    sortChanged: { sort: TodoSort };
    searchChanged: { query: string };
    error: { message: string; details?: any };
}

// 泛型事件发射器
class EventEmitter<TEvents> {
    private listeners: { [K in keyof TEvents]?: Array<(data: TEvents[K]) => void> } = {};
    
    on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }
    
    off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }
    
    emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in event listener for ${String(event)}:`, error);
                }
            });
        }
    }
    
    once<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
        const onceListener = (data: TEvents[K]) => {
            listener(data);
            this.off(event, onceListener);
        };
        this.on(event, onceListener);
    }
}

// =============================================================================
// 4. 本地存储管理
// =============================================================================

// 泛型存储接口
interface Storage<T> {
    get(key: string): T | null;
    set(key: string, value: T): void;
    remove(key: string): void;
    clear(): void;
    keys(): string[];
}

// 本地存储实现
class LocalStorage<T> implements Storage<T> {
    get(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Failed to get item from localStorage:', error);
            return null;
        }
    }
    
    set(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to set item in localStorage:', error);
        }
    }
    
    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove item from localStorage:', error);
        }
    }
    
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }
    
    keys(): string[] {
        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('Failed to get keys from localStorage:', error);
            return [];
        }
    }
}

// =============================================================================
// 5. Todo 服务层
// =============================================================================

class TodoService {
    private storage: Storage<Todo[]>;
    private eventEmitter: EventEmitter<TodoEvents>;
    private readonly STORAGE_KEY = 'todos';
    
    constructor(storage: Storage<Todo[]>, eventEmitter: EventEmitter<TodoEvents>) {
        this.storage = storage;
        this.eventEmitter = eventEmitter;
    }
    
    // 获取所有 Todo
    getAllTodos(): Todo[] {
        return this.storage.get(this.STORAGE_KEY) || [];
    }
    
    // 根据 ID 获取 Todo
    getTodoById(id: string): Todo | null {
        const todos = this.getAllTodos();
        return todos.find(todo => todo.id === id) || null;
    }
    
    // 创建新 Todo
    createTodo(input: CreateTodoInput): Todo | null {
        const validation = TodoValidator.validateCreateInput(input);
        
        if (!validation.isValid) {
            this.eventEmitter.emit('error', {
                message: '创建 Todo 失败',
                details: validation.errors
            });
            return null;
        }
        
        const todo: Todo = {
            id: this.generateId(),
            ...validation.data!,
            completed: input.completed || false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const todos = this.getAllTodos();
        todos.push(todo);
        this.storage.set(this.STORAGE_KEY, todos);
        
        this.eventEmitter.emit('todoCreated', { todo });
        return todo;
    }
    
    // 更新 Todo
    updateTodo(id: string, updates: UpdateTodoInput): Todo | null {
        const todos = this.getAllTodos();
        const todoIndex = todos.findIndex(todo => todo.id === id);
        
        if (todoIndex === -1) {
            this.eventEmitter.emit('error', {
                message: 'Todo 不存在',
                details: { id }
            });
            return null;
        }
        
        const originalTodo = todos[todoIndex];
        const updatedTodo: Todo = {
            ...originalTodo,
            ...updates,
            id: originalTodo.id,
            createdAt: originalTodo.createdAt,
            updatedAt: new Date()
        };
        
        todos[todoIndex] = updatedTodo;
        this.storage.set(this.STORAGE_KEY, todos);
        
        this.eventEmitter.emit('todoUpdated', { todo: updatedTodo, changes: updates });
        
        if (updates.completed === true && !originalTodo.completed) {
            this.eventEmitter.emit('todoCompleted', { todo: updatedTodo });
        }
        
        return updatedTodo;
    }
    
    // 删除 Todo
    deleteTodo(id: string): boolean {
        const todos = this.getAllTodos();
        const todoIndex = todos.findIndex(todo => todo.id === id);
        
        if (todoIndex === -1) {
            this.eventEmitter.emit('error', {
                message: 'Todo 不存在',
                details: { id }
            });
            return false;
        }
        
        todos.splice(todoIndex, 1);
        this.storage.set(this.STORAGE_KEY, todos);
        
        this.eventEmitter.emit('todoDeleted', { id });
        return true;
    }
    
    // 批量删除已完成的 Todo
    deleteCompletedTodos(): number {
        const todos = this.getAllTodos();
        const activeTodos = todos.filter(todo => !todo.completed);
        const deletedCount = todos.length - activeTodos.length;
        
        if (deletedCount > 0) {
            this.storage.set(this.STORAGE_KEY, activeTodos);
        }
        
        return deletedCount;
    }
    
    // 切换 Todo 完成状态
    toggleTodo(id: string): Todo | null {
        const todo = this.getTodoById(id);
        if (!todo) {
            return null;
        }
        
        return this.updateTodo(id, { completed: !todo.completed });
    }
    
    // 获取统计信息
    getStats(): TodoStats {
        const todos = this.getAllTodos();
        const now = new Date();
        
        const stats: TodoStats = {
            total: todos.length,
            completed: 0,
            active: 0,
            overdue: 0,
            byPriority: { low: 0, medium: 0, high: 0 },
            byCategory: {}
        };
        
        todos.forEach(todo => {
            // 完成状态统计
            if (todo.completed) {
                stats.completed++;
            } else {
                stats.active++;
            }
            
            // 过期统计
            if (todo.dueDate && new Date(todo.dueDate) < now && !todo.completed) {
                stats.overdue++;
            }
            
            // 优先级统计
            stats.byPriority[todo.priority]++;
            
            // 分类统计
            if (todo.category) {
                stats.byCategory[todo.category] = (stats.byCategory[todo.category] || 0) + 1;
            }
        });
        
        return stats;
    }
    
    // 搜索 Todo
    searchTodos(query: string): Todo[] {
        if (!query.trim()) {
            return this.getAllTodos();
        }
        
        const todos = this.getAllTodos();
        const searchQuery = query.toLowerCase();
        
        return todos.filter(todo => 
            todo.title.toLowerCase().includes(searchQuery) ||
            (todo.description && todo.description.toLowerCase().includes(searchQuery)) ||
            (todo.category && todo.category.toLowerCase().includes(searchQuery)) ||
            todo.tags.some(tag => tag.toLowerCase().includes(searchQuery))
        );
    }
    
    // 筛选 Todo
    filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
        return todos.filter(todo => {
            // 状态筛选
            if (filter.status) {
                if (filter.status === 'completed' && !todo.completed) return false;
                if (filter.status === 'active' && todo.completed) return false;
            }
            
            // 优先级筛选
            if (filter.priority && todo.priority !== filter.priority) {
                return false;
            }
            
            // 分类筛选
            if (filter.category && todo.category !== filter.category) {
                return false;
            }
            
            // 标签筛选
            if (filter.tag && !todo.tags.includes(filter.tag)) {
                return false;
            }
            
            // 截止日期范围筛选
            if (filter.dueDateRange && todo.dueDate) {
                const dueDate = new Date(todo.dueDate);
                if (dueDate < filter.dueDateRange.start || dueDate > filter.dueDateRange.end) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    // 排序 Todo
    sortTodos(todos: Todo[], sort: TodoSort): Todo[] {
        return [...todos].sort((a, b) => {
            let aValue = a[sort.field];
            let bValue = b[sort.field];
            
            // 处理日期类型
            if (aValue instanceof Date) aValue = aValue.getTime();
            if (bValue instanceof Date) bValue = bValue.getTime();
            
            // 处理数组类型（tags）
            if (Array.isArray(aValue)) aValue = aValue.length;
            if (Array.isArray(bValue)) bValue = bValue.length;
            
            // 处理 undefined 和 null
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sort.direction === 'asc' ? 1 : -1;
            if (bValue == null) return sort.direction === 'asc' ? -1 : 1;
            
            let comparison = 0;
            if (aValue < bValue) {
                comparison = -1;
            } else if (aValue > bValue) {
                comparison = 1;
            }
            
            return sort.direction === 'asc' ? comparison : -comparison;
        });
    }
    
    // 生成唯一 ID
    private generateId(): string {
        return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// =============================================================================
// 6. 状态管理器
// =============================================================================

class TodoStore {
    private state: AppState;
    private todoService: TodoService;
    private eventEmitter: EventEmitter<TodoEvents>;
    private listeners: Array<(state: AppState) => void> = [];
    
    constructor(todoService: TodoService, eventEmitter: EventEmitter<TodoEvents>) {
        this.todoService = todoService;
        this.eventEmitter = eventEmitter;
        
        this.state = {
            todos: this.todoService.getAllTodos(),
            filter: { status: 'all' },
            sort: { field: 'createdAt', direction: 'desc' },
            searchQuery: '',
            selectedTodo: null,
            isLoading: false,
            error: null
        };
        
        this.bindEvents();
    }
    
    // 获取当前状态
    getState(): AppState {
        return { ...this.state };
    }
    
    // 订阅状态变化
    subscribe(listener: (state: AppState) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    
    // 获取筛选后的 Todo 列表
    getFilteredTodos(): Todo[] {
        let todos = this.todoService.getAllTodos();
        
        // 搜索
        if (this.state.searchQuery) {
            todos = this.todoService.searchTodos(this.state.searchQuery);
        }
        
        // 筛选
        todos = this.todoService.filterTodos(todos, this.state.filter);
        
        // 排序
        todos = this.todoService.sortTodos(todos, this.state.sort);
        
        return todos;
    }
    
    // 设置筛选条件
    setFilter(filter: Partial<TodoFilter>): void {
        this.state.filter = { ...this.state.filter, ...filter };
        this.eventEmitter.emit('filterChanged', { filter: this.state.filter });
        this.notifyListeners();
    }
    
    // 设置排序方式
    setSort(sort: TodoSort): void {
        this.state.sort = sort;
        this.eventEmitter.emit('sortChanged', { sort });
        this.notifyListeners();
    }
    
    // 设置搜索查询
    setSearchQuery(query: string): void {
        this.state.searchQuery = query;
        this.eventEmitter.emit('searchChanged', { query });
        this.notifyListeners();
    }
    
    // 选择 Todo
    selectTodo(id: string | null): void {
        this.state.selectedTodo = id ? this.todoService.getTodoById(id) : null;
        this.notifyListeners();
    }
    
    // 设置加载状态
    setLoading(isLoading: boolean): void {
        this.state.isLoading = isLoading;
        this.notifyListeners();
    }
    
    // 设置错误状态
    setError(error: string | null): void {
        this.state.error = error;
        this.notifyListeners();
    }
    
    // 绑定事件监听器
    private bindEvents(): void {
        this.eventEmitter.on('todoCreated', () => {
            this.state.todos = this.todoService.getAllTodos();
            this.notifyListeners();
        });
        
        this.eventEmitter.on('todoUpdated', () => {
            this.state.todos = this.todoService.getAllTodos();
            this.notifyListeners();
        });
        
        this.eventEmitter.on('todoDeleted', () => {
            this.state.todos = this.todoService.getAllTodos();
            this.state.selectedTodo = null;
            this.notifyListeners();
        });
        
        this.eventEmitter.on('error', (data) => {
            this.setError(data.message);
        });
    }
    
    // 通知所有监听器
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }
}

// =============================================================================
// 7. 应用入口和使用示例
// =============================================================================

class TodoApp {
    private todoService: TodoService;
    private todoStore: TodoStore;
    private eventEmitter: EventEmitter<TodoEvents>;
    
    constructor() {
        // 初始化依赖
        const storage = new LocalStorage<Todo[]>();
        this.eventEmitter = new EventEmitter<TodoEvents>();
        this.todoService = new TodoService(storage, this.eventEmitter);
        this.todoStore = new TodoStore(this.todoService, this.eventEmitter);
        
        this.bindEventListeners();
        this.initializeWithSampleData();
    }
    
    // 获取当前状态
    getState(): AppState {
        return this.todoStore.getState();
    }
    
    // 获取筛选后的 Todo 列表
    getTodos(): Todo[] {
        return this.todoStore.getFilteredTodos();
    }
    
    // 获取统计信息
    getStats(): TodoStats {
        return this.todoService.getStats();
    }
    
    // 创建 Todo
    createTodo(input: CreateTodoInput): Todo | null {
        return this.todoService.createTodo(input);
    }
    
    // 更新 Todo
    updateTodo(id: string, updates: UpdateTodoInput): Todo | null {
        return this.todoService.updateTodo(id, updates);
    }
    
    // 删除 Todo
    deleteTodo(id: string): boolean {
        return this.todoService.deleteTodo(id);
    }
    
    // 切换 Todo 完成状态
    toggleTodo(id: string): Todo | null {
        return this.todoService.toggleTodo(id);
    }
    
    // 设置筛选条件
    setFilter(filter: Partial<TodoFilter>): void {
        this.todoStore.setFilter(filter);
    }
    
    // 设置排序方式
    setSort(sort: TodoSort): void {
        this.todoStore.setSort(sort);
    }
    
    // 搜索 Todo
    search(query: string): void {
        this.todoStore.setSearchQuery(query);
    }
    
    // 选择 Todo
    selectTodo(id: string | null): void {
        this.todoStore.selectTodo(id);
    }
    
    // 清理已完成的 Todo
    clearCompleted(): number {
        return this.todoService.deleteCompletedTodos();
    }
    
    // 订阅状态变化
    subscribe(listener: (state: AppState) => void): () => void {
        return this.todoStore.subscribe(listener);
    }
    
    // 绑定事件监听器
    private bindEventListeners(): void {
        this.eventEmitter.on('todoCreated', (data) => {
            console.log('✅ Todo 创建成功:', data.todo.title);
        });
        
        this.eventEmitter.on('todoUpdated', (data) => {
            console.log('📝 Todo 更新成功:', data.todo.title);
        });
        
        this.eventEmitter.on('todoCompleted', (data) => {
            console.log('🎉 Todo 完成:', data.todo.title);
        });
        
        this.eventEmitter.on('todoDeleted', (data) => {
            console.log('🗑️ Todo 删除成功:', data.id);
        });
        
        this.eventEmitter.on('error', (data) => {
            console.error('❌ 错误:', data.message, data.details);
        });
    }
    
    // 初始化示例数据
    private initializeWithSampleData(): void {
        const existingTodos = this.todoService.getAllTodos();
        if (existingTodos.length === 0) {
            const sampleTodos: CreateTodoInput[] = [
                {
                    title: '学习 TypeScript',
                    description: '完成 TypeScript 基础教程',
                    priority: 'high',
                    category: '学习',
                    tags: ['编程', 'TypeScript'],
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 一周后
                },
                {
                    title: '写项目文档',
                    description: '为新项目编写详细的文档',
                    priority: 'medium',
                    category: '工作',
                    tags: ['文档', '项目'],
                    completed: false
                },
                {
                    title: '买菜',
                    description: '购买这周的蔬菜和水果',
                    priority: 'low',
                    category: '生活',
                    tags: ['购物', '日常'],
                    completed: true
                }
            ];
            
            sampleTodos.forEach(todo => {
                this.todoService.createTodo(todo);
            });
        }
    }
}

// =============================================================================
// 8. 使用示例和测试
// =============================================================================

// 创建应用实例
const app = new TodoApp();

// 监听状态变化
const unsubscribe = app.subscribe((state) => {
    console.log('📊 状态更新:', {
        todosCount: state.todos.length,
        filter: state.filter,
        searchQuery: state.searchQuery,
        selectedTodo: state.selectedTodo?.title || null
    });
});

// 演示应用功能
console.log('\n=== Todo 应用演示 ===');

// 显示初始状态
console.log('\n📊 初始统计:');
console.log(app.getStats());

// 创建新 Todo
console.log('\n➕ 创建新 Todo:');
const newTodo = app.createTodo({
    title: '完成 TypeScript 示例',
    description: '编写完整的 Todo 应用示例',
    priority: 'high',
    category: '编程',
    tags: ['TypeScript', '示例', '编程'],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 三天后
});

if (newTodo) {
    console.log('✅ 新 Todo 创建成功:', newTodo.title);
}

// 搜索功能
console.log('\n🔍 搜索 "TypeScript":');
app.search('TypeScript');
const searchResults = app.getTodos();
console.log(`找到 ${searchResults.length} 个结果:`);
searchResults.forEach(todo => {
    console.log(`- ${todo.title} (${todo.priority})`);
});

// 筛选功能
console.log('\n📋 筛选高优先级的 Todo:');
app.setFilter({ priority: 'high' });
const highPriorityTodos = app.getTodos();
console.log(`找到 ${highPriorityTodos.length} 个高优先级 Todo:`);
highPriorityTodos.forEach(todo => {
    console.log(`- ${todo.title} (${todo.completed ? '已完成' : '未完成'})`);
});

// 切换 Todo 状态
if (newTodo) {
    console.log('\n🔄 切换 Todo 完成状态:');
    const toggledTodo = app.toggleTodo(newTodo.id);
    if (toggledTodo) {
        console.log(`📝 ${toggledTodo.title} 状态更新为: ${toggledTodo.completed ? '已完成' : '未完成'}`);
    }
}

// 最终统计
console.log('\n📊 最终统计:');
console.log(app.getStats());

// 清理订阅
setTimeout(() => {
    unsubscribe();
    console.log('\n👋 应用演示结束');
}, 100);

// 导出供其他模块使用
export {
    type Todo,
    type TodoFilter,
    type TodoSort,
    type TodoStats,
    type CreateTodoInput,
    type UpdateTodoInput,
    type ValidationResult,
    TodoValidator,
    TodoService,
    TodoStore,
    TodoApp,
    EventEmitter,
    LocalStorage
}; 