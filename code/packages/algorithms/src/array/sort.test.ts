import { describe, expect, it } from 'vitest'
import { mergeSort, quickSort } from './sort'

const input = [5, 2, 9, 1, 5, 6]
const sorted = [1, 2, 5, 5, 6, 9]

describe('quickSort', () => {
  it('排序并处理重复元素', () => {
    expect(quickSort(input)).toEqual(sorted)
  })

  it('不修改原数组', () => {
    quickSort(input)
    expect(input).toEqual([5, 2, 9, 1, 5, 6])
  })

  it('处理空数组与单元素数组', () => {
    expect(quickSort([])).toEqual([])
    expect(quickSort([1])).toEqual([1])
  })

  it('处理负数', () => {
    expect(quickSort([-1, -5, 3, 0])).toEqual([-5, -1, 0, 3])
  })
})

describe('mergeSort', () => {
  it('排序并处理重复元素', () => {
    expect(mergeSort(input)).toEqual(sorted)
  })

  it('不修改原数组', () => {
    mergeSort(input)
    expect(input).toEqual([5, 2, 9, 1, 5, 6])
  })

  it('处理空数组与单元素数组', () => {
    expect(mergeSort([])).toEqual([])
    expect(mergeSort([1])).toEqual([1])
  })

  it('处理负数', () => {
    expect(mergeSort([-1, -5, 3, 0])).toEqual([-5, -1, 0, 3])
  })
})
