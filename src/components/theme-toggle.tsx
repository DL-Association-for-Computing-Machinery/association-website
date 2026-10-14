"use client";

import { type MouseEvent, useCallback, useSyncExternalStore } from "react";
import { SITE_THEME_DARK_CLASS, SITE_THEME_STORAGE_KEY } from "@/lib/site-runtime";

/**
 * 昼夜切换，行为照首页基线的 main.js：
 * 默认浅色，手动切换后写入 localStorage；支持 View Transitions 时从点击位置圆形扩散。
 * 主题状态落在 `html.theme-dark` 上，所以这里订阅 documentElement 的 class 变化，
 * 而不是自己存一份 state —— 首帧由 layout 里的内联脚本决定，服务端与客户端不会不一致。
 *
 * 存储键与类名来自 `site-runtime`：首帧内联脚本要用同一组值做主题恢复，两处不能各写一份。
 *
 * 圆扩散用浏览器原生的 View Transitions，类型取自 lib.dom；
 * 老浏览器上这个 API 不存在，所以调用点先做 `typeof` 判断再走降级分支。
 */

function subscribeToTheme(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  return () => observer.disconnect();
}

function getThemeSnapshot(): boolean {
  return document.documentElement.classList.contains(SITE_THEME_DARK_CLASS);
}

/** 服务端与水合首帧统一按浅色渲染，与内联脚本的默认值一致。 */
function getServerThemeSnapshot(): boolean {
  return false;
}

function supportsCircularReveal(): boolean {
  if (typeof document.startViewTransition !== "function") {
    return false;
  }

  if (typeof document.documentElement.animate !== "function") {
    return false;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  return !window.matchMedia("(max-width: 48rem)").matches;
}

function paintTheme(theme: "light" | "dark"): void {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle(SITE_THEME_DARK_CLASS, isDark);
  document.documentElement.dataset.theme = theme;

  try {
    window.localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("[site] 无法保存主题偏好：", error);
  }
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  const switchTheme = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const next = document.documentElement.classList.contains(SITE_THEME_DARK_CLASS)
      ? "light"
      : "dark";

    if (!supportsCircularReveal()) {
      paintTheme(next);
      return;
    }

    // 从点击位置扩散出新主题，中心落在按钮上。
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || box.left;
    const y = event.clientY || box.top;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.dataset.themeTransition = "active";

    const transition = document.startViewTransition(() => paintTheme(next));
    const cleanup = () => {
      delete document.documentElement.dataset.themeTransition;
    };

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: 420,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          } as KeyframeAnimationOptions,
        );
      })
      .catch(() => {
        // 浏览器跳过过渡时无需补偿，主题已在回调中生效。
      });

    transition.finished.then(cleanup, cleanup);
  }, []);

  return (
    <button
      className="dock-item dock-item--theme theme-toggle"
      type="button"
      aria-label={isDark ? "切换浅色主题" : "切换深色主题"}
      aria-pressed={isDark}
      onClick={switchTheme}
    >
      <span className="theme-icon" aria-hidden="true">
        <span className="theme-icon-moon">☾</span>
        <span className="theme-icon-sun">☀</span>
      </span>
    </button>
  );
}
