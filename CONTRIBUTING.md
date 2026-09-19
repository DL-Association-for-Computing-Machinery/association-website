# 协会官网协作规范

## 分支

项目采用轻量 Git Flow：

- `main`：可发布代码，只接受 Pull Request。
- `develop`：集成分支，合并已完成且通过检查的功能。
- `feature/<ticket>-<slug>`：功能开发分支，从 `develop` 创建。
- `codex/<ticket>-<slug>`：Codex 执行的任务分支；应用功能同样从 `develop` 创建并合回 `develop`。
- `release/<version>`：发布候选分支，只做修复和发布准备。
- `hotfix/<ticket>-<slug>`：线上紧急修复，从 `main` 创建，完成后同时合并回 `main` 和 `develop`。

首个 MVP 之前若 `develop` 尚未建立，先从 `main` 创建；之后所有功能分支统一从 `develop` 创建。

文档基线已先进入 `main` 而 `develop` 落后时，文档修订可从最新 `main` 创建 `codex/<ticket>-<slug>` 并提交到 `main` 的 PR，避免丢失已确认决策。应用实现开始前先同步 `main` 到 `develop`。`release/<version>` 从 `develop` 创建，验收后通过 PR 合入 `main`，为发布提交打版本标签，再将 `main` 合回 `develop`。

## 提交

提交信息使用 Conventional Commits，主题使用简体中文：

```text
<type>(<scope>): <中文主题>
```

允许的 `type`：`feat`、`fix`、`docs`、`style`、`refactor`、`test`、`build`、`ci`、`chore`。

示例：

```text
feat(home): 增加协会荣誉区块
docs(process): 记录飞书 CLI 用户授权流程
fix(content): 修复活动日期排序
```

一次提交只表达一个可回滚的意图；正文说明背景、影响和验证方式即可。

## Pull Request

PR 标题沿用提交格式。提交前必须：

1. 关联一个 GitHub Issue，读取其最新正文与原生依赖；已有 `.scratch/computer-association-site/issues/` 快照时同步维护。
2. 运行项目提供的最小验证命令，并在 PR 中记录结果。
3. 检查公开内容是否经过脱敏，图片是否有来源和替代文本。
4. 按 [执行团队开发规范](docs/development/team-delivery.md) 完成作者自检与执行层交叉审阅。代码 PR 由另一位执行成员审阅，可使用 AI 辅助；需求方不是固定审批关卡。文档与协会素材按用户授权可由 AI 自审，保留来源与结论。

合并策略使用 squash merge，保持 `main` 和 `develop` 历史可读。

既有记录显示仓库为 GitHub Free 私有仓库，分支保护尚未配置；`main` 的 PR、适用审阅和 squash merge 依靠团队约定执行。改变仓库可见性或升级方案需单独决策。

## 代码与内容约定

- 先复用现有模块和原生能力，再引入依赖。
- 公开内容统一使用 `Activity`、`Achievement`、`Article`、`Person`、`Link` 领域词汇。
- 飞书是内容源，不是线上运行时 CMS；令牌、内部文档和未审核内容不得进入前端或构建产物。
- 页面结构使用语义 HTML；图片必须提供有意义的 `alt`，交互必须支持键盘和可见焦点。
- 代码、文档、提交信息默认使用中文；变量和 API 名称使用清晰的英文领域词汇。

## 发布分工

- 七位执行成员承担内容整理、开发、自检、交叉审阅和发布，按 Issue 分配主负责人；人员与任务见 [执行团队开发规范](docs/development/team-delivery.md)。
- 需求方负责需求、产品取舍和反馈，不承担默认开发任务，也不是每次合并的必经审核人。
- 每张发布票的负责人核验内容边界、检查证据和回滚路径后执行发布。
