/*!
 * scrollbar v1.0.0 by Ivan Yan 2014-01-16
 * https://github.com/yanxyz/scrollbar
 * MIT License
 */

;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory)
  } else {
    factory(jQuery);
  }
}(function($) {
  'use strict';

  function Scrollbar(element, options) {
    this.$elem = $(element) // 滚动条所属容器
    this.options = options
    if (options.scroller) { // 容器不是滚动元素，即两层以上结构
      this.type = 1
      this.$scroller = this.$elem.find(options.scroller).eq(0)
    } else { // 容器是滚动元素， 即两层结构
      this.type = 0
      this.$scroller = this.$elem
    }

    this.namespace = '.scrollbar' // 事件命名空间
    this.hasX = false // 是否启用了滚动条
    this.hasY = false
  }

  Scrollbar.defaults = {
    // scroller: '', // 滚动元素 selector
    axis: 'y', // 默认只有垂直滚动条，其它值：'x', 'xy'
    minThumb: 20, // 滑块最小高/宽
    speed: 40, // 每次滚动的像素数
    wheelPropagation: false, // 滚动到头后是否冒泡，这样可接着滚动外层的滚动条
    wheelBoth: false, // 只有一个滚动条时两个滚轴是否均可控制
    keyboard: true // 是否支持键盘方向键滚动
  }

  $.extend(Scrollbar.prototype, {
    _init: function() {
      var options = this.options
      var $elem = this.$elem
      var that = this

      // 先检查是否已有 scrollbar
      function createBar(axis) {
        var $bar

        switch(axis) {
          case 'x':
            $bar = $elem.children('.scrollbar-x')
            if (!$bar.length) {
              $bar = $('<div class="scrollbar scrollbar-x"><div class="scrollbar-thumb"></div></div>').appendTo($elem)
            }
            that.hasX = true
            that.$barX = $bar
            that.$thumbX = $bar.children('.scrollbar-thumb')
            break
          case 'y':
            $bar = $elem.children('.scrollbar-y')
            if (!$bar.length) {
              $bar = $('<div class="scrollbar scrollbar-y"><div class="scrollbar-thumb"></div></div>').appendTo($elem)
            }
            that.hasY = true
            that.$barY = $bar
            that.$thumbY = $bar.children('.scrollbar-thumb')
            break
        }
      }

      switch (options.axis) {
        case 'x':
          createBar('x')
          break
        case 'y':
          createBar('y')
          break
        case 'xy':
          createBar('x')
          createBar('y')
      }

      this.refresh()
      this._bind()
    },
    refresh: function() {
      var $elem = this.$scroller
      console.log($elem)
      var options = this.options
      // TODO: 是否考虑 padding 呢
      var w = this.containerWidth = $elem.width()
      var h = this.containerHeight = $elem.height()
      var W = this.contentWidth = $elem.prop('scrollWidth')
      var H = this.contentHeight = $elem.prop('scrollHeight')
      var deltaX = this.maxX = W - w
      var deltaY = this.maxY = H - h
      var left = $elem.scrollLeft()
      var top = $elem.scrollTop()
      var w1, h1, b, r

      if (this.hasX && deltaX > 0) {
        this.barXActive = true
        b = this.barXBottom = parseInt(this.$barX.css('bottom'), 10)
        // 滑块宽度 x/w = w/W
        w1 = this.thumbXWidth = Math.max(options.minThumb, parseInt(w * w / W, 10))
        // 后面计算滑块的 left 值: elemleft*ratio
        this.ratioX = (w - w1) / deltaX
        if (this.type) {
          this.$barX.width(w)
        } else {
          this.$barX.css({
            width: w,
            left: left,
            bottom: b - top
          })
        }
        this.$thumbX.width(w1)
      } else {
        this.barXActive = false
      }

      if (this.hasY && deltaY > 0) {
        this.barYActive = true
        r = this.barYRight = parseInt(this.$barY.css('right'), 10)
        h1 = this.thumbYHeight = Math.max(options.minThumb, parseInt(h * h / H, 10))
        this.ratioY = (h - h1) / deltaY
        if (this.type) {
          this.$barY.height(h)
        } else {
          this.$barY.css({
            height: h,
            top: top,
            right: r - left
          })
        }

        this.$thumbY.height(h1)
      } else {
        this.barYActive = false
      }

      this.update()
    },
    update: function() {
      var left = this.$scroller.scrollLeft()
      var top = this.$scroller.scrollTop()

      // TODO: scrollTop 一直增加，只好这里处理
      left = left > this.maxX ? this.maxX : left
      top = top > this.maxY ? this.maxY : top

      if (this.barXActive) {
        if (!this.type) {
          this.$barX.css({
            left: left,
            bottom: this.barXBottom - top
          })
        }
        this.$thumbX.css('left', parseInt(left * this.ratioX, 10))
      }

      if (this.barYActive) {
        if (!this.type) {
          this.$barY.css({
            top: top,
            right: this.barYRight - left
          })
        }
        this.$thumbY.css('top', parseInt(top * this.ratioY, 10))
      }
    },
    _bind: function() {
      var that = this
      var options = this.options
      var speed = this.options.speed
      var ns = this.namespace
      var $elem = this.$scroller
      var $barX = this.$barX
      var $thumbX = this.$thumbX
      var $barY = this.$barY
      var $thumbY = this.$thumbY
      var $doc = $(document)
      var x = this.barXActive
      var y = this.barYActive

      // 两个滚轴各管各的，忽略 wheelBoth
      // 默认不冒泡
      function isPropagated(deltaX, deltaY) {
        var left, top

        // 确定冒泡再检查
        if (options.wheelPropagation) {
          if (x && deltaX !== 0) {
            left = $elem.scrollLeft()
            if ((left === 0 && deltaX < 0) ||
              (left >= that.maxX && deltaX > 0)) {
              return options.wheelPropagation
            }
          }

          if (y && deltaY !== 0) {
            top = $elem.scrollTop()
            if ((top === 0 && deltaY < 0) ||
              (top >= that.maxY && deltaY > 0)) {
              return options.wheelPropagation
            }
          }
        }
      }

      var events = {
        scroll: function() {
          // TODO: IE 滚动条抖动
          $elem.on('scroll' + ns, function() {
            that.update()
          })
        },
        wheel: function() {
          // https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel
          var wheel = ('onwheel' in document || document.documentMode > 8) ? 'wheel' :
            'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll'

          $elem.on(wheel + ns, function(e) {
            var left = $elem.scrollLeft()
            var top = $elem.scrollTop()
            var ev = e.originalEvent
            var delta, deltaX, deltaY

            // 只关注滚动方向
            // TODO: 没有双向滚轴的鼠标，需要测试
            switch(e.type) {
              case 'wheel':
                deltaX = ev.deltaX
                deltaY = ev.deltaY
                break
              case 'mousewheel':
                deltaX = ev.wheelDeltaX && -ev.wheelDeltaX
                deltaY = -ev.wheelDelta
                break
              case 'DOMMouseScroll':
                deltaY = ev.detail
                break
            }

            deltaX = deltaX < 0 ? -1 : deltaX > 0 ? 1 : 0
            deltaY = deltaY < 0 ? -1 : deltaY > 0 ? 1 : 0

            // 两个滚轴各管各的滚动条
            if (!options.wheelBoth) {
              x && $elem.scrollLeft(left + deltaX * speed)
              // y && $elem.scrollTop(top + deltaY * speed)
              this.scrollTop += deltaY * speed
            }
            // 两个滚轴都支持水平滚动条，前提是只有水平滚动条
            else if (x && !y) {
              delta = deltaX || deltaY
              $elem.scrollLeft(left + delta * speed)
            } else if (y && !x) {
              delta = deltaY || deltaX
              $elem.scrollTop(top + delta * speed)
            }

            !isPropagated(deltaX, deltaY) && e.preventDefault()
          })
        },
        click: function() {
          // TODO: 滚动距离
          var click = 'click' + ns

          if (x) {
            $barX.on(click, function(e) {
              var delta = e.pageX - $thumbX.offset().left
              var left = $elem.scrollLeft()

              if (delta < 0) {
                $elem.scrollLeft(left - speed)
              } else if (delta > 0) {
                $elem.scrollLeft(left + speed)
              }
              return false
            })

            $thumbX.on(click, function(e) {
              e.stopPropagation()
            })
          }

          if (y) {
            $barY.on(click, function(e) {
              var delta = e.pageY - $thumbY.offset().top
              var top = $elem.scrollTop()

              if (delta < 0) {
                $elem.scrollTop(top - speed)
              } else if (delta > 0) {
                $elem.scrollTop(top + speed)
              }
              return false
            })

            $thumbY.on(click, function(e) {
              e.stopPropagation()
            })
          }
        },
        drag: function() {
          var md = 'mousedown' + ns
          var mm = 'mousemove' + ns
          var mu = 'mouseup' + ns
          var start = {}
          var current = {}

          function moveX(deltaX) {
            $elem.scrollLeft($elem.scrollLeft() + parseInt(deltaX / that.ratioX, 10))
          }

          function moveY(deltaY) {
            $elem.scrollTop($elem.scrollTop() + parseInt(deltaY / that.ratioY, 10))
          }

          if (x) {
            $barX.on(md, function (e) {
              start.pageX = e.pageX
              $barX.addClass('scrolling')
              e.stopPropagation()
              e.preventDefault()
            })

            $doc
            .on(mm, function (e) {
              if ($barX.hasClass('scrolling')) {
                current.pageX = e.pageX
                moveX(current.pageX - start.pageX)
                start.pageX = current.pageX
                e.stopPropagation()
                e.preventDefault()
              }
            })
            .on(mu, function (e) {
              if ($barX.hasClass('scrolling')) {
                $barX.removeClass('scrolling')
              }
            })
          }

          if (y) {
            $barY.on(md, function (e) {
              start.pageY = e.pageY
              $barY.addClass('scrolling')
              e.stopPropagation()
              e.preventDefault()
            })

            $doc
            .on(mm, function (e) {
              if ($barY.hasClass('scrolling')) {
                current.pageY = e.pageY
                moveY(current.pageY - start.pageY)
                start.pageY = current.pageY
                e.stopPropagation()
                e.preventDefault()
              }
            })
            .on(mu, function (e) {
              if ($barY.hasClass('scrolling')) {
                $barY.removeClass('scrolling')
              }
            })
          }
        },
        keyboard: function() {
          var me = 'mouseenter' + ns
          var ml = 'mouseleave' + ns
          var kd = 'keydown' + ns

          var hovered = false;
          $elem.on(me, function() {
            hovered = true;
          });
          $elem.on(ml, function() {
            hovered = false;
          });

          var shouldPrevent = false;
          $doc.on(kd, function (e) {
            if (!hovered) return

            var deltaX = 0
            var deltaY = 0

            switch (e.which) {
              case 37: // left
                deltaX = -1;
                break;
              case 38: // up
                deltaY = -1;
                break;
              case 39: // right
                deltaX = 1;
                break;
              case 40: // down
                deltaY = 1;
                break;
              default:
                return;
            }

            x && $elem.scrollLeft($elem.scrollLeft() + deltaX * speed)
            y && $elem.scrollTop($elem.scrollTop() + deltaY * speed)
            !isPropagated(deltaX, deltaY) && e.preventDefault()

          })
        },
        // 移动端浏览器不大支持
        //
        touch: function() {
          // var ts = 'touchstart' + ns
          // var tm = 'touchmove' + ns
          // var te = 'touchend' + ns
          // var start = {}
          // var touchSpeed = {}
          // var breakingProcess = null
          // var inGlobalTouch = false

          // var move = function (deltaX, deltaY) {
          //   // 触摸是反向移动
          //   $elem.scrollLeft($elem.scrollLeft() - deltaX)
          //   $elem.scrollTop($elem.scrollTop() - deltaY)
          // }

          // $(window)
          // .on(ts, function (e) {
          //   inGlobalTouch = true
          // })
          // .on(te, function (e) {
          //   inGlobalTouch = false
          // });

          // $elem.
          // on(ts, function (e) {
          //   var touch = e.originalEvent.targetTouches[0]

          //   start.pageX = touch.pageX
          //   start.pageY = touch.pageY
          //   start.time = $.now()

          //   if (breakingProcess !== null) {
          //     clearInterval(breakingProcess)
          //   }

          //   e.stopPropagation()
          // })
          // .on(tm, function (e) {
          //   if (!inGlobalTouch && e.originalEvent.targetTouches.length === 1) {
          //     var touch = e.originalEvent.targetTouches[0]
          //     var current = {}
          //     var deltax, deltaY

          //     current.pageX = touch.pageX
          //     current.pageY = touch.pageY
          //     deltaX = current.pageX - start.pageX
          //     deltaY = current.pageY - start.pageY
          //     move(deltaX, deltaY)

          //     current.time = $.now()
          //     touchSpeed.x = deltaX / (current.time - start.time)
          //     touchSpeed.y = deltaY / (current.time - start.time)
          //     start = current
          //     e.preventDefault()
          //   }
          // })
          // .on(te, function (e) {
          //   clearInterval(breakingProcess)

          //   breakingProcess = setInterval(function () {
          //     if (Math.abs(touchSpeed.x) < 0.01 && Math.abs(touchSpeed.y) < 0.01) {
          //       clearInterval(breakingProcess)
          //       return
          //     }

          //     move(touchSpeed.x * 30, touchSpeed.y * 30)

          //     touchSpeed.x *= 0.8
          //     touchSpeed.y *= 0.8
          //   }, 10);
          // });
        }
      }

      events.scroll()
      events.wheel()
      events.click()
      events.drag()
      options.keyboard && events.keyboard()
      // if ('ontouchstart' in window) events.touch()
    },
    destroy: function() {
      var ns = this.namespace

      this.$elem.data('scrollbar', '').off(ns)
      this.options.keyboard && $(document).off(ns)
    }
  })

  $.fn.scrollbar = function(options) {
    return this.each(function() {
      var $this = $(this)
      var data  = $this.data('scrollbar')
      var settings = $.extend({}, Scrollbar.defaults, typeof options === 'object' && options)

      if (!data) $this.data('scrollbar', (data = new Scrollbar(this, settings)))
      data._init()
    })
  }

  $.fn.scrollbar.Constructor = Scrollbar

}))
