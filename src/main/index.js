import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { handleConnectSSH, handleDisconnectSSH } from './handle/ssh'
import { handleFileOpen, handleFileRead } from './handle/file'
import {
  handleCreateWebdav,
  handleGetDirectoryContents,
  handleUploadConfig,
  handleDownloadConfig
} from './handle/webdav'
import { dbPath, SyncCloudDatabase } from './db/sqlite'
import { getHosts, addHost, updateHost, deleteHost } from './db/hosts'
import { getGroups, addGroup, updateGroup, deleteGroup } from './db/groups'
import { getKeys, addKey, updateKey, deleteKey } from './db/keys'
import { getSettings, updateSettings } from './db/settings'

// 控制台中文乱码可以添加以下命令, 将控制台的默认编码更改为 UTF-8
// chcp 65001

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'electron ssh',
    width: 960,
    height: 640,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const ses = mainWindow.webContents.session

  // Open the DevTools.
  // 查看本地 chrome 插件：%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions
  ses.loadExtension(
    'C:/Users/Dorsey/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/7.6.2_0'
  )
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('connect-ssh', handleConnectSSH)
  ipcMain.on('disconnect-ssh', handleDisconnectSSH)

  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('readLocalFile', handleFileRead)

  ipcMain.handle('dbPath', () => {
    return dbPath
  })
  ipcMain.handle('syncCloudDatabase', SyncCloudDatabase)

  ipcMain.handle('createWebdav', handleCreateWebdav)
  ipcMain.handle('getWebdavDirectoryContents', handleGetDirectoryContents)
  ipcMain.handle('uploadConfig', handleUploadConfig)
  ipcMain.handle('downloadConfig', handleDownloadConfig)

  ipcMain.handle('getHosts', getHosts)
  ipcMain.handle('addHost', addHost)
  ipcMain.handle('updateHost', updateHost)
  ipcMain.handle('deleteHost', deleteHost)

  ipcMain.handle('getGroups', getGroups)
  ipcMain.handle('addGroup', addGroup)
  ipcMain.handle('updateGroup', updateGroup)
  ipcMain.handle('deleteGroup', deleteGroup)

  ipcMain.handle('getKeys', getKeys)
  ipcMain.handle('addKey', addKey)
  ipcMain.handle('updateKey', updateKey)
  ipcMain.handle('deleteKey', deleteKey)

  ipcMain.handle('getSettings', getSettings)
  ipcMain.handle('updateSettings', updateSettings)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
