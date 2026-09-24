/**
 * 主站首页内容。
 *
 * 全部文案逐条取自 docs/content/launch-content-pack.md 的登记表（审核状态「可发布」），
 * 未新增任何未经核验的事实：不写成立年份、不写招新日期、不编造报名入口、
 * 不新增第三/第四项全国性荣誉。
 *
 * 素材来源编号对应素材包「来源登记」表（S01–S09）。
 */

import type { Achievement } from "@/types";

const S02 = { id: "S02", label: "2025 年协会年度考核材料" };
const S09 = { id: "S09", label: "2024 年协会年度考核材料" };

/** 首屏。标题与说明来自素材包「首页与协会简介」。 */
export const HERO = {
  eyebrow: "ECUT · COMPUTER ASSOCIATION",
  /** 标题按原文，仅把末句作为强调色片段。 */
  title: { lead: "和同伴一起，把对计算机的兴趣", accent: "变成实践" },
  lede: "东华理工大学计算机协会，聚集计算机科学与信息技术爱好者。在这里，一起学习算法、交流技术、参与项目与比赛，也把每一次活动的经验留下来。",
  /** 素材包指定的主入口与次入口，均指向本页区块，不外链未实现页面。 */
  primaryAction: { label: "了解加入方式", href: "#join" },
  secondaryAction: { label: "浏览协会活动", href: "#activities" },
  metaLeft: "学术科技类社团",
  metaRight: "算法训练 · 项目实践 · 技术交流",
};

/** 协会简介。三段正文来自素材包「协会简介正文」。 */
export const ABOUT = {
  kicker: "关于协会",
  title: "这是我们",
  paragraphs: [
    "东华理工大学计算机协会是由校内计算机科学和信息技术爱好者组成的学术科技类社团。我们通过技术讲座、主题分享、算法培训和模拟赛，为成员提供学习、交流与合作的机会。",
    "协会组织成员参与 ICPC、CCPC、蓝桥杯等编程竞赛，也参与组织 ECPC 等校园赛事。除了竞赛训练，我们鼓励项目实践与跨专业交流，让同学们在合作中运用技术、解决问题。",
    "活动材料与复盘经验持续沉淀在协会知识库，官网会精选其中适合公开的活动记录、成果与学习资料，方便更多同学了解和参与。",
  ],
  stat: { value: "10", label: "项省级及以上竞赛成绩已核验" },
};

/**
 * 竞赛荣誉。
 *
 * 顺序按素材包口径「越靠上越新、越靠前越强」排列；同一年内多条的顺序属于
 * 按该口径的初步排列，需要内容负责人确认后再定稿。
 *
 * 注意：素材包另有「首页首屏四项全国性荣誉」的验收要求，当前只有两项达到证据
 * 粒度（CCPC 全国邀请赛南昌银牌、蓝桥杯 B 组全国二等奖）。这里列出的十条不替代
 * 那项要求，也不用来凑足四条。
 */
