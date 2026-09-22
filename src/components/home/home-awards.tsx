import { HOME_AWARDS_PREVIEW } from "@/lib/home-content";

/**
 * 竞赛荣誉：导航里的 `#honors` 指向这里。
 *
 * 条目全部来自内容包 2026-09-20 追加的「我们赢得」登记表，逐条标注成员、级别与奖项；
 * 材料没写的专业组细分、指导教师、获奖人数和日期一律不补。
 *
 * 说明三件事：
 * - **首页是摘要位，只展示上限之内的前几条**（`HOME_AWARDS_PREVIEW`），与首页基线逐条一致：
 *   基线这里只列「第十五届蓝桥杯 · B 组」和「2025 CCPC · 全国邀请赛（南昌）」，
 *   完整清单留给成果页。#3 的验收原文也是「已核验荣誉摘要（预览支持 0–4 条）」，
 *   所以不把 10 条全铺在首页。
 * - **条数为 0 时给出明确空状态**，不留空列表：预览条数是被 `HOME_AWARDS_PREVIEW_LIMIT`
 *   显式控制的，0 是合法取值（例如来源未登记齐时），此时要有话说。
 * - `<dia-animated-list>` 会把条目逐条 prepend，视觉上最后一条落在最上方，
 *   因此预览数组不能按阅读顺序写（源码顺序见 `home-content.ts`）。
 */
export function HomeAwards() {
  const hasAwards = HOME_AWARDS_PREVIEW.length > 0;

  return (
    <section className="awards" id="honors" aria-labelledby="awards-title">
      <h2 className="awards-title" id="awards-title">
        我们赢得
      </h2>

      <div className="awards-body">
        <div className="awards-globe" aria-label="可交互的文字地球">
          <threeui-globe-study
            className="text-path-study"
            mode="auto"
            scale="1.00"
            opacity="1.00"
            hue="0"
            saturation="1.00"
            brightness="1.00"
          />
        </div>

        {hasAwards ? (
          <dia-animated-list className="awards-list" delay="560" duration="460" start-on-view="">
            <ul className="award-list">
              {HOME_AWARDS_PREVIEW.map((award) => (
                <li key={award.id} className="award-item" data-rank={award.rank}>
                  {/* 奖级色点纯装饰：奖级文字在 meta 行里，信息不靠颜色单独传达 */}
                  <span className="award-item__dot" aria-hidden="true" />
                  <span className="award-item__event">{award.event}</span>
                  <span className="award-item__meta">{award.meta}</span>
                </li>
              ))}
            </ul>
          </dia-animated-list>
        ) : (
          <p className="awards-empty">荣誉摘要待来源登记后填充：本区块只收录已核验来源的成绩。</p>
        )}
      </div>
    </section>
  );
}
