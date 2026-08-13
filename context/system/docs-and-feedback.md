# Docs & Feedback 使用规范（v1）

本规范用于明确：

- 什么时候写 feedback
- 什么时候写 docs
- 两者如何协同

---

## 一、设计目标

解决以下问题：

- feedback 太简略，信息不够
- 长内容写在 feedback 中难以阅读
- 缺少统一的分析 / 方案沉淀位置

---

## 二、目录约定

每个项目应具备：

```text
projects/<project-id>/
  handoffs/
  feedback/
  docs/
```

`docs/` 目录下还应有一个统一索引文件：

```text
projects/<project-id>/docs/index.md
```

---

## 三、职责划分

### 1. feedback（必须）

用于记录任务结果摘要，必须符合 `schemas/task-feedback.schema.json`。

应包含：

- `task_id`
- `project_id`
- `status`
- `summary`
- `done`
- `changed_files`
- `open_questions`
- `updated_at`
- 如有详细材料，引用对应 docs 文件

要求：

- 简洁
- 可快速 review
- 不放长篇分析
- 不混用 `project` 和 `project_id`

---

### 2. docs（可选但推荐）

用于记录详细内容。

适合放：

- 调研记录
- 方案设计
- 分析过程
- 复杂执行说明
- 任务相关附件说明
- 新增文档的背景索引条目

要求：

- 新增或更新 `docs/` 文件时，必须同步更新 `docs/index.md`
- 索引里必须写该文档的背景简述
- 背景简述只写用途，不写长分析

---

## 四、关系模型

```text
Task → Run → handoff → 执行 → feedback（摘要）
                                  ↓
                                 docs（详细内容）
```

---

## 五、命名规范

### feedback

建议：

```text
YYYY-MM-DD-任务名-序号.json
```

示例：

```text
2026-04-18-初始化流程梳理-001.json
```

### docs

建议：

```text
YYYY-MM-DD-主题.md
```

示例：

```text
2026-04-18-初始化流程分析.md
```

命名优先中文可读性，必要时可中英混合。

---

## 六、引用方式

如果任务产生了详细说明文档，feedback 中应引用 docs：

```json
{
  "task_id": "2026-04-18-初始化流程梳理-001",
  "project_id": "demo-project",
  "status": "done",
  "done": [
    "完成初始化流程梳理"
  ],
  "changed_files": [
    "projects/demo-project/project_profile.md",
    "projects/demo-project/current_snapshot.md"
  ],
  "open_questions": [],
  "summary": "完成初始化流程梳理",
  "docs": [
    "projects/demo-project/docs/2026-04-18-初始化流程分析.md"
  ],
  "updated_at": "2026-04-18"
}
```

---

## 七、使用原则

| 内容类型 | 放哪里 |
|--------|--------|
| 结果总结 | feedback |
| 长文说明 | docs |
| 中间思考 | docs |
| 最终状态 | feedback |
| 任务主状态与执行关联 | `tasks/<project-id>/<task-id>.json` |

---

## 八、禁止事项

- 不要把长文直接写在 feedback 中
- 不要只写 docs 不写 feedback
- 不要让 docs 成为无人引用的孤岛
- 不要混用 `project` 和 `project_id`
- 不要新增 docs 但不更新 `docs/index.md`

---

## 九、目标

让系统具备：

- 可读性（人能看）
- 可追踪性（任务链清晰）
- 可复用性（docs 可沉淀）
