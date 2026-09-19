# GitHub Issue 驱动协作流程

## 适用范围

每个可交付模块对应一个 GitHub Issue。需求、设计决策、实现、验收和关闭都围绕同一个 Issue 进行，避免任务只存在于聊天记录中。

## 生命周期

1. 从 `.scratch/computer-association-site/issues/` 的本地票据开始，确认目标、阻塞关系、验收标准和公开内容边界。
2. 在 GitHub 创建 Issue，使用仓库模板，粘贴本地票据的验收标准，并添加 `area:*`、`type:*`、`status:ready` 标签。
3. 确认代码阶段获准并解除前置阻塞，从 `develop` 创建 `feature/<issue-number>-<slug>`（Codex 使用 `codex/<issue-number>-<slug>`）；紧急线上修复从 `main` 创建 `hotfix/<issue-number>-<slug>`。
4. 开发过程中只在 Issue 或 PR 中记录关键决策；小型讨论可在“协会官网开发小队”群同步，但结论回写 Issue。
5. PR 描述必须包含 `Closes #<issue-number>`、验证命令、截图或文档链接（适用时）和风险说明。
6. 按 [执行团队开发规范](team-delivery.md) 完成作者自检、AI 双轴审查与执行层交叉审阅；需求方不是逐 PR 审批关卡。文档与协会素材可由 AI 自审留痕。适用检查通过后 squash merge；只有完整满足 Issue 验收时才关闭，合入 develop 后核验是否需显式关闭。

## 标签约定

- `type:feature`：新能力
- `type:bug`：行为错误
- `type:content`：公开内容、素材或文案
- `type:docs`：规范、研究或运行手册
- `area:site`、`area:content`、`area:process`、`area:feishu`
- `status:ready`、`status:blocked`、`status:review`

## 分配原则

- 一个 Issue 只指定一个主负责人；需要协作时在正文列出协作者。
- 阻塞关系同时维护 `Blocked by` 与 GitHub 原生依赖；父子关系用于聚合，不代替阻塞边。最新分工见 [分工表](issue-assignment-plan.md)。
- Issue 只描述一个可验收结果；跨页面、跨系统的大需求拆为多个 Issue，并在父 Issue 中维护顺序。
- 无前置阻塞且内容齐备的 Issue 可标记为 `status:ready`；验收所需证据不齐时标记为 `status:blocked` 并记录具体缺口。个别暂缓素材不阻塞无关任务，不以假数据解除阻塞。

## 最小验收记录

关闭 Issue 前必须留下：完成内容、执行的验证命令、公开内容审核结果、关联 PR，以及未纳入本次范围的后续工作。

## ask-matt 执行路径

已有上下文与 ADR → `to-spec` 固化规格 → `to-tickets` 声明阻塞边 → 无代码内容与设计准备 → 用户允许代码后按前置依赖执行 `implement`，内部使用 TDD 与 code-review。设计准备使用 Impeccable shape，当前完成标准是素材包、来源记录、设计简报与真实的未完成清单，不把设计文档当成已实现页面。新执行者先读 `CONTEXT.md`。
