import Link from "next/link";
import { HOME_JOIN_PAGE_LINK } from "@/lib/about-join-content";
import { HOME_JOIN } from "@/lib/home-content";
import { findPageById } from "@/lib/site-navigation";

/**
 * 加入我们：页面收尾区块，导航里的 `#join` 指向这里。
 *
 * 文案只有内容包给定的两行，换行按原文保留、整体居中；
 * 背景 `<dia-retro-grid>` 是纯装饰层（组件自带 aria-hidden，也不接收指针事件），
 * 不外扩「正在招新」「招新表单」「二维码」之类内容包明确不能写的信息。
 *
 * slogan 下方只加一条站内导航「了解加入方式」，指向 /join，不塞公众号或招新状态。
 */
export function HomeJoin() {
  const joinPage = findPageById("join");

  return (
    <section className="join" id="join" aria-labelledby="join-title">
      <dia-retro-grid className="join-grid" />

      <div className="join-body">
        <h2 className="join-title" id="join-title">
          <span className="join-title__main">{HOME_JOIN.title}</span>
          <span className="join-title__slogan">{HOME_JOIN.slogan}</span>
        </h2>
        <Link className="home-inline-link home-inline-link--on-join" href={joinPage.href}>
          {HOME_JOIN_PAGE_LINK}
        </Link>
      </div>
    </section>
  );
}
