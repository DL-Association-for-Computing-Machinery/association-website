# 基于 GeekPie 旧站的架构选型评估

这份记录把上海科技大学 GeekPie 旧站作为协会官网的参考实现，区分公开证据、合理推断和暂不采用项。它是本项目的选型输入，不是照抄外部站点的实现清单。

## 公开证据（2026-09-19）

- GeekPie 官网公开呈现活动与博客、协会介绍、成果/方向、联系方式、RSS 和 ICS 活动日历，说明“宣传内容 + 活动订阅 + 公开成果”可以由一个主站承载。[官网](https://www.geekpie.club/)
- 官方 GitHub 仓库 `ShanghaitechGeekPie/GeekPie_Homepage` 明确标注为 Next.js 项目，仓库包含 `app/`、`next.config.ts`、`tsconfig.json`、`pnpm-lock.yaml` 和 `wrangler.toml`。[仓库](https://github.com/ShanghaitechGeekPie/GeekPie_Homepage)
- 其 `package.json` 明确记录 Next.js 16、React 19、TypeScript、`next dev --turbopack`、Tailwind CSS、Radix UI、MDX/Markdown 解析链、`next-themes` 和动画/交互依赖。[package.json](https://github.com/ShanghaitechGeekPie/GeekPie_Homepage/blob/main/package.json)
- `wrangler.toml` 说明仓库保留 Cloudflare Wrangler 配置；这能证明 Cloudflare 是该仓库的部署候选/工具链之一，但单凭仓库文件不能证明所有服务都由 Cloudflare 托管。[wrangler.toml](https://github.com/ShanghaitechGeekPie/GeekPie_Homepage/blob/main/wrangler.toml)
- GeekPie GitHub 组织公开列出主站、文章集合和多个服务仓库；官网页脚也把认证、状态页和其他服务作为独立入口展示。[组织](https://github.com/ShanghaitechGeekPie/)、[官网服务入口](https://www.geekpie.club/)

## 合理推断与未知项

- **高置信推断**：主站采用 Next.js/React/TypeScript 作为页面框架，Markdown/MDX 作为内容输入，静态或混合渲染作为主要交付方式。依据是公开仓库配置和内容依赖；具体每个页面的渲染模式仍应以源码为准。
- **中置信推断**：主站与认证、状态页、OJ/课程等服务按域名和仓库边界拆分。这种边界能从官网公开链接和组织仓库观察到，但不能仅凭前端页面证明完整的内部网络拓扑。
- **未知**：生产环境是否启用完整 Cloudflare CDN/WAF、微服务数量、数据库、认证协议、缓存规则和监控告警配置，不能从公开页面可靠确定；这些内容只作为待核验记录，不作为本项目的现成事实。

## 对协会官网的采用决策

### 直接采用的主站基线

1. **Next.js + React + TypeScript**：适合协会官网的多页面内容、可访问性和团队协作；用 App Router 和静态生成承载首页、活动、成果、文章与加入页面。
2. **Tailwind CSS**：采用设计令牌和组件约束统一视觉，不把 Radix、动画库或完整组件库作为 MVP 必选依赖。
3. **Markdown/MDX 内容源**：仓库内容经过飞书来源记录、脱敏和人工审核后构建；先使用最小解析链，只有确有需求再增加复杂插件。
4. **pnpm + TypeScript 检查 + 静态构建**：作为统一本地开发和 CI 基线，版本写入仓库后再开始实现。
5. **Cloudflare Pages/Workers 作为部署候选**：先验证静态产物、域名、缓存和回滚，再决定是否绑定；保持部署平台可替换。

### 暂不复制的架构

- 14+ 子服务、泛解析、统一认证、OIDC/OAuth2.0、SSO、多租户和微服务集群不进入官网 MVP。
- 状态页、独立日历 API、动态后台和用户系统只有在对应 GitHub Issue 明确验收标准、数据责任和运维负责人后才进入后续阶段。
- GeekPie 的完整依赖列表不作为协会官网依赖清单；每个依赖必须由页面需求、可访问性或构建验证证明必要性。

## 对当前项目的结论

旧站选型适合我们，但应采用“主站技术基线”而不是整套平台架构：**Next.js + TypeScript + Tailwind + Markdown/MDX + 静态发布**可以进入 MVP 选型候选；Cloudflare 作为部署候选；身份、OJ、ECPC 和微服务保持后置。最终版本在 GitHub 技术决策 Issue 中以最小页面构建、移动端、键盘可达性、内容构建和回滚验证结果确认。

关联决策：[MVP 技术决策与部署边界](https://ecut-acm.feishu.cn/docx/JRNfdDBPmolzBLxwtpDcDw9in6f)。
