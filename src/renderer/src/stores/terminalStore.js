import { defineStore } from 'pinia'
import { getTerminalName } from '@renderer/utils'
import { ElMessage } from 'element-plus'

export const useTerminalStore = defineStore('terminal', {
  state: () => ({
    // 普通菜单
    menuList: [
      {
        menuId: 'vaults',
        title: 'Hosts',
        link: '/vaults',
        icon: 'CameraFilled'
      },
      {
        menuId: 'sftp',
        title: 'SFTP',
        link: '/sftp',
        icon: 'UploadFilled'
      }
    ],
    // 已连接的终端菜单列表
    terminalList: [],
    activeMenu: 'vaults',
    cachedViews: ['Vaults', 'SFTP'],
    // 所有主机
    allHosts: [],
    // 所有分组
    allGroups: [],
    // 所有私钥
    allKeys: [],
    // 当前选中的分组数组
    selectedGroups: []
  }),
  getters: {
    // 当前分组下的主机列表
    hostsList(state) {
      const lastGroup = state.selectedGroups.slice(-1)[0] || null
      return state.allHosts.filter((item) =>
        lastGroup ? item.parentGroupId === lastGroup.id : true
      )
    },
    // 当前分组下的分组列表
    groupsList(state) {
      const lastGroup = state.selectedGroups.slice(-1)[0] || null
      return state.allGroups
        .filter((item) => item.parentGroupId === (lastGroup ? lastGroup.id : null))
        .map((item) => ({
          ...item,
          hostCount: state.allHosts.filter((h) => h.parentGroupId === item.id).length
        }))
    }
  },
  actions: {
    setActiveMenu(menuId) {
      this.activeMenu = menuId
    },
    addTerminal(terminal) {
      this.terminalList.push(terminal)
    },
    /**
     * 根据 menuId 来移除终端菜单
     * @param {String} menuId 终端菜单的 menuId
     * @param {String} type first / last / prev / next
     * 1. first: 返回当前 terminalList 第一个数据
     * 2. last: 返回当前 terminalList 最后一个数据
     * 3. prev: 返回当前 menuId 前一个数据
     * 4. next: 返回当前 menuId 后一个数据
     * @returns
     */
    closeTerminal(menuId, type = 'prev') {
      const index = this.terminalList.findIndex((item) => item.menuId === menuId)

      if (index !== -1) {
        const removeMenuId = this.terminalList[index].menuId
        const removeMenuName = getTerminalName({ menuId: removeMenuId })
        this.removeCachedViews(removeMenuName)

        this.terminalList.splice(index, 1)
      }

      // 由于删除了一个元素，新的列表长度
      const newLength = this.terminalList.length

      // 要切换到的菜单索引
      let switchIndex = null

      switch (type) {
        case 'first':
          switchIndex = newLength > 0 ? 0 : null
          break
        case 'last':
          switchIndex = newLength > 0 ? newLength - 1 : null
          break
        case 'prev':
          switchIndex = index > 0 ? (index - 1 === 1 ? null : index - 1) : null
          break
        case 'next':
          switchIndex = index < newLength ? index : null
          break
        default:
          break
      }

      let switchData = null

      // 要切换到的菜单数据
      if (switchIndex !== null) {
        switchData = this.terminalList[switchIndex]
      } else if (this.menuList.length > 0) {
        switchData = this.menuList[0]
      }

      if (switchData) {
        this.setActiveMenu(switchData.menuId)
      }

      return switchData
    },
    addCachedViews(key) {
      if (!this.cachedViews.includes(key)) {
        this.cachedViews.push(key)
      }
    },
    removeCachedViews(key) {
      this.cachedViews = this.cachedViews.filter((item) => item !== key)
    },
    getTerminalByHost(host, port, username) {
      return this.terminalList.find(
        (item) =>
          item.params.host === host &&
          item.params.port === port &&
          item.params.username === username
      )
    },
    async refreshAllList() {
      try {
        await this.refreshHostsList()
        await this.refreshGroupsList()
        await this.refreshKeysList()
      } catch (err) {
        ElMessage.error(err.message)
      }
    },
    refreshHostsList() {
      this.allHosts = []
      window.api
        .getHosts()
        .then((hosts) => {
          this.allHosts = [...hosts]
        })
        .catch((err) => {
          ElMessage.error(err.message)
        })
    },
    refreshGroupsList() {
      this.allGroups = []
      window.api
        .getGroups()
        .then((groups) => {
          this.allGroups = [...groups]
        })
        .catch((err) => {
          ElMessage.error(err.message)
        })
    },
    refreshKeysList() {
      this.allKeys = []
      window.api
        .getKeys()
        .then((keys) => {
          this.allKeys = [...keys]
        })
        .catch((err) => {
          ElMessage.error(err.message)
        })
    },
    // 设置当前选中的分组
    setActiveGroup(group) {
      this.selectedGroups.push({
        id: group.id,
        name: group.name
      })
    },
    // 移除当前选中的分组
    removeActiveGroup(id) {
      const index = this.selectedGroups.findIndex((item) => item.id === id)
      if (index === this.selectedGroups.length - 1) {
        return
      }
      // 将当前分组后面的分组清除
      if (index !== -1) {
        this.selectedGroups = this.selectedGroups.slice(0, index)
      }
    },
    // 清空当前选中的分组
    clearActiveGroups() {
      this.selectedGroups = []
    }
  },
  persist: false
})
