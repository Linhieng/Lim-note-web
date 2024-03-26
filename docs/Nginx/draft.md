# nginx 草稿

## 安装和基本使用

进入 https://nginx.org/en/download.html

下载 Mainline version 版本，然后解压

> 注意：不管配不配置环境变量，对 nginx 的所有操作都应该在对应文件夹中。

```powershell
[Environment]::SetEnvironmentVariable("NGINX_HOME", "C:\nginx-1.25.4\", "User")
# 添加 nginx 目录为环境变量，方便以后进入该文件夹

cd $env:NGINX_HOME
# 一定要先进入文件

start nginx
# 启动 nginx

nginx -t
# 测试配置文件是否有效

nginx -s reload
# 应用新的配置文件（平滑关闭旧进程）

nginx -s quit
# 平滑关闭 graceful shutdown
nginx -s stop
# 快速关闭 fast shutdown
```

其他辅助命令

```sh
tasklist | findstr "nginx.exe"
# 查看 nginx 状态

taskkill /F /PID xx /PID xx
# 强制关闭对应 PID
```

## 本地搭建 https

安装 [mkcert-v1.4.4-windows-amd64.exe]

执行命令

```sh
$ .\mkcert-v1.4.4-windows-amd64.exe -install
# 安装 CA 根证书

$ .\mkcert-v1.4.4-windows-amd64.exe -CAROOT
# 查看根证书位置
# 或者运行 certmgr.msc，点击 “受信任的根证书颁发机构”，可以找到 mkcert xx@xx

$ .\mkcert-v1.4.4-windows-amd64.exe localhost 127.0.0.1
# 为 localhost 和 127.0.0.1 生成证书:
# c:\Users\keety\Downloads\localhost+1.pem
# c:\Users\keety\Downloads\localhost+1-key.pem
```

配置 nginx:

```nginx
# C:\nginx-1.25.4\conf\nginx.conf
events {
    worker_connections  1024;
}

http {

    server {
        listen 80;
        listen [::]:80;
        # html 文件夹，指的是 nginx 安装目录中的 html 文件夹
        # 比如 C:\nginx-1.25.4\html
        root   html;
        index  index.html;
    }

    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        server_name localhost;

        location / {
            root   html;
            index  index.html;
        }

        ssl_certificate      c:\Users\keety\Downloads\localhost+1.pem;
        ssl_certificate_key  c:\Users\keety\Downloads\localhost+1-key.pem;
    }

    server {
        listen 8080 ssl;
        listen [::]:8080 ssl;
        server_name localhost;

        ssl_certificate      c:\Users\keety\Downloads\localhost+1.pem;
        ssl_certificate_key  c:\Users\keety\Downloads\localhost+1-key.pem;

        location / {
            # 反向代理，需要运行一个网页在 6449 端口。然后通过 https://localhost:8080 就可以访问到 6449 端口的内容
            proxy_pass              http://localhost:6449;
        }
    }

}
```

可以将其添加到环境变量中，然后为其创建一个软连接

```sh
$ New-Item -ItemType SymbolicLink -Target mkcert-v1.4.4-windows-amd64.exe -Path C:\soft\it\mkcert\mkcert.exe
# C:\soft\it\mkcert\ 已经添加到环境变量中。其中 mkcert-v1.4.4-windows-amd64.exe 也在 C:\soft\it\mkcert\ 里面

$ mkcert
# 测试。
```

<!--
下载 [openssl light](https://slproweb.com/products/Win32OpenSSL.html)

添加环境变量

生成证书

```sh
openssl req -x509 -nodes -newkey rsa:2048 -keyout $env:HOMEPATH\Downloads\localhost.key -out $env:HOMEPATH\Downloads\localhost.crt -days 1
# Common Name (e.g. server FQDN or YOUR name) []:localhost
```
 -->

 [mkcert-v1.4.4-windows-amd64.exe]: https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe
