# 执行分工与依赖

2026-09-19。GitHub Issue 的 Assignee、最新正文和原生依赖为执行依据。本表不表示代码已开工；本次仅完成分工与规范。统一遵守 [开发规范](team-delivery.md)。

## 官网 MVP

首页新增前置：[#25 总票](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/25) 组织七人独立 Demo；[#33 共同评审](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/33) 原生依赖七份提交，#3 原生依赖 #33。按 [任务书](../product/homepage-demo-round.md) 实施，Mannoyu 协调、JieE-212 复核，全员及需求方参与评选。

| 原型票                                                                                         | 主负责人        | 提交完整性核验  |
| ---------------------------------------------------------------------------------------------- | --------------- | --------------- |
| [#26](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/26) | daanlsz         | Drb-code-ing    |
| [#27](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/27) | Drb-code-ing    | Guwen-yue       |
| [#28](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/28) | Guwen-yue       | hushu1232       |
| [#29](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/29) | hushu1232       | Jasper-Liao2026 |
| [#30](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/30) | Jasper-Liao2026 | JieE-212        |
| [#31](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/31) | JieE-212        | Mannoyu         |
| [#32](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/32) | Mannoyu         | daanlsz         |

七张原型票无 Issue 前置且已获独立原型授权。#25 是它们及 #33 的父票，不作为反向阻塞项。正式应用实现仍按原有暂停约束执行。

| Issue                                                                                          | 可验收交付                             | 主负责人        | 交叉审阅        | 前置                       |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- | --------------- | --------------- | -------------------------- |
| [#2](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/2)   | 内容补证与品牌基线，仍缺两项全国性荣誉 | daanlsz         | Guwen-yue       | 无；最终验收缺证           |
| [#3](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/3)   | 可构建外壳、样例首页与六类路由         | Drb-code-ing    | JieE-212        | #33 定稿、正式代码阶段获准 |
| [#4](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/4)   | 公开内容到构建检查的完整路径           | hushu1232       | Jasper-Liao2026 | #3                         |
| [#16](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/16) | 活动筛选、详情与返回                   | Guwen-yue       | JieE-212        | #4                         |
| [#17](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/17) | 首页荣誉到成果浏览                     | daanlsz         | Drb-code-ing    | #4                         |
| [#18](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/18) | 公开知识列表与阅读                     | Jasper-Liao2026 | hushu1232       | #4                         |
| [#19](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/19) | 协会介绍到加入指引                     | JieE-212        | Guwen-yue       | #4                         |
| [#20](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/20) | PR 检查与静态产物预览                  | Mannoyu         | hushu1232       | #4                         |
| [#5](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/5)   | 页面集成及最终内容验收                 | Mannoyu         | Drb-code-ing    | #2、#16–#19                |
| [#6](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/6)   | 全站可访问性与发布检查                 | JieE-212        | Drb-code-ing    | #5                         |
| [#7](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/7)   | 发布、smoke test 与回滚手册            | Mannoyu         | hushu1232       | #6、#20；部署入口及权限    |

#5 是 #16–#19 的父票，#7 是 #20 的父票。父票负责人协调与核验集成，不重做子票。#3 → #4 → 四个页面子票与 #20 可并行 → #5 → #6 → #7。#2 的证据缺口只阻塞最终页面验收，不再阻塞基础外壳与内容契约；保留四项要求，不静默改成两项。

## 学习模块后续阶段

| Issue                                                                                          | 可验收交付                   | 主负责人        | 交叉审阅        | 前置                      |
| ---------------------------------------------------------------------------------------------- | ---------------------------- | --------------- | --------------- | ------------------------- |
| [#8](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/8)   | 后续课程 Epic 与范围协调     | Mannoyu         | Jasper-Liao2026 | 聚合票，不直接实现        |
| [#9](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/9)   | 三档读者、边界与生成服务契约 | daanlsz         | Mannoyu         | 无，可写规格              |
| [#10](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/10) | 仓库输入与固定版本           | hushu1232       | Drb-code-ing    | #7、#9、#23；后续阶段获准 |
| [#12](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/12) | 快照到课程蓝图               | Guwen-yue       | Jasper-Liao2026 | #10                       |
| [#11](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/11) | 蓝图到章节教材               | Jasper-Liao2026 | daanlsz         | #12                       |
| [#13](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/13) | 课程入口与顺序阅读           | Drb-code-ing    | JieE-212        | #11                       |
| [#14](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/14) | 复习与闯关候选契约文档       | JieE-212        | Guwen-yue       | #9；不增加预留代码        |

#9–#14 均为 #8 原生子票。文档规划可以提前，后续实现不混入静态官网 MVP。

## 独立无代码决策

| Issue                                                                                          | 交付                                  | 主负责人  | 交叉审阅 | 前置 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------- | --------- | -------- | ---- |
| [#21](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/21) | OJ 选型、沙箱与运维边界、后续票据草案 | hushu1232 | Mannoyu  | 无   |
| [#22](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/22) | ECPC 数据、排名口径与托管决策         | Guwen-yue | daanlsz  | 无   |
| [#23](https://github.com/DL-Association-for-Computing-Machinery/association-website/issues/23) | 五类角色权限矩阵与身份边界            | Mannoyu   | JieE-212 | 无   |

现在可推进 #26–#32 独立原型、#2 补证以及 #9、#21、#22、#23 文档任务；#14 等 #9。正式应用代码票保持 blocked，不能将原型授权扩大为正式开发。仓库状态标签使用现有 `status:*`，不额外建立重复的 Skill 标签体系。
