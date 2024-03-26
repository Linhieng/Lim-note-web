# 草稿（迁移）

## 基础

express 的使用非常简单，核心就是链。需要注意的就是，链式每个节点（中间件、路由、错误处理）都有一个 next 函数，每个节点都是通过 next 连接成链的。所以，如果每个节点没有调用 next 函数，则必须在该节点中响应数据，否则该请求会被挂起（hang），此时垃圾回收将无法对其处理。

### 托管静态文件

```js
app.use(express.static('public'))
// 将 public 文件夹设置为静态文件，用户通过 /xx 可以直接访问 public/xx 的内容

app.use('/static', express.static('public'))
// 为静态文件提供虚拟的前缀路径。用户通过访问 /static/xx 可以获取 /public/xx 的内容
// 注意 static 要有前缀，不能写成 static
```

### 基本路由

基本格式：

```js
app[method]('/xx', (req, res) => {
  // ..
})

// 使用多个处理程序，通过 next 连接
app[method]('/xx', (req, res, next) => {
  // ..
}, (req, res, next) => {
  // ..
})
```

> 注意，如果没有调用 next 参数，那么这个程序就必须负责返回响应的数据，否则该请求将会被挂起（hang），而且不会被垃圾回收，

常见的 method 有 get, post, put, delete, 或者也可以通过 all 指定所有的 method。完整的 method 请参考 [app.METHOD]。

第一个参数指的是匹配路由字符串，该字符串同时也是正则表达式字符串，使用 [path-to-regexp] 模块进行正则的解析。比如 `app.get('/')`。你也可以显式的传递一个 RegExp 字面量。

```js
// 匹配 http://localhost:3000/abcd
// 匹配 http://localhost:3000/acd
app.get('/ab?cd', (req, res) => {
  res.send('ab?cd')
})

// 匹配 http://localhost:3000/foobarfly
app.get(/.*fly$/, (req, res) => {
  res.send('/.*fly$/')
})
```

通过冒号可以配置路径参数（params）下面是一个简单的案例：

```js
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send(req.params) // { userId: '123', bookId: '123333' }
})
```

> 注意，查询字符串（search）并不不要写在路由字符串中，而是通过 `req.query` 获取

参数名称只能是一个 word（`[A-Za-z0-9_]`），其中并不包含 hyphen (-) 和 dot (.)。这样一来，hyphen 和 dot 就可以使用在路径中，下面是一个简单的案例：

```js
// 用户访问 http://localhost:3000/flights/深圳-广州
app.get('/flights/:from-:to', (req, res) => {
  console.log(req.params) // { from: '深圳', to: '广州' }
})

// 用户访问 http://localhost:3000/something/你好.世界
app.get('/something/:foo.:bar', (req, res) => {
  console.log(req.params) // { foo: '你好', bar: '世界' }
})
```

匹配参数也可以结合字符串实现更精确的匹配：

```js
// 匹配 http://localhost:3000/user/123
// 但不匹配 http://localhost:3000/user/a7b7
app.get('/user/:userId(\\d+)', (req, res) => {
  console.log(req.params) // { userId: '123' }
})
```

> js 字符串中的 `\` 是转义字符，所以字符串中需要使用 `\\d` 才能得到字符串 `\d`。

注意，express 4 中，不推荐使用 * 进行匹配，请用 {0,} 代替

```js
// 能给匹配 http://localhost:3000/baz/123/321
app.get('/baz/:foo(\\d{0,})/:bar(\\d{0,})', (req, res) => {
  console.log(req.params) // { foo: '123', bar: '321' }
})

