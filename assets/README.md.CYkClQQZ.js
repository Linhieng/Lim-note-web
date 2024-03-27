import{_ as s,c as i,o as a,a2 as e}from"./chunks/framework.pPPfHAGV.js";const c=JSON.parse('{"title":"WEB 开发","description":"","frontmatter":{},"headers":[],"relativePath":"README.md","filePath":"README.md"}'),t={name:"README.md"},l=e(`<h1 id="web-开发" tabindex="-1">WEB 开发 <a class="header-anchor" href="#web-开发" aria-label="Permalink to &quot;WEB 开发&quot;">​</a></h1><p>下面列出了这么多的内容，不代表每一个都会详细的在这里记录！大部分内容都应该是在官方文档中查看的。</p><ul><li>打包（bundler）<a href="https://www.zhoulujun.cn/html/tools/Bundler/vite/8770.html" target="_blank" rel="noreferrer">可参考的文章</a><ul><li><a href="https://esbuild.github.io/" target="_blank" rel="noreferrer">ESBuild</a> 快</li><li><a href="https://webpack.js.org/" target="_blank" rel="noreferrer">Webpack</a> 专注 web 开发</li><li><a href="https://rollupjs.org/" target="_blank" rel="noreferrer">Rollup</a> 专注库开发</li><li><a href="https://parceljs.org/" target="_blank" rel="noreferrer">Parcel</a> 零配置</li><li><a href="https://vitejs.dev/" target="_blank" rel="noreferrer">Vite</a> 专注 vue?</li><li><a href="https://gruntjs.com/" target="_blank" rel="noreferrer"><s>Grunt</s></a></li><li><a href="https://gulpjs.com/" target="_blank" rel="noreferrer"><s>Gulp</s></a></li><li><a href="https://swc.rs/" target="_blank" rel="noreferrer"><s>SWC - rust</s></a></li></ul></li><li>其他 <ul><li><a href="https://github.com/microsoft/monaco-editor" target="_blank" rel="noreferrer">monaco-editor</a>，vscode 的 editor 模块。</li><li><a href="https://ajv.js.org/" target="_blank" rel="noreferrer">Ajv</a> 使用 Schema 校验 json 格式</li></ul></li><li>流程管理 <ul><li><a href="https://github.com/okonet/lint-staged" target="_blank" rel="noreferrer">lint-stage</a></li><li><a href="https://github.com/typicode/husky" target="_blank" rel="noreferrer">husky</a></li><li><a href="https://github.com/sapegin/mrm" target="_blank" rel="noreferrer">Mrm</a></li></ul></li><li>检查 <ul><li><a href="https://eslint.org/" target="_blank" rel="noreferrer">ESLint</a></li><li><a href="https://prettier.io/" target="_blank" rel="noreferrer">prettier</a></li><li><a href="https://stylelint.io/" target="_blank" rel="noreferrer">Stylelint</a></li><li><a href="https://github.com/DavidAnson/markdownlint" target="_blank" rel="noreferrer">markdownlint</a></li><li><a href="https://commitlint.js.org" target="_blank" rel="noreferrer">commitlint</a></li></ul></li><li>测试 <ul><li><a href="https://jestjs.io/zh-Hans/" target="_blank" rel="noreferrer">Jest</a></li><li><a href="https://testing-library.com/" target="_blank" rel="noreferrer">Testing Library</a></li><li><a href="https://validator.w3.org/" target="_blank" rel="noreferrer">W3C Check HTML</a></li><li><a href="https://jigsaw.w3.org/css-validator/#validate_by_uri+with_options" target="_blank" rel="noreferrer">W3C Check CSS</a></li></ul></li><li>转译 <ul><li><a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a></li><li><a href="https://sass-lang.com/" target="_blank" rel="noreferrer">Scss</a></li><li><a href="https://postcss.org/" target="_blank" rel="noreferrer">PostCSS</a></li><li><a href="https://lesscss.org/" target="_blank" rel="noreferrer">Less</a></li></ul></li><li>前端框架 <ul><li><a href="https://svelte.dev/" target="_blank" rel="noreferrer">Svelte</a></li><li><a href="https://vuejs.org/" target="_blank" rel="noreferrer">Vue</a></li><li><a href="https://react.dev/" target="_blank" rel="noreferrer">React</a></li></ul></li><li>后端 <ul><li><a href="https://expressjs.com/" target="_blank" rel="noreferrer">Express</a></li><li><a href="https://nodejs.org/en" target="_blank" rel="noreferrer">NodeJS</a></li><li><a href="https://mongoosejs.com/" target="_blank" rel="noreferrer">Mongoose</a></li><li><a href="https://www.docker.com/" target="_blank" rel="noreferrer">Docker</a></li><li><a href="https://www.nginx.com/" target="_blank" rel="noreferrer">Nginx</a></li></ul></li><li>包管理 <ul><li><a href="https://www.npmjs.com/" target="_blank" rel="noreferrer">npm</a></li><li><a href="https://pnpm.io/" target="_blank" rel="noreferrer">pnpm</a></li><li><a href="https://yarnpkg.com/" target="_blank" rel="noreferrer">yarn</a></li></ul></li></ul><h2 id="eslint-prettier-husky-lint-staged" tabindex="-1">ESLint + Prettier + Husky + lint-staged [+...] <a class="header-anchor" href="#eslint-prettier-husky-lint-staged" aria-label="Permalink to &quot;ESLint + Prettier + Husky + lint-staged [+...]&quot;">​</a></h2><p>Prettier 版本始终会更改样式，所以控制 prettier 的版本比使用 prettier 更重要，为此，安装时会添加 <code>--save-exact</code> 参数。</p><ol><li><p>安装</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @eslint/config</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # npm install --save-dev eslint</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --save-dev</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --save-exact</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> prettier</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdownlint-cli2</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --save-dev</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># npm install --save-dev eslint-config-prettier</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># npm install --save-dev stylelint stylelint-config-standard-scss</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mrm@2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> lint-staged</span></span></code></pre></div></li><li><p>配置 <code>package.json</code> 中的 <code>lint-staged</code></p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;lint-staged&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;*.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;eslint --cache --fix&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;*.{js,json,jsonc}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;prettier --write&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;*.md&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;markdownlint-cli2&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li><li><p>配置 <code>.prettierrc</code></p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;useTabs&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;tabWidth&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;semi&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;singleQuote&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li><li><p>配置 <code>.markdownlint-cli2.jsonc</code></p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;config&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;MD007&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;indent&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li></ol><h2 id="模块" tabindex="-1">模块 <a class="header-anchor" href="#模块" aria-label="Permalink to &quot;模块&quot;">​</a></h2><ul><li>CommonJS 模块，设置后缀名为 <code>cjs</code> 可显式声明为 CommonJS 模块</li><li>ES 模块，设置后缀名为 <code>mjs</code> 可显式声明为 ES 模块。</li><li>后缀名为 <code>js</code>，默认是 CommonJS 模块，在 package.json 中设置 <code>&quot;type&quot;: &quot;module&quot;</code> 可修改为 ES 模块</li><li>ESM 浏览器原生模块</li></ul><h3 id="es-基本用法" tabindex="-1">ES 基本用法 <a class="header-anchor" href="#es-基本用法" aria-label="Permalink to &quot;ES 基本用法&quot;">​</a></h3><p><a href="https://cn.rollupjs.org/es-module-syntax/" target="_blank" rel="noreferrer">基本的使用 - 导入和导出</a></p><p>获取路径</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { fileURLToPath } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;node:url&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> __dirname</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fileURLToPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.url))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(__dirname)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fileURLToPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.url))) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 当前文件完整路径</span></span></code></pre></div>`,12),n=[l];function r(h,p,k,o,d,g){return a(),i("div",null,n)}const u=s(t,[["render",r]]);export{c as __pageData,u as default};
