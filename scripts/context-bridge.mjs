#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDir, "..");

function fail(message) {
  console.error(`错误：${message}`);
  process.exit(1);
}

function printHelp() {
  console.log(`context-bridge 初始化工具

用法：
  ./scripts/context-bridge.sh project init [选项]
  ./scripts/context-bridge.sh handover init [选项]
  ./scripts/context-bridge.sh task init [选项]
  ./scripts/context-bridge.sh task transition [选项]

项目远程记忆：
  --project-id <id>       项目标识，只允许小写字母、数字、点、下划线和短横线
  --source-repo <url>     源码仓地址，作为项目身份锚点
  --name <name>           项目显示名称，默认使用 project-id
  --description <text>    项目说明
  --summary <text>        projects/README.md 中的一句话说明
  --status <text>         项目索引状态，默认“已初始化”
  --agent <id>            参与 agent，可多次传入
  --local-path <path>     当前设备上的源码仓绝对路径
  --platform <platform>   macos、linux 或 windows；默认自动识别
  --config <file>         从 JSON 配置读取 project 字段；命令行参数优先

设备或 agent 交接文档：
  --agent-id <id>         agent 标识
  --title <text>          文档标题
  --output <path>         输出路径，默认 docs/handover/<agent-id>-handover.md
  --config <file>         从 JSON 配置读取 handover 字段；命令行参数优先
  --force                 覆盖已经存在的交接文档

任务控制面：
  --task-id <id>          任务标识，只允许字母、数字、点、下划线和短横线
  --project-id <id>       已注册项目标识
  --workstream-id <id>    长期任务流，默认使用项目 primary_workstream_id
  --title <text>          任务标题
  --objective <text>      可验证的单一任务目标
  --acceptance <text>     验收标准，可多次传入
  --type <type>           feature、bug、maintenance、research、documentation、operations、review、custom
  --status <status>       init 默认 captured；transition 时为目标状态
  --priority <priority>   urgent、high、medium、low、none
  --risk-level <level>    low、medium、high、critical
  --reason <text>         进入 blocked/cancelled 等状态时的原因

通用选项：
  --repo-root <path>      指定 context-bridge 根目录
  --dry-run               只显示将执行的操作
  -h, --help              显示帮助
`);
}

function parseOptions(tokens) {
  const options = { agents: [], acceptances: [] };
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "-h" || token === "--help") {
      options.help = true;
      continue;
    }
    if (!token.startsWith("--")) fail(`未知参数：${token}`);
    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (key === "force" || key === "dryRun") {
      options[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) fail(`${token} 缺少参数值`);
    index += 1;
    if (key === "agent") options.agents.push(value);
    else if (key === "acceptance") options.acceptances.push(value);
    else options[key] = value;
  }
  return options;
}

function readConfig(configPath, repoRoot) {
  if (!configPath) return {};
  const absolutePath = path.resolve(repoRoot, configPath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    fail(`无法读取配置 ${absolutePath}：${error.message}`);
  }
}

function detectPlatform() {
  if (process.platform === "darwin") return "macos";
  if (process.platform === "win32") return "windows";
  return "linux";
}

function normalizePlatform(value) {
  const platform = value || detectPlatform();
  if (!["macos", "linux", "windows"].includes(platform)) {
    fail(`不支持的平台：${platform}`);
  }
  return platform;
}

function today() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function now() {
  return new Date().toISOString();
}

function markdownCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function atomicWrite(filePath, content, dryRun, actions, verb = "更新") {
  actions.push(`${verb} ${path.relative(process.cwd(), filePath) || filePath}`);
  if (dryRun) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.tmp`,
  );
  fs.writeFileSync(temporaryPath, content, "utf8");
  fs.renameSync(temporaryPath, filePath);
}

function writeIfMissing(filePath, content, dryRun, actions) {
  if (fs.existsSync(filePath)) {
    actions.push(`保留 ${path.relative(process.cwd(), filePath) || filePath}`);
    return;
  }
  atomicWrite(filePath, content, dryRun, actions, "创建");
}

function projectReadme({ projectId, name, sourceRepo, description, localPaths, createdAt }) {
  const pathRows = Object.entries(localPaths)
    .map(([platform, localPath]) => `| ${platform} 本地路径 | \`${localPath}\` |`)
    .join("\n");
  return `# ${name} — 项目远程记忆

## 记忆状态

| 项 | 值 |
|---|---|
| 初始化日期 | ${createdAt} |
| 接入状态 | 已注册到 \`context-bridge\` |
| 稳定事实源 | \`projects/${projectId}/project_profile.md\` |
| 当前状态源 | \`projects/${projectId}/current_snapshot.md\` + 目标仓库实时 Git |

## 基本信息

| 项 | 值 |
|---|---|
| project_id | \`${projectId}\` |
| source_repo | \`${sourceRepo}\` |
${pathRows || "| 本地路径 | 待补 |"}

## 项目定位

${description || "待补：用一句话说明项目解决什么问题。"}

## 当前工作状态

- 先检查目标仓库实时 Git 状态。
- 当前进度记录在 \`current_snapshot.md\`。

## 关键入口文件

- 待补。

## 开发约束

- 进入源码仓后，优先读取目标仓库自己的 \`AGENTS.md\`、\`CLAUDE.md\` 或同类规则。
- 本地路径只用于发现项目，项目身份以 \`source_repo\` 为准。

## 关键记忆

- 待补。

## 新设备接入步骤

1. clone \`context-bridge\` 并读取 \`projects/README.md\`。
2. 读取本文件、\`project_profile.md\` 和 \`current_snapshot.md\`。
3. clone 或定位源码仓，并核对 Git remote 是否为 \`${sourceRepo}\`。
4. 把新设备路径追加到 registry 的 \`local_paths\`，不要覆盖其他设备路径。
`;
}

function projectProfile({ projectId, name, sourceRepo, description }) {
  return `# Project Profile

## Identity

- project_id: \`${projectId}\`
- name: ${name}
- source_repo: \`${sourceRepo}\`

## Purpose

${description || "待补：项目长期定位和业务边界。"}

## Stable Facts

- 待补。

## Architecture

- 待补。

## Stable Constraints

- 本文件只记录长期稳定事实，不记录短期进度。

## Key Entrypoints

- 待补。
`;
}

function currentSnapshot(projectId, createdAt) {
  return `# Current Snapshot

## 项目

- project_id: \`${projectId}\`
- 初始化日期: ${createdAt}

## 当前目标

- 待补。

## 当前进度

- 已完成：远程记忆结构初始化。
- 进行中：核验目标仓库实时状态。

## 最近变更

- 创建项目启动页、注册信息和任务目录。

## 当前阻塞

- 无。

## 下一步

- 检查目标仓库 Git 状态并更新本文件。
`;
}

function projectWorkstreams(projectId, createdAt) {
  return `${JSON.stringify(
    {
      project_id: projectId,
      primary_workstream_id: `${projectId}:daily-development`,
      workstreams: [
        {
          workstream_id: `${projectId}:daily-development`,
          name: "日常迭代",
          type: "development",
          status: "active",
          purpose: "承载项目持续发生的功能开发、缺陷修复和工程治理任务；Workstream 本身不直接交给 Agent 执行。",
          task_defaults: {
            type: "feature",
            priority: "medium",
            risk_level: "medium",
            requires_review: true,
          },
        },
      ],
      updated_at: createdAt,
    },
    null,
    2,
  )}\n`;
}

function projectDocsIndex(projectId) {
  return `# ${projectId} Docs Index

项目级稳定说明索引。新增或更新 \`docs/\` 中的说明时，同步维护本文件。

| 文档 | 说明 | 状态 |
|---|---|---|
| [README.md](./README.md) | 项目级文档放置规则 | active |
`;
}

