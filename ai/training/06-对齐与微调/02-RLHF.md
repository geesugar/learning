# 6.2 人类反馈强化学习 (RLHF)

RLHF (Reinforcement Learning from Human Feedback) 旨在通过人类的偏好数据，使模型的输出更符合期望（更有用、更无害、更真实）。它是一个多阶段的复杂流程。

```plantuml
@startuml
!theme vibrant
title RLHF Three-Stage Process

package "Stage 1: Supervised Fine-Tuning (SFT)" {
  cloud "Prompt Dataset" as SFTData
  rectangle "Pre-trained LLM" as PretrainedLLM
  rectangle "SFT Model" as SFTModel #lightblue

  SFTData --> PretrainedLLM : Fine-tune on high-quality demonstrations
  PretrainedLLM --> SFTModel
}

package "Stage 2: Reward Model (RM) Training" {
  actor "Human Labeler" as Labeler
  cloud "Prompt Dataset" as RMData
  rectangle "SFT Model" as SFTModel2 #lightblue
  rectangle "Reward Model (RM)" as RM #lightgreen

  RMData --> SFTModel2 : Generate multiple answers (e.g., A, B, C, D)
  SFTModel2 --> Labeler : Rank the answers from best to worst (e.g., D > B > A > C)
  Labeler --> RM : Train RM on preference data
  note right of RM: Learns to predict human preference score
}

package "Stage 3: RL Fine-Tuning (PPO)" {
  cloud "New Prompts" as RLData
  rectangle "SFT Model Copy" as PPOModel #lightblue
  rectangle "Reward Model (RM)" as RM2 #lightgreen
  rectangle "Final LLM" as FinalModel

  RLData -> PPOModel : Generate response
  PPOModel -> RM2 : Get reward score for the response
  RM2 -> PPOModel : Use reward to update policy via PPO
  note left of PPOModel
    Update policy to maximize reward.
    A KL-divergence penalty is used to
    prevent the model from deviating
    too far from the original SFT model.
  end note
  PPOModel --> FinalModel
}

SFTModel --> SFTModel2
SFTModel --> PPOModel
RM --> RM2

@enduml
```

RLHF 旨在让模型的输出更符合人类的偏好和价值观。

*   **核心流程**:
    1.  **训练奖励模型 (Reward Model, RM)**: 使用人类对模型不同输出的排序数据，训练一个评估模型输出质量的奖励模型。
    2.  **通过强化学习微调 LLM**: 使用 PPO (Proximal Policy Optimization) 等强化学习算法，利用奖励模型作为回报信号，微调 SFT 模型。
*   **关键概念**: 
    *   奖励模型的设计与偏差
    *   PPO 算法细节
    *   KL 散度惩罚项
*   **DPO (Direct Preference Optimization)**: 作为 RLHF 的一种更简单、更稳定的替代方案。