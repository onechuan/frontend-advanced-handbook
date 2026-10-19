# 同源策略、CORS 与跨域

## 一句话回答

同源策略是浏览器限制**不同源**页面互相读取资源的安全机制；跨域访问需要通过 CORS、代理、JSONP 等方式获得服务器许可。同源 = 协议、域名、端口三者完全相同。

## 同源判定

```text
https://example.com:443/page
https://example.com/api      ✅ 同源
http://example.com/page      ❌ 协议不同
https://api.example.com      ❌ 域名不同
https://example.com:8080     ❌ 端口不同
```

默认端口可以省略：`https://example.com` 与 `https://example.com:443` 同源。

## 同源策略限制什么

| 行为 | 是否受限制 |
| --- | --- |
| 用 `fetch`/XHR 读取响应 | ✅ 受限 |
| 提交表单、加载图片/脚本/CSS | ❌ 通常允许（但读取受限） |
| 操作 iframe 中的 DOM | ✅ 跨源受限 |
| 读取跨源页面 Cookie / localStorage | ✅ 受限 |
| 发送 Cookie（由域名决定） | 不受同源策略直接限制，受 Cookie 域与 SameSite 限制 |

注意：**请求可能已经发出并到达服务器**，只是浏览器不允许 JS 读取响应。跨域不是「请求被拦截」这么简单。

## CORS（跨域资源共享）

服务端通过响应头声明允许哪些源访问。

### 简单请求

同时满足：

- 方法为 `GET`、`HEAD`、`POST`
- 只使用安全列表请求头（Accept、Accept-Language、Content-Language、Content-Type 等）
- `Content-Type` 只能是 `text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`
- 没有自定义请求头

服务器返回：

```http
Access-Control-Allow-Origin: https://app.example.com
```

浏览器直接发送请求，检查响应头后决定是否把响应交给 JS。

### 预检请求（Preflight）

不满足简单请求条件时（如 `PUT`、`DELETE`、`application/json`、自定义头），浏览器先发送 `OPTIONS`：

```http
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, x-token
```

服务器响应：

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, X-Token
Access-Control-Max-Age: 86400
```

- `Access-Control-Max-Age` 缓存预检结果，减少 OPTIONS 请求。
- 预检失败时，实际请求不会发出。

### 携带凭证

```js
fetch('https://api.example.com/me', {
  credentials: 'include',
})
```

服务器响应：

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

要点：

- 带凭证时，`Access-Control-Allow-Origin` **不能是 `*`**，必须返回具体源。
- 还需要 Cookie 满足 `SameSite` / `Secure` 等要求。
- 响应头需要暴露给 JS 时使用 `Access-Control-Expose-Headers`。

### 常见响应头

| 响应头 | 作用 |
| --- | --- |
| `Access-Control-Allow-Origin` | 允许的源（`*` 或具体源） |
| `Access-Control-Allow-Methods` | 允许的方法 |
| `Access-Control-Allow-Headers` | 允许的请求头 |
| `Access-Control-Allow-Credentials` | 是否允许携带凭证 |
| `Access-Control-Expose-Headers` | 允许 JS 读取的响应头 |
| `Access-Control-Max-Age` | 预检缓存时间 |

## Cookie 与跨站

Cookie 的作用域由 `Domain`、`Path` 决定，不受同源策略直接约束；但浏览器通过 `SameSite` 限制跨站发送。

```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

| 属性 | 作用 |
| --- | --- |
| `HttpOnly` | JS 无法读取，降低 XSS 窃取风险 |
| `Secure` | 只在 HTTPS 发送 |
| `SameSite=Strict` | 跨站请求不发送 |
| `SameSite=Lax` | 顶级导航的 GET 请求发送（默认值） |
| `SameSite=None` | 跨站发送，必须配合 `Secure` |
| `Domain` / `Path` | 生效范围 |
| `Max-Age` / `Expires` | 有效期 |

第三方 Cookie 正被主流浏览器逐步收紧，具体行为以当前浏览器版本为准。

## 跨域解决方案

### 1. CORS（推荐）

服务端正确配置响应头，支持所有现代浏览器与多种方法。开发环境可用 Vite/Webpack 代理避免跨域。

### 2. 开发代理

```js
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

浏览器请求同源的 `/api`，开发服务器转发到目标服务，绕开浏览器同源限制。

### 3. JSONP（历史方案）

```js
const script = document.createElement('script')
script.src = 'https://api.example.com/data?callback=handleData'
document.body.appendChild(script)

function handleData(data) {
  console.log(data)
}
```

- 只支持 GET，依赖服务端返回可执行 JS。
- 有 XSS 风险，现代项目不推荐。

### 4. postMessage

用于跨窗口/iframe 通信：

```js
// 父页面
iframe.contentWindow.postMessage({ type: 'ping' }, 'https://child.example.com')

// 子页面
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://parent.example.com') return
  console.log(event.data)
})
```

必须校验 `event.origin`，不要使用 `*` 接收敏感数据。

### 5. WebSocket

WebSocket 握手不受 CORS 机制约束，但服务器应校验 `Origin`，防止跨站 WebSocket 劫持。

## CSRF 与 XSS 的区别

| 攻击 | 原理 | 防御 |
| --- | --- | --- |
| CSRF | 利用浏览器自动携带 Cookie，诱导用户向目标站发起请求 | CSRF Token、SameSite、校验 Origin/Referer、二次确认 |
| XSS | 把恶意脚本注入页面，在受害者浏览器执行 | 输出转义、CSP、避免 `innerHTML`、HttpOnly Cookie |

CORS 不能防御 CSRF：CORS 限制的是 JS 读取响应，而 CSRF 只需要请求被发送。

## 高频问题

**1. 跨域请求会到服务器吗？**
会。简单请求直接发出；预检请求先发 OPTIONS。浏览器只限制 JS 读取响应。

**2. 为什么 `application/json` 会触发预检？**
不在简单请求允许的 Content-Type 列表中，必须预检。

**3. CORS 配置了 `*` 为什么还不能带 Cookie？**
带凭证时不允许通配符，必须返回具体源并设置 `Allow-Credentials: true`。

**4. 同源策略能防止 CSRF 吗？**
不能。CSRF 利用 Cookie 自动发送，不依赖读取响应。

**5. 为什么开发环境用代理？**
浏览器认为请求同源，服务端转发不受同源策略限制，避免后端配置 CORS。

## 易错点

- 同源判断包含端口，`localhost:3000` 与 `localhost:5173` 不同源。
- 预检请求不会携带 Cookie（除非配置了凭证相关行为）。
- `Access-Control-Allow-Origin` 只允许一个值或 `*`，多源需动态回显并校验。
- 自定义响应头默认对 JS 不可见，需要 `Expose-Headers`。
- 图片、脚本等资源可以跨域加载，但无法读取其内容（Canvas 还会污染）。
- `document.domain` 已逐步废弃，不建议依赖。

## 延伸

- CSP（内容安全策略）。
- COOP / COEP / CORP 跨源隔离。
- Trusted Types。
- 浏览器对第三方 Cookie 的策略变化。
