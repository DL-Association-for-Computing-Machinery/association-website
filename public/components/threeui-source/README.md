# threeui-source

ThreeUI 官方登记的源件，**要求逐字节保留上游内容**（含上游行尾空格）。
不要格式化、不要重排、不要"顺手修一下"。

> ⚠️ **当前保护规则已失效**：保真规则写在旧路径上，见本文末尾「已知问题」。

## 哪些是运行时加载的

10 个文件里只有 3 个真正被页面加载，其余 7 个是**出处留档**。

### 运行时加载（3 个）

| 文件                               | 被谁加载                         |
| ---------------------------------- | -------------------------------- |
| `globe-study.html`                 | `threeui-globe-study.js`（暗色） |
| `globe-study-light.html`           | `threeui-globe-study.js`（亮色） |
| `character-filmstrip-adapted.html` | `threeui-character-carousel.js`  |

### 出处留档（7 个，运行时零引用）

| 文件                                                                             | 说明                                    |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| `character-carousel/shaders/character-carousel/CharacterCarousel.tsx`            | 胶片组件的上游 React 实现，适配版的来源 |
| `character-carousel/shaders/character-carousel/sources/character-filmstrip.html` | 胶片的上游原始文档                      |
| `character-carousel/shaders/threeui.css`                                         | 胶片的上游样式                          |
| `shaders/text-path-studies/TextPathStudies.tsx`                                  | 地球组件的上游 React 实现               |
| `shaders/text-path-studies/sources/text-on-a-path.html`                          | 地球的上游原始文档                      |
| `shaders/text-path-studies/sources/text-on-a-path-ii.html`                       | 地球的另一版上游文档                    |
| `shaders/threeui.css`                                                            | 地球的上游样式                          |

留档的目的是**可追溯**：`character-filmstrip-adapted.html` 只替换了内容图片与
外层视觉，没有嵌入文档页；保留上游原件才能说清改了什么。

## 为什么运行时文件必须留在 `public/components/` 下

`threeui-*.js` 用 `document.currentScript.src` 作基准解析相对路径：

```js
new URL("./threeui-source/globe-study.html", document.currentScript.src).href;
```

所以 `threeui-source/` 必须与 `threeui-*.js` 同级。移走会导致地球与胶片空白。

## 登记来源与修订

| 组件                                      | 登记源                                                     | 登记修订                                |
| ----------------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| `TextPathStudies / globe-study`           | `https://threeui.com/source-code/globe-study.json`         | SHA-256 `2e21ae3b77c3` + `e5d01ff0fc47` |
| `CharacterCarousel / character-filmstrip` | `https://threeui.com/source-code/character-filmstrip.json` | SHA-256 `4c98939e0e2b`                  |

## 已知问题：保真规则指向已失效的旧路径

源件原先位于 `prototype/components/threeui-source/`，重组后移到
`public/components/threeui-source/`，但两处配置**没有跟着改**：

| 配置文件          | 现内容                                   | 应指向                                |
| ----------------- | ---------------------------------------- | ------------------------------------- |
| `.gitattributes`  | `prototype/components/threeui-source/**` | `public/components/threeui-source/**` |
| `.prettierignore` | `prototype/components/threeui-source/`   | `public/components/threeui-source/`   |

**后果**：运行 `pnpm format`（即 `prettier . --write`）会改写本目录下 10 个
要求逐字节保真的文件，直接违背保护意图。

**在修复前**，不要对本目录运行格式化命令。

## 许可与来源

ThreeUI 登记源件按其登记条款使用。上游组件的行为与限制见
`prototype/README.md` 的「素材与来源」一节。
