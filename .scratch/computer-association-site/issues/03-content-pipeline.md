# 03: 实现公开内容筛选与构建检查

**What to build:** 内容维护者可以把候选内容放入仓库，构建流程只接受公开且满足必填字段的内容，并对缺失图片、替代文本和失效链接给出可读报告。

**Blocked by:** #3 可构建外壳；代码阶段暂停。

**Status:** blocked

主负责人：hushu1232；交叉审阅：Jasper-Liao2026。统一遵守 [开发规范](../../../docs/development/team-delivery.md)。

**GitHub Issue:** [#4](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/4)

- [ ] 草稿、未脱敏和公开内容在构建时有明确边界
- [ ] 缺失标题、摘要、来源或公开状态会被报告并阻止发布
- [ ] 内容按稳定规则排序，活动和成果可按年份或类型筛选
- [ ] 图片替代文本与站内链接检查可运行
- [ ] 构建不需要飞书运行时凭证
