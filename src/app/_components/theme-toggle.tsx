"use client";

import { useCallback, useState } from "react";

/**
 * 昼夜切换。
 *
 * 从原型 main.js 移植：默认浅色，切换后写入 localStorage；
 * 支持时用 View Transition 从点击位置扩散出新主题，不支持时直接切换。
 * 初始主题由 layout 的内联脚本在首帧前写入 html，避免闪白，
 * 这里只维护按钮自身的 aria 状态。
 */

const THEME_KEY = "ecut-ca-prototype-theme";
const DARK_CLASS = "theme-dark";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.classList.contains(DARK_CLASS) ? "dark" : "light";
}

function paintTheme(theme: Theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle(DARK_CLASS, isDark);
  document.documentElement.dataset.theme = theme;
}

function writeStoredTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.warn("[home] 无法保存主题偏好：", error);
  }
}

function supportsCircularReveal() {
  return (
    typeof document.startViewTransition === "function" &&
    typeof document.documentElement.animate === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(max-width: 48rem)").matches
  );
}

export function ThemeToggle() {
  // 初始值由内联脚本决定，水合后从 DOM 读取一次即可。
  const [isDark, setIsDark] = useState(false);

  const switchTheme = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";

    if (!supportsCircularReveal()) {
      paintTheme(next);
      writeStoredTheme(next);
      setIsDark(next === "dark");
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

    const root = document.documentElement;
    root.dataset.themeTransition = "active";

    const transition = document.startViewTransition(() => {
      paintTheme(next);
      writeStoredTheme(next);
      setIsDark(next === "dark");
    });

    const cleanup = () => {
      delete root.dataset.themeTransition;
    };

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 420,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
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
