/* eslint-disable @next/next/no-img-element -- 这三张图是 `<dia-avatar-circles>` 的直接子节点，
   组件会克隆这些节点并自己算尺寸与裁切，next/image 包一层会打断它的初始化。 */
import Link from "next/link";
import { HOME_BENTO_CARDS } from "@/lib/home-content";

const CLASS_PHOTO_SRC = "/prototype/assets/photo-classroom-group.webp";
const CONTEST_PHOTO_SRC = "/prototype/assets/photo-contest-group.webp";
const CCPC_PHOTO_SRC = "/prototype/assets/photo-ccpc-zhengzhou.webp";

/**
 * Bento 资源入口：目标都是站内真实存在的区块或页面，不新增未确认的外部服务或报名状态。
 *
 * 结构和类名照基线：宽卡用文字地球做背景，横排卡只有文字，第三张叠加跑马灯与头像圈。
 */
export function HomeBento() {
  return (
    <section className="bento-section" id="resources" aria-labelledby="bento-title">
      <h2 className="bento-title" id="bento-title">
        在这里你可以
      </h2>

      <div className="bento-grid">
        {HOME_BENTO_CARDS.map((card) => (
          <article key={card.title} className={`bento-card bento-card--${card.variant}`}>
            {card.variant === "wide" ? (
              <div className="bento-card__background" aria-hidden="true">
                <threeui-globe-study
                  className="bento-globe bento-globe--learning text-path-study"
                  mode="auto"
                  scale="1"
                  opacity="1"
                  hue="0"
                  saturation="1"
                  brightness="1"
                />
              </div>
            ) : null}

            {card.variant === "people" ? (
              <div className="bento-card__background" aria-hidden="true">
                <dia-marquee className="bento-marquee" repeat="4" pause-on-hover="">
                  <span>LEARN</span>
                  <i>·</i>
                  <span>MAKE</span>
                  <i>·</i>
                  <span>SHARE</span>
                  <i>·</i>
                  <span>GROW</span>
                  <i>·</i>
                </dia-marquee>

                <dia-avatar-circles className="bento-avatar-circles">
                  <img src={CLASS_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
                  <img src={CONTEST_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
                  <img src={CCPC_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
                </dia-avatar-circles>
              </div>
            ) : null}

            <div className="bento-card__content">
              <span className="bento-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="bento-card__title">{card.title}</h3>
              <p className="bento-card__description">{card.description}</p>
            </div>

            <Link className="bento-card__cta" href={card.href}>
              查看 <span aria-hidden="true">→</span>
            </Link>

            <div className="bento-card__overlay" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}
