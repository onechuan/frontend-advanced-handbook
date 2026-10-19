import { describe, expect, it } from 'vitest'
import { type Observer, Subject } from './observer'

describe('observer', () => {
  it('通知所有观察者', () => {
    const subject = new Subject<number>()
    const a: Observer<number> = { update: (value) => receivedA.push(value) }
    const b: Observer<number> = { update: (value) => receivedB.push(value) }
    const receivedA: number[] = []
    const receivedB: number[] = []

    subject.subscribe(a)
    subject.subscribe(b)
    subject.notify(1)

    expect(receivedA).toEqual([1])
    expect(receivedB).toEqual([1])
    expect(subject.observerCount).toBe(2)
  })

  it('取消订阅后不再收到通知', () => {
    const subject = new Subject<string>()
    const received: string[] = []
    const observer: Observer<string> = {
      update: (value) => received.push(value),
    }

    const unsubscribe = subject.subscribe(observer)
    subject.notify('first')
    unsubscribe()
    subject.notify('second')

    expect(received).toEqual(['first'])
    expect(subject.observerCount).toBe(0)
  })
})
