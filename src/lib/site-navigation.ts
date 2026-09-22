/**
 * 站点六个一级板块的单一数据源。
 *
 * 导航、页脚与各路由的标题都从这里取，避免出现「导航有、页脚没有」
 * 或拼错路径这类分歧。新增板块只改这里。
 *
 * 板块范围来自 PRODUCT.md「首版覆盖首页、协会介绍、活动、成果、知识与文章、
 * 加入我们」；本轮（#3）只交付外壳与真实样例首页，各板块内容的接入由
 * #16–#19 负责。
 */

export type SiteSection = {
  /** 路由路径，首页为 "/"。 */
  href: string;
  /** 导航与页脚使用的短标签。 */
  label: string;
  /** 页面标题。 */
  title: string;
  /** 一句话说明该板块对外提供什么；同时作为该页的 meta description。 */
  summary: string;
};

export const SITE_SECTIONS: readonly SiteSection[] = [
  {
    href: "/",
    label: "首页",
    title: "首页",
    summary: "协会定位、活动回顾、已核验竞赛荣誉与加入入口。",
  },
  {
    href: "/about",
    label: "协会介绍",
    title: "协会介绍",
    summary: "协会是谁、在做什么，以及训练与项目实践的组织方式。",
  },
  {
    href: "/activities",
    label: "活动",
    title: "活动",
    summary: "讲座、培训、模拟赛与校园赛事的公开回顾。",
  },
  {
    href: "/honors",
    label: "成果",
    title: "成果",
    summary: "成员在 ICPC、CCPC、蓝桥杯等竞赛中的已核验成绩。",
  },
  {
    href: "/knowledge",
    label: "知识",
    title: "知识",
    summary: "面向零基础同学的学习路径与公开文章。",
  },
  {
    href: "/join",
    label: "加入我们",
    title: "加入我们",
    summary: "从一次交流、一次训练开始的参与方式。",
  },
];

/** 首页之外的一级板块；页脚导航使用。 */
export const SITE_SECTION_LINKS: readonly SiteSection[] = SITE_SECTIONS.filter(
  (section) => section.href !== "/",
);

export function findSection(href: string): SiteSection {
  const section = SITE_SECTIONS.find((item) => item.href === href);
  if (!section) {
    throw new Error(`未登记的板块路径：${href}`);
  }
  return section;
}
