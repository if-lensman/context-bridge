import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "context-bridge.mjs");

function createFixture(t) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "context-bridge-test-"));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  fs.mkdirSync(path.join(repoRoot, "projects", "registry"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, "projects", "demo"), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, "projects", "registry", "demo.json"),
    `${JSON.stringify({ project_id: "demo", source_repo: "https://example.com/demo.git" }, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(repoRoot, "projects", "demo", "workstreams.json"),
    `${JSON.stringify(
      {
        project_id: "demo",
        primary_workstream_id: "demo:daily-development",
        workstreams: [
          {
            workstream_id: "demo:daily-development",
            name: "日常迭代",
            type: "development",
            status: "active",
            purpose: "test",
            task_defaults: {
              type: "maintenance",
              priority: "medium",
              risk_level: "low",
              requires_review: true,
            },
          },
        ],
        updated_at: "2026-08-04",
      },
      null,
      2,
    )}\n`,
  );
  return repoRoot;
}

function runCli(repoRoot, ...args) {
  return spawnSync(process.execPath, [scriptPath, ...args, "--repo-root", repoRoot], {
    encoding: "utf8",
  });
}

test("project init creates the default workstream and task entry point", (t) => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "context-bridge-project-test-"));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const result = runCli(
    repoRoot,
    "project",
    "init",
    "--project-id",
    "new-project",
    "--source-repo",
    "https://example.com/new-project.git",
  );

  assert.equal(result.status, 0, result.stderr);
  const workstreams = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "projects", "new-project", "workstreams.json"), "utf8"),
  );
  const registry = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "projects", "registry", "new-project.json"), "utf8"),
  );
  assert.equal(workstreams.primary_workstream_id, "new-project:daily-development");
  assert.equal(registry.entry_points.workstreams, "projects/new-project/workstreams.json");
  assert.equal(registry.entry_points.tasks, "tasks/new-project/");
  assert.ok(fs.existsSync(path.join(repoRoot, "tasks", "new-project", "README.md")));
});

test("task init creates a captured task with workstream defaults", (t) => {
  const repoRoot = createFixture(t);
  const result = runCli(
    repoRoot,
    "task",
    "init",
    "--project-id",
    "demo",
    "--task-id",
    "DEMO-001",
    "--title",
    "测试任务",
    "--objective",
    "验证任务初始化",
    "--acceptance",
    "任务文件创建成功",
  );

  assert.equal(result.status, 0, result.stderr);
  const task = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "tasks", "demo", "DEMO-001.json"), "utf8"),
  );
  assert.equal(task.status, "captured");
  assert.equal(task.workstream_id, "demo:daily-development");
  assert.equal(task.type, "maintenance");
  assert.equal(task.risk_level, "low");
});

test("task transition enforces readiness and lifecycle rules", (t) => {
  const repoRoot = createFixture(t);
  assert.equal(
    runCli(
      repoRoot,
      "task",
      "init",
      "--project-id",
      "demo",
      "--task-id",
      "DEMO-002",
      "--title",
      "迁移测试",
      "--objective",
      "验证状态迁移",
      "--acceptance",
      "合法路径完成",
    ).status,
    0,
  );

  assert.equal(
    runCli(repoRoot, "task", "transition", "--project-id", "demo", "--task-id", "DEMO-002", "--status", "backlog").status,
    0,
  );
  const prematureReady = runCli(
    repoRoot,
    "task",
    "transition",
    "--project-id",
    "demo",
    "--task-id",
    "DEMO-002",
    "--status",
    "ready",
  );
  assert.notEqual(prematureReady.status, 0);
  assert.match(prematureReady.stderr, /scope\.include/);

  const taskFile = path.join(repoRoot, "tasks", "demo", "DEMO-002.json");
  const task = JSON.parse(fs.readFileSync(taskFile, "utf8"));
  task.scope.include.push("scripts/");
  fs.writeFileSync(taskFile, `${JSON.stringify(task, null, 2)}\n`);

  for (const status of ["ready", "queued", "in_progress", "in_review", "done"]) {
    const transition = runCli(
      repoRoot,
      "task",
      "transition",
      "--project-id",
      "demo",
      "--task-id",
      "DEMO-002",
      "--status",
      status,
    );
    assert.equal(transition.status, 0, transition.stderr);
  }

  const illegal = runCli(
    repoRoot,
    "task",
    "transition",
    "--project-id",
    "demo",
    "--task-id",
    "DEMO-002",
    "--status",
    "blocked",
    "--reason",
    "test",
  );
  assert.notEqual(illegal.status, 0);
  assert.match(illegal.stderr, /不允许的状态迁移/);
});
