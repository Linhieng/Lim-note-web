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
