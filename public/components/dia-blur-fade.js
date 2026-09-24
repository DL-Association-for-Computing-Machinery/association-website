/* ==========================================================================
   <dia-blur-fade> · 模糊淡入
   --------------------------------------------------------------------------
   内容从「偏移 + 模糊 + 透明」过渡到原位清晰可见，常用于滚动到位后逐条浮现。
   原生 Web Component：无框架、无依赖、无构建，`<script src>` 引入即用。

   用法（把要浮现的内容放进去即可）：
     <dia-blur-fade in-view delay="0.2">
       <p>东华理工大学计算机协会……</p>
     </dia-blur-fade>

   属性（与参考实现的 props 一一对应）
     duration        过渡时长（秒），默认 0.4。
     delay           延迟（秒），默认 0。起点还要再加 0.04s，与参考实现一致。
     offset          偏移量（像素），默认 6。
     direction       偏移方向：down / up / left / right，默认 down。
     in-view         布尔，默认 false。设为 true 时进入视口才开始，只播一次。
     in-view-margin  触发用的 rootMargin，默认 -50px（元素要再进入视口 50px）。
     blur            初始模糊量，默认 6px。

   说明
     · 这是个包裹型组件：子元素留在原位不动，动画直接作用在宿主元素上，
       因此没有影子树，页面样式可以照常命中里面的内容。
     · 宿主默认是行内元素，页面需给它 display: block（见 styles.css）。
     · 初始隐藏完全由脚本施加：脚本没跑起来时内容正常可见，不会白屏。
     · 落定后清掉行内样式，不留下常驻的 filter / transform 合成层。
     · 减少动效：prefers-reduced-motion: reduce 时不隐藏也不过渡，直接可见。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-blur-fade";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  // 与参考实现一致的默认值
  const DEFAULT_DURATION = 0.4;
  const DEFAULT_DELAY = 0;
  const DEFAULT_OFFSET = 6;
  const DEFAULT_BLUR = "6px";
  const DEFAULT_MARGIN = "-50px";
  // 参考实现的 transition delay 是 0.04 + delay，即便 delay 为 0 也有 40ms
  const BASE_DELAY = 0.04;
  const DIRECTIONS = ["down", "up", "left", "right"];

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

  class DiaBlurFade extends HTMLElement {
    static get observedAttributes() {
      return ["duration", "delay", "offset", "direction", "in-view", "in-view-margin", "blur"];
    }

    constructor() {
      super();
      this._observer = null;
      this._timer = 0;

      this._onMotionChange = () => {
        if (reduceMotion.matches) {
          this._cancel();
          this._reset();
        } else {
          this._play();
        }
      };
    }

    connectedCallback() {
      this._ready = true;
      this._read();
      reduceMotion.addEventListener("change", this._onMotionChange);

      if (reduceMotion.matches) {
        // 不隐藏，直接给最终状态
        this._reset();
        return;
      }

      if (!this._inView || typeof IntersectionObserver !== "function") {
        this._play();
        return;
      }

      // 未进入视口时保持隐藏。rootMargin 为负值时，元素要再多进一段才触发。
      this._hide();
      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            this._disconnect();
            this._play();
          }
        },
        { rootMargin: this._margin },
      );
      this._observer.observe(this);
    }

    disconnectedCallback() {
      this._cancel();
      reduceMotion.removeEventListener("change", this._onMotionChange);
    }

    attributeChangedCallback(name, previous, next) {
      // 升级自定义元素时，浏览器会为每个已存在的属性回调一次，而且发生在
      // connectedCallback 之前。那时若照常播放，它留下的计时器会在稍后把
      // 「隐藏态」清掉，视口外的内容就提前露出来了 —— 所以这里等 _ready 落定。
      if (previous === next || !this._ready) {
        return;
      }
      this._read();
      if (reduceMotion.matches) {
        this._reset();
        return;
      }
      this._play();
    }

    /* ----------------------------------------------------------------------
       参数
       ---------------------------------------------------------------------- */

    _read() {
      this._duration = readNumber(this, "duration", DEFAULT_DURATION);
      this._delay = readNumber(this, "delay", DEFAULT_DELAY);
      this._offset = readNumber(this, "offset", DEFAULT_OFFSET);
      this._blur = (this.getAttribute("blur") || DEFAULT_BLUR).trim();
      this._margin = (this.getAttribute("in-view-margin") || DEFAULT_MARGIN).trim();
      this._inView = readFlag(this, "in-view", false);

      const direction = (this.getAttribute("direction") || "down").trim().toLowerCase();
      this._direction = DIRECTIONS.includes(direction) ? direction : "down";
    }

    // left / right 走横轴，up / down 走纵轴
    _axis() {
      return this._direction === "left" || this._direction === "right" ? "X" : "Y";
    }

    // 参考实现里 down 与 right 都是负偏移，元素从「上/左」推进来
    _hiddenOffset() {
      return this._direction === "down" || this._direction === "right"
        ? -this._offset
        : this._offset;
    }

    _shift(amount) {
      return `translate${this._axis()}(${amount}px)`;
    }

    _total() {
      return BASE_DELAY + this._delay + this._duration;
    }

    _transition() {
      const easing = `${this._duration}s ease-out ${BASE_DELAY + this._delay}s`;
      return [`opacity ${easing}`, `transform ${easing}`, `filter ${easing}`].join(", ");
    }

    /* ----------------------------------------------------------------------
       播放
       ---------------------------------------------------------------------- */

    _hide() {
      this._cancel();
      this.style.transition = "none";
      this.style.opacity = "0";
      this.style.filter = `blur(${this._blur})`;
      this.style.transform = this._shift(this._hiddenOffset());
    }

    _play() {
      // 先把初始态坐实：同一帧里改到可见态会被浏览器合并，过渡不会触发。
      void this.offsetWidth;
      this.style.transition = this._transition();
      this.style.opacity = "1";
      this.style.filter = "blur(0)";
      this.style.transform = this._shift(0);

      this._timer = window.setTimeout(
        () => {
          this._timer = 0;
          // 落定后把行内样式摘掉，不留常驻合成层
          this._reset();
        },
        this._total() * 1000 + 50,
      );
    }

    _reset() {
      this.style.removeProperty("opacity");
      this.style.removeProperty("transform");
      this.style.removeProperty("filter");
      this.style.removeProperty("transition");
    }

    _cancel() {
      this._disconnect();
      if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = 0;
      }
    }

    _disconnect() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  }

  window.customElements.define(TAG, DiaBlurFade);
})();