// 使用 * 会导致一些问题
app.get('/baz/:foo(\\d*)/:bar(\\d*)', (req, res) => {
  console.log(req.params) // { '0': '23', '1': '21', foo: '123', bar: '321' }
  res.send('ok')
})
```

其他一些用法：

- 链式路由

  ```js
  app.route('/book')
    .get((req, res) => {
      res.send('Get a random book')
    })
    .post((req, res) => {
      res.send('Add a book')
    })
    .put((req, res) => {
      res.send('Update the book')
    })
  /*
    await (await fetch('/book', {method: 'GET'})).text()
    'Get a random book'
    await (await fetch('/book', {method: 'POST'})).text()
    'Add a book'
    await (await fetch('/book', {method: 'PUT'})).text()
    'Update the book'
  */
  ```

- 路由模块

  ```js
  const router = express.Router()
  router.get('/foo', (req, res) => res.send('/module/foo'))
  router.post('/bar', (req, res) => res.send('/module/bar'))
  app.use('/module', router)
  /*
    await (await fetch('/module/foo', {method: 'GET'})).text()
    '/module/foo'
    await (await fetch('/module/bar', {method: 'POST'})).text()
    '/module/bar'
  */
  ```

- 多个路由处理回调

  ```js
  app.get('/example/a', (req, res, next) => {
    req.hello = '你好'
    next()
  }, (req, res) => {
    res.send(req.hello + '，世界')
  })
  /*
  await (await fetch('/example/a', {method: 'GET'})).text()
  '你好，世界'
  */



  const cb1 = (req, res, next) => {req.cb1 = '1'; next()}
  const cb2 = (req, res, next) => {req.cb2 = '2'; next()}
  const cb3 = (req, res, next) => {req.cb3 = '3'; next()}
  app.get('/example/b', [cb1,cb2,cb3], (req, res) => {
    res.send(req.cb1 + req.cb2 + req.cb3)
  })
  /*
  await (await fetch('/example/b', {method: 'GET'})).text()
  '123'
  */


  const cb1 = (req, res, next) => {req.cb1 = 'hello'; next()}
  const cb2 = (req, res) => { res.send(req.cb1 + ', world') }
  app.get('/example/c', [cb1,cb2])
  /*
  await (await fetch('/example/c', {method: 'GET'})).text()
  'hello, world'
  */
  ```

### 全局错误处理

express 在链的末端默认提供了一个全局错误处理，如果链中任何一部分错误没有被捕获，则最终会被这个默认错处理捕获。

> 需要注意的是，在 express 4 中，对于链中的异步错误处理需要自行捕获

在开发环境（默认）下，express 默认错误处理所捕获到的错误会直接返回给客户端。在生产环境下则不会。可以通过设置环境变量 NODE_ENV 为 production 来让程序运行在生产环境下。

> 可以是在命令行中指定环境变量，比如使用 pwsh 终端运行应用时，通过 `$env:NODE_ENV = "production"` 则可以设置环境变量。

编写自己的错误处理程序，和编写中间件一样，直接添加在链上。不同的是错误处理程序接收四个参数。我们可以根据数据的流向，在链的最后定义我们自己的默认错误处理程序。

```js
// ...

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

注意，如果没有调用 next 参数，那么这个节点就必须负责返回响应的数据，否则该请求将会被挂起（hang），而且不会被垃圾回收，

### response 对象

通过调用 response 对象上的以下方法，可以响应内容给客户端：

| 方法                         | 描述                            |
| ---------------------------- | ------------------------------- |
| `res.sendStatus(statusCode)` | 发送对应响应码以及默认消息      |
| `res.send(any)`              | 发送任意类型响应体              |
| `res.json(obj)`              | 发送 JSON 格式响应体            |
| `res.jsonp(obj)`             | 发送 JSONP 格式响应体           |
| `res.download()`             | Prompt a file to be downloaded. |
| `res.end()`                  | End the response process.       |
| `res.redirect()`             | 重定向请求                      |
| `res.render()`               | Render a view template.         |
| `res.sendFile()`             | Send a file as an octet stream. |

此外，常用的方法还有以下这些：

| 方法              | 简单描述         |
| ----------------- | ---------------- |
| `res.cookie()`    | 设置 cookie      |
| `res.setHeader()` | 添加一条响应标头 |
| `res.status()`    | 设置响应码       |

### request 对象

request 通常用于获取用户传递数据，所以常用的属性和方法有：

| property       | 简单说明                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| `req.params`   | 获取路由参数，具体值由路由匹配字符串决定，比如 .get('/params/:foo/:bar') |
| `req.body`     | 需要使用中间件（如 [body-parser] 或 [multer] ）进行填充                  |
| `req.cookies`  | 使用 [cookie-parser] 进行填充                                            |
| `req.query`    | 获取查询（search）参数，比如 ?foo=bar&baz=qux                            |
| `req.path`     | 获取请求路径（不包含 origin 和 search）                                  |
| `req.file`     | 需要使用中间件（如 [multer]）进行填充                                    |
| `req.files`    | 需要使用中间件（如 [multer]）进行填充                                    |
| `req.ip`       | 获取请求 ip                                                              |
| `req.header()` | 获取特定请求标头                                                         |

> 特殊地，可以通过 req.rawHeaders 获取所有请求标头

注意，如果服务器上使用了反向代理，则 express 默认不信任这些反向代理的请求头。
比如通过 nginx 设置反向代理后，通过 `req.ip` 只会获取到 127.0.0.1。
如果想要信任反向代理，需要将 trust proxy 设置为 true

```js
app.enable('trust proxy')
```

此外，设置反向代理时，也要让它将实际的 ip 转发给 node。比如 nginx 中需要配置：

```nginx
location / {
  # $proxy_add_x_forwarded_for 和 $remote_addr 都是实际 ip
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Real-IP $remote_addr;
}
```

## 使用 node:https 模块部署 https 站点

```js
const express = require('express')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const app = express()

app.get('/', (req, res) => {
  res.send('hello, world')
})

const certPath = path.resolve('c:/cert/localhost.pem')
const keyPath = path.resolve('c:/cert/localhost-key.pem')
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
}


https.createServer(options, app).listen('443', () => { console.log(`https://localhost`) })
http.createServer(app).listen('80', () => { console.log('http://localhost') })
```

[app.METHOD]: https://expressjs.com/en/4x/api.html#app.METHOD
[path-to-regexp]: https://github.com/pillarjs/path-to-regexp
[body-parser]: https://www.npmjs.com/package/body-parser
[multer]: https://www.npmjs.com/package/multer
[cookie-parser]: https://www.npmjs.com/package/cookie-parser
