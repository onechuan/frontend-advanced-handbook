/**
 * 经典类型体操（参考 type-challenges）。
 * 文档：docs/typescript/type-system.md
 */

export type First<T extends readonly unknown[]> = T extends readonly [
  infer F,
  ...unknown[],
]
  ? F
  : never

export type Last<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer L,
]
  ? L
  : never

export type TupleLength<T extends readonly unknown[]> = T['length']

export type Concat<
  T extends readonly unknown[],
  U extends readonly unknown[],
> = [...T, ...U]

export type Push<T extends unknown[], V> = [...T, V]

export type Pop<T extends unknown[]> = T extends [...infer Rest, unknown]
  ? Rest
  : []

export type TupleToObject<
  T extends readonly (string | number | symbol)[],
> = {
  [K in T[number]]: K
}

/** 字符串转字符联合：'abc' -> 'a' | 'b' | 'c' */
export type StringToUnion<S extends string> = S extends `${infer First}${infer Rest}`
  ? First | StringToUnion<Rest>
  : never

/** 递归解包 PromiseLike，与 Awaited 的思路一致 */
export type MyAwaited<T> = T extends PromiseLike<infer Value>
  ? MyAwaited<Value>
  : T
