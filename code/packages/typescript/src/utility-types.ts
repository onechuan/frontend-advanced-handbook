/**
 * 手写内置工具类型：理解映射类型、条件类型与 keyof 的组合。
 * 文档：docs/typescript/type-system.md
 */

export type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

export type MyRequired<T> = {
  [K in keyof T]-?: T[K]
}

export type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

export type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>

export type MyRecord<K extends keyof any, V> = {
  [P in K]: V
}

export type MyExclude<T, U> = T extends U ? never : T

export type MyExtract<T, U> = T extends U ? T : never

export type MyNonNullable<T> = T extends null | undefined ? never : T

export type MyReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never

export type MyParameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never

/** 递归可选；数组保持数组结构，函数类型原样返回 */
export type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly unknown[]
    ? { [K in keyof T]: DeepPartial<T[K]> }
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T

/** 递归只读；数组保持数组结构，函数类型原样返回 */
export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T
