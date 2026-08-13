# context-bridge

![context-bridge banner](assets/hero-banner.png)

`context-bridge` 是一个基于 Git 的多 Agent 协作上下文仓。

它的目标不是替代聊天工具，而是把协作中最容易丢失的事实长期固定下来：

- 项目背景
- 当前状态
- 任务交接
- 执行回执
- 任务生命周期
- 跨项目边界
- 可执行的 skill 抽象

这样做的结果是：

- 可追踪
- 可复盘
- 可复用
- 少依赖口头转述

## 核心场景

### 注册项目协作

有独立源码仓的项目使用 `projects/` 保存身份和长期状态，使用 `tasks/` 保存任务主记录，执行流程为：

```text
handoff -> 执行 -> feedback -> current_snapshot
```

项目长期记忆位于 `projects/`；有明确结束条件的 Task、每次 Agent Run 和 Loop 位于独立的 `tasks/` 控制面。每个注册项目通过 `workstreams.json` 声明长期工作方向，并默认拥有一个不直接执行的 `daily-development` 主 Workstream。

### 任务控制面

`tasks/` 保存跨项目任务的运行态事实：

- `board.json`：状态到看板列的映射和 WIP 基础配置
- `tasks/<project-id>/<task-id>.json`：Task 主记录
- `tasks/<project-id>/runs/`：每次 Agent 执行记录
- `tasks/loops/`：任务收集、调度和复查规则

完整生命周期、字段和状态机见 [`tasks/README.md`](tasks/README.md)。

## 核心原则

1. Git 是事实源
2. 项目标识以 `source_repo` 为准
3. 稳定事实写 `project_profile.md`
4. 当前状态写 `current_snapshot.md`
5. 长期方向写 `workstreams.json`，有结束条件的 Task 和 Run 写 `tasks/`
6. 任务流必须走 `handoff -> 执行 -> feedback`
7. 所有协作必须显式、可追踪、可复盘
8. `skill` 是必要抽象层，不是附属说明

## 工作方式

`context-bridge` 把协作拆成几个区域：

- `projects/`：项目远程记忆与注册项目协作数据
- `tasks/`：Task、Run、Loop 运行态事实
- `context/`：agent 注册与系统规则
- `docs/`：说明规则、结构和约定
- `skills/`：把规则变成可执行入口
- `schemas/`、`templates/`、`examples/`：协议资源
- `scripts/`：初始化与任务生命周期命令

实际任务仍然通过 `handoff -> 执行 -> feedback` 流转。

## 场景演练

想直接看实际怎么用，读 [`docs/scenarios.md`](docs/scenarios.md)，包含四个完整场景：

- **换电脑重新初始化**：新设备恢复整个协作工作区并继续未完成任务
- **Agent 切换模型恢复对话与常识**：Codex 等 agent 换模型/环境后，从仓库恢复项目上下文
- **新项目接入 + 首条任务闭环**：从 `project init` 到 `feedback` 完整走一遍
- **跨 Agent 任务交接**：规划 agent 拆任务、执行 agent 落地，换人不中断任务链

## 初始化功能

仓库内置无第三方依赖的初始化工具。

初始化项目远程记忆：

```bash
./scripts/context-bridge.sh project init \
  --project-id <project-id> \
  --source-repo <git-url> \
  --local-path <当前设备源码仓路径>
```

创建一张任务：

```bash
./scripts/context-bridge.sh task init \
  --project-id <project-id> \
  --task-id <TASK-ID> \
  --title "<任务标题>" \
  --objective "<可验证目标>" \
  --acceptance "<验收标准>"
```

命令可重复运行：已有记忆文件不会被覆盖，当前设备路径会合并进 registry。参数和配置文件用法见 [`scripts/README.md`](scripts/README.md)。

## 快速入口

- [`docs/index.md`](docs/index.md)
- [`docs/quickstart.md`](docs/quickstart.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/task-system-design.md`](docs/task-system-design.md)
- [`docs/how-to-adapt-project-task-system.md`](docs/how-to-adapt-project-task-system.md)
- [`docs/scenarios.md`](docs/scenarios.md)
- [`docs/skills.md`](docs/skills.md)
- [`docs/project-acceptance-checklist.md`](docs/project-acceptance-checklist.md)
- [`projects/README.md`](projects/README.md)
- [`tasks/README.md`](tasks/README.md)
- [`scripts/README.md`](scripts/README.md)
- [`skills/README.md`](skills/README.md)
- [`skills/context-bridge/SKILL.md`](skills/context-bridge/SKILL.md)
- [`examples/README.md`](examples/README.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`LICENSE`](LICENSE)

## 配图

### 多 Agent 汇流

![Multi-agent hub](assets/multi-agent-hub.png)

### 任务流

![Task flow diagram](assets/bridge-flow.svg)

### 上下文分层

![Context layers diagram](assets/layers.svg)

### Skill 抽象

![Skill layer diagram](assets/skill-lens.svg)

## 目录概览

```text
projects/
  README.md
  registry/
    <project-id>.json
  <project-id>/
    README.md
    project_profile.md
    current_snapshot.md
    workstreams.json
    handoffs/
    feedback/
    docs/
    task-docs/

tasks/
  README.md
  board.json
  <project-id>/
    <task-id>.json
    runs/
      <run-id>.json
  loops/
    <loop-id>.json

context/
  agents/
    registry/
    bindings/
  system/
    rules.md
    project-identity.md
    agent-routing.md
    docs-and-feedback.md
    development-task-mode.md

docs/
  index.md
  architecture.md
  skills.md
  quickstart.md
  onboarding.md
  project-model.md
  agent-routing.md
  task-system-design.md
  how-to-adapt-project-task-system.md
  scenarios.md
  project-acceptance-checklist.md
  context-bridge-init-config.template.json

skills/
  README.md
  context-bridge/
    SKILL.md

scripts/
  README.md
  context-bridge.sh
  context-bridge.mjs
  context-bridge.test.mjs

schemas/
  task.schema.json
  task-run.schema.json
  task-handoff.schema.json
  task-feedback.schema.json
  loop.schema.json
  workstream.schema.json

templates/
  task.template.json
  task-run.template.json
  task-handoff.template.json
  task-feedback.template.json
  loop.template.json
  workstreams.template.json

examples/
  README.md
  task.example.json
  task-run.example.json
  task-handoff.example.json
  task-feedback.example.json
  loop.example.json

assets/
  hero-banner.png
  multi-agent-hub.png
  bridge-flow.svg
  layers.svg
  skill-lens.svg
```

## 约定

- `project_profile.md` 记录长期稳定信息
- `current_snapshot.md` 记录当前状态
- `workstreams.json` 记录长期工作方向
- `handoffs/` 记录任务输入
- `feedback/` 记录执行输出
- `tasks/` 记录 Task、Run 和 Loop 运行态事实
- `docs/index.md` 必须跟随 `docs/` 下新增文档同步更新
- 项目级 `docs/index.md` 必须跟随项目级文档更新

## 目标

让 Agent 协作更简单、更稳定、更少重复沟通。
