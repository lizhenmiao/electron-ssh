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
      <RecycleScroller v-slot="{ item }" :items="showHostList" :item-size="36" key-field="id">
        <div
          class="py-1 px-2 cursor-pointer hover:bg-[#E6EBED] text-[#ABB1B7] hover:text-[#2A2A2A] rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out h-[36px]"
          @click="handleSelectHost(item)"
        >
          <div
            class="w-[22px] h-[22px] bg-[#EB0000] text-white rounded-md flex items-center justify-center flex-shrink-0"
          >
            <el-icon :size="14"><ElementPlus /></el-icon>
          </div>
          <div class="flex-1 overflow-hidden">
            <div v-ellipsis-tooltip="{ maxWidth: 350 }" class="text-[14px]">{{ item.name }}</div>
          </div>
        </div>
      </RecycleScroller>
    </el-scrollbar>
  </el-dialog>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const visible = ref(false)
const search = ref('')
const showHostList = ref([])

const open = () => {
  search.value = ''
  showHostList.value = [...terminalStore.hostList]
  visible.value = true
}

const close = () => {
  visible.value = false
}

const handleSearch = proxy.$utils.debounce((val) => {
  showHostList.value = terminalStore.hostList.filter((item) => {
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

<style>
.custom-el-input__wrapper-bg .el-input__wrapper.is-focus {
  box-shadow: none !important;
}

.custom-el-input__wrapper-bg .el-input__wrapper {
  background-color: #dfe3e6;
  border-radius: 8px;
}
</style>
