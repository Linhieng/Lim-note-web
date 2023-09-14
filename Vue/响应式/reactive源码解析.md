# `reactive()` 源码解析

## reactive 调用过程

源代码在 `packages\reactivity\src\reactive.ts` 目录下

### 当调用了 `reactive(target)` 时，vue 做了以下工作

1. 判断 target 是否只读 `isReadonly(target)` ，如果是，直接返回 target。
2. 调用 `createReactiveObject()` 来将 target 包装成一个响应式对象，然后将其返回。

    ```ts
    return createReactiveObject(
        // 该函数接收 5 个参数，
        target,
        false, // 这个表示是否只读，默认是不只读。
        mutableHandlers,            // 这两个先不用管
        mutableCollectionHandlers,  // 这两个先不用管
        reactiveMap // 这是全局的响应式对象
    )
    ```

> 这里提一嘴
>
>在 `reactive.ts` 的开头可以看到创建了四个 WeakMap:
>
> - `reactiveMap`
> - `shallowReactiveMap`
> - `readonlyMap`
> - `shallowReadonlyMap`。
>
> 这四个 Map 存储了所有类型的响应式对象。在具体的使用中，这些都称为 proxyMap。

### `createReactiveObject(target, ...)` 创建过程如下

1. 如果 target 不是对象，则直接返回。（reactive 只接收对象类型）
2. 如果 target 已经是一个 Proxy，直接返回 target。但有一种情况例外：target 是只读的 reactive 对象。具体的代码如下：

    ```js
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    if (
        target[ReactiveFlags.RAW] &&
        !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
    ) {
        return target
    }
    /* 为什么在这里插入这个源码呢？因为这个地方的代码很值得学习。
    如果没有注释，if 中的判断可读性不高，
    但添加注释后，就会发现这里的注释和 if 中的条件判断相得益彰！两者配合的非常好，可读性很高 */
    ```

3. 如果 target 已经和 Proxy 想关联，也直接返回。
    - 上一条是通过 `target[ReactiveFlags.RAW]` 判断的代理，但这里是通过 `proxyMap.get(target)` 判断的代理。
4. 判断 target 的类型，如果类型是无效类型，则直接返回 target。

    vue 对类型有自己的划分，如下：

    ```ts
    function targetTypeMap(rawType: string) {
        switch (rawType) {
            case 'Object':
            case 'Array':
            return TargetType.COMMON // 将对象和数组类型认为是普通类型
            case 'Map':
            case 'Set':
            case 'WeakMap':
            case 'WeakSet':
            return TargetType.COLLECTION // 划分为集合类型
            default:
            return TargetType.INVALID // 划分为无效类型
        }
    }
    ```

    顺便学习一下 vue 是如何获取具体类型的，源代码如下：

    ```ts
    export const objectToString = Object.prototype.toString
    export const toTypeString = (value: unknown): string =>
        objectToString.call(value)

    export const toRawType = (value: unknown): string => {
        // extract "RawType" from strings like "[object RawType]"
        return toTypeString(value).slice(8, -1)
    }
    ```

    可以看到，实际的效果其实就是 `Object.prototype.toString.call(target).slice(8,-1)` ，但它却可以拆分成三个。

5. 能走到这里，说明 target 需要代理，也就是将 target 变成响应式对象

    ```ts
    // vue 是通过 Proxy 对象来实现响应式的，具体如何实现先不用细究。
    const proxy = new Proxy(
        target,
        targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
    )
    // 存储到对应类型的全局响应式对象上面
    proxyMap.set(target, proxy)
    // 这里返回的就是大多数情况下，调用 reactive(target) 的返回值。
    return proxy
    ```

## 创建 Proxy 时的 handle 解析

源代码在 `packages\reactivity\src\baseHandlers.ts` 中。

### 回顾 reactive 调用过程

前面调用 `createReactiveObject` 时，有两个参数是 handler，并且在最后 new Proxy 的时候，也传入将 handler

```ts
return createReactiveObject(
    target,
    false,
    mutableHandlers,            // 普通对象类型的 handler
    mutableCollectionHandlers,  // 集合对象类型的 handler
    reactiveMap
)
```

[点击查看 Proxy 知识点（MDN）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)。

```ts
const proxy = new Proxy(
    target,
    // 根据 target 的类型，会传递一个 handler
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
)
```

### `mutableHandlers` 继承关系

当我们代理一个 target 时，我们需要提供一个 handler，所谓 handler，就是定义了对 target 的操作，比如常见的 `get` 和 `set`。

最新版本的 vue 中的 handler 相关的继承关系如下：

```ts
// ProxyHandler 是 Proxy 的 handler 定义，而 BaseReactiveHandler 就是 vue 自己创建的 proxyhandler 定义。
// BaseReactiveHandler 只负责提供 get 方法
class BaseReactiveHandler implements ProxyHandler<Target>{ get }

// 我们的 mutableHandlers 就是 MutableReactiveHandler
class MutableReactiveHandler extends BaseReactiveHandler{set, deleteProperty, has, ownKeys}
class ReadonlyReactiveHandler extends BaseReactiveHandler{set, deleteProperty}
```

