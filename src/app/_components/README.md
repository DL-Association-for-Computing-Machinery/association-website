# _components（首页局部组件）

只被首页使用的客户端组件。`_` 前缀不产生路由段，也不会被其他页面引用。

之所以不放进 `src/components/`：按 colocation 规则，单页专用组件就近放在页面同级。
等某天第二个页面也需要同一个组件时，再上提到 `src/components/`。

## 文件

| 文件                    | 说明                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| `intro-screen.tsx`      | 开屏遮罩。默认 3.9s 释放，支持「跳过动画」；结束派发 `prototype:intro-complete` |
| `greeting-confetti.tsx` | 问候区彩纸。原生 Canvas 绘制，进入问候区时喷一次（不做常驻帧循环）              |
| `theme-toggle.tsx`      | 昼夜切换。写入 `localStorage`，支持时用 View Transition 从点击位置扩散          |
| `stack-velocity.tsx`    | 技术栈速度文字带。名称复用 3D 标签云，滚动越快越快                              |
| `prototype-scripts.tsx` | 用 Next `<Script>` 注入原型 Web Components 脚本（`public/components/*.js`）     |

除 `prototype-scripts.tsx` 外都带 `"use client"`。这些组件从原型 `main.js` 移植而来，
视觉与交互基线见 `prototype/README.md`。

## 两个时序约束

- **`prototype-scripts.tsx` 里 `icon-set.js` 必须排在全部 `dia-*` 之前**。
  `dia-icon-cloud` 在 `connectedCallback` 里同步读 `window.DIA_ICON_SET`，此时元素
  已由 SSR HTML 升级，**没有重试机会** —— 读到空表就渲染成无图标的白板。
  这是全部 16 个脚本中唯一真正需要顺序的地方。
- **`stack-velocity.tsx` 必须等 `<dia-icon-cloud>` 就绪后再读取条目名称**。
  原型的 `main.js` 在 `DOMContentLoaded` 后执行，那时组件尚未接管其子 `<ul>`；
  过早读取会拿到空列表，文字带将一直空白。

### 顺序是怎么保证的

两个机制缺一不可：

1. `icon-set.js` 在数组里排在首位 —— 仅靠数组顺序**不够**。
2. `<Script async={false}>` —— 动态插入的脚本默认 `async=true`（下载完就执行），
   不同文件的下载耗时差异会导致乱序。Next 的 `setAttributesFromProps` 专门支持
   `async` 布尔属性，传 `false` 会显式清掉该属性。

### 为什么改用 next/script

之前是 `useEffect` + `createElement` 手工注入。改用 `<Script>` 后：

- Next 的 `ScriptCache` 按 src 去重，StrictMode 双调用与客户端导航都不会重复
  注册自定义元素（重复 `customElements.define()` 会抛错），不再需要自定义的
  `data-prototype-src` 标记。
- 构建时自动为 16 个脚本生成 `<link rel="preload" as="script">`，同时不产生
  阻塞的 `<script>` 标签，脚本仍在水合后注入。
- `PrototypeScripts` 因此不再需要 `"use client"`，但仍是客户端组件
  （`next/script` 的 `afterInteractive` 只在客户端生效）。

## 相关

- 原型组件本体与运行时：`public/components/README.md`
- 自定义元素的 JSX 类型声明：`src/types/custom-elements.d.ts`
- 主题偏好键名 `ecut-ca-prototype-theme`：`layout.tsx` 与 `theme-toggle.tsx` 共用
