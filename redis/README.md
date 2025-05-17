# Redis高可用性研究

本目录包含了对Redis高可用性机制的深入研究，特别关注Redis在故障场景下的行为和恢复机制。

## 文档内容

### 故障转移类型

- [被动故障转移](./passive_failover.md) - Sentinel或Redis Cluster中的被动故障转移机制
- [主动故障转移](./active_failover.md) - 通过管理工具或API触发的主动故障转移过程
- [主节点暂停恢复](./master_pause_recovery.md) - 主节点临时不可用后的恢复机制

### 故障转移行为

- [Redis故障转移行为](./redis_failover_behavior.md) - Redis在不同场景下的故障转移机制的综合分析

### 详细序列分析

- [故障转移序列](./redis_failover_sequence.md) - 故障转移的时序流程
- [被动故障转移序列](./passive_failover_sequence.md) - Sentinel触发的被动故障转移详细流程
- [主动故障转移序列](./active_failover_sequence.md) - 人工触发的主动故障转移详细流程
- [Redis集群故障转移序列](./redis_cluster_failover_sequence.md) - Redis Cluster模式下的故障转移流程

### 流程图表

- [Redis故障转移活动图](./redis_failover_activity.puml) - 使用PlantUML描述的故障转移活动流程
- [Redis故障转移序列图](./redis_failover_sequence.puml) - 使用PlantUML描述的故障转移时序流程

## 主要研究方向

本研究主要关注以下几个方面：

1. **Redis Sentinel**
   - Sentinel如何检测主节点故障
   - 故障判定的算法和条件
   - 选举新主节点的策略和过程
   - 客户端如何与Sentinel配合实现高可用

2. **Redis Cluster**
   - 分布式节点间的故障检测机制
   - 集群模式下的故障转移特点
   - 槽迁移过程中的数据一致性保障
   - 网络分区情况下的集群行为

3. **监控与恢复**
   - Redis实例监控的最佳实践
   - 自动恢复策略与人工干预时机
   - 故障转移过程中的数据一致性考量
   - 性能影响与最小化服务中断

## 关键发现

- Redis Sentinel在多数派确认主节点不可用后才会触发故障转移
- 故障转移过程中存在一个不可避免的短暂服务中断窗口
- 合理的timeout配置对于快速检测故障至关重要
- 主从复制延迟会直接影响故障转移后的数据一致性
- Redis Cluster比Sentinel提供更高级别的自动化分片和故障转移能力

## 最佳实践

- 部署至少3个Sentinel实例，并分布在不同的物理节点上
- 配置合理的down-after-milliseconds值，平衡检测速度和误判率
- 使用min-slaves-to-write参数防止脑裂情况下的数据不一致
- 实现带有指数退避和jitter的重试机制以应对故障转移期间的连接中断
- 定期测试故障转移流程，确保高可用机制正常工作 