# 草稿

## Svelte 的响应式是由赋值语句触发的，非赋值语句不会触发，它是如何实现的？

```html
<script>
    let obj = {
        foo: {
            bar: 1
        }
    }

    function addNumber() {
        // obj.foo.bar += 1 通过这种方式就会触发响应式
        const foo = obj.foo
        foo.bar += 1 // 这种方式就不会触发响应式
    }

    $: sum = obj.foo.bar;
</script>

<button on:click={addNumber}>
    Add {sum}
</button>
```

## Svelte 中的 each 的 key 不能使用下标

[案例](https://www.svelte.cn/tutorial/keyed-each-blocks)

简单说一下 key 的作用，当整个数组 `things` 变化时，默认会重新渲染所有元素。
但通过指定 key 则可以减少渲染次数。

具体来说，当 key 不变时，不会重新渲染该元素，当 key 改变时，则会重新渲染该元素（卸载之前的元素）。

```svelte
<!-- 如果使用 (i) 作为 key，则无效。 -->
{#each things as {color, id}, i (id)  }
    <Thing current={color} id={i} />
{/each}
```
