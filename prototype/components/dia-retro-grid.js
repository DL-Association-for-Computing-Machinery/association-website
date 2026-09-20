/* ==========================================================================
   <dia-retro-grid> · 复古透视网格背景
   --------------------------------------------------------------------------
   magicui Retro Grid 的原生移植（原实现为 React + WebGL）。纯装饰组件：
   没有内容、不接收指针事件、自带 aria-hidden。

   画面是一块向前延伸的地平面，网格线随时间向观察者滚动，越远越密。
   在线条密集处会依次退到「两倍格」「四倍格」的稀疏线，避免远处糊成一片；
   这条 LOD 链是靠 fwidth 求屏幕空间导数得到的，所以需要 WebGL1 的
   OES_standard_derivatives 扩展。扩展缺失或建管线失败时退回 CSS 渐变网格。

   几何（透视地面，容器顶边为画面远端）：
   相机在 (0, 0, perspective) 处朝 -z 看，地平面绕 x 轴倾斜 angle 度，
   平面近边正好落在容器垂直中点下方一点，因此网格占容器的下半部分。

   移植时相对参考实现的三处改动：
   ① 拆成自定义元素的自有状态，不再依赖 React 的 effect 与 ref；
   ② 底部那层渐变遮罩改用页面底色变量 --page，深浅主题自动跟随，
      不再写死白/黑；
   ③ 暂停判据加上 document.hidden，标签页切到后台不再空转（参考实现只看
      是否进入视口）。

   属性：
     angle            网格倾斜角度（度，1–89，默认 65）
     cell-size        格边长（px，默认 60）
     opacity          整层不透明度（0–1，默认 0.5）
     light-line-color 浅色主题下的线色（默认 gray）
     dark-line-color  深色主题下的线色（默认 gray）
     no-webgl         强制走 CSS 回退路径（用于校验，正常使用不要加）

   参考实现只接受 CSS 颜色关键字/函数，组件会先把颜色解析成具体的 rgb()
   再喂给着色器，因此 gray、#38b7d1、rgb(0 0 0 / 40%) 都能写。
   ========================================================================== */