vue 中有四种类型的 handler，他们的区别在于是否 `_shallow` 和是否 `_isReadonly`，这两个会作为初始参数传递进去。

handler type            | _isReadonly | _shallow
------------------------|-------------|---------
mutableHandlers         | `false`     | `false`
readonlyHandlers        | `true`      | `false`
shallowReactiveHandlers | `false`     | `true`
shallowReadonlyHandlers | `true`      | `true`

### handler 的 get 方法做了什么

什么时候会触发 get 方法？比如这样：

```ts
// 创建了一个 reactive 对象后
const objReactive = reactive({
    name: 'Alan'
})
// 当我们返回对象中的 key 时，就会触发 get 方法，所访问的
console.log(objReactive.name)
```

get 方法中刚上来就是一系列 if else，不过不要怕，都只是对 key 类型的推断罢了

```ts
if (key === ReactiveFlags.IS_REACTIVE) {
    // 在 get 该对象是否是一个 reactive 对象
    return !isReadonly // 如果只读，则不是响应式对象
} else if (key === ReactiveFlags.IS_READONLY) {
    // 在 get 该对象是否是一个 readonly 对象
    return isReadonly
} else if (key === ReactiveFlags.IS_SHALLOW) {
    // 在 get 该对象是否是一个 shallow 对象
    return shallow
} else if (
    // 当调用 toRaw(reactiveFoo) 时，key 就会是 ReactiveFlags.RAW
    key === ReactiveFlags.RAW &&
    receiver ===
    (isReadonly
        ? shallow
        ? shallowReadonlyMap
        : readonlyMap
        : shallow
        ? shallowReactiveMap
        : reactiveMap
    ).get(target) // 此时，如果 target 已经在 proprs 中，则直接返回 target
) {
    return target // 这个 target 就是原始对象，而不是响应式对象。
}
```

接着是判断是否是数组

```ts
const targetIsArray = isArray(target)

if (!isReadonly) {
    // 这里只需要知道，如果调用数组的方法（key）vue 会做一些特殊的处理。
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        // 具体查看查看 createArrayInstrumentations 方法
        // 其实就是改写了 includes, indexOf, lastIndexOf 三个方法，其中调用到了 track() 函数，这就是最特殊的地方。
        // 此外还改写了 push, pop, shift, unshift, splice 这几个会影响数字长度的方法，也就是要特殊处理变化的元素，可能是取消监听，也可能是增加监听。
        return Reflect.get(arrayInstrumentations, key, receiver)
    }
    if (key === 'hasOwnProperty') {
        return hasOwnProperty
    }
}
```

后面的就是获取 key 所对应  value 了

```ts
// 通过 Reflect.get 方法来获取 value，也就是 res
const res = Reflect.get(target, key, receiver)

// 当 key 是 Symbol 类型时，判断一个该 Symbol 是否是对象身上有一些通用的属性是 Symbol 类型的，比如 match, matchAll 等等方法
// 此外，他还判断了一下 key 是否是不需要追踪的 key，比如 __proto__, __v_isRef 和 __isVue 三个 key 是不需要追踪的
// 为什么把这些 key 的判断写在一起呢？这是因为这些 key 都是内置的，是不变的，而且也不是用户主动回去调用的
if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
    return res
}

// 到目前为止，用户调用的 key 是不是响应式的内容，因为都是直接返回了

if (!isReadonly) {
    // 这里就是核心了，在这里只需要知道 track 函数能够追踪对应的值的变化就可以了
    // 也就是说，当 reactive 中的值变化时，vue 是如何重新渲染的？答案就在 track 中。
    track(target, TrackOpTypes.GET, key)
}

if (shallow) {
    // 如果是一个 shallow，那么后面的内容就不会执行了。
    // 而后面的内容会将子对象进行一个响应式包装，这就是为什么 shallow 可以浅层响应的根本原因了！
    return res
}

if (isRef(res)) {
    // 下面代码就是在说，当 target 是一个数组，并且是通过下标访问值时，就直接返回一个 ref 对象。
    // 对于其他的情况，则直接返回 ref.value ，这就是 vue 提供的语法糖
    // ref unwrapping - skip unwrap for Array + integer key.
    return targetIsArray && isIntegerKey(key) ? res : res.value
}

if (isObject(res)) {
    // 当获取的值是对象时，vue 会将该子对象继续转换为一个响应式对象（如果不是只读的话）。也就是嵌套响应式
    // Convert returned value into a proxy as well. we do the isObject check
    // here to avoid invalid value warning. Also need to lazy access readonly
    // and reactive here to avoid circular dependency.
    return isReadonly ? readonly(res) : reactive(res)
}
// 最后返回最终的值
return res
```

track 具体如何实现的，我们先不追究，但是我们得先知道该函数能够实现什么效果，看下面代码：

