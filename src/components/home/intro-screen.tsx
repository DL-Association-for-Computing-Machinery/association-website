import type { CSSProperties } from "react";

const INTRO_PANEL_COUNT = 7;

/**
 * 开屏：黑色竖向面板先遮住主页，ECUT 字标描边完成后交错拉开。
 *
 * 结构、类名与原文案照首页基线。**这一层是服务端组件、自己不持有状态**：
 * 计时与「跳过」由 layout 里的内联脚本用原生 JS 收尾（加 `is-done`、摘掉 `intro-active`），
 * 因为开屏期间布局会挂上帧闸门，若让 React 来收尾，收尾本身要等水合、水合又要等开屏，会互相卡住。
 */
export function IntroScreen() {
  return (
    <div
      className="intro-screen"
      id="intro-screen"
      role="status"
      aria-label="东华理工大学计算机协会正在载入"
      suppressHydrationWarning
    >
      <div className="intro-panels" aria-hidden="true">
        {Array.from({ length: INTRO_PANEL_COUNT }, (_, index) => (
          <span key={index} style={{ "--panel-index": index } as CSSProperties} />
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

      <button className="intro-skip" type="button">
        跳过动画
      </button>
    </div>
  );
}
