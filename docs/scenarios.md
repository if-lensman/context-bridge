# Scenarios

这份文档用几个真实场景演示 `context-bridge` 怎么用。每个场景都只依赖 Git 仓库里的文件，不依赖任何一次具体会话。

> 场景中的 `demo-project`、`DEMO-001` 是示例名，实际使用时替换成你自己的 `project_id` 和 `task_id`。

---

## 场景一：换电脑重新初始化

**背景**：换了一台新电脑，需要在新设备上恢复整个协作工作区，并继续未完成的任务。

**前提**：context-bridge 仓库已在 Git 远端（例如 GitHub），`projects/` 和 `tasks/` 已提交。

**步骤**

1. 克隆仓库：

```bash
git clone <context-bridge-repo-url>
cd context-bridge
```

2. 读入口，了解仓库结构和当前有哪些项目：

- [`docs/index.md`](./index.md)
- [`../projects/README.md`](../projects/README.md)

3. 从 registry 确认目标项目身份：

```bash
cat projects/registry/demo-project.json
# 核对 source_repo，它才是项目身份锚点
```

4. 用 `project init` 把新设备路径合并进 registry（幂等，不会覆盖旧设备路径，也不会改动已有记忆文件）：

```bash
./scripts/context-bridge.sh project init \
  --project-id demo-project \
  --source-repo ssh://git@example.com/demo-project.git \
  --local-path /Users/<you>/workspace/demo-project
```

5. 恢复项目上下文，按顺序读：

- `projects/demo-project/README.md`（启动页）
- `projects/demo-project/project_profile.md`（长期稳定事实）
- `projects/demo-project/current_snapshot.md`（最近一次核验时的状态）
- `projects/demo-project/workstreams.json`（长期工作方向）

6. 查看任务控制面，找到要继续的任务：

```bash
cat tasks/demo-project/DEMO-001.json      # 目标、范围、验收标准、上次状态
ls tasks/demo-project/runs/               # 历史执行记录
```

7. 检查目标源码仓实时 Git 状态（分支、HEAD、未提交变更），不要直接信任 snapshot。

8. 继续执行：为新一次执行创建 `run_id`，写 handoff，执行后回写 feedback 并更新 Task 状态与 snapshot。

**关键点**：设备路径只用于发现源码仓，`source_repo` 才是身份；`local_paths` 可以同时保留多台设备路径。

---

## 场景二：Agent 切换模型后恢复对话与常识

**背景**：Codex 或其他 CLI agent 切换了第三方模型 / provider。旧会话不继承，模型对项目的"常识"（技术栈、约束、当前进度、上次结论）全部丢失。

**前提**：context-bridge 仓库是唯一事实源，`projects/` 与 `tasks/` 已提交。

**步骤**

1. 新模型的第一条指令就指向仓库，而不是回忆：

```text
读取 docs/index.md 和 projects/README.md，然后按 projects/demo-project/README.md
恢复 demo-project 的上下文，并报告当前任务状态。
```

2. 读取启动页 `projects/demo-project/README.md`，它包含：项目定位、开发约束、关键记忆、最近核验时间。

3. 读取两类事实，不要混用：

- `project_profile.md` → 长期稳定事实（身份、架构、约束），几乎不变
- `current_snapshot.md` → 最近一次核验时的状态（带日期，不保证最新）

4. 读取任务与执行历史：

- `projects/demo-project/workstreams.json` → 长期工作方向
- `tasks/demo-project/DEMO-001.json` → 当前任务主记录（目标、验收标准、上次状态、artifacts）
- `tasks/demo-project/runs/DEMO-001-run-002.json` → 上次执行结果与失败原因

5. 读取最新 `handoffs/` 与 `feedback/`，理解"上次交接了什么、执行了什么"。

6. 检查目标源码仓实时 Git 状态，核验 snapshot。

7. 恢复完成，继续工作：可以接着上次 Run 修正（同一 Task 新 Run），也可以推进新任务。

**关键点**：聊天记录不会跨模型继承，但仓库文件会。`current_snapshot.md` 是带日期的快照，行动前必须用实时 Git 核验。模型切换不改变 `task_id` / `run_id`，任务链条保持完整。

---

## 场景三：新项目接入 + 首条任务闭环

**背景**：把一个已有代码仓接入 context-bridge，并完整跑通 `handoff -> 执行 -> feedback`。

