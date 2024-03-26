# Commitlint

commit 的格式一般是：

```
type(scope): subject

description(body).

description(footer).
```

## Rules

Rules 案例：

```js
module.exports = {
    // 继承 @commitlint/config-conventional 配置
    extends: ['@commitlint/config-conventional'],
    // 定义自己的规则，用于覆盖继承的配置
    rules: {
        // 支持的 type
        'type-enum': [ 2, 'always', [ 'build', 'chore', 'feat' ] ],
        // type 只允许小写
        'type-case': [2, 'always', 'lower-case'],
        // type 不能为空
        'type-empty': [2, 'never'],

        //
        // 'scope-enum': []
        // 'scope-case': []

        // subject 不能为空
        'subject-empty': [2, 'never'],
        // subject 不能以 . 结尾
        'subject-full-stop': [2, 'never', '.'],

        // header 最大长度为 100
        'header-max-length': [2, 'always', 100],

        // body 前要有空行，级别是警告
        'body-leading-blank': [1, 'always'],
        // body 单行最大长度
        'body-max-line-length': [2, 'always', 100],

        // footer 前要有空行，级别是警告
        'footer-leading-blank': [1, 'always'],
        // footer 单行最大长度
        'footer-max-line-length': [2, 'always', 100],
    },
}
```

[点击查看可选的 key](https://commitlint.js.org/#/reference-rules?id=available-rules)。

value 是一个数组，由三部分组成：

- `Level`: 错误级别。`0` 表示 disabled；`1` 表示 warn；`2` 表示 error；
- `Applicable`: 只能是 `always` 或 `never`。表示什么时候使用该规则。设置为 `never` 表示颠倒规则，比如 `'type-empty': [2, 'never']` 就是类型不能为空。
- `Value`: 规则具体的值，具体是什么格式需要参考文档。
