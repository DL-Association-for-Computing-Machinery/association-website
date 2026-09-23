import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { RouteHeader } from "@/components/route-header";
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

export function AboutPageContent() {
  const joinPage = findPageById("join");
  const peopleActions = [toRouteAction("honors"), { href: "#about-intro", label: "继续阅读简介" }];

  return (
    <main id="main" className="route-main">
      <div className="route-inner">
        <RouteHeader
          kicker="ABOUT"
          title="协会介绍"
          summary="回答「协会如何运行」：简介、发展方向、可公开的成员与指导信息，以及发展历程。"
        />

        <div className="route-stack">
          <div className="about-media">
            <Image
              className="about-media__logo"
              src={ABOUT_LOGO.src}
              alt={ABOUT_LOGO.alt}
              width={ABOUT_LOGO.width}
              height={ABOUT_LOGO.height}
              priority
            />
            <div className="about-media__photo-frame">
              <Image
                className="about-media__photo"
                src={ABOUT_GROUP_PHOTO.src}
                alt={ABOUT_GROUP_PHOTO.alt}
                fill
                sizes="(max-width: 48rem) 100vw, 48rem"
                priority
              />
            </div>
          </div>

          <section className="route-section" id="about-intro" aria-labelledby="about-intro-title">
            <h2 className="route-section__title" id="about-intro-title">
              简介
            </h2>
            <div className="about-copy">
              {ABOUT_INTRO_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="route-section" aria-labelledby="about-directions-title">
            <h2 className="route-section__title" id="about-directions-title">
              发展方向
            </h2>
            <ul className="info-grid">
              {ABOUT_DIRECTIONS.map((direction) => (
                <li className="info-card" key={direction.title}>
                  <h3 className="info-card__title">{direction.title}</h3>
                  <p className="info-card__body">{direction.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="route-section" aria-labelledby="about-people-title">
            <h2 className="route-section__title" id="about-people-title">
              公开成员与指导
            </h2>
            <EmptyState
              title={ABOUT_PEOPLE_EMPTY.title}
              body={ABOUT_PEOPLE_EMPTY.body}
              actions={peopleActions}
            />
          </section>

          <section className="route-section" aria-labelledby="about-timeline-title">
            <h2 className="route-section__title" id="about-timeline-title">
              发展历程
            </h2>
            <ol className="timeline">
              {ABOUT_TIMELINE.map((item) => (
                <li className="timeline__item" key={item.date}>
                  <time className="timeline__date" dateTime={item.date}>
                    {item.date}
                  </time>
                  <h3 className="timeline__title">{item.title}</h3>
                  <p className="timeline__summary">{item.summary}</p>
                </li>
              ))}
            </ol>
          </section>

          <p className="page-cta">
            <Link href={joinPage.href}>{ABOUT_JOIN_CTA}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
