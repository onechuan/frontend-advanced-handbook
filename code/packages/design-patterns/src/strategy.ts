/**
 * 策略模式：把可变的算法封装成独立函数/对象，运行时切换。
 * 这里以电商折扣为例；前端中的表单校验器、排序器也是典型场景。
 */
export type PriceStrategy = (price: number) => number

export const noDiscount: PriceStrategy = (price) => price

export const percentageOff = (rate: number): PriceStrategy => {
  if (rate < 0 || rate > 1) {
    throw new RangeError('rate must be between 0 and 1')
  }
  return (price) => price * (1 - rate)
}

export const fullReduction = (
  threshold: number,
  reduction: number,
): PriceStrategy => {
  if (threshold <= 0 || reduction < 0 || reduction > threshold) {
    throw new RangeError('invalid threshold or reduction')
  }
  return (price) => (price >= threshold ? price - reduction : price)
}

export class Checkout {
  constructor(private strategy: PriceStrategy = noDiscount) {}

  setStrategy(strategy: PriceStrategy): void {
    this.strategy = strategy
  }

  total(prices: readonly number[]): number {
    const sum = prices.reduce((acc, price) => acc + price, 0)
    return this.strategy(sum)
  }
}
