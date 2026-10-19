# Vue3 与 React 的更新原理对比

> 高频误解：
> - 「Vue 是双向绑定，React 是单向数据流」只说对了一半。
> - 「React 必须展开数据」不是框架偏好，而是它的更新判定机制决定的。

## 一句话结论

| 框架 | 更新机制 | 状态风格 | 变更检测 | 心智模型 |
| --- | --- | --- | --- | --- |
| Vue3 | 响应式代理 + 依赖收集，属性写入时主动触发 | 可变（mutation） | Proxy 的 `get/set` 自动追踪 | 状态是响应式对象 |
| React | 显式 `setState` + 不可变快照，重新执行组件函数 | 不可变（immutable） | 引用比较 `Object.is` / 浅比较 | 状态是渲染快照 |

两句话：

- **Vue3**：读数据时收集依赖，写数据时触发依赖，所以直接 `state.count++` 就能更新视图。
- **React**：`setState` 传入新值来标记组件需要重新渲染；因为用引用比较判断「变没变」，所以必须创建新对象/数组（即展开）。

## Vue3 响应式原理

### 核心三角：Proxy + track + trigger

```js
let activeEffect = null
const targetMap = new WeakMap() // target -> key -> Set<effect>

function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  dep.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  depsMap?.get(key)?.forEach((effect) => effect())
}

function reactive(target) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key)
      return Reflect.get(obj, key, receiver)
    },
    set(obj, key, value, receiver) {
      const result = Reflect.set(obj, key, value, receiver)
      trigger(obj, key)
      return result
    },
  })
}
```

实际流程：

1. `reactive(obj)` 返回 Proxy。
2. 组件渲染时读取属性 → `get` 陷阱 → `track` 记录「当前渲染 effect 依赖了这个 key」。
3. 代码修改属性 → `set` 陷阱 → `trigger` 找出依赖该 key 的 effect。
4. 渲染 effect 被调度执行 → 生成新 VNode → patch 到 DOM。

### effect 与调度

- 组件的渲染函数被包装成一个 `effect`（ReactiveEffect）。
- 依赖变化时不是立刻同步渲染，而是把任务放入队列，去重后通过 `nextTick`（微任务）批量刷新。
- `computed` 是惰性 effect：依赖变化只标记为脏，下次读取才重新计算并缓存。
- `ref` 用 getter/setter 包装原始值，本质也是依赖收集；对象值会委托给 `reactive`。
- `reactive` 是深层的、惰性的：访问嵌套对象时才递归代理。

### v-model 不是魔法

模板里的「双向绑定」在编译后是标准的单向数据流 + 事件：

```vue
<input v-model="msg" />
<!-- 编译结果（简化） -->
<input :value="msg" @input="msg = $event.target.value" />
```

组件上：

```vue
<MyInput v-model="msg" />
<!-- 等价于 -->
<MyInput :modelValue="msg" @update:modelValue="msg = $event" />
```

所以 Vue 的「双向」只是**语法糖**：父组件通过 props 向下传值，子组件通过事件向上通知，数据流仍然是单向的。

### 响应式的边界

```js
const state = reactive({ user: { name: 'Tom' } })

// ✅ 能追踪
state.user.name = 'Jerry'
state.list.push(item)
delete state.user.name

// ❌ 解构会丢失响应性
const { user } = state
user.name = 'Jerry'

// ❌ 整体替换变量：渲染/闭包可能还引用着旧代理
let state = reactive({ count: 0 })
state = reactive({ count: 1 })

// ❌ 直接换成普通对象，同样丢失响应性
state = { count: 1 }

// ✅ 想替换整个内容时，修改代理本身
Object.assign(state, { count: 1 })
```

修复：解构用 `toRefs`，整体替换用 `Object.assign` 或 `ref`。

## React 更新原理

### 快照与显式调度

```js
const [state, setState] = useState({ count: 0 })
```

- `state` 是本次渲染的**快照**，组件函数内部闭包捕获的是这个值。
- 直接 `state.count++` 只是修改了对象，没有通知 React，也不会触发渲染。
- 必须调用 `setState(newValue)`，React 才会创建更新、调度 render、重新执行组件函数。

```js
// ❌ 原地修改：引用没变，可能被 Object.is 判定为未变化
state.count++

// ✅ 新对象：引用变了，触发更新
setState({ ...state, count: state.count + 1 })

// ✅ 函数式更新：基于最新状态计算，避免闭包旧值
setState((prev) => ({ ...prev, count: prev.count + 1 }))

// ✅ 数组同样创建新引用
setList((prev) => [...prev, item])
```

这就是「数据展开」的根本原因：**要变更引用，而不是变更属性。**

### React 为什么依赖引用比较

1. **`useState` 的 bailout**：调用 setter 时，React 用 `Object.is` 比较新旧值；相同引用可能跳过渲染。
2. **渲染快照语义**：每次渲染的 state 应保持不变，否则「某次渲染的 UI」和「当时的 state」对不上。
3. **memo / useMemo / useCallback**：都依赖引用相等判断是否复用；原地修改不会改变引用，导致子组件错误跳过更新。
4. **选择器与状态库**：Redux/Zustand 的订阅依赖不可变更新来发现变化。
5. **并发渲染**：React 可能中断、丢弃、重放渲染；可变状态会让渲染结果不可预测（tearing 等问题）。
6. **深度比较成本高**：React 默认不做深比较，浅比较 + 不可变约定是成本最低的方案。

