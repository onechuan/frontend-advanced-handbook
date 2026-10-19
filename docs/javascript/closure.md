# 闭包（Closure）

## 一句话回答

闭包是**函数和它定义时所处词法环境的组合**。函数在外部执行时，仍然可以访问定义作用域中的变量，因此闭包能让变量的生命周期延长到函数外部。

## 前置知识：执行上下文与作用域链

- 每次函数调用都会创建一个执行上下文，包含变量环境、词法环境和 `this`。
- 作用域在**定义时**静态确定，与调用位置无关，所以叫词法作用域。
- 函数内部访问变量时，先查自身作用域，再沿外层作用域链逐级向上查找。

```js
const globalValue = 'global'

function outer() {
  const outerValue = 'outer'

  function inner() {
    console.log(globalValue, outerValue)
  }

  return inner
}

const fn = outer() // outer 已执行结束
fn() // 依然能访问 outerValue
```

`outer` 执行完后，其执行上下文出栈，但 `inner` 仍持有对 `outerValue` 的引用，变量不会被回收 —— 这就是闭包。

## 常见应用

### 1. 私有变量与计数器

```js
function createCounter() {
  let count = 0
  return {
    increment: () => ++count,
    decrement: () => --count,
    get value() {
      return count
    },
  }
}

const counter = createCounter()
counter.increment()
counter.increment()
console.log(counter.value) // 2
console.log(counter.count) // undefined，外部无法直接访问
```

### 2. 模块模式

```js
const userStore = (() => {
  const users = new Map()
  return {
    add(user) {
      users.set(user.id, user)
    },
    get(id) {
      return users.get(id)
    },
  }
})()
```

### 3. 函数柯里化

```js
const add = (a) => (b) => (c) => a + b + c
add(1)(2)(3) // 6
```

实现见 [`curry.ts`](../../code/packages/javascript/src/handwrite/curry.ts)。

### 4. 防抖与节流

```js
function debounce(fn, wait) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}
```

`timer` 就是一个被闭包保存的私有状态。完整实现见 [`debounce.ts`](../../code/packages/javascript/src/handwrite/debounce.ts) 与 [`throttle.ts`](../../code/packages/javascript/src/handwrite/throttle.ts)。

### 5. 函数组合与缓存

```js
function memoize(fn) {
  const cache = new Map()
  return (key) => {
    if (!cache.has(key)) cache.set(key, fn(key))
    return cache.get(key)
  }
}
```

其他典型场景：事件回调、React Hooks、`setTimeout` 回调、遍历中的局部变量保存。

## 循环变量问题

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 3 3 3 —— var 只有一个全局 i，回调执行时循环已结束
```

三种修复：

```js
// 1. let：每次迭代创建新的绑定
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}

// 2. IIFE：把当前值作为参数传入
for (var i = 0; i < 3; i++) {
  ;(function (value) {
    setTimeout(() => console.log(value), 0)
  })(i)
}

// 3. 定时器参数（仅适用于 setTimeout）
for (var i = 0; i < 3; i++) {
  setTimeout((value) => console.log(value), 0, i)
}
```

## 内存与性能

闭包会阻止变量被垃圾回收，但**只有被闭包引用的变量**才会保留。

容易出问题的场景：

- 大对象被事件回调意外捕获，页面切换后仍驻留内存。
- 频繁创建闭包（如渲染函数中创建大量回调）。
- 定时器 / 事件监听没有清理，同时持有 DOM 引用。

排查与优化：

```js
// 卸载时清理监听与定时器
const timer = setInterval(handler, 1000)
clearInterval(timer)

// 不再需要的引用置空
let bigData = createBigData()
const render = () => bigData
// 使用完后
bigData = null
```

现代 V8 会做上下文优化，只保留真正被引用的变量；但不要依赖引擎细节，主动管理生命周期。

## 高频输出题

```js
function createFunctions() {
  var result = []
  for (var i = 0; i < 3; i++) {
    result.push(function () {
      return i
    })
  }
  return result
}

createFunctions().map((fn) => fn()) // [3, 3, 3]
```

```js
var a = 1
function test() {
  console.log(a) // undefined，var 提升，且函数内部声明了 a
  var a = 2
}
test()
```

## 高频追问

**1. 闭包是什么？和垃圾回收的关系？**
函数 + 词法环境的组合；被引用的环境不会回收，可能造成内存占用，但也因此能实现私有状态。

**2. 闭包一定会造成内存泄漏吗？**
不一定。只有被长期持有且不再需要的引用才是泄漏；合理使用是正常且必要的。

**3. React 的函数组件里哪里有闭包？**
每一次渲染都会创建新的函数作用域；`useEffect`、事件回调捕获的是那次渲染的 props/state，这就是「闭包陷阱 / stale closure」的来源。

**4. 闭包和立即执行函数（IIFE）的关系？**
IIFE 常用来创建独立作用域并返回值，返回的函数如果引用内部变量，就形成闭包。

## 易错点

- 闭包捕获的是**变量引用**，不是值的快照（`var` 循环的经典问题）。
- 函数作用域在定义时确定，不随调用的 `this` 或调用位置改变。
- 区分闭包造成的内存占用与真正的内存泄漏。
- 在循环中为每个元素绑定事件时，注意变量是否被共享。

## 延伸

- 执行上下文、变量环境、词法环境。
- V8 的 Context 对象与作用域优化。
- 模块模式、高阶函数、柯里化、组合函数都是闭包的应用。
