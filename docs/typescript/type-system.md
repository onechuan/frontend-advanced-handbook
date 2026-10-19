# TypeScript 类型系统

> 配套代码：[utility-types.ts](../../code/packages/typescript/src/utility-types.ts)、[type-challenges.ts](../../code/packages/typescript/src/type-challenges.ts)

## 一句话回答

TypeScript 是 JavaScript 的**静态类型超集**，采用**结构化类型系统**：只要结构兼容就视为可赋值，类型检查发生在编译期，运行时类型信息会被擦除。

## 结构化类型

```ts
interface Point {
  x: number
  y: number
}

function printPoint(point: Point) {
  console.log(point.x, point.y)
}

// 不要求显式 implements，只要有 x/y 就行
printPoint({ x: 1, y: 2 })

const named = { x: 1, y: 2, label: 'origin' }
printPoint(named) // 允许：额外属性不参与兼容性判断
```

与 nominal typing（Java/C#）不同，TS 看的是形状。例外：`class` 的 `private`/`protected` 成员会带来名义性。

## type 与 interface

| 维度 | type | interface |
| --- | --- | --- |
| 对象类型 | ✅ | ✅ |
| 联合 / 交叉 / 条件 / 映射 | ✅ | ❌ |
| 声明合并 | ❌ | ✅ |
| 扩展 | `&` | `extends` |
| 推荐 | 工具类型、联合、函数 | 公共对象契约、库 API |

两者在对象结构上大多可互换，团队统一即可。

## 特殊类型

```ts
let a: any          // 关闭检查，能赋值给任何类型
let b: unknown      // 安全，使用前必须收窄
let c: never        // 不可能的值，是所有类型的子类型
let d: void         // 函数无返回值

function fail(message: string): never {
  throw new Error(message)
}

function assertNever(value: never): never {
  throw new Error(`unexpected: ${String(value)}`)
}
```

`never` 的经典用途：可辨识联合的穷尽检查。

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.size ** 2
    default:
      return assertNever(shape) // 新增成员时会在这里报错
  }
}
```

## 泛型

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

// 约束
function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 默认值
interface Box<T = string> {
  value: T
}
```

泛型让类型关系在调用点被推断，而不是写死。常见追问：**泛型与 `any` 的区别？** 泛型保留类型信息并建立输入输出关系，`any` 直接放弃检查。

## 条件类型与 infer

```ts
type IsArray<T> = T extends unknown[] ? true : false

type ElementType<T> = T extends (infer U)[] ? U : never

type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never
```

`infer` 在 `extends` 子句中声明一个待推断的类型变量，常见于函数返回值、Promise、元组、模板字面量。

## 分布式条件类型

当条件类型作用于**裸类型参数**且传入联合类型时，会对每个成员分别求值再合并：

```ts
type ToArray<T> = T extends unknown ? T[] : never

type A = ToArray<string | number> // string[] | number[]
```

不想分布式时：

```ts
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never
type B = ToArrayNonDist<string | number> // (string | number)[]
```

这也是 `Exclude` / `Extract` 的实现基础：

```ts
type MyExclude<T, U> = T extends U ? never : T
```

## 映射类型与键重映射

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

// 移除可选 / readonly
type Concrete<T> = { [K in keyof T]-?: T[K] }

// as 重命名键
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
```

- 同态映射（`[K in keyof T]`）会自动保留数组/元组结构。
- `as` 子句可以把键映射为 `never` 来过滤属性。

```ts
type RemoveKind<T> = {
  [K in keyof T as K extends 'kind' ? never : K]: T[K]
}
```

## 模板字面量类型

```ts
type EventName = `on${Capitalize<'click' | 'focus'>}`
// 'onClick' | 'onFocus'

type StringToUnion<S extends string> = S extends `${infer First}${infer Rest}`
  ? First | StringToUnion<Rest>
  : never

