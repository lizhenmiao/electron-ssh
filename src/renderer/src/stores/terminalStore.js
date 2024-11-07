import { defineStore } from 'pinia'
import { getTerminalName } from '@renderer/utils'

export const useTerminalStore = defineStore('terminal', {
  state: () => ({
    terminalList: [
      {
        menuId: 'vaults',
        title: 'Hosts',
        link: '/vaults',
        icon: 'CameraFilled',
        isTerminal: false
      },
      {
        menuId: 'sftp',
        title: 'SFTP',
        link: '/sftp',
        icon: 'UploadFilled',
        isTerminal: false
      }
    ],
    activeMenu: 'vaults',
    cachedViews: ['Vaults', 'SFTP'],
    // 主机列表
    hostList: [],
    // 分组列表
    groupList: [],
    // 按照 group 分组的主机列表
    groupHostList: {}
  }),
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
      const index = this.terminalList.findIndex((item) => item.menuId === menuId && item.isTerminal)

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
          break
        case 'last':
          switchIndex = newLength > 0 ? newLength - 1 : null
          break
        case 'prev':
          // 当关闭 terminal 菜单时, 如果上一个菜单是 SFTP, 则切换到 Vaults
          switchIndex = index > 0 ? (index - 1 === 1 ? null : index - 1) : null
          break
        case 'next':
          switchIndex = index < newLength ? index : null
          break
        default:
          break
      }

      // 如果没有要切换的菜单, 都默认切换到第一个
      if (switchIndex === null && newLength > 0) {
        switchIndex = 0
      }

      // 要切换到的菜单数据
      const switchData = switchIndex !== null ? this.terminalList[switchIndex] : null

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
      return this.terminalList
        .filter((item) => item.isTerminal)
        .find(
          (item) =>
            item.params.host === host &&
            item.params.port === port &&
            item.params.username === username
        )
    },
    setHostAndGroupList({ hosts, groups }) {
      this.hostList = hosts || []
      this.groupList = groups || []
    }
  },
  persist: false
})
