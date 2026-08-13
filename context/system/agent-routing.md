# agent 路由与跨 agent 任务规则

## 1. 默认归属

每个项目任务首先归属于所属项目。

也就是说：

- 位于 `projects/<project-id>/handoffs/` 下的任务，默认由该项目处理。
- 所属项目的 agent 应该优先消费这类任务。

## 2. 全局任务

只要任务明确属于共享基础设施工作，任意合适的 agent 都可以执行。

典型全局任务包括：

- 规则更新
- onboarding 脚本更新
- README / docs 清理
- task / feedback schema 调整
- registry 清理和身份修复

## 3. 跨项目任务

本地 agent 可以把工作派给另一个项目的 agent，但任务仍然必须落库到 Git。

handoff 里必须包含的字段：

- `task_id`：任务唯一标识
- `project_id`：工作结果最终归属的项目
- `source_repo`：项目来源仓库
- `from`：发起方 agent
- `to`：目标 agent
- `goal`：任务目标
- `constraints`：硬约束
- `deliverables`：交付物
- `related_projects`：必要时写支持项目
- `background`：为什么需要别的项目协助

任务应该明确写出“哪个项目需要结果”，支持项目放在 `related_projects` 里。

## 4. 工作仓入口

工作仓入口顺序如下：

1. 按 `source_repo` 解析项目。
2. 读取 `projects/registry/<project-id>.json`。
3. 打开 `entry_points.profile`。
4. 打开 `entry_points.snapshot`。
5. 读取 `handoffs/` 中的当前任务。
6. 把结果写回 `feedback/`。

不要把任务路径、反馈路径或目录相似度当作身份信号。
不要用 `project` 代替 `project_id`。

## 5. 路由原则

- 单项目工作默认由本地项目 agent 处理。
- 全局工作可以交给任意合适的 agent。
- 跨项目工作允许存在，但必须在 handoff 和 feedback 中保持显式。

## 6. 禁止模式

- 不要只在聊天里路由任务。
- 不要通过名字相近去猜项目身份。
- 不要把跨项目协作隐藏在 handoff / feedback 之外。

## 7. 目标

让任务流同时满足：

- 默认项目执行
- 全局规则工作
- 显式跨项目协作

并且始终可追踪、可回放。
