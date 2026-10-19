/**
 * 防抖：在最后一次调用后等待 `wait` 毫秒才执行。
 * 文档：docs/javascript/closure.md（闭包与 debounce/throttle 的应用）
 */
type AnyFn = (this: any, ...args: any[]) => any

export interface DebounceOptions {
  /** 是否在等待时间开始时立即执行一次，默认 false */
  leading?: boolean
  /** 是否在等待时间结束后执行最后一次调用，默认 true */
  trailing?: boolean
}

export interface DebouncedFn<T extends AnyFn> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void
  /** 取消尚未执行的调用 */
  cancel(): void
  /** 立即执行尚未执行的调用（若有） */
  flush(): ReturnType<T> | undefined
}

export function debounce<T extends AnyFn>(
  fn: T,
  wait = 0,
  { leading = false, trailing = true }: DebounceOptions = {},
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: ThisParameterType<T> | undefined
  let result: ReturnType<T> | undefined
  let invokedLeading = false

  const invoke = (
    thisArg: ThisParameterType<T> | undefined,
    args: Parameters<T>,
  ): ReturnType<T> => {
    const value = fn.apply(thisArg, args) as ReturnType<T>
    result = value
    return value
  }

  const debounced = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    // 判断是否处于冷却期，必须在 clearTimeout 之前计算
    const isFirstCall = timer === undefined

    lastArgs = args
    lastThis = this
    invokedLeading = false

    if (timer !== undefined) clearTimeout(timer)

    if (leading && isFirstCall) {
      invokedLeading = true
      invoke(this, args)
    }

    timer = setTimeout(() => {
      timer = undefined
      // leading 已经执行过本次调用的逻辑，就不再补执行
      if (trailing && lastArgs !== undefined && !invokedLeading) {
        invoke(lastThis, lastArgs)
      }
      lastArgs = undefined
      lastThis = undefined
    }, wait)
  } as DebouncedFn<T>

  debounced.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    lastArgs = undefined
    lastThis = undefined
  }

  debounced.flush = (): ReturnType<T> | undefined => {
    if (timer === undefined) return result
    clearTimeout(timer)
    timer = undefined
    const value = lastArgs !== undefined ? invoke(lastThis, lastArgs) : result
    lastArgs = undefined
    lastThis = undefined
    return value
  }

  return debounced
}
