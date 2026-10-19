# Vue 原理与高频面试题

## 一句话回答

Vue 通过响应式系统追踪依赖，数据变化时触发组件重新渲染；渲染函数生成虚拟 DOM，patch 算法对比新旧树并最小化 DOM 操作。Vue3 使用 Proxy 实现响应式，并在编译期做静态提升等优化。

## 响应式原理

### Vue 2

```js
Object.defineProperty(obj, key, {
  get() {
    // 收集依赖
    return value
  },
  set(newValue) {
    // 触发更新
    value = newValue
  },
})
```

局限：

- 无法检测属性的新增/删除（需要 `Vue.set` / `Vue.delete`）。
- 无法检测数组索引赋值和 `length` 修改（重写了数组方法）。
- 初始化时递归遍历所有属性，性能开销大。

### Vue 3

```js
const state = new Proxy(target, {
  get(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  },
})
```

优势：

- 支持新增/删除属性、数组索引、Map/Set。
- 惰性代理：访问到嵌套对象时才递归。
- 依赖追踪精度更高，配合 `effect` 实现。

### ref 与 reactive

| API | 适用 | 访问方式 |
| --- | --- | --- |
| `reactive(obj)` | 对象/数组 | 直接访问属性 |
| `ref(value)` | 任意值，尤其是原始值 | `.value` |
| `shallowRef` / `shallowReactive` | 只需要浅层响应 | 避免深层代理开销 |

`ref` 内部包裹一个 `{ value }` 对象，通过 getter/setter 追踪；对象值会委托给 `reactive`。

### computed 与 watch

- `computed` 是惰性的：依赖变化时标记为脏，下次读取才重新计算，并缓存结果。
- `watch` 用于执行副作用，可以配置 `deep`、`immediate`、`flush`。
- `watchEffect` 自动收集依赖，立即执行一次。

```js
const double = computed(() => count.value * 2)

watch(count, (value, oldValue) => {
  console.log(value, oldValue)
})
```

## 渲染与 Diff

### 模板编译

```text
template → AST → transform → 生成 render 函数
```

Vue3 编译期优化：

| 优化 | 作用 |
| --- | --- |
| 静态提升（hoistStatic） | 静态节点只创建一次，复用到每次渲染 |
| Patch Flag | 标记动态属性类型，Diff 时只比较必要部分 |
| Block Tree | 把动态节点收集到 block，减少遍历 |
| 缓存事件处理函数 | 避免每次渲染创建新函数 |
| 预字符串化 | 大量静态内容序列化为字符串 |

### Vue2 双端 Diff

对列表首尾各两个指针，比较：

```text
oldStart / oldEnd / newStart / newEnd
```

命中相同节点就复用并移动指针，否则在旧列表中查找 key，最后处理新增/删除。相比从头到尾遍历，减少移动次数。

### Vue3 Diff

1. 先同步头部相同节点。
2. 再同步尾部相同节点。
3. 中间乱序部分建立 key → index 映射。
4. 使用**最长递增子序列（LIS）**找出不需要移动的节点，只移动其余节点。
5. 处理新增与删除。

LIS 的作用：在保持相对顺序的前提下，找到最长的不需要移动的序列，最小化 DOM 移动次数。

### key 的作用

- 帮助 Diff 识别节点身份，正确复用组件状态。
- 列表重排时避免错误复用。
- 不要使用 index 作为动态列表的 key。

## 生命周期

| Vue 2 | Vue 3（Options / Composition） | 说明 |
| --- | --- | --- |
| `beforeCreate` / `created` | `setup` 中直接执行 | 实例初始化、数据观测 |
| `beforeMount` / `mounted` | `onBeforeMount` / `onMounted` | 挂载前后 |
| `beforeUpdate` / `updated` | `onBeforeUpdate` / `onUpdated` | 更新前后（注意避免无限循环） |
| `beforeDestroy` / `destroyed` | `onBeforeUnmount` / `onUnmounted` | 卸载前后 |
| `activated` / `deactivated` | `onActivated` / `onDeactivated` | keep-alive 缓存 |

父子组件挂载顺序：父 beforeCreate → 子创建 → 子 mounted → 父 mounted。更新顺序类似。

## nextTick

Vue 的 DOM 更新是异步批处理的：数据变化后不会立即更新 DOM，而是把更新任务放入微任务队列。`nextTick` 在 DOM 更新完成后执行回调。

```js
const count = ref(0)
count.value++
await nextTick()
// 此时 DOM 已更新
```

本质：基于 Promise 的微任务调度。

## v-model

```vue
<input v-model="text" />
<!-- 等价于 -->
<input :value="text" @input="text = $event.target.value" />
```

组件上：

```vue
<MyInput v-model="text" />
<!-- Vue3 等价于 -->
<MyInput :modelValue="text" @update:modelValue="text = $event" />
```

支持多个 v-model：`v-model:title`、`v-model:content`。

## keep-alive

- 缓存组件实例，切换时保留状态，避免重复创建。
- 通过 `include` / `exclude` 控制缓存范围，`max` 限制数量（超出时按 LRU 淘汰）。
- 缓存组件会触发 `activated` / `deactivated`。
- 典型场景：标签页、路由页面缓存。

## Composition API

```js
import { onMounted, ref } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  onMounted(() => console.log('mounted'))
  return { count, increment }
}
```

优点：

- 逻辑按功能组织，便于复用（composable）。
- 更好的类型推导。
- 避免 `this` 和 mixin 命名冲突。

## 高频问题

**1. Vue2 和 Vue3 响应式的区别？**
Vue2 递归 `defineProperty`，无法检测新增/删除；Vue3 用 `Proxy`，支持更多操作且惰性代理，性能更好。

**2. computed 和 watch 的区别？**
computed 有缓存、返回派生值、适合模板计算；watch 执行副作用、可以异步、适合数据变化后的逻辑。

**3. Vue3 Diff 为什么用最长递增子序列？**
在乱序列表中找出相对顺序不变的节点，只移动必要节点，减少 DOM 操作。

**4. 为什么数据更新后 DOM 不立即变化？**
Vue 把更新批处理到微任务队列，`nextTick` 后 DOM 才更新。

**5. 组件通信方式有哪些？**
props/emit、v-model、provide/inject、attrs、$parent/$children（少用）、事件总线（Vue3 推荐 mitt）、Pinia/Vuex。

**6. Vue 与 React 的差异？**
Vue 更强调模板与编译期优化、响应式自动依赖追踪；React 更强调函数式、显式不可变更新与调度机制。二者都使用虚拟 DOM，但更新策略不同。

## 易错点

- 直接给 `reactive` 对象整体赋值会丢失响应性；应该修改属性或用 `ref`。
- 解构 `reactive` 对象会丢失响应性，需用 `toRefs`。
- `watch` 监听对象引用时默认浅层，需要 `deep: true` 才能监听嵌套变化。
- `computed` 里不要做副作用。
- 列表 key 不稳定会导致状态错乱。
- `v-if` 与 `v-for` 同用时优先级与版本有关，避免混用。

## 延伸

- Pinia 状态管理。
- Vue Router 的导航守卫与懒加载。
- SSR / Nuxt 的 hydration。
- Vapor 模式（编译期直接生成 DOM 操作，以官方文档为准）。
