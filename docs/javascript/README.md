# JavaScript 复习清单

> 代码：[`code/packages/javascript`](../../code/packages/javascript)
> 建议顺序：闭包 → this → 原型 → 事件循环 → Promise → 手写题。

## 核心机制

| 主题 | 状态 | 笔记 | 关键问题 |
| --- | --- | --- | --- |
| 执行上下文与作用域 | ⬜ | [closure.md](closure.md) | 变量提升、暂时性死区、作用域链 |
| 闭包 | ✅ | [closure.md](closure.md) | 定义、应用、内存问题、循环变量 |
| this 绑定 | ✅ | [this.md](this.md) | 五条规则、优先级、绑定丢失 |
| 原型与原型链 | ✅ | [prototype.md](prototype.md) | prototype/`__proto__`/constructor、继承 |
| 事件循环 | ✅ | [event-loop.md](event-loop.md) | 宏任务/微任务、渲染时机、Node 差异 |
| Promise 与 async/await | ✅ | [promise.md](promise.md) | 状态机、链式调用、错误处理、并发控制 |
| ES6+ 新特性 | ⬜ | — | 解构、展开、可选链、Symbol、Proxy/Reflect |
| 模块化 | ⬜ | — | ESM 与 CommonJS 差异、循环依赖、Tree Shaking |
| 深浅拷贝 | ✅ | [prototype.md](prototype.md) | 循环引用、特殊对象、结构化克隆 |
| 类型转换与相等 | ⬜ | — | `==` 规则、ToPrimitive、`Object.is` |

## 手写题

代码均在 `code/packages/javascript/src/handwrite/`，每个实现都有对应测试。

| 题目 | 状态 | 代码 | 考点 |
| --- | --- | --- | --- |
| 防抖 debounce | ✅ | [debounce.ts](../../code/packages/javascript/src/handwrite/debounce.ts) | 闭包、定时器、leading/trailing |
| 节流 throttle | ✅ | [throttle.ts](../../code/packages/javascript/src/handwrite/throttle.ts) | 时间戳 + 定时器 |
| 深拷贝 deepClone | ✅ | [deep-clone.ts](../../code/packages/javascript/src/handwrite/deep-clone.ts) | 循环引用、Map/Set、原型 |
| call / apply / bind | ✅ | [call-apply-bind.ts](../../code/packages/javascript/src/handwrite/call-apply-bind.ts) | this 绑定、临时属性 |
| new / instanceof | ✅ | [new-and-instanceof.ts](../../code/packages/javascript/src/handwrite/new-and-instanceof.ts) | 原型链、构造过程 |
| 柯里化 curry | ✅ | [curry.ts](../../code/packages/javascript/src/handwrite/curry.ts) | 闭包、参数收集 |
| compose / pipe | ✅ | [compose.ts](../../code/packages/javascript/src/handwrite/compose.ts) | 函数组合 |
| 数组扁平化 | ✅ | [flatten.ts](../../code/packages/javascript/src/handwrite/flatten.ts) | 递归、类型推导 |
| 事件总线 EventEmitter | ✅ | [event-emitter.ts](../../code/packages/javascript/src/handwrite/event-emitter.ts) | 发布订阅、泛型约束 |
| Promise | ✅ | [my-promise.ts](../../code/packages/javascript/src/handwrite/my-promise.ts) | 状态机、微任务、thenable |
| 并发控制 limit | ⬜ | — | Promise 池、队列 |
| 数组去重 / 分组 | ⬜ | — | Set、Map、reduce |
| 模板引擎 | ⬜ | — | 正则 + 替换 |
| 寄生组合继承 | ⬜ | — | 原型链 + 借用构造函数 |
| 简易路由 | ⬜ | — | hashchange / popstate |

> ✅ 表示仓库里已经有实现与测试；⬜ 是建议继续补充的题目。

## 面试前速记

- **闭包** = 函数 + 词法环境；能延长变量生命周期。
- **this** 由调用方式决定，箭头函数取定义时外层 this。
- **原型链** 的尽头是 `Object.prototype`，再往上 `null`。
- **微任务** 每轮宏任务结束后清空，且清空过程中新产生的微任务也会执行。
- **`await` 后面的代码** 等价于放进微任务队列。
- **手写题** 先讲思路和边界，再写代码，最后说复杂度。
