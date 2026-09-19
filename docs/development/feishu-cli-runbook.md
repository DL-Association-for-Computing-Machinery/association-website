# 飞书 CLI 接入与同步流程

本文件记录协会官网项目使用飞书 CLI 的可复用流程。凭证由本机 CLI 的凭证存储管理，不写入仓库，也不假定其保存在 Codex 配置文件中。

## 适用场景

- 读取“计算机协会”知识库，寻找活动、成果和历史材料。
- 在“协会官网开发小队”群同步开发文档链接和变更摘要。
- 将审核后的项目索引同步到“计算机协会”飞书文档。

首版官网仍采用仓库内静态内容；飞书不作为线上请求依赖。

## 初始化与身份

使用用户身份而非机器人身份读取个人可见知识库或发送群消息：

```bash
lark-cli auth status
lark-cli auth login --user
lark-cli auth status
```

需要补授权时，使用对应业务域最小权限重新授权；不要把 access token、二维码或配置备份提交到 Git。

验证当前身份：

```bash
lark-cli user get-current
```

## 读取知识库

先读取空间和节点结构，再读取具体文档正文。记录来源 URL、文档标题、读取日期、提取范围和初审结论：

```bash
lark-cli wiki +space-list --as user
lark-cli wiki +node-list --space-id <space_id> --as user
lark-cli docs +fetch --doc <document_url_or_token> --doc-format markdown --as user
```

附件、图片和表格按需单独读取；保存完整 JSON 响应，以保留图片与附件的引用信息。用户已授权 AI 自行提取和复用协会素材；按内容规范完成自审，疑点条目暂缓采用，其余继续。原始导出不直接成为公开站点目录。

## 发送群消息

向开发小队同步时使用用户身份发送，内容保持“变更摘要 + 仓库/文档链接 + 下一步”：

```bash
lark-cli im +chat-search --query "协会官网开发小队"
lark-cli im +messages-send --chat-id <chat_id> --text "<摘要>\n仓库：<url>\n文档：<url>"
```

仅在用户已明确授权发送通知时执行；读取/更新文档授权不自动等于发群消息授权。消息只包含项目变更和链接。

## 文档同步约定

项目索引使用既有章节结构。先读取当前全文或目标章节，优先行内替换或局部块更新，保留表格、图片、评论和引用；同一结论在原章节更新，避免重复追加。

写入前把当前完整 JSON 响应保存在 Git 忽略的本地备份目录；写入后重新读取变更范围核验内容和资源。失败时先读取最新 revision，不重复盲写。局部替换示例：

```bash
lark-cli docs +update --doc <document_url_or_token> --command str_replace --pattern '<旧文本>' --content '<新文本>' --as user
```

本项目当前文档入口：

- 需求源：[计协官网建设需求](https://ecut-acm.feishu.cn/wiki/Vewnw2HINigCqHktO9Sc5wYtnpc)
- 项目文档：[协会官网项目索引](https://ecut-acm.feishu.cn/docx/AVVudBlQ4oTJTuxWS7Yc9gjFnmb)，已迁移到“计算机协会官网”知识库的“MVP需求文档”根节点下
- GitHub：[DL-Association-for-Computing-Machinery](https://github.com/DL-Association-for-Computing-Machinery)

## 故障处理

- 无权限：先确认登录身份、知识库成员资格和应用业务域权限，再请求管理员补最小只读权限。
- 读取失败：保留仓库上一版内容，记录失败原因，不让构建依赖实时飞书服务。
- 发送失败：不要循环重试；确认 `im:message.send_as_user` 已审核，并检查目标群可见性。
- 内容事实或第三方权属有疑点：交叉核验后仍不明确则标记“暂缓采用”，不阻塞其他内容 Issue 或 PR。
- 2026-09-19：Drive 全文搜索缺少 `search:docs:read`，本轮未扩大授权；已通过现有 Wiki 节点读取和附件下载完成素材采集。不能把已读范围称为全库检索完成。
