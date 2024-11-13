import { SyncDatabase, Hosts, Keys } from './sqlite.js'
import { encrypt, decrypt } from '../utils/index.js'

// 过滤 host 的 key
const filterHostKeys = (hostDetails, containsId = false) => {
  const {
    id,
    name,
    description,
    protocol,
    host,
    port,
    auth,
    username,
    password,
    privateKeyId,
    parentGroupId,
    createdAt,
    updatedAt,
    privateKeyName,
    privateKey,
    passphrase
  } = hostDetails || {}
  return {
    name,
    description,
    protocol,
    host,
    port,
    auth,
    username,
    password,
    privateKeyId,
    parentGroupId,
    ...(containsId && {
      id,
      createdAt,
      updatedAt,
      privateKeyName,
      privateKey: privateKey ? decrypt(privateKey) : null,
      passphrase: passphrase ? decrypt(passphrase) : null
    })
  }
}

// 加密 host
const encryptHost = (host) => {
  const filteredHost = filterHostKeys(host, false)
  const { password } = filteredHost

  return {
    ...filteredHost,
    password: password ? encrypt(password) : null
  }
}

// 解密 host
const decryptHost = (host) => {
  const filteredHost = filterHostKeys(host, true)
  const { password } = filteredHost

  return {
    ...filteredHost,
    password: password ? decrypt(password) : null
  }
}

// 获取分组以及主机信息
export const getHosts = () => {
  return new Promise((resolve, reject) => {
    SyncDatabase(() => {
      console.log('开始获取 hosts 信息 --------------------')
      Hosts.findAll({
        include: [
          // 选择需要的密钥字段
          {
            model: Keys,
            as: 'key',
            attributes: [['name', 'privateKeyName'], 'privateKey', 'passphrase']
          }
        ],
        raw: true,
        nest: true
      })
        .then((hosts) => {
          const flatHosts = hosts.map((host) =>
            decryptHost({
              ...host,
              privateKeyName: host.key.privateKeyName,
              privateKey: host.key.privateKey,
              passphrase: host.key.passphrase
            })
          )

          resolve(flatHosts)
        })
        .catch((err) => reject(err))
    })
  })
}

// 添加主机信息
export const addHost = (event, host) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        const newHost = await Hosts.create(encryptHost(host))
        resolve(newHost)
      } catch (err) {
        reject(err)
      }
    })
  })
}

// 更新主机信息
export const updateHost = (event, host) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      const { id } = host

      try {
        const updatedHost = await Hosts.update(encryptHost(host), {
          where: { id }
        })
        resolve(updatedHost)
      } catch (err) {
        reject(err)
      }
    })
  })
}

// 删除主机
export const deleteHost = async (event, id) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        const deletedHost = await Hosts.destroy({ where: { id } })
        resolve(deletedHost)
      } catch (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  getHosts,
  addHost,
  updateHost,
  deleteHost
}
