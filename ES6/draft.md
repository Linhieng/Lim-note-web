# 草稿

## __dirname

```ts
import { fileURLToPath } from 'node:url'
// import.meta.url 是当前文件 url，需要通过 fileURLToPath 转换为路径
const __dirname = fileURLToPath(new URL('.', import.meta.url))
console.log(import.meta.url)
console.log(__dirname) // 获取当前文件所在文件夹
```

或者借助 dirname 获取所在文件夹

```ts
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);
```

## 异步模块

异步导出：

```js
// b.mjs
export default await new Promise((resolve, reject) => {
    setTimeout(() => resolve('data'), 3000)
    setTimeout(() => reject('err'), 100)
})
```

导入时也需要异步导入，而不能是同步导入

```js
// ❌bad 不要这样导入，因为这样不仅会阻塞同步代码的运行，而且无法捕获错误
import b from './b.mjs'
console.log(b)
```

```js
try {
    const b = await import('./b.mjs')
} catch (error) {
    console.error('Error importing module.', error)
}
```

如果可以自己处理 b.mjs 文件，则可以只导出一个 promise：

```js
// b.mjs
export default new Promise((resolve, reject) => {
    setTimeout(() => resolve('data'), 3000)
    setTimeout(() => reject('err'), 100)
})
```

```js
import b from './b.mjs'
try {
    const moduleB = await b
    console.log(moduleB)
} catch (error) {
    console.error('Error importing module:', error)
}
```
