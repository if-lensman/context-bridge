# context-bridge

A Git-based shared context template for coordinating multiple AI agents across projects.

`context-bridge` is not trying to be a giant memory brain. Its job is simpler and more practical:

- reduce repeated explanation
- make task handoff explicit
- keep project context aligned across web AI, local coding agents, and other automation

---

## What this template focuses on

This repository captures a lightweight but usable model for multi-agent collaboration:

- **repository-first execution**: tasks must be written to the repo before execution
- **repo-based project identity**: same Git repository = same project
- **project context split**:
  - `project_profile` = long-lived facts
  - `current_snapshot` = current working state
- **handoff / feedback loop**: task flow is explicit and traceable
- **cross-agent collaboration**: agents can hand work to other agents, including across projects

---

## Core concepts

### 1. Project identity

Project identity is resolved by `source_repo` first.

That means:

- same Git repo => same project
- similar names do **not** imply same project
- task paths / feedback paths do **not** define identity

### 2. Project lifecycle

A project usually moves through three stages:

- **registered**: has a registry entry
- **initialized**: has profile / snapshot / directories
- **activated**: has at least one real handoff -> feedback cycle

### 3. Context split

#### `project_profile.md`
Use for:
- architecture
- stable constraints
- core entrypoints
- long-lived project facts

Do **not** use for:
- today's progress
- temporary blockers
- next-step notes

#### `current_snapshot.md`
Use for:
- current goal
- current progress
- current blockers / risks
- next step
- active working surface

Do **not** use for:
- broad architecture explanation
- durable background that rarely changes

### 4. Task routing

- project agents default to their own project tasks
- any suitable agent may execute **global/system** tasks
- local agents may hand off tasks to other local agents
- cross-project collaboration is allowed, but must still go through handoff / feedback

---

## Suggested structure

```text
context/
  projects/
    <project-id>/
      project_profile.md
      current_snapshot.md
      handoffs/
      feedback/
  agents/
    registry/
    bindings/
  system/
    rules.md
    project-identity.md
    agent-routing.md
```

---

## Minimal operating rules

1. tasks must be written as handoff files
2. execution results must be written as feedback files
3. changing state belongs in snapshot, not profile
4. stable identity belongs to source_repo, not naming guesswork
5. cross-agent work must stay explicit and traceable

---

## Best fit

This template is useful when you have workflows like:

- ChatGPT or other web AI plans the work
- a local coding agent executes the work
- another local agent provides support from a related project
- the project evolves over time and needs durable context

---

## Start here

Read these docs next:

- `docs/quickstart.md`
- `docs/project-model.md`
- `docs/agent-routing.md`
- `docs/onboarding.md`

---

## Design goal

The goal of `context-bridge` is not to replace every memory system.

Its goal is to make agent collaboration:

- explicit
- traceable
- reusable
- less fragile
