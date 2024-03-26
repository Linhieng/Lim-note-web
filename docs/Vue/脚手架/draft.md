# 草稿

## vue-cli 配置 webpack，实现将 svg 转换为 vue 组件

### 简单认识

先来个案例：对 `.abcd` 后缀的文件进行预处理。

```js
/* vue.config.js */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        port: 8081,
    },
    chainWebpack: (config) => {
        // loader 的执行顺序是自下而上的 abc.js --> vue-loader
        config.module
            .rule('abcd') // rule 名称，仅仅是个标识符
            .test(/\.abcd$/)

            // use 和 loader 是整体
            .use('vue-loader') // 这里也只是一个标识符
            .loader('vue-loader') // 这个就是模块了

            .end()

            .use('abc')
            .loader('./abc.js') // 对于自定义的 loader，需要给出路径
    },
})
```

调用 `.loader` 是跟在 `.use` 之后的，就像 webpack 中的配置一样：`rule:{ loader: '' }`。虽然 webpack 中的 rule 没有标识符，但似乎可以通过特殊注释类提供 rule 的名称，比如 `vue inspect` 中的 `/* config.module.rule('esm') */` 注释

自定义的 loader，就像是管道一样，接收输入，然后输出。

```js
// abc.js
// 在这里我们只是简单的将它包裹在 template 标签中
module.exports = function (data) {
    debugger
    return `<template>${data}</template>`
}

```

配置好后，下面是一个使用案例：

```vue
<template>
    <i class="icon-box">
        <XX></XX>
    </i>
</template>
<script setup>
import XX from './a.abcd'
</script>
```

因为 `vue-loader` 就是将 `.vue` 文件进行处理的，它要求一定要有一个顶级 `<template>` 或 `<script>`，所以我们只需要简单地用 `<template>` 包裹起来，就可以让 `vue-loader` 处理为组件了。webpack 插件 [`vue-svg-loader`](https://github.com/damianstasik/vue-svg-loader/tree/dev) 做的也正是这件事。

在这里顺便提一下 vue 源码。每一个 vue 文件中的模版标签会经过 `createElement` 的处理。`createElement` 源码在 `runtime-dom/nodeOps` 中。

### 自定义 svg loader

虽然原理很简单，但实际使用时总有各种问题。如果你简单的照搬上面的实现方式，来处理 `.svg` 后缀名，那么你会发现不生效。

```js
defineConfig({
    chainWebpack: (config) => {
        const svgRule = config.module.rule('svg')
        svgRule.uses.clear()
        svgRule
            .use('vue-loader')
            .loader('vue-loader')
            .end()
            .use('svg-wrap-template')
            .loader('./scripts/svg-wrap-template.js')
    },
})
```

但是通过 webpack 配置的方式就可以了：

```js
defineConfig({
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    type: 'javascript/auto',
                    use: [
                        { loader: 'vue-loader' },
                        { loader: './scripts/svg-wrap-template.js' },
                    ],
                },
            ],
        },
    },
})
```

有关 `type` 的可选值，请查看 [文档](https://www.webpackjs.com/configuration/module/#ruletype)

注意，上面实现的 loader，会将所有 svg 识别为组件。而 vue-cli 默认会将 svg 识别为外部资源，所以当 `import svg from 'xx.svg'` 时，svg 只是一个路径字符串，具体运行 `vue inspect` 查看其 webpack 配置，核心内容在下面：

```js
{
    test: /\.(svg)(\?.*)?$/,
    type: 'asset/resource',
    generator: {
        filename: 'img/[name].[hash:8][ext]'
    }
},
```

`generator.filename` 所定义的就是路径字符串的格式。
