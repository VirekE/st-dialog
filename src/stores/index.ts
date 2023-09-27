/// reference path="../dialog.d.ts"
import { defineStore } from 'pinia'
import { reactive, UnwrapNestedRefs, computed } from 'vue'
import type { Component } from 'vue'
import type { Dialog, DialogOptions, DialogStore } from '@/dialog'
import md5 from 'crypto-js/md5'


const dialogStore: (() => DialogStore<Component>) = () => {
  /** 处于活动状态的对话框列表 */
  const dialogList: UnwrapNestedRefs<Record<string, Dialog<Component>>> = reactive({})
  const dialogValues = computed(() => Object.values(dialogList))
  /** 对话框数量 */
  const count = computed(() => dialogValues.value.length)
  /** 可见对话框列表 */
  const visibleDialogList = computed(() => {
    const result = dialogValues.value.filter(dialog => dialog.state.minimized === false)
    console.log(result)
    return result
  })
  /** 对话框zIndex队列, 用于控制窗口层级顺序 */
  const indexQueue: UnwrapNestedRefs<string[]> = reactive([])
  /** 记录每个对话框的层级顺序 */
  const zIndexMap = computed(() => {
    const result: Record<string, number> = {}
    indexQueue.forEach((id, index) => {
      result[id] = index
    })
    return result
  })

  /**
   * 判断是否在最上层
   * @param id 对话框id
   * @returns 是否为最上层
   */
  function isOnTop(id: string) {
    return indexQueue[indexQueue.length - 1] === id
  }

  /**
   * 添加一个对话框
   * @param component 组件
   * @param options 选项
   * @param force 是否强制添加
   */
  function addDialog(component: Component, options: DialogOptions, force: boolean = false) {
    const id = force ? crypto.randomUUID() : md5(JSON.stringify(options)).toString()
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
    if (dialogList[id] !== undefined) {
      toTop(id)
    } else {
      indexQueue.push(dialog.id)
      dialogList[id] = dialog
    }
  }

  /**
   * 移除一个对话框
   * @param id 对话框id
   * @returns 是否移除成功
   */
  function removeDialog(id: string): boolean {
    if (dialogList[id] !== undefined) {
      delete dialogList[id]
      return true
    }
    return false
  }

  /**
   * 获取一个对话框
   * @param id 对话框id
   * @returns 对话框
   */
  function getDialog(id: string): Dialog<Component> | undefined {
    return dialogList[id]
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

  /**
   * 最小化/换源对话框
   * @param id 对话框id
   * @param value 直接设置最小化状态 true最小化 false还原
   * @returns 是否最小化成功
   */
  function toggleMinimizeDialog(id: string, value?: boolean): boolean {
    const dialog = getDialog(id)
    if (dialog) {
      dialog.state.minimized = value === undefined ? !dialog.state.minimized : value
      return true
    }
    return false
  }

  /**
   * 最大化/还原对话框
   * @param id 对话框id
   * @param value 直接设置最大化状态 true最大化 false还原
   * @returns 是否最大化成功
   */
  function toggleMaximizeDialog(id: string, value?: boolean): boolean {
    const dialog = getDialog(id)
    if (dialog) {
      dialog.state.maximized = value === undefined ? !dialog.state.maximized : value
      return true
    }
    return false
  }

  /**
   * 移动对话框
   * @param id 对话框id
   * @param position 位置
   * @returns 是否移动成功
   */
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

  /**
   * 调整对话框大小
   * @param id 对话框id
   * @param size 大小
   * @returns 是否调整成功
   */
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

  /**
   * 获取对话框的zIndex
   * @param id 对话框id
   * @returns zIndex
   */
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