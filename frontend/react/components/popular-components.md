# React 生态中的热门组件

## 数据展示组件

### 1. React Table (TanStack Table)
**强大的表格组件**

```bash
npm install @tanstack/react-table
```

```jsx
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'

const data = [
  { id: 1, name: '张三', age: 25, email: 'zhang@example.com' },
  { id: 2, name: '李四', age: 30, email: 'li@example.com' },
  { id: 3, name: '王五', age: 28, email: 'wang@example.com' },
]

const columns = [
  {
    accessorKey: 'name',
    header: '姓名',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'age',
    header: '年龄',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'email',
    header: '邮箱',
    cell: info => info.getValue(),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <div>
        <button onClick={() => handleEdit(row.original)}>编辑</button>
        <button onClick={() => handleDelete(row.original.id)}>删除</button>
      </div>
    ),
  },
]

function DataTable() {
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <input
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="搜索..."
      />
      
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'cursor-pointer' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <span>
          页面 {table.getState().pagination.pageIndex + 1} 共{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
      </div>
    </div>
  )
}
```

### 2. React Charts (Recharts)
**基于 D3 的图表库**

```bash
npm install recharts
```

```jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const lineData = [
  { name: '1月', 销售额: 4000, 利润: 2400 },
  { name: '2月', 销售额: 3000, 利润: 1398 },
  { name: '3月', 销售额: 2000, 利润: 9800 },
  { name: '4月', 销售额: 2780, 利润: 3908 },
  { name: '5月', 销售额: 1890, 利润: 4800 },
  { name: '6月', 销售额: 2390, 利润: 3800 },
]

const pieData = [
  { name: 'PC端', value: 400, color: '#0088FE' },
  { name: '移动端', value: 300, color: '#00C49F' },
  { name: '平板', value: 300, color: '#FFBB28' },
  { name: '其他', value: 200, color: '#FF8042' },
]

function Dashboard() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      {/* 折线图 */}
      <ResponsiveContainer width="100%" height="50%">
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="销售额" stroke="#8884d8" />
          <Line type="monotone" dataKey="利润" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      {/* 柱状图 */}
      <ResponsiveContainer width="50%" height="50%">
        <BarChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="销售额" fill="#8884d8" />
          <Bar dataKey="利润" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* 饼图 */}
      <ResponsiveContainer width="50%" height="50%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

## 输入组件

### 1. React Select
**强大的选择器组件**

```bash
npm install react-select
```

```jsx
import Select from 'react-select'
import { useState } from 'react'

const options = [
  { value: 'chocolate', label: '巧克力' },
  { value: 'strawberry', label: '草莓' },
  { value: 'vanilla', label: '香草' }
]

const groupedOptions = [
  {
    label: '水果',
    options: [
      { value: 'apple', label: '苹果' },
      { value: 'banana', label: '香蕉' },
      { value: 'orange', label: '橙子' }
    ]
  },
  {
    label: '蔬菜',
    options: [
      { value: 'carrot', label: '胡萝卜' },
      { value: 'broccoli', label: '西兰花' },
      { value: 'spinach', label: '菠菜' }
    ]
  }
]

function SelectExample() {
  const [selectedOption, setSelectedOption] = useState(null)
  const [multiValue, setMultiValue] = useState([])

  return (
    <div>
      {/* 基本选择器 */}
      <Select
        value={selectedOption}
        onChange={setSelectedOption}
        options={options}
        placeholder="选择口味..."
        isClearable
        isSearchable
      />

      {/* 多选 */}
      <Select
        value={multiValue}
        onChange={setMultiValue}
        options={options}
        isMulti
        placeholder="选择多个口味..."
      />

      {/* 分组选项 */}
      <Select
        options={groupedOptions}
        placeholder="选择食物..."
        isSearchable
      />

      {/* 异步加载 */}
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        placeholder="搜索用户..."
      />

      {/* 创建选项 */}
      <CreatableSelect
        isClearable
        onChange={setSelectedOption}
        options={options}
        placeholder="选择或创建..."
      />
    </div>
  )
}

// 异步加载选项
const loadOptions = (inputValue) => {
  return fetch(`/api/users?search=${inputValue}`)
    .then(response => response.json())
    .then(users => 
      users.map(user => ({
        value: user.id,
        label: user.name
      }))
    )
}
```

### 2. React Datepicker
**日期选择器组件**

```bash
npm install react-datepicker
```

```jsx
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'

