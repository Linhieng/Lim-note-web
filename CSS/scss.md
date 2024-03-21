# scss

sass 语法更简洁，可以省略大括号、分号。类似于 python。

- `$var`
- `#{express}` 插值表达式，用于将变量的值插入到字符串中
- `@mixin`, `@include`
- `@extend`
- `@for`
- `@function`, `@return`
  - `random()`
  - `floor()`

## draft

sass 导入 mixin
  需要使用 as *
    @use  './mixin' as *;
  或者使用
    @import './mixin';
  可以统一在 index.scss 中使用 @import


## 案例

```scss
// 封装媒体查询
@mixin sm {
    @media screen and (max-height: 799px) { // 媒体查询可不止能查宽度
        @content;
    }
}




// 定义：
@mixin important-text {
    color: red;
    font-weight: bold;
}
@mixin transform($property) {
    -webkit-transform: $property;
    -ms-transform: $property;
    transform: $property;
}
// 使用：
.danger {
    @include important-text;
    @include transform(scale(10));
}



// 变量
{
    $accent: #ed2553;
    color: $accent;
}



// 继承
.button-block {
    display: block;
    width: 100%;
}
.button {
    @extend .button-block;
}




// through 代表包含 33，如果将 through 换成 to 则不包含 33
@for $i from 1 through 33 {
    // 使用#{$i}引用该变量
    .shard-wrap:nth-child(#{$i}) .shard {
        $m: 1+$i/10;
        transition-duration: #{$m}s;
    }
}

@for $i from 0 to 3 {
    .avatar:nth-of-type(#{$i+1}) {
        $x: 40 + 100 * $i + '%';
        transform: translateX(-#{$x});
    }
}


@for $i from 0 to 5 {
    #Polygon-#{$i + 1} {
        $x: 0.2 * $i + 's';
        animation-delay: #{$x};
    }
}


// 变量是可以是一个类似数组，然后配合 @for 和 length() 使用
$slide-bgs: url(''), url(''), url('');
@for $i from 1 through length($slide-bgs) {
    div:nth-child(#{$i}) {
        background: nth($slide-bgs, $i);
    }
}



// 可以自定义一个函数，比如生成随机数函数
@function random_range($min, $max) {
    $rand: random();
    $random_range: $min + floor($rand * (($max - $min) + 1));
    @return $random_range;
}
```
