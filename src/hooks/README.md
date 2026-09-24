# hooks

跨组件复用的客户端逻辑（自定义 Hooks）。

## 当前状态：空

尚无内容。原因：

- 首页的客户端逻辑（开屏、主题、彩纸、速度带）都只服务单个页面，
  按 colocation 规则就近放在 `src/app/_components/` 里，未上提。
- 主站目前只有首页一个页面，还没有出现「两处以上需要同一份客户端逻辑」的场景。

这是**已定义但待填充**的分层，不是遗留空目录。

## 什么时候往这里加

- 同一个有状态逻辑需要在两处以上复用。
- 逻辑本身与页面语境无关（例如 `useLocalStorage`、`useMediaQuery`、
  `useReducedMotion`），换个页面同样成立。

只被单个页面用到的 Hook 留在该页 `_hooks/` 下（`_` 前缀不产生路由段）。

## 约定

- 文件名与导出名以 `use` 开头。
- 需要 `"use client"` 的 Hook 必须在文件顶部声明 —— Hooks 依赖浏览器 API
  或 React 状态，无法在服务端组件里运行。
- **无副作用的纯函数不要放这里**，放 `src/lib/`。

## 相关

- 纯工具函数：`src/lib/README.md`
- 页面局部逻辑：`src/app/_components/README.md`
