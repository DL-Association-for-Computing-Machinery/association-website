"use client";

import { useEffect, useRef } from "react";

/**
 * 问候区彩纸（原生 Canvas Confetti）。
 *
 * 从原型 main.js 移植：进入问候区时从标题两侧喷出，只播放一次，
 * 避免持续帧循环成为常驻负担。偏好减少动效或窄屏时不启用。
 */

const PALETTE = ["#38b7d1", "#2f7fd0", "#f4c64f", "#dc554c", "#ff7a38"];
const PARTICLE_COUNT = 56;
const MAX_CANVAS_HEIGHT = 430;

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
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest(".greeting");
    if (!canvas || !(section instanceof HTMLElement)) return;

    sectionRef.current = section;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 48rem)").matches
    ) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    const particles: Particle[] = [];
    let frame = 0;
    let hasFired = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = section.clientWidth;
      const height = Math.min(section.clientHeight, MAX_CANVAS_HEIGHT);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const burst = () => {
      if (hasFired || document.documentElement.classList.contains("intro-active")) return;

      resize();
      const width = section.clientWidth;
      const originY = Math.min(170, canvas.clientHeight * 0.4);
      hasFired = true;

      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
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
          color: PALETTE[index % PALETTE.length] ?? PALETTE[0] ?? "#38b7d1",
        });
      }

      const draw = () => {
        const currentWidth = section.clientWidth;
        const currentHeight = Math.min(section.clientHeight, MAX_CANVAS_HEIGHT);
        context.clearRect(0, 0, currentWidth, currentHeight);

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

        if (particles.some((particle) => particle.life > 0 && particle.y < currentHeight + 30)) {
          frame = window.requestAnimationFrame(draw);
        } else {
          context.clearRect(0, 0, currentWidth, currentHeight);
          frame = 0;
        }
      };

      frame = window.requestAnimationFrame(draw);
    };

    const fireWhenReady = () => {
      if (document.documentElement.classList.contains("intro-active")) {
        document.addEventListener("prototype:intro-complete", burst, { once: true });
        return;
      }

      burst();
    };

    window.addEventListener("resize", resize, { passive: true });

    let observer: IntersectionObserver | undefined;

    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            fireWhenReady();
          }
        },
        { threshold: 0.35 },
      );
      observer.observe(section);
    } else {
      fireWhenReady();
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("prototype:intro-complete", burst);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="greeting-confetti" aria-hidden="true" />;
}
