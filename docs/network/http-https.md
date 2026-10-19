# HTTP 与 HTTPS

## 一句话回答

HTTP 是无状态的请求-响应协议；HTTPS 在 HTTP 与 TCP 之间加入 TLS，提供加密、完整性校验与身份认证。HTTP/2 通过多路复用解决 HTTP 层队头阻塞，HTTP/3 基于 QUIC/UDP 进一步解决 TCP 层队头阻塞。

## HTTP 报文

请求报文：

```http
GET /api/users?id=1 HTTP/1.1
Host: example.com
Accept: application/json
User-Agent: Mozilla/5.0
Cookie: session=abc

```

响应报文：

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: private, max-age=60
ETag: "abc123"

{"id":1,"name":"Tom"}
```

组成：起始行 + 头部 + 空行 + 可选的 body。

## 方法与幂等性

| 方法 | 语义 | 安全 | 幂等 |
| --- | --- | --- | --- |
| GET | 获取资源 | ✅ | ✅ |
| HEAD | 获取响应头 | ✅ | ✅ |
| POST | 创建/提交 | ❌ | ❌ |
| PUT | 全量更新/创建 | ❌ | ✅ |
| PATCH | 部分更新 | ❌ | ❌（通常） |
| DELETE | 删除 | ❌ | ✅ |

GET vs POST：

- GET 参数在 URL，POST 通常在 body。
- GET 可被缓存、可收藏、可被日志记录；POST 默认不缓存。
- 语义不同：GET 获取资源，POST 提交数据，不应以「安全」为主要区别。
- 长度限制来自浏览器/服务器实现，不是协议规定。

## 常见状态码

| 状态码 | 含义 |
| --- | --- |
| 200 | 成功 |
| 201 | 已创建 |
| 204 | 成功但无内容 |
| 301 | 永久重定向（可缓存，方法可能变 GET） |
| 302 | 临时重定向（方法可能变 GET） |
| 303 | 见其他资源，客户端改用 GET |
| 304 | 协商缓存命中，资源未修改 |
| 307 | 临时重定向，保持原方法和 body |
| 308 | 永久重定向，保持原方法和 body |
| 400 | 请求参数错误 |
| 401 | 未认证（未登录/token 无效） |
| 403 | 已认证但无权限 |
| 404 | 资源不存在 |
| 405 | 方法不允许 |
| 408 | 请求超时 |
| 409 | 冲突 |
| 413 | 请求体过大 |
| 415 | 不支持的媒体类型 |
| 422 | 语义校验失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 502 | 网关收到上游无效响应 |
| 503 | 服务不可用 |
| 504 | 网关超时 |

## 常见头部

| 头部 | 作用 |
| --- | --- |
| `Host` | 目标主机（HTTP/1.1 必填） |
| `Content-Type` | 请求/响应体的媒体类型 |
| `Content-Length` | body 字节长度 |
| `Transfer-Encoding: chunked` | 分块传输，长度未知时使用 |
| `Accept` / `Accept-Encoding` | 客户端可接受的类型/压缩算法 |
| `Connection: keep-alive` | 保持连接 |
| `Cache-Control` / `ETag` / `Last-Modified` | 缓存控制 |
| `Cookie` / `Set-Cookie` | 状态保持 |
| `Authorization` | 认证信息 |
| `Referer` | 来源页面（可被策略裁剪） |
| `Origin` | 跨域请求的来源，不含路径 |
| `Access-Control-*` | CORS 控制 |

## HTTP 版本演进

### HTTP/1.0

- 默认短连接，每次请求新建 TCP 连接。
- 无 Host 头（后期补充），不支持断点续传等。

### HTTP/1.1

- 默认持久连接（keep-alive），可复用 TCP。
- 管道化（pipelining）：可连续发送多个请求，但响应必须按序返回，实际很少启用。
- 引入 Host、分块传输、更多缓存控制。
- 问题：**应用层队头阻塞**；浏览器对同域并发连接数有限制（通常 6 个），常通过域名分片缓解。

### HTTP/2

- 二进制分帧层：HEADERS、DATA、SETTINGS 等帧。
- **多路复用**：同一 TCP 连接上并行多个 stream，解决 HTTP 层队头阻塞。
- HPACK 头部压缩，减少重复头部开销。
- 流优先级、服务器推送（已被主流浏览器移除）。
- 仍受 TCP 层队头阻塞影响：一个 TCP 包丢失会阻塞该连接上的所有流。

### HTTP/3

- 基于 QUIC（UDP），TLS 1.3 集成在协议内。
- 独立流：单个流丢包不影响其他流，解决 TCP 层队头阻塞。
- 0-RTT 恢复连接、连接迁移（网络切换保持连接）。
- 需要 UDP 可用，部分网络环境可能受限。

## HTTPS 与 TLS

### 解决什么问题

1. **加密**：防止中间人窃听。
2. **完整性**：防止内容被篡改。
3. **身份认证**：通过证书确认服务器身份。

### TLS 1.3 握手（简化）

```text
ClientHello
  → 支持的版本、密码套件、随机数、SNI、ALPN、密钥交换参数

