# Skill: context-bridge

## 目的

把 `context-bridge` 的文档规则、项目结构、任务生命周期和本地执行链统一成一个正式执行入口。

这个 skill 负责把“应该怎么协作”变成“现在该怎么做”，覆盖注册项目协作子系统的完整任务流。

## 适用场景

- 新项目初始化
- 已有项目接入
- 注册项目任务执行
- Task 生命周期与 Run 关联
- 受控 Loop 的任务输入与结果回写
- 开发型任务执行
- 任务回传
- 更新项目快照
- 更新文档索引

## 初始化模式

当 `projects/<project-id>/` 或 registry 尚未建立时：

1. 先运行 `./scripts/context-bridge.sh project init --dry-run ...` 检查计划。
2. 参数确认后运行正式初始化命令。
3. 人工补充生成的项目启动页、profile 和 snapshot。
4. 按 `docs/project-acceptance-checklist.md` 验收。

不要手工重复创建整套目录。初始化器会保留已有记忆文件，并在不同电脑上合并 registry 的 `local_paths`。

## 输入

- `README.md`
- `projects/README.md`
- `docs/index.md`
- `docs/architecture.md`
- `docs/task-system-design.md`
- `docs/skills.md`
- `context/system/rules.md`
- `context/system/agent-routing.md`
- `context/system/docs-and-feedback.md`
- `context/system/development-task-mode.md`
- `projects/registry/<project-id>.json`
- `projects/<project-id>/README.md`
- `projects/<project-id>/project_profile.md`
- `projects/<project-id>/current_snapshot.md`
- `projects/<project-id>/workstreams.json`
- `tasks/<project-id>/<task-id>.json`（新任务必须；历史 handoff 尚未迁移时可不存在）
- 最新 `handoff`

## 输出

- 任务执行结果
- `feedback/` 回执
- Task 生命周期状态和 Run 关联更新
- `current_snapshot.md` 更新
- 必要时更新项目级 `docs/`
- 必要时更新 `docs/index.md`
- 必要时新增 `task-docs/` 过程材料

## 执行顺序

1. 读取仓库当前 Git 状态。
2. 确认 `project_id` 与 `source_repo`。
3. 读取 `projects/<project-id>/README.md` 启动页。
4. 读取项目注册信息。
5. 读取 `project_profile.md`。
6. 读取 `current_snapshot.md`。
7. 读取 `workstreams.json` 和 Task 主记录；历史 handoff 尚未迁移时按兼容规则执行，不批量伪造旧任务。
8. 核对 Task 状态、风险、范围和验收标准；只有 `ready` 才能进入执行队列。
9. 读取本次 Run 对应的最新 `handoff`。
10. 判断任务类型：项目任务 / 全局任务 / 跨项目任务。
11. 判断是否属于开发型任务。
12. 如果是开发型任务，进入“开发任务模式”。
13. 执行任务并记录唯一 `run_id`。
14. 写回 `feedback` 和 Task artifacts。
15. 需要审核时将 Task 置为 `in_review`，验收通过后才置为 `done`。
16. 更新 `current_snapshot.md` 的项目级摘要。
17. 如果新增或更新了 `docs/`，同步 `docs/index.md`。

## 开发任务模式

满足以下任一条件时，按开发任务模式处理：

- handoff 明确要求修改代码、调试、构建、测试、验证
- deliverables 包含补丁、脚本、实现说明、构建结果
- 任务背景明确依赖某个真实代码仓

开发任务模式下，必须额外完成：

1. 识别代码仓归属和本地工作目录。
2. 识别候选执行 agent，优先看项目 registry 中声明的 agents。
3. 判断是否需要本地 CLI 执行 agent（例如 `claude-code`）。
4. 把长分析、进度和复杂说明写到项目的 `task-docs/` 或项目级 `docs/`。
5. 如果任务确认了新的稳定链路、规则或落点，补充到项目上下文，并同步对应 `docs/index.md`。

开发任务至少要产出三层结果：

- `feedback/` 摘要回执：短、结构化、可 review。
- `current_snapshot.md` 更新：只记录当前状态变化，不堆长分析。
- `task-docs/` 详细材料：代码链路分析、方案设计、进度说明、复杂执行记录。

详细规则见 `context/system/development-task-mode.md`。

## 约束

- 注册项目协作子系统只维护一个正式入口：`skills/context-bridge/SKILL.md`。
- 不新造第二个平行 skill 承载注册项目开发流程。
- 所有注册项目任务都要落到对应项目的 `handoffs/`。
- 所有注册项目结果都要落到对应项目的 `feedback/`。
- Project 和 Workstream 是长期对象；Task 必须有明确结束条件，不能把日常迭代做成永久 Task。
- 同一 Task 可以有多个 Run；目标不变时评论修正创建新 Run，目标改变时创建后续 Task。
- Run 成功不等于 Task 完成；高风险与 `requires_review` 任务必须停在 `in_review` 等待验收。
- Loop 新建时必须为 `draft`，不得静默启用高风险自动化。
- 稳定事实只写进 `project_profile.md` 或项目级稳定 docs。
- 当前状态只写进 `current_snapshot.md`。
- 过程材料优先写 `task-docs/`，不要把长过程直接塞进 `feedback`。
- 不把过程材料塞进仓库级 `docs/`。

## 最低要求

- 路径正确
- 项目标识正确
- 回执完整
- 快照已更新
- 文档索引已同步
- 开发任务的摘要层和长文层分离正确
- Task 状态、Run、handoff 和 feedback 使用一致的 `task_id` / `run_id`
- 需要审核的任务未被提前标记为 `done`

## 说明

这个 skill 是注册项目协作子系统的正式执行入口。它同时覆盖：

- 接入与注册
- 仓库级协作
- Task 生命周期与 Run 关联
- 开发型任务执行

任何与 registry、handoff、feedback、snapshot 和注册项目开发执行相关的后续抽象，都应继续并入这个 skill，而不是另起第二入口。
