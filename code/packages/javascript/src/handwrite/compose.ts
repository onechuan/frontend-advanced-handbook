/**
 * 函数组合：compose 从右到左执行，pipe 从左到右执行。
 * 文档：docs/javascript/closure.md
 */
type Unary<A, B> = (value: A) => B

export function compose<A, B, C>(f: Unary<B, C>, g: Unary<A, B>): Unary<A, C>
export function compose<A, B, C, D>(
  f: Unary<C, D>,
  g: Unary<B, C>,
  h: Unary<A, B>,
): Unary<A, D>
export function compose(
  ...fns: Array<Unary<any, any>>
): Unary<any, any> {
  return (value: unknown): unknown =>
    fns.reduceRight((acc, fn) => fn(acc), value)
}

export function pipe<A, B, C>(f: Unary<A, B>, g: Unary<B, C>): Unary<A, C>
export function pipe<A, B, C, D>(
  f: Unary<A, B>,
  g: Unary<B, C>,
  h: Unary<C, D>,
): Unary<A, D>
export function pipe(...fns: Array<Unary<any, any>>): Unary<any, any> {
  return (value: unknown): unknown =>
    fns.reduce((acc, fn) => fn(acc), value)
}
