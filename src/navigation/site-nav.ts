/**
 * 站内锚点导航。
 *
 * 主站只有首页一个页面，其余能力由各微服务子域承担，因此导航是页内锚点，
 * 不是跨页路由；不生成未实现页面的链接。
 *
 * TODO(子域): 各微服务的子域地址确定后，在此追加外部入口（如 OJ、ECPC）。
 * 届时使用真实 <a href> 并附描述性锚文本，不用客户端跳转，便于爬虫跟随。
 */

export interface NavItem {
  /** 导航显示名称。 */
  title: string;
  /** 页内锚点，对应首页各区块的 id。 */
  url: string;
}

export const SITE_NAV: NavItem[] = [
  { title: "关于协会", url: "#about" },
  { title: "竞赛荣誉", url: "#honors" },
  { title: "活动回顾", url: "#activities" },
  { title: "学习方向", url: "#learning" },
  { title: "加入我们", url: "#join" },
];
