## 已完成

- [x] 将落地页第三方 / 独立脚本，直接用 Next `<Script>` 组件（`src/app/_components/prototype-scripts.tsx`）
  - 已全部改为 `<Script strategy="afterInteractive" async={false}>`，替换原先的 `useEffect` + `createElement` 手工注入
  - 依赖 Next 的 `ScriptCache` 按 src 去重，StrictMode 双调用与客户端导航都不会重复 `customElements.define()`
  - 构建产物核对：16 个脚本均生成 `<link rel="preload" as="script">`，且无阻塞 `<script>` 标签
  - 开发（3000）与生产（`pnpm build && pnpm start`）双模式实测：16 个脚本、0 重复、`icon-set.js` 首位、图标品牌色像素数稳定

## 待办

- [ ] **原型脚本 strategy 拆分（待决策）**：当前 16 个脚本统一用 `afterInteractive`；`seo.md` 笔记主张「粒子特效、次要动画等一律 lazyOnload」，两者需对齐。
  - 顺序约束：`lazyOnload` 走 `requestIdleCallback`，**不保证执行顺序**。而 `assets/icon-set.js` 必须先于 `dia-icon-cloud.js` 执行 —— 后者在 `connectedCallback` 里同步读 `window.DIA_ICON_SET`，元素由 SSR HTML 升级，没有重试机会，读到空表会渲染成无图标白板。
  - 若拆分：`icon-set.js` + `dia-icon-cloud.js` 必须留在同一个有序组（`afterInteractive` + `async={false}`），其余装饰性脚本才可移入 `lazyOnload`。
- [ ] **`no-js` 类名导致 hydration mismatch**：`src/app/layout.tsx` 的 `<html className="no-js intro-active">` 由 SSR 输出，而首帧内联脚本 `BOOTSTRAP_SCRIPT` 会移除 `no-js`，水合时 React 比对到差异并报错（`className="no-js intro-active"` vs `"intro-active"`）。需要让服务端与客户端初始类名一致。
- [ ] **threeui-source 保真规则路径失效**：`.gitattributes` 与 `.prettierignore` 仍指向 `prototype/components/threeui-source/`，实际已移到 `public/components/threeui-source/`。当前运行 `pnpm format`（`prettier . --write`）会改写这 10 个要求逐字节保真的上游源件。
