#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
context-bridge 静态展示站生成器

扫描仓库中的 Markdown / HTML / JSON / 文本 / 图片，按职能分区生成纯静态站点：
    python3 site/build.py            # 生成到 site/dist/
    python3 site/build.py --serve    # 生成并本地预览

依赖：markdown（pip3 install -r site/requirements.txt）
"""

import html
import json
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

try:
    import markdown
except ImportError:
    sys.exit("缺少依赖 markdown，请先执行: pip3 install -r site/requirements.txt")

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "site" / "dist"

RENDER_EXT = {".md"}                       # 渲染为站内页面
RAW_EXT = {".html", ".json", ".txt", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".pdf"}
IGNORE_DIRS = {".git", "node_modules", "dist", "__pycache__"}

# ---------------------------------------------------------------- 展示配置
# 标题区展示的 GitHub 仓库与静态站地址（star 徽章由 shields.io 实时渲染）
GITHUB_REPO = "if-lensman/context-bridge"
SITE_URL = "https://if-lensman.github.io/context-bridge/"

# ---------------------------------------------------------------- 分区配置
# 按职能特点组织：项目记忆 / Agent 与技能 / 仓库指南与协议资源
SECTIONS = [
    {
        "id": "projects",
        "title": "项目记忆",
        "icon": "◈",
        "desc": "注册项目与文档工作区的远程记忆：定位、现状、交接与回执。",
        "kind": "projects",
        "roots": ["projects"],
    },
    {
        "id": "agents",
        "title": "Agent 与技能",
        "icon": "⚙",
        "desc": "Agent 注册信息、系统规则与可执行 skill。",
        "kind": "generic",
        "roots": ["context", "skills"],
    },
    {
        "id": "guides",
        "title": "仓库指南与协议资源",
        "icon": "☰",
        "desc": "仓库定位、架构、任务体系、接入流程与协议资源等稳定说明。",
        "kind": "generic",
        "roots": ["docs", "tasks", "scripts", "examples", "schemas", "templates"],
        "shallow_roots": {"docs": 1, "tasks": 1, "scripts": 1, "examples": 1, "schemas": 1, "templates": 1},  # 只取浅层，深层归其他分区
        "extra_files": ["README.md"],
    },
]

# ---------------------------------------------------------------- 工具函数

def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def url(p: str) -> str:
    return quote(p)


def parse_frontmatter(text: str):
    meta, body = {}, text
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            for line in text[3:end].strip().splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip().strip('"')
            body = text[end + 4:].lstrip("\n")
    return meta, body


def md_title(path: Path, meta: dict, body: str) -> str:
    if meta.get("title"):
        return meta["title"]
    m = re.search(r"^#\s+(.+)$", body, re.M)
    return m.group(1).strip() if m else path.stem


def content_href(repo_path: str) -> str:
    """repo 相对路径 -> content/ 下镜像结构的 html 路径"""
    return "content/" + repo_path[:-3] + ".html" if repo_path.endswith(".md") else "raw/" + repo_path


def depth_of(page: str) -> int:
    return page.count("/")


def rewrite_links(body: str, page_repo_path: str) -> str:
    """把 md 里的相对链接重写到站内位置：.md -> content/ 渲染页，其他 -> raw/ 镜像"""
    base_dir = os.path.dirname(page_repo_path)
    prefix = "../" * depth_of("content/" + page_repo_path)

    def resolve(target: str) -> str:
        if re.match(r"^[a-z]+://|^#|^mailto:", target):
            return target
        anchor = ""
        if "#" in target:
            target, anchor = target.split("#", 1)
            anchor = "#" + anchor
        if not target:
            return anchor
        abs_target = (ROOT / base_dir / target).resolve()
        try:
            repo_rel = abs_target.relative_to(ROOT).as_posix()
        except ValueError:
            return target + anchor
        if repo_rel.endswith(".md"):
            return prefix + url("content/" + repo_rel[:-3] + ".html") + anchor
        return prefix + url("raw/" + repo_rel) + anchor

    def repl(m):
        return m.group(1) + "(" + resolve(m.group(2)) + ")"

    return re.sub(r"(!?\[[^\]]*\])\(([^)\s]+)\)", repl, body)


MD_EXT = ["tables", "fenced_code", "sane_lists", "toc"]


def render_md(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    meta, body = parse_frontmatter(text)
    title = md_title(path, meta, body)
    body = rewrite_links(body, rel(path))
    body_html = markdown.markdown(body, extensions=MD_EXT)
    return {
        "title": title,
        "html": body_html,
        "updated": meta.get("updated", ""),
        "mtime": path.stat().st_mtime,
        "repo_path": rel(path),
    }


# ---------------------------------------------------------------- 模板

CSS = """
:root{--bg:#f6f7f9;--card:#fff;--ink:#1f2329;--sub:#6b7280;--line:#e5e7eb;--brand:#2563eb;--brand-soft:#eff4ff}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--ink);line-height:1.7}
a{color:var(--brand);text-decoration:none}
a:hover{text-decoration:underline}
nav.top{position:sticky;top:0;z-index:9;background:#fff;border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;gap:4px;flex-wrap:wrap}
nav.top .brand{font-weight:700;margin-right:20px;padding:14px 0;color:var(--ink)}
nav.top .meta{display:flex;align-items:center;gap:8px;margin-right:auto}
nav.top .badge-link{font-size:12.5px;color:var(--sub);border:1px solid var(--line);border-radius:99px;padding:3px 10px}
nav.top .badge-link:hover{color:var(--brand);border-color:var(--brand);text-decoration:none}
nav.top .stars{height:20px;vertical-align:middle}
nav.top a.tab{padding:14px 12px;color:var(--sub);border-bottom:2px solid transparent}
nav.top a.tab:hover{color:var(--ink);text-decoration:none}
nav.top a.tab.on{color:var(--brand);border-bottom-color:var(--brand);font-weight:600}
.wrap{max-width:960px;margin:0 auto;padding:32px 24px 80px}
h1.page{font-size:26px;margin:0 0 6px}
p.lead{color:var(--sub);margin:0 0 28px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px 20px;display:block;color:var(--ink)}
.card:hover{border-color:var(--brand);text-decoration:none;box-shadow:0 2px 10px rgba(37,99,235,.08)}
.card h3{margin:0 0 6px;font-size:17px}
.card p{margin:0;color:var(--sub);font-size:13.5px}
.card .meta{margin-top:10px;font-size:12px;color:#9ca3af}
.badge{display:inline-block;font-size:11.5px;padding:1px 8px;border-radius:99px;background:var(--brand-soft);color:var(--brand);margin-left:8px;vertical-align:2px}
.badge.gray{background:#f3f4f6;color:#6b7280}
.group{margin:34px 0 10px;font-size:19px;border-bottom:1px solid var(--line);padding-bottom:8px}
.group small{color:var(--sub);font-weight:400;font-size:13px;margin-left:10px}
ul.files{list-style:none;margin:0;padding:0;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}
ul.files li{display:flex;align-items:center;gap:10px;padding:10px 16px;border-top:1px solid var(--line);font-size:14.5px}
ul.files li:first-child{border-top:none}
ul.files li a{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink)}
ul.files li a:hover{color:var(--brand)}
.tag{flex:none;font-size:11px;padding:1px 7px;border-radius:4px;background:#f3f4f6;color:#6b7280}
.tag.html{background:#fff7ed;color:#c2410c}
.tag.md{background:#eff6ff;color:#1d4ed8}
.tag.json{background:#f0fdf4;color:#15803d}
.tag.att{background:#fafafa;color:#9ca3af;border:1px dashed #d1d5db}
.time{flex:none;font-size:12px;color:#9ca3af}
article{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:36px 44px;margin-top:20px}
article h1{font-size:24px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-top:0}
article h2{font-size:19px;margin-top:34px;border-bottom:1px solid #f0f0f0;padding-bottom:6px}
article h3{font-size:16px;margin-top:26px}
article img{max-width:100%}
article table{border-collapse:collapse;width:100%;font-size:14px;margin:16px 0;display:block;overflow-x:auto}
article th,article td{border:1px solid var(--line);padding:7px 12px;text-align:left}
article th{background:#f9fafb}
article code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px}
article pre{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:14px;overflow-x:auto}
article pre code{background:none;padding:0}
article blockquote{border-left:3px solid var(--brand);margin:16px 0;padding:4px 16px;color:var(--sub);background:var(--brand-soft);border-radius:0 6px 6px 0}
.crumbs{font-size:13.5px;color:var(--sub)}
.crumbs a{color:var(--sub)}
.doc-meta{font-size:12.5px;color:#9ca3af;margin-top:6px}
.empty{color:var(--sub);font-size:14px;padding:18px}
@media(max-width:640px){article{padding:22px 18px}}
"""


def page(title: str, body: str, active: str = "", prefix: str = "") -> str:
    tabs = "".join(
        f'<a class="tab{" on" if s["id"] == active else ""}" href="{prefix}sections/{s["id"]}.html">{s["icon"]} {s["title"]}</a>'
        for s in SECTIONS
    )
    meta = (
        f'<a class="badge-link" href="https://github.com/{GITHUB_REPO}" target="_blank">'
        f"github.com/{GITHUB_REPO}</a>"
        f'<img class="stars" src="https://img.shields.io/github/stars/{GITHUB_REPO}?style=flat&label=stars" '
        f'alt="GitHub stars" title="GitHub stars">'
    )
    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} · Context Bridge</title>
<style>{CSS}</style></head><body>
<nav class="top"><a class="brand" href="{prefix}index.html">Context Bridge</a><span class="meta">{meta}</span>{tabs}</nav>
<div class="wrap">{body}</div>
</body></html>"""


def file_row(name: str, href: str, kind: str, mtime: float = None, note: str = "") -> str:
    tag = {"md": "文档", "html": "报告", "json": "数据", "att": "附件"}.get(kind, kind)
    t = f'<span class="time">{datetime.fromtimestamp(mtime):%Y-%m-%d}</span>' if mtime else ""
    n = f'<span class="time">{html.escape(note)}</span>' if note else ""
    target = ' target="_blank"' if kind != "md" else ""
    return (f'<li><span class="tag {kind}">{tag}</span>'
            f'<a href="{href}"{target}>{html.escape(name)}</a>{n}{t}</li>')


# ---------------------------------------------------------------- 扫描

def scan_root(root: str, max_depth: int = None):
    """扫描一个根目录，返回 (md_files, raw_files, attachments) 的 repo 相对路径列表"""
    base = ROOT / root
    if not base.exists():
        return [], [], []
    mds, raws, atts = [], [], []
    if base.is_file():
        candidates = [base]
    else:
        candidates = sorted(base.rglob("*"))
    for p in candidates:
        if not p.is_file():
            continue
        if any(part in IGNORE_DIRS or part.startswith(".") for part in p.relative_to(ROOT).parts):
            continue
        if max_depth is not None and len(p.relative_to(base).parts) > max_depth:
            continue
        ext = p.suffix.lower()
        rp = rel(p)
        if ext in RENDER_EXT:
            mds.append(rp)
        elif ext in RAW_EXT:
            raws.append(rp)
        elif ext:
            atts.append(rp)
    return mds, raws, atts


def group_label(repo_path: str, roots) -> str:
    """文件在列表中的分组名：所属根目录 + 一级子目录"""
    parts = repo_path.split("/")
    for root in roots:
        if repo_path == root or repo_path.startswith(root.rstrip("/") + "/"):
            rest = repo_path[len(root):].lstrip("/")
            sub = rest.split("/")
            if len(sub) > 1:
                return f"{root} / {sub[0]}"
            return root
    return parts[0]


# ---------------------------------------------------------------- 页面生成

def build_content_pages(all_md):
    """渲染所有 md 到 content/，返回 {repo_path: info}"""
    infos = {}
    for rp in all_md:
        src = ROOT / rp
        try:
            info = render_md(src)
        except Exception as e:
            print(f"  ! 渲染失败 {rp}: {e}")
            continue
        infos[rp] = info
        out = DIST / "content" / (rp[:-3] + ".html")
        out.parent.mkdir(parents=True, exist_ok=True)
        crumbs = f'<div class="crumbs"><a href="{"../" * depth_of("content/" + rp)}index.html">首页</a> / {html.escape(rp)}</div>'
        meta_line = f'<div class="doc-meta">源文件：{html.escape(rp)}' + \
                    (f' · 更新：{html.escape(info["updated"])}' if info["updated"] else "") + "</div>"
        body = (crumbs + f'<article><h1>{html.escape(info["title"])}</h1>{meta_line}'
                + info["html"] + "</article>")
        prefix = "../" * depth_of("content/" + rp)
        out.write_text(page(info["title"], body, prefix=prefix), encoding="utf-8")
    return infos


def copy_raw(paths):
    for rp in paths:
        src = ROOT / rp
        dst = DIST / "raw" / rp
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def listing_html(mds, raws, atts, infos, roots, prefix=""):
    """按分组输出文件列表"""
    groups = {}
    for rp in mds:
        groups.setdefault(group_label(rp, roots), []).append(("md", rp))
    for rp in raws:
        groups.setdefault(group_label(rp, roots), []).append(("raw", rp))
    for rp in atts:
        groups.setdefault(group_label(rp, roots), []).append(("att", rp))

    out = []
    for gname in sorted(groups):
        entries = groups[gname]
        entries.sort(key=lambda e: -(infos[e[1]]["mtime"] if e[0] == "md" and e[1] in infos
                                     else (ROOT / e[1]).stat().st_mtime if (ROOT / e[1]).exists() else 0))
        out.append(f'<h2 class="group">{html.escape(gname)}<small>{len(entries)} 项</small></h2><ul class="files">')
        for kind, rp in entries:
            name = infos[rp]["title"] if kind == "md" and rp in infos else Path(rp).name
            mtime = (ROOT / rp).stat().st_mtime if (ROOT / rp).exists() else None
            if kind == "md":
                out.append(file_row(name, prefix + url(content_href(rp)), "md", mtime))
            elif kind == "raw":
                ext = Path(rp).suffix.lower().lstrip(".")
                out.append(file_row(name, prefix + url("raw/" + rp), "html" if ext == "html" else "json", mtime))
            else:
                out.append(f'<li><span class="tag att">附件</span>'
                           f'<a style="color:#9ca3af;cursor:default">{html.escape(Path(rp).name)}</a>'
                           f'<span class="time">仓库内查看</span></li>')
        out.append("</ul>")
    return "\n".join(out)


def parse_project_table():
    """从 projects/README.md 解析项目清单表"""
    text = (ROOT / "projects/README.md").read_text(encoding="utf-8")
    m = re.search(r"<!-- project-memory-index:start -->(.*?)<!-- project-memory-index:end -->", text, re.S)
    rows = {}
    if m:
        for line in m.group(1).splitlines():
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 4 and "README" in cells[1]:
                link = re.search(r"\(\./([^/)]+)/README\.md\)", cells[1])
                if link:
                    rows[link.group(1)] = {"name": cells[0], "status": cells[2], "desc": cells[3]}
    return rows


def build_projects_section(sec, infos):
    table = parse_project_table()
    pdir = ROOT / "projects"
    cards, lists = [], []
    for d in sorted(pdir.iterdir()):
        if not d.is_dir() or d.name.startswith(".") or d.name == "registry":
            continue
        mds, raws, atts = scan_root(f"projects/{d.name}")
        if not mds and not raws:
            continue
        meta = table.get(d.name, {"name": d.name, "status": "", "desc": ""})
        anchor = f"proj-{d.name}"
        status = f'<span class="badge">{html.escape(meta["status"])}</span>' if meta["status"] else ""
        cards.append(
            f'<a class="card" href="#{anchor}"><h3>{html.escape(meta["name"])}{status}</h3>'
            f'<p>{html.escape(meta["desc"])}</p>'
            f'<div class="meta">{len(mds)} 篇文档 · {len(raws)} 份报告/数据</div></a>')
        lists.append(f'<h2 class="group" id="{anchor}">{html.escape(meta["name"])}'
                     f'<small>{html.escape(meta["desc"])}</small></h2>')
        lists.append(listing_html(mds, raws, atts, infos, [f"projects/{d.name}"]))
    body = (f'<h1 class="page">{sec["icon"]} {sec["title"]}</h1><p class="lead">{sec["desc"]}</p>'
            f'<div class="grid">{"".join(cards)}</div>' + "\n".join(lists))
    (DIST / "sections" / f'{sec["id"]}.html').write_text(
        page(sec["title"], body, active=sec["id"], prefix="../"), encoding="utf-8")
    return len(cards)


def build_generic_section(sec, infos):
    all_md, all_raw, all_att = [], [], []
    shallow = sec.get("shallow_roots", {})
    for root in sec["roots"]:
        mds, raws, atts = scan_root(root, max_depth=shallow.get(root))
        all_md += mds
        all_raw += raws
        all_att += atts
    for f in sec.get("extra_files", []):
        if (ROOT / f).exists():
            all_md.append(f)
    body = (f'<h1 class="page">{sec["icon"]} {sec["title"]}</h1><p class="lead">{sec["desc"]}</p>'
            + listing_html(all_md, all_raw, all_att, infos, sec["roots"], prefix="../"))
    (DIST / "sections" / f'{sec["id"]}.html').write_text(
        page(sec["title"], body, active=sec["id"], prefix="../"), encoding="utf-8")
    return len(all_md) + len(all_raw)


def build_home(counts, infos):
    cards = []
    for sec in SECTIONS:
        cards.append(
            f'<a class="card" href="sections/{sec["id"]}.html"><h3>{sec["icon"]} {sec["title"]}</h3>'
            f'<p>{sec["desc"]}</p><div class="meta">{counts.get(sec["id"], 0)} 个条目</div></a>')
    recent = sorted(infos.values(), key=lambda i: -i["mtime"])[:8]
    rows = "".join(
        file_row(i["title"], url(content_href(i["repo_path"])), "md", i["mtime"], note=i["repo_path"])
        for i in recent)
    body = (f'<h1 class="page">Context Bridge</h1>'
            f'<p class="lead"><a href="{SITE_URL}">{SITE_URL}</a> · '
            f'context-bridge 的人类可读视图 · 生成于 {datetime.now():%Y-%m-%d %H:%M}</p>'
            f'<div class="grid">{"".join(cards)}</div>'
            f'<h2 class="group">最近更新</h2><ul class="files">{rows}</ul>')
    (DIST / "index.html").write_text(page("首页", body, prefix=""), encoding="utf-8")


# ---------------------------------------------------------------- 主流程

def collect_all_md():
    all_md = set()
    for sec in SECTIONS:
        shallow = sec.get("shallow_roots", {})
        for root in sec["roots"]:
            mds, _, _ = scan_root(root, max_depth=shallow.get(root))
            all_md.update(mds)
        for f in sec.get("extra_files", []):
            if (ROOT / f).exists():
                all_md.add(f)
    return sorted(all_md)


def collect_all_raw():
    all_raw = set()
    for sec in SECTIONS:
        shallow = sec.get("shallow_roots", {})
        for root in sec["roots"]:
            _, raws, _ = scan_root(root, max_depth=shallow.get(root))
            all_raw.update(raws)
    # content 页面引用的图片等也靠 raw 镜像，这里只复制分区内的；引用的其他文件按需补拷
    return sorted(all_raw)


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / "sections").mkdir(parents=True)

    all_md = collect_all_md()
    print(f"渲染 {len(all_md)} 篇 Markdown ...")
    infos = build_content_pages(all_md)

    all_raw = collect_all_raw()

    # 补齐 content 页面里引用到、但不在分区内的资源（图片等）
    referenced = set()
    for rp in all_md:
        try:
            text = (ROOT / rp).read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        base = os.path.dirname(rp)
        for m in re.finditer(r"!?\[[^\]]*\]\(([^)\s]+)\)", text):
            t = m.group(1).split("#")[0]
            if not t or re.match(r"^[a-z]+://", t):
                continue
            p = (ROOT / base / t).resolve()
            try:
                r = p.relative_to(ROOT).as_posix()
            except ValueError:
                continue
            if p.is_file() and p.suffix.lower() in RAW_EXT:
                referenced.add(r)
    all_raw = sorted(set(all_raw) | referenced)

    print(f"复制 {len(all_raw)} 份原始文件 ...")
    copy_raw(all_raw)

    counts = {}
    for sec in SECTIONS:
        if sec["kind"] == "projects":
            counts[sec["id"]] = build_projects_section(sec, infos)
        else:
            counts[sec["id"]] = build_generic_section(sec, infos)
    build_home(counts, infos)
    print(f"完成 -> {DIST}")


if __name__ == "__main__":
    main()
    if "--serve" in sys.argv:
        import http.server
        import functools
        port = 8642
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(DIST))
        print(f"预览: http://localhost:{port}/")
        http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
