import { describe, expect, it } from 'vitest'
import { deepClone } from './deep-clone'

describe('deepClone', () => {
  it('深拷贝嵌套对象，引用完全独立', () => {
    const source = { a: 1, nested: { b: 2, list: [1, 2, { c: 3 }] } }
    const copy = deepClone(source)

    expect(copy).toEqual(source)
    expect(copy).not.toBe(source)
    expect(copy.nested).not.toBe(source.nested)
    expect(copy.nested.list).not.toBe(source.nested.list)
    expect(copy.nested.list[2]).not.toBe(source.nested.list[2])
  })

  it('处理循环引用', () => {
    interface Node {
      name: string
      self?: Node
    }
    const source: Node = { name: 'root' }
    source.self = source

    const copy = deepClone(source)

    expect(copy).not.toBe(source)
    expect(copy.name).toBe('root')
    expect(copy.self).toBe(copy)
  })

  it('处理 Date、RegExp、Map、Set', () => {
    const source = {
      date: new Date('2026-01-01T00:00:00.000Z'),
      regExp: /abc/gi,
      map: new Map([['key', { n: 1 }]]),
      set: new Set([1, 2]),
    }
    const copy = deepClone(source)

    expect(copy.date).not.toBe(source.date)
    expect(copy.date.getTime()).toBe(source.date.getTime())
    expect(copy.regExp).not.toBe(source.regExp)
    expect(copy.regExp.source).toBe('abc')
    expect(copy.regExp.flags).toBe('gi')
    expect(copy.map).not.toBe(source.map)
    expect(copy.map.get('key')).not.toBe(source.map.get('key'))
    expect([...copy.set]).toEqual([1, 2])
  })

  it('保留 class 实例的原型', () => {
    class Person {
      constructor(public name: string) {}
      greet(): string {
        return `hi ${this.name}`
      }
    }

    const copy = deepClone(new Person('Tom'))

    expect(copy).toBeInstanceOf(Person)
    expect(copy.greet()).toBe('hi Tom')
  })

  it('原始值直接返回', () => {
    expect(deepClone(1)).toBe(1)
    expect(deepClone('text')).toBe('text')
    expect(deepClone(null)).toBe(null)
  })
})
