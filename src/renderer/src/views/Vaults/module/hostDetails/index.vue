<template>
  <el-drawer
    v-model="visible"
    :title="pageType === 'add' ? '添加主机' : '主机详情'"
    direction="rtl"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="300"
    modal-class="host-details-drawer"
  >
    <el-scrollbar>
      <el-form ref="form" :model="hostForm" :rules="rules" label-position="top">
        <el-form-item label="名称 (Name)" prop="name">
          <el-input v-model="hostForm.name" />
        </el-form-item>
        <el-form-item label="主机 (Hostname)" prop="host">
          <el-input v-model="hostForm.host" />
        </el-form-item>
        <el-form-item label="端口号 (Port)" prop="port">
          <el-input-number
            v-model="hostForm.port"
            :controls="false"
            class="!w-full"
            :precision="0"
          />
        </el-form-item>
        <el-form-item label="协议 (Protocol)" prop="protocol">
          <el-select v-model="hostForm.protocol">
            <el-option label="SSH" value="ssh" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名 (Username)" prop="username">
          <el-input v-model="hostForm.username" />
        </el-form-item>
        <el-form-item label="认证方法 (Authentication)" prop="auth">
          <el-select v-model="hostForm.auth">
            <el-option label="Password" value="password" />
            <el-option label="Public Key" value="public-key" />
            <el-option label="Keyboard Interactive" value="keyboard-interactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码 (Password)" prop="password">
          <el-input v-model="hostForm.password" type="password" />
        </el-form-item>
        <template v-if="hostForm.auth === 'public-key'">
          <el-form-item label="私钥 (Private Key)" prop="privateKeyPath">
            <el-button type="primary" @click="handleFileOpen">选择文件</el-button>
            <span class="ml-5">{{ hostForm.privateKeyPath }}</span>
          </el-form-item>
          <el-form-item label="私钥密码 (Private Key Password)" prop="passphrase">
            <el-input v-model="hostForm.passphrase" type="password" />
          </el-form-item>
        </template>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button class="w-full" type="primary" @click="handleConnect">Connect</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const form = ref(null)
const visible = ref(false)
const pageType = ref('add')

const hostForm = ref({
  // 名称
  name: '',
  // 主机
  host: '',
  // 端口
  port: 22,
  // 协议
  protocol: 'ssh',
  // 用户名
  username: '',
  // 认证方法
  auth: 'password',
  // 密码
  password: '',
  // 私钥路径
  privateKeyPath: '',
  // 私钥密码
  passphrase: ''
})

const rules = ref({
  host: [{ required: true, message: '请输入主机(Hostname)', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号(Port)', trigger: 'blur' }],
  protocol: [{ required: true, message: '请选择协议(Protocol)', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名(Username)', trigger: 'blur' }],
  auth: [{ required: true, message: '请选择认证方法(Authentication)', trigger: 'blur' }],
  privateKeyPath: [{ required: true, message: '请输入私钥(Private Key)', trigger: 'blur' }]
})

const open = (type = 'add', hostData = null) => {
  pageType.value = type
  if (hostData) {
    hostForm.value = hostData
  }
  visible.value = true
}

const close = () => {
  form.value.resetFields()
  pageType.value = 'add'
  visible.value = false
}

const handleConnect = () => {
  form.value.validate((valid) => {
    if (valid) {
      proxy.$utils.createNewTerminal(terminalStore, router, hostForm.value)
      close()
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

const handleFileOpen = async () => {
  const filePath = await window.api.openFile()
  if (!filePath) return
  hostForm.value.privateKeyPath = filePath
}

defineExpose({
  open
})
</script>

<style>
.host-details-drawer .el-drawer__header {
  margin-bottom: 0;
}

.host-details-drawer .el-drawer__body {
  padding: 1rem;
  padding-right: 0;
}

.host-details-drawer .el-drawer__body .el-scrollbar {
  padding-right: 1rem;
}

.host-details-drawer .el-drawer__header .el-drawer__title {
  color: var(--ev-c-black-mute);
  font-weight: bold;
  font-size: 1rem;
}

.host-details-drawer .el-input__inner {
  text-align: left !important;
}
</style>
