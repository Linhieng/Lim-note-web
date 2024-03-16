#

## [元编程]：代理和反射

反射和代理是一对双胞胎，代理支持的所以捕获器，都可以在反射上面找到。

代理可以让你定义陷阱（traps），用于捕获相关操作。但它仅仅只是捕获，它并不会为你提供捕获到的操作的原始行为。这个时候就可以使用反射了。反射提供的 api 和代理相同，通过反射调用的 api，和直接操作 target 没有什么不同。那我们为什么不直接操作 target 呢？还专门创建了一个反射？我的理解就是这就是为了方便开发。你想想，当你用代理捕获 get 行为时，如果你要直接操作 target，那么你编写的代码就是 return 一个 `target[property]`。这是简单的情况，因为你很清楚 get 代理的是获取属性这一行为，但如果你是代理一个 has 行为呢？是不是突然想不起来 has 代理的是什么行为了？这个时候如果有反射，那么你就直接调用 Reflect.has。也正是因为有了这个反射，所以你代理一个对象时，你需要编写 get，而不需要再次实现 set 等操作，因为这些操作内部都帮你调用了 Reflect。

此外，反射还可以帮你将抛出错误转换为 false，比如下面案例：

不使用反射时：

```js
const obj = Object.defineProperty({}, 'foo', {
    value: 'bar',
    configurable: false
})

try {
    // 定义一个属性时，可能抛出错误，所以我们需要使用 try-catch
    Object.defineProperty(obj, 'foo', {value: 'baz'})
    console.log('success')
} catch (error) {
    console.log('failure')
}
```

使用反射重构上面代码：

```js
const obj = Object.defineProperty({}, 'foo', {
    value: 'bar',
    configurable: false
})

if (Reflect.defineProperty(obj, 'foo', {value: 'baz'})) {
    console.log('success')
} else {
    console.log('failure')
}
```

可以看到，比起 trycatch，反射可以让我们简单的使用 if else，这不是更方便吗？

### api 参考

只对应 Object.* 和 Reflect.* 的：
- [handler.setPrototypeOf()]
    - 拦截 [Object.setPrototypeOf()]
    - 拦截 [Reflect.setPrototypeOf()]
- [handler.isExtensible()]
    - 拦截 [Object.isExtensible()]
    - 拦截 [Reflect.isExtensible()]
- [handler.preventExtensions()]
    - 拦截 [Object.preventExtensions()]
    - 拦截 [Reflect.preventExtensions()]
- [handler.getOwnPropertyDescriptor()]
    - 拦截 [Object.getOwnPropertyDescriptor()]
    - 拦截 [Reflect.getOwnPropertyDescriptor()]
- [handler.defineProperty()]
    - 拦截 [Object.defineProperty()]
    - 拦截 [Reflect.defineProperty()]

- [handler.get()]
  - 拦截 `proxy[foo]` 括号表示法（bracket notation）访问属性
  - 拦截 `proxy.bar` 点表示法（dot notation）访问属性
  - 拦截 `Object.create(proxy)[foo]` 通过原型链访问属性
  - 拦截 [Reflect.get()]

- [handler.set()]
  - 拦截 `proxy[foo] = bar`
  - 拦截 `proxy.foo = bar`
  - 拦截 `Object.create(proxy)[foo] = bar`
  - 拦截 [Reflect.set()]

- [handler.has()]
  - 拦截 `foo in proxy`
  - 拦截 `foo in Object.create(proxy)`
  - 拦截 [Reflect.has()]

- [handler.getPrototypeOf()]
  - 拦截 [Object.getPrototypeOf()]
  - 拦截 [Reflect.getPrototypeOf()]
  - 拦截 [`__proto__`]
  - 拦截 [Object.prototype.isPrototypeOf()]
  - 拦截 [instanceof]
  - 拦截 [Reflect.getPrototypeOf()]

- [handler.deleteProperty()]
  - 拦截 `delete proxy[foo]`
  - 拦截 `delete proxy.foo`
  - 拦截 [Reflect.deleteProperty()]
  - 拦截 [Reflect.deleteProperty()]

