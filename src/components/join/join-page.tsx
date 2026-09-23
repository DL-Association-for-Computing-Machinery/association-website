import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { RouteHeader } from "@/components/route-header";
import { toRouteAction } from "@/components/route-page";
import {
  JOIN_CONTACT_BODY,
  JOIN_PAGE_TITLE,
  JOIN_PATHS,
  JOIN_SIGNUP_EMPTY,
} from "@/lib/about-join-content";
import { findPageById } from "@/lib/site-navigation";

export function JoinPageContent() {
  const signupActions = [
    toRouteAction("about"),
    toRouteAction("activities"),
    { href: "/", label: "返回首页" },
  ];

  return (
    <main id="main" className="route-main">
      <div className="route-inner">
        <RouteHeader
          kicker="JOIN"
          title={JOIN_PAGE_TITLE}
          summary="回答「如何参与」：零基础同学、新生和想参加算法竞赛的同学，各自从哪一步开始。"
        />

        <div className="route-stack">
          <section className="route-section" aria-labelledby="join-paths-title">
            <h2 className="route-section__title" id="join-paths-title">
              参与路径
            </h2>
            <ul className="info-grid">
              {JOIN_PATHS.map((path) => (
                <li className="info-card" key={path.id}>
                  <h3 className="info-card__title">{path.title}</h3>
                  <p className="info-card__body">{path.body}</p>
                  <ul className="info-card__links">
                    {path.links.map((link) => {
                      const page = findPageById(link.page);

                      return (
                        <li key={link.page}>
                          <Link href={page.href}>{link.label}</Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="route-section" aria-labelledby="join-contact-title">
            <h2 className="route-section__title" id="join-contact-title">
              联系指引
            </h2>
            <p className="contact-panel">{JOIN_CONTACT_BODY}</p>
          </section>

          <EmptyState
            title={JOIN_SIGNUP_EMPTY.title}
            body={JOIN_SIGNUP_EMPTY.body}
            actions={signupActions}
          />
        </div>
      </div>
    </main>
  );
}
