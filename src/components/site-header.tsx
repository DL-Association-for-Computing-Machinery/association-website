"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_SECTIONS } from "@/lib/site-navigation";
import { ThemeToggle } from "./theme-toggle";

/** 当前页判定：一级路径自身与其子路径都算当前页，首页只匹配 "/"。 */
function isCurrentPath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 站点头部：一条居中的悬浮导航胶囊，窄屏下换行而不是隐藏。
 *
 * 换行方案不需要开关按钮，键盘 Tab 顺序就等于视觉顺序，当前页用
 * `aria-current="page"` 同时给到样式和读屏；这是「移动端导航可用、
 * 支持键盘、焦点和当前页状态」这条验收里最省依赖的实现。
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="主导航">
        {SITE_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="nav-item"
            aria-current={isCurrentPath(pathname, section.href) ? "page" : undefined}
          >
            {section.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
