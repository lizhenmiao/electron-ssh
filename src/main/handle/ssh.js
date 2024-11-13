import { ipcMain } from 'electron'
const { Client } = require('ssh2')
// 用于存储多个终端连接
const connections = {}

export const handleDisconnect = (event, id) => {
  if (connections[id]) {
    if (connections[id].conn) connections[id].conn.end()
    delete connections[id]
    event.reply(`disconnected-${id}`, { id })

    console.log(`Disconnected: ${id}`)
  }
}

export const handleConnectSSH = (event, { id, config }) => {
  const { host, port, username, auth, password, privateKey, passphrase } = config

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
      console.log('SSH Connected: ', id)

      if (connections[id]) {
        connections[id].isConnected = true
        event.reply(`connected-response-${id}`, { id, success: true })
      }

      conn.shell((err, stream) => {
        if (err) {
          handleError(err)
          return
        }
        stream
          .on('close', () => {
            handleDisconnect(event, id)
          })
          .on('data', (data) => {
            event.reply(`terminal-output-${id}`, { id, data: data.toString() })
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
      host,
      port,
      username,
      ...(auth === 'password' && { password }),
      ...(auth === 'public-key' && {
        privateKey,
        ...(passphrase && { passphrase })
      }),
      ...(auth === 'keyboard-interactive' && {
        tryKeyboard: true,
        ...(password && { password })
      }),
      // 等待 SSH 握手完成的时间, 单位为毫秒, 10000ms = 1s
      readyTimeout: 60000
    })

  connections[id] = {
    conn,
    isConnected: false
  }
}

export const handleDisconnectSSH = (event, id) => {
  console.log('Received disconnection request: ', id)
  handleDisconnect(event, id)
}

module.exports = { handleConnectSSH, handleDisconnectSSH }
