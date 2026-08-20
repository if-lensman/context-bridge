---
title: 仓库展示站
type: guide
topics:
  - static-site
status: stable
updated: 2026-08-19
---

# 仓库展示站

把 `context-bridge` 里给人看的文档生成一个纯静态站点，发布后点链接即可阅读，无需数据库、无需后端。

## 分区（按职能）

| 分区 | 内容来源 | 说明 |
|------|----------|------|
| 项目记忆 | `projects/` | 各项目的 README、profile、snapshot、handoff/feedback |
| Agent 与技能 | `context/`、`skills/` | Agent 注册信息、系统规则与可执行 skill |
| 仓库指南与协议资源 | `docs/`、`tasks/`、`scripts/`、`examples/`、`schemas/`、`templates/` | 仓库定位、架构、任务体系、接入流程与协议资源 |

渲染规则：

- `.md` → 渲染为站内页面（`content/`），相对链接自动重写
- `.html` / `.json` / 图片 / `.pdf` → 原样收录（`raw/`），新窗口打开
- `.xlsx` / `.docx` / `.zip` 等附件不复制，列表中标注"仓库内查看"

## 使用

```bash
pip3 install -r site/requirements.txt   # 首次
python3 site/build.py                   # 生成到 site/dist/
python3 site/build.py --serve           # 生成并本地预览 http://localhost:8642/
```

文档有更新后重新跑一次 `build.py` 即可（全量重建，秒级完成）。

## 发布

`site/dist/` 是纯静态目录，整体上传到任意静态托管即可：

- **GitHub Pages**：本项目已配置自动构建，push 到 `main` 后自动发布到 <https://if-lensman.github.io/context-bridge/>（workflow：`.github/workflows/pages.yml`）
- **EdgeOne Pages / Vercel / Netlify**：新建静态站点项目，构建命令留空，发布目录指向 `site/dist`
- **内网/本机**：`cd site/dist && python3 -m http.server 8642`

注意：仓库里大量中文路径已做 URL 编码，托管平台需支持 UTF-8 文件名（主流平台都支持）。

## 维护

- 新增文档工作区或调整分区归属时，编辑 `build.py` 顶部的 `SECTIONS` 配置
- `site/dist/` 是生成产物，不入库（已在 `.gitignore`）
