/**
 * 协会介绍与加入页的公开文案。
 *
 * 全部逐字取自 `docs/content/launch-content-pack.md`（2026-09-19 整理），
 * 不新增材料里没有的地点、人数、成立年份、报名入口或内部成员名单。
 * 本模块只承载 #19 的页面文案；统一内容模型由 #4 收敛，届时本模块整体替换。
 * 不要从 `src/lib/home-content.ts` 引用或复制它的筛选逻辑。
 */

export const ABOUT_LOGO = {
  src: "/prototype/assets/association-logo.png",
  alt: "东华理工大学计算机协会 Logo",
  width: 640,
  height: 640,
} as const;

export const ABOUT_GROUP_PHOTO = {
  src: "/prototype/assets/association-group.webp",
  alt: "协会成员在教室内合影",
  width: 1600,
  height: 1200,
} as const;

export const ABOUT_INTRO_PARAGRAPHS = [
  "东华理工大学计算机协会是由校内计算机科学和信息技术爱好者组成的学术科技类社团。我们通过技术讲座、主题分享、算法培训和模拟赛，为成员提供学习、交流与合作的机会。",
  "协会组织成员参与 ICPC、CCPC、蓝桥杯等编程竞赛，也参与组织 ECPC 等校园赛事。除了竞赛训练，我们鼓励项目实践与跨专业交流，让同学们在合作中运用技术、解决问题。",
  "活动材料与复盘经验持续沉淀在协会知识库，官网会精选其中适合公开的活动记录、成果与学习资料，方便更多同学了解和参与。",
] as const;

export const ABOUT_DIRECTIONS = [
  {
    title: "讲座与主题分享",
    body: "我们通过技术讲座、主题分享，为成员提供学习、交流与合作的机会。",
  },
  {
    title: "算法培训与模拟赛",
    body: "我们通过算法培训和模拟赛，为成员提供学习、交流与合作的机会。协会组织成员参与 ICPC、CCPC、蓝桥杯等编程竞赛，也参与组织 ECPC 等校园赛事。",
  },
  {
    title: "项目实践与跨专业交流",
    body: "除了竞赛训练，我们鼓励项目实践与跨专业交流，让同学们在合作中运用技术、解决问题。",
  },
] as const;

export const ABOUT_PEOPLE_EMPTY = {
  title: "暂无已核验的公开成员与指导教师信息",
  body: "当前公开材料不含已核验的成员名单或指导教师介绍，因此不在此补写内部名单。可先浏览已核验的竞赛成果，或继续阅读本页简介。",
} as const;

export const ABOUT_TIMELINE = [
  {
    date: "2025-12-27",
    title: "第三届东华理工大学程序设计竞赛（ECPC）",
    summary:
      "依据第三届 ECPC 参赛手册，赛事采用团队程序设计形式，通过算法问题检验编码、协作与解题能力。此节点为历史赛事资料，不提供当前报名或在线判题入口。",
  },
  {
    date: "2026-05-12",
    title: "AI 提示词挑战赛",
    summary:
      "计算机协会在社团文化艺术节中开展 AI 提示词挑战赛，同学们通过文案生成、创意表达和信息整理任务，体验提示词如何影响输出结果。展示为活动回顾，报名状态为已结束。",
  },
] as const;

export const ABOUT_JOIN_CTA = "去加入我们";

export const JOIN_PAGE_TITLE = "从一次交流、一次训练开始。";

export const JOIN_PATHS = [
  {
    id: "beginner",
    title: "零基础",
    body: "可以先浏览入门文章与活动回顾，了解自己的兴趣方向。",
    links: [
      { page: "knowledge" as const, label: "入门文章" },
      { page: "activities" as const, label: "活动回顾" },
    ],
  },
  {
    id: "freshman",
    title: "新生",
    body: "可以从技术分享与项目实践开始。",
    links: [{ page: "knowledge" as const, label: "知识与文章" }],
  },
  {
    id: "contest",
    title: "竞赛",
    body: "可以了解训练与模拟赛。",
    links: [{ page: "activities" as const, label: "活动" }],
  },
] as const;

export const JOIN_WECHAT_NAME = "计协ECUT";

export const JOIN_CONTACT_BODY = "在微信中搜索公众号「计协ECUT」，查看协会发布的活动与招新信息。";

export const JOIN_SIGNUP_EMPTY = {
  title: "暂无已核验的报名入口",
  body: "当前页面暂无已核验的报名入口。可先了解协会活动，并关注公众号「计协ECUT」的后续信息。",
} as const;

export const HOME_ABOUT_PAGE_LINK = "阅读完整介绍";

export const HOME_JOIN_PAGE_LINK = "了解加入方式";
