# data

公开内容数据的落地位置。

首次内容接入由 #4（公开内容到构建检查的完整路径）实现：内容源从
`docs/content/launch-content-pack.md` 登记的条目映射为 `src/types/content.ts`
定义的类型，并只把 `status: "published"` 的条目暴露给页面。

在此之前本目录不放置内容，避免出现与素材包登记表不一致的副本。
