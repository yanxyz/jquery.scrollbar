# jquery.scrollbar

jquery 滚动条插件。

参考自 [perfect-scrollbar](https://github.com/noraesae/perfect-scrollbar)。

要求： jquery 1.9+

## 说明

参考 MSDN [About Scroll Bars](http://msdn.microsoft.com/en-us/library/windows/desktop/bb787527(v=vs.85).aspx) 了解滚动条。

模拟滚动条，效率不大好。因此设计应当简单。实际上谷歌浏览器已经简化了滚动条，趋近于移动端滚动条。

此插件支持下面操作

- 鼠标滚轮
- 鼠标拖动滑块
- 鼠标点击滑轨
- 键盘方向键

触摸相关代码注释掉了。移动端浏览器对 overflow 支持不大好。桌面触屏目前不考虑。

滚动距离简化为每次移动固定距离，由选项 speed 指定。这样能保证兼容性，不过没有原生滚动条灵活。

## 使用

html 结构分为两种情况， 分别见 test 目录下 default.html scroller.html。

插件没有提供样式——自定义是最灵活的。样式参考 test 目录下 style.css。

选项参见源码。

### scrollbar

插件直接拿 scrollbar 当滑轨 (scrollbar track)，添加样式时注意。

默认动态插入 scrollbar:

```html
<!-- 水平滚动条 -->
<div class="scrollbar scrollbar-x">
  <div class="scrollbar-thumb"></div>
</div>
<!-- 垂直滚动条 -->
<div class="scrollbar scrollbar-y">
  <div class="scrollbar-thumb"></div>
</div>
```

可以事先插入 scrollbar (html 或 js), 比如：

```html
<!-- 垂直滚动条 -->
<div class="scrollbar scrollbar-y">
  <div class="scrollbar-thumb">
    <i class="thumb-top"></i><i class="thumb-bottom"></i>
  </div>
</div>
```

给 .thumb-top .thumb-bottom 添加圆角背景图片，便可以支持旧浏览器。


### 其它

若需要指定滚动位置，可以设置滚动元素 scrollTop/scrollLeft。

当滚动条所在容器的大小改变时，滚动条也需要跟着变，调用方法 .refesh()


## 压缩

build 目录 min.js 用来压缩插件。

```bash
cd path/to/build
npm install -g uglifyjs
node min
```

## 版权

MIT
