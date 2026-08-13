# 系统规则

## 适用范围

本目录保存注册项目协作子系统的内部规则；项目远程记忆位于顶层 `projects/`，任务、Run 和 Loop 位于顶层 `tasks/`。

以下场景不强制套用本规则：

- 仓库自身文档和结构维护
- 设备或 agent 交接文档
- 个人工具能力与文档型工作区

这些场景按仓库根 `AGENTS.md`、`docs/index.md` 和各自入口文件处理。

## 任务范围模型

注册项目协作任务分成以下三类之一：

- 项目任务：默认归属于对应项目。
- 全局任务：系统级 docs / rules / onboarding / registry 工作。
- 跨项目任务：一个项目请求另一个项目的 agent 支持。

范围边界：

- 项目任务默认由所属项目执行。
- 全局任务可以由任意合适的 agent 执行。
- 跨项目工作必须在 handoff 中显式写清楚 `task_id`、`project_id`、`source_repo`、`from`、`to`，必要时加 `related_projects`。
- 项目长期日常迭代使用 Workstream 表达，不创建永不结束的 Task。

## 工作仓入口规则

agent 进入工作仓时，顺序如下：

1. 先按 `source_repo` 解析项目。
2. 读取项目注册记录。
3. 打开 `entry_points.profile`。
4. 打开 `entry_points.snapshot`。
5. 打开 `entry_points.workstreams` 和 `entry_points.tasks` 中的活跃 Task。
6. 在行动前先读当前 Run 的 `handoff`。
7. 执行后把结果写回 `feedback/`、Task artifacts 和 Run 记录。

不要用 task 路径、feedback 路径或目录相似度去判断项目身份。
不要用 `project` 代替 `project_id`。

## 仓库优先执行

注册项目协作使用仓库优先流程：

- 所有注册项目任务在执行前必须先写入 `handoffs/`。
- 只在聊天里说任务，不算完成交接。
- 所有执行结果都要回写到 `feedback/`。
- 如果项目有 `current_snapshot.md`，高频状态变化要同步更新。
- handoff / feedback 必须匹配仓库里的 schema。
- Task 只有处于 `ready` 时才能被调度；Run 成功后需要审核的 Task 进入 `in_review`，不能直接进入 `done`。

## agent 职责

### chatgpt-web

- 负责规划、review 和生成 handoff。
- 负责把任务写入仓库，而不是只在聊天里描述。
- 负责读取 feedback，并继续拆解下一轮任务。

### 执行 agent（例如 `then-codex-cli`）

- 只从仓库读取任务。
- 执行后必须写 task feedback。
- 不依赖聊天历史作为唯一上下文。

## 原则

注册项目任务应该通过 Git 流动，而不是只通过对话流动。

仓库维护、设备交接、个人 skill 和文档型工作区同样需要落到 Git 文件，但不要求伪造 handoff/feedback。
