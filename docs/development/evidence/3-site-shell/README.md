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

## 逐项对照

| 验收项                                           | 证据                                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首页展示定位、活动回顾、已核验荣誉摘要、加入入口 | `desktop-1440-home.png`、`mobile-390-home.png`；荣誉摘要是 `desktop-1440-home-honors.png`                                                                                                                                                             |
| 首页各区块的 3D / 动效组件与基线一致             | `desktop-1440-home-activities.png`（照片墙 3D 轨道）、`desktop-1440-home-stack.png`（3D 标签云 + 底部滚动文字带）、`desktop-1440-home-join.png`（WebGL 复古透视网格）、`desktop-1440-home-honors.png`（文字地球）；`verification.json` 的 `threeD` 段 |
| 六类页面具备可访问的路由或页面入口               | `desktop-1440-{about,activities,honors,knowledge,join}.png` 与对应 `mobile-390-*`；顶栏 Dock 与页脚各 6 个入口                                                                                                                                        |
| 移动端导航可用，支持键盘、焦点和当前页状态       | `desktop-1440-focus-skip-link.png`（跳到主要内容）、`desktop-1440-focus-dock.png`（Dock 焦点环）、`verification.json` 的 `focus` 段                                                                                                                   |
| 窄屏和宽屏无横向溢出                             | `verification.json` 的 `overflow: []`；14 条视口 × 路由记录                                                                                                                                                                                           |
| 非完整内容页明确空状态                           | 各内页截图中的空状态区块；`desktop-1440-about-empty-state.png` 为空状态特写                                                                                                                                                                           |
| 无效路径有明确状态                               | `desktop-1440-not-found.png`、`mobile-390-not-found.png`（HTTP 404，列出六类页面出口）                                                                                                                                                                |
| 主题与首帧                                       | `desktop-1440-home-dark.png`；`verification.json` 的 `darkOnFirstFrame: true`                                                                                                                                                                         |

`mobile-390-*` 为 390×844，`desktop-1440-*` 为 1440×900。

**截图时机（两条都必须满足，否则会拍到空帧或空容器）：**

1. 首页首屏字标是逐字扫光揭示（延迟 1.9s + 时长 1.2s），要在**开屏收尾后约 3.5s** 采集。
   开屏收尾的判据是 `html` 上的 `intro-active` 被摘掉 —— 不能只看 `.intro-screen` 的 `display`，
   首帧 0–400ms 它还处于 `no-js` 兜底态的 `display: none`，按 display 判会立刻误判成「已结束」。
2. 首页各区块的 3D 组件（文字地球、3D 标签云、照片墙、WebGL 透视网格）都是**进入视口才初始化**，
   且初始化要 5–7 秒。所以要先按 600px 步长把整页滚一遍唤醒它们，再回到目标区块等足时间才截；
   否则拍到的是尚未绘制的空容器，看起来像「3D 效果没有复刻」。

## `verification.json`

采集脚本写入的原始报告，含：

- `routes`：7 条路径 × 2 档视口，记录 HTTP 状态、`<h1>`、开屏是否已收尾、Dock/页脚条目数、空状态与 `no-js` 状态；
- `overflow`：横向溢出的元素清单，当前为空；
- `console`：控制台输出。留下的是预期内的两类——404 路由自身的资源 404，以及 `public/prototype/index.html` 里基线自带的 iframe sandbox 提示；
- `focus`：首页与内页的 Tab 焦点序、焦点环样式、Dock 的 `aria-current`；另含滚到各区块时的当前区块判定；
- `threeD`：首页四个 3D/动效组件的就绪判据——`iconCloudShadowChildren`（3D 标签云把标签搬进 shadow root 后的子节点数）、
  `velocityItems`（底部滚动文字带的项数）、`joinGridShadow`（WebGL 透视网格的 shadow root 非空）、
  `carouselReady`（照片墙 iframe 的 `data-ready`）；
- `accessibleNames`：六个导航入口的可访问名反查计数，确认名称稳定；
- `errors`：页面级错误，当前为空。
