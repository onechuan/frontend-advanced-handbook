# 框架复习清单

| 主题 | 状态 | 笔记 | 关键问题 |
| --- | --- | --- | --- |
| React 渲染与 Fiber | ✅ | [react.md](react.md) | 双缓存、render/commit、可中断 |
| React Diff 与 key | ✅ | [react.md](react.md) | 同层比较、key 的作用 |
| Hooks 原理与规则 | ✅ | [react.md](react.md) | 为什么不能条件调用、闭包陷阱 |
| useEffect 系列 | ✅ | [react.md](react.md) | 执行时机、依赖、清理 |
| React 性能优化 | ✅ | [react.md](react.md) | memo、useMemo、useCallback、Compiler |
| Vue 响应式原理 | ✅ | [vue.md](vue.md) | Vue2 defineProperty vs Vue3 Proxy |
| Vue Diff | ✅ | [vue.md](vue.md) | 双端比较、LIS、key |
| Vue 编译优化 | ✅ | [vue.md](vue.md) | 静态提升、Patch Flag、Block Tree |
| Vue 生命周期与 Composition API | ✅ | [vue.md](vue.md) | setup、nextTick、computed/watch |
| Vue3 与 React 更新原理对比 | ✅ | [vue-vs-react-reactivity.md](vue-vs-react-reactivity.md) | 响应式 vs 不可变、为什么要展开 |
| SSR / 同构渲染 | ⬜ | — | hydration、数据预取 |

## 通用答题框架

1. **框架解决了什么问题**：声明式 UI、状态驱动、组件化。
2. **更新流程**：状态变化 → 调度 → 计算差异 → 提交 DOM。
3. **优化点**：减少不必要渲染、稳定引用、合理拆分、按需加载。
4. **边界**：虚拟 DOM 不是一定更快；关键在可维护性与批处理。

## 面试前速记

- React 更新分 **render 阶段（可中断）** 和 **commit 阶段（同步）**。
- Diff 是 O(n) 的启发式算法：类型不同直接替换、同层比较、key 标识节点。
- Hooks 按调用顺序存储在 Fiber 上，所以不能条件调用。
- `useEffect` 在浏览器绘制后执行；`useLayoutEffect` 在绘制前同步执行。
- Vue2 用 `Object.defineProperty`，Vue3 用 `Proxy`。
- Vue3 在 Diff 中用**最长递增子序列**减少移动次数。
