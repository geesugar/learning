@startuml 任务状态转换图
!theme plain
skinparam backgroundColor #FFFFFF
skinparam state {
    BackgroundColor<<running>> #FFE0E0
    BorderColor<<running>> #FF0000
    FontColor<<running>> #000000
    FontStyle<<running>> bold
    
    BackgroundColor<<uninterruptible>> #E0E0FF
    BorderColor<<uninterruptible>> #0000FF
    FontColor<<uninterruptible>> #000000
    FontStyle<<uninterruptible>> bold
}

[*] --> TASK_RUNNING : 创建新任务
TASK_RUNNING <<running>> --> TASK_INTERRUPTIBLE : 等待资源\n(可被信号中断)
TASK_RUNNING <<running>> --> TASK_UNINTERRUPTIBLE : 等待I/O\n(不可被信号中断)
TASK_RUNNING <<running>> --> __TASK_STOPPED : 收到SIGSTOP\n或调试器停止
TASK_RUNNING <<running>> --> __TASK_TRACED : 被调试器\n跟踪
TASK_RUNNING <<running>> --> TASK_DEAD : 进程退出

TASK_INTERRUPTIBLE --> TASK_RUNNING : 资源可用\n或收到信号
TASK_UNINTERRUPTIBLE <<uninterruptible>> --> TASK_RUNNING : I/O完成
__TASK_STOPPED --> TASK_RUNNING : 收到SIGCONT
__TASK_TRACED --> TASK_RUNNING : 调试器\n继续执行

TASK_INTERRUPTIBLE --> TASK_DEAD : 收到致命信号
__TASK_STOPPED --> TASK_DEAD : 收到SIGKILL
__TASK_TRACED --> TASK_DEAD : 进程被终止

TASK_DEAD --> [*] : 任务清理完成

note right of TASK_RUNNING #FFFACD
  **🔥 核心运行状态 🔥**
  • 正在CPU上运行
  • 在运行队列中等待调度
  • 可被调度器抢占
end note

note right of TASK_INTERRUPTIBLE #FFFACD
  • 等待某个条件满足
  • 可以被信号唤醒
  • 典型场景：等待socket数据
end note

note right of TASK_UNINTERRUPTIBLE #FFFACD
  **⚠️ 不可中断状态 ⚠️**
  • 通常等待硬件I/O
  • 不能被信号中断
  • 会计入系统负载
  • 可能导致高负载
end note

@enduml