```tsx
import { defineComponent, reactive } from 'vue'

export default defineComponent({
    setup() {
        const objReactive = reactive({ name: 'Alan' })
        // 返回一个渲染函数
        // 该渲染函数内部调用了 objReactive.name，也就是要获取 key 为 name 的值
        // 此时 handler 中的 get 就行执行到 track(target, TrackOpTypes.GET, key) 这行代码
        // 最终的效果就是，objReactive.name 的值会被追踪，每当 objReactive.name 值变化时
        // 该渲染函数就会再次调用。（简单的说一下需求，相信大家已经有点感觉了，好像知道怎么实现了吧😁）
        return () => <div>Hello, Vite, {objReactive.name}</div>
    }
})
```

下面代码现在应该很容易理解了吧：

```ts
const state = reactive({ name: ref('Alan') })
console.log(state.name) // 直接输出 Alan，因为 get 中返回的是 res.value

const state2 = reactive([ref('Alan')])
console.log(state2[0]) // 输出一个 ref 对象，因为 get 中返回的是 res
```

### handler 的 set 方法做了什么

已经明白了 get 做了什么后，再看 set 的代码更加地轻松了，直接上全部代码。

[点击查看 Reflect 使用（MDN）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

```ts
class MutableReactiveHandler extends BaseReactiveHandler {
    constructor (shallow = false) {
        // 两个默认参数 shallow 和 isReadonly
        super(false, shallow)
    }

    set (
        target: object,
        key: string | symbol,
        value: unknown, // 新的值
        receiver: object // 这个就是 Proxy
    ): boolean {
        let oldValue = (target as any)[key]

        // 如果旧的值是 ref，新的值也是 ref，即使是只读，也允许修改，参考 #5307
        if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
            return false
        }
        if (!this._shallow) {
            if (!isShallow(value) && !isReadonly(value)) { // 详细请查看 shallowReactive.spec.ts 中的 #5271
                // TODO: 查看 #2904，#552
                oldValue = toRaw(oldValue)
                value = toRaw(value)
            }
            if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                /* 如果 target 不是数组，并且旧的值是 ref，新的值不是 ref，则直接在旧的值 ref.value 上修改。比如下面这样
                    const state = reactive({ name: ref('Alan') })
                    state.name = 'John'
                target 是对象
                旧的值是 ref('Alan')
                新的值是 'John'
                于是 vue 自动帮我们执行了 ref.value = new_value
                */
                oldValue.value = value
                return true
            }
        } else {
            // in shallow mode, objects are set as-is regardless of reactive or not
        }

        const hadKey = // 判断 key 是否存在。
            isArray(target) && isIntegerKey(key)
                ? Number(key) < target.length
                : hasOwn(target, key)
        // 修改值
        const result = Reflect.set(target, key, value, receiver)
        // don't trigger if target is something up in the prototype chain of original
        if (target === toRaw(receiver)) {
            if (!hadKey) {
                // 如果 key 不存在，则新增一个 key
                // trigger 和 trace 是相对应的，先不用管。简单的理解就是当 trigger 调用时，对应的 trace 就会获知值的变化，然后调用某些函数（渲染函数）
                trigger(target, TriggerOpTypes.ADD, key, value)
            } else if (hasChanged(value, oldValue)) {
                // 如果值有变化，则更新
                trigger(target, TriggerOpTypes.SET, key, value, oldValue)
            }
        }
        return result
    }
    // ……
}
```

### handler 的 deleteProperty, has, ownKeys 方法

因为这些方法比较简单，就直接放在一起了。

```ts
deleteProperty(target: object, key: string | symbol): boolean {
    const hadKey = hasOwn(target, key)
    const oldValue = (target as any)[key]
    const result = Reflect.deleteProperty(target, key)
    if (result && hadKey) {
        // 重点就在这里，调用 trigger，删除对应的响应值
        trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
    }
    return result
}

has(target: object, key: string | symbol): boolean {
    const result = Reflect.has(target, key)
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
        // 因为 has 经常用在 if 判断中，也就是对应的条件判断应该是响应式的。所以这里调用了 track
        track(target, TrackOpTypes.HAS, key)
    }
    return result
}
ownKeys(target: object): (string | symbol)[] {
    track(
        target,
        TrackOpTypes.ITERATE,
        isArray(target) ? 'length' : ITERATE_KEY
    )
    return Reflect.ownKeys(target)
}
```

## collectionHandler 简单理解

源码在 `packages\reactivity\src\collectionHandlers.ts` 中。

### mutableCollectionHandlers 类型

调用 `reactive(target)` 时，如果 target 是 Map, Set, WeakMap, WeakSet 类型，则 `new Proxy(target, handle)` 时的 handler 会是 `mutableCollectionHandlers`

mutableCollectionHandlers 的定义如下：

```ts
export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, false)
}
```

可以发现它只有一个 `get`，这是因为集合类型的增删改查操作都是通过调用对应的方法来实现的，而这对于 proxy 来说，都是在 `get`，比如下面这样：

```ts
const map = reactive(new Map())
// 添加或修改是通过调用 set(key, val) 方法实现的，所以触发的是 get，get 的内容是它的 set() 属性
map.set('key', 'val')
```

### `createInstrumentationGetter()`

```ts
function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  const instrumentations = shallow
    ? isReadonly
      ? shallowReadonlyInstrumentations
      : shallowInstrumentations
    : isReadonly
    ? readonlyInstrumentations
    : mutableInstrumentations

  return (
    target: CollectionTypes,
    key: string | symbol,
    receiver: CollectionTypes
  ) => {
    // 这里不用说了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }
    // target 就是原始的 map 或 set 等集合对象，而 key 就是这些对象上的方法
    // 对于集合对象身上默认的一些方法，vue 做了代理，比如 get, set, has, delete 等等，这些都放在 instrumentations 里面
    // 所以，如果用户调用的是这些方法，则 vue 会返回它处理过后的方法
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations // 如果是 vue 处理的特殊属性，则返回 vue 处理的特殊属性，而不是从 target 身上返回
        : target, // 如果不是 vue 处理的特殊属性，则直接在 target 身上返回对应的属性
      key,
      receiver
    )
  }
}
```

案例：

```tsx
const map = new Map()
Object.defineProperty(map, 'foo', {
    value: () => 'bar'
})
const state = reactive(map)
state.set('name', 'John') // get 的是 set 属性，最终调用的实际上是 instrumentations 上面的 set
console.log(state.foo()) // 个体 的是 foo 属性，它不是 vue 特殊处理的属性，所以返回 target.foo()
```

### `createInstrumentations()`

`instrumentations` 的是通过 `createInstrumentations` 进行创建的，我们这里只讨论 `mutableInstrumentations` 的创建过程，其他的只读、或 shallow 都是类似的。

```ts
function createInstrumentations() {
  const mutableInstrumentations: Record<string, Function | number> = {
    // 可以看到，vue 一共代理了 get, size, has, add, set, delete, clear, forEach 这几个属性。
    // 这个函数很简单，因为具体的处理逻辑不在这里，而在“外面”，这里调用的只是对应的函数名罢了
    get(this: MapTypes, key: unknown) {
      return get(this, key)
    },
    get size() {
      return size(this as unknown as IterableCollections)
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  }
}
```

### `get()`

```ts
function get(
    target: MapTypes,
    key: unknown,
    isReadonly = false,
    isShallow = false
) {
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = (target as any)[ReactiveFlags.RAW];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key); // 集合类型的 key 可以是一个对象，所以它也可能是一个响应式，需要 toRaw
    if (!isReadonly) {
        // TODO: 举例子
        if (hasChanged(key, rawKey)) {
            // 如果是新的 key，则需要 track
            track(rawTarget, TrackOpTypes.GET, key);
        }
        // rawKey 是始终会 track 的
        track(rawTarget, TrackOpTypes.GET, rawKey);
    }
    // 这里获取的 has，就是原生的 has
    const { has } = getProto(rawTarget);
    // 我们会对返回的数据进行一个包装，如果是 shallow，则转换成 shallow；如果是 readonly，则转换成 readonly，都不是，则转换为 reactive
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has.call(rawTarget, key)) { // 判断一下 key 是否在 rawTarget 身上
        return wrap(target.get(key));
    } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
    } else if (target !== rawTarget) {
        // #3602 readonly(reactive(Map))
        // ensure that the nested reactive `Map` can do tracking for itself
        target.get(key);
    }
}

```

### `has`

```ts
// 注意这里的 this 参数是 ts 声明 this 类型的语法，并不是说需要第一个参数 this，类似 py 中的 self 参数
function has(this: CollectionTypes, key: unknown, isReadonly = false): boolean {
  const target = (this as any)[ReactiveFlags.RAW]
  const rawTarget = toRaw(target)
  const rawKey = toRaw(key)
  if (!isReadonly) {
    // has 经常用在判断中，这也是一种响应式，所以需要 track
    if (hasChanged(key, rawKey)) {
      track(rawTarget, TrackOpTypes.HAS, key)
    }
    track(rawTarget, TrackOpTypes.HAS, rawKey)
  }
  return key === rawKey
    ? target.has(key) // 如果 key 和 rawKey 相同，则只需要通过原生 has 方法判断 target 上是否有 key
    : target.has(key) || target.has(rawKey) // 如果不相同，则只需要 target 身上有 key 或者 rawKey 就可以了
}
```

### `set`

```ts
function set(this: MapTypes, key: unknown, value: unknown) {
  value = toRaw(value)
  const target = toRaw(this)
  const { has, get } = getProto(target)

  let hadKey = has.call(target, key) // 判断是否有 key
  if (!hadKey) {
    key = toRaw(key)
    hadKey = has.call(target, key) // 判断是否有 rawKey
  } else if (__DEV__) {
    checkIdentityKeys(target, has, key)
  }

  const oldValue = get.call(target, key)
  target.set(key, value)
  if (!hadKey) { // 既没有 key，也没有 rawKey 时，才是真正的没有该 key。 这个和 has 中的判断一样，需要判断两次
    // 所以此时是新增一个 key
    trigger(target, TriggerOpTypes.ADD, key, value)
  } else if (hasChanged(value, oldValue)) {
    trigger(target, TriggerOpTypes.SET, key, value, oldValue)
  }
  return this
}
```

## ref 简单理解

参考：js 中的类的 [get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) 和 [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) 方法。

ref 源代码相对而言比较简单：

```ts
function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}
```

```ts
class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly __v_isShallow: boolean
  ) {
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : toReactive(value)
    /*
    // 可以看到，当 ref 接收的是对象时，ref 只不过是调用了 reactive
    export const toReactive = <T extends unknown>(value: T): T =>
      isObject(value) ? reactive(value) : value

    */
  }

  // 当调用 ref.value 时，执行的就是这个函数
  get value() {
    // 因为我们需要调用 track 才能实现响应式，这就是为什么 ref 类型我们需要通过 .value 来调用。
    trackRefValue(this)
    return this._value
  }

  // 同理，调用 ref.value = newVal 时，执行的就是这个函数
  set value(newVal) {
    // 正是因为在这里面调用了 trigger，所以才会有响应式
    const useDirectValue =
      this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      triggerRefValue(this, newVal)
    }
  }
}
```

## computed 简单理解

computed 的源代码也不难，只需要注意的就是 computed 和 ref 的区别在于，获取 computed 的值时，如果该值没有更新，则会直接返回旧的值，也就是缓存。这一实现机制是通过 `_dirty` 这个参数实现的。

```ts
export class ComputedRefImpl<T> {
    public dep?: Dep = undefined;

    private _value!: T;
    public readonly effect: ReactiveEffect<T>;

    public readonly __v_isRef = true;
    public readonly [ReactiveFlags.IS_READONLY]: boolean = false;

    public _dirty = true;
    public _cacheable: boolean;

    constructor(
        getter: ComputedGetter<T>,
        private readonly _setter: ComputedSetter<T>,
        isReadonly: boolean,
        isSSR: boolean
    ) {
        // 这里的 effect 和 trigger、track 紧密联系，先不用管。
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                // 当 computed 中监听的值变化时，_dirty 参数就会为 true
                // 或者说，当 computed 中的值更新时，vue 只会简单地将 _dirty 修改为 true，而不是去更新 computed 的值（.value）
                this._dirty = true;
                triggerRefValue(this);
            }
        });
        this.effect.computed = this;
        this.effect.active = this._cacheable = !isSSR;
        this[ReactiveFlags.IS_READONLY] = isReadonly;
    }

    get value() {
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376
        const self = toRaw(this);
        trackRefValue(self);
        // 当 _dirty 为 true 时，才会去重新获取新的值
        if (self._dirty || !self._cacheable) {
            self._dirty = false;
            // 这也意味着，如果创建了一个 computed ，但却从来没有使用到它，那么当 computed 中依赖的响应值更新时，computed 返回的值也是不会更新的
            // 因为 get 没有触发，该行代码也就不会被执行。
            // 这样做的目的是提高性能。因为一个 computed 中可能依赖很多值，如果每一个响应值的更新都会触发 computed 的更新，那么性能是很差的。
            self._value = self.effect.run()!;
        }
        return self._value;
    }

    set value(newValue: T) {
        this._setter(newValue);
    }
}
```

## watch 的简单理解

### 简单使用

- watch 的第一个参数可以是：
    - 一个 getter 函数，返回一个值
    - 一个 ref (包括计算属性)
    - 一个响应式对象
    - ...或是由以上类型的值组成的数组
- watch 的第二个参数是在发生变化时要调用的回调函数。这个回调函数接受三个参数：
    - 新值
    - 旧值
    - 以及一个用于注册副作用清理的回调函数。
    该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如等待中的异步请求。
    当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值。
- watch 的第三个参数是配置项：
    - `immediate`：在侦听器创建时立即触发回调。第一次调用时旧值是 undefined。
    - `deep`：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。
    - `flush`：调整回调函数的刷新时机。
        - `pre` 默认，在渲染函数执行前调用
        - `post` 在渲染函数执行后调用，此时才可以获取最新的 DOM
        - `sync` 与渲染函数同步调用。谨慎使用。
        - 渲染函数的调用，就是组件的更新。
    - `onTrack` / `onTrigger`：可以用于调试。仅在开发环境下生效

至于 `watchEffect`, `watchPostEffect`, `watchSyncEffect`，它们只是 watch 的特殊情况，区别只在于

- 它们的第一个参数就是要执行的副作用函数
- 它们没有 cb 函数
- 它们的 flush 分别是 `pre`（默认），`post` 和 `sync`

`watch` 的回调函数中（或 `watchEffect` 的第一个回调函数）有一个 `onCleanup` 参数，它的作用是“消除副作用”。使用案例如下：

```js
watchEffect((onCleanup) => {
    // 当我们的 id.value 变化时，performAsyncOperation 会去更新页面上的一些内容
    const token = performAsyncOperation(id.value)
    onCleanup(() => {
        // 考虑这么一种场景：由于网络原因，先前的 performAsyncOperation 还未执行完
        // 此时 id.value 由再次更新了，所以会再次执行 performAsyncOperation
        // 但新的 performAsyncOperation 速度很快，于是页面上的内容一下就更新成最新的了
        // 但此时旧的 performAsyncOperation 还在继续运行，如果不取消它，那么当旧的响应数据回来时，会再次更新页面，此时会导致页面被旧的内容覆盖
        // 所以，当我们执行新的 performAsyncOperation 时，我们希望取消旧的 performAsyncOperation
        // 这就是消除副作用。Side Effect Invalidation。这个案例官方长应该是有的，但不知为何现在找不到
        token.cancel()
    })
})
```

### 源代码在 `packages\runtime-core\src\apiWatch.ts` 中

`watchEffect`, `watchPostEffect`, `watchSyncEffect` 都只是 watch 的一种特殊情况，他们调用的都是 `doWatch`

```ts
export function watchEffect(
    effect: WatchEffect,
    options?: WatchOptionsBase
): WatchStopHandle {
    return doWatch(effect, null, options); // options.flush 默认为 pre
}

export function watchPostEffect(
    effect: WatchEffect,
    options?: DebuggerOptions
) {
    return doWatch(
        effect,
        null,
        __DEV__
            ? extend({}, options as any, { flush: "post" })
            : { flush: "post" }
    );
}

export function watchSyncEffect(
    effect: WatchEffect,
    options?: DebuggerOptions
) {
    return doWatch(
        effect,
        null,
        __DEV__
            ? extend({}, options as any, { flush: "sync" })
            : { flush: "sync" }
    );
}

export function watch<T = any, Immediate extends Readonly<boolean> = false>(
    source: T | WatchSource<T>,
    cb: any,
    options?: WatchOptions<Immediate>
): WatchStopHandle {
    if (__DEV__ && !isFunction(cb)) {
        warn(
            `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
                `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
                `supports \`watch(source, cb, options?) signature.`
        );
    }
    return doWatch(source as any, cb, options);
}
```

### doWatch

doWatch 源代码比较长，这里就只提取出核心内容。先简单理解。

```ts
function doWatch(
    source: WatchSource | WatchSource[] | WatchEffect | object,
    cb: WatchCallback | null,
    { immediate, deep, flush, onTrack, onTrigger }: WatchOptions = EMPTY_OBJ
): WatchStopHandle {
    /* ... */

    // instance 获取当前活跃的 effect 作用域。
    const instance =
        getCurrentScope() === currentInstance?.scope ? currentInstance : null

    let getter: () => any
    // 然后就是一系列判断语句，核心就是在为 getter 赋值，目的是能够通过 getter 来获取需要侦听的响应值
    // 下面是提取处理的伪代码
    if (isRef(source)) {
        getter = () => source.value; // 第一个参数是 ref 就返回 .value，这样才会触发响应。
                                    // 这里也说明了为什么侦听时传入的应该是一个 ref，而不能是 ref.value
    } else if (isReactive(source)) {
        getter = () => source; // 第一个参数是响应对象，就返回响应对象
    } else if (isArray(source)) {
        getter = () => source.map((s) => {/* ... */}); // 是一个数组，无非就是遍历，然后返回他们的响应值
    } else if (isFunction(source)) {
        // callWithErrorHandling 的的功能也只是用来执行 source 函数，从而获取响应值罢了。
        // callWithErrorHandling 的工作就是在 try catch 中调用 source()，然后收集了一些错误信息之类的。这样就不怕报错。
        getter = () => callWithErrorHandling(source /* ... */);
    } else {
        // 如果是不支持的类型，而不会侦听
        getter = NOOP;
    }

    /* ....
        后面还有一些代码会对 getter 赋值，但目的都是一样的。
        比如当 deep 为 true 时，会调用 traverse 函数。
        traverse 函数的作用就是递归遍历响应式对象，然后将响应值放在一起返回（广度优先遍历）。
    */

    // job 理解为任务、责任。也就是需要执行的副作用，这是“调度”所执行的工作
    const job: SchedulerJob = () => {/* ... */}
    // scheduler 是调度函数，用于确定副作用函数的执行时机
    let scheduler: EffectScheduler
    if (flush === 'sync') {
        // 如果是同步，则直接调用 job
        scheduler = job as any // the scheduler function gets called directly
    } else if (flush === 'post') {
        // 如果是 post，则将其推进 post 队列中，当组件更新后将会依次执行完 post 队列中的所有 job（effect）
        scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)
    } else {
        // 默认是 pre，所以将其推荐 pre 队列中，在组件更新前将会执行完 queueJob 中的所有 job
        scheduler = () => queueJob(job)
    }

    // 剩下的代码，核心就是 effect，该 effect 是一个对象，这是响应式的核心。他主要有一个 run 方法，用来执行对应的 job
    // effect.run() 在以前是写成 runner() 的。
    // run() 正常的返回值就其实就是 getter() 的执行结果，之所以在 run() 中调用 getter() 的目的是要做一些其他操作。
    // 总之，如果忽略掉其他细节，effect.run() 基本等同于 getter()
    const effect = new ReactiveEffect(getter, scheduler)
    // initial run
    if (cb) {
        if (immediate) {
            // 如果是立即执行，则直接调用 job 了，不需要通过 effect 去运行
            job()
        } else {
            oldValue = effect.run()
        }
    } else if (flush === 'post') {
        // 如果是 post，同样会放入 post 队列中
        queuePostRenderEffect(
            effect.run.bind(effect),
            instance && instance.suspense
        )
    } else {
        // 不需要放入 post 队列中，而是直接执行 getter()
        effect.run()
    }

    /* 剩下的代码就是创建一个 unwatch 然后返回，当调用 unwatch 时，effect.stop() 就会被调用，从而取消侦听 */
}
```

## 响应式核心 effect、trace、trigger 简单认识

### 由 `ReactiveEffect` 引出 track

effect 重点就是 `ReactiveEffect` 类。

```ts
export class ReactiveEffect<T = any> {
    /* ... */
    /*
        ReactiveEffect 只有两个方法：run 和 stop
        当停止侦听时，调用的就是 stop
        构造函数会为 fn 和 scheduler 赋值
        还有一个 scope 为可选值，暂时不用管
    */
    constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null,
        scope?: EffectScope
    ) {
        recordEffectScope(this, scope)
    }

    // 我们核心放在 run 函数中
    // run 的返回值就是调用了 fn 函数，fn 函数会获取我们的响应值，也就是说它会触发我们对响应值代理。而这就涉及到 track 和 trigger 了
    run() {
        if (!this.active) { // active 初始值是 true。当调用了 stop 时，active 就会变成 false
            // 如果不是 active 的，那么就直接调用 fn 函数了，也就是不会做其他处理了
            // fn 函数就是前面的 getter，调用后的返回值就是所侦听的响应值。
            return this.fn();
        }
        // 后面先不看
        let parent: ReactiveEffect | undefined = activeEffect;
        let lastShouldTrack = shouldTrack;
        while (parent) {
            if (parent === this) {
                return;
            }
            parent = parent.parent;
        }
        try {
            this.parent = activeEffect;
            activeEffect = this;
            shouldTrack = true;

            trackOpBit = 1 << ++effectTrackDepth;

            if (effectTrackDepth <= maxMarkerBits) {
                initDepMarkers(this);
            } else {
                cleanupEffect(this);
            }
            return this.fn();
        } finally {
            if (effectTrackDepth <= maxMarkerBits) {
                finalizeDepMarkers(this);
            }

            trackOpBit = 1 << --effectTrackDepth;

            activeEffect = this.parent;
            shouldTrack = lastShouldTrack;
            this.parent = undefined;

            if (this.deferStop) {
                this.stop();
            }
        }
    }
}

