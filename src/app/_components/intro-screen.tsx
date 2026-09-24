"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 开屏遮罩。
 *
 * 从原型 main.js 的 intro 逻辑移植：
 * - 默认 3.9s 后释放；偏好减少动效时立即释放
 * - 「跳过动画」按钮可提前结束
 * - 结束时移除 html.intro-active（恢复页面滚动与动画），并派发
 *   prototype:intro-complete 事件，供问候区彩纸等待
 *
 * no-js 类的移除与主题恢复放在 layout 的内联脚本里同步执行，
 * 否则会在水合前闪一下降级版字标。
 */

const INTRO_DURATION_MS = 3900;

declare global {
  interface Window {
    /** 由 layout 内联脚本定义：释放开屏期间被暂存的 requestAnimationFrame 回调。 */
    __releaseIntroFrames?: () => void;
  }
}

export function IntroScreen() {
  const [done, setDone] = useState(false);

  const finish = useCallback(() => {
    setDone((already) => {
      if (already) return already;

      window.__releaseIntroFrames?.();
      document.documentElement.classList.remove("intro-active");

      // 先让黑幕从绘制树移除，再释放主页文字动效；否则首屏字标的描边动画
      // 与主页扫光会挤在同一帧，后者被遮住而显得没有播放。此处不用
      // requestAnimationFrame：开屏期间它被临时拦截，可能让事件永不派发。
      window.setTimeout(() => {
        document.dispatchEvent(new Event("prototype:intro-complete"));
      }, 50);

      return true;
    });
  }, []);

  useEffect(() => {
    // 统一走 setTimeout 分支：既让 setState 脱离 effect 主体（避免级联渲染告警），
    // 又在减少动效时以 0ms 立即释放（与原型行为一致）。
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : INTRO_DURATION_MS;

    const timer = window.setTimeout(finish, duration);
    return () => window.clearTimeout(timer);
  }, [finish]);

  return (
    <div
      className={done ? "intro-screen is-done" : "intro-screen"}
      role="status"
      aria-label="东华理工大学计算机协会正在载入"
    >
      <div className="intro-panels" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <span key={index} style={{ "--panel-index": index } as React.CSSProperties} />
        ))}
      </div>

      <div className="intro-mark" aria-hidden="true">
        <svg viewBox="0 0 820 240" role="presentation">
          <text className="intro-letter intro-letter--e" x="42" y="178">
            E
          </text>
          <text className="intro-letter intro-letter--c" x="218" y="178">
            C
          </text>
          <text className="intro-letter intro-letter--u" x="405" y="178">
            U
          </text>
          <text className="intro-letter intro-letter--t" x="570" y="178">
            T
          </text>
        </svg>
      </div>

      <button className="intro-skip" type="button" onClick={finish}>
        跳过动画
      </button>
    </div>
  );
}
