import Link from "next/link";

export interface EmptyStateAction {
  readonly href: string;
  readonly label: string;
}

export interface EmptyStateProps {
  readonly title: string;
  readonly body: string;
  readonly actions: readonly EmptyStateAction[];
}

/**
 * 内容尚未接入的路由给出的明确空状态。
 *
 * 按内容治理口径：说清这里现在没有内容、为什么，并只给站内真实存在的出口，
 * 不生成无效按钮、假二维码或私人联系方式。
 */
export function EmptyState({ title, body, actions }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__body">{body}</p>
      <ul className="empty-state__actions">
        {actions.map((action) => (
          <li key={action.href}>
            <Link href={action.href}>{action.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
