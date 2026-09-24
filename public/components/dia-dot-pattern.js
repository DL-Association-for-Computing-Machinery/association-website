/*
 * <dia-dot-pattern> —— magicui Dot Pattern 的原生移植（零框架、无构建）。
 *
 * 一片铺满宿主的圆点阵列（Canvas 2D）。默认静止；带 glow 属性时圆点
 * 以错峰的正弦脉冲呼吸（透明度 0.4 → 1、半径 ×1 → ×1.5），与参考实现
 * 的 motion 循环同参数。圆点颜色取宿主的 color（画布拿不到 CSS 变量，
 * 由 getComputedStyle 解析，主题切换时随 class 变化重取）。
 *
 * 与参考实现的差异（都是本仓库的既有约定）：
 *   1. 随机延迟改为按序号散列（sin(i * 12.9898) * 43758.5453 取小数），
 *      每次刷新一致，截图与断言才稳定；
 *   2. 整层可能几千个点，逐帧只重绘画在视口里的那一条带，其余不动；
 *      宿主可能是 sticky 的（钉在视口上、位置随滚动变），所以每帧取
 *      实时 getBoundingClientRect，不缓存文档偏移；
 *   3. 减少动效时退回一张静帧；不在视口、标签页隐藏时停帧。
 *
 * 用法：<dia-dot-pattern class="page-dots" spacing="20" glow></dia-dot-pattern>
 * 宿主自己负责定位（绝对定位铺满父容器）与 color；组件只管画。
 */
(function () {
  "use strict";

  const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
  const MOBILE_LITE = "(max-width: 48rem)";

  if (!customElements.get("dia-dot-pattern")) {
    class DiaDotPattern extends HTMLElement {
      static get observedAttributes() {
        return ["spacing", "radius", "glow"];
      }

      constructor() {
        super();
        this._ready = false;
        this._canvas = null;
        this._ctx = null;
        this._observer = null;
        this._intersection = null;
        this._motionQuery = null;
        this._themeObserver = null;
        this._raf = 0;
        /* 视口是否扫到本层、文档是否可见，两者都成立才跑帧 */
        this._inView = false;
        this._pageVisible = true;
      }

      connectedCallback() {
        this._ready = true;
        /* 纯装饰：不进读屏、不接指针 */
        this.setAttribute("aria-hidden", "true");

        this._canvas = document.createElement("canvas");
        this._canvas.style.display = "block";
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this.appendChild(this._canvas);
        this._ctx = this._canvas.getContext("2d");

        this._motionQuery = window.matchMedia(REDUCED_MOTION);
        this._mobileQuery = window.matchMedia(MOBILE_LITE);
        this._motionListener = () => this._sync();
        this._motionQuery.addEventListener("change", this._motionListener);
        this._mobileQuery.addEventListener("change", this._motionListener);

        /* 宿主尺寸变化（含首帧布局完成）时重建画布 */
        this._observer = new ResizeObserver(() => this._resize());
        this._observer.observe(this);

        this._intersection = new IntersectionObserver((entries) => {
          this._inView = entries.some((entry) => entry.isIntersecting);
          this._sync();
        });
        this._intersection.observe(this);

        document.addEventListener("visibilitychange", () => {
          this._pageVisible = !document.hidden;
          this._sync();
        });

        /* 圆点颜色随主题 class 变化，重取一次并重画 */
        this._themeObserver = new MutationObserver(() => this._sync());
        this._themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        this._themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });

        this._resize();
      }

      disconnectedCallback() {
        this._ready = false;
        if (this._observer) this._observer.disconnect();
        if (this._intersection) this._intersection.disconnect();
        if (this._themeObserver) this._themeObserver.disconnect();
        if (this._motionQuery)
          this._motionQuery.removeEventListener("change", this._motionListener);
        if (this._mobileQuery)
          this._mobileQuery.removeEventListener("change", this._motionListener);
        cancelAnimationFrame(this._raf);
        this._raf = 0;
      }

      attributeChangedCallback() {
        if (!this._ready) return;
        this._resize();
      }

      get _glow() {
        return this.hasAttribute("glow");
      }

      get _spacing() {
        const value = Number.parseFloat(this.getAttribute("spacing"));
        return Number.isFinite(value) && value >= 4 ? value : 20;
      }

      get _radius() {
        const value = Number.parseFloat(this.getAttribute("radius"));
        return Number.isFinite(value) && value > 0 ? value : 1.1;
      }

      _resize() {
        if (!this._ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.round(this.clientWidth));
        const height = Math.max(1, Math.round(this.clientHeight));
        this._canvas.width = Math.round(width * dpr);
        this._canvas.height = Math.round(height * dpr);
        this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this._sync();
      }

      /* 根据当前状态决定跑帧还是画一张静帧 */
      _sync() {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
        if (!this._ctx) return;

        const animate =
          this._glow &&
          this._inView &&
          this._pageVisible &&
          !this._motionQuery.matches &&
          !this._mobileQuery.matches;

        if (animate) {
          const tick = (timestamp) => {
            this._draw(timestamp / 1000);
            this._raf = requestAnimationFrame(tick);
          };
          /* 标记是背景层的帧：页面级校验（retro-check）数 rAF 判断网格停帧时，
             要把这条合法的常驻动画排除掉 */
          tick.__diaBackgroundFrame = true;
          this._raf = requestAnimationFrame(tick);
        } else {
          this._draw(0);
        }
      }

      _draw(time) {
        const ctx = this._ctx;
        const width = this.clientWidth;
        const height = this.clientHeight;
        if (width < 1 || height < 1) return;

        const color = this._resolveColor();
        if (!color) return;

        const spacing = this._spacing;
        const radius = this._radius;
        const reduced = this._motionQuery.matches;
        const glow = this._glow && !reduced;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;

        /* 只画视口扫到的那条带：整层几千个点，逐帧全画不值。
           宿主可能 sticky（钉在视口上、位置随滚动变），每帧取实时位置，
           不能缓存文档偏移。视口坐标 y_v = 宿主坐标 y_h + hostTop，
           可见带因此是 y_h ∈ [-hostTop, innerHeight - hostTop]。 */
        const hostTop = this.getBoundingClientRect().top;
        const bandTop = Math.max(0, -hostTop - spacing);
        const bandBottom = Math.min(height, window.innerHeight - hostTop + spacing);
        const firstRow = Math.max(0, Math.floor(bandTop / spacing));
        const lastRow = Math.min(Math.ceil(height / spacing), Math.ceil(bandBottom / spacing));
        const cols = Math.ceil(width / spacing);

        for (let row = firstRow; row < lastRow; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const index = row * cols + col;
            const x = col * spacing + spacing / 2;
            const y = row * spacing + spacing / 2;
            let alpha = 0.55;
            let size = radius;

            if (glow) {
              /* 按序号散列出相位与周期：分布零散，但每次刷新一致 */
              const phase = this._hash(index) * Math.PI * 2;
              const period = 2 + this._hash(index + 7919) * 3;
              const pulse = 0.5 - 0.5 * Math.cos((time / period) * Math.PI * 2 + phase);
              alpha = 0.4 + pulse * 0.6;
              size = radius * (1 + pulse * 0.5);
            }

            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      /* 画布读不到 CSS 变量，从宿主的 computed color 拿解析结果 */
      _resolveColor() {
        const value = getComputedStyle(this).color;
        return value && value !== "none" ? value : null;
      }

      _hash(index) {
        const value = Math.sin(index * 12.9898) * 43758.5453;
        return value - Math.floor(value);
      }
    }

    customElements.define("dia-dot-pattern", DiaDotPattern);
  }
})();
