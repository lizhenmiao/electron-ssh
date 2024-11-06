import { defineStore } from 'pinia'

export const useTerminalStore = defineStore('terminal', {
  state: () => ({
    terminalList: [
      {
        menuId: 'vaults',
        title: 'Vaults',
        link: '/vaults',
        icon: 'CameraFilled',
        closeable: false
      },
      {
        menuId: 'sftp',
        title: 'SFTP',
        link: '/sftp',
        icon: 'UploadFilled',
        closeable: false
      }
    ],
    activeMenu: 'vaults',
    cachedViews: ['Vaults', 'SFTP']
  }),
  actions: {
    setActiveMenu(menuId) {
      this.activeMenu = menuId
    },
    addTerminal(terminal) {
      this.terminalList.push(terminal)
    },
    removeTerminal(menuId) {
      const index = this.terminalList.findIndex((item) => item.menuId === menuId && item.closeable)

      if (index !== -1) {
        this.terminalList.splice(index, 1)
      }

      const prevIndex = index - 1 < 0 ? (this.terminalList.length ? 0 : -1) : index - 1
      const prevData = prevIndex !== -1 ? this.terminalList[prevIndex] : null

      if (prevData) this.setActiveMenu(prevData.menuId)

      return {
        index,
        prevData
      }
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
        .filter((item) => item.closeable)
        .find(
          (item) =>
            item.params.host === host &&
            item.params.port === port &&
            item.params.username === username
        )
    }
  },
  persist: false
})
