# 浏览器复习清单

| 主题 | 状态 | 笔记 | 关键问题 |
| --- | --- | --- | --- |
| 浏览器进程与线程 | ✅ | [rendering.md](rendering.md) | 多进程架构、渲染进程、主线程 |
| 从 URL 到页面 | ✅ | [rendering.md](rendering.md) | DNS、TCP/TLS、解析、渲染 |
| 关键渲染路径 | ✅ | [rendering.md](rendering.md) | DOM/CSSOM、渲染树、布局、绘制、合成 |
| 重排与重绘 | ✅ | [rendering.md](rendering.md) | 触发条件、优化手段、布局抖动 |
| DOMContentLoaded / load | ✅ | [rendering.md](rendering.md) | async/defer 差异 |
| HTTP 缓存 | ✅ | [cache.md](cache.md) | 强缓存、协商缓存、刷新行为 |
| 本地存储 | ⬜ | [cache.md](cache.md) | Cookie、localStorage、IndexedDB |
| 跨标签页通信 | ⬜ | — | BroadcastChannel、storage 事件 |
| 浏览器安全 | ⬜ | [../network/cross-origin.md](../network/cross-origin.md) | XSS、CSRF、CSP、SameSite |
| 性能指标 | ✅ | [../engineering/performance.md](../engineering/performance.md) | LCP、INP、CLS |

## 面试前速记

- 渲染进程是**多线程**的：主线程负责 JS、样式、布局；合成线程、光栅线程负责绘制与合成。
- CSS 不会阻塞 DOM 解析，但会阻塞渲染；JS 会阻塞 DOM 解析。
- `defer`：下载不阻塞、按顺序、DOMContentLoaded 前执行；`async`：下载完立即执行、顺序不定。
- 重排（layout）代价大于重绘（paint），合成（composite）最便宜。
- 动画优先使用 `transform` / `opacity`，避免触发布局。
- 强缓存看 `Cache-Control` / `Expires`，协商缓存看 `ETag` / `Last-Modified`，命中返回 304。
