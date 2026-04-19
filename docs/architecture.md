# Architecture

先看 [`docs/index.md`](./index.md)。

## 目标

`context-bridge` 的目标是把多 Agent 协作中的上下文固定成可追踪、可复盘、可复用的 Git 事实。

## 核心组件

### 1. `context/projects/registry/`

项目注册表，用 `project_id` 和 `source_repo` 锚定项目身份。

### 2. `context/projects/<project-id>/`

项目上下文目录，承载：

- `project_profile.md`
- `current_snapshot.md`
- `handoffs/`
- `feedback/`
- `docs/`
- `task-docs/`

### 3. `context/agents/`

Agent 注册与绑定目录，用来说明谁能处理什么任务。

### 4. `context/system/`

系统规则与运行模型目录，用来固定身份、路由和任务流规则。

### 5. `docs/`

仓库级说明入口，适合新读者先看。

### 6. `skills/`

可执行抽象层。这里的 canonical skill 是 `skills/context-bridge/SKILL.md`。

### 7. `examples/`

最小 handoff / feedback 样例，方便直接照着写。

### 8. `docs/skills.md`

解释 `skill` 为什么是必要抽象层，以及它如何连接文档和执行。

## 工作流

```text
read docs -> identify project -> read profile -> read snapshot -> read handoff -> execute -> write feedback -> update snapshot
```

## 分层原则

- `project_profile.md` 写长期稳定信息
- `current_snapshot.md` 写当前状态
- `handoffs/` 写任务输入
- `feedback/` 写执行输出
- `docs/` 写稳定说明
- `skills/` 写可执行入口

## 阅读顺序

- 新人先看 `README.md`
- 再看 `docs/index.md`
- 再看 `docs/architecture.md`
- 再看 `docs/skills.md`
- 最后进入 `skills/context-bridge/SKILL.md`
