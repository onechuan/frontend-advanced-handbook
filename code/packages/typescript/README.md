# @fe-agent/typescript

手写内置工具类型与经典类型体操，测试使用 Vitest 的 `expectTypeOf`，由 `tsc` 校验。

## 内容

- [utility-types.ts](src/utility-types.ts)：`MyPartial`、`MyPick`、`MyOmit`、`MyExclude`、`MyReturnType`、`DeepPartial`、`DeepReadonly` 等。
- [type-challenges.ts](src/type-challenges.ts)：`First`、`Last`、`Concat`、`TupleToObject`、`StringToUnion`、`MyAwaited` 等。

## 命令

```bash
pnpm test        # expectTypeOf 断言
pnpm typecheck   # 类型层面的真正校验
```

对应笔记：[docs/typescript](../../../docs/typescript/type-system.md)。
