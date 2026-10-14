import Link from "next/link";
import { HOME_STACK_ITEMS } from "@/lib/home-content";
import { StackVelocity } from "./stack-velocity";

/**
 * 技术栈：图标云里的路径数据来自基线的 `assets/icon-set.js`（Simple Icons 的本地副本），
 * 列表项文字既是读屏名称，也是无脚本时的回落内容。
 *
 * 「更多资源」在基线里指向本区块自身（`#learning`，原型期的页内占位）。
 * 主站有了真实路由后改指知识与文章页，不再自己指向自己。
 */
export function HomeStack() {
  return (
    <section className="stack" id="learning" aria-labelledby="stack-title">
      <h2 className="stack-title" id="stack-title">
        我们使用
      </h2>

      <dia-icon-cloud className="stack-cloud" size="440" speed="1">
        <ul className="cloud-list">
          {HOME_STACK_ITEMS.map((item) => (
            <li key={item.icon} data-icon={item.icon}>
              {item.name}
            </li>
          ))}
        </ul>
      </dia-icon-cloud>

      <Link className="interactive-resource-button" href="/knowledge">
        <span className="interactive-resource-button__base">
          <span className="interactive-resource-button__dot" aria-hidden="true" />
          <span>更多资源</span>
        </span>
        <span className="interactive-resource-button__hover" aria-hidden="true">
          <span>更多资源</span>
          <span className="interactive-resource-button__arrow">→</span>
        </span>
      </Link>

      <StackVelocity />
    </section>
  );
}
