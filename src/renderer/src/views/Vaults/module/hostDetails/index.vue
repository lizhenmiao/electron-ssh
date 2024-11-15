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
          <el-input v-model="form.description" type="textarea" :rows="5" resize="none" />
        </el-form-item>
        <el-form-item label="排序序号 (Sort 数值越大排序越靠前)" prop="sort">
          <el-input-number v-model="form.sort" :controls="false" class="!w-full" :precision="0" />
        </el-form-item>
        <el-form-item label="上级分组 (Parent Group)" prop="parentGroupId">
          <el-select v-model="form.parentGroupId" filterable clearable placeholder="请选择">
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
          <el-select v-model="form.protocol" clearable>
            <el-option label="SSH" value="ssh" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名 (Username)" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="认证方法 (Authentication)" prop="auth">
          <el-select v-model="form.auth" clearable>
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
          <el-select v-model="form.privateKeyId" filterable clearable placeholder="请选择">
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
        {{ pageType === 'add' ? '创 建' : '保 存' }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
// import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['add-group', 'add-key'])

// const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
// const router = useRouter()

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
  // 排序序号
  sort: 0,
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

const open = (type = 'add', details = {}) => {
  visible.value = true
  nextTick(() => {
    pageType.value = type
    if (type === 'edit') {
      Object.keys(form.value).forEach((key) => (form.value[key] = details[key]))
      originDetails.value = { ...details }
    }
  })
}

const close = (done) => {
  formRef.value.resetFields()
  form.value.privateKeyId = null
  form.value.password = null
  pageType.value = 'add'
  originDetails.value = {}
  visible.value = false
  done && done()
}

const handleConnect = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const details = { ...form.value }

      if (details.auth === 'public-key') {
        details.password = null
      }

      try {
        if (pageType.value === 'add') {
          await window.api.addHost(details)
        } else {
          await window.api.updateHost({
            ...details,
            id: originDetails.value.id
          })
        }

        terminalStore.refreshHostsList()
        /* if (details.auth === 'public-key') {
          const key = terminalStore.allKeys.find((item) => item.id === details.privateKeyId)
          if (key) {
            details.privateKey = key.privateKey
            details.passphrase = key.passphrase
          }
          delete details.password
        }
        proxy.$utils.createNewTerminal(terminalStore, router, details) */

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

defineExpose({
  open
})
</script>
