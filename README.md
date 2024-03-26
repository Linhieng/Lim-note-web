# WEB 开发

下面列出了这么多的内容，不代表每一个都会详细的在这里记录！大部分内容都应该是在官方文档中查看的。

- 打包（bundler）[可参考的文章](https://www.zhoulujun.cn/html/tools/Bundler/vite/8770.html)
    - [ESBuild](https://esbuild.github.io/) 快
    - [Webpack](https://webpack.js.org/) 专注 web 开发
    - [Rollup](https://rollupjs.org/) 专注库开发
    - [Parcel](https://parceljs.org/) 零配置
    - [Vite](https://vitejs.dev/) 专注 vue?
    - [~~Grunt~~](https://gruntjs.com/)
    - [~~Gulp~~](https://gulpjs.com/)
    - [~~SWC - rust~~](https://swc.rs/)
- 其他
    - [monaco-editor](https://github.com/microsoft/monaco-editor)，vscode 的 editor 模块。
    - [Ajv](https://ajv.js.org/) 使用 Schema 校验 json 格式
- 流程管理
    - [lint-stage](https://github.com/okonet/lint-staged)
    - [husky](https://github.com/typicode/husky)
    - [Mrm](https://github.com/sapegin/mrm)
- 检查
    - [ESLint](https://eslint.org/)
    - [prettier](https://prettier.io/)
    - [Stylelint](https://stylelint.io/)
    - [markdownlint](https://github.com/DavidAnson/markdownlint)
    - [commitlint](https://commitlint.js.org)
- 测试
    - [Jest](https://jestjs.io/zh-Hans/)
    - [Testing Library](https://testing-library.com/)
    - [W3C Check HTML](https://validator.w3.org/)
    - [W3C Check CSS](https://jigsaw.w3.org/css-validator/#validate_by_uri+with_options)
- 转译
    - [TypeScript](https://www.typescriptlang.org/)
    - [Scss](https://sass-lang.com/)
    - [PostCSS](https://postcss.org/)
    - [Less](https://lesscss.org/)
- 前端框架
    - [Svelte](https://svelte.dev/)
    - [Vue](https://vuejs.org/)
    - [React](https://react.dev/)
- 后端
    - [Express](https://expressjs.com/)
    - [NodeJS](https://nodejs.org/en)
    - [Mongoose](https://mongoosejs.com/)
    - [Docker](https://www.docker.com/)
    - [Nginx](https://www.nginx.com/)
- 包管理
    - [npm](https://www.npmjs.com/)
    - [pnpm](https://pnpm.io/)
    - [yarn](https://yarnpkg.com/)

## ESLint + Prettier + Husky + lint-staged [+...]

Prettier 版本始终会更改样式，所以控制 prettier 的版本比使用 prettier 更重要，为此，安装时会添加 `--save-exact` 参数。

1. 安装

    ```sh
    npm init @eslint/config # npm install --save-dev eslint
    npm install --save-dev --save-exact prettier
    npm install markdownlint-cli2 --save-dev
    # npm install --save-dev eslint-config-prettier
    # npm install --save-dev stylelint stylelint-config-standard-scss
    npx mrm@2 lint-staged
    ```

2. 配置 `package.json` 中的 `lint-staged`

    ```json
    "lint-staged": {
        "*.js": "eslint --cache --fix",
        "*.{js,json,jsonc}": "prettier --write",
        "*.md": "markdownlint-cli2"
    }
    ```

3. 配置 `.prettierrc`

    ```json
    {
        "useTabs": false,
        "tabWidth": 2,
        "semi": true,
        "singleQuote": false
    }
    ```

4. 配置 `.markdownlint-cli2.jsonc`

    ```json
    {
        "config": {
            "MD007": { "indent": 4 }
        }
    }
    ```

## 模块

- CommonJS 模块，设置后缀名为 `cjs` 可显式声明为 CommonJS 模块
- ES 模块，设置后缀名为 `mjs` 可显式声明为 ES 模块。
- 后缀名为 `js`，默认是 CommonJS 模块，在 package.json 中设置 `"type": "module"` 可修改为 ES 模块
- ESM 浏览器原生模块

### ES 基本用法

[基本的使用 - 导入和导出](https://cn.rollupjs.org/es-module-syntax/)

获取路径

```js
import { fileURLToPath } from 'node:url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
console.log(__dirname)
console.log(fileURLToPath(new URL(import.meta.url))) // 当前文件完整路径
```
