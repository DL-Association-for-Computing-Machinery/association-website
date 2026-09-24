/* ==========================================================================
   <dia-text-reveal> · 文字扫光揭示
   --------------------------------------------------------------------------
   一条横向渐变色带从左向右扫过文字，扫过时是彩色渐变，扫完落在文字颜色上。
   原生 Web Component：无框架、无依赖、无构建，`<script src>` 引入即用。

   用法（多片段用 `|` 分隔，stack 逐行堆叠 / repeat 循环轮播）：
     <dia-text-reveal text="Computer|Association" stack>Computer Association</dia-text-reveal>

   属性
     text          文字。`|` 分隔多个片段。缺省时取标签内的回退文本。
     stack         布尔。多个片段上下堆叠。
     colors        色带颜色，逗号分隔。默认取 Logo 派生的品牌色令牌。
     text-color    扫光结束后（以及色带两旁）的文字颜色，默认 var(--heading)。
     duration      单次扫光时长（秒），默认 1.5。
     delay         扫光开始前的延迟（秒），默认 0。
     repeat        布尔。多个片段循环轮播（单行内使用，与 stack 互斥）。
     repeat-delay  轮播间隔（秒），默认 0.5。
     fixed-width   布尔。轮播时锁定为最宽片段的宽度，避免横向抖动。
     start-on-view 布尔，默认 true。进入视口后才播放。
     once          布尔，默认 true。只播放一次。

   说明
     · 主题跟随：默认色值与文字色都是 CSS 变量引用，切换深色模式时自动重算。
     · 减少动效：prefers-reduced-motion: reduce 时不做揭示，直接给最终状态。
       悬停触发的形态在减少动效下同样停在最终状态（而不是停在"文字全透明"的起点）。
     · 降级：浏览器不支持 background-clip: text 时不播放动画，文字保持正常颜色；
       脚本未执行时组件不升级，标签内的回退文本照常显示。
     · 无障碍：堆叠形态把可见文字标记为装饰，用一段视觉隐藏文本承载可访问名称。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-text-reveal";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  const BAND_HALF = 17;
  const SWEEP_START = -BAND_HALF;
  const SWEEP_END = 100 + BAND_HALF;

  // 默认配色取自官方 Logo 派生的令牌，随主题自动切换。
  const DEFAULT_COLORS = [
    "var(--brand-cyan, #38b7d1)",
    "var(--brand-blue, #2f7fd0)",
    "var(--brand-gold, #f4c64f)",
    "var(--brand-orange, #ff7a38)",
    "var(--brand-coral, #dc554c)",
  ];
  const DEFAULT_TEXT_COLOR = "var(--heading, #111b50)";

  const STYLES = `
    .visual {
      position: relative;
      display: inline-block;
      overflow: hidden;
      /* inline-block 默认坐在基线上，会让行盒多出一段字体下行空间 */
      vertical-align: top;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }

    /* 上下留白放在内层，overflow: hidden 就不会裁到字母的上下缘 */
    .inner {
      display: inline-block;
      padding-block: 0.08em;
    }

    .line {
      display: block;
      white-space: nowrap;
    }

    /* 轮播时宽度会变，收敛得柔和一些 */
    .visual.is-rotating {
      transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* 用 background-clip: text 把渐变裁进字形；
       不支持时保持正常文字颜色，此时脚本也不会写入渐变 */
    @supports ((background-clip: text) or (-webkit-background-clip: text)) {
      .visual {
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }

    /* 量宽用的隐藏副本，字体经 .visual 从宿主继承 */
    .ghost {
      position: absolute;
      top: 0;
      left: 0;
      width: auto;
      white-space: nowrap;
      visibility: hidden;
      pointer-events: none;
    }

    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      border: 0;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function supportsGradientText() {
    return (
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      (CSS.supports("background-clip", "text") || CSS.supports("-webkit-background-clip", "text"))
    );
  }

  // easeInOutCubic，与参考实现一致
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * 按色带中心位置拼出渐变。
   * 色带之前是最终文字色，色带之内是彩色，色带之后仍透明——于是文字逐段显形。
   */
  function buildGradient(position, colors, textColor) {
    const bandStart = position - BAND_HALF;
    const bandEnd = position + BAND_HALF;

    if (bandStart >= 100) {
      return `linear-gradient(90deg, ${textColor}, ${textColor})`;
    }

    const count = colors.length;
    const parts = [];

    if (bandStart > 0) {
      parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`);
    }

    colors.forEach((color, index) => {
      const stop = count === 1 ? position : bandStart + (index / (count - 1)) * BAND_HALF * 2;
      parts.push(`${color} ${stop.toFixed(2)}%`);
    });

    if (bandEnd < 100) {
      parts.push(`transparent ${bandEnd.toFixed(2)}%`, "transparent 100%");
    }

    return `linear-gradient(90deg, ${parts.join(", ")})`;
  }

  function readNumber(element, name, fallback) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const value = Number.parseFloat(element.getAttribute(name));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  function readFlag(element, name, fallback) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const raw = (element.getAttribute(name) || "").trim();
    return raw === "" ? true : !/^(false|0|no|off)$/i.test(raw);
  }

  class DiaTextReveal extends HTMLElement {
    static get observedAttributes() {
      return [
        "text",
        "stack",
        "colors",
        "text-color",
        "duration",
        "delay",
        "repeat",
        "repeat-delay",
        "fixed-width",
        "start-on-view",
        "once",
        "trigger",
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `<style>${STYLES}</style>`;

      this._initialized = false;
      this._fallbackText = "";
      this._parts = [];
      this._lines = [];
      this._widths = [];
      this._index = 0;
      this._frame = 0;
      this._timer = 0;
      this._observer = null;
      this._played = false;
      this._stacked = false;
      this._rotating = false;
      this._hoverMode = false;
      this._hoverBound = null;
      this._supported = supportsGradientText();
      this._introDeferred = false;

      this._visual = null;
      this._inner = null;
      this._ghost = null;
      this._lineElements = [];

      this._onHoverTrigger = () => {
        this.play();
      };

      this._onMotionChange = () => {
        this._stop();
        if (this._hoverMode) {
          // 悬停触发没有"起点"这一态：动效开关变化后停在最终色即可。
          this._paint(SWEEP_END);
          return;
        }
        if (reduceMotion.matches) {
          this._paint(SWEEP_END);
          this._played = true;
          this._disconnectObserver();
          return;
        }
        if (this._played) {
          // 动效重新打开且已经播过：重播一次，别停在"文字全透明"的起点。
          this._play();
          return;
        }
        this._paint(SWEEP_START);
      };

      this._onIntroComplete = () => {
        if (!this._introDeferred) {
          return;
        }

        this._introDeferred = false;
        this._start();
      };
    }

    connectedCallback() {
      if (!this._initialized) {
        // 先取走回退文本：脚本没跑起来时，它就是页面上看到的文字。
        this._fallbackText = this.textContent.replace(/\s+/g, " ").trim();
        this.replaceChildren();
        this._initialized = true;
      }

      this._render();
      reduceMotion.addEventListener("change", this._onMotionChange);
      document.addEventListener("prototype:intro-complete", this._onIntroComplete);
      this._start();
    }

    disconnectedCallback() {
      this._stop();
      this._disconnectObserver();
      this._unbindHoverTarget();
      reduceMotion.removeEventListener("change", this._onMotionChange);
      document.removeEventListener("prototype:intro-complete", this._onIntroComplete);
    }

    attributeChangedCallback(name, previous, next) {
      // 解析阶段属性先于 connectedCallback 落定，此时结构还没建好。
      if (!this._initialized || previous === next) {
        return;
      }
      this._stop();
      this._disconnectObserver();
      this._index = 0;
      this._played = false;
      this._render();
      this._start();
    }

    /**
     * 手动播放一次扫光。供外部驱动（点击、其它组件、演示按钮…）。
     * 不支持渐变文字裁剪或用户要求减少动效时不播放，文字停在最终状态。
     */
    play() {
      if (!this._initialized || !this._visual) {
        return;
      }
      if (!this._supported || reduceMotion.matches) {
        this._paint(SWEEP_END);
        return;
      }
      this._play();
    }

    /* ----------------------------------------------------------------------
       结构
       ---------------------------------------------------------------------- */

    _render() {
      const source = this.getAttribute("text");
      const raw = source === null ? this._fallbackText : source;
      const parts = raw
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);

      this._parts = parts.length ? parts : [""];
      this._index = this._index % this._parts.length;

      this._stacked = readFlag(this, "stack", false);
      // stack 管堆叠，repeat 管轮播；同时出现时以堆叠为准。
      this._rotating = !this._stacked && this._parts.length > 1 && readFlag(this, "repeat", false);
      this._hoverMode = (this.getAttribute("trigger") || "view").trim().toLowerCase() === "hover";
      if (!this._hoverMode) {
        this._unbindHoverTarget();
      }
      this._lines = this._stacked
        ? this._parts.slice()
        : [this._parts[this._index] || this._parts[0]];

      for (const node of [...this.shadowRoot.querySelectorAll(".visual, .sr")]) {
        node.remove();
      }

      const visual = document.createElement("span");
      visual.className = this._rotating ? "visual is-rotating" : "visual";
      visual.setAttribute("part", "visual");

      const inner = document.createElement("span");
      inner.className = "inner";
      inner.setAttribute("part", "text");

      this._lineElements = this._lines.map((text) => {
        const line = document.createElement("span");
        line.className = "line";
        line.textContent = text;
        inner.append(line);
        return line;
      });

      const ghost = document.createElement("span");
      ghost.className = "ghost";
      ghost.setAttribute("aria-hidden", "true");

      visual.append(inner, ghost);
      this.shadowRoot.append(visual);

      this._visual = visual;
      this._inner = inner;
      this._ghost = ghost;

      if (this._stacked) {
        // 可见文字按装饰处理，可访问名称由下面这段视觉隐藏文本承担，
        // 免得读屏把上下两行连读成 "ComputerAssociation"。
        visual.setAttribute("aria-hidden", "true");
        const sr = document.createElement("span");
        sr.className = "sr";
        sr.textContent = this._parts.join(" ");
        this.shadowRoot.append(sr);
      }

      if (this._rotating) {
        this._measure();
        this._applyWidth();
      }

      this._paint(reduceMotion.matches ? SWEEP_END : SWEEP_START);
    }

    _measure() {
      const ghost = this._ghost;
      if (!ghost) {
        return;
      }
      this._widths = this._parts.map((text) => {
        ghost.textContent = text;
        return ghost.getBoundingClientRect().width;
      });
      ghost.textContent = "";
    }

    _applyWidth() {
      if (!this._rotating || !this._visual || !this._widths.length) {
        return;
      }
      const width = readFlag(this, "fixed-width", false)
        ? Math.max(...this._widths)
        : this._widths[this._index];
      if (Number.isFinite(width)) {
        this._visual.style.width = `${Math.ceil(width)}px`;
      }
    }

    /* ----------------------------------------------------------------------
       扫光
       ---------------------------------------------------------------------- */

    _paint(position) {
      if (!this._visual || !this._supported) {
        return;
      }
      const attribute = this.getAttribute("colors");
      const colors = attribute
        ? attribute
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean)
        : DEFAULT_COLORS;
      const textColor = (this.getAttribute("text-color") || DEFAULT_TEXT_COLOR).trim();
      this._visual.style.backgroundImage = buildGradient(position, colors, textColor);
    }

    _start() {
      if (document.documentElement.classList.contains("intro-active")) {
        this._stop();
        this._paint(SWEEP_START);
        this._introDeferred = true;
        return;
      }

      // 不支持裁剪或用户要求减少动效：直接给最终状态，不做揭示。
      if (!this._supported || reduceMotion.matches) {
        this._paint(SWEEP_END);
        this._played = true;
        return;
      }

      // 悬停触发：静息态就是最终文字色，不进视口自动播放，等指针或焦点来触发。
      if (this._hoverMode) {
        this._paint(SWEEP_END);
        this._bindHoverTarget();
        return;
      }

      this._paint(SWEEP_START);

      if (!readFlag(this, "start-on-view", true) || typeof IntersectionObserver !== "function") {
        this._play();
        return;
      }

      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            if (readFlag(this, "once", true)) {
              this._disconnectObserver();
            }
            if (!this._frame && !this._timer) {
              this._play();
            }
          }
        },
        { threshold: 0.1 },
      );
      this._observer.observe(this);
    }

    /* ----------------------------------------------------------------------
       悬停触发
       ---------------------------------------------------------------------- */

    /* 悬停热点：就近的链接/按钮祖先优先。
       导航项的文字被包在 <a> 里，只监听文字本身的话，链接内边距上悬停不会触发。 */
    _hoverTarget() {
      return this.closest("a, button") || this;
    }

    _bindHoverTarget() {
      const target = this._hoverTarget();
      if (this._hoverBound === target) {
        return;
      }
      this._unbindHoverTarget();
      this._hoverBound = target;
      target.addEventListener("pointerenter", this._onHoverTrigger);
      target.addEventListener("focusin", this._onHoverTrigger);
    }

    _unbindHoverTarget() {
      if (!this._hoverBound) {
        return;
      }
      this._hoverBound.removeEventListener("pointerenter", this._onHoverTrigger);
      this._hoverBound.removeEventListener("focusin", this._onHoverTrigger);
      this._hoverBound = null;
    }

    _play() {
      this._stop();
      this._played = true;

      const duration = readNumber(this, "duration", 1.5);
      const delay = readNumber(this, "delay", 0);

      this._paint(SWEEP_START);

      if (duration <= 0) {
        this._paint(SWEEP_END);
        this._queueNext();
        return;
      }

      const startedAt = performance.now() + delay * 1000;
      const step = (now) => {
        const progress = Math.min(1, Math.max(0, (now - startedAt) / (duration * 1000)));
        this._paint(SWEEP_START + (SWEEP_END - SWEEP_START) * easeInOutCubic(progress));
        if (progress < 1) {
          this._frame = requestAnimationFrame(step);
        } else {
          this._frame = 0;
          this._queueNext();
        }
      };

      this._frame = requestAnimationFrame(step);
    }

    _queueNext() {
      if (!this._rotating) {
        return;
      }
      this._timer = window.setTimeout(
        () => {
          this._timer = 0;
          this._index = (this._index + 1) % this._parts.length;
          if (this._lineElements.length === 1) {
            this._lineElements[0].textContent = this._parts[this._index];
          }
          this._applyWidth();
          this._play();
        },
        readNumber(this, "repeat-delay", 0.5) * 1000,
      );
    }

    _stop() {
      if (this._frame) {
        cancelAnimationFrame(this._frame);
        this._frame = 0;
      }
      if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = 0;
      }
    }

    _disconnectObserver() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  }

  window.customElements.define(TAG, DiaTextReveal);
})();
