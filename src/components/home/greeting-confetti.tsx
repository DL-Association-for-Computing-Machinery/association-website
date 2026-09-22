"use client";

import { useEffect, useRef } from "react";
import { SITE_INTRO_COMPLETE_EVENT } from "@/lib/site-runtime";

/**
 * Hello 彩纸：原生 Canvas 版 Confetti，逻辑照首页基线的 main.js。
 *
 * 进入问候区时从标题两侧喷出，只播放一次，避免持续帧循环变成页面常驻负担。
 * 减少动效或窄屏（≤48rem）时完全不创建画布内容。
 */

const CONFETTI_PALETTE = ["#38b7d1", "#2f7fd0", "#f4c64f", "#dc554c", "#ff7a38"];
const CONFETTI_COUNT = 56;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  width: number;
  height: number;
  life: number;
  color: string;
}

export function GreetingConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const greetingRegion = canvas?.closest(".greeting");

    if (!canvas || !(greetingRegion instanceof HTMLElement)) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileLite = window.matchMedia("(max-width: 48rem)");

    if (reduceMotion.matches || mobileLite.matches) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const particles: Particle[] = [];
    let animationFrame = 0;
    let hasFired = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = greetingRegion.clientWidth;
      const height = Math.min(greetingRegion.clientHeight, 430);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      const width = greetingRegion.clientWidth;
      const height = Math.min(greetingRegion.clientHeight, 430);
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
        animationFrame = window.requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
        animationFrame = 0;
      }
    };

    const burst = () => {
      if (hasFired || document.documentElement.classList.contains("intro-active")) {
        return;
      }

      resize();

      const width = greetingRegion.clientWidth;
      const originY = Math.min(170, canvas.clientHeight * 0.4);
      hasFired = true;

      for (let index = 0; index < CONFETTI_COUNT; index += 1) {
        const fromLeft = index % 2 === 0;
        particles.push({
          x: width / 2 + (fromLeft ? -1 : 1) * (20 + Math.random() * 18),
          y: originY + Math.random() * 14,
          vx: (fromLeft ? -1 : 1) * (1.2 + Math.random() * 3.5),
          vy: -4.2 - Math.random() * 4.8,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.28,
          width: 5 + Math.random() * 5,
          height: 9 + Math.random() * 9,
          life: 1,
          color: CONFETTI_PALETTE[index % CONFETTI_PALETTE.length],
        });
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const fireWhenReady = () => {
      if (document.documentElement.classList.contains("intro-active")) {
        document.addEventListener(SITE_INTRO_COMPLETE_EVENT, burst, { once: true });

        return;
      }

      burst();
    };

    window.addEventListener("resize", resize, { passive: true });

    if (typeof IntersectionObserver !== "function") {
      fireWhenReady();

      return () => {
        window.removeEventListener("resize", resize);

        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          fireWhenReady();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(greetingRegion);

    return () => {
      observer.disconnect();
      document.removeEventListener(SITE_INTRO_COMPLETE_EVENT, burst);
      window.removeEventListener("resize", resize);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return <canvas className="greeting-confetti" aria-hidden="true" ref={canvasRef} />;
}
