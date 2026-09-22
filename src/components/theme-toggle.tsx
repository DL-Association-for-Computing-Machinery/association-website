"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ecut-acm-theme";

/**
 * 深浅外观切换。
 *
 * 真值来源始终是 `html.theme-dark`：首次访问由 layout 内联脚本按系统偏好
 * 决定，用户手动切换后写入 localStorage。这里用 useSyncExternalStore 直接
 * 订阅该 class，避免在 effect 里同步 setState，也避免服务端与客户端首帧
 * 不一致；两个图标都渲染，由 CSS 按 class 切换可见性，所以不存在闪屏。
 */
function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("theme-dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleClick() {
    const next = !isDark;
    document.documentElement.classList.toggle("theme-dark", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // 隐私模式下 localStorage 可能不可用；此时仅本次会话生效。
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleClick}
      aria-pressed={isDark}
    >
      <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
        ☾
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
        ☀
      </span>
      <span className="visually-hidden">{isDark ? "切换到浅色外观" : "切换到深色外观"}</span>
    </button>
  );
}