function DatePickerExample() {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(null)
  const [dateRange, setDateRange] = useState([null, null])
  const [startDateRange, endDateRange] = dateRange

  return (
    <div>
      {/* 基本日期选择器 */}
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        dateFormat="yyyy/MM/dd"
        placeholderText="选择日期"
      />

      {/* 日期范围选择器 */}
      <DatePicker
        selectsRange={true}
        startDate={startDateRange}
        endDate={endDateRange}
        onChange={(update) => setDateRange(update)}
        isClearable={true}
        placeholderText="选择日期范围"
      />

      {/* 时间选择器 */}
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="时间"
        dateFormat="yyyy/MM/dd HH:mm"
      />

      {/* 内联日历 */}
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        inline
      />

      {/* 自定义样式 */}
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        customInput={<CustomInput />}
        minDate={new Date()}
        maxDate={new Date().setMonth(new Date().getMonth() + 1)}
        excludeDates={[new Date(), new Date().setDate(new Date().getDate() + 1)]}
      />
    </div>
  )
}

// 自定义输入组件
const CustomInput = ({ value, onClick }) => (
  <button className="custom-input" onClick={onClick}>
    {value || '选择日期'}
  </button>
)
```

## 布局组件

### 1. React Grid Layout
**可拖拽的网格布局**

```bash
npm install react-grid-layout
```

```jsx
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

