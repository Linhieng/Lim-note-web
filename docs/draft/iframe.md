[参考](https://www.cnblogs.com/Leophen/p/11403800.html)

局限：
1、创建比一般的 DOM 元素慢了 1-2 个数量级
iframe 的创建比其它包括 scripts 和 css 的 DOM 元素的创建慢了 1-2 个数量级，使用 iframe 的页面一般不会包含太多 iframe，所以创建 DOM 节点所花费的时间不会占很大的比重。但带来一些其它的问题：onload 事件以及连接池（connection pool）

2、阻塞页面加载
及时触发 window 的 onload 事件是非常重要的。onload 事件触发使浏览器的 “忙” 指示器停止，告诉用户当前网页已经加载完毕。当 onload 事件加载延迟后，它给用户的感觉就是这个网页非常慢。

window 的 onload 事件需要在所有 iframe 加载完毕后（包含里面的元素）才会触发。在 Safari 和 Chrome 里，通过 JavaScript 动态设置 iframe 的 SRC 可以避免这种阻塞情况

3、唯一的连接池
浏览器只能开少量的连接到 web 服务器。比较老的浏览器，包含 Internet Explorer 6 & 7 和 Firefox 2，只能对一个域名（hostname）同时打开两个连接。这个数量的限制在新版本的浏览器中有所提高。Safari 3+ 和 Opera 9+ 可同时对一个域名打开 4 个连接，Chrome 1+, IE 8 以及 Firefox 3 可以同时打开 6 个

绝大部分浏览器，主页面和其中的 iframe 是共享这些连接的。这意味着 iframe 在加载资源时可能用光了所有的可用连接，从而阻塞了主页面资源的加载。如果 iframe 中的内容比主页面的内容更重要，这当然是很好的。但通常情况下，iframe 里的内容是没有主页面的内容重要的。这时 iframe 中用光了可用的连接就是不值得的了。一种解决办法是，在主页面上重要的元素加载完毕后，再动态设置 iframe 的 SRC。

4、不利于 SEO
搜索引擎的检索程序无法解读 iframe。另外，iframe 本身不是动态语言，样式和脚本都需要额外导入。综上，iframe 应谨慎使用。

链接：https://www.nowcoder.com/questionTerminal/18eb5039ac4541d585f9f175574b3ab5?
来源：牛客网




> 我错选成了a，“早期用iframe主要是用于导航栏很多的部分，这样在切换页面的时候避免重复下载”，意思是不用iframe的话切换页面时就会重复下载？谁能给我解答一下重复下载什么东西？我脑补不出来
> iframe是html的一个标签，所以html是啥iframe就是啥；但是动态语言的include机制是啥意思？是类似java jsp 或者php那样的把html include的机制吗？
>
> TyrionJ ： 意思是多个页面如果共用footer或者header，会额外下载footer或者header对应的资源，比如js文件等
