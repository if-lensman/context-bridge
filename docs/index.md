# Docs Index

这是 `context-bridge` 的文档入口。先看索引，再看具体文档。

## 阅读顺序

1. [`quickstart.md`](./quickstart.md)
2. [`onboarding.md`](./onboarding.md)
3. [`project-model.md`](./project-model.md)
4. [`agent-routing.md`](./agent-routing.md)
5. [`task-system-design.md`](./task-system-design.md)
6. [`how-to-adapt-project-task-system.md`](./how-to-adapt-project-task-system.md)
7. [`scenarios.md`](./scenarios.md)
8. [`skills.md`](./skills.md)
9. [`architecture.md`](./architecture.md)

## 文档说明

| 文档 | 说明 |
|---|---|
| [`quickstart.md`](./quickstart.md) | 最短接入路径，适合第一次看这个仓库的人。 |
| [`onboarding.md`](./onboarding.md) | 说明如何把已有项目接入 context-bridge。 |
| [`project-model.md`](./project-model.md) | 说明项目身份、生命周期和上下文分层。 |
| [`agent-routing.md`](./agent-routing.md) | 说明项目任务、全局任务和跨项目任务如何路由。 |
| [`task-system-design.md`](./task-system-design.md) | 解释 Project、Workstream、Task、Run 和 Loop 的分层原因与事实源边界。 |
| [`how-to-adapt-project-task-system.md`](./how-to-adapt-project-task-system.md) | 委派其他 Agent 完善负责项目任务体系的操作指南与可复制提示词。 |
| [`scenarios.md`](./scenarios.md) | 真实场景演练：换电脑重初始化、Agent 切模型恢复、新项目接入闭环、跨 Agent 交接。 |
| [`skills.md`](./skills.md) | 解释为什么 skill 是必要抽象层，以及它如何承接文档。 |
| [`architecture.md`](./architecture.md) | 说明仓库级目录、工作流和分层原则。 |

## 其他入口

- [`../projects/README.md`](../projects/README.md)：项目远程记忆总入口
- [`../tasks/README.md`](../tasks/README.md)：Task、Run、看板状态和 Loop 的字段与生命周期参考
- [`../scripts/README.md`](../scripts/README.md)：初始化与任务生命周期命令参考
- [`../projects/registry/README.md`](../projects/registry/README.md)：项目注册表字段说明

## 规则

- 新增或更新仓库级稳定文档时，必须同步更新本文件。
- `projects/` 放共享项目记忆；`tasks/` 放运行态任务。
- 注册项目过程材料放到对应项目的 `task-docs/`，执行结果放到 `feedback/`。
