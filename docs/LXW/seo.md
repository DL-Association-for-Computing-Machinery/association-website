# SEO优化

## 面向的搜索引擎?

- 百度 +bing+搜狗 国内流量
- google 海外 【x】

## 前置条件

1. 正式域名
2. HTTPS
   - http 站点会被降权！
3. 单一规范主机名（最致命）
   - Google 官方文档明确要求：如果有重复首页（HTTP/HTTPS、www/非 www），必须在所有副本上放置同一份结构化数据，而不只是 canonical 页。所以规范化要在 DNS 和服务器层一次做对
4. 备案
5. 站点验证提交
6. 统计工具

## 具体点

- metadataBase 指向正式域名
- title
- <meta>
- robots.txt
- 正文渲染
- canonical自指
- 站点验证+提交sitemap
- 备案

- 落地页三方脚本
  - Nextjs 的script组件
    - 优化外部/内联JS的加载时机、防止阻塞渲染、避免hydration冲突，替代原生<script>。App Router 和 Page Router都支持
    - 为什么不用原生<script>?
      - 会阻塞html解析与渲染
      - nextscript通过策略控制加载时机，提升LCP、改善Core Web Vitals，对SEO友好
    - 使用
      - Script src id strategy onload
        - src可以是CDN地址 也可以是本地脚本
        - id 内联脚本必须要有 防止重复渲染多次执行
        - strategy 加载策略（most important）
          - beforeInteractive 水合之前执行，脚本会放在head，阻塞渲染
          - afterInteractive(默认) 水合完成后立即执行，页面可交互之后马上跑
          - lazyOnload - 浏览器空闲时加载(raf)
          - worker(beta) web worker 中运行 DOM 不能访问，很少使用
          - 具体使用？
            - 粒子特效，次要动画等一律 lazyOnload
          - 页面操作DOM用afterInteractive
          - 注意： 尽量不要用beforeInteractive
        - onLoad 脚本加载完成回调
        - onReady(APProuter新增) 脚本加载完，每次组件挂载都会触发
        - onError 脚本加载失败回调
        - dangerouslySetInnerHTML
    - nextjs VS 原生
      -
