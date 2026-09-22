# #3 响应式官网骨架验收证据

采集时间：2026-09-22。对应分支 `feature/3-site-shell`，固定提交 SHA 见同一分支的 PR 描述。

基线对照物是 `public/prototype/`（Jasper #30 合并结果，只读）。下面所有截图都是**本地生产构建产物**的运行结果，不是 `next dev`。

## 复现方式

```bash
pnpm install
pnpm check          # eslint src --max-warnings 0 && prettier 检查；全仓 eslint 会被本地目录卡住，见下
pnpm build          # next build --webpack，7 条路由静态预渲染
pnpm start -- -p 4173
```

浏览器访问 `http://127.0.0.1:4173`。采集脚本是仓库外的本地工具脚本（`playwright-core` + 系统 Chrome），未纳入仓库依赖，也没有接进 CI；手工核对时按下面「逐项对照」逐条看即可。

> 注意：本机运行 `eslint .` 会因为工作区里的 `prototypes/`、`.local-backups/` 大文件让 ESLint 的 stylish 格式化器抛 `RangeError`，所以检查收敛为 `eslint src`。CI 上不存在这两个本地目录。

采集脚本放在 `.playwright-cli/`（已被 `.gitignore` 排除，不入库）。每条证据下面都写了不依赖脚本的复核方式，手工照做即可复现。

证据 JSON 是脚本直出的，重新采集后跑一次
`prettier --write docs/development/evidence/3-site-shell/` 对齐仓库格式，否则 `pnpm format:check` 会拦。

## 逐项对照

| 验收项                                           | 证据                                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首页展示定位、活动回顾、已核验荣誉摘要、加入入口 | `desktop-1440-home.png`、`mobile-390-home.png`；荣誉摘要是 `desktop-1440-home-honors.png`；四个区块各自的渲染量见 `verification.json` 的 `homeSections` 段                                                                                            |
| 荣誉摘要预览支持 0–4 条                          | `awards-preview-sweep.json` 与 `awards-preview-{0,1,2,3,4}.png`：五档逐一构建并渲染，0 条时给明确空状态                                                                                                                                               |
| 首页各区块的 3D / 动效组件与基线一致             | `desktop-1440-home-activities.png`（照片墙 3D 轨道）、`desktop-1440-home-stack.png`（3D 标签云 + 底部滚动文字带）、`desktop-1440-home-join.png`（WebGL 复古透视网格）、`desktop-1440-home-honors.png`（文字地球）；`verification.json` 的 `threeD` 段 |
| 六类页面具备可访问的路由或页面入口               | `desktop-1440-{about,activities,honors,knowledge,join}.png` 与对应 `mobile-390-*`；顶栏 Dock 与页脚各 6 个入口                                                                                                                                        |
| 移动端导航可用，支持键盘、焦点和当前页状态       | `desktop-1440-focus-skip-link.png`（跳到主要内容）、`desktop-1440-focus-dock.png`（Dock 焦点环）、`verification.json` 的 `focus` 段                                                                                                                   |
| 窄屏和宽屏无横向溢出                             | `responsive-sweep.json`：16 档宽度（360–1920）逐档扫描，横向溢出全为 0；`verification.json` 的 `overflow: []`；14 条视口 × 路由记录                                                                                                                   |
| 非完整内容页明确空状态                           | 各内页截图中的空状态区块；`desktop-1440-about-empty-state.png` 为空状态特写                                                                                                                                                                           |
| 无效路径有明确状态                               | `desktop-1440-not-found.png`、`mobile-390-not-found.png`（HTTP 404，列出六类页面出口）                                                                                                                                                                |
| 主题与首帧                                       | `desktop-1440-home-dark.png`；`verification.json` 的 `darkOnFirstFrame: true`                                                                                                                                                                         |
| 跨越 48rem 断点后 3D 区块仍能渲染                | `responsive-breakpoint-stack.png`、`responsive-breakpoint-honors.png`；`responsive-sweep.json` 的 `breakpoint` 段                                                                                                                                     |

