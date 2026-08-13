# Skills

这个目录放可执行抽象。对于 `context-bridge` 来说，skill 不是附加层，而是把规则落到执行入口的必要层。

## 当前 canonical skill

- [`context-bridge/SKILL.md`](./context-bridge/SKILL.md)

它负责注册项目协作子系统：项目注册与初始化、Workstream / Task 生命周期、Agent Run、handoff / feedback、profile / snapshot、受控 Loop 和开发任务执行。

## 这个层的作用

- `docs/` 负责写规则和说明
- `skills/` 负责把规则变成可执行入口
- `context/system/` 负责注册项目协作的共享规则
- `scripts/` 负责幂等创建目录、registry 和索引
- `README.md` 负责展示整体结构和快速入口
- 真实任务仍然通过 `handoff -> 执行 -> feedback` 流转，并由 `tasks/` 记录生命周期

## 这份索引要解决什么

- 让人一眼知道该看哪个 skill
- 让 agent 知道执行入口在哪里
- 让后续抽象只在一个 canonical skill 上演进
