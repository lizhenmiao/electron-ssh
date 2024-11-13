<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-12 14:44:07
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-13 13:03:57
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\module\keys\index.vue
 * @Description: 私钥列表
-->
<template>
  <customTabContent>
    <template #header>
      <el-button type="primary" icon="Key" @click="emit('add-key')">新建私钥</el-button>
    </template>
    <template #default>
      <itemSection
        title="私钥"
        :items="terminalStore.allKeys"
        icon="Key"
        icon-bg="#144472"
        type="key"
        delete-api-method="deleteKey"
        refresh-store-method="refreshKeysList"
        @dblclick="emit('edit-key', $event)"
        @edit="emit('edit-key', $event)"
      />
    </template>
  </customTabContent>
</template>

<script setup>
import { useTerminalStore } from '@renderer/stores/terminalStore'
import customTabContent from '@renderer/views/Vaults/module/customTabContent/index.vue'
import itemSection from '@renderer/views/Vaults/module/itemSection/index.vue'

const terminalStore = useTerminalStore()

const emit = defineEmits(['add-key', 'edit-key'])
</script>
