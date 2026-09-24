# #19 协会介绍与加入指引验收证据

采集时间：2026-09-24。对应分支 `feature/19-about-join`。

下面所有截图都是本地生产构建产物（`pnpm build` 后 `pnpm start -- -p 4173`）的运行结果，不是 `next dev`。采集脚本在仓库外的 `.playwright-cli/`（已 gitignore），不入库。

本轮在保持 #19 文案口径不变的前提下，把 `/about`、`/join` 的版式改成与 Jasper-Liao2026 首页基线同一套语言：居中大标题、胶片轨道 / 窄屏相册、bento 卡片、加入区透视网格。

## 复现方式

```bash
pnpm install
pnpm check
pnpm build
pnpm start -- -p 4173
```

浏览器访问 `http://127.0.0.1:4173`。

截图命名沿用 `{desktop-1440,mobile-390}-{slug}.png`。内页无开屏；首页截图在 `html` 去掉 `intro-active` 之后采集，并滚到对应区块。全页长截图里可能叠上 `position: fixed` 的彩框，那是截图像素拼接，不是页面横向溢出。

## 逐项对照

| 验收项                                                     | 证据                                                                                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 正式 Logo、真实合照与公开简介；不写成立年份                | `desktop-1440-about.png`、`mobile-390-about.png`                                                                                                                     |
| 零基础 / 新生 / 竞赛路径；公众号「计协ECUT」；无报名空状态 | `desktop-1440-join.png`、`mobile-390-join.png`                                                                                                                       |
| 首页、介绍页、加入页互相可达                               | 首页 `desktop-1440-home-about-link.png` / `desktop-1440-home-join-link.png` 的「阅读完整介绍」「了解加入方式」；介绍页「去加入我们」；加入页空状态出口；页脚六类页面 |
| 长文手机布局、无横向溢出                                   | `mobile-390-about.png`、`mobile-390-join.png`；`verification.json` 的 `overflowPx` 均为 0                                                                            |
| 图片替代文本                                               | Logo alt「东华理工大学计算机协会 Logo」；合照 alt「协会成员在教室内合影」                                                                                            |
| 键盘路径                                                   | `desktop-1440-focus-about-join-cta.png`（「去加入我们」焦点环）；`desktop-1440-focus-join-empty.png`                                                                 |
| 无 URL / 二维码 / 「正在招新」                             | 加入页只有公众号名称与无报名空状态                                                                                                                                   |
| 版式沿用 Jasper 首页基线                                   | 介绍页大标题「这是我们」+ 胶片轨道；加入页 `dia-retro-grid` + 两行标题；方向 / 路径使用 `.bento-card`                                                                |

## 验证摘要

见同目录 `verification.json`：`/about`、`/join` 与首页互链在 1440 与 390 下 `overflowPx` 均为 0；焦点落到「去加入我们」。
