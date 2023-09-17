# 语法（熟悉后大概率删除）

## `{#}` 语法

```svelte
{#await getRandomNumberPromise}
    <p>...waiting</p>
{:then number}
    <p>The random number is {number}</p>
{:catch error}
    <p>Something wrong: {error.message} </p>
{/await}
```

## 事件

原生事件

```svelte
<div on:pointermove={handleMove}>
    The pointer is at {m.x} x {m.y}
</div>

<div on:click={handleClick}>
    The pointer is at {m.x} x {m.y}
</div>
```

事件修饰符。使用语法为 `on:click|once|capture={...}`。支持的事件修饰符如下：

- `preventDefault` 调用 `event.preventDefault()`
- `stopPropagation` 调用 `event.stopPropagation()`
- `passive` 优化了对 touch/wheel 事件的滚动表现。(Svelte will add it automatically where it's safe to do so)
- `nonpassive` 明确声明 passive 为 false
- `capture` 在事件捕获阶段触发 handler 而不是在事件冒泡阶段
- `once` 触发 handler 后立马删除该事件
- `self` 只有当 `event.target` 等于元素自身时才会触发
- `trusted` 只有当 `event.isTrusted` 为 `true` 时才会触发

### 组件自定义事件

```svelte
<!-- Inner.svelte -->
<script>
    import {createEventDispatcher} from "svelte"

    // 通过 createEventDispatcher 创建一个事件
    const dispatch = createEventDispatcher()

    function sayHello() {
        // 调用它来分发事件，第一个参数是事件名称，第二个参数是传递的数据，保存在 evt.detail 中
        dispatch('message', {
            text: 'Hello!'
        });
    }
    function handleInput(evt) {
        dispatch('inputSomething', evt.target.value)
    }
</script>

<input on:input={handleInput} />

<button on:click={sayHello}>
    Click to say hello
</button>
```

```svelte
<!-- App.svelte -->
<script>
    import Inner from './Inner.svelte';

    let detail = '...'
    function handleMessage(event) {
        alert(event.detail.text);
    }
    function input(evt) {
        detail = evt.detail
    }
</script>

<Inner on:message={handleMessage} on:inputSomething={input} />
<p> {detail} </p>
```

### 组件自定义事件不会冒泡

比如 App --> Outper --> Inner

Innert 中 `dispatch('message')`，则该事件只会传递到 Outper 组件中，如果 App 想要获取 message 事件，则需要 Outper 进行事件转发。

```svelte
<script>
    import Inner from './Inner.svelte';
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    function forward(evt) {
        dispatch('message', evt.detail)
    }
</script>

<Inner on:message={forward} />
```

由于转发事件的操作基本都是一样的，所以 svelte 提供了快捷方式——如果没有赋予事件 handler，则默认转发该事件。

```svelte
<script>
    import Inner from './Inner.svelte';
</script>
<!-- 该代码等同上面的代码 -->
<Inner on:message />
```

该语法糖同样适用于原生事件

```svelte
<!-- button.svelte -->
<button on:click>
    Push
</button>
```

```svelte
<!-- App.svelte -->
<script>
    import BigRedButton from './BigRedButton.svelte';
    import horn from './horn.mp3';

    const audio = new Audio();
    audio.src = horn;

    function handleClick() {
        audio.play();
    }
</script>

<BigRedButton on:click={handleClick} />
```

## 绑定

- `bind:`
    - `<input bind:value={name} />`
    - `<input type="checkbox" bind:checked={yes} />`
    - `<select bind:value={selected}> ... </select>`
    - `<textarea bind:value={value}></textarea>` 当绑定的值和变量名相同时，可以简写 `<textarea bind:value></textarea>`
    - `<div contenteditable="true" bind:innerHTML={html}></div>`
    > 在 DOM 中，一切都是字符串。即使是 `type="number"` 组件，它传递的 `event.target.value` 类型也是 `string`。
- `bind:group` 支持绑定组
- 对 `<audio>` 和 `<video>` 的绑定值
    - 4 个双向绑定
        - `currentTime` ：视频中的当前点，以秒为单位。
        - `playbackRate` ：播放视频的倍速， 1 为 '正常'。
        - `paused` ：暂停。
        - `volume` ：音量，0到1之间的值。
    - 6 个只读绑定值
        - `duration` (readonly) ：视频的总时长，以秒为单位。
        - `buffered` (readonly) ：数组{start, end} 的对象。
        - `seekable` (readonly) ：同上。
        - `played` (readonly) ：同上。
        - `seeking` (readonly) ：布尔值。
        - `ended` (readonly) ：布尔值。
- 绑定尺寸
    - `clientWidth` 只读
    - `clientHeight` 只读
    - `offsetWidth` 只读
    - `offsetHeight` 只读
- 绑定 `this`，就是绑定该元素标签
    - `<p bind:this={pElement}></p>`
- 绑定组件的 props
    - `<Keypad on:submit={handleSubmit} bind:value={pin} />`

```svelte
<!-- 对于 radio，最终的的值 scoops 会是一个单值 -->
{#each [1, 2, 3] as number}
    <label>
        <input
            type="radio"
            name="scoops"
            value={number}
            bind:group={scoops}
        />

        {number} {number === 1 ? 'scoop' : 'scoops'}
    </label>
{/each}
```

```svelte
<!-- 对于 checkbox，最终的值 flavours 会是一个数组 -->
{#each ['cookies and cream', 'mint choc chip', 'raspberry ripple'] as flavour}
    <label>
        <input
            type="checkbox"
            name="flavours"
            value={flavour}
            bind:group={flavours}
        />

        {flavour}
    </label>
{/each}

```svelte
<!-- select 同理，当有 multiple 时，flavours 会是一个数组，否则是一个单值 -->
<select multiple bind:value={flavours}>
{#each ['cookies and cream', 'mint choc chip', 'raspberry ripple'] as flavour}
    <option>
        {flavour}
    </option>
{/each}
</select>
```

## 生命周期

- `onMount`
    - `onMount` 可以返回一个函数，当组件被卸载后该回调函数将会执行。
- `beforeUpdate`
- `afterUpdate`

### `tick`

`tick` 不同于其他生命周期，我们可以在任意时候调用它。`tick()` 返回一个 Promise 对象，如果 pending state 没有变化，则该 Promise 会立即被 resolve；否则，当变化的 pending state 已经应用到 DOM 上时，该 Promise 才会被 resolve。

> The `tick` function is unlike other lifecycle functions in that you can call it any time, not just when the component first initialises. It returns a promise that resolves as soon as any pending state changes have been applied to the DOM (or immediately, if there are no pending state changes).

当组件的 state 发生变化时，并不会立即应用到 DOM 上，svelte 将会在下一个 microtask 中，统一将所有发生变化的 state 应用到 DOM 上。这样的好处是提高性能，因为一个 state 变化后，在未到达下一个 microtask，还可以继续改变，或者取消改变。

举个例子：我们想要实现这么一个功能，当选中文本然后按下 TAB 按键时，将选中的文本大小写切换，并且保证鼠标依旧选中对应内容。

```html
<body>
  <textarea cols="60" rows="3"></textarea>

  <script>
    const textarea = document.querySelector('textarea')
    textarea.value = 'Select some text and hit the tab key to toggle uppercase'

    textarea.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;

        event.preventDefault();

        const { selectionStart, selectionEnd, value } = textarea;
        const selection = value.slice(selectionStart, selectionEnd);

        const replacement = /[a-z]/.test(selection)
            ? selection.toUpperCase()
            : selection.toLowerCase();

        textarea.value =
            value.slice(0, selectionStart) +
            replacement +
            value.slice(selectionEnd);

        textarea.selectionStart = selectionStart;
        textarea.selectionEnd = selectionEnd;
    })
  </script>

