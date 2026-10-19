import { describe, expect, it } from 'vitest'
import {
  Checkout,
  fullReduction,
  noDiscount,
  percentageOff,
} from './strategy'

describe('strategy', () => {
  it('默认不打折', () => {
    const checkout = new Checkout()
    expect(checkout.total([100, 50])).toBe(150)
  })

  it('运行时切换折扣策略', () => {
    const checkout = new Checkout(percentageOff(0.2))
    expect(checkout.total([100, 50])).toBe(120)

    checkout.setStrategy(fullReduction(100, 20))
    expect(checkout.total([100, 50])).toBe(130)

    checkout.setStrategy(noDiscount)
    expect(checkout.total([100, 50])).toBe(150)
  })

  it('满减未达到门槛时不减', () => {
    const checkout = new Checkout(fullReduction(100, 20))
    expect(checkout.total([60, 30])).toBe(90)
  })

  it('非法策略参数抛出异常', () => {
    expect(() => percentageOff(1.5)).toThrow(RangeError)
    expect(() => fullReduction(100, 200)).toThrow(RangeError)
  })
})
