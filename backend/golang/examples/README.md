# Go语言示例代码

本目录包含Go语言学习的示例代码，涵盖从基础语法到高级特性的各种用法。

## 目录结构

### basic/ - 基础语法示例
- `01-hello-world.go` - Hello World程序，变量声明和基本输出
- `02-data-types.go` - 数据类型详解，包括基本类型、复合类型等

### concurrency/ - 并发编程示例
- `01-goroutines.go` - Goroutines基础用法，WaitGroup，并发控制
- `02-channels.go` - Channels通信机制，select语句，各种通信模式

### web/ - Web开发示例
- `01-http-server.go` - HTTP服务器完整示例，包括路由、中间件、JSON处理

### database/ - 数据库操作示例
- `01-sql-basics.go` - SQL数据库基础操作，包括CRUD、事务、连接池

## 运行说明

每个示例都可以直接运行：

```bash
# 运行基础示例
go run basic/01-hello-world.go
go run basic/02-data-types.go

# 运行并发示例
go run concurrency/01-goroutines.go
go run concurrency/02-channels.go

# 运行Web示例
go run web/01-http-server.go
# 然后访问 http://localhost:8080

# 运行数据库示例（需要安装sqlite3驱动）
go mod init example
go get github.com/mattn/go-sqlite3
go run database/01-sql-basics.go
```

## 依赖说明

部分示例需要外部依赖：

- `database/01-sql-basics.go` 需要 `github.com/mattn/go-sqlite3`

安装依赖：
```bash
go mod init example
go get github.com/mattn/go-sqlite3
```

## 学习建议

1. **按序学习**：建议按照 basic → concurrency → web → database 的顺序学习
2. **动手实践**：运行每个示例并观察输出
3. **修改实验**：尝试修改代码参数，观察结果变化
4. **结合文档**：配合相应章节的文档学习理论知识
5. **扩展练习**：基于示例代码进行扩展练习

## 示例特点

- **完整性**：每个示例都是完整可运行的程序
- **实用性**：展示实际开发中的常见用法
- **渐进性**：从简单到复杂，循序渐进
- **注释详细**：中文注释，便于理解

## 获取帮助

如果运行示例遇到问题：

1. 确保Go版本 >= 1.18
2. 检查依赖是否正确安装
3. 查看相应章节的文档说明
4. 检查系统环境配置