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