</body>
```

但对应到 svelte 中，我们就需要借助 `tick()` 了。

```svelte
<textarea
    value={text}
    on:keydown={handleKeydown}
    cols="60"
    rows="3"
/>

<script>
    import { tick } from "svelte"

    let text = `Select some text and hit the tab key to toggle uppercase`;

    async function handleKeydown(event) {
        if (event.key !== 'Tab') return;

        event.preventDefault();

        const { selectionStart, selectionEnd, value } = this;
        const selection = value.slice(selectionStart, selectionEnd);

        const replacement = /[a-z]/.test(selection)
            ? selection.toUpperCase()
            : selection.toLowerCase();

        text =
            value.slice(0, selectionStart) +
            replacement +
            value.slice(selectionEnd);

        /* 此时 text 的值并未应用到 DOM 上 */
        await tick()
        /* 当 await tick() 结束时，能够确保 text 已经被应用到 DOM上了 */
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
    }
</script>
```

首先，我们调用 `event.preventDefault()` 阻止了 tab 按键的默认行为，这个时候，如果我们什么都没有改变，那么选中文本点击 tab 时将不会发生任何事情。但是由于我们在按下 TAB 时更改了 textarea 文本的值，所以浏览器会自动取消选中的内容，然后将焦点移到末尾。在原生的实现中，我们可以直接为 textarea 指定 `selectionStart` 和 `selectionEnd` 属性，来确保依旧选中对应的文本。

但是在 svelte 中情况有所不同，因为 svelte 中的执行顺序本质上不是同步的，在没有添加 `await tick()` 的时候，`handleKeydown()` 执行完成时，`text` 的值并未被应用到 DOM 上面。等到下一个 microtask 时，`text` 的值才会被应用到 DOM 上，但此时我们的 `handleKeydown()` 已经执行完了，它不会再次去重新设置 `textarea` 的 `selectionStart` 和 `selectionEnd` 属性。

当我们添加了 `await tick()` 后，`handleKeydown()` 执行到 `await tick()` 会停住，等待下一个 microtask 的到来。当到达下一个 microtask 时，变更的 pending state 将会被应用到 DOM 上，所以我们的 `text` 将会被应用到 DOM 上（此时浏览器会取消选中的内容）。因为 pending state 被应用到 DOM 上了，所以 `handleKeydown()` 会接着执行 `await tick()` 后面的内容。

## 状态管理

基本使用：

```js
// stores.js
import { writable } from 'svelte/store';

