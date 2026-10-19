import { describe, expect, it } from 'vitest'
import { twoSum } from './two-sum'

describe('twoSum', () => {
  it('返回满足条件的下标', () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1])
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2])
  })

  it('处理重复元素', () => {
    expect(twoSum([3, 3], 6)).toEqual([0, 1])
  })

  it('不存在解时返回 null', () => {
    expect(twoSum([1, 2, 3], 100)).toBeNull()
    expect(twoSum([], 0)).toBeNull()
  })

  it('不会重复使用同一个元素', () => {
    // 若实现错误地允许重复使用下标 0，会返回 [0, 0]
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2])
  })
})
