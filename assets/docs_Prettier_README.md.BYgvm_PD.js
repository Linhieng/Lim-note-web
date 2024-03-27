import{_ as e,c as o,o as c,a2 as d}from"./chunks/framework.pPPfHAGV.js";const m=JSON.parse('{"title":"Prettier 基本使用","description":"","frontmatter":{},"headers":[],"relativePath":"docs/Prettier/README.md","filePath":"docs/Prettier/README.md"}'),t={name:"docs/Prettier/README.md"},i=d('<h1 id="prettier-基本使用" tabindex="-1">Prettier 基本使用 <a class="header-anchor" href="#prettier-基本使用" aria-label="Permalink to &quot;Prettier 基本使用&quot;">​</a></h1><p>prettier 插件用于文件保存时自动格式化。</p><p>prettier 包用于 ci 流，结合 husky, lint-staged, eslint 使用</p><ul><li>支持的代码 <ul><li><code>ts</code>, <code>js</code>, <code>jsx</code>, <code>vue</code></li><li><code>html</code>, <code>css</code>, <code>scss</code>, <code>less</code></li><li><code>md</code>, <code>json</code>, <code>json</code>, <code>yaml</code></li><li><code>flow</code>, <code>angular</code>, <code>Ember/Handlebars</code>, <code>GraphQL</code></li></ul></li><li>CLI <ul><li><code>prettier pattern [option]</code></li><li><code>-c</code> / <code>--check</code></li><li><code>-w</code> / <code>--write</code></li></ul></li><li>忽略文件 <ul><li>通过 <code>.prettierignore</code> 文件指定</li><li>通过代码注释 <code>/* prettier-ignore */</code> 指定</li><li>通过命令行指定 <code>prettier **/*.{js,json,jsonc} !package-lock.json --check</code></li></ul></li><li>规则配置 <ul><li>通过 <code>.prettierrc</code> 指定</li><li>在 <code>package.json</code> 中的指定 <code>prettier</code></li><li>命令行指定 <code>--single-quote</code></li></ul></li></ul>',4),l=[i];function r(s,a,n,p,_,u){return c(),o("div",null,l)}const E=e(t,[["render",r]]);export{m as __pageData,E as default};
