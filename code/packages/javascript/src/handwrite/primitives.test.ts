import { describe, expect, it } from 'vitest'
import { myApply, myBind, myCall } from './call-apply-bind'
import { compose, pipe } from './compose'
import { curry } from './curry'
import { flattenDeep } from './flatten'
import { myInstanceOf, myNew } from './new-and-instanceof'

describe('call / apply / bind', () => {
  function greet(this: { name: string }, greeting: string, punctuation: string): string {
    return `${greeting}, ${this.name}${punctuation}`
  }

  it('myCall 绑定 this 并传递参数', () => {
    expect(myCall(greet, { name: 'Tom' }, 'Hello', '!')).toBe('Hello, Tom!')
  })

  it('myApply 用数组传递参数', () => {
    expect(myApply(greet, { name: 'Jerry' }, ['Hi', '~'])).toBe('Hi, Jerry~')
  })

  it('myBind 预绑定 this 与部分参数', () => {
    const bound = myBind(greet, { name: 'Tom' }, 'Hello')
    expect(bound('!')).toBe('Hello, Tom!')
  })

  it('临时属性不会污染目标对象', () => {
    const context = { name: 'Tom' }
    myCall(greet, context, 'Hello', '!')
    expect(Object.getOwnPropertySymbols(context)).toHaveLength(0)
  })
})

describe('new / instanceof', () => {
  interface Person {
    name: string
    greet(): string
  }
  type PersonConstructor = new (name: string) => Person

  // 手写 new 依赖 apply，用普通函数构造器演示；ES6 class 见下一个用例
  function Person(this: Person, name: string): void {
    this.name = name
  }
  Person.prototype.greet = function (this: Person): string {
    return `hi ${this.name}`
  }
  const PersonCtor = Person as unknown as PersonConstructor

  it('myNew 创建实例并执行构造函数', () => {
    const person = myNew(PersonCtor, 'Tom')

    expect(person).toBeInstanceOf(PersonCtor)
    expect(person.name).toBe('Tom')
    expect(person.greet()).toBe('hi Tom')
  })

  it('myNew 在构造函数返回对象时使用返回值', () => {
    function Factory(this: unknown): { replaced: true } {
      return { replaced: true }
    }
    const FactoryCtor = Factory as unknown as new () => { replaced: true }

    expect(myNew(FactoryCtor)).toEqual({ replaced: true })
  })

  it('ES6 class 无法被 apply 调用（手写 new 的经典局限）', () => {
    class Modern {
      constructor(public name: string) {}
    }

    expect(() => myNew(Modern, 'Tom')).toThrow(TypeError)
  })

  it('myInstanceOf 沿原型链查找', () => {
    const person = new PersonCtor('Tom')

    expect(myInstanceOf(person, PersonCtor)).toBe(true)
    expect(myInstanceOf([], Array)).toBe(true)
    expect(myInstanceOf({}, Array)).toBe(false)
    expect(myInstanceOf(null, Object)).toBe(false)
    expect(myInstanceOf(1, Number)).toBe(false)
  })
})

describe('curry', () => {
  it('支持任意分批传参', () => {
    const add3 = (a: number, b: number, c: number): number => a + b + c
    const curried = curry(add3)

    expect(curried(1)(2)(3)).toBe(6)
    expect(curried(1, 2)(3)).toBe(6)
    expect(curried(1)(2, 3)).toBe(6)
    expect(curried(1, 2, 3)).toBe(6)
  })
})

describe('compose / pipe', () => {
  const addOne = (value: number): number => value + 1
  const double = (value: number): number => value * 2

  it('compose 从右到左执行', () => {
    expect(compose(addOne, double)(3)).toBe(7)
  })

  it('pipe 从左到右执行', () => {
    expect(pipe(addOne, double)(3)).toBe(8)
  })
})

describe('flattenDeep', () => {
  it('递归展平任意深度数组', () => {
    const input = [1, [2, [3, [4]], 5]]
    expect(flattenDeep(input)).toEqual([1, 2, 3, 4, 5])
  })

  it('空数组返回空数组', () => {
    expect(flattenDeep([])).toEqual([])
  })
})