`mobile-390-*` 为 390×844，`desktop-1440-*` 为 1440×900。

**截图时机（两条都必须满足，否则会拍到空帧或空容器）：**

1. 首页首屏字标是逐字扫光揭示（延迟 1.9s + 时长 1.2s），要在**开屏收尾后约 3.5s** 采集。
   开屏收尾的判据是 `html` 上的 `intro-active` 被摘掉 —— 不能只看 `.intro-screen` 的 `display`，
   首帧 0–400ms 它还处于 `no-js` 兜底态的 `display: none`，按 display 判会立刻误判成「已结束」。
2. 首页各区块的 3D 组件（文字地球、3D 标签云、照片墙、WebGL 透视网格）都是**进入视口才初始化**，
   且初始化要 5–7 秒。所以要先按 600px 步长把整页滚一遍唤醒它们，再回到目标区块等足时间才截；
   否则拍到的是尚未绘制的空容器，看起来像「3D 效果没有复刻」。

## 中间宽度扫描与断点回归（`responsive-sweep.json`）

1440 与 390 两个端点测不出中间宽度的问题，所以另有一份扫描：

- `sweep`：16 档宽度（360 / 430 / 640 / 700 / 768 / 820 / 900 / 1024 / 1080 / 1180 / 1200 / 1280 / 1366 / 1440 / 1680 / 1920）
  下首页的横向溢出量，全部为 0。采集时会先把 `html`/`body` 上为收住装饰层而挂的
  `overflow-x: hidden` 临时摘掉，否则量到的永远是 0。
- `breakpoint`：把窄窗口（700px）打开、等组件升级完成，再把视口拉到 1600px（不刷新），
  检查五个「窄屏轻量模式」组件是否真的重新初始化。

### 为什么需要 `breakpoint` 这一段

`dia-icon-cloud`、`dia-logo-particles`、`dia-retro-grid`、`threeui-character-carousel`、
`threeui-globe-study` 这五个基线组件在**升级时**用 `(max-width: 48rem)` 判定一次轻量模式，
把结论写进 `data-mobile-static` 就不再复查。于是「窄窗口打开 → 把窗口拉宽/最大化」之后，
大屏上这几块会永久空白：标签云的画布停在 300×150 的默认尺寸（一个像素都不画）、
两个 `threeui-*` 连 iframe 都不创建，而窄屏那份静态回落又被 CSS 媒体查询收了起来 —— 两边都空。

`src/components/prototype-scripts.tsx` 在跨越断点（窄 → 宽）时把这几个元素就地重建一次，
让它们按当前视口重新初始化；`StackVelocity` 与 `GreetingConfetti` 里同类的一次性判定
（填内容、撒彩纸都发生在水合那一瞬间）也一并改成随断点走。`breakpoint` 段记录的就是重建前后的对照。

### 已知的基线遗留（不产生横向滚动）

820–900 这一带，荣誉区的文字地球（`threeui-globe-study`）会向左越出视口约 12px：
`.awards-body` 第一列是 `minmax(15rem, 1fr)`，在 900 视口下算得约 362px，
而文字地球的响应式宽度是 402px，居中后两侧各溢出一部分。`documentElement.scrollWidth`
不受影响（向左溢出不计入），因此不产生横向滚动条。这是基线原型就有的窄屏布局取舍，
本轮未动，留给后续的布局票。

## 荣誉摘要预览的 0–4 条扫描（`awards-preview-sweep.json`）

验收第一条写的是「已核验荣誉摘要（**预览支持 0–4 条**）」。条数由
`src/lib/home-content.ts` 的 `HOME_AWARDS_PREVIEW_LIMIT` 控制（0–4，越界会被钳制），
是构建期常量，所以五档各构建一次生产产物、各采一次：

