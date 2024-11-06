/*
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-06 18:11:06
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-06 18:25:14
 * @FilePath: \electron-ssh\src\renderer\src\directives\ellipsisTooltip.js
 * @Description: 文本超出显示省略号以及鼠标悬浮显示 tooltip
 */
// 全局 Tooltip 实例
let globalTooltip

function createTooltip() {
  const tooltip = document.createElement('div')
  tooltip.style.position = 'fixed' // 使用 fixed 以相对于视口定位
  tooltip.style.whiteSpace = 'nowrap'
  tooltip.style.backgroundColor = 'black'
  tooltip.style.color = 'white'
  tooltip.style.padding = '5px 10px'
  tooltip.style.borderRadius = '4px'
  tooltip.style.visibility = 'hidden'
  tooltip.style.zIndex = '1000'
  tooltip.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.3)'
  tooltip.style.transition = 'opacity 0.2s ease-in-out'
  tooltip.style.opacity = '0'
  tooltip.style.pointerEvents = 'auto' // 允许鼠标事件

  // 为箭头添加一个子元素
  const arrow = document.createElement('div')
  arrow.style.position = 'absolute'
  arrow.style.width = '0'
  arrow.style.height = '0'
  arrow.style.borderStyle = 'solid'
  tooltip.appendChild(arrow)

  document.body.appendChild(tooltip)
  tooltip.arrow = arrow
  return tooltip
}

const ellipsisTooltip = {
  mounted(el) {
    el.style.whiteSpace = 'nowrap'
    el.style.overflow = 'hidden'
    el.style.textOverflow = 'ellipsis'
    el.style.cursor = 'pointer'

    const showTooltip = () => {
      if (!globalTooltip) {
        globalTooltip = createTooltip()
      }

      globalTooltip.textContent = el.textContent
      globalTooltip.style.visibility = 'visible'
      globalTooltip.style.opacity = '1'

      // 移除文本内容以外的子节点（箭头）
      Array.from(globalTooltip.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
          globalTooltip.removeChild(node)
        }
      })

      // 重新添加箭头
      globalTooltip.appendChild(globalTooltip.arrow)

      const rect = el.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipRect = globalTooltip.getBoundingClientRect()

      // 默认显示在下方
      let top = rect.bottom + 5
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2

      // 检查边缘并调整
      if (top + tooltipRect.height > viewportHeight) {
        // 下方放不下时显示在上方
        top = rect.top - tooltipRect.height - 5
        globalTooltip.arrow.style.borderWidth = '5px 5px 0 5px'
        globalTooltip.arrow.style.borderColor = 'black transparent transparent transparent'
        globalTooltip.arrow.style.top = '100%'
        globalTooltip.arrow.style.left = '50%'
        globalTooltip.arrow.style.transform = 'translateX(-50%)'
      } else {
        // 默认下方
        globalTooltip.arrow.style.borderWidth = '0 5px 5px 5px'
        globalTooltip.arrow.style.borderColor = 'transparent transparent black transparent'
        globalTooltip.arrow.style.top = '-5px'
        globalTooltip.arrow.style.left = '50%'
        globalTooltip.arrow.style.transform = 'translateX(-50%)'
      }

      if (left < 0) {
        // 左边放不下时调整
        left = 5
        globalTooltip.arrow.style.left = `${rect.left + rect.width / 2}px`
      } else if (left + tooltipRect.width > viewportWidth) {
        // 右边放不下时调整
        left = viewportWidth - tooltipRect.width - 5
        globalTooltip.arrow.style.left = `${rect.right - rect.width / 2 - left}px`
      }

      globalTooltip.style.top = `${top}px`
      globalTooltip.style.left = `${left}px`
    }

    const hideTooltip = () => {
      if (globalTooltip) {
        globalTooltip.style.visibility = 'hidden'
        globalTooltip.style.opacity = '0'
      }
    }

    const onMouseEnter = () => {
      if (el.scrollWidth > el.clientWidth) {
        showTooltip()
      }
    }

    const onMouseLeave = () => {
      // 延迟隐藏以允许用户将鼠标移动到 tooltip
      setTimeout(() => {
        if (!globalTooltip.matches(':hover')) {
          hideTooltip()
        }
      }, 100)
    }

    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mouseleave', onMouseLeave)

    // Ensure tooltip also hides when mouse leaves tooltip itself
    globalTooltip?.addEventListener('mouseleave', hideTooltip)
  },
  unmounted() {
    if (globalTooltip) {
      globalTooltip.remove()
      globalTooltip = null
    }
  }
}

export default ellipsisTooltip
