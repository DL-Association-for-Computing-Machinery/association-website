import { HOME_AWARDS } from "@/lib/home-content";

/**
 * 竞赛荣誉：导航里的 `#honors` 指向这里。
 *
 * 条目全部来自内容包 2026-09-20 追加的「我们赢得」登记表，逐条标注成员、级别与奖项；
 * 材料没写的专业组细分、指导教师、获奖人数和日期一律不补。
 *
 * 说明两件事：
 * - `HOME_AWARDS` 的源码顺序是弱 → 强，`<dia-animated-list>` 会把条目逐条 prepend，
 *   视觉上最后一条落在最上方，所以数组不能按阅读顺序写。
 * - 四项全国性荣誉的发布要求仍缺两项证据（#2），本区块展示的 10 条省级及以上成绩
 *   不替代那项验收，也不因此改口径。
 */
export function HomeAwards() {
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

        <dia-animated-list className="awards-list" delay="560" duration="460" start-on-view="">
          <ul className="award-list">
            {HOME_AWARDS.map((award) => (
              <li key={award.id} className="award-item" data-rank={award.rank}>
                {/* 奖级色点纯装饰：奖级文字在 meta 行里，信息不靠颜色单独传达 */}
                <span className="award-item__dot" aria-hidden="true" />
                <span className="award-item__event">{award.event}</span>
                <span className="award-item__meta">{award.meta}</span>
              </li>
            ))}
          </ul>
        </dia-animated-list>
      </div>
    </section>
  );
}
