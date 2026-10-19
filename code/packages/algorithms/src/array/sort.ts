/**
 * 快速排序：平均 O(n log n)，最坏 O(n²)（每次选到最值作为 pivot）。
 * 这里采用「小于 / 等于 / 大于」三分法，天然处理重复元素。
 */
export function quickSort(values: readonly number[]): number[] {
  if (values.length <= 1) return values.slice()

  const pivot = values[0]
  const smaller: number[] = []
  const equal: number[] = []
  const larger: number[] = []

  for (const value of values) {
    if (value < pivot) smaller.push(value)
    else if (value > pivot) larger.push(value)
    else equal.push(value)
  }

  return [...quickSort(smaller), ...equal, ...quickSort(larger)]
}

/**
 * 归并排序：稳定排序，O(n log n) 时间、O(n) 额外空间。
 */
export function mergeSort(values: readonly number[]): number[] {
  if (values.length <= 1) return values.slice()

  const middle = Math.floor(values.length / 2)
  const left = mergeSort(values.slice(0, middle))
  const right = mergeSort(values.slice(middle))
  return merge(left, right)
}

function merge(left: readonly number[], right: readonly number[]): number[] {
  const result: number[] = []
  let i = 0
  let j = 0

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i])
      i += 1
    } else {
      result.push(right[j])
      j += 1
    }
  }

  while (i < left.length) {
    result.push(left[i])
    i += 1
  }
  while (j < right.length) {
    result.push(right[j])
    j += 1
  }

  return result
}
