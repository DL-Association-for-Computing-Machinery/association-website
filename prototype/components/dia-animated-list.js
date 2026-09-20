/* ==========================================================================
   <dia-animated-list> · 流式播放列表
   --------------------------------------------------------------------------
   列表项按顺序逐条浮现：每一条从「缩小 + 上移 + 透明」弹回原位，后出现的条目
   插在最上方，把已经在场的条目平滑往下推 —— 与 MagicUI 的 Animated List 一致。
   原生 Web Component：无框架、无依赖、无构建，`<script src>` 引入即用。

   用法（把列表整个放进来即可）：
     <dia-animated-list delay="520" start-on-view>
       <ul class="award-list">
         <li class="award-item">……</li>
       </ul>
     </dia-animated-list>

   属性（与参考实现的 props 对应）
     delay            两条之间的间隔（毫秒），默认 1000。
     duration         单条弹出的时长（毫秒），默认 520。
     offset           入场前的纵向上移量（像素），默认 6。
     scale            入场前的缩放比，默认 0.88。
     start-on-view    布尔，默认 true。进入视口后才开始，只播一次。
     in-view-margin   触发用的 rootMargin，默认 -60px。
     stop-when-hidden 布尔，默认 true。标签页切到后台或滚出视口时暂停，回到
                      可见状态后从断点续播，不会一次全放完。

   说明
     · 子列表留在原位不动，动画直接写在每个子项的行内样式上，因此没有影子树，
       页面样式可以照常命中 `.award-item` 之类的内容样式。
     · 初始隐藏完全由脚本施加：脚本没跑起来时列表正常可见可读，不会白屏。
     · 播完后清掉全部行内样式，不留常驻的合成层。
     · 收尾时把子项按「后进在上」的顺序落定进 DOM，视觉顺序与读屏顺序一致，
       不会出现「看得见一套顺序、读屏听见另一套」。
     · 减少动效：prefers-reduced-motion: reduce 时不做动画、不做位移，直接全部
       可见，并且同样按最终顺序落定。
   ========================================================================== */

