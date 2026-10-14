/* eslint-disable @next/next/no-img-element -- 这两处图片是基线样式直接控制的静态装饰图
   （窄屏相册靠 `aspect-ratio` + `object-fit` 裁切），换成 next/image 会带上内联尺寸与
   srcset，破坏与基线的视觉一致；它们也不是 LCP 元素，不需要按需优化。 */
import { HOME_ABOUT_LEAD } from "@/lib/home-content";

const GROUP_PHOTO_SRC = "/prototype/assets/association-group.webp";
const CONTEST_PHOTO_SRC = "/prototype/assets/photo-contest-group.webp";
const CCPC_PHOTO_SRC = "/prototype/assets/photo-ccpc-zhengzhou.webp";

/**
 * 关于我们：正文逐字取自内容包「协会简介正文」第一段，不新增未核验的规模、成立年份或荣誉描述。
 *
 * 块内两块内容沿用基线：
 * - 桌面用 `<threeui-character-carousel variant="filmstrip">` 的活动与成员影像轨道；
 * - 窄屏用静态三图相册（组件在轻量模式不创建 iframe，这里给等价的静态回落）。
 * 该展示区带 `id="activities"`，因为顶栏「活动回顾」指向它，与基线一致。
 */
export function HomeAbout() {
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <h2 className="about-title" id="about-title">
        这是我们
      </h2>

      <div className="about-body">
        <dia-blur-fade in-view="" delay="0.05">
          <p className="about-lead">{HOME_ABOUT_LEAD}</p>
        </dia-blur-fade>
      </div>

      <div
        className="character-carousel-region"
        id="activities"
        aria-label="协会活动与成员影像轮播"
      >
        <threeui-character-carousel
          variant="filmstrip"
          speed="1.00"
          scale="1.00"
          opacity="1.00"
          hue="0"
          saturation="1.00"
          brightness="1.00"
        />

        <div className="mobile-activity-gallery" aria-hidden="true">
          {/* 装饰性回落图：内容包要求不按人脸推断成员身份，故 alt 留空 */}
          <img src={GROUP_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
          <img src={CONTEST_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
          <img src={CCPC_PHOTO_SRC} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}
