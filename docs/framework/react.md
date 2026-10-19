# React 原理与高频面试题

## 一句话回答

React 用声明式的方式描述 UI：状态变化后重新执行组件函数得到新的元素树，通过 Fiber 调度与 Diff 计算最小更新，最后提交到真实 DOM。核心是「UI = f(state)」与可中断的协调过程。

## 渲染流程

```text
状态更新（setState / dispatch）
  → 调度（Scheduler + Lane 优先级）
  → render 阶段：构建 Fiber 树、执行组件、计算差异（可中断）
  → commit 阶段：DOM 变更、生命周期、ref、effect（同步、不可中断）
  → 浏览器绘制
```

### Fiber 是什么

Fiber 是 React 16 引入的**工作单元与调和架构**：

- 每个组件/元素对应一个 Fiber 节点，保存 `type`、`stateNode`、`child`、`sibling`、`return`、`alternate` 等信息。
- `current` 树与 `workInProgress` 树形成**双缓存**，完成后再切换。
- render 阶段可以按优先级暂停、恢复、丢弃；commit 阶段一次性提交，保证 DOM 一致性。
- Lane 模型用位掩码表示优先级（如用户输入 > 过渡更新）。

> 旧版 Stack Reconciler 递归不可中断，长更新会阻塞主线程；Fiber 把递归改成可遍历的链表结构，实现时间切片。

## Diff 算法

React 的 Diff 基于两个假设，把复杂度从 O(n³) 降到 O(n)：

1. 不同类型的元素产生不同的树，直接替换。
2. 通过 `key` 标识同层子元素，只做同层比较。

规则：

- 元素类型不同：卸载整棵子树，重建。
- 元素类型相同：保留 DOM 节点，更新属性，递归子节点。
- 列表使用 `key`：key 相同且类型相同则复用，否则重新创建。
- 没有 key 时按索引匹配。

### key 为什么不能用 index

```jsx
function List({ items }) {
  return items.map((item, index) => <Row key={index} item={item} />)
}
```

在头部插入一项后，所有 index 都后移，React 会复用错误的 DOM 与组件状态，导致输入框内容错位、动画异常、性能下降。应使用稳定且唯一的业务 id。

## Hooks 原理

- Hooks 状态保存在 Fiber 的 `memoizedState` 单向链表中，按**调用顺序**匹配。
- 每次渲染按顺序读取/创建 hook，所以不能在条件、循环、嵌套函数中调用。
- 为什么需要顺序？React 不通过名字区分 hook，只能靠调用顺序定位每个 hook 的状态。

```js
function Counter() {
  const [count, setCount] = useState(0) // hook 1
  useEffect(() => {}, [count])          // hook 2
}
```

### 闭包陷阱（stale closure）

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1) // 永远捕获首次渲染的 count = 0
    }, 1000)
    return () => clearInterval(timer)
  }, []) // 空依赖

  return <div>{count}</div>
}
```

修复方式：使用函数式更新 `setCount((c) => c + 1)`，或把 `count` 放进依赖数组，或使用 ref 保存最新值。

## useState 与批处理

- React 18 起，事件回调、Promise、setTimeout 中的更新都会自动批处理。
- 同一个事件中的多次 setState 合并为一次渲染。

```js
setCount(count + 1)
setCount(count + 1) // 两次都基于旧值，最终只 +1

