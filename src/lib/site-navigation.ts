/**
 * 站内导航的唯一来源。
 *
 * 首页基线的顶栏 Dock 是页内区块导航，而 #3 要求六类页面各有一条可访问的路由，
 * 两者共用这里的定义，避免各写一份、各自漂移：
 * - `SITE_PAGES`：六类页面的真实路由，供页脚导航与内页互链使用；
 * - `SITE_DOCK_ITEMS`：顶栏 Dock 的显示顺序与文案，照 Jasper #30 原型原文，
 *   链接写成 `/#<区块 id>`，在首页内是区块跳转，从其他页面点击则回到首页对应区块。
 */

export type SitePageId = "home" | "about" | "activities" | "honors" | "knowledge" | "join";

export interface SitePage {
  /** 页面标识，同时用于 Dock 与页脚的匹配 */
  readonly id: SitePageId;
  /** 真实路由 */
  readonly href: string;
  /** 正式页面名，用于内页标题与页脚导航 */
  readonly title: string;
  /** 该页面在首页中对应区块的 id；首页自身没有对应区块，为 null */
  readonly homeSectionId: string | null;
}

/** 六类页面，顺序按 `docs/product/page-information-architecture.md` 的表格。 */
export const SITE_PAGES: readonly SitePage[] = [
  { id: "home", href: "/", title: "首页", homeSectionId: null },
  { id: "about", href: "/about", title: "协会介绍", homeSectionId: "about" },
  { id: "activities", href: "/activities", title: "活动", homeSectionId: "activities" },
  { id: "honors", href: "/honors", title: "成果", homeSectionId: "honors" },
  { id: "knowledge", href: "/knowledge", title: "知识与文章", homeSectionId: "learning" },
  { id: "join", href: "/join", title: "加入我们", homeSectionId: "join" },
] as const;

/** 顶栏 Dock 的显示顺序，照 Jasper #30 原型（探索计协 → 竞赛荣誉 → 活动回顾 → 学习方向 → 加入我们）。 */
const DOCK_ORDER: readonly Exclude<SitePageId, "home">[] = [
  "about",
  "honors",
  "activities",
  "knowledge",
  "join",
];

/** Dock 文案，逐字取自首页基线，不改写。 */
const DOCK_LABELS: Readonly<Record<Exclude<SitePageId, "home">, string>> = {
  about: "探索计协",
  honors: "竞赛荣誉",
  activities: "活动回顾",
  knowledge: "学习方向",
  join: "加入我们",
};

export interface SiteDockItem {
  readonly id: SitePageId;
  /** 首页中的区块 id，滚动定位与当前区块标记都用它 */
  readonly sectionId: string;
  readonly label: string;
  /** 指向首页对应区块的链接 */
  readonly href: string;
}

export const SITE_DOCK_ITEMS: readonly SiteDockItem[] = DOCK_ORDER.map((id) => {
  const page = findPageById(id);

  if (page.homeSectionId === null) {
    throw new Error(`顶栏区块导航缺少首页锚点：${id}`);
  }

  return {
    id,
    sectionId: page.homeSectionId,
    label: DOCK_LABELS[id],
    href: `/#${page.homeSectionId}`,
  };
});

export function findPageById(id: SitePageId): SitePage {
  const page = SITE_PAGES.find((candidate) => candidate.id === id);

  if (!page) {
    throw new Error(`未知的页面标识：${id}`);
  }

  return page;
}

/** 按路径名找页面；找不到时返回 null。 */
export function findPageByPathname(pathname: string): SitePage | null {
  return SITE_PAGES.find((page) => page.href === pathname) ?? null;
}

/** 除首页外的五类页面，内页之间互链时用。 */
export const SITE_SECTION_PAGES: readonly SitePage[] = SITE_PAGES.filter(
  (page) => page.id !== "home",
);
