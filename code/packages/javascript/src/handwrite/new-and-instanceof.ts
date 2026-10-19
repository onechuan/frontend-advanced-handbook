/**
 * 手写 new 与 instanceof。
 * 文档：docs/javascript/prototype.md（原型链）
 */

/**
 * new 做了四件事：
 * 1. 创建一个以构造函数 prototype 为原型的对象
 * 2. 以该对象为 this 执行构造函数
 * 3. 若构造函数返回引用类型，则返回该值；否则返回新对象
 *
 * 注意：这是面试标准写法，构造函数必须是可调用的普通函数。
 * ES6 class 的 [[Construct]] 无法通过 apply 触发，直接调用会抛
 * "Class constructor xxx cannot be invoked without 'new'"，
 * 想兼容 class 需要 Reflect.construct。
 */
export function myNew<T extends abstract new (...args: any[]) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  const instance = Object.create(Ctor.prototype) as InstanceType<T>
  const result = (
    Ctor as unknown as (...args: unknown[]) => unknown
  ).apply(instance, args)
  const isObjectResult =
    result !== null && (typeof result === 'object' || typeof result === 'function')
  return (isObjectResult ? result : instance) as InstanceType<T>
}

/**
 * instanceof 沿原型链向上查找，判断 ctor.prototype 是否出现在其中。
 * 原始值返回 false；函数本身的原型链也可以被检测。
 */
export function myInstanceOf(
  value: unknown,
  ctor: abstract new (...args: any[]) => unknown,
): boolean {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return false
  }
  const target = ctor.prototype
  let proto = Object.getPrototypeOf(value)
  while (proto !== null) {
    if (proto === target) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
