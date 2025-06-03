# HTTP流技术详解

本文档介绍两种主要的HTTP流传输技术：Server-Sent Events (SSE)和Streamable HTTP，并详细说明它们之间的区别、使用场景和实现方式。

## 目录

- [概述](#概述)
- [Server-Sent Events (SSE)](#server-sent-events-sse)
- [Streamable HTTP](#streamable-http)
- [技术对比](#技术对比)
- [使用场景](#使用场景)
- [示例代码](#示例代码)

## 概述

在传统的HTTP请求-响应模型中，客户端发送请求，服务器返回完整响应后关闭连接。这种模式不适合需要实时数据更新的应用场景。为了解决这个问题，出现了多种HTTP流技术，允许服务器将数据持续推送给客户端。

## Server-Sent Events (SSE)

### 什么是SSE

Server-Sent Events (SSE)是一种服务器推送技术，允许服务器通过HTTP连接向客户端推送实时更新。SSE是HTML5标准的一部分，使用`EventSource` API实现。

### SSE的工作原理

1. 客户端通过`EventSource` JavaScript API建立与服务器的连接
2. 服务器保持连接打开，并使用特定的基于文本的格式发送事件
3. 当新事件可用时，服务器通过同一连接将其推送给客户端
4. 客户端通过监听事件回调来接收数据

### SSE格式

SSE使用简单的基于文本的协议，每条消息由一个或多个字段组成，每个字段后跟一个换行符：

```
event: eventName
id: messageId
retry: reconnectionTime
data: message content

```

- `event`: 事件类型（可选）
- `id`: 消息ID，用于恢复连接时定位（可选）
- `retry`: 连接断开后的重连时间（毫秒）（可选）
- `data`: 消息内容（必需）
- 每条消息以空行结束

### SSE的特点

- 基于纯HTTP协议，无需额外协议
- 自动重连机制
- 支持消息ID和事件类型
- 只能从服务器到客户端单向传输数据
- 受同源策略限制，但可通过CORS启用跨域
- 默认最大连接数限制（浏览器通常限制为6个）

### 适用场景

- 实时通知和提醒
- 实时数据更新（股票价格、体育比分等）
- 社交媒体动态流
- 日志和事件流
- 基于事件的进度指示器

## Streamable HTTP

### 什么是Streamable HTTP

Streamable HTTP是一种技术，允许服务器以流的形式发送HTTP响应，而不是等待整个响应准备好后一次性发送。这使得客户端可以在完整响应到达之前开始处理数据。

### Streamable HTTP的工作原理

1. 客户端发送常规HTTP请求
2. 服务器开始发送响应，但不关闭连接
3. 服务器逐步生成和发送数据块
4. 客户端收到数据块时立即开始处理
5. 完成后，服务器关闭连接

### HTTP流特性

Streamable HTTP利用了HTTP/1.1引入的分块传输编码（Chunked Transfer Encoding）：

- 响应头包含`Transfer-Encoding: chunked`
- 每个块前面有其大小（十六进制）
- 最后一个块大小为0，表示响应结束

在HTTP/2和HTTP/3中，流处理被进一步优化，支持多路复用和流优先级。

### Streamable HTTP的特点

- 可以提早开始处理数据，减少感知延迟
- 适用于大型响应，无需等待全部生成
- 支持无限长度的响应
- 可用于多种内容类型，不限于文本
- 既可以使用传统的XHR，也可以使用Fetch API实现

### 适用场景

- 大型文件下载
- 逐步渲染的API响应
- 长时间运行的计算结果
- AI生成内容（如大型语言模型的文本生成）
- 视频和音频流传输

## 技术对比

| 特性 | Server-Sent Events (SSE) | Streamable HTTP |
|------|--------------------------|-----------------|
| 标准化 | HTML5标准的一部分 | 基于HTTP标准 |
| 通信方向 | 单向（服务器到客户端） | 单向（服务器到客户端） |
| 客户端API | 专用的EventSource API | 通用的Fetch/XHR API |
| 重连机制 | 自动重连 | 需要手动实现 |
| 消息格式 | 结构化事件格式 | 自定义（常用JSON、文本等） |
| 消息类型 | 支持命名事件 | 需要自定义实现 |
| 跨域支持 | 通过CORS | 通过CORS |
| 内容类型 | 仅text/event-stream | 任何内容类型 |
| 浏览器支持 | 除IE外的现代浏览器 | 所有浏览器 |
| 适用场景 | 事件型实时更新 | 大型响应、流式内容 |

## 关键区别

1. **格式和结构**：
   - SSE有特定的消息格式和结构
   - Streamable HTTP没有预定义的格式，可以自定义

2. **客户端处理**：
   - SSE通过事件监听处理数据
   - Streamable HTTP通过流处理接口处理数据

3. **用途侧重**：
   - SSE专为事件推送设计
   - Streamable HTTP更通用，适用于各种流内容

4. **连接特性**：
   - SSE维护长连接用于多个事件
   - Streamable HTTP通常为单次响应（尽管连接可能持续很长时间）

## 使用场景

### 何时使用SSE

- 需要服务器定期推送离散事件
- 需要自动重连机制
- 需要结构化事件处理
- 实时通知、提醒和数据更新

### 何时使用Streamable HTTP

- 需要处理大型响应
- 生成内容需要长时间（如AI生成文本）
- 需要自定义数据格式
- 内容是连续的而非离散事件
- 需要在旧浏览器上工作

## 示例代码

本仓库包含使用不同技术栈实现SSE和Streamable HTTP的示例：

- [JavaScript SSE 示例](./examples/js_sse.js) - 使用Node.js和浏览器实现SSE
- [JavaScript Streamable HTTP 示例](./examples/js_streamable.js) - 使用Node.js和Fetch API实现HTTP流
- [Python SSE 示例](./examples/python_sse.py) - 使用Flask实现SSE
- [Python Streamable HTTP 示例](./examples/python_streamable.py) - 使用Flask实现HTTP流

每个示例都包含服务器和客户端代码，并附有详细注释。

## 结论

SSE和Streamable HTTP都是实现服务器到客户端流数据传输的有效技术，选择哪种取决于具体的应用场景和需求：

- SSE更适合事件型通知和实时更新
- Streamable HTTP更适合大型响应和自定义流格式

在现代Web应用开发中，这两种技术常常与WebSockets互补使用，为开发者提供完整的实时通信解决方案。 