**步骤**

1. 初始化项目远程记忆（自动创建 registry、启动页、profile、snapshot、workstreams、任务目录）：

```bash
./scripts/context-bridge.sh project init \
  --project-id demo-project \
  --source-repo ssh://git@example.com/demo-project.git \
  --name "Demo Project" \
  --description "示例项目：验证 context-bridge 接入流程" \
  --local-path /path/to/demo-project
```

2. 人工补齐 `project_profile.md`（架构、约束、关键入口）与 `current_snapshot.md`（当前目标、进度）。

3. 确认 `workstreams.json` 的主 Workstream（默认 `demo-project:daily-development`，是任务容器，不直接执行）。

4. 创建一张 Task（默认进入 `captured`，继承 Workstream 的类型/风险/审核默认值）：

```bash
./scripts/context-bridge.sh task init \
  --project-id demo-project \
  --task-id DEMO-001 \
  --title "修复健康检查接口的回归测试" \
  --objective "补充健康检查接口成功与失败路径测试，保持现有行为不变" \
  --type maintenance \
  --acceptance "成功路径测试通过" \
  --acceptance "原有测试通过"
```

5. 补 `scope.include` / `scope.exclude` 后，把 Task 迁移到 `ready`：

```bash
./scripts/context-bridge.sh task transition \
  --project-id demo-project \
  --task-id DEMO-001 \
  --status ready
```

6. 写 handoff 冻结输入（`projects/demo-project/handoffs/`），按 [`skills/context-bridge/SKILL.md`](../skills/context-bridge/SKILL.md) 执行。

7. 写 feedback 回执（`projects/demo-project/feedback/`），把 Task 置为 `in_review`（需要审核时不要直接标 `done`），验收通过后再迁移到 `done`：

```bash
./scripts/context-bridge.sh task transition \
  --project-id demo-project \
  --task-id DEMO-001 \
  --status in_review
```

8. 更新 `current_snapshot.md`，同步项目级 `docs/index.md`。

**关键点**：Task 默认 `captured`，只有 `ready` 才能被调度；Run 成功 ≠ Task 完成，需要审核的任务必须停在 `in_review`。

---

## 场景四：跨 Agent 任务交接（规划 → 执行）

**背景**：`chatgpt-web`（规划 agent）拆解出任务，交给 `then-codex-cli`（本地执行 agent）落地；执行 agent 换人后任务链条依然完整。

**步骤**

1. 规划 agent 创建 Task 并写 handoff，显式标注 `from` / `to` / `task_id` / `run_id`：

```json
{
  "task_id": "DEMO-001",
  "project_id": "demo-project",
  "workstream_id": "demo-project:daily-development",
  "run_id": "DEMO-001-run-001",
  "source_repo": "ssh://git@example.com/demo-project.git",
  "from": "chatgpt-web",
  "to": "then-codex-cli",
  "goal": "补充健康检查接口的回归测试",
  "constraints": ["不修改生产部署", "不改动接口行为"],
  "deliverables": ["测试代码", "feedback 回执"],
  "acceptance_criteria": ["成功路径测试通过", "原有测试通过"],
  "risk_level": "low",
  "requires_review": true
}
```

2. 执行 agent 从仓库读取任务（不依赖聊天转述），执行时记录唯一 `run_id`，把结果写回 `feedback/` 和 Task artifacts。

3. 规划 agent 读取 feedback，决定下一步：

- 目标未变、需要修正 → 同一 Task 新 Run（`DEMO-001-run-002`）
- 目标变化或范围扩大 → 创建后续 Task / 子 Task

4. 换执行 agent（例如换成 `claude-code`）时，新 agent 按场景二恢复上下文，用同一 `task_id` 继续，任务链条不中断。

**关键点**：跨 agent 协作必须显式落库（handoff / feedback / Task），`task_id` + `run_id` 是关联主键；不要在聊天里路由任务。

---

## 更多场景

- 长期项目无人值守：用 `tasks/loops/` 配置受控 Loop（默认 `draft`，人工启用），见 [`../tasks/README.md`](../tasks/README.md) 与 [`loop.schema.json`](../schemas/loop.schema.json)。
- 委派其他 Agent 完善项目任务体系：用 [`how-to-adapt-project-task-system.md`](./how-to-adapt-project-task-system.md) 里的可复制提示词。
