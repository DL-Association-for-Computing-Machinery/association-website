# ESLint 与 Prettier

使用 Node.js 22.13+（建议团队统一 Node.js 24 LTS）及 package.json 指定的 pnpm。首次执行 `pnpm install --frozen-lockfile`，修改依赖时提交 package.json 与 pnpm-lock.yaml。

| 命令                | 用途                                               |
| ------------------- | -------------------------------------------------- |
| `pnpm lint`         | 检查 JS、JSX、TS、TSX；warning 也导致失败          |
| `pnpm lint:fix`     | 自动修复 ESLint 可修复问题，剩余错误需处理         |
| `pnpm format`       | 格式化代码、JSON、CSS、HTML、Markdown 等支持的文件 |
| `pnpm format:check` | 只检查格式，不改文件                               |
| `pnpm check`        | 提交前统一执行 lint 与格式检查                     |

ESLint 使用 flat config 和 JS/TypeScript recommended 规则；Prettier 单独负责排版，eslint-config-prettier 关闭冲突规则。统一两空格、双引号、分号、100 列、LF；中文正文保持自然段，不强制折行。浏览器源码与 Node 配置/脚本环境分开；新增运行环境时针对目录配置，不全局允许所有变量。

当前没有应用，暂不加入依赖 TypeScript 项目配置的类型感知规则，也不安装 Next.js/React 专用规则。#3 初始化应用时接入匹配框架版本的 Next.js、React Hooks 与可访问性规则，保留这些命令与 Prettier 分工。`pnpm check` 不等同于类型检查、构建、行为测试或人工页面验收；#20 接 CI 时调用它并补齐应用检查。

参考仓库、原始草稿、依赖、构建产物和品牌源件不参与格式化；ESLint 不扫描 .scratch 文档快照。独立 Demo 放在正常源码目录时自动适用，不能以 draft_ 或忽略目录隐藏需要交付的代码。原型提交也要运行 `pnpm check`，不要求额外生产测试套件。

编辑器建议使用 ESLint 与 Prettier 扩展，并选择项目 Prettier 作为格式化器；规则在仓库内生效，不修改成员全局编辑器设置。此次未添加 Git hooks 或 CI；本地检查结果需记录在 PR，后续由 #20 接入自动门禁。
