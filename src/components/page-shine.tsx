"use client";

import { useEffect, useRef } from "react";

/**
 * 整页流动彩框，照首页基线的 `.page-shine`。
 *
 * 这里只做一件事：标签页切到后台时给它挂 `is-idle` 停帧（那条渐变每帧都在重绘）。
 * 可见性用 DOM 类切换而不是 React 状态，避免为了一个纯装饰层触发重渲染。
 */
export function PageShine() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frameRef.current;

    if (!node) {
      return;
    }

    const syncIdleState = () => {
      node.classList.toggle("is-idle", document.hidden);
    };

    syncIdleState();
    document.addEventListener("visibilitychange", syncIdleState);

    return () => document.removeEventListener("visibilitychange", syncIdleState);
  }, []);

  return (
    <div className="page-shine" aria-hidden="true" ref={frameRef}>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