(function () {
  "use strict";

  if (customElements.get("dia-retro-grid")) {
    return;
  }

  /* --- 与参考实现逐项对齐的常量 ----------------------------------------- */

  const ANIMATION_DURATION_SECONDS = 15;
  const GRID_HEIGHT_RATIO = 3;
  const GRID_LINE_ALIGNMENT_OFFSET_PX = 0.5;
  const GRID_LINE_ANTIALIAS_MULTIPLIER = 0.9;
  const GRID_LINE_WIDTH_PX = 0.92;
  const GRID_START_OFFSET_RATIO = -0.5;
  const GRID_WIDTH_RATIO = 6;
  const GRID_X_OFFSET_RATIO = -2;
  const MIN_ANGLE = 1;
  const MAX_ANGLE = 89;
  const MAX_DEVICE_PIXEL_RATIO = 2;
  const PERSPECTIVE_PX = 200;

  const DEFAULTS = {
    angle: 65,
    cellSize: 60,
    opacity: 0.5,
    lightLineColor: "gray",
    darkLineColor: "gray",
  };

  const FALLBACK_ANIMATION_NAME = "dia-retro-grid-scroll";

  const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

  const FRAGMENT_SHADER_SOURCE = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 u_container_size;
uniform vec2 u_viewport_size;
uniform vec4 u_line_color;
uniform float u_angle;
uniform float u_cell_size;
uniform float u_device_pixel_ratio;
uniform float u_time;

const float animationDurationSeconds = ${ANIMATION_DURATION_SECONDS.toFixed(1)};
const float gridHeightRatio = ${GRID_HEIGHT_RATIO.toFixed(1)};
const float gridStartOffsetRatio = ${GRID_START_OFFSET_RATIO.toFixed(1)};
const float gridWidthRatio = ${GRID_WIDTH_RATIO.toFixed(1)};
const float gridXOffsetRatio = ${GRID_X_OFFSET_RATIO.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${GRID_LINE_ALIGNMENT_OFFSET_PX.toFixed(1)};
const float gridLineAntialiasMultiplier = ${GRID_LINE_ANTIALIAS_MULTIPLIER.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${GRID_LINE_WIDTH_PX.toFixed(2)};
const float perspectivePx = ${PERSPECTIVE_PX.toFixed(1)};
const float gridTravelRatio = 0.5;
const float verticalCompressionEndPx = 2.6;
const float verticalCompressionStartPx = 1.0;
const float verticalEdgeCompressionEnd = 0.95;
const float verticalEdgeCompressionStart = 0.45;
const float verticalLodLevelEnd = 0.64;
const float verticalLodLevelStart = 0.22;
const float verticalTopCompressionEndCells = 6.0;
const float verticalTopCompressionStartCells = 2.0;

float renderGridLine(
  float wrappedCoord,
  float antiAliasWidth,
  float softnessBoost
) {
  return 1.0 - smoothstep(
    lineWidthPx,
    lineWidthPx + (antiAliasWidth * (1.5 + softnessBoost)),
    wrappedCoord
  );
}

void main() {
  float angle = radians(clamp(u_angle, 1.0, 89.0));
  float sinAngle = sin(angle);
  float cosAngle = cos(angle);
  vec2 screen = vec2(
    (gl_FragCoord.x / u_device_pixel_ratio) - (u_container_size.x * 0.5),
    (u_container_size.y * 0.5) - (gl_FragCoord.y / u_device_pixel_ratio)
  );

  vec3 rayOrigin = vec3(0.0, 0.0, perspectivePx);
  vec3 rayDirection = normalize(vec3(screen, -perspectivePx));
  vec3 planeXAxis = vec3(1.0, 0.0, 0.0);
  vec3 planeYAxis = vec3(0.0, cosAngle, sinAngle);
  vec3 planeNormal = normalize(cross(planeXAxis, planeYAxis));
  float denominator = dot(rayDirection, planeNormal);

  if (abs(denominator) < 0.0001) {
    discard;
  }

  float distanceToPlane = dot(-rayOrigin, planeNormal) / denominator;

  if (distanceToPlane <= 0.0) {
    discard;
  }

  vec3 hitPoint = rayOrigin + (rayDirection * distanceToPlane);
  float localX = hitPoint.x;
  float localY = dot(hitPoint, planeYAxis);
  float gridWidth = u_viewport_size.x * gridWidthRatio;
  float gridHeight = u_viewport_size.y * gridHeightRatio;
  float gridScrollSpeed = (gridHeight * gridTravelRatio) / animationDurationSeconds;
  float patternOffsetY = u_time * gridScrollSpeed;
  float gridLeft = (-0.5 * u_container_size.x) + (gridXOffsetRatio * u_container_size.x);
  float gridTop = (-0.5 * u_container_size.y) + (gridStartOffsetRatio * gridHeight);
  vec2 planePosition = vec2(localX - gridLeft, localY - gridTop);

  if (
    planePosition.x < 0.0 ||
    planePosition.y < 0.0 ||
    planePosition.x > gridWidth ||
    planePosition.y > gridHeight
  ) {
    discard;
  }

  vec2 patternPosition = vec2(planePosition.x, planePosition.y - patternOffsetY);
  vec2 wrapped = mod(
    patternPosition + vec2(gridLineAlignmentOffsetPx),
    u_cell_size
  );
  vec2 patternDerivative = max(fwidth(patternPosition), vec2(0.0001));
  vec2 antiAliasWidth = patternDerivative * gridLineAntialiasMultiplier;
  float horizontalCellSpanPx = u_cell_size / patternDerivative.y;
  float horizontalCompression = 1.0 - smoothstep(
    horizontalCompressionStartPx,
    horizontalCompressionEndPx,
    horizontalCellSpanPx
  );
  float verticalCellSpanPx = u_cell_size / patternDerivative.x;
  float sideDistance = abs((planePosition.x / gridWidth) * 2.0 - 1.0);
  float verticalEdgeCompression = smoothstep(
    verticalEdgeCompressionStart,
    verticalEdgeCompressionEnd,
    sideDistance
  );
  float verticalTopCompression = 1.0 - smoothstep(
    u_cell_size * verticalTopCompressionStartCells,
    u_cell_size * verticalTopCompressionEndCells,
    planePosition.y
  );
  float verticalCompression =
    (1.0 - smoothstep(
      verticalCompressionStartPx,
      verticalCompressionEndPx,
      verticalCellSpanPx
    )) * verticalEdgeCompression * verticalTopCompression;
  float horizontalSoftnessBoost = 1.0 + (horizontalCompression * 3.0);
  float verticalSoftnessBoost = 1.0 + (verticalCompression * 3.5);
  float verticalLod = smoothstep(
    verticalLodLevelStart,
    verticalLodLevelEnd,
    verticalCompression
  );
  float verticalLineFine = renderGridLine(
    wrapped.x,
    antiAliasWidth.x,
    verticalSoftnessBoost
  );
  float verticalWrappedLod = mod(
    patternPosition.x + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float verticalLineCoarse = renderGridLine(
    verticalWrappedLod,
    antiAliasWidth.x,
    verticalSoftnessBoost + verticalLod
  );
  float verticalLine = max(
    verticalLineFine * (1.0 - verticalLod),
    verticalLineCoarse * verticalLod
  );
  float horizontalLodLevelOne = 1.0 - smoothstep(
    horizontalLodLevelOneStartPx,
    horizontalLodLevelOneEndPx,
    horizontalCellSpanPx
  );
  float horizontalLodLevelTwo = 1.0 - smoothstep(
    horizontalLodLevelTwoStartPx,
    horizontalLodLevelTwoEndPx,
    horizontalCellSpanPx
  );
  float horizontalLineFine = renderGridLine(
    wrapped.y,
    antiAliasWidth.y,
    horizontalSoftnessBoost
  );
  float horizontalWrappedLodOne = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float horizontalWrappedLodTwo = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 4.0
  );
  float horizontalLineCoarse = renderGridLine(
    horizontalWrappedLodOne,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne
  );
  float horizontalLineExtraCoarse = renderGridLine(
    horizontalWrappedLodTwo,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne + horizontalLodLevelTwo
  );
  float horizontalLineReduced = max(
    horizontalLineFine * (1.0 - horizontalLodLevelOne),
    horizontalLineCoarse * horizontalLodLevelOne
  );
  float horizontalLine = max(
    horizontalLineReduced * (1.0 - horizontalLodLevelTwo),
    horizontalLineExtraCoarse * horizontalLodLevelTwo
  );
  float line = max(verticalLine, horizontalLine);

  if (line <= 0.001) {
    discard;
  }

  float alpha = u_line_color.a * line;
  gl_FragColor = vec4(u_line_color.rgb * alpha, alpha);
}
`;

  /* 影子树样式。宿主由页面 CSS 定位（本页是 position:absolute; inset:0），
     这里只兜底块级显示与裁剪，避免回退层 600% 宽度撑出横向滚动条。 */
  const TEMPLATE = `
<style>
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    pointer-events: none;
  }

  .stage {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .canvas {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 360ms ease;
  }

  .stage.is-ready .canvas {
    opacity: 1;
  }

  /* 底部渐变遮罩：让网格下沿融进页面底色。
     颜色取页面底色变量，深浅主题自动跟随；参考实现是写死的 from-white / dark:from-black。 */
  .veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, var(--page) 0%, transparent 90%);
  }

  /* WebGL 不可用（或上下文丢失）时的回退：透视 + 旋转的平铺线条，靠位移动画滚动 */
  .fallback {
    position: absolute;
    inset: 0;
    perspective: ${PERSPECTIVE_PX}px;
  }

  .stage.is-ready .fallback {
    display: none;
  }

  .fallback__tilt {
    position: absolute;
    inset: 0;
  }

  .fallback__grid {
    position: absolute;
    inset: 0 0;
    width: 600%;
    height: 300%;
    margin-left: -200%;
    transform: translateY(-50%);
    transform-origin: 100% 0 0;
    background-image:
      linear-gradient(to right, var(--retro-line, gray) 1px, transparent 0),
      linear-gradient(to bottom, var(--retro-line, gray) 1px, transparent 0);
    background-repeat: repeat;
    background-size: var(--retro-cell, 60px) var(--retro-cell, 60px);
    animation: ${FALLBACK_ANIMATION_NAME} ${ANIMATION_DURATION_SECONDS}s linear infinite;
  }

  /* 滚出视口或标签页切后台时不空转，与站内其他动效组件的处理一致 */
  .stage.is-idle .fallback__grid {
    animation-play-state: paused;
  }

  @keyframes ${FALLBACK_ANIMATION_NAME} {
    from {
      transform: translateY(-50%);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fallback__grid {
      animation: none !important;
      transform: translateY(-50%) !important;
    }
  }
</style>
<div class="stage">
  <div class="fallback" aria-hidden="true">
    <div class="fallback__tilt">
      <div class="fallback__grid"></div>
    </div>
  </div>
  <canvas class="canvas"></canvas>
  <div class="veil" aria-hidden="true"></div>
</div>
`;

  /* --- 工具函数 --------------------------------------------------------- */

  let colorResolveContext;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getColorResolveContext() {
    if (colorResolveContext !== undefined) {
      return colorResolveContext;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    colorResolveContext = canvas.getContext("2d", { willReadFrequently: true });

    return colorResolveContext;
  }

  /* 把 CSS 颜色串（gray、#38b7d1、rgb(0 0 0 / 40%)…）落到具体的 rgb() 再取回 RGBA 分量：
     着色器只认数值，颜色关键字必须在页面里解析一次。
     context 必须是一个**真的会被渲染**的元素：挂到影子宿主上是不行的 ——
     宿主有影子树却没有 <slot>，light DOM 子元素进不了扁平树，Chrome 对它
     getComputedStyle 会一路返回空串，颜色就静默变成黑色。 */
  function resolveColor(cssColor, context) {
    const resolver = document.createElement("span");
    resolver.style.color = cssColor;
    resolver.style.opacity = "0";
    resolver.style.pointerEvents = "none";
    resolver.style.position = "absolute";
    context.appendChild(resolver);

    const computed = getComputedStyle(resolver).color;
    resolver.remove();

    const canvasContext = getColorResolveContext();

    if (!canvasContext || !computed) {
      return { css: computed || "rgb(128, 128, 128)", rgba: new Float32Array([0.5, 0.5, 0.5, 1]) };
    }

    canvasContext.clearRect(0, 0, 1, 1);
    canvasContext.fillStyle = computed;
    canvasContext.fillRect(0, 0, 1, 1);
    const pixel = canvasContext.getImageData(0, 0, 1, 1).data;

    return {
      css: computed,
      rgba: new Float32Array([pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, pixel[3] / 255]),
    };
  }

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }

    gl.deleteShader(shader);

    return null;
  }

  function createProgram(gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    }

    gl.deleteProgram(program);

    return null;
  }

  function getProgramInfo(gl, program) {
    const attributeLocation = gl.getAttribLocation(program, "a_position");
    const angle = gl.getUniformLocation(program, "u_angle");
    const cellSize = gl.getUniformLocation(program, "u_cell_size");
    const containerSize = gl.getUniformLocation(program, "u_container_size");
    const devicePixelRatio = gl.getUniformLocation(program, "u_device_pixel_ratio");
    const lineColor = gl.getUniformLocation(program, "u_line_color");
    const time = gl.getUniformLocation(program, "u_time");
    const viewportSize = gl.getUniformLocation(program, "u_viewport_size");

    if (
      attributeLocation < 0 ||
      !angle ||
      !cellSize ||
      !containerSize ||
      !devicePixelRatio ||
      !lineColor ||
      !time ||
      !viewportSize
    ) {
      return null;
    }

    return {
      attributeLocation,
      program,
      uniforms: {
        angle,
        cellSize,
        containerSize,
        devicePixelRatio,
        lineColor,
        time,
        viewportSize,
      },
    };
  }

  class DiaRetroGrid extends HTMLElement {
    static get observedAttributes() {
      return ["angle", "cell-size", "opacity", "light-line-color", "dark-line-color", "no-webgl"];
    }

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).innerHTML = TEMPLATE;

      this._stage = this.shadowRoot.querySelector(".stage");
      this._canvas = this.shadowRoot.querySelector(".canvas");
      this._fallback = this.shadowRoot.querySelector(".fallback");
      this._fallbackTilt = this.shadowRoot.querySelector(".fallback__tilt");
      this._fallbackGrid = this.shadowRoot.querySelector(".fallback__grid");

      this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      this._colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

      this._gl = null;
      this._program = null;
      this._info = null;
      this._buffer = null;

      this._width = 0;
      this._height = 0;
      this._devicePixelRatio = 1;

      this._frameId = null;
      this._visible = false;
      this._contextLost = false;
      this._ready = false;
      this._colorKey = null;
      this._color = null;
    }

    /* 升级期的属性回调要挡掉：Chrome 会在 connectedCallback 之前为每个已存在属性
       各触发一次，放行会带着半截状态去建管线。（站内其他组件同款处理） */
    attributeChangedCallback(name) {
      if (!this._ready || this.dataset.mobileStatic === "true") {
        return;
      }

      if (name === "opacity") {
        this._paintOpacity();
      }

      this._sync();
    }

    _paintOpacity() {
      this._stage.style.opacity = String(this._attrNumber("opacity", DEFAULTS.opacity, 0, 1));
    }

    connectedCallback() {
      this._ready = true;

      if (!this.hasAttribute("aria-hidden")) {
        this.setAttribute("aria-hidden", "true");
      }

      this._paintOpacity();

      // 手机端保留一张静态 CSS 透视网格，不申请 WebGL 上下文，也不启动逐帧绘制。
      if (window.matchMedia("(max-width: 48rem)").matches) {
        this.dataset.mobileStatic = "true";
        this._updateLineColor();
        this._applyFallback();
        this._stage.classList.add("is-idle");
        return;
      }

      if (typeof ResizeObserver === "function") {
        this._resizeObserver = new ResizeObserver(() => this._sync());
        this._resizeObserver.observe(this);
      }

      if (typeof IntersectionObserver === "function") {
        this._intersectionObserver = new IntersectionObserver((entries) => {
          const entry = entries[0];
          this._visible = entry ? entry.isIntersecting : false;
          this._sync();
        });
        this._intersectionObserver.observe(this);
      } else {
        // 没有交叉观察器时按可见处理，宁可多跑帧也不要整块空白
        this._visible = true;
      }

      this._themeObserver = new MutationObserver(() => this._sync());
      this._themeObserver.observe(document.documentElement, {
        attributeFilter: ["class", "data-theme"],
        attributes: true,
      });

      this._onViewportChange = () => this._sync();
      this._onVisibilityChange = () => this._sync();
      this._onContextLost = (event) => {
        event.preventDefault();
        this._contextLost = true;
        this._stopFrames();
        this._release(true);
        this._setReady(false);
        this._applyFallback();
      };
      this._onContextRestored = () => {
        this._contextLost = false;
        this._sync();
      };

      window.addEventListener("resize", this._onViewportChange);
      document.addEventListener("visibilitychange", this._onVisibilityChange);
      this._reducedMotion.addEventListener("change", this._onViewportChange);
      this._colorScheme.addEventListener("change", this._onViewportChange);
      this._canvas.addEventListener("webglcontextlost", this._onContextLost);
      this._canvas.addEventListener("webglcontextrestored", this._onContextRestored);

      this._sync();
    }

    disconnectedCallback() {
      this._ready = false;
      this._stopFrames();

      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }

      if (this._intersectionObserver) {
        this._intersectionObserver.disconnect();
        this._intersectionObserver = null;
      }

      if (this._themeObserver) {
        this._themeObserver.disconnect();
        this._themeObserver = null;
      }

      window.removeEventListener("resize", this._onViewportChange);
      document.removeEventListener("visibilitychange", this._onVisibilityChange);
      this._reducedMotion.removeEventListener("change", this._onViewportChange);
      this._colorScheme.removeEventListener("change", this._onViewportChange);
      this._canvas.removeEventListener("webglcontextlost", this._onContextLost);
      this._canvas.removeEventListener("webglcontextrestored", this._onContextRestored);

      this._release(!this._contextLost);
    }

    /* --- 属性 ----------------------------------------------------------- */

    _attrNumber(name, fallback, min, max) {
      const raw = this.getAttribute(name);

      if (raw === null) {
        return fallback;
      }

      const value = Number.parseFloat(raw);

      if (!Number.isFinite(value)) {
        return fallback;
      }

      return clamp(value, min, max);
    }

    get _angle() {
      return this._attrNumber("angle", DEFAULTS.angle, MIN_ANGLE, MAX_ANGLE);
    }

    get _cellSize() {
      return Math.max(this._attrNumber("cell-size", DEFAULTS.cellSize, 1, 512), 1);
    }

    _isDark() {
      const root = document.documentElement;

      if (root.classList.contains("theme-dark") || root.dataset.theme === "dark") {
        return true;
      }

      if (root.classList.contains("theme-light") || root.dataset.theme === "light") {
        return false;
      }

      return this._colorScheme.matches;
    }

    _updateLineColor() {
      const value = this._isDark()
        ? (this.getAttribute("dark-line-color") ?? DEFAULTS.darkLineColor)
        : (this.getAttribute("light-line-color") ?? DEFAULTS.lightLineColor);

      if (this._colorKey !== value) {
        // 探针挂在 .stage 上（影子树内部，确实会被渲染），不要挂到宿主
        this._color = resolveColor(value, this._stage);
        this._colorKey = value;
      }

      return this._color;
    }

    /* --- WebGL 管线 ------------------------------------------------------ */

    _ensurePipeline() {
      if (this._gl && this._buffer && this._info) {
        return true;
      }

      if (this.hasAttribute("no-webgl")) {
        return false;
      }

      const gl = this._canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      });

      // fwidth 来自 OES_standard_derivatives，缺了就没法做线条 LOD
      if (!gl || gl.isContextLost() || !gl.getExtension("OES_standard_derivatives")) {
        return false;
      }

      const program = createProgram(gl);

      if (!program) {
        return false;
      }

      const info = getProgramInfo(gl, program);

      if (!info) {
        gl.deleteProgram(program);

        return false;
      }

      const buffer = gl.createBuffer();

      if (!buffer) {
        gl.deleteProgram(program);

        return false;
      }

      // 一个盖住整个裁剪空间的大三角形，比两个三角形少一条对角缝
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

      this._gl = gl;
      this._program = program;
      this._info = info;
      this._buffer = buffer;

      return true;
    }

    _release(deleteResources) {
      const gl = this._gl;

      if (deleteResources && gl && !gl.isContextLost()) {
        if (this._buffer) {
          gl.deleteBuffer(this._buffer);
        }

        if (this._program) {
          gl.deleteProgram(this._program);
        }
      }

      this._gl = null;
      this._program = null;
      this._info = null;
      this._buffer = null;
    }

    _resize() {
      const gl = this._gl;

      if (!gl) {
        return;
      }

      this._width = Math.floor(this.clientWidth);
      this._height = Math.floor(this.clientHeight);

      if (this._width === 0 || this._height === 0) {
        return;
      }

      // 视网膜屏上按 2 倍封顶：再高只是白烧像素，网格线看不出差别
      this._devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

      this._canvas.width = Math.floor(this._width * this._devicePixelRatio);
      this._canvas.height = Math.floor(this._height * this._devicePixelRatio);
      this._canvas.style.width = `${this._width}px`;
      this._canvas.style.height = `${this._height}px`;
      gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    }

    _draw(timestamp) {
      const gl = this._gl;
      const info = this._info;
      const buffer = this._buffer;
      const color = this._color;

      if (this._contextLost || !gl || !info || !buffer || !color) {
        return;
      }

      if (this._width === 0 || this._height === 0) {
        return;
      }

      gl.useProgram(info.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(info.attributeLocation);
      gl.vertexAttribPointer(info.attributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(info.uniforms.angle, this._angle);
      gl.uniform1f(info.uniforms.cellSize, this._cellSize);
      gl.uniform2f(info.uniforms.containerSize, this._width, this._height);
      gl.uniform1f(info.uniforms.devicePixelRatio, this._devicePixelRatio);
      gl.uniform4fv(info.uniforms.lineColor, color.rgba);
      // 减少动效：时间钉在 0，网格静止但仍然画出来
      gl.uniform1f(info.uniforms.time, this._reducedMotion.matches ? 0 : timestamp / 1000);
      gl.uniform2f(info.uniforms.viewportSize, window.innerWidth, window.innerHeight);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /* --- 帧循环 ---------------------------------------------------------- */

    _shouldRun() {
      return this._visible && !document.hidden && !this._reducedMotion.matches;
    }

    _startFrames() {
      if (this._frameId !== null) {
        return;
      }

      const frame = (timestamp) => {
        this._draw(timestamp);

        if (!this._shouldRun()) {
          this._frameId = null;

          return;
        }

        this._frameId = window.requestAnimationFrame(frame);
      };

      this._frameId = window.requestAnimationFrame(frame);
    }

    _stopFrames() {
      if (this._frameId !== null) {
        window.cancelAnimationFrame(this._frameId);
        this._frameId = null;
      }
    }

    /* --- 渲染管线与回退层的共同入口 --------------------------------------- */

    _setReady(ready) {
      this._stage.classList.toggle("is-ready", ready);
    }

    _applyFallback() {
      this._stage.style.setProperty("--retro-cell", `${this._cellSize}px`);
      this._fallbackTilt.style.transform = `rotateX(${this._angle}deg)`;

      if (this._color) {
        this._fallbackGrid.style.setProperty("--retro-line", this._color.css);
      }
    }

    _sync() {
      if (this._contextLost) {
        this._stopFrames();
        this._setReady(false);
        this._applyFallback();

        return;
      }

      if (!this._ensurePipeline()) {
        // 没有 WebGL：交给 CSS 回退层，滚动动画由 @keyframes 负责
        this._stopFrames();
        this._setReady(false);
        this._updateLineColor();
        this._applyFallback();
        this._stage.classList.toggle("is-idle", !this._visible || document.hidden);

        return;
      }

      this._resize();

      if (this._width === 0 || this._height === 0) {
        this._stopFrames();

        return;
      }

      this._updateLineColor();
      this._applyFallback();
      this._draw(window.performance.now());
      this._setReady(true);

      if (!this._shouldRun()) {
        this._stopFrames();

        return;
      }

      this._startFrames();
    }
  }

  customElements.define("dia-retro-grid", DiaRetroGrid);
})();
