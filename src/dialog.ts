import { ComputedRef, UnwrapNestedRefs } from 'vue'

export interface DialogStore<T> {
  dialogList: UnwrapNestedRefs<Dialog<T>[]>,
  count: ComputedRef<number>,
  visibleDialogList: ComputedRef<Dialog<T>[]>,
  indexQueue: UnwrapNestedRefs<string[]>,

  isOnTop: (id: string) => boolean,
  toTop: (id: string) => void,
  getDialog(id: string): Dialog<T> | undefined,
  addDialog: (dialog: T, options: DialogOptions) => void,
  removeDialog: (id: string) => boolean,
  toggleMinimizeDialog: (id: string) => boolean,
  toggleMaximizeDialog: (id: string) => boolean,
  moveDialog(id: string, position: { x?: number, y?: number, width?: number, height?: number }): boolean,
  resizeDialog(id: string, size: { width?: number, height?: number }): boolean,
  getZIndex(id: string): number
}

export interface Position {
  x: number // x轴坐标
  y: number // y轴坐标
}

export interface State {
  minimized: boolean // 是否已经最小化
  maximized: boolean // 是否已经最大化
}

export interface Property {
  minimizable: boolean // 是否可最小化
  maximizable: boolean // 是否可最大化
  resizable: boolean // 是否可调整大小
  closable: boolean // 是否可关闭
  movable: boolean // 是否可移动
  alwaysOnTop: boolean // 是否总在最前
  minWidth?: number // 最小宽度
  minHeight?: number // 最小高度
  maxWidth?: number // 最大宽度
  maxHeight?: number // 最大高度
  width: number // 默认宽度
  height: number // 默认高度
}

export interface Dialog<T> {
  id: string // 唯一标识
  name: string // 窗口名称
  title?: string // 窗口标题
  icon: string // 窗口图标
  position: Position // 位置
  component: T // 窗口内组件
  state: State // 窗口状态
  property: Property // 窗口属性
}

export interface DialogOptions {
  id?: string // 唯一标识
  name?: string // 窗口名称
  title?: string // 窗口标题
  icon?: string // 窗口图标
  position?: { // 窗口位置
    x?: number // x轴坐标
    y?: number // y轴坐标
  }
  state?: { // 窗口状态
    minimized?: boolean // 是否已经最小化
    maximized?: boolean // 是否已经最大化
  }
  property?: { // 窗口属性
    minimizable?: boolean // 是否可最小化
    maximizable?: boolean // 是否可最大化
    resizable?: boolean // 是否可调整大小
    closable?: boolean // 是否可关闭
    movable?: boolean // 是否可移动
    alwaysOnTop?: boolean // 是否总在最前
    minWidth?: number // 最小宽度
    minHeight?: number // 最小高度
    maxWidth?: number // 最大宽度
    maxHeight?: number // 最大高度
    width?: number // 默认宽度
    height?: number // 默认高度
  }
}