### 更新链路（简化）

```text
setState(newValue)
  → 创建 update 放入 hook 更新队列
  → scheduleUpdateOnFiber（按 Lane 优先级调度）
  → render 阶段：重新执行组件函数、生成新 Fiber/VNode、Diff
  → commit 阶段：同步提交 DOM 变更
```

- render 阶段可中断；commit 阶段同步不可中断。
- React 18+ 在事件、Promise、定时器中都自动批处理。
- 没有 `memo` 时，父组件重渲染通常会带着子组件一起重新执行（然后靠 Diff 决定 DOM 是否变化）。

### React 的「双向绑定」

React 不禁止双向，只是让你显式写：

```jsx
<input
  value={msg}
  onChange={(e) => setMsg(e.target.value)}
/>
```

这和 Vue 的 `v-model` 编译结果本质相同：`value` 向下，`onChange` 向上。区别只是 Vue 帮你做了语法糖，React 让你自己写。

## 为什么 React 不直接上 Proxy

技术上完全可以实现（MobX、Valtio 就是这么做的），但 React 核心选择不可变模型是有意为之：

| 原因 | 说明 |
| --- | --- |
| 可预测性 | 每次渲染是一份独立快照，状态变化必须显式发生 |
| 并发渲染 | 可中断/重放渲染，需要稳定的快照 |
| 引用比较成本低 | `Object.is` / 浅比较足够快，不需要深度遍历 |
| 调试与时间旅行 | 不可变数据便于记录历史、对比差异 |
| 生态约定 | 状态库、DevTools、memo 都建立在这一约定上 |

MobX/Valtio 用 Proxy 把「可变状态」接入 React 的调度，本质是在不可变模型外再加一层适配。它们能工作，但需要处理订阅、选择器、并发一致性等额外问题。

## 性能直觉

- **Vue**：读时追踪、写时通知。只有依赖了变化属性的组件 effect 会重跑；组件内部仍然执行 render + VNode diff，但编译器通过静态提升、Patch Flag 减少 diff 开销。
- **React**：setState 后组件函数重新执行；子组件是否跳过取决于 `memo` 与 props 引用。React Compiler 可以自动做细粒度记忆化，但不改变不可变更新模型。
- 没有绝对更快：Vue 的 Proxy 有访问开销，React 的重新渲染有函数执行与 Diff 开销；实际性能取决于应用结构。

## 高频面试问答

**1. Vue3 为什么能直接修改数据？**
`reactive` 返回 Proxy，`set` 陷阱触发依赖；渲染 effect 读过该属性，所以会被通知重新执行。

**2. React 为什么不能直接修改 state？**
state 是渲染快照；原地修改不改变引用，React 感知不到变化；同时会破坏 memo、闭包语义与并发渲染的确定性。

**3. 为什么 React 要用扩展运算符？**
为了创建新引用，让 React 的引用比较与浅比较判定为「变了」；这也是不可变更新的标准写法。

**4. Vue 的 v-model 是真正的双向绑定吗？**
不是。它是 `:value` + `@input`（组件为 `modelValue` + `update:modelValue`）的语法糖，底层仍是单向数据流。

**5. Vue3 的依赖收集粒度有多细？**
按「对象属性 → effect 集合」收集，组件级 effect；不是每个 DOM 节点一个 effect。属性变化会让依赖它的组件重渲染，再由 VDOM diff 更新 DOM。

**6. React 为什么不做深度比较？**
成本高、收益低；不可变约定让引用比较就能承担变更检测，配合 memo 达到可接受的性能。

**7. 可以在 React 中使用可变状态库吗？**
可以，MobX/Valtio 通过 Proxy 监听变化并触发 React 更新；但要理解它们与 React 快照/并发模型的边界。

## 一张对照表

| 维度 | Vue3 | React |
| --- | --- | --- |
| 更新触发 | 属性写入自动触发 | `setState` 显式调度 |
| 状态修改 | 直接改 | 创建新引用 |
| 变更检测 | Proxy 依赖追踪 | `Object.is` / memo 浅比较 |
| 依赖收集 | 运行时读取自动记录 | 组件整体重跑；`useEffect` 手动依赖 |
| 状态风格 | 可变响应式对象 | 不可变快照 |
| 表单绑定 | `v-model` 语法糖 | `value` + `onChange` |
| 性能优化 | 编译期标记 + 依赖追踪 | memo/useMemo/useCallback + Compiler |
| 优点 | 写法直观、依赖自动 | 可预测、易调试、并发友好 |
| 代价 | Proxy 开销、解构陷阱 | 样板代码、引用地狱、手动 memo |

## 易错点

- 把 `v-model` 当成 Vue 底层真的双向同步数据。
- 在 React 中直接修改 state 或嵌套对象，然后困惑为什么没更新。
- 在 React 中只浅拷贝最外层，嵌套对象仍然被共享。
- 在 Vue 中解构 `reactive` 对象或整体替换变量，导致失去响应性。
- 认为「Vue 不需要虚拟 DOM / 不需要 diff」——Vue3 仍然使用 VNode 与 patch。
- 认为「React 重渲染等于 DOM 更新」——重渲染只是执行函数与 Diff，未必修改 DOM。
