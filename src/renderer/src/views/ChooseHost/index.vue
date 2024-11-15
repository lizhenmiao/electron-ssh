<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-07 16:35:12
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-14 11:25:31
 * @FilePath: \electron-ssh\src\renderer\src\views\ChooseHost\index.vue
 * @Description: 主机选择
-->
<template>
  <CustomDialog ref="customDialogRef" width="550" content-class="min-h-[60vh]">
    <template #header>
      <el-input
        v-model="search"
        placeholder="搜索主机, 可输入名称、主机名、IP地址或者用户名"
        prefix-icon="Search"
        clearable
        class="custom-el-input__wrapper-bg"
        :disabled="showHostsList.length === 0"
        @input="handleSearch"
      />
    </template>
    <template #default>
      <template v-if="showHostsList.length > 0">
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
      </template>
      <el-empty v-else description="主机列表为空" />
    </template>
  </CustomDialog>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'
import HostItem from '@renderer/components/HostItem/index.vue'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const customDialogRef = ref(null)
const search = ref('')
const showHostsList = ref([])

const open = () => {
  customDialogRef.value.open(() => {
    search.value = ''
    showHostsList.value = [...terminalStore.allHosts]
  })
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
  customDialogRef.value.close(() => {
    proxy.$utils.createNewTerminal(terminalStore, router, item)
  })
}

defineExpose({ open })
</script>
