import type { App, Component } from 'vue'
import { createPinia } from 'pinia'
import StDialog from './Dialog.vue'
import StTaskBar from './TaskBar.vue'

const pinia = createPinia()
const components: Record<string, Component> = {
  StDialog,
  StTaskBar
}

function install(app: App) {
  app.use(pinia)
  const keys = Object.keys(components)
  keys.forEach((key: string) => {
    const component = components[key];
    app.component(component.name || key, component)
  })
}

export default {
  install,
  ...components
}