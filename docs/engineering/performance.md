# 性能优化

## 一句话回答

性能优化要先**量化指标**，再通过加载、渲染、运行时三个维度定位瓶颈，优化后持续监控验证；不要凭感觉优化。

## 回答框架

```text
1. 指标：现在多快？（LCP / INP / CLS / TTFB / 资源体积）
2. 定位：慢在哪？（Network、Performance、Lighthouse、RUM）
3. 手段：怎么优化？（加载 / 渲染 / 运行时）
4. 验证：优化了多少？有没有引入回归？
```

## 核心指标（Web Vitals）

| 指标 | 含义 | 良好阈值 |
| --- | --- | --- |
| TTFB | 首字节时间 | ≤ 800ms |
| FCP | 首次内容绘制 | ≤ 1.8s |
| LCP | 最大内容绘制 | ≤ 2.5s |
| INP | 与页面交互到下次绘制的延迟 | ≤ 200ms |
| CLS | 累积布局偏移 | ≤ 0.1 |
| TBT | 主线程阻塞时间 | 辅助指标 |

以上按第 75 百分位衡量。INP 已于 2024 年取代 FID，成为 Core Web Vitals 之一。

### 采集方式

```js
import { onLCP, onINP, onCLS } from 'web-vitals'

onLCP((metric) => report('lcp', metric.value))
onINP((metric) => report('inp', metric.value))
onCLS((metric) => report('cls', metric.value))
```

- 实验室数据：Lighthouse、WebPageTest。
- 真实用户数据（RUM）：Web Vitals + 上报平台。
- 浏览器 API：`PerformanceObserver`、`performance.timing`、`PerformanceNavigationTiming`。

## 加载阶段优化

### 1. 减小资源体积

- Tree Shaking：删除未使用的导出（依赖 ESM）。
- 压缩：JS/CSS 使用 Terser/SWC/esbuild 压缩；传输开启 Gzip/Brotli。
- 图片：WebP/AVIF、响应式图片 `srcset`、按需加载、压缩尺寸。
- 字体：子集化、`font-display: swap`、预加载关键字体。
- 移除重复依赖与无用 polyfill。

### 2. 减少请求数量与阻塞

- 代码分割 + 路由懒加载。
- 合并关键 CSS，内联首屏关键样式。
- `async` / `defer` 加载非关键脚本。
- 使用 HTTP 缓存与 CDN。
- 资源预加载：

```html
<link rel="preconnect" href="https://cdn.example.com" />
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
<link rel="prefetch" href="/next-page.js" />
<link rel="modulepreload" href="/app.js" />
```

- `preload`：当前页面马上需要，高优先级。
- `prefetch`：未来页面可能用到，空闲时下载。
- `preconnect`：提前建立 DNS/TCP/TLS。
- 不要滥用，过多预加载会争抢带宽。

### 3. 网络与服务端

- HTTP/2 多路复用、HTTP/3。
- CDN 边缘缓存、Brotli 压缩。
- SSR / 流式渲染，缩短首屏可见时间。
- 接口聚合、BFF、并行请求、数据缓存。

### 4. 首屏专项

- 骨架屏 / 占位符，避免布局偏移。
- 关键资源优先、非关键资源延后。
- 图片懒加载（`loading="lazy"`）。
- 首屏组件优先加载，其余动态导入。

## 渲染阶段优化

| 问题 | 方案 |
| --- | --- |
| 布局抖动 | 集中读写，避免循环中强制同步布局 |
| DOM 数量过多 | 虚拟列表、分页、按需渲染 |
| 动画卡顿 | 只改 `transform` / `opacity` |
| 图层过多 | 控制 `will-change`、避免滥用合成层 |
| 离屏内容开销 | `content-visibility: auto` |
| 大量图片 | 懒加载、占位、解码优化 |

```js
// 用 requestAnimationFrame 合并更新
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)'
})
```

## 运行时优化

- 拆分长任务（>50ms），用 `setTimeout`、`scheduler.yield`、`requestIdleCallback` 让出主线程。
- 防抖/节流处理高频事件（滚动、输入、resize）。
- 大计算放 Web Worker。
- 避免内存泄漏：清理定时器、事件监听、订阅、DOM 引用。
- React：memo/useMemo/useCallback、虚拟列表、并发特性；Vue：computed 缓存、`v-once`、组件拆分。
- 避免频繁 GC：减少临时大对象创建。

手写 debounce/throttle 见 [`debounce.ts`](../../code/packages/javascript/src/handwrite/debounce.ts)、[`throttle.ts`](../../code/packages/javascript/src/handwrite/throttle.ts)。

## 性能问题排查流程

1. **复现**：明确设备、网络、操作路径。
2. **采集**：Performance 录制、Network 面板、Lighthouse。
3. **定位**：
   - 首屏慢：看 TTFB、资源瀑布图、阻塞资源、LCP 元素。
   - 交互卡：看长任务、主线程火焰图、INP 归因。
   - 布局跳动：看 CLS 偏移元素，检查图片尺寸与动态插入。
4. **优化**：一次只改一类，记录前后指标。
5. **防回归**：性能预算、CI 跑 Lighthouse、RUM 监控。

## 高频问题

**1. 首屏加载慢怎么优化？**
按「网络 → 资源 → 渲染」拆：CDN、缓存、压缩、代码分割、关键 CSS、SSR、预加载；用指标验证每一步。

**2. 页面卡顿怎么排查？**
Performance 面板看长任务和主线程调用栈；检查是否有大量 DOM 操作、强制同步布局、大计算或频繁重渲染。

**3. 什么是布局抖动？怎么避免？**
循环中交替读取布局属性与写入样式，强制多次同步布局；先集中读、再集中写，或用 rAF 批处理。

**4. 如何减少包体积？**
Tree Shaking、按需引入、代码分割、替换大依赖、移除 polyfill、压缩与 Brotli、分析 bundle（webpack-bundle-analyzer / rollup-plugin-visualizer）。

**5. 怎么衡量优化效果？**
实验室指标 + RUM；关注 LCP/INP/CLS 的 P75，而不是单次测试；同时关注业务指标（转化率、跳出率）。

## 易错点

- 只看 Lighthouse 分数，不看真实用户数据。
- 盲目预加载导致带宽竞争。
- 用 `translate3d` 强行开图层，造成内存和合成开销。
- 防抖节流滥用导致交互延迟。
- 优化后没有回归测试，指标反弹。

## 延伸

- Chrome Performance 面板的火焰图与 Bottom-Up 视图。
- `PerformanceObserver` 监听 `longtask`、`element`、`largest-contentful-paint`。
- React Profiler、Vue DevTools 性能面板。
- 性能预算（performance budget）与 CI 集成。
