/**
 * 站点配置单一来源。
 *
 * URL 相关字段集中在此处并标注 TODO，不要在别处硬编码域名，
 * 避免将来域名确定后需要多点修改。
 *
 * 域名为当前唯一阻塞项，见 docs/LXW/seo.md「前置条件」。
 */

/** 正式名称，用于标题、结构化数据与品牌展示。 */
export const SITE_NAME = "东华理工大学计算机协会";

/** 全称，用于需要完整表述的位置。 */
export const SITE_FULL_NAME = "东华理工大学学生计算机协会";

/** 常用简称。 */
export const SITE_SHORT_NAME = "计协ECUT";

/** 站点描述，用于 meta description 与分享卡片。 */
export const SITE_DESCRIPTION =
  "东华理工大学学生计算机协会：算法训练、项目实践与技术交流。";

/** 站点语言。 */
export const SITE_LOCALE = "zh-CN";

/** 微信公众号名称；来自 2025 年年审材料。无已核验报名入口时不生成报名链接。 */
export const SITE_WECHAT_OFFICIAL_ACCOUNT = "计协ECUT";

/**
 * 站点规范地址（含协议与规范主机名）。
 *
 * TODO(域名): 主域名与 www / 非 www 规范主机尚未确定。确定后只改这一处。
 * 未确定前保持空字符串，使调用方走相对路径，不拼接出错误的绝对 URL。
 */
export const SITE_URL = "";

/**
 * 媒体资源 CDN 域名（阿里云 OSS + CDN）。
 *
 * TODO(域名): 与 SITE_URL 一同确定。参见 docs/LXW/seo.md「静态资源」。
 */
export const MEDIA_BASE_URL = "";

/** 站点地址是否已配置。域名就绪前用于跳过需要绝对 URL 的逻辑。 */
export function hasSiteUrl(): boolean {
  return SITE_URL.length > 0;
}

/**
 * 拼接媒体资源的绝对地址。
 *
 * 域名未配置时直接抛错，避免静默产出指向错误主机的 URL。
 * 域名就绪前不要调用；调用方应先检查 hasMediaBaseUrl()。
 */
export function mediaUrl(path: string): string {
  if (MEDIA_BASE_URL.length === 0) {
    throw new Error("MEDIA_BASE_URL 未配置：媒体 CDN 域名确定后再调用 mediaUrl()");
  }

  return `${MEDIA_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 媒体 CDN 域名是否已配置。 */
export function hasMediaBaseUrl(): boolean {
  return MEDIA_BASE_URL.length > 0;
}
