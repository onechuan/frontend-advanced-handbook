import { describe, expect, it } from 'vitest'
import { MinHeap } from './min-heap'

describe('MinHeap', () => {
  it('按升序弹出元素', () => {
    const heap = new MinHeap()
    for (const value of [5, 3, 8, 1, 9, 2]) heap.push(value)

    expect(heap.size).toBe(6)
    expect(heap.peek()).toBe(1)

    const result: number[] = []
    let value = heap.pop()
    while (value !== undefined) {
      result.push(value)
      value = heap.pop()
    }

    expect(result).toEqual([1, 2, 3, 5, 8, 9])
    expect(heap.size).toBe(0)
  })

  it('空堆 peek / pop 返回 undefined', () => {
    const heap = new MinHeap()

    expect(heap.peek()).toBeUndefined()
    expect(heap.pop()).toBeUndefined()
  })
})
