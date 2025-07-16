# gRPC框架

## 什么是gRPC

gRPC（Google Remote Procedure Call）是Google开发的高性能、开源的RPC框架。它使用Protocol Buffers作为接口定义语言（IDL），支持多种编程语言，非常适合微服务架构。

## gRPC的特点

### 1. 高性能
- 基于HTTP/2协议
- 使用Protocol Buffers二进制序列化
- 支持多路复用和流式处理

### 2. 跨平台
- 支持多种编程语言
- 统一的接口定义
- 自动生成客户端和服务器代码

### 3. 强类型
- 基于Protocol Buffers的强类型系统
- 编译时类型检查
- 向后兼容性

## Protocol Buffers基础

### 1. 安装Protocol Buffers编译器

```bash
# macOS
brew install protobuf

# Ubuntu
sudo apt-get install protobuf-compiler

# 验证安装
protoc --version
```

### 2. 安装Go插件

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

### 3. 基本语法

```protobuf
// user.proto
syntax = "proto3";

package user;

option go_package = "./pb";

// 消息定义
message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  repeated string tags = 5;
}

message GetUserRequest {
  int64 id = 1;
}

message GetUserResponse {
  User user = 1;
}

// 服务定义
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(User) returns (User);
  rpc UpdateUser(User) returns (User);
  rpc DeleteUser(GetUserRequest) returns (google.protobuf.Empty);
}
```

### 4. 生成代码

```bash
protoc --go_out=. --go-grpc_out=. user.proto
```

## gRPC服务端实现

### 1. 创建服务结构

```go
// server/main.go
package main

import (
    "context"
    "fmt"
    "log"
    "net"
    
    "google.golang.org/grpc"
    "google.golang.org/grpc/reflection"
    "your-project/pb"
)

// 实现服务接口
type userService struct {
    pb.UnimplementedUserServiceServer
    users map[int64]*pb.User
}

// 实现GetUser方法
func (s *userService) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    user, exists := s.users[req.Id]
    if !exists {
        return nil, fmt.Errorf("user not found")
    }
    
    return &pb.GetUserResponse{
        User: user,
    }, nil
}

// 实现CreateUser方法
func (s *userService) CreateUser(ctx context.Context, user *pb.User) (*pb.User, error) {
    // 生成新的ID
    user.Id = int64(len(s.users) + 1)
    s.users[user.Id] = user
    
    return user, nil
}

// 实现UpdateUser方法
func (s *userService) UpdateUser(ctx context.Context, user *pb.User) (*pb.User, error) {
    if _, exists := s.users[user.Id]; !exists {
        return nil, fmt.Errorf("user not found")
    }
    
    s.users[user.Id] = user
    return user, nil
}

// 实现DeleteUser方法
func (s *userService) DeleteUser(ctx context.Context, req *pb.GetUserRequest) (*emptypb.Empty, error) {
    if _, exists := s.users[req.Id]; !exists {
        return nil, fmt.Errorf("user not found")
    }
    
    delete(s.users, req.Id)
    return &emptypb.Empty{}, nil
}

func main() {
    // 创建监听器
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }

    // 创建gRPC服务器
    s := grpc.NewServer()
    
    // 注册服务
    userSvc := &userService{
        users: make(map[int64]*pb.User),
    }
    pb.RegisterUserServiceServer(s, userSvc)
    
    // 注册反射服务（用于调试）
    reflection.Register(s)
    
    log.Printf("server listening at %v", lis.Addr())
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

### 2. 中间件支持

```go
// 日志中间件
func LoggingInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    log.Printf("gRPC method: %s", info.FullMethod)
    start := time.Now()
    
    resp, err := handler(ctx, req)
    
    log.Printf("gRPC method: %s, duration: %v", info.FullMethod, time.Since(start))
    return resp, err
}

// 创建带中间件的服务器
s := grpc.NewServer(
    grpc.UnaryInterceptor(LoggingInterceptor),
)
```

## gRPC客户端实现

### 1. 基本客户端

```go
// client/main.go
package main

