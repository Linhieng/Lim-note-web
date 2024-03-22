# ES 版本历史

内容摘录自 [w3schools](https://www.w3schools.com/js/js_versions.asp)。
写在这里仅做复习参考

## ES5 (2009) 新特性

- "use strict"
- 字符串
  - String[number] access
  - Multiline strings
  - trim()
- 数组
  - Array.isArray()
  - forEach()
  - map()
  - filter()
  - reduce()
  - reduceRight()
  - every()
  - some()
  - indexOf()
  - lastIndexOf()
- JSON
  - JSON.parse()
  - JSON.stringify()
- Date
  - Date.now()
  - toISOString()
  - toJSON()
- 对象
  - Property getters and setters.
  - Reserved words as property names
  -
  - Object.create(parent, donor)
  - Object.defineProperty(object, property, descriptor)
  - Object.defineProperties(object, descriptors)
  - Object.getOwnPropertyDescriptor(object, property)
  - Object.getOwnPropertyNames(object)
  - Object.getPrototypeOf(object)
  - Object.keys(object)
  -
  - Object.preventExtensions(object)
  - Object.isExtensible(object)
  - Object.seal(object)
  - Object.isSealed(object)
  - Object.freeze(object)
  - Object.isFrozen(object)
- Function bind()
- Trailing commas
  - ES5 allows trailing commas in object and array definitions.

对象描述符（descriptor）
- value
- writable
- enumerable
- configurable

## ES6 (2015) 新特性

- 变量声明关键字
  - The let keyword
  - The const keyword
- Arrow Functions
  - 箭头函数内的 this 永远保持为闭合词法上下文的值
- The Spread (...) Operator
- for..of
  - 注意，for..in 在 ES1 (1997) 的时候就出现了
- Map Objects 和 Set Objects
  - Map 最重要的特性就是支持将对象作为 key
- Classes 注意 js 中的类不是对象，而是对象的模版
- Promises
- Symbol
- Default Parameters 支持函数定义默认参数值
- Function Rest Parameter 函数参数支持使用 ... 获取剩余参数
- 字符串
  - String.includes()
  - String.startsWith()
  - String.endsWith()
- 数组
  - Array.from()
  - Array.of()
  - keys()
  - find()
  - findIndex()
  - entries()
- New Math Methods
  - Math.trunc()
  - Math.sign()
  - Math.cbrt()
  - Math.log2()
  - Math.log10()
- New Number Properties
  - Number.EPSILON
  - Number.MIN_SAFE_INTEGER
  - Number.MAX_SAFE_INTEGER
- New Number Methods
  - Number.isInteger()
  - Number.isSafeInteger() 范围是 `1 - 2**53` 到 `2**53 - 1` （均包含）
- New Global Methods
  - isFinite()
  - isNaN()
- JavaScript Modules 浏览器支持模块

## ES 2016 新特性

- JavaScript Exponentiation (**)
- JavaScript Exponentiation assignment (**=)
- JavaScript Array includes()

## ES 2017 新特性

- 字符串
  - padStart()
  - padEnd()
- 对象
  - Object.entries()
    - 可以更方便的转换对象为 Map。`new Map(Object.entries(obj))`
  - Object.values()
  - Object.getOwnPropertyDescriptors
- async 和 await
- Trailing Commas in Functions

## ES 2018 新特性

- Asynchronous Iteration
- Promise.prototype.finally()
- 支持对象结构赋值 `const {x, y, z} = {x:1, y:2, z:3}`
- New RegExp Features
  - Unicode Property Escapes (`\p{...}`)
  - Lookbehind Assertions (`?<=` ) and (`?<!` )
  - Named Capture Groups
  - `s` (dotAll) Flag
- 新增内置对象 SharedArrayBuffer

## ES 2019

- 字符串
  - trimStart()
  - trimEnd()
- 对象
  - Object.fromEntries()
- try catch 中支持省略参数
  - 之前 `try {} catch (err) {}`
  - 现在 `try {} catch {}`
- 数组
  - flat()
  - flatMap()
  - 修改 sort() 为稳定排序
- 修正 JSON.stringify()，让其支持 U+D800 to U+DFFF 访问内的字符
  - 比如 `JSON.stringify(['\u26D4'])` 能正确解析 ⛔ 字符，而不是乱码
- 修正 `\u2028` 和 `\u2029` 的错误。在此之前，代码 `let text = "\u2028"` 会被认为是终结符而导致报错
- 修正函数的 toString() 方法，规定所有浏览器都应该访问原始代码文本，包括空白符和注释。

## ES2020

- 新增基础类型 BigInt
- 字符串
  - matchAll()
- The Nullish Coalescing Operator (`??`)
  - 只将 null 和 undefined 识别为假，false, 0, NaN 等都视为真
- The Optional Chaining Operator (?.)
- Logical AND Assignment Operator (`&&=`)
  - a &&= b 如果 a 为真值，则将 b 赋给 a
- Logical OR Assignment Operator (`||=`)
  - a ||= b 如果 a 为假值，则将 b 赋给 a
- Nullish Coalescing Assignment Operator (`??=`)
  - a ??= b 如果 a 为 null/undefined，则将 b 赋给 a
- 添加 Promise.allSettled() 函数

对 Promise.allSettled 和 all 的对比案例

```js
const p1 = () => new Promise((resolve, reject) => { setTimeout(resolve, 1000, 'success') })
const p2 = () => new Promise((resolve, reject) => { setTimeout(reject, 1000, 'failure') })
const arr = [p1(), p2()]
Promise.allSettled(arr).then(val => {
    console.log(val)
    // [
    //      { status: 'fulfilled', value: 'success' },
    //      { status: 'rejected', reason: 'failure' }
    // ]
})

// 如果使用 all，由于其中一个异步任务返回 reject，所以最终会报错
Promise.all(arr).then(val => {
    console.log(val)
}).catch(reason => {
    console.log(reason)
    // 只输出 failure
})

```


## ES2021

- 新增 Promise.any()
  - 只返回第一个兑现的值。如果全部都被拒绝，则也返回拒绝
- 新增 String.prototype.replaceAll()
- 新增 JavaScript Numeric Separator (_)
  - 注意只能用于中间，比如 `1_000_000_000`

```js
const p1 = () => new Promise((resolve, reject) => { setTimeout(reject, 1000, 'failure1') })
const p2 = () => new Promise((resolve, reject) => { setTimeout(reject, 1000, 'failure2') })
Promise.any([p1(), p2()])
    .then(res => console.log(res))
    .catch(reasons => console.log(reasons.errors))
    // [ 'failure1', 'failure2' ]
```

## ES2022

- 数组
  - at() 用于实现负数反向索引
- 字符串
  - at()
- 正则 `d` 标识
- 对象
  - Object.hasOwn()
- 支持 Error Cause
- 支持 await import
- 类
  - 支持 Class Field Declarations
  - 支持 Private Methods and Fields。使用 `#` 前缀标识

## ES2023

- 数组
  - findLast()
  - findLastIndex()
  - toReversed() 返回新数组，而不修改原数组
  - toSorted() 返回新数组，而不修改原数组
  - toSpliced() 返回新数组，而不修改原数组
    - splice 早在 chrome 1 就支持
- `#!/usr/bin/env node`