export const HONORS = {
  kicker: "竞赛荣誉",
  title: { lead: "我们", accent: "赢得" },
  lede: "以下为协会成员在省级及以上竞赛中的已核验成绩，逐条取自协会年度考核材料；不扩大赛事级别，不把个人成绩写作协会团体成绩。",
  items: [
    {
      id: "achievement-ccpc-2025",
      type: "achievement",
      title: "CCPC 全国邀请赛（南昌）",
      summary: "周子彤",
      tags: ["算法", "CCPC"],
      sources: [S02],
      status: "published",
      date: "2025",
      datePrecision: "year",
      contest: "CCPC 全国邀请赛（南昌）",
      award: "银牌",
      recipient: "周子彤",
    },
    {
      id: "achievement-lanqiao-15",
      type: "achievement",
      title: "蓝桥杯",
      summary: "周子彤",
      tags: ["算法", "蓝桥杯"],
      sources: [S02],
      status: "published",
      edition: "第十五届",
      datePrecision: "edition",
      contest: "蓝桥杯",
      award: "B 组全国二等奖",
      recipient: "周子彤",
    },
    {
      id: "achievement-baidu-star-2024",
      type: "achievement",
      title: "百度之星",
      summary: "王继源",
      tags: ["算法", "百度之星"],
      sources: [S09],
      status: "published",
      date: "2024",
      datePrecision: "year",
      contest: "百度之星",
      award: "银奖",
      recipient: "王继源",
    },
    {
      id: "achievement-lanqiao-2024",
      type: "achievement",
      title: "蓝桥杯",
      summary: "王继源",
      tags: ["算法", "蓝桥杯"],
      sources: [S09],
      status: "published",
      date: "2024",
      datePrecision: "year",
      contest: "蓝桥杯",
      award: "省赛一等奖",
      recipient: "王继源",
    },
    {
      id: "achievement-tianti-2024",
      type: "achievement",
      title: "中国高校计算机大赛·团队程序设计天梯赛",
      summary: "王继源",
      tags: ["算法", "天梯赛"],
      sources: [S09],
      status: "published",
      date: "2024",
      datePrecision: "year",
      contest: "中国高校计算机大赛·团队程序设计天梯赛",
      award: "国家三等奖",
      recipient: "王继源",
    },
    {
      id: "achievement-icpc-invite-2024",
      type: "achievement",
      title: "ICPC 全国邀请赛（陕西）",
      summary: "王继源",
      tags: ["算法", "ICPC"],
      sources: [S09],
      status: "published",
      date: "2024",
      datePrecision: "year",
      contest: "ICPC 全国邀请赛（陕西）",
      award: "铜奖",
      recipient: "王继源",
    },
    {
      id: "achievement-ccpc-zhengzhou-24",
      type: "achievement",
      title: "CCPC 全国邀请赛（郑州）",
      summary: "王继源",
      tags: ["算法", "CCPC"],
      sources: [S09],
      status: "published",
      date: "2024",
      datePrecision: "year",
      contest: "CCPC 全国邀请赛（郑州）",
      award: "铜奖",
      recipient: "王继源",
    },
    {
      id: "achievement-chuangke-9",
      type: "achievement",
      title: "创客中国 AIGC 专题赛",
      summary: "冯洋辉",
      tags: ["开发", "创客中国"],
      sources: [S09],
      status: "published",
      edition: "第九届",
      datePrecision: "edition",
      contest: "创客中国",
      award: "AIGC 专题赛全国第九",
      recipient: "冯洋辉",
    },
    {
      id: "achievement-lanqiao-14",
      type: "achievement",
      title: "蓝桥杯",
      summary: "黄琪钧",
      tags: ["算法", "蓝桥杯"],
      sources: [S09],
      status: "published",
      edition: "第十四届",
      datePrecision: "edition",
      contest: "蓝桥杯",
      award: "江西省二等奖",
      recipient: "黄琪钧",
    },
    {
      id: "achievement-chuanzhi-6",
      type: "achievement",
      title: "传智杯",
      summary: "周子彤",
      tags: ["算法", "传智杯"],
      sources: [S02],
      status: "published",
      edition: "第六届",
      datePrecision: "edition",
      contest: "传智杯",
      award: "省赛二等奖",
      recipient: "周子彤",
    },
  ] satisfies Achievement[],
};

/**
 * 活动回顾。
 *
 * 当前只有两条达到「活动已发生」的证据粒度。两条均为已结束的历史回顾，
 * 不显示为正在报名；页面为历史赛事资料，不提供报名或在线判题入口。
 *
 * image 为空表示该活动没有可对准的活动照片：素材包登记的照片未提供日期，
 * 不得绑定到具体活动，因此只在该活动确有一致照片时才配图。
 */
export const ACTIVITIES = {
  kicker: "校园活动",
  title: "活动回顾",
  items: [
    {
      id: "activity-ecpc-third",
      title: "第三届东华理工大学程序设计竞赛（ECPC）",
      tags: ["算法", "ECPC"],
      date: "2025-12-27",
      summary:
        "依据第三届 ECPC 参赛手册，赛事采用团队程序设计形式，通过算法问题检验编码、协作与解题能力。",
      image: {
        src: "/assets/photo-contest-group.webp",
        alt: "东华理工大学程序设计竞赛现场合影",
        width: 1024,
        height: 683,
      },
    },
    {
      id: "activity-ai-prompt-2026",
      title: "AI 提示词挑战赛：在实践中学习表达任务",
      tags: ["AI", "校园活动"],
      date: "2026-05-12",
      summary:
        "计算机协会在社团文化艺术节中开展 AI 提示词挑战赛，同学们通过文案生成、创意表达和信息整理任务，体验提示词如何影响输出结果。",
      image: null,
    },
  ],
};

/** 学习方向。文字依据素材包「加入方式与空状态」的参与路径描述。 */
export const LEARNING = {
  kicker: "学习方向",
  title: "在这里你可以",
  lede: "零基础同学可以先浏览入门文章与活动回顾，了解自己的兴趣方向；希望参加算法竞赛的同学可以了解训练与模拟赛；喜欢开发的同学可以从技术分享与项目实践开始。",
  paths: [
    { no: "01", label: "算法训练", tag: "模拟赛" },
    { no: "02", label: "竞赛参与", tag: "ICPC · CCPC" },
    { no: "03", label: "项目实践", tag: "合作开发" },
    { no: "04", label: "技术分享", tag: "讲座交流" },
  ],
};

/**
 * 收尾区块。
 *
 * 素材包 join-slogan 明确：该区块只有这两行原文，整体居中，不扩写招新状态、
 * 日期、表单、二维码或任何联系方式。因此这里不放公众号入口。
 */
export const JOIN = {
  title: "加入我们",
  slogan: "展现你奔腾不息的力量",
};

/** 页脚。 */
export const FOOTER = {
  copyright: "东华理工大学计算机协会",
  note: "计协ECUT",
};
