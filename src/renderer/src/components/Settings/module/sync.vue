<template>
  <el-form v-loading="loading" :model="form" label-position="top">
    <el-form-item label="同步方式">
      <el-radio-group v-model="form.syncType">
        <el-radio-button
          v-for="item in settingsStore.syncTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-radio-group>
    </el-form-item>
    <template v-if="form.syncType === 'webdav'">
      <el-form-item label="WebDAV URL">
        <el-select v-model="form.webdavUrl" filterable allow-create placeholder="请选择">
          <el-option
            v-for="item in settingsStore.webdavList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="WebDAV 用户名">
        <el-input v-model="form.webdavUsername" />
      </el-form-item>
      <el-form-item label="WebDAV 密码">
        <el-input v-model="form.webdavPassword" type="password" show-password />
      </el-form-item>
      <div class="w-full text-right">
        <el-link type="primary" :underline="false" @click="handleTest">测试连接</el-link>
      </div>
      <el-divider />
      <el-button @click="handleUpload">上传配置到云端</el-button>
      <el-button @click="handleDownload">下载配置到本地</el-button>
    </template>
    <div class="mt-8 w-full">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="danger" @click="handleReset">取消</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '@renderer/stores/settingsStore.js'
import { useTerminalStore } from '@renderer/stores/terminalStore'

const emit = defineEmits(['refreshSettings'])
const { proxy } = getCurrentInstance()
const settingsStore = useSettingsStore()
const terminalStore = useTerminalStore()

const form = ref({
  syncType: '',
  webdavUrl: '',
  webdavUsername: '',
  webdavPassword: ''
})
const loading = ref(false)

const handleSave = () => {
  loading.value = true
  settingsStore
    .updateSettings({ ...form.value })
    .then(() => {
      settingsStore.setSettings({ ...form.value })
      ElMessage.success('保存成功')
      loading.value = false
    })
    .catch((err) => {
      ElMessage.error(err.message)
      loading.value = false
    })
}

const handleReset = () => {
  for (const key in form.value) {
    form.value[key] = settingsStore.settings[key]
  }
}

const setSettings = (settings) => {
  for (const key in form.value) {
    form.value[key] = settings[key]
  }
  console.log('更新 sync 页面设置', settings)
}

const handleTest = async () => {
  const { webdavUrl, webdavUsername, webdavPassword } = form.value
  loading.value = true
  try {
    await settingsStore.testConnectWebdav({
      url: webdavUrl,
      username: webdavUsername,
      password: webdavPassword
    })
    ElMessage.success('连接成功')
    loading.value = false
  } catch (err) {
    proxy.$utils.parseIpcMainMessage(err)
    loading.value = false
  }
}

const handleUpload = async () => {
  loading.value = true
  try {
    const dbPath = await window.api.dbPath()
    const file = await window.api.readLocalFile(dbPath, null)
    await window.api.uploadConfig('/electron-ssh/db.sqlite', file)
    ElMessage.success('上传成功')
    loading.value = false
  } catch (err) {
    proxy.$utils.parseIpcMainMessage(err)
    loading.value = false
  }
}

const handleDownload = async () => {
  loading.value = true
  try {
    const file = await window.api.downloadConfig('/electron-ssh/db.sqlite')
    await window.api.SyncCloudDatabase(file)

    console.log('同步完成, 开始刷新', new Date().getTime())
    // 刷新设置
    emit('refreshSettings')
    // 刷新 hosts, groups, keys 信息
    terminalStore.refreshAllList()

    ElMessage.success('下载成功')

    loading.value = false
  } catch (err) {
    proxy.$utils.parseIpcMainMessage(err)
    loading.value = false
  }
}

defineExpose({
  setSettings
})
</script>
