# @fe-agent/javascript

JavaScript 核心机制与高频手写题，全部使用 TypeScript 编写，Vitest 测试。

## 内容

| 主题 | 源码 | 测试 |
| --- | --- | --- |
| 防抖 | [debounce.ts](src/handwrite/debounce.ts) | `debounce.test.ts` |
| 节流 | [throttle.ts](src/handwrite/throttle.ts) | `throttle.test.ts` |
| 深拷贝 | [deep-clone.ts](src/handwrite/deep-clone.ts) | `deep-clone.test.ts` |
| call / apply / bind | [call-apply-bind.ts](src/handwrite/call-apply-bind.ts) | `primitives.test.ts` |
| new / instanceof | [new-and-instanceof.ts](src/handwrite/new-and-instanceof.ts) | `primitives.test.ts` |
| 柯里化 | [curry.ts](src/handwrite/curry.ts) | `primitives.test.ts` |
| compose / pipe | [compose.ts](src/handwrite/compose.ts) | `primitives.test.ts` |
| 扁平化 | [flatten.ts](src/handwrite/flatten.ts) | `primitives.test.ts` |
| 事件总线 | [event-emitter.ts](src/handwrite/event-emitter.ts) | `event-emitter.test.ts` |
| Promise | [my-promise.ts](src/handwrite/my-promise.ts) | `my-promise.test.ts` |

## 命令

```bash
pnpm test
pnpm test:watch
pnpm typecheck
```

对应笔记：[docs/javascript](../../../docs/javascript/README.md)。
