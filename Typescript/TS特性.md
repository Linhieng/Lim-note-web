# ts 的使用

## 声明 this 类型

```ts
type thisTyp = { name: string };
// 这里的第一个参数就是用来声明 this 类型的，并不代表传入的第一个参数名称为 this
function fn(this: thisTyp, action: string) {
    console.log(action, this.name);
}
fn.call({ name: "Alan" }, "hello");

// 编译结果如下：
"use strict";
function fn(action) {
    console.log(action, this.name);
}
fn.call({ name: "Alan" }, "hello");
```
