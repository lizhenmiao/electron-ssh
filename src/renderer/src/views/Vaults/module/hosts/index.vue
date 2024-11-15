<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-12 14:42:40
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-14 09:49:17
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\module\hosts\index.vue
 * @Description: 分组以及主机列表
-->
<template>
  <CustomTabContent>
    <template #header>
      <el-dropdown
        split-button
        type="primary"
        trigger="click"
        @click="emit('add-host')"
        @command="handleCommand"
      >
        <el-icon :size="16" class="rotate-90"><SwitchFilled /></el-icon>
        <span class="ml-2">新建主机</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="add-group">
              <el-icon :size="16"><Menu /></el-icon>
              <span class="ml-2">新建分组</span>
            </el-dropdown-item>
            <el-dropdown-item command="add-key">
              <el-icon :size="16"><Key /></el-icon>
              <span class="ml-2">新建私钥</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <template v-if="terminalStore.selectedGroups.length > 0" #headerBottom>
      <div class="text-sm flex items-center flex-wrap">
        <el-link :underline="false" @click="terminalStore.clearActiveGroups()"> 全部主机 </el-link>
        <template v-for="(item, index) in terminalStore.selectedGroups" :key="item.id">
          <el-icon :size="14" color="#a8abb2" class="mx-1"><ArrowRight /></el-icon>
          <el-link
            :underline="false"
            :type="terminalStore.selectedGroups.length - 1 === index ? 'info' : ''"
            :disabled="terminalStore.selectedGroups.length - 1 === index"
            @click="terminalStore.removeActiveGroup(item.id)"
          >
            {{ item.name }}
          </el-link>
        </template>
      </div>
    </template>
    <template #default>
      <ItemSection
        title="分组"
        :items="terminalStore.groupsList"
        icon="Menu"
        icon-bg="#15497A"
        type="group"
        delete-api-method="deleteGroup"
        refresh-store-method="refreshGroupsList"
        :generate-description="(item) => `${item.hostCount} 个主机`"
        @dblclick="terminalStore.setActiveGroup($event)"
        @edit="emit('edit-group', $event)"
      />
      <ItemSection
        :class="terminalStore.groupsList.length > 0 ? 'mt-4' : ''"
        title="主机"
        :items="terminalStore.hostsList"
        icon="ElementPlus"
        :icon-bg="['#EB0000', '#C60055', '#D0571E']"
        type="host"
        delete-api-method="deleteHost"
        refresh-store-method="refreshHostsList"
        :generate-description="(item) => `${item.protocol},${item.host}:${item.port}`"
        @dblclick="proxy.$utils.createNewTerminal(terminalStore, router, $event)"
        @edit="emit('edit-host', $event)"
      />
    </template>
  </CustomTabContent>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'
import CustomTabContent from '@renderer/views/Vaults/components/CustomTabContent/index.vue'
import ItemSection from '@renderer/views/Vaults/components/ItemSection/index.vue'

const emit = defineEmits(['add-host', 'edit-host', 'add-group', 'edit-group', 'add-key'])
const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const handleCommand = (command) => {
  if (command === 'add-group') {
    emit('add-group')
    return
  }
  if (command === 'add-key') {
    emit('add-key')
    return
  }
}
</script>
