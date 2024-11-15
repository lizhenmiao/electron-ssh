<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-14 09:51:40
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-14 14:26:37
 * @FilePath: \electron-ssh\src\renderer\src\components\CustomDialog\index.vue
 * @Description: 二次封装 el-dialog
-->
<template>
  <el-dialog
    v-model="visible"
    :title="props.title"
    :align-center="props.alignCenter"
    :show-close="props.showClose"
    v-bind="$attrs"
    class="custom-dialog-wrapper"
    :class="{
      'no-header': !$slots.header && !props.showClose && !props.title,
      'no-footer': !$slots.footer
    }"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <template v-if="$slots.default">
      <el-scrollbar class="w-full pr-4" max-height="70vh" :view-class="props.contentClass">
        <slot></slot>
      </el-scrollbar>
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  alignCenter: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: String,
    default: ''
  }
})

const visible = ref(false)
const openedActicon = ref(null)
const closedActicon = ref(null)

const open = (action) => {
  visible.value = true
  if (action) {
    openedActicon.value = action
  }
}

const handleOpened = () => {
  nextTick(() => {
    openedActicon.value && openedActicon.value()
    openedActicon.value = null
  })
}

const close = (action) => {
  visible.value = false

  if (action) {
    closedActicon.value = action
  }
}

const handleClosed = () => {
  nextTick(() => {
    closedActicon.value && closedActicon.value()
    closedActicon.value = null
  })
}

defineExpose({ open, close })
</script>
