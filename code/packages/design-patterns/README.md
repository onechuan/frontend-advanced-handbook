# @fe-agent/design-patterns

前端常用设计模式的 TypeScript 实现。

## 内容

| 模式 | 文件 | 场景 |
| --- | --- | --- |
| 单例 | [singleton.ts](src/singleton.ts) | 全局配置、连接池 |
| 观察者 | [observer.ts](src/observer.ts) | 状态订阅、事件总线 |
| 策略 | [strategy.ts](src/strategy.ts) | 折扣计算、表单校验、排序 |

## 命令

```bash
pnpm test
pnpm typecheck
```
