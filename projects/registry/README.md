# 项目注册表（v1）

项目注册表用于描述当前 workspace 中有哪些项目，以及它们的基本信息和关系。

设计目标：

- 轻量
- 可读
- 不引入复杂依赖

## 目录结构

```text
projects/registry/
  *.json
```

每个项目一个 JSON 文件。

新项目优先使用初始化器生成或合并 registry：

```bash
./scripts/context-bridge.sh project init \
  --project-id <project-id> \
  --source-repo <git-url> \
  --local-path <当前设备源码仓路径>
```

## 字段说明（最小集合）

- `project_id`：唯一标识
- `source_repo`：身份锚点，必须有
- `name`：项目名称（可选）
- `description`：项目说明（可选）
- `agents`：参与该项目的 agent（可选）
- `related_projects`：相关项目（可选）
- `entry_points`：项目上下文入口（建议）；`memory` 指向统一启动页，`profile` 和 `snapshot` 指向项目事实源，`workstreams` 指向长期工作方向，`tasks` 指向独立任务控制面
- `local_paths`：按操作系统记录已知本地路径（可选，仅用于发现，不参与项目身份判断）

## 示例

```json
{
  "project_id": "demo-project",
  "source_repo": "ssh://git@example.com/demo-project.git",
  "name": "Demo Project",
  "local_paths": {
    "macos": "/Users/<you>/workspace/demo-project",
    "windows": "D:/workspace/demo-project"
  },
  "agents": ["local-code-agent-001"],
  "entry_points": {
    "memory": "projects/demo-project/README.md",
    "profile": "projects/demo-project/project_profile.md",
    "snapshot": "projects/demo-project/current_snapshot.md",
    "workstreams": "projects/demo-project/workstreams.json",
    "tasks": "tasks/demo-project/"
  }
}
```

## 使用建议

- 只记录“可发现信息”，不要放业务逻辑。
- 不要引入复杂依赖关系，保持 v1 简单。
- `project_id` 和 `source_repo` 是最小稳定身份。
- `local_paths` 可以同时保存多台设备的路径；进入项目时选择当前设备上实际存在且 Git 远端匹配的路径。
- 与 `agents/registry` 配合使用。

## 任务与生命周期

Registry 只保存任务入口，不保存 Task 列表。长期 Workstream 位于 `projects/<project-id>/workstreams.json`，具体 Task、Run 和 Loop 位于顶层 `tasks/`，避免把项目身份数据与高频运行态数据混在一起。
