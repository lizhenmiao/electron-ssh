import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readLocalFile: (path, options) => ipcRenderer.invoke('readLocalFile', path, options),
  getDatabasePath: () => ipcRenderer.invoke('getDatabasePath'),
  SyncCloudDatabase: (sqlBuffer) => ipcRenderer.invoke('syncCloudDatabase', sqlBuffer),
  createWebdav: (config) => ipcRenderer.invoke('createWebdav', config),
  getWebdavDirectoryContents: (dirctory) =>
    ipcRenderer.invoke('getWebdavDirectoryContents', dirctory),
  uploadConfig: (path, fileBuffer) => ipcRenderer.invoke('uploadConfig', path, fileBuffer),
  downloadConfig: (path) => ipcRenderer.invoke('downloadConfig', path),
  getHosts: () => ipcRenderer.invoke('getHosts'),
  addHost: (host) => ipcRenderer.invoke('addHost', host),
  updateHost: (host) => ipcRenderer.invoke('updateHost', host),
  deleteHost: (id) => ipcRenderer.invoke('deleteHost', id),
  getGroups: () => ipcRenderer.invoke('getGroups'),
  addGroup: (group) => ipcRenderer.invoke('addGroup', group),
  updateGroup: (group) => ipcRenderer.invoke('updateGroup', group),
  deleteGroup: (id) => ipcRenderer.invoke('deleteGroup', id),
  getKeys: () => ipcRenderer.invoke('getKeys'),
  addKey: (key) => ipcRenderer.invoke('addKey', key),
  updateKey: (key) => ipcRenderer.invoke('updateKey', key),
  deleteKey: (id) => ipcRenderer.invoke('deleteKey', id),
  getSettings: () => ipcRenderer.invoke('getSettings'),
  updateSettings: (settings) => ipcRenderer.invoke('updateSettings', settings)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