type Chars = StringToUnion<'abc'> // 'a' | 'b' | 'c'
```

常见应用：路由参数解析、CSS 属性名、事件名约束、ORM 表名到实体类型映射。

## 协变与逆变

```ts
type Animal = { name: string }
type Dog = Animal & { bark(): void }

let animal: Animal = { name: 'a' }
let dog: Dog = { name: 'd', bark() {} }

animal = dog // ✅ 协变：Dog 可以赋给 Animal
// dog = animal // ❌

// 函数参数逆变：参数类型更宽的可以赋给更窄的
type Handler<T> = (value: T) => void
let animalHandler: Handler<Animal> = (a) => a.name
let dogHandler: Handler<Dog> = animalHandler // ✅ 参数逆变
```

`strictFunctionTypes` 下函数参数按逆变检查；方法是双变（bivariant）。协变/逆变可以用 `in`/`out` 显式标注（TS 4.7+ 支持方差注解）。

## 内置工具类型速查

| 工具类型 | 作用 | 原理 |
| --- | --- | --- |
| `Partial<T>` | 全部可选 | 映射 + `?` |
| `Required<T>` | 全部必选 | 映射 + `-?` |
| `Readonly<T>` | 全部只读 | 映射 + `readonly` |
| `Pick<T, K>` | 选取键 | 映射 + `K` |
| `Omit<T, K>` | 排除键 | `Pick` + `Exclude` |
| `Record<K, V>` | 构造对象 | 映射 |
| `Exclude<T, U>` | 从联合中排除 | 分布式条件类型 |
| `Extract<T, U>` | 从联合中提取 | 分布式条件类型 |
| `NonNullable<T>` | 去除 null/undefined | 条件类型 |
| `ReturnType<T>` | 函数返回值 | `infer` |
| `Parameters<T>` | 函数参数元组 | `infer` |
| `Awaited<T>` | 递归解包 Promise | 条件类型 + `infer` + 递归 |

手写版本见 [utility-types.ts](../../code/packages/typescript/src/utility-types.ts)。

## 类型守卫

```ts
// typeof
function pad(value: string | number) {
  if (typeof value === 'number') return value.toFixed(2)
  return value.padStart(2, '0')
}

// 自定义守卫
interface User { name: string }

function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'name' in value
}

// 断言函数
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new Error('not a string')
}
```

## 面试高频问题

**1. interface 和 type 怎么选？**
需要联合、条件、映射等类型运算用 `type`；对外暴露可扩展的对象契约用 `interface`。二者性能差异可以忽略。

**2. `any` 和 `unknown` 的区别？**
`any` 不做检查、能赋给任何类型；`unknown` 只能赋给 `unknown`/`any`，使用前必须收窄。优先 `unknown`。

**3. `never` 有什么用？**
表示不可能的值；用于穷尽检查、过滤联合类型、标记总是抛错的函数。

**4. 类型会在运行时存在吗？**
不会。接口、类型别名、泛型都会被擦除；需要运行时校验时用 Zod、io-ts 或手写守卫。

**5. `satisfies` 有什么价值？**
既校验值符合类型，又保留更精确的推断（如字面量类型）：

```ts
const routes = {
  home: '/',
  user: '/user/:id',
} satisfies Record<string, string>

// routes.home 的类型是 '/'，而不是 string
```

**6. 泛型约束与默认值？**
`<T extends object = {}>`；约束保证可访问的属性，默认值减少调用方负担。

## 易错点

- 类型断言 `as` 不会做运行时转换。
- 对象字面量的多余属性检查只在直接赋值时触发。
- 可选属性与 `undefined` 联合不同（`exactOptionalPropertyTypes` 下更严格）。
- 数组的 `readonly` 是浅层的。
- 条件类型中的分布式行为只对裸类型参数生效。
- `enum` 常量枚举会内联，普通枚举有运行时对象。

## 延伸

- type-challenges 刷题路线：easy → medium → hard。
- `tsc --noEmit` 与增量编译。
- 声明文件 `.d.ts` 与模块扩充。
- 类型体操在库开发中的应用（如路由、表单、ORM）。
