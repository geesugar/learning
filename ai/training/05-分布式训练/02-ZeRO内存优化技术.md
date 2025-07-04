# 5.2 ZeRO 内存优化技术

**ZeRO (Zero Redundancy Optimizer)** 是由微软 DeepSpeed 团队提出的一套强大的分布式训练内存优化技术。其核心思想是，在数据并行（Data Parallelism）的基础上，将模型的存储负担（包括模型参数、梯度和优化器状态）也进行切分，从而在保持数据并行简洁性的同时，具备了容纳巨大模型的能力。

在标准的的数据并行中，每个 GPU 都需要存储：
1.  **模型参数 (Model Parameters)**: 模型的权重，FP16/FP32。
2.  **梯度 (Gradients)**: 反向传播计算出的梯度，与参数大小相同，FP16/FP32。
3.  **优化器状态 (Optimizer States)**: 如 AdamW 中的一阶和二阶动量，通常是参数量的 2 倍，FP32。

优化器状态通常是显存消耗的大头（例如，FP32 参数 + FP32 梯度 + FP32 动量 + FP32 方差 = 16 * N 字节）。ZeRO 的目标就是消除这些冗余存储。

## ZeRO-1

*   **切分对象**: **优化器状态 (Optimizer States)**。
*   **原理**: 将优化器状态均匀地切分到所有参与数据并行的 GPU 上。每个 GPU 只负责更新和存储自己所分管的那部分参数对应的优化器状态。
*   **过程**: 在优化器更新权重（`optimizer.step()`）之前，通过一次 All-Gather 操作，让每个 GPU 从其他 GPU 那里获取自己需要的优化器状态，完成计算后即可丢弃。
*   **效果**: 显著减少显存占用，通信量与模型参数量成正比。

## ZeRO-2

*   **切分对象**: **优化器状态 + 梯度 (Gradients)**。
*   **原理**: 在 ZeRO-1 的基础上，进一步将梯度也进行切分。在反向传播过程中，每个 GPU 只保留自己负责更新的那部分参数的梯度，其他梯度在计算后立即丢弃。
*   **过程**: 在计算完梯度后，通过一次 Reduce-Scatter 操作，将所有 GPU 上的梯度进行求和，并分发到对应的 GPU 上。这样，每个 GPU 只需存储一小部分梯度。
*   **效果**: 显存占用进一步降低。

## ZeRO-3

*   **切分对象**: **优化器状态 + 梯度 + 模型参数 (Model Parameters)**。
*   **原理**: 这是最彻底的切分。每个 GPU 在任何时候都只持有模型参数的一部分。 
*   **过程**: 
    *   **前向/反向传播**: 在计算一个层（Layer）之前，通过 All-Gather 操作从其他 GPU 获取该层所需的全部参数。计算完成后，立即丢弃这些参数（只保留自己分管的部分）。
    *   **更新**: 与 ZeRO-2 类似。
*   **效果**: 理论上，N 个 GPU 可以训练一个 N 倍大的模型，极大地扩展了可训练模型的规模。
*   **挑战**: 通信量巨大，因为每次前向和反向传播都需要动态地聚合参数。

## ZeRO-Offload & ZeRO-Infinity

*   **ZeRO-Offload**: 将 ZeRO 切分出的优化器状态和梯度等数据，从 GPU 显存进一步“卸载”到 CPU 内存中，从而在单卡或少数几张卡上也能训练更大的模型。
*   **ZeRO-Infinity**: 结合 ZeRO-3 和 NVMe-Offload 技术，将数据从 CPU 内存进一步卸载到 NVMe 固态硬盘上，可以训练万亿级别的超大模型。

**FSDP (Fully Sharded Data Parallel)** 是 PyTorch 官方提供的、与 ZeRO-3 思想类似的实现，现已成为 PyTorch 中进行大规模训练的主流选择。