setCount((c) => c + 1)
setCount((c) => c + 1) // 函数式更新，最终 +2
```

## useEffect 家族

| Hook | 执行时机 | 使用场景 |
| --- | --- | --- |
| `useEffect` | 浏览器绘制后异步执行 | 数据请求、订阅、DOM 操作 |
| `useLayoutEffect` | DOM 更新后、绘制前同步执行 | 测量布局、同步调整样式，避免闪烁 |
| `useInsertionEffect` | DOM 变更前，供 CSS-in-JS 插入样式 | 库作者使用 |

依赖与清理：

```jsx
useEffect(() => {
  const controller = new AbortController()
  fetch('/api', { signal: controller.signal })

  return () => controller.abort()
}, [userId])
```

- 依赖数组缺项会导致捕获旧值；依赖项过多会导致频繁执行。
- 清理函数在下一次 effect 执行前、组件卸载时执行。
- 开发环境 StrictMode 会故意执行两次 effect，用于暴露副作用问题。

## 性能优化

| 手段 | 作用 |
| --- | --- |
| `React.memo` | 浅比较 props，跳过渲染（仅当 props 稳定时有效） |
| `useMemo` | 缓存计算结果 |
| `useCallback` | 缓存函数引用，配合 memo 子组件 |
| 状态下沉 / 组件拆分 | 缩小更新范围 |
| 列表 key | 正确复用节点 |
| 虚拟列表 | 减少 DOM 数量 |
| 懒加载 / Suspense | 减少首屏代码 |
| React Compiler | 自动进行细粒度 memo，减少手写优化 |

不要盲目使用 memo：比较成本、引用不稳定都会让优化失效；先用 DevTools Profiler 定位瓶颈。

## Context 与状态管理

- Context 的 `value` 引用变化时，所有消费者都会重新渲染。
- 优化：拆分为多个 Context、用 `useMemo` 稳定 value、让消费者尽量靠近使用处。
- Context 不是状态管理器，复杂应用可结合 Redux/Zustand/Jotai 等。

## 事件系统

- React 使用合成事件（SyntheticEvent），抹平浏览器差异。
- React 17 起事件委托挂载到根容器而非 `document`，便于多版本共存与微前端。
- 事件回调中的 state 仍是当次渲染的快照。

## 受控与非受控组件

```jsx
// 受控：value + onChange，状态由 React 管理
<input value={value} onChange={(e) => setValue(e.target.value)} />

// 非受控：通过 ref 读取
const inputRef = useRef(null)
<input ref={inputRef} defaultValue="hello" />
```

## SSR 与 React 19

- SSR 先返回 HTML，客户端通过 hydration 复用 DOM。
- RSC（React Server Components）在服务端渲染组件，减少客户端 JS。
- React 19 引入 Actions、`use`、`useOptimistic`、`useActionState`、ref 作为普通 prop、文档元数据等改进；React Compiler 可自动优化 memoization。
- Suspense 支持数据获取与流式渲染。

## 高频问题

**1. 虚拟 DOM 一定比真实 DOM 快吗？**
不一定。它的价值是声明式编程与跨平台抽象；同量级更新时直接操作 DOM 可能更快。React 通过批处理、Diff 与调度减少无效操作。

**2. React 为什么需要 key？**
帮助 Diff 在列表重排时识别节点身份，避免错误复用和状态错位。

**3. Hooks 为什么不能写在条件里？**
Hook 状态按调用顺序存入链表，条件调用会导致顺序错乱，后续 hook 读到错误状态。

**4. setState 是同步还是异步？**
在 React 事件与批处理上下文中是异步合并的；不要依赖调用后立刻读取到新值，需要基于旧值计算时用函数式更新。

**5. useEffect 与 useLayoutEffect 的区别？**
前者绘制后异步执行，不阻塞渲染；后者绘制前同步执行，适合测量布局。

**6. 如何避免不必要的重渲染？**
稳定 props 引用、拆分组件、memo/useMemo/useCallback、状态下沉、使用选择器订阅。

## 易错点

- 直接修改 state 对象/数组不会触发更新，必须返回新引用。
- `useMemo` 不是语义保证，React 可能丢弃缓存（不要依赖它做副作用）。
- `useEffect` 不能直接写成 async 函数，需在内部定义 async 函数并调用。
- Context value 每次渲染新建对象会导致所有消费者更新。
- 事件回调捕获的是渲染时的 props/state，不是实时值。

## 延伸

- Concurrent Rendering、Transition、`useDeferredValue`。
- Server Components 与流式 SSR。
- React Compiler 的自动记忆化。
- React DevTools Profiler 与 Performance 面板。
