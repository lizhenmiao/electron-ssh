<template>
  <div
    ref="menuItem"
    class="flex flex-nowrap items-center justify-between text-white py-1 px-3 rounded-md text-base cursor-pointer max-w-[120px] transition-all duration-300 ease-in-out bg-[#343547] hover:!bg-[#3f4152]"
    :class="{
      '!bg-[#3f4152]': props.active,
      '!w-[120px]': props.active
    }"
    @click="handleClick"
  >
    <span class="no-underline text-inherit flex items-center justify-start gap-[5px]">
      <el-icon v-if="props.icon" :size="18"><component :is="props.icon"></component></el-icon>
      <el-text truncated class="!text-inherit font-medium">{{ props.title }}</el-text>
    </span>
    <el-icon
      v-if="props.closeable"
      :size="16"
      class="ml-2 hover:scale-110 transition-all"
      @click.stop="handleCloseTerminal"
    >
      <CloseBold />
    </el-icon>
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
  closeable: {
    type: Boolean,
    default: false
  }
})

const handleCloseTerminal = () => {
  const { prevData } = terminalStore.removeTerminal(props.menuId)
  terminalStore.setExcludedKeys(props.link)

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
  // 判断元素包不包含 !w-[120px] 这个 class
  const isExist = menuItem.value.classList.contains('!w-[120px]')
  if (isExist) {
    // 如果包含的话先进行去除
    menuItem.value.classList.remove('!w-[120px]')
  }
  // 之后获取元素的宽度
  const { width } = menuItem.value.getBoundingClientRect()
  // 设置最大宽度为 120px
  menuItem.value.setAttribute('style', `width: ${width > 120 ? '120px' : width + 'px'}`)
  // 如果包含的话再进行添加
  if (isExist) {
    menuItem.value.classList.add('!w-[120px]')
  }
})
</script>
