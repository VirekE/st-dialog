<script setup lang="ts">
import TaskBar from './components/TaskBar.vue'
import Test from '@/components/Test.vue'
import { onMounted, markRaw } from 'vue'

import { useDialogStore } from '@/stores/index'

const store = useDialogStore()
const MyComponent = markRaw(Test)
// [test]
function mockDialogs(n: number) {
  for (let i = 0; i < n; i++) {
    store.addDialog(MyComponent, {
      name: `dialog-${i}`,
      title: `dialog-${i}`
    })
  }
}
onMounted(() => {
  mockDialogs(5)
})


</script>

<template>
  <TaskBar>
    <template v-slot:left>
      <span class="left">left</span>
    </template>
    <template v-slot:right>
      <span class="right">right</span>
    </template>
  </TaskBar>
</template>

<style scoped>

</style>
