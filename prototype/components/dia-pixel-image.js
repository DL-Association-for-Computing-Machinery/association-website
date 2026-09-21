/* ==========================================================================
   <dia-pixel-image> · 像素块拼合显现
   --------------------------------------------------------------------------
   图片被切成若干色块，每块带自己的延迟从透明淡入，拼合成完整画面；
   可选从灰度过渡到彩色。原生 Web Component：无框架、无依赖、无构建，
   `<script src>` 引入即用。

   参考实现（Pixel Image）是 React + TypeScript 写的；这里是同一套做法的原生移植，
   属性与参考实现的 props 一一对应（见下）。

   用法（子元素是真正的图片，也是没有脚本时的回落内容）：
     <dia-pixel-image grid="6x4" in-view delay="0.4">
       <img src="./assets/photo.webp" alt="……" width="1200" height="800">
     </dia-pixel-image>

   属性
     src            图片来源。省略时取子图片的 src —— 一般不用写，保持单一来源。
     grid           预置网格，键是「列x行」：6x4 / 8x8 / 8x3 / 4x6 / 3x8，默认 6x4。
     rows, cols     自定义网格，1–16 的整数，两者都给且合法时覆盖 grid。对应 customGrid。
     duration       单块淡入时长（毫秒），默认 800。对应 pixelFadeInDuration。
     scatter        随机延迟上限（毫秒），默认 1000。对应 maxAnimationDelay。
     color-delay    彩色显现的时刻（毫秒），默认 900。对应 colorRevealDelay。
     grayscale      是否从灰度过渡到彩色，默认 true。对应 grayscaleAnimation。
     delay          进入视口后等多久才开始（秒），默认 0。与 <dia-blur-fade> 同一语义。
     in-view        布尔，默认 false。设为 true 时进入视口才开始，只播一次。
     in-view-margin 触发用的 rootMargin，默认 -40px（元素要再进入视口 40px）。

   说明
     · 子图片始终留在 DOM 里：它既是没有脚本时的画面，也是无障碍树里的图像（alt 由它提供）。
       动画期间它被裁成空盒（不占视觉、仍占位），像素层是 aria-hidden 的装饰，
       所以读屏念到的始终是那一张图，而不是 24 块碎片。
     · 底图裁成空盒而不是拿掉，是为了让宿主高度始终由图片本身撑着；
       否则像素层都是绝对定位，切块那一刻格子会塌成 0 高。
     · 落定后像素层整层撤掉、底图复原 —— 稳态就是一张普通图片，不留常驻合成层与重复解码。
     · 每块的延迟按序号散列，不用 Math.random：看起来一样散，但每次刷新都一样，
       截图与回归比对才有稳定结果。
     · 切块用 clip-path 百分比矩形，相邻块各向外多出 0.25%，盖住边缘抗锯齿的接缝；
       重叠部分画的是同一张图的同一处，没有副作用。
     · 图片没加载出来时什么都不做，底图照常显示成一张普通的破图，不假装成功。
     · 减少动效：prefers-reduced-motion: reduce 时不切块、不灰度，它自始至终就是一张图片。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-pixel-image";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  // 预置网格：键是「列x行」，与参考实现的 DEFAULT_GRIDS 一致
  const DEFAULT_GRIDS = {
    "6x4": { rows: 4, cols: 6 },
    "8x8": { rows: 8, cols: 8 },
    "8x3": { rows: 3, cols: 8 },
    "4x6": { rows: 6, cols: 4 },
    "3x8": { rows: 8, cols: 3 },
  };
  const MIN_GRID = 1;
  const MAX_GRID = 16;

  const DEFAULT_GRID = "6x4";
  const DEFAULT_DURATION = 800;
  const DEFAULT_SCATTER = 1000;
  const DEFAULT_COLOR_DELAY = 900;
  const DEFAULT_MARGIN = "-40px";

  // 相邻色块各向外多出画布宽高的 0.25%（用百分比而不是 px，省掉 clip-path 里的 calc）
  const OVERLAP = 0.25;

  // 等图片解码的上限：超时也照常开播，不为了「万无一失」把动画卡在门口
  const DECODE_TIMEOUT = 1200;
  // 全部色块淡入结束之后再留一拍，才把像素层换成底图
  const SETTLE_GAP = 60;

  const SHADOW_HTML = `
    <style>
      :host {
        display: block;
        position: relative;
        width: 100%;
      }

      .frame {
        position: relative;
        display: block;
      }

      .base {
        display: block;
      }

      /* 动画期间把底图裁成空盒：视觉上看不见，但仍在无障碍树里、仍占着原位 */
      :host([data-pixel="running"]) ::slotted(img) {
        clip-path: inset(50%);
      }

      .tiles {
        position: absolute;
        inset: 0;
        display: none;
        /* 灰度到彩色整层一次性过渡：比逐块挂滤镜少掉几十个合成层 */
        transition: filter var(--dia-pixel-fade, 800ms) cubic-bezier(0.4, 0, 0.2, 1);
      }

      :host([data-pixel="running"]) .tiles {
        display: block;
      }

      .tiles.is-gray {
        filter: grayscale(1);
      }

      .tile {
        position: absolute;
        inset: 0;
        opacity: 0;
        transition-property: opacity;
        transition-duration: var(--dia-pixel-fade, 800ms);
        transition-timing-function: ease-out;
      }

      .tiles.is-on .tile {
        opacity: 1;
      }

      /* 每块里的图都是「整张原图铺满整格」，靠 clip-path 只露出自己那一块，
         所以缩放方式与底图完全一致，拼回去不会有错位 */
      .tile img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      @media (prefers-reduced-motion: reduce) {
        .tile,
        .tiles {
          transition: none;
        }
      }
    </style>

    <div class="frame">
      <div class="base"><slot></slot></div>
      <div class="tiles" aria-hidden="true"></div>
    </div>
  `;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function readNumber(element, name, fallback) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const value = Number.parseFloat(element.getAttribute(name));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  function readInteger(element, name, min, max) {
    if (!element.hasAttribute(name)) {
      return null;
    }
    const value = Number.parseInt(element.getAttribute(name), 10);
    return Number.isInteger(value) && value >= min && value <= max ? value : null;
  }

  function readFlag(element, name, fallback) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const raw = (element.getAttribute(name) || "").trim();
    return raw === "" ? true : !/^(false|0|no|off)$/i.test(raw);
  }

  // 参考实现用 Math.random() 撒延迟；这里换成按序号散列 —— 分布同样零散，
  // 但同样的序号永远得到同样的延迟，截图和逐块断言才可复现。
  function scatterFraction(index) {
    const value = Math.sin(index * 12.9898) * 43758.5453123;
    return value - Math.floor(value);
  }

  // 第 row 行第 col 块的裁切矩形，百分比相对整块画布
  function clipPath(row, col, rows, cols) {
    const x0 = (col / cols) * 100 - OVERLAP;
    const x1 = ((col + 1) / cols) * 100 + OVERLAP;
    const y0 = (row / rows) * 100 - OVERLAP;
    const y1 = ((row + 1) / rows) * 100 + OVERLAP;
    return `polygon(${x0}% ${y0}%, ${x1}% ${y0}%, ${x1}% ${y1}%, ${x0}% ${y1}%)`;
  }

  class DiaPixelImage extends HTMLElement {
    static get observedAttributes() {
      return [
        "src",
        "grid",
        "rows",
        "cols",
        "duration",
        "scatter",
        "color-delay",
        "grayscale",
        "delay",
        "in-view",
        "in-view-margin",
      ];
    }

    constructor() {
      super();
      this._shadow = null;
      this._frame = null;
      this._tilesEl = null;
      this._tiles = [];
      this._observer = null;
      this._timers = [];
      this._state = "plain";
      this._played = false;

      this._onMotionChange = () => {
        if (reduceMotion.matches) {
          // 中途切成「减少动效」：撤掉像素层，回到一张普通图片
          this._stop();
          return;
        }
        if (this.isConnected && !this._played) {
          this._arm();
        }
      };
    }

    connectedCallback() {
      this._ready = true;
      this._read();
      this._mount();
      reduceMotion.addEventListener("change", this._onMotionChange);

      if (reduceMotion.matches) {
        return;
      }
      this._arm();
    }

    disconnectedCallback() {
      this._clearTimers();
      this._unobserve();
      reduceMotion.removeEventListener("change", this._onMotionChange);
    }

    attributeChangedCallback(name, previous, next) {
      // 和 <dia-blur-fade> 同一个坑：升级自定义元素时，浏览器会为每个已存在的属性
      // 先回调一次 attributeChangedCallback，而且发生在 connectedCallback 之前。
      // 那时影子树还没建，照常往下走只会拿到空引用 —— 等 _ready 落定再读。
      if (previous === next || !this._ready) {
        return;
      }
      this._read();
      if (reduceMotion.matches) {
        this._stop();
      }
    }

    /* ----------------------------------------------------------------------
       参数
       ---------------------------------------------------------------------- */

    _read() {
      this._duration = readNumber(this, "duration", DEFAULT_DURATION);
      this._scatter = readNumber(this, "scatter", DEFAULT_SCATTER);
      this._colorDelay = readNumber(this, "color-delay", DEFAULT_COLOR_DELAY);
      this._delay = readNumber(this, "delay", 0);
      this._gray = readFlag(this, "grayscale", true);
      this._inView = readFlag(this, "in-view", false);
      this._margin = (this.getAttribute("in-view-margin") || DEFAULT_MARGIN).trim();
    }

    _grid() {
      const rows = readInteger(this, "rows", MIN_GRID, MAX_GRID);
      const cols = readInteger(this, "cols", MIN_GRID, MAX_GRID);
      if (rows && cols) {
        return { rows: rows, cols: cols };
      }
      const key = (this.getAttribute("grid") || "").trim().toLowerCase();
      return DEFAULT_GRIDS[key] || DEFAULT_GRIDS[DEFAULT_GRID];
    }

    /** 图片来源：优先 src 属性，否则取子图片的 src */
    _source() {
      const attribute = (this.getAttribute("src") || "").trim();
      if (attribute) {
        return attribute;
      }
      const image = this.querySelector("img");
      if (!image) {
        return "";
      }
      return image.getAttribute("src") || image.currentSrc || "";
    }

    /* ----------------------------------------------------------------------
       影子树
       ---------------------------------------------------------------------- */

    _mount() {
      if (this._shadow) {
        return;
      }
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = SHADOW_HTML;
      this._shadow = shadow;
      this._frame = shadow.querySelector(".frame");
      this._tilesEl = shadow.querySelector(".tiles");
    }

    /* ----------------------------------------------------------------------
       播放
       ---------------------------------------------------------------------- */

    _arm() {
      if (this._played || this._state !== "plain" || !this._tilesEl) {
        return;
      }
      if (!this._inView || typeof IntersectionObserver !== "function") {
        this._run();
        return;
      }
      if (this._observer) {
        return;
      }
      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            this._unobserve();
            this._run();
          }
        },
        { rootMargin: this._margin },
      );
      this._observer.observe(this);
    }

    async _run() {
      if (this._played || this._state !== "plain" || !this._tilesEl) {
        return;
      }
      const source = this._source();
      if (!source) {
        return;
      }

      this._played = true;
      const { rows, cols } = this._grid();
      this._frame.style.setProperty("--dia-pixel-fade", `${this._duration}ms`);
      this._buildTiles(source, rows, cols);

      // 先等图解码再切块：否则切块那一瞬格子是空的，会闪一下空白
      const ready = await this._decode(source);
      if (!ready) {
        this._stop();
        return;
      }
      if (!this.isConnected || this._state !== "plain") {
        return;
      }
      this._timer(() => this._play(), this._delay * 1000);
    }

    _buildTiles(source, rows, cols) {
      const fragment = document.createDocumentFragment();
      const tiles = [];
      for (let index = 0; index < rows * cols; index += 1) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.style.clipPath = clipPath(Math.floor(index / cols), index % cols, rows, cols);
        tile.style.transitionDelay = `${Math.round(scatterFraction(index) * this._scatter)}ms`;

        const image = document.createElement("img");
        image.src = source;
        // 纯装饰层：语义与 alt 由留在无障碍树里的底图承担
        image.alt = "";
        image.draggable = false;
        image.decoding = "async";
        tile.append(image);

        fragment.append(tile);
        tiles.push(tile);
      }
      this._tilesEl.replaceChildren(fragment);
      this._tiles = tiles;
    }

    /** 等图片解码。naturalWidth 为 0 说明压根没加载出来，交给底图去表现破图。 */
    async _decode(source) {
      if (typeof Image !== "function") {
        return true;
      }
      const probe = new Image();
      probe.src = source;
      const decoded =
        typeof probe.decode === "function" ? probe.decode().catch(() => {}) : Promise.resolve();
      await Promise.race([
        decoded,
        new Promise((resolve) => {
          window.setTimeout(resolve, DECODE_TIMEOUT);
        }),
      ]);
      return probe.naturalWidth > 0;
    }

    _play() {
      if (!this.isConnected || this._state !== "plain") {
        return;
      }
      this._state = "running";
      this.setAttribute("data-pixel", "running");
      if (this._gray) {
        this._tilesEl.classList.add("is-gray");
      }

      // 初始态（全透明）先坐实，下一帧再改成不透明 —— 同一帧里改过去过渡不会触发。
      // 用两层 rAF：第一层等本轮渲染，第二层确保初始态已经被浏览器采纳。
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (this._state !== "running") {
            return;
          }
          this._tilesEl.classList.add("is-on");
        });
      });

      this._timer(() => this._tilesEl.classList.remove("is-gray"), this._colorDelay);
      this._timer(() => this._settle(), this._scatter + this._duration + SETTLE_GAP);
    }

    /** 落定：像素层整层撤掉，底图复原成一张普通图片 */
    _settle() {
      if (this._state !== "running") {
        return;
      }
      this._state = "done";
      this.setAttribute("data-pixel", "done");
      this._tilesEl.classList.remove("is-on", "is-gray");
      this._tilesEl.replaceChildren();
      this._tiles = [];
    }

    /** 回到「什么都没发生」的样子，底图就是最终画面 */
    _stop() {
      this._clearTimers();
      this._unobserve();
      if (this._tilesEl) {
        this._tilesEl.classList.remove("is-on", "is-gray");
        this._tilesEl.replaceChildren();
      }
      this._tiles = [];
      if (this._state === "running") {
        this._state = "plain";
        this.removeAttribute("data-pixel");
      }
    }

    /* ----------------------------------------------------------------------
       杂项
       ---------------------------------------------------------------------- */

    _timer(callback, delay) {
      const id = window.setTimeout(callback, delay);
      this._timers.push(id);
    }

    _clearTimers() {
      for (const id of this._timers) {
        window.clearTimeout(id);
      }
      this._timers = [];
    }

    _unobserve() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  }

  window.customElements.define(TAG, DiaPixelImage);
})();
