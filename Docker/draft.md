# docker 草稿

## docker 网络问题

docker 容器中的 git 使用的依旧是本机中的 git，所以相关配置也是使用本机的配置。
而本机为 git 配置了 http.proxy 为 127.0.0.1:7890，但在容器中的 127.0.0.1:7890
并不是本机的地址，这一点要注意！同理，其他相关网络问题也是如此！

所以，可以单独为容器中的项目进行相关配置，比如 `git config --local http.proxy ''`。
或者可以考虑端口转发，但这个比较麻烦，以后再弄。


## 开始：在 container 学习 rust

安装 vscode 插件：

- remote.remote-containers
- remote.vscode-remote-extensionpack

```sh
git clone https://github.com/microsoft/vscode-remote-try-rust.git
```

1. vscode 中关闭 http.proxy 代理配置。
2. Windows 中启动系统全局代理。
3. 打开 docker。
4. vscode 中运行 `Dev Containers: Open Folder in Containers...`，打开刚刚克隆的仓库。
5. 然后 show log，可以看到 vscode 在下载一系列依赖
6. 此时 docker 中会多了一个名为 vscode 的 volume
7. 下载完成后，docker 中会多出一个名为 mcr.microsoft.com/devcontainers/rust 的 images （大小为 2.2GB）
8. 同时也会多出一个名为 gallant_ganguly 的 containers，它的 images 就是 mcr.microsoft.com/devcontainers/rust
9. 此时 vscode 应该处于容器里面了，目录就是刚刚克隆的仓库。

在目录中执行以下命令

```sh
# 当前目录是 /workspaces/vscode-remote-try-rust

# 初次进入容器时，不是 root 用户，并且此时默认没有 root 密码
# 所以需要设置初始密码
sudo passwd root

# 默认的用户是 vscode
whoami

cd ..
# 进入 /workspaces

sudo git clone https://github.com/Linhieng/learn-rust.git
# 刚刚克隆的 vscode-remote-try-rust 项目没有用，它只是用来帮助下载 rust 镜像的
# 实际学习中，使用自己的仓库。

sudo chown vscode:vscode learn-rust/
# 将所有者改为 vscode

cd learn-rust
code .
# 打开新窗口，注意此时还是使用的系统全局代理，而不是 vscode 中的 http.proxy
```

需要注意的是，vscode 的本机 workspace 不支持容器中的目录！

## docker 中的 container、images 和 volumes

在Docker中，有三个核心概念：容器（Container）、镜像（Image）和卷（Volume）。这些概念是 Docker 的基础，了解它们可以帮助您更好地使用 Docker 来构建、部署和管理应用程序。

1. 容器（Container）：

  - 容器是 Docker 运行时的实体，它封装了应用程序及其所有的依赖项（包括运行时、库、环境变量等）。
  - 容器基于镜像启动，每个容器都是一个独立的、隔离的环境，可以在其中运行应用程序。
  - 容器可以被创建、启动、停止、删除和暂停等操作。

1. 镜像（Image）：

  - 镜像是容器的模板。它是一个只读的文件，包含了运行应用程序所需的所有文件系统内容、运行时、库、环境变量等信息。
  - 镜像可以看作是一个类比于面向对象编程中的类，而容器则是类的实例。
  - 通过 Dockerfile 或者拉取已有的镜像（从 Docker Hub 等镜像仓库）来创建镜像。

1. 卷（Volume）：

  - 卷是持久化存储的一种方式，它提供了容器之间共享数据或者将数据持久化到主机上的方法。
  - 使用卷可以将容器内部的文件系统与主机文件系统进行关联，以实现数据的持久化、共享和备份等操作。
  - 卷可以在容器创建时被挂载，也可以在容器运行时进行挂载。

总的来说，容器是运行时的实例，镜像是容器的模板，而卷则用于持久化存储和数据共享。使用这些概念，您可以轻松地创建、管理和部署 Docker 应用程序，并确保它们的可靠性和可移植性。