import (
    "context"
    "log"
    "time"
    
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    "your-project/pb"
)

func main() {
    // 建立连接
    conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        log.Fatalf("did not connect: %v", err)
    }
    defer conn.Close()
    
    // 创建客户端
    client := pb.NewUserServiceClient(conn)
    
    // 创建用户
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel()
    
    user := &pb.User{
        Name:  "John Doe",
        Email: "john@example.com",
        Age:   30,
        Tags:  []string{"developer", "golang"},
    }
    
    createdUser, err := client.CreateUser(ctx, user)
    if err != nil {
        log.Fatalf("could not create user: %v", err)
    }
    
    log.Printf("Created user: %v", createdUser)
    
    // 获取用户
    getUserReq := &pb.GetUserRequest{Id: createdUser.Id}
    getUserResp, err := client.GetUser(ctx, getUserReq)
    if err != nil {
        log.Fatalf("could not get user: %v", err)
    }
    
    log.Printf("Retrieved user: %v", getUserResp.User)
}
```

### 2. 连接池

```go
// 连接池实现
type ConnectionPool struct {
    target   string
    pool     chan *grpc.ClientConn
    maxSize  int
    connFunc func() (*grpc.ClientConn, error)
}

func NewConnectionPool(target string, maxSize int) *ConnectionPool {
    return &ConnectionPool{
        target:  target,
        pool:    make(chan *grpc.ClientConn, maxSize),
        maxSize: maxSize,
        connFunc: func() (*grpc.ClientConn, error) {
            return grpc.Dial(target, grpc.WithTransportCredentials(insecure.NewCredentials()))
        },
    }
}

func (p *ConnectionPool) Get() (*grpc.ClientConn, error) {
    select {
    case conn := <-p.pool:
        return conn, nil
    default:
        return p.connFunc()
    }
}

func (p *ConnectionPool) Put(conn *grpc.ClientConn) {
    select {
    case p.pool <- conn:
    default:
        conn.Close()
    }
}
```

## 流式处理

### 1. 服务器端流式

```protobuf
// 服务器端流式RPC
service UserService {
  rpc ListUsers(ListUsersRequest) returns (stream User);
}
```

```go
// 服务器端实现
func (s *userService) ListUsers(req *pb.ListUsersRequest, stream pb.UserService_ListUsersServer) error {
    for _, user := range s.users {
        if err := stream.Send(user); err != nil {
            return err
        }
    }
    return nil
}

// 客户端调用
stream, err := client.ListUsers(ctx, &pb.ListUsersRequest{})
if err != nil {
    log.Fatalf("could not list users: %v", err)
}

for {
    user, err := stream.Recv()
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatalf("stream error: %v", err)
    }
    log.Printf("User: %v", user)
}
```

### 2. 客户端流式

```protobuf
// 客户端流式RPC
service UserService {
  rpc CreateUsers(stream User) returns (CreateUsersResponse);
}
```

```go
// 服务器端实现
func (s *userService) CreateUsers(stream pb.UserService_CreateUsersServer) error {
    var count int32
    for {
        user, err := stream.Recv()
        if err == io.EOF {
            return stream.SendAndClose(&pb.CreateUsersResponse{Count: count})
        }
        if err != nil {
            return err
        }
        
        user.Id = int64(len(s.users) + 1)
        s.users[user.Id] = user
        count++
    }
}

// 客户端调用
stream, err := client.CreateUsers(ctx)
if err != nil {
    log.Fatalf("could not create users: %v", err)
}

users := []*pb.User{
    {Name: "User1", Email: "user1@example.com"},
    {Name: "User2", Email: "user2@example.com"},
}

for _, user := range users {
    if err := stream.Send(user); err != nil {
        log.Fatalf("stream send error: %v", err)
    }
}

