# 浏览器渲染流程

## 一句话回答

浏览器从网络拿到 HTML 后，解析出 DOM 与 CSSOM，组合成渲染树，经过布局（layout）计算几何信息、绘制（paint）生成绘制指令、合成（composite）后显示到屏幕；中途 JS 可能阻塞解析，样式与布局可能被反复计算。

## 浏览器架构

现代浏览器采用多进程架构：

| 进程 | 职责 |
| --- | --- |
| 浏览器主进程 | 地址栏、标签页管理、进程调度 |
| 渲染进程 | 每个站点实例一个，负责 HTML/CSS/JS 与页面渲染 |
| GPU 进程 | 合成、光栅化、图形加速 |
| 网络进程 | 请求、缓存、连接管理 |
| 插件/工具进程 | 扩展、GPU 沙箱等 |

渲染进程内部又是多线程的：

- **主线程**：解析、样式、布局、绘制指令、执行 JS。
- **合成线程**：把图层合成到屏幕，处理滚动。
- **光栅线程**：把绘制指令转成位图。
- **Worker 线程**：Web Worker、Service Worker。

> JS 运行在主线程，所以长任务会阻塞样式计算、布局和绘制，造成卡顿。

## 从输入 URL 到页面展示

1. **URL 解析**：判断协议、域名、端口、路径。
2. **缓存检查**：浏览器缓存、Service Worker、CDN。
3. **DNS 解析**：域名 → IP。
4. **建立连接**：TCP 三次握手；HTTPS 再进行 TLS 握手。
5. **发送 HTTP 请求**，接收响应（HTML、CSS、JS、图片等）。
6. **解析 HTML**，构建 DOM。
7. **解析 CSS**，构建 CSSOM。
8. **执行 JS**（可能阻塞解析或修改 DOM）。
9. **构建渲染树**：DOM + CSSOM，过滤不可见节点。
10. **布局（layout/reflow）**：计算每个节点位置与大小。
11. **绘制（paint）**：生成绘制指令，填充像素。
12. **分层与合成（composite）**：合成线程把图层合成到屏幕。

## 关键渲染路径

```text
HTML ──► DOM
CSS  ──► CSSOM
          │
          ▼
     Render Tree（只包含可见节点）
          │
          ▼
        Layout（几何信息）
          │
          ▼
        Paint（绘制指令 / 图层）
          │
          ▼
       Composite（合成上屏）
```

- `display: none` 的节点不在渲染树中；`visibility: hidden` 的节点仍占位。
- 渲染树不包含 `<head>`、`script` 等不可渲染节点。
- 分层不是越多越好，过多图层会增加合成与内存开销。

## 阻塞规则

| 资源 | 是否阻塞 HTML 解析 | 是否阻塞渲染 |
| --- | --- | --- |
| CSS | ❌ | ✅（CSSOM 未完成前不渲染） |
| 同步 `<script>` | ✅ | ✅ |
| `<script defer>` | ❌ | 执行后、DOMContentLoaded 前 |
| `<script async>` | ❌ | 下载完立即执行，可能阻塞渲染 |
| 图片 | ❌ | ❌（但影响 load 事件） |

```html
<!-- 按顺序执行，且在 DOM 解析完成后 -->
<script defer src="a.js"></script>
<script defer src="b.js"></script>

<!-- 下载完立即执行，顺序不确定 -->
<script async src="analytics.js"></script>
```

CSS 会阻塞 JS 执行（因为 JS 可能读取样式），因此同步脚本前的 CSS 也会间接延迟脚本。

## 重排（Reflow）与重绘（Repaint）

| 操作 | 触发 |
| --- | --- |
| 重排 | 修改宽高、位置、字体、增删 DOM、读取布局属性后写入样式 |
| 重绘 | 修改颜色、背景、阴影等不影响布局的属性 |
| 合成 | 修改 `transform`、`opacity`（在独立图层上） |

会强制浏览器立即计算布局的属性（容易造成布局抖动）：

```js
// 读-写-读-写，强制多次同步布局
for (let i = 0; i < items.length; i++) {
  items[i].style.height = box.offsetHeight + 'px'
}

// 优化：先集中读，再集中写
const heights = items.map((item) => item.offsetHeight)
items.forEach((item, index) => {
  item.style.height = heights[index] + 'px'
})
```

## 优化手段

- 动画使用 `transform` / `opacity`，避免动画宽高、top、left。
- 批量修改 DOM：先脱离文档（`display: none` 或 DocumentFragment），修改后插入。
- 使用 `requestAnimationFrame` 合并读写。
- 长列表使用虚拟滚动。
- 用 `content-visibility: auto` 跳过屏幕外内容的渲染。
- 避免频繁读取 `offsetTop`、`scrollTop`、`getBoundingClientRect`。
- 合理使用 `will-change`，但不要滥用（会占用内存、增加图层）。

## DOMContentLoaded 与 load

| 事件 | 触发时机 |
| --- | --- |
| `DOMContentLoaded` | HTML 解析完成，defer 脚本执行完毕，不等待图片/样式等资源 |
| `load` | 页面所有资源（图片、样式、iframe）加载完成 |
| `beforeunload` | 页面即将卸载，可用于提示未保存内容 |
| `unload` | 页面卸载时触发（尽量少用） |
| `pageshow` / `pagehide` | 页面显示/隐藏，包含 bfcache 场景 |

## 高频问题

**1. 为什么 JS 会阻塞页面渲染？**
JS 可能修改 DOM/CSSOM，浏览器必须暂停解析等待脚本执行，保证 DOM 一致性。

**2. CSS 加载会阻塞什么？**
不阻塞 DOM 解析，但阻塞渲染和后续 JS 执行（因为 JS 可能读取样式）。

**3. 重排和重绘的区别？**
重排重新计算几何位置，代价大；重绘只重新绘制像素，代价较小；合成不触发布局与绘制。

**4. 如何减少首屏白屏时间？**
内联关键 CSS、减少阻塞资源、SSR/流式渲染、预加载关键资源、拆分非关键 JS。

**5. 什么是布局抖动（layout thrashing）？**
在循环中交替读写布局属性，强制浏览器多次同步布局，导致性能急剧下降。

## 易错点

- `display: none` 会触发布局，但被隐藏的节点不参与渲染树。
- `visibility: hidden` 保留占位，只触发重绘。
- `transform` 会创建新的包含块和层叠上下文。
- 读取布局属性不一定是同步的，但读之前如果样式被修改，会强制同步布局。
- `requestAnimationFrame` 回调执行在渲染前，但不是宏任务。

## 延伸

- Chrome DevTools Performance 面板的帧分析。
- 合成层与 `will-change`、`contain`。
- bfcache 与页面生命周期。
- Web Vitals 指标（[performance.md](../engineering/performance.md)）。
