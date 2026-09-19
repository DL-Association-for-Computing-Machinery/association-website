# Issue tracker: GitHub Issues + local tickets

GitHub Issues 是团队分配、评论和跟踪状态的公开协作入口；ask-matt 生成的本地 Markdown 票据是进入开发前的规格快照，保留依赖关系和验收标准。

- Spec：`.scratch/<feature-slug>/spec.md`
- Tickets：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- 状态：本地票据顶部使用 `Status:`；GitHub Issue 使用标签和项目状态同步
- 开发前：先完成本地票据审阅，再创建或补充对应 GitHub Issue
- 实现中：分支名和 PR 必须包含 Issue 编号；完整满足验收后关闭 Issue，部分交付保持开放。合入 develop 后确认是否需要显式关闭
- 分工与依赖：GitHub 最新正文、Assignee 和原生关系为准；任务表见 `docs/development/issue-assignment-plan.md`，已有本地票据保持同步；新票可直接发布到 GitHub
- 远程仓库：[DL-Association-for-Computing-Machinery/association-website](https://github.com/DL-Association-for-Computing-Machinery/association-website)
