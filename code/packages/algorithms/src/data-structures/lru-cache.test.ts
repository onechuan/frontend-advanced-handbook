import { describe, expect, it } from 'vitest'
import { LRUCache } from './lru-cache'

describe('LRUCache', () => {
  it('淘汰最久未使用的键', () => {
    const cache = new LRUCache<string, number>(2)

    cache.put('a', 1)
    cache.put('b', 2)

    // 访问 a，使 b 成为最久未使用
    expect(cache.get('a')).toBe(1)

    cache.put('c', 3)

    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe(1)
    expect(cache.get('c')).toBe(3)
    expect(cache.size).toBe(2)
  })

  it('更新已有键不会增加容量且会刷新热度', () => {
    const cache = new LRUCache<string, number>(2)

    cache.put('a', 1)
    cache.put('b', 2)
    cache.put('a', 10)

    expect(cache.size).toBe(2)
    expect(cache.get('a')).toBe(10)

    cache.put('c', 3)
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe(10)
  })

  it('容量必须为正数', () => {
    expect(() => new LRUCache(0)).toThrow(RangeError)
  })
})
