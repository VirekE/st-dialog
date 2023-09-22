import { createApp } from 'vue'

import './style.css'
import App from './App.vue'

import StDialog from '@/components/index'

const app = createApp(App)
app.use(StDialog)
app.mount('#app')
