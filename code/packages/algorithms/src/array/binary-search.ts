/**
 * 二分查找：有序数组，O(log n)。
 * 返回目标下标，找不到返回 -1。
 */
export function binarySearch(sorted: readonly number[], target: number): number
export function binarySearch<T>(
  sorted: readonly T[],
  target: T,
  compare: (a: T, b: T) => number,
): number
export function binarySearch<T>(
  sorted: readonly T[],
  target: T,
  compare?: (a: T, b: T) => number,
): number {
  const compareFn =
    compare ??
    ((a: T, b: T): number => {
      // 默认按数值/字符串比较，供 number 重载使用
      if ((a as unknown as number) < (b as unknown as number)) return -1
      if ((a as unknown as number) > (b as unknown as number)) return 1
      return 0
    })

  let left = 0
  let right = sorted.length - 1

  while (left <= right) {
    // 避免 (left + right) 溢出
    const mid = left + ((right - left) >> 1)
    const order = compareFn(sorted[mid], target)

    if (order === 0) return mid
    if (order < 0) left = mid + 1
    else right = mid - 1
  }

  return -1
}
