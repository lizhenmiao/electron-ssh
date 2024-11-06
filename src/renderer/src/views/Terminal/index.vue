<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 13:33:33
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-05 18:12:56
 * @FilePath: \electron-ssh\src\renderer\src\views\Terminal\index.vue
 * @Description: Terminal
-->
<template>
  <div class="w-full h-full py-1 pl-2 bg-[#2a2a2a] overflow-hidden">
    <div ref="terminal" class="w-full h-full overflow-hidden"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// https://xtermjs.org/docs/
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useTerminalStore } from '@renderer/stores/terminalStore'

const route = useRoute()
const terminalStore = useTerminalStore()

// Terminal ref
const terminal = ref(null)
const loading = ref(false)
const isConnected = ref(false)
// Terminal 实例
const terminalInstance = ref(null)
// 当前命令
// const currentCommand = ref('')

// 当前 Terminal 的 ID
const terminalId = route.params.id

const searchTerminal = terminalStore.terminalList.find(
  (item) => item.menuId === `terminal-${terminalId}`
)
console.log('searchTerminal===', searchTerminal, terminalStore.terminalList)
const { hostname, port, username, password, auth, privateKeyPath, passphrase } =
  (searchTerminal && searchTerminal.params) || {}

const initializeTerminal = () => {
  terminalInstance.value = new Terminal({
    convertEol: true,
    // 背景色
    theme: {
      background: '#2a2a2a',
      foreground: '#ffffff'
    },
    // 光标闪烁
    cursorBlink: true
  })
  const fitAddon = new FitAddon()
  terminalInstance.value.loadAddon(fitAddon)
  terminalInstance.value.open(terminal.value)
  fitAddon.fit()

  window.electron.ipcRenderer.on(`terminal-output-${terminalId}`, (event, { data }) => {
    terminalInstance.value.write(data)
    terminalInstance.value.focus()
  })

  terminalInstance.value.onData((data) => {
    window.electron.ipcRenderer.send(`terminal-input-${terminalId}`, data)
  })

  if (!isConnected.value) {
    loading.value = true
    terminalInstance.value.write(`Connecting to ${hostname}:${port}...\n`)
    window.electron.ipcRenderer.send('connect-ssh', {
      id: terminalId,
      config: {
        hostname,
        port,
        username,
        password,
        auth,
        privateKeyPath,
        passphrase
      }
    })

    window.electron.ipcRenderer.on(`connected-response-${terminalId}`, handleConnectedResponse)
    window.electron.ipcRenderer.on(`keyboard-interactive-${terminalId}`, handleKeyboardInteractive)
    window.electron.ipcRenderer.on(`disconnected-${terminalId}`, handleDisconnected)
  }
}

const handleConnectedResponse = (event, { success, message }) => {
  loading.value = false
  if (success) {
    ElMessage.success('连接成功')
    isConnected.value = true
    terminalInstance.value.write(`Connection established.\n\n`)
  } else {
    ElMessage.error(message)
    isConnected.value = false
    terminalInstance.value.write(`Connection failed.\n\n`)
  }
}

const handleKeyboardInteractive = (event, { id, name, password, prompts }) => {
  const responses = []
  Promise.all(
    prompts.map((prompt) => {
      return new Promise((resolve) => {
        if (prompt.echo === true) {
          responses.push(password)
          resolve()
        } else {
          ElMessageBox.prompt(prompt.prompt, name, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^.{0,}$/,
            inputErrorMessage: prompt.prompt
          })
            .then(({ value }) => {
              responses.push(value)
              resolve()
            })
            .catch(() => {
              responses.push('')
              resolve()
            })
        }
      })
    })
  ).then(() => {
    // 将用户输入的响应发送回主进程
    window.electron.ipcRenderer.send(`keyboard-interactive-response-${id}`, responses)
  })
}

const handleDisconnect = () => {
  console.log('发送断开连接请求', terminalId)
  loading.value = true
  window.electron.ipcRenderer.send('disconnect-ssh', terminalId)
}

const handleDisconnected = () => {
  ElMessage.success('连接已断开')
  loading.value = false
  isConnected.value = false
}

onMounted(() => {
  if (!terminalId || !hostname || !port || !username) {
    ElMessage.error('参数错误')
    return
  }

  if (!terminalInstance.value) {
    initializeTerminal()
  }
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount', terminalId, isConnected.value)
  if (isConnected.value) {
    handleDisconnect()
  }

  if (terminalInstance.value) {
    terminalInstance.value.dispose()
    terminalInstance.value = null
  }

  window.electron.ipcRenderer.removeListener(
    `connected-response-${terminalId}`,
    handleConnectedResponse
  )
  window.electron.ipcRenderer.removeListener(
    `keyboard-interactive-${terminalId}`,
    handleKeyboardInteractive
  )
  window.electron.ipcRenderer.removeListener(`disconnected-${terminalId}`, handleDisconnected)
})
</script>
