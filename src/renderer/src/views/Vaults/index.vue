<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:25
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-07 18:24:37
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\index.vue
 * @Description: 主机列表页
-->
<template>
  <div class="h-full flex flex-col">
    <section
      class="flex-shrink-0 flex items-center justify-items-start flex-wrap bg-[#E6EBED] px-4 py-2"
    >
      <el-button type="primary" @click="handleAddHost">
        <el-icon :size="18" class="rotate-90"><SwitchFilled /></el-icon>
        <span class="ml-2">添加主机</span>
      </el-button>
    </section>
    <el-divider class="m-0" />
    <el-scrollbar class="flex-1 p-4">
      <div
        class="grid grid-cols-1 gap-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xs:gap-2 md:gap-3"
      >
        <div
          v-for="(item, index) in terminalStore.hostList"
          :key="index"
          class="bg-white rounded-md p-2 flex items-center gap-2 hover:bg-[#E6EBED] cursor-pointer transition-all duration-300 ease-in-out shadow-sm"
          @dblclick="proxy.$utils.createNewTerminal(terminalStore, router, item)"
        >
          <div
            class="w-[40px] h-[40px] bg-[#EB0000] text-white rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <el-icon :size="25"><ElementPlus /></el-icon>
          </div>
          <div class="flex-1 overflow-hidden">
            <div class="text-[14px] text-[#3F4049] font-medium">{{ item.name }}</div>
            <div class="text-[12px] text-gray-500">
              {{ `${item.protocol},${item.host}:${item.port}` }}
            </div>
          </div>
        </div>
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

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const hostDetailsRef = ref(null)

const handleAddHost = () => {
  hostDetailsRef.value.open()
}

onMounted(() => {
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
