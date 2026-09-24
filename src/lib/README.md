# lib

与框架无关的纯工具函数。**无 React、无副作用、无全局状态**——
需要 `useState` / `useEffect` 的放 `src/hooks/`，需要 JSX 的放 `src/components/`。

## 文件

| 文件       | 说明                   |
| ---------- | ---------------------- |
| `utils.ts` | `cn()`：拼接 className |

## cn()

```ts
import { cn } from "@/lib/utils";

<div className={cn("base", isActive && "active", size === "lg" && "text-lg")} />
```

过滤掉 `false` / `null` / `undefined` 后拼接，用于条件类名。

**项目未引入 `clsx` / `tailwind-merge`**，`cn()` 只做过滤拼接，不解决 Tailwind
类冲突（后写的类不会自动覆盖前面的）。若将来确实需要处理冲突，再单独评估引入
`tailwind-merge`，见 `docs/development/mvp-architecture-boundary.md` 的选型原则。

## 什么放这里 / 什么不放

- 放：纯计算、格式化、字符串处理、无副作用的数据变换。
- 不放：内容数据（→ `src/data/`）、配置常量（→ `src/config/`）、
  类型定义（→ `src/types/`）。
