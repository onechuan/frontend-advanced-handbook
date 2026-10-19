# 事件循环（Event Loop）

## 一句话回答

JavaScript 是单线程的，事件循环负责在「调用栈清空」后，从任务队列中取出回调执行；同一轮中，先清空所有**微任务**，再进入下一个**宏任务**，浏览器在合适的时机插入渲染。

## 为什么需要事件循环

- JS 主线程同一时间只能执行一段代码，不能阻塞等待 I/O。
- 耗时任务（定时器、网络、DOM 事件）由宿主环境（浏览器/Node）处理，完成后把回调放入队列。
- 事件循环不断检查调用栈与队列，决定下一个执行什么，从而做到「非阻塞」。

## 核心角色

| 角色 | 说明 | 例子 |
| --- | --- | --- |
| 调用栈 Call Stack | 当前正在执行的函数 | 普通函数调用 |
| 宏任务队列 Macrotask | 每轮取**一个**执行 | `setTimeout`、`setInterval`、I/O、UI 事件、`MessageChannel` |
| 微任务队列 Microtask | 每轮**全部清空** | `Promise.then`、`queueMicrotask`、`MutationObserver` |
| Web APIs | 宿主能力，完成后把回调入队 | `setTimeout`、`fetch`、DOM 事件 |
| 渲染管线 | 布局、绘制、合成 | `requestAnimationFrame` 回调在其之前 |

> 注意：`requestAnimationFrame` 不属于宏任务，它在每帧渲染前执行，与事件循环的渲染步骤绑定。

## 一轮执行顺序

```text
1. 取出一个宏任务执行（首次执行的是整个 script）
2. 调用栈清空
3. 清空微任务队列（执行过程中新产生的微任务也会在本轮执行）
4. 浏览器判断是否需要渲染：
   requestAnimationFrame → style → layout → paint → composite
5. 进入下一轮，取下一个宏任务
```

关键点：

- 微任务队列必须**彻底清空**才会进入渲染或下一个宏任务。
- 大量微任务或死循环微任务会饿死渲染和宏任务。
- 长任务会阻塞渲染，是卡顿的根因。

## 经典输出题

### 题目一

```js
console.log('script start')

setTimeout(() => console.log('setTimeout'), 0)

Promise.resolve().then(() => console.log('promise'))

queueMicrotask(() => console.log('microtask'))

console.log('script end')
```

答案：

```text
script start
script end
promise
microtask
setTimeout
```

解析：同步代码先执行；整体 script 是第一个宏任务，结束后清空微任务（`promise`、`microtask` 按入队顺序）；最后执行下一个宏任务 `setTimeout`。

### 题目二

```js
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')
setTimeout(() => console.log('setTimeout'))
async1()
new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(() => console.log('promise2'))
console.log('script end')
```

答案：

```text
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

解析：

1. `async1()` 同步执行到 `await async2()`：打印 `async1 start`、`async2`，`await` 把后续代码注册为微任务。
2. 执行 `new Promise` 的 executor（同步）：打印 `promise1`，`.then` 注册微任务。
3. 同步代码结束：`script end`。
4. 微任务按注册顺序执行：`async1 end` → `promise2`。
5. 最后执行 `setTimeout`。

> `await` 的行为本质上和 `.then` 一样：把后面的代码放入微任务。不同引擎对 `await` 已 resolve 的 Promise 有优化，具体 tick 数可能有差异，但相对顺序稳定。

### 题目三：微任务中产生微任务

```js
Promise.resolve().then(() => {
  console.log(1)
  Promise.resolve().then(() => console.log(2))
})
setTimeout(() => console.log(3))
Promise.resolve().then(() => console.log(4))
```

答案：`1 4 2 3`。微任务队列清空过程中新产生的微任务仍在同一轮执行。

## Node.js 的事件循环

Node 中事件循环分为多个阶段，每个阶段有独立的回调队列：

```text
timers                 → setTimeout / setInterval
pending callbacks      → 上一轮延迟的 I/O 回调
idle / prepare         → 内部使用
poll                   → 等待 I/O，执行 I/O 回调
check                  → setImmediate
close callbacks        → close 事件
```

- 每个阶段之间都会先清空 `process.nextTick` 队列，再清空 Promise 微任务队列。
- `process.nextTick` 优先级高于 Promise 微任务。
- `setTimeout(fn, 0)` 与 `setImmediate` 在主模块中的先后顺序不确定（受机器性能影响）；在 I/O 回调中 `setImmediate` 通常更早。

## 与渲染的关系

```js
button.addEventListener('click', () => {
  // 宏任务：DOM 事件回调
  updateState()
  Promise.resolve().then(renderLater) // 微任务：在本次渲染前执行
})
```

- 微任务在渲染之前执行完；如果微任务里又大量修改 DOM，会合并到同一帧。
- `requestAnimationFrame` 回调在浏览器下一次重绘前执行，适合做动画。
- 需要「等 DOM 更新后再读取布局」时，可以用 `requestAnimationFrame` 或 `setTimeout`，但更好的做法是避免强制同步布局。

## 高频追问

**1. `setTimeout(fn, 0)` 是立即执行吗？**
不是。它把回调放入宏任务队列，至少要等当前任务和微任务清空；嵌套层级较深时浏览器还会把最小延迟提升到 4ms。

**2. 为什么 Promise 回调比 setTimeout 先执行？**
Promise 回调是微任务，当前宏任务结束后立即清空；setTimeout 是下一个宏任务。

**3. 微任务会阻塞渲染吗？**
会。微任务队列清空之前不会渲染。无限追加微任务会让页面完全卡死。

**4. 页面卡顿如何定位？**
看 Performance 面板中的长任务（>50ms）、主线程火焰图，结合 `PerformanceObserver` 监听 `longtask`。

## 易错点

- 微任务队列在清空过程中新增的微任务，仍然在同一轮执行。
- `async` 函数中 `await` 之前的代码是同步执行的。
- 定时器的延迟时间是最小等待时间，不是精确执行时间。
- 整体 `<script>` 本身可以理解为一个宏任务。
- 渲染不是每轮必做，浏览器会根据刷新率和是否有变化决定。

## 延伸

- Node 的 `process.nextTick` 与 Promise 微任务优先级。
- React 18 的调度器与 `MessageChannel`。
- Web Worker 拥有独立线程和独立事件循环。
