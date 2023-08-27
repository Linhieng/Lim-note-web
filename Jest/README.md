# [Jest](https://jestjs.io/zh-Hans/) 使用

安装 `@types/jest` 可获得 API 提示。

```sh
npm install --save-dev @types/jest
```

Jest 主要还是提供了工具，具体的判断还是得自己手写测试逻辑逻辑，不然也不会有测试工程师这个职业了。

## 全局设定

- `describe(name, fn)`'
- `test(name, fn)` / `it(name, fn)`
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

## Mock 模拟函数


