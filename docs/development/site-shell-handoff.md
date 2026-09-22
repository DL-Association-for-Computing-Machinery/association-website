# 主站骨架交接说明（#3）

> 面向在 #3 之后接手主站的成员。只讲三件事：这套骨架长什么样、哪里能改哪里不能改、怎么往上加东西。
>
> 不重复的内容：交付流程与分支口径见 `team-delivery.md` 与 `issue-assignment-plan.md`；
> 技术选型与部署边界见 `mvp-architecture-boundary.md`；代码检查的细则见 `lint-and-format.md`；
> 逐项验收证据见 `evidence/3-site-shell/README.md`；页面要回答什么问题见
> `../product/page-information-architecture.md`。

## 1. 技术栈与版本

版本以 `package.json` 为准，**不要各自升级**——这一批是 #3 验收时的组合。

| 项       | 约定                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 运行时   | Node >= 22.13.0                                                                |
| 包管理   | pnpm 10.33.0。仓库有 `pnpm-lock.yaml`，不要用 npm / yarn 装出第二份锁文件      |
| 框架     | Next.js 16.3.5 App Router + React 19.2.8，构建走 `next build --webpack`        |
| 语言     | TypeScript 5.9.3，`strict: true`，路径别名 `@/*` → `src/*`                     |
| 样式     | Tailwind 4 只提供 preflight 与后续新页面的工具类；首页观感由基线样式负责       |
| 代码检查 | ESLint 9（flat config，`eslint-config-next`）＋ Prettier 3，仓库根各有配置文件 |

```bash
pnpm install
pnpm dev            # 本地开发
pnpm build          # next build --webpack，七条路由全部静态预渲染
pnpm start          # 起产物，默认 3000，可加 -- -p 4173
pnpm check          # eslint . --max-warnings 0 && prettier . --check
```

## 2. 目录职责

| 路径                             | 职责                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| `src/app/page.tsx`               | 首页：把基线原型还原成可维护的 React 结构，只负责拼装区块              |
| `src/app/<route>/page.tsx`       | 内页：`metadata` ＋ 一个 `<RoutePage>`，不写布局                       |
| `src/app/layout.tsx`             | 站点外壳：开屏、跳过链接、顶栏、页脚、首帧内联脚本、自定义元素注入     |
| `src/components/home/*`          | 首页各区块，一个区块一个文件                                           |
| `src/components/route-page.tsx`  | 内页外壳：路由头 ＋ 明确空状态；空状态本身在 `empty-state.tsx`         |
| `src/lib/site-navigation.ts`     | **站内导航唯一来源**：六类页面的路由、页脚入口、顶栏 Dock 的顺序与文案 |
| `src/lib/site-runtime.ts`        | 首帧内联脚本、主题存储键、自定义元素脚本清单、事件名                   |
| `src/lib/home-content.ts`        | 首页内容（**临时**，见第 5 节）                                        |
| `src/styles/prototype.css`       | 基线样式的 1:1 移植，**首页观感全部在这里改**                          |
| `src/styles/site.css`            | 基线没有、主站多页结构新需要的样式（内页、空状态、页脚导航、区块空态） |
| `src/types/custom-elements.d.ts` | `dia-*` / `threeui-*` 自定义元素的 JSX 类型声明                        |
| `public/prototype/`              | Jasper #30 基线，**只读**，见第 3 节                                   |

## 3. 与基线的接缝（最容易踩的一节）

`public/prototype/` 是 Jasper #30 的合并结果，被 #3 当作**只读基线**：`index.html` 是结构参照，
`styles.css` 是真设计令牌的来源，`components/` 与 `main.js` 是原生 Web Component 实现。

三条铁律：

1. **样式只在 `src/styles/` 改。** `prototype.css` 是 `public/prototype/styles.css` 的 1:1 移植，
   移植之后就以 `src/` 侧为准；`public/prototype/` 保持不动，方便随时和基线对照。
2. **自定义元素脚本必须在客户端水合之后注入**（`src/components/prototype-scripts.tsx`，
   `element.async = false` 保序）。搬到 `<head>` 会因为这些组件在升级时改写自己的子节点，
   在 React 水合前就把 DOM 换掉，触发 #418 水合不匹配。
3. **启动顺序不能改**：`layout.tsx` 里 `no-js` 与 `intro-active` 由服务端写上、再由首帧脚本摘掉。
   前者保证禁用脚本时首屏字标有回落文案，后者保证开屏那一帧不会先闪出主页内容。

同一份基线里还有两个会「静默失效」的坑，改到相关区域时先看一眼：

- **事件名 `prototype:intro-complete` 不能改名**（`src/lib/site-runtime.ts`）。四个基线组件硬依赖它，
  改名之后字标动效会永远停在透明起点，而且不报错。
