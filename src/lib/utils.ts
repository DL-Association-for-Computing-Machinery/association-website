/**
 * 合并 className，过滤假值。
 *
 * 项目未引入 clsx / tailwind-merge，条件类名用本函数拼接即可；
 * 若将来需要解决 Tailwind 类冲突，再评估引入 tailwind-merge。
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
