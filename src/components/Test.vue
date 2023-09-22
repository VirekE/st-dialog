<script lang="ts" setup>
import { Dialog } from '@/dialog'
import type { Component } from 'vue'

function onResize(dialog: Dialog<Component>) {
  console.log('重新调整窗口大小', dialog)
}

defineExpose({
  onResize
})

</script>

<template>
  <div class="test">1123123123</div>
</template>
<style scoped lang="sass">
.test
  width: 100%
  height: 100%
  background: #000
  color: #FFF
</style>