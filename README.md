# context-bridge

`context-bridge` 是一个基于 Git 的多 Agent 协作上下文仓。

它的目标不是替代聊天工具，而是把协作中最容易丢失的事实长期固定下来：

- 项目背景
- 当前状态
- 任务交接
- 执行回执
- 跨项目边界
- 可执行的 skill 抽象

这样做的结果是：

- 可追踪
- 可复盘
- 可复用
- 少依赖口头转述

## 适合的场景

- Web AI 负责规划和拆任务
- 本地 coding agent 负责执行
- 跨项目协作需要显式落库
- 长周期项目需要持续对齐上下文

## 核心原则

1. Git 是事实源
2. 项目标识以 `source_repo` 为准
3. 稳定事实写 `project_profile.md`
4. 当前状态写 `current_snapshot.md`
5. 任务流必须走 `handoff -> 执行 -> feedback`
6. 所有协作必须显式、可追踪、可复盘
7. `skill` 是必要抽象层，不是附属说明

## 工作方式

`context-bridge` 把协作拆成三层：

- `docs/`：说明规则、结构和约定
- `skills/`：把规则变成可执行入口
- `context/`：承载项目、agent 和系统级事实

实际任务仍然通过 `handoff -> 执行 -> feedback` 流转。

## 快速入口

- [`docs/index.md`](docs/index.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/skills.md`](docs/skills.md)
- [`docs/quickstart.md`](docs/quickstart.md)
- [`docs/onboarding.md`](docs/onboarding.md)
- [`docs/project-model.md`](docs/project-model.md)
- [`docs/agent-routing.md`](docs/agent-routing.md)
- [`skills/README.md`](skills/README.md)
- [`skills/context-bridge/SKILL.md`](skills/context-bridge/SKILL.md)
- [`examples/README.md`](examples/README.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`LICENSE`](LICENSE)

## 配图

### 任务流

![Task flow diagram](assets/bridge-flow.svg)

### 上下文分层

![Context layers diagram](assets/layers.svg)

### Skill 抽象

![Skill layer diagram](assets/skill-lens.svg)

## 目录概览

```text
context/
  projects/
    registry/
    _template/
  agents/
    registry/
    bindings/
  system/

docs/
  index.md
  architecture.md
  skills.md
  quickstart.md
  onboarding.md
  project-model.md
  agent-routing.md

skills/
  README.md
  context-bridge/
    SKILL.md

examples/
  README.md
  2026-04-19-example-note.md
  task-handoff.example.json
  task-feedback.example.json

assets/
  bridge-flow.svg
  layers.svg
  skill-lens.svg
```

## 约定

- `project_profile.md` 记录长期稳定信息
- `current_snapshot.md` 记录当前状态
- `handoffs/` 记录任务输入
- `feedback/` 记录执行输出
- `docs/index.md` 必须跟随 `docs/` 下新增文档同步更新

## 目标

让 Agent 协作更简单、更稳定、更少重复沟通。
