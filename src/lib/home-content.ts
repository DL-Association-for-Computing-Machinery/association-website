/**
 * 首页真实内容。
 *
 * 全部逐字取自 `docs/content/launch-content-pack.md`（2026-09-19 整理，2026-09-20 追加
 * 「我们赢得」荣誉列表），不新增材料里没有的地点、人数、成立年份、专业组细分或指导教师。
 * 本模块只承载 #3 的样例首页；统一内容模型由 #4 收敛，届时本模块整体替换为内容契约消费方。
 */

export interface AwardEntry {
  /** 内容包里的条目标识，便于回溯来源与审核结论 */
  readonly id: string;
  /** 赛事名（含年份或届次，按内容包给出的精度，不推算日期） */
  readonly event: string;
  /** 成员 · 级别 · 奖项；内容包未给级别时只写两段，不补全 */
  readonly meta: string;
  /** 奖级色点标识，取值与 styles/prototype.css 的 .award-item[data-rank] 一致 */
  readonly rank: "first" | "second" | "third" | "silver" | "bronze" | "ninth";
}

export const HOME_SITE_NAME = "东华理工大学计算机协会";

export const HOME_HERO = {
  /** 首屏字标：ECUT 与英文全称，与首页基线一致 */
  brand: "ECUT",
  wordmark: "Computer|Association",
} as const;

export const HOME_GREETING = {
  title: "Hello",
  subtitle: "欢迎来到东华理工计协官网",
  /**
   * 终端里的内容在首页基线里被明确标注为组件演示，不代表协会已有任何工具或服务。
   * 本轮按基线原样还原；换成真实内容属 #4/#5 的范围。
   */
  terminalLines: [
    { text: "$ whoami", typing: true },
    { text: "ecut-ca@localhost", typing: false },
    { text: "$ cat ./sections.txt", typing: true },
    { text: "探索计协", typing: false },
    { text: "竞赛荣誉", typing: false },
    { text: "活动回顾", typing: false },
    { text: "学习方向", typing: false },
    { text: "加入我们", typing: false },
    { text: "$ echo $?", typing: true },
    { text: "0", typing: false },
  ],
} as const;

/** 协会简介正文第一段（内容包「协会简介正文」原文）；完整三段留待协会介绍页。 */
export const HOME_ABOUT_LEAD =
  "东华理工大学计算机协会是由校内计算机科学和信息技术爱好者组成的学术科技类社团。我们通过技术讲座、主题分享、算法培训和模拟赛，为成员提供学习、交流与合作的机会。";

/** 技术栈标签云的读屏名称与图标数据键，顺序照首页基线。 */
export const HOME_STACK_ITEMS = [
  { icon: "c", name: "C" },
  { icon: "cplusplus", name: "C++" },
  { icon: "openjdk", name: "Java" },
  { icon: "python", name: "Python" },
  { icon: "git", name: "Git" },
  { icon: "github", name: "GitHub" },
  { icon: "linux", name: "Linux" },
  { icon: "docker", name: "Docker" },
  { icon: "mysql", name: "MySQL" },
  { icon: "redis", name: "Redis" },
  { icon: "nginx", name: "NGINX" },
  { icon: "nodedotjs", name: "Node.js" },
  { icon: "javascript", name: "JavaScript" },
  { icon: "typescript", name: "TypeScript" },
  { icon: "html5", name: "HTML5" },
  { icon: "css", name: "CSS" },
] as const;

/**
 * 「我们赢得」区块的竞赛荣誉，共 10 条，逐条取自内容包 2026-09-20 追加的登记表。
 *
 * 数组顺序是**源码顺序（弱 → 强）**：`<dia-animated-list>` 会把条目逐条 `prepend`，
 * 因此视觉上最后一条落在最上方。内容包要求「越靠上越新、越靠前越强」，
 * 这里按「国家级在前、同级按年份或届次新在前、无年份的排在该级别末尾」排布，
 * 最终细则待 #4 内容模型统一。
 */
export const HOME_AWARDS: readonly AwardEntry[] = [
  {
    id: "achievement-lanqiao-14",
    event: "第十四届蓝桥杯",
    meta: "黄琪钧 · 省级 · 江西省二等奖",
    rank: "second",
  },
  {
    id: "achievement-chuanzhi-6",
    event: "第六届传智杯",
    meta: "周子彤 · 省级 · 省赛二等奖",
    rank: "second",
  },
  {
    id: "achievement-baidu-star-2024",
    event: "2024 百度之星",
    meta: "王继源 · 银奖",
    rank: "silver",
  },
  {
    id: "achievement-icpc-invite-2024",
    event: "2024 ICPC · 全国邀请赛（陕西）",
    meta: "王继源 · 国家级 · 铜奖",
    rank: "bronze",
  },
  {
    id: "achievement-ccpc-zhengzhou-24",
    event: "2024 CCPC · 全国邀请赛（郑州）",
    meta: "王继源 · 国家级 · 铜奖",
    rank: "bronze",
  },
  {
    id: "achievement-lanqiao-2024",
    event: "2024 蓝桥杯",
    meta: "王继源 · 省级 · 省赛一等奖",
    rank: "first",
  },
  {
    // 内容包全文为「中国高校计算机大赛·团队程序设计天梯赛」，此处用登记表的简称「天梯赛」。
    id: "achievement-tianti-2024",
    event: "2024 天梯赛",
    meta: "王继源 · 国家级 · 国家三等奖",
    rank: "third",
  },
  {
    id: "achievement-chuangke-9",
    event: "第九届创客中国 · AIGC 专题赛",
    meta: "冯洋辉 · 全国第九",
    rank: "ninth",
  },
  {
    id: "achievement-lanqiao-15",
    event: "第十五届蓝桥杯 · B 组",
    meta: "周子彤 · 国家级 · 全国二等奖",
    rank: "second",
  },
  {
    id: "achievement-ccpc-2025",
    event: "2025 CCPC · 全国邀请赛（南昌）",
    meta: "周子彤 · 国家级 · 银牌",
    rank: "silver",
  },
];

