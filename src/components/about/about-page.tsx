/* eslint-disable @next/next/no-img-element -- 窄屏相册与首页相同，靠基线 CSS 控制裁切；
   next/image 会带内联尺寸和 srcset，破坏与 Jasper 胶片回落的一致。 */
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { toRouteAction } from "@/components/route-page";
import {
  ABOUT_DIRECTIONS,
  ABOUT_GROUP_PHOTO,
  ABOUT_INTRO_PARAGRAPHS,
  ABOUT_JOIN_CTA,
  ABOUT_LOGO,
  ABOUT_PEOPLE_EMPTY,
  ABOUT_TIMELINE,
} from "@/lib/about-join-content";
import { findPageById } from "@/lib/site-navigation";

const CONTEST_PHOTO_SRC = "/prototype/assets/photo-contest-group.webp";
const CCPC_PHOTO_SRC = "/prototype/assets/photo-ccpc-zhengzhou.webp";
const DIRECTION_ICONS = ["◌", "✦", "</>"] as const;

/**
 * 协会介绍页：文案与资源仍只取内容包；版式沿用 Jasper #30 首页基线
 * （居中大标题、胶片轨道、bento 卡片），而不是文档站式的路由头 + 信息卡。
 *
 * 「这是我们」与首页 about 区块同一句标题，本页是它的完整展开。
 * 胶片区不使用首页的 `id="activities"`，避免抢走顶栏「活动回顾」锚点。
 */
export function AboutPageContent() {
  const joinPage = findPageById("join");
  const peopleActions = [toRouteAction("honors"), { href: "#about-intro", label: "继续阅读简介" }];
  const [lead, ...rest] = ABOUT_INTRO_PARAGRAPHS;

  return (
    <main id="main" className="about-page">
      <section className="about" aria-labelledby="about-page-title">
        <Image
          className="about-page__logo"
          src={ABOUT_LOGO.src}
          alt={ABOUT_LOGO.alt}
          width={ABOUT_LOGO.width}
          height={ABOUT_LOGO.height}
          priority
        />

        <h1 className="about-title" id="about-page-title">
          这是我们
        </h1>

        <div className="about-body" id="about-intro">
          <dia-blur-fade in-view="" delay="0.05">
            <p className="about-lead">{lead}</p>
          </dia-blur-fade>
          {rest.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <figure className="character-carousel-region" aria-label="协会活动与成员影像">
          <div className="about-page__photo-slot">
            <Image
              className="about-page__photo"
              src={ABOUT_GROUP_PHOTO.src}
              alt={ABOUT_GROUP_PHOTO.alt}
              fill
              sizes="(max-width: 76rem) 100vw, 76rem"
              priority
            />
          </div>

          <threeui-character-carousel
            variant="filmstrip"
            speed="1.00"
            scale="1.00"
            opacity="1.00"
            hue="0"
            saturation="1.00"
            brightness="1.00"
          />

          <div className="mobile-activity-gallery">
            <img
              src={ABOUT_GROUP_PHOTO.src}
              alt={ABOUT_GROUP_PHOTO.alt}
              loading="lazy"
              decoding="async"
            />
            <img src={CONTEST_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
            <img src={CCPC_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
          </div>
        </figure>
      </section>

      <section
        className="bento-section about-page__section"
        aria-labelledby="about-directions-title"
      >
        <h2 className="bento-title" id="about-directions-title">
          发展方向
        </h2>

        <div className="bento-grid">
          {ABOUT_DIRECTIONS.map((direction, index) => (
            <article className="bento-card bento-card--horizon" key={direction.title}>
              <div className="bento-card__content">
                <span className="bento-card__icon" aria-hidden="true">
                  {DIRECTION_ICONS[index]}
                </span>
                <h3 className="bento-card__title">{direction.title}</h3>
                <p className="bento-card__description">{direction.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page__section" aria-labelledby="about-people-title">
        <h2 className="bento-title" id="about-people-title">
          公开成员与指导
        </h2>
        <EmptyState
          title={ABOUT_PEOPLE_EMPTY.title}
          body={ABOUT_PEOPLE_EMPTY.body}
          actions={peopleActions}
        />
      </section>

      <section className="about-page__section" aria-labelledby="about-timeline-title">
        <h2 className="bento-title" id="about-timeline-title">
          发展历程
        </h2>
        <ol className="about-page__timeline">
          {ABOUT_TIMELINE.map((item) => (
            <li className="bento-card" key={item.date}>
              <div className="bento-card__content">
                <time className="about-page__date" dateTime={item.date}>
                  {item.date}
                </time>
                <h3 className="bento-card__title">{item.title}</h3>
                <p className="bento-card__description">{item.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="page-cta about-page__cta">
        <Link className="home-inline-link" href={joinPage.href}>
          {ABOUT_JOIN_CTA}
        </Link>
      </p>
    </main>
  );
}
