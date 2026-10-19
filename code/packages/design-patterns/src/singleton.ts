/**
 * 单例模式：私有构造函数 + 静态实例，保证全局唯一。
 */
export class ConfigStore {
  private static instance: ConfigStore | undefined
  private readonly values = new Map<string, string>()

  private constructor() {}

  static getInstance(): ConfigStore {
    ConfigStore.instance ??= new ConfigStore()
    return ConfigStore.instance
  }

  set(key: string, value: string): this {
    this.values.set(key, value)
    return this
  }

  get(key: string): string | undefined {
    return this.values.get(key)
  }
}