```

### [响应式工作原理](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)

当 get 一个响应值时，就会触发执行 track。当 set 一个响应值时，就会触发 trigger。

```js
// 这里的代码旨在以最简单的形式解释核心概念，因此省略了许多细节和边界情况。

function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            track(target, key);
            return target[key];
        },
        set(target, key, value) {
            target[key] = value;
            trigger(target, key);
        },
    });
}

function ref(value) {
    const refObject = {
        // 仅有 ref 使用 getter / setter。
        // Vue 2 中使用 getter / setters 完全是出于支持旧版本浏览器的限制。因为 Proxy 是全新的语言特性，无法在 ES6 之前实现。
        get value() {
            // 对于 ref，它的 target 上的 key 就是 "value"
            track(refObject, "value");
            return value;
        },
        set value(newValue) {
            value = newValue;
            trigger(refObject, "value");
        },
    };
    return refObject;
}
```

`track()` 内部的核心就是检查是否有正在运行的副作用。如果有，我们会查找到一个存储了所有追踪了该属性的订阅者的 Set，然后将当前这个副作用作为新订阅者添加到该 Set 中。

```js
function track(target, key) {
    if (activeEffect) {
        // getSubscribersForProperty 的工作就是，当第一次 track 时，还没有 set，此时会创建一个 set
        const effects = getSubscribersForProperty(target, key)
        // 然后将当前正在运行的副作用添加进去到属于该 target.key 的 set 中。
        effects.add(activeEffect)
    }
}
```

`trigger()` 内部的核心就是执行所有订阅了该属性（target.key）的副作用。

```js
function trigger(target, key) {
    const effects = getSubscribersForProperty(target, key)
    // 执行每一个副作用
    effects.forEach((effect) => effect())
}
```

举个例子如下：

```js
// 伪代码
let A0 = ref(1)
let A1 = ref(2)
let A2

