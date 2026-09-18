# GitHub Issue 驱动协作流程

## 适用范围

每个可交付模块对应一个 GitHub Issue。需求、设计决策、实现、验收和关闭都围绕同一个 Issue 进行，避免任务只存在于聊天记录中。

## 生命周期

1. 从 `.scratch/computer-association-site/issues/` 的本地票据开始，确认目标、阻塞关系、验收标准和公开内容边界。
2. 在 GitHub 创建 Issue，使用仓库模板，粘贴本地票据的验收标准，并添加 `area:*`、`type:*`、`status:ready` 标签。
3. 从 `develop` 创建 `feature/<issue-number>-<slug>`；紧急线上修复从 `main` 创建 `hotfix/<issue-number>-<slug>`。
4. 开发过程中只在 Issue 或 PR 中记录关键决策；小型讨论可在“协会官网开发小队”群同步，但结论回写 Issue。
5. PR 描述必须包含 `Closes #<issue-number>`、验证命令、截图或文档链接（适用时）和风险说明。
6. 至少一名协会成员审阅，通过 CI 和内容/隐私检查后 squash merge；合并自动关闭 Issue。

## 标签约定

- `type:feature`：新能力
- `type:bug`：行为错误
- `type:content`：公开内容、素材或文案
- `type:docs`：规范、研究或运行手册
- `area:site`、`area:content`、`area:process`、`area:feishu`
- `status:ready`、`status:blocked`、`status:review`

## 分配原则

- 一个 Issue 只指定一个主负责人；需要协作时在正文列出协作者。
- 阻塞关系写在 `Blocked by`，先完成阻塞 Issue 再领取后续 Issue。
- Issue 只描述一个可验收结果；跨页面、跨系统的大需求拆为多个 Issue，并在父 Issue 中维护顺序。
- 未完成公开审核的内容 Issue 不得标记为 `status:ready`。

## 最小验收记录

关闭 Issue 前必须留下：完成内容、执行的验证命令、公开内容审核结果、关联 PR，以及未纳入本次范围的后续工作。
