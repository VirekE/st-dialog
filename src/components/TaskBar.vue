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
            <component :is="dialog.component" :ref="dialog.id" :args="dialog.args" />
          </STDialog>
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