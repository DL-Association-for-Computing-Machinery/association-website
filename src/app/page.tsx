import Link from "next/link";
import {
  HOME_ABOUT,
  HOME_ACTIVITIES,
  HOME_AWARDS,
  HOME_AWARDS_FOOTNOTE,
  HOME_DIRECTIONS,
  HOME_HERO,
} from "@/lib/home-content";

/**
 * 首页：#3 交付的「真实样例首页」。
 *
 * 只呈现公开内容包里已核验的条目 —— 不写精确成立年份、不宣称正在招新、
 * 不补第三第四项全国性荣誉。各区块的「更多」都指向已有真实路由，
 * 不做锚点占位。
 */
export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="shell">
          <p className="hero__kicker">{HOME_HERO.kicker}</p>
          <h1 className="hero__title" id="hero-title">
            {HOME_HERO.title}
          </h1>
          <p className="hero__lede">{HOME_HERO.lede}</p>
          <p className="hero__actions">
            <Link className="button" href={HOME_HERO.primaryAction.href}>
              {HOME_HERO.primaryAction.label}
            </Link>
            <Link className="text-link" href={HOME_HERO.secondaryAction.href}>
              {HOME_HERO.secondaryAction.label}
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="about-title">
        <div className="shell">
          <p className="section__kicker">协会定位</p>
          <h2 className="section__title" id="about-title">
            {HOME_ABOUT.title}
          </h2>
          {HOME_ABOUT.paragraphs.map((paragraph) => (
            <p className="section__lede" key={paragraph}>
              {paragraph}
            </p>
          ))}
          <p>
            <Link className="section__more" href="/about">
              了解协会介绍
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="activities-title">
        <div className="shell">
          <p className="section__kicker">活动回顾</p>
          <h2 className="section__title" id="activities-title">
            已发生的活动，按发生时间记录
          </h2>
          <p className="section__lede">
            下面是公开内容包中材料完整的两次活动。历史活动仅作回顾，不表示正在报名。
          </p>
          <ul className="activity-grid">
            {HOME_ACTIVITIES.map((activity) => (
              <li className="activity-card" key={activity.id}>
                <p className="activity-card__meta">
                  <time dateTime={activity.date}>{activity.date}</time>
                  {activity.tags.map((tag) => (
                    <span className="activity-card__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                  <span>{activity.status}</span>
                </p>
                <h3 className="activity-card__title">{activity.title}</h3>
                <p className="activity-card__summary">{activity.summary}</p>
              </li>
            ))}
          </ul>
          <p>
            <Link className="section__more" href="/activities">
              浏览全部活动
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="honors-title">
        <div className="shell">
          <p className="section__kicker">已核验荣誉</p>
          <h2 className="section__title" id="honors-title">
            成员的竞赛成绩
          </h2>
          <p className="section__lede">每条都注明赛事、级别与获奖者本人；材料没写的一律不补。</p>
          {HOME_AWARDS.length > 0 ? (
            <ul className="award-list">
              {HOME_AWARDS.map((award) => (
                <li className="award-item" key={award.id}>
                  <p className="award-item__meta">{award.period}</p>
                  <div className="award-item__event">
                    <b>{award.event}</b>
                    <p>{award.result}</p>
                    <p className="award-item__note">{award.attribution}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="award-footnote">当前页面暂无已核验的公开竞赛成绩。</p>
          )}
          <p className="award-footnote">{HOME_AWARDS_FOOTNOTE}</p>
          <p>
            <Link className="section__more" href="/honors">
              查看成果
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="learning-title">
        <div className="shell">
          <p className="section__kicker">学习方向</p>
          <h2 className="section__title" id="learning-title">
            可以从这三件事开始
          </h2>
          <ul className="direction-list">
            {HOME_DIRECTIONS.map((direction, index) => (
              <li className="direction-item" key={direction.id}>
                <h3>
                  {String(index + 1).padStart(2, "0")} {direction.title}
                </h3>
                <p>{direction.body}</p>
              </li>
            ))}
          </ul>
          <p>
            <Link className="section__more" href="/knowledge">
              浏览知识与文章
            </Link>
          </p>
        </div>
      </section>

      {/* 收尾标语与页脚同底相连：文案原文照录、整体居中，不外扩招新信息。 */}
      <section className="closing-band closing-band--flush-bottom">
        <div className="closing-band__inner">
          <p className="closing-band__name">
            加入我们
            <br />
            展现你奔腾不息的力量
          </p>
          <p className="closing-band__actions">
            <Link className="closing-band__cta" href="/join">
              了解加入方式
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
