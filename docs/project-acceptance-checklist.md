# 项目验收清单

这份清单用于判断一个项目是否已经真正接入 `context-bridge`。

## 必须项

- [ ] `projects/registry/<project-id>.json` 已存在
- [ ] `projects/<project-id>/README.md` 已存在，并可作为项目启动入口
- [ ] `project_profile.md` 已存在
- [ ] `current_snapshot.md` 已存在
- [ ] `workstreams.json` 已存在，且 `primary_workstream_id` 指向日常迭代 Workstream
- [ ] `docs/index.md` 已存在
- [ ] `handoffs/` 已存在
- [ ] `feedback/` 已存在
- [ ] `task-docs/` 已存在
- [ ] `skills/context-bridge/SKILL.md` 可用
- [ ] registry 的 `entry_points.memory`、`profile`、`snapshot`、`workstreams` 都指向有效文件，`tasks` 指向对应任务目录
- [ ] registry 的 `source_repo` 与目标源码仓 Git remote 一致
- [ ] 当前设备路径已追加到 `local_paths`，且没有覆盖其他设备路径

## 工作流校验

- [ ] 能从 `handoff` 进入任务执行
- [ ] 能创建结构化 Task，并按合法生命周期迁移状态
- [ ] 同一 Task 的多次执行能够通过不同 `run_id` 区分
- [ ] 能把结果写回 `feedback`
- [ ] 能同步更新 `current_snapshot.md`
- [ ] 新增文档时会先更新 `docs/index.md`
- [ ] 开发型任务能区分 `feedback` 与 `docs/task-docs`
- [ ] 如项目声明了本地执行 agent，能够显式路由到该 agent

## 通过标准

满足以上条件后，项目才算接入完成。
