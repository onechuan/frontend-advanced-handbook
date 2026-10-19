/**
 * 事件总线：利用泛型 EventMap 约束事件名与回调参数，获得完整的类型提示。
 *
 * type Events = {
 *   login: [userId: string]
 *   logout: []
 * }
 */
export type EventMap = Record<string, unknown[]>
type Listener<Args extends unknown[]> = (...args: Args) => void

export class EventEmitter<Events extends EventMap = EventMap> {
  private listeners = new Map<keyof Events, Set<Listener<unknown[]>>>()

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener as Listener<unknown[]>)
    return () => this.off(event, listener)
  }

  once<K extends keyof Events>(
    event: K,
    listener: Listener<Events[K]>,
  ): () => void {
    const wrapper: Listener<Events[K]> = (...args) => {
      this.off(event, wrapper)
      listener(...args)
    }
    return this.on(event, wrapper)
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown[]>)
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    // 先复制再遍历：允许监听器在回调中增删自身
    for (const listener of [...set]) listener(...args)
  }

  removeAllListeners(event?: keyof Events): void {
    if (event === undefined) this.listeners.clear()
    else this.listeners.delete(event)
  }

  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0
  }
}
