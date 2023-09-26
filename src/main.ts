import { createApp } from 'vue'
import App from './App.vue'

import StDialog from '@/index'

const app = createApp(App)
app.use(StDialog)
app.mount('#app')
