"use client";

import { useEffect } from "react";
import { HOME_STACK_ITEMS } from "@/lib/home-content";

/**
 * 技术栈滚动速度文字带：条目直接复用标签云的名称，避免两份内容漂移（与基线 main.js 同一做法）。
 * 滚动越快，带子跑得越快，并带一点缓动；离开视口或切到后台时停帧。
 * 窄屏（≤48rem）不跑动画，交给静态排版。
 */

const BASE_SPEED_PX_PER_SECOND = 34;
const MAX_VELOCITY = 5;
const VELOCITY_TO_SPEED = 130;

export function StackVelocity() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".velocity-row"));

    if (rows.length === 0) {
      return;
    }

    // 与标签云同源：直接从常量生成，而不是在组件之间互读 DOM 文案。
    const names = HOME_STACK_ITEMS.map((item) => item.name);

    // 条目填充与断点无关：窄屏由 CSS 把整块 `display: none` 收起，但内容得一直在。
    // 早先这里先判 `(max-width: 48rem)` 再提前 return，结果是「窄屏打开 → 拉宽」
    // 之后带子虽然显示出来，里面却是空的（只有外层三个 div，没有一个条目）。
    rows.forEach((row, rowIndex) => {
      const track = row.querySelector<HTMLElement>(".velocity-track");

      if (!track) {
        return;
      }

      track.replaceChildren(
        ...[...names, ...names].map((name) => {
          const item = document.createElement("span");
          item.className = "velocity-item";
          item.setAttribute("aria-hidden", "true");
          item.textContent = name;

          return item;
        }),
      );

      row.dataset.rowIndex = String(rowIndex);
    });

    // 只有动画受断点约束：窄屏整块不显示，继续跑逐帧没有意义。
    const mobileLite = window.matchMedia("(max-width: 48rem)");
    let enabled = !mobileLite.matches;
    const offsets = rows.map(() => 0);
    let widths = rows.map(() => 1);
    let inView = true;
    let animationFrame = 0;
    let current = 0;
    let target = 0;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const measure = () => {
      widths = rows.map((row) => {
        const track = row.querySelector<HTMLElement>(".velocity-track");

        return Math.max(1, (track?.scrollWidth ?? row.clientWidth) / 2);
      });
    };

    const updateScrollVelocity = () => {
      const now = performance.now();
      const elapsed = Math.max(16, now - lastTime);
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      lastTime = now;
      target = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (delta / elapsed) * 0.9));
    };

    const startLoop = () => {
      if (!animationFrame) {
        lastTime = performance.now();
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const tick = (now: number) => {
      if (inView && !document.hidden) {
        current += (target - current) * 0.08;
        target *= 0.93;

        const seconds = Math.min(50, Math.max(16, now - lastTime)) / 1000;

        rows.forEach((row, index) => {
          const direction = Number(row.dataset.direction) || 1;
          const speed = BASE_SPEED_PX_PER_SECOND + Math.abs(current) * VELOCITY_TO_SPEED;
          offsets[index] += direction * speed * seconds;

          const width = widths[index];
          offsets[index] = ((offsets[index] % width) + width) % width;

          const track = row.querySelector<HTMLElement>(".velocity-track");
          track?.style.setProperty("transform", `translate3d(${-offsets[index]}px, 0, 0)`);
        });
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    // 跨越断点时启停逐帧：窄 → 宽 重新跑起来，宽 → 窄 停掉不空转。
    // 不这样处理的话，窄屏加载的页面拉宽后带子不会动（一直在原地）。
    const handleBreakpoint = () => {
      const next = !mobileLite.matches;

      if (next === enabled) {
        return;
      }

      enabled = next;
      measure();

      if (enabled) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    const velocityRegion = document.querySelector(".stack-velocity");
    const observer =
      velocityRegion && typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => {
            inView = Boolean(entry?.isIntersecting);
          })
        : null;

    observer?.observe(velocityRegion as Element);
    mobileLite.addEventListener("change", handleBreakpoint);
    window.addEventListener("scroll", updateScrollVelocity, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    measure();

    if (enabled) {
      startLoop();
    }

    return () => {
      observer?.disconnect();
      mobileLite.removeEventListener("change", handleBreakpoint);
      window.removeEventListener("scroll", updateScrollVelocity);
      window.removeEventListener("resize", measure);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
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
