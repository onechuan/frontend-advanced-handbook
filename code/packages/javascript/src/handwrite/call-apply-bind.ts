/**
 * 手写 call / apply / bind。
 * 文档：docs/javascript/this.md（this 绑定规则）
 *
 * 核心思路：把函数临时挂到目标对象上，通过对象方法调用完成 this 绑定，
 * 调用结束后删除临时属性，避免污染对象。
 */
const getContext = (thisArg: unknown): Record<PropertyKey, unknown> => {
  if (thisArg === null || thisArg === undefined) {
    return globalThis as unknown as Record<PropertyKey, unknown>
  }
  return Object(thisArg) as Record<PropertyKey, unknown>
}

const tempKey = Symbol('myThis')

export function myCall<R>(
  fn: (this: any, ...args: any[]) => R,
  thisArg: unknown,
  ...args: unknown[]
): R {
  const context = getContext(thisArg)
  Object.defineProperty(context, tempKey, {
    value: fn,
    writable: true,
    enumerable: false,
    configurable: true,
  })
  try {
    return (context[tempKey] as (...args: unknown[]) => R)(...args)
  } finally {
    delete context[tempKey]
  }
}

export function myApply<R>(
  fn: (this: any, ...args: any[]) => R,
  thisArg: unknown,
  args: readonly unknown[] = [],
): R {
  return myCall(fn, thisArg, ...args)
}

/**
 * bind 返回新函数；当新函数被 new 调用时，绑定的 this 会被忽略，
 * 但预先绑定的参数依然生效（ES 规范行为）。
 */
export function myBind<R>(
  fn: (this: any, ...args: any[]) => R,
  thisArg: unknown,
  ...boundArgs: unknown[]
): (...args: unknown[]) => R {
  return function (this: unknown, ...callArgs: unknown[]): R {
    const isNewCall = new.target !== undefined
    const context = isNewCall ? this : thisArg
    return myCall(fn, context, ...boundArgs, ...callArgs)
  }
}
