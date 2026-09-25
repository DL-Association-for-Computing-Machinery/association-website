import { EmptyState, type EmptyStateAction } from "./empty-state";
import { RouteHeader } from "./route-header";
import { findPageById, type SitePageId } from "@/lib/site-navigation";

/**
 * 空状态里的一个站内出口。
 *
 * 六类页面之间互链时直接写页面标识，路由与文案都从 `SITE_PAGES` 取，
 * 避免在多个文件里重复硬编码；指向首页某个区块这类锚点则直接给 href 与文案。
 */
export type RouteLink = SitePageId | EmptyStateAction;

export interface RoutePageProps {
  /** 路由头上的小字标签，用页面的英文名，与设计简报的排版一致 */
  readonly kicker: string;
  /** 页面标题，取自 `docs/product/page-information-architecture.md` 的页面名 */
  readonly title: string;
  /** 本页要回答的问题与将要承载的内容 */
  readonly summary: string;
  /** 空状态标题 */
  readonly emptyTitle: string;
  /** 空状态说明：讲清现在没有内容、为什么 */
  readonly emptyBody: string;
  /** 空状态里给出的出站口 */
  readonly related?: readonly RouteLink[];
}

export function toRouteAction(link: RouteLink): EmptyStateAction {
  if (typeof link !== "string") {
    return link;
  }

  const page = findPageById(link);

  return { href: page.href, label: page.title };
}

/**
 * 内页外壳：路由头 + 明确空状态。
 *
 * #3 只负责「六类页面各有一条可访问路由、非完整内容页给出明确空状态」，
 * 真实内容由 #4/#5/#16–#20 填入。所以这里不预造数据、不画假卡片，
 * 只把「这一页要回答什么」和「现在为什么还是空的、下一步去哪」写清楚。
 *
 * 出口一律指向真实存在的路由或首页区块，不生成无效按钮。
 */
export function RoutePage({
  kicker,
  title,
  summary,
  emptyTitle,
  emptyBody,
  related = [],
}: RoutePageProps) {
  const actions: EmptyStateAction[] = [
    ...related.map(toRouteAction),
    { href: "/", label: "返回首页" },
  ];

  return (
    <main id="main" className="route-main">
      <div className="route-inner">
        <RouteHeader kicker={kicker} title={title} summary={summary} />

        <EmptyState title={emptyTitle} body={emptyBody} actions={actions} />
      </div>
    </main>
  );
}
