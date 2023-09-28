<script setup lang="ts">
import { computed, UnwrapNestedRefs, reactive, getCurrentInstance, ref, Ref, nextTick } from 'vue'
import type { Component } from 'vue'
import { useDialogStore } from '@/stores/index'
import STDialog from '@/components/Dialog.vue'
import type { Dialog } from '@/dialog'

const instance = getCurrentInstance()
const menuVisible = ref(false)
const menu: Ref<HTMLDivElement[] | null> = ref(null)
const menuStyle: UnwrapNestedRefs<Record<string, string>> = reactive({
  top: '-1000px',
  left: '-1000px',
})
const props = defineProps<{
  class?: string
  style?: string
}>()
const store = useDialogStore()
const dialogList = computed(() => store.dialogList)
const zIndexCache: UnwrapNestedRefs<string[]> = reactive([])

function showMenu(event: MouseEvent) {
  menuVisible.value = true
  nextTick(() => {
    const { innerWidth, innerHeight } = window
    const { clientX, clientY } = event
    const { offsetWidth, offsetHeight } = menu.value![0]

    const offsetX = offsetWidth + 5
    const offsetY = offsetHeight + 5

    const x =
      clientX + (offsetWidth || 0) > innerWidth
          ? innerWidth - offsetX
          : clientX
    const y =
      clientY + (offsetHeight || 0) > innerHeight
          ? innerHeight - offsetY
          : clientY
    menuStyle.top = `${y}px`
    menuStyle.left = `${x}px`

    console.log(x, y, screenX, screenY, offsetWidth, offsetHeight)
    const hideMenu = (evt: MouseEvent) => {
      if ((evt.target as HTMLElement).classList.contains('st-menu')) return
      menuVisible.value = false
      document.removeEventListener('click', hideMenu)
    }
    document.addEventListener('click', hideMenu)
  })
}

function closeThis(id: string) {
	store.removeDialog(id)
	menuVisible.value = false
}

function closeOthers(id: string) {
  store.removeOthers(id)
  menuVisible.value = false
}

function closeAll() {
  store.removeAll()
  menuVisible.value = false
}

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
  <div class="st-task-bar" :class="props.class" :style="props.style">
    <div class="left-part"><slot name="left" /></div>
    <div class="middle-part">
      <div class="dialog-blank"
        v-for="dialog in dialogList"
        :key="dialog.id"
        :title="dialog.title"
        :style="{ zIndex: getDialogZIndex(dialog.id) }"
        :class="{ mini: dialog.state.minimized }"
        @click="clickHandler(dialog)"
        @contextmenu.prevent="showMenu"
        >
        <span>{{ dialog.title }}</span>
        <Teleport to="body">
          <STDialog :dialog="dialog" @on-resize="resizeHandle">
            <component :is="dialog.component" :ref="dialog.id" :args="dialog.args" />
          </STDialog>
          <div
            v-if="menuVisible"
            class="st-menu st-menu-context"
            :style="menuStyle"
            ref="menu"
          >
            <span
              class="st-menu menu-item"
              @click="closeThis(dialog.id)"
            >关闭</span>
            <span
              class="st-menu menu-item"
              @click="closeOthers(dialog.id)"
            >关闭其他</span>
            <span
              class="st-menu menu-item"
              @click="closeAll"
            >全部关闭</span>
          </div>
        </Teleport>
      </div>
    </div>
    <div class="right-part"><slot name="right" /></div>
  </div>
</Teleport>
</template>

<style lang="sass">
@import "@/assets/main.sass"
</style>