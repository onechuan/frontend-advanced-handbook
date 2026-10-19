# 工程化复习清单

| 主题 | 状态 | 笔记 | 关键问题 |
| --- | --- | --- | --- |
| 性能指标 | ✅ | [performance.md](performance.md) | LCP、INP、CLS、TTFB |
| 加载性能优化 | ✅ | [performance.md](performance.md) | 代码分割、预加载、压缩、图片 |
| 渲染性能优化 | ✅ | [performance.md](performance.md) | 重排重绘、虚拟列表、长任务 |
| 性能监控 | ✅ | [performance.md](performance.md) | RUM、PerformanceObserver、Lighthouse |
| Webpack 核心概念 | ✅ | [build-tools.md](build-tools.md) | loader、plugin、HMR、Tree Shaking |
| Vite 原理 | ✅ | [build-tools.md](build-tools.md) | 原生 ESM、依赖预构建、生产构建 |
| 构建工具对比 | ✅ | [build-tools.md](build-tools.md) | Webpack vs Vite |
| 模块化 | ⬜ | [build-tools.md](build-tools.md) | ESM / CommonJS、循环依赖 |
| Monorepo | ⬜ | [build-tools.md](build-tools.md) | pnpm workspace、catalog、workspace 协议 |
| 代码规范与质量 | ⬜ | — | ESLint、Prettier、Husky、CI |
| 测试 | ⬜ | — | 单元、集成、E2E、覆盖率 |

## 面试前速记

- **LCP** ≤ 2.5s、**INP** ≤ 200ms、**CLS** ≤ 0.1 是「良好」阈值（第 75 百分位）。
- 加载优化：减小体积（Tree Shaking、压缩）、减少请求（合并/缓存）、提前加载（preload、CDN）、按需加载（懒加载、代码分割）。
- 渲染优化：避免布局抖动、减少 DOM 数量、用 `transform`/`opacity` 做动画。
- 运行时优化：拆分长任务、防抖节流、虚拟列表、Web Worker。
- Webpack 的 loader 处理文件转换，plugin 介入构建生命周期。
- Vite 开发时不打包，利用浏览器原生 ESM；生产环境使用 Rollup。
- Tree Shaking 依赖 ES Module 静态结构与 `sideEffects` 标记。
