import Link from "next/link";

type EmptyStateProps = {
  /** 说明当前为什么没有内容，不使用「敬请期待」这类无信息量的说法。 */
  body: string;
  /** 现在可以去的真实去处；每个都给可点链接，不生成无效按钮。 */
  actions: readonly { href: string; label: string }[];
};

/**
 * 内容尚未接入时的明确空状态。
 *
 * #3 只交付外壳与真实样例首页，各板块的内容输入由后续票负责；
 * 这里给出可核验的说明和站内真实入口，不留空白页、不放假入口。
 */
export function EmptyState({ body, actions }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">该板块内容尚未接入</p>
      <p className="empty-state__body">{body}</p>
      <p className="empty-state__actions">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="text-link">
            {action.label}
          </Link>
        ))}
      </p>
    </div>
  );
}
