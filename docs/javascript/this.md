# this 绑定规则

## 一句话回答

`this` 的值在**函数调用时**确定，取决于调用方式，而不是定义位置；箭头函数没有自己的 `this`，取定义时外层作用域的 `this`。

## 五条规则与优先级

优先级从高到低：

```text
new 绑定  >  显式绑定（call/apply/bind）  >  隐式绑定（obj.fn()）  >  默认绑定
箭头函数不参与以上规则，直接取词法作用域的 this
```

### 1. 默认绑定

```js
function show() {
  console.log(this)
}

show() // 非严格模式：globalThis；严格模式/ESM：undefined
```

注意：ES Module 默认严格模式。

### 2. 隐式绑定

```js
const user = {
  name: 'Tom',
  greet() {
    console.log(this.name)
  },
}

user.greet() // Tom

const fn = user.greet
fn() // 非严格模式下 this 是 globalThis，输出 undefined；严格模式会报错
```

`this` 绑定的是**调用时**点号左边的对象。把方法拆出来单独调用，绑定就丢了。

### 3. 显式绑定

```js
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

greet.call({ name: 'Tom' }, 'Hello', '!')
greet.apply({ name: 'Tom' }, ['Hello', '!'])
const bound = greet.bind({ name: 'Tom' }, 'Hello')
bound('!')
```

- `call` 参数逐个传，`apply` 用数组。
- `bind` 返回新函数，不立即执行，支持预绑定部分参数（偏函数）。
- `bind` 的绑定无法再被 `call`/`apply` 覆盖。

手写实现：[`call-apply-bind.ts`](../../code/packages/javascript/src/handwrite/call-apply-bind.ts)

### 4. new 绑定

```js
function Person(name) {
  this.name = name
}
const person = new Person('Tom') // this 指向新创建的实例
```

如果 `bind` 后的函数被 `new` 调用，绑定的 `this` 会被忽略，但预绑定的参数仍然生效。

### 5. 箭头函数

```js
const obj = {
  name: 'Tom',
  greet: () => {
    console.log(this.name)
  },
}
obj.greet() // undefined（外层是模块作用域，this 为 undefined）
```

箭头函数：

- 没有自己的 `this`、`arguments`、`super`、`new.target`。
- 不能作为构造函数，不能 `call`/`apply`/`bind` 改变 `this`。
- 适合回调、定时器、数组方法中保留外层 `this`。

## 高频输出题

```js
const obj = {
  name: 'obj',
  regular() {
    console.log(this.name)
  },
  arrow: () => {
    console.log(this.name)
  },
  nested() {
    setTimeout(function () {
      console.log(this.name) // undefined（默认绑定）
    }, 0)
    setTimeout(() => {
      console.log(this.name) // obj（词法作用域）
    }, 0)
  },
}

obj.regular() // obj
obj.arrow()   // undefined
obj.nested()  // undefined, obj
```

## 绑定丢失的三种典型场景

```js
// 1. 回调
button.addEventListener('click', obj.handle) // 丢失

// 2. 定时器
setTimeout(obj.handle, 1000) // 丢失

// 3. 解构
const { handle } = obj
handle() // 丢失
```

修复方式：

```js
button.addEventListener('click', obj.handle.bind(obj))
button.addEventListener('click', () => obj.handle())
const handle = obj.handle.bind(obj)
```

或者在定义时就用类字段箭头函数：

```js
class Counter {
  count = 0
  increment = () => {
    this.count += 1
  }
}
```

## 高频追问

**1. `call` 和 `apply` 的区别？**
只是参数形式不同，性能差异可以忽略；现代引擎对两者优化接近。

**2. 手写 bind 要注意什么？**
保留预绑定参数、返回值、`new` 调用时忽略绑定的 `this`、支持原型继承（`Object.setPrototypeOf`）以及函数 `length`/`name`（高阶要求）。

**3. 如何判断 this？**
看调用表达式：`new` → 新对象；`.call/.apply/.bind` → 指定对象；`obj.fn()` → `obj`；裸调用 → 严格模式 `undefined`，否则全局对象；箭头函数 → 向外找。

**4. 类的方法可以解构使用吗？**
不可以，会丢失 `this`；解决办法是箭头函数字段或手动 `bind`。

## 易错点

- `this` 与词法作用域不是一回事：普通函数的 `this` 是动态的，变量查找是词法的。
- `obj.fn()()` 只对 `fn` 做了隐式绑定，第二次调用时 `this` 丢失。
- `bind` 多次调用只认第一次绑定的 `this`。
- 箭头函数的 `this` 在定义时确定，之后无法改变。
- 事件处理器、Promise 回调、`forEach` 回调中的 `this` 要特别注意。

## 延伸

- `Function.prototype.call` 的内部实现依赖对象临时属性。
- 严格模式影响默认绑定。
- Vue 2 的 methods 自动绑定、React class 组件需要手动 bind，都是这个知识点的工程体现。
