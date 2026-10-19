import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('leading：立即执行，冷却期内最多一次，结束时补最后一次', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled(1)
    expect(fn).toHaveBeenLastCalledWith(1)

    throttled(2)
    throttled(3)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
  })

  it('leading = false：首次调用延迟到冷却期结束', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100, { leading: false })

    throttled('a')
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith('a')
  })

  it('冷却期结束后再次调用会立即执行', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled(1)
    vi.advanceTimersByTime(100)
    throttled(2)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(2)
  })

  it('cancel 清空计时器，之后可以重新开始', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled(1)
    throttled.cancel()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    throttled(2)
    expect(fn).toHaveBeenLastCalledWith(2)
  })

  it('leading 与 trailing 都为 false 时永不执行', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100, { leading: false, trailing: false })

    throttled(1)
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })
})
