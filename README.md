# context-bridge

一个基于 Git 的多 Agent 协作上下文模板。

`context-bridge` 不是一个“万能记忆系统”，而是解决多 Agent 协作中的几个现实问题：

- 项目背景需要反复解释
- 当前任务进度需要反复同步
- Web 侧与本地代码现实逐渐脱节
- 多个 Agent 协作时，任务边界和上下文容易丢失

因此，`context-bridge` 采用 **Git + 结构化上下文文件** 的方式，让协作变得：

- 可追踪
- 可复盘
- 可复用
- 更少依赖口头转述

---

## Execution Model

系统采用 **scope-first + repository-first** 模式：

- **项目任务**：默认范围。`context/projects/<project-id>/handoffs/` 下的任务，优先由该项目相关 agent 处理。
- **全局任务**：共享 / 系统范围。规则、README、onboarding、registry 清理等任务，可由任意合适 agent 执行。
- **跨项目任务**：允许。一个本地 agent 可以向另一个项目 agent 派发任务，但仍然必须通过 handoff / feedback 显式落库。

---

## 核心设计

### 1. 仓库即事实源

所有共享信息都应该写入仓库，而不是只停留在对话里。

---

### 2. 项目标识（Project Identity）

项目以 `source_repo` 为主标识：

- 同一个 Git 仓库 = 同一个项目
- 名称相似 ≠ 同一个项目
- task / feedback 路径不作为项目身份依据

---

### 3. 项目生命周期

一个项目通常经历：

- **registered**：已注册
- **initialized**：已初始化
- **activated**：已跑通至少一轮 handoff → feedback

只有出现真实任务流，项目才算真正激活。

---

### 4. 上下文分层

#### `project_profile.md`
长期稳定信息：

- 架构
- 核心约束
- 入口文件 / 模块
- 长期规则

#### `current_snapshot.md`
当前状态：

- 当前目标
- 进度
- 风险 / 阻塞
- 下一步

原则：
- **profile 写长期事实**
- **snapshot 写当前状态**

---

### 5. 任务流（核心）

所有任务都应显式走：

```text
handoff → 执行 → feedback
```

否则不算真实执行，也不便于后续复盘。

---

### 6. Agent 路由规则

- 默认：项目 agent 处理本项目任务
- 全局任务：任意合适 agent 可执行
- 支持 agent ↔ agent 派发任务
- 跨项目协作必须显式写入 handoff / feedback

---

## 推荐目录结构

```text
context/
  projects/
    registry/
    _template/
  agents/
    registry/
    bindings/
  system/

docs/
  quickstart.md
  onboarding.md
  project-model.md
  agent-routing.md
```

---

## 最小规则

1. 任务必须写入 handoff
2. 执行结果必须写入 feedback
3. 状态写 snapshot，不写 profile
4. 项目标识以 `source_repo` 为准
5. 协作必须显式、可追踪、可复盘

---

## 适用场景

- ChatGPT 或其他 Web AI 负责规划
- 本地 coding agent 负责执行
- 其他本地 agent 提供跨项目支持
- 长周期项目需要持续对齐上下文

---

## 从哪里开始

建议先看：

- `docs/quickstart.md`
- `docs/onboarding.md`
- `docs/project-model.md`
- `docs/agent-routing.md`

---

## 目标

让 Agent 协作：

- 更简单
- 更稳定
- 更少重复沟通
- 更不依赖单次对话记忆