resp, err := stream.CloseAndRecv()
if err != nil {
    log.Fatalf("stream close error: %v", err)
}
log.Printf("Created %d users", resp.Count)
```

### 3. 双向流式

```protobuf
// 双向流式RPC
service UserService {
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}
```

```go
// 服务器端实现
func (s *userService) Chat(stream pb.UserService_ChatServer) error {
    for {
        msg, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        if err != nil {
            return err
        }
        
        // 处理消息并回复
        response := &pb.ChatMessage{
            User:    "Bot",
            Message: fmt.Sprintf("Echo: %s", msg.Message),
        }
        
        if err := stream.Send(response); err != nil {
            return err
        }
    }
}
```

## 错误处理

### 1. 标准错误码

```go
import (
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func (s *userService) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    if req.Id <= 0 {
        return nil, status.Errorf(codes.InvalidArgument, "invalid user ID: %d", req.Id)
    }
    
    user, exists := s.users[req.Id]
    if !exists {
        return nil, status.Errorf(codes.NotFound, "user not found: %d", req.Id)
    }
    
    return &pb.GetUserResponse{User: user}, nil
}
```

### 2. 客户端错误处理

```go
resp, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 999})
if err != nil {
    if st, ok := status.FromError(err); ok {
        switch st.Code() {
        case codes.NotFound:
            log.Printf("User not found: %s", st.Message())
        case codes.InvalidArgument:
            log.Printf("Invalid argument: %s", st.Message())
        default:
            log.Printf("RPC error: %s", st.Message())
        }
    }
    return
}
```

## 认证和安全

### 1. TLS加密

```go
// 服务器端
creds, err := credentials.NewServerTLSFromFile("server.crt", "server.key")
if err != nil {
    log.Fatalf("failed to load TLS credentials: %v", err)
}

s := grpc.NewServer(grpc.Creds(creds))

// 客户端
creds, err := credentials.NewClientTLSFromFile("server.crt", "")
if err != nil {
    log.Fatalf("failed to load TLS credentials: %v", err)
}

conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(creds))
```

### 2. Token认证

```go
// Token认证实现
type TokenAuth struct {
    token string
}

func (t TokenAuth) GetRequestMetadata(ctx context.Context, uri ...string) (map[string]string, error) {
    return map[string]string{
        "authorization": "Bearer " + t.token,
    }, nil
}

func (t TokenAuth) RequireTransportSecurity() bool {
    return false
}

// 客户端使用
conn, err := grpc.Dial("localhost:50051", 
    grpc.WithTransportCredentials(insecure.NewCredentials()),
    grpc.WithPerRPCCredentials(TokenAuth{token: "your-token"}))
```

## 性能优化

### 1. 连接复用

```go
// 使用单个连接处理多个请求
conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
if err != nil {
    log.Fatalf("did not connect: %v", err)
}
defer conn.Close()

client := pb.NewUserServiceClient(conn)

// 多个goroutine复用同一个连接
for i := 0; i < 100; i++ {
    go func(id int) {
        req := &pb.GetUserRequest{Id: int64(id)}
        resp, err := client.GetUser(context.Background(), req)
        // 处理响应
    }(i)
}
```

### 2. 压缩

```go
// 服务器端启用压缩
s := grpc.NewServer(
    grpc.RPCCompressor(grpc.NewGZIPCompressor()),
    grpc.RPCDecompressor(grpc.NewGZIPDecompressor()),
)

// 客户端启用压缩
conn, err := grpc.Dial("localhost:50051",
    grpc.WithTransportCredentials(insecure.NewCredentials()),
    grpc.WithDefaultCallOptions(grpc.UseCompressor(gzip.Name)),
)
```

## 工具和调试

### 1. gRPC反射

```go
// 服务器端注册反射服务
reflection.Register(s)
```

### 2. gRPCurl调试

```bash
# 列出服务
grpcurl -plaintext localhost:50051 list

# 调用方法
grpcurl -plaintext -d '{"id": 1}' localhost:50051 user.UserService/GetUser
```

## 小结

gRPC是构建微服务的强大工具，提供了高性能、类型安全的RPC通信。通过Protocol Buffers定义服务接口，可以自动生成客户端和服务器代码，大大简化了开发工作。

接下来我们将学习服务发现，这是微服务架构中另一个重要的组件。