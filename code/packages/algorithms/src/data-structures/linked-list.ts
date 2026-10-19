/**
 * 单链表常用操作：构建、反转、找中点、判环（快慢指针）。
 */
export class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null,
  ) {}
}

export function createList<T>(values: readonly T[]): ListNode<T> | null {
  let head: ListNode<T> | null = null
  // 从后往前连接，避免维护尾指针
  for (let index = values.length - 1; index >= 0; index -= 1) {
    head = new ListNode(values[index], head)
  }
  return head
}

export function toArray<T>(head: ListNode<T> | null): T[] {
  const result: T[] = []
  let current = head
  while (current !== null) {
    result.push(current.value)
    current = current.next
  }
  return result
}

/** 迭代反转：prev / current / next 三指针，O(n) / O(1) */
export function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let previous: ListNode<T> | null = null
  let current = head

  while (current !== null) {
    const next = current.next
    current.next = previous
    previous = current
    current = next
  }

  return previous
}

/** 快慢指针找中点；偶数个节点时返回第二个中点 */
export function findMiddle<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow: ListNode<T> | null = head
  let fast: ListNode<T> | null = head

  while (fast !== null && fast.next !== null) {
    slow = slow?.next ?? null
    fast = fast.next.next
  }

  return slow
}

/** Floyd 判圈算法 */
export function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow: ListNode<T> | null = head
  let fast: ListNode<T> | null = head

  while (fast !== null && fast.next !== null) {
    slow = slow?.next ?? null
    fast = fast.next.next
    if (slow === fast) return true
  }

  return false
}
