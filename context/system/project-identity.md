# 项目身份规则

本规则只适用于有独立源码仓、需要进入 `projects/` 的注册项目。

个人文档工作区、设备交接和个人 skills 不要求创建 `project_id` 或 `source_repo`。

## 核心规则

同一个 Git 仓库 = 同一个项目。

## 身份优先级

解析项目身份时，优先级如下：

1. `source_repo`（主身份）
2. `project_id`（次级）
3. `name`（仅作兼容回退）

不要使用：

- task 路径
- feedback 路径
- 目录猜测

## 含义

如果两次 onboarding 使用的是同一个仓库：

- 必须复用已有 `project_id`
- 不允许新建项目

即使：

- `ProjectName` 不同
- 目录不同

## 必填字段

所有项目都应该包含：

- `source_repo`
- `project_id`

## 系统要求

onboarding 脚本必须：

- 先按 `source_repo` 搜索已有 registry
- 找到后复用 `project_id`
- 只有找不到仓库时才创建新项目

## 为什么这样做

为了避免：

- 重复项目
- 上下文分裂
- 任务路由不一致

从而保证：

- 身份稳定
- 上下文演进一致
