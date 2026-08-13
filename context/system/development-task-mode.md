# 开发任务模式

这份规则定义：当 `context-bridge` 接到“真实代码仓开发任务”时，应该如何进入执行。

## 适用范围

以下任务按开发任务模式处理：

- 修改代码
- 排查缺陷
- 增加脚本
- 调整配置
- 运行构建 / 测试 / 校验
- 梳理代码链路并产出实现建议

## 与普通任务的区别

普通任务通常只需要：

- 读取项目上下文
- 执行
- 写 feedback

开发任务还需要：

- 明确本地工作仓
- 明确本地执行 agent
- 明确代码改动和 docs 沉淀如何分层
- 明确哪些新发现要回写项目上下文

## 必读材料

开发任务在普通入口材料之外，还应优先读取：

- 项目级 `docs/index.md`
- handoff 指定的需求文档
- 相关 `task-docs/`
- 最近一次 feedback（如果和当前任务连续）
- `projects/<project-id>/workstreams.json`
- `tasks/<project-id>/<task-id>.json`

## 执行要求

开发任务至少要产出三层结果：

### A. feedback 摘要

必须短、结构化、可 review。

### B. snapshot 更新

只记录当前状态变化，不堆长分析。

### C. docs 或 task-docs 详细材料

适合放：

- 代码链路分析
- 方案设计
- 进度说明
- 复杂执行说明
- 回合制实现记录

### D. Task 与 Run 状态

- 每次执行使用唯一 `run_id`
- 交付后按审核要求进入 `in_review`，不是默认 `done`
- 目标变化或范围扩大时创建后续 Task

## 回写原则

如果任务确认了新的稳定知识，应回写到项目上下文：

- 长期稳定事实 -> `project_profile.md`
- 当前阶段状态 -> `current_snapshot.md`
- 可复用说明 -> 项目级 `docs/`
- 一次性过程材料 -> `task-docs/`

## 目标

让开发任务也遵守 `handoff -> 执行 -> feedback`，同时保留代码实现所需的更细粒度上下文。
