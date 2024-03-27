import{_ as s,c as i,o as a,a2 as n}from"./chunks/framework.pPPfHAGV.js";const o=JSON.parse('{"title":"ts 的使用","description":"","frontmatter":{},"headers":[],"relativePath":"docs/Typescript/README.md","filePath":"docs/Typescript/README.md"}'),h={name:"docs/Typescript/README.md"},l=n(`<h1 id="ts-的使用" tabindex="-1">ts 的使用 <a class="header-anchor" href="#ts-的使用" aria-label="Permalink to &quot;ts 的使用&quot;">​</a></h1><p>简单的使用我已经熟悉了，所以这里暂时只记录一些遇到的案例</p><ul><li>注释语法 <ul><li><code>// @ts-check</code> 对当前文件进行 ts 类型检查，通常用于 js 文件或者被 tsconfig.json 忽略的文件</li><li><code>// @ts-nocheck</code> 不对当前文件进行 ts 类型检查</li><li><code>// @ts-ignore</code> / <code>// @ts-expect-error</code> 忽略下一行报错</li></ul></li></ul><h2 id="查漏补缺" tabindex="-1">查漏补缺 <a class="header-anchor" href="#查漏补缺" aria-label="Permalink to &quot;查漏补缺&quot;">​</a></h2><ul><li>The presence of input files specified on the command line results in the exclusion of tsconfig.json files. <a href="https://github.com/microsoft/TypeScript/issues/27379" target="_blank" rel="noreferrer">#27379</a></li><li>类型守卫(type guard)：ts 支持条件语句中的 <code>typeof</code> 和 <code>instanceof</code> 进行自动类型推断</li><li>使用泛型时，允许省略泛型参数：<code>Interface interface ApiResponse&lt;T = any&gt; {}</code> 其中的 <code>= any</code> 就是我想要的</li></ul><h2 id="未解决的需求" tabindex="-1">未解决的需求 <a class="header-anchor" href="#未解决的需求" aria-label="Permalink to &quot;未解决的需求&quot;">​</a></h2><ul><li><p>变量需要在后面某个过程中才赋值，具体的类型也需要通过赋值才能确定，这种情况下如何提供类型支持</p><p>下面是案例代码，全部写在一起是可以获得 wrapper 和 numberField 的类型提示的。 但如果想要把 numberField 声明在 describe 里面，然后在 beforeAll 中初始化。 是否能够让 numberField 在初始化时定义类型，这样在 it 中使用时也可获得类型提示。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { mount } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@vue/test-utils&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JsonSchemaForm, { NumberField } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;../../lib&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">describe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;测试 SchemaForm&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    it</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;应该渲染出一个 NumberField 组件&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;hello&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> wrapper</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(JsonSchemaForm, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            props: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                schema: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;number&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                value,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                onChange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">v</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> numberField</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> wrapper.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findComponent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(NumberField)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        expect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(numberField.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">exists</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toBeTruthy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div></li></ul><h2 id="解决需求" tabindex="-1">解决需求 <a class="header-anchor" href="#解决需求" aria-label="Permalink to &quot;解决需求&quot;">​</a></h2><ul><li><p>声明变量类型保持不变</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 如果写成下面这样，那么 editorRef 的值会被认为可能是 undefined</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> editorRef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Monaco</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">editor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">IStandaloneCodeEditor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 但如果我们能保证除了初始值是 undefined，后续使用到时肯定是 Monaco.editor.IStandaloneCodeEditor 类型的话，可以进行类型断言</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> editorRef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Monaco</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">editor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">IStandaloneCodeEditor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// null! 会告诉告诉 ts，虽然初始值是 null，但后续一定不会是 null</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 所以我们需要保证后续确实不会是空，不然可能会导致编译时错误。</span></span></code></pre></div></li><li><p>对枚举类型进行自动联合</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">enum</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> enums</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    A</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;a&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    B</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Values</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\${</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">enums</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 类型为 &quot;a&quot; | &quot;b&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Keys</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> keyof</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> enums; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 类型为 &quot;A&quot; | &quot;B&quot;</span></span></code></pre></div><p>但似乎开源组件库喜欢用 <code>type T = enums | string</code>。原因可能是因为，使用类型为 <code>T</code> 的变量不一定是直接赋值的，而是通过变量传递，而我们的变量类型一般就是 string，而不是特定的某个字符串的联合类型，这就是为什么会联合一个 string，而不是联合 <code>\${enums}</code>。具体请看下面例子：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">enum</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> E</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">A</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;a&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">B</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> E</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> E</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\${</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">E</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> variable</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;a&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 实际项目中可能是通过很多层才传到这里，此时的类型会是 string</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> a</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> variable; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✔️</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> b</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> variable; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌报错</span></span></code></pre></div></li></ul><h2 id="解决报错" tabindex="-1">解决报错 <a class="header-anchor" href="#解决报错" aria-label="Permalink to &quot;解决报错&quot;">​</a></h2><ul><li><p>Cannot find name &#39;React&#39;.ts(2304)</p><p>该报错出现在 vue 项目中，需要在 tsconfig.json 配置以下内容：</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;compilerOptions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;jsx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;preserve&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 默认是 react，修改为 preserve</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;include&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;lib/**/*.tsx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 将文件添加到这里面</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></li></ul><h2 id="报错信息说明" tabindex="-1">报错信息说明 <a class="header-anchor" href="#报错信息说明" aria-label="Permalink to &quot;报错信息说明&quot;">​</a></h2><p>ts(2322) 都表示类型不匹配。</p><p>ts 的报错信息展开时会发现是有缩进的，每一次缩进都是更加具体的类型错误的说明。</p><h3 id="案例一-开胃菜-not-assignable" tabindex="-1">案例一，开胃菜 <code>not assignable</code> <a class="header-anchor" href="#案例一-开胃菜-not-assignable" aria-label="Permalink to &quot;案例一，开胃菜 \`not assignable\`&quot;">​</a></h3><p>这种是最容易理解的。</p><ul><li><p>复现代码：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SelectWeightDefine</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> a</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SelectWeightDefine</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;123&#39;</span></span></code></pre></div></li><li><p>报错信息：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;string&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is not assignable to type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SelectWeightDefine&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span></span></code></pre></div></li><li><p>简单解释：该报错说的是类型 A 无法分配到类型 B 上面。</p></li></ul><h3 id="案例二-not-assignable-incompatible-is-missing-but-required" tabindex="-1">案例二：<code>not assignable</code> + <code>incompatible</code> + <code>is missing .... but required</code> <a class="header-anchor" href="#案例二-not-assignable-incompatible-is-missing-but-required" aria-label="Permalink to &quot;案例二：\`not assignable\` + \`incompatible\` + \`is missing .... but required\`&quot;">​</a></h3><ul><li><p>复现代码：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DefineComponentType</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    $props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onChange</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> defineComponent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    $props: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        value: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">123</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> component</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DefineComponentType</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> defineComponent</span></span></code></pre></div></li><li><p>报错信息：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;{ $props: { value: number; }; }&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is not assignable to type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;DefineComponentType&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Types </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">of</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> property </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;$props&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> are incompatible.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Property </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;onChange&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is missing </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;{ value: number; }&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> but required </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;{ onChange: () =&gt; void; }&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2322</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div></li><li><p>分析：这只是从 vue 提取出来的一个简单示例，实际的报错提示中，每一个 Type 之间可能都还有很多信息，形式大概是下面这样</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;defineComponent() 创建的组件类型&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is not assignable to type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;DefineComponentType&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`非常长的类型说明\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is not assignable to type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`非常长的类型说明\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Types </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">of</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> property </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;$props&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> are incompatible.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`非常长的类型说明\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is not assignable to type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`非常长的类型说明\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                Property </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;onChange&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> is missing </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;defineComponent() 中的 $props 类型&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> but required </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> type </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;DefineComponentType 中的 $props 类型&#39;</span></span></code></pre></div></li><li><p>暂时不知道怎么复现出中间出现的那一串非常长的类型说明，但可以知道的是，一串更比一串长，因为太长了，整理起来都费劲，所以还没有整理，但我猜测应该是类型嵌套了很多层，每一层都是对类型的展开。</p></li></ul>`,19),t=[l];function p(k,e,E,d,r,g){return a(),i("div",null,t)}const F=s(h,[["render",p]]);export{o as __pageData,F as default};