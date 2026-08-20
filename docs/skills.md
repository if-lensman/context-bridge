# Skills

`skill` 是 `context-bridge` 的必要抽象层，不是附属文档，也不是可选包装。

## 为什么需要 skill

`docs/` 负责说明“应该怎么做”，但真正落地时还需要一个统一的执行入口，把规则变成动作。

如果没有 skill：

- 规则容易停留在说明层
- 不同 agent 会用不同方式理解同一套文档
- 初始化、执行、回传和快照更新会散落成多个入口

如果有 skill：

- 文档和执行之间有明确桥梁
- 新任务可以沿着固定路径处理
- 规范能被持续复用，而不是只被阅读

## 当前约定

- 注册项目协作 canonical skill：[`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md)
- 全局知识沉淀 skill：[`skills/context-knowledge/SKILL.md`](../skills/context-knowledge/SKILL.md)

`context-bridge` skill 负责注册项目协作子系统：项目注册与初始化、Workstream / Task 生命周期、Agent Run、handoff / feedback、profile / snapshot、受控 Loop 和开发任务执行。

`context-knowledge` skill 只负责知识写入和迁移的落点与格式（Frontmatter、路由、索引同步）；注册项目的 feedback/snapshot 回写仍走 `context-bridge` skill。

底层初始化命令位于 [`scripts/README.md`](../scripts/README.md)。skill 负责判断何时初始化和如何进入后续任务流，脚本负责幂等创建目录、registry 和索引。

## 分工

- `docs/`：规则、结构、约定
- `skills/`：执行入口和流程编排
- `context/system/`：注册项目协作的共享规则
- `projects/`：项目长期记忆
- `tasks/`：Task、Run、Loop 运行态事实
- `schemas/`、`templates/`：协议与模板

## 典型流转

1. 读 `docs/index.md`
2. 读 `docs/architecture.md`
3. 进入 `skills/context-bridge/SKILL.md`
4. 读取项目上下文（`projects/`）与任务主记录（`tasks/`）
5. 执行任务
6. 写回 `feedback`
7. 更新 Task 状态 / Run 记录
8. 更新 `current_snapshot.md`

## 结论

`skill` 不是多余的一层。它是 `context-bridge` 从“文档系统”变成“协作系统”的关键。
