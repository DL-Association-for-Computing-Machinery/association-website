# 仓库基建检查清单

这份清单用于新成员加入和每轮开发开始前检查，当前只覆盖协作基建，不包含网站代码实现。

## 已完成

- [x] GitHub 组织和官网仓库已建立。
- [x] `main`、`develop` 和 feature 分支约定已写入协作规范。
- [x] Conventional Commits、PR 模板和 Issue 模板已启用。
- [x] `type:*`、`area:*`、`status:*` 标签已创建。
- [x] MVP 六个本地票据已创建为 GitHub Issues #2–#7，并记录阻塞关系。
- [x] 飞书 CLI 用户身份、知识库读取、文档整体重排和群消息同步流程已记录。

## 每个 Issue 开始前

1. 阅读 `CONTEXT.md`、对应 spec、ADR 和本地票据。
2. 打开对应 GitHub Issue，确认主负责人、验收标准和阻塞 Issue 已完成。
3. 从 `develop` 创建 `feature/<issue-number>-<slug>`，不要直接在 `main` 开发。
4. 在 Issue 中记录影响范围、内容公开审核人和需要同步的飞书文档。

## 每个 PR 合并前

- [ ] PR 标题符合 Conventional Commits，并包含 `Closes #<issue-number>`。
- [ ] 验证命令、截图或文档链接已写入 PR。
- [ ] 公开内容完成脱敏、版权、来源和替代文本检查。
- [ ] 至少一名协会成员完成审阅。
- [ ] 未把令牌、内部文档、个人联系方式或未审核图片放进提交和构建产物。

## 当前平台限制

GitHub Free 私有仓库不提供受保护分支规则；当前依靠 PR 约定和成员审阅执行 `main` 保护。若团队规模扩大或需要强制检查，再升级 GitHub 方案或调整仓库可见性后配置分支保护和必需状态检查。
