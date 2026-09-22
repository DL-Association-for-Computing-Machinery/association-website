import { HomeAbout } from "@/components/home/home-about";
import { HomeAwards } from "@/components/home/home-awards";
import { HomeBento } from "@/components/home/home-bento";
import { HomeGreeting } from "@/components/home/home-greeting";
import { HomeHero } from "@/components/home/home-hero";
import { HomeJoin } from "@/components/home/home-join";
import { HomeStack } from "@/components/home/home-stack";

/**
 * 首页：把 #30 基线原型还原成可维护的响应式页面。
 *
 * 结构与类名逐层对齐 `public/prototype/index.html`：
 * `.dots-stage` 是圆点背景与内容共用的 grid 容器（两者叠在同一个格子里，
 * 内容决定高度、圆点层不占流式空间），分界线就是 `.join` 的上边缘；
 * 顶栏、跳过链接、开屏与页脚在外层 layout，这里是 `main` 以内的全部内容。
 *
 * 相对基线只动了两处，都为了「多页站点」这个既有前提：
 * 卡片与资源的链接指向真实路由（基线里全是本页锚点或 `#`），
 * 荣誉条目换成内容包登记表里已核验的成绩（基线原型只放了两条示例）。
 * 首页是摘要位，展示条数由 `HOME_AWARDS_PREVIEW_LIMIT` 控制在 0–4 条之内，
 * 完整清单留给成果页，不在这里铺开。
 */
export default function HomePage() {
  return (
    <main id="main">
      <div className="dots-stage">
        {/* 整页圆点背景，纯装饰（组件自带 aria-hidden、不收指针事件）。 */}
        <dia-dot-pattern className="page-dots" spacing="20" radius="1.1" glow="" />

        <div className="page-content">
          <HomeHero />
          <HomeGreeting />
          <HomeAbout />
          <HomeStack />
          <HomeAwards />
          <HomeBento />
        </div>
      </div>

      <HomeJoin />
    </main>
  );
}
