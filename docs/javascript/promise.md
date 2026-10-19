# Promise 与 async/await

## 一句话回答

Promise 是一种表示**异步操作最终结果**的对象，有 `pending / fulfilled / rejected` 三种状态；状态一旦改变就不可逆。`then` 注册的回调是**微任务**，`async/await` 是基于 Promise 的语法糖。

## 核心特性

```js
const promise = new Promise((resolve, reject) => {
  // executor 同步执行
  resolve(1)
})
```

- executor 在构造时**同步执行**。
- 状态只能从 `pending` 变为 `fulfilled` 或 `rejected`，且只能变一次。
- 结果值（value / reason）在状态确定后固定不变。
- `then` 永远返回一个新的 Promise，因此可以链式调用。

```js
Promise.resolve(1)
  .then((value) => value + 1)
  .then((value) => {
    throw new Error('boom')
  })
  .catch((error) => {
    console.log(error.message) // boom
    return 'recovered'
  })
  .then((value) => console.log(value)) // recovered
```

## then 的三种返回值

| then 回调返回 | 下一个 Promise 的行为 |
| --- | --- |
| 普通值 | 以该值 fulfilled |
| Promise / thenable | 等待它落定后采用其结果 |
| 抛出异常 | 以该异常 rejected |

```js
Promise.resolve(1)
  .then(() => Promise.resolve(2))
  .then((value) => console.log(value)) // 2

Promise.resolve(1)
  .then(() => {
    throw new Error('x')
  })
  .catch((error) => console.log(error.message)) // x
```

## 错误处理

```js
// 推荐：在链尾统一 catch
fetch('/api/user')
  .then((res) => res.json())
  .then((data) => render(data))
  .catch((error) => showError(error))
  .finally(() => hideLoading())

// async/await 使用 try/catch
async function load() {
  try {
    const response = await fetch('/api/user')
    const data = await response.json()
    render(data)
  } catch (error) {
    showError(error)
  } finally {
    hideLoading()
  }
}
```

要点：

- `.catch()` 等价于 `.then(null, onRejected)`。
- 没有 catch 的 rejection 会触发 `unhandledrejection`，可能导致进程警告或崩溃。
- `.finally()` 不改变结果，回调不接收参数；如果回调抛错或返回 rejected Promise，会覆盖原结果。

## 常用静态方法

| 方法 | 行为 | 结果 |
| --- | --- | --- |
| `Promise.resolve(value)` | 包装为 fulfilled Promise | 可直接使用 |
| `Promise.reject(reason)` | 创建 rejected Promise | 需要 catch |
| `Promise.all(iterable)` | 全部成功才成功 | 结果按输入顺序；任一失败立即失败 |
| `Promise.allSettled(iterable)` | 等待全部落定 | 每项 `{ status, value/reason }` |
| `Promise.race(iterable)` | 第一个落定者决定结果 | 成功或失败都可能 |
| `Promise.any(iterable)` | 第一个成功者决定结果 | 全部失败时抛 `AggregateError` |

手写实现与更完整的测试见 [`my-promise.ts`](../../code/packages/javascript/src/handwrite/my-promise.ts)。

## 并发控制

`Promise.all` 会一次性发起所有请求。需要限制并发数时：

```js
async function limit(tasks, concurrency = 3) {
  const results = new Array(tasks.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex++
      results[index] = await tasks[index]()
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}
```

面试常问：限制的是**同时运行的任务数**，不是总任务数；结果要保持原始顺序。

## async/await 的本质

```js
async function getValue() {
  const value = await Promise.resolve(1)
  return value + 1
}

// 大致等价于：
function getValue() {
  return Promise.resolve(1).then((value) => value + 1)
}
```

- `async` 函数总是返回 Promise。
- `await` 会暂停当前 async 函数的执行，把后续代码注册为微任务。
- `await` 一个 rejected Promise 会在该处抛出异常，可以用 `try/catch` 捕获。
- 不要在 `forEach` 中 `await`，它不会等待；用 `for...of`、`Promise.all` 或 `map` + `all`。

```js
// 错误：forEach 不等待
items.forEach(async (item) => {
  await save(item)
})
console.log('done') // 可能先输出

// 正确
for (const item of items) {
  await save(item)
}
```

## 手写 Promise 的关键点

1. 状态机：`pending → fulfilled/rejected`，只允许一次。
2. `then` 返回新 Promise，回调必须异步执行（微任务）。
3. resolve 的值如果是 thenable，需要吸收它的状态。
4. 回调抛错要传给下一个 Promise 的 reject。
5. `resolve` 自身 Promise 会形成循环，应当 reject。

常见追问：**手写 Promise 的难点在哪里？**
答：状态机与异步调度、thenable 吸收、错误传播、循环检测；`then` 链上每个节点都是新的 Promise。

## 高频输出题

```js
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))

setTimeout(() => console.log(3))

Promise.resolve().then(() => console.log(4))

// 输出：1 4 2 3
```

```js
const promise = new Promise((resolve, reject) => {
  console.log(1)
  resolve()
  console.log(2)
})
promise.then(() => console.log(3))
console.log(4)

// 输出：1 2 4 3
```

## 易错点

- executor 是同步执行的；只有 `then`/`catch`/`finally` 回调异步。
- `.then()` 不传回调也会透传值或错误。
- `Promise.all` 中某个 Promise 失败，整体立即 rejected，但其他任务仍会继续执行。
- `await` 会按顺序执行，连续多个不相关的 await 会串行等待，可用 `Promise.all` 并行。
- `Promise.race([])` 永远不会落定。
- `async` 函数中同步抛出的错误也会变成 rejected Promise。

## 延伸

- 微任务与事件循环（[event-loop.md](event-loop.md)）。
- AbortController 取消异步操作。
- AsyncIterator / 异步生成器。
- React Suspense 中 Promise 的用法。