// whenDepsChange 的作用就是，当 update 函数中依赖的值发生变化时，会重新执行 update 函数
// 这基本就是 vue 中 watch 的原理
function update() {
  A2 = A0.value + A1.value
}
function whenDepsChange(update) {
    const effect = () => {
        // update 会包含在一个副作用函数中
        // 在运行 update 之前，它会将该副作用函数注册到侦听的属性的订阅者 set 中
        activeEffect = effect
        update()
        activeEffect = null
    }
    // 调用 effect()
    effect()
}
```

1. `whenDepsChange` 内部调用 effect() 时，`A0.value` 会被 get，所以 `get value()` 中的 `track(A0, "value")` 会被触发
2. `track` 中将 activeEffect(= effect) 添加到订阅者 set 中。
3. 当更改 `A0.value` 时，会执行 `set value()` 中的 `trigger(A0, "value")`
4. `trigger` 中会调用所有订阅了 `A0.value` 的订阅者的副作用函数，所以 `effect()` 函数会被再次执行，此时 `update()` 也随之执行。

### 对应到源码

`activeEffect` 是 `effect.ts` 中的全局变量，在执行 `effect.run()` 的过程中会被赋值。

> 说明：
>
> `shouldTrack` 是 `effect.ts` 中的全局变量。因为某些作用域不应该被跟踪，比如 `setup` 函数。所以当作用域是 setup 函数时，`shouldTrack` 就会为 `false`。
> 在 `setup` 函数中，可能有多个 `watch` 函数，每次执行 `watch` 中的代码，`shouldTrack` 都会为 `true`，但执行完后作用域会回到 `setup`，此时的 `shouldtrack` 会变为 `false`。所以 `shouldTrack` 会一直变来变去，源码中有关 `shouldTrack` 的代码基本都是这个目的。

```ts
/**
 * Tracks access to a reactive property.
 *
 * This will check which effect is running at the moment and record it as dep
 * which records all effects that depend on the reactive property.
 *
 * @param target - Object holding the reactive property.
 * @param type - Defines the type of access to the reactive property.
 * @param key - Identifier of the reactive property to track.
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
    if (shouldTrack && activeEffect) {
        // 这里的 map 是 target 身上所有的 key 的 map
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            // 第一次调用 target 的第一个 key 时，会初始化 map
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            // 这里就和前面的 getSubscribersForProperty(target, key) 是一样的
            // 会创建一个新的订阅了该 target.key 的 set 集合。
            depsMap.set(key, (dep = createDep()));
        }

        const eventInfo = __DEV__
            ? { effect: activeEffect, target, type, key }
            : undefined;

        trackEffects(dep, eventInfo);
    }
}

export function trackEffects(
    dep: Dep,
    debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
    let shouldTrack = false;
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit; // set newly tracked
            shouldTrack = !wasTracked(dep);
        }
    } else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeEffect!);
    }

    if (shouldTrack) {
        // 这里就是前面的 effects.add(activeEffect) 了
        // activeEffect 的值是全局的（effect.ts），当执行 run() 的过程中就对其赋值了。
        dep.add(activeEffect!);
        activeEffect!.deps.push(dep);
        if (__DEV__ && activeEffect!.onTrack) {
            activeEffect!.onTrack(
                extend(
                    {
                        effect: activeEffect!,
                    },
                    debuggerEventExtraInfo!
                )
            );
        }
    }
}

```

trigger 代码相对较多，主要是 trigger 中获取 deps，然后传递给 triggerEffects，最终再传到 triggerEffect 中进行调用。

```ts
/**
 * Finds all deps associated with the target (or a specific property) and
 * triggers the effects stored within.
 *
 * @param target - The reactive object.
 * @param type - Defines the type of the operation that needs to trigger effects.
 * @param key - Can be used to target a specific reactive property in the target object.
 */
