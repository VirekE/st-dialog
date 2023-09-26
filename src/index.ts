import type { App, Component, Plugin } from 'vue'
import { createPinia } from 'pinia'
import StDialog from '@/components/Dialog.vue'
import StTaskBar from '@/components/TaskBar.vue'
import { useDialogStore } from '@/stores'
import type { DialogOptions, DialogStore, Position, State, Property, Dialog } from '@/dialog'

const pinia = createPinia()
const components: Record<string, Component> = {
  StDialog,
  StTaskBar,
}

const plugin: Plugin<[]> = {
  install(app: App) {
    app.use(pinia)
    const keys = Object.keys(components)
    const dialogStore = useDialogStore()
    app.config.globalProperties.$dialog = dialogStore
    keys.forEach((key: string) => {
      const component = components[key];
      app.component(component.name || key, component)
    })
    methods.addDialog = dialogStore.addDialog
    methods.removeDialog = dialogStore.removeDialog
  }
}

export {
  StDialog,
  StTaskBar,
  DialogOptions,
  DialogStore,
  Position,
  State,
  Property,
  Dialog
}

export const methods = {
  addDialog: (component: Component, options: DialogOptions) => { console.error({ component, options }, 'addDialog not implemented') },
  removeDialog: (id: string) => { console.error(id, 'removeDialog not implemented') },
}

export default plugin