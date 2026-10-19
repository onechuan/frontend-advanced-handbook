# TypeScript 复习清单

> 代码：[`code/packages/typescript`](../../code/packages/typescript)
> 核心笔记：[type-system.md](type-system.md)

## 基础

| 主题 | 状态 | 关键问题 |
| --- | --- | --- |
| 类型系统与结构化类型 | ✅ | 鸭子类型、type 与 interface 的区别 |
| 原始类型与字面量类型 | ⬜ | 字面量、`as const`、类型收窄 |
| any / unknown / never / void | ✅ | 安全边界、穷尽检查 |
| 函数类型与重载 | ✅ | 参数、返回值、`this` 参数、重载签名 |
| 泛型 | ✅ | 约束、默认值、推断 |
| 联合与交叉类型 | ⬜ | 可辨识联合、类型收窄 |
| 类型守卫 | ⬜ | `typeof`、`in`、自定义守卫、断言函数 |
| 模块 | ⬜ | `import type`、`verbatimModuleSyntax`、paths |

## 进阶

| 主题 | 状态 | 笔记/代码 |
| --- | --- | --- |
| keyof / typeof / 索引访问 | ✅ | [type-system.md](type-system.md) |
| 条件类型与 infer | ✅ | [type-system.md](type-system.md) |
| 分布式条件类型 | ✅ | [type-system.md](type-system.md) |
| 映射类型与键重映射 | ✅ | [type-system.md](type-system.md) |
| 模板字面量类型 | ✅ | [type-challenges.ts](../../code/packages/typescript/src/type-challenges.ts) |
| 内置工具类型 | ✅ | [utility-types.ts](../../code/packages/typescript/src/utility-types.ts) |
| 类型体操 | ✅ | [type-challenges.ts](../../code/packages/typescript/src/type-challenges.ts) |
| 协变与逆变 | ⬜ | 函数参数逆变、`in`/`out` |
| 声明合并 | ⬜ | interface、namespace、模块扩充 |
| `satisfies` 操作符 | ⬜ | 保留字面量类型的同时校验 |

## 已实现的类型工具

| 类型 | 作用 |
| --- | --- |
| `MyPartial` / `MyRequired` / `MyReadonly` | 映射类型与修饰符 |
| `MyPick` / `MyOmit` | `keyof` + `Exclude` + 映射 |
| `MyRecord` | 键集合到值类型 |
| `MyExclude` / `MyExtract` / `MyNonNullable` | 分布式条件类型 |
| `MyReturnType` / `MyParameters` | `infer` 推断 |
| `DeepPartial` / `DeepReadonly` | 递归映射与边界处理 |
| `First` / `Last` / `TupleLength` | 元组与 `infer` |
| `Concat` / `Push` / `Pop` | 可变元组 |
| `TupleToObject` | 索引访问 + 映射类型 |
| `StringToUnion` | 模板字面量类型递归 |
| `MyAwaited` | 递归解包 PromiseLike |

## 面试前速记

- TS 类型只存在于编译期，运行时会被擦除。
- `unknown` 是安全版 `any`；`never` 表示不可能的值，常用于穷尽检查。
- 分布式条件类型只在**裸类型参数**上生效。
- `infer` 只能在条件类型的 `extends` 子句中使用。
- 映射类型保留原类型的修饰符；`-?` 移除可选，`readonly` 可增删。
- 类型体操的套路：条件类型 + `infer` + 递归 + 元组 / 模板字面量。
