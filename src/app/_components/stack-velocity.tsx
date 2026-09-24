"use client";

import { useEffect } from "react";

/**
 * 技术栈滚动速度文字带。
 *
 * 从原型 main.js 移植：条目直接复用 3D 标签云里的名称，避免两份内容漂移；
 * 滚动越快文字带越快。窄屏不启用。
 *
 * 时序注意：原型的 main.js 在 DOMContentLoaded 后执行，那时 <dia-icon-cloud>
 * 尚未接管其子 <ul>（它要异步构建 3D 场景，可能会重排内部结构）。这里必须
 * 等待组件就绪后再读取名称，否则拿到空列表、文字带会一直空白。
 */

const BASE_SPEED = 34;
const VELOCITY_SCALE = 130;

/** 读取标签云里的名称；组件未就绪或列表为空时返回空数组。 */
function readCloudItems(): string[] {
  return Array.from(document.querySelectorAll(".cloud-list li"))
    .map((item) => item.textContent?.trim())
    .filter((name): name is string => Boolean(name));
}

/**
 * 等待标签云就绪。
 *
 * dia-icon-cloud 完成后会设置 data-icon-cloud-ready，优先用它；
 * 该标记不存在时退回轮询，最多等 5 秒。
 */
function whenCloudReady(callback: () => void): () => void {
  const cloud = document.querySelector("dia-icon-cloud");
  const readyAttr = "data-icon-cloud-ready";

  if (cloud?.hasAttribute(readyAttr)) {
    callback();
    return () => {};
  }

  let timer = 0;
  let elapsed = 0;
  let stopped = false;

  const check = () => {
    if (stopped) return;

    if ((cloud?.hasAttribute(readyAttr) ?? false) || readCloudItems().length > 0) {
      callback();
      return;
    }

    elapsed += 100;
    if (elapsed >= 5000) {
      // 超时也执行一次，确保文字带至少不会永久空白。
      callback();
      return;
    }

    timer = window.setTimeout(check, 100);
  };

  timer = window.setTimeout(check, 100);

  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}

export function StackVelocity() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".velocity-row"));

    if (rows.length === 0) return;
    if (window.matchMedia("(max-width: 48rem)").matches) return;

    const container = document.querySelector(".stack-velocity");
    if (!container) return;

    let frame = 0;
    let measure = () => {};

    const setup = () => {
      const cloudItems = readCloudItems();
      if (cloudItems.length === 0) return;

      // 铺内容：两份重复以实现无缝循环。
      const doubled = [...cloudItems, ...cloudItems];
      rows.forEach((row, rowIndex) => {
        const track = row.querySelector<HTMLElement>(".velocity-track");
        if (!track) return;
        track.innerHTML = doubled
          .map((name) => `<span class="velocity-item" aria-hidden="true">${name}</span>`)
          .join("");
        row.dataset.rowIndex = String(rowIndex);
      });

      const offsets = rows.map(() => 0);
      let widths = rows.map(() => 1);
      let inView = true;
      let current = 0;
      let target = 0;
      let lastScrollY = window.scrollY;
      let lastTime = performance.now();

      measure = () => {
        widths = rows.map((row) => {
          const track = row.querySelector(".velocity-track");
          return Math.max(1, (track?.scrollWidth ?? row.clientWidth) / 2);
        });
      };

      const updateVelocity = () => {
        const now = performance.now();
        const elapsed = Math.max(16, now - lastTime);
        const delta = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        lastTime = now;
        target = Math.max(-5, Math.min(5, (delta / elapsed) * 0.9));
      };

      const tick = (now: number) => {
        if (inView && !document.hidden) {
          current += (target - current) * 0.08;
          target *= 0.93;

          const seconds = Math.min(50, Math.max(16, now - lastTime)) / 1000;
          rows.forEach((row, index) => {
            const direction = Number(row.dataset.direction) || 1;
            const width = widths[index] ?? 1;
            offsets[index] =
              ((offsets[index] ?? 0) +
                direction * (BASE_SPEED + Math.abs(current) * VELOCITY_SCALE) * seconds) %
              width;
            const track = row.querySelector<HTMLElement>(".velocity-track");
            track?.style.setProperty("transform", `translate3d(${-(offsets[index] ?? 0)}px, 0, 0)`);
          });
        }

        frame = window.requestAnimationFrame(tick);
      };

      const observer = new IntersectionObserver(([entry]) => {
        inView = Boolean(entry?.isIntersecting);
      });
      observer.observe(container);

      window.addEventListener("scroll", updateVelocity, { passive: true });
      window.addEventListener("resize", measure, { passive: true });
      measure();
      frame = window.requestAnimationFrame(tick);

      cancelObserver = () => observer.disconnect();
      cancelScroll = () => window.removeEventListener("scroll", updateVelocity);
      cancelResize = () => window.removeEventListener("resize", measure);
    };

    let cancelObserver = () => {};
    let cancelScroll = () => {};
    let cancelResize = () => {};

    const cancelReadyWait = whenCloudReady(setup);

    return () => {
      cancelReadyWait();
      cancelObserver();
      cancelScroll();
      cancelResize();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="stack-velocity" aria-label="协会使用的语言与工具">
      <div className="velocity-row" data-direction="-1">
        <div className="velocity-track" />
      </div>
      <div className="velocity-row" data-direction="1">
        <div className="velocity-track" />
      </div>
    </div>
  );
}
