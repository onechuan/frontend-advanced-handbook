import { describe, expect, it } from 'vitest'
import { ConfigStore } from './singleton'

describe('singleton', () => {
  it('始终返回同一个实例并共享状态', () => {
    const first = ConfigStore.getInstance()
    const second = ConfigStore.getInstance()

    expect(first).toBe(second)

    first.set('locale', 'zh-CN')
    expect(second.get('locale')).toBe('zh-CN')
  })
})
