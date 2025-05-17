# Redis集群主动故障转移流程图

以下是Redis集群主动故障转移过程的PlantUML序列图，分别展示了三种不同类型的手动故障转移流程。

## 标准手动故障转移序列图

```plantuml
@startuml
!theme plain
title Redis Cluster 标准手动故障转移流程

actor "管理员" as admin #Orange
participant "主节点" as master #IndianRed
participant "从节点" as slave #SkyBlue
participant "其他主节点" as otherMasters #LightGray
participant "客户端" as client #LightGreen

== 初始化手动故障转移 ==

admin -> slave : CLUSTER FAILOVER
slave -> master : 发送MFSTART消息
master -> master : 暂停客户端写操作\n(pauseClients)
client -> master : 写入请求
note right of master : 请求被暂停，不会立即处理

== 复制偏移量同步 ==

master -> slave : 发送带PAUSED标志的PING
slave -> slave : 记录主节点复制偏移量
slave -> slave : 等待自身复制偏移量追赶

note over slave : 当复制偏移量一致时
slave -> slave : 设置mf_can_start=1

== 投票阶段 ==

slave -> slave : 增加currentEpoch
slave -> otherMasters : 请求投票(FAILOVER_AUTH_REQUEST)\n带有特殊标志表明这是手动故障转移
otherMasters -> slave : 发送投票(FAILOVER_AUTH_ACK)

== 故障转移完成 ==

slave -> slave : 更新configEpoch
slave -> slave : 转变为主节点
slave -> slave : 接管原主节点的哈希槽
slave -> slave : 持久化新配置
slave -> otherMasters : 广播PONG消息

== 原主节点降级 ==

master -> master : 检测到自己不再是主节点\n(通过epoch和槽位分配)
master -> master : 转变为从节点
master -> slave : 重新连接作为从节点
master -> master : 停止接受写入请求\n(将写入请求重定向到新主节点)

== 暂停恢复阶段 ==

slave -> slave : 解除客户端暂停\n(unpauseClients)
client -> master : 写入请求
master -> client : 返回MOVED重定向错误
client -> slave : 重定向写入请求
slave -> client : 处理请求并返回结果

note over master : 旧主节点完成与新主节点的\n初始同步后，自动解除暂停状态
@enduml
```

## FORCE手动故障转移序列图

```plantuml
@startuml
!theme plain
title Redis Cluster FORCE手动故障转移流程

actor "管理员" as admin #Orange
participant "主节点" as master #IndianRed
participant "从节点" as slave #SkyBlue
participant "其他主节点" as otherMasters #LightGray
participant "客户端" as client #LightGreen

== 初始化强制故障转移 ==

admin -> slave : CLUSTER FAILOVER FORCE
note right : 主节点可能已经不可用

slave -> slave : 直接设置mf_can_start=1
note right : 跳过与主节点的协调

== 投票阶段 ==

slave -> slave : 增加currentEpoch
slave -> otherMasters : 请求投票(FAILOVER_AUTH_REQUEST)
otherMasters -> slave : 发送投票(FAILOVER_AUTH_ACK)

== 故障转移完成 ==

slave -> slave : 更新configEpoch
slave -> slave : 转变为主节点
slave -> slave : 接管原主节点的哈希槽
slave -> slave : 持久化新配置
slave -> otherMasters : 广播PONG消息

== 客户端重定向 ==

client -> master : 写入请求
note right : 如果旧主节点可达
master -> client : 返回MOVED重定向错误
client -> slave : 重定向写入请求
slave -> client : 处理请求并返回结果

note over master : 如果旧主节点恢复可用，会自动\n降级为从节点并连接到新主节点
@enduml
```

## TAKEOVER手动故障转移序列图

```plantuml
@startuml
!theme plain
title Redis Cluster TAKEOVER手动故障转移流程

actor "管理员" as admin #Orange
participant "主节点" as master #IndianRed
participant "从节点" as slave #SkyBlue
participant "其他节点" as others #LightGray
participant "客户端" as client #LightGreen

== 初始化接管故障转移 ==

admin -> slave : CLUSTER FAILOVER TAKEOVER
note right : 无需主节点配合，也无需投票

== 直接接管 ==

slave -> slave : 调用clusterBumpConfigEpochWithoutConsensus\n生成新的配置纪元
note right : 无需共识直接提升配置纪元
slave -> slave : 调用clusterFailoverReplaceYourMaster\n接管所有槽位
slave -> slave : 转变为主节点
slave -> slave : 持久化新配置
slave -> others : 广播PONG消息
note right : 强制集群接受新配置

== 客户端请求处理 ==

client -> master : 写入请求
note right : 如果旧主节点可达
master -> client : 返回MOVED重定向错误
client -> slave : 重定向写入请求
slave -> client : 处理请求并返回结果

note over master : 在TAKEOVER模式下，主节点\n一旦意识到配置已更改，会\n自动降级为从节点
@enduml
```

## 各类主动故障转移比较

| 类型 | 与主节点协调 | 需要投票 | 旧主节点暂停 | 用途 |
|------|------------|---------|------------|------|
| 标准模式 | 是 | 是 | 是 | 常规维护，数据一致性高 |
| FORCE模式 | 否 | 是 | 否 | 主节点响应缓慢但可达 |
| TAKEOVER模式 | 否 | 否 | 否 | 紧急情况，集群无法正常工作 |

## 客户端暂停和恢复流程

在标准手动故障转移中，客户端暂停和恢复的详细流程如下：

1. **暂停阶段**：
   - 主节点接收到从节点的MFSTART消息后调用pauseClients()
   - 客户端的写请求被延迟处理，不会立即执行
   - 在暂停期间，主节点仍能接收读请求（取决于暂停类型）

2. **角色切换阶段**：
   - 当新主节点完成选举和槽位接管后，旧主节点会收到集群状态更新
   - 旧主节点会检测到自己的槽位被重新分配和配置纪元的变化
   - 旧主节点会自动将自己降级为从节点

3. **恢复阶段**：
   - 新主节点完成晋升后，调用unpauseClients()解除暂停
   - 旧主节点（现从节点）与新主节点建立复制连接
   - 旧主节点完成与新主节点的初始同步后，也会解除暂停状态
   - 旧主节点收到的写请求会返回MOVED重定向错误，引导客户端连接新主节点

所有这些机制确保了在故障转移过程中数据的一致性和高可用性。 