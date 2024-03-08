- [Promise 对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [使用 Promise(en-US)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [博客 - Promise 基本概念](https://thenewtoys.dev/blog/2021/02/08/lets-talk-about-how-to-talk-about-promises/)

## 认识 Promise

- Promise 是一个对象，它代表了一个异步操作的最终完成或者失败。

- Promise 本质上是一个函数返回的对象。我们把回调函数绑在 Promise 链上，而不是像旧的异步函数那样，直接将回调函数作为参数传入。

    - 旧写法
    ```js
    function successCallback(result) {
    console.log(`Audio file ready at URL: ${result}`);
    }

    function failureCallback(error) {
    console.error(`Error generating audio file: ${error}`);
    }

    createAudioFileAsync(audioSettings, successCallback, failureCallback);
    ```

    - Promise 链式绑定回调函数的写法
    ```js
    createAudioFileAsync(audioSettings).then(successCallback, failureCallback);
    ```

## 链式调用的好处

按序执行多个异步函数是很常见的需求。按照以前的写法，这种需求会写成下面这样——回调地狱
```js
doSomething(function (result) {
  doSomethingElse(result, function (newResult) {
    doThirdThing(newResult, function (finalResult) {
      console.log(`Got the final result: ${finalResult}`);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);
```

但使用 Promise 可以写成下面这样——链式调用，而且只需要利用 .catch 就能捕获前面所有异步函数的错误。
```js
doSomething()
  .then((result) => doSomethingElse(result))
  .then((newResult) => doThirdThing(newResult))
  .then((finalResult) => {
    console.log(`Got the final result: ${finalResult}`);
  })
  .catch(failureCallback);
```

**注意** ：链式调用中，多个异步函数之间是通过返回值和参数进行传递数据的，所以一定要记得在then() 中写返回值。没有返回值时被称为 floating。
下面就是一个忘记写返回值的错误案例：由于你忘记写返回值，所以本来是一条链，现在链条上多了一段浮动（floating）的链 —— fetch() 部分

```js
// ❌
const listOfIngredients = [];

doSomething()
  .then((url) => {
    // I forgot to return this
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        listOfIngredients.push(data);
      });
  })
  .then(() => {
    console.log(listOfIngredients);
    // Always [], because the fetch request hasn't completed yet.
  });
```

此外，虽然你可以简单的将 fetch() 作为返回值，从而解决 floating 问题，就像下面这样：
```js
// ❌
const listOfIngredients = [];

doSomething()
  .then((url) =>
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        listOfIngredients.push(data);
      }),
  )
  .then(() => {
    console.log(listOfIngredients);
  });
```

但这种嵌套链的方式违背了我们的初衷。将链条扁平化处理无疑是更好的做法：
```js
// ✔️
const listOfIngredients = [];

doSomething()
  .then((url) => fetch(url))
  .then((res) => res.json())
  .then((data) => {
    listOfIngredients.push(data);
  })
  .then(() => {
    console.log(listOfIngredients);
  });
```

## 捕获错误

嵌套链式调用是不被推荐的，但是在某些特定情景下，正确的使用嵌套能够让我们更精准的捕获错误。
比如，将我们不在乎的可能会报错的异步操作嵌套起来，然后单独 catch，这样就能只捕获我们在乎的异步操作的错误。
```js
doSomethingCritical()
  .then((result) =>
    doSomethingOptional(result)
      .then((optionalResult) => doSomethingExtraNice(optionalResult))
      .catch((e) => {}), // 内部的 catch：忽略错误(error-silencing)。
  ) // Ignore if optional stuff fails; proceed.
  .then(() => moreCriticalStuff())
  .catch((e) => console.error(`Critical failure: ${e.message}`)); // 外部的 catch：能够捕获 doSomethingCritical 的错误。
```

当 catch 到错误后，不会影响后续链条的执行，比如下面这样：
```js
new Promise((resolve, reject) => {
  console.log("Initial");

  resolve();
})
  .then(() => {
    throw new Error("Something failed");

    console.log("Do something");
  })
  .catch(() => {
    console.error("something wrong");
  })
  .then(() => {
    console.log("Do something, no matter what happened before");
  });
```

## 编写 Promise 链时容易出现的错误案例

```js
// ❌ 错误案例: 下面代码中有三处错误

doSomething()
  .then(function (result) {
    // Forgot to return promise from inner chain + unnecessary nesting
    doSomethingElse(result).then((newResult) => doThirdThing(newResult)); // 此处两个错误
  })
  .then(() => doFourthThing());
// Forgot to terminate chain with a catch!  此处一个错误
```

- 第一个错误：在 then 中创建了 promise 对象却没有将其返回，这导致了 Promise 链的断裂。 带来的后果是：出现两条独立的链条并行执行，即 doFuorthThing 函数不会等待 doSomethingElse() 或 doThirdThing() 函数的完成。这违背了我们期待的按序执行。
- 第二个错误：错误使用嵌套，使用了没必要嵌套。因为该程序并没有在嵌套内捕获错误，也没有说明嵌套内的异步操作是可选操作。 当内部出现错误时，我们将捕获到未知的错误。
    > tips: 捕获错误是捕获我们知道的错误, 比如用户填写手机号时, 我们会捕获 “输入不是合法手机号” 这一个错误，但如果捕获到了未知错误，则不是我们期待的。比如程序员不怕 404，怕 500。
- 第三个错误：在链条最后没有使用 catch。 这将导致 reject 状态的 Promise 被忽略。

正确使用案例:
```js
// ✔️
doSomething()
  .then(function (result) {
    // 当 doSomethingElse() 返回一个 Promise 对象时, 一定要记得 return doSomethingElse()
    return doSomethingElse(result);
  })
  // 如果使用箭头函数, 记得省略花括号
  .then((newResult) => doThirdThing(newResult))
  // 前面几个 then() 中返回 Promise 对象, 是为了维持 Promise 链条。
  // 即使下一个 then() 并不需要用到这个值
  .then((/* result ignored */) => doFourthThing())
  // 永远记得在 Promise 的最后添加 catch, 以避免任何未处理的 rejections
  .catch((error) => console.error(error));
```

如果你使用 `async`/`await`, 那么上面大多数问题都可以得到解决。 但是当你使用 `async`/`await` 时, 最常见的错误就是忘记添加 `await` 关键字!

## `async`/`await` 捕获错误

我们使用 Promise 链式捕获错误只需要在尾部调用 catch:
```js
doSomething()
  .then((result) => doSomethingElse(result))
  .then((newResult) => doThirdThing(newResult))
  .then((finalResult) => console.log(`Got the final result: ${finalResult}`))
  .catch(failureCallback);
```

同步函数捕获错误是使用 `try`/`catch`:
```js
try {
  const result = syncDoSomething();
  const newResult = syncDoSomethingElse(result);
  const finalResult = syncDoThirdThing(newResult);
  console.log(`Got the final result: ${finalResult}`);
} catch (error) {
  failureCallback(error);
}
```

`async`/`await` 捕获错误的方式和同步代码一样 —— `try`/`catch`:
```js
async function foo() {
  try {
    const result = await doSomething();
    const newResult = await doSomethingElse(result);
    const finalResult = await doThirdThing(newResult);
    console.log(`Got the final result: ${finalResult}`);
  } catch (error) {
    failureCallback(error);
  }
}
```

这意味着, 利用 `async`/`await` 和 Promise 编写异步代码, 能够让我们像编写同步代码一样!

## Promise 的 rejection 事件

在浏览器的环境下, 当 Promise 对象被拒绝时, 下面两个事件之一被发送到全局作用域（一般是 window）:
- `unhandledrejection`
    当 Promise 被拒绝，并且没有 reject handled 处理该 rejection 时，会派发此事件。
- `rejectionhandled`
    当 `unhandledrejection` 事件触发后, reject handled 才处理该 rejection 时，会派发此事件。

比如这样:
```js
window.addEventListener('unhandledrejection', (event) => {
    console.log('❌unhandledrejection', event.reason, event.promise)
    event.preventDefault(); // 可以添加该行代码来阻止浏览器的默认打印行为。 需要控制台输出显示的级别包含"详细(verbose)"或"所有级别"
})
window.addEventListener('rejectionhandled', (event) => {
    console.log('❌rejectionhandled', event.reason, event.promise)
})

// 创建一个未处理的 Promise
const promise = Promise.reject('Promise 被拒绝(rejected)')

// 500ms 后才添加 reject handled 来处理 rejection
setTimeout(() => {
    promise.catch(() => { })
}, 500);
```

上面的两个事件(事件类型为 PromiseRejectionEvent)都有两个属性
- `PromiseRejectionEvent.promise`
    被拒绝的 Promise 对象
- `PromiseRejectionEvent.reason`
    Promise 被拒绝时携带的文本信息

当你导入别人的代码, 而别人代码中存储未处理的 rejection 时, 上面两个事件能够帮助你处理别人的 rejection。

## 并行处理多个 Promise

Promise 提供了有四个工具函数能够帮我们并行处理 Promise。

- [`Promise.all(iterable)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [`Promise.allSettled(iterable)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [`Promise.any(iterable)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [`Promise.race(iterable)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

他们都会返回 Promise 对象, 并且都可以接受空的可迭代对象(比如空数组)。
当接受空的可迭代对象时, 前三个返回的 Promise 对象都会同步地敲定状态, 只有 `race` 函数返回的 Promise 依旧是待定(pending)状态。
除此之外的任何情况, 四个函数返回的 Promise 对象都是异步敲定状态的!
> Promise 对象被敲定(settled), 表示该 Promise 对象被兑现(fulfilled)或者被拒绝(rejected)。

```js
const p1 = Promise.all([])
const p2 = Promise.allSettled([])
const p3 = Promise.any([])
const p4 = Promise.race([])
console.log(p1) // Promise {<fulfilled>: Array(0)}
console.log(p2) // Promise {<fulfilled>: Array(0)}
console.log(p3) // Promise {<rejected>: AggregateError: All promises were rejected}
console.log(p4) // Promise {<pending>}
setTimeout(() => { // 利用 setTimeout 函数我们可以在堆栈为空后执行代码
  console.log("堆栈现在为空")
  console.log(p1) // Promise {<fulfilled>: Array(0)}
  console.log(p2) // Promise {<fulfilled>: Array(0)}
  console.log(p3) // Promise {<fulfilled>: AggregateError: All promises were rejected}
  console.log(p4) // Promise {<pending>}
})
// p3.catch(r=>r) // 如果是 Nodejs 环境下, 需要在堆栈空之前先捕获被拒绝的 Promise, 不然堆栈空后, rejection 冒泡到堆栈外后会直接导致程序终止。 从而看不到堆栈空后的效果
```

此外, 还可以利用数组的 `reduce()` 组合 Promise 运行:
```js
[func1, func2, func3]
  .reduce((p, f) => p.then(f), Promise.resolve())
  .then((result3) => {
    /* use result3 */
  });
```
这种递归调用一个由异步函数组成的数组时，相当于一个 Promise 链:
```js
Promise.resolve()
  .then(func1)
  .then(func2)
  .then(func3)
  .then((result3) => {
    /* use result3 */
  });
```
利用数组方法递归调用时, 我们可以改成函数式编程, 比如下面这样:
```js
const applyAsync = (acc, val) => acc.then(val);
const composeAsync =
  (...funcs) =>
  (x) =>
    funcs.reduce(applyAsync, Promise.resolve(x));
```
`composeAsync` 函数使用方式为:
```js
const transformData = composeAsync(func1, func2, func3); // 允许任意数量异步函数
const result3 = transformData(data);
```

利用 `for of` 和 `async`/`await` 也可以实现 Promise 的组合:
```js
let result;
for (const f of [func1, func2, func3]) {
  result = await f(result);
}
/* use last result (i.e. result3) */
```
但使用这种同步阻塞的方式组合 Promise 之前, 最好仔细思考一下是否有必要 —— 并行处理 Promise 是个更优的选择, 因为他们不会相互阻塞。

## 为 setTimeout 创建 Promise

可以通过 Promise 的构造器的方式从零开始创建 Promise。 但这种方式应当 **只** 在封装旧 API 的时候用到。

理想状态下, 所以异步函数都应该返回 Promise, 但有一些 API 仍然使用旧方式来传入回调。典型的例子就是 setTimeout() 函数。

混用旧方式和 Promise 方式可能会造成运行时序问题, 比如 传递给 setTimeout() 的回调函数有错误, 则只能在内部捕获它。

这个时候, 可以使用 Promise 封装来封装它(其他使用旧方法的 API 同理):
```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

wait(10 * 1000)
  .then(() => saySomething("10 seconds"))
  .catch(failureCallback);
```

## 时序

基于 callback 的 API ，如何调用 callback 取悦于具体的实现。 比如下面这种， 即可能是同步调用， 也可能是异步调用 的 API 设计是绝对不可取的:
```js
// ❌
function doSomething(callback) {
  if (Math.random() > 0.5) {
    callback();
  } else {
    setTimeout(() => callback(), 1000);
  }
}

```

Promise 是 loC 的一种形式 —— 我们(作为 API implementor)不需要控制 callback 何时执行。 相反， callback 队列的维护和 callback 的调用由 Promise 负责。 这样以来， 大家就能获得强有力的语义保证:
- 使用 then() 来接收 callback, 并且保证在 [JS事件循环](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) 的一个 message 运行完成之前， 该 callback 永远不会被调用。

    > loC(Inversion of Control): 控制反转， 是一种软件设计原则。 它是一种将程序的控制权从调用方转移到框架或容器中的设计原则。

    > [message(消息)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#queue): JS 运行时有一个消息队列, 每一个消息队列都关联着一个回调函数， 当消息被处理完成时, 该消息将会被作为对应的回调函数的参数, 传递给回调函数。 所以, 如果一个消息未运行完成就调用 callback 的话, 该 callback 的输入参数将会是空。 比如我们为一个点击事件绑定了回调函数 callback, 此时消息队列中会有一个消息与其关联, 当点击事件发生时, 该消息将被处理, 然后将其作为参数 event 传递给 callback, 最终确保我们能够在 callback 中正确的获取 event 参数, 从而得到我们想要的信息(比如鼠标位置)。
    ```js
    function callback(event) { }
    div.addEventListener('click', callback)
    ```
- 可以通过 then() 的串联, 实现多个 callback 的按序执行
- 即使是在 Promise 被敲定后, 才将 callback 添加到 then() 中, 也能保证该 callback 被执行。
    - 为了防止歧义, 任何被添加到 then() 中的 callback , 他们的调用都会是异步调用的。 比如下面这样:
    ```js
    promise = Promise.resolve()
    // 虽然此时的 promise 已经是敲定状态, 但是下面 then 中的回调函数也不会立马执行, 而是会异步执行
    promise.then(()=> {console.log(2)})
    console.log(1) // 这就是为什么 1 会比 2 先输出。
    ```

传递到 then() 中的 callback 都会被异步调用, 因为这些 callback 会被添加到微任务队列中。
具体的说，这个调用时机是在 JS 的执行栈为空之后， 控制权返回给 event loop 之前。 比如下面的代码
```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

wait(0).then(() => console.log(4))
Promise.resolve()
  .then(() => console.log(2))
  .then(() => console.log(3))
console.log(1) // 1, 2, 3, 4
// 在 JS 的执行栈为空之后, 所以会先输出 1
// 在控制权返回给 event loop 之前, 所以只有当 2, 3 输出后, 控制权才会回到 event loop 上, 此时 event loop 才会调用 setTimeout 此时 wait(0) 返回的 Promise 对象才会是敲定状态, wait(0).then() 的回调函数才会被添加到微任务队列中, 然后执行。
```

### 任务队列(Task queues) vs 微任务(microtasks)

Promise callback 被当成微任务处理, 而 setTimeout 中的 callback 会被当成任务队列处理。

比如下面的代码
```js
const promise = new Promise((resolve, reject) => {
  console.log("1 Promise callback")
  resolve()
}).then((result) => {
  console.log("3 Promise callback (.then)")
})

setTimeout(() => {
  console.log("4 event-loop cycle: Promise (fulfilled)", promise)
}, 0)

console.log("2 Promise (pending)", promise)
```

有关事件循环, 任务队列, 微任务的更多信息, 请参考 [MDN 深入理解微任务和 JS 运行上下文](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)

> 简单的说, 就是执行 JS 代码时, 会有多个 "代理", 每一个 "代理" 内部由很多内容构成, 比如每个代理都有自己的 "任务队列" 和 "微任务队列"。
而 "事件循环" 就是用来驱动这些 "代理" 的。
>
> 每个代理都是由事件循环（Event loop）驱动的，事件循环负责收集事件（包括用户事件以及其他非用户事件等）、对任务进行排队以便在合适的时候执行回调。然后它执行所有处于等待中的 JavaScript 任务，然后是微任务，然后在开始下一次循环之前执行一些必要的渲染和绘制操作。
>
> 一个任务就是指计划由标准机制来执行的任何 JavaScript，如程序的初始化、事件触发的回调等。除了使用事件，你还可以使用 setTimeout() 或者 setInterval() 来添加任务。
>
> 任务队列和微任务队列的区别很简单：
> - 当执行来自任务队列中的任务时，在每一次新的事件循环开始迭代的时候运行时都会执行队列中的每个任务。在每次迭代开始之后加入到队列中的任务需要在下一次迭代开始之后才会被执行。
> - 每次当一个任务退出且执行上下文栈为空的时候，微任务队列中的每一个微任务会依次被执行。不同的是它会等到微任务队列为空才会停止执行——即使中途有微任务加入。换句话说，微任务可以添加新的微任务到队列中，这些新的微任务将在下一个任务开始运行之前，在当前事件循环迭代结束之前执行。
>
> 由于我们的代码和浏览器的用户界面运行在同一个线程中，共享同一个事件循环，所以当我们的代码阻塞时浏览器将没有时间来渲染和绘制网站和 UI、处理用户事件等，从而导致卡顿。
> 解决方案有
>   - 使用 web worker 可以让主线程另起新的线程来运行脚本，新的线程属于另外的事件循环。
>   - 使用像 promise 这样的异步 JavaScript 技术可以使得主线程在等待请求返回结果的同时继续往下执行。
>   - 微任务是另一种解决该问题的方案，通过将代码安排在下一次事件循环开始之前运行，而不是必须要等到下一次开始之后才执行。
>

其他参考
> - [微任务](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide)
> - [异步 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)
> - [事件循环](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#run-to-completion)
> - [Nodejs 事件循环](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick#what-is-the-event-loop)
> - [Promise 测试工具](https://tech.io/playgrounds/11107/tools-for-promises-unittesting/introduction)
> - [大佬博客 13年提出js异步](https://blog.izs.me/2013/08/designing-apis-for-asynchrony/)

## 组合 Promise 案例

> Promise 对象被敲定(settled), 表示该 Promise 对象被兑现(fulfilled)或者被拒绝(rejected)。

一共有四个工具函数能够帮我们组合 Promise 执行。
- `Promise.all(iterable)` 返回的 Promise 对象有以下四种状态
    - ✔️已兑现(Already fulfilled);
        - `iterable` 为空(比如空数组)。
        - 兑现值为空数组
    - 待定(pending)
        - `iterable`还没有出现敲定的 Promise 对象
    - ✔️异步兑现(Asynchronously fulfilled);
        - `iterable` 中所有 Promise 都被兑现。
        - 兑现值是由 `iterable` 中所有兑现值按序组成的数组
    - ❌异步拒绝(Asynchronously rejected);
        - `iterable` 中存在一个被拒绝的 Promise。
        - 拒绝原因和第一个被拒绝的 Promise 的一样

- `Promise.allSettled(iterable)` 返回的 Promise 对象没有拒绝状态
    - ✔️已兑现(Already fulfilled);
        - `iterable` 为空(比如空数组)。
        - 兑现值为空数组
    - 待定(pending)
        - `iterable`还没有出现敲定的 Promise 对象
    - ✔️异步兑现(Asynchronously fulfilled);
        - `iterable` 中所有 Promise 都已敲定
        - 兑现值是数组, 数组的元素是一个对象, 存有敲定后的 Promise 的状态(兑现或拒绝)和值(兑现值或拒绝原因)。

- `Promise.any(iterable)` 返回的 Promise 对象有以下四种状态
    - ❌已拒绝(Already rejected);
        - `iterable` 为空(比如空数组)。
        - 兑现值为空数组
    - 待定(pending)
        - `iterable`还没有出现敲定的 Promise 对象
    - ✔️异步兑现(Asynchronously fulfilled);
        - `iterable` 中的存在一个被兑现 Promise
        - 兑现值和第一个兑现的 Promise 一样
    - ❌异步拒绝(Asynchronously rejected);
        - `iterable` 中所有 Promise 都被拒绝
        - 拒绝原因是由 `iterable` 中所有拒绝原因按序组成的数组

- `Promise.race(iterable)`
    - 待定(pending)
        - `iterable` 为空(比如空数组)
        - `iterable` 非空, 并且每个  Promise 都是敲定状态。(即 race 执行前就已经待定)
        - `iterable` 中还没有出现敲定的 Promise 对象
    - ✔️异步兑现(Asynchronously fulfilled);
        - race() 执行后, 第一个敲定的 Promise 是兑现状态
        - 兑现值和第一个敲定的 Promise 的一样
    - ❌异步拒绝(Asynchronously rejected);
        - race() 执行后, 第一个敲定的 Promise 是拒绝状态
        - 拒绝原因和第一个敲定的 Promise 的一样

### 案例

#### `Promise.all()` 案例

- 空数组案例
```js
Promise.all([])
  .then(val => {
    console.log('✔️', val) // 输出 ✔️ []
  })
  .catch(reason => {
    console.error('❌', reason)
  })
```

- 异步兑现案例
```js
const iterableFun = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
  Promise.reject(4).catch(()=>{}),
  Promise.resolve(5),
  Promise.resolve(6),
]

Promise.all(iterableFun)
  .then(val => {
    console.log('✔️', val) // ✔️ [ 1, 2, 3, undefined, 5, 6 ]
  })
  .catch(reason => {
    console.error('❌', reason)
  })
```

- 异步拒绝案例
```js
const iterableFun = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
  Promise.reject(4),
  Promise.resolve(5),
  Promise.resolve(6),
]

Promise.all(iterableFun)
  .then(val => {
    console.log('✔️', val)
  })
  .catch(err => {
    console.error('❌', err) // 输出 ❌ 4
  })
```

#### `Promise.allSettled()` 案例

- 空数组案例
```js
Promise.allSettled([])
  .then(val => {
    console.log('✔️', val) // 输出 ✔️ []
  })
  .catch(reason => {
    console.error('❌', reason)
  })
```

- 异步兑现案例
```js
const iterableFun = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
  Promise.reject(4),
  Promise.resolve(5),
  Promise.resolve(6),
]

Promise.allSettled(iterableFun)
  .then(val => {
    console.log('✔️', val)
    /* ✔️ [
      { status: 'fulfilled', value: 1 },
      { status: 'fulfilled', value: 2 },
      { status: 'fulfilled', value: 3 },
      { status: 'rejected', reason: 4 },
      { status: 'fulfilled', value: 5 },
      { status: 'fulfilled', value: 6 }
    ]*/
  })
  // Promise.allSettled() 返回的 Promise 不可能被拒绝, 所以不需要 catch, 但如果你在上一个 then 中返回了新的 promise, 那就需要 catch 了
```

#### `Promise.any(iterable)`

- 空数组案例
```js
Promise.any([])
  .then(val => {
    console.log('✔️', val)
  })
  .catch(reason => {
    console.error('❌', reason) // ❌ AggregateError: All promises were rejected
  })
```

- 异步兑现案例
```js
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const iterableFun = [
  wait(1000).then(()=>'1000'),
  wait(30).then(()=>Promise.reject('30')),
  wait(20).then(()=>Promise.reject('20')),
  wait(10).then(()=>Promise.reject('10')),
]

Promise.any(iterableFun)
  .then(val => {
    console.log('✔️', val) // 等待1秒后输出 ✔️ 1000
  })
  .catch(reason => {
    console.error('❌', reason)
  })
```

- 异步拒绝案例
```js
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const iterableFun = [
  wait(1000).then(()=>Promise.reject('1000')),
  wait(30).then(()=>Promise.reject('30')),
  wait(20).then(()=>Promise.reject('20')),
  wait(10).then(()=>Promise.reject('10')),
]

Promise.any(iterableFun)
  .then(val => {
    console.log('✔️', val)
  })
  .catch(reason => {
    console.log('❌', reason) // 等待1秒后输出 ❌ AggregateError: All promises were rejected
  })
```

#### `Promise.race()` 案例

- 空数组案例
```js
Promise.race([])
  .then(val => {
    console.log('✔️', val)
  })
  .catch(reason => {
    console.log('❌', reason)
  })
// 不会有任何输出, 并且返回的 Promise 为待定(pending)状态
```

- 待定案例
```js
```

- 异步兑现案例
```js
const iterableFun = [
  Promise.resolve(1),
  Promise.resolve(2),
  new Promise((resolve) => {for(let i=0;i<9999999999;i++);resolve(3)}),
  Promise.reject(4),
  Promise.resolve(5),
  Promise.resolve(6),
]

Promise.race(iterableFun)
  .then(val => {
    console.log('✔️', val) // 等待几秒钟(取决于电脑性能)后, 输出 ✔️ 1
  })
  .catch(reason => {
    console.log('❌', reason)
  })
```

- 异步兑现案例
```js
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const iterableFun = [
  wait(1000).then(()=>'1000'),
  wait(200).then(()=>'200'),
  wait(10).then(()=>'10'),
  wait(100).then(()=>'100'),
]

Promise.race(iterableFun)
  .then(val => {
    console.log('✔️', val) // 输出 ✔️ 10
  })
  .catch(reason => {
    console.log('❌', reason)
  })
```

- 异步拒绝案例
```js
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const iterableFun = [
  wait(1000).then(()=>'1000'),
  wait(200).then(()=>'200'),
  wait(100).then(()=>'100'),
  wait(10).then(()=>Promise.reject('10')),
]

Promise.race(iterableFun)
  .then(val => Promise.resolve(val))
  .then(val => {
    console.log('✔️', val)
  })
  .catch(reason => {
    console.log('❌', reason) // ❌ 10
  })
```

