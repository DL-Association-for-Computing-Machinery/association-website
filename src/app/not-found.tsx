import type { Metadata } from "next";
import { RoutePage } from "@/components/route-page";

export const metadata: Metadata = {
  title: "页面不存在",
};

/**
 * 404：无效路径下也让人走得出去。
 *
 * 用与六类内页同一套外壳，出口就是六类页面本身，不出现「返回」之类的空按钮。
 */
export default function NotFound() {
  return (
    <RoutePage
      kicker="404"
      title="没有这个页面"
      summary="这个地址可能写错了，也可能对应的页面还没有建立。"
      emptyTitle="从这里回到站内"
      emptyBody="下面是站内全部页面入口，也可以直接回到首页继续浏览。"
      related={["about", "activities", "honors", "knowledge", "join"]}
    />
  );
}
