# 协会官网协作规范

## 分支

项目采用轻量 Git Flow：

- `main`：可发布代码，只接受 Pull Request。
- `develop`：集成分支，合并已完成且通过检查的功能。
- `feature/<ticket>-<slug>`：功能开发分支，从 `develop` 创建。
- `release/<version>`：发布候选分支，只做修复和发布准备。
- `hotfix/<ticket>-<slug>`：线上紧急修复，从 `main` 创建，完成后同时合并回 `main` 和 `develop`。

首个 MVP 之前若 `develop` 尚未建立，先从 `main` 创建；之后所有功能分支统一从 `develop` 创建。

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

1. 关联一个 `.scratch/computer-association-site/issues/` ticket。
2. 运行项目提供的最小验证命令，并在 PR 中记录结果。
3. 检查公开内容是否经过脱敏，图片是否有来源和替代文本。
4. 至少一名协会成员审阅后再合并。

合并策略使用 squash merge，保持 `main` 和 `develop` 历史可读。

## 代码与内容约定

- 先复用现有模块和原生能力，再引入依赖。
- 公开内容统一使用 `Activity`、`Achievement`、`Article`、`Person`、`Link` 领域词汇。
- 飞书是内容源，不是线上运行时 CMS；令牌、内部文档和未审核内容不得进入前端或构建产物。
- 页面结构使用语义 HTML；图片必须提供有意义的 `alt`，交互必须支持键盘和可见焦点。
- 代码、文档、提交信息默认使用中文；变量和 API 名称使用清晰的英文领域词汇。

## 发布分工

- 内容编辑者：从飞书整理候选内容并补齐来源。
- 开发者：实现页面、内容管道和自动检查。
- 发布负责人：确认公开范围、隐私、版权和链接后合并发布。

