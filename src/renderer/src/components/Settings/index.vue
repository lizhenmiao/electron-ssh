<template>
  <CustomDialog ref="customDialogRef" width="450" title="设置">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-position="top">
      <el-form-item label="主题设置" prop="theme">
        <el-radio-group v-model="form.theme">
          <el-radio-button
            v-for="item in themeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="同步方式" prop="syncType">
        <el-radio-group v-model="form.syncType">
          <el-radio-button
            v-for="item in syncTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-radio-group>
      </el-form-item>
      <template v-if="form.syncType === 'webdav'">
        <el-form-item label="WebDAV URL" prop="webdavUrl">
          <el-select
            v-model="form.webdavUrl"
            filterable
            allow-create
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in webdavUrlList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="WebDAV 用户名" prop="webdavUsername">
          <el-input v-model="form.webdavUsername" />
        </el-form-item>
        <el-form-item label="WebDAV 密码" prop="webdavPassword">
          <el-input v-model="form.webdavPassword" type="password" show-password />
        </el-form-item>
        <div class="w-full text-right">
          <el-link type="primary" :underline="false" @click="handleTest">测试连接</el-link>
        </div>
        <el-form-item v-if="terminalStore.webdavConnected" label="配置同步">
          <el-button size="small" icon="Upload" @click="handleUpload">上传本地配置到云端</el-button>
          <el-button size="small" icon="Download" @click="handleDownload"
            >下载云端配置到本地</el-button
          >
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSave">保 存</el-button>
      <el-button :loading="loading" type="danger" @click="handleClose">取 消</el-button>
    </template>
  </CustomDialog>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import eventBus from '@renderer/utils/eventBus.js'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()
const customDialogRef = ref(null)
const formRef = ref(null)
const loading = ref(false)
// 旧的设置
const oldSettings = ref({})

const form = ref({
  theme: 'contrast',
  syncType: 'no_sync',
  webdavUrl: '',
  webdavUsername: '',
  webdavPassword: ''
})

const rules = {
  theme: [{ required: true, message: '请选择主题', trigger: 'change' }],
  syncType: [{ required: true, message: '请选择同步方式', trigger: 'change' }],
  webdavUrl: [{ required: true, message: '请输入WebDAV URL', trigger: ['blur', 'change'] }],
  webdavUsername: [{ required: true, message: '请输入WebDAV 用户名', trigger: ['blur', 'change'] }],
  webdavPassword: [{ required: true, message: '请输入WebDAV 密码', trigger: ['blur', 'change'] }]
}

const themeList = [
  {
    value: 'dark',
    label: '暗黑'
  },
  {
    value: 'light',
    label: '亮色'
  },
  {
    value: 'neutral',
    label: '中性'
  },
  {
    value: 'contrast',
    label: '对比'
  },
  {
    value: 'blue',
    label: '蓝色'
  }
]

const syncTypeList = [
  {
    value: 'no_sync',
    label: '不同步'
  },
  {
    value: 'webdav',
    label: 'webdav 同步'
  }
]

const webdavUrlList = [
  {
    value: 'https://dav.jianguoyun.com/dav/',
    label: '坚果云'
  }
]

const open = () => {
  customDialogRef.value.open()

  form.value = { ...oldSettings.value }
}

