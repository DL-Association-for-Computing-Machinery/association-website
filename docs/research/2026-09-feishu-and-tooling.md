# 计算机协会官网：飞书知识库与工具调研

## 结论

飞书知识库适合承担协会内部内容源，但首版不应把它直接作为线上实时数据库。公开内容需要经过筛选、脱敏和发布审核后再进入官网。

飞书官方知识库 API 支持按知识空间和节点管理内容；应用需要申请知识库读取/管理权限，并获得知识库管理员或节点协作者授权。遍历内容时可使用[空间列表](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list)、[子节点列表](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/list)和[节点信息](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/get_node)，再根据 `obj_token` 与 `obj_type` 读取真实文档。可参考：[飞书 API 知识库概述](https://feishu.apifox.cn/doc-436777)、[飞书 API 常见问题](https://feishu.apifox.cn/doc-436779)。

飞书官方案例说明，可以通过文档、知识库和云盘的只读权限读取并导出知识库内容，再转换成 Markdown 用于静态站点；这条路径适合后续做受控同步：[Feishu Pages：将飞书知识库导出为公开帮助中心文档](https://www.feishu.cn/content/7293415563448238084)。官方导出链路是创建异步导出任务、查询 ticket、下载文件；导出产物短期有效，因此适合构建阶段同步，不适合访客请求时实时导出：[创建导出任务](https://open.feishu.cn/document/server-docs/docs/drive-v1/export_task/create)、[查询导出任务](https://open.feishu.cn/document/server-docs/docs/drive-v1/export_task/get)、[下载导出文件](https://open.feishu.cn/document/server-docs/docs/drive-v1/export_task/download)。

用户提供的协会知识库链接在通用抓取器中不可访问，可能需要登录或组织权限；微信公众号文章同样无法稳定抓取，当前不能据此确认文章内容。文章价值应在拿到标题、正文或可访问副本后再判断，不阻塞首版 spec。

## 工具与技能建议

- `grill-with-docs`：已用于建立 `CONTEXT.md` 和 ADR，适合继续澄清协会定位、内容边界和发布责任。
- `to-spec`：当前阶段使用，产出本文件旁的项目 spec。
- `to-tickets`：spec 稳定后拆成阻塞关系清晰的 tracer-bullet 票据。
- `frontend-design`：实现官网视觉与响应式页面。
- `accessibility`：按 WCAG 2.2 AA 做语义结构、键盘操作、对比度和替代文本。
- `research`：继续核查飞书 API、学校公开信息和内容迁移策略。
- `tdd`、`code-review`：实现每个行为切片并进行标准/规格双轴复核。
- `sites-building` / `sites-hosting`：只有选择 Codex Sites 作为部署平台时才启用。

当前推荐插件列表中没有专用飞书连接器。首版使用静态内容；后续如需自动同步，优先写一个最小的飞书 API 导出脚本或接入组织批准的 MCP，并把凭证保留在服务端/CI，禁止放入前端。