export function trigger(
    target: object,
    type: TriggerOpTypes,
    key?: unknown,
    newValue?: unknown,
    oldValue?: unknown,
    oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }

    let deps: (Dep | undefined)[] = [];
    if (type === TriggerOpTypes.CLEAR) {
        // collection being cleared
        // trigger all effects for target
        deps = [...depsMap.values()];
    } else if (key === "length" && isArray(target)) {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key) => {
            if (key === "length" || key >= newLength) {
                deps.push(dep);
            }
        });
    } else {
        // schedule runs for SET | ADD | DELETE
        if (key !== void 0) {
            deps.push(depsMap.get(key));
        }

        // also run for iteration key on ADD | DELETE | Map.SET
        switch (type) {
            case TriggerOpTypes.ADD:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                } else if (isIntegerKey(key)) {
                    // new index added to array -> length changes
                    deps.push(depsMap.get("length"));
                }
                break;
            case TriggerOpTypes.DELETE:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                break;
            case TriggerOpTypes.SET:
                if (isMap(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                }
                break;
        }
    }

    const eventInfo = __DEV__
        ? { target, type, key, newValue, oldValue, oldTarget }
        : undefined;

    if (deps.length === 1) {
        if (deps[0]) {
            if (__DEV__) {
                triggerEffects(deps[0], eventInfo);
            } else {
                triggerEffects(deps[0]);
            }
        }
    } else {
        const effects: ReactiveEffect[] = [];
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep);
            }
        }
        if (__DEV__) {
            triggerEffects(createDep(effects), eventInfo);
        } else {
            triggerEffects(createDep(effects));
        }
    }
}

// 这个函数就相当于 effects.forEach((effect) => effect()) 中的 forEach。
export function triggerEffects(
    dep: Dep | ReactiveEffect[],
    debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
    // spread into array for stabilization
    const effects = isArray(dep) ? dep : [...dep];
    for (const effect of effects) {
        if (effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
}

function triggerEffect(
    effect: ReactiveEffect,
    debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
    if (effect !== activeEffect || effect.allowRecurse) {
        if (__DEV__ && effect.onTrigger) {
            effect.onTrigger(extend({ effect }, debuggerEventExtraInfo));
        }
        // 在这里，就是相当于前面的执行副作用。也就是 effects.forEach((effect) => effect()) 中的 effect()
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

```
