# rollup 基本使用（内容来自官方文档，方便对某些内容进行注释，熟悉后大概率删除）

## 零碎说明

rollup 默认只会解析相对路径的模块。对于 `import { workspace } from "vscode"` 这种模块，rollup 会认为 `vscode` 是运行时需要的外部模块，所以不会去解析它。如果想要强制将外部模块打包处理，可以借助 `@rollup/plugin-node-resolve` 插件，或者告诉 rollup 如何找到它们。具体请查看[with npm package](https://cn.rollupjs.org/tools/#with-npm-packages)

## CLI 配置

```sh
-f, --format <format>       输出类型（amd、cjs、es、iife、umd、system）
-o, --file <output>         单个输出文件（如果不存在，则打印到 stdout）
-d, --dir <dirname>         Directory for chunks（如果不存在，则打印到 stdout）

-c, --config <filename>     指定配置文件。未指定时默认是 rollup.config.mjs -> rollup.config.cjs -> rollup.config.js

--compact                   缩小包装器代码

-m, --sourcemap             生成源映射（`-m inline` 为内联映射）
--sourcemapBaseUrl <url>    使用给定的基本 URL 发出绝对源映射 URL，命令上格式为 C:/a/b/c 最终效果是在 bundle.js.map 文件末尾添加 //# sourceMappingURL=c:/a/b/c/bundle.js.map
--sourcemapExcludeSources   在源映射中不包括源代码
--sourcemapFile <file>      指定源映射的包位置。效果是指定 .map 文件中的 file 值。
```

## 配置文件

```js
// rollup.config.js

// 可以是数组（即多个输入源）
export default {
    // 核心输入选项
    external,   // 明确指定外部模块，外部模块不会被解析打包，而是会在运行时获取。比如 external: Object.keys(pkg.dependencies)
    input,      // 入口文件。比如 input: 'src/main.js'
    plugins,

    // 进阶输入选项
    cache,
    logLevel,
    makeAbsoluteExternalsRelative,
    maxParallelFileOps,
    onLog,
    onwarn,
    preserveEntrySignatures,
    strictDeprecations,

    // 危险区域
    acorn,
    acornInjectPlugins,
    context,
    moduleContext,
    preserveSymlinks,
    shimMissingExports,
    treeshake,

    // 实验性
    experimentalCacheExpiry,
    experimentalLogSideEffects,
    experimentalMinChunkSize,
    perf,

    // 必需（可以是数组，用于描述多个输出）
    output: {
        // 核心输出选项
        dir,
        file,
        format,
        globals,
        name,
        plugins,

        // 进阶输出选项
        assetFileNames,
        banner,
        chunkFileNames,
        compact,
        dynamicImportInCjs,
        entryFileNames,
        extend,
        externalImportAssertions,
        footer,
        generatedCode,
        hoistTransitiveImports,
        inlineDynamicImports,
        interop,
        intro,
        manualChunks,
        minifyInternalExports,
        outro,
        paths,
        preserveModules,
        preserveModulesRoot,
        sourcemap,
        sourcemapBaseUrl,
        sourcemapExcludeSources,
        sourcemapFile,
        sourcemapIgnoreList,
        sourcemapPathTransform,
        validate,

        // 危险区域
        amd,
        esModule,
        exports,
        externalLiveBindings,
        freeze,
        indent,
        noConflict,
        sanitizeFileName,
        strict,
        systemNullSetters,

        // 实验性
        experimentalMinChunkSize
    },

    watch: {
        buildDelay,
        chokidar,
        clearScreen,
        exclude,
        include,
        skipWrite
    }
};
```

## 案例：处理 json 文件

1. 安装

    ```sh
    npm install --save-dev rollup @rollup/plugin-json @rollup/plugin-terser
    ```

2. 在文件中导入 json 文件

    ```js
    // src/main.js
    import foo, { add } from './foo.js'
    import { name } from './a.json' // 注意不能写成 'a.json'

    export default function () {
        console.log(foo)
        console.log(name)
        console.log(add(1, 2))
    }
    ```

3. 配置 rollup 文件

    ```js
    import { defineConfig } from 'rollup'
    import json from '@rollup/plugin-json'
    import terser from '@rollup/plugin-terser'

    export default defineConfig({ // 使用 defineConfig 导出是为了获取类型提示。
        input: 'src/main.js',
        plugins: [json()],
        output: {},
        output: [
            {
                file: 'dist/bundle.js', // 由于 output 是数组，所以无法指定 dir: 'dist' 是我不会使用吗？
                format: 'cjs',
            },
            {
                file: 'dist/bundle.min.js',
                format: 'iife',
                name: 'version',
                plugins: [terser()], // 打包后再处理的插件要放在这里
            },
        ],
    })
    ```

4. 打包

    ```sh
    npx rollup --config
    ```

5. 查看 `dist/bundle.js` 会发现 json 中的 `name` 字段自动被提取出来了，这就是 Tree Shaking

## 案例：打包 node_modeles 依赖

说明：目前已经比较熟悉了，所以不会给出很详细的步骤。

1. `npm i -D @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup the-answer log-snapshot`

2. 案例代码

    ```js
    // index.mjs
    import answer from 'the-answer';
    import a from "log-snapshot";
    export default function () {
        console.log('the answer is ' + answer);
        console.log(a)
    }
    ```

3. 配置文件

    ```js
    import { defineConfig } from "rollup";
    import resolve from '@rollup/plugin-node-resolve';
    import commonjs from "@rollup/plugin-commonjs";

    export default defineConfig({
        input: 'index.mjs',
        // 不想打包的模块，需要添加到 external 中。
        external: ['the-answer'],
        plugins: [resolve(), commonjs()],
        output: {
            format: 'cjs',
            file: 'dist.js'
        }
    })
    ```