// 连接 webdav 并返回目录文件
const connectAndReturnDirectory = async (webdavSettings) => {
  return new Promise((resolve, reject) => {
    const { webdavUrl, webdavUsername, webdavPassword } = webdavSettings || {}
    window.api
      .createWebdav({
        url: webdavUrl,
        username: webdavUsername,
        password: webdavPassword
      })
      .then(() => {
        window.api
          .getWebdavDirectoryContents('/')
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// 测试连接
const handleTest = () => {
  formRef.value.validateField(['webdavUrl', 'webdavUsername', 'webdavPassword'], async (vaild) => {
    if (vaild) {
      loading.value = true
      try {
        await connectAndReturnDirectory(form.value)
        ElMessage.success('可以连接')
        loading.value = false
      } catch (err) {
        proxy.$utils.parseIpcMainMessage(err)
        loading.value = false
      }
    } else {
      console.log('error submit!')
      return false
    }
  })
}

// 上传本地配置到云端
const handleUpload = () => {
  ElMessageBox.confirm('将会把云端的配置文件直接覆盖, 请确认是否继续上传?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      loading.value = true
      try {
        const dbPath = await window.api.getDatabasePath()
        if (!dbPath) {
          loading.value = false
          return ElMessage.error('获取数据库路径失败')
        }
        const file = await window.api.readLocalFile(dbPath, null)
        if (!file || !file.length) {
          loading.value = false
          return ElMessage.error('获取数据库文件内容失败')
        }
        await window.api.uploadConfig('/electron-ssh/db.sqlite', file)
        ElMessage.success('上传成功')
        loading.value = false
      } catch (err) {
        proxy.$utils.parseIpcMainMessage(err)
        loading.value = false
      }
    })
    .catch(() => {})
}

// 下载云端配置到本地
const handleDownload = () => {
  ElMessageBox.confirm('将会把本地的配置文件直接覆盖, 请确认是否继续下载?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      loading.value = true
      try {
        const file = await window.api.downloadConfig('/electron-ssh/db.sqlite')
        await window.api.SyncCloudDatabase(file)

        ElMessage.success('下载完成, 开始刷新数据')

        // 刷新设置
        handleGetSettings()
        // 刷新 hosts, groups, keys 信息
        terminalStore.refreshAllList()

        loading.value = false
      } catch (err) {
        proxy.$utils.parseIpcMainMessage(err)
        loading.value = false
      }
    })
    .catch(() => {})
}

// 保存配置
const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await window.api.updateSettings({ ...form.value })
        ElMessage.success('保存成功')
        loading.value = false

        handleChangeSettings(form.value, true)

        handleClose()
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

// 取消事件
const handleClose = () => {
  customDialogRef.value.close()
}

// 配置更改事件
const handleChangeSettings = (settings, isSave) => {
  // 判断是否进行更改了主题
  if (haveKeysChanged(['theme'], settings, oldSettings.value)) {
    changeTheme(settings.theme)
  }

  // 判断是否进行更改了同步方式
  const syncFields = ['syncType', 'webdavUrl', 'webdavUsername', 'webdavPassword']
  if (haveKeysChanged(syncFields, settings, oldSettings.value)) {
    connectWebdav(isSave)
  }

  oldSettings.value = { ...settings }
}

// 判断指定的 key 是否发生了变化
const haveKeysChanged = (keys, newObj, oldObj) => {
  return keys.some((key) => newObj[key] !== oldObj[key])
}

// 更改主题
const changeTheme = (theme) => {
  for (const item of themeList) {
    document.body.classList.remove(`theme-${item.value}`)
  }
  document.body.classList.add(`theme-${theme}`)

  eventBus.emit('themeChanged', theme)
}

// 连接 webdav
const connectWebdav = async (isSave) => {
  terminalStore.setWebdavConnected(false)
  if (form.value.syncType === 'webdav') {
    try {
      await connectAndReturnDirectory(form.value)
      ElMessage.success('webdav 连接成功')

      if (isSave) {
        ElMessageBox.confirm(
          '是否需要拉取云端配置数据? 后续也可以在设置中点击按钮进行拉取!',
          '提示',
          {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
          }
        )
          .then(async () => {
            handleDownload()
          })
          .catch(() => {})
      }

      terminalStore.setWebdavConnected(true)
    } catch (err) {
      proxy.$utils.parseIpcMainMessage(err)
    }
  }
}

// 获取设置
const handleGetSettings = () => {
  window.api.getSettings().then((settings) => {
    const newForm = Object.keys(form.value).reduce((prev, key) => {
      prev[key] = settings[key]
      return prev
    }, {})

    form.value = { ...newForm }
    handleChangeSettings(newForm)
  })
}

onMounted(() => {
  handleGetSettings()
})

defineExpose({ open })
</script>