function projectDocsReadme(projectId) {
  return `# ${projectId} 项目文档

本目录存放项目级稳定说明。

- 稳定事实优先写入 \`../project_profile.md\`。
- 当前进度写入 \`../current_snapshot.md\`。
- 临时分析和过程材料写入 \`../task-docs/\`。
- 新增文档后同步更新 [index.md](./index.md)。
`;
}

function projectTasksReadme(projectId) {
  return `# ${projectId} Tasks

本目录保存 ${projectId} 的阶段性 Task 和 Run。默认 Workstream：\`${projectId}:daily-development\`。
`;
}

function folderReadme(title, description) {
  return `# ${title}

${description}
`;
}

function ensureProjectIndex(repoRoot, project, dryRun, actions) {
  const indexPath = path.join(repoRoot, "projects", "README.md");
  const link = `./${project.projectId}/README.md`;
  const row = `| ${markdownCell(project.name)} | [README.md](${link}) | ${markdownCell(project.status)} | ${markdownCell(project.summary)} |`;

  if (!fs.existsSync(indexPath)) {
    const content = `# 项目远程记忆

<!-- project-memory-index:start -->
| 项目 | 启动入口 | 状态 | 说明 |
|---|---|---|---|
${row}
<!-- project-memory-index:end -->
`;
    atomicWrite(indexPath, content, dryRun, actions, "创建");
    return;
  }

  const current = fs.readFileSync(indexPath, "utf8");
  if (current.includes(`](${link})`)) {
    actions.push(`保留 ${path.relative(process.cwd(), indexPath)} 中的项目索引`);
    return;
  }

  const marker = "<!-- project-memory-index:end -->";
  if (!current.includes(marker)) {
    fail(`${indexPath} 缺少 ${marker}，无法安全更新项目索引`);
  }
  const updated = current.replace(marker, `${row}\n${marker}`);
  atomicWrite(indexPath, updated, dryRun, actions);
}

