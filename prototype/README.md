# 首页 Demo（GitHub #30）

本目录是 `Jasper-Liao2026` 的首页原型，现作为协会官网主站的视觉与交互基线保留在 `main`。它不是正式生产应用，正式外壳与内页将从此基线重新实现。

## 预览

环境：现代桌面版 Chrome / Edge，允许 JavaScript、Canvas 2D 与 WebGL。

```text
双击 prototype/index.html
```

页面使用经典脚本和相对路径，可直接通过 `file://` 运行，不需要安装依赖或启动服务器。提交分支为 `prototype/30-Jasper-Liao2026`；评审固定 SHA 记录在 Issue #30 的提交评论中。

验收截图：

- [桌面首屏（1440px）](screenshots/desktop-1440-hero.png)
- [桌面全页（1440px）](screenshots/desktop-1440-full.png)
- [手机首屏（390px）](screenshots/mobile-390-hero.png)
- [手机全页（390px）](screenshots/mobile-390-full.png)

## 目录

```text
prototype/
├── index.html                 # 页面结构
├── styles.css                 # 响应式样式与主题
├── main.js                    # 主题、开屏与延迟加载
├── assets/                    # 已审核的 Logo、活动照片和图标数据
├── components/                # 原生 Web Components
│   └── threeui-source/        # ThreeUI 登记源码与可运行适配文件
└── screenshots/               # 390px / 1440px 验收截图
```

`.scratch/` 的浏览器 Profile、调试截图以及 `.workbuddy/` 的生成工具是本地工作产物，不属于交付。

## 设计说明

原型以“多元、包容、共同成长”为视觉线索：彩色流光贯穿黑白主题，点阵背景把首屏、活动、学习方向与竞赛荣誉连成连续叙事；ECUT 字标与代码化界面强调计算机社团身份。活动照片采用可交互透视胶片，技术方向通过可旋转图标云和速度文字展示，荣誉区只呈现公开内容包中两项已核验成绩。开屏、地球和粒子效果均提供延迟加载或移动端静态降级，优先保证浏览流畅度。

## 素材与来源

- Logo、协会合照：协会知识库公开素材包，登记见 `docs/content/launch-content-pack.md`。
- 三张活动照片：用户直接提供，已转为 WebP 并移除 EXIF/GPS；来源、尺寸与 SHA-256 见同一内容包。
- 技术图标路径：Simple Icons 数据的本地生成副本。
- `TextPathStudies / globe-study`：ThreeUI 登记源 `https://threeui.com/source-code/globe-study.json`，登记修订 `SHA-256 2e21ae3b77c3 + e5d01ff0fc47`。
- `CharacterCarousel / character-filmstrip`：ThreeUI 登记源 `https://threeui.com/source-code/character-filmstrip.json`，登记修订 `SHA-256 4c98939e0e2b`；适配文件只替换内容图片与外层视觉，不嵌入文档页。

## 验收自检

- 390px 与 1440px：内容可浏览，390px 无横向页面溢出；窄屏导航可横向滚动。
- 键盘：提供“跳到主要内容”，交互项有 `:focus-visible`，相册卡片与关闭按钮可聚焦。
- 主要链接：顶部五个锚点均对应本页区块；“更多资源”和 Bento 卡片是原型内页锚点，不伪造外部入口。
- 减少动画：`prefers-reduced-motion: reduce` 下开屏、文字、列表、点阵、图标云与胶片动画停止或直接显示最终状态。
- 性能：手机端不创建 ThreeUI iframe，地球改为静态占位；桌面重组件在开屏完成后、进入附近视口时加载。

## 已知不足

- 这是首页视觉 Demo，学习资源、活动与加入指引尚未连接正式内页、报名表或后台。
- ThreeUI Canvas/WebGL 在低性能桌面设备仍可能降低帧率；不支持相关能力时只保留静态退化画面。
- 活动照片只有内容包允许的概括性说明，不根据人脸推断成员身份或届次。
- 完整性由 Issue #30 指定核验人确认；PR #39 已合并，Issue #30 已按项目决策关闭。