function createCount() {
    const { subscribe, set, update } = writable(0);

    return {
        subscribe,
        increment: () => update(n => n + 1),
        decrement: () => update(n => n - 1),
        reset: () => set(0)
    };
}

export const count = createCount();
```

```svelte
<!-- App.svelte -->
<script>
    import { count } from './stores.js';

</script>

<h1>The count is {$count}</h1>

<button on:click={count.increment}>+</button>
<button on:click={count.decrement}>-</button>
<button on:click={count.reset}>reset</button>

```

上面中，以 `$` 开头的变量会被 Svelte 认为是在状态变量，这种变量会自动帮我们订阅状态，并且当组件卸载时，会自动取消请阅。即上面代码等同于下面代码：

```svelte
<script>
    import { count } from './stores.js';
    import { onDestroy } from "svelte";

    let count_value;

    const unsubscribe = count.subscribe(value => {
        count_value = value
    })

    onDestroy(unsubscribe);

</script>

<h1>The count is {count_value} </h1>

<button on:click={count.increment}>+</button>
<button on:click={count.decrement}>-</button>
<button on:click={count.reset}>reset</button>
```

除了创建可写状态，还可以创建只读状态，当第一个订阅者订阅该 state 时，`start` 函数将会被执行。当最后一个订阅者取消订阅时，`stop` 函数将会被执行。

此外，还可以对状态进行派生（derived），也就是一个状态依赖于其他状态的值。

```js
import { readable, derived } from 'svelte/store';

export const time = readable(new Date(), function start(set) {
    const interval = setInterval(() => {
        set(new Date());
    }, 1000);

    return function stop() {
        clearInterval(interval);
    };
});

const start = new Date();

// elapsed 状态的值依赖于 time 状态的值
export const elapsed = derived(
    time,
    ($time) => Math.round(($time - start) / 1000)
);
```

对于可写的状态变量，它也支持绑定

```js
// store.js
import { writable, derived } from 'svelte/store';

