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
| `prototype-scripts.tsx` | 注入原型 Web Components 脚本（`public/components/*.js`）                        |

全部带 `"use client"`。这些组件从原型 `main.js` 移植而来，视觉与交互基线见
`prototype/README.md`。

## 两个时序约束

- **`prototype-scripts.tsx` 必须按数组顺序注入**。原型组件是经典脚本（无
  `import/export`），靠 `customElements.define` 注册；`dia-*` 组件必须早于依赖它们
  的 `threeui-*` 组件。脚本用 `async = false` 保持顺序，并在注入前检查
  `data-prototype-src` 标记，避免 React StrictMode 双调用时重复注册自定义元素
  （重复 `define` 会抛错）。
- **`stack-velocity.tsx` 必须等 `<dia-icon-cloud>` 就绪后再读取条目名称**。
  原型的 `main.js` 在 `DOMContentLoaded` 后执行，那时组件尚未接管其子 `<ul>`；
  过早读取会拿到空列表，文字带将一直空白。

## 相关

- 原型组件本体与运行时：`public/components/README.md`
- 自定义元素的 JSX 类型声明：`src/types/custom-elements.d.ts`
- 主题偏好键名 `ecut-ca-prototype-theme`：`layout.tsx` 与 `theme-toggle.tsx` 共用
