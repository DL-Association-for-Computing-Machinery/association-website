/* ==========================================================================
   <dia-dock> · 跟随指针放大的导航条（macOS Dock 的那套手感）
   --------------------------------------------------------------------------
   指针在导航条上横向移动时，离指针最近的一项放大、两侧按距离递减，
   整排被顶开、胶囊跟着变宽，就像 macOS 底部那条 Dock。
   原生 Web Component：无框架、无依赖、无构建，`<script src>` 引入即用。

   用法（子元素就是导航项，一般是一组 <a>）：
     <dia-dock scale="1.35" distance="140">
       <a class="dock-item" href="#about">探索计协</a>
       <a class="dock-item" href="#honors">竞赛荣誉</a>
     </dia-dock>

   属性
     scale                 放大系数上限，默认 1.45（1 表示不放大）。
     distance              放大影响半径（px），默认 140；超出这个距离的项保持原大。
     disable-magnification 布尔。关掉放大，只保留导航本身。

   实现要点
     · 放大改的是每一项的 font-size（`--dock-font` × 系数），字号真实变化，
       文字由浏览器按新字号重排重绘，不会像 transform: scale 那样把字放大成虚的；
       内边距写成 em，于是命中区域跟着一起长。
     · 每项的"基准中心"只在未放大时量一次并缓存，动画期间不回读布局，
       所以没有"测量 → 位移 → 再测量"的反馈抖动；只在窗口尺寸变化、
       字体加载完成、以及指针离开后落定时重新量。
     · 位移用指数平滑逼近目标（时间常数 80ms）。参考实现那根
       过阻尼弹簧（mass .1 / stiffness 150 / damping 12）的慢极点约 12.5 rad/s，
       这里取的 1/0.08s 与之基本等价，同样没有回弹振荡。
     · 键盘焦点驱动同一套放大：焦点落在哪一项，哪一项最大。
     · 减少动效、粗指针设备（触摸）、以及竖排布局（移动端抽屉）下自动不放大。
     · 脚本未执行时组件不升级，子元素就是普通的可点链接，导航照常可用。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-dock";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  const DEFAULT_SCALE = 1.45;
  const DEFAULT_DISTANCE = 140;
  /** 指数平滑的时间常数（秒）：越小越跟手，越大越"懒"。 */
  const SMOOTHING_TAU = 0.08;
  /** 与目标的差值小于这个量就当作到位，停掉动画帧，避免空转。 */
  const SETTLE_EPSILON = 0.0008;
  /** 相邻两项的顶部差超过这么多像素，就认定为竖排（移动端抽屉）。 */
  const STACK_TOLERANCE = 4;
  /** 单帧最大时长，防止切标签页回来时一步跳到位。 */
  const MAX_STEP_SECONDS = 0.064;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /** 基准字号由页面给（`--dock-font`），组件只负责乘一个系数。 */
  const BASE_FONT = "var(--dock-font, 1rem)";

  function readNumber(element, name, fallback, min) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const value = Number.parseFloat(element.getAttribute(name));
    return Number.isFinite(value) && value >= min ? value : fallback;
  }

  function readFlag(element, name, fallback) {
    if (!element.hasAttribute(name)) {
      return fallback;
    }
    const raw = (element.getAttribute(name) || "").trim();
    return raw === "" ? true : !/^(false|0|no|off)$/i.test(raw);
  }

  class DiaDock extends HTMLElement {
    static get observedAttributes() {
      return ["scale", "distance", "disable-magnification"];
    }

    constructor() {
      super();

      this._ready = false;
      this._items = [];
      /** 每项在"未放大"状态下的中心横坐标（视口坐标），动画期间只读不写。 */
      this._centers = [];
      this._values = [];
      this._targets = [];
      this._anchor = null;
      this._stacked = false;
      this._frame = 0;
      this._lastTime = 0;
      this._listening = false;

      this._onPointerEnter = (event) => {
        this._moveAnchor(event.clientX);
      };

      this._onPointerMove = (event) => {
        this._moveAnchor(event.clientX);
      };

      this._onPointerLeave = () => {
        this._anchor = null;
        this._retarget();
      };

      this._onFocusIn = (event) => {
        const index = this._items.indexOf(this._itemOf(event.target));
        if (index < 0) {
          return;
        }
        this._anchor = this._centers[index];
        this._retarget();
      };

      this._onFocusOut = (event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && this.contains(next)) {
          return;
        }
        this._anchor = null;
        this._retarget();
      };

      this._onSync = () => {
        this._measure();
        this._retarget();
      };

      this._tick = (time) => {
        this._frame = 0;

        const elapsed = this._lastTime ? (time - this._lastTime) / 1000 : 0;
        this._lastTime = time;
        const step = Math.min(MAX_STEP_SECONDS, Math.max(0, elapsed));
        const alpha = step > 0 ? 1 - Math.exp(-step / SMOOTHING_TAU) : 0;
        let moving = false;

        for (let index = 0; index < this._values.length; index += 1) {
          const target = this._targets[index];
          const next = this._values[index] + (target - this._values[index]) * alpha;
          if (Math.abs(target - next) > SETTLE_EPSILON) {
            moving = true;
          }
          this._values[index] = next;
        }

        this._apply();

        if (moving) {
          this._frame = requestAnimationFrame(this._tick);
          return;
        }

        // 落定：系数对齐到目标，顺手重测基准中心（只在完全静止时做，避免动画中强制重排）。
        this._values = this._targets.slice();
        this._apply();
        if (this._anchor === null) {
          this._measure();
        }
      };
    }

    connectedCallback() {
      this._ready = true;
      this._collect();
      this._listen();
      this._measure();
      this._retarget();

      reduceMotion.addEventListener("change", this._onSync);
      finePointer.addEventListener("change", this._onSync);
      window.addEventListener("resize", this._onSync);

      // 字体加载完成后字宽会变，基准中心要重量一次。
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready
          .then(() => {
            if (this.isConnected) {
              this._onSync();
            }
          })
          .catch(() => {});
      }
    }

    disconnectedCallback() {
      this._stopFrames();
      this._unlisten();
      reduceMotion.removeEventListener("change", this._onSync);
      finePointer.removeEventListener("change", this._onSync);
      window.removeEventListener("resize", this._onSync);
    }

    attributeChangedCallback(name, previous, next) {
      // 解析阶段属性先于 connectedCallback 落定，此时还没收集子项。
      if (!this._ready || previous === next) {
        return;
      }
      this._onSync();
    }

    /* ----------------------------------------------------------------------
       结构
       ---------------------------------------------------------------------- */

    _collect() {
      this._items = [...this.children].filter((child) => child instanceof HTMLElement);
      this._values = this._items.map(() => 1);
      this._targets = this._items.map(() => 1);
      this._centers = this._items.map(() => 0);
    }

    _itemOf(node) {
      let current = node instanceof Element ? node : null;
      while (current && current !== this) {
        if (this._items.indexOf(current) >= 0) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    }

    _listen() {
      if (this._listening) {
        return;
      }
      this._listening = true;
      this.addEventListener("pointerenter", this._onPointerEnter);
      this.addEventListener("pointermove", this._onPointerMove);
      this.addEventListener("pointerleave", this._onPointerLeave);
      this.addEventListener("focusin", this._onFocusIn);
      this.addEventListener("focusout", this._onFocusOut);
    }

    _unlisten() {
      if (!this._listening) {
        return;
      }
      this._listening = false;
      this.removeEventListener("pointerenter", this._onPointerEnter);
      this.removeEventListener("pointermove", this._onPointerMove);
      this.removeEventListener("pointerleave", this._onPointerLeave);
      this.removeEventListener("focusin", this._onFocusIn);
      this.removeEventListener("focusout", this._onFocusOut);
    }

    /* ----------------------------------------------------------------------
       量基准
       ---------------------------------------------------------------------- */

    /**
     * 量出每项的基准中心，同时判断是不是竖排（移动端抽屉里项是上下堆叠的，
     * 那时"按横向距离放大"没有意义，直接停用）。测量前把所有行内字号清掉，
     * 量到的才是未放大状态；量完立刻写回，同一帧内完成，不会闪。
     */
    _measure() {
      if (this.children.length !== this._items.length) {
        this._collect();
      }

      const items = this._items;
      if (!items.length) {
        return;
      }

      const restore = items.map((item) => item.style.fontSize);
      for (const item of items) {
        item.style.fontSize = "";
      }

      const boxes = items.map((item) => item.getBoundingClientRect());
      this._centers = boxes.map((box) => box.left + box.width / 2);
      const firstTop = Math.round(boxes[0].top);
      this._stacked = boxes.some(
        (box) => Math.abs(Math.round(box.top) - firstTop) > STACK_TOLERANCE,
      );

      for (let index = 0; index < items.length; index += 1) {
        items[index].style.fontSize = restore[index];
      }
    }

    /* ----------------------------------------------------------------------
       目标与位移
       ---------------------------------------------------------------------- */

    _canMagnify() {
      return (
        this._ready &&
        this._items.length > 1 &&
        !this._stacked &&
        !readFlag(this, "disable-magnification", false) &&
        !reduceMotion.matches &&
        finePointer.matches
      );
    }

    _moveAnchor(x) {
      if (!this._canMagnify()) {
        return;
      }
      this._anchor = x;
      this._retarget();
    }

    _retarget() {
      const enabled = this._canMagnify();
      const anchor = enabled ? this._anchor : null;
      const scale = Math.max(1, readNumber(this, "scale", DEFAULT_SCALE, 0));
      const distance = Math.max(1, readNumber(this, "distance", DEFAULT_DISTANCE, 1));

      for (let index = 0; index < this._items.length; index += 1) {
        if (anchor === null) {
          this._targets[index] = 1;
          continue;
        }
        const offset = Math.abs(anchor - this._centers[index]);
        const weight = offset >= distance ? 0 : 1 - offset / distance;
        this._targets[index] = 1 + (scale - 1) * weight;
      }

      // 放大被整体关掉（减少动效、触摸、竖排）：直接落定，别留一段慢慢缩回去的尾巴。
      if (!enabled) {
        this._values = this._targets.slice();
        this._apply();
        this._stopFrames();
        return;
      }

      this._startFrames();
    }

    _startFrames() {
      if (this._frame) {
        return;
      }
      this._lastTime = 0;
      this._frame = requestAnimationFrame(this._tick);
    }

    _stopFrames() {
      if (this._frame) {
        cancelAnimationFrame(this._frame);
        this._frame = 0;
      }
    }

    _apply() {
      for (let index = 0; index < this._items.length; index += 1) {
        const value = this._values[index];
        this._items[index].style.fontSize =
          Math.abs(value - 1) < 0.0005 ? "" : `calc(${BASE_FONT} * ${value.toFixed(4)})`;
      }
    }
  }

  window.customElements.define(TAG, DiaDock);
})();
