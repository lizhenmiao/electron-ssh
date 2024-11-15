const { Sequelize } = require('sequelize')
import { SyncDatabase, Groups, replaceUndefinedWithNull } from './sqlite.js'

// 获取分组信息
export const getGroups = () => {
  return new Promise((resolve, reject) => {
    SyncDatabase(() => {
      console.log('开始获取 groups 信息 --------------------')
      Groups.findAll()
        .then((groups) => {
          const groupList = (groups || []).map((item) => item.dataValues)
          const sortGroupList = groupList.sort((a, b) => b.sort - a.sort)
          resolve(sortGroupList)
        })
        .catch((err) => reject(err))
    })
  })
}

// 添加分组信息
export const addGroup = (event, group) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        const { name, parentGroupId } = group
        // 判断当前 group 是否存在
        const existGroup = await Groups.findOne({
          where: {
            name,
            ...(parentGroupId && { parentGroupId })
          }
        })
        if (existGroup) {
          reject(new Error(`${parentGroupId ? '当前上级分组下' : ''}已存在同名分组`))
        } else {
          const newGroup = await Groups.create(replaceUndefinedWithNull(group))
          resolve(newGroup)
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

// 更新分组信息
export const updateGroup = (event, group) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        const { id, name, parentGroupId } = group
        // 判断 group 是否存在
        const existGroup = await Groups.findOne({
          where: {
            id: { [Sequelize.Op.ne]: id },
            name,
            ...(parentGroupId && { parentGroupId })
          }
        })
        if (existGroup) {
          reject(new Error(`${parentGroupId ? '当前上级分组下' : ''}已存在同名分组`))
        } else {
          const updatedGroup = await Groups.update(replaceUndefinedWithNull(group), {
            where: { id: group.id }
          })
          resolve(updatedGroup)
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

// 删除分组
export const deleteGroup = async (event, id) => {
  return new Promise((resolve, reject) => {
    SyncDatabase(async () => {
      try {
        // 先将分组下的 hosts 的 parentGroupId 设置为 null
        await Groups.update({ parentGroupId: null }, { where: { parentGroupId: id } })
        // 再将 groups 的 parentGroupId 设置为 null
        await Groups.update({ parentGroupId: null }, { where: { parentGroupId: id } })
        // 最后将分组删除
        const deletedGroup = await Groups.destroy({ where: { id } })
        resolve(deletedGroup)
      } catch (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  getGroups,
  addGroup,
  updateGroup,
  deleteGroup
}