function DashboardLayout() {
  const layouts = {
    lg: [
      { i: 'chart1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'chart2', x: 6, y: 0, w: 6, h: 4 },
      { i: 'table', x: 0, y: 4, w: 12, h: 6 },
      { i: 'stats', x: 0, y: 10, w: 12, h: 2 }
    ]
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      isDraggable={true}
      isResizable={true}
      onLayoutChange={(layout, layouts) => {
        console.log('布局改变:', layout)
      }}
    >
      <div key="chart1" className="grid-item">
        <h3>销售趋势</h3>
        {/* 图表组件 */}
      </div>
      <div key="chart2" className="grid-item">
        <h3>用户分析</h3>
        {/* 图表组件 */}
      </div>
      <div key="table" className="grid-item">
        <h3>数据表格</h3>
        {/* 表格组件 */}
      </div>
      <div key="stats" className="grid-item">
        <h3>统计信息</h3>
        {/* 统计组件 */}
      </div>
    </ResponsiveGridLayout>
  )
}
```

### 2. React Virtualized / React Window
**虚拟滚动组件**

```bash
npm install react-window react-window-infinite-loader
```

```jsx
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { useState, useEffect } from 'react'

// 大量数据的虚拟列表
function VirtualizedList() {
  const [items, setItems] = useState([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isNextPageLoading, setIsNextPageLoading] = useState(false)

  // 模拟加载更多数据
  const loadMoreItems = async () => {
    if (isNextPageLoading) return
    
    setIsNextPageLoading(true)
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newItems = Array.from({ length: 50 }, (_, index) => ({
      id: items.length + index,
      name: `项目 ${items.length + index + 1}`,
      description: `这是第 ${items.length + index + 1} 个项目的描述`
    }))
    
    setItems(prevItems => [...prevItems, ...newItems])
    setIsNextPageLoading(false)
    
    // 模拟没有更多数据
    if (items.length > 500) {
      setHasNextPage(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadMoreItems()
  }, [])

  const itemCount = hasNextPage ? items.length + 1 : items.length
  const isItemLoaded = index => !!items[index]

  const Item = ({ index, style }) => {
    const item = items[index]
    
    if (!item) {
      return (
        <div style={style}>
          <div className="loading-item">加载中...</div>
        </div>
      )
    }

    return (
      <div style={style}>
        <div className="list-item">
          <h4>{item.name}</h4>
          <p>{item.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={400}
            itemCount={itemCount}
            itemSize={80}
            onItemsRendered={onItemsRendered}
          >
            {Item}
          </List>
        )}
      </InfiniteLoader>
    </div>
  )
}

// 虚拟表格
import { VariableSizeGrid as Grid } from 'react-window'

function VirtualizedTable() {
  const columnCount = 10
  const rowCount = 1000

  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      行 {rowIndex}, 列 {columnIndex}
    </div>
  )

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={index => 100}
      height={400}
      rowCount={rowCount}
      rowHeight={index => 35}
      width={800}
    >
      {Cell}
    </Grid>
  )
}
```

## 导航组件

### 1. React Router Breadcrumbs
**面包屑导航**

```bash
npm install use-react-router-breadcrumbs
```

```jsx
import { useBreadcrumbs } from 'use-react-router-breadcrumbs'
import { Link } from 'react-router-dom'

const routes = [
  { path: '/', breadcrumb: '首页' },
  { path: '/users', breadcrumb: '用户管理' },
  { path: '/users/:id', breadcrumb: UserBreadcrumb },
  { path: '/products', breadcrumb: '产品管理' },
  { path: '/products/:id/edit', breadcrumb: '编辑产品' }
]

function UserBreadcrumb({ match }) {
  const userId = match.params.id
  // 这里可以根据 ID 获取用户名
  return <span>用户 {userId}</span>
}

function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs(routes)

  return (
    <nav className="breadcrumbs">
      {breadcrumbs.map(({ match, breadcrumb }, index) => (
        <span key={match.pathname}>
          {index < breadcrumbs.length - 1 ? (
            <Link to={match.pathname}>{breadcrumb}</Link>
          ) : (
            <span>{breadcrumb}</span>
          )}
          {index < breadcrumbs.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  )
}
```

### 2. React Burger Menu
**汉堡菜单组件**

```bash
npm install react-burger-menu
```

```jsx
import { slide as Menu } from 'react-burger-menu'
import { useState } from 'react'

function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const handleStateChange = (state) => {
    setIsOpen(state.isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <Menu
      isOpen={isOpen}
      onStateChange={handleStateChange}
      customBurgerIcon={<img src="/burger-icon.svg" />}
      customCrossIcon={<img src="/cross-icon.svg" />}
    >
      <a className="menu-item" href="/" onClick={closeMenu}>
        首页
      </a>
      <a className="menu-item" href="/about" onClick={closeMenu}>
        关于我们
      </a>
      <a className="menu-item" href="/services" onClick={closeMenu}>
        服务
      </a>
      <a className="menu-item" href="/contact" onClick={closeMenu}>
        联系我们
      </a>
    </Menu>
  )
}
```

## 反馈组件

### 1. React Hot Toast
**轻量级通知组件**

```bash
npm install react-hot-toast
```

```jsx
import toast, { Toaster } from 'react-hot-toast'

function ToastExample() {
  const notify = () => toast('这是一个通知!')
  const notifySuccess = () => toast.success('操作成功!')
  const notifyError = () => toast.error('操作失败!')
  const notifyLoading = () => {
    const toastId = toast.loading('处理中...')
    
    // 模拟异步操作
    setTimeout(() => {
      toast.success('处理完成!', { id: toastId })
    }, 2000)
  }

  const notifyCustom = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img
                className="h-10 w-10 rounded-full"
                src="/avatar.jpg"
                alt=""
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                新消息
              </p>
              <p className="mt-1 text-sm text-gray-500">
                您有一条新的消息
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            关闭
          </button>
        </div>
      </div>
    ))
  }

  return (
    <div>
      <button onClick={notify}>基本通知</button>
      <button onClick={notifySuccess}>成功通知</button>
      <button onClick={notifyError}>错误通知</button>
      <button onClick={notifyLoading}>加载通知</button>
      <button onClick={notifyCustom}>自定义通知</button>
      
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // 默认选项
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // 成功通知的默认选项
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  )
}
```

### 2. React Spinners
**加载动画组件**

```bash
npm install react-spinners
```

```jsx
import {
  BeatLoader,
  BounceLoader,
  ClipLoader,
  DotLoader,
  FadeLoader,
  GridLoader,
  HashLoader,
  MoonLoader,
  PacmanLoader,
  PropagateLoader,
  PulseLoader,
  RingLoader,
  RiseLoader,
  RotateLoader,
  ScaleLoader,
  SyncLoader
} from 'react-spinners'

function LoadingSpinners() {
  const [loading, setLoading] = useState(true)
  const [color, setColor] = useState('#36d7b7')

  return (
    <div>
      <input
        value={color}
        onChange={(input) => setColor(input.target.value)}
        placeholder="颜色"
      />
      <input
        type="checkbox"
        checked={loading}
        onChange={(input) => setLoading(input.target.checked)}
      />
      
      <div className="spinner-grid">
        <BeatLoader color={color} loading={loading} size={15} />
        <BounceLoader color={color} loading={loading} size={60} />
        <ClipLoader color={color} loading={loading} size={35} />
        <DotLoader color={color} loading={loading} size={60} />
        <FadeLoader color={color} loading={loading} height={15} width={5} />
        <GridLoader color={color} loading={loading} size={15} />
        <HashLoader color={color} loading={loading} size={50} />
        <MoonLoader color={color} loading={loading} size={60} />
        <PacmanLoader color={color} loading={loading} size={25} />
        <PropagateLoader color={color} loading={loading} size={15} />
        <PulseLoader color={color} loading={loading} size={15} />
        <RingLoader color={color} loading={loading} size={60} />
        <RiseLoader color={color} loading={loading} size={15} />
        <RotateLoader color={color} loading={loading} size={15} />
        <ScaleLoader color={color} loading={loading} height={35} width={4} />
        <SyncLoader color={color} loading={loading} size={15} />
      </div>
    </div>
  )
}

// 自定义加载组件
function CustomLoader({ loading, children }) {
  if (loading) {
    return (
      <div className="loader-container">
        <ClipLoader color="#36d7b7" loading={loading} size={35} />
        <p>加载中...</p>
      </div>
    )
  }
  
  return children
}
```

## 媒体组件

### 1. React Player
**通用媒体播放器**

```bash
npm install react-player
```

```jsx
import ReactPlayer from 'react-player'
import { useState, useRef } from 'react'

function MediaPlayer() {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [played, setPlayed] = useState(0)
  const playerRef = useRef(null)

  const handlePlayPause = () => {
    setPlaying(!playing)
  }

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value))
  }

  const handleSeekMouseUp = (e) => {
    playerRef.current.seekTo(parseFloat(e.target.value))
  }

  const handleProgress = (state) => {
    setPlayed(state.played)
  }

  const handleDuration = (duration) => {
    setDuration(duration)
  }

  return (
    <div className="player-wrapper">
      <ReactPlayer
        ref={playerRef}
        className="react-player"
        url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        controls={false}
      />
      
      <div className="player-controls">
        <button onClick={handlePlayPause}>
          {playing ? '暂停' : '播放'}
        </button>
        
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={played}
          onChange={handleSeekChange}
          onMouseUp={handleSeekMouseUp}
        />
        
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
        
        <button onClick={() => setMuted(!muted)}>
          {muted ? '取消静音' : '静音'}
        </button>
      </div>
      
      {/* 支持多种格式 */}
      <ReactPlayer
        url={[
          'https://example.com/video.mp4',
          'https://example.com/video.webm',
          'https://example.com/video.ogv'
        ]}
        controls
      />
      
      {/* 音频播放 */}
      <ReactPlayer
        url="https://example.com/audio.mp3"
        width="100%"
        height="50px"
        controls
      />
    </div>
  )
}
```

### 2. React Image Gallery
**图片画廊组件**

```bash
npm install react-image-gallery
```

```jsx
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'