(function () {
  "use strict";

  const TAG = "dia-animated-list";

  if (!window.customElements || window.customElements.get(TAG)) {
    return;
  }

  // 与参考实现一致的默认值（delay 1000ms；弹性手感改用带轻微回弹的缓动近似）
  const DEFAULT_DELAY = 1000;
  const DEFAULT_DURATION = 520;
  const DEFAULT_OFFSET = 6;
  const DEFAULT_SCALE = 0.88;
  const DEFAULT_MARGIN = "-60px";
  // stiffness 350 / damping 40 的弹簧近似：收尾时略微过冲一点点
  const EASE = "cubic-bezier(0.22, 1.18, 0.36, 1)";
  // 落定后再多等一拍才摘行内样式，避免把「过渡的最后一帧」当成终点
  const SETTLE_GRACE = 80;

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

  class DiaAnimatedList extends HTMLElement {
    static get observedAttributes() {
      return [
        "delay",
        "duration",
        "offset",
        "scale",
        "start-on-view",
        "in-view-margin",
        "stop-when-hidden",
      ];
    }

    constructor() {
      super();
      this._ready = false;
      this._running = false;
      this._visible = false;
      this._shown = 0;
      this._items = [];
      this._mounted = new Set();
      this._timer = 0;
      this._settleTimer = 0;
      this._observer = null;
      this._list = this;

      this._onMotionChange = () => {
        if (reduceMotion.matches) {
          this._settleAll();
        } else {
          this._restart();
        }
      };

      this._onVisibilityChange = () => {
        this._sync();
      };
    }

    connectedCallback() {
      // 升级自定义元素时，浏览器会为每个已存在的属性各回调一次
      // attributeChangedCallback，而且发生在 connectedCallback 之前。
      // 这里用 _ready 标记「结构已经就绪」，避免那几次回调提前把动画放出去。
      this._ready = true;
      this._read();
      this._collect();
      reduceMotion.addEventListener("change", this._onMotionChange);
      document.addEventListener("visibilitychange", this._onVisibilityChange);

      if (reduceMotion.matches) {
        this._settleAll();
        return;
      }

      if (!this._startOnView || typeof IntersectionObserver !== "function") {
        this._visible = true;
        this._start();
        return;
      }

      this._hideAll();
      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            this._visible = entry.isIntersecting;
          }
          this._sync();
        },
        { rootMargin: this._margin },
      );
      this._observer.observe(this);
    }

    disconnectedCallback() {
      this._cancel();
      reduceMotion.removeEventListener("change", this._onMotionChange);
      document.removeEventListener("visibilitychange", this._onVisibilityChange);
    }

    attributeChangedCallback(name, previous, next) {
      // 升级期的那几次回调还没有结构，直接跳过（见 connectedCallback 的说明）。
      if (previous === next || !this._ready) {
        return;
      }
      this._read();
      if (reduceMotion.matches) {
        this._settleAll();
        return;
      }
      this._restart();
    }

    /* ----------------------------------------------------------------------
       参数与结构
       ---------------------------------------------------------------------- */

    _read() {
      this._delay = readNumber(this, "delay", DEFAULT_DELAY);
      this._duration = readNumber(this, "duration", DEFAULT_DURATION);
      this._offset = readNumber(this, "offset", DEFAULT_OFFSET);
      this._scale = readNumber(this, "scale", DEFAULT_SCALE);
      this._margin = (this.getAttribute("in-view-margin") || DEFAULT_MARGIN).trim();
      this._startOnView = readFlag(this, "start-on-view", true);
      this._stopWhenHidden = readFlag(this, "stop-when-hidden", true);
    }

    // 列表容器：优先取宿主直接子级的 ul / ol，其次任意层级的，最后退回宿主本身。
    _collect() {
      this._list =
        this.querySelector(":scope > ul, :scope > ol") || this.querySelector("ul, ol") || this;
      this._items = [...this._list.children];
      this._mounted = new Set();
      this._shown = 0;
    }

    /* ----------------------------------------------------------------------
       动画
       ---------------------------------------------------------------------- */

    _transition() {
      return `opacity ${this._duration}ms ${EASE}, transform ${this._duration}ms ${EASE}`;
    }

    _hiddenTransform() {
      return `translateY(${-this._offset}px) scale(${this._scale})`;
    }

    _hide(item) {
      item.style.transition = "none";
      item.style.opacity = "0";
      item.style.transform = this._hiddenTransform();
    }

    _hideAll() {
      for (const item of this._items) {
        this._hide(item);
      }
      this._state("idle");
    }

    _show(item) {
      // 先把隐藏态坐实：同一帧里改到可见态会被浏览器合并，过渡不会触发。
      this._hide(item);
      void item.offsetWidth;
      item.style.transition = this._transition();
      item.style.opacity = "1";
      item.style.transform = "none";
    }

    _reset(item) {
      item.style.removeProperty("opacity");
      item.style.removeProperty("transform");
      item.style.removeProperty("transition");
    }

    _state(value) {
      this.dataset.state = value;
      this.dataset.shown = String(this._shown);
    }

    /* ----------------------------------------------------------------------
       播放
       ---------------------------------------------------------------------- */

    _start() {
      if (this._running || this._shown >= this._items.length) {
        return;
      }
      this._running = true;
      this._state("running");
      this._advance();
    }

    // 放一条，然后按间隔排下一条
    _advance() {
      if (!this._running) {
        return;
      }
      if (!this._canRun()) {
        // 不可见：就地挂起，回到可见状态时由 _sync() 接着排
        return;
      }

      const item = this._items[this._shown];
      if (!item) {
        this._finish();
        return;
      }

      // FLIP：先记下在场条目现在的位置，插入新条目后再量一次，
      // 用差值把它们从旧位置滑到新位置，做出「被顶下去」的连续感。
      const before = new Map();
      for (const shown of this._mounted) {
        before.set(shown, shown.getBoundingClientRect().top);
      }

      this._list.prepend(item);
      this._mounted.add(item);
      this._shown += 1;
      this._show(item);
      this._state("running");

      for (const [shown, from] of before) {
        const shift = from - shown.getBoundingClientRect().top;
        if (Math.abs(shift) < 0.5) {
          continue;
        }
        const previous = shown.style.transition;
        shown.style.transition = "none";
        shown.style.transform = `translateY(${shift}px)`;
        void shown.offsetWidth;
        shown.style.transition = previous;
        shown.style.transform = "none";
      }

      if (this._shown < this._items.length) {
        this._schedule();
      } else {
        this._finish();
      }
    }

    _schedule() {
      this._clearTimer();
      this._timer = window.setTimeout(() => {
        this._timer = 0;
        this._advance();
      }, this._delay);
    }

    _finish() {
      this._running = false;
      this._clearTimer();
      this._state("done");
      // 等最后一条也落定，再统一摘掉行内样式
      this._clearSettleTimer();
      this._settleTimer = window.setTimeout(() => {
        this._settleTimer = 0;
        for (const item of this._items) {
          this._reset(item);
        }
      }, this._duration + SETTLE_GRACE);
    }

    // 减少动效：不做动画直接全部可见，但顺序仍按「后进在上」落定
    _settleAll() {
      this._cancel();
      for (const item of this._items) {
        this._reset(item);
      }
      for (const item of this._items) {
        this._list.prepend(item);
      }
      this._mounted = new Set(this._items);
      this._shown = this._items.length;
      this._state("done");
    }

    _restart() {
      this._cancel();
      this._collect();
      if (reduceMotion.matches) {
        this._settleAll();
        return;
      }
      this._hideAll();
      if (this._visible || !this._startOnView) {
        this._start();
      }
    }

    /* ----------------------------------------------------------------------
       可见性与计时器
       ---------------------------------------------------------------------- */

    _canRun() {
      return !this._stopWhenHidden || (this._visible && !document.hidden);
    }

    // 可见性一变就同步一次：该挂起就挂起，该续播就续播
    _sync() {
      if (!this._running) {
        if (this._visible && this._shown < this._items.length) {
          this._start();
        }
        return;
      }
      if (this._canRun()) {
        if (!this._timer && this._shown < this._items.length) {
          this._schedule();
        }
        return;
      }
      this._clearTimer();
    }

    _clearTimer() {
      if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = 0;
      }
    }

    _clearSettleTimer() {
      if (this._settleTimer) {
        window.clearTimeout(this._settleTimer);
        this._settleTimer = 0;
      }
    }

    _cancel() {
      this._clearTimer();
      this._clearSettleTimer();
      this._running = false;
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  }

  window.customElements.define(TAG, DiaAnimatedList);
})();
