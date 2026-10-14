import { HOME_HERO } from "@/lib/home-content";

/** 素材路径。与组件脚本同源，都取自首页基线的 `public/prototype/`。 */
const LOGO_SRC = "/prototype/assets/association-logo.png";

/**
 * 首屏：品牌英文名，位置对齐基线（居中容器内的左侧）。
 *
 * 每处字标都保留「无脚本回落」的一套：`--fallback` 是普通文本，
 * 组件版由 `dia-text-reveal` 接管；styles/prototype.css 里的
 * `html:not(.no-js)` 规则决定显示哪一套，所以 layout 必须保留 `no-js` 再由脚本摘掉。
 */
export function HomeHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-brand" aria-label={HOME_HERO.brand}>
            <span className="hero-brand__ecut hero-brand__ecut--fallback">{HOME_HERO.brand}</span>
            <dia-text-reveal
              aria-hidden="true"
              className="hero-brand__ecut"
              text={HOME_HERO.brand}
              colors="var(--brand-cyan),var(--brand-blue),var(--brand-gold),var(--brand-orange),var(--brand-coral)"
              text-color="var(--heading)"
              duration="1.2"
              delay="0.45"
              start-on-view="false"
            >
              {HOME_HERO.brand}
            </dia-text-reveal>
          </div>

          <h1 className="hero-title" id="hero-title" aria-label="Computer Association">
            <span className="hero-wordmark hero-wordmark--fallback" aria-hidden="true">
              <span>Computer</span>
              <span>Association</span>
            </span>
            <dia-text-reveal
              aria-hidden="true"
              className="hero-wordmark"
              text={HOME_HERO.wordmark}
              stack=""
              colors="var(--brand-cyan),var(--brand-blue),var(--brand-gold),var(--brand-orange),var(--brand-coral)"
              text-color="var(--heading)"
              duration="1.2"
              delay="1.9"
              start-on-view="false"
            >
              Computer Association
            </dia-text-reveal>
          </h1>
        </div>

        <aside className="hero-emblem" aria-label="可交互的协会粒子徽章">
          <dia-logo-particles src={LOGO_SRC} />
        </aside>
      </div>
    </section>
  );
}
