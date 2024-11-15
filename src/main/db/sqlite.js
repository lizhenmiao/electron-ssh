const fs = require('fs')
const path = require('path')
const os = require('os')
const { Sequelize } = require('sequelize')

// 获取用户主目录
const userHomeDir = os.homedir()

// 在用户主目录中创建隐藏目录
const hiddenDir = path.join(userHomeDir, '.electron-ssh') // .开头表示隐藏目录

// 检查目录是否存在，如果不存在则创建
if (!fs.existsSync(hiddenDir)) {
  fs.mkdirSync(hiddenDir)
}

// 数据库文件路径
export const dbPath = path.join(hiddenDir, 'electron-ssh.sqlite')

// 创建 Sequelize 实例并连接到 SQLite 数据库
let sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath
})

export let Hosts
export let Groups
export let Keys
export let Settings

const initializeModels = (sequelizeInstance) => {
  // 用于存储主机信息
  Hosts = sequelizeInstance.define(
    'Host',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主机的唯一标识符'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '主机名称'
      },
      description: {
        type: Sequelize.TEXT,
        comment: '主机描述'
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序序号, 数值越大, 排序越靠前, 默认为 0'
      },
      protocol: {
        type: Sequelize.STRING,
        comment: '使用的协议（如SSH, HTTP等）'
      },
      host: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '主机地址'
      },
      port: {
        type: Sequelize.INTEGER,
        comment: '端口号'
      },
      auth: {
        type: Sequelize.STRING,
        comment: '认证方式（如密码或私钥）'
      },
      username: {
        type: Sequelize.STRING,
        comment: '用于连接的用户名'
      },
      password: {
        type: Sequelize.STRING,
        comment: '用户密码'
      },
      privateKeyId: {
        type: Sequelize.INTEGER,
        comment: '关联的私钥表中的私钥ID'
      },
      parentGroupId: {
        type: Sequelize.INTEGER,
        comment: '所属分组的ID'
      }
    },
    {
      comment: '存储主机信息的表'
    }
  )

  // 用于存储分组信息
  Groups = sequelizeInstance.define(
    'Group',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '分组的唯一标识符'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '分组名称'
      },
      description: {
        type: Sequelize.TEXT,
        comment: '分组描述'
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序序号, 数值越大, 排序越靠前, 默认为 0'
      },
      parentGroupId: {
        type: Sequelize.INTEGER,
        comment: '父分组的ID'
      }
    },
    {
      comment: '存储主机分组信息的表'
    }
  )

  // 用于存储私钥信息
  Keys = sequelizeInstance.define(
    'Key',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '私钥的唯一标识符'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '私钥名称'
      },
      description: {
        type: Sequelize.TEXT,
        comment: '私钥描述'
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序序号, 数值越大, 排序越靠前, 默认为 0'
      },
      privateKey: {
        type: Sequelize.TEXT,
        comment: '私钥内容'
      },
      passphrase: {
        type: Sequelize.STRING,
        comment: '用于加密私钥的密码短语'
      }
    },
    {
      comment: '存储私钥信息的表'
    }
  )

  // 定义关联关系
  Hosts.belongsTo(Groups, { foreignKey: 'parentGroupId', targetKey: 'id', as: 'group' })
  Hosts.belongsTo(Keys, { foreignKey: 'privateKeyId', targetKey: 'id', as: 'key' })

  // 定义一个设置表
  Settings = sequelize.define(
    'Setting',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '设置项的唯一标识符'
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: '设置项的键名称'
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '设置项的值'
      }
    },
    {
      comment: '存储应用程序设置的表'
    }
  )
}

initializeModels(sequelize)

/**
 * 模型同步状态
 * -1: 未同步
 * 0: 正在同步
 * 1: 已同步
 */
let synchronize = -1
let callbackList = []

export const SyncDatabase = async (callback) => {
  try {
    if (synchronize === 1) {
      console.log('数据库已同步 √√√√√√√√√√√√√√√√√√√√')
      callback && callback()
    } else {
      if (callback) callbackList.push(callback)
      if (synchronize === -1) {
        console.log('开始数据库同步 --------------------')
        synchronize = 0

        await sequelize.sync()

        console.log('数据库同步完成, 进行初始化设置表 --------------------')
        const defaults = [
          { key: 'theme', value: 'contrast' },
          { key: 'syncType', value: 'no_sync' },
          { key: 'webdavUrl', value: '' },
          { key: 'webdavUsername', value: '' },
          { key: 'webdavPassword', value: '' }
        ]
        for (const setting of defaults) {
          await Settings.findOrCreate({
            where: { key: setting.key },
            defaults: { value: setting.value }
          })
        }
        console.log('默认设置已初始化 √√√√√√√√√√√√√√√√√√√√')

        synchronize = 1
        callbackList.forEach((callback) => callback())
        callbackList = []
      } else if (synchronize === 0) {
        console.log('数据库同步中 ××××××××××××××××××××')
      }
    }
  } catch (error) {
    console.error('同步数据库时出错:', error)
  }
}

// 将云端数据库同步到本地
export const SyncCloudDatabase = (event, sqlBuffer) => {
  return new Promise((resolve, reject) => {
    const executeDatabaseSync = async () => {
      try {
        // 首先关闭数据库连接
        if (sequelize) {
          await sequelize.close()
          sequelize = null
          synchronize = -1
          console.log('数据库连接已关闭')
        }

        // 备份当前数据库文件
        if (fs.existsSync(dbPath)) {
          const timestamp = new Date().getTime()
          const backupPath = `${dbPath}.${timestamp}.bak`
          fs.copyFileSync(dbPath, backupPath)

          console.log('数据库备份成功', backupPath)
        }

        // 将云端数据库文件写入到本地
        fs.writeFileSync(dbPath, sqlBuffer)
        console.log('云端数据库文件已写入本地')

        // 最后重新连接数据库
        sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: dbPath
        })

        // 重新定义模型
        initializeModels(sequelize)

        console.log('重新初始化并同步数据库完成', new Date().getTime())

        resolve()
      } catch (err) {
        reject(err)
      }
    }
    executeDatabaseSync()
  })
}

/**
 * 将对象中的 undefined 替换为 null
 * @param {Object} obj 对象
 * @returns {Object} 替换后的对象
 */
export const replaceUndefinedWithNull = (obj) => {
  const newObj = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = obj[key] === undefined ? null : obj[key]
    }
  }

  return newObj
}

module.exports = {
  Sequelize,
  dbPath,
  Hosts,
  Groups,
  Keys,
  Settings,
  SyncDatabase,
  SyncCloudDatabase,
  replaceUndefinedWithNull
}
