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

- canonical skill：[`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md)
- 兼容入口：`if-context-bridge` 仍保留为历史名称

## 分工

- `docs/`：规则、结构、约定
- `skills/`：执行入口和流程编排
- `context/`：项目、agent、系统事实

## 典型流转

1. 读 `docs/index.md`
2. 读 `docs/architecture.md`
3. 进入 `skills/context-bridge/SKILL.md`
4. 读取项目上下文
5. 执行任务
6. 写回 `feedback`
7. 更新 `current_snapshot.md`

## 结论

`skill` 不是多余的一层。它是 `context-bridge` 从“文档系统”变成“协作系统”的关键。
