# WEB 开发

下面列出了这么多的内容，不代表每一个都会详细的在这里记录！大部分内容都应该是在官方文档中查看的。

- 流程管理
    - [lint-stage](https://github.com/okonet/lint-staged)
    - [husky](https://github.com/typicode/husky)
    - [Mrm](https://github.com/sapegin/mrm)
- 检查
    - [ESLint](https://eslint.org/)
    - [prettier](https://prettier.io/)
    - [Stylelint](https://stylelint.io/)
    - [markdownlint](https://github.com/DavidAnson/markdownlint)
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
    - [Vue](https://vuejs.org/)
    - [React](https://react.dev/)
- 后端
    - [Express](https://expressjs.com/)
    - [NodeJS](https://nodejs.org/en)
    - [Mongoose](https://mongoosejs.com/)
    - [Docker](https://www.docker.com/)
    - [Nginx](https://www.nginx.com/)
- 打包构建工具
    - [ESBuild](https://esbuild.github.io/)
    - [Webpack](https://webpack.js.org/)
    - [Vite](https://vitejs.dev/)
    - [Parcel](https://parceljs.org/)
    - [Rollup](https://rollupjs.org/)
    - [Grunt](https://gruntjs.com/)
    - [Gulp](https://gulpjs.com/)
    - [SWC - rust](https://swc.rs/)
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
