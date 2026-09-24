# public

Next.js 的**静态资源根目录**。里面的文件不经过打包、不加哈希、不做 tree-shaking，
而是**按原路径**直接暴露在站点根 URL 下：

```text
public/assets/association-logo.png  →  https://<站点>/assets/association-logo.png
public/components/dia-dock.js       →  https://<站点>/components/dia-dock.js
```

所以路径名就是公开 URL，改名等于改对外地址。

## 目录

| 目录                         | 放什么                                                  | 引用方                                      |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| `assets/`                    | 协会 Logo、活动照片、技术图标路径表                     | `src/app/page.tsx`、`src/data/homepage.ts`  |
| `components/`                | 首页动效的 13 个 `dia-*` 与 2 个 `threeui-*` 自定义元素 | `src/app/_components/prototype-scripts.tsx` |
| `components/threeui-source/` | ThreeUI 登记源件（逐字节保真）                          | `components/threeui-*.js`                   |

## 为什么这些代码在 public/ 而不在 src/

`components/` 下的 `dia-*` 是**经典脚本**（无 `import` / `export`），靠
`customElements.define()` 注册自定义元素。打包器处理不了这种形式，
必须由浏览器用 `<script>` 直接加载，因此只能放 `public/`。

它们也不是 React 组件 —— 在 `page.tsx` 里以 `<dia-dock>`、`<dia-text-reveal>`
等标签直接使用，JSX 类型声明在 `src/types/custom-elements.d.ts`。

## 约定

- **不要手工编辑 `assets/icon-set.js`** —— 文件头明确标注为生成物，见
  `assets/README.md`。
- **不要格式化 `components/threeui-source/`** —— 要求逐字节保留上游内容。
  相关保护规则目前**指向旧路径且已失效**，见该目录 README。
- 新增图片放到 `assets/`，不要新建其他顶层目录。
- 大文件（如源件）不要放这里 —— 本目录所有内容都会被部署并对外提供。

## 已知遗留问题

1. **`components/` 与 `prototype/components/` 逐字节重复**（15 个 `.js`），
   `assets/` 与 `prototype/assets/` 同样重复。`prototype/` 是原型参考目录，
   不参与构建，但两份副本需要手工保持同步。
2. **`threeui-source/` 的保真保护规则指向已失效的旧路径**，当前 `pnpm format`
   会改写这些文件。详见 `components/threeui-source/README.md`。
3. `demo/drb.html` 引用了 `public/assets/circuit.jpg`、`code.jpg`、`together.jpg`、
   `lava*` —— 这些文件**不存在**，该 demo 的图片目前是空的。

## 相关

- 素材来源与授权登记：`docs/content/launch-content-pack.md`
- 媒体 CDN 规划（阿里云 OSS + CDN）：`src/config/README.md`、`docs/LXW/seo.md`
- 内容红线（不得编造素材）：`src/data/README.md`