- **五个组件在窄屏会降级成静态版，并且只在升级时判一次**：`dia-icon-cloud`、`dia-logo-particles`、
  `dia-retro-grid`、`threeui-character-carousel`、`threeui-globe-study` 把结论写进
  `data-mobile-static` / `data-ready` 就不再复查。所以「窄窗口打开 → 拉宽」之后大屏会永久空白
  （标签云画布停在 300×150、`threeui-*` 连 iframe 都不建，而窄屏的静态回落又被 CSS 媒体查询收了起来）。
  `prototype-scripts.tsx` 在跨越 `48rem` 断点时把这几个元素就地重建一次来兜住；
  **加新的 3D 组件时要照这个模式处理，否则会遇到同样的空白。**

## 4. 现有约定（照着写，别另立一套）

- **导航不硬编码。** 页面路由、页脚入口、顶栏 Dock 都从 `src/lib/site-navigation.ts` 取；
  内页互链在 `<RoutePage related>` 里写页面标识（如 `"activities"`），href 与文案由它解析。
- **文案只来自内容包。** `docs/content/launch-content-pack.md` 是内容来源，
  登记表里没有的地点、人数、成立年份、指导教师、联系方式一律不补（见 `docs/content/public-content-governance.md`）。
  内容包没写精度的地方也不补，例如只写到省赛名次就不推算日期。
- **空状态必须说清三件事**：这里现在没有内容、为什么、下一步去哪。出口只指向真实存在的路由或首页区块，
  不生成无效按钮。
- **无障碍是验收项**：跳过链接可用、焦点环可见、当前页/当前区块有 `aria-current`、
  装饰元素 `aria-hidden` 且不接收指针事件、信息不靠颜色单独传达。`prefers-reduced-motion`
  与 `prefers-reduced-transparency` 都要有回落。

## 5. `src/lib/home-content.ts` 是临时模块

它按 #3 的需要把内容包里的首页材料整理成常量，**约定由 #4 的内容模型整体替换**：

- 不要在其它页面 import 它，也不要把它的筛选逻辑复制出去；
- 它导出的每个常量都在注释里写明了来源与取舍，替换时按注释回溯即可；
- 荣誉条目分两层：`HOME_AWARDS` 是完整清单（供成果页 #5 用），
  `HOME_AWARDS_PREVIEW` 是首页摘要位实际展示的部分。
  首页展示条数由 `HOME_AWARDS_PREVIEW_LIMIT` 控制，**取值区间是 0–4**（越界会被钳制），
  `0` 是合法状态且必须给出明确空状态，不是需要绕开的边界；
  展示哪几条由 `HOME_AWARDS_PREVIEW_RANKING`（由强到弱）决定，不按下标切片。

## 6. 怎么加东西

**加一个内容页**

1. 在 `src/lib/site-navigation.ts` 的 `SITE_PAGES` 里加一条（`id` / `href` / `title` / `homeSectionId`）；
2. 建 `src/app/<route>/page.tsx`，导出 `metadata`，返回一个 `<RoutePage>`，
   填齐 `kicker`、`title`、`summary`、`emptyTitle`、`emptyBody`、`related`；
3. 内容还没到位时就保留空状态，**不要造占位卡片或假数据**。

**加一个首页区块**

1. 建 `src/components/home/<name>.tsx`，内容从 `home-content.ts` 取（或等 #4 的内容模型）；
2. 在 `src/app/page.tsx` 的 `.page-content` 里按视觉顺序插入；
3. 需要顶栏 Dock 能跳过来的话，区块要带 `id`，并把该 id 填进 `SITE_PAGES` 的 `homeSectionId`；
4. 样式写进 `src/styles/prototype.css`（若基线上没有对应部分，则写进 `src/styles/site.css`）。

## 7. 已知边界与接手点

- **`#activities` 嵌在 `#about` 之内**，顶栏「活动回顾」实际指向 `#about` 里的轮播区，
  所以 Dock 顺序与文档顺序不一致。判定「当前在哪个区块」不能只按顺序比，
  要按 `compareDocumentPosition` 排文档序后取最后一个越过视口 40% 的区块（见
  `src/components/dock-current-section.tsx`）。
- **荣誉摘要的预览条数上限是 4**，最终的四项荣誉由 #2 与 #5 验收确定；
  `HOME_AWARDS_PREVIEW_RANKING` 的第 3、4 位目前只是候选占位。
- **窄屏下荣誉区文字地球会向左越出视口约 12px**（820–900 一带），不产生横向滚动条。
  这是基线原型就有的取舍，留给后续布局票处理。
- **内容与路由的正式页面**（协会介绍、活动、成果、知识与文章、加入我们）仍为空状态，
  按 `issue-assignment-plan.md` 的 #4 → #5 → #6 → #7 顺序接力。
