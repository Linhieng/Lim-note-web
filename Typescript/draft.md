# 草稿


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



[官方文档：模块解析理论](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
[官方文档：模块参考](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
[官方文档：tsconfig 参考](https://www.typescriptlang.org/tsconfig)
