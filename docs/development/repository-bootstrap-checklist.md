# 仓库基建检查清单

这份清单用于新成员加入和每轮开发开始前检查，当前只覆盖协作基建，不包含网站代码实现。

## 已完成

- [x] GitHub 组织和官网仓库已建立。
- [x] `main`、`develop` 和 feature 分支约定已写入协作规范。
- [x] Conventional Commits、PR 模板和 Issue 模板已启用。
- [x] `type:*`、`area:*`、`status:*` 标签已创建。
- [x] MVP 六个本地票据已创建为 GitHub Issues #2–#7，并记录阻塞关系。
- [x] 飞书 CLI 用户身份、知识库读取、文档局部更新和群消息同步流程已记录。
- [x] 用户授权的 AI 素材自审规则、首批素材包、产品上下文和无代码设计简报已落档。
- [x] #3←#2、#4←#2、#5←#3/#4、#6←#5、#7←#6 已建立并回读核验 GitHub 原生阻塞关系。

2026-09-19 静态核验：34 份 Markdown 相对链接无悬空；两项精选媒体可解码、尺寸与 SHA-256 符合登记且无 EXIF；主文字颜色组合对比度达到 4.5:1；原始导出被 Git 忽略。该结果不替代网站构建、页面预览或完整可访问性测试。

同日同步核验：飞书[内容规范](https://ecut-acm.feishu.cn/docx/SZFcd5W2SoWLrexhEuhctFh2ntd)、[阶段规划索引](https://ecut-acm.feishu.cn/docx/AVVudBlQ4oTJTuxWS7Yc9gjFnmb)和[根目录索引](https://ecut-acm.feishu.cn/docx/X0NCdv0BmoN5QGxqCbPcBPn8nwc)均已局部更新并回读，保留既有表格与引用。本轮未发送群消息。独立只读文档复核发现一处审核主体歧义，已将 Spec 的逐条审核改为查看 AI 自审记录。

[页面验收](https://ecut-acm.feishu.cn/docx/DfyTdNQ7Yo1qe1xTwRCcnWYenNB)和[发布检查](https://ecut-acm.feishu.cn/docx/TXzndiSDbo01pXxQH0Hcujtzn7m)也已同步手机布局、自审主体与无代码执行边界，共五份飞书文档回读通过。

## 尚未完成

- [ ] 四项全国性竞赛成绩证据齐备，目前仅两条具体记录可引用，见素材包。
- [ ] 网站应用、构建命令、内容检查和 CI 已实现；本轮按要求不写代码。
- [ ] 预发布平台、域名/预览地址与部署权限已实测可用。
- [ ] `main` 最新文档基线已同步到 `develop`，供实现分支使用。

## 每个 Issue 开始前

1. 阅读 `CONTEXT.md`、对应 spec、ADR 和本地票据。
2. 打开对应 GitHub Issue，确认主负责人、验收标准和阻塞 Issue 已完成。
3. 从 `develop` 创建 `feature/<issue-number>-<slug>`，不要直接在 `main` 开发。
4. 在 Issue 中记录影响范围、审核主体与结论、需要同步的飞书文档。

## 每个 PR 合并前

- [ ] PR 标题符合 Conventional Commits；正文仅在完整交付时使用 `Closes #<issue-number>`，部分交付使用 `Refs #<issue-number>`。
- [ ] 验证命令、截图或文档链接已写入 PR。
- [ ] 公开内容完成脱敏、版权、来源和替代文本检查。
- [ ] 代码变更完成成员审阅；文档和素材完成有证据的 AI 自审。
- [ ] 未把令牌、内部文档、个人联系方式或未审核图片放进提交和构建产物。

## 当前平台限制

GitHub Free 私有仓库不提供受保护分支规则；当前依靠 PR 约定和成员审阅执行 `main` 保护。若团队规模扩大或需要强制检查，再升级 GitHub 方案或调整仓库可见性后配置分支保护和必需状态检查。
