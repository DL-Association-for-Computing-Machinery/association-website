# #3 响应式官网骨架验收证据

采集时间：2026-09-22。对应分支 `feature/3-site-shell`，固定提交 SHA 见同一分支的 PR 描述。

基线对照物是 `public/prototype/`（Jasper #30 合并结果，只读）。下面所有截图都是**本地生产构建产物**的运行结果，不是 `next dev`。

## 复现方式

```bash
pnpm install
pnpm check          # eslint src --max-warnings 0 && prettier 检查；全仓 eslint 会被本地目录卡住，见下
pnpm build          # next build --webpack，7 条路由静态预渲染
pnpm start -- -p 4184
```

浏览器访问 `http://127.0.0.1:4184`。采集脚本是仓库外的本地工具脚本（`playwright-core` + 系统 Chrome），未纳入仓库依赖，也没有接进 CI；手工核对时按下面「逐项对照」逐条看即可。

> 注意：本机运行 `eslint .` 会因为工作区里的 `prototypes/`、`.local-backups/` 大文件让 ESLint 的 stylish 格式化器抛 `RangeError`，所以检查收敛为 `eslint src`。CI 上不存在这两个本地目录。

## 逐项对照

| 验收项                                           | 证据                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 首页展示定位、活动回顾、已核验荣誉摘要、加入入口 | `desktop-1440-home.png`、`mobile-390-home.png`；滚到荣誉摘要的 `desktop-1440-home-honors.png`                                       |
| 六类页面具备可访问的路由或页面入口               | `desktop-1440-{about,activities,honors,knowledge,join}.png` 与对应 `mobile-390-*`；顶栏 Dock 与页脚各 6 个入口                      |
| 移动端导航可用，支持键盘、焦点和当前页状态       | `desktop-1440-focus-skip-link.png`（跳到主要内容）、`desktop-1440-focus-dock.png`（Dock 焦点环）、`verification.json` 的 `focus` 段 |
| 窄屏和宽屏无横向溢出                             | `verification.json` 的 `overflow: []`；14 条视口 × 路由记录                                                                         |
| 非完整内容页明确空状态                           | 各内页截图中的空状态区块；`desktop-1440-about-empty-state.png` 为空状态特写                                                         |
| 无效路径有明确状态                               | `desktop-1440-not-found.png`、`mobile-390-not-found.png`（HTTP 404，列出六类页面出口）                                              |
| 主题与首帧                                       | `desktop-1440-home-dark.png`；`verification.json` 的 `darkOnFirstFrame: true`                                                       |

`mobile-390-*` 为 390×844，`desktop-1440-*` 为 1440×900。首页首屏有字标动效（1.9s 延迟 + 1.2s 时长），截图在开屏收尾后约 3.5s 采集，否则会拍到未显现的空帧。

## `verification.json`

采集脚本写入的原始报告，含：

- `routes`：7 条路径 × 2 档视口，记录 HTTP 状态、`<h1>`、开屏是否已收尾、Dock/页脚条目数、空状态与 `no-js` 状态；
- `overflow`：横向溢出的元素清单，当前为空；
- `console`：控制台输出。留下的两条是预期内的——404 路由自身的资源 404，以及 `public/prototype/index.html` 里基线自带的 iframe sandbox 提示；
- `focus`：首页与内页的 Tab 焦点序、焦点环样式、Dock 的 `aria-current`；另含滚到各区块时的当前区块判定；
- `accessibleNames`：六个导航入口的可访问名反查计数，确认名称稳定；
- `errors`：页面级错误，当前为空。
