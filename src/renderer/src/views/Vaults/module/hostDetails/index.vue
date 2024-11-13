<template>
  <el-drawer
    v-model="visible"
    :title="pageType === 'add' ? '新建主机' : '主机详情'"
    direction="rtl"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="350"
    modal-class="custom-details-drawer"
    :before-close="close"
    destroy-on-close
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
          <div class="w-full text-right">
            <el-link type="primary" :underline="false" @click="emit('add-group')">新建分组</el-link>
          </div>
        </el-form-item>
        <el-form-item label="主机 (Hostname)" prop="host">
          <el-input v-model="form.host" />
        </el-form-item>
        <el-form-item label="端口号 (Port)" prop="port">
          <el-input-number v-model="form.port" :controls="false" class="!w-full" :precision="0" />
        </el-form-item>
        <el-form-item label="协议 (Protocol)" prop="protocol">
          <el-select v-model="form.protocol">
            <el-option label="SSH" value="ssh" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名 (Username)" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="认证方法 (Authentication)" prop="auth">
          <el-select v-model="form.auth">
            <el-option label="Password" value="password" />
            <el-option label="Public Key" value="public-key" />
            <el-option label="Keyboard Interactive" value="keyboard-interactive" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.auth !== 'public-key'" label="密码 (Password)" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item
          v-if="form.auth === 'public-key'"
          label="私钥 (Private Key)"
          prop="privateKeyId"
        >
          <el-select v-model="form.privateKeyId" filterable placeholder="请选择">
            <el-option
              v-for="item in terminalStore.allKeys"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <div class="w-full text-right">
            <el-link type="primary" :underline="false" @click="emit('add-key')">新建私钥</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button class="w-full" :loading="loading" type="primary" @click="handleConnect">
        Connect
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['add-group', 'add-key'])

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const router = useRouter()

const formRef = ref(null)
const visible = ref(false)
const pageType = ref('add')
const loading = ref(false)

const form = ref({
  // 名称
  name: null,
  // 备注
  description: null,
  // 上级分组
  parentGroupId: null,
  // 主机
  host: null,
  // 端口
  port: 22,
  // 协议
  protocol: 'ssh',
  // 用户名
  username: null,
  // 认证方法
  auth: 'password',
  // 密码
  password: null,
  // 私钥 id
  privateKeyId: null
})

const rules = ref({
  name: [{ required: true, message: '请输入名称(Name)', trigger: 'blur' }],
  host: [{ required: true, message: '请输入主机(Hostname)', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号(Port)', trigger: 'blur' }],
  protocol: [{ required: true, message: '请选择协议(Protocol)', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名(Username)', trigger: 'blur' }],
  auth: [{ required: true, message: '请选择认证方法(Authentication)', trigger: 'blur' }],
  privateKeyId: [{ required: true, message: '请选择私钥(Private Key)', trigger: 'blur' }]
})

const open = (type = 'add', details = null) => {
  visible.value = true
  nextTick(() => {
    pageType.value = type
    if (details) {
      form.value = { ...details }
    }
  })
}

const close = (done) => {
  formRef.value.resetFields()
  pageType.value = 'add'
  visible.value = false
  done && done()
}

const handleConnect = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      const details = { ...form.value }
      if (pageType.value === 'add') {
        window.api
          .addHost(details)
          .then(() => {
            terminalStore.refreshHostsList()
            if (details.value.auth === 'public-key') {
              const key = terminalStore.allKeys.find(
                (item) => item.id === details.value.privateKeyId
              )
              if (key) {
                details.privateKey = key.privateKey
                details.passphrase = key.passphrase
              }
              delete details.password
            }
            console.log('details===', details)
            proxy.$utils.createNewTerminal(terminalStore, router, details)
            loading.value = false
            close()
          })
          .catch((err) => {
            ElMessage.error(err.message)
            loading.value = false
          })
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