export const name = writable('world');

export const greeting = derived(name, ($name) => `Hello ${$name}!`);

```

```svelte
<script>
    import { name, greeting } from './stores.js';
</script>

<h1>{$greeting}</h1>
<input bind:value={$name} />

<!-- $name += '!' 的效果等同与 name.set($name + '!')，很明显直接操作 $name 更方便，不是吗？ -->
<button on:click={() => $name += '!'}>
    Add exclamation mark!
</button>
```

## `svelte/motion`

`svelte/motion` 模块提供两个函数 `tweened(value, options)` 和 `spring(value, options)`，这两个函数可以用来创建可写的状态。

- `tweened` 可以在状态变化的过程中插入值，从而改变状态变化的效果，可以让它看起来更加顺滑。效果上类似于 css 的过渡。可以有四个配置项：
    - `delay`，推迟变化时间
    - `duration`，变化持续时间
    - `easing`
    - `interpolate`，接收一个 (fr, to) => () => insert 结构的参数。状态的变化将只会是 fr --> insert --> to。此时的 easing 参数无效。
- `spring` 和 `tweened` 类似，但它更适合经常变化的状态，比如鼠标坐标之类的信息。`spring()` 可以有三个配置项：
    - `stiffness`，默认值是 0.15，数值越大效果越生硬、灵敏
    - `damping`，默认值 0.8，数值越大惯性越强，越难“平静”下来
    - `precision`，默认值 0.001，用于控制上面两个参数的运动幅度大小

```svelte
<script>
    import { tweened } from 'svelte/motion';
    import { elasticOut } from "svelte/easing"

    // tweened 返回一个 store。store 有两个方法 set 和 update，接收的参数和 tweened 一样。
    // 当 store.set / store.update 提供第二个参数时，将会覆盖 tweened 的第二个参数。
    const progress = tweened(0, {
        // 第二个参数是支持下面四个配置项
        delay: 100,
        duration: 400,
        easing: elasticOut,
        // interpolate: (fr, to) => () => (to+fr)/2
    });

</script>

<progress value={$progress} />

