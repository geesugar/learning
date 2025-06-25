# Linux内核文档索引

## 最新文档

### 中断与调度机制专题
- **[Linux内核中断与调度机制综述](interrupt_and_scheduling_overview.md)** - 详细分析时钟中断、调度检查点、scheduler_tick()和schedule()函数的关系与原理
- **[条件重调度检查点综述](conditional_reschedule_overview.md)** - 深入分析cond_resched()系列函数的设计原理、使用场景和最佳实践
- **[中断与调度架构图（英文版）](interrupt_scheduling_architecture.puml)** - 展示整体架构和组件关系的PlantUML图表
- **[中断与调度架构图（中文版）](interrupt_scheduling_architecture_cn.puml)** - 中文版架构图，更好的中文支持
- **[中断到调度时序图](interrupt_scheduling_sequence.puml)** - 完整的时序流程图，从硬件中断到任务切换
- **[调度检查点分布图](scheduling_checkpoints.puml)** - 详细展示Linux内核中所有调度检查点的分布

## 调度器相关文档

### CFS调度器
- **[Linux CFS调度器深度解析](linux_scheduler_cfs.md)** - CFS调度器的完整分析
- **[CFS调度器流程图](cfs_scheduler_flowchart.puml)** - CFS调度流程的PlantUML图表
- **[CFS调度器深入研究](deep_dive_into_cfs_scheduler.md)** - CFS调度器的深度分析
- **[CFS负载均衡](linux_scheduler_cfs_load_balance.md)** - CFS负载均衡机制

### 调度器触发机制
- **[Linux调度器触发机制](linux_scheduler_trigger.md)** - 调度器的各种触发场景
- **[CPU运行队列vs CFS运行队列分析](cpu_rq_vs_cfs_rq_analysis.md)** - 运行队列的对比分析

### 调度相关分析
- **[HZ频率与调度周期分析](hz_vs_scheduling_period_analysis.md)** - 时钟频率对调度的影响
- **[Deadline调度器vs CFS饥饿分析](deadline_vs_cfs_starvation_analysis.md)** - 不同调度器的对比
- **[进程迁移与调度优先级](migration_process_scheduling_priority.md)** - 进程迁移机制

## 进程管理
- **[Linux进程状态](linux_process_state.md)** - 进程状态转换详解
- **[Linux调度器概述](linux_scheduler.md)** - 调度器的整体介绍

## 控制组(Cgroup)
- **[Linux Cgroup机制](linux_cgroup.md)** - 控制组的详细分析

## 性能分析工具
- **[Linux htop工具](linux_htop.md)** - htop的使用和原理
- **[Linux systemd cgtop](linux_systemd_cgtop.md)** - systemd cgtop工具分析
- **[Linux stress测试](linux_stress.md)** - stress压力测试工具
- **[Linux stress-ng测试](linux_stress_ng.md)** - stress-ng高级压力测试

## 图表文件
所有PlantUML图表文件都可以使用以下脚本转换为PNG格式：
```bash
./convert_puml_to_png.sh
```

## 文档组织
- `charts/` - 生成的图表文件
- `images/` - 图片资源
- `deprecated/` - 已废弃的文档

---

*最后更新：2024年12月* 