# Loops

本目录保存任务收集与调度 Loop 的声明式配置。

Loop 必须从 `draft` 开始，人工核对数据源、去重策略、权限、风险上限、失败路径和无人审核降级方案后，才能切换为 `active`。

配置格式见：

- `schemas/loop.schema.json`
- `templates/loop.template.json`

不要把 token、Webhook 密钥、Cookie 或账号认证写进 Loop 文件；只记录秘密引用或本机配置入口。
