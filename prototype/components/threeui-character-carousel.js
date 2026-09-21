/* Native adapter for the registered ThreeUI CharacterCarousel filmstrip. */
(function () {
  "use strict";

  const sourceUrl =
    window.__ECUT_EMBEDDED_SOURCES__?.characterFilmstrip ??
    new URL(
      "./threeui-source/character-filmstrip-adapted.html",
      document.currentScript ? document.currentScript.src : window.location.href,
    ).href;

  const clamp = function (value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  };

  class ThreeuiCharacterCarousel extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;

      // Filmstrip iframe 内含持续 3D 轨道；手机端改由页面中的真实照片网格承载内容。
      if (window.matchMedia("(max-width: 48rem)").matches) {
        this.dataset.mobileStatic = "true";
        this.dataset.ready = "true";
        return;
      }

      this.mount();
    }

    mount() {
      const speed = clamp(Number(this.getAttribute("speed")) || 1, 0, 2.5);
      const scale = clamp(Number(this.getAttribute("scale")) || 1, 0.7, 1.3);
      const opacity = clamp(Number(this.getAttribute("opacity")) || 1, 0.05, 1);
      const hue = clamp(Number(this.getAttribute("hue")) || 0, -180, 180);
      const saturation = clamp(Number(this.getAttribute("saturation")) || 1, 0, 2);
      const brightness = clamp(Number(this.getAttribute("brightness")) || 1, 0.35, 1.65);
      const frame = document.createElement("iframe");
      const state = { visible: true, documentVisible: !document.hidden };

      frame.className = "character-carousel-frame";
      frame.title = "Interactive character filmstrip";
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.setAttribute("scrolling", "no");
      frame.src = sourceUrl;
      frame.style.opacity = String(opacity);
      frame.style.filter = `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`;
      this.append(frame);

      const postControls = () => {
        frame.contentWindow?.postMessage(
          {
            type: "character-carousel-controls",
            controls: {
              speed,
              scale,
              paused: !state.visible || !state.documentVisible || speed === 0,
            },
          },
          "*",
        );
      };

      frame.addEventListener("load", postControls, { once: false });
      const observer = new IntersectionObserver(([entry]) => {
        state.visible = entry?.isIntersecting ?? true;
        postControls();
      });
      observer.observe(this);
      const visibility = () => {
        state.documentVisible = !document.hidden;
        postControls();
      };
      document.addEventListener("visibilitychange", visibility);
      const introComplete = () => postControls();
      document.addEventListener("prototype:intro-complete", introComplete);
      this._cleanup = () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        document.removeEventListener("prototype:intro-complete", introComplete);
      };
      this.dataset.ready = "true";
    }

    disconnectedCallback() {
      this._cleanup?.();
    }
  }

  customElements.define("threeui-character-carousel", ThreeuiCharacterCarousel);
})();
