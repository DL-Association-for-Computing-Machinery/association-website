import Link from "next/link";
import { DockCurrentSection } from "./dock-current-section";
import { ThemeToggle } from "./theme-toggle";
import { SITE_DOCK_ITEMS } from "@/lib/site-navigation";

/**
 * 站点头部：一条居中的 Dock。
 *
 * 结构和类名照 Jasper #30 首页基线（`public/prototype/index.html`）：同样是
 * `<header class="site-header"> > .topbar > nav.primary-navigation > <dia-dock>`，
 * 五项区块导航 + 末位的昼夜切换。区别只有两点，都为了主站的多页结构：
 * - 导航用 `<Link>` 指向 `/#<区块>`，首页内仍是区块跳转，从其他页面点击则回到首页对应区块；
 * - 区块链接带上 `data-section-id`，供 DockCurrentSection 标当前状态。
 *
 * 这一层是服务端组件：`<dia-dock>` 会改写自己的子节点，保持它不被客户端重新渲染。
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="topbar">
        <nav id="primary-navigation" className="primary-navigation" aria-label="主导航">
          <dia-dock scale="1.35" distance="140">
            {SITE_DOCK_ITEMS.map((item) => (
              <Link
                key={item.id}
                className="dock-item"
                href={item.href}
                data-section-id={item.sectionId}
              >
                <dia-text-reveal
                  className="dock-item__label"
                  text={item.label}
                  trigger="hover"
                  duration="0.9"
                  text-color="var(--dock-label-color, var(--text))"
                >
                  {item.label}
                </dia-text-reveal>
              </Link>
            ))}

            <ThemeToggle />
          </dia-dock>
        </nav>
      </div>

      <DockCurrentSection />
    </header>
  );
}
