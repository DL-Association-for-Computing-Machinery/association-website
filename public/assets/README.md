# assets

首页用到的图片与技术图标路径表。所有文件按原路径对外提供，路径即公开 URL。

## 文件

| 文件                         | 用途                                          | 引用位置                  |
| ---------------------------- | --------------------------------------------- | ------------------------- |
| `association-logo.png`       | 协会 Logo（轻量版，640×640 透明 PNG）         | favicon、粒子字标、品牌区 |
| `association-group.webp`     | 协会合照                                      | 关于协会 / 荣誉区         |
| `photo-contest-group.webp`   | 活动照片：比赛合影                            | 胶片区、移动端相册        |
| `photo-ccpc-zhengzhou.webp`  | 活动照片：CCPC 郑州站                         | 胶片区、移动端相册        |
| `photo-classroom-group.webp` | 活动照片：教室合影                            | 移动端相册                |
| `icon-set.js`                | 技术图标 SVG 路径表（生成物，**勿手工编辑**） | `dia-icon-cloud` 组件读取 |

图片按 3:2 预处理为 WebP。在 `page.tsx` 中以 `/assets/xxx.webp` 形式引用。

## icon-set.js 是生成物

文件头写明：

```text
技术图标路径表（由 .workbuddy/tools/build-icon-set.mjs 生成，请勿手工编辑）
来源：Simple Icons · https://simpleicons.org
许可：图标数据 CC0 1.0；品牌标识归各自权利人所有
```

**注意：`.workbuddy/` 已被 `.gitignore` 排除，该生成脚本不在仓库中。**
当前这份表无法按脚本重新生成 —— 需要改动时要么找回脚本，要么手工维护
（并同步更新文件头的来源说明）。

图标只用于指代协会用到的技术，不代表对方与协会有任何关联或背书。

## 与 docs/content/assets/ 的区别

两处都有资产，用途不同，不要混用：

| 位置                     | 内容                                                                | 是否对外提供                      |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| `public/assets/`（这里） | 精简后的网页实际使用文件（WebP / 轻量 PNG）                         | 是                                |
| `docs/content/assets/`   | 源件留档：`association-logo-source.png`（5000×5000）、`-source.svg` | 否，且已被 `.prettierignore` 排除 |

**不要把源件复制到本目录**——本目录全部内容都会部署上线，源件体积大且没必要公开。
网页需要其他尺寸时，由高清源件等比例导出，见 `docs/content/assets/README.md`。

## 素材红线

- 活动照片只作概括性说明，**不根据人脸推断成员身份或届次**。
- 不编造荣誉、成立年份、正在招新状态或协会活动照片。
- 图片必须提供有意义的 `alt`；同一链接已有协会名称时 Logo 可用空 `alt`
  避免重复朗读。

## 相关

- 素材登记、尺寸与 SHA-256：`docs/content/launch-content-pack.md`
- 源件说明与授权边界：`docs/content/assets/README.md`
- 图标云组件：`public/components/README.md`
