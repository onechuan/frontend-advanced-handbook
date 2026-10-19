/**
 * 数组扁平化：递归实现，语义直观；极深的数组可改用显式栈。
 */
export type FlattenDeep<T> = T extends readonly (infer U)[]
  ? U extends readonly unknown[]
    ? FlattenDeep<U>
    : U
  : T

export function flattenDeep<T>(input: readonly T[]): FlattenDeep<T>[] {
  const result: unknown[] = []
  const walk = (items: readonly unknown[]): void => {
    for (const item of items) {
      if (Array.isArray(item)) walk(item)
      else result.push(item)
    }
  }
  walk(input)
  return result as FlattenDeep<T>[]
}
