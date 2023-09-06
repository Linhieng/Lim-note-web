# ts 的使用

简单的使用我已经熟悉了，所以这里暂时只记录一些遇到的案例

## 未解决的需求

- 变量需要在后面某个过程中才赋值，具体的类型也需要通过赋值才能确定，这种情况下如何提供类型支持

    下面是案例代码，全部写在一起是可以获得 wrapper 和 numberField 的类型提示的。
    但如果想要把 numberField 声明在 describe 里面，然后在 beforeAll 中初始化。
    是否能够让 numberField 在初始化时定义类型，这样在 it 中使用时也可获得类型提示。

    ```ts
    import { mount } from '@vue/test-utils'

    import JsonSchemaForm, { NumberField } from '../../lib'

    describe('测试 SchemaForm', () => {
        it('应该渲染出一个 NumberField 组件', async () => {
            let value = 'hello'
            const wrapper = mount(JsonSchemaForm, {
                props: {
                    schema: {
                        type: 'number',
                    },
                    value,
                    onChange: (v) => {
                        value = v
                    },
                },
            })
            const numberField = wrapper.findComponent(NumberField)
            expect(numberField.exists()).toBeTruthy()
        })
    })
    ```

## 解决需求

- 声明变量类型保持不变

    ```ts
    // 如果写成下面这样，那么 editorRef 的值会被认为可能是 undefined
    const editorRef = shallowRef<Monaco.editor.IStandaloneCodeEditor>()

    // 但如果我们能保证除了初始值是 undefined，后续使用到时肯定是 Monaco.editor.IStandaloneCodeEditor 类型的话，可以进行类型断言
    const editorRef = shallowRef<Monaco.editor.IStandaloneCodeEditor>(null!);
    // null! 会告诉告诉 ts，虽然初始值是 null，但后续一定不会是 null
    // 所以我们需要保证后续确实不会是空，不然可能会导致编译时错误。
    ```

- 对枚举类型进行自动联合

    ```ts
    enum enums {
        A = "a",
        B = "b",
    }

    type Values = `${enums}`; // 类型为 "a" | "b"

    type Keys = keyof typeof enums; // 类型为 "A" | "B"
    ```

    但似乎开源组件库喜欢用 `type T = enums | string`。原因可能是因为，使用类型为 `T` 的变量不一定是直接赋值的，而是通过变量传递，而我们的变量类型一般就是 string，而不是特定的某个字符串的联合类型，这就是为什么会联合一个 string，而不是联合 `${enums}`。具体请看下面例子：

    ```ts
    enum E {
    A = "a",
    B = "b",
    }

    type T1 = E | string;
    type T2 = E | `${E}`;

    let variable: string = 'a'; // 实际项目中可能是通过很多层才传到这里，此时的类型会是 string
    const a: T1 = variable; // ✔️
    const b: T2 = variable; // ❌报错
    ```

## 解决报错

- Cannot find name 'React'.ts(2304)

    该报错出现在 vue 项目中，需要在 tsconfig.json 配置以下内容：

    ```json
    {
        "compilerOptions": {
            "jsx": "preserve", // 默认是 react，修改为 preserve
        },
        "include": [
            "lib/**/*.tsx", // 将文件添加到这里面
        ],
    }

    ```
