export interface RouteHeaderProps {
  /** 路由头上的小字标签，用页面的英文名 */
  readonly kicker: string;
  /** 页面标题 */
  readonly title: string;
  /** 本页要回答的问题与将要承载的内容 */
  readonly summary: string;
}

/**
 * 内页共用的路由头：kicker、标题和摘要。
 *
 * #3 的空壳页和 #19 的介绍/加入正文都走这一块，避免两套页头各写一份。
 */
export function RouteHeader({ kicker, title, summary }: RouteHeaderProps) {
  return (
    <div className="route-head">
      <p className="route-kicker">{kicker}</p>
      <h1 className="route-title">{title}</h1>
      <p className="route-summary">{summary}</p>
    </div>
  );
}
