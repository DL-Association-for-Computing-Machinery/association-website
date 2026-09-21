/* ==========================================================================
   东华理工大学计算机协会 · 首页独立原型（GitHub #30）
   当前只实现顶栏行为：主题切换。
   移动端汉堡抽屉已随品牌区一并移除 —— 品牌去掉后 Dock 拿得到整行宽度，
   撑得下就不再需要抽屉，也就没有需要脚本管理的开合状态。
   内容区（活动筛选、导航当前区块等）随内容一并待实现。
   ========================================================================== */

(function () {
  "use strict";

  const root = document.documentElement;
  const THEME_KEY = "ecut-ca-prototype-theme";
  const DARK_CLASS = "theme-dark";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLite = window.matchMedia("(max-width: 48rem)");

  const themeToggle = document.querySelector(".theme-toggle");
  const introScreen = document.querySelector(".intro-screen");
  const introSkip = document.querySelector(".intro-skip");

  // 脚本可用时才移除 no-js，保证禁用 JS 时导航仍然可读。
  root.classList.remove("no-js");

  /* ------------------------------------------------------------------------
     进入开屏：每次打开或刷新都播放一次。减少动效时立即释放主页。
     ------------------------------------------------------------------------ */

  let introTimer = null;

  function finishIntro() {
    if (!introScreen || introScreen.classList.contains("is-done")) return;

    if (introTimer !== null) {
      window.clearTimeout(introTimer);
      introTimer = null;
    }

    window.__releaseIntroFrames?.();
    introScreen.classList.add("is-done");
    root.classList.remove("intro-active");
    // 先让开屏黑幕从绘制树移除，再释放主页内的文字动效；否则首屏 ECUT 的
    // 描边动画和主页扫光会挤在同一帧，后者会被遮住而显得没有播放。不能在
    // 这里用 requestAnimationFrame：开屏期间它会被临时拦截，可能让事件永不派发。
    window.setTimeout(function () {
      document.dispatchEvent(new Event("prototype:intro-complete"));
    }, 50);
    introSkip?.blur();
  }

  if (introScreen) {
    if (reduceMotion.matches) {
      finishIntro();
    } else {
      introTimer = window.setTimeout(finishIntro, 3900);
      introSkip?.addEventListener("click", finishIntro);
    }
  }

  /* ------------------------------------------------------------------------
     Hello 彩纸：原生 Canvas 版 Confetti。进入问候区时从标题两侧喷出，
     只播放一次，避免持续帧循环变成页面常驻负担。
     ------------------------------------------------------------------------ */

  const greeting = document.querySelector(".greeting");
  const greetingConfetti = document.querySelector(".greeting-confetti");

  if (greeting && greetingConfetti && !reduceMotion.matches && !mobileLite.matches) {
    const context = greetingConfetti.getContext("2d");
    const particles = [];
    const palette = ["#38b7d1", "#2f7fd0", "#f4c64f", "#dc554c", "#ff7a38"];
    let confettiFrame = 0;
    let hasFired = false;

    const resizeConfetti = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = greeting.clientWidth;
      const height = Math.min(greeting.clientHeight, 430);
      greetingConfetti.width = Math.max(1, Math.round(width * ratio));
      greetingConfetti.height = Math.max(1, Math.round(height * ratio));
      greetingConfetti.style.height = `${height}px`;
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const addBurst = () => {
      if (!context || hasFired || root.classList.contains("intro-active")) return;

      resizeConfetti();
      const width = greeting.clientWidth;
      const originY = Math.min(170, greetingConfetti.clientHeight * 0.4);
      hasFired = true;

      for (let index = 0; index < 56; index += 1) {
        const left = index % 2 === 0;
        particles.push({
          x: width / 2 + (left ? -1 : 1) * (20 + Math.random() * 18),
          y: originY + Math.random() * 14,
          vx: (left ? -1 : 1) * (1.2 + Math.random() * 3.5),
          vy: -4.2 - Math.random() * 4.8,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.28,
          width: 5 + Math.random() * 5,
          height: 9 + Math.random() * 9,
          life: 1,
          color: palette[index % palette.length],
        });
      }

      const draw = () => {
        const width = greeting.clientWidth;
        const height = Math.min(greeting.clientHeight, 430);
        context.clearRect(0, 0, width, height);

        for (const particle of particles) {
          particle.vy += 0.12;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.rotation += particle.spin;
          particle.life -= 0.012;

          context.save();
          context.globalAlpha = Math.max(0, particle.life);
          context.translate(particle.x, particle.y);
          context.rotate(particle.rotation);
          context.fillStyle = particle.color;
          context.fillRect(
            -particle.width / 2,
            -particle.height / 2,
            particle.width,
            particle.height,
          );
          context.restore();
        }

        if (particles.some((particle) => particle.life > 0 && particle.y < height + 30)) {
          confettiFrame = window.requestAnimationFrame(draw);
        } else {
          context.clearRect(0, 0, width, height);
          confettiFrame = 0;
        }
      };

      confettiFrame = window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeConfetti, { passive: true });

    const fireWhenReady = () => {
      if (root.classList.contains("intro-active")) {
        document.addEventListener("prototype:intro-complete", addBurst, { once: true });
        return;
      }

      addBurst();
    };

    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            fireWhenReady();
          }
        },
        { threshold: 0.35 },
      );
      observer.observe(greeting);
    } else {
      fireWhenReady();
    }

    window.addEventListener("beforeunload", () => {
      if (confettiFrame) window.cancelAnimationFrame(confettiFrame);
    });
  }

  /* ------------------------------------------------------------------------
     技术栈滚动速度文字带：直接复用 3D 标签云里的名称，避免两份内容漂移。
     ------------------------------------------------------------------------ */

  const velocityRows = [...document.querySelectorAll(".velocity-row")];
  const cloudItems = [...document.querySelectorAll(".cloud-list li")]
    .map((item) => item.textContent?.trim())
    .filter(Boolean);

  if (velocityRows.length && cloudItems.length && !mobileLite.matches) {
    const velocityState = {
      current: 0,
      target: 0,
      lastScrollY: window.scrollY,
      lastTime: performance.now(),
      frame: 0,
    };

    velocityRows.forEach((row, rowIndex) => {
      const track = row.querySelector(".velocity-track");
      if (!track) return;

      const items = [...cloudItems, ...cloudItems];
      track.innerHTML = items
        .map((name) => `<span class="velocity-item" aria-hidden="true">${name}</span>`)
        .join("");
      row.dataset.rowIndex = String(rowIndex);
    });

    let rowOffsets = velocityRows.map(() => 0);
    let rowWidths = velocityRows.map(() => 1);
    let inView = true;

    const measureRows = () => {
      rowWidths = velocityRows.map((row) => {
        const track = row.querySelector(".velocity-track");
        return Math.max(1, (track?.scrollWidth || row.clientWidth) / 2);
      });
    };

    const updateScrollVelocity = () => {
      const now = performance.now();
      const elapsed = Math.max(16, now - velocityState.lastTime);
      const delta = window.scrollY - velocityState.lastScrollY;
      velocityState.lastScrollY = window.scrollY;
      velocityState.lastTime = now;
      velocityState.target = Math.max(-5, Math.min(5, (delta / elapsed) * 0.9));
    };

    const tickVelocity = (now) => {
      if (inView && !document.hidden) {
        velocityState.current += (velocityState.target - velocityState.current) * 0.08;
        velocityState.target *= 0.93;

        const seconds = Math.min(50, Math.max(16, now - velocityState.lastTime)) / 1000;
        velocityRows.forEach((row, index) => {
          const direction = Number(row.dataset.direction) || 1;
          const baseSpeed = 34;
          rowOffsets[index] +=
            direction * (baseSpeed + Math.abs(velocityState.current) * 130) * seconds;
          const width = rowWidths[index];
          rowOffsets[index] = ((rowOffsets[index] % width) + width) % width;
          const track = row.querySelector(".velocity-track");
          track?.style.setProperty("transform", `translate3d(${-rowOffsets[index]}px, 0, 0)`);
        });
      }

      velocityState.frame = window.requestAnimationFrame(tickVelocity);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
    });
    observer.observe(document.querySelector(".stack-velocity"));
    window.addEventListener("scroll", updateScrollVelocity, { passive: true });
    window.addEventListener("resize", measureRows, { passive: true });
    measureRows();
    velocityState.frame = window.requestAnimationFrame(tickVelocity);
  }

  /* ------------------------------------------------------------------------
     主题切换：默认浅色，用户手动切换后写入 localStorage。
     ------------------------------------------------------------------------ */

  function readStoredTheme() {
    try {
      const value = window.localStorage.getItem(THEME_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch (error) {
      // 隐私模式等场景下 localStorage 不可用，退回浅色默认值。
      console.warn("[prototype] 无法读取主题偏好：", error);
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn("[prototype] 无法保存主题偏好：", error);
    }
  }

  function currentTheme() {
    return root.classList.contains(DARK_CLASS) ? "dark" : "light";
  }

  function paintTheme(theme) {
    const isDark = theme === "dark";
    root.classList.toggle(DARK_CLASS, isDark);
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "切换浅色主题" : "切换深色主题");
    }
  }

  // 主题在首屏渲染前落定，避免闪白。
  paintTheme(readStoredTheme() || "light");

  function supportsCircularReveal() {
    return (
      typeof document.startViewTransition === "function" &&
      typeof document.documentElement.animate === "function" &&
      !reduceMotion.matches &&
      !mobileLite.matches
    );
  }

  function switchTheme(event) {
    const next = currentTheme() === "dark" ? "light" : "dark";

    if (!event || !supportsCircularReveal()) {
      paintTheme(next);
      writeStoredTheme(next);
      return;
    }

    // 从点击位置扩散出新主题，中心落在按钮上。
    const box = themeToggle ? themeToggle.getBoundingClientRect() : { left: 0, top: 0 };
    const x = event.clientX || box.left;
    const y = event.clientY || box.top;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.dataset.themeTransition = "active";
    const transition = document.startViewTransition(function () {
      paintTheme(next);
      writeStoredTheme(next);
    });

    const cleanup = function () {
      delete root.dataset.themeTransition;
    };

    transition.ready
      .then(function () {
        root.animate(
          {
            clipPath: [
              "circle(0px at " + x + "px " + y + "px)",
              "circle(" + radius + "px at " + x + "px " + y + "px)",
            ],
          },
          {
            duration: 420,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(function () {
        // 浏览器跳过过渡时无需补偿，主题已在回调中生效。
      });

    transition.finished.then(cleanup, cleanup);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", switchTheme);
  }

  /* ------------------------------------------------------------------------
     整页流动彩框（.page-shine）：标签页切到后台就停帧。
     这条渐变每一帧都在重绘，后台空转没有意义；纯装饰层由 CSS 降级，
     这里只负责可见性这一件事。禁用脚本时只是不暂停，无其他影响。
     ------------------------------------------------------------------------ */

  const pageShine = document.querySelector(".page-shine");
  if (pageShine) {
    const syncShineIdle = function () {
      pageShine.classList.toggle("is-idle", document.hidden);
    };
    document.addEventListener("visibilitychange", syncShineIdle);
  }
})();