function PhotoGallery() {
  const images = [
    {
      original: 'https://picsum.photos/1000/600/?random=1',
      thumbnail: 'https://picsum.photos/250/150/?random=1',
      description: '图片描述 1'
    },
    {
      original: 'https://picsum.photos/1000/600/?random=2',
      thumbnail: 'https://picsum.photos/250/150/?random=2',
      description: '图片描述 2'
    },
    {
      original: 'https://picsum.photos/1000/600/?random=3',
      thumbnail: 'https://picsum.photos/250/150/?random=3',
      description: '图片描述 3'
    }
  ]

  return (
    <div>
      <ImageGallery
        items={images}
        showBullets={true}
        showFullscreenButton={true}
        showPlayButton={true}
        showThumbnails={true}
        showIndex={true}
        showNav={true}
        isRTL={false}
        thumbnailPosition="bottom"
        slideInterval={2000}
        slideOnThumbnailOver={false}
        additionalClass="app-image-gallery"
        onImageLoad={(event) => console.log('图片加载完成', event)}
        onSlide={(currentIndex) => console.log('当前图片索引', currentIndex)}
        onScreenChange={(fullScreenElement) => console.log('全屏状态', fullScreenElement)}
        onThumbnailOver={(event, index) => console.log('缩略图悬停', index)}
        onThumbnailClick={(event, index) => console.log('缩略图点击', index)}
        renderCustomControls={() => {
          return (
            <div className="custom-controls">
              <button>自定义按钮</button>
            </div>
          )
        }}
        renderItem={(item) => {
          return (
            <div className="image-gallery-image">
              <img
                src={item.original}
                alt={item.originalAlt}
                srcSet={item.srcSet}
                sizes={item.sizes}
                title={item.originalTitle}
              />
              {item.description && (
                <span className="image-gallery-description">
                  {item.description}
                </span>
              )}
            </div>
          )
        }}
      />
    </div>
  )
}
```

这些组件构成了 React 生态系统中最常用和最强大的组件库，涵盖了从数据展示到用户交互的各个方面。选择合适的组件可以大大提高开发效率，同时确保应用的用户体验和性能。 