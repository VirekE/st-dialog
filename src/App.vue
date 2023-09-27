<script setup lang="ts">
import Test from '@/components/Test.vue'
import { onMounted, markRaw, getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const MyComponent = markRaw(Test)
// [test]
function mockDialogs(n: number) {
  instance!.appContext.config.globalProperties.$dialog.addDialog(MyComponent, {
    title: 'test' + n,
    args: {
      msg: 'test' + n
    }
  })
}

function addDialog() {
  instance!.appContext.config.globalProperties.$dialog.addDialog(MyComponent, {
    title: 'test',
    args: {
      msg: 'test' + Math.random()
    }
  })
}

onMounted(() => {
  mockDialogs(5)
})

</script>

<template>
  <StTaskBar>
    <template v-slot:left>
      <span class="left" @click="addDialog">add</span>
    </template>
    <template v-slot:right>
      <span class="right">right</span>
    </template>
  </StTaskBar>
</template>

<style scoped>

</style>
