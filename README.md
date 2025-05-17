# learning

## 项目

- [Chrome DevTools Protocol](./chrome-devtools-protocol/README.md) - Chrome开发者工具协议详细介绍及应用示例
- [Playwright与CDP交互](./playwright/README.md) - Playwright如何通过CDP与Chrome交互的流程图及AI Agent操作网页的详细说明

## 大模型相关知识 TODO

以下是计划研究和记录的大模型相关知识点：

### 框架与工具
- **LangChain** - 构建基于LLM的应用程序框架，用于构建上下文感知、推理驱动的应用
- **LlamaIndex** - 数据框架，用于连接自定义数据与大语言模型
- **Semantic Kernel** - 微软的AI编排框架，集成LLM到传统应用程序
- **Haystack** - 端到端NLP框架，用于构建基于大模型的搜索和问答系统

### 核心技术
- **RAG (Retrieval-Augmented Generation)** - 检索增强生成，结合搜索与生成能力提高LLM回答准确性
- **微调 (Fine-tuning)** - 在预训练基础上针对特定任务进行额外训练
- **上下文学习 (In-context Learning)** - 在提示中提供示例使模型学习特定任务模式
- **提示工程 (Prompt Engineering)** - 设计优化提示以获得更好的大模型输出
- **思维链 (Chain-of-Thought)** - 引导模型生成推理步骤，提高复杂问题解决能力

### 架构模式
- **向量数据库** - 存储和检索高维向量表示，如Pinecone、Weaviate、Milvus
- **Agent框架** - 构建自主AI代理系统，如AutoGPT、BabyAGI
- **LLM缓存策略** - 优化大模型请求，减少API调用和延迟
- **混合搜索架构** - 结合关键词搜索、语义搜索与重排序技术
- **多模态系统** - 整合文本、图像、音频等多种模态的AI系统

### 评估与优化
- **大模型评估方法** - MMLU、HELM等基准测试及自定义评估框架
- **幻觉检测与缓解** - 识别并减少大模型生成的错误信息
- **内容安全过滤** - 构建安全防护层，避免有害输出
- **推理优化** - 量化、剪枝、知识蒸馏等模型优化技术
- **成本优化策略** - 降低大模型应用的运营成本