# webpack 使用

## 配置文件

- `resolve` 模块解析，即解析 require 或 import 中的路径。具体查看[文档](https://www.webpackjs.com/concepts/module-resolution)
- `externals` 排除外部依赖。意思是这里面声明的依赖将会在运行时获取，不需要打包。具体可参考[文档](https://www.webpackjs.com/configuration/externals/)
- `output.library` 告诉 webpack 输出的文件是一个库，而不是可执行文件。具体可参考[文档](https://www.webpackjs.com/configuration/output/#outputlibrary)

## 解决报错

- 使用 vue-cli 时阻止 webpack 的报错信息直接显示在页面上

    ```js
    // vue.config.js
    module.exports = defineConfig({
        devServer: {
            client: {
                overlay: false,
            },
        },
    })
    ```
