# Redis集群被动故障转移流程图

以下是Redis集群被动故障转移过程的PlantUML序列图，详细展示了整个自动故障转移的流程。

```plantuml
@startuml
!theme plain
title Redis Cluster 被动故障转移流程

participant "集群节点" as nodes #LightGray
participant "主节点" as master #IndianRed
participant "从节点A" as slave1 #SkyBlue
participant "从节点B" as slave2 #LightBlue
participant "从节点C" as slave3 #PaleTurquoise

== 故障检测阶段 ==

nodes -> master : PING
note right: 超过cluster-node-timeout未回复
nodes -> master : 标记为PFAIL状态
nodes -> nodes : Gossip传播PFAIL状态
note right: 收集足够多的PFAIL报告
nodes -> master : 标记为FAIL状态
nodes -> nodes : 广播FAIL消息

== 从节点选举准备 ==

slave1 -> slave1 : 检查与主节点断开连接时间\n(根据cluster-replica-validity-factor)
slave2 -> slave2 : 检查与主节点断开连接时间
slave3 -> slave3 : 检查与主节点断开连接时间
note over slave1, slave3 : 计算failover_auth_time\n包含固定延迟、随机延迟和排名延迟

== 投票请求阶段 ==

slave1 -> slave1 : failover_auth_time到达
slave1 -> nodes : 发送FAILOVER_AUTH_REQUEST
slave1 -> slave1 : 增加epoch并等待投票

slave2 -> slave2 : failover_auth_time到达(稍晚)
slave2 -> nodes : 发送FAILOVER_AUTH_REQUEST
slave2 -> slave2 : 增加epoch并等待投票

== 投票过程 ==

nodes -> slave1 : 发送FAILOVER_AUTH_ACK
nodes -> slave2 : 发送FAILOVER_AUTH_ACK
note right : 只有具有投票权的主节点才会投票\n每个epoch只能投票一次

slave1 -> slave1 : 统计投票数
note right : 假设slave1获得多数票

== 晋升为主节点 ==

slave1 -> slave1 : 更新configEpoch
slave1 -> slave1 : 转变为主节点
slave1 -> slave1 : 接管原主节点的哈希槽
slave1 -> slave1 : 持久化新配置
slave1 -> nodes : 广播PONG消息
note right: 通知集群更新

== 客户端重定向 ==

note over nodes : 集群状态更新
note over nodes : 客户端收到MOVED重定向到新主节点
@enduml
```

## 被动故障转移实现关键点

1. **PFAIL到FAIL状态转换**：需要超过半数主节点报告节点PFAIL才会将其标记为FAIL
2. **选举延迟计算**：通过特定算法确定从节点开始选举的时间点
3. **投票权**：只有处于正常状态的主节点有投票权
4. **多数投票原则**：需要获得超过半数主节点的投票才能当选
5. **状态广播**：通过PONG消息广播新的集群状态 