function initProject(options) {
  const repoRoot = path.resolve(options.repoRoot || defaultRepoRoot);
  const config = readConfig(options.config, repoRoot).project || {};
  const projectId = options.projectId || config.project_id;
  const sourceRepo = options.sourceRepo || config.source_repo;
  if (!projectId) fail("project init 需要 --project-id");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectId)) {
    fail(`project-id 格式不正确：${projectId}`);
  }
  if (!sourceRepo) fail("project init 需要 --source-repo");

  const name = options.name || config.name || projectId;
  const description = options.description ?? config.description ?? "";
  const summary =
    options.summary ?? config.summary ?? (description || "项目远程记忆");
  const status = options.status || config.status || "已初始化";
  const platform = normalizePlatform(options.platform || config.active_platform);
  const localPaths = { ...(config.local_paths || {}) };
  if (options.localPath) localPaths[platform] = path.resolve(options.localPath);
  const currentPlatformPath = options.localPath
    ? path.resolve(options.localPath)
    : config.local_paths?.[platform];
  const agents = [...new Set([...(config.agents || []), ...options.agents])];
  const createdAt = today();
  const projectDir = path.join(repoRoot, "projects", projectId);
  const registryPath = path.join(repoRoot, "projects", "registry", `${projectId}.json`);
  const actions = [];

  const templateData = {
    projectId,
    name,
    sourceRepo,
    description,
    localPaths,
    createdAt,
  };

  writeIfMissing(
    path.join(projectDir, "README.md"),
    projectReadme(templateData),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "project_profile.md"),
    projectProfile(templateData),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "current_snapshot.md"),
    currentSnapshot(projectId, createdAt),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "workstreams.json"),
    projectWorkstreams(projectId, createdAt),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "docs", "README.md"),
    projectDocsReadme(projectId),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "docs", "index.md"),
    projectDocsIndex(projectId),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "handoffs", "README.md"),
    folderReadme("Handoffs", "注册项目的任务输入放在这里。"),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "feedback", "README.md"),
    folderReadme("Feedback", "注册项目的任务执行回执放在这里。"),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(projectDir, "task-docs", "README.md"),
    folderReadme("Task Docs", "临时分析、过程材料和任务附件放在这里。"),
    options.dryRun,
    actions,
  );
  writeIfMissing(
    path.join(repoRoot, "tasks", projectId, "README.md"),
    projectTasksReadme(projectId),
    options.dryRun,
    actions,
  );

  let registry = {};
  const registryExists = fs.existsSync(registryPath);
  if (registryExists) {
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    } catch (error) {
      fail(`注册表不是有效 JSON：${registryPath}：${error.message}`);
    }
    if (registry.project_id && registry.project_id !== projectId) {
      fail(`注册表 project_id 冲突：${registry.project_id}`);
    }
    if (registry.source_repo && registry.source_repo !== sourceRepo) {
      fail(`source_repo 冲突：已有 ${registry.source_repo}，传入 ${sourceRepo}`);
    }
  }

  const incomingLocalPaths =
    registryExists && currentPlatformPath
      ? { [platform]: currentPlatformPath }
      : registryExists
        ? {}
        : localPaths;
  const updatedRegistry = {
    ...registry,
    project_id: projectId,
    name: registry.name || name,
    description: registry.description || description,
    agents: [...new Set([...(registry.agents || []), ...agents])],
    related_projects: registry.related_projects || [],
    entry_points: {
      ...(registry.entry_points || {}),
      memory: `projects/${projectId}/README.md`,
      profile: `projects/${projectId}/project_profile.md`,
      snapshot: `projects/${projectId}/current_snapshot.md`,
      workstreams: `projects/${projectId}/workstreams.json`,
      tasks: `tasks/${projectId}/`,
    },
    source_repo: sourceRepo,
    local_paths: {
      ...(registry.local_paths || {}),
      ...incomingLocalPaths,
    },
    created_at: registry.created_at || createdAt,
  };
  const registryContent = `${JSON.stringify(updatedRegistry, null, 2)}\n`;
  const currentRegistry = fs.existsSync(registryPath)
    ? fs.readFileSync(registryPath, "utf8")
    : null;
  if (currentRegistry === registryContent) {
    actions.push(`保留 ${path.relative(process.cwd(), registryPath)}`);
  } else {
    atomicWrite(
      registryPath,
      registryContent,
      options.dryRun,
      actions,
      currentRegistry === null ? "创建" : "更新",
    );
  }

  ensureProjectIndex(
    repoRoot,
    { projectId, name, status, summary },
    options.dryRun,
    actions,
  );

  console.log(actions.join("\n"));
  console.log(
    options.dryRun
      ? `预演完成：projects/${projectId}/`
      : `初始化完成：projects/${projectId}/README.md`,
  );
}

const taskStatuses = new Set([
  "captured",
  "backlog",
  "ready",
  "queued",
  "in_progress",
  "in_review",
  "done",
  "blocked",
  "cancelled",
]);
const taskInitialStatuses = new Set(["captured", "backlog"]);

const taskTypes = new Set([
  "feature",
  "bug",
  "maintenance",
  "research",
  "documentation",
  "operations",
  "review",
  "custom",
]);

const taskPriorities = new Set(["urgent", "high", "medium", "low", "none"]);
const taskRiskLevels = new Set(["low", "medium", "high", "critical"]);

const taskTransitions = {
  captured: new Set(["backlog", "cancelled"]),
  backlog: new Set(["ready", "cancelled"]),
  ready: new Set(["queued", "backlog", "blocked", "cancelled"]),
  queued: new Set(["in_progress", "ready", "blocked", "cancelled"]),
  in_progress: new Set(["in_review", "blocked", "cancelled"]),
  in_review: new Set(["done", "ready", "in_progress", "blocked", "cancelled"]),
  blocked: new Set(["backlog", "ready", "cancelled"]),
  done: new Set(["ready"]),
  cancelled: new Set([]),
};

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`无法读取${label} ${filePath}：${error.message}`);
  }
}

