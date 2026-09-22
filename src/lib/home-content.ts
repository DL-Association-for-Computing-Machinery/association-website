/**
 * 首页样例内容。
 *
 * 每条都逐字取自 `docs/content/launch-content-pack.md`（来源、日期精度与
 * 审核结论见该文件），不使用未经证实的规模、排名或获奖总数。
 *
 * 这里只是 #3 让外壳有真实样例可渲染的过渡数据；内容模型的收敛由 #4 负责，
 * 接入后本模块应被替换为从内容源读取，而不是继续手写。
 */

export type HeroContent = {
  kicker: string;
  title: string;
  lede: string;
  primaryAction: { href: string; label: string };
  secondaryAction: { href: string; label: string };
};

export type ActivityHighlight = {
  id: string;
  title: string;
  /** 展示用日期与精度说明；材料未给出的日期一律不补写。 */
  date: string;
  tags: readonly string[];
  summary: string;
  status: string;
};

export type AwardHighlight = {
  id: string;
  event: string;
  result: string;
  /** 届次或年份，按材料的实际精度写，不推算日期。 */
  period: string;
  /** 获奖者归属写法，避免被读成协会团体总成绩。 */
  attribution: string;
};

export type LearningDirection = {
  id: string;
  title: string;
  body: string;
};

export const HOME_HERO: HeroContent = {
  kicker: "东华理工大学计算机协会",
  title: "和同伴一起，把对计算机的兴趣变成实践。",
  lede: "东华理工大学计算机协会，聚集计算机科学与信息技术爱好者。在这里，一起学习算法、交流技术、参与项目与比赛，也把每一次活动的经验留下来。",
  primaryAction: { href: "/join", label: "了解加入方式" },
  secondaryAction: { href: "/activities", label: "浏览协会活动" },
};

export const HOME_ABOUT = {
  title: "协会是校内计算机科学和信息技术爱好者组成的学术科技类社团",
  paragraphs: [
    "我们通过技术讲座、主题分享、算法培训和模拟赛，为成员提供学习、交流与合作的机会。",
    "协会组织成员参与 ICPC、CCPC、蓝桥杯等编程竞赛，也参与组织 ECPC 等校园赛事。除了竞赛训练，我们鼓励项目实践与跨专业交流，让同学们在合作中运用技术、解决问题。",
  ],
} as const;

export const HOME_ACTIVITIES: readonly ActivityHighlight[] = [
  {
    id: "activity-ai-prompt-2026",
    title: "AI 提示词挑战赛：在实践中学习表达任务",
    date: "2026-05-12",
    tags: ["AI", "校园活动"],
    summary:
      "在社团文化艺术节中开展 AI 提示词挑战赛，参与者根据现场任务编写提示词，观察生成结果并在反馈中调整任务描述，围绕表达是否清晰、输出是否符合任务、完成效率和创意实用性进行评价。",
    status: "已结束",
  },
  {
    id: "activity-ecpc-third",
    title: "第三届东华理工大学程序设计竞赛（ECPC）",
    date: "2025-12-27",
    tags: ["算法", "ECPC"],
    summary:
      "赛事采用团队程序设计形式，设热身赛、正式赛与闭幕式；每队 1—3 人共用一台计算机，正式赛时长五小时，支持 C、C++、Java 与 Python，以通过题目数量和用时排名。",
    status: "已结束",
  },
];

/**
 * 首页的已核验竞赛荣誉摘要。
 *
 * 需求要求首屏四项全国性成绩，当前公开内容包里只有两项达到「赛事 + 级别 +
 * 本人」的粒度，因此这里就是两条 —— 不用参赛经历、省级奖项或重复个人记录凑数。
 * 区块按 0—4 条设计，条数变了只改这个数组，布局不用动。
 */
export const HOME_AWARDS: readonly AwardHighlight[] = [
  {
    id: "achievement-lanqiao-15",
    event: "第十五届蓝桥杯",
    result: "B 组全国二等奖",
    period: "第十五届",
    attribution: "协会成员周子彤的个人竞赛成绩",
  },
  {
    id: "achievement-ccpc-2025",
    event: "2025 CCPC 全国邀请赛（南昌）",
    result: "银牌",
    period: "2025",
    attribution: "协会成员周子彤的个人竞赛成绩",
  },
];

export const HOME_AWARDS_FOOTNOTE =
  "以上按成员个人竞赛成绩展示，不据此推定协会全部队伍的奖牌数。历史赛事仅作回顾，不表示正在报名。";

export const HOME_DIRECTIONS: readonly LearningDirection[] = [
  {
    id: "direction-algorithm",
    title: "算法训练与模拟赛",
    body: "从读懂题意开始，跟着培训与模拟赛的节奏练习；希望参加算法竞赛的同学可以从这里入门。",
  },
  {
    id: "direction-project",
    title: "项目实践与跨专业交流",
    body: "从技术分享开始，在合作中运用技术、解决问题；喜欢开发的同学可以参与项目实践。",
  },
  {
    id: "direction-notes",
    title: "活动资料与复盘",
    body: "活动材料与复盘经验持续沉淀在协会知识库，官网会精选其中适合公开的记录与学习资料。",
  },
];
