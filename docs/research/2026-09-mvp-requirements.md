# MVP 实现需求文档读取记录

来源：[【计协官网】MVP实现需求文档](https://ecut-acm.feishu.cn/wiki/F7hTwQsF4iYPxZkHAv3c5yw8nMg?fromScene=spaceOverview)

- Wiki 节点：`F7hTwQsF4iYPxZkHAv3c5yw8nMg`
- 文档 token：`VjfFdRnMEo3AF3xHk4PcknPfnue`
- 读取身份：飞书用户身份
- 读取时间：2026-09-18

## 结论

- 文档把前端、后端、测试和运维列为技术调研方向，并链接了独立的前端、后端调研页面。
- 竞品分析覆盖 TUNA、上海交大思源极客协会和上海科技大学 GeekPie，当前建议优先参考 GeekPie 的落地页和服务边界思路。
- 文档中的 OIDC、OAuth2.0、SSO、多租户和微服务属于竞品架构观察，不能直接视为官网 MVP 的实现要求。
- 当前 MVP 仍收敛为公开落地页和内容模块；登录、SSO、后台、OJ、实时榜单和复杂微服务保留在后续阶段。

## 旧站选型决策

参考知识库中的[官网技术架构文档](https://ecut-acm.feishu.cn/wiki/Y7LXwSPvoiIPIHkIdfXcYt0MnKc?fromScene=spaceOverview)和 GeekPie 公开仓库后，协会官网 MVP 采用其主站层思路：Next.js + React + TypeScript、Tailwind CSS、Markdown/MDX 内容和静态发布作为候选基线；Cloudflare 作为部署候选。14+ 子服务、认证、SSO、OJ、ECPC 和微服务集群仍然后置。

## 对项目索引的处理

该文档已作为“第三、MVP 需求文档内联摘要”写入[协会官网项目索引](https://ecut-acm.feishu.cn/docx/AVVudBlQ4oTJTuxWS7Yc9gjFnmb)，保留原始文档链接、调研入口和竞品链接。图片与飞书引用块继续以原始需求页为准，避免复制后失去来源关系。