| 条数 | 渲染条目 | 列表宽×高 | 空状态 | 文字地球 iframe | 横向溢出 |
| ---- | -------- | --------- | ------ | --------------- | -------- |
| 0    | 0        | 无列表    | 有     | 1               | 0        |
| 1    | 1        | 480×63    | 无     | 1               | 0        |
| 2    | 2        | 480×136   | 无     | 1               | 0        |
| 3    | 3        | 480×208   | 无     | 1               | 0        |
| 4    | 4        | 480×281   | 无     | 1               | 0        |

`2` 是仓库里的默认档，`awards-preview-2.png` 与 `desktop-1440-home-honors.png` 是同一状态。
这五次构建同时构成「可重复构建」的旁证：同一份代码连跑五次，每次都成功且七条路由全部静态预渲染。

三条结论：

- **0 条不是靠「列表为空」蒙混过去。** 此时不渲染空列表容器（`emptyListPresent: false`），
  改在区块内给出明确空状态「荣誉摘要待来源登记后填充：本区块只收录已核验来源的成绩。」，
  宽度与列表一致（480），右列不会突然变窄。
- **列表高度随条数线性增长**（63 / 136 / 208 / 281，每条约 72px），宽度恒为 480，
  没有换行错位或截断。
- **五档都不产生横向溢出**，文字地球始终完成初始化（iframe 1 个），控制台无错误。

条目顺序也在这里核对：`dia-animated-list` 会把条目逐条 `prepend`，所以源码顺序的**最后一条**
落在最上方。默认档的 DOM 顺序是「2025 CCPC · 全国邀请赛（南昌）」→「第十五届蓝桥杯 · B 组」，
与基线截图一致；预览数组按「由强到弱取前 N 条再反转」构造，就是为了维持这个顺序。

不依赖脚本的复核方式：

```bash
# 把 src/lib/home-content.ts 的 HOME_AWARDS_PREVIEW_LIMIT 改成 N（0–4）
pnpm build && pnpm start -- -p 4173
# 打开首页滚到「我们赢得」区块：条目数应与 N 一致；N=0 时应出现上面的空状态文案
```

## `verification.json`

采集脚本写入的原始报告，含：

- `routes`：7 条路径 × 2 档视口，记录 HTTP 状态、`<h1>`、开屏是否已收尾、Dock/页脚条目数、空状态与 `no-js` 状态；
- `overflow`：横向溢出的元素清单，当前为空；
- `console`：控制台输出。留下的是预期内的两类——404 路由自身的资源 404，以及 `public/prototype/index.html` 里基线自带的 iframe sandbox 提示；
- `focus`：首页与内页的 Tab 焦点序、焦点环样式、Dock 的 `aria-current`；另含滚到各区块时的当前区块判定；
- `threeD`：首页四个 3D/动效组件的就绪判据——`iconCloudShadowChildren`（3D 标签云把标签搬进 shadow root 后的子节点数）、
  `velocityItems`（底部滚动文字带的项数）、`joinGridShadow`（WebGL 透视网格的 shadow root 非空）、
  `carouselReady`（照片墙 iframe 的 `data-ready`）；
- `homeSections`：首页四要素（`about` / `activities` / `honors` / `learning` / `join`）各渲染出了什么——
  区块是否可见、实际尺寸、标题、**扣掉标题之后的正文长度**，以及各自的标志性内容数量
  （简介段落数与正文字数、照片墙 iframe 与窄屏回落图、荣誉条目数与文字地球 iframe、
  标签云 light DOM 与 shadow root 的标签数、滚动文字带项数、透视网格 shadow root 子节点数与收尾文案行数）。
  衡量时机在整页滚过一遍、四个 3D 组件都唤醒之后；正文长度为 0 会被记为错误，
  这样「只有标题、内容是空的」不会被截图糊过去；
- `accessibleNames`：六个导航入口的可访问名反查计数，确认名称稳定；
- `errors`：页面级错误，当前为空。

中间宽度的溢出扫描与跨断点重绑另存为 `responsive-sweep.json`，见上一节。
