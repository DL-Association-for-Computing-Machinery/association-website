# app

Next.js App Router 路由目录。**目录结构即 URL 结构**：`app/page.tsx` 对应 `/`，
`app/about/page.tsx` 对应 `/about`。

## 当前内容

| 路径           | 说明                                                             |
| -------------- | ---------------------------------------------------------------- |
| `layout.tsx`   | 根布局：`<html lang="zh-CN">`、metadata、首帧前内联脚本          |
| `page.tsx`     | 首页（唯一页面）                                                 |
| `globals.css`  | 全局样式入口，Tailwind v4 + 引入 `src/styles/prototype-home.css` |
| `favicon.ico`  | 站点图标                                                         |
| `_components/` | 仅首页使用的客户端组件，见该目录 README                          |

## layout.tsx 的内联脚本

`BOOTSTRAP_SCRIPT` 在首帧前**同步**执行三件事，缺一不可：

1. 移除 `html.no-js` —— 样式里 `html:not(.no-js)` 才隐藏降级字标、显示 Web Component。
2. 从 `localStorage` 恢复主题 —— 否则水合前会闪一下浅色。
3. 暂存开屏期间的 `requestAnimationFrame` 回调，开屏结束后统一释放 ——
   避免首屏动画与开屏动画挤在同一帧。

因此它必须内联在 `<head>`，不能改成 `useEffect` 或外部脚本。

## 约定

- **`globals.css` 留在本目录**，不移到 `src/styles/`。它是入口而非令牌文件；
  设计令牌在 `src/styles/prototype-home.css`，由这里相对路径 `@import`。
- **`_` 前缀目录不产生路由段**。`_components/`、`_hooks/` 都是私有目录，
  用于放页面局部代码。
- 页面局部组件不放 `src/components/`，放同级 `_components/`。
- 路由组 `(main)` / `(external)` **未建立**：整站均为公开页，登录走独立
  auth 子域，目前没有划分依据。

## 新增页面时

按 `docs/product/page-information-architecture.md` 的六个页面建目录：
`about/`、`activities/`、`achievements/`、`articles/`、`join/`。
列表页与详情页用动态段（如 `activities/[slug]/page.tsx`）。
