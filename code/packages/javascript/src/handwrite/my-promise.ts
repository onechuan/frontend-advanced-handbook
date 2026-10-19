/**
 * 手写 Promise（教学版）：覆盖状态机、then 链式调用、thenable 吸收、
 * 微任务调度与常用静态方法。
 * 文档：docs/javascript/promise.md
 *
 * 说明：这版为了可读性做了简化，例如没有实现完整的
 * `Promise.resolve` 与 thenable 递归检测细节；生产代码请使用原生 Promise。
 */
type Resolve<T> = (value: T | PromiseLike<T>) => void
type Reject = (reason?: unknown) => void
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void

type FulfilledHandler<T> = ((value: T) => unknown) | null | undefined
type RejectedHandler = ((reason: unknown) => unknown) | null | undefined

interface Handler<T> {
  onFulfilled: FulfilledHandler<T>
  onRejected: RejectedHandler
  resolve: (value: unknown) => void
  reject: Reject
}

type State = 'pending' | 'fulfilled' | 'rejected'

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

export class MyPromise<T> implements PromiseLike<T> {
  private state: State = 'pending'
  private value: T | undefined
  private reason: unknown
  private handlers: Handler<T>[] = []

  constructor(executor: Executor<T>) {
    const settle = (state: Exclude<State, 'pending'>, payload: unknown): void => {
      if (this.state !== 'pending') return
      this.state = state
      if (state === 'fulfilled') this.value = payload as T
      else this.reason = payload
      this.flush()
    }

    const reject: Reject = (reason) => settle('rejected', reason)

    const resolve: Resolve<T> = (value) => {
      if (this.state !== 'pending') return

      // 返回自身会形成死循环，必须拒绝
      if ((value as unknown) === this) {
        reject(new TypeError('Chaining cycle detected for promise'))
        return
      }

      // thenable 吸收：等它的 then 执行后再决定当前 Promise 的状态
      if (isThenable(value)) {
        queueMicrotask(() => {
          try {
            value.then(resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
        return
      }

      settle('fulfilled', value as T)
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): MyPromise<TResult1 | TResult2> {
    return new MyPromise<TResult1 | TResult2>((resolve, reject) => {
      const handler: Handler<T> = {
        onFulfilled,
        onRejected,
        resolve: resolve as (value: unknown) => void,
        reject,
      }
      if (this.state === 'pending') this.handlers.push(handler)
      else queueMicrotask(() => this.runHandler(handler))
    })
  }

  catch<TResult = never>(
    onRejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): MyPromise<T | TResult> {
    return this.then<T | TResult, TResult>((value) => value, onRejected)
  }

  finally(onFinally?: (() => void) | null): MyPromise<T> {
    return this.then(
      (value) => {
        onFinally?.()
        return value
      },
      (reason) => {
        onFinally?.()
        throw reason
      },
    )
  }

  private flush(): void {
    if (this.state === 'pending') return
    const handlers = this.handlers
    this.handlers = []
    for (const handler of handlers) {
      queueMicrotask(() => this.runHandler(handler))
    }
  }

  private runHandler(handler: Handler<T>): void {
    const { onFulfilled, onRejected, resolve, reject } = handler
    try {
      if (this.state === 'fulfilled') {
        if (typeof onFulfilled === 'function') {
          resolve(onFulfilled(this.value as T))
        } else {
          resolve(this.value as T)
        }
        return
      }
      if (typeof onRejected === 'function') {
        resolve(onRejected(this.reason))
      } else {
        reject(this.reason)
      }
    } catch (error) {
      reject(error)
    }
  }

  static resolve<T>(value: T | PromiseLike<T>): MyPromise<T> {
    if (value instanceof MyPromise) return value
    return new MyPromise<T>((resolve) => resolve(value))
  }

  static reject<T = never>(reason?: unknown): MyPromise<T> {
    return new MyPromise<T>((_resolve, reject) => reject(reason))
  }

  static all<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<T[]> {
    return new MyPromise<T[]>((resolve, reject) => {
      const items = Array.from(values)
      const results = new Array<T>(items.length)
      if (items.length === 0) {
        resolve(results)
        return
      }
      let remaining = items.length
      items.forEach((item, index) => {
        MyPromise.resolve(item).then((value) => {
          results[index] = value
          remaining -= 1
          if (remaining === 0) resolve(results)
        }, reject)
      })
    })
  }

  static allSettled<T>(
    values: Iterable<T | PromiseLike<T>>,
  ): MyPromise<PromiseSettledResult<T>[]> {
    return new MyPromise<PromiseSettledResult<T>[]>((resolve) => {
      const items = Array.from(values)
      const results: PromiseSettledResult<T>[] = new Array(items.length)
      if (items.length === 0) {
        resolve(results)
        return
      }
      let remaining = items.length
      items.forEach((item, index) => {
        const done = (): void => {
          remaining -= 1
          if (remaining === 0) resolve(results)
        }
        MyPromise.resolve(item).then(
          (value) => {
            results[index] = { status: 'fulfilled', value }
            done()
          },
          (reason) => {
            results[index] = { status: 'rejected', reason }
            done()
          },
        )
      })
    })
  }

  static race<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<T> {
    return new MyPromise<T>((resolve, reject) => {
      for (const item of values) {
        MyPromise.resolve(item).then(resolve, reject)
      }
    })
  }

  static any<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<T> {
    return new MyPromise<T>((resolve, reject) => {
      const items = Array.from(values)
      const errors: unknown[] = new Array(items.length)
      if (items.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'))
        return
      }
      let remaining = items.length
      items.forEach((item, index) => {
        MyPromise.resolve(item).then(resolve, (reason) => {
          errors[index] = reason
          remaining -= 1
          if (remaining === 0) {
            reject(new AggregateError(errors, 'All promises were rejected'))
          }
        })
      })
    })
  }
}
