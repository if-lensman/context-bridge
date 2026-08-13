# Project Model

先看 [`docs/index.md`](./index.md)。

## 数据分层

系统把长期事实和运行态事实分开：

```text
Project（长期事实）
└── Workstream（长期工作方向）
    └── Task（有边界的交付目标）
        ├── Run（一次 Agent 执行）
        └── Artifact（handoff、feedback、commit、PR、文档）
```

### Project

解决“这是什么项目、源码在哪里、长期约束是什么、当前阶段处于什么状态”。它没有完成日期，不因为某张任务卡关闭而结束。

### Workstream

解决“项目的工作长期沿着哪些方向发生”。每个注册项目默认有一个 `<project-id>:daily-development` 主 Workstream；它是任务容器，不直接交给 Agent 执行。声明在 `workstreams.json`。

### Task

解决“这一轮到底要交付什么”。目标单一、范围明确、可以验收，最终进入 `done` 或 `cancelled`。主记录在 `tasks/<project-id>/<task-id>.json`。

### Run

解决“谁在什么时候执行了哪一次”。评论修正、失败重试或换 Agent 执行都会产生新的 Run，但目标不变时仍属于同一 Task。记录在 `tasks/<project-id>/runs/`。

### Loop

Task 的生产与调度规则，不是任务本身。默认从 `draft` 开始，配置在 `tasks/loops/`。

## Identity

- `source_repo` = project identity
- `project_id` = repo 内部映射主键

## Lifecycle

- registered：已在 `projects/registry/` 注册
- initialized：`projects/<project-id>/` 已建立
- activated：至少走完一条 `handoff -> feedback` 闭环

## Context Split

- `project_profile.md` = 长期稳定事实
- `current_snapshot.md` = 当前状态摘要
- `workstreams.json` = 长期工作方向
- `tasks/` = Task / Run / Loop 运行态事实

## Execution Layer

- canonical skill = [`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md)
- 任务、回传、快照更新都通过这个 skill 统一处理

## 为什么不使用一张永久开发任务

永久任务会不断累积评论、执行记录、目标变化和附件，最终重现“一个巨型对话无法追溯”的问题。长期工作用 Workstream 表达，具体工作持续拆成有结束条件的 Task，才能维持上下文边界。详见 [`task-system-design.md`](./task-system-design.md)。
