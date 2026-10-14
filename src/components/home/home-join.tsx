import { HOME_JOIN } from "@/lib/home-content";

/**
 * 加入我们：页面收尾区块，导航里的 `#join` 指向这里。
 *
 * 文案只有内容包给定的两行，换行按原文保留、整体居中；
 * 背景 `<dia-retro-grid>` 是纯装饰层（组件自带 aria-hidden，也不接收指针事件），
 * 不外扩「正在招新」「招新表单」「二维码」之类内容包明确不能写的信息。
 */
export function HomeJoin() {
  return (
    <section className="join" id="join" aria-labelledby="join-title">
      <dia-retro-grid className="join-grid" />

      <div className="join-body">
        <h2 className="join-title" id="join-title">
          <span className="join-title__main">{HOME_JOIN.title}</span>
          <span className="join-title__slogan">{HOME_JOIN.slogan}</span>
        </h2>
      </div>
    </section>
  );
}
