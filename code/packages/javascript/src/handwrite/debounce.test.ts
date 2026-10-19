import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('trailing：连续调用只执行最后一次', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced(1)
    debounced(2)
    debounced(3)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(3)
  })

  it('leading：首次调用立即执行，冷却期结束补最后一次', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100, { leading: true })

    debounced(1)
    expect(fn).toHaveBeenLastCalledWith(1)

    debounced(2)
    debounced(3)
    setTimeout(() => debounced(4), 50)
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(4)
  })

  it('cancel 取消尚未执行的调用', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced(1)
    debounced.cancel()
    vi.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()
  })

  it('flush 立即执行并返回结果', () => {
    const fn = vi.fn((value: number) => value * 2)
    const debounced = debounce(fn, 100)

    debounced(21)
    const result = debounced.flush()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(result).toBe(42)
  })

  it('保留调用时的 this 与参数', () => {
    const calls: number[] = []
    const obj = {
      value: 42,
      method: debounce(function (this: { value: number }, delta: number) {
        calls.push(this.value + delta)
      }, 10),
    }

    obj.method(1)
    vi.advanceTimersByTime(10)

    expect(calls).toEqual([43])
  })
})
