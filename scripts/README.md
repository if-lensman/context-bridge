# 初始化命令参考

本目录提供 `context-bridge` 自己的仓库功能，不依赖第三方 npm 包。

## 命令入口

macOS / Linux：

```bash
./scripts/context-bridge.sh <command> <action> [options]
```

跨平台 Node.js：

```bash
node scripts/context-bridge.mjs <command> <action> [options]
```

运行 `./scripts/context-bridge.sh --help` 查看完整参数。

## `project init`

初始化或补齐项目远程记忆。

最小参数：

```bash
./scripts/context-bridge.sh project init \
  --project-id demo-project \
  --source-repo ssh://git@example.com/demo-project.git
```

常用参数：

| 参数 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `--project-id` | 是 | 无 | 项目标识 |
| `--source-repo` | 是 | 无 | 项目身份锚点 |
| `--name` | 否 | `project-id` | 显示名称 |
| `--description` | 否 | 空 | 项目长期用途 |
| `--summary` | 否 | description | 项目总索引说明 |
| `--status` | 否 | `已初始化` | 项目总索引状态 |
| `--agent` | 否 | 空 | 参与 agent，可重复传入 |
| `--local-path` | 否 | 空 | 当前设备源码仓路径 |
| `--platform` | 否 | 自动识别 | `macos`、`linux` 或 `windows` |
| `--config` | 否 | 空 | 初始化 JSON 配置 |
| `--dry-run` | 否 | `false` | 只显示操作 |

行为：

- 创建缺失的项目启动页、profile、snapshot、`workstreams.json` 和任务目录。
- 创建或合并 `projects/registry/<project-id>.json`。
- 将当前设备路径合并到 `local_paths`，保留其他平台路径。
- 将项目加入 `projects/README.md`。
- 已存在的项目记忆文件默认保留，不覆盖用户内容。
- 已有 registry 的 `source_repo` 与传入值不一致时停止，避免串项目。

## `handover init`

初始化设备或 agent 交接文档。

```bash
./scripts/context-bridge.sh handover init \
  --agent-id demo-agent \
  --title "Demo Agent 交接文档"
```

| 参数 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `--agent-id` | 是 | 无 | agent 标识 |
| `--title` | 否 | `<agent-id> 交接文档` | 文档标题 |
| `--output` | 否 | `docs/handover/<agent-id>-handover.md` | 仓库内输出路径 |
| `--config` | 否 | 空 | 初始化 JSON 配置 |
| `--force` | 否 | `false` | 覆盖已有交接文档 |
| `--dry-run` | 否 | `false` | 只显示操作 |

默认不会覆盖已有交接文档。只有明确传入 `--force` 才会重建。

## `task init`

在独立任务控制面中创建一张 Task。项目必须已经注册并具备 `workstreams.json`。

```bash
./scripts/context-bridge.sh task init \
  --project-id epro-platform \
  --task-id EPRO-128 \
  --title "修复 OCR 时间字段解析" \
  --objective "支持指定日期格式并保持现有行为" \
  --type bug \
  --risk-level high \
  --acceptance "新增日期格式测试通过" \
  --acceptance "原有测试通过"
```

没有传入 `--workstream-id` 时使用项目的 `primary_workstream_id`；类型、优先级、风险和审核要求优先继承 Workstream 默认值。新任务默认进入 `captured`，初始化时只允许 `captured` 或 `backlog`。补齐 `scope.include` 后才能迁移到 `ready`。

## `task transition`

按允许的生命周期迁移 Task：

```bash
./scripts/context-bridge.sh task transition \
  --project-id epro-platform \
  --task-id EPRO-128 \
  --status backlog
```

进入 `blocked` 或 `cancelled` 必须补充原因：

```bash
./scripts/context-bridge.sh task transition \
  --project-id epro-platform \
  --task-id EPRO-128 \
  --status blocked \
  --reason "等待客户确认日期语义"
```

状态路径和字段参考 [`../tasks/README.md`](../tasks/README.md)。命令不会自动执行 Agent、创建分支、提交或推送。

## 配置文件

配置模板位于：

- [`../docs/context-bridge-init-config.template.json`](../docs/context-bridge-init-config.template.json)

项目初始化：

```bash
./scripts/context-bridge.sh project init \
  --config docs/context-bridge-init-config.template.json
```

交接文档初始化：

```bash
./scripts/context-bridge.sh handover init \
  --config docs/context-bridge-init-config.template.json
```

命令行参数优先于配置文件中的同名字段。

## 验证

脚本使用 Node.js 内置测试运行器，不需要安装依赖：

```bash
node --test scripts/context-bridge.test.mjs
```
