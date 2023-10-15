# ESLint 基本使用

参考网站：

- [所有可配置项（规则）](https://eslint.org/docs/latest/rules/#possible-problems)
- [知名 ESLint 配置](https://www.npmjs.com/search?ranking=popularity&q=keywords%3Aeslintconfig)

## 解决 eslint 提示的错误

相关注释语法：

- `// @ts-ignore` 忽略下一行报错
- `// @ts-nocheck` 忽略后面所有报错
- `// @ts-check`
- `// @ts-expect-error`
- `/* eslint-disable */`
- `/* eslint-enable */`
- `// eslint-disable-line` 写在报错行后面
- `/* eslint-env jest */` 指定当前文件的环境为 jest

### App.vue 文件提示 `Parsing error: '>' expected`

```cjs
module.exports = {
  // 之前:
  'parser': '@typescript-eslint/parser',
  // 之后:
  'parser': 'vue-eslint-parser',
}
```

### HelloWorld.vue 文件提示 `Parsing error: Unexpected token )`

```cjs
// 在 parserOptions 参数中添加 ts 解析:
module.exports = {
  'parserOptions': {
    'parser': '@typescript-eslint/parser',
  },
}
```

### `.eslintrc.cjs` 提示 `'module' is not defined.eslintno-undef`

```cjs
module.exports = {
  'env': {
    'node': true,
  },
}
```
