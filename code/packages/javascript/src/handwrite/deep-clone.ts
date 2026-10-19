/**
 * 深拷贝：处理循环引用、Date、RegExp、Map、Set，并保留原型。
 * 文档：docs/javascript/prototype.md（原型链）
 *
 * 注意：WeakMap / Promise / 函数等特殊对象不适合（也无法）被深拷贝，
 * 这里按原样返回引用，面试时需要主动说明边界。
 */
export function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  // 原始值与函数直接返回（函数通常保持引用）
  if (value === null || typeof value !== 'object') return value

  const cached = seen.get(value)
  if (cached !== undefined) return cached as T

  if (value instanceof Date) return new Date(value.getTime()) as T

  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T

  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>()
    seen.set(value, copy)
    value.forEach((mapValue, mapKey) => {
      copy.set(deepClone(mapKey, seen), deepClone(mapValue, seen))
    })
    return copy as T
  }

  if (value instanceof Set) {
    const copy = new Set<unknown>()
    seen.set(value, copy)
    value.forEach((item) => copy.add(deepClone(item, seen)))
    return copy as T
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = []
    seen.set(value, copy)
    value.forEach((item, index) => {
      copy[index] = deepClone(item, seen)
    })
    return copy as T
  }

  // Object.create 保留原型，因此 class 实例的方法依然可用
  const copy = Object.create(Object.getPrototypeOf(value)) as Record<
    PropertyKey,
    unknown
  >
  seen.set(value, copy)
  for (const key of Reflect.ownKeys(value)) {
    copy[key] = deepClone(
      (value as Record<PropertyKey, unknown>)[key],
      seen,
    )
  }
  return copy as T
}
