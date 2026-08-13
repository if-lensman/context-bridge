# Architecture

先看 [`docs/index.md`](./index.md)。

## 目标

`context-bridge` 的目标是把多 Agent 协作中的上下文固定成可追踪、可复盘、可复用的 Git 事实，并把“长期项目记忆”和“运行态任务”分成两个清晰的控制面。

## 核心组件

### 1. `projects/`

项目远程记忆与注册项目协作数据。

- `projects/registry/`：项目身份与入口（`source_repo` 为身份锚点）
- `projects/<project-id>/`：项目协作上下文
- `README.md`：项目启动页和跨设备摘要
- `project_profile.md`：长期稳定事实
- `current_snapshot.md`：当前状态
- `workstreams.json`：长期工作方向与默认任务策略
- `handoffs/`：任务输入
- `feedback/`：执行回执
- `docs/`：项目级稳定说明
- `task-docs/`：任务过程材料

未注册项目和文档型工作区也可以只保留 `README.md`，不伪造 profile、snapshot 或 registry。

### 2. `tasks/`

跨项目任务控制面（运行态事实）。

- `board.json`：状态到看板列的映射和 WIP 基础配置
- `tasks/<project-id>/<task-id>.json`：Task 主记录
- `tasks/<project-id>/runs/`：每次 Agent 执行记录
- `tasks/loops/`：任务收集、调度和复查规则

Project 与 Workstream 是长期对象；Task 有明确结束条件；Run 只代表一次执行。Task 状态是唯一运行态事实，handoff 和 feedback 分别是一次 Run 的冻结输入与正式回执。

### 3. `context/`

内部协议与 agent 配置。

- `agents/`：agent 注册与绑定
- `system/`：注册项目协作的共享规则（身份、路由、docs/feedback 分工、开发任务模式）

### 4. `docs/`

仓库级说明入口，适合新读者先看。由 `docs/index.md` 统一索引。

### 5. `skills/`

可执行抽象层。canonical skill 是 `skills/context-bridge/SKILL.md`。

### 6. 协议资源

- `schemas/`：task / task-run / task-handoff / task-feedback / loop / workstream schema
- `templates/`：与 schema 对应的初始化模板
- `examples/`：最小示例
- `assets/`：仓库说明配图

### 7. `scripts/`

仓库级初始化与生命周期功能，无第三方依赖。

- `context-bridge.sh`：macOS/Linux Shell 入口
- `context-bridge.mjs`：跨平台 Node.js 实现
- `project init`：创建或补齐项目远程记忆，并合并跨设备路径
- `handover init`：创建设备或 agent 交接文档
- `task init`：按项目主 Workstream 创建一张结构化 Task
- `task transition`：只执行允许的生命周期状态迁移

## 工作流

### 仓库级工作流

```text
read docs -> identify project -> read profile -> read snapshot -> read handoff -> execute -> write feedback -> update snapshot
```

### 完整任务链

```text
Project -> Workstream -> Task -> Run -> handoff / feedback / Git artifacts
```

只有注册项目任务强制执行：

```text
handoff -> 执行 -> feedback -> current_snapshot
```

其他场景（仓库维护、交接文档、文档型工作区）使用各自入口规则，不强制伪造 handoff/feedback。

## 分层原则

- `project_profile.md` 写长期稳定信息
- `current_snapshot.md` 写当前状态
- `workstreams.json` 写长期工作方向
- `tasks/` 写有结束条件的 Task、Run 和 Loop
- `handoffs/` 写任务输入
- `feedback/` 写执行输出
- `docs/` 写稳定说明
- `skills/` 写可执行入口
- `schemas/`、`templates/` 写协议与模板

## 阅读顺序

- 新人先看 `README.md`
- 再看 `docs/index.md`
- 再看 `docs/architecture.md`
- 再看 `docs/task-system-design.md`
- 最后进入 `skills/context-bridge/SKILL.md`
