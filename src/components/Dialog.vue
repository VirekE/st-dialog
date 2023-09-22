<script lang="ts" setup>
import { computed, Ref, ref, reactive, getCurrentInstance, onMounted } from 'vue'
import type { Component } from 'vue'
import { useDialogStore } from '@/stores/index'
import { SquareSmall, CloseSmall, Minus, Sum } from '@icon-park/vue-next'

const store = useDialogStore()
const props = defineProps<{
  dialog: Dialog<Component>
}>()
const dialog = computed(() => props.dialog)
const id = computed(() => props.dialog.id)
const property = computed(() => dialog.value.property)
const position = computed(() => {
  const { x, y } = dialog.value.position
  const { width, height } = property.value
  return {
    top: y,
    left: x,
    width,
    height,
    max: dialog.value.state.maximized,
  }
})
const MaxIcon = computed(() => position.value.max ? Sum : SquareSmall)
const emit = defineEmits<{
  (e: 'on-resize', dialog: Dialog<Component>): any
}>()
onMounted(() => {
  initDialogSize()
})

interface TouchPosition {
  x: number,
  y: number,
}

interface TouchSize {
  w: number,
  h: number,
  t: number,
  l: number
}

const dialogMovement = reactive({
  x: 0,
  y: 0,
})

const body = ref()
const touchingPoints: Ref<{ t1: TouchPosition, t2: TouchPosition, size: TouchSize }> = ref({ t1: { x: 0, y: 0 }, t2: { x: 0, y: 0 }, size: { w: 0, h: 0, t: 0, l: 0 }})
const mouseDownPosition = { x: 0, y: 0 }
const isMoving = ref(false)
const isResizing = ref(false)
const touchingPosition = reactive({ x: 0, y: 0, screenX: 0, screenY: 0 })

