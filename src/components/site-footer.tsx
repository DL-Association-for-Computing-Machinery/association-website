"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_FOOTER_COPYRIGHT, SITE_FOOTER_NAME, SITE_FOOTER_POLICIES } from "@/lib/home-content";
import { SITE_PAGES } from "@/lib/site-navigation";

/**
 * 页面收尾区块与页脚，结构和类名照首页基线。
 *
 * 相对基线只多了一样东西：`.site-footer__pages` —— 六类页面的统一入口。
 * 顶栏 Dock 按基线是首页区块导航，六类路由需要一个所有页面都一致的入口，
 * 放在页脚不新增原型里没有的悬浮元素。当前页用 `aria-current="page"` 标出。
 */
export function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="closing-band" aria-label="网站页脚">
      <div className="closing-band__inner">
        <p className="closing-band__name">{SITE_FOOTER_NAME}</p>

        <div className="site-footer">
          <nav aria-label="六类页面">
            <ul className="site-footer__pages">
              {SITE_PAGES.map((page) => (
                <li key={page.id}>
                  <Link href={page.href} aria-current={page.href === pathname ? "page" : undefined}>
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer__links" aria-label="政策与网站说明">
            {SITE_FOOTER_POLICIES.map((policy) => (
              <details key={policy.summary} className="site-footer__policy">
                <summary>{policy.summary}</summary>
                <p>{policy.body}</p>
              </details>
            ))}
          </nav>

          <p className="site-footer__copyright">{SITE_FOOTER_COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
