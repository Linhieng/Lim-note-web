import{_ as s,c as i,o as a,a2 as e}from"./chunks/framework.pPPfHAGV.js";const u=JSON.parse('{"title":"docker 草稿","description":"","frontmatter":{},"headers":[],"relativePath":"docs/Docker/draft.md","filePath":"docs/Docker/draft.md"}'),n={name:"docs/Docker/draft.md"},l=e(`<h1 id="docker-草稿" tabindex="-1">docker 草稿 <a class="header-anchor" href="#docker-草稿" aria-label="Permalink to &quot;docker 草稿&quot;">​</a></h1><h2 id="docker-网络问题" tabindex="-1">docker 网络问题 <a class="header-anchor" href="#docker-网络问题" aria-label="Permalink to &quot;docker 网络问题&quot;">​</a></h2><p>docker 容器中的 git 使用的依旧是本机中的 git，所以相关配置也是使用本机的配置。 而本机为 git 配置了 http.proxy 为 127.0.0.1:7890，但在容器中的 127.0.0.1:7890 并不是本机的地址，这一点要注意！同理，其他相关网络问题也是如此！</p><p>所以，可以单独为容器中的项目进行相关配置，比如 <code>git config --local http.proxy &#39;&#39;</code>。 或者可以考虑端口转发，但这个比较麻烦，以后再弄。</p><h2 id="开始-在-container-学习-rust" tabindex="-1">开始：在 container 学习 rust <a class="header-anchor" href="#开始-在-container-学习-rust" aria-label="Permalink to &quot;开始：在 container 学习 rust&quot;">​</a></h2><p>安装 vscode 插件：</p><ul><li>remote.remote-containers</li><li>remote.vscode-remote-extensionpack</li></ul><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/microsoft/vscode-remote-try-rust.git</span></span></code></pre></div><ol><li>vscode 中关闭 http.proxy 代理配置。</li><li>Windows 中启动系统全局代理。</li><li>打开 docker。</li><li>vscode 中运行 <code>Dev Containers: Open Folder in Containers...</code>，打开刚刚克隆的仓库。</li><li>然后 show log，可以看到 vscode 在下载一系列依赖</li><li>此时 docker 中会多了一个名为 vscode 的 volume</li><li>下载完成后，docker 中会多出一个名为 mcr.microsoft.com/devcontainers/rust 的 images （大小为 2.2GB）</li><li>同时也会多出一个名为 gallant_ganguly 的 containers，它的 images 就是 mcr.microsoft.com/devcontainers/rust</li><li>此时 vscode 应该处于容器里面了，目录就是刚刚克隆的仓库。</li></ol><p>在目录中执行以下命令</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 当前目录是 /workspaces/vscode-remote-try-rust</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 初次进入容器时，不是 root 用户，并且此时默认没有 root 密码</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 所以需要设置初始密码</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> passwd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> root</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 默认的用户是 vscode</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">whoami</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ..</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 进入 /workspaces</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/Linhieng/learn-rust.git</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 刚刚克隆的 vscode-remote-try-rust 项目没有用，它只是用来帮助下载 rust 镜像的</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 实际学习中，使用自己的仓库。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> chown</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> vscode:vscode</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> learn-rust/</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 将所有者改为 vscode</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> learn-rust</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">code</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> .</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 打开新窗口，注意此时还是使用的系统全局代理，而不是 vscode 中的 http.proxy</span></span></code></pre></div><p>需要注意的是，vscode 的本机 workspace 不支持容器中的目录！</p><h2 id="docker-中的-container、images-和-volumes" tabindex="-1">docker 中的 container、images 和 volumes <a class="header-anchor" href="#docker-中的-container、images-和-volumes" aria-label="Permalink to &quot;docker 中的 container、images 和 volumes&quot;">​</a></h2><p>在Docker中，有三个核心概念：容器（Container）、镜像（Image）和卷（Volume）。这些概念是 Docker 的基础，了解它们可以帮助您更好地使用 Docker 来构建、部署和管理应用程序。</p><ol><li>容器（Container）：</li></ol><ul><li>容器是 Docker 运行时的实体，它封装了应用程序及其所有的依赖项（包括运行时、库、环境变量等）。</li><li>容器基于镜像启动，每个容器都是一个独立的、隔离的环境，可以在其中运行应用程序。</li><li>容器可以被创建、启动、停止、删除和暂停等操作。</li></ul><ol><li>镜像（Image）：</li></ol><ul><li>镜像是容器的模板。它是一个只读的文件，包含了运行应用程序所需的所有文件系统内容、运行时、库、环境变量等信息。</li><li>镜像可以看作是一个类比于面向对象编程中的类，而容器则是类的实例。</li><li>通过 Dockerfile 或者拉取已有的镜像（从 Docker Hub 等镜像仓库）来创建镜像。</li></ul><ol><li>卷（Volume）：</li></ol><ul><li>卷是持久化存储的一种方式，它提供了容器之间共享数据或者将数据持久化到主机上的方法。</li><li>使用卷可以将容器内部的文件系统与主机文件系统进行关联，以实现数据的持久化、共享和备份等操作。</li><li>卷可以在容器创建时被挂载，也可以在容器运行时进行挂载。</li></ul><p>总的来说，容器是运行时的实例，镜像是容器的模板，而卷则用于持久化存储和数据共享。使用这些概念，您可以轻松地创建、管理和部署 Docker 应用程序，并确保它们的可靠性和可移植性。</p>`,21),t=[l];function o(p,r,c,h,k,d){return a(),i("div",null,t)}const F=s(n,[["render",o]]);export{u as __pageData,F as default};