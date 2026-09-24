# components

首页动效的原生 Web Components。**它们是经典脚本，不是 React 组件** ——
无 `import` / `export`，靠 `customElements.define()` 注册，由浏览器直接加载。

## 两层结构

```text
components/
├── dia-*.js              # 13 个基础自定义元素（无外部依赖）
├── threeui-*.js          # 2 个 ThreeUI 适配层（内部用 iframe 渲染 WebGL）
└── threeui-source/       # 官方登记源件，被 threeui-*.js 加载
```

## dia-*（13 个）

在 `page.tsx` 里以标签形式使用。元素名与文件名一致（部分文件用 `TAG` 常量注册）：

| 组件                                             | 作用                                     |
| ------------------------------------------------ | ---------------------------------------- |
| `dia-dock.js` → `<dia-dock>`                     | 顶部导航磁性吸附                         |
| `dia-text-reveal.js` → `<dia-text-reveal>`       | 逐字揭示文字                             |
| `dia-icon-cloud.js` → `<dia-icon-cloud>`         | 技术图标 3D 标签云                       |
| `dia-logo-particles.js` → `<dia-logo-particles>` | Logo 粒子字标                            |
| `dia-avatar-circles.js`                          | 成员头像环（移动端相册）                 |
| `dia-animated-list.js`                           | 列表入场动画                             |
| `dia-blur-fade.js`                               | 模糊渐显                                 |
| `dia-dot-pattern.js`                             | 点阵背景                                 |
| `dia-file-tree.js`                               | 文件树展示                               |
| `dia-marquee.js`                                 | 滚动跑马灯                               |
| `dia-pixel-image.js`                             | 像素化图片（**已加载但首页当前未使用**） |
| `dia-retro-grid.js`                              | 复古网格背景                             |
| `dia-terminal.js`                                | 终端打字效果                             |

JSX 类型声明在 `src/types/custom-elements.d.ts`。

## threeui-*（2 个适配层）

| 文件                            | 作用                 | 加载的源件                                        |
| ------------------------------- | -------------------- | ------------------------------------------------- |
| `threeui-globe-study.js`        | 3D 地球（明/暗两版） | `threeui-source/globe-study.html`、`-light.html`  |
| `threeui-character-carousel.js` | 字符胶片轮播         | `threeui-source/character-filmstrip-adapted.html` |

两者都用相对路径解析源件：

```js
new URL("./threeui-source/globe-study.html", document.currentScript.src).href;
```

**因此源件必须与组件同目录**（`public/components/threeui-source/`）——
把 `threeui-source/` 移走会导致地球和胶片空白。

`threeui-globe-study.js` 还支持从 `window.__ECUT_EMBEDDED_SOURCES__` 读取内联源，
用于源件无法按 URL 获取的场景；未提供时回退到上面的 `new URL(...)`。

## 加载方式与时序

由 `src/app/_components/prototype-scripts.tsx` 按固定顺序注入 16 个 `<script>`：

1. 先注入全部 `dia-*` 与 `assets/icon-set.js`。
2. 最后才注入 `threeui-*`（它们依赖前面的基础元素）。

脚本用 `async = false` 保持顺序，注入前检查 `data-prototype-src` 标记以避免
React StrictMode 双重注册（重复 `customElements.define()` 会抛错）。

## 维护注意

**这些文件与 `prototype/components/` 逐字节重复。** `prototype/` 是原型参考目录
（不参与构建），两份副本需手工同步。改动任一处的正确做法是同时改另一处，
或明确决定废弃其中一份。

## 相关

- 源件说明与保真规则：`threeui-source/README.md`
- 组件加载与类型声明：`src/app/_components/README.md`、`src/types/README.md`
- 原型的视觉与交互基线：`prototype/README.md`
