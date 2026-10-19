import { describe, expect, it } from 'vitest'
import {
  createList,
  findMiddle,
  hasCycle,
  ListNode,
  reverseList,
  toArray,
} from './linked-list'

describe('linked list', () => {
  it('createList / toArray 往返', () => {
    expect(toArray(createList([1, 2, 3, 4]))).toEqual([1, 2, 3, 4])
    expect(toArray(createList([]))).toEqual([])
  })

  it('反转链表', () => {
    const list = createList([1, 2, 3, 4])
    expect(toArray(reverseList(list))).toEqual([4, 3, 2, 1])

    expect(reverseList(null)).toBeNull()
    expect(toArray(reverseList(createList([1])))).toEqual([1])
  })

  it('快慢指针找中点（偶数个返回第二个中点）', () => {
    const odd = createList([1, 2, 3, 4, 5])
    const even = createList([1, 2, 3, 4])

    expect(findMiddle(odd)?.value).toBe(3)
    expect(findMiddle(even)?.value).toBe(3)
    expect(findMiddle(null)).toBeNull()
  })

  it('检测环', () => {
    const first = new ListNode(1)
    const second = new ListNode(2)
    const third = new ListNode(3)
    first.next = second
    second.next = third
    third.next = second

    expect(hasCycle(first)).toBe(true)
    expect(hasCycle(createList([1, 2, 3]))).toBe(false)
    expect(hasCycle(null)).toBe(false)
  })
})
