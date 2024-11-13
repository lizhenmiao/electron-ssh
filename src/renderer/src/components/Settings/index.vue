<template>
  <el-dialog v-model="visible" width="600" align-center>
    <el-tabs v-model="activeTab" tab-position="left" class="h-[70vh]">
      <el-tab-pane
        v-for="item in tabsList"
        :key="item.name"
        :name="item.name"
        :label="item.label"
        class="pl-2 h-full"
      >
        <el-scrollbar>
          <component :is="item.component" :ref="setItemRef" @refresh-settings="refreshSettings" />
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import basic from './module/basic.vue'
import sync from './module/sync.vue'
import { useSettingsStore } from '@renderer/stores/settingsStore.js'

const settingsStore = useSettingsStore()
const visible = ref(false)
const activeTab = ref('basic')
const refs = ref([])

const setItemRef = (el) => {
  if (el) {
    refs.value.push(el)
  }
}

const tabsList = [
  {
    name: 'basic',
    label: '基本设置',
    component: basic
  },
  {
    name: 'sync',
    label: '同步设置',
    component: sync
  }
]

const open = () => {
  visible.value = true
  nextTick(() => {
    activeTab.value = 'basic'
    setRefsSettings()
  })
}

const setRefsSettings = () => {
  const settings = settingsStore.getSettings()

  refs.value.forEach((item) => {
    if (item && item.setSettings) {
      item.setSettings(settings)
    }
  })
}

const refreshSettings = () => {
  window.api.getSettings().then((settings) => {
    settingsStore.setSettings({ ...settings })

    setRefsSettings()
  })
}

onMounted(() => {
  refreshSettings()
})

defineExpose({ open })
</script>
