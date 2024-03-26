<!-- spell-checker:ignore lintstagedrc commitlintrc -->
# 流程管理

- [husky](https://typicode.github.io/husky/getting-started.html): git hook
- [lint-staged](https://github.com/okonet/lint-staged): 搭配 husky 使用，只对 commit 的文件进行处理。
- commitlint
- eslint
- prettier
- markdownlint
- [commitizen](https://www.npmjs.com/package/commitizen): 可选，这是一个命令行交互工具

## husky

```sh
npx husky-init ; npm install
# npx husky-init && npm install
```

或

```sh
npm install husky -D
npm pkg set scripts.prepare="husky install"
npm run prepare
npx husky add .husky/pre-commit "npm test"
```

> 为什么 husky 需要 `"prepare": "husky install"`
>
> `prepare` 是 npm 生命周期中的一个阶段，当执行 `npm install` 时会自动运行该脚本。当别人拉取仓库时，第一件事一般就是 `npm i`，如果没有 `prepare` 脚本，那么新手可能根本不知道还有执行 `husky install`，这样一来，husky 中定义的脚本对他们来说就形容虚设。
>
> 更多信息可查看 [script 的生命周期](https://docs.npmjs.com/cli/v7/using-npm/scripts#life-cycle-scripts)

## lint-staged

1. 安装

    ```sh
    npm install --save-dev lint-staged
    ```

2. 添加到 husky

    将 `.husky\pre-commit` 中的 `npm test` 替换成 `npx lint-staged`，或者执行 `npx husky add .husky/pre-commit "npx lint-staged"`

3. 配置

    有以下几种配置方式：

    - 在 `package.json` 中配置 `lint-staged`
    - 使用 `.lintstagedrc` 文件（可以是 json 或 yml 格式）
    - 使用 `.lintstagedrc.mjs` 或 `lint-staged.config.mjs` 文件（ESM 格式 `export default { ... }`）。
    - 使用 `.lintstagedrc.cjs` 或 `lint-staged.config.cjs` 文件（CommonJS 格式 `module.exports = { ... }` ）。
    - 使用 `.lintstagedrc.js` 或 `lint-staged.config.js` 文件（格式取决于 `package.json` 中的 `"type": "module"`）。
    - 通过 `-c` 或 `--config` 指定配置文件。

## commitlint

1. 安装

    ```sh
    npm install --save-dev @commitlint/config-conventional @commitlint/cli
    echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
    # @commitlint/config-conventional 是官方提供的配置规则
    ```

2. 配置

    有以下几种配置方式：

    - 在 `package.json` 中配置 `commitlint`
    - `.commitlintrc`
    - `.commitlintrc.js`
    - `.commitlintrc.yml`
    - `.commitlintrc.json`
    - `commitlint.config.js`

3. 添加到 husky 中

    ```sh
    npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
    ```

    或

    ```sh
    npm pkg set scripts.commitlint="commitlint --edit"
    npx husky add .husky/commit-msg 'npm run commitlint ${1}'
    ```

## eslint

```sh
npm init @eslint/config
# 创建配置文件
```

## prettier

1. 安装

    ```sh
    npm install --save-dev --save-exact prettier
    npm install --save-dev eslint-config-prettier
    ```

2. 配置

    prettier 支持的配置方式有：

    - 在 `package.json` 中配置 `prettier`
    - `.prettierrc` 文件（格式为 JSON 或 YAML）
    - `.prettierrc.(json|yml|yaml|json5)`
    - `.prettierrc.js` 或 `prettier.config.js`
    - `.prettierrc.mjs` 或 `prettier.config.mjs`
    - `.prettierrc.cjs` 或 `prettier.config.cjs`
    - `.prettierrc.toml`

    `eslint-config-prettier` 的作用是关闭 eslint 中和 prettier 冲突的配置项，使用方法是：

    ```json
    {
        "extends": [
            /* ... */
            "prettier"
        ]
    }
    ```

## markdownlint

```sh
npm install --save-dev markdownlint-cli2
```

创建 `.markdownlint-cli2.jsonc` 文件

```json
{
    "config": {
        "MD007": { "indent": 4 }
    }
}
```
