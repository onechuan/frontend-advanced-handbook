/**
 * 观察者模式：Subject 维护观察者列表，状态变化时统一通知。
 * 前端中的典型应用：事件总线、状态管理订阅、RxJS 的 Observable。
 */
export interface Observer<T> {
  update(value: T): void
}

export class Subject<T> {
  private observers = new Set<Observer<T>>()

  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer)
    return () => this.unsubscribe(observer)
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers.delete(observer)
  }

  notify(value: T): void {
    // 复制一份，允许观察者在回调中取消订阅
    for (const observer of [...this.observers]) observer.update(value)
  }

  get observerCount(): number {
    return this.observers.size
  }
}
