# Contributing

感谢你帮助改进 `context-bridge`。

## 先读什么

1. [`README.md`](README.md)
2. [`docs/index.md`](docs/index.md)
3. [`docs/architecture.md`](docs/architecture.md)
4. [`docs/task-system-design.md`](docs/task-system-design.md)
5. [`docs/project-model.md`](docs/project-model.md)

## 贡献范围

- 文档修订（`docs/`）
- 项目模型与任务生命周期补充（`projects/`、`tasks/`）
- 路由与系统规则优化（`context/system/`）
- skill 执行入口完善（`skills/context-bridge/SKILL.md`）
- 协议资源更新（`schemas/`、`templates/`、`examples/`）
- CLI 与初始化脚本（`scripts/`）

## 提交原则

- 先更新最小必要文档，再扩展正文
- 新增仓库级文档时，先更新 `docs/index.md`
- 示例文件要保持最小可读，且符合 `schemas/` 中对应 schema
- 不要把临时讨论写进稳定文档

## 推荐改动顺序

1. 先改 `docs/`
2. 再改 `context/` 或 `skills/`
3. 同步 `schemas/`、`templates/`、`examples/`
4. 最后补 `scripts/` 及对应测试

## 开源风格

- 说明优先清晰
- 结构优先稳定
- 内容优先可追踪

如果你在提交前不确定文档该放哪里，优先放到 `docs/`，不要散到多个目录。
