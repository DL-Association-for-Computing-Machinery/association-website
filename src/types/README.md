# types

跨目录共用的 TypeScript 类型与声明。只在单个文件内部使用的局部类型留在原文件，
不往这里搬。

## 文件

| 文件                   | 说明                                 |
| ---------------------- | ------------------------------------ |
| `content.ts`           | 公开内容领域模型                     |
| `custom-elements.d.ts` | 原型 Web Components 的 JSX 类型声明  |
| `index.ts`             | 统一出口，只转出 `content.ts` 的类型 |

## content.ts — 公开内容领域模型

依据 `.scratch/computer-association-site/spec.md`「内容模型」与
`docs/content/public-content-governance.md` 定义。

**领域实体**（与 `CONTRIBUTING.md` 约定的词汇一致，页面文案必须使用同一套词）：

| 类型            | 含义               |
| --------------- | ------------------ |
| `Activity`      | 活动               |
| `Achievement`   | 成果 / 竞赛荣誉    |
| `Article`       | 知识与文章         |
| `Person`        | 成员 / 指导信息    |
| `Link`          | 链接               |
| `PublicContent` | 以上条目的公共基类 |

**辅助类型**：

- `ContentStatus` = `"draft" | "review" | "published"` —— **只有 `published` 进入构建**。
- `DatePrecision` = `"day" | "year" | "edition" | "unknown"` —— 原始材料只给到届次或
  年份时如实记录，**不伪造成具体日期**。
- `ContentSource` —— 来源登记，`id` 对应素材包的 S01–S09 编号。

## custom-elements.d.ts — 自定义元素声明

`public/components/*.js` 注册的 `<dia-*>` 与 `<threeui-*>` 是原生自定义元素，
不是 React 组件，需在此声明才能在 TSX 中使用。

**布尔属性写空字符串**（如 `glow=""`）而不是 `{true}`：组件内部用
`hasAttribute()` 读取，而 React 会把 `true` 渲染成属性值，产生歧义。

```tsx
/* 对 */
<dia-icon-cloud glow="" />

/* 错 —— 组件读到的是字符串 "true" 而非属性存在 */
<dia-icon-cloud glow={true} />
```

## 约定

- `index.ts` 只转出 `content.ts`。`custom-elements.d.ts` 是全局声明文件，
  不需要也不应被 `export`。
- 新增领域实体时同步更新 `CONTRIBUTING.md` 的词汇表与
  `src/data/README.md` 的内容映射说明。
