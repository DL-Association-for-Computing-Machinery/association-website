/**
 * 站点运行时的共享契约。
 *
 * 首页基线（`public/prototype/`）把「主题恢复、开屏、组件脚本」散在
 * `index.html` 的内联脚本与 `main.js` 里；主站是多页结构，这三件事对
 * 每个路由都要成立，所以统一收在这里：
 *
 * - 常量既给 React 侧用（昼夜切换按钮），也拼进首帧内联脚本；
 * - 首帧内联脚本必须内联、且必须在 `<body>` 最前面同步执行，否则会闪主题；
 * - 组件脚本仍是基线那份原生 Web Component，按 `index.html` 的顺序声明。
 */

/** 昼夜偏好的存储键。作用域从原型升级到主站，因此不再带 prototype 字样。 */
export const SITE_THEME_STORAGE_KEY = "ecut-ca-theme";

/** `html` 上的深色标记类，取值照基线。 */
export const SITE_THEME_DARK_CLASS = "theme-dark";

/** 开屏时长，照基线的 3.9 秒。 */
export const SITE_INTRO_DURATION_MS = 3900;

/**
 * 开屏收尾后派发的事件。
 *
 * 名字必须保持 `prototype:` 前缀：`public/prototype/components/` 里的
 * `dia-text-reveal`、`dia-logo-particles`、`threeui-character-carousel`、
 * `threeui-globe-study` 都硬编码监听这个事件名，开屏期间会先把动效停在起点、
 * 等它到来再开始。改名会让这些组件永远停在「文字全透明」的起点上。
 */
export const SITE_INTRO_COMPLETE_EVENT = "prototype:intro-complete";

/**
 * 首页基线里用到的自定义元素脚本，顺序与 `public/prototype/index.html` 一致。
 *
 * 三点必须保留：
 * - `assets/icon-set.js` 要在 `dia-icon-cloud.js` 之前（前者给后者提供图标数据）；
 * - 都是经典脚本，靠 `<script defer>` 保证按序执行；
 * - 基线里另外加载了 `dia-pixel-image.js`，但首页没有任何 `<dia-pixel-image>`，
 *   属于基线遗留，这里不再引入。
 */
export const PROTOTYPE_COMPONENT_SCRIPTS = [
  "/prototype/components/dia-text-reveal.js",
  "/prototype/components/dia-terminal.js",
  "/prototype/components/dia-file-tree.js",
  "/prototype/components/dia-blur-fade.js",
  "/prototype/assets/icon-set.js",
  "/prototype/components/dia-icon-cloud.js",
  "/prototype/components/dia-animated-list.js",
  "/prototype/components/dia-retro-grid.js",
  "/prototype/components/dia-dot-pattern.js",
  "/prototype/components/dia-dock.js",
  "/prototype/components/dia-marquee.js",
  "/prototype/components/dia-avatar-circles.js",
  "/prototype/components/dia-logo-particles.js",
  "/prototype/components/threeui-globe-study.js",
  "/prototype/components/threeui-character-carousel.js",
] as const;

/**
 * 首帧内联脚本：主题恢复 + 帧闸门 + 开屏收尾。
 *
 * 为什么是内联字符串而不是客户端组件：这三件事都必须早于首帧或早于水合。
 * 主题晚了会闪白底；开屏收尾若等 React 水合，一旦水合出问题页面会永远
 * 锁在黑幕后面（`html.intro-active` 移除不掉），所以刻意不依赖任何框架运行时。
 *
 * `no-js` 不在这里摘：基线组件脚本会改写自己的子节点（`dia-text-reveal` 把
 * 文案搬进 shadow root），必须等 React 水合完之后再加载，否则水合时会因为
 * 文本对不上而整棵树重渲染。摘 `no-js` 的时机因此落在组件脚本就绪那一刻，
 * 见 `src/components/prototype-scripts.tsx`。
 */
export const SITE_BOOTSTRAP_SCRIPT = `(() => {
  "use strict";

  const root = document.documentElement;

  /* 主题：默认浅色；手动切过深色的在首帧前恢复，避免刷新闪一下白底。 */
  try {
    if (window.localStorage.getItem("${SITE_THEME_STORAGE_KEY}") === "dark") {
      root.classList.add("${SITE_THEME_DARK_CLASS}");
      root.dataset.theme = "dark";
    }
  } catch {
    /* 隐私模式等读不到 localStorage 的场景，保持 HTML 上声明的浅色。 */
  }

  /* 帧闸门：开屏期间把 requestAnimationFrame 排队，收尾时统一放行。
     否则首屏字标动效会在黑幕背后播完，抬幕时已经看不到。 */
  const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
  const nativeCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  const queuedFrames = new Map();
  let nextFrameId = 1;
  let framesReleased = false;

  window.requestAnimationFrame = (callback) => {
    if (framesReleased) {
      return nativeRequestAnimationFrame(callback);
    }

    const frameId = nextFrameId;
    nextFrameId += 1;
    queuedFrames.set(frameId, callback);

    return frameId;
  };

  window.cancelAnimationFrame = (frameId) => {
    if (queuedFrames.delete(frameId)) {
      return;
    }

    nativeCancelAnimationFrame(frameId);
  };

  window.__releaseIntroFrames = () => {
    if (framesReleased) {
      return;
    }

    framesReleased = true;

    const callbacks = Array.from(queuedFrames.values());
    queuedFrames.clear();
    callbacks.forEach((callback) => nativeRequestAnimationFrame(callback));
  };

  /* 开屏：六类页面里只有首页播；内页与「减少动效」偏好下立即收尾。 */
  const pathName =
    window.location.pathname.replace(/\\/index\\.html$/, "/").replace(/\\/+$/, "") || "/";
  const shouldPlayIntro =
    pathName === "/" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let introScreen = null;
  let introSkip = null;
  let introTimer = null;

  const finishIntro = () => {
    if (introTimer !== null) {
      window.clearTimeout(introTimer);
      introTimer = null;
    }

    window.__releaseIntroFrames();

    if (introScreen) {
      introScreen.classList.add("is-done");
    }

    root.classList.remove("intro-active");

    /* 先让黑幕离开绘制树，再释放主页动效：两者挤在同一帧时后者会被遮住。
       这里用 setTimeout 而不是 requestAnimationFrame —— 开屏期间它正被拦着。 */
    window.setTimeout(() => {
      document.dispatchEvent(new Event("${SITE_INTRO_COMPLETE_EVENT}"));
    }, 50);

    if (introSkip) {
      introSkip.blur();
    }
  };

  if (shouldPlayIntro) {
    document.addEventListener("DOMContentLoaded", () => {
      introScreen = document.querySelector(".intro-screen");
      introSkip = document.querySelector(".intro-skip");

      if (!introScreen) {
        finishIntro();

        return;
      }

      introTimer = window.setTimeout(finishIntro, ${SITE_INTRO_DURATION_MS});

      if (introSkip) {
        introSkip.addEventListener("click", finishIntro);
      }
    });
  } else {
    root.classList.add("intro-skipped");
    finishIntro();
  }
})();
`;
