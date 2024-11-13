import { SyncDatabase, Settings } from './sqlite.js'

export const getSettings = () => {
  return new Promise((resolve, reject) => {
    SyncDatabase(() => {
      console.log('开始获取 settings 信息 --------------------')
      Settings.findAll()
        .then((settings) => {
          const list = (settings || []).map((item) => item.dataValues)
          const result = list.reduce((pre, cur) => {
            pre[cur.key] = cur.value
            return pre
          }, {})
          resolve(result)
        })
        .catch((err) => reject(err))
    })
  })
}

export const updateSettings = (event, settings) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        for (const key in settings) {
          await Settings.update({ value: settings[key] }, { where: { key } })
        }
        const updatedSettings = await Settings.findAll()
        resolve(updatedSettings)
      } catch (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  getSettings,
  updateSettings
}
