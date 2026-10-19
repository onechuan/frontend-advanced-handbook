/**
 * LRU 缓存：利用 Map 的插入顺序实现 O(1) 的 get / put。
 * 访问或写入时先删除再插入，把 key 移到「最新」位置。
 *
 * 面试延伸：用「哈希表 + 双向链表」手动实现，可解释每一步指针操作。
 */
export class LRUCache<K, V> {
  private readonly map = new Map<K, V>()

  constructor(private readonly capacity: number) {
    if (capacity <= 0) throw new RangeError('capacity must be a positive integer')
  }

  get size(): number {
    return this.map.size
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined

    const value = this.map.get(key) as V
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next()
      if (!oldest.done) this.map.delete(oldest.value)
    }

    this.map.set(key, value)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }
}
