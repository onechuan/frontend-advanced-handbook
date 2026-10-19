/**
 * 柯里化：把多参数函数转换为可以分多次传参的形式。
 * 文档：docs/javascript/closure.md（闭包）
 *
 * 使用重载是为常见 2~4 参数场景提供尽量精确的类型。
 */
type AnyFn = (...args: any[]) => any

export interface Curry2<A, B, R> {
  (a: A): (b: B) => R
  (a: A, b: B): R
}

export interface Curry3<A, B, C, R> {
  (a: A): Curry2<B, C, R>
  (a: A, b: B): (c: C) => R
  (a: A, b: B, c: C): R
}

export interface Curry4<A, B, C, D, R> {
  (a: A): Curry3<B, C, D, R>
  (a: A, b: B): Curry2<C, D, R>
  (a: A, b: B, c: C): (d: D) => R
  (a: A, b: B, c: C, d: D): R
}

export function curry<A, B, R>(fn: (a: A, b: B) => R): Curry2<A, B, R>
export function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R): Curry3<A, B, C, R>
export function curry<A, B, C, D, R>(
  fn: (a: A, b: B, c: C, d: D) => R,
): Curry4<A, B, C, D, R>
export function curry(fn: AnyFn): AnyFn {
  const arity = fn.length

  return function curried(this: unknown, ...args: unknown[]): unknown {
    if (args.length >= arity) return fn.apply(this, args)
    return (...rest: unknown[]): unknown => curried.apply(this, [...args, ...rest])
  }
}
