/* ==========================================================================
   <dia-icon-cloud> · 3D 标签云
   --------------------------------------------------------------------------
   标签排在一个球面上整体缓慢自转，可以用鼠标拖动旋转，点击某个标签把它转到正面。
   原生 Web Component：无框架、无依赖、无构建，`<script src>` 引入即用。
   参考实现（Icon Cloud）是 React + motion 写的；这里是同一套球面数学的原生移植，
   属性语义（speed / size / images / 播放暂停按钮）与之一致。

   用法（列表既是标签数据来源，也是没有脚本时的回落内容）：
     <dia-icon-cloud speed="1">
       <ul class="cloud-list">
         <li data-icon="cplusplus">C++</li>
         <li data-icon="python">Python</li>
       </ul>
     </dia-icon-cloud>

   属性
     size        画布边长上限（CSS px），默认 400。窄视口会缩到容器宽度。
     speed       转速倍数，默认 1。
     images      逗号分隔的图片地址。给出时改用图片模式（圆形裁切），忽略列表内容。
     no-control  不显示播放 / 暂停按钮。默认显示。
     no-links    不画标签之间的连线。默认画出，连起来才看得出是个球面。

   图标
     列表项用 data-icon 指向 prototype/assets/icon-set.js 里的键（路径数据来自 Simple Icons）。
     键不存在时该项退回文字药丸，所以没有图标也能正常显示。
     图标画在圆形浅底徽章上；品牌色与徽章底色的对比度不足 3:1 时改用正文色，
     保证深色主题下深色标识（如 GitHub）也看得见。

   说明
     · 列表在组件升级后被 <slot> 收进组件内的视觉隐藏盒：标签名照旧留在无障碍树里，
       不会因为换成画布而丢；脚本没跑起来时它是一份普通标签列表。
     · 只有进入视口才跑动画，切到后台标签页也会停，不在屏幕外空转。
     · 减少动效：prefers-reduced-motion: reduce 时默认暂停，用户仍可手动点播放。
     · 触屏不接管拖动（否则会和页面滚动打架），但仍可点暂停按钮。
     · 相对参考实现的三处改动：按远近排序后再绘制（近的不会反过来被远的盖住）、
       自转带一个不依赖指针的基准速度（指针停在画布中心时不会停转）、
       点击标签转正时取最近的等价角（不会绕远路）。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-icon-cloud";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  // 设计基准：下面这些数值都按「画布 400px」定，实际按画布宽度等比缩放
  const BASE_CANVAS = 400;
  // 球半径要在「铺得开」和「不出界」之间取平衡：投影不除 z，
  // 竖直方向最远可到 1.26R（起步倾角所致），加瓦片半高不能超过画布半个边长。
  const BASE_RADIUS = 128;
  const BASE_TILE_HEIGHT = 34;
  const BASE_FONT = 15;
  const BASE_PAD = 15; // 药丸标签左右内边距
  // 图标徽章：圆形浅底 + 居中标识
  const BASE_CHIP = 46;
  const ICON_RATIO = 0.6; // 标识占徽章直径的比例
  const MIN_ICON_CONTRAST = 3; // 品牌色与徽章底色低于这个对比度就退回正文色

  const ICON_VIEWBOX = 24; // Simple Icons 的路径都画在 24×24 上
  const SVG_NS = "http://www.w3.org/2000/svg";

  // 球面投影：scale 与 opacity 都随 z 变化，系数沿用参考实现
  const SCALE_SPAN = 3;
  const SCALE_OFFSET = 2;
  const OPACITY_SPAN = 2;
  const OPACITY_OFFSET = 1.5;
  // 最远处不能小到看不出是标签，也不能淡到看不见
  const MIN_SCALE = 0.28;
  const MIN_OPACITY = 0.24;

  // 球面网格：两点距离在阈值内就连一条线，整片球面因此没有缺口；
  // 连线随远近变淡变细，但最远的也要看得见。
  const LINK_DISTANCE_RATIO = 1.3; // 相对球半径
  const LINK_ALPHA_MIN = 0.3;
  const LINK_ALPHA_SPAN = 0.34;
  const LINK_WIDTH_MIN = 0.8;
  const LINK_WIDTH_SPAN = 0.7;

  const FONT_FAMILY =
    'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
  const START_ROTATION = { x: 0.32, y: 0.24 };
  // 拖动时每像素转多少弧度；与参考实现一致
  const DRAG_RATE = 0.002;
  // 指针不在画布上时的常态自转（每帧弧度，按 60fps 计）
  const IDLE_SPIN = { x: 0.0004, y: 0.0016 };
  // 跟着指针偏离中心的距离变化的那部分转速；与参考实现一致
  const POINTER_SPIN = { base: 0.003, range: 0.01 };
  const FOCUS_MIN_MS = 800;
  const FOCUS_MAX_MS = 1600;
  const FOCUS_MS_PER_RAD = 900;
  const MAX_DPR = 2;
  const MIN_CANVAS = 180;
  const MAX_STEP = 3; // 单帧最多按几帧的量推进，避免切回来时跳一下

  const SHADOW_HTML = `
    <style>
      :host {
        display: block;
      }

      .frame {
        position: relative;
        width: max-content;
        margin-inline: auto;
      }

      .canvas {
        display: block;
        border-radius: var(--radius-media, 0.75rem);
        cursor: grab;
        /* 纵向留给页面滚动，横向拖动才轮到组件 */
        touch-action: pan-y;
      }

      .canvas.is-dragging {
        cursor: grabbing;
      }

      .canvas.is-over-item {
        cursor: pointer;
      }

      .control {
        position: absolute;
        top: 0.4rem;
        right: 0.4rem;
        display: grid;
        width: 2.25rem;
        height: 2.25rem;
        padding: 0;
        place-items: center;
        border: 1px solid var(--line, #dfe3ec);
        border-radius: var(--radius-control, 0.5rem);
        background: color-mix(in srgb, var(--surface, #fff) 82%, transparent);
        color: var(--text, #14171f);
        cursor: pointer;
      }

      .control:hover {
        background: var(--surface, #fff);
      }

      .control:focus-visible {
        outline: 2px solid var(--focus, #0b6b7f);
        outline-offset: 2px;
      }

      .glyph {
        display: grid;
        place-items: center;
      }

      .glyph svg {
        display: block;
      }

      .glyph-play {
        display: none;
      }

      :host([data-paused]) .glyph-play {
        display: grid;
      }

      :host([data-paused]) .glyph-pause {
        display: none;
      }

      @media (prefers-reduced-transparency: reduce) {
        .control {
          background: var(--surface, #fff);
        }
      }

      /* 标签名仍然留在无障碍树里：列表经 <slot> 落进这个盒子，
         视觉上裁掉，读屏照常念得出来 */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      /* 手机端不初始化 3D Canvas，直接把原始技术列表作为轻量标签云显示。 */
      @media (max-width: 48rem) {
        .frame {
          display: none;
        }

        .sr-only {
          position: static;
          width: auto;
          height: auto;
          margin: 0;
          overflow: visible;
          clip-path: none;
          white-space: normal;
        }
      }
    </style>

    <div class="frame">
      <canvas class="canvas" role="img" aria-label="协会技术栈 3D 标签云"></canvas>
      <button class="control" type="button">
        <span class="glyph glyph-pause" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2.6" width="3.2" height="10.8" rx="1"></rect>
            <rect x="9.8" y="2.6" width="3.2" height="10.8" rx="1"></rect>
          </svg>
        </span>
        <span class="glyph glyph-play" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 3.1 12.7 8 5 12.9Z"></path>
          </svg>
        </span>
      </button>
    </div>

    <div class="sr-only"><slot></slot></div>
  `;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function readNumber(element, name, fallback) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const value = Number.parseFloat(element.getAttribute(name));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  /* --------------------------------------------------------------------------
     颜色：按 WCAG 相对亮度算对比度，用来判断品牌色放在徽章上是否看得清
     -------------------------------------------------------------------------- */

  function parseColor(value) {
    const hex = (value || "").trim().replace("#", "");
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex.slice(0, 6);
    if (!/^[0-9a-fA-F]{6}$/.test(full)) {
      return null;
    }
    return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16) / 255);
  }

  function relativeLuminance(value) {
    const channels = parseColor(value);
    if (!channels) {
      return null;
    }
    const [red, green, blue] = channels.map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4),
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }

  function contrastRatio(first, second) {
    const a = relativeLuminance(first);
    const b = relativeLuminance(second);
    if (a === null || b === null) {
      return 0;
    }
    const lighter = Math.max(a, b);
    const darker = Math.min(a, b);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // 把角度折到离 from 最近的那个等价角，转正时不会绕远路
  function nearestAngle(from, to) {
    const turn = Math.PI * 2;
    let angle = to;
    while (angle - from > Math.PI) {
      angle -= turn;
    }
    while (from - angle > Math.PI) {
      angle += turn;
    }
    return angle;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, r);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  class DiaIconCloud extends HTMLElement {
    static get observedAttributes() {
      return ["size", "speed", "images", "no-control", "no-links"];
    }

    constructor() {
      super();

      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = SHADOW_HTML;
      this._canvas = root.querySelector(".canvas");
      this._mobileStatic = window.matchMedia("(max-width: 48rem)").matches;
      this._ctx = this._mobileStatic ? null : this._canvas.getContext("2d");
      this._control = root.querySelector(".control");

      this._items = []; // { label, tile, width, height }
      this._spheres = []; // 球面上的单位坐标 × 半径
      this._rotation = { x: START_ROTATION.x, y: START_ROTATION.y };
      this._pointer = { x: 0, y: 0 };
      this._drag = null;
      this._focus = null;
      this._raf = 0;
      this._last = 0;
      this._visible = false;
      this._paused = reduceMotion.matches;
      this._manual = false;
      this._canvasSize = 0;
      this._radius = BASE_RADIUS;
      this._scale = 1;
      this._dpr = 1;

      this._onFrame = this._onFrame.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onMotionChange = this._onMotionChange.bind(this);
      this._onVisibility = this._onVisibility.bind(this);
      this._onPointerDown = this._onPointerDown.bind(this);
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerUp = this._onPointerUp.bind(this);
      this._onPointerLeave = this._onPointerLeave.bind(this);
      this._onControlClick = this._onControlClick.bind(this);
    }

    connectedCallback() {
      if (this._mobileStatic) {
        this.dataset.mobileStatic = "true";
        return;
      }

      this._read();
      // 标记已升级：列表交给影子树里的隐藏盒，标签名继续保留在无障碍树里
      this.dataset.enhanced = "";
      this._applyPaused(this._paused);

      this._measure();

      this._resizeObserver = new ResizeObserver(this._onResize);
      this._resizeObserver.observe(this);

      // 主题切换只影响绘制用的颜色，重建瓦片再画一帧即可
      this._themeObserver = new MutationObserver(() => {
        this._buildItems();
        this._render();
      });
      this._themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });

      // 进入视口才跑动画
      if (typeof IntersectionObserver === "function") {
        this._viewObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            this._visible = entry.isIntersecting;
          }
          this._updateLoop();
        });
        this._viewObserver.observe(this);
      } else {
        this._visible = true;
      }

      reduceMotion.addEventListener("change", this._onMotionChange);
      document.addEventListener("visibilitychange", this._onVisibility);

      this._canvas.addEventListener("pointerdown", this._onPointerDown);
      this._canvas.addEventListener("pointermove", this._onPointerMove);
      this._canvas.addEventListener("pointerup", this._onPointerUp);
      this._canvas.addEventListener("pointercancel", this._onPointerUp);
      this._canvas.addEventListener("pointerleave", this._onPointerLeave);
      this._control.addEventListener("click", this._onControlClick);

      this._updateLoop();
    }

    disconnectedCallback() {
      this._stopLoop();
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
      if (this._themeObserver) {
        this._themeObserver.disconnect();
        this._themeObserver = null;
      }
      if (this._viewObserver) {
        this._viewObserver.disconnect();
        this._viewObserver = null;
      }
      reduceMotion.removeEventListener("change", this._onMotionChange);
      document.removeEventListener("visibilitychange", this._onVisibility);
      this._canvas.removeEventListener("pointerdown", this._onPointerDown);
      this._canvas.removeEventListener("pointermove", this._onPointerMove);
      this._canvas.removeEventListener("pointerup", this._onPointerUp);
      this._canvas.removeEventListener("pointercancel", this._onPointerUp);
      this._canvas.removeEventListener("pointerleave", this._onPointerLeave);
      this._control.removeEventListener("click", this._onControlClick);
    }

    attributeChangedCallback(name, previous, next) {
      // 解析阶段属性先于 connectedCallback 落定，此时还没接进文档。
      if (previous === next || !this.isConnected || this._mobileStatic) {
        return;
      }
      this._read();
      if (name === "images") {
        this._buildItems();
        this._render();
      } else if (name === "size" || name === "speed") {
        // 尺寸变化会重建瓦片并重绘（尺寸没变时它自己会提前返回）
        this._measure();
      } else if (name === "no-links") {
        this._render();
      }
      this._updateLoop();
    }

    /* ----------------------------------------------------------------------
       参数与状态
       ---------------------------------------------------------------------- */

    _read() {
      this._speed = readNumber(this, "speed", 1);
      this._requestedSize = readNumber(this, "size", BASE_CANVAS);
      this._showControl = !this.hasAttribute("no-control");
      this._showLinks = !this.hasAttribute("no-links");
      this._control.hidden = !this._showControl;
      this._images = (this.getAttribute("images") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    _applyPaused(paused) {
      this._paused = paused;
      this.toggleAttribute("data-paused", paused);
      const label = paused ? "继续旋转" : "暂停旋转";
      this._control.setAttribute("aria-label", label);
      this._control.setAttribute("aria-pressed", String(paused));
      this._control.title = label;
    }

    _setPaused(paused, options) {
      if (options && options.manual) {
        this._manual = true;
      }
      if (paused === this._paused) {
        return;
      }
      this._applyPaused(paused);
      this._updateLoop();
    }

    _onMotionChange() {
      // 用户自己按过按钮就以用户的为准，不再跟着系统偏好来回改
      if (this._manual) {
        return;
      }
      this._setPaused(reduceMotion.matches);
    }

    _onVisibility() {
      this._updateLoop();
    }

    _onControlClick() {
      this._setPaused(!this._paused, { manual: true });
    }

    _onResize() {
      this._measure();
    }

    /* ----------------------------------------------------------------------
       尺寸与瓦片
       ---------------------------------------------------------------------- */

    _measure() {
      const available = this.clientWidth || this._requestedSize;
      if (!available) {
        return;
      }
      const size = Math.max(MIN_CANVAS, Math.min(this._requestedSize, available));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const sameSize = Math.round(size) === Math.round(this._canvasSize) && dpr === this._dpr;
      if (sameSize && this._items.length) {
        return;
      }

      this._dpr = dpr;
      this._canvasSize = size;
      this._scale = size / BASE_CANVAS;
      this._radius = BASE_RADIUS * this._scale;

      this._canvas.style.width = size + "px";
      this._canvas.style.height = size + "px";
      this._canvas.width = Math.round(size * dpr);
      this._canvas.height = Math.round(size * dpr);

      this._buildItems();
      this._render();
    }

    _collect() {
      if (this._images.length) {
        return this._images.map((src, index) => ({ label: "图标 " + (index + 1), src }));
      }
      const catalog = window.DIA_ICON_SET || {};
      const entries = [];
      for (const node of this.querySelectorAll("li")) {
        const label = (node.textContent || "").trim();
        const key = (node.getAttribute("data-icon") || "").trim();
        if (!label && !key) {
          continue;
        }
        entries.push({ label, icon: catalog[key] || null });
      }
      return entries;
    }

    _buildItems() {
      const entries = this._collect();
      const colors = this._readColors();
      this._linkColor = colors.muted;
      this._items = entries.map((entry) => {
        if (entry.src) {
          return this._makeImageTile(entry.src);
        }
        // 没有图标（键不存在，或没给 data-icon）就退回文字药丸，不留空白
        return entry.icon
          ? this._makeIconTile(entry, colors)
          : this._makeTextTile(entry.label, colors);
      });

      // 斐波那契球面：点数不变时不动它，免得主题切换把标签位置也换了
      if (this._spheres.length !== this._items.length) {
        this._spheres = this._fibonacci(this._items.length);
        this._pairs = null;
      }
    }

    /** 球面网格的边：距离在阈值内就相连，去重后缓存（随球一起转） */
    _linkPairs() {
      if (this._pairs) {
        return this._pairs;
      }
      const points = this._spheres;
      const limit = LINK_DISTANCE_RATIO * this._radius;
      const pairs = [];
      for (let index = 0; index < points.length; index += 1) {
        for (let other = index + 1; other < points.length; other += 1) {
          const a = points[index];
          const b = points[other];
          if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) <= limit) {
            pairs.push([index, other]);
          }
        }
      }
      this._pairs = pairs;
      return pairs;
    }

    _readColors() {
      const computed = getComputedStyle(this);
      const read = (name, fallback) => (computed.getPropertyValue(name) || "").trim() || fallback;
      return {
        text: read("--text", "#14171f"),
        muted: read("--muted", "#5b6270"),
        // 文字药丸用次级面，图标徽章用最亮/最暗的那个面，
        // 这样品牌色的对比度更好算，浅色主题下徽章也不会糊进页面底色
        pillFill: read("--surface-2", "#eef1f7"),
        pillStroke: read("--line", "#dfe3ec"),
        chipFill: read("--surface", "#fff"),
        chipStroke: read("--line-strong", "#c8cedd"),
      };
    }

    _fibonacci(count) {
      const points = [];
      if (!count) {
        return points;
      }
      const offset = 2 / count;
      const increment = Math.PI * (3 - Math.sqrt(5));
      const radius = this._radius;
      for (let index = 0; index < count; index += 1) {
        const y = index * offset - 1 + offset / 2;
        const ring = Math.sqrt(Math.max(0, 1 - y * y));
        const phi = index * increment;
        points.push({
          x: Math.cos(phi) * ring * radius,
          y: y * radius,
          z: Math.sin(phi) * ring * radius,
        });
      }
      return points;
    }

    _makeTextTile(label, colors) {
      const scale = this._scale;
      const font = "600 " + Math.round(BASE_FONT * scale) + "px " + FONT_FAMILY;
      this._ctx.font = font;
      const height = BASE_TILE_HEIGHT * scale;
      const width = this._ctx.measureText(label).width + BASE_PAD * 2 * scale;
      const pixel = this._dpr;

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * pixel);
      canvas.height = Math.round(height * pixel);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(pixel, 0, 0, pixel, 0, 0);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      roundRect(ctx, 0.5, 0.5, width - 1, height - 1, (height - 1) / 2);
      ctx.fillStyle = colors.pillFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.pillStroke;
      ctx.stroke();
      ctx.fillStyle = colors.text;
      ctx.fillText(label, width / 2, height / 2 + 0.5);

      return { label, tile: canvas, width, height };
    }

    _makeIconTile(entry, colors) {
      const icon = entry.icon;
      const size = BASE_CHIP * this._scale;
      const pixel = this._dpr;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(size * pixel);
      canvas.height = Math.round(size * pixel);

      // 品牌色对照徽章底色太弱就改用正文色，否则深色主题下深色标识会糊成一团
      const iconColor =
        contrastRatio(icon.color, colors.chipFill) >= MIN_ICON_CONTRAST ? icon.color : colors.text;

      const ctx = canvas.getContext("2d");
      const paintChip = () => {
        ctx.setTransform(pixel, 0, 0, pixel, 0, 0);
        ctx.clearRect(0, 0, size, size);
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 0.5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = colors.chipFill;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.chipStroke;
        ctx.stroke();
      };
      paintChip();

      // 标识以 data URL 喂给 <img>：file:// 下也能用，而且不会污染画布
      const paths = icon.paths.map((item) => `<path d="${item}"/>`).join("");
      const markup =
        `<svg xmlns="${SVG_NS}" viewBox="0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}" ` +
        `fill="${iconColor}">${paths}</svg>`;
      const image = new Image();
      image.addEventListener("load", () => {
        paintChip();
        const side = size * ICON_RATIO;
        ctx.drawImage(image, (size - side) / 2, (size - side) / 2, side, side);
        this._render();
      });
      image.src = "data:image/svg+xml," + encodeURIComponent(markup);

      return { label: entry.label, iconColor, tile: canvas, width: size, height: size };
    }

    _makeImageTile(src) {
      const size = BASE_CHIP * this._scale;
      const pixel = this._dpr;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(size * pixel);
      canvas.height = Math.round(size * pixel);

      const image = new Image();
      // 远程图片才需要 CORS；本地 file:// 加这个反而会导致加载失败
      if (/^https?:/i.test(src)) {
        image.crossOrigin = "anonymous";
      }
      image.addEventListener("load", () => {
        const ctx = canvas.getContext("2d");
        ctx.setTransform(pixel, 0, 0, pixel, 0, 0);
        ctx.clearRect(0, 0, size, size);
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, 0, 0, size, size);
        this._render();
      });
      image.src = src;

      return { label: src, tile: canvas, width: size, height: size };
    }

    /* ----------------------------------------------------------------------
       动画
       ---------------------------------------------------------------------- */

    _updateLoop() {
      if (this._shouldRun()) {
        if (!this._raf) {
          this._last = 0;
          this._raf = requestAnimationFrame(this._onFrame);
        }
        return;
      }
      this._stopLoop();
    }

    _shouldRun() {
      return (
        this._visible && !document.hidden && (!this._paused || Boolean(this._drag || this._focus))
      );
    }

    _stopLoop() {
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
      }
    }

    _onFrame(now) {
      const delta = this._last ? Math.min(now - this._last, MAX_STEP * 16.7) : 16.7;
      this._last = now;
      this._advance(now, delta / 16.7);
      this._render();

      // 每帧重新判断要不要继续：转正动画结束、拖动松手后都要能自己停下
      this._raf = 0;
      if (this._shouldRun()) {
        this._raf = requestAnimationFrame(this._onFrame);
      }
    }

    _advance(now, step) {
      if (this._focus) {
        const { from, to, start, duration } = this._focus;
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        this._rotation.x = from.x + (to.x - from.x) * eased;
        this._rotation.y = from.y + (to.y - from.y) * eased;
        if (progress >= 1) {
          this._focus = null;
        }
        return;
      }

      // 拖动期间旋转由指针位移直接改，这里不再叠加
      if (this._drag) {
        return;
      }

      const half = this._canvasSize / 2;
      const dx = this._pointer.x - half;
      const dy = this._pointer.y - half;
      const maxDistance = Math.hypot(half, half) || 1;
      const distance = Math.min(1, Math.hypot(dx, dy) / maxDistance);
      const spin = (POINTER_SPIN.base + distance * POINTER_SPIN.range) * this._speed;

      this._rotation.x += ((dy / this._canvasSize) * spin + IDLE_SPIN.x * this._speed) * step;
      this._rotation.y += ((dx / this._canvasSize) * spin + IDLE_SPIN.y * this._speed) * step;
    }

    _project(sphere) {
      const cosX = Math.cos(this._rotation.x);
      const sinX = Math.sin(this._rotation.x);
      const cosY = Math.cos(this._rotation.y);
      const sinY = Math.sin(this._rotation.y);
      const rotatedX = sphere.x * cosY - sphere.z * sinY;
      const rotatedZ = sphere.x * sinY + sphere.z * cosY;
      const rotatedY = sphere.y * cosX + rotatedZ * sinX;
      const radius = this._radius;
      const half = this._canvasSize / 2;

      return {
        x: half + rotatedX,
        y: half + rotatedY,
        z: rotatedZ,
        scale: Math.max(MIN_SCALE, (rotatedZ + SCALE_OFFSET * radius) / (SCALE_SPAN * radius)),
        opacity: Math.max(
          MIN_OPACITY,
          Math.min(1, (rotatedZ + OPACITY_OFFSET * radius) / (OPACITY_SPAN * radius)),
        ),
      };
    }

    _render() {
      const ctx = this._ctx;
      const size = this._canvasSize;
      if (!ctx || !size) {
        return;
      }

      ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const points = [];
      for (let index = 0; index < this._items.length; index += 1) {
        const sphere = this._spheres[index];
        points.push(sphere ? this._project(sphere) : null);
      }

      // 先连线：连起来才看得出这些标签长在一个球面上
      if (this._showLinks && this._linkColor) {
        ctx.strokeStyle = this._linkColor;
        ctx.lineCap = "round";
        for (const [first, second] of this._linkPairs()) {
          const a = points[first];
          const b = points[second];
          if (!a || !b) {
            continue;
          }
          const depth = clamp01(((a.z + b.z) / 2 + this._radius) / (2 * this._radius));
          ctx.globalAlpha = LINK_ALPHA_MIN + LINK_ALPHA_SPAN * depth;
          ctx.lineWidth = LINK_WIDTH_MIN + LINK_WIDTH_SPAN * depth;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      const drawn = [];
      for (let index = 0; index < this._items.length; index += 1) {
        if (points[index]) {
          drawn.push({ item: this._items[index], point: points[index] });
        }
      }
      // 远的先画：近处的标签不会反过来被远处的盖住
      drawn.sort((a, b) => a.point.z - b.point.z);

      for (const entry of drawn) {
        const { item, point } = entry;
        if (!item.tile) {
          continue;
        }
        ctx.save();
        ctx.globalAlpha = point.opacity;
        ctx.translate(point.x, point.y);
        ctx.scale(point.scale, point.scale);
        ctx.drawImage(item.tile, -item.width / 2, -item.height / 2, item.width, item.height);
        ctx.restore();
      }
    }

    /* ----------------------------------------------------------------------
       指针交互
       ---------------------------------------------------------------------- */

    _localPoint(event) {
      const box = this._canvas.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    }

    _hitTest(x, y) {
      let best = -1;
      let bestZ = Number.NEGATIVE_INFINITY;
      for (let index = 0; index < this._spheres.length; index += 1) {
        const item = this._items[index];
        if (!item) {
          continue;
        }
        const point = this._project(this._spheres[index]);
        const halfWidth = (item.width * point.scale) / 2;
        const halfHeight = (item.height * point.scale) / 2;
        const inside =
          x >= point.x - halfWidth &&
          x <= point.x + halfWidth &&
          y >= point.y - halfHeight &&
          y <= point.y + halfHeight;
        if (inside && point.z > bestZ) {
          best = index;
          bestZ = point.z;
        }
      }
      return best;
    }

    _onPointerDown(event) {
      // 触屏交给页面滚动，不接管拖动
      if (event.pointerType === "touch") {
        return;
      }
      const point = this._localPoint(event);
      const hit = this._hitTest(point.x, point.y);
      if (hit >= 0) {
        this._focusOn(hit);
        return;
      }
      this._drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      this._canvas.classList.add("is-dragging");
      this._canvas.setPointerCapture(event.pointerId);
      this._updateLoop();
    }

    _onPointerMove(event) {
      const point = this._localPoint(event);
      this._pointer.x = point.x;
      this._pointer.y = point.y;

      if (this._drag && this._drag.id === event.pointerId) {
        this._rotation.x += (event.clientY - this._drag.y) * DRAG_RATE;
        this._rotation.y += (event.clientX - this._drag.x) * DRAG_RATE;
        this._drag.x = event.clientX;
        this._drag.y = event.clientY;
        this._focus = null;
        this._render();
        return;
      }

      if (!this._drag) {
        this._canvas.classList.toggle("is-over-item", this._hitTest(point.x, point.y) >= 0);
      }
    }

    _onPointerUp(event) {
      if (!this._drag || this._drag.id !== event.pointerId) {
        return;
      }
      if (this._canvas.hasPointerCapture(event.pointerId)) {
        this._canvas.releasePointerCapture(event.pointerId);
      }
      this._drag = null;
      this._canvas.classList.remove("is-dragging");
      this._updateLoop();
    }

    _onPointerLeave() {
      // 指针离开后退回默认位置，常态自转与「从未悬停过」保持一致
      this._pointer.x = 0;
      this._pointer.y = 0;
      this._canvas.classList.remove("is-over-item");
    }

    _focusOn(index) {
      const sphere = this._spheres[index];
      if (!sphere) {
        return;
      }
      const from = { x: this._rotation.x, y: this._rotation.y };
      const to = {
        x: nearestAngle(from.x, -Math.atan2(sphere.y, Math.hypot(sphere.x, sphere.z))),
        y: nearestAngle(from.y, Math.atan2(sphere.x, sphere.z)),
      };
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const duration = Math.min(FOCUS_MAX_MS, Math.max(FOCUS_MIN_MS, distance * FOCUS_MS_PER_RAD));
      this._focus = { from, to, start: performance.now(), duration };
      this._updateLoop();
    }
  }

  window.customElements.define(TAG, DiaIconCloud);
})();
