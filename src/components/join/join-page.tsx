import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { toRouteAction } from "@/components/route-page";
import {
  JOIN_CONTACT_BODY,
  JOIN_PAGE_TITLE,
  JOIN_PATHS,
  JOIN_SIGNUP_EMPTY,
} from "@/lib/about-join-content";
import { findPageById } from "@/lib/site-navigation";

const PATH_ICONS = ["◌", "✦", "</>"] as const;

/**
 * 加入指引页：文案只取内容包；版式沿用 Jasper 首页收尾区
 * （透视网格 + 两行大标题），路径用 bento 卡片展开，不塞招新状态或二维码。
 */
export function JoinPageContent() {
  const joinPage = findPageById("join");
  const signupActions = [
    toRouteAction("about"),
    toRouteAction("activities"),
    { href: "/", label: "返回首页" },
  ];

  return (
    <main id="main" className="join-page">
      <section className="join" aria-labelledby="join-page-title">
        <dia-retro-grid className="join-grid" />

        <div className="join-body">
          <h1 className="join-title" id="join-page-title">
            <span className="join-title__main">{joinPage.title}</span>
            <span className="join-title__slogan">{JOIN_PAGE_TITLE}</span>
          </h1>
        </div>
      </section>

      <section className="bento-section join-page__section" aria-labelledby="join-paths-title">
        <h2 className="bento-title" id="join-paths-title">
          参与路径
        </h2>

        <div className="bento-grid">
          {JOIN_PATHS.map((path, index) => (
            <article className="bento-card bento-card--horizon" key={path.id}>
              <div className="bento-card__content">
                <span className="bento-card__icon" aria-hidden="true">
                  {PATH_ICONS[index]}
                </span>
                <h3 className="bento-card__title">{path.title}</h3>
                <p className="bento-card__description">{path.body}</p>
                <ul className="join-page__links">
                  {path.links.map((link) => {
                    const page = findPageById(link.page);

                    return (
                      <li key={link.page}>
                        <Link href={page.href}>{link.label}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="join-page__section" aria-labelledby="join-contact-title">
        <h2 className="bento-title" id="join-contact-title">
          联系指引
        </h2>
        <p className="join-page__contact">{JOIN_CONTACT_BODY}</p>
      </section>

      <section className="join-page__section" aria-label="报名入口">
        <EmptyState
          title={JOIN_SIGNUP_EMPTY.title}
          body={JOIN_SIGNUP_EMPTY.body}
          actions={signupActions}
        />
      </section>
    </main>
  );
}