function validateTaskIdentity(projectId, taskId) {
  if (!projectId) fail("task 操作需要 --project-id");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectId)) {
    fail(`project-id 格式不正确：${projectId}`);
  }
  if (!taskId) fail("task 操作需要 --task-id");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(taskId)) {
    fail(`task-id 格式不正确：${taskId}`);
  }
}

function taskPath(repoRoot, projectId, taskId) {
  return path.join(repoRoot, "tasks", projectId, `${taskId}.json`);
}

function initTask(options) {
  const repoRoot = path.resolve(options.repoRoot || defaultRepoRoot);
  const { projectId, taskId } = options;
  validateTaskIdentity(projectId, taskId);
  if (!options.title) fail("task init 需要 --title");
  if (!options.objective) fail("task init 需要 --objective");
  if (options.acceptances.length === 0) {
    fail("task init 至少需要一个 --acceptance");
  }

  const registryPath = path.join(repoRoot, "projects", "registry", `${projectId}.json`);
  if (!fs.existsSync(registryPath)) fail(`项目尚未注册：${projectId}`);

  const workstreamsPath = path.join(repoRoot, "projects", projectId, "workstreams.json");
  if (!fs.existsSync(workstreamsPath)) {
    fail(`项目缺少 workstreams.json：${projectId}`);
  }
  const workstreamConfig = readJson(workstreamsPath, "Workstream 配置");
  const workstreamId = options.workstreamId || workstreamConfig.primary_workstream_id;
  const workstream = workstreamConfig.workstreams?.find(
    (candidate) => candidate.workstream_id === workstreamId,
  );
  if (!workstream) fail(`Workstream 不存在：${workstreamId}`);

  const status = options.status || "captured";
  if (!taskStatuses.has(status)) fail(`任务状态不正确：${status}`);
  if (!taskInitialStatuses.has(status)) {
    fail(`task init 只允许 captured 或 backlog，收到：${status}`);
  }
  const type = options.type || workstream.task_defaults?.type || "feature";
  const priority = options.priority || workstream.task_defaults?.priority || "medium";
  const riskLevel = options.riskLevel || workstream.task_defaults?.risk_level || "medium";
  if (!taskTypes.has(type)) fail(`任务类型不正确：${type}`);
  if (!taskPriorities.has(priority)) fail(`任务优先级不正确：${priority}`);
  if (!taskRiskLevels.has(riskLevel)) fail(`任务风险等级不正确：${riskLevel}`);
  const requiresReview = workstream.task_defaults?.requires_review ?? true;
  const timestamp = now();
  const destination = taskPath(repoRoot, projectId, taskId);
  if (fs.existsSync(destination)) fail(`任务已经存在：${destination}`);

  const task = {
    schema_version: "1.0",
    task_id: taskId,
    project_id: projectId,
    workstream_id: workstreamId,
    parent_task_id: null,
    title: options.title,
    type,
    status,
    priority,
    risk_level: riskLevel,
    objective: options.objective,
    background: [],
    scope: { include: [], exclude: [] },
    acceptance_criteria: options.acceptances,
    source: { type: "manual", ref: null, deduplication_key: null },
    assignee: { type: "unassigned", id: null },
    dependencies: [],
    blocked_reason: null,
    cancellation_reason: null,
    requires_review: requiresReview,
    automation_policy: {
      auto_dispatch: false,
      max_runs: 3,
      timeout_minutes: 120,
      on_failure: "return_to_ready",
      on_no_review: "stay_in_review",
      cost_budget: null,
    },
    artifacts: {
      handoff: null,
      feedback: null,
      branch: null,
      commits: [],
      pull_request: null,
      documents: [],
    },
    runs: [],
    created_at: timestamp,
    updated_at: timestamp,
    completed_at: status === "done" ? timestamp : null,
  };
  const actions = [];
  atomicWrite(destination, `${JSON.stringify(task, null, 2)}\n`, options.dryRun, actions, "创建");
  console.log(actions.join("\n"));
  console.log(options.dryRun ? `预演完成：${taskId}` : `任务已创建：${taskId}`);
}

