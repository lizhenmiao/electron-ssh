<template>
  <CustomDialog
    ref="customDialogRef"
    :title="pageType === 'add' ? '新建私钥' : '修改私钥'"
    :width="350"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-position="top">
      <el-form-item label="名称 (Name)" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="备注 (Description)" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="5" resize="none" />
      </el-form-item>
      <el-form-item label="排序序号 (Sort 数值越大排序越靠前)" prop="sort">
        <el-input-number v-model="form.sort" :controls="false" class="!w-full" :precision="0" />
      </el-form-item>
      <el-form-item label="私钥 (PrivateKey)" prop="privateKey">
        <el-input
          v-model="form.privateKey"
          type="textarea"
          placeholder="直接在输入框中粘贴私钥内容或者选择文件以读取文件内容, 二选一即可。文件后缀可能为：pem/ppk/key/der/crt/cer/pfx/p12"
          :rows="5"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="选择私钥文件">
        <el-button type="primary" @click="handleFileOpen">选择文件</el-button>
      </el-form-item>
      <el-form-item label="密码 (Passphrase)" prop="passphrase">
        <el-input v-model="form.passphrase" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="grid grid-cols-2 gap-2">
        <el-button :loading="loading" type="primary" @click="handleSave">
          {{ pageType === 'add' ? '创 建' : '保 存' }}
        </el-button>
        <el-button :loading="loading" class="!m-0" type="danger" @click="close"> 取 消 </el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTerminalStore } from '@renderer/stores/terminalStore'

const terminalStore = useTerminalStore()

const customDialogRef = ref(null)
const formRef = ref(null)
const pageType = ref('add')
const loading = ref(false)
// 当编辑时的原始数据
const originDetails = ref({})

const form = ref({
  // 名称
  name: null,
  // 备注
  description: null,
  // 排序序号
  sort: 0,
  // 私钥
  privateKey: null,
  // 密码
  passphrase: null
})

const rules = ref({
  name: [{ required: true, message: '请输入名称(Name)', trigger: 'blur' }],
  privateKey: [{ required: true, message: '请输入私钥(PrivateKey)', trigger: ['blur', 'change'] }]
})

const open = (type = 'add', details = {}) => {
  customDialogRef.value.open(() => {
    pageType.value = type
    if (type === 'edit') {
      Object.keys(form.value).forEach((key) => (form.value[key] = details[key]))
      originDetails.value = { ...details }
    }
  })
}

const close = () => {
  formRef.value.resetFields()
  pageType.value = 'add'
  originDetails.value = {}
  customDialogRef.value.close()
}

const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const details = { ...form.value }
      try {
        if (pageType.value === 'add') {
          await window.api.addKey(details)
        } else {
          await window.api.updateKey({
            ...details,
            id: originDetails.value.id
          })
        }
        terminalStore.refreshKeysList()
        ElMessage.success(`${pageType.value === 'add' ? '创建' : '保存'}成功`)
        loading.value = false
        close()
      } catch (err) {
        ElMessage.error(err.message)
        loading.value = false
      }
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

const handleFileOpen = async () => {
  const filePath = await window.api.openFile()
  if (!filePath) return
  form.value.privateKey = await window.api.readLocalFile(filePath, 'utf8')
}

defineExpose({
  open
})
</script>
