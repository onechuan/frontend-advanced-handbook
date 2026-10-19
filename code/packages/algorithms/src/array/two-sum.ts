/**
 * 两数之和：哈希表记录已遍历的值与下标，O(n) / O(n)。
 * 返回一组满足条件的下标；不存在返回 null。
 */
export function twoSum(
  nums: readonly number[],
  target: number,
): [number, number] | null {
  const seen = new Map<number, number>()

  for (let index = 0; index < nums.length; index += 1) {
    const current = nums[index]
    const complement = target - current
    const complementIndex = seen.get(complement)

    if (complementIndex !== undefined) {
      return [complementIndex, index]
    }
    seen.set(current, index)
  }

  return null
}
