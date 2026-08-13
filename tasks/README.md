# 任务控制面

`tasks/` 保存跨项目任务的运行态事实。它与 `projects/` 分工明确：

- `projects/`：长期项目身份、稳定事实、当前项目摘要和跨设备恢复入口。
- `tasks/`：有明确边界和结束条件的 Task、每次 Agent Run、看板状态与 Loop 配置。
- 源码仓：代码、分支、提交、测试与 PR 的事实源。

## 数据层级

```text
Project（长期）
└── Workstream（长期任务流）
    └── Task（有明确结束）
        ├── Run（一次 Agent 执行）
        └── Artifacts（handoff、feedback、commit、PR、文档）
```

注册项目的默认长期任务流定义在 `projects/<project-id>/workstreams.json`。每个项目都有一个
`<project-id>:daily-development` 主 Workstream；它是任务容器，不直接交给 Agent 执行。

## 文件布局

```text
tasks/
├── README.md
├── board.json
├── <project-id>/
│   ├── README.md
│   ├── <task-id>.json
│   └── runs/
│       └── <run-id>.json
└── loops/
    ├── README.md
    └── <loop-id>.json
```

Task 文件不按状态移动目录。`status` 字段是唯一状态事实，避免文件路径和内容双写。

## 看板生命周期

| 看板列 | Task 状态 | 含义 |
|---|---|---|
| 收集箱 | `captured` | 尚未梳理的输入 |
| 积压事项 | `backlog` | 已记录，暂不执行 |
| 待办事项 | `ready` | 目标和验收标准完整，可以领取 |
| 执行队列 | `queued` | 已分配，等待运行时领取 |
| 进行中 | `in_progress` | 至少一个 Run 正在执行 |
| 审核中 | `in_review` | 已交付证据，等待确认 |
| 已完成 | `done` | 验收通过 |
| 已阻塞 | `blocked` | 被外部条件阻塞 |
| 已取消 | `cancelled` | 不再执行但保留记录 |

允许的主路径：

```text
captured -> backlog -> ready -> queued -> in_progress -> in_review -> done
```

补充规则：

- `ready`、`queued`、`in_progress`、`in_review` 可以进入 `blocked` 或 `cancelled`。
- `blocked` 解除后回到 `backlog` 或 `ready`。
- 进入 `ready` 前必须至少填写一项 `scope.include` 和一项 `acceptance_criteria`。
- 审核不通过且目标未变时，Task 回到 `ready` 并创建新 Run。
- 审核意见改变目标或显著扩大范围时，创建子 Task 或后续 Task。
- `done` 后原则上创建后续 Task；只有验收标准未变的误关闭才重新打开。

## Task 与 Run

Task 描述“要交付什么”，Run 描述“某个 Agent 的一次执行”。一张 Task 可以有多个 Run：

```text
EPRO-128
├── EPRO-128-run-001  首次开发
├── EPRO-128-run-002  根据审核意见修正
└── EPRO-128-run-003  补测试并重新交付
```

Run 状态为：

```text
created -> dispatched -> running -> succeeded
                               ├-> failed
                               ├-> timed_out
                               └-> cancelled
```

Run 成功不等于 Task 完成。需要审核的 Task 在成功后进入 `in_review`，只有验收通过才进入 `done`。

## Handoff 与 Feedback

- Task 是持续更新的任务主记录。
- Handoff 是一次执行开始前的冻结输入。
- Feedback 是一次执行结束后的正式回执。
- `current_snapshot.md` 是项目级汇总，不复制完整任务列表。

Handoff、Feedback、Run 和 Git 产物必须通过同一个 `task_id` 关联；有多次执行时同时记录 `run_id`。

## Loop 边界

Loop 负责收集、去重、创建、调度和复查 Task，不是另一种 Task。Loop 默认遵守：

- 自动收集的输入先进入 `backlog`。
- 没有人审核时，高风险任务不得自动完成或发布。
- 每次运行必须有数量上限、风险上限和去重键。
- 失败进入 `blocked`、通知或等待下次调度，不无限重试。
- 医疗业务规则、生产数据、发布部署等高风险动作必须保留人工审核。

Loop 字段见 `schemas/loop.schema.json`，配置放在 `tasks/loops/`。

## 任务文件要求

创建 Task 前至少明确：

1. `project_id` 与 `workstream_id`。
2. 一个可验证的 `objective`。
3. `scope.include` 与 `scope.exclude`。
4. 至少一条 `acceptance_criteria`。
5. `risk_level` 与 `requires_review`。
6. 无人参与、失败和超时时的处理策略。

字段参考：

- `schemas/task.schema.json`
- `schemas/task-run.schema.json`
- `schemas/workstream.schema.json`
- `schemas/loop.schema.json`
- `templates/`

## 兼容旧任务

历史 handoff/feedback 不要求批量补造 Task 或 Run。新任务从本协议启用后使用 Task 主记录；只有历史任务重新进入执行、且继续追踪有实际价值时，才为它补建 Task，并在 `source.ref` 中引用原 handoff。
