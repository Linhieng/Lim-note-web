# 草稿

## 使用 as const 收缩类型

narrowing types using 'as const'

```ts
const data1 = {
  name: 'Alan'  // 此时会推断 string 类型，因为对象的字段容易被改变
}

const data2 = {
  name: 'Alan'  // 此时会推断字符串 Alan
} as const
```

## 类型断言

```ts
function assertString(someThing: any): asserts someThing is string {
    if (!(typeof someThing === 'string')) {
        throw new Error('Not a String type!')
    }
}
let x: any
assertString(x)
x. // 获得类型 string
```

## 类型守卫、鸭子类型

使用一个函数判断类型时，ts 并不会自动推断类型：

```ts
function isString(x: any) {
    if (typeof x === 'string') {
        return true
    } else {
        return false
    }
}
let abc: any
if (isString(abc)) {
    abc. // 此时无法获得类型提示
}
```

这个时候就需要类型守卫

```ts
function isString(x: any): x is string {
    if (typeof x === 'string') {
        return true
    } else {
        return false
    }
}
let abc: any
if (isString(abc)) {
    abc. // 获得类型提示
}
```

不过，新版本的 ts (5.5) 即将支持自动推断类型守卫，详见 [#57465](https://github.com/microsoft/TypeScript/pull/57465)。这意味这前面的第一个案例可以直接生效。甚至可以简写成：

```ts
const isString = (x: any) => typeof x === 'string'
let abc: any
if (isString(abc)) {
    abc. // 获取类型提示
}
```

## noImplicitThis

```ts
const obj = {
    name: 'obj',
    getName() {
      return this. // 设置 noImplicitThis 为 true 时这里会获得类型提示
    }
}
```

## 让一个字段的类型，由另外一个字段的类型决定

文章 [掘金](https://juejin.cn/post/7349107838931435530)

案例一

```ts
enum ShapeType {
    Square = 1,
    Circle = 2
}
interface Square {
    size: number;
}
interface Circle {
    radius: number;
}

type MutableRecord<U> = {
    [SubType in keyof U]: {
        type: SubType;
        data: U[SubType]
    };
}[keyof U];

type Shape = MutableRecord<{
    [ShapeType.Square]: Square;
    [ShapeType.Circle]: Circle;
}>;


const circle: Shape = {
    type: ShapeType.Circle,
    data: {
        // 这里只出现 radius
    }
};
const square: Shape = {
    type: ShapeType.Square,
    data: {
        // 这里只出现 size
    }
};
```

## 工具类型

| Utility Types        | desc                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Partial<Type>`      | Constructs a type with all properties of Type set to optional. This utility will return a type that represents all subsets of a given type.                          |
| `Record<Keys, Type>` | Constructs an object type whose property keys are Keys and whose property values are Type. This utility can be used to map the properties of a type to another type. |


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


## 声明文件的两种状态

需求来源：不想使用 ts，想用使用 jsDoc 开发，但又想要用 ts 的声明文件，结果发现当在 ts 中导入类型时，jsDoc 就无法自动获取类型了。

ts 有两种模块声明文件：

- local (normal modules)
- ambient (global)

只有当声明文件中没有使用任何 import 时，该声明文件被认为是 ambient，此时 jsDoc 中可以获取类型注释。当有时候我们需要在声明文件中使用其他声明文件的类型，就不得不用到 import，而这就会导致声明文件变成本地模块，使用时必须导入。这个问题在 TS2.9 版本中得到了解决 —— 使用 `import()` 来获取类型声明。

下面是一个案例，已经对实际项目代码进行抽离，bar 代表的是外部模块提供的类型。

> 在 vscode 中测试时，如果关闭了声明文件编辑器后，就获取不到类型提示了，那么可以尝试在根目录中创建一个 jsconfig.json 文件（不是 tsconfig.json 文件）

情况一：简单情况

```ts
// foo.d.ts
type Foo = number
```

```js
/**
 * @type {Foo} - 此时可以直接获得 Foo 类型
 */
let foo
```

情况二：复杂情况

```ts
// bar.d.ts
export type Bar = number
```

```ts
// foo.d.ts
import type { Bar } from "./bar"
type Foo = Bar
```

```js
/**
 * @type {Foo} - 此时无法解析类型，vscode 中鼠标放在这里会提示 type Foo = /*unresolved*/ any
 */
let foo


// 需要导入才可以解决
/**
 * @type {import("./types").Foo} - 现在就可以获取类型提示了
 */
let foo
```

情况三：使用 `import()` 解决情况二的痛点

```ts
// bar.d.ts
export type Bar = number
```

```ts
// foo.d.ts
type Foo = import('./bar').Bar
```

```js
/**
 * @type {Foo} - 此时就又可以直接获取到类型了
 */
let foo
```


参考 [import-class-in-definition-file-d-ts](https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts)

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
