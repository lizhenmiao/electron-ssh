<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:42:22
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-06 17:56:42
 * @FilePath: \electron-ssh\src\renderer\src\components\MenuItem\index.vue
 * @Description: 每项菜单
-->
<template>
  <div
    ref="menuItem"
    class="flex flex-nowrap items-center justify-between text-white py-1 px-3 rounded-md text-base cursor-pointer transition-all duration-300 ease-in-out hover:!bg-[#3f4152]"
    :class="[
      props.active ? (props.closeable ? '!w-[150px]' : '!w-[120px]') : '',
      props.active ? 'bg-[#3f4152]' : 'bg-[#343547]',
      props.closeable ? 'max-w-[150px]' : 'max-w-[120px]'
    ]"
    @click="handleClick"
  >
    <span
      class="flex-1 overflow-hidden no-underline text-inherit flex items-center justify-start gap-[5px]"
    >
      <el-icon v-if="props.icon" :size="18"><component :is="props.icon"></component></el-icon>
      <el-text v-ellipsis-tooltip truncated class="!text-inherit font-medium">{{
        props.title
      }}</el-text>
    </span>
    <el-icon
      v-if="props.closeable"
      :size="16"
      class="flex-shrink-0 ml-2 hover:scale-110 transition-all"
      @click.stop="handleCloseTerminal"
    >
      <CloseBold />
    </el-icon>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
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
  closeable: {
    type: Boolean,
    default: false
  }
})

const handleCloseTerminal = () => {
  const { prevData } = terminalStore.removeTerminal(props.menuId)

  terminalStore.removeCachedViews(proxy.$utils.getTerminalName({ menuId: props.menuId }))

  if (prevData) {
    router.replace({ path: prevData.link })
  }
}

const handleClick = () => {
  router.push({ path: props.link })

  emit('click', props.menuId)
}

const menuItem = ref(null)

onMounted(() => {
  const maxWidth = props.closeable ? 150 : 120

  // 如果当前菜单是选中的话, 先将【宽度 class】去除, 为了获取实际宽度
  if (props.active) {
    menuItem.value.classList.remove(`!w-[${maxWidth}px]`)
  }

  // 获取元素的宽度
  const { width } = menuItem.value.getBoundingClientRect()

  // 设置宽度为元素的默认宽度, 如果超出最大宽度, 则将它设置为最大宽度
  menuItem.value.setAttribute('style', `width: ${width > maxWidth ? maxWidth : width}px`)

  // 最后如果当前菜单是选中的话, 再次设置【宽度 class】
  if (props.active) {
    menuItem.value.classList.add(`!w-[${maxWidth}px]`)
  }
})
</script>
