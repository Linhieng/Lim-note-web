# 草稿


## 工具类型

| Utility Types   | desc                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Partial<Type>` | Constructs a type with all properties of Type set to optional. This utility will return a type that represents all subsets of a given type. |
|                 |                                                                                                                                             |


## 配置文件 compilerOptions

- noEmit
  - Disable emitting file from a compilation.
  - 编译时只进行类型检查，不生成 js 文件

- emitDeclarationOnly
  - 只生成 .d.ts 文件，不生成 js 文件

- module
  - 指定程序的模块类型（AMD, UMD, CommonJS, ES6, Node16 等等）
  - 该值会影响 moduleResolution 配置项
  - 问题：ES6 和 Node16 或 ESNext 和 NodeNext 有啥区别？

- moduleResolution
  - 指定模块解析策略
  - 通常只用到 bundler 或者 NodeNext/Node16
  - 问题：为什么设置为 bundler 时，要求 module 为 ES?

- allowImportingTsExtensions
  - 允许导入时添加 ts 后缀名。
  - 添加后缀名时，可能导致 vscode 扩展调试时无法断点
  - 问题：为什么添加 ts 后缀名时，需要配置 moduleResolution 并且不输出 js 文件？
  - 回答：这个和 ts 的解析 ts 文件有关，详见[官方文档：模块解析理论]

- target
  - 指定的是 js 语言规范的版本，而不是模块的版本。所以可选值全是 ES！
  - 此 ES 指的是 js 语言规范，而不是模块中的 ES 模块！


## 声明文件

### exports 导出类型

```json
// node_modules/my-module/package.json
{
  "name": "my-module",
  "types": "./index.d.ts",
  "exports": "./index.js"
}
```

- ts 案例

```js
// node_modules/my-module/index.d.ts

// ts 中导入类型，前提是声明文件中有将该类型导出
export type Hello = () => string

interface MyModule {
    hello: Hello
}

declare const myModule: MyModule

export default myModule
```

```ts
// index.ts
import myModule from "my-module";
import type { Hello } from "my-module";

const hello: Hello

console.log(myModule.); // 获得类型提示
```

- esm 案例

```js
// node_modules/my-module/index.d.ts
interface MyModule {
    hello: () => string
}

// 记得 const 不能省略
const myModule: MyModule

export default myModule
```

```js
// index.mjs
import myModule from "my-module";

console.log(myModule.); // 获得类型提示
```

- cjs 案例

前面的两种声明文件写法，你在 cjs 文件中会发现是没办法直接获得提示的，需要从先 `.default` 后可以获得类型提示。解决这个问题的方法就是使用 `export = xx`

```js
// node_modules/my-module/index.d.ts
interface MyModule {
    hello: () => string
}

const myModule: MyModule

export = myModule

```

```js
const myModule = require('my-module')

console.log(myModule.); // 没有 default，可以直接获得类型提示
```

### 手写模块类型

在 package.json 中有一个默认的 `types` 字段，可以统一为整个模块提供类型声明。

案例：

```json
// node_modules/my-module/package.json
{
    "name": "my-module",
    "types": "./type.d.ts",
    "exports": {
        ".": "./bundle/index.mjs",
        "./foo": "./bundle/foo.mjs",
        "./foo.js": "./bundle/foo.mjs"
    }
}
```

```ts
// node_modules/my-module/type.d.ts

// 这里注释掉，作为对比。ts 并不会自动为模块提供后缀
// declare module 'my-module/foo.js' {
//     type Foo = string

//     const foo: Foo;
//     export default foo;
// }

// 为 'my-module/foo' 提供类型声明
declare module 'my-module/foo' {
    type Foo = string

    const foo: Foo;
    export default foo;
}

// 为主入口提供类型声明
declare module 'my-module' {

    interface MyModule {
        str: string
    }

    const myModule: MyModule;
    export default myModule;
}

```

```js
import myModule from 'my-module'
import foo from 'my-module/foo'
import foo2 from 'my-module/foo.js'

console.log(myModule.); // 获得类型声明
console.log(foo.); // 获得类型声明
console.log(foo2.); // 没有类型声明
```



[官方文档：模块解析理论](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
[官方文档：模块参考](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
[官方文档：tsconfig 参考](https://www.typescriptlang.org/tsconfig)
