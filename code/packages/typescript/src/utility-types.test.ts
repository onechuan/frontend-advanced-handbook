import { describe, expectTypeOf, it } from 'vitest'
import type {
  DeepPartial,
  DeepReadonly,
  MyExclude,
  MyExtract,
  MyNonNullable,
  MyOmit,
  MyParameters,
  MyPartial,
  MyPick,
  MyRecord,
  MyRequired,
  MyReturnType,
} from './utility-types'

interface User {
  id: number
  name: string
  age: number
}

interface Profile {
  user: {
    name: string
    address: { city: string; zip: string }
  }
  active: boolean
}

describe('utility types', () => {
  it('MyPartial / MyRequired', () => {
    expectTypeOf<MyPartial<User>>().toEqualTypeOf<{
      id?: number
      name?: string
      age?: number
    }>()
    expectTypeOf<MyRequired<MyPartial<User>>>().toEqualTypeOf<User>()
  })

  it('MyPick / MyOmit', () => {
    expectTypeOf<MyPick<User, 'id' | 'name'>>().toEqualTypeOf<{
      id: number
      name: string
    }>()
    expectTypeOf<MyOmit<User, 'age'>>().toEqualTypeOf<{
      id: number
      name: string
    }>()
  })

  it('MyRecord', () => {
    expectTypeOf<MyRecord<'a' | 'b', number>>().toEqualTypeOf<{
      a: number
      b: number
    }>()
  })

  it('MyExclude / MyExtract / MyNonNullable', () => {
    expectTypeOf<MyExclude<'a' | 'b' | 'c', 'a'>>().toEqualTypeOf<'b' | 'c'>()
    expectTypeOf<MyExtract<'a' | 'b' | 'c', 'a' | 'c'>>().toEqualTypeOf<'a' | 'c'>()
    expectTypeOf<MyNonNullable<string | null | undefined>>().toEqualTypeOf<string>()
  })

  it('MyReturnType / MyParameters', () => {
    expectTypeOf<MyReturnType<(a: number, b: string) => boolean>>().toEqualTypeOf<boolean>()
    expectTypeOf<MyParameters<(a: number, b: string) => void>>().toEqualTypeOf<
      [number, string]
    >()
  })

  it('DeepPartial 递归可选', () => {
    expectTypeOf<DeepPartial<Profile>>().toEqualTypeOf<{
      user?: {
        name?: string
        address?: { city?: string; zip?: string }
      }
      active?: boolean
    }>()
  })

  it('DeepReadonly 递归只读', () => {
    expectTypeOf<DeepReadonly<Profile>>().toEqualTypeOf<{
      readonly user: {
        readonly name: string
        readonly address: {
          readonly city: string
          readonly zip: string
        }
      }
      readonly active: boolean
    }>()
  })
})
