<script setup lang="ts">
import { computed, UnwrapNestedRefs, reactive, getCurrentInstance } from 'vue'
import type { Component } from 'vue'
import { useDialogStore } from '@/stores/index'
import STDialog from '@/components/Dialog.vue'
import type { Dialog } from '@/dialog'

const instance = getCurrentInstance()

const props = defineProps<{
  class?: string
  style?: string
}>()
const store = useDialogStore()
const dialogList = computed(() => store.dialogList)
const zIndexCache: UnwrapNestedRefs<string[]> = reactive([])

function getDialogZIndex(id: string) {
  const index = zIndexCache.indexOf(id)
  if (index === -1) {
    zIndexCache.push(id)
    return zIndexCache.length
  } else {
    return index + 1
  }
}

function clickHandler(dialog: Dialog<Component>) {
  if (store.isOnTop(dialog.id)) {
    store.toggleMinimizeDialog(dialog.id)
  } else {
    store.toTop(dialog.id)
  }
}

function resizeHandle(dialog: Dialog<Component>) {
  type DialogComponent = Component & { onResize?: (dialog: Dialog<Component>) => any }
  const target = instance?.refs[dialog.id] as DialogComponent[] | undefined
  target?.forEach(i => {
    if (i.onResize) i.onResize(dialog)
  })
}

</script>

<template>
<Teleport to="body">
  <div class="task-bar" :class="props.class" :style="props.style">
    <div class="left-part"><slot name="left" /></div>
    <div class="middle-part">
      <div class="dialog-blank"
        v-for="dialog in dialogList"
        :key="dialog.id"
        :title="dialog.title"
        :style="{ zIndex: getDialogZIndex(dialog.id) }"
        :class="{ mini: dialog.state.minimized }"
        @click="clickHandler(dialog)"
        >
        <span>{{ dialog.title }}</span>
        <Teleport to="body">
          <STDialog :dialog="dialog" @on-resize="resizeHandle">
            <component :is="dialog.component" :ref="dialog.id" />
          </STDialog>
        </Teleport>
      </div>
    </div>
    <div class="right-part"><slot name="right" /></div>
  </div>
</Teleport>
</template>

<style lang="sass" scoped>
div
  box-sizing: border-box
.task-bar
  position: fixed
  bottom: 0
  left: 0
  right: 0
  height: 40px
  background-color: #000
  color: #fff
  display: flex
  justify-content: space-between
  align-items: center
  padding: 0 10px
  
  overflow: hidden
  
  z-index: 1000
  .left-part, .right-part
    display: flex
    flex-grow: 0
    align-items: center
    gap: 10px
    .icon
      font-size: 20px
      cursor: pointer
      &:hover
        color: #ccc
  .middle-part
    display: flex
    flex-grow: 1
    flex-direction: row
    justify-content: flex-start
    align-items: center

    border-left: 1px solid #777
    border-right: 1px solid #777

    margin: 0 12px
    padding: 0 5px

    overflow: hidden

    .dialog-blank.mini
      background: #7773

    .dialog-blank+.dialog-blank
      margin-left: 2px
    .dialog-blank
      padding: 5px 10px
      border-radius: 3px
      background: #7776
      
      text-overflow: ellipsis
      overflow: hidden
      word-break: break-all
      white-space: nowrap

      cursor: pointer
      user-select: none

      &:hover
        filter: brightness(1.2)
      &:active
        filter: brightness(0.8)
</style>