"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SITE_DOCK_ITEMS, findPageByPathname } from "@/lib/site-navigation";

/**
 * 顶栏 Dock 的「当前状态」标记。
 *
 * 首页是一页畅览，所以按视口位置标出当前区块，用基线 CSS 已有的
 * `[aria-current="location"]`；其余路由则把对应那一项标成 `[aria-current="page"]`，
 * 让人知道自己落在哪一类页面里。
 *
 * 直接改 DOM 而不是走 React 状态：`<dia-dock>` 会在 connectedCallback 里
 * 量宽、加内联样式、改自己的子节点，任何由 React 重新渲染这批子节点的机会都可能打架。
 */
export function DockCurrentSection() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".dock-item[data-section-id]"),
    );

    const clearCurrent = () => {
      for (const item of items) {
        item.removeAttribute("aria-current");
      }
    };

    if (pathname !== "/") {
      clearCurrent();

      const page = findPageByPathname(pathname);
      const current = page
        ? items.find((item) => item.dataset.sectionId === page.homeSectionId)
        : undefined;

      current?.setAttribute("aria-current", "page");

      return;
    }

    // 必须按文档顺序取，不能直接用 Dock 的顺序：`#activities` 嵌在 `#about` 里，
    // 两者在文档中的先后与 Dock 上的排布并不一致。下面「取最后一个越过判据的区块」
    // 依赖的就是文档顺序，顺序错了会标到相邻区块上。
    const sections = SITE_DOCK_ITEMS.map((item) => document.getElementById(item.sectionId))
      .filter((section): section is HTMLElement => section !== null)
      .sort((first, second) =>
        first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );

    if (sections.length === 0) {
      clearCurrent();

      return;
    }

    let scheduledFrame = 0;

    const syncCurrentSection = () => {
      scheduledFrame = 0;

      // 视口 40% 处作为判据：已经越过这条线的最后一个区块就是当前区块。
      const threshold = window.innerHeight * 0.4;
      let active: HTMLElement | null = null;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) {
          active = section;
        }
      }

      clearCurrent();

      if (!active) {
        return;
      }

      const activeId = active.id;
      const item = items.find((candidate) => candidate.dataset.sectionId === activeId);
      item?.setAttribute("aria-current", "location");
    };

    const scheduleSync = () => {
      if (scheduledFrame === 0) {
        scheduledFrame = window.requestAnimationFrame(syncCurrentSection);
      }
    };

    syncCurrentSection();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });

    return () => {
      if (scheduledFrame !== 0) {
        window.cancelAnimationFrame(scheduledFrame);
      }

      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      clearCurrent();
    };
  }, [pathname]);

  return null;
}