- [handler.ownKeys()]
  - 返回一个数组，数组中的元素只能是 string 或 symbol 类型
  - 必须包含 target 中的所以 **不可配置** 的 **自有属性**
  - 如果 target 对象不可扩展，则必须包含所有 **自有属性**
  - 拦截 [Object.getOwnPropertyNames()]
  - 拦截 [Object.getOwnPropertySymbols()]
  - 拦截 [Object.keys()]
  - 拦截 [Reflect.ownKeys()]
  - 拦截 [Reflect.ownKeys()]

- [handler.apply()]
  - 拦截 [proxy(..args)]
  - 拦截 [Function.prototype.apply()]
  - 拦截 [Function.prototype.call()]
  - 拦截 [Reflect.apply()]
  - 拦截 [Reflect.apply()]

- [handler.construct()]
  - 拦截 `new proxy(...args)`
  - 拦截 [Reflect.construct()]
  - 拦截 [Reflect.construct()]



get 案例

```js
const rawObj = {
    foo: 'bar'
}
const proxyObj = new Proxy(rawObj, {
    get() {
        return 'handler override'
    }
})

console.log(rawObj.foo) // bar
console.log(proxyObj.foo) // handler override
console.log(rawObj['foo']) // bar
console.log(proxyObj['foo']) // handler override
console.log(Object.create(rawObj)['foo']) // bar
console.log(Object.create(proxyObj)['foo']) // handler override
```

案例二：

```js

const obj = {}
const e = Symbol('a symbol')
Object.defineProperty(obj, 'a', { configurable: true })
Object.defineProperty(obj, 'b', { enumerable: true })
Object.defineProperty(obj, 'c', { value: true })
Object.defineProperty(obj, 'd', { writable: true })
Object.defineProperty(obj, e, {})
const proxy = new Proxy(obj, {
    ownKeys(target) {
        // return Reflect.ownKeys(target)
        return ['b', 'c', 'd', e, 'other'] // 至少要前面四个属性，不能会报错。多余的参数不会报错
    }
})
for (let key in proxy) {
    console.log(key) // 只输出 'b' 因为只有 b 是可枚举的
}
console.log(Reflect.ownKeys(obj))   // [ 'a', 'b', 'c', 'd', Symbol(a symbol) ]
console.log(Reflect.ownKeys(proxy)) // [      'b', 'c', 'd', Symbol(a symbol) ]
console.log(Object.keys(proxy))     // [ 'b' ]
console.log(Object.getOwnPropertyNames(proxy)) // [ 'b', 'c', 'd', 'other' ]
console.log(Object.getOwnPropertySymbols(proxy)) // [ Symbol(a symbol) ]

```

---
[元编程]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming


[handler.getPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getPrototypeOf
[handler.setPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/setPrototypeOf
[handler.isExtensible()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/isExtensible
[handler.preventExtensions()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/preventExtensions
[handler.getOwnPropertyDescriptor()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor
[handler.defineProperty()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/defineProperty
[handler.has()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/has
[handler.get()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
[handler.set()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/set
[handler.deleteProperty()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/deleteProperty
[handler.ownKeys()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/ownKeys
[handler.apply()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/apply
[handler.construct()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/construct

[Reflect.setPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/setPrototypeOf
[Reflect.isExtensible()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/isExtensible
[Reflect.preventExtensions()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/preventExtensions
[Reflect.getOwnPropertyDescriptor()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/getOwnPropertyDescriptor
[Reflect.defineProperty()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/defineProperty
[Reflect.construct()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/construct
[Reflect.getPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/getPrototypeOf
[Reflect.deleteProperty()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/deleteProperty
[Reflect.has()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/has
[Reflect.get()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/get
[Reflect.set()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/set
[Reflect.apply()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/apply
[Reflect.ownKeys()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys


[Object.setPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
[Object.isExtensible()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible
[Object.preventExtensions()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions
[Object.getOwnPropertyDescriptor()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
[Object.defineProperty()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
[Object.getPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
[Object.getOwnPropertyNames()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
[Object.getOwnPropertySymbols()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols
[Object.keys()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
[Object.prototype.isPrototypeOf()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf


[Function.prototype.apply()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
[Function.prototype.call()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
[`__proto__`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
[instanceof]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
[TypeError]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[Symbol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol

[Property query]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#property_query
[Property access]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#property_access
[Property assignment]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#property_assignment
[Property deletion]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#property_deletion
[Inherited property quer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#inherited_property_query
[Inherited property acces]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#inherited_property_access
[Inherited property assignmen]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming#inherited_property_assignment
