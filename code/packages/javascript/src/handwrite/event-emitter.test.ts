import { describe, expect, it, vi } from 'vitest'
import { EventEmitter } from './event-emitter'

type Events = {
  login: [userId: string]
  logout: []
  message: [from: string, content: string]
}

describe('EventEmitter', () => {
  it('on / emit 传递类型安全的参数', () => {
    const emitter = new EventEmitter<Events>()
    const received: string[] = []

    emitter.on('login', (userId) => received.push(userId))
    emitter.emit('login', 'u1')

    expect(received).toEqual(['u1'])
  })

  it('once 只触发一次', () => {
    const emitter = new EventEmitter<Events>()
    const listener = vi.fn()

    emitter.once('logout', listener)
    emitter.emit('logout')
    emitter.emit('logout')

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('on 返回取消订阅函数', () => {
    const emitter = new EventEmitter<Events>()
    const listener = vi.fn()

    const off = emitter.on('message', listener)
    off()
    emitter.emit('message', 'a', 'b')

    expect(listener).not.toHaveBeenCalled()
  })

  it('回调中删除监听器不会影响本次遍历', () => {
    const emitter = new EventEmitter<Events>()
    const calls: string[] = []
    const first = (): void => {
      calls.push('first')
      emitter.off('logout', first)
    }
    const second = (): void => {
      calls.push('second')
    }

    emitter.on('logout', first)
    emitter.on('logout', second)
    emitter.emit('logout')

    expect(calls).toEqual(['first', 'second'])
    expect(emitter.listenerCount('logout')).toBe(1)
  })

  it('removeAllListeners 支持按事件与全部清理', () => {
    const emitter = new EventEmitter<Events>()
    emitter.on('login', () => {})
    emitter.on('logout', () => {})

    emitter.removeAllListeners('login')
    expect(emitter.listenerCount('login')).toBe(0)
    expect(emitter.listenerCount('logout')).toBe(1)

    emitter.removeAllListeners()
    expect(emitter.listenerCount('logout')).toBe(0)
  })
})
