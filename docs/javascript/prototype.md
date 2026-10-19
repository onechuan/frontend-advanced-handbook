# 原型与原型链

## 一句话回答

每个对象都有一个内部属性 `[[Prototype]]` 指向另一个对象（原型）；访问属性时如果自身没有，就沿这条链向上查找，直到 `null`，这就是原型链。函数通过 `prototype` 属性决定实例的原型，从而实现继承。

## 三个关键概念

| 概念 | 归属 | 作用 |
| --- | --- | --- |
| `prototype` | 函数独有 | 作为 `new` 创建实例时使用的原型对象 |
| `__proto__` / `[[Prototype]]` | 所有对象 | 指向该对象的原型，决定属性查找路径 |
| `constructor` | 原型对象上 | 指回构造函数（可被覆盖，不能完全依赖） |

关系图：

```text
instance
  └── [[Prototype]] ──► Person.prototype
                          ├── constructor ──► Person
                          └── [[Prototype]] ──► Object.prototype
                                                  ├── constructor ──► Object
                                                  └── [[Prototype]] ──► null

Person ── [[Prototype]] ──► Function.prototype ──► Object.prototype ──► null
Person.prototype 是普通对象，它的 [[Prototype]] 是 Object.prototype
```

## 属性查找规则

```js
function Person(name) {
  this.name = name
}
Person.prototype.greet = function () {
  return `hi ${this.name}`
}

const person = new Person('Tom')

person.name            // 自身属性
person.greet()         // 原型上的方法
person.toString()      // Object.prototype 上的方法
person.hasOwnProperty('name')  // 只检查自身
'greet' in person      // 检查自身 + 原型链
```

- `Object.prototype.hasOwnProperty.call(obj, key)` 只判断自身属性。
- `Object.create(null)` 创建没有原型的对象，适合做纯字典，避免原型污染。
- `for...in` 会遍历可枚举的自有和继承属性；`Object.keys` 只返回自有可枚举属性。

## new 的执行过程

```js
function myNew(Ctor, ...args) {
  const instance = Object.create(Ctor.prototype)
  const result = Ctor.apply(instance, args)
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function')
  return isObject ? result : instance
}
```

1. 创建以 `Ctor.prototype` 为原型的对象。
2. 以该对象为 `this` 执行构造函数。
3. 如果构造函数返回引用类型，返回该值；否则返回新对象。

完整代码与测试见 [`new-and-instanceof.ts`](../../code/packages/javascript/src/handwrite/new-and-instanceof.ts)。

> 经典局限：ES6 class 不能被 `apply` 调用，必须用 `Reflect.construct` 或原生 `new`。面试时主动说明这一点是加分项。

## instanceof 的原理

```js
function myInstanceOf(value, ctor) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false
  let proto = Object.getPrototypeOf(value)
  while (proto !== null) {
    if (proto === ctor.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
```

`instanceof` 检查的是 `ctor.prototype` 是否出现在对象的原型链上，与构造函数本身是否参与创建无关。

## class 与原型的关系

```js
class Student extends Person {
  constructor(name, grade) {
    super(name)
    this.grade = grade
  }
}

// 等价的核心结构：
Student.prototype.__proto__ === Person.prototype
Student.__proto__ === Person            // 静态方法继承
new Student('Tom', 3) instanceof Person // true
```

- `class` 是语法糖，但更严格：不能直接调用、方法不可枚举、内部默认严格模式。
- 箭头函数没有 `prototype`，不能作为构造函数。
- `class` 中定义的实例方法在 `prototype` 上，箭头函数形式的类字段在实例上（每个实例一份）。

## 常用继承方式

| 方式 | 核心 | 问题 |
| --- | --- | --- |
| 原型链继承 | `Child.prototype = new Parent()` | 共享引用属性、无法传参 |
| 借用构造函数 | `Parent.call(this, ...)` | 方法无法复用 |
| 组合继承 | 前两者结合 | 父构造函数调用两次 |
| 寄生组合继承 | `Object.create(Parent.prototype)` + `Parent.call(this)` | 最经典的 ES5 方案 |
| class extends | 语法糖 | 最推荐 |

寄生组合继承：

```js
function Child(name) {
  Parent.call(this, name)
}
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child
```

## 高频追问

**1. `Function.prototype` 和 `Object.prototype` 的关系？**
`Function.prototype` 是函数，它的原型是 `Object.prototype`；`Function.__proto__ === Function.prototype`，这是 JS 中少数自指的引用。

**2. 修改原型会影响已有实例吗？**
会。已有实例沿原型链查找，原型对象上的属性变化立即可见；但如果实例自身已有同名属性，会遮蔽原型属性。

**3. 为什么不要扩展原生原型？**
污染全局、与第三方库冲突、可能影响 `for...in` 遍历，且不利于 Tree Shaking。

**4. 原型链过长有什么问题？**
查找成本增加、调试困难、容易误改共享状态。保持层级浅而清晰。

## 易错点

- `instanceof` 对原始值返回 `false`（`1 instanceof Number` 为 `false`）。
- 重写 `prototype` 会切断已有实例与原来原型的关系。
- `constructor` 只是一个普通属性，原型链改写后需要手动修复。
- `Object.create(null)` 的对象没有 `hasOwnProperty` 等方法。
- `Object.getPrototypeOf()` 是标准 API，`__proto__` 是历史遗留访问器。

## 延伸

- 深拷贝时用 `Object.create(Object.getPrototypeOf(obj))` 保留原型。
- 原型污染（prototype pollution）是常见安全问题。
- `Reflect.construct` 可以调用 class 构造器。
