# ES-next

module 中的 `export`, `import` 和 `from` 是三个不同的语句。

```js
export * from './types'
import a from './a'
```

```js
// 注意下面语法并不是对象，所以不能 a: xxx 这样
export {
    a,
    b,
    c,
}

```
