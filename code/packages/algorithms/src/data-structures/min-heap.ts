/**
 * 最小堆（优先队列）：push / pop 均为 O(log n)，peek O(1)。
 * 数组下标关系：parent = (i - 1) >> 1，left = i * 2 + 1，right = i * 2 + 2。
 */
export class MinHeap {
  private items: number[] = []

  get size(): number {
    return this.items.length
  }

  peek(): number | undefined {
    return this.items[0]
  }

  push(value: number): void {
    this.items.push(value)
    this.siftUp(this.items.length - 1)
  }

  pop(): number | undefined {
    if (this.items.length === 0) return undefined

    const root = this.items[0]
    const last = this.items.pop() as number

    if (this.items.length > 0) {
      this.items[0] = last
      this.siftDown(0)
    }

    return root
  }

  private siftUp(start: number): void {
    let index = start
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.items[parent] <= this.items[index]) break
      this.swap(parent, index)
      index = parent
    }
  }

  private siftDown(start: number): void {
    let index = start
    const length = this.items.length

    while (true) {
      const left = index * 2 + 1
      const right = left + 1
      let smallest = index

      if (left < length && this.items[left] < this.items[smallest]) {
        smallest = left
      }
      if (right < length && this.items[right] < this.items[smallest]) {
        smallest = right
      }
      if (smallest === index) break

      this.swap(index, smallest)
      index = smallest
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.items[i]
    this.items[i] = this.items[j]
    this.items[j] = temp
  }
}
