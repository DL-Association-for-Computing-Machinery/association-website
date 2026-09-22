import Link from "next/link";
import { SITE_SECTION_LINKS } from "@/lib/site-navigation";

/**
 * 无效路径：不留下空白页，给出站点现有的六个板块作为出口。
 * 页面用 h1 承载状态说明，板块名用 h2，保持标题层级从一级起连续。
 */
export default function NotFound() {
  return (
    <section className="section">
      <div className="shell">
        <div className="route-head">
          <p className="section__kicker">404</p>
          <h1 className="route-head__title">没有找到这个页面</h1>
          <p className="route-head__lede">
            这个地址可能已经变更，或者从未存在。下面是站点现有的板块。
          </p>
        </div>
        <nav aria-label="站点板块">
          <ul className="direction-list">
            {SITE_SECTION_LINKS.map((section) => (
              <li className="direction-item" key={section.href}>
                <h2>
                  <Link href={section.href}>{section.label}</Link>
                </h2>
                <p>{section.summary}</p>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
