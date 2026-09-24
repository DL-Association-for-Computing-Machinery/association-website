/**
 * 公开内容模型。
 *
 * 依据 .scratch/computer-association-site/spec.md「内容模型」与
 * docs/content/public-content-governance.md；条目对应
 * docs/content/launch-content-pack.md 的登记表。
 */

/**
 * 日期精度。原始材料只给到届次或年份时如实记录，不伪造成具体日期。
 */
export type DatePrecision = "day" | "year" | "edition" | "unknown";

/** 公开审核状态；只有 published 进入构建。 */
export type ContentStatus = "draft" | "review" | "published";

/** 来源登记，对应素材包的 S01–S09 编号。 */
export interface ContentSource {
  /** 来源编号，如 "S01"。 */
  id: string;
  /** 来源名称。 */
  label: string;
  /** 来源链接；供维护者追溯，不作为游客必经入口。 */
  url?: string;
}

interface ContentBase {
  /** 稳定标识，对应素材包登记表中的 ID。 */
  id: string;
  title: string;
  summary: string;
  tags: string[];
  sources: ContentSource[];
  status: ContentStatus;
}

/** 活动：讲座、培训、竞赛、招新、分享会等一次性或周期性事件。 */
export interface Activity extends ContentBase {
  type: "activity";
  date: string;
  datePrecision: DatePrecision;
  /** 历史活动不得显示为正在报名。 */
  registration: "open" | "closed" | "none";
  /** 材料未给出时不补写。 */
  location?: string;
}

/**
 * 成果：竞赛获奖与项目成果。
 *
 * 材料只给到届次（如「第十五届」）时用 edition 记录并把 date 留空，不推算年份；
 * 只给年份时用 date 记年份，不用届次反推具体日期。
 */
export interface Achievement extends ContentBase {
  type: "achievement";
  /** 年份或具体日期；届次精度时留空。 */
  date?: string;
  /** 届次，如 "第十五届"。 */
  edition?: string;
  datePrecision: DatePrecision;
  /** 赛事名称；不把邀请赛写成总决赛，不把省级扩大为国家级。 */
  contest: string;
  /** 奖项，按原材料表述，不做级别升级。 */
  award: string;
  /** 获奖人；材料只记个人成绩时不写成团体成绩。 */
  recipient: string;
}

/** 知识与文章。 */
export interface Article extends ContentBase {
  type: "article";
  date: string;
  datePrecision: DatePrecision;
  body: string;
}

/** 人物：协会成员或指导教师。 */
export interface Person extends ContentBase {
  type: "person";
  role: string;
}

/** 链接：加入方式、外部渠道等。 */
export interface Link extends ContentBase {
  type: "link";
  href: string;
  /** 无已核验入口时为 true，页面只给文字指引，不生成无效按钮。 */
  unverified?: boolean;
}

/** 可公开渲染的内容联合类型。 */
export type PublicContent = Activity | Achievement | Article | Person | Link;
