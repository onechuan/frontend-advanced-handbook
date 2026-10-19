# 浏览器缓存

## 一句话回答

HTTP 缓存分为**强缓存**和**协商缓存**：强缓存直接使用本地副本、不发请求（`Cache-Control` / `Expires`）；协商缓存需要向服务器确认资源是否变化，未变化返回 304，浏览器继续使用本地副本（`ETag` / `Last-Modified`）。

## 缓存位置

| 位置 | 说明 |
| --- | --- |
| Memory Cache | 内存缓存，页面关闭即失效，速度快 |
| Disk Cache | 磁盘缓存，容量大，跨会话可用 |
| Service Worker Cache | 开发者可控的缓存策略 |
| CDN / 代理缓存 | 边缘节点缓存，降低源站压力 |

浏览器会按优先级和请求类型选择缓存位置，开发者主要控制 HTTP 头与 Service Worker 策略。

## 强缓存

响应头：

```http
Cache-Control: max-age=31536000, immutable
# 或旧方案
Expires: Wed, 21 Oct 2026 07:28:00 GMT
```

- `max-age`：相对时间，单位秒，优先级高于 `Expires`。
- `immutable`：在有效期内即使刷新也不重新验证，适合带 hash 的静态资源。
- `s-maxage`：共享缓存（CDN）的有效期。
- `public` / `private`：是否允许共享缓存存储。

命中强缓存时，浏览器不发请求（DevTools 显示 `(disk cache)` / `(memory cache)`），状态码可能是 200。

## 协商缓存

### ETag / If-None-Match

```http
# 首次响应
ETag: "abc123"

# 再次请求
If-None-Match: "abc123"

# 未变化
HTTP/1.1 304 Not Modified
```

ETag 通常是内容哈希或版本标识，精度高；分为强 ETag `"abc"` 和弱 ETag `W/"abc"`。

### Last-Modified / If-Modified-Since

```http
Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
If-Modified-Since: Wed, 21 Oct 2026 07:28:00 GMT
```

精度到秒，且只反映修改时间，可能误判；ETag 优先。

304 响应没有响应体，只更新缓存元数据。

## Cache-Control 常用指令

| 指令 | 含义 |
| --- | --- |
| `max-age=N` | 缓存 N 秒 |
| `no-cache` | **可以缓存**，但每次使用前必须向服务器验证 |
| `no-store` | 完全不缓存（包括磁盘与内存） |
| `must-revalidate` | 过期后必须重新验证，不能使用过期副本 |
| `immutable` | 有效期内不重新验证 |
| `private` | 只允许浏览器缓存，不允许 CDN 等共享缓存 |
| `public` | 允许共享缓存 |
| `stale-while-revalidate=N` | 先返回旧副本，同时后台更新 |
| `stale-if-error=N` | 源站错误时使用旧副本 |

> `no-cache` ≠ 不缓存；`no-store` 才是彻底不缓存。

## 缓存决策流程

```text
请求资源
  │
  ├─ 有本地缓存且未过期（强缓存）──► 直接使用，不发请求
  │
  └─ 无缓存或已过期
        │
        ├─ 有 ETag / Last-Modified
        │     └─ 发送验证请求 ──► 304：使用本地副本
        │                      └─► 200：下载新资源并更新缓存
        │
        └─ 无验证信息 ──► 重新下载
```

## 前端最佳实践

```text
index.html          → Cache-Control: no-cache（每次验证）
app.[hash].js       → Cache-Control: public, max-age=31536000, immutable
api 数据            → 按业务设置，或 no-store
```

- 静态资源文件名带内容 hash，内容变化 → URL 变化 → 自动绕过旧缓存。
- HTML 不长期缓存，保证能拿到新的资源引用。
- CDN 缓存注意 `s-maxage`、`Vary`、缓存键与刷新策略。
- Service Worker 可以做离线优先、缓存优先、网络优先等策略，但要处理版本更新与缓存清理。

## 浏览器刷新行为

| 操作 | 行为 |
| --- | --- |
| 普通刷新（F5 / Cmd+R） | 对 HTML 通常重新验证，静态资源可能命中强缓存 |
| 强制刷新（Ctrl+F5 / Cmd+Shift+R） | 绕过强缓存与协商缓存，重新下载 |
| 前进/后退 | 可能使用 bfcache 或记忆缓存 |

具体行为因浏览器而异，面试中说明「强刷会绕过缓存」即可。

## 高频问题

**1. 强缓存和协商缓存的区别？**
强缓存不发请求直接使用；协商缓存发验证请求，未变化返回 304。

**2. `no-cache` 和 `no-store` 的区别？**
`no-cache` 仍可缓存，但使用前必须验证；`no-store` 完全不存储。

**3. ETag 和 Last-Modified 的优先级？**
ETag 优先，精度更高；服务器可以同时返回，客户端用 `If-None-Match` 验证。

**4. 为什么线上更新后用户还是旧页面？**
HTML 被强缓存、Service Worker 缓存未更新、CDN 未刷新、资源文件名未变等。解决：HTML no-cache + 资源 hash + SW 版本管理。

**5. 304 和 200 (from cache) 的区别？**
304 是协商缓存验证通过；`from cache` 是强缓存命中，没有真正发请求。

## 易错点

- `Expires` 是绝对时间，受客户端时间影响；优先用 `max-age`。
- 强缓存期间服务器内容更新，客户端不会知道，必须等过期或刷新缓存。
- `Cache-Control` 的优先级高于 `Expires`。
- 带 `Vary` 的响应会按请求头（如 `Accept-Encoding`）分别缓存。
- 跨域请求的缓存也受 CORS 响应头影响。

## 延伸

- Service Worker 生命周期与缓存策略。
- CDN 缓存键、回源、预热与刷新。
- `Clear-Site-Data` 头。
- bfcache（往返缓存）与 `pageshow` 事件。
