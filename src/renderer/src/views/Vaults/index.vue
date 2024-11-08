<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:25
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-08 16:03:38
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\index.vue
 * @Description: 主机列表
-->
<template>
  <div class="h-full flex flex-col">
    <section
      class="flex-shrink-0 flex items-center justify-between flex-wrap bg-[#E6EBED] px-4 py-2"
    >
      <el-button type="primary" @click="handleAddHost">
        <el-icon :size="18" class="rotate-90"><SwitchFilled /></el-icon>
        <span class="ml-2">添加主机</span>
      </el-button>
      <div class="flex items-center text-[15px] text-black">
        <el-text>主题：</el-text>
        <el-select v-model="theme" placeholder="切换主题" class="w-[100px]" @change="changeTheme">
          <el-option
            v-for="item in themeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </section>
    <el-divider class="m-0" />
    <el-scrollbar class="flex-1 p-4">
      <div
        class="grid grid-cols-1 gap-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xs:gap-2 md:gap-3"
      >
        <HostItem
          v-for="(item, index) in terminalStore.hostList"
          :key="index"
          class="p-2 bg-white rounded-md hover:bg-[#E6EBED] shadow-sm"
          :params="item"
          @dblclick="proxy.$utils.createNewTerminal(terminalStore, router, item)"
        >
        </HostItem>
      </div>
    </el-scrollbar>
    <hostDetails ref="hostDetailsRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'
import hostDetails from '@renderer/views/Vaults/module/hostDetails/index.vue'
import HostItem from '@renderer/components/HostItem/index.vue'
import eventBus from '@renderer/utils/eventBus.js'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const hostDetailsRef = ref(null)

const handleAddHost = () => {
  hostDetailsRef.value.open()
}

const theme = ref('contrast')

const themeList = [
  {
    value: 'dark',
    label: '暗黑'
  },
  {
    value: 'light',
    label: '亮色'
  },
  {
    value: 'neutral',
    label: '中性'
  },
  {
    value: 'contrast',
    label: '对比'
  },
  {
    value: 'blue',
    label: '蓝色'
  }
]

const changeTheme = () => {
  themeList.forEach((item) => {
    document.body.classList.remove(`theme-${item.value}`)
  })
  document.body.classList.add(`theme-${theme.value}`)

  eventBus.emit('themeChanged', theme.value)
}

onMounted(() => {
  changeTheme()

  window.api
    .readLocalFile('C:/Users/Dorsey/Desktop/vps.json')
    .then((res) => {
      terminalStore.setHostAndGroupList(JSON.parse(res || '{}'))
    })
    .catch((err) => {
      ElMessage.error(err.message)
    })
})
</script>
