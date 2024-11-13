import { defineStore } from 'pinia'
import eventBus from '@renderer/utils/eventBus.js'
import { ElMessage } from 'element-plus'
import { parseIpcMainMessage } from '@renderer/utils'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 当前主题
    theme: 'contrast',
    // 主题列表
    themeList: [
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
    ],
    // 同步类型
    syncType: 'no_sync',
    // 同步类型列表
    syncTypeList: [
      {
        value: 'no_sync',
        label: '不同步'
      },
      {
        value: 'webdav',
        label: 'webdav 同步'
      }
    ],
    // webdav url 列表
    webdavList: [
      {
        value: 'https://dav.jianguoyun.com/dav/',
        label: '坚果云(https://dav.jianguoyun.com/dav/)'
      }
    ],
    // WebDAV 配置, url, username, password
    webdavUrl: '',
    webdavUsername: '',
    webdavPassword: '',
    // webdav 是否连接成功
    webdavConnected: false
  }),
  actions: {
    getSettings() {
      return ['theme', 'syncType', 'webdavUrl', 'webdavUsername', 'webdavPassword'].reduce(
        (pre, cur) => {
          pre[cur] = this[cur]
          return pre
        },
        {}
      )
    },
    setSettings(settings) {
      for (const key in settings) {
        this[key] = settings[key]
      }
      console.log('更新设置', settings)

      if (settings.theme) this.changeTheme(settings.theme, false)

      if (settings.syncType) this.connectWebdav()
    },
    updateSettings(settings) {
      return new Promise((resolve, reject) => {
        window.api
          .updateSettings(settings)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    // 更改主题
    changeTheme(theme, showMessage) {
      this.updateSettings({ theme })
        .then(() => {
          for (const item of this.themeList) {
            document.body.classList.remove(`theme-${item.value}`)
          }
          document.body.classList.add(`theme-${theme}`)

          eventBus.emit('themeChanged', theme)

          if (showMessage) ElMessage.success('保存成功')
        })
        .catch((err) => {
          ElMessage.error(err.message)
        })
    },
    // 测试连接 webdav
    async testConnectWebdav({ url, username, password }) {
      try {
        await window.api.createWebdav({ url, username, password })
        await window.api.getWebdavDirectoryContents('/')
      } catch (err) {
        throw new Error(err)
      }
    },
    // 连接 webdav
    async connectWebdav() {
      if (this.syncType === 'webdav') {
        try {
          await this.testConnectWebdav({
            url: this.webdavUrl,
            username: this.webdavUsername,
            password: this.webdavPassword
          })
          this.webdavConnected = true
          ElMessage.success('webdav 连接成功')
        } catch (err) {
          this.webdavConnected = false
          parseIpcMainMessage(err)
        }
      } else {
        this.webdavConnected = false
      }
    }
  },
  persist: false
})
