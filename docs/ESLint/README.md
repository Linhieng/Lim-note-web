# ESLint 基本使用

## draft

非默认，但有用的规则：

- require-await
  - async 函数中必须使用 await

个人习惯：

```js
const rules = {
  'semi': ['error', 'never'],
  'quotes': ['error', 'single'],
  'comma-dangle': ['error', 'always-multiline'],
},
```

## 参考网站：

- [eslint](https://eslint.org/docs/latest/use/getting-started)
- [ts eslint](https://typescript-eslint.io/getting-started/)
- [eslint 所有规则](https://eslint.org/docs/latest/rules/#possible-problems)
- [eslint 推荐的规则](https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js)
- [eslint 扁平配置](https://allalmohamedlamine.medium.com/eslint-flat-config-and-new-system-an-ultimate-deep-dive-2023-46aa151cbf2b)
- [eslint 支持的参数](https://eslint.org/docs/latest/use/command-line-interface)
- [eslint 配置规则、注释语法](https://zh-hans.eslint.org/docs/latest/use/configure/rules)
  - 即将废弃的选项 (eslintrc Mode Only):
    - --no-eslintrc
    - --env
    - --ext
    - --resolve-plugins-relative-to
    - --ignore-path
    - `/* eslint-env jest */`

## 注释语法（内联注释）

- 块注释
  - `/* eslint-disable */`
  - `/* eslint-enable */`
- 禁用/启用特定规则
  - `/* eslint-disable no-alert, no-console */`
  - `/* eslint-enable no-alert, no-console */`
  - `/* eslint no-alert: "off" */`
  - `/* eslint quotes: ["error", "double"], curly: 2 */`
- 行尾注释
  - `// eslint-disable-line`
  - `/* eslint-disable-line */`
  - `// eslint-disable-line no-alert, quotes, semi`
  - `/* eslint-disable-line no-alert, quotes, semi */`
- 下一行注释
  - `// eslint-disable-next-line`
  - `/* eslint-disable-next-line */`
  - `// eslint-disable-next-line no-alert`
  - `/* eslint-disable-next-line no-alert */`

    ```js
    /* eslint-disable-next-line
      no-alert,
      quotes,
      semi
    */
    ```

- 注释描述

  ```js
  // eslint-disable-next-line semi -- 因为不喜欢分号，所以禁用 semi 规则

  /* eslint semi: "off", curly: "error"
    --------
    因为不喜欢分号，所以禁用 semi 规则 */

  /* eslint-disable-next-line semi --
   * 因为不喜欢分号，
   * 所以禁用 semi 规则
  **/
  ```

## 解决 eslint 提示的错误（旧）

### App.vue 文件提示 `Parsing error: '>' expected`

```js
module.exports = {
  // 之前:
  'parser': '@typescript-eslint/parser',
  // 之后:
  'parser': 'vue-eslint-parser',
}
```

### HelloWorld.vue 文件提示 `Parsing error: Unexpected token )`

```js
// 在 parserOptions 参数中添加 ts 解析:
module.exports = {
  'parserOptions': {
    'parser': '@typescript-eslint/parser',
  },
}
```

### `.eslintrc.cjs` 提示 `'module' is not defined.eslintno-undef`

```js
module.exports = {
  'env': {
    'node': true,
  },
}
```
