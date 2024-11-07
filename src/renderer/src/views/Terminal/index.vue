<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 13:33:33
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-07 18:13:51
 * @FilePath: \electron-ssh\src\renderer\src\views\Terminal\index.vue
 * @Description: Terminal
-->
<template>
  <div class="w-full h-full py-1 pl-2 bg-[#15172A] overflow-hidden">
    <div ref="terminalWrapper" class="w-full h-full overflow-hidden"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// https://xtermjs.org/docs/
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { WebglAddon } from '@xterm/addon-webgl'

import { useTerminalStore } from '@renderer/stores/terminalStore'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const terminalStore = useTerminalStore()

// Terminal ref
const terminalWrapper = ref(null)
const loading = ref(false)
const isConnected = ref(false)
// Terminal 实例
const terminalInstance = ref(null)
const fitAddon = ref(null)
const unicode11Addon = ref(null)
const webLinksAddon = ref(null)
const webglAddon = ref(null)

// 当前 Terminal 的 ID, 不包含 Terminal_, 只有一串 UUID
const terminalId = route.params.id

// 监听事件是否已绑定
const eventIsBind = ref(false)

const searchTerminal = terminalStore.terminalList.find(
  (item) => item.menuId === `Terminal_${terminalId}`
)
const { menuId } = searchTerminal || {}
const { host, port, username, password, auth, privateKeyPath, passphrase } =
  (searchTerminal && searchTerminal.params) || {}

