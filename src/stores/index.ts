/// reference path="../dialog.d.ts"
import { defineStore } from 'pinia'
import { reactive, UnwrapNestedRefs, computed } from 'vue'
import type { Component } from 'vue'
import type { Dialog, DialogOptions, DialogStore } from '@/dialog'


const dialogStore: (() => DialogStore<Component>) = () => {
  const dialogList: UnwrapNestedRefs<Dialog<Component>[]> = reactive([])
  const count = computed(() => dialogList.length)
  const visibleDialogList = computed(() => dialogList.filter(dialog => dialog.state.minimized === false))
  const indexQueue: UnwrapNestedRefs<string[]> = reactive([])
  const zIndexMap = computed(() => {
    const result: Record<string, number> = {}
    indexQueue.forEach((id, index) => {
      result[id] = index
    })
    return result
  })

  function isOnTop(id: string) {
    return indexQueue[indexQueue.length - 1] === id
  }

  function addDialog(component: Component, options: DialogOptions) {
    const id = crypto.randomUUID()
    const { innerWidth, innerHeight } = window
    const x = (innerWidth - (options.property?.width || 800)) / 2
    const y = (innerHeight - (options.property?.height || 500)) / 2
    const dialog: Dialog<Component> = reactive({
      id: options.id || id,
      name: options.name || id,
      icon: options.icon || '',
      title: options.title || '窗口',
      position: {
        x: (options.position?.x) || x,
        y: (options.position?.y) || y
      },
      component,
      state: {
        minimized: options.state?.minimized || false,
        maximized: options.state?.maximized || false
      },
      property: {
        minimizable: options.property?.minimizable || true,
        maximizable: options.property?.maximizable || true,
        resizable: options.property?.resizable || true,
        closable: options.property?.closable || true,
        movable: options.property?.movable || true,
        alwaysOnTop: options.property?.alwaysOnTop || false,
        minWidth: options.property?.minWidth || 0,
        minHeight: options.property?.minHeight || 0,
        maxWidth: options.property?.maxWidth || 0,
        maxHeight: options.property?.maxHeight || 0,
        width: options.property?.width || 800,
        height: options.property?.height || 500
      },
      args: options.args
    })
    indexQueue.push(dialog.id)
    dialogList.push(dialog)
  }

  function removeDialog(id: string): boolean {
    const index = dialogList.findIndex(dialog => dialog.id === id)
    if (index !== -1) {
      dialogList.splice(index, 1)
      return true
    }
    return false
  }

  function getDialog(id: string): Dialog<Component> | undefined {
    return dialogList.find(dialog => dialog.id === id)
  }
  function toTop(id: string): boolean {
    const index = indexQueue.lastIndexOf(id)
    if (index >= 0) {
      indexQueue.splice(index, 1)
      indexQueue.push(id)
      return true
    }
    return false
  }

  function toggleMinimizeDialog(id: string): boolean {
    const dialog = getDialog(id)
    if (dialog) {
      dialog.state.minimized = !dialog.state.minimized
      return true
    }
    return false
  }

  function toggleMaximizeDialog(id: string): boolean {
    const dialog = getDialog(id)
    if (dialog) {
      dialog.state.maximized = !dialog.state.maximized
      return true
    }
    return false
  }

  function moveDialog(id: string, position: { x?: number, y?: number, width?: number, height?: number }): boolean {
    const dialog = getDialog(id)
    console.log(position)
    if (dialog) {
      if (position.x) {
        dialog.position.x = position.x
      }
      if (position.y) {
        dialog.position.y = position.y
      }
      if (position.width) {
        dialog.property.width = position.width
      }
      if (position.height) {
        dialog.property.height = position.height
      }
      return true
    }
    return false
  }
  function resizeDialog(id: string, size: { width?: number, height?: number }): boolean {
    const dialog = getDialog(id)
    if (dialog) {
      if (size.width) {
        dialog.property.width = size.width
      }
      if (size.height) {
        dialog.property.height = size.height
      }
      return true
    }
    return false
  }
  function getZIndex(id: string) {
    return zIndexMap.value[id] || 0
  }
  return {
    dialogList,
    count,
    visibleDialogList,
    indexQueue,
    addDialog,
    removeDialog,
    getDialog,
    toTop,
    toggleMinimizeDialog,
    toggleMaximizeDialog,
    moveDialog,
    resizeDialog,
    getZIndex,
    isOnTop
  }
}

export const useDialogStore = defineStore('dialog', dialogStore)