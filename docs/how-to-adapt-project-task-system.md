# 如何让其他 Agent 完善负责项目的任务体系

这份指南用于让 Codex、Claude Code、WorkBuddy 或其他 Agent 在各自负责的项目中补齐 Workstream、初始任务和候选 Loop。它假设项目已经出现在 `projects/registry/`，并且 Agent 能同时访问本仓库和目标源码仓。

## 执行前提

1. `context-bridge` 工作区没有未确认的冲突变更。
2. 目标项目的 `project_id` 和 `source_repo` 已核对。
3. Agent 已读取本仓库 `AGENTS.md` 和目标源码仓自己的规则。
4. 不把项目长期信息复制成任务，不把聊天记录整体搬入 Git。

## 提示词一：完善项目任务基础

把下面内容中的占位符替换后交给负责该项目的 Agent：

```text
你负责完善 <project-id> 的任务生命周期基础。不要直接开始业务开发，先完成任务体系治理。

工作区：<context-bridge-absolute-path>
目标源码仓：从 projects/registry/<project-id>.json 的 local_paths 定位，并核对 source_repo。

必须按顺序执行：
1. 检查 context-bridge 和目标源码仓实时 Git 状态，保留现有用户变更。
2. 读取 context-bridge/AGENTS.md、projects/README.md、projects/<project-id>/README.md、project_profile.md、current_snapshot.md、workstreams.json。
3. 读取 tasks/README.md、schemas/task.schema.json、schemas/workstream.schema.json 和 docs/task-system-design.md。
4. 读取目标源码仓 AGENTS.md/CLAUDE.md、README、当前分支、最近提交和未提交变更。
5. 核验 projects/<project-id>/workstreams.json：
   - 保留 <project-id>:daily-development 作为 primary Workstream；
   - 根据真实项目情况决定是否增加版本发布、技术债、专项研究等 Workstream；
   - Workstream 是长期容器，不要写成永久 Task。
6. 从 current_snapshot、最新 handoff/feedback、源码仓 Git 状态中整理 3～10 个真实的候选 Task，写到 tasks/<project-id>/<task-id>.json。
7. 每个 Task 必须目标单一，填写 scope.include/exclude、acceptance_criteria、risk_level、requires_review 和 automation_policy。
8. 未成熟想法使用 captured/backlog；已经具备执行条件的任务才使用 ready；不要伪造 in_progress 或 done。
9. current_snapshot.md 只补充任务体系摘要和关键进行项，不复制完整任务列表。
10. 校验所有 JSON 可解析，按 schema 检查字段，最后报告新增任务、风险和建议优先级。

禁止：
- 不修改目标源码仓业务代码。
- 不删除已有项目记忆。
- 不把一整个版本或“日常开发”做成一张永不结束的 Task。
- 不启用自动 Loop，不提交、不推送，除非我另行授权。
```

## 提示词二：执行一张开发任务

```text
请执行任务 <task-id>，项目为 <project-id>。

1. 先读取 context-bridge/AGENTS.md、projects/<project-id>/ 的项目记忆、workstreams.json、tasks/<project-id>/<task-id>.json。
2. 核对 Task 当前状态、依赖、风险、范围和验收标准；只有 ready 才能进入 queued/in_progress。
3. 按 source_repo 定位源码仓，读取目标仓规则并检查 Git 状态。不得覆盖用户未提交变更。
4. 为本次执行创建唯一 run_id，并把冻结输入写入项目 handoffs；同一 task_id 下的二次修正创建新 Run，不复制 Task。
5. 只实施 scope.include 内的内容，运行与风险相称的测试和验证。
6. 将 commit、PR、文档、测试证据关联回 Task artifacts；执行结果写入 feedback，并记录 run_id。
7. 成功交付且需要审核时，把 Task 更新为 in_review，不要自行标记 done。
8. 如果审核意见改变目标或显著扩大范围，创建子 Task/后续 Task；不要继续把范围堆入原 Task。
9. 更新 current_snapshot 的项目级摘要，但不要复制完整执行日志。
10. 最后报告 Task 状态、Run 结果、验证证据、待审核项和建议下一步。
```

## 提示词三：设计项目 Loop

```text
请为 <project-id> 设计候选任务 Loop，只做设计和 draft 配置，不启用自动执行。

1. 读取项目记忆、workstreams.json、现有 Task，以及 schemas/loop.schema.json 和 tasks/loops/README.md。
2. 识别一个稳定且可重复的数据源，例如 GitHub Issue、定期测试结果、文档索引检查或周报素材。
3. 设计 trigger、collect、filter、action、deduplication_key、max_tasks_per_run、risk_ceiling 和 fallback。
4. 自动收集的任务默认进入 backlog，不直接进入 in_progress。
5. 明确无人审核、运行失败、数据为空、重复输入和运行时离线时如何降级。
6. 医疗规则、生产数据、发布部署等高风险动作只能产出方案或停在 in_review。
7. 把配置保存为 tasks/loops/<loop-id>.json，status 必须为 draft。
8. 给出人工启用前检查清单、预期收益、失败成本和观察指标。

不要写 token、Cookie、Webhook 密钥，不要创建真实定时任务，不要启动 daemon。
```

## 预期结果

每个完成治理的注册项目应至少具备：

- 一个经过核验的 `primary_workstream_id`。
- 3～10 张真实、边界明确的初始 Task。
- 明确的风险与审核策略。
- 可选但默认停用的 draft Loop。
- `current_snapshot.md` 中简短的任务体系入口说明。