ServerHello + Certificate + Finished
  → 选定参数、服务器随机数、证书链、签名
  → 双方基于 ECDHE 计算出相同的会话密钥

Client Finished
  → 握手完成，后续使用对称密钥加密通信
```

- 非对称加密/密钥交换用于**协商会话密钥**和验证身份。
- 后续数据传输使用**对称加密**，因为性能高。
- TLS 1.3 通常 1 次往返（1-RTT），会话恢复可 0-RTT。
- TLS 1.2 完整握手通常 2-RTT。

### 证书与信任链

- 服务器证书由 CA 私钥签名，包含域名、公钥、有效期、签发者。
- 浏览器内置根 CA，逐级验证证书链。
- 证书域名不匹配、过期、链不完整都会报错。
- Let's Encrypt 等提供免费证书；企业内网可部署私有 CA。

### 常见追问

**1. 为什么数据传输用对称加密？**
对称加密速度快，适合大量数据；非对称加密计算成本高，主要用于密钥协商与签名。

**2. 中间人能伪造证书吗？**
不能通过信任链验证；除非用户手动信任了攻击者 CA。HSTS、证书固定（pinning）可以进一步增强。

**3. HSTS 是什么？**
`Strict-Transport-Security` 响应头，让浏览器在一段时间内强制使用 HTTPS，阻止降级与部分中间人攻击。

**4. TLS 1.3 为什么更快？**
握手轮次减少（1-RTT/0-RTT）、移除不安全算法、密钥交换更高效。

## 高频问题

**1. 从输入 URL 到页面展示发生了什么？**
DNS → TCP → TLS → HTTP 请求 → 响应 → 解析 HTML/CSS/JS → 渲染。完整链路见 [rendering.md](../browser/rendering.md)。

**2. HTTP/1.1 的队头阻塞是什么？**
前一个响应未完成会阻塞后续响应；HTTP/2 通过流多路复用解决，HTTP/3 进一步解决 TCP 层阻塞。

**3. HTTP/2 为什么还要 HTTP/3？**
TCP 丢包会导致所有流等待重传；QUIC 在用户态实现独立流与更快的连接建立。

**4. 304 和 200 缓存的区别？**
304 是协商缓存验证通过，无响应体；200 from cache 是强缓存命中。

**5. 长连接如何保活？**
TCP keep-alive、应用层心跳（WebSocket ping/pong）、负载均衡空闲超时配置。

## 易错点

- HTTPS 加密的是传输内容，不保证服务器业务逻辑安全。
- 301 会被浏览器缓存，调试时容易「改不回来」，需要清缓存。
- `Content-Length` 与 `Transfer-Encoding: chunked` 不能同时使用。
- HTTP/2 的多路复用建立在单个 TCP 连接上，连接数少不代表没有队头阻塞。
- 状态码 401 与 403 的区别：未认证 vs 无权限。

## 延伸

- HTTP/2 Server Push 已废弃，改用 `103 Early Hints`、preload。
- QUIC 的连接迁移与多路径。
- HTTP 语义化 API 设计（REST）。
- 代理、网关、CDN 与负载均衡。
