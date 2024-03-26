# Prettier 基本使用

prettier 插件用于文件保存时自动格式化。

prettier 包用于 ci 流，结合 husky, lint-staged, eslint 使用

- 支持的代码
    - `ts`, `js`, `jsx`, `vue`
    - `html`, `css`, `scss`, `less`
    - `md`, `json`, `json`, `yaml`
    - `flow`, `angular`, `Ember/Handlebars`, `GraphQL`
- CLI
    - `prettier pattern [option]`
    - `-c` / `--check`
    - `-w` / `--write`
- 忽略文件
    - 通过 `.prettierignore` 文件指定
    - 通过代码注释 `/* prettier-ignore */` 指定
    - 通过命令行指定 `prettier **/*.{js,json,jsonc} !package-lock.json --check`
- 规则配置
    - 通过 `.prettierrc` 指定
    - 在 `package.json` 中的指定 `prettier`
    - 命令行指定 `--single-quote`