{#each [0, 0.25, 0.5, 0.75, 1] as segment (segment)}
    <button on:click={() => progress.set(segment)}>
        {segment * 100}%
    </button>
{/each}

<style>
    progress {
        display: block;
        width: 100%;
    }
    button {
        margin-left: 10px;
    }
</style>
```

[spring 案例](https://learn.svelte.dev/tutorial/springs)

## `svelte/transition`

`svelte/motion` 模块可以让状态的变化有“过渡”效果。但它并不适合元素的过渡（杀鸡焉用牛刀）。而 `svelte/transition` 是专门为元素提供的过渡，使用起来非常方便

### 基本使用

```svelte
<script>
    import { fade, fly, slide } from "svelte/transition"
    let visible = true;
</script>

<button on:click={() => visible = !visible}>toggle visible</button>

{#if visible}
    <p transition:fade={{duration: 2000}}>
        Fades in and out
    </p>
    <p transition:fly={{duration: 2000}}>
        Flies in and out
    </p>
    <p transition:slide={{duration: 2000}}>
        Slides in and out
    </p>
    <p in:slide
        out:fly={{ x: 300, y: -100, duration: 2000 }}
    >
        Slides In, flies out
    </p>
{/if}
```

`scale` 使用时，元素的位置不同，效果也将不同。

```svelte
<script>
    import { scale } from "svelte/transition"
    let visible = true;
</script>

<button on:click={() => visible = !visible}>toggle visible</button>

{#if visible}
    <p transition:scale={{start:0.2, duration: 2000}}>
            Scale in and out
    </p>
    <div class="container">
        <p transition:scale={{start:0.2, duration: 2000}}>
                Scale in and out
        </p>
    </div>
{/if}

<style>
    .container {
        height: 80vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
```

`draw` 只能应用在拥有 getTotalLength 方法的元素上，一般是 svg 中的元素才有该方法，如 `<path>`。

```svelte
<script>
  import { draw } from "svelte/transition";
  let visible = true;
</script>

<button on:click={() => (visible = !visible)}>
  {visible ? "wipe" : "draw"}
</button>
<br />
{#if visible}
  <svg viewBox="0 0 210 210" width="200" height="200">
    <polygon
      transition:draw
      points="100,10 40,198 190,78 10,78 160,198"
      fill="none"
      stroke="purple"
      stroke-width="5"
      stroke-linecap="round"
    />
  </svg>
{/if}
```

### 自定义过渡

前面的 fade、fly 本质上就是一个函数，比如 fade 的实现如下：

```js
function fade(node, { delay = 0, duration = 400 }) {
    const o = +getComputedStyle(node).opacity;

    return {
        delay,
        duration,
        css: t => `opacity: ${t * o}`
    };
}
```

基于此，我们也可以实现自己的过渡函数。过渡函数接收两个参数：

- `node`，表示过渡将应用的节点
- `params` 表示接收的参数，可以是任意值，但如果标签没有传递参数，则默认是一个空对象。

过渡函数需要返回一个过渡对象，该对象可以有以下属性值：

- `delay`
- `duration`
- `easing`，接收一个 `p => t` 函数
- `css`，接收一个 `(t, u) => cssString` 函数。
- `tick`，接收一个 `(t, u) => {...}` 函数

其中的 `t` 参数为 0 时表示过渡 in 的开始，out 的结束，为 1 时表示过渡 in 的结束，out 的开始。`u` 参数始终等于 `1 - t`。

`css` 和 `tick` 只能返回一个，大部分情况下应该使用 `css` 属性，因为 css 最终将会创建一个 css 动画。而 `tick` 会利用 js 对 `node` 进行操作实现对应的效果（产生 effect），如果操作不当可能会导致卡顿。

```svelte
<script>
    import { fade } from 'svelte/transition';
    import { elasticOut } from "svelte/easing"

    let visible = true;

    function customTransition(node, { duration=500 }) {
        return {
            duration,
            css: (t) => {
                const eased = elasticOut(t)
                return `
                    transform: scale(${eased}) rotate(${eased * 1080}deg);
                    color: hsl(
                        ${Math.trunc(t * 360)},
                        ${Math.min(100, 100 * (1 - t))}%,
                        ${Math.min(50, 500 * (1 - t))}%
                    );
                `
            }
        };
    }
</script>

<button on:click={() => visible = !visible}>toggle visible</button>

{#if visible}
    <div
        class="centered"
        in:customTransition={{ duration: 1000 }}
        out:fade
    >
        <span>transitions!</span>
    </div>
{/if}

<style>
    .centered {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    span {
        position: absolute;
        transform: translate(-50%, -50%);
        font-size: 4em;
    }
</style>
```

当 css 动画无法实现需求时，可能考虑使用 `tick`，比如实现“打字机”效果。

```svelte
<script>
    let visible = false;

    function typewriter(node, { speed = 1 }) {
        const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

        if (!valid) {
            throw new Error(`This transition only works on elements with a single text node child`);
        }

        const text = node.textContent;
        const duration = text.length / (speed * 0.01);

        function tick(t) {
            const i = Math.trunc(text.length * t);
            node.textContent = text.slice(0, i);
        }

        return {duration, tick};
    }
</script>

<button on:click={() => visible = !visible}>
    {visible ? 'delete' : 'type'}
</button>

{#if visible}
    <p in:typewriter out:typewriter={{speed: 10}} >
        The quick brown fox jumps over the lazy dog.
    </p>
{/if}
```

### 过渡的生命周期

和事件的使用方式一样

- `introstart`
- `outrostart`
- `introend`
- `outroend`

### global 和 local

Svelte3 版本中，默认是 global，Svelte4 版本中默认是 local。

global 和 local 的源码是如何实现的呢？

他们的区别可以查看该 [案例](https://learn.svelte.dev/tutorial/global-transitions)

### `{#key expression}`

过渡默认只会在元素卸载和挂载时时应用动画，但有时候当元素内容变化时，我们也希望有过渡效果，这个使用就可以使用 `{#key expression}`。

被 `{#key expression}` 包含的元素中的过渡，其触发时机不再是添加和删除，而是根据 `expression` 的值。当它变化时，就会触发过渡。

```svelte
<script>
    import { scale } from "svelte/transition"

    const fruits = [ "apple", "banner", "orange" ];
    let i = 0

    setInterval(() => {
        i = (i + 1) % fruits.length;
    }, 1000);
</script>

<!-- 当 i 变化时，scale 就会应用。与 p 元素无关  -->
{#key i}
    <p in:scale>
        {fruits[i] || ''} <!-- 即使这里写成一个固定字符，当 i 变化时依旧会添加过渡 -->
    </p>
{/key}
```

### 延迟过渡

`svelte/transition` 提供一个 `crossfade` 函数来实现延时过渡。

```js
const [send, receive] = crossfade({
    fallback, // 一个过渡函数，当没有找到 receive 时将应用该过渡函数
    delay,
    duration,
    easing,
})
```

`crossfade()` 返回一对[过渡函数](https://svelte.dev/docs/element-directives#transition-fn)，我们称其为 `send` 和 `receive`。

`send` 和 `receive` 支持一个 key 参数，它的作用应该是标识当前元素。比如 TodoList 中，将 todo 项移到 done 项时，我们认为这两项是同一项，但实际上是删除了 todo 项元素，然后再创建一个 done 项。因为两个元素的内存地址是不一样的，这个时候就需要通过一个 key 来标识他们，如果 key 相同，则认为他们是同一项。（~~有点哲学的味道，忒修斯之船、重启咲良田~~）

下面的案例，只是为了说明 key 的作用。

TODO: 快速双击按钮，会报错 `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'tick')`。暂时不清楚是不是 bug，先放在，如果是 bug，也许我可以自己查看 svelte 的源码，然后提一个 PR（~~想想就热血澎湃~~）

```svelte
<script>
    import { crossfade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    let condition = true
    let key = '1'
    const [send, receive] = crossfade({
        duration: 1000,
        easing: quintOut
    });
</script>

<button on:click={() => condition = !condition}>toggle</button>

<div class="board">
    <div class="A">
        {#if condition}
            <p in:send out:receive >true</p>
            <p in:send out:receive >true</p>
            <p in:send out:receive >true</p>
            <!-- 当消失时，它会寻找 in:send 的 key 和它相同的那一项，然后将两者认为是同一项 -->
            <p in:send out:receive={{key}} >true✨</p>
            <p in:send out:receive >true</p>
        {/if}
    </div>
    <div class="B">
        {#if !condition}
            <p in:send out:receive >FALSE</p>
            <p in:send out:receive >FALSE</p>
            <p in:send out:receive >FALSE</p>
            <p in:send={{key}} out:receive >FALSE✨</p>
            <p in:send out:receive >FALSE</p>
        {/if}
    </div>
</div>

<style>
    .board {
        width: 400px;
        margin: 100px auto;
        box-shadow: 0 0 4px 0 #ccc;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: 1em;
        justify-items: center;
    }
</style>
```

```svelte
<!-- 将代码替换成下面这样，就能正常工作了。 -->
<div class="board">
    <div class="A">
        {#if condition}
            <!-- TODO: 如果使用 #each 创建，则完全没有过渡效果
                {#each items as item (item)}
                    <p in:send={{ key: item }} out:receive={{ key: item }}>{item}</p>
                {/each}
             -->
            <p in:send={{key:1}} out:receive={{key:1}} >1</p>
            <p in:send={{key:2}} out:receive={{key:2}} >2</p>
            <p in:send={{key:3}} out:receive={{key:3}} >3</p>
        {/if}
    </div>
    <div class="B">
        {#if !condition}
            <p in:send={{key:3}} out:receive={{key:3}} >3</p>
            <p in:send={{key:1}} out:receive={{key:1}} >1</p>
            <p in:send={{key:2}} out:receive={{key:2}} >2</p>
        {/if}
    </div>
</div>
```
