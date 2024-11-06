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
    excludedKeys: []
  }),
  actions: {
    addTerminal(terminal) {
      this.terminalList.push(terminal)
    },
    setActiveMenu(menuId) {
      this.activeMenu = menuId
    },
    removeTerminal(terminalId) {
      const index = this.terminalList.findIndex(
        (item) => item.menuId === terminalId && item.closeable
      )

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
    setExcludedKeys(key) {
      if (!this.excludedKeys.includes(key)) {
        this.excludedKeys.push(key)
      }
    }
  },
  persist: false
})
