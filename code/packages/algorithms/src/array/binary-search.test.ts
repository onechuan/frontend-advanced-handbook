import { describe, expect, it } from 'vitest'
import { binarySearch } from './binary-search'

describe('binarySearch', () => {
  it('返回目标下标', () => {
    const values = [1, 3, 5, 7, 9]

    expect(binarySearch(values, 1)).toBe(0)
    expect(binarySearch(values, 7)).toBe(3)
    expect(binarySearch(values, 9)).toBe(4)
  })

  it('找不到时返回 -1', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 4)).toBe(-1)
    expect(binarySearch([1, 3, 5, 7, 9], 0)).toBe(-1)
    expect(binarySearch([1, 3, 5, 7, 9], 10)).toBe(-1)
  })

  it('空数组返回 -1', () => {
    expect(binarySearch([], 1)).toBe(-1)
  })

  it('支持自定义比较器', () => {
    const values = ['apple', 'banana', 'cherry']
    expect(binarySearch(values, 'banana', (a, b) => a.localeCompare(b))).toBe(1)
  })
})
