/* ==========================================================================
   <dia-terminal> · 终端窗口
   --------------------------------------------------------------------------
   仿 macOS 终端：三个红黄绿圆点 + 命令行区域。带 data-typing 的行逐字打出，
   其余整行淡入；默认串行——上一行结束，下一行才开始。
   原生 Web Component：无框架、无依赖、无构建，`<script src>` 引入即用。

   用法（每个子元素是一行；带 data-typing 的行逐字打出，其余行淡入）：
     <dia-terminal>
       <span data-typing>$ whoami</span>
       <span>ecut-ca@localhost</span>
     </dia-terminal>

   属性
     speed          逐字打出的速度（毫秒/字），默认 60。
     sequence       布尔，默认 true。串行播放：上一行说完，下一行才开始。
                    设为 false 时各行独立起跑，先后由行内的 data-delay 决定。
     start-on-view  布尔，默认 true。进入视口后才开始播放。

   行属性（写在子元素上）
     data-typing  该行逐字打出。缺省时整行淡入。
     data-delay   该行延迟（毫秒）。仅在 sequence="false" 时生效。

   行内容按原样显示（空格对齐会保留），只去掉行尾空白；因此每行写成单行，
   不要把标签内容折到多行，否则源码缩进会被当成行首空格。

   说明
     · 彩边的做法：一条 300% 见方的渐变带在元素上平移，靠 mask 把整块背景裁成
       只剩描边那一圈，「流动」就是 background-position 在 0%→100%→0% 之间循环。
       环宽由 padding 决定，遮罩用 content-box 与 border-box 两层做异或。
     · 彩边只在可见时跑帧（滚出视口或标签页切走就停），它是一条一直在重绘的渐变，
       挂后台空转没有意义。
     · 主题跟随：配色取自 --surface / --text / --line 等令牌，随深浅色自动切换。
     · 高度稳定：每行先占住一行高度再逐字填充，窗口不会一边打字一边长高。
     · 减少动效：prefers-reduced-motion: reduce 时不做逐字与淡入，直接给最终文本。
     · 降级：脚本未执行时组件不升级，标签内的文本按普通文本原样显示。
     · 无障碍：逐字过程读屏会读到残句，可见命令行因此标记为装饰，
       完整内容由一段视觉隐藏文本承载。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-terminal";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  // 与参考实现一致的默认值
  const DEFAULT_SPEED = 60; // 毫秒/字
  const SPAN_DURATION = 300; // 淡入时长（毫秒）
  const VIEW_AMOUNT = 0.3; // 进入视口多少比例后起播

  // Shine Border 的默认值，与参考实现对齐
  const DEFAULT_SHINE_WIDTH = 2; // 彩边宽度（像素）
  const DEFAULT_SHINE_DURATION = 14; // 彩边走完一轮的时长（秒）
  const SHINE_ATTRIBUTES = ["shine", "shine-width", "shine-duration"];

  const STYLES = `
    :host {
      display: block;
      width: 100%;
      max-width: 32rem;
      margin-inline: auto;
      color: var(--text, #14171f);
      font-family:
        ui-monospace,
        SFMono-Regular,
        "SF Mono",
        Menlo,
        Consolas,
        "Liberation Mono",
        "Courier New",
        monospace;
      font-size: 0.875rem;
      line-height: 1.7;
      letter-spacing: -0.01em;
      text-align: left;
    }

    /* 外壳只负责给彩边定位：彩边要盖住 .frame 自己的 1px 边框，
       而 .frame 是 overflow: hidden，放在它里面会被裁掉外面一圈。 */
    .shell {
      position: relative;
    }

    .frame {
      overflow: hidden;
      border: 1px solid var(--line, #dfe3ec);
      border-radius: var(--radius-media, 0.75rem);
      background: var(--surface, #fff);
      box-shadow: var(--shadow-card, 0 12px 28px -18px rgb(17 27 80 / 28%));
    }

    /* 流动彩边（移植自 magicui 的 Shine Border）
       一条 300% 见方的渐变带在元素上平移，遮罩把整块背景裁成只剩描边那一圈：
       content-box 与 border-box 两层做个异或，留下的正好是 padding 那几像素。
       顺序要紧——mask 简写会把 mask-composite 复位，必须写在它后面。 */
    .shine {
      position: absolute;
      z-index: 1;
      inset: 0;
      padding: var(--shine-width, 2px);
      border-radius: var(--radius-media, 0.75rem);
      pointer-events: none;
      /* 参考实现是一条窄色带配两段透明，那是「扫光」的做法。放到这里不行：
         背景放大到 300% 后可视窗口只占整幅三分之一，窄色带会让大半个周期
         整圈都是空的，只剩下原本那条灰线。
         改成让色带铺满整条渐变线、并在里面走完一轮半彩虹 —— 这样任何相位
         都至少能看到三种颜色，「流动」则由 background-position 的平移给出。 */
      background-image: linear-gradient(
        115deg,
        var(--brand-cyan, #38b7d1) 0%,
        var(--brand-blue, #2f7fd0) 11%,
        var(--brand-gold, #f4c64f) 22%,
        var(--brand-coral, #dc554c) 33%,
        var(--brand-orange, #ff7a38) 44%,
        var(--brand-cyan, #38b7d1) 55%,
        var(--brand-blue, #2f7fd0) 66%,
        var(--brand-gold, #f4c64f) 77%,
        var(--brand-coral, #dc554c) 88%,
        var(--brand-orange, #ff7a38) 100%
      );
      background-repeat: no-repeat;
      background-size: 300% 300%;
      will-change: background-position;
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: dia-shine var(--shine-duration, 14s) linear infinite;
    }

    /* 滚出视口或标签页切到后台就停帧：这条渐变一直在重绘，没必要后台空转 */
    .shell.is-idle .shine {
      animation-play-state: paused;
    }

    @keyframes dia-shine {
      0% {
        background-position: 0% 0%;
      }

      50% {
        background-position: 100% 100%;
      }

      100% {
        background-position: 0% 0%;
      }
    }

    .chrome {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid var(--line, #dfe3ec);
    }

    .dots {
      display: flex;
      gap: 0.5rem;
    }

    .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }

    .dot-close {
      background: #ff5f57;
    }

    .dot-minimize {
      background: #febc2e;
    }

    .dot-zoom {
      background: #28c840;
    }

    .screen {
      max-height: 25rem;
      margin: 0;
      padding: 1rem;
      overflow: auto;
      /* 长命令在窄屏上折行，不把窗口撑出横向滚动条 */
      overflow-wrap: anywhere;
    }

    .lines {
      display: grid;
      gap: 0.25rem;
      font: inherit;
    }

    .line {
      /* 逐字打出的行起始是空的，先按一行高度占位，
         否则终端会一边打字一边长高，把下面的内容顶下去 */
      min-height: 1.7em;
      min-height: 1lh;
      white-space: pre-wrap;
    }

    .span-line {
      opacity: 0;
      transform: translateY(-5px);
    }

    .span-line.is-shown {
      opacity: 1;
      transform: none;
      transition:
        opacity 300ms ease-out,
        transform 300ms ease-out;
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
      white-space: pre-line;
    }

    @media (prefers-reduced-motion: reduce) {
      .span-line {
        opacity: 1;
        transform: none;
      }

      .span-line.is-shown {
        transition: none;
      }

      /* 不做流动，但把渐变挪到中间：默认的 0% 0% 那一段几乎全透明，
         停下来就什么都看不见了，静态下也留一道彩色描边。 */
      .shine {
        animation: none;
        background-position: 50% 50%;
      }
    }
  `;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  class DiaTerminal extends HTMLElement {
    static get observedAttributes() {
      return ["speed", "sequence", "start-on-view", ...SHINE_ATTRIBUTES];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `<style>${STYLES}</style>`;

      this._initialized = false;
      this._lines = [];
      this._nodes = [];
      this._index = 0;
      this._speed = DEFAULT_SPEED;
      this._sequence = true;
      this._startOnView = true;
      this._interval = 0;
      this._timers = [];
      this._observer = null;

      this._shine = null;
      this._shineOn = false;
      this._shineWidth = DEFAULT_SHINE_WIDTH;
      this._shineDuration = DEFAULT_SHINE_DURATION;
      this._viewObserver = null;
      // 初始当作可见：万一没有 IntersectionObserver，彩边照常跑，别一直停着。
      this._inView = true;

      this._onMotionChange = () => {
        if (reduceMotion.matches) {
          this._settleAll();
        } else {
          this._restart();
        }
      };

      this._onVisibilityChange = () => {
        this._updateShineIdle();
      };
    }

    connectedCallback() {
      if (!this._initialized) {
        // 先取走回退文本：脚本没跑起来时，这些子元素就是页面上看到的文字。
        this._lines = this._readLines();
        this.replaceChildren();
        this._initialized = true;
      }

      this._readOptions();
      this._build();
      this._watchVisibility();
      reduceMotion.addEventListener("change", this._onMotionChange);
      this._start();
    }

    disconnectedCallback() {
      this._clear();
      this._unwatchVisibility();
      reduceMotion.removeEventListener("change", this._onMotionChange);
    }

    attributeChangedCallback(name, previous, next) {
      // 解析阶段属性先于 connectedCallback 落定，此时结构还没建好。
      if (!this._initialized || previous === next) {
        return;
      }
      // 彩边只是外观参数，改了不该把终端重放一遍。
      if (SHINE_ATTRIBUTES.includes(name)) {
        this._readOptions();
        this._syncShine();
        this._updateShineIdle();
        return;
      }
      this._restart();
    }

    /* ----------------------------------------------------------------------
       读取与结构
       ---------------------------------------------------------------------- */

    _readLines() {
      const lines = [];
      for (const child of Array.from(this.children)) {
        // 终端输出常靠空格对齐，除行尾空白外一律原样保留；
        // 换行只可能来自源码排版，折成空格，免得把缩进带进来。
        const text = (child.textContent || "").replace(/[\r\n]+/g, " ").replace(/\s+$/, "");
        if (!text.trim()) {
          continue;
        }
        lines.push({
          text,
          typing: child.hasAttribute("data-typing"),
          delay: readNumber(child, "data-delay", 0),
        });
      }
      return lines;
    }

    _readOptions() {
      this._speed = readNumber(this, "speed", DEFAULT_SPEED);
      this._sequence = readFlag(this, "sequence", true);
      this._startOnView = readFlag(this, "start-on-view", true);
      this._shineOn = readFlag(this, "shine", false);
      this._shineWidth = readNumber(this, "shine-width", DEFAULT_SHINE_WIDTH);
      this._shineDuration = readNumber(this, "shine-duration", DEFAULT_SHINE_DURATION);
    }

    _build() {
      for (const node of [...this.shadowRoot.querySelectorAll(".shell, .sr")]) {
        node.remove();
      }
      this._shine = null;

      const shell = document.createElement("div");
      shell.className = "shell";

      const frame = document.createElement("div");
      frame.className = "frame";
      frame.setAttribute("part", "frame");

      const chrome = document.createElement("div");
      chrome.className = "chrome";
      chrome.setAttribute("aria-hidden", "true");

      const dots = document.createElement("div");
      dots.className = "dots";
      for (const tone of ["close", "minimize", "zoom"]) {
        const dot = document.createElement("span");
        dot.className = `dot dot-${tone}`;
        dots.append(dot);
      }
      chrome.append(dots);

      const screen = document.createElement("pre");
      screen.className = "screen";

      const code = document.createElement("code");
      code.className = "lines";

      this._nodes = this._lines.map((line) => {
        const node = document.createElement("span");
        node.className = line.typing ? "line typing-line" : "line span-line";
        node.textContent = line.typing ? "" : line.text;
        code.append(node);
        return node;
      });

      screen.append(code);
      frame.append(chrome, screen);
      shell.append(frame);
      this.shadowRoot.append(shell);
      this._syncShine();

      // 逐字过程对读屏是残句，可见命令行按装饰处理，
      // 完整记录交给下面这段视觉隐藏文本。
      code.setAttribute("aria-hidden", "true");
      const sr = document.createElement("span");
      sr.className = "sr";
      sr.textContent = this._lines.map((line) => line.text).join("\n");
      this.shadowRoot.append(sr);
    }

    /* ----------------------------------------------------------------------
       流动彩边
       ---------------------------------------------------------------------- */

    // 按当前选项补上 / 摘掉彩边，并把环宽与周期写成自定义属性交给样式。
    _syncShine() {
      const shell = this.shadowRoot.querySelector(".shell");
      if (!shell) {
        return;
      }

      if (this._shineOn && !this._shine) {
        const shine = document.createElement("div");
        shine.className = "shine";
        // 纯装饰，不参与语义，也不该拦住点击
        shine.setAttribute("aria-hidden", "true");
        this._shine = shine;
        shell.append(shine);
      } else if (!this._shineOn && this._shine) {
        this._shine.remove();
        this._shine = null;
      }

      if (this._shine) {
        this._shine.style.setProperty("--shine-width", `${this._shineWidth}px`);
        this._shine.style.setProperty("--shine-duration", `${this._shineDuration}s`);
      }
    }

    _watchVisibility() {
      this._unwatchVisibility();
      document.addEventListener("visibilitychange", this._onVisibilityChange);
      this._updateShineIdle();

      if (typeof IntersectionObserver !== "function") {
        return;
      }

      this._viewObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          this._inView = entry.isIntersecting;
        }
        this._updateShineIdle();
      });
      this._viewObserver.observe(this);
    }

    _unwatchVisibility() {
      document.removeEventListener("visibilitychange", this._onVisibilityChange);
      if (this._viewObserver) {
        this._viewObserver.disconnect();
        this._viewObserver = null;
      }
    }

    _updateShineIdle() {
      const shell = this.shadowRoot.querySelector(".shell");
      if (!shell) {
        return;
      }
      shell.classList.toggle("is-idle", !this._inView || document.hidden);
    }

    /* ----------------------------------------------------------------------
       播放
       ---------------------------------------------------------------------- */

    _start() {
      this._clear();

      // 用户要求减少动效：不逐字也不淡入，直接给最终状态。
      if (reduceMotion.matches) {
        this._settle();
        return;
      }

      if (!this._sequence) {
        this._playIndependently();
        return;
      }

      if (!this._startOnView || typeof IntersectionObserver !== "function") {
        this._advance();
        return;
      }

      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            this._disconnectObserver();
            this._advance();
          }
        },
        { threshold: VIEW_AMOUNT },
      );
      this._observer.observe(this);
    }

    // 串行：只推进当前这一行，说完再轮到下一行。
    _advance() {
      const line = this._lines[this._index];
      const node = this._nodes[this._index];
      if (!line || !node) {
        return;
      }
      if (line.typing) {
        this._type(line, node);
      } else {
        this._show(node, SPAN_DURATION);
      }
    }

    _type(line, node) {
      if (this._speed <= 0) {
        node.textContent = line.text;
        this._complete();
        return;
      }

      let typed = 0;
      node.textContent = "";
      this._interval = window.setInterval(() => {
        typed += 1;
        node.textContent = line.text.slice(0, typed);
        if (typed >= line.text.length) {
          window.clearInterval(this._interval);
          this._interval = 0;
          this._complete();
        }
      }, this._speed);
    }

    _show(node, duration) {
      // 先强制一次样式重算：初始态（opacity: 0）没落定的话，
      // 紧跟着加类会被合并进同一帧，过渡根本不会触发。
      void node.offsetWidth;
      node.classList.add("is-shown");
      this._timers.push(
        window.setTimeout(() => {
          this._complete();
        }, duration),
      );
    }

    _complete() {
      if (!this._sequence) {
        return;
      }
      this._index += 1;
      if (this._index < this._lines.length) {
        this._advance();
      }
    }

    // sequence="false"：各行同时起跑，先后靠 data-delay 控制。
    _playIndependently() {
      this._lines.forEach((line, index) => {
        const node = this._nodes[index];
        const run = () => {
          if (line.typing) {
            this._type(line, node);
          } else {
            this._show(node, 0);
          }
        };

        if (line.delay > 0) {
          this._timers.push(window.setTimeout(run, line.delay));
        } else {
          run();
        }
      });
    }

    _settle() {
      this._lines.forEach((line, index) => {
        const node = this._nodes[index];
        node.textContent = line.text;
        if (!line.typing) {
          node.classList.add("is-shown");
        }
      });
    }

    /* ----------------------------------------------------------------------
       复位
       ---------------------------------------------------------------------- */

    _restart() {
      this._readOptions();
      for (const [index, line] of this._lines.entries()) {
        const node = this._nodes[index];
        node.classList.remove("is-shown");
        node.textContent = line.typing ? "" : line.text;
      }
      this._index = 0;
      this._start();
    }

    _settleAll() {
      this._clear();
      this._settle();
    }

    _clear() {
      this._disconnectObserver();
      if (this._interval) {
        window.clearInterval(this._interval);
        this._interval = 0;
      }
      for (const timer of this._timers) {
        window.clearTimeout(timer);
      }
      this._timers = [];
    }

    _disconnectObserver() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  }

  window.customElements.define(TAG, DiaTerminal);
})();
