# components

跨页面复用的 React 组件。分层遵循 **colocation**：只服务单个页面的组件不放这里，
放该页同级的 `_components/`。

## 目录规划

| 目录      | 放什么                             | 判断依据       |
| --------- | ---------------------------------- | -------------- |
| `ui/`     | 无业务含义的基础 UI 原子组件       | 换个项目也能用 |
| `layout/` | 站点框架：顶部导航、页脚、移动导航 | 全站共用外壳   |

## 当前状态：`ui/` 与 `layout/` 均为空

这是**已定义但待填充**的分层，不是遗留空目录。原因：

- 主站目前只有首页一个页面，其余能力由各微服务子域承担。
- 首页不需要跨页共享的布局外壳；页内区块导航由 `src/navigation/site-nav.ts`
  提供锚点。
- 首页的交互组件（开屏、主题切换、彩纸、速度带、脚本加载）**仅首页使用**，
  按 colocation 规则就近放在 `src/app/_components/`。

## 什么时候往这里加东西

出现下列任一情况时，把组件从 `_components/` 上提到本目录：

- 第二个页面也要用同一个组件。
- 组件的 props 需要脱离当前页面语境才有意义（说明它已通用化）。
- 组件被抽成设计系统的一部分。

上提时要同时决定它属于 `ui/` 还是 `layout/`：判断标准是「换个项目还能用吗」——
能用是 `ui/`，绑定本站框架则是 `layout/`。

## 不属于本目录的组件

原型提供 15 个 **原生自定义元素**（13 个 `dia-*` + 2 个 `threeui-*`，非 React 组件），
由 `public/components/*.js` 提供、`src/app/_components/prototype-scripts.tsx` 加载，
JSX 类型声明在 `src/types/custom-elements.d.ts`。不要把它们改写成 React 组件，
也不要移进本目录。

## 相关

- 页面局部组件：`src/app/_components/README.md`
- 分层总览：`src/README.md`
- 原型组件运行时：`public/components/README.md`
