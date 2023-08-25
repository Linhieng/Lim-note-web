# 规范

## commit 规范

格式如下：

```syntax
<type>[-<scope>]: <description>

[<optional body>]
```

说明：

- `<type>`
    - 指明本次 commit 的类型，目前有以下可用值：
        - `init`: 开启新的知识点——创建新文件。
        - `add`: 添加新的知识点。
        - `update`: 对已有的知识点笔记进行更新。
        - `chore`: 无关紧要的内容，比如修改 `.vscode`, `.gitignore` 等配置信息。
        - `style`: 修改内容样式、重命名或移动文件等等。
- `<scope>`
    - 本次 commit 所更改的文件范围。
- `<description>`
    - 基本的描述信息。
- `<optional body>`
    - 更详细的说明。
