/*
 * Plain-HTML adapter for the registered ThreeUI TextPathStudies Globe variant.
 * The canvas document is kept verbatim under threeui-source; globe-study.html
 * only receives the same focus CSS that the upstream React component injects.
 */
(function () {
  "use strict";

  const embeddedSources = window.__ECUT_EMBEDDED_SOURCES__;
  const scriptBase = document.currentScript ? document.currentScript.src : window.location.href;
  const sourceUrls = {
    dark:
      embeddedSources?.globeDark ?? new URL("./threeui-source/globe-study.html", scriptBase).href,
    light:
      embeddedSources?.globeLight ??
      new URL("./threeui-source/globe-study-light.html", scriptBase).href,
  };

  const clamp = function (value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  };

  const numberAttribute = function (element, name, fallback, minimum, maximum) {
    const parsed = Number(element.getAttribute(name));
    return clamp(Number.isFinite(parsed) ? parsed : fallback, minimum, maximum);
  };

  const pageTheme = function () {
    return document.documentElement.classList.contains("theme-dark") ? "dark" : "light";
  };

  class ThreeuiGlobeStudy extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;

      // 手机端不创建包含 Canvas 的 iframe；所在区块由页面 CSS 提供静态布局。
      if (window.matchMedia("(max-width: 48rem)").matches) {
        this.dataset.mobileStatic = "true";
        this.dataset.ready = "true";
        return;
      }

      const mount = () => this.scheduleMount();
      if (document.documentElement.classList.contains("intro-active")) {
        document.addEventListener("prototype:intro-complete", mount, { once: true });
      } else {
        mount();
      }
    }

    scheduleMount() {
      if (this._mountScheduled || this.dataset.ready === "true") return;
      this._mountScheduled = true;

      // Both hero wordmarks get their reveal first. Canvas allocation waits until
      // the page is visually settled, keeping the opening and theme switch smooth.
      window.setTimeout(() => {
        const mountWhenIdle = () => this.mount();
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(mountWhenIdle, { timeout: 600 });
        } else {
          window.setTimeout(mountWhenIdle, 0);
        }
      }, 3200);
    }

    mount() {
      if (this.dataset.ready === "true") return;

      const scale = numberAttribute(this, "scale", 1, 0.65, 1.5);
      const opacity = numberAttribute(this, "opacity", 1, 0.1, 1);
      const hue = numberAttribute(this, "hue", 0, -180, 180);
      const saturation = numberAttribute(this, "saturation", 1, 0, 2);
      const brightness = numberAttribute(this, "brightness", 1, 0.4, 1.8);
      const filter =
        hue === 0 && saturation === 1 && brightness === 1
          ? ""
          : `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`;
      const requestedMode = this.getAttribute("mode");
      const followsPageTheme = requestedMode !== "dark" && requestedMode !== "light";
      const initialTheme = followsPageTheme ? pageTheme() : requestedMode;
      const frame = document.createElement("iframe");

      frame.className = "text-path-study-frame";
      frame.title = "Globe interactive canvas study";
      // Scripts stay enabled for the authored canvas; theme changes cross the
      // file:// iframe boundary through postMessage, so direct origin access is unnecessary.
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.setAttribute("scrolling", "no");
      let activeTheme = initialTheme;
      const applyFrameTheme = () => {
        frame.contentWindow?.postMessage({ type: "threeui-globe-theme", theme: activeTheme }, "*");
      };
      const setThemeAppearance = () => {
        const theme = followsPageTheme ? pageTheme() : initialTheme;
        activeTheme = theme;
        this.dataset.mode = theme;
        applyFrameTheme();
      };
      this.style.setProperty("--globe-opacity", String(opacity));
      this.style.setProperty("--globe-visual-filter", filter || "");
      frame.style.transform = scale === 1 ? "" : `scale(${scale})`;
      frame.addEventListener(
        "load",
        () => {
          applyFrameTheme();
          this.classList.add("is-ready");
        },
        { once: true },
      );

      if (followsPageTheme) {
        const themeObserver = new MutationObserver(setThemeAppearance);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        this._themeObserver = themeObserver;
      }
      this.dataset.ready = "true";
      this.dataset.mode = initialTheme;
      // Keep one transparent canvas document alive for both themes. The document's
      // ink cache is recoloured in place, so the iframe never flashes or reloads.
      frame.src = sourceUrls.dark;
      this.append(frame);
    }

    disconnectedCallback() {
      this._themeObserver?.disconnect();
    }
  }

  customElements.define("threeui-globe-study", ThreeuiGlobeStudy);
})();
