<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-11 17:58:53
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-13 17:42:47
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\module\groupDetails\index.vue
 * @Description: 分组详情
-->
<template>
  <el-dialog
    v-model="visible"
    :title="pageType === 'add' ? '新建分组' : '修改分组'"
    :width="350"
    align-center
  >
    <el-scrollbar v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="名称 (Name)" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="备注 (Description)" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" resize="none" />
        </el-form-item>
        <el-form-item label="上级分组 (Parent Group)" prop="parentGroupId">
          <el-select v-model="form.parentGroupId" filterable placeholder="请选择">
            <el-option
              v-for="item in terminalStore.allGroups"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <div class="grid grid-cols-2 gap-2">
        <el-button :loading="loading" type="primary" @click="handleSave">
          {{ pageType === 'add' ? '创 建' : '保 存' }}
        </el-button>
        <el-button class="!m-0" :loading="loading" type="danger" @click="close"> 取 消 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, ref, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { useTerminalStore } from '@renderer/stores/terminalStore'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()

const formRef = ref(null)
const visible = ref(false)
const pageType = ref('add')
const loading = ref(false)
// 当编辑时的原始数据
const originDetails = ref({})

const form = ref({
  // 名称
  name: null,
  // 备注
  description: null,
  // 上级分组
  parentGroupId: null
})

const rules = ref({
  name: [{ required: true, message: '请输入名称(Name)', trigger: 'blur' }]
})

const open = (type = 'add', details = {}) => {
  visible.value = true
  nextTick(() => {
    pageType.value = type
    if (type === 'edit') {
      form.value = { ...details }
      originDetails.value = { ...details }
    }
  })
}

const close = () => {
  formRef.value.resetFields()
  pageType.value = 'add'
  originDetails.value = {}
  visible.value = false
}

const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const details = { ...form.value }
      try {
        if (pageType.value === 'add') {
          await window.api.addGroup(details)
        } else {
          await window.api.updateGroup({
            ...details,
            id: originDetails.value.id
          })
        }
        terminalStore.refreshGroupsList()
        ElMessage.success(`${pageType.value === 'add' ? '创建' : '保存'}成功`)
        loading.value = false
        close()
      } catch (err) {
        proxy.$utils.parseIpcMainMessage(err)
        loading.value = false
      }
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

defineExpose({
  open
})
</script>
