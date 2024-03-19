
常用中间件

- `body-parse`
- `cors`
- `multer`

| middleware   | handler (Content-Type)              |
| ------------ | ----------------------------------- |
| `body-parse` | `application/json`                  |
| `body-parse` | `application/x-www-form-urlencoded` |
| `multer `    | `multipart/form-data`               |

## body-parse

```js
const bodyParser = require('body-parser')

// for parsing application/json
app.use(bodyParser.json())

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
```

## multer 中间件

只处理 multipart/form-data 类型的表单数据，主要用于上传文件

Multer 会添加一个 body 对象 以及 file 或 files 对象 到 express 的 request 对象中。 body 对象包含表单的文本域信息，file 或 files 对象包含对象表单上传的文件信息。


multer 会填充 body, file 和 files 字段到 req 对象中
  body 字段：表单文本值
  file 或 files 字段：表单上传的文件
multer 的核心在于处理文件，有以下几种方式：
  Multer.any() 处理表单中包含的所有文件
  Multer.none() 告诉 multer 不需要处理文件
    如果表单中有文件会报错
  Multer.single() 告诉 multer 处理单文件并填充进 file 字段
  Multer.array() 告诉 multer 处理多个文件并填充进 files 字段（此时是数组）
    如果没提供参数，等同 none()，此时如果有文件也会报错
  Multer.fields() 告诉 multer 按照特定结构处理多个文件并填充进 files 字段（此时是对象）
    files 字段的结构会和 fields 所定义的结构相同。


### 文件包含的信息


| Key          | Description                    | Note          |
| ------------ | ------------------------------ | ------------- |
| fieldname    | Field name  由表单指定         |               |
| originalname | 用户计算机上的文件的名称       |               |
| encoding     | 文件编码                       |               |
| mimetype     | 文件的 MIME  类型              |               |
| size         | 文件大小（字节单位）           |               |
| destination  | 保存路径                       | DiskStorage   |
| filename     | 保存在  destination 中的文件名 | DiskStorage   |
| path         | 已上传文件的完整路径           | DiskStorage   |
| buffer       | 一个存放了整个文件的  Buffer   | MemoryStorage |



### multer(options) 中的 options 参数

Multer 接受一个 options 对象，其中最基本的是 dest 属性，这将告诉 Multer 将上传文件保存在哪。如果你省略 options 对象，这些文件将保存在内存中，永远不会写入磁盘。

为了避免命名冲突，multer 会对文件进行重命名，该功能可自己定制

options 可选的配置


| Key            | Description                        |
| -------------- | ---------------------------------- |
| dest / storage | 将文件存储在哪里                   |
| fileFilter     | 文件过滤器，控制哪些文件可以被接受 |
| limits         | 限制上传的数据                     |
| preservePath   | 是否保存包含文件名的完整文件路径   |



dest 值为一个路径字符串（若不存在会自动创建）
storage 代表存储在内存中，值为 multer.memoryStorage()

### multer 对象上的方法

```js
const upload = multer({ dest: 'uploads/' })
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file 是 `avatar` 文件的信息
  // req.body 将具有文本域数据，如果存在的话
})

```

* .single(fieldname)

  接受一个以 fieldname 命名的文件。这个文件的信息保存在 req.file。这个 filedname 会和表单中的 name 匹配

* .array(fieldname[, maxCount])

  接受一个以 fieldname 命名的文件数组。可以配置 maxCount 来限制上传的最大数量。这些文件的信息保存在 req.files。

* .fields(fields)

  接受指定 fields 的混合文件。这些文件的信息保存在 req.files。

  fields 应该是一个对象数组，应该具有 name 和可选的 maxCount 属性。

```js
upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 8 }
])
```

* .none()

  只接受文本域。如果任何文件上传到这个模式，将发生 "LIMIT_UNEXPECTED_FILE" 错误。这和 upload.fields([]) 的效果一样。

* .any()

  接受一切上传的文件。文件数组将保存在 req.files。


-------------------------------------------------------------


### `storage`

#### 磁盘存储引擎 (`DiskStorage`)

磁盘存储引擎可以让你控制文件的存储。

**注意：** cb 是回调函数，第一个参数代表是否是否有错误，若无则传入 null

```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
const upload = multer({ storage })

```

有两个选项可用，`destination` 和 `filename`。他们都是用来确定文件存储位置的函数。

`destination` 是用来确定上传的文件应该存储在哪个文件夹中。
可以使用一个函数，也可以提供一个 `string` (例如 `'/tmp/uploads'`)。如果没有设置 `destination`，则使用操作系统默认的临时文件夹。

**注意**： 如果你提供的 `destination` 是一个函数，你需要负责创建文件夹。当提供一个字符串，multer 会自动创建该文件夹（若不存在）

`filename` 用于确定文件夹中的文件名的确定。
如果没有设置 `filename`，每个文件将设置为一个随机文件名，并且是没有扩展名的。

**注意**： Multer 不会为你添加任何扩展名，你的程序应该返回一个完整的文件名。

每个函数都传递了请求对象 (`req`) 和一些关于这个文件的信息 (`file`)，有助于你的决定。

注意 `req.body` 可能还没有完全填充，这取决于向客户端发送字段和文件到服务器的顺序。


------------------------

#### 内存存储引擎 (`MemoryStorage`)

内存存储引擎将文件存储在内存中的 `Buffer` 对象，它没有任何选项。

```javascript
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
```

当使用内存存储引擎，文件信息将包含一个 `buffer` 字段，里面包含了整个文件数据。

**警告**: 当你使用内存存储，上传非常大的文件，或者非常多的小文件，会导致你的应用程序内存溢出。


### limits 对文件进行限制

limits 是一个对象



| Key           | Description（Number 类型）                                 | Default   |
| ------------- | ---------------------------------------------------------- | --------- |
| fieldNameSize | field 名字最大长度（单位 bytes）                           | 100 bytes |
| fieldSize     | field 值的最大长度（单位 bytes）                           | 1MB       |
| fields        | 非文件 field  的最大数量                                   | 无限      |
| fileSize      | 在 multipart  表单中，文件最大长度 (字节单位)              | 无限      |
| files         | 在 multipart  表单中，文件最大数量                         | 无限      |
| parts         | 在 multipart  表单中，part 传输的最大数量(fields +  files) | 无限      |
| headerPairs   | 在 multipart  表单中，键值对最大组数                       | 2000      |

设置 limits 可以帮助保护你的站点抵御拒绝服务 (DoS) 攻击。

### fileFilter

设置一个函数来控制可以上传什么类型的文件，那些文件会被跳过

示例：

```js
function fileFilter (req, file, cb) {
  // cd 函数的第二个参数：指示是否应接受该文件
  // 例如：接受这个文件，使用`true`
  cb(null, true)
  // 如果有问题，你可以总是这样发送一个错误:
  cb(new Error(`I don't have a clue!`))
}


```


> [查看官方文档]( https://github.com/expressjs/multer)
> [如何自定义存储引擎](https://github.com/expressjs/multer/blob/master/StorageEngine.md)
