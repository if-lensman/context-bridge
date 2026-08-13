# Examples

这里放 `context-bridge` 的最小可运行样例。

## 内容

- `task.example.json`：Task 主记录示例
- `task-run.example.json`：一次 Agent Run 示例
- `task-handoff.example.json`：任务交接（冻结输入）示例
- `task-feedback.example.json`：执行回执示例
- `loop.example.json`：受控 Loop 配置示例
- `2026-04-19-example-note.md`：与示例回执配套的说明文档

## 使用方式

- 这些示例只用于理解字段和结构
- 给新项目接入提供模板
- 给 agent 提供输出参考
- 真正项目中请写到对应项目目录下的 `handoffs/` 和 `feedback/`，Task 主记录写到 `tasks/<project-id>/`

## 校验

所有示例都符合 `schemas/` 中对应 schema。
