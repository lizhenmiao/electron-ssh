<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-11 14:28:24
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-13 14:36:04
 * @FilePath: \electron-ssh\src\renderer\src\components\Settings\module\basic.vue
 * @Description: 设置 -> 基本设置
-->
<template>
  <el-form label-position="top">
    <el-form-item label="主题设置">
      <el-radio-group v-model="form.theme" @change="settingsStore.changeTheme(form.theme, true)">
        <el-radio-button
          v-for="item in settingsStore.themeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@renderer/stores/settingsStore.js'

const settingsStore = useSettingsStore()
const form = ref({
  theme: ''
})

const setSettings = (settings) => {
  for (const key in form.value) {
    form.value[key] = settings[key]
  }

  console.log('更新 basic 页面设置', settings)
}

defineExpose({
  setSettings
})
</script>
