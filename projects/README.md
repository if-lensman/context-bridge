# 项目远程记忆

> 每个项目一个目录，以 `README.md` 作为启动页，记录跨多个 agent 共用的稳定记忆、当前入口和换设备注意事项。本目录不替代项目源码仓；它是项目在 AI 工作空间里的远程记忆。

---

## 使用方式

任何 agent 进入本仓库后：

1. 读取所属 agent 的主交接文档（如存在）。
2. 读取目标项目的 `projects/<project-id>/README.md`。
3. 已注册项目继续读取同目录的 `project_profile.md`、`current_snapshot.md` 和最新 handoff/feedback。
4. 有具体执行任务时，再读取 `workstreams.json` 和 `tasks/<project-id>/` 中的活跃 Task。
5. 开始修改代码前，读取目标仓库自己的 `AGENTS.md`、`CLAUDE.md` 或同类执行规则，并检查实时 Git 状态。

对新设备 agent 的首条指令：

> 读取所属 agent 的交接文档（如存在），以及 `projects/` 下相关项目的交接文档，了解当前开发状态。

---

## 事实优先级

发现冲突时按以下优先级处理：

1. 目标项目仓库的实时代码、Git 状态和仓库级 agent 规则。
2. `projects/<project-id>/project_profile.md` 与 `current_snapshot.md`。
3. `projects/<project-id>/README.md` 中的项目启动摘要。
4. agent 会话和聊天记录。

本目录中的“当前状态”是带日期的设备迁移快照，不保证永久最新。执行任务前必须做一次实时核验。

---

## 项目目录约定

每个项目目录以 `README.md` 为统一入口。已注册项目还可以包含：

```text
projects/<project-id>/
├── README.md
├── project_profile.md
├── current_snapshot.md
├── workstreams.json
├── handoffs/
├── feedback/
├── docs/
└── task-docs/
```

具体 Task、Run 和 Loop 不放在项目记忆目录中，统一位于顶层 `tasks/`。`workstreams.json` 只声明长期工作方向和默认任务策略。

启动页通常包含以下章节：

| 章节 | 内容 |
|------|------|
| 记忆状态 | 最后核验时间、接入状态、权威事实源 |
| 基本信息 | 仓库地址、旧设备路径、技术栈 |
| 项目定位 | 一句话说清项目干什么 |
| 当前工作状态 | 核验时的分支、提交、工作区和任务状态 |
| 项目 Skill | 项目内建的 Skill 及其用途（如有） |
| 关键入口文件 | 核心代码文件路径 |
| 开发约束 | 必须遵守的规则 |
| 关键记忆 | 可跨会话复用、且不应只留在聊天中的认知 |
| 接入步骤 | 换设备后 clone + 配置的最短路径 |

本地路径只用于设备定位，不参与项目身份判断。一个项目可以同时记录多台设备的已知路径；新增当前设备路径时不要覆盖其他设备路径。真正的项目身份仍以 `source_repo` 为准。新增项目目录时请遵循此格式。

---

## 项目清单

<!-- project-memory-index:start -->
| 项目 | 启动入口 | 状态 | 说明 |
|------|------|------|------|
| （由 `project init` 自动维护） | | | |
<!-- project-memory-index:end -->

---

## 维护规则

- 新项目优先运行 `./scripts/context-bridge.sh project init` 建立目录、registry 和本索引项。
- 项目有重大进展、分支切换、入口变化或新设备迁移时，更新对应 `README.md` 的核验日期。
- 稳定事实优先回写 `project_profile.md`；当前执行状态优先回写 `current_snapshot.md`。
- `projects/` 保存跨设备恢复所需的摘要和未注册项目记忆，不复制完整聊天记录。
- 不记录 API Key、Cookie、Token、内网账号等秘密。
- 未经核验的会话推断必须明确标记为“待核验”。

_本目录由各 agent 共同维护。_
