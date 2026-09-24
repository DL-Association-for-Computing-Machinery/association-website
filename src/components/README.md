# components

组件分层规则（colocation）：每个功能模块自带页面、组件与逻辑，跨页面复用的才上提。

| 目录      | 放什么                             | 判断依据       |
| --------- | ---------------------------------- | -------------- |
| `ui/`     | 无业务含义的基础 UI 原子组件       | 换个项目也能用 |
| `layout/` | 站点框架：顶部导航、页脚、移动导航 | 全站共用外壳   |

页面局部组件**不放这里**，放在该页同级 `_components/` 下（`_` 前缀目录不产生路由段，也不跨页面复用）。

## 当前实际状态

主站只有首页一个页面，其余能力由各微服务子域承担，因此 `ui/` 与 `layout/`
目前都还是空的 —— 首页不需要跨页共享的布局外壳，页内区块导航由
`src/navigation/site-nav.ts` 提供锚点。

首页的交互组件（开屏、主题切换、彩纸、速度带、彩框、脚本加载）都是**仅首页使用**，
按上面的规则就近放在 `src/app/_components/`，不在此目录。

原型的 15 个 Web Components 是原生自定义元素（非 React 组件），由
`public/components/*.js` 提供、`src/app/_components/prototype-scripts.tsx` 加载，
类型声明见 `src/types/custom-elements.d.ts`。
