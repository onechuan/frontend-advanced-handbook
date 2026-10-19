# 网络复习清单

| 主题 | 状态 | 笔记 | 关键问题 |
| --- | --- | --- | --- |
| HTTP 报文与方法 | ✅ | [http-https.md](http-https.md) | GET/POST 区别、幂等性 |
| 状态码 | ✅ | [http-https.md](http-https.md) | 301/302/304/307/308、4xx/5xx |
| 常见请求/响应头 | ✅ | [http-https.md](http-https.md) | Content-Type、缓存、Cookie |
| HTTP/1.1 → HTTP/2 → HTTP/3 | ✅ | [http-https.md](http-https.md) | 队头阻塞、多路复用、QUIC |
| HTTPS 与 TLS | ✅ | [http-https.md](http-https.md) | 握手流程、证书、对称/非对称 |
| 同源策略与 CORS | ✅ | [cross-origin.md](cross-origin.md) | 简单请求、预检、凭证 |
| Cookie 与 Session | ✅ | [cross-origin.md](cross-origin.md) | SameSite、HttpOnly、Secure |
| CSRF / XSS | ✅ | [cross-origin.md](cross-origin.md) | 攻击原理与防御 |
| TCP / UDP | ⬜ | — | 三次握手、四次挥手、可靠传输 |
| DNS | ⬜ | — | 递归查询、缓存、HTTPDNS |
| WebSocket / SSE | ⬜ | — | 握手、心跳、断线重连 |

## 面试前速记

- HTTP/1.1：持久连接 + 管道化，仍有应用层队头阻塞。
- HTTP/2：二进制分帧、多路复用、HPACK，解决 HTTP 层队头阻塞，但 TCP 丢包仍会阻塞所有流。
- HTTP/3：基于 UDP 的 QUIC，独立流、0-RTT、连接迁移。
- HTTPS = HTTP + TLS：身份认证、加密、完整性校验。
- CORS 是浏览器行为；服务端必须正确返回 `Access-Control-Allow-*`。
- 跨域请求默认不带 Cookie；带凭证时不能使用 `Access-Control-Allow-Origin: *`。
- CSRF 利用的是「浏览器自动带 Cookie」，与 CORS 不是一回事。