const initializeTerminal = () => {
  // https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions/
  // https://xtermjs.org/docs/api/terminal/interfaces/iterminalinitonlyoptions/
  terminalInstance.value = new Terminal({
    // 渲染类型
    rendererType: 'canvas',
    // 启用时, 光标将设置为下一行的开头
    convertEol: true,
    // 背景色, https://xtermjs.org/docs/api/terminal/interfaces/itheme/
    theme: {
      background: '#15172A',
      foreground: '#3FB565'
    },
    // 光标闪烁
    cursorBlink: true,
    // 是否允许使用建议的 api
    allowProposedApi: true,
    // 字体
    fontFamily: 'Fira Code, Consolas, Courier New, monospace',
    // 字体大小
    fontSize: 13,
    // 字符间距
    letterSpacing: 0,
    // 行高
    lineHeight: 1.2,
    // 日志级别
    logLevel: 'debug'
  })

  terminalInstance.value.onResize((event) => {
    console.log('row：', event.rows, 'col：', event.cols)
  })

  // 加载自适应插件
  fitAddon.value = new FitAddon()
  // terminalInstance.value.loadAddon(fitAddon.value)
  fitAddon.value.activate(terminalInstance.value)

  // 加载 Unicode11 插件
  unicode11Addon.value = new Unicode11Addon()
  // terminalInstance.value.loadAddon(unicode11Addon.value)
  unicode11Addon.value.activate(terminalInstance.value)
  // activate the new version
  terminalInstance.value.unicode.activeVersion = '11'

  // 加载 WebLinks 插件
  webLinksAddon.value = new WebLinksAddon()
  // terminalInstance.value.loadAddon(webLinksAddon.value)
  webLinksAddon.value.activate(terminalInstance.value)

  // 加载 Webgl 插件
  webglAddon.value = new WebglAddon()
  webglAddon.value.onContextLoss((e) => {
    console.log('on context loss: ', e)
    webglAddon.value.dispose()
  })
  // terminalInstance.value.loadAddon(webglAddon.value)
  webglAddon.value.activate(terminalInstance.value)

  // 绑定到 DOM
  terminalInstance.value.open(terminalWrapper.value)

  // 默认先进行自适应一次
  handleTerminalFit()

  window.electron.ipcRenderer.on(`terminal-output-${terminalId}`, (event, { data }) => {
    terminalInstance.value.write(data)

    nextTick(() => {
      terminalInstance.value.focus()
    })
  })

  terminalInstance.value.onData((data) => {
    window.electron.ipcRenderer.send(`terminal-input-${terminalId}`, data)
  })

  if (!isConnected.value) {
    loading.value = true
    terminalInstance.value.write(`Connecting to ${host}:${port}...\n`)
    window.electron.ipcRenderer.send('connect-ssh', {
      id: terminalId,
      config: {
        host,
        port,
        username,
        password,
        auth,
        privateKeyPath,
        passphrase
      }
    })

    handleEvent(true)
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

const handleSendDisconnect = () => {
  console.log('发送断开连接请求', terminalId)
  loading.value = true
  window.electron.ipcRenderer.send('disconnect-ssh', terminalId)
}

const handleDisconnected = () => {
  ElMessage.success('连接已断开')
  loading.value = false
  isConnected.value = false

  handleEvent(false)

  handleCloseTerminal()
}

const handleCloseTerminal = () => {
  nextTick(() => {
    // 判断当前页面有没有关闭, 没有的话进行关闭页面
    const removeMenuName = proxy.$utils.getTerminalName({ menuId })
    if (terminalStore.cachedViews.includes(removeMenuName)) {
      console.log('页面未关闭, 关闭页面', removeMenuName)
      const switchData = terminalStore.closeTerminal(menuId)

      if (switchData) {
        router.replace({ path: switchData.link })
      }
    } else {
      console.log('页面已关闭', removeMenuName)
    }
  })
}

// 设置终端自适应
const handleTerminalFit = () => {
  if (fitAddon.value) {
    fitAddon.value.fit()
  }
}

const disposeAddon = (addon, name) => {
  if (addon.value) {
    try {
      addon.value.dispose()
      addon.value = null
      console.log(`${name} 插件已被销毁`)
    } catch (error) {
      console.error(`销毁 ${name} 插件时出错:`, error)
    }
  } else {
    console.log(`${name} 插件未加载`)
  }
}

// 监听事件或者取消监听事件
const handleEvent = (isListen = true) => {
  if (isListen) {
    if (eventIsBind.value) return
    eventIsBind.value = true
    window.addEventListener('resize', proxy.$utils.debounce(handleTerminalFit, 200))

    window.electron.ipcRenderer.on(`connected-response-${terminalId}`, handleConnectedResponse)
    window.electron.ipcRenderer.on(`keyboard-interactive-${terminalId}`, handleKeyboardInteractive)
    window.electron.ipcRenderer.on(`disconnected-${terminalId}`, handleDisconnected)
  } else {
    if (!eventIsBind.value) return
    eventIsBind.value = false

    disposeAddon(fitAddon, 'fitAddon')
    disposeAddon(unicode11Addon, 'unicode11Addon')
    disposeAddon(webLinksAddon, 'webLinksAddon')
    disposeAddon(webglAddon, 'webglAddon')
    disposeAddon(terminalInstance, 'terminalInstance')

    console.log(
      'fitAddon===',
      fitAddon.value,
      'unicode11Addon===',
      unicode11Addon.value,
      'webLinksAddon===',
      webLinksAddon.value,
      'webglAddon===',
      webglAddon.value,
      'terminalInstance===',
      terminalInstance.value
    )

    window.removeEventListener('resize', handleTerminalFit)

    window.electron.ipcRenderer.removeListener(
      `connected-response-${terminalId}`,
      handleConnectedResponse
    )
    window.electron.ipcRenderer.removeListener(
      `keyboard-interactive-${terminalId}`,
      handleKeyboardInteractive
    )
    window.electron.ipcRenderer.removeListener(`disconnected-${terminalId}`, handleDisconnected)
  }
}

onMounted(() => {
  if (!terminalId || !host || !port || !username) {
    ElMessage.error('参数错误')

    handleCloseTerminal()
    return
  }

  if (!terminalInstance.value) {
    initializeTerminal()
  }
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount', terminalId, isConnected.value)

  if (isConnected.value) {
    handleSendDisconnect()
  }

  handleEvent(false)
})
</script>

<style>
.xterm .xterm-viewport {
  overflow-y: auto !important;
}

.xterm .xterm-viewport::-webkit-scrollbar {
  display: none;
}
</style>
