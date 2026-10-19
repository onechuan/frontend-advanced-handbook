import { describe, expectTypeOf, it } from 'vitest'
import type {
  Concat,
  First,
  Last,
  MyAwaited,
  Pop,
  Push,
  StringToUnion,
  TupleLength,
  TupleToObject,
} from './type-challenges'

describe('type challenges', () => {
  it('First / Last / TupleLength', () => {
    expectTypeOf<First<[1, 2, 3]>>().toEqualTypeOf<1>()
    expectTypeOf<First<[]>>().toEqualTypeOf<never>()
    expectTypeOf<Last<[1, 2, 3]>>().toEqualTypeOf<3>()
    expectTypeOf<TupleLength<[1, 2, 3]>>().toEqualTypeOf<3>()
  })

  it('Concat / Push / Pop', () => {
    expectTypeOf<Concat<[1, 2], [3, 4]>>().toEqualTypeOf<[1, 2, 3, 4]>()
    expectTypeOf<Push<[1, 2], 3>>().toEqualTypeOf<[1, 2, 3]>()
    expectTypeOf<Pop<[1, 2, 3]>>().toEqualTypeOf<[1, 2]>()
  })

  it('TupleToObject', () => {
    expectTypeOf<TupleToObject<['a', 'b']>>().toEqualTypeOf<{ a: 'a'; b: 'b' }>()
  })

  it('StringToUnion', () => {
    expectTypeOf<StringToUnion<'abc'>>().toEqualTypeOf<'a' | 'b' | 'c'>()
  })

  it('MyAwaited 递归解包', () => {
    expectTypeOf<MyAwaited<Promise<number>>>().toEqualTypeOf<number>()
    expectTypeOf<MyAwaited<Promise<Promise<string>>>>().toEqualTypeOf<string>()
    expectTypeOf<MyAwaited<boolean>>().toEqualTypeOf<boolean>()
  })
})
