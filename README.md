# ST-Dialog

A simple dialog plugin with taskbar of Vue3.

## Install

```bash
npm install st-dialog
```

## Usage

### Full Import

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import StDialog from 'st-dialog'
import 'st-dialog/dist/st-dialog.css'

createApp(App).use(StDialog).mount('#app')
```

### Composition API

When using Vue's composition API, you can directly use the component in the file's `template` section.

```ts
<script lang="ts" setup>
import { getCurrentInstance, markRaw } from 'vue'
import { StTaskBar } from 'st-dialog'
import Test from '@/components/Test.vue'

const TestComponent = markRaw(Test)
const instance = getCurrentInstance()

function addDialog() {
   if (!instance) return
   instance.appContext.config.globalProperties.$dialog.addDialog(TestComponent, {
      title: 'test',
      args: {
         msg: 'hello world'
      }
   })
}

</script>
<template>
   <div class="container">
      <button @click="addDialog">add dialog</button>
   </div>
   <StTaskBar>
      <template v-slot:left>
         <span>leftSide</span>
      </template>
      <template v-slot:right>
         <span>rightSide</span>
      </template>
   </StTaskBar>
</template>
```
### Options API

When using Vue’s options API, the component must first be registered using the `components` property on the Vue instance.

```ts
<script lang="ts">
import { StTaskBar } from 'st-dialog'
export default {
  components: {
    StTaskBar
  },
  methods: {
      addDialog() {
         this.$dialog.addDialog(TestComponent, {
            title: 'test',
            args: {
               msg: 'hello world'
            }
         })
      }
  }
}
</script>
<template>
   <StTaskBar>
      <template v-slot:left>
         <span>leftSide</span>
      </template>
      <template v-slot:right>
         <span>rightSide</span>
      </template>
   </StTaskBar>
</template>
```