import { v4 as uuidv4 } from 'uuid'
import { ElMessage } from 'element-plus'

/**
 * 创建新的终端
 * @param {Object} hostDetails 主机信息
 * @param {String} hostDetails.name 主机名称
 * @param {String} hostDetails.host 主机地址
 * @param {Number} hostDetails.port 主机端口
 * @param {String} hostDetails.auth 认证方式
 * @param {String} hostDetails.username 用户名
 * @param {String} hostDetails.password 密码
 * @param {String} hostDetails.privateKey 私钥内容
 * @param {String} hostDetails.passphrase 私钥密码
 * @returns
 */
export const createNewTerminal = (terminalStore, router, hostDetails) => {
  const { host, port, username } = hostDetails
  // 判断当前终端是否已经连接
  const terminal = terminalStore.getTerminalByHost(host, port, username)

  if (terminal) {
    const { link, menuId } = terminal
    terminalStore.setActiveMenu(menuId)
    router.push({ path: link })
    return
  }

  const id = uuidv4()
  const menuId = `Terminal_${id}`
  const link = `/terminal/${id}`

  terminalStore.addTerminal({
    menuId,
    link,
    title: hostDetails.name,
    params: {
      ...hostDetails
    }
  })

  router.push({ path: link })
  terminalStore.setActiveMenu(menuId)

  terminalStore.addCachedViews(getTerminalName({ menuId }))
}

// 获取 Terminal 的 组件 name
export const getTerminalName = ({ menuId, route }) => {
  if (!menuId && !route) return
  if (menuId) {
    return menuId
  } else {
    const { name, params } = route || {}
    const { id } = params || {}
    return `${name}${id ? `_${id}` : ''}`
  }
}

/**
 * 防抖
 * 使用 clearTimeout 来重置计时器，确保函数在等待时间内只执行一次
 * @param {*} func 函数
 * @param {*} wait 等待时间
 * @param {*} immediate 是否立即执行, 如果为 true, 则会在等待时间的开始而不是结束时调用
 * @returns
 */
export const debounce = (func, wait, immediate) => {
  let timeout
  return function (...args) {
    const context = this
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

/**
 * 节流
 * lastRan 记录上一次执行函数的时间。
 * lastFunc 通过 setTimeout 确保在规定间隔后执行函数
 * @param {*} func 函数
 * @param {*} limit 时间
 * @returns
 */
export const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function (...args) {
    const context = this
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan)
      )
    }
  }
}

/**
 * 获取指定 DOM 元素的计算样式属性值
 * @param {HTMLElement} element - 要获取样式的 DOM 元素
 * @param {string} property - 要获取的 CSS 属性名称
 * @returns {string} - 指定属性的计算样式值
 */
export const getComputedStyleProperty = (element, property) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error('The provided element is not a valid DOM element.')
  }

  const computedStyle = window.getComputedStyle(element)
  return computedStyle.getPropertyValue(property)
}

// 转换 ipcMain 传递过来的 message
export const parseIpcMainMessage = (err) => {
  try {
    const messageList = (err.message || err || '').split('Error:')
    ElMessage.error(messageList.length ? messageList[messageList.length - 1].trim() : '出错了')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

export default {
  createNewTerminal,
  getTerminalName,
  debounce,
  throttle,
  getComputedStyleProperty,
  parseIpcMainMessage
}
