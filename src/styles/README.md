# styles

非组件级样式与设计令牌。

## 文件

| 文件                 | 说明                                   |
| -------------------- | -------------------------------------- |
| `prototype-home.css` | 首页全部视觉规则与设计令牌（源自原型） |

## globals.css 不在这里

全局样式入口是 `src/app/globals.css`（Next.js 约定：在 `layout.tsx` 里导入）。
它只做两件事：

```css
@import "tailwindcss";
@import "../styles/prototype-home.css";
```

**不要把 `globals.css` 移进本目录。** 它是入口而不是令牌文件；设计令牌放这里，
由 `app/globals.css` 用相对路径引入（已验证会进入构建产物）。

## prototype-home.css 是唯一的设计令牌来源

该文件自带一套完整令牌（`--page` / `--text` / `--heading` / `--brand-*` 等），
配色沿用官方 Logo 的青色、深蓝、橙色、金色与珊瑚红。

**注意历史坑**：此前 `globals.css` 里同时存在 React 试作版的样式，
类名（`.hero`、`.site-header`、`.skip-link` 等）与原型的同名但取值不同，
两套 `:root` 令牌互相覆盖。这些重复样式已删除。**新增样式前先确认
`prototype-home.css` 里是否已有同名类与令牌**。

## 关于字体

`globals.css` 曾 `@import` Google Fonts（DM Mono、Space Grotesk），
**已移除**：原型样式只用系统字体栈（PingFang SC / Microsoft YaHei 等），
并不使用那两个字体，该导入属无效请求；且 `fonts.googleapis.com` 在国内
不可稳定访问，会拖慢首屏。

将来若确需 Web Font，应自托管到 CDN（`docs/LXW/seo.md`），
不要直接引 Google Fonts。

## 待补

`src/styles/presets/`（主题令牌预设）尚未建立。当前只有单页一套主题，
待多页面或多主题需求出现时再拆分。
