# 飞书 CLI 接入与同步流程

本文件记录协会官网项目使用飞书 CLI 的可复用流程。凭证只保存在开发者本机的 Codex 配置中，不写入仓库。

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

先读取空间和节点结构，再读取具体文档正文。记录来源 URL、文档标题、读取日期和是否经过人工审核：

```bash
lark-cli wiki +space-list
lark-cli wiki +node-list --space-id <space_id>
lark-cli docs +fetch --doc <document_url_or_token> --doc-format markdown
```

附件、图片和表格按需单独读取；不要把整个知识库无筛选地复制到公开站点。

## 发送群消息

向开发小队同步时使用用户身份发送，内容保持“变更摘要 + 仓库/文档链接 + 下一步”：

```bash
lark-cli im +chat-search --query "协会官网开发小队"
lark-cli im +messages-send --chat-id <chat_id> --text "<摘要>\n仓库：<url>\n文档：<url>"
```

发送前确认目标群和公开范围；消息只包含公开项目资料，不转发令牌、内部成员信息或未审核原文。

## 文档同步约定

“计算机协会”文档使用固定章节：项目结论、需求表与验收基线、MVP 需求文档内联摘要、产品阶段规划、内容治理与发布流程、研究依据、代码与协作入口、协作开发规范、GitHub Issue 驱动流程、飞书 CLI 复用流程、下一步。更新时优先整体重排正文，避免无限追加造成重复。

整体重排前先保存仓库中的 Markdown 草稿，更新后用 `+fetch --scope outline` 核对标题层级和顺序；写入失败时不要重复重试，先重新读取最新 revision。需要整体替换时使用：

```bash
lark-cli docs +update --doc <document_url_or_token> --command overwrite --doc-format markdown --content @<draft.md>
```

本项目当前文档入口：

- 需求源：[计协官网建设需求](https://ecut-acm.feishu.cn/wiki/Vewnw2HINigCqHktO9Sc5wYtnpc)
- 项目文档：[协会官网项目索引](https://ecut-acm.feishu.cn/docx/AVVudBlQ4oTJTuxWS7Yc9gjFnmb)
- GitHub：[DL-Association-for-Computing-Machinery](https://github.com/DL-Association-for-Computing-Machinery)

## 故障处理

- 无权限：先确认登录身份、知识库成员资格和应用业务域权限，再请求管理员补最小只读权限。
- 读取失败：保留仓库上一版内容，记录失败原因，不让构建依赖实时飞书服务。
- 发送失败：不要循环重试；确认 `im:message.send_as_user` 已审核，并检查目标群可见性。
- 内容有隐私或版权疑点：标记为草稿，暂停发布，交由发布负责人确认。
