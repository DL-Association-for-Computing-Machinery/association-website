# 06: 建立发布与飞书同步运行手册

**What to build:** 团队可以按照仓库规范创建功能分支、提交 PR、构建和发布官网，并能把公开项目进展同步到“计算机协会”飞书文档和“协会官网开发小队”群。

**Blocked by:** 05: 完成可访问性与发布前检查

**上线前置条件：** 部署平台、域名或预览入口及必要权限已经确定并验证。当前 Cloudflare 仅为候选，未创建项目，不把账号开通写为已完成。

**Status:** blocked

**GitHub Issue:** [#7](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/7)

- [ ] `main`、`develop`、feature、release、hotfix 分支约定可执行
- [ ] CI 或等价检查能在 PR 中运行构建与发布前检查
- [x] 飞书 CLI 授权、读取、文档更新和群消息流程有可复用说明；发消息需要用户明确授权
- [ ] 同步失败时保留上一版静态内容并记录原因
- [ ] 完成一次预发布 smoke test，并记录发布入口和回滚方式