/**
 * 首页预览的候选条目，按**由强到弱**排列。
 *
 * 用显式 id 而不是下标切片或按 `rank` 排序：以后调整 `HOME_AWARDS` 的顺序、
 * 或补录新成绩时，首页展示哪几条不会被悄悄改掉 —— 要换条目必须改这张表。
 * 第 3、4 位只是候选占位，最终的四项荣誉由 #2 与 #5 验收确定。
 */
const HOME_AWARDS_PREVIEW_RANKING: readonly string[] = [
  "achievement-ccpc-2025",
  "achievement-lanqiao-15",
  "achievement-tianti-2024",
  "achievement-icpc-invite-2024",
];

/** 预览条数的合法上限。#3 的验收原文是「预览支持 0–4 条」。 */
export const HOME_AWARDS_PREVIEW_MAX = 4;

/**
 * 首页预览实际展示几条。改这一个值即可在 0–4 之间切换，越界会被钳回合法区间，
 * 因此「0 条」也是被支持的正常状态，不是需要临时绕开的边界。
 */
export const HOME_AWARDS_PREVIEW_LIMIT = 2;

function clampPreviewLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(limit), 0), HOME_AWARDS_PREVIEW_MAX);
}

/**
 * 首页「我们赢得」区块**实际展示**的条目，与首页基线逐条一致：只有 2 条。
 *
 * 基线把这里当摘要位，只列最强的两条国家级成绩，完整清单留给成果页；
 * #3 的验收原文也是「首页展示……已核验荣誉摘要（预览支持 0–4 条）」。
 *
 * 取候选表前 N 条（强 → 弱），再**反转回 `HOME_AWARDS` 的弱 → 强顺序**：
 * `<dia-animated-list>` 会逐条 prepend，反转之后最强的才落在最上方，
 * 与基线的视觉顺序一致。完整 10 条留在 `HOME_AWARDS`，供成果页（#5）使用。
 */
export const HOME_AWARDS_PREVIEW: readonly AwardEntry[] = HOME_AWARDS_PREVIEW_RANKING.slice(
  0,
  clampPreviewLimit(HOME_AWARDS_PREVIEW_LIMIT),
)
  .reverse()
  .map((id) => HOME_AWARDS.find((award) => award.id === id))
  .filter((award): award is AwardEntry => award !== undefined);

export interface BentoCard {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  /** 站内真实目标，不指向未确认的外部服务 */
  readonly href: string;
  readonly variant: "wide" | "horizon" | "people";
}

/** Bento 资源入口：目标都是本页或站内已存在的区块，不新增未确认的报名状态。 */
export const HOME_BENTO_CARDS: readonly BentoCard[] = [
  {
    icon: "◌",
    title: "学习资源",
    description: "从基础语言到项目实践，建立自己的技术路径。",
    href: "/#learning",
    variant: "wide",
  },
  {
    icon: "✦",
    title: "拓宽视野",
    description: "从每一次分享、活动与交流中看到更大的世界。",
    href: "/#activities",
    variant: "horizon",
  },
  {
    icon: "</>",
    title: "结识伙伴",
    description: "与热爱技术的人一起讨论、尝试和成长。",
    href: "/#join",
    variant: "people",
  },
] as const;

/** 收尾区块：只有两行原文，换行保留、整体居中，不外扩招新信息与联系方式。 */
export const HOME_JOIN = {
  title: "加入我们",
  slogan: "展现你奔腾不息的力量",
} as const;

export const SITE_FOOTER_NAME = "东华理工计算机协会";

export const SITE_FOOTER_COPYRIGHT = "© 2026 东华理工大学计算机协会";

/** 页脚政策说明，逐字取自首页基线。 */
export const SITE_FOOTER_POLICIES = [
  {
    summary: "隐私政策",
    body: "本页面不要求注册，也不主动收集个人信息；主题偏好仅保存在本机浏览器。",
  },
  {
    summary: "使用条款",
    body: "网站内容用于协会信息展示与学习交流，引用时请保留原始来源与必要说明。",
  },
  {
    summary: "内容与版权",
    body: "协会原创内容归相应权利人所有，引用的第三方素材版权归原作者或机构所有。",
  },
  {
    summary: "无障碍声明",
    body: "网站持续改善键盘操作、文字对比度和减少动画偏好支持，欢迎反馈使用问题。",
  },
] as const;
