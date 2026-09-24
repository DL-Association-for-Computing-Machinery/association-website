# src

站点源码根目录。分层遵循 **colocation**：只被单个页面用到的代码放在该页同级
`_components/` 或 `_hooks/`；跨页面复用的才上提到这里。

## 目录地图

| 目录               | 放什么                                        | 判断依据         |
| ------------------ | --------------------------------------------- | ---------------- |
| `app/`             | App Router 路由：页面、根布局、全局样式       | 由文件名决定路由 |
| `app/_components/` | 仅首页使用的客户端组件                        | 只服务一个页面   |
| `components/`      | 跨页面复用的 React 组件（`ui/`、`layout/`）   | 全站 / 多页共用  |
| `config/`          | 站点配置单一来源（名称、描述、URL、CDN 域名） | 需要集中改一处   |
| `data/`            | 公开内容数据（文案、荣誉、活动条目）          | 页面渲染的内容   |
| `hooks/`           | 跨组件复用的客户端逻辑                        | 多组件共用       |
| `lib/`             | 与框架无关的纯工具函数                        | 无副作用、无状态 |
| `navigation/`      | 站点导航结构                                  | 导航条目集中定义 |
| `styles/`          | 样式与设计令牌                                | 非组件级样式     |
| `types/`           | TypeScript 类型与声明                         | 跨目录共用的类型 |

## 依赖方向

`app/` → `components/` / `data/` / `navigation/` → `config/` / `types/` / `lib/`

允许下层被上层引用，不允许反向。`config/` 与 `types/` 不引用任何其他 `src/` 目录，
避免出现循环依赖。

## 导入别名

`@/*` 映射到 `src/*`（见 `tsconfig.json` 的 `paths`）。跨目录导入用别名，
同目录内的相对导入保持 `./`。

```ts
import { SITE_NAV } from "@/navigation/site-nav";
import { HERO } from "@/data";
```

## 当前实现状态

主站目前只有首页一个页面。`components/ui/`、`components/layout/`、`hooks/` 尚未有
内容，属于已定义但待填充的分层，不是遗留空目录。

## 相关文档

- 领域与技术边界：`docs/development/mvp-architecture-boundary.md`
- 页面信息架构：`docs/product/page-information-architecture.md`
- 内容审核与字段来源：`docs/content/public-content-governance.md`