// 动态计算当前DOM位置样式
const dialogStyle = computed(() => {
  const { top, left, width, height } = position.value
  const { x, y } = dialogMovement
  const zIndex: number = 1000 + store.getZIndex(id.value)
  if (!position.value.max) {
    return {
      top: `${top + y}px`,
      left: `${left + x}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex,
    }
  }
  return {
    top: '0',
    left: '0',
    width: '100%',
    height: 'calc(100% - 32px)',
    zIndex,
  }
})


/**
 * 关闭窗口
 */
function closeDialog() {
  store.removeDialog(id.value)
}

/**
 * 窗口获取焦点时的处理方法
 */
function toTop() {
  store.toTop(id.value)
}

function toggleDialog() {
  store.toggleMinimizeDialog(id.value)
}

/**
 * 激活或结束窗口大小调整
 */
function resizeSwitch(event: TouchEvent, state: boolean) {
  const { touches } = event
  const fingers = touches.length
  if (fingers === 2 && state) {
    // 开始
    isResizing.value = true
    const t1 = touches[0]
    const t2 = touches[1]
    const p = position.value
    touchingPoints.value = {
      t1: { x: t1.clientX, y: t1.clientY },
      t2:{ x: t2.clientX, y: t2.clientY },
			size:{
        w: p.width,
        h: p.height,
        t: p.top,
        l: p.left,
      },
		}
  } else {
    // 结束
    isResizing.value = false
    touchingPoints.value = { t1: { x: 0, y: 0 }, t2: { x: 0, y: 0 }, size: { w: 0, h: 0, t: 0, l: 0 } }
    resize()
  }
}

/**
 * 多指触控处理方法
 * @param {TouchEvent} event
 */
function multiTouch(event: TouchEvent) {
  const { touches } = event
  const fingers = touches.length
  switch (fingers) {
    case 2: {
      if (isResizing.value && property.value.resizable) {
        resizeBy2Fingers(touches)
      }
      break
    }
    default: {
      return
    }
  }
}

function resizeBy2Fingers(touches: TouchList) {
  const touch1 = touches[0]
	const touch2 = touches[1]
  const { clientX: x1, clientY: y1 } = touch1
  const { clientX: x2, clientY: y2 } = touch2
  // const [position1, position2, size] = touchingPoints.value
	const position1 = touchingPoints.value.t1
	const position2 = touchingPoints.value.t2
	const size = touchingPoints.value.size
  const { x: ox1, y: oy1 } = position1
  const { x: ox2, y: oy2 } = position2
  const { w, h, t, l } = size as TouchSize
  const dX = ox1 - ox2 - x1 + x2
  const dY = oy1 - oy2 - y1 + y2
  const top = Math.round(l - dY / 2)
  const left =  Math.round(t - dX / 2)
  const width = Math.round(w + dX)
  const height = Math.round(h + dY)
  store.moveDialog(id.value, {
    x: left,
    y: top,
    width,
    height
  })
}

/**
 * 手动调整窗口大小:
 * 监听鼠标按下的事件, 实现根据className识别用户需要调整方向而按需调整窗口大小的功能
 * @param { MouseEvent } event 鼠标按下事件
 */
function manualResize(event: MouseEvent) {
  const { target } = event
  if (!target) return
  const { className } = target as HTMLElement
  isResizing.value = true
  const ox = event.screenX
  const oy = event.screenY
  const axis = [
    className.match('l'),
    className.match('r'),
    className.match('t'),
    className.match('b'),
  ]
  const { top, left, width, height } = position.value
  document.onmousemove = (evt) => {
    const { screenX, screenY } = evt
    const x = screenX - ox
    const y = screenY - oy

    if (axis[0] || axis[1]) {
      const newWidth = width + (!axis[1] ? -x : x)
      if (newWidth < 150) {
        store.resizeDialog(id.value, {
          width: 150
        })
        return
      }
      store.resizeDialog(id.value, {
        width: newWidth
      })
      if (axis[0]) store.moveDialog(id.value, { x: left + x })
    }
    if (axis[2] || axis[3]) {
      const newHeight = height + (!axis[3] ? -y : y)
      if (newHeight < 60) {
        store.resizeDialog(id.value, { height: 60 })
        return
      }
      store.resizeDialog(id.value, { height: newHeight })
      if (axis[2]) store.moveDialog(id.value, { y: top + y })
    }
  }
  document.onmouseup = () => {
    isResizing.value = false
    resize()
    document.onmousemove = null
    document.onmouseup = null
  }
}

/**
 * 切换窗口处于默认状态还是最大化状态
 */
function toggleMaximize() {
  if (!property.value.resizable) return
  store.toggleMaximizeDialog(id.value)
  resize()
}

/**
 * 重新渲染内部组件尺寸
 */
function resize() {
  emit('on-resize', dialog.value)
}


/**
 * 获取窗口尺寸
 */
function getDocumentSize() {
  const { offsetWidth, offsetHeight } = document.body
  return { docWidth: offsetWidth, docHeight: offsetHeight }
}
/**
 * 初始化窗口尺寸和位置
 */
function initDialogSize() {
  const id_value = id.value
  const instance = getCurrentInstance()
  const { docWidth, docHeight } = getDocumentSize()
  const centerX = docWidth / 2
  const centerY = docHeight / 2
  if (!instance?.proxy?.$el) return
  const { offsetWidth, offsetHeight } = instance.proxy.$el as HTMLDivElement
  const p = position.value
  p.top = Math.floor(centerY - offsetHeight / 2)
  p.left = Math.floor(centerX - offsetWidth / 2)
  if (position) {
    const { top, left, width, height } = position.value
    // store.toggleMaximizeDialog(id_value)
    if (width) store.resizeDialog(id_value, { width })
    else {
      store.moveDialog(id_value, { x: Math.floor(centerX - offsetWidth / 2) })
    }
    if (height) store.resizeDialog(id_value, { height })
    else {
      store.moveDialog(id_value, { y: Math.floor(centerY - offsetHeight / 2) })
    }
    store.moveDialog(id_value, { x: left, y: top })
  }
}
/**
 * 拖拽窗口处理方法：
 * 当鼠标点击标题时对文档添加鼠标移动事件监听， 并在鼠标抬起后清除
 * @param { MouseEvent } event 鼠标按下事件
 */
function moveHandle(event: MouseEvent) {
  if (position.value.max || !property.value.movable) return
  isMoving.value = true
  const { screenX, screenY } = event
  mouseDownPosition.x = screenX
  mouseDownPosition.y = screenY
  window.addEventListener('mousemove', mouseMove, { passive: false })
  window.onmouseup = (evt) => {
    evt.preventDefault()
    const { screenX, screenY } = evt
    const { x, y } = mouseDownPosition
    const movement = {
      x: screenX - x,
      y: screenY - y,
    }
    const currentPosition = dialog.value.position
    const newPosition = limitedPosition(currentPosition.x + movement.x, currentPosition.y + movement.y)
    store.moveDialog(id.value, newPosition)
    dialogMovement.x = 0
    dialogMovement.y = 0

    window.removeEventListener('mousemove', mouseMove)
    window.onmouseup = null
    isMoving.value = false
  }
}
/**
 * 窗口移动事件处理方法
 * @param { MouseEvent } evt 鼠标移动事件
 */
function mouseMove(evt: MouseEvent) {
  evt.preventDefault()
  const { screenX, screenY } = evt
  const { x, y } = mouseDownPosition

  dialogMovement.x = screenX - x
  dialogMovement.y = screenY - y
}

/**
 * 拖拽窗口处理方法：
 * 当触摸标题时对文档添加触摸移动事件监听， 并在触摸结束后清除
 * @param { TouchEvent } event 触摸事件
 */
function touchStart(event: TouchEvent) {
  if (position.value.max || !property.value.movable || !event.touches) return
  isMoving.value = true
  const { screenX, screenY } = event.touches[0]
  mouseDownPosition.x = screenX
  mouseDownPosition.y = screenY
}

/**
 * 触摸移动事件处理方法
 * @param { TouchEvent } evt 触摸移动事件
 */
function touchMove(evt: TouchEvent) {
  const { screenX, screenY } = evt.touches[0]
  const { x: X, y: Y } = limitedPosition(screenX, screenY)
  const { x, y } = mouseDownPosition

  dialogMovement.x = X - x
  dialogMovement.y = Y - y
  touchingPosition.screenX = screenX
  touchingPosition.screenY = screenY
}
/**
 * 拖拽结束处理方法
 */
function touchEnd() {
  const { screenX, screenY } = touchingPosition || {
    screenX: 0,
    screenY: 0,
  }
  const { x: X, y: Y } = limitedPosition(screenX, screenY)
  const { x, y } = mouseDownPosition
  store.moveDialog(id.value, {
    x: X - x,
    y: Y - y,
  })
  dialogMovement.x = 0
  dialogMovement.y = 0
  isMoving.value = false
}
/**
 * 限制窗口位置完全超出屏幕范围
 * @param { number } x 鼠标横轴位置
 * @param { number } y 鼠标纵轴位置
 * @returns { Position } 限制后的位置
 */
function limitedPosition(x: number, y: number): Position {
  const { width } = position.value
  const { docWidth, docHeight } = getDocumentSize()
  let nX = x + width < 5 ?  5 - width : x
  let nY = y
  const xLimit = 10 - width
  const yLimit = docHeight - 80
  if (nX < xLimit) {
    nX = xLimit
  } else if (nX > docWidth - 50) {
    nX = docWidth - 50
  }
  if (nY < 5) { 
    nY = 5
  } else if (nY  > yLimit) {
    nY = yLimit
  }
  return { x: nX, y: nY }
}
</script>

<template>
  <div
    v-show="!dialog.state.minimized"
    class="ys-dialog"
    :style="dialogStyle"
    :movable="property.movable"
    :resizable="property.resizable"
    :max="position.max"
    tabindex="1"
    @focus="toTop"
    @touchstart.stop.passive="resizeSwitch($event, true)"
    @touchmove.stop.passive="multiTouch"
    @touchend.stop.passive="resizeSwitch($event, false)"
  >
    <div class="tl" @mousedown="manualResize" />
    <div class="tm" @mousedown="manualResize" />
    <div class="tr" @mousedown="manualResize" />
    <div class="lm" @mousedown="manualResize" />
    <div v-show="isResizing" class="main-panel cover" />
    <div v-show="!isResizing" class="main-panel">
      <div class="header">
        <div
          class="title"
          @mousedown.stop="moveHandle"
          @touchstart.stop.passive="touchStart"
          @touchmove.stop.passive="touchMove"
          @touchend.stop.passive="touchEnd"
        >
          <span>{{ dialog.title }}</span>
        </div>
        <div class="btn-group">
          <span class="btn minimize" @click="toggleDialog">
            <Minus theme="outline" size="24" fill="#fff"/>
          </span>
          <span v-if="property.resizable" class="btn maximize" @click="toggleMaximize">
            <component :is="MaxIcon" theme="outline" size="24" fill="#fff"/>
          </span>
          <span class="btn close" @click="closeDialog">
            <CloseSmall theme="outline" size="24" fill="#fff"/>
          </span>
        </div>
      </div>
      <div ref="body" class="dialog-body" :class="{ moving: isMoving }">
        <slot />
      </div>
    </div>
    <div class="rm" @mousedown="manualResize" />
    <div class="bl" @mousedown="manualResize" />
    <div class="bm" @mousedown="manualResize" />
    <div class="br" @mousedown="manualResize" />
  </div>
</template>
<style lang="sass" scoped>
div 
  box-sizing: border-box
.ys-dialog[movable='true']:not([max='true']) 
  box-sizing: border-box
  *
    box-sizing: border-box
  .main-panel > .header
    cursor: move
    .btn-group
      cursor: default


.ys-dialog[resizable='true']:not([max='true'])
  & > .tl
    cursor: se-resize
  & > .tm
    cursor: s-resize
  & > .tr
    cursor: sw-resize
  & > .lm
    cursor: w-resize
  & > .rm
    cursor: e-resize
  & > .bl
    cursor: ne-resize
  & > .bm
    cursor: n-resize
  & > .br
    cursor: nw-resize

.ys-dialog
  position: fixed
  top: 0
  left: 0
  width: 500px
  height: 500px

  display: -ms-grid
  display: grid

  // outline: 1px solid #58f;

  grid-template-rows: 6px calc(100% - 12px) 6px
  grid-template-columns: 6px calc(100% - 12px) 6px

  -ms-user-select: none
  -webkit-user-select: none
  user-select: none

  &:focus 
    outline: none

  .cover
    border: 3px double #fff4
    background: #0009
    pointer-events: none

  .main-panel
    position: relative
    width: calc(100% + 6px)
    height: calc(100% + 6px)
    margin: -3px

    background: #051229bb
    color: #000
    border: 1px solid #45515e
    box-shadow: 1px 1px 3px 2px #000

    overflow: hidden

    & > .dialog-body
      position: relative
      width: 100%
      height: calc(100% - 32px)
      overflow: hidden

    & > .dialog-body.moving
      pointer-events: none

    & > .header
      position: relative
      width: 100%
      height: 32px
      line-height: 32px

      padding: 0 0 0 5px

      display: flex
      justify-content: space-between
      align-items: center

      background: #324c70d3
      color: #efefef

      .title
        display: flex
        flex-grow: 1
        height: 100%
        align-items: center
        overflow: hidden

        margin: -2px 0 0 5px

        line-height: 23px
        font-size: 14px

      .btn-group
        display: flex
        flex-direction: row
        font-size: 16px

        .btn.close:hover
          background: #f66

        .btn
          display: block
          transition: all 0.2s ease-in-out
          .iconfont
            font-size: 12px
          &:hover
            background: #fff3

        .btn
          width: 2em
          height: 1.75em
          line-height: 1.75em
          text-align: center
          cursor: pointer

          &:hover
            filter: brightness(1.2)

          &:active
            filter: brightness(0.5)

        .btn + .btn
          margin-left: 2px
</style>