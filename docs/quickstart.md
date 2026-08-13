# Quickstart

先看 [`docs/index.md`](./index.md)，再进入执行入口。

当前仓库的正式 skill 是：

- [`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md)

## 1. Fork 仓库

Fork 本仓库到你自己的账号，然后 clone 到本地。

## 2. 初始化项目

使用内置脚本建立项目远程记忆（幂等，可重复运行）：

```bash
./scripts/context-bridge.sh project init \
  --project-id demo-project \
  --source-repo ssh://git@example.com/demo-project.git \
  --local-path /path/to/demo-project
```

这会创建：

- `projects/demo-project/README.md`、`project_profile.md`、`current_snapshot.md`、`workstreams.json`
- `projects/demo-project/{handoffs,feedback,docs,task-docs}/`
- `projects/registry/demo-project.json`
- `tasks/demo-project/` 任务目录
- 在 `projects/README.md` 中加入项目索引

## 3. 注册项目

`project init` 已自动完成注册。也可以手写 registry：

```json
{
  "project_id": "demo-project",
  "source_repo": "ssh://git@example.com/demo-project.git"
}
```

## 4. 创建一张 Task

```bash
./scripts/context-bridge.sh task init \
  --project-id demo-project \
  --task-id DEMO-001 \
  --title "示例任务" \
  --objective "验证任务生命周期" \
  --acceptance "任务文件创建成功"
```

## 5. 跑一条任务

1. 写 `handoff`（冻结输入）
2. 按 [`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md) 执行
3. 写 `feedback`（正式回执）
4. 更新 Task 状态与 `current_snapshot.md`

只有出现 `feedback`，项目才算激活。

## 更多

- 命令参考：[`../scripts/README.md`](../scripts/README.md)
- 任务控制面：[`../tasks/README.md`](../tasks/README.md)
- 协议资源：`schemas/`、`templates/`、`examples/`
