/* Canvas 2D logo reveal: particles sample the official transparent PNG directly. */
(function () {
  "use strict";

  class DiaLogoParticles extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;

      const mobileLite = window.matchMedia("(max-width: 48rem)").matches;
      this._fallback = document.createElement("img");
      this._fallback.className = "dia-logo-particles__mark";
      this._fallback.alt = "";
      this._fallback.decoding = "async";
      const source = this.getAttribute("src") || "./assets/association-logo.png";
      this._fallback.src = source;

      // 手机端只保留正式徽章位图，不创建 Canvas、粒子 DOM 或常驻帧循环。
      if (mobileLite) {
        this.dataset.mobileStatic = "true";
        this.classList.add("is-loaded", "is-settled");
        this.append(this._fallback);
        this._ready = true;
        return;
      }

      this._canvas = document.createElement("canvas");
      this._context = this._canvas.getContext("2d");
      this._swarm = document.createElement("span");
      this._swarm.className = "dia-logo-particles__swarm";
      this._image = new Image();
      this._image.decoding = "async";
      this.append(this._fallback, this._canvas, this._swarm);
      this._buildDomParticles();
      this._image.addEventListener(
        "load",
        () => {
          this._resize();
          this.classList.add("is-loaded");
        },
        { once: true },
      );
      this._image.src = source;
      // A file:// asset can be resolved from memory before the element upgrade
      // completes. The listener above handles normal loads; this covers that cache hit.
      if (this._image.complete && this._image.naturalWidth > 0) {
        queueMicrotask(() => {
          this._resize();
          this.classList.add("is-loaded");
        });
      }
      // The motion must not depend on canvas sampling. A file:// viewer may
      // defer that sampling even when the image itself is available.
      this._setup();
      this._onPointerMove = (event) => this._queuePointerUpdate(event);
      this._onPointerLeave = () => this._resetPointerState();
      this._onIntroComplete = () => {
        this._started = false;
        this._checkViewport();
      };
      this.addEventListener("pointermove", this._onPointerMove);
      this.addEventListener("pointerleave", this._onPointerLeave);
      document.addEventListener("prototype:intro-complete", this._onIntroComplete, { once: true });
      this._ready = true;
    }

    disconnectedCallback() {
      this._stop();
      this._observer?.disconnect();
      window.removeEventListener("resize", this._onResize);
      window.removeEventListener("scroll", this._onScroll);
      document.removeEventListener("visibilitychange", this._onVisibility);
      document.removeEventListener("prototype:intro-complete", this._onIntroComplete);
      this.removeEventListener("pointermove", this._onPointerMove);
      this.removeEventListener("pointerleave", this._onPointerLeave);
      if (this._pointerFrame) window.cancelAnimationFrame(this._pointerFrame);
    }

    _setup() {
      if (this._setupDone) return;
      this._setupDone = true;
      this._particles = [];
      this._visible = false;
      this._started = false;
      this._frame = 0;
      this._onResize = () => this._resize();
      this._onVisibility = () => this._sync();
      this._onScroll = () => this._checkViewport();
      window.addEventListener("resize", this._onResize, { passive: true });
      window.addEventListener("scroll", this._onScroll, { passive: true });
      document.addEventListener("visibilitychange", this._onVisibility);
      this._observer = new IntersectionObserver(
        ([entry]) => {
          const nextVisible = Boolean(entry?.isIntersecting);
          if (nextVisible && !this._visible) {
            this._started = false;
            this.classList.remove("is-settled");
          }
          this._visible = nextVisible;
          this._sync();
        },
        { threshold: 0.3 },
      );
      this._observer.observe(this);
      this._resize();
      this._checkViewport();
    }

    _resize() {
      const bounds = this.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));

      this._canvas.width = Math.round(width * ratio);
      this._canvas.height = Math.round(height * ratio);
      this._canvas.style.width = `${width}px`;
      this._canvas.style.height = `${height}px`;
      this._context.setTransform(ratio, 0, 0, ratio, 0, 0);
      this._width = width;
      this._height = height;
      // The actual mark is a DOM image so it remains visible even when a
      // browser restricts canvas sampling for a local file:// page.
      this._fallback.style.width = `${Math.round(Math.min(width, height) * 0.88)}px`;
      this._buildParticles();
      this._draw(performance.now());
    }

    _buildParticles() {
      if (!this._image.complete || !this._width || !this._height) return;

      const sample = document.createElement("canvas");
      const sampleSize = 360;
      sample.width = sampleSize;
      sample.height = sampleSize;
      const sampleContext = sample.getContext("2d", { willReadFrequently: true });
      const displaySize = Math.min(this._width, this._height) * 0.88;
      const offsetX = (this._width - displaySize) / 2;
      const offsetY = (this._height - displaySize) / 2;
      const density = Math.max(4, Math.round(7 - Math.min(displaySize, 420) / 180));
      const points = [];

      let pixels;
      try {
        sampleContext.clearRect(0, 0, sampleSize, sampleSize);
        sampleContext.drawImage(this._image, 0, 0, sampleSize, sampleSize);
        pixels = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
      } catch {
        // Local file previews can taint the sampling canvas. The DOM particle
        // silhouette remains fully animated, so this is an intentional fallback.
        this._particles = [];
        return;
      }
      for (let y = density; y < sampleSize; y += density) {
        for (let x = density; x < sampleSize; x += density) {
          const index = (y * sampleSize + x) * 4;
          if (pixels[index + 3] < 96 || Math.random() > 0.72) continue;
          points.push({
            x: offsetX + (x / sampleSize) * displaySize,
            y: offsetY + (y / sampleSize) * displaySize,
            color: `rgb(${pixels[index]} ${pixels[index + 1]} ${pixels[index + 2]})`,
          });
        }
      }

      this._particles = points.slice(0, 1200).map((point) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = displaySize * (0.4 + Math.random() * 0.95);
        return {
          ...point,
          fromX: this._width / 2 + Math.cos(angle) * distance,
          fromY: this._height / 2 + Math.sin(angle) * distance,
          size: 1 + Math.random() * 2.1,
          phase: Math.random() * Math.PI * 2,
        };
      });
    }

    _buildDomParticles() {
      const colors = ["#38b7d1", "#2f7fd0", "#f4c64f", "#dc554c", "#ff7a38", "#111b50"];
      this._domParticles = [];
      const addParticle = (x, y, index) => {
        const particle = document.createElement("i");
        const angle = Math.random() * Math.PI * 2;
        const distance = 34 + Math.random() * 54;
        particle.className = "dia-logo-particles__particle";
        particle.style.setProperty("--x", `${x}%`);
        particle.style.setProperty("--y", `${y}%`);
        particle.style.setProperty("--from-x", `${Math.cos(angle) * distance}%`);
        particle.style.setProperty("--from-y", `${Math.sin(angle) * distance}%`);
        particle.style.setProperty("--size", `${2 + (index % 4)}px`);
        particle.style.setProperty("--color", colors[index % colors.length]);
        particle.style.setProperty("--delay", `${(index % 12) * 22}ms`);
        particle.style.setProperty("--float-x", `${-8 + Math.random() * 16}px`);
        particle.style.setProperty("--float-y", `${-14 + Math.random() * 8}px`);
        particle.style.setProperty("--float-duration", `${1900 + (index % 7) * 180}ms`);
        particle.style.setProperty("--float-delay", `${-(index % 11) * 170}ms`);
        this._swarm.append(particle);
        this._domParticles.push({ element: particle, x, y, seed: index * 1.618 });
      };

      // The ring and paired chevrons establish the badge silhouette while
      // the bitmap remains a quiet guide beneath the converging particles.
      for (let index = 0; index < 92; index += 1) {
        const angle = (index / 92) * Math.PI * 2;
        const radius = 34 + (index % 4) * 1.6;
        addParticle(50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius, index);
      }

      const chevrons = [
        [46, 42],
        [42, 45],
        [38, 48],
        [42, 51],
        [46, 54],
        [54, 42],
        [58, 45],
        [62, 48],
        [58, 51],
        [54, 54],
      ];
      chevrons.forEach(([x, y], index) => {
        for (let offset = -1; offset <= 1; offset += 1) {
          addParticle(x, y + offset * 1.8, index + 92);
        }
      });
    }

    _queuePointerUpdate(event) {
      this._pendingPointer = { x: event.clientX, y: event.clientY };
      if (this._pointerFrame) return;
      this._pointerFrame = window.requestAnimationFrame(() => {
        this._pointerFrame = 0;
        this._updatePointerState();
      });
    }

    _updatePointerState() {
      const pointer = this._pendingPointer;
      if (!pointer) return;

      const bounds = this.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (pointer.x - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (pointer.y - bounds.top) / bounds.height));
      const px = x * 100;
      const py = y * 100;
      this.classList.add("is-hovering");
      this.style.setProperty("--logo-tilt-x", `${(0.5 - y) * 24}deg`);
      this.style.setProperty("--logo-tilt-y", `${(x - 0.5) * 28}deg`);
      this.style.setProperty("--logo-light-x", `${20 + x * 60}%`);
      this.style.setProperty("--logo-light-y", `${18 + y * 52}%`);

      this._domParticles?.forEach((particle) => {
        const dx = particle.x - px;
        const dy = particle.y - py;
        const distance = Math.max(0.001, Math.hypot(dx, dy));
        const strength = Math.max(0, 1 - distance / 35);
        const force = strength * strength * 22;
        const wobbleX = Math.cos(particle.seed) * force * 0.35;
        const wobbleY = Math.sin(particle.seed) * force * 0.35;
        particle.element.style.setProperty("--hover-x", `${(dx / distance) * force + wobbleX}px`);
        particle.element.style.setProperty("--hover-y", `${(dy / distance) * force + wobbleY}px`);
      });
    }

    _resetPointerState() {
      this._pendingPointer = null;
      this.classList.remove("is-hovering");
      this.style.setProperty("--logo-tilt-x", "0deg");
      this.style.setProperty("--logo-tilt-y", "0deg");
      this.style.setProperty("--logo-light-x", "50%");
      this.style.setProperty("--logo-light-y", "35%");
      this._domParticles?.forEach((particle) => {
        particle.element.style.setProperty("--hover-x", "0px");
        particle.element.style.setProperty("--hover-y", "0px");
      });
    }

    _sync() {
      if (document.documentElement.classList.contains("intro-active")) {
        this._stop();
        this._resetReveal();
        return;
      }

      if (!this._visible || document.hidden) {
        this._stop();
        this._resetReveal();
        return;
      }

      if (!this._started) {
        this._started = true;
        this._startedAt = performance.now();
        this._resetReveal();
        // Commit the scattered position before applying the final one. This
        // makes the reveal replay when the section leaves and re-enters view.
        this._swarm?.getBoundingClientRect();
        this.classList.add("is-revealing");
      }
      this._start();
    }

    _resetReveal() {
      this.classList.remove("is-revealing", "is-settled");
    }

    _checkViewport() {
      const bounds = this.getBoundingClientRect();
      const visible =
        bounds.top < window.innerHeight * 0.9 && bounds.bottom > window.innerHeight * 0.1;
      if (visible && !this._visible) {
        this._started = false;
        this.classList.remove("is-settled");
      }
      this._visible = visible;
      this._sync();
    }

    _start() {
      if (!this._frame) this._frame = window.requestAnimationFrame((time) => this._draw(time));
    }

    _stop() {
      if (this._frame) window.cancelAnimationFrame(this._frame);
      this._frame = 0;
    }

    _draw(time) {
      this._frame = 0;
      if (!this._context) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const startedAt = this._startedAt ?? time;
      const progress = reduced ? 1 : Math.min(1, (time - startedAt) / 2100);
      const ease = 1 - Math.pow(1 - progress, 4);
      const settled = progress >= 1;
      const context = this._context;
      context.clearRect(0, 0, this._width, this._height);

      for (const particle of this._particles || []) {
        const drift = settled && !reduced ? Math.sin(time * 0.0012 + particle.phase) * 1.15 : 0;
        const x = particle.fromX + (particle.x - particle.fromX) * ease + drift;
        const y = particle.fromY + (particle.y - particle.fromY) * ease + drift * 0.55;
        context.globalAlpha = Math.min(1, 0.28 + ease * 0.72);
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(x, y, particle.size * (0.6 + ease * 0.4), 0, Math.PI * 2);
        context.fill();
      }

      if (settled) {
        this.classList.add("is-settled");
        this.classList.remove("is-revealing");
      }

      context.globalAlpha = 1;
      if (this._visible && !document.hidden && (!settled || !reduced)) this._start();
    }
  }

  customElements.define("dia-logo-particles", DiaLogoParticles);
})();
