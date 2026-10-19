/**
 * 节流：在 `wait` 毫秒内最多执行一次。
 * 文档：docs/javascript/closure.md（闭包与 debounce/throttle 的应用）
 */
type AnyFn = (this: any, ...args: any[]) => any

export interface ThrottleOptions {
  /** 是否在冷却期开始时立即执行，默认 true */
  leading?: boolean
  /** 是否在冷却期结束时补执行最后一次调用，默认 true */
  trailing?: boolean
}

export interface ThrottledFn<T extends AnyFn> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void
  cancel(): void
}

export function throttle<T extends AnyFn>(
  fn: T,
  wait = 0,
  { leading = true, trailing = true }: ThrottleOptions = {},
): ThrottledFn<T> {
  // leading 与 trailing 都为 false 时永远不会执行，直接返回空函数
  if (!leading && !trailing) {
    const noop = function (): void {} as ThrottledFn<T>
    noop.cancel = (): void => {}
    return noop
  }

  let lastInvokeTime = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: ThisParameterType<T> | undefined

  const invoke = (
    thisArg: ThisParameterType<T> | undefined,
    args: Parameters<T>,
  ): void => {
    lastInvokeTime = Date.now()
    fn.apply(thisArg, args)
  }

  const startTrailingTimer = (delay: number): void => {
    timer = setTimeout(() => {
      timer = undefined
      if (lastArgs !== undefined) {
        invoke(lastThis, lastArgs)
        lastArgs = undefined
        lastThis = undefined
      }
    }, delay)
  }

  const throttled = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    const now = Date.now()

    // 第一次调用：根据 leading 决定立即执行还是进入 trailing 计时
    if (lastInvokeTime === 0) {
      lastInvokeTime = now
      if (leading) {
        invoke(this, args)
      } else {
        lastArgs = args
        lastThis = this
        startTrailingTimer(wait)
      }
      return
    }

    const remaining = wait - (now - lastInvokeTime)

    // 冷却期已过：立即执行，并清掉未触发的 trailing
    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer)
        timer = undefined
      }
      lastArgs = undefined
      lastThis = undefined
      invoke(this, args)
      return
    }

    // 冷却期内：记录最后一次参数，等冷却期结束时补执行
    lastArgs = args
    lastThis = this
    if (timer === undefined) startTrailingTimer(remaining)
  } as ThrottledFn<T>

  throttled.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    lastInvokeTime = 0
    lastArgs = undefined
    lastThis = undefined
  }

  return throttled
}