function transitionTask(options) {
  const repoRoot = path.resolve(options.repoRoot || defaultRepoRoot);
  const { projectId, taskId, status } = options;
  validateTaskIdentity(projectId, taskId);
  if (!status || !taskStatuses.has(status)) {
    fail(`task transition 需要有效的 --status，收到：${status || "(空)"}`);
  }
  const source = taskPath(repoRoot, projectId, taskId);
  if (!fs.existsSync(source)) fail(`任务不存在：${source}`);
  const task = readJson(source, "任务");
  const currentStatus = task.status;
  if (!taskStatuses.has(currentStatus)) fail(`任务当前状态不正确：${currentStatus}`);
  if (currentStatus === status) {
    console.log(`任务状态未变化：${taskId} 仍为 ${status}`);
    return;
  }
  if (!taskTransitions[currentStatus].has(status)) {
    fail(`不允许的状态迁移：${currentStatus} -> ${status}`);
  }
  if ((status === "blocked" || status === "cancelled") && !options.reason) {
    fail(`进入 ${status} 需要 --reason`);
  }
  if (status === "ready") {
    if (!Array.isArray(task.acceptance_criteria) || task.acceptance_criteria.length === 0) {
      fail("进入 ready 前必须填写 acceptance_criteria");
    }
    if (!Array.isArray(task.scope?.include) || task.scope.include.length === 0) {
      fail("进入 ready 前必须填写 scope.include");
    }
  }
  const timestamp = now();
  task.status = status;
  task.updated_at = timestamp;
  task.blocked_reason = status === "blocked" ? options.reason : null;
  task.cancellation_reason = status === "cancelled" ? options.reason : null;
  task.completed_at = status === "done" ? timestamp : null;

  const actions = [];
  atomicWrite(source, `${JSON.stringify(task, null, 2)}\n`, options.dryRun, actions);
  console.log(actions.join("\n"));
  console.log(
    options.dryRun
      ? `预演完成：${taskId} ${currentStatus} -> ${status}`
      : `任务状态已更新：${taskId} ${currentStatus} -> ${status}`,
  );
}

function handoverTemplate({ agentId, title, createdAt }) {
  return `# ${title}

> 用于在新设备或新会话中恢复 ${agentId} 的工作方式。本文档只保存可移植事实，不保存 token、Cookie、认证数据库或缓存。

## 这是什么

- agent_id: \`${agentId}\`
- 初始化日期: ${createdAt}
- 项目远程记忆入口: \`projects/README.md\`

## 给新设备的首条指令

> 请先读取 \`AGENTS.md\`、本交接文档、\`projects/README.md\` 和目标项目的 \`projects/<project-id>/README.md\`。先检查 Git 状态，再恢复配置；不要仅依赖旧聊天记录，也不要擅自提交或推送。

## 可移植设定

- 待补：语言、称呼、模型偏好和工作规则。

## 新设备前置条件

- clone 本仓库。
- 安装 ${agentId}。
- 重新完成需要的账号登录和授权。

## 恢复步骤

1. 读取仓库根 \`AGENTS.md\`。
2. 读取本交接文档。
3. 读取 \`projects/README.md\` 和目标项目启动页。
4. 恢复可移植配置。
5. 检查目标项目源码仓的实时 Git 状态。

## 仅保留在本机的状态

- token、Cookie、认证文件。
- 缓存、日志、会话数据库。
- 其他包含秘密或隐私的数据。

## 验证清单

- [ ] agent 可以正常启动
- [ ] 必要账号已重新授权
- [ ] 可以读取项目远程记忆
- [ ] 当前设备项目路径已追加到 registry，且没有覆盖其他设备路径
- [ ] 目标仓库 Git remote 与 registry 的 \`source_repo\` 一致

## 维护规则

- 稳定、可移植的信息写入本文件。
- 项目事实写入 \`projects/<project-id>/\`。
- 本机认证和缓存不进入 Git。
`;
}

