import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const { Client } = require('ssh2')
// 用于存储多个连接
const connections = {}

const handleDisconnect = (event, id) => {
  if (connections[id]) {
    if (connections[id].conn) connections[id].conn.end()
    delete connections[id]
    event.reply(`disconnected-${id}`, { id })

    console.log(`id：${id} 已断开连接`)
  }
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
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

  ipcMain.on('connect-ssh', (event, { id, config }) => {
    const { hostname, port, username, auth, password, privateKeyPath, passphrase } = config

    // 先判断 connections[id] 是否存在
    if (connections[id]) {
      handleDisconnect(event, id)
    }
    const handleError = (err) => {
      event.reply(`connected-response-${id}`, { id, success: false, message: err.message })
      if (connections[id]) connections[id].isConnected = false
    }

    const conn = new Client()

    conn
      .on('ready', () => {
        console.log('SSH Connected', id)

        if (connections[id]) {
          connections[id].isConnected = true
          event.reply(`connected-response-${id}`, { id, success: true })
        }

        conn.shell((err, stream) => {
          if (err) {
            handleError(err)
            return
          }
          stream.on('data', (data) => {
            event.reply(`terminal-output-${id}`, { id, data: data.toString() })
          })
          stream.on('close', () => {
            handleDisconnect(event, id)
          })
          ipcMain.on(`terminal-input-${id}`, (e, input) => {
            stream.write(input)
          })
        })
      })
      .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
        // 筛选出需要用户输入的提示
        const userInputPrompts = prompts.filter((prompt) => prompt.echo === true)

        if (userInputPrompts.length > 0) {
          // 发送请求给渲染进程，要求用户提供输入
          event.reply(`keyboard-interactive-${id}`, { id, name, password, prompts })

          // 监听用户输入的响应
          ipcMain.once(`keyboard-interactive-response-${id}`, (event, responses) => {
            // 调用 finish 继续认证过程
            finish(responses)
          })
        } else {
          // 如果不需要用户输入，用默认密码响应所有提示
          const responses = prompts.map(() => password)
          finish(responses)
        }
      })
      .on('error', (err) => {
        handleError(err)
      })
      .connect({
        host: hostname,
        port: port,
        username,
        ...(auth === 'password' && { password }),
        ...(auth === 'public-key' && {
          privateKey: require('fs').readFileSync(privateKeyPath),
          ...(passphrase && { passphrase })
        }),
        ...(auth === 'keyboard-interactive' && { tryKeyboard: true, ...(password && { password }) })
      })

    connections[id] = {
      conn,
      isConnected: false
    }
  })

  ipcMain.on('disconnect-ssh', (event, id) => {
    console.log('收到断开连接请求', id)
    handleDisconnect(event, id)
  })

  ipcMain.handle('dialog:openFile', handleFileOpen)

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
