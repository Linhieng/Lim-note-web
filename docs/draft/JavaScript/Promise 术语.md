本文的 Promise 中文术语来自 [Promise - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) ，术语解释依据来自 MDN 文档推荐的 [Let's talk about how to talk about promises](https://thenewtoys.dev/blog/2021/02/08/lets-talk-about-how-to-talk-about-promises/) 参考文章。

本文将介绍 Promise 的以下术语:
- **待定(pending)**
- **兑现(fulfilled)**
- **兑现值(fulfillment value)**
- **拒绝(rejected)**
- **拒绝理由(rejection reason)**
- **敲定(settled)**
- **解决(resolve)**
- **锁定(locked in)**

本文仅介绍这些术语，不会介绍 Promise 的基本使用。

## 🍕 Promise 状态

一个 Promise 对象只可能有三种状态, 并且这三种状态是互斥的:
- **待定** ，这是大部分 Promise 对象的初始状态。
- 已 **兑现** ，此时的 Promise 对象会传递一个 **兑现值** 给 `then()`。
- 已 **拒绝** ，此时的 Promise 对象会传递一个 **拒绝理由** 给 `catch()`。

这几个术语是 Promise 的基础，而且也是很好懂的。示例代码如下（运行在浏览器环境下）：

```js
const pendingPromise = new Promise(resolve => {})
console.log(pendingPromise) // 输出： Promise {<pending>}
```
```js
const fulfillPromise = new Promise(resolve => {resolve('兑现值')})
console.log(fulfillPromise) // 输出： Promise {<fulfilled>: '兑现值'}
```
```js
const rejectPromise = new Promise((resolve, reject) => {reject('拒绝理由')})
console.log(rejectPromise) // 输出： Promise {<rejected>: '拒绝理由'}
rejectPromise.catch((reason)=>{console.error(reason)}) // 被拒绝的 Promise 对象, 会抛出错误, 需要通过 catch() 获取
```

## 🍕 *敲定(settled)*

当一个 Promise 对象的状态是已 **兑现** 或者 已 **拒绝** 时, 我们称呼该 Promise 已经被 **敲定**。

## 🍕 *解决(resolve)*

**解决** 这个术语最开始是来自 [Promises/A+ 规范](https://promisesaplus.com/#the-promise-resolution-procedure)。 在规范中它表示一个抽象的操作。

**解决** 一个 Promise 对象有下面三种方式：
- 通过调用 `new Promise()` 中提供的 `resolve()` 方法。
- 通过调用 `Promise.resolve()` 创建一个已经 **解决** 的 Promise 对象。
- 在 promise 机制控制的回调函数中 `return` 一个值（没有 `return` 时该值默认是 `undefined`）。

> 备注：所谓 promise 机制控制的回调函数，指的是该回调函数什么时候能执行是由 promise 机制控制的，典型的有 `then()` 中的回调函数。

## 🍕 *锁定(locked in)*

当 Promise A 对象 与 Promise B 对象 **锁定** 时（英文为： resolve A to B ），遵循下面规则：
- 当 Promise B 对象被 **兑现** （或者已经是被 **兑现** ）时， Promise A 也会被 **兑现** ，并且 **兑现值** 和 Promise B 的相同。
- 当 Promise B 对象被 **拒绝** （或者已经是被 **拒绝** ）时， Promise A 也会被 **拒绝** ，并且 **拒绝理由** 和 Promise B 的相同。
- 当 Promise B 对象未 **敲定** 时， Promise A 也不会 **敲定**。

下面的场景中，将会 **锁定** 两个 Promise 对象：
- 调用 `new Promise()` 中提供的 `resolve()` 方法时，传入的参数是一个 Promise 对象， 此时构造出来的 Promise 对象与传入的参数 **锁定** 。
- `Promise.resolve(input)` 中的 `input` 是一个 Promise 对象时， `Promise.resolve()` 返回的 Promise 对象将会与 `input` **锁定** 。
- 在 promise 机制控制的回调函数中返回的值 `val` 是一个 Promise 对象时， 回调函数返回的 Promise 对象将会与 `val` **锁定**。

> 备注：promise 机制控制的回调函数始终都会返回一个 Promise 对象，无论回调函数中返回的是什么。（可能不太严谨）
> - 如果回调函数中返回的是非 Promise 对象，则它会作为 Promise 对象的 **兑现值**。
> - 如果回调函数中返回的是 Promise 对象，则两个 Promise 对象会 **锁定**。

所以，当一个 Promise 被 **解决** 时，该 Promise 对象的状态不一定会改变的。（有些人可能会以为 **解决** 一个 Promise 时该 Promise 状态会变成 **兑现**）

## 🍕 通过代码介绍 *解决(resolve)* 和 *锁定(locked in)*

```js
function first () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('firstResult') //  4️⃣ 在某个时间点, Promise A 被 "解决"，此时 Promise A 的状态为已 "兑现"
    }, 500)
  })
}

function second (firstResult) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('secondResult') // 6️⃣ 在某个时间点, Promise C 被 "解决" 了, 此时 Promise C 的状态是已 "兑现"。
                              //    同时，由于 Promise B 与 Promise C 锁定，所以 Promise B 的状态也会变成已 "兑现"，其 "兑现值" 和 Promise C 的一样。
    }, 500)
  })
}

function doStuff () {
  return first() //  2️⃣ 当调用 doStuff() 时, first() 执行并返回一个 Promise A

    .then(firstResult => {  //  3️⃣ 当调用 Promise A 的 then() 方法时, 该 then() 方法也会创建一个 Promise B 并返回。 该 Promise B 就是 doStuff 返回的 Promise 对象

      return second(firstResult) //  5️⃣ 当 Promise A "兑现" 时, 就会执行 second(), 这个 second() 也会返回一个 Promise C 。
                                 //     由于该回调函数(promise 机制控制的回调函数) 返回了一个值，所以 Promise B 被 "解决" 了
                                 //     同时，因为返回的值是 Promise C，所以 Promise B 与 Promise C "锁定"。
                                 //     此时❗ 虽然 Promise B 被 "解决" 了，但他的状态不变 —— "待定"，因为 Promise C 的状态是 "待定"。
    })
}


doStuff() // 1️⃣
  .then(secondResult => {
    console.log(secondResult) // 7️⃣ 当 Promise B 状态变为 "兑现" 时（取决于 Promise C ），该回调函数将被调用。
  })
  .catch(error => {
    console.error(error)
  })
```

1. 调用 `doStuff()`
2. `doStuff()` 会调用 `first()` 函数，此时 `first()` 函数返回一个 Promise A 对象。
3. 调用 Promise A 的 `then()` 方法时，该 `then()` 会创建一个 Promise B 对象， Promise B 就是 `doStuff()` 返回的 Promise 对象。 并且该 `then()` 方法中传入了一个由一个回调函数 callback A ，该回调函数的执行时机是由 promise 机制控制的。
4. 在某个时间点， Promise A 被通过调用 `resolve()` 的方式 **解决** ，此时 Promise A 的状态会变成 **兑现** ，并且携带 **兑现值**
5. 当 Promise A 被 **兑现** 后，由 promise 机制控制的 callback A 执行， `second()` 被调用， 因为 `second()` 返回一个 Promise C 对象，所以此时 Promise B 被 **解决** 了，但是❗ Promise B 的状态还是 **待定** ，因为 Promise B 与 Promise C **锁定** 了。
6. 在某个时间点， Promise C **兑现** 了， 此时 Promise B 状态也会是 **兑现** ，其 **兑现值** 和 Promise C 一致。
7. 当 Promise B **兑现** 时， Promise B 对应的 `then()` 中的回调函数将被执行


上面的解释也适用 `async/await` ，比如下面代码：
```js
async function first() {/* ... */}
async function second(firstResult) {/* ... */}

async function doStuff() {
  const firstResult = await first()
  return second(firstResult)
}
```
1. `doStuff()` 函数被调用时，会调用 `first()` 函数。
2. 当 `first()` 函数返回的 Promise A 的状态变为 **兑现** 时， doStuff 调用 `second()` ，同时创建并返回一个已经 **解决** 了的 Promise B 对象，该 Promise B 对象会与 `second()` 返回的 Promise C 对象 **锁定**。在 Promise C 对象 **敲定** 之前， Promise B 对象的状态始终是 **待定**。

## 🍕 总结

- Promise 对象只有三种互斥状态 **待定**、**兑现** 和 **拒绝**
- Promise 对象被 **兑现** 时会有一个 **兑现值** 传递给 `then()`
- Promise 对象被 **拒绝** 时会有一个 **拒绝理由** 传递 `catch()`
- 当 Promise 对象的状态不是 **待定** 时，我们称呼该 Promise 被 **敲定** 了。
- 当 **解决** 一个 Promise 对象时，它的状态不一定会改变。
- 多个 Promise 对象可以通过 **锁定** 的方式确保他们按序执行。（这也就是 Promise 链）

在实际项目中， **解决** 一个 Promise 对象时，它的状态往往是不变的（依旧是 **待定** ）。
因为在设计某个需求函数为异步函数时，该异步函数往往是需要多个异步任务按序执行的。
所以异步函数返回的 Promise 对象，经常与其他的 Promise 对象 **锁定**，而状态保持 **待定**。
比如下面代码:

```JS
fetch(url)
  .then(response => response.text())
  .then( data => {
    console.log(data.slice(0, 20))
  })
  .catch(reason => {
    console.error(reason)
  })
```
```js
async function send(url) {
  const response = await fetch(url)
  return response.json()
}
try {
  const data = await send(url)
  console.log(data)
} catch (error) {
  console.error(error)
}
```