function ensureHandoverIndex(
  repoRoot,
  { agentId, title, outputPath },
  dryRun,
  actions,
) {
  const handoverDir = path.join(repoRoot, "docs", "handover");
  const indexPath = path.join(handoverDir, "README.md");
  const relativeTarget = path
    .relative(handoverDir, outputPath)
    .split(path.sep)
    .join("/");
  const link = relativeTarget.startsWith(".")
    ? relativeTarget
    : `./${relativeTarget}`;
  const row = `| ${markdownCell(agentId)} | [${markdownCell(title)}](${link}) | ${today()} |`;

  if (!fs.existsSync(indexPath)) {
    const content = `# Agent 与设备交接

本目录保存跨设备、跨会话恢复 agent 所需的可移植说明。

<!-- handover-index:start -->
| agent | 交接文档 | 初始化日期 |
|---|---|---|
${row}
<!-- handover-index:end -->
`;
    atomicWrite(indexPath, content, dryRun, actions, "创建");
    return;
  }

  const current = fs.readFileSync(indexPath, "utf8");
  if (current.includes(`](${link})`)) {
    actions.push(`保留 ${path.relative(process.cwd(), indexPath)} 中的交接索引`);
    return;
  }
  const marker = "<!-- handover-index:end -->";
  if (!current.includes(marker)) {
    fail(`${indexPath} 缺少 ${marker}，无法安全更新交接索引`);
  }
  atomicWrite(
    indexPath,
    current.replace(marker, `${row}\n${marker}`),
    dryRun,
    actions,
  );
}

function initHandover(options) {
  const repoRoot = path.resolve(options.repoRoot || defaultRepoRoot);
  const config = readConfig(options.config, repoRoot).handover || {};
  const agentId = options.agentId || config.agent_id;
  if (!agentId) fail("handover init 需要 --agent-id");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(agentId)) {
    fail(`agent-id 格式不正确：${agentId}`);
  }
  const title = options.title || config.title || `${agentId} 交接文档`;
  const output = options.output || config.output || `docs/handover/${agentId}-handover.md`;
  const outputPath = path.resolve(repoRoot, output);
  if (!outputPath.startsWith(`${repoRoot}${path.sep}`)) {
    fail("交接文档输出路径必须位于仓库内");
  }
  if (fs.existsSync(outputPath) && !options.force) {
    fail(`${output} 已存在；默认不会覆盖。确认需要重建时使用 --force`);
  }

  const actions = [];
  atomicWrite(
    outputPath,
    handoverTemplate({ agentId, title, createdAt: today() }),
    options.dryRun,
    actions,
    fs.existsSync(outputPath) ? "覆盖" : "创建",
  );
  ensureHandoverIndex(
    repoRoot,
    { agentId, title, outputPath },
    options.dryRun,
    actions,
  );
  console.log(actions.join("\n"));
  console.log(options.dryRun ? `预演完成：${output}` : `初始化完成：${output}`);
}

const rawArguments = process.argv.slice(2);
if (
  rawArguments.length === 0 ||
  rawArguments[0] === "-h" ||
  rawArguments[0] === "--help"
) {
  printHelp();
  process.exit(0);
}

const [command, action, ...tokens] = rawArguments;
const options = parseOptions(tokens);
if (options.help) {
  printHelp();
  process.exit(0);
}
if (command === "project" && action === "init") initProject(options);
else if (command === "handover" && action === "init") initHandover(options);
else if (command === "task" && action === "init") initTask(options);
else if (command === "task" && action === "transition") transitionTask(options);
else fail(`未知命令：${command}`);
