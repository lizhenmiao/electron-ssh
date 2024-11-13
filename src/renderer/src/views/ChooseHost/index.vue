<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-07 16:35:12
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-13 13:18:46
 * @FilePath: \electron-ssh\src\renderer\src\views\ChooseHost\index.vue
 * @Description: 主机选择
-->
<template>
  <el-dialog v-model="visible" width="550" align-center :show-close="false">
    <template #header>
      <el-input
        v-model="search"
        placeholder="搜索主机, 可输入名称、主机名、IP地址或者用户名"
        prefix-icon="Search"
        clearable
        class="custom-el-input__wrapper-bg"
        @input="handleSearch"
      />
    </template>
    <el-scrollbar class="h-[60vh]">
      <h3 class="px-2 mb-2 text-[#7B8C94] text-[14px] font-medium">Hosts</h3>
      <RecycleScroller v-slot="{ item }" :items="showHostsList" :item-size="36" key-field="id">
        <HostItem
          class="py-1 px-2 hover:bg-[#E6EBED] text-[#ABB1B7] hover:text-[#2A2A2A] rounded-md h-[36px]"
          :title="item.name"
          :icon-width="22"
          icon-rounded="0.375rem"
          :show-edit="false"
          :show-delete="false"
          @click="handleSelectHost(item)"
        ></HostItem>
      </RecycleScroller>
    </el-scrollbar>
  </el-dialog>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'
import HostItem from '@renderer/components/HostItem/index.vue'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const visible = ref(false)
const search = ref('')
const showHostsList = ref([])

const open = () => {
  search.value = ''
  showHostsList.value = [...terminalStore.allHosts]
  visible.value = true
}

const close = () => {
  visible.value = false
}

const handleSearch = proxy.$utils.debounce((val) => {
  showHostsList.value = terminalStore.allHosts.filter((item) => {
    const { name, host, username } = item
    return (
      (name || '').toString().includes(val) ||
      (host || '').toString().includes(val) ||
      (username || '').toString().includes(val)
    )
  })
}, 200)

const handleSelectHost = (item) => {
  close()
  nextTick(() => {
    proxy.$utils.createNewTerminal(terminalStore, router, item)
  })
}

defineExpose({ open })
</script>
