const { Sequelize } = require('sequelize')
import { SyncDatabase, Keys, Hosts, replaceUndefinedWithNull } from './sqlite.js'
import { encrypt, decrypt } from '../utils/index.js'

// 解密私钥信息
const decryptKey = (key) => {
  const { privateKey, passphrase } = key || {}
  return {
    ...key,
    privateKey: privateKey ? decrypt(privateKey) : null,
    passphrase: passphrase ? decrypt(passphrase) : null
  }
}

// 获取私钥信息
export const getKeys = () => {
  return new Promise((resolve, reject) => {
    SyncDatabase(() => {
      console.log('开始获取 keys 信息 --------------------')
      Keys.findAll()
        .then((keys) => {
          const keyList = (keys || []).map((item) => decryptKey(item.dataValues))
          const sortKeyList = keyList.sort((a, b) => b.sort - a.sort)
          resolve(sortKeyList)
        })
        .catch((err) => reject(err))
    })
  })
}

// 添加私钥信息
export const addKey = (event, key) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        const { name, description, sort, privateKey, passphrase } = key || {}
        // 判断 key 是否存在
        const existKey = await Keys.findOne({
          where: {
            name
          }
        })
        if (existKey) {
          reject(new Error(`已存在同名私钥`))
        } else {
          const newKey = await Keys.create(
            replaceUndefinedWithNull({
              name,
              description,
              sort,
              privateKey: privateKey ? encrypt(privateKey) : null,
              passphrase: passphrase ? encrypt(passphrase) : null
            })
          )
          resolve(newKey)
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

// 更新私钥信息
export const updateKey = (event, key) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        const { id, name, description, sort, privateKey, passphrase } = key || {}
        // 判断 key 是否存在
        const existKey = await Keys.findOne({
          where: {
            id: { [Sequelize.Op.ne]: id },
            name
          }
        })
        if (existKey) {
          reject(new Error(`已存在同名私钥`))
        } else {
          const updatedKey = await Keys.update(
            replaceUndefinedWithNull({
              name,
              description,
              sort,
              privateKey: privateKey ? encrypt(privateKey) : null,
              passphrase: passphrase ? encrypt(passphrase) : null
            }),
            { where: { id } }
          )
          resolve(updatedKey)
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

// 删除私钥信息
export const deleteKey = async (event, id) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        // 先将 hosts 下的 privateKeyId 设置为 null
        await Hosts.update({ privateKeyId: null }, { where: { privateKeyId: id } })
        // 最后将 key 删除
        const deletedKey = await Keys.destroy({ where: { id } })
        resolve(deletedKey)
      } catch (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  getKeys,
  addKey,
  updateKey,
  deleteKey
}
