/* eslint-disable @next/next/no-img-element --
 * 本页图片全部作为内容传给原型的 Web Components（dia-avatar-circles、
 * mobile-activity-gallery），由组件自己接管渲染与布局；换成 next/image
 * 会改变 DOM 结构导致组件失效。图片已按 3:2 预处理为 WebP，
 * 后续接入 OSS + CDN 时改为绝对 URL 即可，见 docs/LXW/seo.md。
 */

import { GreetingConfetti } from "./_components/greeting-confetti";
import { IntroScreen } from "./_components/intro-screen";
import { StackVelocity } from "./_components/stack-velocity";
import { ThemeToggle } from "./_components/theme-toggle";

import { SITE_NAV } from "@/navigation/site-nav";

export default function Home() {
  return (
    <>
      <IntroScreen />

      <a className="skip-link" href="#main">
        跳到主要内容
      </a>

      <header className="site-header">
        <div className="topbar">
          <nav id="primary-navigation" className="primary-navigation" aria-label="主导航">
            <dia-dock scale="1.35" distance="140">
              {SITE_NAV.map((item) => (
                <a className="dock-item" href={item.url} key={item.url}>
                  <dia-text-reveal
                    className="dock-item__label"
                    text={item.title}
                    trigger="hover"
                    duration="0.9"
                    text-color="var(--dock-label-color, var(--text))"
                  >
                    {item.title}
                  </dia-text-reveal>
                </a>
              ))}
              <ThemeToggle />
            </dia-dock>
          </nav>
        </div>
      </header>

      <main id="main">
        <div className="dots-stage">
          <dia-dot-pattern className="page-dots" spacing="20" radius="1.1" glow="" />

          <div className="page-content">
            {/* 首屏：品牌英文名，位置对齐 GeekPie 首页。 */}
            <section className="hero" aria-labelledby="hero-title">
              <div className="hero-inner">
                <div className="hero-copy">
                  <div className="hero-brand" aria-label="ECUT">
                    <span className="hero-brand__ecut hero-brand__ecut--fallback">ECUT</span>
                    <dia-text-reveal
                      aria-hidden="true"
                      className="hero-brand__ecut"
                      text="ECUT"
                      colors="var(--brand-cyan),var(--brand-blue),var(--brand-gold),var(--brand-orange),var(--brand-coral)"
                      text-color="var(--heading)"
                      duration="1.2"
                      delay="0.45"
                      start-on-view="false"
                    >
                      ECUT
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
                      text="Computer|Association"
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
                  <dia-logo-particles src="/assets/association-logo.png" />
                </aside>
              </div>
            </section>

            {/* 问候区：进入视口时触发彩纸。 */}
            <section className="greeting" aria-labelledby="greeting-title">
              <GreetingConfetti />
              <h2 className="greeting-title" id="greeting-title">
                Hello
              </h2>
              <p className="greeting-subtitle">欢迎来到东华理工计协官网</p>
              <div className="greeting-tools">
                <dia-terminal speed="45" shine="" shine-duration="9">
                  <span data-typing="">$ whoami</span>
                  <span>ecut-ca@localhost</span>
                  <span data-typing="">$ cat ./sections.txt</span>
                  <span>探索计协</span>
                  <span>竞赛荣誉</span>
                  <span>活动回顾</span>
                  <span>学习方向</span>
                  <span>加入我们</span>
                  <span data-typing="">$ echo $?</span>
                  <span>0</span>
                </dia-terminal>
                <dia-file-tree />
              </div>
            </section>

            {/* 关于我们：正文取自素材包「协会简介正文」，已审核可发布。 */}
            <section className="about" id="about" aria-labelledby="about-title">
              <h2 className="about-title" id="about-title">
                这是我们
              </h2>

              <div className="about-body">
                <dia-blur-fade in-view="" delay="0.05">
                  <p className="about-lead">
                    东华理工大学计算机协会是由校内计算机科学和信息技术爱好者组成的学术科技类社团。我们通过技术讲座、主题分享、算法培训和模拟赛，为成员提供学习、交流与合作的机会。
                  </p>
                </dia-blur-fade>
              </div>

              <div
                className="character-carousel-region"
                id="activities"
                aria-label="协会活动与成员影像轮播"
              >
                <threeui-character-carousel
                  variant="filmstrip"
                  speed="1.00"
                  scale="1.00"
                  opacity="1.00"
                  hue="0"
                  saturation="1.00"
                  brightness="1.00"
                />

                <div className="mobile-activity-gallery" aria-hidden="true">
                  <img src="/assets/association-group.webp" alt="" loading="lazy" decoding="async" />
                  <img
                    src="/assets/photo-contest-group.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    src="/assets/photo-ccpc-zhengzhou.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </section>

            {/* 技术栈：图标取自 /assets/icon-set.js；列表项文字是读屏名称与无脚本回落内容。 */}
            <section className="stack" id="learning" aria-labelledby="stack-title">
              <h2 className="stack-title" id="stack-title">
                我们使用
              </h2>

              <dia-icon-cloud className="stack-cloud" size="440" speed="1">
                <ul className="cloud-list">
                  <li data-icon="c">C</li>
                  <li data-icon="cplusplus">C++</li>
                  <li data-icon="openjdk">Java</li>
                  <li data-icon="python">Python</li>
                  <li data-icon="git">Git</li>
                  <li data-icon="github">GitHub</li>
                  <li data-icon="linux">Linux</li>
                  <li data-icon="docker">Docker</li>
                  <li data-icon="mysql">MySQL</li>
                  <li data-icon="redis">Redis</li>
                  <li data-icon="nginx">NGINX</li>
                  <li data-icon="nodedotjs">Node.js</li>
                  <li data-icon="javascript">JavaScript</li>
                  <li data-icon="typescript">TypeScript</li>
                  <li data-icon="html5">HTML5</li>
                  <li data-icon="css">CSS</li>
                </ul>
              </dia-icon-cloud>

              <a className="interactive-resource-button" href="#learning">
                <span className="interactive-resource-button__base">
                  <span className="interactive-resource-button__dot" aria-hidden="true" />
                  <span>更多资源</span>
                </span>
                <span className="interactive-resource-button__hover" aria-hidden="true">
                  <span>更多资源</span>
                  <span className="interactive-resource-button__arrow">→</span>
                </span>
              </a>

              <StackVelocity />
            </section>

            {/* 竞赛荣誉：只展示素材包中已核验的两项，不补写材料没有的信息。 */}
            <section className="awards" id="honors" aria-labelledby="awards-title">
              <h2 className="awards-title" id="awards-title">
                我们赢得
              </h2>

              <div className="awards-body">
                <div className="awards-globe" aria-label="可交互的文字地球">
                  <threeui-globe-study
                    className="text-path-study"
                    mode="auto"
                    scale="1.00"
                    opacity="1.00"
                    hue="0"
                    saturation="1.00"
                    brightness="1.00"
                  />
                </div>
                <dia-animated-list className="awards-list" delay="560" duration="460" start-on-view="">
                  <ul className="award-list">
                    <li className="award-item" data-rank="second">
                      <span className="award-item__dot" aria-hidden="true" />
                      <span className="award-item__event">第十五届蓝桥杯 · B 组</span>
                      <span className="award-item__meta">周子彤 · 国家级 · 全国二等奖</span>
                    </li>
                    <li className="award-item" data-rank="silver">
                      <span className="award-item__dot" aria-hidden="true" />
                      <span className="award-item__event">2025 CCPC · 全国邀请赛（南昌）</span>
                      <span className="award-item__meta">周子彤 · 国家级 · 银牌</span>
                    </li>
                  </ul>
                </dia-animated-list>
              </div>
            </section>

            {/* Bento 资源入口：目标都是本页已有区块。 */}
            <section className="bento-section" id="resources" aria-labelledby="bento-title">
              <h2 className="bento-title" id="bento-title">
                在这里你可以
              </h2>

              <div className="bento-grid">
                <article className="bento-card bento-card--wide">
                  <div className="bento-card__background" aria-hidden="true">
                    <threeui-globe-study
                      className="bento-globe bento-globe--learning text-path-study"
                      mode="auto"
                      scale="1"
                      opacity="1"
                      hue="0"
                      saturation="1"
                      brightness="1"
                    />
                  </div>
                  <div className="bento-card__content">
                    <span className="bento-card__icon" aria-hidden="true">
                      ◌
                    </span>
                    <h3 className="bento-card__title">学习资源</h3>
                    <p className="bento-card__description">
                      从基础语言到项目实践，建立自己的技术路径。
                    </p>
                  </div>
                  <a className="bento-card__cta" href="#learning">
                    查看 <span aria-hidden="true">→</span>
                  </a>
                  <div className="bento-card__overlay" aria-hidden="true" />
                </article>

                <article className="bento-card bento-card--horizon">
                  <div className="bento-card__content">
                    <span className="bento-card__icon" aria-hidden="true">
                      ✦
                    </span>
                    <h3 className="bento-card__title">拓宽视野</h3>
                    <p className="bento-card__description">
                      从每一次分享、活动与交流中看到更大的世界。
                    </p>
                  </div>
                  <a className="bento-card__cta" href="#activities">
                    查看 <span aria-hidden="true">→</span>
                  </a>
                  <div className="bento-card__overlay" aria-hidden="true" />
                </article>

                <article className="bento-card bento-card--people">
                  <div className="bento-card__background" aria-hidden="true">
                    <dia-marquee className="bento-marquee" repeat="4" pause-on-hover="">
                      <span>LEARN</span>
                      <i>·</i>
                      <span>MAKE</span>
                      <i>·</i>
                      <span>SHARE</span>
                      <i>·</i>
                      <span>GROW</span>
                      <i>·</i>
                    </dia-marquee>
                    <dia-avatar-circles className="bento-avatar-circles">
                      <img
                        src="/assets/photo-classroom-group.webp"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        src="/assets/photo-contest-group.webp"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        src="/assets/photo-ccpc-zhengzhou.webp"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </dia-avatar-circles>
                  </div>
                  <div className="bento-card__content">
                    <span className="bento-card__icon" aria-hidden="true">
                      &lt;/&gt;
                    </span>
                    <h3 className="bento-card__title">结识伙伴</h3>
                    <p className="bento-card__description">
                      与热爱技术的人一起讨论、尝试和成长。
                    </p>
                  </div>
                  <a className="bento-card__cta" href="#join">
                    查看 <span aria-hidden="true">→</span>
                  </a>
                  <div className="bento-card__overlay" aria-hidden="true" />
                </article>
              </div>
            </section>
          </div>
        </div>

        {/* 加入我们：文案由维护者口述给定，只此两行，不外扩招新信息与联系方式。 */}
        <section className="join" id="join" aria-labelledby="join-title">
          <dia-retro-grid className="join-grid" />

          <div className="join-body">
            <h2 className="join-title" id="join-title">
              <span className="join-title__main">加入我们</span>
              <span className="join-title__slogan">展现你奔腾不息的力量</span>
            </h2>
          </div>
        </section>

        <footer className="closing-band" aria-label="网站页脚">
          <div className="closing-band__inner">
            <p className="closing-band__name">东华理工计算机协会</p>

            <div className="site-footer">
              <nav className="site-footer__links" aria-label="政策与网站说明">
                <details className="site-footer__policy">
                  <summary>隐私政策</summary>
                  <p>本页面不要求注册，也不主动收集个人信息；主题偏好仅保存在本机浏览器。</p>
                </details>
                <details className="site-footer__policy">
                  <summary>使用条款</summary>
                  <p>网站内容用于协会信息展示与学习交流，引用时请保留原始来源与必要说明。</p>
                </details>
                <details className="site-footer__policy">
                  <summary>内容与版权</summary>
                  <p>协会原创内容归相应权利人所有，引用的第三方素材版权归原作者或机构所有。</p>
                </details>
                <details className="site-footer__policy">
                  <summary>无障碍声明</summary>
                  <p>网站持续改善键盘操作、文字对比度和减少动画偏好支持，欢迎反馈使用问题。</p>
                </details>
              </nav>

              <p className="site-footer__copyright">© 2026 东华理工大学计算机协会</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
