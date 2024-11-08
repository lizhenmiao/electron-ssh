<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:42:22
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-07 15:00:48
 * @FilePath: \electron-ssh\src\renderer\src\components\MenuItem\index.vue
 * @Description: 每项菜单
-->
<template>
  <div
    ref="menuItem"
    class="custom-menu-item flex flex-nowrap items-center justify-between gap-2 text-white py-1 px-3 rounded-md text-base transition-all duration-300 ease-in-out"
    :class="{
      'is-active': props.active,
      'is-terminal': props.isTerminal
    }"
    @click="handleClick"
  >
    <template v-if="props.isTerminal">
      <el-icon
        :size="20"
        class="close-icon flex-shrink-0 transition-all rounded-[3px]"
        @click.stop="handleCloseTerminal"
      >
        <CloseBold class="p-[2px]" />
      </el-icon>
      <el-icon v-if="props.isTerminal" :size="20" class="vps-icon flex-shrink-0 transition-all">
        <ElementPlus class="p-[2px]" />
      </el-icon>
    </template>
    <span
      class="flex-1 overflow-hidden no-underline text-inherit flex items-center justify-start gap-[5px]"
    >
      <el-icon v-if="props.icon" :size="18"><component :is="props.icon"></component></el-icon>
      <span v-ellipsis-tooltip="{ maxWidth: 300 }" class="font-medium">{{ props.title }}</span>
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'

const terminalStore = useTerminalStore()
const router = useRouter()

const emit = defineEmits(['click'])
const props = defineProps({
  // 是否激活
  active: {
    type: Boolean,
    default: false,
    required: true
  },
  // 唯一标志
  menuId: {
    type: [Number, String],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  // 是否是终端的菜单
  isTerminal: {
    type: Boolean,
    default: false
  }
})

const handleCloseTerminal = () => {
  const switchData = terminalStore.closeTerminal(props.menuId)

  if (switchData) {
    router.replace({ path: switchData.link })
  }
}

const handleClick = () => {
  router.push({ path: props.link })

  emit('click', props.menuId)
}

const menuItem = ref(null)

onMounted(() => {
  const maxWidth = props.isTerminal ? 200 : 120

  // 如果当前菜单是选中的话, 先将【宽度 class】去除, 为了获取实际宽度
  if (props.active) {
    menuItem.value.classList.remove('is-active')
    if (props.isTerminal) {
      menuItem.value.classList.remove('is-terminal')
    }
  }

  // 获取元素的宽度
  const { width } = menuItem.value.getBoundingClientRect()
  const ceilWidth = Math.ceil(width)

  // 设置宽度为元素的默认宽度, 如果超出最大宽度, 则将它设置为最大宽度
  menuItem.value.setAttribute(
    'style',
    `--ele-default-width: ${ceilWidth > maxWidth ? maxWidth : ceilWidth}px`
  )

  // 最后如果当前菜单是选中的话, 再次设置【宽度 class】
  if (props.active) {
    menuItem.value.classList.add('is-active')
    if (props.isTerminal) {
      menuItem.value.classList.add('is-terminal')
    }
  }
})
</script>
