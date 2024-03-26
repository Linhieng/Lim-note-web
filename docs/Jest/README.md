# [Jest](https://jestjs.io/zh-Hans/) 使用

安装 `@types/jest` 可获得 API 提示。

```sh
npm install --save-dev @types/jest
```

Jest 主要还是提供了工具，具体的判断还是得自己手写测试逻辑逻辑，不然也不会有测试工程师这个职业了。

测试的代码为的是清晰，所以有一些重复的代码是允许的。不过注意，共有变量需要在 beforeEach 中声明，而不是直接写在全局作用域中，这样才能为每一个测试单元提供不同的变量。

## 问题

- 测试文件名要有 `.test.`，不然 jest 找不到

## 覆盖率报告

通过 `--coverage` 参数可以很便捷的生成测试覆盖率报告。

覆盖率有四个指标：

- Stmts: 表示语句覆盖率，一个完整的可能有多行，比如将一个三元表达式分成多行。
- Branch: 分支覆盖率。也就是 if else 等分支执行情况（排列组合）
- Funcs: 函数覆盖率，有多少函数被调用了
- Lines: 行覆盖率，比 Stmts 更精细，精确到了行。

覆盖率会生成 coverage 文件夹，该文件夹一般是会上传到云端的，方便他人查看你的测试报告。

应用的覆盖率一般不会很高，60% 多就算不错了。但对于类库要求是比较高的，比如 [ant-design](https://github.com/ant-design/ant-design) 是 100%！

## 全局设定

- `describe(name, fn)`'
- `it(name, fn)`
    - `test` 是 `it` 的别名，但似乎有这么一个约定俗成的习惯：`describe` 中的测试都是使用 `it`。成型的测试文件中一般不会用到 `test`。
- `afterAll(fn, timeout?)`
- `afterEach(fn, timeout?)`
- `beforeAll(fn, timeout?)`
- `beforeEach(fn, timeout?)`

## Expect 断言 / 匹配

`expect(...)` 返回一个待匹配的内容

- 基础的匹配
    - `.not.` 取反
    - `toBe()` 精准匹配
    - `toEqual()` 对象匹配，会忽略 key 为 undefined 的键值对、忽略数组中的空槽、忽略对象的类型。
    - `toStrictEqual()` 更严格的对象匹配
    - `toContain()` 是否包含某个匹配项
- 真值价值匹配：
    - `toBeNull()` 只匹配 null
    - `toBeUndefined()` 只匹配 undefined
    - `toBeDefined()` 与 `toBeUndefined()` 相反
    - `toBeTruthy()` 匹配真值（即能让任何 if 语句为真的值）
    - `toBeFalsy()` 匹配假值
- 数字匹配：
    - `toBeGreaterThan()` 大于
    - `toBeGreaterThanOrEqual()` 大于等于
    - `toBeLessThan()` 小于
    - `toBeLessThanOrEqual()` 小于等于
    - `toBeCloseTo()` 匹配浮点数的等于。`expect(0.1+0.2).toBeCloseTo(0.3);`
- 正则匹配
    - `toMatch()`
- 抛出错误
    - `toThrow(..)`，比如 `toThrow()`, `toThrow(Error)`, `toThrow('wrong')`, `toThrow(/^wrong.*$/)`

### 数组断言

要判断两个数组相同还真不简单。

```js
test('两个数组元素相同，长度相同。', () => {
  const received = [1, 2, 3, 1]
  const excepted = [3, 2, 1, 2]
  expect(received.length).toBe(excepted.length)
  expect(received).toEqual(expect.arrayContaining(excepted))
  expect(excepted).toEqual(expect.arrayContaining(received))
})
```

## 异步测试

- 错误案例

    ```js
    function fetchData(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
            resolve(data)
            }, 1000)
        })
    }
    test('测试异步函数', () => {
        const data = 2
        fetchData(data).then((data) => {
            expect(data).toBe('2')
        })
    })
    ```

    运行上面代码，会发现 jest 测试结果是通过的。（虽然后面会提示错误，但那并不是我们期待的报错方式）

- 正确案例 1: 返回一个 Promise

    ```js
    function fetchData(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data)
            }, 1000)
        })
    }
    test('测试异步函数', () => {
        const data = 2
        return fetchData(data).then((data) => {
            expect(data).toBe('2')
        })
    })
    ```

- 正确案例 2: 使用 async/await

    ```js
    function fetchData(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data)
            }, 1000)
        })
    }
    test('测试异步函数', async () => {
        const data = 2
        await fetchData(data).then((data) => {
            expect(data).toBe('2')
        })
    })
    ```

    这种使用方式，其实是返回一个 Promise 的语法糖。

- 正确案例 3: 通过调用 `done()` 来测试异步函数

    ```js
    function fetchData(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data)
            }, 1000)
        })
    }
    test('测试异步函数', (done) => {
        const data = 2
        fetchData(data).then((data) => {
            console.log(done)
            try {
                expect(data).toBe('2')
                done()
            } catch (error) {
                done(error)
            }
        })
    })
    ```

    当使用了 `done` 参数后，测试将会等待 done 函数的调用，如果超过一定时间（6s）还没有调用 done，则会提出测试超时错误。

    使用 done 时注意要通过 trycatch 包裹起来，因为测试出现错误时，将会抛出一个错误，这意味着后面的 done 将不会运行，所以最终只会提示超时错误，而不是具体的测试错误。

## Mock 模拟函数

## CLI 选项

- `-t=<regex>` / `--testNamePattern=<regex>` 匹配对应 `it` 的测试名称
