# Chrome DevTools Protocol 主要域(Domains)

Chrome DevTools Protocol将浏览器功能分为多个域(Domain)，每个域负责浏览器的不同方面。以下是主要域的详细介绍。

## 核心域

### DOM

DOM域提供了用于查询和修改DOM的方法。可以用来：
- 查询DOM元素
- 修改DOM结构
- 查找元素属性和计算样式
- 监听DOM事件

常用命令：
- `DOM.getDocument` - 获取整个文档
- `DOM.querySelector` - 使用选择器查找元素
- `DOM.setAttributeValue` - 设置元素属性
- `DOM.removeNode` - 移除节点

### Runtime

Runtime域允许与JavaScript运行时交互，可以：
- 执行JavaScript代码
- 获取JavaScript对象属性
- 监控JavaScript异常

常用命令：
- `Runtime.evaluate` - 执行JavaScript表达式
- `Runtime.getProperties` - 获取对象属性
- `Runtime.callFunctionOn` - 在特定对象上调用函数

### Network

Network域提供了监控和修改网络请求的能力：
- 拦截网络请求
- 监控网络活动
- 获取请求和响应数据
- 修改请求头和响应体

常用命令：
- `Network.enable` - 启用网络监控
- `Network.setCacheDisabled` - 启用/禁用缓存
- `Network.setRequestInterception` - 启用请求拦截(已废弃，推荐使用Fetch域)

### Page

Page域允许与页面进行交互：
- 导航管理
- 执行页面动作
- 截图
- 控制页面行为

常用命令：
- `Page.navigate` - 导航到URL
- `Page.reload` - 重新加载页面
- `Page.captureScreenshot` - 捕获页面截图
- `Page.printToPDF` - 将页面打印为PDF

### Debugger

Debugger域提供了用于JavaScript调试的方法：
- 设置断点
- 步进代码
- 监视变量
- 管理调用堆栈

常用命令：
- `Debugger.enable` - 启用调试器
- `Debugger.setBreakpoint` - 设置断点
- `Debugger.resume` - 恢复执行
- `Debugger.stepOver` - 步过执行

## 网络相关域

### Fetch

Fetch域提供了拦截和修改网络请求的现代方法：
- 拦截请求
- 修改请求和响应
- 提供比Network域更灵活的控制

常用命令：
- `Fetch.enable` - 启用请求拦截
- `Fetch.requestPaused` - 请求暂停事件
- `Fetch.continueRequest` - 继续请求
- `Fetch.fulfillRequest` - 完成请求并提供自定义响应

### Cache

Cache域允许与浏览器缓存交互：
- 查询缓存内容
- 删除缓存条目
- 获取缓存存储信息

## 性能相关域

### Performance

Performance域提供了用于监控页面性能的方法：
- 捕获性能指标
- 监控CPU和内存使用
- 分析性能瓶颈

### Profiler

Profiler域允许控制JavaScript CPU分析器：
- 开始/停止分析
- 收集分析数据
- 分析执行时间

### Memory

Memory域提供了用于与垃圾回收和内存管理交互的方法：
- 强制垃圾回收
- 获取内存堆快照
- 监控内存使用情况

## 界面相关域

### CSS

CSS域提供了用于与CSS交互的方法：
- 获取和修改样式
- 添加和删除规则
- 监控CSS变化

### Animation

Animation域专注于动画控制：
- 查询当前运行的动画
- 控制动画播放
- 获取动画详情

### Emulation

Emulation域用于模拟不同设备环境：
- 模拟移动设备
- 改变设备方向
- 模拟网络条件
- 覆盖地理位置

## 其他实用域

### Storage

Storage域提供了与浏览器存储机制交互的方法：
- 访问localStorage和sessionStorage
- 管理cookies
- 控制IndexedDB

### Security

Security域提供了安全相关功能：
- 处理证书错误
- 监控安全状态
- 启用/禁用安全功能

### Input

Input域允许模拟用户输入：
- 模拟鼠标事件
- 模拟键盘输入
- 模拟触摸事件

## 特殊功能域

### Target

Target域允许创建和操作多个浏览器上下文：
- 创建新标签页
- 获取目标信息
- 附加到目标

### Browser

Browser域提供了与浏览器自身交互的方法：
- 获取浏览器窗口
- 管理浏览器版本信息
- 控制浏览器功能

### Accessibility

Accessibility域提供辅助功能相关的API：
- 检查元素的辅助功能属性
- 获取辅助功能树
- 查询辅助功能状态

## 实验性域

CDP还包含多个处于实验阶段的域，这些域可能在未来的版本中发生变化：

- `HeadlessExperimental` - 无头浏览器特定功能
- `Media` - 媒体播放和控制
- `WebAudio` - Web音频API监控
- `WebAuthn` - Web认证API
- `BackgroundService` - 后台服务监控 