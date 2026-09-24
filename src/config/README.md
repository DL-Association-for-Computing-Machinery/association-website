# config

站点配置的**单一来源**。凡是有可能变动、且被多处使用的值都放这里，
不要在页面或组件里硬编码。

## 文件

| 文件       | 说明                      |
| ---------- | ------------------------- |
| `site.ts`  | 站点常量与 URL 工具       |
| `index.ts` | 统一出口，只做 `export *` |

导入一律走 `@/config`：

```ts
import { SITE_NAME, SITE_DESCRIPTION, hasSiteUrl } from "@/config";
```

## site.ts 导出项

**名称与文案**

| 导出                           | 用途                                           |
| ------------------------------ | ---------------------------------------------- |
| `SITE_NAME`                    | 正式名称，用于标题与结构化数据                 |
| `SITE_FULL_NAME`               | 全称，用于需要完整表述的位置                   |
| `SITE_SHORT_NAME`              | 简称「计协ECUT」                               |
| `SITE_DESCRIPTION`             | meta description 与分享卡片                    |
| `SITE_LOCALE`                  | 站点语言，`zh-CN`                              |
| `SITE_WECHAT_OFFICIAL_ACCOUNT` | 微信公众号名；无已核验报名入口时不生成报名链接 |

**URL 相关（当前均为空字符串）**

| 导出                | 状态                                                     |
| ------------------- | -------------------------------------------------------- |
| `SITE_URL`          | 站点规范地址，待域名确定                                 |
| `MEDIA_BASE_URL`    | 媒体 CDN 域名（阿里云 OSS + CDN），待确定                |
| `hasSiteUrl()`      | 是否已配置站点地址                                       |
| `hasMediaBaseUrl()` | 是否已配置媒体域名                                       |
| `mediaUrl(path)`    | 拼接媒体绝对地址；**未配置时直接抛错**，不静默产出坏 URL |

## 约定

- **域名为当前唯一阻塞项**（见 `docs/LXW/seo.md`）。确定后只改本目录这一处，
  不要散落到页面里。
- `SITE_URL` / `MEDIA_BASE_URL` 保持空字符串时调用方走相对路径，
  从而不会拼出指向错误主机的绝对 URL。
- `mediaUrl()` 故意设计成「未配置就抛错」而不是返回相对路径兜底：
  静默兜底会产出在生产环境 404 的地址，比直接失败更难排查。调用方应先
  `hasMediaBaseUrl()` 判断。
- 需要绝对 URL 的逻辑先判断 `hasSiteUrl()`，域名就绪前跳过。
