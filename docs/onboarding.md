# Onboarding

先看 [`docs/index.md`](./index.md)。

## 目标

把一个已有项目接入 `context-bridge`，并且统一走 [`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md)。

## 步骤

1. 确认 `source_repo`
2. 创建 `project_id`（或复用已有）
3. 运行 `project init` 初始化 `projects/<project-id>/` 目录
4. 核对 registry 的 `entry_points` 与 `local_paths`
5. 补充 `project_profile.md` / `current_snapshot.md` 的真实内容
6. 在 `workstreams.json` 中确认主 Workstream（默认 `daily-development`）
7. 从真实需求整理 3～10 张候选 Task 写入 `tasks/<project-id>/`
8. 走一条 `handoff -> 执行 -> feedback` 验证闭环

## 关键点

- 项目标识由 `source_repo` 决定
- 同 repo 不应创建多个 project_id
- 不要通过目录名猜项目
- `local_paths` 只用于设备发现，不参与身份判断
- 新任务默认进入 `captured` / `backlog`，不要伪造 `in_progress` 或 `done`

## 接入验收

按 [`project-acceptance-checklist.md`](./project-acceptance-checklist.md) 逐项检查。

## 委派其他 Agent 完善

按 [`how-to-adapt-project-task-system.md`](./how-to-adapt-project-task-system.md) 中的可复制提示词，把任务体系治理交给负责该项目的 Agent。
