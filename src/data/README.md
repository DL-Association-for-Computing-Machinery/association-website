# data

公开内容数据的落地位置。页面渲染的文案、荣誉、活动条目都从这里取，
不写死在 JSX 里。

## 文件

| 文件          | 说明                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| `homepage.ts` | 首页各区块的内容（HERO / ABOUT / HONORS / ACTIVITIES / LEARNING / JOIN / FOOTER） |
| `index.ts`    | 统一出口，转出 `homepage.ts` 的全部导出                                           |

```ts
import { HERO, HONORS } from "@/data";
```

## 内容红线（必须遵守）

本目录所有文案**逐条取自 `docs/content/launch-content-pack.md` 的登记表**，
只收录审核状态为「可发布」的条目。素材来源编号对应素材包「来源登记」表的 S01–S09。

**不得新增任何未经核验的事实**：

- 不写协会成立年份 —— 材料间存在冲突，未定。
- 不写招新日期、不编造报名入口 —— 无已核验入口时只给公众号名称指引。
- 不扩大赛事级别，不把个人成绩写作协会团体成绩。
- 不用参赛经历、省级奖项或重复的个人记录凑数。

## 已记录的两个内容缺口

1. **首页四项全国性荣誉**：产品要求首屏展示四项（见
   `docs/product/page-information-architecture.md`），当前只有两项达到证据粒度
   （CCPC 全国邀请赛南昌银牌、蓝桥杯 B 组全国二等奖）。`HONORS.items` 里列的十条
   **不替代**那项要求，也不用来凑足四条。
2. **荣誉排序**：按素材包「越靠上越新、越靠前越强」口径排列；同一年内多条的顺序
   属初步排列，待内容负责人确认后定稿。

## 与类型系统的关系

条目结构对应 `src/types/content.ts` 的领域模型：`Activity`、`Achievement`、
`Article`、`Person`、`Link`。**只有 `status: "published"` 的条目暴露给页面**，
`draft` / `review` 不进构建。

日期精度用 `DatePrecision` 如实记录（`"day"` / `"year"` / `"edition"` / `"unknown"`），
原始材料只给到届次或年份时不要伪造成具体日期。

## 待补

完整的内容接入路径（素材包登记表 → 类型 → 过滤 → 页面）由 #4 实现。
届时本目录会从「首页内联文案」过渡到「按实体拆分的结构化内容文件」。

## 相关

- 素材包与来源登记：`docs/content/launch-content-pack.md`
- 审核与脱敏规范：`docs/content/public-content-governance.md`
- 类型定义：`src/types/README.md`
