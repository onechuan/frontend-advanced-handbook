import { describe, expect, it } from 'vitest'
import { MyPromise } from './my-promise'

const toNative = <T>(promise: MyPromise<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    promise.then(resolve, reject)
  })

describe('MyPromise', () => {
  it('then 回调异步执行（微任务）', async () => {
    const order: string[] = []

    const promise = new MyPromise<number>((resolve) => {
      order.push('executor')
      resolve(1)
    })
    promise.then(() => order.push('then'))
    order.push('sync')

    await toNative(promise)
    expect(order).toEqual(['executor', 'sync', 'then'])
  })

  it('支持链式调用与值传递', async () => {
    const result = await toNative(
      MyPromise.resolve(1)
        .then((value) => value + 1)
        .then((value) => value * 2),
    )

    expect(result).toBe(4)
  })

  it('then 返回 Promise 时会等待其完成', async () => {
    const result = await toNative(
      MyPromise.resolve(1).then((value) => MyPromise.resolve(value + 1)),
    )

    expect(result).toBe(2)
  })

  it('接收 thenable 并吸收其状态', async () => {
    const result = await toNative(MyPromise.resolve(Promise.resolve(42)))
    expect(result).toBe(42)
  })

  it('错误会被 catch 捕获并可恢复', async () => {
    const rejected = new MyPromise<number>((_resolve, reject) => {
      reject(new Error('boom'))
    })
    await expect(toNative(rejected)).rejects.toThrow('boom')

    const recovered = await toNative(
      MyPromise.reject(new Error('fail')).catch(() => 'ok'),
    )
    expect(recovered).toBe('ok')
  })

  it('finally 在成功与失败时都会执行且不改变结果', async () => {
    const events: string[] = []

    const value = await toNative(
      MyPromise.resolve(1).finally(() => events.push('fulfilled')),
    )
    await expect(
      toNative(
        MyPromise.reject(new Error('x')).finally(() => events.push('rejected')),
      ),
    ).rejects.toThrow('x')

    expect(value).toBe(1)
    expect(events).toEqual(['fulfilled', 'rejected'])
  })

  it('all 按输入顺序收集结果', async () => {
    const result = await toNative(
      MyPromise.all([Promise.resolve(1), 2, MyPromise.resolve(3)]),
    )
    expect(result).toEqual([1, 2, 3])
  })

  it('all 遇到 rejected 立即失败', async () => {
    await expect(
      toNative(
        MyPromise.all([
          MyPromise.resolve(1),
          MyPromise.reject(new Error('stop')),
          MyPromise.resolve(3),
        ]),
      ),
    ).rejects.toThrow('stop')
  })

  it('allSettled 收集每个 Promise 的结果', async () => {
    const results = await toNative(
      MyPromise.allSettled([
        Promise.resolve(1),
        Promise.reject(new Error('x')),
      ]),
    )

    expect(results[0]).toEqual({ status: 'fulfilled', value: 1 })
    expect(results[1]?.status).toBe('rejected')
  })

  it('race 返回最先落定的结果', async () => {
    const winner = await toNative(
      MyPromise.race([
        new Promise<number>((resolve) => setTimeout(() => resolve(2), 10)),
        MyPromise.resolve(1),
      ]),
    )
    expect(winner).toBe(1)
  })

  it('any 返回第一个成功的结果', async () => {
    const value = await toNative(
      MyPromise.any([
        MyPromise.reject(new Error('a')),
        MyPromise.resolve(7),
      ]),
    )
    expect(value).toBe(7)
  })

  it('any 全部失败时抛出 AggregateError', async () => {
    await expect(
      toNative(
        MyPromise.any([
          MyPromise.reject(new Error('a')),
          MyPromise.reject(new Error('b')),
        ]),
      ),
    ).rejects.toBeInstanceOf(AggregateError)
  })
})
