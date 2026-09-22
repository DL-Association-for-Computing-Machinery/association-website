import Link from "next/link";
import { SITE_SECTION_LINKS } from "@/lib/site-navigation";

type SiteClosingProps = {
  /**
   * 是否显示收尾的「加入我们」两行标语。
   * 文案来自公开内容包，原文照录、整体居中，不外扩招新信息与联系方式，
   * 因此只在首页出现，避免在内容未接入的内页重复承诺。
   */
  withInvitation?: boolean;
};

/**
 * 站点收尾区块与页脚：黑色断层作为页面收束，深色外观下反转为白底。
 * 页脚放在这里而不是单独一条横条，是为了让每一页都有统一的落点。
 */
export function SiteClosing({ withInvitation = false }: SiteClosingProps) {
  return (
    <div className="closing-band">
      <div className="closing-band__inner">
        {withInvitation ? (
          <p className="closing-band__name">
            加入我们
            <br />
            展现你奔腾不息的力量
          </p>
        ) : null}

        <footer className="site-footer">
          <nav className="site-footer__links" aria-label="页脚导航">
            {SITE_SECTION_LINKS.map((section) => (
              <Link key={section.href} href={section.href}>
                {section.label}
              </Link>
            ))}
          </nav>
          <p className="site-footer__note">
            站点内容选自协会知识库中已审核的公开材料，不使用未经证实的规模、排名或获奖总数。
            历史赛事与活动仅作回顾，不表示正在报名。
          </p>
          <p className="site-footer__copyright">东华理工大学计算机协会</p>
        </footer>
      </div>
    </div>
  );
}
