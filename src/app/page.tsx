"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const navItems = [
  ["探索计协", "about"],
  ["竞赛荣誉", "honors"],
  ["活动回顾", "activities"],
  ["学习方向", "learning"],
  ["加入我们", "join"],
] as const;
const honors = [
  { year: "2025", title: "CCPC 郑州站", detail: "全国大学生程序设计竞赛 · 参赛实践" },
  { year: "2024", title: "ECPC 校赛", detail: "东华理工大学程序设计竞赛 · 赛场记录" },
  { year: "持续", title: "从第一次提交开始", detail: "把每次训练、复盘和协作都变成成长" },
];
const activities = [
  {
    image: "/assets/photo-classroom-group.webp",
    tag: "学习",
    title: "在真实问题里练习技术",
    copy: "从基础语法到团队项目，和一群愿意一起动手的人保持连接。",
  },
  {
    image: "/assets/photo-contest-group.webp",
    tag: "赛事",
    title: "把赛场当作公开课",
    copy: "算法训练、赛后复盘与经验分享，形成属于计协的学习节奏。",
  },
  {
    image: "/assets/association-group.webp",
    tag: "社区",
    title: "认识一起写代码的人",
    copy: "活动、分享会和日常交流，让兴趣有机会变成长期的伙伴关系。",
  },
];

export default function Home() {
  const [dark, setDark] = useState(false);
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const saved = window.localStorage.getItem("ecut-ca-theme");
    const themeTimer = window.setTimeout(() => setDark(saved === "dark"), 0);
    const timer = window.setTimeout(() => setIntro(false), 2200);
    return () => {
      window.clearTimeout(themeTimer);
      window.clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    window.localStorage.setItem("ecut-ca-theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <div className="site-shell">
      {intro && (
        <div className="intro-screen" role="status" aria-label="正在载入东华理工大学计算机协会">
          <div className="intro-panels" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </div>
          <div className="intro-wordmark">ECUT</div>
          <button className="intro-skip" onClick={() => setIntro(false)}>
            跳过动画
          </button>
        </div>
      )}
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">
          <Image
            src="/assets/association-logo.png"
            alt="东华理工大学计算机协会 Logo"
            width={44}
            height={44}
            priority
          />
          <span>
            <strong>ECUT</strong>
            <small>Computer Association</small>
          </span>
        </a>
        <nav aria-label="主导航" className="nav-dock">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
          <button
            className="theme-toggle"
            aria-label={dark ? "切换浅色主题" : "切换深色主题"}
            onClick={() => setDark((value) => !value)}
          >
            {dark ? "☀" : "☾"}
          </button>
        </nav>
      </header>
      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> 东华理工大学学生计算机协会
            </p>
            <h1 id="hero-title">
              Computer
              <br />
              <em>Association</em>
            </h1>
            <p className="hero-lede">
              让好奇心有地方落地，
              <br />
              让每一次敲下回车都算数。
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#about">
                探索计协 <span>↗</span>
              </a>
              <a className="text-link" href="#join">
                如何加入 <span>↓</span>
              </a>
            </div>
          </div>
          <div className="hero-art" aria-label="协会 Logo 视觉徽章">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="logo-orb">
              <Image src="/assets/association-logo.png" alt="" width={170} height={170} priority />
            </div>
            <span className="orbit-label">EST. / ECUT</span>
          </div>
          <div className="hero-meta">
            <span>01 / 05</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </section>
        <section className="section intro-section" id="about" aria-labelledby="about-title">
          <div className="section-kicker">01 / 关于我们</div>
          <div>
            <h2 id="about-title">
              一个把兴趣
              <br />
              <span>变成行动的地方。</span>
            </h2>
            <p className="section-lede">
              我们是东华理工大学里一群喜欢计算机科学与信息技术的同学。这里有算法、项目、比赛，也有从不会到会的耐心。
            </p>
            <a className="arrow-link" href="#learning">
              看看我们在学什么 <span>→</span>
            </a>
          </div>
          <div className="stat-line">
            <strong>∞</strong>
            <span>
              从一行代码开始，
              <br />
              没有固定的终点。
            </span>
          </div>
        </section>
        <section className="dark-band" id="honors" aria-labelledby="honors-title">
          <div className="section-kicker">02 / 竞赛荣誉</div>
          <div>
            <h2 id="honors-title">
              在赛场上，
              <br />
              <span>和自己较劲。</span>
            </h2>
            <p className="section-lede">比赛不是答案，是一张把训练、协作和复盘串起来的地图。</p>
          </div>
          <div className="honor-list">
            {honors.map((honor) => (
              <article className="honor-item" key={honor.title}>
                <span>{honor.year}</span>
                <div>
                  <h3>{honor.title}</h3>
                  <p>{honor.detail}</p>
                </div>
                <span className="honor-arrow">↗</span>
              </article>
            ))}
          </div>
        </section>
        <section
          className="section activities-section"
          id="activities"
          aria-labelledby="activities-title"
        >
          <div className="section-kicker">03 / 活动回顾</div>
          <div className="section-heading">
            <h2 id="activities-title">
              一起做点
              <br />
              <span>有意思的事。</span>
            </h2>
            <a className="arrow-link" href="#join">
              加入下一次活动 <span>→</span>
            </a>
          </div>
          <div className="activity-grid">
            {activities.map((activity) => (
              <article className="activity-card" key={activity.title}>
                <div className="activity-image">
                  <Image src={activity.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" />
                </div>
                <p className="activity-tag">{activity.tag}</p>
                <h3>{activity.title}</h3>
                <p>{activity.copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="learning-section" id="learning" aria-labelledby="learning-title">
          <div className="section-kicker">04 / 学习方向</div>
          <div className="learning-content">
            <h2 id="learning-title">
              找到你愿意
              <br />
              <span>反复练习的事。</span>
            </h2>
            <div className="learning-list">
              <p>
                <b>01</b> 算法与竞赛 <span>↗</span>
              </p>
              <p>
                <b>02</b> 全栈与项目 <span>↗</span>
              </p>
              <p>
                <b>03</b> 设计与表达 <span>↗</span>
              </p>
              <p>
                <b>04</b> 开源与协作 <span>↗</span>
              </p>
            </div>
          </div>
        </section>
        <section className="join-section" id="join" aria-labelledby="join-title">
          <p className="eyebrow">
            <span /> 05 / 加入我们
          </p>
          <h2 id="join-title">
            下一段故事，
            <br />
            <em>等你来写。</em>
          </h2>
          <p>关注公众号「计协ECUT」，获取活动与招新信息。</p>
          <a
            className="button button-light"
            href="https://mp.weixin.qq.com/"
            target="_blank"
            rel="noreferrer"
          >
            关注计协ECUT <span>↗</span>
          </a>
        </section>
      </main>
      <footer className="site-footer">
        <span>© 2026 ECUT COMPUTER ASSOCIATION</span>
        <span>东华理工大学 · 南昌</span>
      </footer>
    </div>
  );
}
