<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:25
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-13 13:02:50
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\index.vue
 * @Description: 主机列表
-->
<template>
  <div class="h-full">
    <el-tabs
      v-model="activeName"
      type="border-card"
      tab-position="left"
      class="h-full custom-tabs-header-no-margin custom-tabs-content-no-padding"
    >
      <el-tab-pane
        v-for="item in tabsList"
        :key="item.name"
        lazy
        :label="item.label"
        :name="item.name"
      >
        <component
          :is="item.component"
          @add-host="hostDetailsRef.open('add')"
          @edit-host="hostDetailsRef.open('edit', $event)"
          @add-group="groupDetailsRef.open('add')"
          @edit-group="groupDetailsRef.open('edit', $event)"
          @add-key="keyDetailsRef.open('add')"
          @edit-key="keyDetailsRef.open('edit', $event)"
        />
      </el-tab-pane>
    </el-tabs>
    <hostDetails
      ref="hostDetailsRef"
      @add-group="groupDetailsRef.open('add')"
      @add-key="keyDetailsRef.open('add')"
    />
    <groupDetails ref="groupDetailsRef" />
    <keyDetails ref="keyDetailsRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import Hosts from './module/hosts/index.vue'
import Keys from './module/keys/index.vue'
import hostDetails from '@renderer/views/Vaults/module/hostDetails/index.vue'
import groupDetails from '@renderer/views/Vaults/module/groupDetails/index.vue'
import keyDetails from '@renderer/views/Vaults/module/keyDetails/index.vue'

const terminalStore = useTerminalStore()
const activeName = ref('hosts')

const hostDetailsRef = ref(null)
const groupDetailsRef = ref(null)
const keyDetailsRef = ref(null)

const tabsList = [
  {
    name: 'hosts',
    label: '主机',
    component: Hosts
  },
  {
    name: 'keys',
    label: '私钥',
    component: Keys
  }
]

onMounted(() => {
  terminalStore.refreshAllList()
})
</script>
